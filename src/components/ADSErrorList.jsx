/* #region header */
/**************************************************************************************************
//
//  Description: Control used to display a list of the errors.
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
//    003   06.10.23 Sean Flook                 Added OneScotland record types. Use colour variables.
//    004   03.11.23 Sean Flook                 Added hyphen to one-way.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, Fragment } from "react";
import PropTypes from "prop-types";
import PropertyContext from "../context/propertyContext";
import StreetContext from "../context/streetContext";
import SandboxContext from "../context/sandboxContext";
import LookupContext from "../context/lookupContext";
import SettingsContext from "../context/settingsContext";
import { StreetComparison, PropertyComparison } from "../utils/ObjectComparison";
import { HasASD } from "../configuration/ADSConfig";
import { GetNewStreetData } from "../utils/StreetUtils";
import { GetNewPropertyData, getBilingualSource } from "../utils/PropertyUtils";
import { useEditConfirmation } from "../pages/EditConfirmationPage";
import { Box, Grid, Typography, IconButton, Stack, Link, Divider, Snackbar, Alert } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { adsRed, adsDarkGrey, adsLightGreyB, adsOffWhite, adsLightGreyA50 } from "../utils/ADSColours";
import { ActionIconStyle, GetAlertStyle, GetAlertIcon, GetAlertSeverity } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

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

  const confirmDialog = useEditConfirmation(false);

  const [validationErrorOpen, setValidationErrorOpen] = useState(false);

  const getIssueStyle = {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
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
   * Event to handle when an error is clicked.
   *
   * @param {number} type The type of record with the error.
   * @param {object} error The error object.
   */
  const doErrorClick = (type, error) => {
    const streetTypes = [11, 13, 15, 16, 17, 61, 62, 63, 64, 66, 71];
    const esuTypes = [16, 17];
    const propertyTypes = [21, 22, 23, 24, 72];

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
          updateSuccessorData();
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

        case 71:
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

        case 31:
          updateOrganisationData();
          break;

        case 32:
          updateClassificationData();
          break;

        case 72:
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
   * @param {array|null} successorData The successor data for the street (OneScotland only).
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
    successorData,
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
      successorData,
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
      settingsContext.isScottish
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
   * @param {array|null} successorData The successor data for the property (OneScotland only).
   * @param {array|null} noteData The note data for the property.
   * @param {string} clearType The type of data that we are clearing from the sandbox.
   */
  const setAssociatedPropertyDataAndClear = (
    lpiData,
    provenanceData,
    crossRefData,
    classificationData,
    organisationData,
    successorData,
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
      successorData,
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
      sandboxContext.currentSandbox.currentStreet.successors,
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
   * Event to update the successor record with new data.
   *
   * @returns
   */
  const updateSuccessorData = () => {
    if (!sandboxContext.currentSandbox.currentStreetRecords.successor) return;

    const newSuccessors = sandboxContext.currentSandbox.currentStreet.successors.map(
      (x) =>
        [sandboxContext.currentSandbox.currentStreetRecords.successor].find((successor) => successor.pkId === x.pkId) ||
        x
    );

    setAssociatedStreetDataAndClear(
      sandboxContext.currentSandbox.currentStreet.esus,
      newSuccessors,
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
      "successor"
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
      sandboxContext.currentSandbox.currentStreet.successors,
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
      oneWayExemptionTypeCode:
        sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption.oneWayExemptionTypeCode,
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
      sequenceNumber: sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption.sequenceNumber,
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

    const newStreetData = !HasASD()
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

    const newStreetData = !HasASD()
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
      sandboxContext.currentSandbox.currentStreet.successors,
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
      sandboxContext.currentSandbox.currentStreet.successors,
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
      sandboxContext.currentSandbox.currentStreet.successors,
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
      sandboxContext.currentSandbox.currentStreet.successors,
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
      sandboxContext.currentSandbox.currentProperty.successors,
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
      sandboxContext.currentSandbox.currentProperty.successors,
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
      sandboxContext.currentSandbox.currentProperty.successors,
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
      sandboxContext.currentSandbox.currentProperty.successors,
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
        sandboxContext.currentSandbox.currentProperty.successors,
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
      sandboxContext.currentSandbox.currentProperty.successors,
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
          sandboxContext.currentSandbox.currentStreetRecords.streetDescriptor) ||
        (streetContext.currentRecord.type === 13 && sandboxContext.currentSandbox.currentStreetRecords.esu) ||
        (streetContext.currentRecord.type === 17 &&
          sandboxContext.currentSandbox.currentStreetRecords.highwayDedication) ||
        (streetContext.currentRecord.type === 16 &&
          sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption) ||
        (streetContext.currentRecord.type === 61 && sandboxContext.currentSandbox.currentStreetRecords.interest) ||
        (streetContext.currentRecord.type === 62 && sandboxContext.currentSandbox.currentStreetRecords.construction) ||
        (streetContext.currentRecord.type === 63 &&
          sandboxContext.currentSandbox.currentStreetRecords.specialDesignation) ||
        (streetContext.currentRecord.type === 64 && sandboxContext.currentSandbox.currentStreetRecords.hww) ||
        (streetContext.currentRecord.type === 66 && sandboxContext.currentSandbox.currentStreetRecords.prow) ||
        (streetContext.currentRecord.type === 71 && sandboxContext.currentSandbox.currentStreetRecords.note) ||
        (streetContext.currentRecord.type === 11 &&
          sandboxContext.currentSandbox.currentStreet &&
          !StreetComparison(sandboxContext.currentSandbox.sourceStreet, sandboxContext.currentSandbox.currentStreet));

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
        (propertyContext.currentRecord.type === 24 && sandboxContext.currentSandbox.currentPropertyRecords.lpi) ||
        (propertyContext.currentRecord.type === 23 &&
          sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef) ||
        (propertyContext.currentRecord.type === 22 &&
          sandboxContext.currentSandbox.currentPropertyRecords.provenance) ||
        (propertyContext.currentRecord.type === 72 && sandboxContext.currentSandbox.currentPropertyRecords.note) ||
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
        <Grid
          container
          direction="column"
          justifyContent="space-around"
          alignItems="baseline"
          id="issue-list-grid"
          sx={{ pt: "2px", pl: "12px", pr: "12px", pb: "24px" }}
        >
          <Grid container direction="row" justifyContent="space-between" alignItems="center">
            <Grid item>
              <Typography
                variant="subtitle1"
                display="inline-flex"
                sx={{
                  marginTop: theme.spacing(0.3),
                  paddingLeft: theme.spacing(1.1),
                  fontWeight: 600,
                  fontSize: "18px",
                  color: adsDarkGrey,
                }}
              >
                Issue(s)
              </Typography>
            </Grid>
            <Grid item>
              <IconButton onClick={handleCloseClick} size="small">
                <CloseIcon sx={ActionIconStyle()} />
              </IconButton>
            </Grid>
          </Grid>
          <Grid item>
            <Stack
              direction="column"
              justifyContent="center"
              alignItems="flex-start"
              spacing={1}
              divider={<Divider orientation="horizontal" flexItem />}
            >
              {streetContext.currentStreetHasErrors &&
                streetContext.currentErrors.street.length > 0 &&
                streetContext.currentErrors.street.map((streetError, index) => {
                  return (
                    <Link
                      component="button"
                      variant="caption"
                      align="left"
                      color={adsRed}
                      key={`11|${index}`}
                      onClick={() => handleErrorClick(11, streetError)}
                      sx={getIssueStyle}
                      underline="hover"
                    >
                      {streetError.errors}
                    </Link>
                  );
                })}
              {streetContext.currentStreetHasErrors &&
                streetContext.currentErrors.descriptor.length > 0 &&
                streetContext.currentErrors.descriptor.map((descriptorError, index) => {
                  return (
                    <Link
                      component="button"
                      variant="caption"
                      align="left"
                      color={adsRed}
                      key={`15|${index}`}
                      onClick={() => handleErrorClick(15, descriptorError)}
                      sx={getIssueStyle}
                      underline="hover"
                    >
                      {descriptorError.errors}
                    </Link>
                  );
                })}
              {streetContext.currentStreetHasErrors &&
                streetContext.currentErrors.esu.length > 0 &&
                streetContext.currentErrors.esu.map((esuError, index) => {
                  return (
                    <Link
                      component="button"
                      variant="caption"
                      align="left"
                      color={adsRed}
                      key={`13|${index}`}
                      onClick={() => handleErrorClick(13, esuError)}
                      sx={getIssueStyle}
                      underline="hover"
                    >
                      {esuError.errors}
                    </Link>
                  );
                })}
              {streetContext.currentStreetHasErrors &&
                streetContext.currentErrors.highwayDedication.length > 0 &&
                streetContext.currentErrors.highwayDedication.map((highwayDedicationError, index) => {
                  return (
                    <Link
                      component="button"
                      variant="caption"
                      align="left"
                      color={adsRed}
                      key={`17|${index}`}
                      onClick={() => handleErrorClick(17, highwayDedicationError)}
                      sx={getIssueStyle}
                      underline="hover"
                    >
                      {highwayDedicationError.errors}
                    </Link>
                  );
                })}
              {streetContext.currentStreetHasErrors &&
                streetContext.currentErrors.oneWayExemption.length > 0 &&
                streetContext.currentErrors.oneWayExemption.map((oneWayExemptionError, index) => {
                  return (
                    <Link
                      component="button"
                      variant="caption"
                      align="left"
                      color={adsRed}
                      key={`16|${index}`}
                      onClick={() => handleErrorClick(16, oneWayExemptionError)}
                      sx={getIssueStyle}
                      underline="hover"
                    >
                      {oneWayExemptionError.errors}
                    </Link>
                  );
                })}
              {streetContext.currentStreetHasErrors &&
                streetContext.currentErrors.interest.length > 0 &&
                streetContext.currentErrors.interest.map((interestError, index) => {
                  return (
                    <Link
                      component="button"
                      variant="caption"
                      align="left"
                      color={adsRed}
                      key={`61|${index}`}
                      onClick={() => handleErrorClick(61, interestError)}
                      sx={getIssueStyle}
                      underline="hover"
                    >
                      {interestError.errors}
                    </Link>
                  );
                })}
              {streetContext.currentStreetHasErrors &&
                streetContext.currentErrors.construction.length > 0 &&
                streetContext.currentErrors.construction.map((constructionError, index) => {
                  return (
                    <Link
                      component="button"
                      variant="caption"
                      align="left"
                      color={adsRed}
                      key={`62|${index}`}
                      onClick={() => handleErrorClick(62, constructionError)}
                      sx={getIssueStyle}
                      underline="hover"
                    >
                      {constructionError.errors}
                    </Link>
                  );
                })}
              {streetContext.currentStreetHasErrors &&
                streetContext.currentErrors.specialDesignation.length > 0 &&
                streetContext.currentErrors.specialDesignation.map((specialDesignationError, index) => {
                  return (
                    <Link
                      component="button"
                      variant="caption"
                      align="left"
                      color={adsRed}
                      key={`63|${index}`}
                      onClick={() => handleErrorClick(63, specialDesignationError)}
                      sx={getIssueStyle}
                      underline="hover"
                    >
                      {specialDesignationError.errors}
                    </Link>
                  );
                })}
              {streetContext.currentStreetHasErrors &&
                streetContext.currentErrors.heightWidthWeight.length > 0 &&
                streetContext.currentErrors.heightWidthWeight.map((heightWidthWeightError, index) => {
                  return (
                    <Link
                      component="button"
                      variant="caption"
                      align="left"
                      color={adsRed}
                      key={`64|${index}`}
                      onClick={() => handleErrorClick(64, heightWidthWeightError)}
                      sx={getIssueStyle}
                      underline="hover"
                    >
                      {heightWidthWeightError.errors}
                    </Link>
                  );
                })}
              {streetContext.currentStreetHasErrors &&
                streetContext.currentErrors.publicRightOfWay.length > 0 &&
                streetContext.currentErrors.publicRightOfWay.map((publicRightOfWayError, index) => {
                  return (
                    <Link
                      component="button"
                      variant="caption"
                      align="left"
                      color={adsRed}
                      key={`66|${index}`}
                      onClick={() => handleErrorClick(66, publicRightOfWayError)}
                      sx={getIssueStyle}
                      underline="hover"
                    >
                      {publicRightOfWayError.errors}
                    </Link>
                  );
                })}
              {streetContext.currentStreetHasErrors &&
                streetContext.currentErrors.note.length > 0 &&
                streetContext.currentErrors.note.map((noteError, index) => {
                  return (
                    <Link
                      component="button"
                      variant="caption"
                      align="left"
                      color={adsRed}
                      key={`71|${index}`}
                      onClick={() => handleErrorClick(71, noteError)}
                      sx={getIssueStyle}
                      underline="hover"
                    >
                      {noteError.errors}
                    </Link>
                  );
                })}
              {propertyContext.currentPropertyHasErrors &&
                propertyContext.currentErrors.blpu.length > 0 &&
                propertyContext.currentErrors.blpu.map((blpuError, index) => {
                  return (
                    <Link
                      component="button"
                      variant="caption"
                      align="left"
                      color={adsRed}
                      key={`21|${index}`}
                      onClick={() => handleErrorClick(21, blpuError)}
                      sx={getIssueStyle}
                      underline="hover"
                    >
                      {blpuError.errors}
                    </Link>
                  );
                })}
              {propertyContext.currentPropertyHasErrors &&
                propertyContext.currentErrors.lpi.length > 0 &&
                propertyContext.currentErrors.lpi.map((lpiError, index) => {
                  return (
                    <Link
                      component="button"
                      variant="caption"
                      align="left"
                      color={adsRed}
                      key={`24|${index}`}
                      onClick={() => handleErrorClick(24, lpiError)}
                      sx={getIssueStyle}
                      underline="hover"
                    >
                      {lpiError.errors}
                    </Link>
                  );
                })}
              {propertyContext.currentPropertyHasErrors &&
                propertyContext.currentErrors.provenance.length > 0 &&
                propertyContext.currentErrors.provenance.map((provenanceError, index) => {
                  return (
                    <Link
                      component="button"
                      variant="caption"
                      align="left"
                      color={adsRed}
                      key={`22|${index}`}
                      onClick={() => handleErrorClick(22, provenanceError)}
                      sx={getIssueStyle}
                      underline="hover"
                    >
                      {provenanceError.errors}
                    </Link>
                  );
                })}
              {propertyContext.currentPropertyHasErrors &&
                propertyContext.currentErrors.crossRef.length > 0 &&
                propertyContext.currentErrors.crossRef.map((crossRefError, index) => {
                  return (
                    <Link
                      component="button"
                      variant="caption"
                      align="left"
                      color={adsRed}
                      key={`23|${index}`}
                      onClick={() => handleErrorClick(23, crossRefError)}
                      sx={getIssueStyle}
                      underline="hover"
                    >
                      {crossRefError.errors}
                    </Link>
                  );
                })}
              {propertyContext.currentPropertyHasErrors &&
                propertyContext.currentErrors.note.length > 0 &&
                propertyContext.currentErrors.note.map((noteError, index) => {
                  return (
                    <Link
                      component="button"
                      variant="caption"
                      align="left"
                      color={adsRed}
                      key={`72|${index}`}
                      onClick={() => handleErrorClick(72, noteError)}
                      sx={getIssueStyle}
                      underline="hover"
                    >
                      {noteError.errors}
                    </Link>
                  );
                })}
            </Stack>
          </Grid>
        </Grid>
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
      </div>
    </Fragment>
  );
}

export default ADSErrorList;
