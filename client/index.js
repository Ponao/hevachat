const express = require('express');
const path = require('path');
const https = require("https")
const fs = require("fs")

const app = express();

app.use(express.static(path.join(__dirname, 'build')));

app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const sslCerts = {
    key: fs.readFileSync("/etc/letsencrypt/live/romadevtest.tk/privkey.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/romadevtest.tk/fullchain.pem")
}

https.createServer(app).listen(443);

// Redirect from http port 80 to https
const http = require('http');
http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(80);