/** Parse FastAPI error `detail` (string or validation array) for display. */
export function parseApiErrorDetail(detail: unknown): string | undefined {
  if (typeof detail === 'string') {
    const trimmed = detail.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  if (!Array.isArray(detail) || detail.length === 0) return undefined;

  const messages = detail
    .map((item) => {
      if (typeof item === 'string') return item.trim();
      if (item && typeof item === 'object' && 'msg' in item) {
        const msg = (item as { msg: unknown }).msg;
        return typeof msg === 'string' ? msg.trim() : undefined;
      }
      return undefined;
    })
    .filter((msg): msg is string => Boolean(msg));

  return messages.length > 0 ? messages.join(' ') : undefined;
}

const STATUS_FALLBACKS: Record<number, string> = {
  400: 'Invalid request. Please check your input and try again.',
  401: 'Please log in to continue.',
  403: "You don't have permission to perform this action.",
  404: 'The requested resource was not found.',
  422: 'Please check your input and try again.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Server error. Please try again later.',
  502: 'Service temporarily unavailable. Please try again later.',
  503: 'Service temporarily unavailable. Please try again later.',
  504: 'Service temporarily unavailable. Please try again later.',
};

/** Prefer server message on 4xx when present; otherwise use status fallback. */
export function getUserFacingApiMessage(status: number, data: { detail?: unknown }): string {
  const fromServer = parseApiErrorDetail(data.detail);
  if (fromServer) return fromServer;
  return STATUS_FALLBACKS[status] ?? 'API request failed';
}

export function isDuplicateEmailMessage(message: string): boolean {
  return /email already exists|already registered|already in use/i.test(message);
}
