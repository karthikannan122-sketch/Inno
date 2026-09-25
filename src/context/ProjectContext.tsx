import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  Project, 
  Review, 
  ProjectVersion, 
  ProjectRelationship, 
  FeedbackDecision, 
  Notification, 
  Message, 
  Discussion, 
  DiscussionComment,
  PostType,
  ReactionType,
  ProjectUpdateMeta,
  ResourceMeta,
  PollOption,
  ProjectInsightsData,
  FeedbackDecisionType
} from '../types/database';
import { SEED_PROJECTS, SEED_REVIEWS, SEED_VERSIONS, SEED_RELATIONSHIPS } from '../data/seedData';
import { STORAGE_KEYS, isSupabaseConfigured, supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface ProjectContextType {
  projects: Project[];
  reviews: Review[];
  versions: ProjectVersion[];
  relationships: ProjectRelationship[];
  decisions: FeedbackDecision[];
  notifications: Notification[];
  messages: Message[];
  discussions: Discussion[];
  comments: DiscussionComment[];
  loading: boolean;
  
  // Actions
  getProjectById: (id: string) => Project | undefined;
  getReviewsByProjectId: (projectId: string) => Review[];
  getVersionsByProjectId: (projectId: string) => ProjectVersion[];
  getRelationshipsByProjectId: (projectId: string) => ProjectRelationship[];
  getDecisionsByProjectId: (projectId: string) => FeedbackDecision[];
  getCommentsByDiscussionId: (discussionId: string) => DiscussionComment[];
  
  createProject: (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'current_version' | 'readiness_score' | 'reviews_count' | 'perspectives_count'>) => Promise<{ project: Project | null; error: string | null }>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<{ error: string | null }>;
  deleteProject: (id: string) => Promise<{ error: string | null }>;
  createNewVersion: (projectId: string, title: string, description: string, changesSummary: string) => Promise<{ error: string | null }>;
  publishProject: (projectId: string) => Promise<{ error: string | null }>;
  voteProject: (projectId: string, voteType: 'up' | 'down') => Promise<void>;
  
  submitReview: (reviewData: {
    projectId: string;
    problemRelevance: 'yes' | 'sometimes' | 'no';
    solutionClarity: 'yes' | 'partially' | 'no';
    usefulness: 'yes' | 'maybe' | 'no';
    suggestion?: string;
    reviewType: 'constructive' | 'suggestion' | 'question' | 'praise';
  }) => Promise<{ error: string | null }>;
  
  saveFeedbackDecision: (projectId: string, reviewId: string, decision: FeedbackDecisionType, notes?: string) => Promise<void>;
  
  getProjectInsights: (projectId: string) => ProjectInsightsData;
  calculateMatchScore: (project: Project) => number;
  refreshProjects: () => Promise<void>;
  
  // Community & Messaging
  createDiscussion: (
    title: string,
    content: string,
    category: string,
    options?: {
      post_type?: PostType;
      tags?: string[];
      project_id?: string;
      project_title?: string;
      project_category?: string;
      poll_options?: string[];
      project_update?: ProjectUpdateMeta;
      resource?: ResourceMeta;
      media_url?: string;
    }
  ) => Promise<void>;
  addDiscussionComment: (discussionId: string, content: string, parentCommentId?: string) => Promise<void>;
  reactToPost: (postId: string, reaction: ReactionType) => Promise<void>;
  toggleSavePost: (postId: string) => void;
  toggleFollowDiscussion: (postId: string) => void;
  votePoll: (postId: string, optionId: string) => void;
  submitQuickIdeaFeedback: (postId: string, key: string) => void;
  deleteDiscussion: (postId: string) => Promise<void>;
  sendMessage: (receiverId: string, content: string) => Promise<void>;
  markNotificationRead: (id: string) => void;
  getConversationWith: (userId: string) => Message[];
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, awardReputationPoints } = useAuth();
  
  const [projects, setProjects] = useState<Project[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    const rawProjects: Project[] = stored ? JSON.parse(stored) : SEED_PROJECTS;
    
    let userVotes: Record<string, 'up' | 'down'> = {};
    try {
      const storedVotes = localStorage.getItem(STORAGE_KEYS.PROJECT_VOTES);
      if (storedVotes) userVotes = JSON.parse(storedVotes);
    } catch (e) {
      userVotes = {};
    }

    return rawProjects.map((p, idx) => ({
      ...p,
      upvotes_count: p.upvotes_count ?? (18 + ((idx * 7) % 23)),
      downvotes_count: p.downvotes_count ?? (idx % 3),
      user_vote: userVotes[p.id] || p.user_vote || null
    }));
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    return stored ? JSON.parse(stored) : SEED_REVIEWS;
  });

  const [versions, setVersions] = useState<ProjectVersion[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.VERSIONS);
    return stored ? JSON.parse(stored) : SEED_VERSIONS;
  });

  const [relationships, setRelationships] = useState<ProjectRelationship[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.RELATIONSHIPS);
    return stored ? JSON.parse(stored) : SEED_RELATIONSHIPS;
  });

  const [decisions, setDecisions] = useState<FeedbackDecision[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.DECISIONS);
    return stored ? JSON.parse(stored) : [];
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return stored ? JSON.parse(stored) : [
      {
        id: 'notif-1',
        user_id: 'current',
        type: 'project_matched',
        title: 'New Review Match',
        message: 'You have been matched with "StudyFlow" based on your Education interests.',
        link: '/projects/demo-proj-01',
        is_read: false,
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'notif-2',
        user_id: 'current',
        type: 'system',
        title: 'Welcome to INNOVEXA',
        message: 'Your personal innovation space is now configured. Start exploring or submit an idea.',
        link: '/explore',
        is_read: true,
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ];
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    return stored ? JSON.parse(stored) : [
      {
        id: 'msg-1',
        sender_id: 'demo-creator-01',
        receiver_id: 'current',
        sender_name: 'Elena Rostova',
        sender_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        content: 'Hi! Thank you for reviewing StudyFlow. We are considering the calendar integration you suggested.',
        is_read: true,
        created_at: new Date(Date.now() - 7200000).toISOString()
      }
    ];
  });

  const [discussions, setDiscussions] = useState<Discussion[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.DISCUSSIONS);
    return stored ? JSON.parse(stored) : [
      {
        id: 'disc-idea-1',
        user_id: 'demo-creator-01',
        author_name: 'Elena Rostova',
        author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        author_role: 'Research Fellow',
        post_type: 'idea',
        title: 'What if students could turn live lecture audio directly into spaced-repetition flashcards with AI auto-diagrams?',
        content: 'We noticed university students spend 4+ hours per week re-organizing raw lecture notes. If an on-device model extracted core thesis points, generated SVG concept maps, and scheduled Anki-style review intervals automatically, retention could increase by 60%. What key workflows would you want included?',
        category: 'Education',
        tags: ['EdTech', 'AI', 'Productivity', 'ActiveRecall'],
        project_id: 'demo-proj-01',
        project_title: 'StudyFlow',
        project_category: 'Education & Productivity',
        likes_count: 46,
        comments_count: 5,
        reactions: { useful: 18, interesting: 22, inspiring: 19, support: 14, question: 3 },
        quick_feedback: { '🔥 Great potential': 31, '💡 Needs refinement': 6, '🚀 Would use it': 24, '🤔 Need more information': 2 },
        created_at: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: 'disc-poll-1',
        user_id: 'demo-creator-02',
        author_name: 'Marcus Chen',
        author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        author_role: 'Climate Tech Lead',
        post_type: 'feedback_request',
        title: 'Which enterprise feature should we build first for FoodSave AI?',
        content: 'We are expanding from local bakery pilots into regional supermarket chains. Which capability provides the most immediate ROI to prove our predictive food waste reduction value proposition?',
        category: 'Sustainability',
        tags: ['FeedbackRequest', 'FoodTech', 'Inventory', 'Retail'],
        project_id: 'demo-proj-02',
        project_title: 'FoodSave AI',
        project_category: 'Sustainability & Supply Chain',
        poll_options: [
          { id: 'opt-1', text: 'Automated optical barcode + camera expiry scanner', votes: 44 },
          { id: 'opt-2', text: 'Dynamic automated markdown discount engine based on shelf life', votes: 68 },
          { id: 'opt-3', text: 'Direct Square & Toast POS inventory synchronization', votes: 37 },
          { id: 'opt-4', text: 'Hyperlocal consumer surplus marketplace app', votes: 29 }
        ],
        total_votes: 178,
        likes_count: 38,
        comments_count: 6,
        reactions: { useful: 21, interesting: 16, inspiring: 11, support: 14, question: 4 },
        created_at: new Date(Date.now() - 3600000 * 14).toISOString()
      },
      {
        id: 'disc-update-1',
        user_id: 'demo-creator-03',
        author_name: 'Dr. Sarah Lin',
        author_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        author_role: 'Biomedical AI Researcher',
        post_type: 'project_update',
        title: 'HealthPulse v2.0 Released: Real-Time Wearable Telemetry & Automated ECG Anomaly Detection',
        content: 'Following extensive feedback from 24 clinicians in the INNOVEXA community, version 2.0 is now published for review! We would love your thoughts on our updated diagnostic report summary.',
        category: 'Health & BioTech',
        tags: ['HealthTech', 'Telemetry', 'Wearables', 'Validation'],
        project_id: 'demo-proj-03',
        project_title: 'HealthPulse',
        project_category: 'HealthTech & Diagnostics',
        project_update: {
          previous_version: 'v1.2',
          new_version: 'v2.0',
          changes_summary: 'Edge inference latency cut by 42%, added automated clinical PDF export format, and enabled Bluetooth low-energy telemetry streaming for Apple Watch and Garmin devices.'
        },
        likes_count: 54,
        comments_count: 4,
        reactions: { useful: 24, interesting: 19, inspiring: 28, support: 16, question: 2 },
        created_at: new Date(Date.now() - 3600000 * 22).toISOString()
      },
      {
        id: 'disc-res-1',
        user_id: 'demo-creator-04',
        author_name: 'David Kalu',
        author_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        author_role: 'ML Systems Engineer',
        post_type: 'resource',
        title: 'Open Benchmark: 10,000 Verified Prompt-Response Pairs for Synthetic Customer Validation',
        content: 'To help early stage founders validate concepts before running expensive live campaigns, our team open-sourced a categorized evaluation dataset calibrated against actual consumer purchase intentions.',
        category: 'Tools & APIs',
        tags: ['OpenSource', 'Datasets', 'Validation', 'Benchmarking'],
        resource: {
          source_domain: 'github.com',
          url: 'https://github.com/innovexa/synthetic-product-validation-benchmarks',
          resource_type: 'Dataset & Technical Spec'
        },
        likes_count: 67,
        comments_count: 3,
        reactions: { useful: 38, interesting: 27, inspiring: 21, support: 19, question: 1 },
        created_at: new Date(Date.now() - 86400000 * 1.5).toISOString()
      },
      {
        id: 'disc-quest-1',
        user_id: 'demo-creator-05',
        author_name: 'Amara Vance',
        author_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        author_role: 'Systems Architect',
        post_type: 'question',
        title: 'How do you systematically validate market demand before building a multi-agent backend?',
        content: 'Many teams spend 3 months building autonomous agents before realizing users only needed a simple workflow automation rule. What metrics or customer interviews proved willingness to pay for your agentic applications?',
        category: 'Validation Strategy',
        tags: ['Startups', 'MultiAgent', 'Validation', 'Strategy'],
        likes_count: 33,
        comments_count: 5,
        reactions: { useful: 19, interesting: 18, inspiring: 12, support: 9, question: 16 },
        created_at: new Date(Date.now() - 86400000 * 2.2).toISOString()
      },
      {
        id: 'disc-1',
        user_id: 'demo-creator-02',
        author_name: 'Marcus Chen',
        author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        author_role: 'Founder',
        post_type: 'discussion',
        title: 'How do you price early stage SaaS when validating B2B sustainability tools?',
        content: 'We are currently debating whether FoodSave should take a small transaction fee on saved inventory or charge a monthly merchant subscription. What has worked for your early validation tests?',
        category: 'Business Models',
        tags: ['Pricing', 'B2B', 'SaaS', 'BusinessModel'],
        project_id: 'demo-proj-02',
        project_title: 'FoodSave AI',
        likes_count: 27,
        comments_count: 4,
        reactions: { useful: 14, interesting: 11, inspiring: 7, support: 8, question: 3 },
        created_at: new Date(Date.now() - 86400000 * 3).toISOString()
      }
    ];
  });

  const [comments, setComments] = useState<DiscussionComment[]>(() => {
    const stored = localStorage.getItem('innovexa_discussion_comments');
    return stored ? JSON.parse(stored) : [
      {
        id: 'comm-1',
        discussion_id: 'disc-idea-1',
        user_id: 'demo-creator-02',
        author_name: 'Marcus Chen',
        author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        author_role: 'Founder',
        content: 'The biggest bottleneck for students is lecture math & diagram reproduction. If the AI can parse hand-drawn chalkboard notes alongside audio, this is a 10x tool.',
        likes_count: 8,
        reactions: { useful: 5, interesting: 4, inspiring: 2 },
        created_at: new Date(Date.now() - 3600000 * 4).toISOString()
      },
      {
        id: 'comm-2',
        discussion_id: 'disc-idea-1',
        user_id: 'demo-creator-01',
        author_name: 'Elena Rostova',
        author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        author_role: 'Research Fellow',
        parent_comment_id: 'comm-1',
        content: 'Exactly! We are prototyping a lightweight vision transformer pipeline to convert whiteboard photos directly into LaTeX/SVG cards alongside the audio transcript.',
        likes_count: 6,
        reactions: { useful: 4, inspiring: 5 },
        created_at: new Date(Date.now() - 3600000 * 3.5).toISOString()
      },
      {
        id: 'comm-3',
        discussion_id: 'disc-poll-1',
        user_id: 'demo-creator-05',
        author_name: 'Amara Vance',
        author_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        author_role: 'Systems Architect',
        content: 'Voted for the automated dynamic markdown engine. Supermarket managers we interviewed cared most about automating pricing decisions rather than manually checking shelves.',
        likes_count: 9,
        reactions: { useful: 7, interesting: 3 },
        created_at: new Date(Date.now() - 3600000 * 12).toISOString()
      },
      {
        id: 'comm-4',
        discussion_id: 'disc-1',
        user_id: 'demo-creator-01',
        author_name: 'Elena Rostova',
        author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        author_role: 'Research Fellow',
        content: 'We tested a flat monthly subscription during our early pilot. Merchants preferred predictable SaaS fees over fluctuating transaction percentages.',
        likes_count: 12,
        reactions: { useful: 8, interesting: 5 },
        created_at: new Date(Date.now() - 86400000 * 2.5).toISOString()
      },
      {
        id: 'comm-5',
        discussion_id: 'disc-1',
        user_id: 'demo-creator-03',
        author_name: 'Dr. Sarah Lin',
        author_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        author_role: 'Biomedical AI Researcher',
        parent_comment_id: 'comm-4',
        content: 'Agreed. Tiered subscriptions based on scanned volume gave our pilot partners the highest confidence without complicating invoicing.',
        likes_count: 5,
        reactions: { useful: 4, inspiring: 2 },
        created_at: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ];
  });

  const [loading, setLoading] = useState(false);

  const fetchCloudData = async () => {
    if (!isSupabaseConfigured) {
      // Re-read local storage
      const storedProj = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (storedProj) setProjects(JSON.parse(storedProj));
      const storedRev = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      if (storedRev) setReviews(JSON.parse(storedRev));
      return;
    }
    try {
      // 1. Fetch Cloud Projects
        const { data: dbProjects, error: pErr } = await supabase
          .from('projects')
          .select(`
            *,
            owner:profiles(id, full_name, avatar_url, username),
            tags:project_tags(tag),
            versions:project_versions(*),
            signals:innovation_signals(*),
            votes:project_votes(*)
          `)
          .order('created_at', { ascending: false });

        if (!pErr && dbProjects && dbProjects.length > 0) {
          const mappedProjects: Project[] = dbProjects.map((p: any) => {
            const upCount = p.votes?.filter((v: any) => v.vote_type === 'up').length || 0;
            const downCount = p.votes?.filter((v: any) => v.vote_type === 'down').length || 0;
            const myVote = user ? p.votes?.find((v: any) => v.user_id === user.id)?.vote_type || null : null;
            
            return {
              id: p.id,
              owner_id: p.owner_id,
              owner_name: p.owner?.full_name || 'Innovator',
              owner_avatar: p.owner?.avatar_url,
              title: p.title,
              project_type: p.project_type,
              category: p.category,
              problem_title: p.problem_title,
              problem_description: p.problem_description,
              solution_description: p.solution_description,
              target_audience: p.target_audience,
              value_proposition: p.value_proposition,
              differentiation: p.differentiation,
              live_url: p.live_url,
              github_url: p.github_url,
              demo_url: p.demo_url,
              cover_image_url: p.cover_image_url || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80',
              status: p.status,
              validation_status: p.validation_status,
              visibility: p.visibility,
              tags: p.tags?.map((t: any) => t.tag) || ['Innovation', 'Tech'],
              current_version: p.current_version || 1,
              created_at: p.created_at,
              updated_at: p.updated_at,
              validation_score: p.validation_score || 50,
              readiness_score: p.signals?.[0]?.readiness_score || p.validation_score || 50,
              reviews_count: 0,
              perspectives_count: 0,
              upvotes_count: upCount,
              downvotes_count: downCount,
              user_vote: myVote,
              is_demo: false
            };
          });

          setProjects(prev => {
            const customIds = new Set(mappedProjects.map(p => p.id));
            const nonConflicting = prev.filter(p => !customIds.has(p.id));
            return [...mappedProjects, ...nonConflicting];
          });
        }

        // 2. Fetch Cloud Discussions
        const { data: dbDiscussions } = await supabase
          .from('discussions')
          .select(`
            *,
            author:profiles(id, full_name, avatar_url)
          `)
          .order('created_at', { ascending: false });

        if (dbDiscussions && dbDiscussions.length > 0) {
          const mappedDiscussions: Discussion[] = dbDiscussions.map((d: any) => ({
            id: d.id,
            user_id: d.user_id,
            author_name: d.author?.full_name || 'Community Member',
            author_avatar: d.author?.avatar_url,
            title: d.title,
            content: d.content,
            category: d.category,
            likes_count: d.likes_count || 0,
            comments_count: d.comments_count || 0,
            created_at: d.created_at
          }));

          setDiscussions(prev => {
            const discIds = new Set(mappedDiscussions.map(d => d.id));
            const remaining = prev.filter(d => !discIds.has(d.id));
            return [...mappedDiscussions, ...remaining];
          });
        }
      } catch (err) {
        console.error('Supabase initial fetch error:', err);
      }
    };

    useEffect(() => {
      fetchCloudData();

      // 3. Supabase Realtime Subscriptions for live collaboration
      const realtimeChannel = supabase
        .channel('public:realtime_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newP = payload.new as any;
          setProjects(prev => {
            if (prev.some(p => p.id === newP.id)) return prev;
            const mapped: Project = {
              id: newP.id,
              owner_id: newP.owner_id,
              owner_name: 'Community Innovator',
              title: newP.title,
              project_type: newP.project_type,
              category: newP.category,
              problem_title: newP.problem_title,
              problem_description: newP.problem_description,
              solution_description: newP.solution_description,
              target_audience: newP.target_audience,
              value_proposition: newP.value_proposition,
              differentiation: newP.differentiation,
              live_url: newP.live_url,
              github_url: newP.github_url,
              demo_url: newP.demo_url,
              cover_image_url: newP.cover_image_url || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80',
              status: newP.status,
              validation_status: newP.validation_status,
              visibility: newP.visibility,
              tags: ['Innovation', newP.category],
              current_version: newP.current_version || 1,
              created_at: newP.created_at,
              updated_at: newP.updated_at,
              validation_score: newP.validation_score || 50,
              readiness_score: newP.validation_score || 50,
              reviews_count: 0,
              perspectives_count: 0,
              upvotes_count: 0,
              downvotes_count: 0,
              user_vote: null,
              is_demo: false
            };
            return [mapped, ...prev];
          });
        } else if (payload.eventType === 'UPDATE') {
          const updatedP = payload.new as any;
          setProjects(prev => prev.map(p => p.id === updatedP.id ? { ...p, ...updatedP } : p));
        } else if (payload.eventType === 'DELETE') {
          setProjects(prev => prev.filter(p => p.id !== (payload.old as any).id));
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reviews' }, (payload) => {
        const newR = payload.new as any;
        setReviews(prev => {
          if (prev.some(r => r.id === newR.id)) return prev;
          const mappedReview: Review = {
            id: newR.id,
            project_id: newR.project_id,
            reviewer_id: newR.reviewer_id,
            reviewer_name: 'Community Reviewer',
            problem_relevance: newR.problem_relevance,
            solution_clarity: newR.solution_clarity,
            usefulness: newR.usefulness,
            suggestion: newR.suggestion,
            review_type: newR.review_type,
            is_demo: false,
            quality_score: newR.quality_score || 80,
            helpful_votes: 0,
            created_at: newR.created_at
          };
          return [mappedReview, ...prev];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(realtimeChannel);
    };
  }, [user]);

  const refreshProjects = async () => {
    await fetchCloudData();
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VERSIONS, JSON.stringify(versions));
  }, [versions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RELATIONSHIPS, JSON.stringify(relationships));
  }, [relationships]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DECISIONS, JSON.stringify(decisions));
  }, [decisions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DISCUSSIONS, JSON.stringify(discussions));
  }, [discussions]);

  useEffect(() => {
    localStorage.setItem('innovexa_discussion_comments', JSON.stringify(comments));
  }, [comments]);

  const getProjectById = (id: string) => {
    return projects.find(p => p.id === id);
  };

  const getReviewsByProjectId = (projectId: string) => {
    return reviews.filter(r => r.project_id === projectId);
  };

  const getCommentsByDiscussionId = (discussionId: string) => {
    return comments.filter(c => c.discussion_id === discussionId).sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  };

  const getVersionsByProjectId = (projectId: string) => {
    return versions.filter(v => v.project_id === projectId).sort((a, b) => 
      String(b.version_number).localeCompare(String(a.version_number), undefined, { numeric: true })
    );
  };

  const getRelationshipsByProjectId = (projectId: string) => {
    return relationships
      .filter(rel => rel.project_id === projectId || rel.related_project_id === projectId)
      .map(rel => {
        const otherId = rel.project_id === projectId ? rel.related_project_id : rel.project_id;
        return {
          ...rel,
          related_project: getProjectById(otherId)
        };
      });
  };

  const getDecisionsByProjectId = (projectId: string) => {
    return decisions.filter(d => d.project_id === projectId);
  };

  const calculateMatchScore = (project: Project): number => {
    if (!user) return 70;
    let score = 50;

    if (user.interests && user.interests.length > 0) {
      const hasCategoryMatch = user.interests.some(i => 
        i.toLowerCase() === project.category.toLowerCase() ||
        project.tags.some(t => t.toLowerCase() === i.toLowerCase())
      );
      if (hasCategoryMatch) score += 30;
    }

    if (user.roles && user.roles.includes('Reviewer')) {
      score += 10;
    }
    if (user.roles && user.roles.includes('Builder')) {
      score += 10;
    }

    return Math.min(score, 98);
  };

  const createProject = async (
    projectData: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'current_version' | 'readiness_score' | 'reviews_count' | 'perspectives_count'>
  ): Promise<{ project: Project | null; error: string | null }> => {
    setLoading(true);
    try {
      let createdId = 'proj-' + Date.now();
      const now = new Date().toISOString();
      let ownerId = user?.id || 'anonymous-creator';

      const sanitizedTitle = projectData.title?.trim() || 'Untitled Innovation';
      const sanitizedProblemTitle = projectData.problem_title?.trim() || sanitizedTitle;
      const sanitizedProblemDesc = projectData.problem_description?.trim() || sanitizedProblemTitle;
      const sanitizedSolutionDesc = projectData.solution_description?.trim() || sanitizedProblemDesc;
      const sanitizedCategory = projectData.category?.trim() || 'Technology';
      const sanitizedTargetAudience = projectData.target_audience?.trim() || 'General Innovators & Early Adopters';
      const sanitizedValueProp = projectData.value_proposition?.trim() || sanitizedSolutionDesc;
      const sanitizedDiff = projectData.differentiation?.trim() || 'Novel community-driven approach';

      // 1. If Supabase is connected, attempt persistence directly to PostgreSQL Database
      if (isSupabaseConfigured) {
        const isValidUuid = (str?: string) => Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

        try {
          // Resolve authenticated user ID
          if (!isValidUuid(ownerId)) {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.id && isValidUuid(session.user.id)) {
              ownerId = session.user.id;
            }
          }

          // If still not a valid UUID (e.g. unauthenticated guest), fallback to an existing profile in database
          if (!isValidUuid(ownerId)) {
            const { data: profilesList } = await supabase
              .from('profiles')
              .select('id')
              .limit(1);

            if (profilesList && profilesList.length > 0) {
              ownerId = profilesList[0].id;
            }
          }

          // If we have a valid ownerId, insert into Supabase
          if (isValidUuid(ownerId)) {
            // Ensure profile exists in profiles table
            const { data: existingProf } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', ownerId)
              .maybeSingle();

            if (!existingProf) {
              await supabase.from('profiles').upsert({
                id: ownerId,
                full_name: user?.full_name || 'Community Innovator',
                username: 'innovator_' + ownerId.substring(0, 6),
                reputation_score: 100
              });
            }

            // Insert Project into public.projects
            const { data: dbProject, error: dbError } = await supabase
              .from('projects')
              .insert({
                owner_id: ownerId,
                title: sanitizedTitle,
                project_type: projectData.project_type || 'idea',
                category: sanitizedCategory,
                problem_title: sanitizedProblemTitle,
                problem_description: sanitizedProblemDesc,
                solution_description: sanitizedSolutionDesc,
                target_audience: sanitizedTargetAudience,
                value_proposition: sanitizedValueProp,
                differentiation: sanitizedDiff,
                live_url: projectData.live_url || null,
                github_url: projectData.github_url || null,
                demo_url: projectData.demo_url || null,
                cover_image_url: projectData.cover_image_url || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80',
                status: projectData.status || 'under_review',
                validation_status: projectData.validation_status || 'idea',
                visibility: projectData.visibility || 'public',
                current_version: 1,
                validation_score: 50
              })
              .select()
              .single();

            if (dbError) {
              console.warn('Supabase cloud insert notice (resilient mode active):', dbError.message);
            } else if (dbProject) {
              createdId = dbProject.id;

              // Insert Project Tags
              if (projectData.tags && projectData.tags.length > 0) {
                await supabase.from('project_tags').insert(
                  projectData.tags.map(tag => ({ project_id: createdId, tag }))
                );
              }

              // Insert Initial Project Version
              await supabase.from('project_versions').insert({
                project_id: createdId,
                version_number: 'v1.0',
                title: 'Initial Concept: ' + dbProject.title,
                description: dbProject.solution_description,
                changes_summary: 'Project concept created and submitted for validation.',
                validation_score: 50
              });

              // Insert Initial Validation Cycle
              await supabase.from('validation_cycles').insert({
                project_id: createdId,
                cycle_number: 1,
                status: 'active'
              });

              // Insert Innovation Telemetry Signals
              await supabase.from('innovation_signals').insert({
                project_id: createdId,
                problem_relevance_score: 50,
                solution_clarity_score: 50,
                user_interest_score: 50,
                differentiation_score: 50,
                readiness_score: 50,
                overall_validation_score: 50
              });

              // Insert Creator Notification
              await supabase.from('notifications').insert({
                user_id: ownerId,
                type: 'system',
                title: 'Project Created',
                message: `"${sanitizedTitle}" has been saved in the cloud. We are matching domain reviewers.`,
                link: `/projects/${createdId}`,
                is_read: false
              });
            }
          }
        } catch (cloudErr: any) {
          console.warn('Supabase cloud sync note:', cloudErr?.message || cloudErr);
        }
      }

      const newProject: Project = {
        ...projectData,
        id: createdId,
        title: sanitizedTitle,
        category: sanitizedCategory,
        problem_title: sanitizedProblemTitle,
        problem_description: sanitizedProblemDesc,
        solution_description: sanitizedSolutionDesc,
        target_audience: sanitizedTargetAudience,
        value_proposition: sanitizedValueProp,
        differentiation: sanitizedDiff,
        owner_id: ownerId,
        owner_name: user?.full_name || 'Anonymous Innovator',
        owner_avatar: user?.avatar_url,
        current_version: 1,
        created_at: now,
        updated_at: now,
        readiness_score: 50,
        validation_score: 50,
        reviews_count: 0,
        perspectives_count: 0,
        upvotes_count: 0,
        downvotes_count: 0,
        user_vote: null,
        is_demo: false,
        tags: projectData.tags && projectData.tags.length > 0 ? projectData.tags : [sanitizedCategory, projectData.project_type || 'product']
      };

      // Create Initial Version 1 in local state
      const initialVersion: ProjectVersion = {
        id: 'ver-' + Date.now(),
        project_id: createdId,
        version_number: 1,
        title: 'Initial Concept: ' + newProject.title,
        description: newProject.solution_description,
        changes_summary: 'Project created and submitted for community perspective matching.',
        created_at: now
      };

      // Automatically generate relationship connections
      const relatedCandidates = projects.filter(p => p.category === newProject.category && p.id !== createdId);
      const newRelationships: ProjectRelationship[] = relatedCandidates.slice(0, 2).map((relProj, idx) => ({
        id: `rel-${Date.now()}-${idx}`,
        project_id: createdId,
        related_project_id: relProj.id,
        relationship_type: idx === 0 ? 'shared_category' : 'similar_audience',
        similarity_score: 0.85,
        explanation: `Both explore solutions in ${newProject.category} with complementary approaches.`,
        created_at: now
      }));

      // Update state
      setProjects(prev => [newProject, ...prev]);
      setVersions(prev => [initialVersion, ...prev]);
      if (newRelationships.length > 0) {
        setRelationships(prev => [...newRelationships, ...prev]);
      }

      // Add notification for creator
      const newNotif: Notification = {
        id: 'notif-' + Date.now(),
        user_id: user?.id || 'current',
        type: 'system',
        title: 'Project Created',
        message: `"${newProject.title}" has been saved. We are matching domain reviewers.`,
        link: `/projects/${createdId}`,
        is_read: false,
        created_at: now
      };
      setNotifications(prev => [newNotif, ...prev]);

      // Award Points for submitting a new innovation
      awardReputationPoints(50, `Submitted Innovation: "${newProject.title}"`);

      return { project: newProject, error: null };
    } catch (err: any) {
      console.error('Project creation failed:', err);
      return { project: null, error: err.message || 'Failed to create project' };
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>): Promise<{ error: string | null }> => {
    try {
      if (isSupabaseConfigured && !id.startsWith('demo-') && !id.startsWith('proj-')) {
        const { error } = await supabase
          .from('projects')
          .update({
            title: updates.title,
            category: updates.category,
            problem_title: updates.problem_title,
            problem_description: updates.problem_description,
            solution_description: updates.solution_description,
            target_audience: updates.target_audience,
            value_proposition: updates.value_proposition,
            differentiation: updates.differentiation,
            live_url: updates.live_url,
            github_url: updates.github_url,
            demo_url: updates.demo_url,
            cover_image_url: updates.cover_image_url,
            status: updates.status,
            validation_status: updates.validation_status,
            visibility: updates.visibility,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        if (error) console.error('Error updating project in Supabase:', error);
      }

      setProjects(prev => prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            ...updates,
            updated_at: new Date().toISOString()
          };
        }
        return p;
      }));
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const deleteProject = async (id: string): Promise<{ error: string | null }> => {
    try {
      if (isSupabaseConfigured && !id.startsWith('demo-') && !id.startsWith('proj-')) {
        await supabase.from('projects').delete().eq('id', id);
      }

      setProjects(prev => prev.filter(p => p.id !== id));
      setVersions(prev => prev.filter(v => v.project_id !== id));
      setRelationships(prev => prev.filter(r => r.project_id !== id && r.related_project_id !== id));
      setReviews(prev => prev.filter(rv => rv.project_id !== id));
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const createNewVersion = async (
    projectId: string, 
    title: string, 
    description: string, 
    changesSummary: string
  ): Promise<{ error: string | null }> => {
    try {
      const project = getProjectById(projectId);
      if (!project) return { error: 'Project not found' };

      const nextVersionNum = project.current_version + 1;
      const newVer: ProjectVersion = {
        id: 'ver-' + Date.now(),
        project_id: projectId,
        version_number: nextVersionNum,
        title,
        description,
        changes_summary: changesSummary,
        created_at: new Date().toISOString()
      };

      if (isSupabaseConfigured && !projectId.startsWith('demo-') && !projectId.startsWith('proj-')) {
        await supabase.from('project_versions').insert({
          project_id: projectId,
          version_number: `v${nextVersionNum}.0`,
          title,
          description,
          changes_summary: changesSummary,
          validation_score: project.validation_score || 50
        });

        await supabase.from('projects').update({
          current_version: nextVersionNum,
          updated_at: new Date().toISOString()
        }).eq('id', projectId);
      }

      setVersions(prev => [newVer, ...prev]);
      setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            current_version: nextVersionNum,
            solution_description: description || p.solution_description,
            updated_at: new Date().toISOString()
          };
        }
        return p;
      }));

      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const publishProject = async (projectId: string): Promise<{ error: string | null }> => {
    return updateProject(projectId, { status: 'published', visibility: 'public' });
  };

  const voteProject = async (projectId: string, voteType: 'up' | 'down'): Promise<void> => {
    const votesKey = STORAGE_KEYS.PROJECT_VOTES;
    let userVotes: Record<string, 'up' | 'down'> = {};
    try {
      const stored = localStorage.getItem(votesKey);
      if (stored) userVotes = JSON.parse(stored);
    } catch (e) {
      userVotes = {};
    }

    const currentVote = userVotes[projectId];
    let nextVote: 'up' | 'down' | null = null;

    if (currentVote === voteType) {
      nextVote = null;
    } else {
      nextVote = voteType;
    }

    if (isSupabaseConfigured && user && !projectId.startsWith('demo-') && !projectId.startsWith('proj-')) {
      try {
        if (nextVote) {
          await supabase.from('project_votes').upsert({
            project_id: projectId,
            user_id: user.id,
            vote_type: nextVote
          });
        } else {
          await supabase.from('project_votes').delete().match({
            project_id: projectId,
            user_id: user.id
          });
        }
      } catch (e) {
        console.error('Supabase vote error:', e);
      }
    }

    setProjects(prev => {
      const updated = prev.map(p => {
        if (p.id !== projectId) return p;

        let upCount = p.upvotes_count ?? 12;
        let downCount = p.downvotes_count ?? 1;

        if (currentVote === voteType) {
          if (voteType === 'up') upCount = Math.max(0, upCount - 1);
          if (voteType === 'down') downCount = Math.max(0, downCount - 1);
        } else if (currentVote) {
          if (voteType === 'up') {
            upCount += 1;
            downCount = Math.max(0, downCount - 1);
          } else {
            downCount += 1;
            upCount = Math.max(0, upCount - 1);
          }
        } else {
          if (voteType === 'up') upCount += 1;
          if (voteType === 'down') downCount += 1;
        }

        return {
          ...p,
          upvotes_count: upCount,
          downvotes_count: downCount,
          user_vote: nextVote
        };
      });

      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updated));
      return updated;
    });

    if (nextVote) {
      userVotes[projectId] = nextVote;
      if (nextVote === 'up') {
        awardReputationPoints(5, 'Upvoted an Innovation Concept (+5 pts)');
      } else {
        awardReputationPoints(2, 'Contributed Validation Signal (+2 pts)');
      }
    } else {
      delete userVotes[projectId];
    }
    localStorage.setItem(votesKey, JSON.stringify(userVotes));
  };

  const submitReview = async (reviewData: {
    projectId: string;
    problemRelevance: 'yes' | 'sometimes' | 'no';
    solutionClarity: 'yes' | 'partially' | 'no';
    usefulness: 'yes' | 'maybe' | 'no';
    suggestion?: string;
    reviewType: 'constructive' | 'suggestion' | 'question' | 'praise';
  }): Promise<{ error: string | null }> => {
    try {
      const project = getProjectById(reviewData.projectId);
      if (!project) return { error: 'Project not found' };

      const reviewerId = user?.id || ('guest-' + Math.random().toString(36).substring(2, 7));
      const reviewerName = user?.full_name || (user && project.owner_id === user.id ? `${user.full_name || 'Innovator'} (Creator)` : 'Community Innovator');

      let qualityScore = 75;
      if (reviewData.suggestion && reviewData.suggestion.length > 20) qualityScore += 15;
      if (reviewData.suggestion && reviewData.suggestion.length > 80) qualityScore += 10;

      const newReview: Review = {
        id: 'rev-' + Date.now(),
        project_id: reviewData.projectId,
        reviewer_id: reviewerId,
        reviewer_name: reviewerName,
        reviewer_avatar: user?.avatar_url,
        reviewer_role: user?.roles?.[0] || 'Peer Reviewer',
        problem_relevance: reviewData.problemRelevance,
        solution_clarity: reviewData.solutionClarity,
        usefulness: reviewData.usefulness,
        suggestion: reviewData.suggestion,
        review_type: reviewData.reviewType,
        is_demo: false,
        quality_score: qualityScore,
        helpful_votes: 0,
        created_at: new Date().toISOString()
      };

      if (isSupabaseConfigured && user && !reviewData.projectId.startsWith('demo-') && !reviewData.projectId.startsWith('proj-')) {
        try {
          await supabase.from('reviews').insert({
            project_id: reviewData.projectId,
            reviewer_id: user.id,
            problem_relevance: reviewData.problemRelevance,
            solution_clarity: reviewData.solutionClarity,
            usefulness: reviewData.usefulness,
            suggestion: reviewData.suggestion || null,
            review_type: reviewData.reviewType,
            quality_score: qualityScore
          });
        } catch (e) {
          console.error('Supabase review insert error:', e);
        }
      }

      const updatedReviews = [newReview, ...reviews];
      setReviews(updatedReviews);

      const projectReviews = updatedReviews.filter(r => r.project_id === reviewData.projectId);
      const totalReviews = projectReviews.length;
      
      let positivePoints = 0;
      projectReviews.forEach(r => {
        if (r.problem_relevance === 'yes') positivePoints += 33.3;
        else if (r.problem_relevance === 'sometimes') positivePoints += 16.6;

        if (r.solution_clarity === 'yes') positivePoints += 33.3;
        else if (r.solution_clarity === 'partially') positivePoints += 16.6;

        if (r.usefulness === 'yes') positivePoints += 33.4;
        else if (r.usefulness === 'maybe') positivePoints += 16.7;
      });

      const avgPositivePercentage = totalReviews > 0 ? Math.round(positivePoints / totalReviews) : 50;
      const calculatedReadiness = Math.min(Math.round(avgPositivePercentage * 0.8 + Math.min(totalReviews * 4, 20)), 98);

      setProjects(prev => prev.map(p => {
        if (p.id === reviewData.projectId) {
          return {
            ...p,
            readiness_score: calculatedReadiness,
            reviews_count: totalReviews,
            perspectives_count: totalReviews
          };
        }
        return p;
      }));

      if (project.owner_id && project.owner_id !== 'anonymous') {
        const notif: Notification = {
          id: 'notif-' + Date.now(),
          user_id: project.owner_id,
          type: 'review_received',
          title: 'New Perspective Received',
          message: `${newReview.reviewer_name} gave feedback on "${project.title}".`,
          link: `/projects/${project.id}?tab=reviews`,
          is_read: false,
          created_at: new Date().toISOString()
        };
        setNotifications(prev => [notif, ...prev]);
      }

      awardReputationPoints(20, `Submitted Constructive Perspective on "${project.title}" (+20 pts)`);

      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Failed to submit review' };
    }
  };

  const saveFeedbackDecision = async (projectId: string, reviewId: string, decision: FeedbackDecisionType, notes?: string) => {
    const newDecision: FeedbackDecision = {
      id: 'dec-' + Date.now(),
      project_id: projectId,
      review_id: reviewId,
      decision,
      notes,
      created_at: new Date().toISOString()
    };

    setDecisions(prev => {
      const filtered = prev.filter(d => !(d.project_id === projectId && d.review_id === reviewId));
      return [newDecision, ...filtered];
    });
  };

  const getProjectInsights = (projectId: string): ProjectInsightsData => {
    const project = getProjectById(projectId);
    const projReviews = getReviewsByProjectId(projectId);
    const total = projReviews.length;

    if (total === 0) {
      const cat = project?.category || 'General';
      const audience = project?.target_audience || 'Early adopters & target users';
      return {
        readiness_score: project?.readiness_score || 55,
        total_reviews: 0,
        positive_signals: [
          { label: 'Problem Significance', percentage: 75, count: 1 },
          { label: 'Target Audience Resonance', percentage: 70, count: 1 }
        ],
        constructive_signals: [
          { label: 'Feature Prioritization', percentage: 45, count: 1 }
        ],
        critical_signals: [
          { label: 'Competitive Differentiation', percentage: 25, count: 0 }
        ],
        common_suggestions: [
          `Build a functional interactive prototype focusing specifically on ${audience}.`,
          'Incorporate user analytics to validate weekly retention during initial beta testing.'
        ],
        breakdown: {
          problem_relevance: { yes: 1, sometimes: 0, no: 0 },
          solution_clarity: { yes: 1, partially: 0, no: 0 },
          usefulness: { yes: 1, maybe: 0, no: 0 }
        },
        ai_summary: {
          strengths: [
            `Strong domain alignment in ${cat} addressing a clear user pain point.`,
            `Well-defined target audience (${audience}) allows focused early beta validation.`,
            'High potential for open-source component reuse to accelerate initial MVP delivery.'
          ],
          concerns: [
            'Needs clearer onboarding demonstration to minimize initial user drop-off.',
            'Differentiation versus legacy tools requires explicit feature comparison proof.'
          ],
          suggested_actions: [
            'Deploy an interactive demo or clickable mockup to gather immediate real user feedback.',
            'Implement open-source backend primitives (e.g. Supabase / FastAPI) to cut cloud costs.',
            'Create a public roadmap and release Version 2 addressing core usability workflows.',
            'Engage 5 early beta testers from the INNOVEXA community to submit detailed structured reviews.'
          ],
          summary_text: `"${project?.title || 'This project'}" is primed for rapid validation. To maximize momentum, release a lightweight prototype and leverage open-source building blocks to prove product-market fit with ${audience}.`
        }
      };
    }

    const relCounts: { yes: number; sometimes: number; no: number } = { yes: 0, sometimes: 0, no: 0 };
    const clarCounts: { yes: number; partially: number; no: number } = { yes: 0, partially: 0, no: 0 };
    const useCounts: { yes: number; maybe: number; no: number } = { yes: 0, maybe: 0, no: 0 };

    projReviews.forEach(r => {
      const relKey = (r.problem_relevance === 'maybe' ? 'sometimes' : (r.problem_relevance || 'yes')) as 'yes' | 'sometimes' | 'no';
      if (relKey in relCounts) {
        relCounts[relKey] = (relCounts[relKey] || 0) + 1;
      }

      const clarKey = (r.solution_clarity || (r.solution_value === 'very_useful' ? 'yes' : r.solution_value === 'useful' ? 'partially' : 'no')) as 'yes' | 'partially' | 'no';
      if (clarKey in clarCounts) {
        clarCounts[clarKey] = (clarCounts[clarKey] || 0) + 1;
      }

      const useKey = (r.usefulness || (r.solution_value === 'very_useful' ? 'yes' : r.solution_value === 'useful' ? 'maybe' : 'no')) as 'yes' | 'maybe' | 'no';
      if (useKey in useCounts) {
        useCounts[useKey] = (useCounts[useKey] || 0) + 1;
      }
    });

    const probRelPct = Math.round((((relCounts.yes || 0) + (relCounts.sometimes || 0) * 0.5) / total) * 100);
    const solClarPct = Math.round((((clarCounts.yes || 0) + (clarCounts.partially || 0) * 0.5) / total) * 100);
    const usePct = Math.round((((useCounts.yes || 0) + (useCounts.maybe || 0) * 0.5) / total) * 100);

    const suggestions = projReviews
      .filter(r => r.suggestion && r.suggestion.trim().length > 0)
      .map(r => r.suggestion as string);

    return {
      readiness_score: project?.readiness_score || Math.round((probRelPct + solClarPct + usePct) / 3),
      total_reviews: total,
      positive_signals: [
        { label: 'Strong Problem Resonance', percentage: probRelPct, count: relCounts.yes },
        { label: 'High Intent to Use / Support', percentage: usePct, count: useCounts.yes }
      ],
      constructive_signals: [
        { label: 'Solution Clarity Needs Tuning', percentage: Math.max(0, 100 - solClarPct), count: clarCounts.partially }
      ],
      critical_signals: [
        { label: 'Irrelevant to Subset of Users', percentage: Math.round((relCounts.no / total) * 100), count: relCounts.no }
      ],
      common_suggestions: suggestions.length > 0 ? suggestions : ['No specific suggestions written yet.'],
      breakdown: {
        problem_relevance: relCounts,
        solution_clarity: clarCounts,
        usefulness: useCounts
      },
      ai_summary: {
        strengths: [
          'High problem validation score with strong empathy from target demographic.',
          'Value proposition is clear and easy for peer reviewers to evaluate quickly.'
        ],
        concerns: [
          'Some reviewers noted potential friction in initial user onboarding.',
          'Differentiation against established market alternatives needs sharper articulation.'
        ],
        suggested_actions: [
          'Add concrete workflow diagrams to the project details section.',
          'Consider conducting a focused review round with domain specialists.'
        ],
        summary_text: `Based on ${total} community reviews, ${project?.title || 'this project'} demonstrates strong baseline interest (${probRelPct}% problem alignment). Recommended next step is reviewing constructive suggestions and releasing an updated version.`
      }
    };
  };

  const createDiscussion = async (
    title: string,
    content: string,
    category: string,
    options?: {
      post_type?: PostType;
      tags?: string[];
      project_id?: string;
      project_title?: string;
      project_category?: string;
      poll_options?: string[];
      project_update?: ProjectUpdateMeta;
      resource?: ResourceMeta;
      media_url?: string;
    }
  ) => {
    let newDiscId = 'disc-' + Date.now();
    const userId = user?.id || 'current';
    const authorName = user?.full_name || 'Innovator';
    const authorAvatar = user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

    if (isSupabaseConfigured && user) {
      try {
        const { data: dbDisc } = await supabase
          .from('discussions')
          .insert({
            user_id: user.id,
            title,
            content,
            category,
            likes_count: 1,
            comments_count: 0
          })
          .select()
          .single();

        if (dbDisc) {
          newDiscId = dbDisc.id;
        }
      } catch (e) {
        console.error('Supabase discussion create error:', e);
      }
    }

    const pollOptionsObj: PollOption[] | undefined = options?.poll_options?.map((opt, i) => ({
      id: `opt-${Date.now()}-${i}`,
      text: opt,
      votes: 0,
      votedUserIds: []
    }));

    const newDisc: Discussion = {
      id: newDiscId,
      user_id: userId,
      author_name: authorName,
      author_avatar: authorAvatar,
      author_role: (user as any)?.role || user?.roles?.[0] || 'Innovator',
      post_type: options?.post_type || 'discussion',
      title,
      content,
      category: category || 'General',
      tags: options?.tags || ['Innovation', category || 'General'],
      project_id: options?.project_id,
      project_title: options?.project_title,
      project_category: options?.project_category,
      poll_options: pollOptionsObj,
      total_votes: 0,
      project_update: options?.project_update,
      resource: options?.resource,
      media_url: options?.media_url,
      likes_count: 1,
      comments_count: 0,
      reactions: { useful: 1 },
      user_reaction: 'useful',
      quick_feedback: options?.post_type === 'idea' ? { '🔥 Great potential': 1 } : undefined,
      created_at: new Date().toISOString()
    };

    setDiscussions(prev => {
      const updated = [newDisc, ...prev];
      localStorage.setItem(STORAGE_KEYS.DISCUSSIONS, JSON.stringify(updated));
      return updated;
    });
    awardReputationPoints(10, 'Started Community Discussion (+10 pts)');
  };

  const addDiscussionComment = async (discussionId: string, content: string, parentCommentId?: string) => {
    let newCommId = 'comm-' + Date.now();
    const userId = user?.id || 'current';
    const authorName = user?.full_name || 'Innovator';
    const authorAvatar = user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

    if (isSupabaseConfigured && user && !discussionId.startsWith('disc-')) {
      try {
        const { data: dbComment } = await supabase
          .from('discussion_comments')
          .insert({
            discussion_id: discussionId,
            user_id: user.id,
            content
          })
          .select()
          .single();

        if (dbComment) newCommId = dbComment.id;
      } catch (e) {
        console.error('Supabase comment insert error:', e);
      }
    }

    const newComment: DiscussionComment = {
      id: newCommId,
      discussion_id: discussionId,
      user_id: userId,
      author_name: authorName,
      author_avatar: authorAvatar,
      author_role: (user as any)?.role || user?.roles?.[0] || 'Innovator',
      parent_comment_id: parentCommentId,
      content,
      likes_count: 0,
      reactions: {},
      created_at: new Date().toISOString()
    };

    setComments(prev => {
      const updated = [...prev, newComment];
      localStorage.setItem('innovexa_discussion_comments', JSON.stringify(updated));
      return updated;
    });

    setDiscussions(prev => {
      const updated = prev.map(d => {
        if (d.id === discussionId) {
          // Notify author if not self
          if (d.user_id !== userId) {
            setNotifications(notifs => [
              {
                id: 'notif-' + Date.now(),
                user_id: d.user_id,
                type: 'discussion_reply',
                title: 'New Community Perspective',
                message: `${authorName} commented on your post "${d.title.slice(0, 40)}..."`,
                link: '/community',
                is_read: false,
                created_at: new Date().toISOString()
              },
              ...notifs
            ]);
          }
          return {
            ...d,
            comments_count: (d.comments_count || 0) + 1
          };
        }
        return d;
      });
      localStorage.setItem(STORAGE_KEYS.DISCUSSIONS, JSON.stringify(updated));
      return updated;
    });

    awardReputationPoints(5, 'Contributed Community Perspective (+5 pts)');
  };

  const reactToPost = async (postId: string, reaction: ReactionType) => {
    setDiscussions(prev => {
      const updated = prev.map(d => {
        if (d.id !== postId) return d;

        const currentReaction = d.user_reaction;
        const reactions: Record<string, number> = { ...(d.reactions as any || {}) };

        // If clicking the same reaction, toggle off
        if (currentReaction === reaction) {
          reactions[reaction] = Math.max(0, (reactions[reaction] || 1) - 1);
          const totalLikes = Object.values(reactions).reduce((acc: number, val: number) => acc + (val || 0), 0);
          return {
            ...d,
            user_reaction: null,
            reactions,
            likes_count: totalLikes
          };
        }

        // If switching reaction, decrement old
        if (currentReaction && reactions[currentReaction]) {
          reactions[currentReaction] = Math.max(0, (reactions[currentReaction] || 1) - 1);
        }

        // Increment new reaction
        reactions[reaction] = (reactions[reaction] || 0) + 1;
        const totalLikes = Object.values(reactions).reduce((acc: number, val: number) => acc + (val || 0), 0);

        // Notify post author if not self
        const currentUserId = user?.id || 'current';
        if (d.user_id !== currentUserId) {
          setNotifications(notifs => [
            {
              id: 'notif-' + Date.now(),
              user_id: d.user_id,
              type: 'system',
              title: 'Community Reaction',
              message: `${user?.full_name || 'An innovator'} reacted (${reaction}) to "${d.title.slice(0, 35)}..."`,
              link: '/community',
              is_read: false,
              created_at: new Date().toISOString()
            },
            ...notifs
          ]);
        }

        return {
          ...d,
          user_reaction: reaction,
          reactions,
          likes_count: totalLikes
        };
      });
      localStorage.setItem(STORAGE_KEYS.DISCUSSIONS, JSON.stringify(updated));
      return updated;
    });
  };

  const toggleSavePost = (postId: string) => {
    setDiscussions(prev => {
      const updated = prev.map(d => {
        if (d.id === postId) {
          return { ...d, is_saved: !d.is_saved };
        }
        return d;
      });
      localStorage.setItem(STORAGE_KEYS.DISCUSSIONS, JSON.stringify(updated));
      return updated;
    });
  };

  const toggleFollowDiscussion = (postId: string) => {
    setDiscussions(prev => {
      const updated = prev.map(d => {
        if (d.id === postId) {
          return { ...d, is_following: !d.is_following };
        }
        return d;
      });
      localStorage.setItem(STORAGE_KEYS.DISCUSSIONS, JSON.stringify(updated));
      return updated;
    });
  };

  const votePoll = (postId: string, optionId: string) => {
    const currentUserId = user?.id || 'current';

    setDiscussions(prev => {
      const updated = prev.map(d => {
        if (d.id !== postId || !d.poll_options) return d;

        let userAlreadyVotedOptionId: string | null = null;
        d.poll_options.forEach(opt => {
          if (opt.votedUserIds?.includes(currentUserId)) {
            userAlreadyVotedOptionId = opt.id;
          }
        });

        // If voted on same option, toggle vote off
        if (userAlreadyVotedOptionId === optionId) {
          const updatedOptions = d.poll_options.map(opt => {
            if (opt.id === optionId) {
              return {
                ...opt,
                votes: Math.max(0, opt.votes - 1),
                votedUserIds: (opt.votedUserIds || []).filter(uid => uid !== currentUserId)
              };
            }
            return opt;
          });
          const total = updatedOptions.reduce((acc, o) => acc + o.votes, 0);
          return { ...d, poll_options: updatedOptions, total_votes: total };
        }

        // Otherwise update votes
        const updatedOptions = d.poll_options.map(opt => {
          if (opt.id === userAlreadyVotedOptionId) {
            return {
              ...opt,
              votes: Math.max(0, opt.votes - 1),
              votedUserIds: (opt.votedUserIds || []).filter(uid => uid !== currentUserId)
            };
          }
          if (opt.id === optionId) {
            return {
              ...opt,
              votes: opt.votes + 1,
              votedUserIds: [...(opt.votedUserIds || []), currentUserId]
            };
          }
          return opt;
        });

        const total = updatedOptions.reduce((acc, o) => acc + o.votes, 0);
        return { ...d, poll_options: updatedOptions, total_votes: total };
      });
      localStorage.setItem(STORAGE_KEYS.DISCUSSIONS, JSON.stringify(updated));
      return updated;
    });
    awardReputationPoints(2, 'Voted on Community Innovation Poll (+2 pts)');
  };

  const submitQuickIdeaFeedback = (postId: string, key: string) => {
    setDiscussions(prev => {
      const updated = prev.map(d => {
        if (d.id !== postId) return d;
        const currentFeedback = { ...(d.quick_feedback || {}) };
        currentFeedback[key] = (currentFeedback[key] || 0) + 1;
        return {
          ...d,
          quick_feedback: currentFeedback
        };
      });
      localStorage.setItem(STORAGE_KEYS.DISCUSSIONS, JSON.stringify(updated));
      return updated;
    });
    awardReputationPoints(2, 'Shared Quick Idea Feedback (+2 pts)');
  };

  const deleteDiscussion = async (postId: string) => {
    if (isSupabaseConfigured && !postId.startsWith('disc-')) {
      try {
        await supabase.from('discussions').delete().eq('id', postId);
      } catch (e) {
        console.error('Supabase delete discussion error:', e);
      }
    }
    setDiscussions(prev => {
      const updated = prev.filter(d => d.id !== postId);
      localStorage.setItem(STORAGE_KEYS.DISCUSSIONS, JSON.stringify(updated));
      return updated;
    });
    setComments(prev => {
      const updated = prev.filter(c => c.discussion_id !== postId);
      localStorage.setItem('innovexa_discussion_comments', JSON.stringify(updated));
      return updated;
    });
  };

  const sendMessage = async (receiverId: string, content: string) => {
    const newMsg: Message = {
      id: 'msg-' + Date.now(),
      sender_id: user?.id || 'current',
      receiver_id: receiverId,
      sender_name: user?.full_name || 'You',
      sender_avatar: user?.avatar_url,
      content,
      is_read: false,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMsg]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const getConversationWith = (userId: string) => {
    const currentId = user?.id || 'current';
    return messages.filter(m => 
      (m.sender_id === currentId && m.receiver_id === userId) ||
      (m.sender_id === userId && m.receiver_id === currentId)
    ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      reviews,
      versions,
      relationships,
      decisions,
      notifications,
      messages,
      discussions,
      comments,
      loading,
      getProjectById,
      getReviewsByProjectId,
      getVersionsByProjectId,
      getRelationshipsByProjectId,
      getDecisionsByProjectId,
      getCommentsByDiscussionId,
      createProject,
      updateProject,
      deleteProject,
      createNewVersion,
      publishProject,
      voteProject,
      submitReview,
      saveFeedbackDecision,
      getProjectInsights,
      calculateMatchScore,
      refreshProjects,
      createDiscussion,
      addDiscussionComment,
      reactToPost,
      toggleSavePost,
      toggleFollowDiscussion,
      votePoll,
      submitQuickIdeaFeedback,
      deleteDiscussion,
      sendMessage,
      markNotificationRead,
      getConversationWith
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
