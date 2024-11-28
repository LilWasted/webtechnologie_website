const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GameSchema = new Schema({
    name : { type: String, min: 1, max: 100, required: true },
    YTlink : { type: String, max: 100, default: ""}
});

// Virtual for book's URL
GameSchema.virtual("url").get(function () {
    // We don't use an arrow function as we'll need this object
    return `/home/games/${this._id}`;
});

// Export models
module.exports = mongoose.model("game", GameSchema);

