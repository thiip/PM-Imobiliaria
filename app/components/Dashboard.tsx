"use client";
import { useMemo, useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { addMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  TrendingUp, Users, MapPin, AlertTriangle,
  DollarSign, ArrowUpRight, ArrowDownRight, Clock
} from "lucide-react";
import { getSales, getLots, getActiveSales, generateInstallments, formatCurrency } from "../data";
import { TOTAL_RECEITAS_BOLETOS } from "../receitaData";

export default function Dashboard() {
  const sales = useMemo(() => getSales(), []);
  const lots = useMemo(() => getLots(), []);
  const activeSales = useMemo(() => getActiveSales(), []);
  const [installments, setInstallments] = useState<ReturnType<typeof generateInstallments>>([]);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => { setInstallments(generateInstallments()); }, []);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const totalLotes = lots.length;
  const lotesVendidos = lots.filter(l => l.situacao === "VENDIDO").length;
  const lotesDisponiveis = lots.filter(l => l.situacao === "IMOB.").length;
  const lotesQuitados = lots.filter(l => l.situacao === "QUITADO").length;
  const vendasAtivas = activeSales.filter(s => s.numParcelas > 0 && s.situacao === "ATIVO").length;
  const vgv = activeSales.reduce((s, v) => s + v.valor, 0);
  const totalEntradas = activeSales.reduce((s, v) => s + v.entrada, 0);
  const parcelasVencidas = installments.filter(i => i.status === "VENCIDO").length;
  const valorVencido = installments.filter(i => i.status === "VENCIDO").reduce((s, i) => s + i.valor, 0);
  const parcelasEsteMes = installments.filter(i => i.status === "VENCE ESTE MÊS");
  const valorEsteMes = parcelasEsteMes.reduce((s, i) => s + i.valor, 0);
  const pctVendido = ((lotesVendidos + lotesQuitados) / totalLotes * 100);

  // Total Recebido = Entradas + Boletos Pagos (dados reais das planilhas)
  const totalRecebido = totalEntradas + TOTAL_RECEITAS_BOLETOS;
  const totalAReceber = vgv - totalRecebido;

  // Quadra data for bar chart
  const quadraMap = new Map<number, { total: number; vendido: number; disponivel: number; quitado: number }>();
  lots.forEach(l => {
    if (!quadraMap.has(l.quadra)) quadraMap.set(l.quadra, { total: 0, vendido: 0, disponivel: 0, quitado: 0 });
    const q = quadraMap.get(l.quadra)!;
    q.total++;
    if (l.situacao === "VENDIDO") q.vendido++;
    else if (l.situacao === "IMOB.") q.disponivel++;
    else if (l.situacao === "QUITADO") q.quitado++;
  });
  const quadraData = Array.from(quadraMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([q, d]) => ({ name: `QD ${q}`, Vendidos: d.vendido, Disponíveis: d.disponivel, Quitados: d.quitado }));

  // Pie data
  const pieData = [
    { name: "Vendidos", value: lotesVendidos, color: "#3B82F6" },
    { name: "Disponíveis", value: lotesDisponiveis, color: "#10B981" },
    { name: "Quitados", value: lotesQuitados, color: "#8B5CF6" },
  ];

  // Monthly revenue
  const monthlyRev = new Map<string, number>();
  activeSales.forEach(s => {
    if (s.numParcelas > 0 && s.dataPrimeiraParcela && s.valorParcela > 0 && s.situacao === "ATIVO") {
      const first = new Date(s.dataPrimeiraParcela + "T00:00:00");
      for (let p = 0; p < s.numParcelas; p++) {
        const dt = addMonths(first, p);
        const key = format(dt, "yyyy-MM");
        monthlyRev.set(key, (monthlyRev.get(key) || 0) + s.valorParcela);
      }
    }
  });
  const revenueData = Array.from(monthlyRev.entries())
    .filter(([k]) => k >= "2025-06")
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(0, 18)
    .map(([k, v]) => ({
      name: format(new Date(k + "-01"), "MMM/yy", { locale: ptBR }),
      valor: Math.round(v),
    }));

  const kpis = [
    { label: "Total de Lotes", value: totalLotes.toString(), icon: MapPin, color: "cyan", sub: `${totalLotes} lotes no empreendimento` },
    { label: "Lotes Vendidos", value: lotesVendidos.toString(), icon: Users, color: "blue", sub: `${pctVendido.toFixed(1)}% de ocupação` },
    { label: "Lotes Disponíveis", value: lotesDisponiveis.toString(), icon: MapPin, color: "emerald", sub: "Prontos para venda" },
    { label: "Vendas Parceladas", value: vendasAtivas.toString(), icon: TrendingUp, color: "purple", sub: "Contratos ativos" },
  ];

  const kpisFinanceiro = [
    { label: "VGV Total", value: formatCurrency(vgv), icon: DollarSign, color: "emerald", sub: "Valor geral de vendas" },
    { label: "Total Recebido", value: formatCurrency(totalRecebido), icon: ArrowUpRight, color: "blue", sub: `Entradas + boletos pagos` },
    { label: "Total a Receber", value: formatCurrency(totalAReceber), icon: ArrowDownRight, color: "amber", sub: `Saldo restante do VGV` },
    { label: "Parcelas Vencidas", value: parcelasVencidas.toString(), icon: AlertTriangle, color: "red", sub: formatCurrency(valorVencido) + " em aberto" },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 10, padding: "12px 16px", boxShadow: "var(--shadow-elevated)" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: 12, marginBottom: 6 }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color, fontSize: 13, fontWeight: 600 }}>
            {p.name}: {typeof p.value === "number" && p.value > 100 ? formatCurrency(p.value) : p.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1500 }}>
      {/* Header */}
      <div className="animate-fade-in-up" style={{ marginBottom: 32 }}>
        <h1 className="page-title" style={{ fontSize: 28, fontWeight: 800, fontFamily: "'DM Sans', sans-serif", color: "var(--text-primary)", marginBottom: 4 }}>
          Painel
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Visão geral do Loteamento Vista Alegre
        </p>
      </div>

      {/* KPIs - Lotes */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16, marginBottom: 16 }}>
        {kpis.map((kpi, i) => (
          <div key={i} className={`kpi-card ${kpi.color} animate-fade-in-up stagger-${i + 1}`}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div
                style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: `var(--accent-${kpi.color}-soft, rgba(100,116,139,0.12))`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <kpi.icon size={20} style={{ color: `var(--accent-${kpi.color})` }} />
              </div>
            </div>
            <div className="kpi-value" style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1, marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>
              {kpi.value}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500, marginBottom: 4 }}>{kpi.label}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* KPIs - Financeiro */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16, marginBottom: 28 }}>
        {kpisFinanceiro.map((kpi, i) => (
          <div key={i} className={`kpi-card ${kpi.color} animate-fade-in-up stagger-${i + 5}`}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div
                style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: `var(--accent-${kpi.color}-soft, rgba(100,116,139,0.12))`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <kpi.icon size={20} style={{ color: `var(--accent-${kpi.color})` }} />
              </div>
            </div>
            <div className="kpi-value-sm" style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1, marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>
              {kpi.value}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500, marginBottom: 4 }}>{kpi.label}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 28 }}>
        {/* Bar Chart */}
        <div className="chart-container animate-fade-in-up stagger-5">
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20 }}>
            Vendas por Quadra
          </h3>
          <ResponsiveContainer width="100%" height={isMobile ? 220 : 280}>
            <BarChart data={quadraData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Vendidos" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Disponíveis" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Quitados" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="chart-container animate-fade-in-up stagger-6">
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20 }}>
            Distribuição dos Lotes
          </h3>
          <ResponsiveContainer width="100%" height={isMobile ? 220 : 280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={isMobile ? 60 : 70}
                outerRadius={isMobile ? 95 : 110}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: isMobile ? 12 : 24, marginTop: -8 }}>
            {pieData.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color }} />
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="chart-container animate-fade-in-up stagger-7">
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20 }}>
          Receita Mensal Prevista (Parcelas)
        </h3>
        <ResponsiveContainer width="100%" height={isMobile ? 220 : 300}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 10 }} interval={1} />
            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="valor" stroke="#10B981" strokeWidth={2} fill="url(#colorRevenue)" name="Receita" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Upcoming payments table */}
      <div className="chart-container animate-fade-in-up" style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
          Parcelas Vencendo Este Mês
        </h3>
        {parcelasEsteMes.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Nenhuma parcela vencendo este mês.</p>
        ) : (
          <div style={{ maxHeight: 350, overflow: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>QD/LT</th>
                  <th>Parcela</th>
                  <th>Vencimento</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {parcelasEsteMes.slice(0, 15).map((p, i) => (
                  <tr key={i}>
                    <td style={{ maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis" }}>{p.cliente}</td>
                    <td>QD{p.quadra} / LT{p.lote}</td>
                    <td>{p.parcela}/{p.totalParcelas}</td>
                    <td>{p.dataVencimento.toLocaleDateString("pt-BR")}</td>
                    <td style={{ fontWeight: 600, color: "#FBBF24" }}>{formatCurrency(p.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
