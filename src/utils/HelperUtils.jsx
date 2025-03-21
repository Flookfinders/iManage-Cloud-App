//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Helper utilities
//
//  Copyright:    © 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//region Version 1.0.0.0
//    001            Sean Flook                  Initial Revision.
//    002   05.04.23 Sean Flook          WI40669 Handle commas in error messages. Correctly format cross reference source in GetCrossRefAvatar.
//    003   19.04.23 Sean Flook          WI40653 Added includeCheck.
//    004   28.06.23 Sean Flook          WI40256 Changed Extent to Provenance where appropriate.
//    005   20.09.23 Sean Flook                  Changed required for display streets and properties in Google street view. Also fixed ArraysEqual.
//    006   22.09.23 Sean Flook                  Changes required to handle Scottish classifications.
//    007   06.10.23 Sean Flook                  Use colour variables.
//    008   11.10.23 Sean Flook        IMANN-163 Moved doOpenRecord here so it can be called from all the other files.
//    009   03.11.23 Sean Flook        IMANN-175 Added mapSelectSearchString and modified StringAvatar.
//    010   10.11.23 Sean Flook                  Removed HasASDPlus as no longer required.
//    011   24.11.23 Sean Flook                  Moved Stack to @mui/system and ignore connecting words in TitleCase.
//    012   30.11.23 Sean Flook                  added ' of ' to the ignore list in TitleCase.
//    013   19.12.23 Sean Flook                  Various bug fixes.
//    014   02.01.24 Sean Flook                  Added defaultMapLayerIds.
//    015   02.01.24 Sean Flook                  Changed console.log to console.error for error messages.
//    016   10.01.24 Sean Flook                  Fix warnings.
//    017   12.01.24 Sean Flook        IMANN-233 Added getStartEndCoordinates.
//    018   16.01.24 Sean Flook                  Added filteredLookups.
//    019   26.01.24 Sean Flook        IMANN-260 Corrected field name.
//    020   01.02.24 Sean Flook                  Correctly handle BS7666 in lookupToTitleCase.
//    021   02.02.24 Sean Flook        IMANN-269 Added isIso885914.
//    022   08.02.24 Joel Benford          RTAB3 GetAvatarTooltip now takes streetStateCode
//    023   13.02.24 Sean Flook                  Corrected the type 66 map data.
//    024   16.02.24 Sean Flook         ESU17_GP Added mergeArrays.
//    025   27.02.24 Sean Flook            MUL16 Added renderErrors.
//    026   08.03.24 Sean Flook        IMANN-348 Updated GetChangedAssociatedRecords and ResetContexts.
//    027   12.03.24 Sean Flook            MUL10 Replaced renderErrors with renderErrorListItem.
//    028   22.03.24 Sean Flook            GLB12 Added shorten.
//    029   28.03.24 Sean Flook                  Modified GetChangedAssociatedRecords to fully check all ESUs if geometryTypeChanged is true.
//    030   04.04.24 Sean Flook                  Added parentUprn to mapContext search data for properties.
//    031   04.04.24 Sean Flook        IMANN-320 Added error trapping for GetChangedAssociatedRecords.
//    032   09.04.24 Sean Flook        IMANN-376 Added new methods to allow for adding lookups on the fly.
//    033   23.04.24 Sean Flook        IMANN-366 Added ability to detect the type of browser being used.
//    034   23.04.24 Sean Flook                  Added bracketValidator.
//    035   26.04.24 Sean Flook                  Included check for "<" & ">" in bracketValidator.
//    036   01.05.24 Sean Flook        IMANN-429 Remove GAE code in addLookup.
//    037   09.02.24 Joel Benford     IM-227/228 Generalize ward/parish URL
//    038   03.05.24 Sean Flook                  Added getBaseMapLayers.
//    039   17.05.24 Sean Flook        IMANN-309 Only check all ESUs if geometry has changed and this is not a new street.
//    040   17.05.24 Joshua McCormick  IMANN-460 Added PUT to call English with Welsh ref
//    041   23.05.24 Sean Flook        IMANN-478 Include usedByFrontEnd in includeCheck.
//    042   30.05.24 Joel Benford      IMANN-496 Add GetOSClassificationAvatarAndText
//    043   06.06.24 Joel Benford      IMANN-497 Add data to xrefs in addLookup
//    044   18.06.24 Joel Benford      IMANN-560 Stop addLookups returning early on error
//    045   16.06.24 Sean Flook        IMANN-577 Added characterSetValidator.
//    046   19.06.24 Sean Flook        IMANN-629 Changes to code so that current user is remembered and a 401 error displays the login dialog.
//    047   20.06.24 Sean Flook        IMANN-636 Use the new user rights.
//    048   18.07.24 Sean Flook        IMANN-772 Corrected field name.
//    049   25.07.24 Joshua McCormick  IMANN-820 added mapContext.onEditMapObject in ResetContexts
//    050   28.08.24 Sean Flook        IMANN-957 Added missing formattedAddress field to map search data.
//    051   10.09.24 Sean Flook        IMANN-980 Only write to the console if the user has the showMessages right.
//endregion Version 1.0.0.0
//region Version 1.0.1.0
//    052   14.10.24 Sean Flook       IMANN-1016 Changes required to handle LLPG Streets.
//    053   31.10.24 Sean Flook       IMANN-1012 Added getLookupLinkedRef method.
//    054   01.10.24 Sean Flook       IMANN-1010 For streets the logicalStatus is no longer greater than 10 in GetAvatarTooltip.
//endregion Version 1.0.1.0
//region Version 1.0.2.0
//    055   14.11.24 Sean Flook       IMANN-1049 Look for the correct character in GetUserName.
//    056   14.11.24 Sean Flook       IMANN-1012 Added getCheckIcon.
//    057   25.11.24 Sean Flook       IMANN-1083 Changed GeoPlaceProperty1 to allow the full ISO-8859-14 character set.
//    057   18.12.24 Joshua McCormick IMANN-1109 Change GeoPlaceProperty2 to allow apostrophe for PAO/SAO
//endregion Version 1.0.2.0
//region Version 1.0.4.0
//    058   03.02.25 Sean Flook       IMANN-1676 Only validate Property strings against ISO 8859-14.
//    059   03.02.25 Sean Flook       IMANN-1678 Only validate Property strings against ISO 8859-14.
//    060   11.02.25 Sean Flook       IMANN-1680 Added blankGazetteerSearchString.
//endregion Version 1.0.4.0
//region Version 1.0.5.0
//    061   30.01.25 Sean Flook       IMANN-1673 Changes required for new user settings API.
//    062   14.03.25 Sean Flook       IMANN-1696 Fixed error in hasLoginExpired
//    063   19.03.25 Sean Flook       IMANN-1696 Tidied up code in lookupToTitleCase.
//endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//endregion header

import { useContext } from "react";
import LookupContext from "../context/lookupContext";
import proj4 from "proj4";
import Wkt from "wicket";
import { encode } from "iso-8859-14";
import {
  GetAdministrativeAreaUrl,
  GetAppCrossRefUrl,
  GetDbAuthorityUrl,
  GetIslandUrl,
  GetLocalityUrl,
  GetMapLayersUrl,
  GetOperationalDistrictUrl,
  GetParishesUrl,
  GetPostTownUrl,
  GetPostcodeUrl,
  GetSubLocalityUrl,
  GetTownUrl,
  GetWardsUrl,
} from "../configuration/ADSConfig";
import ObjectComparison, {
  EsusComparison,
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
import DoneIcon from "@mui/icons-material/Done";

import {
  adsGreenA,
  adsLightPurple,
  adsMidBlueA,
  adsLightPink,
  adsLightBrown,
  adsOrange,
  adsDarkPink,
  adsRed,
  adsLightBlue,
} from "./ADSColours";
import { tooltipStyle } from "./ADSStyles";

export const mapSelectSearchString = "IDX:MAP";
export const blankGazetteerSearchString = "IDX:GAZ";

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
 * @param {Number} type The type of record [ 15: Street, 24: LPI, etc. ]
 * @param {Number} logicalStatus If type is a street then this is the street type + 10 (from elastic); otherwise it is the logical status of the LPI
 * @param {String} classificationCode The classification code for the property. This is not used for streets.
 * @param {Number} streetStateCode The street state. This is only used for GP streets.
 * @param {Boolean} isScottish Used to determine which field name is used to get the lookup labels.
 * @return {String} The avatar tooltip.
 */
export function GetAvatarTooltip(type, logicalStatus, classificationCode, streetStateCode, isScottish) {
  if (!type) return null;

  if (type === 15) {
    const streetType = logicalStatus ? StreetType.find((x) => x.id === logicalStatus) : null;
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
  else {
    let result = option;

    if (option.includes(",") && !option.includes(", "))
      result = option.replace(",", ", ").replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
      });
    else
      result = option.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
      });

    return result
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
    document.execCommand("copy");
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
      // console.log("Async: Copying to clipboard was successful!");
    },
    function (err) {
      console.error("Async: Could not copy text:", err);
    }
  );
}

/**
 * Get the OS classification avatar and text
 *
 * @param {object} params In Scotland params.row.blpuClass will hold the OS classification code (from CLASSIFICATION table).
 * @return {JSX.Element|null} Cell containing classification avatar and text.
 */
export function GetOSClassificationAvatarAndText(params) {
  const osCode = params.row.blpuClass;
  const classificationInfo = OSGClassification.filter((x) => x.id === osCode)[0];

  if (params && osCode && classificationInfo) {
    return (
      <Stack direction="row" spacing={1}>
        <Avatar
          variant="rounded"
          sx={{
            height: "24px",
            width: `${Math.max(osCode.length, 2) * 12}px`,
            backgroundColor: classificationInfo.colour,
          }}
        >
          <Typography variant="caption">{osCode}</Typography>
        </Avatar>
        <Typography variant="body2">{classificationInfo.display || "OSGClassification not found"}</Typography>
      </Stack>
    );
  } else return null;
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
    let lastSlash = username.lastIndexOf("/");
    if (lastSlash === -1) lastSlash = username.lastIndexOf("\\");
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
        sandboxContext.currentSandbox.sourceStreet &&
        sandboxContext.currentSandbox.sourceStreet.streetDescriptors &&
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
          sandboxContext.currentSandbox.sourceStreet &&
          sandboxContext.currentSandbox.sourceStreet.esus &&
          sandboxContext.currentSandbox.sourceStreet.esus.length > 0 &&
          !ObjectComparison(
            sandboxContext.currentSandbox.sourceStreet.esus.find(
              (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.esu.pkId
            ),
            sandboxContext.currentSandbox.currentStreetRecords.esu,
            esuKeysToIgnore
          )) ||
        (geometryTypeChanged &&
          sandboxContext.currentSandbox.sourceStreet &&
          sandboxContext.currentSandbox.sourceStreet.esus &&
          sandboxContext.currentSandbox.sourceStreet.esus.length > 0 &&
          sandboxContext.currentSandbox.currentStreet &&
          sandboxContext.currentSandbox.currentStreet.esus &&
          !EsusComparison(
            sandboxContext.currentSandbox.sourceStreet.esus,
            sandboxContext.currentSandbox.currentStreet.esus
          ))
      )
        associatedRecords.push("ESU");
      if (
        sandboxContext.currentSandbox.currentStreetRecords.highwayDedication &&
        sandboxContext.currentSandbox.sourceStreet &&
        sandboxContext.currentSandbox.sourceStreet.esus &&
        sandboxContext.currentSandbox.sourceStreet.esus.length > 0 &&
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
        sandboxContext.currentSandbox.sourceStreet &&
        sandboxContext.currentSandbox.sourceStreet.esus &&
        sandboxContext.currentSandbox.sourceStreet.esus.length > 0 &&
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
        sandboxContext.currentSandbox.sourceStreet &&
        sandboxContext.currentSandbox.sourceStreet.successorCrossRefs &&
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
        sandboxContext.currentSandbox.sourceStreet &&
        sandboxContext.currentSandbox.sourceStreet.maintenanceResponsibilities &&
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
        sandboxContext.currentSandbox.sourceStreet &&
        sandboxContext.currentSandbox.sourceStreet.reinstatementCategories &&
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
        sandboxContext.currentSandbox.sourceStreet &&
        sandboxContext.currentSandbox.sourceStreet.specialDesignations &&
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
        sandboxContext.currentSandbox.sourceStreet &&
        sandboxContext.currentSandbox.sourceStreet.interests &&
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
        sandboxContext.currentSandbox.sourceStreet &&
        sandboxContext.currentSandbox.sourceStreet.constructions &&
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
        sandboxContext.currentSandbox.sourceStreet &&
        sandboxContext.currentSandbox.sourceStreet.specialDesignations &&
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
        sandboxContext.currentSandbox.sourceStreet &&
        sandboxContext.currentSandbox.sourceStreet.heightWidthWeights &&
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
        sandboxContext.currentSandbox.sourceStreet &&
        sandboxContext.currentSandbox.sourceStreet.publicRightOfWays &&
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
        sandboxContext.currentSandbox.sourceStreet &&
        sandboxContext.currentSandbox.sourceStreet.streetNotes &&
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
        sandboxContext.currentSandbox.sourceProperty &&
        sandboxContext.currentSandbox.sourceProperty.lpis &&
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
          sandboxContext.currentSandbox.sourceProperty &&
          sandboxContext.currentSandbox.sourceProperty.blpuProvenances &&
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
        sandboxContext.currentSandbox.sourceProperty &&
        sandboxContext.currentSandbox.sourceProperty.blpuAppCrossRefs &&
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
        sandboxContext.currentSandbox.sourceProperty &&
        sandboxContext.currentSandbox.sourceProperty.classifications &&
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
        sandboxContext.currentSandbox.sourceProperty &&
        sandboxContext.currentSandbox.sourceProperty.organisations &&
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
        sandboxContext.currentSandbox.sourceProperty &&
        sandboxContext.currentSandbox.sourceProperty.successorCrossRefs &&
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
        sandboxContext.currentSandbox.sourceProperty &&
        sandboxContext.currentSandbox.sourceProperty.blpuNotes &&
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
 * Method to get the check icon if required.
 *
 * @param {boolean} value True if a check is required; otherwise false.
 * @returns {JSX.Element|null} The check icon.
 */
export const getCheckIcon = (value) => {
  if (value) return <DoneIcon fontSize="small" sx={{ color: adsLightBlue }} />;
  else return null;
};

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
    currentCheck.usedByFrontEnd &&
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
  mapContext.onEditMapObject(null, null);

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
 * @param {Object} rec The record that we want to open.
 * @param {Object|null} openRelated If set it is the details of the property that should be highlighted in the related tab when opening the record.
 * @param {Object} currentSearchData The current search data
 * @param {Object} mapContext The map context object.
 * @param {Object} streetContext The street context object.
 * @param {Object} propertyContext The property context object.
 * @param {Object} userContext The user context object for the user who is calling the function.
 * @param {Boolean} isScottish If true return the field name used for OneScotland authorities; otherwise return the field name used by GeoPlace authorities.
 */
export async function doOpenRecord(
  rec,
  openRelated,
  currentSearchData,
  mapContext,
  streetContext,
  propertyContext,
  userContext,
  isScottish
) {
  const hasASD = userContext.currentUser && userContext.currentUser.hasASD;

  if (rec.type === 15) {
    const foundStreet = currentSearchData.find((x) => x.type === 15 && x.usrn === rec.usrn);
    const currentSearchStreets = JSON.parse(JSON.stringify(mapContext.currentSearchData.streets));

    if (!foundStreet) {
      const streetData = await GetStreetMapData(rec.usrn, userContext, isScottish);
      const engDescriptor = streetData.streetDescriptors.filter((x) => x.language === "ENG");
      streetContext.onStreetChange(rec.usrn, engDescriptor.streetDescriptor, false, openRelated);
      const esus = streetData
        ? userContext.currentUser.hasStreet
          ? streetData.esus.map((esuRec) => ({
              esuId: esuRec.esuId,
              state: isScottish ? esuRec.sate : undefined,
              geometry:
                esuRec.wktGeometry && esuRec.wktGeometry !== "" ? GetWktCoordinates(esuRec.wktGeometry) : undefined,
            }))
          : [
              {
                esuId: -1,
                state: undefined,
                geometry: GetWktCoordinates(
                  `LINESTRING (${streetData.streetStartX} ${streetData.streetStartY}, ${streetData.streetEndX} ${streetData.streetEndY})`
                ),
              },
            ]
        : [];
      const asdType51 =
        userContext.currentUser.hasStreet && isScottish && streetData
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
          : [];
      const asdType52 =
        userContext.currentUser.hasStreet && isScottish && streetData
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
          : [];
      const asdType53 =
        userContext.currentUser.hasStreet && isScottish && streetData
          ? streetData.specialDesignations.map((asdRec) => ({
              type: 53,
              pkId: asdRec.pkId,
              usrn: asdRec.usrn,
              specialDesignationCode: asdRec.specialDesignationCode,
              custodianCode: asdRec.custodianCode,
              authorityCode: asdRec.authorityCode,
              wholeRoad: asdRec.wholeRoad,
              geometry:
                asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
            }))
          : [];
      const asdType61 =
        userContext.currentUser.hasStreet && !isScottish && hasASD && streetData
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
          : [];
      const asdType62 =
        userContext.currentUser.hasStreet && !isScottish && hasASD && streetData
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
          : [];
      const asdType63 =
        userContext.currentUser.hasStreet && !isScottish && hasASD && streetData
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
          : [];
      const asdType64 =
        userContext.currentUser.hasStreet && !isScottish && hasASD && streetData
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
          : [];
      const asdType66 =
        userContext.currentUser.hasStreet && !isScottish && hasASD && streetData
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
          : [];
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
    mapContext.onSearchDataChange(
      userContext.currentUser.hasStreet ? currentSearchStreets : mapContext.currentSearchData.streets,
      !userContext.currentUser.hasStreet ? currentSearchStreets : mapContext.currentSearchData.llpgStreets,
      mapContext.currentSearchData.properties,
      rec.usrn,
      null
    );
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
        parentUprn: rec.parent_uprn,
        address: rec.formattedaddress,
        formattedAddress: rec.formattedaddress,
        postcode: rec.postcode,
        easting: rec.easting,
        northing: rec.northing,
        logicalStatus: rec.logical_status,
        classificationCode: rec.classification_code ? rec.classification_code.substring(0, 1) : "U",
      });
    }
    const propertyData = await GetPropertyMapData(rec.uprn, userContext);
    const extents = propertyData
      ? propertyData.blpuProvenances.map((provRec) => ({
          pkId: provRec.pkId,
          uprn: propertyData.uprn,
          code: provRec.provenanceCode,
          geometry:
            provRec.wktGeometry && provRec.wktGeometry !== "" ? GetWktCoordinates(provRec.wktGeometry) : undefined,
        }))
      : undefined;

    mapContext.onSearchDataChange(
      mapContext.currentSearchData.streets,
      mapContext.currentSearchData.llpgStreets,
      currentSearchProperties,
      null,
      rec.uprn
    );
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

/**
 * Method used to return a readable form of the variant string.
 *
 * @param {string} variant The lookup variant to return the string for.
 * @returns {string} The readable form of the variant.
 */
export const getLookupVariantString = (variant) => {
  switch (variant) {
    case "postTown":
      return "post town";

    case "subLocality":
      return "sub-locality";

    case "crossReference":
      return "cross reference";

    case "administrativeArea":
      return "administrative area";

    case "operationalDistrict":
      return "operational district";

    default:
      return variant;
  }
};

/**
 * Method to return the URL data for a specific lookup type and endpoint.
 *
 * @param {string} variant The type of lookup that we need the URL data for.
 * @param {string} endPointType The type of end point we need the URL data for.
 * @param {string} currentUser The current user who is calling the endpoint.
 * @param {number} authorityCode The DETR code for the authority.
 * @returns {object} The required URL data for the required lookup endpoint.
 */
export function GetLookupUrl(variant, endPointType, currentUser, authorityCode) {
  switch (variant) {
    case "postcode":
      return GetPostcodeUrl(endPointType, currentUser);

    case "postTown":
      return GetPostTownUrl(endPointType, currentUser);

    case "subLocality":
      return GetSubLocalityUrl(endPointType, currentUser);

    case "crossReference":
      return GetAppCrossRefUrl(endPointType, currentUser);

    case "locality":
      return GetLocalityUrl(endPointType, currentUser);

    case "town":
      return GetTownUrl(endPointType, currentUser);

    case "island":
      return GetIslandUrl(endPointType, currentUser);

    case "administrativeArea":
      return GetAdministrativeAreaUrl(endPointType, currentUser);

    case "dbAuthority":
      return GetDbAuthorityUrl(endPointType, currentUser);

    case "ward":
      return GetWardsUrl(endPointType, currentUser, authorityCode);

    case "parish":
      return GetParishesUrl(endPointType, currentUser, authorityCode);

    case "operationalDistrict":
      return GetOperationalDistrictUrl(endPointType, currentUser);

    default:
      return null;
  }
}

/**
 * Method to get the current lookups.
 *
 * @param {string} variant The type of lookup that we need to old data for.
 * @param {object} currentLookups The list of current lookups to get.
 * @returns {array} The list of current lookups.
 */
export function GetOldLookups(variant, currentLookups) {
  switch (variant) {
    case "postcode":
      return JSON.parse(JSON.stringify(currentLookups.postcodes));

    case "postTown":
      return JSON.parse(JSON.stringify(currentLookups.postTowns));

    case "subLocality":
      return JSON.parse(JSON.stringify(currentLookups.subLocalities));

    case "crossReference":
      return JSON.parse(JSON.stringify(currentLookups.appCrossRefs));

    case "locality":
      return JSON.parse(JSON.stringify(currentLookups.localities));

    case "town":
      return JSON.parse(JSON.stringify(currentLookups.towns));

    case "island":
      return JSON.parse(JSON.stringify(currentLookups.islands));

    case "administrativeArea":
      return JSON.parse(JSON.stringify(currentLookups.adminAuthorities));

    case "ward":
      return JSON.parse(JSON.stringify(currentLookups.wards));

    case "parish":
      return JSON.parse(JSON.stringify(currentLookups.parishes));

    case "dbAuthority":
      return JSON.parse(JSON.stringify(currentLookups.dbAuthorities));

    case "operationalDistrict":
      return JSON.parse(JSON.stringify(currentLookups.operationalDistricts));

    default:
      return null;
  }
}

/**
 * Method used to add a new lookup.
 *
 * @param {Object} data The lookup data that needs to be added.
 * @param {Number} authorityCode The code for the current authority
 * @param {Object} userContext The user context object
 * @param {Boolean} isWelsh True if this is a Welsh authority; otherwise false.
 * @param {Object} currentLookups The current lookups object.
 * @returns {Object} The new lookup that has been added.
 */
export const addLookup = async (data, authorityCode, userContext, isWelsh, currentLookups) => {
  let lookupAdded = false;
  let engError = null;
  let altLanguageError = null;

  const getEngPostData = () => {
    if (data.lookupData) {
      switch (data.variant) {
        case "postcode":
          return { postcode: data.lookupData.postcode, historic: data.lookupData.historic };

        case "postTown":
          return {
            postTown: data.lookupData.english,
            historic: data.lookupData.historic,
            language: "ENG",
            linkedRef: -1,
          };

        case "subLocality":
          return {
            subLocality: data.lookupData.english,
            historic: data.lookupData.historic,
            language: "ENG",
            linkedRef: -1,
          };

        case "crossReference":
          return {
            xrefSourceRef: data.lookupData.xrefSourceRef73,
            altXrefSourceRef: data.lookupData.xrefSourceRef73,
            xrefSourceRef73: data.lookupData.xrefSourceRef73,
            xrefDescription: data.lookupData.xrefDescription,
            iSearchWebLinkUrl: "www.dummy.domain",
            enabled: data.lookupData.enabled,
            historic: data.lookupData.historic,
            showSourceiSearchWeb: false,
            showXrefiSearchWeb: false,
            export: data.lookupData.export,
          };

        case "locality":
          return {
            locality: data.lookupData.english,
            historic: data.lookupData.historic,
            language: "ENG",
            linkedRef: -1,
          };

        case "town":
          return {
            town: data.lookupData.english,
            historic: data.lookupData.historic,
            language: "ENG",
            linkedRef: -1,
          };

        case "island":
          return {
            island: data.lookupData.english,
            historic: data.lookupData.historic,
            language: "ENG",
            linkedRef: -1,
          };

        case "administrativeArea":
          return {
            administrativeArea: data.lookupData.english,
            historic: data.lookupData.historic,
            language: "ENG",
            linkedRef: -1,
          };

        case "ward":
          return {
            wardCode: data.lookupData.wardCode,
            ward: data.lookupData.ward,
            detrCode: authorityCode ? authorityCode.toString() : null,
            historic: data.lookupData.historic,
          };

        case "parish":
          return {
            parishCode: data.lookupData.parishCode,
            parish: data.lookupData.parish,
            detrCode: authorityCode ? authorityCode.toString() : null,
            historic: data.lookupData.historic,
          };

        case "dbAuthority":
          return {
            authorityRef: data.lookupData.dbAuthorityRef,
            authorityName: data.lookupData.dbAuthorityName,
            minUsrn: data.lookupData.dbAuthorityMinUsrn,
            maxUsrn: data.lookupData.dbAuthorityMaxUsrn,
          };

        case "operationalDistrict":
          return {
            organisationId: data.lookupData.organisationId,
            districtName: data.lookupData.districtName,
            lastUpdateDate: data.lookupData.lastUpdateDate,
            districtId: data.lookupData.districtId,
            districtFunction: data.lookupData.districtFunction,
            districtClosed: data.lookupData.districtClosed,
            districtFtpServerName: data.lookupData.districtFtpServerName,
            districtServerIpAddress: data.lookupData.districtServerIpAddress,
            districtFtpDirectory: data.lookupData.districtFtpDirectory,
            districtNotificationsUrl: data.lookupData.districtNotificationsUrl,
            attachmentUrlPrefix: data.lookupData.attachmentUrlPrefix,
            districtFaxNo: data.lookupData.districtFaxNo,
            districtPostcode: data.lookupData.districtPostcode,
            districtTelNo: data.lookupData.districtTelNo,
            outOfHoursArrangements: data.lookupData.outOfHoursArrangements,
            fpnDeliveryUrl: data.lookupData.fpnDeliveryUrl,
            fpnFaxNumber: data.lookupData.fpnFaxNumber,
            fpnDeliveryPostcode: data.lookupData.fpnDeliveryPostcode,
            fpnPaymentUrl: data.lookupData.fpnPaymentUrl,
            fpnPaymentTelNo: data.lookupData.fpnPaymentTelNo,
            fpnPaymentBankName: data.lookupData.fpnPaymentBankName,
            fpnPaymentSortCode: data.lookupData.fpnPaymentSortCode,
            fpnPaymentAccountNo: data.lookupData.fpnPaymentAccountNo,
            fpnPaymentAccountName: data.lookupData.fpnPaymentAccountName,
            fpnPaymentPostcode: data.lookupData.fpnPaymentPostcode,
            fpnContactName: data.lookupData.fpnContactName,
            fpnContactPostcode: data.lookupData.fpnContactPostcode,
            fpnContactTelNo: data.lookupData.fpnContactTelNo,
            districtPostalAddress1: data.lookupData.districtPostalAddress1,
            districtPostalAddress2: data.lookupData.districtPostalAddress2,
            districtPostalAddress3: data.lookupData.districtPostalAddress3,
            districtPostalAddress4: data.lookupData.districtPostalAddress4,
            districtPostalAddress5: data.lookupData.districtPostalAddress5,
            fpnDeliveryAddress1: data.lookupData.fpnDeliveryAddress1,
            fpnDeliveryAddress2: data.lookupData.fpnDeliveryAddress2,
            fpnDeliveryAddress3: data.lookupData.fpnDeliveryAddress3,
            fpnDeliveryAddress4: data.lookupData.fpnDeliveryAddress4,
            fpnDeliveryAddress5: data.lookupData.fpnDeliveryAddress5,
            fpnContactAddress1: data.lookupData.fpnContactAddress1,
            fpnContactAddress2: data.lookupData.fpnContactAddress2,
            fpnContactAddress3: data.lookupData.fpnContactAddress3,
            fpnContactAddress4: data.lookupData.fpnContactAddress4,
            fpnContactAddress5: data.lookupData.fpnContactAddress5,
            fpnPaymentAddress1: data.lookupData.fpnPaymentAddress1,
            fpnPaymentAddress2: data.lookupData.fpnPaymentAddress2,
            fpnPaymentAddress3: data.lookupData.fpnPaymentAddress3,
            fpnPaymentAddress4: data.lookupData.fpnPaymentAddress4,
            fpnPaymentAddress5: data.lookupData.fpnPaymentAddress5,
            fpnDeliveryEmailAddress: data.lookupData.fpnDeliveryEmailAddress,
            districtPermitSchemeId: data.lookupData.districtPermitSchemeId,
            historic: data.lookupData.historic,
          };

        default:
          return null;
      }
    } else return null;
  };

  const getCymPostData = (newEngLookup) => {
    if (data.lookupData && data.lookupData.welsh) {
      switch (data.variant) {
        case "postTown":
          return {
            postTown: data.lookupData.welsh,
            historic: data.lookupData.historic,
            language: "CYM",
            linkedRef: newEngLookup && newEngLookup.postTownRef ? newEngLookup.postTownRef : -1,
          };

        case "locality":
          return {
            locality: data.lookupData.welsh,
            historic: data.lookupData.historic,
            language: "CYM",
            linkedRef: newEngLookup && newEngLookup.localityRef ? newEngLookup.localityRef : -1,
          };

        case "town":
          return {
            town: data.lookupData.welsh,
            historic: data.lookupData.historic,
            language: "CYM",
            linkedRef: newEngLookup && newEngLookup.townRef ? newEngLookup.townRef : -1,
          };

        case "administrativeArea":
          return {
            administrativeArea: data.lookupData.welsh,
            historic: data.lookupData.historic,
            language: "CYM",
            linkedRef: newEngLookup && newEngLookup.administrativeAreaRef ? newEngLookup.administrativeAreaRef : -1,
          };

        default:
          return null;
      }
    } else return null;
  };

  function UpdateEngLinkedRef(engLookup, linkedLookup) {
    if (engLookup && linkedLookup) {
      switch (data.variant) {
        case "postTown":
          return { ...engLookup, linkedRef: linkedLookup.postTownRef };

        case "subLocality":
          return { ...engLookup, linkedRef: linkedLookup.subLocalityRef };

        case "locality":
          return { ...engLookup, linkedRef: linkedLookup.localityRef };

        case "town":
          return { ...engLookup, linkedRef: linkedLookup.townRef };

        case "island":
          return { ...engLookup, linkedRef: linkedLookup.islandRef };

        case "administrativeArea":
          return { ...engLookup, linkedRef: linkedLookup.administrativeAreaRef };

        default:
          return engLookup;
      }
    } else return engLookup;
  }

  if (data) {
    let lookupUrl = GetLookupUrl(data.variant, "POST", userContext.currentUser, authorityCode);

    if (userContext.currentUser.showMessages)
      console.log("[DEBUG] handleDoneAddLookup", {
        lookupUrl: lookupUrl,
        language: "ENG",
        JSON: JSON.stringify(getEngPostData()),
      });
    let newEngLookup = null;
    let newCymLookup = null;
    let newGaeLookup = null;

    if (lookupUrl) {
      const engResponse = await fetch(lookupUrl.url, {
        headers: lookupUrl.headers,
        crossDomain: true,
        method: lookupUrl.type,
        body: JSON.stringify(getEngPostData()),
      });
      if (engResponse.ok) {
        newEngLookup = await engResponse.json();
        lookupAdded = true;
      } else {
        const engBody = await engResponse.json();
        switch (engResponse.status) {
          case 400:
            if (userContext.currentUser.showMessages)
              console.error(`[400 ERROR] Creating ${getLookupVariantString(data.variant)} object`, engBody.errors);
            let lookupEngErrors = [];
            for (const [key, value] of Object.entries(engBody.errors)) {
              lookupEngErrors.push({ key: key, value: value });
            }
            if (lookupEngErrors.length > 0) engError = lookupEngErrors[0].value;
            else engError = null;
            break;

          case 401:
            userContext.onExpired();
            break;

          case 500:
            if (userContext.currentUser.showMessages)
              console.error(`[500 ERROR] Creating ${getLookupVariantString(data.variant)} object`, engResponse);
            break;

          default:
            if (userContext.currentUser.showMessages)
              console.error(
                `[${engResponse.status} ERROR] Creating ${getLookupVariantString(data.variant)} object`,
                engResponse
              );
            break;
        }
      }

      if (newEngLookup) {
        const canHaveMultiLanguage = ["postTown", "locality", "town", "administrativeArea"].includes(data.variant);
        if (canHaveMultiLanguage && isWelsh) {
          lookupAdded = false;
          const cymData = getCymPostData(newEngLookup);
          if (userContext.currentUser.showMessages)
            console.log("[DEBUG] handleDoneAddLookup", {
              lookupUrl: lookupUrl,
              language: "CYM",
              JSON: JSON.stringify(cymData),
            });
          if (cymData) {
            const cymResponse = await fetch(lookupUrl.url, {
              headers: lookupUrl.headers,
              crossDomain: true,
              method: lookupUrl.type,
              body: JSON.stringify(cymData),
            });
            if (cymResponse.ok) {
              newCymLookup = await cymResponse.json();
              lookupAdded = true;
            } else {
              const cymBody = await cymResponse.json();
              switch (cymResponse.status) {
                case 400:
                  if (userContext.currentUser.showMessages)
                    console.error(
                      `[400 ERROR] Creating ${getLookupVariantString(data.variant)} object`,
                      cymBody.errors
                    );
                  let lookupCymErrors = [];
                  for (const [key, value] of Object.entries(cymBody.errors)) {
                    lookupCymErrors.push({ key: key, value: value });
                  }

                  if (lookupCymErrors.length > 0) altLanguageError = lookupCymErrors[0].value;
                  else altLanguageError = null;
                  break;

                case 401:
                  useContext.onExpired();
                  break;

                case 500:
                  if (userContext.currentUser.showMessages)
                    console.error(`[500 ERROR] Creating ${getLookupVariantString(data.variant)} object`, cymResponse);
                  break;

                default:
                  if (userContext.currentUser.showMessages)
                    console.error(
                      `[${cymResponse.status} ERROR] Creating ${getLookupVariantString(data.variant)} object`,
                      cymResponse
                    );
                  break;
              }
            }
          }

          if (newCymLookup) {
            newEngLookup = UpdateEngLinkedRef(newEngLookup, newCymLookup);
            lookupUrl = GetLookupUrl(data.variant, "PUT", userContext.currentUser, authorityCode);

            if (lookupUrl) {
              const linkedResponse = await fetch(lookupUrl.url, {
                headers: lookupUrl.headers,
                crossDomain: true,
                method: lookupUrl.type,
                body: JSON.stringify(newEngLookup),
              });
              if (linkedResponse.ok) {
                newEngLookup = await linkedResponse.json();
              } else {
                const linkedBody = await linkedResponse.json();
                switch (linkedResponse.status) {
                  case 400:
                    if (userContext.currentUser.showMessages)
                      console.error(
                        `[400 ERROR] Creating ${getLookupVariantString(data.variant)} object`,
                        linkedBody.errors
                      );
                    let lookupLinkedErrors = [];
                    for (const [key, value] of Object.entries(linkedBody.errors)) {
                      lookupLinkedErrors.push({ key: key, value: value });
                    }

                    if (lookupLinkedErrors.length > 0) engError = lookupLinkedErrors[0].value;
                    else engError = null;
                    break;

                  case 401:
                    userContext.onExpired();
                    break;

                  case 500:
                    if (userContext.currentUser.showMessages)
                      console.error(
                        `[500 ERROR] Creating ${getLookupVariantString(data.variant)} object`,
                        linkedResponse
                      );
                    break;

                  default:
                    if (userContext.currentUser.showMessages)
                      console.error(
                        `[${linkedResponse.status} ERROR] Creating ${getLookupVariantString(data.variant)} object`,
                        linkedResponse
                      );
                    break;
                }
              }
            }
          }
        }

        const updatedLookups = GetOldLookups(data.variant, currentLookups);

        if (lookupAdded) {
          if (updatedLookups) {
            if (newEngLookup) updatedLookups.push(newEngLookup);
            if (newCymLookup) updatedLookups.push(newCymLookup);
            if (newGaeLookup) updatedLookups.push(newGaeLookup);
          }

          return {
            newLookup: newEngLookup,
            updatedLookups: updatedLookups,
            engError: engError,
            altLanguageError: altLanguageError,
            result: true,
          };
        } else
          return {
            newLookup: newEngLookup,
            updatedLookups: updatedLookups,
            engError: engError,
            altLanguageError: altLanguageError,
            result: false,
          };
      } else
        return {
          newLookup: newEngLookup,
          updatedLookups: null,
          engError: engError,
          altLanguageError: altLanguageError,
          result: false,
        };
    } else
      return {
        newLookup: newEngLookup,
        updatedLookups: null,
        engError: engError,
        altLanguageError: altLanguageError,
        result: false,
      };
  } else
    return {
      newLookup: null,
      updatedLookups: null,
      engError: engError,
      altLanguageError: altLanguageError,
      result: false,
    };
};

/**
 * A method to determine the type of browser this app is running under.
 *
 * @param {string} agent The window.navigator userAgent.
 * @returns {string} A string representing the browser that the user is using.
 */
export const browser = (agent) => {
  switch (true) {
    case agent.indexOf("edge") > -1:
      return "MS Edge (EdgeHtml)";
    case agent.indexOf("edg") > -1:
      return "MS Edge Chromium";
    case agent.indexOf("opr") > -1 && !!window.opr:
      return "opera";
    case agent.indexOf("chrome") > -1 && !!window.chrome:
      return "chrome";
    case agent.indexOf("trident") > -1:
      return "Internet Explorer";
    case agent.indexOf("firefox") > -1:
      return "firefox";
    case agent.indexOf("safari") > -1:
      return "safari";
    default:
      return "other";
  }
};

export const isEdgeChromium = browser(window.navigator.userAgent.toLowerCase()) === "MS Edge Chromium";
export const isChrome = browser(window.navigator.userAgent.toLowerCase()) === "chrome";

/**
 * Method to check a string for balanced brackets.
 *
 * @param {string} str The string to check for matched brackets
 * @returns {Boolean} True is the brackets are matched; otherwise false.
 */
export const bracketValidator = (str) => {
  if (typeof str !== "string") {
    return false;
  }
  const stack = [];
  const mapClosingBrackets = {
    "{": "}",
    "[": "]",
    "(": ")",
    "<": ">",
  };
  const characters = str.split("");
  for (let i = 0; i < characters.length; i++) {
    if (characters[i] === "{" || characters[i] === "[" || characters[i] === "(" || characters[i] === "<") {
      stack.push(characters[i]);
    } else if (characters[i] === "}" || characters[i] === "]" || characters[i] === ")" || characters[i] === ">") {
      let poppedValue = stack.pop();
      if (mapClosingBrackets[poppedValue] !== characters[i]) {
        return false;
      }
    }
  }

  if (stack.length) return false;
  return true;
};

/**
 * Method used to validate a string against a character set.
 *
 * @param {String} str The string to be checked.
 * @param {String} characterSet The character set we need to check against
 *
 * ________________________________
 * GeoPlaceProperty1 - Organisation
 *
 * The valid characters allowed are:
 *
 * • Upper and lower case: A-Z
 *
 * • Numbers: 0-9
 *
 * • Space character
 *
 * • Upper and lower case: ÀÁÂÄÈÉÊËÌÍÎÏÒÓÔÖÚÙÛÜŴÝŸŶ
 *
 * • Punctuation and special characters: . , & ; : [ ] ( ) + - / _ @ £ $
 *
 *
 * ____________________________________
 * GeoPlaceProperty2 - PAO and SAO Text
 *
 * The valid characters allowed are:
 *
 * • Upper and lower case: A-Z
 *
 * • Numbers: 0-9
 *
 * • Space character
 *
 * • Upper and lower case: ÀÁÂÄÈÉÊËÌÍÎÏÒÓÔÖÚÙÛÜŴÝŸŶ
 *
 * • Punctuation and special characters: ! . , & ; : [ ] ( ) + - / _ @ £ $
 *
 *
 * ___________________________________
 * GeoPlaceAZOnly - PAO and SAO suffix
 *
 * • A-Z
 *
 * _________________________________________________________________________________________________________________________________
 * GeoPlaceStreet1 - Type 1, 2, 4 and 9 street descriptor, town and locality as well as OneScotland text fields not specified below.
 *
 * Valid characters are A-Z, a-z, 0-9 or any of ! # $ % “ & ' ( ) * - + , . / : ; < = > ? [ \ ] ^ _ | ~ @ { } £ © § ® ¶ Ŵ ŵ Ṫ ṫ Ŷ ŷ Ḃ ḃ Ċ ċ Ḋ ḋ Ẁ Ẃ Ỳ Ÿ Ḟ ḟ Ġ ġ Ṁ ṁ Ṗ ẁ ṗ ẃ Ṡ ṡ ỳ Ẅ ẅ À Á Â Ã Ä Å Æ Ç È É Ê Ë Ì Í Î Ï Ñ Ò Ó Ô Õ Ö Ø Ù Ú Û Ü Ý ß à á â ã ä å æ ç è é ê ë ì í î ï ñ ò ó ô õ ö ø ù ú û ü ý ÿ and the space character.
 *
 * _______________________________
 * GeoPlaceStreet2 - Type 3 street
 *
 * Valid characters are A-Z, a-z, 0-9, ( ) and the space character.
 *
 * ___________________
 * OneScotlandProperty
 *
 * Valid characters are A-Z, a-z, 0-9, ' - / \ & , and the space character.
 *
 * _________________
 * OneScotlandStreet
 *
 * Valid characters are A-Z, a-z, 0-9, ' - . and the space character.
 *
 * _________________
 * OneScotlandLookup
 *
 * Valid characters are A-Z, a-z, 0-9, ' - and the space character.
 *
 * @returns {Boolean} True if the string is valid; otherwise false.
 */
export const characterSetValidator = (str, characterSet) => {
  let valid = true;

  switch (characterSet) {
    case "GeoPlaceProperty1":
    case "GeoPlaceProperty2":
    case "OneScotlandProperty":
      valid = isIso885914(str);
      break;

    case "GeoPlaceAZOnly":
      valid = !/[^A-Z]+/giu.test(str);
      break;

    case "GeoPlaceStreet1":
      valid = isIso885914(str);
      break;

    case "GeoPlaceStreet2":
      valid = !/[^a-zA-Z0-9 ()]+/giu.test(str);
      break;

    case "EsriLayerId":
      valid = !/[^a-zA-Z0-9]+/giu.test(str);
      break;

    case "OneScotlandStreet":
      valid = !/[^a-zA-Z0-9 \-'.]+/giu.test(str);
      break;

    case "OneScotlandLookup":
      valid = !/[^a-zA-Z0-9 \-']+/giu.test(str);
      break;

    default:
      valid = true;
      break;
  }

  return valid;
};

/**
 * Method to get the list of base map layer objects to be used.
 *
 * @param {Object} userContext The user context for the user who is calling the function.
 * @returns  {Array} A list of the base map layer objects to be used.
 */
export const getBaseMapLayers = async (userContext) => {
  const mapLayerUrl = GetMapLayersUrl("GET", userContext.currentUser);

  let baseMapLayers = [];

  if (mapLayerUrl) {
    baseMapLayers = await fetch(`${mapLayerUrl.url}`, {
      headers: mapLayerUrl.headers,
      crossDomain: true,
      method: mapLayerUrl.type,
    })
      .then((res) => (res.ok ? res : Promise.reject(res)))
      .then((res) => res.json())
      .then(
        (result) => {
          return result;
        },
        (error) => {
          if (error.status && error.status === 401) {
            userContext.onExpired();
          } else {
            if (userContext.currentUser.showMessages) console.error("[ERROR] Getting base map layers", error);
          }
          return null;
        }
      );
  }

  return baseMapLayers;
};

/**
 * Method used to determine of a login has expired.
 *
 * @param {String} expiry The expiry date to check against.
 * @returns {Boolean} True if the login token has expired; otherwise false.
 */
export const hasLoginExpired = (expiry) => {
  const expiryDate = new Date(expiry);
  const now = new Date();

  return now.getTime() > expiryDate.getTime();
};

/**
 * Method to get the linked ref for a given lookup.
 *
 * @param {String} variant The type of lookup to find the linked ref for.
 * @param {Number} code The reference for the record that we need the linked ref for.
 * @param {Object} currentLookups The context for the current lookups.
 * @returns {Number} The linked ref for the lookup.
 */
export const getLookupLinkedRef = (variant, code, currentLookups) => {
  let foundRec = null;

  switch (variant) {
    case "postTown":
      foundRec = currentLookups.postTowns.find((x) => x.postTownRef === code);
      break;

    case "subLocality":
      foundRec = currentLookups.subLocalities.find((x) => x.subLocalityRef === code);
      break;

    case "locality":
      foundRec = currentLookups.localities.find((x) => x.localityRef === code);
      break;

    case "town":
      foundRec = currentLookups.towns.find((x) => x.townRef === code);
      break;

    case "island":
      foundRec = currentLookups.islands.find((x) => x.islandRef === code);
      break;

    case "administrativeArea":
      foundRec = currentLookups.adminAuthorities.find((x) => x.administrativeAreaRef === code);
      break;

    default:
      break;
  }

  if (foundRec) return foundRec.linkedRef;
  else return null;
};
