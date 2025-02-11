//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Type 13 validation checks
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

import ESUClassification from "../data/ESUClassification";
import ESUDirectionCode from "../data/ESUDirectionCode";
import ESUState from "../data/ESUState";

/**
 * Check 1300002 - Enter geometry.
 *
 * @param {String|Null} geometry The ESU geometry
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1300002 = (geometry) => {
  return !geometry;
};

/**
 * Check 1300011 - Enter a state.
 *
 * @param {Number|Null} state The ESU state
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1300011 = (state) => {
  return !state;
};

/**
 * Check 1300012 - Enter a state date.
 *
 * @param {Date|Null} stateDate The ESU state date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1300012 = (stateDate) => {
  return !stateDate;
};

/**
 * Check 1300013 - State date cannot be in the future.
 *
 * @param {Date|Null} stateDate The ESU state date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1300013 = (stateDate) => {
  return stateDate && isFutureDate(stateDate);
};

/**
 * Check 1300014 - State is invalid.
 *
 * @param {Number|Null} state The ESU state
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1300014 = (state) => {
  return state && !ESUState.find((x) => x.id === state);
};

/**
 * Check 1300015 - State date cannot be before the start date.
 *
 * @param {Number|Null} state The ESU state
 * @param {Date|Null} stateDate The ESU state date
 * @param {Date|Null} startDate The ESU start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1300015 = (state, stateDate, startDate) => {
  return state && startDate && isEndBeforeStart(startDate, stateDate);
};

/**
 * Check 1300016 - State is 4 but ESU end date is not set.
 *
 * @param {Number|Null} state The ESU state
 * @param {Date|Null} endDate The ESU end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1300016 = (state, endDate) => {
  return state && state === 4 && !endDate;
};

/**
 * Check 1300017 - Enter a start date.
 *
 * @param {Date|Null} startDate The ESU start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1300017 = (startDate) => {
  return !startDate;
};

/**
 * Check 1300020 - Start date cannot be in the future.
 *
 * @param {Date|Null} startDate The ESU start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1300020 = (startDate) => {
  return startDate && isFutureDate(startDate);
};

/**
 * Check 1300021 - End date cannot be in the future.
 *
 * @param {Date|Null} endDate The ESU end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1300021 = (endDate) => {
  return endDate && isFutureDate(endDate);
};

/**
 * Check 1300022 - End date cannot be before the start date.
 *
 * @param {Date|Null} startDate The ESU start date
 * @param {Date|Null} endDate The ESU end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1300022 = (startDate, endDate) => {
  return startDate && endDate && isEndBeforeStart(startDate, endDate);
};

/**
 * Check 1300023 - Enter a classification.
 *
 * @param {Number|Null} classification The ESU classification
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1300023 = (classification) => {
  return !classification;
};

/**
 * Check 1300024 - Classification is invalid.
 *
 * @param {Number|Null} classification The ESU classification
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1300024 = (classification) => {
  return classification && !ESUClassification.find((x) => x.id === classification);
};

/**
 * Check 1300025 - Enter a classification date.
 *
 * @param {Date|Null} classificationDate The ESU classification date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1300025 = (classificationDate) => {
  return !classificationDate;
};

/**
 * Check 1300026 - Classification date cannot be before the start date.
 *
 * @param {Date|Null} startDate The ESU classification date
 * @param {Date|Null} classificationDate The ESU classification date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1300026 = (startDate, classificationDate) => {
  return startDate && classificationDate && isEndBeforeStart(startDate, classificationDate);
};

/**
 * Check 1300028 - End date is set but state is not 4.
 *
 * @param {Date|Null} endDate The ESU end date
 * @param {Number|Null} state The ESU state
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1300028 = (endDate, state) => {
  return endDate && state !== 4;
};

/**
 * Check 1300030 - Enter a tolerance.
 *
 * @param {Number|Null} tolerance The ESU tolerance
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1300030 = (tolerance) => {
  return !tolerance;
};

/**
 * Check 1300031 - Tolerance is invalid.
 *
 * @param {Number|Null} tolerance The ESU tolerance
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1300031 = (tolerance) => {
  return tolerance && ![1, 5, 10, 50].includes(tolerance);
};

/**
 * Check 1300036 - Enter a direction.
 *
 * @param {Number|Null} direction The ESU direction
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1300036 = (direction) => {
  return !direction;
};

/**
 * Check 1300037 - Direction is invalid.
 *
 * @param {Number|Null} direction The ESU direction
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1300037 = (direction) => {
  return direction && !ESUDirectionCode.find((x) => x.id === direction);
};
