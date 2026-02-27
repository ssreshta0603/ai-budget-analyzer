const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

// Get user profile
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-passwordHash');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update user profile (setup onboarding)
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            user.monthlyIncome = req.body.monthlyIncome || user.monthlyIncome;
            user.savingsGoalPercent = req.body.savingsGoalPercent || user.savingsGoalPercent;
            user.foodBudget = req.body.foodBudget || user.foodBudget;
            user.alertThreshold = req.body.alertThreshold || user.alertThreshold;
            user.coachStyle = req.body.coachStyle || user.coachStyle;

            if (req.body.onboardingComplete !== undefined) {
                user.onboardingComplete = req.body.onboardingComplete;
            } else if (req.body.monthlyIncome && req.body.foodBudget && req.body.coachStyle) {
                user.onboardingComplete = true; // Auto complete if basic fields are provided
            }

            const updatedUser = await user.save();

            res.json({
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                monthlyIncome: updatedUser.monthlyIncome,
                savingsGoalPercent: updatedUser.savingsGoalPercent,
                foodBudget: updatedUser.foodBudget,
                alertThreshold: updatedUser.alertThreshold,
                coachStyle: updatedUser.coachStyle,
                onboardingComplete: updatedUser.onboardingComplete
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
