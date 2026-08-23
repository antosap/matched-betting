import type { Operation } from "@/lib/types/operation";

const STORAGE_KEY = "matchbet.operations";

export function getOperations(): Operation[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    return JSON.parse(raw) as Operation[];
  } catch {
    return [];
  }
}

export function saveOperation(operation: Operation): void {
  const operations = getOperations();

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([operation, ...operations])
  );
}

export function deleteOperation(id: string): void {
  const operations = getOperations().filter(
    (operation) => operation.id !== id
  );

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(operations)
  );
}
