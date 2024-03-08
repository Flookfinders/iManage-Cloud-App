//#region header */
/**************************************************************************************************
//
//  Description: Property Data Form
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   20.07.21 Sean Flook         WI39??? Initial Revision.
//    002   16.03.23 Sean Flook         WI40581 When deleting a cross ref ensure the form is closed.
//    003   22.03.23 Sean Flook         WI40596 Pass the BLPU logical status to the data tabs.
//    004   31.03.23 Sean Flook         WI40656 Ensure Site Survey is updated when changed.
//    005   06.04.23 Sean Flook         WI40656 Included missing Site Survey.
//    006   06.04.23 Sean Flook         WI40671 Allow newly created notes to be edited.
//    007   06.04.23 Sean Flook         WI40610 Include parentUprn in handleBLPUDataChanged.
//    008   26.04.23 Sean Flook         WI40700 Do not set end date when deleting.
//    009   27.06.23 Sean Flook         WI40746 Remove new LPI if canceled.
//    010   27.06.23 Sean Flook         WI40234 Allow for the update of the local custodian code.
//    011   28.06.23 Sean Flook         WI40256 Changed Extent to Provenance where appropriate.
//    012   28.06.23 Sean Flook         WI40730 Get the temporary address before using it.
//    013   29.06.23 Sean Flook         WI40731 Clear provenanceChanged after clicking OK button.
//    014   20.07.23 Sean Flook                 Added code to handle when a user adds a new associated record and then clicks on the Cancel button.
//    015   20.09.23 Sean Flook                 Changes required to handle the OneScotland specific record types.
//    016   22.09.23 Sean Flook                 Various small bug fixes.
//    017   06.10.23 Sean Flook                 Various changes to ensure this works for GeoPlace and OneScotland and use colour variables.
//    018   27.10.23 Sean Flook                 Updated call to SavePropertyAndUpdate and set end date for associated records when updating the logical status to historic or rejected.
//    019   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system, renamed successor to successorCrossRef and changes to handle Scottish data structure.
//    020   30.11.23 Sean Flook                 Use constant for default classification scheme and various bug fixes.
//    021   14.12.23 Sean Flook                 Corrected note record type.
//    022   21.12.23 Sean Flook                 Ensure the sandbox is correctly updated.
//    023   03.01.24 Sean Flook                 Fixed warning.
//    024   05.01.24 Sean Flook                 Changes to sort out warnings.
//    025   10.01.24 Sean Flook                 Fix errors.
//    026   16.01.24 Sean Flook                 Changes required to fix warnings.
//    027   26.01.24 Sean Flook       IMANN-232 Do not remove record when creating a new property.
//    028   02.02.24 Sean Flook       IMANN-271 Reset the errors when opening a new property.
//    029   16.02.24 Sean Flook        ESU16_GP If changing page etc ensure the information and selection controls are cleared.
//    030   28.02.24 Joshua McCormick IMANN-280 Made tabStyle full-width when horizontal scrolling is not needed, so borders are full-width
//    031   27.02.24 Sean Flook           MUL16 Changes required to correctly open the related tab.
//    032   04.03.24 Sean Flook           MUL16 Try and ensure we get a new temp address when required.
//    033   05.03.24 Sean Flook       IMANN-338 If navigating back to an existing record ensure the form is setup as it was left.
//    034   05.03.24 Sean Flook       IMANN-338 Added code to ensure the tabs are not kept open when not required any more.
//    035   07.03.24 Sean Flook       IMANN-348 Changes required to ensure the Save button is correctly enabled.
//    036   07.03.24 Joshua McCormick IMANN-280 Added tabContainerStyle to tab container, reverted old styling changes from 030
//    037   08.03.24 Sean Flook       IMANN-348 Updated calls to ResetContexts.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

/* #region imports */

import React, { useContext, useState, useRef, useEffect } from "react";
import { useHistory } from "react-router";
import PropTypes from "prop-types";
import SandboxContext from "../context/sandboxContext";
import UserContext from "./../context/userContext";
import PropertyContext from "../context/propertyContext";
import StreetContext from "../context/streetContext";
import MapContext from "../context/mapContext";
import SearchContext from "../context/searchContext";
import LookupContext from "./../context/lookupContext";
import SettingsContext from "../context/settingsContext";
import InformationContext from "../context/informationContext";
import {
  FormatDateTime,
  GetUserAvatar,
  GetCurrentDate,
  GetChangedAssociatedRecords,
  GetWktCoordinates,
  PolygonsEqual,
  ResetContexts,
} from "../utils/HelperUtils";
import {
  GetNewPropertyData,
  GetCurrentPropertyData,
  SavePropertyAndUpdate,
  GetTempAddress,
  getBilingualSource,
  getClassificationCode,
  hasPropertyChanged,
} from "../utils/PropertyUtils";
import ObjectComparison, {
  blpuAppCrossRefKeysToIgnore,
  classificationKeysToIgnore,
  lpiKeysToIgnore,
  noteKeysToIgnore,
  organisationKeysToIgnore,
  provenanceKeysToIgnore,
  successorCrossRefKeysToIgnore,
} from "./../utils/ObjectComparison";
import { useEditConfirmation } from "../pages/EditConfirmationPage";
import { useSaveConfirmation } from "../pages/SaveConfirmationPage";
import { AppBar, Tabs, Tab, Avatar, Typography, Snackbar, Alert, Toolbar, Button } from "@mui/material";
import { Box, Stack } from "@mui/system";
import CheckIcon from "@mui/icons-material/Check";
import HistoryIcon from "@mui/icons-material/History";
import ErrorIcon from "@mui/icons-material/Error";
import PropertyDetailsTab from "../tabs/PropertyDetailsTab";
import PropertyLPITab from "../tabs/PropertyLPITab";
import PropertyClassificationListTab from "../tabs/PropertyClassificationListTab";
import PropertyClassificationTab from "../tabs/PropertyClassificationTab";
import PropertyOrganisationListTab from "../tabs/PropertyOrganisationListTab";
import PropertyOrganisationTab from "../tabs/PropertyOrganisationTab";
import SuccessorListTab from "../tabs/SuccessorListTab";
import SuccessorTab from "../tabs/SuccessorTab";
import PropertyBLPUProvenanceListTab from "../tabs/PropertyBLPUProvenanceListTab";
import PropertyBLPUProvenanceTab from "../tabs/PropertyBLPUProvenanceTab";
import PropertyCrossRefListTab from "../tabs/PropertyCrossRefListTab";
import PropertyCrossRefTab from "../tabs/PropertyCrossRefTab";
import RelatedTab from "../tabs/RelatedTab";
import NotesListTab from "../tabs/NotesListTab";
import NotesDataTab from "../tabs/NotesDataTab";
import EntityHistoryTab from "../tabs/EntityHistoryTab";
import { OSGScheme } from "../data/OSGClassification";
import { GazetteerRoute } from "../PageRouting";
import { adsBlueA, adsMidGreyA, adsWhite, adsLightGreyB } from "../utils/ADSColours";
import {
  GetTabIconStyle,
  GetAlertStyle,
  GetAlertIcon,
  GetAlertSeverity,
  errorIconStyle,
  tabStyle,
  tabContainerStyle,
  tabLabelStyle,
  getSaveButtonStyle,
  getSaveIcon,
} from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";
/* #endregion imports */

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`property-tabpanel-${index}`}
      aria-labelledby={`property-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `property-tab-${index}`,
    "aria-controls": `property-tabpanel-${index}`,
  };
}

function PropertyDataForm({ data, loading }) {
  const theme = useTheme();

  const sandboxContext = useContext(SandboxContext);
  const userContext = useContext(UserContext);
  const propertyContext = useContext(PropertyContext);
  const streetContext = useContext(StreetContext);
  const mapContext = useContext(MapContext);
  const searchContext = useContext(SearchContext);
  const lookupContext = useContext(LookupContext);
  const settingsContext = useContext(SettingsContext);
  const informationContext = useContext(InformationContext);

  const history = useHistory();

  const [propertyData, setPropertyData] = useState(null);
  const propertyUprn = useRef(null);
  const [value, setValue] = useState(0);
  const [copyOpen, setCopyOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [lpiFormData, setLpiFormData] = useState(null);
  const [classificationFormData, setClassificationFormData] = useState(null);
  const [organisationFormData, setOrganisationFormData] = useState(null);
  const [successorCrossRefFormData, setSuccessorCrossRefFormData] = useState(null);
  const [provenanceFormData, setProvenanceFormData] = useState(null);
  const [crossRefFormData, setCrossRefFormData] = useState(null);
  const [notesFormData, setNotesFormData] = useState(null);
  const copyDataType = useRef(null);
  const saveResult = useRef(null);
  const failedValidation = useRef(null);
  const associatedRecords = useRef([]);
  const provenanceChanged = useRef(false);
  const clearingType = useRef("");

  const [blpuErrors, setBlpuErrors] = useState([]);
  const [lpiErrors, setLpiErrors] = useState([]);
  const [classificationErrors, setClassificationErrors] = useState([]);
  const [organisationErrors, setOrganisationErrors] = useState([]);
  const [successorCrossRefErrors, setSuccessorCrossRefErrors] = useState([]);
  const [provenanceErrors, setProvenanceErrors] = useState([]);
  const [crossRefErrors, setCrossRefErrors] = useState([]);
  const [noteErrors, setNoteErrors] = useState([]);

  const [saveDisabled, setSaveDisabled] = useState(true);

  const confirmDialog = useEditConfirmation(false);
  const saveConfirmDialog = useSaveConfirmation(false);

  const [blpuFocusedField, setBlpuFocusedField] = useState(null);
  const [lpiFocusedField, setLpiFocusedField] = useState(null);
  const [classificationFocusedField, setClassificationFocusedField] = useState(null);
  const [organisationFocusedField, setOrganisationFocusedField] = useState(null);
  const [successorCrossRefFocusedField, setSuccessorCrossRefFocusedField] = useState(null);
  const [provenanceFocusedField, setProvenanceFocusedField] = useState(null);
  const [crossRefFocusedField, setCrossRefFocusedField] = useState(null);
  const [noteFocusedField, setNoteFocusedField] = useState(null);

  /**
   * Sets the associated property data for the current property.
   *
   * @param {object|null} lpiData The LPI data for the property.
   * @param {object|null} provenanceData The provenance data for the property.
   * @param {object|null} crossRefData The cross reference data for the property.
   * @param {object|null} classificationData The classification data for the property (OneScotland only).
   * @param {object|null} organisationData The organisation data for the property (OneScotland only).
   * @param {object|null} successorCrossRefData The successor cross reference data for the property (OneScotland only).
   * @param {object|null} noteData The note data for the property.
   */
  const setAssociatedPropertyData = (
    lpiData,
    provenanceData,
    crossRefData,
    classificationData,
    organisationData,
    successorCrossRefData,
    noteData
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
    updatePropertyData(newPropertyData);
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
    updatePropertyDataAndClear(newPropertyData, clearType);
  };

  /**
   * Method to update the property data with the latest data.
   *
   * @param {object} newPropertyData The updated property object.
   */
  const updatePropertyData = (newPropertyData) => {
    setPropertyData(newPropertyData);
    sandboxContext.onSandboxChange("currentProperty", newPropertyData);
  };

  /**
   * Method to update the property data with the latest data and then clear it from the sandbox.
   *
   * @param {object} newPropertyData The updated property object.
   * @param {string} clearType The name of the data type to be cleared.
   */
  const updatePropertyDataAndClear = (newPropertyData, clearType) => {
    setPropertyData(newPropertyData);
    clearingType.current = clearType;
    sandboxContext.onUpdateAndClear("currentProperty", newPropertyData, clearType);
  };

  /**
   * Event to handle when a user changes tabs on the form
   *
   * @param {object} event This is not used.
   * @param {number} newValue The index of the tab the user wants to switch to.
   */
  const handleTabChange = (event, newValue) => {
    switch (value) {
      case 0: // Details
        if (lpiFormData) {
          setLpiFormData({
            pkId: lpiFormData.pkId,
            lpiData: sandboxContext.currentSandbox.currentPropertyRecords.lpi
              ? sandboxContext.currentSandbox.currentPropertyRecords.lpi
              : lpiFormData.lpiData,
            blpuLogicalStatus: propertyData.logicalStatus,
            organisation: propertyData.organisation,
            index: lpiFormData.index,
            totalRecords: lpiFormData.totalRecords,
          });
        }
        break;

      case 1: // Classifications / Provenances
        if (settingsContext.isScottish) {
          if (classificationFormData) {
            setClassificationFormData({
              id: classificationFormData.id,
              classificationData: sandboxContext.currentSandbox.currentPropertyRecords.classification
                ? {
                    id: sandboxContext.currentSandbox.currentPropertyRecords.classification.pkId,
                    changeType: sandboxContext.currentSandbox.currentPropertyRecords.classification.changeType,
                    uprn: sandboxContext.currentSandbox.currentPropertyRecords.classification.uprn,
                    classKey: sandboxContext.currentSandbox.currentPropertyRecords.classification.classKey,
                    classificationScheme:
                      sandboxContext.currentSandbox.currentPropertyRecords.classification.classificationScheme,
                    blpuClass: sandboxContext.currentSandbox.currentPropertyRecords.classification.blpuClass,
                    startDate: sandboxContext.currentSandbox.currentPropertyRecords.classification.startDate,
                    endDate: sandboxContext.currentSandbox.currentPropertyRecords.classification.endDate,
                    entryDate: sandboxContext.currentSandbox.currentPropertyRecords.classification.entryDate,
                    lastUpdateDate: sandboxContext.currentSandbox.currentPropertyRecords.classification.lastUpdateDate,
                    neverExport: sandboxContext.currentSandbox.currentPropertyRecords.classification.neverExport,
                  }
                : classificationFormData.classificationData,
              index: classificationFormData.index,
              totalRecords: classificationFormData.totalRecords,
            });
          }
        } else {
          if (provenanceFormData) {
            setProvenanceFormData({
              id: provenanceFormData.id,
              provenanceData: sandboxContext.currentSandbox.currentPropertyRecords.provenance
                ? {
                    id: sandboxContext.currentSandbox.currentPropertyRecords.provenance.pkId,
                    changeType: sandboxContext.currentSandbox.currentPropertyRecords.provenance.changeType,
                    uprn: sandboxContext.currentSandbox.currentPropertyRecords.provenance.uprn,
                    provenanceKey: sandboxContext.currentSandbox.currentPropertyRecords.provenance.provenanceKey,
                    provenanceCode: sandboxContext.currentSandbox.currentPropertyRecords.provenance.provenanceCode,
                    annotation: sandboxContext.currentSandbox.currentPropertyRecords.provenance.annotation,
                    startDate: sandboxContext.currentSandbox.currentPropertyRecords.provenance.startDate,
                    endDate: sandboxContext.currentSandbox.currentPropertyRecords.provenance.endDate,
                    entryDate: sandboxContext.currentSandbox.currentPropertyRecords.provenance.entryDate,
                    lastUpdateDate: sandboxContext.currentSandbox.currentPropertyRecords.provenance.lastUpdateDate,
                    wktGeometry: sandboxContext.currentSandbox.currentPropertyRecords.provenance.wktGeometry,
                  }
                : provenanceFormData.provenanceData,
              blpuLogicalStatus: propertyData.logicalStatus,
              index: provenanceFormData.index,
              totalRecords: provenanceFormData.totalRecords,
            });
          }
        }
        break;

      case 2: // Organisations / Cross Refs
        if (settingsContext.isScottish) {
          if (organisationFormData) {
            setOrganisationFormData({
              id: organisationFormData.id,
              organisationData: sandboxContext.currentSandbox.currentPropertyRecords.organisation
                ? {
                    id: sandboxContext.currentSandbox.currentPropertyRecords.organisation.pkId,
                    changeType: sandboxContext.currentSandbox.currentPropertyRecords.organisation.changeType,
                    uprn: sandboxContext.currentSandbox.currentPropertyRecords.organisation.uprn,
                    orgKey: sandboxContext.currentSandbox.currentPropertyRecords.organisation.orgKey,
                    organisation: sandboxContext.currentSandbox.currentPropertyRecords.organisation.organisation,
                    legalName: sandboxContext.currentSandbox.currentPropertyRecords.organisation.legalName,
                    startDate: sandboxContext.currentSandbox.currentPropertyRecords.organisation.startDate,
                    endDate: sandboxContext.currentSandbox.currentPropertyRecords.organisation.endDate,
                    entryDate: sandboxContext.currentSandbox.currentPropertyRecords.organisation.entryDate,
                    lastUpdateDate: sandboxContext.currentSandbox.currentPropertyRecords.organisation.lastUpdateDate,
                    neverExport: sandboxContext.currentSandbox.currentPropertyRecords.organisation.neverExport,
                  }
                : organisationFormData.organisationData,
              index: organisationFormData.index,
              totalRecords: organisationFormData.totalRecords,
            });
          }
        } else {
          if (crossRefFormData) {
            setCrossRefFormData({
              id: crossRefFormData.id,
              xrefData: sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef
                ? {
                    id: sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef.pkId,
                    uprn: sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef.uprn,
                    changeType: sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef.changeType,
                    xrefKey: sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef.xrefKey,
                    source: sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef.source,
                    sourceId: sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef.sourceId,
                    crossReference: sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef.crossReference,
                    startDate: sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef.startDate,
                    endDate: sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef.endDate,
                    lastUpdateDate: sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef.lastUpdateDate,
                    neverExport: sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef.neverExport,
                  }
                : crossRefFormData.xrefData,
              blpuLogicalStatus: propertyData.logicalStatus,
              index: crossRefFormData.index,
              totalRecords: crossRefFormData.totalRecords,
            });
          }
        }
        break;

      case 3: // Successors / Notes
        if (settingsContext.isScottish) {
          if (successorCrossRefFormData) {
            setSuccessorCrossRefFormData({
              id: successorCrossRefFormData.id,
              successorCrossRefData: sandboxContext.currentSandbox.currentPropertyRecords.successorCrossRef
                ? {
                    id: sandboxContext.currentSandbox.currentPropertyRecords.successorCrossRef.pkId,
                    changeType: sandboxContext.currentSandbox.currentPropertyRecords.successorCrossRef.changeType,
                    succKey: sandboxContext.currentSandbox.currentPropertyRecords.successorCrossRef.succKey,
                    successor: sandboxContext.currentSandbox.currentPropertyRecords.successorCrossRef.successor,
                    successorType: sandboxContext.currentSandbox.currentPropertyRecords.successorCrossRef.successorType,
                    predecessor: sandboxContext.currentSandbox.currentPropertyRecords.successorCrossRef.predecessor,
                    startDate: sandboxContext.currentSandbox.currentPropertyRecords.successorCrossRef.startDate,
                    endDate: sandboxContext.currentSandbox.currentPropertyRecords.successorCrossRef.endDate,
                    entryDate: sandboxContext.currentSandbox.currentPropertyRecords.successorCrossRef.entryDate,
                    lastUpdateDate:
                      sandboxContext.currentSandbox.currentPropertyRecords.successorCrossRef.lastUpdateDate,
                    neverExport: sandboxContext.currentSandbox.currentPropertyRecords.successorCrossRef.neverExport,
                  }
                : successorCrossRefFormData.successorCrossRefData,
              index: successorCrossRefFormData.index,
              totalRecords: successorCrossRefFormData.totalRecords,
            });
          }
        } else {
          if (notesFormData) {
            setNotesFormData({
              pkId: notesFormData.pkId,
              noteData: sandboxContext.currentSandbox.currentPropertyRecords.note
                ? sandboxContext.currentSandbox.currentPropertyRecords.note
                : notesFormData.noteData,
              index: notesFormData.index,
              totalRecords: notesFormData.totalRecords,
              variant: "property",
            });
          }
        }
        break;

      case 4: // BLPU Provenances
        if (settingsContext.isScottish && provenanceFormData) {
          setProvenanceFormData({
            id: provenanceFormData.id,
            provenanceData: sandboxContext.currentSandbox.currentPropertyRecords.provenance
              ? {
                  id: sandboxContext.currentSandbox.currentPropertyRecords.provenance.pkId,
                  changeType: sandboxContext.currentSandbox.currentPropertyRecords.provenance.changeType,
                  uprn: sandboxContext.currentSandbox.currentPropertyRecords.provenance.uprn,
                  provenanceKey: sandboxContext.currentSandbox.currentPropertyRecords.provenance.provenanceKey,
                  provenanceCode: sandboxContext.currentSandbox.currentPropertyRecords.provenance.provenanceCode,
                  annotation: sandboxContext.currentSandbox.currentPropertyRecords.provenance.annotation,
                  startDate: sandboxContext.currentSandbox.currentPropertyRecords.provenance.startDate,
                  endDate: sandboxContext.currentSandbox.currentPropertyRecords.provenance.endDate,
                  entryDate: sandboxContext.currentSandbox.currentPropertyRecords.provenance.entryDate,
                  lastUpdateDate: sandboxContext.currentSandbox.currentPropertyRecords.provenance.lastUpdateDate,
                  wktGeometry: sandboxContext.currentSandbox.currentPropertyRecords.provenance.wktGeometry,
                }
              : provenanceFormData.provenanceData,
            blpuLogicalStatus: propertyData.logicalStatus,
            index: provenanceFormData.index,
            totalRecords: provenanceFormData.totalRecords,
          });
        }
        break;

      case 5: // Cross Refs
        if (settingsContext.isScottish && crossRefFormData) {
          setCrossRefFormData({
            id: crossRefFormData.id,
            xrefData: sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef
              ? {
                  id: sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef.pkId,
                  uprn: sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef.uprn,
                  changeType: sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef.changeType,
                  xrefKey: sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef.xrefKey,
                  source: sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef.source,
                  sourceId: sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef.sourceId,
                  crossReference: sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef.crossReference,
                  startDate: sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef.startDate,
                  endDate: sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef.endDate,
                  lastUpdateDate: sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef.lastUpdateDate,
                  neverExport: sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef.neverExport,
                }
              : crossRefFormData.xrefData,
            blpuLogicalStatus: propertyData.logicalStatus,
            index: crossRefFormData.index,
            totalRecords: crossRefFormData.totalRecords,
          });
        }
        break;

      case 6: // Notes
        if (settingsContext.isScottish && notesFormData) {
          setNotesFormData({
            pkId: notesFormData.pkId,
            noteData: sandboxContext.currentSandbox.currentPropertyRecords.note
              ? sandboxContext.currentSandbox.currentPropertyRecords.note
              : notesFormData.noteData,
            index: notesFormData.index,
            totalRecords: notesFormData.totalRecords,
            variant: "property",
          });
        }
        break;

      default:
        break;
    }

    const propertyChanged = hasPropertyChanged(
      propertyContext.currentProperty.newProperty,
      sandboxContext.currentSandbox
    );

    if (!propertyChanged || propertyContext.validateData()) {
      failedValidation.current = false;
      setValue(newValue);
      sandboxContext.onPropertyTabChange(newValue);
      mapContext.onEditMapObject(null, null);
      informationContext.onClearInformation();

      switch (newValue) {
        case 0:
          if (lpiFormData) propertyContext.onRecordChange(24, lpiFormData.index);
          else {
            propertyContext.onRecordChange(21, null);
            mapContext.onEditMapObject(21, propertyData && propertyData.uprn);
          }
          break;

        case 1:
          if (settingsContext.isScottish) {
            if (classificationFormData) propertyContext.onRecordChange(32, classificationFormData.index);
          } else {
            if (provenanceFormData) {
              propertyContext.onRecordChange(22, provenanceFormData.index);
              mapContext.onEditMapObject(22, provenanceFormData.provenanceData.pkId);
            }
          }
          break;

        case 2:
          if (settingsContext.isScottish) {
            if (organisationFormData) propertyContext.onRecordChange(31, organisationFormData.index);
          } else {
            if (crossRefFormData) propertyContext.onRecordChange(23, crossRefFormData.index);
          }
          break;

        case 3:
          if (settingsContext.isScottish) {
            if (successorCrossRefFormData) propertyContext.onRecordChange(30, successorCrossRefFormData.index);
          } else if (propertyData.parentUprn) setupRelated();
          break;

        case 4:
          if (settingsContext.isScottish && provenanceFormData) {
            propertyContext.onRecordChange(22, provenanceFormData.index);
            mapContext.onEditMapObject(22, provenanceFormData.provenanceData.pkId);
          } else {
            if (notesFormData) propertyContext.onRecordChange(71, notesFormData.index);
          }
          break;

        case 5:
          if (settingsContext.isScottish && crossRefFormData)
            propertyContext.onRecordChange(23, crossRefFormData.index);
          break;

        case 6:
          if (settingsContext.isScottish && propertyData.parentUprn) setupRelated();
          break;

        case 7:
          if (settingsContext.isScottish && notesFormData) propertyContext.onRecordChange(71, notesFormData.index);
          break;

        default:
          break;
      }
    } else if (propertyChanged) {
      failedValidation.current = true;
      saveResult.current = false;
      setSaveOpen(true);
    }
  };

  /**
   * Event to handle when a LPI record is selected from the property details tab.
   *
   * @param {number} pkId The primary key for the selected record. If -1 the data is cleared. 0 indicates a new LPI is required. Any number > 0 is existing data.
   * @param {object|null} lpiData The LPI data for the selected record
   * @param {number|null} dataIdx The index of the record within the array of LPI records.
   * @param {number|null} dataLength The total number of records in the array of LPI records.
   */
  const handleLPISelected = (pkId, lpiData, dataIdx, dataLength) => {
    mapContext.onEditMapObject(null, null);

    if (pkId === -1) {
      setLpiFormData(null);
      propertyContext.onRecordChange(21, null);
      mapContext.onEditMapObject(21, propertyData && propertyData.uprn);
    } else if (pkId === 0) {
      const newIdx =
        propertyData && propertyData.lpis ? propertyData.lpis.filter((x) => x.changeType !== "D").length : 0;
      const currentUser = userContext.currentUser
        ? `${userContext.currentUser.firstName} ${userContext.currentUser.lastName}`
        : null;
      const currentDate = GetCurrentDate(false);
      const currentStreet = propertyData.lpis[0].usrn;
      const minPkIdLpi =
        propertyData.lpis && propertyData.lpis.length > 0
          ? propertyData.lpis.reduce((prev, curr) => (prev.pkId < curr.pkId ? prev : curr))
          : null;
      const maxDualLanguageLink =
        propertyData.lpis && propertyData.lpis.length > 0
          ? propertyData.lpis.reduce((prev, curr) =>
              (prev.dualLanguageLink ? prev.dualLanguageLink : 0) > (curr.dualLanguageLink ? curr.dualLanguageLink : 0)
                ? prev
                : curr
            )
          : 0;
      const newPkId = !minPkIdLpi || !minPkIdLpi.pkId || minPkIdLpi.pkId > -10 ? -10 : minPkIdLpi.pkId - 1;

      const newEngRec = settingsContext.isScottish
        ? {
            language: "ENG",
            startDate: currentDate,
            endDate: null,
            saoStartNumber: 0,
            saoEndNumber: 0,
            saoText: null,
            paoStartNumber: 0,
            paoEndNumber: 0,
            paoText: null,
            usrn: currentStreet,
            postcodeRef: 0,
            postTownRef: 0,
            neverExport: false,
            postTown: null,
            postcode: null,
            dualLanguageLink: maxDualLanguageLink ? maxDualLanguageLink.dualLanguageLink + 1 : 0,
            uprn: propertyData && propertyData.uprn,
            logicalStatus: 6,
            paoStartSuffix: null,
            paoEndSuffix: null,
            saoStartSuffix: null,
            saoEndSuffix: null,
            subLocalityRef: 0,
            subLocality: null,
            postallyAddressable: null,
            officialFlag: null,
            pkId: newPkId,
            changeType: "I",
            lpiKey: null,
            address: null,
            entryDate: currentDate,
            lastUpdateDate: currentDate,
          }
        : {
            language: "ENG",
            startDate: currentDate,
            endDate: null,
            saoStartNumber: 0,
            saoEndNumber: 0,
            saoText: null,
            paoStartNumber: 0,
            paoEndNumber: 0,
            paoText: null,
            usrn: currentStreet,
            postcodeRef: 0,
            postTownRef: 0,
            neverExport: false,
            postTown: null,
            postcode: null,
            dualLanguageLink: settingsContext.isWelsh
              ? maxDualLanguageLink
                ? maxDualLanguageLink.dualLanguageLink + 1
                : 0
              : 0,
            uprn: propertyData && propertyData.uprn,
            logicalStatus: 6,
            paoStartSuffix: null,
            paoEndSuffix: null,
            saoStartSuffix: null,
            saoEndSuffix: null,
            level: null,
            postalAddress: null,
            officialFlag: null,
            pkId: newPkId,
            changeType: "I",
            lpiKey: null,
            address: null,
            entryDate: currentDate,
            lastUpdateDate: currentDate,
          };

      let newLPIs = propertyData.lpis ? propertyData.lpis : [];

      if (settingsContext.isWelsh) {
        const newCymRec = {
          level: null,
          postalAddress: null,
          pkId: newPkId - 1,
          changeType: "I",
          uprn: propertyData && propertyData.uprn,
          lpiKey: null,
          language: "CYM",
          logicalStatus: 6,
          startDate: currentDate,
          endDate: null,
          entryDate: currentDate,
          lastUpdateDate: currentDate,
          saoStartNumber: 0,
          saoStartSuffix: null,
          saoEndNumber: 0,
          saoEndSuffix: null,
          saoText: null,
          paoStartNumber: 0,
          paoStartSuffix: null,
          paoEndNumber: 0,
          paoEndSuffix: null,
          paoText: null,
          usrn: currentStreet,
          postcodeRef: 0,
          postTownRef: 0,
          officialFlag: null,
          neverExport: false,
          address: null,
          postTown: null,
          postcode: null,
          lastUpdated: currentDate,
          lastUser: currentUser,
          dualLanguageLink: maxDualLanguageLink ? maxDualLanguageLink.dualLanguageLink + 1 : 0,
        };

        newLPIs.push(newEngRec, newCymRec);
      } else newLPIs.push(newEngRec);

      setAssociatedPropertyData(
        newLPIs,
        propertyData.blpuProvenances,
        propertyData.blpuAppCrossRefs,
        propertyData.classifications,
        propertyData.organisations,
        propertyData.successorCrossRefs,
        propertyData.blpuNotes
      );

      setLpiFormData({
        pkId: newPkId,
        lpiData: newEngRec,
        blpuLogicalStatus: propertyData.logicalStatus,
        organisation: propertyData.organisation,
        index: newIdx,
        totalRecords: propertyData.lpis
          ? propertyData.lpis.filter((x) => x.changeType !== "D").length
          : settingsContext.isWelsh
          ? 2
          : 1,
      });

      sandboxContext.onSandboxChange("lpi", newEngRec);
      propertyContext.onRecordChange(24, newIdx, true);
    } else {
      const propertyChanged = hasPropertyChanged(
        propertyContext.currentProperty.newProperty,
        sandboxContext.currentSandbox
      );

      if (!propertyChanged || propertyContext.validateData()) {
        failedValidation.current = false;
        setLpiFormData({
          pkId: pkId,
          lpiData: lpiData,
          blpuLogicalStatus: propertyData.logicalStatus,
          organisation: propertyData.organisation,
          index: dataIdx,
          totalRecords: dataLength,
        });

        sandboxContext.onSandboxChange("lpi", lpiData);
        propertyContext.onRecordChange(24, dataIdx);
      } else if (propertyChanged) {
        failedValidation.current = true;
        saveResult.current = false;
        setSaveOpen(true);
      }
    }
  };

  /**
   * Event to handle when a classification record is selected from the list of classification records.
   *
   * @param {number} pkId The primary key for the selected record. If -1 the data is cleared. 0 indicates a new classification is required. Any number > 0 is existing data.
   * @param {object|null} classificationData The classification data for the selected record
   * @param {number|null} dataIdx The index of the record within the array of classification records.
   * @param {number|null} dataLength The total number of records in the array of classification records.
   */
  const handleClassificationSelected = (pkId, classificationData, dataIdx, dataLength) => {
    if (pkId === -1) {
      setClassificationFormData(null);
      propertyContext.onRecordChange(21, null);
      mapContext.onEditMapObject(null, null);
    } else if (pkId === 0) {
      const newIdx =
        propertyData && propertyData.classifications
          ? propertyData.classifications.filter((x) => x.changeType !== "D").length
          : 0;
      const currentDate = GetCurrentDate(false);
      const minPkIdClassification =
        propertyData.classifications && propertyData.classifications.length > 0
          ? propertyData.classifications.reduce((prev, curr) => (prev.pkId < curr.pkId ? prev : curr))
          : null;
      const newPkId =
        !minPkIdClassification || !minPkIdClassification.pkId || minPkIdClassification.pkId > -10
          ? -10
          : minPkIdClassification.pkId - 1;
      const newRec = {
        pkId: newPkId,
        changeType: "I",
        uprn: propertyData && propertyData.uprn,
        classKey: null,
        classificationScheme: OSGScheme,
        blpuClass: null,
        startDate: currentDate,
        endDate: null,
        entryDate: currentDate,
        lastUpdateDate: currentDate,
        neverExport: false,
      };

      const newClassifications = propertyData.classifications ? propertyData.classifications : [];
      newClassifications.push(newRec);

      setAssociatedPropertyData(
        propertyData.lpis,
        propertyData.blpuProvenances,
        propertyData.blpuAppCrossRefs,
        newClassifications,
        propertyData.organisations,
        propertyData.successorCrossRefs,
        propertyData.blpuNotes
      );

      setClassificationFormData({
        id: newPkId,
        classificationData: {
          id: newRec.pkId,
          changeType: newRec.changeType,
          uprn: newRec.uprn,
          classKey: newRec.classKey,
          classificationScheme: newRec.classificationScheme,
          blpuClass: newRec.blpuClass,
          startDate: newRec.startDate,
          endDate: newRec.endDate,
          entryDate: newRec.entryDate,
          lastUpdateDate: newRec.lastUpdateDate,
          neverExport: newRec.neverExport,
        },
        index: newIdx,
        totalRecords: propertyData.classifications
          ? propertyData.classifications.filter((x) => x.changeType !== "D").length
          : 1,
      });

      sandboxContext.onSandboxChange("classification", newRec);
      propertyContext.onRecordChange(32, newIdx, true);
      mapContext.onEditMapObject(32, newRec.pkId);
    } else {
      setClassificationFormData({
        id: pkId,
        classificationData: classificationData,
        index: dataIdx,
        totalRecords: dataLength,
      });

      sandboxContext.onSandboxChange("classification", classificationData);
      propertyContext.onRecordChange(32, dataIdx);
      mapContext.onEditMapObject(32, pkId);
    }
  };

  /**
   * Event to handle when a organisation record is selected from the list of organisation records.
   *
   * @param {number} pkId The primary key for the selected record. If -1 the data is cleared. 0 indicates a new organisation is required. Any number > 0 is existing data.
   * @param {object|null} organisationData The organisation data for the selected record
   * @param {number|null} dataIdx The index of the record within the array of organisation records.
   * @param {number|null} dataLength The total number of records in the array of organisation records.
   */
  const handleOrganisationSelected = (pkId, organisationData, dataIdx, dataLength) => {
    if (pkId === -1) {
      setOrganisationFormData(null);
      propertyContext.onRecordChange(21, null);
      mapContext.onEditMapObject(null, null);
    } else if (pkId === 0) {
      const newIdx =
        propertyData && propertyData.organisations
          ? propertyData.organisations.filter((x) => x.changeType !== "D").length
          : 0;
      const currentDate = GetCurrentDate(false);
      const minPkIdOrganisation =
        propertyData.organisations && propertyData.organisations.length > 0
          ? propertyData.organisations.reduce((prev, curr) => (prev.pkId < curr.pkId ? prev : curr))
          : null;
      const newPkId =
        !minPkIdOrganisation || !minPkIdOrganisation.pkId || minPkIdOrganisation.pkId > -10
          ? -10
          : minPkIdOrganisation.pkId - 1;
      const newRec = {
        pkId: newPkId,
        changeType: "I",
        uprn: propertyData && propertyData.uprn,
        orgKey: null,
        organisation: null,
        legalName: null,
        startDate: currentDate,
        endDate: null,
        entryDate: currentDate,
        lastUpdateDate: currentDate,
      };

      const newOrganisations = propertyData.organisations ? propertyData.organisations : [];
      newOrganisations.push(newRec);

      setAssociatedPropertyData(
        propertyData.lpis,
        propertyData.blpuProvenances,
        propertyData.blpuAppCrossRefs,
        propertyData.classifications,
        newOrganisations,
        propertyData.successorCrossRefs,
        propertyData.blpuNotes
      );

      setOrganisationFormData({
        id: newPkId,
        organisationData: {
          id: newRec.pkId,
          changeType: newRec.changeType,
          uprn: newRec.uprn,
          orgKey: newRec.orgKey,
          organisation: newRec.organisation,
          legalName: newRec.legalName,
          startDate: newRec.startDate,
          endDate: newRec.endDate,
          entryDate: newRec.entryDate,
          lastUpdateDate: newRec.lastUpdateDate,
        },
        index: newIdx,
        totalRecords: propertyData.organisations
          ? propertyData.organisations.filter((x) => x.changeType !== "D").length
          : 1,
      });

      sandboxContext.onSandboxChange("organisation", newRec);
      propertyContext.onRecordChange(31, newIdx, true);
      mapContext.onEditMapObject(31, newRec.pkId);
    } else {
      setOrganisationFormData({
        id: pkId,
        organisationData: organisationData,
        index: dataIdx,
        totalRecords: dataLength,
      });

      sandboxContext.onSandboxChange("organisation", organisationData);
      propertyContext.onRecordChange(31, dataIdx);
      mapContext.onEditMapObject(31, pkId);
    }
  };

  /**
   * Event to handle when a successor cross reference record is selected from the list of successor cross reference records.
   *
   * @param {number} pkId The primary key for the selected record. If -1 the data is cleared. 0 indicates a new successor cross reference is required. Any number > 0 is existing data.
   * @param {object|null} successorCrossRefData The successor cross reference data for the selected record
   * @param {number|null} dataIdx The index of the record within the array of successor cross reference records.
   * @param {number|null} dataLength The total number of records in the array of successor cross reference records.
   */
  const handleSuccessorCrossRefSelected = (pkId, successorCrossRefData, dataIdx, dataLength) => {
    if (pkId === -1) {
      setSuccessorCrossRefFormData(null);
      propertyContext.onRecordChange(21, null);
      mapContext.onEditMapObject(null, null);
    } else if (pkId === 0) {
      const newIdx =
        propertyData && propertyData.successorCrossRefs
          ? propertyData.successorCrossRefs.filter((x) => x.changeType !== "D").length
          : 0;
      const currentDate = GetCurrentDate(false);
      const minPkIdSuccessorCrossRef =
        propertyData.successorCrossRefs && propertyData.successorCrossRefs.length > 0
          ? propertyData.successorCrossRefs.reduce((prev, curr) => (prev.pkId < curr.pkId ? prev : curr))
          : null;
      const newPkId =
        !minPkIdSuccessorCrossRef || !minPkIdSuccessorCrossRef.pkId || minPkIdSuccessorCrossRef.pkId > -10
          ? -10
          : minPkIdSuccessorCrossRef.pkId - 1;
      const newRec = {
        pkId: newPkId,
        changeType: "I",
        succKey: null,
        successor: propertyData && propertyData.uprn,
        successorType: 1,
        predecessor: null,
        startDate: currentDate,
        endDate: null,
        entryDate: currentDate,
        lastUpdateDate: currentDate,
      };

      const newSuccessorCrossRefs = propertyData.successorCrossRefs ? propertyData.successorCrossRefs : [];
      newSuccessorCrossRefs.push(newRec);

      setAssociatedPropertyData(
        propertyData.lpis,
        propertyData.blpuProvenances,
        propertyData.blpuAppCrossRefs,
        propertyData.classifications,
        propertyData.organisations,
        newSuccessorCrossRefs,
        propertyData.blpuNotes
      );

      setSuccessorCrossRefFormData({
        id: newPkId,
        successorCrossRefData: {
          id: newRec.pkId,
          changeType: newRec.changeType,
          succKey: newRec.succKey,
          successor: newRec.successor,
          successorType: newRec.successorType,
          predecessor: newRec.predecessor,
          startDate: newRec.startDate,
          endDate: newRec.endDate,
          entryDate: newRec.entryDate,
          lastUpdateDate: newRec.lastUpdateDate,
        },
        index: newIdx,
        totalRecords: propertyData.successorCrossRefs
          ? propertyData.successorCrossRefs.filter((x) => x.changeType !== "D").length
          : 1,
      });

      sandboxContext.onSandboxChange("successorCrossRef", newRec);
      propertyContext.onRecordChange(30, newIdx, true);
      mapContext.onEditMapObject(30, newRec.pkId);
    } else {
      setSuccessorCrossRefFormData({
        id: pkId,
        successorCrossRefData: successorCrossRefData,
        index: dataIdx,
        totalRecords: dataLength,
      });

      sandboxContext.onSandboxChange("successorCrossRef", successorCrossRefData);
      propertyContext.onRecordChange(30, dataIdx);
      mapContext.onEditMapObject(30, pkId);
    }
  };

  /**
   * Event to handle when a provenance record is selected from the list of provenance records.
   *
   * @param {number} pkId The primary key for the selected record. If -1 the data is cleared. 0 indicates a new provenance is required. Any number > 0 is existing data.
   * @param {object|null} provenanceData The provenance data for the selected record
   * @param {number|null} dataIdx The index of the record within the array of provenance records.
   * @param {number|null} dataLength The total number of records in the array of provenance records.
   */
  const handleProvenanceSelected = (pkId, provenanceData, dataIdx, dataLength) => {
    if (pkId === -1) {
      setProvenanceFormData(null);
      propertyContext.onRecordChange(21, null);
      mapContext.onEditMapObject(null, null);
    } else if (pkId === 0) {
      const newIdx =
        propertyData && propertyData.blpuProvenances
          ? propertyData.blpuProvenances.filter((x) => x.changeType !== "D").length
          : 0;
      const currentDate = GetCurrentDate(false);
      const minPkIdProvenance =
        propertyData.blpuProvenances && propertyData.blpuProvenances.length > 0
          ? propertyData.blpuProvenances.reduce((prev, curr) => (prev.pkId < curr.pkId ? prev : curr))
          : null;
      const newPkId =
        !minPkIdProvenance || !minPkIdProvenance.pkId || minPkIdProvenance.pkId > -10
          ? -10
          : minPkIdProvenance.pkId - 1;
      const newRec = {
        pkId: newPkId,
        changeType: "I",
        uprn: propertyData && propertyData.uprn,
        provenanceKey: null,
        provenanceCode: null,
        annotation: null,
        startDate: currentDate,
        endDate: null,
        entryDate: currentDate,
        lastUpdateDate: currentDate,
        wktGeometry: "",
      };

      const newProvenances = propertyData.blpuProvenances ? propertyData.blpuProvenances : [];
      newProvenances.push(newRec);

      setAssociatedPropertyData(
        propertyData.lpis,
        newProvenances,
        propertyData.blpuAppCrossRefs,
        propertyData.classifications,
        propertyData.organisations,
        propertyData.successorCrossRefs,
        propertyData.blpuNotes
      );

      setProvenanceFormData({
        id: newPkId,
        provenanceData: {
          id: newRec.pkId,
          changeType: newRec.changeType,
          uprn: newRec.uprn,
          provenanceKey: newRec.provenanceKey,
          provenanceCode: newRec.provenanceCode,
          annotation: newRec.annotation,
          startDate: newRec.startDate,
          endDate: newRec.endDate,
          entryDate: newRec.entryDate,
          lastUpdateDate: newRec.lastUpdateDate,
          wktGeometry: newRec.wktGeometry,
        },
        blpuLogicalStatus: propertyData.logicalStatus,
        index: newIdx,
        totalRecords: propertyData.blpuProvenances
          ? propertyData.blpuProvenances.filter((x) => x.changeType !== "D").length
          : 1,
      });

      sandboxContext.onSandboxChange("provenance", newRec);
      propertyContext.onRecordChange(22, newIdx, true);
      mapContext.onEditMapObject(22, newRec.pkId);
    } else {
      setProvenanceFormData({
        id: pkId,
        provenanceData: provenanceData,
        blpuLogicalStatus: propertyData.logicalStatus,
        index: dataIdx,
        totalRecords: dataLength,
      });

      sandboxContext.onSandboxChange("provenance", provenanceData);
      propertyContext.onRecordChange(22, dataIdx);
      mapContext.onEditMapObject(22, pkId);
    }
  };

  /**
   * Event to handle when a cross reference record is selected from the list of cross references records.
   *
   * @param {number} pkId The primary key for the selected record. If -1 the data is cleared. 0 indicates a new cross reference is required. Any number > 0 is existing data.
   * @param {object|null} xrefData The cross reference data for the selected record
   * @param {number|null} dataIdx The index of the record within the array of cross reference records.
   * @param {number|null} dataLength The total number of records in the array of cross reference records.
   */
  const handleCrossRefSelected = (pkId, xrefData, dataIdx, dataLength) => {
    mapContext.onEditMapObject(null, null);

    if (pkId === -1) {
      setCrossRefFormData(null);
      propertyContext.onRecordChange(21, null);
    } else if (pkId === 0) {
      const newIdx =
        propertyData && propertyData.blpuAppCrossRefs
          ? propertyData.blpuAppCrossRefs.filter((x) => x.changeType !== "D").length
          : 0;
      const currentDate = GetCurrentDate(false);
      const minPkIdXRef =
        propertyData.blpuAppCrossRefs && propertyData.blpuAppCrossRefs.length > 0
          ? propertyData.blpuAppCrossRefs.reduce((prev, curr) => (prev.pkId < curr.pkId ? prev : curr))
          : null;
      const newPkId = !minPkIdXRef || !minPkIdXRef.pkId || minPkIdXRef.pkId > -10 ? -10 : minPkIdXRef.pkId - 1;
      const newRec = {
        pkId: newPkId,
        uprn: propertyData && propertyData.uprn,
        changeType: "I",
        xrefKey: null,
        source: null,
        sourceId: null,
        crossReference: null,
        startDate: currentDate,
        endDate: null,
        entryDate: currentDate,
        lastUpdateDate: null,
        neverExport: false,
      };

      const newCrossRefs = propertyData.blpuAppCrossRefs ? propertyData.blpuAppCrossRefs : [];
      newCrossRefs.push(newRec);

      setAssociatedPropertyData(
        propertyData.lpis,
        propertyData.blpuProvenances,
        newCrossRefs,
        propertyData.classifications,
        propertyData.organisations,
        propertyData.successorCrossRefs,
        propertyData.blpuNotes
      );

      setCrossRefFormData({
        id: newPkId,
        xrefData: {
          id: newPkId,
          uprn: newRec.uprn,
          changeType: newRec.changeType,
          xrefKey: newRec.xrefKey,
          source: newRec.source,
          sourceId: newRec.sourceId,
          crossReference: newRec.crossReference,
          startDate: newRec.startDate,
          endDate: newRec.endDate,
          lastUpdateDate: newRec.lastUpdateDate,
          neverExport: newRec.neverExport,
        },
        blpuLogicalStatus: propertyData.logicalStatus,
        index: newIdx,
        totalRecords: propertyData.blpuAppCrossRefs
          ? propertyData.blpuAppCrossRefs.filter((x) => x.changeType !== "D").length
          : 1,
      });

      sandboxContext.onSandboxChange("appCrossRef", newRec);
      propertyContext.onRecordChange(23, newIdx, true);
    } else {
      setCrossRefFormData({
        id: pkId,
        xrefData: xrefData,
        blpuLogicalStatus: propertyData.logicalStatus,
        index: dataIdx,
        totalRecords: dataLength,
      });

      sandboxContext.onSandboxChange("appCrossRef", xrefData);
      propertyContext.onRecordChange(23, dataIdx);
    }
  };

  /**
   * Event to handle when a note record is selected from the list of note records.
   *
   * @param {number} pkId The primary key for the note record. If -1 the data is cleared. 0 indicates a new note is required. Any number > 0 is existing data.
   * @param {object|null} noteData The note data for the selected record
   * @param {number|null} dataIdx The index of the record within the array of note records.
   */
  const handleNoteSelected = (pkId, noteData, dataIdx) => {
    mapContext.onEditMapObject(null, null);

    if (pkId === -1) {
      setNotesFormData(null);
      propertyContext.onRecordChange(21, null);
    } else if (pkId === 0) {
      const newIdx =
        propertyData && propertyData.blpuNotes ? propertyData.blpuNotes.filter((x) => x.changeType !== "D").length : 0;

      const currentDate = GetCurrentDate(false);
      const minPkIdNote =
        propertyData.blpuNotes && propertyData.blpuNotes.length > 0
          ? propertyData.blpuNotes.reduce((prev, curr) => (prev.pkId < curr.pkId ? prev : curr))
          : null;
      const newPkId = !minPkIdNote || !minPkIdNote.pkId || minPkIdNote.pkId > -10 ? -10 : minPkIdNote.pkId - 1;
      const maxSeqNo =
        propertyData.blpuNotes && propertyData.blpuNotes.length > 0
          ? propertyData.blpuNotes.reduce((prev, curr) => (prev.seqNo > curr.seqNo ? prev : curr))
          : null;
      const newSeqNo = maxSeqNo && maxSeqNo.seqNo ? maxSeqNo.seqNo + 1 : 1;

      const newRec = {
        createdDate: currentDate,
        lastUpdatedDate: currentDate,
        pkId: newPkId,
        seqNo: newSeqNo,
        uprn: propertyData && propertyData.uprn,
        note: null,
        changeType: "I",
        lastUser: userContext.currentUser
          ? `${userContext.currentUser.firstName} ${userContext.currentUser.lastName}`
          : null,
      };

      const newNotes = propertyData.blpuNotes ? propertyData.blpuNotes : [];
      newNotes.push(newRec);

      setAssociatedPropertyData(
        propertyData.lpis,
        propertyData.blpuProvenances,
        propertyData.blpuAppCrossRefs,
        propertyData.classifications,
        propertyData.organisations,
        propertyData.successorCrossRefs,
        newNotes
      );

      setNotesFormData({
        pkId: newPkId,
        noteData: newRec,
        index: newIdx,
        totalRecords: propertyData.blpuNotes ? propertyData.blpuNotes.filter((x) => x.changeType !== "D").length : 1,
        variant: "property",
      });

      sandboxContext.onSandboxChange("propertyNote", newRec);
      propertyContext.onRecordChange(71, newIdx, true);
    } else {
      setNotesFormData({
        pkId: pkId,
        noteData: noteData,
        index: dataIdx,
        totalRecords: data.blpuNotes.filter((x) => x.changeType !== "D").length,
        variant: "property",
      });

      sandboxContext.onSandboxChange("propertyNote", noteData);
      propertyContext.onRecordChange(71, dataIdx);
    }
  };

  /**
   * Event to handle the deleting of a LPI
   *
   * @param {number} pkId The id of the LPI that the user wants to delete.
   */
  const handleDeleteLPI = (pkId) => {
    function GetDeletedLpi(deleteLpi) {
      return !settingsContext.isScottish
        ? {
            language: deleteLpi.language,
            startDate: deleteLpi.startDate,
            endDate: deleteLpi.endDate,
            saoStartNumber: deleteLpi.saoStartNumber,
            saoEndNumber: deleteLpi.saoEndNumber,
            saoText: deleteLpi.saoText,
            paoStartNumber: deleteLpi.paoStartNumber,
            paoEndNumber: deleteLpi.paoEndNumber,
            paoText: deleteLpi.paoText,
            usrn: deleteLpi.usrn,
            postcodeRef: deleteLpi.postcodeRef,
            postTownRef: deleteLpi.postTownRef,
            neverExport: deleteLpi.neverExport,
            postTown: deleteLpi.postTown,
            postcode: deleteLpi.postcode,
            dualLanguageLink: deleteLpi.dualLanguageLink,
            uprn: deleteLpi.uprn,
            logicalStatus: deleteLpi.logicalStatus,
            paoStartSuffix: deleteLpi.paoStartSuffix,
            paoEndSuffix: deleteLpi.paoEndSuffix,
            saoStartSuffix: deleteLpi.saoStartSuffix,
            saoEndSuffix: deleteLpi.saoEndSuffix,
            level: deleteLpi.level,
            postalAddress: deleteLpi.postalAddress,
            officialFlag: deleteLpi.officialFlag,
            pkId: deleteLpi.pkId,
            changeType: "D",
            lpiKey: deleteLpi.lpiKey,
            address: deleteLpi.address,
            entryDate: deleteLpi.entryDate,
            lastUpdateDate: deleteLpi.lastUpdateDate,
          }
        : {
            language: deleteLpi.language,
            startDate: deleteLpi.startDate,
            endDate: deleteLpi.endDate,
            saoStartNumber: deleteLpi.saoStartNumber,
            saoEndNumber: deleteLpi.saoEndNumber,
            saoText: deleteLpi.saoText,
            paoStartNumber: deleteLpi.paoStartNumber,
            paoEndNumber: deleteLpi.paoEndNumber,
            paoText: deleteLpi.paoText,
            usrn: deleteLpi.usrn,
            postcodeRef: deleteLpi.postcodeRef,
            postTownRef: deleteLpi.postTownRef,
            neverExport: deleteLpi.neverExport,
            postTown: deleteLpi.postTown,
            postcode: deleteLpi.postcode,
            dualLanguageLink: deleteLpi.dualLanguageLink,
            uprn: deleteLpi.uprn,
            logicalStatus: deleteLpi.logicalStatus,
            paoStartSuffix: deleteLpi.paoStartSuffix,
            paoEndSuffix: deleteLpi.paoEndSuffix,
            saoStartSuffix: deleteLpi.saoStartSuffix,
            saoEndSuffix: deleteLpi.saoEndSuffix,
            subLocalityRef: deleteLpi.subLocalityRef,
            subLocality: deleteLpi.subLocality,
            postallyAddressable: deleteLpi.postallyAddressable,
            officialFlag: deleteLpi.officialFlag,
            pkId: deleteLpi.pkId,
            changeType: "D",
            lpiKey: deleteLpi.lpiKey,
            address: deleteLpi.address,
            entryDate: deleteLpi.entryDate,
            lastUpdateDate: deleteLpi.lastUpdateDate,
          };
    }

    if (pkId && pkId > 0) {
      if (settingsContext.isWelsh) {
        const lpi1 = propertyData.lpis.find((x) => x.pkId === pkId);

        if (lpi1) {
          const bilingualId = getBilingualSource(lookupContext);
          const linkXRef = propertyData.blpuAppCrossRefs.find(
            (x) => x.sourceId === bilingualId && x.crossReference.includes(lpi1.lpiKey)
          );

          if (linkXRef) {
            const lpi2 = propertyData.lpis.find((x) => x.lpiKey === linkXRef.crossReference.replace(lpi1.lpiKey, ""));

            if (lpi2) {
              const deletedLpi1 = GetDeletedLpi(lpi1);
              const deletedLpi2 = GetDeletedLpi(lpi2);
              const deletedXref = {
                changeType: "D",
                uprn: linkXRef.uprn,
                startDate: linkXRef.startDate,
                endDate: linkXRef.endDate,
                crossReference: linkXRef.crossReference,
                sourceId: linkXRef.sourceId,
                source: linkXRef.source,
                neverExport: linkXRef.neverExport,
                pkId: linkXRef.pkId,
                xrefKey: linkXRef.xrefKey,
                lastUpdateDate: linkXRef.lastUpdateDate,
                entryDate: linkXRef.entryDate,
              };

              const newLpis = propertyData.lpis.map(
                (x) =>
                  [deletedLpi1].find((rec) => rec.pkId === x.pkId) ||
                  [deletedLpi2].find((rec) => rec.pkId === x.pkId) ||
                  x
              );
              const newCrossRefs = propertyData.blpuAppCrossRefs.map(
                (x) => [deletedXref].find((rec) => rec.xrefKey === x.xrefKey) || x
              );

              setAssociatedPropertyData(
                newLpis,
                propertyData.blpuProvenances,
                newCrossRefs,
                propertyData.classifications,
                propertyData.organisations,
                propertyData.successorCrossRefs,
                propertyData.blpuNotes
              );
            }
          }
        }
      } else {
        const deleteLpi = propertyData.lpis.find((x) => x.pkId === pkId);

        if (deleteLpi) {
          const deletedLpi = GetDeletedLpi(deleteLpi);

          const newLpis = propertyData.lpis.map((x) => [deletedLpi].find((rec) => rec.pkId === x.pkId) || x);

          setAssociatedPropertyData(
            newLpis,
            propertyData.blpuProvenances,
            propertyData.blpuAppCrossRefs,
            propertyData.classifications,
            propertyData.organisations,
            propertyData.successorCrossRefs,
            propertyData.blpuNotes
          );
        }
      }
    } else if (pkId && pkId < 0) {
      // If the LPI has just been added and not saved we can just remove the record/s
      if (settingsContext.isWelsh) {
        const deleteLpi = propertyData.lpis.find((x) => x.pkId === pkId);

        if (deleteLpi) {
          const newLpis = propertyData.lpis.filter((x) => x.dualLanguageLink !== deleteLpi.dualLanguageLink);

          setAssociatedPropertyData(
            newLpis,
            propertyData.blpuProvenances,
            propertyData.blpuAppCrossRefs,
            propertyData.classifications,
            propertyData.organisations,
            propertyData.successorCrossRefs,
            propertyData.blpuNotes
          );
        }
      } else {
        const newLpis = propertyData.lpis.filter((x) => x.pkId !== pkId);
        setAssociatedPropertyData(
          newLpis,
          propertyData.blpuProvenances,
          propertyData.blpuAppCrossRefs,
          propertyData.classifications,
          propertyData.organisations,
          propertyData.successorCrossRefs,
          propertyData.blpuNotes
        );
      }
    }
  };

  /**
   * Event to handle the deleting of a classification.
   *
   * @param {number} pkId The id of the classification the user wants to delete.
   */
  const handleDeleteClassification = (pkId) => {
    if (pkId && pkId > 0) {
      const deleteClassification = propertyData.classifications.find((x) => x.pkId === pkId);

      if (deleteClassification) {
        const deletedClassification = {
          entryDate: deleteClassification.entryDate,
          pkId: deleteClassification.pkId,
          classKey: deleteClassification.classKey,
          uprn: deleteClassification.uprn,
          changeType: "D",
          classificationScheme: deleteClassification.classificationScheme,
          blpuClass: deleteClassification.blpuClass,
          startDate: deleteClassification.startDate,
          endDate: deleteClassification.endDate,
        };

        const newClassifications = propertyData.classifications.map(
          (x) => [deletedClassification].find((rec) => rec.pkId === x.pkId) || x
        );

        setAssociatedPropertyData(
          propertyData.lpis,
          propertyData.blpuProvenances,
          propertyData.blpuAppCrossRefs,
          newClassifications,
          propertyData.organisations,
          propertyData.successorCrossRefs,
          propertyData.blpuNotes
        );
      }
    } else if (pkId && pkId < 0) {
      const newClassifications = propertyData.classifications.filter((x) => x.pkId !== pkId);
      setAssociatedPropertyData(
        propertyData.lpis,
        propertyData.blpuProvenances,
        propertyData.blpuAppCrossRefs,
        newClassifications,
        propertyData.organisations,
        propertyData.successorCrossRefs,
        propertyData.blpuNotes
      );
    }
  };

  /**
   * Event to handle the deleting of multiple classifications.
   *
   * @param {Array} classificationIds The list of classification ids that the user wants to delete.
   */
  const handleMultiDeleteClassification = (classificationIds) => {
    if (classificationIds && classificationIds.length > 0) {
      const deleteClassifications = propertyData.classifications
        .filter((x) => classificationIds.includes(x.pkId))
        .map((classification) => {
          classification.changeType = "D";
          return classification;
        });

      if (deleteClassifications && deleteClassifications.length > 0) {
        const classificationDeleted = propertyData.classifications.map(
          (x) => deleteClassifications.filter((x) => x.pkId > 0).find((rec) => rec.pkId === x.pkId) || x
        );

        setAssociatedPropertyData(
          propertyData.lpis,
          propertyData.blpuProvenances,
          propertyData.blpuAppCrossRefs,
          classificationDeleted,
          propertyData.organisations,
          propertyData.successorCrossRefs,
          propertyData.blpuNotes
        );
      }
    }
  };

  /**
   * Event to handle the deleting of a organisation.
   *
   * @param {number} pkId The id of the organisation the user wants to delete.
   */
  const handleDeleteOrganisation = (pkId) => {
    if (pkId && pkId > 0) {
      const deleteOrganisation = propertyData.organisations.find((x) => x.pkId === pkId);

      if (deleteOrganisation) {
        const deletedOrganisation = {
          entryDate: deleteOrganisation.entryDate,
          pkId: deleteOrganisation.pkId,
          orgKey: deleteOrganisation.orgKey,
          uprn: deleteOrganisation.uprn,
          changeType: "D",
          organisation: deleteOrganisation.organisation,
          legalName: deleteOrganisation.legalName,
          startDate: deleteOrganisation.startDate,
          endDate: deleteOrganisation.endDate,
        };

        const newOrganisations = propertyData.organisations.map(
          (x) => [deletedOrganisation].find((rec) => rec.pkId === x.pkId) || x
        );

        setAssociatedPropertyData(
          propertyData.lpis,
          propertyData.blpuProvenances,
          propertyData.blpuAppCrossRefs,
          propertyData.classifications,
          newOrganisations,
          propertyData.successorCrossRefs,
          propertyData.blpuNotes
        );
      }
    } else if (pkId && pkId < 0) {
      const newOrganisations = propertyData.organisations.filter((x) => x.pkId !== pkId);
      setAssociatedPropertyData(
        propertyData.lpis,
        propertyData.blpuProvenances,
        propertyData.blpuAppCrossRefs,
        propertyData.classifications,
        newOrganisations,
        propertyData.successorCrossRefs,
        propertyData.blpuNotes
      );
    }
  };

  /**
   * Event to handle the deleting of multiple organisations.
   *
   * @param {Array} organisationIds The list of organisation ids that the user wants to delete.
   */
  const handleMultiDeleteOrganisation = (organisationIds) => {
    if (organisationIds && organisationIds.length > 0) {
      const deleteOrganisations = propertyData.organisations
        .filter((x) => organisationIds.includes(x.pkId))
        .map((organisation) => {
          organisation.changeType = "D";
          return organisation;
        });

      if (deleteOrganisations && deleteOrganisations.length > 0) {
        const organisationDeleted = propertyData.organisations.map(
          (x) => deleteOrganisations.filter((x) => x.pkId > 0).find((rec) => rec.pkId === x.pkId) || x
        );

        setAssociatedPropertyData(
          propertyData.lpis,
          propertyData.blpuProvenances,
          propertyData.blpuAppCrossRefs,
          propertyData.classifications,
          organisationDeleted,
          propertyData.successorCrossRefs,
          propertyData.blpuNotes
        );
      }
    }
  };

  /**
   * Event to handle the deleting of a successor cross reference.
   *
   * @param {number} pkId The id of the successor cross reference the user wants to delete.
   */
  const handleDeleteSuccessorCrossRef = (pkId) => {
    if (pkId && pkId > 0) {
      const deleteSuccessorCrossRef = propertyData.successorCrossRefs.find((x) => x.pkId === pkId);

      if (deleteSuccessorCrossRef) {
        const deletedSuccessorCrossRef = {
          entryDate: deleteSuccessorCrossRef.entryDate,
          pkId: deleteSuccessorCrossRef.pkId,
          succKey: deleteSuccessorCrossRef.succKey,
          changeType: "D",
          predecessor: deleteSuccessorCrossRef.predecessor,
          successorType: deleteSuccessorCrossRef.successorType,
          successor: deleteSuccessorCrossRef.successor,
          startDate: deleteSuccessorCrossRef.startDate,
          endDate: deleteSuccessorCrossRef.endDate,
        };

        const newSuccessorCrossRefs = propertyData.successorCrossRefs.map(
          (x) => [deletedSuccessorCrossRef].find((rec) => rec.pkId === x.pkId) || x
        );

        setAssociatedPropertyData(
          propertyData.lpis,
          propertyData.blpuProvenances,
          propertyData.blpuAppCrossRefs,
          propertyData.classifications,
          propertyData.organisations,
          newSuccessorCrossRefs,
          propertyData.blpuNotes
        );
      }
    } else if (pkId && pkId < 0) {
      const newSuccessorCrossRefs = propertyData.successorCrossRefs.filter((x) => x.pkId !== pkId);
      setAssociatedPropertyData(
        propertyData.lpis,
        propertyData.blpuProvenances,
        propertyData.blpuAppCrossRefs,
        propertyData.classifications,
        propertyData.organisations,
        newSuccessorCrossRefs,
        propertyData.blpuNotes
      );
    }
  };

  /**
   * Event to handle the deleting of multiple successor cross references.
   *
   * @param {Array} successorCrossRefIds The list of successor cross reference ids that the user wants to delete.
   */
  const handleMultiDeleteSuccessorCrossRef = (successorCrossRefIds) => {
    if (successorCrossRefIds && successorCrossRefIds.length > 0) {
      const deleteSuccessorCrossRefs = propertyData.successorCrossRefs
        .filter((x) => successorCrossRefIds.includes(x.pkId))
        .map((successorCrossRef) => {
          successorCrossRef.changeType = "D";
          return successorCrossRef;
        });

      if (deleteSuccessorCrossRefs && deleteSuccessorCrossRefs.length > 0) {
        const successorCrossRefDeleted = propertyData.successorCrossRefs.map(
          (x) => deleteSuccessorCrossRefs.filter((x) => x.pkId > 0).find((rec) => rec.pkId === x.pkId) || x
        );

        setAssociatedPropertyData(
          propertyData.lpis,
          propertyData.blpuProvenances,
          propertyData.blpuAppCrossRefs,
          propertyData.classifications,
          propertyData.organisations,
          successorCrossRefDeleted,
          propertyData.blpuNotes
        );
      }
    }
  };

  /**
   * Event to handle the deleting of a provenance.
   *
   * @param {number} pkId The id of the provenance the user wants to delete.
   */
  const handleDeleteProvenance = (pkId) => {
    if (pkId && pkId > 0) {
      const deleteProvenance = propertyData.blpuProvenances.find((x) => x.pkId === pkId);

      if (deleteProvenance) {
        const deletedProvenance = {
          entryDate: deleteProvenance.entryDate,
          pkId: deleteProvenance.pkId,
          provenanceKey: deleteProvenance.provenanceKey,
          uprn: deleteProvenance.uprn,
          changeType: "D",
          provenanceCode: deleteProvenance.provenanceCode,
          annotation: deleteProvenance.annotation,
          startDate: deleteProvenance.startDate,
          endDate: deleteProvenance.endDate,
          wktGeometry: deleteProvenance.wktGeometry,
        };

        const newProvenances = propertyData.blpuProvenances.map(
          (x) => [deletedProvenance].find((rec) => rec.pkId === x.pkId) || x
        );

        setAssociatedPropertyData(
          propertyData.lpis,
          newProvenances,
          propertyData.blpuAppCrossRefs,
          propertyData.classifications,
          propertyData.organisations,
          propertyData.successorCrossRefs,
          propertyData.blpuNotes
        );
      }
    } else if (pkId && pkId < 0) {
      const newProvenances = propertyData.blpuProvenances.filter((x) => x.pkId !== pkId);
      setAssociatedPropertyData(
        propertyData.lpis,
        newProvenances,
        propertyData.blpuAppCrossRefs,
        propertyData.classifications,
        propertyData.organisations,
        propertyData.successorCrossRefs,
        propertyData.blpuNotes
      );
    }
  };

  /**
   * Event to handle the deleting of multiple provenances.
   *
   * @param {Array} provenanceIds The list of provenance ids that the user wants to delete.
   */
  const handleMultiDeleteProvenance = (provenanceIds) => {
    if (provenanceIds && provenanceIds.length > 0) {
      const deleteProvenances = propertyData.blpuProvenances
        .filter((x) => provenanceIds.includes(x.pkId))
        .map((provenance) => {
          provenance.changeType = "D";
          return provenance;
        });

      if (deleteProvenances && deleteProvenances.length > 0) {
        const provenanceDeleted = propertyData.blpuProvenances.map(
          (x) => deleteProvenances.filter((x) => x.pkId > 0).find((rec) => rec.pkId === x.pkId) || x
        );

        setAssociatedPropertyData(
          propertyData.lpis,
          provenanceDeleted,
          propertyData.blpuAppCrossRefs,
          propertyData.classifications,
          propertyData.organisations,
          propertyData.successorCrossRefs,
          propertyData.blpuNotes
        );
      }
    }
  };

  /**
   * Event to handle the deleting of a cross reference.
   *
   * @param {number} pkId The id of the cross reference record the user wants to delete.
   */
  const handleDeleteCrossRef = (pkId) => {
    if (pkId && pkId > 0) {
      const deleteCrossRef = propertyData.blpuAppCrossRefs.find((x) => x.pkId === pkId);

      if (deleteCrossRef) {
        const deletedCrossRef = {
          changeType: "D",
          uprn: deleteCrossRef.uprn,
          startDate: deleteCrossRef.startDate,
          endDate: deleteCrossRef.endDate,
          crossReference: deleteCrossRef.crossReference,
          sourceId: deleteCrossRef.sourceId,
          source: deleteCrossRef.source,
          neverExport: deleteCrossRef.neverExport,
          pkId: deleteCrossRef.pkId,
          xrefKey: deleteCrossRef.xrefKey,
          lastUpdateDate: deleteCrossRef.lastUpdateDate,
          entryDate: deleteCrossRef.entryDate,
        };

        const newCrossRefs = propertyData.blpuAppCrossRefs.map(
          (x) => [deletedCrossRef].find((rec) => rec.pkId === x.pkId) || x
        );

        if (deleteCrossRef.sourceId === getBilingualSource(lookupContext)) {
          const deleteLinkedLpis = propertyData.lpis
            .filter((x) => deleteCrossRef.crossReference.includes(x.lpiKey))
            .map((lpi) => {
              lpi.changeType = "D";
              return lpi;
            });
          const linkedLpisDeleted = propertyData.lpis.map(
            (x) => deleteLinkedLpis.find((rec) => rec.pkId === x.pkId) || x
          );
          setAssociatedPropertyData(
            linkedLpisDeleted,
            propertyData.blpuProvenances,
            newCrossRefs,
            propertyData.classifications,
            propertyData.organisations,
            propertyData.successorCrossRefs,
            propertyData.blpuNotes
          );
        } else
          setAssociatedPropertyData(
            propertyData.lpis,
            propertyData.blpuProvenances,
            newCrossRefs,
            propertyData.classifications,
            propertyData.organisations,
            propertyData.successorCrossRefs,
            propertyData.blpuNotes
          );
        handleCrossRefSelected(-1, null, null, null);
      }
    } else if (pkId && pkId < 0) {
      const newCrossRefs = propertyData.blpuAppCrossRefs.filter((x) => x.pkId !== pkId);
      setAssociatedPropertyData(
        propertyData.lpis,
        propertyData.blpuProvenances,
        newCrossRefs,
        propertyData.classifications,
        propertyData.organisations,
        propertyData.successorCrossRefs,
        propertyData.blpuNotes
      );
      handleCrossRefSelected(-1, null, null, null);
    }
  };

  /**
   * Event to handle deleting of multiple cross references.
   *
   * @param {Array} crossRefIds The list of cross reference ids that the user wants to delete.
   */
  const handleMultiDeleteCrossRef = (crossRefIds) => {
    if (crossRefIds && crossRefIds.length > 0) {
      const deleteCrossRefs = propertyData.blpuAppCrossRefs
        .filter((x) => crossRefIds.includes(x.pkId))
        .map((crossRef) => {
          crossRef.changeType = "D";
          return crossRef;
        });

      if (deleteCrossRefs && deleteCrossRefs.length > 0) {
        const crossRefDeleted = propertyData.blpuAppCrossRefs.map(
          (x) => deleteCrossRefs.filter((x) => x.pkId > 0).find((rec) => rec.pkId === x.pkId) || x
        );

        const bilingualId = getBilingualSource(lookupContext);
        const deleteLinkedLpiCrossRefs = deleteCrossRefs
          .filter((x) => x.sourceId === bilingualId)
          .map((x) => x.crossReference);

        let lpisToDelete = [];

        for (const linkedXref of deleteLinkedLpiCrossRefs) {
          lpisToDelete.push(linkedXref.substring(0, 14));
          lpisToDelete.push(linkedXref.substring(14));
        }

        if (lpisToDelete && lpisToDelete.length > 0) {
          const deleteLinkedLpis = propertyData.lpis
            .filter((x) => lpisToDelete.includes(x.lpiKey))
            .map((rec) => {
              rec.changeType = "D";
              return rec;
            });

          const linkedLpisDeleted = propertyData.lpis.map(
            (x) => deleteLinkedLpis.find((rec) => rec.pkId === x.pkId) || x
          );

          setAssociatedPropertyData(
            linkedLpisDeleted,
            propertyData.blpuProvenances,
            crossRefDeleted,
            propertyData.classifications,
            propertyData.organisations,
            propertyData.successorCrossRefs,
            propertyData.blpuNotes
          );
        } else
          setAssociatedPropertyData(
            propertyData.lpis,
            propertyData.blpuProvenances,
            crossRefDeleted,
            propertyData.classifications,
            propertyData.organisations,
            propertyData.successorCrossRefs,
            propertyData.blpuNotes
          );
      }
    }
  };

  /**
   * Event to handle the deleting of a note.
   *
   * @param {number} pkId The id of the note that the user wants to delete.
   */
  const handleDeleteNote = (pkId) => {
    if (pkId && pkId > 0) {
      const deleteNote = propertyData.blpuNotes.find((x) => x.pkId === pkId);

      if (deleteNote) {
        const deletedNote = {
          createdDate: deleteNote.createdDate,
          lastUpdateDate: deleteNote.lastUpdateDate,
          pkId: deleteNote.pkId,
          seqNo: deleteNote.seqNo,
          uprn: deleteNote.uprn,
          note: deleteNote.note,
          changeType: "D",
          lastUser: deleteNote.lastUser,
        };

        const newNotes = propertyData.blpuNotes.map((x) => [deletedNote].find((rec) => rec.pkId === x.pkId) || x);

        setAssociatedPropertyData(
          propertyData.lpis,
          propertyData.blpuProvenances,
          propertyData.blpuAppCrossRefs,
          propertyData.classifications,
          propertyData.organisations,
          propertyData.successorCrossRefs,
          newNotes
        );
      }
    } else if (pkId && pkId < 0) {
      const newNotes = propertyData.blpuNotes.filter((x) => x.pkId !== pkId);
      setAssociatedPropertyData(
        propertyData.lpis,
        propertyData.blpuProvenances,
        propertyData.blpuAppCrossRefs,
        propertyData.classifications,
        propertyData.organisations,
        propertyData.successorCrossRefs,
        newNotes
      );
    }
  };

  /**
   * Event to handle adding a new property.
   *
   * @param {number} usrn The USRN of the street the property is being added to.
   * @param {number} easting The easting to be used for the new property.
   * @param {number} northing The northing to be used for the new property.
   * @param {object} parent The details of the parent property if creating a child property.
   */
  const handlePropertyAdd = (usrn, easting, northing, parent) => {
    const propertyChanged = hasPropertyChanged(
      propertyContext.currentProperty.newProperty,
      sandboxContext.currentSandbox
    );

    if (propertyChanged) {
      saveConfirmDialog(true)
        .then((result) => {
          if (result === "save") {
            if (propertyContext.validateData()) {
              failedValidation.current = false;
              handleSaveClicked();
            } else {
              failedValidation.current = true;
              saveResult.current = false;
              setSaveOpen(true);
            }
          }
          ResetContexts("property", mapContext, streetContext, propertyContext, sandboxContext);
          handleAddProperty(usrn, easting, northing, parent);
        })
        .catch(() => {});
    } else {
      ResetContexts("property", mapContext, streetContext, propertyContext, sandboxContext);
      handleAddProperty(usrn, easting, northing, parent);
    }
  };

  /**
   * Event to handle adding a new property.
   *
   * @param {number} usrn The USRN of the street the property is being added to.
   * @param {number} easting The easting to be used for the new property.
   * @param {number} northing The northing to be used for the new property.
   * @param {object} parent The details of the parent property if creating a child property.
   */
  const handleAddProperty = (usrn, easting, northing, parent) => {
    streetContext.onStreetChange(0, "", false);

    propertyContext.onPropertyChange(0, usrn, null, null, null, easting, northing, true, parent);

    const currentSearchProperties = [
      {
        uprn: 0,
        address: null,
        postcode: null,
        easting: easting,
        northing: northing,
        logicalStatus: 6,
        classificationCode: "U",
      },
    ];

    mapContext.onSearchDataChange([], currentSearchProperties, null, "0");
    mapContext.onEditMapObject(21, 0);
  };

  /**
   * Event to handle adding a new LPI to the existing property.
   */
  const handleAddLPI = () => {
    handleLPISelected(0, null, null, null);
  };

  /**
   * Event to add a child to the existing property.
   */
  const handleChildAdd = () => {
    const engLpiData = propertyData.lpis
      .filter((x) => x.language === "ENG")
      .sort((a, b) => a.logicalStatus - b.logicalStatus);
    const cymLpiData = propertyData.lpis
      .filter((x) => x.language === "CYM")
      .sort((a, b) => a.logicalStatus - b.logicalStatus);
    const gaeLpiData = propertyData.lpis
      .filter((x) => x.language === "GAE")
      .sort((a, b) => a.logicalStatus - b.logicalStatus);

    const parent =
      cymLpiData && cymLpiData.length > 0 && engLpiData && engLpiData.length > 0
        ? {
            uprn: propertyData.uprn,
            rpc: propertyData.rpc,
            eng: {
              paoStartNumber: engLpiData[0].paoStartNumber,
              paoStartSuffix: engLpiData[0].paoStartSuffix,
              paoEndNumber: engLpiData[0].paoEndNumber,
              paoEndSuffix: engLpiData[0].paoEndSuffix,
              paoText: engLpiData[0].paoText,
              address: engLpiData[0].address,
              postTownRef: engLpiData[0].postTownRef,
              postcodeRef: engLpiData[0].postcodeRef,
              postTown: engLpiData[0].postTown,
              postcode: engLpiData[0].postcode,
            },
            cym: {
              paoStartNumber: cymLpiData[0].paoStartNumber,
              paoStartSuffix: cymLpiData[0].paoStartSuffix,
              paoEndNumber: cymLpiData[0].paoEndNumber,
              paoEndSuffix: cymLpiData[0].paoEndSuffix,
              paoText: cymLpiData[0].paoText,
              address: cymLpiData[0].address,
              postTownRef: cymLpiData[0].postTownRef,
              postcodeRef: cymLpiData[0].postcodeRef,
              postTown: cymLpiData[0].postTown,
              postcode: cymLpiData[0].postcode,
            },
          }
        : gaeLpiData && gaeLpiData.length > 0 && engLpiData && engLpiData.length > 0
        ? {
            uprn: propertyData.uprn,
            rpc: propertyData.rpc,
            eng: {
              paoStartNumber: engLpiData[0].paoStartNumber,
              paoStartSuffix: engLpiData[0].paoStartSuffix,
              paoEndNumber: engLpiData[0].paoEndNumber,
              paoEndSuffix: engLpiData[0].paoEndSuffix,
              paoText: engLpiData[0].paoText,
              address: engLpiData[0].address,
              postTownRef: engLpiData[0].postTownRef,
              postcodeRef: engLpiData[0].postcodeRef,
              postTown: engLpiData[0].postTown,
              postcode: engLpiData[0].postcode,
            },
            gae: {
              paoStartNumber: gaeLpiData[0].paoStartNumber,
              paoStartSuffix: gaeLpiData[0].paoStartSuffix,
              paoEndNumber: gaeLpiData[0].paoEndNumber,
              paoEndSuffix: gaeLpiData[0].paoEndSuffix,
              paoText: gaeLpiData[0].paoText,
              address: gaeLpiData[0].address,
              postTownRef: gaeLpiData[0].postTownRef,
              postcodeRef: gaeLpiData[0].postcodeRef,
              postTown: gaeLpiData[0].postTown,
              postcode: gaeLpiData[0].postcode,
            },
          }
        : engLpiData && engLpiData.length > 0
        ? {
            uprn: propertyData.uprn,
            rpc: propertyData.rpc,
            eng: {
              paoStartNumber: engLpiData[0].paoStartNumber,
              paoStartSuffix: engLpiData[0].paoStartSuffix,
              paoEndNumber: engLpiData[0].paoEndNumber,
              paoEndSuffix: engLpiData[0].paoEndSuffix,
              paoText: engLpiData[0].paoText,
              address: engLpiData[0].address,
              postTownRef: engLpiData[0].postTownRef,
              postcodeRef: engLpiData[0].postcodeRef,
              postTown: engLpiData[0].postTown,
              postcode: engLpiData[0].postcode,
            },
          }
        : null;

    handlePropertyAdd(
      propertyContext.currentProperty.usrn,
      propertyContext.currentProperty.easting,
      propertyContext.currentProperty.northing,
      parent
    );
  };

  /**
   * Event to notify the user when some data has been copied to the clipboard.
   *
   * @param {boolean} open Flag to determine if the alert is displayed.
   * @param {string} dataType The type of data that has just been copied.
   */
  const handleCopyOpen = (open, dataType) => {
    copyDataType.current = dataType;
    setCopyOpen(open);
  };

  /**
   * Method to setup the related object.
   */
  const setupRelated = () => {
    const relatedObj = propertyData.parentUprn
      ? {
          parent: propertyData.parentUprn,
          property: propertyData.uprn,
          userToken: userContext.currentUser.token,
        }
      : null;

    propertyContext.onPropertyChange(
      propertyContext.currentProperty.uprn,
      propertyContext.currentProperty.usrn,
      propertyContext.currentProperty.address,
      propertyContext.currentProperty.formattedAddress,
      propertyContext.currentProperty.postcode,
      propertyContext.currentProperty.easting,
      propertyContext.currentProperty.northing,
      propertyContext.currentProperty.newProperty,
      propertyContext.currentProperty.parent,
      relatedObj
    );
  };

  /**
   * Event to show the related tab for the current property.
   */
  const handleViewRelated = () => {
    setupRelated();
    setValue(settingsContext.isScottish ? 6 : 3);
  };

  /**
   * Event to handle the closing of the copy alert.
   *
   * @param {object} event This is not used.
   * @param {string} reason The reason why the alert is being closed.
   * @returns
   */
  const handleCopyClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setCopyOpen(false);
  };

  /**
   * Event to handle the closing of the save alert.
   *
   * @param {object} event This is not used.
   * @param {string} reason The reason why the alert is being closed.
   * @returns
   */
  const handleSaveClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSaveOpen(false);
  };

  /**
   * Event to handle when the user clicks on the save button.
   */
  const handleSaveClicked = () => {
    associatedRecords.current = GetChangedAssociatedRecords("property", sandboxContext, provenanceChanged.current);

    const currentProperty = sandboxContext.currentSandbox.currentProperty
      ? sandboxContext.currentSandbox.currentProperty
      : sandboxContext.currentSandbox.sourceProperty;

    if (associatedRecords.current.length > 0) {
      saveConfirmDialog(associatedRecords.current)
        .then((result) => {
          if (result === "save") {
            if (propertyContext.validateData()) {
              failedValidation.current = false;
              const currentPropertyData = GetCurrentPropertyData(
                propertyData,
                sandboxContext,
                lookupContext,
                settingsContext.isWelsh,
                settingsContext.isScottish
              );
              HandlePropertySave(currentPropertyData);
            } else {
              failedValidation.current = true;
              saveResult.current = false;
              setSaveOpen(true);
            }
          } else if (result === "discard") {
            saveResult.current = true;
            ResetContexts("property", mapContext, streetContext, propertyContext, sandboxContext);
            if (propertyContext.currentProperty.newProperty) {
              propertyContext.resetProperty();
              mapContext.onSearchDataChange([], [], null, null);
              mapContext.onEditMapObject(null, null);

              history.push(GazetteerRoute);
            }
          }
        })
        .catch(() => {});
    } else HandlePropertySave(currentProperty);

    provenanceChanged.current = false;
  };

  /**
   * Method used to save changes to the property.
   *
   * @param {object} currentProperty The data for the current property.
   */
  function HandlePropertySave(currentProperty) {
    SavePropertyAndUpdate(
      currentProperty,
      propertyContext.currentProperty.newProperty,
      propertyContext,
      userContext.currentUser.token,
      lookupContext,
      searchContext,
      mapContext,
      sandboxContext,
      settingsContext.isScottish,
      settingsContext.isWelsh
    ).then((result) => {
      if (result) {
        setPropertyData(result);

        saveResult.current = true;
        setSaveOpen(true);
      } else {
        saveResult.current = false;
        setSaveOpen(true);
      }
    });
  }

  /**
   * Event to handle when the BLPU data is changed.
   *
   * @param {object} srcData The BLPU data that has been changed.
   */
  const handleBLPUDataChanged = (srcData) => {
    const newPropertyData = !settingsContext.isScottish
      ? {
          blpuStateDate: srcData.blpuStateDate,
          parentUprn: srcData.parentUprn,
          parentAddress: srcData.parentAddress,
          parentPostcode: srcData.parentPostcode,
          neverExport: srcData.neverExport,
          siteSurvey: srcData.siteSurvey,
          uprn: propertyData.uprn,
          logicalStatus: srcData.logicalStatus,
          endDate: srcData.endDate,
          blpuState: srcData.blpuState,
          startDate: srcData.startDate,
          blpuClass: srcData.blpuClass,
          localCustodianCode: srcData.localCustodianCode,
          organisation: srcData.organisation,
          xcoordinate: srcData.xcoordinate,
          ycoordinate: srcData.ycoordinate,
          wardCode: srcData.wardCode,
          parishCode: srcData.parishCode,
          pkId: propertyData.pkId,
          changeType: propertyData.uprn === 0 ? "I" : "U",
          rpc: srcData.rpc,
          entryDate: propertyData.entryDate,
          lastUpdateDate: propertyData.lastUpdateDate,
          relatedPropertyCount: propertyData.relatedPropertyCount,
          relatedStreetCount: propertyData.relatedStreetCount,
          propertyLastUpdated: propertyData.propertyLastUpdated,
          propertyLastUser: propertyData.propertyLastUser,
          blpuAppCrossRefs: propertyData.blpuAppCrossRefs,
          blpuProvenances: propertyData.blpuProvenances,
          blpuNotes: propertyData.blpuNotes,
          lpis: propertyData.lpis,
        }
      : {
          blpuStateDate: srcData.blpuStateDate,
          parentUprn: srcData.parentUprn,
          parentAddress: srcData.parentAddress,
          parentPostcode: srcData.parentPostcode,
          neverExport: srcData.neverExport,
          siteSurvey: srcData.siteSurvey,
          uprn: propertyData.uprn,
          logicalStatus: srcData.logicalStatus,
          endDate: srcData.endDate,
          startDate: srcData.startDate,
          blpuState: srcData.blpuState,
          custodianCode: srcData.custodianCode,
          level: srcData.level,
          xcoordinate: srcData.xcoordinate,
          ycoordinate: srcData.ycoordinate,
          pkId: propertyData.pkId,
          changeType: propertyData.uprn === 0 ? "I" : "U",
          rpc: srcData.rpc,
          entryDate: propertyData.entryDate,
          lastUpdateDate: propertyData.lastUpdateDate,
          relatedPropertyCount: propertyData.relatedPropertyCount,
          relatedStreetCount: propertyData.relatedStreetCount,
          propertyLastUpdated: propertyData.propertyLastUpdated,
          propertyLastUser: propertyData.propertyLastUser,
          blpuAppCrossRefs: propertyData.blpuAppCrossRefs,
          blpuProvenances: propertyData.blpuProvenances,
          classifications: propertyData.classifications,
          organisations: propertyData.organisations,
          successorCrossRefs: propertyData.successorCrossRefs,
          blpuNotes: propertyData.blpuNotes,
          lpis: propertyData.lpis,
        };

    updatePropertyData(newPropertyData);
  };

  /**
   * Method to handle when the organisation is changed.
   *
   * @param {string} oldValue The previous organisation.
   * @param {string} newValue The new organisation.
   * @param {object} srcData The BLPU data.
   * @returns
   */
  const handleOrganisationChanged = (oldValue, newValue, srcData) => {
    if (oldValue === newValue) return;

    const newLpis = [];

    propertyData.lpis.forEach((lpi) => {
      const baseAddress =
        lpi.address && lpi.address.length > 0 && lpi.address.indexOf(`${oldValue}, `) !== -1
          ? lpi.address.replace(`${oldValue}, `, "")
          : lpi.address;

      newLpis.push({
        ...lpi,
        address:
          baseAddress && baseAddress.length > 0 && newValue && newValue.length > 0
            ? `${newValue}, ${baseAddress}`
            : baseAddress,
      });
    });

    const newPropertyData = !settingsContext.isScottish
      ? {
          blpuStateDate: srcData.blpuStateDate,
          parentUprn: srcData.parentUprn,
          neverExport: srcData.neverExport,
          siteSurvey: srcData.siteSurvey,
          uprn: propertyData.uprn,
          logicalStatus: srcData.logicalStatus,
          endDate: srcData.endDate,
          blpuState: srcData.blpuState,
          startDate: srcData.startDate,
          blpuClass: srcData.blpuClass,
          localCustodianCode: srcData.localCustodianCode,
          organisation: srcData.organisation,
          xcoordinate: srcData.xcoordinate,
          ycoordinate: srcData.ycoordinate,
          wardCode: srcData.wardCode,
          parishCode: srcData.parishCode,
          pkId: propertyData.pkId,
          changeType: propertyData.uprn === 0 ? "I" : "U",
          rpc: srcData.rpc,
          entryDate: propertyData.entryDate,
          lastUpdateDate: propertyData.lastUpdateDate,
          relatedPropertyCount: propertyData.relatedPropertyCount,
          relatedStreetCount: propertyData.relatedStreetCount,
          propertyLastUpdated: propertyData.propertyLastUpdated,
          propertyLastUser: propertyData.propertyLastUser,
          blpuAppCrossRefs: propertyData.blpuAppCrossRefs,
          blpuProvenances: propertyData.blpuProvenances,
          blpuNotes: propertyData.blpuNotes,
          lpis: newLpis,
        }
      : {
          blpuStateDate: srcData.blpuStateDate,
          parentUprn: srcData.parentUprn,
          neverExport: srcData.neverExport,
          siteSurvey: srcData.siteSurvey,
          uprn: propertyData.uprn,
          logicalStatus: srcData.logicalStatus,
          endDate: srcData.endDate,
          startDate: srcData.startDate,
          blpuState: srcData.blpuState,
          custodianCode: srcData.custodianCode,
          level: srcData.level,
          xcoordinate: srcData.xcoordinate,
          ycoordinate: srcData.ycoordinate,
          pkId: propertyData.pkId,
          changeType: propertyData.uprn === 0 ? "I" : "U",
          rpc: srcData.rpc,
          entryDate: propertyData.entryDate,
          lastUpdateDate: propertyData.lastUpdateDate,
          relatedPropertyCount: propertyData.relatedPropertyCount,
          relatedStreetCount: propertyData.relatedStreetCount,
          propertyLastUpdated: propertyData.propertyLastUpdated,
          propertyLastUser: propertyData.propertyLastUser,
          blpuAppCrossRefs: propertyData.blpuAppCrossRefs,
          blpuProvenances: propertyData.blpuProvenances,
          classifications: propertyData.classifications,
          organisations: propertyData.organisations,
          successorCrossRefs: propertyData.successorCrossRefs,
          blpuNotes: propertyData.blpuNotes,
          lpis: newLpis,
        };

    updatePropertyData(newPropertyData);
  };

  /**
   * Event to handle when the provenance data changes.
   */
  const handleProvenanceDataChanged = () => {
    provenanceChanged.current = true;
  };

  /**
   * Event to handle when a user clicks on the home button from the LPI tab.
   *
   * @param {string} action The action to take.
   * @param {object} srcData The original state of the data
   * @param {object} currentData The current state of the data.
   * @returns {boolean}
   */
  const handleLPIHomeClick = (action, srcData, currentData) => {
    const discardChanges = (checkData) => {
      if (checkData && checkData.pkId < 0 && !propertyContext.currentProperty.newProperty) {
        // If user has added a new record and then clicked Discard/Cancel remove the record from the array if not a new property.
        let restoredLpis = propertyData.lpis.filter((x) => x.pkId !== checkData.pkId);

        if (checkData.dualLanguageLink > 0)
          restoredLpis = restoredLpis.filter((x) => x.dualLanguageLink !== checkData.dualLanguageLink);

        if (restoredLpis)
          setAssociatedPropertyDataAndClear(
            restoredLpis,
            propertyData.blpuProvenances,
            propertyData.blpuAppCrossRefs,
            propertyData.classifications,
            propertyData.organisations,
            propertyData.successorCrossRefs,
            propertyData.blpuNotes,
            "lpi"
          );
      }
      failedValidation.current = false;
      sandboxContext.onSandboxChange("lpi", null);
      handleLPISelected(-1, null, null, null);
    };

    failedValidation.current = false;

    switch (action) {
      case "check":
        const dataHasChanged = currentData.pkId < 0 || !ObjectComparison(srcData, currentData, lpiKeysToIgnore);

        if (dataHasChanged) {
          confirmDialog(true)
            .then((result) => {
              if (result === "save") {
                if (propertyContext.validateData()) {
                  failedValidation.current = false;
                  updateLPIData(currentData);
                  handleLPISelected(-1, null, null, null);
                } else {
                  failedValidation.current = true;
                  saveResult.current = false;
                  setSaveOpen(true);
                }
              } else {
                discardChanges(currentData);
              }
            })
            .catch(() => {});
        } else {
          clearingType.current = "lpi";
          sandboxContext.onSandboxChange("lpi", null);
          handleLPISelected(-1, null, null, null);
        }
        break;

      case "save":
        if (propertyContext.validateData()) {
          failedValidation.current = false;
          updateLPIData(currentData);
          handleLPISelected(-1, null, null, null);
        } else {
          failedValidation.current = true;
          saveResult.current = false;
          setSaveOpen(true);
        }
        break;

      default:
        discardChanges(srcData ? srcData : currentData ? currentData : null);
        break;
    }

    return failedValidation.current;
  };

  /**
   * Event to handle when a user clicks on the home button from the classification tab.
   *
   * @param {string} action The action to take.
   * @param {object} srcData The original state of the data
   * @param {object} currentData The current state of the data.
   * @returns {boolean}
   */
  const handleClassificationHomeClick = (action, srcData, currentData) => {
    const discardChanges = (checkPkID) => {
      if (checkPkID < 0) {
        // If user has added a new record and then clicked Discard/Cancel remove the record from the array.
        const restoredClassifications = propertyData.classifications.filter((x) => x.pkId !== checkPkID);

        if (restoredClassifications)
          setAssociatedPropertyDataAndClear(
            propertyData.lpis,
            propertyData.blpuProvenances,
            propertyData.blpuAppCrossRefs,
            restoredClassifications,
            propertyData.organisations,
            propertyData.successorCrossRefs,
            propertyData.blpuNotes,
            "classification"
          );
      }

      failedValidation.current = false;
      sandboxContext.onSandboxChange("classification", null);
      handleClassificationSelected(-1, null, null, null);
    };

    failedValidation.current = false;

    switch (action) {
      case "check":
        const dataHasChanged =
          currentData.pkId < 0 || !ObjectComparison(srcData, currentData, classificationKeysToIgnore);

        if (dataHasChanged) {
          confirmDialog(true)
            .then((result) => {
              if (result === "save") {
                if (propertyContext.validateData()) {
                  failedValidation.current = false;
                  updateClassificationData(currentData);
                  handleClassificationSelected(-1, null, null, null);
                } else {
                  failedValidation.current = true;
                  saveResult.current = false;
                  setSaveOpen(true);
                }
              } else {
                discardChanges(currentData ? currentData.pkId : 0);
              }
            })
            .catch(() => {});
        } else {
          clearingType.current = "classification";
          sandboxContext.onSandboxChange("classification", null);
          handleClassificationSelected(-1, null, null, null);
        }
        break;

      case "save":
        if (propertyContext.validateData()) {
          failedValidation.current = false;
          updateClassificationData(currentData);
          handleClassificationSelected(-1, null, null, null);
        } else {
          failedValidation.current = true;
          saveResult.current = false;
          setSaveOpen(true);
        }
        break;

      default:
        discardChanges(srcData ? srcData.pkId : currentData ? currentData.pkId : 0);
        break;
    }

    return failedValidation.current;
  };

  /**
   * Event to handle when a user clicks on the home button from the organisation tab.
   *
   * @param {string} action The action to take.
   * @param {object} srcData The original state of the data
   * @param {object} currentData The current state of the data.
   * @returns {boolean}
   */
  const handleOrganisationHomeClick = (action, srcData, currentData) => {
    const discardChanges = (checkPkID) => {
      if (checkPkID < 0) {
        // If user has added a new record and then clicked Discard/Cancel remove the record from the array.
        const restoredOrganisations = propertyData.organisations.filter((x) => x.pkId !== checkPkID);

        if (restoredOrganisations)
          setAssociatedPropertyDataAndClear(
            propertyData.lpis,
            propertyData.blpuProvenances,
            propertyData.blpuAppCrossRefs,
            propertyData.classifications,
            restoredOrganisations,
            propertyData.successorCrossRefs,
            propertyData.blpuNotes,
            "organisation"
          );
      }

      failedValidation.current = false;
      sandboxContext.onSandboxChange("organisation", null);
      handleOrganisationSelected(-1, null, null, null);
    };

    failedValidation.current = false;

    switch (action) {
      case "check":
        const dataHasChanged =
          currentData.pkId < 0 || !ObjectComparison(srcData, currentData, organisationKeysToIgnore);

        if (dataHasChanged) {
          confirmDialog(true)
            .then((result) => {
              if (result === "save") {
                if (propertyContext.validateData()) {
                  failedValidation.current = false;
                  updateOrganisationData(currentData);
                  handleOrganisationSelected(-1, null, null, null);
                } else {
                  failedValidation.current = true;
                  saveResult.current = false;
                  setSaveOpen(true);
                }
              } else {
                discardChanges(currentData ? currentData.pkId : 0);
              }
            })
            .catch(() => {});
        } else {
          clearingType.current = "organisation";
          sandboxContext.onSandboxChange("organisation", null);
          handleOrganisationSelected(-1, null, null, null);
        }
        break;

      case "save":
        if (propertyContext.validateData()) {
          failedValidation.current = false;
          updateOrganisationData(currentData);
          handleOrganisationSelected(-1, null, null, null);
        } else {
          failedValidation.current = true;
          saveResult.current = false;
          setSaveOpen(true);
        }
        break;

      default:
        discardChanges(srcData ? srcData.id : currentData ? currentData.pkId : 0);
        break;
    }

    return failedValidation.current;
  };

  /**
   * Event to handle when a user clicks on the home button from the successor cross reference tab.
   *
   * @param {string} action The action to take.
   * @param {object} srcData The original state of the data
   * @param {object} currentData The current state of the data.
   * @returns {boolean}
   */
  const handleSuccessorCrossRefHomeClick = (action, srcData, currentData) => {
    const discardChanges = (checkPkID) => {
      if (checkPkID < 0) {
        // If user has added a new record and then clicked Discard/Cancel remove the record from the array.
        const restoredSuccessorCrossRefs = propertyData.successorCrossRefs.filter((x) => x.pkId !== checkPkID);

        if (restoredSuccessorCrossRefs)
          setAssociatedPropertyDataAndClear(
            propertyData.lpis,
            propertyData.blpuProvenances,
            propertyData.blpuAppCrossRefs,
            propertyData.classifications,
            propertyData.organisations,
            restoredSuccessorCrossRefs,
            propertyData.blpuNotes,
            "successorCrossRef"
          );
      }

      failedValidation.current = false;
      sandboxContext.onSandboxChange("successorCrossRef", null);
      handleSuccessorCrossRefSelected(-1, null, null, null);
    };

    failedValidation.current = false;

    switch (action) {
      case "check":
        const dataHasChanged =
          currentData.pkId < 0 || !ObjectComparison(srcData, currentData, successorCrossRefKeysToIgnore);

        if (dataHasChanged) {
          confirmDialog(true)
            .then((result) => {
              if (result === "save") {
                if (propertyContext.validateData()) {
                  failedValidation.current = false;
                  updateSuccessorCrossRefData(currentData);
                  handleSuccessorCrossRefSelected(-1, null, null, null);
                } else {
                  failedValidation.current = true;
                  saveResult.current = false;
                  setSaveOpen(true);
                }
              } else {
                discardChanges(currentData ? currentData.pkId : 0);
              }
            })
            .catch(() => {});
        } else {
          clearingType.current = "successorCrossRef";
          sandboxContext.onSandboxChange("successorCrossRef", null);
          handleSuccessorCrossRefSelected(-1, null, null, null);
        }
        break;

      case "save":
        if (propertyContext.validateData()) {
          failedValidation.current = false;
          updateSuccessorCrossRefData(currentData);
          handleSuccessorCrossRefSelected(-1, null, null, null);
        } else {
          failedValidation.current = true;
          saveResult.current = false;
          setSaveOpen(true);
        }
        break;

      default:
        discardChanges(srcData ? srcData.id : currentData ? currentData.pkId : 0);
        break;
    }

    return failedValidation.current;
  };

  /**
   * Event to handle when a user clicks on the home button from the provenance tab.
   *
   * @param {string} action The action to take.
   * @param {object} srcData The original state of the data
   * @param {object} currentData The current state of the data.
   * @returns {boolean}
   */
  const handleProvenanceHomeClick = (action, srcData, currentData) => {
    const discardChanges = (checkPkID) => {
      if (checkPkID < 0) {
        // If user has added a new record and then clicked Discard/Cancel remove the record from the array.
        const restoredProvenances = propertyData.blpuProvenances.filter((x) => x.pkId !== checkPkID);

        if (restoredProvenances)
          setAssociatedPropertyDataAndClear(
            propertyData.lpis,
            restoredProvenances,
            propertyData.blpuAppCrossRefs,
            propertyData.classifications,
            propertyData.organisations,
            propertyData.successorCrossRefs,
            propertyData.blpuNotes,
            "provenance"
          );
      }

      failedValidation.current = false;
      sandboxContext.onSandboxChange("provenance", null);
      handleProvenanceSelected(-1, null, null, null);
    };

    failedValidation.current = false;

    switch (action) {
      case "check":
        const dataHasChanged = currentData.id < 0 || !ObjectComparison(srcData, currentData, provenanceKeysToIgnore);

        if (dataHasChanged) {
          confirmDialog(true)
            .then((result) => {
              if (result === "save") {
                if (propertyContext.validateData()) {
                  failedValidation.current = false;
                  updateProvenanceData(currentData);
                  handleProvenanceSelected(-1, null, null, null);
                } else {
                  failedValidation.current = true;
                  saveResult.current = false;
                  setSaveOpen(true);
                }
              } else {
                discardChanges(currentData ? currentData.pkId : 0);
              }
            })
            .catch(() => {});
        } else {
          clearingType.current = "provenance";
          sandboxContext.onSandboxChange("provenance", null);
          handleProvenanceSelected(-1, null, null, null);
        }
        break;

      case "save":
        if (propertyContext.validateData()) {
          failedValidation.current = false;
          updateProvenanceData(currentData);
          provenanceChanged.current = false;
          handleProvenanceSelected(-1, null, null, null);
        } else {
          failedValidation.current = true;
          saveResult.current = false;
          setSaveOpen(true);
        }
        break;

      default:
        discardChanges(srcData ? srcData.id : currentData ? currentData.pkId : 0);
        break;
    }

    return failedValidation.current;
  };

  /**
   * Event to handle when a user clicks on the home button from the cross reference tab.
   *
   * @param {string} action The action to take.
   * @param {object} srcData The original state of the data
   * @param {object} currentData The current state of the data.
   * @returns {boolean}
   */
  const handleCrossRefHomeClick = (action, srcData, currentData) => {
    const discardChanges = (checkPkId) => {
      if (checkPkId < 0) {
        // If user has added a new record and then clicked Discard/Cancel remove the record from the array.
        const restoredAppCrossRefs = propertyData.blpuAppCrossRefs.filter((x) => x.pkId !== checkPkId);

        if (restoredAppCrossRefs)
          setAssociatedPropertyDataAndClear(
            propertyData.lpis,
            propertyData.blpuProvenances,
            restoredAppCrossRefs,
            propertyData.classifications,
            propertyData.organisations,
            propertyData.successorCrossRefs,
            propertyData.blpuNotes,
            "appCrossRef"
          );
      }

      failedValidation.current = false;
      sandboxContext.onSandboxChange("appCrossRef", null);
      handleCrossRefSelected(-1, null, null, null);
    };

    failedValidation.current = false;

    switch (action) {
      case "check":
        const dataHasChanged =
          currentData.id < 0 || !ObjectComparison(srcData, currentData, blpuAppCrossRefKeysToIgnore);

        if (dataHasChanged) {
          confirmDialog(true)
            .then((result) => {
              if (result === "save") {
                if (propertyContext.validateData()) {
                  failedValidation.current = false;
                  updateCrossRefData(currentData);
                  handleCrossRefSelected(-1, null, null, null);
                } else {
                  failedValidation.current = true;
                  saveResult.current = false;
                  setSaveOpen(true);
                }
              } else {
                discardChanges(currentData ? currentData.pkId : 0);
              }
            })
            .catch(() => {});
        } else {
          clearingType.current = "appCrossRef";
          sandboxContext.onSandboxChange("appCrossRef", null);
          handleCrossRefSelected(-1, null, null, null);
        }
        break;

      case "save":
        if (propertyContext.validateData()) {
          failedValidation.current = false;
          updateCrossRefData(currentData);
          handleCrossRefSelected(-1, null, null, null);
        } else {
          failedValidation.current = true;
          saveResult.current = false;
          setSaveOpen(true);
        }
        break;

      default:
        discardChanges(srcData ? srcData.id : currentData ? currentData.pkId : 0);
        break;
    }

    return failedValidation.current;
  };

  /**
   * Event to handle when a user clicks on the home button from the note tab.
   *
   * @param {string} action The action to take.
   * @param {object} srcData The original state of the data
   * @param {object} currentData The current state of the data.
   * @returns {boolean}
   */
  const handleNoteHomeClick = (action, srcData, currentData) => {
    const discardChanges = (checkData) => {
      if (checkData && checkData.pkId < 0) {
        // If user has added a new record and then clicked Discard/Cancel remove the record from the array.
        const restoredNotes = propertyData.blpuNotes.filter((x) => x.pkId !== checkData.pkId);

        if (restoredNotes)
          setAssociatedPropertyDataAndClear(
            propertyData.lpis,
            propertyData.blpuProvenances,
            propertyData.blpuAppCrossRefs,
            propertyData.classifications,
            propertyData.organisations,
            propertyData.successorCrossRefs,
            restoredNotes,
            "propertyNote"
          );
      }

      failedValidation.current = false;
      sandboxContext.onSandboxChange("propertyNote", null);
      handleNoteSelected(-1, null, null, null);
    };

    failedValidation.current = false;

    switch (action) {
      case "check":
        const dataHasChanged = currentData.pkId < 0 || !ObjectComparison(srcData, currentData, noteKeysToIgnore);

        if (dataHasChanged) {
          confirmDialog(true)
            .then((result) => {
              if (result === "save") {
                if (propertyContext.validateData()) {
                  failedValidation.current = false;
                  updateNoteData(currentData);
                  handleNoteSelected(-1, null, null, null);
                } else {
                  failedValidation.current = true;
                  saveResult.current = false;
                  setSaveOpen(true);
                }
              } else {
                discardChanges(currentData);
              }
            })
            .catch(() => {});
        } else {
          clearingType.current = "propertyNote";
          sandboxContext.onSandboxChange("propertyNote", null);
          handleNoteSelected(-1, null, null, null);
        }
        break;

      case "save":
        if (propertyContext.validateData()) {
          failedValidation.current = false;
          updateNoteData(currentData);
          handleNoteSelected(-1, null, null, null);
        } else {
          failedValidation.current = true;
          saveResult.current = false;
          setSaveOpen(true);
        }
        break;

      default:
        discardChanges(srcData ? srcData : currentData ? currentData : null);
        break;
    }

    return failedValidation.current;
  };

  /**
   * Event to update the LPI record with new data.
   *
   * @param {object|null} newData The data to be used to update the LPI record with.
   * @returns
   */
  async function updateLPIData(newData) {
    if (!newData) return;

    let newLpis = null;

    let newAddress = await GetTempAddress(
      newData,
      propertyData.organisation,
      lookupContext,
      userContext.currentUser.token,
      settingsContext.isScottish
    );

    // If we did not get the address try the English version of the address
    if (newAddress === "No content found") {
      if (newData.language !== "ENG") {
        newAddress = await GetTempAddress(
          { ...newData, language: "ENG" },
          propertyData.organisation,
          lookupContext,
          userContext.currentUser.token,
          settingsContext.isScottish
        );

        if (newAddress === "No content found") newAddress = "";
      } else newAddress = "";
    } else newAddress = "";

    const updatedData = settingsContext.isScottish
      ? {
          language: newData.language,
          startDate: newData.startDate,
          endDate: newData.endDate,
          saoStartNumber: newData.saoStartNumber,
          saoEndNumber: newData.saoEndNumber,
          saoText: newData.saoText,
          paoStartNumber: newData.paoStartNumber,
          paoEndNumber: newData.paoEndNumber,
          paoText: newData.paoText,
          usrn: newData.usrn,
          postcodeRef: newData.postcodeRef,
          postTownRef: newData.postTownRef,
          neverExport: newData.neverExport,
          postTown: newData.postTown,
          postcode: newData.postcode,
          dualLanguageLink: newData.dualLanguageLink,
          uprn: newData.uprn,
          logicalStatus: newData.logicalStatus,
          paoStartSuffix: newData.paoStartSuffix,
          paoEndSuffix: newData.paoEndSuffix,
          saoStartSuffix: newData.saoStartSuffix,
          saoEndSuffix: newData.saoEndSuffix,
          subLocalityRef: newData.subLocalityRef,
          subLocality: newData.subLocality,
          postallyAddressable: newData.postallyAddressable,
          officialFlag: newData.officialFlag,
          pkId: newData.pkId,
          changeType: newData.changeType,
          lpiKey: newData.lpiKey,
          address: newAddress,
          entryDate: newData.entryDate,
          lastUpdateDate: newData.lastUpdateDate,
        }
      : {
          language: newData.language,
          startDate: newData.startDate,
          endDate: newData.endDate,
          saoStartNumber: newData.saoStartNumber,
          saoEndNumber: newData.saoEndNumber,
          saoText: newData.saoText,
          paoStartNumber: newData.paoStartNumber,
          paoEndNumber: newData.paoEndNumber,
          paoText: newData.paoText,
          usrn: newData.usrn,
          postcodeRef: newData.postcodeRef,
          postTownRef: newData.postTownRef,
          neverExport: newData.neverExport,
          postTown: newData.postTown,
          postcode: newData.postcode,
          dualLanguageLink: newData.dualLanguageLink,
          uprn: newData.uprn,
          logicalStatus: newData.logicalStatus,
          paoStartSuffix: newData.paoStartSuffix,
          paoEndSuffix: newData.paoEndSuffix,
          saoStartSuffix: newData.saoStartSuffix,
          saoEndSuffix: newData.saoEndSuffix,
          level: newData.level,
          postalAddress: newData.postalAddress,
          officialFlag: newData.officialFlag,
          pkId: newData.pkId,
          changeType: newData.changeType,
          lpiKey: newData.lpiKey,
          address: newAddress,
          entryDate: newData.entryDate,
          lastUpdateDate: newData.lastUpdateDate,
        };

    if (settingsContext.isWelsh) {
      const secondLanguage = updatedData.language === "ENG" ? "CYM" : "ENG";

      let secondLpi = null;
      if (updatedData.dualLanguageLink === 0) {
        const bilingualId = getBilingualSource(lookupContext);
        const linkXRef = propertyData.blpuAppCrossRefs.find(
          (x) => x.sourceId === bilingualId && x.crossReference.includes(updatedData.lpiKey)
        );
        secondLpi = propertyData.lpis.find((x) => x.lpiKey === linkXRef.crossReference.replace(updatedData.lpiKey, ""));
      } else {
        secondLpi = propertyData.lpis.find(
          (x) => x.dualLanguageLink === updatedData.dualLanguageLink && x.language === secondLanguage
        );
      }
      const secondPostTown = lookupContext.currentLookups.postTowns.find(
        (x) => x.linkedRef === updatedData.postTownRef && x.language === secondLpi.language
      );
      const newSecondLpi = {
        language: secondLpi.language,
        startDate: updatedData.startDate,
        endDate: updatedData.endDate,
        saoStartNumber: secondLpi && secondLpi.saoStartNumber ? secondLpi.saoStartNumber : updatedData.saoStartNumber,
        saoEndNumber: secondLpi && secondLpi.saoEndNumber ? secondLpi.saoEndNumber : updatedData.saoEndNumber,
        saoText: secondLpi && secondLpi.saoText ? secondLpi.saoText : updatedData.saoText,
        paoStartNumber: secondLpi && secondLpi.paoStartNumber ? secondLpi.paoStartNumber : updatedData.paoStartNumber,
        paoEndNumber: secondLpi && secondLpi.paoEndNumber ? secondLpi.paoEndNumber : updatedData.paoEndNumber,
        paoText: secondLpi && secondLpi.paoText ? secondLpi.paoText : updatedData.paoText,
        usrn: updatedData.usrn,
        postcodeRef: updatedData.postcodeRef,
        postTownRef: secondPostTown ? secondPostTown.postTownRef : null,
        neverExport: updatedData.neverExport,
        postTown: secondPostTown ? secondPostTown.postTown : null,
        postcode: updatedData.postcode,
        dualLanguageLink: secondLpi.dualLanguageLink,
        uprn: secondLpi.uprn,
        logicalStatus: updatedData.logicalStatus,
        paoStartSuffix: secondLpi && secondLpi.paoStartSuffix ? secondLpi.paoStartSuffix : updatedData.paoStartSuffix,
        paoEndSuffix: secondLpi && secondLpi.paoEndSuffix ? secondLpi.paoEndSuffix : updatedData.paoEndSuffix,
        saoStartSuffix: secondLpi && secondLpi.saoStartSuffix ? secondLpi.saoStartSuffix : updatedData.saoStartSuffix,
        saoEndSuffix: secondLpi && secondLpi.saoEndSuffix ? secondLpi.saoEndSuffix : updatedData.saoEndSuffix,
        level: updatedData.level,
        postalAddress: updatedData.postalAddress,
        officialFlag: updatedData.officialFlag,
        pkId: secondLpi.pkId,
        changeType: secondLpi.changeType,
        lpiKey: secondLpi.lpiKey,
        address: secondLpi.address,
        entryDate: secondLpi.entryDate,
        lastUpdateDate: secondLpi.lastUpdateDate,
      };

      let newSecondAddress = await GetTempAddress(
        newSecondLpi,
        propertyData.organisation,
        lookupContext,
        userContext.currentUser.token
      );

      // If we did not get the address try the English version of the address
      if (newSecondAddress === "No content found") {
        if (newSecondLpi.language !== "ENG") {
          newSecondAddress = await GetTempAddress(
            { ...newSecondLpi, language: "ENG" },
            propertyData.organisation,
            lookupContext,
            userContext.currentUser.token,
            settingsContext.isScottish
          );

          if (newSecondAddress === "No content found") newSecondAddress = "";
        } else newSecondAddress = "";
      } else newSecondAddress = "";

      const updatedSecondLpi = {
        language: newSecondLpi.language,
        startDate: newSecondLpi.startDate,
        endDate: newSecondLpi.endDate,
        saoStartNumber: newSecondLpi.saoStartNumber,
        saoEndNumber: newSecondLpi.saoEndNumber,
        saoText: newSecondLpi.saoText,
        paoStartNumber: newSecondLpi.paoStartNumber,
        paoEndNumber: newSecondLpi.paoEndNumber,
        paoText: newSecondLpi.paoText,
        usrn: newSecondLpi.usrn,
        postcodeRef: newSecondLpi.postcodeRef,
        postTownRef: newSecondLpi.postTownRef,
        neverExport: newSecondLpi.neverExport,
        postTown: newSecondLpi.postTown,
        postcode: newSecondLpi.postcode,
        dualLanguageLink: newSecondLpi.dualLanguageLink,
        uprn: newSecondLpi.uprn,
        logicalStatus: newSecondLpi.logicalStatus,
        paoStartSuffix: newSecondLpi.paoStartSuffix,
        paoEndSuffix: newSecondLpi.paoEndSuffix,
        saoStartSuffix: newSecondLpi.saoStartSuffix,
        saoEndSuffix: newSecondLpi.saoEndSuffix,
        level: newSecondLpi.level,
        postalAddress: newSecondLpi.postalAddress,
        officialFlag: newSecondLpi.officialFlag,
        pkId: newSecondLpi.pkId,
        changeType: newSecondLpi.changeType,
        lpiKey: newSecondLpi.lpiKey,
        address: newSecondAddress,
        entryDate: newSecondLpi.entryDate,
        lastUpdateDate: newSecondLpi.lastUpdateDate,
      };

      newLpis = propertyData.lpis.map((x) => [updatedData, updatedSecondLpi].find((lpi) => lpi.pkId === x.pkId) || x);
    } else {
      newLpis = propertyData.lpis.map((x) => [updatedData].find((lpi) => lpi.pkId === x.pkId) || x);
    }

    if (newLpis && newLpis.length > 0) {
      setAssociatedPropertyDataAndClear(
        newLpis,
        propertyData.blpuProvenances,
        propertyData.blpuAppCrossRefs,
        propertyData.classifications,
        propertyData.organisations,
        propertyData.successorCrossRefs,
        propertyData.blpuNotes,
        "lpi"
      );
    }
  }

  /**
   * Event to update the classification record with new data.
   *
   * @param {object|null} newData The data to be used to update the classification record with.
   * @returns
   */
  const updateClassificationData = (newData) => {
    if (!newData) return;

    const newClassifications = propertyData.classifications.map(
      (x) => [newData].find((classification) => classification.pkId === x.pkId) || x
    );

    setAssociatedPropertyDataAndClear(
      propertyData.lpis,
      propertyData.blpuProvenances,
      propertyData.blpuAppCrossRefs,
      newClassifications,
      propertyData.organisations,
      propertyData.successorCrossRefs,
      propertyData.blpuNotes,
      "classification"
    );
  };

  /**
   * Event to update the organisation record with new data.
   *
   * @param {object|null} newData The data to be used to update the organisation record with.
   * @returns
   */
  const updateOrganisationData = (newData) => {
    if (!newData) return;

    const newOrganisations = propertyData.organisations.map(
      (x) => [newData].find((organisation) => organisation.pkId === x.pkId) || x
    );

    setAssociatedPropertyDataAndClear(
      propertyData.lpis,
      propertyData.blpuProvenances,
      propertyData.blpuAppCrossRefs,
      propertyData.classifications,
      newOrganisations,
      propertyData.successorCrossRefs,
      propertyData.blpuNotes,
      "organisation"
    );
  };

  /**
   * Event to update the successor cross reference record with new data.
   *
   * @param {object|null} newData The data to be used to update the successor cross reference record with.
   * @returns
   */
  const updateSuccessorCrossRefData = (newData) => {
    if (!newData) return;

    const newSuccessorCrossRefs = propertyData.successorCrossRefs.map(
      (x) => [newData].find((successorCrossRef) => successorCrossRef.pkId === x.pkId) || x
    );

    setAssociatedPropertyDataAndClear(
      propertyData.lpis,
      propertyData.blpuProvenances,
      propertyData.blpuAppCrossRefs,
      propertyData.classifications,
      propertyData.organisations,
      newSuccessorCrossRefs,
      propertyData.blpuNotes,
      "successorCrossRef"
    );
  };

  /**
   * Event to update the provenance record with new data.
   *
   * @param {object|null} newData The data to be used to update the provenance record with.
   * @returns
   */
  const updateProvenanceData = (newData) => {
    if (!newData) return;

    const newProvenances = propertyData.blpuProvenances.map(
      (x) => [newData].find((provenance) => provenance.pkId === x.pkId) || x
    );

    setAssociatedPropertyDataAndClear(
      propertyData.lpis,
      newProvenances,
      propertyData.blpuAppCrossRefs,
      propertyData.classifications,
      propertyData.organisations,
      propertyData.successorCrossRefs,
      propertyData.blpuNotes,
      "provenance"
    );
  };

  /**
   * Event to update the cross reference record with new data.
   *
   * @param {object|null} newData The data to be used to update the cross reference record with.
   * @returns
   */
  const updateCrossRefData = (newData) => {
    if (!newData) return;

    const newCrossRefs = propertyData.blpuAppCrossRefs.map((x) => [newData].find((xRef) => xRef.pkId === x.pkId) || x);

    setAssociatedPropertyDataAndClear(
      propertyData.lpis,
      propertyData.blpuProvenances,
      newCrossRefs,
      propertyData.classifications,
      propertyData.organisations,
      propertyData.successorCrossRefs,
      propertyData.blpuNotes,
      "appCrossRef"
    );
  };

  /**
   * Event to update the note record with new data.
   *
   * @param {object|null} newData The data to be used to update the note record with.
   * @returns
   */
  const updateNoteData = (newData) => {
    const newNotes = propertyData.blpuNotes.map((x) => [newData].find((xRef) => xRef.pkId === x.pkId) || x);

    setAssociatedPropertyDataAndClear(
      propertyData.lpis,
      propertyData.blpuProvenances,
      propertyData.blpuAppCrossRefs,
      propertyData.classifications,
      propertyData.organisations,
      propertyData.successorCrossRefs,
      newNotes,
      "propertyNote"
    );
  };

  // Update BLPU coordinates
  useEffect(() => {
    const contextProperty =
      sandboxContext.currentSandbox.currentProperty || sandboxContext.currentSandbox.sourceProperty;
    if (mapContext.currentPropertyPin) {
      const newX = Number.parseFloat(mapContext.currentPropertyPin.x);
      const newY = Number.parseFloat(mapContext.currentPropertyPin.y);
      if (newX !== contextProperty.xcoordinate || newY !== contextProperty.ycoordinate) {
        const newPropertyData = !settingsContext.isScottish
          ? {
              blpuStateDate: contextProperty.blpuStateDate,
              parentUprn: contextProperty.parentUprn,
              neverExport: contextProperty.neverExport,
              siteSurvey: contextProperty.siteSurvey,
              uprn: contextProperty.uprn,
              logicalStatus: contextProperty.logicalStatus,
              endDate: contextProperty.endDate,
              blpuState: contextProperty.blpuState,
              startDate: contextProperty.startDate,
              blpuClass: contextProperty.blpuClass,
              localCustodianCode: contextProperty.localCustodianCode,
              organisation: contextProperty.organisation,
              xcoordinate: newX,
              ycoordinate: newY,
              wardCode: contextProperty.wardCode,
              parishCode: contextProperty.parishCode,
              pkId: contextProperty.pkId,
              changeType: contextProperty.uprn === 0 ? "I" : "U",
              rpc: contextProperty.rpc,
              entryDate: contextProperty.entryDate,
              lastUpdateDate: contextProperty.lastUpdateDate,
              relatedPropertyCount: contextProperty.relatedPropertyCount,
              relatedStreetCount: contextProperty.relatedStreetCount,
              propertyLastUpdated: contextProperty.propertyLastUpdated,
              propertyLastUser: contextProperty.propertyLastUser,
              blpuAppCrossRefs: contextProperty.blpuAppCrossRefs,
              blpuProvenances: contextProperty.blpuProvenances,
              blpuNotes: contextProperty.blpuNotes,
              lpis: contextProperty.lpis,
            }
          : {
              blpuStateDate: contextProperty.blpuStateDate,
              parentUprn: contextProperty.parentUprn,
              neverExport: contextProperty.neverExport,
              siteSurvey: contextProperty.siteSurvey,
              uprn: contextProperty.uprn,
              logicalStatus: contextProperty.logicalStatus,
              endDate: contextProperty.endDate,
              startDate: contextProperty.startDate,
              blpuState: contextProperty.blpuState,
              custodianCode: contextProperty.custodianCode,
              level: contextProperty.level,
              xcoordinate: newX,
              ycoordinate: newY,
              pkId: contextProperty.pkId,
              changeType: contextProperty.uprn === 0 ? "I" : "U",
              rpc: contextProperty.rpc,
              entryDate: contextProperty.entryDate,
              lastUpdateDate: contextProperty.lastUpdateDate,
              relatedPropertyCount: contextProperty.relatedPropertyCount,
              relatedStreetCount: contextProperty.relatedStreetCount,
              propertyLastUpdated: contextProperty.propertyLastUpdated,
              propertyLastUser: contextProperty.propertyLastUser,
              blpuAppCrossRefs: contextProperty.blpuAppCrossRefs,
              blpuProvenances: contextProperty.blpuProvenances,
              classifications: contextProperty.classifications,
              organisations: contextProperty.organisations,
              successorCrossRefs: contextProperty.successorCrossRefs,
              blpuNotes: contextProperty.blpuNotes,
              lpis: contextProperty.lpis,
            };

        if (newPropertyData) {
          mapContext.onSetCoordinate(null);

          const engLpi = newPropertyData.lpis
            .filter((x) => x.language === "ENG")
            .sort(function (a, b) {
              return a.logicalStatus - b.logicalStatus;
            });

          propertyContext.onPropertyChange(
            newPropertyData.uprn,
            newPropertyData.usrn,
            engLpi[0].address,
            engLpi[0].address,
            engLpi[0].postcode,
            newX,
            newY,
            propertyContext.currentProperty.newProperty,
            null
          );

          const currentSearchProperties = [
            {
              uprn: newPropertyData.uprn,
              address: engLpi[0].address,
              postcode: engLpi[0].postcode,
              easting: newX,
              northing: newY,
              logicalStatus: newPropertyData.logicalStatus,
              classificationCode: getClassificationCode(newPropertyData),
            },
          ];

          mapContext.onSearchDataChange([], currentSearchProperties, null, newPropertyData.uprn);
        }
        setPropertyData(newPropertyData);
        sandboxContext.onSandboxChange("currentProperty", newPropertyData);
      }
    }
  }, [mapContext.currentPropertyPin, mapContext, sandboxContext, propertyContext, settingsContext]);

  // Update extent geometry
  useEffect(() => {
    const contextProperty =
      sandboxContext.currentSandbox.currentProperty || sandboxContext.currentSandbox.sourceProperty;
    let newPropertyData = null;
    const currentDate = GetCurrentDate(false);

    if (mapContext.currentPolygonGeometry && mapContext.currentPolygonGeometry.objectType === 22) {
      const currentProvenance = sandboxContext.currentSandbox.currentPropertyRecords.provenance
        ? sandboxContext.currentSandbox.currentPropertyRecords.provenance
        : propertyData.blpuProvenances.find((x) => x.pkId === mapContext.currentPolygonGeometry.objectId);

      if (
        currentProvenance &&
        !PolygonsEqual(currentProvenance.wktGeometry, mapContext.currentPolygonGeometry.wktGeometry)
      ) {
        const updatedProvenance = {
          entryDate: currentProvenance.entryDate ? currentProvenance.entryDate : currentDate,
          lastUpdateDate: currentDate,
          pkId: currentProvenance.pkId,
          provenanceKey: currentProvenance.provenanceKey,
          uprn: currentProvenance.uprn,
          changeType: contextProperty.uprn === 0 || currentProvenance.pkId < 0 ? "I" : "U",
          provenanceCode: currentProvenance.provenanceCode,
          annotation: currentProvenance.annotation,
          startDate: currentProvenance.startDate ? currentProvenance.startDate : currentDate,
          endDate: currentProvenance.endDate,
          neverExport: currentProvenance.neverExport,
          wktGeometry: mapContext.currentPolygonGeometry.wktGeometry,
        };

        const newProvenances = propertyData.blpuProvenances.map(
          (x) => [updatedProvenance].find((rec) => rec.pkId === x.pkId) || x
        );

        const mapExtents = newProvenances.map((rec) => ({
          uprn: rec.uprn,
          code: rec.provenanceCode,
          geometry: rec.wktGeometry && rec.wktGeometry !== "" ? GetWktCoordinates(rec.wktGeometry) : undefined,
        }));

        mapContext.onMapChange(mapExtents, null, null);

        newPropertyData = !settingsContext.isScottish
          ? {
              blpuStateDate: contextProperty.blpuStateDate,
              parentUprn: contextProperty.parentUprn,
              neverExport: contextProperty.neverExport,
              siteSurvey: contextProperty.siteSurvey,
              uprn: contextProperty.uprn,
              logicalStatus: contextProperty.logicalStatus,
              endDate: contextProperty.endDate,
              blpuState: contextProperty.blpuState,
              startDate: contextProperty.startDate,
              blpuClass: contextProperty.blpuClass,
              localCustodianCode: contextProperty.localCustodianCode,
              organisation: contextProperty.organisation,
              xcoordinate: contextProperty.xcoordinate,
              ycoordinate: contextProperty.ycoordinate,
              wardCode: contextProperty.wardCode,
              parishCode: contextProperty.parishCode,
              pkId: contextProperty.pkId,
              changeType: contextProperty.changeType,
              rpc: contextProperty.rpc,
              entryDate: contextProperty.entryDate,
              lastUpdateDate: contextProperty.lastUpdateDate,
              relatedPropertyCount: contextProperty.relatedPropertyCount,
              relatedStreetCount: contextProperty.relatedStreetCount,
              propertyLastUpdated: contextProperty.propertyLastUpdated,
              propertyLastUser: contextProperty.propertyLastUser,
              blpuAppCrossRefs: contextProperty.blpuAppCrossRefs,
              blpuProvenances: newProvenances,
              blpuNotes: contextProperty.blpuNotes,
              lpis: contextProperty.lpis,
            }
          : {
              blpuStateDate: contextProperty.blpuStateDate,
              parentUprn: contextProperty.parentUprn,
              neverExport: contextProperty.neverExport,
              siteSurvey: contextProperty.siteSurvey,
              uprn: contextProperty.uprn,
              logicalStatus: contextProperty.logicalStatus,
              endDate: contextProperty.endDate,
              startDate: contextProperty.startDate,
              blpuState: contextProperty.blpuState,
              custodianCode: contextProperty.custodianCode,
              level: contextProperty.level,
              xcoordinate: contextProperty.xcoordinate,
              ycoordinate: contextProperty.ycoordinate,
              pkId: contextProperty.pkId,
              changeType: contextProperty.changeType,
              rpc: contextProperty.rpc,
              entryDate: contextProperty.entryDate,
              lastUpdateDate: contextProperty.lastUpdateDate,
              relatedPropertyCount: contextProperty.relatedPropertyCount,
              relatedStreetCount: contextProperty.relatedStreetCount,
              propertyLastUpdated: contextProperty.propertyLastUpdated,
              propertyLastUser: contextProperty.propertyLastUser,
              blpuAppCrossRefs: contextProperty.blpuAppCrossRefs,
              blpuProvenances: newProvenances,
              classifications: contextProperty.classifications,
              organisations: contextProperty.organisations,
              successorCrossRefs: contextProperty.successorCrossRefs,
              blpuNotes: contextProperty.blpuNotes,
              lpis: contextProperty.lpis,
            };

        if (newPropertyData) {
          mapContext.onSetPolygonGeometry(null);

          setPropertyData(newPropertyData);
          clearingType.current = "provenance";
          sandboxContext.onUpdateAndClear("currentProperty", newPropertyData, "provenance");
          provenanceChanged.current = true;
          propertyContext.onProvenanceDataChange(true);
        }
      }
    }
  }, [mapContext.currentPolygonGeometry, propertyData, sandboxContext, mapContext, propertyContext, settingsContext]);

  useEffect(() => {
    if (
      data &&
      (propertyUprn.current === null ||
        propertyUprn.current === undefined ||
        propertyUprn.current === "" ||
        propertyUprn.current === false ||
        data.uprn.toString() !== propertyUprn.current.toString())
    ) {
      propertyUprn.current = data.uprn;
      propertyContext.resetPropertyErrors();
      setPropertyData(data);
      if (data && data.uprn.toString() === "0" && saveDisabled) {
        setSaveDisabled(false);
        propertyContext.onPropertyModified(true);
      }
    }
  }, [data, saveDisabled, propertyContext]);

  useEffect(() => {
    if (!data) return;

    if (value !== sandboxContext.currentSandbox.propertyTab) setValue(sandboxContext.currentSandbox.propertyTab);

    if (
      sandboxContext.currentSandbox.currentPropertyRecords.lpi &&
      !lpiFormData &&
      !["lpi", "allAssociatedProperty", "allProperty"].includes(clearingType.current)
    ) {
      setLpiFormData({
        pkId: sandboxContext.currentSandbox.currentPropertyRecords.lpi.pkId,
        lpiData: sandboxContext.currentSandbox.currentPropertyRecords.lpi,
        blpuLogicalStatus: data.logicalStatus,
        organisation: data.organisation,
        index: data.lpis.findIndex((x) => x.pkId === sandboxContext.currentSandbox.currentPropertyRecords.lpi.pkId),
        totalRecords: data.lpis.length,
      });
    } else if (
      sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef &&
      !crossRefFormData &&
      !["appCrossRef", "allAssociatedProperty", "allProperty"].includes(clearingType.current)
    ) {
      setCrossRefFormData({
        id: sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef.pkId,
        xrefData: {
          id: sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef.pkId,
          uprn: sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef.uprn,
          changeType: sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef.changeType,
          xrefKey: sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef.xrefKey,
          source: sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef.source,
          sourceId: sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef.sourceId,
          crossReference: sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef.crossReference,
          startDate: sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef.startDate,
          endDate: sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef.endDate,
          lastUpdateDate: sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef.lastUpdateDate,
          neverExport: sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef.neverExport,
        },
        blpuLogicalStatus: data.logicalStatus,
        index: data.blpuAppCrossRefs.findIndex(
          (x) => x.pkId === sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef.pkId
        ),
        totalRecords: data.blpuAppCrossRefs.length,
      });
    } else if (
      sandboxContext.currentSandbox.currentPropertyRecords.provenance &&
      !provenanceFormData &&
      !["provenance", "allAssociatedProperty", "allProperty"].includes(clearingType.current)
    ) {
      setProvenanceFormData({
        id: sandboxContext.currentSandbox.currentPropertyRecords.provenance.pkId,
        provenanceData: {
          id: sandboxContext.currentSandbox.currentPropertyRecords.provenance.pkId,
          changeType: sandboxContext.currentSandbox.currentPropertyRecords.provenance.changeType,
          uprn: sandboxContext.currentSandbox.currentPropertyRecords.provenance.uprn,
          provenanceKey: sandboxContext.currentSandbox.currentPropertyRecords.provenance.provenanceKey,
          provenanceCode: sandboxContext.currentSandbox.currentPropertyRecords.provenance.provenanceCode,
          annotation: sandboxContext.currentSandbox.currentPropertyRecords.provenance.annotation,
          startDate: sandboxContext.currentSandbox.currentPropertyRecords.provenance.startDate,
          endDate: sandboxContext.currentSandbox.currentPropertyRecords.provenance.endDate,
          entryDate: sandboxContext.currentSandbox.currentPropertyRecords.provenance.entryDate,
          lastUpdateDate: sandboxContext.currentSandbox.currentPropertyRecords.provenance.lastUpdateDate,
          wktGeometry: sandboxContext.currentSandbox.currentPropertyRecords.provenance.wktGeometry,
        },
        blpuLogicalStatus: data.logicalStatus,
        index: data.blpuProvenances.findIndex(
          (x) => x.pkId === sandboxContext.currentSandbox.currentPropertyRecords.provenance.pkId
        ),
        totalRecords: data.blpuProvenances.length,
      });
    } else if (
      sandboxContext.currentSandbox.currentPropertyRecords.classification &&
      !classificationFormData &&
      !["classification", "allAssociatedProperty", "allProperty"].includes(clearingType.current)
    ) {
      setClassificationFormData({
        id: sandboxContext.currentSandbox.currentPropertyRecords.classification.pkId,
        classificationData: {
          id: sandboxContext.currentSandbox.currentPropertyRecords.classification.pkId,
          changeType: sandboxContext.currentSandbox.currentPropertyRecords.classification.changeType,
          uprn: sandboxContext.currentSandbox.currentPropertyRecords.classification.uprn,
          classKey: sandboxContext.currentSandbox.currentPropertyRecords.classification.classKey,
          classificationScheme:
            sandboxContext.currentSandbox.currentPropertyRecords.classification.classificationScheme,
          blpuClass: sandboxContext.currentSandbox.currentPropertyRecords.classification.blpuClass,
          startDate: sandboxContext.currentSandbox.currentPropertyRecords.classification.startDate,
          endDate: sandboxContext.currentSandbox.currentPropertyRecords.classification.endDate,
          entryDate: sandboxContext.currentSandbox.currentPropertyRecords.classification.entryDate,
          lastUpdateDate: sandboxContext.currentSandbox.currentPropertyRecords.classification.lastUpdateDate,
          neverExport: sandboxContext.currentSandbox.currentPropertyRecords.classification.neverExport,
        },
        index: data.classifications.finIndex(
          (x) => x.pkId === sandboxContext.currentSandbox.currentPropertyRecords.classification.pkId
        ),
        totalRecords: data.classifications.length,
      });
    } else if (
      sandboxContext.currentSandbox.currentPropertyRecords.organisation &&
      !organisationFormData &&
      !["organisation", "allAssociatedProperty", "allProperty"].includes(clearingType.current)
    ) {
      setOrganisationFormData({
        id: sandboxContext.currentSandbox.currentPropertyRecords.organisation.pkId,
        organisationData: {
          id: sandboxContext.currentSandbox.currentPropertyRecords.organisation.pkId,
          changeType: sandboxContext.currentSandbox.currentPropertyRecords.organisation.changeType,
          uprn: sandboxContext.currentSandbox.currentPropertyRecords.organisation.uprn,
          orgKey: sandboxContext.currentSandbox.currentPropertyRecords.organisation.orgKey,
          organisation: sandboxContext.currentSandbox.currentPropertyRecords.organisation.organisation,
          legalName: sandboxContext.currentSandbox.currentPropertyRecords.organisation.legalName,
          startDate: sandboxContext.currentSandbox.currentPropertyRecords.organisation.startDate,
          endDate: sandboxContext.currentSandbox.currentPropertyRecords.organisation.endDate,
          entryDate: sandboxContext.currentSandbox.currentPropertyRecords.organisation.entryDate,
          lastUpdateDate: sandboxContext.currentSandbox.currentPropertyRecords.organisation.lastUpdateDate,
          neverExport: sandboxContext.currentSandbox.currentPropertyRecords.organisation.neverExport,
        },
        index: data.organisations.findIndex(
          (x) => x.pkId === sandboxContext.currentSandbox.currentPropertyRecords.organisation.pkId
        ),
        totalRecords: data.organisations.length,
      });
    } else if (
      sandboxContext.currentSandbox.currentPropertyRecords.successorCrossRef &&
      !successorCrossRefFormData &&
      !["successorCrossRef", "allAssociatedProperty", "allProperty"].includes(clearingType.current)
    ) {
      setSuccessorCrossRefFormData({
        id: sandboxContext.currentSandbox.currentPropertyRecords.successorCrossRef.pkId,
        successorCrossRefData: {
          id: sandboxContext.currentSandbox.currentPropertyRecords.successorCrossRef.pkId,
          changeType: sandboxContext.currentSandbox.currentPropertyRecords.successorCrossRef.changeType,
          succKey: sandboxContext.currentSandbox.currentPropertyRecords.successorCrossRef.succKey,
          successor: sandboxContext.currentSandbox.currentPropertyRecords.successorCrossRef.successor,
          successorType: sandboxContext.currentSandbox.currentPropertyRecords.successorCrossRef.successorType,
          predecessor: sandboxContext.currentSandbox.currentPropertyRecords.successorCrossRef.predecessor,
          startDate: sandboxContext.currentSandbox.currentPropertyRecords.successorCrossRef.startDate,
          endDate: sandboxContext.currentSandbox.currentPropertyRecords.successorCrossRef.endDate,
          entryDate: sandboxContext.currentSandbox.currentPropertyRecords.successorCrossRef.entryDate,
          lastUpdateDate: sandboxContext.currentSandbox.currentPropertyRecords.successorCrossRef.lastUpdateDate,
          neverExport: sandboxContext.currentSandbox.currentPropertyRecords.successorCrossRef.neverExport,
        },
        index: data.successorCrossRefs.findIndex(
          (x) => x.pkId === sandboxContext.currentSandbox.currentPropertyRecords.successorCrossRef.pkId
        ),
        totalRecords: data.successorCrossRefs.length,
      });
    } else if (
      sandboxContext.currentSandbox.currentPropertyRecords.note &&
      !notesFormData &&
      !["propertyNote", "allAssociatedProperty", "allProperty"].includes(clearingType.current)
    ) {
      setNotesFormData({
        pkId: sandboxContext.currentSandbox.currentPropertyRecords.note.pkId,
        noteData: sandboxContext.currentSandbox.currentPropertyRecords.note,
        index: data.blpuNotes.findIndex(
          (x) => x.pkId === sandboxContext.currentSandbox.currentPropertyRecords.note.pkId
        ),
        totalRecords: data.blpuNotes.length,
        variant: "property",
      });
    }
  }, [
    sandboxContext.currentSandbox.currentPropertyRecords,
    sandboxContext.currentSandbox.propertyTab,
    value,
    lpiFormData,
    crossRefFormData,
    provenanceFormData,
    classificationFormData,
    organisationFormData,
    successorCrossRefFormData,
    notesFormData,
    data,
  ]);

  useEffect(() => {
    if (
      !sandboxContext.currentSandbox.currentPropertyRecords.lpi &&
      ["lpi", "allAssociatedProperty", "allProperty"].includes(clearingType.current)
    )
      clearingType.current = "";
    if (
      !sandboxContext.currentSandbox.currentPropertyRecords.appCrossRef &&
      ["appCrossRef", "allAssociatedProperty", "allProperty"].includes(clearingType.current)
    )
      clearingType.current = "";
    if (
      !sandboxContext.currentSandbox.currentPropertyRecords.provenance &&
      ["provenance", "allAssociatedProperty", "allProperty"].includes(clearingType.current)
    )
      clearingType.current = "";
    if (
      !sandboxContext.currentSandbox.currentPropertyRecords.classification &&
      ["classification", "allAssociatedProperty", "allProperty"].includes(clearingType.current)
    )
      clearingType.current = "";
    if (
      !sandboxContext.currentSandbox.currentPropertyRecords.organisation &&
      ["organisation", "allAssociatedProperty", "allProperty"].includes(clearingType.current)
    )
      clearingType.current = "";
    if (
      !sandboxContext.currentSandbox.currentPropertyRecords.successorCrossRef &&
      ["successorCrossRef", "allAssociatedProperty", "allProperty"].includes(clearingType.current)
    )
      clearingType.current = "";
    if (
      !sandboxContext.currentSandbox.currentPropertyRecords.note &&
      ["propertyNote", "allAssociatedProperty", "allProperty"].includes(clearingType.current)
    )
      clearingType.current = "";
  }, [sandboxContext.currentSandbox.currentPropertyRecords]);

  useEffect(() => {
    if (propertyContext.currentProperty.openRelated) {
      failedValidation.current = false;
      setValue(settingsContext.isScottish ? 6 : 3);
      mapContext.onEditMapObject(null, null);
      // propertyContext.onRelatedOpened();
    }
  }, [propertyContext, mapContext, settingsContext.isScottish]);

  useEffect(() => {
    if (
      propertyContext.newLogicalStatus &&
      propertyData &&
      propertyData.logicalStatus &&
      propertyContext.newLogicalStatus !== propertyData.logicalStatus
    ) {
      const today = GetCurrentDate(false);
      const newLpis = propertyData.lpis.map((x) => {
        return { ...x, logicalStatus: propertyContext.newLogicalStatus, changeType: "U", endDate: today };
      });
      const newCrossRefs = propertyData.blpuAppCrossRefs.map((x) => {
        return { ...x, changeType: "U", endDate: today };
      });
      const newProvenances = propertyData.blpuProvenances.map((x) => {
        return { ...x, changeType: "U", endDate: today };
      });

      const newPropertyData = !settingsContext.isScottish
        ? {
            blpuStateDate: propertyData.blpuStateDate,
            parentUprn: propertyData.parentUprn,
            neverExport: propertyData.neverExport,
            siteSurvey: propertyData.siteSurvey,
            uprn: propertyData.uprn,
            logicalStatus: propertyContext.newLogicalStatus,
            endDate: today,
            blpuState: propertyData.blpuState,
            startDate: propertyData.startDate,
            blpuClass: propertyData.blpuClass,
            localCustodianCode: propertyData.localCustodianCode,
            organisation: propertyData.organisation,
            xcoordinate: propertyData.xcoordinate,
            ycoordinate: propertyData.ycoordinate,
            wardCode: propertyData.wardCode,
            parishCode: propertyData.parishCode,
            pkId: propertyData.pkId,
            changeType: "U",
            rpc: propertyData.rpc,
            entryDate: propertyData.entryDate,
            lastUpdateDate: propertyData.lastUpdateDate,
            relatedPropertyCount: propertyData.relatedPropertyCount,
            relatedStreetCount: propertyData.relatedStreetCount,
            propertyLastUpdated: propertyData.propertyLastUpdated,
            propertyLastUser: propertyData.propertyLastUser,
            blpuAppCrossRefs: newCrossRefs,
            blpuProvenances: newProvenances,
            blpuNotes: propertyData.blpuNotes,
            lpis: newLpis,
          }
        : {
            blpuStateDate: propertyData.blpuStateDate,
            parentUprn: propertyData.parentUprn,
            neverExport: propertyData.neverExport,
            siteSurvey: propertyData.siteSurvey,
            uprn: propertyData.uprn,
            logicalStatus: propertyContext.newLogicalStatus,
            endDate: today,
            startDate: propertyData.startDate,
            blpuState: propertyData.blpuState,
            custodianCode: propertyData.custodianCode,
            level: propertyData.level,
            xcoordinate: propertyData.xcoordinate,
            ycoordinate: propertyData.ycoordinate,
            pkId: propertyData.pkId,
            changeType: "U",
            rpc: propertyData.rpc,
            entryDate: propertyData.entryDate,
            lastUpdateDate: propertyData.lastUpdateDate,
            relatedPropertyCount: propertyData.relatedPropertyCount,
            relatedStreetCount: propertyData.relatedStreetCount,
            propertyLastUpdated: propertyData.propertyLastUpdated,
            propertyLastUser: propertyData.propertyLastUser,
            blpuAppCrossRefs: newCrossRefs,
            blpuProvenances: newProvenances,
            classifications: propertyData.classifications.map((x) => {
              return { ...x, changeType: "U", endDate: today };
            }),
            organisations: propertyData.organisations.map((x) => {
              return { ...x, changeType: "U", endDate: today };
            }),
            successorCrossRefs: propertyData.successorCrossRefs.map((x) => {
              return { ...x, changeType: "U", endDate: today };
            }),
            blpuNotes: propertyData.blpuNotes,
            lpis: newLpis,
          };

      setPropertyData(newPropertyData);
      sandboxContext.onSandboxChange("currentProperty", newPropertyData);
    }
  }, [propertyData, propertyContext.newLogicalStatus, sandboxContext, propertyContext, settingsContext]);

  useEffect(() => {
    if (propertyContext.currentErrors) {
      if (propertyContext.currentErrors.blpu && propertyContext.currentErrors.blpu.length > 0)
        setBlpuErrors(propertyContext.currentErrors.blpu);
      else setBlpuErrors([]);

      if (propertyContext.currentErrors.lpi && propertyContext.currentErrors.lpi.length > 0)
        setLpiErrors(propertyContext.currentErrors.lpi);
      else setLpiErrors([]);

      if (propertyContext.currentErrors.classification && propertyContext.currentErrors.classification.length > 0)
        setClassificationErrors(propertyContext.currentErrors.classification);
      else setClassificationErrors([]);

      if (propertyContext.currentErrors.organisation && propertyContext.currentErrors.organisation.length > 0)
        setOrganisationErrors(propertyContext.currentErrors.organisation);
      else setOrganisationErrors([]);

      if (propertyContext.currentErrors.successorCrossRef && propertyContext.currentErrors.successorCrossRef.length > 0)
        setSuccessorCrossRefErrors(propertyContext.currentErrors.successorCrossRef);
      else setSuccessorCrossRefErrors([]);

      if (propertyContext.currentErrors.provenance && propertyContext.currentErrors.provenance.length > 0)
        setProvenanceErrors(propertyContext.currentErrors.provenance);
      else setProvenanceErrors([]);

      if (propertyContext.currentErrors.crossRef && propertyContext.currentErrors.crossRef.length > 0)
        setCrossRefErrors(propertyContext.currentErrors.crossRef);
      else setCrossRefErrors(null);

      if (propertyContext.currentErrors.note && propertyContext.currentErrors.note.length > 0)
        setNoteErrors(propertyContext.currentErrors.note);
      else setNoteErrors(null);
    }
  }, [propertyContext.currentErrors]);

  useEffect(() => {
    if (propertyContext.goToField) {
      setBlpuFocusedField(null);
      setLpiFocusedField(null);
      setProvenanceFocusedField(null);
      setCrossRefFocusedField(null);
      setNoteFocusedField(null);

      switch (propertyContext.goToField.type) {
        case 21:
          setBlpuFocusedField(propertyContext.goToField.fieldName);
          if (value !== 0) setValue(0);
          propertyContext.onRecordChange(21, null);
          setLpiFormData(null);
          break;

        case 22:
          setProvenanceFocusedField(propertyContext.goToField.fieldName);
          setValue(settingsContext.isScottish ? 4 : 1);
          const provenanceData =
            propertyData && propertyData.blpuProvenances.length > propertyContext.goToField.index
              ? propertyData.blpuProvenances[propertyContext.goToField.index]
              : null;
          if (provenanceData) {
            propertyContext.onRecordChange(22, propertyContext.goToField.index);
            setProvenanceFormData({
              id: provenanceData.pkId,
              provenanceData: provenanceData,
              blpuLogicalStatus: propertyData.logicalStatus,
              index: propertyContext.goToField.index,
              totalRecords: propertyData.blpuProvenances.length,
            });
          }
          break;

        case 23:
          setCrossRefFocusedField(propertyContext.goToField.fieldName);
          setValue(settingsContext.isScottish ? 5 : 2);
          const crossRefData =
            propertyData && propertyData.blpuAppCrossRefs.length > propertyContext.goToField.index
              ? propertyData.blpuAppCrossRefs[propertyContext.goToField.index]
              : null;
          if (crossRefData) {
            propertyContext.onRecordChange(23, propertyContext.goToField.index);
            setCrossRefFormData({
              id: crossRefData.id,
              xrefData: crossRefData,
              blpuLogicalStatus: propertyData.logicalStatus,
              index: propertyContext.goToField.index,
              totalRecords: propertyData.blpuAppCrossRefs.length,
            });
          }
          break;

        case 24:
          setLpiFocusedField(propertyContext.goToField.fieldName);
          if (value !== 0) setValue(0);
          const lpiData =
            propertyData && propertyData.lpis.length > propertyContext.goToField.index
              ? propertyData.lpis[propertyContext.goToField.index]
              : null;

          if (lpiData) {
            propertyContext.onRecordChange(24, propertyContext.goToField.index);
            setLpiFormData({
              pkId: lpiData.pkId,
              lpiData: lpiData,
              blpuLogicalStatus: propertyData.logicalStatus,
              organisation: propertyData.organisation,
              index: propertyContext.goToField.index,
              totalRecords: propertyData.lpis.length,
            });
          }
          break;

        case 30:
          setSuccessorCrossRefFocusedField(propertyContext.goToField.fieldName);
          if (value !== 3) setValue(3);
          const successorCrossRefData =
            propertyData && propertyData.successorCrossRefs.length > propertyContext.goToField.index
              ? propertyData.successorCrossRefs[propertyContext.goToField.index]
              : null;
          if (successorCrossRefData) {
            propertyContext.onRecordChange(30, propertyContext.goToField.index);
            setSuccessorCrossRefFormData({
              id: successorCrossRefData.pkId,
              successorCrossRefData: successorCrossRefData,
              blpuLogicalStatus: propertyData.logicalStatus,
              index: propertyContext.goToField.index,
              totalRecords: propertyData.successorCrossRefs.length,
            });
          }
          break;

        case 31:
          setOrganisationFocusedField(propertyContext.goToField.fieldName);
          if (value !== 2) setValue(2);
          const organisationData =
            propertyData && propertyData.organisations.length > propertyContext.goToField.index
              ? propertyData.organisations[propertyContext.goToField.index]
              : null;
          if (organisationData) {
            propertyContext.onRecordChange(31, propertyContext.goToField.index);
            setOrganisationFormData({
              id: organisationData.pkId,
              organisationData: organisationData,
              blpuLogicalStatus: propertyData.logicalStatus,
              index: propertyContext.goToField.index,
              totalRecords: propertyData.organisations.length,
            });
          }
          break;

        case 32:
          setClassificationFocusedField(propertyContext.goToField.fieldName);
          if (value !== 1) setValue(1);
          const classificationData =
            propertyData && propertyData.classifications.length > propertyContext.goToField.index
              ? propertyData.classifications[propertyContext.goToField.index]
              : null;
          if (classificationData) {
            propertyContext.onRecordChange(32, propertyContext.goToField.index);
            setClassificationFormData({
              id: classificationData.pkId,
              classificationData: classificationData,
              blpuLogicalStatus: propertyData.logicalStatus,
              index: propertyContext.goToField.index,
              totalRecords: propertyData.classifications.length,
            });
          }
          break;

        case 71:
          setNoteFocusedField(propertyContext.goToField.fieldName);
          setValue(settingsContext.isScottish ? 7 : 4);
          const noteData =
            propertyData && propertyData.blpuNotes.length > propertyContext.goToField.index
              ? propertyData.blpuNotes[propertyContext.goToField.index]
              : null;
          if (noteData) {
            propertyContext.onRecordChange(71, propertyContext.goToField.index);
            setNotesFormData({
              pkId: noteData.pkId,
              noteData: noteData,
              index: propertyContext.goToField.index,
              totalRecords: propertyData.blpuNotes.length,
              variant: "property",
            });
          }
          break;

        default:
          break;
      }

      propertyContext.onGoToField(null, null, null);
    }
  }, [propertyContext, propertyContext.goToField, value, propertyData, settingsContext.isScottish]);

  useEffect(() => {
    const propertyChanged = hasPropertyChanged(
      propertyContext.currentProperty.newProperty,
      sandboxContext.currentSandbox
    );
    setSaveDisabled(!propertyChanged);
    propertyContext.onPropertyModified(propertyChanged);
    if (propertyChanged) mapContext.onSetCoordinate(null);
  }, [propertyContext, sandboxContext.currentSandbox, mapContext]);

  return (
    <div id="property-data-form">
      <AppBar position="static" color="default">
        <Tabs
          value={value}
          onChange={handleTabChange}
          TabIndicatorProps={{ style: { background: adsBlueA, height: "2px" } }}
          variant="scrollable"
          scrollButtons="auto"
          selectionFollowsFocus
          aria-label="property-tabs"
          sx={tabContainerStyle}
        >
          <Tab
            sx={tabStyle}
            label={
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography variant="subtitle2" sx={tabLabelStyle(value === 0)}>
                  Details
                </Typography>
                {((blpuErrors && blpuErrors.length > 0) || (lpiErrors && lpiErrors.length > 0)) && (
                  <ErrorIcon sx={errorIconStyle} />
                )}
              </Stack>
            }
            {...a11yProps(0)}
          />
          {settingsContext.isScottish && (
            <Tab
              sx={tabStyle}
              label={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="subtitle2" sx={tabLabelStyle(value === 1)}>
                    Classifications
                  </Typography>
                  {classificationErrors && classificationErrors.length > 0 ? (
                    <ErrorIcon sx={errorIconStyle} />
                  ) : (
                    <Avatar
                      variant="rounded"
                      sx={GetTabIconStyle(
                        propertyData && propertyData.classifications
                          ? propertyData.classifications.filter((x) => x.changeType !== "D").length
                          : 0
                      )}
                    >
                      <Typography variant="caption">
                        <strong>
                          {propertyData && propertyData.classifications
                            ? propertyData.classifications.filter((x) => x.changeType !== "D").length
                            : 0}
                        </strong>
                      </Typography>
                    </Avatar>
                  )}
                </Stack>
              }
              {...a11yProps(1)}
            />
          )}
          {settingsContext.isScottish && (
            <Tab
              sx={tabStyle}
              label={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="subtitle2" sx={tabLabelStyle(value === 2)}>
                    Organisations
                  </Typography>
                  {organisationErrors && organisationErrors.length > 0 ? (
                    <ErrorIcon sx={errorIconStyle} />
                  ) : (
                    <Avatar
                      variant="rounded"
                      sx={GetTabIconStyle(
                        propertyData && propertyData.organisations
                          ? propertyData.organisations.filter((x) => x.changeType !== "D").length
                          : 0
                      )}
                    >
                      <Typography variant="caption">
                        <strong>
                          {propertyData && propertyData.organisations
                            ? propertyData.organisations.filter((x) => x.changeType !== "D").length
                            : 0}
                        </strong>
                      </Typography>
                    </Avatar>
                  )}
                </Stack>
              }
              {...a11yProps(2)}
            />
          )}
          {settingsContext.isScottish && (
            <Tab
              sx={tabStyle}
              label={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="subtitle2" sx={tabLabelStyle(value === 3)}>
                    Successors
                  </Typography>
                  {successorCrossRefErrors && successorCrossRefErrors.length > 0 ? (
                    <ErrorIcon sx={errorIconStyle} />
                  ) : (
                    <Avatar
                      variant="rounded"
                      sx={GetTabIconStyle(
                        propertyData && propertyData.successorCrossRefs
                          ? propertyData.successorCrossRefs.filter((x) => x.changeType !== "D").length
                          : 0
                      )}
                    >
                      <Typography variant="caption">
                        <strong>
                          {propertyData && propertyData.successorCrossRefs
                            ? propertyData.successorCrossRefs.filter((x) => x.changeType !== "D").length
                            : 0}
                        </strong>
                      </Typography>
                    </Avatar>
                  )}
                </Stack>
              }
              {...a11yProps(3)}
            />
          )}
          <Tab
            sx={tabStyle}
            label={
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography variant="subtitle2" sx={tabLabelStyle(value === (settingsContext.isScottish ? 4 : 1))}>
                  Provenances
                </Typography>
                {provenanceErrors && provenanceErrors.length > 0 ? (
                  <ErrorIcon sx={errorIconStyle} />
                ) : (
                  <Avatar
                    variant="rounded"
                    sx={GetTabIconStyle(
                      propertyData && propertyData.blpuProvenances
                        ? propertyData.blpuProvenances.filter((x) => x.changeType !== "D").length
                        : 0
                    )}
                  >
                    <Typography variant="caption">
                      <strong>
                        {propertyData && propertyData.blpuProvenances
                          ? propertyData.blpuProvenances.filter((x) => x.changeType !== "D").length
                          : 0}
                      </strong>
                    </Typography>
                  </Avatar>
                )}
              </Stack>
            }
            {...a11yProps(settingsContext.isScottish ? 4 : 1)}
          />
          <Tab
            sx={tabStyle}
            label={
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography variant="subtitle2" sx={tabLabelStyle(value === (settingsContext.isScottish ? 5 : 2))}>
                  Cross refs
                </Typography>
                {crossRefErrors && crossRefErrors.length > 0 ? (
                  <ErrorIcon sx={errorIconStyle} />
                ) : (
                  <Avatar
                    variant="rounded"
                    sx={GetTabIconStyle(
                      propertyData && propertyData.blpuAppCrossRefs
                        ? propertyData.blpuAppCrossRefs.filter((x) => x.changeType !== "D").length
                        : 0
                    )}
                  >
                    <Typography variant="caption">
                      <strong>
                        {propertyData && propertyData.blpuAppCrossRefs
                          ? propertyData.blpuAppCrossRefs.filter((x) => x.changeType !== "D").length
                          : 0}
                      </strong>
                    </Typography>
                  </Avatar>
                )}
              </Stack>
            }
            {...a11yProps(settingsContext.isScottish ? 5 : 2)}
          />
          <Tab
            sx={tabStyle}
            label={
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography variant="subtitle2" sx={tabLabelStyle(value === (settingsContext.isScottish ? 6 : 3))}>
                  Related
                </Typography>
                <Avatar
                  variant="rounded"
                  sx={GetTabIconStyle(
                    propertyData ? propertyData.relatedPropertyCount + propertyData.relatedStreetCount : 0
                  )}
                >
                  <Typography variant="caption">
                    <strong>
                      {propertyData ? propertyData.relatedPropertyCount + propertyData.relatedStreetCount : 0}
                    </strong>
                  </Typography>
                </Avatar>
              </Stack>
            }
            {...a11yProps(settingsContext.isScottish ? 6 : 3)}
          />
          <Tab
            sx={tabStyle}
            label={
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography variant="subtitle2" sx={tabLabelStyle(value === (settingsContext.isScottish ? 7 : 4))}>
                  Notes
                </Typography>
                {noteErrors && noteErrors.length > 0 ? (
                  <ErrorIcon sx={errorIconStyle} />
                ) : (
                  <Avatar
                    variant="rounded"
                    sx={GetTabIconStyle(
                      propertyData && propertyData.blpuNotes
                        ? propertyData.blpuNotes.filter((x) => x.changeType !== "D").length
                        : 0
                    )}
                  >
                    <Typography variant="caption">
                      <strong>
                        {propertyData && propertyData.blpuNotes
                          ? propertyData.blpuNotes.filter((x) => x.changeType !== "D").length
                          : 0}
                      </strong>
                    </Typography>
                  </Avatar>
                )}
              </Stack>
            }
            {...a11yProps(settingsContext.isScottish ? 7 : 4)}
          />
          <Tab
            sx={tabStyle}
            label={
              <Typography variant="subtitle2" sx={tabLabelStyle(value === (settingsContext.isScottish ? 8 : 5))}>
                History
              </Typography>
            }
            {...a11yProps(settingsContext.isScottish ? 8 : 5)}
          />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        {lpiFormData ? (
          <PropertyLPITab
            data={lpiFormData}
            errors={lpiErrors && lpiErrors.filter((x) => x.index === lpiFormData.index)}
            loading={loading}
            focusedField={lpiFocusedField}
            onSetCopyOpen={(open, dataType) => handleCopyOpen(open, dataType)}
            onHomeClick={(action, srcData, currentData) => handleLPIHomeClick(action, srcData, currentData)}
            onAddLpi={handleAddLPI}
            onDelete={(pkId) => handleDeleteLPI(pkId)}
          />
        ) : (
          <PropertyDetailsTab
            data={propertyData}
            errors={blpuErrors}
            lpiErrors={lpiErrors}
            loading={loading}
            focusedField={blpuFocusedField}
            onSetCopyOpen={(open, dataType) => handleCopyOpen(open, dataType)}
            onViewRelated={handleViewRelated}
            onLpiSelected={(pkId, lpiData, dataIdx, dataLength) =>
              handleLPISelected(pkId, lpiData, dataIdx, dataLength)
            }
            onLpiDeleted={(pkId) => handleDeleteLPI(pkId)}
            onDataChanged={(srcData) => handleBLPUDataChanged(srcData)}
            onOrganisationChanged={(oldValue, newValue, srcData) =>
              handleOrganisationChanged(oldValue, newValue, srcData)
            }
            onChildAdd={handleChildAdd}
          />
        )}
      </TabPanel>
      {settingsContext.isScottish && (
        <TabPanel value={value} index={1}>
          {classificationFormData ? (
            <PropertyClassificationTab
              data={classificationFormData}
              errors={
                classificationErrors && classificationErrors.filter((x) => x.index === classificationFormData.index)
              }
              loading={loading}
              focusedField={classificationFocusedField}
              onHomeClick={(action, srcData, currentData) =>
                handleClassificationHomeClick(action, srcData, currentData)
              }
              onDelete={(pkId) => handleDeleteClassification(pkId)}
            />
          ) : (
            <PropertyClassificationListTab
              data={
                propertyData &&
                propertyData.classifications &&
                propertyData.classifications
                  .filter((x) => x.changeType !== "D")
                  .map(function (x) {
                    return {
                      id: x.pkId,
                      uprn: x.uprn,
                      changeType: x.changeType,
                      classKey: x.classKey,
                      blpuClass: x.blpuClass,
                      classificationScheme: x.classificationScheme,
                      entryDate: x.entryDate,
                      lastUpdateDate: x.lastUpdateDate,
                      startDate: x.startDate,
                      endDate: x.endDate,
                    };
                  })
              }
              errors={classificationErrors}
              loading={loading}
              onClassificationSelected={(pkId, classificationData, dataIdx, dataLength) =>
                handleClassificationSelected(pkId, classificationData, dataIdx, dataLength)
              }
              onClassificationDelete={(pkId) => handleDeleteClassification(pkId)}
              onMultiClassificationDelete={(classificationIds) => handleMultiDeleteClassification(classificationIds)}
            />
          )}
        </TabPanel>
      )}
      {settingsContext.isScottish && (
        <TabPanel value={value} index={2}>
          {organisationFormData ? (
            <PropertyOrganisationTab
              data={organisationFormData}
              errors={organisationErrors && organisationErrors.filter((x) => x.index === organisationFormData.index)}
              loading={loading}
              focusedField={organisationFocusedField}
              onHomeClick={(action, srcData, currentData) => handleOrganisationHomeClick(action, srcData, currentData)}
              onDelete={(pkId) => handleDeleteOrganisation(pkId)}
            />
          ) : (
            <PropertyOrganisationListTab
              data={
                propertyData &&
                propertyData.organisations &&
                propertyData.organisations
                  .filter((x) => x.changeType !== "D")
                  .map(function (x) {
                    return {
                      id: x.pkId,
                      uprn: x.uprn,
                      changeType: x.changeType,
                      orgKey: x.orgKey,
                      organisation: x.organisation,
                      legalName: x.legalName,
                      entryDate: x.entryDate,
                      lastUpdateDate: x.lastUpdateDate,
                      startDate: x.startDate,
                      endDate: x.endDate,
                    };
                  })
              }
              errors={organisationErrors}
              loading={loading}
              onOrganisationSelected={(pkId, organisationData, dataIdx, dataLength) =>
                handleOrganisationSelected(pkId, organisationData, dataIdx, dataLength)
              }
              onOrganisationDelete={(pkId) => handleDeleteOrganisation(pkId)}
              onMultiOrganisationDelete={(organisationIds) => handleMultiDeleteOrganisation(organisationIds)}
            />
          )}
        </TabPanel>
      )}
      {settingsContext.isScottish && (
        <TabPanel value={value} index={3}>
          {successorCrossRefFormData ? (
            <SuccessorTab
              data={successorCrossRefFormData}
              variant="property"
              errors={
                successorCrossRefErrors &&
                successorCrossRefErrors.filter((x) => x.index === successorCrossRefFormData.index)
              }
              loading={loading}
              focusedField={successorCrossRefFocusedField}
              onHomeClick={(action, srcData, currentData) =>
                handleSuccessorCrossRefHomeClick(action, srcData, currentData)
              }
              onDelete={(pkId) => handleDeleteSuccessorCrossRef(pkId)}
            />
          ) : (
            <SuccessorListTab
              data={
                propertyData &&
                propertyData.successorCrossRefs &&
                propertyData.successorCrossRefs
                  .filter((x) => x.changeType !== "D")
                  .map(function (x) {
                    return {
                      id: x.pkId,
                      uprn: x.uprn,
                      changeType: x.changeType,
                      succKey: x.succKey,
                      predecessor: x.predecessor,
                      successorType: x.successorType,
                      successor: x.successor,
                      entryDate: x.entryDate,
                      lastUpdateDate: x.lastUpdateDate,
                      startDate: x.startDate,
                      endDate: x.endDate,
                    };
                  })
              }
              variant="property"
              errors={successorCrossRefErrors}
              loading={loading}
              onSuccessorCrossRefSelected={(pkId, successorCrossRefData, dataIdx, dataLength) =>
                handleSuccessorCrossRefSelected(pkId, successorCrossRefData, dataIdx, dataLength)
              }
              onSuccessorCrossRefDelete={(pkId) => handleDeleteSuccessorCrossRef(pkId)}
              onMultiSuccessorCrossRefDelete={(successorCrossRefIds) =>
                handleMultiDeleteSuccessorCrossRef(successorCrossRefIds)
              }
            />
          )}
        </TabPanel>
      )}
      <TabPanel value={value} index={settingsContext.isScottish ? 4 : 1}>
        {provenanceFormData ? (
          <PropertyBLPUProvenanceTab
            data={provenanceFormData}
            errors={provenanceErrors && provenanceErrors.filter((x) => x.index === provenanceFormData.index)}
            loading={loading}
            focusedField={provenanceFocusedField}
            onDataChanged={handleProvenanceDataChanged}
            onHomeClick={(action, srcData, currentData) => handleProvenanceHomeClick(action, srcData, currentData)}
            onDelete={(pkId) => handleDeleteProvenance(pkId)}
          />
        ) : (
          <PropertyBLPUProvenanceListTab
            data={
              propertyData &&
              propertyData.blpuProvenances &&
              propertyData.blpuProvenances
                .filter((x) => x.changeType !== "D")
                .map(function (x) {
                  return {
                    id: x.pkId,
                    uprn: x.uprn,
                    changeType: x.changeType,
                    provenanceKey: x.provenanceKey,
                    provenanceCode: x.provenanceCode,
                    annotation: x.annotation,
                    entryDate: x.entryDate,
                    lastUpdateDate: x.lastUpdateDate,
                    startDate: x.startDate,
                    endDate: x.endDate,
                    wktGeometry: x.wktGeometry,
                  };
                })
            }
            errors={provenanceErrors}
            loading={loading}
            onProvenanceSelected={(pkId, provenanceData, dataIdx, dataLength) =>
              handleProvenanceSelected(pkId, provenanceData, dataIdx, dataLength)
            }
            onProvenanceDelete={(pkId) => handleDeleteProvenance(pkId)}
            onMultiProvenanceDelete={(provenanceIds) => handleMultiDeleteProvenance(provenanceIds)}
          />
        )}
      </TabPanel>
      <TabPanel value={value} index={settingsContext.isScottish ? 5 : 2}>
        {crossRefFormData ? (
          <PropertyCrossRefTab
            data={crossRefFormData}
            errors={crossRefErrors && crossRefErrors.filter((x) => x.index === crossRefFormData.index)}
            loading={loading}
            focusedField={crossRefFocusedField}
            onHomeClick={(action, srcData, currentData) => handleCrossRefHomeClick(action, srcData, currentData)}
            onDelete={(pkId) => handleDeleteCrossRef(pkId)}
          />
        ) : (
          <PropertyCrossRefListTab
            data={
              propertyData &&
              propertyData.blpuAppCrossRefs &&
              propertyData.blpuAppCrossRefs
                .filter((x) => x.changeType !== "D")
                .map(function (x) {
                  return {
                    id: x.pkId,
                    uprn: x.uprn,
                    changeType: x.changeType,
                    xrefKey: x.xrefKey,
                    source: x.source,
                    sourceId: x.sourceId,
                    crossReference: x.crossReference,
                    startDate: x.startDate,
                    endDate: x.endDate,
                    entryDate: x.entryDate,
                    lastUpdateDate: x.lastUpdateDate,
                    neverExport: x.neverExport,
                  };
                })
            }
            errors={crossRefErrors}
            loading={loading}
            onSetCopyOpen={(open, dataType) => handleCopyOpen(open, dataType)}
            onCrossRefSelected={(pkId, xrefData, dataIdx, dataLength) =>
              handleCrossRefSelected(pkId, xrefData, dataIdx, dataLength)
            }
            onCrossRefDelete={(pkId) => handleDeleteCrossRef(pkId)}
            onMultiCrossRefDelete={(crossRefIds) => handleMultiDeleteCrossRef(crossRefIds)}
          />
        )}
      </TabPanel>
      <TabPanel value={value} index={settingsContext.isScottish ? 6 : 3}>
        <RelatedTab
          variant="property"
          propertyCount={propertyData ? propertyData.relatedPropertyCount : 0}
          streetCount={propertyData ? propertyData.relatedStreetCount : 0}
          onSetCopyOpen={(open, dataType) => handleCopyOpen(open, dataType)}
          onPropertyAdd={(usrn, easting, northing, parent) => handlePropertyAdd(usrn, easting, northing, parent)}
        />
      </TabPanel>
      <TabPanel value={value} index={settingsContext.isScottish ? 7 : 4}>
        {notesFormData ? (
          <NotesDataTab
            data={notesFormData}
            errors={noteErrors && noteErrors.filter((x) => x.index === notesFormData.index)}
            loading={loading}
            focusedField={noteFocusedField}
            onDelete={(pkId) => handleDeleteNote(pkId)}
            onHomeClick={(action, srcData, currentData) => handleNoteHomeClick(action, srcData, currentData)}
          />
        ) : (
          <NotesListTab
            data={
              propertyData && propertyData.blpuNotes ? propertyData.blpuNotes.filter((x) => x.changeType !== "D") : null
            }
            errors={noteErrors}
            loading={loading}
            variant="property"
            onNoteSelected={(pkId, noteData, dataIdx) => handleNoteSelected(pkId, noteData, dataIdx)}
            onNoteDelete={(pkId) => handleDeleteNote(pkId)}
          />
        )}
      </TabPanel>
      <TabPanel value={value} index={settingsContext.isScottish ? 8 : 5}>
        <EntityHistoryTab variant="property" />
      </TabPanel>
      <div>
        <Snackbar
          open={copyOpen}
          autoHideDuration={6000}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          onClose={handleCopyClose}
        >
          <Alert
            sx={{
              backgroundColor: adsBlueA,
            }}
            icon={<CheckIcon fontSize="inherit" />}
            onClose={handleCopyClose}
            severity="success"
            elevation={6}
            variant="filled"
          >{`${copyDataType.current} copied to clipboard`}</Alert>
        </Snackbar>
      </div>
      <div>
        <Snackbar
          open={saveOpen}
          autoHideDuration={6000}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          onClose={handleSaveClose}
        >
          <Alert
            sx={GetAlertStyle(saveResult.current)}
            icon={GetAlertIcon(saveResult.current)}
            onClose={handleSaveClose}
            severity={GetAlertSeverity(saveResult.current)}
            elevation={6}
            variant="filled"
          >{`${
            saveResult.current
              ? "The property has been successfully saved."
              : failedValidation.current
              ? "Failed to validate the record."
              : "Failed to save the property."
          }`}</Alert>
        </Snackbar>
      </div>
      <AppBar
        position="static"
        color="default"
        sx={{
          top: "auto",
          bottom: 0,
          height: "56px",
          backgroundColor: adsWhite,
          borderTop: `1px solid ${adsLightGreyB}`,
        }}
      >
        <Toolbar
          variant="dense"
          disableGutters
          sx={{
            pl: theme.spacing(1),
            pr: theme.spacing(2),
            pt: theme.spacing(1),
          }}
        >
          <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
            <HistoryIcon sx={{ color: adsMidGreyA }} />
            <Typography variant="body2" sx={{ color: adsMidGreyA }}>{`Last updated ${
              propertyData && propertyData.propertyLastUpdated ? FormatDateTime(propertyData.propertyLastUpdated) : ""
            }`}</Typography>
            {propertyData && propertyData.propertyLastUser && GetUserAvatar(propertyData.propertyLastUser)}
          </Stack>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            id="property-save-button"
            sx={getSaveButtonStyle(propertyContext.currentPropertyHasErrors)}
            variant="text"
            startIcon={getSaveIcon(propertyContext.currentPropertyHasErrors)}
            disabled={saveDisabled}
            onClick={handleSaveClicked}
          >
            Save
          </Button>
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default PropertyDataForm;
