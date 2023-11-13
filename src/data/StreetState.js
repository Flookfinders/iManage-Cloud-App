import { adsGreenA, adsMidBlueA, adsLightBrown, adsOrange } from "../utils/ADSColours";

const StreetState = [
  {
    id: 1,
    gpText: "Under construction",
    colour: adsMidBlueA,
    default: false,
  },
  {
    id: 2,
    gpText: "Open",
    colour: adsGreenA,
    default: true,
  },
  {
    id: 4,
    gpText: "Permanently closed",
    colour: adsLightBrown,
    default: false,
  },
  {
    id: 5,
    gpText: "Street for addressing purposes only",
    colour: adsOrange,
    default: false,
  },
];

export default StreetState;
