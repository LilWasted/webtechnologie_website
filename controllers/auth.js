const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const asyncHandler = require("express-async-handler");
const {promise} = require("bcrypt/promises");
const SECRET_KEY="mysecretkey"

const verifyToken = (token)=>{
    try {
        const verify = jwt.verify(token,SECRET_KEY);
        console.log(verify);
        if(verify.type==='user'){return true;}
        else{return false;}
    } catch (error) {
        console.log(JSON.stringify(error),"error");
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
        console.log(user);
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
    console.log("logout get");
    res.render("logout", { title: "logout" });
    console.log("logout get 2");
};

exports.logout_post = async (req, res, next) => {
    console.log("logout post");
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

exports.profile = async (req, res, next) => {
    const { token } = req.cookies;
    const verify = jwt.verify(token, SECRET_KEY);
    const user = await User.findOne({ id: verify._id })
        .populate("rating")
        .populate("events")
        .populate("email")
        .populate("username")
        .exec();

    console.log(verify);
    res.render("profile", {
        title: "Profile", user
    });
}


