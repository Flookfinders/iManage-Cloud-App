import { adsMagenta } from "../utils/ADSColours";

const RepresentativePointCode = [
  {
    id: 1,
    gpText: "Visual centre",
    osText: "Visual centre",
    colour: adsMagenta,
    default: true,
  },
  {
    id: 2,
    gpText: "General internal point",
    osText: "General internal point",
    colour: adsMagenta,
    default: true,
  },
  {
    id: 3,
    gpText: "SW corner of referenced 100m grid square",
    osText: "South-west corner of coordinate grid square",
    colour: adsMagenta,
    default: false,
  },
  {
    id: 4,
    gpText: "Start of referenced Street",
    osText: "Start point of the referencing street",
    colour: adsMagenta,
    default: false,
  },
  {
    id: 5,
    gpText: "General point based on postcode unit",
    osText: "Representative point for Unit Postcode",
    colour: adsMagenta,
    default: false,
  },
  {
    id: 9,
    gpText: "Centre of Creating Authority area",
    osText: "Unspecified",
    colour: adsMagenta,
    default: false,
  },
];

export default RepresentativePointCode;
