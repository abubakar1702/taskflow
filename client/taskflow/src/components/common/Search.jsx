import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiX } from "react-icons/fi";
import { Link } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../utils/apiClient";
import { QUERY_KEYS } from "../../utils/queryKeys";
import { ClipLoader } from 'react-spinners';
import { PRIORITY_DOT_COLORS } from '../constants/uiColors';

const Search = ({ className }) => {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const { data: searchResults, isLoading, isError } = useQuery({
        queryKey: ['globalSearch', query],
        queryFn: async () => {
            if (query.trim().length <= 1) return { projects: [], tasks: [] };
            const response = await apiClient.get(`/api/search/?q=${encodeURIComponent(query)}`);
            return response.data;
        },
        enabled: query.trim().length > 1,
        staleTime: 1000 * 60, // Cache search results for 1 minute
    });

    const results = searchResults || { projects: [], tasks: [] };

    const Highlight = ({ text, highlight }) => {
        if (!highlight.trim()) return <span>{text}</span>;
        const regex = new RegExp(`(${highlight})`, "gi");
        const parts = text.split(regex);

        return (
            <span>
                {parts.map((part, i) =>
                    regex.test(part) ? (
                        <mark key={i} className="bg-yellow-200 dark:bg-yellow-900/40 text-gray-900 dark:text-yellow-200 rounded-sm px-0.5">
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
        if (query.trim().length > 1 && !isLoading && results) {
            setIsOpen(true);
        } else if (query.trim().length <= 1) {
            setIsOpen(false);
        }
    }, [query, isLoading, results]);

    return (
        <div
            className={`relative flex items-center transition-all duration-300 ${className}`}
            ref={dropdownRef}
        >
            <div
                className={`flex items-center rounded-full px-4 py-2 gap-3 transition-all duration-300 border-2 
                ${isOpen
                        ? 'w-full md:w-[500px] bg-white dark:bg-slate-900 border-blue-500 shadow-lg dark:shadow-slate-950/50'
                        : 'w-full md:w-80 bg-gray-100 dark:bg-slate-800 border-transparent hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
            >
                {isLoading ? (
                    <ClipLoader size={18} color="#2563eb" />
                ) : (
                    <FiSearch className="text-gray-400 dark:text-slate-500" size={18} />
                )}

                <input
                    type="text"
                    placeholder="Search for projects or tasks..."
                    className="bg-transparent outline-none w-full text-gray-800 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length > 1 && setIsOpen(true)}
                />

                {query && (
                    <button onClick={() => setQuery("")}>
                        <FiX className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300" />
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white dark:bg-slate-900 rounded-xl shadow-2xl dark:shadow-slate-950 border border-gray-100 dark:border-slate-800 z-50 max-h-[450px] overflow-y-auto custom-scrollbar">

                    {results.projects?.length > 0 && (
                        <div className="p-3">
                            <h3 className="text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest px-3 py-2">
                                Projects
                            </h3>
                            {results.projects.map(project => (
                                <Link
                                    key={project.id}
                                    to={`/projects/${project.id}`}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-4 px-3 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 rounded-lg"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                                        {project.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700 dark:text-slate-200 truncate">
                                        <Highlight text={project.name} highlight={query} />
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}

                    {results.tasks?.length > 0 && (
                        <div className="p-3 border-t border-gray-50 dark:border-slate-800/80 bg-gray-50/30 dark:bg-slate-950/30">
                            <h3 className="text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest px-3 py-2">
                                Tasks
                            </h3>

                            {results.tasks.map(task => (
                                <Link
                                    key={task.id}
                                    to={`/tasks/${task.id}`}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center justify-between px-3 py-3 hover:bg-white dark:hover:bg-slate-800/80 rounded-lg border border-transparent hover:border-gray-100 dark:hover:border-slate-700 mb-1"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div
                                            className={`w-2.5 h-2.5 rounded-full ${PRIORITY_DOT_COLORS[task.priority]}`}
                                        />
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">
                                                <Highlight text={task.title} highlight={query} />
                                            </span>
                                            <span className="text-[10px] text-gray-500 dark:text-slate-400 uppercase truncate">
                                                {task.status}
                                            </span>
                                        </div>
                                    </div>

                                    {task.project?.name && (
                                        <span className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 truncate max-w-[140px]">
                                            {task.project.name}
                                        </span>
                                    )}
                                </Link>

                            ))}
                        </div>
                    )}

                    {results.projects?.length === 0 &&
                        results.tasks?.length === 0 && (
                            <div className="p-10 text-center text-gray-500 dark:text-slate-400">
                                No results for <strong className="text-gray-900 dark:text-slate-200">"{query}"</strong>
                            </div>
                        )}
                </div>
            )}
        </div>
    );
};

export default Search;
