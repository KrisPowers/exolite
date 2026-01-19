import { SecureStore } from "apiro-db";

export const db = new SecureStore({
  file: "./local.db",
});