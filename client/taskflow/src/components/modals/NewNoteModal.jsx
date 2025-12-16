import React, { useState, useEffect } from 'react'
import { FiX, FiSave} from "react-icons/fi";
import { RiStickyNoteAddLine} from "react-icons/ri";
import { toast } from 'react-toastify';
import { useApi } from '../hooks/useApi';


const CreateNoteModal = ({ isOpen, onClose, onCreated }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const { makeRequest, loading } = useApi();

    useEffect(() => {
        if (!isOpen) {
            setTitle('');
            setContent('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() && !content.trim()) {
            toast.warn('Please enter a title or content for your note.');
            return;
        }

        try {
            await makeRequest('/api/notes/', 'POST', { title: title.trim(), content: content.trim() });
            toast.success('Note created successfully');
            onCreated();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error('Failed to create note');
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-200 p-4"
            onClick={onClose} 
        >
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[65vh] overflow-hidden animate-fadeIn transform transition-all duration-300"
                onClick={(e) => e.stopPropagation()} 
            >
                <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <RiStickyNoteAddLine className="text-blue-600" />
                        Create New Note
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors text-gray-500"
                        title="Close"
                    >
                        <FiX size={28} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-6">
                    <input
                        type="text"
                        placeholder="Note Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full text-2xl font-bold placeholder-gray-300 border-b border-gray-200 px-0 pb-2 text-gray-800 transition-colors focus:ring-0 focus:outline-none"
                        autoFocus
                    />
                    
                    <textarea
                        placeholder="Start writing your note content here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={15} 
                        className="w-full resize-none rounded-lg text-gray-700 focus:ring-0 focus:outline-none"
                    />
                    
                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || (!title.trim() && !content.trim())}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-md shadow-blue-300 disabled:opacity-50 disabled:shadow-none active:scale-95 flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <FiSave /> 
                                    Save Note
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateNoteModal;