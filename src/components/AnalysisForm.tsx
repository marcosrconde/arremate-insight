import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Link, FileUp, AlertCircle, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';

interface AnalysisFormProps {
  onAnalysisCreated: (analysisId: string) => void;
}

export const AnalysisForm = ({ onAnalysisCreated }: AnalysisFormProps) => {
  const { user, profile, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [analysisType, setAnalysisType] = useState<'links' | 'upload'>('links');

  const handleLinksSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !profile) return;

    if (profile.credits < 1) {
      toast({
        variant: "destructive",
        title: "Créditos insuficientes",
        description: "Você precisa de pelo menos 1 crédito para fazer uma análise.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      // Create analysis record
      const { data: analysisData, error: analysisError } = await supabase
        .from('analyses')
        .insert({
          user_id: user.id,
          property_id: formData.get('id_imovel') as string,
          lote_number: formData.get('lote') as string,
          analysis_type: 'links',
          status: 'processing',
          url_matricula: formData.get('url_matricula') as string,
          url_edital: formData.get('url_edital') as string,
          link_pag: formData.get('link_pag') as string,
          credits_used: 1,
        })
        .select()
        .single();

      if (analysisError) throw analysisError;

      // Update user credits
      const { error: creditsError } = await supabase
        .from('profiles')
        .update({ credits: profile.credits - 1 })
        .eq('user_id', user.id);

      if (creditsError) throw creditsError;

      // Prepare payload for n8n webhook
      const webhookPayload = {
        url_matricula: formData.get('url_matricula'),
        url_edital: formData.get('url_edital'),
        link_pag: formData.get('link_pag'),
        id_imovel: formData.get('id_imovel'),
        lote: formData.get('lote'),
        opcao: 'links',
        analysis_id: analysisData.id,
        user_id: user.id
      };

      // Call n8n webhook
      const webhookResponse = await fetch('https://n8n-n8n.apuc7z.easypanel.host/webhook/408d03f5-77e9-445d-8582-5d19b33801dc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      });

      if (!webhookResponse.ok) {
        throw new Error('Falha ao processar análise');
      }

      const responseData = await webhookResponse.json();

      // Update analysis with response
      await supabase
        .from('analyses')
        .update({ 
          webhook_response: responseData,
          status: 'completed'
        })
        .eq('id', analysisData.id);

      // Process and store detailed results
      if (responseData && responseData.length > 0) {
        const result = responseData[0];
        await supabase
          .from('analysis_results')
          .insert({
            analysis_id: analysisData.id,
            matricula_data: result.matricula,
            edital_data: result.edital,
            financial_data: result.financeiro,
            juridico_data: result.juridico,
            raw_response: responseData
          });
      }

      await refreshProfile();
      onAnalysisCreated(analysisData.id);
      
      toast({
        title: "Análise criada com sucesso!",
        description: "A análise está sendo processada.",
      });

    } catch (error: any) {
      console.error('Error creating analysis:', error);
      
      toast({
        variant: "destructive",
        title: "Erro ao criar análise",
        description: error.message || "Tente novamente mais tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implement file upload functionality
    toast({
      title: "Em desenvolvimento",
      description: "A funcionalidade de upload estará disponível em breve.",
    });
  };

  if (!profile) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Nova Análise de Imóvel
          </CardTitle>
          <CardDescription>
            Escolha como deseja enviar os dados para análise. Você possui {profile.credits} crédito{profile.credits !== 1 ? 's' : ''} disponível{profile.credits !== 1 ? 'eis' : ''}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profile.credits < 1 && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Você não possui créditos suficientes para fazer uma análise. Entre em contato para adquirir mais créditos.
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={analysisType} onValueChange={(value) => setAnalysisType(value as 'links' | 'upload')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="links" className="flex items-center gap-2">
                <Link className="w-4 h-4" />
                Enviar Links
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload de Arquivos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="links" className="space-y-4 mt-6">
              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Opção 1: Envio de Links</h4>
                <p className="text-sm text-muted-foreground">
                  Envie os links diretos da matrícula, edital e página do leiloeiro.
                </p>
              </div>

              <form onSubmit={handleLinksSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="id_imovel">ID do Imóvel *</Label>
                    <Input
                      id="id_imovel"
                      name="id_imovel"
                      placeholder="10145076"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lote">Número do Lote</Label>
                    <Input
                      id="lote"
                      name="lote"
                      placeholder="20"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url_matricula">URL da Matrícula *</Label>
                  <Input
                    id="url_matricula"
                    name="url_matricula"
                    type="url"
                    placeholder="https://venda-imoveis.caixa.gov.br/editais/matricula/..."
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url_edital">URL do Edital *</Label>
                  <Input
                    id="url_edital"
                    name="url_edital"
                    type="url"
                    placeholder="https://venda-imoveis.caixa.gov.br/editais/regras-VOL/..."
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="link_pag">Link da Página do Leiloeiro *</Label>
                  <Input
                    id="link_pag"
                    name="link_pag"
                    type="url"
                    placeholder="https://venda-imoveis.caixa.gov.br/sistema/detalhe-imovel.asp..."
                    required
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || profile.credits < 1}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Processando análise...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Iniciar Análise (1 crédito)
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="upload" className="space-y-4 mt-6">
              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Opção 2: Upload de Arquivos</h4>
                <p className="text-sm text-muted-foreground">
                  Faça upload dos arquivos da matrícula e edital, e forneça o link da página.
                </p>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="upload_id_imovel">ID do Imóvel *</Label>
                    <Input
                      id="upload_id_imovel"
                      name="id_imovel"
                      placeholder="10145076"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="upload_lote">Número do Lote</Label>
                    <Input
                      id="upload_lote"
                      name="lote"
                      placeholder="20"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="matricula_file">Arquivo da Matrícula *</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <FileUp className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Clique para selecionar ou arraste o arquivo aqui
                    </p>
                    <input
                      type="file"
                      id="matricula_file"
                      name="matricula_file"
                      accept=".pdf"
                      className="hidden"
                      disabled={isLoading}
                    />
                    <Label htmlFor="matricula_file" className="cursor-pointer text-primary hover:underline">
                      Selecionar arquivo PDF
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edital_file">Arquivo do Edital *</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <FileUp className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Clique para selecionar ou arraste o arquivo aqui
                    </p>
                    <input
                      type="file"
                      id="edital_file"
                      name="edital_file"
                      accept=".pdf"
                      className="hidden"
                      disabled={isLoading}
                    />
                    <Label htmlFor="edital_file" className="cursor-pointer text-primary hover:underline">
                      Selecionar arquivo PDF
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="upload_link_pag">Link da Página do Leiloeiro *</Label>
                  <Input
                    id="upload_link_pag"
                    name="link_pag"
                    type="url"
                    placeholder="https://venda-imoveis.caixa.gov.br/sistema/detalhe-imovel.asp..."
                    required
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={true} // Disabled for now
                >
                  <FileUp className="w-4 h-4 mr-2" />
                  Em breve - Upload de Arquivos
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};