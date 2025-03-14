//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Control used to display a list of the errors.
//
//  Copyright:    © 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//region Version 1.0.0.0
//    001            Sean Flook                  Initial Revision.
//    002   28.06.23 Sean Flook          WI40256 Changed Extent to Provenance where appropriate.
//    003   06.10.23 Sean Flook                  Added OneScotland record types. Use colour variables.
//    004   03.11.23 Sean Flook                  Added hyphen to one-way.
//    005   24.11.23 Sean Flook                  Moved Box and Stack to @mui/system and renamed successor to successorCrossRef.
//    006   14.12.23 Sean Flook                  Corrected note record type.
//    007   05.01.24 Sean Flook                  use CSS shortcuts.
//    008   08.03.24 Sean Flook        IMANN-348 Updated method to see if a street or property has changed and added in the missing Scottish records.
//    009   12.06.24 Sean Flook        IMANN-515 Use a List to display the errors and display each error as a separate item.
//    010   20.06.24 Sean Flook        IMANN-636 Use the new user rights.
//    011   27.06.24 Joel Benford      IMANN-685 OWE sequence numbers -> seqNum
//    012   22.07.24 Sean Flook        IMANN-766 Replace holding character ¬ with a comma.
//endregion Version 1.0.0.0
//region Version 1.0.5.0
//    013   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//    014   14.03.25 Sean Flook       IMANN-1696 Added ability to copy the errors to the clipboard.
//endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//endregion header

import React, { useContext, useState, useEffect, Fragment } from "react";
import PropTypes from "prop-types";

import PropertyContext from "../context/propertyContext";
import StreetContext from "../context/streetContext";
import SandboxContext from "../context/sandboxContext";
import LookupContext from "../context/lookupContext";
import SettingsContext from "../context/settingsContext";
import UserContext from "../context/userContext";

import { GetNewStreetData } from "../utils/StreetUtils";
import { GetNewPropertyData, getBilingualSource } from "../utils/PropertyUtils";
import { copyTextToClipboard, FormatDateTime } from "./../utils/HelperUtils";
import ObjectComparison, {
  StreetComparison,
  PropertyComparison,
  streetDescriptorKeysToIgnore,
  esuKeysToIgnore,
  highwayDedicationKeysToIgnore,
  oneWayExemptionKeysToIgnore,
  successorCrossRefKeysToIgnore,
  maintenanceResponsibilityKeysToIgnore,
  reinstatementCategoryKeysToIgnore,
  specialDesignationKeysToIgnore,
  interestKeysToIgnore,
  constructionKeysToIgnore,
  heightWidthWeightKeysToIgnore,
  publicRightOfWayKeysToIgnore,
  noteKeysToIgnore,
  lpiKeysToIgnore,
  blpuAppCrossRefKeysToIgnore,
  provenanceKeysToIgnore,
  classificationKeysToIgnore,
  organisationKeysToIgnore,
} from "../utils/ObjectComparison";

import {
  Grid2,
  Typography,
  IconButton,
  Link,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Stack,
} from "@mui/material";
import { Box } from "@mui/system";
import { useEditConfirmation } from "../pages/EditConfirmationPage";

import CloseIcon from "@mui/icons-material/Close";
import { CopyIcon } from "./../utils/ADSIcons";

import { adsRed, adsDarkGrey, adsLightGreyB, adsOffWhite, adsLightGreyA50 } from "../utils/ADSColours";
import { ActionIconStyle, GetAlertStyle, GetAlertIcon, GetAlertSeverity } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";
import MessageDialog from "./../dialogs/MessageDialog";

ADSErrorList.propTypes = {
  onClose: PropTypes.func.isRequired,
};

function ADSErrorList({ onClose }) {
  const theme = useTheme();

  const propertyContext = useContext(PropertyContext);
  const streetContext = useContext(StreetContext);
  const sandboxContext = useContext(SandboxContext);
  const lookupContext = useContext(LookupContext);
  const settingsContext = useContext(SettingsContext);
  const userContext = useContext(UserContext);

  const confirmDialog = useEditConfirmation(false);

  const [validationErrorOpen, setValidationErrorOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);

  const [hasASD, setHasASD] = useState(false);

  const getIssueStyle = {
    pl: theme.spacing(1),
    pr: theme.spacing(1),
    color: adsRed,
    fontWeight: 600,
    fontSize: "14px",
  };

  /**
   * Event to handle closing the dialog.
   *
   * @param {object} event The event object
   */
  const handleCloseClick = (event) => {
    event.stopPropagation();
    if (onClose) onClose();
  };

  /**
   * Event to handle copying the errors to the clipboard.
   *
   * @param {object} event The event object
   */
  const handleCopyClick = (event) => {
    event.stopPropagation();

    let copyString = `Copy of Validation Issue(s) from ${FormatDateTime(new Date())}\n\n`;

    if (streetContext.currentStreetHasErrors) {
      const streetTitle = `Street: ${streetContext.currentStreet.usrn} - ${streetContext.currentStreet.descriptor}`;
      copyString += `${streetTitle}\n`;
      copyString += `${"=".repeat(streetTitle.length)}\n\n`;

      if (streetContext.currentErrors.street.length > 0) {
        copyString += "Street errors\n";
        copyString += "-------------\n";
        streetContext.currentErrors.street.forEach((error) => {
          error.errors.forEach((errorText) => {
            copyString += `${error.field}: ${errorText.replace("¬", ",")}\n`;
          });
        });
      }

      if (streetContext.currentErrors.descriptor.length > 0) {
        copyString += "\nStreet Descriptor errors\n";
        copyString += "------------------------\n";
        streetContext.currentErrors.descriptor.forEach((error) => {
          error.errors.forEach((errorText) => {
            copyString += `${error.field}: ${errorText.replace("¬", ",")}\n`;
          });
        });
      }

      if (streetContext.currentErrors.esu.length > 0) {
        copyString += "\nESU errors\n";
        copyString += "----------\n";
        streetContext.currentErrors.esu.forEach((error) => {
          error.errors.forEach((errorText) => {
            copyString += `${error.field}: ${errorText.replace("¬", ",")}\n`;
          });
        });
      }

      if (streetContext.currentErrors.highwayDedication.length > 0) {
        copyString += "\nHighway Dedication errors\n";
        copyString += "-------------------------\n";
        streetContext.currentErrors.highwayDedication.forEach((error) => {
          error.errors.forEach((errorText) => {
            copyString += `${error.field}: ${errorText.replace("¬", ",")}\n`;
          });
        });
      }

      if (streetContext.currentErrors.oneWayExemption.length > 0) {
        copyString += "\nOne Way Exemption errors\n";
        copyString += "------------------------\n";
        streetContext.currentErrors.oneWayExemption.forEach((error) => {
          error.errors.forEach((errorText) => {
            copyString += `${error.field}: ${errorText.replace("¬", ",")}\n`;
          });
        });
      }

      if (streetContext.currentErrors.successorCrossRef.length > 0) {
        copyString += "\nSuccessor Cross Reference errors\n";
        copyString += "--------------------------------\n";
        streetContext.currentErrors.successorCrossRef.forEach((error) => {
          error.errors.forEach((errorText) => {
            copyString += `${error.field}: ${errorText.replace("¬", ",")}\n`;
          });
        });
      }

      if (streetContext.currentErrors.maintenanceResponsibility.length > 0) {
        copyString += "\nMaintenance Responsibility errors\n";
        copyString += "---------------------------------\n";
        streetContext.currentErrors.maintenanceResponsibility.forEach((error) => {
          error.errors.forEach((errorText) => {
            copyString += `${error.field}: ${errorText.replace("¬", ",")}\n`;
          });
        });
      }

      if (streetContext.currentErrors.reinstatementCategory.length > 0) {
        copyString += "\nReinstatement Category errors\n";
        copyString += "-----------------------------\n";
        streetContext.currentErrors.reinstatementCategory.forEach((error) => {
          error.errors.forEach((errorText) => {
            copyString += `${error.field}: ${errorText.replace("¬", ",")}\n`;
          });
        });
      }

      if (streetContext.currentErrors.osSpecialDesignation.length > 0) {
        copyString += "\nSpecial Designation errors\n";
        copyString += "--------------------------\n";
        streetContext.currentErrors.osSpecialDesignation.forEach((error) => {
          error.errors.forEach((errorText) => {
            copyString += `${error.field}: ${errorText.replace("¬", ",")}\n`;
          });
        });
      }

      if (streetContext.currentErrors.interest.length > 0) {
        copyString += "\nInterest errors\n";
        copyString += "---------------\n";
        streetContext.currentErrors.interest.forEach((error) => {
          error.errors.forEach((errorText) => {
            copyString += `${error.field}: ${errorText.replace("¬", ",")}\n`;
          });
        });
      }

      if (streetContext.currentErrors.construction.length > 0) {
        copyString += "\nConstruction errors\n";
        copyString += "-------------------\n";
        streetContext.currentErrors.construction.forEach((error) => {
          error.errors.forEach((errorText) => {
            copyString += `${error.field}: ${errorText.replace("¬", ",")}\n`;
          });
        });
      }

      if (streetContext.currentErrors.specialDesignation.length > 0) {
        copyString += "\nSpecial Designation errors\n";
        copyString += "--------------------------\n";
        streetContext.currentErrors.specialDesignation.forEach((error) => {
          error.errors.forEach((errorText) => {
            copyString += `${error.field}: ${errorText.replace("¬", ",")}\n`;
          });
        });
      }

      if (streetContext.currentErrors.heightWidthWeight.length > 0) {
        copyString += "\nHeight, Width and Weight errors\n";
        copyString += "-------------------------------\n";
        streetContext.currentErrors.heightWidthWeight.forEach((error) => {
          error.errors.forEach((errorText) => {
            copyString += `${error.field}: ${errorText.replace("¬", ",")}\n`;
          });
        });
      }

      if (streetContext.currentErrors.publicRightOfWay.length > 0) {
        copyString += "\nPublic Right of Way errors\n";
        copyString += "--------------------------\n";
        streetContext.currentErrors.publicRightOfWay.forEach((error) => {
          error.errors.forEach((errorText) => {
            copyString += `${error.field}: ${errorText.replace("¬", ",")}\n`;
          });
        });
      }

      if (streetContext.currentErrors.note.length > 0) {
        copyString += "\nStreet Note errors\n";
        copyString += "------------------\n";
        streetContext.currentErrors.note.forEach((error) => {
          error.errors.forEach((errorText) => {
            copyString += `${error.field}: ${errorText.replace("¬", ",")}\n`;
          });
        });
      }
    }

    if (propertyContext.currentPropertyHasErrors) {
      const propertyTitle = `Property: ${propertyContext.currentProperty.uprn} - ${propertyContext.currentProperty.address}`;
      copyString += `${propertyTitle}\n`;
      copyString += `${"=".repeat(propertyTitle.length)}\n\n`;

      if (propertyContext.currentErrors.blpu.length > 0) {
        copyString += "BLPU errors\n";
        copyString += "-----------\n";
        propertyContext.currentErrors.blpu.forEach((error) => {
          error.errors.forEach((errorText) => {
            copyString += `${error.field}: ${errorText.replace("¬", ",")}\n`;
          });
        });
      }

      if (propertyContext.currentErrors.lpi.length > 0) {
        copyString += "\nLPI errors\n";
        copyString += "----------\n";
        propertyContext.currentErrors.lpi.forEach((error) => {
          error.errors.forEach((errorText) => {
            copyString += `${error.field}: ${errorText.replace("¬", ",")}\n`;
          });
        });
      }

      if (propertyContext.currentErrors.provenance.length > 0) {
        copyString += "\nProvenance errors\n";
        copyString += "-----------------\n";
        propertyContext.currentErrors.provenance.forEach((error) => {
          error.errors.forEach((errorText) => {
            copyString += `${error.field}: ${errorText.replace("¬", ",")}\n`;
          });
        });
      }

      if (propertyContext.currentErrors.crossRef.length > 0) {
        copyString += "\nCross Reference errors\n";
        copyString += "----------------------\n";
        propertyContext.currentErrors.crossRef.forEach((error) => {
          error.errors.forEach((errorText) => {
            copyString += `${error.field}: ${errorText.replace("¬", ",")}\n`;
          });
        });
      }

      if (propertyContext.currentErrors.successorCrossRef.length > 0) {
        copyString += "\nSuccessor Cross Reference errors\n";
        copyString += "--------------------------------\n";
        propertyContext.currentErrors.successorCrossRef.forEach((error) => {
          error.errors.forEach((errorText) => {
            copyString += `${error.field}: ${errorText.replace("¬", ",")}\n`;
          });
        });
      }

      if (propertyContext.currentErrors.organisation.length > 0) {
        copyString += "\nOrganisation errors\n";
        copyString += "-------------------\n";
        propertyContext.currentErrors.organisation.forEach((error) => {
          error.errors.forEach((errorText) => {
            copyString += `${error.field}: ${errorText.replace("¬", ",")}\n`;
          });
        });
      }

      if (propertyContext.currentErrors.classification.length > 0) {
        copyString += "\nClassification errors\n";
        copyString += "---------------------\n";
        propertyContext.currentErrors.classification.forEach((error) => {
          error.errors.forEach((errorText) => {
            copyString += `${error.field}: ${errorText.replace("¬", ",")}\n`;
          });
        });
      }

      if (propertyContext.currentErrors.note.length > 0) {
        copyString += "\nProperty Note errors\n";
        copyString += "--------------------\n";
        propertyContext.currentErrors.note.forEach((error) => {
          error.errors.forEach((errorText) => {
            copyString += `${error.field}: ${errorText.replace("¬", ",")}\n`;
          });
        });
      }
    }

    copyTextToClipboard(copyString);
    setMessageOpen(true);
  };

  /**
   * Event to handle when an error is clicked.
   *
   * @param {number} type The type of record with the error.
   * @param {object} error The error object.
   */
  const doErrorClick = (type, error) => {
    const streetTypes = [11, 13, 15, 16, 17, 51, 52, 53, 61, 62, 63, 64, 66, 72];
    const esuTypes = [16, 17];
    const propertyTypes = [21, 22, 23, 24, 30, 31, 32, 71];

    if (streetTypes.includes(type)) {
      if (type === 11) streetContext.onGoToField(type, undefined, null, error.field);
      else if (esuTypes.includes(type)) streetContext.onGoToField(type, error.index, error.esuIndex, error.field);
      else streetContext.onGoToField(type, error.index, null, error.field);
    } else if (propertyTypes.includes(type)) {
      if (type === 21) propertyContext.onGoToField(type, undefined, error.field);
      else propertyContext.onGoToField(type, error.index, error.field);
    }
  };

  /**
   * Method called when the user wants to keep any changes already done to the current record.
   */
  const doKeepChanges = () => {
    if (sandboxContext.currentSandbox.sourceStreet) {
      switch (streetContext.currentRecord.type) {
        case 13:
          updateEsuData();
          break;

        case 15:
          updateStreetDescriptorData();
          break;

        case 16:
          updateOneWayExemptionData();
          break;

        case 17:
          updateHighwayDedicationData();
          break;

        case 30:
          updateSuccessorCrossRefData();
          break;

        case 51:
          updateMaintenanceResponsibilityData();
          break;

        case 52:
          updateReinstatementCategoryData();
          break;

        case 53:
          updateOsSpecialDesignationData();
          break;

        case 61:
          updateInterestData();
          break;

        case 62:
          updateConstructionData();
          break;

        case 63:
          updateSpecialDesignationData();
          break;

        case 64:
          updateHwwData();
          break;

        case 66:
          updateProwData();
          break;

        case 72:
          updateStreetNoteData();
          break;

        default: // 11
          // No need to do anything as Street changes are sent to sandboxContext.currentSandbox.currentStreet already
          break;
      }
    } else if (sandboxContext.currentSandbox.sourceProperty) {
      switch (propertyContext.currentRecord.type) {
        case 22:
          updateProvenanceData();
          break;

        case 23:
          updateCrossRefData();
          break;

        case 24:
          updateLpiData();
          break;

        case 30:
          updateSuccessorCrossRefData();
          break;

        case 31:
          updateOrganisationData();
          break;

        case 32:
          updateClassificationData();
          break;

        case 71:
          updatePropertyNoteData();
          break;

        default: // 21
          // No need to do anything as BLPU changes are sent to sandboxContext.currentSandbox.currentProperty already
          break;
      }
    }
  };

  /**
   * Sets the associated street data for the current street and then clears the data from the sandbox.
   *
   * @param {array|null} esuData The ESU data for the street.
   * @param {array|null} successorCrossRefData The successor cross reference data for the street (OneScotland only).
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
   * @param {string} clearType The type of data that we are clearing from the sandbox.
   */
  const setAssociatedStreetDataAndClear = (
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
    clearType
  ) => {
    const newStreetData = GetNewStreetData(
      sandboxContext.currentSandbox.currentStreet
        ? sandboxContext.currentSandbox.currentStreet
        : sandboxContext.currentSandbox.sourceStreet,
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
      settingsContext.isScottish,
      hasASD
    );

    sandboxContext.onUpdateAndClear("currentStreet", newStreetData, clearType);
  };

  /**
   * Sets the associated property data for the current property and then clears the data from the sandbox.
   *
   * @param {array|null} lpiData The LPI data for the property.
   * @param {array|null} provenanceData The provenance data for the property.
   * @param {array|null} crossRefData The cross reference data for the property.
   * @param {array|null} classificationData The classification data for the property (OneScotland only).
   * @param {array|null} organisationData The organisation data for the property (OneScotland only).
   * @param {array|null} successorCrossRefData The successor cross reference data for the property (OneScotland only).
   * @param {array|null} noteData The note data for the property.
   * @param {string} clearType The type of data that we are clearing from the sandbox.
   */
  const setAssociatedPropertyDataAndClear = (
    lpiData,
    provenanceData,
    crossRefData,
    classificationData,
    organisationData,
    successorCrossRefData,
    noteData,
    clearType
  ) => {
    const newPropertyData = GetNewPropertyData(
      settingsContext.isScottish,
      sandboxContext.currentSandbox.currentProperty
        ? sandboxContext.currentSandbox.currentProperty
        : sandboxContext.currentSandbox.sourceProperty,
      lpiData,
      provenanceData,
      crossRefData,
      classificationData,
      organisationData,
      successorCrossRefData,
      noteData
    );

    sandboxContext.onUpdateAndClear("currentProperty", newPropertyData, clearType);
  };

  /**
   * Event to update the ESU record with new data.
   *
   * @returns
   */
  const updateEsuData = () => {
    if (!sandboxContext.currentSandbox.currentStreetRecords.esu) return;

    const newEsus = sandboxContext.currentSandbox.currentStreet.esus.map(
      (x) => [sandboxContext.currentSandbox.currentStreetRecords.esu].find((esu) => esu.pkId === x.pkId) || x
    );

    setAssociatedStreetDataAndClear(
      newEsus,
      sandboxContext.currentSandbox.currentStreet.successorCrossRefs,
      sandboxContext.currentSandbox.currentStreet.streetDescriptors,
      sandboxContext.currentSandbox.currentStreet.streetNotes,
      sandboxContext.currentSandbox.currentStreet.maintenanceResponsibilities,
      sandboxContext.currentSandbox.currentStreet.reinstatementCategories,
      sandboxContext.currentSandbox.currentStreet.osSpecialDesignations,
      sandboxContext.currentSandbox.currentStreet.interests,
      sandboxContext.currentSandbox.currentStreet.constructions,
      sandboxContext.currentSandbox.currentStreet.specialDesignations,
      sandboxContext.currentSandbox.currentStreet.publicRightOfWays,
      sandboxContext.currentSandbox.currentStreet.heightWidthWeights,
      "esu"
    );
  };

  /**
   * Event to update the successor cross reference record with new data.
   *
   * @returns
   */
  const updateSuccessorCrossRefData = () => {
    if (!sandboxContext.currentSandbox.currentStreetRecords.successorCrossRef) return;

    const newSuccessorCrossRefs = sandboxContext.currentSandbox.currentStreet.successorCrossRefs.map(
      (x) =>
        [sandboxContext.currentSandbox.currentStreetRecords.successorCrossRef].find(
          (successorCrossRef) => successorCrossRef.pkId === x.pkId
        ) || x
    );

    setAssociatedStreetDataAndClear(
      sandboxContext.currentSandbox.currentStreet.esus,
      newSuccessorCrossRefs,
      sandboxContext.currentSandbox.currentStreet.streetDescriptors,
      sandboxContext.currentSandbox.currentStreet.streetNotes,
      sandboxContext.currentSandbox.currentStreet.maintenanceResponsibilities,
      sandboxContext.currentSandbox.currentStreet.reinstatementCategories,
      sandboxContext.currentSandbox.currentStreet.osSpecialDesignations,
      null,
      null,
      null,
      null,
      null,
      "successorCrossRef"
    );
  };

  /**
   * Event to update the descriptor record with new data.
   *
   * @returns
   */
  const updateStreetDescriptorData = () => {
    if (!sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor) return;

    const newStreetDescriptors = sandboxContext.currentSandbox.currentStreet.streetDescriptors.map(
      (x) =>
        [sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor].find(
          (descriptor) => descriptor.pkId === x.pkId
        ) || x
    );

    setAssociatedStreetDataAndClear(
      sandboxContext.currentSandbox.currentStreet.esus,
      sandboxContext.currentSandbox.currentStreet.successorCrossRefs,
      newStreetDescriptors,
      sandboxContext.currentSandbox.currentStreet.streetNotes,
      sandboxContext.currentSandbox.currentStreet.maintenanceResponsibilities,
      sandboxContext.currentSandbox.currentStreet.reinstatementCategories,
      sandboxContext.currentSandbox.currentStreet.osSpecialDesignations,
      sandboxContext.currentSandbox.currentStreet.interests,
      sandboxContext.currentSandbox.currentStreet.constructions,
      sandboxContext.currentSandbox.currentStreet.specialDesignations,
      sandboxContext.currentSandbox.currentStreet.publicRightOfWays,
      sandboxContext.currentSandbox.currentStreet.heightWidthWeights,
      "descriptor"
    );
  };

  /**
   * Event to update the one-way exemption record with new data.
   *
   * @returns
   */
  const updateOneWayExemptionData = () => {
    if (!sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption) return;

    let newEsus = sandboxContext.currentSandbox.currentStreet.esus.filter(
      (X) => X.esuId !== sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption.esuId
    );
    const existingEsu = sandboxContext.currentSandbox.currentStreet.esus.filter(
      (X) => X.esuId === sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption.esuId
    );

    let newOneWayExemptions = existingEsu[0].oneWayExemptions.filter(
      (x) => x.pkId !== sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption.pkId
    );

    const updatedOneWayExemption = {
      changeType: sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption.changeType,
      oneWayExemptionType: sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption.oneWayExemptionType,
      recordEndDate: sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption.recordEndDate,
      oneWayExemptionStartDate:
        sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption.oneWayExemptionStartDate,
      oneWayExemptionEndDate: sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption.oneWayExemptionEndDate,
      oneWayExemptionStartTime:
        sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption.oneWayExemptionStartTime,
      oneWayExemptionEndTime: sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption.oneWayExemptionEndTime,
      oneWayExemptionPeriodicityCode:
        sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption.oneWayExemptionPeriodicityCode,
      pkId: sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption.pkId,
      esuId: sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption.esuId,
      seqNum: sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption.seqNum,
    };
    newOneWayExemptions.push(updatedOneWayExemption);

    const updatedEsu = {
      entryDate: sandboxContext.currentSandbox.currentStreetRecords.esu
        ? sandboxContext.currentSandbox.currentStreetRecords.esu.entryDate
        : existingEsu[0].entryDate,
      changeType: existingEsu[0].changeType,
      esuVersionNumber: existingEsu[0].esuVersionNumber,
      numCoordCount: existingEsu[0].numCoordCount,
      esuTolerance: sandboxContext.currentSandbox.currentStreetRecords.esu
        ? sandboxContext.currentSandbox.currentStreetRecords.esu.esuTolerance
        : existingEsu[0].esuTolerance,
      esuStartDate: sandboxContext.currentSandbox.currentStreetRecords.esu
        ? sandboxContext.currentSandbox.currentStreetRecords.esu.esuStartDate
        : existingEsu[0].esuStartDate,
      esuEndDate: sandboxContext.currentSandbox.currentStreetRecords.esu
        ? sandboxContext.currentSandbox.currentStreetRecords.esu.esuEndDate
        : existingEsu[0].esuEndDate,
      esuDirection: sandboxContext.currentSandbox.currentStreetRecords.esu
        ? sandboxContext.currentSandbox.currentStreetRecords.esu.esuDirection
        : existingEsu[0].esuDirection,
      wktGeometry: existingEsu[0].wktGeometry,
      pkId: existingEsu[0].pkId,
      esuId: existingEsu[0].esuId,
      highwayDedications: existingEsu[0].highwayDedications,
      oneWayExemptions: newOneWayExemptions,
    };
    newEsus.push(updatedEsu);

    const newStreetData = !hasASD
      ? {
          changeType: sandboxContext.currentSandbox.currentStreet.changeType,
          usrn: sandboxContext.currentSandbox.currentStreet.usrn,
          swaOrgRefNaming: sandboxContext.currentSandbox.currentStreet.swaOrgRefNaming,
          streetSurface: sandboxContext.currentSandbox.currentStreet.streetSurface,
          streetStartDate: sandboxContext.currentSandbox.currentStreet.streetStartDate,
          streetEndDate: sandboxContext.currentSandbox.currentStreet.streetEndDate,
          neverExport: sandboxContext.currentSandbox.currentStreet.neverExport,
          version: sandboxContext.currentSandbox.currentStreet.version,
          recordType: sandboxContext.currentSandbox.currentStreet.recordType,
          state: sandboxContext.currentSandbox.currentStreet.state,
          stateDate: sandboxContext.currentSandbox.currentStreet.stateDate,
          streetClassification: sandboxContext.currentSandbox.currentStreet.streetClassification,
          streetTolerance: sandboxContext.currentSandbox.currentStreet.streetTolerance,
          streetStartX: sandboxContext.currentSandbox.currentStreet.streetStartX,
          streetStartY: sandboxContext.currentSandbox.currentStreet.streetStartY,
          streetEndX: sandboxContext.currentSandbox.currentStreet.streetEndX,
          streetEndY: sandboxContext.currentSandbox.currentStreet.streetEndY,
          pkId: sandboxContext.currentSandbox.currentStreet.pkId,
          lastUpdateDate: sandboxContext.currentSandbox.currentStreet.lastUpdateDate,
          entryDate: sandboxContext.currentSandbox.currentStreet.entryDate,
          streetLastUpdated: sandboxContext.currentSandbox.currentStreet.streetLastUpdated,
          streetLastUser: sandboxContext.currentSandbox.currentStreet.streetLastUser,
          relatedPropertyCount: sandboxContext.currentSandbox.currentStreet.relatedPropertyCount,
          relatedStreetCount: sandboxContext.currentSandbox.currentStreet.relatedStreetCount,
          esus: newEsus,
          streetDescriptors: sandboxContext.currentSandbox.currentStreet.streetDescriptors,
          streetNotes: sandboxContext.currentSandbox.currentStreet.streetNotes,
        }
      : {
          changeType: sandboxContext.currentSandbox.currentStreet.changeType,
          usrn: sandboxContext.currentSandbox.currentStreet.usrn,
          swaOrgRefNaming: sandboxContext.currentSandbox.currentStreet.swaOrgRefNaming,
          streetSurface: sandboxContext.currentSandbox.currentStreet.streetSurface,
          streetStartDate: sandboxContext.currentSandbox.currentStreet.streetStartDate,
          streetEndDate: sandboxContext.currentSandbox.currentStreet.streetEndDate,
          neverExport: sandboxContext.currentSandbox.currentStreet.neverExport,
          version: sandboxContext.currentSandbox.currentStreet.version,
          recordType: sandboxContext.currentSandbox.currentStreet.recordType,
          state: sandboxContext.currentSandbox.currentStreet.state,
          stateDate: sandboxContext.currentSandbox.currentStreet.stateDate,
          streetClassification: sandboxContext.currentSandbox.currentStreet.streetClassification,
          streetTolerance: sandboxContext.currentSandbox.currentStreet.streetTolerance,
          streetStartX: sandboxContext.currentSandbox.currentStreet.streetStartX,
          streetStartY: sandboxContext.currentSandbox.currentStreet.streetStartY,
          streetEndX: sandboxContext.currentSandbox.currentStreet.streetEndX,
          streetEndY: sandboxContext.currentSandbox.currentStreet.streetEndY,
          pkId: sandboxContext.currentSandbox.currentStreet.pkId,
          lastUpdateDate: sandboxContext.currentSandbox.currentStreet.lastUpdateDate,
          entryDate: sandboxContext.currentSandbox.currentStreet.entryDate,
          streetLastUpdated: sandboxContext.currentSandbox.currentStreet.streetLastUpdated,
          streetLastUser: sandboxContext.currentSandbox.currentStreet.streetLastUser,
          relatedPropertyCount: sandboxContext.currentSandbox.currentStreet.relatedPropertyCount,
          relatedStreetCount: sandboxContext.currentSandbox.currentStreet.relatedStreetCount,
          esus: newEsus,
          streetDescriptors: sandboxContext.currentSandbox.currentStreet.streetDescriptors,
          streetNotes: sandboxContext.currentSandbox.currentStreet.streetNotes,
          interests: sandboxContext.currentSandbox.currentStreet.interests,
          constructions: sandboxContext.currentSandbox.currentStreet.constructions,
          specialDesignations: sandboxContext.currentSandbox.currentStreet.specialDesignations,
          publicRightOfWays: sandboxContext.currentSandbox.currentStreet.publicRightOfWays,
          heightWidthWeights: sandboxContext.currentSandbox.currentStreet.heightWidthWeights,
        };

    sandboxContext.onSandboxChange("currentStreet", newStreetData);
    sandboxContext.onSandboxChange("esu", updatedEsu);
  };

  /**
   * Event to update the highway dedication record with new data.
   *
   * @returns
   */
  const updateHighwayDedicationData = () => {
    if (!sandboxContext.currentSandbox.currentStreetRecords.highwayDedication) return;

    let newEsus = sandboxContext.currentSandbox.currentStreet.esus.filter(
      (x) => x.esuId !== sandboxContext.currentSandbox.currentStreetRecords.highwayDedication.esuId
    );
    const existingEsu = sandboxContext.currentSandbox.currentStreet.esus.filter(
      (x) => x.esuId === sandboxContext.currentSandbox.currentStreetRecords.highwayDedication.esuId
    );

    let newHighwayDedications = existingEsu[0].highwayDedications.filter(
      (x) => x.pkId !== sandboxContext.currentSandbox.currentStreetRecords.highwayDedication.pkId
    );

    const updatedHighwayDedication = {
      changeType: sandboxContext.currentSandbox.currentStreetRecords.highwayDedication.changeType,
      highwayDedicationCode: sandboxContext.currentSandbox.currentStreetRecords.highwayDedication.highwayDedicationCode,
      recordEndDate: sandboxContext.currentSandbox.currentStreetRecords.highwayDedication.recordEndDate,
      hdStartDate: sandboxContext.currentSandbox.currentStreetRecords.highwayDedication.hdStartDate,
      hdEndDate: sandboxContext.currentSandbox.currentStreetRecords.highwayDedication.hdEndDate,
      hdSeasonalStartDate: sandboxContext.currentSandbox.currentStreetRecords.highwayDedication.hdSeasonalStartDate,
      hdSeasonalEndDate: sandboxContext.currentSandbox.currentStreetRecords.highwayDedication.hdSeasonalEndDate,
      hdStartTime: sandboxContext.currentSandbox.currentStreetRecords.highwayDedication.hdStartTime,
      hdEndTime: sandboxContext.currentSandbox.currentStreetRecords.highwayDedication.hdEndTime,
      hdProw: sandboxContext.currentSandbox.currentStreetRecords.highwayDedication.hdProw,
      hdNcr: sandboxContext.currentSandbox.currentStreetRecords.highwayDedication.hdNcr,
      hdQuietRoute: sandboxContext.currentSandbox.currentStreetRecords.highwayDedication.hdQuietRoute,
      hdObstruction: sandboxContext.currentSandbox.currentStreetRecords.highwayDedication.hdObstruction,
      hdPlanningOrder: sandboxContext.currentSandbox.currentStreetRecords.highwayDedication.hdPlanningOrder,
      hdVehiclesProhibited: sandboxContext.currentSandbox.currentStreetRecords.highwayDedication.hdVehiclesProhibited,
      pkId: sandboxContext.currentSandbox.currentStreetRecords.highwayDedication.pkId,
      esuId: sandboxContext.currentSandbox.currentStreetRecords.highwayDedication.esuId,
      seqNum: sandboxContext.currentSandbox.currentStreetRecords.highwayDedication.seqNum,
    };
    newHighwayDedications.push(updatedHighwayDedication);

    const updatedEsu = {
      entryDate: sandboxContext.currentSandbox.currentStreetRecords.esu
        ? sandboxContext.currentSandbox.currentStreetRecords.esu.entryDate
        : existingEsu[0].entryDate,
      changeType: existingEsu[0].changeType,
      esuVersionNumber: existingEsu[0].esuVersionNumber,
      numCoordCount: existingEsu[0].numCoordCount,
      esuTolerance: sandboxContext.currentSandbox.currentStreetRecords.esu
        ? sandboxContext.currentSandbox.currentStreetRecords.esu.esuTolerance
        : existingEsu[0].esuTolerance,
      esuStartDate: sandboxContext.currentSandbox.currentStreetRecords.esu
        ? sandboxContext.currentSandbox.currentStreetRecords.esu.esuStartDate
        : existingEsu[0].esuStartDate,
      esuEndDate: sandboxContext.currentSandbox.currentStreetRecords.esu
        ? sandboxContext.currentSandbox.currentStreetRecords.esu.esuEndDate
        : existingEsu[0].esuEndDate,
      esuDirection: sandboxContext.currentSandbox.currentStreetRecords.esu
        ? sandboxContext.currentSandbox.currentStreetRecords.esu.esuDirection
        : existingEsu[0].esuDirection,
      wktGeometry: existingEsu[0].wktGeometry,
      pkId: existingEsu[0].pkId,
      esuId: existingEsu[0].esuId,
      highwayDedications: newHighwayDedications,
      oneWayExemptions: existingEsu[0].oneWayExemptions,
    };
    newEsus.push(updatedEsu);

    const newStreetData = !hasASD
      ? {
          changeType: sandboxContext.currentSandbox.currentStreet.changeType,
          usrn: sandboxContext.currentSandbox.currentStreet.usrn,
          swaOrgRefNaming: sandboxContext.currentSandbox.currentStreet.swaOrgRefNaming,
          streetSurface: sandboxContext.currentSandbox.currentStreet.streetSurface,
          streetStartDate: sandboxContext.currentSandbox.currentStreet.streetStartDate,
          streetEndDate: sandboxContext.currentSandbox.currentStreet.streetEndDate,
          neverExport: sandboxContext.currentSandbox.currentStreet.neverExport,
          version: sandboxContext.currentSandbox.currentStreet.version,
          recordType: sandboxContext.currentSandbox.currentStreet.recordType,
          state: sandboxContext.currentSandbox.currentStreet.state,
          stateDate: sandboxContext.currentSandbox.currentStreet.stateDate,
          streetClassification: sandboxContext.currentSandbox.currentStreet.streetClassification,
          streetTolerance: sandboxContext.currentSandbox.currentStreet.streetTolerance,
          streetStartX: sandboxContext.currentSandbox.currentStreet.streetStartX,
          streetStartY: sandboxContext.currentSandbox.currentStreet.streetStartY,
          streetEndX: sandboxContext.currentSandbox.currentStreet.streetEndX,
          streetEndY: sandboxContext.currentSandbox.currentStreet.streetEndY,
          pkId: sandboxContext.currentSandbox.currentStreet.pkId,
          lastUpdateDate: sandboxContext.currentSandbox.currentStreet.lastUpdateDate,
          entryDate: sandboxContext.currentSandbox.currentStreet.entryDate,
          streetLastUpdated: sandboxContext.currentSandbox.currentStreet.streetLastUpdated,
          streetLastUser: sandboxContext.currentSandbox.currentStreet.streetLastUser,
          relatedPropertyCount: sandboxContext.currentSandbox.currentStreet.relatedPropertyCount,
          relatedStreetCount: sandboxContext.currentSandbox.currentStreet.relatedStreetCount,
          esus: newEsus,
          streetDescriptors: sandboxContext.currentSandbox.currentStreet.streetDescriptors,
          streetNotes: sandboxContext.currentSandbox.currentStreet.streetNotes,
        }
      : {
          changeType: sandboxContext.currentSandbox.currentStreet.changeType,
          usrn: sandboxContext.currentSandbox.currentStreet.usrn,
          swaOrgRefNaming: sandboxContext.currentSandbox.currentStreet.swaOrgRefNaming,
          streetSurface: sandboxContext.currentSandbox.currentStreet.streetSurface,
          streetStartDate: sandboxContext.currentSandbox.currentStreet.streetStartDate,
          streetEndDate: sandboxContext.currentSandbox.currentStreet.streetEndDate,
          neverExport: sandboxContext.currentSandbox.currentStreet.neverExport,
          version: sandboxContext.currentSandbox.currentStreet.version,
          recordType: sandboxContext.currentSandbox.currentStreet.recordType,
          state: sandboxContext.currentSandbox.currentStreet.state,
          stateDate: sandboxContext.currentSandbox.currentStreet.stateDate,
          streetClassification: sandboxContext.currentSandbox.currentStreet.streetClassification,
          streetTolerance: sandboxContext.currentSandbox.currentStreet.streetTolerance,
          streetStartX: sandboxContext.currentSandbox.currentStreet.streetStartX,
          streetStartY: sandboxContext.currentSandbox.currentStreet.streetStartY,
          streetEndX: sandboxContext.currentSandbox.currentStreet.streetEndX,
          streetEndY: sandboxContext.currentSandbox.currentStreet.streetEndY,
          pkId: sandboxContext.currentSandbox.currentStreet.pkId,
          lastUpdateDate: sandboxContext.currentSandbox.currentStreet.lastUpdateDate,
          entryDate: sandboxContext.currentSandbox.currentStreet.entryDate,
          streetLastUpdated: sandboxContext.currentSandbox.currentStreet.streetLastUpdated,
          streetLastUser: sandboxContext.currentSandbox.currentStreet.streetLastUser,
          relatedPropertyCount: sandboxContext.currentSandbox.currentStreet.relatedPropertyCount,
          relatedStreetCount: sandboxContext.currentSandbox.currentStreet.relatedStreetCount,
          esus: newEsus,
          streetDescriptors: sandboxContext.currentSandbox.currentStreet.streetDescriptors,
          streetNotes: sandboxContext.currentSandbox.currentStreet.streetNotes,
          interests: sandboxContext.currentSandbox.currentStreet.interests,
          constructions: sandboxContext.currentSandbox.currentStreet.constructions,
          specialDesignations: sandboxContext.currentSandbox.currentStreet.specialDesignations,
          publicRightOfWays: sandboxContext.currentSandbox.currentStreet.publicRightOfWays,
          heightWidthWeights: sandboxContext.currentSandbox.currentStreet.heightWidthWeights,
        };

    sandboxContext.onSandboxChange("currentStreet", newStreetData);
    sandboxContext.onSandboxChange("esu", updatedEsu);
  };

  /**
   * Event to update the maintenance responsibility record with new data.
   *
   * @returns
   */
  const updateMaintenanceResponsibilityData = () => {
    if (!sandboxContext.currentSandbox.currentStreetRecords.maintenanceResponsibility) return;

    const newMaintenanceResponsibilities = sandboxContext.currentSandbox.currentStreet.maintenanceResponsibilities.map(
      (x) =>
        [sandboxContext.currentSandbox.currentStreetRecords.maintenanceResponsibility].find(
          (maintenanceResponsibility) => maintenanceResponsibility.pkId === x.pkId
        ) || x
    );

    setAssociatedStreetDataAndClear(
      sandboxContext.currentSandbox.currentStreet.esus,
      sandboxContext.currentSandbox.currentStreet.successorCrossRefs,
      sandboxContext.currentSandbox.currentStreet.streetDescriptors,
      sandboxContext.currentSandbox.currentStreet.streetNotes,
      newMaintenanceResponsibilities,
      sandboxContext.currentSandbox.currentStreet.reinstatementCategories,
      sandboxContext.currentSandbox.currentStreet.osSpecialDesignations,
      null,
      null,
      null,
      null,
      null,
      "maintenanceResponsibility"
    );
  };

  /**
   * Event to update the reinstatement category record with new data.
   *
   * @returns
   */
  const updateReinstatementCategoryData = () => {
    if (!sandboxContext.currentSandbox.currentStreetRecords.reinstatementCategory) return;

    const newReinstatementCategories = sandboxContext.currentSandbox.currentStreet.reinstatementCategories.map(
      (x) =>
        [sandboxContext.currentSandbox.currentStreetRecords.reinstatementCategory].find(
          (reinstatementCategory) => reinstatementCategory.pkId === x.pkId
        ) || x
    );

    setAssociatedStreetDataAndClear(
      sandboxContext.currentSandbox.currentStreet.esus,
      sandboxContext.currentSandbox.currentStreet.successorCrossRefs,
      sandboxContext.currentSandbox.currentStreet.streetDescriptors,
      sandboxContext.currentSandbox.currentStreet.streetNotes,
      sandboxContext.currentSandbox.currentStreet.maintenanceResponsibilities,
      newReinstatementCategories,
      sandboxContext.currentSandbox.currentStreet.osSpecialDesignations,
      null,
      null,
      null,
      null,
      null,
      "reinstatementCategory"
    );
  };

  /**
   * Event to update the special designation (OneScotland) record with new data.
   *
   * @returns
   */
  const updateOsSpecialDesignationData = () => {
    if (!sandboxContext.currentSandbox.currentStreetRecords.specialDesignation) return;

    const newSpecialDesignations = sandboxContext.currentSandbox.currentStreet.specialDesignations.map(
      (x) =>
        [sandboxContext.currentSandbox.currentStreetRecords.specialDesignation].find((sd) => sd.pkId === x.pkId) || x
    );

    setAssociatedStreetDataAndClear(
      sandboxContext.currentSandbox.currentStreet.esus,
      sandboxContext.currentSandbox.currentStreet.successorCrossRefs,
      sandboxContext.currentSandbox.currentStreet.streetDescriptors,
      sandboxContext.currentSandbox.currentStreet.streetNotes,
      sandboxContext.currentSandbox.currentStreet.maintenanceResponsibilities,
      sandboxContext.currentSandbox.currentStreet.reinstatementCategories,
      newSpecialDesignations,
      null,
      null,
      null,
      null,
      null,
      "specialDesignations"
    );
  };

  /**
   * Event to update the interest record with new data.
   *
   * @returns
   */
  const updateInterestData = () => {
    if (!sandboxContext.currentSandbox.currentStreetRecords.interest) return;

    const newInterests = sandboxContext.currentSandbox.currentStreet.interests.map(
      (x) =>
        [sandboxContext.currentSandbox.currentStreetRecords.interest].find((interest) => interest.pkId === x.pkId) || x
    );

    setAssociatedStreetDataAndClear(
      sandboxContext.currentSandbox.currentStreet.esus,
      null,
      sandboxContext.currentSandbox.currentStreet.streetDescriptors,
      sandboxContext.currentSandbox.currentStreet.streetNotes,
      null,
      null,
      null,
      newInterests,
      sandboxContext.currentSandbox.currentStreet.constructions,
      sandboxContext.currentSandbox.currentStreet.specialDesignations,
      sandboxContext.currentSandbox.currentStreet.publicRightOfWays,
      sandboxContext.currentSandbox.currentStreet.heightWidthWeights,
      "interest"
    );
  };

  /**
   * Event to update the construction record with new data.
   *
   * @returns
   */
  const updateConstructionData = () => {
    if (!sandboxContext.currentSandbox.currentStreetRecords.construction) return;

    const newConstructions = sandboxContext.currentSandbox.currentStreet.constructions.map(
      (x) =>
        [sandboxContext.currentSandbox.currentStreetRecords.construction].find(
          (construction) => construction.pkId === x.pkId
        ) || x
    );

    setAssociatedStreetDataAndClear(
      sandboxContext.currentSandbox.currentStreet.esus,
      null,
      sandboxContext.currentSandbox.currentStreet.streetDescriptors,
      sandboxContext.currentSandbox.currentStreet.streetNotes,
      null,
      null,
      null,
      sandboxContext.currentSandbox.currentStreet.interests,
      newConstructions,
      sandboxContext.currentSandbox.currentStreet.specialDesignations,
      sandboxContext.currentSandbox.currentStreet.publicRightOfWays,
      sandboxContext.currentSandbox.currentStreet.heightWidthWeights,
      "construction"
    );
  };

  /**
   * Event to update the special designation (GeoPlace) record with new data.
   *
   * @returns
   */
  const updateSpecialDesignationData = () => {
    if (!sandboxContext.currentSandbox.currentStreetRecords.specialDesignation) return;

    const newSpecialDesignations = sandboxContext.currentSandbox.currentStreet.specialDesignations.map(
      (x) =>
        [sandboxContext.currentSandbox.currentStreetRecords.specialDesignation].find((sd) => sd.pkId === x.pkId) || x
    );

    setAssociatedStreetDataAndClear(
      sandboxContext.currentSandbox.currentStreet.esus,
      null,
      sandboxContext.currentSandbox.currentStreet.streetDescriptors,
      sandboxContext.currentSandbox.currentStreet.streetNotes,
      null,
      null,
      null,
      sandboxContext.currentSandbox.currentStreet.interests,
      sandboxContext.currentSandbox.currentStreet.constructions,
      newSpecialDesignations,
      sandboxContext.currentSandbox.currentStreet.publicRightOfWays,
      sandboxContext.currentSandbox.currentStreet.heightWidthWeights,
      "specialDesignation"
    );
  };

  /**
   * Event to update the height, width & weight record with new data.
   *
   * @returns
   */
  const updateHwwData = () => {
    if (!sandboxContext.currentSandbox.currentStreetRecords.hww) return;

    const newHeightWidthWeights = sandboxContext.currentSandbox.currentStreet.heightWidthWeights.map(
      (x) => [sandboxContext.currentSandbox.currentStreetRecords.hww].find((hww) => hww.pkId === x.pkId) || x
    );

    setAssociatedStreetDataAndClear(
      sandboxContext.currentSandbox.currentStreet.esus,
      null,
      sandboxContext.currentSandbox.currentStreet.streetDescriptors,
      sandboxContext.currentSandbox.currentStreet.streetNotes,
      null,
      null,
      null,
      sandboxContext.currentSandbox.currentStreet.interests,
      sandboxContext.currentSandbox.currentStreet.constructions,
      sandboxContext.currentSandbox.currentStreet.specialDesignations,
      sandboxContext.currentSandbox.currentStreet.publicRightOfWays,
      newHeightWidthWeights,
      "hww"
    );
  };

  /**
   * Event to update the public rights of way record with new data.
   *
   * @returns
   */
  const updateProwData = () => {
    if (!sandboxContext.currentSandbox.currentStreetRecords.prow) return;

    const newPublicRightOfWays = sandboxContext.currentSandbox.currentStreet.publicRightOfWays.map(
      (x) => [sandboxContext.currentSandbox.currentStreetRecords.prow].find((prow) => prow.pkId === x.pkId) || x
    );

    setAssociatedStreetDataAndClear(
      sandboxContext.currentSandbox.currentStreet.esus,
      null,
      sandboxContext.currentSandbox.currentStreet.streetDescriptors,
      sandboxContext.currentSandbox.currentStreet.streetNotes,
      null,
      null,
      null,
      sandboxContext.currentSandbox.currentStreet.interests,
      sandboxContext.currentSandbox.currentStreet.constructions,
      sandboxContext.currentSandbox.currentStreet.specialDesignations,
      newPublicRightOfWays,
      sandboxContext.currentSandbox.currentStreet.heightWidthWeights,
      "prow"
    );
  };

  /**
   * Event to update the note (street) record with new data.
   *
   * @returns
   */
  const updateStreetNoteData = () => {
    if (!sandboxContext.currentSandbox.currentStreetRecords.note) return;

    const newNotes = sandboxContext.currentSandbox.currentStreet.notes.map(
      (x) => [sandboxContext.currentSandbox.currentStreetRecords.note].find((note) => note.pkId === x.pkId) || x
    );

    setAssociatedStreetDataAndClear(
      sandboxContext.currentSandbox.currentStreet.esus,
      sandboxContext.currentSandbox.currentStreet.successorCrossRefs,
      sandboxContext.currentSandbox.currentStreet.streetDescriptors,
      newNotes,
      sandboxContext.currentSandbox.currentStreet.maintenanceResponsibilities,
      sandboxContext.currentSandbox.currentStreet.reinstatementCategories,
      sandboxContext.currentSandbox.currentStreet.osSpecialDesignations,
      sandboxContext.currentSandbox.currentStreet.interests,
      sandboxContext.currentSandbox.currentStreet.constructions,
      sandboxContext.currentSandbox.currentStreet.specialDesignations,
      sandboxContext.currentSandbox.currentStreet.publicRightOfWays,
      sandboxContext.currentSandbox.currentStreet.heightWidthWeights,
      "streetNote"
    );
  };

  /**
   * Event to update the provenance record with new data.
   *
   * @returns
   */
  const updateProvenanceData = () => {
    if (!sandboxContext.currentSandbox.currentPropertyRecords.provenance) return;

    const newProvenances = sandboxContext.currentSandbox.currentProperty.blpuProvenances.map(
      (x) =>
        [sandboxContext.currentSandbox.currentPropertyRecords.provenance].find(
          (provenance) => provenance.pkId === x.pkId
        ) || x
    );

    setAssociatedPropertyDataAndClear(
      sandboxContext.currentSandbox.currentProperty.lpis,
      newProvenances,
      sandboxContext.currentSandbox.currentProperty.blpuAppCrossRefs,
      sandboxContext.currentSandbox.currentProperty.classifications,
      sandboxContext.currentSandbox.currentProperty.organisations,
      sandboxContext.currentSandbox.currentProperty.successorCrossRefs,
      sandboxContext.currentSandbox.currentProperty.blpuNotes,
      "provenance"
    );
  };

  /**
   * Event to update the cross reference record with new data.
   *
   * @returns
   */
  const updateCrossRefData = () => {
    if (!sandboxContext.currentSandbox.currentProperty.blpuAppCrossRefs) return;

    const newCrossRefs = sandboxContext.currentSandbox.currentProperty.blpuAppCrossRefs.map(
      (x) => [sandboxContext.currentSandbox.currentProperty.blpuAppCrossRefs].find((xRef) => xRef.pkId === x.pkId) || x
    );

    setAssociatedPropertyDataAndClear(
      sandboxContext.currentSandbox.currentProperty.lpis,
      sandboxContext.currentSandbox.currentProperty.blpuProvenances,
      newCrossRefs,
      sandboxContext.currentSandbox.currentProperty.classifications,
      sandboxContext.currentSandbox.currentProperty.organisations,
      sandboxContext.currentSandbox.currentProperty.successorCrossRefs,
      sandboxContext.currentSandbox.currentProperty.blpuNotes,
      "appCrossRef"
    );
  };

  /**
   * Event to update the classification record with new data.
   *
   * @returns
   */
  const updateClassificationData = () => {
    if (!sandboxContext.currentSandbox.currentProperty.classifications) return;

    const newClassifications = sandboxContext.currentSandbox.currentProperty.classifications.map(
      (x) =>
        [sandboxContext.currentSandbox.currentProperty.classification].find(
          (classification) => classification.pkId === x.pkId
        ) || x
    );

    setAssociatedPropertyDataAndClear(
      sandboxContext.currentSandbox.currentProperty.lpis,
      sandboxContext.currentSandbox.currentProperty.blpuProvenances,
      sandboxContext.currentSandbox.currentProperty.blpuAppCrossRefs,
      newClassifications,
      sandboxContext.currentSandbox.currentProperty.organisations,
      sandboxContext.currentSandbox.currentProperty.successorCrossRefs,
      sandboxContext.currentSandbox.currentProperty.blpuNotes,
      "classification"
    );
  };

  /**
   * Event to update the organisation record with new data.
   *
   * @returns
   */
  const updateOrganisationData = () => {
    if (!sandboxContext.currentSandbox.currentProperty.organisations) return;

    const newOrganisations = sandboxContext.currentSandbox.currentProperty.organisations.map(
      (x) =>
        [sandboxContext.currentSandbox.currentProperty.organisation].find(
          (organisation) => organisation.pkId === x.pkId
        ) || x
    );

    setAssociatedPropertyDataAndClear(
      sandboxContext.currentSandbox.currentProperty.lpis,
      sandboxContext.currentSandbox.currentProperty.blpuProvenances,
      sandboxContext.currentSandbox.currentProperty.blpuAppCrossRefs,
      sandboxContext.currentSandbox.currentProperty.classifications,
      newOrganisations,
      sandboxContext.currentSandbox.currentProperty.successorCrossRefs,
      sandboxContext.currentSandbox.currentProperty.blpuNotes,
      "classification"
    );
  };

  /**
   * Event to update the lpi record with new data.
   *
   * @returns
   */
  const updateLpiData = () => {
    if (!sandboxContext.currentSandbox.currentPropertyRecords.lpi) return;

    let newLpis = null;

    if (settingsContext.isWelsh) {
      const secondLanguage =
        sandboxContext.currentSandbox.currentPropertyRecords.lpi.language === "ENG" ? "CYM" : "ENG";

      let secondLpi = null;
      if (sandboxContext.currentSandbox.currentPropertyRecords.lpi.dualLanguageLink === 0) {
        const bilingualId = getBilingualSource(lookupContext);
        const linkXRef = sandboxContext.currentSandbox.currentProperty.blpuAppCrossRefs.find(
          (x) =>
            x.sourceId === bilingualId &&
            x.crossReference.includes(sandboxContext.currentSandbox.currentPropertyRecords.lpi.lpiKey)
        );
        secondLpi = sandboxContext.currentSandbox.currentProperty.lpis.find(
          (x) =>
            x.lpiKey ===
            linkXRef.crossReference.replace(sandboxContext.currentSandbox.currentPropertyRecords.lpi.lpiKey, "")
        );
      } else {
        secondLpi = sandboxContext.currentSandbox.currentProperty.lpis.find(
          (x) =>
            x.dualLanguageLink === sandboxContext.currentSandbox.currentPropertyRecords.lpi.dualLanguageLink &&
            x.language === secondLanguage
        );
      }
      const secondPostTown = lookupContext.currentLookups.postTowns.find(
        (x) =>
          x.linkedRef === sandboxContext.currentSandbox.currentPropertyRecords.lpi.postTownRef &&
          x.language === secondLpi.language
      );
      const newSecondLpi = {
        level: sandboxContext.currentSandbox.currentPropertyRecords.lpi.level,
        postalAddress: sandboxContext.currentSandbox.currentPropertyRecords.lpi.postalAddress,
        custodianOne: secondLpi.custodianOne,
        custodianTwo: secondLpi.custodianTwo,
        canKey: secondLpi.canKey,
        pkId: secondLpi.pkId,
        changeType: secondLpi.changeType,
        uprn: secondLpi.uprn,
        lpiKey: secondLpi.lpiKey,
        language: secondLpi.language,
        logicalStatus: sandboxContext.currentSandbox.currentPropertyRecords.lpi.logicalStatus,
        startDate: sandboxContext.currentSandbox.currentPropertyRecords.lpi.startDate,
        endDate: sandboxContext.currentSandbox.currentPropertyRecords.lpi.endDate,
        entryDate: secondLpi.entryDate,
        lastUpdateDate: secondLpi.lastUpdateDate,
        saoStartNumber:
          secondLpi && secondLpi.saoStartNumber
            ? secondLpi.saoStartNumber
            : sandboxContext.currentSandbox.currentPropertyRecords.lpi.saoStartNumber,
        saoStartSuffix:
          secondLpi && secondLpi.saoStartSuffix
            ? secondLpi.saoStartSuffix
            : sandboxContext.currentSandbox.currentPropertyRecords.lpi.saoStartSuffix,
        saoEndNumber:
          secondLpi && secondLpi.saoEndNumber
            ? secondLpi.saoEndNumber
            : sandboxContext.currentSandbox.currentPropertyRecords.lpi.saoEndNumber,
        saoEndSuffix:
          secondLpi && secondLpi.saoEndSuffix
            ? secondLpi.saoEndSuffix
            : sandboxContext.currentSandbox.currentPropertyRecords.lpi.saoEndSuffix,
        saoText:
          secondLpi && secondLpi.saoText
            ? secondLpi.saoText
            : sandboxContext.currentSandbox.currentPropertyRecords.lpi.saoText,
        paoStartNumber:
          secondLpi && secondLpi.paoStartNumber
            ? secondLpi.paoStartNumber
            : sandboxContext.currentSandbox.currentPropertyRecords.lpi.paoStartNumber,
        paoStartSuffix:
          secondLpi && secondLpi.paoStartSuffix
            ? secondLpi.paoStartSuffix
            : sandboxContext.currentSandbox.currentPropertyRecords.lpi.paoStartSuffix,
        paoEndNumber:
          secondLpi && secondLpi.paoEndNumber
            ? secondLpi.paoEndNumber
            : sandboxContext.currentSandbox.currentPropertyRecords.lpi.paoEndNumber,
        paoEndSuffix:
          secondLpi && secondLpi.paoEndSuffix
            ? secondLpi.paoEndSuffix
            : sandboxContext.currentSandbox.currentPropertyRecords.lpi.paoEndSuffix,
        paoText:
          secondLpi && secondLpi.paoText
            ? secondLpi.paoText
            : sandboxContext.currentSandbox.currentPropertyRecords.lpi.paoText,
        usrn: sandboxContext.currentSandbox.currentPropertyRecords.lpi.usrn,
        postcodeRef: sandboxContext.currentSandbox.currentPropertyRecords.lpi.postcodeRef,
        postTownRef: secondPostTown ? secondPostTown.postTownRef : null,
        officialFlag: sandboxContext.currentSandbox.currentPropertyRecords.lpi.officialFlag,
        neverExport: sandboxContext.currentSandbox.currentPropertyRecords.lpi.neverExport,
        address: secondLpi.address,
        postTown: secondPostTown ? secondPostTown.postTown : null,
        postcode: sandboxContext.currentSandbox.currentPropertyRecords.lpi.postcode,
        lastUpdated: secondLpi.lastUpdated,
        lastUser: secondLpi.lastUser,
        dualLanguageLink: secondLpi.dualLanguageLink,
      };

      newLpis = sandboxContext.currentSandbox.currentProperty.lpis.map(
        (x) =>
          [sandboxContext.currentSandbox.currentPropertyRecords.lpi].find((lpi) => lpi.pkId === x.pkId) ||
          [newSecondLpi].find((lpi) => lpi.pkId === x.pkId) ||
          x
      );
    } else {
      newLpis = sandboxContext.currentSandbox.currentProperty.lpis.map(
        (x) => [sandboxContext.currentSandbox.currentPropertyRecords.lpi].find((lpi) => lpi.pkId === x.pkId) || x
      );
    }

    if (newLpis && newLpis.length > 0) {
      setAssociatedPropertyDataAndClear(
        newLpis,
        sandboxContext.currentSandbox.currentProperty.blpuProvenances,
        sandboxContext.currentSandbox.currentProperty.blpuAppCrossRefs,
        sandboxContext.currentSandbox.currentProperty.classifications,
        sandboxContext.currentSandbox.currentProperty.organisations,
        sandboxContext.currentSandbox.currentProperty.successorCrossRefs,
        sandboxContext.currentSandbox.currentProperty.blpuNotes,
        "lpi"
      );
    }
  };

  /**
   * Event to update the note (property) record with new data.
   *
   * @returns
   */
  const updatePropertyNoteData = () => {
    if (!sandboxContext.currentSandbox.currentPropertyRecords.note) return;

    const newNotes = sandboxContext.currentSandbox.currentProperty.blpuNotes.map(
      (x) => [sandboxContext.currentSandbox.currentPropertyRecords.note].find((xRef) => xRef.pkId === x.pkId) || x
    );

    setAssociatedPropertyDataAndClear(
      sandboxContext.currentSandbox.currentProperty.lpis,
      sandboxContext.currentSandbox.currentProperty.blpuProvenances,
      sandboxContext.currentSandbox.currentProperty.blpuAppCrossRefs,
      sandboxContext.currentSandbox.currentProperty.classifications,
      sandboxContext.currentSandbox.currentProperty.organisations,
      sandboxContext.currentSandbox.currentProperty.successorCrossRefs,
      newNotes,
      "propertyNote"
    );
  };

  /**
   * Event to handle when an error is clicked.
   *
   * @param {number} type The record type of the error clicked.
   * @param {object} error The error object.
   */
  const handleErrorClick = (type, error) => {
    if (
      sandboxContext.currentSandbox.sourceStreet &&
      (type !== streetContext.currentRecord.type || (type !== 11 && error.index !== streetContext.currentRecord.index))
    ) {
      const streetChanged =
        streetContext.currentStreet.newStreet ||
        (streetContext.currentRecord.type === 15 &&
          sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor &&
          !ObjectComparison(
            sandboxContext.currentSandbox.sourceStreet.streetDescriptors.find(
              (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor.pkId
            ),
            sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor,
            streetDescriptorKeysToIgnore
          )) ||
        (streetContext.currentRecord.type === 13 &&
          sandboxContext.currentSandbox.currentStreetRecords.esu &&
          !ObjectComparison(
            sandboxContext.currentSandbox.sourceStreet.esus.find(
              (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.esu.pkId
            ),
            sandboxContext.currentSandbox.currentStreetRecords.esu,
            esuKeysToIgnore
          )) ||
        (streetContext.currentRecord.type === 17 &&
          sandboxContext.currentSandbox.currentStreetRecords.highwayDedication &&
          !ObjectComparison(
            sandboxContext.currentSandbox.sourceStreet.esus
              .find((x) => x.esuId === sandboxContext.currentSandbox.currentStreetRecords.highwayDedication.esuId)
              .highwayDedications.find(
                (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.highwayDedication.pkId
              ),
            sandboxContext.currentSandbox.currentStreetRecords.highwayDedication,
            highwayDedicationKeysToIgnore
          )) ||
        (streetContext.currentRecord.type === 16 &&
          sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption &&
          !ObjectComparison(
            sandboxContext.currentSandbox.sourceStreet.esus
              .find((x) => x.esuId === sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption.esuId)
              .oneWayExemptions.find(
                (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption.pkId
              ),
            sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption,
            oneWayExemptionKeysToIgnore
          )) ||
        (streetContext.currentRecord.type === 30 &&
          sandboxContext.currentSandbox.currentStreetRecords.successorCrossRef &&
          !ObjectComparison(
            sandboxContext.currentSandbox.sourceStreet.successorCrossRefs.find(
              (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.successorCrossRef.pkId
            ),
            sandboxContext.currentSandbox.currentStreetRecords.successorCrossRef,
            successorCrossRefKeysToIgnore
          )) ||
        (streetContext.currentRecord.type === 51 &&
          sandboxContext.currentSandbox.currentStreetRecords.maintenanceResponsibility &&
          !ObjectComparison(
            sandboxContext.currentSandbox.sourceStreet.maintenanceResponsibilities.find(
              (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.maintenanceResponsibility.pkId
            ),
            sandboxContext.currentSandbox.currentStreetRecords.maintenanceResponsibility,
            maintenanceResponsibilityKeysToIgnore
          )) ||
        (streetContext.currentRecord.type === 52 &&
          sandboxContext.currentSandbox.currentStreetRecords.reinstatementCategory &&
          !ObjectComparison(
            sandboxContext.currentSandbox.sourceStreet.reinstatementCategories.find(
              (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.reinstatementCategory.pkId
            ),
            sandboxContext.currentSandbox.currentStreetRecords.reinstatementCategory,
            reinstatementCategoryKeysToIgnore
          )) ||
        (streetContext.currentRecord.type === 53 &&
          sandboxContext.currentSandbox.currentStreetRecords.osSpecialDesignation &&
          !ObjectComparison(
            sandboxContext.currentSandbox.sourceStreet.specialDesignations.find(
              (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.osSpecialDesignation.pkId
            ),
            sandboxContext.currentSandbox.currentStreetRecords.osSpecialDesignation,
            specialDesignationKeysToIgnore
          )) ||
        (streetContext.currentRecord.type === 61 &&
          sandboxContext.currentSandbox.currentStreetRecords.interest &&
          !ObjectComparison(
            sandboxContext.currentSandbox.sourceStreet.interests.find(
              (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.interest.pkId
            ),
            sandboxContext.currentSandbox.currentStreetRecords.interest,
            interestKeysToIgnore
          )) ||
        (streetContext.currentRecord.type === 62 &&
          sandboxContext.currentSandbox.currentStreetRecords.construction &&
          !ObjectComparison(
            sandboxContext.currentSandbox.sourceStreet.constructions.find(
              (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.construction.pkId
            ),
            sandboxContext.currentSandbox.currentStreetRecords.construction,
            constructionKeysToIgnore
          )) ||
        (streetContext.currentRecord.type === 63 &&
          sandboxContext.currentSandbox.currentStreetRecords.specialDesignation &&
          !ObjectComparison(
            sandboxContext.currentSandbox.sourceStreet.specialDesignations.find(
              (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.specialDesignation.pkId
            ),
            sandboxContext.currentSandbox.currentStreetRecords.specialDesignation,
            specialDesignationKeysToIgnore
          )) ||
        (streetContext.currentRecord.type === 64 &&
          sandboxContext.currentSandbox.currentStreetRecords.hww &&
          !ObjectComparison(
            sandboxContext.currentSandbox.sourceStreet.heightWidthWeights.find(
              (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.hww.pkId
            ),
            sandboxContext.currentSandbox.currentStreetRecords.hww,
            heightWidthWeightKeysToIgnore
          )) ||
        (streetContext.currentRecord.type === 66 &&
          sandboxContext.currentSandbox.currentStreetRecords.prow &&
          !ObjectComparison(
            sandboxContext.currentSandbox.sourceStreet.publicRightOfWays.find(
              (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.prow.pkId
            ),
            sandboxContext.currentSandbox.currentStreetRecords.prow,
            publicRightOfWayKeysToIgnore
          )) ||
        (streetContext.currentRecord.type === 72 &&
          sandboxContext.currentSandbox.currentStreetRecords.note &&
          !ObjectComparison(
            sandboxContext.currentSandbox.sourceStreet.streetNotes.find(
              (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.note.pkId
            ),
            sandboxContext.currentSandbox.currentStreetRecords.note,
            noteKeysToIgnore
          )) ||
        (streetContext.currentRecord.type === 11 &&
          sandboxContext.currentSandbox.currentStreet &&
          !StreetComparison(
            sandboxContext.currentSandbox.sourceStreet,
            sandboxContext.currentSandbox.currentStreet,
            hasASD
          ));

      if (streetChanged) {
        confirmDialog(true)
          .then((result) => {
            if (result === "save") {
              doKeepChanges();
            }
            doErrorClick(type, error);
          })
          .catch(() => {});
      } else {
        doErrorClick(type, error);
      }
    } else if (
      sandboxContext.currentSandbox.sourceProperty &&
      (type !== propertyContext.currentRecord.type ||
        (type !== 21 && error.index !== propertyContext.currentRecord.index))
    ) {
      const propertyChanged =
        propertyContext.currentProperty.newProperty ||
        (propertyContext.currentRecord.type === 24 &&
          sandboxContext.currentSandbox.currentPropertyRecords.lpi &&
          !ObjectComparison(
            sandboxContext.currentSandbox.sourceProperty.lpis.find(
              (x) => x.pkId === sandboxContext.currentSandbox.currentPropertyRecords.lpi.pkId
            ),
            sandboxContext.currentSandbox.currentPropertyRecords.lpi,
            lpiKeysToIgnore
          )) ||
        (propertyContext.currentRecord.type === 23 &&
          sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef &&
          !ObjectComparison(
            sandboxContext.currentSandbox.sourceProperty.blpuAppCrossRefs.find(
              (x) => x.pkId === sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef.pkId
            ),
            sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef,
            blpuAppCrossRefKeysToIgnore
          )) ||
        (propertyContext.currentRecord.type === 22 &&
          sandboxContext.currentSandbox.currentPropertyRecords.provenance &&
          !ObjectComparison(
            sandboxContext.currentSandbox.sourceProperty.blpuProvenances.find(
              (x) => x.pkId === sandboxContext.currentSandbox.currentPropertyRecords.provenance.pkId
            ),
            sandboxContext.currentSandbox.currentPropertyRecords.provenance,
            provenanceKeysToIgnore
          )) ||
        (propertyContext.currentRecord.type === 32 &&
          sandboxContext.currentSandbox.currentPropertyRecords.classification &&
          !ObjectComparison(
            sandboxContext.currentSandbox.sourceProperty.classifications.find(
              (x) => x.pkId === sandboxContext.currentSandbox.currentPropertyRecords.classification.pkId
            ),
            sandboxContext.currentSandbox.currentPropertyRecords.classification,
            classificationKeysToIgnore
          )) ||
        (propertyContext.currentRecord.type === 31 &&
          sandboxContext.currentSandbox.currentPropertyRecords.organisation &&
          !ObjectComparison(
            sandboxContext.currentSandbox.sourceProperty.organisations.find(
              (x) => x.pkId === sandboxContext.currentSandbox.currentPropertyRecords.organisation.pkId
            ),
            sandboxContext.currentSandbox.currentPropertyRecords.organisation,
            organisationKeysToIgnore
          )) ||
        (propertyContext.currentRecord.type === 30 &&
          sandboxContext.currentSandbox.currentPropertyRecords.successorCrossRef &&
          !ObjectComparison(
            sandboxContext.currentSandbox.sourceProperty.successorCrossRefs.find(
              (x) => x.pkId === sandboxContext.currentSandbox.currentPropertyRecords.successorCrossRef.pkId
            ),
            sandboxContext.currentSandbox.currentPropertyRecords.successorCrossRef,
            successorCrossRefKeysToIgnore
          )) ||
        (propertyContext.currentRecord.type === 71 &&
          sandboxContext.currentSandbox.currentPropertyRecords.note &&
          !ObjectComparison(
            sandboxContext.currentSandbox.sourceProperty.blpuNotes.find(
              (x) => x.pkId === sandboxContext.currentSandbox.currentPropertyRecords.note.pkId
            ),
            sandboxContext.currentSandbox.currentPropertyRecords.note,
            noteKeysToIgnore
          )) ||
        (propertyContext.currentRecord.type === 21 &&
          sandboxContext.currentSandbox.currentProperty &&
          !PropertyComparison(
            sandboxContext.currentSandbox.sourceProperty,
            sandboxContext.currentSandbox.currentProperty
          ));

      if (propertyChanged) {
        confirmDialog(true)
          .then((result) => {
            if (result === "save") {
              if (propertyContext.validateData()) {
                doKeepChanges();
                doErrorClick(type, error);
              } else {
                setValidationErrorOpen(true);
              }
            } else {
              doErrorClick(type, error);
            }
          })
          .catch(() => {});
      } else {
        doErrorClick(type, error);
      }
    } else {
      doErrorClick(type, error);
    }
  };

  /**
   * Event to handle when the dialog is closing.
   *
   * @param {object} event The event object.
   * @param {string} reason The reason why the dialog is closing.
   * @returns
   */
  const handleValidationErrorClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setValidationErrorOpen(false);
  };

  /**
   * A method to return the list item for an error.
   *
   * @param {Number} type The type of record
   * @param {Object} error The error object
   * @param {String} errorText The error text
   * @param {Number} index The index for the error map
   * @param {Number} indx The index for the error text map
   * @returns {JSX.Element} The ListItem for the error.
   */
  const getErrorListItem = (type, error, errorText, index, indx) => {
    return (
      <ListItem dense disablePadding key={`${type}-error-${index}-${indx}`}>
        <ListItemText
          primary={
            <Link
              component="button"
              variant="caption"
              align="left"
              color={adsRed}
              key={`${type}|${index}|${indx}`}
              onClick={() => handleErrorClick(type, error)}
              sx={getIssueStyle}
              underline="hover"
            >
              {errorText.replace("¬", ",")}
            </Link>
          }
        />
      </ListItem>
    );
  };

  /**
   * Event to handle when the message dialog is closed.
   *
   * @param {String} action The action chosen from the message dialog.
   */
  const handleMessageDialogClose = (action) => {
    setMessageOpen(false);
  };

  useEffect(() => {
    setHasASD(userContext.currentUser && userContext.currentUser.hasASD);
  }, [userContext]);

  return (
    <Fragment>
      <Box
        sx={{
          position: "absolute",
          width: "25ch",
          maxHeight: "40vh",
          overflowY: "auto",
          overflowX: "auto",
          left: theme.spacing(79.25),
          top: theme.spacing(2.5),
          borderWidth: "1px",
          borderColor: adsLightGreyB,
          backgroundColor: adsOffWhite,
          boxShadow: `4px 4px 7px ${adsLightGreyA50}`,
          borderRadius: "3px",
        }}
      >
        <Grid2 container direction="column" id="issue-list-grid" sx={{ pt: "2px", pl: "12px", pr: "12px", pb: "24px" }}>
          <Grid2>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
              <Typography
                variant="subtitle1"
                display="inline-flex"
                sx={{
                  mt: theme.spacing(0.3),
                  pl: theme.spacing(1.1),
                  fontWeight: 600,
                  fontSize: "18px",
                  color: adsDarkGrey,
                }}
              >
                Issue(s)
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                <Tooltip title="Copy errors to clipboard" placement="top">
                  <IconButton onClick={handleCopyClick} size="small">
                    <CopyIcon sx={ActionIconStyle()} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Close" placement="top">
                  <IconButton onClick={handleCloseClick} size="small">
                    <CloseIcon sx={ActionIconStyle()} />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Grid2>
          <Grid2>
            <List component="div" disablePadding>
              {streetContext.currentStreetHasErrors &&
                streetContext.currentErrors.street.length > 0 &&
                streetContext.currentErrors.street.map((streetError, index) => {
                  return streetError.errors.map((streetErrorText, indx) => {
                    return getErrorListItem(11, streetError, streetErrorText, index, indx);
                  });
                })}
              {streetContext.currentStreetHasErrors &&
                streetContext.currentErrors.descriptor.length > 0 &&
                streetContext.currentErrors.descriptor.map((descriptorError, index) => {
                  return descriptorError.errors.map((descriptorErrorText, indx) => {
                    return getErrorListItem(15, descriptorError, descriptorErrorText, index, indx);
                  });
                })}
              {streetContext.currentStreetHasErrors &&
                streetContext.currentErrors.esu.length > 0 &&
                streetContext.currentErrors.esu.map((esuError, index) => {
                  return esuError.errors.map((esuErrorText, indx) => {
                    return getErrorListItem(13, esuError, esuErrorText, index, indx);
                  });
                })}
              {streetContext.currentStreetHasErrors &&
                streetContext.currentErrors.highwayDedication.length > 0 &&
                streetContext.currentErrors.highwayDedication.map((highwayDedicationError, index) => {
                  return highwayDedicationError.errors.map((highwayDedicationErrorText, indx) => {
                    return getErrorListItem(17, highwayDedicationError, highwayDedicationErrorText, index, indx);
                  });
                })}
              {streetContext.currentStreetHasErrors &&
                streetContext.currentErrors.oneWayExemption.length > 0 &&
                streetContext.currentErrors.oneWayExemption.map((oneWayExemptionError, index) => {
                  return oneWayExemptionError.errors.map((oneWayExemptionErrorText, indx) => {
                    return getErrorListItem(16, oneWayExemptionError, oneWayExemptionErrorText, index, indx);
                  });
                })}
              {streetContext.currentStreetHasErrors &&
                streetContext.currentErrors.successorCrossRef.length > 0 &&
                streetContext.currentErrors.successorCrossRef.map((successorCrossRefError, index) => {
                  return successorCrossRefError.errors.map((successorCrossRefErrorText, indx) => {
                    return getErrorListItem(30, successorCrossRefError, successorCrossRefErrorText, index, indx);
                  });
                })}
              {streetContext.currentStreetHasErrors &&
                streetContext.currentErrors.maintenanceResponsibility.length > 0 &&
                streetContext.currentErrors.maintenanceResponsibility.map((maintenanceResponsibilityError, index) => {
                  return maintenanceResponsibilityError.errors.map((maintenanceResponsibilityErrorText, indx) => {
                    return getErrorListItem(
                      51,
                      maintenanceResponsibilityError,
                      maintenanceResponsibilityErrorText,
                      index,
                      indx
                    );
                  });
                })}
              {streetContext.currentStreetHasErrors &&
                streetContext.currentErrors.reinstatementCategory.length > 0 &&
                streetContext.currentErrors.reinstatementCategory.map((reinstatementCategoryError, index) => {
                  return reinstatementCategoryError.errors.map((reinstatementCategoryErrorText, indx) => {
                    return getErrorListItem(
                      52,
                      reinstatementCategoryError,
                      reinstatementCategoryErrorText,
                      index,
                      indx
                    );
                  });
                })}
              {streetContext.currentStreetHasErrors &&
                streetContext.currentErrors.osSpecialDesignation.length > 0 &&
                streetContext.currentErrors.osSpecialDesignation.map((osSpecialDesignationError, index) => {
                  return osSpecialDesignationError.errors.map((osSpecialDesignationErrorText, indx) => {
                    return getErrorListItem(53, osSpecialDesignationError, osSpecialDesignationErrorText, index, indx);
                  });
                })}
              {streetContext.currentStreetHasErrors &&
                streetContext.currentErrors.interest.length > 0 &&
                streetContext.currentErrors.interest.map((interestError, index) => {
                  return interestError.errors.map((interestErrorText, indx) => {
                    return getErrorListItem(61, interestError, interestErrorText, index, indx);
                  });
                })}
              {streetContext.currentStreetHasErrors &&
                streetContext.currentErrors.construction.length > 0 &&
                streetContext.currentErrors.construction.map((constructionError, index) => {
                  return constructionError.errors.map((constructionErrorText, indx) => {
                    return getErrorListItem(62, constructionError, constructionErrorText, index, indx);
                  });
                })}
              {streetContext.currentStreetHasErrors &&
                streetContext.currentErrors.specialDesignation.length > 0 &&
                streetContext.currentErrors.specialDesignation.map((specialDesignationError, index) => {
                  return specialDesignationError.errors.map((specialDesignationErrorText, indx) => {
                    return getErrorListItem(63, specialDesignationError, specialDesignationErrorText, index, indx);
                  });
                })}
              {streetContext.currentStreetHasErrors &&
                streetContext.currentErrors.heightWidthWeight.length > 0 &&
                streetContext.currentErrors.heightWidthWeight.map((heightWidthWeightError, index) => {
                  return heightWidthWeightError.errors.map((heightWidthWeightErrorText, indx) => {
                    return getErrorListItem(64, heightWidthWeightError, heightWidthWeightErrorText, index, indx);
                  });
                })}
              {streetContext.currentStreetHasErrors &&
                streetContext.currentErrors.publicRightOfWay.length > 0 &&
                streetContext.currentErrors.publicRightOfWay.map((publicRightOfWayError, index) => {
                  return publicRightOfWayError.errors.map((publicRightOfWayErrorText, indx) => {
                    return getErrorListItem(66, publicRightOfWayError, publicRightOfWayErrorText, index, indx);
                  });
                })}
              {streetContext.currentStreetHasErrors &&
                streetContext.currentErrors.note.length > 0 &&
                streetContext.currentErrors.note.map((noteError, index) => {
                  return noteError.errors.map((noteErrorText, indx) => {
                    return getErrorListItem(72, noteError, noteErrorText, index, indx);
                  });
                })}
              {propertyContext.currentPropertyHasErrors &&
                propertyContext.currentErrors.blpu.length > 0 &&
                propertyContext.currentErrors.blpu.map((blpuError, index) => {
                  return blpuError.errors.map((blpuErrorText, indx) => {
                    return getErrorListItem(21, blpuError, blpuErrorText, index, indx);
                  });
                })}
              {propertyContext.currentPropertyHasErrors &&
                propertyContext.currentErrors.lpi.length > 0 &&
                propertyContext.currentErrors.lpi.map((lpiError, index) => {
                  return lpiError.errors.map((lpiErrorText, indx) => {
                    return getErrorListItem(24, lpiError, lpiErrorText, index, indx);
                  });
                })}
              {propertyContext.currentPropertyHasErrors &&
                propertyContext.currentErrors.provenance.length > 0 &&
                propertyContext.currentErrors.provenance.map((provenanceError, index) => {
                  return provenanceError.errors.map((provenanceErrorText, indx) => {
                    return getErrorListItem(22, provenanceError, provenanceErrorText, index, indx);
                  });
                })}
              {propertyContext.currentPropertyHasErrors &&
                propertyContext.currentErrors.crossRef.length > 0 &&
                propertyContext.currentErrors.crossRef.map((crossRefError, index) => {
                  return crossRefError.errors.map((crossRefErrorText, indx) => {
                    return getErrorListItem(23, crossRefError, crossRefErrorText, index, indx);
                  });
                })}
              {propertyContext.currentPropertyHasErrors &&
                propertyContext.currentErrors.successorCrossRef.length > 0 &&
                propertyContext.currentErrors.successorCrossRef.map((successorCrossRefError, index) => {
                  return successorCrossRefError.errors.map((successorCrossRefErrorText, indx) => {
                    return getErrorListItem(30, successorCrossRefError, successorCrossRefErrorText, index, indx);
                  });
                })}
              {propertyContext.currentPropertyHasErrors &&
                propertyContext.currentErrors.organisation.length > 0 &&
                propertyContext.currentErrors.organisation.map((organisationError, index) => {
                  return organisationError.errors.map((organisationErrorText, indx) => {
                    return getErrorListItem(31, organisationError, organisationErrorText, index, indx);
                  });
                })}
              {propertyContext.currentPropertyHasErrors &&
                propertyContext.currentErrors.classification.length > 0 &&
                propertyContext.currentErrors.classification.map((classificationError, index) => {
                  return classificationError.errors.map((classificationErrorText, indx) => {
                    return getErrorListItem(32, classificationError, classificationErrorText, index, indx);
                  });
                })}
              {propertyContext.currentPropertyHasErrors &&
                propertyContext.currentErrors.note.length > 0 &&
                propertyContext.currentErrors.note.map((noteError, index) => {
                  return noteError.errors.map((noteErrorText, indx) => {
                    return getErrorListItem(71, noteError, noteErrorText, index, indx);
                  });
                })}
            </List>
          </Grid2>
        </Grid2>
      </Box>
      <div>
        <Snackbar
          open={validationErrorOpen}
          autoHideDuration={6000}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          onClose={handleValidationErrorClose}
        >
          <Alert
            sx={GetAlertStyle(false)}
            icon={GetAlertIcon(false)}
            onClose={handleValidationErrorClose}
            severity={GetAlertSeverity(false)}
            elevation={6}
            variant="filled"
          >
            {"Failed to validate the record."}
          </Alert>
        </Snackbar>
        <MessageDialog isOpen={messageOpen} variant="copiedIssues" onClose={handleMessageDialogClose} />
      </div>
    </Fragment>
  );
}

export default ADSErrorList;
