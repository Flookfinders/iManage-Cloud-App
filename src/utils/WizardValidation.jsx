//#region header
//--------------------------------------------------------------------------------------------------
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
//    031   02.09.24 Sean Flook       IMANN-976 Handle "Unassigned" in lookups.
//#endregion Version 1.0.0.0 changes
//#region Version 1.0.2.0 changes
//    032   31.10.24 Sean Flook       IMANN-1012 Changed to use new checks to prevent duplicating check code.
//    033   21.11.24 Sean Flook       IMANN-1054 Pass through the currentLookups to failsCheck2300025.
//    034   21.11.24 Sean Flook       IMANN-1064 Correctly get the post town and postcode data for check 2400060.
//    035   21.11.24 Sean Flook       IMANN-1074 Call the correct method for check 2400108.
//    036   22.11.24 Sean Flook       IMANN-1065 When moving a BLPU there is no need to check the level as we do not have that data.
//    037   25.11.24 Sean Flook       IMANN-1076 Added check for a valid date in date fields.
//#endregion Version 1.0.2.0 changes
//
//--------------------------------------------------------------------------------------------------
//#endregion header

import { includeCheck, GetErrorMessage, GetCheck } from "./HelperUtils";

import { failsCheck1000020 } from "./Type10ValidationChecks";
import { failsCheck1100007 } from "./Type11ValidationChecks";
import {
  failsCheck2100008,
  failsCheck2100009,
  failsCheck2100011,
  failsCheck2100012,
  failsCheck2100013,
  failsCheck2100014,
  failsCheck2100015,
  failsCheck2100016,
  failsCheck2100024,
  failsCheck2100025,
  failsCheck2100026,
  failsCheck2100027,
  failsCheck2100028,
  failsCheck2100029,
  failsCheck2100035,
  failsCheck2100036,
  failsCheck2100037,
  failsCheck2100046,
  failsCheck2100048,
  failsCheck2100055,
  failsCheck2100061,
  failsCheck2100062,
  failsCheck2100063,
  failsCheck2100068,
} from "./Type21ValidationChecks";
import { failsCheck2200010, failsCheck2200011, failsCheck2200012 } from "./Type22ValidationChecks";
import {
  failsCheck2300006,
  failsCheck2300010,
  failsCheck2300014,
  failsCheck2300015,
  failsCheck2300016,
  failsCheck2300025,
  failsCheck2300033,
} from "./Type23ValidationChecks";
import {
  failsCheck2400007,
  failsCheck2400008,
  failsCheck2400018,
  failsCheck2400022,
  failsCheck2400023,
  failsCheck2400024,
  failsCheck2400025,
  failsCheck2400026,
  failsCheck2400028,
  failsCheck2400029,
  failsCheck2400030,
  failsCheck2400034,
  failsCheck2400035,
  failsCheck2400036,
  failsCheck2400037,
  failsCheck2400038,
  failsCheck2400039,
  failsCheck2400040,
  failsCheck2400049,
  failsCheck2400055,
  failsCheck2400060,
  failsCheck2400061,
  failsCheck2400062,
  failsCheck2400064,
  failsCheck2400069,
  failsCheck2400072,
  failsCheck2400073,
  failsCheck2400074,
  failsCheck2400075,
  failsCheck2400076,
  failsCheck2400077,
  failsCheck2400078,
  failsCheck2400083,
  failsCheck2400085,
  failsCheck2400087,
  failsCheck2400088,
  failsCheck2400089,
  failsCheck2400090,
  failsCheck2400095,
  failsCheck2400096,
  failsCheck2400108,
} from "./Type24ValidationChecks";
import {
  failsCheck3200008,
  failsCheck3200009,
  failsCheck3200015,
  failsCheck3200017,
  failsCheck3200018,
  failsCheck3200022,
  failsCheck3200023,
} from "./Type32ValidationChecks";
import {
  failsCheck8800001,
  failsCheck8800002,
  failsCheck8800003,
  failsCheck8800004,
  failsCheck8800005,
  failsCheck8800006,
  failsCheck8800007,
  failsCheck8800008,
  failsCheck8800009,
  failsCheck8800010,
  failsCheck8800011,
  failsCheck8800012,
  failsCheck8800013,
  failsCheck8800014,
  failsCheck8800015,
} from "./Type88ValidationChecks";

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
            if (includeCheck(currentCheck, isScottish) && failsCheck2400035(data.paoText))
              paoTextErrors.push(GetErrorMessage(currentCheck, isScottish));

            // PAO start number is invalid.
            currentCheck = GetCheck(2400037, currentLookups, methodName, isScottish, showDebugMessages);
            if (includeCheck(currentCheck, isScottish) && failsCheck2400037(data.paoStartNumber))
              paoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));

            // PAO end number is invalid.
            currentCheck = GetCheck(2400038, currentLookups, methodName, isScottish, showDebugMessages);
            if (includeCheck(currentCheck, isScottish) && failsCheck2400038(data.paoEndNumber))
              paoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));

            // PAO end number populated but PAO start number is blank.
            currentCheck = GetCheck(2400039, currentLookups, methodName, isScottish, showDebugMessages);
            if (includeCheck(currentCheck, isScottish) && failsCheck2400039(data.paoStartNumber, data.paoEndNumber))
              paoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));

            // Enter PAO details.
            currentCheck = GetCheck(2400040, currentLookups, methodName, isScottish, showDebugMessages);
            if (includeCheck(currentCheck, isScottish) && failsCheck2400040(data.paoStartNumber, data.paoText)) {
              paoTextErrors.push(GetErrorMessage(currentCheck, isScottish));
            }

            // PAO start suffix supplied but no PAO start number.
            currentCheck = GetCheck(2400073, currentLookups, methodName, isScottish, showDebugMessages);
            if (includeCheck(currentCheck, isScottish) && failsCheck2400073(data.paoStartSuffix, data.paoStartNumber)) {
              paoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
            }

            // PAO end suffix supplied but no PAO end number.
            currentCheck = GetCheck(2400074, currentLookups, methodName, isScottish, showDebugMessages);
            if (includeCheck(currentCheck, isScottish) && failsCheck2400074(data.paoEndSuffix, data.paoEndNumber)) {
              paoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
            }

            // PAO end number must be greater than PAO start number.
            currentCheck = GetCheck(2400078, currentLookups, methodName, isScottish, showDebugMessages);
            if (includeCheck(currentCheck, isScottish) && failsCheck2400078(data.paoStartNumber, data.paoEndNumber))
              paoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));

            // PAO text must not contain only a number, use PAO start number for the number.
            currentCheck = GetCheck(2400095, currentLookups, methodName, isScottish, showDebugMessages);
            if (isScottish && includeCheck(currentCheck, isScottish) && failsCheck2400095(data.paoText)) {
              paoTextErrors.push(GetErrorMessage(currentCheck, isScottish));
            }
            break;

          case 3: // Single child
            // SAO end number populated but SAO start number is blank.
            currentCheck = GetCheck(2400034, currentLookups, methodName, isScottish, showDebugMessages);
            if (includeCheck(currentCheck, isScottish) && failsCheck2400034(data.saoStartNumber, data.saoEndNumber))
              saoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));

            // SAO text is too long.
            currentCheck = GetCheck(2400036, currentLookups, methodName, isScottish, showDebugMessages);
            if (includeCheck(currentCheck, isScottish) && failsCheck2400036(data.saoText))
              saoTextErrors.push(GetErrorMessage(currentCheck, isScottish));

            // Enter SAO details.
            currentCheck = GetCheck(2400072, currentLookups, methodName, isScottish, showDebugMessages);
            if (includeCheck(currentCheck, isScottish) && failsCheck2400072(data.saoStartNumber, data.saoText))
              saoTextErrors.push(GetErrorMessage(currentCheck, isScottish));

            // SAO start suffix supplied but no SAO start number.
            currentCheck = GetCheck(2400075, currentLookups, methodName, isScottish, showDebugMessages);
            if (includeCheck(currentCheck, isScottish) && failsCheck2400075(data.saoStartSuffix, data.saoStartNumber)) {
              saoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
            }

            // SAO end suffix supplied but no SAO end number.
            currentCheck = GetCheck(2400076, currentLookups, methodName, isScottish, showDebugMessages);
            if (includeCheck(currentCheck, isScottish) && failsCheck2400076(data.saoEndSuffix, data.saoEndNumber)) {
              saoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
            }

            // SAO end number must be greater than SAO start number.
            currentCheck = GetCheck(2400077, currentLookups, methodName, isScottish, showDebugMessages);
            if (includeCheck(currentCheck, isScottish) && failsCheck2400077(data.saoStartNumber, data.saoEndNumber))
              saoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));

            // PAO text is too long.
            currentCheck = GetCheck(2400035, currentLookups, methodName, isScottish, showDebugMessages);
            if (includeCheck(currentCheck, isScottish) && failsCheck2400035(data.paoText))
              paoDetailsErrors.push(GetErrorMessage(currentCheck, isScottish));

            // PAO start number is invalid.
            currentCheck = GetCheck(2400037, currentLookups, methodName, isScottish, showDebugMessages);
            if (includeCheck(currentCheck, isScottish) && failsCheck2400037(data.paoStartNumber))
              paoDetailsErrors.push(GetErrorMessage(currentCheck, isScottish));

            // PAO end number is invalid.
            currentCheck = GetCheck(2400038, currentLookups, methodName, isScottish, showDebugMessages);
            if (includeCheck(currentCheck, isScottish) && failsCheck2400038(data.paoEndNumber))
              paoDetailsErrors.push(GetErrorMessage(currentCheck, isScottish));

            // PAO end number populated but PAO start number is blank.
            currentCheck = GetCheck(2400039, currentLookups, methodName, isScottish, showDebugMessages);
            if (includeCheck(currentCheck, isScottish) && failsCheck2400039(data.paoStartNumber, data.paoEndNumber))
              paoDetailsErrors.push(GetErrorMessage(currentCheck, isScottish));

            // Enter PAO details.
            currentCheck = GetCheck(2400040, currentLookups, methodName, isScottish, showDebugMessages);
            if (includeCheck(currentCheck, isScottish) && failsCheck2400040(data.paoStartNumber, data.paoText)) {
              paoDetailsErrors.push(GetErrorMessage(currentCheck, isScottish));
            }

            // PAO start suffix supplied but no PAO start number.
            currentCheck = GetCheck(2400073, currentLookups, methodName, isScottish, showDebugMessages);
            if (includeCheck(currentCheck, isScottish) && failsCheck2400073(data.paoStartSuffix, data.paoStartNumber)) {
              paoDetailsErrors.push(GetErrorMessage(currentCheck, isScottish));
            }

            // PAO end suffix supplied but no PAO end number.
            currentCheck = GetCheck(2400074, currentLookups, methodName, isScottish, showDebugMessages);
            if (includeCheck(currentCheck, isScottish) && failsCheck2400074(data.paoEndSuffix, data.paoEndNumber)) {
              paoDetailsErrors.push(GetErrorMessage(currentCheck, isScottish));
            }

            // PAO end number must be greater than PAO start number.
            currentCheck = GetCheck(2400078, currentLookups, methodName, isScottish, showDebugMessages);
            if (includeCheck(currentCheck, isScottish) && failsCheck2400078(data.paoStartNumber, data.paoEndNumber))
              paoDetailsErrors.push(GetErrorMessage(currentCheck, isScottish));

            // PAO text must not contain only a number, use PAO start number for the number.
            currentCheck = GetCheck(2400095, currentLookups, methodName, isScottish, showDebugMessages);
            if (isScottish && includeCheck(currentCheck, isScottish) && failsCheck2400095(data.paoText)) {
              paoDetailsErrors.push(GetErrorMessage(currentCheck, isScottish));
            }

            // SAO text must not contain only a number, use SAO start number for the number.
            currentCheck = GetCheck(2400096, currentLookups, methodName, isScottish, showDebugMessages);
            if (isScottish && includeCheck(currentCheck, isScottish) && failsCheck2400096(data.saoText)) {
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
        if (includeCheck(currentCheck, isScottish) && failsCheck8800001(data.rangeType))
          rangeTypeErrors.push(GetErrorMessage(currentCheck, isScottish));

        // Creating a range of properties using the PAO text needs some text.
        currentCheck = GetCheck(8800004, currentLookups, methodName, isScottish, showDebugMessages);
        if (
          includeCheck(currentCheck, isScottish) &&
          failsCheck8800004(
            data.rangeType,
            templateUseType,
            data.rangeText,
            data.rangeStartPrefix,
            data.rangeStartNumber,
            data.rangeSuffix
          )
        )
          rangeTextErrors.push(GetErrorMessage(currentCheck, isScottish));

        // Creating a range of children using the SAO text needs some text.
        currentCheck = GetCheck(8800005, currentLookups, methodName, isScottish, showDebugMessages);
        if (
          includeCheck(currentCheck, isScottish) &&
          failsCheck8800005(
            data.rangeType,
            templateUseType,
            data.rangeText,
            data.rangeStartPrefix,
            data.rangeStartNumber,
            data.rangeSuffix
          )
        )
          rangeTextErrors.push(GetErrorMessage(currentCheck, isScottish));

        // Some details are required to create a range of properties.
        currentCheck = GetCheck(8800002, currentLookups, methodName, isScottish, showDebugMessages);
        if (
          includeCheck(currentCheck, isScottish) &&
          failsCheck8800002(
            templateUseType,
            data.rangeType,
            data.rangeStartNumber,
            data.rangeStartPrefix,
            data.rangeSuffix
          )
        )
          rangeStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));

        // Some details are required to create a range of children.
        currentCheck = GetCheck(8800003, currentLookups, methodName, isScottish, showDebugMessages);
        if (
          includeCheck(currentCheck, isScottish) &&
          failsCheck8800003(
            templateUseType,
            data.rangeType,
            data.rangeStartNumber,
            data.rangeStartPrefix,
            data.rangeSuffix
          )
        )
          rangeStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));

        // The end prefix has a value, but the start prefix is blank.
        currentCheck = GetCheck(8800006, currentLookups, methodName, isScottish, showDebugMessages);
        if (
          includeCheck(currentCheck, isScottish) &&
          failsCheck8800006(data.rangeType, data.rangeStartPrefix, data.rangeEndPrefix)
        )
          rangeStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));

        // The end number has a value, but the start number is blank.
        currentCheck = GetCheck(8800007, currentLookups, methodName, isScottish, showDebugMessages);
        if (includeCheck(currentCheck, isScottish) && failsCheck8800007(data.rangeStartNumber, data.rangeEndNumber))
          rangeStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));

        // The end suffix has a value, but the start suffix is blank.
        currentCheck = GetCheck(8800008, currentLookups, methodName, isScottish, showDebugMessages);
        if (includeCheck(currentCheck, isScottish) && failsCheck8800008(data.rangeStartSuffix, data.rangeEndSuffix))
          rangeStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));

        // The end prefix should either be the same as or alphabetically after the start prefix.
        currentCheck = GetCheck(8800009, currentLookups, methodName, isScottish, showDebugMessages);
        if (
          includeCheck(currentCheck, isScottish) &&
          failsCheck8800009(data.rangeType, data.rangeStartPrefix, data.rangeEndPrefix)
        )
          rangeStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));

        // The end number should either be the same or higher than the start number.
        currentCheck = GetCheck(8800011, currentLookups, methodName, isScottish, showDebugMessages);
        if (includeCheck(currentCheck, isScottish) && failsCheck8800011(data.rangeStartNumber, data.rangeEndNumber))
          rangeStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));

        // The end suffix should either be the same as or alphabetically after the start suffix.
        currentCheck = GetCheck(8800010, currentLookups, methodName, isScottish, showDebugMessages);
        if (includeCheck(currentCheck, isScottish) && failsCheck8800010(data.rangeStartSuffix, data.rangeEndSuffix))
          rangeStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));

        // The start and end details cannot be the same.
        currentCheck = GetCheck(8800012, currentLookups, methodName, isScottish, showDebugMessages);
        if (
          includeCheck(currentCheck, isScottish) &&
          failsCheck8800012(
            data.rangeStartPrefix,
            data.rangeEndPrefix,
            data.rangeStartNumber,
            data.rangeEndNumber,
            data.rangeStartSuffix,
            data.rangeEndSuffix
          )
        )
          rangeStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));

        // The generated PAO text will be too long, reduce the length of the text.
        currentCheck = GetCheck(8800013, currentLookups, methodName, isScottish, showDebugMessages);
        if (
          includeCheck(currentCheck, isScottish) &&
          failsCheck8800013(
            data.rangeType,
            templateUseType,
            data.rangeText,
            data.rangeEndPrefix,
            data.rangeStartPrefix,
            data.rangeEndNumber,
            data.rangeStartNumber,
            data.rangeEndSuffix,
            data.rangeStartSuffix
          )
        )
          rangeTextErrors.push(GetErrorMessage(currentCheck, isScottish));

        // The generated SAO text will be too long, reduce the length of the text.
        currentCheck = GetCheck(8800014, currentLookups, methodName, isScottish, showDebugMessages);
        if (
          includeCheck(currentCheck, isScottish) &&
          failsCheck8800014(
            data.rangeType,
            templateUseType,
            data.rangeText,
            data.rangeEndPrefix,
            data.rangeStartPrefix,
            data.rangeEndNumber,
            data.rangeStartNumber,
            data.rangeEndSuffix,
            data.rangeStartSuffix
          )
        )
          rangeTextErrors.push(GetErrorMessage(currentCheck, isScottish));

        // At least 1 property needs to be included.
        currentCheck = GetCheck(8800015, currentLookups, methodName, isScottish, showDebugMessages);
        if (includeCheck(currentCheck, isScottish) && failsCheck8800015(data.addressList))
          addressListErrors.push(GetErrorMessage(currentCheck, isScottish));

        if (templateUseType === 4) {
          // Range of children
          // PAO text is too long.
          currentCheck = GetCheck(2400035, currentLookups, methodName, isScottish, showDebugMessages);
          if (includeCheck(currentCheck, isScottish) && failsCheck2400035(data.paoText))
            paoDetailsErrors.push(GetErrorMessage(currentCheck, isScottish));

          // PAO start number is invalid.
          currentCheck = GetCheck(2400037, currentLookups, methodName, isScottish, showDebugMessages);
          if (includeCheck(currentCheck, isScottish) && failsCheck2400037(data.paoStartNumber))
            paoDetailsErrors.push(GetErrorMessage(currentCheck, isScottish));

          // PAO end number is invalid.
          currentCheck = GetCheck(2400038, currentLookups, methodName, isScottish, showDebugMessages);
          if (includeCheck(currentCheck, isScottish) && failsCheck2400038(data.paoEndNumber))
            paoDetailsErrors.push(GetErrorMessage(currentCheck, isScottish));

          // PAO end number populated but PAO start number is blank.
          currentCheck = GetCheck(2400039, currentLookups, methodName, isScottish, showDebugMessages);
          if (includeCheck(currentCheck, isScottish) && failsCheck2400039(data.paoStartNumber, data.paoEndNumber))
            paoDetailsErrors.push(GetErrorMessage(currentCheck, isScottish));

          // Enter PAO details.
          currentCheck = GetCheck(2400040, currentLookups, methodName, isScottish, showDebugMessages);
          if (includeCheck(currentCheck, isScottish) && failsCheck2400040(data.paoStartNumber, data.paoText)) {
            paoDetailsErrors.push(GetErrorMessage(currentCheck, isScottish));
          }

          // Pao start suffix supplied but no PAO start number.
          currentCheck = GetCheck(2400073, currentLookups, methodName, isScottish, showDebugMessages);
          if (includeCheck(currentCheck, isScottish) && failsCheck2400073(data.paoStartSuffix, data.paoStartNumber)) {
            paoDetailsErrors.push(GetErrorMessage(currentCheck, isScottish));
          }

          // PAO end suffix supplied but no PAO end number.
          currentCheck = GetCheck(2400074, currentLookups, methodName, isScottish, showDebugMessages);
          if (includeCheck(currentCheck, isScottish) && failsCheck2400074(data.paoEndSuffix, data.paoEndNumber)) {
            paoDetailsErrors.push(GetErrorMessage(currentCheck, isScottish));
          }

          // PAO end number must be greater than PAO start number.
          currentCheck = GetCheck(2400078, currentLookups, methodName, isScottish, showDebugMessages);
          if (includeCheck(currentCheck, isScottish) && failsCheck2400078(data.paoStartNumber, data.paoEndNumber))
            paoDetailsErrors.push(GetErrorMessage(currentCheck, isScottish));
        }
        break;

      default:
        break;
    }

    // Enter a street.
    currentCheck = GetCheck(2400108, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400108(data.usrn))
      usrnErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Postcode does not exist in the lookup table.
    currentCheck = GetCheck(2400049, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400049(data.postcodeRef, currentLookups)) {
      postcodeRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Post town does not exist in the lookup table.
    currentCheck = GetCheck(2400055, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400055(data.postTownRef, currentLookups)) {
      postTownRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Open BLPU/LPI on a closed street.
    currentCheck = GetCheck(2100013, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100013(data.usrn, userContext, isScottish))
      usrnErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Enter a descriptor.
    currentCheck = GetCheck(1100007, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1100007(data.usrn, currentLookups)) {
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
    // Invalid date format
    currentCheck = GetCheck(1000020, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1000020(blpuData.stateDate)) {
      stateDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }
    if (includeCheck(currentCheck, isScottish) && failsCheck1000020(blpuData.startDate)) {
      blpuStartDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a BLPU logical status.
    currentCheck = GetCheck(2100008, currentLookups, methodName, isScottish, showDebugMessages);
    if (!haveMoveBlpu && includeCheck(currentCheck, isScottish) && failsCheck2100008(blpuData.logicalStatus))
      blpuStatusErrors.push(GetErrorMessage(currentCheck, isScottish));

    // BLPU logical status is invalid.
    currentCheck = GetCheck(2100009, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100009(blpuData.logicalStatus)) {
      blpuStatusErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // State is incompatible with the BLPU logical status.
    currentCheck = GetCheck(2100011, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      !haveMoveBlpu &&
      includeCheck(currentCheck, isScottish) &&
      failsCheck2100011(blpuData.logicalStatus, blpuData.state, isScottish)
    ) {
      stateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // The state must be between 1 and 7.
    currentCheck = GetCheck(2100012, currentLookups, methodName, isScottish, showDebugMessages);
    if (!haveMoveBlpu && includeCheck(currentCheck, isScottish) && failsCheck2100012(blpuData.state)) {
      stateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a representative point code (RPC).
    currentCheck = GetCheck(2100014, currentLookups, methodName, isScottish, showDebugMessages);
    if (!haveMoveBlpu && includeCheck(currentCheck, isScottish) && failsCheck2100014(blpuData.rpc))
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Classification is too long.
    currentCheck = GetCheck(2100015, currentLookups, methodName, isScottish, showDebugMessages);
    if (!isScottish && includeCheck(currentCheck, isScottish) && failsCheck2100015(blpuData.classification)) {
      blpuClassificationErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a classification.
    currentCheck = GetCheck(2100016, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      !isScottish &&
      !haveMoveBlpu &&
      includeCheck(currentCheck, isScottish) &&
      failsCheck2100016(blpuData.classification)
    )
      blpuClassificationErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Both state and state date must be entered.
    currentCheck = GetCheck(2100024, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      !haveMoveBlpu &&
      includeCheck(currentCheck, isScottish) &&
      failsCheck2100024(blpuData.state, blpuData.logicalStatus, isScottish, false)
    ) {
      stateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    if (
      !haveMoveBlpu &&
      includeCheck(currentCheck, isScottish) &&
      failsCheck2100024(blpuData.stateDate, blpuData.logicalStatus, isScottish, true)
    ) {
      stateDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // State date cannot be in the future.
    currentCheck = GetCheck(2100025, currentLookups, methodName, isScottish, showDebugMessages);
    if (!haveMoveBlpu && includeCheck(currentCheck, isScottish) && failsCheck2100025(blpuData.stateDate)) {
      stateDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Representative point code (RPC) is invalid.
    currentCheck = GetCheck(2100026, currentLookups, methodName, isScottish, showDebugMessages);
    if (!haveMoveBlpu && includeCheck(currentCheck, isScottish) && failsCheck2100026(blpuData.rpc)) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a start date.
    currentCheck = GetCheck(2100027, currentLookups, methodName, isScottish, showDebugMessages);
    if (!haveMoveBlpu && includeCheck(currentCheck, isScottish) && failsCheck2100027(blpuData.startDate))
      blpuStartDateErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Start date cannot be in the future.
    currentCheck = GetCheck(2100028, currentLookups, methodName, isScottish, showDebugMessages);
    if (!haveMoveBlpu && includeCheck(currentCheck, isScottish) && failsCheck2100028(blpuData.startDate)) {
      blpuStartDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Start dates prior to 1753 are not allowed.
    currentCheck = GetCheck(2100029, currentLookups, methodName, isScottish, showDebugMessages);
    if (!haveMoveBlpu && includeCheck(currentCheck, isScottish) && failsCheck2100029(blpuData.startDate)) {
      blpuStartDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // An RPC of 3 can no longer be submitted to GeoPlace.
    currentCheck = GetCheck(2100036, currentLookups, methodName, isScottish, showDebugMessages);
    if (!haveMoveBlpu && includeCheck(currentCheck, isScottish) && failsCheck2100036(blpuData.rpc)) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // An RPC of 5 can no longer be submitted to GeoPlace.
    currentCheck = GetCheck(2100037, currentLookups, methodName, isScottish, showDebugMessages);
    if (!haveMoveBlpu && includeCheck(currentCheck, isScottish) && failsCheck2100037(blpuData.rpc)) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // The BLPU logical status is incompatible with the state.
    currentCheck = GetCheck(2100046, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      failsCheck2100046(blpuData.logicalStatus, blpuData.state, isScottish)
    ) {
      blpuStatusErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // State is invalid.
    currentCheck = GetCheck(2100048, currentLookups, methodName, isScottish, showDebugMessages);
    if (!haveMoveBlpu && includeCheck(currentCheck, isScottish) && failsCheck2100048(blpuData.state)) {
      stateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Classification does not exist in the lookup table.
    currentCheck = GetCheck(2100055, currentLookups, methodName, isScottish, showDebugMessages);
    if (!isScottish && includeCheck(currentCheck, isScottish) && failsCheck2100055(blpuData.classification)) {
      blpuClassificationErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // An approved BLPU more than a year old, can't have a classification of Unclassified.
    currentCheck = GetCheck(2100061, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      !isScottish &&
      !haveMoveBlpu &&
      includeCheck(currentCheck, isScottish) &&
      failsCheck2100061(blpuData.logicalStatus, blpuData.classification, blpuData.startDate)
    ) {
      blpuClassificationErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // An RPC of 9 can no longer be submitted to GeoPlace.
    currentCheck = GetCheck(2100062, currentLookups, methodName, isScottish, showDebugMessages);
    if (!haveMoveBlpu && includeCheck(currentCheck, isScottish) && failsCheck2100062(blpuData.rpc)) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Level is invalid.
    currentCheck = GetCheck(2100063, currentLookups, methodName, isScottish, showDebugMessages);
    if (!haveMoveBlpu && isScottish && includeCheck(currentCheck, isScottish) && failsCheck2100063(blpuData.level)) {
      blpuLevelErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a level.
    currentCheck = GetCheck(2100068, currentLookups, methodName, isScottish, showDebugMessages);
    if (!haveMoveBlpu && isScottish && includeCheck(currentCheck, isScottish) && failsCheck2100068(blpuData.level)) {
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
      const postTownData = currentLookups.postTowns.find((x) => x.postTownRef === postTownRef);
      const postcodeData = currentLookups.postcodes.find((x) => x.postcodeRef === postcodeRef);

      // Invalid date format
      currentCheck = GetCheck(1000020, currentLookups, methodName, isScottish, showDebugMessages);
      if (includeCheck(currentCheck, isScottish) && failsCheck1000020(lpiData.startDate)) {
        lpiStartDateErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      // Enter a start date.
      currentCheck = GetCheck(2400007, currentLookups, methodName, isScottish, showDebugMessages);
      if (includeCheck(currentCheck, isScottish) && failsCheck2400007(lpiData.startDate)) {
        lpiStartDateErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      // Start date cannot be in the future.
      currentCheck = GetCheck(2400008, currentLookups, methodName, isScottish, showDebugMessages);
      if (includeCheck(currentCheck, isScottish) && failsCheck2400008(lpiData.startDate)) {
        lpiStartDateErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      // Enter a postal address flag.
      currentCheck = GetCheck(2400022, currentLookups, methodName, isScottish, showDebugMessages);
      if (!isScottish && includeCheck(currentCheck, isScottish) && failsCheck2400022(lpiData.postallyAddressable)) {
        postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      // Postal address is too long.
      currentCheck = GetCheck(2400023, currentLookups, methodName, isScottish, showDebugMessages);
      if (!isScottish && includeCheck(currentCheck, isScottish) && failsCheck2400023(lpiData.postallyAddressable)) {
        postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      // Postal address is invalid.
      currentCheck = GetCheck(2400024, currentLookups, methodName, isScottish, showDebugMessages);
      if (!isScottish && includeCheck(currentCheck, isScottish) && failsCheck2400024(lpiData.postallyAddressable)) {
        postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      // Official address is too long.
      currentCheck = GetCheck(2400025, currentLookups, methodName, isScottish, showDebugMessages);
      if (includeCheck(currentCheck, isScottish) && failsCheck2400025(lpiData.officialAddress)) {
        officialFlagErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      // Official address is invalid.
      currentCheck = GetCheck(2400026, currentLookups, methodName, isScottish, showDebugMessages);
      if (includeCheck(currentCheck, isScottish) && failsCheck2400026(lpiData.officialAddress)) {
        officialFlagErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      // Start dates prior to 1753 are not allowed.
      currentCheck = GetCheck(2400030, currentLookups, methodName, isScottish, showDebugMessages);
      if (includeCheck(currentCheck, isScottish) && failsCheck2400030(lpiData.startDate)) {
        lpiStartDateErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      // Postal address of 'N' must not have a postcode or post town.
      currentCheck = GetCheck(2400060, currentLookups, methodName, isScottish, showDebugMessages);
      if (
        includeCheck(currentCheck, isScottish) &&
        failsCheck2400060(
          lpiData.logicalStatus,
          lpiData.postallyAddressable,
          postTownRef,
          postTownData,
          postcodeRef,
          postcodeData
        )
      ) {
        postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      // Postal address of 'Y', 'A' or 'L' must have a postcode and post town.
      currentCheck = GetCheck(2400061, currentLookups, methodName, isScottish, showDebugMessages);
      if (
        includeCheck(currentCheck, isScottish) &&
        failsCheck2400061(
          lpiData.postallyAddressable,
          isScottish ? ["Y", "L"] : ["Y", "A", "L"],
          postTownRef,
          postTownData,
          postcodeRef,
          postcodeData
        )
      ) {
        postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      // Postal address of 'P' must have a postcode and a post town.
      currentCheck = GetCheck(2400062, currentLookups, methodName, isScottish, showDebugMessages);
      if (
        !isScottish &&
        includeCheck(currentCheck, isScottish) &&
        failsCheck2400062(lpiData.postallyAddressable, postTownRef, postTownData, postcodeRef, postcodeData)
      ) {
        postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      // Enter an LPI Logical status.
      currentCheck = GetCheck(2400064, currentLookups, methodName, isScottish, showDebugMessages);
      if (includeCheck(currentCheck, isScottish) && failsCheck2400064(lpiData.logicalStatus)) {
        lpiStatusErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      // LPI logical status is invalid.
      currentCheck = GetCheck(2400069, currentLookups, methodName, isScottish, showDebugMessages);
      if (includeCheck(currentCheck, isScottish) && failsCheck2400069(lpiData.logicalStatus)) {
        lpiStatusErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      // Level is too long.
      currentCheck = GetCheck(2400085, currentLookups, methodName, isScottish, showDebugMessages);
      if (!isScottish && includeCheck(currentCheck, isScottish) && failsCheck2400085(lpiData.level)) {
        lpiLevelErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      // Enter a official address flag.
      currentCheck = GetCheck(2400087, currentLookups, methodName, isScottish, showDebugMessages);
      if (isScottish) {
        if (includeCheck(currentCheck, isScottish) && failsCheck2400087(lpiData.officialAddress)) {
          officialFlagErrors.push(GetErrorMessage(currentCheck, isScottish));
        }
      } else {
        if (includeCheck(currentCheck, isScottish) && failsCheck2400087(lpiData.officialFlag)) {
          officialFlagErrors.push(GetErrorMessage(currentCheck, isScottish));
        }
      }

      // Enter a postal address flag.
      currentCheck = GetCheck(2400088, currentLookups, methodName, isScottish, showDebugMessages);
      if (isScottish && includeCheck(currentCheck, isScottish) && failsCheck2400088(lpiData.postallyAddressable)) {
        postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      // Postal address is too long.
      currentCheck = GetCheck(2400089, currentLookups, methodName, isScottish, showDebugMessages);
      if (isScottish && includeCheck(currentCheck, isScottish) && failsCheck2400089(lpiData.postallyAddressable)) {
        postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      // Postal address is invalid.
      currentCheck = GetCheck(2400090, currentLookups, methodName, isScottish, showDebugMessages);
      if (isScottish && includeCheck(currentCheck, isScottish) && failsCheck2400090(lpiData.postallyAddressable)) {
        postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
      }
    }

    if (blpuData && lpiData) {
      // BLPU logical status is incompatible with LPI logical status.
      currentCheck = GetCheck(2100035, currentLookups, methodName, isScottish, showDebugMessages);
      if (includeCheck(currentCheck, isScottish) && failsCheck2100035(blpuData.logicalStatus, lpiData.logicalStatus))
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
      // Invalid date format
      currentCheck = GetCheck(1000020, currentLookups, methodName, isScottish, showDebugMessages);
      if (includeCheck(currentCheck, isScottish) && failsCheck1000020(classificationData.startDate)) {
        classificationStartDateErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      // Enter a classification code.
      currentCheck = GetCheck(3200008, currentLookups, methodName, isScottish, showDebugMessages);
      if (
        !haveMoveBlpu &&
        includeCheck(currentCheck, isScottish) &&
        failsCheck3200008(classificationData.classification)
      ) {
        blpuClassificationErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      // Start date cannot be in the future.
      currentCheck = GetCheck(3200009, currentLookups, methodName, true, showDebugMessages);
      if (includeCheck(currentCheck, true) && failsCheck3200009(classificationData.startDate)) {
        classificationStartDateErrors.push(GetErrorMessage(currentCheck, true));
      }

      // Scheme is too long.
      currentCheck = GetCheck(3200015, currentLookups, methodName, true, showDebugMessages);
      if (includeCheck(currentCheck, true) && failsCheck3200015(classificationData.classificationScheme)) {
        classificationSchemeErrors.push(GetErrorMessage(currentCheck, true));
      }

      // Enter a scheme.
      currentCheck = GetCheck(3200017, currentLookups, methodName, true, showDebugMessages);
      if (includeCheck(currentCheck, true) && failsCheck3200017(classificationData.classificationScheme)) {
        classificationSchemeErrors.push(GetErrorMessage(currentCheck, true));
      }

      // Enter a start date.
      currentCheck = GetCheck(3200018, currentLookups, methodName, true, showDebugMessages);
      if (includeCheck(currentCheck, true) && failsCheck3200018(classificationData.startDate)) {
        classificationStartDateErrors.push(GetErrorMessage(currentCheck, true));
      }

      // Commercial tertiary classification required for BLPU.
      currentCheck = GetCheck(3200022, currentLookups, methodName, true, showDebugMessages);
      if (includeCheck(currentCheck, true) && failsCheck3200022(classificationData.classification)) {
        blpuClassificationErrors.push(GetErrorMessage(currentCheck, true));
      }

      // Residential tertiary classification required for BLPU.
      currentCheck = GetCheck(3200023, currentLookups, methodName, true, showDebugMessages);
      if (includeCheck(currentCheck, true) && failsCheck3200023(classificationData.classification)) {
        blpuClassificationErrors.push(GetErrorMessage(currentCheck, true));
      }
    }
  }

  if (otherData && !haveMoveBlpu) {
    // Invalid date format
    currentCheck = GetCheck(1000020, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1000020(otherData.provStartDate)) {
      provStartDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Provenance code is invalid.
    currentCheck = GetCheck(2200010, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2200010(otherData.provCode)) {
      provenanceCodeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a start date.
    currentCheck = GetCheck(2200011, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && otherData.provCode && failsCheck2200011(otherData.provStartDate)) {
      provStartDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Start date cannot be in the future.
    currentCheck = GetCheck(2200012, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2200012(otherData.provStartDate)) {
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

export function ValidatePlotPropertyDetails(blpuData, lpiData, currentLookups, isScottish) {
  const methodName = "ValidatePropertyDetails";
  const blpuErrors = [];
  const lpiErrors = [];
  let currentCheck;
  const blpuStatusErrors = [];
  const rpcErrors = [];
  const stateErrors = [];
  const stateDateErrors = [];
  const blpuStartDateErrors = [];
  const blpuLevelErrors = [];
  const existingLpiStatusErrors = [];
  const newLpiStatusErrors = [];
  const officialFlagErrors = [];
  const postalAddressErrors = [];
  const lpiStartDateErrors = [];
  const lpiLevelErrors = [];

  if (!blpuData) {
    // Enter a BLPU logical status.
    currentCheck = GetCheck(2100008, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish)) blpuStatusErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Enter a representative point code (RPC).
    currentCheck = GetCheck(2100014, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish)) rpcErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Both state and state date must be entered.
    currentCheck = GetCheck(2100024, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish)) {
      stateErrors.push(GetErrorMessage(currentCheck, isScottish));
      stateDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }
  } else {
    // Invalid date format
    currentCheck = GetCheck(1000020, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1000020(blpuData.stateDate)) {
      stateDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }
    if (includeCheck(currentCheck, isScottish) && failsCheck1000020(blpuData.startDate)) {
      blpuStartDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a BLPU logical status.
    currentCheck = GetCheck(2100008, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100008(blpuData.logicalStatus))
      blpuStatusErrors.push(GetErrorMessage(currentCheck, isScottish));

    // BLPU logical status is invalid.
    currentCheck = GetCheck(2100009, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100009(blpuData.logicalStatus)) {
      blpuStatusErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // State is incompatible with the BLPU logical status.
    currentCheck = GetCheck(2100011, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      failsCheck2100011(blpuData.logicalStatus, blpuData.state, isScottish)
    ) {
      stateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // The state must be between 1 and 7.
    currentCheck = GetCheck(2100012, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100012(blpuData.state)) {
      stateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a representative point code (RPC).
    currentCheck = GetCheck(2100014, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100014(blpuData.rpc))
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Both state and state date must be entered.
    currentCheck = GetCheck(2100024, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      failsCheck2100024(blpuData.state, blpuData.logicalStatus, isScottish, false)
    ) {
      stateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    if (
      includeCheck(currentCheck, isScottish) &&
      failsCheck2100024(blpuData.stateDate, blpuData.logicalStatus, isScottish, true)
    ) {
      stateDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // State date cannot be in the future.
    currentCheck = GetCheck(2100025, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100025(blpuData.stateDate)) {
      stateDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Representative point code (RPC) is invalid.
    currentCheck = GetCheck(2100026, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100026(blpuData.rpc)) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // An RPC of 3 can no longer be submitted to GeoPlace.
    currentCheck = GetCheck(2100036, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100036(blpuData.rpc)) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // An RPC of 5 can no longer be submitted to GeoPlace.
    currentCheck = GetCheck(2100037, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100037(blpuData.rpc)) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // The BLPU logical status is incompatible with the state.
    currentCheck = GetCheck(2100046, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      failsCheck2100046(blpuData.logicalStatus, blpuData.state, isScottish)
    ) {
      blpuStatusErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // State is invalid.
    currentCheck = GetCheck(2100048, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100048(blpuData.state)) {
      stateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // An RPC of 9 can no longer be submitted to GeoPlace.
    currentCheck = GetCheck(2100062, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100062(blpuData.rpc)) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Level is invalid.
    currentCheck = GetCheck(2100063, currentLookups, methodName, isScottish, showDebugMessages);
    if (isScottish && includeCheck(currentCheck, isScottish) && failsCheck2100063(blpuData.level)) {
      blpuLevelErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a level.
    currentCheck = GetCheck(2100068, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100068(blpuData.level)) {
      blpuLevelErrors.push(GetErrorMessage(currentCheck, isScottish));
    }
  }

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
    if (includeCheck(currentCheck, isScottish)) existingLpiStatusErrors.push(GetErrorMessage(currentCheck, isScottish));
    if (includeCheck(currentCheck, isScottish)) newLpiStatusErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Enter a official address flag.
    currentCheck = GetCheck(2400087, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish)) officialFlagErrors.push(GetErrorMessage(currentCheck, isScottish));
  } else {
    const postTownData = currentLookups.postTowns.find((x) => x.postTownRef === lpiData.postTownRef);
    const postcodeData = currentLookups.postcodes.find((x) => x.postcodeRef === lpiData.postcodeRef);

    // Invalid date format
    currentCheck = GetCheck(1000020, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1000020(lpiData.startDate)) {
      lpiStartDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a start date.
    currentCheck = GetCheck(2400007, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !lpiData.startDate) {
      lpiStartDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Start date cannot be in the future.
    currentCheck = GetCheck(2400008, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400008(lpiData.startDate)) {
      lpiStartDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a postal address flag.
    currentCheck = GetCheck(2400022, currentLookups, methodName, isScottish, showDebugMessages);
    if (!isScottish && includeCheck(currentCheck, isScottish) && failsCheck2400022(lpiData.postallyAddressable)) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Postal address is too long.
    currentCheck = GetCheck(2400023, currentLookups, methodName, isScottish, showDebugMessages);
    if (!isScottish && includeCheck(currentCheck, isScottish) && failsCheck2400023(lpiData.postallyAddressable)) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Postal address is invalid.
    currentCheck = GetCheck(2400024, currentLookups, methodName, isScottish, showDebugMessages);
    if (!isScottish && includeCheck(currentCheck, isScottish) && failsCheck2400024(lpiData.postallyAddressable)) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Official address is too long.
    currentCheck = GetCheck(2400025, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400025(lpiData.officialAddress)) {
      officialFlagErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Official address is invalid.
    currentCheck = GetCheck(2400026, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400026(lpiData.officialAddress)) {
      officialFlagErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Start dates prior to 1753 are not allowed.
    currentCheck = GetCheck(2400030, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400030(lpiData.startDate)) {
      lpiStartDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Postal address of 'N' must not have a postcode or post town.
    currentCheck = GetCheck(2400060, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      failsCheck2400060(
        lpiData.logicalStatus,
        lpiData.postallyAddressable,
        lpiData.postTownRef,
        postTownData,
        lpiData.postcodeRef,
        postcodeData
      )
    ) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Postal address of 'Y', 'A' or 'L' must have a postcode and post town.
    currentCheck = GetCheck(2400061, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      failsCheck2400061(
        lpiData.postallyAddressable,
        isScottish ? ["Y", "L"] : ["Y", "A", "L"],
        lpiData.postTownRef,
        postTownData,
        lpiData.postcodeRef,
        postcodeData
      )
    ) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Postal address of 'P' must have a postcode and a post town.
    currentCheck = GetCheck(2400062, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      !isScottish &&
      includeCheck(currentCheck, isScottish) &&
      failsCheck2400062(
        lpiData.postallyAddressable,
        lpiData.postTownRef,
        postTownData,
        lpiData.postcodeRef,
        postcodeData
      )
    ) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter an LPI Logical status.
    currentCheck = GetCheck(2400064, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400064(lpiData.existingLogicalStatus)) {
      existingLpiStatusErrors.push(GetErrorMessage(currentCheck, isScottish));
    }
    if (includeCheck(currentCheck, isScottish) && failsCheck2400064(lpiData.newLogicalStatus)) {
      newLpiStatusErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // LPI logical status is invalid.
    currentCheck = GetCheck(2400069, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400069(lpiData.existingLogicalStatus)) {
      existingLpiStatusErrors.push(GetErrorMessage(currentCheck, isScottish));
    }
    if (includeCheck(currentCheck, isScottish) && failsCheck2400069(lpiData.newLogicalStatus)) {
      newLpiStatusErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Level is too long.
    currentCheck = GetCheck(2400085, currentLookups, methodName, isScottish, showDebugMessages);
    if (!isScottish && includeCheck(currentCheck, isScottish) && failsCheck2400085(lpiData.level)) {
      lpiLevelErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a official address flag.
    currentCheck = GetCheck(2400087, currentLookups, methodName, isScottish, showDebugMessages);
    if (isScottish) {
      if (includeCheck(currentCheck, isScottish) && failsCheck2400087(lpiData.officialAddress)) {
        officialFlagErrors.push(GetErrorMessage(currentCheck, isScottish));
      }
    } else {
      if (includeCheck(currentCheck, isScottish) && failsCheck2400087(lpiData.officialFlag)) {
        officialFlagErrors.push(GetErrorMessage(currentCheck, isScottish));
      }
    }

    // Enter a postal address flag.
    currentCheck = GetCheck(2400088, currentLookups, methodName, isScottish, showDebugMessages);
    if (isScottish && includeCheck(currentCheck, isScottish) && failsCheck2400088(lpiData.postallyAddressable)) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Postal address is too long.
    currentCheck = GetCheck(2400089, currentLookups, methodName, isScottish, showDebugMessages);
    if (isScottish && includeCheck(currentCheck, isScottish) && failsCheck2400089(lpiData.postallyAddressable)) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Postal address is invalid.
    currentCheck = GetCheck(2400090, currentLookups, methodName, isScottish, showDebugMessages);
    if (isScottish && includeCheck(currentCheck, isScottish) && failsCheck2400090(lpiData.postallyAddressable)) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }
  }

  if (blpuData && lpiData) {
    // BLPU logical status is incompatible with LPI logical status.
    currentCheck = GetCheck(2100035, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100035(blpuData.logicalStatus, lpiData.newLogicalStatus))
      blpuStatusErrors.push(GetErrorMessage(currentCheck, isScottish));
  }

  if (blpuData && !lpiData) {
    // A BLPU must have an LPI record.
    currentCheck = GetCheck(2100049, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish)) blpuStatusErrors.push(GetErrorMessage(currentCheck, isScottish));
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

  if (existingLpiStatusErrors.length > 0)
    lpiErrors.push({
      field: "ExistingLpiStatus",
      errors: existingLpiStatusErrors,
    });

  if (newLpiStatusErrors.length > 0)
    lpiErrors.push({
      field: "NewLpiStatus",
      errors: newLpiStatusErrors,
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

  return {
    blpu: blpuErrors,
    lpi: lpiErrors,
    other: [],
  };
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
    // Invalid date format
    currentCheck = GetCheck(1000020, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1000020(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a start date.
    currentCheck = GetCheck(2300006, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2300006(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Start date cannot be in the future.
    currentCheck = GetCheck(2300010, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2300010(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a cross reference.
    currentCheck = GetCheck(2300014, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2300014(data.crossReference)) {
      crossReferenceErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Cross reference is too long.
    currentCheck = GetCheck(2300015, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2300015(data.crossReference)) {
      crossReferenceErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Source is missing, historic or disabled.
    currentCheck = GetCheck(2300016, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2300016(data.sourceId)) {
      sourceIdErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Source does not exist in the lookup table or is marked as historic/disabled.
    currentCheck = GetCheck(2300025, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2300025(data.sourceId, currentLookups)) {
      sourceIdErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Start dates prior to 1753 are not allowed.
    currentCheck = GetCheck(2300033, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2300033(data.startDate)) {
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

/**
 * Method used to validate a plot to postal address.
 *
 * @param {Object} data The address data to validate.
 * @param {Object} currentLookups - The lookup context object.
 * @param {Boolean} isScottish - True if the authority is a Scottish authority; otherwise false.
 * @param {Boolean} isWelsh - True if the authority is a Welsh authority; otherwise false.
 * @param {Boolean} checkAltLang - True if the alternative language fields need to be checked as well; otherwise false.
 * @return {Array}
 */
export function ValidatePlotToPostalAddress(data, currentLookups, isScottish, isWelsh, checkAltLang) {
  const methodName = "ValidatePlotToPostalAddress";
  const validationErrors = [];
  let currentCheck;
  const languageErrors = [];
  const paoStartNumberErrors = [];
  const saoStartNumberErrors = [];
  const usrnErrors = [];
  const paoTextErrors = [];
  const saoTextErrors = [];
  const lpiStatusErrors = [];
  const postcodeRefErrors = [];
  const postTownRefErrors = [];
  const subLocalityRefErrors = [];
  const officialFlagErrors = [];
  const postalAddressErrors = [];
  const lpiStartDateErrors = [];
  const altLanguageErrors = [];
  const altLangPaoStartNumberErrors = [];
  const altLangSaoStartNumberErrors = [];
  const altLangPaoTextErrors = [];
  const altLangSaoTextErrors = [];
  const altLangPostcodeRefErrors = [];
  const altLangPostTownRefErrors = [];

  if (!data) {
    // Enter a descriptor.
    currentCheck = GetCheck(1100007, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish)) {
      usrnErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a start date.
    currentCheck = GetCheck(2400007, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish)) {
      lpiStartDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a postal address flag.
    currentCheck = GetCheck(2400022, currentLookups, methodName, isScottish, showDebugMessages);
    if (!isScottish && includeCheck(currentCheck, isScottish)) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a language.
    currentCheck = GetCheck(2400028, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400028(data.language)) {
      languageErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    if (checkAltLang) {
      if (includeCheck(currentCheck, isScottish) && failsCheck2400028(data.altLangLanguage)) {
        altLanguageErrors.push(GetErrorMessage(currentCheck, isScottish));
      }
    }

    // Language is invalid.
    currentCheck = GetCheck(2400029, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400029(data.language, isWelsh, isScottish)) {
      languageErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    if (checkAltLang) {
      if (includeCheck(currentCheck, isScottish) && failsCheck2400029(data.altLangLanguage, isWelsh, isScottish)) {
        altLanguageErrors.push(GetErrorMessage(currentCheck, isScottish));
      }
    }

    // Enter PAO details.
    currentCheck = GetCheck(2400040, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish)) {
      paoTextErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    if (checkAltLang) {
      if (includeCheck(currentCheck, isScottish)) {
        altLangPaoTextErrors.push(GetErrorMessage(currentCheck, isScottish));
      }
    }

    // Enter an LPI Logical status.
    currentCheck = GetCheck(2400064, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish)) {
      lpiStatusErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a official address flag.
    currentCheck = GetCheck(2400087, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish)) {
      officialFlagErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a postal address flag.
    currentCheck = GetCheck(2400088, currentLookups, methodName, isScottish, showDebugMessages);
    if (isScottish && includeCheck(currentCheck, isScottish)) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a street.
    currentCheck = GetCheck(2400108, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish)) {
      usrnErrors.push(GetErrorMessage(currentCheck, isScottish));
    }
  } else {
    const postTownData = currentLookups.postTowns.find((x) => x.postTownRef === data.postTownRef);
    const postcodeData = currentLookups.postcodes.find((x) => x.postcodeRef === data.postcodeRef);

    // Invalid date format
    currentCheck = GetCheck(1000020, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1000020(data.startDate)) {
      lpiStartDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a descriptor.
    currentCheck = GetCheck(1100007, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck1100007(data.usrn, currentLookups)) {
      usrnErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a start date.
    currentCheck = GetCheck(2400007, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400007(data.startDate)) {
      lpiStartDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Start date cannot be in the future.
    currentCheck = GetCheck(2400008, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400008(data.startDate)) {
      lpiStartDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a postal address flag.
    currentCheck = GetCheck(2400022, currentLookups, methodName, isScottish, showDebugMessages);
    if (!isScottish && includeCheck(currentCheck, isScottish) && failsCheck2400022(data.postallyAddressable)) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Postal address is too long.
    currentCheck = GetCheck(2400023, currentLookups, methodName, isScottish, showDebugMessages);
    if (!isScottish && includeCheck(currentCheck, isScottish) && failsCheck2400023(data.postallyAddressable)) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Postal address is invalid.
    currentCheck = GetCheck(2400024, currentLookups, methodName, isScottish, showDebugMessages);
    if (!isScottish && includeCheck(currentCheck, isScottish) && failsCheck2400024(data.postallyAddressable)) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Official address is too long.
    currentCheck = GetCheck(2400025, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400025(data.officialAddress)) {
      officialFlagErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Official address is invalid.
    currentCheck = GetCheck(2400026, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400026(data.officialAddress)) {
      officialFlagErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Start dates prior to 1753 are not allowed.
    currentCheck = GetCheck(2400030, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400030(data.startDate)) {
      lpiStartDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }
    // SAO end number populated but SAO start number is blank.
    currentCheck = GetCheck(2400034, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400034(data.saoStartNumber, data.saoEndNumber))
      saoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));

    // PAO text is too long.
    currentCheck = GetCheck(2400035, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400035(data.paoText))
      paoTextErrors.push(GetErrorMessage(currentCheck, isScottish));

    if (checkAltLang) {
      if (includeCheck(currentCheck, isScottish) && failsCheck2400035(data.altLangPaoText))
        altLangPaoTextErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // SAO text is too long.
    currentCheck = GetCheck(2400036, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400036(data.saoText))
      saoTextErrors.push(GetErrorMessage(currentCheck, isScottish));

    if (checkAltLang) {
      if (includeCheck(currentCheck, isScottish) && failsCheck2400036(data.altLangSaoText))
        altLangSaoTextErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // PAO start number is invalid.
    currentCheck = GetCheck(2400037, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400037(data.paoStartNumber))
      paoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));

    // PAO end number is invalid.
    currentCheck = GetCheck(2400038, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400038(data.paoEndNumber))
      paoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));

    // PAO end number populated but PAO start number is blank.
    currentCheck = GetCheck(2400039, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400039(data.paoStartNumber, data.paoEndNumber))
      paoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Enter PAO details.
    currentCheck = GetCheck(2400040, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400040(data.paoStartNumber, data.paoText)) {
      paoTextErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    if (checkAltLang) {
      if (includeCheck(currentCheck, isScottish) && failsCheck2400040(data.paoStartNumber, data.altLangPaoText)) {
        altLangPaoTextErrors.push(GetErrorMessage(currentCheck, isScottish));
      }
    }

    // Postcode does not exist in the lookup table.
    currentCheck = GetCheck(2400049, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400049(data.postcodeRef, currentLookups)) {
      postcodeRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Post town does not exist in the lookup table.
    currentCheck = GetCheck(2400055, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400055(data.postTownRef, currentLookups)) {
      postTownRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Postal address of 'N' must not have a postcode or post town.
    currentCheck = GetCheck(2400060, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      failsCheck2400060(
        data.newLpiLogicalStatus,
        data.postallyAddressable,
        data.postTownRef,
        postTownData,
        data.postcodeRef,
        postcodeData
      )
    ) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Postal address of 'Y', 'A' or 'L' must have a postcode and post town.
    currentCheck = GetCheck(2400061, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      failsCheck2400061(
        data.postallyAddressable,
        isScottish ? ["Y", "L"] : ["Y", "A", "L"],
        data.postTownRef,
        postTownData,
        data.postcodeRef,
        postcodeData
      )
    ) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Postal address of 'P' must have a postcode and a post town.
    currentCheck = GetCheck(2400062, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      !isScottish &&
      includeCheck(currentCheck, isScottish) &&
      failsCheck2400062(data.postallyAddressable, data.postTownRef, postTownData, data.postcodeRef, postcodeData)
    ) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter an LPI Logical status.
    currentCheck = GetCheck(2400064, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400064(data.newLpiLogicalStatus)) {
      lpiStatusErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // LPI logical status is invalid.
    currentCheck = GetCheck(2400069, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400069(data.newLpiLogicalStatus)) {
      lpiStatusErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // PAO start suffix supplied but no PAO start number.
    currentCheck = GetCheck(2400073, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400073(data.paoStartSuffix, data.paoStartNumber)) {
      paoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    if (checkAltLang) {
      if (
        includeCheck(currentCheck, isScottish) &&
        failsCheck2400073(data.altLangPaoStartSuffix, data.paoStartNumber)
      ) {
        altLangPaoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
      }
    }

    // PAO end suffix supplied but no PAO end number.
    currentCheck = GetCheck(2400074, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400074(data.paoEndSuffix, data.paoEndNumber)) {
      paoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    if (checkAltLang) {
      if (includeCheck(currentCheck, isScottish) && failsCheck2400074(data.altLangPaoEndSuffix, data.paoEndNumber)) {
        altLangPaoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
      }
    }

    // SAO start suffix supplied but no SAO start number.
    currentCheck = GetCheck(2400075, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400075(data.saoStartSuffix, data.saoStartNumber)) {
      saoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    if (checkAltLang) {
      if (
        includeCheck(currentCheck, isScottish) &&
        failsCheck2400073(data.altLangSaoStartSuffix, data.saoStartNumber)
      ) {
        altLangSaoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
      }
    }

    // SAO end suffix supplied but no SAO end number.
    currentCheck = GetCheck(2400076, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400076(data.saoEndSuffix, data.saoEndNumber)) {
      saoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    if (checkAltLang) {
      if (includeCheck(currentCheck, isScottish) && failsCheck2400073(data.altLangSaoEndSuffix, data.saoEndNumber)) {
        altLangSaoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
      }
    }

    // SAO end number must be greater than SAO start number.
    currentCheck = GetCheck(2400077, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400077(data.saoStartNumber, data.saoEndNumber))
      saoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));

    // PAO end number must be greater than PAO start number.
    currentCheck = GetCheck(2400078, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400078(data.paoStartNumber, data.paoEndNumber))
      paoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));

    // Sub-locality does not exist in the lookup table.
    currentCheck = GetCheck(2400083, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400083(data.subLocalityRef, currentLookups)) {
      subLocalityRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a official address flag.
    currentCheck = GetCheck(2400087, currentLookups, methodName, isScottish, showDebugMessages);
    if (isScottish) {
      if (includeCheck(currentCheck, isScottish) && failsCheck2400087(data.officialAddress)) {
        officialFlagErrors.push(GetErrorMessage(currentCheck, isScottish));
      }
    } else {
      if (includeCheck(currentCheck, isScottish) && failsCheck2400087(data.officialFlag)) {
        officialFlagErrors.push(GetErrorMessage(currentCheck, isScottish));
      }
    }

    // Enter a postal address flag.
    currentCheck = GetCheck(2400088, currentLookups, methodName, isScottish, showDebugMessages);
    if (isScottish && includeCheck(currentCheck, isScottish) && failsCheck2400088(data.postallyAddressable)) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Postal address is too long.
    currentCheck = GetCheck(2400089, currentLookups, methodName, isScottish, showDebugMessages);
    if (isScottish && includeCheck(currentCheck, isScottish) && failsCheck2400089(data.postallyAddressable)) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Postal address is invalid.
    currentCheck = GetCheck(2400090, currentLookups, methodName, isScottish, showDebugMessages);
    if (isScottish && includeCheck(currentCheck, isScottish) && failsCheck2400090(data.postallyAddressable)) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // PAO text must not contain only a number, use PAO start number for the number.
    currentCheck = GetCheck(2400095, currentLookups, methodName, isScottish, showDebugMessages);
    if (isScottish && includeCheck(currentCheck, isScottish) && failsCheck2400095(data.paoText)) {
      paoTextErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    if (checkAltLang) {
      if (isScottish && includeCheck(currentCheck, isScottish) && failsCheck2400095(data.altLangPaoText)) {
        altLangPaoTextErrors.push(GetErrorMessage(currentCheck, isScottish));
      }
    }

    // Enter a street.
    currentCheck = GetCheck(2400108, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400018(data.usrn))
      usrnErrors.push(GetErrorMessage(currentCheck, isScottish));
  }

  if (showDebugMessages) console.log("[DEBUG] ValidatePlotToPostalAddress - Finished checks");

  if (lpiStatusErrors.length > 0)
    validationErrors.push({
      field: "LpiStatus",
      errors: lpiStatusErrors,
    });

  if (languageErrors.length > 0)
    validationErrors.push({
      field: "Language",
      errors: languageErrors,
    });

  if (altLanguageErrors.length > 0)
    validationErrors.push({
      field: "AltLanguage",
      errors: altLanguageErrors,
    });

  if (officialFlagErrors.length > 0)
    validationErrors.push({
      field: "OfficialAddress",
      errors: officialFlagErrors,
    });

  if (postalAddressErrors.length > 0)
    validationErrors.push({
      field: "PostalAddress",
      errors: postalAddressErrors,
    });

  if (lpiStartDateErrors.length > 0)
    validationErrors.push({
      field: "LpiStartDate",
      errors: lpiStartDateErrors,
    });

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

  if (altLangSaoStartNumberErrors.length > 0)
    validationErrors.push({
      field: "AltLangSaoStartNumber",
      errors: altLangSaoStartNumberErrors,
    });

  if (altLangPaoStartNumberErrors.length > 0)
    validationErrors.push({
      field: "AltLangPaoStartNumber",
      errors: altLangPaoStartNumberErrors,
    });

  if (altLangPaoTextErrors.length > 0)
    validationErrors.push({
      field: "AltLangPaoText",
      errors: altLangPaoTextErrors,
    });

  if (altLangSaoTextErrors.length > 0)
    validationErrors.push({
      field: "AltLangSaoText",
      errors: altLangSaoTextErrors,
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

  if (altLangPostcodeRefErrors.length > 0)
    validationErrors.push({
      field: "AltLangPostcodeRef",
      errors: altLangPostcodeRefErrors,
    });

  if (altLangPostTownRefErrors.length > 0)
    validationErrors.push({
      field: "AltLangPostTownRef",
      errors: altLangPostTownRefErrors,
    });

  if (subLocalityRefErrors.length > 0)
    validationErrors.push({
      field: "SubLocalityRef",
      errors: subLocalityRefErrors,
    });

  return validationErrors;
}
