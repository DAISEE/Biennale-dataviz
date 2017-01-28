'use strict';

const http = require('http');

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  // REST Methods and JSON
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Content-Type', 'application/json');
  res.statusCode=200;
  // /api/sensorId/get/watts/by_time/...
  if (require('url').parse(req.url).pathname.indexOf('by_time') !== -1) {
    res.end(JSON.stringify({data:[
      {
        timestamp: Date.now() + 1235,
        value: getRandomInt(1,10)
      },
      {
        timestamp: Date.now() + 15,
        value: getRandomInt(1,10)
      },
      {
        timestamp: Date.now() + 8235,
        value: getRandomInt(1,10)
      },
    ]}))
  } else {
    // /api/time
    res.end(JSON.stringify({data:getRandomInt(1,10)}));
  }
}).listen(8080);
