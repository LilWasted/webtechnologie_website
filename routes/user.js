const express = require('express');
const router = express.Router();
const userController = require('../controllers/auth');
const passport = require('../controllers/passport'); // Load Passport configuration
const SECRET_KEY="mysecretkey"
const jwt = require('jsonwebtoken');
const User = require("../models/User"); // Import jsonwebtoken

router.post('/register', userController.register_post);
router.get('/register', userController.register_get);

router.post('/login', userController.login_post);
router.get('/login', userController.login_get);

router.get('/logout', userController.logout_get);
router.post('/logout', userController.logout_post);

router.get('/profile', userController.profile);

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Handle Google callback
router.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/user/login' }),
    async (req, res) => {
        // Generate a JWT for the user
        await res.clearCookie('token');
        const token = jwt.sign({username: req.user.username, userId: req.user.id, type: req.user.role }, SECRET_KEY, {
            expiresIn: '1 hour'
        });
        //const token = jwt.sign({ id: req.user.id }, SECRET_KEY , { expiresIn: '1h' });

        console.log(req.user.id);
        // Set token as a third-party cookie
        await res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });

        const verify = jwt.verify(token, SECRET_KEY);

        const usertest = await User.findOne({ _id: verify.userId }).exec();


        res.redirect('/home');

    }
);

module.exports = router;