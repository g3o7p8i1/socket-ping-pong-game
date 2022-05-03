const express = require("express");
var bodyParser = require("body-parser");
const router = express.Router();
var jsonParser = bodyParser.json();
const { v4: uuidv4 } = require("uuid");

router.get("/", jsonParser, async (req, res) => {
  var id = uuidv4();
  try {
    return res.redirect("/game/" + id);
  } catch {
    return res.status(400).send("error");
  }
});

module.exports = router;
