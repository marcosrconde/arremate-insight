import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ReportContent } from '@/components/ReportContent';
import { Printer, AlertTriangle } from 'lucide-react';

interface AnalysisReportProps {
  analysisId: string;
}

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

export const AnalysisReport = ({ analysisId }: AnalysisReportProps): JSX.Element => {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Print</title>');
      printWindow.document.write('<link rel="stylesheet" href="/src/index.css">');
      printWindow.document.write('<link rel="stylesheet" href="/src/print.css">');
      printWindow.document.write('</head><body>');
      const reportElement = document.getElementById('report-content');
      if (reportElement) {
        printWindow.document.write(reportElement.innerHTML);
      }
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [analysisId]);

  const fetchAnalysis = async () => {
    try {
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('id', analysisId)
        .single();

      if (error) throw error;
      setAnalysis(data);
    } catch (error) {
      console.error('Error fetching analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Carregando relatório...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Análise não encontrada.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Relatório de Análise</h1>
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Imprimir / Salvar PDF
        </Button>
      </div>
      <div id="report-content">
        <ReportContent analysis={analysis} />
      </div>
    </div>
  );
};
