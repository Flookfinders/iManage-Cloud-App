/* #region header */
/**************************************************************************************************
//
//  Description: Type 11 validation checks
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

import { isEndBeforeStart, isFutureDate, isPriorTo1990 } from "./HelperUtils";

import StreetState from "../data/StreetState";
import StreetSurface from "../data/StreetSurface";
import DETRCodes from "../data/DETRCodes";
import StreetType from "../data/StreetType";
import StreetClassification from "../data/StreetClassification";

/**
 * Check 1100004 - End date cannot be before the street start date.
 *
 * @param {Date|Null} startDate The start date for the street.
 * @param {Date|Null} endDate The end date for the street.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1100004 = (startDate, endDate) => {
  return isEndBeforeStart(startDate, endDate);
};

/**
 * Check 1100007 - Enter a descriptor.
 *
 * @param {Number|Null} usrn The usrn for the street.
 * @param {Object} currentLookups The lookup context object.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1100007 = (usrn, currentLookups) => {
  return usrn && !currentLookups.streetDescriptors.find((x) => x.usrn === usrn);
};

/**
 * Check 1100009 - Coordinates must be within the valid coordinate range.
 *
 * @param {Number|Null} x The X coordinate
 * @param {Number|Null} y The Y coordinate
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1100009 = (x, y) => {
  return x && (x < 80000 || x > 656100 || y < 5000 || y > 657700);
};

/**
 * Check 1100010 - Tolerance must be within the accepted tolerance range (0-99).
 *
 * @param {Number|Null} tolerance The tolerance
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1100010 = (tolerance) => {
  return tolerance && (tolerance < 0 || tolerance > 99);
};

/**
 * Check 1100011 - End date is set but state is not 4.
 *
 * @param {Date|Null} endDate The end date.
 * @param {Number|Null} state The street state
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1100011 = (endDate, state) => {
  return endDate && (!state || state !== 4);
};

/**
 * Check 1100012 - State is supplied but state date not set.
 *
 * @param {Number|Null} state The street state
 * @param {Date|Null} stateDate The state date.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1100012 = (state, stateDate) => {
  return state && !stateDate;
};

/**
 * Check 1100013 - State is invalid.
 *
 * @param {Number|Null} state The street state
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1100013 = (state) => {
  return state && !StreetState.find((x) => x.id === state);
};

/**
 * Check 1100014 - Surface is invalid.
 *
 * @param {Number|Null} surface The street surface
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1100014 = (surface) => {
  return surface && !StreetSurface.find((x) => x.id === surface);
};

/**
 * Check 1100016 - Enter a start date.
 *
 * @param {Date|Null} startDate The start date for the street.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1100016 = (startDate) => {
  return !startDate;
};

/**
 * Check 1100019 - Enter a tolerance.
 *
 * @param {Number|Null} tolerance The tolerance
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1100019 = (tolerance) => {
  return !tolerance;
};

/**
 * Check 1100021 - Start date cannot be in the future.
 *
 * @param {Date|Null} startDate The start date for the street.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1100021 = (startDate) => {
  return startDate && isFutureDate(startDate);
};

/**
 * Check 1100022 - End date is set but state is not 4.
 *
 * @param {Number|Null} state The street state
 * @param {Date|Null} endDate The end date.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1100022 = (state, endDate) => {
  return state && state === 4 && !endDate;
};

/**
 * Check 1100024 - Enter an USRN.
 *
 * @param {Number|Null} usrn The USRN
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1100024 = (usrn) => {
  return !usrn && usrn !== 0;
};

/**
 * Check 1100025 - Enter an authority code.
 *
 * @param {Number|Null} authorityCode The authority code
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1100025 = (authorityCode) => {
  return !authorityCode && authorityCode !== 0;
};

/**
 * Check 1100027 - Enter start and/or end coordinates.
 *
 * @param {Array|Null} esus The ESUs
 * @param {Number|Null} x The X coordinate
 * @param {Number|Null} y The Y coordinate
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1100027 = (esus, x, y) => {
  return esus && esus.length > 0 && (!x || !y);
};

/**
 * Check 1100028 - Authority code is invalid.
 *
 * @param {Number|Null} authorityCode The authority code
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1100028 = (authorityCode) => {
  return authorityCode && !DETRCodes.find((x) => x.id === authorityCode);
};

/**
 * Check 1100029 - Record type is invalid.
 *
 * @param {Number|Null} recordType The record type
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1100029 = (recordType) => {
  return recordType && !StreetType.find((x) => x.id === recordType);
};

/**
 * Check 1100030 - State dates prior to 1990 are not allowed.
 *
 * @param {Date|Null} stateDate The state date.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1100030 = (stateDate) => {
  return stateDate && isPriorTo1990(stateDate);
};

/**
 * Check 1100031 - State date cannot be in the future.
 *
 * @param {Date|Null} stateDate The state date.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1100031 = (stateDate) => {
  return stateDate && isFutureDate(stateDate);
};

/**
 * Check 1100032 - Classification is invalid.
 *
 * @param {Number|Null} classification The street classification.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1100032 = (classification) => {
  return classification && !StreetClassification.find((x) => x.id === classification);
};

/**
 * Check 1100033 - Enter a record type.
 *
 * @param {Number|Null} recordType The record type
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1100033 = (recordType) => {
  return !recordType;
};

/**
 * Check 1100035 - End date cannot be in the future.
 *
 * @param {Date|Null} endDate The end date for the street.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1100035 = (endDate) => {
  return endDate && isFutureDate(endDate);
};

/**
 * Check 1100037 - Enter a state.
 *
 * @param {Number|Null} state The street state
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1100037 = (state) => {
  return !state;
};

/**
 * Check 1100041 - Street types 2, 3 & 4 must not have a state of 5.
 *
 * @param {Number|Null} recordType The record type
 * @param {Number|Null} state The street state
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1100041 = (recordType, state) => {
  return recordType && state && [2, 3, 4].includes(recordType) && state === 5;
};

/**
 * Check 1100042 - Enter a state date.
 *
 * @param {Date|Null} stateDate The state date.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1100042 = (stateDate) => {
  return !stateDate;
};

/**
 * Check 1100043 - Enter a surface.
 *
 * @param {Number|Null} surface The street surface
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1100043 = (surface) => {
  return !surface;
};

/**
 * Check 1100048 - Street creation and maintenance is restricted to your assigned authority.
 *
 * @param {Number|Null} streetAuthority The street authority code
 * @param {Number|Null} authorityCode The current authority code
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1100048 = (streetAuthority, authorityCode) => {
  return streetAuthority && streetAuthority !== authorityCode;
};
