/* #region header */
/**************************************************************************************************
//
//  Description: Compare two objects.
//
//  Copyright:    © 2021 - 2023 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001            Sean Flook                 Initial Revision.
//    002   28.06.23 Sean Flook         WI40256 Changed Extent to Provenance where appropriate.
//    003   07.09.23 Sean Flook                 Added EsuComparison.
//    004   13.10.23 Sean Flook                 Renamed EsuComparison to MergeEsuComparison and corrected list of ignore fields to use.
//    005   03.11.23 Sean Flook                 Added hyphen to one-way.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import { HasASD } from "../configuration/ADSConfig";

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
    if (object1[key] !== object2[key]) {
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

    if (
      !ObjectComparison(source, current, [
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
      ])
    ) {
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
              ObjectComparison(sourceHighwayDedication, currentHighwayDedication, [
                "pkId",
                "esuId",
                "changeType",
                "recordEntryDate",
                "lastUpdateDate",
                "recordEndDate",
                "sequenceNumber",
              ])
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
            if (
              ObjectComparison(sourceOneWayExemption, currentOneWayExemption[0], [
                "pkId",
                "esuId",
                "changeType",
                "lastUpdated",
                "insertedTimestamp",
                "insertedUser",
                "lastUser",
              ])
            ) {
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
 * Method to compare 2 versions of a street.
 *
 * @param {object} source The source version of the street.
 * @param {object} current The current version of the street.
 * @returns {boolean} True if they are the same; otherwise false.
 */
export function StreetComparison(source, current) {
  if (!source || !current) return false;

  // Compare street data
  if (
    !ObjectComparison(source, current, [
      "interests",
      "constructions",
      "specialDesignations",
      "publicRightOfWays",
      "heightWidthWeights",
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
    ])
  )
    return false;

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

        if (
          !ObjectComparison(sourceDescriptor, currentDescriptor[0], [
            "changeType",
            "locality",
            "town",
            "administrativeArea",
            "lastUpdated",
            "insertedTimestamp",
            "insertedUser",
            "lastUser",
          ])
        ) {
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

        if (
          !ObjectComparison(sourceEsu, currentEsu[0], [
            "changeType",
            "highwayDedications",
            "oneWayExemptions",
            "esuVersionNumber",
            "numCoordCount",
            "esuEntryDate",
            "esuLastUpdateDate",
            "esuEndDate",
            "insertedTimestamp",
            "insertedUser",
            "lastUser",
          ])
        ) {
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
                !ObjectComparison(sourceHighwayDedication, currentHighwayDedication[0], [
                  "changeType",
                  "lastUpdated",
                  "insertedTimestamp",
                  "insertedUser",
                  "lastUser",
                ])
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

              if (
                !ObjectComparison(sourceOneWayExemption, currentOneWayExemption[0], [
                  "changeType",
                  "lastUpdated",
                  "insertedTimestamp",
                  "insertedUser",
                  "lastUser",
                ])
              ) {
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

  if (HasASD()) {
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

          if (
            !ObjectComparison(sourceInterest, currentInterest[0], [
              "changeType",
              "recordEntryDate",
              "recordEndDate",
              "lastUpdated",
              "insertedTimestamp",
              "insertedUser",
              "lastUser",
            ])
          ) {
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

          if (
            !ObjectComparison(sourceConstruction, currentConstruction[0], [
              "changeType",
              "neverExport",
              "endDate",
              "lastUpdateDate",
              "lastUpdated",
              "insertedTimestamp",
              "insertedUser",
              "lastUser",
            ])
          ) {
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
            !ObjectComparison(sourceSpecialDesignation, currentSpecialDesignation[0], [
              "changeType",
              "neverExport",
              "endDate",
              "lastUpdateDate",
              "lastUpdated",
              "insertedTimestamp",
              "insertedUser",
              "lastUser",
            ])
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

          if (
            !ObjectComparison(sourceHeightWidthWeight, currentHeightWidthWeight[0], [
              "changeType",
              "neverExport",
              "endDate",
              "lastUpdateDate",
              "lastUpdated",
              "lastUser",
            ])
          ) {
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

          if (
            !ObjectComparison(sourcePublicRightOfWay, currentPublicRightOfWay[0], [
              "changeType",
              "neverExport",
              "endDate",
              "lastUpdateDate",
              "lastUpdated",
              "insertedTimestamp",
              "insertedUser",
              "lastUser",
            ])
          ) {
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

        if (
          !ObjectComparison(sourceNote, currentNote[0], [
            "changeType",
            "createdDate",
            "lastUpdatedDate",
            "lastUpdated",
            "insertedTimestamp",
            "insertedUser",
            "lastUser",
          ])
        ) {
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
  if (
    !ObjectComparison(source, current, [
      "custodianOne",
      "custodianTwo",
      "canKey",
      "blpuAppCrossRefs",
      "blpuProvenances",
      "blpuNotes",
      "lpis",
      "changeType",
      "lastUpdateDate",
      "entryDate",
      "propertyLastUpdated",
      "propertyLastUser",
      "relatedPropertyCount",
      "relatedStreetCount",
      "latitude",
      "longitude",
      "lastUpdated",
      "insertedTimestamp",
      "insertedUser",
      "lastUser",
    ])
  )
    return false;

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

        if (
          !ObjectComparison(sourceLpi, currentLpi[0], [
            "custodianOne",
            "custodianTwo",
            "canKey",
            "changeType",
            "lastUpdateDate",
            "address",
            "bs7666Address",
            "saonDetails",
            "paonDetails",
            "searchAddress",
            "postTown",
            "postcode",
            "lastUpdated",
            "insertedTimestamp",
            "insertedUser",
            "lastUser",
          ])
        ) {
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

        if (
          !ObjectComparison(sourceBlpuAppCrossRef, currentBlpuAppCrossRef[0], [
            "lastUpdateDate",
            "lastUpdated",
            "insertedTimestamp",
            "insertedUser",
            "lastUser",
          ])
        ) {
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

        if (
          !ObjectComparison(sourceProvenance, currentProvenance[0], [
            "changeType",
            "lastUpdateDate",
            "lastUpdated",
            "insertedTimestamp",
            "insertedUser",
            "lastUser",
          ])
        ) {
          provenanceSame = false;
          break;
        }
      }

      if (!provenanceSame) return false;
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

        if (
          !ObjectComparison(sourceNote, currentNote[0], [
            "changeType",
            "createdDate",
            "lastUpdatedDate",
            "lastUpdated",
            "insertedTimestamp",
            "insertedUser",
            "lastUser",
          ])
        ) {
          noteSame = false;
          break;
        }
      }

      if (!noteSame) return false;
    }
  }

  return true;
}
