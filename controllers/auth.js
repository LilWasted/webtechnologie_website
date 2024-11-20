const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const asyncHandler = require("express-async-handler");
const {promise} = require("bcrypt/promises");
const SECRET_KEY=process.env.SECRET_KEY

const verifyToken = (token)=>{
    try {
        const verify = jwt.verify(token,SECRET_KEY);
        if(verify.type==='user'){return true;}
        else{return false;}
    } catch (error) {
        return false;
    }
}

// Register a new user
exports.register_post = async (req, res, next) => {
    const { username, email, password } = req.body;

    try {
        const user = new User({ username, email, password: password });
        await user.register();
        console.log("user made");
    } catch (error) {
        next(error);
    }
    res.redirect('/user/login'); // Redirect to a different page after successful registration

};

exports.register_get = async (req, res, next) => {

    res.render("register", { title: "Register" });
};

// Login with an existing user
exports.login_post = async (req, res, next) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const passwordMatch = await user.comparePassword(password);
        console.log("Password Match:", passwordMatch);
        if (!passwordMatch) {
            console.log(user);
            return res.status(401).json({ message: 'Incorrect password' });
        }

        const token = jwt.sign({username: username, userId: user._id, type: user.role }, SECRET_KEY, {
            expiresIn: '1 hour'
        });
        res.cookie('token',token,{ maxAge: 3600000, httpOnly: true });  // maxAge: 2 hours
        console.log("saved local token");

    } catch (error) {
        next(error);
    }

    res.redirect('/home');
};

exports.login_get = async (req, res, next) => {
    res.render("login", { title: "Login" });
};

exports.logout_get = async (req, res, next) => {
    res.render("logout", { title: "logout" });
};

exports.logout_post = async (req, res, next) => {
    res.clearCookie('token');
    req.logout((err) => { // Passport.js logout method
        if (err) { return next(err); }
        req.session.regenerate((err) => { // Regenerate session to ensure it's destroyed
            if (err) { return next(err); }
            res.clearCookie('connect.sid'); // Clear session cookie
            res.redirect('/home');
        });
    });
};

async function getUserFromToken(req) {
    const token = req.cookies.token;
    const verify = jwt.verify(token, SECRET_KEY);
    const user = await User.findOne({ id: verify._id }).exec();
    return user;
}

exports.profile = async (req, res, next) => {
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
            .exec();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.render("profile", {
            title: "Profile",
            user: user
        });
    } catch (error) {
        next(error);
    }
};
