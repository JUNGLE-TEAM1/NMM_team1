import {
  Database,
  LayoutDashboard,
  MessageSquareText,
  Play,
  ServerCog,
  Workflow,
} from "lucide-react";

import { WEEK2_DEFAULT_DATASET_ID } from "../api/asklakeClient";

export const WEEK2_DEFAULT_CATALOG_DETAIL_URL = `/catalog/${WEEK2_DEFAULT_DATASET_ID}`;

export const navItems = [
  {
    path: "/connections",
    label: "연결",
    description: "External",
    icon: ServerCog,
  },
  {
    path: "/datasets/source",
    label: "데이터셋",
    description: "Source / Silver / Gold",
    icon: Database,
    children: [
      {
        path: "/datasets/source",
        label: "Source Datasets",
      },
      {
        path: "/datasets/silver",
        label: "Silver Datasets",
      },
      {
        path: "/datasets/gold",
        label: "Gold Datasets",
      },
    ],
  },
  {
    path: "/jobs/silver-transform",
    label: "작업",
    description: "Sync / Transform / Build",
    icon: Workflow,
    children: [
      {
        path: "/jobs/connection-sync",
        label: "Connection Sync Jobs",
      },
      {
        path: "/jobs/silver-transform",
        label: "Silver Transform Jobs",
      },
      {
        path: "/jobs/gold-build",
        label: "Gold Build Jobs",
      },
    ],
  },
  {
    path: "/runs",
    label: "실행 기록",
    description: "Job Runs",
    icon: Play,
  },
  {
    path: "/catalog",
    label: "데이터 카탈로그",
    description: "Catalog",
    icon: LayoutDashboard,
  },
  {
    path: "/ask",
    label: "AI Query",
    description: "Ask / SQL",
    icon: MessageSquareText,
  },
];

export const routeEntries = [
  { path: "/connections", kind: "dataset-workspace", dataView: "connections" },
  { path: "/datasets/source", kind: "dataset-workspace", dataView: "datasets-source" },
  { path: "/datasets/silver", kind: "dataset-workspace", dataView: "datasets-silver" },
  { path: "/datasets/gold", kind: "dataset-workspace", dataView: "datasets-gold" },
  { path: "/jobs/connection-sync", kind: "dataset-workspace", dataView: "jobs-connection" },
  { path: "/jobs/silver-transform", kind: "dataset-workspace", dataView: "jobs-silver" },
  { path: "/jobs/gold-build", kind: "dataset-workspace", dataView: "jobs-gold" },
  { path: "/etl-visual", kind: "standalone" },
  { path: "/runs", kind: "standalone" },
  { path: "/catalog", kind: "standalone" },
  { path: "/catalog-detail", kind: "standalone" },
  { path: "/ask", kind: "standalone" },
  { path: "/dashboard", kind: "standalone" },
  { path: "/admin", kind: "standalone" },
];

export const datasetWorkspaceRoutes = routeEntries.filter((route) => route.kind === "dataset-workspace");

export function dataViewForPath(path) {
  return datasetWorkspaceRoutes.find((route) => route.path === path)?.dataView || "";
}

export function normalizePath(pathname) {
  if (pathname === "/" || pathname === "" || pathname === "/dataset" || pathname === "/sources") return "/datasets/source";
  if (pathname === "/datasets") return "/datasets/source";
  if (pathname === "/jobs") return "/jobs/silver-transform";
  if (pathname === "/schema-preview") return "/datasets/source";
  if (pathname === "/etl/visual" || pathname === "/etl-visual") return "/etl-visual";
  if (pathname === "/etl") return "/runs";
  if (pathname === "/query") return "/ask";
  if (pathname.startsWith("/catalog/")) return "/catalog-detail";

  const supportedPaths = routeEntries.map((route) => route.path);
  return supportedPaths.includes(pathname) ? pathname : "/datasets/source";
}

export function routeToUrl(path) {
  if (path === "/sources") return "/datasets/source";
  if (path === "/etl-visual") return "/etl/visual";
  if (path === "/runs") return "/runs";
  if (path === "/ask") return "/query";
  if (path === "/catalog-detail") return WEEK2_DEFAULT_CATALOG_DETAIL_URL;
  return path;
}
