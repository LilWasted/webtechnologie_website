#! /usr/bin/env node
const { DateTime } = require("luxon");


console.log(
    'This script populates some test events, authors, categories and eventinstances to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.cojoign.mongodb.net/local_library?retryWrites=true&w=majority&appName=Cluster0"'
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const Event = require("./models/event");
const Categorie = require("./models/categorie");
const EventInstance = require("./models/eveninstance");
const User = require("./models/User");

const categories = [];
const events = [];
const eventinstances = [];
const users = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
    console.log("Debug: About to connect");
    await mongoose.connect(mongoDB);
    console.log("Debug: Should be connected?");
    await createCategories();
    await createEvents();
    await createEventInstances();
    await createUsers();
    console.log("Debug: Closing mongoose");
    mongoose.connection.close();
}

// We pass the index to the ...Create functions so that, for example,
// categorie[0] will always be the Fantasy categorie, regardless of the order
// in which the elements of promise.all's argument complete.
async function categorieCreate(index, name) {
    const categorie = new Categorie({ name: name });
    await categorie.save();
    categories[index] = categorie;
    console.log(`Added categorie: ${name}`);
}

async function eventCreate(index, title, description, date, categorie) {
    const eventdetail = {
        title: title,
        description: description,
        categorie: categorie,
        date: date,
    };
    if (categorie != false) eventdetail.categorie = categorie;

    const event = new Event(eventdetail);
    await event.save();
    events[index] = event;
    console.log(`Added event: ${title}, ${date}, ${categorie}`);
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

async function eventInstanceCreate(index, event, status) {
    const eventinstancedetail = {
        event: event,
    };
    if (status != false) eventinstancedetail.status = status;

    const eventinstance = new EventInstance(eventinstancedetail);
    await eventinstance.save();
    eventinstances[index] = eventinstance;
    console.log(`Added eventinstance: ${index}`);
}

async function createCategories() {
    console.log("Adding categories");
    await Promise.all([
        categorieCreate(0, "COD"),
        categorieCreate(1, "LOL"),
        categorieCreate(2, "DOTA"),
        categorieCreate(3, "PUBG"),
        categorieCreate(4, "FIFA"),
    ]);
}

async function createUsers() {
    console.log("Adding categories");
    await Promise.all([
        userCreate(0, "test", "test", "test"),
    ]);
}

async function createEvents() {
    console.log("Adding Events");
    for(let i = 0; i < categories.length; i++) {
        console.log(categories[i]);
    }

    await Promise.all([
        eventCreate(
            0,
            "The Name of the Wind (The Kingkiller Chronicle, #1)",
            "description of event 1",
            "2025-10-01",
            categories[0]
        ),
        eventCreate(
            1,
            "The Wise Man's Fear (The Kingkiller Chronicle, #2)",
            "description of event 2",
            "2025-10-01",

            categories[0]
        ),
        eventCreate(
            2,
            "The Slow Regard of Silent Things (Kingkiller Chronicle)",
            "description of event 3",
            "2025-10-01",

            categories[0]
        ),
        eventCreate(
            3,
            "Apes and Angels",
            "description of event 4",
            "2025-10-01",

            categories[1]
        ),
        eventCreate(
            4,
            "Death Wave",
            "description of event 4",
            "2025-10-01",

            categories[1]
        ),
    ]);
}

async function createEventInstances() {
    console.log("Adding authors");
    await Promise.all([
        eventInstanceCreate(
            0,
            events[0],
            "Available"
        ),
        //"Full", "Cancelled"
        eventInstanceCreate(1, events[1], "Full"),
        eventInstanceCreate(2, events[2], false),
        eventInstanceCreate(
            3,
            events[3],
            "Available"
        ),
        eventInstanceCreate(
            4,
            events[3],
            "Available"
        ),
        eventInstanceCreate(
            5,
            events[3],
            "Available"
        ),
        eventInstanceCreate(
            6,
            events[4],
            "Available"
        ),
        eventInstanceCreate(
            7,
            events[4],
            "Cancelled"
        ),
        eventInstanceCreate(
            8,
            events[4],
            "Cancelled"
        ),
        eventInstanceCreate(9, events[0],false),
        eventInstanceCreate(10, events[1],false),
    ]);
}
  