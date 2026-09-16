export function workPersonPath(personId: string): string {
  return `/work?person=${encodeURIComponent(personId)}`;
}
