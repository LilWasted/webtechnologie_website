const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); // Your Mongoose User schema


passport.use(
    new GoogleStrategy(
        {
            clientID: '469813584564-gb3uldleaolrm3u6ndmg6hceslb8dqhs.apps.googleusercontent.com', // Add these to your .env file
            clientSecret: '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',
            callbackURL: 'http://localhost:3000/user/auth/google/callback'
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user exists in your database
                let user = await User.findOne({ googleId: profile.id });

                if (!user) {
                    // Save new user if they don't already exist
                    user = new User({
                        googleId: profile.id,
                        email: profile.emails[0].value,
                        username: profile.displayName,
                    });
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
