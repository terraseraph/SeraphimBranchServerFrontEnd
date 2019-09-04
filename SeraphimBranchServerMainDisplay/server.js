"use strict";
exports.__esModule = true;
require("es6-shim");
require("reflect-metadata");
var path = require("path");
var bodyParser = require("body-parser");
var moment = require("moment");
var express = require("express");
// Allowed extensions list can be extended depending on your own needs
var allowedExt = [
    ".js",
    ".ico",
    ".css",
    ".png",
    ".jpg",
    ".woff2",
    ".woff",
    ".ttf",
    ".svg"
];
var Server = /** @class */ (function () {
    function Server() {
        this.port = 4200;
        // Create expressjs application
        this.app = express();
        // Route our backend calls
        this.app.get("/api", function (req, res) {
            return res.json({ application: "Branch Screen" });
        });
        // Redirect all the other resquests
        this.app.get("*", function (req, res) {
            console.log("Data requested......");
            if (allowedExt.filter(function (ext) { return req.url.indexOf(ext) > 0; }).length > 0) {
                res.sendFile(path.resolve("dist/app/" + req.url));
                console.log("resource Sent!");
            }
            else {
                res.sendFile(path.resolve("dist/app/index.html"));
                console.log("Page Sent!");
            }
        });
        // Depending on your own needs, this can be extended
        this.app.use(bodyParser.json({ limit: "5000mb" }));
        this.app.use(bodyParser.raw({ limit: "5000mb" }));
        this.app.use(bodyParser.text({ limit: "5000mb" }));
        this.app.use(bodyParser.urlencoded({
            limit: "5000mb",
            extended: true
        }));
        // Start the server on the provided port
        this.app.listen(this.port, function () {
            return console.log("Welcome to the Branch server display, This will display the Timer/Hints/Music/Video");
        });
        console.log("Server is started " + this.port);
        console.log("To display go to:");
        console.log("Http://<This pc ip address>:4200/gamescreen/<Script name>/<Screen name> ");
        console.log("Closing this window will end the server");
        ;
        // Catch errors
        this.app.on("error", function (error) {
            console.error(moment().format(), "ERROR", error);
        });
        process.on("uncaughtException", function (error) {
            console.log(moment().format(), error);
        });
    }
    Server.bootstrap = function () {
        return new Server();
    };
    return Server;
}());
//Bootstrap the server, so it is actualy started
var server = Server.bootstrap();
exports["default"] = server.app;
