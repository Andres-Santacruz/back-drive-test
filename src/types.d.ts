export interface ApiResponseParse<T> {
  data: T;
  error: null | string;
}
