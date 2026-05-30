import React, { useState } from 'react';
import { Search, FileText, Video, Download, ExternalLink, Bookmark, Filter } from 'lucide-react';

const resources = [
    { id: 1, title: 'React.js Complete Handbook', type: 'PDF', category: 'Frontend', size: '2.4 MB', downloads: '12k' },
    { id: 2, title: 'Advanced Node.js Patterns', type: 'Video', category: 'Backend', duration: '45 mins', views: '8.5k' },
    { id: 3, title: 'Data Structures Algorithms Cheat Sheet', type: 'PDF', category: 'CS Fundamentals', size: '1.1 MB', downloads: '34k' },
    { id: 4, title: 'System Design Interview Guide', type: 'PDF', category: 'System Design', size: '5.6 MB', downloads: '21k' },
    { id: 5, title: 'Docker & Kubernetes Crash Course', type: 'Video', category: 'DevOps', duration: '1h 20m', views: '15k' },
    { id: 6, title: 'UI/UX Principles for Developers', type: 'PDF', category: 'Design', size: '3.2 MB', downloads: '9k' },
    { id: 7, title: 'Machine Learning Basics', type: 'Video', category: 'AI/ML', duration: '55 mins', views: '11k' },
    { id: 8, title: 'GraphQL vs REST API', type: 'Article', category: 'Backend', readTime: '10 mins', views: '18k' },
];

const ResourceLibrary = () => {
    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredResources = resources.filter(resource => {
        const matchesTab = activeTab === 'All' || resource.type === activeTab;
        const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4 font-display">Resource Library</h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Access a curated collection of learning materials, cheat sheets, and video tutorials to accelerate your growth.
                    </p>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search resources..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-slate-700"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                        {['All', 'PDF', 'Video', 'Article'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${activeTab === tab
                                        ? 'bg-slate-900 text-white shadow-md'
                                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Resources Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResources.map((resource) => (
                        <div key={resource.id} className="group bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${resource.type === 'PDF' ? 'bg-red-50 text-red-500' :
                                        resource.type === 'Video' ? 'bg-blue-50 text-blue-500' :
                                            'bg-emerald-50 text-emerald-500'
                                    }`}>
                                    {resource.type === 'PDF' && <FileText className="h-6 w-6" />}
                                    {resource.type === 'Video' && <Video className="h-6 w-6" />}
                                    {resource.type === 'Article' && <ExternalLink className="h-6 w-6" />}
                                </div>
                                <button className="text-slate-400 hover:text-primary transition-colors">
                                    <Bookmark className="h-5 w-5" />
                                </button>
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 min-h-[56px]">
                                {resource.title}
                            </h3>

                            <div className="flex items-center gap-2 mb-4 text-xs font-medium text-slate-500">
                                <span className="bg-slate-100 px-2 py-1 rounded-md">{resource.category}</span>
                                <span>•</span>
                                <span>{resource.size || resource.duration || resource.readTime}</span>
                            </div>

                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                                <div className="text-sm text-slate-400">
                                    {resource.downloads ? `${resource.downloads} downloads` : `${resource.views} views`}
                                </div>
                                <button className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark transition-colors">
                                    Download <Download className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredResources.length === 0 && (
                    <div className="text-center py-20 text-slate-500">
                        <Filter className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No resources found matching your search.</p>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ResourceLibrary;
