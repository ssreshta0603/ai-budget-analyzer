const { OpenAI } = require('openai');

let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy_key') {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const generateNudge = async ({ risk, projected, budget, behavior, coachStyle }) => {
    try {
        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy_key') {
            console.log("Using mock LLM response due to missing API key");
            // Mock response if no actual key is provided, so the app still works
            if (risk === 'Critical') return `Whoa there! You're projected to hit ₹${projected}, well over your ₹${budget} budget. Let's pause that spending.`;
            if (risk === 'Warning') return `Careful! You're trending towards ₹${projected} against a budget of ₹${budget}. Watch out for those weekend splurges.`;
            return `You're doing great! On track to finish the month safely under your ₹${budget} budget.`;
        }

        const prompt = `
            You are an AI Budget Coach.
            User's Risk Level: ${risk}
            Projected Month-end Spend: ₹${projected}
            Monthly Budget: ₹${budget}
            User's Spending Behavior: ${behavior}
            Tone/Personality to use: ${coachStyle}
            
            Based on the above, write a short, single-sentence push notification nudge (max 15 words) to the user.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 50,
            temperature: 0.7,
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error("LLM Service Error:", error);
        return "Keep an eye on your spending to stay within budget.";
    }
};

module.exports = { generateNudge };
