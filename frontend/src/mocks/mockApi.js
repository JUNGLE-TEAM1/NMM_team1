const FRONTEND_ONLY_FLAG = "VITE_FRONTEND_ONLY";
const STORAGE_KEY = "xflow.frontendOnly.mockState.v1";

const now = () => new Date().toISOString();

const makeColumns = () => [
  { name: "order_id", type: "BIGINT", nullable: false, description: "Unique order key" },
  { name: "customer_id", type: "VARCHAR", nullable: false, description: "Customer identifier" },
  { name: "order_date", type: "TIMESTAMP", nullable: false, description: "Order timestamp" },
  { name: "amount", type: "DOUBLE", nullable: false, description: "Order amount" },
  { name: "status", type: "VARCHAR", nullable: true, description: "Fulfillment status" },
];

const sourceColumns = [
  { name: "event_id", type: "VARCHAR" },
  { name: "event_time", type: "TIMESTAMP" },
  { name: "user_id", type: "VARCHAR" },
  { name: "event_name", type: "VARCHAR" },
  { name: "properties", type: "JSON" },
];

const seedState = () => {
  const createdAt = now();
  const sourceA = {
    id: "src-orders-postgres",
    name: "orders_postgres",
    description: "PostgreSQL orders table for checkout analytics.",
    owner: "Data Platform",
    dataset_type: "source",
    source_type: "postgres",
    connection_id: "conn-postgres",
    table: "orders",
    columns: makeColumns(),
    status: "active",
    job_type: "batch",
    import_ready: true,
    created_at: createdAt,
    updated_at: createdAt,
  };
  const sourceB = {
    id: "src-events-api",
    name: "product_events_api",
    description: "REST API source for product interaction events.",
    owner: "Growth",
    dataset_type: "source",
    source_type: "api",
    connection_id: "conn-events-api",
    api: {
      endpoint: "https://api.example.test/events",
      method: "GET",
      query_params: { limit: "100" },
      pagination: { type: "cursor", config: { cursor_param: "cursor" } },
      response_path: "data",
    },
    columns: sourceColumns,
    status: "active",
    job_type: "batch",
    import_ready: true,
    created_at: createdAt,
    updated_at: createdAt,
  };
  const targetA = {
    id: "ds-revenue-mart",
    job_id: "ds-revenue-mart",
    name: "daily_revenue_mart",
    description: "Curated daily revenue metrics by channel and customer segment.",
    owner: "Analytics",
    dataset_type: "target",
    source: { type: "postgres", table: "orders", connection_id: "conn-postgres" },
    sources: [
      { nodeId: "source-1", type: "postgres", table: "orders", name: "orders_postgres" },
      { nodeId: "source-2", type: "api", table: "events", name: "product_events_api" },
    ],
    transforms: [
      { nodeId: "transform-1", type: "filter", config: { condition: "status = 'paid'" } },
      { nodeId: "transform-2", type: "sql", config: { sql: "GROUP BY date_trunc('day', order_date)" } },
    ],
    targets: [{ nodeId: "target-1", type: "s3", config: { format: "parquet" } }],
    destination: { type: "s3", path: "s3://xflow-demo/curated/daily_revenue_mart", format: "parquet" },
    target: { type: "s3", path: "s3://xflow-demo/curated/daily_revenue_mart" },
    schema: makeColumns(),
    columns: makeColumns(),
    nodes: [
      { id: "source-1", type: "source", data: { label: "orders_postgres", schema: makeColumns() }, position: { x: 0, y: 120 } },
      { id: "transform-1", type: "transform", data: { label: "paid_orders_filter" }, position: { x: 300, y: 120 } },
      { id: "target-1", type: "target", data: { label: "daily_revenue_mart", schema: makeColumns() }, position: { x: 620, y: 120 } },
    ],
    edges: [
      { id: "edge-1", source: "source-1", target: "transform-1" },
      { id: "edge-2", source: "transform-1", target: "target-1" },
    ],
    schedule: "0 8 * * *",
    schedule_frequency: "daily",
    job_type: "batch",
    status: "active",
    is_active: true,
    import_ready: true,
    size_bytes: 384829440,
    actual_size_bytes: 384829440,
    row_count: 1284000,
    format: "PARQUET",
    tags: ["revenue", "curated", "daily"],
    created_at: createdAt,
    updated_at: createdAt,
  };
  const targetB = {
    id: "ds-events-stream",
    job_id: "ds-events-stream",
    name: "product_event_stream",
    description: "Near real-time product event lake table for funnel analysis.",
    owner: "Growth",
    dataset_type: "target",
    sources: [{ nodeId: "source-1", type: "api", table: "events", name: "product_events_api" }],
    transforms: [{ nodeId: "transform-1", type: "select-fields", config: { fields: ["event_id", "event_time", "user_id", "event_name"] } }],
    destination: { type: "s3", path: "s3://xflow-demo/stream/product_event_stream", format: "json" },
    target: { type: "s3", path: "s3://xflow-demo/stream/product_event_stream" },
    schema: sourceColumns,
    columns: sourceColumns,
    nodes: [
      { id: "source-1", type: "source", data: { label: "events_api", schema: sourceColumns }, position: { x: 0, y: 100 } },
      { id: "target-1", type: "target", data: { label: "product_event_stream", schema: sourceColumns }, position: { x: 360, y: 100 } },
    ],
    edges: [{ id: "edge-1", source: "source-1", target: "target-1" }],
    schedule: null,
    schedule_frequency: null,
    job_type: "streaming",
    status: "active",
    is_active: false,
    import_ready: true,
    size_bytes: 91226112,
    actual_size_bytes: 91226112,
    row_count: 438920,
    format: "JSON",
    tags: ["events", "streaming", "product"],
    created_at: createdAt,
    updated_at: createdAt,
  };

  return {
    sessions: {},
    users: [
      {
        id: "user-ui-admin",
        email: "study@xflow.local",
        password: "study1234",
        name: "study",
        is_admin: true,
        etl_access: true,
        domain_edit_access: true,
        dataset_access: [],
        all_datasets: true,
        created_at: createdAt,
        updated_at: createdAt,
      },
    ],
    roles: [
      {
        id: "role-admin",
        name: "UI Reviewer",
        description: "Frontend-only reviewer role with full demo access.",
        dataset_etl_access: true,
        query_ai_access: true,
        dataset_access: [],
        all_datasets: true,
        created_at: createdAt,
        updated_at: createdAt,
      },
    ],
    connections: [
      {
        id: "conn-postgres",
        name: "Demo PostgreSQL",
        description: "Mock transactional PostgreSQL connection.",
        type: "postgres",
        config: { host: "postgres.local", port: 5432, database: "commerce", user: "demo" },
        status: "connected",
        created_at: createdAt,
        updated_at: createdAt,
      },
      {
        id: "conn-events-api",
        name: "Demo Events API",
        description: "Mock REST API connection.",
        type: "api",
        config: { base_url: "https://api.example.test" },
        status: "connected",
        created_at: createdAt,
        updated_at: createdAt,
      },
      {
        id: "conn-s3",
        name: "Demo S3 Lake",
        description: "Mock object storage connection.",
        type: "s3",
        config: { bucket: "xflow-demo", region: "ap-northeast-2" },
        status: "connected",
        created_at: createdAt,
        updated_at: createdAt,
      },
    ],
    sourceDatasets: [sourceA, sourceB],
    datasets: [targetA, targetB],
    domains: [
      {
        id: "domain-revenue",
        name: "Revenue Intelligence",
        type: "business",
        owner: "Analytics",
        tags: ["revenue", "catalog", "quality"],
        description: "A demo domain that groups revenue datasets and lineage for UI review.",
        docs: "This mock domain is generated in frontend-only mode.",
        nodes: targetA.nodes,
        edges: targetA.edges,
        created_at: createdAt,
        updated_at: createdAt,
      },
    ],
    jobRuns: {
      "ds-revenue-mart": [
        {
          id: "run-1001",
          dataset_id: "ds-revenue-mart",
          status: "success",
          started_at: createdAt,
          finished_at: createdAt,
          airflow_run_id: "mock_manual__1001",
        },
      ],
      "ds-events-stream": [
        {
          id: "run-1002",
          dataset_id: "ds-events-stream",
          status: "running",
          started_at: createdAt,
          finished_at: null,
          airflow_run_id: "mock_stream__1002",
        },
      ],
    },
  };
};

const loadState = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (error) {
    console.warn("Failed to load XFlow mock state", error);
  }
  const initial = seedState();
  saveState(initial);
  return initial;
};

const saveState = (state) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "X-XFlow-Mock": "true",
    },
  });

const noContent = () => new Response(null, { status: 204, headers: { "X-XFlow-Mock": "true" } });

const readJson = async (init) => {
  if (!init?.body) return {};
  try {
    return JSON.parse(init.body);
  } catch {
    return {};
  }
};

const nextId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const publicUser = (user) => ({
  user_id: user.id,
  id: user.id,
  email: user.email,
  name: user.name || user.email.split("@")[0],
  is_admin: !!user.is_admin,
  role_id: user.role_id || null,
  etl_access: !!user.etl_access,
  domain_edit_access: !!user.domain_edit_access,
  dataset_access: user.dataset_access || [],
  all_datasets: !!user.all_datasets,
  role_dataset_etl_access: true,
  role_query_ai_access: true,
});

const findById = (items, id) => items.find((item) => item.id === id || item._id === id);

const upsertById = (items, item) => {
  const index = items.findIndex((current) => current.id === item.id);
  if (index >= 0) items[index] = item;
  else items.unshift(item);
};

const catalogItems = (state) =>
  state.datasets.map((dataset) => ({
    ...dataset,
    schema: dataset.schema || dataset.columns || makeColumns(),
    columns: dataset.columns || dataset.schema || makeColumns(),
    sources: dataset.sources || [],
    size_bytes: dataset.size_bytes || dataset.actual_size_bytes || 0,
    format: dataset.format || dataset.destination?.format?.toUpperCase() || "PARQUET",
    target: dataset.target || dataset.destination,
  }));

const graphForDataset = (dataset) => ({
  nodes:
    dataset?.nodes ||
    [
      { id: "source-1", type: "source", data: { label: "source", schema: makeColumns() }, position: { x: 0, y: 100 } },
      { id: "target-1", type: "target", data: { label: dataset?.name || "target", schema: dataset?.schema || makeColumns() }, position: { x: 360, y: 100 } },
    ],
  edges: dataset?.edges || [{ id: "edge-1", source: "source-1", target: "target-1" }],
});

const sampleRows = [
  { order_id: 1001, customer_id: "C-1042", order_date: "2026-06-20", amount: 129500, status: "paid" },
  { order_id: 1002, customer_id: "C-2048", order_date: "2026-06-21", amount: 84200, status: "paid" },
  { order_id: 1003, customer_id: "C-3120", order_date: "2026-06-21", amount: 45100, status: "pending" },
];

const queryResult = () => ({
  columns: ["order_id", "customer_id", "order_date", "amount", "status"],
  rows: sampleRows,
  data: sampleRows,
  row_count: sampleRows.length,
  execution_time_ms: 38,
  page: 1,
  page_size: 1000,
  total_rows: sampleRows.length,
  total_pages: 1,
});

const previewPayload = () => ({
  columns: makeColumns(),
  schema: makeColumns(),
  preview_data: sampleRows,
  data: sampleRows,
  rows: sampleRows,
  total_rows: sampleRows.length,
});

const qualitySummary = (state) => {
  const results = state.datasets.map((dataset, index) => {
    const score = index === 0 ? 96 : 82;
    return {
      dataset_id: dataset.id,
      job_name: dataset.name,
      s3_path: dataset.destination?.path,
      overall_score: score,
      status: score >= 90 ? "healthy" : "warning",
      run_at: dataset.updated_at || now(),
      checks: [
        { name: "Row count validation", passed: true, value: dataset.row_count || 0, threshold: 1 },
        { name: "Null check", passed: score >= 90, value: score >= 90 ? 0.2 : 3.8, threshold: 5 },
      ],
    };
  });
  return {
    summary: {
      total_count: results.length,
      healthy_count: results.filter((item) => item.status === "healthy").length,
      warning_count: results.filter((item) => item.status === "warning").length,
      critical_count: 0,
      avg_score: Math.round(results.reduce((sum, item) => sum + item.overall_score, 0) / results.length),
    },
    results,
  };
};

const handleAuth = async (state, pathname, method, init) => {
  if (pathname === "/api/login" && method === "POST") {
    const body = await readJson(init);
    const user =
      state.users.find((item) => item.email === body.email && item.password === body.password) ||
      state.users[0];
    if (!user) return jsonResponse({ detail: "Invalid email or password" }, 401);
    const sessionId = `mock-session-${Date.now()}`;
    state.sessions[sessionId] = publicUser(user);
    saveState(state);
    return jsonResponse({ session_id: sessionId, user: state.sessions[sessionId] });
  }

  if (pathname === "/api/signup" && method === "POST") {
    const body = await readJson(init);
    const user = {
      id: nextId("user"),
      email: body.email,
      password: body.password || "password",
      name: body.name || body.email?.split("@")[0] || "user",
      is_admin: !!body.is_admin,
      etl_access: true,
      domain_edit_access: true,
      all_datasets: true,
      dataset_access: [],
      created_at: now(),
      updated_at: now(),
    };
    state.users.unshift(user);
    saveState(state);
    return jsonResponse({ id: user.id, email: user.email, message: "Mock user created" }, 201);
  }

  if (pathname === "/api/me") {
    return jsonResponse(publicUser(state.users[0]));
  }

  if (pathname === "/api/logout") {
    return jsonResponse({ message: "Logged out" });
  }

  return null;
};

const handleCollection = async (state, collectionName, idPrefix, id, method, init) => {
  const collection = state[collectionName];
  if (!id) {
    if (method === "GET") return jsonResponse(collection);
    if (method === "POST") {
      const body = await readJson(init);
      const item = {
        id: body.id || nextId(idPrefix),
        ...body,
        created_at: body.created_at || now(),
        updated_at: now(),
      };
      if (collectionName === "datasets") item.dataset_type = item.dataset_type || "target";
      if (collectionName === "sourceDatasets") item.dataset_type = "source";
      collection.unshift(item);
      saveState(state);
      return jsonResponse(item, 201);
    }
  }

  const item = findById(collection, id);
  if (method === "GET") return jsonResponse(item || { id, name: id, columns: makeColumns(), schema: makeColumns() });
  if (method === "PUT" || method === "PATCH") {
    const body = await readJson(init);
    const nextItem = { ...(item || { id }), ...body, id, updated_at: now() };
    upsertById(collection, nextItem);
    saveState(state);
    return jsonResponse(nextItem);
  }
  if (method === "DELETE") {
    const index = collection.findIndex((entry) => entry.id === id);
    if (index >= 0) collection.splice(index, 1);
    saveState(state);
    return jsonResponse({ message: "Deleted in frontend-only mode" });
  }
  return null;
};

const handleRequest = async (input, init = {}) => {
  const state = loadState();
  const url = new URL(typeof input === "string" ? input : input.url, window.location.origin);
  const pathname = url.pathname.replace(/\/+$/, "") || "/";
  const method = (init.method || "GET").toUpperCase();
  const segments = pathname.split("/").filter(Boolean);

  const authResponse = await handleAuth(state, pathname, method, init);
  if (authResponse) return authResponse;

  if (pathname === "/health") return jsonResponse({ status: "healthy", mode: "frontend-only" });

  if (pathname === "/api/admin/users") return handleCollection(state, "users", "user", null, method, init);
  if (segments[0] === "api" && segments[1] === "admin" && segments[2] === "users") {
    return handleCollection(state, "users", "user", segments[3], method, init);
  }
  if (pathname === "/api/admin/roles") return handleCollection(state, "roles", "role", null, method, init);
  if (segments[0] === "api" && segments[1] === "admin" && segments[2] === "roles") {
    if (segments[3] === "bulk-add-dataset") return jsonResponse({ message: "Dataset permissions updated" });
    return handleCollection(state, "roles", "role", segments[3], method, init);
  }

  if (pathname === "/api/connections") return handleCollection(state, "connections", "conn", null, method, init);
  if (segments[0] === "api" && segments[1] === "connections") {
    if (segments[2] === "test") return jsonResponse({ status: "connected", message: "Mock connection successful" });
    return handleCollection(state, "connections", "conn", segments[2], method, init);
  }

  if (segments[0] === "api" && segments[1] === "metadata") {
    if (segments[3] === "tables") return jsonResponse(["orders", "customers", "payments"]);
    if (segments[3] === "collections") return jsonResponse(["events", "sessions", "profiles"]);
    if (segments[5] === "columns") return jsonResponse(makeColumns());
  }

  if (pathname === "/api/source-datasets") {
    return handleCollection(state, "sourceDatasets", "src", null, method, init);
  }
  if (segments[0] === "api" && segments[1] === "source-datasets") {
    if (segments[2] === "kafka" && segments[3] === "topics") return jsonResponse(["product.events", "orders.cdc", "user.sessions"]);
    if (segments[2] === "kafka" && segments[3] === "schema") return jsonResponse({ columns: sourceColumns, sample: sampleRows.map((row) => ({ raw_value: JSON.stringify(row) })) });
    if (segments[3] === "preview") return jsonResponse(previewPayload());
    if (segments[2] === "api" && segments[3] === "test") {
      return jsonResponse({ success: true, columns: sourceColumns, schema: sourceColumns, data: sampleRows, preview_data: sampleRows });
    }
    return handleCollection(state, "sourceDatasets", "src", segments[2], method, init);
  }

  if (pathname === "/api/datasets") {
    return handleCollection(state, "datasets", "ds", null, method, init);
  }
  if (segments[0] === "api" && segments[1] === "datasets") {
    const dataset = findById(state.datasets, segments[2]);
    if (segments[3] === "activate" || segments[3] === "deactivate") {
      if (dataset) dataset.is_active = segments[3] === "activate";
      saveState(state);
      return jsonResponse({ message: `Mock ${segments[3]} complete`, is_active: dataset?.is_active });
    }
    if (segments[3] === "run") {
      const run = { id: nextId("run"), dataset_id: segments[2], status: "success", started_at: now(), finished_at: now() };
      state.jobRuns[segments[2]] = [run, ...(state.jobRuns[segments[2]] || [])];
      saveState(state);
      return jsonResponse(run);
    }
    if (segments[3] === "nodes" && segments[5] === "metadata") return jsonResponse({ columns: makeColumns(), sample_rows: sampleRows });
    return handleCollection(state, "datasets", "ds", segments[2], method, init);
  }

  if (pathname === "/api/catalog") return jsonResponse(catalogItems(state));
  if (segments[0] === "api" && segments[1] === "catalog") {
    const item = findById(state.datasets, segments[2]);
    if (segments[3] === "lineage") return jsonResponse(graphForDataset(item));
    if (segments[3] === "layout") {
      if (method === "GET") return jsonResponse({ nodes: item?.nodes || [] });
      return jsonResponse({ message: "Layout saved" });
    }
    if (method === "PATCH" || method === "PUT") {
      const body = await readJson(init);
      const updated = { ...(item || { id: segments[2] }), ...body, updated_at: now() };
      upsertById(state.datasets, updated);
      saveState(state);
      return jsonResponse(updated);
    }
    return jsonResponse(item || catalogItems(state)[0]);
  }

  if (pathname === "/api/domains") return handleCollection(state, "domains", "domain", null, method, init);
  if (segments[0] === "api" && segments[1] === "domains") {
    if (segments[2] === "jobs" && segments[4] === "execution") return jsonResponse(graphForDataset(findById(state.datasets, segments[3]) || state.datasets[0]));
    if (segments[2] === "jobs") return jsonResponse(state.datasets.filter((dataset) => dataset.import_ready));
    if (segments[3] === "graph") {
      const domain = findById(state.domains, segments[2]);
      return jsonResponse({ nodes: domain?.nodes || graphForDataset(state.datasets[0]).nodes, edges: domain?.edges || graphForDataset(state.datasets[0]).edges });
    }
    if (segments[3] === "files" || segments[4] === "download") return jsonResponse([]);
    return handleCollection(state, "domains", "domain", segments[2], method, init);
  }

  if (segments[0] === "api" && segments[1] === "job-runs") {
    if (segments[2] === "bulk") {
      const ids = (url.searchParams.get("dataset_ids") || "").split(",").filter(Boolean);
      const grouped = {};
      ids.forEach((id) => {
        grouped[id] = state.jobRuns[id] || [];
      });
      return jsonResponse(grouped);
    }
    const datasetId = url.searchParams.get("dataset_id");
    if (datasetId) return jsonResponse(state.jobRuns[datasetId] || []);
    return jsonResponse(Object.values(state.jobRuns).flat());
  }

  if (segments[0] === "api" && segments[1] === "streaming") {
    return jsonResponse({ status: "stopped", message: "Mock streaming action skipped" });
  }
  if (segments[0] === "api" && segments[1] === "cdc") {
    return jsonResponse({ status: "inactive", message: "Mock CDC action skipped" });
  }

  if (segments[0] === "api" && segments[1] === "quality") {
    if (segments[2] === "dashboard" && segments[3] === "summary") return jsonResponse(qualitySummary(state));
    if (segments[3] === "run") return jsonResponse(qualitySummary(state).results[0]);
    if (segments[3] === "latest") return jsonResponse(qualitySummary(state).results[0]);
    if (segments[3] === "history") return jsonResponse(qualitySummary(state).results);
  }

  if (segments[0] === "api" && segments[1] === "opensearch") {
    if (segments[2] === "status") return jsonResponse({ status: "mocked", indexed_count: catalogItems(state).length });
    if (segments[2] === "search") return jsonResponse({ results: catalogItems(state), total: catalogItems(state).length });
    return jsonResponse({ message: "Mock OpenSearch action skipped" });
  }

  if (segments[0] === "api" && segments[1] === "ai") {
    if (segments[2] === "health") return jsonResponse({ status: "mocked" });
    if (segments[2] === "generate-sql") {
      return jsonResponse({ sql: "SELECT order_date, SUM(amount) AS revenue FROM daily_revenue_mart GROUP BY order_date ORDER BY order_date DESC LIMIT 10;" });
    }
    if (segments[2] === "search-schema") return jsonResponse({ results: catalogItems(state) });
  }

  if (segments[0] === "api" && (segments[1] === "duckdb" || segments[1] === "trino" || segments[1] === "sql")) {
    if (segments[1] === "sql" && segments[2] === "test") {
      return jsonResponse({
        valid: true,
        schema: makeColumns(),
        before_sample: sampleRows,
        after_sample: sampleRows,
        preview_data: sampleRows,
      });
    }
    if (segments.includes("catalogs")) {
      if (segments.length <= 3) return jsonResponse(["memory", "iceberg", "postgres"]);
      if (segments.length <= 5) return jsonResponse(["public", "analytics"]);
      if (segments.length <= 7) return jsonResponse(["daily_revenue_mart", "product_event_stream"]);
      if (segments[segments.length - 1] === "schema") return jsonResponse(makeColumns());
      if (segments[segments.length - 1] === "preview") return jsonResponse(queryResult());
    }
    if (segments[2] === "buckets") {
      if (segments.length === 3) return jsonResponse(["xflow-demo", "analytics-sandbox"]);
      return jsonResponse([{ key: "curated/daily_revenue_mart/part-000.parquet", size: 2481200, type: "file" }]);
    }
    if (segments[2] === "schema") return jsonResponse(makeColumns());
    return jsonResponse(queryResult());
  }

  if (segments[0] === "api" && segments[1]?.startsWith("s3-")) {
    return jsonResponse(previewPayload());
  }
  if (segments[0] === "api" && segments[1] === "logs") {
    if (segments[2] === "health") return jsonResponse({ status: "mocked" });
    if (segments[2] === "schema") return jsonResponse({ columns: sourceColumns });
    return jsonResponse(previewPayload());
  }
  if (segments[0] === "api" && segments[1] === "rdb-transform") {
    return jsonResponse({ id: nextId("transform"), columns: makeColumns(), preview_data: sampleRows });
  }

  if (method === "GET") return jsonResponse([]);
  if (method === "DELETE") return noContent();
  return jsonResponse({ id: nextId("mock"), ...(await readJson(init)), updated_at: now() });
};

const isApiRequest = (input) => {
  const url = new URL(typeof input === "string" ? input : input.url, window.location.origin);
  return url.pathname === "/health" || url.pathname.startsWith("/api") || url.pathname.startsWith("/users");
};

export const setupMockApi = () => {
  if (import.meta.env[FRONTEND_ONLY_FLAG] !== "true") return;
  if (window.__xflowMockApiInstalled) return;

  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    if (!isApiRequest(input)) return nativeFetch(input, init);
    await new Promise((resolve) => window.setTimeout(resolve, 150));
    return handleRequest(input, init);
  };

  window.__xflowMockApiInstalled = true;
  window.__xflowMockStateReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    return loadState();
  };

  console.info("XFlow frontend-only mock API enabled");
};
