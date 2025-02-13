const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Task = require('../models/Task');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const PDFDocument = require('pdfkit');
const multer = require('multer');
const path = require('path');

const SECRET_KEY = "mysecretkey";  // Not using .env file

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/'); // Store images in public/uploads
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({ storage: storage });

// Add a New Task with Image Upload
router.post('/task/add', upload.single('image'), async (req, res) => {
    const { title, description, dueDate } = req.body;
    const image = req.file ? req.file.filename : null; // Check if an image was uploaded

    await new Task({
        userId: req.session.user._id,
        title,
        description,
        dueDate,
        image
    }).save();

    res.redirect('/user/dashboard');
});

// Serve uploaded images
router.use('/uploads', express.static('public/uploads'));

// Register User
router.get('/register', (req, res) => res.render('user/register'));
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    await new User({ name, email, password }).save();
    res.redirect('/user/login');
});

// Login User
router.get('/login', (req, res) => res.render('user/login'));
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) return res.send('Invalid Credentials');
    req.session.user = user;
    res.redirect('/user/dashboard');
});

// User Dashboard
router.get('/dashboard', async (req, res) => {
    if (!req.session.user) return res.redirect('/user/login');
    const tasks = await Task.find({ userId: req.session.user._id });
    res.render('user/dashboard', { user: req.session.user, tasks });
});

// CRUD for Tasks
router.post('/task/add', async (req, res) => {
    const { title, description, dueDate } = req.body;
    await new Task({ userId: req.session.user._id, title, description, dueDate }).save();
    res.redirect('/user/dashboard');
});
router.post('/task/delete/:id', async (req, res) => {
    await Task.findByIdAndDelete(req.params.id);
    res.redirect('/user/dashboard');
});

// PDF Export
router.get('/tasks/pdf', async (req, res) => {
    const tasks = await Task.find({ userId: req.session.user._id });
    const doc = new PDFDocument();
    res.setHeader('Content-Disposition', 'attachment; filename="tasks.pdf"');
    doc.pipe(res);
    tasks.forEach(task => doc.text(`${task.title}: ${task.description} (${task.status})`));
    doc.end();
});

router.get('/tasks', async (req, res) => {
    if (!req.session.user) return res.redirect('/user/login');
    const tasks = await Task.find({ userId: req.session.user._id });
    res.render('user/tasks', { user: req.session.user, tasks });
});

// User Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});


module.exports = router;
