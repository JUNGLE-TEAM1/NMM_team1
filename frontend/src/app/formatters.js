export function formatMetric(value, fallback = "-") {
  return value === null || value === undefined || value === "" ? fallback : String(value);
}

export function formatBytes(value) {
  if (typeof value !== "number") return value;
  if (value >= 1024 ** 3) return `${(value / 1024 ** 3).toFixed(2)} GiB`;
  if (value >= 1024 ** 2) return `${(value / 1024 ** 2).toFixed(1)} MiB`;
  if (value >= 1024) return `${(value / 1024).toFixed(1)} KiB`;
  return `${value} B`;
}
