import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../utils/apiClient';
import { QUERY_KEYS } from '../../utils/queryKeys';
import Avatar from '../../components/common/Avatar';
import { FaReply, FaTrash, FaPaperPlane, FaEdit, FaTimes, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useUser } from '../../contexts/UserContext';

const CommentItem = ({ comment, taskId, onReply, onDelete, currentUser, canComment }) => {
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.content);
    const queryClient = useQueryClient();

    const { mutate: addReply, isPending: replying } = useMutation({
        mutationFn: async (text) => {
            const response = await apiClient.post(`/api/tasks/${taskId}/comments/`, {
                content: text,
                parent: comment.id
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.taskComments(taskId) });
            setReplyText('');
            setShowReplyInput(false);
            toast.success('Reply posted');
        },
        onError: () => toast.error('Failed to post reply')
    });

    const { mutate: editComment, isPending: editing } = useMutation({
        mutationFn: async (text) => {
            const response = await apiClient.patch(`/api/comments/${comment.id}/`, {
                content: text
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.taskComments(taskId) });
            setIsEditing(false);
            toast.success('Comment updated');
        },
        onError: () => toast.error('Failed to update comment')
    });

    const handleReplySubmit = (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        addReply(replyText);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!editText.trim() || editText === comment.content) {
            setIsEditing(false);
            return;
        }
        editComment(editText);
    };

    const isAuthor = currentUser?.id === comment.author?.id;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-sm border border-gray-200 dark:border-slate-800/80 p-4 shadow-none my-3 transition-colors hover:border-gray-300 dark:hover:border-slate-700">
            <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                    <Avatar name={comment.author?.display_name || comment.author?.email} url={comment.author?.avatar} size={10} className="rounded-sm" />
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white">{comment.author?.display_name || comment.author?.email}</h4>
                            {comment.is_edited && (
                                <span className="text-[9px] bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm border border-transparent dark:border-slate-700">edited</span>
                            )}
                        </div>
                        <span className="text-[10px] text-gray-400 dark:text-slate-500 font-semibold">{new Date(comment.created_at).toLocaleString()}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {canComment && !isEditing && (
                        <button
                            onClick={() => setShowReplyInput(!showReplyInput)}
                            className="text-[10px] flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-bold uppercase tracking-wider px-2 py-1 rounded-sm bg-blue-50 dark:bg-blue-950/20 border border-transparent hover:border-blue-100 dark:hover:border-blue-900 transition-colors"
                        >
                            <FaReply size={9} /> Reply
                        </button>
                    )}
                    {isAuthor && !isEditing && (
                        <>
                            <button
                                onClick={() => {
                                    setIsEditing(true);
                                    setShowReplyInput(false);
                                    setEditText(comment.content);
                                }}
                                className="text-xs text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 p-1.5 transition-colors rounded-sm hover:bg-gray-100 dark:hover:bg-slate-800"
                                title="Edit comment"
                            >
                                <FaEdit size={12} />
                            </button>
                            <button
                                onClick={() => onDelete(comment.id)}
                                className="text-xs text-gray-400 dark:text-slate-500 hover:text-red-650 dark:hover:text-red-400 p-1.5 transition-colors rounded-sm hover:bg-gray-100 dark:hover:bg-slate-800"
                                title="Delete comment"
                            >
                                <FaTrash size={12} />
                            </button>
                        </>
                    )}
                </div>
            </div>
            
            {isEditing ? (
                <form onSubmit={handleEditSubmit} className="mt-2 pl-13 pr-2 flex gap-2">
                    <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        disabled={editing}
                        className="flex-1 text-xs border border-blue-300 dark:border-blue-800 rounded-sm px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-950 dark:text-white"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={editing || !editText.trim()}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1"
                        title="Save changes"
                    >
                        <FaCheck /> {editing ? 'Saving...' : 'Save'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        disabled={editing}
                        className="bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1"
                        title="Cancel editing"
                    >
                        <FaTimes /> Cancel
                    </button>
                </form>
            ) : (
                <p className="text-gray-750 dark:text-slate-300 text-sm pl-13 pr-2 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
            )}

            {showReplyInput && (
                <form onSubmit={handleReplySubmit} className="mt-3 pl-13 flex gap-2">
                    <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        disabled={replying}
                        className="flex-1 text-xs border border-gray-200 dark:border-slate-800 rounded-sm px-3 py-1.5 focus:outline-none focus:border-blue-500 bg-gray-50/50 dark:bg-slate-950 dark:text-white"
                    />
                    <button
                        type="submit"
                        disabled={replying || !replyText.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-1.5 rounded-sm text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                        <FaPaperPlane size={11} /> {replying ? 'Replying...' : 'Reply'}
                    </button>
                </form>
            )}

            {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 pl-6 border-l-2 border-gray-200 dark:border-slate-800 space-y-3">
                    {comment.replies.map(reply => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            taskId={taskId}
                            onReply={onReply}
                            onDelete={onDelete}
                            currentUser={currentUser}
                            canComment={canComment}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const TaskComments = ({ taskId, task }) => {
    const [newComment, setNewComment] = useState('');
    const queryClient = useQueryClient();
    const { currentUser } = useUser();

    const { data: commentsData, isLoading } = useQuery({
        queryKey: QUERY_KEYS.taskComments(taskId),
        queryFn: async () => (await apiClient.get(`/api/tasks/${taskId}/comments/`)).data,
        enabled: !!taskId
    });

    // Normalize pagination just in case
    const comments = Array.isArray(commentsData) ? commentsData : (commentsData?.results || []);

    const { mutate: addComment, isPending: submitting } = useMutation({
        mutationFn: async (text) => {
            const response = await apiClient.post(`/api/tasks/${taskId}/comments/`, {
                content: text
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.taskComments(taskId) });
            setNewComment('');
            toast.success('Comment posted');
        },
        onError: () => toast.error('Failed to post comment')
    });

    const { mutate: deleteComment } = useMutation({
        mutationFn: async (commentId) => {
            await apiClient.delete(`/api/comments/${commentId}/`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.taskComments(taskId) });
            toast.success('Comment deleted');
        },
        onError: () => toast.error('Failed to delete comment')
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        addComment(newComment);
    };

    // Filter out replies from top level view (they are rendered inside parents)
    const topLevelComments = comments.filter(c => !c.parent);

    const isCreator = currentUser?.id === task?.creator?.id;
    const isAssignee = task?.assignees?.some(a => a.id === currentUser?.id);
    const canComment = isCreator || isAssignee;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-sm border border-gray-200 dark:border-slate-800/80 p-6 shadow-none mt-6">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                Comments <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-sm border border-blue-200 dark:border-blue-900">{comments.length}</span>
            </h3>

            {canComment ? (
                <form onSubmit={handleSubmit} className="mb-6">
                    <div className="flex gap-4">
                        <Avatar name={currentUser?.display_name || currentUser?.email} url={currentUser?.avatar} size={11} className="rounded-sm" />
                        <div className="flex-1 flex flex-col gap-3">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment or ask a question..."
                                rows="3"
                                disabled={submitting}
                                className="w-full border border-gray-200 dark:border-slate-800 rounded-sm p-4 text-xs focus:outline-none focus:border-blue-500 bg-gray-50/50 dark:bg-slate-955 dark:text-white resize-none leading-relaxed"
                            />
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={submitting || !newComment.trim()}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-5 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 shadow-none border border-transparent"
                                >
                                    <FaPaperPlane size={11} /> {submitting ? 'Posting...' : 'Post Comment'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-955/20 border border-amber-250 dark:border-amber-900 rounded-sm text-amber-800 dark:text-amber-300 text-xs flex items-center justify-center font-medium">
                    Only the task creator and assigned members can post comments or replies to this task.
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : topLevelComments.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 dark:border-slate-800/80 rounded-sm">
                    <p className="text-gray-400 dark:text-slate-500 text-xs font-medium">No comments yet. Be the first to start the discussion!</p>
                </div>
            ) : (
                <div className="space-y-4 divide-y divide-gray-200 dark:divide-slate-800/50">
                    {topLevelComments.map(comment => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            taskId={taskId}
                            onDelete={deleteComment}
                            currentUser={currentUser}
                            canComment={canComment}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default TaskComments;
