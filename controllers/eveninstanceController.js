const EventInstance = require("../models/eveninstance");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const Event = require("../models/event");


// Display list of all EventInstances.
exports.eventinstance_list = asyncHandler(async (req, res, next) => {
    const allEventInstances = await EventInstance.find().populate("event").exec();

    res.render("eventinstance_list", {
        title: "event Instance List",
        eventinstance_list: allEventInstances,
    });
});


// Display detail page for a specific EventInstance.
exports.eventinstance_detail = asyncHandler(async (req, res, next) => {
    const eventInstance = await EventInstance.findById(req.params.id)
        .populate("event")
        .exec();

    if (eventInstance === null) {
        // No results.
        const err = new Error("Event copy not found");
        err.status = 404;
        return next(err);
    }

    res.render("eventinstance_detail", {
        title: "event:",
        eventinstance: eventInstance,
    });
});

/*
// Display eventInstance create form on GET.
exports.eventinstance_create_get = asyncHandler(async (req, res, next) => {
    const allevents = await Event.find({}, "title").sort({ title: 1 }).exec();

    res.render("eventinstance_form", {
        title: "Create EventInstance",
        event_list: allEvents,
    });
});


// Handle EventInstance create on POST.
exports.eventinstance_create_post = [
    // Validate and sanitize fields.
    body("event", "Event must be specified").trim().isLength({ min: 1 }).escape(),
    body("imprint", "Imprint must be specified")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("status").escape(),
    body("due_back", "Invalid date")
        .optional({ values: "falsy" })
        .isISO8601()
        .toDate(),

    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a EventInstance object with escaped and trimmed data.
        const eventInstance = new EventInstance({
            event: req.body.event,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
        });

        if (!errors.isEmpty()) {
            // There are errors.
            // Render form again with sanitized values and error messages.
            const allEvents = await Event.find({}, "title").sort({ title: 1 }).exec();

            res.render("eventinstance_form", {
                title: "Create EventInstance",
                event_list: allEvents,
                selected_event: eventInstance.event._id,
                errors: errors.array(),
                eventinstance: eventInstance,
            });
            return;
        } else {
            // Data from form is valid
            await eventInstance.save();
            res.redirect(eventInstance.url);
        }
    }),
];


// Display EventInstance delete form on GET.
exports.eventinstance_delete_get = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: EventInstance delete GET");
});

// Handle EventInstance delete on POST.
exports.eventinstance_delete_post = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: EventInstance delete POST");
});

// Display EventInstance update form on GET.
exports.eventinstance_update_get = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: EventInstance update GET");
});

// Handle eventinstance update on POST.
exports.eventinstance_update_post = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: EventInstance update POST");
});

 */