const express = require('express')
const path = require("path");
const axios = require('axios')
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
// Track each render to GA
const GA_TRACKING_ID = process.env.GA_TRACKING_ID || 'bob';

function newUID(){
  let r1 = (Math.random() + 1).toString(36).substring(2)
  let r2 = (Math.random() + 1).toString(36).substring(2)
  return `uid_${r1}${r2}`
}

async function track(uid, {category='', action='', label='', value=''}) {
  const data = {
    v: '1',
    tid: GA_TRACKING_ID,
    cid: uid,
    t: 'event',
    ec: category,
    ea: action,
    el: label,
    ev: value,
  };

  return await axios.get('http://www.google-analytics.com/debug/collect', {
    params: {
      data
    }
  })
};

app.use(async function(req,res,next) {
  let r = await track(newUID(), {
    action: 'request',
    value: req.path,
    category: 'view'
  })
  console.log(r.headers)
  next()
})

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
    query: req.query,
    headers: req.headers,
    cookies: req.cookies,
    params: req.params,
    env: process.env
  }).end()
})

module.exports = app

