import { useEffect, useMemo, useState } from "react";

import { getHealth } from "../api/asklakeClient";
import { SourcesPage } from "../features/datasets/SourcesPage";
import { AppShell } from "./AppShell";
import {
  AiQueryPage,
  AdminPlaceholder,
  CatalogDetailShell,
  CatalogPage,
  DashboardPlaceholder,
  JobRunsPage,
  VisualEditorPage,
} from "./AppPages";
import {
  dataViewForPath,
  navItems,
  normalizePath,
  routeToUrl,
} from "./routes";
import "./styles.css";

export function App() {
  const initialPath = normalizePath(window.location.pathname);
  const [health, setHealth] = useState({ state: "loading", message: "확인 중" });
  const [activePath, setActivePath] = useState(() => initialPath);
  const [expandedNav, setExpandedNav] = useState(() => ({
    datasets: normalizePath(window.location.pathname).startsWith("/datasets"),
    jobs: normalizePath(window.location.pathname).startsWith("/jobs"),
  }));
  const [notice, setNotice] = useState("");
  const [isNoticeLeaving, setIsNoticeLeaving] = useState(false);
  const [pendingDatasetEdit, setPendingDatasetEdit] = useState(null);
  const [focusedCatalogDatasetId, setFocusedCatalogDatasetId] = useState("");

  useEffect(() => {
    refreshHealth();
    const canonicalUrl = routeToUrl(initialPath);
    if (window.location.pathname !== canonicalUrl) {
      window.history.replaceState({}, "", canonicalUrl);
    }
  }, []);

  useEffect(() => {
    const onPopState = () => setActivePath(normalizePath(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (!notice) return undefined;

    setIsNoticeLeaving(false);
    const fadeTimer = window.setTimeout(() => setIsNoticeLeaving(true), 2400);
    const clearTimer = window.setTimeout(() => {
      setNotice("");
      setIsNoticeLeaving(false);
    }, 2850);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(clearTimer);
    };
  }, [notice]);

  async function refreshHealth() {
    setHealth({ state: "loading", message: "확인 중" });
    try {
      const payload = await getHealth();
      setHealth({ state: "ok", message: `${payload.service} ${payload.status}` });
    } catch (error) {
      setHealth({ state: "error", message: error.message });
    }
  }

  function navigate(path, options = {}) {
    const nextPath = normalizePath(path);
    const displayPath = path.startsWith("/catalog/") ? path : routeToUrl(nextPath);
    if (options.pendingDatasetEdit) {
      setPendingDatasetEdit(options.pendingDatasetEdit);
    }
    if (options.focusCatalogDatasetId) {
      setFocusedCatalogDatasetId(options.focusCatalogDatasetId);
    }
    window.history.pushState({}, "", displayPath);
    setActivePath(nextPath);
  }

  const activeItem = useMemo(() => navItems.find((item) => activePath === item.path || item.children?.some((child) => child.path === activePath)) || navItems[0], [activePath]);
  const activeDataView = dataViewForPath(activePath);

  function toggleNavItem(item) {
    if (!item.children?.length) {
      navigate(item.path);
      return;
    }

    const navKey = item.path.split("/")[1];
    setExpandedNav((current) => ({ ...current, [navKey]: !current[navKey] }));
    if (!activePath.startsWith(`/${navKey}`)) {
      navigate(item.path);
    }
  }

  return (
    <AppShell
      activeItem={activeItem}
      activePath={activePath}
      expandedNav={expandedNav}
      health={health}
      isNoticeLeaving={isNoticeLeaving}
      navItems={navItems}
      notice={notice}
      onClearNotice={() => {
        setNotice("");
        setIsNoticeLeaving(false);
      }}
      onNavigate={navigate}
      onRefreshHealth={refreshHealth}
      onToggleNavItem={toggleNavItem}
    >
      {activeDataView ? (
        <SourcesPage
          navigate={navigate}
          setNotice={setNotice}
          dataView={activeDataView}
          pendingDatasetEdit={pendingDatasetEdit}
          onPendingDatasetEditConsumed={() => setPendingDatasetEdit(null)}
        />
      ) : null}
      {activePath === "/etl-visual" ? <VisualEditorPage navigate={navigate} setNotice={setNotice} /> : null}
      {activePath === "/runs" ? <JobRunsPage setNotice={setNotice} /> : null}
      {activePath === "/catalog" ? <CatalogPage navigate={navigate} focusedCatalogDatasetId={focusedCatalogDatasetId} /> : null}
      {activePath === "/catalog-detail" ? <CatalogDetailShell navigate={navigate} /> : null}
      {activePath === "/ask" ? <AiQueryPage navigate={navigate} setNotice={setNotice} /> : null}
      {activePath === "/dashboard" ? <DashboardPlaceholder /> : null}
      {activePath === "/admin" ? <AdminPlaceholder /> : null}
    </AppShell>
  );
}
