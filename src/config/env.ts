/**
 * Centralized environment configuration — the single source of truth for
 * API endpoints, the mock-server toggle, and the dev-only "chaos" knobs
 * used to make the reliability requirements (slow network, timeouts,
 * random failures, malformed responses, session expiry) genuinely
 * reachable in an app that has no real backend yet.
 *
 * Nothing here should be hardcoded again in client.ts / mockServer.ts —
 * import `env` instead.
 */

// Jest's `@react-native/jest-preset` forces the `__DEV__` global to `true`
// for every test run, and Jest itself sets `process.env.NODE_ENV` to
// `'test'` when it isn't already set. We use that to keep the chaos
// simulation out of the test runner so `npx jest` stays deterministic,
// while still treating it as "dev" everywhere else (Metro dev server).
const isTestEnv = (globalThis as any)?.process?.env?.NODE_ENV === 'test';

export interface EnvConfig {
  /** Base URL for the real axios client (used once `USE_MOCK_SERVER` is false). */
  API_BASE_URL: string;
  /** Single source of truth for whether ApiClient serves requests from the in-memory mock server instead of axios. */
  USE_MOCK_SERVER: boolean;
  /** Request timeout, in ms. Applied to the axios client config and to the mock timeout race in client.ts. */
  API_TIMEOUT_MS: number;
  /** Dev-only toggle that enables random failures / malformed responses / artificial timeouts in the mock server. Always false in production and in the Jest test runner. */
  SIMULATE_NETWORK_ISSUES: boolean;
  /** Baseline artificial latency applied to every mock request, in ms. */
  MOCK_BASE_DELAY_MS: number;
  /** Extra latency layered on top of MOCK_BASE_DELAY_MS when slow-network simulation is active. */
  MOCK_SLOW_NETWORK_EXTRA_MS: number;
  /** Probability (0-1) a mock call rejects outright with a network/500/503-style error. */
  RANDOM_FAILURE_RATE: number;
  /** Probability (0-1) a mock call resolves with a deliberately malformed/partial payload. */
  MALFORMED_RESPONSE_RATE: number;
  /** Probability (0-1) a mock call hangs long enough to trigger the client-side timeout race. */
  TIMEOUT_SIMULATION_RATE: number;
  /** How long the mock session token stays valid before session-expiry handling kicks in, in ms. */
  SESSION_TTL_MS: number;
}

const DEV_API_BASE_URL = 'https://api-dev.amrutam.health/v1';
const PROD_API_BASE_URL = 'https://api.amrutam.health/v1';

export const env: EnvConfig = {
  API_BASE_URL: __DEV__ ? DEV_API_BASE_URL : PROD_API_BASE_URL,
  USE_MOCK_SERVER: true,
  API_TIMEOUT_MS: 10000,
  SIMULATE_NETWORK_ISSUES: __DEV__ && !isTestEnv,
  MOCK_BASE_DELAY_MS: 120,
  MOCK_SLOW_NETWORK_EXTRA_MS: 1500,
  RANDOM_FAILURE_RATE: 0.06,
  MALFORMED_RESPONSE_RATE: 0.04,
  TIMEOUT_SIMULATION_RATE: 0.03,
  SESSION_TTL_MS: 30 * 60 * 1000,
};

export default env;
