const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    merchant: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true, default: 'Food' },
    date: { type: Date, required: true, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
