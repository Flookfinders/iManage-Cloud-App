/* #region header */
/**************************************************************************************************
//
//  Description: Type 62 validation checks
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

import { filteredLookup, isEndBeforeStart, isFutureDate, isIso885914 } from "./HelperUtils";

import SwaOrgRef from "../data/SwaOrgRef";
import ReinstatementType from "../data/ReinstatementType";
import ConstructionType from "../data/ConstructionType";
import AggregateAbrasionValue from "../data/AggregateAbrasionValue";
import PolishedStoneValue from "../data/PolishedStoneValue";

/**
 * Check 6200006 - Start Easting(X) value is invalid.
 *
 * @param {Number|Null} x The construction start x
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6200006 = (x) => {
  return x && (x < 80000 || x > 656100);
};

/**
 * Check 6200007 - Start Northing(Y) value is invalid.
 *
 * @param {Number|Null} y The construction start y
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6200007 = (y) => {
  return y && (y < 5000 || y > 657700);
};

/**
 * Check 6200008 - End Easting(X) value is invalid.
 *
 * @param {Number|Null} x The construction end x
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6200008 = (x) => {
  return x && (x < 80000 || x > 656100);
};

/**
 * Check 6200009 - End Northing(Y) value is invalid.
 *
 * @param {Number|Null} y The construction end y
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6200009 = (y) => {
  return y && (y < 5000 || y > 657700);
};

/**
 * Check 6200014 - Organisation does not exist in the SWA org ref table.
 *
 * @param {Number|Null} organisation The construction organisation
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6200014 = (organisation) => {
  return (
    organisation &&
    (!filteredLookup(SwaOrgRef, false).find((x) => x.id === organisation) ||
      [11, 12, 13, 14, 16, 20, 7093].includes(organisation))
  );
};

/**
 * Check 6200015 - District is invalid.
 *
 * @param {Number|Null} district The construction district
 * @param {Object} currentLookups The lookup context object.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6200015 = (district, currentLookups) => {
  return district && !currentLookups.operationalDistricts.find((x) => x.districtId === district);
};

/**
 * Check 6200016 - Enter a construction reinstatement type.
 *
 * @param {Number|Null} type The construction type
 * @param {Number|Null} reinstatementType The construction reinstatement type
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6200016 = (type, reinstatementType) => {
  return type === 1 && !reinstatementType;
};

/**
 * Check 6200017 - Reinstatement type is invalid.
 *
 * @param {Number|Null} reinstatementType The construction reinstatement type
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6200017 = (reinstatementType) => {
  return reinstatementType && !ReinstatementType.find((x) => x.id === reinstatementType);
};

/**
 * Check 6200018 - Enter a construction type.
 *
 * @param {Number|Null} type The construction type
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6200018 = (type) => {
  return !type;
};

/**
 * Check 6200019 - Construction type is invalid.
 *
 * @param {Number|Null} type The construction type
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6200019 = (type) => {
  return type && !ConstructionType.find((x) => x.id === type);
};

/**
 * Check 6200020 - Aggregate abrasion value is invalid.
 *
 * @param {Number|Null} aggregateAbrasion The construction aggregate abrasion value
 * @param {Number|Null} reinstatementType The construction reinstatement type
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6200020 = (aggregateAbrasion, reinstatementType) => {
  return (
    aggregateAbrasion &&
    !AggregateAbrasionValue.find((x) => x.reinstatementCode === reinstatementType && x.id === aggregateAbrasion)
  );
};

/**
 * Check 6200022 - Polished stone value invalid.
 *
 * @param {Number|Null} polishedStone The construction polished stone value
 * @param {Number|Null} reinstatementType The construction reinstatement type
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6200022 = (polishedStone, reinstatementType) => {
  return (
    polishedStone &&
    !PolishedStoneValue.find((x) => x.reinstatementCode === reinstatementType && x.id === polishedStone)
  );
};

/**
 * Check 6200023 - Specify location is too long.
 *
 * @param {String|Null} location The construction location
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6200023 = (location) => {
  return location && location.length > 250;
};

/**
 * Check 6200024 - Start date cannot be in the future.
 *
 * @param {Date|Null} startDate The construction start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6200024 = (startDate) => {
  return startDate && isFutureDate(startDate);
};

/**
 * Check 6200025 - End date cannot be in the future.
 *
 * @param {Date|Null} endDate The construction end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6200025 = (endDate) => {
  return endDate && isFutureDate(endDate);
};

/**
 * Check 6200026 - End date cannot be before the start date.
 *
 * @param {Date|Null} startDate The construction start date
 * @param {Date|Null} endDate The construction end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6200026 = (startDate, endDate) => {
  return startDate && endDate && isEndBeforeStart(startDate, endDate);
};

/**
 * Check 6200027 - If whole road set specify location must be blank.
 *
 * @param {Boolean} wholeRoad The construction whole road flag
 * @param {String|Null} location The construction location
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6200027 = (wholeRoad, location) => {
  return wholeRoad && location;
};

/**
 * Check 6200028 - If whole road not set specify location must be set.
 *
 * @param {Boolean} wholeRoad The construction whole road flag
 * @param {String|Null} location The construction location
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6200028 = (wholeRoad, location) => {
  return !wholeRoad && !location;
};

/**
 * Check 6200030 - Enter a start date.
 *
 * @param {Date|Null} startDate The construction start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6200030 = (startDate) => {
  return !startDate;
};

/**
 * Check 6200033 - When construction type is 1, description must be blank.
 *
 * @param {Number|Null} type The construction type
 * @param {String|Null} description The construction description
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6200033 = (type, description) => {
  return type && type === 1 && description;
};

/**
 * Check 6200038 - Organisation and district must either both be blank or both have a value.
 *
 * @param {Number|Null} organisation The construction organisation
 * @param {Number|Null} district The construction district
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6200038 = (organisation, district) => {
  return (organisation && !district) || (!organisation && district);
};

/**
 * Check 6200046 - Description contains an invalid character.
 *
 * @param {String|Null} description The construction description
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6200046 = (description) => {
  return description && !isIso885914(description);
};

/**
 * Check 6200047 - Description is too long.
 *
 * @param {String|Null} description The construction description
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6200047 = (description) => {
  return description && description.length > 250;
};

/**
 * Check 6200048 - Specify location contains invalid characters.
 *
 * @param {String|Null} location The construction location
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6200048 = (location) => {
  return location && !isIso885914(location);
};

/**
 * Check 6200050 - Organisation code of 0011, 0012, 013, 0014, 0016, 0020 or 7093 must not be used.
 *
 * @param {Number|Null} organisation The construction organisation
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6200050 = (organisation) => {
  return organisation && [11, 12, 13, 14, 16, 20, 7093].includes(organisation);
};

/**
 * Check 6200051 - District does not exist in the operational district table.
 *
 * @param {Number|Null} district The construction district
 * @param {Object} currentLookups The lookup context object.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6200051 = (district, currentLookups) => {
  return district && !currentLookups.operationalDistricts.find((x) => x.districtId === district);
};

/**
 * Check 6200052 - Reinstatement type must not be present when construction type is 2 or 3.
 *
 * @param {Number|Null} type The construction type
 * @param {Number|Null} reinstatementType The construction reinstatement type
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6200052 = (type, reinstatementType) => {
  return type && [2, 3].includes(type) && reinstatementType;
};

/**
 * Check 6200053 - If whole road not set then specify location must not contain "WHOLE ROAD".
 *
 * @param {Boolean} wholeRoad The construction whole road flag
 * @param {String|Null} location The construction location
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6200053 = (wholeRoad, location) => {
  return !wholeRoad && location && location.toLowerCase().includes("whole road");
};

/**
 * Check 6200055 - Enter geometry.
 *
 * @param {String|Null} geometry The construction geometry
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6200055 = (geometry) => {
  return !geometry;
};
