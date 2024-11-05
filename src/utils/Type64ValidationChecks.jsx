/* #region header */
/**************************************************************************************************
//
//  Description: Type 64 validation checks
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
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import { filteredLookup, isEndBeforeStart, isFutureDate, isIso885914, isPriorTo1990 } from "./HelperUtils";

import HWWDesignationCode from "../data/HWWDesignationCode";
import SwaOrgRef from "../data/SwaOrgRef";

/**
 * Check 6400005 - Type is invalid.
 *
 * @param {Number|Null} code The height, width & weight restriction designation code
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6400005 = (code) => {
  return code && !HWWDesignationCode.find((x) => x.id === code);
};

/**
 * Check 6400006 - Enter a type.
 *
 * @param {Number|Null} code The height, width & weight restriction designation code
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6400006 = (code) => {
  return !code;
};

/**
 * Check 6400009 - Start Easting(X) value is invalid.
 *
 * @param {Boolean} wholeRoad The height, width & weight restriction whole road flag
 * @param {Number|Null} x The height, width & weight restriction start x
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6400009 = (wholeRoad, x) => {
  return !wholeRoad && x && (x < 80000 || x > 656100);
};

/**
 * Check 6400010 - Start Northing(Y) value is invalid.
 *
 * @param {Boolean} wholeRoad The height, width & weight restriction whole road flag
 * @param {Number|Null} y The height, width & weight restriction start y
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6400010 = (wholeRoad, y) => {
  return !wholeRoad && y && (y < 5000 || y > 657700);
};

/**
 * Check 6400011 - End Easting(X) value is invalid.
 *
 * @param {Boolean} wholeRoad The height, width & weight restriction whole road flag
 * @param {Number|Null} x The height, width & weight restriction end x
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6400011 = (wholeRoad, x) => {
  return !wholeRoad && x && (x < 80000 || x > 656100);
};

/**
 * Check 6400012 - End Northing(Y) value is invalid.
 *
 * @param {Boolean} wholeRoad The height, width & weight restriction whole road flag
 * @param {Number|Null} y The height, width & weight restriction end y
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6400012 = (wholeRoad, y) => {
  return !wholeRoad && y && (y < 5000 || y > 657700);
};

/**
 * Check 6400016 - Specify location is too long.
 *
 * @param {String|Null} location The height, width & weight restriction location
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6400016 = (location) => {
  return location && location.length > 250;
};

/**
 * Check 6400018 - Record end date cannot be before the record start date.
 *
 * @param {Date|Null} startDate The height, width & weight restriction start date
 * @param {Date|Null} endDate The height, width & weight restriction end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6400018 = (startDate, endDate) => {
  return startDate && endDate && isEndBeforeStart(startDate, endDate);
};

/**
 * Check 6400019 - Record end date cannot be in the future.
 *
 * @param {Date|Null} endDate The height, width & weight restriction end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6400019 = (endDate) => {
  return endDate && isFutureDate(endDate);
};

/**
 * Check 6400021 - If whole road set specify location and coordinates must be blank.
 *
 * @param {Boolean} wholeRoad The height, width & weight restriction whole road flag
 * @param {String|Null} location The height, width & weight restriction location
 * @param {Number|Null} startX The height, width & weight restriction start x
 * @param {Number|Null} startY The height, width & weight restriction start y
 * @param {Number|Null} endX The height, width & weight restriction end x
 * @param {Number|Null} endY The height, width & weight restriction end y
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6400021 = (wholeRoad, location, startX, startY, endX, endY) => {
  return wholeRoad && (location || startX || startY || endX || endY);
};

/**
 * Check 6400022 - If whole road not set specify location and coordinates must be set.
 *
 * @param {Boolean} wholeRoad The height, width & weight restriction whole road flag
 * @param {String|Null} location The height, width & weight restriction location
 * @param {Number|Null} startX The height, width & weight restriction start x
 * @param {Number|Null} startY The height, width & weight restriction start y
 * @param {Number|Null} endX The height, width & weight restriction end x
 * @param {Number|Null} endY The height, width & weight restriction end y
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6400022 = (wholeRoad, location, startX, startY, endX, endY) => {
  return !wholeRoad && (!location || !startX || !startY || !endX || !endY);
};

/**
 * Check 6400023 - Specify location contains invalid characters.
 *
 * @param {String|Null} location The height, width & weight restriction location
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6400023 = (location) => {
  return location && !isIso885914(location);
};

/**
 * Check 6400025 - Value is invalid.
 *
 * @param {Number|Null} value The height, width & weight restriction value
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6400025 = (value) => {
  return value && (value < 0.0 || value > 99.9);
};

/**
 * Check 6400026 - TRO text is too long.
 *
 * @param {String|Null} troText The height, width & weight restriction TRO text
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6400026 = (troText) => {
  return troText && troText.length > 250;
};

/**
 * Check 6400027 - TRO text contains invalid characters.
 *
 * @param {String|Null} troText The height, width & weight restriction TRO text
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6400027 = (troText) => {
  return troText && !isIso885914(troText);
};

/**
 * Check 6400028 - Description is too long.
 *
 * @param {String|Null} description The height, width & weight restriction description
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6400028 = (description) => {
  return description && description.length > 250;
};

/**
 * Check 6400029 - Description contains invalid characters.
 *
 * @param {String|Null} description The height, width & weight restriction description
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6400029 = (description) => {
  return description && !isIso885914(description);
};

/**
 * Check 6400030 - Organisation code of 0011, 0012, 013, 0014, 0016, 0020 or 7093 must not be used.
 *
 * @param {Number|Null} organisation The height, width & weight restriction organisation
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6400030 = (organisation) => {
  return organisation && [11, 12, 13, 14, 16, 20, 7093].includes(organisation);
};

/**
 * Check 6400031 - Organisation and district must either both be blank or both have a value.
 *
 * @param {Number|Null} organisation The height, width & weight restriction organisation
 * @param {Number|Null} district The height, width & weight restriction district
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6400031 = (organisation, district) => {
  return (organisation && !district) || (!organisation && district);
};

/**
 * Check 6400032 - District is invalid.
 *
 * @param {Number|Null} district The height, width & weight restriction district
 * @param {Object} currentLookups The lookup context object.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6400032 = (district, currentLookups) => {
  return district && !currentLookups.operationalDistricts.find((x) => x.districtId === district);
};

/**
 * Check 6400039 - Source is too long.
 *
 * @param {String|Null} source The height, width & weight restriction source
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6400039 = (source) => {
  return source && source.length > 120;
};

/**
 * Check 6400040 - Source contains invalid characters.
 *
 * @param {String|Null} source The height, width & weight restriction source
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6400040 = (source) => {
  return source && !isIso885914(source);
};

/**
 * Check 6400043 - Enter a start date.
 *
 * @param {Date|Null} startDate The height, width & weight restriction start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6400043 = (startDate) => {
  return !startDate;
};

/**
 * Check 6400044 - Start date cannot be in the future.
 *
 * @param {Date|Null} startDate The height, width & weight restriction start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6400044 = (startDate) => {
  return startDate && isFutureDate(startDate);
};

/**
 * Check 6400045 - Start date prior to 1990 are not allowed.
 *
 * @param {Date|Null} startDate The height, width & weight restriction start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6400045 = (startDate) => {
  return startDate && isPriorTo1990(startDate);
};

/**
 * Check 6400046 - Enter a value.
 *
 * @param {Number|Null} value The height, width & weight restriction value
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6400046 = (value) => {
  return !value;
};

/**
 * Check 6400047 - Organisation does not exist in the SWA org ref table.
 *
 * @param {Number|Null} organisation The height, width & weight restriction organisation
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6400047 = (organisation) => {
  return (
    organisation &&
    (!filteredLookup(SwaOrgRef, false).find((x) => x.id === organisation) ||
      [11, 12, 13, 14, 16, 20, 7093].includes(organisation))
  );
};

/**
 * Check 6400048 - District does not exist in the operational district table.
 *
 * @param {Number|Null} district The height, width & weight restriction district
 * @param {Object} currentLookups The lookup context object.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6400048 = (district, currentLookups) => {
  return district && !currentLookups.operationalDistricts.find((x) => x.districtId === district);
};

/**
 * Check 6400049 - Organisation is invalid.
 *
 * @param {Number|Null} organisation The height, width & weight restriction organisation
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6400049 = (organisation) => {
  return organisation && !filteredLookup(SwaOrgRef, false).find((x) => x.id === organisation);
};
