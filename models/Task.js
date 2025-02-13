const mongoose = require('mongoose');
const { image } = require('pdfkit');

const TaskSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: String,
    description: String,
    dueDate: Date,
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
    image: String
});

module.exports = mongoose.model('Task', TaskSchema);
