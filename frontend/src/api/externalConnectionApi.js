import { request } from "./httpClient";

export function listExternalConnections() {
  return request("/api/external-connections");
}

export function createExternalConnection(connection) {
  return request("/api/external-connections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(connection),
  });
}

export function testExternalConnection(connection) {
  return request("/api/external-connections/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(connection),
  });
}

export function getExternalTableSchema(connectionId, schemaName, tableName) {
  return request(
    `/api/external-connections/${encodeURIComponent(connectionId)}/schemas/${encodeURIComponent(schemaName)}/tables/${encodeURIComponent(tableName)}`,
  );
}
