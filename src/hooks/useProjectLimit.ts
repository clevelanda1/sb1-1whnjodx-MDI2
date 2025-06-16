import { useState, useEffect } from 'react';
import { Project } from '../types/studio';
import { useSubscription } from '../contexts/SubscriptionContext';

export const useProjectLimit = (projects: Project[]) => {
  const { subscription, limits } = useSubscription();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Get max projects from subscription tier
  const maxProjects = limits.projects;
  
  // Check if user has reached project limit
  const hasReachedLimit = projects.length >= maxProjects;

  // Check if user can create new project
  const canCreateProject = !hasReachedLimit;

  // Handle project creation attempt
  const handleCreateProjectAttempt = (): boolean => {
    if (canCreateProject) {
      return true; // Allow creation
    } else {
      setShowSubscriptionModal(true);
      return false; // Block creation
    }
  };

  // Close subscription modal
  const closeSubscriptionModal = () => {
    setShowSubscriptionModal(false);
  };

  // Handle delete project from modal
  const handleDeleteProjectFromModal = () => {
    setShowSubscriptionModal(false);
    // The actual deletion will be handled by the parent component
    // This just closes the modal so user can select which project to delete
  };

  return {
    hasReachedLimit,
    canCreateProject,
    showSubscriptionModal,
    maxFreeProjects: maxProjects, // Renamed from maxFreeProjects to maxProjects for clarity
    isSubscribed: subscription.tier !== 'free',
    handleCreateProjectAttempt,
    closeSubscriptionModal,
    handleDeleteProjectFromModal,
    subscription // Return the full subscription object for more detailed checks
  };
};