const mongoose = require("mongoose");
const { DateTime } = require("luxon");


const Schema = mongoose.Schema;

const EventSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date },
    categorie: { type: Schema.Types.ObjectId, ref: "Categorie" , required : true},
});

// Virtual for book's URL
EventSchema.virtual("url").get(function () {
    // We don't use an arrow function as we'll need the this object
    return `/home/events/${this._id}`;
});

// Export model
module.exports = mongoose.model("Event", EventSchema);
