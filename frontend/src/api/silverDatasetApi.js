import { request } from "./httpClient";

export function listSilverDatasets() {
  return request("/api/silver-datasets");
}

export function createSilverDataset(dataset) {
  return request("/api/silver-datasets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dataset),
  });
}

export function updateSilverDataset(datasetId, dataset) {
  return request(`/api/silver-datasets/${encodeURIComponent(datasetId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dataset),
  });
}

export function updateSilverDatasetSchedule(datasetId, schedule) {
  return request(`/api/silver-datasets/${encodeURIComponent(datasetId)}/schedule`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(schedule),
  });
}

export function deleteSilverDataset(datasetId) {
  return request(`/api/silver-datasets/${encodeURIComponent(datasetId)}`, {
    method: "DELETE",
  });
}

export function createSilverDatasetMaterialization(datasetId, payload = {}) {
  return request(`/api/silver-datasets/${encodeURIComponent(datasetId)}/materializations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function listSilverDatasetMaterializations(datasetId) {
  return request(`/api/silver-datasets/${encodeURIComponent(datasetId)}/materializations`);
}
