import { ApiError, normalizeError } from './errors';

/**
 * Standardized error mappings for the reliability layer (slow network,
 * timeouts, random failures, malformed responses, session expiry).
 *
 * This extends — rather than replaces — the base normalization in
 * `errors.ts`: `normalizeError` turns *any* thrown value into an
 * `ApiError`, and this file layers consistent, user-facing copy on top
 * for the specific failure modes below while leaving domain-specific
 * messages (e.g. "Slot is no longer available", 404s) untouched.
 */
export const ErrorCode = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  SERVER_ERROR: 'SERVER_ERROR',
  MALFORMED_RESPONSE: 'MALFORMED_RESPONSE',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

const FRIENDLY_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.NETWORK_ERROR]:
    "You're offline or the connection dropped. Please check your network and try again.",
  [ErrorCode.TIMEOUT]: 'The request took too long to respond. Please try again.',
  [ErrorCode.SERVER_ERROR]: 'Something went wrong, please retry.',
  [ErrorCode.MALFORMED_RESPONSE]: 'Something went wrong, please retry.',
  [ErrorCode.SESSION_EXPIRED]: 'Your session has expired. Please sign in again.',
};

export function mapTimeoutError(): ApiError {
  return new ApiError(FRIENDLY_MESSAGES[ErrorCode.TIMEOUT], 408, ErrorCode.TIMEOUT);
}

export function mapMalformedResponseError(context?: string): ApiError {
  return new ApiError(
    FRIENDLY_MESSAGES[ErrorCode.MALFORMED_RESPONSE],
    502,
    ErrorCode.MALFORMED_RESPONSE,
    context ? { context } : undefined
  );
}

export function mapSessionExpiredError(): ApiError {
  return new ApiError(FRIENDLY_MESSAGES[ErrorCode.SESSION_EXPIRED], 401, ErrorCode.SESSION_EXPIRED);
}

export function mapRandomFailureError(kind: 'network' | 'server' | 'unavailable' = 'server'): ApiError {
  if (kind === 'network') {
    return new ApiError(FRIENDLY_MESSAGES[ErrorCode.NETWORK_ERROR], 0, ErrorCode.NETWORK_ERROR);
  }
  if (kind === 'unavailable') {
    return new ApiError('The service is temporarily unavailable. Please try again shortly.', 503, ErrorCode.SERVER_ERROR);
  }
  return new ApiError(FRIENDLY_MESSAGES[ErrorCode.SERVER_ERROR], 500, ErrorCode.SERVER_ERROR);
}

/**
 * Central entry point for the API layer's catch blocks. Normalizes any
 * thrown value into an ApiError (via errors.ts), then swaps in the
 * standardized friendly copy for the reliability error codes above so
 * the UI never has to render a raw/technical error message. Errors that
 * already carry their own specific, user-facing message (e.g. mockServer's
 * 404 / 409 responses) pass through unchanged.
 */
export function mapErrorToUserMessage(error: any): ApiError {
  const normalized = normalizeError(error);
  const friendly = normalized.code && FRIENDLY_MESSAGES[normalized.code as ErrorCode];
  if (friendly) {
    return new ApiError(friendly, normalized.statusCode, normalized.code, normalized.details);
  }
  return normalized;
}

/**
 * Guards against the "invalid JSON / partial response" failure mode.
 * Since the mock server bypasses axios (so a real JSON.parse failure can
 * never happen), mockServer.ts occasionally hands back an object that's
 * missing one of its expected fields. This validates the required keys
 * exist *before* any UI code touches them, so a corrupted response maps
 * to a clean "please retry" error instead of an `undefined.property`
 * crash deep in a component.
 */
export function assertResponseShape<T extends Record<string, any>>(
  payload: any,
  requiredKeys: Array<keyof T>,
  context: string
): T {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw mapMalformedResponseError(context);
  }
  for (const key of requiredKeys) {
    if (payload[key as string] === undefined) {
      throw mapMalformedResponseError(context);
    }
  }
  return payload as T;
}

/**
 * Same idea as assertResponseShape, but for list endpoints: validates the
 * payload is actually an array and that every item still has the field
 * callers rely on (defaults to `id`).
 */
export function assertArrayShape<T extends Record<string, any>>(
  payload: any,
  context: string,
  requiredItemKey: keyof T = 'id' as keyof T
): T[] {
  if (!Array.isArray(payload)) {
    throw mapMalformedResponseError(context);
  }
  for (const item of payload) {
    if (!item || typeof item !== 'object' || item[requiredItemKey as string] === undefined) {
      throw mapMalformedResponseError(context);
    }
  }
  return payload as T[];
}
