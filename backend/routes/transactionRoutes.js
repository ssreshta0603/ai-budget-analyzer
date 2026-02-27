const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Transaction = require('../models/Transaction');
const { calculateMetrics } = require('../services/analyticsEngine');
const { detectBehaviors } = require('../services/behaviorEngine');
const { generateNudge } = require('../services/llmService');
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
        const user = await User.findById(req.user.id);

        // Use LLM to generate the nudge text
        const nudgeText = await generateNudge({
            risk: metrics.severity,
            projected: metrics.projectedSpend,
            budget: metrics.budget,
            behavior: behavior.personality,
            coachStyle: user.coachStyle
        });

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
        if (!metrics) return res.status(404).json({ message: "User not found" });

        const behavior = await detectBehaviors(req.user.id);
        const user = await User.findById(req.user.id);

        const nudgeText = await generateNudge({
            risk: metrics.severity,
            projected: metrics.projectedSpend,
            budget: metrics.budget,
            behavior: behavior.personality,
            coachStyle: user.coachStyle
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
