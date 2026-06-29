import { createServer } from "node:http";
import {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { readdir, stat } from "node:fs/promises";
import { once } from "node:events";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";
import { CompressionTypes, Kafka } from "kafkajs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, "..");
const port = Number(process.env.KAFKA_REPLAY_PORT || 5189);
const jobs = new Map();
const config = {
  bootstrap: process.env.KAFKA_BOOTSTRAP_SERVERS || "localhost:29092",
  kafkaUiUrl: process.env.KAFKA_UI_URL || "http://localhost:8084",
  fullCountLimit: Number(process.env.KAFKA_REPLAY_FULL_COUNT_MAX_BYTES || 64 * 1024 * 1024),
  evidenceDir:
    process.env.KAFKA_REPLAY_EVIDENCE_DIR ||
    path.join(workspaceRoot, "data", "results", "week2", "_metadata", "kafka_replay"),
};
const kafka = new Kafka({
  clientId: "kafka-replay-console",
  brokers: config.bootstrap.split(",").map((item) => item.trim()).filter(Boolean),
  retry: { retries: 8, initialRetryTime: 300 },
});
const skipDirs = new Set([
  ".git",
  "node_modules",
  "postgres-data",
  "mongo-data",
  "neo4j-data",
  "dist",
  "frontend",
]);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clampInt(value, fallback, min, max) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function resolveUserPath(value) {
  const raw = String(value || "").trim();
  if (!raw) throw new Error("CSV file path is required");
  return path.isAbsolute(raw) ? raw : path.resolve(workspaceRoot, raw);
}

function sanitizeTopic(value) {
  return (
    String(value || "csv-replay")
      .trim()
      .replace(/[^A-Za-z0-9._-]/g, "-")
      .slice(0, 249) || "csv-replay"
  );
}

function formatBytes(bytes) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = Number(bytes) || 0;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
}

function parseCsvLine(line, delimiter = ",") {
  const cells = [];
  let cell = "";
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      cells.push(cell);
      cell = "";
    } else {
      cell += char;
    }
  }
  cells.push(cell);
  return cells;
}

function rowToObject(headers, cells, lineNumber) {
  const record = {};
  headers.forEach((header, index) => {
    record[header || `col_${index + 1}`] = cells[index] ?? "";
  });
  record._replay = { lineNumber, emittedAt: new Date().toISOString() };
  return record;
}

function replayRunId() {
  return `run_kafka_replay_${new Date().toISOString().replace(/\D/g, "").slice(0, 14)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function evidenceStatus(status) {
  if (status === "finished") return "succeeded";
  if (status === "error") return "failed";
  return status;
}

function evidenceHealth(status, error) {
  if (status === "failed") return { status: "error", message: error || "Kafka replay failed" };
  if (["queued", "starting", "running", "paused"].includes(status)) {
    return { status: "running", message: "Kafka replay job is active" };
  }
  return { status: "ok", message: "Kafka replay evidence recorded" };
}

function durationSeconds(job) {
  if (!job.startedAt) return 0;
  const end = job.finishedAt || new Date().toISOString();
  const elapsed = Date.parse(end) - Date.parse(job.startedAt);
  return Number.isFinite(elapsed) && elapsed > 0 ? elapsed / 1000 : 0;
}

function publicEvidence(job) {
  const status = evidenceStatus(job.status);
  const elapsedSeconds = durationSeconds(job);
  const throughputPerSecond = elapsedSeconds > 0 ? Math.round((job.sent / elapsedSeconds) * 100) / 100 : 0;
  const updatedAt = new Date().toISOString();
  const kafkaTopic = `kafka://${config.bootstrap}/${job.topic}`;
  return {
    contract: "KafkaReplayEvidence",
    run_id: job.runId,
    job_id: job.id,
    tenant_id: "tenant_demo",
    module: "M4 Kafka Replay",
    producer: "kafka-replay-console",
    status,
    source_file: job.filePath,
    source_file_name: path.basename(job.filePath),
    topic: job.topic,
    partitions: job.partitions,
    records_per_second: job.recordsPerSecond,
    batch_size: job.batchSize,
    key_column: job.keyColumn || null,
    start_row: job.startRow,
    max_rows: job.maxRows,
    total_rows: job.totalRows,
    row_count_known: job.rowCountKnown,
    started_at: job.startedAt,
    finished_at: job.finishedAt,
    updated_at: updatedAt,
    metrics: {
      sent_rows: job.sent,
      failed_rows: job.failed,
      skipped_rows: job.skipped,
      error_count: job.error ? 1 : 0,
      file_bytes: job.fileBytes,
      processed_bytes: job.processedBytes,
      progress_percent: job.progressPercent,
      throughput_per_second: throughputPerSecond,
      duration_ms: Math.round(elapsedSeconds * 1000),
    },
    lineage: {
      source_file: job.filePath,
      kafka_topic: kafkaTopic,
      source_ref: `file://${job.filePath}`,
      target_ref: kafkaTopic,
      handoff: "Spark or another Kafka consumer can read this topic with its own consumer group.",
    },
    health: evidenceHealth(status, job.error),
    error: job.error,
  };
}

function persistEvidence(job) {
  mkdirSync(config.evidenceDir, { recursive: true });
  const evidence = publicEvidence(job);
  const evidencePath = path.join(config.evidenceDir, `${job.runId}.json`);
  writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
  writeFileSync(path.join(config.evidenceDir, "latest.json"), `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
  job.evidencePath = evidencePath;
  return evidence;
}

function publicJob(job) {
  return {
    id: job.id,
    runId: job.runId,
    status: job.status,
    filePath: job.filePath,
    topic: job.topic,
    fileBytes: job.fileBytes,
    processedBytes: job.processedBytes,
    progressPercent: job.progressPercent,
    totalRows: job.totalRows,
    rowCountKnown: job.rowCountKnown,
    targetRows: job.targetRows,
    sent: job.sent,
    failed: job.failed,
    skipped: job.skipped,
    batchSize: job.batchSize,
    recordsPerSecond: job.recordsPerSecond,
    startRow: job.startRow,
    maxRows: job.maxRows,
    startedAt: job.startedAt,
    finishedAt: job.finishedAt,
    error: job.error,
    evidencePath: job.evidencePath,
    lastMessage: job.lastMessage,
  };
}

function updateProgress(job) {
  if (job.targetRows) {
    job.progressPercent = Math.min(100, Math.round((job.sent / job.targetRows) * 100));
  } else if (job.fileBytes > 0) {
    job.progressPercent = Math.min(100, Math.round((job.processedBytes / job.fileBytes) * 100));
  }
}

function targetRowsFor(totalRows, startRow, maxRows) {
  if (!Number.isFinite(totalRows)) return maxRows > 0 ? maxRows : null;
  const available = Math.max(0, totalRows - startRow + 1);
  return maxRows > 0 ? Math.min(available, maxRows) : available;
}

async function discoverCsvFiles(dir = workspaceRoot, depth = 0) {
  if (depth > 5) return [];
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!skipDirs.has(entry.name)) files.push(...(await discoverCsvFiles(fullPath, depth + 1)));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".csv")) {
      const info = await stat(fullPath).catch(() => null);
      files.push({
        path: fullPath,
        relativePath: path.relative(workspaceRoot, fullPath),
        name: path.relative(workspaceRoot, fullPath),
        bytes: info?.size ?? 0,
        size: formatBytes(info?.size ?? 0),
      });
    }
  }
  return files.sort((a, b) => b.bytes - a.bytes);
}

async function inspectCsv(filePath, options = {}) {
  const resolved = resolveUserPath(filePath);
  if (!existsSync(resolved)) throw new Error(`CSV file not found: ${resolved}`);
  if (!statSync(resolved).isFile()) throw new Error("Selected path is not a file");

  const info = statSync(resolved);
  const mode = options.mode || "auto";
  const delimiter = options.delimiter || ",";
  const countRows = mode === "full" || (mode === "auto" && info.size <= config.fullCountLimit);
  const sampleLimit = clampInt(options.sampleLimit, 5, 1, 20);
  const input = createReadStream(resolved, { encoding: options.encoding || "utf8" });
  const reader = readline.createInterface({ input, crlfDelay: Infinity });
  let totalLines = 0;
  let headers = [];
  const samples = [];

  for await (const line of reader) {
    totalLines += 1;
    if (totalLines === 1) {
      headers = parseCsvLine(line, delimiter).map((cell, index) => cell.trim() || `col_${index + 1}`);
      continue;
    }
    if (samples.length < sampleLimit) {
      samples.push(rowToObject(headers, parseCsvLine(line, delimiter), totalLines));
    }
    if (!countRows && samples.length >= sampleLimit) {
      reader.close();
      input.destroy();
      break;
    }
  }

  return {
    path: resolved,
    relativePath: path.relative(workspaceRoot, resolved),
    name: path.basename(resolved),
    bytes: info.size,
    size: formatBytes(info.size),
    inspectMode: countRows ? "full" : "fast",
    rowCountKnown: countRows,
    totalLines: countRows ? totalLines : null,
    totalRows: countRows ? Math.max(0, totalLines - 1) : null,
    headers,
    samples,
  };
}

async function withAdmin(callback) {
  const admin = kafka.admin();
  await admin.connect();
  try {
    return await callback(admin);
  } finally {
    await admin.disconnect();
  }
}

async function listTopics() {
  return withAdmin(async (admin) => (await admin.listTopics()).sort());
}

async function ensureTopic(topic, partitions) {
  await withAdmin(async (admin) => {
    const topics = await admin.listTopics();
    if (topics.includes(topic)) return;
    await admin.createTopics({
      waitForLeaders: true,
      topics: [{ topic, numPartitions: partitions, replicationFactor: 1 }],
    });
  });
}

async function waitIfPaused(job) {
  while (job.status === "paused" && !job.stopRequested) await sleep(200);
}

async function runJob(job) {
  const producer = kafka.producer({ allowAutoTopicCreation: false, maxInFlightRequests: 5 });
  let batch = [];
  try {
    job.status = "starting";
    persistEvidence(job);
    await ensureTopic(job.topic, job.partitions);
    await producer.connect();

    const input = createReadStream(job.filePath, { encoding: job.encoding });
    const reader = readline.createInterface({ input, crlfDelay: Infinity });
    const delayMs = Math.max(0, Math.round((job.batchSize / job.recordsPerSecond) * 1000));
    let lineNumber = 0;

    async function flush() {
      if (!batch.length) return;
      const sentCount = batch.length;
      await producer.send({
        topic: job.topic,
        compression: CompressionTypes.GZIP,
        messages: batch,
      });
      batch = [];
      job.sent += sentCount;
      updateProgress(job);
      persistEvidence(job);
      if (delayMs > 0) await sleep(delayMs);
    }

    job.status = "running";
    job.startedAt = new Date().toISOString();
    persistEvidence(job);
    for await (const line of reader) {
      job.processedBytes = input.bytesRead;
      updateProgress(job);
      lineNumber += 1;
      if (lineNumber === 1) continue;

      const dataRowNumber = lineNumber - 1;
      if (dataRowNumber < job.startRow) {
        job.skipped += 1;
        continue;
      }
      if (job.stopRequested || (job.maxRows > 0 && job.sent >= job.maxRows)) break;
      await waitIfPaused(job);
      if (job.stopRequested) break;

      const record = rowToObject(job.headers, parseCsvLine(line, job.delimiter), lineNumber);
      const value = JSON.stringify(record);
      batch.push({
        key: job.keyColumn ? String(record[job.keyColumn] ?? "") : undefined,
        value,
      });
      job.lastMessage = value.slice(0, 500);

      if (job.maxRows > 0 && job.sent + batch.length >= job.maxRows) {
        await flush();
        break;
      }
      if (batch.length >= job.batchSize) await flush();
    }

    await flush();
    job.processedBytes = job.stopRequested ? job.processedBytes : job.fileBytes;
    updateProgress(job);
    job.status = job.stopRequested ? "stopped" : "finished";
  } catch (error) {
    job.status = "error";
    job.failed += batch.length;
    job.error = error.message;
  } finally {
    job.finishedAt = new Date().toISOString();
    persistEvidence(job);
    await producer.disconnect().catch(() => {});
  }
}

async function startReplay(body) {
  const filePath = resolveUserPath(body.filePath);
  const info = statSync(filePath);
  const inspection = body.inspection || (await inspectCsv(filePath, { mode: "fast" }));
  const startRow = clampInt(body.startRow, 1, 1, Number.MAX_SAFE_INTEGER);
  const maxRows = clampInt(body.maxRows, 0, 0, Number.MAX_SAFE_INTEGER);
  const job = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    runId: replayRunId(),
    status: "queued",
    filePath,
    topic: sanitizeTopic(body.topic),
    partitions: clampInt(body.partitions, 3, 1, 256),
    batchSize: clampInt(body.batchSize, 10, 1, 100000),
    recordsPerSecond: clampInt(body.recordsPerSecond, 10, 1, 1000000),
    startRow,
    maxRows,
    keyColumn: String(body.keyColumn || ""),
    delimiter: body.delimiter || ",",
    encoding: body.encoding || "utf8",
    headers: inspection.headers,
    fileBytes: info.size,
    processedBytes: 0,
    progressPercent: 0,
    totalRows: inspection.totalRows,
    rowCountKnown: inspection.rowCountKnown,
    targetRows: targetRowsFor(inspection.totalRows, startRow, maxRows),
    sent: 0,
    failed: 0,
    skipped: 0,
    stopRequested: false,
    startedAt: null,
    finishedAt: null,
    error: null,
    evidencePath: null,
    lastMessage: null,
  };
  jobs.set(job.id, job);
  persistEvidence(job);
  void runJob(job);
  return publicJob(job);
}

async function createSampleCsv(targetBytes = 1024 * 1024) {
  const safeBytes = clampInt(targetBytes, 1024 * 1024, 1024, 128 * 1024 * 1024);
  const dir = path.join(workspaceRoot, "demo-output", "replay-samples");
  const filePath = path.join(dir, `sample-${safeBytes}-bytes.csv`);
  mkdirSync(dir, { recursive: true });
  const stream = createWriteStream(filePath, { encoding: "utf8" });
  let bytes = 0;
  let index = 0;

  async function write(line) {
    bytes += Buffer.byteLength(line, "utf8");
    if (!stream.write(line)) await once(stream, "drain");
  }

  await write("event_id,user_id,event_type,event_time,amount,payload\n");
  while (bytes < safeBytes) {
    index += 1;
    const eventType = index % 3 === 0 ? "purchase" : index % 3 === 1 ? "view" : "click";
    await write(
      `evt-${index},user-${index % 100},${eventType},${new Date(
        1700000000000 + index * 1000,
      ).toISOString()},${(index % 500) + 1},"sample payload ${index}"\n`,
    );
  }
  stream.end();
  await once(stream, "finish");
  return inspectCsv(filePath, { mode: "full" });
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {};
}

async function handleApi(request, response, pathname) {
  try {
    if (request.method === "GET" && pathname === "/api/health") {
      sendJson(response, 200, {
        ok: true,
        kafkaUi: config.kafkaUiUrl,
        bootstrapServer: config.bootstrap,
        largeInspectBytes: config.fullCountLimit,
        evidenceDir: config.evidenceDir,
      });
    } else if (request.method === "GET" && pathname === "/api/files") {
      sendJson(response, 200, { files: await discoverCsvFiles() });
    } else if (request.method === "GET" && pathname === "/api/topics") {
      sendJson(response, 200, { topics: await listTopics() });
    } else if (request.method === "POST" && pathname === "/api/samples/create") {
      sendJson(response, 200, await createSampleCsv((await readBody(request)).targetBytes));
    } else if (request.method === "POST" && pathname === "/api/inspect") {
      const body = await readBody(request);
      sendJson(response, 200, await inspectCsv(body.filePath, body));
    } else if (request.method === "POST" && pathname === "/api/replay/start") {
      sendJson(response, 200, { job: await startReplay(await readBody(request)) });
    } else if (request.method === "GET" && pathname === "/api/replay/jobs") {
      sendJson(response, 200, { jobs: [...jobs.values()].map(publicJob).reverse() });
    } else if (request.method === "GET" && pathname === "/api/replay/evidence") {
      sendJson(response, 200, { evidence: [...jobs.values()].map(publicEvidence).reverse() });
    } else {
      const match = pathname.match(/^\/api\/replay\/jobs\/([^/]+)\/(pause|resume|stop)$/);
      const job = match ? jobs.get(match[1]) : null;
      if (request.method !== "POST" || !match || !job) {
        sendJson(response, 404, { error: "Not found" });
        return;
      }
      if (match[2] === "pause" && job.status === "running") job.status = "paused";
      if (match[2] === "resume" && job.status === "paused") job.status = "running";
      if (match[2] === "stop") job.stopRequested = true;
      persistEvidence(job);
      sendJson(response, 200, { job: publicJob(job) });
    }
  } catch (error) {
    sendJson(response, 500, { error: error.message });
  }
}

createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host}`);
  if (url.pathname.startsWith("/api/")) {
    await handleApi(request, response, url.pathname);
    return;
  }
  sendJson(response, 200, {
    name: "kafka-replay-console",
    mode: "api-only",
    endpoints: [
      "GET /api/health",
      "GET /api/files",
      "GET /api/topics",
      "POST /api/samples/create",
      "POST /api/inspect",
      "POST /api/replay/start",
      "GET /api/replay/jobs",
      "GET /api/replay/evidence",
      "POST /api/replay/jobs/:id/pause|resume|stop",
    ],
  });
}).listen(port, "0.0.0.0", () => {
  console.log(`Kafka Replay API: http://localhost:${port}`);
});
