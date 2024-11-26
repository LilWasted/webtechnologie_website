const express = require('express');
const router = express.Router();

// GET home page.
router.get("/", function (req, res) {
  res.redirect("/home");
});
//- [ ] privacy policy
//- [ ] terms of service
//- [ ] cookie policy
//- [ ] contact
module.exports = router;
