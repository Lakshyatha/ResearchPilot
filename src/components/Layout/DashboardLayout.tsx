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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand"><span className="dashboard-brand-mark"><Brain size={17} /></span><span>ResearchPilot</span></div>
        <div className="dashboard-label">Research desk</div>
        <nav className="dashboard-nav">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => onTabChange(tab.id)} className={`dashboard-nav-item ${activeTab === tab.id ? 'active' : ''}`}>
              {tab.icon}<span>{tab.name}</span>{activeTab === tab.id && <span className="dashboard-nav-pip" />}
            </button>
          ))}
        </nav>
        <div className="dashboard-sidebar-foot"><span className="status-dot" /> Workspace online</div>
      </aside>
      <main className="dashboard-main">
        <header className="dashboard-header"><div><span className="dashboard-kicker">Autonomous research intelligence / 01</span><h1>Good to see you, researcher.</h1></div><div className="dashboard-user"><span className="dashboard-avatar">{user?.email?.slice(0, 2).toUpperCase()}</span><span className="dashboard-email">{user?.email}</span><button onClick={() => setShowLogoutConfirm(true)} aria-label="Sign out" title="Sign out"><LogOut size={17} /></button></div></header>
        <div className="dashboard-content">{children}</div>
      </main>
      {showLogoutConfirm && (
        <div className="logout-modal-backdrop" role="presentation" onClick={() => setShowLogoutConfirm(false)}>
          <div className="logout-modal" role="dialog" aria-modal="true" aria-labelledby="logout-title" onClick={(event) => event.stopPropagation()}>
            <h2 id="logout-title">Sign out?</h2>
            <p>Your current research session will be closed.</p>
            <div className="logout-modal-actions">
              <button type="button" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              <button type="button" className="logout-confirm" onClick={() => signOut()}>Sign out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
