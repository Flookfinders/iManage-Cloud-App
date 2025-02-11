//#region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Compare two objects.
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0
//    001            Sean Flook                 Initial Revision.
//    002   28.06.23 Sean Flook         WI40256 Changed Extent to Provenance where appropriate.
//    003   07.09.23 Sean Flook                 Added EsuComparison.
//    004   13.10.23 Sean Flook                 Renamed EsuComparison to MergeEsuComparison and corrected list of ignore fields to use.
//    005   03.11.23 Sean Flook                 Added hyphen to one-way.
//    006   07.03.24 Sean Flook       IMANN-348 Centralised keys to ignore and added missing record types to StreetComparison and PropertyComparison.
//    007   28.03.24 Sean Flook                 Added EsusComparison and added additional keys to streetKeysToIgnore.
//    008   09.04.24 Joel Benford     IMANN-363 Ignore neverExport on successor cross refs
//    009   20.06.24 Sean Flook       IMANN-636 Use the new user rights.
//    010   27.06.24 Joel Benford     IMANN-685 HD sequence numbers -> seqNum
//    011   06.08.24 Sean Flook       IMANN-886 Check highway dedication record end date when merging.
//#endregion Version 1.0.0.0
//#region Version 1.0.1.0
//    012   01.10.24 Sean Flook       IMANN-899 Modified ObjectComparison to handle BLPU App Cross Ref and Provenance where the second object uses ID rather than PKID.
//#endregion Version 1.0.1.0
//
//--------------------------------------------------------------------------------------------------
//#endregion header

export const streetKeysToIgnore = [
  "maintenanceResponsibility",
  "reinstatementCategory",
  "osSpecialDesignation",
  "interests",
  "constructions",
  "specialDesignations",
  "publicRightOfWays",
  "heightWidthWeights",
  "successorCrossRefs",
  "esus",
  "streetDescriptors",
  "streetNotes",
  "esuCount",
  "relatedPropertyCount",
  "relatedStreetCount",
  "version",
  "changeType",
  "lastUpdateDate",
  "lastUpdated",
  "insertedTimestamp",
  "insertedUser",
  "lastUser",
  "highwaysAgency",
  "streetLastUpdated",
  "streetLastUser",
];

export const streetDescriptorKeysToIgnore = ["changeType", "locality", "town", "administrativeArea", "island"];

export const esuKeysToIgnore = [
  "changeType",
  "highwayDedications",
  "oneWayExemptions",
  "esuVersionNumber",
  "entryDate",
];

export const mergeEsuKeysToIgnore = [
  "assignUnassign",
  "pkId",
  "esuId",
  "changeType",
  "highwayDedications",
  "oneWayExemptions",
  "esuVersionNumber",
  "numCoordCount",
  "entryDate",
  "lastUpdateDate",
  "wktGeometry",
];

export const successorCrossRefKeysToIgnore = ["changeType", "entryDate", "lastUpdateDate", "neverExport"];

export const highwayDedicationKeysToIgnore = ["changeType", "entryDate", "lastUpdateDate"];

export const mergeHighwayDedicationKeysToIgnore = [
  "pkId",
  "esuId",
  "changeType",
  "recordEntryDate",
  "lastUpdateDate",
  "seqNum",
];

export const oneWayExemptionKeysToIgnore = ["changeType", "recordEntryDate", "lastUpdateDate"];

export const mergeOneWayExemptionKeysToIgnore = [
  "pkId",
  "esuId",
  "changeType",
  "lastUpdated",
  "insertedTimestamp",
  "insertedUser",
  "lastUser",
];

export const maintenanceResponsibilityKeysToIgnore = ["changeType", "entryDate", "lastUpdateDate"];

export const reinstatementCategoryKeysToIgnore = ["changeType", "entryDate", "lastUpdateDate"];

export const interestKeysToIgnore = [
  "changeType",
  "asdCoordinate",
  "asdCoordinateCount",
  "startX",
  "startY",
  "endX",
  "endY",
  "lastUpdateDate",
];

export const constructionKeysToIgnore = [
  "changeType",
  "asdCoordinate",
  "asdCoordinateCount",
  "constructionStartX",
  "constructionStartY",
  "constructionEndX",
  "constructionEndY",
  "lastUpdateDate",
];

export const specialDesignationKeysToIgnore = [
  "changeType",
  "asdCoordinate",
  "asdCoordinateCount",
  "specialDesigStartX",
  "specialDesigStartY",
  "specialDesigEndX",
  "specialDesigEndY",
  "entryDate",
  "lastUpdateDate",
];

export const heightWidthWeightKeysToIgnore = [
  "changeType",
  "recordEntryDate",
  "asdCoordinate",
  "asdCoordinateCount",
  "hwwStartX",
  "hwwStartY",
  "hwwEndX",
  "hwwEndY",
  "lastUpdateDate",
];

export const publicRightOfWayKeysToIgnore = [
  "changeType",
  "defMapGeometryType",
  "defMapGeometryCount",
  "defMapGeometryCount",
  "lastUpdateDate",
];

export const noteKeysToIgnore = ["changeType", "lastUser"];

export const blpuKeysToIgnore = [
  "blpuAppCrossRefs",
  "blpuProvenances",
  "blpuNotes",
  "lpis",
  "classifications",
  "organisations",
  "successorCrossRefs",
  "changeType",
  "parentAddress",
  "parentPostcode",
  "lastUpdateDate",
  "entryDate",
  "propertyLastUpdated",
  "propertyLastUser",
  "relatedPropertyCount",
  "relatedStreetCount",
];

export const lpiKeysToIgnore = [
  "changeType",
  "lastUpdateDate",
  "entryDate",
  "address",
  "postTown",
  "postcode",
  "subLocality",
];

export const blpuAppCrossRefKeysToIgnore = ["lastUpdateDate", "entryDate", "changeType"];

export const provenanceKeysToIgnore = ["lastUpdateDate", "entryDate", "changeType"];

export const classificationKeysToIgnore = ["lastUpdateDate", "entryDate", "changeType"];

export const organisationKeysToIgnore = ["lastUpdateDate", "entryDate", "changeType"];

/**
 * Method to compare 2 objects.
 *
 * @param {object} object1 The first object.
 * @param {object} object2 The second object.
 * @param {Array} keysToIgnore List of keys to ignore in the objects.
 * @returns {boolean} True if the 2 objects are the same; otherwise false.
 */
export default function ObjectComparison(object1, object2, keysToIgnore) {
  //return false if either or both are null
  if (!object1 || !object2) return false;

  const keys_object1 = Object.keys(object1);
  const keys_object2 = Object.keys(object2);

  const keys1 = keys_object1 && keysToIgnore ? keys_object1.filter((x) => !keysToIgnore.includes(x)) : keys_object1;
  const keys2 = keys_object2 && keysToIgnore ? keys_object2.filter((x) => !keysToIgnore.includes(x)) : keys_object2;

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let key of keys1) {
    if (key === "pkId" && !keys2.includes("pkId") && keys2.includes("id")) {
      if (object1[key] !== object2["id"]) {
        return false;
      }
    } else if (object1[key] !== object2[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Method to compare 2 ESUs.
 *
 * @param {object} source The source version of the ESU.
 * @param {object} current The current version of the ESU.
 * @returns {boolean} True if they are the same; otherwise false.
 */
export function MergeEsuComparison(source, current, isScottish) {
  if (!source || !current) return false;

  if (source && current) {
    let esuSame = true;

    if (!ObjectComparison(source, current, mergeEsuKeysToIgnore)) {
      esuSame = false;
    }

    // Compare Highway Dedication records
    if (!isScottish && esuSame && source.highwayDedications && current.highwayDedications) {
      if (source.highwayDedications.length !== current.highwayDedications.length) {
        esuSame = false;
      }

      if (esuSame && source.highwayDedications.length > 0 && current.highwayDedications.length > 0) {
        let hdSame = true;
        for (const sourceHighwayDedication of source.highwayDedications) {
          let foundCurrentHighwayDedication = false;
          for (const currentHighwayDedication of current.highwayDedications) {
            if (
              ObjectComparison(sourceHighwayDedication, currentHighwayDedication, mergeHighwayDedicationKeysToIgnore)
            ) {
              foundCurrentHighwayDedication = true;
              break;
            }
          }

          if (!foundCurrentHighwayDedication) {
            hdSame = false;
            break;
          }
        }

        if (!hdSame) esuSame = false;
      }
    }

    // Compare One-way Exemption records
    if (!isScottish && esuSame && source.oneWayExemptions && current.oneWayExemptions) {
      if (source.oneWayExemptions.length !== current.oneWayExemptions.length) {
        esuSame = false;
      }

      if (esuSame && source.oneWayExemptions.length > 0 && current.oneWayExemptions.length > 0) {
        let oweSame = true;
        for (const sourceOneWayExemption of source.oneWayExemptions) {
          let foundCurrentOneWayExemption = false;
          for (const currentOneWayExemption of current.oneWayExemptions) {
            if (ObjectComparison(sourceOneWayExemption, currentOneWayExemption[0], mergeOneWayExemptionKeysToIgnore)) {
              foundCurrentOneWayExemption = true;
              break;
            }
          }

          if (!foundCurrentOneWayExemption) {
            esuSame = false;
            break;
          }
        }

        if (!oweSame) esuSame = false;
      }
    }

    if (!esuSame) return false;
  }

  return true;
}

/**
 * Method to compare 2 versions of a streets ESUs.
 *
 * @param {object} source The source version of the street ESUs.
 * @param {object} current The current version of the street ESUs.
 * @returns {boolean} True if they are the same; otherwise false.
 */
export function EsusComparison(source, current) {
  if (source && current) {
    if (source.length !== current.length) return false;

    if (source.length > 0 && current.length > 0) {
      let esuSame = true;
      for (const sourceEsu of source) {
        const currentEsu = current.filter((x) => x.esuId === sourceEsu.esuId);
        if (!currentEsu || currentEsu.length !== 1) {
          esuSame = false;
          break;
        }

        if (!ObjectComparison(sourceEsu, currentEsu[0], esuKeysToIgnore)) {
          esuSame = false;
          break;
        }

        // Compare Highway Dedication records
        if (sourceEsu.highwayDedications && currentEsu[0].highwayDedications) {
          if (sourceEsu.highwayDedications.length !== currentEsu[0].highwayDedications.length) {
            esuSame = false;
            break;
          }

          if (sourceEsu.highwayDedications.length > 0 && currentEsu[0].highwayDedications.length > 0) {
            let hdSame = true;
            for (const sourceHighwayDedication of sourceEsu.highwayDedications) {
              const currentHighwayDedication = currentEsu[0].highwayDedications.filter(
                (y) => y.pkId === sourceHighwayDedication.pkId
              );
              if (!currentHighwayDedication || currentHighwayDedication.length !== 1) {
                hdSame = false;
                break;
              }

              if (
                !ObjectComparison(sourceHighwayDedication, currentHighwayDedication[0], highwayDedicationKeysToIgnore)
              ) {
                hdSame = false;
                break;
              }
            }

            if (!hdSame) {
              esuSame = false;
              break;
            }
          }
        }

        // Compare One-way Exemption records
        if (sourceEsu.oneWayExemptions && currentEsu[0].oneWayExemptions) {
          if (sourceEsu.oneWayExemptions.length !== currentEsu[0].oneWayExemptions.length) {
            esuSame = false;
            break;
          }

          if (sourceEsu.oneWayExemptions.length > 0 && currentEsu[0].oneWayExemptions.length > 0) {
            let oweSame = true;
            for (const sourceOneWayExemption of sourceEsu.oneWayExemptions) {
              const currentOneWayExemption = currentEsu[0].oneWayExemptions.filter(
                (y) => y.pkId === sourceOneWayExemption.pkId
              );
              if (!currentOneWayExemption || currentOneWayExemption.length !== 1) {
                oweSame = false;
                break;
              }

              if (!ObjectComparison(sourceOneWayExemption, currentOneWayExemption[0], oneWayExemptionKeysToIgnore)) {
                oweSame = false;
                break;
              }
            }

            if (!oweSame) {
              esuSame = false;
              break;
            }
          }
        }
      }

      return esuSame;
    }
  } else return false;
}

/**
 * Method to compare 2 versions of a street.
 *
 * @param {Object} source The source version of the street.
 * @param {Object} current The current version of the street.
 * @param {Boolean} hasASD True if the current user can see ASD; otherwise false.
 * @returns {Boolean} True if they are the same; otherwise false.
 */
export function StreetComparison(source, current, hasASD) {
  if (!source || !current) return false;

  // Compare street data
  if (!ObjectComparison(source, current, streetKeysToIgnore)) return false;

  // Compare Street Descriptor records
  if (source.streetDescriptors && current.streetDescriptors) {
    if (source.streetDescriptors.length !== current.streetDescriptors.length) return false;

    if (source.streetDescriptors.length > 0 && current.streetDescriptors.length > 0) {
      let descriptorSame = true;
      for (const sourceDescriptor of source.streetDescriptors) {
        const currentDescriptor = current.streetDescriptors.filter((x) => x.pkId === sourceDescriptor.pkId);
        if (!currentDescriptor || currentDescriptor.length !== 1) {
          descriptorSame = false;
          break;
        }

        if (!ObjectComparison(sourceDescriptor, currentDescriptor[0], streetDescriptorKeysToIgnore)) {
          descriptorSame = false;
          break;
        }
      }

      if (!descriptorSame) return false;
    }
  }

  // Compare ESU records
  if (source.esus && current.esus) {
    if (source.esus.length !== current.esus.length) return false;

    if (source.esus.length > 0 && current.esus.length > 0) {
      let esuSame = true;
      for (const sourceEsu of source.esus) {
        const currentEsu = current.esus.filter((x) => x.esuId === sourceEsu.esuId);
        if (!currentEsu || currentEsu.length !== 1) {
          esuSame = false;
          break;
        }

        if (!ObjectComparison(sourceEsu, currentEsu[0], esuKeysToIgnore)) {
          esuSame = false;
          break;
        }

        // Compare Highway Dedication records
        if (sourceEsu.highwayDedications && currentEsu[0].highwayDedications) {
          if (sourceEsu.highwayDedications.length !== currentEsu[0].highwayDedications.length) {
            esuSame = false;
            break;
          }

          if (sourceEsu.highwayDedications.length > 0 && currentEsu[0].highwayDedications.length > 0) {
            let hdSame = true;
            for (const sourceHighwayDedication of sourceEsu.highwayDedications) {
              const currentHighwayDedication = currentEsu[0].highwayDedications.filter(
                (y) => y.pkId === sourceHighwayDedication.pkId
              );
              if (!currentHighwayDedication || currentHighwayDedication.length !== 1) {
                hdSame = false;
                break;
              }

              if (
                !ObjectComparison(sourceHighwayDedication, currentHighwayDedication[0], highwayDedicationKeysToIgnore)
              ) {
                hdSame = false;
                break;
              }
            }

            if (!hdSame) {
              esuSame = false;
              break;
            }
          }
        }

        // Compare One-way Exemption records
        if (sourceEsu.oneWayExemptions && currentEsu[0].oneWayExemptions) {
          if (sourceEsu.oneWayExemptions.length !== currentEsu[0].oneWayExemptions.length) {
            esuSame = false;
            break;
          }

          if (sourceEsu.oneWayExemptions.length > 0 && currentEsu[0].oneWayExemptions.length > 0) {
            let oweSame = true;
            for (const sourceOneWayExemption of sourceEsu.oneWayExemptions) {
              const currentOneWayExemption = currentEsu[0].oneWayExemptions.filter(
                (y) => y.pkId === sourceOneWayExemption.pkId
              );
              if (!currentOneWayExemption || currentOneWayExemption.length !== 1) {
                oweSame = false;
                break;
              }

              if (!ObjectComparison(sourceOneWayExemption, currentOneWayExemption[0], oneWayExemptionKeysToIgnore)) {
                oweSame = false;
                break;
              }
            }

            if (!oweSame) {
              esuSame = false;
              break;
            }
          }
        }
      }

      if (!esuSame) return false;
    }
  }

  if (hasASD) {
    // Compare Maintenance Responsibility records
    if (source.maintenanceResponsibilities && current.maintenanceResponsibilities) {
      if (source.maintenanceResponsibilities.length !== current.maintenanceResponsibilities.length) return false;

      if (source.maintenanceResponsibilities.length > 0 && current.maintenanceResponsibilities.length > 0) {
        let maintenanceResponsibilitySame = true;
        for (const sourceMaintenanceResponsibility of source.maintenanceResponsibilities) {
          const currentMaintenanceResponsibility = current.maintenanceResponsibilities.filter(
            (x) => x.pkId === sourceMaintenanceResponsibility.pkId
          );
          if (!currentMaintenanceResponsibility || currentMaintenanceResponsibility.length !== 1) {
            maintenanceResponsibilitySame = false;
            break;
          }

          if (
            !ObjectComparison(
              sourceMaintenanceResponsibility,
              currentMaintenanceResponsibility[0],
              maintenanceResponsibilityKeysToIgnore
            )
          ) {
            maintenanceResponsibilitySame = false;
            break;
          }
        }

        if (!maintenanceResponsibilitySame) return false;
      }
    }

    // Compare Reinstatement Category records
    if (source.reinstatementCategories && current.reinstatementCategories) {
      if (source.reinstatementCategories.length !== current.reinstatementCategories.length) return false;

      if (source.reinstatementCategories.length > 0 && current.reinstatementCategories.length > 0) {
        let reinstatementCategorySame = true;
        for (const sourceReinstatementCategory of source.reinstatementCategories) {
          const currentReinstatementCategory = current.reinstatementCategories.filter(
            (x) => x.pkId === sourceReinstatementCategory.pkId
          );
          if (!currentReinstatementCategory || currentReinstatementCategory.length !== 1) {
            reinstatementCategorySame = false;
            break;
          }

          if (
            !ObjectComparison(
              sourceReinstatementCategory,
              currentReinstatementCategory[0],
              reinstatementCategoryKeysToIgnore
            )
          ) {
            reinstatementCategorySame = false;
            break;
          }
        }

        if (!reinstatementCategorySame) return false;
      }
    }

    // Compare Interest records
    if (source.interests && current.interests) {
      if (source.interests.length !== current.interests.length) return false;

      if (source.interests.length > 0 && current.interests.length > 0) {
        let interestSame = true;
        for (const sourceInterest of source.interests) {
          const currentInterest = current.interests.filter((x) => x.pkId === sourceInterest.pkId);
          if (!currentInterest || currentInterest.length !== 1) {
            interestSame = false;
            break;
          }

          if (!ObjectComparison(sourceInterest, currentInterest[0], interestKeysToIgnore)) {
            interestSame = false;
            break;
          }
        }

        if (!interestSame) return false;
      }
    }

    // Compare Construction records
    if (source.constructions && current.constructions) {
      if (source.constructions.length !== current.constructions.length) return false;

      if (source.constructions.length > 0 && current.constructions.length > 0) {
        let constructionSame = true;
        for (const sourceConstruction of source.constructions) {
          const currentConstruction = current.constructions.filter((x) => x.pkId === sourceConstruction.pkId);
          if (!currentConstruction || currentConstruction.length !== 1) {
            constructionSame = false;
            break;
          }

          if (!ObjectComparison(sourceConstruction, currentConstruction[0], constructionKeysToIgnore)) {
            constructionSame = false;
            break;
          }
        }

        if (!constructionSame) return false;
      }
    }

    // Compare Special Designation records
    if (source.specialDesignations && current.specialDesignations) {
      if (source.specialDesignations.length !== current.specialDesignations.length) return false;

      if (source.specialDesignations.length > 0 && current.specialDesignations.length > 0) {
        let specialDesignationSame = true;
        for (const sourceSpecialDesignation of source.specialDesignations) {
          const currentSpecialDesignation = current.specialDesignations.filter(
            (x) => x.pkId === sourceSpecialDesignation.pkId
          );
          if (!currentSpecialDesignation || currentSpecialDesignation.length !== 1) {
            specialDesignationSame = false;
            break;
          }

          if (
            !ObjectComparison(sourceSpecialDesignation, currentSpecialDesignation[0], specialDesignationKeysToIgnore)
          ) {
            specialDesignationSame = false;
            break;
          }
        }

        if (!specialDesignationSame) return false;
      }
    }

    // Compare Height, Width and Weight records
    if (source.heightWidthWeights && current.heightWidthWeights) {
      if (source.heightWidthWeights.length !== current.heightWidthWeights.length) return false;

      if (source.heightWidthWeights.length > 0 && current.heightWidthWeights.length > 0) {
        let hwwSame = true;
        for (const sourceHeightWidthWeight of source.heightWidthWeights) {
          const currentHeightWidthWeight = current.heightWidthWeights.filter(
            (x) => x.pkId === sourceHeightWidthWeight.pkId
          );
          if (!currentHeightWidthWeight || currentHeightWidthWeight.length !== 1) {
            hwwSame = false;
            break;
          }

          if (!ObjectComparison(sourceHeightWidthWeight, currentHeightWidthWeight[0], heightWidthWeightKeysToIgnore)) {
            hwwSame = false;
            break;
          }
        }

        if (!hwwSame) return false;
      }
    }

    // Compare Public Right of Way records
    if (source.publicRightOfWays && current.publicRightOfWays) {
      if (source.publicRightOfWays.length !== current.publicRightOfWays.length) return false;

      if (source.publicRightOfWays.length > 0 && current.publicRightOfWays.length > 0) {
        let prowSame = true;
        for (const sourcePublicRightOfWay of source.publicRightOfWays) {
          const currentPublicRightOfWay = current.publicRightOfWays.filter(
            (x) => x.pkId === sourcePublicRightOfWay.pkId
          );
          if (!currentPublicRightOfWay || currentPublicRightOfWay.length !== 1) {
            prowSame = false;
            break;
          }

          if (!ObjectComparison(sourcePublicRightOfWay, currentPublicRightOfWay[0], publicRightOfWayKeysToIgnore)) {
            prowSame = false;
            break;
          }
        }

        if (!prowSame) return false;
      }
    }
  }

  // Compare Note records
  if (source.streetNotes && current.streetNotes) {
    if (source.streetNotes.length !== current.streetNotes.length) return false;

    if (source.streetNotes.length > 0 && current.streetNotes.length > 0) {
      let noteSame = true;
      for (const sourceNote of source.streetNotes) {
        const currentNote = current.streetNotes.filter((x) => x.pkId === sourceNote.pkId);
        if (!currentNote || currentNote.length !== 1) {
          noteSame = false;
          break;
        }

        if (!ObjectComparison(sourceNote, currentNote[0], noteKeysToIgnore)) {
          noteSame = false;
          break;
        }
      }

      if (!noteSame) return false;
    }
  }

  return true;
}

/**
 * Method to compare 2 versions of a property.
 *
 * @param {object} source The source version of the property.
 * @param {object} current The current version of the property.
 * @returns {boolean} True if they are the same; otherwise false.
 */
export function PropertyComparison(source, current) {
  if (!source || !current) return false;

  // Compare BLPU data
  if (!ObjectComparison(source, current, blpuKeysToIgnore)) return false;

  // Compare LPI records
  if (source.lpis && current.lpis) {
    if (source.lpis.length !== current.lpis.length) return false;

    if (source.lpis.length > 0 && current.lpis.length > 0) {
      let lpiSame = true;
      for (const sourceLpi of source.lpis) {
        const currentLpi = current.lpis.filter((x) => x.pkId === sourceLpi.pkId);
        if (!currentLpi || currentLpi.length !== 1) {
          lpiSame = false;
          break;
        }

        if (!ObjectComparison(sourceLpi, currentLpi[0], lpiKeysToIgnore)) {
          lpiSame = false;
          break;
        }
      }

      if (!lpiSame) return false;
    }
  }

  // Compare BLPU Application Cross Reference records
  if (source.blpuAppCrossRefs && current.blpuAppCrossRefs) {
    if (source.blpuAppCrossRefs.length !== current.blpuAppCrossRefs.length) return false;

    if (source.blpuAppCrossRefs.length > 0 && current.blpuAppCrossRefs.length > 0) {
      let blpuAppCrossRefSame = true;
      for (const sourceBlpuAppCrossRef of source.blpuAppCrossRefs) {
        const currentBlpuAppCrossRef = current.blpuAppCrossRefs.filter((x) => x.pkId === sourceBlpuAppCrossRef.pkId);
        if (!currentBlpuAppCrossRef || currentBlpuAppCrossRef.length !== 1) {
          blpuAppCrossRefSame = false;
          break;
        }

        if (!ObjectComparison(sourceBlpuAppCrossRef, currentBlpuAppCrossRef[0], blpuAppCrossRefKeysToIgnore)) {
          blpuAppCrossRefSame = false;
          break;
        }
      }

      if (!blpuAppCrossRefSame) return false;
    }
  }

  // Compare BLPU provenance records
  if (source.blpuProvenances && current.blpuProvenances) {
    if (source.blpuProvenances.length !== current.blpuProvenances.length) return false;

    if (source.blpuProvenances.length > 0 && current.blpuProvenances.length > 0) {
      let provenanceSame = true;
      for (const sourceProvenance of source.blpuProvenances) {
        const currentProvenance = current.blpuProvenances.filter((x) => x.pkId === sourceProvenance.pkId);
        if (!currentProvenance || currentProvenance.length !== 1) {
          provenanceSame = false;
          break;
        }

        if (!ObjectComparison(sourceProvenance, currentProvenance[0], provenanceKeysToIgnore)) {
          provenanceSame = false;
          break;
        }
      }

      if (!provenanceSame) return false;
    }
  }

  // Compare Classification records
  if (source.classifications && current.classifications) {
    if (source.classifications.length !== current.classifications.length) return false;

    if (source.classifications.length > 0 && current.classifications.length > 0) {
      let classificationSame = true;
      for (const sourceClassification of source.classifications) {
        const currentClassification = current.classifications.filter((x) => x.pkId === sourceClassification.pkId);
        if (!currentClassification || currentClassification.length !== 1) {
          classificationSame = false;
          break;
        }

        if (!ObjectComparison(sourceClassification, currentClassification[0], classificationKeysToIgnore)) {
          classificationSame = false;
          break;
        }
      }

      if (!classificationSame) return false;
    }
  }

  // Compare Organisation records
  if (source.organisations && current.organisations) {
    if (source.organisations.length !== current.organisations.length) return false;

    if (source.organisations.length > 0 && current.organisations.length > 0) {
      let organisationSame = true;
      for (const sourceOrganisation of source.organisations) {
        const currentOrganisation = current.organisations.filter((x) => x.pkId === sourceOrganisation.pkId);
        if (!currentOrganisation || currentOrganisation.length !== 1) {
          organisationSame = false;
          break;
        }

        if (!ObjectComparison(sourceOrganisation, currentOrganisation[0], organisationKeysToIgnore)) {
          organisationSame = false;
          break;
        }
      }

      if (!organisationSame) return false;
    }
  }

  // Compare Successor Cross Reference records
  if (source.successorCrossRefs && current.successorCrossRefs) {
    if (source.successorCrossRefs.length !== current.successorCrossRefs.length) return false;

    if (source.successorCrossRefs.length > 0 && current.successorCrossRefs.length > 0) {
      let successorCrossRefSame = true;
      for (const sourceSuccessorCrossRef of source.successorCrossRefs) {
        const currentSuccessorCrossRef = current.successorCrossRefs.filter(
          (x) => x.pkId === sourceSuccessorCrossRef.pkId
        );
        if (!currentSuccessorCrossRef || currentSuccessorCrossRef.length !== 1) {
          successorCrossRefSame = false;
          break;
        }

        if (!ObjectComparison(sourceSuccessorCrossRef, currentSuccessorCrossRef[0], successorCrossRefKeysToIgnore)) {
          successorCrossRefSame = false;
          break;
        }
      }

      if (!successorCrossRefSame) return false;
    }
  }

  // Compare Note records
  if (source.blpuNotes && current.blpuNotes) {
    if (source.blpuNotes.length !== current.blpuNotes.length) return false;

    if (source.blpuNotes.length > 0 && current.blpuNotes.length > 0) {
      let noteSame = true;
      for (const sourceNote of source.blpuNotes) {
        const currentNote = current.blpuNotes.filter((x) => x.pkId === sourceNote.pkId);
        if (!currentNote || currentNote.length !== 1) {
          noteSame = false;
          break;
        }

        if (!ObjectComparison(sourceNote, currentNote[0], noteKeysToIgnore)) {
          noteSame = false;
          break;
        }
      }

      if (!noteSame) return false;
    }
  }

  return true;
}
