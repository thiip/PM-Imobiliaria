"use client";
import { useMemo, useState } from "react";
import { Users, TrendingUp, DollarSign, PieChart as PieIcon, ArrowUpRight, Lock, Eye, EyeOff } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { formatCurrency } from "../data";

interface Retirada {
  id: number;
  data: string;
  descricao: string;
  valorTotal: number;
  giovani: number;
  heron: number;
  rosiane: number;
}

const SOCIOS = [
  { nome: "Rosiane", percentual: 37.5, color: "#8B5CF6" },
  { nome: "Heron", percentual: 31.25, color: "#3B82F6" },
  { nome: "Giovani", percentual: 31.25, color: "#10B981" },
];

const RETIRADAS: Retirada[] = [
  {
    id: 1,
    data: "2024-01-12",
    descricao: "Retirada 1",
    valorTotal: 650000,
    giovani: 203125,
    heron: 203125,
    rosiane: 243750,
  },
  {
    id: 2,
    data: "2024-07-05",
    descricao: "Retirada 2",
    valorTotal: 300000,
    giovani: 93750,
    heron: 93750,
    rosiane: 112500,
  },
  {
    id: 3,
    data: "2024-07-05",
    descricao: "Retirada 3",
    valorTotal: 300000,
    giovani: 93750,
    heron: 93750,
    rosiane: 112500,
  },
  {
    id: 4,
    data: "2024-09-20",
    descricao: "Retirada 4",
    valorTotal: 900000,
    giovani: 281250,
    heron: 281250,
    rosiane: 337500,
  },
  {
    id: 5,
    data: "2025-03-24",
    descricao: "Retirada 5",
    valorTotal: 900000,
    giovani: 281250,
    heron: 281250,
    rosiane: 337500,
  },
  {
    id: 6,
    data: "2026-03-18",
    descricao: "Retirada 6",
    valorTotal: 1440000,
    giovani: 450000,
    heron: 450000,
    rosiane: 540000,
  },
];

function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function formatMonth(d: string) {
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const [y, m] = d.split("-");
  return `${months[parseInt(m) - 1]}/${y.slice(2)}`;
}

const SENHA = "pm1961";

export default function Retiradas() {
  const [autenticado, setAutenticado] = useState(false);
  const [senha, setSenha] = useState("");
  const [senhaErro, setSenhaErro] = useState(false);
  const [showSenha, setShowSenha] = useState(false);
  const [selectedSocio, setSelectedSocio] = useState<string>("TODOS");

  const totais = useMemo(() => {
    const totalGeral = RETIRADAS.reduce((s, r) => s + r.valorTotal, 0);
    const totalGiovani = RETIRADAS.reduce((s, r) => s + r.giovani, 0);
    const totalHeron = RETIRADAS.reduce((s, r) => s + r.heron, 0);
    const totalRosiane = RETIRADAS.reduce((s, r) => s + r.rosiane, 0);
    return { totalGeral, totalGiovani, totalHeron, totalRosiane };
  }, []);

  const pieData = useMemo(() => [
    { name: "Rosiane", value: totais.totalRosiane, color: "#8B5CF6" },
    { name: "Heron", value: totais.totalHeron, color: "#3B82F6" },
    { name: "Giovani", value: totais.totalGiovani, color: "#10B981" },
  ], [totais]);

  const barData = useMemo(() =>
    RETIRADAS.map(r => ({
      name: formatMonth(r.data),
      Rosiane: r.rosiane,
      Heron: r.heron,
      Giovani: r.giovani,
    })),
  []);

  const filteredRetiradas = useMemo(() => {
    if (selectedSocio === "TODOS") return RETIRADAS;
    return RETIRADAS;
  }, [selectedSocio]);

  const saldoAcumulado = useMemo(() => {
    let gAcc = 0, hAcc = 0, rAcc = 0;
    return RETIRADAS.map(r => {
      gAcc += r.giovani;
      hAcc += r.heron;
      rAcc += r.rosiane;
      return { ...r, accGiovani: gAcc, accHeron: hAcc, accRosiane: rAcc, accTotal: gAcc + hAcc + rAcc };
    });
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (senha === SENHA) {
      setAutenticado(true);
      setSenhaErro(false);
    } else {
      setSenhaErro(true);
      setTimeout(() => setSenhaErro(false), 2000);
    }
  };

  if (!autenticado) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", minHeight: "80vh", padding: 32 }}>
        <div className="animate-fade-in-up" style={{
          background: "var(--bg-card)",
          borderRadius: 20,
          padding: "48px 40px",
          border: "1px solid var(--border-light)",
          width: "100%",
          maxWidth: 400,
          textAlign: "center",
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: "var(--accent-purple-soft, rgba(139,92,246,0.12))",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 24px",
          }}>
            <Lock size={28} style={{ color: "#8B5CF6" }} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>
            Área Restrita
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 28 }}>
            Insira a senha para acessar as retiradas dos sócios
          </p>
          <form onSubmit={handleLogin}>
            <div style={{ position: "relative", marginBottom: 16 }}>
              <input
                type={showSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite a senha"
                autoFocus
                style={{
                  width: "100%",
                  padding: "14px 48px 14px 16px",
                  borderRadius: 12,
                  border: senhaErro ? "2px solid #EF4444" : "1px solid var(--border-color)",
                  background: "var(--bg-primary)",
                  color: "var(--text-primary)",
                  fontSize: 14,
                  outline: "none",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
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
                {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {senhaErro && (
              <p style={{ fontSize: 12, color: "#EF4444", marginBottom: 12, fontWeight: 500 }}>
                Senha incorreta. Tente novamente.
              </p>
            )}
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 12,
                border: "none",
                background: "#8B5CF6",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Acessar Retiradas
            </button>
          </form>
        </div>
      </div>
    );
  }

  const getSocioValue = (r: Retirada, socio: string) => {
    switch (socio) {
      case "Giovani": return r.giovani;
      case "Heron": return r.heron;
      case "Rosiane": return r.rosiane;
      default: return r.valorTotal;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 10, padding: "12px 16px", boxShadow: "var(--shadow-elevated)" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: 12, marginBottom: 6 }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color, fontSize: 13, fontWeight: 600 }}>
            {p.name}: {formatCurrency(p.value)}
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
          Retiradas dos Sócios
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Controle de distribuição de lucros entre os sócios
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16, marginBottom: 28 }}>
        <div className="kpi-card emerald animate-fade-in-up stagger-1">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "var(--accent-emerald-soft, rgba(16,185,129,0.12))", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <DollarSign size={20} style={{ color: "var(--accent-emerald)" }} />
            </div>
          </div>
          <div className="kpi-value-sm" style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1, marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>
            {formatCurrency(totais.totalGeral)}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500, marginBottom: 4 }}>Total Distribuído</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{RETIRADAS.length} retiradas realizadas</div>
        </div>

        {SOCIOS.map((socio, i) => {
          const total = socio.nome === "Rosiane" ? totais.totalRosiane : socio.nome === "Heron" ? totais.totalHeron : totais.totalGiovani;
          const colorKey = socio.nome === "Rosiane" ? "purple" : socio.nome === "Heron" ? "blue" : "emerald";
          return (
            <div key={socio.nome} className={`kpi-card ${colorKey} animate-fade-in-up stagger-${i + 2}`}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: `var(--accent-${colorKey}-soft, rgba(100,116,139,0.12))`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Users size={20} style={{ color: `var(--accent-${colorKey})` }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: socio.color, background: `${socio.color}18`, padding: "3px 8px", borderRadius: 6 }}>
                  {socio.percentual}%
                </span>
              </div>
              <div className="kpi-value-sm" style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1, marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>
                {formatCurrency(total)}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500, marginBottom: 4 }}>{socio.nome}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{((total / totais.totalGeral) * 100).toFixed(1)}% do total</div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
        {/* Bar chart */}
        <div className="card animate-fade-in-up stagger-5" style={{ background: "var(--bg-card)", borderRadius: 16, padding: 24, border: "1px solid var(--border-light)" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20, fontFamily: "'DM Sans', sans-serif" }}>
            Distribuição por Retirada
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Rosiane" stackId="a" fill="#8B5CF6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Heron" stackId="a" fill="#3B82F6" />
              <Bar dataKey="Giovani" stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 12 }}>
            {SOCIOS.map(s => (
              <div key={s.nome} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)" }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />
                {s.nome}
              </div>
            ))}
          </div>
        </div>

        {/* Pie chart */}
        <div className="card animate-fade-in-up stagger-6" style={{ background: "var(--bg-card)", borderRadius: 16, padding: 24, border: "1px solid var(--border-light)" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20, fontFamily: "'DM Sans', sans-serif" }}>
            Participação Total
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                {pieData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 12 }}>
            {pieData.map(s => (
              <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.color }} />
                {s.name}: {formatCurrency(s.value)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabela de Retiradas */}
      <div className="card animate-fade-in-up stagger-7" style={{ background: "var(--bg-card)", borderRadius: 16, padding: 24, border: "1px solid var(--border-light)", marginBottom: 28 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20, fontFamily: "'DM Sans', sans-serif" }}>
          Histórico de Retiradas
        </h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
            <thead>
              <tr>
                {["#", "Data", "Descrição", "Valor Total", "Rosiane (37,5%)", "Heron (31,25%)", "Giovani (31,25%)"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: h === "#" || h === "Data" || h === "Descrição" ? "left" : "right",
                      padding: "12px 16px",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      borderBottom: "1px solid var(--border-color)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {saldoAcumulado.map((r, idx) => (
                <tr key={r.id} style={{ transition: "background 0.15s" }} onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-light)", fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>
                    {r.id}
                  </td>
                  <td style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-light)", fontSize: 13, color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                    {formatDate(r.data)}
                  </td>
                  <td style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-light)", fontSize: 13, color: "var(--text-primary)" }}>
                    {r.descricao}
                  </td>
                  <td style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-light)", fontSize: 13, color: "var(--text-primary)", fontWeight: 700, textAlign: "right", fontFamily: "'DM Sans', sans-serif" }}>
                    {formatCurrency(r.valorTotal)}
                  </td>
                  <td style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-light)", fontSize: 13, textAlign: "right", fontFamily: "'DM Sans', sans-serif" }}>
                    <span style={{ color: "#8B5CF6", fontWeight: 600 }}>{formatCurrency(r.rosiane)}</span>
                  </td>
                  <td style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-light)", fontSize: 13, textAlign: "right", fontFamily: "'DM Sans', sans-serif" }}>
                    <span style={{ color: "#3B82F6", fontWeight: 600 }}>{formatCurrency(r.heron)}</span>
                  </td>
                  <td style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-light)", fontSize: 13, textAlign: "right", fontFamily: "'DM Sans', sans-serif" }}>
                    <span style={{ color: "#10B981", fontWeight: 600 }}>{formatCurrency(r.giovani)}</span>
                  </td>
                </tr>
              ))}
              {/* Total row */}
              <tr style={{ background: "var(--bg-hover)" }}>
                <td colSpan={3} style={{ padding: "14px 16px", fontSize: 13, fontWeight: 800, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Total Acumulado
                </td>
                <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 800, color: "var(--text-primary)", textAlign: "right", fontFamily: "'DM Sans', sans-serif" }}>
                  {formatCurrency(totais.totalGeral)}
                </td>
                <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 800, color: "#8B5CF6", textAlign: "right", fontFamily: "'DM Sans', sans-serif" }}>
                  {formatCurrency(totais.totalRosiane)}
                </td>
                <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 800, color: "#3B82F6", textAlign: "right", fontFamily: "'DM Sans', sans-serif" }}>
                  {formatCurrency(totais.totalHeron)}
                </td>
                <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 800, color: "#10B981", textAlign: "right", fontFamily: "'DM Sans', sans-serif" }}>
                  {formatCurrency(totais.totalGiovani)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Saldo Acumulado */}
      <div className="card animate-fade-in-up stagger-8" style={{ background: "var(--bg-card)", borderRadius: 16, padding: 24, border: "1px solid var(--border-light)" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20, fontFamily: "'DM Sans', sans-serif" }}>
          Evolução do Saldo Acumulado
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {SOCIOS.map(socio => {
            const values = saldoAcumulado.map(r => {
              const acc = socio.nome === "Rosiane" ? r.accRosiane : socio.nome === "Heron" ? r.accHeron : r.accGiovani;
              return { data: formatMonth(r.data), valor: acc };
            });
            const total = socio.nome === "Rosiane" ? totais.totalRosiane : socio.nome === "Heron" ? totais.totalHeron : totais.totalGiovani;
            return (
              <div key={socio.nome} style={{ background: "var(--bg-primary)", borderRadius: 12, padding: 20, border: "1px solid var(--border-light)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: socio.color }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{socio.nome}</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>{socio.percentual}%</span>
                </div>
                {values.map((v, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < values.length - 1 ? "1px solid var(--border-light)" : "none" }}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{v.data}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: socio.color, fontFamily: "'DM Sans', sans-serif" }}>
                      {formatCurrency(v.valor)}
                    </span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0 0", marginTop: 8, borderTop: `2px solid ${socio.color}33` }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", textTransform: "uppercase" }}>Total</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: socio.color, fontFamily: "'DM Sans', sans-serif" }}>
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
