"use client";
import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { MapPin, ZoomIn, ZoomOut, Grid3x3, Map as MapIcon, RotateCcw, ExternalLink, Navigation, Plus, FileText, Calculator, X } from "lucide-react";
import { getLots, getSales, formatCurrency, perimeterCoords, addSale, updateLotStatus, getNextSaleId } from "../data";
import { LOT_POLYGONS } from "../lotPolygons";

const STATUS_COLORS: Record<string, { fill: string; stroke: string }> = {
  disponivel: { fill: "rgba(16,185,129,0.4)", stroke: "rgba(16,185,129,0.7)" },
  vendido: { fill: "rgba(59,130,246,0.35)", stroke: "rgba(59,130,246,0.6)" },
  quitado: { fill: "rgba(139,92,246,0.4)", stroke: "rgba(139,92,246,0.7)" },
};

const STATUS_COLORS_HOVER: Record<string, { fill: string; stroke: string }> = {
  disponivel: { fill: "rgba(16,185,129,0.65)", stroke: "#10B981" },
  vendido: { fill: "rgba(59,130,246,0.55)", stroke: "#3B82F6" },
  quitado: { fill: "rgba(139,92,246,0.6)", stroke: "#8B5CF6" },
};

const STATUS_COLORS_SELECTED: Record<string, { fill: string; stroke: string }> = {
  disponivel: { fill: "rgba(16,185,129,0.85)", stroke: "#10B981" },
  vendido: { fill: "rgba(59,130,246,0.75)", stroke: "#3B82F6" },
  quitado: { fill: "rgba(139,92,246,0.75)", stroke: "#8B5CF6" },
};

// UTM SIRGAS2000 Zone 23S ranges (from Memorial Descritivo)
const UTM_E_MIN = 750572.65, UTM_E_MAX = 751169.75;
const UTM_N_MIN = 7918359.94, UTM_N_MAX = 7918857.54;

function svgToLatLng(svgX: number, svgY: number): [number, number] {
  const e = UTM_E_MIN + (svgX / 1000) * (UTM_E_MAX - UTM_E_MIN);
  const n = UTM_N_MAX - (svgY / 1000) * (UTM_N_MAX - UTM_N_MIN);
  // UTM Zone 23S to WGS84
  const a = 6378137.0, f = 1 / 298.257223563;
  const e2 = 2 * f - f * f, ep2 = e2 / (1 - e2), k0 = 0.9996;
  const x = e - 500000.0, y = n - 10000000.0;
  const M = y / k0;
  const mu = M / (a * (1 - e2 / 4 - 3 * e2 * e2 / 64 - 5 * e2 * e2 * e2 / 256));
  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
  const phi1 = mu + (3 * e1 / 2 - 27 * e1 * e1 * e1 / 32) * Math.sin(2 * mu) + (21 * e1 * e1 / 16 - 55 * e1 * e1 * e1 * e1 / 32) * Math.sin(4 * mu) + (151 * e1 * e1 * e1 / 96) * Math.sin(6 * mu);
  const N1 = a / Math.sqrt(1 - e2 * Math.sin(phi1) ** 2);
  const T1 = Math.tan(phi1) ** 2;
  const C1 = ep2 * Math.cos(phi1) ** 2;
  const R1 = a * (1 - e2) / (1 - e2 * Math.sin(phi1) ** 2) ** 1.5;
  const D = x / (N1 * k0);
  const lat = phi1 - (N1 * Math.tan(phi1) / R1) * (D * D / 2 - (5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * ep2) * D ** 4 / 24 + (61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * ep2 - 3 * C1 * C1) * D ** 6 / 720);
  const lon0 = (23 - 1) * 6 - 180 + 3;
  const lon = lon0 * Math.PI / 180 + (D - (1 + 2 * T1 + C1) * D ** 3 / 6 + (5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * ep2 + 24 * T1 * T1) * D ** 5 / 120) / Math.cos(phi1);
  return [lat * 180 / Math.PI, lon * 180 / Math.PI];
}

function getLotLatLng(quadra: number, lote: number): [number, number] | null {
  const key = `QD${quadra}_LT${lote}`;
  const poly = LOT_POLYGONS[key];
  if (!poly || poly.length === 0) return null;
  const [cx, cy] = polygonCentroid(poly);
  return svgToLatLng(cx, cy);
}

function polygonCentroid(pts: number[][]): [number, number] {
  let cx = 0, cy = 0;
  for (const [x, y] of pts) { cx += x; cy += y; }
  return [cx / pts.length, cy / pts.length];
}

function polygonToSvgPath(pts: number[][]): string {
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]} ${p[1]}`).join(" ") + " Z";
}

export default function MapaLotes() {
  const [dataVersion, setDataVersion] = useState(0);
  const lots = useMemo(() => getLots(), [dataVersion]);
  const sales = useMemo(() => getSales(), [dataVersion]);
  const [selectedLot, setSelectedLot] = useState<{ quadra: number; lote: number } | null>(null);
  const [filterQuadra, setFilterQuadra] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"map" | "grid">("map");
  const [zoom, setZoom] = useState(1);
  const [hoveredLot, setHoveredLot] = useState<string | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [saleForm, setSaleForm] = useState({
    nome: "", cpf: "", valor: "", entrada: "", dataEntrada: "",
    numParcelas: "", dataPrimeiraParcela: "", juros: "0", obs: "",
  });
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const gridRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const svgContainerRef = useRef<HTMLDivElement>(null);

  const saleLookup = useMemo(() => {
    const map = new Map<string, (typeof sales)[0]>();
    sales.filter(s => s.situacao !== "CANCELADO").forEach(s => {
      map.set(`${s.quadra}-${s.lote}`, s);
    });
    return map;
  }, [sales]);

  const quadras = useMemo(() => {
    const map = new Map<number, (typeof lots)>();
    lots.forEach(l => {
      if (!map.has(l.quadra)) map.set(l.quadra, []);
      map.get(l.quadra)!.push(l);
    });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [lots]);

  const selectedLotData = useMemo(() => {
    if (!selectedLot) return null;
    const lot = lots.find(l => l.quadra === selectedLot.quadra && l.lote === selectedLot.lote);
    const sale = saleLookup.get(`${selectedLot.quadra}-${selectedLot.lote}`);
    return { lot, sale };
  }, [selectedLot, lots, saleLookup]);

  const getStatusKey = (situacao: string) => {
    if (situacao === "IMOB.") return "disponivel";
    if (situacao === "QUITADO") return "quitado";
    return "vendido";
  };

  const filteredQuadras = filterQuadra ? quadras.filter(([q]) => q === filterQuadra) : quadras;

  // Sale form calculations
  const saleCalc = useMemo(() => {
    const valor = parseFloat(saleForm.valor) || 0;
    const entrada = parseFloat(saleForm.entrada) || 0;
    const n = parseInt(saleForm.numParcelas) || 0;
    const jurosMensal = parseFloat(saleForm.juros) || 0;
    const saldo = Math.max(0, valor - entrada);
    let valorParcela = 0;
    let totalComJuros = saldo;
    if (n > 0 && saldo > 0) {
      if (jurosMensal > 0) {
        const i = jurosMensal / 100;
        valorParcela = saldo * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
        totalComJuros = valorParcela * n;
      } else {
        valorParcela = saldo / n;
      }
    }
    return { saldo, valorParcela, totalComJuros, jurosTotal: totalComJuros - saldo };
  }, [saleForm.valor, saleForm.entrada, saleForm.numParcelas, saleForm.juros]);

  const handleSaleSubmit = () => {
    if (!selectedLotData?.lot) return;
    const lot = selectedLotData.lot;
    const id = getNextSaleId();
    const newSale = {
      id,
      nome: saleForm.nome.toUpperCase(),
      cpf: saleForm.cpf,
      quadra: lot.quadra,
      lote: lot.lote,
      area: lot.area,
      valor: parseFloat(saleForm.valor) || 0,
      entrada: parseFloat(saleForm.entrada) || 0,
      dataEntrada: saleForm.dataEntrada || null,
      numParcelas: parseInt(saleForm.numParcelas) || 0,
      dataPrimeiraParcela: saleForm.dataPrimeiraParcela || null,
      valorParcela: Math.round(saleCalc.valorParcela * 100) / 100,
      situacao: "ATIVO" as const,
      obs: saleForm.obs,
    };
    addSale(newSale);
    updateLotStatus(lot.quadra, lot.lote, "VENDIDO", saleForm.nome.toUpperCase(), saleForm.cpf);
    setShowSaleForm(false);
    setSaleForm({ nome: "", cpf: "", valor: "", entrada: "", dataEntrada: "", numParcelas: "", dataPrimeiraParcela: "", juros: "0", obs: "" });
    setDataVersion(v => v + 1);
  };

  const canSubmitSale = saleForm.nome.trim() && saleForm.cpf.trim() && parseFloat(saleForm.valor) > 0 && parseFloat(saleForm.entrada) >= 0 && saleForm.dataEntrada && parseInt(saleForm.numParcelas) > 0 && saleForm.dataPrimeiraParcela;

  const stats = useMemo(() => {
    const vendidos = lots.filter(l => l.situacao === "VENDIDO").length;
    const disponiveis = lots.filter(l => l.situacao === "IMOB.").length;
    const quitados = lots.filter(l => l.situacao === "QUITADO").length;
    return { vendidos, disponiveis, quitados, total: lots.length };
  }, [lots]);

  const perimeterPath = useMemo(() => {
    if (!perimeterCoords.length) return "";
    return perimeterCoords.map((c, i) => `${i === 0 ? "M" : "L"}${c[0]} ${c[1]}`).join(" ") + " Z";
  }, []);

  // Compute tight bounding box from all lot polygons for optimal viewBox
  const lotBounds = useMemo(() => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const pts of Object.values(LOT_POLYGONS)) {
      for (const [x, y] of pts) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
    const pad = 25;
    return {
      x: minX - pad,
      y: minY - pad,
      w: maxX - minX + pad * 2,
      h: maxY - minY + pad * 2,
    };
  }, []);

  // Compute quadra label positions from polygon centroids
  const quadraLabels = useMemo(() => {
    const labels = new Map<number, [number, number]>();
    const quadraPoints = new Map<number, number[][]>();

    for (const [key, pts] of Object.entries(LOT_POLYGONS)) {
      const match = key.match(/QD(\d+)/);
      if (!match) continue;
      const q = parseInt(match[1]);
      if (!quadraPoints.has(q)) quadraPoints.set(q, []);
      for (const p of pts) quadraPoints.get(q)!.push(p);
    }

    for (const [q, pts] of quadraPoints) {
      const [cx, cy] = polygonCentroid(pts);
      labels.set(q, [cx, cy]);
    }
    return labels;
  }, []);

  const handleLotClick = useCallback((quadra: number, lote: number) => {
    setSelectedLot(prev =>
      prev?.quadra === quadra && prev?.lote === lote ? null : { quadra, lote }
    );
  }, []);

  useEffect(() => {
    if (selectedLot && viewMode === "map") {
      const key = `${selectedLot.quadra}-${selectedLot.lote}`;
      const el = gridRefs.current.get(key);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedLot, viewMode]);

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  }, [zoom, pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    setPan({ x: panStart.current.panX + dx, y: panStart.current.panY + dy });
  }, [isPanning]);

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  const resetView = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, []);

  const lotKey = (q: number, l: number) => `${q}-${l}`;

  return (
    <div style={{ padding: "28px 32px" }}>
      <div className="animate-fade-in-up" style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: "'DM Sans', sans-serif", color: "var(--text-primary)", marginBottom: 4 }}>
            Mapa de Lotes
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Loteamento Vista Alegre &middot; {stats.total} lotes &middot; 130.850 m²
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            className={`filter-chip ${viewMode === "map" ? "active" : ""}`}
            onClick={() => setViewMode("map")}
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            <MapIcon size={13} /> Mapa
          </button>
          <button
            className={`filter-chip ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => setViewMode("grid")}
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            <Grid3x3 size={13} /> Grade
          </button>
        </div>
      </div>

      {/* Legend + Filters */}
      <div className="animate-fade-in-up stagger-1" style={{ display: "flex", gap: 20, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, background: "rgba(16,185,129,0.5)", border: "1px solid rgba(16,185,129,0.4)" }} />
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Disponível ({stats.disponiveis})</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, background: "rgba(59,130,246,0.45)", border: "1px solid rgba(59,130,246,0.4)" }} />
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Vendido ({stats.vendidos})</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, background: "rgba(139,92,246,0.5)", border: "1px solid rgba(139,92,246,0.4)" }} />
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Quitado ({stats.quitados})</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 5, flexWrap: "wrap" }}>
          <button className={`filter-chip ${!filterQuadra ? "active" : ""}`} onClick={() => setFilterQuadra(null)} style={{ fontSize: 11 }}>Todas</button>
          {quadras.map(([q]) => (
            <button key={q} className={`filter-chip ${filterQuadra === q ? "active" : ""}`} onClick={() => setFilterQuadra(q)} style={{ fontSize: 11 }}>
              {q}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* SVG Map with real polygons */}
          {viewMode === "map" && (
            <div className="chart-container animate-fade-in-up" style={{ marginBottom: 20, position: "relative", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <MapPin size={16} style={{ color: "var(--accent-emerald)" }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Mapa Interativo do Loteamento</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Clique em um lote para ver detalhes</span>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => setZoom(z => Math.min(z + 0.3, 4))} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-light)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "var(--text-secondary)" }}>
                    <ZoomIn size={14} />
                  </button>
                  <button onClick={() => { setZoom(z => Math.max(z - 0.3, 0.7)); if (zoom <= 1.3) setPan({ x: 0, y: 0 }); }} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-light)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "var(--text-secondary)" }}>
                    <ZoomOut size={14} />
                  </button>
                  <button onClick={resetView} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-light)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "var(--text-secondary)" }}>
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>

              <div
                ref={svgContainerRef}
                style={{ overflow: "auto", height: "calc(100vh - 320px)", minHeight: 400, cursor: zoom > 1 ? (isPanning ? "grabbing" : "grab") : "default" }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <svg
                  viewBox={`${lotBounds.x} ${lotBounds.y} ${lotBounds.w} ${lotBounds.h}`}
                  style={{
                    width: `${100 * zoom}%`,
                    height: `${100 * zoom}%`,
                    minHeight: "100%",
                    transition: isPanning ? "none" : "transform 0.3s ease",
                    transform: `translate(${pan.x}px, ${pan.y}px)`,
                  }}
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    <pattern id="mapGrid" width="50" height="50" patternUnits="userSpaceOnUse">
                      <path d="M 50 0 L 0 0 0 50" fill="none" stroke="var(--border-color)" strokeWidth="0.3" opacity="0.2" />
                    </pattern>
                    <filter id="selectedGlow">
                      <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#10B981" floodOpacity="0.9" />
                    </filter>
                    <filter id="hoverGlow">
                      <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#ffffff" floodOpacity="0.4" />
                    </filter>
                  </defs>

                  <rect x={lotBounds.x - 50} y={lotBounds.y - 50} width={lotBounds.w + 100} height={lotBounds.h + 100} fill="url(#mapGrid)" />

                  {/* Perimeter outline */}
                  <path
                    d={perimeterPath}
                    fill="rgba(16, 185, 129, 0.03)"
                    stroke="var(--accent-emerald)"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    opacity="0.5"
                  />

                  {/* Lot polygons from Memorial Descritivo coordinates */}
                  {lots.map(lot => {
                    const polyKey = `QD${lot.quadra}_LT${lot.lote}`;
                    const pts = LOT_POLYGONS[polyKey];
                    if (!pts || pts.length < 3) return null;
                    if (filterQuadra && filterQuadra !== lot.quadra) return null;

                    const statusKey = getStatusKey(lot.situacao);
                    const key = lotKey(lot.quadra, lot.lote);
                    const isSelected = selectedLot?.quadra === lot.quadra && selectedLot?.lote === lot.lote;
                    const isHovered = hoveredLot === key;
                    const colors = isSelected ? STATUS_COLORS_SELECTED[statusKey] : isHovered ? STATUS_COLORS_HOVER[statusKey] : STATUS_COLORS[statusKey];
                    const [cx, cy] = polygonCentroid(pts);

                    return (
                      <g
                        key={key}
                        onClick={() => handleLotClick(lot.quadra, lot.lote)}
                        onMouseEnter={() => setHoveredLot(key)}
                        onMouseLeave={() => setHoveredLot(null)}
                        style={{ cursor: "pointer" }}
                        filter={isSelected ? "url(#selectedGlow)" : isHovered ? "url(#hoverGlow)" : undefined}
                      >
                        <path
                          d={polygonToSvgPath(pts)}
                          fill={colors.fill}
                          stroke={isSelected || isHovered ? colors.stroke : "rgba(255,255,255,0.15)"}
                          strokeWidth={isSelected ? 2 : isHovered ? 1.2 : 0.4}
                          strokeLinejoin="round"
                        />
                        {/* Lot number label */}
                        <text
                          x={cx}
                          y={cy + 2}
                          fill={isSelected || isHovered ? "#fff" : "rgba(255,255,255,0.55)"}
                          fontSize={isSelected ? "8" : "6"}
                          fontFamily="DM Sans"
                          fontWeight={isSelected ? "800" : "600"}
                          textAnchor="middle"
                          pointerEvents="none"
                        >
                          {lot.lote}
                        </text>
                      </g>
                    );
                  })}

                  {/* Quadra labels */}
                  {Array.from(quadraLabels.entries()).map(([q, [cx, cy]]) => {
                    if (filterQuadra && filterQuadra !== q) return null;
                    const isHighlighted = selectedLot?.quadra === q;
                    return (
                      <text
                        key={`ql-${q}`}
                        x={cx}
                        y={cy - 20}
                        fill={isHighlighted ? "#10B981" : "rgba(255,255,255,0.35)"}
                        fontSize="10"
                        fontFamily="DM Sans"
                        fontWeight="800"
                        textAnchor="middle"
                        pointerEvents="none"
                        style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
                      >
                        QD {q}
                      </text>
                    );
                  })}

                  {/* Compass */}
                  <g transform="translate(980, 30)">
                    <circle cx="0" cy="0" r="16" fill="var(--bg-card)" stroke="var(--border-light)" strokeWidth="0.5" opacity="0.8" />
                    <polygon points="0,-12 -3,-6 3,-6" fill="var(--accent-red)" opacity="0.7" />
                    <polygon points="0,12 -3,6 3,6" fill="var(--text-muted)" opacity="0.4" />
                    <text x="0" y="-18" fill="var(--text-muted)" fontSize="6" fontFamily="DM Sans" textAnchor="middle">N</text>
                  </g>

                  {/* Hover tooltip */}
                  {hoveredLot && !selectedLot && (() => {
                    const [q, l] = hoveredLot.split("-").map(Number);
                    const polyKey = `QD${q}_LT${l}`;
                    const pts = LOT_POLYGONS[polyKey];
                    if (!pts) return null;
                    const lot = lots.find(lt => lt.quadra === q && lt.lote === l);
                    if (!lot) return null;
                    const [cx, cy] = polygonCentroid(pts);
                    const tx = Math.min(cx + 10, 910);
                    const ty = Math.max(cy - 32, 10);

                    return (
                      <g pointerEvents="none">
                        <rect x={tx} y={ty} width="100" height="28" fill="var(--bg-card)" stroke="var(--border-light)" strokeWidth="0.5" rx="4" opacity="0.95" />
                        <text x={tx + 8} y={ty + 11} fill="var(--text-primary)" fontSize="8" fontFamily="DM Sans" fontWeight="700">
                          QD {lot.quadra} / LT {lot.lote}
                        </text>
                        <text x={tx + 8} y={ty + 22} fill="var(--text-muted)" fontSize="6.5" fontFamily="DM Sans">
                          {lot.area > 0 ? `${lot.area} m²` : ""} · {lot.situacao === "IMOB." ? "DISPONÍVEL" : lot.situacao}
                        </text>
                      </g>
                    );
                  })()}
                </svg>
              </div>
            </div>
          )}

          {/* Grid view */}
          {viewMode === "grid" && (
            <div>
              {filteredQuadras.map(([quadra, quadraLots]) => (
                <div key={quadra} className="chart-container animate-fade-in-up" style={{ marginBottom: 16, padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div style={{
                      background: selectedLot?.quadra === quadra ? "var(--accent-emerald)" : "var(--accent-emerald-soft)",
                      color: selectedLot?.quadra === quadra ? "#fff" : "var(--accent-emerald)",
                      padding: "3px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, transition: "all 0.2s",
                    }}>
                      QD {quadra}
                    </div>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {quadraLots.length} lotes &middot; {quadraLots[0]?.rua}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: "auto" }}>
                      <span style={{ color: "#34D399" }}>{quadraLots.filter(l => l.situacao === "IMOB.").length}</span>
                      {" / "}
                      <span style={{ color: "#60A5FA" }}>{quadraLots.filter(l => l.situacao === "VENDIDO").length}</span>
                      {" / "}
                      <span style={{ color: "#A78BFA" }}>{quadraLots.filter(l => l.situacao === "QUITADO").length}</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {[...quadraLots].sort((a, b) => a.lote - b.lote).map(lot => {
                      const isSelected = selectedLot?.quadra === lot.quadra && selectedLot?.lote === lot.lote;
                      return (
                        <div
                          key={lotKey(lot.quadra, lot.lote)}
                          ref={el => { if (el) gridRefs.current.set(lotKey(lot.quadra, lot.lote), el); }}
                          className={`lot-cell ${getStatusKey(lot.situacao)}`}
                          onClick={() => handleLotClick(lot.quadra, lot.lote)}
                          style={{
                            outline: isSelected ? "2px solid var(--accent-emerald)" : "none",
                            outlineOffset: 1,
                            transform: isSelected ? "scale(1.1)" : "none",
                            transition: "all 0.15s ease",
                            zIndex: isSelected ? 2 : 1,
                            position: "relative",
                          }}
                        >
                          <span>{lot.lote}</span>
                          <span style={{ fontSize: 8, opacity: 0.6 }}>{lot.area > 0 ? `${lot.area}` : ""}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedLotData && selectedLotData.lot && (
          <div className="chart-container animate-fade-in-up" style={{ width: 320, position: "sticky", top: 28, alignSelf: "flex-start", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: "var(--accent-emerald-soft)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <MapPin size={20} style={{ color: "var(--accent-emerald)" }} />
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)" }}>
                  QD {selectedLotData.lot.quadra} / LT {selectedLotData.lot.lote}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{selectedLotData.lot.rua}</div>
              </div>
              <button
                onClick={() => setSelectedLot(null)}
                style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 18, lineHeight: 1 }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <DetailRow label="Situação" value={
                <span className={`status-badge status-${getStatusKey(selectedLotData.lot.situacao)}`}>
                  {selectedLotData.lot.situacao === "IMOB." ? "DISPONÍVEL" : selectedLotData.lot.situacao}
                </span>
              } />
              <DetailRow label="Área" value={selectedLotData.lot.area > 0 ? `${selectedLotData.lot.area} m²` : "-"} />
              <DetailRow label="Inscrição" value={selectedLotData.lot.inscricao || "-"} />

              {(() => {
                const coords = getLotLatLng(selectedLotData.lot.quadra, selectedLotData.lot.lote);
                if (!coords) return null;
                const [lat, lng] = coords;
                const mapsUrl = `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}&z=19&t=s`;
                return (
                  <>
                    <DetailRow label="Coordenadas" value={
                      <span style={{ fontSize: 11, fontFamily: "'DM Sans', monospace" }}>
                        {lat.toFixed(6)}, {lng.toFixed(6)}
                      </span>
                    } />
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        padding: "10px 14px",
                        borderRadius: 10,
                        background: "rgba(59,130,246,0.12)",
                        color: "#3B82F6",
                        fontSize: 12,
                        fontWeight: 700,
                        textDecoration: "none",
                        transition: "background 0.2s",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(59,130,246,0.22)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(59,130,246,0.12)")}
                    >
                      <Navigation size={14} />
                      Ver no Google Maps
                      <ExternalLink size={12} />
                    </a>
                  </>
                );
              })()}

              {selectedLotData.lot.proprietario && (
                <>
                  <div style={{ height: 1, background: "var(--border-color)", margin: "2px 0" }} />
                  <DetailRow label="Proprietário" value={selectedLotData.lot.proprietario} />
                  <DetailRow label="CPF" value={selectedLotData.lot.cpf || "-"} />
                </>
              )}

              {selectedLotData.sale && (
                <>
                  <div style={{ height: 1, background: "var(--border-color)", margin: "2px 0" }} />
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-emerald)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Dados da Venda
                  </div>
                  <DetailRow label="Valor" value={selectedLotData.sale.valor > 0 ? formatCurrency(selectedLotData.sale.valor) : "-"} />
                  <DetailRow label="Entrada" value={selectedLotData.sale.entrada > 0 ? formatCurrency(selectedLotData.sale.entrada) : "-"} />
                  {selectedLotData.sale.numParcelas > 0 && (
                    <DetailRow label="Parcelas" value={`${selectedLotData.sale.numParcelas}x de ${formatCurrency(selectedLotData.sale.valorParcela)}`} />
                  )}
                  {selectedLotData.sale.obs && <DetailRow label="Obs" value={selectedLotData.sale.obs} />}
                </>
              )}

              {/* Botão Cadastrar Venda (só para lotes disponíveis) */}
              {selectedLotData.lot.situacao === "IMOB." && !selectedLotData.sale && (
                <>
                  <div style={{ height: 1, background: "var(--border-color)", margin: "4px 0" }} />
                  <button
                    onClick={() => setShowSaleForm(true)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      width: "100%", padding: "12px", borderRadius: 12, border: "none",
                      background: "var(--accent-emerald)", color: "#fff",
                      fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                  >
                    <Plus size={16} /> Cadastrar Venda
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Modal de Nova Venda */}
        {showSaleForm && selectedLotData?.lot && (
          <>
            <div onClick={() => setShowSaleForm(false)} style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
              zIndex: 100,
            }} />
            <div style={{
              position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
              width: "95%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto",
              background: "rgba(20,18,22,0.95)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20,
              padding: "28px 24px", zIndex: 101, boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
            }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", fontFamily: "'DM Sans', sans-serif" }}>
                    Nova Venda
                  </h3>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    QD {selectedLotData.lot.quadra} / LT {selectedLotData.lot.lote} · {selectedLotData.lot.area} m² · {selectedLotData.lot.rua}
                  </p>
                </div>
                <button onClick={() => setShowSaleForm(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-emerald)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Dados do Comprador
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Nome *</label>
                    <input type="text" placeholder="Nome completo" value={saleForm.nome}
                      onChange={e => setSaleForm(f => ({ ...f, nome: e.target.value }))}
                      style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "var(--text-primary)", fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>CPF *</label>
                    <input type="text" placeholder="000.000.000-00" value={saleForm.cpf}
                      onChange={e => setSaleForm(f => ({ ...f, cpf: e.target.value }))}
                      style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "var(--text-primary)", fontSize: 13 }}
                    />
                  </div>
                </div>

                <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "2px 0" }} />
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-blue)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Valores e Pagamento
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Valor Total (R$) *</label>
                    <input type="number" placeholder="130000" value={saleForm.valor}
                      onChange={e => setSaleForm(f => ({ ...f, valor: e.target.value }))}
                      style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "var(--text-primary)", fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Entrada (R$) *</label>
                    <input type="number" placeholder="20000" value={saleForm.entrada}
                      onChange={e => setSaleForm(f => ({ ...f, entrada: e.target.value }))}
                      style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "var(--text-primary)", fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Data da Entrada *</label>
                    <input type="date" value={saleForm.dataEntrada}
                      onChange={e => setSaleForm(f => ({ ...f, dataEntrada: e.target.value }))}
                      style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "var(--text-primary)", fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Nº de Parcelas *</label>
                    <input type="number" placeholder="18" value={saleForm.numParcelas}
                      onChange={e => setSaleForm(f => ({ ...f, numParcelas: e.target.value }))}
                      style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "var(--text-primary)", fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Data 1ª Parcela *</label>
                    <input type="date" value={saleForm.dataPrimeiraParcela}
                      onChange={e => setSaleForm(f => ({ ...f, dataPrimeiraParcela: e.target.value }))}
                      style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "var(--text-primary)", fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Juros (% a.m.)</label>
                    <input type="number" step="0.1" placeholder="0" value={saleForm.juros}
                      onChange={e => setSaleForm(f => ({ ...f, juros: e.target.value }))}
                      style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "var(--text-primary)", fontSize: 13 }}
                    />
                  </div>
                </div>

                {/* Cálculos em tempo real */}
                {saleCalc.saldo > 0 && parseInt(saleForm.numParcelas) > 0 && (
                  <div style={{
                    background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)",
                    borderRadius: 12, padding: "14px 16px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                      <Calculator size={14} style={{ color: "var(--accent-emerald)" }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-emerald)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Simulação</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Saldo Financiado</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{formatCurrency(saleCalc.saldo)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Valor da Parcela</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#C8E64A" }}>{formatCurrency(saleCalc.valorParcela)}</div>
                      </div>
                      {saleCalc.jurosTotal > 0 && (
                        <>
                          <div>
                            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Total com Juros</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{formatCurrency(saleCalc.totalComJuros)}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Total Juros</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#F59E0B" }}>{formatCurrency(saleCalc.jurosTotal)}</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Upload e Obs */}
                <div>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Upload do Contrato (PDF)</label>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
                    background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.12)",
                    borderRadius: 10, cursor: "pointer",
                  }}>
                    <FileText size={18} style={{ color: "var(--text-muted)" }} />
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Arraste ou clique para anexar</span>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Observações</label>
                  <textarea placeholder="Notas sobre a venda..." value={saleForm.obs}
                    onChange={e => setSaleForm(f => ({ ...f, obs: e.target.value }))}
                    rows={2}
                    style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "var(--text-primary)", fontSize: 13, resize: "vertical" }}
                  />
                </div>

                {/* Botões */}
                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  <button onClick={() => setShowSaleForm(false)}
                    style={{
                      flex: 1, padding: "12px", borderRadius: 12,
                      background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                      color: "var(--text-secondary)", fontSize: 13, fontWeight: 600, cursor: "pointer",
                    }}>
                    Cancelar
                  </button>
                  <button onClick={handleSaleSubmit} disabled={!canSubmitSale}
                    style={{
                      flex: 2, padding: "12px", borderRadius: 12, border: "none",
                      background: canSubmitSale ? "var(--accent-emerald)" : "rgba(16,185,129,0.3)",
                      color: "#fff", fontSize: 13, fontWeight: 700,
                      cursor: canSubmitSale ? "pointer" : "not-allowed", transition: "all 0.2s",
                    }}>
                    Salvar Venda
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", textAlign: "right", maxWidth: 190, overflow: "hidden", textOverflow: "ellipsis" }}>
        {value}
      </span>
    </div>
  );
}
