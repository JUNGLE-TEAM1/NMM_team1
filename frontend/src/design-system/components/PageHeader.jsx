import { Button } from "./Button";

export function PageHeader({ title, body, actionLabel, onAction }) {
  return (
    <header className="page-header">
      <div>
        <h2>{title}</h2>
        <p>{body}</p>
      </div>
      {actionLabel ? (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </header>
  );
}
