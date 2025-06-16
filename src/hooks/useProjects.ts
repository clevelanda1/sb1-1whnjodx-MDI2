import { useState, useEffect, useRef } from 'react';
import { Project } from '../types/studio';
import { DeleteModalState } from '../types/studio';
import { ProjectService } from '../services/projectService';
import { useAuth } from '../contexts/AuthContext';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    projectId: null,
    projectName: '',
    isDeleting: false
  });
  const editInputRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated } = useAuth();

  // Load projects on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadProjects();
    }
  }, [isAuthenticated]);

  const loadProjects = async () => {
    try {
      setIsLoadingProjects(true);
      const projectsData = await ProjectService.getProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const startEditingProject = (projectId: string) => {
    setEditingProjectId(projectId);
    setTimeout(() => {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }, 100);
  };

  const handleProjectNameChange = async (projectId: string, newName: string) => {
    try {
      await ProjectService.updateProject(projectId, { name: newName });
      setProjects(prev => prev.map(project =>
        project.id === projectId
          ? { ...project, name: newName }
          : project
      ));
      setEditingProjectId(null);
    } catch (error) {
      console.error('Error updating project name:', error);
    }
  };

  const handleProjectNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, projectId: string) => {
    if (e.key === 'Enter') {
      handleProjectNameChange(projectId, e.currentTarget.value);
    } else if (e.key === 'Escape') {
      setEditingProjectId(null);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (projectId: string, projectName: string) => {
    setDeleteModal({
      isOpen: true,
      projectId,
      projectName,
      isDeleting: false
    });
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    if (!deleteModal.isDeleting) {
      setDeleteModal({
        isOpen: false,
        projectId: null,
        projectName: '',
        isDeleting: false
      });
    }
  };

  // Confirm and execute project deletion
  const confirmDeleteProject = async () => {
    if (!deleteModal.projectId) return;

    try {
      setDeleteModal(prev => ({ ...prev, isDeleting: true }));
      
      await ProjectService.deleteProject(deleteModal.projectId);
      
      // Remove from local state
      setProjects(prev => prev.filter(project => project.id !== deleteModal.projectId));
      
      // Close modal
      setDeleteModal({
        isOpen: false,
        projectId: null,
        projectName: '',
        isDeleting: false
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  return {
    projects,
    setProjects,
    filteredProjects,
    setFilteredProjects,
    isLoadingProjects,
    editingProjectId,
    deleteModal,
    editInputRef,
    loadProjects,
    startEditingProject,
    handleProjectNameChange,
    handleProjectNameKeyDown,
    openDeleteModal,
    closeDeleteModal,
    confirmDeleteProject
  };
};