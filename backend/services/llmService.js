const OpenAI = require('openai');

const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

/**
 * Generates a nudge using either OpenAI or a heuristic fallback.
 */
exports.generateNudge = async ({ risk, projected, budget, behavior, coachStyle, stats, history = [] }) => {
    // 1. If OpenAI is available, get a creative/funny nudge
    if (openai) {
        try {
            const prompt = `
                You are a ${coachStyle} AI Budget Coach.
                Current Stats:
                - Food Budget Status: ${risk}
                - Projected Spend: ₹${projected}
                - Budget Limit: ₹${budget}
                - Top Merchant: ${stats?.topMerchants?.[0]?.name || 'N/A'}
                - Favorite Day to spend: ${stats?.favoriteDay || 'N/A'}

                Provide a 1-sentence nudge. 
                If Sarcastic, be funny and bitey. 
                If Strict, be a drill sergeant.
                Avoid repeating these previous nudges: ${(history || []).join(', ')}
            `;

            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.8,
                max_tokens: 60
            });

            return completion.choices[0].message.content.trim();
        } catch (error) {
            console.error('OpenAI Error, falling back to heuristic:', error.message);
        }
    }

    // 2. Heuristic Fallback (Always works, personalized to data & style)
    const topM = stats?.topMerchants?.[0]?.name || 'Dining';

    const perc = (projected && budget && budget > 0) ? Math.round((projected / budget) * 100) : 'a high';
    const room = (budget && projected) ? (budget - projected).toLocaleString() : '0';

    const fallbacks = {
        'Sarcastic': {
            'Critical': `Oh look, a high roller! You're hitting ₹${projected}. ${topM} works for you now?`,
            'Warning': `Careful, moneybags. You're at ${perc}%. Maybe skip ${topM}?`,
            'Safe': `Wow, you actually have money left. I'm shocked. Enjoy the ₹${room} room.`
        },
        'Strict': {
            'Critical': `STOP. Projected spend: ₹${projected}. Delete the ${topM} app immediately.`,
            'Warning': `ALERT: ${perc}% budget used. No more ${topM} this month.`,
            'Safe': `Budget maintained. You have ₹${room} remaining. Do not waste it.`
        },
        'Friendly': {
            'Critical': `Hanging in there? You might hit ₹${projected}. Let's try to pass on ${topM} today.`,
            'Warning': `Just a heads up, you've used ${perc}% of your food budget.`,
            'Safe': `You're doing great! Still plenty of room left in your ₹${budget} budget.`
        },
        'Balanced': {
            'Critical': `Heads up: You're projected for ₹${projected}. ${topM} is your biggest expense.`,
            'Warning': `You're at ${perc}% of your budget. Watch those ${topM} trips.`,
            'Safe': `Everything looks stable. You have ₹${room} left for the month.`
        }
    };

    const style = fallbacks[coachStyle] || fallbacks['Balanced'];
    return style[risk] || style['Safe'];
};

/**
 * Generates detailed behavioral insights.
 */
exports.generateDetailedInsights = async (metrics, stats, coachStyle) => {
    const hasKey = !!openai;

    // Heuristic base data
    const topM = stats?.topMerchants?.[0]?.name || 'Unknown';
    const favDay = stats?.favoriteDay || 'various days';

    let habit = `You have visited ${topM} the most this month.`;
    let volatility = `Your spending is ${stats?.volatility > 1000 ? 'highly volatile' : 'fairly stable'} day-to-day.`;
    let tip = `Try to reduce spending on ${favDay}s to stay under budget.`;

    if (hasKey) {
        try {
            const prompt = `
                Analyze these financial stats and provide 3 SHORT insights:
                - Top Merchant: ${topM} (Spend: ₹${stats?.topMerchants?.[0]?.amount || 0})
                - Favorite Day: ${favDay}
                - Volatility: ${stats?.volatility}
                - Monthly Risk: ${metrics.severity}
                - Style: ${coachStyle}

                Return JSON: { "habit": "...", "volatility": "...", "tip": "..." }
                Make them funny or personality-driven based on the style.
            `;

            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" }
            });

            const aiData = JSON.parse(completion.choices[0].message.content);
            return {
                habitInsight: aiData.habit,
                volatilityInsight: aiData.volatility,
                actionableTip: aiData.tip
            };
        } catch (error) {
            console.error('LLM Insight Error:', error.message);
        }
    }

    // Return personality-driven heuristic insights if AI fails or key is missing
    const insightFallbacks = {
        'Sarcastic': {
            habit: `You and ${topM} are basically soulmates at this point.`,
            volatility: `Your spending is as stable as a caffeinated squirrel.`,
            tip: `Try ignoring ${favDay} sales. Your bank account will thank me.`
        },
        'Strict': {
            habit: `${topM} is your primary financial leak. Plug it.`,
            volatility: `Spending variance is ${stats?.volatility > 1000 ? 'OUT OF CONTROL' : 'ACCEPTABLE'}.`,
            tip: `Absolute zero spending required on ${favDay}s.`
        },
        'Friendly': {
            habit: `It looks like you really enjoy ${topM}!`,
            volatility: `Your spending has been ${stats?.volatility > 1000 ? 'a bit jumpy' : 'nice and steady'}.`,
            tip: `Maybe try a "No Spend ${favDay}" to save extra?`
        },
        'Balanced': {
            habit: `You've visited ${topM} more than any other merchant.`,
            volatility: `Daily spending shows ${stats?.volatility > 1000 ? 'high' : 'normal'} volatility.`,
            tip: `Keep an eye on ${favDay} spending trends.`
        }
    };

    const styleInsights = insightFallbacks[coachStyle] || insightFallbacks['Balanced'];
    return {
        habitInsight: styleInsights.habit,
        volatilityInsight: styleInsights.volatility,
        actionableTip: styleInsights.tip
    };
};
