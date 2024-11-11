const express = require('express');
const router = express.Router();

const { authenticate } = require('../middlewares/auth');

const { register_get, register_post, login_get, login_post} = require('../controllers/auth');
const authController = require("../controllers/auth");

router.get('/profile', authenticate, (req, res) => {
    res.json({ message: `Welcome ${req.user.username}` });
});

router.post('/register', register_post);
router.get('/register', register_get);

router.post('/login', login_post);
router.get('/login', login_get);

module.exports = router;