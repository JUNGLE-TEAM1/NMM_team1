import { request } from "./httpClient";

export function getProductHealthProcessingTemplate() {
  return request("/api/processing-templates/product-health");
}
