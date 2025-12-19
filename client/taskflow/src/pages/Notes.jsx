import React, { useState } from 'react';
import { useApi } from '../components/hooks/useApi';
import { BsPlus } from 'react-icons/bs';
import { FaStickyNote } from 'react-icons/fa';
import { toast } from 'react-toastify';
import DeleteModal from '../components/modals/DeleteModal';
import NoteDetailModal from '../components/modals/NoteDetailModal';
import CreateNoteModal from '../components/modals/NewNoteModal';
import NoteCard from '../components/note/NoteCard';
import NoteSearch from '../components/note/NoteSearch';

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
                    <NoteSearch 
                        searchTerm={searchTerm} 
                        onSearchChange={setSearchTerm}
                        onNoteClick={setSelectedNoteId}
                    />
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
                            {pinnedNotes.length > 0 && (
                                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 pl-1">Others</h2>
                            )}
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