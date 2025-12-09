import { useState, useEffect, useRef } from "react";
import { useApi } from "../../components/hooks/useApi";
import Avatar from "../../components/common/Avatar";
import { FiSearch, FiX, FiCheck } from "react-icons/fi";

const getPlainUser = (result) => (result ? result.user || result : {});

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
            const timeoutId = setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
            return () => clearTimeout(timeoutId);
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

        if (!value.includes("@")) { 
            setShowResults(false);
            setSearchResults([]);
            return;
        }

        const query = value.replace(/@/g, "").trim();

        if (!query) {
            setShowResults(false);
            setSearchResults([]);
            return;
        }

        searchTimeoutRef.current = setTimeout(async () => {
            try {
                let results = [];

                const url = project
                    ? `/api/search-assignees/?user=${encodeURIComponent(query)}&project=${project.id}`
                    : `/api/search-assignees/?user=${encodeURIComponent(query)}`;

                results = await searchUsers(url, "GET");

                const filteredResults = Array.isArray(results)
                    ? results.filter(result => {
                        const u = getPlainUser(result);
                        if (!u || !u.id || !u.email) return false;
                        return !currentAssignees.some(a => a.email === u.email) &&
                            !selectedUsers.some(s => s.id === u.id);
                    })
                    : [];

                setSearchResults(filteredResults);
                setShowResults(true);
            } catch (err) {
                console.error("Search failed:", err);
                setSearchResults([]);
            }
        }, 300);
    };

    const handleSelectUser = (userResult) => {
        const user = getPlainUser(userResult);
        setSelectedUsers([...selectedUsers, user]);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]"
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
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700"
                    >
                        <FiX size={24} />
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
                                        className="flex items-center gap-2 pl-1 pr-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 rounded-full"
                                    >
                                        <div className="w-6 h-6">
                                            <Avatar name={user.display_name} url={user.avatar} size={6} />
                                        </div>
                                        <span className="text-sm font-medium">{user.display_name}</span>
                                        <button
                                            onClick={() => handleRemoveSelectedUser(user.id)}
                                            className="ml-1 p-0.5 rounded-full hover:bg-blue-200 text-blue-500"
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

                    {/* Search */}
                    <div ref={dropdownRef} className="relative">
                        <div className="relative">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchQuery}
                                onChange={handleInputChange}
                                placeholder="Search by name or email (e.g. @john)"
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>

                        {showResults && (
                            <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-80 overflow-y-auto">
                                {searchResults.length > 0 ? (
                                    <ul className="py-2">
                                        {searchResults.map((uResult) => {
                                            const u = getPlainUser(uResult);
                                            return (
                                                <li
                                                    key={u.id}
                                                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                                                    onClick={() => handleSelectUser(uResult)}
                                                >
                                                    <Avatar name={u.display_name} url={u.avatar} size={8} />
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-gray-800">
                                                            {u.display_name}
                                                        </p>
                                                        <p className="text-sm text-gray-500">{u.email}</p>
                                                    </div>
                                                    <span className="text-xs font-medium px-2 py-1 bg-blue-50 rounded-md text-blue-500">
                                                        Add
                                                    </span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : searchQuery.trim() && (
                                    <div className="p-8 text-center text-gray-500">
                                        No members found matching "{searchQuery}"
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-gray-600 font-medium hover:text-gray-800 hover:bg-gray-200/50 rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={!selectedUsers.length}
                        onClick={handleAddAssignees}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        <FiCheck size={18} />
                        Add {selectedUsers.length > 0 ? `${selectedUsers.length} Member${selectedUsers.length > 1 ? "s" : ""}` : "Members"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddAssigneeModal;
