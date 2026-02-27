const Transaction = require('../models/Transaction');
const User = require('../models/User');

const calculateMetrics = async (userId) => {
    const user = await User.findById(userId);
    if (!user) return null;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const transactions = await Transaction.find({
        userId,
        date: { $gte: startOfMonth }
    });

    const totalFoodSpend = transactions
        .filter(t => t.category === 'Food')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalSpend = transactions.reduce((sum, t) => sum + t.amount, 0);

    const today = new Date();
    const daysPassed = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    // Fallback if daysPassed is 0 to avoid division by zero (e.g. at exactly 12:00 AM on 1st)
    const activeDays = daysPassed === 0 ? 1 : daysPassed;

    const projectedSpend = Math.round((totalFoodSpend / activeDays) * daysInMonth);
    const budgetUsedPercent = user.foodBudget > 0 ? Math.round((totalFoodSpend / user.foodBudget) * 100) : 0;

    let severity = 'Safe';
    if (projectedSpend > user.foodBudget) {
        severity = 'Critical';
    } else if (budgetUsedPercent >= user.alertThreshold) {
        severity = 'Warning';
    } else if (projectedSpend > user.foodBudget * (user.alertThreshold / 100)) {
        severity = 'Warning';
    }

    return {
        totalSpend,
        totalFoodSpend,
        budgetUsedPercent,
        projectedSpend,
        budget: user.foodBudget,
        severity,
        activeDays,
        daysInMonth
    };
};

module.exports = { calculateMetrics };
