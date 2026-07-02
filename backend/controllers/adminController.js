import Traffic from '../models/Traffic.js';
import User from '../models/User.js';
import Contract from '../models/Contract.js';

export const getTrafficStats = async (req, res) => {
    try {
        const now = new Date();
        const last24h = new Date(now - 24 * 60 * 60 * 1000);
        const last7d  = new Date(now - 7  * 24 * 60 * 60 * 1000);
        const last30d = new Date(now - 30 * 24 * 60 * 60 * 1000);

        // ── Run all queries in parallel ──────────────────────────────────────
        const [
            // Traffic
            totalRequests,
            last24hRequests,
            last7dRequests,
            uniqueIPsArr,
            avgRespArr,
            deviceBreakdown,
            browserBreakdown,
            osBreakdown,
            countryBreakdown,
            cityBreakdown,
            topRoutes,
            hourlyTraffic,
            dailyTraffic,
            recentRequests,
            statusBreakdown,

            // Users — real MongoDB data
            totalUsers,
            newUsersLast7d,
            newUsersLast30d,
            usersWithCredits,
            allUsers,

            // Contracts — real MongoDB data
            totalContracts,
            contractsLast7d,
            contractsLast30d,
            recentContracts,

            // Credits / activity
            totalCreditsInSystem,
            totalLookupsAllUsers,
        ] = await Promise.all([

            // ── Traffic queries ──────────────────────────────────
            Traffic.countDocuments(),
            Traffic.countDocuments({ timestamp: { $gte: last24h } }),
            Traffic.countDocuments({ timestamp: { $gte: last7d  } }),

            Traffic.distinct('ip', { timestamp: { $gte: last30d } }),

            Traffic.aggregate([
                { $match: { timestamp: { $gte: last7d } } },
                { $group: { _id: null, avg: { $avg: '$responseTime' } } }
            ]),

            Traffic.aggregate([
                { $match: { timestamp: { $gte: last30d } } },
                { $group: { _id: '$device', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),

            Traffic.aggregate([
                { $match: { timestamp: { $gte: last30d } } },
                { $group: { _id: '$browser', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 6 }
            ]),

            Traffic.aggregate([
                { $match: { timestamp: { $gte: last30d } } },
                { $group: { _id: '$os', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),

            // Country breakdown
            Traffic.aggregate([
                { $match: { timestamp: { $gte: last30d }, country: { $nin: ['Unknown', 'Local'] } } },
                { $group: { _id: '$country', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),

            // City breakdown
            Traffic.aggregate([
                { $match: { timestamp: { $gte: last30d }, city: { $nin: ['Unknown', 'Localhost'] } } },
                { $group: { _id: '$city', count: { $sum: 1 }, country: { $first: '$country' } } },
                { $sort: { count: -1 } },
                { $limit: 8 }
            ]),

            Traffic.aggregate([
                { $match: { timestamp: { $gte: last7d } } },
                { $group: { _id: '$route', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 8 }
            ]),

            // Hourly for last 24h
            Traffic.aggregate([
                { $match: { timestamp: { $gte: last24h } } },
                {
                    $group: {
                        _id: {
                            hour: { $hour: '$timestamp' },
                            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
                        },
                        count: { $sum: 1 },
                        avgTime: { $avg: '$responseTime' }
                    }
                },
                { $sort: { '_id.date': 1, '_id.hour': 1 } }
            ]),

            // Daily for last 30 days
            Traffic.aggregate([
                { $match: { timestamp: { $gte: last30d } } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
                        count: { $sum: 1 },
                        uniqueIPs: { $addToSet: '$ip' }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        count: 1,
                        uniqueVisitors: { $size: '$uniqueIPs' }
                    }
                },
                { $sort: { _id: 1 } }
            ]),

            Traffic.find()
                .sort({ timestamp: -1 })
                .limit(25)
                .select('ip method route statusCode responseTime device browser os country city region timestamp userId'),

            Traffic.aggregate([
                { $match: { timestamp: { $gte: last7d } } },
                { $group: { _id: '$statusCode', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),

            // ── User queries ─────────────────────────────────────
            User.countDocuments(),
            User.countDocuments({ createdAt: { $gte: last7d  } }),
            User.countDocuments({ createdAt: { $gte: last30d } }),
            User.countDocuments({ credits: { $gt: 0 } }),

            // Full user list for the users table
            User.find()
                .select('username email credits lookupsCount createdAt')
                .sort({ createdAt: -1 })
                .limit(100),

            // ── Contract queries ─────────────────────────────────
            Contract.countDocuments(),
            Contract.countDocuments({ uploadedAt: { $gte: last7d  } }),
            Contract.countDocuments({ uploadedAt: { $gte: last30d } }),

            Contract.find()
                .sort({ uploadedAt: -1 })
                .limit(10)
                .select('fileName fileSize uploadedAt userId analysis')
                .populate('userId', 'username email'),

            // ── Credit / activity aggregations ───────────────────
            User.aggregate([
                { $group: { _id: null, total: { $sum: '$credits' } } }
            ]).then(r => r[0]?.total || 0),

            User.aggregate([
                { $group: { _id: null, total: { $sum: '$lookupsCount' } } }
            ]).then(r => r[0]?.total || 0),
        ]);

        // Build daily user growth (last 30d) from allUsers
        const userGrowthMap = {};
        allUsers.forEach(u => {
            const day = u.createdAt?.toISOString().slice(0, 10);
            if (day) userGrowthMap[day] = (userGrowthMap[day] || 0) + 1;
        });
        const userGrowth = Object.entries(userGrowthMap)
            .map(([_id, count]) => ({ _id, count }))
            .sort((a, b) => a._id.localeCompare(b._id));

        return res.status(200).json({
            // Overview numbers
            overview: {
                totalRequests,
                last24hRequests,
                last7dRequests,
                uniqueVisitors: uniqueIPsArr.length,
                avgResponseTime: Math.round(avgRespArr[0]?.avg || 0),
                totalUsers,
                newUsersLast7d,
                newUsersLast30d,
                usersWithCredits,
                totalContracts,
                contractsLast7d,
                contractsLast30d,
                totalCreditsInSystem,
                totalLookupsAllUsers,
            },

            // Traffic charts
            deviceBreakdown,
            browserBreakdown,
            osBreakdown,
            countryBreakdown,
            cityBreakdown,
            topRoutes,
            hourlyTraffic,
            dailyTraffic,
            recentRequests,
            statusBreakdown,

            // Real user data
            users: allUsers,
            userGrowth,

            // Real contract data
            recentContracts,
        });

    } catch (err) {
        console.error('Admin stats error:', err);
        return res.status(500).json({ error: 'Failed to fetch analytics data' });
    }
};
