// Job status configuration
export const JOB_STATUS_CONFIG = {
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
  aprovada: {
    label: "Aprovada",
    variant: "default" as const,
    description: "Vaga aprovada para recrutamento"
  },
  dp: {
    label: "DP",
    variant: "secondary" as const,
    description: "Vaga em processamento no departamento pessoal"
  },
  em_mobilizacao: {
    label: "Em Mobilização",
    variant: "outline" as const,
    description: "Candidato em processo de mobilização"
  },
  cancelada: {
    label: "Cancelada",
    variant: "destructive" as const,
    description: "Vaga cancelada"
  },
  closed: {
    label: "Fechada",
    variant: "destructive" as const,
    description: "Vaga encerrada com sucesso"
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

// Brazilian Cities by State
export const BRAZILIAN_CITIES = {
  AC: ["Rio Branco", "Cruzeiro do Sul", "Sena Madureira", "Tarauacá", "Feijó"],
  AL: ["Maceió", "Arapiraca", "Palmeira dos Índios", "Rio Largo", "União dos Palmares"],
  AP: ["Macapá", "Santana", "Laranjal do Jari", "Oiapoque", "Porto Grande"],
  AM: ["Manaus", "Parintins", "Itacoatiara", "Manacapuru", "Coari"],
  BA: ["Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari", "Itabuna", "Juazeiro", "Lauro de Freitas", "Ilhéus", "Jequié", "Teixeira de Freitas"],
  CE: ["Fortaleza", "Caucaia", "Juazeiro do Norte", "Maracanaú", "Sobral", "Crato", "Itapipoca", "Maranguape", "Iguatu", "Quixadá"],
  DF: ["Brasília"],
  ES: ["Vitória", "Vila Velha", "Serra", "Cariacica", "Viana", "Cachoeiro de Itapemirim", "Linhares", "São Mateus", "Colatina", "Guarapari"],
  GO: ["Goiânia", "Aparecida de Goiânia", "Anápolis", "Rio Verde", "Luziânia", "Águas Lindas de Goiás", "Valparaíso de Goiás", "Trindade", "Formosa", "Novo Gama"],
  MA: ["São Luís", "Imperatriz", "São José de Ribamar", "Timon", "Caxias", "Codó", "Paço do Lumiar", "Açailândia", "Bacabal", "Balsas"],
  MT: ["Cuiabá", "Várzea Grande", "Rondonópolis", "Sinop", "Tangará da Serra", "Cáceres", "Sorriso", "Lucas do Rio Verde", "Barra do Garças", "Primavera do Leste"],
  MS: ["Campo Grande", "Dourados", "Três Lagoas", "Corumbá", "Ponta Porã", "Aquidauana", "Nova Andradina", "Sidrolândia", "Maracaju", "Naviraí"],
  MG: ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim", "Montes Claros", "Ribeirão das Neves", "Uberaba", "Governador Valadares", "Ipatinga", "Sete Lagoas", "Divinópolis", "Santa Luzia", "Ibirité", "Poços de Caldas"],
  PA: ["Belém", "Ananindeua", "Santarém", "Marabá", "Castanhal", "Parauapebas", "Itaituba", "Cametá", "Bragança", "Abaetetuba"],
  PB: ["João Pessoa", "Campina Grande", "Santa Rita", "Patos", "Bayeux", "Sousa", "Cajazeiras", "Guarabira", "Cabedelo", "Mamanguape"],
  PR: ["Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel", "São José dos Pinhais", "Foz do Iguaçu", "Colombo", "Guarapuava", "Paranaguá", "Araucária", "Toledo", "Apucarana", "Pinhais", "Campo Largo"],
  PE: ["Recife", "Jaboatão dos Guararapes", "Olinda", "Paulista", "Caruaru", "Petrolina", "Cabo de Santo Agostinho", "Camaragibe", "Garanhuns", "Vitória de Santo Antão"],
  PI: ["Teresina", "Parnaíba", "Picos", "Piripiri", "Floriano", "Campo Maior", "Barras", "Altos", "Esperantina", "São Raimundo Nonato"],
  RJ: ["Rio de Janeiro", "São Gonçalo", "Duque de Caxias", "Nova Iguaçu", "Niterói", "Belford Roxo", "São João de Meriti", "Campos dos Goytacazes", "Petrópolis", "Volta Redonda", "Magé", "Itaboraí", "Macaé", "Cabo Frio", "Nova Friburgo"],
  RN: ["Natal", "Mossoró", "Parnamirim", "São Gonçalo do Amarante", "Macaíba", "Ceará-Mirim", "Caicó", "Assu", "Currais Novos", "Pau dos Ferros"],
  RS: ["Porto Alegre", "Caxias do Sul", "Pelotas", "Canoas", "Santa Maria", "Gravataí", "Viamão", "Novo Hamburgo", "São Leopoldo", "Rio Grande", "Alvorada", "Passo Fundo", "Sapucaia do Sul", "Uruguaiana", "Santa Cruz do Sul"],
  RO: ["Porto Velho", "Ji-Paraná", "Ariquemes", "Vilhena", "Cacoal", "Jaru", "Rolim de Moura", "Guajará-Mirim", "Pimenta Bueno", "Espigão d'Oeste"],
  RR: ["Boa Vista", "Rorainópolis", "Caracaraí", "Alto Alegre", "Mucajaí"],
  SC: ["Florianópolis", "Joinville", "Blumenau", "São José", "Criciúma", "Chapecó", "Itajaí", "Jaraguá do Sul", "Lages", "Palhoça", "Balneário Camboriú", "Brusque", "Tubarão", "São Bento do Sul", "Caçador"],
  SP: ["São Paulo", "Guarulhos", "Campinas", "São Bernardo do Campo", "Santo André", "Osasco", "São José dos Campos", "Ribeirão Preto", "Sorocaba", "Mauá", "São José do Rio Preto", "Santos", "Diadema", "Carapicuíba", "Piracicaba", "Bauru", "Itaquaquecetuba", "São Vicente", "Franca", "Guarujá", "Taubaté", "Limeira", "Suzano", "Taboão da Serra", "Sumaré", "Barueri", "Embu das Artes", "Jundiaí", "Praia Grande"],
  SE: ["Aracaju", "Nossa Senhora do Socorro", "Lagarto", "Itabaiana", "Estância", "São Cristóvão", "Simão Dias", "Propriá", "Tobias Barreto", "Laranjeiras"],
  TO: ["Palmas", "Araguaína", "Gurupi", "Porto Nacional", "Paraíso do Tocantins", "Colinas do Tocantins", "Guaraí", "Miracema do Tocantins", "Tocantinópolis", "Araguatins"]
} as const;

export const BRAZILIAN_STATES = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" }
] as const;

// Get all cities as flat array
export const getAllCities = (): string[] => {
  return Object.values(BRAZILIAN_CITIES).flat().sort();
};