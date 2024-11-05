/* #region header */
/**************************************************************************************************
//
//  Description: Type 24 validation checks
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

import { characterSetValidator, isEndBeforeStart, isFutureDate, isPriorTo1753 } from "./HelperUtils";

import PostallyAddressable from "../data/PostallyAddressable";
import OfficialAddress from "../data/OfficialAddress";
import LPILogicalStatus from "../data/LPILogicalStatus";

/**
 * Check 2400007 - Enter a start date.
 *
 * @param {Date|Null} startDate The LPI start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400007 = (startDate) => {
  return !startDate;
};

/**
 * Check 2400008 - Start date cannot be in the future.
 *
 * @param {Date|Null} startDate The LPI start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400008 = (startDate) => {
  return startDate && isFutureDate(startDate);
};

/**
 * Check 2400011 - End date cannot be in the future.
 *
 * @param {Date|Null} endDate The LPI end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400011 = (endDate) => {
  return endDate && isFutureDate(endDate);
};

/**
 * Check 2400012 - End date cannot be before the start date.
 *
 * @param {Date|Null} startDate The LPI start date
 * @param {Date|Null} endDate The LPI end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400012 = (startDate, endDate) => {
  return startDate && endDate && isEndBeforeStart(startDate, endDate);
};

/**
 * Check 2400016 - The street for the LPI does not exist.
 *
 * @param {Number|Null} usrn The LPI USRN
 * @param {Object} currentLookups The lookup context object.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400016 = (usrn, currentLookups) => {
  return usrn && !currentLookups.streetDescriptors.find((x) => x.usrn === usrn);
};

/**
 * Check 2400017 - An LPI logical status of 7, 8 or 9 requires an end date.
 *
 * @param {Number|Null} logicalStatus The LPI logical status
 * @param {Date|Null} endDate The LPI end date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400017 = (logicalStatus, endDate) => {
  return logicalStatus && [7, 8, 9].includes(logicalStatus) && !endDate;
};

/**
 * Check 2400018 - PAO start suffix is too long.
 *
 * @param {String|Null} paoStartSuffix The LPI PAO start suffix
 * @param {Boolean} isWelsh True if the authority is a Welsh authority; otherwise false.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400018 = (paoStartSuffix, isWelsh) => {
  return paoStartSuffix && ((isWelsh && paoStartSuffix.length > 2) || (!isWelsh && paoStartSuffix.length > 1));
};

/**
 * Check 2400019 - PAO end suffix is too long.
 *
 * @param {String|Null} paoEndSuffix The LPI PAO end suffix
 * @param {Boolean} isWelsh True if the authority is a Welsh authority; otherwise false.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400019 = (paoEndSuffix, isWelsh) => {
  return paoEndSuffix && ((isWelsh && paoEndSuffix.length > 2) || (!isWelsh && paoEndSuffix.length > 1));
};

/**
 * Check 2400020 - SAO start suffix is too long.
 *
 * @param {String|Null} saoStartSuffix The LPI SAO start suffix
 * @param {Boolean} isWelsh True if the authority is a Welsh authority; otherwise false.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400020 = (saoStartSuffix, isWelsh) => {
  return saoStartSuffix && ((isWelsh && saoStartSuffix.length > 2) || (!isWelsh && saoStartSuffix.length > 1));
};

/**
 * Check 2400021 - SAO end suffix is too long.
 *
 * @param {String|Null} saoEndSuffix The LPI SAO end suffix
 * @param {Boolean} isWelsh True if the authority is a Welsh authority; otherwise false.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400021 = (saoEndSuffix, isWelsh) => {
  return saoEndSuffix && ((isWelsh && saoEndSuffix.length > 2) || (!isWelsh && saoEndSuffix.length > 1));
};

/**
 * Check 2400022 - Enter a postal address flag.
 *
 * @param {String|Null} postalAddress The LPI postal address
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400022 = (postalAddress) => {
  return !postalAddress;
};

/**
 * Check 2400023 - Postal address is too long.
 *
 * @param {String|Null} postalAddress The LPI postal address
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400023 = (postalAddress) => {
  return postalAddress && postalAddress.length > 1;
};

/**
 * Check 2400024 - Postal address is invalid.
 *
 * @param {String|Null} postalAddress The LPI postal address
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400024 = (postalAddress) => {
  return postalAddress && !PostallyAddressable.find((x) => x.id === postalAddress);
};

/**
 * Check 2400025 - Official address is too long.
 *
 * @param {String|Null} officialFlag The LPI official address
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400025 = (officialFlag) => {
  return officialFlag && officialFlag.length > 1;
};

/**
 * Check 2400026 - Official address is invalid.
 *
 * @param {String|Null} officialFlag The LPI official address
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400026 = (officialFlag) => {
  return officialFlag && !OfficialAddress.find((x) => x.id === officialFlag);
};

/**
 * Check 2400028 - Enter a language.
 *
 * @param {String|Null} language The LPI language
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400028 = (language) => {
  return !language;
};

/**
 * Check 2400029 - Language is invalid.
 *
 * @param {String|Null} language The LPI language
 * @param {Boolean} isWelsh True if the authority is a Welsh authority; otherwise false.
 * @param {Boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400029 = (language, isWelsh, isScottish) => {
  return (
    language &&
    ((isWelsh && !["ENG", "CYM"].includes(language)) ||
      (isScottish && !["ENG", "GAE"].includes(language)) ||
      (!isWelsh && !isScottish && language !== "ENG"))
  );
};

/**
 * Check 2400030 - Start dates prior to 1753 are not allowed.
 *
 * @param {Date|Null} startDate The LPI start date
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400030 = (startDate) => {
  return startDate && isPriorTo1753(startDate);
};

/**
 * Check 2400031 - End date supplied but logical status is not 8 or 9.
 *
 * @param {Date|Null} endDate The LPI end date
 * @param {Number|Null} logicalStatus The LPI logical status
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400031 = (endDate, logicalStatus) => {
  return endDate && logicalStatus && ![7, 8, 9].includes(logicalStatus);
};

/**
 * Check 2400032 - SAO start number is invalid.
 *
 * @param {Number|Null} saoStartNumber The LPI SAO start number
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400032 = (saoStartNumber) => {
  return saoStartNumber && (saoStartNumber < 0 || saoStartNumber > 9999);
};

/**
 * Check 2400033 - SAO end number is invalid.
 *
 * @param {Number|Null} saoEndNumber The LPI SAO end number
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400033 = (saoEndNumber) => {
  return saoEndNumber && (saoEndNumber < 0 || saoEndNumber > 9999);
};

/**
 * Check 2400034 - SAO end number populated but SAO start number is blank.
 *
 * @param {Number|Null} saoStartNumber The LPI SAO start number
 * @param {Number|Null} saoEndNumber The LPI SAO end number
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400034 = (saoStartNumber, saoEndNumber) => {
  return !saoStartNumber && saoEndNumber;
};

/**
 * Check 2400035 - PAO text is too long.
 *
 * @param {String|Null} paoText The LPI PAO text
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400035 = (paoText) => {
  return paoText && paoText.length > 90;
};

/**
 * Check 2400036 - SAO text is too long.
 *
 * @param {String|Null} saoText The LPI SAO text
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400036 = (saoText) => {
  return saoText && saoText.length > 90;
};

/**
 * Check 2400037 - PAO start number is invalid.
 *
 * @param {Number|Null} paoStartNumber The LPI PAO start number
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400037 = (paoStartNumber) => {
  return paoStartNumber && (paoStartNumber < 0 || paoStartNumber > 9999);
};

/**
 * Check 2400038 - PAO end number is invalid.
 *
 * @param {Number|Null} paoEndNumber The LPI PAO end number
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400038 = (paoEndNumber) => {
  return paoEndNumber && (paoEndNumber < 0 || paoEndNumber > 9999);
};

/**
 * Check 2400039 - PAO end number populated but PAO start number is blank.
 *
 * @param {Number|Null} paoStartNumber The LPI PAO start number
 * @param {Number|Null} paoEndNumber The LPI PAO end number
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400039 = (paoStartNumber, paoEndNumber) => {
  return !paoStartNumber && paoEndNumber;
};

/**
 * Check 2400040 - Enter PAO details.
 *
 * @param {Number|Null} paoStartNumber The LPI PAO start number
 * @param {String|Null} paoText The LPI PAO text
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400040 = (paoStartNumber, paoText) => {
  return !paoStartNumber && !paoText;
};

/**
 * Check 2400041 - PAO and SAO text must not be the same.
 *
 * @param {String|Null} paoText The LPI PAO text
 * @param {String|Null} saoText The LPI SAO text
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400041 = (paoText, saoText) => {
  return paoText && saoText && paoText.toLowerCase() === saoText.toLowerCase();
};

/**
 * Check 2400042 - Enter a USRN.
 *
 * @param {Number|Null} usrn The LPI USRN
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400042 = (usrn) => {
  return !usrn;
};

/**
 * Check 2400044 - Post town is too long.
 *
 * @param {Number|Null} postTownRef The LPI post town reference
 * @param {Object|Null} postTownData The post town data
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400044 = (postTownRef, postTownData) => {
  return postTownRef && postTownData && postTownData.postTown !== "Unassigned" && postTownData.postTown.length > 30;
};

/**
 * Check 2400045 - Postcode is too long.
 *
 * @param {Number|Null} postcodeRef The LPI postcode reference
 * @param {Object|Null} postcodeData The postcode data
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400045 = (postcodeRef, postcodeData) => {
  return postcodeRef && postcodeData && postcodeData.postcode !== "Unassigned" && postcodeData.postcode.length > 8;
};

/**
 * Check 2400049 - Postcode does not exist in the lookup table.
 *
 * @param {Number|Null} postcodeRef The LPI postcode reference
 * @param {Object} currentLookups The lookup context object.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400049 = (postcodeRef, currentLookups) => {
  return postcodeRef && !currentLookups.postcodes.find((x) => x.postcodeRef === postcodeRef);
};

/**
 * Check 2400055 - Post town does not exist in the lookup table.
 *
 * @param {Number|Null} postTownRef The LPI post town reference
 * @param {Object} currentLookups The lookup context object.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400055 = (postTownRef, currentLookups) => {
  return postTownRef && !currentLookups.postTowns.find((x) => x.postTownRef === postTownRef);
};

/**
 * Check 2400060 - Postal address of 'N' must not have a postcode or post town.
 *
 * @param {Number|Null} logicalStatus The LPI logical status
 * @param {String|Null} postalAddress The LPI postal address
 * @param {Number|Null} postTownRef The LPI post town reference
 * @param {Object|Null} postTownData The post town data
 * @param {Number|Null} postcodeRef The LPI postcode reference
 * @param {Object|Null} postcodeData The postcode data
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400060 = (
  logicalStatus,
  postalAddress,
  postTownRef,
  postTownData,
  postcodeRef,
  postcodeData
) => {
  return (
    logicalStatus &&
    logicalStatus !== 6 &&
    postalAddress &&
    postalAddress === "N" &&
    ((postTownRef && postTownData && postTownData.postTown !== "Unassigned") ||
      (postcodeRef && postcodeData && postcodeData.postcode !== "Unassigned"))
  );
};

/**
 * Check 2400061 - Postal address of 'Y', 'A' or 'L' must have a postcode and post town.
 *
 * @param {String|Null} postalAddress The LPI postal address
 * @param {Array} postalAddressCheck The array of postal address values to check
 * @param {Number|Null} postTownRef The LPI post town reference
 * @param {Object|Null} postTownData The post town data
 * @param {Number|Null} postcodeRef The LPI postcode reference
 * @param {Object|Null} postcodeData The postcode data
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400061 = (
  postalAddress,
  postalAddressCheck,
  postTownRef,
  postTownData,
  postcodeRef,
  postcodeData
) => {
  return (
    postalAddress &&
    postalAddressCheck.includes(postalAddress) &&
    (!postTownRef ||
      (postTownData && postTownData.postTown === "Unassigned") ||
      !postcodeRef ||
      (postcodeData && postcodeData.postcode === "Unassigned"))
  );
};

/**
 * Check 2400062 - Postal address of 'P' must have a postcode and a post town.
 *
 * @param {String|Null} postalAddress The LPI postal address
 * @param {Number|Null} postTownRef The LPI post town reference
 * @param {Object|Null} postTownData The post town data
 * @param {Number|Null} postcodeRef The LPI postcode reference
 * @param {Object|Null} postcodeData The postcode data
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400062 = (postalAddress, postTownRef, postTownData, postcodeRef, postcodeData) => {
  return (
    postalAddress &&
    postalAddress === "P" &&
    (!postTownRef ||
      (postTownData && postTownData.postTown === "Unassigned") ||
      !postcodeRef ||
      (postcodeData && postcodeData.postcode === "Unassigned"))
  );
};

/**
 * Check 2400064 - Enter an LPI Logical status.
 *
 * @param {Number|Null} logicalStatus The LPI logical status
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400064 = (logicalStatus) => {
  return !logicalStatus;
};

/**
 * Check 2400069 - LPI logical status is invalid.
 *
 * @param {Number|Null} logicalStatus The LPI logical status
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400069 = (logicalStatus) => {
  return logicalStatus && !LPILogicalStatus.find((x) => x.id === logicalStatus);
};

/**
 * Check 2400072 - Enter SAO details.
 *
 * @param {Number|Null} saoStartNumber The LPI SAO start number
 * @param {String|Null} saoText The LPI SAO text
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400072 = (saoStartNumber, saoText) => {
  return !saoStartNumber && !saoText;
};

/**
 * Check 2400073 - PAO start suffix supplied but no POA start number.
 *
 * @param {String|Null} paoStartSuffix The LPI PAO start suffix
 * @param {Number|Null} paoStartNumber The LPI PAO start number
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400073 = (paoStartSuffix, paoStartNumber) => {
  return paoStartSuffix && !paoStartNumber;
};

/**
 * Check 2400074 - PAO end suffix supplied but no PAO end number.
 *
 * @param {String|Null} paoEndSuffix The LPI PAO end suffix
 * @param {Number|Null} paoEndNumber The LPI PAO end number
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400074 = (paoEndSuffix, paoEndNumber) => {
  return paoEndSuffix && !paoEndNumber;
};

/**
 * Check 2400075 - SAO start suffix supplied but no SOA start number.
 *
 * @param {String|Null} saoStartSuffix The LPI SAO start suffix
 * @param {Number|Null} saoStartNumber The LPI SAO start number
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400075 = (saoStartSuffix, saoStartNumber) => {
  return saoStartSuffix && !saoStartNumber;
};

/**
 * Check 2400076 - SAO end suffix supplied but no SAO end number.
 *
 * @param {String|Null} saoEndSuffix The LPI SAO end suffix
 * @param {Number|Null} saoEndNumber The LPI SAO end number
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400076 = (saoEndSuffix, saoEndNumber) => {
  return saoEndSuffix && !saoEndNumber;
};

/**
 * Check 2400077 - SAO end number must be greater than SAO start number.
 *
 * @param {Number|Null} saoEndNumber The LPI SAO start number
 * @param {Number|Null} saoEndNumber The LPI SAO end number
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400077 = (saoStartNumber, saoEndNumber) => {
  return saoStartNumber && saoEndNumber && Number(saoStartNumber) >= Number(saoEndNumber);
};

/**
 * Check 2400078 - PAO end number must be greater than PAO start number.
 *
 * @param {Number|Null} paoStartNumber The LPI PAO start number
 * @param {Number|Null} paoEndNumber The LPI PAO end number
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400078 = (paoStartNumber, paoEndNumber) => {
  return paoStartNumber && paoEndNumber && Number(paoStartNumber) >= Number(paoEndNumber);
};

/**
 * Check 2400080 - PAO text contains an invalid character.
 *
 * @param {String|Null} paoText The LPI PAO text
 * @param {Boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400080 = (paoText, isScottish) => {
  return paoText && !characterSetValidator(paoText, `${isScottish ? "OneScotlandProperty" : "GeoPlaceProperty2"}`);
};

/**
 * Check 2400081 - SAO text contains an invalid character.
 *
 * @param {String|Null} saoText The LPI SAO text
 * @param {Boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400081 = (saoText, isScottish) => {
  return saoText && !characterSetValidator(saoText, `${isScottish ? "OneScotlandProperty" : "GeoPlaceProperty2"}`);
};

/**
 * Check 2400082 - If Postal address is 'Y' or 'L' it must have a postcode and post town.
 *
 * @param {String|Null} postalAddress The LPI postal address
 * @param {Number|Null} postTownRef The LPI post town reference
 * @param {Object|Null} postTownData The post town data
 * @param {Number|Null} postcodeRef The LPI postcode reference
 * @param {Object|Null} postcodeData The postcode data
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400082 = (postalAddress, postTownRef, postTownData, postcodeRef, postcodeData) => {
  return (
    postalAddress &&
    ["Y", "L"].includes(postalAddress) &&
    (!postTownRef ||
      (postTownData && postTownData.postTown === "Unassigned") ||
      !postcodeRef ||
      (postcodeData && postcodeData.postcode === "Unassigned"))
  );
};

/**
 * Check 2400083 - Sub-locality does not exist in the lookup table.
 *
 * @param {String|Null} subLocalityRef The LPI sub-locality reference
 * @param {Object} currentLookups The lookup context object.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400083 = (subLocalityRef, currentLookups) => {
  return subLocalityRef && !currentLookups.subLocalities.find((x) => x.subLocalityRef === subLocalityRef);
};

/**
 * Check 2400084 - An LPI logical status of 8 or 9 requires an end date.
 *
 * @param {Date|Null} endDate The LPI sub-locality reference
 * @param {Number|Null} logicalStatus The lookup context object.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400084 = (endDate, logicalStatus) => {
  return !endDate && logicalStatus && [8, 9].includes(logicalStatus);
};

/**
 * Check 2400085 - Level is too long.
 *
 * @param {String|Null} level The LPI level
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400085 = (level) => {
  return level && level.length > 30;
};

/**
 * Check 2400087 - Enter a official address flag.
 *
 * @param {String|Null} officialFlag The LPI official address flag
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400087 = (officialFlag) => {
  return !officialFlag;
};

/**
 * Check 2400088 - Enter a postal address flag.
 *
 * @param {String|Null} postallyAddressable The LPI postally addressable flag
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400088 = (postallyAddressable) => {
  return !postallyAddressable;
};

/**
 * Check 2400089 - Postal address is too long.
 *
 * @param {String|Null} postallyAddressable The LPI postally addressable flag
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400089 = (postallyAddressable) => {
  return postallyAddressable && postallyAddressable.length > 1;
};

/**
 * Check 2400090 - Postal address is too long.
 *
 * @param {String|Null} postallyAddressable The LPI postally addressable flag
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400090 = (postallyAddressable) => {
  return postallyAddressable && !["Y", "L", "N"].includes(postallyAddressable);
};

/**
 * Check 2400095 - PAO text must not contain only a number, use PAO start number for the number.
 *
 * @param {String|Null} paoText The LPI PAO text
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400095 = (paoText) => {
  return paoText && !isNaN(paoText) && !isNaN(parseFloat(paoText));
};

/**
 * Check 2400096 - SAO text must not contain only a number, use SAO start number for the number.
 *
 * @param {String|Null} saoText The LPI SAO text
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400096 = (saoText) => {
  return saoText && !isNaN(saoText) && !isNaN(parseFloat(saoText));
};

/**
 * Check 2400100 - PAO text begins with a space.
 *
 * @param {String|Null} paoText The LPI PAO text
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400100 = (paoText) => {
  return paoText && paoText[0] === " ";
};

/**
 * Check 2400102 - Street BLPU must not have number fields populated.
 *
 * @param {String|Null} paoText The LPI PAO text
 * @param {Number|Null} paoStartNumber The LPI PAO start number
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400102 = (paoText, paoStartNumber) => {
  return paoText && paoText.toLowerCase() === "street record" && paoStartNumber;
};

/**
 * Check 2400103 - Invalid characters in suffix column/s.
 *
 * @param {String|Null} suffix The LPI suffix
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400103 = (suffix) => {
  return suffix && !characterSetValidator(suffix, "GeoPlaceAZOnly");
};

/**
 * Check 2400105 - PAO and/or SAO text must not have double spaces.
 *
 * @param {String|Null} text The LPI text
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400105 = (text) => {
  return text && text.includes("  ");
};

/**
 * Check 2400107 - Street BLPU must not have sao text populated.
 *
 * @param {String|Null} paoText The LPI PAO text
 * @param {String|Null} saoText The LPI SAO text
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck2400107 = (paoText, saoText) => {
  return paoText && paoText.toLowerCase() === "street record" && saoText;
};
