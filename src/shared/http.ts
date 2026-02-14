export interface HttpOptions extends RequestInit {
  // 预留扩展位，后续如果需要加超时、重试等可以在这里扩展
}

/**
 * GET 请求，返回 JSON
 */
export async function httpGet<T = any>(
  url: string,
  options: HttpOptions = {}
): Promise<T> {
  const res = await fetch(url, {
    method: 'GET',
    ...options
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }

  return (await res.json()) as T;
}

/**
 * POST 请求，返回 JSON
 */
export async function httpPost<T = any>(
  url: string,
  body?: any,
  options: HttpOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0',
    ...(options.headers as Record<string, string> | undefined)
  };

  const res = await fetch(url, {
    method: 'POST',
    body: body != null ? JSON.stringify(body) : undefined,
    ...options,
    headers
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }

  return (await res.json()) as T;
}