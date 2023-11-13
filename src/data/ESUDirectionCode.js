import { adsLightBlue } from "../utils/ADSColours";

const ESUDirectionCode = [
  {
    id: 1,
    gpText: "Two way",
    colour: adsLightBlue,
    avatar_icon: "TwoWay",
    default: false,
  },
  {
    id: 2,
    gpText: "One-way in direction from Start to End coordinate.",
    colour: adsLightBlue,
    avatar_icon: "StartToEnd",
    default: false,
  },
  {
    id: 3,
    gpText: "One-way in direction from End to Start coordinate.",
    colour: adsLightBlue,
    avatar_icon: "EndToStart",
    default: false,
  },
];

export default ESUDirectionCode;
