#!/usr/bin/env node

var argv = require('optimist').alias('p', 'port').argv;
var port = argv.port || 3000;
var server = require('../lib/opensourcer').listen(port);

server.on('listening', function() {
  console.log('Listening on http://localhost:' + port);
});
