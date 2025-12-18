import React from 'react';
import { BsPin, BsPinFill, BsTrash } from 'react-icons/bs';

const NoteCard = ({ note, onPin, onDelete, onClick }) => {
    return (
        <div
            onClick={() => onClick(note.id)}
            className="group bg-white p-5 rounded-xl shadow-sm hover:shadow-md border border-gray-200 transition-all cursor-pointer relative flex flex-col h-60"
        >
            <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg text-gray-800 line-clamp-1 pr-8">
                    {note.title || 'Untitled'}
                </h3>
            </div>

            <p className="text-gray-600 text-sm line-clamp-6 whitespace-pre-wrap flex-grow">
                {note.content || 'No content'}
            </p>

            <div className="flex justify-between items-center pt-2 mt-auto">
                <div className="text-xs text-gray-400">
                    {new Date(note.updated_at).toLocaleDateString()}
                </div>

                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onPin(note);
                        }}
                        className="p-1.5 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-full transition-colors"
                        title={note.is_pinned ? "Unpin note" : "Pin note"}
                    >
                        {note.is_pinned ? (
                            <BsPinFill className="text-yellow-500" size={18} />
                        ) : (
                            <BsPin size={18} />
                        )}
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(note);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete note"
                    >
                        <BsTrash size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NoteCard;