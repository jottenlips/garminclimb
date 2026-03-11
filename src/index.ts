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

function loadData() {
  const indoorData = fs.readFileSync(path.join(garminDataFolder, "indoorClimbingActivities.json"), "utf8");
  const boulderData = fs.readFileSync(path.join(garminDataFolder, "boulderingActivities.json"), "utf8");
  let strengthData = "[]";
  try { strengthData = fs.readFileSync(path.join(garminDataFolder, "strengthTrainingActivities.json"), "utf8"); } catch (e) {}
  let runningData = "[]";
  try { runningData = fs.readFileSync(path.join(garminDataFolder, "runningActivities.json"), "utf8"); } catch (e) {}
  let cyclingData = "[]";
  try { cyclingData = fs.readFileSync(path.join(garminDataFolder, "cyclingActivities.json"), "utf8"); } catch (e) {}
  return `var INDOOR_DATA = ${indoorData};\nvar BOULDER_DATA = ${boulderData};\nvar STRENGTH_DATA = ${strengthData};\nvar CYCLING_DATA = ${cyclingData};\nvar RUNNING_DATA = ${runningData};\n`;
}

program
  .command("chartjs")
  .description("Output a standalone Chart.js HTML dashboard")
  .action(() => {
    const embedHtml = fs.readFileSync(path.join(__dirname, "..", "charts-embed.html"), "utf8");
    const dataScript = loadData();
    const output = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Garmin Stats</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 720px;
      margin: 0 auto;
      padding: 20px;
      background: #fafaf8;
    }
    h1 { color: #2d5016; margin-bottom: 16px; }
    h2 { color: #3a6b1e; margin: 24px 0 12px; }
    a { color: #2d5016; }
    hr { border: none; border-top: 2px solid #2d5016; margin: 24px 0; }
    @media (max-width: 600px) {
      body { padding: 12px; }
      h1 { font-size: 1.4em; }
      h2 { font-size: 1.15em; }
    }
  </style>
</head>
<body>
<script>${dataScript}</script>
${embedHtml}
</body>
</html>`;
    console.log(output);
  });

program
  .command("chartjs-embed")
  .description("Output an embeddable Chart.js HTML snippet for markdown files")
  .action(() => {
    const embedHtml = fs.readFileSync(path.join(__dirname, "..", "charts-embed.html"), "utf8");
    const dataScript = loadData();
    const output = embedHtml.replace(
      "<script>\n(function() {",
      `<script>\n${dataScript}(function() {`,
    );
    console.log(output);
  });

program.parse();
