// noinspection JSUnusedLocalSymbols

const Event = require("../models/event");
const Game = require("../models/game");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");


const jwt = require('jsonwebtoken');
const SECRET_KEY=process.env.SECRET_KEY

async function getUserFromToken(req) {
    const token = req.cookies.token;
    if (!token) {
        throw new Error("Token not found");
    }
    const verify = jwt.verify(token, SECRET_KEY);
    return await User.findOne({ _id: verify.userId }).exec();
}

async function isUserSignedIn(req) {
    try {
        const token = req.cookies.token;
        const verify = jwt.verify(token, SECRET_KEY);
        const user = await User.findOne({ _id: verify.userId }).exec();
        return true;
    } catch (error) {
        return false;
    }
}

//TODO voor elke del en join etc => checken of het wel de juiste user is
    //anders kan er via de url vanalles gebeuren

exports.index = asyncHandler(async (req, res, next) => {  //hookINDEX
    // Get details of events, event instances, authors and genre counts (in parallel)
    const numEvents = await Event.countDocuments({}).exec();


    //thsi renders home page
    res.render("index", {
        title: "Event Home",
        numEvents: numEvents,
    });
});

// Display list of all events.
exports.event_list = asyncHandler(async (req, res, next) => {  //hookEVENT_LIST
    const allEvents = await Event.find({}, "title game")
        .sort({ date: 1 })
        .populate("game")
        .populate("participants")
        .populate("max_size")
        .populate("status")
        .exec();

    res.render("event_list", {
        title: "Event List",
        event_list: allEvents,
    });
});

// Display detail page for a specific event.
exports.event_detail = asyncHandler(async (req, res, next) => { //hookEVENTS_DETAIL
    // Get details of events, event instances for specific event
    const event = await Event.findById(req.params.id)
        .populate('game')
        .populate('participants')
        .populate("status")
        .populate("max_size")
        .populate("date")
        .populate("platform")
        .exec();

    if (event === null) {
        // No results.
        const err = new Error("Event not found");
        err.status = 404;
        return next(err);
    }

    //als je ingelogd bent, is er een delete knop voor organisator en een leave knop voor deelnemers
    //er is ook een join knop voor niet deelnemers
    if (await isUserSignedIn(req)) {
        //const user = await getUserFromToken(req);
        const user = await res.locals.user;

        res.render("event_detail", {
            event: event,
            users: event.participants,
            user: user,
            status_event: event.status,
            max_size: event.max_size,
            date : event.date,

        });
    } else {
        //een pug voor als je niet bent ingelogd
        //heeft een join knop dat doorverwijst naar login
        res.render("event_detail_unsigned", {
            title: event.title,
            event: event,
            users: event.participants,
            status_event: event.status,
        });
    }

});

// Display event create form on GET.
exports.event_create_get = asyncHandler(async (req, res, next) => {
    // get the event and all games
    const [event, games] = await Promise.all([
        Event.findById(req.params.id).populate("game").exec(),
        Game.find().sort({ name: 1 }).exec(),
    ]);

    if(!await isUserSignedIn(req)) {
        res.redirect("/user/login");
    }

    res.render("event_form", {
        title: "Create Event",
        games: games,
        event: event || {},
    });

});

// Handle event create on POST.
exports.event_create_post = [  //hookevent_create_post

    // Convert the genre to an array.

    //TODO filteren en alle inputs verschonen (kinda done)

    // Validate and sanitize fields.
    body("title", "Title must not be empty.")
        .trim()
        .isLength({ min: 1 }).withMessage("Title must not be empty.")
        .isAscii().withMessage("Title must only contain ASCII characters.")
        .escape(),
    body("description", "Summary must not be empty.")
        .trim()
        .isLength({ min: 1 }).withMessage("Description must not be empty.")
        .escape(),
    body("date", "Invalid date")
        .optional({ values: "falsy" })
        .isISO8601().withMessage("Date must be in ISO 8601 format.")
        .toDate()
        .custom((value) => {
                if (value && value <= new Date()) {
                    throw new Error("Date must be in the future.");
                }
                return true}),
    body("platform")
        .trim()
        .isIn(["PC", "PS", "xbox", "switch"]).withMessage("Invalid platform selected.")
        .escape(),
    body("game")
        .trim()
        .isLength({ min: 1 }).withMessage("Game must not be empty if provided.")
        .escape(),
    body("max_size", "Invalid max size")
        .optional({ checkFalsy: true }) // max_size can be empty, but if provided, it should be valid
        .isInt({ min: 1, max: 40 }).withMessage("Max size must be a positive integer between 1 and 40."),
    // Process request after validation and sanitization.

    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        if (!req.body.max_size) {
            req.body.max_size = 6;
        }
        const errors = validationResult(req);
        const maker = await res.locals.user;

        // Create an Event object with escaped and trimmed data.
        const event = new Event({
            title: req.body.title,
            description: req.body.description,
            game: req.body.game,
            organizer: maker._id,
            date: req.body.date,
            platform: req.body.platform,
            participants: [maker._id],
            max_size: req.body.max_size,
        });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.
            const allGames = await Game.find().sort({ name: 1 }).exec();

            //TODO werkt dit?????
            const selectedGame =  allGames.find(
            (cat) => cat && cat._id === event.game
            );



            if (!selectedGame) {
                errors.errors.push({
                  msg: "Selected game is invalid.",
                  param: "game",
                  location: "body",
                });
            }

            res.render("event_form", {
                title: "Create Event",
                games: allGames,
                event: event,
                errors: errors.array(),
            });
        } else {
            // Data from form is valid. Save event.
            await event.save();
            maker.events.push(event._id);

            await maker.save();
            res.redirect(event.url);

        }
    }),
];

// Display event delete form on GET.
exports.event_delete_get = asyncHandler(async (req, res, next) => {
    const event = await Event.findById(req.params.id).populate("organizer") .exec();

    //enkel de organisator kan dit
    let user = await res.locals.user;
    if (!event.organizer.equals(user._id)) {
       return res.redirect("/home/events");
    }

    if (!event) {
        const err = new Error("Event not found");
        err.status = 404;
        return next(err);
    }

    res.render("event_delete", {
        title: "Delete Event",
        event: event,
    });
});

// Handle event delete on POST.
exports.event_delete_post = asyncHandler(async (req, res, next) => {
// Get details of author and all their books (in parallel)
    const event = await Event.findById(req.params.id).exec();

    if (event === null) {
        // No results.
        console.log("event not found");
        res.redirect("/home/events");
    }

    //elke user in event overlopen => event verwijderen van user
    for (const participant of event.participants) {
        //events verwijderen van user => user.events array updaten
        //pull = remove from array in mongoDB
        //geen user.save() nodig omdat updateOne al save doet
        await User.updateOne(
            { _id: participant._id },
            { $pull: { events: event._id } }
        );
    }

    //event verwijderen van DB
    await Event.findByIdAndDelete(req.body.eventid);
    res.redirect("/home/events");
});


exports.join_get = asyncHandler(async (req, res, next) => {
    const event = await
        Event.findById(req.params.id).exec();


    if (!event) {
        // No results.
        res.redirect("/home/events");
    }

    res.render("event_join", {
        title: "join Event",
        event: event,
    });
});

exports.join_post = asyncHandler(async (req, res, next) => {
    const event = await Event.findById(req.params.id)
        .populate('participants')
        .populate("blacklist")
        .populate("max_size")
        .populate("status")
        .exec();


    //get user data
    const user = await res.locals.user;

    // Create an Event object with escaped and trimmed data.
    for (const participant of event.participants) {
        if (participant._id.equals(user._id)) {
            console.log("user already in");
            return res.redirect(event.url);
        }
    }

    for (const participant of event.blacklist) {
        if (user._id.equals(participant._id)) {
            console.log("user blacklisted");
            return res.redirect(event.url);
        }
    }

    if (event.participants.length === (event.max_size- 1)) {
        event.status = "Full";
    }

    event.participants.push(user._id);
    await event.save();

    user.events.push(event._id);
    await user.save();

    res.redirect(event.url);
});

exports.leave_get = asyncHandler(async (req, res, next) => { //hookleave_get

    const event = await Event.findById(req.params.id).exec();


    if (event === null) {
        // No results.
        res.redirect("/home/events");
    }

    res.render("event_leave", {
        title: "leave Event",
        event: event,
    });
});

exports.leave_post = asyncHandler(async (req, res, next) => { //hookleave_post
    const event = await Event.findById(req.params.id).populate('participants');


    const user = await res.locals.user;

    await User.updateOne(
        { _id: user._id },
        { $pull: { events: req.body.eventid } }
    );

    await Event.updateOne(
        { _id: event._id },
        { $pull: { participants: user._id } }
    );
    res.redirect("/home/events");
});

//TODO afmaken
exports.update_get = asyncHandler(async (req, res, next) => { //hookupdate_get

    const [event, game] = await Promise.all([
        Event.findById(req.params.id).populate("game").populate("organizer").exec(),
        Game.find().sort({ name: 1 }).exec(),
    ]);

    //enkel de organisator kan dit
    let user = await res.locals.user;
    if (!event.organizer._id.equals(user._id)) {
        return res.redirect("/home/events");
    }

    if (!event) {
        // No results.
        const err = new Error("event not found");
        err.status = 404;
        return next(err);
    }

    res.render("event_form", {
        title: "Update Book",
        games: game,
        event: event,

    });

});
//TODO afmaken
exports.update_post = [ //hookupdate_post

    body("title", "Title must not be empty.")
        .trim()
        .isLength({ min: 1 }).withMessage("Title must not be empty.")
        .isAscii().withMessage("Title must only contain ASCII characters.")
        .escape(),
    body("description", "Summary must not be empty.")
        .trim()
        .isLength({ min: 1 }).withMessage("Description must not be empty.")
        .escape(),
    body("date", "Invalid date")
        .optional({ values: "falsy" })
        .isISO8601().withMessage("Date must be in ISO 8601 format.")
        .toDate()
        .custom((value) => {
            if (value && value <= new Date()) {
                throw new Error("Date must be in the future.");
            }
            return true}),
    body("platform")
        .trim()
        .isIn(["PC", "PS", "xbox", "switch"]).withMessage("Invalid platform selected.")
        .escape(),
    body("game")
        .trim()
        .isLength({ min: 1 }).withMessage("Game must not be empty if provided.")
        .escape(),
    body("max_size", "Invalid max size")
        .optional({ checkFalsy: true }) // max_size can be empty, but if provided, it should be valid
        .isInt({ min: 1, max: 40 }).withMessage("Max size must be a positive integer between 1 and 40."),
    // Process request after validation and sanitization.

    //TODO error aanpasses, kijken dat de game niet leeg is en geen array is, kan maar 1tje zijn(kinda gefixt)
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        if (!req.body.max_size) {
            req.body.max_size = 6;
        }
        const errors = validationResult(req);

        const maker = await res.locals.user;
       // Create an Event object with escaped and trimmed data.
        const event = new Event({
            title: req.body.title,
            description: req.body.description,
            game: req.body.game,
            organizer: maker._id,
            date: req.body.date,
            platform: req.body.platform,
            participants: [maker._id],
            max_size: req.body.max_size,
            _id: req.params.id,
        });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            const allGame = await Game.find().sort({ name: 1 }).exec();


            const selectedGame =  allGame.find(
            (cat) => cat._id.toString() === event.game
            );

            if (!selectedGame) {
                errors.errors.push({
                  msg: "Selected game is invalid.",

                  param: "game",
                  location: "body",
                });
            }

            res.render("event_form", {
                title: "Create Event",
                games: games,
                event: event,
                errors: errors.array(),
            });
        } else {
            const updatedEvent = await Event.findByIdAndUpdate(req.params.id, event, {});
            res.redirect(updatedEvent.url);

            // Data from form is valid. Save event.
        }
    }),

];

//TODO afmaken
//naast elke user een knop om te kicken, enkel organisator kan dit => nieuwe pug file enkel voor organisator
exports.blacklist_get = asyncHandler(async (req, res, next) => { //hookupdate_get
    const event = await Event.findById(req.params.id);



});
//TODO afmaken
exports.blacklist_post = asyncHandler(async (req, res, next) => { //hookupdate_post
    const event = await Event.findById(req.params.id);

    const user = await res.locals.user;

    //TODO: via contains
    if(user._id === event.organizer){

    }
});
//TODO afmaken
exports.kick_get = asyncHandler(async (req, res, next) => { //hookupdate_get

});

//TODO afmaken
exports.kick_post = asyncHandler(async (req, res, next) => { //hookupdate_post
    const [event] = await Promise.all([
        Event.findById(req.params.id)
    ]);

    const user = await res.locals.user;

    //TODO: via contains
    if(user._id === event.organizer  ){

    }
});
