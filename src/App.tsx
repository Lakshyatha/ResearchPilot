import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthPage } from './components/Auth/AuthPage';
import { DashboardLayout } from './components/Layout/DashboardLayout';
import { WorkspacesPage } from './pages/WorkspacesPage';
import { ResearchGapsPage } from './pages/ResearchGapsPage';
import { ContradictionsPage } from './pages/ContradictionsPage';
import { EvolutionTimelinePage } from './pages/EvolutionTimelinePage';
import { IdeaSimulationPage } from './pages/IdeaSimulationPage';
import { ImpactPredictorPage } from './pages/ImpactPredictorPage';
import { ResearchBriefPage } from './pages/ResearchBriefPage';
import { KnowledgeGraphPage } from './pages/KnowledgeGraphPage';

function MainApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('workspaces');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'workspaces':
        return <WorkspacesPage />;
      case 'gaps':
        return <ResearchGapsPage />;
      case 'contradictions':
        return <ContradictionsPage />;
      case 'evolution':
        return <EvolutionTimelinePage />;
      case 'simulation':
        return <IdeaSimulationPage />;
      case 'impact':
        return <ImpactPredictorPage />;
      case 'brief':
        return <ResearchBriefPage />;
      case 'graph':
        return <KnowledgeGraphPage />;
      default:
        return <WorkspacesPage />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderPage()}
    </DashboardLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
