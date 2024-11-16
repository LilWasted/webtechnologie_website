const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CategorieSchema = new Schema(
    {name : { type: String, min: 1, max: 100, required: true },});

// Virtual for book's URL
CategorieSchema.virtual("url").get(function () {
    // We don't use an arrow function as we'll need the this object
    return `/home/categories/${this._id}`;
});

// Export models
module.exports = mongoose.model("Categorie", CategorieSchema);

