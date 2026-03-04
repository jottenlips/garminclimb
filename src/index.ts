#! /usr/bin/env node

import { program } from "commander";
import * as fs from "fs";
const os = require("os");
const path = require("path");
const homeDir = os.homedir();
export const garminDataFolder = path.join(homeDir, ".gc_data");
import { download } from "./download";
import { parse } from "./parse";

program
  .command("download")
  .description("Download activities from Garmin Connect")
  .option("-u, --username <username>", "Garmin Connect username")
  .option("-p, --password <password>", "Garmin Connect password")
  .action((options) => {
    const GARMIN_USERNAME = options.username;
    const GARMIN_PASSWORD = options.password;
    download(GARMIN_USERNAME, GARMIN_PASSWORD);
  });

program
  .command("charts")
  .description("Parse activities from Garmin Connect")
  .action(() => {
    parse();
  });

program
  .command("chartjs")
  .description("Output a standalone Chart.js HTML dashboard")
  .action(() => {
    const htmlPath = path.join(__dirname, "..", "charts.html");
    const html = fs.readFileSync(htmlPath, "utf8");
    const indoorData = fs.readFileSync(
      path.join(garminDataFolder, "indoorClimbingActivities.json"),
      "utf8",
    );
    const boulderData = fs.readFileSync(
      path.join(garminDataFolder, "boulderingActivities.json"),
      "utf8",
    );
    const output = html.replace(
      "<script>",
      `<script>\nvar INDOOR_DATA = ${indoorData};\nvar BOULDER_DATA = ${boulderData};\n`,
    );
    console.log(output);
  });

program
  .command("chartjs-embed")
  .description("Output an embeddable Chart.js HTML snippet for markdown files")
  .action(() => {
    const htmlPath = path.join(__dirname, "..", "charts-embed.html");
    const html = fs.readFileSync(htmlPath, "utf8");
    const indoorData = fs.readFileSync(
      path.join(garminDataFolder, "indoorClimbingActivities.json"),
      "utf8",
    );
    const boulderData = fs.readFileSync(
      path.join(garminDataFolder, "boulderingActivities.json"),
      "utf8",
    );
    const output = html.replace(
      "<script>\n(function() {",
      `<script>\nvar INDOOR_DATA = ${indoorData};\nvar BOULDER_DATA = ${boulderData};\n(function() {`,
    );
    console.log(output);
  });

program.parse();
