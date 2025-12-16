import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { BsPin, BsPinFill, BsTrash, BsSave, BsX } from 'react-icons/bs';
import { toast } from 'react-toastify';
import DeleteModal from './DeleteModal';
import { createPortal } from 'react-dom';

const NoteDetailModal = ({ isOpen, onClose, noteId, onUpdate }) => {
    const { data: note, loading, refetch } = useApi(isOpen && noteId ? `/api/notes/${noteId}/` : null);
    const { makeRequest, loading: actionLoading } = useApi();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        if (note) {
            setTitle(note.title || '');
            setContent(note.content || '');
            setIsDirty(false);
        }
    }, [note]);

    if (!isOpen) return null;

    const handleSave = async () => {
        try {
            await makeRequest(`/api/notes/${noteId}/`, 'PATCH', { title, content });
            toast.success('Note updated');
            setIsDirty(false);
            refetch();
            onUpdate && onUpdate();
        } catch (err) {
            console.error(err);
            toast.error('Failed to update note');
        }
    };

    const handlePinToggle = async () => {
        try {
            await makeRequest(`/api/notes/${noteId}/`, 'PATCH', { is_pinned: !note.is_pinned });
            toast.success(note.is_pinned ? 'Note unpinned' : 'Note pinned');
            refetch();
            onUpdate && onUpdate();
        } catch (err) {
            console.error(err);
            toast.error('Failed to update pin status');
        }
    };

    const handleDelete = async () => {
        try {
            await makeRequest(`/api/notes/${noteId}/`, 'DELETE');
            toast.success('Note deleted');
            setShowDeleteModal(false);
            onClose();
            onUpdate && onUpdate();
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete note');
        }
    };

    const overlay = (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] overflow-hidden flex flex-col relative animate-slideUp">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100 shrink-0">
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <BsX size={24} className="text-gray-500" />
                    </button>

                    <div className="flex items-center gap-2">
                        {note && (
                            <>
                                <button
                                    onClick={handlePinToggle}
                                    className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-full transition-colors"
                                    title={note.is_pinned ? "Unpin note" : "Pin note"}
                                >
                                    {note.is_pinned ? <BsPinFill className="text-yellow-500" size={20} /> : <BsPin size={20} />}
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                    title="Delete note"
                                >
                                    <BsTrash size={20} />
                                </button>
                            </>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={!isDirty || actionLoading}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ml-2 ${isDirty
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {actionLoading ? 'Saving...' : <><BsSave /> Save</>}
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-grow p-8 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : note ? (
                        <div className="h-full flex flex-col">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => { setTitle(e.target.value); setIsDirty(true); }}
                                placeholder="Title"
                                className="text-3xl font-bold text-gray-800 w-full border-none focus:ring-0 px-0 bg-transparent placeholder-gray-400 mb-6"
                            />
                            <textarea
                                value={content}
                                onChange={(e) => { setContent(e.target.value); setIsDirty(true); }}
                                placeholder="Start typing..."
                                className="w-full flex-grow text-lg text-gray-600 leading-relaxed resize-none border-none focus:ring-0 px-0 bg-transparent placeholder-gray-300"
                            />
                        </div>
                    ) : (
                        <div className="flex justify-center items-center h-full text-gray-500">
                            Note not found
                        </div>
                    )}
                </div>

                <DeleteModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={handleDelete}
                    title="Delete Note"
                    message="Are you sure you want to permanently delete this note?"
                />
            </div>
        </div>
    );

    return createPortal(overlay, document.body);
};

export default NoteDetailModal;
