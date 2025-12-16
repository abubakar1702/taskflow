import React, { useState, useEffect } from 'react';
import { useApi } from '../components/hooks/useApi';
import { BsPin, BsPinFill, BsTrash, BsPlus, BsSearch, BsX } from 'react-icons/bs';
import { FaStickyNote } from 'react-icons/fa';
import { toast } from 'react-toastify';
import DeleteModal from '../components/modals/DeleteModal';
import NoteDetailModal from '../components/modals/NoteDetailModal';

const NoteCard = ({ note, onPin, onDelete, onClick }) => {
    return (
        <div
            onClick={() => onClick(note.id)}
            className="group bg-white p-5 rounded-xl shadow-sm hover:shadow-md border border-gray-200 transition-all cursor-pointer relative flex flex-col h-60"
        >
            <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg text-gray-800 line-clamp-1 pr-8">{note.title || 'Untitled'}</h3>
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); onPin(note); }}
                        className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-full transition-colors"
                        title={note.is_pinned ? "Unpin note" : "Pin note"}
                    >
                        {note.is_pinned ? <BsPinFill className="text-yellow-500" /> : <BsPin />}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(note); }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete note"
                    >
                        <BsTrash />
                    </button>
                </div>
            </div>
            <p className="text-gray-600 text-sm line-clamp-6 whitespace-pre-wrap flex-grow">
                {note.content || 'No content'}
            </p>
            <div className="mt-4 text-xs text-gray-400">
                {new Date(note.updated_at).toLocaleDateString()}
            </div>
        </div>
    );
};

const CreateNoteModal = ({ isOpen, onClose, onCreated }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const { makeRequest, loading } = useApi();

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await makeRequest('/api/notes/', 'POST', { title, content });
            toast.success('Note created successfully');
            setTitle('');
            setContent('');
            onCreated();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error('Failed to create note');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">Create New Note</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <BsX size={24} className="text-gray-500" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full text-lg font-semibold placeholder-gray-400 border-none focus:ring-0 px-0"
                        autoFocus
                    />
                    <textarea
                        placeholder="Take a note..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={8}
                        className="w-full resize-none border-none focus:ring-0 px-0 text-gray-600"
                    />
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || (!title.trim() && !content.trim())}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Note'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Notes = () => {
    const { data: notes, loading, refetch } = useApi('/api/notes/');
    const { makeRequest } = useApi();

    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState(null);
    const [selectedNoteId, setSelectedNoteId] = useState(null);

    const handlePinToggle = async (note) => {
        try {
            await makeRequest(`/api/notes/${note.id}/`, 'PATCH', { is_pinned: !note.is_pinned });
            toast.success(note.is_pinned ? 'Note unpinned' : 'Note pinned');
            refetch();
        } catch (err) {
            console.error(err);
            toast.error('Failed to update pin status');
        }
    };

    const handleDelete = async () => {
        if (!noteToDelete) return;
        try {
            await makeRequest(`/api/notes/${noteToDelete.id}/`, 'DELETE');
            toast.success('Note deleted');
            setNoteToDelete(null);
            refetch();
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete note');
        }
    };

    const filteredNotes = notes?.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const pinnedNotes = filteredNotes.filter(n => n.is_pinned);
    const otherNotes = filteredNotes.filter(n => !n.is_pinned);

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-yellow-100 p-3 rounded-xl">
                        <FaStickyNote className="w-6 h-6 text-yellow-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">Notes</h1>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-grow md:w-64">
                        <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search notes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm active:scale-95"
                    >
                        <BsPlus size={20} />
                        New Note
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="space-y-10">
                    {pinnedNotes.length > 0 && (
                        <section>
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 pl-1">Pinned</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {pinnedNotes.map(note => (
                                    <NoteCard
                                        key={note.id}
                                        note={note}
                                        onPin={handlePinToggle}
                                        onDelete={setNoteToDelete}
                                        onClick={(id) => setSelectedNoteId(id)}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {otherNotes.length > 0 && (
                        <section>
                            {pinnedNotes.length > 0 && <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 pl-1">Others</h2>}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {otherNotes.map(note => (
                                    <NoteCard
                                        key={note.id}
                                        note={note}
                                        onPin={handlePinToggle}
                                        onDelete={setNoteToDelete}
                                        onClick={(id) => setSelectedNoteId(id)}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {filteredNotes.length === 0 && (
                        <div className="text-center py-20 text-gray-500">
                            <FaStickyNote className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                            <p className="text-lg">No notes found</p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="text-blue-600 hover:underline mt-2"
                            >
                                Create your first note
                            </button>
                        </div>
                    )}
                </div>
            )}

            <CreateNoteModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreated={refetch}
            />

            <NoteDetailModal
                isOpen={!!selectedNoteId}
                onClose={() => setSelectedNoteId(null)}
                noteId={selectedNoteId}
                onUpdate={refetch}
            />

            <DeleteModal
                isOpen={!!noteToDelete}
                onClose={() => setNoteToDelete(null)}
                onConfirm={handleDelete}
                title="Delete Note"
                message="Are you sure you want to delete this note? This action cannot be undone."
            />
        </div>
    );
};

export default Notes;