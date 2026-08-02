import type { PlacedOrder } from "@/data/types";

const KEY = "trikon.last-order.v1";

export function saveOrder(order: PlacedOrder) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(order));
  } catch {
    /* storage unavailable */
  }
}

export function readOrder(): PlacedOrder | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PlacedOrder) : null;
  } catch {
    return null;
  }
}

export function generateOrderNumber() {
  const stamp = Date.now().toString().slice(-6);
  const rand = Math.floor(Math.random() * 900 + 100);
  return `TRK-${stamp}${rand}`;
}
