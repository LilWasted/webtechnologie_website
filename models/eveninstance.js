const mongoose = require("mongoose");
const { DateTime } = require("luxon");


const Schema = mongoose.Schema;

const EventInstanceSchema = new Schema({
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true }, // reference to the associated event
    status: {
        type: String,
        required: true,
        enum: ["Available", "Full", "Cancelled"],
        default: "Available",
    },
});

// Virtual for eventinstance's URL
EventInstanceSchema.virtual("url").get(function () {
    // We don't use an arrow function as we'll need the this object
    return `/home/eventinstances/${this._id}`;
});

// Export model
module.exports = mongoose.model("EventInstance", EventInstanceSchema);
