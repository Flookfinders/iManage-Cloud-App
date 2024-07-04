//#region header */
/**************************************************************************************************
//
//  Description: Street validation
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//  Maximum validation numbers
//  =================================
//  Street:                     1100066
//  ESU:                        1300041
//  Descriptor:                 1500045
//  One Way Exemption:          1600025
//  Highway Dedication:         1700031
//  Successor Cross Reference:  3000017
//  Maintenance Responsibility: 5100034
//  Reinstatement Category:     5200033
//  OS Special Designation:     5300036
//  Interest:                   6100058
//  Construction:               6200064
//  Special Designation:        6300054
//  Height Width Weight:        6400049
//  Public Right of Way:        6600064
//  Note:                       7200012
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
//    006   15.12.23 Sean Flook                 Added new checks and comments.
//    007   19.12.23 Sean Flook                 Various bug fixes.
//    008   29.01.24 Sean Flook                 Added new checks.
//    009   29.01.24 Sean Flook                 Added more new checks.
//    010   01.02.24 Sean Flook                 Changes required for differences in field names between GeoPlace and OneScotland.
//    011   02.02.24 Sean Flook       IMANN-269 Use isIso885914 to determine if the various texts are compliant to the ISO 8859-14 (Celtic-8) character set.
//    012   02.02.24 Sean Flook       IMANN-264 Correctly call includeCheck for GeoPlace ASD records.
//    013   07.02.24 Sean Flook       IMANN-284 Added missing OneScotland ESU checks.
//    014   12.02.24 Sean Flook                 Added new GeoPlace special designation checks.
//    015   14.03.24 Sean Flook                 Added new checks.
//    016   18.03.24 Sean Flook         ESU2_GP Added check for missing geometry on ESU record.
//    017   28.03.24 Sean Flook                 Fixed check 6200016.
//    018   16.04.24 Sean Flook       IMANN-388 Corrected bug.
//    019   23.05.24 Joshua McCormick IMANN-478 Removed 6600052 PRoW district ref consultant is missing. as not used in API or GUI
//    020   20.04.24 Sean Flook       IMANN-221 Use the correct table when checking Scottish ASD custodian and authorities.
//    021   29.05.24 Sean Flook       IMANN-221 Added new checks.
//    031   20.06.24 Sean Flook       IMANN-636 Use the new user rights.
//    032   04.07.24 Sean Flook       IMANN-221 Added new checks and updated messages.
//    033   04.07.24 Sean Flook       IMANN-221 Further updated messages.
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
  filteredLookup,
  isIso885914,
} from "./HelperUtils";

import StreetState from "../data/StreetState";
import StreetSurface from "../data/StreetSurface";
import DETRCodes from "../data/DETRCodes";
import StreetType from "../data/StreetType";
import StreetClassification from "../data/StreetClassification";
import EsuClassification from "./../data/ESUClassification";
import ESUDirectionCode from "../data/ESUDirectionCode";
import ESUState from "../data/ESUState";
import OneWayExemptionType from "../data/OneWayExemptionType";
import OneWayExemptionPeriodicity from "../data/OneWayExemptionPeriodicity";
import HighwayDedicationCode from "./../data/HighwayDedicationCode";
import HWWDesignationCode from "./../data/HWWDesignationCode";
import SwaOrgRef from "../data/SwaOrgRef";
import RoadStatusCode from "../data/RoadStatusCode";
import InterestType from "../data/InterestType";
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
 * @param {number} authorityCode The current authorities DETR code.
 * @return {array|null} Array of validation errors found, if any.
 */
export function ValidateStreetData(data, currentLookups, isScottish, authorityCode) {
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
    // End date cannot be before the street start date.
    currentCheck = GetCheck(1100004, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.streetStartDate &&
      data.streetEndDate &&
      isEndBeforeStart(data.streetStartDate, data.streetEndDate)
    ) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Coordinates must be within the valid coordinate range.
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

    // Tolerance must be within the accepted tolerance range (0-99).
    currentCheck = GetCheck(1100010, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.streetTolerance &&
      (data.streetTolerance < 0 || data.streetTolerance > 99)
    ) {
      toleranceErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End date is set but state is not 4.
    currentCheck = GetCheck(1100011, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.streetEndDate && (!data.state || data.state !== 4)) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // State is supplied but state date not set.
    currentCheck = GetCheck(1100012, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.state && !data.stateDate) {
      stateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // State is invalid.
    currentCheck = GetCheck(1100013, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.state && !StreetState.find((x) => x.id === data.state)) {
      stateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Surface is invalid.
    currentCheck = GetCheck(1100014, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.streetSurface &&
      !StreetSurface.find((x) => x.id === data.streetSurface)
    ) {
      surfaceErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a start date.
    currentCheck = GetCheck(1100016, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.streetStartDate) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a tolerance.
    currentCheck = GetCheck(1100019, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.streetTolerance) {
      toleranceErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Start date cannot be in the future.
    currentCheck = GetCheck(1100021, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.streetStartDate && isFutureDate(data.streetStartDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // State is 4 but end date is not set.
    currentCheck = GetCheck(1100022, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.state && data.state === 4 && !data.streetEndDate) {
      stateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a USRN.
    currentCheck = GetCheck(1100024, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.usrn && data.usrn !== 0) {
      usrnErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter an authority code.
    currentCheck = GetCheck(1100025, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.swaOrgRefNaming) {
      swaOrgRefNamingErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter start and/or end coordinates.
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

    // Authority code is invalid.
    currentCheck = GetCheck(1100028, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.swaOrgRefNaming &&
      !DETRCodes.find((x) => x.id === data.swaOrgRefNaming)
    ) {
      swaOrgRefNamingErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Record type is invalid.
    currentCheck = GetCheck(1100029, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.recordType &&
      !StreetType.find((x) => x.id === data.recordType)
    ) {
      recordTypeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // State dates prior to 1990 are not allowed.
    currentCheck = GetCheck(1100030, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.stateDate && isPriorTo1990(data.stateDate)) {
      stateDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // State date cannot be in the future.
    currentCheck = GetCheck(1100031, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.stateDate && isFutureDate(data.stateDate)) {
      stateDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Classification is invalid.
    currentCheck = GetCheck(1100032, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.streetClassification &&
      !StreetClassification.find((x) => x.id === data.streetClassification)
    ) {
      streetClassificationErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a record type.
    currentCheck = GetCheck(1100033, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.recordType) {
      recordTypeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End date cannot be in the future.
    currentCheck = GetCheck(1100035, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.streetEndDate && isFutureDate(data.streetEndDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a state.
    currentCheck = GetCheck(1100037, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.state) {
      stateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Street types 2, 3 & 4 must not have a state of 5.
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

    // Enter a state date.
    currentCheck = GetCheck(1100042, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.stateDate) {
      stateDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a surface.
    currentCheck = GetCheck(1100043, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.streetSurface) {
      surfaceErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Street creation and maintenance is restricted to your assigned authority.
    currentCheck = GetCheck(1100048, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.swaOrgRefNaming && data.swaOrgRefNaming !== authorityCode) {
      swaOrgRefNamingErrors.push(GetErrorMessage(currentCheck, isScottish));
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
  let islandRefErrors = [];

  const townData = currentLookups.towns.find((x) => x.townRef === data.townRef);
  const adminAreaData = currentLookups.adminAuthorities.find((x) => x.administrativeAreaRef === data.adminAreaRef);
  const localityData = currentLookups.localities.find((x) => x.localityRef === data.locRef);
  const islandData = isScottish ? currentLookups.islands.find((x) => x.islandRef === data.islandRef) : null;

  if (data) {
    // Enter a descriptor.
    currentCheck = GetCheck(1500002, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.streetDescriptor) {
      descriptorErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a language.
    currentCheck = GetCheck(1500003, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.language) {
      languageErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a town name.
    currentCheck = GetCheck(1500004, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && (!data.townRef || (townData && !townData.town))) {
      townRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter an administrative area.
    currentCheck = GetCheck(1500005, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      (!data.adminAreaRef || (adminAreaData && !adminAreaData.administrativeArea))
    ) {
      adminAreaRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Descriptor is too long.
    currentCheck = GetCheck(1500006, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.streetDescriptor && data.streetDescriptor.length > 100) {
      descriptorErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Locality name is too long.
    currentCheck = GetCheck(1500007, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.locRef && localityData && localityData.locality.length > 35) {
      locRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Town name is too long.
    currentCheck = GetCheck(1500008, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.townRef && townData && townData.town.length > 30) {
      townRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Administrative area is too long.
    currentCheck = GetCheck(1500009, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.adminAreaRef &&
      adminAreaData &&
      adminAreaData.administrativeArea.length > 30
    ) {
      adminAreaRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Language is invalid.
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

    // Locality does not exist in the lookup table.
    currentCheck = GetCheck(1500023, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.locRef && !localityData) {
      locRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Town does not exist in the lookup table.
    currentCheck = GetCheck(1500024, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.townRef && !townData) {
      townRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Administrative area does not exist in the lookup table.
    currentCheck = GetCheck(1500025, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.adminAreaRef && !adminAreaData) {
      adminAreaRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Locality and town must not be the same.
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

    // Island does not exist in the lookup table.
    currentCheck = GetCheck(1500033, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.islandRef && !islandData) {
      islandRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Island name is too long.
    currentCheck = GetCheck(1500034, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.islandRef && islandData && islandData.island.length > 30) {
      islandRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Locality, town and island must not be the same.
    currentCheck = GetCheck(1500035, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.islandRef &&
      data.locRef &&
      data.townRef &&
      (localityData.locality.toLowerCase() === townData.town.toLowerCase() ||
        localityData.locality.toLowerCase() === islandData.island.toLowerCase() ||
        townData.town.toLowerCase() === islandData.island.toLowerCase())
    ) {
      locRefErrors.push(GetErrorMessage(currentCheck, isScottish));
      townRefErrors.push(GetErrorMessage(currentCheck, isScottish));
      islandRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // A street descriptor must have a town when a locality has been entered.
    currentCheck = GetCheck(1500038, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.locRef && !data.townRef) {
      townRefErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Descriptor should not begin with a space.
    currentCheck = GetCheck(1500042, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.streetDescriptor && data.streetDescriptor[0] === " ") {
      descriptorErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Descriptor should not end with a space (open streets).
    currentCheck = GetCheck(1500043, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.streetDescriptor &&
      data.streetDescriptor[data.streetDescriptor.length - 1] === " "
    ) {
      descriptorErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Island and administrative area should not be the same.
    currentCheck = GetCheck(1500045, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.islandRef &&
      data.adminAreaRef &&
      adminAreaData.administrativeArea.toLowerCase() === islandData.island.toLowerCase()
    ) {
      islandRefErrors.push(GetErrorMessage(currentCheck, isScottish));
      adminAreaRefErrors.push(GetErrorMessage(currentCheck, isScottish));
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

    if (islandRefErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "IslandRef",
        errors: islandRefErrors,
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
  const methodName = "ValidateEsuData";
  let startDateErrors = [];
  let endDateErrors = [];
  let classificationErrors = [];
  let classificationDateErrors = [];
  let stateErrors = [];
  let stateDateErrors = [];
  let toleranceErrors = [];
  let directionErrors = [];
  let geometryErrors = [];
  let validationErrors = [];
  let currentCheck;

  if (data) {
    const esuStartDate = isScottish ? data.startDate : data.esuStartDate;
    const esuEndDate = isScottish ? data.endDate : data.esuEndDate;

    // Enter geometry.
    currentCheck = GetCheck(1300002, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.wktGeometry) {
      geometryErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a state.
    currentCheck = GetCheck(1300011, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.state) {
      stateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a state date.
    currentCheck = GetCheck(1300012, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.stateDate) {
      stateDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // State date cannot be in the future.
    currentCheck = GetCheck(1300013, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.stateDate && isFutureDate(data.stateDate)) {
      stateDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // State is invalid.
    currentCheck = GetCheck(1300014, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.state && !ESUState.find((x) => x.id === data.state)) {
      stateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // State date cannot be before the start date.
    currentCheck = GetCheck(1300015, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.state &&
      esuStartDate &&
      isEndBeforeStart(esuStartDate, data.stateDate)
    ) {
      stateDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // State is 4 but ESU end date is not set.
    currentCheck = GetCheck(1300016, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.state && data.state === 4 && !esuEndDate) {
      stateErrors.push(GetErrorMessage(currentCheck, isScottish));
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a start date.
    currentCheck = GetCheck(1300017, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !esuStartDate) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Start date cannot be in the future.
    currentCheck = GetCheck(1300020, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && esuStartDate && isFutureDate(esuStartDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End date cannot be in the future.
    currentCheck = GetCheck(1300021, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && esuEndDate && isFutureDate(esuEndDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End date cannot be before the start date.
    currentCheck = GetCheck(1300022, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      esuStartDate &&
      esuEndDate &&
      isEndBeforeStart(esuStartDate, esuEndDate)
    ) {
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a classification.
    currentCheck = GetCheck(1300023, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.classification) {
      classificationErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Classification is invalid.
    currentCheck = GetCheck(1300024, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.classification &&
      !EsuClassification.find((x) => x.id === data.classification)
    ) {
      classificationErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a classification date.
    currentCheck = GetCheck(1300025, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.classificationDate) {
      classificationDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Classification date cannot be before the start date.
    currentCheck = GetCheck(1300026, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      esuStartDate &&
      data.classificationDate &&
      isEndBeforeStart(esuStartDate, data.classificationDate)
    ) {
      classificationDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End date is set but state is not 4.
    currentCheck = GetCheck(1300028, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && esuEndDate && data.state !== 4) {
      stateErrors.push(GetErrorMessage(currentCheck, isScottish));
      endDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a tolerance.
    currentCheck = GetCheck(1300030, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.esuTolerance) {
      toleranceErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Tolerance is invalid.
    currentCheck = GetCheck(1300031, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.esuTolerance && ![1, 5, 10, 50].includes(data.esuTolerance)) {
      toleranceErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a direction.
    currentCheck = GetCheck(1300036, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.esuDirection) {
      directionErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Direction is invalid.
    currentCheck = GetCheck(1300037, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.esuDirection &&
      !ESUDirectionCode.find((x) => x.id === data.esuDirection)
    ) {
      directionErrors.push(GetErrorMessage(currentCheck, isScottish));
    }
  }

  if (showDebugMessages) console.log("[DEBUG] ValidateEsuData - Finished checks");

  if (geometryErrors.length > 0)
    validationErrors.push({
      index: index,
      field: "Geometry",
      errors: geometryErrors,
    });

  if (startDateErrors.length > 0)
    validationErrors.push({
      index: index,
      field: "EsuStartDate",
      errors: startDateErrors,
    });

  if (endDateErrors.length > 0)
    validationErrors.push({
      index: index,
      field: "EsuEndDate",
      errors: endDateErrors,
    });

  if (classificationErrors.length > 0)
    validationErrors.push({
      index: index,
      field: "EsuClassification",
      errors: classificationErrors,
    });

  if (classificationDateErrors.length > 0)
    validationErrors.push({
      index: index,
      field: "EsuClassificationDate",
      errors: classificationDateErrors,
    });

  if (stateErrors.length > 0)
    validationErrors.push({
      index: index,
      field: "State",
      errors: stateErrors,
    });

  if (stateDateErrors.length > 0)
    validationErrors.push({
      index: index,
      field: "StateDate",
      errors: stateDateErrors,
    });

  if (toleranceErrors.length > 0)
    validationErrors.push({
      index: index,
      field: "EsuTolerance",
      errors: toleranceErrors,
    });

  if (directionErrors.length > 0)
    validationErrors.push({
      index: index,
      field: "EsuDirection",
      errors: directionErrors,
    });

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
    // Type is invalid.
    currentCheck = GetCheck(1600001, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.oneWayExemptionType &&
      !OneWayExemptionType.find((x) => x.id === data.oneWayExemptionType)
    ) {
      oweTypeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End date cannot be in the future.
    currentCheck = GetCheck(1600002, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.recordEndDate && isFutureDate(data.recordEndDate)) {
      recordEndDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End date cannot be before the start date.
    currentCheck = GetCheck(1600004, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.oneWayExemptionStartDate &&
      data.oneWayExemptionEndDate &&
      isEndBeforeStart(data.oneWayExemptionStartDate, data.oneWayExemptionEndDate)
    ) {
      oweEndDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Enter a periodicity.
    currentCheck = GetCheck(1600005, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.oneWayExemptionPeriodicityCode) {
      owePeriodicityCodeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Periodicity is invalid.
    currentCheck = GetCheck(1600006, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.oneWayExemptionPeriodicityCode &&
      !OneWayExemptionPeriodicity.find((x) => x.id === data.oneWayExemptionPeriodicityCode)
    ) {
      owePeriodicityCodeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Start date and end date must either both be blank or both have a value.
    currentCheck = GetCheck(1600011, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      ((data.recordEndDate && !data.recordStartDate) || (data.recordStartDate && !data.recordEndDate))
    ) {
      recordEndDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Start time and end time must either both be blank or both have a value.
    currentCheck = GetCheck(1600014, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      ((data.oneWayExemptionEndTime && !data.oneWayExemptionStartTime) ||
        (data.oneWayExemptionStartTime && !data.oneWayExemptionEndTime))
    ) {
      oweEndTimeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End time cannot be before start time.
    currentCheck = GetCheck(1600015, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.oneWayExemptionEndTime &&
      data.oneWayExemptionStartTime &&
      isEndBeforeStart(data.oneWayExemptionStartTime, data.oneWayExemptionEndTime, false)
    ) {
      oweEndTimeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Start date, start time, end date and end time must be present when periodicity is 15.
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

    // Enter a type.
    currentCheck = GetCheck(1600018, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.oneWayExemptionType) {
      oweTypeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End date cannot be in the future.
    currentCheck = GetCheck(1600021, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && data.recordEndDate && isFutureDate(data.recordEndDate)) {
      recordEndDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    if (showDebugMessages) console.log("[DEBUG] ValidateOneWayExemptionData - Finished checks");

    if (oweTypeErrors.length > 0)
      validationErrors.push({
        index: index,
        esuIndex: esuIndex,
        field: "oneWayExemptionType",
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
    // Enter a type.
    currentCheck = GetCheck(1700002, currentLookups, methodName, isScottish, showDebugMessages);
    if (includeCheck(currentCheck, isScottish) && !data.highwayDedicationCode) {
      hdCodeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Type is invalid.
    currentCheck = GetCheck(1700004, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.highwayDedicationCode &&
      !HighwayDedicationCode.find((x) => x.id === data.highwayDedicationCode)
    ) {
      hdCodeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End date cannot be before the start date.
    currentCheck = GetCheck(1700006, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.hdStartDate &&
      data.hdEndDate &&
      isEndBeforeStart(data.hdStartDate, data.hdEndDate)
    ) {
      hdEndDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Record end date cannot be before the start date.
    currentCheck = GetCheck(1700007, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.hdStartDate &&
      data.recordEndDate &&
      isEndBeforeStart(data.hdStartDate, data.recordEndDate)
    ) {
      hdEndDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Start time and end time must either both be blank or both have a value.
    currentCheck = GetCheck(1700008, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      ((!data.hdStartTime && data.hdEndTime) || (data.hdStartTime && !data.hdEndTime))
    ) {
      hdEndTimeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // End time cannot be before start time.
    currentCheck = GetCheck(1700009, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.hdStartTime &&
      data.hdEndTime &&
      isEndBeforeStart(data.hdStartTime, data.hdEndTime, false)
    ) {
      hdEndTimeErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Seasonal start date and seasonal end date must either both be blank or both have a value.
    currentCheck = GetCheck(1700012, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      ((!data.hdSeasonalStartDate && data.hdSeasonalEndDate) || (data.hdSeasonalStartDate && !data.hdSeasonalEndDate))
    ) {
      hdSeasonalEndDateErrors.push(GetErrorMessage(currentCheck, isScottish));
    }

    // Seasonal end date cannot be before the seasonal start date.
    currentCheck = GetCheck(1700029, currentLookups, methodName, isScottish, showDebugMessages);
    if (
      includeCheck(currentCheck, isScottish) &&
      data.hdSeasonalStartDate &&
      data.hdSeasonalEndDate &&
      isEndBeforeStart(data.hdSeasonalStartDate, data.hdSeasonalEndDate)
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
  const methodName = "ValidateStreetSuccessorCrossRefData";
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

    if (showDebugMessages) console.log("[DEBUG] ValidateStreetSuccessorCrossRefData - Finished checks");

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
 * Validates a maintenance responsibility record
 *
 * @param {object} data The maintenance responsibility record data that needs to be validated
 * @param {number} index The index for the maintenance responsibility record.
 * @param {object} currentLookups The lookup context object.
 * @return {array|null} Array of validation errors found, if any.
 */
export function ValidateMaintenanceResponsibilityData(data, index, currentLookups) {
  const methodName = "ValidateMaintenanceResponsibilityData";
  let validationErrors = [];
  let currentCheck;
  let specificLocationErrors = [];
  let custodianErrors = [];
  let maintainingAuthorityErrors = [];
  let streetStatusErrors = [];
  let stateErrors = [];
  let endDateErrors = [];
  let startDateErrors = [];
  let wholeRoadErrors = [];
  let wktGeometryErrors = [];

  if (data) {
    // Specify location is too long.
    currentCheck = GetCheck(5100008, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.specificLocation && data.specificLocation.length > 250) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a custodian.
    currentCheck = GetCheck(5100009, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && !data.custodianCode) {
      custodianErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Custodian is invalid.
    currentCheck = GetCheck(5100010, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.custodianCode && !SwaOrgRef.find((x) => x.id === data.custodianCode)) {
      custodianErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Authority is invalid.
    currentCheck = GetCheck(5100011, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, true) &&
      data.maintainingAuthorityCode &&
      !SwaOrgRef.find((x) => x.id === data.maintainingAuthorityCode)
    ) {
      maintainingAuthorityErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter an authority.
    currentCheck = GetCheck(5100012, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && !data.maintainingAuthorityCode) {
      maintainingAuthorityErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a street status.
    currentCheck = GetCheck(5100013, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && !data.streetStatus) {
      streetStatusErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Street status is invalid.
    currentCheck = GetCheck(5100014, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, true) &&
      data.streetStatus &&
      !RoadStatusCode.find((x) => x.id === data.streetStatus && x.osText && x.osText.length > 0)
    ) {
      streetStatusErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a state.
    currentCheck = GetCheck(5100015, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && !data.state) {
      stateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // State is invalid.
    currentCheck = GetCheck(5100016, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.state && ![1, 2].includes(data.state)) {
      stateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // State is 2 but end date is not set.
    currentCheck = GetCheck(5100017, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.state && data.state === 2 && !data.endDate) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // State is 1 but end date is set.
    currentCheck = GetCheck(5100018, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.state && data.state === 1 && data.endDate) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Start date cannot be in the future.
    currentCheck = GetCheck(5100019, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.startDate && isFutureDate(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // End date cannot be in the future.
    currentCheck = GetCheck(5100020, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.endDate && isFutureDate(data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // End date cannot be before the start date.
    currentCheck = GetCheck(5100021, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, true) &&
      data.startDate &&
      data.endDate &&
      isEndBeforeStart(data.startDate, data.endDate)
    ) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If whole road set specify location must be blank.
    currentCheck = GetCheck(5100022, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.wholeRoad && data.specificLocation) {
      wholeRoadErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If whole road not set specify location must be set.
    currentCheck = GetCheck(5100023, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && !data.wholeRoad && !data.specificLocation) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a start date.
    currentCheck = GetCheck(5100026, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && !data.startDate) {
      startDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Specify location contains invalid characters.
    currentCheck = GetCheck(5100029, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.specificLocation && !isIso885914(data.specificLocation)) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Authority does not exist in the RAUCS SWA org ref table.
    currentCheck = GetCheck(5100030, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, true) &&
      data.maintainingAuthorityCode &&
      !SwaOrgRef.find((x) => x.id === data.maintainingAuthorityCode)
    ) {
      maintainingAuthorityErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter geometry.
    currentCheck = GetCheck(5100032, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && !data.wktGeometry) {
      wktGeometryErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Specify location cannot end with a backslash (\\).
    currentCheck = GetCheck(5100033, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, true) &&
      data.specificLocation &&
      data.specificLocation[data.specificLocation.length - 1] === "\\"
    ) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Specify location cannot end with a hyphen (-).
    currentCheck = GetCheck(5100034, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, true) &&
      data.specificLocation &&
      data.specificLocation[data.specificLocation.length - 1] === "-"
    ) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    if (showDebugMessages) console.log("[DEBUG] ValidateMaintenanceResponsibilityData - Finished checks");

    if (specificLocationErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SpecificLocation",
        errors: specificLocationErrors,
      });

    if (custodianErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "Custodian",
        errors: custodianErrors,
      });

    if (maintainingAuthorityErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "MaintainingAuthority",
        errors: maintainingAuthorityErrors,
      });

    if (streetStatusErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "StreetStatus",
        errors: streetStatusErrors,
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

    if (wholeRoadErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "WholeRoad",
        errors: wholeRoadErrors,
      });

    if (wktGeometryErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "WholeRoad",
        errors: wktGeometryErrors,
      });
  }

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
  const methodName = "ValidateReinstatementCategoryData";
  let validationErrors = [];
  let currentCheck;
  let specificLocationErrors = [];
  let custodianErrors = [];
  let reinstatementAuthorityErrors = [];
  let reinstatementCategoryErrors = [];
  let stateErrors = [];
  let endDateErrors = [];
  let startDateErrors = [];
  let wholeRoadErrors = [];
  let wktGeometryErrors = [];

  if (data) {
    // Specify location is too long.
    currentCheck = GetCheck(5200008, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.specificLocation && data.specificLocation.length > 250) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a custodian.
    currentCheck = GetCheck(5200009, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && !data.custodianCode) {
      custodianErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Custodian is invalid.
    currentCheck = GetCheck(5200010, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.custodianCode && !SwaOrgRef.find((x) => x.id === data.custodianCode)) {
      custodianErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Authority is invalid.
    currentCheck = GetCheck(5200011, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, true) &&
      data.reinstatementAuthorityCode &&
      !SwaOrgRef.find((x) => x.id === data.reinstatementAuthorityCode)
    ) {
      reinstatementAuthorityErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter an authority.
    currentCheck = GetCheck(5200012, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && !data.reinstatementAuthorityCode) {
      reinstatementAuthorityErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a reinstatement category.
    currentCheck = GetCheck(5200013, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && !data.reinstatementCategoryCode) {
      reinstatementCategoryErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Reinstatement category is invalid.
    currentCheck = GetCheck(5200014, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, true) &&
      data.reinstatementCategoryCode &&
      !ReinstatementType.find((x) => x.id === data.reinstatementCategoryCode && x.osText)
    ) {
      reinstatementCategoryErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a state.
    currentCheck = GetCheck(5200015, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && !data.state) {
      stateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // State is invalid.
    currentCheck = GetCheck(5200016, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.state && ![1, 2].includes(data.state)) {
      stateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // State is 2 but end date is not set.
    currentCheck = GetCheck(5200017, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.state && data.state === 2 && !data.endDate) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Start date cannot be in the future.
    currentCheck = GetCheck(5200018, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.startDate && isFutureDate(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // End date cannot be in the future.
    currentCheck = GetCheck(5200019, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.endDate && isFutureDate(data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // End date cannot be before the start date.
    currentCheck = GetCheck(5200020, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, true) &&
      data.startDate &&
      data.endDate &&
      isEndBeforeStart(data.startDate, data.endDate)
    ) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If whole road set specify location must be blank.
    currentCheck = GetCheck(5200021, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.wholeRoad && data.specificLocation) {
      wholeRoadErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If whole road not set specify location must be set.
    currentCheck = GetCheck(5200022, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && !data.wholeRoad && !data.specificLocation) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a start date.
    currentCheck = GetCheck(5200025, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && !data.startDate) {
      startDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Specify location contains invalid characters.
    currentCheck = GetCheck(5200026, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.specificLocation && !isIso885914(data.specificLocation)) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Custodian does not exist in the RAUCS SWA org ref table.
    currentCheck = GetCheck(5200027, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.custodianCode && !SwaOrgRef.find((x) => x.id === data.custodianCode)) {
      custodianErrors.push(GetErrorMessage(currentCheck, true));
    }

    // State is 1 but end date is set.
    currentCheck = GetCheck(5200030, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.state && data.state === 1 && data.endDate) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter geometry.
    currentCheck = GetCheck(5200031, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && !data.wktGeometry) {
      wktGeometryErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Specify location cannot end with a backslash (\\).
    currentCheck = GetCheck(5200032, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, true) &&
      data.specificLocation &&
      data.specificLocation[data.specificLocation.length - 1] === "\\"
    ) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Specify location cannot end with a hyphen (-).
    currentCheck = GetCheck(5200033, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, true) &&
      data.specificLocation &&
      data.specificLocation[data.specificLocation.length - 1] === "-"
    ) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    if (showDebugMessages) console.log("[DEBUG] ValidateReinstatementCategoryData - Finished checks");

    if (specificLocationErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SpecificLocation",
        errors: specificLocationErrors,
      });

    if (custodianErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "Custodian",
        errors: custodianErrors,
      });

    if (reinstatementAuthorityErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ReinstatementAuthority",
        errors: reinstatementAuthorityErrors,
      });

    if (reinstatementCategoryErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ReinstatementCategory",
        errors: reinstatementCategoryErrors,
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

    if (wholeRoadErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "WholeRoad",
        errors: wholeRoadErrors,
      });

    if (wktGeometryErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "WholeRoad",
        errors: wktGeometryErrors,
      });
  }

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
  let specificLocationErrors = [];
  let wholeRoadErrors = [];
  let wktGeometryErrors = [];

  if (data) {
    // Enter a custodian.
    currentCheck = GetCheck(5300007, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && !data.custodianCode) {
      custodianErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Custodian is invalid.
    currentCheck = GetCheck(5300008, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.custodianCode && !SwaOrgRef.find((x) => x.id === data.custodianCode)) {
      custodianErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Authority is invalid.
    currentCheck = GetCheck(5300011, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.authorityCode && !SwaOrgRef.find((x) => x.id === data.authorityCode)) {
      authorityErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter an authority.
    currentCheck = GetCheck(5300012, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && !data.authorityCode) {
      authorityErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a special designation.
    currentCheck = GetCheck(5300013, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && !data.specialDesig) {
      specialDesignationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Type is invalid.
    currentCheck = GetCheck(5300014, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, true) &&
      data.specialDesig &&
      !SpecialDesignationCode.find((x) => x.id === data.specialDesig && x.osText)
    ) {
      specialDesignationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a description.
    currentCheck = GetCheck(5300015, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && !data.description) {
      descriptionErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Description is too long.
    currentCheck = GetCheck(5300016, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.description && data.description.length > 255) {
      descriptionErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a state.
    currentCheck = GetCheck(5300017, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && !data.state) {
      stateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // State is invalid.
    currentCheck = GetCheck(5300018, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.state && ![1, 2].includes(data.state)) {
      stateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // State is 2 but end date is not set.
    currentCheck = GetCheck(5300019, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.state && data.state === 2 && !data.endDate) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Start date cannot be in the future.
    currentCheck = GetCheck(5300020, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.state && data.startDate && isFutureDate(data.startDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // End date cannot be in the future.
    currentCheck = GetCheck(5300021, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.state && data.endDate && isFutureDate(data.endDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // End date cannot be before the start date.
    currentCheck = GetCheck(5300022, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, true) &&
      data.state &&
      data.startDate &&
      data.endDate &&
      isEndBeforeStart(data.startDate, data.endDate)
    ) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Specify location is too long.
    currentCheck = GetCheck(5300023, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.specificLocation && data.specificLocation.length > 250) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If whole road set specify location must be blank.
    currentCheck = GetCheck(5300024, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.wholeRoad && data.specificLocation) {
      wholeRoadErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If whole road not set specify location must be set.
    currentCheck = GetCheck(5300025, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && !data.wholeRoad && !data.specificLocation) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a start date.
    currentCheck = GetCheck(5300027, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && !data.startDate) {
      startDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Specify location contains invalid characters.
    currentCheck = GetCheck(5300028, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.specificLocation && !isIso885914(data.specificLocation)) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Custodian does not exist in the RAUCS SWA org ref table.
    currentCheck = GetCheck(5300029, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.custodianCode && !SwaOrgRef.find((x) => x.id === data.custodianCode)) {
      custodianErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Description contains invalid characters.
    currentCheck = GetCheck(5300032, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.description && !isIso885914(data.description)) {
      descriptionErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter geometry.
    currentCheck = GetCheck(5300033, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && !data.wktGeometry) {
      wktGeometryErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Specify location cannot end with a backslash (\\).
    currentCheck = GetCheck(5300034, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, true) &&
      data.specificLocation &&
      data.specificLocation[data.specificLocation.length - 1] === "\\"
    ) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Specify location cannot end with a hyphen (-).
    currentCheck = GetCheck(5300035, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, true) &&
      data.specificLocation &&
      data.specificLocation[data.specificLocation.length - 1] === "-"
    ) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // State is 1 but end date is set.
    currentCheck = GetCheck(5300036, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, true) && data.state && data.state === 1 && data.endDate) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
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

    if (specificLocationErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SpecificLocation",
        errors: specificLocationErrors,
      });

    if (wholeRoadErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "WholeRoad",
        errors: wholeRoadErrors,
      });

    if (wktGeometryErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "WholeRoad",
        errors: wktGeometryErrors,
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
  let specificLocationErrors = [];
  let wholeRoadErrors = [];
  let streetStatusErrors = [];
  let interestTypeErrors = [];
  let startDateErrors = [];
  let endDateErrors = [];
  let wktGeometryErrors = [];

  if (data) {
    // Start Easting(X) value is invalid.
    currentCheck = GetCheck(6100006, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.startX && (data.startX < 80000 || data.startX > 656100)) {
      startXErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Start Northing(Y) value is invalid.
    currentCheck = GetCheck(6100007, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.startY && (data.startY < 5000 || data.startY > 657700)) {
      startYErrors.push(GetErrorMessage(currentCheck, false));
    }

    // End Easting(X) value is invalid.
    currentCheck = GetCheck(6100008, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.endX && (data.endX < 80000 || data.endX > 656100)) {
      endXErrors.push(GetErrorMessage(currentCheck, false));
    }

    // End Northing(Y) value is invalid.
    currentCheck = GetCheck(6100009, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.endY && (data.endY < 5000 || data.endY > 657700)) {
      endYErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Authority is invalid.
    currentCheck = GetCheck(6100011, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.swaOrgRefAuthority &&
      !DETRCodes.find((x) => x.id === data.swaOrgRefAuthority)
    ) {
      swaOrgRefAuthorityErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Enter an authority.
    currentCheck = GetCheck(6100012, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && !data.swaOrgRefAuthority) {
      swaOrgRefAuthorityErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Enter a district.
    currentCheck = GetCheck(6100013, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && !data.districtRefAuthority) {
      districtRefAuthorityErrors.push(GetErrorMessage(currentCheck, false));
    }

    // District is invalid.
    currentCheck = GetCheck(6100014, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.districtRefAuthority &&
      !currentLookups.operationalDistricts.find((x) => x.districtId === data.districtRefAuthority)
    ) {
      districtRefAuthorityErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Specify location is too long.
    currentCheck = GetCheck(6100021, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.specificLocation && data.specificLocation.length > 250) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If whole road set specify location must be blank.
    currentCheck = GetCheck(6100022, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.specificLocation && data.wholeRoad) {
      wholeRoadErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If whole road not set specify location must be set.
    currentCheck = GetCheck(6100023, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && !data.specificLocation && !data.wholeRoad) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Specify location contains an invalid character.
    currentCheck = GetCheck(6100027, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.specificLocation && !isIso885914(data.specificLocation)) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Street status is invalid.
    currentCheck = GetCheck(6100029, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.streetStatus &&
      !filteredLookup(RoadStatusCode, false).find((x) => x.id === data.streetStatus)
    ) {
      streetStatusErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter an interest type.
    currentCheck = GetCheck(6100030, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && !data.interestType) {
      interestTypeErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Interest type is invalid.
    currentCheck = GetCheck(6100031, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.interestType &&
      !InterestType.find((x) => x.id === data.interestType)
    ) {
      interestTypeErrors.push(GetErrorMessage(currentCheck, true));
    }

    // An interest type of 8 or 9 must not have street status of 1, 2, 3 or 5.
    currentCheck = GetCheck(6100035, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.interestType &&
      data.streetStatus &&
      [8, 9].includes(data.interestType) &&
      [1, 2, 3, 5].includes(data.streetStatus)
    ) {
      interestTypeErrors.push(GetErrorMessage(currentCheck, true));
      streetStatusErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Maintaining organisation is invalid.
    currentCheck = GetCheck(6100036, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.swaOrgRefAuthority &&
      !filteredLookup(SwaOrgRef, false).find((x) => x.id === data.swaOrgRefAuthority)
    ) {
      swaOrgRefAuthorityErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Interested organisation code must not be 0011, 0012, 0013, 0014, 0016, 0020 or 7093.
    currentCheck = GetCheck(6100037, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.swaOrgRefAuthority &&
      [11, 12, 13, 14, 16, 20, 7093].includes(data.swaOrgRefAuthority)
    ) {
      swaOrgRefAuthorityErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Interested organisation street status of 4 must have an interest type of 8 or 9.
    currentCheck = GetCheck(6100038, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.interestType &&
      data.streetStatus &&
      data.streetStatus === 4 &&
      ![8, 9].includes(data.interestType)
    ) {
      interestTypeErrors.push(GetErrorMessage(currentCheck, true));
      streetStatusErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Start date cannot be in the future.
    currentCheck = GetCheck(6100040, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.recordStartDate && isFutureDate(data.recordStartDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // End date cannot be in the future.
    currentCheck = GetCheck(6100041, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.recordEndDate && isFutureDate(data.recordEndDate)) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // End date cannot be before the start date.
    currentCheck = GetCheck(6100042, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.recordStartDate &&
      data.recordEndDate &&
      isEndBeforeStart(data.recordStartDate, data.recordEndDate)
    ) {
      endDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Start date prior to 1990 is not allowed.
    currentCheck = GetCheck(6100043, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.recordStartDate && isPriorTo1990(data.recordStartDate)) {
      startDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter geometry.
    currentCheck = GetCheck(6100044, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && !data.wktGeometry) {
      wktGeometryErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Specify location contains invalid characters.
    currentCheck = GetCheck(6100045, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.specificLocation && !isIso885914(data.specificLocation)) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Interested organisation does not exist in the SWA org ref table.
    currentCheck = GetCheck(6100046, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.swaOrgRefAuthority &&
      (!filteredLookup(SwaOrgRef, false).find((x) => x.id === data.swaOrgRefAuthority) ||
        [11, 12, 13, 14, 16, 20, 7093].includes(data.swaOrgRefAuthority))
    ) {
      swaOrgRefAuthorityErrors.push(GetErrorMessage(currentCheck, true));
    }

    // District does not exist in the operational district table.
    currentCheck = GetCheck(6100047, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.districtRefAuthority &&
      !currentLookups.operationalDistricts.find((x) => x.districtId === data.districtRefAuthority)
    ) {
      districtRefAuthorityErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Enter a start date.
    currentCheck = GetCheck(6100049, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && !data.recordStartDate) {
      startDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Interested organisation interest type of 1 must have a street status of 1, 2, 3 or 5.
    currentCheck = GetCheck(6100050, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.interestType &&
      data.streetStatus &&
      data.interestType === 1 &&
      ![1, 2, 3, 5].includes(data.streetStatus)
    ) {
      interestTypeErrors.push(GetErrorMessage(currentCheck, true));
      streetStatusErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If whole road not set then specify location must not contain "WHOLE ROAD".
    currentCheck = GetCheck(6100051, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      !data.wholeRoad &&
      data.specificLocation &&
      data.specificLocation.toLowerCase().includes("whole road")
    ) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If maintaining organisation is 0011, 0012, 0014, 0016, or 0020, street status must be 4.
    currentCheck = GetCheck(6100052, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.swaOrgRefAuthMaintaining &&
      [11, 12, 14, 16, 20].includes(data.swaOrgRefAuthMaintaining) &&
      data.streetStatus !== 4
    ) {
      streetStatusErrors.push(GetErrorMessage(currentCheck, true));
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

    if (specificLocationErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SpecificLocation",
        errors: specificLocationErrors,
      });

    if (wholeRoadErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "WholeRoad",
        errors: wholeRoadErrors,
      });

    if (streetStatusErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "StreetStatus",
        errors: streetStatusErrors,
      });

    if (interestTypeErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "InterestType",
        errors: interestTypeErrors,
      });

    if (startDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "RecordStartDate",
        errors: startDateErrors,
      });

    if (endDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "RecordEndDate",
        errors: endDateErrors,
      });

    if (wktGeometryErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "WholeRoad",
        errors: wktGeometryErrors,
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
  let specificLocationErrors = [];
  let recordStartDateErrors = [];
  let recordEndDateErrors = [];
  let wholeRoadErrors = [];
  let constructionDescriptionErrors = [];
  let wktGeometryErrors = [];

  if (data) {
    // Start Easting(X) value is invalid.
    currentCheck = GetCheck(6200006, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.constructionStartX &&
      (data.constructionStartX < 80000 || data.constructionStartX > 656100)
    ) {
      startXErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Start Northing(Y) value is invalid.
    currentCheck = GetCheck(6200007, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.constructionStartY &&
      (data.constructionStartY < 5000 || data.constructionStartY > 657700)
    ) {
      startYErrors.push(GetErrorMessage(currentCheck, false));
    }

    // End Easting(X) value is invalid.
    currentCheck = GetCheck(6200008, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.constructionEndX &&
      (data.constructionEndX < 80000 || data.constructionEndX > 656100)
    ) {
      endXErrors.push(GetErrorMessage(currentCheck, false));
    }

    // End Northing(Y) value is invalid.
    currentCheck = GetCheck(6200009, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.constructionEndY &&
      (data.constructionEndY < 5000 || data.constructionEndY > 657700)
    ) {
      endYErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Organisation does not exist in the SWA org ref table.
    currentCheck = GetCheck(6200014, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.swaOrgRefConsultant &&
      (!filteredLookup(SwaOrgRef, false).find((x) => x.id === data.swaOrgRefConsultant) ||
        [11, 12, 13, 14, 16, 20, 7093].includes(data.swaOrgRefConsultant))
    ) {
      swaOrgRefConsultantErrors.push(GetErrorMessage(currentCheck, false));
    }

    // District is invalid.
    currentCheck = GetCheck(6200015, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.districtRefConsultant &&
      !currentLookups.operationalDistricts.find((x) => x.districtId === data.districtRefConsultant)
    ) {
      districtRefConsultantErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Enter a construction reinstatement type.
    currentCheck = GetCheck(6200016, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.constructionType === 1 && !data.reinstatementTypeCode) {
      reinstatementTypeCodeErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Reinstatement type is invalid.
    currentCheck = GetCheck(6200017, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.reinstatementTypeCode &&
      !ReinstatementType.find((x) => x.id === data.reinstatementTypeCode)
    ) {
      reinstatementTypeCodeErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Enter a construction type.
    currentCheck = GetCheck(6200018, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && !data.constructionType) {
      constructionTypeErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Construction type is invalid.
    currentCheck = GetCheck(6200019, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.constructionType &&
      !ConstructionType.find((x) => x.id === data.constructionType)
    ) {
      constructionTypeErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Aggregate abrasion value is invalid.
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

    // Polished stone value invalid.
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

    // Specify location is too long.
    currentCheck = GetCheck(6200023, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.specificLocation && data.specificLocation.length > 250) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Start date cannot be in the future.
    currentCheck = GetCheck(6200024, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.recordStartDate && isFutureDate(data.recordStartDate)) {
      recordStartDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // End date cannot be in the future.
    currentCheck = GetCheck(6200025, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.recordEndDate && isFutureDate(data.recordEndDate)) {
      recordEndDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // End date cannot be before the start date.
    currentCheck = GetCheck(6200026, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.recordStartDate &&
      data.recordEndDate &&
      isEndBeforeStart(data.recordStartDate, data.recordEndDate)
    ) {
      recordEndDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If whole road set specify location must be blank.
    currentCheck = GetCheck(6200027, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.wholeRoad && data.specificLocation) {
      wholeRoadErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If whole road not set specify location must be set.
    currentCheck = GetCheck(6200028, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && !data.wholeRoad && !data.specificLocation) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a start date.
    currentCheck = GetCheck(6200030, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && !data.recordStartDate) {
      recordStartDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // When construction type is 1, description must be blank.
    currentCheck = GetCheck(6200033, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.constructionType &&
      data.constructionType === 1 &&
      data.constructionDescription
    ) {
      constructionDescriptionErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Organisation and district must either both be blank or both have a value.
    currentCheck = GetCheck(6200038, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      ((data.swaOrgRefConsultant && !data.districtRefConsultant) ||
        (!data.swaOrgRefConsultant && data.districtRefConsultant))
    ) {
      swaOrgRefConsultantErrors.push(GetErrorMessage(currentCheck, true));
      districtRefConsultantErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Description contains an invalid character.
    currentCheck = GetCheck(6200046, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.constructionDescription &&
      !isIso885914(data.constructionDescription)
    ) {
      constructionDescriptionErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Description is too long.
    currentCheck = GetCheck(6200047, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.constructionDescription &&
      data.constructionDescription.length > 250
    ) {
      constructionDescriptionErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Specify location contains invalid characters.
    currentCheck = GetCheck(6200048, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.specificLocation && !isIso885914(data.specificLocation)) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Organisation code of 0011, 0012, 013, 0014, 0016, 0020 or 7093 must not be used.
    currentCheck = GetCheck(6200050, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.swaOrgRefConsultant &&
      [11, 12, 13, 14, 16, 20, 7093].includes(data.swaOrgRefConsultant)
    ) {
      swaOrgRefConsultantErrors.push(GetErrorMessage(currentCheck, true));
    }

    // District does not exist in the operational district table.
    currentCheck = GetCheck(6200051, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.districtRefConsultant &&
      !currentLookups.operationalDistricts.find((x) => x.districtId === data.districtRefConsultant)
    ) {
      swaOrgRefConsultantErrors.push(GetErrorMessage(currentCheck, true));
    }

    //Reinstatement type must not be present when construction type is 2 or 3.
    currentCheck = GetCheck(6200052, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.constructionType &&
      [2, 3].includes(data.constructionType) &&
      data.reinstatementTypeCode
    ) {
      reinstatementTypeCodeErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If whole road not set then specify location must not contain "WHOLE ROAD".
    currentCheck = GetCheck(6200053, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      !data.wholeRoad &&
      data.specificLocation &&
      data.specificLocation.toLowerCase().includes("whole road")
    ) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter geometry.
    currentCheck = GetCheck(6200055, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && !data.wktGeometry) {
      wktGeometryErrors.push(GetErrorMessage(currentCheck, true));
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

    if (specificLocationErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SpecificLocation",
        errors: specificLocationErrors,
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

    if (wholeRoadErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "WholeRoad",
        errors: wholeRoadErrors,
      });

    if (wktGeometryErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "WholeRoad",
        errors: wktGeometryErrors,
      });

    if (constructionDescriptionErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ConstructionDescription",
        errors: constructionDescriptionErrors,
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
  let specialDesigStartTimeErrors = [];
  let specialDesigEndTimeErrors = [];
  let specificLocationErrors = [];
  let wholeRoadErrors = [];
  let swaOrgRefConsultantCodeErrors = [];
  let districtRefConsultantErrors = [];
  let specialDesigSourceTextErrors = [];
  let wktGeometryErrors = [];

  if (data) {
    // Start Easting(X) value is invalid.
    currentCheck = GetCheck(6300006, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.specialDesigStartX &&
      (data.specialDesigStartX < 80000 || data.specialDesigStartX > 656100)
    ) {
      startXErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Start Northing(Y) value is invalid.
    currentCheck = GetCheck(6300007, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.specialDesigStartY &&
      (data.specialDesigStartY < 5000 || data.specialDesigStartY > 657700)
    ) {
      startYErrors.push(GetErrorMessage(currentCheck, false));
    }

    // End Easting(X) value is invalid.
    currentCheck = GetCheck(6300008, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.specialDesigEndX &&
      (data.specialDesigEndX < 80000 || data.specialDesigEndX > 656100)
    ) {
      endXErrors.push(GetErrorMessage(currentCheck, false));
    }

    // End Northing(Y) value is invalid.
    currentCheck = GetCheck(6300009, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.specialDesigEndY &&
      (data.specialDesigEndY < 5000 || data.specialDesigEndY > 657700)
    ) {
      endYErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Record start date cannot be in the future.
    currentCheck = GetCheck(6300010, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.recordStartDate && isFutureDate(data.recordStartDate)) {
      recordStartDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Record end date cannot be in the future.
    currentCheck = GetCheck(6300011, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.recordEndDate && isFutureDate(data.recordEndDate)) {
      recordEndDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    // End date cannot be before the start date.
    currentCheck = GetCheck(6300012, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.recordEndDate &&
      data.recordStartDate &&
      isEndBeforeStart(data.recordStartDate, data.recordEndDate)
    ) {
      recordEndDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Enter a record start date.
    currentCheck = GetCheck(6300013, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && !data.recordStartDate) {
      recordStartDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    // End date cannot be before the special designation start date.
    currentCheck = GetCheck(6300014, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.specialDesigEndDate &&
      data.specialDesigStartDate &&
      isEndBeforeStart(data.specialDesigStartDate, data.specialDesigEndDate)
    ) {
      specialDesigEndDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Start date cannot be before the record start date.
    currentCheck = GetCheck(6300015, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.recordStartDate &&
      data.specialDesigStartDate &&
      isEndBeforeStart(data.recordStartDate, data.specialDesigStartDate)
    ) {
      specialDesigStartDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Type is invalid.
    currentCheck = GetCheck(6300016, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.streetSpecialDesigCode &&
      !SpecialDesignationCode.find((x) => x.id === data.streetSpecialDesigCode)
    ) {
      streetSpecialDesigCodeErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Enter a type.
    currentCheck = GetCheck(6300017, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && !data.streetSpecialDesigCode) {
      streetSpecialDesigCodeErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Enter a description.
    currentCheck = GetCheck(6300018, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      isAfter1stApril2015(data.recordStartDate) &&
      !data.specialDesigDescription
    ) {
      specialDesigDescriptionErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Description is too long.
    currentCheck = GetCheck(6300019, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.specialDesigDescription &&
      data.specialDesigDescription.length > 250
    ) {
      specialDesigDescriptionErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Periodicity is invalid.
    currentCheck = GetCheck(6300025, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.specialDesigPeriodicityCode &&
      !SpecialDesignationPeriodicity.find((x) => x.id === data.specialDesigPeriodicityCode)
    ) {
      specialDesigPeriodicityCodeErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Start time and end time must either both be blank or both have a value.
    currentCheck = GetCheck(6300029, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      ((data.specialDesigStartTime && !data.specialDesigEndTime) ||
        (!data.specialDesigStartTime && data.specialDesigEndTime))
    ) {
      specialDesigStartTimeErrors.push(GetErrorMessage(currentCheck, false));
    }

    // End time cannot be before start time.
    currentCheck = GetCheck(6300030, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.specialDesigStartTime &&
      data.specialDesigEndTime &&
      isEndBeforeStart(data.specialDesigStartTime, data.specialDesigEndTime, false)
    ) {
      specialDesigEndTimeErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Specify location is too long.
    currentCheck = GetCheck(6300031, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.specificLocation && data.specificLocation.length > 250) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If whole road set specify location must be blank.
    currentCheck = GetCheck(6300032, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.wholeRoad && data.specificLocation) {
      wholeRoadErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If whole road not set specify location must be set.
    currentCheck = GetCheck(6300033, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && !data.wholeRoad && !data.specificLocation) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Specify location contains invalid characters.
    currentCheck = GetCheck(6300037, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.specificLocation && !isIso885914(data.specificLocation)) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // When periodicity is 16, description is mandatory.
    currentCheck = GetCheck(6300038, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.specialDesigPeriodicityCode &&
      data.specialDesigPeriodicityCode === 16 &&
      !data.specialDesigDescription
    ) {
      specialDesigDescriptionErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Record start date prior to 1990 is not allowed.
    currentCheck = GetCheck(6300040, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.recordStartDate && isPriorTo1990(data.recordStartDate)) {
      recordStartDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a periodicity.
    currentCheck = GetCheck(6300042, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && !data.specialDesigPeriodicityCode) {
      specialDesigPeriodicityCodeErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Organisation codes of 0011, 0012, 013, 0014, 0016, 0020 or 7093 must not be used.
    currentCheck = GetCheck(6300043, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.swaOrgRefConsultant &&
      [11, 12, 13, 14, 16, 20, 7093].includes(data.swaOrgRefConsultant)
    ) {
      swaOrgRefConsultantCodeErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Organisation and district must either both be blank or both have a value.
    currentCheck = GetCheck(6300044, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      ((data.swaOrgRefConsultant && !data.districtRefConsultant) ||
        (!data.swaOrgRefConsultant && data.districtRefConsultant))
    ) {
      swaOrgRefConsultantCodeErrors.push(GetErrorMessage(currentCheck, true));
      districtRefConsultantErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Organisation does not exist in the SWA org ref table.
    currentCheck = GetCheck(6300045, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.swaOrgRefConsultant &&
      !SwaOrgRef.find((x) => x.id === data.swaOrgRefConsultant)
    ) {
      swaOrgRefConsultantCodeErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If type is 1,3,6,8,9,10,12,20,22,or 28 then the periodicity must be 1.
    currentCheck = GetCheck(6300046, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.streetSpecialDesigCode &&
      [1, 3, 6, 8, 9, 10, 12, 20, 22, 28].includes(data.streetSpecialDesigCode) &&
      (!data.specialDesigPeriodicityCode || data.specialDesigPeriodicityCode !== 1)
    ) {
      specialDesigPeriodicityCodeErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If whole road not set then specify location must not contain "WHOLE ROAD".
    currentCheck = GetCheck(6300047, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      !data.wholeRoad &&
      data.specificLocation &&
      data.specificLocation.toLowerCase().includes("whole road")
    ) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Source contains invalid characters.
    currentCheck = GetCheck(6300049, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.specialDesigSourceText && !isIso885914(data.specialDesigSourceText)) {
      specialDesigSourceTextErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Periodicity of 15 must have special designation start date and time and end date and time.
    currentCheck = GetCheck(6300050, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.specialDesigPeriodicityCode &&
      data.specialDesigPeriodicityCode === 15 &&
      !data.specialDesigStartDate
    ) {
      specialDesigStartDateErrors.push(GetErrorMessage(currentCheck, true));
    }
    if (
      includeCheck(currentCheck, false) &&
      data.specialDesigPeriodicityCode &&
      data.specialDesigPeriodicityCode === 15 &&
      !data.specialDesigEndDate
    ) {
      specialDesigEndDateErrors.push(GetErrorMessage(currentCheck, true));
    }
    if (
      includeCheck(currentCheck, false) &&
      data.specialDesigPeriodicityCode &&
      data.specialDesigPeriodicityCode === 15 &&
      !data.specialDesigStartTime
    ) {
      specialDesigStartTimeErrors.push(GetErrorMessage(currentCheck, true));
    }
    if (
      includeCheck(currentCheck, false) &&
      data.specialDesigPeriodicityCode &&
      data.specialDesigPeriodicityCode === 15 &&
      !data.specialDesigEndTime
    ) {
      specialDesigEndTimeErrors.push(GetErrorMessage(currentCheck, true));
    }

    // District does not exist in the operational district table.
    currentCheck = GetCheck(6300051, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.districtRefConsultant &&
      !currentLookups.operationalDistricts.find((x) => x.districtId === data.districtRefConsultant)
    ) {
      districtRefConsultantErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter geometry.
    currentCheck = GetCheck(6300052, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && !data.wktGeometry) {
      wktGeometryErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If type is 2 to 18, 20 or 22 to 30 and either start date or end date is present, both must be present.
    currentCheck = GetCheck(6300053, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.streetSpecialDesigCode &&
      [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 22, 23, 24, 25, 26, 27, 28, 29, 30].includes(
        data.streetSpecialDesigCode
      ) &&
      ((data.specialDesigStartDate && !data.specialDesigEndDate) ||
        (!data.specialDesigStartDate && data.specialDesigEndDate))
    ) {
      specialDesigStartDateErrors.push(GetErrorMessage(currentCheck, true));
      specialDesigEndDateErrors.push(GetErrorMessage(currentCheck, true));
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

    if (specialDesigStartTimeErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SpecialDesigStartTime",
        errors: specialDesigStartTimeErrors,
      });

    if (specialDesigEndTimeErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SpecialDesigEndTime",
        errors: specialDesigEndTimeErrors,
      });

    if (specificLocationErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SpecificLocation",
        errors: specificLocationErrors,
      });

    if (wholeRoadErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "WholeRoad",
        errors: wholeRoadErrors,
      });

    if (wktGeometryErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "WholeRoad",
        errors: wktGeometryErrors,
      });

    if (swaOrgRefConsultantCodeErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SwaOrgRefConsultantCode",
        errors: swaOrgRefConsultantCodeErrors,
      });

    if (districtRefConsultantErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "DistrictRefConsultant",
        errors: districtRefConsultantErrors,
      });

    if (specialDesigSourceTextErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SpecialDesigSourceText",
        errors: specialDesigSourceTextErrors,
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
  let specificLocationErrors = [];
  let recordEndDateErrors = [];
  let recordStartDateErrors = [];
  let wholeRoadErrors = [];
  let troTextErrors = [];
  let featureDescriptionErrors = [];
  let swaOrgRefConsultantErrors = [];
  let districtRefConsultantErrors = [];
  let sourceTextErrors = [];
  let valueMetricErrors = [];

  if (data) {
    // Type is invalid.
    currentCheck = GetCheck(6400005, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.hwwRestrictionCode &&
      !HWWDesignationCode.find((x) => x.id === data.hwwRestrictionCode)
    ) {
      restrictionCodeErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Enter a type.
    currentCheck = GetCheck(6400006, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && !data.hwwRestrictionCode) {
      restrictionCodeErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Start Easting(X) value is invalid.
    currentCheck = GetCheck(6400009, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      !data.wholeRoad &&
      data.hwwStartX &&
      (data.hwwStartX < 80000 || data.hwwStartX > 656100)
    ) {
      startXErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Start Northing(Y) value is invalid.
    currentCheck = GetCheck(6400010, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      !data.wholeRoad &&
      data.hwwStartY &&
      (data.hwwStartY < 5000 || data.hwwStartY > 657700)
    ) {
      startYErrors.push(GetErrorMessage(currentCheck, false));
    }

    // End Easting(X) value is invalid.
    currentCheck = GetCheck(6400011, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      !data.wholeRoad &&
      data.hwwEndX &&
      (data.hwwEndX < 80000 || data.hwwEndX > 656100)
    ) {
      endXErrors.push(GetErrorMessage(currentCheck, false));
    }

    // End Northing(Y) value is invalid.
    currentCheck = GetCheck(6400012, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      !data.wholeRoad &&
      data.hwwEndY &&
      (data.hwwEndY < 5000 || data.hwwEndY > 657700)
    ) {
      endYErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Specify location is too long.
    currentCheck = GetCheck(6400016, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.specificLocation && data.specificLocation.length > 250) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Record end date cannot be before the record start date.
    currentCheck = GetCheck(6400018, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.recordStartDate &&
      data.recordEndDate &&
      isEndBeforeStart(data.recordStartDate, data.recordEndDate)
    ) {
      recordEndDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Record end date cannot be in the future.
    currentCheck = GetCheck(6400019, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.recordEndDate && isFutureDate(data.recordEndDate)) {
      recordEndDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If whole road set specify location and coordinates must be blank.
    currentCheck = GetCheck(6400021, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.wholeRoad &&
      (data.specificLocation || data.hwwStartX || data.hwwStartY || data.hwwEndX || data.hwwEndY)
    ) {
      wholeRoadErrors.push(GetErrorMessage(currentCheck, true));
    }

    // If whole road not set specify location and coordinates must be set.
    currentCheck = GetCheck(6400022, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      !data.wholeRoad &&
      (!data.specificLocation || !data.hwwStartX || !data.hwwStartY || !data.hwwEndX || !data.hwwEndY)
    ) {
      wholeRoadErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Specify location contains invalid characters.
    currentCheck = GetCheck(6400023, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.specificLocation && !isIso885914(data.specificLocation)) {
      specificLocationErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Value is invalid.
    currentCheck = GetCheck(6400025, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.valueMetric && (data.valueMetric < 0.0 || data.valueMetric > 99.9)) {
      valueMetricErrors.push(GetErrorMessage(currentCheck, true));
    }

    // TRO text is too long.
    currentCheck = GetCheck(6400026, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.troText && data.troText.length > 250) {
      troTextErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Height, width, weight restriction TRO text contains invalid characters.
    currentCheck = GetCheck(6400027, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.troText && !isIso885914(data.troText)) {
      troTextErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Description is too long.
    currentCheck = GetCheck(6400028, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.featureDescription && data.featureDescription.length > 250) {
      featureDescriptionErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Description contains invalid characters.
    currentCheck = GetCheck(6400029, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.featureDescription && !isIso885914(data.featureDescription)) {
      featureDescriptionErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Organisation code of 0011, 0012, 013, 0014, 0016, 0020 or 7093 must not be used.
    currentCheck = GetCheck(6400030, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.swaOrgRefConsultant &&
      [11, 12, 13, 14, 16, 20, 7093].includes(data.swaOrgRefConsultant)
    ) {
      swaOrgRefConsultantErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Organisation and district must either both be blank or both have a value.
    currentCheck = GetCheck(6400031, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      ((data.swaOrgRefConsultant && !data.districtRefConsultant) ||
        (!data.swaOrgRefConsultant && data.districtRefConsultant))
    ) {
      swaOrgRefConsultantErrors.push(GetErrorMessage(currentCheck, true));
      districtRefConsultantErrors.push(GetErrorMessage(currentCheck, true));
    }

    // District is invalid.
    currentCheck = GetCheck(6400032, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.districtRefConsultant &&
      !currentLookups.operationalDistricts.find((x) => x.districtId === data.districtRefConsultant)
    ) {
      districtRefConsultantErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Source is too long.
    currentCheck = GetCheck(6400039, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.sourceText && data.sourceText.length > 120) {
      sourceTextErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Source contains invalid characters.
    currentCheck = GetCheck(6400040, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.sourceText && !isIso885914(data.sourceText)) {
      sourceTextErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a record start date.
    currentCheck = GetCheck(6400043, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && !data.recordStartDate) {
      recordStartDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Record start date cannot be in the future.
    currentCheck = GetCheck(6400044, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.recordStartDate && isFutureDate(data.recordStartDate)) {
      recordStartDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Record start date prior to 1990 are not allowed.
    currentCheck = GetCheck(6400045, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.recordStartDate && isPriorTo1990(data.recordStartDate)) {
      recordStartDateErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Enter a value.
    currentCheck = GetCheck(6400046, currentLookups, methodName, true, showDebugMessages);
    if (includeCheck(currentCheck, false) && !data.valueMetric) {
      valueMetricErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Organisation does not exist in the SWA org ref table.
    currentCheck = GetCheck(6400047, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.swaOrgRefConsultant &&
      (!filteredLookup(SwaOrgRef, false).find((x) => x.id === data.swaOrgRefConsultant) ||
        [11, 12, 13, 14, 16, 20, 7093].includes(data.swaOrgRefConsultant))
    ) {
      swaOrgRefConsultantErrors.push(GetErrorMessage(currentCheck, true));
    }

    // District does not exist in the operational district table.
    currentCheck = GetCheck(6400048, currentLookups, methodName, true, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.districtRefConsultant &&
      !currentLookups.operationalDistricts.find((x) => x.districtId === data.districtRefConsultant)
    ) {
      districtRefConsultantErrors.push(GetErrorMessage(currentCheck, true));
    }

    // Organisation is invalid.
    currentCheck = GetCheck(6400049, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.swaOrgRefConsultant &&
      !filteredLookup(SwaOrgRef, false).find((x) => x.id === data.swaOrgRefConsultant)
    ) {
      swaOrgRefConsultantErrors.push(GetErrorMessage(currentCheck, true));
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

    if (specificLocationErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SpecificLocation",
        errors: specificLocationErrors,
      });

    if (recordEndDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "RecordEndDate",
        errors: recordEndDateErrors,
      });

    if (recordStartDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "RecordStartDate",
        errors: recordStartDateErrors,
      });

    if (wholeRoadErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "WholeRoad",
        errors: wholeRoadErrors,
      });

    if (troTextErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "TroText",
        errors: troTextErrors,
      });

    if (featureDescriptionErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "FeatureDescription",
        errors: featureDescriptionErrors,
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

    if (sourceTextErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SourceText",
        errors: sourceTextErrors,
      });

    if (valueMetricErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ValueMetric",
        errors: valueMetricErrors,
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
 * @param {number} authorityCode The current authority code.
 * @return {array|null} Array of validation errors found, if any.
 */
export function ValidatePublicRightOfWayData(data, index, currentLookups, authorityCode) {
  const methodName = "ValidatePublicRightOfWayData";
  let validationErrors = [];
  let currentCheck;
  let prowRightsErrors = [];
  let prowStatusErrors = [];
  let prowLengthErrors = [];
  let defMapGeometryTypeErrors = [];
  let recordStartDateErrors = [];
  let relevantStartDateErrors = [];
  let recordEndDateErrors = [];
  let prowLocationErrors = [];
  let prowDetailsErrors = [];
  let sourceTextErrors = [];
  let prowOrgRefConsultantErrors = [];
  let prowDistrictRefConsultantErrors = [];
  let appealDetailsErrors = [];
  let appealRefErrors = [];
  let consultRefErrors = [];
  let consultDetailsErrors = [];
  let consultStartDateErrors = [];
  let consultEndDateErrors = [];
  let appealDateErrors = [];
  let divRelatedUsrnErrors = [];

  if (data) {
    // Enter a dedication.
    currentCheck = GetCheck(6600011, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && !data.prowRights) {
      prowRightsErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Dedication is invalid.
    currentCheck = GetCheck(6600012, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.prowRights &&
      !PRoWDedicationCode.find((x) => x.id === data.prowRights)
    ) {
      prowRightsErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Enter a status.
    currentCheck = GetCheck(6600013, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && !data.prowStatus) {
      prowStatusErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Status is invalid.
    currentCheck = GetCheck(6600014, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.prowStatus && !PRoWStatusCode.find((x) => x.id === data.prowStatus)) {
      prowStatusErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Length is invalid.
    currentCheck = GetCheck(6600017, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && (data.prowLength < 0 || data.prowLength > 99999)) {
      prowLengthErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Enter a geometry type.
    currentCheck = GetCheck(6600018, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && !data.defMapGeometryType) {
      defMapGeometryTypeErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Enter a length.
    currentCheck = GetCheck(6600019, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && !data.prowLength) {
      prowLengthErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Enter a record start date.
    currentCheck = GetCheck(6600027, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && !data.recordStartDate) {
      recordStartDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Record start date cannot be in the future.
    currentCheck = GetCheck(6600028, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.recordStartDate && isFutureDate(data.recordStartDate)) {
      recordStartDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Record start date prior to 1990 are not allowed.
    currentCheck = GetCheck(6600029, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.recordStartDate && isPriorTo1990(data.recordStartDate)) {
      recordStartDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Relevant start date prior to 1990 are not allowed.
    currentCheck = GetCheck(6600030, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.relevantStartDate && isPriorTo1990(data.relevantStartDate)) {
      relevantStartDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Record end date must be the same as or after the record entry date.
    currentCheck = GetCheck(6600031, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.recordStartDate &&
      data.recordEndDate &&
      isEndBeforeStart(data.recordStartDate, data.recordEndDate)
    ) {
      recordEndDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Record end date prior to 1990 are not allowed.
    currentCheck = GetCheck(6600032, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.recordEndDate && isPriorTo1990(data.recordEndDate)) {
      recordEndDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Record end date cannot be in the future.
    currentCheck = GetCheck(6600033, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.recordEndDate && isFutureDate(data.recordEndDate)) {
      recordEndDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Location is too long.
    currentCheck = GetCheck(6600034, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.prowLocation && data.prowLocation.length > 500) {
      prowLocationErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Location contains an invalid character.
    currentCheck = GetCheck(6600035, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.prowLocation && !isIso885914(data.prowLocation)) {
      prowLocationErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Details is too long.
    currentCheck = GetCheck(6600036, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.prowDetails && data.prowDetails.length > 500) {
      prowDetailsErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Details contains an invalid character.
    currentCheck = GetCheck(6600037, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.prowDetails && !isIso885914(data.prowDetails)) {
      prowDetailsErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Source is too long.
    currentCheck = GetCheck(6600040, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.sourceText && data.sourceText.length > 120) {
      sourceTextErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Source contains an invalid character.
    currentCheck = GetCheck(6600041, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.sourceText && !isIso885914(data.sourceText)) {
      sourceTextErrors.push(GetErrorMessage(currentCheck, false));
    }

    // PRoW org ref consultant is invalid.
    currentCheck = GetCheck(6600042, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.prowOrgRefConsultant &&
      !filteredLookup(SwaOrgRef, false).find((x) => x.id === data.prowOrgRefConsultant)
    ) {
      prowOrgRefConsultantErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Organisation and district must either both be blank or both have a value.
    currentCheck = GetCheck(6600043, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      ((data.prowOrgRefConsultant && !data.prowDistrictRefConsultant) ||
        (!data.prowOrgRefConsultant && data.prowDistrictRefConsultant))
    ) {
      prowOrgRefConsultantErrors.push(GetErrorMessage(currentCheck, false));
      prowDistrictRefConsultantErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Organisation is invalid.
    currentCheck = GetCheck(6600044, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.prowDistrictRefConsultant &&
      !currentLookups.operationalDistricts.find((x) => x.districtId === data.prowDistrictRefConsultant)
    ) {
      prowDistrictRefConsultantErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Enter a location.
    currentCheck = GetCheck(6600046, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && !data.prowLocation) {
      prowLocationErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Enter details.
    currentCheck = GetCheck(6600047, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && !data.prowDetails) {
      prowDetailsErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Appeal details is too long.
    currentCheck = GetCheck(6600048, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.appealDetails && data.appealDetails.length > 30) {
      appealDetailsErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Appeal reference is too long.
    currentCheck = GetCheck(6600049, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.appealRef && data.appealRef.length > 16) {
      appealRefErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Consultation reference is too long.
    currentCheck = GetCheck(6600050, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.consultRef && data.consultRef.length > 16) {
      consultRefErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Consultation details is too long.
    currentCheck = GetCheck(6600051, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.consultDetails && data.consultDetails.length > 30) {
      consultDetailsErrors.push(GetErrorMessage(currentCheck, false));
    }

    // For status = C the consultation start date, end date, reference and details must be present.
    currentCheck = GetCheck(6600053, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.prowStatus && data.prowStatus === "C" && !data.consultStartDate) {
      consultStartDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    if (includeCheck(currentCheck, false) && data.prowStatus && data.prowStatus === "C" && !data.consultEndDate) {
      consultEndDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    if (includeCheck(currentCheck, false) && data.prowStatus && data.prowStatus === "C" && !data.consultRef) {
      consultRefErrors.push(GetErrorMessage(currentCheck, false));
    }

    if (includeCheck(currentCheck, false) && data.prowStatus && data.prowStatus === "C" && !data.consultDetails) {
      consultDetailsErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Consultation end date must be the same as or after the consultation start date.
    currentCheck = GetCheck(6600054, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.consultStartDate &&
      data.consultEndDate &&
      isEndBeforeStart(data.consultStartDate, data.consultEndDate)
    ) {
      consultEndDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    // For status = A the Appeal reference, date and details must be present.
    currentCheck = GetCheck(6600055, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.prowStatus && data.prowStatus === "A" && !data.appealDate) {
      appealDateErrors.push(GetErrorMessage(currentCheck, false));
    }

    if (includeCheck(currentCheck, false) && data.prowStatus && data.prowStatus === "A" && !data.appealRef) {
      appealRefErrors.push(GetErrorMessage(currentCheck, false));
    }

    if (includeCheck(currentCheck, false) && data.prowStatus && data.prowStatus === "A" && !data.appealDetails) {
      appealDetailsErrors.push(GetErrorMessage(currentCheck, false));
    }

    // For status = D the diversion USRN must be present.
    currentCheck = GetCheck(6600056, currentLookups, methodName, false, showDebugMessages);
    if (includeCheck(currentCheck, false) && data.prowStatus && data.prowStatus === "D" && !data.divRelatedUsrn) {
      divRelatedUsrnErrors.push(GetErrorMessage(currentCheck, false));
    }

    // Organisation does not exist in the SWA org ref table.
    currentCheck = GetCheck(6600058, currentLookups, methodName, false, showDebugMessages);
    if (
      includeCheck(currentCheck, false) &&
      data.prowOrgRefConsultant &&
      (!filteredLookup(SwaOrgRef, false).find((x) => x.id === data.prowOrgRefConsultant) ||
        [11, 12, 13, 14, 16, 20, 7093].includes(data.prowOrgRefConsultant))
    ) {
      prowOrgRefConsultantErrors.push(GetErrorMessage(currentCheck, false));
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

    if (prowLengthErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ProwLength",
        errors: prowLengthErrors,
      });

    if (defMapGeometryTypeErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "defMapGeometryType",
        errors: defMapGeometryTypeErrors,
      });

    if (recordStartDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "RecordStartDate",
        errors: recordStartDateErrors,
      });

    if (relevantStartDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "RelevantStartDate",
        errors: relevantStartDateErrors,
      });

    if (recordEndDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "RecordEndDate",
        errors: recordEndDateErrors,
      });

    if (prowLocationErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ProwLocation",
        errors: prowLocationErrors,
      });

    if (prowDetailsErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ProwDetails",
        errors: prowDetailsErrors,
      });

    if (sourceTextErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "SourceText",
        errors: sourceTextErrors,
      });

    if (prowOrgRefConsultantErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ProwOrgRefConsultant",
        errors: prowOrgRefConsultantErrors,
      });

    if (prowDistrictRefConsultantErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ProwDistrictRefConsultant",
        errors: prowDistrictRefConsultantErrors,
      });

    if (appealDetailsErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "AppealDetails",
        errors: appealDetailsErrors,
      });

    if (appealRefErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "AppealRef",
        errors: appealRefErrors,
      });

    if (consultRefErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ConsultRef",
        errors: consultRefErrors,
      });

    if (consultDetailsErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ConsultDetails",
        errors: consultDetailsErrors,
      });

    if (consultStartDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ConsultStartDate",
        errors: consultStartDateErrors,
      });

    if (consultEndDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "ConsultEndDate",
        errors: consultEndDateErrors,
      });

    if (appealDateErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "AppealDate",
        errors: appealDateErrors,
      });

    if (divRelatedUsrnErrors.length > 0)
      validationErrors.push({
        index: index,
        field: "DivRelatedUsrn",
        errors: divRelatedUsrnErrors,
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
    // Street note does not exist.
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
