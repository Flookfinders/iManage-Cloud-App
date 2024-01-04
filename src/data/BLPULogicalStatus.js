import { adsGreenA, adsLightPurple, adsMidBlueA, adsLightPink, adsLightBrown } from "../utils/ADSColours";

const BLPULogicalStatus = [
  {
    id: 1,
    gpText: "Approved",
    osText: "Approved",
    colour: adsGreenA, // #2ABB2E Highlight: #05C90C
    default: true,
  },
  {
    id: 5,
    gpText: "Candidate",
    osText: undefined,
    colour: adsLightPurple, // #DD95DA Highlight: #EB62E4
    default: false,
  },
  {
    id: 6,
    gpText: "Provisional",
    osText: "Provisional",
    colour: adsMidBlueA, // #40A4D4 Highlight: #06A7F2
    default: true,
  },
  {
    id: 7,
    gpText: "Rejected External",
    osText: undefined,
    colour: adsLightPink, // #F78599 Highlight: #FF5776
    default: false,
  },
  {
    id: 8,
    gpText: "Historical",
    osText: "Historical",
    colour: adsLightBrown, // #996122 Highlight: #A55A04
    default: false,
  },
  {
    id: 9,
    gpText: "Rejected Internal",
    osText: "Rejected",
    colour: adsLightPink, // #F78599 Highlight: #FF5776
    default: false,
  },
];

export default BLPULogicalStatus;
