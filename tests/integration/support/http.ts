export interface HttpResponse {
  ok: boolean;
  status: number;
  body: string;
}

export interface HttpRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

export const httpRequest = async (url: string, options: HttpRequestOptions = {}): Promise<HttpResponse> => {
  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers: { accept: 'application/json', ...options.headers },
    body: options.body,
  });

  return { ok: response.ok, status: response.status, body: await response.text() };
};

export const httpJson = async <T>(url: string, options: HttpRequestOptions = {}): Promise<T> => {
  const response = await httpRequest(url, options);
  if (!response.ok) {
    throw new Error(`${options.method ?? 'GET'} ${url} failed: ${response.status} ${response.body}`);
  }

  return JSON.parse(response.body) as T;
};
