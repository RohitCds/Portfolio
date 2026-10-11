// Deliberate minimum load time so the launch loader always gets to show off a full rocket hop
// (launch → flight → landing takes ~2.1s). Data fetching runs in parallel, so this is a floor, not added time.
export const LOADER_MIN_MS = 2500;

export const minLoad = () => new Promise<void>((resolve) => setTimeout(resolve, LOADER_MIN_MS));

export async function withMinLoad<T>(work: Promise<T>): Promise<T> {
  const [result] = await Promise.all([work, minLoad()]);
  return result;
}
