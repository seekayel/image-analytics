const express = require('express')
const axios = require('axios')
const qs = require('qs')
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


function newUID(){
  let r1 = (Math.random() + 1).toString(36).substring(2)
  let r2 = (Math.random() + 1).toString(36).substring(2)
  return `uid_${r1}${r2}`
}

// #############################################################################
// Track each render to GA
const GA_TRACKING_ID = process.env.GA_TRACKING_ID;

async function track(uid, host, path) {
  // curl 'https://www.google-analytics.com/collect' \
  // -H 'authority: www.google-analytics.com' \
  // -H 'sec-ch-ua: "Google Chrome";v="93", " Not;A Brand";v="99", "Chromium";v="93"' \
  // -H 'sec-ch-ua-mobile: ?0' \
  // -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36' \
  // -H 'sec-ch-ua-platform: "macOS"' \
  // -H 'content-type: text/plain;charset=UTF-8' \
  // -H 'accept: */*' \
  // -H 'origin: https://ga-dev-tools.web.app' \
  // -H 'sec-fetch-site: cross-site' \
  // -H 'sec-fetch-mode: cors' \
  // -H 'sec-fetch-dest: empty' \
  // -H 'referer: https://ga-dev-tools.web.app/' \
  // -H 'accept-language: en-US,en;q=0.9' \
  // --data-raw 'v=1&t=pageview&tid=UA-199750669-4&cid=123&dp=%2F&dh=localhost' \
  // --compressed

  // fetch("https://www.google-analytics.com/collect", {
  //   "headers": {
  //     "accept": "*/*",
  //     "accept-language": "en-US,en;q=0.9",
  //     "content-type": "text/plain;charset=UTF-8",
  //     "sec-ch-ua": "\"Google Chrome\";v=\"93\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"93\"",
  //     "sec-ch-ua-mobile": "?0",
  //     "sec-ch-ua-platform": "\"macOS\"",
  //     "sec-fetch-dest": "empty",
  //     "sec-fetch-mode": "cors",
  //     "sec-fetch-site": "cross-site"
  //   },
  //   "referrer": "https://ga-dev-tools.web.app/",
  //   "referrerPolicy": "strict-origin-when-cross-origin",
  //   "body": "v=1&t=pageview&tid=UA-199750669-4&cid=123&dp=%2F&dh=localhost",
  //   "method": "POST",
  //   "mode": "cors"
  // });
  const params = {
    v: '1',
    tid: GA_TRACKING_ID,
    cid: uid,
    t: 'pageview',
    dt: 'Document Title',
    dh: host,
    dp: path,
  };

  return await axios.post('https://www.google-analytics.com/collect', qs.stringify(params))
};

app.use(async function(req,res,next) {
  let r = await track(newUID(), req.hostname, req.path)
  console.log(r.headers)
  console.log(r.body)
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

module.exports.app = app
module.exports.track = track
