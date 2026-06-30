export function Badge({ children, tone = "slate", className = "" }) {
  const classes = ["badge", tone, className].filter(Boolean).join(" ");
  return <span className={classes}>{children}</span>;
}
