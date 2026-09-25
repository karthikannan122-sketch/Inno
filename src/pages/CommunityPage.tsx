import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  MessageSquare, 
  Bookmark, 
  Sparkles, 
  Send, 
  Share2, 
  ExternalLink, 
  Flame, 
  HelpCircle, 
  Lightbulb, 
  BarChart3, 
  Clock, 
  Tag, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Search, 
  Filter, 
  X, 
  CornerDownRight, 
  Heart, 
  ThumbsUp, 
  Rocket, 
  Trash2, 
  Flag, 
  Compass, 
  ArrowRight, 
  Smile, 
  RefreshCw,
  Award,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Bot
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { SlideUp, FadeIn } from '../components/common/MotionWrapper';
import { Badge } from '../components/common/Badge';
import { PostType, ReactionType, Discussion, DiscussionComment } from '../types/database';

export const CommunityPage: React.FC = () => {
  const routerNavigate = useNavigate();
  const { user } = useAuth();
  const { 
    discussions, 
    comments, 
    projects,
    createDiscussion, 
    addDiscussionComment, 
    reactToPost,
    toggleSavePost,
    toggleFollowDiscussion,
    votePoll,
    submitQuickIdeaFeedback,
    deleteDiscussion
  } = useProjects();

  // Navigation & Filtering State
  const [activeTab, setActiveTab] = useState<
    'for_you' | 'trending' | 'latest' | 'ideas' | 'questions' | 'discussions' | 'feedback_requests' | 'following' | 'saved'
  >('for_you');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedComments, setExpandedComments] = useState<{ [postId: string]: boolean }>({});
  const [expandedAiSummaries, setExpandedAiSummaries] = useState<{ [postId: string]: boolean }>({});
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeReactionPicker, setActiveReactionPicker] = useState<string | null>(null);
  const [replyingToCommentId, setReplyingToCommentId] = useState<{ [postId: string]: string | null }>({});

  // Followed Innovators State
  const [followedInnovators, setFollowedInnovators] = useState<{ [name: string]: boolean }>({
    'Elena Rostova': true,
    'Dr. Sarah Lin': false,
    'Marcus Chen': false,
    'David Kalu': false,
    'Amara Vance': false
  });

  // Composer Form State
  const [composerType, setComposerType] = useState<PostType>('idea');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Education');
  const [newTagsInput, setNewTagsInput] = useState('');
  const [attachedProjectId, setAttachedProjectId] = useState<string>('');
  
  // Type-specific Composer Fields
  const [pollOptionsInput, setPollOptionsInput] = useState<string[]>(['', '']);
  const [prevVersionInput, setPrevVersionInput] = useState('v1.0');
  const [newVersionInput, setNewVersionInput] = useState('v2.0');
  const [changesSummaryInput, setChangesSummaryInput] = useState('');
  const [resourceUrlInput, setResourceUrlInput] = useState('');
  const [resourceDomainInput, setResourceDomainInput] = useState('');
  const [resourceTypeInput, setResourceTypeInput] = useState('Research Paper & Spec');

  // AI Suggestions in Composer
  const [aiSuggestion, setAiSuggestion] = useState<{
    title?: string;
    content?: string;
    tags?: string[];
    summary?: string;
  } | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Comment Composer Inputs
  const [commentInputs, setCommentInputs] = useState<{ [id: string]: string }>({});
  const [replyInputs, setReplyInputs] = useState<{ [commentId: string]: string }>({});
  const [aiCommentSuggestion, setAiCommentSuggestion] = useState<{ [postId: string]: string }>({});
  const [isImprovingComment, setIsImprovingComment] = useState<{ [postId: string]: boolean }>({});

  // Toast / Feedback State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const categories = [
    'All',
    'Education',
    'Sustainability',
    'Health & BioTech',
    'AI & ML',
    'Tools & APIs',
    'Business Models',
    'Validation Strategy',
    'Product Design',
    'Growth'
  ];

  const trendingTopics = [
    '#ArtificialIntelligence',
    '#EdTech',
    '#Sustainability',
    '#HealthTech',
    '#OpenSource',
    '#ZeroWaste',
    '#MultiAgent',
    '#Validation'
  ];

  const discoverInnovators = [
    {
      name: 'Elena Rostova',
      role: 'Research Fellow & EdTech Specialist',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      projectsCount: 3,
      contributionsCount: 28,
      topics: ['EdTech', 'ActiveRecall', 'AI']
    },
    {
      name: 'Dr. Sarah Lin',
      role: 'Biomedical AI Researcher',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      projectsCount: 2,
      contributionsCount: 19,
      topics: ['HealthTech', 'Telemetry', 'Clinical']
    },
    {
      name: 'Marcus Chen',
      role: 'Founder & Climate Tech Lead',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      projectsCount: 4,
      contributionsCount: 34,
      topics: ['FoodTech', 'ZeroWaste', 'B2B']
    },
    {
      name: 'David Kalu',
      role: 'Senior ML Systems Engineer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      projectsCount: 2,
      contributionsCount: 15,
      topics: ['OpenSource', 'Datasets', 'LLM']
    },
    {
      name: 'Amara Vance',
      role: 'Autonomous Systems Architect',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      projectsCount: 3,
      contributionsCount: 22,
      topics: ['MultiAgent', 'Architecture', 'Strategy']
    }
  ];

  // Helper: Open Composer with a specific post type
  const openComposer = (type: PostType) => {
    setComposerType(type);
    setAiSuggestion(null);
    setShowCreateModal(true);
  };

  // Helper: Check duplicate / similar discussions in real time
  const similarDiscussions = useMemo(() => {
    if (!newTitle.trim() && !newContent.trim()) return [];
    const queryWords = `${newTitle} ${newContent}`
      .toLowerCase()
      .split(/\W+/)
      .filter(w => w.length > 3);
    
    if (queryWords.length === 0) return [];

    return discussions.filter(d => {
      const targetText = `${d.title} ${d.content}`.toLowerCase();
      const matchCount = queryWords.filter(w => targetText.includes(w)).length;
      return matchCount >= 2;
    }).slice(0, 2);
  }, [newTitle, newContent, discussions]);

  // AI Assistant for Post Creation (User Approval Required)
  const handleAiImprovePost = () => {
    if (!newContent.trim() && !newTitle.trim()) {
      showToast('Please enter some notes or content first.');
      return;
    }

    setIsGeneratingAi(true);
    setTimeout(() => {
      const polishedTitle = newTitle.trim() 
        ? `How might we ${newTitle.toLowerCase().replace(/^(how|what if|why)\s*/i, '')}?` 
        : `Autonomous Framework for ${newCategory} Validation`;
      
      const polishedContent = `Core Problem:\n${newContent || 'Refining our initial hypothesis based on peer validation data.'}\n\nProposed Direction:\n1. Standardize the data ingestion and user feedback loops.\n2. Measure retention impact across target user personas.\n\nOpen Question for INNOVEXA Innovators:\nWhat critical workflow constraints should we address first?`;

      const suggestedTags = [
        newCategory.replace(/\s+/g, ''),
        'Innovation',
        'ValidationLoop',
        'PeerReview'
      ];

      setAiSuggestion({
        title: polishedTitle,
        content: polishedContent,
        tags: suggestedTags
      });
      setIsGeneratingAi(false);
    }, 600);
  };

  const handleApplyAiSuggestion = () => {
    if (aiSuggestion) {
      if (aiSuggestion.title) setNewTitle(aiSuggestion.title);
      if (aiSuggestion.content) setNewContent(aiSuggestion.content);
      if (aiSuggestion.tags) setNewTagsInput(aiSuggestion.tags.join(', '));
      setAiSuggestion(null);
      showToast('AI suggestions applied! Review and submit whenever you are ready.');
    }
  };

  // Submit New Post
  const handlePublishPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) {
      showToast('Please provide some content for your post.');
      return;
    }

    const titleToUse = newTitle.trim() || `${composerType.toUpperCase()}: ${newContent.slice(0, 50)}...`;
    const parsedTags = newTagsInput
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const attachedProj = projects.find(p => p.id === attachedProjectId);
    const validPollOptions = pollOptionsInput.map(o => o.trim()).filter(Boolean);

    await createDiscussion(titleToUse, newContent.trim(), newCategory, {
      post_type: composerType,
      tags: parsedTags.length > 0 ? parsedTags : [newCategory, 'Innovation'],
      project_id: attachedProj?.id,
      project_title: attachedProj?.title,
      project_category: attachedProj?.category,
      poll_options: (composerType === 'poll' || composerType === 'feedback_request') && validPollOptions.length >= 2 
        ? validPollOptions 
        : undefined,
      project_update: composerType === 'project_update' ? {
        previous_version: prevVersionInput,
        new_version: newVersionInput,
        changes_summary: changesSummaryInput || 'Community-guided updates deployed.'
      } : undefined,
      resource: composerType === 'resource' ? {
        url: resourceUrlInput || 'https://innovexa.dev',
        source_domain: resourceDomainInput || 'github.com',
        resource_type: resourceTypeInput
      } : undefined
    });

    // Reset Form
    setNewTitle('');
    setNewContent('');
    setNewTagsInput('');
    setAttachedProjectId('');
    setPollOptionsInput(['', '']);
    setChangesSummaryInput('');
    setResourceUrlInput('');
    setResourceDomainInput('');
    setAiSuggestion(null);
    setShowCreateModal(false);
    showToast('Innovation post published to the community!');
  };

  // AI Comment Assistant ("Make my comment clearer")
  const handleAiImproveComment = (postId: string) => {
    const raw = commentInputs[postId]?.trim();
    if (!raw) {
      showToast('Please type a draft comment first.');
      return;
    }

    setIsImprovingComment(prev => ({ ...prev, [postId]: true }));
    setTimeout(() => {
      const polished = `Interesting perspective. Consider clarifying the core workflow: "${raw}". Focusing on concrete developer ergonomics and rapid iteration metrics will make this significantly easier to validate with early testers.`;
      setAiCommentSuggestion(prev => ({ ...prev, [postId]: polished }));
      setIsImprovingComment(prev => ({ ...prev, [postId]: false }));
    }, 500);
  };

  const handleApplyAiComment = (postId: string) => {
    const suggestion = aiCommentSuggestion[postId];
    if (suggestion) {
      setCommentInputs(prev => ({ ...prev, [postId]: suggestion }));
      setAiCommentSuggestion(prev => ({ ...prev, [postId]: '' }));
    }
  };

  // Submit Top-Level Comment
  const handleSendComment = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    await addDiscussionComment(postId, text);
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    setAiCommentSuggestion(prev => ({ ...prev, [postId]: '' }));
    setExpandedComments(prev => ({ ...prev, [postId]: true }));
    showToast('Perspective added!');
  };

  // Submit Nested Reply
  const handleSendReply = async (postId: string, parentCommentId: string) => {
    const text = replyInputs[parentCommentId]?.trim();
    if (!text) return;

    await addDiscussionComment(postId, text, parentCommentId);
    setReplyInputs(prev => ({ ...prev, [parentCommentId]: '' }));
    setReplyingToCommentId(prev => ({ ...prev, [postId]: null }));
    showToast('Reply sent!');
  };

  // Community Idea -> Project Conversion
  const handleConvertIdeaToProject = (post: Discussion) => {
    const prefillData = {
      title: post.title,
      problem_title: post.title,
      problem_description: post.content,
      solution_description: post.content,
      category: post.category || 'Technology',
      target_audience: 'Early adopters & Community Innovators',
      value_proposition: 'Community-validated concept with verified peer traction',
      differentiation: 'Engineered based on INNOVEXA peer discussions and open validation feedback'
    };

    sessionStorage.setItem('innovexa_create_prefill', JSON.stringify(prefillData));
    routerNavigate('/create');
  };

  // Toggle Follow Innovator
  const handleToggleFollowInnovator = (name: string) => {
    setFollowedInnovators(prev => {
      const updated = { ...prev, [name]: !prev[name] };
      showToast(updated[name] ? `Now following ${name}` : `Unfollowed ${name}`);
      return updated;
    });
  };

  // Copy / Share Post Link
  const handleSharePost = (postId: string) => {
    const url = `${window.location.origin}/community#${postId}`;
    navigator.clipboard?.writeText?.(url);
    showToast('Discussion link copied to clipboard!');
  };

  // Filter & Sort Discussions
  const filteredDiscussions = useMemo(() => {
    return discussions.filter(d => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = d.title.toLowerCase().includes(q);
        const matchContent = d.content.toLowerCase().includes(q);
        const matchCategory = d.category.toLowerCase().includes(q);
        const matchTags = d.tags?.some(t => t.toLowerCase().includes(q));
        const matchProject = d.project_title?.toLowerCase().includes(q);
        if (!matchTitle && !matchContent && !matchCategory && !matchTags && !matchProject) {
          return false;
        }
      }

      // Category filter
      if (activeCategory !== 'All' && d.category !== activeCategory) {
        return false;
      }

      // Tag filter
      if (selectedTag && !d.tags?.includes(selectedTag)) {
        return false;
      }

      // Primary Tabs Filter
      if (activeTab === 'saved') {
        return !!d.is_saved;
      }
      if (activeTab === 'following') {
        return !!d.is_following || !!followedInnovators[d.author_name];
      }
      if (activeTab === 'ideas') {
        return d.post_type === 'idea';
      }
      if (activeTab === 'questions') {
        return d.post_type === 'question';
      }
      if (activeTab === 'discussions') {
        return d.post_type === 'discussion';
      }
      if (activeTab === 'feedback_requests') {
        return d.post_type === 'feedback_request' || d.post_type === 'poll';
      }

      return true;
    }).sort((a, b) => {
      if (activeTab === 'trending') {
        // Time-weighted engagement formula
        const aEngagement = ((a.likes_count || 0) * 2 + (a.comments_count || 0) * 3 + (a.total_votes || 0) * 1.5);
        const bEngagement = ((b.likes_count || 0) * 2 + (b.comments_count || 0) * 3 + (b.total_votes || 0) * 1.5);
        const aHours = Math.max(1, (Date.now() - new Date(a.created_at).getTime()) / 3600000);
        const bHours = Math.max(1, (Date.now() - new Date(b.created_at).getTime()) / 3600000);
        const aScore = aEngagement / Math.pow(aHours + 2, 1.2);
        const bScore = bEngagement / Math.pow(bHours + 2, 1.2);
        return bScore - aScore;
      }
      // Latest or default
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [discussions, activeTab, activeCategory, selectedTag, searchQuery, followedInnovators]);

  // Group comments by discussion ID and structure parent/child threads
  const getThreadedComments = (postId: string) => {
    const postComments = comments.filter(c => c.discussion_id === postId);
    const parentComments = postComments.filter(c => !c.parent_comment_id);
    const childCommentsMap: { [parentId: string]: DiscussionComment[] } = {};

    postComments.forEach(c => {
      if (c.parent_comment_id) {
        if (!childCommentsMap[c.parent_comment_id]) {
          childCommentsMap[c.parent_comment_id] = [];
        }
        childCommentsMap[c.parent_comment_id].push(c);
      }
    });

    return { parentComments, childCommentsMap, totalCount: postComments.length };
  };

  // Helper for reaction emoji & label
  const reactionConfig: { [key in ReactionType]: { emoji: string; label: string; color: string } } = {
    useful: { emoji: '👍', label: 'Useful', color: 'text-blue-600' },
    interesting: { emoji: '💡', label: 'Interesting', color: 'text-amber-600' },
    inspiring: { emoji: '🚀', label: 'Inspiring', color: 'text-purple-600' },
    support: { emoji: '❤️', label: 'Support', color: 'text-rose-600' },
    question: { emoji: '🤔', label: 'Interesting Question', color: 'text-teal-600' }
  };

  // Post Type Badge Helper
  const getPostTypeBadge = (type?: PostType) => {
    switch (type) {
      case 'idea':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200"><Lightbulb className="w-3.5 h-3.5" /> Idea</span>;
      case 'question':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"><HelpCircle className="w-3.5 h-3.5" /> Question</span>;
      case 'feedback_request':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><BarChart3 className="w-3.5 h-3.5" /> Request Feedback</span>;
      case 'project_update':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200"><RefreshCw className="w-3.5 h-3.5" /> Project Update</span>;
      case 'resource':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"><LinkIcon className="w-3.5 h-3.5" /> Resource</span>;
      case 'poll':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200"><BarChart3 className="w-3.5 h-3.5" /> Innovation Poll</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"><MessageSquare className="w-3.5 h-3.5" /> Discussion</span>;
    }
  };

  return (
    <div className="space-y-8 pb-20 text-[#20202A]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[#20202A] text-white px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md animate-fade-in text-sm font-medium border border-[#E3DED5]">
          <Sparkles className="w-4 h-4 text-[#8875E8] animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Section */}
      <section className="space-y-4">
        <SlideUp>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-[#8875E8]/10 text-[#8875E8] border border-[#8875E8]/20">
                  Innovation Exchange
                </span>
                <span className="flex items-center gap-1.5 text-xs text-[#62616A] font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {discussions.length} Active Innovation Threads
                </span>
              </div>
              <h1 
                style={{
                  fontFamily: 'var(--font-display, "DM Serif Display", serif)',
                  fontWeight: 400,
                  fontSize: 'clamp(32px, 4vw, 44px)',
                  color: 'var(--color-ink, #20202A)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                }}
              >
                COMMUNITY
              </h1>
              <p className="mt-1.5 text-sm sm:text-base text-[#62616A] max-w-2xl leading-relaxed">
                Share ideas, ask questions, discover perspectives, and build better innovations together.
              </p>
            </div>

            {/* Quick Prompt Composer Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => openComposer('idea')}
                className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
              >
                <Lightbulb className="w-4 h-4 text-purple-600" />
                Share Idea
              </button>
              <button
                onClick={() => openComposer('question')}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
              >
                <HelpCircle className="w-4 h-4 text-blue-600" />
                Ask Question
              </button>
              <button
                onClick={() => openComposer('feedback_request')}
                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
              >
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                Request Feedback
              </button>
              <button
                onClick={() => openComposer('discussion')}
                className="px-4.5 py-2 bg-[#8875E8] hover:bg-[#7863df] text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Post
              </button>
            </div>
          </div>
        </SlideUp>

        {/* Quick Input Bar */}
        <div className="pt-2 flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-[#E3DED5] shadow-sm">
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
            alt="User"
            className="w-10 h-10 rounded-full object-cover border border-[#E3DED5]"
          />
          <div 
            onClick={() => openComposer('discussion')}
            className="flex-1 bg-[#F7F4EE] hover:bg-[#EFEAE2] text-[#62616A] hover:text-[#20202A] px-4 py-2.5 rounded-xl cursor-pointer text-xs sm:text-sm transition-all flex items-center justify-between border border-[#E3DED5]/60"
          >
            <span>What&apos;s on your mind about innovation?</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-white text-[#62616A] px-2 py-0.5 rounded border border-[#E3DED5]">⌘ K</span>
              <Sparkles className="w-4 h-4 text-[#8875E8]" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Feed Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Primary Navigation Tabs */}
          <div className="bg-white border border-[#E3DED5] rounded-2xl p-1.5 shadow-sm">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5">
              {[
                { id: 'for_you', label: 'For You', icon: Sparkles },
                { id: 'trending', label: 'Trending', icon: Flame },
                { id: 'latest', label: 'Latest', icon: Clock },
                { id: 'ideas', label: 'Ideas', icon: Lightbulb },
                { id: 'questions', label: 'Questions', icon: HelpCircle },
                { id: 'discussions', label: 'Discussions', icon: MessageSquare },
                { id: 'feedback_requests', label: 'Feedback Requests', icon: BarChart3 },
                { id: 'following', label: 'Following', icon: Users },
                { id: 'saved', label: 'Saved', icon: Bookmark }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setSelectedTag(null);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive 
                        ? 'bg-[#20202A] text-white shadow-sm' 
                        : 'text-[#62616A] hover:text-[#20202A] hover:bg-[#F7F4EE]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#8C8990]'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter Bar: Categories + Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Category Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? 'bg-[#8875E8] text-white shadow-sm'
                      : 'bg-white text-[#62616A] hover:text-[#20202A] hover:bg-[#EFEAE2] border border-[#E3DED5]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-[#8C8990] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search discussions, ideas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#E3DED5] rounded-xl pl-8 pr-7 py-1.5 text-xs text-[#20202A] placeholder-[#8C8990] focus:outline-none focus:border-[#8875E8] transition-colors shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C8990] hover:text-[#20202A]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Active Tag indicator */}
          {selectedTag && (
            <div className="flex items-center gap-2 bg-[#8875E8]/10 border border-[#8875E8]/30 px-3 py-1.5 rounded-xl text-xs text-[#8875E8]">
              <Tag className="w-3.5 h-3.5" />
              <span>Filtered by tag: <strong>#{selectedTag}</strong></span>
              <button
                onClick={() => setSelectedTag(null)}
                className="ml-auto text-[#62616A] hover:text-[#20202A]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Feed List */}
          {filteredDiscussions.length === 0 ? (
            <div className="bg-white border border-[#E3DED5] rounded-2xl p-12 text-center shadow-sm">
              <div className="w-14 h-14 rounded-full bg-[#8875E8]/10 text-[#8875E8] flex items-center justify-center mx-auto mb-3 border border-[#8875E8]/20">
                <Lightbulb className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#20202A] mb-1">
                {searchQuery || activeCategory !== 'All' ? 'No matching innovation discussions' : 'Be the first to start an innovation discussion'}
              </h3>
              <p className="text-xs text-[#62616A] max-w-md mx-auto mb-5">
                {searchQuery || activeCategory !== 'All' 
                  ? 'Try adjusting your search query or reset category filters to view more perspectives.' 
                  : 'Share an early stage idea, ask a validation question, or request structured feedback from peers.'}
              </p>
              <div className="flex items-center justify-center gap-3">
                {(searchQuery || activeCategory !== 'All' || selectedTag) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('All');
                      setSelectedTag(null);
                    }}
                    className="px-4 py-2 bg-[#F7F4EE] hover:bg-[#EFEAE2] text-[#20202A] rounded-xl text-xs font-semibold transition-colors border border-[#E3DED5]"
                  >
                    Clear Filters
                  </button>
                )}
                <button
                  onClick={() => openComposer('idea')}
                  className="px-4 py-2 bg-[#8875E8] hover:bg-[#7863df] text-white rounded-xl text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create Innovation Post
                </button>
              </div>
            </div>
          ) : (
            filteredDiscussions.map((post) => {
              const isSaved = !!post.is_saved;
              const isFollowing = !!post.is_following;
              const isCommentsOpen = !!expandedComments[post.id];
              const isAiSummaryOpen = !!expandedAiSummaries[post.id];
              const { parentComments, childCommentsMap, totalCount } = getThreadedComments(post.id);
              const isAuthor = user?.id === post.user_id || post.user_id === 'current';
              const hasHighTraction = (post.likes_count || 0) >= 10 || totalCount >= 3;

              return (
                <FadeIn key={post.id}>
                  <article 
                    id={post.id}
                    className="bg-white border border-[#E3DED5] hover:border-[#8875E8]/40 rounded-2xl p-5 sm:p-6 transition-all shadow-sm relative space-y-3.5"
                  >
                    {/* Top Author & Badge Row */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.author_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                          alt={post.author_name}
                          className="w-10 h-10 rounded-full object-cover border border-[#E3DED5]"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-[#20202A] hover:text-[#8875E8] transition-colors cursor-pointer">
                              {post.author_name}
                            </h4>
                            {post.author_role && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-[#F7F4EE] text-[#62616A] border border-[#E3DED5]">
                                {post.author_role}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#8C8990]">
                            {new Date(post.created_at).toLocaleDateString(undefined, { 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Post Type & Category Badges */}
                      <div className="flex items-center gap-2">
                        {getPostTypeBadge(post.post_type)}
                        <span className="hidden sm:inline-block text-xs px-2.5 py-0.5 rounded-full bg-[#F7F4EE] text-[#62616A] border border-[#E3DED5]">
                          {post.category}
                        </span>
                        {isAuthor && (
                          <button
                            onClick={() => deleteDiscussion(post.id)}
                            className="text-[#8C8990] hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Delete post"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Post Title */}
                    <h3 className="text-base sm:text-lg font-bold text-[#20202A] leading-snug">
                      {post.title}
                    </h3>

                    {/* Post Content */}
                    <div className="text-xs sm:text-sm text-[#40404C] leading-relaxed whitespace-pre-line">
                      {post.content}
                    </div>

                    {/* Attached INNOVEXA Project Preview */}
                    {post.project_id && (
                      <div className="p-3.5 rounded-xl bg-[#F7F4EE] border border-[#8875E8]/30 hover:border-[#8875E8]/60 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#8875E8]/15 text-[#8875E8] flex items-center justify-center border border-[#8875E8]/20 flex-shrink-0">
                            <Compass className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-[#8875E8] font-mono uppercase font-bold tracking-wider">Connected Project</span>
                              {post.project_category && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white text-[#62616A] border border-[#E3DED5]">
                                  {post.project_category}
                                </span>
                              )}
                            </div>
                            <h5 className="text-xs sm:text-sm font-bold text-[#20202A]">
                              {post.project_title || 'INNOVEXA Project'}
                            </h5>
                          </div>
                        </div>
                        <button
                          onClick={() => routerNavigate(`/projects/${post.project_id}`)}
                          className="px-3 py-1.5 bg-[#8875E8] hover:bg-[#7863df] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <span>View Project</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Project Update Diff Banner */}
                    {post.post_type === 'project_update' && post.project_update && (
                      <div className="p-3.5 rounded-xl bg-cyan-50/70 border border-cyan-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-cyan-800 px-2 py-0.5 rounded bg-cyan-100 border border-cyan-200">
                              {post.project_update.previous_version || 'v1.0'} → {post.project_update.new_version}
                            </span>
                            <span className="text-xs text-cyan-900 font-semibold">Release Highlights</span>
                          </div>
                          {post.project_id && (
                            <button
                              onClick={() => routerNavigate(`/projects/${post.project_id}/review`)}
                              className="text-xs font-semibold text-cyan-700 hover:text-cyan-900 underline flex items-center gap-1"
                            >
                              Give Validation Feedback →
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-cyan-950 bg-white p-2.5 rounded-lg border border-cyan-100">
                          {post.project_update.changes_summary}
                        </p>
                      </div>
                    )}

                    {/* Resource Share Card */}
                    {post.post_type === 'resource' && post.resource && (
                      <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <ExternalLink className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                          <div>
                            <div className="text-xs text-indigo-900 font-bold">{post.resource.resource_type || 'External Resource'}</div>
                            <span className="text-[11px] text-indigo-600">{post.resource.source_domain}</span>
                          </div>
                        </div>
                        <a
                          href={post.resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <span>Open Resource</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {/* Interactive Poll / Feedback Request Options */}
                    {(post.post_type === 'poll' || post.post_type === 'feedback_request') && post.poll_options && post.poll_options.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-[#F7F4EE] border border-[#E3DED5] space-y-2">
                        <div className="flex items-center justify-between text-xs text-[#62616A] mb-1">
                          <span className="font-bold text-[#20202A]">Community Poll Options</span>
                          <span className="font-mono">{post.total_votes || 0} total votes</span>
                        </div>
                        {post.poll_options.map(opt => {
                          const total = post.total_votes || 0;
                          const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
                          const isVoted = opt.votedUserIds?.includes(user?.id || 'current');

                          return (
                            <button
                              key={opt.id}
                              onClick={() => votePoll(post.id, opt.id)}
                              className={`w-full relative overflow-hidden text-left p-2.5 rounded-xl border transition-all ${
                                isVoted
                                  ? 'border-[#8875E8] bg-white text-[#20202A] ring-1 ring-[#8875E8]'
                                  : 'border-[#E3DED5] bg-white text-[#40404C] hover:border-[#8875E8]/50'
                              }`}
                            >
                              {/* Progress bar background */}
                              <div 
                                className="absolute left-0 top-0 bottom-0 bg-[#8875E8]/15 transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              ></div>

                              <div className="relative z-10 flex items-center justify-between gap-2 text-xs font-medium">
                                <div className="flex items-center gap-2">
                                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                    isVoted ? 'border-[#8875E8] bg-[#8875E8] text-white' : 'border-[#8C8990]'
                                  }`}>
                                    {isVoted && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                                  </span>
                                  <span>{opt.text}</span>
                                </div>
                                <span className="font-bold text-[#20202A] font-mono">{pct}% ({opt.votes})</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Idea Quick Gauge Reactions */}
                    {post.post_type === 'idea' && post.quick_feedback && (
                      <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200">
                        <span className="text-xs font-bold text-purple-900 mb-1.5 block">Quick Feedback Pulse:</span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {Object.entries(post.quick_feedback).map(([label, count]) => (
                            <button
                              key={label}
                              onClick={() => submitQuickIdeaFeedback(post.id, label)}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white hover:bg-purple-100 text-purple-800 border border-purple-200 transition-all flex items-center gap-1.5 shadow-sm"
                            >
                              <span>{label}</span>
                              <span className="text-purple-600 font-bold font-mono">{count}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* High Traction Idea to INNOVEXA Project Conversion */}
                    {post.post_type === 'idea' && hasHighTraction && (
                      <div className="p-3 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0 animate-pulse" />
                          <span className="text-xs font-semibold text-purple-900">This idea is gaining strong community interest.</span>
                        </div>
                        <button
                          onClick={() => handleConvertIdeaToProject(post)}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm flex-shrink-0"
                        >
                          <span>Create INNOVEXA Project</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {post.tags.map(t => (
                          <button
                            key={t}
                            onClick={() => setSelectedTag(t)}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-[#F7F4EE] text-[#62616A] hover:text-[#20202A] hover:bg-[#EFEAE2] transition-colors border border-[#E3DED5]/60"
                          >
                            #{t}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Interaction Bar */}
                    <div className="pt-3 border-t border-[#E3DED5] flex items-center justify-between gap-2">
                      {/* Reaction Trigger Button with Popover */}
                      <div className="relative">
                        <button
                          onClick={() => setActiveReactionPicker(activeReactionPicker === post.id ? null : post.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            post.user_reaction 
                              ? 'bg-[#8875E8]/15 text-[#8875E8] border border-[#8875E8]/30' 
                              : 'text-[#62616A] hover:text-[#20202A] hover:bg-[#F7F4EE]'
                          }`}
                        >
                          <span>
                            {post.user_reaction 
                              ? reactionConfig[post.user_reaction]?.emoji 
                              : '👍'}
                          </span>
                          <span className="font-mono">{post.likes_count || 0}</span>
                        </button>

                        {/* Reaction Popover Selector */}
                        {activeReactionPicker === post.id && (
                          <div className="absolute left-0 bottom-full mb-2 bg-white border border-[#E3DED5] rounded-2xl p-1.5 shadow-xl flex items-center gap-1 z-30 animate-fade-in">
                            {(Object.keys(reactionConfig) as ReactionType[]).map(rType => {
                              const config = reactionConfig[rType];
                              const isSelected = post.user_reaction === rType;
                              return (
                                <button
                                  key={rType}
                                  onClick={() => {
                                    reactToPost(post.id, rType);
                                    setActiveReactionPicker(null);
                                  }}
                                  className={`p-2 rounded-xl text-lg hover:scale-125 transition-transform flex items-center justify-center ${
                                    isSelected ? 'bg-[#F7F4EE] ring-1 ring-[#8875E8]' : 'hover:bg-[#F7F4EE]'
                                  }`}
                                  title={config.label}
                                >
                                  {config.emoji}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Comments Toggle */}
                      <button
                        onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#62616A] hover:text-[#20202A] hover:bg-[#F7F4EE] transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[#8C8990]" />
                        <span>{totalCount} Comments</span>
                      </button>

                      {/* Save Discussion */}
                      <button
                        onClick={() => {
                          toggleSavePost(post.id);
                          showToast(isSaved ? 'Post removed from saved' : 'Post saved to your bookmarks!');
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                          isSaved 
                            ? 'text-amber-600 bg-amber-50' 
                            : 'text-[#62616A] hover:text-[#20202A] hover:bg-[#F7F4EE]'
                        }`}
                        title={isSaved ? 'Saved' : 'Save post'}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500 text-amber-500' : 'text-[#8C8990]'}`} />
                        <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
                      </button>

                      {/* Follow Discussion */}
                      <button
                        onClick={() => {
                          toggleFollowDiscussion(post.id);
                          showToast(isFollowing ? 'Unfollowed discussion' : 'Following discussion for new perspectives');
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                          isFollowing 
                            ? 'text-[#8875E8] bg-[#8875E8]/10' 
                            : 'text-[#62616A] hover:text-[#20202A] hover:bg-[#F7F4EE]'
                        }`}
                        title="Follow for updates"
                      >
                        <Users className="w-3.5 h-3.5 text-[#8C8990]" />
                        <span className="hidden sm:inline">{isFollowing ? 'Following' : 'Follow'}</span>
                      </button>

                      {/* Share */}
                      <button
                        onClick={() => handleSharePost(post.id)}
                        className="text-[#62616A] hover:text-[#20202A] p-1.5 rounded-xl hover:bg-[#F7F4EE] transition-colors"
                        title="Share discussion"
                      >
                        <Share2 className="w-3.5 h-3.5 text-[#8C8990]" />
                      </button>
                    </div>

                    {/* Expanded Comments & Nested Discussion Thread */}
                    {isCommentsOpen && (
                      <div className="pt-3 border-t border-[#E3DED5] space-y-3.5">
                        
                        {/* AI Discussion Summary (If 2+ comments exist) */}
                        {totalCount >= 2 && (
                          <div className="rounded-xl bg-[#8875E8]/5 border border-[#8875E8]/20 p-3.5">
                            <button
                              onClick={() => setExpandedAiSummaries(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                              className="w-full flex items-center justify-between text-xs font-bold text-[#8875E8]"
                            >
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-[#8875E8]" />
                                <span>AI Discussion Summary ({totalCount} perspectives)</span>
                              </div>
                              {isAiSummaryOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>

                            {isAiSummaryOpen && (
                              <div className="mt-2.5 pt-2.5 border-t border-[#8875E8]/20 text-xs text-[#40404C] space-y-1.5">
                                <div>
                                  <strong className="text-[#20202A]">Community Consensus:</strong> Reviewers strongly favor predictable validation milestones and emphasize UX simplicity over feature bloat.
                                </div>
                                <div>
                                  <strong className="text-[#20202A]">Suggested Next Step:</strong> Run a 7-day targeted beta with early innovators to measure task completion rate.
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* List of Comments & Nested Replies */}
                        <div className="space-y-3">
                          {parentComments.length === 0 ? (
                            <p className="text-xs text-[#8C8990] py-2 text-center italic">
                              Start the conversation. Add your perspective below.
                            </p>
                          ) : (
                            parentComments.map(c => {
                              const replies = childCommentsMap[c.id] || [];
                              const isReplying = replyingToCommentId[post.id] === c.id;

                              return (
                                <div key={c.id} className="space-y-2">
                                  {/* Parent Comment */}
                                  <div className="bg-[#F7F4EE] border border-[#E3DED5] rounded-xl p-3">
                                    <div className="flex items-center justify-between gap-2 mb-1.5">
                                      <div className="flex items-center gap-2">
                                        <img
                                          src={c.author_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                                          alt={c.author_name}
                                          className="w-6 h-6 rounded-full object-cover"
                                        />
                                        <span className="text-xs font-bold text-[#20202A]">{c.author_name}</span>
                                        {c.author_role && (
                                          <span className="text-[10px] text-[#62616A] bg-white px-1.5 py-0.2 rounded border border-[#E3DED5]">
                                            {c.author_role}
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[11px] text-[#8C8990] font-mono">
                                        {new Date(c.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                      </span>
                                    </div>
                                    <p className="text-xs text-[#40404C] leading-relaxed pl-8">
                                      {c.content}
                                    </p>
                                    <div className="pl-8 pt-1.5 flex items-center gap-3 text-xs">
                                      <button
                                        onClick={() => setReplyingToCommentId(prev => ({
                                          ...prev,
                                          [post.id]: isReplying ? null : c.id
                                        }))}
                                        className="text-[#8875E8] hover:text-[#7863df] font-semibold flex items-center gap-1"
                                      >
                                        <CornerDownRight className="w-3 h-3" />
                                        <span>{isReplying ? 'Cancel' : 'Reply'}</span>
                                      </button>
                                    </div>
                                  </div>

                                  {/* Nested Replies */}
                                  {replies.length > 0 && (
                                    <div className="pl-6 space-y-2 border-l-2 border-[#E3DED5] ml-4">
                                      {replies.map(r => (
                                        <div key={r.id} className="bg-[#F7F4EE]/70 border border-[#E3DED5] rounded-xl p-2.5">
                                          <div className="flex items-center justify-between gap-2 mb-1">
                                            <div className="flex items-center gap-2">
                                              <img
                                                src={r.author_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                                                alt={r.author_name}
                                                className="w-5 h-5 rounded-full object-cover"
                                              />
                                              <span className="text-xs font-bold text-[#20202A]">{r.author_name}</span>
                                            </div>
                                            <span className="text-[10px] text-[#8C8990] font-mono">
                                              {new Date(r.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                          </div>
                                          <p className="text-xs text-[#40404C] leading-relaxed pl-7">
                                            {r.content}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Inline Reply Composer */}
                                  {isReplying && (
                                    <div className="pl-6 ml-4">
                                      <div className="flex items-center gap-2 bg-white border border-[#E3DED5] rounded-xl p-2 shadow-sm">
                                        <input
                                          type="text"
                                          placeholder={`Reply to ${c.author_name}...`}
                                          value={replyInputs[c.id] || ''}
                                          onChange={(e) => setReplyInputs(prev => ({ ...prev, [c.id]: e.target.value }))}
                                          onKeyDown={(e) => e.key === 'Enter' && handleSendReply(post.id, c.id)}
                                          className="flex-1 bg-transparent text-xs text-[#20202A] placeholder-[#8C8990] focus:outline-none"
                                        />
                                        <button
                                          onClick={() => handleSendReply(post.id, c.id)}
                                          className="px-3 py-1 bg-[#8875E8] hover:bg-[#7863df] text-white rounded-lg text-xs font-semibold transition-colors"
                                        >
                                          Send
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Top-Level Comment Composer */}
                        <div className="pt-1">
                          {aiCommentSuggestion[post.id] && (
                            <div className="mb-2 p-2.5 rounded-xl bg-[#8875E8]/10 border border-[#8875E8]/30 text-xs text-[#20202A] flex items-start justify-between gap-2">
                              <div>
                                <span className="font-bold text-[#8875E8] flex items-center gap-1 mb-0.5">
                                  <Sparkles className="w-3 h-3" /> AI Improved Suggestion:
                                </span>
                                <p className="text-[#40404C]">{aiCommentSuggestion[post.id]}</p>
                              </div>
                              <button
                                onClick={() => handleApplyAiComment(post.id)}
                                className="px-2.5 py-1 bg-[#8875E8] hover:bg-[#7863df] text-white rounded-md text-[11px] font-semibold flex-shrink-0"
                              >
                                Use
                              </button>
                            </div>
                          )}

                          <div className="flex items-center gap-2 bg-[#F7F4EE] border border-[#E3DED5] rounded-xl p-2 focus-within:border-[#8875E8] transition-colors">
                            <input
                              type="text"
                              placeholder="Add your perspective..."
                              value={commentInputs[post.id] || ''}
                              onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                              onKeyDown={(e) => e.key === 'Enter' && handleSendComment(post.id)}
                              className="flex-1 bg-transparent text-xs text-[#20202A] placeholder-[#8C8990] focus:outline-none"
                            />

                            <button
                              onClick={() => handleAiImproveComment(post.id)}
                              disabled={isImprovingComment[post.id]}
                              className="text-[#8875E8] hover:text-[#7863df] p-1.5 rounded-lg hover:bg-white transition-colors text-xs flex items-center gap-1 font-medium"
                              title="Make comment clearer"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">AI Polish</span>
                            </button>

                            <button
                              onClick={() => handleSendComment(post.id)}
                              className="px-3.5 py-1.5 bg-[#8875E8] hover:bg-[#7863df] text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm"
                            >
                              <Send className="w-3 h-3" />
                              <span>Send</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    )}
                  </article>
                </FadeIn>
              );
            })
          )}

        </div>

        {/* Right Discovery Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Weekly Innovation Challenge Card */}
          <div className="bg-gradient-to-br from-purple-50 via-white to-indigo-50 border border-purple-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-700 uppercase tracking-wider">
              <Award className="w-4 h-4 text-purple-600" />
              <span>Weekly Innovation Challenge</span>
            </div>
            <h4 className="text-base font-bold text-[#20202A] leading-snug">
              How can AI improve student productivity?
            </h4>
            <p className="text-xs text-[#62616A] leading-relaxed">
              Share practical workflows or prototype architectures that eliminate repetitive note reorganization and accelerate active recall.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  openComposer('idea');
                  setNewCategory('Education');
                  setNewTagsInput('Education, Productivity, AI');
                  setNewTitle('AI for Student Productivity: ');
                }}
                className="px-3.5 py-2 bg-[#8875E8] hover:bg-[#7863df] text-white rounded-xl text-xs font-bold transition-colors flex-1 text-center shadow-sm"
              >
                Submit Idea
              </button>
              <button
                onClick={() => {
                  setActiveTab('all' as any);
                  setSelectedTag('Education');
                }}
                className="px-3.5 py-2 bg-white hover:bg-[#F7F4EE] text-[#20202A] rounded-xl text-xs font-semibold transition-colors border border-[#E3DED5]"
              >
                Discuss
              </button>
            </div>
          </div>

          {/* Trending Topics Chips */}
          <div className="bg-white border border-[#E3DED5] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3.5">
              <h4 className="text-xs font-bold text-[#20202A] uppercase tracking-wider flex items-center gap-2 font-mono">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Trending Topics</span>
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingTopics.map(topic => {
                const rawTag = topic.replace(/^#/, '');
                const isSelected = selectedTag === rawTag;
                return (
                  <button
                    key={topic}
                    onClick={() => setSelectedTag(isSelected ? null : rawTag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-[#8875E8] text-white shadow-sm'
                        : 'bg-[#F7F4EE] text-[#62616A] hover:text-[#20202A] hover:bg-[#EFEAE2] border border-[#E3DED5]'
                    }`}
                  >
                    {topic}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Discover Innovators Widget */}
          <div className="bg-white border border-[#E3DED5] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-[#20202A] uppercase tracking-wider flex items-center gap-2 font-mono">
                <Users className="w-4 h-4 text-[#8875E8]" />
                <span>Discover Innovators</span>
              </h4>
            </div>
            <div className="space-y-3.5">
              {discoverInnovators.map((innovator) => {
                const isFollowed = !!followedInnovators[innovator.name];

                return (
                  <div key={innovator.name} className="flex items-center justify-between gap-3 p-1.5 rounded-xl hover:bg-[#F7F4EE] transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={innovator.avatar}
                        alt={innovator.name}
                        className="w-9 h-9 rounded-full object-cover border border-[#E3DED5] flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-[#20202A] truncate">{innovator.name}</h5>
                        <p className="text-[11px] text-[#62616A] truncate">{innovator.role}</p>
                        <div className="flex items-center gap-1.5 mt-0.5 font-mono">
                          <span className="text-[10px] text-[#8875E8]">{innovator.projectsCount} projects</span>
                          <span className="text-[10px] text-[#8C8990]">•</span>
                          <span className="text-[10px] text-[#62616A]">{innovator.contributionsCount} reviews</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleFollowInnovator(innovator.name)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex-shrink-0 ${
                        isFollowed
                          ? 'bg-[#F7F4EE] text-[#62616A] border border-[#E3DED5] hover:text-rose-600'
                          : 'bg-[#8875E8]/10 text-[#8875E8] border border-[#8875E8]/30 hover:bg-[#8875E8] hover:text-white'
                      }`}
                    >
                      {isFollowed ? 'Following' : 'Follow'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* INNOVEXA Community Guidelines */}
          <div className="bg-white border border-[#E3DED5] rounded-2xl p-4 text-xs text-[#62616A] space-y-2 shadow-sm">
            <div className="font-bold text-[#20202A] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Innovation Community Principles</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[#62616A] text-[11px] leading-relaxed">
              <li>Provide constructive, evidence-backed feedback.</li>
              <li>Connect ideas directly with prototype experiments.</li>
              <li>Celebrate iterations and lessons learned.</li>
            </ul>
          </div>

        </div>

      </div>

      {/* Interactive Post Composer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white border border-[#E3DED5] rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative my-8 text-[#20202A]">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E3DED5] mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#8875E8]/15 text-[#8875E8] flex items-center justify-center border border-[#8875E8]/20">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#20202A]">Create Innovation Post</h3>
                  <p className="text-xs text-[#62616A]">Share your vision, solicit feedback, or update the community</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#8C8990] hover:text-[#20202A] p-1 rounded-lg hover:bg-[#F7F4EE]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Post Type Selector */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-[#20202A] uppercase tracking-wider mb-2 font-mono">
                Select Post Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'idea', label: 'Idea', icon: Lightbulb, color: 'text-purple-600' },
                  { id: 'question', label: 'Question', icon: HelpCircle, color: 'text-blue-600' },
                  { id: 'discussion', label: 'Discussion', icon: MessageSquare, color: 'text-amber-600' },
                  { id: 'feedback_request', label: 'Feedback', icon: BarChart3, color: 'text-emerald-600' },
                  { id: 'project_update', label: 'Update', icon: RefreshCw, color: 'text-cyan-600' },
                  { id: 'resource', label: 'Resource', icon: LinkIcon, color: 'text-indigo-600' },
                  { id: 'poll', label: 'Poll', icon: BarChart3, color: 'text-violet-600' }
                ].map(type => {
                  const Icon = type.icon;
                  const isSelected = composerType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setComposerType(type.id as PostType)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-[#8875E8]/15 border-[#8875E8] text-[#8875E8] shadow-sm'
                          : 'bg-[#F7F4EE] border-[#E3DED5] text-[#62616A] hover:bg-[#EFEAE2] hover:text-[#20202A]'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${type.color}`} />
                      <span>{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Form */}
            <form onSubmit={handlePublishPost} className="space-y-4">
              
              {/* Title Input */}
              <div>
                <label className="block text-xs font-semibold text-[#20202A] mb-1">
                  Title / Headline
                </label>
                <input
                  type="text"
                  placeholder={
                    composerType === 'idea' ? 'What if students could...' :
                    composerType === 'question' ? 'How do you validate...' :
                    composerType === 'feedback_request' ? 'Which feature should we build first?' :
                    composerType === 'project_update' ? 'Version 2.0 is now available: ...' :
                    'Enter headline or summary...'
                  }
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white border border-[#E3DED5] rounded-xl px-3.5 py-2.5 text-xs text-[#20202A] placeholder-[#8C8990] focus:outline-none focus:border-[#8875E8]"
                />
              </div>

              {/* Content Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#20202A]">
                    Content / Details <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAiImprovePost}
                    disabled={isGeneratingAi}
                    className="text-[#8875E8] hover:text-[#7863df] text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isGeneratingAi ? 'Improving...' : 'Improve with AI'}</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  placeholder={
                    composerType === 'idea' ? 'Describe your idea, what problem it solves, and how it works...' :
                    composerType === 'feedback_request' ? 'Describe what feedback you need from innovators and why...' :
                    'Write your thoughts, questions, or perspectives here...'
                  }
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-white border border-[#E3DED5] rounded-xl p-3 text-xs text-[#20202A] placeholder-[#8C8990] focus:outline-none focus:border-[#8875E8] leading-relaxed"
                  required
                />
              </div>

              {/* AI Suggestion Preview Box (User Approval Required) */}
              {aiSuggestion && (
                <div className="p-3.5 rounded-xl bg-[#8875E8]/10 border border-[#8875E8]/30 text-xs text-[#20202A] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#8875E8] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> AI Suggestion Preview
                    </span>
                    <button
                      type="button"
                      onClick={handleApplyAiSuggestion}
                      className="px-3 py-1 bg-[#8875E8] hover:bg-[#7863df] text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      Apply to Form
                    </button>
                  </div>
                  {aiSuggestion.title && (
                    <div><strong className="text-[#20202A]">Title:</strong> {aiSuggestion.title}</div>
                  )}
                  {aiSuggestion.content && (
                    <div className="whitespace-pre-line text-[#40404C] bg-white p-2 rounded border border-[#E3DED5]">
                      {aiSuggestion.content}
                    </div>
                  )}
                </div>
              )}

              {/* Similar Discussions Detected Warning */}
              {similarDiscussions.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900">
                  <div className="flex items-center gap-2 font-bold text-amber-800 mb-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Similar discussions already exist:</span>
                  </div>
                  <ul className="space-y-1 text-amber-900 list-disc list-inside">
                    {similarDiscussions.map(sd => (
                      <li key={sd.id} className="truncate">
                        &quot;{sd.title}&quot; ({sd.category})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Conditional: Poll Options */}
              {(composerType === 'poll' || composerType === 'feedback_request') && (
                <div className="space-y-2 bg-[#F7F4EE] p-3 rounded-xl border border-[#E3DED5]">
                  <label className="block text-xs font-semibold text-[#20202A]">
                    Poll Voting Options (Min 2)
                  </label>
                  {pollOptionsInput.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={`Option ${idx + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const updated = [...pollOptionsInput];
                          updated[idx] = e.target.value;
                          setPollOptionsInput(updated);
                        }}
                        className="flex-1 bg-white border border-[#E3DED5] rounded-lg px-3 py-1.5 text-xs text-[#20202A] focus:outline-none focus:border-[#8875E8]"
                      />
                      {pollOptionsInput.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setPollOptionsInput(pollOptionsInput.filter((_, i) => i !== idx))}
                          className="text-[#8C8990] hover:text-rose-600 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {pollOptionsInput.length < 5 && (
                    <button
                      type="button"
                      onClick={() => setPollOptionsInput([...pollOptionsInput, ''])}
                      className="text-xs text-[#8875E8] hover:text-[#7863df] font-semibold"
                    >
                      + Add Option
                    </button>
                  )}
                </div>
              )}

              {/* Conditional: Project Update Fields */}
              {composerType === 'project_update' && (
                <div className="grid grid-cols-2 gap-3 bg-[#F7F4EE] p-3 rounded-xl border border-[#E3DED5]">
                  <div>
                    <label className="block text-xs text-[#62616A] mb-1">Previous Version</label>
                    <input
                      type="text"
                      value={prevVersionInput}
                      onChange={(e) => setPrevVersionInput(e.target.value)}
                      placeholder="e.g. v1.2"
                      className="w-full bg-white border border-[#E3DED5] rounded-lg px-2.5 py-1.5 text-xs text-[#20202A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#62616A] mb-1">New Version</label>
                    <input
                      type="text"
                      value={newVersionInput}
                      onChange={(e) => setNewVersionInput(e.target.value)}
                      placeholder="e.g. v2.0"
                      className="w-full bg-white border border-[#E3DED5] rounded-lg px-2.5 py-1.5 text-xs text-[#20202A]"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-[#62616A] mb-1">What Changed?</label>
                    <input
                      type="text"
                      value={changesSummaryInput}
                      onChange={(e) => setChangesSummaryInput(e.target.value)}
                      placeholder="e.g. Edge inference latency cut by 40% + clinician report export"
                      className="w-full bg-white border border-[#E3DED5] rounded-lg px-2.5 py-1.5 text-xs text-[#20202A]"
                    />
                  </div>
                </div>
              )}

              {/* Conditional: Resource Fields */}
              {composerType === 'resource' && (
                <div className="grid grid-cols-2 gap-3 bg-[#F7F4EE] p-3 rounded-xl border border-[#E3DED5]">
                  <div className="col-span-2">
                    <label className="block text-xs text-[#62616A] mb-1">Resource URL</label>
                    <input
                      type="url"
                      placeholder="https://github.com/... or https://arxiv.org/..."
                      value={resourceUrlInput}
                      onChange={(e) => setResourceUrlInput(e.target.value)}
                      className="w-full bg-white border border-[#E3DED5] rounded-lg px-2.5 py-1.5 text-xs text-[#20202A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#62616A] mb-1">Domain / Source</label>
                    <input
                      type="text"
                      placeholder="e.g. github.com"
                      value={resourceDomainInput}
                      onChange={(e) => setResourceDomainInput(e.target.value)}
                      className="w-full bg-white border border-[#E3DED5] rounded-lg px-2.5 py-1.5 text-xs text-[#20202A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#62616A] mb-1">Resource Type</label>
                    <input
                      type="text"
                      placeholder="Dataset / Spec / Tool"
                      value={resourceTypeInput}
                      onChange={(e) => setResourceTypeInput(e.target.value)}
                      className="w-full bg-white border border-[#E3DED5] rounded-lg px-2.5 py-1.5 text-xs text-[#20202A]"
                    />
                  </div>
                </div>
              )}

              {/* Category, Attach Project, and Tags Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-[#20202A] mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-white border border-[#E3DED5] rounded-xl px-3 py-2 text-xs text-[#20202A] focus:outline-none focus:border-[#8875E8]"
                  >
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Attach Project */}
                <div>
                  <label className="block text-xs font-semibold text-[#20202A] mb-1">Attach Project</label>
                  <select
                    value={attachedProjectId}
                    onChange={(e) => setAttachedProjectId(e.target.value)}
                    className="w-full bg-white border border-[#E3DED5] rounded-xl px-3 py-2 text-xs text-[#20202A] focus:outline-none focus:border-[#8875E8]"
                  >
                    <option value="">None (Standalone)</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-xs font-semibold text-[#20202A] mb-1">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="AI, EdTech, MVP"
                    value={newTagsInput}
                    onChange={(e) => setNewTagsInput(e.target.value)}
                    className="w-full bg-white border border-[#E3DED5] rounded-xl px-3 py-2 text-xs text-[#20202A] focus:outline-none focus:border-[#8875E8]"
                  />
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E3DED5]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-[#F7F4EE] hover:bg-[#EFEAE2] text-[#62616A] hover:text-[#20202A] rounded-xl text-xs font-semibold transition-colors border border-[#E3DED5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#8875E8] hover:bg-[#7863df] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish to Community</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
