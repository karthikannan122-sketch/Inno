import { Project, Profile } from '../types/database';

export const calculateMatchScore = (project: Project, user?: Profile | null): number => {
  if (!user || !user.interests || user.interests.length === 0) return 75;

  let score = 50;

  // Category match
  if (user.interests.some(i => i.toLowerCase() === project.category.toLowerCase())) {
    score += 30;
  }

  // Tag match
  if (project.tags && project.tags.length > 0) {
    const matchingTags = project.tags.filter(tag =>
      user.interests?.some(i => i.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(i.toLowerCase()))
    );
    score += Math.min(matchingTags.length * 10, 20);
  }

  return Math.min(Math.max(score, 40), 99);
};

export const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case 'technology':
    case 'artificial intelligence':
      return { border: 'border-[#5577E6]', text: 'text-[#5577E6]', bg: 'bg-[#5577E6]/10' };
    case 'sustainability':
    case 'climate':
      return { border: 'border-[#4FA89B]', text: 'text-[#4FA89B]', bg: 'bg-[#4FA89B]/10' };
    case 'education':
      return { border: 'border-[#6875E8]', text: 'text-[#6875E8]', bg: 'bg-[#6875E8]/10' };
    case 'healthcare':
      return { border: 'border-[#E96B7A]', text: 'text-[#E96B7A]', bg: 'bg-[#E96B7A]/10' };
    default:
      return { border: 'border-[#E8B653]', text: 'text-[#E8B653]', bg: 'bg-[#E8B653]/10' };
  }
};
