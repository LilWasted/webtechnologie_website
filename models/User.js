const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;
const fs = require('fs');
const path = require('path');



const userSchema = new mongoose.Schema({
        googleId: { type: String, required: false, unique: true},
        username:{type: String, required: true, unique: true},
        email: {type: String,required: true, unique: true},
        password:{type: String, required: function() {
                return !this.googleId; // Password is required if googleId is not present
            }},
        role: {type: String, enum: ['user', 'admin'], default: 'user'},
        rating: {type: Number, default: 0},
        events: [{type: Schema.Types.ObjectId, ref: "Event"}],
        profilePicture: { type: Buffer, required: false},
        createdAt: {type: Date, default: Date.now()}},
    { timestamps: true }
);

userSchema.methods.register = async function () {
     this.save();
};


// Compare the given password with the hashed password in the database
userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

// Hash the password before saving it to the database
userSchema.pre('register', async function (next) {
    const user = this;
    if (!user.isModified('password')) return next();

    if (!user.profilePicture) {
        const defaultImagePath = path.join(__dirname, '../public/images/default.png');
        user.profilePicture = fs.readFileSync(defaultImagePath);
    }


    try {
        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(user.password, salt);
        next();
    } catch (error) {
        return next(error);
    }
});

module.exports = mongoose.model('User', userSchema);
