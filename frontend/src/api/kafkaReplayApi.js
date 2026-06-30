import { request } from "./httpClient";

export function getKafkaReplayHealth() {
  return request("/api/week2/kafka-replay/health");
}

export function listKafkaReplayRuns() {
  return request("/api/week2/kafka-replay/runs");
}

export function getKafkaReplayRun(runId) {
  return request(`/api/week2/kafka-replay/runs/${encodeURIComponent(runId)}`);
}
