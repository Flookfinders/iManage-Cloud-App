/* #region header */
/**************************************************************************************************
//
//  Description: Helper utilities
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001            Sean Flook                 Initial Revision.
//    002   05.04.23 Sean Flook         WI40669 Handle commas in error messages. Correctly format cross reference source in GetCrossRefAvatar.
//    003   19.04.23 Sean Flook         WI40653 Added includeCheck.
//    004   28.06.23 Sean Flook         WI40256 Changed Extent to Provenance where appropriate.
//    005   20.09.23 Sean Flook                 Changed required for display streets and properties in Google street view. Also fixed ArraysEqual.
//    006   22.09.23 Sean Flook                 Changes required to handle Scottish classifications.
//    007   06.10.23 Sean Flook                 Use colour variables.
//    008   11.10.23 Sean Flook       IMANN-163 Moved doOpenRecord here so it can be called from all the other files.
//    009   03.11.23 Sean Flook       IMANN-175 Added mapSelectSearchString and modified StringAvatar.
//    010   10.11.23 Sean Flook                 Removed HasASDPlus as no longer required.
//    011   24.11.23 Sean Flook                 Moved Stack to @mui/system and ignore connecting words in TitleCase.
//    012   30.11.23 Sean Flook                 added ' of ' to the ignore list in TitleCase.
//    013   19.12.23 Sean Flook                 Various bug fixes.
//    014   02.01.24 Sean Flook                 Added defaultMapLayerIds.
//    015   02.01.24 Sean Flook                 Changed console.log to console.error for error messages.
//    016   10.01.24 Sean Flook                 Fix warnings.
//    017   12.01.24 Sean Flook       IMANN-233 Added getStartEndCoordinates.
//    018   16.01.24 Sean Flook                 Added filteredLookups.
//    019   26.01.24 Sean Flook       IMANN-260 Corrected field name.
//    020   01.02.24 Sean Flook                 Correctly handle BS7666 in lookupToTitleCase.
//    021   02.02.24 Sean Flook       IMANN-269 Added isIso885914.
//    022   08.02.24 Joel Benford     RTAB3     GetAvatarTooltip now takes streetStateCode
//    023   13.02.24 Sean Flook                 Corrected the type 66 map data.
//    024   16.02.24 Sean Flook        ESU17_GP Added mergeArrays.
//    025   27.02.24 Sean Flook           MUL16 Added renderErrors.
//    026   08.03.24 Sean Flook       IMANN-348 Updated GetChangedAssociatedRecords and ResetContexts.
//    027   12.03.24 Sean Flook           MUL10 Replaced renderErrors with renderErrorListItem.
//    028   22.03.24 Sean Flook           GLB12 Added shorten.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import { useContext } from "react";
import LookupContext from "../context/lookupContext";
import proj4 from "proj4";
import Wkt from "wicket";
import { encode } from "iso-8859-14";
import { GetWhoAmIUrl, HasASD } from "../configuration/ADSConfig";
import ObjectComparison, {
  blpuAppCrossRefKeysToIgnore,
  classificationKeysToIgnore,
  constructionKeysToIgnore,
  esuKeysToIgnore,
  heightWidthWeightKeysToIgnore,
  highwayDedicationKeysToIgnore,
  interestKeysToIgnore,
  lpiKeysToIgnore,
  maintenanceResponsibilityKeysToIgnore,
  noteKeysToIgnore,
  oneWayExemptionKeysToIgnore,
  organisationKeysToIgnore,
  provenanceKeysToIgnore,
  publicRightOfWayKeysToIgnore,
  reinstatementCategoryKeysToIgnore,
  specialDesignationKeysToIgnore,
  streetDescriptorKeysToIgnore,
  successorCrossRefKeysToIgnore,
} from "../utils/ObjectComparison";
import { GetStreetMapData } from "../utils/StreetUtils";
import { GetPropertyMapData } from "../utils/PropertyUtils";

import StreetType from "../data/StreetType";
import StreetState from "../data/StreetState";
import BLPUClassification from "../data/BLPUClassification";
import OSGClassification from "../data/OSGClassification";
import LPILogicalStatus from "../data/LPILogicalStatus";
import DETRCodes from "../data/DETRCodes";

import { Avatar, Typography, Tooltip, Divider, Stack } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

import {
  adsGreenA,
  adsLightPurple,
  adsMidBlueA,
  adsLightPink,
  adsLightBrown,
  adsOrange,
  adsDarkPink,
  adsRed,
} from "./ADSColours";
import { tooltipStyle } from "./ADSStyles";

export const mapSelectSearchString = "IDX:MAP";

export const defaultMapLayerIds = [
  "backgroundPropertyLayer",
  "backgroundStreetLayer",
  "unassignedEsusLayer",
  "streetLayer",
  "propertyLayer",
  "extentLayer",
  "asd51Layer",
  "asd52Layer",
  "asd53Layer",
  "asd61Layer",
  "asd62Layer",
  "asd63Layer",
  "asd64Layer",
  "asd66Layer",
  "zoomGraphicLayer",
  "editGraphicLayer",
];

/**
 * Format the time element using AM/PM
 *
 * @param {date} date The date object that the formatted time is required from.
 * @return {string} The formatted time.
 */
function formatAMPM(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  let strTime = hours + ":" + minutes + " " + ampm;
  return strTime;
}

/**
 * Return the string of the day for the date supplied
 *
 * @param {number} day The number of the day (0: Sun - 6: Sat)
 * @return {string} The day string.
 */
function getDayString(day) {
  switch (day) {
    case 0:
      return "Sun";
    case 1:
      return "Mon";
    case 2:
      return "Tue";
    case 3:
      return "Wed";
    case 4:
      return "Thu";
    case 5:
      return "Fri";
    default:
      return "Sat";
  }
}

/**
 * Return the string of the month for the date supplied.
 *
 * @param {number} month The number for the month (0: Jan - 11: Dec)
 * @return {string} The month string
 */
export function getMonthString(month) {
  switch (month) {
    case 0:
      return "Jan";
    case 1:
      return "Feb";
    case 2:
      return "Mar";
    case 3:
      return "Apr";
    case 4:
      return "May";
    case 5:
      return "Jun";
    case 6:
      return "Jul";
    case 7:
      return "Aug";
    case 8:
      return "Sep";
    case 9:
      return "Oct";
    case 10:
      return "Nov";
    default:
      return "Dec";
  }
}

/**
 * Determine if the supplied date is a valid date.
 *
 * @param {*} d The object we want to determine if it is a date.
 * @return {boolean} True if it is a valid date; otherwise false.
 */
export function isValidDate(d) {
  return d && Object.prototype.toString.call(d) === "[object Date]" && !isNaN(d);
}

/**
 * Check to see if the date supplied is in the future.
 *
 * @param {date} d The date to check.
 * @return {boolean} True if the date is in the future; otherwise false.
 */
export function isFutureDate(d) {
  if (!d) return false;

  const today = new Date();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth() + 1; //January is 0!
  const todayYear = today.getFullYear();

  const checkDate = new Date(d);
  const checkDay = checkDate.getDate();
  const checkMonth = checkDate.getMonth() + 1;
  const checkYear = checkDate.getFullYear();

  let result = false;

  if (checkYear > todayYear) result = true;
  else if (checkYear === todayYear) {
    if (checkMonth > todayMonth) result = true;
    else if (checkMonth === todayMonth) {
      return (result = checkDay > todayDay);
    } else result = false;
  } else result = false;

  return result;
}

/**
 * Check if the date is more than 1 year old
 *
 * @param {date} d The date to check.
 * @return {boolean} True if the date is older than a year; otherwise false.
 */
export function isOlderThanYear(d) {
  if (!d) return false;

  const today = new Date();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth() + 1; //January is 0!
  const todayYear = today.getFullYear();

  const checkDate = new Date(d);
  const checkDay = checkDate.getDate();
  const checkMonth = checkDate.getMonth() + 1;
  const checkYear = checkDate.getFullYear();

  if (checkYear >= todayYear) return false;
  else {
    if (checkYear < todayYear - 1) return true;
    else {
      if (checkMonth < todayMonth) return true;
      else if (checkMonth === todayMonth) {
        if (checkDay < todayDay) return true;
        else return false;
      } else return false;
    }
  }
}

/**
 * Check to see if the date is prior to 1753
 *
 * @param {date} d The date to check.
 * @return {boolean} True if the date is older than 1753; otherwise false.
 */
export function isPriorTo1753(d) {
  if (!d) return false;

  const checkDate = new Date(d);

  const result = checkDate.getFullYear() < 1753;

  return result;
}

/**
 * Check to see if the date is prior to 1990
 *
 * @param {date} d The date to check.
 * @return {boolean} True if the date is prior to 1990; otherwise false.
 */
export function isPriorTo1990(d) {
  if (!d) return false;

  const checkDate = new Date(d);

  const result = checkDate.getFullYear() < 1990;

  return result;
}

/**
 * Check to see if the date is after 1st April 2015
 *
 * @param {date} d The date to check.
 * @return {boolean} True if the date is after 1st April 2015.
 */
export function isAfter1stApril2015(d) {
  if (!d) return false;

  const checkDate = new Date(d);

  const result =
    checkDate.getFullYear() > 2015 ||
    (checkDate.getFullYear() === 2015 && checkDate.getMonth() > 3) || //January is 0!
    (checkDate.getFullYear() === 2015 && checkDate.getMonth() === 3 && checkDate.getDate() > 1);

  return result;
}

/**
 * Check to see if the end date is before the start date.
 *
 * @param {date} start The start date.
 * @param {date} end The end date.
 * @param {boolean} [isDate=true] If true it checks a date; otherwise it checks a time.
 * @return {boolean} True if the end date is before the start date.
 */
export function isEndBeforeStart(start, end, isDate = true) {
  if (!start || !end) return false;

  let result = false;

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isDate) {
    const startDay = startDate.getDate();
    const startMonth = startDate.getMonth() + 1;
    const startYear = startDate.getFullYear();

    const endDay = endDate.getDate();
    const endMonth = endDate.getMonth() + 1;
    const endYear = endDate.getFullYear();

    if (endYear < startYear) result = true;
    else if (endYear === startYear) {
      if (endMonth < startMonth) result = true;
      else if (endMonth === startMonth) {
        result = endDay < startDay;
      } else result = false;
    } else result = false;
  } else {
    const startHour = startDate.getHours();
    const startMinute = startDate.getMinutes();
    const startSeconds = startDate.getSeconds();

    const endHour = endDate.getHours();
    const endMinute = endDate.getMinutes();
    const endSeconds = endDate.getSeconds();

    if (endHour < startHour) result = true;
    else if (endHour === startHour) {
      if (endMinute < startMinute) result = true;
      else if (endMinute === startMinute) {
        result = endSeconds < startSeconds;
      } else result = false;
    } else result = false;
  }

  return result;
}

/**
 * Get the current date as a formatted string
 *
 * @param {boolean} [includeTime=false] If true the time is included in the returned string.
 * @return {string} The current date.
 */
export function GetCurrentDate(includeTime = false) {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  const yyyy = today.getFullYear();
  if (includeTime) {
    const hh = String(today.getHours()).padStart(2, "0");
    const nn = String(today.getMinutes()).padStart(2, "0");
    const ss = String(today.getSeconds()).padStart(2, "0");
    return yyyy + "-" + mm + "-" + dd + "T" + hh + ":" + nn + ":" + ss;
  } else return yyyy + "-" + mm + "-" + dd + "T00:00:00";
}

/**
 * Format the supplied date as a string
 *
 * @param {date} params The date to format.
 * @return {string} The formatted date.
 */
export function FormatDate(params) {
  if (params) {
    const today = new Date();
    const todayDay = today.getDate();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();

    let paramsDate;
    if (params.value) paramsDate = new Date(params.value);
    else paramsDate = new Date(params);
    const luDay = paramsDate.getDate();
    const luMonth = paramsDate.getMonth();
    const luYear = paramsDate.getFullYear();

    // if param dates is today show AM/PM time
    if (luDay === todayDay && luMonth === todayMonth && luYear === todayYear) return formatAMPM(paramsDate);

    //if param date is in the same month and year, but not today
    if (luMonth === todayMonth && luYear === todayYear)
      return `${getDayString(paramsDate.getDay())} ${luDay} ${getMonthString(luMonth)}`;

    //if param date is same year but not same month
    if (luYear === todayYear) return `${luDay} ${getMonthString(luMonth)}`;

    return `${luDay} ${getMonthString(luMonth)} ${String(luYear)}`;
  } else {
    return "";
  }
}

/**
 * Format the supplied date as a date time string
 *
 * @param {date} params The date time to format.
 * @return {string} The formatted date and time.
 */
export function FormatDateTime(params) {
  if (params) {
    let paramsDate;
    if (params.value) paramsDate = new Date(params.value);
    else paramsDate = new Date(params);
    const luDay = paramsDate.getDate();
    const luMonth = paramsDate.getMonth();
    const luYear = paramsDate.getFullYear();

    return `${luDay} ${getMonthString(luMonth)} ${String(luYear)} at ${formatAMPM(paramsDate)}`;
  } else {
    return "";
  }
}

/**
 * Return the given date as a string
 *
 * @param {Date} params The date to return as a string.
 * @return {string} The date as a string.
 */
export function DateString(params) {
  if (params) {
    let paramsDate;
    if (params.value) paramsDate = new Date(params.value);
    else paramsDate = new Date(params);
    const luDay = paramsDate.getDate();
    const luMonth = paramsDate.getMonth();
    const luYear = paramsDate.getFullYear();

    return `${luDay} ${getMonthString(luMonth)} ${String(luYear)}`;
  } else {
    return "";
  }
}

/**
 * Convert the given date to a string.
 *
 * @param {Date} date The date to return as a string.
 * @return {string} The date as a string.
 */
export function ConvertDate(date) {
  if (!date || date.toString().includes("T00:00:00")) return date;

  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0"); // January is 0!
  const yyyy = date.getFullYear();

  return yyyy + "-" + mm + "-" + dd + "T00:00:00";
}

/**
 * Get the field used to determine the lookup label field name.
 *
 * @param {boolean} isScottish If true return the field name used for OneScotland authorities; otherwise return the field name used by GeoPlace authorities.
 * @return {string} The lookup text field name.
 */
export function GetLookupLabel(isScottish) {
  if (isScottish) return "osText";
  else return "gpText";
}

/**
 * Get the logical status avatar colour to be used.
 *
 * @param {number} logicalStatus The logical status we want the colour returned for.
 * @return {string} The avatar colour.
 */
export function GetAvatarColour(logicalStatus) {
  switch (logicalStatus) {
    case 1: // Approved
      return {
        color: adsGreenA,
      };

    case 3: // Alternative
      return {
        color: adsOrange,
      };

    case 5: // Candidate
      return {
        color: adsLightPurple,
      };

    case 6: // Provisional
      return {
        color: adsMidBlueA,
      };

    case 8: // Historical
      return {
        color: adsLightBrown,
      };

    case 11: // Under construction
      return {
        color: adsMidBlueA,
      };

    case 12: // Open
      return {
        color: adsGreenA,
      };

    case 14: // Permanently closed
      return {
        color: adsLightBrown,
      };

    case 15: // Street for addressing purposes only
      return {
        color: adsOrange,
      };

    default:
      return {
        color: adsLightPink,
      };
  }
}

/**
 * Get the avatar tooltip depending on the type, logical status and classification code.
 *
 * @param {number} type The type of record [ 15: Street, 24: LPI, etc. ]
 * @param {number} logicalStatus If type is a street then this is the street type + 10 (from elastic); otherwise it is the logical status of the LPI
 * @param {string} classificationCode The classification code for the property. This is not used for streets.
 * @param {number} streetStateCode The street state. This is only used for GP streets.
 * @param {boolean} isScottish Used to determine which field name is used to get the lookup labels.
 * @return {string} The avatar tooltip.
 */
export function GetAvatarTooltip(type, logicalStatus, classificationCode, streetStateCode, isScottish) {
  if (!type) return null;

  if (type === 15) {
    const streetType = logicalStatus && logicalStatus > 10 ? StreetType.find((x) => x.id === logicalStatus - 10) : null;
    if (!streetType) return null;
    const streetState = StreetState.find((x) => x.id === streetStateCode);
    const streetStateText = streetState ? `${streetState[GetLookupLabel(isScottish)] + ", "}` : "";
    return `${streetStateText}${streetType[GetLookupLabel(isScottish)]}`;
  } else {
    const lpiLogicalStatus = logicalStatus ? LPILogicalStatus.find((x) => x.id === logicalStatus) : null;
    const classification = classificationCode
      ? isScottish
        ? OSGClassification.find((x) => x.id === classificationCode)
        : BLPUClassification.find((x) => x.id === classificationCode)
      : isScottish
      ? OSGClassification.find((x) => x.id === "U")
      : BLPUClassification.find((x) => x.id === "U");

    return lpiLogicalStatus && classification
      ? `${lpiLogicalStatus[GetLookupLabel(isScottish)]}, ${classification.display}`
      : null;
  }
}

/**
 * Return the supplied string in sentence case
 *
 * @param {string} str The string that needs to be converted to sentence case.
 * @return {string} The string in sentence case.
 */
export function stringToSentenceCase(str) {
  if (!str || str.length === 0) return null;

  return str
    .toLowerCase()
    .replace(/\.\s+([a-z])[^.]|^(\s*[a-z])[^.]/g, (s) => s.replace(/([a-z])/, (s) => s.toUpperCase()));
}

/**
 * Return the supplied string in title case.
 *
 * @param {string} str The string that needs to be converted to title case.
 * @return {string} The string in title case.
 */
export function StringToTitleCase(str) {
  if (!str || str.length === 0) return null;

  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
}

/**
 * Return the  lookup values in title case if required.
 *
 * @param {string} option The lookup option that needs to be converted to title case.
 * @param {boolean} doNotSetTitleCase If true then the option is not converted.
 * @return {string} The lookup in title case, if required.
 */
export function lookupToTitleCase(option, doNotSetTitleCase) {
  if (doNotSetTitleCase || !option || option.length === 0) return option ? option : "";
  else if (option.includes(",") && !option.includes(", "))
    return option
      .replace(",", ", ")
      .replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
      })
      .replace("Nlpg", "NLPG")
      .replace("Bs7666", "BS7666")
      .replace("Crm", "CRM")
      .replace("Sn And N", "SN and N")
      .replace("Lpi", "LPI")
      .replace("Symphony Snn", "Symphony SNN")
      .replace("Symphony Iexchange", "Symphony iExchange")
      .replace("Lo_asd", "LO_ASD")
      .replaceAll(" And ", " and ")
      .replaceAll(" The ", " the ")
      .replaceAll(" Of ", " of ")
      .replaceAll(" To ", " to ");
  else
    return option
      .replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
      })
      .replace("Nlpg", "NLPG")
      .replace("Bs7666", "BS7666")
      .replace("Crm", "CRM")
      .replace("Sn And N", "SN and N")
      .replace("Lpi", "LPI")
      .replace("Symphony Snn", "Symphony SNN")
      .replace("Symphony Iexchange", "Symphony iExchange")
      .replace("Lo_asd", "LO_ASD")
      .replaceAll(" And ", " and ")
      .replaceAll(" The ", " the ")
      .replaceAll(" Of ", " of ")
      .replaceAll(" To ", " to ");
}

/**
 * Fallback method to copy text to the clipboard.
 *
 * @param {string} text The text that needs to be copied to the clipboard.
 */
function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand("copy");
    var msg = successful ? "successful" : "unsuccessful";
    console.log("Fallback: Copying text command was " + msg);
  } catch (err) {
    console.error("Fallback: Oops, unable to copy", err);
  }

  document.body.removeChild(textArea);
}

/**
 * Copy the supplied text to the clipboard.
 *
 * @param {string} text The text that needs to be copied to the clipboard.
 * @return {string}
 */
export function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(
    function () {
      console.log("Async: Copying to clipboard was successful!");
    },
    function (err) {
      console.log("Async: Could not copy text:", err);
    }
  );
}

/**
 * Get the cross reference avatar
 *
 * @param {object} params The cross reference object
 * @return {JSX.Element|null} The cross reference avatar.
 */
export function GetCrossRefAvatar(params) {
  const lookupContext = useContext(LookupContext);

  function getSourceCode(code) {
    const rec = lookupContext.currentLookups.appCrossRefs.find((x) => x.pkId === code);

    if (rec) return rec.xrefSourceRef73.substring(4, 6);
    else return null;
  }

  function getSourceText(code) {
    const rec = lookupContext.currentLookups.appCrossRefs.find((x) => x.pkId === code);

    if (rec) return lookupToTitleCase(rec.xrefDescription, false);
    else return null;
  }

  if (params) {
    return (
      <Stack direction="row" spacing={1}>
        <Avatar variant="rounded" sx={{ height: "24px", width: "24px", backgroundColor: adsDarkPink }}>
          <Typography variant="caption">{getSourceCode(params.value)}</Typography>
        </Avatar>
        <Typography variant="body2">{getSourceText(params.value)}</Typography>
      </Stack>
    );
  } else return null;
}

/**
 * Get the historic avatar
 *
 * @param {object} params The row of data to check if it is historic.
 * @return {JSX.Element|null} The historic avatar.
 */
export function GetHistoricAvatar(params) {
  if (params && params.row.endDate) {
    return <CheckIcon sx={{ color: adsDarkPink }} />;
  } else return null;
}

/**
 * Get the user information for the current user.
 *
 * @param {string} userToken The token for the user who is calling the function.
 * @return {object|null} The user information object.
 */
export async function GetUserInformation(userToken) {
  const userUrl = await GetWhoAmIUrl(userToken);

  if (userUrl) {
    const returnValue = await fetch(`${userUrl.url}`, {
      headers: userUrl.headers,
      crossDomain: true,
      method: "GET",
    })
      .then((res) => (res.ok ? res : Promise.reject(res)))
      .then((res) => res.json())
      .then(
        (result) => {
          return result;
        },
        (error) => {
          console.error("[ERROR] Get user information", error);
          return null;
        }
      );

    return returnValue;
  } else return null;
}

/**
 * Converts a BNG point into WGS84 (long/lat) point.
 *
 * @param {array} bngPoint An array of the BNG point coordinates.
 * @return {array} The array of WGS84 point coordinates.
 */
export function ConvertBNGtoWGS84(bngPoint) {
  const osgbProjection =
    'PROJCS["OSGB 1936 / British National Grid",GEOGCS["OSGB 1936",DATUM["OSGB_1936",SPHEROID["Airy 1830",6377563.396,299.3249646,AUTHORITY["EPSG","7001"]],AUTHORITY["EPSG","6277"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.01745329251994328,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4277"]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",49],PARAMETER["central_meridian",-2],PARAMETER["scale_factor",0.9996012717],PARAMETER["false_easting",400000],PARAMETER["false_northing",-100000],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AUTHORITY["EPSG","27700"]]';
  const wgs84Projection =
    'GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["Degree",0.0174532925199433]]';

  const wgs84Point = proj4(osgbProjection, wgs84Projection, bngPoint);

  return wgs84Point;
}

/**
 * Get the coordinates from a WKT string
 *
 * @param {string} wktStr The well known text (WKT) geometry string that we need to get the coordinates from.
 * @return {array} The array of coordinates.
 */
export function GetWktCoordinates(wktStr) {
  var wkt = new Wkt.Wkt();

  try {
    // Catch any malformed WKT strings
    wkt.read(wktStr);
  } catch (e1) {
    try {
      wkt.read(wktStr.replace("\n", "").replace("\r", "").replace("\t", ""));
    } catch (e2) {
      if (e2.name === "WKTError") {
        alert(
          `Wicket could not understand the WKT string you entered.\nCheck that you have parentheses balanced, and try removing tabs and newline characters.\n\n[wktStr: "${wktStr}"]`
        );
        return [];
      }
    }
  }

  const wktObj = wkt.toJson();
  return wktObj.coordinates;
}

/**
 * Return a WKT string from a polyline.
 *
 * @param {array|string} polyline The polyline object that needs to be converted to Well Known Text (WKT).
 * @return {string} The WKT for the given polyline.
 */
export function GetPolylineAsWKT(polyline) {
  const typeLineString = "LineString";
  const typeMultiLineString = "MultiLineString";

  if (!polyline) return "";

  if (Array.isArray(polyline)) {
    const wktType = polyline.length > 1 ? typeMultiLineString : typeLineString;

    const wktConvertedPaths = polyline.map(
      (g) =>
        `(${(g.geometry ? g.geometry.paths : []).map((points) => points.map((p) => `${p[0]} ${p[1]}`).join(", "))})`
    );

    if (wktType === typeMultiLineString) return `${wktType.toUpperCase()} (${wktConvertedPaths.join(", ")})`;
    else return `${wktType.toUpperCase()} ${wktConvertedPaths.join(", ")}`;
  } else {
    return `LINESTRING (${(polyline.paths ? polyline.paths : []).map((points) =>
      points.map((p) => `${p[0]} ${p[1]}`).join(", ")
    )})`;
  }
}

/**
 * Return a WKT string from a polygon.
 *
 * @param {array|string} polygon The polygon object that needs to be converted to Well Known Text (WKT).
 * @return {string} The WKT for the given polygon.
 */
export function GetPolygonAsWKT(polygon) {
  if (!polygon) return "";

  if (Array.isArray(polygon)) {
    const wktConvertedPaths = polygon.map(
      (g) =>
        `(${(g.geometry ? g.geometry.rings : []).map((points) => points.map((p) => `${p[0]} ${p[1]}`).join(", "))})`
    );

    return `POLYGON (${wktConvertedPaths.join(", ")})`;
  } else {
    return `POLYGON((${(polygon.rings ? polygon.rings : []).map((points) =>
      points.map((p) => `${p[0]} ${p[1]}`).join(", ")
    )}))`;
  }
}

/**
 * Get the username for the current logged in user.
 *
 * @param {string} username The string from which we need to extract the username.
 * @return {string} The user name.
 */
export function GetUserName(username) {
  if (username) {
    const lastSlash = username.lastIndexOf("\\");
    let user;
    if (lastSlash > -1) {
      user = username.substring(lastSlash + 1);
    } else user = username;

    return user.replace(".", " ").replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    });
  } else {
    return "Unknown user";
  }
}

/**
 * Get the avatar for the currently logged in user.
 *
 * @param {string} username The string from which we need to generate the avatar for the user.
 * @return {JSX.Element} The users avatar.
 */
export function GetUserAvatar(username) {
  const user = GetUserName(username);

  return (
    <Tooltip title={user} sx={tooltipStyle}>
      <Avatar {...StringAvatar(username, false)} />
    </Tooltip>
  );
}

/**
 * Get a list of associated record types, used when deleting an object
 *
 * @param {string} type The type of object we are wanting the associated records for [ street | property ]
 * @param {object} sandboxContext The sandbox context to use to determine which associated records are present.
 * @param {boolean} [geometryTypeChanged=false] If true for street object ESU is added and for a property object Extent is added.
 * @return {array} The array of record types that have been changed.
 */
export function GetChangedAssociatedRecords(type, sandboxContext, geometryTypeChanged = false) {
  const associatedRecords = [];

  switch (type) {
    case "street":
      if (
        sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor &&
        !ObjectComparison(
          sandboxContext.currentSandbox.sourceStreet.streetDescriptors.find(
            (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor.pkId
          ),
          sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor,
          streetDescriptorKeysToIgnore
        )
      )
        associatedRecords.push("Descriptor");
      if (
        (sandboxContext.currentSandbox.currentStreetRecords.esu &&
          !ObjectComparison(
            sandboxContext.currentSandbox.sourceStreet.esus.find(
              (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.esu.pkId
            ),
            sandboxContext.currentSandbox.currentStreetRecords.esu,
            esuKeysToIgnore
          )) ||
        geometryTypeChanged
      )
        associatedRecords.push("ESU");
      if (
        sandboxContext.currentSandbox.currentStreetRecords.highwayDedication &&
        !ObjectComparison(
          sandboxContext.currentSandbox.sourceStreet.esus
            .find((x) => x.esuId === sandboxContext.currentSandbox.currentStreetRecords.highwayDedication.esuId)
            .highwayDedications.find(
              (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.highwayDedication.pkId
            ),
          sandboxContext.currentSandbox.currentStreetRecords.highwayDedication,
          highwayDedicationKeysToIgnore
        )
      )
        associatedRecords.push("Highway Dedication");
      if (
        sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption &&
        !ObjectComparison(
          sandboxContext.currentSandbox.sourceStreet.esus
            .find((x) => x.esuId === sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption.esuId)
            .oneWayExemptions.find(
              (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption.pkId
            ),
          sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption,
          oneWayExemptionKeysToIgnore
        )
      )
        associatedRecords.push("One-way Exemption");
      if (
        sandboxContext.currentSandbox.currentStreetRecords.successorCrossRef &&
        !ObjectComparison(
          sandboxContext.currentSandbox.sourceStreet.successorCrossRefs.find(
            (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.successorCrossRef.pkId
          ),
          sandboxContext.currentSandbox.currentStreetRecords.successorCrossRef,
          successorCrossRefKeysToIgnore
        )
      )
        associatedRecords.push("Successor Cross Reference");
      if (
        sandboxContext.currentSandbox.currentStreetRecords.maintenanceResponsibility &&
        !ObjectComparison(
          sandboxContext.currentSandbox.sourceStreet.maintenanceResponsibilities.find(
            (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.maintenanceResponsibility.pkId
          ),
          sandboxContext.currentSandbox.currentStreetRecords.maintenanceResponsibility,
          maintenanceResponsibilityKeysToIgnore
        )
      )
        associatedRecords.push("Maintenance Responsibility");
      if (
        sandboxContext.currentSandbox.currentStreetRecords.reinstatementCategory &&
        !ObjectComparison(
          sandboxContext.currentSandbox.sourceStreet.reinstatementCategories.find(
            (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.reinstatementCategory.pkId
          ),
          sandboxContext.currentSandbox.currentStreetRecords.reinstatementCategory,
          reinstatementCategoryKeysToIgnore
        )
      )
        associatedRecords.push("Reinstatement Category");
      if (
        sandboxContext.currentSandbox.currentStreetRecords.osSpecialDesignation &&
        !ObjectComparison(
          sandboxContext.currentSandbox.sourceStreet.specialDesignations.find(
            (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.osSpecialDesignation.pkId
          ),
          sandboxContext.currentSandbox.currentStreetRecords.osSpecialDesignation,
          specialDesignationKeysToIgnore
        )
      )
        associatedRecords.push("Special Designation");
      if (
        sandboxContext.currentSandbox.currentStreetRecords.interest &&
        !ObjectComparison(
          sandboxContext.currentSandbox.sourceStreet.interests.find(
            (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.interest.pkId
          ),
          sandboxContext.currentSandbox.currentStreetRecords.interest,
          interestKeysToIgnore
        )
      )
        associatedRecords.push("Interest");
      if (
        sandboxContext.currentSandbox.currentStreetRecords.construction &&
        !ObjectComparison(
          sandboxContext.currentSandbox.sourceStreet.constructions.find(
            (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.construction.pkId
          ),
          sandboxContext.currentSandbox.currentStreetRecords.construction,
          constructionKeysToIgnore
        )
      )
        associatedRecords.push("Construction");
      if (
        sandboxContext.currentSandbox.currentStreetRecords.specialDesignation &&
        !ObjectComparison(
          sandboxContext.currentSandbox.sourceStreet.specialDesignations.find(
            (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.specialDesignation.pkId
          ),
          sandboxContext.currentSandbox.currentStreetRecords.specialDesignation,
          specialDesignationKeysToIgnore
        )
      )
        associatedRecords.push("Special Designation");
      if (
        sandboxContext.currentSandbox.currentStreetRecords.hww &&
        !ObjectComparison(
          sandboxContext.currentSandbox.sourceStreet.heightWidthWeights.find(
            (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.hww.pkId
          ),
          sandboxContext.currentSandbox.currentStreetRecords.hww,
          heightWidthWeightKeysToIgnore
        )
      )
        associatedRecords.push("Height, Width and Weight");
      if (
        sandboxContext.currentSandbox.currentStreetRecords.prow &&
        !ObjectComparison(
          sandboxContext.currentSandbox.sourceStreet.publicRightOfWays.find(
            (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.prow.pkId
          ),
          sandboxContext.currentSandbox.currentStreetRecords.prow,
          publicRightOfWayKeysToIgnore
        )
      )
        associatedRecords.push("Public Right of Way");
      if (
        sandboxContext.currentSandbox.currentStreetRecords.note &&
        !ObjectComparison(
          sandboxContext.currentSandbox.sourceStreet.streetNotes.find(
            (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.note.pkId
          ),
          sandboxContext.currentSandbox.currentStreetRecords.note,
          noteKeysToIgnore
        )
      )
        associatedRecords.push("Note");
      break;

    case "property":
      if (
        sandboxContext.currentSandbox.currentPropertyRecords.lpi &&
        !ObjectComparison(
          sandboxContext.currentSandbox.sourceProperty.lpis.find(
            (x) => x.pkId === sandboxContext.currentSandbox.currentPropertyRecords.lpi.pkId
          ),
          sandboxContext.currentSandbox.currentPropertyRecords.lpi,
          lpiKeysToIgnore
        )
      )
        associatedRecords.push("LPI");
      if (
        (sandboxContext.currentSandbox.currentPropertyRecords.provenance &&
          !ObjectComparison(
            sandboxContext.currentSandbox.sourceProperty.blpuProvenances.find(
              (x) => x.pkId === sandboxContext.currentSandbox.currentPropertyRecords.provenance.pkId
            ),
            sandboxContext.currentSandbox.currentPropertyRecords.provenance,
            provenanceKeysToIgnore
          )) ||
        geometryTypeChanged
      )
        associatedRecords.push("BLPU Provenance");
      if (
        sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef &&
        !ObjectComparison(
          sandboxContext.currentSandbox.sourceProperty.blpuAppCrossRefs.find(
            (x) => x.pkId === sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef.pkId
          ),
          sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef,
          blpuAppCrossRefKeysToIgnore
        )
      )
        associatedRecords.push("Cross Reference");
      if (
        sandboxContext.currentSandbox.currentPropertyRecords.classification &&
        !ObjectComparison(
          sandboxContext.currentSandbox.sourceProperty.classifications.find(
            (x) => x.pkId === sandboxContext.currentSandbox.currentPropertyRecords.classification.pkId
          ),
          sandboxContext.currentSandbox.currentPropertyRecords.classification,
          classificationKeysToIgnore
        )
      )
        associatedRecords.push("Classification");
      if (
        sandboxContext.currentSandbox.currentPropertyRecords.organisation &&
        !ObjectComparison(
          sandboxContext.currentSandbox.sourceProperty.organisations.find(
            (x) => x.pkId === sandboxContext.currentSandbox.currentPropertyRecords.organisation.pkId
          ),
          sandboxContext.currentSandbox.currentPropertyRecords.organisation,
          organisationKeysToIgnore
        )
      )
        associatedRecords.push("Organisation");
      if (
        sandboxContext.currentSandbox.currentPropertyRecords.successorCrossRef &&
        !ObjectComparison(
          sandboxContext.currentSandbox.sourceProperty.successorCrossRefs.find(
            (x) => x.pkId === sandboxContext.currentSandbox.currentPropertyRecords.successorCrossRef.pkId
          ),
          sandboxContext.currentSandbox.currentPropertyRecords.successorCrossRef,
          successorCrossRefKeysToIgnore
        )
      )
        associatedRecords.push("Successor Cross Reference");
      if (
        sandboxContext.currentSandbox.currentPropertyRecords.note &&
        !ObjectComparison(
          sandboxContext.currentSandbox.sourceProperty.blpuNotes.find(
            (x) => x.pkId === sandboxContext.currentSandbox.currentPropertyRecords.note.pkId
          ),
          sandboxContext.currentSandbox.currentPropertyRecords.note,
          noteKeysToIgnore
        )
      )
        associatedRecords.push("Note");
      break;

    default:
      associatedRecords.push(`Unknown type: ${type}`);
      break;
  }

  return associatedRecords;
}

/**
 * Determine if 2 arrays are the same
 *
 * @param {array} a The first array.
 * @param {array} b The second array.
 * @return {boolean} True if the arrays are the same; otherwise false.
 */
export function ArraysEqual(a, b) {
  a = Array.isArray(a) ? a : [];
  b = Array.isArray(b) ? b : [];
  return (
    a.length === b.length &&
    a.every((el, ix) => {
      if (
        typeof el === "object" &&
        !Array.isArray(el) &&
        el !== null &&
        typeof b[ix] === "object" &&
        !Array.isArray(b[ix]) &&
        b[ix] !== null
      ) {
        return ObjectComparison(el, b[ix], []);
      } else return el === b[ix];
    })
  );
}

/**
 * Get the check information for the given check Id
 *
 * @param {number} checkId The number of the validation check that is required.
 * @param {object} currentLookups The context for the current lookups.
 * @param {string} method The name of the function that is calling this function.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @param {boolean} showDebugMessages If true write a debug message to the console.
 * @return {object} The validation check for the given id.
 */
export function GetCheck(checkId, currentLookups, method, isScottish, showDebugMessages) {
  const currentCheck = currentLookups.validationMessages.find((x) => x.messageId === checkId);

  if (showDebugMessages)
    console.log(`[DEBUG] ${method} - ${checkId}: ${GetErrorMessage(currentCheck, isScottish).replace("¬", ",")}`);

  return currentCheck;
}

/**
 * Function to determine if a check should be included in the checks done on the data
 *
 * @param {object} currentCheck The current validation check that we are seeing if we should ignore or not.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @return {boolean} True if the check should be included; otherwise false.
 */
export const includeCheck = (currentCheck, isScottish) => {
  return (
    currentCheck &&
    !currentCheck.ignoreCheck &&
    ((currentCheck.gpCheck && !isScottish) || (currentCheck.osCheck && isScottish))
  );
};

/**
 * Get the error message for the given check
 *
 * @param {object} currentCheck The current validation check that we require the error message for.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @param {boolean} [includeHealthCheckCodes=false] If true then the health check codes are included in the error message; otherwise they are excluded.
 * @return {string} The error message for the failed validation.
 */
export function GetErrorMessage(currentCheck, isScottish, includeHealthCheckCodes = false) {
  const getHealthCheckCodes = () => {
    const defaultIdoxCode = `${
      process.env.NODE_ENV === "development" ? " [" + currentCheck.messageId.toString() + "]" : ""
    }`;

    if (includeHealthCheckCodes) {
      if (isScottish) {
        return currentCheck.osgCode
          ? ` [OSG: ${currentCheck.osgCode}${
              process.env.NODE_ENV === "development" ? "; Idox: " + currentCheck.messageId.toString() : ""
            }]`
          : defaultIdoxCode;
      } else {
        let healthCheckCodes = [];
        if (currentCheck.llpgCode) healthCheckCodes.push(`LLPG: ${currentCheck.llpgCode}`);
        if (currentCheck.lsgCode) healthCheckCodes.push(`LSG: ${currentCheck.lsgCode}`);
        if (currentCheck.asdCode) healthCheckCodes.push(`ASD: ${currentCheck.asdCode}`);

        return healthCheckCodes.length > 0
          ? ` [${healthCheckCodes.join("; ")}${
              process.env.NODE_ENV === "development" ? "; Idox: " + currentCheck.messageId.toString() : ""
            }]`
          : defaultIdoxCode;
      }
    } else return defaultIdoxCode;
  };

  return `${currentCheck.errorMessage.replace(",", "¬")}${getHealthCheckCodes()}`;
}

/**
 * Check to see if 2 polygons are the same
 *
 * @param {string} polygon1 The Well Know Text for polygon 1.
 * @param {string} polygon2 The Well Know Text for polygon 2.
 * @return {boolean} True if the polygons are equal; otherwise false.
 */
export function PolygonsEqual(polygon1, polygon2) {
  const polygonCoords1 = polygon1.replace("POLYGON ((", "").replace("))", "").split(", ");
  const polygonCoords2 = polygon2.replace("POLYGON ((", "").replace("))", "").split(", ");
  let polygonsEqual = polygonCoords1.length === polygonCoords2.length;

  if (polygonsEqual) {
    for (const coord of polygonCoords1) {
      polygonsEqual = polygonCoords2.includes(coord);
      if (!polygonsEqual) break;
    }
  }

  return polygonsEqual;
}

/**
 * Convert the given string to a given colour, used for user avatars.
 *
 * @param {string} string The string from which we need to generate a colour string for.
 * @return {string} The colour representation for the given string.
 */
export function StringToColour(string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let colour = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    colour += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return colour;
}

/**
 * Generate styling for the current users avatar.
 *
 * @param {object} username The information for the current user of the application.
 * @param {boolean} smallAvatar If true the avatar will be small; otherwise the avatar will be large.
 * @param {boolean} [clickable=false] If true then the avatar is clickable and the cursor will be set appropriately.
 * @return {object} The styling used for the user avatars.
 */
export function StringAvatar(username, smallAvatar, clickable = false) {
  let userInitials = "?";
  const user = GetUserName(username);

  if (user) {
    if (user.includes(" ")) {
      const userArray = user.split(" ");

      userInitials =
        userArray[0].substring(0, 1).toUpperCase() + userArray[userArray.length - 1].substring(0, 1).toUpperCase();
    } else userInitials = user.substring(0, 1).toUpperCase();

    if (smallAvatar) {
      if (clickable)
        return {
          sx: {
            backgroundColor: StringToColour(user),
            height: 20,
            width: 20,
            cursor: "pointer",
          },
          children: (
            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "10px" }}>
              {userInitials}
            </Typography>
          ),
        };
      else
        return {
          sx: {
            backgroundColor: StringToColour(user),
            height: 20,
            width: 20,
          },
          children: (
            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "10px" }}>
              {userInitials}
            </Typography>
          ),
        };
    } else {
      if (clickable)
        return {
          sx: {
            backgroundColor: StringToColour(user),
            height: 30,
            width: 30,
            cursor: "pointer",
          },
          children: (
            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "16px" }}>
              {userInitials}
            </Typography>
          ),
        };
      else
        return {
          sx: {
            backgroundColor: StringToColour(user),
            height: 30,
            width: 30,
          },
          children: (
            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "16px" }}>
              {userInitials}
            </Typography>
          ),
        };
    }
  } else return null;
}

/**
 * The list of GeoPlace cross references that need to be exported.
 */
export const GeoPlaceCrossRefSources = ["BG", "CT", "ER", "IA", "ND", "OS", "PA", "S1", "S2", "S3", "S4", "S5"];

/**
 * Reset the required context objects.
 *
 * @param {string} type The type of data to clear.
 * @param {object} mapContext The map context object.
 * @param {object} streetContext The street context object.
 * @param {object} propertyContext The property context object.
 * @param {object} sandboxContext The sandbox context object.
 */
export function ResetContexts(type, mapContext, streetContext, propertyContext, sandboxContext) {
  mapContext.onSetCoordinate(null);

  switch (type) {
    case "street":
      streetContext.onStreetModified(false);
      streetContext.resetStreet();
      streetContext.resetStreetErrors();
      break;

    case "property":
      propertyContext.onPropertyModified(false);
      propertyContext.resetProperty();
      propertyContext.resetPropertyErrors();
      break;

    default: // All
      streetContext.onStreetModified(false);
      streetContext.resetStreet();
      propertyContext.onPropertyModified(false);
      propertyContext.resetProperty();
      streetContext.resetStreetErrors();
      propertyContext.resetPropertyErrors();
      break;
  }

  sandboxContext.resetSandbox(type);
}

/**
 * Event to get the authority display.
 *
 * @param {number} value The DETR code for the authority
 * @returns {string} The authority code and name.
 */
export const getAuthorityText = (value) => {
  const rec = DETRCodes.find((x) => x.id === value);

  if (rec) return `${rec.id} - ${rec.text}`;
  else return null;
};

/**
 * Method to get the full language string.
 *
 * @param {string} value The language code.
 * @returns {string} The full language string.
 */
export const getDisplayLanguage = (value) => {
  switch (value) {
    case "BIL":
      return "Bilingual";

    case "CYM":
      return "Welsh";

    case "GAE":
      return "Gaelic";

    default:
      return "English";
  }
};

/**
 * Method to open Google street view at a specific point.
 *
 * @param {array} bngPoint The array of the BNG point coordinates where we want to open Google street view.
 */
export const openInStreetView = (bngPoint) => {
  const wgs84Point = ConvertBNGtoWGS84(bngPoint);

  if (wgs84Point) {
    const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${wgs84Point[1]}%2C${wgs84Point[0]}`;
    window.open(streetViewUrl, "_blank");
  }
};

/**
 * Method to open the given record after closing the property create wizard.
 *
 * @param {object} rec The record that we want to open.
 * @param {object|null} openRelated If set it is the details of the property that should be highlighted in the related tab when opening the record.
 * @param {object} currentSearchData The current search data
 * @param {object} mapContext The map context object.
 * @param {object} streetContext The street context object.
 * @param {object} propertyContext The property context object.
 * @param {string} userToken The token for the user who is calling the function.
 * @param {boolean} isScottish If true return the field name used for OneScotland authorities; otherwise return the field name used by GeoPlace authorities.
 */
export async function doOpenRecord(
  rec,
  openRelated,
  currentSearchData,
  mapContext,
  streetContext,
  propertyContext,
  userToken,
  isScottish
) {
  if (rec.type === 15) {
    const foundStreet = currentSearchData.find((x) => x.type === 15 && x.usrn === rec.usrn);
    const currentSearchStreets = JSON.parse(JSON.stringify(mapContext.currentSearchData.streets));

    if (!foundStreet) {
      const streetData = await GetStreetMapData(rec.usrn, userToken, isScottish);
      const engDescriptor = streetData.streetDescriptors.filter((x) => x.language === "ENG");
      streetContext.onStreetChange(rec.usrn, engDescriptor.streetDescriptor, false, openRelated);
      const esus = streetData
        ? streetData.esus.map((esuRec) => ({
            esuId: esuRec.esuId,
            state: isScottish ? esuRec.sate : undefined,
            geometry:
              esuRec.wktGeometry && esuRec.wktGeometry !== "" ? GetWktCoordinates(esuRec.wktGeometry) : undefined,
          }))
        : undefined;
      const asdType51 =
        isScottish && streetData
          ? streetData.maintenanceResponsibilities.map((asdRec) => ({
              type: 51,
              pkId: asdRec.pkId,
              usrn: asdRec.usrn,
              streetStatus: asdRec.streetStatus,
              custodianCode: asdRec.custodianCode,
              maintainingAuthorityCode: asdRec.maintainingAuthorityCode,
              wholeRoad: asdRec.wholeRoad,
              geometry:
                asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
            }))
          : undefined;
      const asdType52 =
        isScottish && streetData
          ? streetData.reinstatementCategories.map((asdRec) => ({
              type: 52,
              pkId: asdRec.pkId,
              usrn: asdRec.usrn,
              reinstatementCategoryCode: asdRec.reinstatementCategoryCode,
              custodianCode: asdRec.custodianCode,
              reinstatementAuthorityCode: asdRec.reinstatementAuthorityCode,
              wholeRoad: asdRec.wholeRoad,
              geometry:
                asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
            }))
          : undefined;
      const asdType53 =
        isScottish && streetData
          ? streetData.specialDesignations.map((asdRec) => ({
              type: 53,
              pkId: asdRec.pkId,
              usrn: asdRec.usrn,
              specialDesig: asdRec.specialDesig,
              custodianCode: asdRec.custodianCode,
              authorityCode: asdRec.authorityCode,
              wholeRoad: asdRec.wholeRoad,
              geometry:
                asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
            }))
          : undefined;
      const asdType61 =
        !isScottish && HasASD() && streetData
          ? streetData.interests.map((asdRec) => ({
              type: 61,
              pkId: asdRec.pkId,
              usrn: asdRec.usrn,
              streetStatus: asdRec.streetStatus,
              interestType: asdRec.interestType,
              districtRefAuthority: asdRec.districtRefAuthority,
              swaOrgRefAuthority: asdRec.swaOrgRefAuthority,
              wholeRoad: asdRec.wholeRoad,
              geometry:
                asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
            }))
          : undefined;
      const asdType62 =
        !isScottish && HasASD() && streetData
          ? streetData.constructions.map((asdRec) => ({
              type: 62,
              pkId: asdRec.pkId,
              usrn: asdRec.usrn,
              constructionType: asdRec.constructionType,
              reinstatementTypeCode: asdRec.reinstatementTypeCode,
              swaOrgRefConsultant: asdRec.swaOrgRefConsultant,
              districtRefConsultant: asdRec.districtRefConsultant,
              wholeRoad: asdRec.wholeRoad,
              geometry:
                asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
            }))
          : undefined;
      const asdType63 =
        !isScottish && HasASD() && streetData
          ? streetData.specialDesignations.map((asdRec) => ({
              type: 63,
              pkId: asdRec.pkId,
              usrn: asdRec.usrn,
              streetSpecialDesigCode: asdRec.streetSpecialDesigCode,
              swaOrgRefConsultant: asdRec.swaOrgRefConsultant,
              districtRefConsultant: asdRec.districtRefConsultant,
              wholeRoad: asdRec.wholeRoad,
              geometry:
                asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
            }))
          : undefined;
      const asdType64 =
        !isScottish && HasASD() && streetData
          ? streetData.heightWidthWeights.map((asdRec) => ({
              type: 64,
              pkId: asdRec.pkId,
              usrn: asdRec.usrn,
              hwwRestrictionCode: asdRec.hwwRestrictionCode,
              swaOrgRefConsultant: asdRec.swaOrgRefConsultant,
              districtRefConsultant: asdRec.districtRefConsultant,
              wholeRoad: asdRec.wholeRoad,
              geometry:
                asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
            }))
          : undefined;
      const asdType66 =
        !isScottish && HasASD() && streetData
          ? streetData.publicRightOfWays.map((asdRec) => ({
              type: 66,
              pkId: asdRec.pkId,
              prowUsrn: asdRec.prowUsrn,
              prowRights: asdRec.prowRights,
              prowStatus: asdRec.prowStatus,
              prowOrgRefConsultant: asdRec.prowOrgRefConsultant,
              prowDistrictRefConsultant: asdRec.prowDistrictRefConsultant,
              defMapGeometryType: asdRec.defMapGeometryType,
              geometry:
                asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
            }))
          : undefined;
      currentSearchStreets.push({
        usrn: rec.usrn,
        description: engDescriptor.streetDescriptor,
        language: rec.language,
        locality: engDescriptor.locality,
        town: engDescriptor.town,
        state: !isScottish && streetData ? streetData.state : undefined,
        type: streetData ? streetData.recordType : undefined,
        esus: esus,
        asdType51: asdType51,
        asdType52: asdType52,
        asdType53: asdType53,
        asdType61: asdType61,
        asdType62: asdType62,
        asdType63: asdType63,
        asdType64: asdType64,
        asdType66: asdType66,
      });
    } else {
      streetContext.onStreetChange(rec.usrn, foundStreet.street, false, openRelated);
    }
    mapContext.onSearchDataChange(currentSearchStreets, mapContext.currentSearchData.properties, rec.usrn, null);
    mapContext.onEditMapObject(null, null);
  } else if (rec.type === 24) {
    propertyContext.onPropertyChange(
      rec.uprn,
      0,
      rec.address,
      rec.formattedAddress,
      rec.postcode,
      rec.easting,
      rec.northing,
      false,
      null,
      openRelated
    );
    const foundProperty = mapContext.currentSearchData.properties.find(({ uprn }) => uprn === rec.uprn);
    const currentSearchProperties = JSON.parse(JSON.stringify(mapContext.currentSearchData.properties));

    if (!foundProperty) {
      currentSearchProperties.push({
        uprn: rec.uprn,
        address: rec.formattedaddress,
        postcode: rec.postcode,
        easting: rec.easting,
        northing: rec.northing,
        logicalStatus: rec.logical_status,
        classificationCode: rec.classification_code ? rec.classification_code.substring(0, 1) : "U",
      });
    }
    const propertyData = await GetPropertyMapData(rec.uprn, userToken);
    const extents = propertyData
      ? propertyData.blpuProvenances.map((provRec) => ({
          pkId: provRec.pkId,
          uprn: propertyData.uprn,
          code: provRec.provenanceCode,
          geometry:
            provRec.wktGeometry && provRec.wktGeometry !== "" ? GetWktCoordinates(provRec.wktGeometry) : undefined,
        }))
      : undefined;

    mapContext.onSearchDataChange(mapContext.currentSearchData.streets, currentSearchProperties, null, rec.uprn);
    mapContext.onMapChange(extents, null, null);
    mapContext.onEditMapObject(21, rec.uprn);
  }
}

/**
 * Method to extract the start and end coordinates from the supplied wkt string.
 *
 * @param {string} wktGeometry The wktGeometry to get the start and end coordinates from.
 * @returns {object} The start and end coordinates from the supplied wkt string.
 */
export const getStartEndCoordinates = (wktGeometry) => {
  if (wktGeometry.includes("LINESTRING")) {
    const coordinates = wktGeometry
      .replace("MULTI", "")
      .replace("LINESTRING(", "")
      .replace("LINESTRING (", "")
      .replaceAll("(", "")
      .replaceAll(")", "")
      .split(", ");

    const startCoordinate = coordinates[0].split(" ");
    const endCoordinate = coordinates[coordinates.length - 1].split(" ");

    return {
      startX: Number.parseFloat(startCoordinate[0]).toFixed(4),
      startY: Number.parseFloat(startCoordinate[1]).toFixed(4),
      endX: Number.parseFloat(endCoordinate[0]).toFixed(4),
      endY: Number.parseFloat(endCoordinate[1]).toFixed(4),
    };
  } else return null;
};

/**
 * Returns a list of lookups depending on if the authority is Scottish or not.
 *
 * @param {array} rawLookup The unfiltered lookups.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @return {array} The filtered lookups.
 */
export const filteredLookup = (rawLookup, isScottish) => {
  if (isScottish) {
    return rawLookup.filter((x) => x.osText);
  } else {
    return rawLookup.filter((x) => x.gpText);
  }
};

/**
 * Method to see if the text conforms to ISO 8859-14.
 *
 * @param {string} text The string to check that it conforms to ISO 8859-14.
 * @returns {boolean} True if the text conforms to ISO 8859-14; otherwise false.
 */
export const isIso885914 = (text) => {
  let result = true;
  if (text) {
    try {
      const encodedData = encode(text, { mode: "fatal" });
      result = !!encodedData;
    } catch (error) {
      result = false;
    }
  }
  return result;
};

export const mergeArrays = (a, b, predicate = (a, b) => a === b) => {
  const c = [...a]; // copy to avoid side effects
  // add all items from B to copy C if they're not already present
  b.forEach((bItem) => (c.some((cItem) => predicate(bItem, cItem)) ? null : c.push(bItem)));
  return c;
};

/**
 * Method to render the contents of the errors in a list.
 *
 * @param {object} rec The error object
 * @returns {JSX.Element} The contents of the error in the list.
 */
export const renderErrorListItem = (rec) => {
  const formatError = (error) => {
    if (error && error.includes(": ")) {
      const errorParts = error.split(": ");
      if (errorParts && errorParts.length === 2) return errorParts[1];
      else return error;
    } else return error;
  };

  if (Array.isArray(rec.errors)) {
    return (
      <Stack direction="row" spacing={1} divider={<Divider orientation="vertical" flexItem />}>
        <Typography variant="body2">{rec.address}</Typography>
        <Stack direction="column" spacing={0}>
          {rec.errors.map((error) => {
            return (
              <Typography variant="body2" sx={{ color: adsRed }}>
                {formatError(error)}
              </Typography>
            );
          })}
        </Stack>
      </Stack>
    );
  } else {
    return (
      <Stack direction="row" spacing={1} divider={<Divider orientation="vertical" flexItem />}>
        <Typography variant="body2">{rec.address}</Typography>
        <Typography variant="body2" sx={{ color: adsRed }}>
          {formatError(rec.errors)}
        </Typography>
      </Stack>
    );
  }
};

/**
 * Method to return a shortened string.
 *
 * @param {string} str The string you want to shorten
 * @param {number} maxLen The maximum length of the string required
 * @param {string} [separator = ""] The separator used to split the string.
 * @returns {string} The supplied string shortened to the max length.
 */
export const shorten = (str, maxLen, separator = " ") => {
  if (!str || str.length <= maxLen) return str;
  return str.substring(0, str.lastIndexOf(separator, maxLen));
};
