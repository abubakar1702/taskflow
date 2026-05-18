import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../utils/apiClient';
import { QUERY_KEYS } from '../../utils/queryKeys';
import Avatar from '../../components/common/Avatar';
import {
    FaReply,
    FaTrash,
    FaPaperPlane,
    FaEdit,
    FaTimes,
    FaCheck,
    FaChevronDown,
    FaChevronRight
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useUser } from '../../contexts/UserContext';

const MAX_VISUAL_DEPTH = 2;
const COLLAPSE_AFTER = 5;

const CommentItem = ({
    comment,
    taskId,
    onDelete,
    currentUser,
    canComment,
    depth = 0,
    parentAuthor = null
}) => {
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.content);
    const [expandedReplies, setExpandedReplies] = useState(false);

    const queryClient = useQueryClient();

    const { mutate: addReply, isPending: replying } = useMutation({
        mutationFn: async (text) => {
            const response = await apiClient.post(
                `/api/tasks/${taskId}/comments/`,
                {
                    content: text,
                    parent: comment.id
                }
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.taskComments(taskId)
            });
            setReplyText('');
            setShowReplyInput(false);
            toast.success('Reply posted');
        },
        onError: () => toast.error('Failed to post reply')
    });

    const { mutate: editComment, isPending: editing } = useMutation({
        mutationFn: async (text) => {
            const response = await apiClient.patch(
                `/api/comments/${comment.id}/`,
                { content: text }
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.taskComments(taskId)
            });
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

    const visibleReplies = expandedReplies
        ? comment.replies || []
        : (comment.replies || []).slice(0, COLLAPSE_AFTER);

    const hasHiddenReplies =
        (comment.replies?.length || 0) > COLLAPSE_AFTER;

    const containerClasses = depth > 0
        ? "bg-transparent p-0 border-none mt-4 transition-colors relative"
        : "bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-5 shadow-none my-4 transition-colors hover:border-gray-300 dark:hover:border-slate-700 relative";

    const avatarSize = depth > 0 ? 8 : 10;
    const contentPadding = depth > 0 ? "pl-11" : "pl-13";

    return (
        <div className={containerClasses}>
            <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                    <Avatar
                        name={comment.author?.display_name || comment.author?.email}
                        url={comment.author?.avatar}
                        size={avatarSize}
                        className="rounded-full"
                    />

                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                                {comment.author?.display_name || comment.author?.email}
                            </h4>
                            
                            {depth >= MAX_VISUAL_DEPTH && parentAuthor && (
                                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-sm border border-blue-100 dark:border-blue-900/50">
                                    to @{parentAuthor}
                                </span>
                            )}

                            {comment.is_edited && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 uppercase font-bold">
                                    edited
                                </span>
                            )}
                        </div>

                        <span className="text-[10px] text-gray-400 dark:text-slate-500 font-semibold">
                            {new Date(comment.created_at).toLocaleString()}
                        </span>
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
                <form
                    onSubmit={handleEditSubmit}
                    className={`mt-2 ${contentPadding} pr-2 flex gap-2`}
                >
                    <input
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
                <p className={`text-gray-750 dark:text-slate-300 text-sm ${contentPadding} pr-2 whitespace-pre-wrap leading-relaxed`}>
                    {comment.content}
                </p>
            )}

            {showReplyInput && (
                <form
                    onSubmit={handleReplySubmit}
                    className={`mt-3 ${contentPadding} flex gap-2`}
                >
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

            {comment.replies?.length > 0 && (
                <div className="mt-4">
                    <div className={depth < MAX_VISUAL_DEPTH ? "pl-5 ml-5 border-l-2 border-gray-200 dark:border-slate-800/80 space-y-4" : "space-y-4"}>
                        {visibleReplies.map((reply) => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                taskId={taskId}
                                onDelete={onDelete}
                                currentUser={currentUser}
                                canComment={canComment}
                                depth={depth + 1}
                                parentAuthor={comment.author?.display_name || comment.author?.email}
                            />
                        ))}
                    </div>

                    {hasHiddenReplies && (
                        <button
                            onClick={() => setExpandedReplies(!expandedReplies)}
                            className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-605 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-3 ${contentPadding} transition-colors focus:outline-none`}
                        >
                            {expandedReplies ? (
                                <FaChevronDown size={8} />
                            ) : (
                                <FaChevronRight size={8} />
                            )}

                            <span>
                                {expandedReplies
                                    ? 'Hide replies'
                                    : `Show ${comment.replies.length - COLLAPSE_AFTER} more replies`}
                            </span>
                        </button>
                    )}
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
        queryFn: async () =>
            (await apiClient.get(
                `/api/tasks/${taskId}/comments/`
            )).data,
        enabled: !!taskId
    });

    const comments = Array.isArray(commentsData)
        ? commentsData
        : commentsData?.results || [];

    const { mutate: addComment, isPending: submitting } = useMutation({
        mutationFn: async (text) =>
            (
                await apiClient.post(
                    `/api/tasks/${taskId}/comments/`,
                    { content: text }
                )
            ).data,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.taskComments(taskId)
            });
            setNewComment('');
            toast.success('Comment posted');
        },
        onError: () => toast.error('Failed to post comment')
    });

    const { mutate: deleteComment } = useMutation({
        mutationFn: async (id) =>
            apiClient.delete(`/api/comments/${id}/`),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.taskComments(taskId)
            });
            toast.success('Comment deleted');
        },
        onError: () => toast.error('Failed to delete comment')
    });

    const topLevelComments = comments.filter((c) => !c.parent);

    const isCreator = currentUser?.id === task?.creator?.id;
    const isAssignee = task?.assignees?.some((a) => a.id === currentUser?.id);
    const canComment = isCreator || isAssignee;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        addComment(newComment);
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 mt-6">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                Comments <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-sm border border-blue-200 dark:border-blue-900">{comments.length}</span>
            </h3>

            {canComment ? (
                <form onSubmit={handleSubmit} className="mb-6">
                    <div className="border border-gray-200 dark:border-slate-800 rounded-md p-4 bg-gray-50/50 dark:bg-slate-950 focus-within:border-blue-500 dark:focus-within:border-blue-500 transition-colors flex flex-col gap-3 shadow-none">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment or ask a question..."
                            rows="3"
                            disabled={submitting}
                            className="w-full text-xs focus:outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 resize-none leading-relaxed border-none p-0"
                        />
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 dark:border-slate-800/60">
                            <div className="flex items-center gap-2">
                                <Avatar name={currentUser?.display_name || currentUser?.email} url={currentUser?.avatar} size={7} className="rounded-full" />
                                <span className="text-[11px] font-bold text-gray-600 dark:text-slate-400">{currentUser?.display_name || currentUser?.first_name || 'You'}</span>
                            </div>
                            <button
                                type="submit"
                                disabled={submitting || !newComment.trim()}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 shadow-none border border-transparent"
                            >
                                {submitting ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-955/20 border border-amber-250 dark:border-amber-900 rounded-lg text-amber-800 dark:text-amber-300 text-xs flex items-center justify-center font-medium">
                    Only the task creator and assigned members can post comments or replies to this task.
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : topLevelComments.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 dark:border-slate-800/80 rounded-lg">
                    <p className="text-gray-400 dark:text-slate-500 text-xs font-medium">No comments yet. Be the first to start the discussion!</p>
                </div>
            ) : (
                <div className="space-y-4 divide-y divide-gray-200 dark:divide-slate-800/50">
                    {topLevelComments.map((comment) => (
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