/* #region header */
/**************************************************************************************************
//
//  Description: Type 15 validation checks
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

/**
 * Check 1500002 - Enter a descriptor.
 *
 * @param {String|Null} descriptor The street descriptor
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1500002 = (descriptor) => {
  return !descriptor;
};

/**
 * Check 1500003 - Enter a language.
 *
 * @param {String|Null} language The language
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1500003 = (language) => {
  return !language;
};

/**
 * Check 1500004 - Enter a town name.
 *
 * @param {Number|Null} townRef The town reference
 * @param {Object|Null} townData The town lookup data
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1500004 = (townRef, townData) => {
  return !townRef || (townData && (!townData.town || townData.town === "Unassigned"));
};

/**
 * Check 1500005 - Enter an administrative area.
 *
 * @param {Number|Null} adminAreaRef The administrative area reference
 * @param {Object|Null} adminAreaData The administrative area lookup data
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1500005 = (adminAreaRef, adminAreaData) => {
  return (
    !adminAreaRef ||
    (adminAreaData && (!adminAreaData.administrativeArea || adminAreaData.administrativeArea === "Unassigned"))
  );
};

/**
 * Check 1500006 - Descriptor is too long.
 *
 * @param {String|Null} descriptor The street descriptor
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1500006 = (descriptor) => {
  return !descriptor && descriptor.length > 100;
};

/**
 * Check 1500007 - Locality name is too long.
 *
 * @param {Number|Null} locRef The locality reference
 * @param {Object|Null} locData The locality lookup data
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1500007 = (locRef, locData) => {
  return locRef && locData && locData.locality !== "Unassigned" && locData.locality.length > 35;
};

/**
 * Check 1500008 - Town name is too long.
 *
 * @param {Number|Null} townRef The town reference
 * @param {Object|Null} townData The town lookup data
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1500008 = (townRef, townData) => {
  return townRef && townData && townData.town !== "Unassigned" && townData.town.length > 30;
};

/**
 * Check 1500009 - Administrative area is too long.
 *
 * @param {Number|Null} adminAreaRef The administrative area reference
 * @param {Object|Null} adminAreaData The administrative area lookup data
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1500009 = (adminAreaRef, adminAreaData) => {
  return (
    adminAreaRef &&
    adminAreaData &&
    adminAreaData.administrativeArea !== "Unassigned" &&
    adminAreaData.administrativeArea.length > 30
  );
};

/**
 * Check 1500010 - Language is invalid.
 *
 * @param {String|Null} language The language for the record.
 * @param {Boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @param {Boolean} isWelsh True if the authority is a Welsh authority; otherwise false.
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1500010 = (language, isScottish, isWelsh) => {
  return (
    language &&
    ((isWelsh && !["ENG", "CYM"].includes(language)) ||
      (isScottish && !["ENG", "GAE"].includes(language)) ||
      (!isWelsh && !isScottish && language !== "ENG"))
  );
};

/**
 * Check 1500023 - Locality does not exist in the lookup table.
 *
 * @param {Number|Null} locRef The locality reference
 * @param {Object|Null} locData The locality lookup data
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1500023 = (locRef, locData) => {
  return locRef && !locData;
};

/**
 * Check 1500024 - Town does not exist in the lookup table.
 *
 * @param {Number|Null} townRef The town reference
 * @param {Object|Null} townData The town lookup data
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1500024 = (townRef, townData) => {
  return townRef && !townData;
};

/**
 * Check 1500025 - Administrative area does not exist in the lookup table.
 *
 * @param {Number|Null} adminAreaRef The administrative area reference
 * @param {Object|Null} adminAreaData The administrative area lookup data
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1500025 = (adminAreaRef, adminAreaData) => {
  return adminAreaRef && !adminAreaData;
};

/**
 * Check 1500026 - Locality and town must not be the same.
 *
 * @param {Number|Null} locRef The locality reference
 * @param {Object|Null} locData The locality lookup data
 * @param {Number|Null} townRef The town reference
 * @param {Object|Null} townData The town lookup data
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1500026 = (locRef, locData, townRef, townData) => {
  return (
    locRef &&
    locData &&
    locData.locality !== "Unassigned" &&
    townRef &&
    townData &&
    townData.town !== "Unassigned" &&
    locData.locality.toLowerCase() === townData.town.toLowerCase()
  );
};

/**
 * Check 1500033 - Island does not exist in the lookup table.
 *
 * @param {Number|Null} islandRef The island reference
 * @param {Object|Null} islandData The island lookup data
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1500033 = (islandRef, islandData) => {
  return islandRef && !islandData;
};

/**
 * Check 1500034 - Island name is too long.
 *
 * @param {Number|Null} islandRef The island reference
 * @param {Object|Null} islandData The island lookup data
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1500034 = (islandRef, islandData) => {
  return islandRef && islandData && islandData.island !== "Unassigned" && islandData.island.length > 30;
};

/**
 * Check 1500035 - Locality, town and island must not be the same.
 *
 * @param {Number|Null} locRef The locality reference
 * @param {Object|Null} locData The locality lookup data
 * @param {Number|Null} townRef The town reference
 * @param {Object|Null} townData The town lookup data
 * @param {Number|Null} islandRef The island reference
 * @param {Object|Null} islandData The island lookup data
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1500035 = (locRef, locData, townRef, townData, islandRef, islandData) => {
  return (
    locRef &&
    locData &&
    locData.locality !== "Unassigned" &&
    townRef &&
    townData &&
    townData.town !== "Unassigned" &&
    islandRef &&
    islandData &&
    islandData.island !== "Unassigned" &&
    (locData.locality.toLowerCase() === townData.town.toLowerCase() ||
      locData.locality.toLowerCase() === islandData.island.toLowerCase() ||
      townData.town.toLowerCase() === islandData.island.toLowerCase())
  );
};

/**
 * Check 1500038 - A street descriptor must have a town when a locality has been entered.
 *
 * @param {Number|Null} locRef The locality reference
 * @param {Object|Null} locData The locality lookup data
 * @param {Number|Null} townRef The town reference
 * @param {Object|Null} townData The town lookup data
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1500038 = (locRef, locData, townRef, townData) => {
  return (
    locRef && locData && locData.locality !== "Unassigned" && (!townRef || (townData && townData.town === "Unassigned"))
  );
};

/**
 * Check 1500042 - Descriptor should not begin with a space.
 *
 * @param {String|Null} descriptor The street descriptor
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1500042 = (descriptor) => {
  return descriptor && descriptor[0] === " ";
};

/**
 * Check 1500043 - Descriptor should not end with a space (open streets).
 *
 * @param {String|Null} descriptor The street descriptor
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1500043 = (descriptor) => {
  return descriptor && descriptor[descriptor.length - 1] === " ";
};

/**
 * Check 1500045 - Island and administrative area should not be the same.
 *
 * @param {Number|Null} islandRef The island reference
 * @param {Object|Null} islandData The island lookup data
 * @param {Number|Null} adminAreaRef The administrative area reference
 * @param {Object|Null} adminAreaData The administrative area lookup data
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck1500045 = (islandRef, islandData, adminAreaRef, adminAreaData) => {
  return (
    islandRef &&
    islandData &&
    islandData.island !== "Unassigned" &&
    adminAreaRef &&
    adminAreaData &&
    adminAreaData.administrativeArea !== "Unassigned" &&
    adminAreaData.administrativeArea.toLowerCase() === islandData.island.toLowerCase()
  );
};
