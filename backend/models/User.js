const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    monthlyIncome: { type: Number, default: 0 },
    savingsGoalPercent: { type: Number, default: 0 },
    foodBudget: { type: Number, default: 0 },
    alertThreshold: { type: Number, default: 80 },
    coachStyle: { type: String, enum: ['Friendly', 'Balanced', 'Strict', 'Sarcastic'], default: 'Balanced' },
    onboardingComplete: { type: Boolean, default: false },
    nudgeHistory: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
