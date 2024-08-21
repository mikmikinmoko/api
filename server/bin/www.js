#!/user/bin/env node
// import "core-js/stable";
/**
 * Module dependencies.
 */
import app from "../config/express";

const debug = require("debug")("wb:server");
import http from "http";
import https from "https";
import fs from "fs";
import path from "path";

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);
/**
 * Create HTTP server.
 */

const server = http.createServer(app);
// const privateKeys = fs.readFileSync(
//   path.resolve(
//     "/etc/letsencrypt/live/office.dynamicglobalsoft.com/privkey.pem"
//   ),
//   "utf8"
// );
// const cert = fs.readFileSync(
//   path.resolve("/etc/letsencrypt/live/office.dynamicglobalsoft.com/cert.pem"),
//   "utf8"
// );
// const ca = fs.readFileSync(
//   path.resolve("/etc/letsencrypt/live/office.dynamicglobalsoft.com/chain.pem"),
//   "utf8"
// );
// const server = https.createServer(
//   { key: privateKeys, cert: cert, ca: ca },
//   app
// );

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
  debug(`Listening on ${bind}`);

  let address;
  let interfaces = require("os").networkInterfaces();
  for (let devName in interfaces) {
    let iface = interfaces[devName];

    for (let i = 0; i < iface.length; i++) {
      let alias = iface[i];
      if (
        alias.family === "IPv4" &&
        alias.address !== "127.0.0.1" &&
        !alias.internal
      )
        address = alias.address;
    }
  }

  console.log("\x1b[33m");
  console.log("---------------------------");
  console.log("LISTENING ON");
  console.log(`Address: ${address}`);
  console.log(`Port: ${addr.port}`);
  console.log("---------------------------");
  console.log("\x1b[0m");
}
