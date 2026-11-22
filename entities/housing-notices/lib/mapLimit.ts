/** xs를 최대 limit개씩 동시에 처리한다 (순서 유지) */
export async function mapLimit<T, R>(
  xs: T[],
  limit: number,
  fn: (x: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = new Array(xs.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (i < xs.length) {
        const idx = i++;
        out[idx] = await fn(xs[idx]);
      }
    }),
  );
  return out;
}
