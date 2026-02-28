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

    // Granular Health Score Calculation (0-100)
    // Starts at 100, penalizes for budget used and projected overshoot
    let healthScore = 100;
    healthScore -= (budgetUsedPercent * 0.4); // 40% weight to current spend
    if (projectedSpend > user.foodBudget && user.foodBudget > 0) {
        const overshootPercent = ((projectedSpend - user.foodBudget) / user.foodBudget) * 100;
        healthScore -= (overshootPercent * 0.6); // 60% weight to projection
    }
    healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));

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
        healthScore,
        activeDays,
        daysInMonth
    };
};

/**
 * Provides granular data for heuristic-based insights and AI prompting
 */
const getDetailedStats = async (userId) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const transactions = await Transaction.find({
        userId,
        date: { $gte: startOfMonth }
    }).sort({ date: -1 });

    if (transactions.length === 0) return null;

    // 1. Merchant Analysis
    const merchantMap = {};
    transactions.forEach(t => {
        merchantMap[t.merchant] = (merchantMap[t.merchant] || 0) + t.amount;
    });

    const topMerchants = Object.entries(merchantMap)
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3);

    // 2. Day of Week Analysis
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayMap = {};
    let weekendSpend = 0;
    let weekdaySpend = 0;

    transactions.forEach(t => {
        const day = days[t.date.getDay()];
        dayMap[day] = (dayMap[day] || 0) + t.amount;
        if (t.date.getDay() === 0 || t.date.getDay() === 6) {
            weekendSpend += t.amount;
        } else {
            weekdaySpend += t.amount;
        }
    });

    const favDay = Object.entries(dayMap).sort((a, b) => b[1] - a[1])[0];

    // 3. Volatility (Standard Deviation of daily spend)
    const dailyMap = {};
    transactions.forEach(t => {
        if (t.date && !isNaN(t.date.getTime())) {
            const dateStr = t.date.toISOString().split('T')[0];
            dailyMap[dateStr] = (dailyMap[dateStr] || 0) + t.amount;
        }
    });

    const dailyAmounts = Object.values(dailyMap);
    const avg = dailyAmounts.reduce((a, b) => a + b, 0) / dailyAmounts.length;
    const squareDiffs = dailyAmounts.map(v => Math.pow(v - avg, 2));
    const volatility = Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length);

    return {
        topMerchants,
        favoriteDay: favDay ? favDay[0] : 'None',
        weekendVsWeekday: {
            weekend: Math.round((weekendSpend / (weekendSpend + weekdaySpend + 1)) * 100),
            weekday: Math.round((weekdaySpend / (weekendSpend + weekdaySpend + 1)) * 100)
        },
        volatility: Math.round(volatility),
        frequency: transactions.length,
        avgTransaction: Math.round(avg)
    };
};

module.exports = { calculateMetrics, getDetailedStats };
