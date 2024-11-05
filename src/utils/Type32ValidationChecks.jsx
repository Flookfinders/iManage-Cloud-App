/* #region header */
/**************************************************************************************************
//
//  Description: Type 32 validation checks
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

import { isEndBeforeStart, isFutureDate } from "./HelperUtils";

/**
 * Check 3200008 - Enter a classification code.
 *
 * @param {String|Null} blpuClass The classification
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck3200008 = (blpuClass) => {
  return !blpuClass;
};

/**
 * Check 3200009 - Start date cannot be in the future.
 *
 * @param {Date|Null} startDate The classification start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck3200009 = (startDate) => {
  return startDate && isFutureDate(startDate);
};

/**
 * Check 3200011 - End date cannot be in the future.
 *
 * @param {Date|Null} endDate The classification end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck3200011 = (endDate) => {
  return endDate && isFutureDate(endDate);
};

/**
 * Check 3200014 - End date cannot be before the start date.
 *
 * @param {Date|Null} startDate The classification start date
 * @param {Date|Null} endDate The classification end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck3200014 = (startDate, endDate) => {
  return startDate && endDate && isEndBeforeStart(startDate, endDate);
};

/**
 * Check 3200015 - Scheme is too long.
 *
 * @param {String|Null} classificationScheme The classification scheme
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck3200015 = (classificationScheme) => {
  return classificationScheme && classificationScheme.length > 40;
};

/**
 * Check 3200017 - Enter a scheme.
 *
 * @param {String|Null} classificationScheme The classification scheme
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck3200017 = (classificationScheme) => {
  return !classificationScheme;
};

/**
 * Check 3200018 - Enter a start date.
 *
 * @param {Date|Null} startDate The classification start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck3200018 = (startDate) => {
  return !startDate;
};

/**
 * Check 3200022 - Commercial tertiary classification required for BLPU.
 *
 * @param {String|Null} blpuClass The classification
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck3200022 = (blpuClass) => {
  return blpuClass && blpuClass[0] === "C" && blpuClass.length < 3;
};

/**
 * Check 3200023 - Residential tertiary classification required for BLPU.
 *
 * @param {String|Null} blpuClass The classification
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck3200023 = (blpuClass) => {
  return blpuClass && blpuClass[0] === "R" && blpuClass.length < 3;
};
