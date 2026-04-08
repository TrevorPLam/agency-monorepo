# 04-data/02-api-client: Data API Client

## Purpose
Typed fetch wrappers and API client helpers for internal service-to-service calls. Only warranted once two or more apps genuinely call the same internal API.

## Files
```
packages/data/api-client/
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── index.ts
    ├── types.ts
    ├── client.ts
    └── interceptors.ts
```

### `package.json`
```json
{
  "name": "@agency/data-api-client",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./types": "./src/types.ts",
    "./client": "./src/client.ts"
  },
  "dependencies": {
    "@agency/core-types": "workspace:*"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*"
  },
  "publishConfig": {
    "access": "restricted"
  }
}
```

### `src/types.ts`
```ts
export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

export interface RequestConfig {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

export interface ApiError extends Error {
  status: number;
  data?: unknown;
}

export type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
export type ResponseInterceptor<T> = (response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;
export type ErrorInterceptor = (error: ApiError) => ApiError | Promise<ApiError>;
```

### `src/client.ts`
```ts
import type { ApiClientConfig, RequestConfig, ApiResponse, ApiError, RequestInterceptor, ResponseInterceptor, ErrorInterceptor } from "./types";

export class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retries: number;
  private defaultHeaders: Record<string, string>;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor<unknown>[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout ?? 10000;
    this.retries = config.retries ?? 3;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...config.headers
    };
  }

  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor<T>(interceptor: ResponseInterceptor<T>): void {
    this.responseInterceptors.push(interceptor as ResponseInterceptor<unknown>);
  }

  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  private async applyRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let result = config;
    for (const interceptor of this.requestInterceptors) {
      result = await interceptor(result);
    }
    return result;
  }

  private async applyResponseInterceptors<T>(response: ApiResponse<T>): Promise<ApiResponse<T>> {
    let result = response;
    for (const interceptor of this.responseInterceptors) {
      result = await interceptor(result) as ApiResponse<T>;
    }
    return result;
  }

  private async applyErrorInterceptors(error: ApiError): Promise<ApiError> {
    let result = error;
    for (const interceptor of this.errorInterceptors) {
      result = await interceptor(result);
    }
    return result;
  }

  async request<T>(path: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const url = new URL(path, this.baseURL).toString();
    
    let requestConfig = await this.applyRequestInterceptors({
      method: "GET",
      ...config,
      headers: { ...this.defaultHeaders, ...config.headers }
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    if (requestConfig.signal) {
      requestConfig.signal.addEventListener("abort", () => controller.abort());
    }

    try {
      const response = await fetch(url, {
        method: requestConfig.method,
        headers: requestConfig.headers,
        body: requestConfig.body ? JSON.stringify(requestConfig.body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      let data: T;
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        data = await response.json() as T;
      } else {
        data = await response.text() as unknown as T;
      }

      if (!response.ok) {
        const error: ApiError = new Error(`API Error: ${response.status}`) as ApiError;
        error.status = response.status;
        error.data = data;
        throw await this.applyErrorInterceptors(error);
      }

      const apiResponse: ApiResponse<T> = {
        data,
        status: response.status,
        headers: response.headers
      };

      return this.applyResponseInterceptors(apiResponse);
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === "AbortError") {
        const timeoutError: ApiError = new Error("Request timeout") as ApiError;
        timeoutError.status = 408;
        throw await this.applyErrorInterceptors(timeoutError);
      }

      throw error;
    }
  }

  async get<T>(path: string, config?: Omit<RequestConfig, "method" | "body">): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...config, method: "GET" });
  }

  async post<T>(path: string, body: unknown, config?: Omit<RequestConfig, "method">): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...config, method: "POST", body });
  }

  async put<T>(path: string, body: unknown, config?: Omit<RequestConfig, "method">): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...config, method: "PUT", body });
  }

  async patch<T>(path: string, body: unknown, config?: Omit<RequestConfig, "method">): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...config, method: "PATCH", body });
  }

  async delete<T>(path: string, config?: Omit<RequestConfig, "method" | "body">): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...config, method: "DELETE" });
  }
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config);
}
```

### `src/interceptors.ts`
```ts
import type { RequestConfig, ApiResponse, ApiError, RequestInterceptor, ResponseInterceptor, ErrorInterceptor } from "./types";

export const authInterceptor = (getToken: () => string | null | Promise<string | null>): RequestInterceptor => {
  return async (config: RequestConfig): Promise<RequestConfig> => {
    const token = await getToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`
      };
    }
    return config;
  };
};

export const loggingInterceptor: RequestInterceptor = async (config: RequestConfig): Promise<RequestConfig> => {
  console.log(`[API] ${config.method?.toUpperCase() || "GET"} request`);
  return config;
};

export const errorHandlerInterceptor: ErrorInterceptor = async (error: ApiError): Promise<ApiError> => {
  if (error.status === 401) {
    // Handle unauthorized - could redirect to login or refresh token
    console.error("[API] Unauthorized request");
  }
  return error;
};

export const retryInterceptor = (maxRetries: number): ResponseInterceptor<unknown> => {
  return async (response: ApiResponse<unknown>): Promise<ApiResponse<unknown>> => {
    // Retry logic would be implemented here with exponential backoff
    return response;
  };
};
```

### `src/index.ts`
```ts
export { ApiClient, createApiClient } from "./client";
export { authInterceptor, loggingInterceptor, errorHandlerInterceptor, retryInterceptor } from "./interceptors";
export type {
  ApiClientConfig,
  RequestConfig,
  ApiResponse,
  ApiError,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor
} from "./types";
```

### README
```md
# @agency/data-api-client

Typed fetch wrappers for internal service-to-service calls.

## Usage
```ts
import { createApiClient, authInterceptor } from "@agency/data-api-client";

const client = createApiClient({
  baseURL: "https://api.internal.agency.com",
  timeout: 5000
});

client.addRequestInterceptor(authInterceptor(() => localStorage.getItem("token")));

const { data } = await client.get("/projects");
```

## When to Add
Only create this package when two or more apps genuinely call the same internal API.
```
