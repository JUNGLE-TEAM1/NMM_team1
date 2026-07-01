export function Button({
  children,
  className = "",
  danger = false,
  icon: Icon,
  variant = "ghost",
  ...props
}) {
  const variantClass = variant === "primary" ? "primary-action" : "ghost-action";
  const dangerClass = danger ? "danger-action" : "";
  const classes = [variantClass, dangerClass, className].filter(Boolean).join(" ");

  return (
    <button type="button" className={classes} {...props}>
      {Icon ? <Icon size={16} /> : null}
      {children}
    </button>
  );
}
