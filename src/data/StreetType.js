import { adsPurple } from "../utils/ADSColours";

const StreetType = [
  {
    id: 0,
    gpText: "Unassigned ESU",
    osText: "Unassigned ESU",
    colour: adsPurple,
    default: false,
  },
  {
    id: 1,
    gpText: "Official Designated Street Name",
    osText: "Designated street name",
    colour: adsPurple,
    default: true,
  },
  {
    id: 2,
    gpText: "Street Description",
    osText: "Described street",
    colour: adsPurple,
    default: true,
  },
  {
    id: 3,
    gpText: "Numbered Street",
    osText: "Numbered Street",
    colour: adsPurple,
    default: false,
  },
  {
    id: 4,
    gpText: "Unofficial Street Description",
    osText: "Unofficial street name",
    colour: adsPurple,
    default: false,
  },
  {
    id: 9,
    gpText: "Description used for LLPG Access",
    osText: undefined,
    colour: adsPurple,
    default: false,
  },
];

export default StreetType;
