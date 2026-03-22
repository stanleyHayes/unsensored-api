const User = require('../models/user');

/**
 * Fire-and-forget utility to update a user's tag affinity scores.
 * @param {string} userId - The user's ID
 * @param {string[]} tags - Array of tags from the article
 * @param {number} weight - Score weight (e.g. view=1, like=3, bookmark=4, comment=5)
 */
const updateTagAffinity = async (userId, tags, weight) => {
    try {
        if (!userId || !tags || !tags.length) return;

        const user = await User.findById(userId);
        if (!user) return;

        const affinityMap = new Map();
        for (const entry of user.tagAffinities) {
            affinityMap.set(entry.tag, entry.score);
        }

        for (const tag of tags) {
            const current = affinityMap.get(tag) || 0;
            affinityMap.set(tag, current + weight);
        }

        // Sort by score descending and cap at top 50
        const sorted = [...affinityMap.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 50);

        user.tagAffinities = sorted.map(([tag, score]) => ({ tag, score }));
        await user.save();
    } catch (err) {
        // Fire-and-forget — log but don't throw
        console.error('updateTagAffinity error:', err.message);
    }
};

module.exports = updateTagAffinity;
