import * as fs from "fs";
import plot from "simple-ascii-chart";

type YDSGradeMap = { [key: string]: number };
import { garminDataFolder } from ".";

const YEAR_WIDTH = 12 * 10;
const CHART_WIDTH_PER_DATA_POINT = 12;

const YDS_GRADE_MAP: YDSGradeMap = {
  _5_6: 0,
  _5_7: 1,
  _5_8: 2,
  _5_9: 3,
  _5_10A: 4,
  _5_10_MINUS: 4,
  _5_10B: 5,
  _5_10: 5,
  _5_10C: 6,
  _5_10_PLUS: 7,
  _5_10D: 7,
  _5_11A: 8,
  _5_11_MINUS: 8,
  _5_11B: 9,
  _5_11: 9,
  _5_11C: 10,
  _5_11_PLUS: 11,
  _5_11D: 11,
  _5_12A: 12,
  _5_12_MINUS: 12,
  _5_12B: 13,
  _5_12: 13,
  _5_12C: 14,
  _5_12_PLUS: 15,
  _5_12D: 15,
  _5_13A: 16,
  _5_13_MINUS: 16,
  _5_13B: 17,
  _5_13: 17,
  _5_13C: 18,
  _5_13_PLUS: 19,
  _5_13D: 19,
  _5_14A: 20,
  _5_14_MINUS: 20,
  _5_14B: 21,
  _5_14: 21,
  _5_14C: 22,
  _5_14_PLUS: 23,
  _5_14D: 23,
  _5_15A: 24,
  _5_15_MINUS: 24,
  _5_15B: 25,
  _5_15: 25,
  _5_15C: 26,
  _5_15_PLUS: 27,
  _5_15D: 27,
  _5_16A: 28,
  _5_16_MINUS: 28,
  _5_16B: 29,
  _5_16: 29,
  _5_16C: 30,
  _5_16_PLUS: 31,
  _5_16D: 31,
};

const numberToGrade = (number: number): string => {
  const grade =
    Object.keys(YDS_GRADE_MAP)
      .find((key) => YDS_GRADE_MAP[key] === number)
      ?.replace(/_/g, "")
      ?.replace("PLUS", "D")
      ?.replace("MINUS", "A") || "";
  return grade.padEnd(8, " ");
};

export const parse = async () => {
  const indoorClimbingActivities = JSON.parse(
    fs.readFileSync(
      `${garminDataFolder}/indoorClimbingActivities.json`,
      "utf8",
    ),
  );
  // ?.reverse();

  const activeIndoorSplits = indoorClimbingActivities.map((activity: any) =>
    activity?.splitSummaries?.[0]?.splitType === "CLIMB_ACTIVE"
      ? { ...activity?.splitSummaries?.[0], start: activity?.startTimeLocal }
      : { ...activity?.splitSummaries?.[1], start: activity?.startTimeLocal },
  );

  const boulderingActivities = JSON.parse(
    fs.readFileSync(`${garminDataFolder}/boulderingActivities.json`, "utf8"),
  );
  // ?.reverse();

  const activeBoulderingSplits = boulderingActivities
    .map((activity: any) =>
      activity?.splitSummaries?.[0]?.splitType === "CLIMB_ACTIVE"
        ? { ...activity?.splitSummaries?.[0], start: activity?.startTimeLocal }
        : { ...activity?.splitSummaries?.[1], start: activity?.startTimeLocal },
    )
    .filter((split: any) => split?.noOfSplits !== 1);

  const metersToFeet = (meters: number): number => Math.round(meters * 3.28084);

  const generateChart = (data: any[], title: string, options: any) => {
    console.log(title);
    console.log(plot(data, options));
  };

  console.log("```");

  const totalFeetByMonthYear = activeIndoorSplits
    // ?.reverse()
    ?.reduce((acc: any, split: any) => {
      const month = split?.start?.split(" ")[0].split("-")[1];
      const year = split?.start?.split(" ")[0].split("-")[0];
      acc[`${year}-${month}`] =
        (acc[`${year}-${month}`] || 0) + metersToFeet(split?.totalAscent);
      return acc;
    }, {});

  // each boulder is ~8 feet
  const totalFeetByMonthYearBouldering = activeBoulderingSplits
    // ?.reverse()
    ?.reduce((acc: any, split: any) => {
      const month = split?.start?.split(" ")[0].split("-")[1];
      const year = split?.start?.split(" ")[0].split("-")[0];
      acc[`${year}-${month}`] =
        (acc[`${year}-${month}`] || 0) + split?.noOfSplits * 10;
      return acc;
    }, {});

  const totalFeetByMonthYearCombined = Object.keys(totalFeetByMonthYear).reduce(
    (acc: any, key: string) => {
      acc[key] =
        totalFeetByMonthYear[key] + (totalFeetByMonthYearBouldering[key] || 0);
      return acc;
    },
    {},
  );

  const totalFeet = Object.values(totalFeetByMonthYearCombined).reduce(
    //@ts-ignore
    (sum: number, feet: number) => sum + feet,
    0,
  );

  console.log(`All Time Total Feet Climbed: ${totalFeet} ft`);
  const totalNumberOfRoutes = activeIndoorSplits?.reduce(
    (acc: any, split: any) => acc + split?.numClimbSends,
    0,
  );
  console.log(
    `All Time Total Number of Routes Sent Without Falling: ${totalNumberOfRoutes}`,
  );
  const totalNumberOfFalls = activeIndoorSplits?.reduce(
    (acc: any, split: any) => acc + split?.numFalls,
    0,
  );
  console.log(`All Time Total Number of Falls: ${totalNumberOfFalls}`);

  const averageGrade = Math.round(
    activeIndoorSplits?.reduce(
      (acc: any, split: any) =>
        acc + YDS_GRADE_MAP?.[split?.maxGradeValue?.valueKey],
      0,
    ) / activeIndoorSplits?.length,
  );
  console.log(`All Time Average Max Grade: ${numberToGrade(averageGrade)}`);

  const maxGrade = Math.max(
    ...activeIndoorSplits?.map(
      (split: any) => YDS_GRADE_MAP?.[split?.maxGradeValue?.valueKey],
    ),
  );
  console.log(`All Time Max Grade: ${numberToGrade(maxGrade)}`);

  const totalBoulders = activeBoulderingSplits?.reduce(
    (acc: any, split: any) => acc + split?.noOfSplits,
    0,
  );
  console.log(`All Time Total Number of Boulders Climbed: ${totalBoulders}`);

  const averageBoulderGrade = Math.round(
    activeBoulderingSplits?.reduce(
      (acc: any, split: any) =>
        acc + parseInt(split?.maxGradeValue?.valueKey?.replace(/\D/g, "")),
      0,
    ) / activeBoulderingSplits?.length,
  );
  console.log(`All Time Average Max Boulder Grade: V${averageBoulderGrade}`);

  const maxBoulderGrade = Math.max(
    ...activeBoulderingSplits?.map((split: any) =>
      parseInt(split?.maxGradeValue?.valueKey?.replace(/\D/g, "")),
    ),
  );
  console.log(`All Time Max Boulder Grade: V${maxBoulderGrade}\n`);

  console.log(
    "Total Number of Feet this month",
    totalFeetByMonthYearCombined[Object.keys(totalFeetByMonthYearCombined)[0]],
    "\n",
  );

  generateChart(
    Object.keys(totalFeetByMonthYearCombined).map((month: string, index) => [
      index,
      totalFeetByMonthYearCombined[month],
    ]),
    "Total Feet By Month Combined",
    {
      height: 20,
      width: YEAR_WIDTH,
      barChart: true,
      formatter: (value: number, { axis }: any) =>
        axis === "y" ? value : Object.keys(totalFeetByMonthYearCombined)[value],
    },
  );

  generateChart(
    Object.keys(totalFeetByMonthYear).map((month: string, index) => [
      index,
      totalFeetByMonthYear[month],
    ]),
    "Total Route Feet By Month",
    {
      height: 10,
      width: YEAR_WIDTH,
      barChart: true,
      formatter: (value: number, { axis }: any) =>
        axis === "y" ? value : Object.keys(totalFeetByMonthYear)[value],
    },
  );

  generateChart(
    Object.keys(totalFeetByMonthYearBouldering).map((month: string, index) => [
      index,
      totalFeetByMonthYearBouldering[month],
    ]),
    "Approx Boulder Feet By Month",
    {
      height: 10,
      width: YEAR_WIDTH,
      barChart: true,
      formatter: (value: number, { axis }: any) =>
        axis === "y"
          ? value
          : Object.keys(totalFeetByMonthYearBouldering)[value],
    },
  );

  // max rope grade per month
  const maxGradeByMonthYear = activeIndoorSplits?.reduce(
    (acc: any, split: any) => {
      const month = split?.start?.split(" ")[0].split("-")[1];
      const year = split?.start?.split(" ")[0].split("-")[0];
      acc[`${year}-${month}`] = Math.max(
        acc[`${year}-${month}`] || 0,
        YDS_GRADE_MAP?.[split?.maxGradeValue?.valueKey],
      );
      return acc;
    },
    {},
  );

  generateChart(
    Object.keys(maxGradeByMonthYear).map((month: string, index) => [
      index,
      maxGradeByMonthYear[month],
    ]),
    "Max Rope Grade By Month",
    {
      // height: 20,
      width: YEAR_WIDTH,
      formatter: (value: number, { axis }: any) =>
        axis === "y"
          ? `${numberToGrade(value)}`
          : Object.keys(maxGradeByMonthYear)[value],
    },
  );

  const maxBoulderGradeByMonthYear = activeBoulderingSplits?.reduce(
    (acc: any, split: any) => {
      const month = split?.start?.split(" ")[0].split("-")[1];
      const year = split?.start?.split(" ")[0].split("-")[0];
      acc[`${year}-${month}`] = Math.max(
        acc[`${year}-${month}`] || 0,
        parseInt(split?.maxGradeValue?.valueKey?.replace(/\D/g, "")),
      );
      return acc;
    },
    {},
  );

  generateChart(
    Object.keys(maxBoulderGradeByMonthYear).map((month: string, index) => [
      index,
      maxBoulderGradeByMonthYear[month],
    ]),
    "Max Boulder Grade By Month",
    {
      // height: 20,
      width: YEAR_WIDTH,
      formatter: (value: number, { axis }: any) =>
        axis === "y"
          ? `V${value}`
          : Object.keys(maxBoulderGradeByMonthYear)[value],
    },
  );

  const numberOfRopeSessionsByMonthYear = activeIndoorSplits?.reduce(
    (acc: any, split: any) => {
      const month = split?.start?.split(" ")[0].split("-")[1];
      const year = split?.start?.split(" ")[0].split("-")[0];
      acc[`${year}-${month}`] = (acc[`${year}-${month}`] || 0) + 1;
      return acc;
    },
    {},
  );

  generateChart(
    Object.keys(numberOfRopeSessionsByMonthYear).map((month: string, index) => [
      index,
      numberOfRopeSessionsByMonthYear[month],
    ]),
    "Number of Rope Sessions By Month",
    {
      // height: 20,
      width: YEAR_WIDTH,
      formatter: (value: number, { axis }: any) =>
        axis === "y"
          ? value
          : Object.keys(numberOfRopeSessionsByMonthYear)[value],
    },
  );

  const numberOfBoulderSessionsByMonthYear = activeBoulderingSplits?.reduce(
    (acc: any, split: any) => {
      const month = split?.start?.split(" ")[0].split("-")[1];
      const year = split?.start?.split(" ")[0].split("-")[0];
      acc[`${year}-${month}`] = (acc[`${year}-${month}`] || 0) + 1;
      return acc;
    },
    {},
  );

  generateChart(
    Object.keys(numberOfBoulderSessionsByMonthYear).map(
      (month: string, index) => [
        index,
        numberOfBoulderSessionsByMonthYear[month],
      ],
    ),
    "Number of Boulder Sessions By Month",
    {
      // height: 20,
      width: YEAR_WIDTH,
      formatter: (value: number, { axis }: any) =>
        axis === "y"
          ? value
          : Object.keys(numberOfBoulderSessionsByMonthYear)[value],
    },
  );

  // === YEARLY GRAPHS ===
  console.log("\n\nYearly Stats ===============================\n");

  const aggregateByYear = (monthlyData: any, mode: "sum" | "max" = "sum"): [string, number][] => {
    const map: any = {};
    Object.keys(monthlyData).forEach((key: string) => {
      const year = key.split("-")[0];
      if (mode === "max") {
        map[year] = Math.max(map[year] || 0, monthlyData[key]);
      } else {
        map[year] = (map[year] || 0) + monthlyData[key];
      }
    });
    // Sort descending (2026 first) - return array to avoid JS integer key reordering
    return Object.keys(map)
      .sort((a, b) => parseInt(b) - parseInt(a))
      .map(k => [k, map[k]]);
  };

  const totalFeetByYearCombined = aggregateByYear(totalFeetByMonthYearCombined);
  generateChart(
    totalFeetByYearCombined.map(([, val], index) => [index, val]),
    "Total Feet By Year Combined",
    {
      height: 15,
      width: totalFeetByYearCombined.length * 20,
      barChart: true,
      formatter: (value: number, { axis }: any) =>
        axis === "y" ? value : totalFeetByYearCombined[value]?.[0],
    },
  );

  const totalFeetByYear = aggregateByYear(totalFeetByMonthYear);
  generateChart(
    totalFeetByYear.map(([, val], index) => [index, val]),
    "Total Route Feet By Year",
    {
      height: 10,
      width: totalFeetByYear.length * 20,
      barChart: true,
      formatter: (value: number, { axis }: any) =>
        axis === "y" ? value : totalFeetByYear[value]?.[0],
    },
  );

  const totalBoulderFeetByYear = aggregateByYear(totalFeetByMonthYearBouldering);
  generateChart(
    totalBoulderFeetByYear.map(([, val], index) => [index, val]),
    "Approx Boulder Feet By Year",
    {
      height: 10,
      width: totalBoulderFeetByYear.length * 20,
      barChart: true,
      formatter: (value: number, { axis }: any) =>
        axis === "y" ? value : totalBoulderFeetByYear[value]?.[0],
    },
  );

  const maxGradeByYear = aggregateByYear(maxGradeByMonthYear, "max");
  generateChart(
    maxGradeByYear.map(([, val], index) => [index, val]),
    "Max Rope Grade By Year",
    {
      width: maxGradeByYear.length * 20,
      formatter: (value: number, { axis }: any) =>
        axis === "y"
          ? `${numberToGrade(value)}`
          : maxGradeByYear[value]?.[0],
    },
  );

  const maxBoulderGradeByYear = aggregateByYear(maxBoulderGradeByMonthYear, "max");
  generateChart(
    maxBoulderGradeByYear.map(([, val], index) => [index, val]),
    "Max Boulder Grade By Year",
    {
      width: maxBoulderGradeByYear.length * 20,
      formatter: (value: number, { axis }: any) =>
        axis === "y"
          ? `V${value}`
          : maxBoulderGradeByYear[value]?.[0],
    },
  );

  const ropeSessionsByYear = aggregateByYear(numberOfRopeSessionsByMonthYear);
  generateChart(
    ropeSessionsByYear.map(([, val], index) => [index, val]),
    "Number of Rope Sessions By Year",
    {
      height: 10,
      width: ropeSessionsByYear.length * 20,
      barChart: true,
      formatter: (value: number, { axis }: any) =>
        axis === "y" ? value : ropeSessionsByYear[value]?.[0],
    },
  );

  const boulderSessionsByYear = aggregateByYear(numberOfBoulderSessionsByMonthYear);
  generateChart(
    boulderSessionsByYear.map(([, val], index) => [index, val]),
    "Number of Boulder Sessions By Year",
    {
      height: 10,
      width: boulderSessionsByYear.length * 20,
      barChart: true,
      formatter: (value: number, { axis }: any) =>
        axis === "y" ? value : boulderSessionsByYear[value]?.[0],
    },
  );

  console.log("```");

  console.log("```");

  generateChart(
    activeIndoorSplits
      // ?.reverse()
      .map((split: any, index: number) => [
        index,
        YDS_GRADE_MAP?.[split?.maxGradeValue?.valueKey],
      ]),
    "Max Grade Per Session Indoor Climbing",
    {
      width: activeIndoorSplits?.length * CHART_WIDTH_PER_DATA_POINT,
      formatter: (value: number, { axis }: any) =>
        axis === "y"
          ? `${numberToGrade(value)}`
          : activeIndoorSplits[value]?.start?.split(" ")[0],
    },
  );

  generateChart(
    activeIndoorSplits?.map((split: any, index: number) => [
      index,
      split?.numClimbSends,
    ]),
    "Number of Sends per session",
    {
      height: 20,
      width: activeIndoorSplits?.length * CHART_WIDTH_PER_DATA_POINT,
      formatter: (value: number, { axis }: any) =>
        axis === "y" ? value : activeIndoorSplits[value]?.start?.split(" ")[0],
    },
  );

  generateChart(
    activeIndoorSplits?.map((split: any, index: number) => [
      index,
      metersToFeet(split?.totalAscent),
    ]),
    "Total Feet Per Session (approximate, garmin doesn't track boulder completion vs attempts with this API)",
    {
      height: 10,
      width: activeIndoorSplits?.length * CHART_WIDTH_PER_DATA_POINT,
      barChart: true,
      formatter: (value: number, { axis }: any) =>
        axis === "y" ? value : activeIndoorSplits[value]?.start?.split(" ")[0],
    },
  );

  generateChart(
    activeIndoorSplits?.map((split: any, index: number) => [
      index,
      Math.round(split?.duration / 60),
    ]),
    "Active Minutes Per Session",
    {
      height: 20,
      barChart: true,
      width: activeIndoorSplits?.length * CHART_WIDTH_PER_DATA_POINT,
      formatter: (value: number, { axis }: any) =>
        axis === "y" ? value : activeIndoorSplits[value]?.start?.split(" ")[0],
    },
  );

  console.log("\n\nBouldering===============================");
  generateChart(
    activeBoulderingSplits?.map((split: any, index: number) => [
      index,
      parseInt(split?.maxGradeValue?.valueKey?.replace(/\D/g, "")),
    ]),
    "Max Grade Per Session Bouldering",
    {
      height: 10,
      width: activeBoulderingSplits?.length * CHART_WIDTH_PER_DATA_POINT,
      formatter: (value: number, { axis }: any) =>
        axis === "y"
          ? `V${value}`
          : activeBoulderingSplits[value]?.start?.split(" ")[0],
    },
  );

  generateChart(
    activeBoulderingSplits?.map((split: any, index: number) => [
      index,
      split?.noOfSplits,
    ]),
    "Number of Splits per session (garmin doesn't track boulder completion vs attempts with this API)",
    {
      height: 10,
      barChart: true,
      width: activeBoulderingSplits?.length * CHART_WIDTH_PER_DATA_POINT,
      formatter: (value: number, { axis }: any) =>
        axis === "y"
          ? value
          : activeBoulderingSplits[value]?.start?.split(" ")[0],
    },
  );

  generateChart(
    activeBoulderingSplits?.map((split: any, index: number) => [
      index,
      Math.round(split?.duration / 60),
    ]),
    "Active Minutes Bouldering Per Session",
    {
      height: 10,
      barChart: true,
      width: activeBoulderingSplits?.length * CHART_WIDTH_PER_DATA_POINT,
      formatter: (value: number, { axis }: any) =>
        axis === "y"
          ? value
          : activeBoulderingSplits[value]?.start?.split(" ")[0],
    },
  );

  console.log("```");

  // === STRENGTH TRAINING ===
  try {
    const strengthActivities = JSON.parse(
      fs.readFileSync(`${garminDataFolder}/strengthTrainingActivities.json`, "utf8"),
    );

    if (strengthActivities?.length > 0) {
      console.log("\n```");
      console.log("\n\nStrength Training ===============================\n");

      // Extract exercise data from each activity
      // Garmin summarizedExerciseSets uses: category, subCategory, maxWeight (milligrams), reps, volume (milligrams), sets
      const mgToLbs = (mg: number): number => Math.round((mg / 1000) * 2.20462);

      const exercisePatterns: { [key: string]: { label: string; match: (cat: string, sub: string) => boolean } } = {
        bench: {
          label: "Bench Press",
          match: (cat, sub) => cat === "BENCH_PRESS",
        },
        squat: {
          label: "Back Squat",
          match: (cat, sub) => cat === "SQUAT" && (sub || "").includes("BACK_SQUAT"),
        },
        pullup: {
          label: "Weighted Pull-Up",
          match: (cat, sub) => cat === "PULL_UP",
        },
        rdl: {
          label: "Romanian Deadlift",
          match: (cat, sub) => cat === "DEADLIFT" && (sub || "").includes("ROMANIAN"),
        },
      };

      type SessionData = { date: string; maxWeight: number; totalVolume: number; sets: number; totalReps: number };
      const exerciseData: { [key: string]: SessionData[] } = { bench: [], squat: [], pullup: [], rdl: [] };

      for (const activity of strengthActivities) {
        const date = activity?.startTimeLocal?.split(" ")[0] || "";
        const exercises = activity?.exerciseSets || activity?.fullSummarizedExerciseSets || activity?.summarizedExerciseSets || [];

        for (const exKey of Object.keys(exercisePatterns)) {
          const pattern = exercisePatterns[exKey];

          for (const ex of exercises) {
            const cat = (ex?.category || "").toUpperCase();
            const sub = (ex?.subCategory || "").toUpperCase();

            if (pattern.match(cat, sub)) {
              exerciseData[exKey].push({
                date,
                maxWeight: mgToLbs(ex?.maxWeight || 0),
                totalVolume: mgToLbs(ex?.volume || 0),
                sets: ex?.sets || 0,
                totalReps: ex?.reps || 0,
              });
            }
          }
        }
      }

      for (const exKey of Object.keys(exercisePatterns)) {
        const pattern = exercisePatterns[exKey];
        const sessions = exerciseData[exKey];
        if (sessions.length === 0) continue;

        console.log(`\n${pattern.label} (${sessions.length} sessions)`);
        console.log(`  All Time Max Weight: ${Math.max(...sessions.map(s => s.maxWeight))} lbs`);
        console.log(`  All Time Max Session Volume: ${Math.max(...sessions.map(s => s.totalVolume))} lbs`);
        console.log(`  Average Max Weight: ${Math.round(sessions.reduce((a, s) => a + s.maxWeight, 0) / sessions.length)} lbs`);
        console.log(`  Total Reps All Time: ${sessions.reduce((a, s) => a + s.totalReps, 0)}\n`);

        // Per-session max weight
        generateChart(
          sessions.map((s, i) => [i, s.maxWeight]),
          `${pattern.label} - Max Weight Per Session (lbs)`,
          {
            width: sessions.length * CHART_WIDTH_PER_DATA_POINT,
            formatter: (value: number, { axis }: any) =>
              axis === "y" ? value : sessions[value]?.date,
          },
        );

        // Per-session volume
        generateChart(
          sessions.map((s, i) => [i, s.totalVolume]),
          `${pattern.label} - Total Volume Per Session (lbs)`,
          {
            height: 10,
            width: sessions.length * CHART_WIDTH_PER_DATA_POINT,
            barChart: true,
            formatter: (value: number, { axis }: any) =>
              axis === "y" ? value : sessions[value]?.date,
          },
        );

        // Monthly max weight
        const maxWeightByMonth = sessions.reduce((acc: any, s) => {
          const parts = s.date.split("-");
          const key = `${parts[0]}-${parts[1]}`;
          acc[key] = Math.max(acc[key] || 0, s.maxWeight);
          return acc;
        }, {});

        generateChart(
          Object.keys(maxWeightByMonth).map((month, i) => [i, maxWeightByMonth[month]]),
          `${pattern.label} - Max Weight By Month (lbs)`,
          {
            width: YEAR_WIDTH,
            formatter: (value: number, { axis }: any) =>
              axis === "y" ? value : Object.keys(maxWeightByMonth)[value],
          },
        );

        // Monthly volume
        const volumeByMonth = sessions.reduce((acc: any, s) => {
          const parts = s.date.split("-");
          const key = `${parts[0]}-${parts[1]}`;
          acc[key] = (acc[key] || 0) + s.totalVolume;
          return acc;
        }, {});

        generateChart(
          Object.keys(volumeByMonth).map((month, i) => [i, volumeByMonth[month]]),
          `${pattern.label} - Total Volume By Month (lbs)`,
          {
            height: 10,
            width: YEAR_WIDTH,
            barChart: true,
            formatter: (value: number, { axis }: any) =>
              axis === "y" ? value : Object.keys(volumeByMonth)[value],
          },
        );

        // Yearly max weight
        const maxWeightByYear = aggregateByYear(maxWeightByMonth, "max");
        generateChart(
          maxWeightByYear.map(([, val], index) => [index, val]),
          `${pattern.label} - Max Weight By Year (lbs)`,
          {
            width: maxWeightByYear.length * 20,
            formatter: (value: number, { axis }: any) =>
              axis === "y" ? value : maxWeightByYear[value]?.[0],
          },
        );

        // Yearly volume
        const volumeByYear = aggregateByYear(volumeByMonth);
        generateChart(
          volumeByYear.map(([, val], index) => [index, val]),
          `${pattern.label} - Total Volume By Year (lbs)`,
          {
            height: 10,
            width: volumeByYear.length * 20,
            barChart: true,
            formatter: (value: number, { axis }: any) =>
              axis === "y" ? value : volumeByYear[value]?.[0],
          },
        );

        // Per-session reps
        generateChart(
          sessions.map((s, i) => [i, s.totalReps]),
          `${pattern.label} - Total Reps Per Session`,
          {
            height: 10,
            width: sessions.length * CHART_WIDTH_PER_DATA_POINT,
            barChart: true,
            formatter: (value: number, { axis }: any) =>
              axis === "y" ? value : sessions[value]?.date,
          },
        );

        // Monthly reps
        const repsByMonth = sessions.reduce((acc: any, s) => {
          const parts = s.date.split("-");
          const key = `${parts[0]}-${parts[1]}`;
          acc[key] = (acc[key] || 0) + s.totalReps;
          return acc;
        }, {});

        generateChart(
          Object.keys(repsByMonth).map((month, i) => [i, repsByMonth[month]]),
          `${pattern.label} - Total Reps By Month`,
          {
            height: 10,
            width: YEAR_WIDTH,
            barChart: true,
            formatter: (value: number, { axis }: any) =>
              axis === "y" ? value : Object.keys(repsByMonth)[value],
          },
        );

        // Yearly reps
        const repsByYear = aggregateByYear(repsByMonth);
        generateChart(
          repsByYear.map(([, val], index) => [index, val]),
          `${pattern.label} - Total Reps By Year`,
          {
            height: 10,
            width: repsByYear.length * 20,
            barChart: true,
            formatter: (value: number, { axis }: any) =>
              axis === "y" ? value : repsByYear[value]?.[0],
          },
        );
      }
      console.log("```");
    }
  } catch (e) {
    // No strength training data available, skip
  }

  // === RUNNING & CYCLING ===
  const cardioTypes = [
    { file: "cyclingActivities.json", label: "Cycling", unit: "mi" },
    { file: "runningActivities.json", label: "Running", unit: "mi" },
  ];

  for (const cardio of cardioTypes) {
    try {
      const activities = JSON.parse(
        fs.readFileSync(`${garminDataFolder}/${cardio.file}`, "utf8"),
      );
      if (!activities?.length) continue;

      console.log("\n```");
      console.log(`\n\n${cardio.label} ===============================\n`);

      const metersToMiles = (m: number): number => Math.round((m / 1609.344) * 100) / 100;
      const secondsToMinutes = (s: number): number => Math.round(s / 60);
      const pacePerMile = (dist: number, dur: number): number => {
        const miles = dist / 1609.344;
        if (miles === 0) return 0;
        return Math.round((dur / 60) / miles * 100) / 100; // min/mile
      };

      type CardioSession = { date: string; distance: number; duration: number; pace: number; calories: number; avgHR: number; elevGain: number };
      const sessions: CardioSession[] = activities.map((a: any) => ({
        date: a?.startTimeLocal?.split(" ")[0] || "",
        distance: metersToMiles(a?.distance || 0),
        duration: secondsToMinutes(a?.duration || 0),
        pace: pacePerMile(a?.distance || 0, a?.duration || 0),
        calories: a?.calories || 0,
        avgHR: a?.averageHR || 0,
        elevGain: metersToFeet(a?.elevationGain || 0),
      }));

      const totalDist = Math.round(sessions.reduce((a, s) => a + s.distance, 0) * 100) / 100;
      const totalTime = sessions.reduce((a, s) => a + s.duration, 0);
      const avgPace = Math.round(sessions.filter(s => s.pace > 0).reduce((a, s) => a + s.pace, 0) / sessions.filter(s => s.pace > 0).length * 100) / 100;
      const bestPace = Math.round(Math.min(...sessions.filter(s => s.pace > 0).map(s => s.pace)) * 100) / 100;
      const totalCalories = sessions.reduce((a, s) => a + s.calories, 0);

      console.log(`${cardio.label} (${sessions.length} sessions)`);
      console.log(`  Total Distance: ${totalDist} ${cardio.unit}`);
      console.log(`  Total Time: ${totalTime} min (${Math.round(totalTime / 60)} hrs)`);
      console.log(`  Average Pace: ${avgPace} min/${cardio.unit}`);
      console.log(`  Best Pace: ${bestPace} min/${cardio.unit}`);
      console.log(`  Total Calories: ${totalCalories}\n`);

      // Per-session distance
      generateChart(
        sessions.map((s, i) => [i, s.distance]),
        `${cardio.label} - Distance Per Session (${cardio.unit})`,
        {
          height: 10,
          width: sessions.length * CHART_WIDTH_PER_DATA_POINT,
          barChart: true,
          formatter: (value: number, { axis }: any) =>
            axis === "y" ? value : sessions[value]?.date,
        },
      );

      // Per-session pace
      generateChart(
        sessions.filter(s => s.pace > 0).map((s, i) => [i, s.pace]),
        `${cardio.label} - Pace Per Session (min/${cardio.unit})`,
        {
          width: sessions.filter(s => s.pace > 0).length * CHART_WIDTH_PER_DATA_POINT,
          formatter: (value: number, { axis }: any) =>
            axis === "y" ? value : sessions.filter(s => s.pace > 0)[value]?.date,
        },
      );

      // Per-session duration
      generateChart(
        sessions.map((s, i) => [i, s.duration]),
        `${cardio.label} - Duration Per Session (min)`,
        {
          height: 10,
          width: sessions.length * CHART_WIDTH_PER_DATA_POINT,
          barChart: true,
          formatter: (value: number, { axis }: any) =>
            axis === "y" ? value : sessions[value]?.date,
        },
      );

      // Monthly aggregations
      const groupByMonth = (fn: (s: CardioSession, prev: number) => number) =>
        sessions.reduce((acc: any, s) => {
          const parts = s.date.split("-");
          const key = `${parts[0]}-${parts[1]}`;
          acc[key] = fn(s, acc[key] || 0);
          return acc;
        }, {});

      const distByMonth = groupByMonth((s, prev) => Math.round((prev + s.distance) * 100) / 100);
      const durationByMonth = groupByMonth((s, prev) => prev + s.duration);
      const sessionsByMonth = groupByMonth((s, prev) => prev + 1);

      generateChart(
        Object.keys(distByMonth).map((m, i) => [i, distByMonth[m]]),
        `${cardio.label} - Distance By Month (${cardio.unit})`,
        {
          height: 10, width: YEAR_WIDTH, barChart: true,
          formatter: (value: number, { axis }: any) => axis === "y" ? value : Object.keys(distByMonth)[value],
        },
      );

      generateChart(
        Object.keys(durationByMonth).map((m, i) => [i, durationByMonth[m]]),
        `${cardio.label} - Duration By Month (min)`,
        {
          height: 10, width: YEAR_WIDTH, barChart: true,
          formatter: (value: number, { axis }: any) => axis === "y" ? value : Object.keys(durationByMonth)[value],
        },
      );

      generateChart(
        Object.keys(sessionsByMonth).map((m, i) => [i, sessionsByMonth[m]]),
        `${cardio.label} - Sessions By Month`,
        {
          height: 10, width: YEAR_WIDTH, barChart: true,
          formatter: (value: number, { axis }: any) => axis === "y" ? value : Object.keys(sessionsByMonth)[value],
        },
      );

      // Yearly
      console.log("\nYearly Stats ===============================\n");

      const distByYear = aggregateByYear(distByMonth);
      generateChart(
        distByYear.map(([, val], i) => [i, val]),
        `${cardio.label} - Distance By Year (${cardio.unit})`,
        {
          height: 10, width: distByYear.length * 20, barChart: true,
          formatter: (value: number, { axis }: any) => axis === "y" ? value : distByYear[value]?.[0],
        },
      );

      const durationByYear = aggregateByYear(durationByMonth);
      generateChart(
        durationByYear.map(([, val], i) => [i, val]),
        `${cardio.label} - Duration By Year (min)`,
        {
          height: 10, width: durationByYear.length * 20, barChart: true,
          formatter: (value: number, { axis }: any) => axis === "y" ? value : durationByYear[value]?.[0],
        },
      );

      const sessionsByYear = aggregateByYear(sessionsByMonth);
      generateChart(
        sessionsByYear.map(([, val], i) => [i, val]),
        `${cardio.label} - Sessions By Year`,
        {
          height: 10, width: sessionsByYear.length * 20, barChart: true,
          formatter: (value: number, { axis }: any) => axis === "y" ? value : sessionsByYear[value]?.[0],
        },
      );

      console.log("```");
    } catch (e) {
      // No data for this cardio type
    }
  }
};
