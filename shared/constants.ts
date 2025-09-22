// Job status configuration
export const JOB_STATUS_CONFIG = {
  draft: {
    label: "Rascunho",
    variant: "secondary" as const,
    description: "Vaga em preparação, ainda não publicada"
  },
  active: {
    label: "Ativa",
    variant: "default" as const,
    description: "Vaga publicada e recebendo candidaturas"
  },
  aberto: {
    label: "Aberto",
    variant: "default" as const,
    description: "Processo seletivo aberto para candidaturas"
  },
  em_recrutamento: {
    label: "Em Recrutamento",
    variant: "outline" as const,
    description: "Processo seletivo em andamento"
  },
  em_documentacao: {
    label: "Em Documentação",
    variant: "secondary" as const,
    description: "Candidato selecionado, documentação em andamento"
  },
  paused: {
    label: "Pausada",
    variant: "outline" as const,
    description: "Vaga temporariamente pausada"
  },
  closed: {
    label: "Fechada",
    variant: "destructive" as const,
    description: "Vaga encerrada com sucesso"
  },
  expired: {
    label: "Expirada",
    variant: "destructive" as const,
    description: "Vaga expirada sem conclusão"
  }
} as const;

export type JobStatus = keyof typeof JOB_STATUS_CONFIG;

export const JOB_STATUSES = Object.keys(JOB_STATUS_CONFIG) as JobStatus[];

export const getStatusLabel = (status: string): string => {
  return JOB_STATUS_CONFIG[status as JobStatus]?.label || status;
};

export const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  return JOB_STATUS_CONFIG[status as JobStatus]?.variant || "secondary";
};

export const getStatusDescription = (status: string): string => {
  return JOB_STATUS_CONFIG[status as JobStatus]?.description || "";
};

// Industry Types Configuration
export const INDUSTRY_TYPES = [
  { value: "technology", label: "Tecnologia" },
  { value: "finance", label: "Financeiro" },
  { value: "healthcare", label: "Saúde" },
  { value: "education", label: "Educação" },
  { value: "retail", label: "Varejo" },
  { value: "manufacturing", label: "Manufatura" },
  { value: "construction", label: "Construção" },
  { value: "automotive", label: "Automotivo" },
  { value: "energy", label: "Energia" },
  { value: "telecommunications", label: "Telecomunicações" },
  { value: "consulting", label: "Consultoria" },
  { value: "media", label: "Mídia" },
  { value: "transportation", label: "Transporte" },
  { value: "hospitality", label: "Hotelaria" },
  { value: "agriculture", label: "Agricultura" },
  { value: "legal", label: "Jurídico" },
  { value: "real_estate", label: "Imobiliário" },
  { value: "insurance", label: "Seguros" },
  { value: "non_profit", label: "Sem Fins Lucrativos" },
  { value: "government", label: "Governo" },
  { value: "other", label: "Outros" }
] as const;

export type IndustryType = typeof INDUSTRY_TYPES[number]["value"];

export const getIndustryLabel = (industryType: string): string => {
  const industry = INDUSTRY_TYPES.find(i => i.value === industryType);
  return industry?.label || industryType;
};