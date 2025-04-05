export function createServerRpc(
  functionId: string,
  fn: (...args: unknown[]) => unknown,
): (...args: unknown[]) => unknown {
  return Object.assign(fn, {
    functionId,
    $get: fn,
    $post: fn,
    $put: fn,
    $delete: fn,
    $patch: fn,
    url: new URL("/_server-fn", "http://localhost:4321"),
  });
}
