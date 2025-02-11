//#region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Type 31 validation checks
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

import { characterSetValidator, isEndBeforeStart, isFutureDate } from "./HelperUtils";

/**
 * Check 3100008 - Start date cannot be in the future.
 *
 * @param {Date|Null} startDate The organisation start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck3100008 = (startDate) => {
  return startDate && isFutureDate(startDate);
};

/**
 * Check 3100010 - End date cannot be in the future.
 *
 * @param {Date|Null} endDate The organisation end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck3100010 = (endDate) => {
  return endDate && isFutureDate(endDate);
};

/**
 * Check 3100013 - End date cannot be before the start date.
 *
 * @param {Date|Null} startDate The organisation start date
 * @param {Date|Null} endDate The organisation end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck3100013 = (startDate, endDate) => {
  return startDate && endDate && isEndBeforeStart(startDate, endDate);
};

/**
 * Check 3100014 - Organisation is too long.
 *
 * @param {String|Null} organisation The organisation
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck3100014 = (organisation) => {
  return organisation && organisation.length > 60;
};

/**
 * Check 3100015 - Legal name is too long.
 *
 * @param {String|Null} legalName The organisation legal name
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck3100015 = (legalName) => {
  return legalName && legalName.length > 60;
};

/**
 * Check 3100016 - Enter an organisation.
 *
 * @param {String|Null} organisation The organisation
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck3100016 = (organisation) => {
  return !organisation;
};

/**
 * Check 3100017 - Organisation contains an invalid character.
 *
 * @param {String|Null} organisation The organisation
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck3100017 = (organisation) => {
  return organisation && !characterSetValidator(organisation, "OneScotlandLookup");
};

/**
 * Check 3100019 - Organisation cannot start with a space.
 *
 * @param {String|Null} organisation The organisation
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck3100019 = (organisation) => {
  return organisation && organisation[0] === " ";
};

/**
 * Check 3100021 - Organisation name contains repeated punctuation.
 *
 * @param {String|Null} organisation The organisation
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck3100021 = (organisation) => {
  return organisation && !!/[^a-z0-9](?=[^a-z0-9])/gi.test(organisation.replace(/\s+/g, ""));
};

/**
 * Check 3100022 - Organisation name contains double spaces.
 *
 * @param {String|Null} organisation The organisation
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck3100022 = (organisation) => {
  return organisation && organisation.includes("  ");
};
