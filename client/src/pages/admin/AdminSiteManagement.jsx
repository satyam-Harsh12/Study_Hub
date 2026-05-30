import React, { useState, useEffect } from 'react';
import { getSiteConfig, updateSiteConfig } from '../../api/siteApi.js';
import { Save, Loader, Eye, Globe, AlertTriangle } from 'lucide-react';

const AdminSiteManagement = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const res = await getSiteConfig();
            // Ensure defaults if fields missing
            const data = res.data || {};
            setConfig({
                hero: {
                    title: data.hero?.title || '',
                    subtitle: data.hero?.subtitle || '',
                    badgeText: data.hero?.badgeText || ''
                },
                features: {
                    showLiveClasses: data.features?.showLiveClasses ?? true,
                    showMentorship: data.features?.showMentorship ?? true,
                    showResources: data.features?.showResources ?? true
                },
                maintenanceMode: data.maintenanceMode ?? false,
                announcement: {
                    isActive: data.announcement?.isActive ?? false,
                    message: data.announcement?.message || '',
                    bgColor: data.announcement?.bgColor || 'bg-indigo-600'
                }
            });
        } catch (err) {
            console.error(err);
            setMessage('Failed to load configuration.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (section, field, value) => {
        setConfig(prev => {
            if (section === 'root') {
                return { ...prev, [field]: value };
            }
            return {
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: value
                }
            };
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            await updateSiteConfig(config);
            setMessage('Configuration saved successfully!');
        } catch (err) {
            setMessage('Failed to save changes.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading site settings...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">Site Management (CMS)</h2>
                    <p className="text-sm text-slate-500">Control home page content and system-wide settings.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-70"
                >
                    {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {message && (
                <div className={`p-3 rounded-lg text-sm ${message.includes('Failed') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Hero Section Config */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="flex items-center gap-2 font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                        <Globe className="w-4 h-4 text-slate-500" />
                        Home Page Hero
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Badge Text (Top Notification)</label>
                            <input
                                type="text"
                                value={config.hero.badgeText}
                                onChange={(e) => handleChange('hero', 'badgeText', e.target.value)}
                                className="w-full text-sm border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Main Headline</label>
                            <textarea
                                rows={2}
                                value={config.hero.title}
                                onChange={(e) => handleChange('hero', 'title', e.target.value)}
                                className="w-full text-sm border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Supports HTML tags roughly (e.g. &lt;br/&gt;)</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Subtitle</label>
                            <textarea
                                rows={3}
                                value={config.hero.subtitle}
                                onChange={(e) => handleChange('hero', 'subtitle', e.target.value)}
                                className="w-full text-sm border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>
                </div>

                {/* System Settings */}
                <div className="space-y-6">
                    {/* Section Toggles */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="flex items-center gap-2 font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                            <Eye className="w-4 h-4 text-slate-500" />
                            Feature Visibility
                        </h3>
                        <div className="space-y-3">
                            <label className="flex items-center justify-between p-2 rounded hover:bg-slate-50 cursor-pointer">
                                <span className="text-sm text-slate-700">Live Classes Section</span>
                                <input
                                    type="checkbox"
                                    checked={config.features.showLiveClasses}
                                    onChange={(e) => handleChange('features', 'showLiveClasses', e.target.checked)}
                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                />
                            </label>
                            <label className="flex items-center justify-between p-2 rounded hover:bg-slate-50 cursor-pointer">
                                <span className="text-sm text-slate-700">Mentorship Section</span>
                                <input
                                    type="checkbox"
                                    checked={config.features.showMentorship}
                                    onChange={(e) => handleChange('features', 'showMentorship', e.target.checked)}
                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                />
                            </label>
                            <label className="flex items-center justify-between p-2 rounded hover:bg-slate-50 cursor-pointer">
                                <span className="text-sm text-slate-700">Resources Library</span>
                                <input
                                    type="checkbox"
                                    checked={config.features.showResources}
                                    onChange={(e) => handleChange('features', 'showResources', e.target.checked)}
                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-red-50 p-6 rounded-2xl border border-red-100 shadow-sm">
                        <h3 className="flex items-center gap-2 font-semibold text-red-800 mb-4 pb-2 border-b border-red-200">
                            <AlertTriangle className="w-4 h-4" />
                            Critical System Settings
                        </h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="block text-sm font-bold text-red-900">Maintenance Mode</span>
                                <span className="text-xs text-red-700">Disables access for non-admin users.</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={config.maintenanceMode}
                                    onChange={(e) => handleChange('root', 'maintenanceMode', e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-red-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminSiteManagement;
