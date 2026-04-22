const API_BASE_URL = 'http://localhost:3000/api';

interface ApiFetchOptions extends RequestInit {
  token?: string;
  body?: any;
}

export class ApiError extends Error {
  public status: number;
  public data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';

    this.status = status;
    this.data = data;

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export async function apiFetch<T>(
  endpoint: string,
  { token, headers, body, ...rest }: ApiFetchOptions = {},
): Promise<T> {
  const requestHeaders = new Headers(headers);
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  if (token) requestHeaders.set('Authorization', `Bearer ${token}`);

  if (!isFormData && body != null && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  const url = `${API_BASE_URL}/${endpoint.replace(/^\//, '')}`;

  const response = await fetch(url, {
    ...rest,
    headers: requestHeaders,
    body:
      body == null || isFormData || typeof body === 'string'
        ? (body as BodyInit | null | undefined)
        : JSON.stringify(body),
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null);

  if (!response.ok) {
    const errorMessage = data?.error || data?.message || `Erreur ${response.status}`;

    throw new ApiError(errorMessage, response.status, data);
  }

  return data as T;
}