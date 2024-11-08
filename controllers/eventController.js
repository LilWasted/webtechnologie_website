const Event = require("../models/event");
const Categorie = require("../models/categorie");
const EventInstance = require("../models/eveninstance");
const { body, validationResult } = require("express-validator");
const { DateTime } = require("luxon");


const asyncHandler = require("express-async-handler");
const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");

exports.index = asyncHandler(async (req, res, next) => {
    // Get details of events, event instances, authors and genre counts (in parallel)
    const [
        numEvents,
        numEventInstances,
        numAvailableEventInstances,
    ] = await Promise.all([
        Event.countDocuments({}).exec(),
        EventInstance.countDocuments({}).exec(),
        EventInstance.countDocuments({ status: "Available" }).exec(),
    ]);

    res.render("index", {
        title: "Event Home",
        numEvents: numEvents,
        numEventInstances: numEventInstances,
        numAvailableEventInstances: numAvailableEventInstances,
    });
});

// Display list of all events.
exports.event_list = asyncHandler(async (req, res, next) => {
    const allEvents = await Event.find({}, "title categorie")
        .sort({ date: 1 })
        .populate("categorie")
        .exec();

    res.render("event_list", { title: "Event List", event_list: allEvents });
});


// Display detail page for a specific event.
exports.event_detail = asyncHandler(async (req, res, next) => {
    // Get details of events, event instances for specific event
    const [event, eventInstances] = await Promise.all([
        Event.findById(req.params.id).populate("categorie").exec(),
        EventInstance.find({ event: req.params.id }).exec(),
    ]);

    if (event === null) {
        // No results.
        const err = new Error("Event not found");
        err.status = 404;
        return next(err);
    }

    res.render("event_detail", {
        title: event.title,
        event: event,
        event_instances: eventInstances,
    });
});



// Display event create form on GET.
exports.event_create_get = asyncHandler(async (req, res, next) => {
    // Get all authors and genres, which we can use for adding to our event.
    const [event, categories] = await Promise.all([
        Event.findById(req.params.id).populate("categorie").exec(),
        Categorie.find({ event: req.params.id }).exec(),
    ]);


    res.render("event_form", {
        title: "Create Event",
        categories: categories,
    });
});


// Handle event create on POST.
exports.event_create_post = [
    // Convert the genre to an array.
    (req, res, next) => {
        if (!Array.isArray(req.body.genre)) {
            req.body.genre =
                typeof req.body.genre === "undefined" ? [] : [req.body.genre];
        }
        next();
    },

    // Validate and sanitize fields.
    body("title", "Title must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("description", "Summary must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("date", "Invalid date")
        .optional({ values: "falsy" })
        .isISO8601()
        .toDate(),
    body("categorie")
        .escape(),
    // Process request after validation and sanitization.

    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Event object with escaped and trimmed data.
        const event = new Event({
            title: req.body.title,
            description: req.body.description,
            categorie: req.body.categorie,

        });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            const allCategorie = await Promise(
                Categorie.find().sort({ name: 1 }).exec(),
            );

            // Mark our selected genres as checked.
            for (const categorie of allCategorie) {
                if (event.categorie.includes(categorie._id)) {
                    categorie.checked = "true";
                }
            }
            res.render("event_form", {
                title: "Create Event",
                categories: categories,
                event: event,
                errors: errors.array(),
            });
        } else {
            // Data from form is valid. Save event.
            await event.save();
            res.redirect(event.url);
        }
    }),
];



// Display event delete form on GET.
exports.event_delete_get = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Event delete GET");
});

// Handle event delete on POST.
exports.event_delete_post = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Event delete POST");
});

/*

// Display event update form on GET.
exports.event_update_get = asyncHandler(async (req, res, next) => {
    // Get event, authors and genres for form.
    const [event, allAuthors, allGenres] = await Promise.all([
        Event.findById(req.params.id).populate("author").exec(),
        Author.find().sort({ family_name: 1 }).exec(),
        Genre.find().sort({ name: 1 }).exec(),
    ]);

    if (event === null) {
        // No results.
        const err = new Error("Event not found");
        err.status = 404;
        return next(err);
    }

    // Mark our selected genres as checked.
    allGenres.forEach((genre) => {
        if (event.genre.includes(genre._id)) genre.checked = "true";
    });

    res.render("event_form", {
        title: "Update Event",
        authors: allAuthors,
        genres: allGenres,
        event: event,
    });
});


// Handle event update on POST.
exports.event_update_post = [
    // Convert the genre to an array.
    (req, res, next) => {
        if (!Array.isArray(req.body.genre)) {
            req.body.genre =
                typeof req.body.genre === "undefined" ? [] : [req.body.genre];
        }
        next();
    },

    // Validate and sanitize fields.
    body("title", "Title must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("author", "Author must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("summary", "Summary must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
    body("genre.*").escape(),

    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Event object with escaped/trimmed data and old id.
        const event = new Event({
            title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: typeof req.body.genre === "undefined" ? [] : req.body.genre,
            _id: req.params.id, // This is required, or a new ID will be assigned!
        });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form
            const [allAuthors, allGenres] = await Promise.all([
                Author.find().sort({ family_name: 1 }).exec(),
                Genre.find().sort({ name: 1 }).exec(),
            ]);

            // Mark our selected genres as checked.
            for (const genre of allGenres) {
                if (event.genre.indexOf(genre._id) > -1) {
                    genre.checked = "true";
                }
            }
            res.render("event_form", {
                title: "Update Event",
                authors: allAuthors,
                genres: allGenres,
                event: event,
                errors: errors.array(),
            });
            return;
        } else {
            // Data from form is valid. Update the record.
            const updatedEvent = await Event.findByIdAndUpdate(req.params.id, event, {});
            // Redirect to event detail page.
            res.redirect(updatedEvent.url);
        }
    }),
];


 */
