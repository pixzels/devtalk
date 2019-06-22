const express = require("express");
const socket = require("socket.io");
var cors = require("cors");

// App setup
const app = express();
app.use(cors());
const server = app.listen(process.env.PORT || 7000);
const io = socket(server);

// Static files
app.use(express.static("build"));

// User
class User {
  constructor(handle = null, socket = null, id = null, partner_id = null) {
    this.handle = handle;
    this.socket = socket;
    this.id = id;
    this.partner_id = partner_id;
  }
}

database = {};
available_users = [];

io.on("connection", function(socket) {
  // Any new connection
  socket.on("establish_connection", function({ handle }) {
    let user = new User(handle, socket, socket.id);
    partner = find_random_partner();

    if (partner) {
      user.partner_id = partner.id;
      partner.partner_id = user.id;

      io.to(partner.id).emit("connection_success", {
        partner: {
          id: user.id,
          handle: user.handle
        }
      });

      io.to(user.id).emit("connection_success", {
        partner: {
          id: partner.id,
          handle: partner.handle
        }
      });
      remove(available_users, [user.id, partner.id]);
    } else {
      io.to(user.id).emit("connection_success", { partner: { id: -1 } });
      if (!does_exist(available_users, user.id)) available_users.push(user.id);
    }
    database[user.id] = user;
  });

  // Typing indicator
  socket.on("typing", function({ to, value }) {
    io.to(to).emit("typing", { value: value });
  });

  socket.on("send_message", function({ to, message }) {
    io.to(to).emit("send_message", { user: socket.id, message: message });
  });

  socket.on("disconnect", function() {
    let id = socket.id;
    let partner = id in database ? database[database[id].partner_id] : null;

    if (partner) {
      io.to(partner.id).emit("offline", { value: true });
      database[partner.id].partner_id = null;
      database[id].partner_id = null;
      delete database[partner.id];
      remove(available_users, [partner.id]);
    }

    delete database[id];
    remove(available_users, [id]);
  });
});

function find_random_partner() {
  return available_users.length
    ? database[
        available_users[Math.floor(Math.random() * available_users.length)]
      ]
    : null;
}

function remove(arr, values) {
  for (let i = 0; i < values.length; i++) {
    let index = arr.indexOf(values[i]);
    if (index !== -1) arr.splice(index, 1);
  }
}

function does_exist(arr, value) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === value) return true;
  }
  return false;
}

// Debugging
app.get("/watcher", function(req, res) {
  res.json({
    database: Object.keys(database),
    available_users: available_users
  });
});
