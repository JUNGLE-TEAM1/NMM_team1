import { request } from "./httpClient";

export function listPipelines() {
  return request("/api/pipelines");
}

export function createPipeline({ name, sourceDatasetId, selectFields, targetName }) {
  return request("/api/pipelines", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      source_dataset_id: sourceDatasetId,
      select_fields: selectFields,
      target_name: targetName,
    }),
  });
}

export function runPipeline(pipelineId) {
  return request(`/api/pipelines/${pipelineId}/runs`, {
    method: "POST",
  });
}
