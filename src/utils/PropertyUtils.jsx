/* #region header */
/**************************************************************************************************
//
//  Description: Property utilities
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
//    002   16.03.23 Sean Flook         WI40583 Modified SavePropertyAndUpdate to correctly return the result of the save.
//    003   23.03.23 Sean Flook         WI40603 Include parentUprn in GetNewPropertyData.
//    004   31.03.23 Sean Flook         WI40652 For template and wizard do not include Historic or Rejected logical status.
//    005   06.04.23 Sean Flook         WI40675 Corrected logic in FilteredLPILogicalStatus.
//    006   21.04.23 Sean Flook         WI40693 Do not format search default "addresses".
//    007   28.06.23 Sean Flook         WI40256 Changed Extent to Provenance where appropriate.
//    008   28.06.23 Sean Flook         WI40730 Modified GetTempAddress to work with the updated endpoint.
//    009   30.06.23 Sean Flook         WI40770 Set suffix letters to uppercase.
//    010   07.09.23 Sean Flook                 Removed unnecessary awaits.
//    011   20.09.23 Sean Flook                 Added OneScotland specific record types.
//    012   22.09.23 Sean Flook                 Changes required to handle Scottish classifications.
//    013   27.10.23 Sean Flook                 Changes required to handle Scottish data.
//    014   24.11.23 Sean Flook                 Further changes required for Scottish authorities.
//    015   24.11.23 Joel Benford               Add Scottish option for getting official/postal text.
//    016   30.11.23 Sean Flook                 Use constant for default classification scheme.
//    017   14.12.23 Sean Flook                 Removed redundant fields.
//    018   02.01.24 Sean Flook                 Changed console.log to console.error for error messages.
//    019   08.01.24 Joel Benford               Add getLpiSubLocality
//    020   12.01.24 Sean Flook       IMANN-163 Do not bother to get property map data if we do not have a UPRN.
//    021   12.01.24 Sean Flook       IMANN-163 Handle when we have no search results.
//    022   16.01.24 Sean Flook                 Changes required to fix warnings.
//    023   25.01.24 Sean Flook                 Bug fix.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import { GetLookupLabel, GetCurrentDate } from "./HelperUtils";
import {
  GetPropertyFromUPRNUrl,
  GetDeletePropertyUrl,
  GetCreatePropertyUrl,
  GetUpdatePropertyUrl,
  GetTempAddressUrl,
} from "../configuration/ADSConfig";
import BLPUClassification from "../data/BLPUClassification";
import OSGClassification, { OSGScheme } from "../data/OSGClassification";
import LPILogicalStatus from "../data/LPILogicalStatus";
import BLPUProvenance from "./../data/BLPUProvenance";
import BLPULogicalStatus from "../data/BLPULogicalStatus";
import RepresentativePointCode from "../data/RepresentativePointCode";
import BLPUState from "../data/BLPUState";
import OfficialAddress from "../data/OfficialAddress";
import PostallyAddressable from "../data/PostallyAddressable";

/**
 * Returns a list of BLPU logical statuses depending on if the authority is Scottish or not.
 *
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @param {boolean} [isTemplate=false] If we are returning the list for the property templates then this is true; otherwise false.
 * @return {array} The filtered list of BLPU logical statuses.
 */
export const FilteredBLPULogicalStatus = (isScottish, isTemplate = false) => {
  if (isScottish) {
    return BLPULogicalStatus.filter((x) => x.osText && (!isTemplate || ![7, 8, 9].includes(x.id)));
  } else {
    return BLPULogicalStatus.filter((x) => x.gpText && (!isTemplate || ![7, 8, 9].includes(x.id)));
  }
};

/**
 * Returns a list of representative point codes depending on if the authority is Scottish or not.
 *
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @param {boolean} [newOnly=false] If true only return values acceptable for a new property.
 * @return {array} The filtered list of representative point codes.
 */
export const FilteredRepresentativePointCode = (isScottish, newOnly = false) => {
  if (isScottish) {
    if (newOnly) return RepresentativePointCode.filter((x) => x.osText && [1, 2, 4].includes(x.id));
    else return RepresentativePointCode.filter((x) => x.osText);
  } else {
    if (newOnly) return RepresentativePointCode.filter((x) => x.gpText && [1, 2, 4].includes(x.id));
    else return RepresentativePointCode.filter((x) => x.gpText);
  }
};

/**
 * Returns a list of BLPU states depending on if the authority is Scottish or not and the supplied logical status.
 *
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @param {number} logicalStatus The BLPU logical status used to further filter the states that are returned.
 * @return {array} The filtered list of BLPU states.
 */
export const FilteredBLPUState = (isScottish, logicalStatus) => {
  if (isScottish) {
    return BLPUState.filter((x) => x.osText);
  } else {
    switch (logicalStatus) {
      case 1:
        return BLPUState.filter((x) => x.gpText && [1, 2, 3].includes(x.id));

      case 5:
      case 7:
        return BLPUState.filter((x) => x.gpText && [1, 2, 3, 4, 6].includes(x.id));

      case 6:
        return BLPUState.filter((x) => x.gpText && [1, 5, 6, 7].includes(x.id));

      case 8:
        return BLPUState.filter((x) => x.gpText && [4, 7].includes(x.id));

      case 9:
        return BLPUState.filter((x) => x.gpText && [1, 2, 3, 4, 5, 6, 7].includes(x.id));

      default:
        return BLPUState.filter((x) => x.gpText);
    }
  }
};

/**
 * Returns a list of LPI logical statuses depending on if the authority is Scottish or not.
 *
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @param {number} blpuLogicalStatus The BLPU logical status used to further filter the list of available LPI logical statuses.
 * @param {boolean} [isTemplate=false] If true only return values that are acceptable for creating a new record.
 * @return {array} The filtered list of LPI logical statuses.
 */
export const FilteredLPILogicalStatus = (isScottish, blpuLogicalStatus, isTemplate = false) => {
  if (isScottish) {
    return LPILogicalStatus.filter((x) => x.osText && (!isTemplate || ![7, 8, 9].includes(x.id)));
  } else {
    switch (blpuLogicalStatus) {
      case 1:
        return LPILogicalStatus.filter(
          (x) => x.gpText && (!isTemplate ? [1, 3, 5, 6, 7, 8, 9].includes(x.id) : [1, 3, 5, 6].includes(x.id))
        );

      case 5:
        return LPILogicalStatus.filter((x) => x.gpText && [5].includes(x.id));

      case 6:
        return LPILogicalStatus.filter((x) => x.gpText && (!isTemplate ? [6, 7, 8, 9].includes(x.id) : x.id === 6));

      case 7:
        return LPILogicalStatus.filter((x) => x.gpText && [7, 9].includes(x.id));

      case 8:
        return LPILogicalStatus.filter((x) => x.gpText && [7, 8, 9].includes(x.id));

      case 9:
        return LPILogicalStatus.filter((x) => x.gpText && [9].includes(x.id));

      default:
        return LPILogicalStatus.filter((x) => x.gpText && (!isTemplate || ![7, 8, 9].includes(x.id)));
    }
  }
};

/**
 * Returns the label for the given classification code.
 *
 * @param {string} classificationCode The classification code to use to determine the label that is required.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @param {boolean} [includeCode=true] If true include the classification code in the returned label; otherwise do not include the code.
 * @return {string} The classification label for the given code.
 */
export function GetClassificationLabel(classificationCode, isScottish, includeCode = true) {
  const classification = classificationCode
    ? isScottish
      ? OSGClassification.find((x) => x.id === classificationCode)
      : BLPUClassification.find((x) => x.id === classificationCode)
    : null;

  if (classification)
    return includeCode ? `${classificationCode} ${classification.display}` : `${classification.display}`;
  else return classificationCode;
}

/**
 * Returns the label for the given LPI logical status.
 *
 * @param {number} logicalStatus The logical status to use to determine the label that is required.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @return {string} The LPI logical status label for the given code.
 */
export function GetLPILogicalStatusLabel(logicalStatus, isScottish) {
  const lpiLogicalStatus = logicalStatus ? LPILogicalStatus.find((x) => x.id === logicalStatus) : null;

  if (lpiLogicalStatus) return `${logicalStatus.toString()} ${lpiLogicalStatus[GetLookupLabel(isScottish)]}`;
  else if (logicalStatus) return logicalStatus.toString();
  else return null;
}

/**
 * Returns the label for the given provenance code.
 *
 * @param {string} provenanceCode The BLPU provenance code to use to determine the label that is required.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @return {string} The provenance label for the given code.
 */
export function GetProvenanceLabel(provenanceCode, isScottish) {
  const provenance = provenanceCode ? BLPUProvenance.find((x) => x.id === provenanceCode) : null;

  if (provenance) return `${provenanceCode} ${provenance[GetLookupLabel(isScottish)]}`;
  else return provenanceCode;
}

/**
 *  Gets the temporary address for the given LPI record.
 *
 * @param {object} lpiRecord The LPI record for which we need the temporary address for.
 * @param {string} organisation The organisation, used for creating the return object.
 * @param {object} lookupContext The lookup context object
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @return {string} The temporary address from the supplied data.
 */
export async function GetTempAddress(lpiRecord, organisation, lookupContext, userToken, isScottish) {
  const postcode = lpiRecord.postcodeRef
    ? lookupContext.currentLookups.postcodes.find((x) => x.postcodeRef === lpiRecord.postcodeRef).postcode
    : "";

  const subLocality =
    isScottish && lpiRecord.subLocalityRef
      ? lookupContext.currentLookups.subLocalities.find((x) => x.subLocalityRef === lpiRecord.subLocalityRef)
          .subLocality
      : "";

  const postTown = lpiRecord.postTownRef
    ? lookupContext.currentLookups.postTowns.find((x) => x.postTownRef === lpiRecord.postTownRef).postTown
    : "";

  const addressData = isScottish
    ? {
        usrn: lpiRecord.usrn,
        language: lpiRecord.language,
        organisation: organisation,
        saonStartNum: lpiRecord.saoStartNumber,
        saonStartSuffix: lpiRecord.saoStartSuffix,
        saonEndNum: lpiRecord.saoEndNumber,
        saonEndSuffix: lpiRecord.saoEndSuffix,
        saonText: lpiRecord.saoText,
        paonStartNum: lpiRecord.paoStartNumber,
        paonStartSuffix: lpiRecord.paoStartSuffix,
        paonEndNum: lpiRecord.paoEndNumber,
        paonEndSuffix: lpiRecord.paoEndSuffix,
        paonText: lpiRecord.paoText,
        postTown: postTown,
        subLocality: subLocality,
        postcode: postcode,
        postallyAddressable: lpiRecord.postalAddress,
      }
    : {
        usrn: lpiRecord.usrn,
        language: lpiRecord.language,
        organisation: organisation,
        saonStartNum: lpiRecord.saoStartNumber,
        saonStartSuffix: lpiRecord.saoStartSuffix,
        saonEndNum: lpiRecord.saoEndNumber,
        saonEndSuffix: lpiRecord.saoEndSuffix,
        saonText: lpiRecord.saoText,
        paonStartNum: lpiRecord.paoStartNumber,
        paonStartSuffix: lpiRecord.paoStartSuffix,
        paonEndNum: lpiRecord.paoEndNumber,
        paonEndSuffix: lpiRecord.paoEndSuffix,
        paonText: lpiRecord.paoText,
        postTown: postTown,
        postcode: postcode,
        postallyAddressable: lpiRecord.postalAddress,
      };

  const tempAddressUrl = GetTempAddressUrl(userToken);

  if (tempAddressUrl) {
    const tempAddress = await fetch(`${tempAddressUrl.url}?AddressSeparator=%2C%20`, {
      headers: tempAddressUrl.headers,
      crossDomain: true,
      method: tempAddressUrl.type,
      body: JSON.stringify(addressData),
    })
      .then((res) => (res.ok ? res : Promise.reject(res)))
      .then((res) => res.text())
      .then(
        (tempAddress) => {
          return addressToTitleCase(tempAddress, addressData.postcode);
        },
        (error) => {
          console.error("[ERROR] Get temp address data", error);
          return "";
        }
      );

    return tempAddress;
  } else return "";
}

/**
 * Converts the address to title case.
 *
 * @param {string} address The address that needs to be converted to title case.
 * @param {string} postcode The postcode for the address.
 * @return {string} The address in title case.
 */
export function addressToTitleCase(address, postcode) {
  function isNumeric(char) {
    return /\d/.test(char);
  }

  if (address && address.length > 0) {
    if (address === "No records found" || address === "Search failed...") return address;
    else
      return (
        address
          .replace(postcode, "")
          .replace(/\w\S*/g, function (txt) {
            if (isNumeric(txt.charAt(0))) return txt.toUpperCase();
            else return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
          })
          .replaceAll(" And ", " and ")
          .replaceAll(" The ", " the ")
          .replaceAll(" Of ", " of ")
          .replaceAll(" To ", " to ") + (postcode && address.includes(postcode) ? postcode : "")
      );
  } else return null;
}

/**
 * Converts a formatted address to title case.
 *
 * @param {string} address The address that needs to be converted to title case.
 * @param {string} postcode The postcode for the address.
 * @return {string} The address in title case.
 */
export function formattedAddressToTitleCase(address, postcode) {
  let titleCaseAddress = addressToTitleCase(address, postcode);

  if (titleCaseAddress.includes("\r\n\r\n")) {
    titleCaseAddress = titleCaseAddress.replaceAll("\r\n\r\n", "\r\n");
  }
  if (titleCaseAddress.includes("\r\n")) {
    return titleCaseAddress.split("\r\n");
  } else return titleCaseAddress;
}

/**
 * Return a new property object
 *
 * @param {boolean} isWelsh True if the authority is a Welsh authority; otherwise false.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @param {number} authorityCode The DETR code for the authority.
 * @param {number} usrn The USRN the property is on.
 * @param {object|null} parent An object containing the parent information if the new property is a child record.
 * @param {number} easting The easting for the new property location.
 * @param {number} northing The northing for the new property location
 * @return {object} The new property object.
 */
export function GetNewProperty(isWelsh, isScottish, authorityCode, usrn, parent, easting, northing) {
  const currentDate = GetCurrentDate();

  if (isWelsh) {
    return {
      pkId: -10,
      changeType: "I",
      uprn: 0,
      blpuStateDate: null,
      xcoordinate: easting,
      ycoordinate: northing,
      rpc: parent ? parent.rpc : 4,
      startDate: currentDate,
      endDate: null,
      parentUprn: parent ? parent.uprn : null,
      neverExport: false,
      siteSurvey: false,
      logicalStatus: 6,
      blpuState: null,
      blpuClass: "U",
      localCustodianCode: authorityCode,
      organisation: null,
      wardCode: null,
      parishCode: null,
      relatedPropertyCount: 0,
      relatedStreetCount: 0,
      blpuAppCrossRefs: [],
      blpuProvenances: [],
      blpuNotes: [],
      lpis: [
        {
          pkId: -10,
          changeType: "I",
          uprn: 0,
          lpiKey: null,
          language: "ENG",
          startDate: currentDate,
          endDate: null,
          saoStartNumber: null,
          saoEndNumber: null,
          saoText: null,
          paoStartNumber: parent ? parent.eng.paoStartNumber : null,
          paoEndNumber: parent ? parent.eng.paoEndNumber : null,
          paoText: parent ? parent.eng.paoText : null,
          usrn: usrn,
          postcodeRef: parent ? parent.eng.postcodeRef : null,
          postTownRef: parent ? parent.eng.postTownRef : null,
          neverExport: false,
          address: parent ? parent.eng.address : null,
          postTown: parent ? parent.eng.postTown : null,
          postcode: parent ? parent.eng.postcode : null,
          logicalStatus: 6,
          paoStartSuffix: parent ? parent.eng.paoStartSuffix : null,
          paoEndSuffix: parent ? parent.eng.paoEndSuffix : null,
          saoStartSuffix: null,
          saoEndSuffix: null,
          level: null,
          postalAddress: null,
          officialFlag: null,
          dualLanguageLink: 1,
        },
        {
          pkId: -11,
          changeType: "I",
          uprn: 0,
          lpiKey: null,
          language: "CYM",
          startDate: currentDate,
          endDate: null,
          saoStartNumber: null,
          saoEndNumber: null,
          saoText: null,
          paoStartNumber: parent ? parent.cym.paoStartNumber : null,
          paoEndNumber: parent ? parent.cym.paoEndNumber : null,
          paoText: parent ? parent.cym.paoText : null,
          usrn: usrn,
          postcodeRef: parent ? parent.cym.postcodeRef : null,
          postTownRef: parent ? parent.cym.postTownRef : null,
          neverExport: false,
          address: parent ? parent.cym.address : null,
          postTown: parent ? parent.cym.postTown : null,
          postcode: parent ? parent.cym.postcode : null,
          logicalStatus: 6,
          paoStartSuffix: parent ? parent.cym.paoStartSuffix : null,
          paoEndSuffix: parent ? parent.cym.paoEndSuffix : null,
          saoStartSuffix: null,
          saoEndSuffix: null,
          level: null,
          postalAddress: null,
          officialFlag: null,
          dualLanguageLink: 1,
        },
      ],
    };
  } else if (isScottish && parent && parent.gae) {
    return {
      pkId: -10,
      changeType: "I",
      uprn: 0,
      blpuStateDate: null,
      xcoordinate: easting,
      ycoordinate: northing,
      rpc: parent ? parent.rpc : 4,
      startDate: currentDate,
      endDate: null,
      parentUprn: parent ? parent.uprn : null,
      neverExport: false,
      siteSurvey: false,
      logicalStatus: 6,
      blpuState: null,
      level: 0,
      custodianCode: authorityCode,
      relatedPropertyCount: 0,
      relatedStreetCount: 0,
      blpuAppCrossRefs: [],
      blpuProvenances: [],
      blpuNotes: [],
      organisations: [],
      classifications: [
        {
          pkId: -10,
          classKey: null,
          changeType: "I",
          uprn: 0,
          classificationScheme: OSGScheme,
          blpuClass: "U",
          startDate: currentDate,
          endDate: null,
        },
      ],
      lpis: [
        {
          pkId: -10,
          changeType: "I",
          uprn: 0,
          lpiKey: null,
          language: "ENG",
          startDate: currentDate,
          endDate: null,
          saoStartNumber: null,
          saoEndNumber: null,
          saoText: null,
          paoStartNumber: parent ? parent.eng.paoStartNumber : null,
          paoEndNumber: parent ? parent.eng.paoEndNumber : null,
          paoText: parent ? parent.eng.paoText : null,
          usrn: usrn,
          postcodeRef: parent ? parent.eng.postcodeRef : null,
          subLocalityRef: parent ? parent.eng.subLocalityRef : null,
          postTownRef: parent ? parent.eng.postTownRef : null,
          neverExport: false,
          address: parent ? parent.eng.address : null,
          postTown: parent ? parent.eng.postTown : null,
          subLocality: parent ? parent.eng.subLocality : null,
          postcode: parent ? parent.eng.postcode : null,
          logicalStatus: 6,
          paoStartSuffix: parent ? parent.eng.paoStartSuffix : null,
          paoEndSuffix: parent ? parent.eng.paoEndSuffix : null,
          saoStartSuffix: null,
          saoEndSuffix: null,
          level: null,
          postalAddress: null,
          officialFlag: null,
          dualLanguageLink: 1,
        },
        {
          pkId: -11,
          changeType: "I",
          uprn: 0,
          lpiKey: null,
          language: "GAE",
          startDate: currentDate,
          endDate: null,
          saoStartNumber: null,
          saoEndNumber: null,
          saoText: null,
          paoStartNumber: parent ? parent.gae.paoStartNumber : null,
          paoEndNumber: parent ? parent.gae.paoEndNumber : null,
          paoText: parent ? parent.gae.paoText : null,
          usrn: usrn,
          postcodeRef: parent ? parent.gae.postcodeRef : null,
          subLocalityRef: parent ? parent.gae.subLocalityRef : null,
          postTownRef: parent ? parent.gae.postTownRef : null,
          neverExport: false,
          address: parent ? parent.gae.address : null,
          postTown: parent ? parent.gae.postTown : null,
          subLocality: parent ? parent.gae.subLocality : null,
          postcode: parent ? parent.gae.postcode : null,
          logicalStatus: 6,
          paoStartSuffix: parent ? parent.gae.paoStartSuffix : null,
          paoEndSuffix: parent ? parent.gae.paoEndSuffix : null,
          saoStartSuffix: null,
          saoEndSuffix: null,
          level: null,
          postalAddress: null,
          officialFlag: null,
          dualLanguageLink: 1,
        },
      ],
    };
  } else if (isScottish) {
    return {
      pkId: -10,
      changeType: "I",
      uprn: 0,
      blpuStateDate: null,
      xcoordinate: easting,
      ycoordinate: northing,
      rpc: parent ? parent.rpc : 4,
      startDate: currentDate,
      endDate: null,
      parentUprn: parent ? parent.uprn : null,
      neverExport: false,
      siteSurvey: false,
      logicalStatus: 6,
      blpuState: null,
      level: 0,
      custodianCode: authorityCode,
      wardCode: null,
      parishCode: null,
      relatedPropertyCount: 0,
      relatedStreetCount: 0,
      blpuAppCrossRefs: [],
      blpuProvenances: [],
      blpuNotes: [],
      organisations: [],
      classifications: [
        {
          pkId: -10,
          classKey: null,
          changeType: "I",
          uprn: 0,
          classificationScheme: OSGScheme,
          blpuClass: "U",
          startDate: currentDate,
          endDate: null,
        },
      ],
      lpis: [
        {
          pkId: -10,
          changeType: "I",
          uprn: 0,
          lpiKey: null,
          language: "ENG",
          startDate: currentDate,
          endDate: null,
          saoStartNumber: null,
          saoEndNumber: null,
          saoText: null,
          paoStartNumber: parent ? parent.eng.paoStartNumber : null,
          paoEndNumber: parent ? parent.eng.paoEndNumber : null,
          paoText: parent ? parent.eng.paoText : null,
          usrn: usrn,
          postcodeRef: parent ? parent.eng.postcodeRef : null,
          subLocalityRef: parent ? parent.eng.subLocalityRef : null,
          postTownRef: parent ? parent.eng.postTownRef : null,
          neverExport: false,
          address: parent ? parent.eng.address : null,
          postTown: parent ? parent.eng.postTown : null,
          subLocality: parent ? parent.eng.subLocality : null,
          postcode: parent ? parent.eng.postcode : null,
          logicalStatus: 6,
          paoStartSuffix: parent ? parent.eng.paoStartSuffix : null,
          paoEndSuffix: parent ? parent.eng.paoEndSuffix : null,
          saoStartSuffix: null,
          saoEndSuffix: null,
          level: null,
          postalAddress: null,
          officialFlag: null,
          dualLanguageLink: 1,
        },
      ],
    };
  } else {
    return {
      pkId: -10,
      changeType: "I",
      uprn: 0,
      blpuStateDate: null,
      xcoordinate: easting,
      ycoordinate: northing,
      rpc: parent ? parent.rpc : 4,
      startDate: currentDate,
      endDate: null,
      parentUprn: parent ? parent.uprn : null,
      neverExport: false,
      siteSurvey: false,
      logicalStatus: 6,
      blpuState: null,
      blpuClass: "U",
      localCustodianCode: authorityCode,
      organisation: null,
      wardCode: null,
      parishCode: null,
      relatedPropertyCount: 0,
      relatedStreetCount: 0,
      blpuAppCrossRefs: [],
      blpuProvenances: [],
      blpuNotes: [],
      lpis: [
        {
          pkId: -10,
          changeType: "I",
          uprn: 0,
          lpiKey: null,
          language: "ENG",
          startDate: currentDate,
          endDate: null,
          saoStartNumber: null,
          saoEndNumber: null,
          saoText: null,
          paoStartNumber: parent ? parent.eng.paoStartNumber : null,
          paoEndNumber: parent ? parent.eng.paoEndNumber : null,
          paoText: parent ? parent.eng.paoText : null,
          usrn: usrn,
          postcodeRef: parent ? parent.eng.postcodeRef : null,
          postTownRef: parent ? parent.eng.postTownRef : null,
          neverExport: false,
          address: parent ? parent.eng.address : null,
          postTown: parent ? parent.eng.postTown : null,
          postcode: parent ? parent.eng.postcode : null,
          logicalStatus: 6,
          paoStartSuffix: parent ? parent.eng.paoStartSuffix : null,
          paoEndSuffix: parent ? parent.eng.paoEndSuffix : null,
          saoStartSuffix: null,
          saoEndSuffix: null,
          level: null,
          postalAddress: null,
          officialFlag: null,
          dualLanguageLink: 0,
        },
      ],
    };
  }
}

/**
 * Calls the API endpoint used to delete the given property.
 *
 * @param {number} uprn The UPRN of the property being deleted.
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {boolean} True if the property was deleted successfully; otherwise false.
 */
export async function PropertyDelete(uprn, userToken) {
  const deleteUrl = GetDeletePropertyUrl(userToken);

  if (deleteUrl) {
    return await fetch(`${deleteUrl.url}/${uprn}/false`, {
      headers: deleteUrl.headers,
      crossDomain: true,
      method: deleteUrl.type,
    })
      .then((res) => (res.ok ? res : Promise.reject(res)))
      .then((res) => res.json())
      .then((result) => {
        return true;
      })
      .catch((res) => {
        console.error("[ERROR] Deleting Property - response", res);
        return false;
      });
  } else return false;
}

/**
 * Return the full property object for a new street.
 *
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @param {object} currentProperty The current property data.
 * @param {array|null} lpiData The LPI data for the property.
 * @param {array|null} provenanceData The provenance data for the property.
 * @param {array|null} crossRefData The cross reference data for the property.
 * @param {array|null} classificationData The classification data for the property (OneScotland only).
 * @param {array|null} organisationData The organisation data for the property (OneScotland only).
 * @param {array|null} successorCrossRefData The successor cross reference data for the property (OneScotland only).
 * @param {array|null} noteData The note data for the property.
 * @return {object} The new new property object.
 */
export function GetNewPropertyData(
  isScottish,
  currentProperty,
  lpiData,
  provenanceData,
  crossRefData,
  classificationData,
  organisationData,
  successorCrossRefData,
  noteData
) {
  const newPropertyData = !isScottish
    ? {
        blpuStateDate: currentProperty.blpuStateDate,
        parentUprn: currentProperty.parentUprn,
        neverExport: currentProperty.neverExport,
        siteSurvey: currentProperty.siteSurvey,
        uprn: currentProperty.uprn,
        logicalStatus: currentProperty.logicalStatus,
        endDate: currentProperty.endDate,
        blpuState: currentProperty.blpuState,
        startDate: currentProperty.startDate,
        blpuClass: currentProperty.blpuClass,
        localCustodianCode: currentProperty.localCustodianCode,
        organisation: currentProperty.organisation,
        xcoordinate: currentProperty.xcoordinate,
        ycoordinate: currentProperty.ycoordinate,
        wardCode: currentProperty.wardCode,
        parishCode: currentProperty.parishCode,
        pkId: currentProperty.pkId,
        changeType: currentProperty.changeType,
        rpc: currentProperty.rpc,
        entryDate: currentProperty.entryDate,
        lastUpdateDate: currentProperty.lastUpdateDate,
        relatedPropertyCount: currentProperty.relatedPropertyCount,
        relatedStreetCount: currentProperty.relatedStreetCount,
        propertyLastUpdated: currentProperty.propertyLastUpdated,
        propertyLastUser: currentProperty.propertyLastUser,
        blpuAppCrossRefs: crossRefData,
        blpuProvenances: provenanceData,
        blpuNotes: noteData,
        lpis: lpiData,
      }
    : {
        blpuStateDate: currentProperty.blpuStateDate,
        parentUprn: currentProperty.parentUprn,
        neverExport: currentProperty.neverExport,
        siteSurvey: currentProperty.siteSurvey,
        uprn: currentProperty.uprn,
        logicalStatus: currentProperty.logicalStatus,
        endDate: currentProperty.endDate,
        startDate: currentProperty.startDate,
        blpuState: currentProperty.blpuState,
        custodianCode: currentProperty.custodianCode,
        level: currentProperty.level,
        xcoordinate: currentProperty.xcoordinate,
        ycoordinate: currentProperty.ycoordinate,
        pkId: currentProperty.pkId,
        changeType: currentProperty.changeType,
        rpc: currentProperty.rpc,
        entryDate: currentProperty.entryDate,
        lastUpdateDate: currentProperty.lastUpdateDate,
        relatedPropertyCount: currentProperty.relatedPropertyCount,
        relatedStreetCount: currentProperty.relatedStreetCount,
        propertyLastUpdated: currentProperty.propertyLastUpdated,
        propertyLastUser: currentProperty.propertyLastUser,
        blpuAppCrossRefs: crossRefData,
        blpuProvenances: provenanceData,
        successorCrossRefs: successorCrossRefData,
        organisations: organisationData,
        classifications: classificationData,
        blpuNotes: noteData,
        lpis: lpiData,
      };

  return newPropertyData;
}

/**
 * Method to return the bilingual cross reference source.
 *
 * @param {object} lookupContext The lookup context object.
 * @returns {number} The id for the bilingual source.
 */
export const getBilingualSource = (lookupContext) => {
  const rec = lookupContext.currentLookups.appCrossRefs.find((x) => x.xrefSourceRef === "BILG");

  return rec ? rec.pkId : null;
};

/**
 * Get the current property record object.
 *
 * @param {object} propertyData The property data.
 * @param {object} sandboxContext The sandbox context object.
 * @param {object} lookupContext The lookup context object.
 * @param {boolean} isWelsh True if the authority is a Welsh authority; otherwise false.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @return {object} The current property object.
 */
export function GetCurrentPropertyData(propertyData, sandboxContext, lookupContext, isWelsh, isScottish) {
  let lpiData = propertyData.lpis;
  if (sandboxContext.currentSandbox.currentPropertyRecords.lpi && isWelsh) {
    const secondLanguage = sandboxContext.currentSandbox.currentPropertyRecords.lpi.language === "ENG" ? "CYM" : "ENG";

    let secondLpi = null;
    secondLpi = propertyData.lpis.find(
      (x) =>
        x.dualLanguageLink === sandboxContext.currentSandbox.currentPropertyRecords.lpi.dualLanguageLink &&
        x.language === secondLanguage
    );
    if (!secondLpi) {
      const bilingualId = getBilingualSource(lookupContext);
      const linkXRef = propertyData.blpuProvenances.find(
        (x) =>
          x.source === bilingualId &&
          x.crossReference.includes(sandboxContext.currentSandbox.currentPropertyRecords.lpi.lpiKey)
      );
      secondLpi = propertyData.lpis.find(
        (x) =>
          x.lpiKey ===
          linkXRef.crossReference.replace(sandboxContext.currentSandbox.currentPropertyRecords.lpi.lpiKey, "")
      );
    }
    const secondPostTown = lookupContext.currentLookups.postTowns.find(
      (x) =>
        x.linkedRef === sandboxContext.currentSandbox.currentPropertyRecords.lpi.postTownRef &&
        x.language === secondLpi.language
    );

    const newSecondLpi = {
      language: secondLpi.language,
      startDate: sandboxContext.currentSandbox.currentPropertyRecords.lpi.startDate,
      endDate: sandboxContext.currentSandbox.currentPropertyRecords.lpi.endDate,
      saoStartNumber:
        secondLpi && secondLpi.saoStartNumber
          ? secondLpi.saoStartNumber
          : sandboxContext.currentSandbox.currentPropertyRecords.lpi.saoStartNumber,
      saoEndNumber:
        secondLpi && secondLpi.saoEndNumber
          ? secondLpi.saoEndNumber
          : sandboxContext.currentSandbox.currentPropertyRecords.lpi.saoEndNumber,
      saoText:
        secondLpi && secondLpi.saoText
          ? secondLpi.saoText
          : sandboxContext.currentSandbox.currentPropertyRecords.lpi.saoText,
      paoStartNumber:
        secondLpi && secondLpi.paoStartNumber
          ? secondLpi.paoStartNumber
          : sandboxContext.currentSandbox.currentPropertyRecords.lpi.paoStartNumber,
      paoEndNumber:
        secondLpi && secondLpi.paoEndNumber
          ? secondLpi.paoEndNumber
          : sandboxContext.currentSandbox.currentPropertyRecords.lpi.paoEndNumber,
      paoText:
        secondLpi && secondLpi.paoText
          ? secondLpi.paoText
          : sandboxContext.currentSandbox.currentPropertyRecords.lpi.paoText,
      usrn: sandboxContext.currentSandbox.currentPropertyRecords.lpi.usrn,
      postcodeRef: sandboxContext.currentSandbox.currentPropertyRecords.lpi.postcodeRef,
      postTownRef: secondPostTown ? secondPostTown.postTownRef : null,
      neverExport: sandboxContext.currentSandbox.currentPropertyRecords.lpi.neverExport,
      postTown: secondPostTown ? secondPostTown.postTown : null,
      postcode: sandboxContext.currentSandbox.currentPropertyRecords.lpi.postcode,
      dualLanguageLink: secondLpi.dualLanguageLink,
      uprn: secondLpi.uprn,
      logicalStatus: sandboxContext.currentSandbox.currentPropertyRecords.lpi.logicalStatus,
      paoStartSuffix:
        secondLpi && secondLpi.paoStartSuffix
          ? secondLpi.paoStartSuffix
          : sandboxContext.currentSandbox.currentPropertyRecords.lpi.paoStartSuffix,
      paoEndSuffix:
        secondLpi && secondLpi.paoEndSuffix
          ? secondLpi.paoEndSuffix
          : sandboxContext.currentSandbox.currentPropertyRecords.lpi.paoEndSuffix,
      saoStartSuffix:
        secondLpi && secondLpi.saoStartSuffix
          ? secondLpi.saoStartSuffix
          : sandboxContext.currentSandbox.currentPropertyRecords.lpi.saoStartSuffix,
      saoEndSuffix:
        secondLpi && secondLpi.saoEndSuffix
          ? secondLpi.saoEndSuffix
          : sandboxContext.currentSandbox.currentPropertyRecords.lpi.saoEndSuffix,
      level: sandboxContext.currentSandbox.currentPropertyRecords.lpi.level,
      postalAddress: sandboxContext.currentSandbox.currentPropertyRecords.lpi.postalAddress,
      officialFlag: sandboxContext.currentSandbox.currentPropertyRecords.lpi.officialFlag,
      pkId: secondLpi.pkId,
      changeType: secondLpi.changeType,
      lpiKey: secondLpi.lpiKey,
      address: secondLpi.address,
      entryDate: secondLpi.entryDate,
      lastUpdateDate: secondLpi.lastUpdateDate,
    };
    lpiData = propertyData.lpis.map(
      (x) =>
        [sandboxContext.currentSandbox.currentPropertyRecords.lpi].find((lpi) => lpi.pkId === x.pkId) ||
        [newSecondLpi].find((lpi) => lpi.pkId === x.pkId) ||
        x
    );
  } else {
    lpiData = sandboxContext.currentSandbox.currentPropertyRecords.lpi
      ? propertyData.lpis.map(
          (x) => [sandboxContext.currentSandbox.currentPropertyRecords.lpi].find((lpi) => lpi.pkId === x.pkId) || x
        )
      : propertyData.lpis;
  }

  const provenanceData = sandboxContext.currentSandbox.currentPropertyRecords.provenance
    ? propertyData.blpuProvenances.map(
        (x) =>
          [sandboxContext.currentSandbox.currentPropertyRecords.provenance].find(
            (provenance) => provenance.pkId === x.pkId
          ) || x
      )
    : propertyData.blpuProvenances;
  const crossRefData = sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef
    ? propertyData.blpuAppCrossRefs.map(
        (x) =>
          [sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef].find(
            (appCrossRef) => appCrossRef.pkId === x.pkId
          ) || x
      )
    : propertyData.blpuAppCrossRefs;
  const classificationData = sandboxContext.currentSandbox.currentPropertyRecords.classification
    ? propertyData.classifications.map(
        (x) =>
          [sandboxContext.currentSandbox.currentPropertyRecords.classification].find(
            (classification) => classification.pkId === x.pkId
          ) || x
      )
    : propertyData.classifications;
  const organisationData = sandboxContext.currentSandbox.currentPropertyRecords.organisation
    ? propertyData.organisations.map(
        (x) =>
          [sandboxContext.currentSandbox.currentPropertyRecords.organisation].find(
            (organisation) => organisation.pkId === x.pkId
          ) || x
      )
    : propertyData.organisations;
  const successorCrossRefData = sandboxContext.currentSandbox.currentPropertyRecords.successorCrossRef
    ? propertyData.successorCrossRefs.map(
        (x) =>
          [sandboxContext.currentSandbox.currentPropertyRecords.successorCrossRef].find(
            (successorCrossRef) => successorCrossRef.pkId === x.pkId
          ) || x
      )
    : propertyData.successorCrossRefs;
  const noteData = sandboxContext.currentSandbox.currentPropertyRecords.note
    ? propertyData.blpuNotes.map(
        (x) => [sandboxContext.currentSandbox.currentPropertyRecords.note].find((note) => note.pkId === x.pkId) || x
      )
    : propertyData.blpuNotes;
  const currentPropertyData = GetNewPropertyData(
    isScottish,
    propertyData,
    lpiData,
    provenanceData,
    crossRefData,
    classificationData,
    organisationData,
    successorCrossRefData,
    noteData
  );

  return currentPropertyData;
}

/**
 * Get the JSON object required to create a new property.
 *
 * @param {object} propertyData The property data to use to create the object.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @return {object} The create property object.
 */
export function GetPropertyCreateData(propertyData, isScottish) {
  if (isScottish)
    return {
      blpuStateDate: propertyData.blpuStateDate,
      parentUprn: propertyData.parentUprn,
      neverExport: propertyData.neverExport,
      siteSurvey: propertyData.siteSurvey,
      uprn: 0,
      logicalStatus: propertyData.logicalStatus,
      endDate: propertyData.endDate,
      startDate: propertyData.startDate,
      blpuState: propertyData.blpuState,
      custodianCode: propertyData.custodianCode,
      level: propertyData.level,
      xcoordinate: propertyData.xcoordinate ? propertyData.xcoordinate : 0,
      ycoordinate: propertyData.ycoordinate ? propertyData.ycoordinate : 0,
      changeType: "I",
      rpc: propertyData.rpc,
      blpuAppCrossRefs: propertyData.blpuAppCrossRefs
        ? propertyData.blpuAppCrossRefs.map((x) => {
            return {
              changeType: "I",
              uprn: 0,
              startDate: x.startDate,
              endDate: x.endDate,
              crossReference: x.crossReference,
              sourceId: x.sourceId ? x.sourceId : 0,
              source: x.source ? x.source : null,
              neverExport: x.neverExport,
            };
          })
        : [],
      blpuProvenances: propertyData.blpuProvenances
        ? propertyData.blpuProvenances.map((x) => {
            return {
              uprn: 0,
              changeType: "I",
              provenanceCode: x.provenanceCode,
              annotation: x.annotation,
              startDate: x.startDate,
              endDate: x.endDate,
              wktGeometry: x.wktGeometry,
            };
          })
        : [],
      blpuNotes: propertyData.blpuNotes
        ? propertyData.blpuNotes.map((x) => {
            return {
              uprn: 0,
              note: x.note,
              changeType: "I",
            };
          })
        : [],
      classifications: propertyData.classifications
        ? propertyData.classifications.map((x) => {
            return {
              changeType: "I",
              uprn: 0,
              classificationScheme: x.classificationScheme,
              blpuClass: x.blpuClass,
              startDate: x.startDate,
              endDate: x.endDate,
              neverExport: x.neverExport,
            };
          })
        : [],
      organisations: propertyData.organisations
        ? propertyData.organisations.map((x) => {
            return {
              changeType: "I",
              uprn: 0,
              organisation: x.organisation,
              legalName: x.legalName,
              startDate: x.startDate,
              endDate: x.endDate,
              neverExport: x.neverExport,
            };
          })
        : [],
      successorCrossRefs: propertyData.successorCrossRefs
        ? propertyData.successorCrossRefs.map((x) => {
            return {
              changeType: "I",
              predecessor: x.predecessor,
              startDate: x.startDate,
              endDate: x.endDate,
              successorType: x.successorType,
              successor: x.successor,
              neverExport: x.neverExport,
            };
          })
        : [],
      lpis: propertyData.lpis
        ? propertyData.lpis.map((x) => {
            return {
              language: x.language,
              startDate: x.startDate,
              endDate: x.endDate,
              saoStartNumber: x.saoStartNumber ? x.saoStartNumber : 0,
              saoEndNumber: x.saoEndNumber ? x.saoEndNumber : 0,
              saoText: x.saoText,
              paoStartNumber: x.paoStartNumber ? x.paoStartNumber : 0,
              paoEndNumber: x.paoEndNumber ? x.paoEndNumber : 0,
              paoText: x.paoText,
              usrn: x.usrn,
              postcodeRef: x.postcodeRef ? x.postcodeRef : -1,
              postTownRef: x.postTownRef ? x.postTownRef : -1,
              neverExport: x.neverExport,
              postTown: x.postTownRef ? x.postTown : "",
              postcode: x.postcodeRef ? x.postcode : "",
              dualLanguageLink: x.dualLanguageLink,
              uprn: 0,
              changeType: "I",
              logicalStatus: x.logicalStatus,
              paoStartSuffix: x.paoStartSuffix,
              paoEndSuffix: x.paoEndSuffix,
              saoStartSuffix: x.saoStartSuffix,
              saoEndSuffix: x.saoEndSuffix,
              subLocalityRef: x.subLocalityRef ? x.subLocalityRef : -1,
              subLocality: x.subLocality,
              postallyAddressable: x.postallyAddressable,
              officialFlag: x.officialFlag,
            };
          })
        : [],
    };
  else
    return {
      changeType: "I",
      blpuStateDate: propertyData.blpuStateDate,
      xcoordinate: propertyData.xcoordinate ? propertyData.xcoordinate : 0,
      ycoordinate: propertyData.ycoordinate ? propertyData.ycoordinate : 0,
      rpc: propertyData.rpc,
      startDate: propertyData.startDate,
      endDate: propertyData.endDate,
      parentUprn: propertyData.parentUprn,
      neverExport: propertyData.neverExport,
      siteSurvey: propertyData.siteSurvey,
      uprn: 0,
      logicalStatus: propertyData.logicalStatus,
      blpuState: propertyData.blpuState,
      blpuClass: propertyData.blpuClass,
      localCustodianCode: propertyData.localCustodianCode,
      organisation: propertyData.organisation,
      wardCode: propertyData.wardCode,
      parishCode: propertyData.parishCode,
      blpuAppCrossRefs: propertyData.blpuAppCrossRefs
        ? propertyData.blpuAppCrossRefs.map((x) => {
            return {
              changeType: "I",
              uprn: 0,
              startDate: x.startDate,
              endDate: x.endDate,
              crossReference: x.crossReference,
              sourceId: x.sourceId ? x.sourceId : 0,
              source: x.source ? x.source : null,
              neverExport: x.neverExport,
            };
          })
        : [],
      blpuProvenances: propertyData.blpuProvenances
        ? propertyData.blpuProvenances.map((x) => {
            return {
              changeType: "I",
              uprn: 0,
              provenanceCode: x.provenanceCode,
              annotation: x.annotation,
              startDate: x.startDate,
              endDate: x.endDate,
              wktGeometry: x.wktGeometry,
            };
          })
        : [],
      blpuNotes: propertyData.blpuNotes
        ? propertyData.blpuNotes.map((x) => {
            return {
              uprn: 0,
              note: x.note,
              changeType: "I",
            };
          })
        : [],
      lpis: propertyData.lpis
        ? propertyData.lpis.map((x) => {
            return {
              changeType: "I",
              language: x.language,
              startDate: x.startDate,
              endDate: x.endDate,
              saoStartNumber: x.saoStartNumber ? x.saoStartNumber : 0,
              saoEndNumber: x.saoEndNumber ? x.saoEndNumber : 0,
              saoText: x.saoText,
              paoStartNumber: x.paoStartNumber ? x.paoStartNumber : 0,
              paoEndNumber: x.paoEndNumber ? x.paoEndNumber : 0,
              paoText: x.paoText,
              usrn: x.usrn,
              postcodeRef: x.postcodeRef ? x.postcodeRef : -1,
              postTownRef: x.postTownRef ? x.postTownRef : -1,
              neverExport: x.neverExport,
              postTown: x.postTownRef ? x.postTown : "",
              postcode: x.postcodeRef ? x.postcode : "",
              dualLanguageLink: x.dualLanguageLink,
              uprn: 0,
              logicalStatus: x.logicalStatus,
              paoStartSuffix: x.paoStartSuffix,
              paoEndSuffix: x.paoEndSuffix,
              saoStartSuffix: x.saoStartSuffix,
              saoEndSuffix: x.saoEndSuffix,
              level: x.level,
              postalAddress: x.postalAddress,
              officialFlag: x.officialFlag,
            };
          })
        : [],
    };
}

/**
 * Get the JSON object required to update an existing property.
 *
 * @param {object} propertyData The property data to use to create the object.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @return {object} The update property object.
 */
export function GetPropertyUpdateData(propertyData, isScottish) {
  if (isScottish)
    return {
      blpuStateDate: propertyData.blpuStateDate,
      parentUprn: propertyData.parentUprn,
      neverExport: propertyData.neverExport,
      siteSurvey: propertyData.siteSurvey,
      uprn: propertyData.uprn,
      logicalStatus: propertyData.logicalStatus,
      endDate: propertyData.endDate,
      startDate: propertyData.startDate,
      blpuState: propertyData.blpuState,
      custodianCode: propertyData.custodianCode,
      level: propertyData.level,
      xcoordinate: propertyData.xcoordinate ? propertyData.xcoordinate : 0,
      ycoordinate: propertyData.ycoordinate ? propertyData.ycoordinate : 0,
      pkId: propertyData.pkId,
      changeType: propertyData.changeType,
      rpc: propertyData.rpc,
      blpuAppCrossRefs: propertyData.blpuAppCrossRefs
        ? propertyData.blpuAppCrossRefs.map((x) => {
            return {
              pkId: x.pkId > 0 ? x.pkId : 0,
              xrefKey: x.xrefKey,
              changeType: x.changeType,
              uprn: propertyData.uprn,
              startDate: x.startDate,
              endDate: x.endDate,
              crossReference: x.crossReference,
              sourceId: x.sourceId ? x.sourceId : 0,
              source: x.source ? x.source : null,
              neverExport: x.neverExport,
            };
          })
        : [],
      blpuProvenances: propertyData.blpuProvenances
        ? propertyData.blpuProvenances.map((x) => {
            return {
              pkId: x.pkId > 0 ? x.pkId : 0,
              provenanceKey: x.provenanceKey,
              uprn: propertyData.uprn,
              changeType: x.changeType,
              provenanceCode: x.provenanceCode,
              annotation: x.annotation,
              startDate: x.startDate,
              endDate: x.endDate,
              neverExport: x.neverExport,
              wktGeometry: x.wktGeometry,
            };
          })
        : [],
      blpuNotes: propertyData.blpuNotes
        ? propertyData.blpuNotes.map((x) => {
            return {
              pkId: x.pkId > 0 ? x.pkId : 0,
              seqNo: x.seqNo,
              uprn: propertyData.uprn,
              note: x.note,
              changeType: x.changeType,
            };
          })
        : [],
      classifications: propertyData.classifications
        ? propertyData.classifications.map((x) => {
            return {
              pkId: x.pkId > 0 ? x.pkId : 0,
              classKey: x.classKey,
              changeType: x.changeType,
              uprn: propertyData.uprn,
              classificationScheme: x.classificationScheme,
              blpuClass: x.blpuClass,
              startDate: x.startDate,
              endDate: x.endDate,
              neverExport: x.neverExport,
            };
          })
        : [],
      organisations: propertyData.organisations
        ? propertyData.organisations.map((x) => {
            return {
              pkId: x.pkId > 0 ? x.pkId : 0,
              orgKey: x.orgKey,
              changeType: x.changeType,
              uprn: propertyData.uprn,
              organisation: x.organisation,
              legalName: x.legalName,
              startDate: x.startDate,
              endDate: x.endDate,
              neverExport: x.neverExport,
            };
          })
        : [],
      successorCrossRefs: propertyData.successorCrossRefs
        ? propertyData.successorCrossRefs.map((x) => {
            return {
              pkId: x.pkId > 0 ? x.pkId : 0,
              changeType: x.changeType,
              predecessor: x.predecessor,
              succKey: x.succKey,
              startDate: x.startDate,
              endDate: x.endDate,
              successorType: x.successorType,
              successor: x.successor,
              neverExport: x.neverExport,
            };
          })
        : [],
      lpis: propertyData.lpis
        ? propertyData.lpis.map((x) => {
            return {
              language: x.language,
              startDate: x.startDate,
              endDate: x.endDate,
              saoStartNumber: x.saoStartNumber ? x.saoStartNumber : 0,
              saoEndNumber: x.saoEndNumber ? x.saoEndNumber : 0,
              saoText: x.saoText,
              paoStartNumber: x.paoStartNumber ? x.paoStartNumber : 0,
              paoEndNumber: x.paoEndNumber ? x.paoEndNumber : 0,
              paoText: x.paoText,
              usrn: x.usrn,
              postcodeRef: x.postcodeRef ? x.postcodeRef : -1,
              postTownRef: x.postTownRef ? x.postTownRef : -1,
              neverExport: x.neverExport,
              postTown: x.postTownRef ? x.postTown : "",
              postcode: x.postcodeRef ? x.postcode : "",
              dualLanguageLink: x.dualLanguageLink,
              uprn: propertyData.uprn,
              logicalStatus: x.logicalStatus,
              paoStartSuffix: x.paoStartSuffix,
              paoEndSuffix: x.paoEndSuffix,
              saoStartSuffix: x.saoStartSuffix,
              saoEndSuffix: x.saoEndSuffix,
              subLocalityRef: x.subLocalityRef ? x.subLocalityRef : -1,
              subLocality: x.subLocality,
              postallyAddressable: x.postallyAddressable,
              officialFlag: x.officialFlag,
              pkId: x.pkId > 0 ? x.pkId : 0,
              changeType: x.changeType,
              lpiKey: x.lpiKey,
              address: x.address, // TODO: remove once it has been removed from the API [IMANN-240]
              entryDate: x.entryDate, // TODO: remove once it has been removed from the API [IMANN-240]
              lastUpdateDate: x.lastUpdateDate, // TODO: remove once it has been removed from the API [IMANN-240]
            };
          })
        : [],
    };
  else
    return {
      changeType: propertyData.changeType,
      blpuStateDate: propertyData.blpuStateDate,
      rpc: propertyData.rpc,
      startDate: propertyData.startDate,
      endDate: propertyData.endDate,
      parentUprn: propertyData.parentUprn,
      neverExport: propertyData.neverExport,
      siteSurvey: propertyData.siteSurvey,
      uprn: propertyData.uprn,
      logicalStatus: propertyData.logicalStatus,
      blpuState: propertyData.blpuState,
      blpuClass: propertyData.blpuClass,
      localCustodianCode: propertyData.localCustodianCode,
      organisation: propertyData.organisation,
      xcoordinate: propertyData.xcoordinate ? propertyData.xcoordinate : 0,
      ycoordinate: propertyData.ycoordinate ? propertyData.ycoordinate : 0,
      wardCode: propertyData.wardCode,
      parishCode: propertyData.parishCode,
      pkId: propertyData.pkId,
      blpuAppCrossRefs: propertyData.blpuAppCrossRefs
        ? propertyData.blpuAppCrossRefs.map((x) => {
            return {
              changeType: x.changeType,
              uprn: propertyData.uprn,
              startDate: x.startDate,
              endDate: x.endDate,
              crossReference: x.crossReference,
              sourceId: x.sourceId ? x.sourceId : 0,
              source: x.source ? x.source : null,
              neverExport: x.neverExport,
              pkId: x.pkId > 0 ? x.pkId : 0,
              xrefKey: x.xrefKey,
            };
          })
        : [],
      blpuProvenances: propertyData.blpuProvenances
        ? propertyData.blpuProvenances.map((x) => {
            return {
              uprn: propertyData.uprn,
              changeType: x.changeType,
              provenanceCode: x.provenanceCode,
              annotation: x.annotation,
              startDate: x.startDate,
              endDate: x.endDate,
              wktGeometry: x.wktGeometry,
              pkId: x.pkId > 0 ? x.pkId : 0,
              provenanceKey: x.provenanceKey,
            };
          })
        : [],
      blpuNotes: propertyData.blpuNotes
        ? propertyData.blpuNotes.map((x) => {
            return {
              uprn: propertyData.uprn,
              note: x.note,
              changeType: x.changeType,
              pkId: x.pkId > 0 ? x.pkId : 0,
              seqNo: x.seqNo,
            };
          })
        : [],
      lpis: propertyData.lpis
        ? propertyData.lpis.map((x) => {
            return {
              changeType: x.changeType,
              language: x.language,
              startDate: x.startDate,
              endDate: x.endDate,
              saoStartNumber: x.saoStartNumber ? x.saoStartNumber : 0,
              saoEndNumber: x.saoEndNumber ? x.saoEndNumber : 0,
              saoText: x.saoText,
              paoStartNumber: x.paoStartNumber ? x.paoStartNumber : 0,
              paoEndNumber: x.paoEndNumber ? x.paoEndNumber : 0,
              paoText: x.paoText,
              usrn: x.usrn,
              postcodeRef: x.postcodeRef ? x.postcodeRef : -1,
              postTownRef: x.postTownRef ? x.postTownRef : -1,
              neverExport: x.neverExport,
              postTown: x.postTownRef ? x.postTown : "",
              postcode: x.postcodeRef ? x.postcode : "",
              dualLanguageLink: x.dualLanguageLink,
              uprn: propertyData.uprn,
              logicalStatus: x.logicalStatus,
              paoStartSuffix: x.paoStartSuffix,
              paoEndSuffix: x.paoEndSuffix,
              saoStartSuffix: x.saoStartSuffix,
              saoEndSuffix: x.saoEndSuffix,
              level: x.level,
              postalAddress: x.postalAddress,
              officialFlag: x.officialFlag,
              pkId: x.pkId > 0 ? x.pkId : 0,
              lpiKey: x.lpiKey,
            };
          })
        : [],
    };
}

/**
 * Extract any errors returned from a call to the API.
 *
 * @param {object} body The body of the returned data from the API call, which should contain any errors.
 * @param {boolean} newProperty If true then this we were trying to create a new property; otherwise we were trying to update an existing property.
 * @return {object} The validation error object.
 */
export function GetPropertyValidationErrors(body, newProperty) {
  let errorBlpu = [];
  let errorLpi = [];
  let errorProvenance = [];
  let errorCrossRef = [];
  let errorClassification = [];
  let errorOrganisation = [];
  let errorSuccessorCrossRef = [];
  let errorNote = [];

  for (const [key, value] of Object.entries(body.errors)) {
    if (!key.includes(".")) {
      errorBlpu.push({ field: key, errors: value });
    } else {
      if (key.toLowerCase().includes("lpis[") || key.toLowerCase().includes("lpi[")) {
        errorLpi.push({
          index: Number(key.substring(key.indexOf("[") + 1, key.indexOf("]"))),
          field: key.substring(key.indexOf(".") + 1),
          errors: value,
        });
      } else if (key.toLowerCase().includes("blpuprovenances[")) {
        errorProvenance.push({
          index: Number(key.substring(key.indexOf("[") + 1, key.indexOf("]"))),
          field: key.substring(key.indexOf(".") + 1),
          errors: value,
        });
      } else if (key.toLowerCase().includes("blpuappcrossrefs[")) {
        errorCrossRef.push({
          index: Number(key.substring(key.indexOf("[") + 1, key.indexOf("]"))),
          field: key.substring(key.indexOf(".") + 1),
          errors: value,
        });
      } else if (key.toLowerCase().includes("classifications[")) {
        errorClassification.push({
          index: Number(key.substring(key.indexOf("[") + 1, key.indexOf("]"))),
          field: key.substring(key.indexOf(".") + 1),
          errors: value,
        });
      } else if (key.toLowerCase().includes("organisations[")) {
        errorOrganisation.push({
          index: Number(key.substring(key.indexOf("[") + 1, key.indexOf("]"))),
          field: key.substring(key.indexOf(".") + 1),
          errors: value,
        });
      } else if (key.toLowerCase().includes("successorcrossreferences[")) {
        errorSuccessorCrossRef.push({
          index: Number(key.substring(key.indexOf("[") + 1, key.indexOf("]"))),
          field: key.substring(key.indexOf(".") + 1),
          errors: value,
        });
      } else if (key.toLowerCase().includes("blpunotes[")) {
        errorNote.push({
          index: Number(key.substring(key.indexOf("[") + 1, key.indexOf("]"))),
          field: key.substring(key.indexOf(".") + 1),
          errors: value,
        });
      }
    }
  }

  if (errorBlpu.length > 0) {
    // if (process.env.NODE_ENV === "development")
    console.error(`[400 ERROR] ${newProperty ? "Creating" : "Updating"} Property - BLPU`, errorBlpu);
  }
  if (errorLpi.length > 0) {
    // if (process.env.NODE_ENV === "development")
    console.error(`[400 ERROR] ${newProperty ? "Creating" : "Updating"} Property - LPI`, errorLpi);
  }
  if (errorProvenance.length > 0) {
    // if (process.env.NODE_ENV === "development")
    console.error(`[400 ERROR] ${newProperty ? "Creating" : "Updating"} Property - Provenance`, errorProvenance);
  }
  if (errorCrossRef.length > 0) {
    // if (process.env.NODE_ENV === "development")
    console.error(`[400 ERROR] ${newProperty ? "Creating" : "Updating"} Property - Cross Ref`, errorCrossRef);
  }
  if (errorClassification.length > 0) {
    // if (process.env.NODE_ENV === "development")
    console.error(
      `[400 ERROR] ${newProperty ? "Creating" : "Updating"} Property - Classification`,
      errorClassification
    );
  }
  if (errorOrganisation.length > 0) {
    // if (process.env.NODE_ENV === "development")
    console.error(`[400 ERROR] ${newProperty ? "Creating" : "Updating"} Property - Organisation`, errorOrganisation);
  }
  if (errorSuccessorCrossRef.length > 0) {
    // if (process.env.NODE_ENV === "development")
    console.error(
      `[400 ERROR] ${newProperty ? "Creating" : "Updating"} Property - Successor cross reference`,
      errorSuccessorCrossRef
    );
  }
  if (errorNote.length > 0) {
    // if (process.env.NODE_ENV === "development")
    console.error(`[400 ERROR] ${newProperty ? "Creating" : "Updating"} Property - Note`, errorNote);
  }

  return {
    blpu: errorBlpu,
    lpi: errorLpi,
    provenance: errorProvenance,
    crossRef: errorCrossRef,
    classification: errorClassification,
    organisation: errorOrganisation,
    successorCrossRef: errorSuccessorCrossRef,
    note: errorNote,
  };
}

/**
 * Return the property record for use within the map.
 *
 * @param {number} uprn The UPRN of the street we are interested in.
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @return {object} The property map object.
 */
export async function GetPropertyMapData(uprn, userToken) {
  const propertyUrl = GetPropertyFromUPRNUrl(userToken);

  if (propertyUrl && uprn) {
    const returnValue = await fetch(`${propertyUrl.url}/${uprn}`, {
      headers: propertyUrl.headers,
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
          console.error("[ERROR] Get Property data", error);
          return null;
        }
      );

    return returnValue;
  } else return null;
}

/**
 * Save any changes for the given property.
 *
 * @param {object} currentProperty The current property data.
 * @param {boolean} newProperty True if this is a new property; otherwise false.
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @param {object} propertyContext The sandbox property object.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @return {object|null} If the save was successful the updated property; otherwise null.
 */
export async function SaveProperty(currentProperty, newProperty, userToken, propertyContext, isScottish) {
  propertyContext.resetPropertyErrors();

  const saveUrl = newProperty ? GetCreatePropertyUrl(userToken) : GetUpdatePropertyUrl(userToken);
  const saveData = newProperty
    ? GetPropertyCreateData(currentProperty, isScottish)
    : GetPropertyUpdateData(currentProperty, isScottish);

  // if (process.env.NODE_ENV === "development")
  console.log("[DEBUG] SaveProperty", saveUrl, JSON.stringify(saveData));

  if (saveUrl) {
    const saveResult = await fetch(saveUrl.url, {
      headers: saveUrl.headers,
      crossDomain: true,
      method: saveUrl.type,
      body: JSON.stringify(saveData),
    })
      .then((res) => (res.ok ? res : Promise.reject(res)))
      .then((res) => res.json())
      .then((result) => {
        return result;
      })
      .catch((res) => {
        switch (res.status) {
          case 400:
            res.json().then((body) => {
              console.error(`[400 ERROR] ${newProperty ? "Creating" : "Updating"} property`, body.errors);
              const propertyErrors = GetPropertyValidationErrors(body, newProperty);

              propertyContext.onPropertyErrors(
                propertyErrors.blpu,
                propertyErrors.lpi,
                propertyErrors.provenance,
                propertyErrors.crossRef,
                propertyErrors.classification,
                propertyErrors.organisation,
                propertyErrors.successorCrossRef,
                propertyErrors.note,
                currentProperty.pkId
              );
            });
            break;

          case 401:
            res.json().then((body) => {
              console.error(`[401 ERROR] ${newProperty ? "Creating" : "Updating"} property`, body);
            });
            break;

          default:
            const contentType = res.headers.get("content-type");
            console.error("[SF] SaveProperty - Failed", {
              res: res,
              contentType: contentType,
            });
            if (contentType && contentType.indexOf("application/json") !== -1) {
              res.json().then((body) => {
                console.error(`[${res.status} ERROR] ${newProperty ? "Creating" : "Updating"} property.`, body);

                propertyContext.onPropertyErrors(
                  [
                    {
                      field: "UPRN",
                      errors: [
                        `[${res.status}] ${body[0].errorTitle}: ${body[0].errorDescription}. Please report this error to support.`,
                      ],
                    },
                  ],
                  [],
                  [],
                  [],
                  [],
                  [],
                  [],
                  [],
                  currentProperty.pkId
                );
              });
            } else if (contentType && contentType.indexOf("text")) {
              res.text().then((response) => {
                console.error(
                  `[${res.status} ERROR] ${newProperty ? "Creating" : "Updating"} property.`,
                  response,
                  res
                );

                const responseData = response.replace("[{", "").replace("}]", "").split(',"');

                let errorTitle = "";
                let errorDescription = "";

                for (const errorData of responseData) {
                  if (errorData.includes("errorTitle")) errorTitle = errorData.substr(13).replace('"', "");
                  else if (errorData.includes("errorDescription"))
                    errorDescription = errorData.substr(19).replace('"', "");

                  if (errorTitle && errorTitle.length > 0 && errorDescription && errorDescription.length > 0) break;
                }

                // if (process.env.NODE_ENV === "development")
                propertyContext.onPropertyErrors(
                  [
                    {
                      field: "UPRN",
                      errors: [
                        `[${res.status}] ${errorTitle}: ${errorDescription}. Please report this error to support.`,
                      ],
                    },
                  ],
                  [],
                  [],
                  [],
                  [],
                  [],
                  [],
                  [],
                  currentProperty.pkId
                );
              });
            } else {
              console.error(`[${res.status} ERROR] ${newProperty ? "Creating" : "Updating"} property (other)`, res);
            }
            break;
        }

        return null;
      });

    return saveResult;
  }

  return null;
}

/**
 * Get the name of a street from the supplied USRN.
 *
 * @param {number} usrn The USRN of the street from which we want the name.
 * @param {object} lookupContext The lookup context object.
 * @return {string|null} The name of the given street.
 */
const getStreetName = (usrn, lookupContext) => {
  const street = lookupContext.currentLookups.streetDescriptors.filter((x) => x.language === "ENG" && x.usrn === usrn);

  if (street) return street[0].address;
  else return null;
};

/**
 * Updates everything after saving a property.
 *
 * @param {object} result The results from the save.
 * @param {object} lookupContext The lookup context object.
 * @param {object} mapContext The map context object.
 * @param {object} propertyContext The property context object.
 * @param {object} sandboxContext The sandbox context object.
 * @param {boolean} isWelsh True if the authority is a Welsh authority; otherwise false.
 * @param {object} searchContext The search context object.
 */
export async function UpdateAfterSave(
  result,
  lookupContext,
  mapContext,
  propertyContext,
  sandboxContext,
  isWelsh,
  searchContext
) {
  if (!result) return;

  mapContext.onSetCoordinate(null);
  propertyContext.onPropertyModified(false);
  propertyContext.resetPropertyErrors();
  sandboxContext.resetSandbox("property");

  const searchAddresses = [];
  let newSearchData = [];
  const returnedLpis =
    result && result.lpis
      ? isWelsh
        ? result.lpis.sort((a, b) => (a.language > b.language ? 1 : b.language > a.language ? -1 : 0)).reverse()
        : result.lpis.sort((a, b) => (a.language > b.language ? 1 : b.language > a.language ? -1 : 0))
      : null;

  if (returnedLpis) {
    for (const lpi of returnedLpis) {
      if (!searchAddresses.includes(lpi.address)) {
        searchAddresses.push(lpi.address);
        const newData = {
          type: 24,
          id: lpi.lpiKey,
          uprn: lpi.uprn,
          usrn: lpi.usrn,
          logical_status: lpi.logicalStatus,
          language: lpi.language,
          classification_code: getClassificationCode(result),
          isParent: result.parentUprn ? true : false,
          parent_uprn: result.parentUprn,
          county: null,
          authority: result.localCustodianCode,
          longitude: null,
          latitude: null,
          easting: result.xcoordinate,
          northing: result.ycoordinate,
          full_building_desc: null,
          formattedaddress: lpi.address,
          organisation: result.organisation,
          secondary_name: null,
          sao_text: lpi.saoText,
          sao_nums: null,
          primary_name: null,
          pao_text: lpi.paoText,
          pao_nums: null,
          street: getStreetName(lpi.usrn, lookupContext),
          locality: null,
          town: null,
          post_town: lpi.postTown,
          postcode: lpi.postcode,
          crossref: null,
          address: lpi.address.replaceAll("\r\n", " "),
          sort_code: 0,
        };

        if (searchContext.currentSearchData.results && searchContext.currentSearchData.results.length > 0) {
          const i = searchContext.currentSearchData.results.findIndex((x) => x.id === lpi.lpiKey);
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
  }

  if (searchContext.currentSearchData.results && searchContext.currentSearchData.results.length > 0) {
    const addressesOnUPRN = searchContext.currentSearchData.results.filter((x) => x.uprn === result.uprn);

    if (addressesOnUPRN.length > searchAddresses.length) {
      const currentLpiKeys = result.lpis.map((x) => x.lpiKey);

      const fixedSearchData = newSearchData.filter((x) => x.uprn !== result.uprn || currentLpiKeys.includes(x.id));

      searchContext.onSearchDataChange(searchContext.currentSearchData.searchString, fixedSearchData);
    }
  }

  const engLpi = result.lpis
    .filter((x) => x.language === "ENG")
    .sort(function (a, b) {
      return a.logicalStatus - b.logicalStatus;
    });

  propertyContext.onPropertyChange(
    result.uprn,
    result.usrn,
    engLpi[0].address.replaceAll("\r\n", " "),
    engLpi[0].address,
    engLpi[0].postcode,
    result.xcoordinate,
    result.ycoordinate,
    false,
    null
  );

  const currentSearchProperties = [
    {
      uprn: `${result.uprn}`,
      address: engLpi[0].address.replaceAll("\r\n", " "),
      formattedAddress: engLpi[0].address,
      postcode: engLpi[0].postcode,
      easting: result.xcoordinate,
      northing: result.ycoordinate,
      logicalStatus: result.logicalStatus,
      classificationCode: getClassificationCode(result),
    },
  ];

  mapContext.onSearchDataChange([], currentSearchProperties, null, result.uprn);
}

/**
 * Updates everything after creating a range of properties.
 *
 * @param {array} properties The array of properties that were created.
 * @param {object} lookupContext The lookup context object.
 * @param {object} mapContext The map context object.
 * @param {object} propertyContext The property context object.
 * @param {object} sandboxContext The sandbox context object.
 * @param {boolean} isWelsh True if the authority is a Welsh authority; otherwise false.
 * @param {object} searchContext The search context object.
 */
export async function UpdateRangeAfterSave(
  properties,
  lookupContext,
  mapContext,
  propertyContext,
  sandboxContext,
  isWelsh,
  searchContext
) {
  if (!properties || properties.length === 0) return;

  mapContext.onSetCoordinate(null);
  propertyContext.onPropertyModified(false);
  propertyContext.resetPropertyErrors();
  sandboxContext.resetSandbox("property");

  const searchAddresses = [];
  let newSearchData = JSON.parse(JSON.stringify(searchContext.currentSearchData.results));

  for (const property of properties) {
    const returnedLpis =
      property && property.lpis
        ? isWelsh
          ? property.lpis.sort((a, b) => (a.language > b.language ? 1 : b.language > a.language ? -1 : 0)).reverse()
          : property.lpis.sort((a, b) => (a.language > b.language ? 1 : b.language > a.language ? -1 : 0))
        : null;

    if (returnedLpis) {
      for (const lpi of returnedLpis) {
        if (!searchAddresses.includes(lpi.address)) {
          searchAddresses.push(lpi.address);
          const newData = {
            type: 24,
            id: lpi.lpiKey,
            uprn: `${lpi.uprn}`,
            usrn: lpi.usrn,
            logical_status: lpi.logicalStatus,
            language: lpi.language,
            classification_code: getClassificationCode(property),
            isParent: property.parentUprn ? true : false,
            parent_uprn: property.parentUprn,
            county: null,
            authority: property.localCustodianCode,
            longitude: null,
            latitude: null,
            easting: property.xcoordinate,
            northing: property.ycoordinate,
            full_building_desc: null,
            formattedaddress: lpi.address,
            organisation: property.organisation,
            secondary_name: null,
            sao_text: lpi.saoText,
            sao_nums: null,
            primary_name: null,
            pao_text: lpi.paoText,
            pao_nums: null,
            street: getStreetName(lpi.usrn, lookupContext),
            locality: null,
            town: null,
            post_town: lpi.postTown,
            postcode: lpi.postcode,
            crossref: null,
            address: lpi.address.replaceAll("\r\n", " "),
            sort_code: 0,
          };

          const i =
            newSearchData && newSearchData.length > 0 ? newSearchData.findIndex((x) => x.id === lpi.lpiKey) : -1;
          if (i > -1) {
            newSearchData = newSearchData.map((x) => [newData].find((rec) => rec.id === x.id) || x);
          } else {
            newSearchData.push(newData);
          }
        }
      }
    }
  }

  if (newSearchData) searchContext.onSearchDataChange(searchContext.currentSearchData.searchString, newSearchData);

  const addressesOnUPRN = searchContext.currentSearchData.results.filter((x) => x.uprn === properties.uprn);

  if (addressesOnUPRN.length > searchAddresses.length) {
    const currentLpiKeys = properties.lpis.map((x) => x.lpiKey);

    const fixedSearchData = newSearchData.filter((x) => x.uprn !== properties.uprn || currentLpiKeys.includes(x.id));

    searchContext.onSearchDataChange(searchContext.currentSearchData.searchString, fixedSearchData);
  }

  let newMapSearchProperties = JSON.parse(JSON.stringify(mapContext.currentSearchData.properties));

  for (const property of properties) {
    const engLpi = property.lpis
      .filter((x) => x.language === "ENG")
      .sort(function (a, b) {
        return a.logicalStatus - b.logicalStatus;
      });

    const currentSearchProperty = {
      uprn: `${property.uprn}`,
      address: engLpi[0].address.replaceAll("\r\n", " "),
      formattedAddress: engLpi[0].address,
      postcode: engLpi[0].postcode,
      easting: property.xcoordinate,
      northing: property.ycoordinate,
      logicalStatus: property.logicalStatus,
      classificationCode: getClassificationCode(property),
    };

    const i = newMapSearchProperties.findIndex((x) => x.uprn === property.uprn);
    if (i > -1) {
      newMapSearchProperties = newMapSearchProperties.map(
        (x) => [currentSearchProperty].find((rec) => rec.uprn === x.uprn) || x
      );
    } else {
      newMapSearchProperties.push(currentSearchProperty);
    }
  }

  if (newMapSearchProperties)
    mapContext.onSearchDataChange(mapContext.currentSearchData.streets, newMapSearchProperties, null, null);
}

/**
 * Save a property and then update everything after saving.
 *
 * @param {object} currentProperty The current property data.
 * @param {boolean} newProperty True if this is a new property; otherwise false.
 * @param {object} propertyContext The property context object.
 * @param {string} userToken The token for the user who is calling the endpoint.
 * @param {object} lookupContext The lookup context object.
 * @param {object} searchContext The search context object.
 * @param {object} mapContext The map context object.
 * @param {object} sandboxContext The sandbox context object.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @param {boolean} isWelsh True if the authority is a Welsh authority; otherwise false.
 * @return {object} If the save was successful the updated property; otherwise null.
 */
export async function SavePropertyAndUpdate(
  currentProperty,
  newProperty,
  propertyContext,
  userToken,
  lookupContext,
  searchContext,
  mapContext,
  sandboxContext,
  isScottish,
  isWelsh
) {
  const propertySaved = await SaveProperty(currentProperty, newProperty, userToken, propertyContext, isScottish).then(
    (result) => {
      UpdateAfterSave(result, lookupContext, mapContext, propertyContext, sandboxContext, isWelsh, searchContext);
      return result;
    }
  );

  return propertySaved;
}

/**
 * Method to get the BLPU logical status description.
 *
 * @param {number} value The BLPU logical status.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @returns {string|null} The description to display for the BLPU logical status.
 */
export const getBlpuStatus = (value, isScottish) => {
  const rec = BLPULogicalStatus.find((x) => x.id === value);

  if (rec) {
    if (isScottish) return rec.osText;
    else return rec.gpText;
  } else return null;
};

/**
 * Method to get the BLPU RPC description.
 *
 * @param {number} value The BLPU RPC.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @returns {string|null} The description to display for the BLPU RPC.
 */
export const getBlpuRpc = (value, isScottish) => {
  const rec = RepresentativePointCode.find((x) => x.id === value);

  if (rec) {
    if (isScottish) return rec.osText;
    else return rec.gpText;
  } else return null;
};

/**
 * Method to get the BLPU state description.
 *
 * @param {number} value The BLPU state.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @returns {string|null} The description to display for the BLPU state.
 */
export const getBlpuState = (value, isScottish) => {
  const rec = BLPUState.find((x) => x.id === value);

  if (rec) {
    if (isScottish) return rec.osText;
    else return rec.gpText;
  } else return null;
};

/**
 * Method to get the classification description.
 *
 * @param {number} value The classification code.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @returns {string|null} The description to display for the classification code.
 */
export const getBlpuClassification = (value, isScottish) => {
  const rec = isScottish
    ? OSGClassification.find((x) => x.id === value)
    : BLPUClassification.find((x) => x.id === value);

  if (rec) return rec.display;
  else return null;
};

/**
 * Method to get the LPI logical status description.
 *
 * @param {number} value The LPI logical status.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @returns {string|null} The description to display for the LPI logical status.
 */
export const getLpiStatus = (value, isScottish) => {
  const rec = LPILogicalStatus.find((x) => x.id === value);

  if (rec) {
    if (isScottish) return rec.osText;
    else return rec.gpText;
  } else return null;
};

/**
 * Method to get the post town description.
 *
 * @param {number} value The post town reference number.
 * @param {Array} postTowns The list of post towns.
 * @returns {string|null} The description to display for the post town reference number.
 */
export const getLpiPostTown = (value, postTowns) => {
  const rec = postTowns.find((x) => x.postTownRef === value);

  if (rec) return rec.postTown;
  else return null;
};

/**
 * Method to get the sub locality description.
 *
 * @param {number} value The sub locality reference number.
 * @param {Array} subLocalities The list of sub localities.
 * @returns {string|null} The description to display for the sub locality reference number.
 */
export const getLpiSubLocality = (value, subLocalities) => {
  const rec = subLocalities.find((x) => x.subLocalityRef === value && x.historic === false && x.language === "ENG");

  if (rec) return rec.subLocality;
  else return null;
};

/**
 * Method to get the official address description.
 *
 * @param {string} value The official address.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @returns {string|null} The description to display for the official address.
 */
export const getLpiOfficialAddress = (value, isScottish) => {
  const rec = OfficialAddress.find((x) => x.id === value);

  if (rec) {
    if (isScottish) return rec.osText;
    else return rec.gpText;
  } else return null;
};

/**
 * Method to get the postally addressable description.
 *
 * @param {number} value The postally addressable.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @returns {string|null} The description to display for the postally addressable.
 */
export const getLpiPostalAddress = (value, isScottish) => {
  const rec = PostallyAddressable.find((x) => x.id === value);

  if (rec) {
    if (isScottish) return rec.osText;
    else return rec.gpText;
  } else return null;
};

/**
 * Method to get the cross reference source description.
 *
 * @param {number} value The cross reference source.
 * @param {Array} appCrossRefs The list of application cross reference sources.
 * @returns {string|null} The description to display for the cross reference source.
 */
export const getOtherCrossRefSource = (value, appCrossRefs) => {
  const rec = appCrossRefs.find((x) => x.pkId === value);

  if (rec) return rec.xrefSourceRef73;
  else return null;
};

/**
 * Method to get the provenance description.
 *
 * @param {string} value The provenance code.
 * @param {boolean} isScottish True if the authority is a Scottish authority; otherwise false.
 * @returns {string|null} The description to display for the provenance code.
 */
export const getOtherProvenance = (value, isScottish) => {
  const rec = BLPUProvenance.find((x) => x.id === value);

  if (rec) {
    if (isScottish) return rec.osText;
    else return rec.gpText;
  } else return null;
};

/**
 * Method to get the classification code for the given property.
 *
 * @param {object} property The property object that we need the classification code for.
 * @returns {string} The classification code to use for the property.
 */
export const getClassificationCode = (property) => {
  const classificationCode = property.classifications
    ? property.classifications.sort((a, b) => a.entryDate - b.entryDate)[0].blpuClass
    : property.blpuClass;

  return classificationCode ? classificationCode : "U";
};
