import { ReactNode, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Brain,
  LogOut,
  Search,
  AlertTriangle,
  TrendingUp,
  Lightbulb,
  Target,
  FileText,
  Network,
  FolderOpen
} from 'lucide-react';

interface Tab {
  id: string;
  name: string;
  icon: ReactNode;
}

const tabs: Tab[] = [
  { id: 'workspaces', name: 'Workspaces', icon: <FolderOpen className="w-5 h-5" /> },
  { id: 'gaps', name: 'Research Gaps', icon: <Search className="w-5 h-5" /> },
  { id: 'contradictions', name: 'Contradictions', icon: <AlertTriangle className="w-5 h-5" /> },
  { id: 'evolution', name: 'Evolution Timeline', icon: <TrendingUp className="w-5 h-5" /> },
  { id: 'simulation', name: 'Idea Simulation', icon: <Lightbulb className="w-5 h-5" /> },
  { id: 'impact', name: 'Impact Predictor', icon: <Target className="w-5 h-5" /> },
  { id: 'brief', name: 'Research Brief', icon: <FileText className="w-5 h-5" /> },
  { id: 'graph', name: 'Knowledge Graph', icon: <Network className="w-5 h-5" /> },
];

interface DashboardLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function DashboardLayout({ children, activeTab, onTabChange }: DashboardLayoutProps) {
  const { signOut, user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-800">ResearchPilot AI</h1>
                <p className="text-xs text-gray-500">Autonomous Research Intelligence</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
                    ${activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.icon}
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
