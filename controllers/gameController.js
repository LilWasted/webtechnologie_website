const Game = require("../models/game");
const asyncHandler = require("express-async-handler");
const Event = require("../models/event");
const { body, validationResult } = require("express-validator");

// Display list of all Game.
exports.game_list = asyncHandler(async (req, res, next) => {
    const allGames = await Game.find().sort({name : 1}).exec();

    res.render("game_list", { title: "Game List", game_list: allGames });
});

// Display detail page for a specific Game.
exports.game_detail = asyncHandler(async (req, res, next) => {
    // Get details of game and all associated events (in parallel)
    const [game, openEvents] = await Promise.all([
        Game.findById(req.params.id).exec(),
        Event.find({ game: req.params.id, status: "Available" }, "title summary")
            .populate("participants")
            .populate("max_size")
            .sort({ title: 1 })
            .exec(),
    ]);

    if (game === null) {
        // No results.
        const err = new Error("Game not found");
        err.status = 404;
        return next(err);
    }

    res.render("game_detail", {
        title: "Game Detail",
        game: game,
        game_events: openEvents,
    });
});