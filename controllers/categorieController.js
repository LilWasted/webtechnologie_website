const Categorie = require("../models/categorie");
const asyncHandler = require("express-async-handler");
const Event = require("../models/event");
const { body, validationResult } = require("express-validator");



// Display list of all Categorie.
exports.categorie_list = asyncHandler(async (req, res, next) => {
    const allCategories = await Categorie.find().sort({name : 1}).exec();

    res.render("categorie_list", { title: "Categorie List", categorie_list: allCategories });
});


// Display detail page for a specific Categorie.
exports.categorie_detail = asyncHandler(async (req, res, next) => {
    // Get details of categorie and all associated events (in parallel)
    const [categorie, openEvents] = await Promise.all([
        Categorie.findById(req.params.id).exec(),
        Event.find({ categorie: req.params.id, status: "Available" }, "title summary")
            .populate("participants")
            .populate("max_size")
            .sort({ title: 1 })
            .exec(),
    ]);

    if (categorie === null) {
        // No results.
        const err = new Error("Categorie not found");
        err.status = 404;
        return next(err);
    }

    res.render("categorie_detail", {
        title: "Categorie Detail",
        categorie: categorie,
        categorie_events: openEvents,
    });
});