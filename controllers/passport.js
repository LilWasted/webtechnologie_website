const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); // Your Mongoose User schema


passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: 'https://gamerden.onrender.com/user/auth/google/callback'
        },
        async (req, accessToken, refreshToken, profile, done) => {
            try {
                // Check if user exists in your database
                let user = await User.findOne({ googleId: profile.id });

                if (!user) {
                    usermail = await User.findOne({ email: profile.emails[0].value });
                    if (usermail) {
                        return req.res.render('login', { title: 'Login', error: 'Email already exists' });
                        // If user is found by email, add Google ID to their profile
                    }

                    user_findName = await User.findOne({ username: profile.displayName });
                    let counter = 1;
                    if (user_findName) {
                        user = new User({
                            googleId: profile.id,
                            email: profile.emails[0].value,
                            username: `${profile.displayName}${counter}`,
                        });
                        counter++;
                        // If user is found by email, add Google ID to their profile
                    } else {
                        user = new User({
                            googleId: profile.id,
                            email: profile.emails[0].value,
                            username: profile.displayName,
                        });
                    }
                    // Save new user if they don't already exist
                    await user.save();
                }

                done(null, user); // Pass user data to Passport
            } catch (err) {
                done(err, null);
            }
        }
    )
);

// Serialize and deserialize user for session
passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;
