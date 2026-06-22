import { useEffect, useState } from "react";
import { Activity, Database, GitBranch, Server } from "lucide-react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function App() {
  const [health, setHealth] = useState({ state: "loading", message: "확인 중" });

  useEffect(() => {
    let isMounted = true;

    fetch(`${apiBaseUrl}/api/health`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      })
      .then((payload) => {
        if (isMounted) {
          setHealth({ state: "ok", message: `${payload.service} ${payload.status}` });
        }
      })
      .catch((error) => {
        if (isMounted) {
          setHealth({ state: "error", message: error.message });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const statusLabel = health.state === "ok" ? "정상" : health.state === "error" ? "확인 필요" : "확인 중";

  return (
    <main className="app-shell">
      <section className="workspace">
        <div className="title-row">
          <div>
            <p className="eyebrow">AskLake MVP</p>
            <h1>데이터 파이프라인 작업대</h1>
          </div>
          <div className={`status-pill ${health.state}`}>
            <Activity size={18} aria-hidden="true" />
            <span>{statusLabel}</span>
          </div>
        </div>

        <div className="pipeline-strip" aria-label="MVP pipeline">
          <div className="stage">
            <Database size={24} aria-hidden="true" />
            <strong>Source</strong>
            <span>CSV 또는 DB 후보</span>
          </div>
          <div className="connector" />
          <div className="stage">
            <GitBranch size={24} aria-hidden="true" />
            <strong>Transform</strong>
            <span>선택과 필터</span>
          </div>
          <div className="connector" />
          <div className="stage">
            <Server size={24} aria-hidden="true" />
            <strong>Catalog</strong>
            <span>결과와 상태</span>
          </div>
        </div>

        <section className="health-panel" aria-label="Backend health">
          <div>
            <h2>Backend health</h2>
            <p>{health.message}</p>
          </div>
          <code>{apiBaseUrl}/api/health</code>
        </section>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
