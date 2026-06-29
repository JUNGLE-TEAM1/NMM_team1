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

export function triggerTargetDatasetRun(datasetId, { executor = "local_runner", triggeredBy = "demo_user" } = {}) {
  return request(`/api/target-datasets/${encodeURIComponent(datasetId)}/runs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      executor,
      triggered_by: triggeredBy,
    }),
  });
}

export function listTargetDatasetRuns(datasetId) {
  return request(`/api/target-datasets/${encodeURIComponent(datasetId)}/runs`);
}

export function getTargetDatasetRun(runRecordId) {
  return request(`/api/target-dataset-runs/${encodeURIComponent(runRecordId)}`);
}
