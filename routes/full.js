const express = require("express");
var bodyParser = require("body-parser");
const router = express.Router();
var jsonParser = bodyParser.json();

router.get("/", jsonParser, async (req, res) => {
  try {
    return res.render("full.ejs");
  } catch {
    return res.status(400).send("error");
  }
});

module.exports = router;
