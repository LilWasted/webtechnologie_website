var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const catalogRouter = require("./routes/catalog"); //Import routes for "catalog" area of sit
const homeRouter = require("./routes/home"); //Import routes for "catalog" area of sit
const userRouter = require("./routes/user"); //Import routes for "catalog" area of sit

var app = express();

// Set up mongoose connection
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const SECRET_KEY="mysecretkey"
const mongoDB = "mongodb+srv://radi:radi@cluster0.7nafa.mongodb.net/local_library?retryWrites=true&w=majority&appName=Cluster0";

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

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/catalog", catalogRouter); // Add catalog routes to middleware chain.
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
