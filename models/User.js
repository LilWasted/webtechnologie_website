const mongoose = require("mongoose");

const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;


const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        },
        rating: {
            type: Number,
            default: 0
        },
        events: {
            type: Schema.Types.ObjectId,
            ref: "Event"
        },
        createdAt: {
            type: Date,
            default: Date.now()
        }
    },
    { timestamps: true }
);
// Compare the given password with the hashed password in the database
userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};
// Hash the password before saving it to the database
userSchema.pre('save', async function (next) {
    const user = this;
    if (!user.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(user.password, salt);
        next();
    } catch (error) {
        return next(error);
    }
});



const User = mongoose.model('User', userSchema);

module.exports = User;