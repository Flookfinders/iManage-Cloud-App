/* #region header */
/**************************************************************************************************
//
//  Description: Type 17 validation checks
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

import { isEndBeforeStart } from "./HelperUtils";

import HighwayDedicationCode from "../data/HighwayDedicationCode";

/**
 * Check 1700002 - Enter a type.
 *
 * @param {Number|Null} type The highway dedication type
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1700002 = (type) => {
  return !type;
};

/**
 * Check 1700004 - Type is invalid.
 *
 * @param {Number|Null} type The highway dedication type
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1700004 = (type) => {
  return type && !HighwayDedicationCode.find((x) => x.id === type);
};

/**
 * Check 1700006 - End date cannot be before the start date.
 *
 * @param {Date|Null} startDate The highway dedication start date
 * @param {Date|Null} endDate The highway dedication end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1700006 = (startDate, endDate) => {
  return startDate && endDate && isEndBeforeStart(startDate, endDate);
};

/**
 * Check 1700007 - Record end date cannot be before the start date.
 *
 * @param {Date|Null} startDate The highway dedication start date
 * @param {Date|Null} endDate The record end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1700007 = (startDate, endDate) => {
  return startDate && endDate && isEndBeforeStart(startDate, endDate);
};

/**
 * Check 1700008 - Start time and end time must either both be blank or both have a value.
 *
 * @param {Date|Null} startTime The highway dedication start time
 * @param {Date|Null} endTime The highway dedication end time
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1700008 = (startTime, endTime) => {
  return (!startTime && endTime) || (startTime && !endTime);
};

/**
 * Check 1700009 - End time cannot be before start time.
 *
 * @param {Date|Null} startTime The highway dedication start time
 * @param {Date|Null} endTime The highway dedication end time
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1700009 = (startTime, endTime) => {
  return startTime && endTime && isEndBeforeStart(startTime, endTime, false);
};

/**
 * Check 1700012 - Seasonal start date and seasonal end date must either both be blank or both have a value.
 *
 * @param {Date|Null} startDate The highway dedication seasonal start date
 * @param {Date|Null} endDate The highway dedication seasonal end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1700012 = (startDate, endDate) => {
  return (!startDate && endDate) || (startDate && !endDate);
};

/**
 * Check 1700029 - Seasonal end date cannot be before the seasonal start date.
 *
 * @param {Date|Null} startDate The highway dedication seasonal start date
 * @param {Date|Null} endDate The highway dedication seasonal end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1700029 = (startDate, endDate) => {
  return startDate && endDate && isEndBeforeStart(startDate, endDate);
};
