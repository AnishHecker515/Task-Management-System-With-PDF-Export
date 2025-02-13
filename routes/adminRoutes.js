// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');
// const Admin = require('../models/Admin');
// const Task = require('../models/Task');
// const bcrypt = require('bcryptjs');

// // Admin Dashboard
// router.get('/dashboard', async (req, res) => {
//     const users = await User.find();
//     const tasks = await Task.find();
//     res.render('admin/dashboard', { users, tasks });
// });

// // Delete User
// router.post('/user/delete/:id', async (req, res) => {
//     await User.findByIdAndDelete(req.params.id);
//     res.redirect('/admin/dashboard');
// });

// // Delete Task
// router.post('/task/delete/:id', async (req, res) => {
//     await Task.findByIdAndDelete(req.params.id);
//     res.redirect('/admin/dashboard');
// });

// router.get('/users', async (req, res) => {
//     const users = await User.find();
//     res.render('admin/users', { users });
// });

// // Admin Registration (Manually Register Admin)
// router.get('/register', (req, res) => res.render('admin/register'));
// router.post('/register', async (req, res) => {
//     const { name, email, password } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 10);
//     await new User({ name, email, password: hashedPassword, isAdmin: true }).save();
//     res.redirect('/admin/login');
// });

// // Admin Login
// router.get('/login', (req, res) => res.render('admin/login'));
// router.post('/login', async (req, res) => {
//     const { email, password } = req.body;
//     const admin = await User.findOne({ email, isAdmin: true });

//     if (!admin || !await bcrypt.compare(password, admin.password)) {
//         return res.send('Invalid Credentials');
//     }
//     req.session.admin = admin;
//     res.redirect('/admin/dashboard');
// });

// // Admin Logout
// router.get('/logout', (req, res) => {
//     req.session.destroy();
//     res.redirect('/admin/login');
// });

// // Middleware to Protect Admin Routes
// function isAdmin(req, res, next) {
//     if (!req.session.admin) return res.redirect('/admin/login');
//     next();
// }

// // Admin Dashboard
// router.get('/dashboard', isAdmin, async (req, res) => {
//     const users = await User.find();
//     res.render('admin/dashboard', { users, admin: req.session.admin });
// });

// // Create New User
// router.post('/user/create', isAdmin, async (req, res) => {
//     const { name, email, password } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 10);
//     await new User({ name, email, password: hashedPassword }).save();
//     res.redirect('/admin/dashboard');
// });

// // Update User (Edit)
// router.get('/user/edit/:id', isAdmin, async (req, res) => {
//     const user = await User.findById(req.params.id);
//     res.render('admin/editUser', { user });
// });
// router.post('/user/edit/:id', isAdmin, async (req, res) => {
//     const { name, email } = req.body;
//     await User.findByIdAndUpdate(req.params.id, { name, email });
//     res.redirect('/admin/dashboard');
// });

// // Delete User
// router.post('/user/delete/:id', isAdmin, async (req, res) => {
//     await User.findByIdAndDelete(req.params.id);
//     res.redirect('/admin/dashboard');
// });


// module.exports = router;


const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Admin Registration (Manually Register Admin)
router.get('/register', (req, res) => res.render('admin/register'));
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    // Check if the admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) return res.send("Admin already exists!");

    const newAdmin = new Admin({ name, email, password });
    await newAdmin.save();
    res.redirect('/admin/login');
});

// Admin Login
router.get('/login', (req, res) => res.render('admin/login'));
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin || !await bcrypt.compare(password, admin.password)) {
        return res.send('Invalid Credentials');
    }
    req.session.admin = admin;
    res.redirect('/admin/dashboard');
});

// Admin Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

// Middleware to Protect Admin Routes
function isAdmin(req, res, next) {
    if (!req.session.admin) return res.redirect('/admin/login');
    next();
}

// Admin Dashboard - View Users
router.get('/dashboard', isAdmin, async (req, res) => {
    const users = await User.find();
    res.render('admin/dashboard', { users, admin: req.session.admin });
});

// CRUD Operations for Users
router.post('/user/create', isAdmin, async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await new User({ name, email, password: hashedPassword }).save();
    res.redirect('/admin/dashboard');
});

router.get('/user/edit/:id', isAdmin, async (req, res) => {
    const user = await User.findById(req.params.id);
    res.render('admin/editUser', { user });
});

router.post('/user/edit/:id', isAdmin, async (req, res) => {
    const { name, email } = req.body;
    await User.findByIdAndUpdate(req.params.id, { name, email });
    res.redirect('/admin/dashboard');
});

router.post('/user/delete/:id', isAdmin, async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.redirect('/admin/dashboard');
});

module.exports = router;
