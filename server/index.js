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
// const adminPanel = require('./controllers/AdminController')
const formidableMiddleware = require('express-formidable');

// const errors = require('./middleware/errors');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const roomRoutes = require('./routes/room');
const dialogRoutes = require('./routes/dialog');
const notificationRoutes = require('./routes/notification');
const callRoutes = require('./routes/call')
const paymentRoutes = require('./routes/payment')

// Use Express as our web server
const app = express();

app
  // Parse JSON
  // .use('/admin', formidableMiddleware(), adminPanel)
  .use(bodyParser.json())
  // Enable files upload
  .use(fileUpload({
    createParentPath: true
  }))
  .use(morgan('dev'))
  // Cors
  .use(cors())
  // Enable routes
  .use('/auth', authRoutes)
  .use('/api/user', userRoutes)
  .use('/api/room', roomRoutes)
  .use('/api/dialog', dialogRoutes)
  .use('/api/notification', notificationRoutes)
  .use('/api/call', callRoutes)
  .use('/api/payment', paymentRoutes)
  // Serve static files
  .use('/media', express.static(path.join(__dirname, './uploads')))
  // .use(formidableMiddleware({ extended: false }))
  
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

    const redisAdapter = require('socket.io-redis');

    io.adapter(redisAdapter({ host: 'localhost', port: 6379 }));

    initSocket(io)

    http.listen(process.env.PORT, () => {
      console.log(`⚡️ HEVACHAT server started: http://localhost:${process.env.PORT}`);
    });
  }

  if(process.env.MODE == 'production') {
    const fs = require("fs")

    var sslCerts = {
      key: fs.readFileSync("/etc/letsencrypt/live/romadevtest.tk/privkey.pem"),
      cert: fs.readFileSync("/etc/letsencrypt/live/romadevtest.tk/fullchain.pem")
    }

    const https = require("https").createServer(sslCerts, app)

    const io = require('socket.io')(https)

    const redisAdapter = require('socket.io-redis');

    io.adapter(redisAdapter({ host: 'localhost', port: 6379 }));

    initSocket(io)

    https.listen(8080);
  }
}

// Run the async function to start our server
startServer();