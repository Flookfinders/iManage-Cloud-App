//#region header */
/**************************************************************************************************
//
//  Description: Property Data Form
//
//  Copyright:    © 2021 - 2023 Idox Software Limited.
//
//  Maximum validation numbers
//  =================================
//  Metadata: 1000017
//  BLPU: 2100062
//  BLPU Provenance: 2200020
//  BLPU Application Cross Reference: 2300033
//  LPI: 2400079 - 2400081
//  Successor Cross Reference: 3000000 - 3000000
//  Organisation: 3100000 - 3100012
//  Classification: 3200000 - 3200013
//  Note: 7100014
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

  if (data) {
    currentCheck = GetCheck(2100008, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.logicalStatus) {
      logicalStatusErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2100009, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.logicalStatus &&
      !BLPULogicalStatus.find((x) => x.id === data.logicalStatus)
    ) {
      logicalStatusErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2100011, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.logicalStatus &&
      ((data.logicalStatus === 1 && data.state && ![1, 2, 3, 4].includes(data.state)) ||
        (data.logicalStatus === 5 && ![1, 2, 3, 4, 6].includes(data.blpuState)) ||
        (data.logicalStatus === 6 && ![1, 5, 6, 7].includes(data.blpuState)) ||
        (data.logicalStatus === 7 && data.state && ![1, 2, 3, 4, 6].includes(data.state)) ||
        (data.logicalStatus === 8 && data.state && ![4, 7].includes(data.state)))
    ) {
      blpuStateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2100012, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.blpuState && ![1, 2, 3, 4, 5, 6, 7].includes(data.blpuState)) {
      blpuStateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2100014, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.rpc) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2100015, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.blpuClass && data.blpuClass.length > 4) {
      classificationErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2100016, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.blpuClass) {
      classificationErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2100018, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.organisation && data.organisation.length > 100) {
      organisationErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2100019, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.organisation &&
      !/[a-zA-Z0-9 !.,&;:[\]()+-/_@£$ÀÁÂÄÈÉÊËÌÍÎÏÒÓÔÖÚÙÛÜŴÝŸŶàáâäèéêëìíîïòóôöúùûüŵýÿŷẁẃẅẀẂẄỳỲ]+/giu.test(
        data.organisation
      )
    ) {
      organisationErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2100020, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.xcoordinate) {
      xCoordinateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    if (includeCheck(currentCheck, isScottish) && !data.ycoordinate) {
      yCoordinateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2100021, currentLookups, methodName, isScottish, showDebugMessages);
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

    currentCheck = GetCheck(2100022, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.wardCode && data.wardCode.length > 10) {
      wardCodeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2100023, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.parishCode && data.parishCode.length > 10) {
      parishCodeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2100024, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.logicalStatus &&
      [5, 6].includes(data.logicalStatus) &&
      !data.blpuState
    ) {
      blpuStateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    if (includeCheck(currentCheck, isScottish) && data.blpuState && !data.blpuStateDate) {
      blpuStateDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2100025, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.blpuStateDate && isFutureDate(data.blpuStateDate)) {
      blpuStateDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2100026, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.rpc && !RepresentativePointCode.find((x) => x.id === data.rpc)) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2100027, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.startDate) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2100028, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.startDate && isFutureDate(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2100029, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.startDate && isPriorTo1753(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2100030, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.endDate && isFutureDate(data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2100031, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.startDate &&
      data.endDate &&
      isEndBeforeStart(data.startDate, data.endDate)
    ) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2100032, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.endDate &&
      data.logicalStatus &&
      ![7, 8, 9].includes(data.logicalStatus)
    ) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2100036, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.rpc && data.rpc === 3) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2100037, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.rpc && data.rpc === 5) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2100062, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.rpc && data.rpc === 9) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2100045, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.logicalStatus &&
      [7, 8, 9].includes(data.logicalStatus) &&
      !data.endDate
    ) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2100047, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.logicalStatus &&
      [8, 9].includes(data.logicalStatus) &&
      !data.endDate
    ) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2100048, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.blpuState && !BLPUState.find((x) => x.id === data.blpuState)) {
      blpuStateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2100053, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.wardCode &&
      !currentLookups.wards.find((x) => x.wardCode === data.wardCode)
    ) {
      wardCodeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2100054, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.parishCode &&
      !currentLookups.parishes.find((x) => x.parishCode === data.parishCode)
    ) {
      parishCodeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2100055, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.blpuClass &&
      !BLPUClassification.find((x) => x.id === data.blpuClass)
    ) {
      classificationErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2100059, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.logicalStatus &&
      [5, 6].includes(data.logicalStatus) &&
      !data.blpuState
    ) {
      blpuStateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2100060, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.localCustodianCode &&
      !DETRCodes.find((x) => x.id === data.localCustodianCode)
    ) {
      localCustodianCodeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

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

  if (data) {
    currentCheck = GetCheck(2400007, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.startDate) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400008, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.startDate && isFutureDate(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400011, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.endDate && isFutureDate(data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400012, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.startDate &&
      data.endDate &&
      isEndBeforeStart(data.startDate, data.endDate)
    ) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400016, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.usrn &&
      !currentLookups.streetDescriptors.find((x) => x.usrn === data.usrn)
    ) {
      usrnErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400017, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.logicalStatus &&
      [7, 8, 9].includes(data.logicalStatus) &&
      !data.endDate
    ) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400018, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.paoStartSuffix &&
      ((isWelsh && data.paoStartSuffix.length > 2) || (!isWelsh && data.paoStartSuffix.length > 1))
    ) {
      paoStartSuffixErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400019, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.paoEndSuffix &&
      ((isWelsh && data.paoEndSuffix.length > 2) || (!isWelsh && data.paoEndSuffix.length > 1))
    ) {
      paoEndSuffixErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400020, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.saoStartSuffix &&
      ((isWelsh && data.saoStartSuffix.length > 2) || (!isWelsh && data.saoStartSuffix.length > 1))
    ) {
      saoStartSuffixErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400021, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.saoEndSuffix &&
      ((isWelsh && data.saoEndSuffix.length > 2) || (!isWelsh && data.saoEndSuffix.length > 1))
    ) {
      saoEndSuffixErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400022, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.postalAddress) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400023, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.postalAddress && data.postalAddress.length > 1) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400024, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.postalAddress &&
      !PostallyAddressable.find((x) => x.id === data.postalAddress)
    ) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400025, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.officialFlag && data.officialFlag.length > 1) {
      officialFlagErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400026, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.officialFlag &&
      !OfficialAddress.find((x) => x.id === data.officialFlag)
    ) {
      officialFlagErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400028, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.language) {
      languageErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

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

    currentCheck = GetCheck(2400030, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.startDate && isPriorTo1753(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400031, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.endDate &&
      data.logicalStatus &&
      ![8, 9].includes(data.logicalStatus)
    ) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400032, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.saoStartNumber &&
      (data.saoStartNumber < 0 || data.saoStartNumber > 9999)
    ) {
      saoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400033, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.saoEndNumber &&
      (data.saoEndNumber < 0 || data.saoEndNumber > 9999)
    ) {
      saoEndNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400034, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.saoStartNumber && data.saoEndNumber) {
      saoEndNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400035, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.paoText && data.paoText.length > 90) {
      paoTextErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400036, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.saoText && data.saoText.length > 90) {
      saoTextErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400037, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.paoStartNumber &&
      (data.paoStartNumber < 0 || data.paoStartNumber > 9999)
    ) {
      paoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400038, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.paoEndNumber &&
      (data.paoEndNumber < 0 || data.paoEndNumber > 9999)
    ) {
      paoEndNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400039, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.paoStartNumber && data.paoEndNumber) {
      paoEndNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400040, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.paoStartNumber && !data.paoText) {
      paoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400041, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.paoText &&
      data.saoText &&
      data.paoText.toLowerCase() === data.saoText.toLowerCase()
    ) {
      paoTextErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400042, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.usrn) {
      usrnErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400049, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.postcodeRef &&
      !currentLookups.postcodes.find((x) => x.postcodeRef === data.postcodeRef)
    ) {
      postcodeRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400055, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.postTownRef &&
      !currentLookups.postTowns.find((x) => x.postTownRef === data.postTownRef)
    ) {
      postTownRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400060, currentLookups, methodName, isScottish, showDebugMessages);
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

    currentCheck = GetCheck(2400061, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.postalAddress &&
      ["Y", "A", "L"].includes(data.postalAddress) &&
      (!data.postTownRef || !data.postcodeRef)
    ) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400062, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.postalAddress &&
      data.postalAddress === "P" &&
      (data.postTownRef || !data.postcodeRef)
    ) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400064, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.logicalStatus) {
      logicalStatusErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400069, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.logicalStatus &&
      !LPILogicalStatus.find((x) => x.id === data.logicalStatus)
    ) {
      logicalStatusErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400073, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.paoStartSuffix && !data.paoStartNumber) {
      paoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400074, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.paoEndSuffix && !data.paoEndNumber) {
      paoEndNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400075, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.saoStartSuffix && !data.saoStartNumber) {
      saoStartNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400076, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.saoEndSuffix && !data.saoEndNumber) {
      saoEndNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400077, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.saoStartNumber &&
      data.saoEndNumber &&
      Number(data.saoStartNumber) > Number(data.saoEndNumber)
    ) {
      saoEndNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400078, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.paoStartNumber &&
      data.paoEndNumber &&
      Number(data.paoStartNumber) > Number(data.paoEndNumber)
    ) {
      paoEndNumberErrors.push(GetErrorMessage(currentCheck, isScottish));
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
    currentCheck = GetCheck(2200009, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.provenanceCode) {
      provenanceCodeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2200010, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.provenanceCode &&
      !BLPUProvenance.find((x) => x.id === data.provenanceCode)
    ) {
      provenanceCodeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2200011, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.startDate) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2200012, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.startDate && isFutureDate(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2200014, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.endDate && isFutureDate(data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2200015, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.startDate &&
      data.endDate &&
      isEndBeforeStart(data.startDate, data.endDate)
    ) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2200019, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.annotation && data.annotation.length > 30) {
      annotationErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

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
    currentCheck = GetCheck(2300006, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.startDate) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2300010, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.startDate && isFutureDate(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2300011, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.endDate && isFutureDate(data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2300012, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.startDate &&
      data.endDate &&
      isEndBeforeStart(data.startDate, data.endDate)
    ) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2300014, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.crossReference) {
      crossReferenceErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2300015, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.crossReference && data.crossReference.length > 50) {
      crossReferenceErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2300016, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.sourceId) {
      sourceIdErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2300017, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.source && data.source.length > 6) {
      sourceErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2300025, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.sourceId &&
      !currentLookups.appCrossRefs.find((x) => x.pkId === data.sourceId)
    ) {
      sourceErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

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
 * Validates a classification record
 *
 * @param {object} data - The classification record data that needs to be validated
 * @param {number} index - The index for the classification record.
 * @param {object} currentLookups - The lookup context object.
 * @return {array}
 */
export function ValidateClassificationData(data, index, currentLookups) {
  // const methodName = "ValidateClassificationData";
  let validationErrors = [];
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
  // const methodName = "ValidateOrganisationData";
  let validationErrors = [];
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
  // const methodName = "ValidateSuccessorCrossRefData";
  let validationErrors = [];
  return validationErrors;
}

/**
 * Validates a property note record
 *
 * @param {object} data - The property note record data that needs to be validated
 * @param {number} index - The index for the property note record.
 * @return {array}
 */
export function ValidatePropertyNoteData(data, index) {
  // const methodName = "ValidatePropertyNoteData";
  let validationErrors = [];
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
    currentCheck = GetCheck(2100011, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.logicalStatus &&
      ((data.logicalStatus === 1 && data.state && ![1, 2, 3, 4].includes(data.state)) ||
        (data.logicalStatus === 8 && data.state && ![4, 7].includes(data.state)))
    ) {
      blpuStateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2100012, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.blpuState && ![1, 2, 3, 4, 5, 6, 7].includes(data.blpuState)) {
      blpuStateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2100014, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.rpc) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2100026, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.rpc && !RepresentativePointCode.find((x) => x.id === data.rpc)) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2100036, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.rpc && data.rpc === 3) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2100037, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.rpc && data.rpc === 5) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2100062, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.rpc && data.rpc === 9) {
      rpcErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2100048, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.blpuState && !BLPUState.find((x) => x.id === data.blpuState)) {
      blpuStateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2100059, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.logicalStatus &&
      [5, 6].includes(data.logicalStatus) &&
      !data.blpuState
    ) {
      blpuStateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400023, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.postalAddress && data.postalAddress.length > 1) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400024, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.postalAddress &&
      !PostallyAddressable.find((x) => x.id === data.postalAddress)
    ) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400025, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.officialAddress && data.officialFlag.length > 1) {
      officialFlagErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400026, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.officialFlag &&
      !OfficialAddress.find((x) => x.id === data.officialFlag)
    ) {
      officialFlagErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400049, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.postcodeRef &&
      !currentLookups.postcodes.find((x) => x.postcodeRef === data.postcodeRef)
    ) {
      postcodeRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400055, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.postTownRef &&
      !currentLookups.postTowns.find((x) => x.postTownRef === data.postTownRef)
    ) {
      postTownRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400060, currentLookups, methodName, isScottish, showDebugMessages);
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

    currentCheck = GetCheck(2400061, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.postalAddress &&
      ["Y", "A", "L"].includes(data.postalAddress) &&
      (!data.postTownRef || !data.postcodeRef)
    ) {
      postalAddressErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(2400062, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.postalAddress &&
      data.postalAddress === "P" &&
      (data.postTownRef || !data.postcodeRef)
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
