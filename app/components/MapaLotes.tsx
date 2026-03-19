"use client";
import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { MapPin, ZoomIn, ZoomOut, Grid3x3, Map as MapIcon, RotateCcw } from "lucide-react";
import { getLots, getSales, formatCurrency, perimeterCoords } from "../data";
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

function polygonCentroid(pts: number[][]): [number, number] {
  let cx = 0, cy = 0;
  for (const [x, y] of pts) { cx += x; cy += y; }
  return [cx / pts.length, cy / pts.length];
}

function polygonToSvgPath(pts: number[][]): string {
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]} ${p[1]}`).join(" ") + " Z";
}

export default function MapaLotes() {
  const lots = useMemo(() => getLots(), []);
  const sales = useMemo(() => getSales(), []);
  const [selectedLot, setSelectedLot] = useState<{ quadra: number; lote: number } | null>(null);
  const [filterQuadra, setFilterQuadra] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"map" | "grid">("map");
  const [zoom, setZoom] = useState(1);
  const [hoveredLot, setHoveredLot] = useState<string | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
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
            Loteamento Vista Alegre 2 &middot; {stats.total} lotes &middot; 130.850 m²
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
            </div>
          </div>
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
