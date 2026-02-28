const Transaction = require('../models/Transaction');

const detectBehaviors = async (userId) => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const transactions = await Transaction.find({
        userId,
        date: { $gte: startOfMonth }
    }).sort({ date: 1 });

    if (transactions.length === 0) {
        return {
            personality: "Cautious Starter",
            insights: "Need more data to detect behaviors."
        };
    }

    let weekendSpend = 0;
    let totalSpend = 0;

    transactions.forEach(t => {
        if (!t.date || isNaN(new Date(t.date).getTime())) return;
        totalSpend += t.amount;
        const day = new Date(t.date).getDay();
        if (day === 0 || day === 5 || day === 6) { // Fri, Sat, Sun
            weekendSpend += t.amount;
        }
    });

    const weekendRatio = totalSpend > 0 ? weekendSpend / totalSpend : 0;

    let personalityLabel = "Steady Spender";
    let featureInsight = "";

    if (weekendRatio > 0.6) {
        personalityLabel = "Weekend Splurger";
        featureInsight = `${Math.round(weekendRatio * 100)}% of your spending occurs on weekends (Fri-Sun).`;
    } else {
        featureInsight = "Your spending is balanced throughout the week.";
    }

    // Advanced: could add streaks, merchant frequency

    return {
        personality: personalityLabel,
        insights: featureInsight
    };
};

module.exports = { detectBehaviors };
