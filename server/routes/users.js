// routes/users.js
const express = require('express');
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    deleteAllUsers,
    updateMe
} = require('../controllers/usersController');

const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Áp dụng middleware cho tất cả các route bên dưới
router.use(protect, authorize('admin'));

router.route('/')
    .get(getUsers)
    .post(upload.single('avatar'), createUser)
    .delete(deleteAllUsers);

router.route('/:id')
    .get(getUser)
    .put(upload.single('avatar'), updateUser, updateMe)
    .delete(deleteUser);

module.exports = router;