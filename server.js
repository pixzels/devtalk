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

users = {};
available_users = [];

// Any new connection
io.on("connection", function(socket) {
  socket.on("establish_connection", function({ handle }) {
    self_id = socket.id;
    users[self_id] = socket;
    users[self_id].handle = handle;

    if (!does_exist(available_users, self_id)) {
      available_users.push(self_id);
    }
    partner_id = find_random_partner(self_id);

    if (partner_id) {
      remove(available_users, [partner_id, self_id]);
      io.to(partner_id).emit("connection_success", {
        partner_id: self_id,
        partner_handle: users[self_id].handle
      });
      io.to(self_id).emit("connection_success", {
        partner_id: partner_id,
        partner_handle: users[partner_id].handle
      });
    } else {
      io.to(partner_id).emit("connection_success", { partner_id: -1 });
      io.to(self_id).emit("connection_success", { partner_id: -1 });
    }
  });

  socket.on("send_message", function({ to, message }) {
    io.to(to).emit("send_message", { user: socket.id, message: message });
  });

  socket.on("disconnect", function() {
    delete users[socket.id];
    remove(available_users, socket.id);
  });
});

function find_random_partner(self_id) {
  possible_users = available_users.filter(function(u) {
    return u !== self_id;
  });
  return possible_users.length
    ? possible_users[Math.floor(Math.random() * possible_users.length)]
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
app.get("/tonystark", function(req, res) {
  res.json({ users: Object.keys(users), available_users: available_users });
});
