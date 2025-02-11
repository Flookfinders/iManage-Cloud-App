//#region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Type 30 validation checks
//
//  Copyright:    © 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.1.0
//    001   31.10.24 Sean Flook      IMANN-1012 Initial Revision.
//#endregion Version 1.0.1.0
//
//--------------------------------------------------------------------------------------------------
//#endregion header

import { isEndBeforeStart, isFutureDate } from "./HelperUtils";

/**
 * Check 3000004 - Enter a successor.
 *
 * @param {Number|Null} successor The successor
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck3000004 = (successor) => {
  return !successor;
};

/**
 * Check 3000008 - Start date cannot be in the future.
 *
 * @param {Date|Null} startDate The successor start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck3000008 = (startDate) => {
  return startDate && isFutureDate(startDate);
};

/**
 * Check 3000009 - End date cannot be in the future.
 *
 * @param {Date|Null} endDate The successor end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck3000009 = (endDate) => {
  return endDate && isFutureDate(endDate);
};

/**
 * Check 3000010 - End date cannot be before the start date.
 *
 * @param {Date|Null} startDate The successor start date
 * @param {Date|Null} endDate The successor end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck3000010 = (startDate, endDate) => {
  return startDate && endDate && isEndBeforeStart(startDate, endDate);
};

/**
 * Check 3000012 - Enter a predecessor.
 *
 * @param {Date|Null} predecessor The predecessor
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck3000012 = (predecessor) => {
  return !predecessor;
};
