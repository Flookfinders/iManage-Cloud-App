//#region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Type 52 validation checks
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

import { isEndBeforeStart, isFutureDate, isIso885914 } from "./HelperUtils";

import ReinstatementType from "../data/ReinstatementType";
import SwaOrgRef from "../data/SwaOrgRef";

/**
 * Check 5100008 - Specify location is too long.
 *
 * @param {String|Null} location The reinstatement category location
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5200008 = (location) => {
  return location && location.length > 250;
};

/**
 * Check 5100009 - Enter a custodian.
 *
 * @param {Number|Null} custodian The reinstatement category custodian code
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5200009 = (custodian) => {
  return !custodian;
};

/**
 * Check 5100010 - Custodian is invalid.
 *
 * @param {Number|Null} custodian The reinstatement category custodian code
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5200010 = (custodian) => {
  return custodian && !SwaOrgRef.find((x) => x.id === custodian);
};

/**
 * Check 5100011 - Authority is invalid.
 *
 * @param {Number|Null} authorityCode The reinstatement category authority code
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5200011 = (authorityCode) => {
  return authorityCode && !SwaOrgRef.find((x) => x.id === authorityCode);
};

/**
 * Check 5100012 - Enter an authority.
 *
 * @param {Number|Null} authorityCode The reinstatement category authority code
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5200012 = (authorityCode) => {
  return !authorityCode;
};

/**
 * Check 5100013 - Enter a reinstatement category.
 *
 * @param {Number|Null} reinstatementCategory The reinstatement category code
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5200013 = (reinstatementCategory) => {
  return !reinstatementCategory && reinstatementCategory !== 0;
};

/**
 * Check 5100014 - Reinstatement category is invalid.
 *
 * @param {Number|Null} reinstatementCategory The reinstatement category code
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5200014 = (reinstatementCategory) => {
  return reinstatementCategory && !ReinstatementType.find((x) => x.id === reinstatementCategory && x.osText);
};

/**
 * Check 5100015 - Enter a state.
 *
 * @param {Number|Null} state The reinstatement category state
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5200015 = (state) => {
  return !state;
};

/**
 * Check 5100016 - State is invalid.
 *
 * @param {Number|Null} state The reinstatement category state
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5200016 = (state) => {
  return state && ![1, 2].includes(state);
};

/**
 * Check 5100017 - State is 2 but end date is not set.
 *
 * @param {Number|Null} state The reinstatement category state
 * @param {Date|Null} endDate The reinstatement category end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5200017 = (state, endDate) => {
  return state && state === 2 && !endDate;
};

/**
 * Check 5100018 - Start date cannot be in the future.
 *
 * @param {Date|Null} startDate The reinstatement category start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5200018 = (startDate) => {
  return startDate && isFutureDate(startDate);
};

/**
 * Check 5100019 - End date cannot be in the future.
 *
 * @param {Date|Null} endDate The reinstatement category end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5200019 = (endDate) => {
  return endDate && isFutureDate(endDate);
};

/**
 * Check 5100020 - End date cannot be before the start date.
 *
 * @param {Date|Null} startDate The reinstatement category start date
 * @param {Date|Null} endDate The reinstatement category end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5200020 = (startDate, endDate) => {
  return startDate && endDate && isEndBeforeStart(startDate, endDate);
};

/**
 * Check 5100021 - If whole road set specify location must be blank.
 *
 * @param {Boolean} wholeRoad The reinstatement category whole road flag
 * @param {String|Null} location The reinstatement category location
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5200021 = (wholeRoad, location) => {
  return wholeRoad && location;
};

/**
 * Check 5100022 - If whole road not set specify location must be set.
 *
 * @param {Boolean} wholeRoad The reinstatement category whole road flag
 * @param {String|Null} location The reinstatement category location
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5200022 = (wholeRoad, location) => {
  return !wholeRoad && !location;
};

/**
 * Check 5100025 - Enter a start date.
 *
 * @param {Date|Null} startDate The reinstatement category start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5200025 = (startDate) => {
  return !startDate;
};

/**
 * Check 5100026 - Specify location contains invalid characters.
 *
 * @param {String|Null} location The reinstatement category location
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5200026 = (location) => {
  return location && !isIso885914(location);
};

/**
 * Check 5100027 - Custodian does not exist in the RAUCS SWA org ref table.
 *
 * @param {Number|Null} custodian The reinstatement category custodian code
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5200027 = (custodian) => {
  return custodian && !SwaOrgRef.find((x) => x.id === custodian);
};

/**
 * Check 5100030 - State is 1 but end date is set.
 *
 * @param {Number|Null} state The reinstatement category state
 * @param {Date|Null} endDate The reinstatement category end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5200030 = (state, endDate) => {
  return state && state === 1 && endDate;
};

/**
 * Check 5100031 - Enter geometry.
 *
 * @param {String|Null} geometry The reinstatement category geometry
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5200031 = (geometry) => {
  return !geometry;
};

/**
 * Check 5100032 - Specify location cannot end with a backslash (\\).
 *
 * @param {String|Null} location The reinstatement category location
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5200032 = (location) => {
  return location && location[location.length - 1] === "\\";
};

/**
 * Check 5100033 - Specify location cannot end with a hyphen (-).
 *
 * @param {String|Null} location The reinstatement category location
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck5200033 = (location) => {
  return location && location[location.length - 1] === "-";
};
