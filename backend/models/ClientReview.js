const mongoose = require('mongoose');

const clientReviewSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    listed: { type: Boolean, default: true }
}, { timestamps: true });

const ClientReview = mongoose.model('ClientReview', clientReviewSchema);

module.exports = ClientReview;
