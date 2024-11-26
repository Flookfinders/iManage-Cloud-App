/* #region header */
/**************************************************************************************************
//
//  Description: Type 63 validation checks
//
//  Copyright:    © 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.1.0 changes
//    001   31.10.24 Sean Flook      IMANN-1012 Initial Revision.
//#endregion Version 1.0.1.0 changes
//#region Version 1.0.2.0 changes
//    002   26.11.24 Sean Flook      IMANN-1089 Include coordinates in failsCheck6300033.
//#endregion Version 1.0.2.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import { isAfter1stApril2015, isEndBeforeStart, isFutureDate, isIso885914, isPriorTo1990 } from "./HelperUtils";

import SpecialDesignationCode from "../data/SpecialDesignationCode";
import SpecialDesignationPeriodicity from "../data/SpecialDesignationPeriodicity";
import SwaOrgRef from "../data/SwaOrgRef";

/**
 * Check 6300006 - Start Easting(X) value is invalid.
 *
 * @param {Number|Null} x The special designation start x
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6300006 = (x) => {
  return x && (x < 80000 || x > 656100);
};

/**
 * Check 6300007 - Start Northing(Y) value is invalid.
 *
 * @param {Number|Null} y The special designation start y
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6300007 = (y) => {
  return y && (y < 5000 || y > 657700);
};

/**
 * Check 6300008 - End Easting(X) value is invalid.
 *
 * @param {Number|Null} x The special designation end x
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6300008 = (x) => {
  return x && (x < 80000 || x > 656100);
};

/**
 * Check 6300009 - End Northing(Y) value is invalid.
 *
 * @param {Number|Null} y The special designation end y
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6300009 = (y) => {
  return y && (y < 5000 || y > 657700);
};

/**
 * Check 6300010 - Record start date cannot be in the future.
 *
 * @param {Date|Null} startDate The special designation start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6300010 = (startDate) => {
  return startDate && isFutureDate(startDate);
};

/**
 * Check 6300011 - Record end date cannot be in the future.
 *
 * @param {Date|Null} endDate The special designation end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6300011 = (endDate) => {
  return endDate && isFutureDate(endDate);
};

/**
 * Check 6300012 - End date cannot be before the start date.
 *
 * @param {Date|Null} startDate The special designation start date
 * @param {Date|Null} endDate The special designation end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6300012 = (startDate, endDate) => {
  return startDate && endDate && isEndBeforeStart(startDate, endDate);
};

/**
 * Check 6300013 - Enter a record start date.
 *
 * @param {Date|Null} startDate The special designation start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6300013 = (startDate) => {
  return !startDate;
};

/**
 * Check 6300014 - End date cannot be before the special designation start date.
 *
 * @param {Date|Null} endDate The special designation end date
 * @param {Date|Null} specialDesignationStartDate The special designation start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6300014 = (endDate, specialDesignationStartDate) => {
  return endDate && specialDesignationStartDate && isEndBeforeStart(specialDesignationStartDate, endDate);
};

/**
 * Check 6300015 - Start date cannot be before the record start date.
 *
 * @param {Date|Null} startDate The special designation start date
 * @param {Date|Null} specialDesignationStartDate The special designation start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6300015 = (startDate, specialDesignationStartDate) => {
  return startDate && specialDesignationStartDate && isEndBeforeStart(startDate, specialDesignationStartDate);
};

/**
 * Check 6300016 - Type is invalid.
 *
 * @param {Number|Null} type The special designation type
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6300016 = (type) => {
  return type && !SpecialDesignationCode.find((x) => x.id === type);
};

/**
 * Check 6300017 - Enter a type.
 *
 * @param {Number|Null} type The special designation type
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6300017 = (type) => {
  return !type;
};

/**
 * Check 6300018 - Enter a description.
 *
 * @param {Date|Null} startDate The special designation start date
 * @param {String|Null} description The special designation description
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6300018 = (startDate, description) => {
  return isAfter1stApril2015(startDate) && !description;
};

/**
 * Check 6300019 - Description is too long.
 *
 * @param {String|Null} description The special designation description
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6300019 = (description) => {
  return description && description.length > 250;
};

/**
 * Check 6300025 - Periodicity is invalid.
 *
 * @param {Number|Null} periodicity The special designation periodicity
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6300025 = (periodicity) => {
  return periodicity && !SpecialDesignationPeriodicity.find((x) => x.id === periodicity);
};

/**
 * Check 6300029 - Start time and end time must either both be blank or both have a value.
 *
 * @param {Date|Null} startTime The special designation start time
 * @param {Date|Null} endTime The special designation end time
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6300029 = (startTime, endTime) => {
  return (startTime && !endTime) || (!startTime && endTime);
};

/**
 * Check 6300030 - End time cannot be before start time.
 *
 * @param {Date|Null} startTime The special designation start time
 * @param {Date|Null} endTime The special designation end time
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6300030 = (startTime, endTime) => {
  return startTime && endTime && isEndBeforeStart(startTime, endTime, false);
};

/**
 * Check 6300031 - Specify location is too long.
 *
 * @param {String|Null} location The special designation location
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6300031 = (location) => {
  return location && location.length > 250;
};

/**
 * Check 6300032 - If whole road set specify location must be blank.
 *
 * @param {Boolean} wholeRoad The special designation whole road flag
 * @param {String|Null} location The special designation location
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6300032 = (wholeRoad, location) => {
  return wholeRoad && location;
};

/**
 * Check 6300033 - If whole road not set specify location and coordinates must be set.
 *
 * @param {Boolean} wholeRoad The special designation whole road flag
 * @param {String|Null} location The special designation location
 * @param {Number|Null} startX The special designation start x
 * @param {Number|Null} startY The special designation start y
 * @param {Number|Null} endX The special designation end x
 * @param {Number|Null} endY The special designation end y
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6300033 = (wholeRoad, location, startX, startY, endX, endY) => {
  return !wholeRoad && (!location || !startX || !startY || !endX || !endY);
};

/**
 * Check 6300037 - Specify location contains invalid characters.
 *
 * @param {String|Null} location The special designation location
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6300037 = (location) => {
  return location && !isIso885914(location);
};

/**
 * Check 6300038 - When periodicity is 16, description is mandatory.
 *
 * @param {Number|Null} periodicity The special designation periodicity
 * @param {String|Null} description The special designation description
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6300038 = (periodicity, description) => {
  return periodicity && periodicity === 16 && !description;
};

/**
 * Check 6300040 - Record start date prior to 1990 is not allowed.
 *
 * @param {Date|Null} startDate The special designation start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6300040 = (startDate) => {
  return startDate && isPriorTo1990(startDate);
};

/**
 * Check 6300042 - Enter a periodicity.
 *
 * @param {Number|Null} periodicity The special designation periodicity
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6300042 = (periodicity) => {
  return !periodicity;
};

/**
 * Check 6300043 - Organisation codes of 0011, 0012, 013, 0014, 0016, 0020 or 7093 must not be used.
 *
 * @param {Number|Null} organisation The special designation organisation
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6300043 = (organisation) => {
  return organisation && [11, 12, 13, 14, 16, 20, 7093].includes(organisation);
};

/**
 * Check 6300044 - Organisation and district must either both be blank or both have a value.
 *
 * @param {Number|Null} organisation The special designation organisation
 * @param {Number|Null} district The special designation district
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6300044 = (organisation, district) => {
  return (organisation && !district) || (!organisation && district);
};

/**
 * Check 6300045 - Organisation does not exist in the SWA org ref table.
 *
 * @param {Number|Null} organisation The special designation organisation
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6300045 = (organisation) => {
  return organisation && !SwaOrgRef.find((x) => x.id === organisation);
};

/**
 * Check 6300046 - If type is 1,3,6,8,9,10,12,20,22,or 28 then the periodicity must be 1.
 *
 * @param {Number|Null} type The special designation type
 * @param {Number|Null} periodicity The special designation periodicity
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6300046 = (type, periodicity) => {
  return type && [1, 3, 6, 8, 9, 10, 12, 20, 22, 28].includes(type) && (!periodicity || periodicity !== 1);
};

/**
 * Check 6300047 - If whole road not set then specify location must not contain "WHOLE ROAD".
 *
 * @param {Boolean} wholeRoad The special designation whole road flag
 * @param {String|Null} location The special designation location
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6300047 = (wholeRoad, location) => {
  return !wholeRoad && location && location.toLowerCase().includes("whole road");
};

/**
 * Check 6300049 - Source contains invalid characters.
 *
 * @param {String|Null} source The special designation source
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6300049 = (source) => {
  return source && !isIso885914(source);
};

/**
 * Check 6300050 - Periodicity of 15 must have special designation start date and time and end date and time.
 *
 * @param {Number|Null} periodicity The special designation periodicity
 * @param {Date|Null} dateTime The special designation start or end date or time
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6300050 = (periodicity, dateTime) => {
  return periodicity && periodicity === 15 && !dateTime;
};

/**
 * Check 6300051 - District does not exist in the operational district table.
 *
 * @param {Number|Null} district The special designation district
 * @param {Object} currentLookups The lookup context object.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6300051 = (district, currentLookups) => {
  return district && !currentLookups.operationalDistricts.find((x) => x.districtId === district);
};

/**
 * Check 6300052 - Enter geometry.
 *
 * @param {String|Null} geometry The special designation geometry
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6300052 = (geometry) => {
  return !geometry;
};

/**
 * Check 6300053 - If type is 2 to 18, 20 or 22 to 30 and either operational start date or operational end date is present, both must be present.
 *
 * @param {Number|Null} type The special designation type
 * @param {Date|Null} startDate The special designation operational start date
 * @param {Date|Null} endDate The special designation operational end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6300053 = (type, startDate, endDate) => {
  return (
    type &&
    [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 22, 23, 24, 25, 26, 27, 28, 29, 30].includes(
      type
    ) &&
    ((startDate && !endDate) || (!startDate && endDate))
  );
};
