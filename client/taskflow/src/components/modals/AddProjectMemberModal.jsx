import { useState, useEffect, useRef } from "react";
import { useApi } from "../../components/hooks/useApi";
import Avatar from "../../components/common/Avatar";
import { FiSearch, FiX, FiCheck, FiUserPlus, FiUsers } from "react-icons/fi";
import { FaCrown, FaUserShield } from "react-icons/fa";
import { toast } from "react-toastify";
import { useUser } from "../../contexts/UserContext";

const AddProjectMemberModal = ({ isOpen, onClose, projectId, currentMembers = [], onMemberAdded }) => {
    const { currentUser } = useUser();
    const { makeRequest: searchUsers } = useApi();
    const { makeRequest: addMembers, loading: isSubmitting } = useApi();

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
                const url = `/api/search-assignees/?user=${encodeURIComponent(query)}`;
                const results = await searchUsers(url, "GET");

                const filteredResults = Array.isArray(results)
                    ? results.filter(result => {
                        const u = result.user || result;
                        if (!u || !u.id) return false;
                        if (currentMembers.some(m => m.user.id === u.id)) return false;
                        if (selectedUsers.some(s => s.user.id === u.id)) return false;
                        return true;
                    })
                    : [];

                setSearchResults(filteredResults);
                if (filteredResults.length > 0) {
                    setShowResults(true);
                }
            } catch (err) {
                console.error("Search failed:", err);
                setSearchResults([]);
            }
        }, 300);
    };

    const handleSelectUser = (userResult) => {
        const user = userResult.user || userResult;

        setSelectedUsers([...selectedUsers, { user, role: "Member" }]);

        setSearchQuery("");
        setSearchResults([]);
        setShowResults(false);
        inputRef.current?.focus();
    };

    const handleRemoveSelectedUser = (userId) => {
        setSelectedUsers(selectedUsers.filter(u => u.user.id !== userId));
    };

    const handleRoleChange = (userId, newRole) => {
        setSelectedUsers(selectedUsers.map(u =>
            u.user.id === userId ? { ...u, role: newRole } : u
        ));
    };

    const handleSubmit = async () => {
        if (!selectedUsers.length) return;

        try {
            const payload = selectedUsers.map(u => ({
                member_id: u.user.id,
                role: u.role
            }));

            await addMembers(`/api/projects/${projectId}/members/`, "POST", payload);
            toast.success("Members added successfully");
            onMemberAdded();
            onClose();
        } catch (err) {
            console.error("Failed to add members:", err);
            toast.error(err.message || "Failed to add members");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-opacity duration-200">
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Add Project Members</h2>
                        <p className="text-gray-500 mt-1">
                            Search and invite users to join this project
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <FiX size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex-1 overflow-visible overflow-y-auto">
                    {/* Search */}
                    <div ref={dropdownRef} className="relative mb-6">
                        <div className="relative">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchQuery}
                                onChange={handleInputChange}
                                placeholder="Search by name or email (e.g. @john)..."
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                            />
                        </div>

                        {showResults && searchResults.length > 0 && (
                            <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto">
                                <ul className="py-2">
                                    {searchResults.map((uResult) => {
                                        const u = uResult.user || uResult;
                                        return (
                                            <li
                                                key={u.id}
                                                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                                onClick={() => handleSelectUser(u)}
                                            >
                                                <Avatar name={u.display_name} url={u.avatar} size={8} />
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-800">{u.display_name}</p>
                                                    <p className="text-sm text-gray-500">{u.email}</p>
                                                </div>
                                                <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-md text-gray-600">
                                                    Select
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Selected Users */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            Selected Users ({selectedUsers.length})
                        </h3>

                        {selectedUsers.length > 0 ? (
                            <div className="space-y-3">
                                {selectedUsers.map(({ user, role }) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar name={user.display_name} url={user.avatar} size={10} />
                                            <div>
                                                <p className="font-medium text-gray-900">{user.display_name}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <select
                                                    value={role}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                    className="appearance-none pl-3 pr-8 py-1.5 text-sm font-medium border border-blue-200 rounded-md bg-white text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                                >
                                                    <option value="Member">Member</option>
                                                    <option value="Admin">Admin</option>
                                                </select>
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-blue-500">
                                                    {role === 'Admin' ? <FaCrown size={12} /> : <FaUserShield size={12} />}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleRemoveSelectedUser(user.id)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                title="Remove"
                                            >
                                                <FiX size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                                <FiUserPlus className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                <p className="text-gray-500 text-sm">No users selected. Search to add members.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-gray-600 font-medium hover:text-gray-800 hover:bg-gray-200/50 rounded-lg transition-colors"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        disabled={!selectedUsers.length || isSubmitting}
                        onClick={handleSubmit}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors font-medium shadow-sm"
                    >
                        {isSubmitting ? (
                            <span>Adding...</span>
                        ) : (
                            <>
                                <FiCheck size={18} />
                                Add Members
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddProjectMemberModal;
