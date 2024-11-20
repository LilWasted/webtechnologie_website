const express = require("express");
const router = express.Router();

const categorie_controller = require("../controllers/categorieController");
const event_controller = require("../controllers/eventController");

/// Event ROUTES ///

// GET catalog home page.
router.get("/", event_controller.index);

// GET request for list of all event items.
router.get("/events", event_controller.event_list);

// GET request for one Book.
router.get("/events/:id", event_controller.event_detail);

// GET request for creating a Genre. NOTE This must come before route that displays Genre (uses id).
router.get("/event/create", event_controller.event_create_get);

// POST request for creating Genre.
router.post("/event/create", event_controller.event_create_post);

// GET request to delete Book.
router.get("/events/:id/delete", event_controller.event_delete_get);

// POST request to delete Book.
router.post("/events/:id/delete", event_controller.event_delete_post);

router.get("/events/:id/join", event_controller.join_get);

// POST request to update Book.
router.post("/events/:id/join", event_controller.join_post);


// GET request to leave an event
router.get("/events/:id/leave", event_controller.leave_get);

// POST request to leave an event.
router.post("/events/:id/leave", event_controller.leave_post);

// GET request to leave an event
router.get("/events/:id/update", event_controller.update_get);

// POST request to leave an event.
router.post("/events/:id/update", event_controller.update_post);

router.get("/events/:id/blacklist", event_controller.blacklist_get);

router.post("/events/:id/blacklist", event_controller.blacklist_post);

router.get("/events/:id/kick", event_controller.kick_get);

router.post("/events/:id/kick", event_controller.kick_post);

/// Categories ROUTES ///

router.get("/categories", categorie_controller.categorie_list);

router.get("/categories/:id", categorie_controller.categorie_detail);

module.exports = router;
