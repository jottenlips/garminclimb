import * as dotenv from "dotenv";

const path = require("path");
const homeDir = require("os").homedir();
export const credentialsPath = path.join(homeDir, ".gc_credentials");
dotenv.config({ path: credentialsPath });

import * as fs from "fs";
// @ts-ignore
import { GarminConnect } from "garmin-connect";
import { garminDataFolder } from ".";
export const download = async (): Promise<void> => {
  const GCClient = new GarminConnect({
    username: process.env.GARMIN_USERNAME || "",
    password: process.env.GARMIN_PASSWORD || "",
  });

  await GCClient.login(
    process.env.GARMIN_USERNAME || "",
    process.env.GARMIN_PASSWORD || ""
  );
  
  const activities = await GCClient.getActivities();

  const indoorClimbingActivities = activities?.filter(
    (activity) => activity?.activityType?.typeKey === "indoor_climbing"
  );

  if (!fs.existsSync(garminDataFolder)) {
    fs.mkdirSync(garminDataFolder);
  }
  fs.writeFileSync(
    `${garminDataFolder}/indoorClimbingActivities.json`,
    JSON.stringify(indoorClimbingActivities, null, 2)
  );

  const boulderingActivities = activities?.filter(
    (activity) => activity?.activityType?.typeKey === "bouldering"
  );

  fs.writeFileSync(
    `${garminDataFolder}/boulderingActivities.json`,
    JSON.stringify(boulderingActivities, null, 2)
  );
  console.log("Downloaded climbing activities from Garmin Connect");
};
