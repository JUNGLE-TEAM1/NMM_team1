import { request } from "./httpClient";

export function listCatalogDatasets() {
  return request("/api/catalog/datasets");
}
