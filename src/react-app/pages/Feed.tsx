import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Flag, Send } from 'lucide-react';
import { useAuth } from '@/react-app/hooks/useAuth';
import { useToast } from '@/react-app/hooks/useToast';
import LoadingSpinner from '@/react-app/components/LoadingSpinner';
import EmptyState from '@/react-app/components/EmptyState';

interface Post {
  id: string;
  brandId: string;
  type: string;
  title: string | null;
  content: string;
  imageUrl: string | null;
  isPinned: boolean;
  likesCount: number;
  commentsCount: number;
  userLiked: boolean;
  authorName: string | null;
  brandName: string;
  brandLogoUrl: string | null;
  createdAt: string;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export default function FeedPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch('/api/feed', { headers });
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch posts', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) {
      toast.info('Inicia sesión para dar me gusta');
      return;
    }

    const token = localStorage.getItem('accessToken');
    const response = await fetch(`/api/feed/posts/${postId}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const { liked } = await response.json();
      setPosts(posts.map(p => p.id === postId ? {
        ...p,
        userLiked: liked,
        likesCount: p.likesCount + (liked ? 1 : -1)
      } : p));
    }
  };

  const loadComments = async (postId: string) => {
    if (comments[postId]) {
      setSelectedPost(selectedPost === postId ? null : postId);
      return;
    }

    try {
      const response = await fetch(`/api/feed/posts/${postId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments({ ...comments, [postId]: data.comments });
        setSelectedPost(postId);
      }
    } catch (error) {
      console.error('Failed to load comments', error);
    }
  };

  const submitComment = async (postId: string) => {
    if (!user || !commentText.trim()) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/feed/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: commentText }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments({
          ...comments,
          [postId]: [...(comments[postId] || []), newComment]
        });
        setPosts(posts.map(p => p.id === postId ? {
          ...p,
          commentsCount: p.commentsCount + 1
        } : p));
        setCommentText('');
        toast.success('Comentario publicado');
      } else {
        toast.error('Error al publicar comentario');
      }
    } catch (error) {
      console.error('Failed to submit comment', error);
      toast.error('Error al publicar comentario');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Cargando feed..." />;
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] p-4 pb-20">
      <div className="max-w-3xl mx-auto pt-8">
        <h1 className="text-3xl md:text-4xl font-bold text-[#050505] mb-6 md:mb-8">Feed</h1>

        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-200">
            <EmptyState
              icon={MessageCircle}
              title="No hay publicaciones aún"
              description="Todavía no hay contenido de tus marcas favoritas. Volvé pronto para ver las últimas novedades."
              iconColor="from-blue-500 to-blue-600"
            />
          </div>
        ) : (
          <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl shadow-md overflow-hidden">
              {/* Post Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  {post.brandLogoUrl && (
                    <img src={post.brandLogoUrl} alt={post.brandName} className="w-10 h-10 rounded-full" />
                  )}
                  <div>
                    <div className="text-[#050505] font-semibold">{post.brandName}</div>
                    {post.authorName && (
                      <div className="text-[#65676B] text-sm">by {post.authorName}</div>
                    )}
                  </div>
                  {post.isPinned && (
                    <span className="ml-auto bg-[#E7F3FF] text-[#1877F2] px-3 py-1 rounded-full text-xs font-medium">
                      Pinned
                    </span>
                  )}
                </div>

                {post.title && (
                  <h2 className="text-xl font-bold text-[#050505] mb-2">{post.title}</h2>
                )}
                <p className="text-[#050505] whitespace-pre-wrap">{post.content}</p>
              </div>

              {post.imageUrl && (
                <img src={post.imageUrl} alt="" className="w-full" />
              )}

              {/* Post Actions */}
              <div className="p-4 flex items-center space-x-6 border-b border-gray-200">
                <button
                  onClick={() => toggleLike(post.id)}
                  disabled={!user}
                  className={`flex items-center space-x-2 ${
                    post.userLiked ? 'text-[#1877F2]' : 'text-[#65676B] hover:text-[#050505]'
                  } transition-colors disabled:opacity-50 font-medium`}
                >
                  <Heart className={`w-5 h-5 ${post.userLiked ? 'fill-current' : ''}`} />
                  <span>{post.likesCount}</span>
                </button>

                <button
                  onClick={() => loadComments(post.id)}
                  className="flex items-center space-x-2 text-[#65676B] hover:text-[#050505] transition-colors font-medium"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{post.commentsCount}</span>
                </button>

                {user && (
                  <button className="ml-auto text-[#65676B] hover:text-[#050505] transition-colors">
                    <Flag className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Comments Section */}
              {selectedPost === post.id && (
                <div className="p-6 space-y-4 bg-[#F0F2F5]">
                  {comments[post.id]?.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <div className="w-8 h-8 bg-[#E4E6EB] rounded-full flex-shrink-0" />
                      <div className="flex-1">
                        <div className="bg-[#E4E6EB] rounded-2xl px-4 py-2">
                          <div className="text-[#050505] font-medium text-sm">{comment.userName}</div>
                          <div className="text-[#050505] text-sm">{comment.content}</div>
                        </div>
                        <div className="text-[#65676B] text-xs mt-1 ml-4">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}

                  {user && (
                    <div className="flex space-x-2 pt-4 border-t border-gray-200">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1 px-4 py-2 bg-[#E4E6EB] border-none rounded-full text-[#050505] placeholder-[#65676B] focus:outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && submitComment(post.id)}
                      />
                      <button
                        onClick={() => submitComment(post.id)}
                        disabled={!commentText.trim() || submitting}
                        className="px-4 py-2 bg-[#1877F2] text-white rounded-full hover:bg-[#166FE5] transition-colors disabled:opacity-50"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          </div>
        )}
      </div>
    </div>
  );
}
