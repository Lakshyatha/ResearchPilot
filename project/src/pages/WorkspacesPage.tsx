import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Trash2, FileText, Upload } from 'lucide-react';

interface Workspace {
  id: string;
  name: string;
  description: string;
  created_at: string;
  paper_count?: number;
}

interface Paper {
  id: string;
  title: string;
  authors: { name: string }[];
  publication_date: string;
  abstract: string;
}

export function WorkspacesPage() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddPaperModal, setShowAddPaperModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newWorkspace, setNewWorkspace] = useState({ name: '', description: '' });
  const [newPaper, setNewPaper] = useState({
    title: '',
    authors: '',
    abstract: '',
    publication_date: '',
    doi: '',
    url: '',
  });

  useEffect(() => {
    loadWorkspaces();
  }, []);

  useEffect(() => {
    if (selectedWorkspace) {
      loadPapers(selectedWorkspace);
    }
  }, [selectedWorkspace]);

  const loadWorkspaces = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const workspacesWithCounts = await Promise.all(
        data.map(async (workspace) => {
          const { count } = await supabase
            .from('papers')
            .select('*', { count: 'exact', head: true })
            .eq('workspace_id', workspace.id);
          return { ...workspace, paper_count: count || 0 };
        })
      );
      setWorkspaces(workspacesWithCounts);
      if (workspacesWithCounts.length > 0 && !selectedWorkspace) {
        setSelectedWorkspace(workspacesWithCounts[0].id);
      }
    }
    setLoading(false);
  };

  const loadPapers = async (workspaceId: string) => {
    const { data } = await supabase
      .from('papers')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (data) {
      setPapers(data as unknown as Paper[]);
    }
  };

  const createWorkspace = async () => {
    if (!user || !newWorkspace.name) return;

    const { error } = await supabase.from('workspaces').insert({
      user_id: user.id,
      name: newWorkspace.name,
      description: newWorkspace.description,
    });

    if (!error) {
      setNewWorkspace({ name: '', description: '' });
      setShowCreateModal(false);
      loadWorkspaces();
    }
  };

  const deleteWorkspace = async (id: string) => {
    const { error } = await supabase.from('workspaces').delete().eq('id', id);

    if (!error) {
      loadWorkspaces();
      if (selectedWorkspace === id) {
        setSelectedWorkspace(null);
      }
    }
  };

  const addPaper = async () => {
    if (!selectedWorkspace || !newPaper.title) return;

    const authors = newPaper.authors.split(',').map(name => ({ name: name.trim() }));

    const { error } = await supabase.from('papers').insert({
      workspace_id: selectedWorkspace,
      title: newPaper.title,
      authors,
      abstract: newPaper.abstract,
      publication_date: newPaper.publication_date || null,
      doi: newPaper.doi,
      url: newPaper.url,
    });

    if (!error) {
      setNewPaper({
        title: '',
        authors: '',
        abstract: '',
        publication_date: '',
        doi: '',
        url: '',
      });
      setShowAddPaperModal(false);
      loadPapers(selectedWorkspace);
      loadWorkspaces();
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading workspaces...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Research Workspaces</h2>
          <p className="text-gray-600 mt-1">Organize your research papers into workspaces</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Workspace
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Workspaces</h3>
          <div className="space-y-2">
            {workspaces.map((workspace) => (
              <div
                key={workspace.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedWorkspace === workspace.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedWorkspace(workspace.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{workspace.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{workspace.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {workspace.paper_count} papers
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteWorkspace(workspace.id);
                    }}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedWorkspace ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Papers</h3>
                <button
                  onClick={() => setShowAddPaperModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Add Paper
                </button>
              </div>

              <div className="space-y-4">
                {papers.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No papers yet. Add your first paper to get started.</p>
                  </div>
                ) : (
                  papers.map((paper) => (
                    <div key={paper.id} className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">{paper.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {paper.authors?.map((a) => a.name).join(', ')}
                      </p>
                      {paper.publication_date && (
                        <p className="text-xs text-gray-500 mb-2">{paper.publication_date}</p>
                      )}
                      <p className="text-sm text-gray-700">{paper.abstract}</p>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Select a workspace to view papers</p>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Create New Workspace</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={newWorkspace.name}
                  onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="My Research Project"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newWorkspace.description}
                  onChange={(e) =>
                    setNewWorkspace({ ...newWorkspace, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Brief description of this workspace"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createWorkspace}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddPaperModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Add Research Paper</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={newPaper.title}
                  onChange={(e) => setNewPaper({ ...newPaper, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Paper title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Authors (comma-separated)
                </label>
                <input
                  type="text"
                  value={newPaper.authors}
                  onChange={(e) => setNewPaper({ ...newPaper, authors: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe, Jane Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Abstract</label>
                <textarea
                  value={newPaper.abstract}
                  onChange={(e) => setNewPaper({ ...newPaper, abstract: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Paper abstract"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Publication Date
                  </label>
                  <input
                    type="date"
                    value={newPaper.publication_date}
                    onChange={(e) =>
                      setNewPaper({ ...newPaper, publication_date: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">DOI</label>
                  <input
                    type="text"
                    value={newPaper.doi}
                    onChange={(e) => setNewPaper({ ...newPaper, doi: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="10.1234/example"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                <input
                  type="url"
                  value={newPaper.url}
                  onChange={(e) => setNewPaper({ ...newPaper, url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddPaperModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={addPaper}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Paper
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
