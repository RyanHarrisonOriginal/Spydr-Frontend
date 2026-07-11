/** Statuses hidden from person work sections until the user opts in. */
export function isClosedCollectionStatus(status: string): boolean {
  return status === "completed" || status === "archived";
}
