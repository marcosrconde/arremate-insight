import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { AnalysisForm } from '@/components/AnalysisForm';
import { AnalysisReport } from '@/components/AnalysisReport';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { LogOut, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Analysis {
  id: string;
  property_id: string;
  analysis_name: string | null;
  lote_number: string | null;
  analysis_type: string;
  status: string;
  created_at: string;
  credits_used: number;
}

const DashboardContent = () => {
  const { user, signOut, profile, loading: authLoading } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);
  const [showNewAnalysis, setShowNewAnalysis] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && !authLoading) {
      fetchAnalyses();
    }
  }, [user, authLoading]);

  const fetchAnalyses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('analyses')
        .select('id, property_id, analysis_name, lote_number, analysis_type, status, created_at, credits_used')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching analyses:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro ao carregar análises",
        });
        return;
      }

      setAnalyses(data || []);
      
      // Select first analysis if none selected
      if (data && data.length > 0 && !selectedAnalysis) {
        setSelectedAnalysis(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching analyses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewAnalysis = () => {
    setSelectedAnalysis(null);
    setShowNewAnalysis(true);
  };

  const handleAnalysisCreated = (analysisId: string) => {
    setShowNewAnalysis(false);
    setSelectedAnalysis(analysisId);
    fetchAnalyses(); // Refresh the list
  };

  const handleAnalysisSelected = (analysisId: string) => {
    setSelectedAnalysis(analysisId);
    setShowNewAnalysis(false);
  };

  const handleAnalysisDeleted = async (analysisId: string) => {
    try {
      const { error } = await supabase
        .from('analyses')
        .delete()
        .eq('id', analysisId);

      if (error) throw error;

      toast({
        title: "Análise excluída",
        description: "A análise foi excluída com sucesso.",
      });

      // Refetch analyses and handle selection
      const newAnalyses = analyses.filter(a => a.id !== analysisId);
      setAnalyses(newAnalyses);

      if (selectedAnalysis === analysisId) {
        if (newAnalyses.length > 0) {
          setSelectedAnalysis(newAnalyses[0].id);
        } else {
          setSelectedAnalysis(null);
          setShowNewAnalysis(true); // Or show empty state
        }
      }

    } catch (error: any) {
      console.error('Error deleting analysis:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: error.message || "Não foi possível excluir a análise.",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // Show loading screen while auth is loading
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  const { state: sidebarState } = useSidebar();
  const collapsed = sidebarState === "collapsed";

  return (
      <div className="min-h-screen w-full bg-background flex">
        <DashboardSidebar
          analyses={analyses}
          selectedAnalysis={selectedAnalysis}
          onAnalysisSelected={handleAnalysisSelected}
          onNewAnalysis={handleNewAnalysis}
          onAnalysisDeleted={handleAnalysisDeleted}
        />

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-card border-b border-border p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-xl font-semibold">Arremate Insight</h1>
                <p className="text-sm text-muted-foreground">
                  Análise inteligente de imóveis em leilão
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{profile?.full_name}</p>
                <p className="text-xs text-muted-foreground">
                  {profile?.credits || 0} créditos
                </p>
              </div>
              
              <Button variant="outline" size="sm" onClick={handleNewAnalysis}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Análise
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {showNewAnalysis ? (
              <AnalysisForm onAnalysisCreated={handleAnalysisCreated} />
            ) : selectedAnalysis ? (
              <AnalysisReport analysisId={selectedAnalysis} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <Plus className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Bem-vindo ao Arremate Insight</h2>
                    <p className="text-muted-foreground mb-4">
                      Comece criando sua primeira análise de imóvel
                    </p>
                    <Button onClick={handleNewAnalysis}>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar primeira análise
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
  );
}

const Dashboard = () => (
  <SidebarProvider style={{ "--sidebar-width": "18rem", "--sidebar-width-icon": "4rem" } as React.CSSProperties}>
    <DashboardContent />
  </SidebarProvider>
);

export default Dashboard;
