const express = require("express");
var bodyParser = require("body-parser");
const router = express.Router();
var jsonParser = bodyParser.json();

router.post("/", jsonParser, async (req, res) => {
  res.cookie("name", req.body.name, { httpOnly: true });
  try {
    if (req.body.new) return res.redirect("new/");
    else return res.redirect("join/");
  } catch (e) {
    return res.status(400).send(e.message);
  }
});

module.exports = router;
