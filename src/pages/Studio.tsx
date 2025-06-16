import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MousePosition } from '../types/studio';
import { useImageUpload } from '../hooks/useImageUpload';
import { useProjects } from '../hooks/useProjects';
import { useProjectSearch } from '../hooks/useProjectSearch';
import { useProjectLimit } from '../hooks/useProjectLimit';
import { ApiUsageService, ApiUsage } from '../services/apiUsageService';
import ConfirmationModal from '../components/common/ConfirmationModal';
import SubscriptionModal from '../components/common/SubscriptionModal';
import ApiUsageModal from '../components/studio/ApiUsageModal';
import StudioHero from '../components/studio/StudioHero';
import StudioControlsBar from '../components/studio/StudioControlsBar';
import ImageUploadSection from '../components/studio/ImageUploadSection';
import ProjectsSection from '../components/studio/ProjectsSection';

const Studio: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const projectsSectionRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = React.useState<MousePosition>({ x: 0, y: 0 });
  const [apiUsage, setApiUsage] = useState<ApiUsage | null>(null);
  const [isLoadingApiUsage, setIsLoadingApiUsage] = useState(false);
  const [showApiUsageModal, setShowApiUsageModal] = useState(false);

  // Custom hooks for business logic
  const {
    uploadState,
    expandedElements,
    isCreatingProject,
    handleDrop,
    handleFileSelect,
    toggleElement,
    updateSelectedQuery,
    selectAllElements,
    clearImage,
    hasSelectedQueries,
    createNewProject
  } = useImageUpload();

  const {
    projects,
    setProjects,
    isLoadingProjects,
    editingProjectId,
    deleteModal,
    editInputRef,
    startEditingProject,
    handleProjectNameChange,
    handleProjectNameKeyDown,
    openDeleteModal,
    closeDeleteModal,
    confirmDeleteProject
  } = useProjects();

  const {
    filters,
    filteredProjects,
    updateSearchQuery,
    updateViewMode,
    clearSearch
  } = useProjectSearch(projects);

  // Project limit management
  const {
    canCreateProject,
    showSubscriptionModal,
    maxFreeProjects,
    handleCreateProjectAttempt,
    closeSubscriptionModal,
    handleDeleteProjectFromModal
  } = useProjectLimit(projects);

  // Load API usage data on component mount
  useEffect(() => {
    loadApiUsageData();
  }, []);

  const loadApiUsageData = async () => {
    try {
      setIsLoadingApiUsage(true);
      
      // Load user's API usage
      const userApiUsage = await ApiUsageService.getUserApiUsage();
      setApiUsage(userApiUsage);
    } catch (error) {
      console.error('Error loading API usage data:', error);
    } finally {
      setIsLoadingApiUsage(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePosition({
        x: (e.clientX - rect.left - rect.width / 2) / rect.width * 10,
        y: (e.clientY - rect.top - rect.height / 2) / rect.height * 10,
      });
    }
  };

  const handleCreateProject = () => {
    // Check project limit before creating
    const canCreate = handleCreateProjectAttempt();
    if (canCreate) {
      createNewProject(projects, setProjects, true);
      
      // Scroll to the projects section after a short delay to allow DOM update
      setTimeout(() => {
        projectsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
    // If canCreate is false, the subscription modal will be shown automatically
  };

  const handleDeleteProjectFromSubscriptionModal = () => {
    handleDeleteProjectFromModal();
    // User can now manually delete a project from the projects list
  };

  const handleShowApiUsageModal = () => {
    setShowApiUsageModal(true);
    // Refresh API usage data when showing the modal
    loadApiUsageData();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <div 
      ref={containerRef}
      className="pt-16 relative overflow-hidden bg-gradient-to-b from-white via-slate-50/30 to-white min-h-screen"
      onMouseMove={handleMouseMove}
    >
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-violet-100/40 to-blue-100/40 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <div className="absolute inset-0 opacity-[0.02]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="studio-dots" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="currentColor"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#studio-dots)" className="text-slate-600" />
          </svg>
        </div>
      </div>

      {/* Hero Section */}
      <StudioHero />

      {/* Controls Bar */}
      <StudioControlsBar
        projectCount={filteredProjects.length}
        searchQuery={filters.searchQuery}
        filters={filters}
        apiUsage={apiUsage}
        onClearSearch={clearSearch}
        onViewModeChange={updateViewMode}
        onShowApiUsage={handleShowApiUsageModal}
      />

      {/* Main Content */}
      <motion.div 
        className="max-w-7xl mx-auto px-6 lg:px-8 py-20 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Upload Section */}
          <motion.div 
            className="lg:col-span-1"
            variants={itemVariants}
          >
            <ImageUploadSection
              uploadState={uploadState}
              expandedElements={expandedElements}
              isCreatingProject={isCreatingProject}
              hasSelectedQueries={hasSelectedQueries}
              canCreateProject={canCreateProject}
              onDrop={handleDrop}
              onFileSelect={handleFileSelect}
              onClearImage={clearImage}
              onToggleElement={toggleElement}
              onUpdateSelectedQuery={updateSelectedQuery}
              onSelectAllElements={selectAllElements}
              onCreateProject={handleCreateProject}
            />
          </motion.div>
          
          {/* Projects Section */}
          <ProjectsSection
            projects={projects}
            filteredProjects={filteredProjects}
            isLoadingProjects={isLoadingProjects}
            filters={filters}
            editingProjectId={editingProjectId}
            editInputRef={editInputRef}
            onSearchChange={updateSearchQuery}
            onClearSearch={clearSearch}
            onStartEditing={startEditingProject}
            onProjectNameChange={handleProjectNameChange}
            onProjectNameKeyDown={handleProjectNameKeyDown}
            onDeleteProject={openDeleteModal}
            projectsSectionRef={projectsSectionRef}
          />
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteProject}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteModal.projectName}"? This action cannot be undone and will permanently remove the project and all its associated data.`}
        confirmText="Delete Project"
        cancelText="Cancel"
        type="danger"
        isLoading={deleteModal.isDeleting}
      />

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={closeSubscriptionModal}
        onDeleteProject={handleDeleteProjectFromSubscriptionModal}
        projectCount={projects.length}
        maxFreeProjects={maxFreeProjects}
      />

      {/* API Usage Modal */}
      <ApiUsageModal
        isOpen={showApiUsageModal}
        onClose={() => setShowApiUsageModal(false)}
        apiUsage={apiUsage}
        isLoading={isLoadingApiUsage}
      />
    </div>
  );
};

export default Studio;