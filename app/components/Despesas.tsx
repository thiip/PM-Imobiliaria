"use client";
import { useMemo, useState, useEffect } from "react";
import { Search, Plus, Trash2, X, Save, TrendingDown, DollarSign, Calculator, Layers, Clock } from "lucide-react";
import {
  getExpensesFromStorage, saveExpensesToStorage, Expense,
  EXPENSE_CATEGORIES, PAYMENT_METHODS, formatCurrency, formatDate
} from "../data";
import { RECEITAS_MENSAIS } from "../receitaData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, AreaChart, Area, ComposedChart, Line, Legend
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const CHART_COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#F97316", "#EC4899", "#14B8A6", "#A855F7", "#6366F1", "#84CC16"];

export default function Despesas() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("TODOS");
  const [filterStatus, setFilterStatus] = useState("TODOS");
  const [showForm, setShowForm] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    data: new Date().toISOString().split("T")[0],
    categoria: "", descricao: "", fornecedor: "", valor: 0,
    formaPgto: "PIX", nfRecibo: "", centroCusto: "", responsavel: "", status: "PENDENTE",
  });

  useEffect(() => { setExpenses(getExpensesFromStorage()); }, []);

  const filtered = useMemo(() => {
    return expenses.filter(e => {
      const matchSearch = e.descricao.toLowerCase().includes(search.toLowerCase()) ||
        e.fornecedor.toLowerCase().includes(search.toLowerCase()) ||
        e.categoria.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCat === "TODOS" || e.categoria === filterCat;
      const matchStatus = filterStatus === "TODOS" || e.status === filterStatus;
      return matchSearch && matchCat && matchStatus;
    });
  }, [expenses, search, filterCat, filterStatus]);

  // ─── Summary KPIs ───
  const summary = useMemo(() => {
    const total = expenses.reduce((s, e) => s + e.valor, 0);
    const pago = expenses.filter(e => e.status === "PAGO").reduce((s, e) => s + e.valor, 0);
    const pendente = expenses.filter(e => e.status === "PENDENTE").reduce((s, e) => s + e.valor, 0);
    const ticketMedio = expenses.length > 0 ? total / expenses.length : 0;
    const fixo = expenses.filter(e => e.centroCusto === "FIXO").reduce((s, e) => s + e.valor, 0);
    const variavel = expenses.filter(e => e.centroCusto === "VARIAVEL").reduce((s, e) => s + e.valor, 0);
    return { total, pago, pendente, ticketMedio, fixo, variavel };
  }, [expenses]);

  // ─── Monthly Expenses ───
  const monthlyExpenses = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach(e => {
      const key = e.data.slice(0, 7);
      map.set(key, (map.get(key) || 0) + e.valor);
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => ({
        name: format(new Date(k + "-01"), "MMM/yy", { locale: ptBR }),
        key: k,
        valor: Math.round(v),
      }));
  }, [expenses]);

  // ─── Revenue vs Expenses ───
  const revenueVsExpenses = useMemo(() => {
    const expMap = new Map<string, number>();
    expenses.forEach(e => {
      const key = e.data.slice(0, 7);
      expMap.set(key, (expMap.get(key) || 0) + e.valor);
    });
    const allMonths = new Set([...Object.keys(RECEITAS_MENSAIS), ...expMap.keys()]);
    return Array.from(allMonths)
      .sort()
      .map(k => {
        const receitas = RECEITAS_MENSAIS[k] || 0;
        const despesas = expMap.get(k) || 0;
        return {
          name: format(new Date(k + "-01"), "MMM/yy", { locale: ptBR }),
          Receitas: Math.round(receitas),
          Despesas: Math.round(despesas),
          Saldo: Math.round(receitas - despesas),
        };
      });
  }, [expenses]);

  // ─── Categories ───
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach(e => map.set(e.categoria, (map.get(e.categoria) || 0) + e.valor));
    return Array.from(map.entries())
      .map(([name, valor]) => ({ name: name.length > 18 ? name.slice(0, 18) + "…" : name, fullName: name, valor }))
      .sort((a, b) => b.valor - a.valor);
  }, [expenses]);

  // ─── Fixed vs Variable ───
  const fixoVsVariavel = useMemo(() => [
    { name: "Custos Fixos", value: summary.fixo, color: "#3B82F6" },
    { name: "Custos Variáveis", value: summary.variavel, color: "#F59E0B" },
  ], [summary]);

  // ─── Top Suppliers ───
  const topFornecedores = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach(e => {
      if (e.fornecedor) map.set(e.fornecedor, (map.get(e.fornecedor) || 0) + e.valor);
    });
    const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const max = sorted[0]?.[1] || 1;
    return sorted.map(([name, valor]) => ({ name, valor, pct: (valor / max) * 100 }));
  }, [expenses]);

  // ─── Payment Methods ───
  const paymentData = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach(e => map.set(e.formaPgto, (map.get(e.formaPgto) || 0) + e.valor));
    return Array.from(map.entries())
      .map(([name, value], i) => ({ name, value, color: CHART_COLORS[i % CHART_COLORS.length] }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  // ─── Handlers ───
  const handleAdd = () => {
    if (!newExpense.descricao || !newExpense.categoria) return;
    const exp: Expense = {
      id: Math.max(0, ...expenses.map(e => e.id)) + 1,
      data: newExpense.data || new Date().toISOString().split("T")[0],
      categoria: newExpense.categoria || "", descricao: newExpense.descricao || "",
      fornecedor: newExpense.fornecedor || "", valor: newExpense.valor || 0,
      formaPgto: newExpense.formaPgto || "PIX", nfRecibo: newExpense.nfRecibo || "",
      centroCusto: newExpense.centroCusto || "", responsavel: newExpense.responsavel || "",
      status: (newExpense.status as Expense["status"]) || "PENDENTE",
    };
    const updated = [...expenses, exp];
    setExpenses(updated);
    saveExpensesToStorage(updated);
    setShowForm(false);
    setNewExpense({ data: new Date().toISOString().split("T")[0], categoria: "", descricao: "", fornecedor: "", valor: 0, formaPgto: "PIX", nfRecibo: "", centroCusto: "", responsavel: "", status: "PENDENTE" });
  };

  const handleDelete = (id: number) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    saveExpensesToStorage(updated);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 10, padding: "12px 16px", boxShadow: "var(--shadow-elevated)" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: 12, marginBottom: 6 }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color || p.stroke || "#10B981", fontSize: 13, fontWeight: 600 }}>
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  };

  const kpis = [
    { label: "Total Despesas", value: formatCurrency(summary.total), icon: TrendingDown, color: "red", sub: `${expenses.length} despesas registradas` },
    { label: "Total Pago", value: formatCurrency(summary.pago), icon: DollarSign, color: "emerald", sub: `${summary.total > 0 ? ((summary.pago / summary.total) * 100).toFixed(1) : 0}% do total` },
    { label: "Pendente", value: formatCurrency(summary.pendente), icon: Clock, color: "amber", sub: `${expenses.filter(e => e.status === "PENDENTE").length} itens pendentes` },
    { label: "Ticket Médio", value: formatCurrency(summary.ticketMedio), icon: Calculator, color: "blue", sub: "por despesa" },
    { label: "Custos Fixos", value: formatCurrency(summary.fixo), icon: Layers, color: "purple", sub: `${summary.total > 0 ? ((summary.fixo / summary.total) * 100).toFixed(1) : 0}% do total` },
  ];

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1500 }}>
      {/* Header */}
      <div className="animate-fade-in-up" style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: "'DM Sans', sans-serif", color: "var(--text-primary)", marginBottom: 4 }}>
            Despesas
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Controle financeiro do empreendimento</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X size={16} /> Cancelar</> : <><Plus size={16} /> Nova Despesa</>}
        </button>
      </div>

      {/* ═══ KPIs ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 28 }}>
        {kpis.map((kpi, i) => (
          <div key={i} className={`kpi-card ${kpi.color} animate-fade-in-up stagger-${i + 1}`}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: `var(--accent-${kpi.color}-soft, rgba(100,116,139,0.12))`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <kpi.icon size={20} style={{ color: `var(--accent-${kpi.color})` }} />
              </div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1, marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>{kpi.value}</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500, marginBottom: 4 }}>{kpi.label}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* ═══ Row 1: Despesas por Mês + Receitas x Despesas ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Despesas por Mês */}
        <div className="chart-container animate-fade-in-up stagger-6">
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20, fontFamily: "'DM Sans', sans-serif" }}>Despesas por Mês</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyExpenses}>
              <defs>
                <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="valor" stroke="#EF4444" strokeWidth={2} fill="url(#colorDespesas)" name="Despesas" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Receitas x Despesas */}
        <div className="chart-container animate-fade-in-up stagger-7">
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20, fontFamily: "'DM Sans', sans-serif" }}>Receitas x Despesas</h3>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={revenueVsExpenses}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Receitas" fill="#10B981" radius={[4, 4, 0, 0]} barSize={18} />
              <Bar dataKey="Despesas" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={18} />
              <Line type="monotone" dataKey="Saldo" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3, fill: "#3B82F6" }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: "var(--text-secondary)" }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ═══ Row 2: Top Categorias + Fixo vs Variável ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Top Categorias */}
        <div className="chart-container animate-fade-in-up stagger-8">
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20, fontFamily: "'DM Sans', sans-serif" }}>Despesas por Categoria</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={categoryData} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis type="number" tick={{ fill: "var(--text-muted)", fontSize: 10 }} tickFormatter={v => `R$ ${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fill: "var(--text-secondary)", fontSize: 11 }} width={140} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="valor" radius={[0, 4, 4, 0]} name="Total">
                {categoryData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Fixo vs Variável */}
        <div className="chart-container animate-fade-in-up stagger-9">
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20, fontFamily: "'DM Sans', sans-serif" }}>Fixo vs Variável</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={fixoVsVariavel} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={4} dataKey="value" stroke="none">
                {fixoVsVariavel.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
            {fixoVsVariavel.map(item => (
              <div key={item.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: item.color }} />
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{item.name}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", fontFamily: "'DM Sans', sans-serif" }}>{formatCurrency(item.value)}</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 6 }}>
                    {summary.total > 0 ? ((item.value / summary.total) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Row 3: Top Fornecedores + Forma de Pagamento ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 28 }}>
        {/* Top Fornecedores */}
        <div className="chart-container animate-fade-in-up">
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20, fontFamily: "'DM Sans', sans-serif" }}>Top 10 Fornecedores</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {topFornecedores.map((f, i) => (
              <div key={f.name}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", width: 20, textAlign: "right" }}>{i + 1}º</span>
                    <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{f.name.length > 30 ? f.name.slice(0, 30) + "…" : f.name}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", fontFamily: "'DM Sans', sans-serif" }}>{formatCurrency(f.valor)}</span>
                </div>
                <div style={{ marginLeft: 30, height: 4, borderRadius: 2, background: "var(--border-color)" }}>
                  <div style={{ height: "100%", borderRadius: 2, width: `${f.pct}%`, background: CHART_COLORS[i % CHART_COLORS.length], transition: "width 0.5s ease" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Forma de Pagamento */}
        <div className="chart-container animate-fade-in-up">
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20, fontFamily: "'DM Sans', sans-serif" }}>Forma de Pagamento</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={paymentData} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={4} dataKey="value" stroke="none">
                {paymentData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            {paymentData.map(item => (
              <div key={item.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: item.color }} />
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{item.name}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", fontFamily: "'DM Sans', sans-serif" }}>{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Form ═══ */}
      {showForm && (
        <div className="chart-container animate-fade-in-up" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Nova Despesa</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Data</label>
              <input type="date" value={newExpense.data} onChange={e => setNewExpense({ ...newExpense, data: e.target.value })} style={{ width: "100%" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Categoria</label>
              <select value={newExpense.categoria} onChange={e => setNewExpense({ ...newExpense, categoria: e.target.value })} style={{ width: "100%" }}>
                <option value="">Selecione...</option>
                {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Descrição</label>
              <input type="text" value={newExpense.descricao} onChange={e => setNewExpense({ ...newExpense, descricao: e.target.value })} style={{ width: "100%" }} placeholder="Descrição da despesa" />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Fornecedor</label>
              <input type="text" value={newExpense.fornecedor} onChange={e => setNewExpense({ ...newExpense, fornecedor: e.target.value })} style={{ width: "100%" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Valor (R$)</label>
              <input type="number" value={newExpense.valor} onChange={e => setNewExpense({ ...newExpense, valor: parseFloat(e.target.value) || 0 })} style={{ width: "100%" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Forma Pagamento</label>
              <select value={newExpense.formaPgto} onChange={e => setNewExpense({ ...newExpense, formaPgto: e.target.value })} style={{ width: "100%" }}>
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Status</label>
              <select value={newExpense.status} onChange={e => setNewExpense({ ...newExpense, status: e.target.value as Expense["status"] })} style={{ width: "100%" }}>
                <option value="PAGO">PAGO</option>
                <option value="PENDENTE">PENDENTE</option>
              </select>
            </div>
          </div>
          <button className="btn-primary" onClick={handleAdd}><Save size={16} /> Salvar Despesa</button>
        </div>
      )}

      {/* ═══ Filters + Table ═══ */}
      <div className="animate-fade-in-up" style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input className="search-input" placeholder="Buscar despesa..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ minWidth: 140 }}>
          <option value="TODOS">Todas categorias</option>
          {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div style={{ display: "flex", gap: 6 }}>
          {["TODOS", "PAGO", "PENDENTE"].map(f => (
            <button key={f} className={`filter-chip ${filterStatus === f ? "active" : ""}`} onClick={() => setFilterStatus(f)}>
              {f === "TODOS" ? "Todos" : f}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-container animate-fade-in-up" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ maxHeight: "calc(100vh - 400px)", overflow: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Data</th><th>Categoria</th><th>Descrição</th><th>Fornecedor</th><th>Valor</th><th>Pgto</th><th>Status</th><th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id}>
                  <td style={{ fontSize: 12 }}>{formatDate(e.data)}</td>
                  <td><span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "var(--bg-surface)", color: "var(--text-secondary)" }}>{e.categoria}</span></td>
                  <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>{e.descricao}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{e.fornecedor}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(e.valor)}</td>
                  <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{e.formaPgto}</td>
                  <td><span className={`status-badge status-${e.status.toLowerCase()}`}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }}></span>{e.status}</span></td>
                  <td><button onClick={() => handleDelete(e.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }} title="Excluir"><Trash2 size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
