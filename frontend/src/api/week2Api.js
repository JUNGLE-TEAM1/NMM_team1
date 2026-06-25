import { request } from "./httpClient";

const PIPELINE_ID = "pipeline_reviews_json_e2e";
const DATASET_ID = "dataset_reviews_gold";

export function runWeek2Workflow(executor = "local_runner") {
  return request(`/api/week2/workflows/${PIPELINE_ID}/runs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      executor,
      triggered_by: "m5_ui_demo",
    }),
  });
}

export function getWeek2Run(runId) {
  return request(`/api/week2/runs/${runId}`);
}

export function getWeek2Catalog() {
  return request(`/api/week2/catalog/${DATASET_ID}`);
}

