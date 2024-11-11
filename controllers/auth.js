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

const login_get = async (req, res, next) => {

    res.render("login", { title: "Login" });
};

const profile_get = async (req, res, next) => {
    const {token}=req.cookies;
    if(verifyToken(token)){
        return res.redirect('/home');
    }else{
        res.redirect('/user/login')
    }
}

module.exports = {login_post, login_get, register_get, register_post, profile_get};