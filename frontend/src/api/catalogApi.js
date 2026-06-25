import { request } from "./httpClient";

export function listCatalogDatasets() {
  return request("/api/catalog/datasets");
}

export function getJsonRecommendations(datasetId) {
  return request(`/api/catalog/datasets/${datasetId}/json-recommendations`);
}
