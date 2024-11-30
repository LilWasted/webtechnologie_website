const Game = require("../models/game");
const asyncHandler = require("express-async-handler");
const Event = require("../models/event");
const { body, validationResult } = require("express-validator");

// Display list of all Game.
exports.game_list = asyncHandler(async (req, res, next) => {
    const allGames = await Game.find().sort({ name: 1 }).exec();
    const gamesWithEvents = await Promise.all(
        allGames.map(async (game) => {
            const openEventCount = await Event.countDocuments({ game: game._id, status: "Available" }).exec();
            return { ...game.toObject(), openEventCount, url: game.url };
        })
    );

    res.render("game_list", { title: "Games", game_list: gamesWithEvents });
});

// Display detail page for a specific Game.
exports.game_detail = asyncHandler(async (req, res, next) => {
    // Get details of game and all associated events (in parallel)
    const [game, openEvents] = await Promise.all([
        Game.findById(req.params.id).exec(),
        Event.find({ game: req.params.id, status: "Available" }, "title summary")
            .populate("participants")
            .populate("max_size")
            .populate("status")
            .sort({ title: 1 })
            .exec(),
    ]);

    if (game === null) {
        console.log("Game not found");
        return res.redirect("/home");
    }

    res.render("game_detail", {
        title: "Game Detail",
        game: game,
        game_events: openEvents,
    });
});


exports.game_create_get = asyncHandler(async (req, res, next) => {
    const game = Game.findById(req.params.id).populate("name").exec();
    res.render("game_form", { title: "Create Game"});
});

exports.game_create_post = [
    body("name", "Game name required")
        .trim()
        .isLength({ min: 1 })
        .toLowerCase()
        .escape(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        const existingGame = await Game.findOne({ name: req.body.name }).exec();
        //const existingGame = await Game.findOne({ name: new RegExp('^' + req.body.name + '$', 'i') }).exec();
        if (existingGame) {
            errors.errors.push({ msg: "Game name already exists." });
        }

        if (!errors.isEmpty()) {
            res.render("game_form", {
                title: "Create Game",
                game: req.body,
                errors: errors.array(),
            });
        } else {
            const game = new Game({ name: req.body.name });
            await game.save();
            res.redirect(game.url);
        }
    }),
];