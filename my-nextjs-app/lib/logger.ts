export function ts() {
  return new Date().toISOString();
}

export function log(...args: any[]) {
  // Works in client & server
  // eslint-disable-next-line no-console
  console.log(`[${ts()}]`, ...args);
}

export function newReqId() {
  return Math.random().toString(36).slice(2, 10);
}
