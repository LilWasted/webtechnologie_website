#! /usr/bin/env node
// noinspection EqualityComparisonWithCoercionJS,JSUnusedLocalSymbols

const { DateTime } = require("luxon");


console.log(
    'This script populates some test events, authors, games and eventinstances to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.cojoign.mongodb.net/local_library?retryWrites=true&w=majority&appName=Cluster0"'
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const Event = require("./models/event");
const Game = require("./models/game");
const User = require("./models/User");

const games = [];
const events = [];
const users = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
    console.log("Debug: About to connect");
    await mongoose.connect(mongoDB);
    console.log("Debug: Should be connected?");
    await createGames();
    await createEvents();
    await createUsers();
    console.log("Debug: Closing mongoose");
    mongoose.connection.close();
}

// We pass the index to the ...Create functions so that, for example,
// game[0] will always be the Fantasy game, regardless of the order
// in which the elements of promise.all's argument complete.
async function gameCreate(index, name) {
    const game = new Game({ name: name });
    await game.save();
    games[index] = game;
    console.log(`Added game: ${name}`);
}

async function eventCreate(index, title, description, date, game) {
    const eventdetail = {
        title: title,
        description: description,
        game: game,
        date: date,
    };
    if (game != false) eventdetail.game = game;

    const event = new Event(eventdetail);
    await event.save();
    events[index] = event;
    console.log(`Added event: ${title}, ${date}, ${game}`);
}

async function userCreate(index, username, email, password) {
    const userDetail = {
        username: username,
        email: email,
        password: password,
    };
    if (password != false) userDetail.password = password;

    const user = new User(userDetail);
    await user.save();
    user[index] = user;
    console.log(`Added user: ${username}, ${email}`);
}


async function createGames() {
    console.log("Adding games");
    await Promise.all([
        gameCreate(0, "COD"),
        gameCreate(1, "LOL"),
        gameCreate(2, "DOTA"),
        gameCreate(3, "PUBG"),
        gameCreate(4, "FIFA"),
    ]);
}

async function createUsers() {
    console.log("Adding games");
    await Promise.all([
        userCreate(0, "test", "test", "test"),
    ]);
}

async function createEvents() {
    console.log("Adding Events");
    for(let i = 0; i < games.length; i++) {
        console.log(games[i]);
    }

    await Promise.all([
        eventCreate(
            0,
            "The Name of the Wind (The Kingkiller Chronicle, #1)",
            "description of event 1",
            "2025-10-01",
            games[0]
        ),
        eventCreate(
            1,
            "The Wise Man's Fear (The Kingkiller Chronicle, #2)",
            "description of event 2",
            "2025-10-01",

            games[0]
        ),
        eventCreate(
            2,
            "The Slow Regard of Silent Things (Kingkiller Chronicle)",
            "description of event 3",
            "2025-10-01",

            games[0]
        ),
        eventCreate(
            3,
            "Apes and Angels",
            "description of event 4",
            "2025-10-01",

            games[1]
        ),
        eventCreate(
            4,
            "Death Wave",
            "description of event 4",
            "2025-10-01",

            games[1]
        ),
    ]);
}
