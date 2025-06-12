const userService = require('./user.service');

exports.register = async (req, res) => {
    try {
        const user = await userService.register(req.body);
        res.status(201).json({ message: 'Đăng ký thành công', user });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    console.log('🔥 req.body:', req.body); // log ra để kiểm tra

    try {
        const { token, user } = await userService.login(req.body);
        res.status(200).json({ message: 'Đăng nhập thành công', token, user });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await userService.getProfile(req.user._id);
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const updatedUser = await userService.updateProfile(req.user._id, req.body);
        res.json({ message: 'Cập nhật thành công', user: updatedUser });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteProfile = async (req, res) => {
    try {
        await userService.deleteProfile(req.user._id);
        res.json({ message: 'Tài khoản đã bị xóa' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
