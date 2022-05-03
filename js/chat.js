// Make connection
//var ip = "";
var socket = io.connect("http://localhost:4000/");
//var socket = io.connect(ip);

// Query DOM
var message = document.getElementById("message"),
  handle = document.getElementById("handle"),
  btn = document.getElementById("send"),
  output = document.getElementById("output"),
  feedback = document.getElementById("feedback");

const canvas = document.getElementById("canvas"),
  ctx = canvas.getContext("2d");

const room = window.location.pathname.substring(6);
let admin = false,
  pin = true;
//canvas

let l = 120,
  w = 20;
let p = [
  { x: 450, y: 570, l: l, w: w },
  { x: 450, y: 10, l: l, w: w },
];

class ball {
  constructor() {
    this.x = 70 + Math.floor(Math.random() * (canvas.width - 100));
    this.y = 300;
    this.color = "#10559A";
    this.radius = 15;
    this.vx = 3;
    this.vy = 3;
    this.xd = -1;
    this.yd = -1;
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
  }
  bounce() {
    if (
      (this.y <= 30 + this.radius &&
        this.x - this.radius > s[1].x - s[1].length / 2 - s[1].radius &&
        this.x + this.radius < s[1].x + s[1].length / 2 + s[1].radius) ||
      (this.y >= 540 + this.radius &&
        this.x > s[0].x - s[0].length / 2 - s[0].radius &&
        this.x < s[0].x + s[0].length / 2 + s[0].radius)
    ) {
      this.yd *= -1;
      this.y += this.vy * this.yd;
    }
    if (this.x <= 30 + this.radius || this.x >= 870 - this.radius) {
      this.xd *= -1;
      this.x += this.vx * this.xd;
    }
  }
  move() {
    this.draw();
    if (admin) {
      if (this.y > 30 + this.radius && this.y < 540 + this.radius)
        this.y += this.vy * this.yd;
      if (this.x > 30 + this.radius && this.x < 870 - this.radius)
        this.x += this.xd * this.vx;
      this.bounce();
      socket.emit("ball", { x: this.x, y: this.y });
    }
  }
}

class slider {
  constructor({ x, y, l, w }) {
    this.x = x;
    this.y = y;
    this.color = "#10559A";
    this.length = l;
    this.width = w;
    this.speed = 10;
    this.radius = this.width / 2;
  }
  draw() {
    ctx.fillRect(this.x - this.length / 2, this.y, this.length, this.width);
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(
      this.x + this.length / 2,
      this.y + this.width / 2,
      this.radius,
      1.5 * Math.PI,
      0.5 * Math.PI
    );
    ctx.arc(
      this.x - this.length / 2,
      this.y + this.width / 2,
      this.radius,
      0.5 * Math.PI,
      1.5 * Math.PI
    );
    ctx.fill();
    ctx.closePath();
  }
}

function layout() {
  ctx.fillStyle = "black";
  ctx.fillRect(870, 0, 900, 600);
  ctx.fillRect(0, 0, 30, 600);
}

function start() {
  b = new ball();
  s = [new slider(p[0]), new slider(p[1])];
  document.querySelector(".retry").style.display = "none";
}

let animationId = null;
let b = new ball();
let s = [new slider(p[0]), new slider(p[1])];

socket.on("ball", function ({ x: x, y: y }) {
  if (!admin) {
    b.x = x;
    b.y = y;
    b.draw();
  }
});

document.querySelector(".retry").addEventListener("click", function () {
  socket.emit("start", { room: room });
});

function animate() {
  animationId = requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  layout();
  b.move();

  if (b.y <= 30 + b.radius || b.y >= 540 + b.radius) {
    socket.emit("stop", {});
    cancelAnimationFrame(animationId);
  }

  s.forEach((e) => e.draw());
}

//random username generate
//fetch(ip+ "/names")
fetch("http://localhost:3000/names")
  .then((res) => res.json())
  .then((data) => {
    if (!handle.value) {
      handle.setAttribute("value", data.first_name + " " + data.last_name);
    } else {
      handle.setAttribute("disabled", "disabled");
      handle.style.fontSize = "18px";
      handle.style.fontWeight = "bold";
    }
  })
  .then(() => {
    // Emit events
    socket.emit("join", { handle: handle.value, room: room });
    socket.emit("name", { handle: handle.value });
    document.querySelector(".play").addEventListener("click", function () {
      socket.emit("start", { room: room });
    });

    btn.addEventListener("click", function () {
      if (handle.value && message.value) {
        socket.emit("chat", {
          message: message.value,
          handle: handle.value,
          room: room,
        });
        message.value = "";
        handle.setAttribute("disabled", "disabled");
        handle.style.fontSize = "18px";
        handle.style.fontWeight = "bold";
        socket.emit("name", { handle: handle.value });
      }
    });

    //to send message
    message.addEventListener("keyup", function (event) {
      if (handle.value && event.key === "Enter") {
        event.preventDefault();
        if (message.value != "") {
          socket.emit("chat", {
            message: message.value,
            handle: handle.value,
            room: room,
          });
          message.value = "";
          handle.setAttribute("disabled", "disabled");
          handle.style.fontSize = "18px";
          handle.style.fontWeight = "bold";
          socket.emit("name", { handle: handle.value });
        }
      }
    });

    handle.addEventListener("keyup", function (event) {
      if (handle.value && event.key === "Enter") {
        event.preventDefault();
        if (message.value != "") {
          socket.emit("chat", {
            message: message.value,
            handle: handle.value,
            room: room,
          });
          message.value = "";
          handle.setAttribute("disabled", "disabled");
          socket.emit("name", { handle: handle.value });
        }
      }
    });

    //typping...
    message.addEventListener("keyup", function (event) {
      if (message.value)
        socket.emit("typing", { handle: handle.value, room: room });
      else socket.emit("typing", { handle: "", room: room });
    });

    // Listen for events

    socket.on("chat", function (data) {
      feedback.innerHTML = "";
      output.innerHTML +=
        "<p><strong>" + data.handle + ": </strong>" + data.message + "</p>";
    });

    socket.on("typing", function (data) {
      if (data.handle)
        feedback.innerHTML =
          "<p><em>" + data.handle + " is typing a message...</em></p>";
      else feedback.innerHTML = "";
    });

    socket.on("join", function (data) {
      if (!data) {
        window.location.href = "/full";
      } else {
        output.innerHTML +=
          "<p><strong>" +
          data.handle +
          " </strong>" +
          "has joined the game" +
          "</p>";

        const copy = document.querySelector(".link");

        copy.addEventListener("click", function () {
          console.log("yes");
          var copyText = copy.innerHTML.slice(27);
          navigator.clipboard
            .writeText(copyText)
            .then(() => {
              //console.log(copyText);
            })
            .catch((res) => console.log(res.message));
        });
        addEventListener("keydown", (e) => {
          if (admin) {
            if (e.code === "KeyA" && s[0].x >= s[0].length)
              s[0].x -= s[0].speed;
            else if (e.code === "KeyD" && s[0].x <= canvas.width - s[0].length)
              s[0].x += s[0].speed;

            socket.emit("slider", { x: s[0].x, which: 0 });
          } else {
            if (e.code === "KeyD" && s[1].x >= s[1].length)
              s[1].x -= s[1].speed;
            else if (e.code === "KeyA" && s[1].x <= canvas.width - s[1].length)
              s[1].x += s[1].speed;
            socket.emit("slider", { x: s[1].x, which: 1 });
          }
        });
      }
    });

    socket.on("leave", function (data) {
      const para = document.createElement("p");
      const strong = document.createElement("strong");
      const node = document.createTextNode(data.name);
      const msg = document.createTextNode("  has left the game");
      strong.appendChild(node);
      para.appendChild(strong);
      para.appendChild(msg);
      output.appendChild(para);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      document.querySelector(".link").style.display = "flex";
    });

    socket.on("start", function () {
      console.log(admin);
      if (!admin && pin) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(Math.PI);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        layout();
        b.xd *= -1;
        pin = false;
      }
      document.querySelector(".link").style.display = "none";
      document.querySelector(".play").style.display = "none";
      start();
      animate();
    });

    socket.on("stop", function () {
      document.querySelector(".retry").style.display = "flex";
    });
    socket.on("admin", function () {
      //console.log("admin");
      admin = true;
    });
    socket.on("slider", function ({ x, which }) {
      s[which].x = x;
    });
  })
  .catch((res) => console.log("ERROR"));
