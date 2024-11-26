const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const asyncHandler = require("express-async-handler");
const SECRET_KEY=process.env.SECRET_KEY
const multer = require('multer');
const Event = require("../models/event");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Register a new user
exports.register_post = asyncHandler( async (req, res, next) => {
    const { username, email, password } = req.body;

    try {
        const user = new User({ username, email, password: password });
        await user.register();
        console.log("user made");
    } catch (error) {
        next(error);
    }
    res.redirect('/user/login'); // Redirect to a different page after successful registration

});

exports.register_get = async (req, res) => {

    res.render("register", { title: "Register" });
};

// Login with an existing user
exports.login_post = asyncHandler ( async (req, res, next) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const passwordMatch = await user.comparePassword(password);
        console.log("Password Match:", passwordMatch);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        const token = jwt.sign({username: username, userId: user._id, type: user.role }, SECRET_KEY, {
            expiresIn: '1 hour'
        });
        res.cookie('token',token,{ httpOnly: true });  // maxAge: 2 hours
        console.log("saved local token");

    } catch (error) {
        next(error);
    }

    res.redirect('/home');
});

exports.login_get = asyncHandler ( async (req, res) => {
    res.render("login", { title: "Login" });
});

exports.logout_get = asyncHandler ( async (req, res) => {
    res.render("logout", { title: "logout" });
});

exports.logout_post = asyncHandler ( async (req, res, next) => {
    res.clearCookie('token');
    req.logout((err) => { // Passport.js logout method
        if (err) { return next(err); }
        req.session.regenerate((err) => { // Regenerate session to ensure it's destroyed
            if (err) { return next(err); }
            res.redirect('/home');
        });
    });
});

exports.profile = asyncHandler ( async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const verify = jwt.verify(token, SECRET_KEY);
        const user = await User.findOne({ _id: verify.userId })
            .populate("rating")
            .populate("events")
            .populate("email")
            .populate("username")
            .populate("profilePicture")
            .exec();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const numEvents = await Event.countDocuments({ _id: { $in: user.events } }).exec();

        res.render("profile", {
            title: "Profile",
            user: user,
            numEvents : numEvents
        });
    } catch (error) {
        next(error);
    }
});


exports.edit_profile_get = asyncHandler ( async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            console.log("No token provided");
            return res.status(401).json({ message: 'No token provided' });
        }
        const verify = jwt.verify(token, SECRET_KEY);
        const user = await User.findOne({ _id: verify.userId });


        console.log("edit");
        res.render("edit_profile", {
            title: "Edit Profile",
            user: user,
        });

        console.log("edit done");

    } catch (error) {
        next(error);
        res.redirect('/user/profile');
    }
});

exports.edit_profile_post = [
    upload.single('profilePicture'),
    asyncHandler (async (req, res, next) => {
        const { username, email, password } = req.body;
        const profilePicture = req.file ? req.file.buffer : null;

        try {
            const token = req.cookies.token;
            if (!token) {
                return res.status(401).json({ message: 'No token provided' });
            }
            const verify = jwt.verify(token, SECRET_KEY);
            const user = await User.findOne({ _id: verify.userId });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (username) user.username = username;
            if (email) user.email = email;
            if (password) {
                const salt = await bcrypt.genSalt();
                user.password = await bcrypt.hash(password, salt);
            }
            if (profilePicture) {
                user.profilePicture = profilePicture;
            }

            await user.save();
            console.log("User profile updated");
            res.redirect('/user/profile');
        } catch (error) {
            next(error);
            res.redirect('/user/profile');

        }
    })
];
