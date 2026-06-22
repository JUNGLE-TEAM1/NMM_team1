import { request } from "./httpClient";

export function listSources() {
  return request("/api/sources");
}

export function createSource({ name, path }) {
  return request("/api/sources", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, type: "csv", path }),
  });
}
