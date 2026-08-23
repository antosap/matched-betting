const STORAGE_KEY = "matchbet.bankroll.initial";

export function getInitialBankroll(): number {
  if (typeof window === "undefined") {
    return 0;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return 0;
  }

  const value = Number(raw);

  return Number.isFinite(value) ? value : 0;
}

export function saveInitialBankroll(value: number): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    String(value)
  );
}
