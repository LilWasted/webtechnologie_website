const mongoose = require("mongoose");


const Schema = mongoose.Schema;

const EventSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true, min: Date.now},
    categorie: { type: Schema.Types.ObjectId, ref: "Categorie" , required : true}, //game
    participants:{type: [Schema.Types.ObjectId], ref: "User"},
    blacklist:{type: [Schema.Types.ObjectId], ref: "User"},
    max_size: {type:Number,min:2,max:40},
    platform:{type:String,enum: ["PC","PS","xbox","switch"]},
    organizer: {type:Schema.Types.ObjectId, ref: "User"},
    time_created:{type:Date,default:Date.now}
});

// Virtual for book's URL
EventSchema.virtual("url").get(function () {
    // We don't use an arrow function as we'll need the this object
    return `/home/events/${this._id}`;
});

// Export model
module.exports = mongoose.model("Event", EventSchema);
