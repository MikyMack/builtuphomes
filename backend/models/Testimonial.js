const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    profilePicture: { type: String, required: true },
    description: { type: String, required: true },
    name: { type: String, required: true },
    listed: { type: Boolean, default: true }
}, { timestamps: true });

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

module.exports = Testimonial;
