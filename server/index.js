/**
 * index.js
 * Author: Roman Shuvalov
 */
'use strict';

const envFound = require('dotenv').config();
if (!envFound) {
  console.log(
    '⚠️  No .env file for HEVACHAT found'
  );
  process.exit(0);
}

const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const morgan = require('morgan')
const bodyParser = require('body-parser');
const path = require('path');
const historyApiFallback = require('connect-history-api-fallback');
const {initSocket} = require('./controllers/SocketController')

// const errors = require('./middleware/errors');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const roomRoutes = require('./routes/room');

// Use Express as our web server
const app = express();

app
  // Parse JSON
  .use(bodyParser.json())
  // Cors
  .use(cors())
  // Enable files upload
  .use(fileUpload({
    createParentPath: true
  }))
  .use(morgan('dev'))
  // Enable routes
  .use('/auth', authRoutes)
  .use('/api/user', userRoutes)
  .use('/api/room', roomRoutes)
  // Serve static files
  .use(express.static(path.join(__dirname, '../client')))
  // Enable history API
  .use(historyApiFallback())
  // Error middleware
//   .use(errors);

// Starts the HYPER10N server
function startServer() {
  // Start the Express server
  if(process.env.MODE == 'development') {
    const http = require("http").createServer(app)
    
    const io = require('socket.io')(http)
    initSocket(io)

    http.listen(process.env.PORT, () => {
      console.log(`⚡️ HEVACHAT server started: http://localhost:${process.env.PORT}`);
    });
  }

  if(process.env.MODE == 'production') {
    const fs = require("fs")

    var sslCerts = {
      key: fs.readFileSync("/etc/letsencrypt/live/pogrooz.ru/privkey.pem"),
      cert: fs.readFileSync("/etc/letsencrypt/live/pogrooz.ru/fullchain.pem")
    }

    const https = require("https").createServer(sslCerts, app)

    const io = require('socket.io')(https)
    initSocket(io)

    https.listen(8080);
  }
}

// Run the async function to start our server
startServer();