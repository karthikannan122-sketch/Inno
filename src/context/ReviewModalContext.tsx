import React, { createContext, useContext, useState } from 'react';
import { Project } from '../types/database';

interface ReviewModalContextType {
  reviewingProject: Project | null;
  openReviewModal: (project: Project) => void;
  closeReviewModal: () => void;
}

const ReviewModalContext = createContext<ReviewModalContextType | undefined>(undefined);

export const ReviewModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reviewingProject, setReviewingProject] = useState<Project | null>(null);

  const openReviewModal = (project: Project) => {
    setReviewingProject(project);
  };

  const closeReviewModal = () => {
    setReviewingProject(null);
  };

  return (
    <ReviewModalContext.Provider value={{ reviewingProject, openReviewModal, closeReviewModal }}>
      {children}
    </ReviewModalContext.Provider>
  );
};

export const useReviewModal = () => {
  const context = useContext(ReviewModalContext);
  if (!context) {
    throw new Error('useReviewModal must be used within a ReviewModalProvider');
  }
  return context;
};
