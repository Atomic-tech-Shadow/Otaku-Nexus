import { QueryClient, QueryFunction } from "@tanstack/react-query";

const BASE_URL = "";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  url: string,
  options: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  } = {}
): Promise<Response> {
  const { method = "GET", body, headers = {} } = options;

  // Get auth token from localStorage
  const token = localStorage.getItem("auth_token");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    credentials: "include",
  };

  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }

  console.log(`API ${method} ${url}:`, body || {});

  try {
    const response = await fetch(url, config);

    // Log response data for debugging
    const clonedResponse = response.clone();
    try {
      const responseData = await clonedResponse.json();
      console.log(`API Response data for ${url}:`, responseData);
    } catch (e) {
      // Response is not JSON, that's okay
      console.log(`API Response for ${url}: Non-JSON response`);
    }

    return response;
  } catch (networkError) {
    console.error(`Network error for ${url}:`, networkError);
    throw new Error(`Erreur réseau: ${networkError.message}`);
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = localStorage.getItem("auth_token");
    const headers: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const res = await fetch(queryKey[0] as string, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});