"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  MapPin, Phone, Shield, TrendingUp, Home, Trees,
  ChevronDown, MessageCircle, Clock, Star, Users,
  Navigation, Landmark, ArrowRight, CheckCircle2, Zap
} from "lucide-react";

const WHATSAPP = "5538999999999";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Olá! Tenho interesse no Loteamento Vista Alegre. Gostaria de mais informações.")}`;
const ERP_URL = "https://painel.padilhamadeira.com.br/";

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function AnimatedCounter({ end, suffix = "", duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView();
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);
  return <span ref={ref}>{count}{suffix}</span>;
}

function ScarcityBadge() {
  const [pulse, setPulse] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 1500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 backdrop-blur-sm">
      <span className={`w-2 h-2 rounded-full bg-amber-400 transition-opacity duration-500 ${pulse ? "opacity-100" : "opacity-30"}`} />
      <span className="text-amber-300 text-sm font-semibold tracking-wide uppercase">
        Ultimas unidades disponiveis
      </span>
    </div>
  );
}

const NAV_ITEMS = [
  { id: "sobre", label: "O Loteamento" },
  { id: "diferenciais", label: "Diferenciais" },
  { id: "mapa", label: "Mapa ao Vivo" },
  { id: "localizacao", label: "Localização" },
];

const DIFERENCIAIS = [
  {
    icon: Landmark,
    title: "Região Mais Nobre",
    desc: "Localizado na área de maior valorização de Divinolândia de Minas. Endereço de prestígio para sua família.",
    color: "#F59E0B",
  },
  {
    icon: Navigation,
    title: "Perto de Tudo",
    desc: "A poucos minutos do centro da cidade. Comércio, escolas, saúde e lazer ao seu alcance.",
    color: "#3B82F6",
  },
  {
    icon: Shield,
    title: "Investimento Seguro",
    desc: "Terreno é patrimônio. Valorização constante, segurança para seu futuro e da sua família.",
    color: "#10B981",
  },
  {
    icon: TrendingUp,
    title: "Valorização Garantida",
    desc: "Infraestrutura completa em implantação. Cada mês que passa, seu lote vale mais.",
    color: "#8B5CF6",
  },
  {
    icon: Home,
    title: "Parcelas que Cabem no Bolso",
    desc: "Entrada facilitada e até 48x sem juros abusivos. Condições que você não encontra em outro lugar.",
    color: "#EF4444",
  },
  {
    icon: Trees,
    title: "Qualidade de Vida",
    desc: "Ar puro, tranquilidade e contato com a natureza. O refúgio que sua família merece.",
    color: "#06B6D4",
  },
];

export default function SiteLandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenu(false);
  }, []);

  return (
    <div className="min-h-screen bg-[#100C10] text-[#F5F0EB] overflow-x-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* ===== NAVBAR ===== */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#100C10]/90 backdrop-blur-xl border-b border-white/5 shadow-lg" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <img src="/logo-full.png" alt="Padilha Madeira Imobiliária" className="h-10 sm:h-12 w-auto" />
            <div className="hidden md:flex items-center gap-8">
              {NAV_ITEMS.map(item => (
                <button key={item.id} onClick={() => scrollTo(item.id)} className="text-sm text-[#A8998A] hover:text-[#F5F0EB] transition-colors duration-300">
                  {item.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] text-sm">
                <MessageCircle size={16} /> Falar com Consultor
              </a>
              <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 text-[#A8998A]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {mobileMenu ? <path d="M18 6L6 18M6 6l12 12" /> : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>}
                </svg>
              </button>
            </div>
          </div>
        </div>
        {mobileMenu && (
          <div className="md:hidden bg-[#100C10]/95 backdrop-blur-xl border-t border-white/5 px-4 py-4 space-y-3">
            {NAV_ITEMS.map(item => (
              <button key={item.id} onClick={() => scrollTo(item.id)} className="block w-full text-left text-[#A8998A] hover:text-[#F5F0EB] py-2 text-sm">
                {item.label}
              </button>
            ))}
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-emerald-500 text-white font-semibold rounded-lg text-sm">
              <MessageCircle size={16} /> Falar com Consultor
            </a>
          </div>
        )}
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20">
        {/* Background gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/3 rounded-full blur-[150px]" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="mb-6 animate-[fadeInUp_0.8s_ease-out]">
            <ScarcityBadge />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-[fadeInUp_0.8s_ease-out_0.2s_both]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Seu Futuro Começa no<br />
            <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent">
              Vista Alegre
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-[#A8998A] max-w-2xl mx-auto mb-4 animate-[fadeInUp_0.8s_ease-out_0.4s_both]">
            A região mais nobre de Divinolândia de Minas. Lotes a partir de 260m², 
            a poucos minutos do centro, com infraestrutura completa.
          </p>
          <p className="text-base text-amber-400/90 font-medium mb-8 animate-[fadeInUp_0.8s_ease-out_0.5s_both]">
            Mais de 100 famílias já garantiram seu lote. Restam poucas unidades.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-[fadeInUp_0.8s_ease-out_0.6s_both]">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
              className="group flex items-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] text-lg">
              Garanta Seu Lote Agora
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <button onClick={() => scrollTo("mapa")}
              className="flex items-center gap-2 px-8 py-4 border border-white/10 hover:border-white/20 text-[#F5F0EB] rounded-xl transition-all duration-300 hover:bg-white/5 text-lg">
              <MapPin size={20} /> Ver Mapa ao Vivo
            </button>
          </div>
          <div className="mt-16 animate-[fadeInUp_0.8s_ease-out_0.8s_both]">
            <button onClick={() => scrollTo("sobre")} className="text-[#6B5E52] hover:text-[#A8998A] transition-colors">
              <ChevronDown size={32} className="animate-bounce" />
            </button>
          </div>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <SectionWrapper id="sobre">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-emerald-400 text-sm font-semibold tracking-widest uppercase mb-4 block">Loteamento Vista Alegre</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                O endereço que sua família
                <span className="text-emerald-400"> merece</span>
              </h2>
              <p className="text-[#A8998A] text-lg leading-relaxed mb-6">
                Imagine acordar todos os dias em um lugar tranquilo, seguro e valorizado. 
                O Vista Alegre não é apenas um loteamento — é a decisão mais inteligente 
                que você pode tomar pelo futuro da sua família.
              </p>
              <p className="text-[#A8998A] text-lg leading-relaxed mb-8">
                Localizado na <strong className="text-[#F5F0EB]">região mais nobre de Divinolândia de Minas</strong>, 
                com ruas planejadas, infraestrutura de alto padrão e uma vista que vai te 
                fazer entender por que o nome é Vista Alegre.
              </p>
              <div className="flex flex-wrap gap-4">
                {["Água e Esgoto", "Energia Elétrica", "Ruas Planejadas", "Documentação OK"].map(item => (
                  <div key={item} className="flex items-center gap-2 text-sm text-emerald-400">
                    <CheckCircle2 size={16} /> {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8 space-y-6">
                <div className="text-center">
                  <p className="text-[#6B5E52] text-sm uppercase tracking-widest mb-2">Lotes a partir de</p>
                  <p className="text-4xl sm:text-5xl font-bold text-emerald-400" style={{ fontFamily: "'Playfair Display', serif" }}>
                    R$ 79.000
                  </p>
                  <p className="text-[#A8998A] mt-2">ou parcelas a partir de <strong className="text-[#F5F0EB]">R$ 1.600/mês</strong></p>
                </div>
                <div className="border-t border-white/5 pt-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#A8998A]">Tamanho dos lotes</span>
                    <span className="text-[#F5F0EB] font-medium">260m² a 570m²</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#A8998A]">Parcelamento</span>
                    <span className="text-[#F5F0EB] font-medium">Até 48x</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#A8998A]">Entrada</span>
                    <span className="text-[#F5F0EB] font-medium">Facilitada</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#A8998A]">Documentação</span>
                    <span className="text-emerald-400 font-medium">100% regularizada</span>
                  </div>
                </div>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                  <MessageCircle size={18} /> Simular Parcelas
                </a>
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ===== DIFERENCIAIS ===== */}
      <SectionWrapper id="diferenciais">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-emerald-400 text-sm font-semibold tracking-widest uppercase mb-4 block">Por que o Vista Alegre?</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              Tudo que você procura em um
              <span className="text-emerald-400"> só lugar</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {DIFERENCIAIS.map((d, i) => (
              <FadeInCard key={i} delay={i * 100}>
                <div className="group p-6 sm:p-8 rounded-2xl border border-white/[0.06] bg-white/[0.025] backdrop-blur-sm hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-500 h-full">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: `${d.color}15`, border: `1px solid ${d.color}30` }}>
                    <d.icon size={24} style={{ color: d.color }} />
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>{d.title}</h3>
                  <p className="text-[#A8998A] leading-relaxed text-sm">{d.desc}</p>
                </div>
              </FadeInCard>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* ===== MAPA AO VIVO ===== */}
      <SectionWrapper id="mapa">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/30 bg-red-500/10 mb-6">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400 text-sm font-semibold tracking-wide uppercase">Ao vivo</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Acompanhe as vendas em
              <span className="text-emerald-400"> tempo real</span>
            </h2>
            <p className="text-[#A8998A] text-lg max-w-2xl mx-auto">
              Veja quais lotes já foram vendidos e quais ainda estão disponíveis. 
              A cada dia que passa, menos opções restam. <strong className="text-amber-400">Não deixe para depois.</strong>
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
            <div className="bg-white/[0.03] px-4 py-3 border-b border-white/5 flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/60" />
                <span className="w-3 h-3 rounded-full bg-amber-500/60" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/60" />
              </div>
              <span className="text-xs text-[#6B5E52]">painel.padilhamadeira.com.br</span>
            </div>
            <iframe
              src={ERP_URL}
              className="w-full bg-[#100C10]"
              style={{ height: "70vh", minHeight: "500px" }}
              title="Mapa de Lotes Vista Alegre - Tempo Real"
              loading="lazy"
            />
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="flex items-center gap-2 justify-center">
              <span className="w-4 h-4 rounded-sm" style={{ background: "rgba(16,185,129,0.5)" }} />
              <span className="text-sm text-[#A8998A]">Disponível</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <span className="w-4 h-4 rounded-sm" style={{ background: "rgba(59,130,246,0.5)" }} />
              <span className="text-sm text-[#A8998A]">Vendido</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <span className="w-4 h-4 rounded-sm" style={{ background: "rgba(139,92,246,0.5)" }} />
              <span className="text-sm text-[#A8998A]">Quitado</span>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ===== LOCALIZAÇÃO ===== */}
      <SectionWrapper id="localizacao">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-emerald-400 text-sm font-semibold tracking-widest uppercase mb-4 block">Localização Privilegiada</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                No coração da região
                <span className="text-emerald-400"> mais nobre</span>
              </h2>
              <p className="text-[#A8998A] text-lg leading-relaxed mb-8">
                O Vista Alegre está estrategicamente posicionado na melhor localização 
                de Divinolândia de Minas. Aqui, você tem a tranquilidade do interior 
                com a conveniência de estar perto de tudo.
              </p>
              <div className="space-y-4">
                {[
                  { label: "Centro da cidade", dist: "5 min", icon: Landmark },
                  { label: "Comércio e serviços", dist: "3 min", icon: Home },
                  { label: "Escolas e creches", dist: "7 min", icon: Users },
                  { label: "Posto de saúde", dist: "5 min", icon: Shield },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <item.icon size={18} className="text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[#F5F0EB] font-medium">{item.label}</p>
                    </div>
                    <div className="text-emerald-400 font-bold text-sm flex items-center gap-1">
                      <Clock size={14} /> {item.dist}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 overflow-hidden h-[400px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15036.5!2d-42.145!3d-18.795!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xa4b8c0a5b3b3b3%3A0x0!2sDivinol%C3%A2ndia+de+Minas!5e0!3m2!1spt-BR!2sbr!4v1"
                className="w-full h-full"
                style={{ border: 0, filter: "invert(0.9) hue-rotate(180deg) brightness(0.8) contrast(1.2)" }}
                allowFullScreen
                loading="lazy"
                title="Localização Vista Alegre"
              />
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ===== NUMEROS / SOCIAL PROOF ===== */}
      <section className="py-20 sm:py-28 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              Números que
              <span className="text-emerald-400"> comprovam</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: 100, suffix: "+", label: "Famílias já escolheram", icon: Users, color: "#10B981" },
              { value: 160, suffix: "+", label: "Lotes no empreendimento", icon: MapPin, color: "#3B82F6" },
              { value: 48, suffix: "x", label: "Parcelamento sem burocracia", icon: TrendingUp, color: "#8B5CF6" },
              { value: 300, suffix: "m²", label: "Lotes a partir de", icon: Home, color: "#F59E0B" },
            ].map((s, i) => (
              <FadeInCard key={i} delay={i * 150}>
                <div className="text-center p-6 sm:p-8 rounded-2xl border border-white/[0.06] bg-white/[0.025] backdrop-blur-sm">
                  <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: `${s.color}15`, border: `1px solid ${s.color}30` }}>
                    <s.icon size={22} style={{ color: s.color }} />
                  </div>
                  <p className="text-3xl sm:text-4xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif", color: s.color }}>
                    <AnimatedCounter end={s.value} suffix={s.suffix} />
                  </p>
                  <p className="text-[#A8998A] text-sm">{s.label}</p>
                </div>
              </FadeInCard>
            ))}
          </div>
        </div>
      </section>

      {/* ===== URGENCY CTA ===== */}
      <section className="py-20 sm:py-28 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent backdrop-blur-sm p-8 sm:p-12 lg:p-16 text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-amber-500/10 rounded-full blur-[60px] pointer-events-none" />
            <div className="relative z-10">
              <div className="mb-6">
                <ScarcityBadge />
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                Não espere o lote que você quer<br />
                <span className="text-emerald-400">ser vendido para outro</span>
              </h2>
              <p className="text-[#A8998A] text-lg max-w-2xl mx-auto mb-4">
                Quem comprou no início já viu seu patrimônio valorizar. 
                Quem está comprando agora ainda aproveita as melhores condições. 
              </p>
              <p className="text-amber-400 font-semibold text-lg mb-8">
                Quem deixar para amanhã... pode não ter mais escolha.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                  className="group flex items-center gap-3 px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] text-lg">
                  <MessageCircle size={22} />
                  Quero Garantir Meu Lote
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </a>
                <a href={`tel:+${WHATSAPP}`}
                  className="flex items-center gap-2 px-8 py-5 border border-white/10 hover:border-white/20 rounded-xl text-[#F5F0EB] transition-all duration-300 hover:bg-white/5 text-lg">
                  <Phone size={20} /> Ligar Agora
                </a>
              </div>
              <p className="text-[#6B5E52] text-xs mt-6">
                Atendimento de segunda a sábado, das 8h às 18h
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/5 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center md:items-start gap-3">
              <img src="/logo-full.png" alt="Padilha Madeira" className="h-10 w-auto opacity-60" />
              <p className="text-[#6B5E52] text-sm">Transformando sonhos em endereços desde 2023.</p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-2">
              <p className="text-[#A8998A] text-sm">Divinolândia de Minas - MG</p>
              <p className="text-[#6B5E52] text-xs">Padilha Madeira Empreendimentos Imobiliários</p>
            </div>
          </div>
          <div className="border-t border-white/5 mt-8 pt-6 text-center">
            <p className="text-[#6B5E52] text-xs">
              Loteamento Vista Alegre - Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* ===== WHATSAPP FLOATING ===== */}
      <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 bg-emerald-500 hover:bg-emerald-400 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(16,185,129,0.5)] transition-all duration-300 hover:scale-110 group"
        aria-label="WhatsApp">
        <MessageCircle size={28} className="text-white" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#100C10] animate-pulse" />
      </a>
    </div>
  );
}

function SectionWrapper({ id, children }: { id: string; children: React.ReactNode }) {
  const { ref, inView } = useInView();
  return (
    <section id={id} ref={ref} className={`py-20 sm:py-28 px-4 transition-all duration-1000 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      {children}
    </section>
  );
}

function FadeInCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
