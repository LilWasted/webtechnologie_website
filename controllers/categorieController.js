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
    const [categorie, eventsInCategorie] = await Promise.all([
        Categorie.findById(req.params.id).exec(),
        Event.find({ categorie: req.params.id }, "title summary").exec(),
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
        categorie_events: eventsInCategorie,
    });
});

/* 
// Display Categorie create form on GET.
exports.categorie_create_get = (req, res, next) => {
    res.render("categorie_form", { title: "Create Categorie" });
};


// Handle Categorie create on POST.
exports.categorie_create_post = [
    // Validate and sanitize the name field.
    body("name", "Categorie name must contain at least 3 characters")
        .trim()
        .isLength({ min: 3 })
        .escape(),

    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a categorie object with escaped and trimmed data.
        const categorie = new Categorie({ name: req.body.name });

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render("categorie_form", {
                title: "Create Categorie",
                categorie: categorie,
                errors: errors.array(),
            });
            return;
        } else {
            // Data from form is valid.
            // Check if Categorie with same name already exists.
            const categorieExists = await Categorie.findOne({ name: req.body.name })
                .collation({ locale: "en", strength: 2 })
                .exec();
            if (categorieExists) {
                // Categorie exists, redirect to its detail page.
                res.redirect(categorieExists.url);
            } else {
                await categorie.save();
                // New categorie saved. Redirect to categorie detail page.
                res.redirect(categorie.url);
            }
        }
    }),
];


// Display Categorie delete form on GET.
exports.categorie_delete_get = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Categorie delete GET");
});

// Handle Categorie delete on POST.
exports.categorie_delete_post = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Categorie delete POST");
});

// Display Categorie update form on GET.
exports.categorie_update_get = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Categorie update GET");
});

// Handle Categorie update on POST.
exports.categorie_update_post = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Categorie update POST");
});


 */