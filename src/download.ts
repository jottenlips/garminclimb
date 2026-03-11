import * as fs from "fs";
// @ts-ignore
import { GarminConnect } from "garmin-connect";
import { garminDataFolder } from ".";
import {
  ActivitySubType,
  ActivityType,
} from "garmin-connect/dist/garmin/types/activity";
export const download = async (
  username: string,
  password: string
): Promise<void> => {
  const GCClient = new GarminConnect({
    username,
    password,
  });

  await GCClient.login(username, password);

  const activities = await GCClient.getActivities(
    0,
    6000,
    ActivityType.FitnessEquipment,
    // @ts-ignore
    "indoor_climbing"
  );

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

  // Download strength training activities
  const strengthActivities = await GCClient.getActivities(
    0,
    6000,
    ActivityType.FitnessEquipment,
    // @ts-ignore
    "strength_training"
  );

  const strengthTrainingActivities = strengthActivities?.filter(
    (activity: any) => activity?.activityType?.typeKey === "strength_training"
  );

  // Fetch detailed data for each strength activity to get exercise sets
  console.log(`Found ${strengthTrainingActivities?.length || 0} strength training activities, fetching details...`);
  const detailedActivities: any[] = [];
  for (const activity of strengthTrainingActivities || []) {
    try {
      const detail: any = await GCClient.getActivity({ activityId: activity.activityId });
      detailedActivities.push({
        ...activity,
        exerciseSets: detail?.exerciseSets || detail?.summarizedExerciseSets || (activity as any)?.summarizedExerciseSets || [],
        fullSummarizedExerciseSets: detail?.summarizedExerciseSets || (activity as any)?.summarizedExerciseSets || [],
      });
    } catch (e) {
      // fallback to list data if detail fetch fails
      detailedActivities.push(activity);
    }
  }

  fs.writeFileSync(
    `${garminDataFolder}/strengthTrainingActivities.json`,
    JSON.stringify(detailedActivities, null, 2)
  );
  console.log("Downloaded strength training activities from Garmin Connect");

  // Download running activities (street_running gets all running subtypes)
  const runningActivities = await GCClient.getActivities(
    0,
    6000,
    // @ts-ignore
    "running",
  );

  const filteredRunning = (runningActivities || []).filter(
    (a: any) => {
      const key = a?.activityType?.typeKey || "";
      return key.includes("running");
    }
  );

  fs.writeFileSync(
    `${garminDataFolder}/runningActivities.json`,
    JSON.stringify(filteredRunning, null, 2)
  );
  console.log(`Downloaded ${filteredRunning.length} running activities from Garmin Connect`);

  // Download cycling activities
  const cyclingActivities = await GCClient.getActivities(
    0,
    6000,
    // @ts-ignore
    "cycling",
  );

  const filteredCycling = (cyclingActivities || []).filter(
    (a: any) => {
      const key = a?.activityType?.typeKey || "";
      return key.includes("cycling") || key.includes("biking") || key === "virtual_ride";
    }
  );

  fs.writeFileSync(
    `${garminDataFolder}/cyclingActivities.json`,
    JSON.stringify(filteredCycling, null, 2)
  );
  console.log(`Downloaded ${filteredCycling.length} cycling activities from Garmin Connect`);
};
