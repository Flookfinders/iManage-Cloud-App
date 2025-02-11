//#region header */
//--------------------------------------------------------------------------------------------------
//
//  Description: All the colour codes used in the application
//
//  Copyright:    © 2023 - 2024 Idox Software Limited.
//
//  Useful links:
//    https://g.co/kgs/mwa7VU
//    https://rgbacolorpicker.com/
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0
//    001   06.10.23 Sean Flook                 Initial version.
//    002   09.02.24 Sean Flook                 Added new colours for ASD records.
//#endregion Version 1.0.0.0
//#region Version 1.0.2.0
//    003   12.11.24 Sean Flook                 Added the ADS palette theme initially used by the filter chips.
//#endregion Version 1.0.2.0
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

import { createTheme, alpha, getContrastRatio } from "@mui/material/styles";

export const adsWhite = "#FFFFFF"; // 36 files
export const adsOffWhite = "#F8F9FA"; // 8 files
export const adsLightGreyA = "#E1E1E1"; // 11 files
export const adsLightGreyB = "#D7D7D7"; // 16 files
export const adsLightGreyC = "#EEEFF0"; // 7 files
export const adsLightGreyD = "#AAAAAA"; // 3 files
export const adsLightGreyA50 = "#E1E1E180"; // 6 files
export const adsMidGreyA = "#535353"; // 33 files
export const adsMidGreyA10 = "#4242421A"; // 1 file
export const adsMidGreyA30 = "#4242424D"; // 1 file
export const adsMidGreyB = "#797979"; // 3 files
export const adsMidGreyC = "#8C8B8B"; // 1 file
export const adsDarkGrey = "#333333"; // 8 files
export const adsDarkGrey10 = "#3333331A"; // 2 files
export const adsDarkGrey20 = "#33333333"; // 2 files
export const adsBlack = "#000000"; // 10 files
export const adsBlack0 = "#00000000"; // 1 file
export const adsBlack125 = "#00000020"; // 1 file
export const adsBlack20 = "#00000033"; // 1 file
export const adsPaleBlueA = "#E6F3F9"; // 5 files
export const adsPaleBlueB = "#DFF1F9"; // 4 files
export const adsBlueA = "#2A6EBB"; // 65 files
export const adsBlueB = "#286EBB"; // 2 files
export const adsBlue12 = "#1976D21F"; // 3 files
export const adsLightBlue = "#00AEEF"; // 30 files
export const adsLightBlue10 = "#00AEEF1A"; // 17 files
export const adsMidBlueA = "#40A4D4"; // 6 files
export const adsMidBlueB = "#027DB4"; // 2 files
export const adsRoyalBlue = "#000080"; // 2 files
export const adsDarkBlue = "#323097"; // 6 files
export const adsRed = "#C4051C"; // 18 files
export const adsRed10 = "#C4051C1A"; // 7 files
export const adsRed20 = "#C4051C33"; // 6 files
export const adsMidRed = "#F01010"; // 5 files
export const adsDarkRed = "#8C0415"; // 2 files
export const adsMagenta = "#D900B6"; // 6 files
export const adsYellow = "#F6E20D"; // 8 files
export const adsGreenA = "#2ABB2E"; // 5 files
export const adsGreenB = "#03B615"; // 1 file
export const adsGreenC = "#23A127"; // 1 file
export const adsDarkGreen = "#0F7B40"; // 4 files
export const adsLightPurple = "#DD95DA"; // 4 files
export const adsPurple = "#A04AA9"; // 1 file
export const adsDarkPurple = "#3D329B";
export const adsLightPink = "#F78599"; // 4 files
export const adsPink = "#BB2A6E"; // 8 files
export const adsDarkPink = "#970d34"; // 4 files
export const adsLightBrown = "#996122"; // 5 files
export const adsMidBrownA = "#B8741A"; // 1 file
export const adsMidBrownB = "#AA4B1D"; // 1 file
export const adsBrown = "#8C510D"; // 6 files
export const adsOrange = "#F48910"; // 4 files
export const adsDarkOrange = "#DB5700";

export const adsTheme = createTheme({
  palette: {
    white: {
      main: alpha(adsWhite, 0.7),
      light: alpha(adsWhite, 0.5),
      dark: alpha(adsWhite, 0.9),
      contrastText: getContrastRatio(adsWhite, "#fff") > 4.5 ? "#fff" : "#111",
    },
    offWhite: {
      main: alpha(adsOffWhite, 0.7),
      light: alpha(adsOffWhite, 0.5),
      dark: alpha(adsOffWhite, 0.9),
      contrastText: getContrastRatio(adsOffWhite, "#fff") > 4.5 ? "#fff" : "#111",
    },
    lightGreyA: {
      main: alpha(adsLightGreyA, 0.7),
      light: alpha(adsLightGreyA, 0.5),
      dark: alpha(adsLightGreyA, 0.9),
      contrastText: getContrastRatio(adsLightGreyA, "#fff") > 4.5 ? "#fff" : "#111",
    },
    lightGreyB: {
      main: alpha(adsLightGreyB, 0.7),
      light: alpha(adsLightGreyB, 0.5),
      dark: alpha(adsLightGreyB, 0.9),
      contrastText: getContrastRatio(adsLightGreyB, "#fff") > 4.5 ? "#fff" : "#111",
    },
    lightGreyC: {
      main: alpha(adsLightGreyC, 0.7),
      light: alpha(adsLightGreyC, 0.5),
      dark: alpha(adsLightGreyC, 0.9),
      contrastText: getContrastRatio(adsLightGreyC, "#fff") > 4.5 ? "#fff" : "#111",
    },
    lightGreyD: {
      main: alpha(adsLightGreyD, 0.7),
      light: alpha(adsLightGreyD, 0.5),
      dark: alpha(adsLightGreyD, 0.9),
      contrastText: getContrastRatio(adsLightGreyD, "#fff") > 4.5 ? "#fff" : "#111",
    },
    lightGreyA50: {
      main: alpha(adsLightGreyA50, 0.7),
      light: alpha(adsLightGreyA50, 0.5),
      dark: alpha(adsLightGreyA50, 0.9),
      contrastText: getContrastRatio(adsLightGreyA50, "#fff") > 4.5 ? "#fff" : "#111",
    },
    midGreyA: {
      main: alpha(adsMidGreyA, 0.7),
      light: alpha(adsMidGreyA, 0.5),
      dark: alpha(adsMidGreyA, 0.9),
      contrastText: getContrastRatio(adsMidGreyA, "#fff") > 4.5 ? "#fff" : "#111",
    },
    midGreyA10: {
      main: alpha(adsMidGreyA10, 0.7),
      light: alpha(adsMidGreyA10, 0.5),
      dark: alpha(adsMidGreyA10, 0.9),
      contrastText: getContrastRatio(adsMidGreyA10, "#fff") > 4.5 ? "#fff" : "#111",
    },
    midGreyA30: {
      main: alpha(adsMidGreyA30, 0.7),
      light: alpha(adsMidGreyA30, 0.5),
      dark: alpha(adsMidGreyA30, 0.9),
      contrastText: getContrastRatio(adsMidGreyA30, "#fff") > 4.5 ? "#fff" : "#111",
    },
    midGreyB: {
      main: alpha(adsMidGreyB, 0.7),
      light: alpha(adsMidGreyB, 0.5),
      dark: alpha(adsMidGreyB, 0.9),
      contrastText: getContrastRatio(adsMidGreyB, "#fff") > 4.5 ? "#fff" : "#111",
    },
    midGreyC: {
      main: alpha(adsMidGreyC, 0.7),
      light: alpha(adsMidGreyC, 0.5),
      dark: alpha(adsMidGreyC, 0.9),
      contrastText: getContrastRatio(adsMidGreyC, "#fff") > 4.5 ? "#fff" : "#111",
    },
    darkGrey: {
      main: alpha(adsDarkGrey, 0.7),
      light: alpha(adsDarkGrey, 0.5),
      dark: alpha(adsDarkGrey, 0.9),
      contrastText: getContrastRatio(adsDarkGrey, "#fff") > 4.5 ? "#fff" : "#111",
    },
    darkGrey10: {
      main: alpha(adsDarkGrey10, 0.7),
      light: alpha(adsDarkGrey10, 0.5),
      dark: alpha(adsDarkGrey10, 0.9),
      contrastText: getContrastRatio(adsDarkGrey10, "#fff") > 4.5 ? "#fff" : "#111",
    },
    darkGrey20: {
      main: alpha(adsDarkGrey20, 0.7),
      light: alpha(adsDarkGrey20, 0.5),
      dark: alpha(adsDarkGrey20, 0.9),
      contrastText: getContrastRatio(adsDarkGrey20, "#fff") > 4.5 ? "#fff" : "#111",
    },
    black: {
      main: alpha(adsBlack, 0.7),
      light: alpha(adsBlack, 0.5),
      dark: alpha(adsBlack, 0.9),
      contrastText: getContrastRatio(adsBlack, "#fff") > 4.5 ? "#fff" : "#111",
    },
    black0: {
      main: alpha(adsBlack0, 0.7),
      light: alpha(adsBlack0, 0.5),
      dark: alpha(adsBlack0, 0.9),
      contrastText: getContrastRatio(adsBlack0, "#fff") > 4.5 ? "#fff" : "#111",
    },
    black125: {
      main: alpha(adsBlack125, 0.7),
      light: alpha(adsBlack125, 0.5),
      dark: alpha(adsBlack125, 0.9),
      contrastText: getContrastRatio(adsBlack125, "#fff") > 4.5 ? "#fff" : "#111",
    },
    black20: {
      main: alpha(adsBlack20, 0.7),
      light: alpha(adsBlack20, 0.5),
      dark: alpha(adsBlack20, 0.9),
      contrastText: getContrastRatio(adsBlack20, "#fff") > 4.5 ? "#fff" : "#111",
    },
    paleBlueA: {
      main: alpha(adsPaleBlueA, 0.7),
      light: alpha(adsPaleBlueA, 0.5),
      dark: alpha(adsPaleBlueA, 0.9),
      contrastText: getContrastRatio(adsPaleBlueA, "#fff") > 4.5 ? "#fff" : "#111",
    },
    paleBlueB: {
      main: alpha(adsPaleBlueB, 0.7),
      light: alpha(adsPaleBlueB, 0.5),
      dark: alpha(adsPaleBlueB, 0.9),
      contrastText: getContrastRatio(adsPaleBlueB, "#fff") > 4.5 ? "#fff" : "#111",
    },
    blueA: {
      main: alpha(adsBlueA, 0.7),
      light: alpha(adsBlueA, 0.5),
      dark: alpha(adsBlueA, 0.9),
      contrastText: getContrastRatio(adsBlueA, "#fff") > 4.5 ? "#fff" : "#111",
    },
    blueB: {
      main: alpha(adsBlueB, 0.7),
      light: alpha(adsBlueB, 0.5),
      dark: alpha(adsBlueB, 0.9),
      contrastText: getContrastRatio(adsBlueB, "#fff") > 4.5 ? "#fff" : "#111",
    },
    blue12: {
      main: alpha(adsBlue12, 0.7),
      light: alpha(adsBlue12, 0.5),
      dark: alpha(adsBlue12, 0.9),
      contrastText: getContrastRatio(adsBlue12, "#fff") > 4.5 ? "#fff" : "#111",
    },
    lightBlue: {
      main: alpha(adsLightBlue, 0.7),
      light: alpha(adsLightBlue, 0.5),
      dark: alpha(adsLightBlue, 0.9),
      contrastText: getContrastRatio(adsLightBlue, "#fff") > 4.5 ? "#fff" : "#111",
    },
    lightBlue10: {
      main: alpha(adsLightBlue10, 0.7),
      light: alpha(adsLightBlue10, 0.5),
      dark: alpha(adsLightBlue10, 0.9),
      contrastText: getContrastRatio(adsLightBlue10, "#fff") > 4.5 ? "#fff" : "#111",
    },
    midBlueA: {
      main: alpha(adsMidBlueA, 0.7),
      light: alpha(adsMidBlueA, 0.5),
      dark: alpha(adsMidBlueA, 0.9),
      contrastText: getContrastRatio(adsMidBlueA, "#fff") > 4.5 ? "#fff" : "#111",
    },
    midBlueB: {
      main: alpha(adsMidBlueB, 0.7),
      light: alpha(adsMidBlueB, 0.5),
      dark: alpha(adsMidBlueB, 0.9),
      contrastText: getContrastRatio(adsMidBlueB, "#fff") > 4.5 ? "#fff" : "#111",
    },
    royalBlue: {
      main: alpha(adsRoyalBlue, 0.7),
      light: alpha(adsRoyalBlue, 0.5),
      dark: alpha(adsRoyalBlue, 0.9),
      contrastText: getContrastRatio(adsRoyalBlue, "#fff") > 4.5 ? "#fff" : "#111",
    },
    darkBlue: {
      main: alpha(adsDarkBlue, 0.7),
      light: alpha(adsDarkBlue, 0.5),
      dark: alpha(adsDarkBlue, 0.9),
      contrastText: getContrastRatio(adsDarkBlue, "#fff") > 4.5 ? "#fff" : "#111",
    },
    red: {
      main: alpha(adsRed, 0.7),
      light: alpha(adsRed, 0.5),
      dark: alpha(adsRed, 0.9),
      contrastText: getContrastRatio(adsRed, "#fff") > 4.5 ? "#fff" : "#111",
    },
    red10: {
      main: alpha(adsRed10, 0.7),
      light: alpha(adsRed10, 0.5),
      dark: alpha(adsRed10, 0.9),
      contrastText: getContrastRatio(adsRed10, "#fff") > 4.5 ? "#fff" : "#111",
    },
    red20: {
      main: alpha(adsRed20, 0.7),
      light: alpha(adsRed20, 0.5),
      dark: alpha(adsRed20, 0.9),
      contrastText: getContrastRatio(adsRed20, "#fff") > 4.5 ? "#fff" : "#111",
    },
    midRed: {
      main: alpha(adsMidRed, 0.7),
      light: alpha(adsMidRed, 0.5),
      dark: alpha(adsMidRed, 0.9),
      contrastText: getContrastRatio(adsMidRed, "#fff") > 4.5 ? "#fff" : "#111",
    },
    darkRed: {
      main: alpha(adsDarkRed, 0.7),
      light: alpha(adsDarkRed, 0.5),
      dark: alpha(adsDarkRed, 0.9),
      contrastText: getContrastRatio(adsDarkRed, "#fff") > 4.5 ? "#fff" : "#111",
    },
    magenta: {
      main: alpha(adsMagenta, 0.7),
      light: alpha(adsMagenta, 0.5),
      dark: alpha(adsMagenta, 0.9),
      contrastText: getContrastRatio(adsMagenta, "#fff") > 4.5 ? "#fff" : "#111",
    },
    yellow: {
      main: alpha(adsYellow, 0.7),
      light: alpha(adsYellow, 0.5),
      dark: alpha(adsYellow, 0.9),
      contrastText: getContrastRatio(adsYellow, "#fff") > 4.5 ? "#fff" : "#111",
    },
    greenA: {
      main: alpha(adsGreenA, 0.7),
      light: alpha(adsGreenA, 0.5),
      dark: alpha(adsGreenA, 0.9),
      contrastText: getContrastRatio(adsGreenA, "#fff") > 4.5 ? "#fff" : "#111",
    },
    greenB: {
      main: alpha(adsGreenB, 0.7),
      light: alpha(adsGreenB, 0.5),
      dark: alpha(adsGreenB, 0.9),
      contrastText: getContrastRatio(adsGreenB, "#fff") > 4.5 ? "#fff" : "#111",
    },
    greenC: {
      main: alpha(adsGreenC, 0.7),
      light: alpha(adsGreenC, 0.5),
      dark: alpha(adsGreenC, 0.9),
      contrastText: getContrastRatio(adsGreenC, "#fff") > 4.5 ? "#fff" : "#111",
    },
    darkGreen: {
      main: alpha(adsDarkGreen, 0.7),
      light: alpha(adsDarkGreen, 0.5),
      dark: alpha(adsDarkGreen, 0.9),
      contrastText: getContrastRatio(adsDarkGreen, "#fff") > 4.5 ? "#fff" : "#111",
    },
    lightPurple: {
      main: alpha(adsLightPurple, 0.7),
      light: alpha(adsLightPurple, 0.5),
      dark: alpha(adsLightPurple, 0.9),
      contrastText: getContrastRatio(adsLightPurple, "#fff") > 4.5 ? "#fff" : "#111",
    },
    purple: {
      main: alpha(adsPurple, 0.7),
      light: alpha(adsPurple, 0.5),
      dark: alpha(adsPurple, 0.9),
      contrastText: getContrastRatio(adsPurple, "#fff") > 4.5 ? "#fff" : "#111",
    },
    darkPurple: {
      main: alpha(adsDarkPurple, 0.7),
      light: alpha(adsDarkPurple, 0.5),
      dark: alpha(adsDarkPurple, 0.9),
      contrastText: getContrastRatio(adsDarkPurple, "#fff") > 4.5 ? "#fff" : "#111",
    },
    lightPink: {
      main: alpha(adsLightPink, 0.7),
      light: alpha(adsLightPink, 0.5),
      dark: alpha(adsLightPink, 0.9),
      contrastText: getContrastRatio(adsLightPink, "#fff") > 4.5 ? "#fff" : "#111",
    },
    pink: {
      main: alpha(adsPink, 0.7),
      light: alpha(adsPink, 0.5),
      dark: alpha(adsPink, 0.9),
      contrastText: getContrastRatio(adsPink, "#fff") > 4.5 ? "#fff" : "#111",
    },
    darkPink: {
      main: alpha(adsDarkPink, 0.7),
      light: alpha(adsDarkPink, 0.5),
      dark: alpha(adsDarkPink, 0.9),
      contrastText: getContrastRatio(adsDarkPink, "#fff") > 4.5 ? "#fff" : "#111",
    },
    lightBrown: {
      main: alpha(adsLightBrown, 0.7),
      light: alpha(adsLightBrown, 0.5),
      dark: alpha(adsLightBrown, 0.9),
      contrastText: getContrastRatio(adsLightBrown, "#fff") > 4.5 ? "#fff" : "#111",
    },
    midBrownA: {
      main: alpha(adsMidBrownA, 0.7),
      light: alpha(adsMidBrownA, 0.5),
      dark: alpha(adsMidBrownA, 0.9),
      contrastText: getContrastRatio(adsMidBrownA, "#fff") > 4.5 ? "#fff" : "#111",
    },
    midBrownB: {
      main: alpha(adsMidBrownB, 0.7),
      light: alpha(adsMidBrownB, 0.5),
      dark: alpha(adsMidBrownB, 0.9),
      contrastText: getContrastRatio(adsMidBrownB, "#fff") > 4.5 ? "#fff" : "#111",
    },
    brown: {
      main: alpha(adsBrown, 0.7),
      light: alpha(adsBrown, 0.5),
      dark: alpha(adsBrown, 0.9),
      contrastText: getContrastRatio(adsBrown, "#fff") > 4.5 ? "#fff" : "#111",
    },
    orange: {
      main: alpha(adsOrange, 0.7),
      light: alpha(adsOrange, 0.5),
      dark: alpha(adsOrange, 0.9),
      contrastText: getContrastRatio(adsOrange, "#fff") > 4.5 ? "#fff" : "#111",
    },
    darkOrange: {
      main: alpha(adsDarkOrange, 0.7),
      light: alpha(adsDarkOrange, 0.5),
      dark: alpha(adsDarkOrange, 0.9),
      contrastText: getContrastRatio(adsDarkOrange, "#fff") > 4.5 ? "#fff" : "#111",
    },
  },
});

export const getAsdThemColourString = (colour) => {
  switch (colour) {
    case adsWhite:
      return "white";

    case adsOffWhite:
      return "offWhite";

    case adsLightGreyA:
      return "lightGreyA";

    case adsLightGreyB:
      return "lightGreyB";

    case adsLightGreyC:
      return "lightGreyC";

    case adsLightGreyD:
      return "lightGreyD";

    case adsLightGreyA50:
      return "lightGreyA50";

    case adsMidGreyA:
      return "midGreyA";

    case adsMidGreyA10:
      return "midGreyA10";

    case adsMidGreyA30:
      return "midGreyA30";

    case adsMidGreyB:
      return "midGreyB";

    case adsMidGreyC:
      return "midGreyC";

    case adsDarkGrey:
      return "darkGrey";

    case adsDarkGrey10:
      return "darkGrey10";

    case adsDarkGrey20:
      return "darkGrey20";

    case adsBlack:
      return "black";

    case adsBlack0:
      return "black0";

    case adsBlack125:
      return "black125";

    case adsBlack20:
      return "black20";

    case adsPaleBlueA:
      return "paleBlueA";

    case adsPaleBlueB:
      return "paleBlueB";

    case adsBlueA:
      return "blueA";

    case adsBlueB:
      return "blueB";

    case adsBlue12:
      return "blue12";

    case adsLightBlue:
      return "lightBlue";

    case adsLightBlue10:
      return "lightBlue10";

    case adsMidBlueA:
      return "midBlueA";

    case adsMidBlueB:
      return "midBlueB";

    case adsRoyalBlue:
      return "royalBlue";

    case adsDarkBlue:
      return "darkBlue";

    case adsRed:
      return "red";

    case adsRed10:
      return "red10";

    case adsRed20:
      return "red20";

    case adsMidRed:
      return "midRed";

    case adsDarkRed:
      return "darkRed";

    case adsMagenta:
      return "magenta";

    case adsYellow:
      return "yellow";

    case adsGreenA:
      return "greenA";

    case adsGreenB:
      return "greenB";

    case adsGreenC:
      return "greenC";

    case adsDarkGreen:
      return "darkGreen";

    case adsLightPurple:
      return "lightPurple";

    case adsPurple:
      return "purple";

    case adsDarkPurple:
      return "darkPurple";

    case adsLightPink:
      return "lightPink";

    case adsPink:
      return "pink";

    case adsDarkPink:
      return "darkPink";

    case adsLightBrown:
      return "lightBrown";

    case adsMidBrownA:
      return "midBrownA";

    case adsMidBrownB:
      return "midBrownB";

    case adsBrown:
      return "brown";

    case adsOrange:
      return "orange";

    case adsDarkOrange:
      return "darkOrange";

    default:
      return "primary";
  }
};
