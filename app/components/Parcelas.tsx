"use client";
import { useEffect, useMemo, useState } from "react";
import { Search, AlertTriangle, Clock, CheckCircle2, CircleDot, Check, X } from "lucide-react";
import { generateInstallments, formatCurrency, getPaidInstallments, savePaidInstallments } from "../data";

export default function Parcelas() {
  const [paidSet, setPaidSet] = useState<Set<string>>(() => getPaidInstallments());
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("TODOS");
  const [filterMonth, setFilterMonth] = useState<string>("TODOS");

  const installments = useMemo(() => {
    return generateInstallments(paidSet);
  }, [paidSet]);

  const months = useMemo(() => {
    const m = new Set<string>();
    installments.forEach(i => {
      const key = `${i.dataVencimento.getFullYear()}-${String(i.dataVencimento.getMonth() + 1).padStart(2, "0")}`;
      if (key >= "2025-01") m.add(key);
    });
    return Array.from(m).sort().slice(0, 24);
  }, [installments]);

  const filtered = useMemo(() => {
    return installments.filter(i => {
      const matchSearch = i.cliente.toLowerCase().includes(search.toLowerCase()) ||
        `QD${i.quadra}`.includes(search.toUpperCase()) ||
        `LT${i.lote}`.includes(search.toUpperCase());
      const matchStatus = filterStatus === "TODOS" || i.status === filterStatus;
      const monthKey = `${i.dataVencimento.getFullYear()}-${String(i.dataVencimento.getMonth() + 1).padStart(2, "0")}`;
      const matchMonth = filterMonth === "TODOS" || monthKey === filterMonth;
      return matchSearch && matchStatus && matchMonth;
    });
  }, [installments, search, filterStatus, filterMonth]);

  const summary = useMemo(() => ({
    total: filtered.length,
    vencidas: filtered.filter(i => i.status === "VENCIDO").length,
    aVencer: filtered.filter(i => i.status === "A VENCER" || i.status === "VENCE ESTE MÊS").length,
    pagas: filtered.filter(i => i.status === "PAGO").length,
    pendentes: filtered.filter(i => !["VENCIDO", "A VENCER", "VENCE ESTE MÊS", "PAGO"].includes(i.status)).length,
    valorTotal: filtered.reduce((s, i) => s + i.valor, 0),
    valorVencido: filtered.filter(i => i.status === "VENCIDO").reduce((s, i) => s + i.valor, 0),
    valorPago: filtered.filter(i => i.status === "PAGO").reduce((s, i) => s + i.valor, 0),
  }), [filtered]);

  const statusFilters = ["TODOS", "VENCIDO", "A VENCER", "VENCE ESTE MÊS", "PAGO"];

  const togglePaid = (saleId: number, parcela: number) => {
    const key = `${saleId}-${parcela}`;
    const newSet = new Set(paidSet);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setPaidSet(newSet);
    savePaidInstallments(newSet);
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "VENCIDO": return <AlertTriangle size={12} />;
      case "A VENCER": return <Clock size={12} />;
      case "VENCE ESTE MÊS": return <Clock size={12} />;
      case "PAGO": return <CheckCircle2 size={12} />;
      default: return <CircleDot size={12} />;
    }
  };

  const getRowStyle = (status: string): React.CSSProperties => {
    if (status === "VENCIDO") {
      return { background: "rgba(239, 68, 68, 0.10)", borderLeft: "3px solid #EF4444" };
    }
    if (status === "PAGO") {
      return { background: "rgba(16, 185, 129, 0.06)" };
    }
    return {};
  };

  return (
    <div style={{ padding: "28px 32px" }}>
      <div className="animate-fade-in-up" style={{ marginBottom: 28 }}>
        <h1 className="page-title" style={{ fontSize: 28, fontWeight: 800, fontFamily: "'DM Sans', sans-serif", color: "var(--text-primary)", marginBottom: 4 }}>
          Parcelas
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Controle de cobranças e parcelas mensais &middot; {summary.total} parcelas
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 16 }}>
        <div className="kpi-card red animate-fade-in-up stagger-1">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <AlertTriangle size={16} style={{ color: "var(--accent-red)" }} />
            <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Vencidas</span>
          </div>
          <div className="summary-value" style={{ fontSize: 24, fontWeight: 800, color: "#F87171" }}>{summary.vencidas}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{formatCurrency(summary.valorVencido)}</div>
        </div>
        <div className="kpi-card amber animate-fade-in-up stagger-2">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Clock size={16} style={{ color: "var(--accent-amber)" }} />
            <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>A Vencer</span>
          </div>
          <div className="summary-value" style={{ fontSize: 24, fontWeight: 800, color: "#FBBF24" }}>{summary.aVencer}</div>
        </div>
        <div className="kpi-card emerald animate-fade-in-up stagger-3">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <CheckCircle2 size={16} style={{ color: "var(--accent-emerald)" }} />
            <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Pagas</span>
          </div>
          <div className="summary-value" style={{ fontSize: 24, fontWeight: 800, color: "#34D399" }}>{summary.pagas}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{formatCurrency(summary.valorPago)}</div>
        </div>
        <div className="kpi-card blue animate-fade-in-up stagger-4">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <CircleDot size={16} style={{ color: "var(--accent-blue)" }} />
            <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Pendentes</span>
          </div>
          <div className="summary-value" style={{ fontSize: 24, fontWeight: 800 }}>{summary.pendentes}</div>
        </div>
      </div>
      <div style={{ marginBottom: 24 }}>
        <div className="kpi-card purple animate-fade-in-up stagger-5">
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 8 }}>Valor Total</div>
          <div className="summary-value-lg" style={{ fontSize: 22, fontWeight: 800 }}>{formatCurrency(summary.valorTotal)}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="animate-fade-in-up stagger-6" style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
          <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            className="search-input"
            placeholder="Buscar por cliente, quadra ou lote..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          value={filterMonth}
          onChange={e => setFilterMonth(e.target.value)}
          style={{ minWidth: 140 }}
        >
          <option value="TODOS">Todos os meses</option>
          {months.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {statusFilters.map(f => (
            <button
              key={f}
              className={`filter-chip ${filterStatus === f ? "active" : ""}`}
              onClick={() => setFilterStatus(f)}
            >
              {f === "TODOS" ? "Todos" : f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="chart-container animate-fade-in-up stagger-7" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ maxHeight: "calc(100vh - 420px)", overflow: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 60, textAlign: "center" }}>Pagar</th>
                <th>Cliente</th>
                <th>QD/LT</th>
                <th>Parcela</th>
                <th>Vencimento</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Dias Atraso</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 200).map((p, i) => (
                <tr key={`${p.saleId}-${p.parcela}`} style={getRowStyle(p.status)}>
                  <td style={{ textAlign: "center" }}>
                    <button
                      onClick={() => togglePaid(p.saleId, p.parcela)}
                      title={p.status === "PAGO" ? "Marcar como não paga" : "Marcar como paga"}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        border: p.status === "PAGO"
                          ? "2px solid #10B981"
                          : p.status === "VENCIDO"
                          ? "2px solid #EF4444"
                          : "2px solid var(--border-light)",
                        background: p.status === "PAGO"
                          ? "rgba(16, 185, 129, 0.2)"
                          : "transparent",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s ease",
                        color: p.status === "PAGO" ? "#10B981" : p.status === "VENCIDO" ? "#EF4444" : "var(--text-muted)",
                      }}
                    >
                      {p.status === "PAGO" ? <Check size={14} strokeWidth={3} /> : <X size={14} style={{ opacity: p.status === "VENCIDO" ? 1 : 0.3 }} />}
                    </button>
                  </td>
                  <td style={{ fontWeight: 500, maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis" }}>{p.cliente}</td>
                  <td>QD{p.quadra} / LT{p.lote}</td>
                  <td style={{ textAlign: "center" }}>{p.parcela}/{p.totalParcelas}</td>
                  <td>{p.dataVencimento.toLocaleDateString("pt-BR")}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(p.valor)}</td>
                  <td>
                    <span className={`status-badge status-${p.status.toLowerCase().replace(/ /g, "-").replace("este-mês", "a-vencer")}`}>
                      {statusIcon(p.status)}
                      {p.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "center", color: p.diasAtraso > 60 ? "#F87171" : p.diasAtraso > 0 ? "#FBBF24" : "var(--text-muted)" }}>
                    {p.diasAtraso > 0 ? `${p.diasAtraso}d` : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > 200 && (
            <div style={{ padding: 16, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
              Mostrando 200 de {filtered.length} parcelas. Use os filtros para refinar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
