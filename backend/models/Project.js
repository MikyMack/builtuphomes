const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: String, required: true },
    images: [{ type: String, required: true }], 
    listed: { type: Boolean, default: true }  
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
