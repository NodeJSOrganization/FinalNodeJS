// controllers/usersController.js
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const bcrypt = require('bcryptjs');

// @desc    Lấy tất cả người dùng
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Lỗi server', error: error.message });
    }
};

// @desc    Lấy chi tiết một người dùng
// @route   GET /api/v1/users/:id
// @access  Private/Admin
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, msg: `Không tìm thấy người dùng` });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(400).json({ success: false, msg: 'ID không hợp lệ' });
    }
};

// @desc    Tạo người dùng mới (bởi Admin)
// @route   POST /api/v1/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
    try {
        const { fullName, email, password, address, ...rest } = req.body;

        // Vì address gửi lên từ FormData dưới dạng chuỗi JSON, cần parse nó
        const parsedAddress = address ? JSON.parse(address) : {};

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, msg: 'Email đã tồn tại' });
        }

        user = new User({
            fullName,
            email,
            password,
            address: parsedAddress,
            ...rest
        });
        
        // Xử lý ảnh đại diện nếu có
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, { folder: 'avatars' });
            user.avatar = {
                url: result.secure_url,
                cloudinary_id: result.public_id
            };
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        
        // User do admin tạo có thể được xác thực sẵn
        user.isVerified = true;

        await user.save();
        user.password = undefined;

        res.status(201).json({ success: true, data: user });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, msg: messages.join(', ') });
        }
        res.status(500).json({ success: false, msg: 'Lỗi server', error: error.message });
    }
};

// @desc    Cập nhật người dùng
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
    try {
        let user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, msg: `Không tìm thấy người dùng` });
        }
        
        const updateData = { ...req.body };
        if (updateData.address) {
            updateData.address = JSON.parse(updateData.address);
        }

        // Không cho phép cập nhật mật khẩu qua route này
        delete updateData.password;

        if (req.file) {
            // Xóa ảnh cũ nếu có
            if (user.avatar && user.avatar.cloudinary_id) {
                await cloudinary.uploader.destroy(user.avatar.cloudinary_id);
            }
            // Tải ảnh mới
            const result = await cloudinary.uploader.upload(req.file.path, { folder: 'avatars' });
            updateData.avatar = { url: result.secure_url, cloudinary_id: result.public_id };
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select('-password');
        res.status(200).json({ success: true, data: updatedUser });

    } catch (error) {
        res.status(500).json({ success: false, msg: 'Lỗi server', error: error.message });
    }
};


// @desc    Xóa một người dùng
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, msg: `Không tìm thấy người dùng` });
        }

        // Không cho phép admin tự xóa chính mình
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({ success: false, msg: 'Bạn không thể xóa chính mình.' });
        }

        if (user.avatar && user.avatar.cloudinary_id) {
            await cloudinary.uploader.destroy(user.avatar.cloudinary_id);
        }
        await user.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Lỗi server', error: error.message });
    }
};

// @desc    Xóa tất cả người dùng
// @route   DELETE /api/v1/users
// @access  Private/Admin
exports.deleteAllUsers = async (req, res) => {
    try {
        // Lấy tất cả user TRỪ admin đang đăng nhập
        const usersToDelete = await User.find({ _id: { $ne: req.user.id } });

        const cloudinaryIds = usersToDelete
            .map(u => u.avatar?.cloudinary_id)
            .filter(id => id);

        if (cloudinaryIds.length > 0) {
            // Cloudinary API xóa nhiều ảnh
            await cloudinary.api.delete_resources(cloudinaryIds);
        }
        
        const result = await User.deleteMany({ _id: { $ne: req.user.id } });
        res.status(200).json({ success: true, msg: `Đã xóa thành công ${result.deletedCount} người dùng.` });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Lỗi server', error: error.message });
    }
};

// @desc    Cập nhật thông tin của người dùng đang đăng nhập
// @route   PUT /api/v1/users/updateme
// @access  Private
exports.updateMe = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Tạo một đối tượng để chứa các trường cần cập nhật
        const updateData = {};

        // Chỉ thêm các trường vào updateData nếu chúng tồn tại trong req.body
        // Điều này tránh ghi đè dữ liệu hiện có bằng `undefined`
        if (req.body.fullName !== undefined) updateData.fullName = req.body.fullName;
        if (req.body.phoneNumber !== undefined) updateData.phoneNumber = req.body.phoneNumber;
        if (req.body.gender !== undefined) updateData.gender = req.body.gender;
        if (req.body.dateOfBirth !== undefined) updateData.dateOfBirth = req.body.dateOfBirth;
        // Nếu FE gửi kèm nhiều địa chỉ
        if (req.body.addresses !== undefined) {
            let addresses = req.body.addresses;

            // Nếu đi qua FormData, addresses có thể là chuỗi JSON
            if (typeof addresses === "string") {
                try {
                addresses = JSON.parse(addresses);
                } catch (e) {
                addresses = [];
                }
            }

            if (Array.isArray(addresses)) {
                let foundDefault = false;

                const normalized = addresses.map((addr) => {
                    const isDefault = !!addr.isDefault && !foundDefault;
                    if (isDefault) foundDefault = true;

                    return {
                        fullName: addr.fullName || "",
                        phoneNumber: addr.phoneNumber || "",
                        streetAddress: addr.streetAddress || "",
                        ward: addr.ward || "",
                        district: addr.district || "",
                        province: addr.province || "",
                        isDefault,
                    };
                });

                // Nếu chưa có default thì set cái đầu tiên
                if (!foundDefault && normalized.length > 0) {
                    normalized[0].isDefault = true;
                }

                updateData.addresses = normalized;

                // Optional: sync address đơn (cũ) = địa chỉ mặc định cho backward compatibility
                const def = normalized.find((a) => a.isDefault) || normalized[0];
                if (def) {
                    updateData.address = {
                        province: def.province,
                        district: def.district,
                        ward: def.ward,
                        streetAddress: def.streetAddress,
                    };
                } else {
                    updateData.address = undefined;
                }
            }
        }

        // Xử lý upload avatar nếu có file mới
        if (req.file) {
            // Lấy thông tin user hiện tại để kiểm tra avatar cũ
            const user = await User.findById(userId);

            // Xóa ảnh cũ trên Cloudinary nếu có
            if (user && user.avatar && user.avatar.cloudinary_id) {
                // Không cần await, có thể chạy ngầm để tăng tốc độ phản hồi
                cloudinary.uploader.destroy(user.avatar.cloudinary_id);
            }

            // Tải ảnh mới lên
            const result = await cloudinary.uploader.upload(req.file.path, { 
                folder: 'avatars',
                // Tối ưu hóa ảnh: cắt thành hình vuông 150x150
                transformation: [{ width: 150, height: 150, crop: 'fill', gravity: 'face' }]
            });
            
            updateData.avatar = { 
                url: result.secure_url, 
                cloudinary_id: result.public_id 
            };
        }

        // Cập nhật người dùng trong DB
        // Dùng { $set: updateData } để đảm bảo chỉ cập nhật các trường đã cung cấp
        const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateData }, {
            new: true, // Trả về document đã được cập nhật
            runValidators: true
        }).select('-password'); // Bỏ qua trường password

        if (!updatedUser) {
             return res.status(404).json({ success: false, msg: 'Không tìm thấy người dùng.' });
        }

        res.status(200).json({ success: true, data: updatedUser });

    } catch (error) {
        // Log lỗi chi tiết ra console của backend để bạn có thể xem
        console.error("--- LỖI KHI CẬP NHẬT HỒ SƠ ---");
        console.error("User ID:", req.user?.id);
        console.error("Request Body:", req.body);
        console.error("Request File:", req.file);
        console.error("Error Object:", error);
        console.error("------------------------------");

        res.status(500).json({ success: false, msg: 'Lỗi server', error: error.message });
    }
};