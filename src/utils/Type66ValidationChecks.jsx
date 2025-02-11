//#region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Type 66 validation checks
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

import { filteredLookup, isEndBeforeStart, isFutureDate, isIso885914, isPriorTo1990 } from "./HelperUtils";

import PRoWDedicationCode from "../data/PRoWDedicationCode";
import PRoWStatusCode from "../data/PRoWStatusCode";
import SwaOrgRef from "../data/SwaOrgRef";

/**
 * Check 6600011 - Enter a dedication.
 *
 * @param {Number|Null} dedication The public right of way dedication
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6600011 = (dedication) => {
  return !dedication;
};

/**
 * Check 6600012 - Dedication is invalid.
 *
 * @param {Number|Null} dedication The public right of way dedication
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6600012 = (dedication) => {
  return dedication && !PRoWDedicationCode.find((x) => x.id === dedication);
};

/**
 * Check 6600013 - Enter a status.
 *
 * @param {Number|Null} status The public right of way status
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6600013 = (status) => {
  return !status;
};

/**
 * Check 6600014 - Status is invalid.
 *
 * @param {Number|Null} status The public right of way status
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6600014 = (status) => {
  return status && !PRoWStatusCode.find((x) => x.id === status);
};

/**
 * Check 6600017 - Length is invalid.
 *
 * @param {Number|Null} length The public right of way length
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6600017 = (length) => {
  return length < 0 || length > 99999;
};

/**
 * Check 6600019 - Enter a length.
 *
 * @param {Number|Null} length The public right of way length
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6600019 = (length) => {
  return !length;
};

/**
 * Check 6600027 - Enter a start date.
 *
 * @param {Date|Null} startDate The public right of way start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6600027 = (startDate) => {
  return !startDate;
};

/**
 * Check 6600028 - Start date cannot be in the future.
 *
 * @param {Date|Null} startDate The public right of way start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6600028 = (startDate) => {
  return startDate && isFutureDate(startDate);
};

/**
 * Check 6600029 - Start date prior to 1990 are not allowed.
 *
 * @param {Date|Null} startDate The public right of way start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6600029 = (startDate) => {
  return startDate && isPriorTo1990(startDate);
};

/**
 * Check 6600030 - Relevant start date prior to 1990 are not allowed.
 *
 * @param {Date|Null} relevantStartDate The public right of way relevant start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6600030 = (relevantStartDate) => {
  return relevantStartDate && isPriorTo1990(relevantStartDate);
};

/**
 * Check 6600032 - Record end date prior to 1990 are not allowed.
 *
 * @param {Date|Null} endDate The public right of way end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6600032 = (endDate) => {
  return endDate && isPriorTo1990(endDate);
};

/**
 * Check 6600033 - Record end date cannot be in the future.
 *
 * @param {Date|Null} endDate The public right of way end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6600033 = (endDate) => {
  return endDate && isFutureDate(endDate);
};

/**
 * Check 6600034 - Location is too long.
 *
 * @param {String|Null} location The public right of way location
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6600034 = (location) => {
  return location && location.length > 500;
};

/**
 * Check 6600035 - Location contains an invalid character.
 *
 * @param {String|Null} location The public right of way location
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6600035 = (location) => {
  return location && !isIso885914(location);
};

/**
 * Check 6600036 - Details is too long.
 *
 * @param {String|Null} details The public right of way details
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6600036 = (details) => {
  return details && details.length > 500;
};

/**
 * Check 6600037 - Details contains an invalid character.
 *
 * @param {String|Null} details The public right of way details
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6600037 = (details) => {
  return details && !isIso885914(details);
};

/**
 * Check 6600040 - Source is too long.
 *
 * @param {String|Null} source The public right of way source
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6600040 = (source) => {
  return source && source.length > 120;
};

/**
 * Check 6600041 - Source contains an invalid character.
 *
 * @param {String|Null} source The public right of way source
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6600041 = (source) => {
  return source && !isIso885914(source);
};

/**
 * Check 6600042 - PRoW org ref consultant is invalid.
 *
 * @param {Number|Null} organisation The public right of way organisation
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6600042 = (organisation) => {
  return organisation && !filteredLookup(SwaOrgRef, false).find((x) => x.id === organisation);
};

/**
 * Check 6600043 - Organisation and district must either both be blank or both have a value.
 *
 * @param {Number|Null} organisation The public right of way organisation
 * @param {Number|Null} district The public right of way district
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6600043 = (organisation, district) => {
  return (organisation && !district) || (!organisation && district);
};

/**
 * Check 6600044 - District is invalid.
 *
 * @param {Number|Null} district The public right of way district
 * @param {Object} currentLookups The lookup context object.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6600044 = (district, currentLookups) => {
  return district && !currentLookups.operationalDistricts.find((x) => x.districtId === district);
};

/**
 * Check 6600046 - Enter a location.
 *
 * @param {String|Null} location The public right of way location
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6600046 = (location) => {
  return !location;
};

/**
 * Check 6600047 - Enter details.
 *
 * @param {String|Null} details The public right of way details
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6600047 = (details) => {
  return !details;
};

/**
 * Check 6600048 - Appeal details is too long.
 *
 * @param {String|Null} appealDetails The public right of way appeal details
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6600048 = (appealDetails) => {
  return appealDetails && appealDetails.length > 30;
};

/**
 * Check 6600049 - Appeal reference is too long.
 *
 * @param {String|Null} appealReference The public right of way appeal reference
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6600049 = (appealReference) => {
  return appealReference && appealReference.length > 16;
};

/**
 * Check 6600050 - Consultation reference is too long.
 *
 * @param {String|Null} consultationReference The public right of way consultation reference
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6600050 = (consultationReference) => {
  return consultationReference && consultationReference.length > 16;
};

/**
 * Check 6600051 - Consultation details is too long.
 *
 * @param {String|Null} consultationDetails The public right of way consultation details
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6600051 = (consultationDetails) => {
  return consultationDetails && consultationDetails.length > 30;
};

/**
 * Check 6600053 - Status of 'C' the consultation start date, end date, reference and details must be present.
 *
 * @param {String|Null} status The public right of way consultation status
 * @param {Date|String|Null} consultField The public right of way consult field to check
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6600053 = (status, consultField) => {
  return status && status === "C" && !consultField;
};

/**
 * Check 6600054 - Consultation end date must be the same as or after the consultation start date.
 *
 * @param {Date|Null} startDate The public right of way consultation start date
 * @param {Date|Null} endDate The public right of way consultation end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6600054 = (startDate, endDate) => {
  return startDate && endDate && isEndBeforeStart(startDate, endDate);
};

/**
 * Check 6600055 - Status of 'A' the Appeal reference, date and details must be present.
 *
 * @param {String|Null} status The public right of way consultation status
 * @param {Date|String|Null} appealField The public right of way appeal field to check
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6600055 = (status, appealField) => {
  return status && status === "A" && !appealField;
};

/**
 * Check 6600056 - Status of 'D' the diversion USRN must be present.
 *
 * @param {String|Null} status The public right of way consultation status
 * @param {Number|Null} diversionUsrn The public right of way diversion USRN
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6600056 = (status, diversionUsrn) => {
  return status && status === "D" && !diversionUsrn;
};

/**
 * Check 6600058 - Organisation does not exist in the SWA org ref table.
 *
 * @param {Number|Null} organisation The public right of way organisation
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck6600058 = (organisation) => {
  return (
    organisation &&
    (!filteredLookup(SwaOrgRef, false).find((x) => x.id === organisation) ||
      [11, 12, 13, 14, 16, 20, 7093].includes(organisation))
  );
};
