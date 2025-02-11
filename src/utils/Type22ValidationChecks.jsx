//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Type 22 validation checks
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

import { isEndBeforeStart, isFutureDate, isPriorTo1753 } from "./HelperUtils";

import BLPUProvenance from "../data/BLPUProvenance";

/**
 * Check 2200009 - Enter a provenance code.
 *
 * @param {String|Null} provenanceCode The provenance code
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2200009 = (provenanceCode) => {
  return !provenanceCode;
};

/**
 * Check 2200010 - Provenance code is invalid.
 *
 * @param {String|Null} provenanceCode The provenance code
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2200010 = (provenanceCode) => {
  return provenanceCode && !BLPUProvenance.find((x) => x.id === provenanceCode);
};

/**
 * Check 2200011 - Enter a start date.
 *
 * @param {Date|Null} startDate The provenance start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2200011 = (startDate) => {
  return !startDate;
};

/**
 * Check 2200012 - Start date cannot be in the future.
 *
 * @param {Date|Null} startDate The provenance start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2200012 = (startDate) => {
  return startDate && isFutureDate(startDate);
};

/**
 * Check 2200014 - End date cannot be in the future.
 *
 * @param {Date|Null} endDate The provenance end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2200014 = (endDate) => {
  return endDate && isFutureDate(endDate);
};

/**
 * Check 2200015 - End date cannot be before the start date.
 *
 * @param {Date|Null} startDate The provenance start date
 * @param {Date|Null} endDate The provenance end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2200015 = (startDate, endDate) => {
  return startDate && endDate && isEndBeforeStart(startDate, endDate);
};

/**
 * Check 2200019 - Annotation is too long.
 *
 * @param {String|Null} annotation The provenance annotation
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2200019 = (annotation) => {
  return annotation && annotation.length > 30;
};

/**
 * Check 2200020 - Start dates prior to 1753 are not allowed.
 *
 * @param {Date|Null} startDate The provenance start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2200020 = (startDate) => {
  return startDate && isPriorTo1753(startDate);
};
