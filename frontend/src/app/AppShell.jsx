import { useState } from "react";
import {
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import asklakeLogo from "../assets/asklake-logo.png";
import { StatusPill } from "../components/StatusPill";
import { ToastNotice } from "../design-system";

function AiCopilotDock({ isOpen, onClose }) {
  return (
    <aside className={`ai-copilot-dock ${isOpen ? "open" : ""}`} aria-hidden={!isOpen}>
      <header>
        <div className="copilot-icon">
          <Sparkles size={16} />
        </div>
        <div>
          <strong>AI 도우미</strong>
          <span>자연어 SQL 변환</span>
        </div>
        <button type="button" className="copilot-close" onClick={onClose} aria-label="AI 도우미 닫기">
          <X size={18} />
        </button>
      </header>
      <div className="copilot-empty">
        <div className="copilot-large-icon">
          <Sparkles size={26} />
        </div>
        <h3>AI SQL 도우미</h3>
        <p>자연어로 데이터에 대해 질문하면 SQL 쿼리를 생성합니다.</p>
        <button type="button">"품질 위험 점수가 높은 상품을 보여줘"</button>
        <button type="button">"부정 리뷰와 배송 지연이 함께 증가한 카테고리는?"</button>
        <button type="button">"전환율이 떨어진 상품의 근거 데이터를 요약해줘"</button>
      </div>
    </aside>
  );
}

export function AppShell({
  activeItem,
  activePath,
  children,
  expandedNav,
  health,
  isNoticeLeaving,
  navItems,
  notice,
  onClearNotice,
  onNavigate,
  onRefreshHealth,
  onToggleNavItem,
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  return (
    <main className={`m1-shell ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="shell-sidebar" aria-label="AskLake M1 navigation">
        <div className="brand-block">
          <img className="brand-logo" src={asklakeLogo} alt="AskLake" />
        </div>

        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const navKey = item.path.split("/")[1];
            const isExpanded = Boolean(expandedNav[navKey]);
            const isActive = activeItem.path === item.path || item.children?.some((child) => child.path === activePath);

            return (
              <div className={`nav-group ${isExpanded ? "expanded" : ""}`} key={item.path}>
                <button
                  type="button"
                  className={`nav-item ${isActive ? "active" : ""}`}
                  onClick={() => onToggleNavItem(item)}
                  aria-current={!item.children?.length && isActive ? "page" : undefined}
                  aria-expanded={item.children?.length ? isExpanded : undefined}
                >
                  <Icon size={18} />
                  <span>
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
                  </span>
                  {item.children?.length ? <ChevronRight className="nav-chevron" size={15} /> : null}
                </button>
                {item.children?.length && isExpanded ? (
                  <div className="nav-sublist" aria-label={`${item.label} 하위 메뉴`}>
                    {item.children.map((child) => {
                      const isChildActive = activePath === child.path;
                      return (
                        <button
                          key={child.path}
                          type="button"
                          className={`nav-subitem ${isChildActive ? "active" : ""}`}
                          onClick={() => onNavigate(child.path)}
                          aria-current={isChildActive ? "page" : undefined}
                        >
                          {child.label}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <button type="button" className="logout-button">
          <LogOut size={16} />
          로그아웃
        </button>
      </aside>

      <section className="shell-main">
        <button
          type="button"
          className="collapse-button"
          aria-label={isSidebarCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
          aria-pressed={isSidebarCollapsed}
          onClick={() => setIsSidebarCollapsed((current) => !current)}
        >
          {isSidebarCollapsed ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
        </button>
        <header className="topbar">
          <div className="topbar-search">
            <Search size={18} />
            <span>데이터셋, source, schema 검색...</span>
            <kbd>/</kbd>
          </div>
          <div className="topbar-actions">
            <button type="button" className="refresh-button" onClick={onRefreshHealth}>
              <RefreshCw size={16} />
              Health
            </button>
            <StatusPill health={health} />
            <div className="user-chip" aria-label="Current shell user">
              <span>S</span>
            </div>
            <div className="user-meta">
              <strong>study</strong>
              <span>관리자</span>
            </div>
            <button
              type="button"
              className="copilot-toggle"
              onClick={() => setIsCopilotOpen((current) => !current)}
              aria-pressed={isCopilotOpen}
            >
              <Sparkles size={16} />
              AI 도우미
            </button>
          </div>
        </header>

        <section className="page-surface">
          {notice ? (
            <ToastNotice message={notice} isLeaving={isNoticeLeaving} onClose={onClearNotice} />
          ) : null}
          {children}
        </section>
        <AiCopilotDock isOpen={isCopilotOpen} onClose={() => setIsCopilotOpen(false)} />
      </section>
    </main>
  );
}
