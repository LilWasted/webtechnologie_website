const express = require('express');
const router = express.Router();

const { register_get, register_post, login_get, login_post, profile_get} = require('../controllers/auth');
const jwt = require("jsonwebtoken");


router.get('/profile', profile_get);

router.post('/register', register_post);
router.get('/register', register_get);

router.post('/login', login_post);
router.get('/login', login_get);

module.exports = router;