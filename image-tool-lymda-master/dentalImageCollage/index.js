const express = require("express");
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const router = require("./router");
const cors = require('cors')
const app = express();
const port = process.env.PORT || 8080;

const allowlist = ['http://localhost:8080', 'https://d24e4p0y2o78hs.cloudfront.net']
const corsOptionsDelegate = function (req, callback) {
    let corsOptions;
    if (allowlist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = {
            origin: true,
            optionsSuccessStatus: 200
        } // reflect (enable) the requested origin in the CORS response
    } else {
        corsOptions = {
            origin: false
        } // disable CORS for this request
    }
    callback(null, corsOptions) // callback expects two parameters: error and options
}

app.use(cors(corsOptionsDelegate))

app.use(function (req, res, next) {
        if (req.heders && typeof (req.heders["content-type"]) == "undefined") {
            req.heders["content-type"] = "application/json; charset=UTF-8"
        }
        next();
    })
    .use(bodyParser.urlencoded({
        extended: true
    }))
    .use(bodyParser.json({
        limit: "50mb"
    }))
    .use(methodOverride());

app.use(function (req, res, next) {
    if (req.headers && req.headers.Origin) {
        req.headers.origin = req.headers.Origin;
    };

    if (req.headers && req.headers.origin && req.headers.origin.indexOf("localhost:") > -1) {
        res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
        res.setHeader("Access-Control-Allow-Headers", "Authorization");
        res.setHeader("Vary", "Origin");
    };

    if (req.method.toLowerCase() == "options") {
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    };
    next();
});

app.use(router)
app.use(function (error, req, res, next) {
    console.error(error);
    const err = new Error("Not Found.");
    err.status = 404;
    next(err);
})

app.listen(port, () => {
    console.log("Server running on port " + port);
});