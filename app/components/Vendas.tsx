"use client";
import { Fragment, useMemo, useState } from "react";
import { Search, Filter, Download, Eye, ChevronDown } from "lucide-react";
import { getSales, formatCurrency, formatDate } from "../data";

export default function Vendas() {
  const sales = useMemo(() => getSales(), []);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("TODOS");
  const [selectedSale, setSelectedSale] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return sales.filter(s => {
      const matchSearch = s.nome.toLowerCase().includes(search.toLowerCase()) ||
        s.cpf.includes(search) ||
        `QD${s.quadra}`.includes(search.toUpperCase()) ||
        `LT${s.lote}`.includes(search.toUpperCase());
      const matchStatus = filterStatus === "TODOS" || s.situacao === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [sales, search, filterStatus]);

  const totais = useMemo(() => ({
    valor: filtered.reduce((s, v) => s + v.valor, 0),
    entrada: filtered.reduce((s, v) => s + v.entrada, 0),
    count: filtered.length,
  }), [filtered]);

  const statusFilters = ["TODOS", "ATIVO", "QUITADO", "CANCELADO"];

  return (
    <div style={{ padding: "28px 32px" }}>
      {/* Header */}
      <div className="animate-fade-in-up" style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: "'DM Sans', sans-serif", color: "var(--text-primary)", marginBottom: 4 }}>
          Vendas
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Controle de vendas do Loteamento Vista Alegre 2 &middot; {totais.count} registros
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        <div className="kpi-card emerald animate-fade-in-up stagger-1">
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 8 }}>Total Vendas</div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>{formatCurrency(totais.valor)}</div>
        </div>
        <div className="kpi-card blue animate-fade-in-up stagger-2">
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 8 }}>Total Entradas</div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>{formatCurrency(totais.entrada)}</div>
        </div>
        <div className="kpi-card purple animate-fade-in-up stagger-3">
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 8 }}>Qtd Contratos</div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>{totais.count}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="animate-fade-in-up stagger-4" style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
          <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            className="search-input"
            placeholder="Buscar por nome, CPF, quadra ou lote..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {statusFilters.map(f => (
            <button
              key={f}
              className={`filter-chip ${filterStatus === f ? "active" : ""}`}
              onClick={() => setFilterStatus(f)}
            >
              {f === "TODOS" ? "Todos" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="chart-container animate-fade-in-up stagger-5" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ maxHeight: "calc(100vh - 340px)", overflow: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>Cliente</th>
                <th>CPF</th>
                <th>QD</th>
                <th>LT</th>
                <th>Área m²</th>
                <th>Valor Total</th>
                <th>Entrada</th>
                <th>Parcelas</th>
                <th>Vlr Parcela</th>
                <th>Situação</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <Fragment key={s.id}>
                  <tr style={{ cursor: "pointer" }} onClick={() => setSelectedSale(selectedSale === s.id ? null : s.id)}>
                    <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{s.id}</td>
                    <td style={{ fontWeight: 600, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }}>{s.nome}</td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 12 }}>{s.cpf || "-"}</td>
                    <td style={{ textAlign: "center" }}>{s.quadra}</td>
                    <td style={{ textAlign: "center" }}>{s.lote}</td>
                    <td style={{ textAlign: "center" }}>{s.area > 0 ? s.area.toFixed(2) : "-"}</td>
                    <td style={{ fontWeight: 600 }}>{s.valor > 0 ? formatCurrency(s.valor) : "-"}</td>
                    <td>{s.entrada > 0 ? formatCurrency(s.entrada) : "-"}</td>
                    <td style={{ textAlign: "center" }}>{s.numParcelas > 0 ? `${s.numParcelas}x` : "-"}</td>
                    <td>{s.valorParcela > 0 ? formatCurrency(s.valorParcela) : "-"}</td>
                    <td>
                      <span className={`status-badge status-${s.situacao.toLowerCase()}`}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }}></span>
                        {s.situacao}
                      </span>
                    </td>
                    <td>
                      <ChevronDown size={14} style={{ color: "var(--text-muted)", transform: selectedSale === s.id ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                    </td>
                  </tr>
                  {selectedSale === s.id && (
                    <tr>
                      <td colSpan={12} style={{ background: "var(--bg-surface)", padding: "16px 24px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                          <div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Data Entrada</div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{formatDate(s.dataEntrada)}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>1ª Parcela</div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{formatDate(s.dataPrimeiraParcela)}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Saldo Financiado</div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>
                              {s.valor > 0 && s.entrada > 0 ? formatCurrency(s.valor - s.entrada) : "-"}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Observações</div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>{s.obs || "-"}</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
