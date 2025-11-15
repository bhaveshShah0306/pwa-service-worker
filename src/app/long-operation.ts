export function longOperation(interval: number): string {
  const startTime: Date = new Date();
  while (true) {
    const currentTime: Date = new Date();
    if (currentTime.valueOf() - startTime.valueOf() >= interval) {
      break;
    }
  }
  return `Operation Done in ${interval}ms!`;
}
