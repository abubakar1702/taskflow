import { useState, useEffect, useRef } from "react";
import { useApi } from "../../components/hooks/useApi";
import Avatar from "../../components/common/Avatar";
import { FiSearch, FiX, FiCheck } from "react-icons/fi";

const AddAssigneeModal = ({ isOpen, onClose, taskId, currentAssignees = [], project, onAdd }) => {
    const { makeRequest: searchUsers } = useApi();
    const { makeRequest: addAssignees } = useApi();

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
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
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

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
        if (!value.trim()) {
            setShowResults(false);
            setSearchResults([]);
            return;
        }

        searchTimeoutRef.current = setTimeout(async () => {
            try {
                let results = [];
                const query = value.startsWith("@") ? value.substring(1) : value;

                if (!query) return;

                if (project) {
                    results = await searchUsers(
                        `/api/projects/${project.id}/search-assignees/?member=${encodeURIComponent(query)}`,
                        "GET"
                    );
                } else {
                    results = await searchUsers(
                        `/user/search/?q=${encodeURIComponent(query)}`,
                        "GET"
                    );
                }

                const filteredResults = Array.isArray(results)
                    ? results.filter(u => !currentAssignees.some(a => a.email === u.user.email) &&
                        !selectedUsers.some(s => s.id === u.user.id))
                    : [];

                setSearchResults(filteredResults);
                setShowResults(true);
            } catch (err) {
                console.error("Search failed:", err);
                setSearchResults([]);
            }
        }, 300);
    };

    const handleSelectUser = (user) => {
        setSelectedUsers([...selectedUsers, user.user]);
        setSearchQuery("");
        setSearchResults([]);
        setShowResults(false);
        inputRef.current?.focus();
    };

    const handleRemoveSelectedUser = (id) => {
        setSelectedUsers(selectedUsers.filter(u => u.id !== id));
    };

    const handleAddAssignees = async () => {
        if (!selectedUsers.length) return;

        try {
            await addAssignees(`/api/tasks/${taskId}/assignees/`, "PATCH", {
                assignee_ids: selectedUsers.map(u => u.id)
            });
            onAdd();
            onClose();
        } catch (err) {
            console.error("Failed to add assignees:", err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-opacity duration-200">
            {/* Modal Content */}
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all scale-100 flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Add Assignees</h2>
                        <p className="text-gray-500 mt-1">Search and select team members to assign to this task</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                    >
                        <FiX size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-visible flex-1">
                    {/* Selected Users Area */}
                    <div className="mb-6 min-h-[40px]">
                        {selectedUsers.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {selectedUsers.map(user => (
                                    <div
                                        key={user.id}
                                        className="flex items-center gap-2 pl-1 pr-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 rounded-full transition-all group hover:border-blue-200"
                                    >
                                        <div className="w-6 h-6">
                                            <Avatar name={user.display_name} url={user.avatar} size={6} />
                                        </div>
                                        <span className="text-sm font-medium">{user.display_name}</span>
                                        <button
                                            onClick={() => handleRemoveSelectedUser(user.id)}
                                            className="ml-1 p-0.5 rounded-full hover:bg-blue-200 text-blue-500 hover:text-blue-700 transition-colors"
                                        >
                                            <FiX size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 italic text-sm">No new assignees selected yet...</p>
                        )}
                    </div>

                    {/* Search Input Area */}
                    <div ref={dropdownRef} className="relative">
                        <div className="relative">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchQuery}
                                onChange={handleInputChange}
                                placeholder="Search by name or email (e.g. @john)"
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-base"
                            />
                        </div>

                        {/* Dropdown Results */}
                        {showResults && (
                            <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden max-h-80 overflow-y-auto transform origin-top animate-in fade-in slide-in-from-top-2 duration-200">
                                {searchResults.length > 0 ? (
                                    <ul className="py-2">
                                        {searchResults.map((u) => (
                                            <li
                                                key={u.user.id}
                                                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors group border-b border-gray-50 last:border-0"
                                                onClick={() => handleSelectUser(u)}
                                            >
                                                <Avatar name={u.user.display_name} url={u.user.avatar} size={8} />
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                                        {u.user.display_name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{u.user.email}</p>
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity">
                                                    <span className="text-xs font-medium px-2 py-1 bg-blue-50 rounded-md">Add</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : searchQuery.trim() && (
                                    <div className="p-8 text-center text-gray-500">
                                        <p>No members found matching "{searchQuery}"</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 rounded-b-xl flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-gray-600 font-medium hover:text-gray-800 hover:bg-gray-200/50 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={!selectedUsers.length}
                        onClick={handleAddAssignees}
                        className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow transition-all flex items-center gap-2"
                    >
                        <FiCheck size={18} />
                        Add {selectedUsers.length > 0 ? `${selectedUsers.length} Member${selectedUsers.length > 1 ? 's' : ''}` : 'Members'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddAssigneeModal;
