// lib/api.ts

import axios from "axios";

const baseURL =
  // まず環境変数を優先
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  // なければ開発時はローカル Sail を使う
  (process.env.NODE_ENV === "development"
    ? "http://localhost:8000"
    : "http://127.0.0.1:8000"); // 予備（ほぼ使わない）

const api = axios.create({
  baseURL,
  withCredentials: true,
  withXSRFToken: true,
});

export default api;
