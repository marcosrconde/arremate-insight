import { useState } from 'react';
import { 
  Building, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  Plus,
  Calendar
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Analysis {
  id: string;
  property_id: string;
  lote_number: string | null;
  analysis_type: string;
  status: string;
  created_at: string;
  credits_used: number;
}

interface DashboardSidebarProps {
  analyses: Analysis[];
  selectedAnalysis: string | null;
  onAnalysisSelected: (analysisId: string) => void;
  onNewAnalysis: () => void;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-success" />;
    case 'failed':
      return <XCircle className="w-4 h-4 text-destructive" />;
    case 'processing':
      return <Clock className="w-4 h-4 text-warning animate-pulse" />;
    default:
      return <Clock className="w-4 h-4 text-muted-foreground" />;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Concluída';
    case 'failed':
      return 'Falhou';
    case 'processing':
      return 'Processando';
    case 'pending':
      return 'Pendente';
    default:
      return status;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-success/10 text-success border-success/20';
    case 'failed':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    case 'processing':
      return 'bg-warning/10 text-warning border-warning/20';
    default:
      return 'bg-muted text-muted-foreground border-muted';
  }
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

export const DashboardSidebar = ({ 
  analyses, 
  selectedAnalysis, 
  onAnalysisSelected, 
  onNewAnalysis 
}: DashboardSidebarProps) => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar className={collapsed ? "w-16" : "w-80"} collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Building className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-semibold text-sidebar-foreground">Análises</h2>
              <p className="text-xs text-sidebar-foreground/70">
                {analyses.length} análise{analyses.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
        
        {!collapsed && (
          <Button 
            onClick={onNewAnalysis}
            className="mt-4 w-full bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Análise
          </Button>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Histórico de Análises</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <ScrollArea className="h-[calc(100vh-200px)]">
                {analyses.length === 0 ? (
                  <div className="p-4 text-center text-sm text-sidebar-foreground/70">
                    {!collapsed ? (
                      <>
                        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>Nenhuma análise ainda</p>
                        <p className="text-xs mt-1">Crie sua primeira análise</p>
                      </>
                    ) : (
                      <FileText className="w-6 h-6 mx-auto opacity-50" />
                    )}
                  </div>
                ) : (
                  analyses.map((analysis) => (
                    <SidebarMenuItem key={analysis.id}>
                      <SidebarMenuButton
                        onClick={() => onAnalysisSelected(analysis.id)}
                        className={`w-full p-3 text-left hover:bg-sidebar-accent transition-colors ${
                          selectedAnalysis === analysis.id
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground border-l-4 border-l-sidebar-primary'
                            : 'text-sidebar-foreground'
                        }`}
                      >
                        <div className="flex items-start gap-3 w-full">
                          {getStatusIcon(analysis.status)}
                          
                          {!collapsed && (
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm truncate">
                                  ID: {analysis.property_id}
                                </span>
                                {analysis.lote_number && (
                                  <Badge variant="outline" className="text-xs px-1 py-0">
                                    Lote {analysis.lote_number}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2 mb-2">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getStatusColor(analysis.status)}`}
                                >
                                  {getStatusLabel(analysis.status)}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {analysis.analysis_type === 'links' ? 'Links' : 'Upload'}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-1 text-xs text-sidebar-foreground/70">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(analysis.created_at)}</span>
                              </div>
                              
                              <div className="text-xs text-sidebar-foreground/70 mt-1">
                                {analysis.credits_used} crédito{analysis.credits_used !== 1 ? 's' : ''}
                              </div>
                            </div>
                          )}
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                )}
              </ScrollArea>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};