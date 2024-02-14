import { adsPurple } from "../utils/ADSColours";

const StreetType = [
  {
    id: 0,
    gpText: "Unassigned ESU",
    osText: "Unassigned ESU",
    colour: adsPurple,
    chartColour: "#93003A", // Highlight: #840035
    default: false,
  },
  {
    id: 1,
    gpText: "Official Designated Street Name",
    osText: "Designated street name",
    colour: adsPurple,
    chartColour: "#2A6EBB", // Highlight: #0561C9
    default: true,
  },
  {
    id: 2,
    gpText: "Street Description",
    osText: "Described street",
    colour: adsPurple,
    chartColour: "#DD4C65", // Highlight: #FF0C35
    default: true,
  },
  {
    id: 3,
    gpText: "Numbered Street",
    osText: "Numbered street",
    colour: adsPurple,
    chartColour: "#62A1CD", // Highlight: #2C98E5
    default: false,
  },
  {
    id: 4,
    gpText: "Unofficial Street Description",
    osText: "Unofficial street name",
    colour: adsPurple,
    chartColour: "#BFEDE1", // Highlight: #8BF6D9
    default: false,
  },
  {
    id: 9,
    gpText: "Description used for LLPG Access",
    osText: undefined,
    colour: adsPurple,
    chartColour: "#FFD3BF", // Highlight: #FFB592
    default: false,
  },
];

export default StreetType;
