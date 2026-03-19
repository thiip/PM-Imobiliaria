"use client";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, ShoppingCart, Receipt, Map, Wallet, Users,
  Building2, ChevronLeft, ChevronRight, Menu, X
} from "lucide-react";
import Dashboard from "./components/Dashboard";
import Vendas from "./components/Vendas";
import Parcelas from "./components/Parcelas";
import MapaLotes from "./components/MapaLotes";
import Despesas from "./components/Despesas";
import Retiradas from "./components/Retiradas";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "vendas", label: "Vendas", icon: ShoppingCart },
  { id: "parcelas", label: "Parcelas", icon: Receipt },
  { id: "mapa", label: "Mapa de Lotes", icon: Map },
  { id: "despesas", label: "Despesas", icon: Wallet },
  { id: "retiradas", label: "Retiradas", icon: Users },
];

export default function Home() {
  const [active, setActive] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleNav = (id: string) => {
    setActive(id);
    if (isMobile) setMobileOpen(false);
  };

  const renderPage = () => {
    switch (active) {
      case "dashboard": return <Dashboard />;
      case "vendas": return <Vendas />;
      case "parcelas": return <Parcelas />;
      case "mapa": return <MapaLotes />;
      case "despesas": return <Despesas />;
      case "retiradas": return <Retiradas />;
      default: return <Dashboard />;
    }
  };

  const activeLabel = navItems.find(n => n.id === active)?.label || "Dashboard";

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg-primary)" }}>
      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div className="sidebar-overlay visible" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`app-sidebar ${mobileOpen ? "mobile-open" : ""}`}
        style={{
          width: collapsed && !isMobile ? 72 : 260,
          minWidth: collapsed && !isMobile ? 72 : 260,
          background: "var(--bg-secondary)",
          borderRight: "1px solid var(--border-color)",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: collapsed && !isMobile ? "12px 8px" : "16px 16px",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 72,
          }}
        >
          {collapsed && !isMobile ? (
            <img src="/logo-transparent.png" alt="PM" style={{ width: 42, height: 42, objectFit: "contain", flexShrink: 0 }} />
          ) : (
            <img src="/logo-transparent.png" alt="Padilha Madeira" style={{ width: "100%", maxWidth: 200, height: "auto", objectFit: "contain" }} />
          )}
          {/* Close button on mobile */}
          {isMobile && (
            <button
              onClick={() => setMobileOpen(false)}
              style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: 4 }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav style={{ padding: "16px 12px", flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
          {(!collapsed || isMobile) && (
            <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "8px 16px" }}>
              Menu Principal
            </div>
          )}
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`sidebar-link ${active === item.id ? "active" : ""}`}
              style={{ justifyContent: collapsed && !isMobile ? "center" : "flex-start", padding: collapsed && !isMobile ? "12px" : "12px 16px" }}
              title={collapsed && !isMobile ? item.label : undefined}
            >
              <item.icon size={20} />
              {(!collapsed || isMobile) && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Collapse button (desktop only) */}
        {!isMobile && (
          <div style={{ padding: "12px", borderTop: "1px solid var(--border-color)" }}>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="sidebar-link"
              style={{ justifyContent: collapsed ? "center" : "flex-start", width: "100%", padding: collapsed ? "12px" : "12px 16px" }}
            >
              {collapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /><span>Recolher</span></>}
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        {/* Mobile header */}
        <div className="mobile-header">
          <button className="hamburger" onClick={() => setMobileOpen(true)}>
            <Menu size={24} />
          </button>
          <img src="/logo-transparent.png" alt="PM" style={{ width: 32, height: 32, objectFit: "contain", flexShrink: 0 }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
            {activeLabel}
          </span>
        </div>

        <main style={{ flex: 1, overflow: "auto", background: "var(--bg-primary)" }}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
