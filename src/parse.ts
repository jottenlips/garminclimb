import * as fs from "fs";
import plot from "simple-ascii-chart";

type YDSGradeMap = { [key: string]: number };
import { garminDataFolder } from ".";

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
    fs.readFileSync(`${garminDataFolder}/indoorClimbingActivities.json`, "utf8")
  );

  const activeIndoorSplits = indoorClimbingActivities.map((activity: any) =>
    activity?.splitSummaries?.[0]?.splitType === "CLIMB_ACTIVE"
      ? { ...activity?.splitSummaries?.[0], start: activity?.startTimeLocal }
      : { ...activity?.splitSummaries?.[1], start: activity?.startTimeLocal }
  );

  const boulderingActivities = JSON.parse(
    fs.readFileSync(`${garminDataFolder}/boulderingActivities.json`, "utf8")
  );

  const activeBoulderingSplits = boulderingActivities
    ?.reverse()
    .map((activity: any) =>
      activity?.splitSummaries?.[0]?.splitType === "CLIMB_ACTIVE"
        ? { ...activity?.splitSummaries?.[0], start: activity?.startTimeLocal }
        : { ...activity?.splitSummaries?.[1], start: activity?.startTimeLocal }
    )
    .filter((split: any) => split?.noOfSplits !== 1);

  const metersToFeet = (meters: number): number => Math.round(meters * 3.28084);

  const generateChart = (data: any[], title: string, options: any) => {
    console.log(title);
    console.log(plot(data, options));
  };

  generateChart(
    activeIndoorSplits
      ?.reverse()
      .map((split: any, index: number) => [
        index,
        YDS_GRADE_MAP?.[split?.maxGradeValue?.valueKey],
      ]),
    "Max Grade Per Session Indoor Climbing",
    {
      width: activeIndoorSplits?.length * 10,
      formatter: (value: number, { axis }: any) =>
        axis === "y"
          ? `${numberToGrade(value)}`
          : activeIndoorSplits[value]?.start?.split(" ")[0],
    }
  );

  generateChart(
    activeIndoorSplits?.map((split: any, index: number) => [
      index,
      split?.numClimbSends,
    ]),
    "Number of Sends per session",
    {
      height: 20,
      width: activeIndoorSplits?.length * 10,
      formatter: (value: number, { axis }: any) =>
        axis === "y" ? value : activeIndoorSplits[value]?.start?.split(" ")[0],
    }
  );

  generateChart(
    activeIndoorSplits?.map((split: any, index: number) => [
      index,
      metersToFeet(split?.totalAscent),
    ]),
    "Total Feet Per Session",
    {
      height: 10,
      width: activeIndoorSplits?.length * 10,
      barChart: true,
      formatter: (value: number, { axis }: any) =>
        axis === "y" ? value : activeIndoorSplits[value]?.start?.split(" ")[0],
    }
  );

  const totalFeetByMonthYear = activeIndoorSplits?.reduce(
    (acc: any, split: any) => {
      const month = split?.start?.split(" ")[0].split("-")[1];
      const year = split?.start?.split(" ")[0].split("-")[0];
      acc[`${year}-${month}`] =
        (acc[`${year}-${month}`] || 0) + metersToFeet(split?.totalAscent);
      return acc;
    },
    {}
  );

  generateChart(
    Object.keys(totalFeetByMonthYear).map((month: string, index) => [
      index,
      totalFeetByMonthYear[month],
    ]),
    "Total Route Feet By Month",
    {
      height: 20,
      width: 20,
      barChart: true,
      formatter: (value: number, { axis }: any) =>
        axis === "y" ? value : Object.keys(totalFeetByMonthYear)[value],
    }
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
      width: activeIndoorSplits?.length * 10,
      formatter: (value: number, { axis }: any) =>
        axis === "y" ? value : activeIndoorSplits[value]?.start?.split(" ")[0],
    }
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
      width: activeBoulderingSplits?.length * 10,
      formatter: (value: number, { axis }: any) =>
        axis === "y"
          ? `V${value}`
          : activeBoulderingSplits[value]?.start?.split(" ")[0],
    }
  );

  generateChart(
    activeBoulderingSplits?.map((split: any, index: number) => [
      index,
      split?.noOfSplits,
    ]),
    "Number of Climbs per session",
    {
      height: 10,
      barChart: true,
      width: activeBoulderingSplits?.length * 10,
      formatter: (value: number, { axis }: any) =>
        axis === "y"
          ? value
          : activeBoulderingSplits[value]?.start?.split(" ")[0],
    }
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
      width: activeBoulderingSplits?.length * 10,
      formatter: (value: number, { axis }: any) =>
        axis === "y"
          ? value
          : activeBoulderingSplits[value]?.start?.split(" ")[0],
    }
  );

  // each boulder is ~8 feet
  const totalFeetByMonthYearBouldering = activeBoulderingSplits?.reduce(
    (acc: any, split: any) => {
      const month = split?.start?.split(" ")[0].split("-")[1];
      const year = split?.start?.split(" ")[0].split("-")[0];
      acc[`${year}-${month}`] =
        (acc[`${year}-${month}`] || 0) + split?.noOfSplits * 8;
      return acc;
    },
    {}
  );

  generateChart(
    Object.keys(totalFeetByMonthYearBouldering).map((month: string, index) => [
      index,
      totalFeetByMonthYearBouldering[month],
    ]),
    "Approx Boulder Feet By Month",
    {
      height: 20,
      width: 20,
      barChart: true,
      formatter: (value: number, { axis }: any) =>
        axis === "y"
          ? value
          : Object.keys(totalFeetByMonthYearBouldering)[value],
    }
  );

  const totalFeetByMonthYearCombined = Object.keys(totalFeetByMonthYear).reduce(
    (acc: any, key: string) => {
      acc[key] =
        totalFeetByMonthYear[key] + (totalFeetByMonthYearBouldering[key] || 0);
      return acc;
    },
    {}
  );
  generateChart(
    Object.keys(totalFeetByMonthYearCombined).map((month: string, index) => [
      index,
      totalFeetByMonthYearCombined[month],
    ]),
    "Total Feet By Month Combined",
    {
      height: 20,
      width: 20,
      barChart: true,
      formatter: (value: number, { axis }: any) =>
        axis === "y" ? value : Object.keys(totalFeetByMonthYearCombined)[value],
    }
  );
};
