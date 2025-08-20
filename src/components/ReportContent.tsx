import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building, 
  FileText, 
  DollarSign, 
  Gavel,
  MapPin,
  Calculator,
  TrendingUp,
  AlertTriangle,
  Calendar,
  User,
  Scale,
  ShieldAlert,
  Info,
  Camera,
  Store,
  Sparkles,
  Map
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Analysis {
  id: string;
  property_id: string;
  analysis_name: string | null;
  lote_number: string | null;
  analysis_type: string;
  status: string;
  created_at: string;
  credits_used: number;
  url_matricula?: string;
  url_edital?: string;
  link_pag?: string;
  webhook_response?: any;
}

interface ReportContentProps {
  analysis: Analysis;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const ReportContent = ({ analysis }: ReportContentProps) => {
  const resultData = analysis?.webhook_response;
  let result = Array.isArray(resultData) ? resultData[0] : resultData;

  // Handle cases where the actual data is nested
  if (result && result.json) {
    result = result.json;
  }
  if (result && result.content) {
    result = result.content;
  }

  const matricula = result?.matricula;
  const edital = result?.edital;
  const financeiro = result?.financeiro;
  const juridico = result?.juridico;
  const amenidades = result?.amenidades;
  const valor_mercado = result?.valor_mercado;
  const valor_sugerido = result?.valor_sugerido;
  const resumo_bairro = result?.resumo_bairro;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>Análise de {analysis.analysis_name || `#${analysis.property_id}`}</CardTitle>
                <CardDescription>
                  Criado em {formatDate(analysis.created_at)}
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <Badge variant={analysis.status === 'completed' ? 'default' : 'secondary'}>
                {analysis.status === 'completed' ? 'Concluída' : 
                 analysis.status === 'processing' ? 'Processando' : 
                 analysis.status === 'failed' ? 'Falhou' : 'Pendente'}
              </Badge>
              <p className="text-sm text-muted-foreground mt-1">
                {analysis.credits_used} crédito{analysis.credits_used !== 1 ? 's' : ''} usado{analysis.credits_used !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {analysis.status !== 'completed' ? (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {analysis.status === 'processing' 
              ? 'Esta análise ainda está sendo processada. Os resultados aparecerão aqui quando estiverem prontos.'
              : analysis.status === 'failed'
              ? 'Falha ao processar esta análise. Entre em contato com o suporte.'
              : 'Esta análise está pendente de processamento.'}
          </AlertDescription>
        </Alert>
      ) : !result ? (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Resultados não encontrados para esta análise.
          </AlertDescription>
        </Alert>
      ) : (
        <Tabs defaultValue="resumo" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 no-print">
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="matricula">Matrícula</TabsTrigger>
            <TabsTrigger value="edital">Edital</TabsTrigger>
            <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
            <TabsTrigger value="juridico">Jurídico</TabsTrigger>
            <TabsTrigger value="mercado">Valor de Mercado</TabsTrigger>
            <TabsTrigger value="bairro">Bairro</TabsTrigger>
            <TabsTrigger value="amenidades">Amenidades</TabsTrigger>
          </TabsList>

          {/* Resumo */}
          <TabsContent value="resumo">
            <div className="grid gap-6">
              {financeiro?.resumo && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-success" />
                      Viabilidade do Investimento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-success/10 rounded-lg">
                        <p className="text-2xl font-bold text-success">
                          {financeiro.resumo.viabilidade}
                        </p>
                        <p className="text-sm text-muted-foreground">Viabilidade</p>
                      </div>
                      <div className="text-center p-4 bg-primary/10 rounded-lg">
                        <p className="text-2xl font-bold text-primary">
                          {financeiro.resumo.faixaROIAvista?.minimo}% - {financeiro.resumo.faixaROIAvista?.maximo}%
                        </p>
                        <p className="text-sm text-muted-foreground">ROI À Vista</p>
                      </div>
                      <div className="text-center p-4 bg-primary/10 rounded-lg">
                        <p className="text-2xl font-bold text-primary">
                          {financeiro.resumo.faixaROIFinanciado?.minimo}% - {financeiro.resumo.faixaROIFinanciado?.maximo}%
                        </p>
                        <p className="text-sm text-muted-foreground">ROI Financiado</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {valor_sugerido && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-primary" />
                      Valor Sugerido de Venda
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-center text-primary">
                      {formatCurrency(valor_sugerido)}
                    </p>
                    <p className="text-sm text-muted-foreground text-center mt-1">
                      Baseado em análise de mercado e dados do imóvel.
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {edital?.imovel && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        Informações do Imóvel
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Endereço:</span>
                          <span className="font-medium text-right">{edital.imovel.endereco}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tipo:</span>
                          <span className="font-medium">{edital.imovel.tipo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Área Total:</span>
                          <span className="font-medium">{edital.imovel.area_total_m2} m²</span>
                        </div>
                        {edital.imovel.area_privativa_m2 > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Área Privativa:</span>
                            <span className="font-medium">{edital.imovel.area_privativa_m2} m²</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {edital?.valores && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Gavel className="w-5 h-5 text-primary" />
                        Valores do Leilão
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Valor de Avaliação:</span>
                          <span className="font-bold text-lg">{formatCurrency(edital.valores.avaliacao)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Lance Mínimo (1º Leilão):</span>
                          <span className="font-medium">{formatCurrency(edital.valores.primeiro_leilao)}</span>
                        </div>
                        {edital.valores.segundo_leilao > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Lance Mínimo (2º Leilão):</span>
                            <span className="font-medium">{formatCurrency(edital.valores.segundo_leilao)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {(matricula || edital) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-destructive" />
                      Riscos e Observações
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {matricula && (
                      <div className="space-y-2">
                        <h4 className="font-semibold">Matrícula</h4>
                        {matricula.tem_indisponibilidade && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription>Imóvel com indisponibilidade.</AlertDescription></Alert>}
                        {matricula.tem_penhora && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription>Imóvel com penhora.</AlertDescription></Alert>}
                        {matricula.tem_arresto && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription>Imóvel com arresto.</AlertDescription></Alert>}
                        {matricula.tem_usufruto && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription>Imóvel com usufruto.</AlertDescription></Alert>}
                        {(!matricula.tem_indisponibilidade && !matricula.tem_penhora && !matricula.tem_arresto && !matricula.tem_usufruto) && <p className="text-sm text-muted-foreground">Nenhum risco encontrado na matrícula.</p>}
                      </div>
                    )}
                    {juridico && (
                      <div className="space-y-2">
                        <h4 className="font-semibold">Jurídico</h4>
                        {juridico.quantidade_processos > 0 ? (
                          <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              {`Encontrado(s) ${juridico.quantidade_processos} processo(s) envolvendo o ex-mutuário.`}
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <p className="text-sm text-muted-foreground">Não foram encontrados processos envolvendo o ex-mutuário.</p>
                        )}
                      </div>
                    )}
                    {edital && (
                      <div className="space-y-2">
                        <h4 className="font-semibold">Edital</h4>
                        <div className="text-sm">
                          <p><strong className="text-muted-foreground">Responsável por Débitos:</strong> {edital.responsavel_debitos}</p>
                        </div>
                        <div>
                          <strong className="text-muted-foreground">Observações:</strong>
                          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-1">
                            {edital.observacoes?.map((obs: string, index: number) => (
                              <li key={index}>{obs}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <strong className="text-muted-foreground">Evicção de Direitos:</strong>
                          <p className="text-sm text-muted-foreground mt-1">{edital.eviccao_direitos}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

            </div>
          </TabsContent>

          {/* Matrícula */}
          <TabsContent value="matricula">
            {matricula ? (
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Dados da Matrícula
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Descrição do Imóvel</h4>
                      <p className="text-sm text-muted-foreground">{matricula.descricao_imovel}</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Informações Físicas</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Possui construção:</span>
                            <span>{matricula.tem_construcao ? 'Sim' : 'Não'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Área do terreno:</span>
                            <span>{matricula.area_terreno} m²</span>
                          </div>
                          {matricula.area_privativa > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Área privativa:</span>
                              <span>{matricula.area_privativa} m²</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Último Proprietário</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Nome:</span>
                            <span>{matricula.nome_ultimo_comprador}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">CPF:</span>
                            <span>{matricula.documento_ultimo_comprador}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Valor da operação:</span>
                            <span>{formatCurrency(matricula.valor_total_ultima_operacao)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-semibold mb-2">Resumo Histórico</h4>
                      <p className="text-sm text-muted-foreground">{matricula.resumo_historico_averbacoes}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Dados da matrícula não disponíveis.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Edital */}
          <TabsContent value="edital">
            {edital ? (
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Informações do Edital
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Responsabilidade por Débitos</h4>
                      <p className="text-sm text-muted-foreground">{edital.responsavel_debitos}</p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-semibold mb-2">Formas de Pagamento</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {edital.formas_pagamento?.map((forma: string, index: number) => (
                          <li key={index}>{forma}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-semibold mb-2">Observações Importantes</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {edital.observacoes?.slice(0, 5).map((obs: string, index: number) => (
                          <li key={index}>{obs}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Dados do edital não disponíveis.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Financeiro */}
          <TabsContent value="financeiro">
            {financeiro?.cenarios ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-primary" />
                      Cenários Financeiros
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cenário</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Arrematação</TableHead>
                          <TableHead>Custo Total</TableHead>
                          <TableHead>Lucro Líquido</TableHead>
                          <TableHead>ROI</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {financeiro.cenarios
                          .slice() // Create a shallow copy to avoid mutating the original array
                          .sort((a: any, b: any) => {
                            if (a.tipo === 'À vista' && b.tipo !== 'À vista') {
                              return -1;
                            }
                            if (a.tipo !== 'À vista' && b.tipo === 'À vista') {
                              return 1;
                            }
                            return 0;
                          })
                          .map((cenario: any, index: number) => {
                            const getRoiColorClass = (roi: number) => {
                              if (roi < 20) return 'bg-red-100';
                              if (roi >= 20 && roi < 35) return 'bg-yellow-100';
                              return 'bg-green-100';
                            };

                            return (
                            <TableRow key={index} className={getRoiColorClass(cenario.roi)}>
                              <TableCell className="font-medium">{cenario.cenario}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{cenario.tipo}</Badge>
                              </TableCell>
                              <TableCell>{formatCurrency(cenario.valorArrematacao)}</TableCell>
                              <TableCell>{formatCurrency(cenario.custoTotal || cenario.custoTotalEfetivo)}</TableCell>
                              <TableCell>{formatCurrency(cenario.lucroLiquido)}</TableCell>
                              <TableCell className="font-bold text-success">{cenario.roi}%</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Dados financeiros não disponíveis.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Jurídico */}
          <TabsContent value="juridico">
            {juridico ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-primary" />
                    Análise Jurídica
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Tipo de Pessoa:</span>
                      <Badge variant="outline">{juridico.tipo_pessoa}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Quantidade de Processos:</span>
                      <Badge 
                        variant={juridico.quantidade_processos > 10 ? "destructive" : 
                                juridico.quantidade_processos > 5 ? "secondary" : "default"}
                      >
                        {juridico.quantidade_processos} processo{juridico.quantidade_processos !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    
                    {juridico.quantidade_processos > 0 && (
                      <Alert className={juridico.quantidade_processos > 10 ? "border-destructive" : ""}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          O ex-proprietário possui {juridico.quantidade_processos} processo{juridico.quantidade_processos !== 1 ? 's' : ''} judicial{juridico.quantidade_processos !== 1 ? 'is' : ''}. 
                          {juridico.quantidade_processos > 10 && " Este é um número elevado que pode indicar maior risco."}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Dados jurídicos não disponíveis.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Valor de Mercado */}
          <TabsContent value="mercado">
            {valor_mercado ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Análise de Valor de Mercado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-primary/10 rounded-lg">
                        <p className="text-xl font-bold text-primary">{formatCurrency(valor_mercado.valor_min_m2)}</p>
                        <p className="text-sm text-muted-foreground">Valor Mínimo m²</p>
                      </div>
                      <div className="text-center p-4 bg-primary/10 rounded-lg">
                        <p className="text-xl font-bold text-primary">{formatCurrency(valor_mercado.valor_med_m2)}</p>
                        <p className="text-sm text-muted-foreground">Valor Médio m²</p>
                      </div>
                      <div className="text-center p-4 bg-primary/10 rounded-lg">
                        <p className="text-xl font-bold text-primary">{formatCurrency(valor_mercado.valor_max_m2)}</p>
                        <p className="text-sm text-muted-foreground">Valor Máximo m²</p>
                      </div>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Área</TableHead>
                          <TableHead>Preço</TableHead>
                          <TableHead>Valor m²</TableHead>
                          <TableHead>Link</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {valor_mercado.list.map((item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{item.tipo}</TableCell>
                            <TableCell>{item.area_construida} m²</TableCell>
                            <TableCell>{formatCurrency(item.preco)}</TableCell>
                            <TableCell>{formatCurrency(item.valor_m2)}</TableCell>
                            <TableCell>
                              <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                Ver
                              </a>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Dados de valor de mercado não disponíveis.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Bairro */}
          <TabsContent value="bairro">
            {resumo_bairro ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Map className="w-5 h-5 text-primary" />
                    Resumo do Bairro
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: resumo_bairro.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />') }} />
                </CardContent>
              </Card>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Resumo do bairro não disponível.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Amenidades */}
          <TabsContent value="amenidades">
            {amenidades && amenidades.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Amenidades Próximas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <a
                      href={`https://www.openstreetmap.org/#map=14/${amenidades[0].lat}/${amenidades[0].lon}&layers=N&markers=${amenidades.filter((item: any) => item.lat && item.lon).map((item: any) => `${item.lat},${item.lon}`).join(';')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Ver mapa de amenidades
                    </a>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {amenidades
                        .filter((item: any) => item.tags?.name)
                        .map((item: any) => {
                          const amenityType = item.tags?.amenity || item.tags?.shop || item.tags?.leisure || item.type;
                          const translations: { [key: string]: string } = {
                            school: 'escola',
                            mall: 'shopping center',
                            supermarket: 'supermercado',
                            park: 'praça',
                            hospital: 'hospital',
                            pharmacy: 'farmácia',
                          };
                          const translatedType = translations[amenityType] || amenityType;

                          return (
                            <div key={item.id} className="p-3 bg-muted/50 rounded-lg flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                <Store className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-semibold text-sm">{item.tags.name}</p>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {translatedType}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Nenhuma amenidade encontrada nas proximidades.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
