import { request } from "./httpClient";

export function listTargetDatasets() {
  return request("/api/target-datasets");
}

export function createTargetDataset(dataset) {
  return request("/api/target-datasets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dataset),
  });
}
