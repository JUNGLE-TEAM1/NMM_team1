import { request } from "./httpClient";

export const WEEK2_DEFAULT_PIPELINE_ID = "pipeline_reviews_json_e2e";
export const WEEK2_DEFAULT_DATASET_ID = "dataset_reviews_gold";
export const WEEK2_DEFAULT_EXECUTOR = "local_runner";
export const WEEK2_DEFAULT_TRIGGERED_BY = "demo_user";

function encodePathSegment(value) {
  return encodeURIComponent(value);
}

export function triggerWeek2Run(
  pipelineId = WEEK2_DEFAULT_PIPELINE_ID,
  { executor = WEEK2_DEFAULT_EXECUTOR, triggeredBy = WEEK2_DEFAULT_TRIGGERED_BY } = {},
) {
  return request(`/api/week2/workflows/${encodePathSegment(pipelineId)}/runs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      executor,
      triggered_by: triggeredBy,
    }),
  });
}

export function getWeek2Run(runId) {
  return request(`/api/week2/runs/${encodePathSegment(runId)}`);
}

export function getWeek2Catalog(datasetId = WEEK2_DEFAULT_DATASET_ID) {
  return request(`/api/week2/catalog/${encodePathSegment(datasetId)}`);
}

export function askWeek2AiQuery(question) {
  return request("/api/week2/ai/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
}
