import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAdminUsers, updateUserRole, deleteUser } from '../../api/adminApi';
import {
    Users,
    Search,
    Shield,
    Trash2,
    Edit,
    CheckCircle,
    XCircle,
    AlertTriangle
} from 'lucide-react';

const AdminTeam = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');

    const roles = [
        { value: 'admin', label: 'Full Admin' },
        { value: 'course_admin', label: 'Course Admin' },
        { value: 'finance_admin', label: 'Finance Admin' },
        { value: 'hr_admin', label: 'HR Admin' },
        { value: 'instructor', label: 'Instructor' },
        { value: 'student', label: 'Student' } // Demote to student
    ];

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // We need a specific endpoint to list admins or all users for management
            // Assuming getAdminUsers exists or we use a generic list endpoint
            // Actually we probably need to implement getAdminUsers in adminApi if not exists
            // For now let's assume getStudents or something similar logic but for 'admins'
            // Or we can fetch all users.
            // Let's implement getAllUsers in backend adminController first.

            const res = await getAdminUsers(); // Implementation needed in api
            setUsers(res.data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (userId, newRole) => {
        try {
            await updateUserRole(userId, newRole);
            setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
            setEditingUser(null);
        } catch (error) {
            console.error("Failed to update role", error);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to remove this user?")) return;
        try {
            await deleteUser(userId);
            setUsers(users.filter(u => u._id !== userId));
        } catch (error) {
            console.error("Failed to delete user", error);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (user.role !== 'super_admin') {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
                <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
                <p className="text-slate-500">Only Super Admin can manage the team.</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Team Management</h1>
                    <p className="text-slate-500">Manage admins and assign specific roles.</p>
                </div>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search team members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 outline-none text-slate-700 placeholder:text-slate-400"
                />
            </div>

            {/* Users List */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-900">User</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Current Role</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-8 text-center text-slate-500">
                                        Loading team...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-8 text-center text-slate-500">
                                        No users found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((u) => (
                                    <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase">
                                                    {u.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{u.name}</p>
                                                    <p className="text-xs text-slate-500">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingUser === u._id ? (
                                                <select
                                                    className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                    value={selectedRole || u.role}
                                                    onChange={(e) => setSelectedRole(e.target.value)}
                                                >
                                                    {roles.map(r => (
                                                        <option key={r.value} value={r.value}>{r.label}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${u.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                                                        u.role === 'admin' ? 'bg-indigo-100 text-indigo-800' :
                                                            u.role === 'instructor' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-slate-100 text-slate-800'}`}>
                                                    {u.role.replace('_', ' ')}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {editingUser === u._id ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleRoleUpdate(u._id, selectedRole)}
                                                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                                                            title="Save"
                                                        >
                                                            <CheckCircle className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingUser(null)}
                                                            className="p-1 text-slate-400 hover:bg-slate-50 rounded"
                                                            title="Cancel"
                                                        >
                                                            <XCircle className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    u.role !== 'super_admin' && ( // Cannot edit other super admins? Should be able to if I am super admin.
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingUser(u._id);
                                                                    setSelectedRole(u.role);
                                                                }}
                                                                className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                                                                title="Edit Role"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUser(u._id)}
                                                                className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                                                                title="Remove User"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminTeam;
