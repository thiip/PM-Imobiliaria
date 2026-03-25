"use client";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, ShoppingCart, Receipt, Map, Wallet, Users,
  Building2, ChevronLeft, ChevronRight, Menu, X, Lock, Eye, EyeOff, LogOut, User,
  MoreHorizontal, Bell, Calendar
} from "lucide-react";
import Dashboard from "./components/Dashboard";
import Vendas from "./components/Vendas";
import Parcelas from "./components/Parcelas";
import MapaLotes from "./components/MapaLotes";
import Despesas from "./components/Despesas";
import Retiradas from "./components/Retiradas";
import Calendario from "./components/Calendario";

const USUARIOS = [
  { usuario: "Rosiane", senha: "153045" },
  { usuario: "Thiago", senha: "153045" },
  { usuario: "Kaio", senha: "153045" },
  { usuario: "Felipe", senha: "153045" },
  { usuario: "Giovani", senha: "153045" },
];

const navItems = [
  { id: "dashboard", label: "Painel", icon: LayoutDashboard },
  { id: "vendas", label: "Vendas", icon: ShoppingCart },
  { id: "parcelas", label: "Parcelas", icon: Receipt },
  { id: "mapa", label: "Mapa de Lotes", icon: Map },
  { id: "despesas", label: "Despesas", icon: Wallet },
  { id: "retiradas", label: "Retiradas", icon: Users },
];

function LoginScreen({ onLogin }: { onLogin: (nome: string) => void }) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");

    setTimeout(() => {
      const found = USUARIOS.find(
        u => u.usuario.toLowerCase() === usuario.trim().toLowerCase() && u.senha === senha
      );
      if (found) {
        onLogin(found.usuario);
      } else {
        setErro("Usuário ou senha incorretos");
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100vh", background: "var(--bg-primary)",
      padding: 20,
    }}>
      <div style={{
        width: "100%", maxWidth: 420,
        background: "rgba(255,255,255,0.035)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        borderRadius: 24,
        border: "1px solid rgba(255,255,255,0.07)",
        padding: "48px 40px",
        boxShadow: "0 25px 60px rgba(0,0,0,0.45)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <img
            src="/logo-full.png"
            alt="Padilha Madeira"
            style={{ width: 84, height: "auto", objectFit: "contain", marginBottom: 20, display: "block", margin: "0 auto 20px auto" }}
          />
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Loteamento Vista Alegre
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Usuário */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
              Usuário
            </label>
            <div style={{ position: "relative" }}>
              <User size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text"
                value={usuario}
                onChange={(e) => { setUsuario(e.target.value); setErro(""); }}
                placeholder="Digite seu usuário"
                autoFocus
                autoComplete="username"
                style={{
                  width: "100%", padding: "14px 16px 14px 40px",
                  borderRadius: 12,
                  border: erro ? "2px solid #EF4444" : "1px solid var(--border-color)",
                  background: "var(--bg-primary)", color: "var(--text-primary)",
                  fontSize: 14, outline: "none", boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
              />
            </div>
          </div>

          {/* Senha */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
              Senha
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type={showSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => { setSenha(e.target.value); setErro(""); }}
                placeholder="Digite sua senha"
                autoComplete="current-password"
                style={{
                  width: "100%", padding: "14px 48px 14px 40px",
                  borderRadius: 12,
                  border: erro ? "2px solid #EF4444" : "1px solid var(--border-color)",
                  background: "var(--bg-primary)", color: "var(--text-primary)",
                  fontSize: 14, outline: "none", boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
              />
              <button
                type="button"
                onClick={() => setShowSenha(!showSenha)}
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4,
                }}
              >
                {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Erro */}
          {erro && (
            <div style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 10, padding: "10px 14px", marginBottom: 16,
              fontSize: 12, color: "#EF4444", fontWeight: 500, textAlign: "center",
            }}>
              {erro}
            </div>
          )}

          {/* Botão */}
          <button
            type="submit"
            disabled={loading || !usuario.trim() || !senha.trim()}
            style={{
              width: "100%", padding: "14px",
              borderRadius: 12, border: "none",
              background: loading || !usuario.trim() || !senha.trim() ? "rgba(16,185,129,0.4)" : "var(--accent-emerald)",
              color: "#fff", fontSize: 14, fontWeight: 700,
              cursor: loading ? "wait" : "pointer",
              transition: "all 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {loading ? (
              <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            ) : (
              <>Entrar</>
            )}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)", marginTop: 24 }}>
          Padilha Madeira Empreendimentos
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function Home() {
  const [loggedUser, setLoggedUser] = useState<string | null>(null);
  const [active, setActive] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('erp_logged_user');
    if (stored) setLoggedUser(stored);
    setHydrated(true);
  }, []);

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
      case "calendario": return <Calendario />;
      default: return <Dashboard />;
    }
  };

  const activeLabel = active === "calendario" ? "Calendário" : (navItems.find(n => n.id === active)?.label || "Dashboard");

  const handleLogout = () => {
    localStorage.removeItem('erp_logged_user');
    setLoggedUser(null);
    setActive("dashboard");
  };

  if (!hydrated) return null;

  if (!loggedUser) {
    return <LoginScreen onLogin={(nome) => { localStorage.setItem('erp_logged_user', nome); setLoggedUser(nome); }} />;
  }

  const bottomNavItems = navItems.slice(0, 4); // Painel, Vendas, Parcelas, Mapa
  const moreNavItems = navItems.slice(4); // Despesas, Retiradas

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg-primary)" }}>
      {/* Mobile "Mais" overlay */}
      {isMobile && moreOpen && (
        <div className="sidebar-overlay visible" onClick={() => setMoreOpen(false)} style={{ zIndex: 60 }} />
      )}

      {/* Mobile "Mais" drawer */}
      {isMobile && moreOpen && (
        <div className="more-sheet" style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 61,
          background: "rgba(14,11,14,0.95)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
          borderTop: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px 20px 0 0",
          padding: "20px 20px calc(20px + 64px + env(safe-area-inset-bottom))",
          animation: "slideUp 0.25s ease-out",
        }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)", margin: "0 auto 20px" }} />
          {moreNavItems.map((item) => (
            <button key={item.id} onClick={() => { handleNav(item.id); setMoreOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 14, width: "100%", padding: "16px 12px",
                background: active === item.id ? "rgba(200,230,74,0.10)" : "transparent",
                border: active === item.id ? "1px solid rgba(200,230,74,0.2)" : "1px solid transparent",
                borderRadius: 14, color: active === item.id ? "#C8E64A" : "var(--text-secondary)",
                fontSize: 15, fontWeight: 600, cursor: "pointer", marginBottom: 8, transition: "all 0.2s",
              }}>
              <item.icon size={22} />
              <span>{item.label}</span>
            </button>
          ))}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 8, paddingTop: 16 }}>
            <button onClick={() => { handleLogout(); setMoreOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 14, width: "100%", padding: "16px 12px",
                background: "transparent", border: "1px solid transparent", borderRadius: 14,
                color: "#EF4444", fontSize: 15, fontWeight: 600, cursor: "pointer",
              }}>
              <LogOut size={22} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      )}

      {/* Sidebar (desktop only) */}
      <aside
        className="app-sidebar"
        style={{
          width: collapsed ? 72 : 260,
          minWidth: collapsed ? 72 : 260,
          background: "rgba(14, 11, 14, 0.88)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
          display: isMobile ? "none" : "flex",
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
            <img src="/logo-full.png" alt="PM" style={{ width: 29, height: 29, objectFit: "contain", flexShrink: 0 }} />
          ) : (
            <img src="/logo-full.png" alt="Padilha Madeira" style={{ width: "100%", maxWidth: 140, height: "auto", objectFit: "contain" }} />
          )}
          {/* Close button removed - mobile uses bottom nav now */}
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

        {/* User info & logout */}
        <div style={{ padding: collapsed && !isMobile ? "8px" : "12px 16px", borderTop: "1px solid var(--border-color)" }}>
          {(!collapsed || isMobile) && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, padding: "8px 0" }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "var(--accent-emerald-soft, rgba(16,185,129,0.12))",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <User size={16} style={{ color: "var(--accent-emerald)" }} />
              </div>
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {loggedUser}
                </div>
                <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Conectado</div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="sidebar-link"
            style={{
              justifyContent: collapsed && !isMobile ? "center" : "flex-start",
              width: "100%",
              padding: collapsed && !isMobile ? "12px" : "10px 16px",
              color: "#EF4444",
            }}
            title={collapsed && !isMobile ? "Sair" : undefined}
          >
            <LogOut size={18} />
            {(!collapsed || isMobile) && <span>Sair</span>}
          </button>
        </div>

        {/* Collapse button (desktop only) */}
        {!isMobile && (
          <div style={{ padding: "8px 12px", borderTop: "1px solid var(--border-color)" }}>
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
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0, position: "relative" }}>
        {/* Desktop floating calendar shortcut */}
        {!isMobile && (
          <button
            onClick={() => handleNav("calendario")}
            title="Calendário de Parcelas"
            style={{
              position: "absolute", top: 16, right: 24, zIndex: 20,
              width: 40, height: 40, borderRadius: 12,
              background: active === "calendario" ? "rgba(200,230,74,0.12)" : "rgba(255,255,255,0.05)",
              border: active === "calendario" ? "1px solid rgba(200,230,74,0.25)" : "1px solid rgba(255,255,255,0.08)",
              color: active === "calendario" ? "#C8E64A" : "var(--text-secondary)",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
            }}
          >
            <Calendar size={20} />
          </button>
        )}

        {/* Mobile header (new design) */}
        {isMobile && (
          <div className="mobile-header-new" style={{
            position: "sticky", top: 0, zIndex: 30,
            background: "rgba(14,11,14,0.85)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            padding: "12px 16px", display: "flex", alignItems: "center", gap: 10,
          }}>
            <img src="/logo-full.png" alt="PM" style={{ width: 28, height: 28, objectFit: "contain", flexShrink: 0 }} />
            <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", flex: 1 }}>
              {activeLabel}
            </span>
            <button
              onClick={() => handleNav("calendario")}
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: active === "calendario" ? "rgba(200,230,74,0.12)" : "rgba(255,255,255,0.05)",
                border: active === "calendario" ? "1px solid rgba(200,230,74,0.25)" : "1px solid rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}>
              <Calendar size={18} style={{ color: active === "calendario" ? "#C8E64A" : "var(--text-muted)" }} />
            </button>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Bell size={18} style={{ color: "var(--text-muted)" }} />
            </div>
          </div>
        )}

        <main style={{ flex: 1, overflow: "auto", background: "var(--bg-primary)", paddingBottom: isMobile ? 80 : 0 }}>
          {renderPage()}
        </main>
      </div>

      {/* Bottom Tab Navigation (mobile only) */}
      {isMobile && (
        <nav className="bottom-nav" style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
          height: 64,
          background: "rgba(14,11,14,0.92)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-around",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}>
          {bottomNavItems.map((item) => {
            const isActive = active === item.id;
            return (
              <button key={item.id} onClick={() => handleNav(item.id)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                  background: "none", border: "none", cursor: "pointer",
                  color: isActive ? "#C8E64A" : "var(--text-muted)",
                  padding: "6px 12px", minWidth: 56, transition: "color 0.2s",
                  position: "relative",
                }}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500 }}>{item.label}</span>
                {isActive && <div style={{
                  position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)",
                  width: 20, height: 3, borderRadius: 2, background: "#C8E64A",
                }} />}
              </button>
            );
          })}
          {/* "Mais" button */}
          <button onClick={() => setMoreOpen(!moreOpen)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              background: "none", border: "none", cursor: "pointer",
              color: moreNavItems.some(i => i.id === active) || moreOpen ? "#C8E64A" : "var(--text-muted)",
              padding: "6px 12px", minWidth: 56, transition: "color 0.2s",
              position: "relative",
            }}>
            <MoreHorizontal size={22} strokeWidth={1.8} />
            <span style={{ fontSize: 10, fontWeight: 500 }}>Mais</span>
            {moreNavItems.some(i => i.id === active) && <div style={{
              position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)",
              width: 20, height: 3, borderRadius: 2, background: "#C8E64A",
            }} />}
          </button>
        </nav>
      )}
    </div>
  );
}
