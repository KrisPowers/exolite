import { QuickDB } from "quick.db";

export const db = new QuickDB();

// Optional initializer
export function dbInit() {
  console.log("QuickDB initialized");
}