import { SiteConfig } from '../models/SiteConfig.js';

export const getSiteConfig = async (req, res) => {
    try {
        const config = await SiteConfig.getSingleton();
        return res.json(config);
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
};

export const updateSiteConfig = async (req, res) => {
    try {
        const { hero, features, maintenanceMode, announcement } = req.body;
        let config = await SiteConfig.getSingleton();

        if (hero) config.hero = { ...config.hero, ...hero };
        if (features) config.features = { ...config.features, ...features };
        if (typeof maintenanceMode !== 'undefined') config.maintenanceMode = maintenanceMode;
        if (announcement) config.announcement = { ...config.announcement, ...announcement };

        await config.save();
        return res.json(config);
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
};
