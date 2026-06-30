import { request } from "./httpClient";

export function listCatalogDatasets() {
  return request("/api/catalog/datasets");
}

export function getCatalogDatasetManagementPolicy() {
  return request("/api/catalog/datasets/management-policy");
}
