var express = require("express");
var socket = require("socket.io");
var bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

// App setup
var app = express();
app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());

var server = app.listen(4000, function () {
  console.log("connected...");
});

// Static files
app.use(express.static("public"));
app.use("/js", express.static("js"));
app.set("view engine", "ejs");

// Socket setup & pass server
var io = socket(server);
var limit = {}, //room no : no of users
  users = {}, //socker id : room no
  names = {}; //socket id: name
io.on("connection", (socket) => {
  //console.log("socket connect succesfull: ", socket.id);

  socket.on("join", function (data) {
    var x = true;
    if (limit[data.room]) {
      //console.log(limit[data.room]);
      if (limit[data.room] < 2) {
        limit[data.room]++;
      } else x = false;
    } else limit[data.room] = 1;

    if (x) {
      socket.join(data.room);
      io.to(data.room).emit("join", data);
      users[socket.id] = data.room;
    } else {
      io.to(socket.id).emit("join", "");
      socket.disconnect();
    }
    if (limit[data.room] == 1) io.to(socket.id).emit("admin", true);
  });

  // Handle chat event
  socket.on("chat", function (data) {
    io.to(data.room).emit("chat", data);
  });

  // Handle typing event
  socket.on("typing", function (data) {
    socket.broadcast.to(data.room).emit("typing", data);
  });

  socket.on("name", function (data) {
    //console.log(data);
    names[socket.id] = data.handle;
  });

  socket.on("disconnect", function () {
    var room = users[socket.id];
    limit[room]--;
    socket.broadcast.to(room).emit("leave", { name: names[socket.id] });
    delete names[socket.id];
    delete users[socket.id];
    io.to(room).emit("stop", {});
    if (limit[room] == 1) io.to(room).emit("admin", true);
  });

  socket.on("start", (data) => {
    if (limit[data.room] === 2) {
      io.to(data.room).emit("start", {});
    }
    socket.on("ball", (data) => {
      socket.broadcast.to(users[socket.id]).emit("ball", data);
    });
    socket.on("slider", (data) => {
      socket.broadcast.to(users[socket.id]).emit("slider", data);
    });
    socket.on("stop", function () {
      io.to(users[socket.id]).emit("stop", {});
    });
  });
});

const home = require("./routes/home.js");
const game = require("./routes/game.js");
const ew = require("./routes/new.js");
const full = require("./routes/full.js");
const join = require("./routes/join.js");
const where = require("./routes/where.js");

//routes;
app.use("/", home);
app.use("/game", game);
app.use("/new", ew);
app.use("/full", full);
app.use("/join", join);
app.use("/where", where);
