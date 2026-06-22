import { request } from "./httpClient";

export function getHealth() {
  return request("/api/health");
}
