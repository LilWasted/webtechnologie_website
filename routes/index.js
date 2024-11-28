const express = require('express');
const router = express.Router();

// GET home page.
router.get("/", function (req, res) {
  res.redirect("/home");
});

router.get("/terms-of-service", function (req, res) {
  res.render("terms_of_service");
});

router.get("/privacy-policy", function (req, res) {
  res.render("privacy_policy");
});

router.get("/cookie-policy", function (req, res) {
    res.render("cookie_policy");
});
//- [ ] privacy policy
//- [ ] terms of service
//- [ ] cookie policy
//- [ ] contact
module.exports = router;
