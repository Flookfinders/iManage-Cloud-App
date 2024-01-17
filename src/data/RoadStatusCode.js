import { adsBrown } from "../utils/ADSColours";

const RoadStatusCode = [
  {
    id: 1,
    gpText: "Maintainable at Public Expense",
    osText: "Public Road",
    colour: adsBrown,
    default: false,
  },
  {
    id: 2,
    gpText: "Prospectively Maintainable at Public Expense",
    osText: "Prospective Public Road",
    colour: adsBrown,
    default: false,
  },
  {
    id: 3,
    gpText: "Neither 1, 2, 4 nor 5",
    osText: "Private Road",
    colour: adsBrown,
    default: false,
  },
  {
    id: 4,
    gpText: "Maintenance responsibility is to another Highway Authority",
    osText: "Trunk Road or Motorway",
    colour: adsBrown,
    default: false,
  },
  {
    id: 5,
    gpText: "Street outside scope of EToN",
    osText: undefined,
    colour: adsBrown,
    default: false,
  },
];

export default RoadStatusCode;
