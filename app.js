const express = require('express')
const path = require("path");
const app = express()

// #############################################################################
// Logs all request paths and method
app.use(function (req, res, next) {
  res.set('x-timestamp', Date.now())
  res.set('x-powered-by', 'cyclic.sh')
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log({cookies: req.cookies, headers: req.headers})
  next();
});

// #############################################################################
// This configures static hosting for files in /public that have the extensions
// listed in the array.
var options = {
  dotfiles: 'ignore',
  etag: false,
  extensions: ['htm', 'html','css','js','ico','jpg','jpeg','png','svg'],
  index: ['cyclic-logo.png'],
  maxAge: '1m',
  redirect: false
}
app.use(express.static('public', options))

// app.use('*', async (req,res) => {
//   res.sendFile(path.resolve(__dirname,'./public/cyclic-logo.png'))
// })

// #############################################################################
// Catch all handler for all other request.
app.use('*', async (req,res) => {
  res.json({
    at: new Date().toISOString(),
    method: req.method,
    hostname: req.hostname,
    server_ip: ip,
    query: req.query,
    headers: req.headers,
    cookies: req.cookies,
    params: req.params,
    env: process.env
  }).end()
})

module.exports = app
