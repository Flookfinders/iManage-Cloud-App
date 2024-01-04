import { adsPurple } from "../utils/ADSColours";

const StreetType = [
  {
    id: 0,
    gpText: "Unassigned ESU",
    osText: "Unassigned ESU",
    colour: adsPurple,
    chartColour: "#93003a",
    default: false,
  },
  {
    id: 1,
    gpText: "Official Designated Street Name",
    osText: "Designated street name",
    colour: adsPurple,
    chartColour: "#2a6ebb",
    default: true,
  },
  {
    id: 2,
    gpText: "Street Description",
    osText: "Described street",
    colour: adsPurple,
    chartColour: "#dd4c65",
    default: true,
  },
  {
    id: 3,
    gpText: "Numbered Street",
    osText: "Numbered Street",
    colour: adsPurple,
    chartColour: "#62a1cd",
    default: false,
  },
  {
    id: 4,
    gpText: "Unofficial Street Description",
    osText: "Unofficial street name",
    colour: adsPurple,
    chartColour: "#bfede1",
    default: false,
  },
  {
    id: 9,
    gpText: "Description used for LLPG Access",
    osText: undefined,
    colour: adsPurple,
    chartColour: "#ffd3bf",
    default: false,
  },
];

export default StreetType;
