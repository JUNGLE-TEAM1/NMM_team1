export function makeDemoSourceName() {
  return `sample_orders_${demoSuffix()}`;
}

export function makePipelineForm(sourceName = "orders") {
  const suffix = demoSuffix();
  const baseName = sourceName.replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 42) || "orders";
  return {
    name: `${baseName}_pipeline_${suffix}`,
    selectFields: "",
    targetName: `${baseName}_result_${suffix}`,
  };
}

function demoSuffix() {
  return Date.now().toString(36).slice(-6);
}
