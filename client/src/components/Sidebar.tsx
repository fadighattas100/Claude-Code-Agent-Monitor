/**
 * @file Sidebar.tsx
 * @description Defines the Sidebar component that provides navigation links to different sections of the application, displays the connection status, and includes a toggle button for collapsing or expanding the sidebar. The component uses React Router's NavLink for navigation and Lucide icons for visual representation. The collapsed state of the sidebar is stored in localStorage to persist user preferences across sessions.
 * @author Son Nguyen <hoangson091104@gmail.com>
 */

import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Columns3,
  FolderOpen,
  Activity,
  BarChart3,
  Workflow,
  Settings,
  Wifi,
  WifiOff,
  Github,
  Globe,
  PanelLeftClose,
  PanelLeftOpen,
  Languages,
} from "lucide-react";

const NAV_KEYS = [
  { to: "/", icon: LayoutDashboard, key: "nav:dashboard" },
  { to: "/kanban", icon: Columns3, key: "nav:agentBoard" },
  { to: "/sessions", icon: FolderOpen, key: "nav:sessions" },
  { to: "/activity", icon: Activity, key: "nav:activityFeed" },
  { to: "/analytics", icon: BarChart3, key: "nav:analytics" },
  { to: "/workflows", icon: Workflow, key: "nav:workflows" },
  { to: "/settings", icon: Settings, key: "nav:settings" },
] as const;

const STORAGE_KEY = "sidebar-collapsed";

function loadCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

interface SidebarProps {
  wsConnected: boolean;
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ wsConnected, collapsed, onToggle }: SidebarProps) {
  const { t, i18n } = useTranslation();

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === "zh" ? "en" : "zh");
  };

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 bg-surface-1 border-r border-border flex flex-col z-30 overflow-y-auto overflow-x-hidden transition-[width] duration-200 ${
        collapsed ? "w-[4.25rem]" : "w-60"
      }`}
    >
      {/* Brand */}
      <div className="px-3 py-4 border-b border-border">
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3 px-2"}`}>
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
            <Activity className="w-4 h-4 text-accent" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-gray-100 truncate">{t("nav:brand")}</h1>
              <p className="text-[11px] text-gray-500">{t("nav:brandSub")}</p>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-1">
        {NAV_KEYS.map(({ to, icon: Icon, key }) => {
          const label = t(key);
          return (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"
                } ${
                  isActive
                    ? "bg-accent/10 text-accent border border-accent/20"
                    : "text-gray-400 hover:text-gray-200 hover:bg-surface-3 border border-transparent"
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="px-2 py-2">
        <button
          onClick={onToggle}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-gray-300 hover:bg-surface-3 transition-colors"
          title={collapsed ? t("nav:expand") : t("nav:collapse")}
        >
          {collapsed ? (
            <PanelLeftOpen className="w-4 h-4 flex-shrink-0 mx-auto" />
          ) : (
            <>
              <PanelLeftClose className="w-4 h-4 flex-shrink-0" />
              <span>{t("nav:collapseShort")}</span>
            </>
          )}
        </button>
      </div>

      {/* Footer */}
      <div
        className={`px-3 py-3 border-t border-border space-y-2 ${collapsed ? "items-center" : ""}`}
      >
        <div className={`flex items-center text-xs ${collapsed ? "justify-center" : "gap-2"}`}>
          {wsConnected ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              {!collapsed && <span className="text-emerald-400">{t("nav:live")}</span>}
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
              {!collapsed && <span className="text-gray-500">{t("nav:disconnected")}</span>}
            </>
          )}
          {!collapsed && <span className="ml-auto text-gray-600">v1.0.0</span>}
        </div>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLang}
              className="text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1 text-[11px]"
              title={i18n.language === "zh" ? "Switch to English" : "切换为中文"}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{i18n.language === "zh" ? "EN" : "中文"}</span>
            </button>
            <a
              href="https://github.com/hoangsonww"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-300 transition-colors"
              title="GitHub"
            >
              <Github className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://sonnguyenhoang.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1 text-[11px]"
              title="sonnguyenhoang.com"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>sonnguyenhoang.com</span>
            </a>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center gap-2">
            <button
              onClick={toggleLang}
              className="text-gray-500 hover:text-gray-300 transition-colors"
              title={i18n.language === "zh" ? "Switch to English" : "切换为中文"}
            >
              <Languages className="w-3.5 h-3.5" />
            </button>
            <a
              href="https://github.com/hoangsonww"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-300 transition-colors"
              title="GitHub"
            >
              <Github className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://sonnguyenhoang.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-300 transition-colors"
              title="sonnguyenhoang.com"
            >
              <Globe className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </aside>
  );
}

export { STORAGE_KEY as SIDEBAR_STORAGE_KEY, loadCollapsed };
