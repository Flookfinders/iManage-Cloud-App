//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Type 21 validation checks
//
//  Copyright:    © 2024 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//region Version 1.0.1.0
//    001   31.10.24 Sean Flook      IMANN-1012 Initial Revision.
//endregion Version 1.0.1.0
//region Version 1.0.4.0
//    002   11.02.25 Sean Flook      IMANN-1678 Fixed failsCheck2100019 for OneScotland.
//endregion Version 1.0.4.0
//
//--------------------------------------------------------------------------------------------------
//endregion header

import {
  bracketValidator,
  characterSetValidator,
  isEndBeforeStart,
  isFutureDate,
  isOlderThanYear,
  isPriorTo1753,
} from "./HelperUtils";

import BLPULogicalStatus from "../data/BLPULogicalStatus";
import RepresentativePointCode from "../data/RepresentativePointCode";
import BLPUState from "../data/BLPUState";
import BLPUClassification from "../data/BLPUClassification";
import DETRCodes from "../data/DETRCodes";
import { IsStreetClosed } from "./StreetUtils";

/**
 * Check 2100008 - Enter a BLPU logical status.
 *
 * @param {Number|Null} logicalStatus The BLPU logical status
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100008 = (logicalStatus) => {
  return !logicalStatus;
};

/**
 * Check 2100009 - BLPU logical status is invalid.
 *
 * @param {Number|Null} logicalStatus The BLPU logical status
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100009 = (logicalStatus) => {
  return logicalStatus && !BLPULogicalStatus.find((x) => x.id === logicalStatus);
};

/**
 * Check 2100011 - State is incompatible with the BLPU logical status.
 *
 * @param {Number|Null} logicalStatus The BLPU logical status
 * @param {Number|Null} state The BLPU state
 * @param {Boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100011 = (logicalStatus, state, isScottish) => {
  return (
    logicalStatus &&
    ((!isScottish &&
      ((logicalStatus === 1 && state && ![1, 2, 3].includes(state)) ||
        (logicalStatus === 5 && (!state || ![1, 2, 3, 4, 6].includes(state))) ||
        (logicalStatus === 6 && (!state || ![1, 5, 6, 7].includes(state))) ||
        (logicalStatus === 7 && state && ![1, 2, 3, 4, 6].includes(state)) ||
        (logicalStatus === 8 && state && ![4, 7].includes(state)) ||
        (logicalStatus === 9 && state && ![1, 2, 3, 4, 5, 6, 7].includes(state)))) ||
      (isScottish &&
        ((logicalStatus === 1 && ((!state && state !== 0) || ![0, 1, 2, 3].includes(state))) ||
          (logicalStatus === 6 && !state && state !== 0) ||
          (logicalStatus === 8 && ((!state && state !== 0) || state !== 4)) ||
          (logicalStatus === 9 && (state || state === 0) && ![0, 1, 2, 3, 4].includes(state)))))
  );
};

/**
 * Check 2100012 - The state must be between 1 and 7.
 *
 * @param {Number|Null} state The BLPU state
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100012 = (state) => {
  return state && ![1, 2, 3, 4, 5, 6, 7].includes(state);
};

/**
 * Check 2100013 - Open BLPU/LPI on a closed street.
 *
 * @param {Number|Null} usrn The usrn
 * @param {Object} userContext - The user context object for the user who is calling the endpoint.
 * @param {Boolean} isScottish - True if the authority is a Scottish authority; otherwise false.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100013 = (usrn, userContext, isScottish) => {
  return usrn && !IsStreetClosed(usrn, userContext, isScottish);
};

/**
 * Check 2100014 - Enter a representative point code (RPC).
 *
 * @param {Number|Null} rpc The BLPU representative point code
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100014 = (rpc) => {
  return !rpc;
};

/**
 * Check 2100015 - Classification is too long.
 *
 * @param {String|Null} classification The BLPU classification
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100015 = (classification) => {
  return classification && classification.length > 4;
};

/**
 * Check 2100016 - Enter a classification.
 *
 * @param {String|Null} classification The BLPU classification
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100016 = (classification) => {
  return !classification;
};

/**
 * Check 2100018 - Organisation is too long.
 *
 * @param {String|Null} organisation The BLPU organisation
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100018 = (organisation) => {
  return organisation && organisation.length > 100;
};

/**
 * Check 2100019 - Organisation contains an invalid character.
 *
 * @param {String|Null} organisation The BLPU organisation
 * @param {Boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100019 = (organisation, isScottish) => {
  return (
    organisation && !characterSetValidator(organisation, `${isScottish ? "OneScotlandProperty" : "GeoPlaceProperty1"}`)
  );
};

/**
 * Check 2100020 - Enter coordinates.
 *
 * @param {Number|Null} coordinate The BLPU coordinate (Easting & Northing)
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100020 = (coordinate) => {
  return !coordinate;
};

/**
 * Check 2100021 - Coordinates must be within the valid coordinate range.
 *
 * @param {Number|Null} coordinate The BLPU coordinate (Easting & Northing)
 * @param {Boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @param {Boolean} isX True if the coordinate is for the X value; otherwise for the Y value.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100021 = (coordinate, isScottish, isX) => {
  const minValue = isScottish ? 1 : isX ? 80000 : 5000;
  const maxValue = isScottish ? (isX ? 660000 : 1300000) : isX ? 656100 : 657700;

  return coordinate && (coordinate < minValue || coordinate > maxValue);
};

/**
 * Check 2100022 - Ward code is too long.
 *
 * @param {String|Null} ward The BLPU ward code
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100022 = (ward) => {
  return ward && ward.length > 10;
};

/**
 * Check 2100023 - Parish code is too long.
 *
 * @param {String|Null} parish The BLPU parish code
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100023 = (parish) => {
  return parish && parish.length > 10;
};

/**
 * Check 2100024 - Enter a state and State date.
 *
 * @param {Number|Date|Null} state The BLPU state/date
 * @param {Number|Null} logicalStatus The BLPU logical status
 * @param {Boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @param {Boolean} isDate True if state is a date; otherwise false.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100024 = (state, logicalStatus, isScottish, isDate) => {
  if (isDate) return (!isScottish || (isScottish && logicalStatus < 9)) && (state === undefined || state === null);
  else return (!isScottish || (isScottish && logicalStatus < 9)) && !state && state !== 0;
};

/**
 * Check 2100025 - State date cannot be in the future.
 *
 * @param {Date|Null} stateDate The BLPU statedate
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100025 = (stateDate) => {
  return stateDate && isFutureDate(stateDate);
};

/**
 * Check 2100026 - Representative point code (RPC) is invalid.
 *
 * @param {Number|Null} rpc The BLPU representative point code
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100026 = (rpc) => {
  return rpc && !RepresentativePointCode.find((x) => x.id === rpc);
};

/**
 * Check 2100027 - Enter a start date.
 *
 * @param {Date|Null} startDate The BLPU start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100027 = (startDate) => {
  return !startDate;
};

/**
 * Check 2100028 - Start date cannot be in the future.
 *
 * @param {Date|Null} startDate The BLPU start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100028 = (startDate) => {
  return startDate && isFutureDate(startDate);
};

/**
 * Check 2100029 - Start dates prior to 1753 are not allowed.
 *
 * @param {Date|Null} startDate The BLPU start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100029 = (startDate) => {
  return startDate && isPriorTo1753(startDate);
};

/**
 * Check 2100030 - End date cannot be in the future.
 *
 * @param {Date|Null} endDate The BLPU end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100030 = (endDate) => {
  return endDate && isFutureDate(endDate);
};

/**
 * Check 2100031 - End date cannot be before the start date.
 *
 * @param {Date|Null} startDate The BLPU start date
 * @param {Date|Null} endDate The BLPU end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100031 = (startDate, endDate) => {
  return startDate && endDate && isEndBeforeStart(startDate, endDate);
};

/**
 * Check 2100032 - End date supplied but BLPU logical status is not 7, 8 or 9.
 *
 * @param {Date|Null} endDate The BLPU end date
 * @param {Number|Null} logicalStatus The BLPU logical status
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100032 = (endDate, logicalStatus) => {
  return endDate && logicalStatus && ![7, 8, 9].includes(logicalStatus);
};

/**
 * Check 2100035 - BLPU logical status is incompatible with LPI logical status.
 *
 * @param {Number|Null} blpuLogicalStatus The BLPU logical status
 * @param {Number|Null} lpiLogicalStatus The LPI logical status
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100035 = (blpuLogicalStatus, lpiLogicalStatus) => {
  return blpuLogicalStatus !== lpiLogicalStatus;
};

/**
 * Check 2100036 - An RPC of 3 can no longer be submitted to GeoPlace.
 *
 * @param {Number|Null} rpc The BLPU representative point code
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100036 = (rpc) => {
  return rpc && rpc === 3;
};

/**
 * Check 2100037 - An RPC of 5 can no longer be submitted to GeoPlace.
 *
 * @param {Number|Null} rpc The BLPU representative point code
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100037 = (rpc) => {
  return rpc && rpc === 5;
};

/**
 * Check 2100045 - A BLPU logical status of 7, 8 or 9 requires an end date.
 *
 * @param {Number|Null} logicalStatus The BLPU logical status
 * @param {Date|Null} endDate The BLPU end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100045 = (logicalStatus, endDate) => {
  return logicalStatus && [7, 8, 9].includes(logicalStatus) && !endDate;
};

/**
 * Check 2100046 - The BLPU logical status is incompatible with the state.
 *
 * @param {Number|Null} logicalStatus The BLPU logical status
 * @param {Number|Null} state The BLPU state
 * @param {Boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100046 = (logicalStatus, state, isScottish) => {
  return (
    logicalStatus &&
    ((!isScottish &&
      ((logicalStatus === 1 && state && ![1, 2, 3].includes(state)) ||
        (logicalStatus === 5 && (!state || ![1, 2, 3, 4, 6].includes(state))) ||
        (logicalStatus === 6 && (!state || ![1, 5, 6, 7].includes(state))) ||
        (logicalStatus === 7 && state && ![1, 2, 3, 4, 6].includes(state)) ||
        (logicalStatus === 8 && state && ![4, 7].includes(state)) ||
        (logicalStatus === 9 && state && ![1, 2, 3, 4, 5, 6, 7].includes(state)))) ||
      (isScottish &&
        ((logicalStatus === 1 && (!state || ![0, 1, 2, 3].includes(state))) ||
          (logicalStatus === 6 && (!state || state !== 0)) ||
          (logicalStatus === 8 && (!state || state !== 4)) ||
          (logicalStatus === 9 && state && ![0, 1, 2, 3, 4].includes(state)))))
  );
};

/**
 * Check 2100047 - A BLPU logical status of 8 or 9 requires an end date.
 *
 * @param {Number|Null} logicalStatus The BLPU logical status
 * @param {Date|Null} endDate The BLPU end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100047 = (logicalStatus, endDate) => {
  return logicalStatus && [8, 9].includes(logicalStatus) && !endDate;
};

/**
 * Check 2100048 - State is invalid.
 *
 * @param {Number|Null} state The BLPU state
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100048 = (state) => {
  return state && !BLPUState.find((x) => x.id === state);
};

/**
 * Check 2100053 - Ward code does not exist in the lookup table.
 *
 * @param {String|Null} ward The BLPU ward code
 * @param {Object} currentLookups The lookup context object.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100053 = (ward, currentLookups) => {
  return ward && !currentLookups.wards.find((x) => x.wardCode === ward);
};

/**
 * Check 2100054 - Parish code does not exist in the lookup table.
 *
 * @param {String|Null} parish The BLPU parish code
 * @param {Object} currentLookups The lookup context object.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100054 = (parish, currentLookups) => {
  return parish && !currentLookups.parishes.find((x) => x.parishCode === parish);
};

/**
 * Check 2100055 - Classification does not exist in the lookup table.
 *
 * @param {String|Null} classification The BLPU classification
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100055 = (classification) => {
  return classification && !BLPUClassification.find((x) => x.id === classification);
};

/**
 * Check 2100059 - Enter a state.
 *
 * @param {Number|Null} state The BLPU state
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100059 = (state) => {
  return !state && (state === undefined || state === null);
};

/**
 * Check 2100060 - Authority is invalid.
 *
 * @param {Number|Null} authority The BLPU authority
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100060 = (authority) => {
  return authority && !DETRCodes.find((x) => x.id === authority);
};

/**
 * Check 2100061 - An approved BLPU more than a year old, can't have a classification of Unclassified.
 *
 * @param {Number|Null} logicalStatus The BLPU logical status
 * @param {String|Null} classification The BLPU classification
 * @param {Date|Null} startDate The BLPU start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100061 = (logicalStatus, classification, startDate) => {
  return (
    logicalStatus &&
    logicalStatus === 1 &&
    classification &&
    classification === "U" &&
    startDate &&
    isOlderThanYear(startDate)
  );
};

/**
 * Check 2100062 - An RPC of 9 can no longer be submitted to GeoPlace.
 *
 * @param {Number|Null} rpc The BLPU representative point code
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100062 = (rpc) => {
  return rpc && rpc === 9;
};

/**
 * Check 2100063 - Level is invalid.
 *
 * @param {Number|Null} level The BLPU level
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100063 = (level) => {
  return level && (level < 0.0 || level > 99.9);
};

/**
 * Check 2100065 - Organisation name contains unmatched brackets.
 *
 * @param {String|Null} organisation The BLPU organisation
 * @param {Number|Null} logicalStatus The BLPU logical status
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100065 = (organisation, logicalStatus) => {
  return organisation && [1, 6].includes(logicalStatus) && !bracketValidator(organisation);
};

/**
 * Check 2100068 - Enter a level.
 *
 * @param {Number|Null} level The BLPU level
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100068 = (level) => {
  return !level && level !== 0;
};

/**
 * Check 2100073 - Where a BLPU end date is set the BLPU state must be 4 (closed).
 *
 * @param {Date|Null} endDate The BLPU end date
 * @param {Number|Null} state The BLPU state
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100073 = (endDate, state) => {
  return endDate && state && state !== 4;
};

/**
 * Check 2100076 - Organisation name contains repeated punctuation.
 *
 * @param {String|Null} organisation The BLPU organisation
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100076 = (organisation) => {
  return organisation && !!/[^a-z0-9](?=[^a-z0-9])/gi.test(organisation.replace(/\s+/g, ""));
};

/**
 * Check 2100077 - Organisation name contains double spaces.
 *
 * @param {String|Null} organisation The BLPU organisation
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2100077 = (organisation) => {
  return organisation && organisation.includes("  ");
};
