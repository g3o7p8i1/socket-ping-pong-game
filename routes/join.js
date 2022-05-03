const express = require("express");
var bodyParser = require("body-parser");
const router = express.Router();
var jsonParser = bodyParser.json();

router.get("/", jsonParser, async (req, res) => {
  try {
    return res.render("join.ejs");
  } catch {
    return res.status(400).send("error");
  }
});

router.post("/", jsonParser, async (req, res) => {
  try {
    if (req.body.link) return res.redirect("/game/" + req.body.link);
    else res.redirect("/join");
  } catch {
    return res.status(400).send("error");
  }
});

module.exports = router;
