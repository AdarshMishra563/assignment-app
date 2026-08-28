import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { mockServer } from './mockServer';
import { ApiError } from './errors';
import {
  mapErrorToUserMessage,
  mapSessionExpiredError,
  mapTimeoutError,
  assertResponseShape,
  assertArrayShape,
} from './errorMapper';
import { logger } from '../shared/logging/logger';
import { env } from '../config/env';
import { showToast } from '../design-system/components/Toast';
import { sessionExpired } from '../shared/security/authSlice';

class ApiClient {
  private axiosInstance: AxiosInstance;
  public readonly useMockServer = env.USE_MOCK_SERVER;
  private sessionExpiryHandled = false;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: env.API_BASE_URL,
      timeout: env.API_TIMEOUT_MS,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(mapErrorToUserMessage(error))
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        logger.error(`API Error: ${error.config?.url}`, { message: error.message });
        return Promise.reject(mapErrorToUserMessage(error));
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<{ data: T }> {
    await this.guardSession();
    if (this.useMockServer) {
      const data = await this.handleMockRoute<T>('GET', url, config?.params);
      return { data };
    }
    const response = await this.axiosInstance.get<T>(url, config);
    return response;
  }

  async post<T>(url: string, body?: any, config?: AxiosRequestConfig): Promise<{ data: T }> {
    await this.guardSession();
    if (this.useMockServer) {
      const data = await this.handleMockRoute<T>('POST', url, body);
      return { data };
    }
    const response = await this.axiosInstance.post<T>(url, body, config);
    return response;
  }

  /**
   * Reliability requirement #5 — session expiration.
   *
   * This app has no real login screen to bounce the user to (the original
   * AuthScreen was removed from an earlier chat-app version this project
   * was bootstrapped from), so building a new re-auth UI is intentionally
   * out of scope here. This only covers *detecting* an expired mock
   * session, clearing Redux auth state, and telling the user via a toast
   * — a full sign-in flow would be a separate feature.
   *
   * The Redux store is loaded via a dynamic `import()` instead of a
   * static top-level one: store/index.ts pulls in the feature slices,
   * one of which imports this very client module, so a static
   * `import { store } from '../store'` here would create a circular
   * import (and, worse, would drag the entire store graph — redux-persist,
   * AsyncStorage, every slice — into any test file that merely imports a
   * slice that uses apiClient). Because this only runs when a real
   * request is made, well after app bootstrap has finished loading the
   * store module, the dynamic import resolves immediately in practice and
   * never executes at all inside the Jest suite (which calls into
   * mockServer directly rather than through apiClient).
   */
  private async guardSession(): Promise<void> {
    if (this.sessionExpiryHandled) {
      return;
    }
    let expired = false;
    try {
      const { store } = await import('../store');
      const auth = store.getState().auth;
      if (auth.isAuthenticated && auth.tokenExpiresAt && Date.now() >= auth.tokenExpiresAt) {
        expired = true;
        this.sessionExpiryHandled = true;
        store.dispatch(sessionExpired());
        showToast.error('Your session has expired. Please sign in again.');
      }
    } catch (err: any) {
      // Store isn't ready yet (e.g. a request fired before app bootstrap
      // finished) — don't block the request over it, just skip the check.
      logger.debug('Session guard skipped', { reason: err?.message });
      return;
    }
    if (expired) {
      throw mapSessionExpiredError();
    }
  }

  /**
   * Races a mock-server call against `env.API_TIMEOUT_MS`, mirroring the
   * real axios `timeout` config above. The mock path bypasses axios
   * entirely, so without this an "API timeout" failure mode could never
   * actually be reached — mockServer.ts occasionally makes a call hang
   * far longer than this budget (dev-only, see simulateNetworkConditions)
   * specifically so this race can fire for real.
   */
  private async withTimeout<T>(promise: Promise<T>): Promise<T> {
    let timer: ReturnType<typeof setTimeout>;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(mapTimeoutError()), env.API_TIMEOUT_MS);
    });
    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      clearTimeout(timer!);
    }
  }

  private async handleMockRoute<T>(method: string, url: string, payload?: any): Promise<T> {
    try {
      // DOCTORS
      if (url === '/doctors' && method === 'GET') {
        const data = await this.withTimeout(mockServer.getDoctors(payload || {}));
        return assertResponseShape(data, ['items', 'total', 'hasMore'], 'GET /doctors') as unknown as T;
      }
      if (url.startsWith('/doctors/') && url.endsWith('/slots') && method === 'GET') {
        const docId = url.replace('/doctors/', '').replace('/slots', '');
        const data = await this.withTimeout(mockServer.getSlotsForDoctor(docId));
        return assertArrayShape(data, `GET ${url}`, 'status') as unknown as T;
      }
      if (url.startsWith('/doctors/') && method === 'GET') {
        const docId = url.replace('/doctors/', '');
        const data = await this.withTimeout(mockServer.getDoctorById(docId));
        return assertResponseShape(data, ['id', 'name', 'specialty'], `GET ${url}`) as unknown as T;
      }
      if (url === '/consultations/book' && method === 'POST') {
        const data = await this.withTimeout(mockServer.bookSlot(payload));
        return assertResponseShape(data, ['booking', 'slot'], 'POST /consultations/book') as unknown as T;
      }
      if (url === '/consultations/my-bookings' && method === 'GET') {
        const data = await this.withTimeout(mockServer.getMyBookings());
        return assertArrayShape(data, 'GET /consultations/my-bookings', 'status') as unknown as T;
      }
      if (url.startsWith('/consultations/bookings/') && url.endsWith('/cancel') && method === 'POST') {
        const bookingId = url.replace('/consultations/bookings/', '').replace('/cancel', '');
        const data = await this.withTimeout(mockServer.cancelBooking(bookingId));
        return assertResponseShape(data, ['booking'], `POST ${url}`) as unknown as T;
      }

      // SHOP
      if (url === '/products' && method === 'GET') {
        const data = await this.withTimeout(mockServer.getProducts(payload || {}));
        return assertResponseShape(data, ['items', 'total', 'hasMore'], 'GET /products') as unknown as T;
      }
      if (url.startsWith('/products/') && method === 'GET') {
        const prodId = url.replace('/products/', '');
        const data = await this.withTimeout(mockServer.getProductById(prodId));
        return assertResponseShape(data, ['id', 'name', 'price'], `GET ${url}`) as unknown as T;
      }

      // HEALTH RECORDS
      if (url === '/health-records' && method === 'GET') {
        const data = await this.withTimeout(mockServer.getHealthRecords(payload || {}));
        return assertResponseShape(data, ['items', 'total', 'hasMore'], 'GET /health-records') as unknown as T;
      }
      if (url.startsWith('/health-records/') && method === 'GET') {
        const recId = url.replace('/health-records/', '');
        const data = await this.withTimeout(mockServer.getHealthRecordById(recId));
        return assertResponseShape(data, ['id', 'title', 'type'], `GET ${url}`) as unknown as T;
      }

      throw new ApiError(`Unhandled mock endpoint: ${method} ${url}`, 404);
    } catch (err: any) {
      throw mapErrorToUserMessage(err);
    }
  }
}

export const apiClient = new ApiClient();
