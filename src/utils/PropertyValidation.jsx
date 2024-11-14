//#region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Property validation
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//  Maximum validation numbers
//  =================================
//  BLPU:                             2100077
//  BLPU Provenance:                  2200020
//  BLPU Application Cross Reference: 2300034
//  LPI:                              2400107
//  Successor Cross Reference:        3000017
//  Organisation:                     3100022
//  Classification:                   3200028
//  Note:                             7100014
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001            Sean Flook                 Initial Revision.
//    002   22.03.23 Sean Flook         WI40596 Corrected typo.
//    003   28.03.23 Sean Flook         WI40625 Added checks for start date prior to 1753 to cross references and extents.
//    004   30.03.23 Sean Flook         WI40636 Added check for RPC 9.
//    005   31.03.23 Sean Flook         WI40651 Corrected state date check.
//    006   14.04.23 Sean Flook         WI40653 Corrected check 2100045 && 2100047.
//    007   19.04.23 Sean Flook         WI40653 use includeCheck to determine if a check should be run.
//    008   27.06.23 Sean Flook         WI40729 Corrected check 2100019 and correctly set Organisation errors.
//    009   28.06.23 Sean Flook         WI40256 Changed Extent to Provenance where appropriate.
//    010   28.06.23 Sean Flook         WI40730 Corrected validation check for Welsh suffixes.
//    011   27.10.23 Sean Flook       IMANN-175 Added ValidateMultiEditLogicalStatus.
//    012   24.11.23 Sean Flook                 Renamed successor to successorCrossRef.
//    013   15.12.23 Sean Flook                 Added new checks and comments.
//    014   19.12.23 Sean Flook                 Various bug fixes.
//    015   29.01.24 Sean Flook                 Added new checks.
//    016   01.03.24 Sean Flook                 Corrected check for 2100011.
//    017   24.04.24 Sean Flook                 Added check for 2100065.
//    018   26.04.24 Sean Flook                 Tweaked check for 2100065.
//    019   08.05.24 Joel Benford     IMANN-398 Add check 2100066
//    020   08.05.24 Sean Flook       IMANN-474 Add check 2400087
//    021   21.05.24 Sean Flook       IMANN-473 Fixed some logic.
//    022   22.05.24 Sean Flook       IMANN-473 Added new Scottish checks.
//    023   22.05.24 Sean Flook       IMANN-459 Corrected field name for BLPU state checks.
//    024   29.05.24 Sean Flook       IMANN-221 Added new checks.
//    025   12.06.24 Sean Flook       IMANN-553 Modified checks 2100011 and 2100046 to cater for Scottish authorities.
//    026   12.06.24 Sean Flook       IMANN-553 Further modifications to checks 2100011 and 2100046 to cater for Scottish authorities.
//    027   18.06.24 Sean Flook       IMANN-534 Correctly handle blpuStates of 0.
//    028   18.06.24 Sean Flook       IMANN-577 Use characterSetValidator.
//    029   21.06.24 Sean Flook       IMANN-577 Corrected logic.
//    030   01.07.24 Joel Benford     IMANN-654 Fix checking BLPU state 0 for property wizard
//    031   01.07.24 Sean Flook       IMANN-674 Included logical status 7 in check 2400031.
//    032   04.07.24 Sean Flook       IMANN-221 Added new checks and updated messages.
//    033   04.07.24 Sean Flook       IMANN-221 Further updated messages.
//    034   04.07.24 Sean Flook       IMANN-221 Further updated messages.
//    035   08.07.24 Sean Flook       IMANN-722 Corrected logic for check for duplicate punctuation.
//    036   19.07.24 Joel Benford     IMANN-808 Handle GP postalAddress and OS postallyAddressable
//    037   19.07.24 Sean Flook       IMANN-808 Deal with different field names for GP and OS for checks 2400060 & 2400061.
//    038   26.07.24 Sean Flook       IMANN-855 Modified checks 2400077 & 2400078.
//    039   28.07.24 Sean Flook       IMANN-855 Removed check 2400106 as cannot be done in the GUI.
//    040   26.07.24 Sean Flook       IMANN-860 Report check 3000012 on the correct field.
//    041   22.08.24 Sean Flook       IMANN-951 Corrected field names.
//    042   02.09.24 Sean Flook       IMANN-976 Handle "Unassigned" in lookups.
//#endregion Version 1.0.0.0 changes
//#region Version 1.0.1.0 changes
//    043   31.10.24 Joel Benford    IMANN-1039 Add check 2400108 (LPI must have USRN)
//#endregion Version 1.0.1.0 changes
//#region Version 1.0.2.0 changes
//    044   31.10.24 Sean Flook       IMANN-1012 Changed to use new checks to prevent duplicating check code.
//    045   14.11.24 Sean Flook       IMANN-1039 Correctly add check 2400108.
//#endregion Version 1.0.2.0 changes
//
//--------------------------------------------------------------------------------------------------
//#endregion header

import {
  failsCheck2100008,
  failsCheck2100009,
  failsCheck2100011,
  failsCheck2100012,
  failsCheck2100014,
  failsCheck2100015,
  failsCheck2100016,
  failsCheck2100018,
  failsCheck2100019,
  failsCheck2100020,
  failsCheck2100021,
  failsCheck2100022,
  failsCheck2100023,
  failsCheck2100024,
  failsCheck2100025,
  failsCheck2100026,
  failsCheck2100027,
  failsCheck2100028,
  failsCheck2100029,
  failsCheck2100030,
  failsCheck2100031,
  failsCheck2100032,
  failsCheck2100036,
  failsCheck2100037,
  failsCheck2100045,
  failsCheck2100046,
  failsCheck2100047,
  failsCheck2100048,
  failsCheck2100053,
  failsCheck2100054,
  failsCheck2100055,
  failsCheck2100059,
  failsCheck2100060,
  failsCheck2100061,
  failsCheck2100062,
  failsCheck2100063,
  failsCheck2100065,
  failsCheck2100068,
  failsCheck2100073,
  failsCheck2100076,
  failsCheck2100077,
} from "./Type21ValidationChecks";
import {
  failsCheck2200009,
  failsCheck2200010,
  failsCheck2200011,
  failsCheck2200012,
  failsCheck2200014,
  failsCheck2200015,
  failsCheck2200019,
  failsCheck2200020,
} from "./Type22ValidationChecks";
import {
  failsCheck2300006,
  failsCheck2300010,
  failsCheck2300011,
  failsCheck2300012,
  failsCheck2300014,
  failsCheck2300015,
  failsCheck2300016,
  failsCheck2300017,
  failsCheck2300025,
} from "./Type23ValidationChecks";
import {
  failsCheck2400007,
  failsCheck2400008,
  failsCheck2400011,
  failsCheck2400012,
  failsCheck2400016,
  failsCheck2400017,
  failsCheck2400018,
  failsCheck2400019,
  failsCheck2400020,
  failsCheck2400021,
  failsCheck2400022,
  failsCheck2400023,
  failsCheck2400024,
  failsCheck2400025,
  failsCheck2400026,
  failsCheck2400028,
  failsCheck2400029,
  failsCheck2400030,
  failsCheck2400031,
  failsCheck2400032,
  failsCheck2400033,
  failsCheck2400034,
  failsCheck2400035,
  failsCheck2400036,
  failsCheck2400037,
  failsCheck2400038,
  failsCheck2400039,
  failsCheck2400040,
  failsCheck2400041,
  failsCheck2400042,
  failsCheck2400044,
  failsCheck2400045,
  failsCheck2400049,
  failsCheck2400055,
  failsCheck2400060,
  failsCheck2400061,
  failsCheck2400062,
  failsCheck2400064,
  failsCheck2400069,
  failsCheck2400073,
  failsCheck2400074,
  failsCheck2400075,
  failsCheck2400076,
  failsCheck2400077,
  failsCheck2400078,
  failsCheck2400080,
  failsCheck2400081,
  failsCheck2400082,
  failsCheck2400083,
  failsCheck2400084,
  failsCheck2400085,
  failsCheck2400087,
  failsCheck2400088,
  failsCheck2400089,
  failsCheck2400090,
  failsCheck2400095,
  failsCheck2400096,
  failsCheck2400100,
  failsCheck2400102,
  failsCheck2400103,
  failsCheck2400105,
  failsCheck2400107,
  failsCheck2400108,
} from "./Type24ValidationChecks";
import {
  failsCheck3000004,
  failsCheck3000008,
  failsCheck3000009,
  failsCheck3000010,
  failsCheck3000012,
} from "./Type30ValidationChecks";
import {
  failsCheck3100008,
  failsCheck3100010,
  failsCheck3100013,
  failsCheck3100014,
  failsCheck3100015,
  failsCheck3100016,
  failsCheck3100017,
  failsCheck3100019,
  failsCheck3100021,
  failsCheck3100022,
} from "./Type31ValidationChecks";
import {
  failsCheck3200008,
  failsCheck3200009,
  failsCheck3200011,
  failsCheck3200014,
  failsCheck3200015,
  failsCheck3200017,
  failsCheck3200018,
  failsCheck3200022,
  failsCheck3200023,
} from "./Type32ValidationChecks";
import { failsCheck7100005 } from "./Type71ValidationChecks";

import { isPriorTo1753, includeCheck, GetErrorMessage, GetCheck } from "./HelperUtils";

const showDebugMessages = false;

/**
 * Validates a BLPU record
 *
 * @param {Object} data - The BLPU record data that needs to be validated
 * @param {Object} currentLookups - The lookup context object.
 * @param {Boolean} isScottish - True if the authority is a Scottish authority; otherwise false.
 * @return {Array}
 */
export function ValidateBlpuData(data, currentLookups, isScottish) {
  const methodName = "ValidateBlpuData";
  let validationErrors = [];
  let currentCheck;
  let logicalStatusErrors = [];
  let blpuStateErrors = [];
  let blpuStateDateErrors = [];
  let rpcErrors = [];
  let classificationErrors = [];
  let organisationErrors = [];
  let xCoordinateErrors = [];
  let yCoordinateErrors = [];
  let wardCodeErrors = [];
  let parishCodeErrors = [];
  let startDateErrors = [];
  let endDateErrors = [];
  let localCustodianCodeErrors = [];
  let levelErrors = [];

  if (data) {
    // Enter a BLPU logical status.
    currentCheck = GetCheck(2100008, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100008(data.logicalStatus)) {
      logicalStatusErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // BLPU logical status is invalid.
    currentCheck = GetCheck(2100009, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100009(data.logicalStatus)) {
      logicalStatusErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // State is incompatible with the BLPU logical status.
    currentCheck = GetCheck(2100011, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100011(data.logicalStatus, data.blpuState, isScottish)) {
      blpuStateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // The state must be between 1 and 7.
    currentCheck = GetCheck(2100012, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100012(data.blpuState)) {
      blpuStateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a representative point code (RPC).
    currentCheck = GetCheck(2100014, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100014(data.rpc)) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Classification is too long.
    currentCheck = GetCheck(2100015, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100015(data.blpuClass)) {
      classificationErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a classification.
    currentCheck = GetCheck(2100016, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100016(data.blpuClass)) {
      classificationErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Organisation is too long.
    currentCheck = GetCheck(2100018, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100018(data.organisation)) {
      organisationErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Organisation contains an invalid character.
    currentCheck = GetCheck(2100019, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100019(data.organisation, isScottish)) {
      organisationErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter coordinates.
    currentCheck = GetCheck(2100020, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100020(data.xcoordinate)) {
      xCoordinateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    if (includeCheck(currentCheck, isScottish) && failsCheck2100020(data.ycoordinate)) {
      yCoordinateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Coordinates must be within the valid coordinate range.
    currentCheck = GetCheck(2100021, currentLookups, methodName, isScottish, showDebugMessages);
    if (isScottish) {
      if (includeCheck(currentCheck, isScottish) && failsCheck2100021(data.xcoordinate, true, true)) {
        xCoordinateErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      if (includeCheck(currentCheck, isScottish) && failsCheck2100021(data.ycoordinate, true, false)) {
        yCoordinateErrors.push(GetErrorMessage(currentCheck, isScottish));
      }
    } else {
      if (includeCheck(currentCheck, isScottish) && failsCheck2100021(data.xcoordinate, false, true)) {
        xCoordinateErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      if (includeCheck(currentCheck, isScottish) && failsCheck2100021(data.ycoordinate, false, false)) {
        yCoordinateErrors.push(GetErrorMessage(currentCheck, isScottish));
      }
    }

    // Ward code is too long.
    currentCheck = GetCheck(2100022, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100022(data.wardCode)) {
      wardCodeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Parish code is too long.
    currentCheck = GetCheck(2100023, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100023(data.parishCode)) {
      parishCodeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a state and State date.
    currentCheck = GetCheck(2100024, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      failsCheck2100024(data.blpuState, data.logicalStatus, isScottish, false)
    ) {
      blpuStateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    if (
      includeCheck(currentCheck, isScottish) &&
      failsCheck2100024(data.blpuStateDate, data.logicalStatus, isScottish, true)
    ) {
      blpuStateDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // State date cannot be in the future.
    currentCheck = GetCheck(2100025, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100025(data.blpuStateDate)) {
      blpuStateDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Representative point code (RPC) is invalid.
    currentCheck = GetCheck(2100026, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100026(data.rpc)) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a start date.
    currentCheck = GetCheck(2100027, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100027(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Start date cannot be in the future.
    currentCheck = GetCheck(2100028, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100028(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Start dates prior to 1753 are not allowed.
    currentCheck = GetCheck(2100029, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100029(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End date cannot be in the future.
    currentCheck = GetCheck(2100030, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100030(data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End date cannot be before the start date.
    currentCheck = GetCheck(2100031, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100031(data.startDate, data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End date supplied but BLPU logical status is not 7, 8 or 9.
    currentCheck = GetCheck(2100032, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100032(data.endDate, data.logicalStatus)) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // An RPC of 3 can no longer be submitted to GeoPlace.
    currentCheck = GetCheck(2100036, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100036(data.rpc)) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // An RPC of 5 can no longer be submitted to GeoPlace.
    currentCheck = GetCheck(2100037, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100037(data.rpc)) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // A BLPU logical status of 7, 8 or 9 requires an end date.
    currentCheck = GetCheck(2100045, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100045(data.logicalStatus, data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // The BLPU logical status is incompatible with the state.
    currentCheck = GetCheck(2100046, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100046(data.logicalStatus, data.blpuState, isScottish)) {
      logicalStatusErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // A BLPU logical status of 8 or 9 requires an end date.
    currentCheck = GetCheck(2100047, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100047(data.logicalStatus, data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // State is invalid.
    currentCheck = GetCheck(2100048, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100048(data.blpuState)) {
      blpuStateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Ward code does not exist in the lookup table.
    currentCheck = GetCheck(2100053, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100053(data.wardCode, currentLookups)) {
      wardCodeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Parish code does not exist in the lookup table.
    currentCheck = GetCheck(2100054, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100054(data.parishCode, currentLookups)) {
      parishCodeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Classification does not exist in the lookup table.
    currentCheck = GetCheck(2100055, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100055(data.blpuClass)) {
      classificationErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a state.
    currentCheck = GetCheck(2100059, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100059(data.blpuState)) {
      blpuStateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Authority is invalid.
    currentCheck = GetCheck(2100060, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100060(data.localCustodianCode)) {
      localCustodianCodeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // An approved BLPU more than a year old, can't have a classification of Unclassified.
    currentCheck = GetCheck(2100061, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      failsCheck2100061(data.logicalStatus, data.blpuClass, data.startDate)
    ) {
      classificationErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // An RPC of 9 can no longer be submitted to GeoPlace.
    currentCheck = GetCheck(2100062, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100062(data.rpc)) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Level is invalid.
    currentCheck = GetCheck(2100063, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100063(data.level)) {
      levelErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Organisation name contains unmatched brackets.
    currentCheck = GetCheck(2100065, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100065(data.organisation, data.logicalStatus)) {
      organisationErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a level.
    currentCheck = GetCheck(2100068, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100068(data.level)) {
      levelErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Where a BLPU end date is set the BLPU state must be 4 (closed).
    currentCheck = GetCheck(2100073, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100073(data.endDate, data.blpuState)) {
      blpuStateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Organisation name contains repeated punctuation.
    currentCheck = GetCheck(2100076, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100076(data.organisation)) {
      organisationErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Organisation name contains double spaces.
    currentCheck = GetCheck(2100077, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100077(data.organisation)) {
      organisationErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    if (showDebugMessages) console.log("[DEBUG] ValidateBlpuData - Finished checks");

    if (logicalStatusErrors.length > 0)
      validationErrors.push({
        field: "LogicalStatus",
        errors: logicalStatusErrors,
      });

    if (blpuStateErrors.length > 0)
      validationErrors.push({
        field: "BlpuState",
        errors: blpuStateErrors,
      });

    if (blpuStateDateErrors.length > 0)
      validationErrors.push({
        field: "BlpuStateDate",
        errors: blpuStateDateErrors,
      });

    if (rpcErrors.length > 0)
      validationErrors.push({
        field: "Rpc",
        errors: rpcErrors,
      });

    if (classificationErrors.length > 0) {
      validationErrors.push({
        field: "BlpuClass",
        errors: classificationErrors,
      });
    }

    if (organisationErrors.length > 0) {
      validationErrors.push({
        field: "Organisation",
        errors: organisationErrors,
      });
    }

    if (xCoordinateErrors.length > 0)
      validationErrors.push({
        field: "Xcoordinate",
        errors: xCoordinateErrors,
      });

    if (yCoordinateErrors.length > 0)
      validationErrors.push({
        field: "Ycoordinate",
        errors: yCoordinateErrors,
      });

    if (wardCodeErrors.length > 0)
      validationErrors.push({
        field: "WardCode",
        errors: wardCodeErrors,
      });

    if (parishCodeErrors.length > 0)
      validationErrors.push({
        field: "ParishCode",
        errors: parishCodeErrors,
      });

    if (startDateErrors.length > 0)
      validationErrors.push({
        field: "StartDate",
        errors: startDateErrors,
      });

    if (endDateErrors.length > 0)
      validationErrors.push({
        field: "EndDate",
        errors: endDateErrors,
      });

    if (localCustodianCodeErrors.length > 0)
      validationErrors.push({
        field: "LocalCustodianCode",
        errors: localCustodianCodeErrors,
      });

    if (levelErrors.length > 0)
      validationErrors.push({
        field: "Level",
        errors: levelErrors,
      });
  }

  return validationErrors;
}

/**
 * Validates a LPI record
 *
 * @param {object} data - The LPI record data that needs to be validated
 * @param {number} index - The index for the LPI record.
 * @param {object} currentLookups - The lookup context object.
 * @param {boolean} isScottish - True if the authority is a Scottish authority; otherwise false.
 * @param {boolean} isWelsh - True if the authority is a Welsh authority; otherwise false.
 * @return {array}
 */
export function ValidateLpiData(data, index, currentLookups, isScottish, isWelsh) {
  const methodName = "ValidateLpiData";
  let validationErrors = [];
  let currentCheck;
  let startDateErrors = [];
  let endDateErrors = [];
  let usrnErrors = [];
  let paoStartNumberErrors = [];
  let paoStartSuffixErrors = [];
  let paoEndNumberErrors = [];
  let paoEndSuffixErrors = [];
  let paoTextErrors = [];
  let saoStartNumberErrors = [];
  let saoStartSuffixErrors = [];
  let saoEndNumberErrors = [];
  let saoEndSuffixErrors = [];
  let saoTextErrors = [];
  let postalAddressErrors = [];
  let officialFlagErrors = [];
  let languageErrors = [];
  let postcodeRefErrors = [];
  let postTownRefErrors = [];
  let logicalStatusErrors = [];
  let subLocalityRefErrors = [];
  let levelErrors = [];

  const postTownData = currentLookups.postTowns.find((x) => x.postTownRef === data.postTownRef);
  const postcodeData = currentLookups.postcodes.find((x) => x.postcodeRef === data.postcodeRef);

  if (data) {
    // Enter a start date.
    currentCheck = GetCheck(2400007, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400007(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Start date cannot be in the future.
    currentCheck = GetCheck(2400008, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400008(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End date cannot be in the future.
    currentCheck = GetCheck(2400011, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400011(data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End date cannot be before the start date.
    currentCheck = GetCheck(2400012, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400012(data.startDate, data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // The street for the LPI does not exist.
    currentCheck = GetCheck(2400016, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400016(data.usrn, currentLookups)) {
      usrnErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // An LPI logical status of 7, 8 or 9 requires an end date.
    currentCheck = GetCheck(2400017, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400017(data.logicalStatus, data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // PAO start suffix is too long.
    currentCheck = GetCheck(2400018, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400018(data.paoStartSuffix, isWelsh)) {
      paoStartSuffixErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // PAO end suffix is too long.
    currentCheck = GetCheck(2400019, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400019(data.paoEndSuffix, isWelsh)) {
      paoEndSuffixErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // SAO start suffix is too long.
    currentCheck = GetCheck(2400020, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400020(data.saoStartSuffix, isWelsh)) {
      saoStartSuffixErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // SAO end suffix is too long.
    currentCheck = GetCheck(2400021, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400021(data.saoEndSuffix, isWelsh)) {
      saoEndSuffixErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a postal address flag.
    currentCheck = GetCheck(2400022, currentLookups, methodName, isScottish, showDebugMessages);
    if (!isScottish && includeCheck(currentCheck, isScottish) && failsCheck2400022(data.postalAddress)) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Postal address is too long.
    currentCheck = GetCheck(2400023, currentLookups, methodName, isScottish, showDebugMessages);
    if (!isScottish && includeCheck(currentCheck, isScottish) && failsCheck2400023(data.postalAddress)) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Postal address is invalid.
    currentCheck = GetCheck(2400024, currentLookups, methodName, isScottish, showDebugMessages);
    if (!isScottish && includeCheck(currentCheck, isScottish) && failsCheck2400024(data.postalAddress)) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Official address is too long.
    currentCheck = GetCheck(2400025, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400025(data.officialFlag)) {
      officialFlagErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Official address is invalid.
    currentCheck = GetCheck(2400026, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400026(data.officialFlag)) {
      officialFlagErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a language.
    currentCheck = GetCheck(2400028, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400028(data.language)) {
      languageErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Language is invalid.
    currentCheck = GetCheck(2400029, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400029(data.language, isWelsh, isScottish)) {
      languageErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Start dates prior to 1753 are not allowed.
    currentCheck = GetCheck(2400030, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400030(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End date supplied but logical status is not 8 or 9.
    currentCheck = GetCheck(2400031, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400031(data.endDate, data.logicalStatus)) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // SAO start number is invalid.
    currentCheck = GetCheck(2400032, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400032(data.saoStartNumber)) {
      saoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // SAO end number is invalid.
    currentCheck = GetCheck(2400033, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400033(data.saoEndNumber)) {
      saoEndNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // SAO end number populated but SAO start number is blank.
    currentCheck = GetCheck(2400034, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400034(data.saoStartNumber, data.saoEndNumber)) {
      saoEndNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // PAO text is too long.
    currentCheck = GetCheck(2400035, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400035(data.paoText)) {
      paoTextErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // SAO text is too long.
    currentCheck = GetCheck(2400036, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400036(data.saoText)) {
      saoTextErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // PAO start number is invalid.
    currentCheck = GetCheck(2400037, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400037(data.paoStartNumber)) {
      paoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // PAO end number is invalid.
    currentCheck = GetCheck(2400038, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400038(data.paoEndNumber)) {
      paoEndNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // PAO end number populated but PAO start number is blank.
    currentCheck = GetCheck(2400039, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400039(data.paoStartNumber, data.paoEndNumber)) {
      paoEndNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter PAO details.
    currentCheck = GetCheck(2400040, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400040(data.paoStartNumber, data.paoText)) {
      paoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // PAO and SAO text must not be the same.
    currentCheck = GetCheck(2400041, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400041(data.paoText, data.saoText)) {
      paoTextErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a USRN.
    currentCheck = GetCheck(2400042, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400042(data.usrn)) {
      usrnErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Post town is too long.
    currentCheck = GetCheck(2400044, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400044(data.postTownRef, postTownData)) {
      postTownRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Postcode is too long.
    currentCheck = GetCheck(2400045, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400045(data.postcodeRef, postcodeData)) {
      postcodeRefErrors.push(GetErrorMessage(currentCheck, isScottish));
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
        data.logicalStatus,
        isScottish ? data.postallyAddressable : data.postalAddress,
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
        isScottish ? data.postallyAddressable : data.postalAddress,
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
      failsCheck2400062(data.postalAddress, data.postTownRef, postTownData, data.postcodeRef, postcodeData)
    ) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter an LPI Logical status.
    currentCheck = GetCheck(2400064, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400064(data.logicalStatus)) {
      logicalStatusErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // LPI logical status is invalid.
    currentCheck = GetCheck(2400069, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400069(data.logicalStatus)) {
      logicalStatusErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // PAO start suffix supplied but no POA start number.
    currentCheck = GetCheck(2400073, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400073(data.paoStartSuffix, data.paoStartNumber)) {
      paoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // PAO end suffix supplied but no PAO end number.
    currentCheck = GetCheck(2400074, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400074(data.paoEndSuffix, data.paoEndNumber)) {
      paoEndNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // SAO start suffix supplied but no SAO start number.
    currentCheck = GetCheck(2400075, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400075(data.saoStartSuffix, data.saoStartNumber)) {
      saoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // SAO end suffix supplied but no SAO end number.
    currentCheck = GetCheck(2400076, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400076(data.saoEndSuffix, data.saoEndNumber)) {
      saoEndNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // SAO end number must be greater than SAO start number.
    currentCheck = GetCheck(2400077, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400077(data.saoStartNumber, data.saoEndNumber)) {
      saoEndNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // PAO end number must be greater than PAO start number.
    currentCheck = GetCheck(2400078, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400078(data.paoStartNumber, data.paoEndNumber)) {
      paoEndNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // PAO text contains an invalid character.
    currentCheck = GetCheck(2400080, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400080(data.paoText, isScottish)) {
      paoTextErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // SAO text contains an invalid character.
    currentCheck = GetCheck(2400081, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400081(data.saoText, isScottish)) {
      saoTextErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // If Postal address is 'Y' or 'L' it must have a postcode and post town.
    currentCheck = GetCheck(2400082, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      failsCheck2400082(data.postallyAddressable, data.postTownRef, postTownData, data.postcodeRef, postcodeData)
    ) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Sub-locality does not exist in the lookup table.
    currentCheck = GetCheck(2400083, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400083(data.subLocalityRef, currentLookups)) {
      subLocalityRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // An LPI logical status of 8 or 9 requires an end date.
    currentCheck = GetCheck(2400084, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400084(data.endDate, data.logicalStatus)) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Level is too long.
    currentCheck = GetCheck(2400085, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400085(data.level)) {
      levelErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a official address flag.
    currentCheck = GetCheck(2400087, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400087(data.officialFlag)) {
      officialFlagErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a postal address flag.
    currentCheck = GetCheck(2400088, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400088(data.postallyAddressable)) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Postal address is too long.
    currentCheck = GetCheck(2400089, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400089(data.postallyAddressable)) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Postal address is invalid.
    currentCheck = GetCheck(2400090, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400090(data.postallyAddressable)) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // PAO text must not contain only a number, use PAO start number for the number.
    currentCheck = GetCheck(2400095, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400095(data.paoText)) {
      paoTextErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // SAO text must not contain only a number, use SAO start number for the number.
    currentCheck = GetCheck(2400096, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400096(data.saoText)) {
      saoTextErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // PAO text begins with a space.
    currentCheck = GetCheck(2400100, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400100(data.paoText)) {
      paoTextErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Street BLPU must not have number fields populated.
    currentCheck = GetCheck(2400102, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400102(data.paoText, data.paoStartNumber)) {
      paoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Invalid characters in suffix column/s.
    currentCheck = GetCheck(2400103, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck2400103(data.paoStartSuffix)) {
      paoStartSuffixErrors.push(GetErrorMessage(currentCheck, true));
    }

    if (includeCheck(currentCheck, true) && failsCheck2400103(data.paoEndSuffix)) {
      paoEndSuffixErrors.push(GetErrorMessage(currentCheck, true));
    }

    if (includeCheck(currentCheck, true) && failsCheck2400103(data.saoStartSuffix)) {
      saoStartSuffixErrors.push(GetErrorMessage(currentCheck, true));
    }

    if (includeCheck(currentCheck, true) && failsCheck2400103(data.saoEndSuffix)) {
      saoEndSuffixErrors.push(GetErrorMessage(currentCheck, true));
    }

    // PAO and/or SAO text must not have double spaces.
    currentCheck = GetCheck(2400105, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck2400105(data.paoText)) {
      paoTextErrors.push(GetErrorMessage(currentCheck, true));
    }

    if (includeCheck(currentCheck, true) && failsCheck2400105(data.saoText)) {
      saoTextErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Street BLPU must not have sao text populated.
    currentCheck = GetCheck(2400107, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck2400107(data.paoText, data.saoText)) {
      saoTextErrors.push(GetErrorMessage(currentCheck, true));
    }

    // You must enter a street.
    currentCheck = GetCheck(2400108, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck2400108(data.usrn)) {
      usrnErrors.push(GetErrorMessage(currentCheck, true));
    }

    if (showDebugMessages) console.log("[DEBUG] ValidateLpiData - Finished checks");

    if (startDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "StartDate",
        errors: startDateErrors,
      });

    if (endDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "EndDate",
        errors: endDateErrors,
      });

    if (usrnErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "Usrn",
        errors: usrnErrors,
      });

    if (paoStartNumberErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "PaoStartNumber",
        errors: paoStartNumberErrors,
      });

    if (paoStartSuffixErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "PaoStartSuffix",
        errors: paoStartSuffixErrors,
      });

    if (paoEndNumberErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "PaoEndNumber",
        errors: paoEndNumberErrors,
      });

    if (paoEndSuffixErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "PaoEndSuffix",
        errors: paoEndSuffixErrors,
      });

    if (paoTextErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "PaoText",
        errors: paoTextErrors,
      });

    if (saoStartNumberErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SaoStartNumber",
        errors: saoStartNumberErrors,
      });

    if (saoStartSuffixErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SaoStartSuffix",
        errors: saoStartSuffixErrors,
      });

    if (saoEndNumberErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SaoEndNumber",
        errors: saoEndNumberErrors,
      });

    if (saoEndSuffixErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SaoEndSuffix",
        errors: saoEndSuffixErrors,
      });

    if (saoTextErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SaoText",
        errors: saoTextErrors,
      });

    if (postalAddressErrors.length > 0)
      validationErrors.push({
        index: index,
        field: isScottish ? "PostallyAddressable" : "PostalAddress",
        errors: postalAddressErrors,
      });

    if (officialFlagErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "OfficialFlag",
        errors: officialFlagErrors,
      });

    if (languageErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "Language",
        errors: languageErrors,
      });

    if (postcodeRefErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "PostcodeRef",
        errors: postcodeRefErrors,
      });

    if (postTownRefErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "PostTownRef",
        errors: postTownRefErrors,
      });

    if (logicalStatusErrors.length > 0)
      validationErrors.push({
        field: "LogicalStatus",
        errors: logicalStatusErrors,
      });

    if (subLocalityRefErrors.length > 0)
      validationErrors.push({
        field: "SubLocalityRef",
        errors: subLocalityRefErrors,
      });

    if (levelErrors.length > 0)
      validationErrors.push({
        field: "Level",
        errors: levelErrors,
      });
  }

  return validationErrors;
}

/**
 * Validates a provenance record
 *
 * @param {object} data - The provenance record data that needs to be validated
 * @param {number} index - The index for the provenance record.
 * @param {object} currentLookups - The lookup context object.
 * @param {boolean} isScottish - True if the authority is a Scottish authority; otherwise false.
 * @return {array}
 */
export function ValidateProvenanceData(data, index, currentLookups, isScottish) {
  const methodName = "ValidateProvenanceData";
  let validationErrors = [];
  let currentCheck;
  let provenanceCodeErrors = [];
  let startDateErrors = [];
  let endDateErrors = [];
  let annotationErrors = [];

  if (data) {
    // Enter a provenance code.
    currentCheck = GetCheck(2200009, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2200009(data.provenanceCode)) {
      provenanceCodeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Provenance code is invalid.
    currentCheck = GetCheck(2200010, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2200010(data.provenanceCode)) {
      provenanceCodeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a start date.
    currentCheck = GetCheck(2200011, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2200011(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Start date cannot be in the future.
    currentCheck = GetCheck(2200012, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2200012(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End date cannot be in the future.
    currentCheck = GetCheck(2200014, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2200014(data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End date cannot be before the start date.
    currentCheck = GetCheck(2200015, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2200015(data.startDate, data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Annotation is too long.
    currentCheck = GetCheck(2200019, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2200019(data.annotation)) {
      annotationErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Start dates prior to 1753 are not allowed.
    currentCheck = GetCheck(2200020, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2200020(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    if (showDebugMessages) console.log("[DEBUG] ValidateProvenanceData - Finished checks");

    if (provenanceCodeErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ProvenanceCode",
        errors: provenanceCodeErrors,
      });

    if (startDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "StartDate",
        errors: startDateErrors,
      });

    if (endDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "EndDate",
        errors: endDateErrors,
      });

    if (annotationErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "Annotation",
        errors: annotationErrors,
      });
  }

  return validationErrors;
}

/**
 * Validates an application cross reference record
 *
 * @param {object} data - The application cross reference record data that needs to be validated
 * @param {number} index - The index for the application cross reference record.
 * @param {object} currentLookups - The lookup context object.
 * @param {boolean} isScottish - True if the authority is a Scottish authority; otherwise false.
 * @return {array}
 */
export function ValidateCrossRefData(data, index, currentLookups, isScottish) {
  const methodName = "ValidateCrossRefData";
  let validationErrors = [];
  let currentCheck;
  let startDateErrors = [];
  let endDateErrors = [];
  let crossReferenceErrors = [];
  let sourceIdErrors = [];
  let sourceErrors = [];

  if (data) {
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

    // End date cannot be in the future.
    currentCheck = GetCheck(2300011, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2300011(data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End date cannot be before the start date.
    currentCheck = GetCheck(2300012, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2300012(data.startDate, data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
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

    // Source is too long.
    currentCheck = GetCheck(2300017, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2300017(data.source)) {
      sourceErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Source does not exist in the lookup table or is marked as historic/disabled.
    currentCheck = GetCheck(2300025, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2300025(data.sourceId, currentLookups)) {
      sourceErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Start dates prior to 1753 are not allowed.
    currentCheck = GetCheck(2300033, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.startDate && isPriorTo1753(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    if (showDebugMessages) console.log("[DEBUG] ValidateCrossRefData - Finished checks");

    if (startDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "StartDate",
        errors: startDateErrors,
      });

    if (endDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "EndDate",
        errors: endDateErrors,
      });

    if (crossReferenceErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "CrossReference",
        errors: crossReferenceErrors,
      });

    if (sourceIdErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SourceId",
        errors: sourceIdErrors,
      });

    if (sourceErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "Source",
        errors: sourceErrors,
      });
  }

  return validationErrors;
}

/**
 * Validates an organisation record
 *
 * @param {object} data - The organisation record data that needs to be validated
 * @param {number} index - The index for the organisation record.
 * @param {object} currentLookups - The lookup context object.
 * @return {array}
 */
export function ValidateOrganisationData(data, index, currentLookups) {
  const methodName = "ValidateOrganisationData";
  let validationErrors = [];
  let currentCheck;
  let startDateErrors = [];
  let endDateErrors = [];
  let organisationErrors = [];
  let legalNameErrors = [];

  if (data) {
    // Start date cannot be in the future.
    currentCheck = GetCheck(3100008, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck3100008(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // End date cannot be in the future.
    currentCheck = GetCheck(3100010, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck3100010(data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // End date cannot be before the start date.
    currentCheck = GetCheck(3100013, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck3100013(data.startDate, data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Organisation is too long.
    currentCheck = GetCheck(3100014, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck3100014(data.organisation)) {
      organisationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Legal name is too long.
    currentCheck = GetCheck(3100015, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck3100015(data.legalName)) {
      legalNameErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter an organisation.
    currentCheck = GetCheck(3100016, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck3100016(data.organisation)) {
      organisationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Organisation contains an invalid character.
    currentCheck = GetCheck(3100017, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck3100017(data.organisation)) {
      organisationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Organisation cannot start with a space.
    currentCheck = GetCheck(3100019, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck3100019(data.organisation)) {
      organisationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Organisation name contains repeated punctuation.
    currentCheck = GetCheck(3100021, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck3100021(data.organisation)) {
      organisationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Organisation name contains double spaces.
    currentCheck = GetCheck(3100022, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck3100022(data.organisation)) {
      organisationErrors.push(GetErrorMessage(currentCheck, true));
    }

    if (showDebugMessages) console.log("[DEBUG] ValidateOrganisationData - Finished checks");

    if (startDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "StartDate",
        errors: startDateErrors,
      });

    if (endDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "EndDate",
        errors: endDateErrors,
      });

    if (organisationErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "Organisation",
        errors: organisationErrors,
      });

    if (legalNameErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "LegalName",
        errors: legalNameErrors,
      });
  }

  return validationErrors;
}

/**
 * Validates a classification record
 *
 * @param {object} data - The classification record data that needs to be validated
 * @param {number} index - The index for the classification record.
 * @param {object} currentLookups - The lookup context object.
 * @return {array}
 */
export function ValidateClassificationData(data, index, currentLookups) {
  const methodName = "ValidateClassificationData";
  let validationErrors = [];
  let currentCheck;
  let blpuClassErrors = [];
  let startDateErrors = [];
  let endDateErrors = [];
  let classificationSchemeErrors = [];

  if (data) {
    // Enter a classification code.
    currentCheck = GetCheck(3200008, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck3200008(data.blpuClass)) {
      blpuClassErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Start date cannot be in the future.
    currentCheck = GetCheck(3200009, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck3200009(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // End date cannot be in the future.
    currentCheck = GetCheck(3200011, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck3200011(data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // End date cannot be before the start date.
    currentCheck = GetCheck(3200014, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck3200014(data.startDate, data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Scheme is too long.
    currentCheck = GetCheck(3200015, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck3200015(data.classificationScheme)) {
      classificationSchemeErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a scheme.
    currentCheck = GetCheck(3200017, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck3200017(data.classificationScheme)) {
      classificationSchemeErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a start date.
    currentCheck = GetCheck(3200018, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck3200018(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Commercial tertiary classification required for BLPU.
    currentCheck = GetCheck(3200022, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck3200022(data.blpuClass)) {
      blpuClassErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Residential tertiary classification required for BLPU.
    currentCheck = GetCheck(3200023, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck3200023(data.blpuClass)) {
      blpuClassErrors.push(GetErrorMessage(currentCheck, true));
    }

    if (showDebugMessages) console.log("[DEBUG] ValidateOrganisationData - Finished checks");

    if (blpuClassErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "BlpuClass",
        errors: blpuClassErrors,
      });

    if (startDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "StartDate",
        errors: startDateErrors,
      });

    if (endDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "EndDate",
        errors: endDateErrors,
      });

    if (classificationSchemeErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ClassificationScheme",
        errors: classificationSchemeErrors,
      });
  }

  return validationErrors;
}

/**
 * Validates a successor cross reference record
 *
 * @param {object} data - The successor cross reference record data that needs to be validated
 * @param {number} index - The index for the successor cross reference record.
 * @param {object} currentLookups - The lookup context object.
 * @return {array}
 */
export function ValidateSuccessorCrossRefData(data, index, currentLookups) {
  const methodName = "ValidateSuccessorCrossRefData";
  let validationErrors = [];
  let currentCheck;
  let successorErrors = [];
  let startDateErrors = [];
  let endDateErrors = [];
  let predecessorErrors = [];

  if (data) {
    // Enter a successor.
    currentCheck = GetCheck(3000004, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck3000004(data.successor)) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Start date cannot be in the future.
    currentCheck = GetCheck(3000008, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck3000008(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // End date cannot be in the future.
    currentCheck = GetCheck(3000009, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck3000009(data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // End date cannot be before the start date.
    currentCheck = GetCheck(3000010, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck3000010(data.startDate, data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a predecessor.
    currentCheck = GetCheck(3000012, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && failsCheck3000012(data.predecessor)) {
      predecessorErrors.push(GetErrorMessage(currentCheck, true));
    }

    if (showDebugMessages) console.log("[DEBUG] ValidateSuccessorCrossRefData - Finished checks");

    if (successorErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "Successor",
        errors: successorErrors,
      });

    if (startDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "StartDate",
        errors: startDateErrors,
      });

    if (endDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "EndDate",
        errors: endDateErrors,
      });

    if (predecessorErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "Predecessor",
        errors: predecessorErrors,
      });
  }

  return validationErrors;
}

/**
 * Validates a property note record
 *
 * @param {object} data - The property note record data that needs to be validated
 * @param {number} index - The index for the property note record.
 * @param {object} currentLookups The lookup context object.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @return {array|null} Array of validation errors found, if any.
 */
export function ValidatePropertyNoteData(data, index, currentLookups, isScottish) {
  const methodName = "ValidatePropertyNoteData";
  let validationErrors = [];
  let currentCheck;
  let noteErrors = [];

  if (data) {
    // Note does not exist.
    currentCheck = GetCheck(7100005, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck7100005(data.note)) {
      noteErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    if (showDebugMessages) console.log("[DEBUG] ValidatePropertyNoteData - Finished checks");

    if (noteErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "Note",
        errors: noteErrors,
      });
  }

  return validationErrors;
}

/**
 * Validates the data returned from the multi-edit logical status dialog.
 *
 * @param {object} data The data that needs to be validated
 * @param {object} currentLookups The lookup context object.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @return {array}
 */
export function ValidateMultiEditLogicalStatus(data, currentLookups, isScottish) {
  const methodName = "ValidateMultiEditLogicalStatus";
  let validationErrors = [];
  let currentCheck;
  let blpuStateErrors = [];
  let rpcErrors = [];
  let postalAddressErrors = [];
  let officialFlagErrors = [];
  let postcodeRefErrors = [];
  let postTownRefErrors = [];

  const postTownData = currentLookups.postTowns.find((x) => x.postTownRef === data.postTownRef);
  const postcodeData = currentLookups.postcodes.find((x) => x.postcodeRef === data.postcodeRef);

  if (data) {
    // State is incompatible with the BLPU logical status.
    currentCheck = GetCheck(2100011, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100011(data.logicalStatus, data.blpuState, isScottish)) {
      blpuStateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // The state must be between 1 and 7.
    currentCheck = GetCheck(2100012, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100012(data.blpuState)) {
      blpuStateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a representative point code (RPC).
    currentCheck = GetCheck(2100014, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100014(data.rpc)) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Representative point code (RPC) is invalid.
    currentCheck = GetCheck(2100026, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100026(data.rpc)) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // An RPC of 3 can no longer be submitted to GeoPlace.
    currentCheck = GetCheck(2100036, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100036(data.rpc)) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // An RPC of 5 can no longer be submitted to GeoPlace.
    currentCheck = GetCheck(2100037, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100037(data.rpc)) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // State is invalid.
    currentCheck = GetCheck(2100048, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100048(data.blpuState)) {
      blpuStateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a state.
    currentCheck = GetCheck(2100059, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100059(data.blpuState)) {
      blpuStateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // An RPC of 9 can no longer be submitted to GeoPlace.
    currentCheck = GetCheck(2100062, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2100062(data.rpc)) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Postal address is too long.
    currentCheck = GetCheck(2400023, currentLookups, methodName, isScottish, showDebugMessages);
    if (!isScottish && includeCheck(currentCheck, isScottish) && failsCheck2400023(data.postalAddress)) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Postal address is invalid.
    currentCheck = GetCheck(2400024, currentLookups, methodName, isScottish, showDebugMessages);
    if (!isScottish && includeCheck(currentCheck, isScottish) && failsCheck2400024(data.postalAddress)) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Official address is too long.
    currentCheck = GetCheck(2400025, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400025(data.officialAddress)) {
      officialFlagErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Official address is invalid.
    currentCheck = GetCheck(2400026, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && failsCheck2400026(data.officialFlag)) {
      officialFlagErrors.push(GetErrorMessage(currentCheck, isScottish));
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
        data.logicalStatus,
        isScottish ? data.postallyAddressable : data.postalAddress,
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
        isScottish ? data.postallyAddressable : data.postalAddress,
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
      failsCheck2400062(data.postalAddress, data.postTownRef, postTownData, data.postcodeRef, postcodeData)
    ) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    if (postalAddressErrors.length > 0)
      validationErrors.push({
        field: "PostalAddress",
        errors: postalAddressErrors,
      });

    if (officialFlagErrors.length > 0)
      validationErrors.push({
        field: "OfficialFlag",
        errors: officialFlagErrors,
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
  }

  return validationErrors;
}
