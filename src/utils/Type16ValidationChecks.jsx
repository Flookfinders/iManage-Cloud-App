//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Type 16 validation checks
//
//  Copyright:    © 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//region Version 1.0.1.0
//    001   31.10.24 Sean Flook      IMANN-1012 Initial Revision.
//endregion Version 1.0.1.0
//
//--------------------------------------------------------------------------------------------------
//endregion header

import { isEndBeforeStart, isFutureDate } from "./HelperUtils";

import OneWayExemptionPeriodicity from "../data/OneWayExemptionPeriodicity";
import OneWayExemptionType from "../data/OneWayExemptionType";

/**
 * Check 1600001 - Type is invalid.
 *
 * @param {Number|Null} type The one way exemption type
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1600001 = (type) => {
  return type && !OneWayExemptionType.find((x) => x.id === type);
};

/**
 * Check 1600002 - End date cannot be in the future.
 *
 * @param {Date|Null} endDate The one way exemption end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1600002 = (endDate) => {
  return endDate && isFutureDate(endDate);
};

/**
 * Check 1600004 - End date cannot be before the start date.
 *
 * @param {Date|Null} startDate The one way exemption end date
 * @param {Date|Null} endDate The one way exemption end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1600004 = (startDate, endDate) => {
  return startDate && endDate && isEndBeforeStart(startDate, endDate);
};

/**
 * Check 1600005 - Enter a periodicity.
 *
 * @param {Number|Null} periodicity The one way exemption periodicity code
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1600005 = (periodicity) => {
  return !periodicity;
};

/**
 * Check 1600006 - Periodicity is invalid.
 *
 * @param {Number|Null} periodicity The one way exemption periodicity code
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1600006 = (periodicity) => {
  return periodicity && !OneWayExemptionPeriodicity.find((x) => x.id === periodicity);
};

/**
 * Check 1600011 - Start date and end date must either both be blank or both have a value.
 *
 * @param {Date|Null} startDate The one way exemption start date
 * @param {Date|Null} endDate The one way exemption end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1600011 = (startDate, endDate) => {
  return (startDate && !endDate) || (!startDate && endDate);
};

/**
 * Check 1600014 - Start time and end time must either both be blank or both have a value.
 *
 * @param {Date|Null} startTime The one way exemption start time
 * @param {Date|Null} endTime The one way exemption end time
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1600014 = (startTime, endTime) => {
  return (startTime && !endTime) || (!startTime && endTime);
};

/**
 * Check 1600015 - End time cannot be before start time.
 *
 * @param {Date|Null} startTime The one way exemption start time
 * @param {Date|Null} endTime The one way exemption end time
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1600015 = (startTime, endTime) => {
  return startTime && endTime && isEndBeforeStart(startTime, endTime, false);
};

/**
 * Check 1600016 - Start date, start time, end date and end time must be present when periodicity is 15.
 *
 * @param {Number|Null} periodicity The one way exemption periodicity code
 * @param {Date|Null} startDate The one way exemption start date
 * @param {Date|Null} endDate The one way exemption end date
 * @param {Date|Null} startTime The one way exemption start time
 * @param {Date|Null} endTime The one way exemption end time
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1600016 = (periodicity, startDate, endDate, startTime, endTime) => {
  return periodicity && periodicity === 15 && (!startDate || !endDate || !startTime || !endTime);
};

/**
 * Check 1600018 - Enter a type.
 *
 * @param {Number|Null} type The one way exemption type
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1600018 = (type) => {
  return !type;
};
