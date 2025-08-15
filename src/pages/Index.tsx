import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Building, TrendingUp, Zap, ArrowRight } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Redirect authenticated users to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Building className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-5xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
            Arremate Insight
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Análise inteligente de imóveis em leilão com IA. Avalie a viabilidade financeira, 
            riscos jurídicos e cenários de ROI em minutos.
          </p>
          
          <div className="flex items-center justify-center gap-4 mb-12">
            <Button size="lg" asChild>
              <a href="/auth">
                Começar agora
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="/auth">Fazer login</a>
            </Button>
          </div>
          
          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Building className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Análise Completa</h3>
              <p className="text-sm text-muted-foreground">Matrícula, edital e página do leiloeiro analisados por IA</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <h3 className="font-semibold mb-2">Cenários de ROI</h3>
              <p className="text-sm text-muted-foreground">Múltiplos cenários financeiros automatizados</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-accent-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Resultado Rápido</h3>
              <p className="text-sm text-muted-foreground">Relatório completo em minutos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
