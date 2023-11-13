import { adsGreenA, adsLightPurple, adsMidBlueA, adsLightPink, adsLightBrown } from "../utils/ADSColours";

const BLPULogicalStatus = [
  {
    id: 1,
    gpText: "Approved",
    osText: "Approved",
    colour: adsGreenA, // 42, 187, 46
    default: true,
  },
  {
    id: 5,
    gpText: "Candidate",
    osText: undefined,
    colour: adsLightPurple, // 221, 149, 218
    default: false,
  },
  {
    id: 6,
    gpText: "Provisional",
    osText: "Provisional",
    colour: adsMidBlueA, // 64, 164, 212
    default: true,
  },
  {
    id: 7,
    gpText: "Rejected External",
    osText: undefined,
    colour: adsLightPink, // 247, 133, 153
    default: false,
  },
  {
    id: 8,
    gpText: "Historical",
    osText: "Historical",
    colour: adsLightBrown, // 153, 97, 34
    default: false,
  },
  {
    id: 9,
    gpText: "Rejected Internal",
    osText: "Rejected",
    colour: adsLightPink, // 247, 133, 153
    default: false,
  },
];

export default BLPULogicalStatus;
