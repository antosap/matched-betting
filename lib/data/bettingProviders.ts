import { bookmakers } from "./bookmakers";
import { exchanges } from "./exchanges";

export function getBookmakerName(id: string) {
  return bookmakers.find((item) => item.id === id)?.name ?? id;
}

export function getExchangeName(id: string) {
  return exchanges.find((item) => item.id === id)?.name ?? id;
}
