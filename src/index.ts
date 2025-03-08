#! /usr/bin/env node

import { program } from "commander";
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
    console.log("Parsing activities...");
    parse();
  });

program.parse();
