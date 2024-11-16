const express = require('express');
const router = express.Router();

const { register_get, register_post, login_get, login_post, profile_get, logout_post, logout_get} = require('../controllers/auth');


router.get('/profile', profile_get);

router.post('/register', register_post);
router.get('/register', register_get);

router.post('/login', login_post);
router.get('/login', login_get);

router.get('/logout', logout_get);
router.post('/logout', logout_post);


module.exports = router;