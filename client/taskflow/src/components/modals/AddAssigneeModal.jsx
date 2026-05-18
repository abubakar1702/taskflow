import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../utils/apiClient";
import { QUERY_KEYS } from "../../utils/queryKeys";
import Avatar from "../../components/common/Avatar";
import { FiSearch, FiX, FiCheck, FiUsers } from "react-icons/fi";
import { toast } from "react-toastify";
import { useUser } from "../../contexts/UserContext";
import { ClipLoader } from "react-spinners";

const getPlainUser = (result) => (result ? result.user || result : {});

const AddAssigneeModal = ({ isOpen, onClose, taskId, currentAssignees = [], project, onAdd }) => {
    const { currentUser } = useUser();
    const queryClient = useQueryClient();

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [projectMembers, setProjectMembers] = useState([]);
    const searchTimeoutRef = useRef(null);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
            setSearchQuery("");
            setSearchResults([]);
            setShowResults(false);
            setSelectedUsers([]);
        } else {
            if (project && project.members) {
                const members = project.members
                    .map((member) => getPlainUser(member))
                    .filter((member) => {
                        if (!member || !member.id) return false;
                        if (member.id === currentUser?.id) return false;
                        return !currentAssignees.some(a => a.id === member.id);
                    });
                setProjectMembers(members);
                setSearchResults(members);
            }

            const timeoutId = setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
            return () => clearTimeout(timeoutId);
        }
    }, [isOpen, project, currentAssignees, currentUser]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleInputChange = (e) => {
        const value = e.target.value || "";
        setSearchQuery(value);

        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);


        if (project) {
            if (!showResults) return;

            if (!value.trim()) {
                setSearchResults(projectMembers);
                return;
            }

            const filteredMembers = projectMembers.filter((member) =>
                member.display_name?.toLowerCase().includes(value.toLowerCase()) ||
                member.email?.toLowerCase().includes(value.toLowerCase())
            );
            setSearchResults(filteredMembers);
            return;
        }

        if (!value.includes("@")) {
            setShowResults(false);
            setSearchResults([]);
            return;
        }

        const query = value.trim();

        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const url = `/api/search-assignees/?user=${encodeURIComponent(query)}`;
                const responseData = (await apiClient.get(url)).data;

                const resultsArray = Array.isArray(responseData)
                    ? responseData
                    : (responseData && Array.isArray(responseData.results) ? responseData.results : []);

                const filteredResults = resultsArray.filter(result => {
                    const u = getPlainUser(result);
                    if (!u || !u.id || !u.email) return false;
                    if (u.id === currentUser?.id) return false;
                    if (currentAssignees.some(a => a.id === u.id)) return false;
                    return !selectedUsers.some(s => s.id === u.id);
                });

                setSearchResults(filteredResults);
                if (filteredResults.length > 0) {
                    setShowResults(true);
                } else {
                    setShowResults(false);
                }
            } catch (err) {
                console.error("Search failed:", err);
                setSearchResults([]);
                setShowResults(false);
            }
        }, 300);
    };

    const handleFocus = () => {
        if (project && projectMembers.length > 0) {
            setSearchResults(projectMembers);
            setShowResults(true);
        }
    };

    const handleSelectUser = (userResult) => {
        const user = getPlainUser(userResult);

        const isAlreadySelected = selectedUsers.some(u => u.id === user.id);

        if (isAlreadySelected) {
            setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
        } else {
            setSelectedUsers([...selectedUsers, user]);
        }

        if (!project) {
            setSearchQuery("");
            setSearchResults([]);
            setShowResults(false);
        }

        inputRef.current?.focus();
    };

    const handleRemoveSelectedUser = (id) => {
        setSelectedUsers(selectedUsers.filter(u => u.id !== id));
    };

    const { mutate: addAssigneesMutation, isPending: isAdding } = useMutation({
        mutationFn: (ids) =>
            apiClient.patch(`/api/tasks/${taskId}/assignees/`, { assignee_ids: ids }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.task(taskId) });
            onAdd();
            toast.success("Assignees added successfully");
            onClose();
        },
        onError: () => toast.error("Failed to add assignees. Please try again."),
    });

    const handleAddAssignees = () => {
        if (!selectedUsers.length) return;
        addAssigneesMutation(selectedUsers.map((u) => u.id));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-sm shadow-none w-full max-w-2xl flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
                    <div>
                        <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Add Assignees</h2>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                            {project
                                ? "Select team members from the project to assign to this task"
                                : "Search and select team members to assign to this task"
                            }
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                    >
                        <FiX size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex-1 overflow-visible">
                    {/* Selected Users */}
                    <div className="mb-6 min-h-[40px]">
                        {selectedUsers.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {selectedUsers.map(user => (
                                    <div
                                        key={user.id}
                                        className="flex items-center gap-2 pl-1 pr-2.5 py-1 bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/80 text-blue-700 dark:text-blue-400 rounded-sm"
                                    >
                                        <div className="w-6 h-6">
                                            <Avatar name={user.display_name} url={user.avatar} size={6} className="rounded-sm" />
                                        </div>
                                        <span className="text-xs font-bold">{user.display_name}</span>
                                        <button
                                            onClick={() => handleRemoveSelectedUser(user.id)}
                                            className="ml-1 p-0.5 rounded-sm hover:bg-blue-200/60 dark:hover:bg-blue-900/50 text-blue-500 dark:text-blue-400 transition-colors"
                                        >
                                            <FiX size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 dark:text-slate-500 italic text-xs font-semibold">No new assignees selected yet...</p>
                        )}
                    </div>

                    {/* Search */}
                    <div ref={dropdownRef} className="relative">
                        <div className="relative">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchQuery}
                                onChange={handleInputChange}
                                onFocus={handleFocus}
                                placeholder={
                                    project
                                        ? "Search project members..."
                                        : "Search by name or email (e.g. @john)"
                                }
                                className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 dark:bg-slate-955 border border-gray-200 dark:border-slate-800 rounded-sm text-slate-800 dark:text-slate-200 text-xs font-medium focus:bg-white dark:focus:bg-slate-950 focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                            {project && (
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-blue-50/40 dark:bg-blue-950/25 border border-blue-200 dark:border-blue-900/80 text-blue-700 dark:text-blue-400 text-[9px] font-bold uppercase tracking-wider">
                                    <FiUsers size={10} />
                                    Project Members
                                </span>
                            )}
                        </div>

                        {showResults && searchResults.length > 0 && (
                            <div className="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-sm shadow-none border border-gray-200 dark:border-slate-800 max-h-80 overflow-y-auto">
                                <ul className="py-1">
                                    {searchResults.map((uResult) => {
                                        const u = getPlainUser(uResult);
                                        const isSelected = selectedUsers.some(s => s.id === u.id);
                                        return (
                                            <li
                                                key={u.id}
                                                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${isSelected
                                                    ? "bg-blue-50/40 dark:bg-blue-950/20 border-l-2 border-blue-500"
                                                    : "hover:bg-gray-50 dark:hover:bg-slate-800"
                                                    }`}
                                                onClick={() => handleSelectUser(uResult)}
                                            >
                                                <Avatar name={u.display_name} url={u.avatar} size={7.5} className="rounded-sm" />
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-xs font-bold truncate ${isSelected ? "text-blue-800 dark:text-blue-400" : "text-slate-800 dark:text-slate-200"}`}>
                                                        {u.display_name}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold truncate">{u.email}</p>
                                                </div>
                                                {isSelected ? (
                                                    <div className="flex-shrink-0 p-1 bg-blue-100/60 dark:bg-blue-950/40 rounded-sm">
                                                        <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-450" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                ) : (
                                                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-sm text-slate-650 dark:text-slate-400 border border-slate-200 dark:border-slate-700 uppercase tracking-wider">
                                                        Add
                                                    </span>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50/60 dark:bg-slate-950/60 border-t border-gray-200 dark:border-slate-800 flex justify-end gap-3 rounded-b-sm">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-sm border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={!selectedUsers.length || isAdding}
                        onClick={handleAddAssignees}
                        className="px-5 py-2 bg-blue-650 hover:bg-blue-755 text-white rounded-sm text-xs font-bold uppercase tracking-wider transition-colors border border-transparent shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                        {isAdding ? (
                            <>
                                <ClipLoader size={12} color="#ffffff" />
                                <span>Adding...</span>
                            </>
                        ) : (
                            <>
                                <FiCheck size={14} />
                                <span>Add {selectedUsers.length > 0 ? `${selectedUsers.length} Member${selectedUsers.length > 1 ? "s" : ""}` : "Members"}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddAssigneeModal;
