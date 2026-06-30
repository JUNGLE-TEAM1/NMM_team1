import { request } from "./httpClient";

export const WEEK2_DEFAULT_PIPELINE_ID = "pipeline_reviews_json_e2e";
export const WEEK2_DEFAULT_DATASET_ID = "dataset_reviews_gold";
export const WEEK2_DEFAULT_EXECUTOR = "local_runner";
export const WEEK2_DEFAULT_TRIGGERED_BY = "demo_user";

function encodePathSegment(value) {
  return encodeURIComponent(value);
}

function requireNonBlankString(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label} is required.`);
  }
  return value.trim();
}

export function triggerWeek2Run(
  pipelineId = WEEK2_DEFAULT_PIPELINE_ID,
  { executor = WEEK2_DEFAULT_EXECUTOR, triggeredBy = WEEK2_DEFAULT_TRIGGERED_BY } = {},
) {
  const nextPipelineId = requireNonBlankString(pipelineId, "Week2 pipeline id");

  return request(`/api/week2/workflows/${encodePathSegment(nextPipelineId)}/runs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      executor,
      triggered_by: triggeredBy,
    }),
  });
}

export function getWeek2Run(runId) {
  const nextRunId = requireNonBlankString(runId, "Week2 run id");
  return request(`/api/week2/runs/${encodePathSegment(nextRunId)}`);
}

export function getWeek2Catalog(datasetId = WEEK2_DEFAULT_DATASET_ID) {
  const nextDatasetId = requireNonBlankString(datasetId, "Week2 dataset id");
  return request(`/api/week2/catalog/${encodePathSegment(nextDatasetId)}`);
}

export function getWeek2AirflowReadiness() {
  return request("/api/week2/airflow/readiness");
}

export function getWeek2SparkReadiness() {
  return request("/api/week2/spark/readiness");
}

export function askWeek2AiQuery(question) {
  const nextQuestion = requireNonBlankString(question, "Week2 AI query question");

  return request("/api/week2/ai/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: nextQuestion }),
  });
}
