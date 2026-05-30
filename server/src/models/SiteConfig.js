import mongoose from 'mongoose';

const siteConfigSchema = new mongoose.Schema({
    hero: {
        title: { type: String, default: 'Unlock Your Potential with Modern Education' },
        subtitle: { type: String, default: 'Master industry-relevant skills with our project-based learning path.' },
        badgeText: { type: String, default: 'v2.0 Now Live - Join the future of learning' }
    },
    features: {
        showLiveClasses: { type: Boolean, default: true },
        showMentorship: { type: Boolean, default: true },
        showResources: { type: Boolean, default: true }
    },
    maintenanceMode: { type: Boolean, default: false },
    announcement: {
        isActive: { type: Boolean, default: false },
        message: { type: String, default: '' },
        bgColor: { type: String, default: 'bg-indigo-600' }
    }
}, { timestamps: true });

// Singleton pattern: Ensure only one config exists
siteConfigSchema.statics.getSingleton = async function () {
    let config = await this.findOne();
    if (!config) {
        config = await this.create({});
    }
    return config;
};

export const SiteConfig = mongoose.model('SiteConfig', siteConfigSchema);
