import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiX } from "react-icons/fi";
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { ClipLoader } from 'react-spinners';
import { PRIORITY_DOT_COLORS } from '../constants/uiColors';

const Search = ({ className }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState({ projects: [], tasks: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const { makeRequest } = useApi(null);

    const Highlight = ({ text, highlight }) => {
        if (!highlight.trim()) return <span>{text}</span>;
        const regex = new RegExp(`(${highlight})`, "gi");
        const parts = text.split(regex);

        return (
            <span>
                {parts.map((part, i) =>
                    regex.test(part) ? (
                        <mark key={i} className="bg-yellow-200 text-gray-900 rounded-sm px-0.5">
                            {part}
                        </mark>
                    ) : (
                        <span key={i}>{part}</span>
                    )
                )}
            </span>
        );
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length > 1) {
                setIsLoading(true);
                try {
                    const data = await makeRequest(
                        `/api/search/?q=${encodeURIComponent(query)}`,
                        "GET"
                    );
                    setResults(data);
                    setIsOpen(true);
                } catch {
                    setResults({ projects: [], tasks: [] });
                } finally {
                    setIsLoading(false);
                }
            } else {
                setResults({ projects: [], tasks: [] });
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, makeRequest]);

    return (
        <div
            className={`relative flex items-center transition-all duration-300 ${className}`}
            ref={dropdownRef}
        >
            <div
                className={`flex items-center bg-gray-100 rounded-full px-4 py-2 gap-3 transition-all duration-300 border-2 
                ${isOpen
                        ? 'w-full md:w-[500px] bg-white border-blue-500 shadow-lg'
                        : 'w-full md:w-80 border-transparent hover:bg-gray-200'
                    }`}
            >
                {isLoading ? (
                    <ClipLoader size={18} color="#2563eb" />
                ) : (
                    <FiSearch className="text-gray-400" size={18} />
                )}

                <input
                    type="text"
                    placeholder="Search for projects or tasks..."
                    className="bg-transparent outline-none w-full text-gray-800 placeholder-gray-500"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length > 1 && setIsOpen(true)}
                />

                {query && (
                    <button onClick={() => setQuery("")}>
                        <FiX className="text-gray-400 hover:text-gray-600" />
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-xl shadow-2xl border border-gray-100 z-50 max-h-[450px] overflow-y-auto">

                    {results.projects?.length > 0 && (
                        <div className="p-3">
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-3 py-2">
                                Projects
                            </h3>
                            {results.projects.map(project => (
                                <Link
                                    key={project.id}
                                    to={`/projects/${project.id}`}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-4 px-3 py-3 hover:bg-gray-50 rounded-lg"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                                        {project.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700 truncate">
                                        <Highlight text={project.name} highlight={query} />
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}

                    {results.tasks?.length > 0 && (
                        <div className="p-3 border-t border-gray-50 bg-gray-50/30">
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-3 py-2">
                                Tasks
                            </h3>

                            {results.tasks.map(task => (
                                <Link
                                    key={task.id}
                                    to={`/tasks/${task.id}`}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center justify-between px-3 py-3 hover:bg-white rounded-lg border border-transparent hover:border-gray-100 mb-1"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div
                                            className={`w-2.5 h-2.5 rounded-full ${PRIORITY_DOT_COLORS[task.priority]}`}
                                        />
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-medium text-gray-800 truncate">
                                                <Highlight text={task.title} highlight={query} />
                                            </span>
                                            <span className="text-[10px] text-gray-500 uppercase truncate">
                                                {task.status}
                                            </span>
                                        </div>
                                    </div>

                                    {task.project?.name && (
                                        <span className="text-[11px] font-semibold text-gray-500 truncate max-w-[140px]">
                                            {task.project.name}
                                        </span>
                                    )}
                                </Link>

                            ))}
                        </div>
                    )}

                    {results.projects?.length === 0 &&
                        results.tasks?.length === 0 && (
                            <div className="p-10 text-center text-gray-500">
                                No results for <strong>"{query}"</strong>
                            </div>
                        )}
                </div>
            )}
        </div>
    );
};

export default Search;
