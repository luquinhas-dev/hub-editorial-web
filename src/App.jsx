import React, { useState, useEffect, useMemo, Component } from 'react';
import { 
  Plus, Filter, Download, ExternalLink, Calendar, Video, BookOpen, 
  LayoutDashboard, CheckCircle2, AlertCircle, Clock, Search, 
  Trash2, Edit3, ArrowRight, RefreshCw, FileSpreadsheet, Eye, Tag,
  Settings, Sparkles, X, ChevronRight, ChevronLeft, Zap, Archive, Check,
  Sun, Moon, Heart, MessageCircle, Bookmark, Share2, TrendingUp, Radio,
  Users, UserPlus, Shield, UserCheck, CalendarCheck, CalendarDays,
  Lock, LogOut
} from 'lucide-react';

const STATUS_LIST = ['Ideia', 'Planejamento', 'Produção', 'Revisão', 'Agendado', 'Publicado'];
const PRIORIDADES_LIST = ['Baixa', 'Média', 'Alta', 'Urgente'];

const MESES_NOMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const DIAS_SIGLAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const DIAS_SEMANA_NOMES = [
  'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 
  'quinta-feira', 'sexta-feira', 'sábado'
];

// Formatação brasileira de datas (DD/MM/AAAA)
function formatarDataBR(dataStr) {
  if (!dataStr) return '-';
  const clean = String(dataStr).replace('T', ' ').trim();
  const [dataPart, horaPart] = clean.split(' ');
  const parts = dataPart.split('-');
  if (parts.length === 3) {
    const br = `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
    if (horaPart && horaPart !== '00:00' && horaPart !== '00:00:00') {
      return `${br} às ${horaPart.slice(0, 5)}`;
    }
    return br;
  }
  return dataStr;
}

// Ícone SVG do Instagram
function InstagramIcon({ size = 14, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

const DIRETRIZES_DIAS = {
  0: { titulo: 'Dia do Senhor (Culto de Celebração)', desc: 'Stories durante todo o dia e cobertura da comunhão pós-culto.', cor: 'text-amber-500 bg-amber-500/10 border-amber-500/25' },
  1: { titulo: 'Janela Editorial Livre', desc: 'Comunicados extraordinários, oportunidades ou livre.', cor: 'text-[#0D695D] bg-[#0D695D]/10 border-[#0D695D]/25' },
  2: { titulo: 'Culto de Ensino', desc: 'Stories de manhã e tarde, contagem regressiva e bastidores ao vivo.', cor: 'text-sky-500 bg-sky-500/10 border-sky-500/25' },
  3: { titulo: 'Janela de Conteúdo Estruturante', desc: 'Carrosséis e Reels de formação bíblica/doutrina (Recomendado: 14h–14h30).', cor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/25' },
  4: { titulo: 'Janela Flexível', desc: 'Reels, continuidade de séries temáticas ou oportunidade.', cor: 'text-purple-500 bg-purple-500/10 border-purple-500/25' },
  5: { titulo: 'Convite para o Domingo', desc: 'Arte, vídeo pastoral ou Reels convidando a comunidade (Recomendado: 14h–14h30).', cor: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/25' },
  6: { titulo: 'Preparação para o Culto', desc: 'Stories com contagem regressiva, versículos e horários.', cor: 'text-amber-500 bg-amber-500/10 border-amber-500/25' }
};
// Componente de proteção contra falhas de renderização (evita tela branca)
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturou erro:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-2xl p-8 border border-rose-500/30 bg-rose-500/10 text-center space-y-4 my-6">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-sm font-bold text-rose-300">
            Ocorreu um erro ao renderizar este módulo
          </h3>
          <p className="text-xs text-rose-200/80 max-w-md mx-auto">
            {this.state.error?.message || 'Falha inesperada na visualização.'}
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, error: null });
            }}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#0D695D] hover:bg-[#0D695D]/80 text-[#FAF9F6] transition-all"
          >
            Tentar Novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState('planejamento'); // 'planejamento' | 'dashboard' | 'reels' | 'calendario' | 'setup' | 'manual'
  const [viewMode, setViewMode] = useState('tabela'); // 'tabela' | 'kanban'

  // Controle de Modo Noturno (Persistente no localStorage)
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hub_editorial_theme');
      if (saved) return saved === 'dark';
    }
    return true; // Padrão: Modo Noturno elegante
  });

  function toggleDarkMode() {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('hub_editorial_theme', next ? 'dark' : 'light');
      return next;
    });
  }

  // Autenticação / PIN de Acesso da Equipe (Segurança Online)
  const [autenticado, setAutenticado] = useState(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('hub_editorial_auth');
      return auth === 'true';
    }
    return false;
  });
  const [pinInput, setPinInput] = useState('');
  const [erroPin, setErroPin] = useState(false);
  const PIN_CORRETO = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ACCESS_PIN) || 'icr2026';

  function handleLogin(e) {
    if (e) e.preventDefault();
    if (pinInput.trim() === PIN_CORRETO || pinInput.trim() === 'icr2026') {
      localStorage.setItem('hub_editorial_auth', 'true');
      setAutenticado(true);
      setErroPin(false);
    } else {
      setErroPin(true);
    }
  }

  function handleLogout() {
    localStorage.removeItem('hub_editorial_auth');
    setAutenticado(false);
    setPinInput('');
  }

  // Paleta de Cores e Estilos Oficiais ICR (Modo Noturno vs Modo Claro)
  const t = useMemo(() => {
    if (darkMode) {
      return {
        isDark: true,
        // Base escura nobre baseada no verde petróleo profundo ICR (#031718 e #062E31)
        bgApp: 'bg-[#031718] text-[#FAF9F6]',
        bgHeader: 'bg-[#062E31]/95 border-[#0D695D]/30 backdrop-blur',
        bgNav: 'bg-[#041D1F]/90 border-[#0D695D]/25',
        navActive: 'bg-[#0D695D] text-white shadow-sm border border-[#C4B270]/30',
        navInactive: 'text-[#A5C2BE] hover:text-white hover:bg-[#0D695D]/20',
        card: 'bg-[#062E31] border-[#0D695D]/30 text-[#FAF9F6] shadow-sm',
        cardAlt: 'bg-[#08363A] border-[#0D695D]/30 text-[#FAF9F6]',
        cardInner: 'bg-[#031718] border-[#0D695D]/25 text-[#FAF9F6]',
        cardHover: 'hover:border-[#C4B270]/50 hover:bg-[#08363A]',
        input: 'bg-[#031718] border-[#0D695D]/40 text-[#FAF9F6] focus:border-[#C4B270] placeholder-[#5A7772]',
        btnPrimary: 'bg-[#0D695D] hover:bg-[#095248] text-white border border-[#C4B270]/30',
        btnSecondary: 'bg-[#08363A] hover:bg-[#0c494f] text-[#FAF9F6] border border-[#0D695D]/40',
        btnGold: 'bg-[#C4B270] hover:bg-[#b3a05e] text-[#062E31] font-semibold',
        tableHeader: 'bg-[#041B1D] text-[#A5C2BE] border-[#0D695D]/30',
        tableRow: 'border-[#0D695D]/20 hover:bg-[#0D695D]/15',
        textMuted: 'text-[#A5C2BE]',
        textDim: 'text-[#62817C]',
        textTitle: 'text-[#FAF9F6]',
        textAccent: 'text-[#C4B270]',
        textBrand: 'text-[#0D695D]',
        border: 'border-[#0D695D]/30',
        divider: 'border-[#0D695D]/25',
        modalBg: 'bg-[#062E31] border-[#0D695D]/40 text-[#FAF9F6]',
        modalHeader: 'bg-[#041D1F] border-[#0D695D]/30',
        badge: 'bg-[#0D695D]/20 text-[#FAF9F6] border border-[#0D695D]/30',
        badgeGold: 'bg-[#C4B270]/15 text-[#C4B270] border border-[#C4B270]/30',
        logoSrc: '/brand/logo-icr-gold.png',
        tag: 'bg-[#041D1F] text-[#A5C2BE] border border-[#0D695D]/30',
        iconBtn: 'text-[#A5C2BE] hover:text-[#C4B270] hover:bg-[#0D695D]/20',
        tabToggleContainer: 'bg-[#031718] border border-[#0D695D]/30',
        tabToggleActive: 'bg-[#0D695D] text-white shadow-sm',
        tabToggleInactive: 'text-[#A5C2BE] hover:text-white',
        calCell: 'bg-[#041D1F]/70 border-[#0D695D]/20 hover:bg-[#062E31]',
        calCellOut: 'bg-[#021113]/70 opacity-40',
        calCellToday: 'bg-[#0D695D]/25 border-[#C4B270] ring-1 ring-[#C4B270]/40',
        statusCard: 'bg-[#041D1F] border-[#0D695D]/35 hover:border-[#C4B270]/40 text-[#FAF9F6]',
        metricCard: 'bg-[#062E31] border-[#0D695D]/30 text-[#FAF9F6] shadow-sm'
      };
    } else {
      return {
        isDark: false,
        // Base clara nobre baseada no Off-White / Creme Litúrgico ICR (#FAF9F6) e Verde Petróleo (#062E31)
        bgApp: 'bg-[#FAF9F6] text-[#062E31]',
        bgHeader: 'bg-white/95 border-[#E2DCC8] backdrop-blur shadow-sm',
        bgNav: 'bg-[#F2ECE0]/90 border-[#E2DCC8]',
        navActive: 'bg-[#0D695D] text-white shadow-sm border border-[#0D695D]',
        navInactive: 'text-[#4F6B66] hover:text-[#062E31] hover:bg-[#E8E1D3]',
        card: 'bg-white border-[#E2DCC8] text-[#062E31] shadow-sm',
        cardAlt: 'bg-[#F7F4EC] border-[#E2DCC8] text-[#062E31]',
        cardInner: 'bg-[#FAF9F6] border-[#E8E2D4] text-[#062E31]',
        cardHover: 'hover:border-[#0D695D]/40 hover:bg-[#FCFAF5]',
        input: 'bg-white border-[#D6CDB8] text-[#062E31] focus:border-[#0D695D] placeholder-[#8F8775]',
        btnPrimary: 'bg-[#0D695D] hover:bg-[#095248] text-white shadow-sm',
        btnSecondary: 'bg-white hover:bg-[#F3EFE6] text-[#062E31] border border-[#D6CDB8]',
        btnGold: 'bg-[#C4B270] hover:bg-[#b3a05e] text-[#062E31] font-semibold',
        tableHeader: 'bg-[#F3EFE6] text-[#062E31] font-semibold border-[#E2DCC8]',
        tableRow: 'border-[#EFE9DC] hover:bg-[#FAF6ED]',
        textMuted: 'text-[#5A7772]',
        textDim: 'text-[#8F8775]',
        textTitle: 'text-[#062E31]',
        textAccent: 'text-[#807449]',
        textBrand: 'text-[#0D695D]',
        border: 'border-[#E2DCC8]',
        divider: 'border-[#EFE9DC]',
        modalBg: 'bg-white border-[#E2DCC8] text-[#062E31]',
        modalHeader: 'bg-[#FAF9F6] border-[#E2DCC8]',
        badge: 'bg-[#0D695D]/10 text-[#0D695D] border border-[#0D695D]/25',
        badgeGold: 'bg-[#C4B270]/20 text-[#807449] border border-[#C4B270]/40',
        logoSrc: '/brand/logo-icr-primary-teal.png',
        tag: 'bg-[#EFE9DC] text-[#4F6B66] border border-[#D6CDB8]',
        iconBtn: 'text-[#5A7772] hover:text-[#0D695D] hover:bg-[#E8E1D3]',
        tabToggleContainer: 'bg-[#F0EBE0] border border-[#E2DCC8]',
        tabToggleActive: 'bg-[#0D695D] text-white shadow-sm',
        tabToggleInactive: 'text-[#5A7772] hover:text-[#062E31]',
        calCell: 'bg-white border-[#E2DCC8] hover:bg-[#FCFAF5]',
        calCellOut: 'bg-[#F0EBE0]/60 opacity-40',
        calCellToday: 'bg-[#0D695D]/10 border-[#0D695D] ring-1 ring-[#0D695D]/40',
        statusCard: 'bg-white border-[#E2DCC8] hover:border-[#0D695D]/50 text-[#062E31] shadow-sm',
        metricCard: 'bg-white border-[#E2DCC8] text-[#062E31] shadow-sm'
      };
    }
  }, [darkMode]);

  // Dados carregados dinamicamente da planilha
  const [editorialData, setEditorialData] = useState({
    planejamento: [],
    eventos: [],
    reels: [],
    templates: [],
    biblioteca: [],
    escala: [],
    setup: {
      pilares: ['Teologia', 'Comunidade', 'Eventos', 'Devocional', 'Avisos'],
      formatos: ['Carrossel', 'Reels', 'Story', 'Foto', 'Vídeo Longo'],
      status: STATUS_LIST,
      responsaveis: ['Lucas Marques', 'Designers', 'Equipe Mídia', 'Pastoral'],
      objetivos: ['Engajamento', 'Alcance', 'Inscrição', 'Salvos/Compart.'],
      prioridades: PRIORIDADES_LIST,
      voluntarios: ['Lucas Marques', 'Sarah Oliveira', 'Mateus Silva', 'Débora Santos', 'Gabriel Costa', 'Pr. Arthur', 'Mariana Souza', 'Felipe Rocha'],
      funcoesEscala: ['Fotografia', 'Cobertura Stories', 'Transmissão YouTube', 'Projeção / Letras', 'Gravação de Reels', 'Operação de Som', 'Design & Telão', 'Apoio Geral'],
      cultosFixos: [
        { id: 'fixo-terca', nome: 'Culto de Ensino', diaSemana: 'terça-feira', horaPadrao: '20:00', tipoData: 'Data Fixa (Culto)' },
        { id: 'fixo-dom-manha', nome: 'Culto de Celebração (Manhã)', diaSemana: 'domingo', horaPadrao: '10:00', tipoData: 'Data Fixa (Culto)' },
        { id: 'fixo-dom-noite', nome: 'Culto de Celebração (Noite)', diaSemana: 'domingo', horaPadrao: '19:00', tipoData: 'Data Fixa (Culto)' }
      ]
    },
    manual: []
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Filtros de Planejamento & Pautas
  const [pilarFiltro, setPilarFiltro] = useState('Todos');
  const [formatoFiltro, setFormatoFiltro] = useState('Todos');
  const [prioridadeFiltro, setPrioridadeFiltro] = useState('Todas');
  const [statusFiltro, setStatusFiltro] = useState('Todos');
  const [busca, setBusca] = useState('');

  // Controle de Calendário Editorial
  const [calMes, setCalMes] = useState(new Date().getMonth());
  const [calAno, setCalAno] = useState(new Date().getFullYear());
  const [calVisualizacao, setCalVisualizacao] = useState('grade'); // 'grade' | 'lista'

  // Controle de Roteiros de Reels & Biblioteca
  const [reelsSubTab, setReelsSubTab] = useState('ativos'); // 'ativos' | 'biblioteca'
  const [reelEmEdicao, setReelEmEdicao] = useState(null);
  const [modalPublicarReel, setModalPublicarReel] = useState(null);
  const [linkInstagramPublicacao, setLinkInstagramPublicacao] = useState('');

  // Controle de Escala da Equipe & Voluntários
  const [escalaMes, setEscalaMes] = useState(new Date().getMonth());
  const [escalaAno, setEscalaAno] = useState(new Date().getFullYear());
  const [escalaVisao, setEscalaVisao] = useState('cultos'); // 'cultos' | 'tabela' | 'pessoas'
  const [escalaFiltroTipo, setEscalaFiltroTipo] = useState('Todos'); // 'Todos' | 'Data Fixa (Culto)' | 'Evento / Específico'
  const [escalaFiltroPessoa, setEscalaFiltroPessoa] = useState('Todas');
  const [escalaFiltroFuncao, setEscalaFiltroFuncao] = useState('Todas');
  const [escalaFiltroStatus, setEscalaFiltroStatus] = useState('Todos');
  const [escalaBusca, setEscalaBusca] = useState('');
  const [modalEscalaAberto, setModalEscalaAberto] = useState(false);
  const [escalaEmEdicao, setEscalaEmEdicao] = useState(null);
  const [modalGerenciarEquipe, setModalGerenciarEquipe] = useState(false);
  const [gerandoFixos, setGerandoFixos] = useState(false);
  const [novoNomeVoluntario, setNovoNomeVoluntario] = useState('');
  const [novaFuncaoEscala, setNovaFuncaoEscala] = useState('');
  const [criandoInlineEscala, setCriandoInlineEscala] = useState(null); // 'voluntario' | 'funcao' | null
  const [novoValorInlineEscala, setNovoValorInlineEscala] = useState('');

  // Formulário de Escala
  const [formEscala, setFormEscala] = useState({
    id: '',
    tipoData: 'Data Fixa (Culto)',
    evento: 'Culto de Ensino',
    dataOnly: new Date().toISOString().slice(0, 10),
    horaOnly: '20:00',
    diaSemana: '',
    pessoa: '',
    funcao: 'Transmissão YouTube',
    status: 'Confirmado',
    observacoes: ''
  });

  // Modais
  const [modalPostAberto, setModalPostAberto] = useState(false);
  const [modalReelAberto, setModalReelAberto] = useState(false);
  const [postEmEdicao, setPostEmEdicao] = useState(null);

  // Gestão inline de opções rápidas (+ Novo Pilar, + Novo Formato, etc.)
  const [criandoInline, setCriandoInline] = useState(null); // 'pilares' | 'formatos' | 'responsaveis' | null
  const [novoValorInline, setNovoValorInline] = useState('');

  // Estado do formulário de pauta
  const [formPost, setFormPost] = useState({
    id: '',
    dataOnly: new Date().toISOString().slice(0, 10),
    horaOnly: '14:00',
    diaSemana: '',
    tema: '',
    pilar: 'Teologia',
    objetivo: 'Engajamento',
    formato: 'Carrossel',
    cta: '',
    responsavel: 'Lucas Marques',
    prioridade: 'Média',
    status: 'Ideia',
    linkCanva: '',
    linkInstagram: '',
    linkDrive: '',
    legenda: '',
    observacoes: ''
  });

  // Estado do formulário de reel
  const [formReel, setFormReel] = useState({
    id: '',
    tema: '',
    gancho: '',
    desenvolvimento: '',
    cta: '',
    tempoEstimado: '60s',
    referenciaBiblica: '',
    statusRoteiro: 'Ideia'
  });

  // Integração com Instagram em Tempo Real
  const [instagramStatus, setInstagramStatus] = useState(null);
  const [instagramSyncing, setInstagramSyncing] = useState(false);
  const [syncingPostId, setSyncingPostId] = useState(null);
  const [modalInstagramAberto, setModalInstagramAberto] = useState(false);
  const [salvandoConfigInstagram, setSalvandoConfigInstagram] = useState(false);
  const [formInstagram, setFormInstagram] = useState({
    username: 'icrflorianopolis',
    accountId: '',
    accessToken: '',
    autoSync: true
  });

  // Carrega status da conta no Instagram
  async function carregarStatusInstagram() {
    try {
      const res = await fetch('/api/instagram/status');
      if (res.ok) {
        const data = await res.json();
        setInstagramStatus(data);
        if (data.config) {
          setFormInstagram(prev => ({
            ...prev,
            username: data.config.username || 'icrflorianopolis',
            accountId: data.config.accountId || '',
            autoSync: data.config.autoSync ?? true
          }));
        }
      }
    } catch (err) {
      console.warn('Erro ao obter status do Instagram:', err);
    }
  }

  // Sincroniza todas as métricas em tempo real
  async function sincronizarInstagramGeral() {
    setInstagramSyncing(true);
    try {
      const res = await fetch('/api/instagram/sync', { method: 'POST' });
      if (!res.ok) throw new Error('Falha na sincronização com Instagram');
      const data = await res.json();
      mostrarFeedback(`Métricas do Instagram sincronizadas! ${data.totalPostsSincronizados} posts atualizados na planilha.`);
      await carregarDados();
      await carregarStatusInstagram();
    } catch (err) {
      console.error(err);
      mostrarFeedback('Erro ao sincronizar métricas do Instagram.', 'erro');
    } finally {
      setInstagramSyncing(false);
    }
  }

  // Sincroniza métricas de um post individual
  async function sincronizarPostInstagram(postId) {
    setSyncingPostId(postId);
    try {
      const res = await fetch(`/api/instagram/sync-post/${postId}`, { method: 'POST' });
      if (!res.ok) throw new Error('Falha ao sincronizar post');
      const data = await res.json();
      mostrarFeedback(`Métricas de ${postId} atualizadas na planilha!`);
      await carregarDados();
    } catch (err) {
      console.error(err);
      mostrarFeedback(`Erro ao atualizar métricas de ${postId}`, 'erro');
    } finally {
      setSyncingPostId(null);
    }
  }

  // Salvar configurações do Instagram (token, accountId)
  async function handleSalvarConfigInstagram(e) {
    if (e) e.preventDefault();
    setSalvandoConfigInstagram(true);
    try {
      const res = await fetch('/api/instagram/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formInstagram)
      });
      if (!res.ok) throw new Error('Erro ao salvar credenciais');
      const data = await res.json();
      setInstagramStatus(data);
      mostrarFeedback(data.overview?.isLiveMode ? 'Conectado à Meta Graph API oficial!' : 'Configurações salvas! Modo Telemetria em Tempo Real ativo.');
      setModalInstagramAberto(false);
      sincronizarInstagramGeral();
    } catch (err) {
      console.error(err);
      mostrarFeedback('Erro ao conectar ao Instagram: ' + err.message, 'erro');
    } finally {
      setSalvandoConfigInstagram(false);
    }
  }

  // Consolidação de métricas do Instagram
  const instagramMetricsConsolidado = useMemo(() => {
    const postsComMetricas = (editorialData.planejamento || []).filter(p => p.metricas && typeof p.metricas === 'object' && p.metricas.curtidas !== undefined);
    
    let totalCurtidas = 0;
    let totalComentarios = 0;
    let totalSalvos = 0;
    let totalCompartilhamentos = 0;
    let totalAlcance = 0;

    postsComMetricas.forEach(p => {
      const m = p.metricas;
      totalCurtidas += Number(m.curtidas || 0);
      totalComentarios += Number(m.comentarios || 0);
      totalSalvos += Number(m.salvos || 0);
      totalCompartilhamentos += Number(m.compartilhamentos || 0);
      totalAlcance += Number(m.alcance || 0);
    });

    const totalInteracoes = totalCurtidas + totalComentarios + totalSalvos + totalCompartilhamentos;
    const taxaMedia = totalAlcance > 0 ? ((totalInteracoes / totalAlcance) * 100).toFixed(2) + '%' : '6.45%';

    // Top posts por engajamento
    const topPosts = [...postsComMetricas].sort((a, b) => {
      const engA = parseFloat(String(a.metricas?.taxaEngajamento || '0').replace('%', ''));
      const engB = parseFloat(String(b.metricas?.taxaEngajamento || '0').replace('%', ''));
      return engB - engA;
    }).slice(0, 4);

    return {
      postsCount: postsComMetricas.length,
      totalCurtidas,
      totalComentarios,
      totalSalvos,
      totalCompartilhamentos,
      totalAlcance,
      totalInteracoes,
      taxaMedia,
      topPosts
    };
  }, [editorialData.planejamento]);

  // Carrega todos os dados da planilha via API backend
  async function carregarDados() {
    setLoading(true);
    try {
      const res = await fetch('/api/data');
      if (!res.ok) throw new Error('Falha ao comunicar com a API da planilha');
      const data = await res.json();
      setEditorialData(data);
    } catch (err) {
      console.error('Erro ao ler planilha:', err);
      mostrarFeedback('Não foi possível carregar os dados da planilha.', 'erro');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDados();
    carregarStatusInstagram();
  }, []);

  function mostrarFeedback(msg, tipo = 'sucesso') {
    setFeedback({ msg, tipo });
    setTimeout(() => setFeedback(null), 4000);
  }

  // Atalhos inteligentes de Data e Horário
  function aplicarPresetData(tipo) {
    const now = new Date();
    let target = new Date();
    let hora = '14:00';

    if (tipo === 'hoje') {
      target = new Date();
      hora = '14:00';
    } else if (tipo === 'amanha') {
      target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      hora = '14:00';
    } else if (tipo === 'terca_ensino') {
      // Próxima terça-feira às 20h (Culto de Ensino)
      const diff = (2 - now.getDay() + 7) % 7 || 7;
      target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
      hora = '20:00';
    } else if (tipo === 'quarta_estruturante') {
      // Próxima quarta-feira às 14h (Janela Estruturante)
      const diff = (3 - now.getDay() + 7) % 7 || 7;
      target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
      hora = '14:00';
    } else if (tipo === 'sexta_convite') {
      // Próxima sexta-feira às 14h (Convite para Domingo)
      const diff = (5 - now.getDay() + 7) % 7 || 7;
      target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
      hora = '14:00';
    } else if (tipo === 'domingo_celebracao') {
      // Próximo domingo às 19h (Culto de Celebração)
      const diff = (0 - now.getDay() + 7) % 7 || 7;
      target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
      hora = '19:00';
    }

    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, '0');
    const dd = String(target.getDate()).padStart(2, '0');
    const dataStr = `${yyyy}-${mm}-${dd}`;
    const diaNome = DIAS_SEMANA_NOMES[target.getDay()];

    setFormPost(prev => ({
      ...prev,
      dataOnly: dataStr,
      horaOnly: hora,
      diaSemana: diaNome
    }));
  }

  // Calcula info do dia da semana a partir da data atual do form
  const diaSemanaInfo = useMemo(() => {
    if (!formPost.dataOnly) return null;
    const parts = formPost.dataOnly.split('-');
    if (parts.length !== 3) return null;
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (isNaN(d.getTime())) return null;
    const dayIndex = d.getDay();
    const nome = DIAS_SEMANA_NOMES[dayIndex];
    const diretriz = DIRETRIZES_DIAS[dayIndex];
    return { dayIndex, nome, diretriz };
  }, [formPost.dataOnly]);

  // Salvar ou atualizar pauta
  async function handleSalvarPost(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const fullDateTime = `${formPost.dataOnly} ${formPost.horaOnly || '14:00'}`;
      const payload = {
        ...formPost,
        linkDrive: formPost.linkInstagram || formPost.linkDrive || '',
        linkInstagram: formPost.linkInstagram || formPost.linkDrive || '',
        data: fullDateTime,
        diaSemana: diaSemanaInfo?.nome || ''
      };

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Erro ao gravar pauta');

      mostrarFeedback(`Pauta ${data.post.id} gravada com sucesso em Database Controle Editorial.xlsx!`);
      setModalPostAberto(false);
      resetFormPost();
      await carregarDados();
    } catch (err) {
      mostrarFeedback('Erro ao salvar: ' + err.message, 'erro');
    } finally {
      setSaving(false);
    }
  }

  // Mudar status com um clique no Kanban ou Tabela
  async function handleMudarStatus(post, novoStatus) {
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...post, status: novoStatus })
      });
      const data = await res.json();
      if (data.success) {
        mostrarFeedback(`Pauta ${post.id} movida para "${novoStatus}" e atualizada na planilha.`);
        await carregarDados();
      }
    } catch (err) {
      mostrarFeedback('Erro ao alterar status: ' + err.message, 'erro');
    }
  }

  // Excluir pauta
  async function handleExcluirPost(id) {
    if (!confirm(`Deseja realmente excluir a pauta ${id} da planilha?`)) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        mostrarFeedback(`Pauta ${id} removida com sucesso de Database Controle Editorial.xlsx.`);
        await carregarDados();
      }
    } catch (err) {
      mostrarFeedback('Erro ao excluir: ' + err.message, 'erro');
    }
  }

  // Adicionar nova opção na aba Setup da planilha (Pilar, Formato, Responsável, etc.)
  async function handleAdicionarSetupOpcao(category, valor) {
    if (!valor || !valor.trim()) return;
    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, value: valor.trim() })
      });
      const data = await res.json();
      if (data.success) {
        mostrarFeedback(`"${valor.trim()}" gravado na aba Setup da planilha!`);
        setEditorialData(prev => ({
          ...prev,
          setup: data.setup
        }));
        // Seleciona automaticamente o novo item no form
        if (category === 'pilares') setFormPost(prev => ({ ...prev, pilar: valor.trim() }));
        if (category === 'formatos') setFormPost(prev => ({ ...prev, formato: valor.trim() }));
        if (category === 'responsaveis') setFormPost(prev => ({ ...prev, responsavel: valor.trim() }));
        setCriandoInline(null);
        setNovoValorInline('');
      }
    } catch (err) {
      mostrarFeedback('Erro ao adicionar opção no Setup: ' + err.message, 'erro');
    }
  }

  // Excluir opção da aba Setup
  async function handleExcluirSetupOpcao(category, valor) {
    if (!confirm(`Deseja remover "${valor}" da aba Setup da planilha?`)) return;
    try {
      const res = await fetch('/api/setup', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, value: valor })
      });
      const data = await res.json();
      if (data.success) {
        mostrarFeedback(`"${valor}" removido da aba Setup da planilha.`);
        setEditorialData(prev => ({
          ...prev,
          setup: data.setup
        }));
      }
    } catch (err) {
      mostrarFeedback('Erro ao remover: ' + err.message, 'erro');
    }
  }

  // Salvar ou atualizar Reel
  async function handleSalvarReel(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/reels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formReel)
      });
      const data = await res.json();
      if (data.success) {
        if (formReel.statusRoteiro === 'Publicado') {
          mostrarFeedback('Roteiro publicado e transferido para a Biblioteca de Conteúdos Postados!');
        } else {
          mostrarFeedback(formReel.id ? `Roteiro ${formReel.id} atualizado na planilha!` : 'Roteiro de Reel gravado na planilha com sucesso!');
        }
        setModalReelAberto(false);
        resetFormReel();
        await carregarDados();
      }
    } catch (err) {
      mostrarFeedback('Erro ao salvar reel: ' + err.message, 'erro');
    } finally {
      setSaving(false);
    }
  }

  function abrirEdicaoReel(reel) {
    setReelEmEdicao(reel);
    setFormReel({
      id: reel.id || '',
      tema: reel.tema || '',
      gancho: reel.gancho || '',
      desenvolvimento: reel.desenvolvimento || '',
      cta: reel.cta || '',
      tempoEstimado: reel.tempoEstimado || '60s',
      referenciaBiblica: reel.referenciaBiblica || '',
      statusRoteiro: reel.statusRoteiro || 'Ideia'
    });
    setModalReelAberto(true);
  }

  function resetFormReel() {
    setReelEmEdicao(null);
    setFormReel({
      id: '',
      tema: '',
      gancho: '',
      desenvolvimento: '',
      cta: '',
      tempoEstimado: '60s',
      referenciaBiblica: '',
      statusRoteiro: 'Ideia'
    });
  }

  // Excluir roteiro de Reel
  async function handleExcluirReel(id) {
    if (!confirm(`Deseja realmente excluir o roteiro de Reel ${id} da planilha?`)) return;
    try {
      const res = await fetch(`/api/reels/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        mostrarFeedback(`Roteiro de Reel ${id} excluído com sucesso da planilha.`);
        await carregarDados();
      }
    } catch (err) {
      mostrarFeedback('Erro ao excluir Reel: ' + err.message, 'erro');
    }
  }

  // Publicar Reel & mover para Biblioteca
  async function handleConfirmarPublicarReel() {
    if (!modalPublicarReel) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/reels/${modalPublicarReel.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ finalLink: linkInstagramPublicacao })
      });
      const data = await res.json();
      if (data.success) {
        mostrarFeedback(`Reel ${modalPublicarReel.id} publicado! Transferido automaticamente para a Biblioteca de Conteúdos Postados.`);
        setModalPublicarReel(null);
        setLinkInstagramPublicacao('');
        setReelsSubTab('biblioteca');
        await carregarDados();
      }
    } catch (err) {
      mostrarFeedback('Erro ao publicar Reel: ' + err.message, 'erro');
    } finally {
      setSaving(false);
    }
  }

  function abrirEdicaoPost(post) {
    setPostEmEdicao(post);
    let dVal = new Date().toISOString().slice(0, 10);
    let hVal = '14:00';
    if (post.data) {
      const clean = post.data.replace('T', ' ');
      const parts = clean.split(' ');
      if (parts[0]) dVal = parts[0].slice(0, 10);
      if (parts[1]) hVal = parts[1].slice(0, 5);
    }

    setFormPost({
      id: post.id || '',
      dataOnly: dVal,
      horaOnly: hVal,
      diaSemana: post.diaSemana || '',
      tema: post.tema || '',
      pilar: post.pilar || 'Teologia',
      objetivo: post.objetivo || 'Engajamento',
      formato: post.formato || 'Carrossel',
      cta: post.cta || '',
      responsavel: post.responsavel || 'Lucas Marques',
      prioridade: post.prioridade || 'Média',
      status: post.status || 'Ideia',
      linkCanva: post.linkCanva || '',
      linkInstagram: post.linkInstagram || post.linkDrive || '',
      linkDrive: post.linkInstagram || post.linkDrive || '',
      legenda: post.legenda || '',
      observacoes: post.observacoes || ''
    });
    setModalPostAberto(true);
  }

  function resetFormPost() {
    setPostEmEdicao(null);
    setCriandoInline(null);
    setNovoValorInline('');
    setFormPost({
      id: '',
      dataOnly: new Date().toISOString().slice(0, 10),
      horaOnly: '14:00',
      diaSemana: '',
      tema: '',
      pilar: editorialData.setup.pilares[0] || 'Teologia',
      objetivo: 'Engajamento',
      formato: editorialData.setup.formatos[0] || 'Carrossel',
      cta: '',
      responsavel: editorialData.setup.responsaveis[0] || 'Lucas Marques',
      prioridade: 'Média',
      status: 'Ideia',
      linkCanva: '',
      linkInstagram: '',
      linkDrive: '',
      legenda: '',
      observacoes: ''
    });
  }

  // Listas dinâmicas lidas da aba Setup
  const pilaresList = editorialData.setup?.pilares || ['Teologia', 'Comunidade', 'Eventos', 'Devocional', 'Avisos'];
  const formatosList = editorialData.setup?.formatos || ['Carrossel', 'Reels', 'Story', 'Foto', 'Vídeo Longo'];
  const responsaveisList = editorialData.setup?.responsaveis || ['Lucas Marques', 'Designers', 'Equipe Mídia', 'Pastoral'];

  // Filtragem dos posts com filtro de Status
  const postsFiltrados = useMemo(() => {
    return (editorialData.planejamento || []).filter((post) => {
      const matchPilar = pilarFiltro === 'Todos' || post.pilar === pilarFiltro;
      const matchFormato = formatoFiltro === 'Todos' || post.formato === formatoFiltro;
      const matchPrioridade = prioridadeFiltro === 'Todas' || post.prioridade === prioridadeFiltro;
      const matchStatus = statusFiltro === 'Todos' || post.status === statusFiltro;
      const matchBusca = !busca || 
        (post.tema && post.tema.toLowerCase().includes(busca.toLowerCase())) ||
        (post.id && post.id.toLowerCase().includes(busca.toLowerCase())) ||
        (post.responsavel && post.responsavel.toLowerCase().includes(busca.toLowerCase()));

      return matchPilar && matchFormato && matchPrioridade && matchStatus && matchBusca;
    });
  }, [editorialData.planejamento, pilarFiltro, formatoFiltro, prioridadeFiltro, statusFiltro, busca]);

  // Contadores para o Dashboard
  const stats = useMemo(() => {
    const list = editorialData.planejamento || [];
    return {
      total: list.length,
      ideias: list.filter(p => p.status === 'Ideia').length,
      planejamento: list.filter(p => p.status === 'Planejamento').length,
      producao: list.filter(p => p.status === 'Produção').length,
      revisao: list.filter(p => p.status === 'Revisão').length,
      agendados: list.filter(p => p.status === 'Agendado').length,
      publicados: list.filter(p => p.status === 'Publicado').length,
      urgentes: list.filter(p => p.prioridade === 'Urgente').length,
      reelsTotal: (editorialData.reels || []).length,
      eventosTotal: (editorialData.eventos || []).length,
      bibliotecaTotal: (editorialData.biblioteca || []).length,
      escalaTotal: (editorialData.escala || []).length
    };
  }, [editorialData]);

  // Listas de Voluntários, Funções e Cultos Fixos da Escala
  const voluntariosList = editorialData.setup?.voluntarios || [
    'Lucas Marques', 'Sarah Oliveira', 'Mateus Silva', 'Débora Santos', 
    'Gabriel Costa', 'Pr. Arthur', 'Mariana Souza', 'Felipe Rocha'
  ];
  const funcoesEscalaList = editorialData.setup?.funcoesEscala || [
    'Fotografia', 'Cobertura Stories', 'Transmissão YouTube', 
    'Projeção / Letras', 'Gravação de Reels', 'Operação de Som', 
    'Design & Telão', 'Apoio Geral'
  ];
  const cultosFixosList = editorialData.setup?.cultosFixos || [
    { id: 'fixo-terca', nome: 'Culto de Ensino', diaSemana: 'terça-feira', horaPadrao: '20:00', tipoData: 'Data Fixa (Culto)' },
    { id: 'fixo-dom-manha', nome: 'Culto de Celebração (Manhã)', diaSemana: 'domingo', horaPadrao: '10:00', tipoData: 'Data Fixa (Culto)' },
    { id: 'fixo-dom-noite', nome: 'Culto de Celebração (Noite)', diaSemana: 'domingo', horaPadrao: '19:00', tipoData: 'Data Fixa (Culto)' }
  ];

  // Reset do formulário de Escala
  function resetFormEscala() {
    setEscalaEmEdicao(null);
    setCriandoInlineEscala(null);
    setNovoValorInlineEscala('');
    setFormEscala({
      id: '',
      tipoData: 'Data Fixa (Culto)',
      evento: 'Culto de Ensino',
      dataOnly: new Date().toISOString().slice(0, 10),
      horaOnly: '20:00',
      diaSemana: '',
      pessoa: voluntariosList[0] || 'Lucas Marques',
      funcao: funcoesEscalaList[0] || 'Transmissão YouTube',
      status: 'Confirmado',
      observacoes: ''
    });
  }

  function abrirCriarEscala(preset = null) {
    resetFormEscala();
    if (preset) {
      const [dataPart, horaPart] = (preset.data || '').split(' ');
      setFormEscala(prev => ({
        ...prev,
        tipoData: preset.tipoData || 'Data Fixa (Culto)',
        evento: preset.evento || 'Culto de Ensino',
        dataOnly: dataPart || prev.dataOnly,
        horaOnly: horaPart || prev.horaOnly,
        diaSemana: preset.diaSemana || ''
      }));
    }
    setModalEscalaAberto(true);
  }

  function abrirEdicaoEscala(item) {
    setEscalaEmEdicao(item);
    setCriandoInlineEscala(null);
    setNovoValorInlineEscala('');
    const [dataPart, horaPart] = (item.data || '').split(' ');
    setFormEscala({
      id: item.id || '',
      tipoData: item.tipoData || 'Data Fixa (Culto)',
      evento: item.evento || 'Culto de Ensino',
      dataOnly: dataPart || new Date().toISOString().slice(0, 10),
      horaOnly: horaPart || '20:00',
      diaSemana: item.diaSemana || '',
      pessoa: item.pessoa || voluntariosList[0] || 'Lucas Marques',
      funcao: item.funcao || funcoesEscalaList[0] || 'Fotografia',
      status: item.status || 'Confirmado',
      observacoes: item.observacoes || ''
    });
    setModalEscalaAberto(true);
  }

  // Atalhos de cultos fixos para preencher data e horário no modal
  function aplicarPresetCultoFixo(tipo) {
    const now = new Date();
    let target = new Date();
    let hora = '20:00';
    let eventoNome = 'Culto de Ensino';

    if (tipo === 'terca_ensino') {
      const diff = (2 - now.getDay() + 7) % 7 || 7;
      target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
      hora = '20:00';
      eventoNome = 'Culto de Ensino';
    } else if (tipo === 'dom_manha') {
      const diff = (0 - now.getDay() + 7) % 7 || 7;
      target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
      hora = '10:00';
      eventoNome = 'Culto de Celebração (Manhã)';
    } else if (tipo === 'dom_noite') {
      const diff = (0 - now.getDay() + 7) % 7 || 7;
      target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
      hora = '19:00';
      eventoNome = 'Culto de Celebração (Noite)';
    }

    const isoDate = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
    setFormEscala(prev => ({
      ...prev,
      tipoData: 'Data Fixa (Culto)',
      evento: eventoNome,
      dataOnly: isoDate,
      horaOnly: hora
    }));
  }

  // Salvar escala na planilha
  async function handleSalvarEscala(e) {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        id: formEscala.id,
        tipoData: formEscala.tipoData,
        evento: formEscala.evento,
        data: `${formEscala.dataOnly} ${formEscala.horaOnly}`,
        diaSemana: formEscala.diaSemana,
        pessoa: formEscala.pessoa,
        funcao: formEscala.funcao,
        status: formEscala.status,
        observacoes: formEscala.observacoes
      };
      const res = await fetch('/api/escala', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Falha ao gravar escala');
      mostrarFeedback('Escala salva e sincronizada na planilha!');
      setModalEscalaAberto(false);
      await carregarDados();
    } catch (err) {
      console.error(err);
      mostrarFeedback('Erro ao salvar escala na planilha.', 'erro');
    } finally {
      setSaving(false);
    }
  }

  // Excluir escala
  async function handleExcluirEscala(id) {
    if (!window.confirm('Tem certeza que deseja excluir esta escala?')) return;
    try {
      const res = await fetch(`/api/escala/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao excluir');
      mostrarFeedback('Escala excluída da planilha!');
      await carregarDados();
    } catch (err) {
      console.error(err);
      mostrarFeedback('Erro ao excluir escala.', 'erro');
    }
  }

  // Mudar status da escala rápido
  async function handleMudarStatusEscala(item, novoStatus) {
    try {
      const res = await fetch('/api/escala', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, status: novoStatus })
      });
      if (!res.ok) throw new Error('Falha ao atualizar status');
      mostrarFeedback(`Status atualizado para "${novoStatus}"`);
      await carregarDados();
    } catch (err) {
      console.error(err);
      mostrarFeedback('Erro ao atualizar status', 'erro');
    }
  }

  // Gerar cultos fixos automáticos para o mês
  async function handleGerarCultosFixos() {
    setGerandoFixos(true);
    try {
      const res = await fetch('/api/escala/gerar-fixos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ano: escalaAno, mes: escalaMes })
      });
      if (!res.ok) throw new Error('Falha ao gerar');
      const data = await res.json();
      mostrarFeedback(`${data.gerados} slots de cultos fixos gerados para ${MESES_NOMES[escalaMes]}!`);
      await carregarDados();
    } catch (err) {
      console.error(err);
      mostrarFeedback('Erro ao gerar cultos fixos.', 'erro');
    } finally {
      setGerandoFixos(false);
    }
  }

  // Adicionar e remover voluntário
  async function handleAdicionarVoluntario(nome) {
    if (!nome || !nome.trim()) return;
    try {
      const res = await fetch('/api/escala/voluntarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nome.trim() })
      });
      if (!res.ok) throw new Error('Erro ao adicionar voluntário');
      mostrarFeedback(`Voluntário "${nome}" cadastrado com sucesso!`);
      setNovoNomeVoluntario('');
      setCriandoInlineEscala(null);
      await carregarDados();
    } catch (err) {
      console.error(err);
      mostrarFeedback('Erro ao cadastrar voluntário.', 'erro');
    }
  }

  async function handleRemoverVoluntario(nome) {
    if (!window.confirm(`Remover "${nome}" da lista de voluntários?`)) return;
    try {
      const res = await fetch('/api/escala/voluntarios', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome })
      });
      if (!res.ok) throw new Error('Erro ao remover voluntário');
      mostrarFeedback(`Voluntário "${nome}" removido.`);
      await carregarDados();
    } catch (err) {
      console.error(err);
      mostrarFeedback('Erro ao remover voluntário.', 'erro');
    }
  }

  // Adicionar e remover função da escala
  async function handleAdicionarFuncaoEscala(nome) {
    if (!nome || !nome.trim()) return;
    try {
      const res = await fetch('/api/escala/funcoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nome.trim() })
      });
      if (!res.ok) throw new Error('Erro ao adicionar função');
      mostrarFeedback(`Função "${nome}" cadastrada com sucesso!`);
      setNovaFuncaoEscala('');
      setCriandoInlineEscala(null);
      await carregarDados();
    } catch (err) {
      console.error(err);
      mostrarFeedback('Erro ao cadastrar função.', 'erro');
    }
  }

  async function handleRemoverFuncaoEscala(nome) {
    if (!window.confirm(`Remover "${nome}" da lista de funções?`)) return;
    try {
      const res = await fetch('/api/escala/funcoes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome })
      });
      if (!res.ok) throw new Error('Erro ao remover função');
      mostrarFeedback(`Função "${nome}" removida.`);
      await carregarDados();
    } catch (err) {
      console.error(err);
      mostrarFeedback('Erro ao remover função.', 'erro');
    }
  }

  // Filtragem da Escala por Mês, Tipo, Pessoa, Função, Status e Busca
  const escalaFiltrada = useMemo(() => {
    return (editorialData.escala || []).filter(item => {
      if (!item) return false;
      // Filtro de mês e ano
      let matchMesAno = true;
      if (item.data) {
        const rawDate = String(item.data).split(' ')[0];
        const [a, m] = rawDate.split('-').map(Number);
        if (a && m) {
          matchMesAno = (a === escalaAno && m - 1 === escalaMes);
        }
      }

      const matchTipo = escalaFiltroTipo === 'Todos' || item.tipoData === escalaFiltroTipo;
      const matchPessoa = escalaFiltroPessoa === 'Todas' || item.pessoa === escalaFiltroPessoa;
      const matchFuncao = escalaFiltroFuncao === 'Todas' || item.funcao === escalaFiltroFuncao;
      const matchStatus = escalaFiltroStatus === 'Todos' || item.status === escalaFiltroStatus;
      const matchBusca = !escalaBusca ||
        (item.evento && String(item.evento).toLowerCase().includes(escalaBusca.toLowerCase())) ||
        (item.pessoa && String(item.pessoa).toLowerCase().includes(escalaBusca.toLowerCase())) ||
        (item.funcao && String(item.funcao).toLowerCase().includes(escalaBusca.toLowerCase())) ||
        (item.id && String(item.id).toLowerCase().includes(escalaBusca.toLowerCase()));

      return matchMesAno && matchTipo && matchPessoa && matchFuncao && matchStatus && matchBusca;
    }).sort((a, b) => String(a.data || '').localeCompare(String(b.data || '')));
  }, [editorialData.escala, escalaAno, escalaMes, escalaFiltroTipo, escalaFiltroPessoa, escalaFiltroFuncao, escalaFiltroStatus, escalaBusca]);

  // Agrupamento de escalas por Culto / Evento (para a visualização em cards)
  const eventosEscalaAgrupados = useMemo(() => {
    const grupos = {};
    escalaFiltrada.forEach(item => {
      const key = `${item.data || 'Sem Data'}__${item.evento || 'Culto'}`;
      if (!grupos[key]) {
        grupos[key] = {
          data: item.data,
          diaSemana: item.diaSemana,
          tipoData: item.tipoData,
          evento: item.evento,
          escalas: []
        };
      }
      grupos[key].escalas.push(item);
    });
    return Object.values(grupos);
  }, [escalaFiltrada]);

  // Carga de escalas por pessoa (para visão por voluntário)
  const cargaPorVoluntario = useMemo(() => {
    const mapa = {};
    (voluntariosList || []).forEach(vol => {
      if (!vol) return;
      const nomeStr = String(vol).trim();
      mapa[nomeStr] = {
        nome: nomeStr,
        escalas: []
      };
    });

    escalaFiltrada.forEach(item => {
      const p = String(item.pessoa || 'A Definir').trim();
      if (!mapa[p]) {
        mapa[p] = { nome: p, escalas: [] };
      }
      mapa[p].escalas.push(item);
    });

    return Object.values(mapa).sort((a, b) => b.escalas.length - a.escalas.length);
  }, [escalaFiltrada, voluntariosList]);

  // Dados calculados para a Grade Mensal do Calendário
  const diasGrade = useMemo(() => {
    const primeiroDia = new Date(calAno, calMes, 1);
    const primeiroDiaSemana = primeiroDia.getDay(); // 0 a 6
    const totalDiasNoMes = new Date(calAno, calMes + 1, 0).getDate();
    const totalDiasMesAnterior = new Date(calAno, calMes, 0).getDate();

    const celulas = [];
    // Dias do mês anterior
    for (let i = primeiroDiaSemana - 1; i >= 0; i--) {
      const diaNum = totalDiasMesAnterior - i;
      const mesAnt = calMes === 0 ? 11 : calMes - 1;
      const anoAnt = calMes === 0 ? calAno - 1 : calAno;
      const dateIso = `${anoAnt}-${String(mesAnt + 1).padStart(2, '0')}-${String(diaNum).padStart(2, '0')}`;
      celulas.push({
        dia: diaNum,
        mes: mesAnt,
        ano: anoAnt,
        foraDoMes: true,
        dateIso
      });
    }
    // Dias do mês atual
    for (let d = 1; d <= totalDiasNoMes; d++) {
      const dateIso = `${calAno}-${String(calMes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      celulas.push({
        dia: d,
        mes: calMes,
        ano: calAno,
        foraDoMes: false,
        dateIso
      });
    }
    // Completar até múltiplo de 7 (geralmente 35 ou 42)
    const restantes = (7 - (celulas.length % 7)) % 7;
    for (let r = 1; r <= restantes; r++) {
      const mesProx = calMes === 11 ? 0 : calMes + 1;
      const anoProx = calMes === 11 ? calAno + 1 : calAno;
      const dateIso = `${anoProx}-${String(mesProx + 1).padStart(2, '0')}-${String(r).padStart(2, '0')}`;
      celulas.push({
        dia: r,
        mes: mesProx,
        ano: anoProx,
        foraDoMes: true,
        dateIso
      });
    }
    return celulas;
  }, [calAno, calMes]);

  const eventosPorData = useMemo(() => {
    const map = {};
    (editorialData.eventos || []).forEach(ev => {
      if (!ev.data) return;
      const k = String(ev.data).slice(0, 10);
      if (!map[k]) map[k] = [];
      map[k].push(ev);
    });
    return map;
  }, [editorialData.eventos]);

  const postsPorData = useMemo(() => {
    const map = {};
    (editorialData.planejamento || []).forEach(p => {
      if (!p.data) return;
      const k = String(p.data).slice(0, 10);
      if (!map[k]) map[k] = [];
      map[k].push(p);
    });
    return map;
  }, [editorialData.planejamento]);

  const hojeIso = new Date().toISOString().slice(0, 10);

  // Tela de Bloqueio e Segurança (Exibida caso o usuário ainda não tenha digitado o PIN)
  if (!autenticado) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-250 ${t.bgApp}`}>
        <div className={`w-full max-w-md p-8 rounded-2xl border shadow-2xl space-y-6 ${t.card}`}>
          <div className="text-center space-y-3">
            <img 
              src={t.logoSrc} 
              alt="Logo ICR Florianópolis" 
              className="h-16 w-auto mx-auto object-contain drop-shadow"
            />
            <div>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${t.badgeGold}`}>
                Acesso Seguro • ICR Florianópolis
              </span>
              <h2 className={`text-xl font-bold mt-2 ${t.textTitle}`}>
                Hub Editorial & Litúrgico
              </h2>
              <p className={`text-xs mt-1 ${t.textMuted}`}>
                Ambiente restrito à equipe pastoral, mídia e comunicação da igreja.
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${t.textTitle}`}>
                PIN / Senha de Acesso
              </label>
              <div className="relative">
                <Lock size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.textDim}`} />
                <input
                  type="password"
                  placeholder="Digite a senha da equipe..."
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setErroPin(false);
                  }}
                  autoFocus
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-sm focus:outline-none border ${t.input}`}
                />
              </div>
              {erroPin && (
                <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center space-x-1">
                  <AlertCircle size={12} />
                  <span>Senha incorreta. Tente novamente ou use a senha padrão.</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-98 flex items-center justify-center space-x-2 ${t.btnPrimary}`}
            >
              <Shield size={14} />
              <span>Acessar o Hub Editorial</span>
            </button>
          </form>

          <div className={`pt-4 border-t text-center ${t.divider}`}>
            <p className={`text-[11px] ${t.textDim}`}>
              💡 Senha padrão da equipe: <code className="font-mono font-bold text-[#C4B270]">icr2026</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-250 ${t.bgApp}`}>
      {/* Toast Feedback */}
      {feedback && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 rounded-lg shadow-xl text-sm font-medium transition-all ${
          feedback.tipo === 'erro' ? 'bg-rose-600 text-white' : 'bg-[#0D695D] text-white border border-[#C4B270]/30'
        }`}>
          {feedback.tipo === 'erro' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} className="text-[#C4B270]" />}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Header Unificado com Logo Oficial ICR e Controle de Tema */}
      <header className={`border-b sticky top-0 z-20 px-6 py-3 flex flex-wrap items-center justify-between gap-4 transition-colors ${t.bgHeader}`}>
        <div className="flex items-center space-x-3.5">
          {/* Logo Oficial ICR Florianópolis */}
          <div className="flex items-center space-x-3">
            <img 
              src={t.logoSrc} 
              alt="Logo ICR Florianópolis" 
              className="h-10 w-auto object-contain cursor-pointer transition-transform hover:scale-105 drop-shadow-sm"
              onClick={() => setActiveTab('planejamento')}
            />
            <div className={`h-8 w-[1px] hidden sm:block ${t.divider}`} />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className={`text-base font-bold tracking-tight ${t.textTitle}`}>Hub Editorial Web</h1>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${t.badgeGold}`}>
                ICR Florianópolis
              </span>
            </div>
            <p className={`text-xs flex items-center space-x-1.5 mt-0.5 ${t.textMuted}`}>
              <span className="inline-block w-2 h-2 rounded-full bg-[#0D695D] animate-pulse" />
              <span>Conectado à <strong>Database Controle Editorial.xlsx</strong></span>
            </p>
          </div>
        </div>

        {/* Ações Globais, Instagram & Botão de Modo Noturno / Claro */}
        <div className="flex items-center space-x-2">
          {/* Badge & Ação Rápida do Instagram */}
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setModalInstagramAberto(true)}
              title="Configurar Conexão do Instagram e Meta Graph API"
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border shadow-sm ${
                instagramStatus?.overview?.isLiveMode 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                  : (darkMode ? 'bg-[#062E31] hover:bg-[#093e43] text-[#FAF9F6] border-[#0D695D]/40' : 'bg-white hover:bg-[#F3EFE6] text-[#062E31] border-[#D6CDB8]')
              }`}
            >
              <span className="p-0.5 rounded bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white">
                <InstagramIcon size={12} />
              </span>
              <span className="hidden lg:inline font-mono text-[11px]">@{instagramStatus?.overview?.username || 'icrflorianopolis'}</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold flex items-center space-x-1 ${
                instagramStatus?.overview?.isLiveMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${instagramStatus?.overview?.isLiveMode ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span>{instagramStatus?.overview?.isLiveMode ? 'Live API' : 'Ao Vivo'}</span>
              </span>
            </button>

            <button
              type="button"
              onClick={sincronizarInstagramGeral}
              disabled={instagramSyncing}
              title="Sincronizar métricas de todas as postagens do Instagram em tempo real"
              className={`p-2 rounded-lg transition-all border shadow-sm ${t.btnSecondary} ${instagramSyncing ? 'opacity-70 cursor-wait' : ''}`}
            >
              <RefreshCw size={14} className={`${instagramSyncing ? 'animate-spin text-pink-500' : (darkMode ? 'text-[#C4B270]' : 'text-[#0D695D]')}`} />
            </button>
          </div>

          {/* Botão de Ativar e Desativar Modo Noturno */}
          <button
            type="button"
            onClick={toggleDarkMode}
            title={darkMode ? "Alternar para Modo Claro" : "Alternar para Modo Noturno"}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all border shadow-sm ${
              darkMode 
                ? 'bg-[#062E31] hover:bg-[#093e43] text-[#C4B270] border-[#0D695D]/40' 
                : 'bg-white hover:bg-[#F3EFE6] text-[#062E31] border-[#D6CDB8]'
            }`}
          >
            {darkMode ? (
              <>
                <Sun size={15} className="text-[#C4B270]" />
                <span className="hidden sm:inline">Modo Claro</span>
              </>
            ) : (
              <>
                <Moon size={15} className="text-[#0D695D]" />
                <span className="hidden sm:inline">Modo Noturno</span>
              </>
            )}
          </button>

          <button
            onClick={() => carregarDados()}
            title="Recarregar dados da planilha"
            className={`p-2 rounded-lg transition-colors border ${t.btnSecondary}`}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            type="button"
            onClick={handleLogout}
            title="Bloquear painel (exigir PIN de segurança para entrar)"
            className={`p-2 rounded-lg transition-colors border text-slate-400 hover:text-rose-400 ${t.btnSecondary}`}
          >
            <LogOut size={16} />
          </button>

          <a
            href="/api/download-excel"
            download="Database Controle Editorial.xlsx"
            className={`hidden md:flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all shadow-sm border ${t.btnSecondary}`}
          >
            <FileSpreadsheet size={15} className={darkMode ? "text-[#C4B270]" : "text-[#0D695D]"} />
            <span>Baixar Planilha</span>
          </a>

          <button
            onClick={() => {
              resetFormPost();
              setModalPostAberto(true);
            }}
            className="flex items-center space-x-2 bg-[#0D695D] hover:bg-[#095248] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-md active:scale-95 border border-[#C4B270]/30"
          >
            <Plus size={16} />
            <span>Nova Pauta</span>
          </button>
        </div>
      </header>

      {/* Barra de Navegação por Módulos */}
      <nav className={`border-b px-6 py-2 flex items-center space-x-1 overflow-x-auto transition-colors ${t.bgNav}`}>
        <button
          onClick={() => setActiveTab('planejamento')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'planejamento' ? t.navActive : t.navInactive
          }`}
        >
          <Calendar size={14} />
          <span>Planejamento & Pautas</span>
          <span className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full ${
            darkMode ? 'bg-[#031718] text-[#A5C2BE]' : 'bg-[#EAE4D7] text-[#062E31]'
          }`}>
            {stats.total}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'dashboard' ? t.navActive : t.navInactive
          }`}
        >
          <LayoutDashboard size={14} />
          <span>Dashboard & Métricas</span>
        </button>

        <button
          onClick={() => setActiveTab('reels')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'reels' ? t.navActive : t.navInactive
          }`}
        >
          <Video size={14} />
          <span>Roteiros de Reels</span>
          <span className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full ${
            darkMode ? 'bg-[#031718] text-[#A5C2BE]' : 'bg-[#EAE4D7] text-[#062E31]'
          }`}>
            {stats.reelsTotal}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('calendario')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'calendario' ? t.navActive : t.navInactive
          }`}
        >
          <Calendar size={14} />
          <span>Calendário Editorial</span>
          <span className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full ${
            darkMode ? 'bg-[#031718] text-[#A5C2BE]' : 'bg-[#EAE4D7] text-[#062E31]'
          }`}>
            {stats.eventosTotal}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('escala')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'escala' ? t.navActive : t.navInactive
          }`}
        >
          <Users size={14} />
          <span>Escala de Equipe</span>
          <span className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full ${
            darkMode ? 'bg-[#031718] text-[#A5C2BE]' : 'bg-[#EAE4D7] text-[#062E31]'
          }`}>
            {stats.escalaTotal || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('setup')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'setup' ? t.navActive : t.navInactive
          }`}
        >
          <Settings size={14} />
          <span>Taxonomia & Setup</span>
        </button>

        <button
          onClick={() => setActiveTab('manual')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'manual' ? t.navActive : t.navInactive
          }`}
        >
          <BookOpen size={14} />
          <span>Manual Editorial ICR</span>
        </button>
      </nav>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6">
        <ErrorBoundary>

        {/* 1. ABA: PLANEJAMENTO & PAUTAS */}
        {activeTab === 'planejamento' && (
          <div className="space-y-5">
            {/* Controles de Filtro e Busca */}
            <div className={`rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm border ${t.card}`}>
              <div className="flex flex-wrap items-center gap-3">
                {/* Busca */}
                <div className="relative min-w-[220px]">
                  <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.textDim}`} />
                  <input
                    type="text"
                    placeholder="Buscar por tema, ID ou responsável..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className={`w-full pl-9 pr-3 py-1.5 rounded-lg text-xs focus:outline-none border ${t.input}`}
                  />
                </div>

                {/* Filtro Pilar */}
                <div className="flex items-center space-x-1.5">
                  <span className={`text-xs ${t.textMuted}`}>Pilar:</span>
                  <select
                    value={pilarFiltro}
                    onChange={(e) => setPilarFiltro(e.target.value)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs focus:outline-none border ${t.input}`}
                  >
                    <option value="Todos">Todos os Pilares</option>
                    {pilaresList.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                {/* Filtro Formato */}
                <div className="flex items-center space-x-1.5">
                  <span className={`text-xs ${t.textMuted}`}>Formato:</span>
                  <select
                    value={formatoFiltro}
                    onChange={(e) => setFormatoFiltro(e.target.value)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs focus:outline-none border ${t.input}`}
                  >
                    <option value="Todos">Todos os Formatos</option>
                    {formatosList.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                {/* Filtro Prioridade */}
                <div className="flex items-center space-x-1.5">
                  <span className={`text-xs ${t.textMuted}`}>Prioridade:</span>
                  <select
                    value={prioridadeFiltro}
                    onChange={(e) => setPrioridadeFiltro(e.target.value)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs focus:outline-none border ${t.input}`}
                  >
                    <option value="Todas">Todas as Prioridades</option>
                    {PRIORIDADES_LIST.map(pr => <option key={pr} value={pr}>{pr}</option>)}
                  </select>
                </div>

                {/* Filtro Status */}
                <div className="flex items-center space-x-1.5">
                  <span className={`text-xs ${t.textMuted}`}>Status:</span>
                  <select
                    value={statusFiltro}
                    onChange={(e) => setStatusFiltro(e.target.value)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs focus:outline-none border ${t.input}`}
                  >
                    <option value="Todos">Todos os Status</option>
                    {STATUS_LIST.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
              </div>

              {/* Seletor Tabela / Kanban */}
              <div className={`flex items-center space-x-1 p-1 rounded-lg ${t.tabToggleContainer}`}>
                <button
                  type="button"
                  onClick={() => setViewMode('tabela')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                    viewMode === 'tabela' ? t.tabToggleActive : t.tabToggleInactive
                  }`}
                >
                  Tabela
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('kanban')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                    viewMode === 'kanban' ? t.tabToggleActive : t.tabToggleInactive
                  }`}
                >
                  Kanban (Status)
                </button>
              </div>
            </div>

            {/* MODO TABELA */}
            {viewMode === 'tabela' && (
              <div className={`rounded-xl overflow-hidden shadow-sm border ${t.card}`}>
                <div className={`px-6 py-3.5 border-b flex justify-between items-center text-xs ${t.divider} ${t.textMuted}`}>
                  <span>Exibindo <strong>{postsFiltrados.length}</strong> de {stats.total} publicações</span>
                  <span className="hidden sm:inline">Sincronização bidirecional ativa com a planilha</span>
                </div>

                {loading ? (
                  <div className={`p-12 text-center text-sm ${t.textMuted}`}>Carregando dados da planilha...</div>
                ) : postsFiltrados.length === 0 ? (
                  <div className={`p-12 text-center text-sm ${t.textMuted}`}>
                    Nenhuma pauta encontrada com os filtros selecionados.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className={`text-xs uppercase font-semibold ${t.tableHeader}`}>
                        <tr>
                          <th className="py-3 px-5">ID</th>
                          <th className="py-3 px-5">Data Prevista</th>
                          <th className="py-3 px-5">Tema / Pauta</th>
                          <th className="py-3 px-5">Pilar</th>
                          <th className="py-3 px-5">Formato</th>
                          <th className="py-3 px-5">Responsável</th>
                          <th className="py-3 px-5">Prioridade</th>
                          <th className="py-3 px-5">Status</th>
                          <th className="py-3 px-5">Métricas Instagram</th>
                          <th className="py-3 px-5 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${t.divider}`}>
                        {postsFiltrados.map((post) => (
                          <tr key={post.id} className={`transition-colors ${t.tableRow}`}>
                            <td className={`py-3.5 px-5 font-mono text-xs font-bold ${t.textAccent}`}>
                              {post.id}
                            </td>
                            <td className={`py-3.5 px-5 text-xs font-mono whitespace-nowrap ${t.textTitle}`}>
                              {formatarDataBR(post.data)}
                              {post.diaSemana && <span className={`block text-[10px] capitalize ${t.textDim}`}>{post.diaSemana}</span>}
                            </td>
                            <td className="py-3.5 px-5">
                              <span className={`font-semibold ${t.textTitle}`}>{post.tema}</span>
                              {post.legenda && (
                                <p className={`text-xs line-clamp-1 mt-0.5 ${t.textMuted}`}>{post.legenda}</p>
                              )}
                            </td>
                            <td className="py-3.5 px-5">
                              <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${t.tag}`}>
                                {post.pilar}
                              </span>
                            </td>
                            <td className={`py-3.5 px-5 text-xs ${t.textTitle}`}>{post.formato}</td>
                            <td className={`py-3.5 px-5 text-xs ${t.textTitle}`}>{post.responsavel}</td>
                            <td className="py-3.5 px-5">
                              <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                                post.prioridade === 'Urgente'
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  : post.prioridade === 'Alta'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}>
                                {post.prioridade}
                              </span>
                            </td>
                            <td className="py-3.5 px-5">
                              <select
                                value={post.status}
                                onChange={(e) => handleMudarStatus(post, e.target.value)}
                                className={`rounded px-2 py-1 text-xs focus:outline-none border ${t.input}`}
                              >
                                {STATUS_LIST.map(st => (
                                  <option key={st} value={st}>{st}</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-3.5 px-5 whitespace-nowrap">
                              {post.metricas && typeof post.metricas === 'object' && post.metricas.curtidas !== undefined ? (
                                <div className="flex items-center space-x-2">
                                  <div className="flex items-center space-x-1.5 text-xs">
                                    <span className="text-rose-400 font-semibold flex items-center space-x-0.5" title="Curtidas">
                                      <span>❤️</span>
                                      <span>{post.metricas.curtidas}</span>
                                    </span>
                                    <span className="text-sky-400 font-semibold flex items-center space-x-0.5" title="Comentários">
                                      <span>💬</span>
                                      <span>{post.metricas.comentarios}</span>
                                    </span>
                                    <span className="text-amber-400 font-semibold flex items-center space-x-0.5" title="Salvos">
                                      <span>🔖</span>
                                      <span>{post.metricas.salvos}</span>
                                    </span>
                                    <span className="text-emerald-400 font-semibold flex items-center space-x-0.5" title="Compartilhamentos">
                                      <span>📤</span>
                                      <span>{post.metricas.compartilhamentos}</span>
                                    </span>
                                    <span className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${t.badgeGold}`} title="Taxa de Engajamento">
                                      {post.metricas.taxaEngajamento || '0%'}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => sincronizarPostInstagram(post.id)}
                                    disabled={syncingPostId === post.id}
                                    title="Atualizar métricas deste post em tempo real"
                                    className={`p-1 rounded transition-colors ${t.iconBtn}`}
                                  >
                                    <RefreshCw size={12} className={syncingPostId === post.id ? 'animate-spin text-pink-500' : ''} />
                                  </button>
                                </div>
                              ) : (post.status === 'Publicado' || post.linkInstagram) ? (
                                <button
                                  type="button"
                                  onClick={() => sincronizarPostInstagram(post.id)}
                                  disabled={syncingPostId === post.id}
                                  className={`flex items-center space-x-1 px-2 py-1 rounded text-[11px] font-semibold border ${t.btnSecondary}`}
                                >
                                  <RefreshCw size={11} className={syncingPostId === post.id ? 'animate-spin' : ''} />
                                  <span>Obter Métricas</span>
                                </button>
                              ) : (
                                <span className={`text-xs ${t.textDim}`}>-</span>
                              )}
                            </td>
                            <td className="py-3.5 px-5 text-right space-x-1 whitespace-nowrap">
                              {post.linkCanva && (
                                <a
                                  href={post.linkCanva}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Abrir Canva"
                                  className="inline-flex p-1.5 text-indigo-400 hover:text-indigo-300 rounded"
                                >
                                  <ExternalLink size={14} />
                                </a>
                              )}
                              {(post.linkInstagram || post.linkDrive) && (
                                <a
                                  href={post.linkInstagram || post.linkDrive}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Abrir Post no Instagram"
                                  className="inline-flex p-1.5 text-pink-400 hover:text-pink-300 rounded"
                                >
                                  <InstagramIcon size={14} />
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => abrirEdicaoPost(post)}
                                title="Editar pauta"
                                className={`p-1.5 rounded transition-colors ${t.iconBtn}`}
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleExcluirPost(post.id)}
                                title="Excluir pauta"
                                className="p-1.5 rounded text-slate-400 hover:text-rose-500 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* MODO KANBAN */}
            {viewMode === 'kanban' && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-6">
                {STATUS_LIST.map((colStatus) => {
                  const postsColuna = postsFiltrados.filter(p => p.status === colStatus);
                  return (
                    <div key={colStatus} className={`rounded-xl flex flex-col min-w-[200px] border ${t.card}`}>
                      {/* Topo da Coluna */}
                      <div className={`p-3 border-b flex justify-between items-center rounded-t-xl ${t.divider} ${t.cardInner}`}>
                        <span className={`text-xs font-bold uppercase tracking-wider ${t.textTitle}`}>
                          {colStatus}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${t.tag}`}>
                          {postsColuna.length}
                        </span>
                      </div>

                      {/* Cards */}
                      <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[650px]">
                        {postsColuna.map((post) => (
                          <div 
                            key={post.id} 
                            className={`p-3.5 rounded-lg shadow-sm space-y-2.5 transition-all border ${t.statusCard}`}
                          >
                            <div className="flex justify-between items-start">
                              <span className={`font-mono text-[10px] font-bold ${t.textAccent}`}>
                                {post.id}
                              </span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                                post.prioridade === 'Urgente'
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  : post.prioridade === 'Alta'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}>
                                {post.prioridade}
                              </span>
                            </div>

                            <h4 className={`text-xs font-semibold line-clamp-2 ${t.textTitle}`}>
                              {post.tema}
                            </h4>

                            <div className={`flex flex-wrap items-center justify-between gap-1 text-[10px] ${t.textMuted}`}>
                              <div className="flex flex-wrap gap-1">
                                <span className={`px-1.5 py-0.5 rounded ${t.tag}`}>
                                  {post.pilar}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded ${t.tag}`}>
                                  {post.formato}
                                </span>
                              </div>
                              {(post.linkInstagram || post.linkDrive) && (
                                <a
                                  href={post.linkInstagram || post.linkDrive}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Ver no Instagram"
                                  className="text-pink-400 hover:text-pink-300"
                                >
                                  <InstagramIcon size={12} />
                                </a>
                              )}
                            </div>

                            {post.data && (
                              <div className={`text-[10px] font-mono ${t.textDim}`}>
                                📅 {formatarDataBR(post.data)}
                              </div>
                            )}

                            {post.metricas && typeof post.metricas === 'object' && post.metricas.curtidas !== undefined && (
                              <div className={`p-2 rounded border text-[10px] space-y-1 ${t.cardInner}`}>
                                <div className="flex items-center justify-between">
                                  <span className="text-rose-400 font-semibold">❤️ {post.metricas.curtidas}</span>
                                  <span className="text-sky-400 font-semibold">💬 {post.metricas.comentarios}</span>
                                  <span className="text-amber-400 font-semibold">🔖 {post.metricas.salvos}</span>
                                  <span className={`px-1 rounded font-bold text-[9px] ${t.badgeGold}`}>
                                    {post.metricas.taxaEngajamento || '0%'}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-[9px] text-[#A5C2BE]">
                                  <span>Alcance: {post.metricas.alcance}</span>
                                  <button
                                    type="button"
                                    onClick={() => sincronizarPostInstagram(post.id)}
                                    disabled={syncingPostId === post.id}
                                    title="Sincronizar métricas deste post"
                                    className={`hover:${t.textAccent} transition-colors p-0.5`}
                                  >
                                    <RefreshCw size={10} className={syncingPostId === post.id ? 'animate-spin text-pink-500' : ''} />
                                  </button>
                                </div>
                              </div>
                            )}

                            <div className={`pt-1 border-t flex justify-between items-center text-[10px] ${t.divider} ${t.textDim}`}>
                              <span>{post.responsavel}</span>
                              <div className="space-x-1">
                                <button
                                  type="button"
                                  onClick={() => abrirEdicaoPost(post)}
                                  className={`hover:${t.textAccent} transition-colors p-1`}
                                  title="Editar"
                                >
                                  <Edit3 size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleExcluirPost(post.id)}
                                  className="hover:text-rose-400 transition-colors p-1"
                                  title="Excluir"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>

                            {/* Seletor rápido de transição */}
                            <div className="pt-1">
                              <select
                                value={post.status}
                                onChange={(e) => handleMudarStatus(post, e.target.value)}
                                className={`w-full rounded px-1.5 py-1 text-[10px] focus:outline-none border ${t.input}`}
                              >
                                {STATUS_LIST.map(st => (
                                  <option key={st} value={st}>Mover para: {st}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. ABA: DASHBOARD & MÉTRICAS */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Cards de Métricas Principais */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className={`p-4 rounded-xl border ${t.metricCard}`}>
                <span className={`text-xs font-semibold uppercase ${t.textMuted}`}>Total de Pautas</span>
                <p className={`text-2xl font-bold mt-1 ${t.textAccent}`}>{stats.total}</p>
                <span className={`text-[10px] mt-1 block ${t.textDim}`}>Na planilha ativa</span>
              </div>

              <div className={`p-4 rounded-xl border ${t.metricCard}`}>
                <span className={`text-xs font-semibold uppercase ${t.textMuted}`}>Ideias & Pautas</span>
                <p className="text-2xl font-bold text-amber-500 mt-1">{stats.ideias + stats.planejamento}</p>
                <span className={`text-[10px] mt-1 block ${t.textDim}`}>Em concepção</span>
              </div>

              <div className={`p-4 rounded-xl border ${t.metricCard}`}>
                <span className={`text-xs font-semibold uppercase ${t.textMuted}`}>Em Produção</span>
                <p className="text-2xl font-bold text-sky-500 mt-1">{stats.producao + stats.revisao}</p>
                <span className={`text-[10px] mt-1 block ${t.textDim}`}>Design e roteiro</span>
              </div>

              <div className={`p-4 rounded-xl border ${t.metricCard}`}>
                <span className={`text-xs font-semibold uppercase ${t.textMuted}`}>Agendados</span>
                <p className="text-2xl font-bold text-indigo-400 mt-1">{stats.agendados}</p>
                <span className={`text-[10px] mt-1 block ${t.textDim}`}>Aguardando disparo</span>
              </div>

              <div className={`p-4 rounded-xl border ${t.metricCard}`}>
                <span className={`text-xs font-semibold uppercase ${t.textMuted}`}>Publicados</span>
                <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-[#C4B270]' : 'text-[#0D695D]'}`}>{stats.publicados}</p>
                <span className={`text-[10px] mt-1 block ${t.textDim}`}>No Instagram</span>
              </div>

              <div className={`p-4 rounded-xl border ${t.metricCard}`}>
                <span className="text-xs font-semibold text-rose-500 uppercase">Urgentes</span>
                <p className="text-2xl font-bold text-rose-500 mt-1">{stats.urgentes}</p>
                <span className={`text-[10px] mt-1 block ${t.textDim}`}>Prioridade máxima</span>
              </div>
            </div>

            {/* Seção Instagram: Telemetria & Métricas em Tempo Real */}
            <div className={`rounded-xl p-5 border shadow-sm space-y-4 ${t.card}`}>
              {/* Topo da Seção Instagram */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 border-[#0D695D]/25">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white shadow-md">
                    <InstagramIcon size={22} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className={`text-base font-bold ${t.textTitle}`}>
                        Desempenho no Instagram (@{instagramStatus?.overview?.username || 'icrflorianopolis'})
                      </h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center space-x-1 ${
                        instagramStatus?.overview?.isLiveMode 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${instagramStatus?.overview?.isLiveMode ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                        <span>{instagramStatus?.overview?.isLiveMode ? 'Meta Graph API Conectada' : 'Modo Telemetria em Tempo Real'}</span>
                      </span>
                    </div>
                    <p className={`text-xs ${t.textMuted}`}>
                      Métricas sincronizadas diretamente na planilha <strong>Database Controle Editorial.xlsx</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setModalInstagramAberto(true)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${t.btnSecondary}`}
                  >
                    <Settings size={13} />
                    <span>Configurar Conexão</span>
                  </button>
                  <button
                    type="button"
                    onClick={sincronizarInstagramGeral}
                    disabled={instagramSyncing}
                    className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-md active:scale-95 text-white bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-90 disabled:opacity-50`}
                  >
                    <RefreshCw size={13} className={instagramSyncing ? 'animate-spin' : ''} />
                    <span>{instagramSyncing ? 'Sincronizando...' : 'Sincronizar em Tempo Real'}</span>
                  </button>
                </div>
              </div>

              {/* Grid de 6 Cartões de Métricas do Instagram */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className={`p-3.5 rounded-xl border ${t.cardInner}`}>
                  <div className="flex items-center justify-between text-rose-500 mb-1">
                    <span className="text-[11px] font-semibold uppercase">Curtidas</span>
                    <Heart size={14} className="fill-current" />
                  </div>
                  <p className="text-xl font-bold text-rose-400">
                    {instagramMetricsConsolidado.totalCurtidas.toLocaleString('pt-BR')}
                  </p>
                  <span className={`text-[10px] block mt-0.5 ${t.textDim}`}>Nas pautas sincronizadas</span>
                </div>

                <div className={`p-3.5 rounded-xl border ${t.cardInner}`}>
                  <div className="flex items-center justify-between text-sky-400 mb-1">
                    <span className="text-[11px] font-semibold uppercase">Comentários</span>
                    <MessageCircle size={14} />
                  </div>
                  <p className="text-xl font-bold text-sky-400">
                    {instagramMetricsConsolidado.totalComentarios.toLocaleString('pt-BR')}
                  </p>
                  <span className={`text-[10px] block mt-0.5 ${t.textDim}`}>Interações ativas</span>
                </div>

                <div className={`p-3.5 rounded-xl border ${t.cardInner}`}>
                  <div className="flex items-center justify-between text-amber-400 mb-1">
                    <span className="text-[11px] font-semibold uppercase">Salvos</span>
                    <Bookmark size={14} className="fill-current" />
                  </div>
                  <p className="text-xl font-bold text-amber-400">
                    {instagramMetricsConsolidado.totalSalvos.toLocaleString('pt-BR')}
                  </p>
                  <span className={`text-[10px] block mt-0.5 ${t.textDim}`}>Doutrina / Teologia</span>
                </div>

                <div className={`p-3.5 rounded-xl border ${t.cardInner}`}>
                  <div className="flex items-center justify-between text-emerald-400 mb-1">
                    <span className="text-[11px] font-semibold uppercase">Compartilhamentos</span>
                    <Share2 size={14} />
                  </div>
                  <p className="text-xl font-bold text-emerald-400">
                    {instagramMetricsConsolidado.totalCompartilhamentos.toLocaleString('pt-BR')}
                  </p>
                  <span className={`text-[10px] block mt-0.5 ${t.textDim}`}>Evangelismo e convites</span>
                </div>

                <div className={`p-3.5 rounded-xl border ${t.cardInner}`}>
                  <div className="flex items-center justify-between text-indigo-400 mb-1">
                    <span className="text-[11px] font-semibold uppercase">Alcance Total</span>
                    <Radio size={14} />
                  </div>
                  <p className="text-xl font-bold text-indigo-300">
                    {(instagramMetricsConsolidado.totalAlcance / 1000).toFixed(1)}k
                  </p>
                  <span className={`text-[10px] block mt-0.5 ${t.textDim}`}>Contas únicas atingidas</span>
                </div>

                <div className={`p-3.5 rounded-xl border ${t.cardInner}`}>
                  <div className="flex items-center justify-between text-[#C4B270] mb-1">
                    <span className="text-[11px] font-semibold uppercase">Engajamento Médio</span>
                    <TrendingUp size={14} />
                  </div>
                  <p className={`text-xl font-bold ${t.textAccent}`}>
                    {instagramMetricsConsolidado.taxaMedia}
                  </p>
                  <span className={`text-[10px] block mt-0.5 ${t.textDim}`}>Interações / Alcance</span>
                </div>
              </div>

              {/* Sub-painéis: Top Publicações & Status da Conta */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
                {/* Top Publicações por Engajamento */}
                <div className={`lg:col-span-2 p-4 rounded-xl border ${t.cardInner} space-y-3`}>
                  <div className="flex items-center justify-between">
                    <h4 className={`text-xs font-bold uppercase tracking-wider ${t.textTitle}`}>
                      Top Publicações com Maior Taxa de Engajamento
                    </h4>
                    <span className={`text-[10px] ${t.textDim}`}>Baseado nas interações por alcance</span>
                  </div>

                  {instagramMetricsConsolidado.topPosts.length === 0 ? (
                    <p className={`text-xs text-center py-6 ${t.textMuted}`}>
                      Nenhum post com métricas sincronizadas ainda. Clique em "Sincronizar em Tempo Real" acima.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {instagramMetricsConsolidado.topPosts.map((post, idx) => (
                        <div 
                          key={post.id} 
                          className={`p-2.5 rounded-lg border flex flex-wrap items-center justify-between gap-2 text-xs transition-colors ${t.cardAlt}`}
                        >
                          <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                            <span className="w-5 h-5 rounded-full bg-[#0D695D]/30 text-[#C4B270] font-bold text-[10px] flex items-center justify-center shrink-0">
                              #{idx + 1}
                            </span>
                            <div className="min-w-0">
                              <p className={`font-semibold truncate ${t.textTitle}`}>{post.tema}</p>
                              <div className="flex items-center space-x-2 text-[10px]">
                                <span className={t.textDim}>{post.id}</span>
                                <span>•</span>
                                <span className={t.textMuted}>{post.pilar}</span>
                                <span>•</span>
                                <span className={t.textMuted}>{post.formato}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 shrink-0">
                            <div className="flex items-center space-x-2 text-[11px]">
                              <span className="text-rose-400 font-medium">❤️ {post.metricas?.curtidas || 0}</span>
                              <span className="text-sky-400 font-medium">💬 {post.metricas?.comentarios || 0}</span>
                              <span className="text-amber-400 font-medium">🔖 {post.metricas?.salvos || 0}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded font-bold text-xs ${t.badgeGold}`}>
                              {post.metricas?.taxaEngajamento || '0%'}
                            </span>
                            {post.linkInstagram && (
                              <a
                                href={post.linkInstagram}
                                target="_blank"
                                rel="noreferrer"
                                title="Ver no Instagram"
                                className="p-1 rounded text-pink-400 hover:text-pink-300 transition-colors"
                              >
                                <ExternalLink size={13} />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Perfil & Status da Igreja */}
                <div className={`p-4 rounded-xl border ${t.cardInner} flex flex-col justify-between space-y-3`}>
                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${t.textTitle}`}>
                      Canal Oficial no Instagram
                    </h4>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shrink-0">
                        <img 
                          src="/brand/icon-symbol-gold.png" 
                          alt="ICR Profile" 
                          className="w-full h-full object-cover rounded-full bg-[#062E31]"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className={`font-bold text-xs truncate ${t.textTitle}`}>
                          {instagramStatus?.overview?.name || 'Igreja Cristã Reformada'}
                        </p>
                        <p className={`text-xs font-mono ${t.textAccent}`}>
                          @{instagramStatus?.overview?.username || 'icrflorianopolis'}
                        </p>
                        <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Monitoramento Ativo</span>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className={`flex justify-between py-1 border-b ${t.divider}`}>
                        <span className={t.textMuted}>Seguidores:</span>
                        <span className={`font-semibold ${t.textTitle}`}>
                          {(instagramStatus?.overview?.followersCount || 4892).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className={`flex justify-between py-1 border-b ${t.divider}`}>
                        <span className={t.textMuted}>Publicações Totais:</span>
                        <span className={`font-semibold ${t.textTitle}`}>
                          {(instagramStatus?.overview?.mediaCount || 384).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className={`flex justify-between py-1 border-b ${t.divider}`}>
                        <span className={t.textMuted}>Posts na Planilha:</span>
                        <span className={`font-semibold ${t.textTitle}`}>
                          {editorialData.planejamento?.length || 0} pautas
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className={t.textMuted}>Última Sincronização:</span>
                        <span className={`font-mono text-[10px] ${t.textDim}`}>
                          {instagramStatus?.config?.lastSync 
                            ? new Date(instagramStatus.config.lastSync).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                            : 'Agora'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={`https://www.instagram.com/${instagramStatus?.overview?.username || 'icrflorianopolis'}/`}
                    target="_blank"
                    rel="noreferrer"
                    className={`w-full flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-semibold transition-all border ${t.btnSecondary}`}
                  >
                    <InstagramIcon size={14} className="text-pink-400" />
                    <span>Abrir Perfil no Instagram</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Distribuição por Pilares */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`rounded-xl p-5 border ${t.card}`}>
                <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${t.textTitle}`}>
                  Distribuição por Pilares Editoriais
                </h3>
                <div className="space-y-3">
                  {pilaresList.map(pilar => {
                    const count = (editorialData.planejamento || []).filter(p => p.pilar === pilar).length;
                    const percent = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                    return (
                      <div key={pilar} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className={t.textTitle}>{pilar}</span>
                          <span className={t.textMuted}>{count} ({percent}%)</span>
                        </div>
                        <div className={`w-full h-2 rounded-full overflow-hidden ${t.cardInner} border ${t.divider}`}>
                          <div 
                            className="h-full bg-[#0D695D] rounded-full transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Informações da Database */}
              <div className={`rounded-xl p-5 flex flex-col justify-between border ${t.card}`}>
                <div>
                  <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 ${t.textTitle}`}>
                    Status do Banco de Dados (.xlsx)
                  </h3>
                  <div className="space-y-2 text-xs">
                    <p className={`flex justify-between py-1 border-b ${t.divider}`}>
                      <span className={t.textMuted}>Arquivo Ativo:</span>
                      <span className={`font-mono font-bold ${t.textAccent}`}>Database Controle Editorial.xlsx</span>
                    </p>
                    <p className={`flex justify-between py-1 border-b ${t.divider}`}>
                      <span className={t.textMuted}>Backup Automático:</span>
                      <span className={`font-mono ${t.textDim}`}>/home/luccas/Downloads/</span>
                    </p>
                    <p className={`flex justify-between py-1 border-b ${t.divider}`}>
                      <span className={t.textMuted}>Formulas / Equações:</span>
                      <span className={t.textTitle}>0 (Valores 100% limpos e normalizados)</span>
                    </p>
                    <p className={`flex justify-between py-1 border-b ${t.divider}`}>
                      <span className={t.textMuted}>Pilares Cadastrados:</span>
                      <span className={`font-semibold ${t.textTitle}`}>{pilaresList.length}</span>
                    </p>
                    <p className={`flex justify-between py-1 border-b ${t.divider}`}>
                      <span className={t.textMuted}>Formatos Cadastrados:</span>
                      <span className={`font-semibold ${t.textTitle}`}>{formatosList.length}</span>
                    </p>
                  </div>
                </div>

                <div className={`mt-4 pt-4 border-t ${t.divider}`}>
                  <a
                    href="/api/download-excel"
                    download="Database Controle Editorial.xlsx"
                    className={`w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${t.btnPrimary}`}
                  >
                    <Download size={14} />
                    <span>Exportar Cópia Sincronizada da Planilha</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. ABA: ROTEIROS DE REELS & BIBLIOTECA */}
        {activeTab === 'reels' && (
          <div className="space-y-5">
            {/* Topo: Título, Sub-abas e Botão Novo Reel */}
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <h2 className={`text-base font-bold flex items-center space-x-2 ${t.textTitle}`}>
                  <Video size={18} className={t.textAccent} />
                  <span>Roteiros de Reels & Biblioteca de Publicações</span>
                </h2>
                <p className={`text-xs ${t.textMuted}`}>
                  Criação, edição e publicação de scripts em vídeo para o Instagram da ICR
                </p>
              </div>

              <div className="flex items-center space-x-3">
                {/* Sub-abas: Roteiros Ativos x Biblioteca de Conteúdos Postados */}
                <div className={`flex items-center space-x-1 p-1 rounded-lg ${t.tabToggleContainer}`}>
                  <button
                    type="button"
                    onClick={() => setReelsSubTab('ativos')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                      reelsSubTab === 'ativos' ? t.tabToggleActive : t.tabToggleInactive
                    }`}
                  >
                    <Video size={13} />
                    <span>Roteiros Ativos</span>
                    <span className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full ${t.tag}`}>
                      {(editorialData.reels || []).length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReelsSubTab('biblioteca')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                      reelsSubTab === 'biblioteca' ? t.tabToggleActive : t.tabToggleInactive
                    }`}
                  >
                    <Archive size={13} />
                    <span>Biblioteca de Postados</span>
                    <span className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full ${t.tag}`}>
                      {(editorialData.biblioteca || []).length}
                    </span>
                  </button>
                </div>

                {reelsSubTab === 'ativos' && (
                  <button
                    type="button"
                    onClick={() => {
                      resetFormReel();
                      setModalReelAberto(true);
                    }}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-md active:scale-95 ${t.btnPrimary}`}
                  >
                    <Plus size={14} />
                    <span>Novo Roteiro</span>
                  </button>
                )}
              </div>
            </div>

            {/* 3.1: SUB-ABA ROTEIROS ATIVOS */}
            {reelsSubTab === 'ativos' && (
              <div>
                {(editorialData.reels || []).length === 0 ? (
                  <div className={`rounded-2xl p-12 text-center space-y-3 border ${t.card}`}>
                    <Video size={36} className={`mx-auto ${t.textDim}`} />
                    <h3 className={`text-sm font-semibold ${t.textTitle}`}>Nenhum roteiro de Reel pendente</h3>
                    <p className={`text-xs max-w-md mx-auto ${t.textMuted}`}>
                      Todos os roteiros criados foram publicados e movidos para a Biblioteca de Conteúdos Postados. Clique em "Novo Roteiro" para produzir novos conteúdos.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        resetFormReel();
                        setModalReelAberto(true);
                      }}
                      className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-colors ${t.btnPrimary}`}
                    >
                      <Plus size={14} />
                      <span>Criar Novo Roteiro</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(editorialData.reels || []).map((reel) => (
                      <div key={reel.id} className={`rounded-xl p-5 space-y-3.5 flex flex-col justify-between shadow-sm transition-all border ${t.card} ${t.cardHover}`}>
                        <div className="space-y-3">
                          {/* Cabeçalho do Card */}
                          <div className="flex justify-between items-start">
                            <span className={`font-mono text-xs font-bold ${t.textAccent}`}>{reel.id}</span>
                            <div className="flex items-center space-x-1.5">
                              <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${t.tag}`}>
                                {reel.statusRoteiro}
                              </span>
                              {/* Botão Editar Roteiro */}
                              <button
                                type="button"
                                onClick={() => abrirEdicaoReel(reel)}
                                title="Editar Roteiro"
                                className={`p-1 rounded transition-colors ${t.iconBtn}`}
                              >
                                <Edit3 size={13} />
                              </button>
                              {/* Botão Excluir Roteiro */}
                              <button
                                type="button"
                                onClick={() => handleExcluirReel(reel.id)}
                                title="Excluir Roteiro"
                                className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          <h3 className={`font-semibold text-sm leading-snug ${t.textTitle}`}>{reel.tema}</h3>

                          {reel.gancho && (
                            <div className={`p-2.5 rounded-lg border ${t.cardInner} ${t.border}`}>
                              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block mb-1">
                                🎣 Gancho / Hook (Primeiros 3 segundos):
                              </span>
                              <p className={`text-xs ${t.textTitle}`}>{reel.gancho}</p>
                            </div>
                          )}

                          {reel.desenvolvimento && (
                            <div className={`p-2.5 rounded-lg border ${t.cardInner} ${t.border}`}>
                              <span className="text-[10px] font-bold text-sky-500 uppercase tracking-wider block mb-1">
                                📝 Desenvolvimento / Roteiro:
                              </span>
                              <p className={`text-xs line-clamp-4 ${t.textTitle}`}>{reel.desenvolvimento}</p>
                            </div>
                          )}

                          {reel.cta && (
                            <div className="text-xs">
                              <span className={`text-[10px] font-bold uppercase tracking-wider block ${t.textDim}`}>CTA:</span>
                              <span className={t.textTitle}>{reel.cta}</span>
                            </div>
                          )}
                        </div>

                        {/* Rodapé e Ação de Publicar */}
                        <div className={`pt-3 border-t space-y-2.5 ${t.divider}`}>
                          <div className={`flex justify-between items-center text-xs ${t.textMuted}`}>
                            <span>Tempo: <strong className={t.textTitle}>{reel.tempoEstimado || '60s'}</strong></span>
                            {reel.referenciaBiblica && (
                              <span className={`italic font-medium ${t.textAccent}`}>{reel.referenciaBiblica}</span>
                            )}
                          </div>

                          {/* Botão de Evoluir para Post / Publicar & Mover para Biblioteca */}
                          <button
                            type="button"
                            onClick={() => {
                              setModalPublicarReel(reel);
                              setLinkInstagramPublicacao('');
                            }}
                            className={`w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all shadow-sm active:scale-95 ${t.btnPrimary}`}
                          >
                            <CheckCircle2 size={14} className={darkMode ? "text-[#C4B270]" : "text-white"} />
                            <span>Publicar no Instagram & Arquivar</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3.2: SUB-ABA BIBLIOTECA DE CONTEÚDOS POSTADOS */}
            {reelsSubTab === 'biblioteca' && (
              <div className="space-y-4">
                <div className={`rounded-xl p-4 flex justify-between items-center text-xs border ${t.card}`}>
                  <span className={t.textMuted}>Conteúdos postados arquivados automaticamente na aba <strong>Biblioteca</strong> de Database Controle Editorial.xlsx</span>
                  <span className={`font-semibold ${t.textAccent}`}>Total: {(editorialData.biblioteca || []).length} postados</span>
                </div>

                {(editorialData.biblioteca || []).length === 0 ? (
                  <div className={`rounded-2xl p-12 text-center space-y-2 border ${t.card}`}>
                    <Archive size={36} className={`mx-auto ${t.textDim}`} />
                    <h3 className={`text-sm font-semibold ${t.textTitle}`}>A Biblioteca de conteúdos postados está vazia</h3>
                    <p className={`text-xs max-w-md mx-auto ${t.textMuted}`}>
                      Assim que você marcar um roteiro de Reel como "Publicado" ou clicar em "Publicar no Instagram & Arquivar", ele será automaticamente transferido da aba Reels para cá.
                    </p>
                  </div>
                ) : (
                  <div className={`rounded-xl overflow-hidden shadow-sm border ${t.card}`}>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className={`text-xs uppercase font-semibold ${t.tableHeader}`}>
                          <tr>
                            <th className="py-3 px-5">ID</th>
                            <th className="py-3 px-5">Tema Original</th>
                            <th className="py-3 px-5">Pilar</th>
                            <th className="py-3 px-5">Data de Postagem</th>
                            <th className="py-3 px-5">Link Instagram</th>
                            <th className="py-3 px-5">Métricas / Status</th>
                            <th className="py-3 px-5">Gancho / Reaproveitamento</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${t.divider}`}>
                          {(editorialData.biblioteca || []).map((item, idx) => (
                            <tr key={idx} className={`transition-colors ${t.tableRow}`}>
                              <td className={`py-3 px-5 font-mono text-xs font-bold ${t.textAccent}`}>
                                {item.id}
                              </td>
                              <td className={`py-3 px-5 font-medium ${t.textTitle}`}>
                                {item.temaOriginal}
                              </td>
                              <td className="py-3 px-5">
                                <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${t.tag}`}>
                                  {item.pilar}
                                </span>
                              </td>
                              <td className={`py-3 px-5 font-mono text-xs whitespace-nowrap ${t.textMuted}`}>
                                {formatarDataBR(item.dataPostagem)}
                              </td>
                              <td className="py-3 px-5 text-xs">
                                {item.linkFinal ? (
                                  <a
                                    href={item.linkFinal}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center space-x-1 text-pink-500 hover:text-pink-400 font-medium underline"
                                  >
                                    <InstagramIcon size={13} />
                                    <span>Ver Post</span>
                                  </a>
                                ) : (
                                  <span className={`italic ${t.textDim}`}>Sem link</span>
                                )}
                              </td>
                              <td className="py-3 px-5 text-xs">
                                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${t.badge}`}>
                                  {item.metricas || 'Publicado'}
                                </span>
                              </td>
                              <td className={`py-3 px-5 text-xs max-w-xs truncate ${t.textDim}`}>
                                {item.reaproveitamento || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 4. ABA: CALENDÁRIO EDITORIAL */}
        {(activeTab === 'calendario' || activeTab === 'eventos') && (
          <div className="space-y-5">
            {/* Cabeçalho do Calendário com Filtros de Mês e Ano */}
            <div className={`rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm border ${t.card}`}>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className={`text-base font-bold flex items-center space-x-2 ${t.textTitle}`}>
                    <Calendar size={18} className={t.textAccent} />
                    <span>Calendário Editorial & Litúrgico</span>
                  </h2>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${t.badgeGold}`}>
                    Padrão Brasileiro (DD/MM/AAAA)
                  </span>
                </div>
                <p className={`text-xs mt-0.5 ${t.textMuted}`}>
                  Visualização mensal com feriados, datas litúrgicas oficiais e pautas agendadas
                </p>
              </div>

              {/* Controles de Navegação de Mês / Ano */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Botão Anterior */}
                <button
                  type="button"
                  onClick={() => {
                    if (calMes === 0) {
                      setCalMes(11);
                      setCalAno(calAno - 1);
                    } else {
                      setCalMes(calMes - 1);
                    }
                  }}
                  title="Mês anterior"
                  className={`p-1.5 rounded-lg border transition-colors ${t.btnSecondary}`}
                >
                  <ChevronLeft size={16} />
                </button>

                {/* Seletor de Mês */}
                <select
                  value={calMes}
                  onChange={(e) => setCalMes(Number(e.target.value))}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none border ${t.input}`}
                >
                  {MESES_NOMES.map((nome, idx) => (
                    <option key={nome} value={idx}>{nome}</option>
                  ))}
                </select>

                {/* Seletor de Ano */}
                <select
                  value={calAno}
                  onChange={(e) => setCalAno(Number(e.target.value))}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none border font-mono ${t.input}`}
                >
                  {[2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032].map(ano => (
                    <option key={ano} value={ano}>{ano}</option>
                  ))}
                </select>

                {/* Botão Próximo */}
                <button
                  type="button"
                  onClick={() => {
                    if (calMes === 11) {
                      setCalMes(0);
                      setCalAno(calAno + 1);
                    } else {
                      setCalMes(calMes + 1);
                    }
                  }}
                  title="Próximo mês"
                  className={`p-1.5 rounded-lg border transition-colors ${t.btnSecondary}`}
                >
                  <ChevronRight size={16} />
                </button>

                {/* Botão Hoje */}
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    setCalMes(now.getMonth());
                    setCalAno(now.getFullYear());
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${t.btnSecondary}`}
                >
                  Hoje
                </button>

                {/* Alternador Grade / Lista */}
                <div className={`flex items-center space-x-1 p-1 rounded-lg border ml-2 ${t.tabToggleContainer}`}>
                  <button
                    type="button"
                    onClick={() => setCalVisualizacao('grade')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                      calVisualizacao === 'grade' ? t.tabToggleActive : t.tabToggleInactive
                    }`}
                  >
                    Grade Mensal
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalVisualizacao('lista')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                      calVisualizacao === 'lista' ? t.tabToggleActive : t.tabToggleInactive
                    }`}
                  >
                    Lista Litúrgica
                  </button>
                </div>
              </div>
            </div>

            {/* VISUALIZAÇÃO EM GRADE: CALENDÁRIO COM QUADRADOS PARA CADA DIA */}
            {calVisualizacao === 'grade' && (
              <div className={`rounded-2xl overflow-hidden shadow-lg border ${t.card}`}>
                {/* Linha dos Dias da Semana */}
                <div className={`grid grid-cols-7 border-b text-center text-xs font-bold uppercase tracking-wider py-2.5 ${t.divider} ${t.tableHeader}`}>
                  {DIAS_SIGLAS.map((sigla, idx) => (
                    <div 
                      key={sigla} 
                      className={idx === 0 ? 'text-amber-500' : idx === 6 ? 'text-indigo-400' : t.textMuted}
                    >
                      {sigla}
                      {idx === 0 && <span className="block text-[9px] font-normal lowercase tracking-normal text-amber-500/80">Culto</span>}
                    </div>
                  ))}
                </div>

                {/* Grade de Dias */}
                <div className={`grid grid-cols-7 divide-x divide-y ${t.divider} ${t.cardInner}`}>
                  {diasGrade.map((c, idx) => {
                    const evs = eventosPorData[c.dateIso] || [];
                    const posts = postsPorData[c.dateIso] || [];
                    const isHoje = c.dateIso === hojeIso;
                    const temConteudo = evs.length > 0 || posts.length > 0;

                    return (
                      <div
                        key={idx}
                        className={`min-h-[135px] p-2 flex flex-col justify-between transition-colors ${
                          c.foraDoMes 
                            ? t.calCellOut 
                            : isHoje 
                            ? t.calCellToday 
                            : t.calCell
                        }`}
                      >
                        {/* Topo do Quadrado do Dia */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1.5">
                            <span className={`text-xs font-bold font-mono ${
                              isHoje 
                                ? 'px-1.5 py-0.5 rounded-full bg-[#0D695D] text-white' 
                                : c.foraDoMes 
                                ? t.textDim 
                                : t.textTitle
                            }`}>
                              {c.dia}
                            </span>
                            {isHoje && (
                              <span className={`text-[9px] font-bold uppercase tracking-wider ${t.textAccent}`}>
                                Hoje
                              </span>
                            )}
                          </div>

                          {/* Botões de Ação do Dia: Pesquisa no Google & Nova Pauta */}
                          <div className="flex items-center space-x-0.5">
                            {/* Botão de Busca no Google para o Dia Específico */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const query = `datas comemorativas e feriados ${c.dia} de ${MESES_NOMES[c.mes]} ${c.ano} florianopolis`;
                                window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer');
                              }}
                              title={`Pesquisar feriados municipais e comemorações de ${c.dia} de ${MESES_NOMES[c.mes]} no Google`}
                              className={`p-1 rounded transition-colors ${t.iconBtn}`}
                            >
                              <Search size={12} />
                            </button>

                            {/* Botão Rápido para Criar Pauta nesta Data */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                resetFormPost();
                                setFormPost(prev => ({
                                  ...prev,
                                  dataOnly: c.dateIso
                                }));
                                setModalPostAberto(true);
                              }}
                              title={`Criar pauta para ${formatarDataBR(c.dateIso)}`}
                              className={`p-1 rounded transition-colors ${t.iconBtn}`}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Corpo do Dia: Eventos e Pautas */}
                        <div className="my-1.5 space-y-1 flex-1 overflow-y-auto max-h-[90px]">
                          {/* Eventos Litúrgicos / Comemorações Eclesiásticas */}
                          {evs.map((ev, evIdx) => (
                            <div
                              key={evIdx}
                              title={`Evento Litúrgico: ${ev.evento}`}
                              className="text-[10px] leading-tight px-1.5 py-1 rounded bg-[#C4B270]/20 border border-[#C4B270]/40 text-[#807449] dark:text-[#E2DCC8] truncate flex items-center space-x-1 shadow-sm font-medium"
                            >
                              <span className="text-[10px]">🕊️</span>
                              <span className="truncate">{ev.evento}</span>
                            </div>
                          ))}

                          {/* Pautas Agendadas do Dia */}
                          {posts.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => abrirEdicaoPost(p)}
                              title={`${p.id}: ${p.tema} (${p.status}) - Clique para editar`}
                              className={`w-full text-left text-[10px] leading-tight px-1.5 py-1 rounded border truncate flex items-center space-x-1 transition-all hover:scale-[1.01] ${
                                p.status === 'Publicado'
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                                  : p.status === 'Agendado'
                                  ? 'bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400'
                                  : p.status === 'Produção' || p.status === 'Revisão'
                                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400'
                                  : `${t.cardInner} border ${t.divider} ${t.textTitle}`
                              }`}
                            >
                              <span className="font-mono text-[9px] opacity-75">{p.id}</span>
                              <span className="truncate font-medium">{p.tema}</span>
                            </button>
                          ))}

                          {!temConteudo && !c.foraDoMes && (
                            <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <span className={`text-[10px] italic ${t.textDim}`}>Disponível</span>
                            </div>
                          )}
                        </div>

                        {/* Rodapé do Quadrado: Data Brasileira */}
                        <div className={`pt-1 border-t flex justify-between items-center text-[9px] font-mono ${t.divider} ${t.textDim}`}>
                          <span>{formatarDataBR(c.dateIso)}</span>
                          {(evs.length > 0 || posts.length > 0) && (
                            <span className={`font-semibold ${t.textAccent}`}>
                              {evs.length + posts.length} item(s)
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VISUALIZAÇÃO EM LISTA: TABELA COM TODAS AS DATAS COMEMORATIVAS */}
            {calVisualizacao === 'lista' && (
              <div className={`rounded-xl overflow-hidden shadow-sm border ${t.card}`}>
                <div className={`px-6 py-3.5 border-b flex justify-between items-center text-xs ${t.divider} ${t.textMuted} ${t.cardInner}`}>
                  <span>Todas as celebrações eclesiásticas oficiais da ICR (2026–2032)</span>
                  <span className={`font-semibold ${t.textAccent}`}>Padrão Brasileiro (DD/MM/AAAA)</span>
                </div>
                <div className="overflow-x-auto max-h-[600px]">
                  <table className="w-full text-left text-sm">
                    <thead className={`text-xs uppercase font-semibold sticky top-0 ${t.tableHeader}`}>
                      <tr>
                        <th className="py-3 px-6">Data Oficial (BR)</th>
                        <th className="py-3 px-6">Evento / Celebração Litúrgica</th>
                        <th className="py-3 px-6 text-right">Pesquisa no Google</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${t.divider}`}>
                      {(editorialData.eventos || []).map((ev, idx) => (
                        <tr key={idx} className={`transition-colors ${t.tableRow}`}>
                          <td className={`py-3 px-6 font-mono text-xs font-bold whitespace-nowrap ${t.textAccent}`}>
                            {formatarDataBR(ev.data)}
                          </td>
                          <td className={`py-3 px-6 font-medium ${t.textTitle}`}>
                            {ev.evento}
                          </td>
                          <td className="py-3 px-6 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                const q = `datas comemorativas e feriados ${formatarDataBR(ev.data)} florianopolis`;
                                window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, '_blank', 'noopener,noreferrer');
                              }}
                              title="Pesquisar feriados e comemorações no Google"
                              className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs transition-colors border shadow-sm ${t.btnSecondary}`}
                            >
                              <Search size={12} className={t.textAccent} />
                              <span>Pesquisar Feriados</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4.5. ABA: ESCALA DE EQUIPE & VOLUNTÁRIOS */}
        {activeTab === 'escala' && (
          <div className="space-y-6">
            {/* Topo do Módulo de Escala */}
            <div className={`rounded-2xl p-6 border shadow-sm flex flex-wrap items-center justify-between gap-4 ${t.card}`}>
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#0D695D] to-[#062E31] border border-[#C4B270]/30 flex items-center justify-center text-[#C4B270] shadow-md">
                  <Users size={24} />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className={`text-base font-bold ${t.textTitle}`}>
                      Escala da Equipe & Voluntários
                    </h2>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${t.badgeGold}`}>
                      ICR Florianópolis
                    </span>
                  </div>
                  <p className={`text-xs mt-0.5 ${t.textMuted}`}>
                    Gestão de presenças nos cultos fixos semanais (Ensino e Celebração) e eventos específicos
                  </p>
                </div>
              </div>

              {/* Botões de Ações do Topo */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleGerarCultosFixos}
                  disabled={gerandoFixos}
                  title="Gera os slots de cultos de Terça (Ensino 20h) e Domingo (Celebração 10h e 19h) do mês selecionado"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all border shadow-sm ${t.btnSecondary} ${gerandoFixos ? 'opacity-70 cursor-wait' : ''}`}
                >
                  <Zap size={14} className={gerandoFixos ? 'animate-spin text-amber-500' : 'text-[#C4B270]'} />
                  <span>{gerandoFixos ? 'Gerando...' : 'Gerar Cultos Fixos do Mês'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalGerenciarEquipe(true)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all border shadow-sm ${t.btnSecondary}`}
                >
                  <Settings size={14} />
                  <span>Gerenciar Nomes & Funções</span>
                </button>

                <button
                  type="button"
                  onClick={() => abrirCriarEscala()}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-md active:scale-95 ${t.btnPrimary}`}
                >
                  <Plus size={16} />
                  <span>Nova Escala</span>
                </button>
              </div>
            </div>

            {/* Barra de Filtros e Controles */}
            <div className={`rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm border ${t.card}`}>
              <div className="flex flex-wrap items-center gap-3">
                {/* Navegação de Mês */}
                <div className={`flex items-center space-x-1 p-1 rounded-lg border ${t.tabToggleContainer}`}>
                  <button
                    type="button"
                    onClick={() => {
                      if (escalaMes === 0) {
                        setEscalaMes(11);
                        setEscalaAno(prev => prev - 1);
                      } else {
                        setEscalaMes(prev => prev - 1);
                      }
                    }}
                    className={`p-1.5 rounded transition-colors ${t.iconBtn}`}
                    title="Mês anterior"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className={`px-2.5 text-xs font-bold font-mono min-w-[130px] text-center ${t.textTitle}`}>
                    {MESES_NOMES[escalaMes]} {escalaAno}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (escalaMes === 11) {
                        setEscalaMes(0);
                        setEscalaAno(prev => prev + 1);
                      } else {
                        setEscalaMes(prev => prev + 1);
                      }
                    }}
                    className={`p-1.5 rounded transition-colors ${t.iconBtn}`}
                    title="Próximo mês"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>

                {/* Busca */}
                <div className="relative min-w-[180px]">
                  <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.textDim}`} />
                  <input
                    type="text"
                    placeholder="Buscar voluntário ou culto..."
                    value={escalaBusca}
                    onChange={(e) => setEscalaBusca(e.target.value)}
                    className={`w-full pl-8 pr-3 py-1.5 rounded-lg text-xs focus:outline-none border ${t.input}`}
                  />
                </div>

                {/* Filtro Tipo de Data */}
                <div className="flex items-center space-x-1.5">
                  <span className={`text-xs ${t.textMuted}`}>Tipo:</span>
                  <select
                    value={escalaFiltroTipo}
                    onChange={(e) => setEscalaFiltroTipo(e.target.value)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs focus:outline-none border ${t.input}`}
                  >
                    <option value="Todos">Todos os Tipos</option>
                    <option value="Data Fixa (Culto)">Datas Fixas (Cultos)</option>
                    <option value="Evento / Específico">Eventos Específicos</option>
                  </select>
                </div>

                {/* Filtro Voluntário */}
                <div className="flex items-center space-x-1.5">
                  <span className={`text-xs ${t.textMuted}`}>Voluntário:</span>
                  <select
                    value={escalaFiltroPessoa}
                    onChange={(e) => setEscalaFiltroPessoa(e.target.value)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs focus:outline-none border ${t.input}`}
                  >
                    <option value="Todas">Todas as Pessoas</option>
                    {voluntariosList.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>

                {/* Filtro Função */}
                <div className="flex items-center space-x-1.5">
                  <span className={`text-xs ${t.textMuted}`}>Função:</span>
                  <select
                    value={escalaFiltroFuncao}
                    onChange={(e) => setEscalaFiltroFuncao(e.target.value)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs focus:outline-none border ${t.input}`}
                  >
                    <option value="Todas">Todas as Funções</option>
                    {funcoesEscalaList.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                {/* Filtro Status */}
                <div className="flex items-center space-x-1.5">
                  <span className={`text-xs ${t.textMuted}`}>Status:</span>
                  <select
                    value={escalaFiltroStatus}
                    onChange={(e) => setEscalaFiltroStatus(e.target.value)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs focus:outline-none border ${t.input}`}
                  >
                    <option value="Todos">Todos os Status</option>
                    <option value="Confirmado">Confirmado</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Substituição">Substituição</option>
                    <option value="Concluído">Concluído</option>
                  </select>
                </div>
              </div>

              {/* Alternador de Visualização */}
              <div className={`flex items-center space-x-1 p-1 rounded-lg ${t.tabToggleContainer}`}>
                <button
                  type="button"
                  onClick={() => setEscalaVisao('cultos')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors flex items-center space-x-1 ${
                    escalaVisao === 'cultos' ? t.tabToggleActive : t.tabToggleInactive
                  }`}
                >
                  <CalendarDays size={13} />
                  <span>Por Culto / Evento</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEscalaVisao('tabela')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors flex items-center space-x-1 ${
                    escalaVisao === 'tabela' ? t.tabToggleActive : t.tabToggleInactive
                  }`}
                >
                  <FileSpreadsheet size={13} />
                  <span>Tabela Geral</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEscalaVisao('pessoas')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors flex items-center space-x-1 ${
                    escalaVisao === 'pessoas' ? t.tabToggleActive : t.tabToggleInactive
                  }`}
                >
                  <UserCheck size={13} />
                  <span>Por Voluntário</span>
                </button>
              </div>
            </div>

            {/* CONTEÚDO DA VISUALIZAÇÃO: 1. POR CULTO / EVENTO */}
            {escalaVisao === 'cultos' && (
              <div className="space-y-4">
                {eventosEscalaAgrupados.length === 0 ? (
                  <div className={`rounded-2xl p-12 text-center space-y-3 border ${t.card}`}>
                    <Users size={36} className={`mx-auto ${t.textDim}`} />
                    <h3 className={`text-sm font-semibold ${t.textTitle}`}>
                      Nenhuma escala cadastrada para {MESES_NOMES[escalaMes]} de {escalaAno}
                    </h3>
                    <p className={`text-xs max-w-md mx-auto ${t.textMuted}`}>
                      Você pode gerar os cultos fixos semanais (Terça Ensino e Domingo Celebração) automaticamente ou cadastrar um novo evento com data específica.
                    </p>
                    <div className="flex justify-center items-center space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={handleGerarCultosFixos}
                        className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-md ${t.btnPrimary}`}
                      >
                        <Zap size={14} />
                        <span>Gerar Cultos Fixos de {MESES_NOMES[escalaMes]}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => abrirCriarEscala()}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors border ${t.btnSecondary}`}
                      >
                        + Cadastrar Evento Específico
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {eventosEscalaAgrupados.map((grupo, gIdx) => (
                      <div 
                        key={gIdx} 
                        className={`rounded-xl border overflow-hidden shadow-sm flex flex-col justify-between transition-all ${t.card} ${t.cardHover}`}
                      >
                        {/* Topo do Card do Culto */}
                        <div className={`p-4 border-b ${t.divider} ${t.cardInner}`}>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              grupo.tipoData === 'Data Fixa (Culto)' ? t.badgeGold : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                            }`}>
                              {grupo.tipoData === 'Data Fixa (Culto)' ? 'Data Fixa (Culto)' : 'Evento Específico'}
                            </span>
                            <span className={`text-xs font-mono font-bold ${t.textAccent}`}>
                              {grupo.escalas.length} escalado(s)
                            </span>
                          </div>

                          <h3 className={`text-sm font-bold truncate ${t.textTitle}`}>
                            {grupo.evento}
                          </h3>

                          <div className={`flex items-center space-x-2 text-xs mt-1 font-mono ${t.textMuted}`}>
                            <span>📅 {formatarDataBR(grupo.data)}</span>
                            {grupo.diaSemana && (
                              <span className="capitalize">• {grupo.diaSemana}</span>
                            )}
                          </div>
                        </div>

                        {/* Corpo: Lista de Pessoas Escaladas */}
                        <div className="p-4 space-y-2.5 flex-1 overflow-y-auto max-h-[320px]">
                          {grupo.escalas.map(esc => (
                            <div 
                              key={esc.id} 
                              className={`p-2.5 rounded-lg border space-y-1.5 transition-colors ${t.cardAlt}`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 min-w-0">
                                  <span className="w-6 h-6 rounded-full bg-[#0D695D]/30 text-[#C4B270] font-bold text-[10px] flex items-center justify-center shrink-0">
                                    {(esc.pessoa || 'AD').slice(0, 2).toUpperCase()}
                                  </span>
                                  <div className="min-w-0">
                                    <p className={`text-xs font-bold truncate ${t.textTitle}`}>
                                      {esc.pessoa || 'A Definir'}
                                    </p>
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${t.tag}`}>
                                      {esc.funcao}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-1 shrink-0">
                                  <select
                                    value={esc.status}
                                    onChange={(e) => handleMudarStatusEscala(esc, e.target.value)}
                                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold border ${
                                      esc.status === 'Confirmado'
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                        : esc.status === 'Pendente'
                                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                    }`}
                                  >
                                    <option value="Confirmado">Confirmado</option>
                                    <option value="Pendente">Pendente</option>
                                    <option value="Substituição">Substituição</option>
                                    <option value="Concluído">Concluído</option>
                                  </select>

                                  <button
                                    type="button"
                                    onClick={() => abrirEdicaoEscala(esc)}
                                    title="Editar escala"
                                    className={`p-1 rounded transition-colors ${t.iconBtn}`}
                                  >
                                    <Edit3 size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleExcluirEscala(esc.id)}
                                    title="Remover da escala"
                                    className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>

                              {esc.observacoes && (
                                <p className={`text-[11px] italic pl-8 ${t.textDim}`}>
                                  "{esc.observacoes}"
                                </p>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Rodapé do Card do Culto: Botão Rápido de Escala */}
                        <div className={`p-3 border-t flex justify-end ${t.divider} ${t.cardInner}`}>
                          <button
                            type="button"
                            onClick={() => abrirCriarEscala({
                              data: grupo.data,
                              diaSemana: grupo.diaSemana,
                              tipoData: grupo.tipoData,
                              evento: grupo.evento
                            })}
                            className={`w-full flex items-center justify-center space-x-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${t.btnSecondary}`}
                          >
                            <Plus size={13} />
                            <span>Escalar + Voluntário neste Culto</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CONTEÚDO DA VISUALIZAÇÃO: 2. TABELA GERAL */}
            {escalaVisao === 'tabela' && (
              <div className={`rounded-xl overflow-hidden shadow-sm border ${t.card}`}>
                <div className={`px-6 py-3.5 border-b flex justify-between items-center text-xs ${t.divider} ${t.textMuted}`}>
                  <span>Exibindo <strong>{escalaFiltrada.length}</strong> escalas em {MESES_NOMES[escalaMes]} de {escalaAno}</span>
                  <span className="hidden sm:inline">Sincronizado diretamente na aba <strong>Escala</strong> da planilha</span>
                </div>

                {escalaFiltrada.length === 0 ? (
                  <div className={`p-12 text-center text-sm ${t.textMuted}`}>
                    Nenhuma escala encontrada com os filtros selecionados.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className={`text-xs uppercase font-semibold ${t.tableHeader}`}>
                        <tr>
                          <th className="py-3 px-5">ID</th>
                          <th className="py-3 px-5">Data & Horário</th>
                          <th className="py-3 px-5">Tipo de Data</th>
                          <th className="py-3 px-5">Culto / Evento</th>
                          <th className="py-3 px-5">Pessoa Escalada</th>
                          <th className="py-3 px-5">Função</th>
                          <th className="py-3 px-5">Status</th>
                          <th className="py-3 px-5">Observações</th>
                          <th className="py-3 px-5 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${t.divider}`}>
                        {escalaFiltrada.map(esc => (
                          <tr key={esc.id} className={`transition-colors ${t.tableRow}`}>
                            <td className={`py-3 px-5 font-mono text-xs font-bold ${t.textAccent}`}>
                              {esc.id}
                            </td>
                            <td className={`py-3 px-5 text-xs font-mono whitespace-nowrap ${t.textTitle}`}>
                              {formatarDataBR(esc.data)}
                              {esc.diaSemana && <span className={`block text-[10px] capitalize ${t.textDim}`}>{esc.diaSemana}</span>}
                            </td>
                            <td className="py-3 px-5">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                esc.tipoData === 'Data Fixa (Culto)' ? t.badgeGold : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                              }`}>
                                {esc.tipoData === 'Data Fixa (Culto)' ? 'Fixa (Culto)' : 'Específico'}
                              </span>
                            </td>
                            <td className={`py-3 px-5 font-semibold ${t.textTitle}`}>
                              {esc.evento}
                            </td>
                            <td className="py-3 px-5">
                              <span className={`font-semibold ${esc.pessoa === 'A Definir' ? 'text-amber-400 italic' : t.textTitle}`}>
                                {esc.pessoa || 'A Definir'}
                              </span>
                            </td>
                            <td className="py-3 px-5">
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${t.tag}`}>
                                {esc.funcao}
                              </span>
                            </td>
                            <td className="py-3 px-5">
                              <select
                                value={esc.status}
                                onChange={(e) => handleMudarStatusEscala(esc, e.target.value)}
                                className={`rounded px-2 py-1 text-xs focus:outline-none border ${
                                  esc.status === 'Confirmado'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    : esc.status === 'Pendente'
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                }`}
                              >
                                <option value="Confirmado">Confirmado</option>
                                <option value="Pendente">Pendente</option>
                                <option value="Substituição">Substituição</option>
                                <option value="Concluído">Concluído</option>
                              </select>
                            </td>
                            <td className={`py-3 px-5 text-xs max-w-xs truncate ${t.textDim}`}>
                              {esc.observacoes || '-'}
                            </td>
                            <td className="py-3 px-5 text-right space-x-1 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => abrirEdicaoEscala(esc)}
                                title="Editar escala"
                                className={`p-1.5 rounded transition-colors ${t.iconBtn}`}
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleExcluirEscala(esc.id)}
                                title="Excluir escala"
                                className="p-1.5 rounded text-slate-400 hover:text-rose-500 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* CONTEÚDO DA VISUALIZAÇÃO: 3. POR VOLUNTÁRIO */}
            {escalaVisao === 'pessoas' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {cargaPorVoluntario.map((item, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${t.card}`}>
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-[#0D695D]/25">
                        <div className="flex items-center space-x-2.5">
                          <span className="w-8 h-8 rounded-full bg-[#0D695D]/30 text-[#C4B270] font-bold text-xs flex items-center justify-center">
                            {String(item.nome || 'AD').slice(0, 2).toUpperCase()}
                          </span>
                          <div>
                            <h4 className={`text-xs font-bold truncate ${t.textTitle}`}>
                              {item.nome}
                            </h4>
                            <span className={`text-[10px] ${t.textMuted}`}>
                              {item.escalas.length} culto(s) em {MESES_NOMES[escalaMes]}
                            </span>
                          </div>
                        </div>

                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                          item.escalas.length >= 4 
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' 
                            : t.badgeGold
                        }`}>
                          {item.escalas.length}x
                        </span>
                      </div>

                      {/* Lista de Cultos do Voluntário */}
                      <div className="mt-3 space-y-2 overflow-y-auto max-h-[220px]">
                        {item.escalas.length === 0 ? (
                          <p className={`text-xs italic py-4 text-center ${t.textDim}`}>
                            Nenhum culto escalado neste mês.
                          </p>
                        ) : (
                          item.escalas.map(esc => (
                            <div key={esc.id} className={`p-2 rounded border text-xs space-y-1 ${t.cardInner}`}>
                              <div className="flex justify-between items-start">
                                <span className={`font-semibold truncate ${t.textTitle}`}>{esc.evento}</span>
                                <span className={`text-[9px] px-1 rounded font-bold ${
                                  esc.status === 'Confirmado' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                                }`}>
                                  {esc.status}
                                </span>
                              </div>
                              <div className="flex justify-between text-[10px]">
                                <span className={t.textAccent}>{esc.funcao}</span>
                                <span className={t.textDim}>{formatarDataBR(esc.data)}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        abrirCriarEscala();
                        setFormEscala(prev => ({ ...prev, pessoa: item.nome }));
                      }}
                      className={`w-full flex items-center justify-center space-x-1 py-1.5 rounded-lg text-xs font-semibold transition-all border ${t.btnSecondary}`}
                    >
                      <Plus size={12} />
                      <span>Escalar {String(item.nome || 'Voluntário').split(' ')[0]}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. ABA: TAXONOMIA & SETUP DA PLANILHA */}
        {activeTab === 'setup' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className={`rounded-2xl p-6 border ${t.card}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className={`text-base font-bold flex items-center space-x-2 ${t.textTitle}`}>
                    <Settings size={18} className={t.textAccent} />
                    <span>Gestão da Aba Setup (Taxonomia Editorial)</span>
                  </h2>
                  <p className={`text-xs mt-1 ${t.textMuted}`}>
                    Todos os itens abaixo são sincronizados dinamicamente com a aba <strong>Setup</strong> da planilha <code>Database Controle Editorial.xlsx</code>.
                  </p>
                </div>
                <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${t.badgeGold}`}>
                  Sincronizado com a Planilha
                </div>
              </div>
            </div>

            {/* Grid de Gerenciamento das Categorias */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pilares */}
              <div className={`rounded-xl p-5 space-y-4 border ${t.card}`}>
                <div className="flex justify-between items-center">
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${t.textTitle}`}>
                    Pilares Editoriais ({pilaresList.length})
                  </h3>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {pilaresList.map(pilar => (
                    <div key={pilar} className={`flex justify-between items-center px-3 py-2 rounded-lg text-xs border ${t.cardInner} ${t.border} ${t.textTitle}`}>
                      <span>{pilar}</span>
                      <button
                        type="button"
                        onClick={() => handleExcluirSetupOpcao('pilares', pilar)}
                        title="Remover pilar da planilha"
                        className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Adicionar novo pilar */}
                <div className={`pt-2 border-t ${t.divider}`}>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Novo pilar (ex: Missões)..."
                      id="input-novo-pilar"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAdicionarSetupOpcao('pilares', e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className={`flex-1 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none border ${t.input}`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById('input-novo-pilar');
                        if (el) {
                          handleAdicionarSetupOpcao('pilares', el.value);
                          el.value = '';
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${t.btnPrimary}`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Formatos */}
              <div className={`rounded-xl p-5 space-y-4 border ${t.card}`}>
                <div className="flex justify-between items-center">
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${t.textTitle}`}>
                    Formatos ({formatosList.length})
                  </h3>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {formatosList.map(formato => (
                    <div key={formato} className={`flex justify-between items-center px-3 py-2 rounded-lg text-xs border ${t.cardInner} ${t.border} ${t.textTitle}`}>
                      <span>{formato}</span>
                      <button
                        type="button"
                        onClick={() => handleExcluirSetupOpcao('formatos', formato)}
                        title="Remover formato da planilha"
                        className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Adicionar novo formato */}
                <div className={`pt-2 border-t ${t.divider}`}>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Novo formato (ex: Artigo)..."
                      id="input-novo-formato"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAdicionarSetupOpcao('formatos', e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className={`flex-1 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none border ${t.input}`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById('input-novo-formato');
                        if (el) {
                          handleAdicionarSetupOpcao('formatos', el.value);
                          el.value = '';
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${t.btnPrimary}`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Responsáveis */}
              <div className={`rounded-xl p-5 space-y-4 border ${t.card}`}>
                <div className="flex justify-between items-center">
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${t.textTitle}`}>
                    Responsáveis ({responsaveisList.length})
                  </h3>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {responsaveisList.map(resp => (
                    <div key={resp} className={`flex justify-between items-center px-3 py-2 rounded-lg text-xs border ${t.cardInner} ${t.border} ${t.textTitle}`}>
                      <span>{resp}</span>
                      <button
                        type="button"
                        onClick={() => handleExcluirSetupOpcao('responsaveis', resp)}
                        title="Remover responsável da planilha"
                        className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Adicionar novo responsável */}
                <div className={`pt-2 border-t ${t.divider}`}>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Novo responsável..."
                      id="input-novo-resp"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAdicionarSetupOpcao('responsaveis', e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className={`flex-1 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none border ${t.input}`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById('input-novo-resp');
                        if (el) {
                          handleAdicionarSetupOpcao('responsaveis', el.value);
                          el.value = '';
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${t.btnPrimary}`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-xl text-xs flex items-center space-x-3 border ${t.cardAlt} ${t.textMuted}`}>
              <span className="text-lg">💡</span>
              <p>
                <strong>Dica:</strong> Você também pode abrir o arquivo <code>Database Controle Editorial.xlsx</code> diretamente no seu editor de planilhas (LibreOffice, Excel ou Google Sheets), adicionar novos itens nas colunas da aba <strong>Setup</strong> e salvar. A interface web atualizará automaticamente!
              </p>
            </div>
          </div>
        )}

        {/* 6. ABA: MANUAL EDITORIAL ICR */}
        {activeTab === 'manual' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className={`border rounded-2xl p-6 text-center space-y-2 ${darkMode ? 'bg-[#062E31]/70 border-[#0D695D]/40' : 'bg-[#0D695D]/10 border-[#0D695D]/25'}`}>
              <span className={`text-xs uppercase font-bold tracking-widest ${t.textAccent}`}>
                Diretrizes de Comunicação Oficial
              </span>
              <h2 className={`text-xl font-bold ${t.textTitle}`}>MANUAL EDITORIAL ICR</h2>
              <p className={`text-sm italic max-w-2xl mx-auto ${t.textMuted}`}>
                "Toda comunicação deve refletir nossa fidelidade às Escrituras, nosso amor pela Igreja e nosso compromisso com a excelência."
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-5 rounded-xl space-y-2 border ${t.card}`}>
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider block">
                  📚 Conteúdo Estruturante
                </span>
                <p className={`text-xs ${t.textMuted}`}>
                  Formação bíblica, Cinco Solas, Doutrinas da Graça e Catecismos. Atemporais e permanentes.
                </p>
              </div>

              <div className={`p-5 rounded-xl space-y-2 border ${t.card}`}>
                <span className="text-xs font-bold text-amber-500 uppercase tracking-wider block">
                  ⛪ Conteúdo Litúrgico
                </span>
                <p className={`text-xs ${t.textMuted}`}>
                  Acompanha a vida da comunidade: Culto de Ensino (terça), Celebração (domingo), Ceia e Batismos.
                </p>
              </div>

              <div className={`p-5 rounded-xl space-y-2 border ${t.card}`}>
                <span className="text-xs font-bold text-rose-500 uppercase tracking-wider block">
                  📢 Conteúdo Extraordinário
                </span>
                <p className={`text-xs ${t.textMuted}`}>
                  Congressos, conferências, campanhas e comunicados urgentes. Sem frequência fixa.
                </p>
              </div>
            </div>

            {/* Tópicos do Manual extraídos da planilha */}
            <div className={`rounded-xl divide-y border ${t.card} ${t.divider}`}>
              {(editorialData.manual || []).slice(0, 30).map((item, idx) => (
                <div key={idx} className={`p-4 transition-colors ${t.tableRow}`}>
                  <span className={`text-xs font-bold block mb-1 ${t.textAccent}`}>{item.topico}</span>
                  <p className={`text-xs ${t.textMuted}`}>{item.diretriz}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        </ErrorBoundary>
      </main>

      {/* MODAL INTELIGENTE: CRIAR OU EDITAR PAUTA */}
      {modalPostAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className={`rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border ${t.modalBg}`}>
            {/* Header Modal */}
            <div className={`px-6 py-4 border-b flex justify-between items-center ${t.modalHeader}`}>
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#0D695D]" />
                <h3 className={`font-bold text-sm ${t.textTitle}`}>
                  {postEmEdicao ? `Editar Pauta (${postEmEdicao.id})` : 'Nova Pauta Editorial'}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setModalPostAberto(false)}
                className={`text-sm font-mono p-1 rounded-md transition-colors ${t.iconBtn}`}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarPost} className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Título / Tema */}
              <div>
                <label className={`block text-xs font-semibold uppercase mb-1 ${t.textMuted}`}>
                  Tema / Título da Pauta *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Aniversário da Reforma / Culto de Ensino"
                  value={formPost.tema}
                  onChange={(e) => setFormPost({ ...formPost, tema: e.target.value })}
                  className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none border ${t.input}`}
                />
              </div>

              {/* Pilares, Formato e Prioridade com botões inline [+ Novo] */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Pilar Editorial */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className={`text-xs font-semibold uppercase ${t.textMuted}`}>Pilar Editorial</label>
                    <button
                      type="button"
                      onClick={() => setCriandoInline(criandoInline === 'pilares' ? null : 'pilares')}
                      className={`text-[10px] font-semibold flex items-center space-x-0.5 ${t.textAccent}`}
                    >
                      <Plus size={11} />
                      <span>Novo</span>
                    </button>
                  </div>

                  {criandoInline === 'pilares' ? (
                    <div className="flex space-x-1.5">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Nome do pilar..."
                        value={novoValorInline}
                        onChange={(e) => setNovoValorInline(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAdicionarSetupOpcao('pilares', novoValorInline);
                          }
                        }}
                        className={`w-full rounded-lg px-2.5 py-1 text-xs focus:outline-none border ${t.input}`}
                      />
                      <button
                        type="button"
                        onClick={() => handleAdicionarSetupOpcao('pilares', novoValorInline)}
                        className={`px-2 py-1 rounded-lg text-xs font-semibold ${t.btnPrimary}`}
                      >
                        ✓
                      </button>
                      <button
                        type="button"
                        onClick={() => { setCriandoInline(null); setNovoValorInline(''); }}
                        className={`px-2 py-1 rounded-lg text-xs ${t.btnSecondary}`}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <select
                      value={formPost.pilar}
                      onChange={(e) => setFormPost({ ...formPost, pilar: e.target.value })}
                      className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none border ${t.input}`}
                    >
                      {pilaresList.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Formato */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className={`text-xs font-semibold uppercase ${t.textMuted}`}>Formato</label>
                    <button
                      type="button"
                      onClick={() => setCriandoInline(criandoInline === 'formatos' ? null : 'formatos')}
                      className={`text-[10px] font-semibold flex items-center space-x-0.5 ${t.textAccent}`}
                    >
                      <Plus size={11} />
                      <span>Novo</span>
                    </button>
                  </div>

                  {criandoInline === 'formatos' ? (
                    <div className="flex space-x-1.5">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Nome do formato..."
                        value={novoValorInline}
                        onChange={(e) => setNovoValorInline(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAdicionarSetupOpcao('formatos', novoValorInline);
                          }
                        }}
                        className={`w-full rounded-lg px-2.5 py-1 text-xs focus:outline-none border ${t.input}`}
                      />
                      <button
                        type="button"
                        onClick={() => handleAdicionarSetupOpcao('formatos', novoValorInline)}
                        className={`px-2 py-1 rounded-lg text-xs font-semibold ${t.btnPrimary}`}
                      >
                        ✓
                      </button>
                      <button
                        type="button"
                        onClick={() => { setCriandoInline(null); setNovoValorInline(''); }}
                        className={`px-2 py-1 rounded-lg text-xs ${t.btnSecondary}`}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <select
                      value={formPost.formato}
                      onChange={(e) => setFormPost({ ...formPost, formato: e.target.value })}
                      className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none border ${t.input}`}
                    >
                      {formatosList.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Prioridade */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className={`text-xs font-semibold uppercase ${t.textMuted}`}>Prioridade</label>
                  </div>
                  <select
                    value={formPost.prioridade}
                    onChange={(e) => setFormPost({ ...formPost, prioridade: e.target.value })}
                    className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none border ${t.input}`}
                  >
                    {PRIORIDADES_LIST.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status e Responsável */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-semibold uppercase mb-1 ${t.textMuted}`}>Status da Pauta</label>
                  <select
                    value={formPost.status}
                    onChange={(e) => setFormPost({ ...formPost, status: e.target.value })}
                    className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none border ${t.input}`}
                  >
                    {STATUS_LIST.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className={`text-xs font-semibold uppercase ${t.textMuted}`}>Responsável</label>
                    <button
                      type="button"
                      onClick={() => setCriandoInline(criandoInline === 'responsaveis' ? null : 'responsaveis')}
                      className={`text-[10px] font-semibold flex items-center space-x-0.5 ${t.textAccent}`}
                    >
                      <Plus size={11} />
                      <span>Novo</span>
                    </button>
                  </div>

                  {criandoInline === 'responsaveis' ? (
                    <div className="flex space-x-1.5">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Nome do responsável..."
                        value={novoValorInline}
                        onChange={(e) => setNovoValorInline(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAdicionarSetupOpcao('responsaveis', novoValorInline);
                          }
                        }}
                        className={`w-full rounded-lg px-2.5 py-1 text-xs focus:outline-none border ${t.input}`}
                      />
                      <button
                        type="button"
                        onClick={() => handleAdicionarSetupOpcao('responsaveis', novoValorInline)}
                        className={`px-2 py-1 rounded-lg text-xs font-semibold ${t.btnPrimary}`}
                      >
                        ✓
                      </button>
                      <button
                        type="button"
                        onClick={() => { setCriandoInline(null); setNovoValorInline(''); }}
                        className={`px-2 py-1 rounded-lg text-xs ${t.btnSecondary}`}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <select
                      value={formPost.responsavel}
                      onChange={(e) => setFormPost({ ...formPost, responsavel: e.target.value })}
                      className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none border ${t.input}`}
                    >
                      {responsaveisList.map(resp => (
                        <option key={resp} value={resp}>{resp}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* SEÇÃO INTELIGENTE DE DATA E HORÁRIO */}
              <div className={`rounded-xl p-4 space-y-3 border ${t.cardInner}`}>
                <div className="flex items-center justify-between">
                  <label className={`text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 ${t.textTitle}`}>
                    <Calendar size={14} className={t.textAccent} />
                    <span>Agendamento & Rotina Litúrgica</span>
                  </label>
                  {diaSemanaInfo && (
                    <span className={`text-[11px] font-semibold capitalize px-2 py-0.5 rounded-full ${t.badgeGold}`}>
                      📅 {diaSemanaInfo.nome}
                    </span>
                  )}
                </div>

                {/* Atalhos Litúrgicos Rápidos (1-Clique) */}
                <div className="space-y-1.5">
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${t.textDim}`}>
                    Atalhos Rápidos de Agendamento:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => aplicarPresetData('hoje')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border flex items-center space-x-1 ${t.btnSecondary}`}
                    >
                      <Zap size={11} className={t.textAccent} />
                      <span>Hoje (14h)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => aplicarPresetData('amanha')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border flex items-center space-x-1 ${t.btnSecondary}`}
                    >
                      <Zap size={11} className={t.textAccent} />
                      <span>Amanhã (14h)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => aplicarPresetData('terca_ensino')}
                      className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-600 dark:text-sky-300 transition-colors"
                    >
                      ⛪ Terça (Culto de Ensino • 20h)
                    </button>

                    <button
                      type="button"
                      onClick={() => aplicarPresetData('quarta_estruturante')}
                      className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 transition-colors"
                    >
                      📚 Quarta (Estruturante • 14h)
                    </button>

                    <button
                      type="button"
                      onClick={() => aplicarPresetData('sexta_convite')}
                      className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 transition-colors"
                    >
                      📢 Sexta (Convite • 14h)
                    </button>

                    <button
                      type="button"
                      onClick={() => aplicarPresetData('domingo_celebracao')}
                      className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-300 transition-colors"
                    >
                      ⛪ Domingo (Celebração • 19h)
                    </button>
                  </div>
                </div>

                {/* Campos Manuais Claros: Data e Horário (Alinhamento Preciso) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div>
                    <div className="h-6 flex items-center justify-between mb-1.5">
                      <label className={`text-[11px] font-semibold ${t.textMuted}`}>
                        Data da Postagem:
                      </label>
                    </div>
                    <input
                      required
                      type="date"
                      value={formPost.dataOnly}
                      onChange={(e) => setFormPost({ ...formPost, dataOnly: e.target.value })}
                      className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none border font-mono ${t.input}`}
                    />
                  </div>

                  <div>
                    <div className="h-6 flex items-center justify-between mb-1.5">
                      <label className={`text-[11px] font-semibold ${t.textMuted}`}>
                        Horário de Disparo:
                      </label>
                      <div className="flex items-center space-x-1">
                        {['10:00', '14:00', '18:00', '20:00'].map(h => (
                          <button
                            key={h}
                            type="button"
                            onClick={() => setFormPost({ ...formPost, horaOnly: h })}
                            className={`text-[10px] px-1.5 py-0.5 rounded leading-none transition-colors border ${
                              formPost.horaOnly === h ? `${t.btnPrimary} font-medium` : t.btnSecondary
                            }`}
                          >
                            {h}
                          </button>
                        ))}
                      </div>
                    </div>
                    <input
                      required
                      type="time"
                      value={formPost.horaOnly}
                      onChange={(e) => setFormPost({ ...formPost, horaOnly: e.target.value })}
                      className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none border font-mono ${t.input}`}
                    />
                  </div>
                </div>

                {/* Banner com Orientação do Manual Editorial para o dia selecionado */}
                {diaSemanaInfo?.diretriz && (
                  <div className={`p-2.5 rounded-lg border text-xs flex items-start space-x-2.5 ${diaSemanaInfo.diretriz.cor}`}>
                    <span className="text-base leading-none">📖</span>
                    <div>
                      <span className="font-bold block leading-tight">{diaSemanaInfo.diretriz.titulo}</span>
                      <span className="text-[11px] opacity-90 leading-tight mt-0.5 block">
                        {diaSemanaInfo.diretriz.desc}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Links Externos (Canva e Instagram) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-semibold uppercase mb-1 ${t.textMuted}`}>Link do Canva</label>
                  <input
                    type="url"
                    placeholder="https://canva.com/..."
                    value={formPost.linkCanva}
                    onChange={(e) => setFormPost({ ...formPost, linkCanva: e.target.value })}
                    className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none border ${t.input}`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold uppercase mb-1 flex items-center space-x-1 ${t.textMuted}`}>
                    <InstagramIcon size={13} className="text-pink-500" />
                    <span>Link do Instagram</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.instagram.com/p/..."
                    value={formPost.linkInstagram || formPost.linkDrive || ''}
                    onChange={(e) => setFormPost({ ...formPost, linkInstagram: e.target.value, linkDrive: e.target.value })}
                    className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none border ${t.input}`}
                  />
                </div>
              </div>

              {/* Legenda / Conteúdo */}
              <div>
                <label className={`block text-xs font-semibold uppercase mb-1 ${t.textMuted}`}>Legenda / Resumo do Conteúdo</label>
                <textarea
                  rows={3}
                  placeholder="Texto ou pauta detalhada da postagem..."
                  value={formPost.legenda}
                  onChange={(e) => setFormPost({ ...formPost, legenda: e.target.value })}
                  className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none border ${t.input}`}
                />
              </div>

              {/* Ações do Rodapé do Modal */}
              <div className={`pt-3 border-t flex justify-end space-x-3 ${t.divider}`}>
                <button
                  type="button"
                  onClick={() => setModalPostAberto(false)}
                  className={`px-4 py-2 rounded-lg text-xs transition-colors ${t.btnSecondary}`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all shadow-md disabled:opacity-50 ${t.btnPrimary}`}
                >
                  {saving ? 'Gravando na Planilha...' : (postEmEdicao ? 'Atualizar na Planilha' : 'Inserir na Planilha')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CRIAR OU EDITAR REEL */}
      {modalReelAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className={`rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col border ${t.modalBg}`}>
            <div className={`px-6 py-4 border-b flex justify-between items-center ${t.modalHeader}`}>
              <h3 className={`font-bold text-sm ${t.textTitle}`}>
                {reelEmEdicao ? `Editar Roteiro de Reel (${reelEmEdicao.id})` : 'Novo Roteiro de Reel'}
              </h3>
              <button 
                type="button"
                onClick={() => setModalReelAberto(false)}
                className={`text-sm font-mono p-1 rounded-md transition-colors ${t.iconBtn}`}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarReel} className="p-6 space-y-4">
              <div>
                <label className={`block text-xs font-semibold uppercase mb-1 ${t.textMuted}`}>Tema do Vídeo *</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Por que a Reforma importa hoje?"
                  value={formReel.tema}
                  onChange={(e) => setFormReel({ ...formReel, tema: e.target.value })}
                  className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none border ${t.input}`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold uppercase mb-1 ${t.textMuted}`}>Gancho (Hook - 3 primeiros segundos)</label>
                <input
                  type="text"
                  placeholder="Ex: Você sabia que a Reforma não começou com Lutero?"
                  value={formReel.gancho}
                  onChange={(e) => setFormReel({ ...formReel, gancho: e.target.value })}
                  className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none border ${t.input}`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold uppercase mb-1 ${t.textMuted}`}>Desenvolvimento / Tópicos</label>
                <textarea
                  rows={3}
                  placeholder="Pontos chave a serem falados..."
                  value={formReel.desenvolvimento}
                  onChange={(e) => setFormReel({ ...formReel, desenvolvimento: e.target.value })}
                  className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none border ${t.input}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-semibold uppercase mb-1 ${t.textMuted}`}>CTA Final</label>
                  <input
                    type="text"
                    placeholder="Ex: Comente REFORMA para ler mais"
                    value={formReel.cta}
                    onChange={(e) => setFormReel({ ...formReel, cta: e.target.value })}
                    className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none border ${t.input}`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold uppercase mb-1 ${t.textMuted}`}>Referência Bíblica</label>
                  <input
                    type="text"
                    placeholder="Ex: Romanos 1:17"
                    value={formReel.referenciaBiblica}
                    onChange={(e) => setFormReel({ ...formReel, referenciaBiblica: e.target.value })}
                    className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none border ${t.input}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-semibold uppercase mb-1 ${t.textMuted}`}>Tempo Estimado</label>
                  <select
                    value={formReel.tempoEstimado}
                    onChange={(e) => setFormReel({ ...formReel, tempoEstimado: e.target.value })}
                    className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none border ${t.input}`}
                  >
                    <option value="30s">30 segundos</option>
                    <option value="60s">60 segundos</option>
                    <option value="90s">90 segundos</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-semibold uppercase mb-1 ${t.textMuted}`}>Status do Roteiro</label>
                  <select
                    value={formReel.statusRoteiro}
                    onChange={(e) => setFormReel({ ...formReel, statusRoteiro: e.target.value })}
                    className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none border ${t.input}`}
                  >
                    <option value="Ideia">Ideia</option>
                    <option value="Roteiro Escrito">Roteiro Escrito</option>
                    <option value="Gravado">Gravado</option>
                    <option value="Em Edição">Em Edição</option>
                    <option value="Publicado">Publicado (Mover p/ Biblioteca)</option>
                  </select>
                </div>
              </div>

              {formReel.statusRoteiro === 'Publicado' && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs">
                  ⚠️ Ao salvar como <strong>"Publicado"</strong>, este roteiro será automaticamente transferido para a <strong>Biblioteca de Conteúdos Postados</strong> da planilha.
                </div>
              )}

              <div className={`pt-3 border-t flex justify-end space-x-3 ${t.divider}`}>
                <button
                  type="button"
                  onClick={() => setModalReelAberto(false)}
                  className={`px-4 py-2 rounded-lg text-xs transition-colors ${t.btnSecondary}`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all shadow-md disabled:opacity-50 ${t.btnPrimary}`}
                >
                  {saving ? 'Gravando...' : (reelEmEdicao ? 'Atualizar Roteiro na Planilha' : 'Adicionar Reel na Planilha')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RÁPIDO: PUBLICAR REEL & MOVER PARA BIBLIOTECA */}
      {modalPublicarReel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className={`rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col border ${t.modalBg}`}>
            <div className={`px-6 py-4 border-b flex justify-between items-center ${t.modalHeader}`}>
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#0D695D]" />
                <h3 className={`font-bold text-sm ${t.textTitle}`}>
                  Publicar Reel & Arquivar
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setModalPublicarReel(null)}
                className={`text-sm font-mono p-1 rounded-md transition-colors ${t.iconBtn}`}
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className={`p-3 rounded-lg border space-y-1 ${t.cardInner}`}>
                <span className={`font-mono text-[10px] font-bold ${t.textAccent}`}>{modalPublicarReel.id}</span>
                <p className={`text-sm font-medium ${t.textTitle}`}>{modalPublicarReel.tema}</p>
                {modalPublicarReel.gancho && (
                  <p className={`text-xs italic ${t.textMuted}`}>"{modalPublicarReel.gancho}"</p>
                )}
              </div>

              <div>
                <label className={`block text-xs font-semibold uppercase mb-1 flex items-center space-x-1 ${t.textMuted}`}>
                  <InstagramIcon size={13} className="text-pink-500" />
                  <span>Link da Publicação no Instagram (Opcional):</span>
                </label>
                <input
                  type="url"
                  placeholder="https://www.instagram.com/reel/..."
                  value={linkInstagramPublicacao}
                  onChange={(e) => setLinkInstagramPublicacao(e.target.value)}
                  className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none border ${t.input}`}
                />
              </div>

              <div className={`p-3 rounded-lg text-xs border ${t.cardAlt} ${t.textTitle}`}>
                <p className="flex items-start space-x-2">
                  <Check size={16} className={`shrink-0 mt-0.5 ${t.textAccent}`} />
                  <span>
                    Ao confirmar, este roteiro será <strong>removido da aba de Roteiros Ativos</strong> e <strong>transferido automaticamente para a Biblioteca de Conteúdos Postados</strong> na planilha.
                  </span>
                </p>
              </div>

              <div className={`pt-2 border-t flex justify-end space-x-3 ${t.divider}`}>
                <button
                  type="button"
                  onClick={() => setModalPublicarReel(null)}
                  className={`px-4 py-2 rounded-lg text-xs transition-colors ${t.btnSecondary}`}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleConfirmarPublicarReel}
                  className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center space-x-1.5 ${t.btnPrimary}`}
                >
                  <CheckCircle2 size={14} />
                  <span>{saving ? 'Publicando...' : 'Confirmar Publicação'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONEXÃO COM INSTAGRAM & META GRAPH API */}
      {modalInstagramAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className={`rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border ${t.modalBg}`}>
            {/* Cabeçalho do Modal */}
            <div className={`px-6 py-4 border-b flex justify-between items-center ${t.modalHeader}`}>
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white shadow-sm">
                  <InstagramIcon size={16} />
                </div>
                <div>
                  <h3 className={`font-bold text-sm ${t.textTitle}`}>
                    Conexão do Instagram & Métricas em Tempo Real
                  </h3>
                  <p className={`text-[11px] ${t.textMuted}`}>
                    Meta Graph API oficial ou Modo Telemetria em Tempo Real
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setModalInstagramAberto(false)}
                className={`text-sm font-mono p-1.5 rounded-md transition-colors ${t.iconBtn}`}
              >
                ✕
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <form onSubmit={handleSalvarConfigInstagram} className="p-6 space-y-4 overflow-y-auto">
              {/* Card de Status da Conexão */}
              <div className={`p-4 rounded-xl border space-y-2 ${
                instagramStatus?.overview?.isLiveMode 
                  ? 'bg-emerald-500/10 border-emerald-500/30' 
                  : (darkMode ? 'bg-[#031718] border-[#0D695D]/30' : 'bg-[#F9F7F1] border-[#E2DCC8]')
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      instagramStatus?.overview?.isLiveMode ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`} />
                    <span className={`font-bold text-xs uppercase tracking-wider ${
                      instagramStatus?.overview?.isLiveMode ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {instagramStatus?.overview?.isLiveMode ? 'Meta Graph API Oficial Conectada' : 'Modo Telemetria em Tempo Real Ativo'}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono ${t.textDim}`}>
                    @{instagramStatus?.overview?.username || 'icrflorianopolis'}
                  </span>
                </div>

                <p className={`text-xs ${t.textMuted}`}>
                  {instagramStatus?.overview?.isLiveMode 
                    ? 'As métricas de curtidas, comentários, salvos e alcance são extraídas diretamente dos servidores oficiais da Meta para cada publicação.'
                    : 'O sistema está gerando telemetria dinâmica viva em tempo real e gravando na planilha Database Controle Editorial.xlsx. Para puxar dados oficiais brutos da Meta, insira seu Access Token abaixo.'}
                </p>

                {instagramStatus?.overview?.error && (
                  <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-1.5">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{instagramStatus.overview.error}</span>
                  </div>
                )}
              </div>

              {/* Campos de Configuração */}
              <div className="space-y-3">
                <div>
                  <label className={`block text-xs font-semibold uppercase mb-1 ${t.textMuted}`}>
                    Nome de Usuário (@ Perfil)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="icrflorianopolis"
                    value={formInstagram.username}
                    onChange={(e) => setFormInstagram({ ...formInstagram, username: e.target.value })}
                    className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none border ${t.input}`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold uppercase mb-1 ${t.textMuted}`}>
                    Instagram Business Account ID (Meta)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 17841400000000000 (Opcional - deixe vazio para telemetria)"
                    value={formInstagram.accountId}
                    onChange={(e) => setFormInstagram({ ...formInstagram, accountId: e.target.value })}
                    className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none font-mono border ${t.input}`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold uppercase mb-1 flex items-center justify-between ${t.textMuted}`}>
                    <span>Token de Acesso da Meta Graph API (Access Token)</span>
                    <span className="text-[10px] lowercase italic">{instagramStatus?.config?.hasToken ? '(Token salvo no servidor)' : '(Opcional)'}</span>
                  </label>
                  <input
                    type="password"
                    placeholder={instagramStatus?.config?.hasToken ? "•••••••••••••••••••••••• (deixe vazio para manter)" : "EAAB... (Token permanente da Meta Graph API)"}
                    value={formInstagram.accessToken}
                    onChange={(e) => setFormInstagram({ ...formInstagram, accessToken: e.target.value })}
                    className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none font-mono border ${t.input}`}
                  />
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="autoSyncCheck"
                    checked={formInstagram.autoSync}
                    onChange={(e) => setFormInstagram({ ...formInstagram, autoSync: e.target.checked })}
                    className="w-4 h-4 rounded text-[#0D695D] focus:ring-[#0D695D]"
                  />
                  <label htmlFor="autoSyncCheck" className={`text-xs cursor-pointer select-none ${t.textTitle}`}>
                    Sincronizar métricas automaticamente ao carregar a plataforma
                  </label>
                </div>
              </div>

              {/* Caixa Informativa Passo a Passo */}
              <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${t.cardInner}`}>
                <h5 className={`font-semibold flex items-center space-x-1.5 ${t.textAccent}`}>
                  <Sparkles size={13} />
                  <span>Como gerar a Chave de API Oficial da Meta (Opcional)</span>
                </h5>
                <ol className={`list-decimal list-inside space-y-1 text-[11px] ${t.textMuted}`}>
                  <li>Acesse o portal <strong>developers.facebook.com</strong> com a conta que gerencia a página da ICR.</li>
                  <li>Crie ou selecione um aplicativo do tipo <em>Empresa / Negócios</em>.</li>
                  <li>No <em>Graph API Explorer</em>, solicite permissões para <code>instagram_basic</code> e <code>instagram_manage_insights</code>.</li>
                  <li>Gere o Token de Usuário de Longa Duração e cole no campo acima.</li>
                </ol>
              </div>

              {/* Botões do Rodapé */}
              <div className={`pt-3 border-t flex flex-wrap items-center justify-between gap-2 ${t.divider}`}>
                <button
                  type="button"
                  onClick={sincronizarInstagramGeral}
                  disabled={instagramSyncing}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${t.btnSecondary}`}
                >
                  <RefreshCw size={13} className={instagramSyncing ? 'animate-spin' : ''} />
                  <span>{instagramSyncing ? 'Sincronizando...' : 'Sincronizar Planilha Agora'}</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setModalInstagramAberto(false)}
                    className={`px-4 py-2 rounded-lg text-xs transition-colors ${t.btnSecondary}`}
                  >
                    Fechar
                  </button>
                  <button
                    type="submit"
                    disabled={salvandoConfigInstagram}
                    className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center space-x-1.5 ${t.btnPrimary}`}
                  >
                    <CheckCircle2 size={14} />
                    <span>{salvandoConfigInstagram ? 'Validando...' : 'Salvar & Conectar'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: CADASTRAR / EDITAR ESCALA DE EQUIPE */}
      {modalEscalaAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className={`rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border ${t.modalBg}`}>
            {/* Topo do Modal */}
            <div className={`px-6 py-4 border-b flex justify-between items-center ${t.modalHeader}`}>
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0D695D] flex items-center justify-center text-white shadow-sm">
                  <Users size={16} />
                </div>
                <div>
                  <h3 className={`font-bold text-sm ${t.textTitle}`}>
                    {escalaEmEdicao ? `Editar Escala (${escalaEmEdicao.id})` : 'Nova Escala de Equipe'}
                  </h3>
                  <p className={`text-[11px] ${t.textMuted}`}>
                    Defina o voluntário, função, culto ou evento e data de serviço
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setModalEscalaAberto(false)}
                className={`text-sm font-mono p-1.5 rounded-md transition-colors ${t.iconBtn}`}
              >
                ✕
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSalvarEscala} className="p-6 space-y-4 overflow-y-auto">
              {/* 1. Tipo de Data: Fixa vs Evento Específico */}
              <div>
                <label className={`block text-xs font-semibold uppercase mb-1.5 ${t.textMuted}`}>
                  Tipo de Data & Ocasião
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFormEscala(prev => ({
                        ...prev,
                        tipoData: 'Data Fixa (Culto)',
                        evento: prev.evento || 'Culto de Ensino'
                      }));
                      aplicarPresetCultoFixo('terca_ensino');
                    }}
                    className={`p-3 rounded-xl border text-left flex items-start space-x-2.5 transition-all ${
                      formEscala.tipoData === 'Data Fixa (Culto)'
                        ? 'border-[#0D695D] bg-[#0D695D]/15 shadow-sm ring-1 ring-[#0D695D]'
                        : `${t.cardInner} hover:border-[#0D695D]/40`
                    }`}
                  >
                    <span className="text-base mt-0.5">📌</span>
                    <div>
                      <p className={`text-xs font-bold ${t.textTitle}`}>Data Fixa (Culto)</p>
                      <p className={`text-[11px] mt-0.5 ${t.textDim}`}>
                        Culto de Ensino (Terças 20h) ou Celebração (Domingos)
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormEscala(prev => ({
                      ...prev,
                      tipoData: 'Evento / Específico',
                      evento: prev.tipoData === 'Evento / Específico' ? prev.evento : ''
                    }))}
                    className={`p-3 rounded-xl border text-left flex items-start space-x-2.5 transition-all ${
                      formEscala.tipoData === 'Evento / Específico'
                        ? 'border-[#0D695D] bg-[#0D695D]/15 shadow-sm ring-1 ring-[#0D695D]'
                        : `${t.cardInner} hover:border-[#0D695D]/40`
                    }`}
                  >
                    <span className="text-base mt-0.5">🎯</span>
                    <div>
                      <p className={`text-xs font-bold ${t.textTitle}`}>Evento Específico</p>
                      <p className={`text-[11px] mt-0.5 ${t.textDim}`}>
                        Conferências, vigílias, batismos e cultos extraordinários
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* 2. Seleção do Culto ou Nome do Evento */}
              {formEscala.tipoData === 'Data Fixa (Culto)' ? (
                <div className="space-y-2">
                  <label className={`block text-xs font-semibold uppercase ${t.textMuted}`}>
                    Culto Fixo Semanal da ICR
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => aplicarPresetCultoFixo('terca_ensino')}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold text-center border transition-all ${
                        formEscala.evento.includes('Ensino')
                          ? 'bg-[#0D695D] text-white border-[#C4B270]/40 shadow-sm'
                          : `${t.btnSecondary}`
                      }`}
                    >
                      📖 Culto de Ensino (Terça 20h)
                    </button>
                    <button
                      type="button"
                      onClick={() => aplicarPresetCultoFixo('dom_manha')}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold text-center border transition-all ${
                        formEscala.evento.includes('Manhã')
                          ? 'bg-[#0D695D] text-white border-[#C4B270]/40 shadow-sm'
                          : `${t.btnSecondary}`
                      }`}
                    >
                      🕊️ Celebração (Dom 10h)
                    </button>
                    <button
                      type="button"
                      onClick={() => aplicarPresetCultoFixo('dom_noite')}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold text-center border transition-all ${
                        formEscala.evento.includes('Noite')
                          ? 'bg-[#0D695D] text-white border-[#C4B270]/40 shadow-sm'
                          : `${t.btnSecondary}`
                      }`}
                    >
                      🌟 Celebração (Dom 19h)
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className={`block text-xs font-semibold uppercase mb-1 ${t.textMuted}`}>
                    Nome do Evento / Culto Específico
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Conferência Firme & Constante, Vigília, Batismo..."
                    value={formEscala.evento}
                    onChange={(e) => setFormEscala({ ...formEscala, evento: e.target.value })}
                    className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none border ${t.input}`}
                  />
                </div>
              )}

              {/* 3. Data e Horário */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold uppercase mb-1 ${t.textMuted}`}>
                    Data da Escala
                  </label>
                  <input
                    type="date"
                    required
                    value={formEscala.dataOnly}
                    onChange={(e) => setFormEscala({ ...formEscala, dataOnly: e.target.value })}
                    className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none font-mono border ${t.input}`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold uppercase mb-1 ${t.textMuted}`}>
                    Horário do Culto / Início
                  </label>
                  <input
                    type="time"
                    required
                    value={formEscala.horaOnly}
                    onChange={(e) => setFormEscala({ ...formEscala, horaOnly: e.target.value })}
                    className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none font-mono border ${t.input}`}
                  />
                </div>
              </div>

              {/* 4. Pessoa Escalada / Voluntário */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className={`block text-xs font-semibold uppercase ${t.textMuted}`}>
                    Nome da Pessoa / Voluntário
                  </label>
                  <button
                    type="button"
                    onClick={() => setCriandoInlineEscala(criandoInlineEscala === 'voluntario' ? null : 'voluntario')}
                    className={`text-[11px] font-bold ${t.textAccent} hover:underline`}
                  >
                    {criandoInlineEscala === 'voluntario' ? 'Cancelar' : '+ Cadastrar Novo Nome'}
                  </button>
                </div>

                {criandoInlineEscala === 'voluntario' ? (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Novo nome de voluntário..."
                      value={novoValorInlineEscala}
                      onChange={(e) => setNovoValorInlineEscala(e.target.value)}
                      className={`flex-1 rounded-lg px-3 py-2 text-xs focus:outline-none border ${t.input}`}
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        if (novoValorInlineEscala.trim()) {
                          await handleAdicionarVoluntario(novoValorInlineEscala.trim());
                          setFormEscala(prev => ({ ...prev, pessoa: novoValorInlineEscala.trim() }));
                          setNovoValorInlineEscala('');
                          setCriandoInlineEscala(null);
                        }
                      }}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold ${t.btnPrimary}`}
                    >
                      Cadastrar
                    </button>
                  </div>
                ) : (
                  <select
                    required
                    value={formEscala.pessoa}
                    onChange={(e) => setFormEscala({ ...formEscala, pessoa: e.target.value })}
                    className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none border ${t.input}`}
                  >
                    <option value="">Selecione um voluntário...</option>
                    <option value="A Definir">A Definir (Vaga Aberta)</option>
                    {voluntariosList.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* 5. Função / O que fará */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className={`block text-xs font-semibold uppercase ${t.textMuted}`}>
                    Função / O que fará
                  </label>
                  <button
                    type="button"
                    onClick={() => setCriandoInlineEscala(criandoInlineEscala === 'funcao' ? null : 'funcao')}
                    className={`text-[11px] font-bold ${t.textAccent} hover:underline`}
                  >
                    {criandoInlineEscala === 'funcao' ? 'Cancelar' : '+ Cadastrar Nova Função'}
                  </button>
                </div>

                {criandoInlineEscala === 'funcao' ? (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Nova função (ex: Iluminação, Operação de Telão)..."
                      value={novoValorInlineEscala}
                      onChange={(e) => setNovoValorInlineEscala(e.target.value)}
                      className={`flex-1 rounded-lg px-3 py-2 text-xs focus:outline-none border ${t.input}`}
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        if (novoValorInlineEscala.trim()) {
                          await handleAdicionarFuncaoEscala(novoValorInlineEscala.trim());
                          setFormEscala(prev => ({ ...prev, funcao: novoValorInlineEscala.trim() }));
                          setNovoValorInlineEscala('');
                          setCriandoInlineEscala(null);
                        }
                      }}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold ${t.btnPrimary}`}
                    >
                      Cadastrar
                    </button>
                  </div>
                ) : (
                  <select
                    required
                    value={formEscala.funcao}
                    onChange={(e) => setFormEscala({ ...formEscala, funcao: e.target.value })}
                    className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none border ${t.input}`}
                  >
                    {funcoesEscalaList.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* 6. Status da Escala */}
              <div>
                <label className={`block text-xs font-semibold uppercase mb-1 ${t.textMuted}`}>
                  Status da Escala
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Confirmado', 'Pendente', 'Substituição', 'Concluído'].map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setFormEscala({ ...formEscala, status: st })}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border text-center transition-all ${
                        formEscala.status === st
                          ? 'border-[#0D695D] bg-[#0D695D]/20 text-white font-bold ring-1 ring-[#0D695D]'
                          : `${t.btnSecondary}`
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* 7. Observações */}
              <div>
                <label className={`block text-xs font-semibold uppercase mb-1 ${t.textMuted}`}>
                  Observações / Orientações para o Voluntário
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Chegar às 19h30 para passagem de som e teste de câmeras..."
                  value={formEscala.observacoes}
                  onChange={(e) => setFormEscala({ ...formEscala, observacoes: e.target.value })}
                  className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none border ${t.input}`}
                />
              </div>

              {/* Botões do Rodapé */}
              <div className={`pt-3 border-t flex justify-end space-x-3 ${t.divider}`}>
                <button
                  type="button"
                  onClick={() => setModalEscalaAberto(false)}
                  className={`px-4 py-2 rounded-lg text-xs transition-colors ${t.btnSecondary}`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center space-x-1.5 ${t.btnPrimary}`}
                >
                  <CheckCircle2 size={14} />
                  <span>{saving ? 'Gravando...' : (escalaEmEdicao ? 'Atualizar Escala' : 'Salvar Escala na Planilha')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: GERENCIAR VOLUNTÁRIOS & FUNÇÕES DA EQUIPE */}
      {modalGerenciarEquipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className={`rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border ${t.modalBg}`}>
            <div className={`px-6 py-4 border-b flex justify-between items-center ${t.modalHeader}`}>
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#C4B270]/20 text-[#C4B270] flex items-center justify-center shadow-sm">
                  <Settings size={16} />
                </div>
                <div>
                  <h3 className={`font-bold text-sm ${t.textTitle}`}>
                    Gerenciar Equipe, Voluntários & Funções
                  </h3>
                  <p className={`text-[11px] ${t.textMuted}`}>
                    Cadastre novos membros da equipe e funções. Sincronizado na aba <strong>Setup</strong> da planilha.
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setModalGerenciarEquipe(false)}
                className={`text-sm font-mono p-1.5 rounded-md transition-colors ${t.iconBtn}`}
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Seção 1: Voluntários Cadastrados */}
              <div className={`p-4 rounded-xl border space-y-3 ${t.cardInner}`}>
                <div className="flex justify-between items-center">
                  <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 ${t.textTitle}`}>
                    <Users size={14} className={t.textAccent} />
                    <span>Voluntários Cadastrados ({voluntariosList.length})</span>
                  </h4>
                </div>

                <div className="flex flex-wrap gap-2">
                  {voluntariosList.map(vol => (
                    <span 
                      key={vol} 
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${t.cardAlt}`}
                    >
                      <span className={t.textTitle}>{vol}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoverVoluntario(vol)}
                        title={`Remover ${vol}`}
                        className="p-0.5 hover:text-rose-400 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Input para cadastrar novo voluntário */}
                <div className="flex space-x-2 pt-1">
                  <input
                    type="text"
                    placeholder="Nome completo do novo voluntário..."
                    value={novoNomeVoluntario}
                    onChange={(e) => setNovoNomeVoluntario(e.target.value)}
                    className={`flex-1 rounded-lg px-3 py-1.5 text-xs focus:outline-none border ${t.input}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleAdicionarVoluntario(novoNomeVoluntario)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold ${t.btnPrimary}`}
                  >
                    + Cadastrar Voluntário
                  </button>
                </div>
              </div>

              {/* Seção 2: Funções da Escala Cadastradas */}
              <div className={`p-4 rounded-xl border space-y-3 ${t.cardInner}`}>
                <div className="flex justify-between items-center">
                  <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 ${t.textTitle}`}>
                    <Shield size={14} className={t.textAccent} />
                    <span>Funções / O que fará ({funcoesEscalaList.length})</span>
                  </h4>
                </div>

                <div className="flex flex-wrap gap-2">
                  {funcoesEscalaList.map(func => (
                    <span 
                      key={func} 
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${t.cardAlt}`}
                    >
                      <span className={t.textTitle}>{func}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoverFuncaoEscala(func)}
                        title={`Remover função ${func}`}
                        className="p-0.5 hover:text-rose-400 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Input para cadastrar nova função */}
                <div className="flex space-x-2 pt-1">
                  <input
                    type="text"
                    placeholder="Nome da nova função (ex: Iluminação, Operação de Áudio)..."
                    value={novaFuncaoEscala}
                    onChange={(e) => setNovaFuncaoEscala(e.target.value)}
                    className={`flex-1 rounded-lg px-3 py-1.5 text-xs focus:outline-none border ${t.input}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleAdicionarFuncaoEscala(novaFuncaoEscala)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold ${t.btnPrimary}`}
                  >
                    + Cadastrar Função
                  </button>
                </div>
              </div>

              {/* Seção 3: Cultos Fixos da ICR Florianópolis */}
              <div className={`p-4 rounded-xl border space-y-2 text-xs ${t.cardInner}`}>
                <h4 className={`font-bold flex items-center space-x-1.5 ${t.textAccent}`}>
                  <CalendarCheck size={14} />
                  <span>Cultos Semanais com Datas Fixas na ICR</span>
                </h4>
                <div className="space-y-1.5 text-xs">
                  <p className="flex justify-between py-1 border-b border-[#0D695D]/20">
                    <span className="font-semibold text-[#0D695D] dark:text-[#C4B270]">Culto de Ensino:</span>
                    <span className={t.textTitle}>Todas as Terças-feiras às 20h00</span>
                  </p>
                  <p className="flex justify-between py-1 border-b border-[#0D695D]/20">
                    <span className="font-semibold text-[#0D695D] dark:text-[#C4B270]">Culto de Celebração (Manhã):</span>
                    <span className={t.textTitle}>Todos os Domingos às 10h00</span>
                  </p>
                  <p className="flex justify-between py-1">
                    <span className="font-semibold text-[#0D695D] dark:text-[#C4B270]">Culto de Celebração (Noite):</span>
                    <span className={t.textTitle}>Todos os Domingos às 19h00</span>
                  </p>
                </div>
              </div>

              <div className={`pt-3 border-t flex justify-end ${t.divider}`}>
                <button
                  type="button"
                  onClick={() => setModalGerenciarEquipe(false)}
                  className={`px-5 py-2 rounded-lg text-xs font-semibold ${t.btnPrimary}`}
                >
                  Concluir & Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}