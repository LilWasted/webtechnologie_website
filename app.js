const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const passport = require('passport');
const session = require('express-session');
const User = require('./models/User'); // Your Mongoose User schema
const Event = require('./models/event');
const cron = require('node-cron');
const { sendEventReminder } = require('./controllers/mailController');
const compression = require("compression");

//schedule a cron job to at the start of every hour
cron.schedule('0 * * * *', async () => {
  try {
    const events = await Event.find({
      //2 uur from now and only if reminderSent is false
      date: { $gte: new Date(), $lt: new Date(Date.now() + 7200000) },
      reminderSent: false
    }).exec();

    for (const event of events) {
      await sendEventReminder(event._id);
      event.reminderSent = true;
      await event.save();
    }

  } catch (error) {
    console.error('Error in cron job:', error);
  }

  try {
    const events = await Event.find({
      date: { $lt: new Date(Date.now() - (2 * 3600000)) },
    }).populate("participants").exec();

    for (const event of events) {
      for (const participant of event.participants) {
        //events verwijderen van user => user.events array updaten
        //pull = remove from array in mongoDB
        //geen user.save() nodig omdat updateOne al save doet
        await User.updateOne(
            { _id: participant._id },
            { $pull: { events: event._id } }
        );
      }
      await Event.findByIdAndDelete(event._id);
    }



  } catch (error) {
    console.error('Error in cron job:', error);
  }

});

const indexRouter = require('./routes/index');

const homeRouter = require("./routes/home"); //Import routes for "catalog" area of sit
const userRouter = require("./routes/user"); //Import routes for "catalog" area of sit

const app = express()
// Set up rate limiter: maximum of sixty requests per minute
const RateLimit = require("express-rate-limit");
const limiter = RateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60 // 60 requests,
});
// Apply rate limiter to all requests
app.use(limiter);

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
app.use(compression()); // Compress all routes

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
  const token = req.cookies.token;
  if (!token) {
    return next();
  }
  try {
    const verify = jwt.verify(token, SECRET_KEY);
    const user = await User.findOne({ _id: verify.userId }).exec();
    if (user) {
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
