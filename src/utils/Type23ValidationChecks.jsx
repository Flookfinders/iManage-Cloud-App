/* #region header */
/**************************************************************************************************
//
//  Description: Type 23 validation checks
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

import { isEndBeforeStart, isFutureDate, isPriorTo1753 } from "./HelperUtils";

/**
 * Check 2300006 - Enter a start date.
 *
 * @param {Date|Null} startDate The application cross reference start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2300006 = (startDate) => {
  return !startDate;
};

/**
 * Check 2300010 - Start date cannot be in the future.
 *
 * @param {Date|Null} startDate The application cross reference start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2300010 = (startDate) => {
  return startDate && isFutureDate(startDate);
};

/**
 * Check 2300011 - End date cannot be in the future.
 *
 * @param {Date|Null} endDate The application cross reference end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2300011 = (endDate) => {
  return endDate && isFutureDate(endDate);
};

/**
 * Check 2300012 - End date cannot be before the start date.
 *
 * @param {Date|Null} startDate The application cross reference start date
 * @param {Date|Null} endDate The application cross reference end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2300012 = (startDate, endDate) => {
  return startDate && endDate && isEndBeforeStart(startDate, endDate);
};

/**
 * Check 2300014 - Enter a cross reference.
 *
 * @param {String|Null} crossReference The application cross reference cross reference
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2300014 = (crossReference) => {
  return !crossReference;
};

/**
 * Check 2300015 - Cross reference is too long.
 *
 * @param {String|Null} crossReference The application cross reference cross reference
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2300015 = (crossReference) => {
  return crossReference && crossReference.length > 50;
};

/**
 * Check 2300016 - Source is missing, historic or disabled.
 *
 * @param {Number|Null} sourceId The application cross reference source id
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2300016 = (sourceId) => {
  return !sourceId;
};

/**
 * Check 2300017 - Source is too long.
 *
 * @param {String|Null} source The application cross reference source
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2300017 = (source) => {
  return source && source.length > 6;
};

/**
 * Check 2300025 - Source does not exist in the lookup table or is marked as historic/disabled.
 *
 * @param {Number|Null} sourceId The application cross reference source id
 * @param {Object} currentLookups The lookup context object.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2300025 = (sourceId, currentLookups) => {
  return sourceId && !currentLookups.appCrossRefs.find((x) => x.pkId === sourceId);
};

/**
 * Check 2300033 - Start dates prior to 1753 are not allowed.
 *
 * @param {Date|Null} startDate The application cross reference start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2300033 = (startDate) => {
  return startDate && isPriorTo1753(startDate);
};
