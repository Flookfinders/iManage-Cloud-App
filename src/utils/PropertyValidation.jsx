//#region header */
/**************************************************************************************************
//
//  Description: Property Data Form
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
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

import {
  isFutureDate,
  isPriorTo1753,
  isEndBeforeStart,
  isOlderThanYear,
  includeCheck,
  GetErrorMessage,
  GetCheck,
  bracketValidator,
  characterSetValidator,
} from "./HelperUtils";

import BLPULogicalStatus from "../data/BLPULogicalStatus";
import BLPUState from "../data/BLPUState";
import RepresentativePointCode from "../data/RepresentativePointCode";
import BLPUClassification from "../data/BLPUClassification";
import BLPUProvenance from "../data/BLPUProvenance";
import PostallyAddressable from "../data/PostallyAddressable";
import OfficialAddress from "../data/OfficialAddress";
import DETRCodes from "../data/DETRCodes";
import LPILogicalStatus from "../data/LPILogicalStatus";

const showDebugMessages = false;

/**
 * Validates a BLPU record
 *
 * @param {object} data - The BLPU record data that needs to be validated
 * @param {object} currentLookups - The lookup context object.
 * @param {boolean} isScottish - True if the authority is a Scottish authority; otherwise false.
 * @return {array}
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
    if (includeCheck(currentCheck, isScottish) && !data.logicalStatus) {
      logicalStatusErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // BLPU logical status is invalid.
    currentCheck = GetCheck(2100009, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.logicalStatus &&
      !BLPULogicalStatus.find((x) => x.id === data.logicalStatus)
    ) {
      logicalStatusErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // State is incompatible with the BLPU logical status.
    currentCheck = GetCheck(2100011, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.logicalStatus &&
      ((!isScottish &&
        ((data.logicalStatus === 1 && data.blpuState && ![1, 2, 3].includes(data.blpuState)) ||
          (data.logicalStatus === 5 && (!data.blpuState || ![1, 2, 3, 4, 6].includes(data.blpuState))) ||
          (data.logicalStatus === 6 && (!data.blpuState || ![1, 5, 6, 7].includes(data.blpuState))) ||
          (data.logicalStatus === 7 && data.blpuState && ![1, 2, 3, 4, 6].includes(data.blpuState)) ||
          (data.logicalStatus === 8 && data.blpuState && ![4, 7].includes(data.blpuState)) ||
          (data.logicalStatus === 9 && data.blpuState && ![1, 2, 3, 4, 5, 6, 7].includes(data.blpuState)))) ||
        (isScottish &&
          ((data.logicalStatus === 1 &&
            ((!data.blpuState && data.blpuState !== 0) || ![0, 1, 2, 3].includes(data.blpuState))) ||
            (data.logicalStatus === 6 && !data.blpuState && data.blpuState !== 0) ||
            (data.logicalStatus === 8 && ((!data.blpuState && data.blpuState !== 0) || data.blpuState !== 4)) ||
            (data.logicalStatus === 9 &&
              (data.blpuState || data.blpuState === 0) &&
              ![0, 1, 2, 3, 4].includes(data.blpuState)))))
    ) {
      blpuStateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // The state must be between 1 and 7.
    currentCheck = GetCheck(2100012, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.blpuState && ![1, 2, 3, 4, 5, 6, 7].includes(data.blpuState)) {
      blpuStateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a representative point code (RPC).
    currentCheck = GetCheck(2100014, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.rpc) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Classification is too long.
    currentCheck = GetCheck(2100015, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.blpuClass && data.blpuClass.length > 4) {
      classificationErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a classification.
    currentCheck = GetCheck(2100016, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.blpuClass) {
      classificationErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Organisation is too long.
    currentCheck = GetCheck(2100018, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.organisation && data.organisation.length > 100) {
      organisationErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Organisation contains an invalid character.
    currentCheck = GetCheck(2100019, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.organisation &&
      !characterSetValidator(data.organisation, `${isScottish ? "OneScotlandLookup" : "GeoPlaceProperty1"}`)
    ) {
      organisationErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter coordinates.
    currentCheck = GetCheck(2100020, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.xcoordinate) {
      xCoordinateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    if (includeCheck(currentCheck, isScottish) && !data.ycoordinate) {
      yCoordinateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Coordinates must be within the valid coordinate range.
    currentCheck = GetCheck(2100021, currentLookups, methodName, isScottish, showDebugMessages);
    if (isScottish) {
      if (
        includeCheck(currentCheck, isScottish) &&
        data.xcoordinate &&
        (data.xcoordinate < 1 || data.xcoordinate > 660000)
      ) {
        xCoordinateErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      if (
        includeCheck(currentCheck, isScottish) &&
        data.ycoordinate &&
        (data.ycoordinate < 1 || data.ycoordinate > 1300000)
      ) {
        yCoordinateErrors.push(GetErrorMessage(currentCheck, isScottish));
      }
    } else {
      if (
        includeCheck(currentCheck, isScottish) &&
        data.xcoordinate &&
        (data.xcoordinate < 80000 || data.xcoordinate > 656100)
      ) {
        xCoordinateErrors.push(GetErrorMessage(currentCheck, isScottish));
      }

      if (
        includeCheck(currentCheck, isScottish) &&
        data.ycoordinate &&
        (data.ycoordinate < 5000 || data.ycoordinate > 657700)
      ) {
        yCoordinateErrors.push(GetErrorMessage(currentCheck, isScottish));
      }
    }

    // Ward code is too long.
    currentCheck = GetCheck(2100022, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.wardCode && data.wardCode.length > 10) {
      wardCodeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Parish code is too long.
    currentCheck = GetCheck(2100023, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.parishCode && data.parishCode.length > 10) {
      parishCodeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a state and State date.
    currentCheck = GetCheck(2100024, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      (!isScottish || (isScottish && data.logicalStatus < 9)) &&
      !data.blpuState &&
      data.blpuState !== 0
    ) {
      blpuStateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    if (
      includeCheck(currentCheck, isScottish) &&
      (!isScottish || (isScottish && data.logicalStatus < 9)) &&
      (data.blpuState === undefined || data.blpuState === null)
    ) {
      blpuStateDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // State date cannot be in the future.
    currentCheck = GetCheck(2100025, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.blpuStateDate && isFutureDate(data.blpuStateDate)) {
      blpuStateDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Representative point code (RPC) is invalid.
    currentCheck = GetCheck(2100026, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.rpc && !RepresentativePointCode.find((x) => x.id === data.rpc)) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a start date.
    currentCheck = GetCheck(2100027, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.startDate) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Start date cannot be in the future.
    currentCheck = GetCheck(2100028, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.startDate && isFutureDate(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Start dates prior to 1753 are not allowed.
    currentCheck = GetCheck(2100029, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.startDate && isPriorTo1753(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End date cannot be in the future.
    currentCheck = GetCheck(2100030, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.endDate && isFutureDate(data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End date cannot be before the start date.
    currentCheck = GetCheck(2100031, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.startDate &&
      data.endDate &&
      isEndBeforeStart(data.startDate, data.endDate)
    ) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End date supplied but BLPU logical status is not 7, 8 or 9.
    currentCheck = GetCheck(2100032, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.endDate &&
      data.logicalStatus &&
      ![7, 8, 9].includes(data.logicalStatus)
    ) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // An RPC of 3 can no longer be submitted to GeoPlace.
    currentCheck = GetCheck(2100036, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.rpc && data.rpc === 3) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // An RPC of 5 can no longer be submitted to GeoPlace.
    currentCheck = GetCheck(2100037, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.rpc && data.rpc === 5) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // A BLPU logical status of 7, 8 or 9 requires an end date.
    currentCheck = GetCheck(2100045, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.logicalStatus &&
      [7, 8, 9].includes(data.logicalStatus) &&
      !data.endDate
    ) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // The BLPU logical status is incompatible with the state.
    currentCheck = GetCheck(2100046, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      ((!isScottish &&
        ((data.logicalStatus === 1 && data.blpuState && ![1, 2, 3].includes(data.blpuState)) ||
          (data.logicalStatus === 5 && (!data.blpuState || ![1, 2, 3, 4, 6].includes(data.blpuState))) ||
          (data.logicalStatus === 6 && (!data.blpuState || ![1, 5, 6, 7].includes(data.blpuState))) ||
          (data.logicalStatus === 7 && data.blpuState && ![1, 2, 3, 4, 6].includes(data.blpuState)) ||
          (data.logicalStatus === 8 && data.blpuState && ![4, 7].includes(data.blpuState)) ||
          (data.logicalStatus === 9 && data.blpuState && ![1, 2, 3, 4, 5, 6, 7].includes(data.blpuState)))) ||
        (isScottish &&
          ((data.logicalStatus === 1 && (!data.blpuState || ![0, 1, 2, 3].includes(data.blpuState))) ||
            (data.logicalStatus === 6 && (!data.blpuState || data.blpuState !== 0)) ||
            (data.logicalStatus === 8 && (!data.blpuState || data.blpuState !== 4)) ||
            (data.logicalStatus === 9 && data.blpuState && ![0, 1, 2, 3, 4].includes(data.blpuState)))))
    ) {
      logicalStatusErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // A BLPU logical status of 8 or 9 requires an end date.
    currentCheck = GetCheck(2100047, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.logicalStatus &&
      [8, 9].includes(data.logicalStatus) &&
      !data.endDate
    ) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // State is invalid.
    currentCheck = GetCheck(2100048, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.blpuState && !BLPUState.find((x) => x.id === data.blpuState)) {
      blpuStateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Ward code does not exist in the lookup table.
    currentCheck = GetCheck(2100053, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.wardCode &&
      !currentLookups.wards.find((x) => x.wardCode === data.wardCode)
    ) {
      wardCodeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Parish code does not exist in the lookup table.
    currentCheck = GetCheck(2100054, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.parishCode &&
      !currentLookups.parishes.find((x) => x.parishCode === data.parishCode)
    ) {
      parishCodeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Classification does not exist in the lookup table.
    currentCheck = GetCheck(2100055, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.blpuClass &&
      !BLPUClassification.find((x) => x.id === data.blpuClass)
    ) {
      classificationErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a state.
    currentCheck = GetCheck(2100059, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      !data.blpuState &&
      (data.blpuState === undefined || data.blpuState === null)
    ) {
      blpuStateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Authority is invalid.
    currentCheck = GetCheck(2100060, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.localCustodianCode &&
      !DETRCodes.find((x) => x.id === data.localCustodianCode)
    ) {
      localCustodianCodeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // An approved BLPU more than a year old, can't have a classification of Unclassified.
    currentCheck = GetCheck(2100061, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.logicalStatus &&
      data.logicalStatus === 1 &&
      data.blpuClass &&
      data.blpuClass === "U" &&
      data.startDate &&
      isOlderThanYear(data.startDate)
    ) {
      classificationErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // An RPC of 9 can no longer be submitted to GeoPlace.
    currentCheck = GetCheck(2100062, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.rpc && data.rpc === 9) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Level is invalid.
    currentCheck = GetCheck(2100063, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.level && (data.level < 0.0 || data.level > 99.9)) {
      levelErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Organisation name contains unmatched brackets.
    currentCheck = GetCheck(2100065, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.organisation &&
      [1, 6].includes(data.logicalStatus) &&
      !bracketValidator(data.organisation)
    ) {
      organisationErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a level.
    currentCheck = GetCheck(2100068, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.level && data.level !== 0) {
      levelErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Where a BLPU end date is set the BLPU state must be 4 (closed).
    currentCheck = GetCheck(2100073, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.endDate && data.blpuState && data.blpuState !== 4) {
      blpuStateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Organisation name contains repeated punctuation.
    currentCheck = GetCheck(2100076, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.organisation &&
      !!/[^a-z0-9](?=[^a-z0-9])/gi.test(data.organisation.replace(/\s+/g, ""))
    ) {
      organisationErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Organisation name contains double spaces.
    currentCheck = GetCheck(2100077, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.organisation && data.organisation.includes("  ")) {
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
    if (includeCheck(currentCheck, isScottish) && !data.startDate) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Start date cannot be in the future.
    currentCheck = GetCheck(2400008, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.startDate && isFutureDate(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End date cannot be in the future.
    currentCheck = GetCheck(2400011, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.endDate && isFutureDate(data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End date cannot be before the start date.
    currentCheck = GetCheck(2400012, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.startDate &&
      data.endDate &&
      isEndBeforeStart(data.startDate, data.endDate)
    ) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // The street for the LPI does not exist.
    currentCheck = GetCheck(2400016, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.usrn &&
      !currentLookups.streetDescriptors.find((x) => x.usrn === data.usrn)
    ) {
      usrnErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // An LPI logical status of 7, 8 or 9 requires an end date.
    currentCheck = GetCheck(2400017, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.logicalStatus &&
      [7, 8, 9].includes(data.logicalStatus) &&
      !data.endDate
    ) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // PAO start suffix is too long.
    currentCheck = GetCheck(2400018, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.paoStartSuffix &&
      ((isWelsh && data.paoStartSuffix.length > 2) || (!isWelsh && data.paoStartSuffix.length > 1))
    ) {
      paoStartSuffixErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // PAO end suffix is too long.
    currentCheck = GetCheck(2400019, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.paoEndSuffix &&
      ((isWelsh && data.paoEndSuffix.length > 2) || (!isWelsh && data.paoEndSuffix.length > 1))
    ) {
      paoEndSuffixErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // SAO start suffix is too long.
    currentCheck = GetCheck(2400020, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.saoStartSuffix &&
      ((isWelsh && data.saoStartSuffix.length > 2) || (!isWelsh && data.saoStartSuffix.length > 1))
    ) {
      saoStartSuffixErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // SAO end suffix is too long.
    currentCheck = GetCheck(2400021, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.saoEndSuffix &&
      ((isWelsh && data.saoEndSuffix.length > 2) || (!isWelsh && data.saoEndSuffix.length > 1))
    ) {
      saoEndSuffixErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a postal address flag.
    currentCheck = GetCheck(2400022, currentLookups, methodName, isScottish, showDebugMessages);
    if (!isScottish && includeCheck(currentCheck, isScottish) && !data.postalAddress) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Postal address is too long.
    currentCheck = GetCheck(2400023, currentLookups, methodName, isScottish, showDebugMessages);
    if (!isScottish && includeCheck(currentCheck, isScottish) && data.postalAddress && data.postalAddress.length > 1) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Postal address is invalid.
    currentCheck = GetCheck(2400024, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      !isScottish &&
      includeCheck(currentCheck, isScottish) &&
      data.postalAddress &&
      !PostallyAddressable.find((x) => x.id === data.postalAddress)
    ) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Official address is too long.
    currentCheck = GetCheck(2400025, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.officialFlag && data.officialFlag.length > 1) {
      officialFlagErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Official address is invalid.
    currentCheck = GetCheck(2400026, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.officialFlag &&
      !OfficialAddress.find((x) => x.id === data.officialFlag)
    ) {
      officialFlagErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a language.
    currentCheck = GetCheck(2400028, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.language) {
      languageErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Language is invalid.
    currentCheck = GetCheck(2400029, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.language &&
      ((isWelsh && !["ENG", "CYM"].includes(data.language)) ||
        (isScottish && !["ENG", "GAE"].includes(data.language)) ||
        (!isWelsh && !isScottish && data.language !== "ENG"))
    ) {
      languageErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Start dates prior to 1753 are not allowed.
    currentCheck = GetCheck(2400030, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.startDate && isPriorTo1753(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End date supplied but logical status is not 8 or 9.
    currentCheck = GetCheck(2400031, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.endDate &&
      data.logicalStatus &&
      ![7, 8, 9].includes(data.logicalStatus)
    ) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // SAO start number is invalid.
    currentCheck = GetCheck(2400032, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.saoStartNumber &&
      (data.saoStartNumber < 0 || data.saoStartNumber > 9999)
    ) {
      saoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // SAO end number is invalid.
    currentCheck = GetCheck(2400033, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.saoEndNumber &&
      (data.saoEndNumber < 0 || data.saoEndNumber > 9999)
    ) {
      saoEndNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // SAO end number populated but SAO start number is blank.
    currentCheck = GetCheck(2400034, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.saoStartNumber && data.saoEndNumber) {
      saoEndNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // PAO text is too long.
    currentCheck = GetCheck(2400035, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.paoText && data.paoText.length > 90) {
      paoTextErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // SAO text is too long.
    currentCheck = GetCheck(2400036, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.saoText && data.saoText.length > 90) {
      saoTextErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // PAO start number is invalid.
    currentCheck = GetCheck(2400037, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.paoStartNumber &&
      (data.paoStartNumber < 0 || data.paoStartNumber > 9999)
    ) {
      paoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // PAO end number is invalid.
    currentCheck = GetCheck(2400038, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.paoEndNumber &&
      (data.paoEndNumber < 0 || data.paoEndNumber > 9999)
    ) {
      paoEndNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // PAO end number populated but PAO start number is blank.
    currentCheck = GetCheck(2400039, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.paoStartNumber && data.paoEndNumber) {
      paoEndNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter PAO details.
    currentCheck = GetCheck(2400040, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.paoStartNumber && !data.paoText) {
      paoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // PAO and SAO text must not be the same.
    currentCheck = GetCheck(2400041, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.paoText &&
      data.saoText &&
      data.paoText.toLowerCase() === data.saoText.toLowerCase()
    ) {
      paoTextErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a USRN.
    currentCheck = GetCheck(2400042, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.usrn) {
      usrnErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Post town is too long.
    currentCheck = GetCheck(2400044, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.postTownRef &&
      postTownData &&
      postTownData.postTown.length > 30
    ) {
      postTownRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Postcode is too long.
    currentCheck = GetCheck(2400045, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.postcodeRef &&
      postcodeData &&
      postcodeData.postcode.length > 8
    ) {
      postcodeRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

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

    // Postal address of 'N' must not have a postcode or post town.
    currentCheck = GetCheck(2400060, currentLookups, methodName, isScottish, showDebugMessages);
    if (isScottish) {
      if (
        includeCheck(currentCheck, isScottish) &&
        data.logicalStatus &&
        data.logicalStatus !== 6 &&
        data.postallyAddressable &&
        data.postallyAddressable === "N" &&
        (data.postTownRef || data.postcodeRef)
      ) {
        postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
      }
    } else {
      if (
        includeCheck(currentCheck, isScottish) &&
        data.logicalStatus &&
        data.logicalStatus !== 6 &&
        data.postalAddress &&
        data.postalAddress === "N" &&
        (data.postTownRef || data.postcodeRef)
      ) {
        postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
      }
    }

    // Postal address of 'Y', 'A' or 'L' must have a postcode and post town.
    currentCheck = GetCheck(2400061, currentLookups, methodName, isScottish, showDebugMessages);
    if (isScottish) {
      if (
        includeCheck(currentCheck, isScottish) &&
        data.postallyAddressable &&
        ["Y", "L"].includes(data.postallyAddressable) &&
        (!data.postTownRef || !data.postcodeRef)
      ) {
        postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
      }
    } else {
      if (
        includeCheck(currentCheck, isScottish) &&
        data.postalAddress &&
        ["Y", "A", "L"].includes(data.postalAddress) &&
        (!data.postTownRef || !data.postcodeRef)
      ) {
        postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
      }
    }

    // Postal address of 'P' must have a postcode and a post town.
    currentCheck = GetCheck(2400062, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      !isScottish &&
      includeCheck(currentCheck, isScottish) &&
      data.postalAddress &&
      data.postalAddress === "P" &&
      (!data.postTownRef || !data.postcodeRef)
    ) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter an LPI Logical status.
    currentCheck = GetCheck(2400064, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.logicalStatus) {
      logicalStatusErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // LPI logical status is invalid.
    currentCheck = GetCheck(2400069, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.logicalStatus &&
      !LPILogicalStatus.find((x) => x.id === data.logicalStatus)
    ) {
      logicalStatusErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // PAO start suffix supplied but no POA start number.
    currentCheck = GetCheck(2400073, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.paoStartSuffix && !data.paoStartNumber) {
      paoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // PAO end suffix supplied but no PAO end number.
    currentCheck = GetCheck(2400074, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.paoEndSuffix && !data.paoEndNumber) {
      paoEndNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // SAO start suffix supplied but no SAO start number.
    currentCheck = GetCheck(2400075, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.saoStartSuffix && !data.saoStartNumber) {
      saoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // SAO end suffix supplied but no SAO end number.
    currentCheck = GetCheck(2400076, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.saoEndSuffix && !data.saoEndNumber) {
      saoEndNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // SAO end number must be greater than SAO start number.
    currentCheck = GetCheck(2400077, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.saoStartNumber &&
      data.saoEndNumber &&
      Number(data.saoStartNumber) > Number(data.saoEndNumber)
    ) {
      saoEndNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // PAO end number must be greater than PAO start number.
    currentCheck = GetCheck(2400078, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.paoStartNumber &&
      data.paoEndNumber &&
      Number(data.paoStartNumber) > Number(data.paoEndNumber)
    ) {
      paoEndNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // PAO text contains an invalid character.
    currentCheck = GetCheck(2400080, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.paoText &&
      !characterSetValidator(data.paoText, `${isScottish ? "OneScotlandProperty" : "GeoPlaceProperty2"}`)
    ) {
      paoTextErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // SAO text contains an invalid character.
    currentCheck = GetCheck(2400081, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.saoText &&
      !characterSetValidator(data.saoText, `${isScottish ? "OneScotlandProperty" : "GeoPlaceProperty2"}`)
    ) {
      saoTextErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // If Postal address is 'Y' or 'L' it must have a postcode and post town.
    currentCheck = GetCheck(2400082, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.postallyAddressable &&
      ["Y", "L"].includes(data.postallyAddressable) &&
      (!data.postTownRef || !data.postcodeRef)
    ) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Sub-locality does not exist in the lookup table.
    currentCheck = GetCheck(2400083, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.subLocalityRef &&
      !currentLookups.subLocalities.find((x) => x.subLocalityRef === data.subLocalityRef)
    ) {
      subLocalityRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // An LPI logical status of 8 or 9 requires an end date.
    currentCheck = GetCheck(2400084, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      !data.endDate &&
      data.logicalStatus &&
      [8, 9].includes(data.logicalStatus)
    ) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Level is too long.
    currentCheck = GetCheck(2400085, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.level && data.level.length > 30) {
      levelErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a official address flag.
    currentCheck = GetCheck(2400087, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.officialFlag) {
      officialFlagErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a postal address flag.
    currentCheck = GetCheck(2400088, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.postallyAddressable) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Postal address is too long.
    currentCheck = GetCheck(2400089, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.postallyAddressable && data.postallyAddressable.length > 1) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Postal address is invalid.
    currentCheck = GetCheck(2400090, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.postallyAddressable &&
      !["Y", "L", "N"].includes(data.postallyAddressable)
    ) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // PAO text must not contain only a number, use PAO start number for the number.
    currentCheck = GetCheck(2400095, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.paoText &&
      !isNaN(data.paoText) &&
      !isNaN(parseFloat(data.paoText))
    ) {
      paoTextErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // SAO text must not contain only a number, use SAO start number for the number.
    currentCheck = GetCheck(2400096, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.saoText &&
      !isNaN(data.saoText) &&
      !isNaN(parseFloat(data.saoText))
    ) {
      saoTextErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // PAO text begins with a space.
    currentCheck = GetCheck(2400100, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.paoText && data.paoText[0] === " ") {
      paoTextErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Street BLPU must not have number fields populated.
    currentCheck = GetCheck(2400102, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.paoText &&
      data.paoText.toLowerCase() === "street record" &&
      data.paoStartNumber
    ) {
      paoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Invalid characters in suffix column/s.
    currentCheck = GetCheck(2400103, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, true) &&
      data.paoStartSuffix &&
      !characterSetValidator(data.paoStartSuffix, "GeoPlaceAZOnly")
    ) {
      paoStartSuffixErrors.push(GetErrorMessage(currentCheck, true));
    }

    if (
      includeCheck(currentCheck, true) &&
      data.paoEndSuffix &&
      !characterSetValidator(data.paoEndSuffix, "GeoPlaceAZOnly")
    ) {
      paoEndSuffixErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Pao and/or sao text must not have double spaces.
    currentCheck = GetCheck(2400105, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.paoText && data.paoText.includes("  ")) {
      paoTextErrors.push(GetErrorMessage(currentCheck, true));
    }

    if (includeCheck(currentCheck, true) && data.saoText && data.saoText.includes("  ")) {
      saoTextErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Organisation name is duplicated in pao or sao text.
    currentCheck = GetCheck(2400106, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, true) &&
      data.paoText &&
      data.organisation &&
      data.paoText.includes(data.organisation)
    ) {
      paoTextErrors.push(GetErrorMessage(currentCheck, true));
    }

    if (
      includeCheck(currentCheck, true) &&
      data.saoText &&
      data.organisation &&
      data.saoText.includes(data.organisation)
    ) {
      saoTextErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Street BLPU must not have sao text populated.
    currentCheck = GetCheck(2400107, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, true) &&
      data.paoText &&
      data.paoText.toLowerCase() === "street record" &&
      data.saoText
    ) {
      saoTextErrors.push(GetErrorMessage(currentCheck, true));
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
        field: "PostalAddress",
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
    if (includeCheck(currentCheck, isScottish) && !data.provenanceCode) {
      provenanceCodeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Provenance code is invalid.
    currentCheck = GetCheck(2200010, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.provenanceCode &&
      !BLPUProvenance.find((x) => x.id === data.provenanceCode)
    ) {
      provenanceCodeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a start date.
    currentCheck = GetCheck(2200011, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.startDate) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Start date cannot be in the future.
    currentCheck = GetCheck(2200012, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.startDate && isFutureDate(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End date cannot be in the future.
    currentCheck = GetCheck(2200014, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.endDate && isFutureDate(data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End date cannot be before the start date.
    currentCheck = GetCheck(2200015, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.startDate &&
      data.endDate &&
      isEndBeforeStart(data.startDate, data.endDate)
    ) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Annotation is too long.
    currentCheck = GetCheck(2200019, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.annotation && data.annotation.length > 30) {
      annotationErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Start dates prior to 1753 are not allowed.
    currentCheck = GetCheck(2200020, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.startDate && isPriorTo1753(data.startDate)) {
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
        field: "Annotations",
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
    if (includeCheck(currentCheck, isScottish) && !data.startDate) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Start date cannot be in the future.
    currentCheck = GetCheck(2300010, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.startDate && isFutureDate(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End date cannot be in the future.
    currentCheck = GetCheck(2300011, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.endDate && isFutureDate(data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End date cannot be before the start date.
    currentCheck = GetCheck(2300012, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.startDate &&
      data.endDate &&
      isEndBeforeStart(data.startDate, data.endDate)
    ) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
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

    // Source is too long.
    currentCheck = GetCheck(2300017, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.source && data.source.length > 6) {
      sourceErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Source does not exist in the lookup table or is marked as historic/disabled.
    currentCheck = GetCheck(2300025, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.sourceId &&
      !currentLookups.appCrossRefs.find((x) => x.pkId === data.sourceId)
    ) {
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
    if (includeCheck(currentCheck, true) && data.startDate && isFutureDate(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // End date cannot be in the future.
    currentCheck = GetCheck(3100010, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.endDate && isFutureDate(data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // End date cannot be before the start date.
    currentCheck = GetCheck(3100013, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, true) &&
      data.startDate &&
      data.endDate &&
      isEndBeforeStart(data.startDate, data.endDate)
    ) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Organisation is too long.
    currentCheck = GetCheck(3100014, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.organisation && data.organisation.length > 60) {
      organisationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Legal name is too long.
    currentCheck = GetCheck(3100015, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.legalName && data.legalName.length > 60) {
      legalNameErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter an organisation.
    currentCheck = GetCheck(3100016, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && !data.organisation) {
      organisationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Organisation contains an invalid character.
    currentCheck = GetCheck(3100017, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, true) &&
      data.organisation &&
      !characterSetValidator(data.organisation, "OneScotlandLookup")
    ) {
      organisationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Organisation cannot start with a space.
    currentCheck = GetCheck(3100019, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.organisation && data.organisation[0] === " ") {
      organisationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Organisation name contains repeated punctuation.
    currentCheck = GetCheck(3100021, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, true) &&
      data.organisation &&
      !!/[^a-z0-9](?=[^a-z0-9])/gi.test(data.organisation.replace(/\s+/g, ""))
    ) {
      organisationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Organisation name contains double spaces.
    currentCheck = GetCheck(3100022, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.organisation && data.organisation.includes("  ")) {
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
    if (includeCheck(currentCheck, true) && !data.blpuClass) {
      blpuClassErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Start date cannot be in the future.
    currentCheck = GetCheck(3200009, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.startDate && isFutureDate(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // End date cannot be in the future.
    currentCheck = GetCheck(3200011, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.endDate && isFutureDate(data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // End date cannot be before the start date.
    currentCheck = GetCheck(3200014, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, true) &&
      data.startDate &&
      data.endDate &&
      isEndBeforeStart(data.startDate, data.endDate)
    ) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Scheme is too long.
    currentCheck = GetCheck(3200015, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.classificationScheme && data.classificationScheme.length > 40) {
      classificationSchemeErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a scheme.
    currentCheck = GetCheck(3200017, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && !data.classificationScheme) {
      classificationSchemeErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a start date.
    currentCheck = GetCheck(3200018, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && !data.startDate) {
      startDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Commercial tertiary classification required for BLPU.
    currentCheck = GetCheck(3200022, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.blpuClass && data.blpuClass[0] === "C" && data.blpuClass.length < 3) {
      blpuClassErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Residential tertiary classification required for BLPU.
    currentCheck = GetCheck(3200023, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.blpuClass && data.blpuClass[0] === "R" && data.blpuClass.length < 3) {
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
    if (includeCheck(currentCheck, true) && !data.successor) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Start date cannot be in the future.
    currentCheck = GetCheck(3000008, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.startDate && isFutureDate(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // End date cannot be in the future.
    currentCheck = GetCheck(3000009, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.endDate && isFutureDate(data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // End date cannot be before the start date.
    currentCheck = GetCheck(3000010, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, true) &&
      data.startDate &&
      data.endDate &&
      isEndBeforeStart(data.startDate, data.endDate)
    ) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a predecessor.
    currentCheck = GetCheck(3000012, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && !data.predecessor) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
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
    if (includeCheck(currentCheck, isScottish) && !data.note) {
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

  if (data) {
    // State is incompatible with the BLPU logical status.
    currentCheck = GetCheck(2100011, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.logicalStatus &&
      ((!isScottish &&
        ((data.logicalStatus === 1 && data.blpuState && ![1, 2, 3, 4].includes(data.blpuState)) ||
          (data.logicalStatus === 8 && data.blpuState && ![4, 7].includes(data.blpuState)))) ||
        (isScottish &&
          ((data.logicalStatus === 1 &&
            ((!data.blpuState && data.blpuState !== 0) || ![0, 1, 2, 3].includes(data.blpuState))) ||
            (data.logicalStatus === 8 && ((!data.blpuState && data.blpuState !== 0) || data.blpuState !== 4)))))
    ) {
      blpuStateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // The state must be between 1 and 7.
    currentCheck = GetCheck(2100012, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.blpuState && ![1, 2, 3, 4, 5, 6, 7].includes(data.blpuState)) {
      blpuStateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a representative point code (RPC).
    currentCheck = GetCheck(2100014, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.rpc) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Representative point code (RPC) is invalid.
    currentCheck = GetCheck(2100026, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.rpc && !RepresentativePointCode.find((x) => x.id === data.rpc)) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // An RPC of 3 can no longer be submitted to GeoPlace.
    currentCheck = GetCheck(2100036, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.rpc && data.rpc === 3) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // An RPC of 5 can no longer be submitted to GeoPlace.
    currentCheck = GetCheck(2100037, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.rpc && data.rpc === 5) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // State is invalid.
    currentCheck = GetCheck(2100048, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.blpuState && !BLPUState.find((x) => x.id === data.blpuState)) {
      blpuStateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a state.
    currentCheck = GetCheck(2100059, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.blpuState && data.blpuState !== 0) {
      blpuStateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // An RPC of 9 can no longer be submitted to GeoPlace.
    currentCheck = GetCheck(2100062, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.rpc && data.rpc === 9) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Postal address is too long.
    currentCheck = GetCheck(2400023, currentLookups, methodName, isScottish, showDebugMessages);
    if (!isScottish && includeCheck(currentCheck, isScottish) && data.postalAddress && data.postalAddress.length > 1) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Postal address is invalid.
    currentCheck = GetCheck(2400024, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      !isScottish &&
      includeCheck(currentCheck, isScottish) &&
      data.postalAddress &&
      !PostallyAddressable.find((x) => x.id === data.postalAddress)
    ) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Official address is too long.
    currentCheck = GetCheck(2400025, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.officialAddress && data.officialFlag.length > 1) {
      officialFlagErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Official address is invalid.
    currentCheck = GetCheck(2400026, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.officialFlag &&
      !OfficialAddress.find((x) => x.id === data.officialFlag)
    ) {
      officialFlagErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

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

    // Postal address of 'N' must not have a postcode or post town.
    currentCheck = GetCheck(2400060, currentLookups, methodName, isScottish, showDebugMessages);
    if (isScottish) {
      if (
        includeCheck(currentCheck, isScottish) &&
        data.logicalStatus &&
        data.logicalStatus !== 6 &&
        data.postallyAddressable &&
        data.postallyAddressable === "N" &&
        (data.postTownRef || data.postcodeRef)
      ) {
        postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
      }
    } else {
      if (
        includeCheck(currentCheck, isScottish) &&
        data.logicalStatus &&
        data.logicalStatus !== 6 &&
        data.postalAddress &&
        data.postalAddress === "N" &&
        (data.postTownRef || data.postcodeRef)
      ) {
        postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
      }
    }

    // Postal address of 'Y', 'A' or 'L' must have a postcode and post town.
    currentCheck = GetCheck(2400061, currentLookups, methodName, isScottish, showDebugMessages);
    if (isScottish) {
      if (
        includeCheck(currentCheck, isScottish) &&
        data.postallyAddressable &&
        ["Y", "L"].includes(data.postallyAddressable) &&
        (!data.postTownRef || !data.postcodeRef)
      ) {
        postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
      }
    } else {
      if (
        includeCheck(currentCheck, isScottish) &&
        data.postalAddress &&
        ["Y", "A", "L"].includes(data.postalAddress) &&
        (!data.postTownRef || !data.postcodeRef)
      ) {
        postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
      }
    }

    // Postal address of 'P' must have a postcode and a post town.
    currentCheck = GetCheck(2400062, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      !isScottish &&
      includeCheck(currentCheck, isScottish) &&
      data.postalAddress &&
      data.postalAddress === "P" &&
      (!data.postTownRef || !data.postcodeRef)
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
