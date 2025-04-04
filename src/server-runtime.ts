export function createServerRpc(
  functionId: string,
  fn: (...args: unknown[]) => unknown,
) {
  return Object.assign(fn, {
    functionId,
  });
}
