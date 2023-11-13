import { adsMidBlueB } from "../utils/ADSColours";

const BLPUState = [
  {
    id: 0,
    gpText: "Not Applicable",
    osText: "not applicable",
    colour: adsMidBlueB,
    default: false,
  },
  {
    id: 1,
    gpText: "Under construction",
    osText: "under construction / named or numbered by SNN",
    colour: adsMidBlueB,
    default: true,
  },
  {
    id: 2,
    gpText: "In use",
    osText: "constructed",
    colour: adsMidBlueB,
    default: true,
  },
  {
    id: 3,
    gpText: "Unoccupied",
    osText: "derelict / vacant",
    colour: adsMidBlueB,
    default: false,
  },
  {
    id: 4,
    gpText: "No Longer Existing",
    osText: "no longer existing",
    colour: adsMidBlueB,
    default: false,
  },
  {
    id: 5,
    gpText: "Planning application received",
    osText: undefined,
    colour: adsMidBlueB,
    default: true,
  },
  {
    id: 6,
    gpText: "Planning application granted",
    osText: undefined,
    colour: adsMidBlueB,
    default: true,
  },
  {
    id: 7,
    gpText: "Planning application refused",
    osText: undefined,
    colour: adsMidBlueB,
    default: true,
  },
];

export default BLPUState;
