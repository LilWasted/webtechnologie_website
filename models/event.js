const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const EventSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, min: Date.now},
    game: { type: Schema.Types.ObjectId, ref: "game" , required : true}, //game
    participants:[{ type: Schema.Types.ObjectId, ref: 'User' }],
    blacklist:[{type: Schema.Types.ObjectId, ref: "User"}],
    max_size: {type:Number,min:1,max:40, default: 6},
    platform:{type:String,enum: ["PC","PS","xbox","switch"], required:true},
    organizer: {type:Schema.Types.ObjectId, ref: "User"},
    status: {type: String, enum: ["Available", "Full", "Cancelled"], default: "Available"},
    reminderSent: {type: Boolean, default: false},
    time_created:{type:Date,default:Date.now}},
    { timestamps: true }
);

// Virtual for book's URL
EventSchema.virtual("url").get(function () {
    // We don't use an arrow function as we'll need the this object
    return `/home/events/${this._id}`;
});

EventSchema.virtual("groupRating").get(function () {
  let som = 0;
  for (let i = 0; i < this.participants.length; i++) {
    som += this.participants[i].rating;
  }
  return this.participants.length > 0 ? som / this.participants.length : 0;
});

// Export model
module.exports = mongoose.model("Event", EventSchema);
