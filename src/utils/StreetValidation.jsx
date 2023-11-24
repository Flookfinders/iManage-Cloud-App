//#region header */
/**************************************************************************************************
//
//  Description: Street validation
//
//  Copyright:    © 2021 - 2023 Idox Software Limited.
//
//  Maximum validation numbers
//  =================================
//  Metadata: 1000017
//  Street: 1100047 - 1100048
//  ESU: 1300008 - 1300009
//  Descriptor: 1500030 - 1500033
//  One Way Exemption: 1600017 - 1600019
//  Highway Dedication: 1700015 - 1700016
//  Successor: 3000000
//  Maintenance Responsibility: 5100008
//  Reinstatement Category: 5200008
//  OS Special Designation: 5300023
//  Interest: 6100018 - 6100021
//  Construction: 6200022 - 6200023
//  Special Designation: 6300026 - 6300031
//  Height Width Weight: 6400015 - 6400016
//  Public Right of Way: 6600015
//  Note: 7200012
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001            Sean Flook                 Initial Revision.
//    002   19.04.23 Sean Flook         WI40653 use includeCheck to determine if a check should be run.
//    003   10.08.23 Sean Flook                 Corrected object name.
//    004   20.09.23 Sean Flook                 Added holder for ValidateStreetSuccessorData.
//    005   24.11.23 Sean Flook                 Renamed successor to successorCrossRef.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

import {
  isFutureDate,
  isPriorTo1990,
  isEndBeforeStart,
  isAfter1stApril2015,
  includeCheck,
  GetErrorMessage,
  GetCheck,
} from "./HelperUtils";

import StreetState from "../data/StreetState";
import StreetSurface from "../data/StreetSurface";
import DETRCodes from "../data/DETRCodes";
import StreetType from "../data/StreetType";
import StreetClassification from "../data/StreetClassification";
import OneWayExemptionType from "../data/OneWayExemptionType";
import OneWayExemptionPeriodicity from "../data/OneWayExemptionPeriodicity";
import HighwayDedicationCode from "./../data/HighwayDedicationCode";
import HWWDesignationCode from "./../data/HWWDesignationCode";
import SpecialDesignationCode from "../data/SpecialDesignationCode";
import SpecialDesignationPeriodicity from "../data/SpecialDesignationPeriodicity";
import ReinstatementType from "../data/ReinstatementType";
import ConstructionType from "../data/ConstructionType";
import AggregateAbrasionValue from "../data/AggregateAbrasionValue";
import PolishedStoneValue from "../data/PolishedStoneValue";
import PRoWDedicationCode from "../data/PRoWDedicationCode";
import PRoWStatusCode from "../data/PRoWStatusCode";

const showDebugMessages = false;

/**
 * Validates a street record
 *
 * @param {object} data The street record data that needs to be validated
 * @param {object} currentLookups The lookup context object.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @return {array|null} Array of validation errors found, if any.
 */
export function ValidateStreetData(data, currentLookups, isScottish) {
  const methodName = "ValidateStreetData";
  let validationErrors = [];
  let currentCheck;
  let endDateErrors = [];
  let startCoordErrors = [];
  let endCoordErrors = [];
  let toleranceErrors = [];
  let stateErrors = [];
  let surfaceErrors = [];
  let startDateErrors = [];
  let usrnErrors = [];
  let swaOrgRefNamingErrors = [];
  let recordTypeErrors = [];
  let stateDateErrors = [];
  let streetClassificationErrors = [];

  if (data) {
    currentCheck = GetCheck(1100004, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.streetStartDate &&
      data.streetEndDate &&
      isEndBeforeStart(data.streetStartDate, data.streetEndDate)
    ) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1100009, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.streetStartX &&
      (data.streetStartX < 80000 ||
        data.streetStartX > 656100 ||
        data.streetStartY < 5000 ||
        data.streetStartY > 657700)
    ) {
      startCoordErrors.push(GetErrorMessage(currentCheck, isScottish));
    }
    if (
      includeCheck(currentCheck, isScottish) &&
      data.streetEndX &&
      (data.streetEndX < 80000 || data.streetEndX > 656100 || data.streetEndY < 5000 || data.streetEndY > 657700)
    ) {
      endCoordErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1100010, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.streetTolerance &&
      (data.streetTolerance < 0 || data.streetTolerance > 99)
    ) {
      toleranceErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1100011, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.streetEndDate && (!data.state || data.state !== 4)) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1100012, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.state && !data.stateDate) {
      stateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1100013, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.state && !StreetState.find((x) => x.id === data.state)) {
      stateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1100014, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.streetSurface &&
      !StreetSurface.find((x) => x.id === data.streetSurface)
    ) {
      surfaceErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1100016, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.streetStartDate) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1100019, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.streetTolerance) {
      toleranceErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1100021, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.streetStartDate && isFutureDate(data.streetStartDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1100022, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.state && data.state === 4 && !data.streetEndDate) {
      stateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1100024, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.usrn && data.usrn !== 0) {
      usrnErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1100025, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.swaOrgRefNaming) {
      swaOrgRefNamingErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1100027, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.esus &&
      data.esus.length > 0 &&
      (!data.streetStartX || !data.streetStartY)
    ) {
      startCoordErrors.push(GetErrorMessage(currentCheck, isScottish));
    }
    if (
      includeCheck(currentCheck, isScottish) &&
      data.esus &&
      data.esus.length > 0 &&
      (!data.streetEndX || !data.streetEndY)
    ) {
      endCoordErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1100028, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.swaOrgRefNaming &&
      !DETRCodes.find((x) => x.id === data.swaOrgRefNaming)
    ) {
      swaOrgRefNamingErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1100029, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.recordType &&
      !StreetType.find((x) => x.id === data.recordType)
    ) {
      recordTypeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1100030, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.stateDate && isPriorTo1990(data.stateDate)) {
      stateDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1100031, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.stateDate && isFutureDate(data.stateDate)) {
      stateDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1100032, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.streetClassification &&
      !StreetClassification.find((x) => x.id === data.streetClassification)
    ) {
      streetClassificationErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1100033, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.recordType) {
      recordTypeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1100035, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.streetEndDate && isFutureDate(data.streetEndDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1100037, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.state) {
      stateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1100041, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.recordType &&
      data.state &&
      [2, 3, 4].includes(data.recordType) &&
      data.state === 5
    ) {
      stateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1100042, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.stateDate) {
      stateDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1100043, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.streetSurface) {
      surfaceErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    if (showDebugMessages) console.log("[DEBUG] ValidateStreetData - Finished checks");

    if (endDateErrors.length > 0)
      validationErrors.push({
        field: "StreetEndDate",
        errors: endDateErrors,
      });

    if (startCoordErrors.length > 0)
      validationErrors.push({
        field: "StreetStartX",
        errors: startCoordErrors,
      });

    if (endCoordErrors.length > 0)
      validationErrors.push({
        field: "StreetEndX",
        errors: endCoordErrors,
      });

    if (toleranceErrors.length > 0)
      validationErrors.push({
        field: "StreetTolerance",
        errors: toleranceErrors,
      });

    if (stateErrors.length > 0)
      validationErrors.push({
        field: "State",
        errors: stateErrors,
      });

    if (surfaceErrors.length > 0)
      validationErrors.push({
        field: "StreetSurface",
        errors: surfaceErrors,
      });

    if (startDateErrors.length > 0)
      validationErrors.push({
        field: "StreetStartDate",
        errors: startDateErrors,
      });

    if (usrnErrors.length > 0)
      validationErrors.push({
        field: "Usrn",
        errors: usrnErrors,
      });

    if (swaOrgRefNamingErrors.length > 0)
      validationErrors.push({
        field: "SwaOrgRefNaming",
        errors: swaOrgRefNamingErrors,
      });

    if (recordTypeErrors.length > 0)
      validationErrors.push({
        field: "RecordType",
        errors: recordTypeErrors,
      });

    if (stateDateErrors.length > 0)
      validationErrors.push({
        field: "StateDate",
        errors: stateDateErrors,
      });

    if (streetClassificationErrors.length > 0)
      validationErrors.push({
        field: "StreetClassification",
        errors: streetClassificationErrors,
      });
  }

  return validationErrors;
}

/**
 * Validates a street descriptor record
 *
 * @param {object} data The street descriptor record data that needs to be validated
 * @param {number} index The index for the street descriptor record.
 * @param {object} currentLookups The lookup context object.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @param {boolean} isWelsh True if the authority is a Welsh authority; otherwise false.
 * @return {array|null} Array of validation errors found, if any.
 */
export function ValidateDescriptorData(data, index, currentLookups, isScottish, isWelsh) {
  const methodName = "ValidateDescriptorData";
  let validationErrors = [];
  let currentCheck;
  let descriptorErrors = [];
  let languageErrors = [];
  let townRefErrors = [];
  let adminAreaRefErrors = [];
  let locRefErrors = [];

  const townData = currentLookups.towns.find((x) => x.townRef === data.townRef);
  const adminAreaData = currentLookups.adminAuthorities.find((x) => x.administrativeAreaRef === data.adminAreaRef);
  const localityData = currentLookups.localities.find((x) => x.localityRef === data.locRef);

  if (data) {
    currentCheck = GetCheck(1500002, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.streetDescriptor) {
      descriptorErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1500003, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.language) {
      languageErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1500004, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && (!data.townRef || (townData && !townData.town))) {
      townRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1500005, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      (!data.adminAreaRef || (adminAreaData && !adminAreaData.administrativeArea))
    ) {
      adminAreaRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1500006, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.streetDescriptor && data.streetDescriptor.length > 100) {
      descriptorErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1500007, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.locRef && localityData && localityData.locality.length > 35) {
      locRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1500008, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.townRef && townData && townData.town.length > 30) {
      townRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1500009, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.adminAreaRef &&
      adminAreaData &&
      adminAreaData.administrativeArea.length > 30
    ) {
      adminAreaRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1500010, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.language &&
      ((isWelsh && !["ENG", "CYM"].includes(data.language)) ||
        (isScottish && !["ENG", "GAE"].includes(data.language)) ||
        (!isWelsh && !isScottish && data.language !== "ENG"))
    ) {
      languageErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1500023, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.locRef && !localityData) {
      locRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1500024, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.townRef && !townData) {
      townRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1500025, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.adminAreaRef && !adminAreaData) {
      adminAreaRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1500026, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.locRef &&
      data.townRef &&
      localityData.locality.toLowerCase() === townData.town.toLowerCase()
    ) {
      locRefErrors.push(GetErrorMessage(currentCheck, isScottish));
      townRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    if (showDebugMessages) console.log("[DEBUG] ValidateDescriptorData - Finished checks");

    if (descriptorErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "StreetDescriptor",
        errors: descriptorErrors,
      });

    if (languageErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "Language",
        errors: languageErrors,
      });

    if (townRefErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "TownRef",
        errors: townRefErrors,
      });

    if (adminAreaRefErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "AdminAreaRef",
        errors: adminAreaRefErrors,
      });

    if (locRefErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "LocRef",
        errors: locRefErrors,
      });
  }

  return validationErrors;
}

/**
 * Validates an ESU record
 *
 * @param {object} data The ESU record data that needs to be validated
 * @param {number} index The index for the ESU record.
 * @param {object} currentLookups The lookup context object.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @return {array|null} Array of validation errors found, if any.
 */
export function ValidateEsuData(data, index, currentLookups, isScottish) {
  // const methodName = "ValidateEsuData";
  let validationErrors = [];
  // let currentCheck;
  // let wktGeometryErrors = [];

  if (data) {
    //   currentCheck = currentLookups.validationMessages.find(
    //     (x) => x.messageId === 1300002
    //   );
    //   if (includeCheck(currentCheck, isScottish) && !data.wktGeometry) {
    //     wktGeometryErrors.push(GetErrorMessage(currentCheck, isScottish));
    //   }
  }

  // if (wktGeometryErrors.length > 0)
  //   validationErrors.push({
  //     index: index,
  //     field: "WktGeometry",
  //     errors: wktGeometryErrors,
  //   });

  return validationErrors;
}

/**
 * Validates an one way exemption record
 *
 * @param {object} data The one way exemption record data that needs to be validated
 * @param {number} index The index for the one way exemption record.
 * @param {number} esuIndex The index for the ESU record that this one way exemption record is attached to.
 * @param {object} currentLookups The lookup context object.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @return {array|null} Array of validation errors found, if any.
 */
export function ValidateOneWayExemptionData(data, index, esuIndex, currentLookups, isScottish) {
  const methodName = "ValidateOneWayExemptionData";
  let validationErrors = [];
  let currentCheck;
  let oweTypeErrors = [];
  let recordEndDateErrors = [];
  let oweEndDateErrors = [];
  let oweEndTimeErrors = [];
  let owePeriodicityCodeErrors = [];

  if (data) {
    currentCheck = GetCheck(1600001, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.oneWayExemptionTypeCode &&
      !OneWayExemptionType.find((x) => x.id === data.oneWayExemptionTypeCode)
    ) {
      oweTypeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1600002, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.recordEndDate && isFutureDate(data.recordEndDate)) {
      recordEndDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1600004, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.oneWayExemptionStartDate &&
      data.oneWayExemptionEndDate &&
      isEndBeforeStart(data.oneWayExemptionStartDate, data.oneWayExemptionEndDate)
    ) {
      oweEndDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1600005, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.oneWayExemptionPeriodicityCode) {
      owePeriodicityCodeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1600006, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.oneWayExemptionPeriodicityCode &&
      !OneWayExemptionPeriodicity.find((x) => x.id === data.oneWayExemptionPeriodicityCode)
    ) {
      owePeriodicityCodeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1600011, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      ((data.recordEndDate && !data.recordStartDate) || (data.recordStartDate && !data.recordEndDate))
    ) {
      recordEndDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1600014, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      ((data.oneWayExemptionEndTime && !data.oneWayExemptionStartTime) ||
        (data.oneWayExemptionStartTime && !data.oneWayExemptionEndTime))
    ) {
      oweEndTimeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1600015, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.oneWayExemptionEndTime &&
      data.oneWayExemptionStartTime &&
      isEndBeforeStart(data.oneWayExemptionStartTime, data.oneWayExemptionEndTime, false)
    ) {
      oweEndTimeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1600016, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.oneWayExemptionPeriodicityCode &&
      data.oneWayExemptionPeriodicityCode === 15 &&
      (!data.oneWayExemptionStartDate ||
        !data.oneWayExemptionEndDate ||
        !data.oneWayExemptionStartTime ||
        !data.oneWayExemptionEndTime)
    ) {
      oweEndDateErrors.push(GetErrorMessage(currentCheck, isScottish));
      oweEndTimeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    if (showDebugMessages) console.log("[DEBUG] ValidateOneWayExemptionData - Finished checks");

    if (oweTypeErrors.length > 0)
      validationErrors.push({
        index: index,
        esuIndex: esuIndex,
        field: "OneWayExemptionTypeCode",
        errors: oweTypeErrors,
      });

    if (recordEndDateErrors.length > 0)
      validationErrors.push({
        index: index,
        esuIndex: esuIndex,
        field: "RecordEndDate",
        errors: recordEndDateErrors,
      });

    if (oweEndDateErrors.length > 0)
      validationErrors.push({
        index: index,
        esuIndex: esuIndex,
        field: "OneWayExemptionEndDate",
        errors: oweEndDateErrors,
      });

    if (oweEndTimeErrors.length > 0)
      validationErrors.push({
        index: index,
        esuIndex: esuIndex,
        field: "OneWayExemptionEndTime",
        errors: oweEndTimeErrors,
      });

    if (owePeriodicityCodeErrors.length > 0)
      validationErrors.push({
        index: index,
        esuIndex: esuIndex,
        field: "OneWayExemptionPeriodicityCode",
        errors: owePeriodicityCodeErrors,
      });
  }

  return validationErrors;
}

/**
 * Validates a highway dedication record
 *
 * @param {object} data The highway dedication record data that needs to be validated
 * @param {number} index The index for the highway dedication record.
 * @param {number} esuIndex The index for the ESU record that this highway dedication record is attached to.
 * @param {object} currentLookups The lookup context object.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @return {array|null} Array of validation errors found, if any.
 */
export function ValidateHighwayDedicationData(data, index, esuIndex, currentLookups, isScottish) {
  const methodName = "ValidateHighwayDedicationData";
  let validationErrors = [];
  let currentCheck;
  let hdCodeErrors = [];
  let hdEndDateErrors = [];
  let hdEndTimeErrors = [];
  let hdSeasonalEndDateErrors = [];
  let recordEndDateErrors = [];

  if (data) {
    currentCheck = GetCheck(1700002, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.highwayDedicationCode) {
      hdCodeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1700004, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.highwayDedicationCode &&
      !HighwayDedicationCode.find((x) => x.id === data.highwayDedicationCode)
    ) {
      hdCodeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1700006, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.hdStartDate &&
      data.hdEndDate &&
      isEndBeforeStart(data.hdStartDate, data.hdEndDate)
    ) {
      hdEndDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1700007, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.hdStartDate &&
      data.recordEndDate &&
      isEndBeforeStart(data.hdStartDate, data.recordEndDate)
    ) {
      hdEndDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1700008, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      ((!data.hdStartTime && data.hdEndTime) || (data.hdStartTime && !data.hdEndTime))
    ) {
      hdEndTimeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1700009, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.hdStartTime &&
      data.hdEndTime &&
      isEndBeforeStart(data.hdStartTime, data.hdEndTime, false)
    ) {
      hdEndTimeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    currentCheck = GetCheck(1700012, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      ((!data.hdSeasonalStartDate && data.hdSeasonalEndDate) || (data.hdSeasonalStartDate && !data.hdSeasonalEndDate))
    ) {
      hdSeasonalEndDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    if (showDebugMessages) console.log("[DEBUG] ValidateHighwayDedicationData - Finished checks");

    if (hdCodeErrors.length > 0)
      validationErrors.push({
        index: index,
        esuIndex: esuIndex,
        field: "HighwayDedicationCode",
        errors: hdCodeErrors,
      });

    if (hdEndDateErrors.length > 0)
      validationErrors.push({
        index: index,
        esuIndex: esuIndex,
        field: "HdEndDate",
        errors: hdEndDateErrors,
      });

    if (hdEndTimeErrors.length > 0)
      validationErrors.push({
        index: index,
        esuIndex: esuIndex,
        field: "HdEndTime",
        errors: hdEndTimeErrors,
      });

    if (hdSeasonalEndDateErrors.length > 0)
      validationErrors.push({
        index: index,
        esuIndex: esuIndex,
        field: "HdSeasonalEndDate",
        errors: hdSeasonalEndDateErrors,
      });

    if (recordEndDateErrors.length > 0)
      validationErrors.push({
        index: index,
        esuIndex: esuIndex,
        field: "RecordEndDate",
        errors: recordEndDateErrors,
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
export function ValidateStreetSuccessorCrossRefData(data, index, currentLookups) {
  // const methodName = "ValidateStreetSuccessorCrossRefData";
  let validationErrors = [];
  return validationErrors;
}

/**
 * Validates a maintenance responsibility record
 *
 * @param {object} data The maintenance responsibility record data that needs to be validated
 * @param {number} index The index for the maintenance responsibility record.
 * @param {object} currentLookups The lookup context object.
 * @return {array|null} Array of validation errors found, if any.
 */
export function ValidateMaintenanceResponsibilityData(data, index, currentLookups) {
  // const methodName = "ValidateMaintenanceResponsibilityData";
  let validationErrors = [];
  return validationErrors;
}

/**
 * Validates a reinstatement designation record
 *
 * @param {object} data The reinstatement designation record data that needs to be validated
 * @param {number} index The index for the reinstatement designation record.
 * @param {object} currentLookups The lookup context object.
 * @return {array|null} Array of validation errors found, if any.
 */
export function ValidateReinstatementCategoryData(data, index, currentLookups) {
  // const methodName = "ValidateReinstatementCategoryData";
  let validationErrors = [];
  return validationErrors;
}

/**
 * Validates an OneScotland special designation record
 *
 * @param {object} data The special designation record data that needs to be validated
 * @param {number} index The index for the special designation record.
 * @param {object} currentLookups The lookup context object.
 * @return {array|null} Array of validation errors found, if any.
 */
export function ValidateOSSpecialDesignationData(data, index, currentLookups) {
  const methodName = "ValidateOSSpecialDesignationData";
  let validationErrors = [];
  let currentCheck;
  let custodianErrors = [];
  let authorityErrors = [];
  let specialDesignationErrors = [];
  let descriptionErrors = [];
  let stateErrors = [];
  let endDateErrors = [];
  let startDateErrors = [];

  if (data) {
    currentCheck = GetCheck(5300007, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && !data.custodianCode) {
      custodianErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(5300008, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.custodianCode &&
      !DETRCodes.find((x) => x.id === data.custodianCode)
    ) {
      custodianErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(5300011, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.authorityCode &&
      !DETRCodes.find((x) => x.id === data.authorityCode)
    ) {
      authorityErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(5300012, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && !data.authorityCode) {
      authorityErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(5300013, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && !data.specialDesig) {
      specialDesignationErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(5300014, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.specialDesig &&
      !SpecialDesignationCode.find((x) => x.id === data.streetSpecialDesig)
    ) {
      specialDesignationErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(5300015, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && !data.description) {
      descriptionErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(5300017, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && !data.state) {
      stateErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(5300018, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.state && ![1, 2].includes(data.state)) {
      stateErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(5300019, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.state && data.state === 2 && !data.endDate) {
      endDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(5300020, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.state && data.startDate && isFutureDate(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(5300021, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.state && data.endDate && isFutureDate(data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(5300022, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.state &&
      data.startDate &&
      data.endDate &&
      isEndBeforeStart(data.startDate, data.endDate)
    ) {
      endDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    if (showDebugMessages) console.log("[DEBUG] ValidateOSSpecialDesignationData - Finished checks");

    if (custodianErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "Custodian",
        errors: custodianErrors,
      });

    if (authorityErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "Authority",
        errors: authorityErrors,
      });

    if (specialDesignationErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SpecialDesignation",
        errors: specialDesignationErrors,
      });

    if (descriptionErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "Description",
        errors: descriptionErrors,
      });

    if (stateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "State",
        errors: stateErrors,
      });

    if (endDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "EndDate",
        errors: endDateErrors,
      });

    if (startDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "StartDate",
        errors: startDateErrors,
      });
  }

  return validationErrors;
}

/**
 * Validates an interest record
 *
 * @param {object} data The interest record data that needs to be validated
 * @param {number} index The index for the interest record.
 * @param {object} currentLookups The lookup context object.
 * @return {array|null} Array of validation errors found, if any.
 */
export function ValidateInterestData(data, index, currentLookups) {
  const methodName = "ValidateInterestData";
  let validationErrors = [];
  let currentCheck;
  let startXErrors = [];
  let startYErrors = [];
  let endXErrors = [];
  let endYErrors = [];
  let swaOrgRefAuthorityErrors = [];
  let districtRefAuthorityErrors = [];

  if (data) {
    currentCheck = GetCheck(6100006, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.startX && (data.startX < 80000 || data.startX > 656100)) {
      startXErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6100007, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.startY && (data.startY < 5000 || data.startY > 657700)) {
      startYErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6100008, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.endX && (data.endX < 80000 || data.endX > 656100)) {
      endXErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6100009, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.endY && (data.endY < 5000 || data.endY > 657700)) {
      endYErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6100011, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.swaOrgRefAuthority &&
      !DETRCodes.find((x) => x.id === data.swaOrgRefAuthority)
    ) {
      swaOrgRefAuthorityErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6100012, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && !data.swaOrgRefAuthority) {
      swaOrgRefAuthorityErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6100013, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && !data.districtRefAuthority) {
      districtRefAuthorityErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6100014, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.districtRefAuthority &&
      !currentLookups.operationalDistricts.find((x) => x.districtId === data.districtRefAuthority)
    ) {
      districtRefAuthorityErrors.push(GetErrorMessage(currentCheck, false));
    }

    if (showDebugMessages) console.log("[DEBUG] ValidateInterestData - Finished checks");

    if (swaOrgRefAuthorityErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SwaOrgRefAuthority",
        errors: swaOrgRefAuthorityErrors,
      });

    if (districtRefAuthorityErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "DistrictRefAuthority",
        errors: districtRefAuthorityErrors,
      });

    if (startXErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "StartX",
        errors: startXErrors,
      });

    if (startYErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "StartY",
        errors: startYErrors,
      });

    if (endXErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "EndX",
        errors: endXErrors,
      });

    if (endYErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "EndY",
        errors: endYErrors,
      });
  }

  return validationErrors;
}

/**
 * Validates an construction record
 *
 * @param {object} data The construction record data that needs to be validated
 * @param {number} index The index for the construction record.
 * @param {object} currentLookups The lookup context object.
 * @return {array|null} Array of validation errors found, if any.
 */
export function ValidateConstructionData(data, index, currentLookups) {
  const methodName = "ValidateConstructionData";
  let validationErrors = [];
  let currentCheck;
  let startXErrors = [];
  let startYErrors = [];
  let endXErrors = [];
  let endYErrors = [];
  let swaOrgRefConsultantErrors = [];
  let districtRefConsultantErrors = [];
  let reinstatementTypeCodeErrors = [];
  let constructionTypeErrors = [];
  let aggregateAbrasionValErrors = [];
  let polishedStoneValErrors = [];

  if (data) {
    currentCheck = GetCheck(6200006, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.constructionStartX &&
      (data.constructionStartX < 80000 || data.constructionStartX > 656100)
    ) {
      startXErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6200007, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.constructionStartY &&
      (data.constructionStartY < 5000 || data.constructionStartY > 657700)
    ) {
      startYErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6200008, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.constructionEndX &&
      (data.constructionEndX < 80000 || data.constructionEndX > 656100)
    ) {
      endXErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6200009, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.constructionEndY &&
      (data.constructionEndY < 5000 || data.constructionEndY > 657700)
    ) {
      endYErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6200014, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.swaOrgRefConsultant &&
      !DETRCodes.find((x) => x.id === data.swaOrgRefConsultant)
    ) {
      swaOrgRefConsultantErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6200015, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.districtRefConsultant &&
      !currentLookups.operationalDistricts.find((x) => x.districtId === data.districtRefConsultant)
    ) {
      districtRefConsultantErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6200016, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && !data.reinstatementTypeCode) {
      reinstatementTypeCodeErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6200017, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.reinstatementTypeCode &&
      !ReinstatementType.find((x) => x.id === data.reinstatementTypeCode)
    ) {
      reinstatementTypeCodeErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6200018, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && !data.constructionType) {
      constructionTypeErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6200019, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.constructionType &&
      !ConstructionType.find((x) => x.id === data.constructionType)
    ) {
      constructionTypeErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6200020, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.aggregateAbrasionVal &&
      !AggregateAbrasionValue.find(
        (x) => x.reinstatementCode === data.reinstatementTypeCode && x.id === data.aggregateAbrasionVal
      )
    ) {
      aggregateAbrasionValErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6200022, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.polishedStoneVal &&
      !PolishedStoneValue.find(
        (x) => x.reinstatementCode === data.reinstatementTypeCode && x.id === data.polishedStoneVal
      )
    ) {
      polishedStoneValErrors.push(GetErrorMessage(currentCheck, false));
    }

    if (showDebugMessages) console.log("[DEBUG] ValidateConstructionData - Finished checks");

    if (reinstatementTypeCodeErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ReinstatementTypeCode",
        errors: reinstatementTypeCodeErrors,
      });

    if (constructionTypeErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ConstructionType",
        errors: constructionTypeErrors,
      });

    if (swaOrgRefConsultantErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SwaOrgRefConsultant",
        errors: swaOrgRefConsultantErrors,
      });

    if (districtRefConsultantErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "DistrictRefConsultant",
        errors: districtRefConsultantErrors,
      });

    if (aggregateAbrasionValErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "AggregateAbrasionVal",
        errors: aggregateAbrasionValErrors,
      });

    if (polishedStoneValErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "PolishedStoneVal",
        errors: polishedStoneValErrors,
      });

    if (startXErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ConstructionStartX",
        errors: startXErrors,
      });

    if (startYErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ConstructionStartY",
        errors: startYErrors,
      });

    if (endXErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ConstructionEndX",
        errors: endXErrors,
      });

    if (endYErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ConstructionEndY",
        errors: endYErrors,
      });
  }

  return validationErrors;
}

/**
 * Validates a GeoPlace special designation record
 *
 * @param {object} data The special designation record data that needs to be validated
 * @param {number} index The index for the special designation record.
 * @param {object} currentLookups The lookup context object.
 * @return {array|null} Array of validation errors found, if any.
 */
export function ValidateSpecialDesignationData(data, index, currentLookups) {
  const methodName = "ValidateSpecialDesignationData";
  let validationErrors = [];
  let currentCheck;
  let startXErrors = [];
  let startYErrors = [];
  let endXErrors = [];
  let endYErrors = [];
  let recordStartDateErrors = [];
  let recordEndDateErrors = [];
  let specialDesigStartDateErrors = [];
  let specialDesigEndDateErrors = [];
  let streetSpecialDesigCodeErrors = [];
  let specialDesigDescriptionErrors = [];
  let specialDesigPeriodicityCodeErrors = [];

  if (data) {
    currentCheck = GetCheck(6300006, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.specialDesigStartX &&
      (data.specialDesigStartX < 80000 || data.specialDesigStartX > 656100)
    ) {
      startXErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6300007, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.specialDesigStartY &&
      (data.specialDesigStartY < 5000 || data.specialDesigStartY > 657700)
    ) {
      startYErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6300008, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.specialDesigEndX &&
      (data.specialDesigEndX < 80000 || data.specialDesigEndX > 656100)
    ) {
      endXErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6300009, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.specialDesigEndY &&
      (data.specialDesigEndY < 5000 || data.specialDesigEndY > 657700)
    ) {
      endYErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6300010, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.recordStartDate && isFutureDate(data.recordStartDate)) {
      recordStartDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6300011, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.recordEndDate && isFutureDate(data.recordEndDate)) {
      recordEndDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6300012, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.recordEndDate &&
      data.recordStartDate &&
      isEndBeforeStart(data.recordStartDate, data.recordEndDate)
    ) {
      recordEndDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6300013, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && !data.recordStartDate) {
      recordStartDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6300014, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.specialDesigEndDate &&
      data.specialDesigStartDate &&
      isEndBeforeStart(data.specialDesigStartDate, data.specialDesigEndDate)
    ) {
      specialDesigEndDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6300015, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.recordStartDate &&
      data.specialDesigStartDate &&
      isEndBeforeStart(data.recordStartDate, data.specialDesigStartDate)
    ) {
      specialDesigStartDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6300016, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.streetSpecialDesigCode &&
      !SpecialDesignationCode.find((x) => x.id === data.streetSpecialDesigCode)
    ) {
      streetSpecialDesigCodeErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6300017, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && !data.streetSpecialDesigCode) {
      streetSpecialDesigCodeErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6300018, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      isAfter1stApril2015(data.recordStartDate) &&
      !data.specialDesigDescription
    ) {
      specialDesigDescriptionErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6300019, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.specialDesigDescription &&
      data.specialDesigDescription.length > 250
    ) {
      specialDesigDescriptionErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6300025, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.specialDesigPeriodicityCode &&
      !SpecialDesignationPeriodicity.find((x) => x.id === data.specialDesigPeriodicityCode)
    ) {
      specialDesigPeriodicityCodeErrors.push(GetErrorMessage(currentCheck, false));
    }

    if (showDebugMessages) console.log("[DEBUG] ValidateSpecialDesignationData - Finished checks");

    if (streetSpecialDesigCodeErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "StreetSpecialDesigCode",
        errors: streetSpecialDesigCodeErrors,
      });

    if (specialDesigDescriptionErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SpecialDesigDescription",
        errors: specialDesigDescriptionErrors,
      });

    if (specialDesigPeriodicityCodeErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SpecialDesigPeriodicityCode",
        errors: specialDesigPeriodicityCodeErrors,
      });

    if (startXErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SpecialDesigStartX",
        errors: startXErrors,
      });

    if (startYErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SpecialDesigStartY",
        errors: startYErrors,
      });

    if (endXErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SpecialDesigEndX",
        errors: endXErrors,
      });

    if (endYErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SpecialDesigEndY",
        errors: endYErrors,
      });

    if (recordStartDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "RecordStartDate",
        errors: recordStartDateErrors,
      });

    if (recordEndDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "RecordEndDate",
        errors: recordEndDateErrors,
      });

    if (specialDesigStartDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SpecialDesigStartDate",
        errors: specialDesigStartDateErrors,
      });

    if (specialDesigEndDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SpecialDesigEndDate",
        errors: specialDesigEndDateErrors,
      });
  }

  return validationErrors;
}

/**
 * Validates a height, width and weight restriction record
 *
 * @param {object} data The height, width and weight restriction record data that needs to be validated
 * @param {number} index The index for the height, width and weight restriction record.
 * @param {object} currentLookups The lookup context object.
 * @return {array|null} Array of validation errors found, if any.
 */
export function ValidateHeightWidthWeightData(data, index, currentLookups) {
  const methodName = "ValidateHeightWidthWeightData";
  let validationErrors = [];
  let currentCheck;
  let restrictionCodeErrors = [];
  let startXErrors = [];
  let startYErrors = [];
  let endXErrors = [];
  let endYErrors = [];

  if (data) {
    currentCheck = GetCheck(6400005, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.hwwRestrictionCode &&
      !HWWDesignationCode.find((x) => x.id === data.hwwRestrictionCode)
    ) {
      restrictionCodeErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6400006, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && !data.hwwRestrictionCode) {
      restrictionCodeErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6400009, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      !data.wholeRoad &&
      data.hwwStartX &&
      (data.hwwStartX < 80000 || data.hwwStartX > 656100)
    ) {
      startXErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6400010, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      !data.wholeRoad &&
      data.hwwStartY &&
      (data.hwwStartY < 5000 || data.hwwStartY > 657700)
    ) {
      startYErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6400011, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      !data.wholeRoad &&
      data.hwwEndX &&
      (data.hwwEndX < 80000 || data.hwwEndX > 656100)
    ) {
      endXErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6400012, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      !data.wholeRoad &&
      data.hwwEndY &&
      (data.hwwEndY < 5000 || data.hwwEndY > 657700)
    ) {
      endYErrors.push(GetErrorMessage(currentCheck, false));
    }

    if (showDebugMessages) console.log("[DEBUG] ValidateHeightWidthWeightData - Finished checks");

    if (restrictionCodeErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "HwwRestrictionCode",
        errors: restrictionCodeErrors,
      });

    if (startXErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "HwwStartX",
        errors: startXErrors,
      });

    if (startYErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "HwwStartY",
        errors: startYErrors,
      });

    if (endXErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "HwwEndX",
        errors: endXErrors,
      });

    if (endYErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "HwwEndY",
        errors: endYErrors,
      });
  }

  return validationErrors;
}

/**
 * Validates a public rights of way record
 *
 * @param {object} data The public rights of way record data that needs to be validated
 * @param {number} index The index for the public rights of way record.
 * @param {object} currentLookups The lookup context object.
 * @return {array|null} Array of validation errors found, if any.
 */
export function ValidatePublicRightOfWayData(data, index, currentLookups) {
  const methodName = "ValidatePublicRightOfWayData";
  let validationErrors = [];
  let currentCheck;
  let prowRightsErrors = [];
  let prowStatusErrors = [];

  if (data) {
    currentCheck = GetCheck(6600011, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && !data.prowRights) {
      prowRightsErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6600012, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.prowRights &&
      !PRoWDedicationCode.find((x) => x.id === data.prowRights)
    ) {
      prowRightsErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6600013, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && !data.prowStatus) {
      prowStatusErrors.push(GetErrorMessage(currentCheck, false));
    }

    currentCheck = GetCheck(6600014, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.prowStatus && !PRoWStatusCode.find((x) => x.id === data.prowStatus)) {
      prowStatusErrors.push(GetErrorMessage(currentCheck, false));
    }

    if (showDebugMessages) console.log("[DEBUG] ValidatePublicRightOfWayData - Finished checks");

    if (prowRightsErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ProwRights",
        errors: prowRightsErrors,
      });

    if (prowStatusErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ProwStatus",
        errors: prowStatusErrors,
      });
  }

  return validationErrors;
}

/**
 * Validates a street note record
 *
 * @param {object} data The street note record data that needs to be validated
 * @param {number} index The index for the street note record.
 * @param {object} currentLookups The lookup context object.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @return {array|null} Array of validation errors found, if any.
 */
export function ValidateStreetNoteData(data, index, currentLookups, isScottish) {
  const methodName = "ValidateStreetNoteData";
  let validationErrors = [];
  let currentCheck;
  let noteErrors = [];

  if (data) {
    currentCheck = GetCheck(7200005, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.note) {
      noteErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    if (showDebugMessages) console.log("[DEBUG] ValidateStreetNoteData - Finished checks");

    if (noteErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "Note",
        errors: noteErrors,
      });
  }

  return validationErrors;
}
