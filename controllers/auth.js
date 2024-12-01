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
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.render('register', { title: 'Register', error: 'Username or email already exists' });
        }
        const user = new User({ username, email, password: password });
        await user.register();
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
            return res.render('login', { title: 'Login', error: 'User not found, try again' });
        }

        const passwordMatch = await user.comparePassword(password);
        if (!passwordMatch) {
            return res.render('login', { title: 'Login', error: 'Incorrect password, try again' });
        }

        const token = jwt.sign({username: username, userId: user._id, type: user.role }, SECRET_KEY, {
            expiresIn: '1 hour'
        });
        res.cookie('token',token,{ httpOnly: true });  // maxAge: 2 hours
        res.redirect('/home');
    } catch (error) {
        next(error);
    }
});

exports.login_get = asyncHandler ( async (req, res) => {
    const error = req.flash('error');
    res.render("login", { title: "Login", error: error });
    //res.render("login", { title: "Login" });
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
        let visitor = false;

        if (!res.locals.user._id.equals(req.params.id)) {
            visitor = true;
        }
        const user = await User.findById(req.params.id)
            .populate("events")
            .populate("email")
            .populate("username")
            .populate("profilePicture")
            .exec();

        if (!user) {
            return res.redirect('/home');
        }

        const numEvents = await Event.countDocuments({ _id: { $in: user.events } }).exec();

        res.render("profile", {
            title: "Profile",
            user: user,
            numEvents : numEvents,
            visitor : visitor
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
            return res.redirect('/home');
        }
        const verify = jwt.verify(token, SECRET_KEY);
        const user = await User.findOne({ _id: verify.userId });

        const isGoogleAccount = await !!user.googleId;


        res.render("edit_profile", {
            title: "Edit Profile",
            user: user,
            isGoogleAccount: isGoogleAccount,
        });

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
                return res.redirect('/home');

            }
            const verify = jwt.verify(token, SECRET_KEY);
            const user = await User.findOne({ _id: verify.userId });
            if (!user) {
                return res.redirect('/home');
            }

            if (username) {
                console.log("username: " + username);
                const existingUser = await User.findOne({ username : username });
                if (existingUser && !existingUser._id.equals(user._id)) {
                    return res.render('edit_profile', { title: 'Edit Profile', error: 'Username already exists' });
                }
                user.username = username;
            }
            if (email) {
                const existingUser = await User.findOne({email: email });
                if (existingUser && !existingUser._id.equals(user._id)) {
                    return res.render('edit_profile', { title: 'Edit Profile', error: 'Username already exists' });
                }
                user.email = email;

            }
            if (password) {
                const salt = await bcrypt.genSalt();
                user.password = await bcrypt.hash(password, salt);
            }
            if (profilePicture) {
                user.profilePicture = profilePicture;
            }

            await user.save();
            res.redirect('/user/profile/' + user._id);
        } catch (error) {
            next(error);
            res.redirect('/user/profile');

        }
    })
];
