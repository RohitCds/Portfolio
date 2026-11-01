// Deliberate minimum load time so the launch loader always gets to show off a full rocket hop
// (launch → flight → landing takes ~2.1s). Data fetching runs in parallel, so this is a floor, not added time.
export const LOADER_MIN_MS = 2500;

export const minLoad = () => new Promise<void>((resolve) => setTimeout(resolve, LOADER_MIN_MS));

export async function withMinLoad<T>(work: Promise<T>): Promise<T> {
  const [result] = await Promise.all([work, minLoad()]);
  return result;
}

// Rejects if `work` hasn't settled within `ms`, so a slow or unreachable database can't keep a page on the loader
export function withTimeout<T>(work: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms);
    work.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}
