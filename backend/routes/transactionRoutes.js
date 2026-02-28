const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Transaction = require('../models/Transaction');
const { calculateMetrics, getDetailedStats } = require('../services/analyticsEngine');
const { detectBehaviors } = require('../services/behaviorEngine');
const { generateNudge, generateDetailedInsights } = require('../services/llmService');
const User = require('../models/User');

// Add a transaction
router.post('/', protect, async (req, res) => {
    try {
        const { amount, merchant, category, date } = req.body;

        const transaction = await Transaction.create({
            userId: req.user.id,
            amount: Number(amount),
            merchant,
            category: category || 'Food',
            date: date ? new Date(date) : new Date()
        });

        // Generate updated dashboard metrics
        const metrics = await calculateMetrics(req.user.id);
        const behavior = await detectBehaviors(req.user.id);
        const stats = await getDetailedStats(req.user.id);
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: "User not found" });

        // Use LLM to generate the nudge text
        const nudgeText = await generateNudge({
            risk: metrics.severity,
            projected: metrics.projectedSpend,
            budget: metrics.budget,
            behavior: behavior.personality,
            coachStyle: user.coachStyle || 'Balanced',
            stats,
            history: user.nudgeHistory || []
        });

        // Update nudge history (keep last 10)
        user.nudgeHistory.push(nudgeText);
        if (user.nudgeHistory.length > 10) user.nudgeHistory.shift();
        await user.save();

        res.status(201).json({
            transaction,
            dashboardUpdate: {
                metrics,
                behavior,
                nudge: nudgeText
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user transactions (current month)
router.get('/', protect, async (req, res) => {
    try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const transactions = await Transaction.find({
            userId: req.user.id,
            date: { $gte: startOfMonth }
        }).sort({ date: -1 });

        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get dashboard summary explicitly
router.get('/dashboard', protect, async (req, res) => {
    try {
        const metrics = await calculateMetrics(req.user.id);
        const behavior = await detectBehaviors(req.user.id);
        const stats = await getDetailedStats(req.user.id);
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: "User not found" });

        const nudgeText = await generateNudge({
            risk: metrics?.severity || 'Safe',
            projected: metrics?.projectedSpend || 0,
            budget: metrics?.budget || 0,
            behavior: behavior?.personality || 'Cautious Starter',
            coachStyle: user.coachStyle || 'Balanced',
            stats,
            history: user.nudgeHistory || []
        });

        res.json({
            metrics,
            behavior,
            nudge: nudgeText
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// New Insights Endpoint
router.get('/insights', protect, async (req, res) => {
    try {
        const metrics = await calculateMetrics(req.user.id);
        const behavior = await detectBehaviors(req.user.id);
        const stats = await getDetailedStats(req.user.id);
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: "User not found" });

        if (!stats) {
            return res.json({
                behavior,
                metrics,
                aiInsights: {
                    habitInsight: "Start adding transactions to see patterns!",
                    volatilityInsight: "No data yet.",
                    actionableTip: "Add your first expense today."
                }
            });
        }

        const aiInsights = await generateDetailedInsights(
            metrics,
            stats,
            user.coachStyle || 'Balanced'
        );

        res.json({
            behavior,
            metrics,
            stats,
            aiInsights
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete all transactions (Settings reset)
router.delete('/all', protect, async (req, res) => {
    try {
        await Transaction.deleteMany({ userId: req.user.id });
        res.json({ message: 'All transactions cleared' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
