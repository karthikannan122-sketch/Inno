import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useProjects } from '../../context/ProjectContext';

interface ProjectVoteButtonsProps {
  projectId: string;
  initialUpvotes?: number;
  initialDownvotes?: number;
  initialUserVote?: 'up' | 'down' | null;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'horizontal' | 'vertical';
  showLabels?: boolean;
}

export const ProjectVoteButtons: React.FC<ProjectVoteButtonsProps> = ({
  projectId,
  initialUpvotes = 0,
  initialDownvotes = 0,
  initialUserVote = null,
  size = 'md',
  layout = 'horizontal',
  showLabels = false
}) => {
  const { voteProject, getProjectById } = useProjects();
  const project = getProjectById(projectId);

  const upvotes = project?.upvotes_count ?? initialUpvotes;
  const downvotes = project?.downvotes_count ?? initialDownvotes;
  const userVote = project?.user_vote ?? initialUserVote;

  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (e: React.MouseEvent, type: 'up' | 'down') => {
    e.stopPropagation();
    if (isVoting) return;

    setIsVoting(true);
    try {
      if (type === 'up' && userVote !== 'up') {
        confetti({
          particleCount: 25,
          spread: 50,
          origin: { y: 0.8 },
          colors: ['#34A853', '#4285F4', '#FBBC05']
        });
      }
      await voteProject(projectId, type);
    } finally {
      setIsVoting(false);
    }
  };

  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  const iconSize = isSmall ? 'w-3.5 h-3.5' : isLarge ? 'w-4 h-4' : 'w-3.5 h-3.5';
  const textSize = isSmall ? 'text-[10px]' : isLarge ? 'text-xs' : 'text-[11px]';

  return (
    <div
      className={`inline-flex items-center rounded-xl border border-[#E5E0D6] bg-white p-0.5 shadow-subtle ${
        layout === 'vertical' ? 'flex-col gap-1' : 'flex-row gap-0.5'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Upvote Button */}
      <button
        type="button"
        disabled={isVoting}
        onClick={(e) => handleVote(e, 'up')}
        title="Upvote this project"
        className={`flex items-center gap-1 rounded-lg px-2 py-1 font-mono font-bold transition-all ${
          userVote === 'up'
            ? 'bg-[#34A853] text-white shadow-sm ring-1 ring-[#34A853]'
            : 'text-[#555768] hover:bg-[#34A853]/10 hover:text-[#34A853]'
        }`}
      >
        <ThumbsUp className={`${iconSize} ${userVote === 'up' ? 'fill-current' : ''}`} />
        <span className={textSize}>{upvotes}</span>
        {showLabels && <span className="text-[9px] uppercase tracking-wider">Upvote</span>}
      </button>

      {/* Dislike Button */}
      <button
        type="button"
        disabled={isVoting}
        onClick={(e) => handleVote(e, 'down')}
        title="Dislike this project"
        className={`flex items-center gap-1 rounded-lg px-2 py-1 font-mono font-bold transition-all ${
          userVote === 'down'
            ? 'bg-[#EA4335] text-white shadow-sm ring-1 ring-[#EA4335]'
            : 'text-[#555768] hover:bg-[#EA4335]/10 hover:text-[#EA4335]'
        }`}
      >
        <ThumbsDown className={`${iconSize} ${userVote === 'down' ? 'fill-current' : ''}`} />
        <span className={textSize}>{downvotes}</span>
        {showLabels && <span className="text-[9px] uppercase tracking-wider">Dislike</span>}
      </button>
    </div>
  );
};

