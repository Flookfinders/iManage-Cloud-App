//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Type 53 validation checks
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

import { isEndBeforeStart, isFutureDate, isIso885914 } from "./HelperUtils";

import SpecialDesignationCode from "../data/SpecialDesignationCode";
import SwaOrgRef from "../data/SwaOrgRef";

/**
 * Check 5300007 - Enter a custodian.
 *
 * @param {Number|Null} custodian The special designation custodian code
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5300007 = (custodian) => {
  return !custodian;
};

/**
 * Check 5300008 - Custodian is invalid.
 *
 * @param {Number|Null} custodian The special designation custodian code
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5300008 = (custodian) => {
  return custodian && !SwaOrgRef.find((x) => x.id === custodian);
};

/**
 * Check 5300011 - Authority is invalid.
 *
 * @param {Number|Null} authorityCode The special designation authority code
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5300011 = (authorityCode) => {
  return authorityCode && !SwaOrgRef.find((x) => x.id === authorityCode);
};

/**
 * Check 5300012 - Enter an authority.
 *
 * @param {Number|Null} authorityCode The special designation authority code
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5300012 = (authorityCode) => {
  return !authorityCode;
};

/**
 * Check 5300013 - Enter a special designation.
 *
 * @param {Number|Null} code The special designation code
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5300013 = (code) => {
  return !code;
};

/**
 * Check 5300014 - Type is invalid.
 *
 * @param {Number|Null} code The special designation code
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5300014 = (code) => {
  return code && !SpecialDesignationCode.find((x) => x.id === code && x.osText);
};

/**
 * Check 5300015 - Enter a description.
 *
 * @param {String|Null} description The special designation description
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5300015 = (description) => {
  return !description;
};

/**
 * Check 5300016 - Description is too long.
 *
 * @param {Number|Null} description The special designation description
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5300016 = (description) => {
  return description && description.length > 255;
};

/**
 * Check 5300017 - Enter a state.
 *
 * @param {Number|Null} state The special designation state
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5300017 = (state) => {
  return !state;
};

/**
 * Check 5300018 - State is invalid.
 *
 * @param {Number|Null} state The special designation state
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5300018 = (state) => {
  return state && ![1, 2].includes(state);
};

/**
 * Check 5300019 - State is 2 but end date is not set.
 *
 * @param {Number|Null} state The special designation state
 * @param {Date|Null} endDate The special designation end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5300019 = (state, endDate) => {
  return state && state === 2 && !endDate;
};

/**
 * Check 5300020 - Start date cannot be in the future.
 *
 * @param {Date|Null} startDate The special designation start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5300020 = (startDate) => {
  // return state && startDate && isFutureDate(startDate);
  return startDate && isFutureDate(startDate);
};

/**
 * Check 5300021 - End date cannot be in the future.
 *
 * @param {Date|Null} endDate The special designation end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5300021 = (endDate) => {
  // return state && endDate && isFutureDate(endDate);
  return endDate && isFutureDate(endDate);
};

/**
 * Check 5300022 - End date cannot be before the start date.
 *
 * @param {Date|Null} startDate The special designation start date
 * @param {Date|Null} endDate The special designation end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5300022 = (startDate, endDate) => {
  // return state && startDate && endDate && isEndBeforeStart(startDate, endDate);
  return startDate && endDate && isEndBeforeStart(startDate, endDate);
};

/**
 * Check 5300023 - Specify location is too long.
 *
 * @param {String|Null} location The special designation location
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5300023 = (location) => {
  return location && location.length > 250;
};

/**
 * Check 5300024 - If whole road set specify location must be blank.
 *
 * @param {Boolean} wholeRoad The special designation whole road flag
 * @param {String|Null} location The special designation location
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5300024 = (wholeRoad, location) => {
  return wholeRoad && location;
};

/**
 * Check 5300025 - If whole road not set specify location must be set.
 *
 * @param {Boolean} wholeRoad The special designation whole road flag
 * @param {String|Null} location The special designation location
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5300025 = (wholeRoad, location) => {
  return !wholeRoad && !location;
};

/**
 * Check 5300027 - Enter a start date.
 *
 * @param {Date|Null} startDate The special designation start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5300027 = (startDate) => {
  return !startDate;
};

/**
 * Check 5300028 - Specify location contains invalid characters.
 *
 * @param {String|Null} location The special designation location
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5300028 = (location) => {
  return location && !isIso885914(location);
};

/**
 * Check 5300029 - Custodian does not exist in the RAUCS SWA org ref table.
 *
 * @param {Number|Null} custodian The special designation custodian code
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5300029 = (custodian) => {
  return custodian && !SwaOrgRef.find((x) => x.id === custodian);
};

/**
 * Check 5300032 - Description contains invalid characters.
 *
 * @param {String|Null} description The special designation description
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5300032 = (description) => {
  return description && !isIso885914(description);
};

/**
 * Check 5300033 - Enter geometry.
 *
 * @param {String|Null} geometry The special designation geometry
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5300033 = (geometry) => {
  return !geometry;
};

/**
 * Check 5300034 - Specify location cannot end with a backslash (\\).
 *
 * @param {String|Null} location The special designation location
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5300034 = (location) => {
  return location && location[location.length - 1] === "\\";
};

/**
 * Check 5300035 - Specify location cannot end with a hyphen (-).
 *
 * @param {String|Null} location The special designation location
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5300035 = (location) => {
  return location && location[location.length - 1] === "-";
};

/**
 * Check 5300036 - State is 1 but end date is set.
 *
 * @param {Number|Null} state The special designation state
 * @param {Date|Null} endDate The special designation end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5300036 = (state, endDate) => {
  return state && state === 1 && endDate;
};
