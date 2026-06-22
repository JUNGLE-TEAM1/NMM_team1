const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "";

async function request(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, options);
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.detail || `HTTP ${response.status}`);
  }
  return payload;
}

export function getApiBaseUrl() {
  return apiBaseUrl;
}

export function getHealth() {
  return request("/api/health");
}

export function listSources() {
  return request("/api/sources");
}

export function listCatalogDatasets() {
  return request("/api/catalog/datasets");
}

export function createSource({ name, path }) {
  return request("/api/sources", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, type: "csv", path }),
  });
}

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
