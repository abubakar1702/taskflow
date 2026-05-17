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
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm my-3 transition-all hover:shadow-md">
            <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                    <Avatar name={comment.author?.display_name || comment.author?.email} url={comment.author?.avatar} size={10} />
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-gray-900">{comment.author?.display_name || comment.author?.email}</h4>
                            {comment.is_edited && (
                                <span className="text-[10px] bg-gray-100 text-gray-500 font-medium px-1.5 py-0.5 rounded">edited</span>
                            )}
                        </div>
                        <span className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleString()}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {canComment && !isEditing && (
                        <button
                            onClick={() => setShowReplyInput(!showReplyInput)}
                            className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold px-2.5 py-1 rounded-md bg-blue-50 transition-colors"
                        >
                            <FaReply /> Reply
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
                                className="text-xs text-gray-400 hover:text-blue-600 p-1 transition-colors"
                                title="Edit comment"
                            >
                                <FaEdit />
                            </button>
                            <button
                                onClick={() => onDelete(comment.id)}
                                className="text-xs text-gray-400 hover:text-red-600 p-1 transition-colors"
                                title="Delete comment"
                            >
                                <FaTrash />
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
                        className="flex-1 text-sm border border-blue-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={editing || !editText.trim()}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                        title="Save changes"
                    >
                        <FaCheck /> {editing ? 'Saving...' : 'Save'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        disabled={editing}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                        title="Cancel editing"
                    >
                        <FaTimes /> Cancel
                    </button>
                </form>
            ) : (
                <p className="text-gray-700 text-sm pl-13 pr-2 whitespace-pre-wrap">{comment.content}</p>
            )}

            {showReplyInput && (
                <form onSubmit={handleReplySubmit} className="mt-3 pl-13 flex gap-2">
                    <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        disabled={replying}
                        className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 bg-gray-50/50"
                    />
                    <button
                        type="submit"
                        disabled={replying || !replyText.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                    >
                        <FaPaperPlane size={12} /> {replying ? 'Replying...' : 'Reply'}
                    </button>
                </form>
            )}

            {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 pl-8 border-l-2 border-gray-100 space-y-3">
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
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                Comments <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">{comments.length}</span>
            </h3>

            {canComment ? (
                <form onSubmit={handleSubmit} className="mb-8">
                    <div className="flex gap-4">
                        <Avatar name={currentUser?.display_name || currentUser?.email} url={currentUser?.avatar} size={11} />
                        <div className="flex-1 flex flex-col gap-3">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment or ask a question..."
                                rows="3"
                                disabled={submitting}
                                className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:border-blue-50 bg-gray-50/50 resize-none"
                            />
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={submitting || !newComment.trim()}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
                                >
                                    <FaPaperPlane /> {submitting ? 'Posting...' : 'Post Comment'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm flex items-center justify-center">
                    Only the task creator and assigned members can post comments or replies to this task.
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : topLevelComments.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl">
                    <p className="text-gray-400 text-sm">No comments yet. Be the first to start the discussion!</p>
                </div>
            ) : (
                <div className="space-y-4 divide-y divide-gray-50">
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
