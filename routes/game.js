const express = require("express");
var bodyParser = require("body-parser");
const router = express.Router();
var jsonParser = bodyParser.json();

router.get("/:id", jsonParser, async (req, res) => {
  //console.log(req.cookies);
  try {
    return res.render("chat.ejs", {
      uid: req.cookies.name,
      rid: req.params.id,
    });
  } catch {
    return res.status(400).send("error");
  }
});

module.exports = router;
