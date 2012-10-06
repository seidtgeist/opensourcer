var express = require('express');
var five = require('johnny-five');
var http = require('http');
var path = require('path');
var socketIo = require('socket.io');

var app = express();
var server = http.createServer(app);
var io = socketIo.listen(server);

app.use(express['static'](path.join(__dirname, '..', '/public')));

/*var board = new five.Board();

board.on('ready', function() {
  var button = new five.Button(8);

  button.on('down', function() {
    io.sockets.emit('opensource');
  });
});*/

io.sockets.on('connection', function (socket) {
  console.log('New client: ', socket.id);
});

module.exports = server;
