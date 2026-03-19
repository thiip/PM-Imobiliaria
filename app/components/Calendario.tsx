"use client";
import { useState, useMemo } from "react";
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, X,
  AlertCircle, Clock, CheckCircle2, Circle
} from "lucide-react";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths,
  isSameMonth, isSameDay, format, isToday
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { generateInstallments, formatCurrency, type Installment } from "../data";

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: typeof AlertCircle; label: string }> = {
  VENCIDO: { color: "#EF4444", bg: "rgba(239,68,68,0.12)", icon: AlertCircle, label: "Vencido" },
  "VENCE ESTE MÊS": { color: "#F59E0B", bg: "rgba(245,158,11,0.12)", icon: Clock, label: "Vence este mês" },
  "A VENCER": { color: "#3B82F6", bg: "rgba(59,130,246,0.12)", icon: Circle, label: "A Vencer" },
  PAGO: { color: "#10B981", bg: "rgba(16,185,129,0.12)", icon: CheckCircle2, label: "Pago" },
};

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function Calendario() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const installments = useMemo(() => generateInstallments(), []);

  // Group installments by date key (YYYY-MM-DD)
  const installmentsByDate = useMemo(() => {
    const map = new Map<string, Installment[]>();
    for (const inst of installments) {
      if (inst.status === "PAGO") continue;
      const key = format(inst.dataVencimento, "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(inst);
    }
    return map;
  }, [installments]);

  // Calendar grid days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { locale: ptBR });
    const calEnd = endOfWeek(monthEnd, { locale: ptBR });

    const days: Date[] = [];
    let day = calStart;
    while (day <= calEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  // Selected day installments
  const selectedInstallments = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, "yyyy-MM-dd");
    return installmentsByDate.get(key) || [];
  }, [selectedDate, installmentsByDate]);

  // Stats for the current month
  const monthStats = useMemo(() => {
    const monthKey = format(currentMonth, "yyyy-MM");
    let total = 0, vencidas = 0, aVencer = 0, valor = 0;
    for (const [key, insts] of installmentsByDate) {
      if (key.startsWith(monthKey)) {
        total += insts.length;
        valor += insts.reduce((s, i) => s + i.valor, 0);
        for (const i of insts) {
          if (i.status === "VENCIDO") vencidas++;
          else aVencer++;
        }
      }
    }
    return { total, vencidas, aVencer, valor };
  }, [currentMonth, installmentsByDate]);

  const getDayIndicator = (day: Date) => {
    const key = format(day, "yyyy-MM-dd");
    const insts = installmentsByDate.get(key);
    if (!insts || insts.length === 0) return null;

    const hasVencido = insts.some(i => i.status === "VENCIDO");
    const hasVenceEsteMes = insts.some(i => i.status === "VENCE ESTE MÊS");
    const hasAVencer = insts.some(i => i.status === "A VENCER");

    if (hasVencido) return { color: "#EF4444", count: insts.length };
    if (hasVenceEsteMes) return { color: "#F59E0B", count: insts.length };
    if (hasAVencer) return { color: "#3B82F6", count: insts.length };
    return { color: "var(--text-muted)", count: insts.length };
  };

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1200, margin: "0 auto" }}>

      {/* Month stats cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total de Parcelas", value: monthStats.total, color: "#C8E64A" },
          { label: "Vencidas", value: monthStats.vencidas, color: "#EF4444" },
          { label: "A Vencer", value: monthStats.aVencer, color: "#3B82F6" },
          { label: "Valor Total", value: formatCurrency(monthStats.valor), color: "#10B981" },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 14, padding: "16px 18px",
          }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: stat.color }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selectedDate ? "1fr minmax(300px, 380px)" : "1fr", gap: 20 }}
        className="calendario-grid">
        {/* Calendar Grid */}
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 18, padding: 24, overflow: "hidden",
        }}>
          {/* Month navigation */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                color: "var(--text-secondary)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
              <ChevronLeft size={18} />
            </button>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", textTransform: "capitalize", margin: 0 }}>
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </h2>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                color: "var(--text-secondary)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Weekday headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
            {WEEKDAYS.map((d) => (
              <div key={d} style={{
                textAlign: "center", fontSize: 11, fontWeight: 700, color: "var(--text-muted)",
                textTransform: "uppercase", letterSpacing: "0.06em", padding: "8px 0",
              }}>
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {calendarDays.map((day, idx) => {
              const inMonth = isSameMonth(day, currentMonth);
              const today = isToday(day);
              const selected = selectedDate && isSameDay(day, selectedDate);
              const indicator = getDayIndicator(day);

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(selected ? null : day)}
                  style={{
                    position: "relative",
                    aspectRatio: "1",
                    borderRadius: 12,
                    border: selected ? "2px solid #C8E64A" : today ? "1px solid rgba(200,230,74,0.3)" : "1px solid transparent",
                    background: selected ? "rgba(200,230,74,0.10)" : today ? "rgba(200,230,74,0.05)" : "rgba(255,255,255,0.02)",
                    color: !inMonth ? "rgba(255,255,255,0.15)" : today ? "#C8E64A" : "var(--text-primary)",
                    cursor: "pointer",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    gap: 3,
                    fontSize: 14, fontWeight: today ? 800 : 500,
                    transition: "all 0.15s",
                    padding: 4,
                    minHeight: 56,
                  }}
                >
                  <span>{format(day, "d")}</span>
                  {indicator && inMonth && (
                    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <div style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: indicator.color,
                      }} />
                      <span style={{ fontSize: 9, fontWeight: 700, color: indicator.color }}>
                        {indicator.count}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
            {[
              { color: "#EF4444", label: "Vencido" },
              { color: "#F59E0B", label: "Vence este mês" },
              { color: "#3B82F6", label: "A Vencer" },
            ].map((l) => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Side panel - selected day details */}
        {selectedDate && (
          <div style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 18, padding: 20, overflow: "auto", maxHeight: "calc(100vh - 300px)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600, textTransform: "capitalize" }}>
                  {format(selectedDate, "EEEE", { locale: ptBR })}
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>
                  {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                </div>
              </div>
              <button onClick={() => setSelectedDate(null)}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                  color: "var(--text-muted)", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                <X size={16} />
              </button>
            </div>

            {selectedInstallments.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "40px 20px",
                color: "var(--text-muted)", fontSize: 13,
              }}>
                <CalendarIcon size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
                <div>Nenhuma parcela neste dia</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: "var(--text-muted)",
                  textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4,
                }}>
                  {selectedInstallments.length} parcela{selectedInstallments.length > 1 ? "s" : ""}
                </div>
                {selectedInstallments.map((inst, i) => {
                  const cfg = STATUS_CONFIG[inst.status] || STATUS_CONFIG["A VENCER"];
                  const Icon = cfg.icon;
                  return (
                    <div key={i} style={{
                      background: cfg.bg, border: `1px solid ${cfg.color}22`,
                      borderRadius: 12, padding: "14px 16px",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Icon size={14} style={{ color: cfg.color }} />
                          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                            {inst.cliente}
                          </span>
                        </div>
                        <span style={{
                          fontSize: 10, fontWeight: 700, color: cfg.color,
                          background: `${cfg.color}15`, padding: "3px 8px", borderRadius: 6,
                        }}>
                          {cfg.label}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-secondary)" }}>
                        <span>Q{inst.quadra} L{inst.lote}</span>
                        <span>Parcela {inst.parcela}/{inst.totalParcelas}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>
                          {formatCurrency(inst.valor)}
                        </span>
                        {inst.diasAtraso > 0 && (
                          <span style={{ fontSize: 11, color: "#EF4444", fontWeight: 600 }}>
                            {inst.diasAtraso} dias atraso
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {/* Total */}
                <div style={{
                  borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 8, paddingTop: 12,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>Total do dia</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#C8E64A" }}>
                    {formatCurrency(selectedInstallments.reduce((s, i) => s + i.valor, 0))}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .calendario-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
