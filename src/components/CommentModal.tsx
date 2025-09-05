import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChapterMap } from '../types/map';
import { useAuth } from '../contexts/AuthContext';
import { addComment, toggleCommentLike, toggleLike } from '../services/mapService';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  map: ChapterMap;
  onCommentAdded?: (updatedMap: ChapterMap) => void;
}

export function CommentModal({ isOpen, onClose, map, onCommentAdded }: CommentModalProps) {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addComment(map.id, user.uid, user.displayName || 'Anonymous', commentText.trim());
      setCommentText('');
      
      // Create updated map with new comment
      const newComment = {
        id: crypto.randomUUID(),
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        text: commentText.trim(),
        createdAt: new Date(),
        likes: []
      };
      
      const updatedMap = {
        ...map,
        comments: [...(map.comments || []), newComment]
      };
      
      onCommentAdded?.(updatedMap);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date | any) => {
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }
    if (date?.toDate) {
      return date.toDate().toLocaleDateString();
    }
    return 'Unknown date';
  };

  const handleCommentLike = async (commentId: string) => {
    if (!user) return;
    
    try {
      await toggleCommentLike(map.id, commentId, user.uid);
      
      // Update the map locally to reflect the like change
      const updatedComments = map.comments?.map(comment => {
        if (comment.id === commentId) {
          const likes = comment.likes || [];
          const hasLiked = likes.includes(user.uid);
          return {
            ...comment,
            likes: hasLiked 
              ? likes.filter(id => id !== user.uid)
              : [...likes, user.uid]
          };
        }
        return comment;
      }) || [];
      
      const updatedMap = {
        ...map,
        comments: updatedComments
      };
      
      onCommentAdded?.(updatedMap);
    } catch (error) {
      console.error('Error toggling comment like:', error);
    }
  };

  const handleMapLike = async () => {
    if (!user) return;
    
    try {
      await toggleLike(map.id, user.uid);
      
      // Update the map locally to reflect the like change
      const likes = map.likes || [];
      const hasLiked = likes.includes(user.uid);
      
      const updatedMap = {
        ...map,
        likes: hasLiked 
          ? likes.filter(id => id !== user.uid)
          : [...likes, user.uid]
      };
      
      onCommentAdded?.(updatedMap);
    } catch (error) {
      console.error('Error toggling map like:', error);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/80 animate-in fade-in-0"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal Panel */}
      <div 
        role="dialog"
        aria-labelledby="comment-modal-title"
        className="fixed z-50 gap-4 bg-white p-6 shadow-lg transition ease-in-out animate-in slide-in-from-right duration-500 inset-y-0 right-0 h-full border-l w-full sm:max-w-lg lg:max-w-xl md:max-w-xl xl:max-w-2xl overflow-y-auto"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex flex-col space-y-2 text-center sm:text-left">
          <h2 id="comment-modal-title" className="text-lg font-semibold text-gray-900 text-left">
            Comments
          </h2>
        </div>

        {/* Map Info */}
        <div className="mt-6 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="relative flex shrink-0 overflow-hidden rounded-full h-8 w-8">
                <span className="flex h-full w-full items-center justify-center rounded-full bg-gray-200 text-gray-600 font-medium">
                  {map.userName?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </span>
              <span className="text-sm font-medium">{map.userName}</span>
            </div>
            <span className="text-xs text-gray-500">•</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{formatDate(map.createdAt)}</span>
            </div>
          </div>
          
          <p className="text-sm mb-6">{map.shortDescription || 'No description available'}</p>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => handleMapLike()}
              disabled={!user}
              className={`flex items-center gap-1.5 text-xs transition-colors rounded px-2 py-1 ${
                user?.uid && map.likes?.includes(user.uid)
                  ? 'text-blue-500 hover:text-blue-600' 
                  : 'hover:text-blue-500'
              } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span>↑</span>
              <span className="text-xs text-gray-500">{map.likes?.length || 0}</span>
            </button>
            <div className="flex items-center gap-0.2 text-xs text-gray-500">
              <span className="mr-2">💬</span>
              <span className="text-xs">{map.comments?.length || 0}</span>
            </div>
          </div>
        </div>

        <div className="shrink-0 bg-gray-200 h-[1px] w-full my-6"></div>

        {/* Comments Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Comments</h3>
          
          {/* Add Comment Form */}
          <form onSubmit={handleSubmit}>
            <textarea 
              className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm mt-4"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={!user || isSubmitting}
            />
            <div className="w-full flex flex-row-reverse">
              <button 
                type="submit"
                disabled={!user || !commentText.trim() || isSubmitting}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-500 text-white hover:bg-blue-600 h-10 px-4 py-2 mt-4"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>

          {/* Existing Comments */}
          <div className="space-y-6">
            {map.comments && map.comments.length > 0 ? (
              map.comments.map((comment: any, index: number) => {
                const hasLiked = comment.likes?.includes(user?.uid) || false;
                return (
                  <div key={index} className="p-4 pl-0 border-b pb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="relative flex shrink-0 overflow-hidden rounded-full h-6 w-6">
                            <span className="flex h-full w-full items-center justify-center rounded-full bg-gray-200 text-gray-600 text-xs font-medium">
                              {comment.userName?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </span>
                          <span className="text-sm font-medium">{comment.userName}</span>
                        </div>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm mb-6 break-words">{comment.text}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => handleCommentLike(comment.id)}
                          disabled={!user}
                          className={`flex items-center gap-1.5 text-xs transition-colors rounded px-2 py-1 ${
                            hasLiked 
                              ? 'text-blue-500 hover:text-blue-600' 
                              : 'hover:text-blue-500'
                          } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span>↑</span>
                          <span className="text-xs text-gray-500">{comment.likes?.length || 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>

        {/* Close Button */}
        <button 
          type="button" 
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:pointer-events-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
          <span className="sr-only">Close</span>
        </button>
      </div>
    </>,
    document.body
  );
} 