// deno-lint-ignore no-explicit-any
export interface ServerFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): ReturnType<T>;
  $get: T;
  $post: T;
  $put: T;
  $delete: T;
  $patch: T;
  url: URL;
}

// deno-lint-ignore no-explicit-any
export function defineServerFunction<T extends (...args: any[]) => any>(
  fn: T,
): ServerFunction<T> {
  return fn as unknown as ServerFunction<T>;
}
