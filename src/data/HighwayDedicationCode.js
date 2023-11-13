import { adsBlueB } from "../utils/ADSColours";

const HighwayDedicationCode = [
  {
    id: 2,
    gpText: "Byway Open to All Traffic (BOAT)",
    colour: adsBlueB,
    default: true,
  },
  {
    id: 4,
    gpText: "Pedestrian way or footpath",
    colour: adsBlueB,
    default: true,
  },
  {
    id: 6,
    gpText: "Cycle Track or Cycle Way",
    colour: adsBlueB,
    default: true,
  },
  {
    id: 8,
    gpText: "All Vehicles",
    colour: adsBlueB,
    default: true,
  },
  {
    id: 9,
    gpText: "Restricted byway",
    colour: adsBlueB,
    default: false,
  },
  {
    id: 10,
    gpText: "Bridleway",
    colour: adsBlueB,
    default: false,
  },
  {
    id: 11,
    gpText: "Motorway",
    colour: adsBlueB,
    default: true,
  },
  {
    id: 12,
    gpText: "Neither 2, 4, 6, 8, 9, 10 nor 11",
    colour: adsBlueB,
    default: false,
  },
];

export default HighwayDedicationCode;
