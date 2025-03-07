#! /usr/bin/env node

import * as fs from "fs";

import { program } from "commander";
const os = require("os");
const path = require("path");
const homeDir = os.homedir();
export const credentialsPath = path.join(homeDir, ".gc_credentials");
export const garminDataFolder = path.join(homeDir, ".gc_data");
import { download } from "./download";
import { parse } from "./parse";

program
  .command("login")
  .option("-u, --username <username>", "Garmin Connect username")
  .option("-p, --password <password>", "Garmin Connect password")
  .description("Set GARMIN_USERNAME and GARMIN_PASSWORD")
  .action((options) => {
    const GARMIN_USERNAME = options.username;
    const GARMIN_PASSWORD = options.password;
    const newEnv = `GARMIN_USERNAME=${GARMIN_USERNAME}\nGARMIN_PASSWORD=${GARMIN_PASSWORD}`;
    console.log("Setting credentials...");
    fs.writeFileSync(credentialsPath, newEnv);
    console.log("Credentials set!");
  });

program
  .command("download")
  .description("Download activities from Garmin Connect")
  .action(() => {
    download();
  });

program.command("charts").description("Parse activities from Garmin Connect").action(() => {
  console.log("Parsing activities...");
  parse();
});


program.parse();
