var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const User = require('./models/User'); // Your Mongoose User schema

var indexRouter = require('./routes/index');

const homeRouter = require("./routes/home"); //Import routes for "catalog" area of sit
const userRouter = require("./routes/user"); //Import routes for "catalog" area of sit

var app = express();

// Set up mongoose connection
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const SECRET_KEY= process.env.SECRET_KEY;
const mongoDB = process.env.DATABASE_URL;

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: SECRET_KEY, // Replace with your own secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

const jwt = require('jsonwebtoken');

app.use(async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const verify = jwt.verify(token, SECRET_KEY);
    const user = await User.findOne({ _id: verify.userId }).exec();
    if (user) {
      console.log('User found:', user);
      res.locals.user = user;

    }
  } catch (err) {
    console.error('Error fetching user:', err);
  }
  next();
});



app.use('/', indexRouter);
app.use("/home", homeRouter); // Add catalog routes to middleware chain.
app.use("/user", userRouter); // Add catalog routes to middleware chain.


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});



// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
