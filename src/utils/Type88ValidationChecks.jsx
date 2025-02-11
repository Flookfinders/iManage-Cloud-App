//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Type 88 validation checks
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

/**
 * Check 8800001 - Property range and child range
 *
 * @param {Number|Null} rangeType The wizard range type
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck8800001 = (rangeType) => {
  return !rangeType;
};

/**
 * Check 8800002 - Some details are required to create a range of properties.
 *
 * @param {Number|Null} templateUseType The wizard template use type
 * @param {Number|Null} rangeType The wizard range type
 * @param {Number|Null} rangeStartNumber The wizard range start number
 * @param {String|Null} rangeStartPrefix The wizard range start prefix
 * @param {String|Null} rangeSuffix The wizard range suffix
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck8800002 = (templateUseType, rangeType, rangeStartNumber, rangeStartPrefix, rangeSuffix) => {
  return (
    templateUseType === 2 &&
    ((rangeType === 1 && !rangeStartNumber) ||
      (rangeType === 2 && !rangeStartPrefix && !rangeStartNumber && !rangeSuffix))
  );
};

/**
 * Check 8800003 - Some details are required to create a range of children.
 *
 * @param {Number|Null} templateUseType The wizard template use type
 * @param {Number|Null} rangeType The wizard range type
 * @param {Number|Null} rangeStartNumber The wizard range start number
 * @param {String|Null} rangeStartPrefix The wizard range start prefix
 * @param {String|Null} rangeSuffix The wizard range suffix
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck8800003 = (templateUseType, rangeType, rangeStartNumber, rangeStartPrefix, rangeSuffix) => {
  return (
    templateUseType === 4 &&
    ((rangeType === 1 && !rangeStartNumber) ||
      (rangeType === 2 && !rangeStartPrefix && !rangeStartNumber && !rangeSuffix))
  );
};

/**
 * Check 8800004 - Creating a range of properties using the PAO text needs some text.
 *
 * @param {Number|Null} rangeType The wizard range type
 * @param {Number|Null} templateUseType The wizard template use type
 * @param {String|Null} rangeText The wizard range text
 * @param {String|Null} rangeStartPrefix The wizard range start prefix
 * @param {Number|Null} rangeStartNumber The wizard range start number
 * @param {String|Null} rangeSuffix The wizard range suffix
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck8800004 = (
  rangeType,
  templateUseType,
  rangeText,
  rangeStartPrefix,
  rangeStartNumber,
  rangeSuffix
) => {
  return (
    rangeType === 2 && templateUseType === 2 && !rangeText && !rangeStartPrefix && !rangeStartNumber && !rangeSuffix
  );
};

/**
 * Check 8800005 - Creating a range of children using the SAO text needs some text.
 *
 * @param {Number|Null} rangeType The wizard range type
 * @param {Number|Null} templateUseType The wizard template use type
 * @param {String|Null} rangeText The wizard range text
 * @param {String|Null} rangeStartPrefix The wizard range start prefix
 * @param {Number|Null} rangeStartNumber The wizard range start number
 * @param {String|Null} rangeSuffix The wizard range suffix
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck8800005 = (
  rangeType,
  templateUseType,
  rangeText,
  rangeStartPrefix,
  rangeStartNumber,
  rangeSuffix
) => {
  return (
    rangeType === 2 && templateUseType === 4 && !rangeText && !rangeStartPrefix && !rangeStartNumber && !rangeSuffix
  );
};

/**
 * Check 8800006 - The end prefix has a value, but the start prefix is blank.
 *
 * @param {Number|Null} rangeType The wizard range type
 * @param {String|Null} rangeStartPrefix The wizard range start prefix
 * @param {String|Null} rangeEndPrefix The wizard range prefix
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck8800006 = (rangeType, rangeStartPrefix, rangeEndPrefix) => {
  return rangeType === 2 && !rangeStartPrefix && rangeEndPrefix;
};

/**
 * Check 8800007 - The end number has a value, but the start number is blank.
 *
 * @param {String|Null} rangeStartNumber The wizard range start number
 * @param {String|Null} rangeEndNumber The wizard range number
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck8800007 = (rangeStartNumber, rangeEndNumber) => {
  return !rangeStartNumber && rangeEndNumber;
};

/**
 * Check 8800008 - The end suffix has a value, but the start suffix is blank.
 *
 * @param {String|Null} rangeStartSuffix The wizard range start suffix
 * @param {String|Null} rangeEndSuffix The wizard range suffix
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck8800008 = (rangeStartSuffix, rangeEndSuffix) => {
  return !rangeStartSuffix && rangeEndSuffix;
};

/**
 * Check 8800009 - The end prefix should either be the same as or alphabetically after the start prefix.
 *
 * @param {Number|Null} rangeType The wizard range type
 * @param {String|Null} rangeStartPrefix The wizard range start prefix
 * @param {String|Null} rangeEndPrefix The wizard range prefix
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck8800009 = (rangeType, rangeStartPrefix, rangeEndPrefix) => {
  return (
    rangeType === 2 &&
    rangeStartPrefix &&
    rangeEndPrefix &&
    rangeStartPrefix.charCodeAt(0) > rangeEndPrefix.charCodeAt(0)
  );
};

/**
 * Check 8800010 - The end suffix should either be the same as or alphabetically after the start suffix.
 *
 * @param {String|Null} rangeStartSuffix The wizard range start suffix
 * @param {String|Null} rangeEndSuffix The wizard range suffix
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck8800010 = (rangeStartSuffix, rangeEndSuffix) => {
  return rangeStartSuffix && rangeEndSuffix && rangeStartSuffix.charCodeAt(0) > rangeEndSuffix.charCodeAt(0);
};

/**
 * Check 8800011 - The end number should either be the same or higher than the start number.
 *
 * @param {String|Null} rangeStartNumber The wizard range start number
 * @param {String|Null} rangeEndNumber The wizard range number
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck8800011 = (rangeStartNumber, rangeEndNumber) => {
  return rangeStartNumber && rangeEndNumber && Number(rangeStartNumber) > Number(rangeEndNumber);
};

/**
 * Check 8800012 - The start and end details cannot be the same.
 *
 * @param {String|Null} rangeStartPrefix The wizard range start prefix
 * @param {String|Null} rangeEndPrefix The wizard range prefix
 * @param {String|Null} rangeStartNumber The wizard range start number
 * @param {String|Null} rangeEndNumber The wizard range number
 * @param {String|Null} rangeStartSuffix The wizard range start suffix
 * @param {String|Null} rangeEndSuffix The wizard range suffix
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck8800012 = (
  rangeStartPrefix,
  rangeEndPrefix,
  rangeStartNumber,
  rangeEndNumber,
  rangeStartSuffix,
  rangeEndSuffix
) => {
  return (
    ((rangeStartPrefix && rangeEndPrefix) ||
      (rangeStartNumber && rangeEndNumber) ||
      (rangeStartSuffix && rangeEndSuffix)) &&
    rangeStartPrefix === rangeEndPrefix &&
    rangeStartNumber === rangeEndNumber &&
    rangeStartSuffix === rangeEndSuffix
  );
};

/**
 * Check 8800013 - The generated PAO text will be too long, reduce the length of the text.
 *
 * @param {Number|Null} rangeType The wizard range type
 * @param {Number|Null} templateUseType The wizard template use type
 * @param {String|Null} rangeText The wizard range text
 * @param {String|Null} rangeEndPrefix The wizard range prefix
 * @param {String|Null} rangeStartPrefix The wizard range start prefix
 * @param {String|Null} rangeEndNumber The wizard range number
 * @param {String|Null} rangeStartNumber The wizard range start number
 * @param {String|Null} rangeEndSuffix The wizard range suffix
 * @param {String|Null} rangeStartSuffix The wizard range start suffix
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck8800013 = (
  rangeType,
  templateUseType,
  rangeText,
  rangeEndPrefix,
  rangeStartPrefix,
  rangeEndNumber,
  rangeStartNumber,
  rangeEndSuffix,
  rangeStartSuffix
) => {
  return (
    rangeType === 2 &&
    templateUseType === 2 &&
    (rangeText ? rangeText.length : 0) +
      (rangeEndPrefix ? rangeEndPrefix.length : rangeStartPrefix ? rangeStartPrefix.length : 0) +
      (rangeEndNumber ? rangeEndNumber.length : rangeStartNumber ? rangeStartNumber.length : 0) +
      (rangeEndSuffix ? rangeEndSuffix.length : rangeStartSuffix ? rangeStartSuffix.length : 0) >
      90
  );
};

/**
 * Check 8800014 - The generated SAO text will be too long, reduce the length of the text.
 *
 * @param {Number|Null} rangeType The wizard range type
 * @param {Number|Null} templateUseType The wizard template use type
 * @param {String|Null} rangeText The wizard range text
 * @param {String|Null} rangeEndPrefix The wizard range prefix
 * @param {String|Null} rangeStartPrefix The wizard range start prefix
 * @param {String|Null} rangeEndNumber The wizard range number
 * @param {String|Null} rangeStartNumber The wizard range start number
 * @param {String|Null} rangeEndSuffix The wizard range suffix
 * @param {String|Null} rangeStartSuffix The wizard range start suffix
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck8800014 = (
  rangeType,
  templateUseType,
  rangeText,
  rangeEndPrefix,
  rangeStartPrefix,
  rangeEndNumber,
  rangeStartNumber,
  rangeEndSuffix,
  rangeStartSuffix
) => {
  return (
    rangeType === 2 &&
    templateUseType === 4 &&
    (rangeText ? rangeText.length : 0) +
      (rangeEndPrefix ? rangeEndPrefix.length : rangeStartPrefix ? rangeStartPrefix.length : 0) +
      (rangeEndNumber ? rangeEndNumber.length : rangeStartNumber ? rangeStartNumber.length : 0) +
      (rangeEndSuffix ? rangeEndSuffix.length : rangeStartSuffix ? rangeStartSuffix.length : 0) >
      90
  );
};

/**
 * Check 8800015 - At least 1 property needs to be included.
 *
 * @param {Array|Null} addressList The wizard address list
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck8800015 = (addressList) => {
  return addressList && addressList.length > 0 && addressList.filter((x) => x.included).length === 0;
};
