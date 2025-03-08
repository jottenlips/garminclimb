import * as fs from "fs";
// @ts-ignore
import { GarminConnect } from "garmin-connect";
import { garminDataFolder } from ".";
export const download = async (
  username: string,
  password: string
): Promise<void> => {
  const GCClient = new GarminConnect({
    username,
    password,
  });

  await GCClient.login(username, password);

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
