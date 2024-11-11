const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const asyncHandler = require("express-async-handler");
const {promise} = require("bcrypt/promises");
const Event = require("../models/event");
const Categorie = require("../models/categorie");

const SECRET_KEY="mysecretkey"
// Register a new user
const register_post = async (req, res, next) => {
    const { username, email, password } = req.body;

    try {
        const user = new User({ username, email, password: password });
        await user.save();
        console.log("user made");
    } catch (error) {
        next(error);
    }
    res.redirect('/user/login'); // Redirect to a different page after successful registration

};

const register_get = async (req, res, next) => {

    res.render("register", { title: "Register" });
};



// Login with an existing user
const login_post = async (req, res, next) => {
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


        const token = jwt.sign({ userId: user._id }, SECRET_KEY, {
            expiresIn: '1 hour'
        });
        console.log("logged in");
        console.log(token);

    } catch (error) {
        next(error);
    }
};

const login_get = async (req, res, next) => {

    res.render("login", { title: "Login" });
};


module.exports = {login_post, login_get, register_get, register_post};