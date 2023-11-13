import { adsGreenA, adsLightPurple, adsMidBlueA, adsLightPink, adsLightBrown, adsOrange } from "../utils/ADSColours";

const LPILogicalStatus = [
  {
    id: 1,
    gpText: "Approved Preferred",
    osText: "Approved/Preferred",
    colour: adsGreenA,
    default: true,
  },
  {
    id: 3,
    gpText: "Alternative",
    osText: "Alternative",
    colour: adsOrange,
    default: true,
  },
  {
    id: 5,
    gpText: "Candidate",
    osText: undefined,
    colour: adsLightPurple,
    default: false,
  },
  {
    id: 6,
    gpText: "Provisional",
    osText: "Provisional",
    colour: adsMidBlueA,
    default: true,
  },
  {
    id: 7,
    gpText: "Rejected (External)",
    osText: undefined,
    colour: adsLightPink,
    default: false,
  },
  {
    id: 8,
    gpText: "Historical",
    osText: "Historical",
    colour: adsLightBrown,
    default: false,
  },
  {
    id: 9,
    gpText: "Rejected (Internal)",
    osText: "Rejected",
    colour: adsLightPink,
    default: false,
  },
];

export default LPILogicalStatus;
