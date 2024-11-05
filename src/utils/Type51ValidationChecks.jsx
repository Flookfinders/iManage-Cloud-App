/* #region header */
/**************************************************************************************************
//
//  Description: Type 51 validation checks
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

import RoadStatusCode from "../data/RoadStatusCode";
import SwaOrgRef from "../data/SwaOrgRef";
import { isEndBeforeStart, isFutureDate, isIso885914 } from "./HelperUtils";

/**
 * Check 5100008 - Specify location is too long.
 *
 * @param {String|Null} location The maintenance responsibility location
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5100008 = (location) => {
  return location && location.length > 250;
};

/**
 * Check 5100009 - Enter a custodian.
 *
 * @param {Number|Null} custodian The maintenance responsibility custodian code
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5100009 = (custodian) => {
  return !custodian;
};

/**
 * Check 5100010 - Custodian is invalid.
 *
 * @param {Number|Null} custodian The maintenance responsibility custodian code
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5100010 = (custodian) => {
  return custodian && !SwaOrgRef.find((x) => x.id === custodian);
};

/**
 * Check 5100011 - Authority is invalid.
 *
 * @param {Number|Null} authority The maintenance responsibility authority code
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5100011 = (authority) => {
  return authority && !SwaOrgRef.find((x) => x.id === authority);
};

/**
 * Check 5100012 - Enter an authority.
 *
 * @param {Number|Null} authority The maintenance responsibility authority code
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5100012 = (authority) => {
  return !authority;
};

/**
 * Check 5100013 - Enter a street status.
 *
 * @param {Number|Null} status The maintenance responsibility street status
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5100013 = (status) => {
  return !status;
};

/**
 * Check 5100014 - Street status is invalid.
 *
 * @param {Number|Null} status The maintenance responsibility street status
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5100014 = (status) => {
  return status && !RoadStatusCode.find((x) => x.id === status && x.osText && x.osText.length > 0);
};

/**
 * Check 5100015 - Enter a state.
 *
 * @param {Number|Null} state The maintenance responsibility state
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5100015 = (state) => {
  return !state;
};

/**
 * Check 5100016 - State is invalid.
 *
 * @param {Number|Null} state The maintenance responsibility state
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5100016 = (state) => {
  return state && ![1, 2].includes(state);
};

/**
 * Check 5100017 - State is 2 but end date is not set.
 *
 * @param {Number|Null} state The maintenance responsibility state
 * @param {Date|Null} endDate The maintenance responsibility end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5100017 = (state, endDate) => {
  return state && state === 2 && !endDate;
};

/**
 * Check 5100018 - State is 1 but end date is set.
 *
 * @param {Number|Null} state The maintenance responsibility state
 * @param {Date|Null} endDate The maintenance responsibility end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5100018 = (state, endDate) => {
  return state && state === 1 && endDate;
};

/**
 * Check 5100019 - Start date cannot be in the future.
 *
 * @param {Date|Null} startDate The maintenance responsibility start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5100019 = (startDate) => {
  return startDate && isFutureDate(startDate);
};

/**
 * Check 5100020 - End date cannot be in the future.
 *
 * @param {Date|Null} endDate The maintenance responsibility end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5100020 = (endDate) => {
  return endDate && isFutureDate(endDate);
};

/**
 * Check 5100021 - End date cannot be before the start date.
 *
 * @param {Date|Null} startDate The maintenance responsibility start date
 * @param {Date|Null} endDate The maintenance responsibility end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5100021 = (startDate, endDate) => {
  return startDate && endDate && isEndBeforeStart(startDate, endDate);
};

/**
 * Check 5100022 - If whole road set specify location must be blank.
 *
 * @param {Boolean} wholeRoad The maintenance responsibility whole road flag
 * @param {String|Null} location The maintenance responsibility location
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5100022 = (wholeRoad, location) => {
  return wholeRoad && location;
};

/**
 * Check 5100023 - If whole road not set specify location must be set.
 *
 * @param {Boolean} wholeRoad The maintenance responsibility whole road flag
 * @param {String|Null} location The maintenance responsibility location
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5100023 = (wholeRoad, location) => {
  return !wholeRoad && !location;
};

/**
 * Check 5100026 - Enter a start date.
 *
 * @param {Date|Null} startDate The maintenance responsibility start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5100026 = (startDate) => {
  return !startDate;
};

/**
 * Check 5100029 - Specify location contains invalid characters.
 *
 * @param {String|Null} location The maintenance responsibility location
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5100029 = (location) => {
  return location && !isIso885914(location);
};

/**
 * Check 5100030 - Authority does not exist in the RAUCS SWA org ref table.
 *
 * @param {Number|Null} authorityCode The maintenance responsibility authority code
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5100030 = (authorityCode) => {
  return authorityCode && !SwaOrgRef.find((x) => x.id === authorityCode);
};

/**
 * Check 5100032 - Enter geometry.
 *
 * @param {String|Null} geometry The maintenance responsibility geometry
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5100032 = (geometry) => {
  return !geometry;
};

/**
 * Check 5100033 - Specify location cannot end with a backslash (\\).
 *
 * @param {String|Null} geometry The maintenance responsibility location
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5100033 = (location) => {
  return location && location[location.length - 1] === "\\";
};

/**
 * Check 5100034 - Specify location cannot end with a hyphen (-).
 *
 * @param {String|Null} geometry The maintenance responsibility location
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5100034 = (location) => {
  return location && location[location.length - 1] === "-";
};
