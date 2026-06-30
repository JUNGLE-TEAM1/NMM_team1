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

export function inspectExternalConnection(connection) {
  return request("/api/external-connections/inspect", {
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

export function getExternalConnectionCredentialPolicy() {
  return request("/api/external-connections/credential-policy");
}

export function updateExternalConnection(connectionId, connection) {
  return request(`/api/external-connections/${encodeURIComponent(connectionId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(connection),
  });
}

export function deleteExternalConnection(connectionId) {
  return request(`/api/external-connections/${encodeURIComponent(connectionId)}`, {
    method: "DELETE",
  });
}
