const authService = require('../services/auth.service');

async function register(req, res, next) {
  try {
    const { email, password, fullName, role } = req.body;
    const result = await authService.registerUser({ email, password, fullName, role });
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

async function getMe(req, res, next) {
  try {
    const user = authService.getUserProfile(req.user.id);
    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getMe
};
