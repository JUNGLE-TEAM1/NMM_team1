import { request } from "./httpClient";

export function listTargetDatasetDrafts() {
  return request("/api/target-dataset-drafts");
}

export function createTargetDatasetDraft(draft) {
  return request("/api/target-dataset-drafts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(draft),
  });
}

export function updateTargetDatasetDraft(draftId, draft) {
  return request(`/api/target-dataset-drafts/${encodeURIComponent(draftId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(draft),
  });
}

export function updateTargetDatasetDraftSchedule(draftId, schedule) {
  return request(`/api/target-dataset-drafts/${encodeURIComponent(draftId)}/schedule`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(schedule),
  });
}

export function deleteTargetDatasetDraft(draftId) {
  return request(`/api/target-dataset-drafts/${encodeURIComponent(draftId)}`, {
    method: "DELETE",
  });
}

export function listTargetDatasetJobRuns() {
  return request("/api/target-dataset-job-runs");
}

export function createTargetDatasetJobRun(run) {
  return request("/api/target-dataset-job-runs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(run),
  });
}

export function executeTargetDatasetJobRun(runId) {
  return request(`/api/target-dataset-job-runs/${encodeURIComponent(runId)}/execute`, {
    method: "POST",
  });
}

export function publishTargetDatasetJobRunToCatalog(runId) {
  return request(`/api/target-dataset-job-runs/${encodeURIComponent(runId)}/publish-catalog`, {
    method: "POST",
  });
}
