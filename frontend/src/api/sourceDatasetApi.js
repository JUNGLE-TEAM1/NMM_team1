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

export function updateSourceDataset(datasetId, dataset) {
  return request(`/api/source-datasets/${datasetId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dataset),
  });
}

export function deleteSourceDataset(datasetId) {
  return request(`/api/source-datasets/${datasetId}`, {
    method: "DELETE",
  });
}

export function createSourceDatasetSnapshot(datasetId, payload = {}) {
  return request(`/api/source-datasets/${datasetId}/snapshots`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function listSourceDatasetSnapshots(datasetId) {
  return request(`/api/source-datasets/${datasetId}/snapshots`);
}
