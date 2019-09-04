import "es6-shim";
import "reflect-metadata";
import { Request, Response } from "express-serve-static-core";
import * as path from "path";
import * as bodyParser from "body-parser";
import * as moment from "moment";

const express = require("express");

// Allowed extensions list can be extended depending on your own needs
const allowedExt = [
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

class Server {
  public app: any;
  private port = 4200;

  public static bootstrap(): Server {
    return new Server();
  }

  constructor() {
    // Create expressjs application
    this.app = express();
    // Route our backend calls
    this.app.get("/api", (req, res) =>
      res.json({ application: "Branch Screen" })
    );

    // Redirect all the other resquests
    this.app.get("*", (req: Request, res: Response) => {
      console.log("Data requested......");
      if (allowedExt.filter(ext => req.url.indexOf(ext) > 0).length > 0) {
        res.sendFile(path.resolve(`dist/app/${req.url}`));
        console.log("resource Sent!");
      } else {
        res.sendFile(path.resolve("dist/app/index.html"));
        console.log("Page Sent!");
      }
    });

    // Depending on your own needs, this can be extended
    this.app.use(bodyParser.json({ limit: "5000mb" }));
    this.app.use(bodyParser.raw({ limit: "5000mb" }));
    this.app.use(bodyParser.text({ limit: "5000mb" }));
    this.app.use(
      bodyParser.urlencoded({
        limit: "5000mb",
        extended: true
      })
    );

    // Start the server on the provided port
    this.app.listen(this.port, () =>
      console.log("Welcome to the Branch server display, This will display the Timer/Hints/Music/Video");
    console.log(`Server is started ${this.port}`);
    console.log("To display go to:");
    console.log("Http://<This pc ip address>:4200/gamescreen/<Script name>/<Screen name> ");
    console.log("Closing this window will end the server");
    );

    // Catch errors
    this.app.on("error", (error: any) => {
      console.error(moment().format(), "ERROR", error);
    });

    process.on("uncaughtException", (error: any) => {
      console.log(moment().format(), error);
    });
  }
}

//Bootstrap the server, so it is actualy started
const server = Server.bootstrap();
export default server.app;
