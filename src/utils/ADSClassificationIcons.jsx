//#region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Icons used to distinguish classification of property
//
//  Copyright:    © 2021 - 2023 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0
//    001   23.07.21 Sean Flook                 Initial Revision.
//    002   20.11.23 Sean Flook                 Added icon for street BLPUs.
//    003   20.11.23 Sean Flook                 Modified GetClassificationIcon to change the classification for street BLPUs.
//#endregion Version 1.0.0.0
//
//--------------------------------------------------------------------------------------------------
//#endregion header

//#region imports

import React from "react";
import { SvgIcon } from "@mui/material";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import TerrainIcon from "@mui/icons-material/Terrain";
import HomeIcon from "@mui/icons-material/Home";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

//#endregion imports

/**
 * Method to get the classification icon from the classification code.
 *
 * @param {string|null} classification The classification code.
 * @param {object} nameClass Styling to apply to the icon
 * @param {object} props The passed in properties.
 * @returns {JSX.Element} The required classification icon.
 */
export default function GetClassificationIcon(classification, nameClass, props) {
  if (!classification) return null;

  if (classification.includes(",")) return null;

  const primaryClassification = classification === "PS" ? "B" : classification.substring(0, 1);

  switch (primaryClassification) {
    case "B":
      if (nameClass) {
        return (
          <SvgIcon sx={nameClass} {...props}>
            <g>
              <path d="M21,21L3,21L7.5,3L16.5,3L21,21ZM13,14L11,14L11,18L13,18L13,14ZM13,9L11,9L11,12L13,12L13,9ZM13,5L11,5L11,7L13,7L13,5Z" />
            </g>
          </SvgIcon>
        );
      } else {
        return (
          <SvgIcon {...props}>
            <g>
              <path d="M21,21L3,21L7.5,3L16.5,3L21,21ZM13,14L11,14L11,18L13,18L13,14ZM13,9L11,9L11,12L13,12L13,9ZM13,5L11,5L11,7L13,7L13,5Z" />
            </g>
          </SvgIcon>
        );
      }

    case "C":
      if (nameClass) {
        return <BusinessCenterIcon sx={nameClass} {...props} />;
      } else {
        return <BusinessCenterIcon {...props} />;
      }

    case "L":
      if (nameClass) {
        return <TerrainIcon sx={nameClass} {...props} />;
      } else {
        return <TerrainIcon {...props} />;
      }

    case "M":
      if (nameClass) {
        return (
          <SvgIcon sx={nameClass} {...props}>
            <g>
              <path d="M17,10.43V2H7v8.43c0,0.35,0.18,0.68,0.49,0.86l4.18,2.51l-0.99,2.34l-3.41,0.29l2.59,2.24L9.07,22L12,20.23L14.93,22 l-0.78-3.33l2.59-2.24l-3.41-0.29l-0.99-2.34l4.18-2.51C16.82,11.11,17,10.79,17,10.43z M13,12.23l-1,0.6l-1-0.6V3h2V12.23z" />
            </g>
          </SvgIcon>
        );
      } else {
        return (
          <SvgIcon {...props}>
            <g>
              <path d="M17,10.43V2H7v8.43c0,0.35,0.18,0.68,0.49,0.86l4.18,2.51l-0.99,2.34l-3.41,0.29l2.59,2.24L9.07,22L12,20.23L14.93,22 l-0.78-3.33l2.59-2.24l-3.41-0.29l-0.99-2.34l4.18-2.51C16.82,11.11,17,10.79,17,10.43z M13,12.23l-1,0.6l-1-0.6V3h2V12.23z" />
            </g>
          </SvgIcon>
        );
      }

    case "P":
      if (nameClass) {
        return (
          <SvgIcon sx={nameClass} {...props}>
            <g>
              <path d="m4 9 8-6 8 6Zm0 12h9v-4H4Zm11 0h5v-4h-5ZM4 15h5v-4H4Zm7 0h9v-4h-9Z" />
            </g>
          </SvgIcon>
        );
      } else {
        return (
          <SvgIcon {...props}>
            <g>
              <path d="m4 9 8-6 8 6Zm0 12h9v-4H4Zm11 0h5v-4h-5ZM4 15h5v-4H4Zm7 0h9v-4h-9Z" />
            </g>
          </SvgIcon>
        );
      }

    case "R":
      if (nameClass) {
        return <HomeIcon sx={nameClass} {...props} />;
      } else {
        return <HomeIcon {...props} />;
      }

    case "U":
      if (nameClass) {
        return (
          <SvgIcon sx={nameClass} {...props}>
            <g>
              <path d="M13.25,16.74c0,0.69-0.53,1.26-1.25,1.26c-0.7,0-1.26-0.56-1.26-1.26c0-0.71,0.56-1.25,1.26-1.25 C12.71,15.49,13.25,16.04,13.25,16.74z M11.99,6c-1.77,0-2.98,1.15-3.43,2.49l1.64,0.69c0.22-0.67,0.74-1.48,1.8-1.48 c1.62,0,1.94,1.52,1.37,2.33c-0.54,0.77-1.47,1.29-1.96,2.16c-0.39,0.69-0.31,1.49-0.31,1.98h1.82c0-0.93,0.07-1.12,0.22-1.41 c0.39-0.72,1.11-1.06,1.87-2.17c0.68-1,0.42-2.36-0.02-3.08C14.48,6.67,13.47,6,11.99,6z M19,5H5v14h14V5 M19,3c1.1,0,2,0.9,2,2v14 c0,1.1-0.9,2-2,2H5c-1.1,0-2-0.9-2-2V5c0-1.1,0.9-2,2-2H19L19,3z" />
            </g>
          </SvgIcon>
        );
      } else {
        return (
          <SvgIcon {...props}>
            <g>
              <path d="M13.25,16.74c0,0.69-0.53,1.26-1.25,1.26c-0.7,0-1.26-0.56-1.26-1.26c0-0.71,0.56-1.25,1.26-1.25 C12.71,15.49,13.25,16.04,13.25,16.74z M11.99,6c-1.77,0-2.98,1.15-3.43,2.49l1.64,0.69c0.22-0.67,0.74-1.48,1.8-1.48 c1.62,0,1.94,1.52,1.37,2.33c-0.54,0.77-1.47,1.29-1.96,2.16c-0.39,0.69-0.31,1.49-0.31,1.98h1.82c0-0.93,0.07-1.12,0.22-1.41 c0.39-0.72,1.11-1.06,1.87-2.17c0.68-1,0.42-2.36-0.02-3.08C14.48,6.67,13.47,6,11.99,6z M19,5H5v14h14V5 M19,3c1.1,0,2,0.9,2,2v14 c0,1.1-0.9,2-2,2H5c-1.1,0-2-0.9-2-2V5c0-1.1,0.9-2,2-2H19L19,3z" />
            </g>
          </SvgIcon>
        );
      }

    case "X":
      if (nameClass) {
        return (
          <SvgIcon sx={nameClass} {...props}>
            <g>
              <path d="M20,19V5c0-1.1-0.9-2-2-2h-5.25v16h-1.5V3H6C4.9,3,4,3.9,4,5v14H3v2h18v-2H20z M10,13H8v-2h2V13z M16,13h-2v-2h2V13z" />
            </g>
          </SvgIcon>
        );
      } else {
        return (
          <SvgIcon {...props}>
            <g>
              <path d="M20,19V5c0-1.1-0.9-2-2-2h-5.25v16h-1.5V3H6C4.9,3,4,3.9,4,5v14H3v2h18v-2H20z M10,13H8v-2h2V13z M16,13h-2v-2h2V13z" />
            </g>
          </SvgIcon>
        );
      }

    case "Z":
      if (nameClass) {
        return <AccountBalanceIcon sx={nameClass} {...props} />;
      } else {
        return <AccountBalanceIcon {...props} />;
      }

    default:
      break;
  }
}
