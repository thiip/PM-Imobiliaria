"use client";
import { Fragment, useMemo, useState } from "react";
import { Search, Filter, Download, Eye, ChevronDown, CheckCircle, Clock, AlertTriangle, Calendar } from "lucide-react";
import { getSales, formatCurrency, formatDate, generateInstallments, getPaidInstallments, savePaidInstallments, getInstallmentKey, type Installment } from "../data";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Vendas() {
  const sales = useMemo(() => getSales(), []);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("TODOS");
  const [selectedSale, setSelectedSale] = useState<number | null>(null);
  const [paidSet, setPaidSet] = useState(() => getPaidInstallments());

  const allInstallments = useMemo(() => generateInstallments(paidSet), [paidSet]);

  const getInstallmentsForSale = (saleId: number): Installment[] => {
    return allInstallments.filter(inst => inst.saleId === saleId);
  };

  const togglePaid = (saleId: number, parcela: number) => {
    const key = getInstallmentKey(saleId, parcela);
    const newPaid = new Set(paidSet);
    if (newPaid.has(key)) {
      newPaid.delete(key);
    } else {
      newPaid.add(key);
    }
    savePaidInstallments(newPaid);
    setPaidSet(newPaid);
  };

  const statusIcon = (status: Installment['status']) => {
    switch (status) {
      case 'PAGO': return <CheckCircle size={13} style={{ color: "var(--emerald)" }} />;
      case 'VENCIDO': return <AlertTriangle size={13} style={{ color: "var(--red)" }} />;
      case 'VENCE ESTE MÊS': return <Clock size={13} style={{ color: "var(--amber)" }} />;
      case 'A VENCER': return <Calendar size={13} style={{ color: "var(--blue)" }} />;
      default: return <Clock size={13} style={{ color: "var(--text-muted)" }} />;
    }
  };

  const statusColor = (status: Installment['status']) => {
    switch (status) {
      case 'PAGO': return { bg: "rgba(16,185,129,0.12)", color: "var(--emerald)" };
      case 'VENCIDO': return { bg: "rgba(239,68,68,0.12)", color: "var(--red)" };
      case 'VENCE ESTE MÊS': return { bg: "rgba(245,158,11,0.12)", color: "var(--amber)" };
      case 'A VENCER': return { bg: "rgba(59,130,246,0.12)", color: "var(--blue)" };
      default: return { bg: "rgba(148,163,184,0.10)", color: "var(--text-muted)" };
    }
  };

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
          Controle de vendas do Loteamento Vista Alegre &middot; {totais.count} registros
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16, marginBottom: 24 }}>
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
                  {selectedSale === s.id && (() => {
                    const parcelas = getInstallmentsForSale(s.id);
                    const pagas = parcelas.filter(p => p.status === 'PAGO');
                    const vencidas = parcelas.filter(p => p.status === 'VENCIDO');
                    const totalPago = pagas.reduce((acc, p) => acc + p.valor, 0);
                    const totalRestante = parcelas.filter(p => p.status !== 'PAGO').reduce((acc, p) => acc + p.valor, 0);
                    return (
                      <tr>
                        <td colSpan={12} style={{ background: "var(--bg-surface)", padding: 0 }}>
                          {/* Info header */}
                          <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 16 }}>
                              <div>
                                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Valor Total</div>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{s.valor > 0 ? formatCurrency(s.valor) : "-"}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Entrada</div>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{s.entrada > 0 ? formatCurrency(s.entrada) : "-"}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Saldo Financiado</div>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>
                                  {s.valor > 0 && s.entrada > 0 ? formatCurrency(s.valor - s.entrada) : "-"}
                                </div>
                              </div>
                              <div>
                                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Data Entrada</div>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{formatDate(s.dataEntrada)}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>1ª Parcela</div>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{formatDate(s.dataPrimeiraParcela)}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Total Pago</div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--emerald)" }}>{formatCurrency(totalPago + s.entrada)}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Total Restante</div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: totalRestante > 0 ? "var(--amber)" : "var(--emerald)" }}>{formatCurrency(totalRestante)}</div>
                              </div>
                            </div>
                            {s.obs && (
                              <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-secondary)" }}>
                                <span style={{ fontWeight: 600 }}>Obs:</span> {s.obs}
                              </div>
                            )}
                          </div>

                          {/* Parcelas summary badges */}
                          <div style={{ padding: "12px 24px", display: "flex", gap: 12, borderBottom: "1px solid var(--border)" }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>
                              {parcelas.length} parcelas:
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--emerald)" }}>
                              {pagas.length} pagas
                            </span>
                            {vencidas.length > 0 && (
                              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--red)" }}>
                                {vencidas.length} vencidas
                              </span>
                            )}
                            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--blue)" }}>
                              {parcelas.length - pagas.length - vencidas.length} a vencer
                            </span>
                          </div>

                          {/* Parcelas table */}
                          {parcelas.length > 0 && (
                            <div style={{ maxHeight: 320, overflowY: "auto" }}>
                              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                                <thead>
                                  <tr style={{ background: "var(--bg-primary)", position: "sticky", top: 0, zIndex: 1 }}>
                                    <th style={{ padding: "8px 16px", textAlign: "center", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.04em" }}>Parcela</th>
                                    <th style={{ padding: "8px 16px", textAlign: "left", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.04em" }}>Vencimento</th>
                                    <th style={{ padding: "8px 16px", textAlign: "right", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.04em" }}>Valor</th>
                                    <th style={{ padding: "8px 16px", textAlign: "center", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.04em" }}>Status</th>
                                    <th style={{ padding: "8px 16px", textAlign: "center", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.04em" }}>Dias Atraso</th>
                                    <th style={{ padding: "8px 16px", textAlign: "center", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.04em" }}>Marcar</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {parcelas.map((p) => {
                                    const sc = statusColor(p.status);
                                    return (
                                      <tr key={`${p.saleId}-${p.parcela}`} style={{
                                        borderTop: "1px solid var(--border)",
                                        background: p.status === 'PAGO' ? "rgba(16,185,129,0.04)" : p.status === 'VENCIDO' ? "rgba(239,68,68,0.04)" : "transparent"
                                      }}>
                                        <td style={{ padding: "8px 16px", textAlign: "center", fontWeight: 600 }}>
                                          {p.parcela}/{p.totalParcelas}
                                        </td>
                                        <td style={{ padding: "8px 16px" }}>
                                          {format(p.dataVencimento, "dd/MM/yyyy", { locale: ptBR })}
                                        </td>
                                        <td style={{ padding: "8px 16px", textAlign: "right", fontWeight: 600 }}>
                                          {formatCurrency(p.valor)}
                                        </td>
                                        <td style={{ padding: "8px 16px", textAlign: "center" }}>
                                          <span style={{
                                            display: "inline-flex", alignItems: "center", gap: 4,
                                            padding: "3px 10px", borderRadius: 99,
                                            fontSize: 11, fontWeight: 600,
                                            background: sc.bg, color: sc.color
                                          }}>
                                            {statusIcon(p.status)}
                                            {p.status}
                                          </span>
                                        </td>
                                        <td style={{ padding: "8px 16px", textAlign: "center", fontSize: 12, color: p.diasAtraso > 0 ? "var(--red)" : "var(--text-muted)" }}>
                                          {p.status !== 'PAGO' && p.diasAtraso > 0 ? `${p.diasAtraso}d` : "-"}
                                        </td>
                                        <td style={{ padding: "8px 16px", textAlign: "center" }}>
                                          <button
                                            onClick={(e) => { e.stopPropagation(); togglePaid(p.saleId, p.parcela); }}
                                            style={{
                                              background: p.status === 'PAGO' ? "var(--emerald)" : "transparent",
                                              border: p.status === 'PAGO' ? "none" : "1.5px solid var(--border)",
                                              borderRadius: 6, width: 26, height: 26, cursor: "pointer",
                                              display: "inline-flex", alignItems: "center", justifyContent: "center",
                                              transition: "all 0.2s"
                                            }}
                                            title={p.status === 'PAGO' ? "Desmarcar como pago" : "Marcar como pago"}
                                          >
                                            {p.status === 'PAGO' && <CheckCircle size={14} style={{ color: "#fff" }} />}
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {parcelas.length === 0 && (
                            <div style={{ padding: "20px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                              Nenhuma parcela gerada para esta venda
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })()}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
