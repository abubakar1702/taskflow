import React, { useRef, useEffect, useState } from 'react';
import { BsSearch, BsX } from 'react-icons/bs';
import { BsPin, BsPinFill } from 'react-icons/bs';
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../utils/apiClient";
import { QUERY_KEYS } from "../../utils/queryKeys";
import { ClipLoader } from 'react-spinners';

const NoteSearch = ({ searchTerm, onSearchChange, onNoteClick }) => {
    const dropdownRef = useRef(null);
    const [isFocused, setIsFocused] = useState(false);

    const { data: results, isLoading: isSearching } = useQuery({
        queryKey: ['noteSearch', searchTerm],
        queryFn: async () => {
            if (!searchTerm.trim()) return [];
            const response = await apiClient.get(`/api/notes/search/?q=${encodeURIComponent(searchTerm)}`);
            return response.data;
        },
        enabled: searchTerm.trim().length > 0,
        staleTime: 1000 * 60,
    });

    const searchResults = Array.isArray(results) ? results : (results?.results || []);



    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsFocused(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const highlightText = (text, query) => {
        if (!query.trim() || !text) return text;

        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return (
            <span>
                {parts.map((part, index) =>
                    part.toLowerCase() === query.toLowerCase() ? (
                        <mark key={index} className="bg-yellow-200 dark:bg-yellow-900 text-gray-900 dark:text-slate-100 font-medium">
                            {part}
                        </mark>
                    ) : (
                        <span key={index}>{part}</span>
                    )
                )}
            </span>
        );
    };

    const truncateContent = (content, maxLength = 100) => {
        if (!content || content.length <= maxLength) return content;
        return content.substring(0, maxLength) + '...';
    };

    const handleNoteClick = (noteId) => {
        onNoteClick(noteId);
        onSearchChange('');
        setIsFocused(false);
    };

    const handleClear = () => {
        onSearchChange('');
        setIsFocused(false);
    };

    return (
        <div
            className={`relative transition-all duration-300 ease-in-out ${isFocused ? 'w-full md:w-96' : 'w-full md:w-64'
                }`}
            ref={dropdownRef}
        >
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                {isSearching ? (
                    <ClipLoader color="#3b82f6" size={16} loading={isSearching} />
                ) : (
                    <BsSearch className="text-gray-400 dark:text-slate-500" />
                )}
            </div>

            <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                className="w-full pl-10 pr-10 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-slate-100"
            />

            {searchTerm && !isSearching && (
                <button
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors z-10"
                    title="Clear search"
                >
                    <BsX size={20} />
                </button>
            )}

            {searchTerm.trim() && isFocused && !isSearching && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                    {searchResults.length > 0 ? (
                        <div className="py-2">
                            {searchResults.map((note) => (
                                <div
                                    key={note.id}
                                    onClick={() => handleNoteClick(note.id)}
                                    className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors border-b border-gray-100 dark:border-slate-700 last:border-b-0"
                                >
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <h4 className="font-semibold text-sm text-gray-800 dark:text-slate-100 line-clamp-1">
                                            {highlightText(note.title || 'Untitled', searchTerm)}
                                        </h4>
                                        {note.is_pinned && (
                                            <BsPinFill className="text-yellow-500 flex-shrink-0" size={14} />
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-slate-400 line-clamp-2">
                                        {highlightText(truncateContent(note.content || 'No content'), searchTerm)}
                                    </p>
                                    <span className="text-xs text-gray-400 dark:text-slate-500 mt-1 block">
                                        {new Date(note.updated_at).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="px-4 py-8 text-center text-gray-500 dark:text-slate-400">
                            <p className="text-sm">No notes found</p>
                            <p className="text-xs mt-1">Try a different search term</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NoteSearch;