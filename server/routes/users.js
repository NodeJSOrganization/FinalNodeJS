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

// Tất cả route dưới đây yêu cầu đăng nhập
router.use(protect);

// DÀNH CHO USER THƯỜNG
router.put('/updateme', upload.single('avatar'), updateMe);

// (optional) Lấy thông tin của chính mình
router.get('/me', (req, res) => {
  const user = req.user.toObject();
  delete user.password;
  res.status(200).json({ success: true, data: user });
});

// TỪ ĐÂY TRỞ XUỐNG CHỈ ADMIN
router.use(authorize('admin'));

router.route('/')
  .get(getUsers)
  .post(upload.single('avatar'), createUser)
  .delete(deleteAllUsers);

router.route('/:id')
  .get(getUser)
  .put(upload.single('avatar'), updateUser)
  .delete(deleteUser);

module.exports = router;
