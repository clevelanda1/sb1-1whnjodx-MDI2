import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, XCircle, Loader2, Edit2, Trash2, FolderOpen, X } from 'lucide-react';
import { Project, ProjectFilters } from '../../types/studio';
import Button from '../common/Button';
import AIProcessingAnimation from './AIProcessingAnimation';

interface ProjectsSectionProps {
  projects: Project[];
  filteredProjects: Project[];
  isLoadingProjects: boolean;
  filters: ProjectFilters;
  editingProjectId: string | null;
  editInputRef: React.RefObject<HTMLInputElement>;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  onStartEditing: (projectId: string) => void;
  onProjectNameChange: (projectId: string, newName: string) => void;
  onProjectNameKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, projectId: string) => void;
  onDeleteProject: (projectId: string, projectName: string) => void;
}

const ProjectsSection: React.FC<ProjectsSectionProps & { projectsSectionRef: React.RefObject<HTMLDivElement> }> = ({
  projects,
  filteredProjects,
  isLoadingProjects,
  filters,
  editingProjectId,
  editInputRef,
  onSearchChange,
  onClearSearch,
  onStartEditing,
  onProjectNameChange,
  onProjectNameKeyDown,
  onDeleteProject,
  projectsSectionRef
}) => {
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <motion.div 
      className="lg:col-span-2"
      variants={itemVariants}
      ref={projectsSectionRef}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
        <h2 className="font-light text-3xl text-slate-900">Your <span className="font-semibold">Projects</span></h2>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={filters.searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-3 border border-slate-300/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 bg-white/60 backdrop-blur-sm transition-all duration-300 text-sm w-64"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            {filters.searchQuery && (
              <motion.button
                onClick={onClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <XCircle size={16} />
              </motion.button>
            )}
          </div>
        </div>
      </div>
      
      {isLoadingProjects ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3 text-slate-600">
            <Loader2 className="animate-spin text-violet-600" size={20} />
            <span className="font-medium">Loading projects...</span>
          </div>
        </div>
      ) : (
        <div className={`${
          filters.viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 gap-8' 
            : 'space-y-6'
        }`}>
          <AnimatePresence>
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                className={`bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-slate-900/5 transition-all duration-500 group relative ${
                  filters.viewMode === 'list' ? 'flex' : ''
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                whileHover={{ y: -4, scale: filters.viewMode === 'grid' ? 1.01 : 1 }}
                onMouseEnter={() => setHoveredProject(project.id)}
                onMouseLeave={() => setHoveredProject(null)}
              >
                {/* Delete button for analyzing projects - only shows on hover */}
                <AnimatePresence>
                  {project.status === 'analyzing' && hoveredProject === project.id && (
                    <motion.button
                      onClick={() => onDeleteProject(project.id, project.name)}
                      className="absolute top-4 right-4 z-20 w-8 h-8 bg-red-500/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Cancel project creation"
                      transition={{ duration: 0.2 }}
                    >
                      <X size={14} />
                    </motion.button>
                  )}
                </AnimatePresence>

                <div className={`relative overflow-hidden ${
                  filters.viewMode === 'list' ? 'w-48 flex-shrink-0' : 'h-48'
                }`}>
                  {project.status === 'analyzing' ? (
                    <AIProcessingAnimation />
                  ) : (
                    <motion.img 
                      src={project.image_url || '/api/placeholder/400/300'} 
                      alt={project.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  
                  <motion.div 
                    className="absolute inset-0 bg-slate-900/70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center"
                    initial={false}
                  >
                    {project.status === 'complete' ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-3"
                      >
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-white/90 text-slate-900 hover:bg-white font-medium px-6 py-3 rounded-2xl shadow-lg backdrop-blur-sm"
                          onClick={() => window.location.href = `/curation?project=${project.id}`}
                        >
                          View Project
                        </Button>
                        <motion.button
                          onClick={() => onDeleteProject(project.id, project.name)}
                          className="p-3 bg-red-500/90 text-white rounded-2xl hover:bg-red-600 transition-colors shadow-lg backdrop-blur-sm"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </motion.div>
                    ) : project.status === 'analyzing' ? (
                      <motion.div 
                        className="flex items-center space-x-3 text-white"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <Loader2 className="animate-spin" size={20} />
                        <span className="font-medium">AI Agent Working...</span>
                      </motion.div>
                    ) : (
                      <motion.div 
                        className="flex items-center space-x-3 text-red-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <span className="font-medium">Processing Error</span>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
                
                <div className={`p-6 ${filters.viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className="flex items-center justify-between mb-3">
                    {editingProjectId === project.id ? (
                      <input
                        ref={editInputRef}
                        type="text"
                        defaultValue={project.name}
                        className="font-semibold text-xl text-slate-900 w-full border-b-2 border-violet-500 focus:outline-none bg-transparent pb-1"
                        onBlur={(e) => onProjectNameChange(project.id, e.target.value)}
                        onKeyDown={(e) => onProjectNameKeyDown(e, project.id)}
                      />
                    ) : (
                      <>
                        <h3 className={`font-semibold text-slate-900 ${
                          filters.viewMode === 'list' ? 'text-lg' : 'text-xl'
                        }`}>
                          {project.name}
                        </h3>
                        {project.status !== 'analyzing' && (
                          <motion.button
                            onClick={() => onStartEditing(project.id)}
                            className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50/60 rounded-full transition-all duration-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Edit2 size={16} />
                          </motion.button>
                        )}
                      </>
                    )}
                  </div>
                  <div className={`flex ${
                    filters.viewMode === 'list' ? 'flex-col space-y-2' : 'justify-between items-center'
                  } text-sm`}>
                    <span className="text-slate-500 font-medium">
                      {new Date(project.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                      project.status === 'analyzing' 
                        ? 'bg-violet-100/80 text-violet-700' 
                        : project.status === 'complete'
                        ? 'bg-emerald-100/80 text-emerald-700'
                        : 'bg-red-100/80 text-red-700'
                    }`}>
                      {project.status === 'analyzing' ? 'AI Agent Working...' : 
                       project.status === 'complete' ? 'Ready to view' : 'Error'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredProjects.length === 0 && !isLoadingProjects && (
            <motion.div 
              className="col-span-2 text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ease: "easeOut" }}
            >
              <div className="text-slate-400 mb-4">
                {filters.searchQuery ? <Search size={48} className="mx-auto" /> : <FolderOpen size={48} className="mx-auto" />}
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">
                {filters.searchQuery ? 'No projects found' : 'Create your first project'}
              </h3>
              <p className="text-slate-600 font-light">
                {filters.searchQuery 
                  ? `No projects match "${filters.searchQuery}". Try a different search term.`
                  : 'Upload your first image to get started with MDI from both Amazon and Etsy.'
                }
              </p>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default ProjectsSection;