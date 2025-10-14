import { useState } from "react";
import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertJobSchema, type InsertJob, type JobWithDetails, type CompaniesListResponse, type Profession, type Client } from "@shared/schema";
import { getAllCities } from "@shared/constants";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const jobFormSchema = z.object({
  professionId: z.string().min(1, "Profissão é obrigatória"),
  description: z.string().optional().default(""),
  companyId: z.string().optional(),
  costCenterId: z.string().optional(),
  recruiterId: z.string().optional(),
  department: z.string().optional().default(""),
  location: z.string().optional().default(""),
  contractType: z.enum(["clt", "pj", "freelancer", "estagio", "temporario"]).default("clt"),
  jobType: z.enum(["produtiva", "improdutiva"]).optional(),
  status: z.enum(["draft", "active", "paused", "closed", "expired", "aberto", "aprovada", "em_recrutamento", "em_documentacao"]).default("draft"),
  
  // Novos campos detalhados
  openingDate: z.string().optional(),
  startDate: z.string().optional(),
  openingReason: z.enum(["substituicao", "aumento_quadro"]).optional(),
  ageRangeMin: z.string().optional(),
  ageRangeMax: z.string().optional(),
  specifications: z.string().optional(),
  clientId: z.string().optional(),
  vacancyQuantity: z.string().optional().default("1"),
  gender: z.enum(["masculino", "feminino", "indiferente"]).default("indiferente"),
  workScale: z.enum(["5x1", "5x2", "6x1", "12x36", "outro"]).optional(),
  workHours: z.string().optional(),
  
  salaryMin: z.string().optional().default(""),
  salaryMax: z.string().optional().default(""),
  bonus: z.string().optional(),
  hasHazardPay: z.boolean().default(false),
  unhealthinessLevel: z.enum(["nao", "10", "20", "40"]).default("nao"),
  
  hasMealVoucher: z.boolean().default(false),
  hasFoodVoucher: z.boolean().default(false),
  hasTransportVoucher: z.boolean().default(false),
  hasHealthInsurance: z.boolean().default(false),
});

type JobFormData = z.infer<typeof jobFormSchema>;

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId?: string;
}

export default function JobModal({ isOpen, onClose, jobId }: JobModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!jobId;
  const [cities] = useState(getAllCities());
  const [professionPopoverOpen, setProfessionPopoverOpen] = useState(false);

  const { data: companies } = useQuery<CompaniesListResponse>({
    queryKey: ["/api/companies"],
  });

  const { data: professions } = useQuery<Profession[]>({
    queryKey: ["/api/professions"],
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: recruiters } = useQuery({
    queryKey: ["/api/recruiters"],
  });

  const { data: jobData } = useQuery<JobWithDetails>({
    queryKey: ["/api/jobs", jobId],
    enabled: isEditing,
  });

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      professionId: "",
      description: "",
      recruiterId: "",
      department: "",
      location: "",
      contractType: "clt",
      status: "draft",
      vacancyQuantity: "1",
      gender: "indiferente",
      unhealthinessLevel: "nao",
      hasHazardPay: false,
      hasMealVoucher: false,
      hasFoodVoucher: false,
      hasTransportVoucher: false,
      hasHealthInsurance: false,
    },
  });

  // Update form when job data is loaded
  React.useEffect(() => {
    if (isEditing && jobData && !form.formState.isDirty) {
      form.reset({
        professionId: jobData.professionId || "",
        description: jobData.description || "",
        department: jobData.department || "",
        location: jobData.location || "",
        companyId: jobData.companyId || undefined,
        costCenterId: jobData.costCenterId || undefined,
        recruiterId: jobData.recruiterId || "",
        contractType: jobData.contractType || "clt",
        jobType: jobData.jobType || undefined,
        status: jobData.status || "draft",
        salaryMin: jobData.salaryMin || "",
        salaryMax: jobData.salaryMax || "",
        openingDate: jobData.openingDate ? new Date(jobData.openingDate).toISOString().split('T')[0] : undefined,
        startDate: jobData.startDate ? new Date(jobData.startDate).toISOString().split('T')[0] : undefined,
        openingReason: jobData.openingReason || undefined,
        ageRangeMin: jobData.ageRangeMin?.toString() || "",
        ageRangeMax: jobData.ageRangeMax?.toString() || "",
        specifications: jobData.specifications || "",
        clientId: jobData.clientId || "",
        vacancyQuantity: jobData.vacancyQuantity?.toString() || "1",
        gender: jobData.gender || "indiferente",
        workScale: jobData.workScale || undefined,
        workHours: jobData.workHours || "",
        bonus: jobData.bonus || "",
        hasHazardPay: jobData.hasHazardPay || false,
        unhealthinessLevel: jobData.unhealthinessLevel || "nao",
        hasMealVoucher: jobData.hasMealVoucher || false,
        hasFoodVoucher: jobData.hasFoodVoucher || false,
        hasTransportVoucher: jobData.hasTransportVoucher || false,
        hasHealthInsurance: jobData.hasHealthInsurance || false,
      });
    }
  }, [isEditing, jobData, form]);

  const { data: costCenters } = useQuery({
    queryKey: ["/api/companies", form.watch("companyId"), "cost-centers"],
    enabled: !!form.watch("companyId"),
  });

  // Watch professionId to show union
  const selectedProfessionId = form.watch("professionId");
  const selectedProfession = professions?.find(p => p.id === selectedProfessionId);

  const createJobMutation = useMutation({
    mutationFn: async (data: JobFormData) => {
      // Convert form data to API format
      const apiData = {
        ...data,
        salaryMin: data.salaryMin ? data.salaryMin : null,
        salaryMax: data.salaryMax ? data.salaryMax : null,
        bonus: data.bonus ? data.bonus : null,
        ageRangeMin: data.ageRangeMin ? parseInt(data.ageRangeMin) : null,
        ageRangeMax: data.ageRangeMax ? parseInt(data.ageRangeMax) : null,
        vacancyQuantity: data.vacancyQuantity ? parseInt(data.vacancyQuantity) : 1,
        openingDate: data.openingDate || null,
        startDate: data.startDate || null,
      };
      const response = await apiRequest("POST", "/api/jobs", apiData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Sucesso",
        description: "Vaga criada com sucesso!",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar vaga. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateJobMutation = useMutation({
    mutationFn: async (data: Partial<JobFormData>) => {
      // Convert form data to API format
      const apiData = {
        ...data,
        salaryMin: data.salaryMin ? data.salaryMin : null,
        salaryMax: data.salaryMax ? data.salaryMax : null,
        bonus: data.bonus ? data.bonus : null,
        ageRangeMin: data.ageRangeMin ? parseInt(data.ageRangeMin) : null,
        ageRangeMax: data.ageRangeMax ? parseInt(data.ageRangeMax) : null,
        vacancyQuantity: data.vacancyQuantity ? parseInt(data.vacancyQuantity) : 1,
        openingDate: data.openingDate || null,
        startDate: data.startDate || null,
      };
      const response = await apiRequest("PUT", `/api/jobs/${jobId}`, apiData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs", jobId] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Sucesso",
        description: "Vaga atualizada com sucesso!",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar vaga. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: JobFormData) => {
    if (isEditing) {
      updateJobMutation.mutate(data);
    } else {
      createJobMutation.mutate(data);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Vaga" : "Nova Vaga"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Seção 1: Informações Básicas */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Informações Básicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="professionId"
                  render={({ field }) => {
                    const activeProfessions = Array.isArray(professions) 
                      ? professions.filter(p => p.isActive).sort((a, b) => 
                          (a.category || "").localeCompare(b.category || "") || a.name.localeCompare(b.name)
                        )
                      : [];
                    
                    const selectedProfession = activeProfessions.find(p => p.id === field.value);
                    
                    return (
                      <FormItem className="flex flex-col">
                        <FormLabel>Profissão *</FormLabel>
                        <Popover open={professionPopoverOpen} onOpenChange={setProfessionPopoverOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                data-testid="select-profession"
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {selectedProfession ? (
                                  <>
                                    <span className="text-xs text-muted-foreground mr-2">
                                      {selectedProfession.category}
                                    </span>
                                    {selectedProfession.name}
                                  </>
                                ) : (
                                  "Digite para buscar uma profissão..."
                                )}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[400px] p-0">
                            <Command>
                              <CommandInput 
                                placeholder="Buscar profissão..." 
                                data-testid="input-search-profession"
                              />
                              <CommandList>
                                <CommandEmpty>Nenhuma profissão encontrada.</CommandEmpty>
                                <CommandGroup>
                                  {activeProfessions.map((profession) => (
                                    <CommandItem
                                      key={profession.id}
                                      value={`${profession.category} ${profession.name}`}
                                      onSelect={() => {
                                        form.setValue("professionId", profession.id);
                                        setProfessionPopoverOpen(false);
                                      }}
                                      data-testid={`profession-option-${profession.id}`}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          profession.id === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      <span className="text-xs text-muted-foreground mr-2">
                                        {profession.category}
                                      </span>
                                      {profession.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                {selectedProfession?.union && (
                  <FormItem>
                    <FormLabel>Sindicato</FormLabel>
                    <FormControl>
                      <Input value={selectedProfession.union} disabled className="bg-muted" />
                    </FormControl>
                  </FormItem>
                )}

                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empresa</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-company">
                            <SelectValue placeholder="Selecione uma empresa" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.isArray(companies) && companies.map((company: any) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-client">
                            <SelectValue placeholder="Selecione o cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients?.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recruiterId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recrutador</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-recruiter">
                            <SelectValue placeholder="Selecione um recrutador" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.isArray(recruiters) && recruiters.map((recruiter: any) => (
                            <SelectItem key={recruiter.id} value={recruiter.id}>
                              {recruiter.firstName} {recruiter.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Seção 2: Detalhes da Vaga */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Detalhes da Vaga</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="openingDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Abertura</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-opening-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Início</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-start-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="openingReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motivo da Abertura</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-opening-reason">
                            <SelectValue placeholder="Selecione o motivo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="substituicao">Substituição</SelectItem>
                          <SelectItem value="aumento_quadro">Aumento de Quadro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vacancyQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade de Vagas</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" placeholder="1" {...field} data-testid="input-vacancy-quantity" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ageRangeMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Idade Mínima</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="18" {...field} data-testid="input-age-min" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ageRangeMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Idade Máxima</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="65" {...field} data-testid="input-age-max" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sexo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-gender">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="feminino">Feminino</SelectItem>
                          <SelectItem value="indiferente">Indiferente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departamento</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-department">
                            <SelectValue placeholder="Selecione um departamento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Design">Design</SelectItem>
                          <SelectItem value="Vendas">Vendas</SelectItem>
                          <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
                          <SelectItem value="Financeiro">Financeiro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-location">
                            <SelectValue placeholder="Selecione a cidade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contractType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Contrato</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-contract-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="clt">CLT</SelectItem>
                          <SelectItem value="pj">PJ</SelectItem>
                          <SelectItem value="freelancer">Freelancer</SelectItem>
                          <SelectItem value="estagio">Estágio</SelectItem>
                          <SelectItem value="temporario">Temporário</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jobType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Vaga</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-job-type">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="produtiva">PRODUTIVA - Faturar</SelectItem>
                          <SelectItem value="improdutiva">IMPRODUTIVA - Sem faturar</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {Array.isArray(costCenters) && costCenters.length > 0 && (
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="costCenterId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Centro de Custo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-cost-center">
                              <SelectValue placeholder="Selecione um centro de custo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {costCenters.map((center: any) => (
                              <SelectItem key={center.id} value={center.id}>
                                {center.name} ({center.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="specifications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Especificações da Vaga</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva as especificações detalhadas da vaga..."
                          className="min-h-[100px]"
                          {...field}
                          data-testid="input-specifications"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva as responsabilidades e requisitos da vaga..."
                          className="min-h-[100px]"
                          {...field}
                          data-testid="input-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Seção 3: Condições de Trabalho */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Condições de Trabalho</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="workScale"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Escala de Trabalho</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-work-scale">
                            <SelectValue placeholder="Selecione a escala" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="5x1">5x1</SelectItem>
                          <SelectItem value="5x2">5x2</SelectItem>
                          <SelectItem value="6x1">6x1</SelectItem>
                          <SelectItem value="12x36">12x36</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="workHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário de Trabalho</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 08:00 às 17:00" {...field} data-testid="input-work-hours" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Seção 4: Remuneração e Benefícios */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Remuneração e Benefícios</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="salaryMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salário Mínimo (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="5000"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-salary-min"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salaryMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salário Máximo (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="8000"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-salary-max"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bonus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gratificação (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1000"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-bonus"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="hasHazardPay"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-hazard-pay"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Periculosidade</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="unhealthinessLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Insalubridade</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-unhealthiness">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="nao">Não</SelectItem>
                            <SelectItem value="10">10%</SelectItem>
                            <SelectItem value="20">20%</SelectItem>
                            <SelectItem value="40">40%</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium">Benefícios</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="hasMealVoucher"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-meal-voucher"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Vale Alimentação</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hasFoodVoucher"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-food-voucher"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Vale Refeição</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hasTransportVoucher"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-transport-voucher"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Vale Transporte</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hasHealthInsurance"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-health-insurance"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Plano de Saúde</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-status">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="active">Ativa/Publicada</SelectItem>
                      <SelectItem value="paused">Pausada</SelectItem>
                      <SelectItem value="closed">Fechada</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} data-testid="button-cancel">
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createJobMutation.isPending || updateJobMutation.isPending}
                data-testid="button-save"
              >
                {(createJobMutation.isPending || updateJobMutation.isPending) && (
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                )}
                {isEditing ? "Atualizar Vaga" : "Criar Vaga"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
