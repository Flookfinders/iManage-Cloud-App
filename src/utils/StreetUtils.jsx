/* #region header */
/**************************************************************************************************
//
//  Description: Street utilities
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   16.08.22 Sean Flook         WI39??? Initial Revision.
//    002   28.06.23 Sean Flook         WI40730 Fixed GetDistrictLabel.
//    003   23.08.23 Sean Flook       IMANN-159 Added state, classification and surface to GetNewStreet.
//    004   07.09.23 Sean Flook                 Added code to assist with ESU maintenance.
//    005   20.09.23 Sean Flook                 Added OneScotland specific record types. Also changes for unassigning and assigning ESUs.
//    006   06.10.23 Sean Flook                 Added DisplayStreetInStreetView, updateMapStreetData, GetWholeRoadGeometry & GetProwStatusLabel as well as various bug fixes.
//    007   03.11.23 Sean Flook                 Added hyphen to one-way.
//    008   10.11.23 Sean Flook                 Removed HasASDPlus as no longer required.
//    009   24.11.23 Sean Flook                 Moved Stack to @mui/system and renamed successor to successorCrossRef.
//    010   01.12.23 Sean Flook       IMANN-194 Update the street descriptor lookup after doing a save or delete.
//    011   01.12.23 Sean Flook                 Include island in the street address for Scottish authorities.
//    012   12.12.23 Sean Flook                 Modified FilteredStreetType to exclude Unassigned ESU.
//    013   19.12.23 Sean Flook                 Various bug fixes.
//    014   21.12.23 Sean Flook                 Corrected street type filter for NSG only.
//    015   02.01.24 Sean Flook                 Changed console.log to console.error for error messages.
//    016   08.01.24 Sean Flook                 Changes to fix warnings.
//    017   12.01.24 Sean Flook       IMANN-233 Modified GetNewStreetData to update the street start and end coordinates if required.
//    018   16.01.24 Sean Flook                 Changes required to fix warnings.
//    019   25.01.24 Sean Flook                 Changes required after UX review.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React from "react";
import dateFormat from "dateformat";
import { Typography } from "@mui/material";
import { Stack } from "@mui/system";
import {
  GetLookupLabel,
  GetCurrentDate,
  GetWktCoordinates,
  openInStreetView,
  getStartEndCoordinates,
  filteredLookup,
} from "./HelperUtils";
import { StreetComparison } from "./ObjectComparison";
import {
  GetStreetByUSRNUrl,
  GetDeleteStreetUrl,
  GetCreateStreetUrl,
  GetUpdateStreetUrl,
  HasProperties,
  HasASD,
  GetEsuByIdUrl,
  GetMultipleEsusByIdUrl,
} from "../configuration/ADSConfig";
import StreetType from "../data/StreetType";
import StreetState from "../data/StreetState";
import StreetSurface from "../data/StreetSurface";
import RoadStatusCode from "../data/RoadStatusCode";
import SwaOrgRef from "../data/SwaOrgRef";
import ReinstatementType from "../data/ReinstatementType";
import SpecialDesignationCode from "./../data/SpecialDesignationCode";
import ConstructionType from "../data/ConstructionType";
import HWWDesignationCode from "../data/HWWDesignationCode";
import PRoWDedicationCode from "../data/PRoWDedicationCode";
import InterestType from "../data/InterestType";
import PRoWStatusCode from "../data/PRoWStatusCode";

/**
 * Returns a list of street types depending on if the authority is Scottish or not.
 *
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @return {array} The filtered street types.
 */
export const FilteredStreetType = (isScottish) => {
  if (isScottish) {
    return StreetType.filter((x) => x.osText && x.id !== 0);
  } else {
    return StreetType.filter((x) => x.gpText && x.id !== 0 && (HasProperties() || x.id !== 9));
  }
};

/**
 * Return a string to be used as a label for a given street state.
 *
 * @param {number} state The street state code that we require the label for.
 * @param {boolean} [includeCode=true] If true then the street state code is included in the returned label; otherwise it is not included.
 * @return {string} The street state label for the given code.
 */
export function GetStreetStateLabel(state, includeCode = true) {
  if (state && state === 0) return null;

  const streetState = state ? StreetState.find((x) => x.id === state) : null;

  if (streetState) return includeCode ? `${state.toString()} ${streetState.gpText}` : `${streetState.gpText}`;
  else if (state) return state.toString();
  else return null;
}

/**
 * Return a string to be used as a label for a given street surface.
 *
 * @param {number} surface The street surface code that we require the label for.
 * @param {boolean} [includeCode=true] If true then the street surface code is included in the returned label; otherwise it is not included.
 * @return {string} The street surface label for the given code.
 */
export function GetStreetSurfaceLabel(surface, includeCode = true) {
  const streetSurface = surface ? StreetSurface.find((x) => x.id === surface) : null;

  if (streetSurface) return includeCode ? `${surface.toString()} ${streetSurface.gpText}` : `${streetSurface.gpText}`;
  else if (surface) return surface.toString();
  else return null;
}

/**
 * Return a string to be used as a label for a given street type
 *
 * @param {number} type The street type code that we require the label for.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @return {string} The street type label for the given code.
 */
export function GetStreetTypeLabel(type, isScottish) {
  const streetType = type ? StreetType.find((x) => x.id === type) : null;

  if (streetType) return `${type.toString()} ${streetType[GetLookupLabel(isScottish)]}`;
  else if (type) return type.toString();
  else return null;
}

/**
 * Return a string to be used as a label for a given authority code.
 *
 * @param {number} code The SWA organisation reference code for the authority that we require the label for.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @returns {string} The authority label for the given code.
 */
export function GetAuthorityLabel(code, isScottish) {
  const authorities = filteredLookup(SwaOrgRef, isScottish);

  if (authorities) {
    const authority = code ? authorities.find((x) => x.id === code) : null;

    if (authority) return `${authority[GetLookupLabel(isScottish)]}`;
    else if (code) return code.toString();
    else return null;
  } else return null;
}

/**
 * Return a string indicating if the ASD record is for the whole of the road or just a part of the road.
 *
 * @param {boolean} wholeRoad Flag indicating if this is ASD record is for the whole road or just a part of the road.
 * @returns {string} The whole road label.
 */
export function GetWholeRoadLabel(wholeRoad) {
  return wholeRoad ? "Whole road" : "Part of road";
}

/**
 * Return a string to be used as a label for a given reinstatement code.
 *
 * @param {number} code The reinstatement code that we need the label for
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @returns {string} The reinstatement label for the given code.
 */
export function GetReinstatementLabel(code, isScottish) {
  const reinstatements = filteredLookup(ReinstatementType, isScottish);

  if (reinstatements) {
    const reinstatement = code ? reinstatements.find((x) => x.id === code) : null;

    if (reinstatement) return `${reinstatement[GetLookupLabel(isScottish)]}`;
    else if (code) return code.toString();
    else return null;
  } else return null;
}

/**
 * Return a string to be used as a label for a given interest code.
 *
 * @param {number} code The interest type code that we need the label for.
 * @returns {string} The interest label for the given code.
 */
export function GetInterestLabel(code) {
  const interest = code ? InterestType.find((x) => x.id === code) : null;

  if (interest) return `${interest[GetLookupLabel(false)]}`;
  else if (code) return code.toString();
  else return null;
}

/**
 * Return a string to be used as a label for a given PRoW status code.
 *
 * @param {number} code The PRoW status code that we need the label for.
 * @returns {string} The PRoW status label for the given code.
 */
export function GetProwStatusLabel(code) {
  const prow = code ? PRoWStatusCode.find((x) => x.id === code) : null;

  if (prow) return `${prow[GetLookupLabel(false)]}`;
  else if (code) return code.toString();
  else return null;
}

/**
 * Return a string to be used as a label for a given operational district code.
 *
 * @param {number} code The operational district code that we need the label for.
 * @param {object} lookupContext The lookup context object.
 * @returns {string} The district label for the given code.
 */
export function GetDistrictLabel(code, lookupContext) {
  if (!code || !lookupContext) return null;

  const operationalDistrict = lookupContext.currentLookups.operationalDistricts.find((x) => x.districtId === code);

  if (operationalDistrict) return `${operationalDistrict.districtName}`;
  else if (code) return code.toString();
  else return null;
}

/**
 * Return a string to be used as a label for a given PROW status code.
 *
 * @param {string} code The PRoW status code that we need the label for.
 * @returns {string} The PRoW status label for the given code.
 */
export function GetPRoWStatusLabel(code) {
  const statusCode = code ? PRoWStatusCode.find((x) => x.id === code) : null;

  if (statusCode) return `${statusCode[GetLookupLabel(false)]}`;
  else if (code) return code.toString();
  else return null;
}

/**
 * Returns the given street description in title case.
 *
 * @param {string} str The street description that needs to be converted to title case.
 * @return {string} The street descriptor in title case.
 */
export function streetToTitleCase(str) {
  if (!str || str.length === 0) return null;

  if (str.includes(",") && !str.includes(", "))
    return str.replace(",", ", ").replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    });
  else
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    });
}

/**
 * Returns the given street descriptor in title case.
 *
 * @param {string} str The street descriptor that needs to be converted to title case.
 * @return {string} The street descriptor in title case.
 */
export function streetDescriptorToTitleCase(str) {
  if (!str || str.length === 0) return null;

  if (str.includes(",") && !str.includes(", ")) {
    const descriptor = str.split(",", 2);
    return descriptor[0].replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    });
  } else
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    });
}

/**
 * Returns a new (empty) street object.
 *
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @param {boolean} isWelsh True if the authority is a Welsh authority; otherwise false.
 * @param {number} authorityCode The DETR code for the authority creating the new street.
 * @param {number|null} defaultType The default type to use when creating the new street.
 * @param {number|null} defaultState The default state to use when creating the new street (GeoPlace only).
 * @param {number|null} defaultLocality The default locality to use when creating the new street.
 * @param {number|null} defaultTown The default town to use when creating the new street.
 * @param {number|null} defaultIsland The default island to use when creating the new street.
 * @param {number|null} defaultAdminArea The default administrative area to use when creating the new street.
 * @param {number|null} defaultClassification The default classification to use when creating the new street (GeoPlace only).
 * @param {number|null} defaultSurface The default surface to use when creating the new street (GeoPlace only).
 * @param {object} lookupContext The lookup context object.
 * @param {Array|null} [newEsus=null] The array of ESUs to use when creating the new street.
 * @return {object} A new street object.
 */
export function GetNewStreet(
  isScottish,
  isWelsh,
  authorityCode,
  defaultType,
  defaultState,
  defaultLocality,
  defaultTown,
  defaultIsland,
  defaultAdminArea,
  defaultClassification,
  defaultSurface,
  lookupContext,
  newEsus = null
) {
  const currentDate = GetCurrentDate();

  const esuData = newEsus && newEsus.length ? newEsus : [];
  const successorCrossRefData = [];
  const noteData = [];
  const maintenanceResponsibilityData = [];
  const reinstatementCategoryData = [];
  const osSpecialDesignationData = [];
  const interestData = [];
  const constructionData = [];
  const specialDesignationData = [];
  const prowData = [];
  const hwwData = [];

  let currentStreet = {};
  let descriptorData = [];

  if (isScottish) {
    currentStreet = {
      changeType: "I",
      usrn: 0,
      pkId: -10,
      relatedPropertyCount: 0,
      relatedStreetCount: 0,
      swaOrgRefNaming: authorityCode,
      streetStartDate: currentDate,
      streetEndDate: null,
      neverExport: false,
      recordType: defaultType ? defaultType : null,
    };

    descriptorData = [
      {
        changeType: "I",
        usrn: 0,
        streetDescriptor: null,
        locRef: defaultLocality ? defaultLocality : null,
        locality: null,
        townRef: defaultTown ? defaultTown : null,
        town: null,
        adminAreaRef: defaultAdminArea ? defaultAdminArea : authorityCode,
        administrativeArea: null,
        islandRef: defaultIsland ? defaultIsland : null,
        island: null,
        language: "ENG",
        neverExport: false,
        pkId: -10,
      },
    ];
  } else {
    currentStreet = {
      changeType: "I",
      usrn: 0,
      swaOrgRefNaming: authorityCode,
      streetSurface: defaultSurface ? defaultSurface : null,
      streetStartDate: currentDate,
      streetEndDate: null,
      neverExport: false,
      version: 1,
      recordType: defaultType ? defaultType : null,
      state: defaultState ? defaultState : null,
      stateDate: currentDate,
      streetClassification: defaultClassification ? defaultClassification : null,
      streetTolerance: 10,
      streetStartX: null,
      streetStartY: null,
      streetEndX: null,
      streetEndY: null,
      pkId: -10,
      entryDate: currentDate,
      relatedPropertyCount: 0,
      relatedStreetCount: 0,
    };

    let defaultCymLocality = null;
    let defaultCymTown = null;
    let defaultCymAdminArea = null;

    if (isWelsh) {
      const cymLocalityRecord = defaultLocality
        ? lookupContext.currentLookups.localities.find((x) => x.linkedRef === defaultLocality && x.language === "CYM")
        : null;
      const cymTownRecord = defaultTown
        ? lookupContext.currentLookups.towns.find((x) => x.linkedRef === defaultTown && x.language === "CYM")
        : null;
      const cymAdminAreaRecord = defaultAdminArea
        ? lookupContext.currentLookups.adminAuthorities.find(
            (x) => x.linkedRef === defaultAdminArea && x.language === "CYM"
          )
        : null;

      defaultCymLocality = cymLocalityRecord ? cymLocalityRecord.localityRef : null;
      defaultCymTown = cymTownRecord ? cymTownRecord.townRef : null;
      defaultCymAdminArea = cymAdminAreaRecord ? cymAdminAreaRecord.administrativeAreaRef : null;
    }

    descriptorData = isWelsh
      ? [
          {
            changeType: "I",
            usrn: 0,
            streetDescriptor: null,
            locRef: defaultLocality ? defaultLocality : null,
            locality: null,
            townRef: defaultTown ? defaultTown : null,
            town: null,
            adminAreaRef: defaultAdminArea ? defaultAdminArea : authorityCode,
            administrativeArea: null,
            language: "ENG",
            neverExport: false,
            pkId: -10,
          },
          {
            changeType: "I",
            usrn: 0,
            streetDescriptor: null,
            locRef: defaultCymLocality ? defaultCymLocality : null,
            locality: null,
            townRef: defaultCymTown ? defaultCymTown : null,
            town: null,
            adminAreaRef: defaultCymAdminArea ? defaultCymAdminArea : authorityCode,
            administrativeArea: null,
            language: "CYM",
            neverExport: false,
            pkId: -11,
          },
        ]
      : [
          {
            changeType: "I",
            usrn: 0,
            streetDescriptor: null,
            locRef: defaultLocality ? defaultLocality : null,
            locality: null,
            townRef: defaultTown ? defaultTown : null,
            town: null,
            adminAreaRef: defaultAdminArea ? defaultAdminArea : authorityCode,
            administrativeArea: null,
            language: "ENG",
            neverExport: false,
            pkId: -10,
          },
        ];
  }

  return GetNewStreetData(
    currentStreet,
    esuData,
    successorCrossRefData,
    descriptorData,
    noteData,
    maintenanceResponsibilityData,
    reinstatementCategoryData,
    osSpecialDesignationData,
    interestData,
    constructionData,
    specialDesignationData,
    prowData,
    hwwData,
    isScottish
  );
}

/**
 * Calls the API endpoint used to delete the given street.
 *
 * @param {number} usrn The USRN of the street that is being deleted.
 * @param {boolean} deleteEsus If true then the ESUs will also be deleted; otherwise they are left.
 * @param {object} lookupContext The lookup context object.
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @return {boolean} True if the street was deleted successfully; otherwise false.
 */
export async function StreetDelete(usrn, deleteEsus, lookupContext, userToken, isScottish) {
  const deleteUrl = GetDeleteStreetUrl(userToken, isScottish);

  if (deleteUrl) {
    return await fetch(`${deleteUrl.url}/${usrn}/${deleteEsus}`, {
      headers: deleteUrl.headers,
      crossDomain: true,
      method: deleteUrl.type,
    })
      .then((res) => (res.ok ? res : Promise.reject(res)))
      .then((res) => res.json())
      .then((result) => {
        const updatedLookup = lookupContext.currentLookups.streetDescriptors.filter((x) => x.usrn !== usrn);
        lookupContext.onUpdateLookup("streetDescriptor", updatedLookup);
        return true;
      })
      .catch((res) => {
        console.error("[ERROR] Deleting Street - response", res);
        return false;
      });
  } else return false;
}

/**
 * Return the full street object for a new street.
 *
 * @param {object} currentStreet The current street data.
 * @param {array|null} esuData The ESU data for the street.
 * @param {array|null} successorCrossRefData The successor cross reference data for the street.
 * @param {array|null} descriptorData The descriptor data for the street.
 * @param {array|null} noteData The note data for the street.
 * @param {array|null} maintenanceResponsibilityData The maintenance responsibility data for the street (OneScotland only).
 * @param {array|null} reinstatementCategoryData The reinstatement category data for the street (OneScotland only).
 * @param {array|null} osSpecialDesignationData The special designation data for the street (OneScotland only).
 * @param {array|null} interestData The interest data for the street (GeoPlace only).
 * @param {array|null} constructionData The construction data for the street (GeoPlace only).
 * @param {array|null} specialDesignationData The special designation data for the street (GeoPlace only).
 * @param {array|null} prowData The public rights of way data for the street (GeoPlace only).
 * @param {array|null} hwwData The height, width and weight restriction data for the street (GeoPlace only).
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @param {boolean} [updateStreetCoordinates=false] True if the street coordinates need to be updated; otherwise false.
 * @return {object} The new street object.
 */
export function GetNewStreetData(
  currentStreet,
  esuData,
  successorCrossRefData,
  descriptorData,
  noteData,
  maintenanceResponsibilityData,
  reinstatementCategoryData,
  osSpecialDesignationData,
  interestData,
  constructionData,
  specialDesignationData,
  prowData,
  hwwData,
  isScottish,
  updateStreetCoordinates = false
) {
  let startX = currentStreet.streetStartX;
  let startY = currentStreet.streetStartY;
  let endX = currentStreet.streetEndX;
  let endY = currentStreet.streetEndY;

  if (updateStreetCoordinates) {
    const newWholeRoadWkt = GetWholeRoadGeometry(esuData);
    const coordinates = getStartEndCoordinates(newWholeRoadWkt);

    if (coordinates) {
      startX = coordinates.startX;
      startY = coordinates.startY;
      endX = coordinates.endX;
      endY = coordinates.endY;
    }
  }
  const newStreetData =
    !isScottish && !HasASD()
      ? {
          changeType: currentStreet.changeType,
          usrn: currentStreet.usrn,
          swaOrgRefNaming: currentStreet.swaOrgRefNaming,
          streetSurface: currentStreet.streetSurface,
          streetStartDate: currentStreet.streetStartDate,
          streetEndDate: currentStreet.streetEndDate,
          neverExport: currentStreet.neverExport,
          version: currentStreet.version,
          recordType: currentStreet.recordType,
          state: currentStreet.state,
          stateDate: currentStreet.stateDate,
          streetClassification: currentStreet.streetClassification,
          streetTolerance: currentStreet.streetTolerance,
          streetStartX: startX,
          streetStartY: startY,
          streetEndX: endX,
          streetEndY: endY,
          pkId: currentStreet.pkId,
          lastUpdateDate: currentStreet.lastUpdateDate,
          entryDate: currentStreet.entryDate,
          streetLastUpdated: currentStreet.streetLastUpdated,
          streetLastUser: currentStreet.streetLastUser,
          relatedPropertyCount: currentStreet.relatedPropertyCount,
          relatedStreetCount: currentStreet.relatedStreetCount,
          esus: esuData,
          streetDescriptors: descriptorData,
          streetNotes: noteData,
        }
      : !isScottish && HasASD()
      ? {
          changeType: currentStreet.changeType,
          usrn: currentStreet.usrn,
          swaOrgRefNaming: currentStreet.swaOrgRefNaming,
          streetSurface: currentStreet.streetSurface,
          streetStartDate: currentStreet.streetStartDate,
          streetEndDate: currentStreet.streetEndDate,
          neverExport: currentStreet.neverExport,
          version: currentStreet.version,
          recordType: currentStreet.recordType,
          state: currentStreet.state,
          stateDate: currentStreet.stateDate,
          streetClassification: currentStreet.streetClassification,
          streetTolerance: currentStreet.streetTolerance,
          streetStartX: startX,
          streetStartY: startY,
          streetEndX: endX,
          streetEndY: endY,
          pkId: currentStreet.pkId,
          lastUpdateDate: currentStreet.lastUpdateDate,
          entryDate: currentStreet.entryDate,
          streetLastUpdated: currentStreet.streetLastUpdated,
          streetLastUser: currentStreet.streetLastUser,
          relatedPropertyCount: currentStreet.relatedPropertyCount,
          relatedStreetCount: currentStreet.relatedStreetCount,
          esus: esuData,
          streetDescriptors: descriptorData,
          streetNotes: noteData,
          interests: interestData,
          constructions: constructionData,
          specialDesignations: specialDesignationData,
          publicRightOfWays: prowData,
          heightWidthWeights: hwwData,
        }
      : {
          changeType: currentStreet.changeType,
          usrn: currentStreet.usrn,
          swaOrgRefNaming: currentStreet.swaOrgRefNaming,
          recordEntryDate: currentStreet.recordEntryDate,
          streetStartDate: currentStreet.streetStartDate,
          streetEndDate: currentStreet.streetEndDate,
          streetStartX: startX,
          streetStartY: startY,
          streetEndX: endX,
          streetEndY: endY,
          streetLastUpdated: currentStreet.streetLastUpdated,
          streetLastUser: currentStreet.streetLastUser,
          neverExport: currentStreet.neverExport,
          relatedPropertyCount: currentStreet.relatedPropertyCount,
          relatedStreetCount: currentStreet.relatedStreetCount,
          version: currentStreet.version,
          recordType: currentStreet.recordType,
          pkId: currentStreet.pkId,
          lastUpdated: currentStreet.lastUpdated,
          lastUser: currentStreet.lastUser,
          esus: esuData,
          successorCrossRefs: successorCrossRefData,
          streetDescriptors: descriptorData,
          streetNotes: noteData,
          maintenanceResponsibilities: maintenanceResponsibilityData,
          reinstatementCategories: reinstatementCategoryData,
          specialDesignations: osSpecialDesignationData,
        };

  return newStreetData;
}

/**
 * Method to get the current search streets array.
 *
 * @param {object} streetData The street data
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @return {Array} The new search street array.
 */
export function GetCurrentSearchStreets(streetData, isScottish) {
  const engDescriptor = streetData.streetDescriptors.find((x) => x.language === "ENG");

  const currentSearchStreets = [
    {
      usrn: streetData.usrn,
      description: engDescriptor.streetDescriptor,
      language: "ENG",
      locality: engDescriptor.locality,
      town: engDescriptor.town,
      state: !isScottish ? streetData.state : undefined,
      type: streetData.recordType,
      esus: streetData.esus
        .filter((x) => x.changeType !== "D" && x.assignUnassign !== -1)
        .map((esu) => ({
          esuId: esu.esuId,
          state: isScottish ? esu.state : undefined,
          geometry: esu.wktGeometry && esu.wktGeometry !== "" ? GetWktCoordinates(esu.wktGeometry) : undefined,
        })),
      asdType51:
        isScottish &&
        streetData.maintenanceResponsibilities
          .filter((x) => x.changeType !== "D")
          .map((asdRec) => ({
            type: 51,
            pkId: asdRec.pkId,
            usrn: asdRec.usrn,
            streetStatus: asdRec.streetStatus,
            custodianCode: asdRec.custodianCode,
            maintainingAuthorityCode: asdRec.maintainingAuthorityCode,
            wholeRoad: asdRec.wholeRoad,
            geometry:
              asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
          })),
      asdType52:
        isScottish &&
        streetData.reinstatementCategories
          .filter((x) => x.changeType !== "D")
          .map((asdRec) => ({
            type: 52,
            pkId: asdRec.pkId,
            usrn: asdRec.usrn,
            reinstatementCategoryCode: asdRec.reinstatementCategoryCode,
            custodianCode: asdRec.custodianCode,
            reinstatementAuthorityCode: asdRec.reinstatementAuthorityCode,
            wholeRoad: asdRec.wholeRoad,
            geometry:
              asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
          })),
      asdType53:
        isScottish &&
        streetData.specialDesignations
          .filter((x) => x.changeType !== "D")
          .map((asdRec) => ({
            type: 53,
            pkId: asdRec.pkId,
            usrn: asdRec.usrn,
            specialDesig: asdRec.specialDesig,
            custodianCode: asdRec.custodianCode,
            authorityCode: asdRec.authorityCode,
            wholeRoad: asdRec.wholeRoad,
            geometry:
              asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
          })),
      asdType61:
        !isScottish &&
        HasASD() &&
        streetData.interests
          .filter((x) => x.changeType !== "D")
          .map((asdRec) => ({
            type: 61,
            pkId: asdRec.pkId,
            usrn: asdRec.usrn,
            streetStatus: asdRec.streetStatus,
            interestType: asdRec.interestType,
            districtRefAuthority: asdRec.districtRefAuthority,
            swaOrgRefAuthority: asdRec.swaOrgRefAuthority,
            wholeRoad: asdRec.wholeRoad,
            geometry:
              asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
          })),
      asdType62:
        !isScottish &&
        HasASD() &&
        streetData.constructions
          .filter((x) => x.changeType !== "D")
          .map((asdRec) => ({
            type: 62,
            pkId: asdRec.pkId,
            usrn: asdRec.usrn,
            constructionType: asdRec.constructionType,
            reinstatementTypeCode: asdRec.reinstatementTypeCode,
            swaOrgRefConsultant: asdRec.swaOrgRefConsultant,
            districtRefConsultant: asdRec.districtRefConsultant,
            wholeRoad: asdRec.wholeRoad,
            geometry:
              asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
          })),
      asdType63:
        !isScottish &&
        HasASD() &&
        streetData.specialDesignations
          .filter((x) => x.changeType !== "D")
          .map((asdRec) => ({
            type: 63,
            pkId: asdRec.pkId,
            usrn: asdRec.usrn,
            streetSpecialDesigCode: asdRec.streetSpecialDesigCode,
            swaOrgRefConsultant: asdRec.swaOrgRefConsultant,
            districtRefConsultant: asdRec.districtRefConsultant,
            wholeRoad: asdRec.wholeRoad,
            geometry:
              asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
          })),
      asdType64:
        !isScottish &&
        HasASD() &&
        streetData.heightWidthWeights
          .filter((x) => x.changeType !== "D")
          .map((asdRec) => ({
            type: 64,
            pkId: asdRec.pkId,
            usrn: asdRec.usrn,
            hwwRestrictionCode: asdRec.hwwRestrictionCode,
            swaOrgRefConsultant: asdRec.swaOrgRefConsultant,
            districtRefConsultant: asdRec.districtRefConsultant,
            wholeRoad: asdRec.wholeRoad,
            geometry:
              asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
          })),
      asdType66:
        !isScottish &&
        HasASD() &&
        streetData.publicRightOfWays
          .filter((x) => x.changeType !== "D")
          .map((asdRec) => ({
            type: 66,
            pkId: asdRec.pkId,
            usrn: asdRec.usrn,
            prowRights: asdRec.prowRights,
            prowStatus: asdRec.prowStatus,
            prowOrgRefConsultant: asdRec.prowOrgRefConsultant,
            prowDistrictRefConsultant: asdRec.prowDistrictRefConsultant,
            wholeRoad: asdRec.wholeRoad,
            geometry:
              asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
          })),
    },
  ];

  return currentSearchStreets;
}

/**
 * Method to get the WKT geometry string for the whole road.
 *
 * @param {Array|null} esus The array of ESUs to get the geometry for the whole road.
 * @returns {string|undefined} The geometry string for the whole road.
 */
export function GetWholeRoadGeometry(esus) {
  const wholeRoadGeometries = [];
  for (let i = 0; i < esus.length; i++) {
    if (esus[i].changeType && esus[i].changeType !== "D" && esus[i].assignUnassign !== -1 && esus[i].wktGeometry) {
      wholeRoadGeometries.push(
        esus[i].wktGeometry.replace("MULTILINESTRING (", "").replace("LINESTRING ", "").replace("))", ")")
      );
    }
  }

  if (wholeRoadGeometries && wholeRoadGeometries.length > 0)
    return `MULTILINESTRING (${wholeRoadGeometries.join(", ")})`;
  else return "";
}

/**
 * Method to get the new street data and current street search data for updated ESU data.
 *
 * @param {object} currentSandbox The current sandbox object.
 * @param {Array} newEsus The updated list of ESUs
 * @param {object} streetData The current street data.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @param {boolean} [updateWholeRoad=false] True if the whole road geometries need to be updated; otherwise false.
 * @returns {object} An object containing the new street data and the current street search data.
 */
export function GetNewEsuStreetData(currentSandbox, newEsus, streetData, isScottish, updateWholeRoad = false) {
  let updatedMaintenanceResponsibilities = isScottish ? [...streetData.maintenanceResponsibilities] : null;
  let updatedReinstatementCategories = isScottish ? [...streetData.reinstatementCategories] : null;
  let updatedOSSpecialDesignations = isScottish ? [...streetData.specialDesignations] : null;
  let updatedInterests = !isScottish ? [...streetData.interests] : null;
  let updatedConstructions = !isScottish ? [...streetData.constructions] : null;
  let updatedSpecialDesignations = !isScottish ? [...streetData.specialDesignations] : null;
  let updatedHeightWidthWeights = !isScottish ? [...streetData.heightWidthWeights] : null;

  if (updateWholeRoad) {
    const newWholeRoadWkt = GetWholeRoadGeometry(newEsus);

    if (isScottish && streetData.maintenanceResponsibilities && streetData.maintenanceResponsibilities.length > 0) {
      const wholeRoadASD = streetData.maintenanceResponsibilities
        .filter((x) => x.wholeRoad)
        .map((rec) => {
          return { ...rec, wktGeometry: newWholeRoadWkt, changeType: "U" };
        });

      updatedMaintenanceResponsibilities = streetData.maintenanceResponsibilities.map(
        (x) => wholeRoadASD.find((rec) => rec.pkId === x.pkId) || x
      );
    }

    if (isScottish && streetData.reinstatementCategories && streetData.reinstatementCategories.length > 0) {
      const wholeRoadASD = streetData.reinstatementCategories
        .filter((x) => x.wholeRoad)
        .map((rec) => {
          return { ...rec, wktGeometry: newWholeRoadWkt, changeType: "U" };
        });

      updatedReinstatementCategories = streetData.reinstatementCategories.map(
        (x) => wholeRoadASD.find((rec) => rec.pkId === x.pkId) || x
      );
    }

    if (isScottish && streetData.specialDesignations && streetData.specialDesignations.length > 0) {
      const wholeRoadASD = streetData.specialDesignations
        .filter((x) => x.wholeRoad)
        .map((rec) => {
          return { ...rec, wktGeometry: newWholeRoadWkt, changeType: "U" };
        });

      updatedOSSpecialDesignations = streetData.specialDesignations.map(
        (x) => wholeRoadASD.find((rec) => rec.pkId === x.pkId) || x
      );
    }

    if (!isScottish && streetData.interests && streetData.interests.length > 0) {
      const wholeRoadASD = streetData.interests
        .filter((x) => x.wholeRoad)
        .map((rec) => {
          return { ...rec, wktGeometry: newWholeRoadWkt, changeType: "U" };
        });

      updatedInterests = streetData.interests.map((x) => wholeRoadASD.find((rec) => rec.pkId === x.pkId) || x);
    }

    if (!isScottish && streetData.constructions && streetData.constructions.length > 0) {
      const wholeRoadASD = streetData.constructions
        .filter((x) => x.wholeRoad)
        .map((rec) => {
          return { ...rec, wktGeometry: newWholeRoadWkt, changeType: "U" };
        });

      updatedConstructions = streetData.constructions.map((x) => wholeRoadASD.find((rec) => rec.pkId === x.pkId) || x);
    }

    if (!isScottish && streetData.specialDesignations && streetData.specialDesignations.length > 0) {
      const wholeRoadASD = streetData.specialDesignations
        .filter((x) => x.wholeRoad)
        .map((rec) => {
          return { ...rec, wktGeometry: newWholeRoadWkt, changeType: "U" };
        });

      updatedSpecialDesignations = streetData.specialDesignations.map(
        (x) => wholeRoadASD.find((rec) => rec.pkId === x.pkId) || x
      );
    }

    if (!isScottish && streetData.heightWidthWeights && streetData.heightWidthWeights.length > 0) {
      const wholeRoadASD = streetData.heightWidthWeights
        .filter((x) => x.wholeRoad)
        .map((rec) => {
          return { ...rec, wktGeometry: newWholeRoadWkt, changeType: "U" };
        });

      updatedHeightWidthWeights = streetData.heightWidthWeights.map(
        (x) => wholeRoadASD.find((rec) => rec.pkId === x.pkId) || x
      );
    }
  }

  const newStreetData = GetNewStreetData(
    currentSandbox.currentStreet ? currentSandbox.currentStreet : currentSandbox.sourceStreet,
    newEsus,
    streetData.successorCrossRefs,
    streetData.streetDescriptors,
    streetData.streetNotes,
    updatedMaintenanceResponsibilities,
    updatedReinstatementCategories,
    updatedOSSpecialDesignations,
    updatedInterests,
    updatedConstructions,
    updatedSpecialDesignations,
    streetData.publicRightOfWays,
    updatedHeightWidthWeights,
    isScottish,
    updateWholeRoad
  );

  if (newStreetData) {
    const currentSearchStreets = GetCurrentSearchStreets(newStreetData, isScottish);

    return { streetData: newStreetData, searchStreets: currentSearchStreets };
  } else return null;
}

/**
 * Get the current street record object.
 *
 * @param {object} streetData The street data.
 * @param {object} sandboxContext The sandbox context object.
 * @param {object} lookupContext The lookup context object.
 * @param {boolean} isWelsh True if the authority is a Welsh authority; otherwise false.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @return {object} The current street object.
 */
export function GetCurrentStreetData(streetData, sandboxContext, lookupContext, isWelsh, isScottish) {
  let descriptorData = streetData.streetDescriptors;
  if (sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor && isWelsh) {
    const secondLanguage =
      sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor.language === "ENG" ? "CYM" : "ENG";

    const secondDescriptor = streetData.streetDescriptors.find(
      (x) =>
        x.usrn === sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor.usrn &&
        x.language === secondLanguage
    );
    const secondLocality = lookupContext.currentLookups.localities.find(
      (x) =>
        x.linkedRef === sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor.locRef &&
        x.language === secondLanguage
    );
    const secondTown = lookupContext.currentLookups.towns.find(
      (x) =>
        x.linkedRef === sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor.townRef &&
        x.language === secondLanguage
    );
    const secondAdminArea = lookupContext.currentLookups.adminAuthorities.find(
      (x) =>
        x.linkedRef === sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor.adminAreaRef &&
        x.language === secondLanguage
    );

    const newSecondDescriptor = {
      changeType: secondDescriptor.changeType,
      usrn: secondDescriptor.usrn,
      streetDescriptor:
        secondDescriptor && secondDescriptor.streetDescriptor
          ? secondDescriptor.streetDescriptor
          : sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor.streetDescriptor,
      locRef: secondLocality ? secondLocality.localityRef : null,
      locality: secondLocality ? secondLocality.locality : null,
      townRef: secondTown ? secondTown.townRef : null,
      town: secondTown ? secondTown.town : null,
      adminAreaRef: secondAdminArea ? secondAdminArea.administrativeAreaRef : null,
      administrativeArea: secondAdminArea ? secondAdminArea.administrativeArea : null,
      language: secondLanguage,
      neverExport: secondDescriptor.neverExport,
      pkId: secondDescriptor.pkId,
    };

    descriptorData = streetData.streetDescriptors.map(
      (x) =>
        [sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor].find((sd) => sd.pkId === x.pkId) ||
        [newSecondDescriptor].find((sd) => sd.pkId === x.pkId) ||
        x
    );
  } else {
    descriptorData = sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor
      ? streetData.streetDescriptors.map(
          (x) =>
            [sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor].find((sd) => sd.pkId === x.pkId) || x
        )
      : streetData.streetDescriptors;
  }
  const esuData = sandboxContext.currentSandbox.currentStreetRecords.esu
    ? streetData.esus.map(
        (x) => [sandboxContext.currentSandbox.currentStreetRecords.esu].find((esu) => esu.pkId === x.pkId) || x
      )
    : streetData.esus;
  const successorCrossRefData = isScottish
    ? sandboxContext.currentSandbox.currentStreetRecords.successorCrossRef
      ? streetData.successorCrossRefs.map(
          (x) =>
            [sandboxContext.currentStreetRecords.successorCrossRefs].find(
              (successorCrossRef) => successorCrossRef.pkId === x.pkId
            ) || x
        )
      : streetData.successorCrossRefs
    : null;
  const noteData = sandboxContext.currentSandbox.currentStreetRecords.note
    ? streetData.streetNotes.map(
        (x) => [sandboxContext.currentSandbox.currentStreetRecords.note].find((note) => note.pkId === x.pkId) || x
      )
    : streetData.streetNotes;
  const maintenanceResponsibilityData = isScottish
    ? sandboxContext.currentSandbox.currentStreetRecords.maintenanceResponsibility
      ? streetData.maintenanceResponsibilities.map(
          (x) =>
            [sandboxContext.currentSandbox.currentStreetRecords.maintenanceResponsibility].find(
              (mr) => mr.pkId === x.pkId
            ) || x
        )
      : streetData.maintenanceResponsibilities
    : null;
  const reinstatementCategoryData = isScottish
    ? sandboxContext.currentSandbox.currentStreetRecords.reinstatementCategory
      ? streetData.reinstatementCategories.map(
          (x) =>
            [sandboxContext.currentSandbox.currentStreetRecords.reinstatementCategory].find(
              (rc) => rc.pkId === x.pkId
            ) || x
        )
      : streetData.reinstatementCategories
    : null;
  const osSpecialDesignationData = isScottish
    ? sandboxContext.currentSandbox.currentStreetRecords.osSpecialDesignation
      ? streetData.specialDesignations.map(
          (x) =>
            [sandboxContext.currentSandbox.currentStreetRecords.osSpecialDesignation].find(
              (sd) => sd.pkId === x.pkId
            ) || x
        )
      : streetData.specialDesignations
    : null;
  const interestData = !isScottish
    ? sandboxContext.currentSandbox.currentStreetRecords.interest
      ? streetData.interests.map(
          (x) =>
            [sandboxContext.currentSandbox.currentStreetRecords.interest].find(
              (interest) => interest.pkId === x.pkId
            ) || x
        )
      : streetData.interests
    : null;
  const constructionData = !isScottish
    ? sandboxContext.currentSandbox.currentStreetRecords.construction
      ? streetData.constructions.map(
          (x) =>
            [sandboxContext.currentSandbox.currentStreetRecords.construction].find(
              (construction) => construction.pkId === x.pkId
            ) || x
        )
      : streetData.constructions
    : null;
  const specialDesignationData = !isScottish
    ? sandboxContext.currentSandbox.currentStreetRecords.specialDesignation
      ? streetData.specialDesignations.map(
          (x) =>
            [sandboxContext.currentSandbox.currentStreetRecords.specialDesignation].find(
              (specialDesignation) => specialDesignation.pkId === x.pkId
            ) || x
        )
      : streetData.specialDesignations
    : null;
  const prowData = !isScottish
    ? sandboxContext.currentSandbox.currentStreetRecords.prow
      ? streetData.publicRightOfWays.map(
          (x) => [sandboxContext.currentSandbox.currentStreetRecords.prow].find((prow) => prow.pkId === x.pkId) || x
        )
      : streetData.publicRightOfWays
    : null;
  const hwwData = !isScottish
    ? sandboxContext.currentSandbox.currentStreetRecords.hww
      ? streetData.heightWidthWeights.map(
          (x) => [sandboxContext.currentSandbox.currentStreetRecords.hww].find((hww) => hww.pkId === x.pkId) || x
        )
      : streetData.heightWidthWeights
    : null;

  const currentStreetData = GetNewStreetData(
    streetData,
    esuData,
    successorCrossRefData,
    descriptorData,
    noteData,
    maintenanceResponsibilityData,
    reinstatementCategoryData,
    osSpecialDesignationData,
    interestData,
    constructionData,
    specialDesignationData,
    prowData,
    hwwData,
    isScottish
  );

  return currentStreetData;
}

/**
 * Get the JSON object required to create a new street.
 *
 * @param {object} streetData The street data to use to create the object.
 * @param {object} lookupContext The lookup context used to get the required text.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @return {object} The create street object.
 */
export function GetStreetCreateData(streetData, lookupContext, isScottish) {
  const unassignedEngLocality = lookupContext.currentLookups.localities.find(
    (x) => x.locality === "Unassigned" && x.language === "ENG"
  );
  const unassignedEngTown = lookupContext.currentLookups.towns.find(
    (x) => x.town === "Unassigned" && x.language === "ENG"
  );
  const unassignedEngAdminArea = lookupContext.currentLookups.adminAuthorities.find(
    (x) => x.administrativeArea === "Unassigned" && x.language === "ENG"
  );

  if (isScottish) {
    const unassignedGaeLocality = lookupContext.currentLookups.localities.find(
      (x) => x.locality === "Unassigned" && x.language === "GAE"
    );
    const unassignedGaeTown = lookupContext.currentLookups.towns.find(
      (x) => x.town === "Unassigned" && x.language === "GAE"
    );
    const unassignedEngIsland = lookupContext.currentLookups.islands.find(
      (x) => x.island === "Unassigned" && x.language === "ENG"
    );
    const unassignedGaeIsland = lookupContext.currentLookups.islands.find(
      (x) => x.island === "Unassigned" && x.language === "GAE"
    );
    const unassignedGaeAdminArea = lookupContext.currentLookups.adminAuthorities.find(
      (x) => x.administrativeArea === "Unassigned" && x.language === "GAE"
    );

    return {
      changeType: "I",
      usrn: 0,
      swaOrgRefNaming: streetData.swaOrgRefNaming,
      streetStartDate: streetData.streetStartDate,
      streetEndDate: streetData.streetEndDate,
      neverExport: streetData.neverExport,
      recordType: streetData.recordType,
      successorCrossRefs: streetData.successorCrossRefs.map((x) => {
        return {
          changeType: "I",
          predecessor: x.predecessor,
          successorType: x.successorType,
          successor: x.successor,
          startDate: x.startDate,
          endDate: x.endDate,
          neverExport: x.neverExport,
        };
      }),
      maintenanceResponsibilities: streetData.maintenanceResponsibilities
        ? streetData.maintenanceResponsibilities.map((mr) => {
            return {
              usrn: 0,
              seqNum: mr.seqNum,
              wholeRoad: mr.wholeRoad,
              specificLocation: mr.specificLocation,
              neverExport: mr.neverExport,
              changeType: "I",
              custodianCode: mr.custodianCode,
              maintainingAuthorityCode: mr.maintainingAuthorityCode,
              streetStatus: mr.streetStatus,
              state: mr.state,
              startDate: mr.startDate,
              endDate: mr.endDate,
              wktGeometry: mr.wktGeometry,
            };
          })
        : [],
      reinstatementCategories: streetData.reinstatementCategories
        ? streetData.reinstatementCategories.map((rc) => {
            return {
              usrn: 0,
              seqNum: rc.seqNum,
              wholeRoad: rc.wholeRoad,
              specificLocation: rc.specificLocation,
              neverExport: rc.neverExport,
              changeType: "I",
              custodianCode: rc.custodianCode,
              reinstatementAuthorityCode: rc.reinstatementAuthorityCode,
              reinstatementCategoryCode: rc.reinstatementCategoryCode,
              state: rc.state,
              startDate: rc.startDate,
              endDate: rc.endDate,
              wktGeometry: rc.wktGeometry,
            };
          })
        : [],
      specialDesignations: streetData.specialDesignations
        ? streetData.specialDesignations.map((sd) => {
            return {
              usrn: 0,
              seqNum: sd.seqNum,
              wholeRoad: sd.wholeRoad,
              specificLocation: sd.specificLocation,
              neverExport: sd.neverExport,
              changeType: "I",
              custodianCode: sd.custodianCode,
              authorityCode: sd.authorityCode,
              specialDesignationCode: sd.specialDesig,
              wktGeometry: sd.wktGeometry,
              description: sd.description,
              state: sd.state,
              startDate: sd.startDate,
              endDate: sd.endDate,
            };
          })
        : [],
      esus: streetData.esus
        ? streetData.esus.map((esu) => {
            return {
              changeType: esu.changeType,
              state: esu.state,
              stateDate: esu.stateDate,
              classification: esu.classification,
              classificationDate: esu.classificationDate,
              startDate: esu.startDate,
              endDate: esu.endDate,
              wktGeometry: esu.wktGeometry,
              assignUnassign: esu.assignUnassign,
            };
          })
        : [],
      streetDescriptors: streetData.streetDescriptors
        ? streetData.streetDescriptors.map((sd) => {
            return {
              changeType: "I",
              usrn: 0,
              streetDescriptor: sd.streetDescriptor,
              locRef: sd.locRef
                ? sd.locRef
                : sd.language === "GAE"
                ? unassignedGaeLocality.localityRef
                : unassignedEngLocality.localityRef,
              locality: sd.locRef ? sd.locality : "",
              townRef: sd.townRef
                ? sd.townRef
                : sd.language === "GAE"
                ? unassignedGaeTown.townRef
                : unassignedEngTown.townRef,
              town: sd.townRef ? sd.town : "",
              adminAreaRef: sd.adminAreaRef
                ? sd.adminAreaRef
                : sd.language === "GAE"
                ? unassignedGaeAdminArea.administrativeAreaRef
                : unassignedEngAdminArea.administrativeAreaRef,
              administrativeArea: sd.adminAreaRef ? sd.administrativeArea : "",
              language: sd.language,
              neverExport: sd.neverExport,
              islandRef: sd.islandRef
                ? sd.islandRef
                : sd.language === "GAE"
                ? unassignedGaeIsland.islandRef
                : unassignedEngIsland.islandRef,
              island: sd.islandRef ? sd.island : "",
            };
          })
        : [],
      streetNotes: streetData.streetNotes
        ? streetData.streetNotes.map((sn) => {
            return {
              usrn: 0,
              note: sn.note,
              changeType: "I",
            };
          })
        : [],
    };
  } else {
    const unassignedCymLocality = lookupContext.currentLookups.localities.find(
      (x) => x.locality === "Unassigned" && x.language === "CYM"
    );
    const unassignedCymTown = lookupContext.currentLookups.towns.find(
      (x) => x.town === "Unassigned" && x.language === "CYM"
    );
    const unassignedCymAdminArea = lookupContext.currentLookups.adminAuthorities.find(
      (x) => x.administrativeArea === "Unassigned" && x.language === "CYM"
    );

    if (!HasASD()) {
      return {
        changeType: "I",
        usrn: 0,
        swaOrgRefNaming: streetData.swaOrgRefNaming,
        streetSurface: streetData.streetSurface,
        streetStartDate: streetData.streetStartDate,
        streetEndDate: streetData.streetEndDate,
        neverExport: streetData.neverExport,
        version: 1,
        recordType: streetData.recordType,
        state: streetData.state,
        stateDate: streetData.stateDate,
        streetClassification: streetData.streetClassification,
        streetTolerance: streetData.streetTolerance,
        streetStartX: streetData.streetStartX ? streetData.streetStartX : 0,
        streetStartY: streetData.streetStartY ? streetData.streetStartY : 0,
        streetEndX: streetData.streetEndX ? streetData.streetEndX : 0,
        streetEndY: streetData.streetEndY ? streetData.streetEndY : 0,
        esus: streetData.esus
          ? streetData.esus.map((esu) => {
              return {
                changeType: esu.changeType,
                esuVersionNumber: esu.esuVersionNumber,
                numCoordCount: esu.numCoordCount,
                esuTolerance: esu.esuTolerance,
                esuStartDate: esu.esuStartDate,
                esuEndDate: esu.esuEndDate,
                esuDirection: esu.esuDirection,
                wktGeometry: esu.wktGeometry,
                assignUnassign: esu.assignUnassign,
                highwayDedications: esu.highwayDedications
                  ? esu.highwayDedications.map((hd) => {
                      return {
                        changeType: hd.changeType,
                        highwayDedicationCode: hd.highwayDedicationCode,
                        recordEndDate: hd.recordEndDate,
                        hdStartDate: hd.hdStartDate,
                        hdEndDate: hd.hdEndDate,
                        hdSeasonalStartDate: hd.hdSeasonalStartDate,
                        hdSeasonalEndDate: hd.hdSeasonalEndDate,
                        hdStartTime: hd.hdStartTime,
                        hdEndTime: hd.hdEndTime,
                        hdProw: hd.hdProw,
                        hdNcr: hd.hdNcr,
                        hdQuietRoute: hd.hdQuietRoute,
                        hdObstruction: hd.hdObstruction,
                        hdPlanningOrder: hd.hdPlanningOrder,
                        hdVehiclesProhibited: hd.hdVehiclesProhibited,
                      };
                    })
                  : [],
                oneWayExemptions: esu.oneWayExemptions
                  ? esu.oneWayExemptions.map((owe) => {
                      return {
                        changeType: owe.changeType,
                        oneWayExemptionTypeCode: owe.oneWayExemptionTypeCode,
                        recordEndDate: owe.recordEndDate,
                        oneWayExemptionStartDate: owe.oneWayExemptionStartDate,
                        oneWayExemptionEndDate: owe.oneWayExemptionEndDate,
                        oneWayExemptionStartTime: owe.oneWayExemptionStartTime,
                        oneWayExemptionEndTime: owe.oneWayExemptionEndTime,
                        oneWayExemptionPeriodicityCode: owe.oneWayExemptionPeriodicityCode,
                      };
                    })
                  : [],
              };
            })
          : [],
        streetDescriptors: streetData.streetDescriptors
          ? streetData.streetDescriptors.map((sd) => {
              return {
                changeType: "I",
                usrn: 0,
                streetDescriptor: sd.streetDescriptor,
                locRef: sd.locRef
                  ? sd.locRef
                  : sd.language === "CYM"
                  ? unassignedCymLocality.localityRef
                  : unassignedEngLocality.localityRef,
                locality: sd.locRef ? sd.locality : "",
                townRef: sd.townRef
                  ? sd.townRef
                  : sd.language === "CYM"
                  ? unassignedCymTown.townRef
                  : unassignedEngTown.townRef,
                town: sd.townRef ? sd.town : "",
                adminAreaRef: sd.adminAreaRef
                  ? sd.adminAreaRef
                  : sd.language === "CYM"
                  ? unassignedCymAdminArea.administrativeAreaRef
                  : unassignedEngAdminArea.administrativeAreaRef,
                administrativeArea: sd.adminAreaRef ? sd.administrativeArea : "",
                language: sd.language,
                neverExport: sd.neverExport,
              };
            })
          : [],
        streetNotes: streetData.streetNotes
          ? streetData.streetNotes.map((sn) => {
              return {
                usrn: 0,
                note: sn.note,
                changeType: "I",
              };
            })
          : [],
      };
    } else {
      return {
        changeType: "I",
        usrn: 0,
        swaOrgRefNaming: streetData.swaOrgRefNaming,
        streetSurface: streetData.streetSurface,
        streetStartDate: streetData.streetStartDate,
        streetEndDate: streetData.streetEndDate,
        neverExport: streetData.neverExport,
        version: 1,
        recordType: streetData.recordType,
        state: streetData.state,
        stateDate: streetData.stateDate,
        streetClassification: streetData.streetClassification,
        streetTolerance: streetData.streetTolerance,
        streetStartX: streetData.streetStartX ? streetData.streetStartX : 0,
        streetStartY: streetData.streetStartY ? streetData.streetStartY : 0,
        streetEndX: streetData.streetEndX ? streetData.streetEndX : 0,
        streetEndY: streetData.streetEndY ? streetData.streetEndY : 0,
        esus: streetData.esus
          ? streetData.esus.map((esu) => {
              return {
                changeType: esu.changeType,
                esuVersionNumber: esu.esuVersionNumber,
                numCoordCount: esu.numCoordCount,
                esuTolerance: esu.esuTolerance,
                esuStartDate: esu.esuStartDate,
                esuEndDate: esu.esuEndDate,
                esuDirection: esu.esuDirection,
                wktGeometry: esu.wktGeometry,
                assignUnassign: esu.assignUnassign,
                highwayDedications: esu.highwayDedications
                  ? esu.highwayDedications.map((hd) => {
                      return {
                        changeType: hd.changeType,
                        highwayDedicationCode: hd.highwayDedicationCode,
                        recordEndDate: hd.recordEndDate,
                        hdStartDate: hd.hdStartDate,
                        hdEndDate: hd.hdEndDate,
                        hdSeasonalStartDate: hd.hdSeasonalStartDate,
                        hdSeasonalEndDate: hd.hdSeasonalEndDate,
                        hdStartTime: hd.hdStartTime,
                        hdEndTime: hd.hdEndTime,
                        hdProw: hd.hdProw,
                        hdNcr: hd.hdNcr,
                        hdQuietRoute: hd.hdQuietRoute,
                        hdObstruction: hd.hdObstruction,
                        hdPlanningOrder: hd.hdPlanningOrder,
                        hdVehiclesProhibited: hd.hdVehiclesProhibited,
                      };
                    })
                  : [],
                oneWayExemptions: esu.oneWayExemptions
                  ? esu.oneWayExemptions.map((owe) => {
                      return {
                        changeType: owe.changeType,
                        oneWayExemptionTypeCode: owe.oneWayExemptionTypeCode,
                        recordEndDate: owe.recordEndDate,
                        oneWayExemptionStartDate: owe.oneWayExemptionStartDate,
                        oneWayExemptionEndDate: owe.oneWayExemptionEndDate,
                        oneWayExemptionStartTime: owe.oneWayExemptionStartTime,
                        oneWayExemptionEndTime: owe.oneWayExemptionEndTime,
                        oneWayExemptionPeriodicityCode: owe.oneWayExemptionPeriodicityCode,
                      };
                    })
                  : [],
              };
            })
          : [],
        streetDescriptors: streetData.streetDescriptors
          ? streetData.streetDescriptors.map((sd) => {
              return {
                changeType: "I",
                usrn: 0,
                streetDescriptor: sd.streetDescriptor,
                locRef: sd.locRef
                  ? sd.locRef
                  : sd.language === "CYM"
                  ? unassignedCymLocality.localityRef
                  : unassignedEngLocality.localityRef,
                locality: sd.locRef ? sd.locality : "",
                townRef: sd.townRef
                  ? sd.townRef
                  : sd.language === "CYM"
                  ? unassignedCymTown.townRef
                  : unassignedEngTown.townRef,
                town: sd.townRef ? sd.town : "",
                adminAreaRef: sd.adminAreaRef
                  ? sd.adminAreaRef
                  : sd.language === "CYM"
                  ? unassignedCymAdminArea.administrativeAreaRef
                  : unassignedEngAdminArea.administrativeAreaRef,
                administrativeArea: sd.adminAreaRef ? sd.administrativeArea : "",
                language: sd.language,
                neverExport: sd.neverExport,
              };
            })
          : [],
        streetNotes: streetData.streetNotes
          ? streetData.streetNotes.map((sn) => {
              return {
                usrn: 0,
                note: sn.note,
                changeType: "I",
              };
            })
          : [],
        interests: streetData.interests
          ? streetData.interests.map((i) => {
              return {
                changeType: "I",
                usrn: 0,
                seqNum: i.seqNum,
                wholeRoad: i.wholeRoad,
                specificLocation: i.specificLocation,
                neverExport: i.neverExport,
                swaOrgRefAuthority: i.swaOrgRefAuthority,
                districtRefAuthority: i.districtRefAuthority,
                recordStartDate: i.recordStartDate,
                recordEndDate: i.recordEndDate,
                asdCoordinate: i.asdCoordinate,
                asdCoordinateCount: i.asdCoordinateCount,
                swaOrgRefAuthMaintaining: i.swaOrgRefAuthMaintaining,
                streetStatus: i.streetStatus,
                interestType: i.interestType,
                startX: i.startX && !i.wholeRoad ? i.startX : 0,
                startY: i.startY && !i.wholeRoad ? i.startY : 0,
                endX: i.endX && !i.wholeRoad ? i.endX : 0,
                endY: i.endY && !i.wholeRoad ? i.endY : 0,
                wktGeometry: i.wktGeometry,
              };
            })
          : [],
        constructions: streetData.constructions
          ? streetData.constructions.map((c) => {
              return {
                changeType: "I",
                usrn: 0,
                seqNum: c.seqNum,
                wholeRoad: c.wholeRoad,
                specificLocation: c.specificLocation,
                neverExport: c.neverExport,
                recordStartDate: c.recordStartDate,
                recordEndDate: c.recordEndDate,
                reinstatementTypeCode: c.reinstatementTypeCode,
                constructionType: c.constructionType,
                aggregateAbrasionVal: c.aggregateAbrasionVal,
                polishedStoneVal: c.polishedStoneVal,
                frostHeaveSusceptibility: c.frostHeaveSusceptibility,
                steppedJoint: c.steppedJoint,
                asdCoordinate: c.asdCoordinate,
                asdCoordinateCount: c.asdCoordinateCount,
                constructionStartX: c.constructionStartX && !c.wholeRoad ? c.constructionStartX : 0,
                constructionStartY: c.constructionStartY && !c.wholeRoad ? c.constructionStartY : 0,
                constructionEndX: c.constructionEndX && !c.wholeRoad ? c.constructionEndX : 0,
                constructionEndY: c.constructionEndY && !c.wholeRoad ? c.constructionEndY : 0,
                constructionDescription: c.constructionDescription,
                swaOrgRefConsultant: c.swaOrgRefConsultant,
                districtRefConsultant: c.districtRefConsultant,
                wktGeometry: c.wktGeometry,
              };
            })
          : [],
        specialDesignations: streetData.specialDesignations
          ? streetData.specialDesignations.map((sd) => {
              return {
                changeType: "I",
                usrn: 0,
                seqNum: sd.seqNum,
                wholeRoad: sd.wholeRoad,
                specificLocation: sd.specificLocation,
                neverExport: sd.neverExport,
                streetSpecialDesigCode: sd.streetSpecialDesigCode,
                asdCoordinate: sd.asdCoordinate,
                asdCoordinateCount: sd.asdCoordinateCount,
                specialDesigPeriodicityCode: sd.specialDesigPeriodicityCode,
                specialDesigStartX: sd.specialDesigStartX && !sd.wholeRoad ? sd.specialDesigStartX : 0,
                specialDesigStartY: sd.specialDesigStartY && !sd.wholeRoad ? sd.specialDesigStartY : 0,
                specialDesigEndX: sd.specialDesigEndX && !sd.wholeRoad ? sd.specialDesigEndX : 0,
                specialDesigEndY: sd.specialDesigEndY && !sd.wholeRoad ? sd.specialDesigEndY : 0,
                recordStartDate: sd.recordStartDate,
                recordEndDate: sd.recordEndDate,
                specialDesigStartDate: sd.specialDesigStartDate,
                specialDesigEndDate: sd.specialDesigEndDate,
                specialDesigStartTime: sd.specialDesigStartTime,
                specialDesigEndTime: sd.specialDesigEndTime,
                specialDesigDescription: sd.specialDesigDescription,
                swaOrgRefConsultant: sd.swaOrgRefConsultant,
                districtRefConsultant: sd.districtRefConsultant,
                specialDesigSourceText: sd.specialDesigSourceText,
                wktGeometry: sd.wktGeometry,
              };
            })
          : [],
        publicRightOfWays: streetData.publicRightOfWays
          ? streetData.publicRightOfWays.map((prow) => {
              return {
                changeType: "I",
                prowUsrn: 0,
                defMapGeometryType: prow.defMapGeometryType,
                defMapGeometryCount: prow.defMapGeometryCount,
                prowLength: prow.prowLength,
                prowRights: prow.prowRights,
                pedAccess: prow.pedAccess,
                equAccess: prow.equAccess,
                nonMotAccess: prow.nonMotAccess,
                cycAccess: prow.cycAccess,
                motAccess: prow.motAccess,
                recordStartDate: prow.recordStartDate,
                relevantStartDate: prow.relevantStartDate,
                recordEndDate: prow.recordEndDate,
                prowStatus: prow.prowStatus,
                consultStartDate: prow.consultStartDate,
                consultEndDate: prow.consultEndDate,
                consultRef: prow.consultRef,
                consultDetails: prow.consultDetails,
                appealDate: prow.appealDate,
                appealRef: prow.appealRef,
                appealDetails: prow.appealDetails,
                divRelatedUsrn: prow.divRelatedUsrn,
                prowLocation: prow.prowLocation,
                prowDetails: prow.prowDetails,
                promotedRoute: prow.promotedRoute,
                accessibleRoute: prow.accessibleRoute,
                sourceText: prow.sourceText,
                prowOrgRefConsultant: prow.prowOrgRefConsultant,
                prowDistrictRefConsultant: prow.prowDistrictRefConsultant,
                neverExport: prow.neverExport,
              };
            })
          : [],
        heightWidthWeights: streetData.heightWidthWeights
          ? streetData.heightWidthWeights.map((hww) => {
              return {
                changeType: "I",
                usrn: 0,
                seqNum: hww.seqNum,
                wholeRoad: hww.wholeRoad,
                specificLocation: hww.specificLocation,
                neverExport: hww.neverExport,
                hwwRestrictionCode: hww.hwwRestrictionCode,
                recordStartDate: hww.recordStartDate,
                recordEndDate: hww.recordEndDate,
                asdCoordinate: hww.asdCoordinate,
                asdCoordinateCount: hww.asdCoordinateCount,
                hwwStartX: hww.hwwStartX && !hww.wholeRoad ? hww.hwwStartX : 0,
                hwwStartY: hww.hwwStartY && !hww.wholeRoad ? hww.hwwStartY : 0,
                hwwEndX: hww.hwwEndX && !hww.wholeRoad ? hww.hwwEndX : 0,
                hwwEndY: hww.hwwEndY && !hww.wholeRoad ? hww.hwwStartY : 0,
                valueMetric: hww.valueMetric,
                troText: hww.troText,
                featureDescription: hww.featureDescription,
                sourceText: hww.sourceText,
                swaOrgRefConsultant: hww.swaOrgRefConsultant,
                districtRefConsultant: hww.districtRefConsultant,
                wktGeometry: hww.wktGeometry,
              };
            })
          : [],
      };
    }
  }
}

/**
 * Get the JSON object required to update an existing street.
 *
 * @param {object} streetData The street data to use to create the object.
 * @param {object} lookupContext The lookup context used to get the required text.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @return {object} The update street object.
 */
export function GetStreetUpdateData(streetData, lookupContext, isScottish) {
  const unassignedEngLocality = lookupContext.currentLookups.localities.find(
    (x) => x.locality === "Unassigned" && x.language === "ENG"
  );
  const unassignedEngTown = lookupContext.currentLookups.towns.find(
    (x) => x.town === "Unassigned" && x.language === "ENG"
  );
  const unassignedEngAdminArea = lookupContext.currentLookups.adminAuthorities.find(
    (x) => x.administrativeArea === "Unassigned" && x.language === "ENG"
  );

  if (isScottish) {
    const unassignedGaeLocality = lookupContext.currentLookups.localities.find(
      (x) => x.locality === "Unassigned" && x.language === "GAE"
    );
    const unassignedGaeTown = lookupContext.currentLookups.towns.find(
      (x) => x.town === "Unassigned" && x.language === "GAE"
    );
    const unassignedEngIsland = lookupContext.currentLookups.islands.find(
      (x) => x.island === "Unassigned" && x.language === "ENG"
    );
    const unassignedGaeIsland = lookupContext.currentLookups.islands.find(
      (x) => x.island === "Unassigned" && x.language === "GAE"
    );
    const unassignedGaeAdminArea = lookupContext.currentLookups.adminAuthorities.find(
      (x) => x.administrativeArea === "Unassigned" && x.language === "GAE"
    );

    return {
      changeType: streetData.changeType,
      usrn: streetData.usrn,
      swaOrgRefNaming: streetData.swaOrgRefNaming,
      streetStartDate: streetData.streetStartDate,
      streetEndDate: streetData.streetEndDate,
      neverExport: streetData.neverExport,
      pkId: streetData.pkId,
      recordType: streetData.recordType,
      successorCrossRefs: streetData.successorCrossRefs
        ? streetData.successorCrossRefs.map((s) => {
            return {
              pkId: s.pkId > 0 ? s.pkId : 0,
              succKey: s.succKey,
              changeType: s.changeType,
              predecessor: s.predecessor,
              successorType: s.successorType,
              successor: s.successor,
              startDate: s.startDate,
              endDate: s.endDate,
              neverExport: s.neverExport,
            };
          })
        : [],
      maintenanceResponsibilities: streetData.maintenanceResponsibilities
        ? streetData.maintenanceResponsibilities.map((mr) => {
            return {
              usrn: mr.usrn,
              wholeRoad: mr.wholeRoad,
              specificLocation: mr.specificLocation,
              neverExport: mr.neverExport,
              pkId: mr.pkId > 0 ? mr.pkId : 0,
              seqNum: mr.seqNum,
              changeType: mr.changeType,
              custodianCode: mr.custodianCode,
              maintainingAuthorityCode: mr.maintainingAuthorityCode,
              streetStatus: mr.streetStatus,
              state: mr.state,
              startDate: mr.startDate,
              endDate: mr.endDate,
              wktGeometry: mr.wktGeometry,
            };
          })
        : [],
      reinstatementCategories: streetData.reinstatementCategories
        ? streetData.reinstatementCategories.map((rc) => {
            return {
              usrn: rc.usrn,
              wholeRoad: rc.wholeRoad,
              specificLocation: rc.specificLocation,
              neverExport: rc.neverExport,
              pkId: rc.pkId > 0 ? rc.pkId : 0,
              seqNum: rc.seqNum,
              changeType: rc.changeType,
              custodianCode: rc.custodianCode,
              reinstatementAuthorityCode: rc.reinstatementAuthorityCode,
              reinstatementCategoryCode: rc.reinstatementCategoryCode,
              state: rc.state,
              startDate: rc.startDate,
              endDate: rc.endDate,
              wktGeometry: rc.wktGeometry,
            };
          })
        : [],
      specialDesignations: streetData.specialDesignations
        ? streetData.specialDesignations.map((sd) => {
            return {
              usrn: sd.usrn,
              wholeRoad: sd.wholeRoad,
              specificLocation: sd.specificLocation,
              neverExport: sd.neverExport,
              pkId: sd.pkId > 0 ? sd.pkId : 0,
              seqNum: sd.seqNum,
              changeType: sd.changeType,
              custodianCode: sd.custodianCode,
              authorityCode: sd.authorityCode,
              specialDesig: sd.specialDesig,
              wktGeometry: sd.wktGeometry,
              description: sd.description,
              state: sd.state,
              startDate: sd.startDate,
              endDate: sd.endDate,
            };
          })
        : [],
      esus: streetData.esus
        ? streetData.esus.map((esu) => {
            return {
              esuId: esu.esuId > 0 ? esu.esuId : 0,
              changeType: esu.changeType,
              state: esu.state,
              stateDate: esu.stateDate,
              classification: esu.classification,
              classificationDate: esu.classificationDate,
              startDate: esu.startDate,
              endDate: esu.endDate,
              wktGeometry: esu.wktGeometry,
              assignUnassign: esu.assignUnassign,
              pkId: esu.pkId > 0 ? esu.pkId : 0,
            };
          })
        : [],
      streetDescriptors: streetData.streetDescriptors
        ? streetData.streetDescriptors.map((sd) => {
            return {
              changeType: sd.changeType,
              usrn: sd.usrn,
              streetDescriptor: sd.streetDescriptor,
              locRef: sd.locRef
                ? sd.locRef
                : sd.language === "GAE"
                ? unassignedGaeLocality.localityRef
                : unassignedEngLocality.localityRef,
              locality: sd.locRef ? sd.locality : "",
              townRef: sd.townRef
                ? sd.townRef
                : sd.language === "GAE"
                ? unassignedGaeTown.townRef
                : unassignedEngTown.townRef,
              town: sd.townRef ? sd.town : "",
              adminAreaRef: sd.adminAreaRef
                ? sd.adminAreaRef
                : sd.language === "GAE"
                ? unassignedGaeAdminArea.administrativeAreaRef
                : unassignedEngAdminArea.administrativeAreaRef,
              administrativeArea: sd.adminAreaRef ? sd.administrativeArea : "",
              language: sd.language,
              neverExport: sd.neverExport,
              islandRef: sd.islandRef
                ? sd.islandRef
                : sd.language === "GAE"
                ? unassignedGaeIsland.islandRef
                : unassignedEngIsland.islandRef,
              island: sd.islandRef ? sd.island : "",
              pkId: sd.pkId > 0 ? sd.pkId : 0,
            };
          })
        : [],
      streetNotes: streetData.streetNotes
        ? streetData.streetNotes.map((sn) => {
            return {
              usrn: sn.usrn,
              note: sn.note,
              changeType: sn.changeType,
              pkId: sn.pkId > 0 ? sn.pkId : 0,
              seqNo: sn.seqNo,
            };
          })
        : [],
    };
  } else {
    const unassignedCymLocality = lookupContext.currentLookups.localities.find(
      (x) => x.locality === "Unassigned" && x.language === "CYM"
    );
    const unassignedCymTown = lookupContext.currentLookups.towns.find(
      (x) => x.town === "Unassigned" && x.language === "CYM"
    );
    const unassignedCymAdminArea = lookupContext.currentLookups.adminAuthorities.find(
      (x) => x.administrativeArea === "Unassigned" && x.language === "CYM"
    );

    if (!HasASD()) {
      return {
        changeType: streetData.changeType,
        usrn: streetData.usrn,
        swaOrgRefNaming: streetData.swaOrgRefNaming,
        streetSurface: streetData.streetSurface,
        streetStartDate: streetData.streetStartDate,
        streetEndDate: streetData.streetEndDate,
        neverExport: streetData.neverExport,
        version: streetData.version,
        recordType: streetData.recordType,
        state: streetData.state,
        stateDate: streetData.stateDate,
        streetClassification: streetData.streetClassification,
        streetTolerance: streetData.streetTolerance,
        streetStartX: streetData.streetStartX ? streetData.streetStartX : 0,
        streetStartY: streetData.streetStartY ? streetData.streetStartY : 0,
        streetEndX: streetData.streetEndX ? streetData.streetEndX : 0,
        streetEndY: streetData.streetEndY ? streetData.streetEndY : 0,
        pkId: streetData.pkId,
        esus: streetData.esus
          ? streetData.esus.map((esu) => {
              return {
                changeType: esu.changeType,
                esuVersionNumber: esu.esuVersionNumber,
                numCoordCount: esu.numCoordCount,
                esuTolerance: esu.esuTolerance,
                esuStartDate: esu.esuStartDate,
                esuEndDate: esu.esuEndDate,
                esuDirection: esu.esuDirection,
                wktGeometry: esu.wktGeometry,
                assignUnassign: esu.assignUnassign,
                pkId: esu.pkId > 0 ? esu.pkId : 0,
                esuId: esu.esuId > 0 ? esu.esuId : 0,
                highwayDedications: esu.highwayDedications.map((hd) => {
                  return {
                    pkId: hd.pkId > 0 ? hd.pkId : 0,
                    esuId: hd.esuId > 0 ? hd.esuId : 0,
                    seqNum: hd.seqNum,
                    changeType: esu.changeType === "D" && hd.changeType !== "D" ? "D" : hd.changeType,
                    highwayDedicationCode: hd.highwayDedicationCode,
                    recordEndDate: esu.changeType === "D" && hd.changeType !== "D" ? esu.endDate : hd.recordEndDate,
                    hdStartDate: hd.hdStartDate,
                    hdEndDate: hd.hdEndDate,
                    hdSeasonalStartDate: hd.hdSeasonalStartDate,
                    hdSeasonalEndDate: hd.hdSeasonalEndDate,
                    hdStartTime: hd.hdStartTime,
                    hdEndTime: hd.hdEndTime,
                    hdProw: hd.hdProw,
                    hdNcr: hd.hdNcr,
                    hdQuietRoute: hd.hdQuietRoute,
                    hdObstruction: hd.hdObstruction,
                    hdPlanningOrder: hd.hdPlanningOrder,
                    hdVehiclesProhibited: hd.hdVehiclesProhibited,
                  };
                }),
                oneWayExemptions: esu.oneWayExemptions.map((owe) => {
                  return {
                    pkId: owe.pkId > 0 ? owe.pkId : 0,
                    esuId: owe.esuId > 0 ? owe.esuId : 0,
                    sequenceNumber: owe.sequenceNumber,
                    changeType: esu.changeType === "D" && owe.changeType !== "D" ? "D" : owe.changeType,
                    oneWayExemptionTypeCode: owe.oneWayExemptionTypeCode,
                    recordEndDate: esu.changeType === "D" && owe.changeType !== "D" ? esu.endDate : owe.recordEndDate,
                    oneWayExemptionStartDate: owe.oneWayExemptionStartDate,
                    oneWayExemptionEndDate: owe.oneWayExemptionEndDate,
                    oneWayExemptionStartTime: owe.oneWayExemptionStartTime,
                    oneWayExemptionEndTime: owe.oneWayExemptionEndTime,
                    oneWayExemptionPeriodicityCode: owe.oneWayExemptionPeriodicityCode,
                  };
                }),
              };
            })
          : [],
        streetDescriptors: streetData.streetDescriptors
          ? streetData.streetDescriptors.map((sd) => {
              return {
                changeType: sd.changeType,
                usrn: sd.usrn,
                streetDescriptor: sd.streetDescriptor,
                locRef: sd.locRef
                  ? sd.locRef
                  : sd.language === "CYM"
                  ? unassignedCymLocality.localityRef
                  : unassignedEngLocality.localityRef,
                locality: sd.locRef ? sd.locality : "",
                townRef: sd.townRef
                  ? sd.townRef
                  : sd.language === "CYM"
                  ? unassignedCymTown.townRef
                  : unassignedEngTown.townRef,
                town: sd.townRef ? sd.town : "",
                adminAreaRef: sd.adminAreaRef
                  ? sd.adminAreaRef
                  : sd.language === "CYM"
                  ? unassignedCymAdminArea.administrativeAreaRef
                  : unassignedEngAdminArea.administrativeAreaRef,
                administrativeArea: sd.adminAreaRef ? sd.administrativeArea : "",
                language: sd.language,
                neverExport: sd.neverExport,
                pkId: sd.pkId > 0 ? sd.pkId : 0,
              };
            })
          : [],
        streetNotes: streetData.streetNotes
          ? streetData.streetNotes.map((sn) => {
              return {
                usrn: sn.usrn,
                note: sn.note,
                changeType: sn.changeType,
                pkId: sn.pkId > 0 ? sn.pkId : 0,
                // seqNo: sn.pkId > 0 ? sn.seqNo : 0,
                seqNo: sn.seqNo,
              };
            })
          : [],
      };
    } else {
      return {
        changeType: streetData.changeType,
        usrn: streetData.usrn,
        swaOrgRefNaming: streetData.swaOrgRefNaming,
        streetSurface: streetData.streetSurface,
        streetStartDate: streetData.streetStartDate,
        streetEndDate: streetData.streetEndDate,
        neverExport: streetData.neverExport,
        version: streetData.version,
        recordType: streetData.recordType,
        state: streetData.state,
        stateDate: streetData.stateDate,
        streetClassification: streetData.streetClassification,
        streetTolerance: streetData.streetTolerance,
        streetStartX: streetData.streetStartX ? streetData.streetStartX : 0,
        streetStartY: streetData.streetStartY ? streetData.streetStartY : 0,
        streetEndX: streetData.streetEndX ? streetData.streetEndX : 0,
        streetEndY: streetData.streetEndY ? streetData.streetEndY : 0,
        pkId: streetData.pkId,
        esus: streetData.esus
          ? streetData.esus.map((esu) => {
              return {
                changeType: esu.changeType,
                esuVersionNumber: esu.esuVersionNumber,
                numCoordCount: esu.numCoordCount,
                esuTolerance: esu.esuTolerance,
                esuStartDate: esu.esuStartDate,
                esuEndDate: esu.esuEndDate,
                esuDirection: esu.esuDirection,
                wktGeometry: esu.wktGeometry,
                assignUnassign: esu.assignUnassign,
                pkId: esu.pkId > 0 ? esu.pkId : 0,
                esuId: esu.esuId > 0 ? esu.esuId : 0,
                highwayDedications: esu.highwayDedications
                  ? esu.highwayDedications.map((hd) => {
                      return {
                        pkId: hd.pkId > 0 ? hd.pkId : 0,
                        esuId: hd.esuId > 0 ? hd.esuId : 0,
                        // seqNum: hd.pkId > 0 ? hd.seqNum : 0,
                        seqNum: hd.seqNum,
                        changeType: esu.changeType === "D" && hd.changeType !== "D" ? "D" : hd.changeType,
                        highwayDedicationCode: hd.highwayDedicationCode,
                        recordEndDate: esu.changeType === "D" && hd.changeType !== "D" ? esu.endDate : hd.recordEndDate,
                        hdStartDate: hd.hdStartDate,
                        hdEndDate: hd.hdEndDate,
                        hdSeasonalStartDate: hd.hdSeasonalStartDate,
                        hdSeasonalEndDate: hd.hdSeasonalEndDate,
                        hdStartTime: hd.hdStartTime,
                        hdEndTime: hd.hdEndTime,
                        hdProw: hd.hdProw,
                        hdNcr: hd.hdNcr,
                        hdQuietRoute: hd.hdQuietRoute,
                        hdObstruction: hd.hdObstruction,
                        hdPlanningOrder: hd.hdPlanningOrder,
                        hdVehiclesProhibited: hd.hdVehiclesProhibited,
                      };
                    })
                  : [],
                oneWayExemptions: esu.oneWayExemptions
                  ? esu.oneWayExemptions.map((owe) => {
                      return {
                        pkId: owe.pkId > 0 ? owe.pkId : 0,
                        esuId: owe.esuId > 0 ? owe.esuId : 0,
                        // sequenceNumber: owe.pkId > 0 ? owe.sequenceNumber : 0,
                        sequenceNumber: owe.sequenceNumber,
                        changeType: esu.changeType === "D" && owe.changeType !== "D" ? "D" : owe.changeType,
                        oneWayExemptionTypeCode: owe.oneWayExemptionTypeCode,
                        recordEndDate:
                          esu.changeType === "D" && owe.changeType !== "D" ? esu.endDate : owe.recordEndDate,
                        oneWayExemptionStartDate: owe.oneWayExemptionStartDate,
                        oneWayExemptionEndDate: owe.oneWayExemptionEndDate,
                        oneWayExemptionStartTime: owe.oneWayExemptionStartTime,
                        oneWayExemptionEndTime: owe.oneWayExemptionEndTime,
                        oneWayExemptionPeriodicityCode: owe.oneWayExemptionPeriodicityCode,
                      };
                    })
                  : [],
              };
            })
          : [],
        streetDescriptors: streetData.streetDescriptors
          ? streetData.streetDescriptors.map((sd) => {
              return {
                changeType: sd.changeType,
                usrn: sd.usrn,
                streetDescriptor: sd.streetDescriptor,
                locRef: sd.locRef
                  ? sd.locRef
                  : sd.language === "CYM"
                  ? unassignedCymLocality.localityRef
                  : unassignedEngLocality.localityRef,
                locality: sd.locRef ? sd.locality : "",
                townRef: sd.townRef
                  ? sd.townRef
                  : sd.language === "CYM"
                  ? unassignedCymTown.townRef
                  : unassignedEngTown.townRef,
                town: sd.townRef ? sd.town : "",
                adminAreaRef: sd.adminAreaRef
                  ? sd.adminAreaRef
                  : sd.language === "CYM"
                  ? unassignedCymAdminArea.administrativeAreaRef
                  : unassignedEngAdminArea.administrativeAreaRef,
                administrativeArea: sd.adminAreaRef ? sd.administrativeArea : "",
                language: sd.language,
                neverExport: sd.neverExport,
                pkId: sd.pkId > 0 ? sd.pkId : 0,
              };
            })
          : [],
        streetNotes: streetData.streetNotes
          ? streetData.streetNotes.map((sn) => {
              return {
                usrn: sn.usrn,
                note: sn.note,
                changeType: sn.changeType,
                pkId: sn.pkId > 0 ? sn.pkId : 0,
                // seqNo: sn.pkId > 0 ? sn.seqNo : 0,
                seqNo: sn.seqNo,
              };
            })
          : [],
        interests: streetData.interests
          ? streetData.interests.map((i) => {
              return {
                changeType: i.changeType,
                usrn: i.usrn,
                // seqNum: i.pkId > 0 ? i.seqNum : 0,
                seqNum: i.seqNum,
                wholeRoad: i.wholeRoad,
                specificLocation: i.specificLocation,
                neverExport: i.neverExport,
                swaOrgRefAuthority: i.swaOrgRefAuthority,
                districtRefAuthority: i.districtRefAuthority,
                recordStartDate: i.recordStartDate,
                recordEndDate: i.recordEndDate,
                asdCoordinate: i.asdCoordinate,
                asdCoordinateCount: i.asdCoordinateCount,
                swaOrgRefAuthMaintaining: i.swaOrgRefAuthMaintaining,
                streetStatus: i.streetStatus,
                interestType: i.interestType,
                startX: i.startX && !i.wholeRoad ? i.startX : 0,
                startY: i.startY && !i.wholeRoad ? i.startY : 0,
                endX: i.endX && !i.wholeRoad ? i.endX : 0,
                endY: i.endY && !i.wholeRoad ? i.endY : 0,
                wktGeometry: i.wktGeometry,
                pkId: i.pkId > 0 ? i.pkId : 0,
              };
            })
          : [],
        constructions: streetData.constructions
          ? streetData.constructions.map((c) => {
              return {
                changeType: c.changeType,
                usrn: c.usrn,
                // seqNum: c.pkId > 0 ? c.seqNum : 0,
                seqNum: c.seqNum,
                wholeRoad: c.wholeRoad,
                specificLocation: c.specificLocation,
                neverExport: c.neverExport,
                recordStartDate: c.recordStartDate,
                recordEndDate: c.recordEndDate,
                reinstatementTypeCode: c.reinstatementTypeCode,
                constructionType: c.constructionType,
                aggregateAbrasionVal: c.aggregateAbrasionVal,
                polishedStoneVal: c.polishedStoneVal,
                frostHeaveSusceptibility: c.frostHeaveSusceptibility,
                steppedJoint: c.steppedJoint,
                asdCoordinate: c.asdCoordinate,
                asdCoordinateCount: c.asdCoordinateCount,
                constructionStartX: c.constructionStartX && !c.wholeRoad ? c.constructionStartX : 0,
                constructionStartY: c.constructionStartY && !c.wholeRoad ? c.constructionStartY : 0,
                constructionEndX: c.constructionEndX && !c.wholeRoad ? c.constructionEndX : 0,
                constructionEndY: c.constructionEndY && !c.wholeRoad ? c.constructionEndY : 0,
                constructionDescription: c.constructionDescription,
                swaOrgRefConsultant: c.swaOrgRefConsultant,
                districtRefConsultant: c.districtRefConsultant,
                wktGeometry: c.wktGeometry,
                pkId: c.pkId > 0 ? c.pkId : 0,
              };
            })
          : [],
        specialDesignations: streetData.specialDesignations
          ? streetData.specialDesignations.map((sd) => {
              return {
                changeType: sd.changeType,
                usrn: sd.usrn,
                // seqNum: sd.pkId > 0 ? sd.seqNum : 0,
                seqNum: sd.seqNum,
                wholeRoad: sd.wholeRoad,
                specificLocation: sd.specificLocation,
                neverExport: sd.neverExport,
                streetSpecialDesigCode: sd.streetSpecialDesigCode,
                asdCoordinate: sd.asdCoordinate,
                asdCoordinateCount: sd.asdCoordinateCount,
                specialDesigPeriodicityCode: sd.specialDesigPeriodicityCode,
                specialDesigStartX: sd.specialDesigStartX && !sd.wholeRoad ? sd.specialDesigStartX : 0,
                specialDesigStartY: sd.specialDesigStartY && !sd.wholeRoad ? sd.specialDesigStartY : 0,
                specialDesigEndX: sd.specialDesigEndX && !sd.wholeRoad ? sd.specialDesigEndX : 0,
                specialDesigEndY: sd.specialDesigEndY && !sd.wholeRoad ? sd.specialDesigEndY : 0,
                recordStartDate: sd.recordStartDate,
                recordEndDate: sd.recordEndDate,
                specialDesigStartDate: sd.specialDesigStartDate,
                specialDesigEndDate: sd.specialDesigEndDate,
                specialDesigStartTime: sd.specialDesigStartTime,
                specialDesigEndTime: sd.specialDesigEndTime,
                specialDesigDescription: sd.specialDesigDescription,
                swaOrgRefConsultant: sd.swaOrgRefConsultant,
                districtRefConsultant: sd.districtRefConsultant,
                specialDesigSourceText: sd.specialDesigSourceText,
                wktGeometry: sd.wktGeometry,
                pkId: sd.pkId > 0 ? sd.pkId : 0,
              };
            })
          : [],
        publicRightOfWays: streetData.publicRightOfWays
          ? streetData.publicRightOfWays.map((prow) => {
              return {
                changeType: prow.changeType,
                prowUsrn: prow.prowUsrn,
                defMapGeometryType: prow.defMapGeometryType,
                defMapGeometryCount: prow.defMapGeometryCount,
                prowLength: prow.prowLength,
                prowRights: prow.prowRights,
                pedAccess: prow.pedAccess,
                equAccess: prow.equAccess,
                nonMotAccess: prow.nonMotAccess,
                cycAccess: prow.cycAccess,
                motAccess: prow.motAccess,
                recordStartDate: prow.recordStartDate,
                relevantStartDate: prow.relevantStartDate,
                recordEndDate: prow.recordEndDate,
                prowStatus: prow.prowStatus,
                consultStartDate: prow.consultStartDate,
                consultEndDate: prow.consultEndDate,
                consultRef: prow.consultRef,
                consultDetails: prow.consultDetails,
                appealDate: prow.appealDate,
                appealRef: prow.appealRef,
                appealDetails: prow.appealDetails,
                divRelatedUsrn: prow.divRelatedUsrn,
                prowLocation: prow.prowLocation,
                prowDetails: prow.prowDetails,
                promotedRoute: prow.promotedRoute,
                accessibleRoute: prow.accessibleRoute,
                sourceText: prow.sourceText,
                prowOrgRefConsultant: prow.prowOrgRefConsultant,
                prowDistrictRefConsultant: prow.prowDistrictRefConsultant,
                neverExport: prow.neverExport,
                pkId: prow.pkId > 0 ? prow.pkId : 0,
              };
            })
          : [],
        heightWidthWeights: streetData.heightWidthWeights
          ? streetData.heightWidthWeights.map((hww) => {
              return {
                changeType: hww.changeType,
                usrn: hww.usrn,
                // seqNum: hww.pkId > 0 ? hww.seqNum : 0,
                seqNum: hww.seqNum,
                wholeRoad: hww.wholeRoad,
                specificLocation: hww.specificLocation,
                neverExport: hww.neverExport,
                hwwRestrictionCode: hww.hwwRestrictionCode,
                recordStartDate: hww.recordStartDate,
                recordEndDate: hww.recordEndDate,
                asdCoordinate: hww.asdCoordinate,
                asdCoordinateCount: hww.asdCoordinateCount,
                hwwStartX: hww.hwwStartX && !hww.wholeRoad ? hww.hwwStartX : 0,
                hwwStartY: hww.hwwStartY && !hww.wholeRoad ? hww.hwwStartY : 0,
                hwwEndX: hww.hwwEndX && !hww.wholeRoad ? hww.hwwEndX : 0,
                hwwEndY: hww.hwwEndY && !hww.wholeRoad ? hww.hwwStartY : 0,
                valueMetric: hww.valueMetric,
                troText: hww.troText,
                featureDescription: hww.featureDescription,
                sourceText: hww.sourceText,
                swaOrgRefConsultant: hww.swaOrgRefConsultant,
                districtRefConsultant: hww.districtRefConsultant,
                wktGeometry: hww.wktGeometry,
                pkId: hww.pkId > 0 ? hww.pkId : 0,
              };
            })
          : [],
      };
    }
  }
}

/**
 * Extract any errors returned from a call to the API.
 *
 * @param {object} body The body of the returned data from the API call, which should contain any errors.
 * @param {boolean} newStreet If true then this we were trying to create a new street; otherwise we were trying to update an existing street.
 * @return {object} The street validation error object.
 */
export function GetStreetValidationErrors(body, newStreet) {
  let errorStreet = [];
  let errorDescriptor = [];
  let errorEsu = [];
  let errorHighwayDedication = [];
  let errorOneWayException = [];
  let errorInterest = [];
  let errorConstruction = [];
  let errorSpecialDesignation = [];
  let errorHww = [];
  let errorProw = [];
  let errorNote = [];

  for (const [key, value] of Object.entries(body.errors)) {
    if (!key.includes(".")) {
      errorStreet.push({ field: key, errors: value });
    } else {
      if (key.toLowerCase().includes("streetdescriptors[")) {
        errorDescriptor.push({
          index: Number(key.substring(key.indexOf("[") + 1, key.indexOf("]"))),
          field: key.substring(key.indexOf(".") + 1),
          errors: value,
        });
      } else if (key.toLowerCase().includes("esus[")) {
        const esuIndex = key.substring(key.indexOf("[") + 1, key.indexOf("]"));
        if (key.toLowerCase().includes("highwaydedications[")) {
          errorHighwayDedication.push({
            esuIndex: Number(esuIndex),
            index: Number(key.substring(key.lastIndexOf("[") + 1, key.lastIndexOf("]"))),
            field: key.substring(key.lastIndexOf(".") + 1),
            errors: value,
          });
        } else if (key.toLowerCase().includes("onewayexemptions[")) {
          errorOneWayException.push({
            esuIndex: Number(esuIndex),
            index: Number(key.substring(key.lastIndexOf("[") + 1, key.lastIndexOf("]"))),
            field: key.substring(key.lastIndexOf(".") + 1),
            errors: value,
          });
        } else {
          errorEsu.push({
            index: Number(esuIndex),
            field: key.substring(key.indexOf(".") + 1),
            errors: value,
          });
        }
      } else if (key.toLowerCase().includes("interests[")) {
        errorInterest.push({
          index: Number(key.substring(key.indexOf("[") + 1, key.indexOf("]"))),
          field: key.substring(key.indexOf(".") + 1),
          errors: value,
        });
      } else if (key.toLowerCase().includes("constructions[")) {
        errorConstruction.push({
          index: Number(key.substring(key.indexOf("[") + 1, key.indexOf("]"))),
          field: key.substring(key.indexOf(".") + 1),
          errors: value,
        });
      } else if (key.toLowerCase().includes("specialdesignations[")) {
        errorSpecialDesignation.push({
          index: Number(key.substring(key.indexOf("[") + 1, key.indexOf("]"))),
          field: key.substring(key.indexOf(".") + 1),
          errors: value,
        });
      } else if (key.toLowerCase().includes("publicrightofways[")) {
        errorProw.push({
          index: Number(key.substring(key.indexOf("[") + 1, key.indexOf("]"))),
          field: key.substring(key.indexOf(".") + 1),
          errors: value,
        });
      } else if (key.toLowerCase().includes("heightwidthweights[")) {
        errorHww.push({
          index: Number(key.substring(key.indexOf("[") + 1, key.indexOf("]"))),
          field: key.substring(key.indexOf(".") + 1),
          errors: value,
        });
      } else if (key.toLowerCase().includes("streetnotes[")) {
        errorNote.push({
          index: Number(key.substring(key.indexOf("[") + 1, key.indexOf("]"))),
          field: key.substring(key.indexOf(".") + 1),
          errors: value,
        });
      }
    }
  }

  if (errorStreet.length > 0) {
    // if (process.env.NODE_ENV === "development")
    console.error(`[400 ERROR] ${newStreet ? "Creating" : "Updating"} Street - Street`, errorStreet);
  }
  if (errorDescriptor.length > 0) {
    // if (process.env.NODE_ENV === "development")
    console.error(`[400 ERROR] ${newStreet ? "Creating" : "Updating"} Street - Descriptor`, errorDescriptor);
  }
  if (errorEsu.length > 0) {
    // if (process.env.NODE_ENV === "development")
    console.error(`[400 ERROR] ${newStreet ? "Creating" : "Updating"} Street - ESU`, errorEsu);
  }
  if (errorHighwayDedication.length > 0) {
    // if (process.env.NODE_ENV === "development")
    console.error(
      `[400 ERROR] ${newStreet ? "Creating" : "Updating"} Street - Highway Dedication`,
      errorHighwayDedication
    );
  }
  if (errorOneWayException.length > 0) {
    // if (process.env.NODE_ENV === "development")
    console.error(
      `[400 ERROR] ${newStreet ? "Creating" : "Updating"} Street - One-way Exemption`,
      errorOneWayException
    );
  }
  if (errorInterest.length > 0) {
    // if (process.env.NODE_ENV === "development")
    console.error(`[400 ERROR] ${newStreet ? "Creating" : "Updating"} ASD - Interest`, errorInterest);
  }
  if (errorConstruction.length > 0) {
    // if (process.env.NODE_ENV === "development")
    console.error(`[400 ERROR] ${newStreet ? "Creating" : "Updating"} ASD - Construction`, errorConstruction);
  }
  if (errorSpecialDesignation.length > 0) {
    // if (process.env.NODE_ENV === "development")
    console.error(
      `[400 ERROR] ${newStreet ? "Creating" : "Updating"} ASD - Special Designation`,
      errorSpecialDesignation
    );
  }
  if (errorHww.length > 0) {
    // if (process.env.NODE_ENV === "development")
    console.error(`[400 ERROR] ${newStreet ? "Creating" : "Updating"} ASD - Height, Width and Weight`, errorHww);
  }
  if (errorProw.length > 0) {
    // if (process.env.NODE_ENV === "development")
    console.error(`[400 ERROR] ${newStreet ? "Creating" : "Updating"} ASD - Public Right of Way`, errorProw);
  }
  if (errorNote.length > 0) {
    // if (process.env.NODE_ENV === "development")
    console.error(`[400 ERROR] ${newStreet ? "Creating" : "Updating"} Street - Note`, errorNote);
  }

  return {
    street: errorStreet,
    descriptor: errorDescriptor,
    esu: errorEsu,
    highwayDedication: errorHighwayDedication,
    oneWayExemption: errorOneWayException,
    interest: errorInterest,
    construction: errorConstruction,
    specialDesignation: errorSpecialDesignation,
    hww: errorHww,
    prow: errorProw,
    note: errorNote,
  };
}

/**
 * Return the street record for use within the map.
 *
 * @param {number} usrn The USRN of the street we are interested in.
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @return {object} The street map object.
 */
export async function GetStreetMapData(usrn, userToken, isScottish) {
  if (usrn === 0) return null;

  const streetUrl = GetStreetByUSRNUrl(userToken, isScottish);

  if (streetUrl) {
    const returnData = await fetch(`${streetUrl.url}/${usrn}`, {
      headers: streetUrl.headers,
      crossDomain: true,
      method: "GET",
    })
      .then((res) => (res.ok ? res : Promise.reject(res)))
      .then((res) => res.json())
      .then(
        (result) => {
          return result;
        },
        (error) => {
          console.error("[ERROR] Get Street data", error);
          return null;
        }
      );

    return returnData;
  } else return null;
}

/**
 * Method to display the given street in Google Street View.
 *
 * @param {number} usrn The USRN of the street we are interested in.
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 */
export async function DisplayStreetInStreetView(usrn, userToken, isScottish) {
  if (usrn && usrn > 0) {
    await GetStreetMapData(usrn, userToken, isScottish).then((result) => {
      if (result) {
        if (isScottish) {
          // OneScotland does not have start and end coordinates on the street so need to get them from the ESUs
          if (result.esus && result.esus.length > 0) {
            const esuPoints = result.esus[0].wktGeometry.replace("LINESTRING (", "").replace(")").split(",");

            if (esuPoints && esuPoints.length > 0) {
              const firstEsuPointString = esuPoints[0].split(" ");
              if (firstEsuPointString) {
                const bngPoint = [Number(firstEsuPointString[0]), Number(firstEsuPointString[1])];
                openInStreetView(bngPoint);
              }
            }
          }
        } else {
          openInStreetView([result.streetStartX, result.streetStartY]);
        }
      }
    });
  }
}

/**
 * Return the ESU data for the given id.
 *
 * @param {number} esuId The id of the ESU we are interested in.
 * @param {string} userToken The token for the user calling the end point.
 * @returns {object|null} The ESU data for the given id.
 */
export async function GetEsuData(esuId, userToken) {
  if (!esuId || esuId === 0) return null;

  const esuUrl = GetEsuByIdUrl(userToken);

  if (esuUrl) {
    const returnData = await fetch(`${esuUrl.url}/${esuId}`, {
      headers: esuUrl.headers,
      crossDomain: true,
      method: "GET",
    })
      .then((res) => (res.ok ? res : Promise.reject(res)))
      .then((res) => res.json())
      .then(
        (result) => {
          return result;
        },
        (error) => {
          console.error("[ERROR] Get Street data", error);
          return null;
        }
      );

    return returnData;
  } else return null;
}

/**
 * Return the ESU data for the given list of ids.
 *
 * @param {Array} esuIds List of ESU ids that we want the data for.
 * @param {string} userToken The token for the user calling the end point.
 * @returns {object|null} The ESU data for the list of ids.
 */
export async function GetMultipleEsusData(esuIds, userToken) {
  if (!esuIds || !esuIds.length) return null;

  const esuUrl = GetMultipleEsusByIdUrl(userToken);

  if (esuUrl) {
    const returnData = await fetch(`${esuUrl.url}/${esuIds.join()}`, {
      headers: esuUrl.headers,
      crossDomain: true,
      method: "GET",
    })
      .then((res) => (res.ok ? res : Promise.reject(res)))
      .then((res) => {
        if (res && res.status === 204) return [];
        else return res.json();
      })
      .then(
        (result) => {
          return result;
        },
        (error) => {
          console.error("[ERROR] Get ESUs for assigning to street.", error);
          return null;
        }
      );

    return returnData;
  } else return null;
}

/**
 * Check to see if the street is closed or not.
 *
 * @param {number} usrn The USRN of the street we are interested in.
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @return {boolean} True if the street is closed; otherwise false.
 */
export async function IsStreetClosed(usrn, userToken, isScottish) {
  const streetRecord = usrn && (await GetStreetMapData(usrn, userToken, isScottish));

  return streetRecord && streetRecord.endDate;
}

/**
 * Save any changes for the given street.
 *
 * @param {object} currentStreet The current street data.
 * @param {object} streetContext The street context object.
 * @param {object} userContext The user context object.
 * @param {object} lookupContext The lookup context object.
 * @param {object} searchContext The search context object.
 * @param {object} mapContext The map context object.
 * @param {object} sandboxContext The sandbox context object.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @param {boolean} isWelsh True if the authority is a Welsh authority; otherwise false.
 * @return {object|null} If the save is successful the updated street object; otherwise null.
 */
export async function SaveStreet(
  currentStreet,
  streetContext,
  userContext,
  lookupContext,
  searchContext,
  mapContext,
  sandboxContext,
  isScottish,
  isWelsh
) {
  const getStreetAddress = (descriptor, locRef, townRef, islandRef) => {
    const locality = locRef ? lookupContext.currentLookups.localities.find((x) => x.localityRef === locRef) : null;
    const town = townRef ? lookupContext.currentLookups.towns.find((x) => x.townRef === townRef) : null;
    const island = islandRef ? lookupContext.currentLookups.islands.find((x) => x.islandRef === islandRef) : null;

    return `${descriptor}${locality ? " " + locality.locality : ""}${town ? " " + town.town : ""}${
      island ? " " + island.island : ""
    }`;
  };

  let streetSaved = null;
  const saveUrl = streetContext.currentStreet.newStreet
    ? GetCreateStreetUrl(userContext.currentUser.token, isScottish)
    : GetUpdateStreetUrl(userContext.currentUser.token, isScottish);
  const saveData = streetContext.currentStreet.newStreet
    ? GetStreetCreateData(currentStreet, lookupContext, isScottish)
    : GetStreetUpdateData(currentStreet, lookupContext, isScottish);

  // if (process.env.NODE_ENV === "development")
  console.log("[DEBUG] SaveStreet - JSON saveData", JSON.stringify(saveData));

  if (saveUrl) {
    await fetch(saveUrl.url, {
      headers: saveUrl.headers,
      crossDomain: true,
      method: saveUrl.type,
      body: JSON.stringify(saveData),
    })
      .then((res) => (res.ok ? res : Promise.reject(res)))
      .then((res) => res.json())
      .then((result) => {
        mapContext.onSetCoordinate(null);
        streetContext.onStreetModified(false);
        streetContext.resetStreetErrors();
        sandboxContext.resetSandbox("street");

        const searchAddresses = [];
        let newSearchData = [];
        const savedDescriptorLookups = [];
        let streetAddress = "";
        const returnedDescriptors = isWelsh
          ? result.streetDescriptors
              .sort((a, b) => (a.language > b.language ? 1 : b.language > a.language ? -1 : 0))
              .reverse()
          : result.streetDescriptors.sort((a, b) => (a.language > b.language ? 1 : b.language > a.language ? -1 : 0));

        for (const descriptor of returnedDescriptors) {
          if (!searchAddresses.includes(descriptor.streetDescriptor)) {
            searchAddresses.push(descriptor.streetDescriptor);
            streetAddress = getStreetAddress(
              descriptor.streetDescriptor,
              descriptor.locRef,
              descriptor.townRef,
              isScottish ? descriptor.islandRef : null
            );
            const newData = {
              type: 15,
              id: `${descriptor.usrn}_${descriptor.language}`,
              uprn: "",
              usrn: descriptor.usrn,
              logical_status: result.recordType ? Number(result.recordType) + 10 : 10,
              language: descriptor.language,
              classification_code: null,
              isParent: false,
              parent_uprn: null,
              county: null,
              authority: null,
              longitude: null,
              latitude: null,
              easting: result.streetStartX,
              northing: result.streetStartY,
              full_building_desc: null,
              formattedaddress: null,
              organisation: null,
              secondary_name: null,
              sao_text: null,
              sao_nums: null,
              primary_name: null,
              pao_text: null,
              pao_nums: null,
              street: descriptor.streetDescriptor,
              locality: descriptor.locality,
              town: descriptor.town,
              post_town: null,
              postcode: null,
              crossref: null,
              address: streetAddress,
              sort_code: 0,
            };

            savedDescriptorLookups.push({
              usrn: descriptor.usrn,
              language: descriptor.language,
              address: streetAddress,
            });

            if (searchContext.currentSearchData.results && searchContext.currentSearchData.results.length > 0) {
              const i = searchContext.currentSearchData.results.findIndex(
                (x) => x.id === `${descriptor.usrn}_${descriptor.language}`
              );
              if (i > -1) {
                newSearchData = searchContext.currentSearchData.results.map(
                  (x) => [newData].find((rec) => rec.id === x.id) || x
                );
              } else {
                newSearchData = JSON.parse(JSON.stringify(searchContext.currentSearchData.results));
                newSearchData.push(newData);
              }

              if (newSearchData)
                searchContext.onSearchDataChange(searchContext.currentSearchData.searchString, newSearchData);
            }
          }
        }

        let updatedDescriptorLookups = [];
        if (streetContext.currentStreet.newStreet) {
          updatedDescriptorLookups = lookupContext.currentLookups.streetDescriptors.concat(savedDescriptorLookups);
        } else {
          updatedDescriptorLookups = lookupContext.currentLookups.streetDescriptors.map(
            (x) => savedDescriptorLookups.find((rec) => rec.usrn === x.usrn && rec.language === x.language) || x
          );
        }

        lookupContext.onUpdateLookup("streetDescriptor", updatedDescriptorLookups);

        const engDescriptor = result.streetDescriptors.find((x) => x.language === "ENG");

        streetContext.onStreetChange(result.usrn, engDescriptor.streetDescriptor, false);

        updateMapStreetData(
          result,
          isScottish ? result.maintenanceResponsibilities : null,
          isScottish ? result.reinstatementCategories : null,
          isScottish ? result.specialDesignations : null,
          !isScottish && HasASD() ? result.interests : null,
          !isScottish && HasASD() ? result.constructions : null,
          !isScottish && HasASD() ? result.specialDesignations : null,
          !isScottish && HasASD() ? result.heightWidthWeights : null,
          !isScottish && HasASD() ? result.publicRightOfWays : null,
          isScottish,
          mapContext,
          lookupContext.currentLookups
        );

        streetSaved = result;
      })
      .catch((res) => {
        switch (res.status) {
          case 400:
            res.json().then((body) => {
              console.error(
                `[400 ERROR] ${streetContext.currentStreet.newStreet ? "Creating" : "Updating"} Street object`,
                body.errors
              );
              const streetErrors = GetStreetValidationErrors(body, streetContext.currentStreet.newStreet);

              streetContext.onStreetErrors(
                streetErrors.street,
                streetErrors.descriptor,
                streetErrors.esu,
                streetErrors.highwayDedication,
                streetErrors.oneWayException,
                streetErrors.interest,
                streetErrors.construction,
                streetErrors.specialDesignation,
                streetErrors.hww,
                streetErrors.prow,
                streetErrors.note
              );
            });
            break;

          case 401:
            res.json().then((body) => {
              console.error(
                `[401 ERROR] ${streetContext.currentStreet.newStreet ? "Creating" : "Updating"} Street`,
                body
              );
            });
            break;

          case 500:
            console.error(`[500 ERROR] ${streetContext.currentStreet.newStreet ? "Creating" : "Updating"} Street`, res);
            break;

          default:
            console.error(
              `[${res.status} ERROR] HandleSaveStreet - ${
                streetContext.currentStreet.newStreet ? "Creating" : "Updating"
              } street.`,
              res
            );
            break;
        }

        streetSaved = null;
      });
  }

  return streetSaved;
}

/**
 * Get the ASD primary code text
 *
 * @param {number} variant The ASD variant that we need to get the primary code text for
 * @param {number} value  The code to use to find the text.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @returns {string} The ASD primary text.
 */
export function GetAsdPrimaryCodeText(variant, value, isScottish) {
  let primaryRecord = null;

  switch (variant) {
    case "51": // Maintenance responsibilities
      primaryRecord = RoadStatusCode.filter((x) => x.id === value);
      break;

    case "52": // Reinstatement categories
      primaryRecord = ReinstatementType.filter((x) => x.id === value);
      break;

    case "53": // Special Designation
      primaryRecord = SpecialDesignationCode.filter((x) => x.id === value);
      break;

    case "61": // Interested organisations
      primaryRecord = RoadStatusCode.filter((x) => x.id === value);
      break;

    case "62": // Construction
      primaryRecord = ConstructionType.filter((x) => x.id === value);
      break;

    case "63": // Special Designation
      primaryRecord = SpecialDesignationCode.filter((x) => x.id === value);
      break;

    case "64": // Height, width and weight restrictions
      primaryRecord = HWWDesignationCode.filter((x) => x.id === value);
      break;

    case "66": // Public right of ways
      primaryRecord = PRoWDedicationCode.filter((x) => x.id === value);
      break;

    default:
      break;
  }

  if (primaryRecord && primaryRecord.length > 0) return primaryRecord[0][GetLookupLabel(isScottish)];
  else return "";
}

/**
 * Gets the type of ASD record that is being deleted.
 *
 * @param {string} variant The type of ASD record that is being deleted
 * @returns {string} The ASD delete variant.
 */
export const getAsdDeleteVariant = (variant) => {
  switch (variant) {
    case "51":
      return "maintenance responsibility";

    case "52":
      return "reinstatement category";

    case "53":
      return "os special designation";

    case "61":
      return "interested organisation";

    case "62":
      return "construction";

    case "63":
      return "special designation";

    case "64":
      return "hww";

    case "66":
      return "prow";

    default:
      break;
  }
};

/**
 * Get the objects to display the primary field of the given ASD record
 *
 * @param {object} d The ASD record to get the data from
 * @param {string|null} startDateField The name of the start date field
 * @param {string|null} endDateField Then name of the end date field
 * @param {string} variant The type of ASD data
 * @param {string} primaryCodeField The name of the primary code field
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @returns {object} The ASD primary text.
 */
export function GetAsdPrimaryText(d, startDateField, endDateField, variant, primaryCodeField, isScottish) {
  if (startDateField && endDateField) {
    return (
      <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
        <Typography variant="body1">{GetAsdPrimaryCodeText(variant, d[primaryCodeField], isScottish)}</Typography>
        <Typography variant="body2">{`${dateFormat(d[startDateField], "d mmm yyyy")} - ${
          d[endDateField] ? dateFormat(d[endDateField], "d mmm yyyy") : ""
        }`}</Typography>
      </Stack>
    );
  } else {
    return <Typography variant="body1">{GetAsdPrimaryCodeText(variant, d[primaryCodeField], isScottish)}</Typography>;
  }
}

/**
 * Get the text to display the secondary field of the given ASD record
 *
 * @param {number} value The value from the secondary code field
 * @param {string} variant The type of ASD data
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @returns {string} The ASD secondary text.
 */
export function GetAsdSecondaryText(value, variant, isScottish) {
  let secondaryRecord = null;

  switch (variant) {
    case "51":
    case "52":
    case "53":
    case "61":
      secondaryRecord = SwaOrgRef.filter((x) => x.id === value);
      break;

    case "62":
    case "63":
    case "64":
      return (
        value &&
        value
          .toLowerCase()
          .replace(/\.\s+([a-z])[^.]|^(\s*[a-z])[^.]/g, (s) => s.replace(/([a-z])/, (s) => s.toUpperCase()))
      );

    default:
      break;
  }

  if (secondaryRecord && secondaryRecord.length > 0) return secondaryRecord[0][GetLookupLabel(isScottish)];
  else return "";
}

/**
 * Method to update the map street data.
 *
 * @param {object|null} streetData The current street data.
 * @param {object|null} asdType51 The ASD type 51 data (OneScotland only).
 * @param {object|null} asdType52 The ASD type 52 data (OneScotland only).
 * @param {object|null} asdType53 The ASD type 53 data (OneScotland only).
 * @param {object|null} asdType61 The ASD type 61 data (GeoPlace only).
 * @param {object|null} asdType62 The ASD type 62 data (GeoPlace only).
 * @param {object|null} asdType63 The ASD type 63 data (GeoPlace only).
 * @param {object|null} asdType64 The ASD type 64 data (GeoPlace only).
 * @param {object|null} asdType66 The ASD type 66 data (GeoPlace only).
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @param {object} mapContext The map context object.
 * @param {object} currentlookups The current lookups.
 */
export const updateMapStreetData = (
  streetData,
  asdType51,
  asdType52,
  asdType53,
  asdType61,
  asdType62,
  asdType63,
  asdType64,
  asdType66,
  isScottish,
  mapContext,
  currentlookups
) => {
  const engDescriptor = streetData.streetDescriptors.find((x) => x.language === "ENG");

  const townRec = currentlookups.towns.find((x) => x.townRef === engDescriptor.townRef);
  const localityRec = currentlookups.localities.find((x) => x.localityRef === engDescriptor.locRef);

  const currentSearchStreets = [
    {
      usrn: streetData.usrn,
      description: engDescriptor.streetDescriptor,
      language: "ENG",
      locality: localityRec ? localityRec.locality : engDescriptor.locality,
      town: townRec ? townRec.town : engDescriptor.town,
      state: !isScottish ? streetData.state : undefined,
      type: streetData.recordType,
      esus: streetData.esus
        // .filter((esu) => esu.pkId > 0)
        .map((esu) => ({
          esuId: esu.esuId,
          state: isScottish ? esu.state : undefined,
          geometry: esu.wktGeometry && esu.wktGeometry !== "" ? GetWktCoordinates(esu.wktGeometry) : undefined,
        })),
      asdType51:
        isScottish && asdType51
          ? asdType51.map((asdRec) => ({
              type: 51,
              pkId: asdRec.pkId,
              usrn: asdRec.usrn,
              streetStatus: asdRec.streetStatus,
              custodianCode: asdRec.custodianCode,
              maintainingAuthorityCode: asdRec.maintainingAuthorityCode,
              wholeRoad: asdRec.wholeRoad,
              geometry:
                asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
            }))
          : null,
      asdType52:
        isScottish && asdType52
          ? asdType52.map((asdRec) => ({
              type: 52,
              pkId: asdRec.pkId,
              usrn: asdRec.usrn,
              reinstatementCategoryCode: asdRec.reinstatementCategoryCode,
              custodianCode: asdRec.custodianCode,
              reinstatementAuthorityCode: asdRec.reinstatementAuthorityCode,
              wholeRoad: asdRec.wholeRoad,
              geometry:
                asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
            }))
          : null,
      asdType53:
        isScottish && asdType53
          ? asdType53.map((asdRec) => ({
              type: 53,
              pkId: asdRec.pkId,
              usrn: asdRec.usrn,
              specialDesig: asdRec.specialDesig,
              custodianCode: asdRec.custodianCode,
              authorityCode: asdRec.authorityCode,
              wholeRoad: asdRec.wholeRoad,
              geometry:
                asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
            }))
          : null,
      asdType61:
        !isScottish && HasASD() && asdType61
          ? asdType61.map((asdRec) => ({
              type: 61,
              pkId: asdRec.pkId,
              usrn: asdRec.usrn,
              streetStatus: asdRec.streetStatus,
              interestType: asdRec.interestType,
              districtRefAuthority: asdRec.districtRefAuthority,
              swaOrgRefAuthority: asdRec.swaOrgRefAuthority,
              wholeRoad: asdRec.wholeRoad,
              geometry:
                asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
            }))
          : null,
      asdType62:
        !isScottish && HasASD() && asdType62
          ? asdType62.map((asdRec) => ({
              type: 62,
              pkId: asdRec.pkId,
              usrn: asdRec.usrn,
              constructionType: asdRec.constructionType,
              reinstatementTypeCode: asdRec.reinstatementTypeCode,
              swaOrgRefConsultant: asdRec.swaOrgRefConsultant,
              districtRefConsultant: asdRec.districtRefConsultant,
              wholeRoad: asdRec.wholeRoad,
              geometry:
                asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
            }))
          : null,
      asdType63:
        !isScottish && HasASD() && asdType63
          ? asdType63.map((asdRec) => ({
              type: 63,
              pkId: asdRec.pkId,
              usrn: asdRec.usrn,
              streetSpecialDesigCode: asdRec.streetSpecialDesigCode,
              swaOrgRefConsultant: asdRec.swaOrgRefConsultant,
              districtRefConsultant: asdRec.districtRefConsultant,
              wholeRoad: asdRec.wholeRoad,
              geometry:
                asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
            }))
          : null,
      asdType64:
        !isScottish && HasASD() && asdType64
          ? asdType64.map((asdRec) => ({
              type: 64,
              pkId: asdRec.pkId,
              usrn: asdRec.usrn,
              hwwRestrictionCode: asdRec.hwwRestrictionCode,
              swaOrgRefConsultant: asdRec.swaOrgRefConsultant,
              districtRefConsultant: asdRec.districtRefConsultant,
              wholeRoad: asdRec.wholeRoad,
              geometry:
                asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
            }))
          : null,
      asdType66:
        !isScottish && HasASD() && asdType66
          ? asdType66.map((asdRec) => ({
              type: 66,
              pkId: asdRec.pkId,
              usrn: asdRec.usrn,
              prowRights: asdRec.prowRights,
              prowStatus: asdRec.prowStatus,
              prowOrgRefConsultant: asdRec.prowOrgRefConsultant,
              prowDistrictRefConsultant: asdRec.prowDistrictRefConsultant,
              wholeRoad: asdRec.wholeRoad,
              geometry:
                asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
            }))
          : null,
    },
  ];

  mapContext.onSearchDataChange(currentSearchStreets, [], streetData.usrn, null);
};

/**
 * Method used to determine if a street has been modified.
 *
 * @param {boolean} newStreet If true the street is being created.
 * @param {object} currentSandbox The current state of the sandbox.
 * @returns {boolean} True if the street has been changed; otherwise false.
 */
export const hasStreetChanged = (newStreet, currentSandbox) => {
  return (
    newStreet ||
    currentSandbox.currentStreetRecords.descriptor ||
    currentSandbox.currentStreetRecords.highwayDedication ||
    currentSandbox.currentStreetRecords.oneWayExemption ||
    currentSandbox.currentStreetRecords.maintenanceResponsibility ||
    currentSandbox.currentStreetRecords.reinstatementCategory ||
    currentSandbox.currentStreetRecords.osSpecialDesignation ||
    currentSandbox.currentStreetRecords.interest ||
    currentSandbox.currentStreetRecords.construction ||
    currentSandbox.currentStreetRecords.specialDesignation ||
    currentSandbox.currentStreetRecords.hww ||
    currentSandbox.currentStreetRecords.prow ||
    currentSandbox.currentStreetRecords.note ||
    (currentSandbox.currentStreet && !StreetComparison(currentSandbox.sourceStreet, currentSandbox.currentStreet))
  );
};
