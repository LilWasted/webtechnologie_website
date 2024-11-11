const Event = require("../models/event");
const Categorie = require("../models/categorie");
const EventInstance = require("../models/eveninstance");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const { DateTime } = require("luxon");
const asyncHandler = require("express-async-handler");

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Genre = require("../models/genre");
const Book = require("../models/book");
const Author = require("../models/author");
const SECRET_KEY="mysecretkey"

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
    const [event, eventInstances, users] = await Promise.all([
        Event.findById(req.params.id).populate("categorie").populate('participants').exec(),
        EventInstance.find({ event: req.params.id }).exec(),
    ]);

    if (event === null) {
        // No results.
        const err = new Error("Event not found");
        err.status = 404;
        return next(err);
    }

    for (const user of event.participants) {
        console.log("user = ", user.username);
    }

    res.render("event_detail", {
        title: event.title,
        event: event,
        event_instances: eventInstances,
        users: event.participants,
    });
});



// Display event create form on GET.
exports.event_create_get = asyncHandler(async (req, res, next) => {
    // Get all authors and genres, which we can use for adding to our event.
    const [event, categories, users] = await Promise.all([
        Event.findById(req.params.id).populate("categorie").exec(),
        Categorie.find({ event: req.params.id }).exec(),
        User.find().exec(),
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

        const {token}=req.cookies;
        const verify = jwt.verify(token,SECRET_KEY);

        const maker = await User.findOne( {username: verify.username}).exec();
        // Create a Event object with escaped and trimmed data.
        const event = new Event({
            title: req.body.title,
            description: req.body.description,
            categorie: req.body.categorie,
            organizer: maker._id,
            date: req.body.date,
            participants: [maker._id],
        });

        console.log("orginize =  ", event.organizer)
        for (const user of event.participants) {
            console.log("user = ", user);
        }

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
    const [event, categories] = await Promise.all([
        Event.findById(req.params.id).populate("categorie").exec(),
    ]);

    if (event === null) {
        // No results.
        res.redirect("/home/events");
    }


    res.render("event_delete", {
        title: "Delete Event",
        event: event,
    });

});

// Handle event delete on POST.
exports.event_delete_post = asyncHandler(async (req, res, next) => {
// Get details of author and all their books (in parallel)
    const [event, categories] = await Promise.all([
        Event.findById(req.params.id).exec(),
    ]);

        // Author has no books. Delete object and redirect to the list of authors.
        await Event.findByIdAndDelete(req.body.eventid);
        res.redirect("/home/events");
    });



exports.event_delete_post = asyncHandler(async (req, res, next) => {
// Get details of author and all their books (in parallel)
    const [event, categories] = await Promise.all([
        Event.findById(req.params.id).exec(),
    ]);

    // Author has no books. Delete object and redirect to the list of authors.
    await Event.findByIdAndDelete(req.body.eventid);
    res.redirect("/home/events");
});


//kunnen een event joinen get waar je een klop krijgt of je zeker bent en post waar je dan toegevoegd wordt
// Display event delete form on GET.
exports.join_get = asyncHandler(async (req, res, next) => {
    const [event] = await Promise.all([
        Event.findById(req.params.id).exec(),
    ]);

    if (event === null) {
        // No results.
        res.redirect("/home/events");
    }


    res.render("event_join", {
        title: "join Event",
        event: event,
    });

});

exports.join_post = asyncHandler(async (req, res, next) => {
    const [event] = await Promise.all([
        Event.findById(req.params.id).populate('participants').populate("blacklist").exec(),
    ]);

    const {token}=req.cookies;
    const verify = jwt.verify(token,SECRET_KEY);
    const user = await User.findOne( {username: verify.username}).exec();
    // Create a Event object with escaped and trimmed data.
    for (const participant of event.participants) {
        if (user._id === participant._id) {
            console.log("user already in");
            return res.redirect(event.url);

        }}

    for (const participant of event.blacklist) {
        if (user._id === participant._id) {
            console.log("user blacklisted");
            return res.redirect(event.url);

        }
    }
    event.participants.push(user._id);
    res.redirect(`/home`);


});

// Handle book update on POST.