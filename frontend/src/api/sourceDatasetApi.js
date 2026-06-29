import { request } from "./httpClient";

export function listSourceDatasets() {
  return request("/api/source-datasets");
}

export function createSourceDataset(dataset) {
  return request("/api/source-datasets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dataset),
  });
}
