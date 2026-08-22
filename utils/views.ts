export function formatViewCount(n: number) {
  return new Intl.NumberFormat('en-US').format(Math.max(0, Math.floor(n)));
}
