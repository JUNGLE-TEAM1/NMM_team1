import { useEffect, useState } from "react";

import { getHealth } from "../api/asklakeClient";
import { StatusPill } from "../components/StatusPill";
import { SourceCatalog } from "../features/catalog/SourceCatalog";
import { Week2M5Demo } from "../features/week2";
import "./styles.css";

export function App() {
  const [health, setHealth] = useState({ state: "loading", message: "확인 중" });

  useEffect(() => {
    refreshHealth();
  }, []);

  async function refreshHealth() {
    try {
      const payload = await getHealth();
      setHealth({ state: "ok", message: `${payload.service} ${payload.status}` });
    } catch (error) {
      setHealth({ state: "error", message: error.message });
    }
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <div className="title-row">
          <div>
            <p className="eyebrow">AskLake M4</p>
            <h1>Pipeline Run</h1>
          </div>
          <StatusPill health={health} />
        </div>

        <Week2M5Demo />
        <SourceCatalog />
      </section>
    </main>
  );
}
