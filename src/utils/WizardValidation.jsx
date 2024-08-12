/* #region header */
/**************************************************************************************************
//
//  Description: Wizard validation
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//  Maximum validation numbers
//  =================================
//  Wizard: 8800015
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001            Sean Flook                 Initial Revision.
//    002   23.03.23 Sean Flook         WI40605 Use the correct templateUseType numbers and fixed checks.
//    003   23.03.23 Sean Flook         WI40607 Added check for no address included when doing a range create.
//    004   24.03.23 Sean Flook         WI40608 Added checks for PAO details for child properties.
//    005   31.03.23 Sean Flook         WI40651 Corrected state date checks.
//    006   05.04.23 Sean Flook         WI40669 Added ValidateCrossReference.
//    007   13.04.23 Sean Flook         WI40681 Include the id in the cross reference errors.
//    008   19.04.23 Sean Flook         WI40653 use includeCheck to determine if a check should be run.
//    009   21.04.23 Sean Flook         WI40692 Corrected field name.
//    010   10.11.23 Sean Flook       IMANN-175 Changes required for Move BLPU seed point.
//    011   30.11.23 Sean Flook                 Changes required to handle Scottish authorities.
//    012   15.12.23 Sean Flook                 Added comments.
//    013   21.05.24 Sean Flook       IMANN-473 Added missing checks and fixed some logic.
//    014   22.05.24 Sean Flook       IMANN-473 Added missing checks for Scottish authorities.
//    015   29.05.24 Sean Flook       IMANN-494 Corrected check 2400087 and removed checks that cannot be done here.
//    016   29.05.24 Sean Flook       IMANN-504 Added new classification checks.
//    017   12.06.24 Sean Flook       IMANN-553 Modified checks 2100011 and 2100046 to cater for Scottish authorities.
//    018   12.06.24 Sean Flook       IMANN-553 Further modifications to checks 2100011 and 2100046 to cater for Scottish authorities.
//    019   14.06.24 Sean Flook       IMANN-534 Added and fixed various checks.
//    020   18.06.24 Sean Flook       IMANN-534 Correctly handle blpuStates of 0.
//    021   19.06.24 Sean Flook       IMANN-629 Changes to code so that current user is remembered and a 401 error displays the login dialog.
//    022   20.06.24 Sean Flook       IMANN-626 Corrected field name.
//    023   28.06.24 Sean Flook                 Corrected error number.
//    024   28.06.24 Joel Benford     IMANN-654 Fixed BLPU state validation treating 0 as falsy in dialogue
//    025   04.07.24 Sean Flook       IMANN-221 Updated messages.
//    026   04.07.24 Sean Flook       IMANN-221 Further updated messages.
//    027   16.07.24 Sean Flook       IMANN-786 Modified checks 8800004 & 8800005 to include all the range fields.
//    028   19.07.24 Sean Flook       IMANN-808 Deal with different field names for GP and OS for checks 2400060 & 2400061.
//    029   26.07.24 Sean Flook       IMANN-855 Modified checks 2400077 & 2400078.
//    030   09.08.24 Joel Benford     IMANN-533 Modified checks 2100024 & 2400042.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import { isFutureDate, isPriorTo1753, isOlderThanYear, includeCheck, GetErrorMessage, GetCheck } from "./HelperUtils";
import { IsStreetClosed } from "./StreetUtils";

import BLPULogicalStatus from "../data/BLPULogicalStatus";
import BLPUState from "../data/BLPUState";
import RepresentativePointCode from "../data/RepresentativePointCode";
import BLPUClassification from "../data/BLPUClassification";
import BLPUProvenance from "../data/BLPUProvenance";
import PostallyAddressable from "../data/PostallyAddressable";
import OfficialAddress from "../data/OfficialAddress";
import LPILogicalStatus from "../data/LPILogicalStatus";

const showDebugMessages = false;

/**
 * Validates the address details data
 *
 * @param {Object} data - The address details data that needs to be validated
 * @param {Object} currentLookups - The lookup context object.
 * @param {Object} userContext - The user context object for the user who is calling the endpoint.
 * @param {Boolean} isScottish - True if the authority is a Scottish authority; otherwise false.
 * @param {Number} numberingSystem - A number indicating the numbering system that is going to be used.
 * @param {Number} templateUseType - The use type for the template.
 * @return {Array}
 */
export function ValidateAddressDetails(
  data,
  currentLookups,
  userContext,
  isScottish,
  numberingSystem,
  templateUseType
) {
  const methodName = "ValidateAddressDetails";
  const validationErrors = [];
  let currentCheck;
  const paoStartNumberErrors = [];
  const saoStartNumberErrors = [];
  const usrnErrors = [];
  const rangeTypeErrors = [];
  const rangeTextErrors = [];
  const rangeStartNumberErrors = [];
  const postcodeRefErrors = [];
  const postTownRefErrors = [];
  const addressListErrors = [];
  const paoDetailsErrors = [];
  const paoTextErrors = [];
  const saoTextErrors = [];

  // console.log("[SF] ValidateAddressDetails", {
  //   data: data,
  //   numberingSystem: numberingSystem,
  //   templateUseType: templateUseType,
  // });

  if (!data) {
    switch (numberingSystem) {
      case 1: // Single property and child
        switch (templateUseType) {
          case 1: // Single property
            // Enter PAO details.
            currentCheck = GetCheck(2400040, currentLookups, methodName, isScottish, showDebugMessages);
            if (includeCheck(currentCheck, isScottish)) {
              paoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
            }
            break;

          case 3: // Single child
            // Enter a street.
            currentCheck = GetCheck(2400108, currentLookups, methodName, isScottish, showDebugMessages);
            if (includeCheck(currentCheck, isScottish))
              saoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
            break;

          default:
            break;
        }
        break;

      case 2: // Property range and child range
        // A type of range is required.
        currentCheck = GetCheck(8800001, currentLookups, methodName, isScottish, showDebugMessages);
        if (includeCheck(currentCheck, isScottish)) rangeTypeErrors.push(GetErrorMessage(currentCheck, isScottish));
        break;

      default:
        break;
    }
  } else {
    switch (numberingSystem) {
      case 1: // Single property and child
        switch (templateUseType) {
          case 1: // Single property
            // PAO text is too long.
            currentCheck = GetCheck(2400035, currentLookups, methodName, isScottish, showDebugMessages);
            if (includeCheck(currentCheck, isScottish) && data.paoText && data.paoText.length > 90)
              paoTextErrors.push(GetErrorMessage(currentCheck, isScottish));

            // PAO start number is invalid.
            currentCheck = GetCheck(2400037, currentLookups, methodName, isScottish, showDebugMessages);
            if (
              includeCheck(currentCheck, isScottish) &&
              data.paoStartNumber &&
              (data.paoStartNumber < 0 || data.paoStartNumber > 9999)
            )
              paoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));

            // PAO end number is invalid.
            currentCheck = GetCheck(2400038, currentLookups, methodName, isScottish, showDebugMessages);
            if (
              includeCheck(currentCheck, isScottish) &&
              data.paoEndNumber &&
              (data.paoEndNumber < 0 || data.paoEndNumber > 9999)
            )
              paoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));

            // PAO end number populated but PAO start number is blank.
            currentCheck = GetCheck(2400039, currentLookups, methodName, isScottish, showDebugMessages);
            if (includeCheck(currentCheck, isScottish) && !data.paoStartNumber && data.paoEndNumber)
              paoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));

            // Enter PAO details.
            currentCheck = GetCheck(2400040, currentLookups, methodName, isScottish, showDebugMessages);
            if (includeCheck(currentCheck, isScottish) && !data.paoStartNumber && !data.paoText) {
              paoTextErrors.push(GetErrorMessage(currentCheck, isScottish));
            }

            // PAO start suffix supplied but no PAO start number.
            currentCheck = GetCheck(2400073, currentLookups, methodName, isScottish, showDebugMessages);
            if (includeCheck(currentCheck, isScottish) && data.paoStartSuffix && !data.paoStartNumber) {
              paoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
            }

            // PAO end suffix supplied but no PAO end number.
            currentCheck = GetCheck(2400074, currentLookups, methodName, isScottish, showDebugMessages);
            if (includeCheck(currentCheck, isScottish) && data.paoEndSuffix && !data.paoEndNumber) {
              paoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
            }

            // PAO end number must be greater than PAO start number.
            currentCheck = GetCheck(2400078, currentLookups, methodName, isScottish, showDebugMessages);
            if (
              includeCheck(currentCheck, isScottish) &&
              data.paoStartNumber &&
              data.paoEndNumber &&
              Number(data.paoStartNumber) >= Number(data.paoEndNumber)
            )
              paoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));

            // PAO text must not contain only a number, use PAO start number for the number.
            currentCheck = GetCheck(2400095, currentLookups, methodName, isScottish, showDebugMessages);
            if (
              isScottish &&
              includeCheck(currentCheck, isScottish) &&
              data.paoText &&
              !isNaN(data.paoText) &&
              !isNaN(parseFloat(data.paoText))
            ) {
              paoTextErrors.push(GetErrorMessage(currentCheck, isScottish));
            }
            break;

          case 3: // Single child
            // SAO end number populated but SAO start number is blank.
            currentCheck = GetCheck(2400034, currentLookups, methodName, isScottish, showDebugMessages);
            if (includeCheck(currentCheck, isScottish) && !data.saoStartNumber && data.saoEndNumber)
              saoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));

            // SAO text is too long.
            currentCheck = GetCheck(2400036, currentLookups, methodName, isScottish, showDebugMessages);
            if (includeCheck(currentCheck, isScottish) && data.saoText && data.saoText.length > 90)
              saoTextErrors.push(GetErrorMessage(currentCheck, isScottish));

            // Enter SAO details.
            currentCheck = GetCheck(2400072, currentLookups, methodName, isScottish, showDebugMessages);
            if (includeCheck(currentCheck, isScottish) && !data.saoStartNumber && !data.saoText)
              saoTextErrors.push(GetErrorMessage(currentCheck, isScottish));

            // SAO start suffix supplied but no SAO start number.
            currentCheck = GetCheck(2400075, currentLookups, methodName, isScottish, showDebugMessages);
            if (includeCheck(currentCheck, isScottish) && data.saoStartSuffix && !data.saoStartNumber) {
              saoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
            }

            // SAO end suffix supplied but no SAO end number.
            currentCheck = GetCheck(2400076, currentLookups, methodName, isScottish, showDebugMessages);
            if (includeCheck(currentCheck, isScottish) && data.saoEndSuffix && !data.saoEndNumber) {
              saoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
            }

            // SAO end number must be greater than SAO start number.
            currentCheck = GetCheck(2400077, currentLookups, methodName, isScottish, showDebugMessages);
            if (
              includeCheck(currentCheck, isScottish) &&
              data.saoStartNumber &&
              data.saoEndNumber &&
              Number(data.saoStartNumber) >= Number(data.saoEndNumber)
            )
              saoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));

            // PAO text is too long.
            currentCheck = GetCheck(2400035, currentLookups, methodName, isScottish, showDebugMessages);
            if (includeCheck(currentCheck, isScottish) && data.paoText && data.paoText.length > 90)
              paoDetailsErrors.push(GetErrorMessage(currentCheck, isScottish));

            // PAO start number is invalid.
            currentCheck = GetCheck(2400037, currentLookups, methodName, isScottish, showDebugMessages);
            if (
              includeCheck(currentCheck, isScottish) &&
              data.paoStartNumber &&
              (data.paoStartNumber < 0 || data.paoStartNumber > 9999)
            )
              paoDetailsErrors.push(GetErrorMessage(currentCheck, isScottish));

            // PAO end number is invalid.
            currentCheck = GetCheck(2400038, currentLookups, methodName, isScottish, showDebugMessages);
            if (
              includeCheck(currentCheck, isScottish) &&
              data.paoEndNumber &&
              (data.paoEndNumber < 0 || data.paoEndNumber > 9999)
            )
              paoDetailsErrors.push(GetErrorMessage(currentCheck, isScottish));

            // PAO end number populated but PAO start number is blank.
            currentCheck = GetCheck(2400039, currentLookups, methodName, isScottish, showDebugMessages);
            if (includeCheck(currentCheck, isScottish) && !data.paoStartNumber && data.paoEndNumber)
              paoDetailsErrors.push(GetErrorMessage(currentCheck, isScottish));

            // Enter PAO details.
            currentCheck = GetCheck(2400040, currentLookups, methodName, isScottish, showDebugMessages);
            if (includeCheck(currentCheck, isScottish) && !data.paoStartNumber && !data.paoText) {
              paoDetailsErrors.push(GetErrorMessage(currentCheck, isScottish));
            }

            // PAO start suffix supplied but no PAO start number.
            currentCheck = GetCheck(2400073, currentLookups, methodName, isScottish, showDebugMessages);
            if (includeCheck(currentCheck, isScottish) && data.paoStartSuffix && !data.paoStartNumber) {
              paoDetailsErrors.push(GetErrorMessage(currentCheck, isScottish));
            }

            // PAO end suffix supplied but no PAO end number.
            currentCheck = GetCheck(2400074, currentLookups, methodName, isScottish, showDebugMessages);
            if (includeCheck(currentCheck, isScottish) && data.paoEndSuffix && !data.paoEndNumber) {
              paoDetailsErrors.push(GetErrorMessage(currentCheck, isScottish));
            }

            // PAO end number must be greater than PAO start number.
            currentCheck = GetCheck(2400078, currentLookups, methodName, isScottish, showDebugMessages);
            if (
              includeCheck(currentCheck, isScottish) &&
              data.paoStartNumber &&
              data.paoEndNumber &&
              Number(data.paoStartNumber) >= Number(data.paoEndNumber)
            )
              paoDetailsErrors.push(GetErrorMessage(currentCheck, isScottish));

            // PAO text must not contain only a number, use PAO start number for the number.
            currentCheck = GetCheck(2400095, currentLookups, methodName, isScottish, showDebugMessages);
            if (
              isScottish &&
              includeCheck(currentCheck, isScottish) &&
              data.paoText &&
              !isNaN(data.paoText) &&
              !isNaN(parseFloat(data.paoText))
            ) {
              paoDetailsErrors.push(GetErrorMessage(currentCheck, isScottish));
            }

            // SAO text must not contain only a number, use SAO start number for the number.
            currentCheck = GetCheck(2400096, currentLookups, methodName, isScottish, showDebugMessages);
            if (
              isScottish &&
              includeCheck(currentCheck, isScottish) &&
              data.saoText &&
              !isNaN(data.saoText) &&
              !isNaN(parseFloat(data.saoText))
            ) {
              saoTextErrors.push(GetErrorMessage(currentCheck, isScottish));
            }
            break;

          default:
            break;
        }
        break;

      case 2: // Property range and child range
        // A type of range is required.
        currentCheck = GetCheck(8800001, currentLookups, methodName, isScottish, showDebugMessages);
        if (includeCheck(currentCheck, isScottish) && !data.rangeType)
          rangeTypeErrors.push(GetErrorMessage(currentCheck, isScottish));

        // Creating a range of properties using the PAO text needs some text.
        currentCheck = GetCheck(8800004, currentLookups, methodName, isScottish, showDebugMessages);
        if (
          includeCheck(currentCheck, isScottish) &&
          data.rangeType === 2 &&
          templateUseType === 2 &&
          !data.rangeText &&
          !data.rangeStartPrefix &&
          !data.rangeStartNumber &&
          !data.rangeSuffix
        )
          rangeTextErrors.push(GetErrorMessage(currentCheck, isScottish));

        // Creating a range of children using the SAO text needs some text.
        currentCheck = GetCheck(8800005, currentLookups, methodName, isScottish, showDebugMessages);
        if (
          includeCheck(currentCheck, isScottish) &&
          data.rangeType === 2 &&
          templateUseType === 4 &&
          !data.rangeText &&
          !data.rangeStartPrefix &&
          !data.rangeStartNumber &&
          !data.rangeSuffix
        )
          rangeTextErrors.push(GetErrorMessage(currentCheck, isScottish));

        // Some details are required to create a range of properties.
        currentCheck = GetCheck(8800002, currentLookups, methodName, isScottish, showDebugMessages);
        if (
          includeCheck(currentCheck, isScottish) &&
          templateUseType === 2 &&
          ((data.rangeType === 1 && !data.rangeStartNumber) ||
            (data.rangeType === 2 && !data.rangeStartPrefix && !data.rangeStartNumber && !data.rangeSuffix))
        )
          rangeStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));

        // Some details are required to create a range of children.
        currentCheck = GetCheck(8800003, currentLookups, methodName, isScottish, showDebugMessages);
        if (
          includeCheck(currentCheck, isScottish) &&
          templateUseType === 4 &&
          ((data.rangeType === 1 && !data.rangeStartNumber) ||
            (data.rangeType === 2 && !data.rangeStartPrefix && !data.rangeStartNumber && !data.rangeSuffix))
        )
          rangeStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));

        // The end prefix has a value, but the start prefix is blank.
        currentCheck = GetCheck(8800006, currentLookups, methodName, isScottish, showDebugMessages);
        if (
          includeCheck(currentCheck, isScottish) &&
          data.rangeType === 2 &&
          !data.rangeStartPrefix &&
          data.rangeEndPrefix
        )
          rangeStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));

        // The end number has a value, but the start number is blank.
        currentCheck = GetCheck(8800007, currentLookups, methodName, isScottish, showDebugMessages);
        if (includeCheck(currentCheck, isScottish) && !data.rangeStartNumber && data.rangeEndNumber)
          rangeStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));

        // The end suffix has a value, but the start suffix is blank.
        currentCheck = GetCheck(8800008, currentLookups, methodName, isScottish, showDebugMessages);
        if (includeCheck(currentCheck, isScottish) && !data.rangeStartSuffix && data.rangeEndSuffix)
          rangeStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));

        // The end prefix should either be the same as or alphabetically after the start prefix.
        currentCheck = GetCheck(8800009, currentLookups, methodName, isScottish, showDebugMessages);
        if (
          includeCheck(currentCheck, isScottish) &&
          data.rangeType === 2 &&
          data.rangeStartPrefix &&
          data.rangeEndPrefix &&
          data.rangeStartPrefix.charCodeAt(0) > data.rangeEndPrefix.charCodeAt(0)
        )
          rangeStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));

        // The end number should either be the same or higher than the start number.
        currentCheck = GetCheck(8800011, currentLookups, methodName, isScottish, showDebugMessages);
        if (
          includeCheck(currentCheck, isScottish) &&
          data.rangeStartNumber &&
          data.rangeEndNumber &&
          Number(data.rangeStartNumber) > Number(data.rangeEndNumber)
        )
          rangeStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));

        // The end suffix should either be the same as or alphabetically after the start suffix.
        currentCheck = GetCheck(8800010, currentLookups, methodName, isScottish, showDebugMessages);
        if (
          includeCheck(currentCheck, isScottish) &&
          data.rangeStartSuffix &&
          data.rangeEndSuffix &&
          data.rangeStartSuffix.charCodeAt(0) > data.rangeEndSuffix.charCodeAt(0)
        )
          rangeStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));

        // The start and end details cannot be the same.
        currentCheck = GetCheck(8800012, currentLookups, methodName, isScottish, showDebugMessages);
        if (
          includeCheck(currentCheck, isScottish) &&
          ((data.rangeStartPrefix && data.rangeEndPrefix) ||
            (data.rangeStartNumber && data.rangeEndNumber) ||
            (data.rangeStartSuffix && data.rangeEndSuffix)) &&
          data.rangeStartPrefix === data.rangeEdPrefix &&
          data.rangeStartNumber === data.rangeEndNumber &&
          data.rangeStartSuffix === data.rangeEndSuffix
        )
          rangeStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));

        // The generated PAO text will be too long, reduce the length of the text.
        currentCheck = GetCheck(8800013, currentLookups, methodName, isScottish, showDebugMessages);
        if (
          includeCheck(currentCheck, isScottish) &&
          data.rangeType === 2 &&
          templateUseType === 2 &&
          (data.rangeText ? data.rangeText.length : 0) +
            (data.rangeEndPrefix
              ? data.rangeEndPrefix.length
              : data.rangeStartPrefix
              ? data.rangeStartPrefix.length
              : 0) +
            (data.rangeEndNumber
              ? data.rangeEndNumber.length
              : data.rangeStartNumber
              ? data.rangeStartNumber.length
              : 0) +
            (data.rangeEndSuffix
              ? data.rangeEndSuffix.length
              : data.rangeStartSuffix
              ? data.rangeStartSuffix.length
              : 0) >
            90
        )
          rangeTextErrors.push(GetErrorMessage(currentCheck, isScottish));

        // The generated SAO text will be too long, reduce the length of the text.
        currentCheck = GetCheck(8800014, currentLookups, methodName, isScottish, showDebugMessages);
        if (
          includeCheck(currentCheck, isScottish) &&
          data.rangeType === 2 &&
          templateUseType === 4 &&
          (data.rangeText ? data.rangeText.length : 0) +
            (data.rangeEndPrefix
              ? data.rangeEndPrefix.length
              : data.rangeStartPrefix
              ? data.rangeStartPrefix.length
              : 0) +
            (data.rangeEndNumber
              ? data.rangeEndNumber.length
              : data.rangeStartNumber
              ? data.rangeStartNumber.length
              : 0) +
            (data.rangeEndSuffix
              ? data.rangeEndSuffix.length
              : data.rangeStartSuffix
              ? data.rangeStartSuffix.length
              : 0) >
            90
        )
          rangeTextErrors.push(GetErrorMessage(currentCheck, isScottish));

        // At least 1 property needs to be included.
        currentCheck = GetCheck(8800015, currentLookups, methodName, isScottish, showDebugMessages);
        if (
          includeCheck(currentCheck, isScottish) &&
          data.addressList &&
          data.addressList.length > 0 &&
          data.addressList.filter((x) => x.included).length === 0
        )
          addressListErrors.push(GetErrorMessage(currentCheck, isScottish));

        if (templateUseType === 4) {
          // Range of children
          // PAO text is too long.
          currentCheck = GetCheck(2400035, currentLookups, methodName, isScottish, showDebugMessages);
          if (includeCheck(currentCheck, isScottish) && data.paoText && data.paoText.length > 90)
            paoDetailsErrors.push(GetErrorMessage(currentCheck, isScottish));

          // PAO start number is invalid.
          currentCheck = GetCheck(2400037, currentLookups, methodName, isScottish, showDebugMessages);
          if (
            includeCheck(currentCheck, isScottish) &&
            data.paoStartNumber &&
            (data.paoStartNumber < 0 || data.paoStartNumber > 9999)
          )
            paoDetailsErrors.push(GetErrorMessage(currentCheck, isScottish));

          // PAO end number is invalid.
          currentCheck = GetCheck(2400038, currentLookups, methodName, isScottish, showDebugMessages);
          if (
            includeCheck(currentCheck, isScottish) &&
            data.paoEndNumber &&
            (data.paoEndNumber < 0 || data.paoEndNumber > 9999)
          )
            paoDetailsErrors.push(GetErrorMessage(currentCheck, isScottish));

          // PAO end number populated but PAO start number is blank.
          currentCheck = GetCheck(2400039, currentLookups, methodName, isScottish, showDebugMessages);
          if (includeCheck(currentCheck, isScottish) && !data.paoStartNumber && data.paoEndNumber)
            paoDetailsErrors.push(GetErrorMessage(currentCheck, isScottish));

          // Enter PAO details.
          currentCheck = GetCheck(2400040, currentLookups, methodName, isScottish, showDebugMessages);
          if (includeCheck(currentCheck, isScottish) && !data.paoStartNumber && !data.paoText) {
            paoDetailsErrors.push(GetErrorMessage(currentCheck, isScottish));
          }

          // Pao start suffix supplied but no PAO start number.
          currentCheck = GetCheck(2400073, currentLookups, methodName, isScottish, showDebugMessages);
          if (includeCheck(currentCheck, isScottish) && data.paoStartSuffix && !data.paoStartNumber) {
            paoDetailsErrors.push(GetErrorMessage(currentCheck, isScottish));
          }

          // PAO end suffix supplied but no PAO end number.
          currentCheck = GetCheck(2400074, currentLookups, methodName, isScottish, showDebugMessages);
          if (includeCheck(currentCheck, isScottish) && data.paoEndSuffix && !data.paoEndNumber) {
            paoDetailsErrors.push(GetErrorMessage(currentCheck, isScottish));
          }

          // PAO end number must be greater than PAO start number.
          currentCheck = GetCheck(2400078, currentLookups, methodName, isScottish, showDebugMessages);
          if (
            includeCheck(currentCheck, isScottish) &&
            data.paoStartNumber &&
            data.paoEndNumber &&
            Number(data.paoStartNumber) >= Number(data.paoEndNumber)
          )
            paoDetailsErrors.push(GetErrorMessage(currentCheck, isScottish));
        }
        break;

      default:
        break;
    }

    // Enter a street.
    currentCheck = GetCheck(2400108, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.usrn)
      usrnErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Postcode does not exist in the lookup table.
    currentCheck = GetCheck(2400049, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.postcodeRef &&
      !currentLookups.postcodes.find((x) => x.postcodeRef === data.postcodeRef)
    ) {
      postcodeRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Post town does not exist in the lookup table.
    currentCheck = GetCheck(2400055, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.postTownRef &&
      !currentLookups.postTowns.find((x) => x.postTownRef === data.postTownRef)
    ) {
      postTownRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Open BLPU/LPI on a closed street.
    currentCheck = GetCheck(2100013, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.usrn && !IsStreetClosed(data.usrn, userContext, isScottish))
      usrnErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Enter a descriptor.
    currentCheck = GetCheck(1100007, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.usrn &&
      !currentLookups.streetDescriptors.find((x) => x.usrn === data.usrn)
    ) {
      usrnErrors.push(GetErrorMessage(currentCheck, isScottish));
    }
  }

  if (saoStartNumberErrors.length > 0)
    validationErrors.push({
      field: "SaoStartNumber",
      errors: saoStartNumberErrors,
    });

  if (paoStartNumberErrors.length > 0)
    validationErrors.push({
      field: "PaoStartNumber",
      errors: paoStartNumberErrors,
    });

  if (usrnErrors.length > 0)
    validationErrors.push({
      field: "Usrn",
      errors: usrnErrors,
    });

  if (postcodeRefErrors.length > 0)
    validationErrors.push({
      field: "PostcodeRef",
      errors: postcodeRefErrors,
    });

  if (postTownRefErrors.length > 0)
    validationErrors.push({
      field: "PostTownRef",
      errors: postTownRefErrors,
    });

  if (rangeTypeErrors.length > 0)
    validationErrors.push({
      field: "RangeType",
      errors: rangeTypeErrors,
    });

  if (rangeTextErrors.length > 0)
    validationErrors.push({
      field: "RangeText",
      errors: rangeTextErrors,
    });

  if (rangeStartNumberErrors.length > 0)
    validationErrors.push({
      field: "RangeStartNumber",
      errors: rangeStartNumberErrors,
    });

  if (addressListErrors.length > 0)
    validationErrors.push({
      field: "AddressList",
      errors: addressListErrors,
    });

  if (paoDetailsErrors.length > 0)
    validationErrors.push({
      field: "PaoDetails",
      errors: paoDetailsErrors,
    });

  if (paoTextErrors.length > 0)
    validationErrors.push({
      field: "PaoText",
      errors: paoTextErrors,
    });

  if (saoTextErrors.length > 0)
    validationErrors.push({
      field: "SaoText",
      errors: saoTextErrors,
    });

  return validationErrors;
}

/**
 * Validates the property details data
 *
 * @param {object} blpuData - The BLPU data details to be validated.
 * @param {object} lpiData - The LPI data details to be validated.
 * @param {object} otherData - The other data details to be validated.
 * @param {object} currentLookups - The lookup context object.
 * @param {boolean} isScottish - True if the authority is a Scottish authority; otherwise false.
 * @param {number} postTownRef - The post town reference being used.
 * @param {number} postcodeRef - The postcode reference being used.
 * @param {boolean} [haveMoveBlpu=false] - True if this was called when moving BLPU seed point; otherwise false.
 * @return {array}
 */
export function ValidatePropertyDetails(
  blpuData,
  lpiData,
  classificationData,
  otherData,
  currentLookups,
  isScottish,
  postTownRef,
  postcodeRef,
  haveMoveBlpu = false
) {
  const methodName = "ValidatePropertyDetails";
  const blpuErrors = [];
  const lpiErrors = [];
  const classificationErrors = [];
  const otherErrors = [];
  let currentCheck;
  const blpuStatusErrors = [];
  const rpcErrors = [];
  const blpuClassificationErrors = [];
  const stateErrors = [];
  const stateDateErrors = [];
  const blpuStartDateErrors = [];
  const blpuLevelErrors = [];
  const lpiStatusErrors = [];
  const officialFlagErrors = [];
  const postalAddressErrors = [];
  const lpiStartDateErrors = [];
  const lpiLevelErrors = [];
  const classificationSchemeErrors = [];
  const classificationStartDateErrors = [];
  const provenanceCodeErrors = [];
  const provStartDateErrors = [];

  if (!blpuData && !haveMoveBlpu) {
    // Enter a BLPU logical status.
    currentCheck = GetCheck(2100008, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish)) blpuStatusErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Enter a representative point code (RPC).
    currentCheck = GetCheck(2100014, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish)) rpcErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Enter a classification.
    currentCheck = GetCheck(2100016, currentLookups, methodName, isScottish, showDebugMessages);
    if (!isScottish && includeCheck(currentCheck, isScottish))
      blpuClassificationErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Both state and state date must be entered.
    currentCheck = GetCheck(2100024, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish)) {
      stateErrors.push(GetErrorMessage(currentCheck, isScottish));
      stateDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a start date.
    currentCheck = GetCheck(2100027, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish)) blpuStartDateErrors.push(GetErrorMessage(currentCheck, isScottish));
  } else {
    // Enter a BLPU logical status.
    currentCheck = GetCheck(2100008, currentLookups, methodName, isScottish, showDebugMessages);
    if (!haveMoveBlpu && includeCheck(currentCheck, isScottish) && !blpuData.logicalStatus)
      blpuStatusErrors.push(GetErrorMessage(currentCheck, isScottish));

    // BLPU logical status is invalid.
    currentCheck = GetCheck(2100009, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      blpuData.logicalStatus &&
      !BLPULogicalStatus.find((x) => x.id === blpuData.logicalStatus)
    ) {
      blpuStatusErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // State is incompatible with the BLPU logical status.
    currentCheck = GetCheck(2100011, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      !haveMoveBlpu &&
      includeCheck(currentCheck, isScottish) &&
      blpuData.logicalStatus &&
      ((!isScottish &&
        ((blpuData.logicalStatus === 1 && blpuData.state && ![1, 2, 3].includes(blpuData.state)) ||
          (blpuData.logicalStatus === 5 && (!blpuData.state || ![1, 2, 3, 4, 6].includes(blpuData.state))) ||
          (blpuData.logicalStatus === 6 && (!blpuData.state || ![1, 5, 6, 7].includes(blpuData.state))) ||
          (blpuData.logicalStatus === 7 && blpuData.state && ![1, 2, 3, 4, 6].includes(blpuData.state)) ||
          (blpuData.logicalStatus === 8 && blpuData.state && ![4, 7].includes(blpuData.state)) ||
          (blpuData.logicalStatus === 9 && blpuData.state && ![1, 2, 3, 4, 5, 6, 7].includes(blpuData.state)))) ||
        (isScottish &&
          ((blpuData.logicalStatus === 1 &&
            ((!blpuData.state && blpuData.state !== 0) || ![0, 1, 2, 3].includes(blpuData.state))) ||
            (blpuData.logicalStatus === 6 && !blpuData.state && blpuData.state !== 0) ||
            (blpuData.logicalStatus === 8 && ((!blpuData.state && blpuData.state !== 0) || blpuData.state !== 4)) ||
            (blpuData.logicalStatus === 9 &&
              (blpuData.state || blpuData.state === 0) &&
              ![0, 1, 2, 3, 4].includes(blpuData.state)))))
    ) {
      stateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // The state must be between 1 and 7.
    currentCheck = GetCheck(2100012, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      !haveMoveBlpu &&
      includeCheck(currentCheck, isScottish) &&
      blpuData.state &&
      ![1, 2, 3, 4, 5, 6, 7].includes(blpuData.state)
    ) {
      stateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a representative point code (RPC).
    currentCheck = GetCheck(2100014, currentLookups, methodName, isScottish, showDebugMessages);
    if (!haveMoveBlpu && includeCheck(currentCheck, isScottish) && !blpuData.rpc)
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Classification is too long.
    currentCheck = GetCheck(2100015, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      !isScottish &&
      includeCheck(currentCheck, isScottish) &&
      blpuData.classification &&
      blpuData.classification.length > 4
    ) {
      blpuClassificationErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a classification.
    currentCheck = GetCheck(2100016, currentLookups, methodName, isScottish, showDebugMessages);
    if (!isScottish && !haveMoveBlpu && includeCheck(currentCheck, isScottish) && !blpuData.classification)
      blpuClassificationErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Both state and state date must be entered.
    currentCheck = GetCheck(2100024, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      !haveMoveBlpu &&
      includeCheck(currentCheck, isScottish) &&
      (!isScottish || (isScottish && blpuData.logicalStatus < 9)) &&
      (blpuData.state === undefined || blpuData.state === null)
    ) {
      stateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    if (
      !haveMoveBlpu &&
      includeCheck(currentCheck, isScottish) &&
      (!isScottish || (isScottish && blpuData.logicalStatus < 9)) &&
      !blpuData.stateDate
    ) {
      stateDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // State date cannot be in the future.
    currentCheck = GetCheck(2100025, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      !haveMoveBlpu &&
      includeCheck(currentCheck, isScottish) &&
      blpuData.stateDate &&
      isFutureDate(blpuData.stateDate)
    ) {
      stateDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Representative point code (RPC) is invalid.
    currentCheck = GetCheck(2100026, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      !haveMoveBlpu &&
      includeCheck(currentCheck, isScottish) &&
      blpuData.rpc &&
      !RepresentativePointCode.find((x) => x.id === blpuData.rpc)
    ) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a start date.
    currentCheck = GetCheck(2100027, currentLookups, methodName, isScottish, showDebugMessages);
    if (!haveMoveBlpu && includeCheck(currentCheck, isScottish) && !blpuData.startDate)
      blpuStartDateErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Start date cannot be in the future.
    currentCheck = GetCheck(2100028, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      !haveMoveBlpu &&
      includeCheck(currentCheck, isScottish) &&
      blpuData.startDate &&
      isFutureDate(blpuData.startDate)
    ) {
      blpuStartDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Start dates prior to 1753 are not allowed.
    currentCheck = GetCheck(2100029, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      !haveMoveBlpu &&
      includeCheck(currentCheck, isScottish) &&
      blpuData.startDate &&
      isPriorTo1753(blpuData.startDate)
    ) {
      blpuStartDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // An RPC of 3 can no longer be submitted to GeoPlace.
    currentCheck = GetCheck(2100036, currentLookups, methodName, isScottish, showDebugMessages);
    if (!haveMoveBlpu && includeCheck(currentCheck, isScottish) && blpuData.rpc && blpuData.rpc === 3) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // An RPC of 5 can no longer be submitted to GeoPlace.
    currentCheck = GetCheck(2100037, currentLookups, methodName, isScottish, showDebugMessages);
    if (!haveMoveBlpu && includeCheck(currentCheck, isScottish) && blpuData.rpc && blpuData.rpc === 5) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // The BLPU logical status is incompatible with the state.
    currentCheck = GetCheck(2100046, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      blpuData.logicalStatus &&
      ((!isScottish &&
        ((blpuData.logicalStatus === 1 && blpuData.state && ![1, 2, 3].includes(blpuData.state)) ||
          (blpuData.logicalStatus === 5 && (!blpuData.state || ![1, 2, 3, 4, 6].includes(blpuData.state))) ||
          (blpuData.logicalStatus === 6 && (!blpuData.state || ![1, 5, 6, 7].includes(blpuData.state))) ||
          (blpuData.logicalStatus === 7 && blpuData.state && ![1, 2, 3, 4, 6].includes(blpuData.state)) ||
          (blpuData.logicalStatus === 8 && blpuData.state && ![4, 7].includes(blpuData.state)) ||
          (blpuData.logicalStatus === 9 && blpuData.state && ![1, 2, 3, 4, 5, 6, 7].includes(blpuData.state)))) ||
        (isScottish &&
          ((blpuData.logicalStatus === 1 &&
            ((!blpuData.state && blpuData.state !== 0) || ![0, 1, 2, 3].includes(blpuData.state))) ||
            (blpuData.logicalStatus === 6 && !blpuData.state && blpuData.state !== 0) ||
            (blpuData.logicalStatus === 8 && ((!blpuData.state && blpuData.state !== 0) || blpuData.state !== 4)) ||
            (blpuData.logicalStatus === 9 &&
              (blpuData.state || blpuData.state === 0) &&
              ![0, 1, 2, 3, 4].includes(blpuData.state)))))
    ) {
      blpuStatusErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // State is invalid.
    currentCheck = GetCheck(2100048, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      !haveMoveBlpu &&
      includeCheck(currentCheck, isScottish) &&
      blpuData.state &&
      !BLPUState.find((x) => x.id === blpuData.state)
    ) {
      stateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Classification does not exist in the lookup table.
    currentCheck = GetCheck(2100055, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      !isScottish &&
      includeCheck(currentCheck, isScottish) &&
      blpuData.classification &&
      !BLPUClassification.find((x) => x.id === blpuData.classification)
    ) {
      blpuClassificationErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // An approved BLPU more than a year old, can't have a classification of Unclassified.
    currentCheck = GetCheck(2100061, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      !isScottish &&
      !haveMoveBlpu &&
      includeCheck(currentCheck, isScottish) &&
      blpuData.logicalStatus &&
      blpuData.logicalStatus === 1 &&
      blpuData.classification &&
      blpuData.classification === "U" &&
      blpuData.startDate &&
      isOlderThanYear(blpuData.startDate)
    ) {
      blpuClassificationErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // An RPC of 9 can no longer be submitted to GeoPlace.
    currentCheck = GetCheck(2100062, currentLookups, methodName, isScottish, showDebugMessages);
    if (!haveMoveBlpu && includeCheck(currentCheck, isScottish) && blpuData.rpc && blpuData.rpc === 9) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Level is invalid.
    currentCheck = GetCheck(2100063, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      isScottish &&
      includeCheck(currentCheck, isScottish) &&
      blpuData.level &&
      (blpuData.level < 0.0 || blpuData.level > 99.9)
    ) {
      blpuLevelErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a level.
    currentCheck = GetCheck(2100068, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !blpuData.level && blpuData.level !== 0) {
      blpuLevelErrors.push(GetErrorMessage(currentCheck, isScottish));
    }
  }

  if (!haveMoveBlpu) {
    if (!lpiData) {
      // Enter a start date.
      currentCheck = GetCheck(2400007, currentLookups, methodName, isScottish, showDebugMessages);
      if (includeCheck(currentCheck, isScottish)) lpiStartDateErrors.push(GetErrorMessage(currentCheck, isScottish));

      // Enter a postal address flag.
      currentCheck = GetCheck(2400022, currentLookups, methodName, isScottish, showDebugMessages);
      if (!isScottish && includeCheck(currentCheck, isScottish))
        postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));

      // Enter an LPI Logical status.
      currentCheck = GetCheck(2400064, currentLookups, methodName, isScottish, showDebugMessages);
      if (includeCheck(currentCheck, isScottish)) lpiStatusErrors.push(GetErrorMessage(currentCheck, isScottish));

      // Enter a official address flag.
      currentCheck = GetCheck(2400087, currentLookups, methodName, isScottish, showDebugMessages);
      if (includeCheck(currentCheck, isScottish)) officialFlagErrors.push(GetErrorMessage(currentCheck, isScottish));
    } else {
      // Enter a start date.
      currentCheck = GetCheck(2400007, currentLookups, methodName, isScottish, showDebugMessages);
      if (includeCheck(currentCheck, isScottish) && !lpiData.startDate) {
        lpiStartDateErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      // Start date cannot be in the future.
      currentCheck = GetCheck(2400008, currentLookups, methodName, isScottish, showDebugMessages);
      if (includeCheck(currentCheck, isScottish) && lpiData.startDate && isFutureDate(lpiData.startDate)) {
        lpiStartDateErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      // Enter a postal address flag.
      currentCheck = GetCheck(2400022, currentLookups, methodName, isScottish, showDebugMessages);
      if (!isScottish && includeCheck(currentCheck, isScottish) && !lpiData.postallyAddressable) {
        postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      // Postal address is too long.
      currentCheck = GetCheck(2400023, currentLookups, methodName, isScottish, showDebugMessages);
      if (
        !isScottish &&
        includeCheck(currentCheck, isScottish) &&
        lpiData.postallyAddressable &&
        lpiData.postallyAddressable.length > 1
      ) {
        postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      // Postal address is invalid.
      currentCheck = GetCheck(2400024, currentLookups, methodName, isScottish, showDebugMessages);
      if (
        !isScottish &&
        includeCheck(currentCheck, isScottish) &&
        lpiData.postallyAddressable &&
        !PostallyAddressable.find((x) => x.id === lpiData.postallyAddressable)
      ) {
        postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      // Official address is too long.
      currentCheck = GetCheck(2400025, currentLookups, methodName, isScottish, showDebugMessages);
      if (includeCheck(currentCheck, isScottish) && lpiData.officialAddress && lpiData.officialAddress.length > 1) {
        officialFlagErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      // Official address is invalid.
      currentCheck = GetCheck(2400026, currentLookups, methodName, isScottish, showDebugMessages);
      if (
        includeCheck(currentCheck, isScottish) &&
        lpiData.officialAddress &&
        !OfficialAddress.find((x) => x.id === lpiData.officialAddress)
      ) {
        officialFlagErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      // Start dates prior to 1753 are not allowed.
      currentCheck = GetCheck(2400030, currentLookups, methodName, isScottish, showDebugMessages);
      if (includeCheck(currentCheck, isScottish) && lpiData.startDate && isPriorTo1753(lpiData.startDate)) {
        lpiStartDateErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      // Postal address of 'N' must not have a postcode or post town.
      currentCheck = GetCheck(2400060, currentLookups, methodName, isScottish, showDebugMessages);
      if (
        includeCheck(currentCheck, isScottish) &&
        lpiData.logicalStatus &&
        lpiData.logicalStatus !== 6 &&
        lpiData.postallyAddressable &&
        lpiData.postallyAddressable === "N" &&
        (postTownRef || postcodeRef)
      ) {
        postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      // Postal address of 'Y', 'A' or 'L' must have a postcode and post town.
      currentCheck = GetCheck(2400061, currentLookups, methodName, isScottish, showDebugMessages);
      if (
        includeCheck(currentCheck, isScottish) &&
        lpiData.postallyAddressable &&
        ((isScottish && ["Y", "L"].includes(lpiData.postallyAddressable)) ||
          (!isScottish && ["Y", "A", "L"].includes(lpiData.postallyAddressable))) &&
        (!postTownRef || !postcodeRef)
      ) {
        postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      // Postal address of 'P' must have a postcode and a post town.
      currentCheck = GetCheck(2400062, currentLookups, methodName, isScottish, showDebugMessages);
      if (
        !isScottish &&
        includeCheck(currentCheck, isScottish) &&
        lpiData.postallyAddressable &&
        lpiData.postallyAddressable === "P" &&
        (!postTownRef || !postcodeRef)
      ) {
        postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      // Enter an LPI Logical status.
      currentCheck = GetCheck(2400064, currentLookups, methodName, isScottish, showDebugMessages);
      if (includeCheck(currentCheck, isScottish) && !lpiData.logicalStatus) {
        lpiStatusErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      // LPI logical status is invalid.
      currentCheck = GetCheck(2400069, currentLookups, methodName, isScottish, showDebugMessages);
      if (
        includeCheck(currentCheck, isScottish) &&
        lpiData.logicalStatus &&
        !LPILogicalStatus.find((x) => x.id === lpiData.logicalStatus)
      ) {
        lpiStatusErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      // Level is too long.
      currentCheck = GetCheck(2400085, currentLookups, methodName, isScottish, showDebugMessages);
      if (!isScottish && includeCheck(currentCheck, isScottish) && lpiData.level && lpiData.level.length > 30) {
        lpiLevelErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      // Enter a official address flag.
      currentCheck = GetCheck(2400087, currentLookups, methodName, isScottish, showDebugMessages);
      if (isScottish) {
        if (includeCheck(currentCheck, isScottish) && !lpiData.officialAddress) {
          officialFlagErrors.push(GetErrorMessage(currentCheck, isScottish));
        }
      } else {
        if (includeCheck(currentCheck, isScottish) && !lpiData.officialFlag) {
          officialFlagErrors.push(GetErrorMessage(currentCheck, isScottish));
        }
      }

      // Enter a postal address flag.
      currentCheck = GetCheck(2400088, currentLookups, methodName, isScottish, showDebugMessages);
      if (isScottish && includeCheck(currentCheck, isScottish) && !lpiData.postallyAddressable) {
        postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      // Postal address is too long.
      currentCheck = GetCheck(2400089, currentLookups, methodName, isScottish, showDebugMessages);
      if (
        isScottish &&
        includeCheck(currentCheck, isScottish) &&
        lpiData.postallyAddressable &&
        lpiData.postallyAddressable.length > 1
      ) {
        postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      // Postal address is invalid.
      currentCheck = GetCheck(2400090, currentLookups, methodName, isScottish, showDebugMessages);
      if (
        isScottish &&
        includeCheck(currentCheck, isScottish) &&
        lpiData.postallyAddressable &&
        !["Y", "L", "N"].includes(lpiData.postallyAddressable)
      ) {
        postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
      }
    }

    if (blpuData && lpiData) {
      // BLPU logical status is incompatible with LPI logical status.
      currentCheck = GetCheck(2100035, currentLookups, methodName, isScottish, showDebugMessages);
      if (includeCheck(currentCheck, isScottish) && blpuData.logicalStatus !== lpiData.logicalStatus)
        blpuStatusErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    if (blpuData && !lpiData) {
      // A BLPU must have an LPI record.
      currentCheck = GetCheck(2100049, currentLookups, methodName, isScottish, showDebugMessages);
      if (includeCheck(currentCheck, isScottish)) blpuStatusErrors.push(GetErrorMessage(currentCheck, isScottish));
    }
  }

  if (isScottish && !haveMoveBlpu) {
    if (!classificationData) {
      // Enter a classification code.
      currentCheck = GetCheck(3200008, currentLookups, methodName, isScottish, showDebugMessages);
      if (includeCheck(currentCheck, isScottish))
        blpuClassificationErrors.push(GetErrorMessage(currentCheck, isScottish));
    } else {
      // Enter a classification code.
      currentCheck = GetCheck(3200008, currentLookups, methodName, isScottish, showDebugMessages);
      if (!haveMoveBlpu && includeCheck(currentCheck, isScottish) && !classificationData.classification) {
        blpuClassificationErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      // Start date cannot be in the future.
      currentCheck = GetCheck(3200009, currentLookups, methodName, true, showDebugMessages);
      if (
        includeCheck(currentCheck, true) &&
        classificationData.startDate &&
        isFutureDate(classificationData.startDate)
      ) {
        classificationStartDateErrors.push(GetErrorMessage(currentCheck, true));
      }

      // Scheme is too long.
      currentCheck = GetCheck(3200015, currentLookups, methodName, true, showDebugMessages);
      if (
        includeCheck(currentCheck, true) &&
        classificationData.classificationScheme &&
        classificationData.classificationScheme.length > 40
      ) {
        classificationSchemeErrors.push(GetErrorMessage(currentCheck, true));
      }

      // Enter a scheme.
      currentCheck = GetCheck(3200017, currentLookups, methodName, true, showDebugMessages);
      if (includeCheck(currentCheck, true) && !classificationData.classificationScheme) {
        classificationSchemeErrors.push(GetErrorMessage(currentCheck, true));
      }

      // Enter a start date.
      currentCheck = GetCheck(3200018, currentLookups, methodName, true, showDebugMessages);
      if (includeCheck(currentCheck, true) && !classificationData.startDate) {
        classificationStartDateErrors.push(GetErrorMessage(currentCheck, true));
      }

      // Commercial tertiary classification required for BLPU.
      currentCheck = GetCheck(3200022, currentLookups, methodName, true, showDebugMessages);
      if (
        includeCheck(currentCheck, true) &&
        classificationData.classification &&
        classificationData.classification[0] === "C" &&
        classificationData.classification.length < 3
      ) {
        blpuClassificationErrors.push(GetErrorMessage(currentCheck, true));
      }

      // Residential tertiary classification required for BLPU.
      currentCheck = GetCheck(3200023, currentLookups, methodName, true, showDebugMessages);
      if (
        includeCheck(currentCheck, true) &&
        classificationData.classification &&
        classificationData.classification[0] === "R" &&
        classificationData.classification.length < 3
      ) {
        blpuClassificationErrors.push(GetErrorMessage(currentCheck, true));
      }
    }
  }

  if (otherData && !haveMoveBlpu) {
    // Provenance code is invalid.
    currentCheck = GetCheck(2200010, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      otherData.provCode &&
      !BLPUProvenance.find((x) => x.id === otherData.provCode)
    ) {
      provenanceCodeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a start date.
    currentCheck = GetCheck(2200011, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && otherData.provCode && !otherData.provStartDate) {
      provStartDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Start date cannot be in the future.
    currentCheck = GetCheck(2200012, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && otherData.provStartDate && isFutureDate(otherData.provStartDate)) {
      provStartDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }
  }

  if (blpuStatusErrors.length > 0)
    blpuErrors.push({
      field: "BlpuStatus",
      errors: blpuStatusErrors,
    });

  if (rpcErrors.length > 0)
    blpuErrors.push({
      field: "Rpc",
      errors: rpcErrors,
    });

  if (stateErrors.length > 0)
    blpuErrors.push({
      field: "State",
      errors: stateErrors,
    });

  if (stateDateErrors.length > 0)
    blpuErrors.push({
      field: "StateDate",
      errors: stateDateErrors,
    });

  if (blpuClassificationErrors.length > 0) {
    if (isScottish)
      classificationErrors.push({
        field: "Classification",
        errors: blpuClassificationErrors,
      });
    else
      blpuErrors.push({
        field: "Classification",
        errors: blpuClassificationErrors,
      });
  }

  if (blpuStartDateErrors.length > 0)
    blpuErrors.push({
      field: "BlpuStartDate",
      errors: blpuStartDateErrors,
    });

  if (blpuLevelErrors.length > 0)
    blpuErrors.push({
      field: "BlpuLevel",
      errors: blpuLevelErrors,
    });

  if (lpiStatusErrors.length > 0)
    lpiErrors.push({
      field: "LpiStatus",
      errors: lpiStatusErrors,
    });

  if (officialFlagErrors.length > 0)
    lpiErrors.push({
      field: "OfficialAddress",
      errors: officialFlagErrors,
    });

  if (postalAddressErrors.length > 0)
    lpiErrors.push({
      field: "PostalAddress",
      errors: postalAddressErrors,
    });

  if (lpiStartDateErrors.length > 0)
    lpiErrors.push({
      field: "LpiStartDate",
      errors: lpiStartDateErrors,
    });

  if (lpiLevelErrors.length > 0)
    lpiErrors.push({
      field: "LpiLevel",
      errors: lpiLevelErrors,
    });

  if (classificationSchemeErrors.length > 0)
    classificationErrors.push({
      field: "ClassificationScheme",
      errors: classificationSchemeErrors,
    });

  if (classificationStartDateErrors.length > 0)
    classificationErrors.push({
      field: "ClassificationStartDate",
      errors: classificationStartDateErrors,
    });

  if (provenanceCodeErrors.length > 0)
    otherErrors.push({
      field: "Provenance",
      errors: provenanceCodeErrors,
    });

  if (provStartDateErrors.length > 0)
    otherErrors.push({
      field: "ProvenanceStartDate",
      errors: provStartDateErrors,
    });

  return { blpu: blpuErrors, lpi: lpiErrors, classification: classificationErrors, other: otherErrors };
}

/**
 * Validates the cross reference data
 *
 * @param {object} data - The cross reference record data that needs to be validated
 * @param {object} currentLookups - The lookup context object.
 * @param {boolean} isScottish - True if the authority is a Scottish authority; otherwise false.
 * @return {array}
 */
export function ValidateCrossReference(data, currentLookups, isScottish) {
  const methodName = "ValidateCrossReference";
  const validationErrors = [];
  let currentCheck;
  let startDateErrors = [];
  let crossReferenceErrors = [];
  let sourceIdErrors = [];

  if (!data) {
    // Enter a start date.
    currentCheck = GetCheck(2300006, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish)) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a cross reference.
    currentCheck = GetCheck(2300014, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish)) {
      crossReferenceErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Source is missing, historic or disabled.
    currentCheck = GetCheck(2300016, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish)) {
      sourceIdErrors.push(GetErrorMessage(currentCheck, isScottish));
    }
  } else {
    // Enter a start date.
    currentCheck = GetCheck(2300006, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.startDate) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Start date cannot be in the future.
    currentCheck = GetCheck(2300010, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.startDate && isFutureDate(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a cross reference.
    currentCheck = GetCheck(2300014, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.crossReference) {
      crossReferenceErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Cross reference is too long.
    currentCheck = GetCheck(2300015, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.crossReference && data.crossReference.length > 50) {
      crossReferenceErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Source is missing, historic or disabled.
    currentCheck = GetCheck(2300016, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.sourceId) {
      sourceIdErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Source does not exist in the lookup table or is marked as historic/disabled.
    currentCheck = GetCheck(2300025, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.sourceId &&
      !currentLookups.appCrossRefs.find((x) => x.pkId === data.sourceId)
    ) {
      sourceIdErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Start dates prior to 1753 are not allowed.
    currentCheck = GetCheck(2300033, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.startDate && isPriorTo1753(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }
  }

  if (showDebugMessages) console.log("[DEBUG] ValidateCrossRefData - Finished checks");

  if (startDateErrors.length > 0)
    validationErrors.push({
      index: data.id,
      field: "StartDate",
      errors: startDateErrors,
    });

  if (crossReferenceErrors.length > 0)
    validationErrors.push({
      index: data.id,
      field: "CrossReference",
      errors: crossReferenceErrors,
    });

  if (sourceIdErrors.length > 0)
    validationErrors.push({
      index: data.id,
      field: "SourceId",
      errors: sourceIdErrors,
    });

  return validationErrors;
}
