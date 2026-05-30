import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Shield, Calendar, Edit2, Save, X } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        bio: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = () => {
        // TODO: Implement API call to update profile
        console.log('Saving profile:', formData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            phone: '',
            bio: ''
        });
        setIsEditing(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <User className="w-8 h-8 text-indigo-600" />
                        My Profile
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Manage your personal information and preferences
                    </p>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            Save
                        </button>
                        <button
                            onClick={handleCancel}
                            className="flex items-center gap-2 bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors"
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </button>
                    </div>
                )}
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Cover Image */}
                <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                {/* Profile Content */}
                <div className="px-8 pb-8">
                    {/* Avatar */}
                    <div className="relative -mt-16 mb-6">
                        <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center">
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>

                    {/* Profile Information */}
                    <div className="space-y-6">
                        {/* Name */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                Full Name
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            ) : (
                                <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                                    <User className="w-5 h-5 text-slate-400" />
                                    {user?.name}
                                </div>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                Email Address
                            </label>
                            <div className="flex items-center gap-2 text-slate-700">
                                <Mail className="w-5 h-5 text-slate-400" />
                                {user?.email}
                            </div>
                        </div>

                        {/* Role */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                Role
                            </label>
                            <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-slate-400" />
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                                    {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                                </span>
                            </div>
                        </div>

                        {/* Phone (editable) */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                Phone Number
                            </label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Enter your phone number"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            ) : (
                                <div className="text-slate-700">
                                    {formData.phone || 'Not provided'}
                                </div>
                            )}
                        </div>

                        {/* Bio (editable) */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                Bio
                            </label>
                            {isEditing ? (
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    placeholder="Tell us about yourself..."
                                    rows="4"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            ) : (
                                <div className="text-slate-700">
                                    {formData.bio || 'No bio provided'}
                                </div>
                            )}
                        </div>

                        {/* Account Created */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                Member Since
                            </label>
                            <div className="flex items-center gap-2 text-slate-700">
                                <Calendar className="w-5 h-5 text-slate-400" />
                                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }) : 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Settings */}
            <div id="settings" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Account Settings</h2>
                <div className="space-y-3">
                    <button className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                        <div className="font-medium text-slate-900">Change Password</div>
                        <div className="text-xs text-slate-500 mt-1">Update your account password</div>
                    </button>
                    <button className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                        <div className="font-medium text-slate-900">Notification Preferences</div>
                        <div className="text-xs text-slate-500 mt-1">Manage email and push notifications</div>
                    </button>
                    <button className="w-full text-left px-4 py-3 rounded-lg border border-red-200 hover:bg-red-50 transition-colors text-red-600">
                        <div className="font-medium">Delete Account</div>
                        <div className="text-xs text-red-500 mt-1">Permanently delete your account and data</div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
