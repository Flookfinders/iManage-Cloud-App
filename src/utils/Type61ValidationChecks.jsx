/* #region header */
/**************************************************************************************************
//
//  Description: Type 61 validation checks
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
//#region Version 1.0.2.0 changes
//    002   26.11.24 Sean Flook      IMANN-1089 Include coordinates in failsCheck6100023.
//#endregion Version 1.0.2.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import { filteredLookup, isEndBeforeStart, isFutureDate, isIso885914, isPriorTo1990 } from "./HelperUtils";

import DETRCodes from "../data/DETRCodes";
import RoadStatusCode from "../data/RoadStatusCode";
import InterestType from "../data/InterestType";
import SwaOrgRef from "../data/SwaOrgRef";

/**
 * Check 6100006 - Start Easting(X) value is invalid.
 *
 * @param {Number|Null} x The interest start x
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6100006 = (x) => {
  return x && (x < 80000 || x > 656100);
};

/**
 * Check 6100007 - Start Northing(Y) value is invalid.
 *
 * @param {Number|Null} y The interest start y
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6100007 = (y) => {
  return y && (y < 5000 || y > 657700);
};

/**
 * Check 6100008 - End Easting(X) value is invalid.
 *
 * @param {Number|Null} x The interest end x
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6100008 = (x) => {
  return x && (x < 80000 || x > 656100);
};

/**
 * Check 6100009 - End Northing(Y) value is invalid.
 *
 * @param {Number|Null} y The interest end y
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6100009 = (y) => {
  return y && (y < 5000 || y > 657700);
};

/**
 * Check 6100011 - Authority is invalid.
 *
 * @param {Number|Null} authorityCode The interest authority code
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6100011 = (authorityCode) => {
  return authorityCode && !DETRCodes.find((x) => x.id === authorityCode);
};

/**
 * Check 6100012 - Enter an authority.
 *
 * @param {Number|Null} authorityCode The interest authority code
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6100012 = (authorityCode) => {
  return !authorityCode;
};

/**
 * Check 6100013 - Enter a district.
 *
 * @param {Number|Null} district The interest district code
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6100013 = (district) => {
  return !district;
};

/**
 * Check 6100014 - District is invalid.
 *
 * @param {Number|Null} district The interest district code
 * @param {Object} currentLookups The lookup context object.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6100014 = (district, currentLookups) => {
  return district && !currentLookups.operationalDistricts.find((x) => x.districtId === district);
};

/**
 * Check 6100021 - Specify location is too long.
 *
 * @param {String|Null} location The interest location
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6100021 = (location) => {
  return location && location.length > 250;
};

/**
 * Check 6100022 - If whole road set specify location must be blank.
 *
 * @param {String|Null} location The interest location
 * @param {Boolean} wholeRoad The interest whole road flag
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6100022 = (location, wholeRoad) => {
  return location && wholeRoad;
};

/**
 * Check 6100023 - If whole road not set specify location and coordinates must be set.
 *
 * @param {String|Null} location The interest location
 * @param {Boolean} wholeRoad The interest whole road flag
 * @param {Number|Null} startX The interest start x
 * @param {Number|Null} startY The interest start y
 * @param {Number|Null} endX The interest end x
 * @param {Number|Null} endY The interest end y
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6100023 = (location, wholeRoad, startX, startY, endX, endY) => {
  return !wholeRoad && (!location || !startX || !startY || !endX || !endY);
};

/**
 * Check 6100027 - Specify location contains an invalid character.
 *
 * @param {String|Null} location The interest location
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6100027 = (location) => {
  return location && !isIso885914(location);
};

/**
 * Check 6100029 - Street status is invalid.
 *
 * @param {Number|Null} status The interest street status
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6100029 = (status) => {
  return status && !filteredLookup(RoadStatusCode, false).find((x) => x.id === status);
};

/**
 * Check 6100030 - Enter an interest type.
 *
 * @param {Number|Null} type The interest type
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6100030 = (type) => {
  return !type;
};

/**
 * Check 6100031 - Interest type is invalid.
 *
 * @param {Number|Null} type The interest type
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6100031 = (type) => {
  return type && !InterestType.find((x) => x.id === type);
};

/**
 * Check 6100035 - An interest type of 8 or 9 must not have street status of 1, 2, 3 or 5.
 *
 * @param {Number|Null} type The interest type
 * @param {Number|Null} status The interest street status
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6100035 = (type, status) => {
  return type && status && [8, 9].includes(type) && [1, 2, 3, 5].includes(status);
};

/**
 * Check 6100036 - Maintaining organisation is invalid.
 *
 * @param {Number|Null} maintainingOrganisation The interest maintaining organisation
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6100036 = (maintainingOrganisation) => {
  return maintainingOrganisation && !filteredLookup(SwaOrgRef, false).find((x) => x.id === maintainingOrganisation);
};

/**
 * Check 6100037 - Maintaining organisation is invalid.
 *
 * @param {Number|Null} maintainingOrganisation The interest maintaining organisation
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6100037 = (maintainingOrganisation) => {
  return maintainingOrganisation && [11, 12, 13, 14, 16, 20, 7093].includes(maintainingOrganisation);
};

/**
 * Check 6100038 - Interested organisation street status of 4 must have an interest type of 8 or 9.
 *
 * @param {Number|Null} type The interest type
 * @param {Number|Null} status The interest street status
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6100038 = (type, status) => {
  return type && status && status === 4 && ![8, 9].includes(type);
};

/**
 * Check 6100040 - Start date cannot be in the future.
 *
 * @param {Date|Null} startDate The interest start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6100040 = (startDate) => {
  return startDate && isFutureDate(startDate);
};

/**
 * Check 6100041 - End date cannot be in the future.
 *
 * @param {Date|Null} endDate The interest end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6100041 = (endDate) => {
  return endDate && isFutureDate(endDate);
};

/**
 * Check 6100042 - End date cannot be before the start date.
 *
 * @param {Date|Null} startDate The interest start date
 * @param {Date|Null} endDate The interest end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6100042 = (startDate, endDate) => {
  return startDate && endDate && isEndBeforeStart(startDate, endDate);
};

/**
 * Check 6100043 - Start date prior to 1990 is not allowed.
 *
 * @param {Date|Null} startDate The interest start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6100043 = (startDate) => {
  return startDate && isPriorTo1990(startDate);
};

/**
 * Check 6100044 - Enter geometry.
 *
 * @param {String|Null} geometry The interest geometry
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6100044 = (geometry) => {
  return !geometry;
};

/**
 * Check 6100046 - Interested organisation does not exist in the SWA org ref table.
 *
 * @param {Number|Null} maintainingOrganisation The interest maintaining organisation
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6100046 = (maintainingOrganisation) => {
  return (
    maintainingOrganisation &&
    (!filteredLookup(SwaOrgRef, false).find((x) => x.id === maintainingOrganisation) ||
      [11, 12, 13, 14, 16, 20, 7093].includes(maintainingOrganisation))
  );
};

/**
 * Check 6100047 - District does not exist in the operational district table.
 *
 * @param {Number|Null} districtAuthority The interest district authority
 * @param {Object} currentLookups The lookup context object.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6100047 = (districtAuthority, currentLookups) => {
  return districtAuthority && !currentLookups.operationalDistricts.find((x) => x.districtId === districtAuthority);
};

/**
 * Check 6100049 - Enter a start date.
 *
 * @param {Date|Null} startDate The interest start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6100049 = (startDate) => {
  return !startDate;
};

/**
 * Check 6100050 - Interest type of 1 must have a street status of 1, 2, 3 or 5.
 *
 * @param {Number|Null} type The interest type
 * @param {Number|Null} status The interest street status
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6100050 = (type, status) => {
  return type && status && type === 1 && ![1, 2, 3, 5].includes(status);
};

/**
 * Check 6100051 - If whole road not set then specify location must not contain "WHOLE ROAD".
 *
 * @param {Boolean} wholeRoad The interest whole road flag
 * @param {String|Null} location The interest location
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6100051 = (wholeRoad, location) => {
  return !wholeRoad && location && location.toLowerCase().includes("whole road");
};

/**
 * Check 6100052 - If maintaining organisation is 0011, 0012, 0014, 0016, or 0020, street status must be 4.
 *
 * @param {Number|Null} maintainingOrganisation The interest maintaining organisation
 * @param {Number|Null} status The interest street status
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6100052 = (maintainingOrganisation, status) => {
  return maintainingOrganisation && [11, 12, 14, 16, 20].includes(maintainingOrganisation) && status !== 4;
};
