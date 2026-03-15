export interface ApiResponse<T> {
  data: T;
  error: null;
  meta?: ApiMeta;
}

export interface ApiErrorResponse {
  data: null;
  error: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiMeta {
  page?: number;
  perPage?: number;
  total?: number;
  totalPages?: number;
}

export interface PaginationQuery {
  page?: number;
  perPage?: number;
}

export function createSuccessResponse<T>(data: T, meta?: ApiMeta): ApiResponse<T> {
  return { data, error: null, meta };
}

export function createErrorResponse(
  code: string,
  message: string,
  details?: Record<string, unknown>,
): ApiErrorResponse {
  return { data: null, error: { code, message, details } };
}
