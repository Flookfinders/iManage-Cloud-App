/* #region header */
/**************************************************************************************************
//
//  Description: Street data form
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001            Sean Flook                 Initial Revision.
//    002   25.04.23 Sean Flook         WI40706 Use the correct value to open the related tab.
//    003   28.06.23 Sean Flook         WI40256 Changed Extent to Provenance where appropriate.
//    004   20.07.23 Sean Flook                 Added code to handle when a user adds a new associated record and then clicks on the Cancel button.
//    005   10.08.23 Sean Flook                 Various fixes and improvements.
//    006   23.08.23 Sean Flook       IMANN-159 When creating new records use the defaults from the street template.
//    007   07.09.23 Sean Flook                 Changes required to handle maintaining ESUs.
//    008   20.09.23 Sean Flook                 Changes required to handle the OneScotland specific record types.
//    009   22.09.23 Sean Flook                 Various small bug fixes.
//    010   06.10.23 Sean Flook                 Various changes required to ensure this works for GeoPlace and OneScotland.
//    010   10.10.23 Sean Flook       IMANN-163 Changes required for opening the related tab after the property wizard.
//    011   11.10.23 Sean Flook       IMANN-163 Use the centralised doOpenRecord method.
//    012   11.10.23 Sean Flook       IMANN-163 Correctly handle historic properties.
//    013   13.09.23 Sean Flook                 Renamed EsuComparison to MergeEsuComparison and a small bug fix.
//    014   16.10.23 Sean Flook                 Correctly set the required parent information when adding a property, if required.
//    015   03.11.23 Sean Flook                 When creating a new ESU also create a new highway dedication record, also added hyphen to one-way.
//    016   10.11.23 Sean Flook                 Removed HasASDPlus as no longer required.
//    017   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system and renamed successor to successorCrossRef.
//    018   30.11.23 Sean Flook       IMANN-196 Corrected field name in updateDescriptorData.
//    019   14.12.23 Sean Flook                 Corrected note record type.
//    020   19.12.23 Sean Flook                 Various bug fixes.
//    021   21.12.23 Sean Flook                 Ensure the sandbox is correctly updated.
//    022   03.01.24 Sean Flook                 Fixed warning.
//    023   05.01.24 Sean Flook                 Changes to sort out warnings.
//    024   09.01.24 Sean Flook       IMANN-197 Calculate the current length of the street when creating a new PRoW record.
//    025   11.01.24 Sean Flook       IMANN-163 Close the add property wizard dialog when clicking on view properties.
//    026   12.01.24 Sean Flook       IMANN-163 If viewing property create results do not reset everything.
//    027   12.01.24 Sean Flook       IMANN-233 Use the new getStartEndCoordinates method.
//    028   23.01.24 Sean Flook       IMANN-249 Do not display the ASD tab if street type 4 or 9.
//    029   25.01.24 Sean Flook                 Changes required after UX review.
//    030   26.01.24 Sean Flook       IMANN-260 Corrected field name.
//    031   26.01.24 Sean Flook       IMANN-232 Do not remove record when creating a new street.
//    032   26.01.24 Sean Flook       IMANN-257 Bug fix handleNoteSelected.
//    033   02.02.24 Sean Flook       IMANN-271 Reset the errors when opening a new street.
//    034   05.02.24 Sean Flook       IMANN-276 Do not worry about ASD records when setting coordinates if the record type is 4 or 9.
//    035   09.02.24 Sean Flook                 Modified handleHistoricPropertyClose to handle returning an action from the historic property warning dialog.
//    036   13.02.24 Sean Flook                 Changes required to handle the PRoW geometries.
//    037   13.02.24 Sean Flook                 Corrected the type 66 map data and pass the correct parameters to StreetDelete.
//    038   14.02.24 Sean Flook        ASD10_GP When opening a PRoW record if it is marked as Inexact set the map accordingly.
//    039   14.02.24 Sean Flook        ASD10_GP Changes required to filter the ASD map layers when editing a record.
//    040   14.02.24 Sean Flook        ESU14_GP Modify handleEsuDeleted to also update the map.
//    041   16.02.24 Sean Flook         ESU9_GP When discarding an ESU do not remove from list if it has been merged or divided.
//    042   16.02.24 Sean Flook        ESU12_GP When returning from a highway dedication or one way exemption record always show the parent ESU record.
//    043   16.02.24 Sean Flook        ESU16_GP If changing page etc ensure the information and selection controls are cleared.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useRef, useEffect, Fragment } from "react";
import { useHistory } from "react-router";
import PropTypes from "prop-types";

import StreetContext from "../context/streetContext";
import SandboxContext from "../context/sandboxContext";
import PropertyContext from "../context/propertyContext";
import MapContext from "../context/mapContext";
import UserContext from "./../context/userContext";
import LookupContext from "./../context/lookupContext";
import SearchContext from "../context/searchContext";
import SettingsContext from "../context/settingsContext";
import InformationContext from "../context/informationContext";

import {
  FormatDateTime,
  GetUserAvatar,
  GetCurrentDate,
  GetWktCoordinates,
  GetChangedAssociatedRecords,
  ResetContexts,
  GetPolylineAsWKT,
  doOpenRecord,
  getStartEndCoordinates,
} from "../utils/HelperUtils";
import {
  GetNewStreetData,
  GetCurrentStreetData,
  GetNewEsuStreetData,
  SaveStreet,
  GetStreetMapData,
  GetEsuData,
  GetMultipleEsusData,
  GetWholeRoadGeometry,
  updateMapStreetData,
  hasStreetChanged,
  StreetDelete,
} from "../utils/StreetUtils";
import { UpdateRangeAfterSave, UpdateAfterSave, GetPropertyMapData } from "../utils/PropertyUtils";
import ObjectComparison, { MergeEsuComparison } from "./../utils/ObjectComparison";
import { HasASD } from "../configuration/ADSConfig";

import { useEditConfirmation } from "../pages/EditConfirmationPage";
import { useSaveConfirmation } from "../pages/SaveConfirmationPage";
import { AppBar, Tabs, Tab, Typography, Avatar, Button, Snackbar, Toolbar, Alert } from "@mui/material";
import { Box, Stack } from "@mui/system";
import CheckIcon from "@mui/icons-material/Check";
import HistoryIcon from "@mui/icons-material/History";
import ErrorIcon from "@mui/icons-material/Error";
import StreetDataTab from "../tabs/StreetDataTab";
import StreetDescriptorDataTab from "../tabs/StreetDescriptorDataTab";
import EsuListTab from "../tabs/EsuListTab";
import SuccessorListTab from "../tabs/SuccessorListTab";
import SuccessorTab from "../tabs/SuccessorTab";
import AsdDataTab from "../tabs/AsdDataTab";
import RelatedTab from "../tabs/RelatedTab";
import NotesListTab from "../tabs/NotesListTab";
import EntityHistoryTab from "../tabs/EntityHistoryTab";
import HighwayDedicationDataTab from "../tabs/HighwayDedicationDataTab";
import OneWayExemptionDataTab from "../tabs/OneWayExemptionDataTab";
import EsuDataTab from "../tabs/EsuDataTab";
import MaintenanceResponsibilityDataTab from "../tabs/MaintenanceResponsibilityDataTab";
import ReinstatementCategoryDataTab from "../tabs/ReinstatementCategoryDataTab";
import OSSpecialDesignationDataTab from "../tabs/OSSpecialDesignationDataTab";
import InterestDataTab from "../tabs/InterestDataTab";
import ConstructionDataTab from "../tabs/ConstructionDataTab";
import SpecialDesignationDataTab from "../tabs/SpecialDesignationDataTab";
import HWWDataTab from "../tabs/HWWDataTab";
import PRoWDataTab from "../tabs/PRoWDataTab";
import NotesDataTab from "../tabs/NotesDataTab";
import AddPropertyWizardDialog from "../dialogs/AddPropertyWizardDialog";
import HistoricPropertyDialog from "../dialogs/HistoricPropertyDialog";
import { GazetteerRoute } from "../PageRouting";

import Polyline from "@arcgis/core/geometry/Polyline";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";

import { adsBlueA, adsMidGreyA, adsWhite } from "../utils/ADSColours";
import {
  GetTabIconStyle,
  GetAlertStyle,
  GetAlertIcon,
  GetAlertSeverity,
  errorIconStyle,
  tabStyle,
  tabLabelStyle,
  getSaveButtonStyle,
  getSaveIcon,
} from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`street-tabpanel-${index}`}
      aria-labelledby={`street-tab-${index}`}
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
    id: `street-tab-${index}`,
    "aria-controls": `street-tabpanel-${index}`,
  };
}

function StreetDataForm({ data, loading }) {
  const theme = useTheme();

  const streetContext = useContext(StreetContext);
  const sandboxContext = useContext(SandboxContext);
  const propertyContext = useContext(PropertyContext);
  const mapContext = useContext(MapContext);
  const userContext = useContext(UserContext);
  const lookupContext = useContext(LookupContext);
  const searchContext = useContext(SearchContext);
  const settingsContext = useContext(SettingsContext);
  const informationContext = useContext(InformationContext);

  const history = useHistory();

  const [streetData, setStreetData] = useState(data);
  const currentStreetEsuData = useRef(null);
  const currentStreetAsdData = useRef(null);
  const streetUsrn = useRef(null);
  const [value, setValue] = useState(0);
  const [copyOpen, setCopyOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [descriptorFormData, setDescriptorFormData] = useState(null);
  const [esuFormData, setEsuFormData] = useState(null);
  const currentEsuFormData = useRef(null);
  const [hdFormData, setHdFormData] = useState(null);
  const [oweFormData, setOweFormData] = useState(null);
  const [successorCrossRefFormData, setSuccessorCrossRefFormData] = useState(null);
  const [maintenanceResponsibilityFormData, setMaintenanceResponsibilityFormData] = useState(null);
  const [reinstatementCategoryFormData, setReinstatementCategoryFormData] = useState(null);
  const [osSpecialDesignationFormData, setOSSpecialDesignationFormData] = useState(null);
  const [interestFormData, setInterestFormData] = useState(null);
  const [constructionFormData, setConstructionFormData] = useState(null);
  const [specialDesignationFormData, setSpecialDesignationFormData] = useState(null);
  const [hwwFormData, setHwwFormData] = useState(null);
  const [prowFormData, setProwFormData] = useState(null);
  const [notesFormData, setNotesFormData] = useState(null);

  const copyDataType = useRef(null);
  const saveResult = useRef(null);
  const failedValidation = useRef(null);
  const esuChanged = useRef(false);
  const mergedDividedEsus = useRef([]);

  const [streetErrors, setStreetErrors] = useState([]);
  const [descriptorErrors, setDescriptorErrors] = useState([]);
  const [esuErrors, setEsuErrors] = useState([]);
  const [oneWayExemptionErrors, setOneWayExemptionErrors] = useState([]);
  const [highwayDedicationErrors, setHighwayDedicationErrors] = useState([]);
  const [successorCrossRefErrors, setSuccessorCrossRefErrors] = useState([]);
  const [maintenanceResponsibilityErrors, setMaintenanceResponsibilityErrors] = useState([]);
  const [reinstatementCategoryErrors, setReinstatementCategoryErrors] = useState([]);
  const [osSpecialDesignationErrors, setOSSpecialDesignationErrors] = useState([]);
  const [interestErrors, setInterestErrors] = useState([]);
  const [constructionErrors, setConstructionErrors] = useState([]);
  const [specialDesignationErrors, setSpecialDesignationErrors] = useState([]);
  const [heightWidthWeightErrors, setHeightWidthWeightErrors] = useState([]);
  const [publicRightOfWayErrors, setPublicRightOfWayErrors] = useState([]);
  const [noteErrors, setNoteErrors] = useState([]);

  const [saveDisabled, setSaveDisabled] = useState(true);

  const confirmDialog = useEditConfirmation();
  const saveConfirmDialog = useSaveConfirmation();

  const propertyWizardType = useRef(null);
  const propertyWizardParent = useRef(null);
  const [openPropertyWizard, setOpenPropertyWizard] = useState(false);

  const [openHistoricProperty, setOpenHistoricProperty] = useState(false);

  const [alertOpen, setAlertOpen] = useState(false);
  const alertType = useRef(null);

  const [streetFocusedField, setStreetFocusedField] = useState(null);
  const [descriptorFocusedField, setDescriptorFocusedField] = useState(null);
  const [esuFocusedField, setEsuFocusedField] = useState(null);
  const [oneWayExemptionFocusedField, setOneWayExemptionFocusedField] = useState(null);
  const [highwayDedicationFocusedField, setHighwayDedicationFocusedField] = useState(null);
  const [successorCrossRefFocusedField, setSuccessorCrossRefFocusedField] = useState(null);
  const [maintenanceResponsibilityFocusedField, setMaintenanceResponsibilityFocusedField] = useState(null);
  const [reinstatementCategoryFocusedField, setReinstatementCategoryFocusedField] = useState(null);
  const [osSpecialDesignationFocusedField, setOSSpecialDesignationFocusedField] = useState(null);
  const [interestFocusedField, setInterestFocusedField] = useState(null);
  const [constructionFocusedField, setConstructionFocusedField] = useState(null);
  const [specialDesignationFocusedField, setSpecialDesignationFocusedField] = useState(null);
  const [heightWidthWeightFocusedField, setHeightWidthWeightFocusedField] = useState(null);
  const [publicRightOfWayFocusedField, setPublicRightOfWayFocusedField] = useState(null);
  const [noteFocusedField, setNoteFocusedField] = useState(null);

  const wizardUprn = useRef(null);
  const historicRec = useRef(null);

  /**
   * Sets the associated street data for the current street.
   *
   * @param {object|null} esuData The ESU data for the street.
   * @param {object|null} successorCrossRefData The successor cross reference data for the street.
   * @param {object|null} descriptorData The descriptor data for the street.
   * @param {object|null} noteData The note data for the street.
   * @param {object|null} maintenanceResponsibilityData The maintenance responsibility data for the street (OneScotland only).
   * @param {object|null} reinstatementCategoryData The reinstatement category data for the street (OneScotland only).
   * @param {object|null} osSpecialDesignationData The special designation data for the street (OneScotland only).
   * @param {object|null} interestData The interest data for the street (GeoPlace only).
   * @param {object|null} constructionData The construction data for the street (GeoPlace only).
   * @param {object|null} specialDesignationData The special designation data for the street (GeoPlace only).
   * @param {object|null} prowData The public rights of way data for the street (GeoPlace only).
   * @param {object|null} hwwData The height, width and weight restriction data for the street (GeoPlace only).
   */
  const setAssociatedStreetData = (
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
    hwwData
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
      settingsContext.isScottish
    );
    updateStreetData(newStreetData);
  };

  /**
   * Sets the associated street data for the current street and then clears the data from the sandbox.
   *
   * @param {array|null} esuData The ESU data for the street.
   * @param {object|null} successorCrossRefData The successor cross reference data for the street.
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
      settingsContext.isScottish
    );
    updateStreetDataAndClear(newStreetData, clearType);
  };

  /**
   * Enables or disables the save button.
   *
   * @param {boolean} disabled If true the button is disabled; otherwise it is enabled.
   */
  const updateSaveButton = (disabled) => {
    setSaveDisabled(disabled);
    streetContext.onStreetModified(!disabled);
    if (!disabled) mapContext.onSetCoordinate(null);
  };

  /**
   * Update the internal streetData variable with the new data.
   *
   * @param {object|null} newStreetData The new street data to update the streetData variable with.
   */
  const updateStreetData = (newStreetData) => {
    setStreetData(newStreetData);
    sandboxContext.onSandboxChange("currentStreet", newStreetData);
    updateSaveButton(false);
  };

  /**
   * Update the internal streetData variable with the new data and clear the sandbox.
   *
   * @param {object|null} newStreetData The new street data to update the streetData variable with.
   * @param {string} clearType The type of data that we are clearing from the sandbox.
   */
  const updateStreetDataAndClear = (newStreetData, clearType) => {
    setStreetData(newStreetData);
    sandboxContext.onUpdateAndClear("currentStreet", newStreetData, clearType);
    updateSaveButton(false);
  };

  /**
   * Method to get the length of the current street.
   *
   * @returns {number} The total length of the current street.
   */
  const getCurrentStreetLength = () => {
    if (streetData && streetData.esus && streetData.esus.length > 0) {
      let totalLength = 0;

      streetData.esus.forEach((esu) => {
        const esuLine = new Polyline({
          type: "polyline",
          paths: esu.wktGeometry && esu.wktGeometry !== "" ? GetWktCoordinates(esu.wktGeometry) : undefined,
          spatialReference: { wkid: 27700 },
        });

        const esuLength = geometryEngine.planarLength(esuLine, "meters");

        if (esuLength) totalLength = totalLength + esuLength;
      });

      if (totalLength > 0) totalLength = Math.round(totalLength);

      return totalLength;
    } else return 0;
  };

  /**
   * Event to handle when a user changes tabs on the form
   *
   * @param {object} event This is not used.
   * @param {number} newValue The index of the tab the user wants to switch to.
   */
  const handleTabChange = (event, newValue) => {
    const setAsdFormData = () => {
      if (maintenanceResponsibilityFormData) {
        setMaintenanceResponsibilityFormData({
          pkId: maintenanceResponsibilityFormData.pkId,
          maintenanceResponsibilityData: sandboxContext.currentSandbox.currentStreetRecords.maintenanceResponsibility
            ? sandboxContext.currentSandbox.currentStreetRecords.maintenanceResponsibility
            : maintenanceResponsibilityFormData.maintenanceResponsibilityData,
          index: maintenanceResponsibilityFormData.index,
          totalRecords: maintenanceResponsibilityFormData.totalRecords,
        });
      } else if (reinstatementCategoryFormData) {
        setReinstatementCategoryFormData({
          pkId: reinstatementCategoryFormData.pkId,
          reinstatementCategoryData: sandboxContext.currentSandbox.currentStreetRecords.reinstatementCategory
            ? sandboxContext.currentSandbox.currentStreetRecords.reinstatementCategory
            : reinstatementCategoryFormData.reinstatementCategoryData,
          index: reinstatementCategoryFormData.index,
          totalRecords: reinstatementCategoryFormData.totalRecords,
        });
      } else if (osSpecialDesignationFormData) {
        setOSSpecialDesignationFormData({
          pkId: osSpecialDesignationFormData.pkId,
          osSpecialDesignationData: sandboxContext.currentSandbox.currentStreetRecords.osSpecialDesignation
            ? sandboxContext.currentSandbox.currentStreetRecords.osSpecialDesignation
            : osSpecialDesignationFormData.osSpecialDesignationData,
          index: osSpecialDesignationFormData.index,
          totalRecords: osSpecialDesignationFormData.totalRecords,
        });
      } else if (interestFormData) {
        setInterestFormData({
          pkId: interestFormData.pkId,
          interestData: sandboxContext.currentSandbox.currentStreetRecords.interest
            ? sandboxContext.currentSandbox.currentStreetRecords.interest
            : interestFormData.interestData,
          index: interestFormData.index,
          totalRecords: interestFormData.totalRecords,
        });
      } else if (constructionFormData) {
        setConstructionFormData({
          pkId: constructionFormData.pkId,
          constructionData: sandboxContext.currentSandbox.currentStreetRecords.construction
            ? sandboxContext.currentSandbox.currentStreetRecords.construction
            : constructionFormData.constructionData,
          index: constructionFormData.index,
          totalRecords: constructionFormData.totalRecords,
        });
      } else if (specialDesignationFormData) {
        setSpecialDesignationFormData({
          pkId: specialDesignationFormData.pkId,
          specialDesignationData: sandboxContext.currentSandbox.currentStreetRecords.specialDesignation
            ? sandboxContext.currentSandbox.currentStreetRecords.specialDesignation
            : specialDesignationFormData.specialDesignationData,
          index: specialDesignationFormData.index,
          totalRecords: specialDesignationFormData.totalRecords,
        });
      } else if (hwwFormData) {
        setHwwFormData({
          pkId: hwwFormData.pkId,
          hwwData: sandboxContext.currentSandbox.currentStreetRecords.hww
            ? sandboxContext.currentSandbox.currentStreetRecords.hww
            : hwwFormData.hwwData,
          index: hwwFormData.index,
          totalRecords: hwwFormData.totalRecords,
        });
      } else if (prowFormData) {
        setProwFormData({
          pkId: prowFormData.pkId,
          prowData: sandboxContext.currentSandbox.currentStreetRecords.prow
            ? sandboxContext.currentSandbox.currentStreetRecords.prow
            : prowFormData.prowData,
          index: prowFormData.index,
          totalRecords: prowFormData.totalRecords,
        });
      }
    };

    const setNotesForm = () => {
      if (notesFormData) {
        setNotesFormData({
          pkId: notesFormData.pkId,
          noteData: sandboxContext.currentSandbox.currentStreetRecords.note
            ? sandboxContext.currentSandbox.currentStreetRecords.note
            : notesFormData.noteData,
          index: notesFormData.index,
          totalRecords: notesFormData.totalRecords,
          variant: "street",
        });
      }
    };

    switch (value) {
      case 0: // Details
        if (descriptorFormData) {
          setDescriptorFormData({
            pkId: descriptorFormData.pkId,
            sdData: sandboxContext.currentSandbox.currentStreetRecords.descriptor
              ? sandboxContext.currentSandbox.currentStreetRecords.descriptor
              : descriptorFormData.descriptorData,
            streetType: streetData.recordType,
            index: descriptorFormData.index,
            totalRecords: descriptorFormData.totalRecords,
          });
        }
        break;

      case 1: // ESU
        if (esuFormData) {
          setEsuFormData({
            pkId: esuFormData.pkId,
            esuData: sandboxContext.currentSandbox.currentStreetRecords.esu
              ? sandboxContext.currentSandbox.currentStreetRecords.esu
              : esuFormData.esuData,
            index: esuFormData.index,
            totalRecords: esuFormData.totalRecords,
          });
        } else if (oweFormData) {
          setOweFormData({
            pkId: oweFormData.pkId,
            oweData: sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption
              ? sandboxContext.currentSandbox.currentStreetRecords.oneWayExemption
              : oweFormData.oweData,
            index: oweFormData.index,
            esuIndex: oweFormData.esuIndex,
            totalRecords: oweFormData.totalRecords,
          });
        } else if (hdFormData) {
          setHdFormData({
            pkId: hdFormData.pkId,
            hdData: sandboxContext.currentSandbox.currentStreetRecords.highwayDedication
              ? sandboxContext.currentSandbox.currentStreetRecords.highwayDedication
              : hdFormData.hdData,
            index: hdFormData.index,
            esuIndex: hdFormData.esuIndex,
            totalRecords: hdFormData.totalRecords,
          });
        }
        if (informationContext.informationType) {
          informationContext.onClearInformation();
        }
        break;

      case 2: // Successors / ASD
        if (settingsContext.isScottish) {
          if (successorCrossRefFormData) {
            setSuccessorCrossRefFormData({
              id: successorCrossRefFormData.id,
              successorCrossRefData: sandboxContext.currentSandbox.currentStreetRecords.successorCrossRef
                ? {
                    id: sandboxContext.currentSandbox.currentStreetRecords.successorCrossRef.pkId,
                    changeType: sandboxContext.currentSandbox.currentStreetRecords.successorCrossRef.changeType,
                    succKey: sandboxContext.currentSandbox.currentStreetRecords.successorCrossRef.succKey,
                    successor: sandboxContext.currentSandbox.currentStreetRecords.successorCrossRef.successor,
                    successorType: sandboxContext.currentSandbox.currentStreetRecords.successorCrossRef.successorType,
                    predecessor: sandboxContext.currentSandbox.currentStreetRecords.successorCrossRef.predecessor,
                    startDate: sandboxContext.currentSandbox.currentStreetRecords.successorCrossRef.startDate,
                    endDate: sandboxContext.currentSandbox.currentStreetRecords.successorCrossRef.endDate,
                    entryDate: sandboxContext.currentSandbox.currentStreetRecords.successorCrossRef.entryDate,
                    lastUpdateDate: sandboxContext.currentSandbox.currentStreetRecords.successorCrossRef.lastUpdateDate,
                    neverExport: sandboxContext.currentSandbox.currentStreetRecords.successorCrossRef.neverExport,
                  }
                : successorCrossRefFormData.successorCrossRefData,
              index: successorCrossRefFormData.index,
              totalRecords: successorCrossRefFormData.totalRecords,
            });
          }
        } else setAsdFormData();
        break;

      case 3: // ASD / Note
        if (settingsContext.isScottish) {
          setAsdFormData();
        } else setNotesForm();
        break;

      case 4: // Note
        if (!settingsContext.isScottish) setNotesForm();
        break;

      case 5: // Note
        if (settingsContext.isScottish) setNotesForm();
        break;

      default:
        break;
    }

    const streetChanged = hasStreetChanged(streetContext.currentStreet.newStreet, sandboxContext.currentSandbox);

    if (!streetChanged || streetContext.validateData()) {
      failedValidation.current = false;
      setValue(newValue);
      mapContext.onEditMapObject(null, null);
      informationContext.onClearInformation();

      switch (newValue) {
        case 0:
          if (descriptorFormData)
            streetContext.onRecordChange(15, descriptorFormData.pkId, descriptorFormData.index, null);
          else streetContext.onRecordChange(11, null, null, null);
          break;

        case 1:
          if (oweFormData) streetContext.onRecordChange(16, oweFormData.pkId, oweFormData.index, oweFormData.esuIndex);
          else if (hdFormData) streetContext.onRecordChange(17, hdFormData.pkId, hdFormData.index, hdFormData.esuIndex);
          else if (esuFormData) {
            streetContext.onRecordChange(13, esuFormData.pkId, esuFormData.index, null);
            mapContext.onEditMapObject(13, esuFormData.esuData.esuId);
          }
          break;

        case 2:
          if (settingsContext.isScottish) {
            if (successorCrossRefFormData)
              streetContext.onRecordChange(30, successorCrossRefFormData.pkId, successorCrossRefFormData.index, null);
          } else {
            if (maintenanceResponsibilityFormData) {
              streetContext.onRecordChange(
                51,
                maintenanceResponsibilityFormData.pkId,
                maintenanceResponsibilityFormData.index,
                null
              );
              if (!maintenanceResponsibilityFormData.maintenanceResponsibilityData.wholeRoad)
                mapContext.onEditMapObject(51, maintenanceResponsibilityFormData.maintenanceResponsibilityData.pkId);
            } else if (reinstatementCategoryFormData) {
              streetContext.onRecordChange(
                52,
                reinstatementCategoryFormData.pkId,
                reinstatementCategoryFormData.index,
                null
              );
              if (!reinstatementCategoryFormData.reinstatementCategoryData.wholeRoad)
                mapContext.onEditMapObject(52, reinstatementCategoryFormData.reinstatementCategoryData.pkId);
            } else if (osSpecialDesignationFormData) {
              streetContext.onRecordChange(
                53,
                osSpecialDesignationFormData.pkId,
                osSpecialDesignationFormData.index,
                null
              );
              if (!osSpecialDesignationFormData.osSpecialDesignationData.wholeRoad)
                mapContext.onEditMapObject(53, osSpecialDesignationFormData.osSpecialDesignationData.pkId);
            } else if (interestFormData) {
              streetContext.onRecordChange(61, interestFormData.pkId, interestFormData.index, null);
              if (!interestFormData.interestData.wholeRoad)
                mapContext.onEditMapObject(61, interestFormData.interestData.pkId);
            } else if (constructionFormData) {
              streetContext.onRecordChange(62, constructionFormData.pkId, constructionFormData.index, null);
              if (!constructionFormData.constructionData.wholeRoad)
                mapContext.onEditMapObject(62, constructionFormData.constructionData.pkId);
            } else if (specialDesignationFormData) {
              streetContext.onRecordChange(63, specialDesignationFormData.pkId, specialDesignationFormData.index, null);
              if (!specialDesignationFormData.specialDesignationData.wholeRoad)
                mapContext.onEditMapObject(63, specialDesignationFormData.specialDesignationData.pkId);
            } else if (hwwFormData) {
              streetContext.onRecordChange(64, hwwFormData.pkId, hwwFormData.index, null);
              if (!hwwFormData.hwwData.wholeRoad) mapContext.onEditMapObject(64, hwwFormData.hwwData.pkId);
            } else if (prowFormData) streetContext.onRecordChange(66, prowFormData.pkId, prowFormData.index, null);
          }
          break;

        case 3:
          if (settingsContext.isScottish) {
            if (maintenanceResponsibilityFormData) {
              streetContext.onRecordChange(
                51,
                maintenanceResponsibilityFormData.pkId,
                maintenanceResponsibilityFormData.index,
                null
              );
              if (!maintenanceResponsibilityFormData.maintenanceResponsibilityData.wholeRoad)
                mapContext.onEditMapObject(51, maintenanceResponsibilityFormData.maintenanceResponsibilityData.pkId);
            } else if (reinstatementCategoryFormData) {
              streetContext.onRecordChange(
                52,
                reinstatementCategoryFormData.pkId,
                reinstatementCategoryFormData.index,
                null
              );
              if (!reinstatementCategoryFormData.reinstatementCategoryData.wholeRoad)
                mapContext.onEditMapObject(52, reinstatementCategoryFormData.reinstatementCategoryData.pkId);
            } else if (osSpecialDesignationFormData) {
              streetContext.onRecordChange(
                53,
                osSpecialDesignationFormData.pkId,
                osSpecialDesignationFormData.index,
                null
              );
              if (!osSpecialDesignationFormData.osSpecialDesignationData.wholeRoad)
                mapContext.onEditMapObject(53, osSpecialDesignationFormData.osSpecialDesignationData.pkId);
            } else if (interestFormData) {
              streetContext.onRecordChange(61, interestFormData.pkId, interestFormData.index, null);
              if (!interestFormData.interestData.wholeRoad)
                mapContext.onEditMapObject(61, interestFormData.interestData.pkId);
            } else if (constructionFormData) {
              streetContext.onRecordChange(62, constructionFormData.pkId, constructionFormData.index, null);
              if (!constructionFormData.constructionData.wholeRoad)
                mapContext.onEditMapObject(62, constructionFormData.constructionData.pkId);
            } else if (specialDesignationFormData) {
              streetContext.onRecordChange(63, specialDesignationFormData.pkId, specialDesignationFormData.index, null);
              if (!specialDesignationFormData.specialDesignationData.wholeRoad)
                mapContext.onEditMapObject(63, specialDesignationFormData.specialDesignationData.pkId);
            } else if (hwwFormData) {
              streetContext.onRecordChange(64, hwwFormData.pkId, hwwFormData.index, null);
              if (!hwwFormData.hwwData.wholeRoad) mapContext.onEditMapObject(64, hwwFormData.hwwData.pkId);
            } else if (prowFormData) streetContext.onRecordChange(66, prowFormData.pkId, prowFormData.index, null);
          } else {
            if (notesFormData) streetContext.onRecordChange(72, notesFormData.pkId, notesFormData.index, null);
          }
          break;

        case 4:
        case 5:
          if (notesFormData) streetContext.onRecordChange(72, notesFormData.pkId, notesFormData.index, null);
          break;

        default:
          break;
      }
    } else if (streetChanged) {
      setSaveOpen(true);
      failedValidation.current = true;
      saveResult.current = false;
    }
  };

  /**
   * Event to handle when a descriptor record is selected from the street details tab.
   *
   * @param {number} pkId The primary key for the selected record. If -1 the data is cleared. 0 indicates a new street descriptor is required. Any number > 0 is existing data.
   * @param {object|null} sdData The street descriptor data for the selected record
   * @param {number|null} dataIdx The index of the record within the array of street descriptor records.
   * @param {number|null} dataLength The total number of records in the array of street descriptor records.
   */
  const handleDescriptorSelected = (pkId, sdData, dataIdx, dataLength) => {
    mapContext.onEditMapObject(null, null);

    if (pkId === -1) {
      setDescriptorFormData(null);
      streetContext.onRecordChange(11, null, null, null);
    } else if (pkId === 0) {
      const newIdx = streetData && streetData.streetDescriptors ? streetData.streetDescriptors.length + 1 : 1;
      const minPkId =
        streetData.descriptor && streetData.descriptor.length > 0
          ? streetData.descriptor.reduce((prev, curr) => (prev.pkId < curr.pkId ? prev : curr))
          : null;
      const maxDualLanguageLink =
        streetData.descriptor && streetData.descriptor.length > 0
          ? streetData.descriptor.reduce((prev, curr) =>
              (prev.dualLanguageLink ? prev.dualLanguageLink : 0) > (curr.dualLanguageLink ? curr.dualLanguageLink : 0)
                ? prev
                : curr
            )
          : null;
      const newPkId = !minPkId || !minPkId.pkId || minPkId.pkId > -10 ? -10 : minPkId.pkId - 1;
      const newEngRec = settingsContext.isScottish
        ? {
            pkId: newPkId,
            changeType: "I",
            usrn: streetData && streetData.usrn,
            streetDescriptor: "",
            locRef:
              settingsContext.streetTemplate &&
              settingsContext.streetTemplate.streetTemplate &&
              settingsContext.streetTemplate.streetTemplate.localityRef
                ? settingsContext.streetTemplate.streetTemplate.localityRef
                : 0,
            locality: "",
            townRef:
              settingsContext.streetTemplate &&
              settingsContext.streetTemplate.streetTemplate &&
              settingsContext.streetTemplate.streetTemplate.townRef
                ? settingsContext.streetTemplate.streetTemplate.townRef
                : 0,
            town: "",
            adminAreaRef:
              settingsContext.streetTemplate &&
              settingsContext.streetTemplate.streetTemplate &&
              settingsContext.streetTemplate.streetTemplate.adminAreaRef
                ? settingsContext.streetTemplate.streetTemplate.adminAreaRef
                : 0,
            administrativeArea: "",
            islandRef:
              settingsContext.streetTemplate &&
              settingsContext.streetTemplate.streetTemplate &&
              settingsContext.streetTemplate.streetTemplate.islandRef
                ? settingsContext.streetTemplate.streetTemplate.islandRef
                : 0,
            island: "",
            language: "ENG",
            neverExport: false,
            dualLanguageLink: settingsContext.isWelsh
              ? maxDualLanguageLink && maxDualLanguageLink.dualLanguageLink
                ? maxDualLanguageLink.dualLanguageLink + 1
                : 0
              : 0,
          }
        : {
            pkId: newPkId,
            changeType: "I",
            usrn: streetData && streetData.usrn,
            streetDescriptor: "",
            locRef:
              settingsContext.streetTemplate &&
              settingsContext.streetTemplate.streetTemplate &&
              settingsContext.streetTemplate.streetTemplate.localityRef
                ? settingsContext.streetTemplate.streetTemplate.localityRef
                : 0,
            locality: "",
            townRef:
              settingsContext.streetTemplate &&
              settingsContext.streetTemplate.streetTemplate &&
              settingsContext.streetTemplate.streetTemplate.townRef
                ? settingsContext.streetTemplate.streetTemplate.townRef
                : 0,
            town: "",
            adminAreaRef:
              settingsContext.streetTemplate &&
              settingsContext.streetTemplate.streetTemplate &&
              settingsContext.streetTemplate.streetTemplate.adminAreaRef
                ? settingsContext.streetTemplate.streetTemplate.adminAreaRef
                : 0,
            administrativeArea: "",
            language: "ENG",
            neverExport: false,
            dualLanguageLink: settingsContext.isWelsh
              ? maxDualLanguageLink && maxDualLanguageLink.dualLanguageLink
                ? maxDualLanguageLink.dualLanguageLink + 1
                : 0
              : 0,
          };

      let newSDs = streetData.descriptor ? streetData.descriptor : [];

      if (settingsContext.isWelsh) {
        const defaultEngLocalityRef =
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.streetTemplate &&
          settingsContext.streetTemplate.streetTemplate.localityRef
            ? settingsContext.streetTemplate.streetTemplate.localityRef
            : 0;
        const defaultEngTownRef =
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.streetTemplate &&
          settingsContext.streetTemplate.streetTemplate.townRef
            ? settingsContext.streetTemplate.streetTemplate.townRef
            : 0;
        const defaultEngAdminAreaRef =
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.streetTemplate &&
          settingsContext.streetTemplate.streetTemplate.adminAreaRef
            ? settingsContext.streetTemplate.streetTemplate.adminAreaRef
            : 0;

        const defaultCymLocality = lookupContext.currentLookups.localities.find(
          (x) => x.language === "CYM" && x.linkedRef === defaultEngLocalityRef
        );
        const defaultCymTown = lookupContext.currentLookups.towns.find(
          (x) => x.language === "CYM" && x.linkedRef === defaultEngTownRef
        );
        const defaultCymAdminArea = lookupContext.currentLookups.adminAuthorities.find(
          (x) => x.language === "CYM" && x.linkedRef === defaultEngAdminAreaRef
        );

        const newCymRec = {
          pkId: newPkId - 1,
          changeType: "I",
          usrn: streetData && streetData.usrn,
          streetDescriptor: "",
          locRef: defaultCymLocality ? defaultCymLocality.localityRef : 0,
          locality: "",
          townRef: defaultCymTown ? defaultCymTown.townRef : 0,
          town: "",
          adminAreaRef: defaultCymAdminArea ? defaultCymAdminArea.administrativeAreaRef : 0,
          administrativeArea: "",
          language: "CYM",
          neverExport: false,
          dualLanguageLink: maxDualLanguageLink ? maxDualLanguageLink.dualLanguageLink + 1 : 0,
        };

        newSDs.push(newEngRec, newCymRec);
      } else newSDs.push(newEngRec);

      setAssociatedStreetData(
        streetData.esus,
        streetData.successorCrossRefs,
        newSDs,
        streetData.streetNotes,
        streetData.maintenanceResponsibilities,
        streetData.reinstatementCategories,
        settingsContext.isScottish ? streetData.specialDesignations : null,
        streetData.interests,
        streetData.constructions,
        !settingsContext.isScottish ? streetData.specialDesignations : null,
        streetData.publicRightOfWays,
        streetData.heightWidthWeights
      );

      setDescriptorFormData({
        pkId: 0,
        sdData: newEngRec,
        streetType: streetData.recordType,
        index: newIdx,
        totalRecords: streetData.descriptor
          ? streetData.descriptor.filter((x) => x.changeType !== "D").length
          : settingsContext.isWelsh
          ? 2
          : 1,
      });

      sandboxContext.onSandboxChange("streetDescriptor", newEngRec);
      streetContext.onRecordChange(15, newPkId, newIdx, null, true);
    } else {
      const streetChanged = hasStreetChanged(streetContext.currentStreet.newStreet, sandboxContext.currentSandbox);

      if (!streetChanged || streetContext.validateData()) {
        failedValidation.current = false;
        setDescriptorFormData({
          pkId: pkId,
          sdData: sdData,
          streetType: streetData.recordType,
          index: dataIdx,
          totalRecords: dataLength,
        });

        sandboxContext.onSandboxChange("streetDescriptor", sdData);
        streetContext.onRecordChange(15, pkId, dataIdx, null);
      } else if (streetChanged) {
        failedValidation.current = true;
        saveResult.current = false;
        setSaveOpen(true);
      }
    }
  };

  /**
   * Resets the ESU data and if GeoPlace the associated records data.
   *
   */
  const resetEsuData = () => {
    if (!settingsContext.isScottish) {
      if (hdFormData) setHdFormData(null);
      if (oweFormData) setOweFormData(null);
    }

    setEsuFormData(currentEsuFormData.current);
    currentEsuFormData.current = null;
  };

  /**
   * Resets the ESU data and if GeoPlace the associated records data and sets the associated street data.
   *
   */
  const resetStreetEsuData = () => {
    if (hdFormData) setHdFormData(null);
    if (oweFormData) setOweFormData(null);

    setAssociatedStreetData(
      currentStreetEsuData.current,
      streetData.successorCrossRefs,
      streetData.streetDescriptors,
      streetData.streetNotes,
      streetData.maintenanceResponsibilities,
      streetData.reinstatementCategories,
      settingsContext.isScottish ? streetData.specialDesignations : null,
      streetData.interests,
      streetData.constructions,
      !settingsContext.isScottish ? streetData.specialDesignations : null,
      streetData.publicRightOfWays,
      streetData.heightWidthWeights
    );

    if (esuFormData)
      setEsuFormData({
        pkId: esuFormData.pkId,
        esuData: currentStreetEsuData.current.find((x) => x.pkId === esuFormData.pkId),
        index: esuFormData.index,
        totalRecords: esuFormData.totalRecords,
      });

    currentStreetEsuData.current = null;
  };

  /**
   * Rests the ASD data and sets the associated street data.
   *
   */
  const resetStreetAsdData = () => {
    clearAsdFormData();

    setAssociatedStreetData(
      streetData.esus,
      streetData.successorCrossRefs,
      streetData.streetDescriptors,
      streetData.streetNotes,
      currentStreetAsdData.current.maintenanceResponsibilities,
      currentStreetAsdData.current.reinstatementCategories,
      currentStreetAsdData.current.osSpecialDesignations,
      currentStreetAsdData.current.interests,
      currentStreetAsdData.current.constructions,
      currentStreetAsdData.current.specialDesignations,
      currentStreetAsdData.current.publicRightOfWays,
      currentStreetAsdData.current.heightWidthWeights
    );

    currentStreetAsdData.current = null;
  };

  /**
   * Event to handle when an ESU record is selected from the list of ESUs.
   *
   * @param {number} pkId The primary key for the ESU record. If -1 the data is cleared. 0 indicates a new ESU is required. Any number > 0 is existing data.
   * @param {object|null} esuData The ESU data for the selected record
   * @param {number|null} dataIdx The index of the record within the array of ESU records.
   */
  const handleEsuSelected = (pkId, esuData, dataIdx) => {
    setHdFormData(null);
    setOweFormData(null);

    if (pkId === -1) {
      setEsuFormData(null);
      streetContext.onRecordChange(11, null, null, null);
      mapContext.onEditMapObject(null, null);
    } else if (pkId === 0) {
      const newIdx =
        streetData && streetData.esus
          ? streetData.esus.filter((x) => x.changeType !== "D" && x.assignUnassign !== -1).length
          : 0;
      const currentDate = GetCurrentDate(false);
      const minPkId =
        streetData.esus && streetData.esus.length > 0
          ? streetData.esus.reduce((prev, curr) => (prev.pkId < curr.pkId ? prev : curr))
          : null;
      const newPkId = !minPkId || !minPkId.pkId || minPkId.pkId > -10 ? -10 : minPkId.pkId - 1;
      const newRec = settingsContext.isScottish
        ? {
            esuId: newPkId,
            changeType: "I",
            state:
              settingsContext.streetTemplate &&
              settingsContext.streetTemplate.scoEsuTemplate &&
              settingsContext.streetTemplate.scoEsuTemplate.state
                ? settingsContext.streetTemplate.scoEsuTemplate.state
                : null,
            stateDate:
              settingsContext.streetTemplate &&
              settingsContext.streetTemplate.scoEsuTemplate &&
              settingsContext.streetTemplate.scoEsuTemplate.state
                ? currentDate
                : null,
            classification:
              settingsContext.streetTemplate &&
              settingsContext.streetTemplate.scoEsuTemplate &&
              settingsContext.streetTemplate.scoEsuTemplate.classification
                ? settingsContext.streetTemplate.scoEsuTemplate.classification
                : null,
            classificationDate:
              settingsContext.streetTemplate &&
              settingsContext.streetTemplate.scoEsuTemplate &&
              settingsContext.streetTemplate.scoEsuTemplate.classification
                ? currentDate
                : null,
            startDate: currentDate,
            endDate: null,
            wktGeometry: null,
            assignUnassign: 0,
            pkId: newPkId,
          }
        : {
            entryDate: currentDate,
            pkId: newPkId,
            esuId: newPkId,
            changeType: "I",
            esuVersionNumber: 1,
            numCoordCount: 0,
            esuTolerance: 10,
            esuStartDate: currentDate,
            esuEndDate: null,
            esuDirection:
              settingsContext.streetTemplate &&
              settingsContext.streetTemplate.esuTemplate &&
              settingsContext.streetTemplate.esuTemplate.esuDirection
                ? settingsContext.streetTemplate.esuTemplate.esuDirection
                : 1,
            wktGeometry: null,
            assignUnassign: 0,
            highwayDedications:
              settingsContext.streetTemplate &&
              settingsContext.streetTemplate.esuTemplate &&
              settingsContext.streetTemplate.esuTemplate.highwayDedicationCode
                ? [
                    {
                      pkId: -10,
                      changeType: "I",
                      esuId: newPkId,
                      seqNum: 1,
                      highwayDedicationCode:
                        settingsContext.streetTemplate && settingsContext.streetTemplate.esuTemplate
                          ? settingsContext.streetTemplate.esuTemplate.highwayDedicationCode
                          : null,
                      recordEndDate: null,
                      hdStartDate: currentDate,
                      hdEndDate: null,
                      hdSeasonalStartDate: null,
                      hdSeasonalEndDate: null,
                      hdStartTime: null,
                      hdEndTime: null,
                      hdProw:
                        settingsContext.streetTemplate && settingsContext.streetTemplate.esuTemplate
                          ? settingsContext.streetTemplate.esuTemplate.hdPRoW
                          : false,
                      hdNcr:
                        settingsContext.streetTemplate && settingsContext.streetTemplate.esuTemplate
                          ? settingsContext.streetTemplate.esuTemplate.hdNcr
                          : false,
                      hdQuietRoute:
                        settingsContext.streetTemplate && settingsContext.streetTemplate.esuTemplate
                          ? settingsContext.streetTemplate.esuTemplate.hdQuietRoute
                          : false,
                      hdObstruction:
                        settingsContext.streetTemplate && settingsContext.streetTemplate.esuTemplate
                          ? settingsContext.streetTemplate.esuTemplate.hdObstruction
                          : false,
                      hdPlanningOrder:
                        settingsContext.streetTemplate && settingsContext.streetTemplate.esuTemplate
                          ? settingsContext.streetTemplate.esuTemplate.hdPlanningOrder
                          : false,
                      hdVehiclesProhibited:
                        settingsContext.streetTemplate && settingsContext.streetTemplate.esuTemplate
                          ? settingsContext.streetTemplate.esuTemplate.hdVehiclesProhibited
                          : false,
                    },
                  ]
                : [],
            oneWayExemptions: [],
          };

      const newEsus = streetData.esus ? streetData.esus : [];
      newEsus.push(newRec);

      setAssociatedStreetData(
        newEsus,
        streetData.successorCrossRefs,
        streetData.streetDescriptors,
        streetData.streetNotes,
        streetData.maintenanceResponsibilities,
        streetData.reinstatementCategories,
        settingsContext.isScottish ? streetData.specialDesignations : null,
        streetData.interests,
        streetData.constructions,
        !settingsContext.isScottish ? streetData.specialDesignations : null,
        streetData.publicRightOfWays,
        streetData.heightWidthWeights
      );

      setEsuFormData({
        pkId: 0,
        esuData: newRec,
        index: newIdx,
        totalRecords: streetData.esus ? streetData.esus.filter((x) => x.changeType !== "D").length : 1,
      });

      sandboxContext.onSandboxChange("esu", newRec);
      streetContext.onRecordChange(13, newPkId, newIdx, null, true);
      mapContext.onEditMapObject(13, newPkId);
    } else {
      setEsuFormData({
        pkId: pkId,
        esuData: esuData,
        index: dataIdx,
        totalRecords: streetData.esus.filter((x) => x.changeType !== "D" && x.assignUnassign !== -1).length,
      });

      sandboxContext.onSandboxChange("esu", esuData);
      streetContext.onRecordChange(13, pkId, dataIdx, null);
      mapContext.onEditMapObject(13, esuData.esuId);
    }
  };

  /**
   * Event to handle when a user clicks on a highway dedication record from the ESU tab.
   *
   * @param {object} hdData The highway dedication data.
   * @param {number} index The index of the highway dedication within the array of highway dedication records for the ESU.
   * @param {number} esuIndex The index for the ESU record within the array of ESU records for the street.
   */
  const handleHighwayDedicationClicked = (hdData, index, esuIndex) => {
    if (hdData.pkId !== -1) {
      currentEsuFormData.current = esuFormData;
      setEsuFormData(null);
    }
    if (oweFormData) setOweFormData(null);
    handleHighwayDedicationSelected(hdData.esuId, hdData.pkId, hdData, index, esuIndex);
  };

  /**
   * Event to handle when a user selects a highway dedication record.
   *
   * @param {number} esuId The id for the ESU record associated with this highway dedication record.
   * @param {number} pkId The primary key for the highway dedication record. If -1 the data is cleared. 0 indicates a new highway dedication is required. Any number > 0 is existing data.
   * @param {object|null} hdData The highway dedication data.
   * @param {number|null} index The index of the highway dedication within the array of highway dedication records for the ESU.
   * @param {number|null} esuIndex The index for the ESU record within the array of ESU records for the street.
   */
  const handleHighwayDedicationSelected = (esuId, pkId, hdData, index, esuIndex) => {
    const esuData = streetData.esus.find((x) => x.esuId === esuId);
    const currentHighwayDedicationCount =
      esuData && esuData.highwayDedications ? esuData.highwayDedications.filter((x) => x.changeType !== "D").length : 0;

    mapContext.onEditMapObject(null, null);

    if (pkId !== -1 && !currentEsuFormData.current) {
      if (esuFormData) {
        currentEsuFormData.current = esuFormData;
      } else {
        currentEsuFormData.current = {
          pkId: esuData.pkId,
          esuData: esuData,
          index: esuIndex,
          totalRecords: streetData.esus.filter((x) => x.changeType !== "D" && x.assignUnassign !== -1).length,
        };
      }
    }

    if (pkId === -1) {
      setHdFormData(null);
      if (currentEsuFormData.current) resetEsuData();
      streetContext.onRecordChange(11, null, null, null);
    } else if (pkId === 0) {
      currentStreetEsuData.current = JSON.parse(JSON.stringify(streetData.esus));

      const currentDate = GetCurrentDate(false);
      const newIdx =
        esuData && esuData.highwayDedications
          ? esuData.highwayDedications.filter((x) => x.changeType !== "D").length
          : 0;
      const minPkId =
        esuData && esuData.highwayDedications.length > 0
          ? esuData.highwayDedications.reduce((prev, curr) => (prev.pkId < curr.pkId ? prev : curr))
          : null;

      const newPkId = !minPkId || !minPkId.pkId || minPkId.pkId > -10 ? -10 : minPkId.pkId - 1;
      const maxSeqNum =
        esuData && esuData.highwayDedications.length > 0
          ? esuData.highwayDedications.reduce((prev, curr) => (prev.seqNum > curr.seqNum ? prev : curr))
          : null;
      const newSeqNum = maxSeqNum && maxSeqNum.seqNum ? maxSeqNum.seqNum + 1 : 1;
      const newRec = {
        pkId: newPkId,
        changeType: "I",
        esuId: esuId,
        seqNum: newSeqNum,
        highwayDedicationCode:
          settingsContext.streetTemplate && settingsContext.streetTemplate.esuTemplate
            ? settingsContext.streetTemplate.esuTemplate.highwayDedicationCode
            : null,
        recordEndDate: null,
        hdStartDate: currentDate,
        hdEndDate: null,
        hdSeasonalStartDate: null,
        hdSeasonalEndDate: null,
        hdStartTime: null,
        hdEndTime: null,
        hdProw:
          settingsContext.streetTemplate && settingsContext.streetTemplate.esuTemplate
            ? settingsContext.streetTemplate.esuTemplate.hdPRoW
            : false,
        hdNcr:
          settingsContext.streetTemplate && settingsContext.streetTemplate.esuTemplate
            ? settingsContext.streetTemplate.esuTemplate.hdNcr
            : false,
        hdQuietRoute:
          settingsContext.streetTemplate && settingsContext.streetTemplate.esuTemplate
            ? settingsContext.streetTemplate.esuTemplate.hdQuietRoute
            : false,
        hdObstruction:
          settingsContext.streetTemplate && settingsContext.streetTemplate.esuTemplate
            ? settingsContext.streetTemplate.esuTemplate.hdObstruction
            : false,
        hdPlanningOrder:
          settingsContext.streetTemplate && settingsContext.streetTemplate.esuTemplate
            ? settingsContext.streetTemplate.esuTemplate.hdPlanningOrder
            : false,
        hdVehiclesProhibited:
          settingsContext.streetTemplate && settingsContext.streetTemplate.esuTemplate
            ? settingsContext.streetTemplate.esuTemplate.hdVehiclesProhibited
            : false,
      };

      const newHds = esuData.highwayDedications ? esuData.highwayDedications : [];
      newHds.push(newRec);

      const updatedEsu = [
        {
          entryDate: esuData.entryDate,
          pkId: esuData.pkId,
          changeType: esuData.changeType,
          esuId: esuData.esuId,
          esuVersionNumber: esuData.esuVersionNumber,
          numCoordCount: esuData.numCoordCount,
          esuTolerance: esuData.esuTolerance,
          esuStartDate: esuData.esuStartDate,
          esuEndDate: esuData.esuEndDate,
          esuDirection: esuData.esuDirection,
          wktGeometry: esuData.wktGeometry,
          assignUnassign: esuData.assignUnassign,
          highwayDedications: newHds,
          oneWayExemptions: esuData.oneWayExemptions,
        },
      ];

      const newEsus = streetData.esus.map((x) => updatedEsu.find((rec) => rec.esuId === x.esuId) || x);

      setAssociatedStreetData(
        newEsus,
        null,
        streetData.streetDescriptors,
        streetData.streetNotes,
        null,
        null,
        null,
        streetData.interests,
        streetData.constructions,
        streetData.specialDesignations,
        streetData.publicRightOfWays,
        streetData.heightWidthWeights
      );

      setHdFormData({
        pkId: 0,
        hdData: newRec,
        index: newIdx,
        esuIndex: esuIndex,
        totalRecords: currentHighwayDedicationCount + 1,
      });

      sandboxContext.onSandboxChange("highwayDedication", newRec);
      streetContext.onRecordChange(17, newPkId, newIdx, esuIndex, true);
    } else {
      setHdFormData({
        pkId: pkId,
        hdData: hdData,
        index: index,
        esuIndex: esuIndex,
        totalRecords: currentHighwayDedicationCount,
      });

      sandboxContext.onSandboxChange("highwayDedication", hdData);
      streetContext.onRecordChange(17, pkId, index, esuIndex);
    }
  };

  /**
   * Event to handle when a user clicks on an one-way exemption record from the ESU tab.
   *
   * @param {object} oweData The one-way exemption data.
   * @param {number} index The index of the one-way exemption within the array of one-way exemption records for the ESU.
   * @param {number} esuIndex The index for the ESU record within the array of ESU records for the street.
   */
  const handleOneWayExemptionClicked = (oweData, index, esuIndex) => {
    if (oweData.pkId !== -1) {
      currentEsuFormData.current = esuFormData;
      setEsuFormData(null);
    }
    if (hdFormData) setHdFormData(null);
    handleOneWayExemptionSelected(oweData.esuId, oweData.pkId, oweData, index, esuIndex);
  };

  /**
   * Event to handle when a user selects a one-way exemption record.
   *
   * @param {number} esuId The id for the ESU record associated with this one-way exemption record.
   * @param {number} pkId The primary key for the one-way exemption record. If -1 the data is cleared. 0 indicates a new one-way exemption is required. Any number > 0 is existing data.
   * @param {object|null} oweData The one-way exemption data.
   * @param {number|null} index The index of the one-way exemption within the array of one-way exemption records for the ESU.
   * @param {number|null} esuIndex The index for the ESU record within the array of ESU records for the street.
   */
  const handleOneWayExemptionSelected = (esuId, pkId, oweData, index, esuIndex) => {
    const esuData = streetData.esus.find((x) => x.esuId === esuId);
    const currentOneWayExemptionCount =
      esuData && esuData.oneWayExemptions ? esuData.oneWayExemptions.filter((x) => x.changeType !== "D").length : 0;

    mapContext.onEditMapObject(null, null);

    if (pkId !== -1) {
      if (esuFormData) {
        currentEsuFormData.current = esuFormData;
      } else {
        currentEsuFormData.current = {
          pkId: esuData.pkId,
          esuData: esuData,
          index: esuIndex,
          totalRecords: streetData.esus.filter((x) => x.changeType !== "D" && x.assignUnassign !== -1).length,
        };
      }
    }

    if (pkId === -1) {
      setOweFormData(null);
      if (currentEsuFormData.current) resetEsuData();
      streetContext.onRecordChange(11, null, null, null);
    } else if (pkId === 0) {
      if (!esuFormData) currentEsuFormData.current = esuFormData;
      currentStreetEsuData.current = JSON.parse(JSON.stringify(streetData.esus));

      const newIdx =
        esuData && esuData.oneWayExemptions ? esuData.oneWayExemptions.filter((x) => x.changeType !== "D").length : 0;
      const minPkId =
        esuData && esuData.oneWayExemptions.length
          ? esuData.oneWayExemptions.reduce((prev, curr) => (prev.pkId < curr.pkId ? prev : curr))
          : null;
      const newPkId = !minPkId || !minPkId.pkId || minPkId.pkId > -10 ? -10 : minPkId.pkId - 1;
      const maxSeqNum =
        esuData && esuData.oneWayExemptions.length
          ? esuData.oneWayExemptions.reduce((prev, curr) => (prev.seqNum > curr.seqNum ? prev : curr))
          : null;
      const newSeqNum = maxSeqNum && maxSeqNum.seqNum ? maxSeqNum.seqNum + 1 : 1;
      const newRec = {
        pkId: newPkId,
        changeType: "I",
        esuId: esuId,
        sequenceNumber: newSeqNum,
        oneWayExemptionTypeCode:
          settingsContext.streetTemplate && settingsContext.streetTemplate.esuTemplate
            ? settingsContext.streetTemplate.esuTemplate.oneWayExemptionType
            : null,
        recordEndDate: null,
        oneWayExemptionStartDate: null,
        oneWayExemptionEndDate: null,
        oneWayExemptionStartTime: null,
        oneWayExemptionEndTime: null,
        oneWayExemptionPeriodicityCode:
          settingsContext.streetTemplate && settingsContext.streetTemplate.esuTemplate
            ? settingsContext.streetTemplate.esuTemplate.oneWayExemptionPeriodicityCode
            : null,
      };

      const newOwes = esuData.oneWayExemptions ? esuData.oneWayExemptions : [];
      newOwes.push(newRec);

      const updatedEsu = [
        {
          entryDate: esuData.entryDate,
          pkId: esuData.pkId,
          changeType: esuData.changeType,
          esuId: esuData.esuId,
          esuVersionNumber: esuData.esuVersionNumber,
          numCoordCount: esuData.numCoordCount,
          esuTolerance: esuData.esuTolerance,
          esuStartDate: esuData.esuStartDate,
          esuEndDate: esuData.esuEndDate,
          esuDirection: esuData.esuDirection,
          wktGeometry: esuData.wktGeometry,
          assignUnassign: esuData.assignUnassign,
          highwayDedications: esuData.highwayDedications,
          oneWayExemptions: newOwes,
        },
      ];

      const newEsus = streetData.esus.map((x) => updatedEsu.find((rec) => rec.esuId === x.esuId) || x);

      setAssociatedStreetData(
        newEsus,
        null,
        streetData.streetDescriptors,
        streetData.streetNotes,
        null,
        null,
        null,
        streetData.interests,
        streetData.constructions,
        streetData.specialDesignations,
        streetData.publicRightOfWays,
        streetData.heightWidthWeights
      );

      setOweFormData({
        pkId: 0,
        oweData: newRec,
        index: newIdx,
        esuIndex: esuIndex,
        totalRecords: currentOneWayExemptionCount + 1,
      });

      sandboxContext.onSandboxChange("oneWayExemption", newRec);
      streetContext.onRecordChange(16, newPkId, newIdx, esuIndex, true);
    } else {
      setOweFormData({
        pkId: pkId,
        oweData: oweData,
        index: index,
        esuIndex: esuIndex,
        totalRecords: currentOneWayExemptionCount,
      });

      sandboxContext.onSandboxChange("oneWayExemption", oweData);
      streetContext.onRecordChange(16, pkId, index, esuIndex);
    }
  };

  /**
   * Event to handle when a successor cross reference record is selected from the list of successor cross reference records.
   *
   * @param {number} pkId The primary key for the selected record. If -1 the data is cleared. 0 indicates a new successor cross reference is required. Any number > 0 is existing data.
   * @param {object|null} successorCrossRefData The  cross reference data for the selected record
   * @param {number|null} dataIdx The index of the record within the array of successor cross reference records.
   * @param {number|null} dataLength The total number of records in the array of successor cross reference records.
   */
  const handleSuccessorCrossRefSelected = (pkId, successorCrossRefData, dataIdx, dataLength) => {
    if (pkId === -1) {
      setSuccessorCrossRefFormData(null);
      streetContext.onRecordChange(11, null, null);
      mapContext.onEditMapObject(null, null);
    } else if (pkId === 0) {
      const newIdx =
        streetData && streetData.successorCrossRefs
          ? streetData.successorCrossRefs.filter((x) => x.changeType !== "D").length
          : 0;
      const currentDate = GetCurrentDate(false);
      const minPkIdSuccessorCrossRef =
        streetData.successorCrossRefs && streetData.successorCrossRefs.length > 0
          ? streetData.successorCrossRefs.reduce((prev, curr) => (prev.pkId < curr.pkId ? prev : curr))
          : null;
      const newPkId =
        !minPkIdSuccessorCrossRef || !minPkIdSuccessorCrossRef.pkId || minPkIdSuccessorCrossRef.pkId > -10
          ? -10
          : minPkIdSuccessorCrossRef.pkId - 1;
      const newRec = {
        pkId: newPkId,
        changeType: "I",
        succKey: null,
        successor: streetData && streetData.usrn,
        successorType: 2,
        predecessor: null,
        startDate: currentDate,
        endDate: null,
        entryDate: currentDate,
        lastUpdateDate: currentDate,
      };

      const newSuccessorCrossRefs = streetData.successorCrossRefs ? streetData.successorCrossRefs : [];
      newSuccessorCrossRefs.push(newRec);

      setAssociatedStreetData(
        streetData.esus,
        newSuccessorCrossRefs,
        streetData.streetDescriptors,
        streetData.streetNotes,
        streetData.maintenanceResponsibilities,
        streetData.reinstatementCategories,
        streetData.specialDesignations,
        null,
        null,
        null,
        null,
        null
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
        totalRecords: streetData.successorCrossRefs
          ? streetData.successorCrossRefs.filter((x) => x.changeType !== "D").length
          : 1,
      });

      sandboxContext.onSandboxChange("successorCrossRef", newRec);
      streetContext.onRecordChange(30, newPkId, newIdx, null);
    } else {
      setSuccessorCrossRefFormData({
        id: pkId,
        successorCrossRefData: successorCrossRefData,
        index: dataIdx,
        totalRecords: dataLength,
      });

      sandboxContext.onSandboxChange("successorCrossRef", successorCrossRefData);
      streetContext.onRecordChange(30, pkId, dataIdx);
      mapContext.onEditMapObject(30, pkId);
    }
  };

  /**
   * This will clear all the form data variables for the ASD tabs.
   *
   */
  const clearAsdFormData = () => {
    setMaintenanceResponsibilityFormData(null);
    setReinstatementCategoryFormData(null);
    setOSSpecialDesignationFormData(null);
    setInterestFormData(null);
    setConstructionFormData(null);
    setSpecialDesignationFormData(null);
    setHwwFormData(null);
    setProwFormData(null);
  };

  /**
   * Event to handle clicking the home button on an ASD tab.
   *
   */
  const handleAsdHomeClick = () => {
    clearAsdFormData();

    streetContext.onRecordChange(11, null, null, null);
    mapContext.onEditMapObject(null, null);
  };

  /**
   * Event to handle when a maintenance responsibility record is selected from the list of ASD records.
   *
   * @param {number} pkId The primary key for the maintenance responsibility record. If -1 the data is cleared. 0 indicates a new maintenance responsibility is required. Any number > 0 is existing data.
   * @param {object|null} maintenanceResponsibilityData The maintenance responsibility data for the selected record
   * @param {number|null} dataIdx The index of the record within the array of maintenance responsibility records.
   * @param {number|null} dataLength The total number of records in the array of maintenance responsibility records.
   */
  const handleMaintenanceResponsibilitySelected = (pkId, maintenanceResponsibilityData, dataIdx, dataLength) => {
    handleAsdHomeClick();

    if (pkId === -1) {
      setMaintenanceResponsibilityFormData(null);
      streetContext.onRecordChange(51, null, null, null);
    } else if (pkId === 0) {
      currentStreetAsdData.current = JSON.parse(
        JSON.stringify({
          maintenanceResponsibilities: streetData.maintenanceResponsibilities,
          reinstatementCategories: streetData.reinstatementCategories,
          osSpecialDesignations: streetData.specialDesignations,
          interests: streetData.interests,
          constructions: streetData.constructions,
          specialDesignations: streetData.specialDesignations,
          publicRightOfWays: streetData.publicRightOfWays,
          heightWidthWeights: streetData.heightWidthWeights,
        })
      );
      const newIdx =
        streetData && streetData.maintenanceResponsibilities
          ? streetData.maintenanceResponsibilities.filter((x) => x.changeType !== "D").length
          : 0;
      const currentDate = GetCurrentDate(false);
      const minPkId =
        streetData.maintenanceResponsibilities && streetData.maintenanceResponsibilities.length
          ? streetData.maintenanceResponsibilities.reduce((prev, curr) => (prev.pkId < curr.pkId ? prev : curr))
          : null;
      const newPkId = !minPkId || !minPkId.pkId || minPkId.pkId > -10 ? -10 : minPkId.pkId - 1;
      const maxSeqNum =
        streetData.maintenanceResponsibilities && streetData.maintenanceResponsibilities.length
          ? streetData.maintenanceResponsibilities.reduce((prev, curr) => (prev.seqNum > curr.seqNum ? prev : curr))
          : null;
      const newSeqNum = maxSeqNum && maxSeqNum.seqNum ? maxSeqNum.seqNum + 1 : 1;
      const newRec = {
        usrn: streetData && streetData.usrn,
        wholeRoad: true,
        specificLocation: null,
        neverExport: false,
        changeType: "I",
        custodianCode:
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.scoMaintenanceResponsibilityTemplate &&
          settingsContext.streetTemplate.scoMaintenanceResponsibilityTemplate.custodianCode
            ? settingsContext.streetTemplate.scoMaintenanceResponsibilityTemplate.custodianCode
            : settingsContext.authorityCode
            ? settingsContext.authorityCode
            : null,
        maintainingAuthorityCode:
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.scoMaintenanceResponsibilityTemplate &&
          settingsContext.streetTemplate.scoMaintenanceResponsibilityTemplate.maintainingAuthorityCode
            ? settingsContext.streetTemplate.scoMaintenanceResponsibilityTemplate.maintainingAuthorityCode
            : settingsContext.authorityCode
            ? settingsContext.authorityCode
            : null,
        streetStatus:
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.scoMaintenanceResponsibilityTemplate.streetStatus
            ? settingsContext.streetTemplate.scoMaintenanceResponsibilityTemplate.streetStatus
            : null,
        state: 1,
        startDate: currentDate,
        endDate: null,
        wktGeometry: streetData && streetData.esus ? GetWholeRoadGeometry(streetData.esus) : "",
        pkId: newPkId,
        seqNum: newSeqNum,
      };

      const newMaintenanceResponsibilities = streetData.maintenanceResponsibilities
        ? streetData.maintenanceResponsibilities
        : [];
      newMaintenanceResponsibilities.push(newRec);

      setAssociatedStreetData(
        streetData.esus,
        streetData.successorCrossRefs,
        streetData.streetDescriptors,
        streetData.streetNotes,
        newMaintenanceResponsibilities,
        streetData.reinstatementCategories,
        streetData.specialDesignations,
        null,
        null,
        null,
        null,
        null
      );

      updateMapStreetData(
        streetData,
        newMaintenanceResponsibilities,
        streetData.reinstatementCategories,
        streetData.specialDesignations,
        null,
        null,
        null,
        null,
        null,
        settingsContext.isScottish,
        mapContext,
        lookupContext.currentLookups
      );

      setMaintenanceResponsibilityFormData({
        pkId: newPkId,
        maintenanceResponsibilityData: newRec,
        index: newIdx,
        totalRecords: streetData.maintenanceResponsibilities
          ? streetData.maintenanceResponsibilities.filter((x) => x.changeType !== "D").length
          : 1,
      });

      sandboxContext.onSandboxChange("maintenanceResponsibility", newRec);
      streetContext.onRecordChange(51, newPkId, newIdx, null, true);
    } else {
      setMaintenanceResponsibilityFormData({
        pkId: pkId,
        maintenanceResponsibilityData: maintenanceResponsibilityData,
        index: dataIdx,
        totalRecords: dataLength,
      });

      sandboxContext.onSandboxChange("maintenanceResponsibility", maintenanceResponsibilityData);
      streetContext.onRecordChange(51, pkId, dataIdx, null);
      if (!maintenanceResponsibilityData.wholeRoad) mapContext.onEditMapObject(51, pkId);
    }
  };

  /**
   * Event to handle when a reinstatement category record is selected from the list of ASD records.
   *
   * @param {number} pkId The primary key for the reinstatement category record. If -1 the data is cleared. 0 indicates a new reinstatement category is required. Any number > 0 is existing data.
   * @param {object|null} reinstatementCategoryData The reinstatement category data for the selected record
   * @param {number|null} dataIdx The index of the record within the array of reinstatement category records.
   * @param {number|null} dataLength The total number of records in the array of reinstatement category records.
   */
  const handleReinstatementCategorySelected = (pkId, reinstatementCategoryData, dataIdx, dataLength) => {
    handleAsdHomeClick();

    if (pkId === -1) {
      setReinstatementCategoryFormData(null);
      streetContext.onRecordChange(52, null, null, null);
    } else if (pkId === 0) {
      currentStreetAsdData.current = JSON.parse(
        JSON.stringify({
          maintenanceResponsibilities: streetData.maintenanceResponsibilities,
          reinstatementCategories: streetData.reinstatementCategories,
          osSpecialDesignations: streetData.specialDesignations,
          interests: streetData.interests,
          constructions: streetData.constructions,
          specialDesignations: streetData.specialDesignations,
          publicRightOfWays: streetData.publicRightOfWays,
          heightWidthWeights: streetData.heightWidthWeights,
        })
      );
      const newIdx =
        streetData && streetData.reinstatementCategories
          ? streetData.reinstatementCategories.filter((x) => x.changeType !== "D").length
          : 0;
      const currentDate = GetCurrentDate(false);
      const minPkId =
        streetData.reinstatementCategories && streetData.reinstatementCategories.length
          ? streetData.reinstatementCategories.reduce((prev, curr) => (prev.pkId < curr.pkId ? prev : curr))
          : null;
      const newPkId = !minPkId || !minPkId.pkId || minPkId.pkId > -10 ? -10 : minPkId.pkId - 1;
      const maxSeqNum =
        streetData.reinstatementCategories && streetData.reinstatementCategories.length
          ? streetData.reinstatementCategories.reduce((prev, curr) => (prev.seqNum > curr.seqNum ? prev : curr))
          : null;
      const newSeqNum = maxSeqNum && maxSeqNum.seqNum ? maxSeqNum.seqNum + 1 : 1;
      const newRec = {
        usrn: streetData && streetData.usrn,
        wholeRoad: true,
        specificLocation: null,
        neverExport: false,
        changeType: "I",
        custodianCode:
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.scoReinstatementCategoryTemplate &&
          settingsContext.streetTemplate.scoReinstatementCategoryTemplate.custodianCode
            ? settingsContext.streetTemplate.scoReinstatementCategoryTemplate.custodianCode
            : settingsContext.authorityCode
            ? settingsContext.authorityCode
            : null,
        reinstatementAuthorityCode:
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.scoReinstatementCategoryTemplate &&
          settingsContext.streetTemplate.scoReinstatementCategoryTemplate.reinstatementAuthorityCode
            ? settingsContext.streetTemplate.scoReinstatementCategoryTemplate.reinstatementAuthorityCode
            : settingsContext.authorityCode
            ? settingsContext.authorityCode
            : null,
        reinstatementCategoryCode:
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.scoReinstatementCategoryTemplate &&
          settingsContext.streetTemplate.scoReinstatementCategoryTemplate.reinstatementCategory
            ? settingsContext.streetTemplate.scoReinstatementCategoryTemplate.reinstatementCategory
            : null,
        state: 1,
        startDate: currentDate,
        endDate: null,
        wktGeometry: streetData && streetData.esus ? GetWholeRoadGeometry(streetData.esus) : "",
        pkId: newPkId,
        seqNum: newSeqNum,
      };

      const newReinstatementCategories = streetData.reinstatementCategories ? streetData.reinstatementCategories : [];
      newReinstatementCategories.push(newRec);

      setAssociatedStreetData(
        streetData.esus,
        streetData.successorCrossRefs,
        streetData.streetDescriptors,
        streetData.streetNotes,
        streetData.maintenanceResponsibilities,
        newReinstatementCategories,
        streetData.specialDesignations,
        null,
        null,
        null,
        null,
        null
      );

      updateMapStreetData(
        streetData,
        streetData.maintenanceResponsibilities,
        newReinstatementCategories,
        streetData.specialDesignations,
        null,
        null,
        null,
        null,
        null,
        settingsContext.isScottish,
        mapContext,
        lookupContext.currentLookups
      );

      setReinstatementCategoryFormData({
        pkId: newPkId,
        reinstatementCategoryData: newRec,
        index: newIdx,
        totalRecords: streetData.reinstatementCategories
          ? streetData.reinstatementCategories.filter((x) => x.changeType !== "D").length
          : 1,
      });

      sandboxContext.onSandboxChange("reinstatementCategory", newRec);
      streetContext.onRecordChange(52, newPkId, newIdx, null, true);
    } else {
      setReinstatementCategoryFormData({
        pkId: pkId,
        reinstatementCategoryData: reinstatementCategoryData,
        index: dataIdx,
        totalRecords: dataLength,
      });

      sandboxContext.onSandboxChange("reinstatementCategory", reinstatementCategoryData);
      streetContext.onRecordChange(52, pkId, dataIdx, null);
      if (!reinstatementCategoryData.wholeRoad) mapContext.onEditMapObject(52, pkId);
    }
  };

  /**
   * Event to handle when a (OneScotland) special designation record is selected from the list of ASD records.
   *
   * @param {number} pkId The primary key for the special designation record. If -1 the data is cleared. 0 indicates a new special designation is required. Any number > 0 is existing data.
   * @param {object|null} osSpecialDesignationData The special designation data for the selected record
   * @param {number|null} dataIdx The index of the record within the array of special designation records.
   * @param {number|null} dataLength The total number of records in the array of special designation records.
   */
  const handleOSSpecialDesignationSelected = (pkId, osSpecialDesignationData, dataIdx, dataLength) => {
    handleAsdHomeClick();

    if (pkId === -1) {
      setOSSpecialDesignationFormData(null);
      streetContext.onRecordChange(53, null, null, null);
    } else if (pkId === 0) {
      currentStreetAsdData.current = JSON.parse(
        JSON.stringify({
          maintenanceResponsibilities: streetData.maintenanceResponsibilities,
          reinstatementCategories: streetData.reinstatementCategories,
          osSpecialDesignations: streetData.specialDesignations,
          interests: streetData.interests,
          constructions: streetData.constructions,
          specialDesignations: streetData.specialDesignations,
          publicRightOfWays: streetData.publicRightOfWays,
          heightWidthWeights: streetData.heightWidthWeights,
        })
      );
      const newIdx =
        streetData && streetData.specialDesignations
          ? streetData.specialDesignations.filter((x) => x.changeType !== "D").length
          : 0;
      const currentDate = GetCurrentDate(false);
      const minPkId =
        streetData.specialDesignations && streetData.specialDesignations.length
          ? streetData.specialDesignations.reduce((prev, curr) => (prev.pkId < curr.pkId ? prev : curr))
          : null;
      const newPkId = !minPkId || !minPkId.pkId || minPkId.pkId > -10 ? -10 : minPkId.pkId - 1;
      const maxSeqNum =
        streetData.specialDesignations && streetData.specialDesignations.length
          ? streetData.specialDesignations.reduce((prev, curr) => (prev.seqNum > curr.seqNum ? prev : curr))
          : null;
      const newSeqNum = maxSeqNum && maxSeqNum.seqNum ? maxSeqNum.seqNum + 1 : 1;
      const newRec = {
        usrn: streetData && streetData.usrn,
        wholeRoad: true,
        specificLocation: null,
        neverExport: false,
        pkId: newPkId,
        seqNum: newSeqNum,
        changeType: "I",
        custodianCode:
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.scoSpecialDesignationTemplate &&
          settingsContext.streetTemplate.scoSpecialDesignationTemplate.custodianCode
            ? settingsContext.streetTemplate.scoSpecialDesignationTemplate.custodianCode
            : settingsContext.authorityCode
            ? settingsContext.authorityCode
            : null,
        authorityCode:
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.scoSpecialDesignationTemplate &&
          settingsContext.streetTemplate.scoSpecialDesignationTemplate.authorityCode
            ? settingsContext.streetTemplate.scoSpecialDesignationTemplate.authorityCode
            : settingsContext.authorityCode
            ? settingsContext.authorityCode
            : null,
        specialDesig:
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.scoSpecialDesignationTemplate &&
          settingsContext.streetTemplate.scoSpecialDesignationTemplate.specialDesignation
            ? settingsContext.streetTemplate.scoSpecialDesignationTemplate.specialDesignation
            : null,
        wktGeometry: streetData && streetData.esus ? GetWholeRoadGeometry(streetData.esus) : "",
        description: "",
        state: 1,
        startDate: currentDate,
        endDate: null,
      };

      const newOSSpecialDesignations = streetData.specialDesignations ? streetData.specialDesignations : [];
      newOSSpecialDesignations.push(newRec);

      setAssociatedStreetData(
        streetData.esus,
        streetData.successorCrossRefs,
        streetData.streetDescriptors,
        streetData.streetNotes,
        streetData.maintenanceResponsibilities,
        streetData.reinstatementCategories,
        newOSSpecialDesignations,
        null,
        null,
        null,
        null,
        null
      );

      updateMapStreetData(
        streetData,
        streetData.maintenanceResponsibilities,
        streetData.reinstatementCategories,
        newOSSpecialDesignations,
        null,
        null,
        null,
        null,
        null,
        settingsContext.isScottish,
        mapContext,
        lookupContext.currentLookups
      );

      setOSSpecialDesignationFormData({
        pkId: newPkId,
        osSpecialDesignationData: newRec,
        index: newIdx,
        totalRecords: streetData.specialDesignations
          ? streetData.specialDesignations.filter((x) => x.changeType !== "D").length
          : 1,
      });

      sandboxContext.onSandboxChange("osSpecialDesignation", newRec);
      streetContext.onRecordChange(53, newPkId, newIdx, null, true);
    } else {
      setOSSpecialDesignationFormData({
        pkId: pkId,
        osSpecialDesignationData: osSpecialDesignationData,
        index: dataIdx,
        totalRecords: dataLength,
      });

      sandboxContext.onSandboxChange("osSpecialDesignation", osSpecialDesignationData);
      streetContext.onRecordChange(53, pkId, dataIdx, null);
      if (!osSpecialDesignationData.wholeRoad) mapContext.onEditMapObject(53, pkId);
    }
  };

  /**
   * Event to handle when an interest record is selected from the list of ASD records.
   *
   * @param {number} pkId The primary key for the interest record. If -1 the data is cleared. 0 indicates a new interest is required. Any number > 0 is existing data.
   * @param {object|null} interestData The interest data for the selected record
   * @param {number|null} dataIdx The index of the record within the array of interest records.
   * @param {number|null} dataLength The total number of records in the array of interest records.
   */
  const handleInterestedSelected = (pkId, interestData, dataIdx, dataLength) => {
    handleAsdHomeClick();

    if (pkId === -1) {
      setInterestFormData(null);
      streetContext.onRecordChange(61, null, null, null);
    } else if (pkId === 0) {
      currentStreetAsdData.current = JSON.parse(
        JSON.stringify({
          maintenanceResponsibilities: streetData.maintenanceResponsibilities,
          reinstatementCategories: streetData.reinstatementCategories,
          osSpecialDesignations: streetData.specialDesignations,
          interests: streetData.interests,
          constructions: streetData.constructions,
          specialDesignations: streetData.specialDesignations,
          publicRightOfWays: streetData.publicRightOfWays,
          heightWidthWeights: streetData.heightWidthWeights,
        })
      );
      const newIdx =
        streetData && streetData.interests ? streetData.interests.filter((x) => x.changeType !== "D").length : 0;
      const currentDate = GetCurrentDate(false);
      const minPkId =
        streetData.interests && streetData.interests.length
          ? streetData.interests.reduce((prev, curr) => (prev.pkId < curr.pkId ? prev : curr))
          : null;
      const newPkId = !minPkId || !minPkId.pkId || minPkId.pkId > -10 ? -10 : minPkId.pkId - 1;
      const maxSeqNum =
        streetData.interests && streetData.interests.length
          ? streetData.interests.reduce((prev, curr) => (prev.seqNum > curr.seqNum ? prev : curr))
          : null;
      const newSeqNum = maxSeqNum && maxSeqNum.seqNum ? maxSeqNum.seqNum + 1 : 1;
      const newRec = {
        changeType: "I",
        usrn: streetData && streetData.usrn,
        seqNum: newSeqNum,
        wholeRoad: true,
        specificLocation: null,
        neverExport: false,
        swaOrgRefAuthority:
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.interestTemplate &&
          settingsContext.streetTemplate.interestTemplate.swaOrgRefAuthority
            ? settingsContext.streetTemplate.interestTemplate.swaOrgRefAuthority
            : settingsContext.authorityCode
            ? settingsContext.authorityCode
            : null,
        districtRefAuthority:
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.interestTemplate &&
          settingsContext.streetTemplate.interestTemplate.districtRefAuthority
            ? settingsContext.streetTemplate.interestTemplate.districtRefAuthority
            : null,
        recordStartDate: currentDate,
        recordEndDate: null,
        asdCoordinate: 0,
        asdCoordinateCount: null,
        swaOrgRefAuthMaintaining:
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.interestTemplate &&
          settingsContext.streetTemplate.interestTemplate.swaOrgRefMaintaining
            ? settingsContext.streetTemplate.interestTemplate.swaOrgRefMaintaining
            : settingsContext.authorityCode
            ? settingsContext.authorityCode
            : null,
        streetStatus:
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.interestTemplate &&
          settingsContext.streetTemplate.interestTemplate.streetStatus
            ? settingsContext.streetTemplate.interestTemplate.streetStatus
            : null,
        interestType:
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.interestTemplate &&
          settingsContext.streetTemplate.interestTemplate.interestType
            ? settingsContext.streetTemplate.interestTemplate.interestType
            : null,
        startX: null,
        startY: null,
        endX: null,
        endY: null,
        pkId: newPkId,
        entryDate: currentDate,
        lastUpdateDate: currentDate,
        wktGeometry: streetData && streetData.esus ? GetWholeRoadGeometry(streetData.esus) : "",
      };

      const newInterests = streetData.interests ? streetData.interests : [];
      newInterests.push(newRec);

      setAssociatedStreetData(
        streetData.esus,
        null,
        streetData.streetDescriptors,
        streetData.streetNotes,
        null,
        null,
        null,
        newInterests,
        streetData.constructions,
        streetData.specialDesignations,
        streetData.publicRightOfWays,
        streetData.heightWidthWeights
      );

      updateMapStreetData(
        streetData,
        null,
        null,
        null,
        newInterests,
        streetData.constructions,
        streetData.specialDesignations,
        streetData.heightWidthWeights,
        streetData.publicRightOfWays,
        settingsContext.isScottish,
        mapContext,
        lookupContext.currentLookups
      );

      setInterestFormData({
        pkId: newPkId,
        interestData: newRec,
        index: newIdx,
        totalRecords: streetData.interests ? streetData.interests.filter((x) => x.changeType !== "D").length : 1,
      });

      sandboxContext.onSandboxChange("interest", newRec);
      streetContext.onRecordChange(61, newPkId, newIdx, null, true);
    } else {
      setInterestFormData({
        pkId: pkId,
        interestData: interestData,
        index: dataIdx,
        totalRecords: dataLength,
      });

      sandboxContext.onSandboxChange("interest", interestData);
      streetContext.onRecordChange(61, pkId, dataIdx, null);
      if (!interestData.wholeRoad) mapContext.onEditMapObject(61, pkId);
    }
  };

  /**
   * Event to handle when an construction record is selected from the list of ASD records.
   *
   * @param {number} pkId The primary key for the construction record. If -1 the data is cleared. 0 indicates a new construction is required. Any number > 0 is existing data.
   * @param {object|null} constructionData The construction data for the selected record
   * @param {number|null} dataIdx The index of the record within the array of construction records.
   * @param {number|null} dataLength The total number of records in the array of construction records.
   */
  const handleConstructionSelected = (pkId, constructionData, dataIdx, dataLength) => {
    handleAsdHomeClick();

    if (pkId === -1) {
      setConstructionFormData(null);
      streetContext.onRecordChange(62, null, null, null);
    } else if (pkId === 0) {
      currentStreetAsdData.current = JSON.parse(
        JSON.stringify({
          maintenanceResponsibilities: streetData.maintenanceResponsibilities,
          reinstatementCategories: streetData.reinstatementCategories,
          osSpecialDesignations: streetData.specialDesignations,
          interests: streetData.interests,
          constructions: streetData.constructions,
          specialDesignations: streetData.specialDesignations,
          publicRightOfWays: streetData.publicRightOfWays,
          heightWidthWeights: streetData.heightWidthWeights,
        })
      );
      const newIdx =
        streetData && streetData.constructions
          ? streetData.constructions.filter((x) => x.changeType !== "D").length
          : 0;
      const currentDate = GetCurrentDate(false);
      const minPkId =
        streetData.constructions && streetData.constructions.length
          ? streetData.constructions.reduce((prev, curr) => (prev.pkId < curr.pkId ? prev : curr))
          : null;
      const newPkId = !minPkId || !minPkId.pkId || minPkId.pkId > -10 ? -10 : minPkId.pkId - 1;
      const maxSeqNum =
        streetData.constructions && streetData.constructions.length
          ? streetData.constructions.reduce((prev, curr) => (prev.seqNum > curr.seqNum ? prev : curr))
          : null;
      const newSeqNum = maxSeqNum && maxSeqNum.seqNum ? maxSeqNum.seqNum + 1 : 1;
      const newRec = {
        changeType: "I",
        usrn: streetData && streetData.usrn,
        seqNum: newSeqNum,
        wholeRoad: true,
        specificLocation: null,
        neverExport: false,
        recordStartDate: currentDate,
        recordEndDate: null,
        reinstatementTypeCode:
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.constructionTemplate &&
          settingsContext.streetTemplate.constructionTemplate.reinstatementTypeCode
            ? settingsContext.streetTemplate.constructionTemplate.reinstatementTypeCode
            : null,
        constructionType:
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.constructionTemplate &&
          settingsContext.streetTemplate.constructionTemplate.constructionType
            ? settingsContext.streetTemplate.constructionTemplate.constructionType
            : null,
        aggregateAbrasionVal:
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.constructionTemplate &&
          settingsContext.streetTemplate.constructionTemplate.aggregateAbrasionValue
            ? settingsContext.streetTemplate.constructionTemplate.aggregateAbrasionValue
            : null,
        polishedStoneVal:
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.constructionTemplate &&
          settingsContext.streetTemplate.constructionTemplate.polishedStoneValue
            ? settingsContext.streetTemplate.constructionTemplate.polishedStoneValue
            : null,
        frostHeaveSusceptibility: false,
        steppedJoint: false,
        asdCoordinate: 0,
        asdCoordinateCount: null,
        constructionStartX: null,
        constructionStartY: null,
        constructionEndX: null,
        constructionEndY: null,
        constructionDescription: null,
        swaOrgRefConsultant:
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.constructionTemplate &&
          settingsContext.streetTemplate.constructionTemplate.swaOrgRefConsultant
            ? settingsContext.streetTemplate.constructionTemplate.swaOrgRefConsultant
            : settingsContext.authorityCode
            ? settingsContext.authorityCode
            : null,
        districtRefConsultant:
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.constructionTemplate &&
          settingsContext.streetTemplate.constructionTemplate.districtRefConsultant
            ? settingsContext.streetTemplate.constructionTemplate.districtRefConsultant
            : null,
        pkId: newPkId,
        entryDate: currentDate,
        lastUpdateDate: currentDate,
        wktGeometry: streetData && streetData.esus ? GetWholeRoadGeometry(streetData.esus) : "",
      };

      const newConstructions = streetData.constructions ? streetData.constructions : [];
      newConstructions.push(newRec);

      setAssociatedStreetData(
        streetData.esus,
        null,
        streetData.streetDescriptors,
        streetData.streetNotes,
        null,
        null,
        null,
        streetData.interests,
        newConstructions,
        streetData.specialDesignations,
        streetData.publicRightOfWays,
        streetData.heightWidthWeights
      );

      updateMapStreetData(
        streetData,
        null,
        null,
        null,
        streetData.interests,
        newConstructions,
        streetData.specialDesignations,
        streetData.heightWidthWeights,
        streetData.publicRightOfWays,
        settingsContext.isScottish,
        mapContext,
        lookupContext.currentLookups
      );

      setConstructionFormData({
        pkId: newPkId,
        constructionData: newRec,
        index: newIdx,
        totalRecords: streetData.constructions
          ? streetData.constructions.filter((x) => x.changeType !== "D").length
          : 1,
      });

      sandboxContext.onSandboxChange("construction", newRec);
      streetContext.onRecordChange(62, newPkId, newIdx, null, true);
    } else {
      setConstructionFormData({
        pkId: pkId,
        constructionData: constructionData,
        index: dataIdx,
        totalRecords: dataLength,
      });

      sandboxContext.onSandboxChange("construction", constructionData);
      streetContext.onRecordChange(62, pkId, dataIdx, null);
      if (!constructionData.wholeRoad) mapContext.onEditMapObject(62, pkId);
    }
  };

  /**
   * Event to handle when a (GeoPlace) special designation record is selected from the list of ASD records.
   *
   * @param {number} pkId The primary key for the special designation record. If -1 the data is cleared. 0 indicates a new special designation is required. Any number > 0 is existing data.
   * @param {object|null} specialDesignationData The special designation data for the selected record
   * @param {number|null} dataIdx The index of the record within the array of special designation records.
   * @param {number|null} dataLength The total number of records in the array of special designation records.
   */
  const handleSpecialDesignationSelected = (pkId, specialDesignationData, dataIdx, dataLength) => {
    handleAsdHomeClick();

    if (pkId === -1) {
      setSpecialDesignationFormData(null);
      streetContext.onRecordChange(63, null, null, null);
    } else if (pkId === 0) {
      currentStreetAsdData.current = JSON.parse(
        JSON.stringify({
          maintenanceResponsibilities: streetData.maintenanceResponsibilities,
          reinstatementCategories: streetData.reinstatementCategories,
          osSpecialDesignations: streetData.specialDesignations,
          interests: streetData.interests,
          constructions: streetData.constructions,
          specialDesignations: streetData.specialDesignations,
          publicRightOfWays: streetData.publicRightOfWays,
          heightWidthWeights: streetData.heightWidthWeights,
        })
      );
      const newIdx =
        streetData && streetData.specialDesignations
          ? streetData.specialDesignations.filter((x) => x.changeType !== "D").length
          : 0;
      const currentDate = GetCurrentDate(false);
      const minPkId =
        streetData.specialDesignations && streetData.specialDesignations.length
          ? streetData.specialDesignations.reduce((prev, curr) => (prev.pkId < curr.pkId ? prev : curr))
          : null;
      const newPkId = !minPkId || !minPkId.pkId || minPkId.pkId > -10 ? -10 : minPkId.pkId - 1;
      const maxSeqNum =
        streetData.specialDesignations && streetData.specialDesignations.length
          ? streetData.specialDesignations.reduce((prev, curr) => (prev.seqNum > curr.seqNum ? prev : curr))
          : null;
      const newSeqNum = maxSeqNum && maxSeqNum.seqNum ? maxSeqNum.seqNum + 1 : 1;
      const newRec = {
        changeType: "I",
        usrn: streetData && streetData.usrn,
        seqNum: newSeqNum,
        wholeRoad: true,
        specificLocation: null,
        neverExport: false,
        streetSpecialDesigCode:
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.specialDesignationTemplate &&
          settingsContext.streetTemplate.specialDesignationTemplate.type
            ? settingsContext.streetTemplate.specialDesignationTemplate.type
            : null,
        asdCoordinate: 0,
        asdCoordinateCount: null,
        specialDesigPeriodicityCode:
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.specialDesignationTemplate &&
          settingsContext.streetTemplate.specialDesignationTemplate.specialDesigPeriodicityCode
            ? settingsContext.streetTemplate.specialDesignationTemplate.specialDesigPeriodicityCode
            : null,
        specialDesigStartX: null,
        specialDesigStartY: null,
        specialDesigEndX: null,
        specialDesigEndY: null,
        recordStartDate: currentDate,
        recordEndDate: null,
        specialDesigStartDate: null,
        specialDesigEndDate: null,
        specialDesigStartTime: null,
        specialDesigEndTime: null,
        specialDesigDescription: null,
        swaOrgRefConsultant:
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.specialDesignationTemplate &&
          settingsContext.streetTemplate.specialDesignationTemplate.swaOrgRefConsultant
            ? settingsContext.streetTemplate.specialDesignationTemplate.swaOrgRefConsultant
            : settingsContext.authorityCode
            ? settingsContext.authorityCode
            : null,
        districtRefConsultant:
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.specialDesignationTemplate &&
          settingsContext.streetTemplate.specialDesignationTemplate.districtRefConsultant
            ? settingsContext.streetTemplate.specialDesignationTemplate.districtRefConsultant
            : null,
        specialDesigSourceText: null,
        pkId: newPkId,
        entryDate: currentDate,
        lastUpdateDate: currentDate,
        wktGeometry: streetData && streetData.esus ? GetWholeRoadGeometry(streetData.esus) : "",
      };

      const newSpecialDesignations = streetData.specialDesignations ? streetData.specialDesignations : [];
      newSpecialDesignations.push(newRec);

      setAssociatedStreetData(
        streetData.esus,
        null,
        streetData.streetDescriptors,
        streetData.streetNotes,
        null,
        null,
        null,
        streetData.interests,
        streetData.constructions,
        newSpecialDesignations,
        streetData.publicRightOfWays,
        streetData.heightWidthWeights
      );

      updateMapStreetData(
        streetData,
        null,
        null,
        null,
        streetData.interests,
        streetData.constructions,
        newSpecialDesignations,
        streetData.heightWidthWeights,
        streetData.publicRightOfWays,
        settingsContext.isScottish,
        mapContext,
        lookupContext.currentLookups
      );

      setSpecialDesignationFormData({
        pkId: newPkId,
        specialDesignationData: newRec,
        index: newIdx,
        totalRecords: streetData.specialDesignations
          ? streetData.specialDesignations.filter((x) => x.changeType !== "D").length
          : 1,
      });

      sandboxContext.onSandboxChange("specialDesignation", newRec);
      streetContext.onRecordChange(63, newPkId, newIdx, null, true);
    } else {
      setSpecialDesignationFormData({
        pkId: pkId,
        specialDesignationData: specialDesignationData,
        index: dataIdx,
        totalRecords: dataLength,
      });

      sandboxContext.onSandboxChange("specialDesignation", specialDesignationData);
      streetContext.onRecordChange(63, pkId, dataIdx, null);
      if (!specialDesignationData.wholeRoad) mapContext.onEditMapObject(63, pkId);
    }
  };

  /**
   * Event to handle when a height, width and weight restriction record is selected from the list of ASD records.
   *
   * @param {number} pkId The primary key for the height, width and weight restriction record. If -1 the data is cleared. 0 indicates a new height, width and weight restriction is required. Any number > 0 is existing data.
   * @param {object|null} hwwData The height, width and weight restriction data for the selected record
   * @param {number|null} dataIdx The index of the record within the array of height, width and weight restriction records.
   * @param {number|null} dataLength The total number of records in the array of height, width and weight restriction records.
   */
  const handleHWWSelected = (pkId, hwwData, dataIdx, dataLength) => {
    handleAsdHomeClick();

    if (pkId === -1) {
      setHwwFormData(null);
      streetContext.onRecordChange(64, null, null, null);
    } else if (pkId === 0) {
      currentStreetAsdData.current = JSON.parse(
        JSON.stringify({
          maintenanceResponsibilities: streetData.maintenanceResponsibilities,
          reinstatementCategories: streetData.reinstatementCategories,
          osSpecialDesignations: streetData.specialDesignations,
          interests: streetData.interests,
          constructions: streetData.constructions,
          specialDesignations: streetData.specialDesignations,
          publicRightOfWays: streetData.publicRightOfWays,
          heightWidthWeights: streetData.heightWidthWeights,
        })
      );
      const newIdx =
        streetData && streetData.heightWidthWeights
          ? streetData.heightWidthWeights.filter((x) => x.changeType !== "D").length
          : 0;
      const currentDate = GetCurrentDate(false);
      const minPkId =
        streetData.heightWidthWeights && streetData.heightWidthWeights.length
          ? streetData.heightWidthWeights.reduce((prev, curr) => (prev.pkId < curr.pkId ? prev : curr))
          : null;
      const newPkId = !minPkId || !minPkId.pkId || minPkId.pkId > -10 ? -10 : minPkId.pkId - 1;
      const maxSeqNum =
        streetData.heightWidthWeights && streetData.heightWidthWeights.length
          ? streetData.heightWidthWeights.reduce((prev, curr) => (prev.seqNum > curr.seqNum ? prev : curr))
          : null;
      const newSeqNum = maxSeqNum && maxSeqNum.seqNum ? maxSeqNum.seqNum + 1 : 1;
      const newRec = {
        changeType: "I",
        usrn: streetData && streetData.usrn,
        seqNum: newSeqNum,
        wholeRoad: true,
        specificLocation: null,
        neverExport: false,
        hwwRestrictionCode:
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.heightWidthWeightTemplate &&
          settingsContext.streetTemplate.heightWidthWeightTemplate.hwwRestrictionCode
            ? settingsContext.streetTemplate.heightWidthWeightTemplate.hwwRestrictionCode
            : null,
        recordStartDate: currentDate,
        recordEndDate: null,
        asdCoordinate: 0,
        asdCoordinateCount: null,
        hwwStartX: null,
        hwwStartY: null,
        hwwEndX: null,
        hwwEndY: null,
        valueMetric: 0,
        troText: null,
        featureDescription: null,
        sourceText: null,
        swaOrgRefConsultant:
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.heightWidthWeightTemplate &&
          settingsContext.streetTemplate.heightWidthWeightTemplate.swaOrgRefConsultant
            ? settingsContext.streetTemplate.heightWidthWeightTemplate.swaOrgRefConsultant
            : settingsContext.authorityCode
            ? settingsContext.authorityCode
            : null,
        districtRefConsultant:
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.heightWidthWeightTemplate &&
          settingsContext.streetTemplate.heightWidthWeightTemplate.districtRefConsultant
            ? settingsContext.streetTemplate.heightWidthWeightTemplate.districtRefConsultant
            : null,
        pkId: newPkId,
        entryDate: currentDate,
        lastUpdateDate: currentDate,
        wktGeometry: streetData && streetData.esus ? GetWholeRoadGeometry(streetData.esus) : "",
      };

      const newHeightWidthWeights = streetData.heightWidthWeights ? streetData.heightWidthWeights : [];
      newHeightWidthWeights.push(newRec);

      setAssociatedStreetData(
        streetData.esus,
        null,
        streetData.streetDescriptors,
        streetData.streetNotes,
        null,
        null,
        null,
        streetData.interests,
        streetData.constructions,
        streetData.specialDesignations,
        streetData.publicRightOfWays,
        newHeightWidthWeights
      );

      updateMapStreetData(
        streetData,
        null,
        null,
        null,
        streetData.interests,
        streetData.constructions,
        streetData.specialDesignations,
        newHeightWidthWeights,
        streetData.publicRightOfWays,
        settingsContext.isScottish,
        mapContext,
        lookupContext.currentLookups
      );

      setHwwFormData({
        pkId: newPkId,
        hwwData: newRec,
        index: newIdx,
        totalRecords: streetData.heightWidthWeights
          ? streetData.heightWidthWeights.filter((x) => x.changeType !== "D").length
          : 1,
      });

      sandboxContext.onSandboxChange("hww", newRec);
      streetContext.onRecordChange(64, newPkId, newIdx, null, true);
    } else {
      setHwwFormData({
        pkId: pkId,
        hwwData: hwwData,
        index: dataIdx,
        totalRecords: dataLength,
      });

      sandboxContext.onSandboxChange("hww", hwwData);
      streetContext.onRecordChange(64, pkId, dataIdx, null);
      if (!hwwData.wholeRoad) mapContext.onEditMapObject(64, pkId);
    }
  };

  /**
   * Event to handle when a public rights of way record is selected from the list of ASD records.
   *
   * @param {number} pkId The primary key for the public rights of way record. If -1 the data is cleared. 0 indicates a new public rights of way is required. Any number > 0 is existing data.
   * @param {object|null} prowData The public rights of way data for the selected record
   * @param {number|null} dataIdx The index of the record within the array of public rights of way records.
   * @param {number|null} dataLength The total number of records in the array of public rights of way records.
   */
  const handlePRoWSelected = (pkId, prowData, dataIdx, dataLength) => {
    handleAsdHomeClick();

    if (pkId === -1) {
      setProwFormData(null);
      streetContext.onRecordChange(66, null, null, null);
    } else if (pkId === 0) {
      currentStreetAsdData.current = JSON.parse(
        JSON.stringify({
          maintenanceResponsibilities: streetData.maintenanceResponsibilities,
          reinstatementCategories: streetData.reinstatementCategories,
          osSpecialDesignations: streetData.specialDesignations,
          interests: streetData.interests,
          constructions: streetData.constructions,
          specialDesignations: streetData.specialDesignations,
          publicRightOfWays: streetData.publicRightOfWays,
          heightWidthWeights: streetData.heightWidthWeights,
        })
      );
      const newIdx =
        streetData && streetData.publicRightOfWays
          ? streetData.publicRightOfWays.filter((x) => x.changeType !== "D").length
          : 0;
      const currentDate = GetCurrentDate(false);
      const minPkId =
        streetData.publicRightOfWays && streetData.publicRightOfWays.length
          ? streetData.publicRightOfWays.reduce((prev, curr) => (prev.pkId < curr.pkId ? prev : curr))
          : null;
      const newPkId = !minPkId || !minPkId.pkId || minPkId.pkId > -10 ? -10 : minPkId.pkId - 1;
      const newRec = {
        changeType: "I",
        prowUsrn: streetData && streetData.usrn,
        defMapGeometryType: true,
        defMapGeometryCount: null,
        prowLength: getCurrentStreetLength(),
        prowRights:
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.publicRightOfWayTemplate &&
          settingsContext.streetTemplate.publicRightOfWayTemplate.prowRights
            ? settingsContext.streetTemplate.publicRightOfWayTemplate.prowRights
            : null,
        pedAccess:
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.publicRightOfWayTemplate &&
          settingsContext.streetTemplate.publicRightOfWayTemplate.pedestrianAccess
            ? settingsContext.streetTemplate.publicRightOfWayTemplate.pedestrianAccess
            : false,
        equAccess:
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.publicRightOfWayTemplate &&
          settingsContext.streetTemplate.publicRightOfWayTemplate.equestrianAccess
            ? settingsContext.streetTemplate.publicRightOfWayTemplate.equestrianAccess
            : false,
        nonMotAccess:
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.publicRightOfWayTemplate &&
          settingsContext.streetTemplate.publicRightOfWayTemplate.nonMotVehicleAccess
            ? settingsContext.streetTemplate.publicRightOfWayTemplate.nonMotVehicleAccess
            : false,
        cycAccess:
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.publicRightOfWayTemplate &&
          settingsContext.streetTemplate.publicRightOfWayTemplate.bicycleAccess
            ? settingsContext.streetTemplate.publicRightOfWayTemplate.bicycleAccess
            : false,
        motAccess:
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.publicRightOfWayTemplate &&
          settingsContext.streetTemplate.publicRightOfWayTemplate.motVehicleAccess
            ? settingsContext.streetTemplate.publicRightOfWayTemplate.motVehicleAccess
            : false,
        recordStartDate: currentDate,
        relevantStartDate: null,
        recordEndDate: null,
        prowStatus:
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.publicRightOfWayTemplate &&
          settingsContext.streetTemplate.publicRightOfWayTemplate.status
            ? settingsContext.streetTemplate.publicRightOfWayTemplate.status
            : null,
        consultStartDate: null,
        consultEndDate: null,
        consultRef: null,
        consultDetails: null,
        appealDate: null,
        appealRef: null,
        appealDetails: null,
        divRelatedUsrn: null,
        prowLocation: null,
        prowDetails: null,
        promotedRoute:
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.publicRightOfWayTemplate &&
          settingsContext.streetTemplate.publicRightOfWayTemplate.promotedRoute
            ? settingsContext.streetTemplate.promotedRoute
            : null,
        accessibleRoute:
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.publicRightOfWayTemplate.publicRightOfWayTemplate &&
          settingsContext.streetTemplate.publicRightOfWayTemplate.accessibleRoute
            ? settingsContext.streetTemplate.publicRightOfWayTemplate.accessibleRoute
            : null,
        sourceText: null,
        prowOrgRefConsultant:
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.publicRightOfWayTemplate &&
          settingsContext.streetTemplate.publicRightOfWayTemplate.organisation
            ? settingsContext.streetTemplate.publicRightOfWayTemplate.organisation
            : settingsContext.authorityCode
            ? settingsContext.authorityCode
            : null,
        prowDistrictRefConsultant:
          settingsContext.streetTemplate &&
          settingsContext.streetTemplate.publicRightOfWayTemplate &&
          settingsContext.streetTemplate.publicRightOfWayTemplate.district
            ? settingsContext.streetTemplate.publicRightOfWayTemplate.district
            : null,
        neverExport: false,
        pkId: newPkId,
        entryDate: currentDate,
        lastUpdateDate: currentDate,
        wktGeometry: streetData && streetData.esus ? GetWholeRoadGeometry(streetData.esus) : "",
      };

      const newPublicRightOfWays = streetData.publicRightOfWays ? streetData.publicRightOfWays : [];
      newPublicRightOfWays.push(newRec);

      setAssociatedStreetData(
        streetData.esus,
        null,
        streetData.streetDescriptors,
        streetData.streetNotes,
        null,
        null,
        null,
        streetData.interests,
        streetData.constructions,
        streetData.specialDesignations,
        newPublicRightOfWays,
        streetData.heightWidthWeights
      );

      updateMapStreetData(
        streetData,
        null,
        null,
        null,
        streetData.interests,
        streetData.constructions,
        streetData.specialDesignations,
        streetData.heightWidthWeights,
        newPublicRightOfWays,
        settingsContext.isScottish,
        mapContext,
        lookupContext.currentLookups
      );

      setProwFormData({
        pkId: newPkId,
        prowData: newRec,
        index: newIdx,
        totalRecords: streetData.publicRightOfWays
          ? streetData.publicRightOfWays.filter((x) => x.changeType !== "D").length
          : 1,
      });

      sandboxContext.onSandboxChange("prow", newRec);
      streetContext.onRecordChange(66, newPkId, newIdx, null, true);
    } else {
      setProwFormData({
        pkId: pkId,
        prowData: prowData,
        index: dataIdx,
        totalRecords: dataLength,
      });

      sandboxContext.onSandboxChange("prow", prowData);
      streetContext.onRecordChange(66, pkId, dataIdx, null);
      if (!prowData.defMapGeometryType) mapContext.onEditMapObject(66, pkId);
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
    setNotesFormData(null);
    streetContext.onRecordChange(11, null, null, null);
    mapContext.onEditMapObject(null, null);

    if (pkId === 0) {
      const newIdx =
        streetData && streetData.streetNotes
          ? streetData.streetNotes.filter((x) => x.changeType !== "D").length + 1
          : 0;

      const currentDate = GetCurrentDate(false);
      const minPkIdNote =
        streetData.streetNotes && streetData.streetNotes.length > 0
          ? streetData.streetNotes.reduce((prev, curr) => (prev.pkId < curr.pkId ? prev : curr))
          : null;
      const newPkId = !minPkIdNote || !minPkIdNote.pkId || minPkIdNote.pkId > -10 ? -10 : minPkIdNote.pkId - 1;
      const maxSeqNo =
        streetData.streetNotes && streetData.streetNotes.length > 0
          ? streetData.streetNotes.reduce((prev, curr) => (prev.seqNo > curr.seqNo ? prev : curr))
          : null;
      const newSeqNo = maxSeqNo && maxSeqNo.seqNo ? maxSeqNo.seqNo + 1 : 1;

      const newRec = {
        createdDate: currentDate,
        lastUpdatedDate: currentDate,
        pkId: newPkId,
        seqNo: newSeqNo,
        usrn: streetData && streetData.usrn,
        note: null,
        changeType: "I",
        lastUser: userContext.currentUser ? userContext.currentUser.auditName : null,
      };

      const newNotes = streetData.streetNotes ? streetData.streetNotes : [];
      newNotes.push(newRec);

      setAssociatedStreetData(
        streetData.esus,
        streetData.successorCrossRefs,
        streetData.streetDescriptors,
        newNotes,
        streetData.maintenanceResponsibilities,
        streetData.reinstatementCategories,
        settingsContext.isScottish ? streetData.specialDesignations : null,
        streetData.interests,
        streetData.constructions,
        !settingsContext.isScottish ? streetData.specialDesignations : null,
        streetData.publicRightOfWays,
        streetData.heightWidthWeights
      );

      setNotesFormData({
        pkId: newPkId,
        noteData: newRec,
        index: newIdx,
        totalRecords: streetData.streetNotes ? streetData.streetNotes.filter((x) => x.changeType !== "D").length : 1,
        variant: "street",
      });

      sandboxContext.onSandboxChange("streetNote", newRec);
      streetContext.onRecordChange(72, newPkId, newIdx, null, true);
    } else if (pkId !== -1) {
      setNotesFormData({
        pkId: pkId,
        noteData: noteData,
        index: dataIdx,
        totalRecords: streetData.streetNotes.filter((x) => x.changeType !== "D").length,
        variant: "street",
      });

      sandboxContext.onSandboxChange("streetNote", noteData);
      streetContext.onRecordChange(72, pkId, dataIdx, null);
    }
  };

  /**
   * Event to handle if any changes have been made to an existing property before adding a new property.
   *
   * @param {number} usrn The USRN of the street that the property is being created on.
   * @param {object|null} parent If this is a child property this will hold the parent information; otherwise it is null.
   * @param {boolean} isRange True if user wants to create a range of properties; otherwise false.
   */
  const handlePropertyAdd = (usrn, parent, isRange) => {
    streetContext.onLeavingStreet("createProperty", { usrn: usrn, parent: parent, isRange: isRange });
  };

  /**
   * Event to handle adding a new ESU record.
   *
   */
  const handleAddEsu = () => {
    handleEsuSelected(0, null, null);
  };

  /**
   * Event to handle adding a new highway dedication record.
   *
   * @param {number} esuId The id of the ESU record that the user is adding the highway dedication record to.
   * @param {number} esuIndex The index of the ESU record that the user is adding the highway dedication record to within the array of ESU records on the street.
   */
  const handleAddHighwayDedication = (esuId, esuIndex) => {
    handleHighwayDedicationSelected(esuId, 0, null, null, esuIndex);
  };

  /**
   * Event to handle adding a new one-way exemption record.
   *
   * @param {number} esuId The id of the ESU record that the user is adding the one-way exemption record to.
   * @param {number} esuIndex The index of the ESU record that the user is adding the one-way exemption record to within the array of ESU records on the street.
   */
  const handleAddOneWayExemption = (esuId, esuIndex) => {
    handleOneWayExemptionSelected(esuId, 0, null, null, esuIndex);
  };

  /**
   * Event to handle adding a new maintenance responsibility record.
   *
   */
  const handleAddMaintenanceResponsibility = () => {
    handleMaintenanceResponsibilitySelected(0, null, null, null);
  };

  /**
   * Event to handle adding a new reinstatement category record.
   *
   */
  const handleAddReinstatementCategory = () => {
    handleReinstatementCategorySelected(0, null, null, null);
  };

  /**
   * Event to handle adding a new (OneScotland) special designation record.
   *
   */
  const handleAddOSSpecialDesignation = () => {
    handleOSSpecialDesignationSelected(0, null, null, null);
  };

  /**
   * Event to handle adding a new interest record.
   *
   */
  const handleAddInterest = () => {
    handleInterestedSelected(0, null, null, null);
  };

  /**
   * Event to handle adding a new construction record.
   *
   */
  const handleAddConstruction = () => {
    handleConstructionSelected(0, null, null, null);
  };

  /**
   * Event to handle adding a new (GeoPlace) special designation record.
   *
   */
  const handleAddSpecialDesignation = () => {
    handleSpecialDesignationSelected(0, null, null, null);
  };

  /**
   * Event to handle adding a new height, width and weight restriction record.
   *
   */
  const handleAddHeightWidthWeight = () => {
    handleHWWSelected(0, null, null, null);
  };

  /**
   * Event to handle adding a new public right of way record.
   *
   */
  const handleAddPublicRightOfWay = () => {
    handlePRoWSelected(0, null, null, null);
  };

  /**
   * Event to handle the deleting of a street.
   *
   * @param {number} pkId The id for the street that the user wants to delete.
   */
  const handleStreetDelete = async (pkId) => {
    if (streetData.pkId === pkId) {
      const result = await StreetDelete(
        streetData.usrn,
        true,
        lookupContext,
        userContext.currentUser.token,
        settingsContext.isScottish
      );

      if (result) {
        const newStreetSearchData = searchContext.currentSearchData.results.filter(
          (x) => x.type === 24 || x.usrn.toString() !== streetData.usrn.toString()
        );
        searchContext.onSearchDataChange(searchContext.currentSearchData.searchString, newStreetSearchData);

        const newMapBackgroundStreets = mapContext.currentBackgroundData.streets.filter(
          (x) => x.usrn.toString() !== streetData.usrn.toString()
        );
        const newMapSearchStreets = mapContext.currentSearchData.streets.filter(
          (x) => x.usrn.toString() !== streetData.usrn.toString()
        );
        mapContext.onBackgroundDataChange(
          newMapBackgroundStreets,
          mapContext.currentBackgroundData.unassignedEsus,
          mapContext.currentBackgroundData.properties
        );
        mapContext.onSearchDataChange(newMapSearchStreets, mapContext.currentSearchData.properties, null, null);

        sandboxContext.resetSandbox();

        streetContext.resetStreet();
        streetContext.resetStreetErrors();
        propertyContext.resetProperty();
        propertyContext.resetPropertyErrors();
        propertyContext.onWizardDone(null, false, null, null);

        mapContext.onEditMapObject(null, null);

        history.push(GazetteerRoute);
      }
    }
  };

  /**
   * Event to handle the deleting of an ESU.
   *
   * @param {number} pkId The id for the ESU that the user wants to delete.
   */
  const handleEsuDeleted = (pkId) => {
    let newEsus = streetData.esus.map((x) => x);

    if (pkId && pkId > 0) {
      const deleteEsu = streetData.esus.find((x) => x.pkId === pkId);

      if (deleteEsu) {
        const deletedEsu = {
          entryDate: deleteEsu.entryDate,
          changeType: "D",
          esuVersionNumber: deleteEsu.esuVersionNumber,
          numCoordCount: deleteEsu.numCoordCount,
          esuTolerance: deleteEsu.esuTolerance,
          esuStartDate: deleteEsu.esuStartDate,
          esuEndDate: GetCurrentDate(false),
          esuDirection: deleteEsu.esuDirection,
          wktGeometry: deleteEsu.wktGeometry,
          assignUnassign: deleteEsu.assignUnassign,
          pkId: deleteEsu.pkId,
          esuId: deleteEsu.esuId,
          highwayDedications: deleteEsu.highwayDedications.map((x) => {
            return {
              changeType: "D",
              highwayDedicationCode: x.highwayDedicationCode,
              recordEndDate: GetCurrentDate(false),
              hdStartDate: x.hdStartDate,
              hdEndDate: x.hdEndDate,
              hdSeasonalStartDate: x.hdSeasonalStartDate,
              hdSeasonalEndDate: x.hdSeasonalEndDate,
              hdStartTime: x.hdStartTime,
              hdEndTime: x.hdEndTime,
              hdProw: x.hdProw,
              hdNcr: x.hdNcr,
              hdQuietRoute: x.hdQuietRoute,
              hdObstruction: x.hdObstruction,
              hdPlanningOrder: x.hdPlanningOrder,
              hdVehiclesProhibited: x.hdVehiclesProhibited,
              pkId: x.pkId,
              esuId: x.esuId,
              seqNum: x.seqNum,
            };
          }),
          oneWayExemptions: deleteEsu.oneWayExemptions.map((x) => {
            return {
              changeType: "D",
              oneWayExemptionTypeCode: x.oneWayExemptionTypeCode,
              recordEndDate: GetCurrentDate(false),
              oneWayExemptionStartDate: x.oneWayExemptionStartDate,
              oneWayExemptionEndDate: x.oneWayExemptionEndDate,
              oneWayExemptionStartTime: x.oneWayExemptionStartTime,
              oneWayExemptionEndTime: x.oneWayExemptionEndTime,
              oneWayExemptionPeriodicityCode: x.oneWayExemptionPeriodicityCode,
              pkId: x.pkId,
              esuId: x.esuId,
              sequenceNumber: x.sequenceNumber,
            };
          }),
        };

        newEsus = streetData.esus.map((x) => [deletedEsu].find((rec) => rec.esuId === x.esuId) || x);
      }
    } else if (pkId && pkId < 0) {
      newEsus = streetData.esus.filter((x) => x.pkId !== pkId);
    }

    setAssociatedStreetData(
      newEsus,
      streetData.successorCrossRefs,
      streetData.streetDescriptors,
      streetData.streetNotes,
      streetData.maintenanceResponsibilities,
      streetData.reinstatementCategories,
      settingsContext.isScottish ? streetData.specialDesignations : null,
      streetData.interests,
      streetData.constructions,
      !settingsContext.isScottish ? streetData.specialDesignations : null,
      streetData.publicRightOfWays,
      streetData.heightWidthWeights
    );

    const contextStreet = sandboxContext.currentSandbox.currentStreet || sandboxContext.currentSandbox.sourceStreet;
    const newStreetData =
      !settingsContext.isScottish && !HasASD()
        ? {
            changeType: contextStreet.changeType,
            usrn: contextStreet.usrn,
            swaOrgRefNaming: contextStreet.swaOrgRefNaming,
            streetSurface: contextStreet.streetSurface,
            streetStartDate: contextStreet.streetStartDate,
            streetEndDate: contextStreet.streetEndDate,
            neverExport: contextStreet.neverExport,
            version: contextStreet.version,
            recordType: contextStreet.recordType,
            state: contextStreet.state,
            stateDate: contextStreet.stateDate,
            streetClassification: contextStreet.streetClassification,
            streetTolerance: contextStreet.streetTolerance,
            streetStartX: contextStreet.streetStartX,
            streetStartY: contextStreet.streetStartY,
            streetEndX: contextStreet.streetEndX,
            streetEndY: contextStreet.streetEndY,
            pkId: contextStreet.pkId,
            lastUpdateDate: contextStreet.lastUpdateDate,
            entryDate: contextStreet.entryDate,
            streetLastUpdated: contextStreet.streetLastUpdated,
            streetLastUser: contextStreet.streetLastUser,
            relatedPropertyCount: contextStreet.relatedPropertyCount,
            relatedStreetCount: contextStreet.relatedStreetCount,
            esus: newEsus,
            streetDescriptors: contextStreet.streetDescriptors,
            streetNotes: contextStreet.streetNotes,
          }
        : !settingsContext.isScottish && HasASD()
        ? {
            changeType: contextStreet.changeType,
            usrn: contextStreet.usrn,
            swaOrgRefNaming: contextStreet.swaOrgRefNaming,
            streetSurface: contextStreet.streetSurface,
            streetStartDate: contextStreet.streetStartDate,
            streetEndDate: contextStreet.streetEndDate,
            neverExport: contextStreet.neverExport,
            version: contextStreet.version,
            recordType: contextStreet.recordType,
            state: contextStreet.state,
            stateDate: contextStreet.stateDate,
            streetClassification: contextStreet.streetClassification,
            streetTolerance: contextStreet.streetTolerance,
            streetStartX: contextStreet.streetStartX,
            streetStartY: contextStreet.streetStartY,
            streetEndX: contextStreet.streetEndX,
            streetEndY: contextStreet.streetEndY,
            pkId: contextStreet.pkId,
            lastUpdateDate: contextStreet.lastUpdateDate,
            entryDate: contextStreet.entryDate,
            streetLastUpdated: contextStreet.streetLastUpdated,
            streetLastUser: contextStreet.streetLastUser,
            relatedPropertyCount: contextStreet.relatedPropertyCount,
            relatedStreetCount: contextStreet.relatedStreetCount,
            esus: newEsus,
            streetDescriptors: contextStreet.streetDescriptors,
            streetNotes: contextStreet.streetNotes,
            interests: contextStreet.recordType < 4 ? contextStreet.interests : null,
            constructions: contextStreet.recordType < 4 ? contextStreet.constructions : null,
            specialDesignations: contextStreet.recordType < 4 ? contextStreet.specialDesignations : null,
            publicRightOfWays: contextStreet.recordType < 4 ? contextStreet.publicRightOfWays : null,
            heightWidthWeights: contextStreet.recordType < 4 ? contextStreet.heightWidthWeights : null,
          }
        : {
            pkId: contextStreet.pkId,
            changeType: contextStreet.changeType,
            usrn: contextStreet.usrn,
            recordType: contextStreet.recordType,
            swaOrgRefNaming: contextStreet.swaOrgRefNaming,
            version: contextStreet.version,
            recordEntryDate: contextStreet.recordEntryDate,
            lastUpdateDate: contextStreet.lastUpdateDate,
            streetStartDate: contextStreet.streetStartDate,
            streetEndDate: contextStreet.streetEndDate,
            streetStartX: contextStreet.streetStartX,
            streetStartY: contextStreet.streetStartY,
            streetEndX: contextStreet.streetEndX,
            streetEndY: contextStreet.streetEndY,
            streetTolerance: contextStreet.streetTolerance,
            esuCount: contextStreet.esuCount,
            streetLastUpdated: contextStreet.streetLastUpdated,
            streetLastUser: contextStreet.streetLastUser,
            neverExport: contextStreet.neverExport,
            relatedPropertyCount: contextStreet.relatedPropertyCount,
            relatedStreetCount: contextStreet.relatedStreetCount,
            lastUpdated: contextStreet.lastUpdated,
            insertedTimestamp: contextStreet.insertedTimestamp,
            insertedUser: contextStreet.insertedUser,
            lastUser: contextStreet.lastUser,
            esus: newEsus,
            successorCrossRefs: contextStreet.successorCrossRefs,
            streetDescriptors: contextStreet.streetDescriptors,
            streetNotes: contextStreet.streetNotes,
            maintenanceResponsibilities:
              contextStreet.recordType < 4 ? contextStreet.maintenanceResponsibilities : null,
            reinstatementCategories: contextStreet.recordType < 4 ? contextStreet.reinstatementCategories : null,
            specialDesignations: contextStreet.recordType < 4 ? contextStreet.specialDesignations : null,
          };

    if (newStreetData) {
      updateMapStreetData(
        newStreetData,
        settingsContext.isScottish && newStreetData && newStreetData.recordType < 4
          ? newStreetData.maintenanceResponsibilities
          : null,
        settingsContext.isScottish && newStreetData && newStreetData.recordType < 4
          ? newStreetData.reinstatementCategories
          : null,
        settingsContext.isScottish && newStreetData && newStreetData.recordType < 4
          ? newStreetData.specialDesignations
          : null,
        !settingsContext.isScottish && HasASD() && newStreetData && newStreetData.recordType < 4
          ? newStreetData.interests
          : null,
        !settingsContext.isScottish && HasASD() && newStreetData && newStreetData.recordType < 4
          ? newStreetData.constructions
          : null,
        !settingsContext.isScottish && HasASD() && newStreetData && newStreetData.recordType < 4
          ? newStreetData.specialDesignations
          : null,
        !settingsContext.isScottish && HasASD() && newStreetData && newStreetData.recordType < 4
          ? newStreetData.heightWidthWeights
          : null,
        !settingsContext.isScottish && HasASD() && newStreetData && newStreetData.recordType < 4
          ? newStreetData.publicRightOfWays
          : null,
        settingsContext.isScottish,
        mapContext,
        lookupContext.currentLookups
      );

      setStreetData(newStreetData);
    }
  };

  /**
   * Event to handle when an error has occurred when trying to divide an ESU.
   *
   * @param {string} typeOfError The type of error that has occurred.
   */
  const handleDivideError = (typeOfError) => {
    if (typeOfError) {
      alertType.current = typeOfError;
      setAlertOpen(true);
    }
  };

  /**
   * Event to handle deleting multiple ESUs
   *
   * @param {array|null} esuIds The list of ESI ids that the user want to delete.
   */
  const handleMultiDeleteEsu = (esuIds) => {
    if (esuIds && esuIds.length > 0) {
      const today = GetCurrentDate(false);

      const deleteEsus = streetData.esus
        .filter((x) => esuIds.includes(x.pkId))
        .map((esu) => {
          esu.changeType = "D";
          esu.esuEndDate = today;
          esu.highwayDedications.map((highwayDedication) => {
            highwayDedication.changeType = "D";
            highwayDedication.recordEndDate = today;
            return highwayDedication;
          });
          esu.oneWayExemptions.map((oneWayExemption) => {
            oneWayExemption.changeType = "D";
            oneWayExemption.recordEndDate = today;
            return oneWayExemption;
          });
          return esu;
        });

      if (deleteEsus && deleteEsus.length > 0) {
        const esuDeleted = streetData.esus.map(
          (x) => deleteEsus.filter((x) => x.pkId > 0).find((rec) => rec.pkId === x.pkId) || x
        );

        setAssociatedStreetData(
          esuDeleted,
          streetData.successorCrossRefs,
          streetData.streetDescriptors,
          streetData.streetNotes,
          streetData.maintenanceResponsibilities,
          streetData.reinstatementCategories,
          settingsContext.isScottish ? streetData.specialDesignations : null,
          streetData.interests,
          streetData.constructions,
          !settingsContext.isScottish ? streetData.specialDesignations : null,
          streetData.publicRightOfWays,
          streetData.heightWidthWeights
        );
      }
    }
  };

  /**
   * Event to handle deleting a highway dedication record from an ESU record.
   *
   * @param {number} esuId The id for the ESU record that the highway dedication record is attached to.
   * @param {number} pkId The id of the highway dedication record the user want to delete.
   */
  const handleHighwayDedicationDeleted = (esuId, pkId) => {
    if (esuId) {
      const currentEsu = streetData.esus.find((x) => x.esuId === esuId);
      let newHighwayDedications = currentEsu.highwayDedications.map((x) => x);

      if (currentEsu) {
        if (pkId && pkId > 0) {
          const deleteHighwayDedication = currentEsu.highwayDedications.find((x) => x.pkId === pkId);

          if (deleteHighwayDedication) {
            const deletedHighwayDedication = {
              changeType: "D",
              highwayDedicationCode: deleteHighwayDedication.highwayDedicationCode,
              recordEndDate: GetCurrentDate(false),
              hdStartDate: deleteHighwayDedication.hdStartDate,
              hdEndDate: deleteHighwayDedication.hdEndDate,
              hdSeasonalStartDate: deleteHighwayDedication.hdSeasonalStartDate,
              hdSeasonalEndDate: deleteHighwayDedication.hdSeasonalEndDate,
              hdStartTime: deleteHighwayDedication.hdStartTime,
              hdEndTime: deleteHighwayDedication.hdEndTime,
              hdProw: deleteHighwayDedication.hdProw,
              hdNcr: deleteHighwayDedication.hdNcr,
              hdQuietRoute: deleteHighwayDedication.hdQuietRoute,
              hdObstruction: deleteHighwayDedication.hdObstruction,
              hdPlanningOrder: deleteHighwayDedication.hdPlanningOrder,
              hdVehiclesProhibited: deleteHighwayDedication.hdVehiclesProhibited,
              pkId: deleteHighwayDedication.pkId,
              esuId: deleteHighwayDedication.esuId,
              seqNum: deleteHighwayDedication.seqNum,
            };

            newHighwayDedications = currentEsu.highwayDedications.map(
              (x) => [deletedHighwayDedication].find((rec) => rec.pkId === x.pkId) || x
            );
          }
        } else if (pkId && pkId < 0) {
          newHighwayDedications = currentEsu.highwayDedications.filter((x) => x.pkId !== pkId);
        }

        const updatedEsu = {
          entryDate: currentEsu.entryDate,
          pkId: currentEsu.pkId,
          changeType: currentEsu.changeType,
          esuId: currentEsu.esuId,
          esuVersionNumber: currentEsu.esuVersionNumber,
          numCoordCount: currentEsu.numCoordCount,
          esuTolerance: currentEsu.esuTolerance,
          esuStartDate: currentEsu.esuStartDate,
          esuEndDate: currentEsu.esuEndDate,
          esuDirection: currentEsu.esuDirection,
          wktGeometry: currentEsu.wktGeometry,
          assignUnassign: currentEsu.assignUnassign,
          highwayDedications: newHighwayDedications,
          oneWayExemptions: currentEsu.oneWayExemptions,
        };
        const newEsus = streetData.esus.map((x) => [updatedEsu].find((rec) => rec.esuId === x.esuId) || x);

        setAssociatedStreetData(
          newEsus,
          null,
          streetData.streetDescriptors,
          streetData.streetNotes,
          null,
          null,
          null,
          streetData.interests,
          streetData.constructions,
          streetData.specialDesignations,
          streetData.publicRightOfWays,
          streetData.heightWidthWeights
        );
      }
    }
  };

  /**
   * Event to handle deleting an one-way exemption record from an ESU record.
   *
   * @param {number} esuId The id for the ESU record that the one-way exemption record is attached to.
   * @param {number} pkId The id of the one-way exemption record the user want to delete.
   */
  const handleOneWayExceptionDeleted = (esuId, pkId) => {
    if (esuId) {
      const currentEsu = streetData.esus.find((x) => x.esuId === esuId);
      let newOneWayExceptions = currentEsu.oneWayExceptions.map((x) => x);

      if (currentEsu) {
        if (pkId && pkId > 0) {
          const deleteOneWayException = currentEsu.oneWayExceptions.find((x) => x.pkId === pkId);

          if (deleteOneWayException) {
            const deletedOneWayException = {
              changeType: "D",
              oneWayExemptionTypeCode: deleteOneWayException.oneWayExemptionTypeCode,
              recordEndDate: GetCurrentDate(false),
              oneWayExemptionStartDate: deleteOneWayException.oneWayExemptionStartDate,
              oneWayExemptionEndDate: deleteOneWayException.oneWayExemptionEndDate,
              oneWayExemptionStartTime: deleteOneWayException.oneWayExemptionStartTime,
              oneWayExemptionEndTime: deleteOneWayException.oneWayExemptionEndTime,
              oneWayExemptionPeriodicityCode: deleteOneWayException.oneWayExemptionPeriodicityCode,
              pkId: deleteOneWayException.pkId,
              esuId: deleteOneWayException.esuId,
              sequenceNumber: deleteOneWayException.sequenceNumber,
            };

            newOneWayExceptions = currentEsu.oneWayExceptions.map(
              (x) => [deletedOneWayException].find((rec) => rec.pkId === x.pkId) || x
            );
          }
        } else if (pkId && pkId < 0) {
          newOneWayExceptions = currentEsu.oneWayExceptions.filter((x) => x.pkId !== pkId);
        }

        const updatedEsu = {
          entryDate: currentEsu.entryDate,
          pkId: currentEsu.pkId,
          changeType: currentEsu.changeType,
          esuId: currentEsu.esuId,
          esuVersionNumber: currentEsu.esuVersionNumber,
          numCoordCount: currentEsu.numCoordCount,
          esuTolerance: currentEsu.esuTolerance,
          esuStartDate: currentEsu.esuStartDate,
          esuEndDate: currentEsu.esuEndDate,
          esuDirection: currentEsu.esuDirection,
          wktGeometry: currentEsu.wktGeometry,
          assignUnassign: currentEsu.assignUnassign,
          highwayDedications: currentEsu.highwayDedications,
          oneWayExemptions: newOneWayExceptions,
        };
        const newEsus = streetData.esus.map((x) => [updatedEsu].find((rec) => rec.esuId === x.esuId) || x);

        setAssociatedStreetData(
          newEsus,
          null,
          streetData.streetDescriptors,
          streetData.streetNotes,
          null,
          null,
          null,
          streetData.interests,
          streetData.constructions,
          streetData.specialDesignations,
          streetData.publicRightOfWays,
          streetData.heightWidthWeights
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
      const deleteSuccessorCrossRef = streetData.successorCrossRefs.find((x) => x.pkId === pkId);

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

        const newSuccessorCrossRefs = streetData.successorCrossRefs.map(
          (x) => [deletedSuccessorCrossRef].find((rec) => rec.pkId === x.pkId) || x
        );

        setAssociatedStreetData(
          streetData.esus,
          newSuccessorCrossRefs,
          streetData.streetDescriptors,
          streetData.streetNotes,
          streetData.maintenanceResponsibilities,
          streetData.reinstatementCategories,
          streetData.specialDesignations,
          null,
          null,
          null,
          null,
          null
        );
      }
    } else if (pkId && pkId < 0) {
      const newSuccessorCrossRefs = streetData.successorCrossRefs.filter((x) => x.pkId !== pkId);
      setAssociatedStreetData(
        streetData.esus,
        newSuccessorCrossRefs,
        streetData.streetDescriptors,
        streetData.streetNotes,
        streetData.maintenanceResponsibilities,
        streetData.reinstatementCategories,
        streetData.specialDesignations,
        null,
        null,
        null,
        null,
        null
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
      const deleteSuccessorCrossRefs = streetData.successorCrossRefs
        .filter((x) => successorCrossRefIds.includes(x.pkId))
        .map((successorCrossRef) => {
          successorCrossRef.changeType = "D";
          return successorCrossRef;
        });

      if (deleteSuccessorCrossRefs && deleteSuccessorCrossRefs.length > 0) {
        const successorCrossRefDeleted = streetData.successorCrossRefs.map(
          (x) => deleteSuccessorCrossRefs.filter((x) => x.pkId > 0).find((rec) => rec.pkId === x.pkId) || x
        );

        setAssociatedStreetData(
          streetData.esus,
          successorCrossRefDeleted,
          streetData.streetDescriptors,
          streetData.streetNotes,
          streetData.maintenanceResponsibilities,
          streetData.reinstatementCategories,
          streetData.specialDesignations,
          null,
          null,
          null,
          null,
          null
        );
      }
    }
  };

  /**
   * Event to handle deleting a maintenance responsibility record
   *
   * @param {number} pkId The id of the maintenance responsibility record that the user wants to delete.
   */
  const handleMaintenanceResponsibilityDeleted = (pkId) => {
    let newMaintenanceResponsibilities = streetData.maintenanceResponsibilities.map((x) => x);

    if (pkId && pkId > 0) {
      const deleteMaintenanceResponsibility = streetData.maintenanceResponsibilities.find((x) => x.pkId === pkId);

      if (deleteMaintenanceResponsibility) {
        const deletedMaintenanceResponsibility = {
          usrn: deleteMaintenanceResponsibility.usrn,
          wholeRoad: deleteMaintenanceResponsibility.wholeRoad,
          specificLocation: deleteMaintenanceResponsibility.specificLocation,
          neverExport: deleteMaintenanceResponsibility.neverExport,
          pkId: deleteMaintenanceResponsibility.pkId,
          seqNum: deleteMaintenanceResponsibility.seqNum,
          changeType: "D",
          custodianCode: deleteMaintenanceResponsibility.custodianCode,
          maintainingAuthorityCode: deleteMaintenanceResponsibility.maintainingAuthorityCode,
          streetStatus: deleteMaintenanceResponsibility.streetStatus,
          state: deleteMaintenanceResponsibility.state,
          startDate: deleteMaintenanceResponsibility.startDate,
          endDate: GetCurrentDate(false),
          wktGeometry: deleteMaintenanceResponsibility.wktGeometry,
        };

        newMaintenanceResponsibilities = streetData.maintenanceResponsibilities.map(
          (x) => [deletedMaintenanceResponsibility].find((rec) => rec.pkId === x.pkId) || x
        );
      }
    } else if (pkId && pkId < 0) {
      newMaintenanceResponsibilities = streetData.maintenanceResponsibilities.filter((x) => x.pkId !== pkId);
    }

    setAssociatedStreetData(
      streetData.esus,
      streetData.successorCrossRefs,
      streetData.streetDescriptors,
      streetData.streetNotes,
      newMaintenanceResponsibilities,
      streetData.reinstatementCategories,
      streetData.specialDesignations,
      null,
      null,
      null,
      null,
      null
    );
  };

  /**
   * Event to handle deleting a reinstatement category record
   *
   * @param {number} pkId The id of the reinstatement category record that the user wants to delete.
   */
  const handleReinstatementCategoryDeleted = (pkId) => {
    let newReinstatementCategories = streetData.reinstatementCategories.map((x) => x);

    if (pkId && pkId > 0) {
      const deleteReinstatementCategory = streetData.reinstatementCategories.find((x) => x.pkId === pkId);

      if (deleteReinstatementCategory) {
        const deletedReinstatementCategory = {
          usrn: deleteReinstatementCategory.usrn,
          wholeRoad: deleteReinstatementCategory.wholeRoad,
          specificLocation: deleteReinstatementCategory.specificLocation,
          neverExport: deleteReinstatementCategory.neverExport,
          pkId: deleteReinstatementCategory.pkId,
          seqNum: deleteReinstatementCategory.seqNum,
          changeType: "D",
          custodianCode: deleteReinstatementCategory.custodianCode,
          reinstatementAuthorityCode: deleteReinstatementCategory.reinstatementAuthorityCode,
          reinstatementCategoryCode: deleteReinstatementCategory.reinstatementCategoryCode,
          state: deleteReinstatementCategory.state,
          startDate: deleteReinstatementCategory.startDate,
          endDate: GetCurrentDate(false),
          wktGeometry: deleteReinstatementCategory.wktGeometry,
        };

        newReinstatementCategories = streetData.reinstatementCategories.map(
          (x) => [deletedReinstatementCategory].find((rec) => rec.pkId === x.pkId) || x
        );
      }
    } else if (pkId && pkId < 0) {
      newReinstatementCategories = streetData.reinstatementCategories.filter((x) => x.pkId !== pkId);
    }

    setAssociatedStreetData(
      streetData.esus,
      streetData.successorCrossRefs,
      streetData.streetDescriptors,
      streetData.streetNotes,
      streetData.maintenanceResponsibilities,
      newReinstatementCategories,
      streetData.specialDesignations,
      null,
      null,
      null,
      null,
      null
    );
  };

  /**
   * Event to handle deleting a (OneScotland) special designation record
   *
   * @param {number} pkId The id of the special designation record that the user wants to delete.
   */
  const handleOSSpecialDesignationDeleted = (pkId) => {
    let newSpecialDesignations = streetData.specialDesignations.map((x) => x);

    if (pkId && pkId > 0) {
      const deleteSpecialDesignation = streetData.specialDesignations.find((x) => x.pkId === pkId);

      if (deleteSpecialDesignation) {
        const deletedSpecialDesignation = {
          usrn: deleteSpecialDesignation.usrn,
          wholeRoad: deleteSpecialDesignation.wholeRoad,
          specificLocation: deleteSpecialDesignation.specificLocation,
          neverExport: deleteSpecialDesignation.neverExport,
          pkId: deleteSpecialDesignation.pkId,
          seqNum: deleteSpecialDesignation.seqNum,
          changeType: "D",
          custodianCode: deleteSpecialDesignation.custodianCode,
          authorityCode: deleteSpecialDesignation.authorityCode,
          specialDesig: deleteSpecialDesignation.specialDesig,
          wktGeometry: deleteSpecialDesignation.wktGeometry,
          description: deleteSpecialDesignation.description,
          state: deleteSpecialDesignation.state,
          startDate: deleteSpecialDesignation.startDate,
          endDate: GetCurrentDate(false),
        };

        newSpecialDesignations = streetData.specialDesignations.map(
          (x) => [deletedSpecialDesignation].find((rec) => rec.pkId === x.pkId) || x
        );
      }
    } else if (pkId && pkId < 0) {
      newSpecialDesignations = streetData.specialDesignations.filter((x) => x.pkId !== pkId);
    }

    setAssociatedStreetData(
      streetData.esus,
      streetData.successorCrossRefs,
      streetData.streetDescriptors,
      streetData.streetNotes,
      streetData.maintenanceResponsibilities,
      streetData.reinstatementCategories,
      newSpecialDesignations,
      null,
      null,
      null,
      null,
      null
    );
  };

  /**
   * Event to handle deleting an interest record
   *
   * @param {number} pkId The id of the interest record that the user wants to delete.
   */
  const handleInterestedDeleted = (pkId) => {
    let newInterests = streetData.interests.map((x) => x);

    if (pkId && pkId > 0) {
      const deleteInterest = streetData.interests.find((x) => x.pkId === pkId);

      if (deleteInterest) {
        const deletedInterest = {
          changeType: "D",
          usrn: deleteInterest.usrn,
          seqNum: deleteInterest.seqNum,
          wholeRoad: deleteInterest.wholeRoad,
          specificLocation: deleteInterest.specificLocation,
          neverExport: deleteInterest.neverExport,
          swaOrgRefAuthority: deleteInterest.swaOrgRefAuthority,
          districtRefAuthority: deleteInterest.districtRefAuthority,
          recordStartDate: deleteInterest.recordStartDate,
          recordEndDate: GetCurrentDate(false),
          asdCoordinate: deleteInterest.asdCoordinate,
          asdCoordinateCount: deleteInterest.asdCoordinateCount,
          swaOrgRefAuthMaintaining: deleteInterest.swaOrgRefAuthMaintaining,
          streetStatus: deleteInterest.streetStatus,
          interestType: deleteInterest.interestType,
          startX: deleteInterest.startX,
          startY: deleteInterest.startY,
          endX: deleteInterest.endX,
          endY: deleteInterest.endY,
          pkId: deleteInterest.pkId,
          entryDate: deleteInterest.entryDate,
          lastUpdateDate: deleteInterest.lastUpdateDate,
          wktGeometry: deleteInterest.wktGeometry,
        };

        newInterests = streetData.interests.map((x) => [deletedInterest].find((rec) => rec.pkId === x.pkId) || x);
      }
    } else if (pkId && pkId < 0) {
      newInterests = streetData.interests.filter((x) => x.pkId !== pkId);
    }

    setAssociatedStreetData(
      streetData.esus,
      null,
      streetData.streetDescriptors,
      streetData.streetNotes,
      null,
      null,
      null,
      newInterests,
      streetData.constructions,
      streetData.specialDesignations,
      streetData.publicRightOfWays,
      streetData.heightWidthWeights
    );
  };

  /**
   * Event to handle deleting a construction record
   *
   * @param {number} pkId The id of the construction record that the user wants to delete.
   */
  const handleConstructionDeleted = (pkId) => {
    let newConstructions = streetData.constructions.map((x) => x);

    if (pkId && pkId > 0) {
      const deleteConstruction = streetData.constructions.find((x) => x.pkId === pkId);

      if (deleteConstruction) {
        const deletedConstruction = {
          changeType: "D",
          usrn: deleteConstruction.usrn,
          seqNum: deleteConstruction.seqNum,
          wholeRoad: deleteConstruction.wholeRoad,
          specificLocation: deleteConstruction.specificLocation,
          neverExport: deleteConstruction.neverExport,
          recordStartDate: deleteConstruction.recordStartDate,
          recordEndDate: GetCurrentDate(false),
          reinstatementTypeCode: deleteConstruction.reinstatementTypeCode,
          constructionType: deleteConstruction.constructionType,
          aggregateAbrasionVal: deleteConstruction.aggregateAbrasionVal,
          polishedStoneVal: deleteConstruction.polishedStoneVal,
          frostHeaveSusceptibility: deleteConstruction.frostHeaveSusceptibility,
          steppedJoint: deleteConstruction.steppedJoint,
          asdCoordinate: deleteConstruction.asdCoordinate,
          asdCoordinateCount: deleteConstruction.asdCoordinateCount,
          constructionStartX: deleteConstruction.constructionStartX,
          constructionStartY: deleteConstruction.constructionStartY,
          constructionEndX: deleteConstruction.constructionEndX,
          constructionEndY: deleteConstruction.constructionEndY,
          constructionDescription: deleteConstruction.constructionDescription,
          swaOrgRefConsultant: deleteConstruction.swaOrgRefConsultant,
          districtRefConsultant: deleteConstruction.districtRefConsultant,
          pkId: deleteConstruction.pkId,
          entryDate: deleteConstruction.entryDate,
          lastUpdateDate: deleteConstruction.lastUpdateDate,
          wktGeometry: deleteConstruction.wktGeometry,
        };

        newConstructions = streetData.constructions.map(
          (x) => [deletedConstruction].find((rec) => rec.pkId === x.pkId) || x
        );
      }
    } else if (pkId && pkId < 0) {
      newConstructions = streetData.constructions.filter((x) => x.pkId !== pkId);
    }

    setAssociatedStreetData(
      streetData.esus,
      null,
      streetData.streetDescriptors,
      streetData.streetNotes,
      null,
      null,
      null,
      streetData.interests,
      newConstructions,
      streetData.specialDesignations,
      streetData.publicRightOfWays,
      streetData.heightWidthWeights
    );
  };

  /**
   * Event to handle deleting a (GeoPlace) special designation record
   *
   * @param {number} pkId The id of the special designation record that the user wants to delete.
   */
  const handleSpecialDesignationDeleted = (pkId) => {
    let newSpecialDesignations = streetData.specialDesignations.map((x) => x);

    if (pkId && pkId > 0) {
      const deleteSpecialDesignation = streetData.specialDesignations.find((x) => x.pkId === pkId);

      if (deleteSpecialDesignation) {
        const deletedSpecialDesignation = {
          changeType: "D",
          usrn: deleteSpecialDesignation.usrn,
          seqNum: deleteSpecialDesignation.seqNum,
          wholeRoad: deleteSpecialDesignation.wholeRoad,
          specificLocation: deleteSpecialDesignation.specificLocation,
          neverExport: deleteSpecialDesignation.neverExport,
          streetSpecialDesigCode: deleteSpecialDesignation.streetSpecialDesigCode,
          asdCoordinate: deleteSpecialDesignation.asdCoordinate,
          asdCoordinateCount: deleteSpecialDesignation.asdCoordinateCount,
          specialDesigPeriodicityCode: deleteSpecialDesignation.specialDesigPeriodicityCode,
          specialDesigStartX: deleteSpecialDesignation.specialDesigStartX,
          specialDesigStartY: deleteSpecialDesignation.specialDesigStartY,
          specialDesigEndX: deleteSpecialDesignation.specialDesigEndX,
          specialDesigEndY: deleteSpecialDesignation.specialDesigEndY,
          recordStartDate: deleteSpecialDesignation.recordStartDate,
          recordEndDate: GetCurrentDate(false),
          specialDesigStartDate: deleteSpecialDesignation.specialDesigStartDate,
          specialDesigEndDate: deleteSpecialDesignation.specialDesigEndDate,
          specialDesigStartTime: deleteSpecialDesignation.specialDesigStartTime,
          specialDesigEndTime: deleteSpecialDesignation.specialDesigEndTime,
          specialDesigDescription: deleteSpecialDesignation.specialDesigDescription,
          swaOrgRefConsultant: deleteSpecialDesignation.swaOrgRefConsultant,
          districtRefConsultant: deleteSpecialDesignation.districtRefConsultant,
          specialDesigSourceText: deleteSpecialDesignation.specialDesigSourceText,
          pkId: deleteSpecialDesignation.pkId,
          entryDate: deleteSpecialDesignation.entryDate,
          lastUpdateDate: deleteSpecialDesignation.lastUpdateDate,
          wktGeometry: deleteSpecialDesignation.wktGeometry,
        };

        newSpecialDesignations = streetData.specialDesignations.map(
          (x) => [deletedSpecialDesignation].find((rec) => rec.pkId === x.pkId) || x
        );
      }
    } else if (pkId && pkId < 0) {
      newSpecialDesignations = streetData.specialDesignations.filter((x) => x.pkId !== pkId);
    }

    setAssociatedStreetData(
      streetData.esus,
      null,
      streetData.streetDescriptors,
      streetData.streetNotes,
      null,
      null,
      null,
      streetData.interests,
      streetData.constructions,
      newSpecialDesignations,
      streetData.publicRightOfWays,
      streetData.heightWidthWeights
    );
  };

  /**
   * Event to handle deleting a height, width and weight restriction record
   *
   * @param {number} pkId The id of the height, width and weight restriction record that the user wants to delete.
   */
  const handleHWWDeleted = (pkId) => {
    let newHeightWidthWeights = streetData.heightWidthWeights.map((x) => x);

    if (pkId && pkId > 0) {
      const deleteHeightWidthWeight = streetData.heightWidthWeights.find((x) => x.pkId === pkId);

      if (deleteHeightWidthWeight) {
        const deletedHeightWidthWeight = {
          changeType: "D",
          usrn: deleteHeightWidthWeight.usrn,
          seqNum: deleteHeightWidthWeight.seqNum,
          wholeRoad: deleteHeightWidthWeight.wholeRoad,
          specificLocation: deleteHeightWidthWeight.specificLocation,
          neverExport: deleteHeightWidthWeight.neverExport,
          hwwRestrictionCode: deleteHeightWidthWeight.hwwRestrictionCode,
          recordStartDate: deleteHeightWidthWeight.recordStartDate,
          recordEndDate: GetCurrentDate(false),
          asdCoordinate: deleteHeightWidthWeight.asdCoordinate,
          asdCoordinateCount: deleteHeightWidthWeight.asdCoordinateCount,
          hwwStartX: deleteHeightWidthWeight.hwwStartX,
          hwwStartY: deleteHeightWidthWeight.hwwStartY,
          hwwEndX: deleteHeightWidthWeight.hwwEndX,
          hwwEndY: deleteHeightWidthWeight.hwwEndY,
          valueMetric: deleteHeightWidthWeight.valueMetric,
          troText: deleteHeightWidthWeight.troText,
          featureDescription: deleteHeightWidthWeight.featureDescription,
          sourceText: deleteHeightWidthWeight.sourceText,
          swaOrgRefConsultant: deleteHeightWidthWeight.swaOrgRefConsultant,
          districtRefConsultant: deleteHeightWidthWeight.districtRefConsultant,
          pkId: deleteHeightWidthWeight.pkId,
          entryDate: deleteHeightWidthWeight.entryDate,
          lastUpdateDate: deleteHeightWidthWeight.lastUpdateDate,
          wktGeometry: deleteHeightWidthWeight.wktGeometry,
        };

        newHeightWidthWeights = streetData.heightWidthWeights.map(
          (x) => [deletedHeightWidthWeight].find((rec) => rec.pkId === x.pkId) || x
        );
      }
    } else if (pkId && pkId < 0) {
      newHeightWidthWeights = streetData.heightWidthWeights.filter((x) => x.pkId !== pkId);
    }

    setAssociatedStreetData(
      streetData.esus,
      null,
      streetData.streetDescriptors,
      streetData.streetNotes,
      null,
      null,
      null,
      streetData.interests,
      streetData.constructions,
      streetData.specialDesignations,
      streetData.publicRightOfWays,
      newHeightWidthWeights
    );
  };

  /**
   * Event to handle deleting a public rights of way record
   *
   * @param {number} pkId The id of the public rights of way record that the user wants to delete.
   */
  const handlePRoWDeleted = (pkId) => {
    let newPublicRightOfWays = streetData.publicRightOfWays.map((x) => x);

    if (pkId && pkId > 0) {
      const deletePublicRightOfWay = streetData.publicRightOfWays.find((x) => x.pkId === pkId);

      if (deletePublicRightOfWay) {
        const deletedPublicRightOfWay = {
          changeType: "D",
          prowUsrn: deletePublicRightOfWay.prowUsrn,
          defMapGeometryType: deletePublicRightOfWay.defMapGeometryType,
          defMapGeometryCount: deletePublicRightOfWay.defMapGeometryCount,
          prowLength: deletePublicRightOfWay.prowLength,
          prowRights: deletePublicRightOfWay.prowRights,
          pedAccess: deletePublicRightOfWay.pedAccess,
          equAccess: deletePublicRightOfWay.equAccess,
          nonMotAccess: deletePublicRightOfWay.nonMotAccess,
          cycAccess: deletePublicRightOfWay.cycAccess,
          motAccess: deletePublicRightOfWay.motAccess,
          recordStartDate: deletePublicRightOfWay.recordStartDate,
          relevantStartDate: deletePublicRightOfWay.relevantStartDate,
          recordEndDate: GetCurrentDate(false),
          prowStatus: deletePublicRightOfWay.prowStatus,
          consultStartDate: deletePublicRightOfWay.consultStartDate,
          consultEndDate: deletePublicRightOfWay.consultEndDate,
          consultRef: deletePublicRightOfWay.consultRef,
          consultDetails: deletePublicRightOfWay.consultDetails,
          appealDate: deletePublicRightOfWay.appealDate,
          appealRef: deletePublicRightOfWay.appealRef,
          appealDetails: deletePublicRightOfWay.appealDetails,
          divRelatedUsrn: deletePublicRightOfWay.divRelatedUsrn,
          prowLocation: deletePublicRightOfWay.prowLocation,
          prowDetails: deletePublicRightOfWay.prowDetails,
          promotedRoute: deletePublicRightOfWay.promotedRoute,
          accessibleRoute: deletePublicRightOfWay.accessibleRoute,
          sourceText: deletePublicRightOfWay.sourceText,
          prowOrgRefConsultant: deletePublicRightOfWay.prowOrgRefConsultant,
          prowDistrictRefConsultant: deletePublicRightOfWay.prowDistrictRefConsultant,
          neverExport: deletePublicRightOfWay.neverExport,
          wktGeometry: deletePublicRightOfWay.wktGeometry,
          pkId: deletePublicRightOfWay.pkId,
          entryDate: deletePublicRightOfWay.entryDate,
          lastUpdateDate: deletePublicRightOfWay.lastUpdateDate,
        };

        newPublicRightOfWays = streetData.publicRightOfWays.map(
          (x) => [deletedPublicRightOfWay].find((rec) => rec.pkId === x.pkId) || x
        );
      }
    } else if (pkId && pkId < 0) {
      newPublicRightOfWays = streetData.publicRightOfWays.filter((x) => x.pkId !== pkId);
    }

    setAssociatedStreetData(
      streetData.esus,
      null,
      streetData.streetDescriptors,
      streetData.streetNotes,
      null,
      null,
      null,
      streetData.interests,
      streetData.constructions,
      streetData.specialDesignations,
      newPublicRightOfWays,
      streetData.heightWidthWeights
    );
  };

  /**
   * Event to handle the deleting of a note.
   *
   * @param {number} pkId The primary key for the note record.
   */
  const handleDeleteNote = (pkId) => {
    let newNotes = streetData.streetNotes.map((x) => x);

    if (pkId && pkId > 0) {
      const deleteNote = streetData.streetNotes.find((x) => x.pkId === pkId);

      if (deleteNote) {
        const deletedNote = {
          pkId: deleteNote.pkId,
          seqNo: deleteNote.seqNo,
          usrn: deleteNote.usrn,
          note: deleteNote.note,
          changeType: "D",
          lastUser: deleteNote.lastUser,
        };

        newNotes = streetData.streetNotes.map((x) => [deletedNote].find((rec) => rec.pkId === x.pkId) || x);
      }
    } else if (pkId && pkId < 0) {
      newNotes = streetData.streetNotes.filter((x) => x.pkId !== pkId);
    }

    setAssociatedStreetData(
      streetData.esus,
      streetData.successorCrossRefs,
      streetData.streetDescriptors,
      newNotes,
      streetData.maintenanceResponsibilities,
      streetData.reinstatementCategories,
      settingsContext.isScottish ? streetData.specialDesignations : null,
      streetData.interests,
      streetData.constructions,
      !settingsContext.isScottish ? streetData.specialDesignations : null,
      streetData.publicRightOfWays,
      streetData.heightWidthWeights
    );
  };

  /**
   * Method to display the copy alert
   *
   * @param {boolean} open If true the alert is displayed; otherwise it is hidden
   * @param {string} dataType The type of data that has been copied.
   */
  const handleCopyOpen = (open, dataType) => {
    copyDataType.current = dataType;
    setCopyOpen(open);
  };

  /**
   * Event to handle when the copy alert closes
   *
   * @param {object} event The event object.
   * @param {string} reason The reason the alert is closing.
   */
  const handleCopyClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setCopyOpen(false);
  };

  /**
   * Event to handle when the save alert closes
   *
   * @param {object} event The event object.
   * @param {string} reason The reason the alert is closing.
   */
  const handleSaveClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSaveOpen(false);
  };

  /**
   * Event to handle when the save button is clicked.
   *
   */
  function handleSaveClicked() {
    const associatedRecords = GetChangedAssociatedRecords("street", sandboxContext, esuChanged.current);

    const currentStreet = sandboxContext.currentSandbox.currentStreet || sandboxContext.currentSandbox.sourceStreet;

    if (associatedRecords.length > 0) {
      saveConfirmDialog(associatedRecords)
        .then((result) => {
          if (result === "save") {
            if (streetContext.validateData()) {
              failedValidation.current = false;
              const currentStreetData = GetCurrentStreetData(
                streetData,
                sandboxContext,
                lookupContext,
                settingsContext.isWelsh,
                settingsContext.isScottish
              );
              HandleStreetSave(currentStreetData);
            } else {
              failedValidation.current = true;
              saveResult.current = false;
              setSaveOpen(true);
            }
          } else if (result === "discard") {
            updateSaveButton(true);
            saveResult.current = true;
            ResetContexts("street", true, mapContext, streetContext, propertyContext, sandboxContext);
            if (streetContext.currentStreet.newStreet) {
              streetContext.resetStreet();
              mapContext.onSearchDataChange([], [], null, null);
              mapContext.onEditMapObject(null, null);

              history.push(GazetteerRoute);
            } else {
              updateMapStreetData(
                streetData,
                settingsContext.isScottish && streetData && streetData.recordType < 4
                  ? streetData.maintenanceResponsibilities
                  : null,
                settingsContext.isScottish && streetData && streetData.recordType < 4
                  ? streetData.reinstatementCategories
                  : null,
                settingsContext.isScottish && streetData && streetData.recordType < 4
                  ? streetData.specialDesignations
                  : null,
                !settingsContext.isScottish && HasASD() && streetData && streetData.recordType < 4
                  ? streetData.interests
                  : null,
                !settingsContext.isScottish && HasASD() && streetData && streetData.recordType < 4
                  ? streetData.constructions
                  : null,
                !settingsContext.isScottish && HasASD() && streetData && streetData.recordType < 4
                  ? streetData.specialDesignations
                  : null,
                !settingsContext.isScottish && HasASD() && streetData && streetData.recordType < 4
                  ? streetData.heightWidthWeights
                  : null,
                !settingsContext.isScottish && HasASD() && streetData && streetData.recordType < 4
                  ? streetData.publicRightOfWays
                  : null,
                settingsContext.isScottish,
                mapContext,
                lookupContext.currentLookups
              );
            }
          }
        })
        .catch(() => {});
    } else HandleStreetSave(currentStreet);

    esuChanged.current = false;
  }

  /**
   * Event that handles the saving of the current street.
   *
   * @param {object} currentStreet The current street data.
   */
  function HandleStreetSave(currentStreet) {
    SaveStreet(
      currentStreet,
      streetContext,
      userContext,
      lookupContext,
      searchContext,
      mapContext,
      sandboxContext,
      settingsContext.isScottish,
      settingsContext.isWelsh
    ).then((result) => {
      if (result) {
        setStreetData(result);
        sandboxContext.onUpdateAndClear("sourceStreet", result, "allStreet");
        currentStreetAsdData.current = null;
        streetContext.onEsuDividedMerged(false);

        updateSaveButton(true);
        saveResult.current = true;
        setSaveOpen(true);
      } else {
        saveResult.current = false;
        setSaveOpen(true);
      }
    });
  }

  /**
   * Event to handle when the associated record data has been changed.
   *
   */
  const handleAssociatedRecordDataChanged = () => {
    updateSaveButton(false);
  };

  /**
   * Event to handle when the ESU record data has been changed.
   *
   */
  const handleEsuDataChanged = () => {
    esuChanged.current = true;
    updateSaveButton(false);
  };

  /**
   * Event to handle when a user clicks the home button from the descriptor tab.
   *
   * @param {string} action The action that needs to take place when the home button was clicked
   * @param {object} srcData The original state of the data.
   * @param {object} currentData The current state of the data.
   * @returns {boolean} True if the validation check has failed; otherwise false.
   */
  const handleDescriptorHomeClick = (action, srcData, currentData) => {
    const discardChanges = (checkData) => {
      if (checkData && checkData.pkId < 0 && !streetContext.currentStreet.newStreet) {
        // If user has added a new record and then clicked Discard/Cancel remove the record from the array if not a new street.
        const restoredDescriptors = streetData.streetDescriptors.filter((x) => x.pkId !== checkData.pkId);

        if (restoredDescriptors)
          setAssociatedStreetData(
            streetData.esus,
            streetData.successorCrossRefs,
            restoredDescriptors,
            streetData.streetNotes,
            streetData.maintenanceResponsibilities,
            streetData.reinstatementCategories,
            settingsContext.isScottish ? streetData.specialDesignations : null,
            streetData.interests,
            streetData.constructions,
            !settingsContext.isScottish ? streetData.specialDesignations : null,
            streetData.publicRightOfWays,
            streetData.heightWidthWeights
          );
      }

      failedValidation.current = true;
      sandboxContext.onSandboxChange("streetDescriptor", null);
      handleDescriptorSelected(-1, null, null, null);
    };

    failedValidation.current = false;

    switch (action) {
      case "check":
        const dataHasChanged =
          currentData.pkId < 0 ||
          !ObjectComparison(srcData, currentData, [
            "changeType",
            "locality",
            "town",
            "island",
            "administrativeArea",
            "lastUpdated",
            "insertedTimestamp",
            "insertedUser",
            "lastUser",
          ]);

        if (dataHasChanged) {
          confirmDialog(true)
            .then((result) => {
              if (result === "save") {
                if (streetContext.validateData()) {
                  failedValidation.current = false;
                  updateDescriptorData(currentData);
                  updateSaveButton(false);
                  handleDescriptorSelected(-1, null, null, null);
                } else {
                  failedValidation.current = true;
                  saveResult.current = false;
                  setSaveOpen(true);
                }
              } else {
                discardChanges(currentData ? currentData : null);
              }
            })
            .catch(() => {});
        } else {
          sandboxContext.onSandboxChange("streetDescriptor", null);
          handleDescriptorSelected(-1, null, null, null);
        }
        break;

      case "save":
        if (streetContext.validateData()) {
          failedValidation.current = false;
          updateDescriptorData(currentData);
          updateSaveButton(false);
          handleDescriptorSelected(-1, null, null, null);
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
   * Event to handle validation of the ESU data.
   *
   * @param {object} srcData The original state of the data.
   * @param {object} currentData The current state of the data.
   * @returns {boolean} True if the validation check has failed; otherwise false.
   */
  const handleEsuValidateData = (srcData, currentData) => {
    if (!currentData) return true;

    const dataHasChanged =
      currentData.pkId < 0 ||
      !ObjectComparison(srcData, currentData, [
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
      ]);

    if (dataHasChanged) {
      if (streetContext.validateData()) {
        failedValidation.current = false;
        currentEsuFormData.current = {
          pkId: esuFormData.pkId,
          esuData: sandboxContext.currentSandbox.currentStreetRecords.esu
            ? sandboxContext.currentSandbox.currentStreetRecords.esu
            : esuFormData.esuData,
          index: esuFormData.index,
          totalRecords: esuFormData.totalRecords,
        };
        updateEsuData(currentData);
      } else {
        failedValidation.current = true;
      }
    } else {
      failedValidation.current = false;
    }

    return !failedValidation.current;
  };

  /**
   * Event to handle when a user clicks on the home button from the ESU tab.
   *
   * @param {string} action The action to take.
   * @param {object} srcData The original state of the data
   * @param {object} currentData The current state of the data.
   * @returns {boolean} True if the validation check failed; otherwise false.
   */
  const handleEsuHomeClick = (action, srcData, currentData) => {
    const discardChanges = (checkData) => {
      if (
        checkData &&
        checkData.pkId < 0 &&
        !mergedDividedEsus.current.length &&
        mergedDividedEsus.current.includes(checkData.pkId)
      ) {
        // If user has added a new record and then clicked Discard/Cancel remove the record from the array.
        const restoredEsus = streetData.esus.filter((x) => x.pkId !== checkData.pkId);

        if (restoredEsus)
          setAssociatedStreetData(
            restoredEsus,
            streetData.successorCrossRefs,
            streetData.streetDescriptors,
            streetData.streetNotes,
            streetData.maintenanceResponsibilities,
            streetData.reinstatementCategories,
            settingsContext.isScottish ? streetData.specialDesignations : null,
            streetData.interests,
            streetData.constructions,
            !settingsContext.isScottish ? streetData.specialDesignations : null,
            streetData.publicRightOfWays,
            streetData.heightWidthWeights
          );
      }

      failedValidation.current = true;
      esuChanged.current = false;
      sandboxContext.onSandboxChange("esu", null);
      handleEsuSelected(-1, null, null);
    };

    informationContext.onClearInformation();

    failedValidation.current = false;

    switch (action) {
      case "check":
        const dataHasChanged =
          currentData.pkId < 0 ||
          !ObjectComparison(srcData, currentData, [
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
          ]);

        if (dataHasChanged) {
          confirmDialog(true)
            .then((result) => {
              if (result === "save") {
                if (streetContext.validateData()) {
                  failedValidation.current = false;
                  esuChanged.current = false;
                  updateEsuData(currentData);
                  updateSaveButton(false);
                  handleEsuSelected(-1, null, null);
                } else {
                  failedValidation.current = true;
                  saveResult.current = false;
                  setSaveOpen(true);
                }
              } else {
                discardChanges(currentData ? currentData : null);
              }
            })
            .catch(() => {});
        } else {
          esuChanged.current = false;
          sandboxContext.onSandboxChange("esu", null);
          handleEsuSelected(-1, null, null);
        }
        break;

      case "save":
        if (streetContext.validateData()) {
          failedValidation.current = false;
          esuChanged.current = false;
          updateEsuData(currentData);
          updateSaveButton(false);
          handleEsuSelected(-1, null, null);
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
   * Event to handle when a user clicks on the home button from the highway dedication tab.
   *
   * @param {string} action The action to take when the home button is clicked.
   * @param {object} srcData The original state of the data.
   * @param {object} currentData The current state of the data.
   * @returns {boolean} True if the validation check has failed; otherwise false.
   */
  const handleHighwayDedicationHomeClick = (action, srcData, currentData) => {
    const discardChanges = () => {
      failedValidation.current = true;
      sandboxContext.onSandboxChange("highwayDedication", null);
      if (currentEsuFormData.current) resetEsuData();
      else if (currentStreetEsuData.current) resetStreetEsuData();
      else handleEsuSelected(-1, null, null);
    };

    failedValidation.current = false;

    switch (action) {
      case "check":
        const dataHasChanged =
          currentData.pkId < 0 ||
          !ObjectComparison(srcData, currentData, [
            "changeType",
            "lastUpdated",
            "insertedTimestamp",
            "insertedUser",
            "lastUser",
          ]);

        if (dataHasChanged) {
          confirmDialog(true)
            .then((result) => {
              if (result === "save") {
                if (streetContext.validateData()) {
                  failedValidation.current = false;
                  updateHighwayDedicationData(currentData);
                  updateSaveButton(false);
                  if (currentEsuFormData.current) resetEsuData();
                  else handleEsuSelected(-1, null, null);
                } else {
                  failedValidation.current = true;
                  saveResult.current = false;
                  setSaveOpen(true);
                }
              } else {
                discardChanges();
              }
            })
            .catch(() => {});
        } else {
          sandboxContext.onSandboxChange("highwayDedication", null);
          if (currentEsuFormData.current) resetEsuData();
          else if (currentStreetEsuData.current) resetStreetEsuData();
          else handleEsuSelected(-1, null, null);
        }
        break;

      case "save":
        if (streetContext.validateData()) {
          failedValidation.current = false;
          updateHighwayDedicationData(currentData);
          updateSaveButton(false);
          if (currentEsuFormData.current) resetEsuData();
          else handleEsuSelected(-1, null, null);
        } else {
          failedValidation.current = true;
          saveResult.current = false;
          setSaveOpen(true);
        }
        break;

      default:
        discardChanges();
        break;
    }

    return failedValidation.current;
  };

  /**
   * Event to handle when a user clicks on the home button from the one-way exemption tab.
   *
   * @param {string} action The action to take when the home button is clicked.
   * @param {object} srcData The original state of the data.
   * @param {object} currentData The current state of the data.
   * @returns {boolean} True if the validation check failed; otherwise false.
   */
  const handleOneWayExemptionHomeClick = (action, srcData, currentData) => {
    const discardChanges = () => {
      failedValidation.current = true;
      sandboxContext.onSandboxChange("oneWayExemption", null);
      if (currentEsuFormData.current) resetEsuData();
      else if (currentStreetEsuData.current) resetStreetEsuData();
      else handleEsuSelected(-1, null, null);
    };

    failedValidation.current = false;

    switch (action) {
      case "check":
        const dataHasChanged =
          currentData.pkId < 0 ||
          !ObjectComparison(srcData, currentData, [
            "changeType",
            "lastUpdated",
            "insertedTimestamp",
            "insertedUser",
            "lastUser",
          ]);

        if (dataHasChanged) {
          confirmDialog(true)
            .then((result) => {
              if (result === "save") {
                if (streetContext.validateData()) {
                  failedValidation.current = false;
                  updateOneWayExemptionData(currentData);
                  updateSaveButton(false);
                  if (currentEsuFormData.current) resetEsuData();
                  else handleEsuSelected(-1, null, null);
                } else {
                  failedValidation.current = true;
                  saveResult.current = false;
                  setSaveOpen(true);
                }
              } else {
                discardChanges();
              }
            })
            .catch(() => {});
        } else {
          sandboxContext.onSandboxChange("oneWayExemption", null);
          if (currentEsuFormData.current) resetEsuData();
          else if (currentStreetEsuData.current) resetStreetEsuData();
          else handleEsuSelected(-1, null, null);
        }
        break;

      case "save":
        if (streetContext.validateData()) {
          failedValidation.current = false;
          updateOneWayExemptionData(currentData);
          updateSaveButton(false);
          if (currentEsuFormData.current) resetEsuData();
          else handleEsuSelected(-1, null, null);
        } else {
          failedValidation.current = true;
          saveResult.current = false;
          setSaveOpen(true);
        }
        break;

      default:
        discardChanges();
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
        const restoredSuccessorCrossRefs = streetData.successorCrossRefs.filter((x) => x.pkId !== checkPkID);

        if (restoredSuccessorCrossRefs)
          setAssociatedStreetData(
            streetData.esus,
            restoredSuccessorCrossRefs,
            streetData.streetDescriptors,
            streetData.streetNotes,
            streetData.maintenanceResponsibilities,
            streetData.reinstatementCategories,
            streetData.specialDesignations,
            null,
            null,
            null,
            null,
            null
          );
      }

      sandboxContext.onSandboxChange("successorCrossRef", null);
      handleSuccessorCrossRefSelected(-1, null, null, null);
    };

    failedValidation.current = false;

    switch (action) {
      case "check":
        const dataHasChanged =
          currentData.pkId < 0 || !ObjectComparison(srcData, currentData, ["changeType", "entryDate", "id", "pkId"]);

        if (dataHasChanged) {
          confirmDialog(true)
            .then((result) => {
              if (result === "save") {
                if (propertyContext.validateData()) {
                  failedValidation.current = false;
                  updateSuccessorCrossRefData(currentData);
                  updateSaveButton(false);
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
          sandboxContext.onSandboxChange("successorCrossRef", null);
          handleSuccessorCrossRefSelected(-1, null, null, null);
        }
        break;

      case "save":
        if (propertyContext.validateData()) {
          failedValidation.current = false;
          updateSuccessorCrossRefData(currentData);
          updateSaveButton(false);
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
   * Event to handle when a user clicks on the home button from the maintenance responsibility tab.
   *
   * @param {string} action The action to take when the home button is clicked.
   * @param {object} srcData The original state of the data.
   * @param {object} currentData The current state of the data.
   * @return {boolean} True if the validation check failed; otherwise false.
   */
  const handleMaintenanceResponsibilityHomeClick = (action, srcData, currentData) => {
    const discardChanges = (checkData) => {
      if (checkData && checkData.pkId < 0) {
        // If user has added a new record and then clicked Discard/Cancel remove the record from the array.
        const restoredMaintenanceResponsibilities = streetData.maintenanceResponsibilities.filter(
          (x) => x.pkId !== checkData.pkId
        );

        if (restoredMaintenanceResponsibilities)
          setAssociatedStreetData(
            streetData.esus,
            streetData.successorCrossRefs,
            streetData.streetDescriptors,
            streetData.streetNotes,
            restoredMaintenanceResponsibilities,
            streetData.reinstatementCategories,
            streetData.specialDesignations,
            null,
            null,
            null,
            null,
            null
          );
      }
      failedValidation.current = true;
      sandboxContext.onSandboxChange("maintenanceResponsibility", null);
      if (currentStreetAsdData.current) resetStreetAsdData();
      else handleAsdHomeClick();
    };

    failedValidation.current = false;

    switch (action) {
      case "check":
        const dataHasChanged =
          currentData.pkId < 0 ||
          !ObjectComparison(srcData, currentData, [
            "changeType",
            "recordEntryDate",
            "recordEndDate",
            "lastUpdated",
            "insertedTimestamp",
            "insertedUser",
            "lastUser",
          ]);

        if (dataHasChanged) {
          confirmDialog(true)
            .then((result) => {
              if (result === "save") {
                if (streetContext.validateData()) {
                  failedValidation.current = false;
                  updateMaintenanceResponsibilityData(currentData);
                  updateSaveButton(false);
                  handleAsdHomeClick();
                } else {
                  failedValidation.current = true;
                  saveResult.current = false;
                  setSaveOpen(true);
                }
              } else {
                discardChanges(currentData ? currentData : null);
              }
            })
            .catch(() => {});
        } else {
          sandboxContext.onSandboxChange("maintenanceResponsibility", null);
          if (currentStreetAsdData.current) resetStreetAsdData();
          else handleAsdHomeClick();
        }
        break;

      case "save":
        if (streetContext.validateData()) {
          failedValidation.current = false;
          updateMaintenanceResponsibilityData(currentData);
          updateSaveButton(false);
          handleAsdHomeClick();
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
   * Event to handle when a user clicks on the home button from the reinstatement category tab.
   *
   * @param {string} action The action to take when the home button is clicked.
   * @param {object} srcData The original state of the data.
   * @param {object} currentData The current state of the data.
   * @returns {boolean} True if the validation check failed; otherwise false.
   */
  const handleReinstatementCategoryHomeClick = (action, srcData, currentData) => {
    const discardChanges = (checkData) => {
      if (checkData && checkData.pkId < 0) {
        // If user has added a new record and then clicked Discard/Cancel remove the record from the array.
        const restoredReinstatementCategories = streetData.reinstatementCategories.filter(
          (x) => x.pkId !== checkData.pkId
        );

        if (restoredReinstatementCategories)
          setAssociatedStreetData(
            streetData.esus,
            streetData.successorCrossRefs,
            streetData.streetDescriptors,
            streetData.streetNotes,
            streetData.maintenanceResponsibilities,
            restoredReinstatementCategories,
            streetData.specialDesignations,
            null,
            null,
            null,
            null,
            null
          );
      }

      failedValidation.current = true;
      sandboxContext.onSandboxChange("reinstatementCategory", null);
      if (currentStreetAsdData.current) resetStreetAsdData();
      else handleAsdHomeClick();
    };

    failedValidation.current = false;

    switch (action) {
      case "check":
        const dataHasChanged =
          currentData.pkId < 0 ||
          !ObjectComparison(srcData, currentData, [
            "changeType",
            "neverExport",
            "endDate",
            "lastUpdateDate",
            "lastUpdated",
            "insertedTimestamp",
            "insertedUser",
            "lastUser",
          ]);

        if (dataHasChanged) {
          confirmDialog(true)
            .then((result) => {
              if (result === "save") {
                if (streetContext.validateData()) {
                  failedValidation.current = false;
                  updateReinstatementCategoryData(currentData);
                  updateSaveButton(false);
                  handleAsdHomeClick();
                } else {
                  failedValidation.current = true;
                  saveResult.current = false;
                  setSaveOpen(true);
                }
              } else {
                discardChanges(currentData ? currentData : null);
              }
            })
            .catch(() => {});
        } else {
          sandboxContext.onSandboxChange("reinstatementCategory", null);
          if (currentStreetAsdData.current) resetStreetAsdData();
          else handleAsdHomeClick();
        }
        break;

      case "save":
        if (streetContext.validateData()) {
          failedValidation.current = false;
          updateReinstatementCategoryData(currentData);
          updateSaveButton(false);
          handleAsdHomeClick();
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
   * Event to handle when a user clicks on the home button from the (OneScotland) special designation tab.
   *
   * @param {string} action The action to take when the home button is clicked.
   * @param {object} srcData The original state of the data.
   * @param {object} currentData The current state of the data.
   * @returns {boolean} True if the validation check failed; otherwise false.
   */
  const handleOSSpecialDesignationHomeClick = (action, srcData, currentData) => {
    const discardChanges = (checkData) => {
      if (checkData && checkData.pkId < 0) {
        // If user has added a new record and then clicked Discard/Cancel remove the record from the array.
        const restoredSpecialDesignations = streetData.specialDesignations.filter((x) => x.pkId !== checkData.pkId);

        if (restoredSpecialDesignations)
          setAssociatedStreetData(
            streetData.esus,
            streetData.successorCrossRefs,
            streetData.streetDescriptors,
            streetData.streetNotes,
            streetData.maintenanceResponsibilities,
            streetData.reinstatementCategories,
            restoredSpecialDesignations,
            null,
            null,
            null,
            null,
            null
          );
      }

      failedValidation.current = true;
      sandboxContext.onSandboxChange("osSpecialDesignation", null);
      if (currentStreetAsdData.current) resetStreetAsdData();
      else handleAsdHomeClick();
    };

    failedValidation.current = false;

    switch (action) {
      case "check":
        const dataHasChanged =
          currentData.pkId < 0 ||
          !ObjectComparison(srcData, currentData, [
            "changeType",
            "neverExport",
            "endDate",
            "lastUpdateDate",
            "lastUpdated",
            "insertedTimestamp",
            "insertedUser",
            "lastUser",
          ]);

        if (dataHasChanged) {
          confirmDialog(true)
            .then((result) => {
              if (result === "save") {
                if (streetContext.validateData()) {
                  failedValidation.current = false;
                  updateOSSpecialDesignationData(currentData);
                  updateSaveButton(false);
                  handleAsdHomeClick();
                } else {
                  failedValidation.current = true;
                  saveResult.current = false;
                  setSaveOpen(true);
                }
              } else {
                discardChanges(currentData ? currentData : null);
              }
            })
            .catch(() => {});
        } else {
          sandboxContext.onSandboxChange("osSpecialDesignation", null);
          if (currentStreetAsdData.current) resetStreetAsdData();
          else handleAsdHomeClick();
        }
        break;

      case "save":
        if (streetContext.validateData()) {
          failedValidation.current = false;
          updateOSSpecialDesignationData(currentData);
          updateSaveButton(false);
          handleAsdHomeClick();
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
   * Event to handle when a user clicks on the home button from the interest tab.
   *
   * @param {string} action The action to take when the home button is clicked.
   * @param {object} srcData The original state of the data.
   * @param {object} currentData The current state of the data.
   * @returns {boolean} True if the validation check failed; otherwise false.
   */
  const handleInterestHomeClick = (action, srcData, currentData) => {
    const discardChanges = (checkData) => {
      if (checkData && checkData.pkId < 0) {
        // If user has added a new record and then clicked Discard/Cancel remove the record from the array.
        const restoredInterests = streetData.interests.filter((x) => x.pkId !== checkData.pkId);

        if (restoredInterests)
          setAssociatedStreetData(
            streetData.esus,
            null,
            streetData.streetDescriptors,
            streetData.streetNotes,
            null,
            null,
            null,
            restoredInterests,
            streetData.constructions,
            streetData.specialDesignations,
            streetData.publicRightOfWays,
            streetData.heightWidthWeights
          );
      }

      failedValidation.current = true;
      sandboxContext.onSandboxChange("interest", null);
      if (currentStreetAsdData.current) resetStreetAsdData();
      else handleAsdHomeClick();
    };

    failedValidation.current = false;

    switch (action) {
      case "check":
        const dataHasChanged =
          currentData.pkId < 0 ||
          !ObjectComparison(srcData, currentData, [
            "changeType",
            "recordEntryDate",
            "recordEndDate",
            "lastUpdated",
            "insertedTimestamp",
            "insertedUser",
            "lastUser",
          ]);

        if (dataHasChanged) {
          confirmDialog(true)
            .then((result) => {
              if (result === "save") {
                if (streetContext.validateData()) {
                  failedValidation.current = false;
                  updateInterestData(currentData);
                  updateSaveButton(false);
                  handleAsdHomeClick();
                } else {
                  failedValidation.current = true;
                  saveResult.current = false;
                  setSaveOpen(true);
                }
              } else {
                discardChanges(currentData ? currentData : null);
              }
            })
            .catch(() => {});
        } else {
          sandboxContext.onSandboxChange("interest", null);
          if (currentStreetAsdData.current) resetStreetAsdData();
          else handleAsdHomeClick();
        }
        break;

      case "save":
        if (streetContext.validateData()) {
          failedValidation.current = false;
          updateInterestData(currentData);
          updateSaveButton(false);
          handleAsdHomeClick();
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
   * Event to handle when a user clicks on the home button from the construction tab.
   *
   * @param {string} action The action to take when the home button is clicked.
   * @param {object} srcData The original state of the data.
   * @param {object} currentData The current state of the data.
   * @returns {boolean} True if the validation check failed; otherwise false.
   */
  const handleConstructionHomeClick = (action, srcData, currentData) => {
    const discardChanges = (checkData) => {
      if (checkData && checkData.pkId < 0) {
        // If user has added a new record and then clicked Discard/Cancel remove the record from the array.
        const restoredConstructions = streetData.constructions.filter((x) => x.pkId !== checkData.pkId);

        if (restoredConstructions)
          setAssociatedStreetData(
            streetData.esus,
            null,
            streetData.streetDescriptors,
            streetData.streetNotes,
            null,
            null,
            null,
            streetData.interests,
            restoredConstructions,
            streetData.specialDesignations,
            streetData.publicRightOfWays,
            streetData.heightWidthWeights
          );
      }

      failedValidation.current = true;
      sandboxContext.onSandboxChange("construction", null);
      if (currentStreetAsdData.current) resetStreetAsdData();
      else handleAsdHomeClick();
    };

    failedValidation.current = false;

    switch (action) {
      case "check":
        const dataHasChanged =
          currentData.pkId < 0 ||
          !ObjectComparison(srcData, currentData, [
            "changeType",
            "neverExport",
            "endDate",
            "lastUpdateDate",
            "lastUpdated",
            "insertedTimestamp",
            "insertedUser",
            "lastUser",
          ]);

        if (dataHasChanged) {
          confirmDialog(true)
            .then((result) => {
              if (result === "save") {
                if (streetContext.validateData()) {
                  failedValidation.current = false;
                  updateConstructionData(currentData);
                  updateSaveButton(false);
                  handleAsdHomeClick();
                } else {
                  failedValidation.current = true;
                  saveResult.current = false;
                  setSaveOpen(true);
                }
              } else {
                discardChanges(currentData ? currentData : null);
              }
            })
            .catch(() => {});
        } else {
          sandboxContext.onSandboxChange("construction", null);
          if (currentStreetAsdData.current) resetStreetAsdData();
          else handleAsdHomeClick();
        }
        break;

      case "save":
        if (streetContext.validateData()) {
          failedValidation.current = false;
          updateConstructionData(currentData);
          updateSaveButton(false);
          handleAsdHomeClick();
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
   * Event to handle when a user clicks on the home button from the (GeoPlace) special designation tab.
   *
   * @param {string} action The action to take when the home button is clicked.
   * @param {object} srcData The original state of the data.
   * @param {object} currentData The current state of the data.
   * @returns {boolean} True if the validation check failed; otherwise false.
   */
  const handleSpecialDesignationHomeClick = (action, srcData, currentData) => {
    const discardChanges = (checkData) => {
      if (checkData && checkData.pkId < 0) {
        // If user has added a new record and then clicked Discard/Cancel remove the record from the array.
        const restoredSpecialDesignations = streetData.specialDesignations.filter((x) => x.pkId !== checkData.pkId);

        if (restoredSpecialDesignations)
          setAssociatedStreetData(
            streetData.esus,
            null,
            streetData.streetDescriptors,
            streetData.streetNotes,
            null,
            null,
            null,
            streetData.interests,
            streetData.constructions,
            restoredSpecialDesignations,
            streetData.publicRightOfWays,
            streetData.heightWidthWeights
          );
      }

      failedValidation.current = true;
      sandboxContext.onSandboxChange("specialDesignation", null);
      if (currentStreetAsdData.current) resetStreetAsdData();
      else handleAsdHomeClick();
    };

    failedValidation.current = false;

    switch (action) {
      case "check":
        const dataHasChanged =
          currentData.pkId < 0 ||
          !ObjectComparison(srcData, currentData, [
            "changeType",
            "neverExport",
            "endDate",
            "lastUpdateDate",
            "lastUpdated",
            "insertedTimestamp",
            "insertedUser",
            "lastUser",
          ]);

        if (dataHasChanged) {
          confirmDialog(true)
            .then((result) => {
              if (result === "save") {
                if (streetContext.validateData()) {
                  failedValidation.current = false;
                  updateSpecialDesignationData(currentData);
                  updateSaveButton(false);
                  handleAsdHomeClick();
                } else {
                  failedValidation.current = true;
                  saveResult.current = false;
                  setSaveOpen(true);
                }
              } else {
                discardChanges(currentData ? currentData : null);
              }
            })
            .catch(() => {});
        } else {
          sandboxContext.onSandboxChange("specialDesignation", null);
          if (currentStreetAsdData.current) resetStreetAsdData();
          else handleAsdHomeClick();
        }
        break;

      case "save":
        if (streetContext.validateData()) {
          failedValidation.current = false;
          updateSpecialDesignationData(currentData);
          updateSaveButton(false);
          handleAsdHomeClick();
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
   * Event to handle when a user clicks on the home button from the height, width and weight restriction tab.
   *
   * @param {string} action The action to take when the home button is clicked.
   * @param {object} srcData The original state of the data.
   * @param {object} currentData The current state of the data.
   * @returns {boolean} True if the validation check failed; otherwise false.
   */
  const handleHWWHomeClick = (action, srcData, currentData) => {
    const discardChanges = (checkData) => {
      if (checkData && checkData.pkId < 0) {
        // If user has added a new record and then clicked Discard/Cancel remove the record from the array.
        const restoredHeightWidthWeights = streetData.heightWidthWeights.filter((x) => x.pkId !== checkData.pkId);

        if (restoredHeightWidthWeights)
          setAssociatedStreetData(
            streetData.esus,
            null,
            streetData.streetDescriptors,
            streetData.streetNotes,
            null,
            null,
            null,
            streetData.interests,
            streetData.constructions,
            streetData.specialDesignations,
            streetData.publicRightOfWays,
            restoredHeightWidthWeights
          );
      }

      failedValidation.current = true;
      sandboxContext.onSandboxChange("heightWidthWeight", null);
      if (currentStreetAsdData.current) resetStreetAsdData();
      else handleAsdHomeClick();
    };

    failedValidation.current = false;

    switch (action) {
      case "check":
        const dataHasChanged =
          currentData.pkId < 0 ||
          !ObjectComparison(srcData, currentData, [
            "changeType",
            "neverExport",
            "endDate",
            "lastUpdateDate",
            "lastUpdated",
            "lastUser",
          ]);

        if (dataHasChanged) {
          confirmDialog(true)
            .then((result) => {
              if (result === "save") {
                if (streetContext.validateData()) {
                  failedValidation.current = false;
                  updateHWWData(currentData);
                  updateSaveButton(false);
                  handleAsdHomeClick();
                } else {
                  failedValidation.current = true;
                  saveResult.current = false;
                  setSaveOpen(true);
                }
              } else {
                discardChanges(currentData ? currentData : null);
              }
            })
            .catch(() => {});
        } else {
          sandboxContext.onSandboxChange("heightWidthWeight", null);
          if (currentStreetAsdData.current) resetStreetAsdData();
          else handleAsdHomeClick();
        }
        break;

      case "save":
        if (streetContext.validateData()) {
          failedValidation.current = false;
          updateHWWData(currentData);
          updateSaveButton(false);
          handleAsdHomeClick();
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
   * Event to handle when a user clicks on the home button from the public rights of way tab.
   *
   * @param {string} action The action to take when the home button is clicked.
   * @param {object} srcData The original state of the data.
   * @param {object} currentData The current state of the data.
   * @returns {boolean} True if the validation check failed; otherwise false.
   */
  const handlePRoWHomeClick = (action, srcData, currentData) => {
    const discardChanges = (checkData) => {
      if (checkData && checkData.pkId < 0) {
        // If user has added a new record and then clicked Discard/Cancel remove the record from the array.
        const restoredPublicRightOfWays = streetData.publicRightOfWays.filter((x) => x.pkId !== checkData.pkId);

        if (restoredPublicRightOfWays)
          setAssociatedStreetData(
            streetData.esus,
            null,
            streetData.streetDescriptors,
            streetData.streetNotes,
            null,
            null,
            null,
            streetData.interests,
            streetData.constructions,
            streetData.specialDesignations,
            restoredPublicRightOfWays,
            streetData.heightWidthWeights
          );
      }
      failedValidation.current = true;
      sandboxContext.onSandboxChange("publicRightOfWay", null);
      if (currentStreetAsdData.current) resetStreetAsdData();
      else handleAsdHomeClick();
    };

    failedValidation.current = false;

    switch (action) {
      case "check":
        const dataHasChanged =
          currentData.pkId < 0 ||
          !ObjectComparison(srcData, currentData, [
            "changeType",
            "neverExport",
            "endDate",
            "lastUpdateDate",
            "lastUpdated",
            "insertedTimestamp",
            "insertedUser",
            "lastUser",
          ]);

        if (dataHasChanged) {
          confirmDialog(true)
            .then((result) => {
              if (result === "save") {
                if (streetContext.validateData()) {
                  failedValidation.current = false;
                  updatePRoWData(currentData);
                  updateSaveButton(false);
                  handleAsdHomeClick();
                } else {
                  failedValidation.current = true;
                  saveResult.current = false;
                  setSaveOpen(true);
                }
              } else {
                discardChanges(currentData ? currentData : null);
              }
            })
            .catch(() => {});
        } else {
          sandboxContext.onSandboxChange("publicRightOfWay", null);
          if (currentStreetAsdData.current) resetStreetAsdData();
          else handleAsdHomeClick();
        }
        break;

      case "save":
        if (streetContext.validateData()) {
          failedValidation.current = false;
          updatePRoWData(currentData);
          updateSaveButton(false);
          handleAsdHomeClick();
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
   * Event to handle when a user clicks on the home button from the note tab.
   *
   * @param {string} action The action to take when the home button is clicked.
   * @param {object} srcData The original state of the data.
   * @param {object} currentData The current state of the data.
   * @returns {boolean} True if the validation check failed; otherwise false.
   */
  const handleNoteHomeClick = (action, srcData, currentData) => {
    const discardChanges = (checkData) => {
      if (checkData && checkData.pkId < 0) {
        // If user has added a new record and then clicked Discard/Cancel remove the record from the array.
        const restoredNotes = streetData.streetNotes.filter((x) => x.pkId !== checkData.pkId);

        if (restoredNotes)
          setAssociatedStreetData(
            streetData.esus,
            streetData.successorCrossRefs,
            streetData.streetDescriptors,
            restoredNotes,
            streetData.maintenanceResponsibilities,
            streetData.reinstatementCategories,
            settingsContext.isScottish ? streetData.specialDesignations : null,
            streetData.interests,
            streetData.constructions,
            !settingsContext.isScottish ? streetData.specialDesignations : null,
            streetData.publicRightOfWays,
            streetData.heightWidthWeights
          );
      }
      failedValidation.current = true;
      sandboxContext.onSandboxChange("streetNote", null);
      handleNoteSelected(-1, null, null, null);
    };

    failedValidation.current = false;

    switch (action) {
      case "check":
        const dataHasChanged =
          currentData.pkId < 0 ||
          !ObjectComparison(srcData, currentData, [
            "changeType",
            "createdDate",
            "lastUpdatedDate",
            "lastUpdated",
            "insertedTimestamp",
            "insertedUser",
            "lastUser",
          ]);

        if (dataHasChanged) {
          confirmDialog(true)
            .then((result) => {
              if (result === "save") {
                if (streetContext.validateData()) {
                  failedValidation.current = false;
                  updateNoteData(currentData);
                  updateSaveButton(false);
                  handleNoteSelected(-1, null, null, null);
                } else {
                  failedValidation.current = true;
                  saveResult.current = false;
                  setSaveOpen(true);
                }
              } else {
                discardChanges(currentData ? currentData : null);
              }
            })
            .catch(() => {});
        } else {
          sandboxContext.onSandboxChange("streetNote", null);
          handleNoteSelected(-1, null, null, null);
        }
        break;

      case "save":
        if (streetContext.validateData()) {
          failedValidation.current = false;
          updateNoteData(currentData);
          updateSaveButton(false);
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
   * Event to update the descriptor record with new data.
   *
   * @param {object|null} newData The data to be used to update the descriptor record with.
   * @returns
   */
  const updateDescriptorData = (newData) => {
    if (!newData) return;

    let newDescriptors = null;

    if (settingsContext.isWelsh) {
      const secondLanguage = newData.language === "ENG" ? "CYM" : "ENG";

      let secondDescriptor = null;
      if (newData.dualLanguageLink === 0) {
        secondDescriptor = streetData.streetDescriptors.find(
          (x) => x.usrn === newData.usrn && x.language === secondLanguage
        );
      } else {
        secondDescriptor = streetData.streetDescriptors.find(
          (x) => x.dualLanguageLink === newData.dualLanguageLink && x.language === secondLanguage
        );
      }
      const secondLocality = lookupContext.currentLookups.localities.find(
        (x) => x.linkedRef === newData.locRef && x.language === secondLanguage
      );
      const secondTown = lookupContext.currentLookups.towns.find(
        (x) => x.linkedRef === newData.townRef && x.language === secondLanguage
      );
      const secondAdminAuthorities = lookupContext.currentLookups.adminAuthorities.find(
        (x) => x.linkedRef === newData.adminAreaRef && x.language === secondLanguage
      );

      const newSecondDescriptor = {
        changeType: secondDescriptor.changeType,
        usrn: secondDescriptor.usrn,
        streetDescriptor:
          secondDescriptor && secondDescriptor.streetDescriptor
            ? secondDescriptor.streetDescriptor
            : newData.streetDescriptor,
        locRef: secondLocality ? secondLocality.localityRef : null,
        locality: secondLocality ? secondLocality.locality : null,
        townRef: secondTown ? secondTown.townRef : null,
        town: secondTown ? secondTown.town : null,
        adminAreaRef: secondAdminAuthorities ? secondAdminAuthorities.administrativeAreaRef : null,
        administrativeArea: secondAdminAuthorities ? secondAdminAuthorities.administrativeArea : null,
        language: secondLanguage,
        neverExport: newData.neverExport,
        dualLanguageLink: secondDescriptor.dualLanguageLink,
        pkId: secondDescriptor.pkId,
      };

      newDescriptors = streetData.streetDescriptors.map(
        (x) =>
          [newData].find((descriptor) => descriptor.pkId === x.pkId) ||
          [newSecondDescriptor].find((descriptor) => descriptor.pkId === x.pkId)
      );
    } else {
      newDescriptors = streetData.streetDescriptors.map((x) =>
        [newData].find((descriptor) => descriptor.pkId === x.pkId)
      );
    }

    if (newDescriptors && newDescriptors.length > 0) {
      setAssociatedStreetDataAndClear(
        streetData.esus,
        streetData.successorCrossRefs,
        newDescriptors,
        streetData.streetNotes,
        streetData.maintenanceResponsibilities,
        streetData.reinstatementCategories,
        settingsContext.isScottish ? streetData.specialDesignations : null,
        streetData.interests,
        streetData.constructions,
        !settingsContext.isScottish ? streetData.specialDesignations : null,
        streetData.publicRightOfWays,
        streetData.heightWidthWeights,
        "streetDescriptor"
      );
    }
  };

  /**
   * Event to update the ESU record with new data.
   *
   * @param {object|null} newData The data to be used to update the ESU record with.
   * @returns
   */
  const updateEsuData = (newData) => {
    if (!newData) return;

    const newEsus = streetData.esus.map((x) => [newData].find((esu) => esu.pkId === x.pkId) || x);

    setAssociatedStreetDataAndClear(
      newEsus,
      streetData.successorCrossRefs,
      streetData.streetDescriptors,
      streetData.streetNotes,
      streetData.maintenanceResponsibilities,
      streetData.reinstatementCategories,
      settingsContext.isScottish ? streetData.specialDesignations : null,
      streetData.interests,
      streetData.constructions,
      !settingsContext.isScottish ? streetData.specialDesignations : null,
      streetData.publicRightOfWays,
      streetData.heightWidthWeights,
      "esu"
    );
  };

  /**
   * Event to update the highway dedication record with new data.
   *
   * @param {object} newData The data to be used to update the highway dedication record with.
   * @returns
   */
  const updateHighwayDedicationData = (newData) => {
    let newEsus = streetData.esus.filter((x) => x.esuId !== newData.esuId);
    const existingEsu = streetData.esus.filter((x) => x.esuId === newData.esuId);

    let newHighwayDedications = existingEsu[0].highwayDedications.filter((x) => x.pkId !== newData.pkId);

    const updatedHighwayDedication = {
      changeType: newData.changeType,
      highwayDedicationCode: newData.highwayDedicationCode,
      recordEndDate: newData.recordEndDate,
      hdStartDate: newData.hdStartDate,
      hdEndDate: newData.hdEndDate,
      hdSeasonalStartDate: newData.hdSeasonalStartDate,
      hdSeasonalEndDate: newData.hdSeasonalEndDate,
      hdStartTime: newData.hdStartTime,
      hdEndTime: newData.hdEndTime,
      hdProw: newData.hdProw,
      hdNcr: newData.hdNcr,
      hdQuietRoute: newData.hdQuietRoute,
      hdObstruction: newData.hdObstruction,
      hdPlanningOrder: newData.hdPlanningOrder,
      hdVehiclesProhibited: newData.hdVehiclesProhibited,
      pkId: newData.pkId,
      esuId: newData.esuId,
      seqNum: newData.seqNum,
    };
    newHighwayDedications.push(updatedHighwayDedication);

    const updatedEsu = {
      entryDate: currentEsuFormData.current ? currentEsuFormData.current.esuData.entryDate : existingEsu[0].entryDate,
      changeType: existingEsu[0].changeType,
      esuVersionNumber: existingEsu[0].esuVersionNumber,
      numCoordCount: existingEsu[0].numCoordCount,
      esuTolerance: currentEsuFormData.current
        ? currentEsuFormData.current.esuData.esuTolerance
        : existingEsu[0].esuTolerance,
      esuStartDate: currentEsuFormData.current
        ? currentEsuFormData.current.esuData.esuStartDate
        : existingEsu[0].esuStartDate,
      esuEndDate: currentEsuFormData.current
        ? currentEsuFormData.current.esuData.esuEndDate
        : existingEsu[0].esuEndDate,
      esuDirection: currentEsuFormData.current
        ? currentEsuFormData.current.esuData.esuDirection
        : existingEsu[0].esuDirection,
      wktGeometry: existingEsu[0].wktGeometry,
      assignUnassign: existingEsu[0].assignUnassign,
      pkId: existingEsu[0].pkId,
      esuId: existingEsu[0].esuId,
      highwayDedications: newHighwayDedications,
      oneWayExemptions: existingEsu[0].oneWayExemptions,
    };
    newEsus.push(updatedEsu);

    if (currentEsuFormData.current) {
      currentEsuFormData.current = {
        pkId: currentEsuFormData.current.pkId,
        esuData: updatedEsu,
        index: currentEsuFormData.current.index,
        totalRecords: newEsus.length,
      };
    }

    const newStreetData = !HasASD()
      ? {
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
          streetStartX: streetData.streetStartX,
          streetStartY: streetData.streetStartY,
          streetEndX: streetData.streetEndX,
          streetEndY: streetData.streetEndY,
          pkId: streetData.pkId,
          lastUpdateDate: streetData.lastUpdateDate,
          entryDate: streetData.entryDate,
          streetLastUpdated: streetData.streetLastUpdated,
          streetLastUser: streetData.streetLastUser,
          relatedPropertyCount: streetData.relatedPropertyCount,
          relatedStreetCount: streetData.relatedStreetCount,
          esus: newEsus,
          streetDescriptors: streetData.streetDescriptors,
          streetNotes: streetData.streetNotes,
        }
      : {
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
          streetStartX: streetData.streetStartX,
          streetStartY: streetData.streetStartY,
          streetEndX: streetData.streetEndX,
          streetEndY: streetData.streetEndY,
          pkId: streetData.pkId,
          lastUpdateDate: streetData.lastUpdateDate,
          entryDate: streetData.entryDate,
          streetLastUpdated: streetData.streetLastUpdated,
          streetLastUser: streetData.streetLastUser,
          relatedPropertyCount: streetData.relatedPropertyCount,
          relatedStreetCount: streetData.relatedStreetCount,
          esus: newEsus,
          streetDescriptors: streetData.streetDescriptors,
          streetNotes: streetData.streetNotes,
          interests: streetData.recordType < 4 ? streetData.interests : null,
          constructions: streetData.recordType < 4 ? streetData.constructions : null,
          specialDesignations: streetData.recordType < 4 ? streetData.specialDesignations : null,
          publicRightOfWays: streetData.recordType < 4 ? streetData.publicRightOfWays : null,
          heightWidthWeights: streetData.recordType < 4 ? streetData.heightWidthWeights : null,
        };

    updateStreetDataAndClear(newStreetData, "highwayDedication");
    sandboxContext.onSandboxChange("esu", updatedEsu);
  };

  /**
   * Event to update the one-way exemption record with new data.
   *
   * @param {object} newData The data to be used to update the one-way exemption record with.
   * @returns
   */
  const updateOneWayExemptionData = (newData) => {
    let newEsus = streetData.esus.filter((X) => X.esuId !== newData.esuId);
    const existingEsu = streetData.esus.filter((X) => X.esuId === newData.esuId);

    let newOneWayExemptions = existingEsu[0].oneWayExemptions.filter((x) => x.pkId !== newData.pkId);

    const updatedOneWayExemption = {
      changeType: newData.changeType,
      oneWayExemptionTypeCode: newData.oneWayExemptionTypeCode,
      recordEndDate: newData.recordEndDate,
      oneWayExemptionStartDate: newData.oneWayExemptionStartDate,
      oneWayExemptionEndDate: newData.oneWayExemptionEndDate,
      oneWayExemptionStartTime: newData.oneWayExemptionStartTime,
      oneWayExemptionEndTime: newData.oneWayExemptionEndTime,
      oneWayExemptionPeriodicityCode: newData.oneWayExemptionPeriodicityCode,
      pkId: newData.pkId,
      esuId: newData.esuId,
      sequenceNumber: newData.sequenceNumber,
    };
    newOneWayExemptions.push(updatedOneWayExemption);

    const updatedEsu = {
      entryDate: currentEsuFormData.current ? currentEsuFormData.current.esuData.entryDate : existingEsu[0].entryDate,
      changeType: existingEsu[0].changeType,
      esuVersionNumber: existingEsu[0].esuVersionNumber,
      numCoordCount: existingEsu[0].numCoordCount,
      esuTolerance: currentEsuFormData.current
        ? currentEsuFormData.current.esuData.esuTolerance
        : existingEsu[0].esuTolerance,
      esuStartDate: currentEsuFormData.current
        ? currentEsuFormData.current.esuData.esuStartDate
        : existingEsu[0].esuStartDate,
      esuEndDate: currentEsuFormData.current
        ? currentEsuFormData.current.esuData.esuEndDate
        : existingEsu[0].esuEndDate,
      esuDirection: currentEsuFormData.current
        ? currentEsuFormData.current.esuData.esuDirection
        : existingEsu[0].esuDirection,
      wktGeometry: existingEsu[0].wktGeometry,
      assignUnassign: existingEsu[0].assignUnassign,
      pkId: existingEsu[0].pkId,
      esuId: existingEsu[0].esuId,
      highwayDedications: existingEsu[0].highwayDedications,
      oneWayExemptions: newOneWayExemptions,
    };
    newEsus.push(updatedEsu);

    if (currentEsuFormData.current) {
      currentEsuFormData.current = {
        pkId: currentEsuFormData.current.pkId,
        esuData: updatedEsu,
        index: currentEsuFormData.current.index,
        totalRecords: newEsus.length,
      };
    }

    const newStreetData = !HasASD()
      ? {
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
          streetStartX: streetData.streetStartX,
          streetStartY: streetData.streetStartY,
          streetEndX: streetData.streetEndX,
          streetEndY: streetData.streetEndY,
          pkId: streetData.pkId,
          lastUpdateDate: streetData.lastUpdateDate,
          entryDate: streetData.entryDate,
          streetLastUpdated: streetData.streetLastUpdated,
          streetLastUser: streetData.streetLastUser,
          relatedPropertyCount: streetData.relatedPropertyCount,
          relatedStreetCount: streetData.relatedStreetCount,
          esus: newEsus,
          streetDescriptors: streetData.streetDescriptors,
          streetNotes: streetData.streetNotes,
        }
      : {
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
          streetStartX: streetData.streetStartX,
          streetStartY: streetData.streetStartY,
          streetEndX: streetData.streetEndX,
          streetEndY: streetData.streetEndY,
          pkId: streetData.pkId,
          lastUpdateDate: streetData.lastUpdateDate,
          entryDate: streetData.entryDate,
          streetLastUpdated: streetData.streetLastUpdated,
          streetLastUser: streetData.streetLastUser,
          relatedPropertyCount: streetData.relatedPropertyCount,
          relatedStreetCount: streetData.relatedStreetCount,
          esus: newEsus,
          streetDescriptors: streetData.streetDescriptors,
          streetNotes: streetData.streetNotes,
          interests: streetData.recordType < 4 ? streetData.interests : null,
          constructions: streetData.recordType < 4 ? streetData.constructions : null,
          specialDesignations: streetData.recordType < 4 ? streetData.specialDesignations : null,
          publicRightOfWays: streetData.recordType < 4 ? streetData.publicRightOfWays : null,
          heightWidthWeights: streetData.recordType < 4 ? streetData.heightWidthWeights : null,
        };

    updateStreetDataAndClear(newStreetData, "oneWayExemption");
    sandboxContext.onSandboxChange("esu", updatedEsu);
  };

  /**
   * Event to update the successor cross reference record with new data.
   *
   * @param {object|null} newData The data to be used to update the successor cross reference record with.
   * @returns
   */
  const updateSuccessorCrossRefData = (newData) => {
    if (!newData) return;

    const newSuccessorCrossRefs = streetData.successorCrossRefs.map(
      (x) => [newData].find((successorCrossRef) => successorCrossRef.pkId === x.pkId) || x
    );

    setAssociatedStreetDataAndClear(
      streetData.esus,
      newSuccessorCrossRefs,
      streetData.streetDescriptors,
      streetData.streetNotes,
      streetData.maintenanceResponsibilities,
      streetData.reinstatementCategories,
      streetData.specialDesignations,
      null,
      null,
      null,
      null,
      null,
      "successorCrossRef"
    );
  };

  /**
   * Event to update the maintenance responsibility record with new data.
   *
   * @param {object|null} newData The data to be used to update the maintenance responsibility record with.
   * @returns
   */
  const updateMaintenanceResponsibilityData = (newData) => {
    if (!newData) return;

    const newMaintenanceResponsibilities = streetData.maintenanceResponsibilities.map(
      (x) => [newData].find((maintenanceResponsibility) => maintenanceResponsibility.pkId === x.pkId) || x
    );

    setAssociatedStreetDataAndClear(
      streetData.esus,
      streetData.successorCrossRefs,
      streetData.streetDescriptors,
      streetData.streetNotes,
      newMaintenanceResponsibilities,
      streetData.reinstatementCategories,
      streetData.specialDesignations,
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
   * @param {object|null} newData The data to be used to update the reinstatement category record with.
   * @returns
   */
  const updateReinstatementCategoryData = (newData) => {
    if (!newData) return;

    const newReinstatementCategories = streetData.reinstatementCategories.map(
      (x) => [newData].find((reinstatementCategory) => reinstatementCategory.pkId === x.pkId) || x
    );

    setAssociatedStreetDataAndClear(
      streetData.esus,
      streetData.successorCrossRefs,
      streetData.streetDescriptors,
      streetData.streetNotes,
      streetData.maintenanceResponsibilities,
      newReinstatementCategories,
      streetData.specialDesignations,
      null,
      null,
      null,
      null,
      null,
      "reinstatementCategory"
    );
  };

  /**
   * Event to update the OneScotland special designation record with new data.
   *
   * @param {object|null} newData The data to be used to update the OneScotland special designation record with.
   * @returns
   */
  const updateOSSpecialDesignationData = (newData) => {
    if (!newData) return;

    const newOSSpecialDesignations = streetData.specialDesignations.map(
      (x) => [newData].find((specialDesignation) => specialDesignation.pkId === x.pkId) || x
    );

    setAssociatedStreetDataAndClear(
      streetData.esus,
      streetData.successorCrossRefs,
      streetData.streetDescriptors,
      streetData.streetNotes,
      streetData.maintenanceResponsibilities,
      streetData.reinstatementCategories,
      newOSSpecialDesignations,
      null,
      null,
      null,
      null,
      null,
      "osSpecialDesignation"
    );
  };

  /**
   * Event to update the interest record with new data.
   *
   * @param {object|null} newData The data to be used to update the interest record with.
   * @returns
   */
  const updateInterestData = (newData) => {
    if (!newData) return;

    const newInterests = streetData.interests.map((x) => [newData].find((interest) => interest.pkId === x.pkId) || x);

    setAssociatedStreetDataAndClear(
      streetData.esus,
      null,
      streetData.streetDescriptors,
      streetData.streetNotes,
      null,
      null,
      null,
      newInterests,
      streetData.constructions,
      streetData.specialDesignations,
      streetData.publicRightOfWays,
      streetData.heightWidthWeights,
      "interest"
    );
  };

  /**
   * Event to update the construction record with new data.
   *
   * @param {object|null} newData The data to be used to update the construction record with.
   * @returns
   */
  const updateConstructionData = (newData) => {
    if (!newData) return;

    const newConstructions = streetData.constructions.map(
      (x) => [newData].find((construction) => construction.pkId === x.pkId) || x
    );

    setAssociatedStreetDataAndClear(
      streetData.esus,
      null,
      streetData.streetDescriptors,
      streetData.streetNotes,
      null,
      null,
      null,
      streetData.interests,
      newConstructions,
      streetData.specialDesignations,
      streetData.publicRightOfWays,
      streetData.heightWidthWeights,
      "construction"
    );
  };

  /**
   * Event to update the (GeoPlace) special designation record with new data.
   *
   * @param {object|null} newData The data to be used to update the special designation record with.
   * @returns
   */
  const updateSpecialDesignationData = (newData) => {
    if (!newData) return;

    const newSpecialDesignations = streetData.specialDesignations.map(
      (x) => [newData].find((specialDesignation) => specialDesignation.pkId === x.pkId) || x
    );

    setAssociatedStreetDataAndClear(
      streetData.esus,
      null,
      streetData.streetDescriptors,
      streetData.streetNotes,
      null,
      null,
      null,
      streetData.interests,
      streetData.constructions,
      newSpecialDesignations,
      streetData.publicRightOfWays,
      streetData.heightWidthWeights,
      "specialDesignation"
    );
  };

  /**
   * Event to update the height, width and weight restriction record with new data.
   *
   * @param {object|null} newData The data to be used to update the height, width and weight restriction record with.
   * @returns
   */
  const updateHWWData = (newData) => {
    if (!newData) return;

    const newHeightWidthWeights = streetData.heightWidthWeights.map(
      (x) => [newData].find((hww) => hww.pkId === x.pkId) || x
    );

    setAssociatedStreetDataAndClear(
      streetData.esus,
      null,
      streetData.streetDescriptors,
      streetData.streetNotes,
      null,
      null,
      null,
      streetData.interests,
      streetData.constructions,
      streetData.specialDesignations,
      streetData.publicRightOfWays,
      newHeightWidthWeights,
      "hww"
    );
  };

  /**
   * Event to update the public rights of way record with new data.
   *
   * @param {object|null} newData The data to be used to update the public rights of way record with.
   * @returns
   */
  const updatePRoWData = (newData) => {
    if (!newData) return;

    const newPublicRightOfWays = streetData.publicRightOfWays.map(
      (x) => [newData].find((prow) => prow.pkId === x.pkId) || x
    );

    setAssociatedStreetDataAndClear(
      streetData.esus,
      null,
      streetData.streetDescriptors,
      streetData.streetNotes,
      null,
      null,
      null,
      streetData.interests,
      streetData.constructions,
      streetData.specialDesignations,
      newPublicRightOfWays,
      streetData.heightWidthWeights,
      "prow"
    );
  };

  /**
   * Event to update the note record with new data.
   *
   * @param {object|null} newData The data to be used to update the note record with.
   * @returns
   */
  const updateNoteData = (newData) => {
    if (!newData) return;

    let newNotes = streetData.streetNotes.map((x) => [newData].find((note) => note.pkId === x.pkId) || x);

    setAssociatedStreetDataAndClear(
      streetData.esus,
      streetData.successorCrossRefs,
      streetData.streetDescriptors,
      newNotes,
      streetData.maintenanceResponsibilities,
      streetData.reinstatementCategories,
      settingsContext.isScottish ? streetData.specialDesignations : null,
      streetData.interests,
      streetData.constructions,
      !settingsContext.isScottish ? streetData.specialDesignations : null,
      streetData.publicRightOfWays,
      streetData.heightWidthWeights,
      "streetNote"
    );
  };

  /**
   * Event to handle when the street data changes.
   *
   * @param {object} srcData The original state of the data.
   */
  const handleStreetDataChanged = (srcData) => {
    const newStreetData = settingsContext.isScottish
      ? {
          pkId: streetData.pkId,
          changeType: streetData.changeType,
          usrn: srcData.usrn,
          recordType: srcData.recordType,
          swaOrgRefNaming: srcData.swaOrgRefNaming,
          version: streetData.version,
          recordEntryDate: streetData.recordEntryDate,
          lastUpdateDate: streetData.lastUpdateDate,
          streetStartDate: srcData.streetStartDate,
          streetEndDate: srcData.streetEndDate,
          streetStartX: srcData.streetStartX,
          streetStartY: srcData.streetStartY,
          streetEndX: srcData.streetEndX,
          streetEndY: srcData.streetEndY,
          streetTolerance: srcData.streetTolerance,
          esuCount: streetData.esuCount,
          streetLastUpdated: streetData.streetLastUpdated,
          streetLastUser: streetData.streetLastUser,
          neverExport: srcData.neverExport,
          relatedPropertyCount: streetData.relatedPropertyCount,
          relatedStreetCount: streetData.relatedStreetCount,
          lastUpdated: streetData.lastUpdated,
          insertedTimestamp: streetData.insertedTimestamp,
          insertedUser: streetData.insertedUser,
          lastUser: streetData.lastUser,
          esus: streetData.esus,
          successorCrossRefs: streetData.successorCrossRefs,
          streetDescriptors: streetData.streetDescriptors,
          streetNotes: streetData.streetNotes,
          maintenanceResponsibilities: streetData.recordType < 4 ? streetData.maintenanceResponsibilities : null,
          reinstatementCategories: streetData.recordType < 4 ? streetData.reinstatementCategories : null,
          specialDesignations: streetData.recordType < 4 ? streetData.specialDesignations : null,
        }
      : !HasASD()
      ? {
          changeType: streetData.changeType,
          usrn: srcData.usrn,
          swaOrgRefNaming: srcData.swaOrgRefNaming,
          streetSurface: srcData.streetSurface,
          streetStartDate: srcData.streetStartDate,
          streetEndDate: srcData.streetEndDate,
          neverExport: srcData.neverExport,
          version: streetData.version,
          recordType: srcData.recordType,
          state: srcData.state,
          stateDate: srcData.stateDate,
          streetClassification: srcData.streetClassification,
          streetTolerance: srcData.streetTolerance,
          streetStartX: srcData.streetStartX,
          streetStartY: srcData.streetStartY,
          streetEndX: srcData.streetEndX,
          streetEndY: srcData.streetEndY,
          pkId: streetData.pkId,
          lastUpdateDate: streetData.lastUpdateDate,
          entryDate: streetData.entryDate,
          streetLastUpdated: streetData.streetLastUpdated,
          streetLastUser: streetData.streetLastUser,
          relatedPropertyCount: streetData.relatedPropertyCount,
          relatedStreetCount: streetData.relatedStreetCount,
          esus: streetData.esus,
          streetDescriptors: streetData.streetDescriptors,
          streetNotes: streetData.streetNotes,
        }
      : {
          changeType: streetData.changeType,
          usrn: srcData.usrn,
          swaOrgRefNaming: srcData.swaOrgRefNaming,
          streetSurface: srcData.streetSurface,
          streetStartDate: srcData.streetStartDate,
          streetEndDate: srcData.streetEndDate,
          neverExport: srcData.neverExport,
          version: streetData.version,
          recordType: srcData.recordType,
          state: srcData.state,
          stateDate: srcData.stateDate,
          streetClassification: srcData.streetClassification,
          streetTolerance: srcData.streetTolerance,
          streetStartX: srcData.streetStartX,
          streetStartY: srcData.streetStartY,
          streetEndX: srcData.streetEndX,
          streetEndY: srcData.streetEndY,
          pkId: streetData.pkId,
          lastUpdateDate: streetData.lastUpdateDate,
          entryDate: streetData.entryDate,
          streetLastUpdated: streetData.streetLastUpdated,
          streetLastUser: streetData.streetLastUser,
          relatedPropertyCount: streetData.relatedPropertyCount,
          relatedStreetCount: streetData.relatedStreetCount,
          esus: streetData.esus,
          streetDescriptors: streetData.streetDescriptors,
          streetNotes: streetData.streetNotes,
          interests: streetData.recordType < 4 ? streetData.interests : null,
          constructions: streetData.recordType < 4 ? streetData.constructions : null,
          specialDesignations: streetData.recordType < 4 ? streetData.specialDesignations : null,
          publicRightOfWays: streetData.recordType < 4 ? streetData.publicRightOfWays : null,
          heightWidthWeights: streetData.recordType < 4 ? streetData.heightWidthWeights : null,
        };

    updateStreetData(newStreetData);
  };

  const handlePropertyWizardDone = async (wizardData) => {
    if (wizardData && wizardData.savedProperty) {
      const isRange = Array.isArray(wizardData.savedProperty);

      if (isRange) {
        UpdateRangeAfterSave(
          wizardData.savedProperty,
          lookupContext,
          mapContext,
          propertyContext,
          sandboxContext,
          settingsContext.isWelsh,
          searchContext
        );
      } else {
        UpdateAfterSave(
          wizardData.savedProperty,
          lookupContext,
          mapContext,
          propertyContext,
          sandboxContext,
          settingsContext.isWelsh,
          searchContext
        );
      }

      if (!isRange) history.goBack();

      const parentData =
        isRange && wizardData.savedProperty
          ? await GetPropertyMapData(wizardData.savedProperty[0].parentUprn, userContext.currentUser.token)
          : null;
      const engLpis = parentData && parentData.lpis ? parentData.lpis.filter((x) => x.language === "ENG") : null;
      const parent =
        parentData && engLpis
          ? {
              uprn: parentData.uprn,
              usrn: engLpis[0].usrn,
              easting: parentData.xcoordinate,
              northing: parentData.ycoordinate,
              address: engLpis[0].address,
              postcode: engLpis[0].postcode,
            }
          : null;

      propertyContext.onWizardDone(wizardData, isRange, parent, "search");
    } else propertyContext.onWizardDone(wizardData, false, null, "search");

    if (wizardData.type !== "view") {
      sandboxContext.resetSandbox();
      streetContext.resetStreet();
      streetContext.resetStreetErrors();
      propertyContext.resetProperty();
      propertyContext.resetPropertyErrors();
      mapContext.onEditMapObject(null, null);
    }
  };

  const handlePropertyWizardClose = () => {
    streetContext.restoreStreet();
    setOpenPropertyWizard(false);
  };

  const handleAlertClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setAlertOpen(false);
  };

  /**
   * Event to handle when the historic property dialog is closed.
   *
   * @param {string} action The action taken from the dialog
   */
  const handleHistoricPropertyClose = (action) => {
    setOpenHistoricProperty(false);
    if (action === "continue") {
      if (historicRec.current) {
        doOpenRecord(
          historicRec.current.property,
          historicRec.current.related,
          searchContext.currentSearchData.results,
          mapContext,
          streetContext,
          propertyContext,
          userContext.currentUser.token,
          settingsContext.isScottish
        );
      }
    }
  };

  useEffect(() => {
    if (
      data &&
      (streetUsrn.current === null ||
        streetUsrn.current === undefined ||
        streetUsrn.current === "" ||
        streetUsrn.current === false ||
        data.usrn.toString() !== streetUsrn.current.toString())
    ) {
      streetUsrn.current = data.usrn;
      streetContext.resetStreetErrors();
      setStreetData(data);
      mergedDividedEsus.current = [];
      if (data && data.usrn.toString() === "0" && saveDisabled) {
        setSaveDisabled(false);
        streetContext.onStreetModified(true);
      }
    }
  }, [data, saveDisabled, streetContext]);

  useEffect(() => {
    if (streetContext.streetClosing && streetData && !streetData.streetEndDate) {
      const currentDate = GetCurrentDate(false);
      const newStreetData =
        !settingsContext.isScottish && !HasASD()
          ? {
              changeType: streetData.changeType,
              usrn: streetData.usrn,
              swaOrgRefNaming: streetData.swaOrgRefNaming,
              streetSurface: streetData.streetSurface,
              streetStartDate: streetData.streetStartDate,
              streetEndDate: currentDate,
              neverExport: streetData.neverExport,
              version: streetData.version,
              recordType: streetData.recordType,
              state: 4,
              stateDate: currentDate,
              streetClassification: streetData.streetClassification,
              streetTolerance: streetData.streetTolerance,
              streetStartX: streetData.streetStartX,
              streetStartY: streetData.streetStartY,
              streetEndX: streetData.streetEndX,
              streetEndY: streetData.streetEndY,
              pkId: streetData.pkId,
              lastUpdateDate: streetData.lastUpdateDate,
              entryDate: streetData.entryDate,
              streetLastUpdated: streetData.streetLastUpdated,
              streetLastUser: streetData.streetLastUser,
              relatedPropertyCount: streetData.relatedPropertyCount,
              relatedStreetCount: streetData.relatedStreetCount,
              esus: streetData.esus,
              streetDescriptors: streetData.streetDescriptors,
              streetNotes: streetData.streetNotes,
            }
          : !settingsContext.isScottish && HasASD()
          ? {
              changeType: streetData.changeType,
              usrn: streetData.usrn,
              swaOrgRefNaming: streetData.swaOrgRefNaming,
              streetSurface: streetData.streetSurface,
              streetStartDate: streetData.streetStartDate,
              streetEndDate: currentDate,
              neverExport: streetData.neverExport,
              version: streetData.version,
              recordType: streetData.recordType,
              state: 4,
              stateDate: currentDate,
              streetClassification: streetData.streetClassification,
              streetTolerance: streetData.streetTolerance,
              streetStartX: streetData.streetStartX,
              streetStartY: streetData.streetStartY,
              streetEndX: streetData.streetEndX,
              streetEndY: streetData.streetEndY,
              pkId: streetData.pkId,
              lastUpdateDate: streetData.lastUpdateDate,
              entryDate: streetData.entryDate,
              streetLastUpdated: streetData.streetLastUpdated,
              streetLastUser: streetData.streetLastUser,
              relatedPropertyCount: streetData.relatedPropertyCount,
              relatedStreetCount: streetData.relatedStreetCount,
              esus: streetData.esus,
              streetDescriptors: streetData.streetDescriptors,
              streetNotes: streetData.streetNotes,
              interests: streetData.recordType < 4 ? streetData.interests : null,
              constructions: streetData.recordType < 4 ? streetData.constructions : null,
              specialDesignations: streetData.recordType < 4 ? streetData.specialDesignations : null,
              publicRightOfWays: streetData.recordType < 4 ? streetData.publicRightOfWays : null,
              heightWidthWeights: streetData.recordType < 4 ? streetData.heightWidthWeights : null,
            }
          : {
              pkId: streetData.pkId,
              changeType: streetData.changeType,
              usrn: streetData.usrn,
              recordType: streetData.recordType,
              swaOrgRefNaming: streetData.swaOrgRefNaming,
              version: streetData.version,
              recordEntryDate: streetData.recordEntryDate,
              lastUpdateDate: streetData.lastUpdateDate,
              streetStartDate: streetData.streetStartDate,
              streetEndDate: currentDate,
              streetStartX: streetData.streetStartX,
              streetStartY: streetData.streetStartY,
              streetEndX: streetData.streetEndX,
              streetEndY: streetData.streetEndY,
              streetTolerance: streetData.streetTolerance,
              esuCount: streetData.esuCount,
              streetLastUpdated: streetData.streetLastUpdated,
              streetLastUser: streetData.streetLastUser,
              neverExport: streetData.neverExport,
              relatedPropertyCount: streetData.relatedPropertyCount,
              relatedStreetCount: streetData.relatedStreetCount,
              lastUpdated: streetData.lastUpdated,
              insertedTimestamp: streetData.insertedTimestamp,
              insertedUser: streetData.insertedUser,
              lastUser: streetData.lastUser,
              esus: streetData.esus,
              successorCrossRefs: streetData.successorCrossRefs,
              streetDescriptors: streetData.streetDescriptors,
              streetNotes: streetData.streetNotes,
              maintenanceResponsibilities: streetData.recordType < 4 ? streetData.maintenanceResponsibilities : null,
              reinstatementCategories: streetData.recordType < 4 ? streetData.reinstatementCategories : null,
              specialDesignations: streetData.recordType < 4 ? streetData.specialDesignations : null,
            };

      setStreetData(newStreetData);
      streetContext.onCloseStreet(false);
      sandboxContext.onSandboxChange("currentStreet", newStreetData);
      setSaveDisabled(false);
      streetContext.onStreetModified(true);
      mapContext.onSetCoordinate(null);
    }
  }, [streetContext, streetData, sandboxContext, mapContext, settingsContext.isScottish]);

  useEffect(() => {
    if (streetContext.creatingStreet) {
      setValue(0);
      streetContext.onStreetCreated();
    }
  }, [streetContext]);

  useEffect(() => {
    if (streetContext.currentStreet.openRelated) {
      failedValidation.current = false;
      setValue(HasASD() && streetData && streetData.recordType < 4 ? 3 : 2);
      mapContext.onEditMapObject(null, null);
    }
  }, [streetContext.currentStreet.openRelated, mapContext, streetData]);

  useEffect(() => {
    if (streetContext.currentErrors) {
      if (streetContext.currentErrors.street && streetContext.currentErrors.street.length > 0)
        setStreetErrors(streetContext.currentErrors.street);
      else setStreetErrors([]);

      if (streetContext.currentErrors.descriptor && streetContext.currentErrors.descriptor.length > 0) {
        setDescriptorErrors(streetContext.currentErrors.descriptor);
      } else setDescriptorErrors([]);

      if (streetContext.currentErrors.esu && streetContext.currentErrors.esu.length > 0)
        setEsuErrors(streetContext.currentErrors.esu);
      else setEsuErrors([]);

      if (streetContext.currentErrors.oneWayExemption && streetContext.currentErrors.oneWayExemption.length > 0)
        setOneWayExemptionErrors(streetContext.currentErrors.oneWayExemption);
      else setOneWayExemptionErrors([]);

      if (streetContext.currentErrors.highwayDedication && streetContext.currentErrors.highwayDedication.length > 0)
        setHighwayDedicationErrors(streetContext.currentErrors.highwayDedication);
      else setHighwayDedicationErrors([]);

      if (streetContext.currentErrors.successorCrossRef && streetContext.currentErrors.successorCrossRef.length > 0)
        setSuccessorCrossRefErrors(streetContext.currentErrors.successorCrossRef);
      else setSuccessorCrossRefErrors([]);

      if (streetContext.currentErrors.construction && streetContext.currentErrors.construction.length > 0)
        setConstructionErrors(streetContext.currentErrors.construction);
      else setConstructionErrors([]);

      if (
        streetContext.currentErrors.reinstatementCategory &&
        streetContext.currentErrors.reinstatementCategory.length > 0
      )
        setReinstatementCategoryErrors(streetContext.currentErrors.reinstatementCategory);
      else setReinstatementCategoryErrors([]);

      if (
        streetContext.currentErrors.osSpecialDesignation &&
        streetContext.currentErrors.osSpecialDesignation.length > 0
      )
        setOSSpecialDesignationErrors(streetContext.currentErrors.osSpecialDesignation);
      else setOSSpecialDesignationErrors([]);

      if (streetContext.currentErrors.interest && streetContext.currentErrors.interest.length > 0)
        setInterestErrors(streetContext.currentErrors.interest);
      else setInterestErrors([]);

      if (
        streetContext.currentErrors.maintenanceResponsibility &&
        streetContext.currentErrors.maintenanceResponsibility.length > 0
      )
        setMaintenanceResponsibilityErrors(streetContext.currentErrors.maintenanceResponsibility);
      else setMaintenanceResponsibilityErrors([]);

      if (streetContext.currentErrors.specialDesignation && streetContext.currentErrors.specialDesignation.length > 0)
        setSpecialDesignationErrors(streetContext.currentErrors.specialDesignation);
      else setSpecialDesignationErrors([]);

      if (streetContext.currentErrors.heightWidthWeight && streetContext.currentErrors.heightWidthWeight.length > 0)
        setHeightWidthWeightErrors(streetContext.currentErrors.heightWidthWeight);
      else setHeightWidthWeightErrors([]);

      if (streetContext.currentErrors.publicRightOfWay && streetContext.currentErrors.publicRightOfWay.length > 0)
        setPublicRightOfWayErrors(streetContext.currentErrors.publicRightOfWay);
      else setPublicRightOfWayErrors([]);

      if (streetContext.currentErrors.note && streetContext.currentErrors.note.length > 0)
        setNoteErrors(streetContext.currentErrors.note);
      else setNoteErrors([]);
    }
  }, [streetContext.currentErrors]);

  useEffect(() => {
    const doAfterStep = async () => {
      ResetContexts("street", false, mapContext, streetContext, propertyContext, sandboxContext);
      setSaveDisabled(true);
      streetContext.onStreetModified(false);
      saveResult.current = true;
      switch (streetContext.leavingStreet.why) {
        case "createStreet":
          streetContext.onCreateStreet(streetContext.leavingStreet.information);
          break;

        case "createProperty":
          await GetStreetMapData(
            streetContext.leavingStreet.information.usrn,
            userContext.currentUser.token,
            settingsContext.isScottish
          ).then((result) => {
            if (result && result.state !== 4) {
              propertyContext.resetPropertyErrors();
              propertyContext.onWizardDone(null, false, null, null);
              mapContext.onWizardSetCoordinate(null);
              propertyWizardType.current = streetContext.leavingStreet.information.isRange
                ? !streetContext.leavingStreet.information.parent
                  ? "range"
                  : "rangeChildren"
                : !streetContext.leavingStreet.information.parent
                ? "property"
                : "child";
              if (streetContext.leavingStreet.information.parent)
                propertyWizardParent.current = streetContext.leavingStreet.information.parent;
              else {
                const engDescriptor = result.streetDescriptors.filter((x) => x.language === "ENG");
                if (engDescriptor) {
                  propertyWizardParent.current = {
                    usrn: streetContext.leavingStreet.information.usrn,
                    address: engDescriptor[0].streetDescriptor,
                  };
                }
              }
              setOpenPropertyWizard(true);
            } else {
              alertType.current = streetContext.leavingStreet.information.isRange
                ? "invalidRangeState"
                : "invalidSingleState";
              setAlertOpen(true);
            }
          });
          break;

        default:
          break;
      }
    };

    if (streetContext.leavingStreet) {
      const streetChanged = hasStreetChanged(streetContext.currentStreet.newStreet, sandboxContext.currentSandbox);

      if (streetChanged) {
        const associatedRecords = GetChangedAssociatedRecords("street", sandboxContext, esuChanged.current);

        saveConfirmDialog(associatedRecords.length > 0 ? associatedRecords : true)
          .then((result) => {
            if (result === "save") {
              if (streetContext.validateData()) {
                failedValidation.current = false;
                const currentStreetData = GetCurrentStreetData(
                  streetData,
                  sandboxContext,
                  lookupContext,
                  settingsContext.isWelsh,
                  settingsContext.isScottish
                );

                SaveStreet(
                  currentStreetData,
                  streetContext,
                  userContext,
                  lookupContext,
                  searchContext,
                  mapContext,
                  sandboxContext,
                  settingsContext.isScottish,
                  settingsContext.isWelsh
                ).then((result) => {
                  if (result) {
                    doAfterStep();
                    saveResult.current = true;
                    setSaveOpen(true);
                  } else {
                    saveResult.current = false;
                    setSaveOpen(true);
                  }
                });
              } else {
                failedValidation.current = true;
                saveResult.current = false;
                setSaveOpen(true);
              }
            } else if (result === "discard") {
              doAfterStep();
            }
          })
          .catch(() => {});
      } else doAfterStep();

      esuChanged.current = false;

      streetContext.onLeavingStreet(null, null);
    }
  }, [
    streetContext,
    sandboxContext,
    lookupContext,
    mapContext,
    propertyContext,
    settingsContext,
    searchContext,
    userContext,
    streetData,
    saveConfirmDialog,
  ]);

  useEffect(() => {
    if (streetContext.goToField) {
      setStreetFocusedField(null);
      setDescriptorFocusedField(null);
      setEsuFocusedField(null);
      setSuccessorCrossRefFocusedField(null);
      setOneWayExemptionFocusedField(null);
      setHighwayDedicationFocusedField(null);
      setMaintenanceResponsibilityFocusedField(null);
      setReinstatementCategoryFocusedField(null);
      setOSSpecialDesignationFocusedField(null);
      setInterestFocusedField(null);
      setConstructionFocusedField(null);
      setSpecialDesignationFocusedField(null);
      setHeightWidthWeightFocusedField(null);
      setPublicRightOfWayFocusedField(null);
      setNoteFocusedField(null);

      switch (streetContext.goToField.type) {
        case 11:
          setStreetFocusedField(streetContext.goToField.fieldName);
          if (value !== 0) setValue(0);
          streetContext.onRecordChange(11, null, null, null);
          setDescriptorFormData(null);
          break;

        case 13:
          setEsuFocusedField(streetContext.goToField.fieldName);
          if (value !== 1) setValue(1);
          setOweFormData(null);
          setHdFormData(null);
          const esuData =
            streetData && streetData.esus.length > streetContext.goToField.index
              ? streetData.esus[streetContext.goToField.index]
              : null;
          if (esuData) {
            streetContext.onRecordChange(13, esuData.pkId, streetContext.goToField.index, null);
            setEsuFormData({
              pkId: esuData.pkId,
              esuData: esuData,
              index: streetContext.goToField.index,
              totalRecords: streetData.esus.filter((x) => x.changeType !== "D" && x.assignUnassign !== -1).length,
            });
          }
          break;

        case 15:
          setDescriptorFocusedField(streetContext.goToField.fieldName);
          if (value !== 0) setValue(0);
          const descriptorData =
            streetData && streetData.streetDescriptors.length > streetContext.goToField.index
              ? streetData.streetDescriptors[streetContext.goToField.index]
              : null;
          if (descriptorData) {
            streetContext.onRecordChange(15, descriptorData.pkId, streetContext.goToField.index, null);
            setDescriptorFormData({
              pkId: descriptorData.pkId,
              descriptorData: descriptorData,
              index: streetContext.goToField.index,
              totalRecords: streetData.streetDescriptors.filter((x) => x.changeType !== "D").length,
            });
          }
          break;

        case 16:
          setOneWayExemptionFocusedField(streetContext.goToField.fieldName);
          if (value !== 1) setValue(1);
          setHdFormData(null);
          const oweEsuData =
            streetData && streetData.esus.length > streetContext.goToField.parentIndex
              ? streetData.esus[streetContext.goToField.parentIndex]
              : null;
          if (oweEsuData) {
            setEsuFormData({
              pkId: oweEsuData.pkId,
              esuData: oweEsuData,
              index: streetContext.goToField.parentIndex,
              totalRecords: streetData.esus.filter((x) => x.changeType !== "D").length,
            });
            const oneWayExemptionData =
              oweEsuData.oneWayExemptions.length > streetContext.goToField.index
                ? oweEsuData.oneWayExemptions[streetContext.goToField.index]
                : null;
            if (oneWayExemptionData) {
              streetContext.onRecordChange(
                16,
                oneWayExemptionData.pkId,
                streetContext.goToField.index,
                streetContext.goToField.parentIndex
              );
              setOweFormData({
                pkId: oneWayExemptionData.pkId,
                oweData: oneWayExemptionData,
                index: streetContext.goToField.index,
                esuIndex: streetContext.goToField.parentIndex,
                totalRecords: oweEsuData.oneWayExemptions.filter((x) => x.changeType !== "D").length,
              });
            }
          }
          break;

        case 17:
          setHighwayDedicationFocusedField(streetContext.goToField.fieldName);
          if (value !== 1) setValue(1);
          setOweFormData(null);
          const hdEsuData =
            streetData && streetData.esus.length > streetContext.goToField.parentIndex
              ? streetData.esus[streetContext.goToField.parentIndex]
              : null;
          if (hdEsuData) {
            setEsuFormData({
              pkId: hdEsuData.pkId,
              esuData: hdEsuData,
              index: streetContext.goToField.parentIndex,
              totalRecords: streetData.esus.filter((x) => x.changeType !== "D").length,
            });
            const highwayDedicationData =
              hdEsuData.highwayDedications.length > streetContext.goToField.index
                ? hdEsuData.highwayDedications[streetContext.goToField.index]
                : null;
            if (highwayDedicationData) {
              streetContext.onRecordChange(
                17,
                highwayDedicationData.pkId,
                streetContext.goToField.index,
                streetContext.goToField.parentIndex
              );
              setHdFormData({
                pkId: highwayDedicationData.pkId,
                hdData: highwayDedicationData,
                index: streetContext.goToField.index,
                esuIndex: streetContext.goToField.parentIndex,
                totalRecords: oweEsuData.highwayDedications.filter((x) => x.changeType !== "D").length,
              });
            }
          }
          break;

        case 30:
          setSuccessorCrossRefFocusedField(streetContext.goToField.fieldName);
          if (value !== 0) setValue(0);
          const successorCrossRefData =
            streetData && streetData.successorCrossRefs.length > streetContext.goToField.index
              ? streetData.successorCrossRefs[streetContext.goToField.index]
              : null;
          if (successorCrossRefData) {
            streetContext.onRecordChange(30, successorCrossRefData.pkId, streetContext.goToField.index, null);
            setSuccessorCrossRefFormData({
              pkId: successorCrossRefData.pkId,
              successorCrossRefData: successorCrossRefData,
              index: streetContext.goToField.index,
              totalRecords: streetData.successorCrossRefs.filter((x) => x.changeType !== "D").length,
            });
          }
          break;

        case 51:
          setMaintenanceResponsibilityFocusedField(streetContext.goToField.fieldName);
          if (value !== 2) setValue(2);
          clearAsdFormData();
          const maintenanceResponsibilityData =
            streetData && streetData.maintenanceResponsibilities.length > streetContext.goToField.index
              ? streetData.maintenanceResponsibilities[streetContext.goToField.index]
              : null;
          if (maintenanceResponsibilityData) {
            streetContext.onRecordChange(51, maintenanceResponsibilityData.pkId, streetContext.goToField.index, null);
            setMaintenanceResponsibilityFormData({
              pkId: maintenanceResponsibilityData.pkId,
              maintenanceResponsibilityData: maintenanceResponsibilityData,
              index: streetContext.goToField.index,
              totalRecords: streetData.maintenanceResponsibilities.filter((x) => x.changeType !== "D").length,
            });
          }
          break;

        case 52:
          setReinstatementCategoryFocusedField(streetContext.goToField.fieldName);
          if (value !== 2) setValue(2);
          clearAsdFormData();
          const reinstatementCategoryData =
            streetData && streetData.reinstatementCategories.length > streetContext.goToField.index
              ? streetData.reinstatementCategories[streetContext.goToField.index]
              : null;
          if (reinstatementCategoryData) {
            streetContext.onRecordChange(52, reinstatementCategoryData.pkId, streetContext.goToField.index, null);
            setReinstatementCategoryFormData({
              pkId: reinstatementCategoryData.pkId,
              reinstatementCategoryData: reinstatementCategoryData,
              index: streetContext.goToField.index,
              totalRecords: streetData.reinstatementCategories.filter((x) => x.changeType !== "D").length,
            });
          }
          break;

        case 53:
          setOSSpecialDesignationFocusedField(streetContext.goToField.fieldName);
          if (value !== 2) setValue(2);
          clearAsdFormData();
          const osSpecialDesignationData =
            streetData && streetData.specialDesignations.length > streetContext.goToField.index
              ? streetData.specialDesignations[streetContext.goToField.index]
              : null;
          if (osSpecialDesignationData) {
            streetContext.onRecordChange(53, osSpecialDesignationData.pkId, streetContext.goToField.index, null);
            setOSSpecialDesignationFormData({
              pkId: osSpecialDesignationData.pkId,
              osSpecialDesignationData: osSpecialDesignationData,
              index: streetContext.goToField.index,
              totalRecords: streetData.specialDesignations.filter((x) => x.changeType !== "D").length,
            });
          }
          break;

        case 61:
          setInterestFocusedField(streetContext.goToField.fieldName);
          if (value !== 2) setValue(2);
          clearAsdFormData();
          const interestData =
            streetData && streetData.interests.length > streetContext.goToField.index
              ? streetData.interests[streetContext.goToField.index]
              : null;
          if (interestData) {
            streetContext.onRecordChange(61, interestData.pkId, streetContext.goToField.index, null);
            setInterestFormData({
              pkId: interestData.pkId,
              interestData: interestData,
              index: streetContext.goToField.index,
              totalRecords: streetData.interests.filter((x) => x.changeType !== "D").length,
            });
          }
          break;

        case 62:
          setConstructionFocusedField(streetContext.goToField.fieldName);
          if (value !== 2) setValue(2);
          clearAsdFormData();
          const constructionData =
            streetData && streetData.constructions.length > streetContext.goToField.index
              ? streetData.constructions[streetContext.goToField.index]
              : null;
          if (constructionData) {
            streetContext.onRecordChange(62, constructionData.pkId, streetContext.goToField.index, null);
            setConstructionFormData({
              pkId: constructionData.pkId,
              constructionData: constructionData,
              index: streetContext.goToField.index,
              totalRecords: streetData.constructions.filter((x) => x.changeType !== "D").length,
            });
          }
          break;

        case 63:
          setSpecialDesignationFocusedField(streetContext.goToField.fieldName);
          if (value !== 2) setValue(2);
          clearAsdFormData();
          const specialDesignationData =
            streetData && streetData.specialDesignations.length > streetContext.goToField.index
              ? streetData.specialDesignations[streetContext.goToField.index]
              : null;
          if (specialDesignationData) {
            streetContext.onRecordChange(63, specialDesignationData.pkId, streetContext.goToField.index, null);
            setSpecialDesignationFormData({
              pkId: specialDesignationData.pkId,
              specialDesignationData: specialDesignationData,
              index: streetContext.goToField.index,
              totalRecords: streetData.specialDesignations.filter((x) => x.changeType !== "D").length,
            });
          }
          break;

        case 64:
          setHeightWidthWeightFocusedField(streetContext.goToField.fieldName);
          if (value !== 2) setValue(2);
          clearAsdFormData();
          const heightWidthWeightData =
            streetData && streetData.heightWidthWeights.length > streetContext.goToField.index
              ? streetData.heightWidthWeights[streetContext.goToField.index]
              : null;
          if (heightWidthWeightData) {
            streetContext.onRecordChange(64, heightWidthWeightData.pkId, streetContext.goToField.index, null);
            setHwwFormData({
              pkId: heightWidthWeightData.pkId,
              hwwData: heightWidthWeightData,
              index: streetContext.goToField.index,
              totalRecords: streetData.heightWidthWeights.filter((x) => x.changeType !== "D").length,
            });
          }
          break;

        case 66:
          setPublicRightOfWayFocusedField(streetContext.goToField.fieldName);
          if (value !== 2) setValue(2);
          clearAsdFormData();
          const publicRightOfWayData =
            streetData && streetData.publicRightOfWays.length > streetContext.goToField.index
              ? streetData.publicRightOfWays[streetContext.goToField.index]
              : null;
          if (publicRightOfWayData) {
            streetContext.onRecordChange(66, publicRightOfWayData.pkId, streetContext.goToField.index, null);
            setProwFormData({
              pkId: publicRightOfWayData.pkId,
              prowData: publicRightOfWayData,
              index: streetContext.goToField.index,
              totalRecords: streetData.publicRightOfWays.filter((x) => x.changeType !== "D").length,
            });
          }
          break;

        case 72:
          setNoteFocusedField(streetContext.goToField.fieldName);
          if (value !== 4) setValue(4);
          const noteData =
            streetData && streetData.blpuNotes.length > streetContext.goToField.index
              ? streetData.streetNotes[streetContext.goToField.index]
              : null;
          if (noteData) {
            streetContext.onRecordChange(72, noteData.pkId, streetContext.goToField.index, null);
            setNotesFormData({
              pkId: noteData.pkId,
              noteData: noteData,
              index: streetContext.goToField.index,
              totalRecords: streetData.streetNotes.filter((x) => x.changeType !== "D").length,
              variant: "street",
            });
          }
          break;

        default:
          break;
      }

      streetContext.onGoToField(null, null, null, null);
    }
  }, [streetContext, streetContext.goToField, value, streetData]);

  // Update ESU/ASD geometry
  useEffect(() => {
    const contextStreet = sandboxContext.currentSandbox.currentStreet || sandboxContext.currentSandbox.sourceStreet;
    let newStreetData = null;
    const currentDate = GetCurrentDate(false);

    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;

    // console.log("[SF] StreetDataForm", { streetData: streetData });

    if (mapContext.currentLineGeometry) {
      switch (mapContext.currentLineGeometry.objectType) {
        case 13:
          const currentEsu = sandboxContext.currentSandbox.currentStreetRecords.esu
            ? sandboxContext.currentSandbox.currentStreetRecords.esu
            : streetData.esus
            ? streetData.esus.find((x) => x.esuId === mapContext.currentLineGeometry.objectId)
            : null;

          // Only update if geometry has changed
          if (currentEsu && currentEsu.wktGeometry !== mapContext.currentLineGeometry.wktGeometry) {
            const updatedEsu = settingsContext.isScottish
              ? {
                  changeType: contextStreet.usrn === 0 || currentEsu.pkId < 0 ? "I" : "U",
                  classification: currentEsu.classification,
                  classificationDate: currentEsu.classificationDate,
                  endDate: currentEsu.endDate,
                  entryDate: currentEsu.entryDate,
                  esuId: currentEsu.esuId,
                  lastUpdateDate: currentEsu.lastUpdateDate,
                  pkId: currentEsu.pkId,
                  startDate: currentEsu.startDate,
                  state: currentEsu.state,
                  stateDate: currentEsu.stateDate,
                  wktGeometry: mapContext.currentLineGeometry.wktGeometry,
                  assignUnassign: currentEsu.assignUnassign,
                }
              : {
                  entryDate: currentEsu.entryDate,
                  pkId: currentEsu.pkId,
                  changeType: contextStreet.usrn === 0 || currentEsu.pkId < 0 ? "I" : "U",
                  esuId: currentEsu.esuId,
                  esuVersionNumber: currentEsu.esuVersionNumber,
                  numCoordCount: currentEsu.numCoordCount,
                  esuTolerance: currentEsu.esuTolerance,
                  esuStartDate: currentEsu.esuStartDate ? currentEsu.esuStartDate : currentDate,
                  esuEndDate: currentEsu.esuEndDate,
                  esuDirection: currentEsu.esuDirection,
                  wktGeometry: mapContext.currentLineGeometry.wktGeometry,
                  assignUnassign: currentEsu.assignUnassign,
                  highwayDedications: currentEsu.highwayDedications,
                  oneWayExemptions: currentEsu.oneWayExemptions,
                };

            sandboxContext.onSandboxChange("esu", updatedEsu);

            const newEsus = streetData.esus.map((x) => [updatedEsu].find((rec) => rec.esuId === x.esuId) || x);

            const coordinates = getStartEndCoordinates(mapContext.currentLineGeometry.wktGeometry);
            if (coordinates) {
              startX = coordinates.startX;
              startY = coordinates.startY;
              endX = coordinates.endX;
              endY = coordinates.endY;
            }

            newStreetData =
              !settingsContext.isScottish && !HasASD()
                ? {
                    changeType: contextStreet.changeType,
                    usrn: contextStreet.usrn,
                    swaOrgRefNaming: contextStreet.swaOrgRefNaming,
                    streetSurface: contextStreet.streetSurface,
                    streetStartDate: contextStreet.streetStartDate,
                    streetEndDate: contextStreet.streetEndDate,
                    neverExport: contextStreet.neverExport,
                    version: contextStreet.version,
                    recordType: contextStreet.recordType,
                    state: contextStreet.state,
                    stateDate: contextStreet.stateDate,
                    streetClassification: contextStreet.streetClassification,
                    streetTolerance: contextStreet.streetTolerance,
                    streetStartX:
                      contextStreet.streetStartX && contextStreet.streetStartX > 0
                        ? contextStreet.streetStartX
                        : startX,
                    streetStartY:
                      contextStreet.streetStartY && contextStreet.streetStartY > 0
                        ? contextStreet.streetStartY
                        : startY,
                    streetEndX:
                      contextStreet.streetEndX && contextStreet.streetEndX > 0 ? contextStreet.streetEndX : endX,
                    streetEndY:
                      contextStreet.streetEndY && contextStreet.streetEndY > 0 ? contextStreet.streetEndY : endY,
                    pkId: contextStreet.pkId,
                    lastUpdateDate: contextStreet.lastUpdateDate,
                    entryDate: contextStreet.entryDate,
                    streetLastUpdated: contextStreet.streetLastUpdated,
                    streetLastUser: contextStreet.streetLastUser,
                    relatedPropertyCount: contextStreet.relatedPropertyCount,
                    relatedStreetCount: contextStreet.relatedStreetCount,
                    esus: newEsus,
                    streetDescriptors: contextStreet.streetDescriptors,
                    streetNotes: contextStreet.streetNotes,
                  }
                : !settingsContext.isScottish && HasASD()
                ? {
                    changeType: contextStreet.changeType,
                    usrn: contextStreet.usrn,
                    swaOrgRefNaming: contextStreet.swaOrgRefNaming,
                    streetSurface: contextStreet.streetSurface,
                    streetStartDate: contextStreet.streetStartDate,
                    streetEndDate: contextStreet.streetEndDate,
                    neverExport: contextStreet.neverExport,
                    version: contextStreet.version,
                    recordType: contextStreet.recordType,
                    state: contextStreet.state,
                    stateDate: contextStreet.stateDate,
                    streetClassification: contextStreet.streetClassification,
                    streetTolerance: contextStreet.streetTolerance,
                    streetStartX:
                      contextStreet.streetStartX && contextStreet.streetStartX > 0
                        ? contextStreet.streetStartX
                        : startX,
                    streetStartY:
                      contextStreet.streetStartY && contextStreet.streetStartY > 0
                        ? contextStreet.streetStartY
                        : startY,
                    streetEndX:
                      contextStreet.streetEndX && contextStreet.streetEndX > 0 ? contextStreet.streetEndX : endX,
                    streetEndY:
                      contextStreet.streetEndY && contextStreet.streetEndY > 0 ? contextStreet.streetEndY : endY,
                    pkId: contextStreet.pkId,
                    lastUpdateDate: contextStreet.lastUpdateDate,
                    entryDate: contextStreet.entryDate,
                    streetLastUpdated: contextStreet.streetLastUpdated,
                    streetLastUser: contextStreet.streetLastUser,
                    relatedPropertyCount: contextStreet.relatedPropertyCount,
                    relatedStreetCount: contextStreet.relatedStreetCount,
                    esus: newEsus,
                    streetDescriptors: contextStreet.streetDescriptors,
                    streetNotes: contextStreet.streetNotes,
                    interests: contextStreet.recordType < 4 ? contextStreet.interests : null,
                    constructions: contextStreet.recordType < 4 ? contextStreet.constructions : null,
                    specialDesignations: contextStreet.recordType < 4 ? contextStreet.specialDesignations : null,
                    publicRightOfWays: contextStreet.recordType < 4 ? contextStreet.publicRightOfWays : null,
                    heightWidthWeights: contextStreet.recordType < 4 ? contextStreet.heightWidthWeights : null,
                  }
                : {
                    pkId: contextStreet.pkId,
                    changeType: contextStreet.changeType,
                    usrn: contextStreet.usrn,
                    recordType: contextStreet.recordType,
                    swaOrgRefNaming: contextStreet.swaOrgRefNaming,
                    version: contextStreet.version,
                    recordEntryDate: contextStreet.recordEntryDate,
                    lastUpdateDate: contextStreet.lastUpdateDate,
                    streetStartDate: contextStreet.streetStartDate,
                    streetEndDate: contextStreet.streetEndDate,
                    streetStartX:
                      contextStreet.streetStartX && contextStreet.streetStartX > 0
                        ? contextStreet.streetStartX
                        : startX,
                    streetStartY:
                      contextStreet.streetStartY && contextStreet.streetStartY > 0
                        ? contextStreet.streetStartY
                        : startY,
                    streetEndX:
                      contextStreet.streetEndX && contextStreet.streetEndX > 0 ? contextStreet.streetEndX : endX,
                    streetEndY:
                      contextStreet.streetEndY && contextStreet.streetEndY > 0 ? contextStreet.streetEndY : endY,
                    streetTolerance: contextStreet.streetTolerance,
                    esuCount: contextStreet.esuCount,
                    streetLastUpdated: contextStreet.streetLastUpdated,
                    streetLastUser: contextStreet.streetLastUser,
                    neverExport: contextStreet.neverExport,
                    relatedPropertyCount: contextStreet.relatedPropertyCount,
                    relatedStreetCount: contextStreet.relatedStreetCount,
                    lastUpdated: contextStreet.lastUpdated,
                    insertedTimestamp: contextStreet.insertedTimestamp,
                    insertedUser: contextStreet.insertedUser,
                    lastUser: contextStreet.lastUser,
                    esus: newEsus,
                    successorCrossRefs: contextStreet.successorCrossRefs,
                    streetDescriptors: contextStreet.streetDescriptors,
                    streetNotes: contextStreet.streetNotes,
                    maintenanceResponsibilities:
                      contextStreet.recordType < 4 ? contextStreet.maintenanceResponsibilities : null,
                    reinstatementCategories:
                      contextStreet.recordType < 4 ? contextStreet.reinstatementCategories : null,
                    specialDesignations: contextStreet.recordType < 4 ? contextStreet.specialDesignations : null,
                  };

            setEsuFormData({
              pkId: updatedEsu.pkId,
              esuData: updatedEsu,
              index: newStreetData.esus.indexOf(updatedEsu),
              totalRecords: newStreetData.esus.filter((x) => x.changeType !== "D" && x.assignUnassign !== -1).length,
            });
          }
          break;

        case 51: // Maintenance responsibility
          const currentAsd51 = sandboxContext.currentSandbox.currentStreetRecords.maintenanceResponsibility
            ? sandboxContext.currentSandbox.currentStreetRecords.maintenanceResponsibility
            : streetData.maintenanceResponsibilities
            ? streetData.maintenanceResponsibilities.find((x) => x.pkId === mapContext.currentLineGeometry.objectId)
            : null;

          if (currentAsd51 && currentAsd51.wktGeometry !== mapContext.currentLineGeometry.wktGeometry) {
            const updatedAsd51 = {
              usrn: currentAsd51.usrn,
              wholeRoad: currentAsd51.wholeRoad,
              specificLocation: currentAsd51.specificLocation,
              neverExport: currentAsd51.neverExport,
              pkId: currentAsd51.pkId,
              seqNum: currentAsd51.seqNum,
              changeType: contextStreet.usrn === 0 || currentAsd51.pkId < 0 ? "I" : "U",
              custodianCode: currentAsd51.custodianCode,
              maintainingAuthorityCode: currentAsd51.maintainingAuthorityCode,
              streetStatus: currentAsd51.streetStatus,
              state: currentAsd51.state,
              startDate: currentAsd51.startDate ? currentAsd51.startDate : currentDate,
              endDate: currentAsd51.endDate,
              wktGeometry: mapContext.currentLineGeometry.wktGeometry,
            };

            sandboxContext.onSandboxChange("maintenanceResponsibility", updatedAsd51);

            const newAsd51 = streetData.maintenanceResponsibilities.map(
              (x) => [updatedAsd51].find((rec) => rec.pkId === x.pkId) || x
            );

            newStreetData = {
              pkId: contextStreet.pkId,
              changeType: contextStreet.changeType,
              usrn: contextStreet.usrn,
              recordType: contextStreet.recordType,
              swaOrgRefNaming: contextStreet.swaOrgRefNaming,
              version: contextStreet.version,
              recordEntryDate: contextStreet.recordEntryDate,
              lastUpdateDate: contextStreet.lastUpdateDate,
              streetStartDate: contextStreet.streetStartDate,
              streetEndDate: contextStreet.streetEndDate,
              streetStartX: contextStreet.streetStartX,
              streetStartY: contextStreet.streetStartY,
              streetEndX: contextStreet.streetEndX,
              streetEndY: contextStreet.streetEndY,
              streetTolerance: contextStreet.streetTolerance,
              esuCount: contextStreet.esuCount,
              streetLastUpdated: contextStreet.streetLastUpdated,
              streetLastUser: contextStreet.streetLastUser,
              neverExport: contextStreet.neverExport,
              relatedPropertyCount: contextStreet.relatedPropertyCount,
              relatedStreetCount: contextStreet.relatedStreetCount,
              lastUpdated: contextStreet.lastUpdated,
              insertedTimestamp: contextStreet.insertedTimestamp,
              insertedUser: contextStreet.insertedUser,
              lastUser: contextStreet.lastUser,
              esus: contextStreet.esus,
              successorCrossRefs: contextStreet.successorCrossRefs,
              streetDescriptors: contextStreet.streetDescriptors,
              streetNotes: contextStreet.streetNotes,
              maintenanceResponsibilities: newAsd51,
              reinstatementCategories: contextStreet.reinstatementCategories,
              specialDesignations: contextStreet.specialDesignations,
            };

            setMaintenanceResponsibilityFormData({
              pkId: updatedAsd51.pkId,
              maintenanceResponsibilityData: updatedAsd51,
              index: newStreetData.maintenanceResponsibilities.indexOf(updatedAsd51),
              totalRecords: newStreetData.maintenanceResponsibilities.filter((x) => x.changeType !== "D").length,
            });
          }
          break;

        case 52: // Reinstatement category
          const currentAsd52 = sandboxContext.currentSandbox.currentStreetRecords.reinstatementCategory
            ? sandboxContext.currentSandbox.currentStreetRecords.reinstatementCategory
            : streetData.reinstatementCategories
            ? streetData.reinstatementCategories.find((x) => x.pkId === mapContext.currentLineGeometry.objectId)
            : null;

          if (currentAsd52 && currentAsd52.wktGeometry !== mapContext.currentLineGeometry.wktGeometry) {
            const updatedAsd52 = {
              usrn: currentAsd52.usrn,
              wholeRoad: currentAsd52.wholeRoad,
              specificLocation: currentAsd52.specificLocation,
              neverExport: currentAsd52.neverExport,
              pkId: currentAsd52.pkId,
              seqNum: currentAsd52.seqNum,
              changeType: contextStreet.usrn === 0 || currentAsd52.pkId < 0 ? "I" : "U",
              custodianCode: currentAsd52.custodianCode,
              reinstatementAuthorityCode: currentAsd52.reinstatementAuthorityCode,
              reinstatementCategoryCode: currentAsd52.reinstatementCategoryCode,
              state: currentAsd52.state,
              startDate: currentAsd52.startDate ? currentAsd52.startDate : currentDate,
              endDate: currentAsd52.endDate,
              wktGeometry: mapContext.currentLineGeometry.wktGeometry,
            };

            sandboxContext.onSandboxChange("reinstatementCategory", updatedAsd52);

            const newAsd52 = streetData.reinstatementCategories.map(
              (x) => [updatedAsd52].find((rec) => rec.pkId === x.pkId) || x
            );

            newStreetData = {
              pkId: contextStreet.pkId,
              changeType: contextStreet.changeType,
              usrn: contextStreet.usrn,
              recordType: contextStreet.recordType,
              swaOrgRefNaming: contextStreet.swaOrgRefNaming,
              version: contextStreet.version,
              recordEntryDate: contextStreet.recordEntryDate,
              lastUpdateDate: contextStreet.lastUpdateDate,
              streetStartDate: contextStreet.streetStartDate,
              streetEndDate: contextStreet.streetEndDate,
              streetStartX: contextStreet.streetStartX,
              streetStartY: contextStreet.streetStartY,
              streetEndX: contextStreet.streetEndX,
              streetEndY: contextStreet.streetEndY,
              streetTolerance: contextStreet.streetTolerance,
              esuCount: contextStreet.esuCount,
              streetLastUpdated: contextStreet.streetLastUpdated,
              streetLastUser: contextStreet.streetLastUser,
              neverExport: contextStreet.neverExport,
              relatedPropertyCount: contextStreet.relatedPropertyCount,
              relatedStreetCount: contextStreet.relatedStreetCount,
              lastUpdated: contextStreet.lastUpdated,
              insertedTimestamp: contextStreet.insertedTimestamp,
              insertedUser: contextStreet.insertedUser,
              lastUser: contextStreet.lastUser,
              esus: contextStreet.esus,
              successorCrossRefs: contextStreet.successorCrossRefs,
              streetDescriptors: contextStreet.streetDescriptors,
              streetNotes: contextStreet.streetNotes,
              maintenanceResponsibilities: contextStreet.maintenanceResponsibilities,
              reinstatementCategories: newAsd52,
              specialDesignations: contextStreet.specialDesignations,
            };

            setReinstatementCategoryFormData({
              pkId: updatedAsd52.pkId,
              reinstatementCategoryData: updatedAsd52,
              index: newStreetData.reinstatementCategories.indexOf(updatedAsd52),
              totalRecords: newStreetData.reinstatementCategories.filter((x) => x.changeType !== "D").length,
            });
          }
          break;

        case 53: // Special designation
          const currentAsd53 = sandboxContext.currentSandbox.currentStreetRecords.osSpecialDesignation
            ? sandboxContext.currentSandbox.currentStreetRecords.osSpecialDesignation
            : streetData.specialDesignations
            ? streetData.specialDesignations.find((x) => x.pkId === mapContext.currentLineGeometry.objectId)
            : null;

          if (currentAsd53 && currentAsd53.wktGeometry !== mapContext.currentLineGeometry.wktGeometry) {
            const updatedAsd53 = {
              usrn: currentAsd53.usrn,
              wholeRoad: currentAsd53.wholeRoad,
              specificLocation: currentAsd53.specificLocation,
              neverExport: currentAsd53.neverExport,
              pkId: currentAsd53.pkId,
              seqNum: currentAsd53.seqNum,
              changeType: contextStreet.usrn === 0 || currentAsd53.pkId < 0 ? "I" : "U",
              custodianCode: currentAsd53.custodianCode,
              authorityCode: currentAsd53.authorityCode,
              specialDesig: currentAsd53.specialDesig,
              wktGeometry: mapContext.currentLineGeometry.wktGeometry,
              description: currentAsd53.description,
              state: currentAsd53.state,
              startDate: currentAsd53.startDate ? currentAsd53.startDate : currentDate,
              endDate: currentAsd53.endDate,
            };

            sandboxContext.onSandboxChange("osSpecialDesignation", updatedAsd53);

            const newAsd53 = streetData.specialDesignations.map(
              (x) => [updatedAsd53].find((rec) => rec.pkId === x.pkId) || x
            );

            newStreetData = {
              pkId: contextStreet.pkId,
              changeType: contextStreet.changeType,
              usrn: contextStreet.usrn,
              recordType: contextStreet.recordType,
              swaOrgRefNaming: contextStreet.swaOrgRefNaming,
              version: contextStreet.version,
              recordEntryDate: contextStreet.recordEntryDate,
              lastUpdateDate: contextStreet.lastUpdateDate,
              streetStartDate: contextStreet.streetStartDate,
              streetEndDate: contextStreet.streetEndDate,
              streetStartX: contextStreet.streetStartX,
              streetStartY: contextStreet.streetStartY,
              streetEndX: contextStreet.streetEndX,
              streetEndY: contextStreet.streetEndY,
              streetTolerance: contextStreet.streetTolerance,
              esuCount: contextStreet.esuCount,
              streetLastUpdated: contextStreet.streetLastUpdated,
              streetLastUser: contextStreet.streetLastUser,
              neverExport: contextStreet.neverExport,
              relatedPropertyCount: contextStreet.relatedPropertyCount,
              relatedStreetCount: contextStreet.relatedStreetCount,
              lastUpdated: contextStreet.lastUpdated,
              insertedTimestamp: contextStreet.insertedTimestamp,
              insertedUser: contextStreet.insertedUser,
              lastUser: contextStreet.lastUser,
              esus: contextStreet.esus,
              successorCrossRefs: contextStreet.successorCrossRefs,
              streetDescriptors: contextStreet.streetDescriptors,
              streetNotes: contextStreet.streetNotes,
              maintenanceResponsibilities: contextStreet.maintenanceResponsibilities,
              reinstatementCategories: contextStreet.reinstatementCategories,
              specialDesignations: newAsd53,
            };

            setOSSpecialDesignationFormData({
              pkId: updatedAsd53.pkId,
              osSpecialDesignationData: updatedAsd53,
              index: newStreetData.specialDesignations.indexOf(updatedAsd53),
              totalRecords: newStreetData.specialDesignations.filter((x) => x.changeType !== "D").length,
            });
          }
          break;

        case 61: // Interest
          const currentAsd61 = sandboxContext.currentSandbox.currentStreetRecords.interest
            ? sandboxContext.currentSandbox.currentStreetRecords.interest
            : streetData.interests
            ? streetData.interests.find((x) => x.pkId === mapContext.currentLineGeometry.objectId)
            : null;

          if (currentAsd61 && currentAsd61.wktGeometry !== mapContext.currentLineGeometry.wktGeometry) {
            startX = currentAsd61.startX;
            startY = currentAsd61.startY;
            endX = currentAsd61.endX;
            endY = currentAsd61.endY;

            if (!currentAsd61.wholeRoad) {
              const coordinates = getStartEndCoordinates(mapContext.currentLineGeometry.wktGeometry);
              if (coordinates) {
                startX = coordinates.startX;
                startY = coordinates.startY;
                endX = coordinates.endX;
                endY = coordinates.endY;
              }
            }

            const updatedAsd61 = {
              usrn: currentAsd61.usrn,
              wholeRoad: currentAsd61.wholeRoad,
              specificLocation: currentAsd61.specificLocation,
              neverExport: currentAsd61.neverExport,
              changeType: contextStreet.usrn === 0 || currentAsd61.pkId < 0 ? "I" : "U",
              swaOrgRefAuthority: currentAsd61.swaOrgRefAuthority,
              districtRefAuthority: currentAsd61.districtRefAuthority,
              recordStartDate: currentAsd61.startDate ? currentAsd61.recordStartDate : currentDate,
              recordEndDate: currentAsd61.recordEndDate,
              asdCoordinate: currentAsd61.asdCoordinate,
              asdCoordinateCount: currentAsd61.asdCoordinateCount,
              swaOrgRefAuthMaintaining: currentAsd61.swaOrgRefAuthMaintaining,
              streetStatus: currentAsd61.streetStatus,
              interestType: currentAsd61.interestType,
              startX: startX,
              startY: startY,
              endX: endX,
              endY: endY,
              wktGeometry: mapContext.currentLineGeometry.wktGeometry,
              pkId: currentAsd61.pkId,
              seqNum: currentAsd61.seqNum,
            };

            sandboxContext.onSandboxChange("interest", updatedAsd61);

            const newAsd61 = streetData.interests.map((x) => [updatedAsd61].find((rec) => rec.pkId === x.pkId) || x);

            newStreetData = {
              changeType: contextStreet.changeType,
              usrn: contextStreet.usrn,
              swaOrgRefNaming: contextStreet.swaOrgRefNaming,
              streetSurface: contextStreet.streetSurface,
              streetStartDate: contextStreet.streetStartDate,
              streetEndDate: contextStreet.streetEndDate,
              neverExport: contextStreet.neverExport,
              version: contextStreet.version,
              recordType: contextStreet.recordType,
              state: contextStreet.state,
              stateDate: contextStreet.stateDate,
              streetClassification: contextStreet.streetClassification,
              streetTolerance: contextStreet.streetTolerance,
              streetStartX: contextStreet.streetStartX,
              streetStartY: contextStreet.streetStartY,
              streetEndX: contextStreet.streetEndX,
              streetEndY: contextStreet.streetEndY,
              pkId: contextStreet.pkId,
              lastUpdateDate: contextStreet.lastUpdateDate,
              entryDate: contextStreet.entryDate,
              streetLastUpdated: contextStreet.streetLastUpdated,
              streetLastUser: contextStreet.streetLastUser,
              relatedPropertyCount: contextStreet.relatedPropertyCount,
              relatedStreetCount: contextStreet.relatedStreetCount,
              esus: contextStreet.esus,
              streetDescriptors: contextStreet.streetDescriptors,
              streetNotes: contextStreet.streetNotes,
              interests: newAsd61,
              constructions: contextStreet.constructions,
              specialDesignations: contextStreet.specialDesignations,
              publicRightOfWays: contextStreet.publicRightOfWays,
              heightWidthWeights: contextStreet.heightWidthWeights,
            };

            setInterestFormData({
              pkId: updatedAsd61.pkId,
              interestData: updatedAsd61,
              index: newStreetData.interests.indexOf(updatedAsd61),
              totalRecords: newStreetData.interests.filter((x) => x.changeType !== "D").length,
            });
          }
          break;

        case 62: // Construction
          const currentAsd62 = sandboxContext.currentSandbox.currentStreetRecords.construction
            ? sandboxContext.currentSandbox.currentStreetRecords.construction
            : streetData.constructions
            ? streetData.constructions.find((x) => x.pkId === mapContext.currentLineGeometry.objectId)
            : null;

          if (currentAsd62 && currentAsd62.wktGeometry !== mapContext.currentLineGeometry.wktGeometry) {
            startX = currentAsd62.startX;
            startY = currentAsd62.startY;
            endX = currentAsd62.endX;
            endY = currentAsd62.endY;

            if (!currentAsd62.wholeRoad) {
              const coordinates = getStartEndCoordinates(mapContext.currentLineGeometry.wktGeometry);
              if (coordinates) {
                startX = coordinates.startX;
                startY = coordinates.startY;
                endX = coordinates.endX;
                endY = coordinates.endY;
              }
            }

            const updatedAsd62 = {
              usrn: currentAsd62.usrn,
              wholeRoad: currentAsd62.wholeRoad,
              specificLocation: currentAsd62.specificLocation,
              neverExport: currentAsd62.neverExport,
              changeType: contextStreet.usrn === 0 || currentAsd62.pkId < 0 ? "I" : "U",
              recordStartDate: currentAsd62.startDate ? currentAsd62.recordStartDate : currentDate,
              recordEndDate: currentAsd62.recordEndDate,
              reinstatementTypeCode: currentAsd62.reinstatementTypeCode,
              constructionType: currentAsd62.constructionType,
              aggregateAbrasionVal: currentAsd62.aggregateAbrasionVal,
              polishedStoneVal: currentAsd62.polishedStoneVal,
              frostHeaveSusceptibility: currentAsd62.frostHeaveSusceptibility,
              steppedJoint: currentAsd62.steppedJoint,
              asdCoordinate: currentAsd62.asdCoordinate,
              asdCoordinateCount: currentAsd62.asdCoordinateCount,
              constructionStartX: startX,
              constructionStartY: startY,
              constructionEndX: endX,
              constructionEndY: endY,
              constructionDescription: currentAsd62.constructionDescription,
              swaOrgRefConsultant: currentAsd62.swaOrgRefConsultant,
              districtRefConsultant: currentAsd62.districtRefConsultant,
              wktGeometry: mapContext.currentLineGeometry.wktGeometry,
              pkId: currentAsd62.pkId,
              seqNum: currentAsd62.seqNum,
            };

            sandboxContext.onSandboxChange("construction", updatedAsd62);

            const newAsd62 = streetData.constructions.map(
              (x) => [updatedAsd62].find((rec) => rec.pkId === x.pkId) || x
            );

            newStreetData = {
              changeType: contextStreet.changeType,
              usrn: contextStreet.usrn,
              swaOrgRefNaming: contextStreet.swaOrgRefNaming,
              streetSurface: contextStreet.streetSurface,
              streetStartDate: contextStreet.streetStartDate,
              streetEndDate: contextStreet.streetEndDate,
              neverExport: contextStreet.neverExport,
              version: contextStreet.version,
              recordType: contextStreet.recordType,
              state: contextStreet.state,
              stateDate: contextStreet.stateDate,
              streetClassification: contextStreet.streetClassification,
              streetTolerance: contextStreet.streetTolerance,
              streetStartX: contextStreet.streetStartX,
              streetStartY: contextStreet.streetStartY,
              streetEndX: contextStreet.streetEndX,
              streetEndY: contextStreet.streetEndY,
              pkId: contextStreet.pkId,
              lastUpdateDate: contextStreet.lastUpdateDate,
              entryDate: contextStreet.entryDate,
              streetLastUpdated: contextStreet.streetLastUpdated,
              streetLastUser: contextStreet.streetLastUser,
              relatedPropertyCount: contextStreet.relatedPropertyCount,
              relatedStreetCount: contextStreet.relatedStreetCount,
              esus: contextStreet.esus,
              streetDescriptors: contextStreet.streetDescriptors,
              streetNotes: contextStreet.streetNotes,
              interests: contextStreet.interests,
              constructions: newAsd62,
              specialDesignations: contextStreet.specialDesignations,
              publicRightOfWays: contextStreet.publicRightOfWays,
              heightWidthWeights: contextStreet.heightWidthWeights,
            };

            setConstructionFormData({
              pkId: updatedAsd62.pkId,
              constructionData: updatedAsd62,
              index: newStreetData.constructions.indexOf(updatedAsd62),
              totalRecords: newStreetData.constructions.filter((x) => x.changeType !== "D").length,
            });
          }
          break;

        case 63: // Special designation
          const currentAsd63 = sandboxContext.currentSandbox.currentStreetRecords.specialDesignation
            ? sandboxContext.currentSandbox.currentStreetRecords.specialDesignation
            : streetData.specialDesignations
            ? streetData.specialDesignations.find((x) => x.pkId === mapContext.currentLineGeometry.objectId)
            : null;

          if (currentAsd63 && currentAsd63.wktGeometry !== mapContext.currentLineGeometry.wktGeometry) {
            startX = currentAsd63.startX;
            startY = currentAsd63.startY;
            endX = currentAsd63.endX;
            endY = currentAsd63.endY;

            if (!currentAsd63.wholeRoad) {
              const coordinates = getStartEndCoordinates(mapContext.currentLineGeometry.wktGeometry);
              if (coordinates) {
                startX = coordinates.startX;
                startY = coordinates.startY;
                endX = coordinates.endX;
                endY = coordinates.endY;
              }
            }

            const updatedAsd63 = {
              usrn: currentAsd63.usrn,
              wholeRoad: currentAsd63.wholeRoad,
              specificLocation: currentAsd63.specificLocation,
              neverExport: currentAsd63.neverExport,
              pkId: currentAsd63.pkId,
              seqNum: currentAsd63.seqNum,
              changeType: contextStreet.usrn === 0 || currentAsd63.pkId < 0 ? "I" : "U",
              streetSpecialDesigCode: currentAsd63.streetSpecialDesigCode,
              asdCoordinate: currentAsd63.asdCoordinate,
              asdCoordinateCount: currentAsd63.asdCoordinateCount,
              specialDesigPeriodicityCode: currentAsd63.specialDesigPeriodicityCode,
              specialDesigStartX: startX,
              specialDesigStartY: startY,
              specialDesigEndX: endX,
              specialDesigEndY: endY,
              recordStartDate: currentAsd63.startDate ? currentAsd63.recordStartDate : currentDate,
              recordEndDate: currentAsd63.recordEndDate,
              specialDesigStartDate: currentAsd63.specialDesigStartDate,
              specialDesigEndDate: currentAsd63.specialDesigEndDate,
              specialDesigStartTime: currentAsd63.specialDesigStartTime,
              specialDesigEndTime: currentAsd63.specialDesigEndTime,
              specialDesigDescription: currentAsd63.specialDesigDescription,
              swaOrgRefConsultant: currentAsd63.swaOrgRefConsultant,
              districtRefConsultant: currentAsd63.districtRefConsultant,
              specialDesigSourceText: currentAsd63.specialDesigSourceText,
              wktGeometry: mapContext.currentLineGeometry.wktGeometry,
            };

            sandboxContext.onSandboxChange("specialDesignation", updatedAsd63);

            const newAsd63 = streetData.specialDesignations.map(
              (x) => [updatedAsd63].find((rec) => rec.pkId === x.pkId) || x
            );

            newStreetData = {
              changeType: contextStreet.changeType,
              usrn: contextStreet.usrn,
              swaOrgRefNaming: contextStreet.swaOrgRefNaming,
              streetSurface: contextStreet.streetSurface,
              streetStartDate: contextStreet.streetStartDate,
              streetEndDate: contextStreet.streetEndDate,
              neverExport: contextStreet.neverExport,
              version: contextStreet.version,
              recordType: contextStreet.recordType,
              state: contextStreet.state,
              stateDate: contextStreet.stateDate,
              streetClassification: contextStreet.streetClassification,
              streetTolerance: contextStreet.streetTolerance,
              streetStartX: contextStreet.streetStartX,
              streetStartY: contextStreet.streetStartY,
              streetEndX: contextStreet.streetEndX,
              streetEndY: contextStreet.streetEndY,
              pkId: contextStreet.pkId,
              lastUpdateDate: contextStreet.lastUpdateDate,
              entryDate: contextStreet.entryDate,
              streetLastUpdated: contextStreet.streetLastUpdated,
              streetLastUser: contextStreet.streetLastUser,
              relatedPropertyCount: contextStreet.relatedPropertyCount,
              relatedStreetCount: contextStreet.relatedStreetCount,
              esus: contextStreet.esus,
              streetDescriptors: contextStreet.streetDescriptors,
              streetNotes: contextStreet.streetNotes,
              interests: contextStreet.interests,
              constructions: contextStreet.constructions,
              specialDesignations: newAsd63,
              publicRightOfWays: contextStreet.publicRightOfWays,
              heightWidthWeights: contextStreet.heightWidthWeights,
            };

            setSpecialDesignationFormData({
              pkId: updatedAsd63.pkId,
              specialDesignationData: updatedAsd63,
              index: newStreetData.specialDesignations.indexOf(updatedAsd63),
              totalRecords: newStreetData.specialDesignations.filter((x) => x.changeType !== "D").length,
            });
          }
          break;

        case 64: // Height, width & weight designation
          const currentAsd64 = sandboxContext.currentSandbox.currentStreetRecords.hww
            ? sandboxContext.currentSandbox.currentStreetRecords.hww
            : streetData.heightWidthWeights
            ? streetData.heightWidthWeights.find((x) => x.pkId === mapContext.currentLineGeometry.objectId)
            : null;

          if (currentAsd64 && currentAsd64.wktGeometry !== mapContext.currentLineGeometry.wktGeometry) {
            startX = currentAsd64.startX;
            startY = currentAsd64.startY;
            endX = currentAsd64.endX;
            endY = currentAsd64.endY;

            if (!currentAsd64.wholeRoad) {
              const coordinates = getStartEndCoordinates(mapContext.currentLineGeometry.wktGeometry);
              if (coordinates) {
                startX = coordinates.startX;
                startY = coordinates.startY;
                endX = coordinates.endX;
                endY = coordinates.endY;
              }
            }

            const updatedAsd64 = {
              usrn: currentAsd64.usrn,
              wholeRoad: currentAsd64.wholeRoad,
              specificLocation: currentAsd64.specificLocation,
              neverExport: currentAsd64.neverExport,
              changeType: contextStreet.usrn === 0 || currentAsd64.pkId < 0 ? "I" : "U",
              hwwRestrictionCode: currentAsd64.hwwRestrictionCode,
              recordStartDate: currentAsd64.startDate ? currentAsd64.recordStartDate : currentDate,
              recordEndDate: currentAsd64.recordEndDate,
              asdCoordinate: currentAsd64.asdCoordinate,
              asdCoordinateCount: currentAsd64.asdCoordinateCount,
              hwwStartX: startX,
              hwwStartY: startY,
              hwwEndX: endX,
              hwwEndY: endY,
              valueMetric: currentAsd64.valueMetric,
              troText: currentAsd64.troText,
              featureDescription: currentAsd64.featureDescription,
              sourceText: currentAsd64.sourceText,
              swaOrgRefConsultant: currentAsd64.swaOrgRefConsultant,
              districtRefConsultant: currentAsd64.districtRefConsultant,
              wktGeometry: mapContext.currentLineGeometry.wktGeometry,
              pkId: currentAsd64.pkId,
              seqNum: currentAsd64.seqNum,
            };

            sandboxContext.onSandboxChange("hww", updatedAsd64);

            const newAsd64 = streetData.heightWidthWeights.map(
              (x) => [updatedAsd64].find((rec) => rec.pkId === x.pkId) || x
            );

            newStreetData = {
              changeType: contextStreet.changeType,
              usrn: contextStreet.usrn,
              swaOrgRefNaming: contextStreet.swaOrgRefNaming,
              streetSurface: contextStreet.streetSurface,
              streetStartDate: contextStreet.streetStartDate,
              streetEndDate: contextStreet.streetEndDate,
              neverExport: contextStreet.neverExport,
              version: contextStreet.version,
              recordType: contextStreet.recordType,
              state: contextStreet.state,
              stateDate: contextStreet.stateDate,
              streetClassification: contextStreet.streetClassification,
              streetTolerance: contextStreet.streetTolerance,
              streetStartX: contextStreet.streetStartX,
              streetStartY: contextStreet.streetStartY,
              streetEndX: contextStreet.streetEndX,
              streetEndY: contextStreet.streetEndY,
              pkId: contextStreet.pkId,
              lastUpdateDate: contextStreet.lastUpdateDate,
              entryDate: contextStreet.entryDate,
              streetLastUpdated: contextStreet.streetLastUpdated,
              streetLastUser: contextStreet.streetLastUser,
              relatedPropertyCount: contextStreet.relatedPropertyCount,
              relatedStreetCount: contextStreet.relatedStreetCount,
              esus: contextStreet.esus,
              streetDescriptors: contextStreet.streetDescriptors,
              streetNotes: contextStreet.streetNotes,
              interests: contextStreet.interests,
              constructions: contextStreet.constructions,
              specialDesignations: contextStreet.specialDesignations,
              publicRightOfWays: contextStreet.publicRightOfWays,
              heightWidthWeights: newAsd64,
            };

            setHwwFormData({
              pkId: updatedAsd64.pkId,
              hwwData: updatedAsd64,
              index: newStreetData.heightWidthWeights.indexOf(updatedAsd64),
              totalRecords: newStreetData.heightWidthWeights.filter((x) => x.changeType !== "D").length,
            });
          }
          break;

        case 66: // Public Right of Way
          const currentAsd66 = sandboxContext.currentSandbox.currentStreetRecords.prow
            ? sandboxContext.currentSandbox.currentStreetRecords.prow
            : streetData.heightWidthWeights
            ? streetData.heightWidthWeights.find((x) => x.pkId === mapContext.currentLineGeometry.objectId)
            : null;

          if (currentAsd66 && currentAsd66.wktGeometry !== mapContext.currentLineGeometry.wktGeometry) {
            startX = currentAsd66.startX;
            startY = currentAsd66.startY;
            endX = currentAsd66.endX;
            endY = currentAsd66.endY;

            if (!currentAsd66.defMapGeometryType) {
              const coordinates = getStartEndCoordinates(mapContext.currentLineGeometry.wktGeometry);
              if (coordinates) {
                startX = coordinates.startX;
                startY = coordinates.startY;
                endX = coordinates.endX;
                endY = coordinates.endY;
              }
            }

            const updatedAsd66 = {
              changeType: contextStreet.usrn === 0 || currentAsd66.pkId < 0 ? "I" : "U",
              prowUsrn: currentAsd66.prowUsrn,
              defMapGeometryType: currentAsd66.defMapGeometryType,
              defMapGeometryCount: currentAsd66.defMapGeometryCount,
              prowLength: currentAsd66.prowLength,
              prowRights: currentAsd66.prowRights,
              pedAccess: currentAsd66.pedAccess,
              equAccess: currentAsd66.equAccess,
              nonMotAccess: currentAsd66.nonMotAccess,
              cycAccess: currentAsd66.cycAccess,
              motAccess: currentAsd66.motAccess,
              recordStartDate: currentAsd66.recordStartDate,
              relevantStartDate: currentAsd66.relevantStartDate,
              recordEndDate: currentAsd66.recordEndDate,
              prowStatus: currentAsd66.prowStatus,
              consultStartDate: currentAsd66.consultStartDate,
              consultEndDate: currentAsd66.consultEndDate,
              consultRef: currentAsd66.consultRef,
              consultDetails: currentAsd66.consultDetails,
              appealDate: currentAsd66.appealDate,
              appealRef: currentAsd66.appealRef,
              appealDetails: currentAsd66.appealDetails,
              divRelatedUsrn: currentAsd66.divRelatedUsrn,
              prowLocation: currentAsd66.prowLocation,
              prowDetails: currentAsd66.prowDetails,
              promotedRoute: currentAsd66.promotedRoute,
              accessibleRoute: currentAsd66.accessibleRoute,
              sourceText: currentAsd66.sourceText,
              prowOrgRefConsultant: currentAsd66.prowOrgRefConsultant,
              prowDistrictRefConsultant: currentAsd66.prowDistrictRefConsultant,
              neverExport: currentAsd66.neverExport,
              pkId: currentAsd66.pkId,
              wktGeometry: mapContext.currentLineGeometry.wktGeometry,
            };

            sandboxContext.onSandboxChange("prow", updatedAsd66);

            const newAsd66 = streetData.publicRightOfWays.map(
              (x) => [updatedAsd66].find((rec) => rec.pkId === x.pkId) || x
            );

            newStreetData = {
              changeType: contextStreet.changeType,
              usrn: contextStreet.usrn,
              swaOrgRefNaming: contextStreet.swaOrgRefNaming,
              streetSurface: contextStreet.streetSurface,
              streetStartDate: contextStreet.streetStartDate,
              streetEndDate: contextStreet.streetEndDate,
              neverExport: contextStreet.neverExport,
              version: contextStreet.version,
              recordType: contextStreet.recordType,
              state: contextStreet.state,
              stateDate: contextStreet.stateDate,
              streetClassification: contextStreet.streetClassification,
              streetTolerance: contextStreet.streetTolerance,
              streetStartX: contextStreet.streetStartX,
              streetStartY: contextStreet.streetStartY,
              streetEndX: contextStreet.streetEndX,
              streetEndY: contextStreet.streetEndY,
              pkId: contextStreet.pkId,
              lastUpdateDate: contextStreet.lastUpdateDate,
              entryDate: contextStreet.entryDate,
              streetLastUpdated: contextStreet.streetLastUpdated,
              streetLastUser: contextStreet.streetLastUser,
              relatedPropertyCount: contextStreet.relatedPropertyCount,
              relatedStreetCount: contextStreet.relatedStreetCount,
              esus: contextStreet.esus,
              streetDescriptors: contextStreet.streetDescriptors,
              streetNotes: contextStreet.streetNotes,
              interests: contextStreet.interests,
              constructions: contextStreet.constructions,
              specialDesignations: contextStreet.specialDesignations,
              publicRightOfWays: newAsd66,
              heightWidthWeights: contextStreet.heightWidthWeights,
            };

            setProwFormData({
              pkId: updatedAsd66.pkId,
              prowData: updatedAsd66,
              index: newStreetData.publicRightOfWays.indexOf(updatedAsd66),
              totalRecords: newStreetData.publicRightOfWays.filter((x) => x.changeType !== "D").length,
            });
          }
          break;

        default:
          break;
      }

      if (newStreetData) {
        mapContext.onSetLineGeometry(null);
        updateMapStreetData(
          newStreetData,
          settingsContext.isScottish && newStreetData && newStreetData.recordType < 4
            ? newStreetData.maintenanceResponsibilities
            : null,
          settingsContext.isScottish && newStreetData && newStreetData.recordType < 4
            ? newStreetData.reinstatementCategories
            : null,
          settingsContext.isScottish && newStreetData && newStreetData.recordType < 4
            ? newStreetData.specialDesignations
            : null,
          !settingsContext.isScottish && HasASD() && newStreetData && newStreetData.recordType < 4
            ? newStreetData.interests
            : null,
          !settingsContext.isScottish && HasASD() && newStreetData && newStreetData.recordType < 4
            ? newStreetData.constructions
            : null,
          !settingsContext.isScottish && HasASD() && newStreetData && newStreetData.recordType < 4
            ? newStreetData.specialDesignations
            : null,
          !settingsContext.isScottish && HasASD() && newStreetData && newStreetData.recordType < 4
            ? newStreetData.heightWidthWeights
            : null,
          !settingsContext.isScottish && HasASD() && newStreetData && newStreetData.recordType < 4
            ? newStreetData.publicRightOfWays
            : null,
          settingsContext.isScottish,
          mapContext,
          lookupContext.currentLookups
        );

        setStreetData(newStreetData);

        switch (mapContext.currentLineGeometry.objectType) {
          case 13:
            sandboxContext.onUpdateAndClear("currentStreet", newStreetData, "esu");

            esuChanged.current = true;
            streetContext.onEsuDataChange(true);
            break;

          case 51:
            sandboxContext.onUpdateAndClear("currentStreet", newStreetData, "maintenanceResponsibility");
            break;

          case 52:
            sandboxContext.onUpdateAndClear("currentStreet", newStreetData, "reinstatementCategory");
            break;

          case 53:
            sandboxContext.onUpdateAndClear("currentStreet", newStreetData, "osSpecialDesignation");
            break;

          case 61:
            sandboxContext.onUpdateAndClear("currentStreet", newStreetData, "interest");
            break;

          case 62:
            sandboxContext.onUpdateAndClear("currentStreet", newStreetData, "construction");
            break;

          case 63:
            sandboxContext.onUpdateAndClear("currentStreet", newStreetData, "specialDesignation");
            break;

          case 64:
            sandboxContext.onUpdateAndClear("currentStreet", newStreetData, "hww");
            break;

          default:
            break;
        }

        streetContext.onStreetModified(true);
        setSaveDisabled(false);
      }
    }
  }, [
    mapContext.currentLineGeometry,
    streetData,
    sandboxContext,
    mapContext,
    streetContext,
    settingsContext,
    lookupContext,
  ]);

  // Create an ESU if the start and end coordinates are supplied
  useEffect(() => {
    const contextStreet = sandboxContext.currentSandbox.currentStreet || sandboxContext.currentSandbox.sourceStreet;
    let newStreetData = null;
    const currentDate = GetCurrentDate(false);
    let esuData = contextStreet ? contextStreet.esus : null;

    if (mapContext.currentStreetStart) {
      if (
        mapContext.currentStreetStart.x !== contextStreet.streetStartX ||
        mapContext.currentStreetStart.y !== contextStreet.streetStartY
      ) {
        if (
          (!contextStreet.esus || contextStreet.esus.length === 0) &&
          contextStreet.streetEndX &&
          contextStreet.streetEndY
        ) {
          esuData = [
            {
              changeType: "I",
              esuVersionNumber: 1,
              numCoordCount: 2,
              esuTolerance: 10,
              esuStartDate: currentDate,
              esuEndDate: null,
              esuDirection: 1,
              wktGeometry: `LINESTRING (${mapContext.currentStreetStart.x} ${mapContext.currentStreetStart.y}, ${contextStreet.streetEndX} ${contextStreet.streetEndY})`,
              assignUnassign: 0,
              highwayDedications: [],
              oneWayExemptions: [],
              pkId: -10,
              esuId: -10,
              entryDate: currentDate,
            },
          ];
        }

        newStreetData =
          !settingsContext.isScottish && !HasASD()
            ? {
                changeType: contextStreet.changeType,
                usrn: contextStreet.usrn,
                swaOrgRefNaming: contextStreet.swaOrgRefNaming,
                streetSurface: contextStreet.streetSurface,
                streetStartDate: contextStreet.streetStartDate,
                streetEndDate: contextStreet.streetEndDate,
                neverExport: contextStreet.neverExport,
                version: contextStreet.version,
                recordType: contextStreet.recordType,
                state: contextStreet.state,
                stateDate: contextStreet.stateDate,
                streetClassification: contextStreet.streetClassification,
                streetTolerance: contextStreet.streetTolerance,
                streetStartX: mapContext.currentStreetStart.x,
                streetStartY: mapContext.currentStreetStart.y,
                streetEndX: contextStreet.streetEndX,
                streetEndY: contextStreet.streetEndY,
                pkId: contextStreet.pkId,
                lastUpdateDate: contextStreet.lastUpdateDate,
                entryDate: contextStreet.entryDate,
                streetLastUpdated: contextStreet.streetLastUpdated,
                streetLastUser: contextStreet.streetLastUser,
                relatedPropertyCount: contextStreet.relatedPropertyCount,
                relatedStreetCount: contextStreet.relatedStreetCount,
                esus: esuData,
                streetDescriptors: contextStreet.streetDescriptors,
                streetNotes: contextStreet.streetNotes,
              }
            : !settingsContext.isScottish && HasASD()
            ? {
                changeType: contextStreet.changeType,
                usrn: contextStreet.usrn,
                swaOrgRefNaming: contextStreet.swaOrgRefNaming,
                streetSurface: contextStreet.streetSurface,
                streetStartDate: contextStreet.streetStartDate,
                streetEndDate: contextStreet.streetEndDate,
                neverExport: contextStreet.neverExport,
                version: contextStreet.version,
                recordType: contextStreet.recordType,
                state: contextStreet.state,
                stateDate: contextStreet.stateDate,
                streetClassification: contextStreet.streetClassification,
                streetTolerance: contextStreet.streetTolerance,
                streetStartX: mapContext.currentStreetStart.x,
                streetStartY: mapContext.currentStreetStart.y,
                streetEndX: contextStreet.streetEndX,
                streetEndY: contextStreet.streetEndY,
                pkId: contextStreet.pkId,
                lastUpdateDate: contextStreet.lastUpdateDate,
                entryDate: contextStreet.entryDate,
                streetLastUpdated: contextStreet.streetLastUpdated,
                streetLastUser: contextStreet.streetLastUser,
                relatedPropertyCount: contextStreet.relatedPropertyCount,
                relatedStreetCount: contextStreet.relatedStreetCount,
                esus: esuData,
                streetDescriptors: contextStreet.streetDescriptors,
                streetNotes: contextStreet.streetNotes,
                interests: contextStreet.recordType < 4 ? contextStreet.interests : null,
                constructions: contextStreet.recordType < 4 ? contextStreet.constructions : null,
                specialDesignations: contextStreet.recordType < 4 ? contextStreet.specialDesignations : null,
                publicRightOfWays: contextStreet.recordType < 4 ? contextStreet.publicRightOfWays : null,
                heightWidthWeights: contextStreet.recordType < 4 ? contextStreet.heightWidthWeights : null,
              }
            : {
                pkId: contextStreet.pkId,
                changeType: contextStreet.changeType,
                usrn: contextStreet.usrn,
                recordType: contextStreet.recordType,
                swaOrgRefNaming: contextStreet.swaOrgRefNaming,
                version: contextStreet.version,
                recordEntryDate: contextStreet.recordEntryDate,
                lastUpdateDate: contextStreet.lastUpdateDate,
                streetStartDate: contextStreet.streetStartDate,
                streetEndDate: contextStreet.streetEndDate,
                streetStartX: mapContext.currentStreetStart.x,
                streetStartY: mapContext.currentStreetStart.y,
                streetEndX: contextStreet.streetEndX,
                streetEndY: contextStreet.streetEndY,
                streetTolerance: contextStreet.streetTolerance,
                esuCount: contextStreet.esuCount,
                streetLastUpdated: contextStreet.streetLastUpdated,
                streetLastUser: contextStreet.streetLastUser,
                neverExport: contextStreet.neverExport,
                relatedPropertyCount: contextStreet.relatedPropertyCount,
                relatedStreetCount: contextStreet.relatedStreetCount,
                lastUpdated: contextStreet.lastUpdated,
                insertedTimestamp: contextStreet.insertedTimestamp,
                insertedUser: contextStreet.insertedUser,
                lastUser: contextStreet.lastUser,
                esus: esuData,
                successorCrossRefs: contextStreet.successorCrossRefs,
                streetDescriptors: contextStreet.streetDescriptors,
                streetNotes: contextStreet.streetNotes,
                interests: contextStreet.recordType < 4 ? contextStreet.interests : null,
                constructions: contextStreet.recordType < 4 ? contextStreet.constructions : null,
                specialDesignations: contextStreet.recordType < 4 ? contextStreet.specialDesignations : null,
              };
      }
    } else if (mapContext.currentStreetEnd) {
      if (
        mapContext.currentStreetEnd.x !== contextStreet.streetEndX ||
        mapContext.currentStreetEnd.y !== contextStreet.streetEndY
      ) {
        if (
          (!contextStreet.esus || contextStreet.esus.length === 0) &&
          contextStreet.streetStartX &&
          contextStreet.streetStartY
        ) {
          esuData = [
            {
              changeType: "I",
              esuVersionNumber: 1,
              numCoordCount: 2,
              esuTolerance: 10,
              esuStartDate: currentDate,
              esuEndDate: null,
              esuDirection: 1,
              wktGeometry: `LINESTRING (${contextStreet.streetStartX} ${contextStreet.streetStartY}, ${mapContext.currentStreetEnd.x} ${mapContext.currentStreetEnd.y})`,
              assignUnassign: 0,
              highwayDedications: [],
              oneWayExemptions: [],
              pkId: -10,
              esuId: -10,
              entryDate: currentDate,
            },
          ];
        }

        newStreetData =
          !settingsContext.isScottish && !HasASD()
            ? {
                changeType: contextStreet.changeType,
                usrn: contextStreet.usrn,
                swaOrgRefNaming: contextStreet.swaOrgRefNaming,
                streetSurface: contextStreet.streetSurface,
                streetStartDate: contextStreet.streetStartDate,
                streetEndDate: contextStreet.streetEndDate,
                neverExport: contextStreet.neverExport,
                version: contextStreet.version,
                recordType: contextStreet.recordType,
                state: contextStreet.state,
                stateDate: contextStreet.stateDate,
                streetClassification: contextStreet.streetClassification,
                streetTolerance: contextStreet.streetTolerance,
                streetStartX: contextStreet.streetStartX,
                streetStartY: contextStreet.streetStartY,
                streetEndX: mapContext.currentStreetEnd.x,
                streetEndY: mapContext.currentStreetEnd.y,
                pkId: contextStreet.pkId,
                lastUpdateDate: contextStreet.lastUpdateDate,
                entryDate: contextStreet.entryDate,
                streetLastUpdated: contextStreet.streetLastUpdated,
                streetLastUser: contextStreet.streetLastUser,
                relatedPropertyCount: contextStreet.relatedPropertyCount,
                relatedStreetCount: contextStreet.relatedStreetCount,
                esus: esuData,
                streetDescriptors: contextStreet.streetDescriptors,
                streetNotes: contextStreet.streetNotes,
              }
            : !settingsContext.isScottish && HasASD()
            ? {
                changeType: contextStreet.changeType,
                usrn: contextStreet.usrn,
                swaOrgRefNaming: contextStreet.swaOrgRefNaming,
                streetSurface: contextStreet.streetSurface,
                streetStartDate: contextStreet.streetStartDate,
                streetEndDate: contextStreet.streetEndDate,
                neverExport: contextStreet.neverExport,
                version: contextStreet.version,
                recordType: contextStreet.recordType,
                state: contextStreet.state,
                stateDate: contextStreet.stateDate,
                streetClassification: contextStreet.streetClassification,
                streetTolerance: contextStreet.streetTolerance,
                streetStartX: contextStreet.streetStartX,
                streetStartY: contextStreet.streetStartY,
                streetEndX: mapContext.currentStreetEnd.x,
                streetEndY: mapContext.currentStreetEnd.y,
                pkId: contextStreet.pkId,
                lastUpdateDate: contextStreet.lastUpdateDate,
                entryDate: contextStreet.entryDate,
                streetLastUpdated: contextStreet.streetLastUpdated,
                streetLastUser: contextStreet.streetLastUser,
                relatedPropertyCount: contextStreet.relatedPropertyCount,
                relatedStreetCount: contextStreet.relatedStreetCount,
                esus: esuData,
                streetDescriptors: contextStreet.streetDescriptors,
                streetNotes: contextStreet.streetNotes,
                interests: contextStreet.recordType < 4 ? contextStreet.interests : null,
                constructions: contextStreet.recordType < 4 ? contextStreet.constructions : null,
                specialDesignations: contextStreet.recordType < 4 ? contextStreet.specialDesignations : null,
                publicRightOfWays: contextStreet.recordType < 4 ? contextStreet.publicRightOfWays : null,
                heightWidthWeights: contextStreet.recordType < 4 ? contextStreet.heightWidthWeights : null,
              }
            : {
                pkId: contextStreet.pkId,
                changeType: contextStreet.changeType,
                usrn: contextStreet.usrn,
                recordType: contextStreet.recordType,
                swaOrgRefNaming: contextStreet.swaOrgRefNaming,
                version: contextStreet.version,
                recordEntryDate: contextStreet.recordEntryDate,
                lastUpdateDate: contextStreet.lastUpdateDate,
                streetStartDate: contextStreet.streetStartDate,
                streetEndDate: contextStreet.streetEndDate,
                streetStartX: contextStreet.streetStartX,
                streetStartY: contextStreet.streetStartY,
                streetEndX: mapContext.currentStreetEnd.x,
                streetEndY: mapContext.currentStreetEnd.y,
                streetTolerance: contextStreet.streetTolerance,
                esuCount: contextStreet.esuCount,
                streetLastUpdated: contextStreet.streetLastUpdated,
                streetLastUser: contextStreet.streetLastUser,
                neverExport: contextStreet.neverExport,
                relatedPropertyCount: contextStreet.relatedPropertyCount,
                relatedStreetCount: contextStreet.relatedStreetCount,
                lastUpdated: contextStreet.lastUpdated,
                insertedTimestamp: contextStreet.insertedTimestamp,
                insertedUser: contextStreet.insertedUser,
                lastUser: contextStreet.lastUser,
                esus: esuData,
                successorCrossRefs: contextStreet.successorCrossRefs,
                streetDescriptors: contextStreet.streetDescriptors,
                streetNotes: contextStreet.streetNotes,
                maintenanceResponsibility:
                  contextStreet.recordType < 4 ? contextStreet.maintenanceResponsibility : null,
                reinstatementCategory: contextStreet.recordType < 4 ? contextStreet.reinstatementCategory : null,
                specialDesignations: contextStreet.recordType < 4 ? contextStreet.specialDesignations : null,
              };
      }
    }

    if (newStreetData) {
      mapContext.onSetCoordinate(null);
      if (mapContext.currentPointCaptureMode === "streetStart" || mapContext.currentPointCaptureMode === "streetEnd") {
        const engDescriptor = newStreetData.streetDescriptors.find((x) => x.language === "ENG");

        const currentSearchStreets = [
          {
            usrn: newStreetData.usrn,
            description: engDescriptor.streetDescriptor,
            language: "ENG",
            locality: engDescriptor.locality,
            town: engDescriptor.town,
            state: !settingsContext.isScottish ? newStreetData.state : undefined,
            type: newStreetData.recordType,
            esus: newStreetData.esus.map((esu) => ({
              esuId: esu.esuId,
              state: settingsContext.isScottish ? esu.state : undefined,
              geometry: esu.wktGeometry && esu.wktGeometry !== "" ? GetWktCoordinates(esu.wktGeometry) : undefined,
            })),
            asdType51:
              settingsContext.isScottish &&
              newStreetData.maintenanceResponsibilities.map((asdRec) => ({
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
              settingsContext.isScottish &&
              newStreetData.reinstatementCategories.map((asdRec) => ({
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
              settingsContext.isScottish &&
              newStreetData.specialDesignations.map((asdRec) => ({
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
              !settingsContext.isScottish &&
              HasASD() &&
              newStreetData.recordType < 4 &&
              newStreetData.interests.map((asdRec) => ({
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
              !settingsContext.isScottish &&
              HasASD() &&
              newStreetData.recordType < 4 &&
              newStreetData.constructions.map((asdRec) => ({
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
              !settingsContext.isScottish &&
              HasASD() &&
              newStreetData.recordType < 4 &&
              newStreetData.specialDesignations.map((asdRec) => ({
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
              !settingsContext.isScottish &&
              HasASD() &&
              newStreetData.recordType < 4 &&
              newStreetData.heightWidthWeights.map((asdRec) => ({
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
              !settingsContext.isScottish &&
              HasASD() &&
              newStreetData.recordType < 4 &&
              newStreetData.publicRightOfWays.map((asdRec) => ({
                type: 66,
                pkId: asdRec.pkId,
                prowUsrn: asdRec.prowUsrn,
                prowRights: asdRec.prowRights,
                prowStatus: asdRec.prowStatus,
                prowOrgRefConsultant: asdRec.prowOrgRefConsultant,
                prowDistrictRefConsultant: asdRec.prowDistrictRefConsultant,
                defMapGeometryType: asdRec.defMapGeometryType,
                geometry:
                  asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
              })),
          },
        ];

        mapContext.onSearchDataChange(currentSearchStreets, [], newStreetData.usrn, null);
      }
      setStreetData(newStreetData);
      sandboxContext.onUpdateAndClear("currentStreet", newStreetData, "esu");
      setSaveDisabled(false);
      streetContext.onStreetModified(true);
    }
  }, [
    mapContext.currentStreetStart,
    mapContext.currentStreetEnd,
    mapContext,
    sandboxContext,
    streetContext,
    settingsContext,
  ]);

  // Divide an ESU
  useEffect(() => {
    if (mapContext.currentDivideEsu) {
      const contextStreet = sandboxContext.currentSandbox.currentStreet || sandboxContext.currentSandbox.sourceStreet;
      const originalEsu =
        sandboxContext.currentSandbox.currentStreetRecords.esu ||
        contextStreet.esus.find((x) => x.esuId === mapContext.currentDivideEsu.esuId);

      if (originalEsu) {
        if (esuFormData) {
          setHdFormData(null);
          setOweFormData(null);
          setEsuFormData(null);
        }

        const currentDate = GetCurrentDate(false);

        const updatedOriginal = settingsContext.isScottish
          ? {
              esuId: originalEsu.esuId,
              changeType: "D",
              state: 4, // Permanently closed
              stateDate: currentDate,
              classification: originalEsu.classification,
              classificationDate: originalEsu.classificationDate,
              startDate: originalEsu.startDate,
              endDate: currentDate,
              wktGeometry: originalEsu.wktGeometry,
              assignUnassign: originalEsu.assignUnassign,
              pkId: originalEsu.pkId,
            }
          : {
              entryDate: originalEsu.entryDate,
              pkId: originalEsu.pkId,
              esuId: originalEsu.esuId,
              changeType: "D",
              esuVersionNumber: originalEsu.esuVersionNumber,
              numCoordCount: originalEsu.numCoordCount,
              esuTolerance: originalEsu.esuTolerance,
              esuStartDate: originalEsu.esuStartDate,
              esuEndDate: currentDate,
              esuDirection: originalEsu.esuDirection,
              wktGeometry: originalEsu.wktGeometry,
              assignUnassign: originalEsu.assignUnassign,
              highwayDedications: originalEsu.highwayDedications
                ? originalEsu.highwayDedications.map((hd) => {
                    return {
                      pkId: hd.pkId,
                      esuId: hd.esuId,
                      seqNum: hd.seqNum,
                      changeType: "D",
                      highwayDedicationCode: hd.highwayDedicationCode,
                      recordEndDate: currentDate,
                      hdStartDate: hd.hdStartDate,
                      hdEndDate: currentDate,
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
              oneWayExemptions: originalEsu.oneWayExemptions
                ? originalEsu.oneWayExemptions.map((owe) => {
                    return {
                      pkId: owe.pkId,
                      esuId: owe.esuId,
                      sequenceNumber: owe.sequenceNumber,
                      changeType: "D",
                      oneWayExemptionTypeCode: owe.oneWayExemptionTypeCode,
                      recordEndDate: currentDate,
                      oneWayExemptionStartDate: owe.oneWayExemptionStartDate,
                      oneWayExemptionEndDate: currentDate,
                      oneWayExemptionStartTime: owe.oneWayExemptionStartTime,
                      oneWayExemptionEndTime: owe.oneWayExemptionEndTime,
                      oneWayExemptionPeriodicityCode: owe.oneWayExemptionPeriodicityCode,
                    };
                  })
                : [],
            };

        const newEsus = contextStreet.esus.map((x) => [updatedOriginal].find((rec) => rec.esuId === x.esuId) || x);
        const minPkId =
          streetData.esus && streetData.esus.length > 0
            ? streetData.esus.reduce((prev, curr) => (prev.pkId < curr.pkId ? prev : curr))
            : null;
        let newPkId = !minPkId || !minPkId.pkId || minPkId.pkId > -10 ? -10 : minPkId.pkId - 1;
        let newGeometry = GetPolylineAsWKT(mapContext.currentDivideEsu.newEsu1);
        let dividedEsus = [newPkId];

        const newRec1 = settingsContext.isScottish
          ? {
              esuId: newPkId,
              changeType: "I",
              state: originalEsu.state,
              stateDate: originalEsu.stateDate,
              classification: originalEsu.classification,
              classificationDate: originalEsu.classificationDate,
              startDate: currentDate,
              endDate: null,
              wktGeometry: newGeometry,
              assignUnassign: originalEsu.assignUnassign,
              pkId: newPkId,
            }
          : {
              entryDate: currentDate,
              pkId: newPkId,
              esuId: newPkId,
              changeType: "I",
              esuVersionNumber: 1,
              numCoordCount: 0,
              esuTolerance: 10,
              esuStartDate: currentDate,
              esuEndDate: null,
              esuDirection: originalEsu.esuDirection,
              wktGeometry: newGeometry,
              assignUnassign: originalEsu.assignUnassign,
              highwayDedications: originalEsu.highwayDedications
                ? originalEsu.highwayDedications.map((hd) => {
                    return {
                      pkId: newPkId,
                      esuId: newPkId,
                      seqNum: hd.seqNum,
                      changeType: "I",
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
              oneWayExemptions: originalEsu.oneWayExceptions
                ? originalEsu.oneWayExceptions.map((owe) => {
                    return {
                      pkId: newPkId,
                      esuId: newPkId,
                      sequenceNumber: owe.sequenceNumber,
                      changeType: "I",
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

        newPkId = newPkId - 1;
        newGeometry = GetPolylineAsWKT(mapContext.currentDivideEsu.newEsu2);

        dividedEsus.push(newPkId);

        mergedDividedEsus.current = dividedEsus;

        const newRec2 = settingsContext.isScottish
          ? {
              esuId: newPkId,
              changeType: "I",
              state: originalEsu.state,
              stateDate: originalEsu.stateDate,
              classification: originalEsu.classification,
              classificationDate: originalEsu.classificationDate,
              startDate: currentDate,
              endDate: null,
              wktGeometry: newGeometry,
              assignUnassign: originalEsu.assignUnassign,
              pkId: newPkId,
            }
          : {
              entryDate: currentDate,
              pkId: newPkId,
              esuId: newPkId,
              changeType: "I",
              esuVersionNumber: 1,
              numCoordCount: 0,
              esuTolerance: 10,
              esuStartDate: currentDate,
              esuEndDate: null,
              esuDirection: originalEsu.esuDirection,
              wktGeometry: newGeometry,
              assignUnassign: originalEsu.assignUnassign,
              highwayDedications: originalEsu.highwayDedications
                ? originalEsu.highwayDedications.map((hd) => {
                    return {
                      pkId: newPkId,
                      esuId: newPkId,
                      seqNum: hd.seqNum,
                      changeType: "I",
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
              oneWayExemptions: originalEsu.oneWayExceptions
                ? originalEsu.oneWayExceptions.map((owe) => {
                    return {
                      pkId: newPkId,
                      esuId: newPkId,
                      sequenceNumber: owe.sequenceNumber,
                      changeType: "I",
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

        newEsus.push(newRec1, newRec2);

        const newEsuStreetData = GetNewEsuStreetData(
          sandboxContext.currentSandbox,
          newEsus,
          streetData,
          settingsContext.isScottish
        );

        if (newEsuStreetData) {
          mapContext.onSetCoordinate(null);
          mapContext.onSearchDataChange(newEsuStreetData.searchStreets, [], newEsuStreetData.streetData.usrn, null);
          setStreetData(newEsuStreetData.streetData);
          sandboxContext.onUpdateAndClear("currentStreet", newEsuStreetData.streetData, "esu");
          setSaveDisabled(false);
          streetContext.onStreetModified(true);
          mapContext.onHighlightClear();
          mapContext.onEditMapObject(null, null);

          if (esuFormData) {
            setEsuFormData(null);
            streetContext.onRecordChange(11, null, null, null);
          }

          streetContext.onEsuDividedMerged(true);

          alertType.current = "esuDivided";
          setAlertOpen(true);
        }
      }
    }
  }, [
    sandboxContext,
    mapContext.currentDivideEsu,
    streetData,
    settingsContext.isScottish,
    settingsContext.streetTemplate,
    streetContext,
    mapContext,
    esuFormData,
  ]);

  // merge ESus
  useEffect(() => {
    if (streetContext.mergedEsus) {
      const contextStreet = sandboxContext.currentSandbox.currentStreet || sandboxContext.currentSandbox.sourceStreet;
      const originalEsu1 = contextStreet.esus.find((x) => x.esuId === streetContext.mergedEsus.esuId1);
      const originalEsu2 = contextStreet.esus.find((x) => x.esuId === streetContext.mergedEsus.esuId2);

      if (originalEsu1 && originalEsu2) {
        const currentDate = GetCurrentDate(false);

        const updatedOriginal1 = settingsContext.isScottish
          ? {
              esuId: originalEsu1.esuId,
              changeType: "D",
              state: 4, // Permanently closed
              stateDate: currentDate,
              classification: originalEsu1.classification,
              classificationDate: originalEsu1.classificationDate,
              startDate: originalEsu1.startDate,
              endDate: currentDate,
              wktGeometry: originalEsu1.wktGeometry,
              assignUnassign: originalEsu1.assignUnassign,
              pkId: originalEsu1.pkId,
            }
          : {
              entryDate: originalEsu1.entryDate,
              pkId: originalEsu1.pkId,
              esuId: originalEsu1.esuId,
              changeType: "D",
              esuVersionNumber: originalEsu1.esuVersionNumber,
              numCoordCount: originalEsu1.numCoordCount,
              esuTolerance: originalEsu1.esuTolerance,
              esuStartDate: originalEsu1.esuStartDate,
              esuEndDate: currentDate,
              esuDirection: originalEsu1.esuDirection,
              wktGeometry: originalEsu1.wktGeometry,
              assignUnassign: originalEsu1.assignUnassign,
              highwayDedications: originalEsu1.highwayDedications
                ? originalEsu1.highwayDedications.map((hd) => {
                    return {
                      pkId: hd.pkId,
                      esuId: hd.esuId,
                      seqNum: hd.seqNum,
                      changeType: "D",
                      highwayDedicationCode: hd.highwayDedicationCode,
                      recordEndDate: currentDate,
                      hdStartDate: hd.hdStartDate,
                      hdEndDate: currentDate,
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
              oneWayExemptions: originalEsu1.oneWayExemptions
                ? originalEsu1.oneWayExemptions.map((owe) => {
                    return {
                      pkId: owe.pkId,
                      esuId: owe.esuId,
                      sequenceNumber: owe.sequenceNumber,
                      changeType: "D",
                      oneWayExemptionTypeCode: owe.oneWayExemptionTypeCode,
                      recordEndDate: currentDate,
                      oneWayExemptionStartDate: owe.oneWayExemptionStartDate,
                      oneWayExemptionEndDate: currentDate,
                      oneWayExemptionStartTime: owe.oneWayExemptionStartTime,
                      oneWayExemptionEndTime: owe.oneWayExemptionEndTime,
                      oneWayExemptionPeriodicityCode: owe.oneWayExemptionPeriodicityCode,
                    };
                  })
                : [],
            };

        const updatedOriginal2 = settingsContext.isScottish
          ? {
              esuId: originalEsu2.esuId,
              changeType: "D",
              state: 4, // Permanently closed
              stateDate: currentDate,
              classification: originalEsu2.classification,
              classificationDate: originalEsu2.classificationDate,
              startDate: originalEsu2.startDate,
              endDate: currentDate,
              wktGeometry: originalEsu2.wktGeometry,
              assignUnassign: originalEsu2.assignUnassign,
              pkId: originalEsu2.pkId,
            }
          : {
              entryDate: originalEsu2.entryDate,
              pkId: originalEsu2.pkId,
              esuId: originalEsu2.esuId,
              changeType: "D",
              esuVersionNumber: originalEsu2.esuVersionNumber,
              numCoordCount: originalEsu2.numCoordCount,
              esuTolerance: originalEsu2.esuTolerance,
              esuStartDate: originalEsu2.esuStartDate,
              esuEndDate: currentDate,
              esuDirection: originalEsu2.esuDirection,
              wktGeometry: originalEsu2.wktGeometry,
              assignUnassign: originalEsu2.assignUnassign,
              highwayDedications: originalEsu2.highwayDedications
                ? originalEsu2.highwayDedications.map((hd) => {
                    return {
                      pkId: hd.pkId,
                      esuId: hd.esuId,
                      seqNum: hd.seqNum,
                      changeType: "D",
                      highwayDedicationCode: hd.highwayDedicationCode,
                      recordEndDate: currentDate,
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
              oneWayExemptions: originalEsu2.oneWayExemptions
                ? originalEsu2.oneWayExemptions.map((owe) => {
                    return {
                      pkId: owe.pkId,
                      esuId: owe.esuId,
                      sequenceNumber: owe.sequenceNumber,
                      changeType: "D",
                      oneWayExemptionTypeCode: owe.oneWayExemptionTypeCode,
                      recordEndDate: currentDate,
                      oneWayExemptionStartDate: owe.oneWayExemptionStartDate,
                      oneWayExemptionEndDate: owe.oneWayExemptionEndDate,
                      oneWayExemptionStartTime: owe.oneWayExemptionStartTime,
                      oneWayExemptionEndTime: owe.oneWayExemptionEndTime,
                      oneWayExemptionPeriodicityCode: owe.oneWayExemptionPeriodicityCode,
                    };
                  })
                : [],
            };

        const newEsus = contextStreet.esus.map(
          (x) =>
            [updatedOriginal1].find((rec) => rec.esuId === x.esuId) ||
            [updatedOriginal2].find((rec) => rec.esuId === x.esuId) ||
            x
        );
        const minPkId =
          streetData.esus && streetData.esus.length > 0
            ? streetData.esus.reduce((prev, curr) => (prev.pkId < curr.pkId ? prev : curr))
            : null;
        let newPkId = !minPkId || !minPkId.pkId || minPkId.pkId > -10 ? -10 : minPkId.pkId - 1;
        let newGeometry = GetPolylineAsWKT(streetContext.mergedEsus.newGeometry);
        mergedDividedEsus.current = [newPkId];

        const mergeEsusSame = MergeEsuComparison(originalEsu1, originalEsu2, settingsContext.isScottish);

        const newRec = settingsContext.isScottish
          ? {
              esuId: newPkId,
              changeType: "I",
              state: mergeEsusSame
                ? originalEsu1.state
                : settingsContext.streetTemplate &&
                  settingsContext.streetTemplate.scoEsuTemplate &&
                  settingsContext.streetTemplate.scoEsuTemplate.state
                ? settingsContext.streetTemplate.scoEsuTemplate.state
                : null,
              stateDate: mergeEsusSame
                ? originalEsu1.stateDate
                : settingsContext.streetTemplate &&
                  settingsContext.streetTemplate.scoEsuTemplate &&
                  settingsContext.streetTemplate.scoEsuTemplate.state
                ? currentDate
                : null,
              classification: mergeEsusSame
                ? originalEsu1.classification
                : settingsContext.streetTemplate &&
                  settingsContext.streetTemplate.scoEsuTemplate &&
                  settingsContext.streetTemplate.scoEsuTemplate.classification
                ? settingsContext.streetTemplate.scoEsuTemplate.classification
                : null,
              classificationDate: mergeEsusSame
                ? originalEsu1.classificationDate
                : settingsContext.streetTemplate &&
                  settingsContext.streetTemplate.scoEsuTemplate &&
                  settingsContext.streetTemplate.scoEsuTemplate.classification
                ? currentDate
                : null,
              startDate: currentDate,
              endDate: null,
              wktGeometry: newGeometry,
              assignUnassign: 0,
              pkId: newPkId,
            }
          : {
              entryDate: currentDate,
              pkId: newPkId,
              esuId: newPkId,
              changeType: "I",
              esuVersionNumber: 1,
              numCoordCount: 0,
              esuTolerance: 10,
              esuStartDate: currentDate,
              esuEndDate: null,
              esuDirection: mergeEsusSame
                ? originalEsu1.esuDirection
                : settingsContext.streetTemplate &&
                  settingsContext.streetTemplate.esuTemplate &&
                  settingsContext.streetTemplate.esuTemplate.esuDirection
                ? settingsContext.streetTemplate.esuTemplate.esuDirection
                : 1,
              wktGeometry: newGeometry,
              assignUnassign: 0,
              highwayDedications: mergeEsusSame
                ? originalEsu1.highwayDedications
                  ? originalEsu1.highwayDedications.map((hd) => {
                      return {
                        pkId: newPkId,
                        esuId: newPkId,
                        seqNum: hd.seqNum,
                        changeType: "I",
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
                  : []
                : [],
              oneWayExemptions: mergeEsusSame
                ? originalEsu1.oneWayExceptions
                  ? originalEsu1.oneWayExceptions.map((owe) => {
                      return {
                        pkId: newPkId,
                        esuId: newPkId,
                        sequenceNumber: owe.sequenceNumber,
                        changeType: "I",
                        oneWayExemptionTypeCode: owe.oneWayExemptionTypeCode,
                        recordEndDate: owe.recordEndDate,
                        oneWayExemptionStartDate: owe.oneWayExemptionStartDate,
                        oneWayExemptionEndDate: owe.oneWayExemptionEndDate,
                        oneWayExemptionStartTime: owe.oneWayExemptionStartTime,
                        oneWayExemptionEndTime: owe.oneWayExemptionEndTime,
                        oneWayExemptionPeriodicityCode: owe.oneWayExemptionPeriodicityCode,
                      };
                    })
                  : []
                : [],
            };

        newEsus.push(newRec);

        const newEsuStreetData = GetNewEsuStreetData(
          sandboxContext.currentSandbox,
          newEsus,
          streetData,
          settingsContext.isScottish
        );

        if (newEsuStreetData) {
          mapContext.onSetCoordinate(null);
          mapContext.onSearchDataChange(newEsuStreetData.searchStreets, [], newEsuStreetData.streetData.usrn, null);
          setStreetData(newEsuStreetData.streetData);
          sandboxContext.onUpdateAndClear("currentStreet", newEsuStreetData.streetData, "esu");
          setSaveDisabled(false);
          streetContext.onStreetModified(true);
          streetContext.onMergedEsus(null, null, null);
          mapContext.onHighlightClear();
          mapContext.onEditMapObject(null, null);

          streetContext.onEsuDividedMerged(true);

          alertType.current = "mergedEsus";
          setAlertOpen(true);
        }
      }
    }
  }, [
    streetContext.mergedEsus,
    settingsContext.isScottish,
    streetData,
    mapContext,
    sandboxContext,
    streetContext,
    settingsContext.streetTemplate,
  ]);

  // Unassign ESUs
  useEffect(() => {
    if (streetContext.unassignEsus && Array.isArray(streetContext.unassignEsus)) {
      const contextStreet = sandboxContext.currentSandbox.currentStreet || sandboxContext.currentSandbox.sourceStreet;

      const newEsus = contextStreet.esus.map((x) =>
        streetContext.unassignEsus.includes(x.esuId)
          ? settingsContext.isScottish
            ? {
                esuId: x.esuId,
                changeType: x.changeType,
                state: x.state,
                stateDate: x.stateDate,
                classification: x.classification,
                classificationDate: x.classificationDate,
                startDate: x.startDate,
                endDate: x.endDate,
                wktGeometry: x.wktGeometry,
                assignUnassign: -1,
                pkId: x.pkId,
              }
            : {
                entryDate: x.entryDate,
                pkId: x.pkId,
                esuId: x.esuId,
                changeType: x.changeType,
                esuVersionNumber: x.esuVersionNumber,
                numCoordCount: x.numCoordCount,
                esuTolerance: x.esuTolerance,
                esuStartDate: x.esuStartDate,
                esuEndDate: x.esuEndDate,
                esuDirection: x.esuDirection,
                wktGeometry: x.wktGeometry,
                assignUnassign: -1,
                highwayDedications: x.highwayDedications,
                oneWayExemptions: x.oneWayExemptions,
              }
          : x
      );

      const newEsuStreetData = GetNewEsuStreetData(
        sandboxContext.currentSandbox,
        newEsus,
        streetData,
        settingsContext.isScottish,
        true
      );

      if (newEsuStreetData) {
        mapContext.onSetCoordinate(null);
        mapContext.onSearchDataChange(newEsuStreetData.searchStreets, [], newEsuStreetData.streetData.usrn, null);
        setStreetData(newEsuStreetData.streetData);
        sandboxContext.onUpdateAndClear("currentStreet", newEsuStreetData.streetData, "esu");
        setSaveDisabled(false);
        streetContext.onStreetModified(true);
        streetContext.onUnassignEsus(null);
        mapContext.onHighlightClear();
        mapContext.onEditMapObject(null, null);

        if (esuFormData) {
          setEsuFormData(null);
          streetContext.onRecordChange(11, null, null, null);
        }

        alertType.current = "unassignEsus";
        setAlertOpen(true);
      }
    }
  }, [
    streetContext.unassignEsus,
    sandboxContext,
    settingsContext.isScottish,
    streetData,
    streetContext,
    mapContext,
    esuFormData,
  ]);

  // Assign ESU
  useEffect(() => {
    if (streetContext.assignEsu) {
      const contextStreet = sandboxContext.currentSandbox.currentStreet || sandboxContext.currentSandbox.sourceStreet;
      GetEsuData(streetContext.assignEsu, userContext.currentUser.token)
        .then((result) => {
          if (!contextStreet.esus || !contextStreet.esus.find((x) => x.esuId === result.esuId)) {
            const newEsus = contextStreet.esus ? contextStreet.esus.map((x) => x) : [];
            newEsus.push({ ...result, assignUnassign: 1 });

            const newEsuStreetData = GetNewEsuStreetData(
              sandboxContext.currentSandbox,
              newEsus,
              streetData,
              settingsContext.isScottish,
              true
            );

            if (newEsuStreetData) {
              streetContext.onAssignEsu(null);
              mapContext.onSetCoordinate(null);
              mapContext.onSearchDataChange(newEsuStreetData.searchStreets, [], newEsuStreetData.streetData.usrn, null);
              setStreetData(newEsuStreetData.streetData);
              sandboxContext.onUpdateAndClear("currentStreet", newEsuStreetData.streetData, "esu");
              setSaveDisabled(false);
              streetContext.onStreetModified(true);
              mapContext.onHighlightClear();
              mapContext.onEditMapObject(null, null);

              alertType.current = "assignEsu";
              setAlertOpen(true);
            }
          }
        })
        .catch(() => {});
    }
  }, [
    streetContext.assignEsu,
    userContext.currentUser,
    mapContext,
    settingsContext.isScottish,
    sandboxContext,
    streetContext,
    streetData,
  ]);

  // Assign ESUs
  useEffect(() => {
    if (streetContext.assignEsus && Array.isArray(streetContext.assignEsus) && streetContext.assignEsus.length) {
      const currentStreet = sandboxContext.currentSandbox.currentStreet || sandboxContext.currentSandbox.sourceStreet;
      const newEsus = currentStreet.esus ? currentStreet.esus.map((x) => x) : [];
      const existingEsuIds = newEsus.map((x) => x.esuId);
      const newEsuIds = streetContext.assignEsus.map((x) => x);
      streetContext.onAssignEsus(null);

      // Remove any ids that are already assigned to the current street
      existingEsuIds.forEach((esuId) => {
        if (newEsuIds.includes(esuId)) newEsuIds.splice(newEsuIds.indexOf(esuId), 1);
      });

      if (newEsuIds && newEsuIds.length) {
        GetMultipleEsusData(newEsuIds, userContext.currentUser.token).then((result) => {
          result.forEach((esu) => {
            newEsus.push({ ...esu, assignUnassign: 1 });
          });

          const newEsuStreetData = GetNewEsuStreetData(
            sandboxContext.currentSandbox,
            newEsus,
            streetData,
            settingsContext.isScottish,
            true
          );

          if (newEsuStreetData) {
            mapContext.onSearchDataChange(newEsuStreetData.searchStreets, [], newEsuStreetData.streetData.usrn, null);
            setStreetData(newEsuStreetData.streetData);
            sandboxContext.onUpdateAndClear("currentStreet", newEsuStreetData.streetData, "esu");
            setSaveDisabled(false);
            streetContext.onStreetModified(true);
            mapContext.onHighlightClear();

            alertType.current = "assignEsus";
            setAlertOpen(true);
          }
        });
      }
    }
  }, [
    streetContext.assignEsus,
    userContext.currentUser,
    mapContext,
    settingsContext.isScottish,
    sandboxContext,
    streetContext,
    streetData,
  ]);

  useEffect(() => {
    if (
      propertyContext.wizardData &&
      propertyContext.wizardData.source &&
      propertyContext.wizardData.source === "search"
    ) {
      if (!propertyContext.wizardData.savedProperty || propertyContext.wizardData.savedProperty.length === 0) {
        if (propertyContext.wizardData.type === "close") setOpenPropertyWizard(false);
      } else {
        const savedUprn = Array.isArray(propertyContext.wizardData.savedProperty)
          ? propertyContext.wizardData.savedProperty[0].uprn
          : propertyContext.wizardData.savedProperty.uprn;

        if (savedUprn !== wizardUprn.current) {
          wizardUprn.current = savedUprn;

          switch (propertyContext.wizardData.type) {
            case "view":
              const rangeEngLpis = propertyContext.wizardData.savedProperty[0].lpis.filter((x) => x.language === "ENG");
              switch (propertyContext.wizardData.variant) {
                case "range":
                  doOpenRecord(
                    {
                      type: 15,
                      usrn: rangeEngLpis[0].usrn,
                    },
                    rangeEngLpis[0].uprn,
                    searchContext.currentSearchData.results,
                    mapContext,
                    streetContext,
                    propertyContext,
                    userContext.currentUser.token,
                    settingsContext.isScottish
                  );
                  break;

                case "rangeChildren":
                  const parentRec = {
                    type: 24,
                    uprn: propertyContext.wizardData.parent.uprn,
                    address: propertyContext.wizardData.parent.address,
                    formattedAddress: propertyContext.wizardData.parent.address,
                    postcode: propertyContext.wizardData.parent.postcode,
                    easting: propertyContext.wizardData.parent.xcoordinate,
                    northing: propertyContext.wizardData.parent.ycoordinate,
                    logical_status: propertyContext.wizardData.parent.logicalStatus,
                    classification_code: propertyContext.wizardData.parent.blpuClass,
                  };
                  const relatedObj = {
                    parent: propertyContext.wizardData.parent.uprn,
                    property: rangeEngLpis[0].uprn,
                    userToken: userContext.currentUser.token,
                  };

                  if (parentRec.logical_status === 8) {
                    historicRec.current = { property: parentRec, related: relatedObj };
                    setOpenHistoricProperty(true);
                  } else
                    doOpenRecord(
                      parentRec,
                      relatedObj,
                      searchContext.currentSearchData.results,
                      mapContext,
                      streetContext,
                      propertyContext,
                      userContext.currentUser.token,
                      settingsContext.isScottish
                    );
                  break;

                default:
                  const engLpis = propertyContext.wizardData.savedProperty.lpis.filter((x) => x.language === "ENG");
                  const savedRec = {
                    type: 24,
                    uprn: propertyContext.wizardData.savedProperty.uprn,
                    address: engLpis[0].address,
                    formattedAddress: engLpis[0].address,
                    postcode: engLpis[0].postcode,
                    easting: propertyContext.wizardData.savedProperty.xcoordinate,
                    northing: propertyContext.wizardData.savedProperty.ycoordinate,
                    logical_status: propertyContext.wizardData.savedProperty.logicalStatus,
                    classification_code: propertyContext.wizardData.savedProperty.blpuClass,
                  };

                  if (savedRec.logical_status === 8) {
                    historicRec.current = { property: savedRec, related: null };
                    setOpenHistoricProperty(true);
                  } else
                    doOpenRecord(
                      savedRec,
                      null,
                      searchContext.currentSearchData.results,
                      mapContext,
                      streetContext,
                      propertyContext,
                      userContext.currentUser.token,
                      settingsContext.isScottish
                    );
                  break;
              }
              setOpenPropertyWizard(false);
              break;

            case "addChild":
              propertyContext.resetPropertyErrors();
              propertyContext.onWizardDone(null, false, null, null);
              mapContext.onWizardSetCoordinate(null);
              propertyWizardType.current = "child";
              propertyWizardParent.current = propertyContext.wizardData.parent;
              setOpenPropertyWizard(true);
              break;

            case "addChildren":
              propertyContext.resetPropertyErrors();
              propertyContext.onWizardDone(null, false, null, null);
              mapContext.onWizardSetCoordinate(null);
              propertyWizardType.current = "rangeChildren";
              propertyWizardParent.current = propertyContext.wizardData.parent;
              setOpenPropertyWizard(true);
              break;

            default:
              setOpenPropertyWizard(false);
              break;
          }
        }
      }
    }
  }, [
    propertyContext.wizardData,
    mapContext,
    propertyContext,
    streetContext,
    userContext.currentUser.token,
    searchContext.currentSearchData.results,
    settingsContext.isScottish,
  ]);

  return (
    <div id="street-data-form">
      <AppBar position="static" color="default">
        <Tabs
          value={value}
          onChange={handleTabChange}
          TabIndicatorProps={{ style: { background: adsBlueA, height: "2px" } }}
          variant="scrollable"
          scrollButtons="auto"
          selectionFollowsFocus
          aria-label="street-data-tabs"
          sx={{ backgroundColor: adsWhite, color: adsMidGreyA }}
        >
          <Tab
            sx={tabStyle}
            label={
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography variant="subtitle2" sx={tabLabelStyle(value === 0)}>
                  Street
                </Typography>
                {((streetErrors && streetErrors.length > 0) || (descriptorErrors && descriptorErrors.length > 0)) && (
                  <ErrorIcon sx={errorIconStyle} />
                )}
              </Stack>
            }
            {...a11yProps(0)}
          />
          <Tab
            sx={tabStyle}
            label={
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography variant="subtitle2" sx={tabLabelStyle(value === 1)}>
                  ESU
                </Typography>
                {(esuErrors && esuErrors.length > 0) ||
                (oneWayExemptionErrors && oneWayExemptionErrors.length > 0) ||
                (highwayDedicationErrors && highwayDedicationErrors.length > 0) ? (
                  <ErrorIcon sx={errorIconStyle} />
                ) : (
                  <Avatar
                    variant="rounded"
                    sx={GetTabIconStyle(
                      streetData && streetData.esus
                        ? streetData.esus.filter((x) => x.changeType !== "D" && x.assignUnassign !== -1).length
                        : 0
                    )}
                  >
                    <Typography variant="caption">
                      <strong>
                        {streetData && streetData.esus
                          ? streetData.esus.filter((x) => x.changeType !== "D" && x.assignUnassign !== -1).length
                          : 0}
                      </strong>
                    </Typography>
                  </Avatar>
                )}
              </Stack>
            }
            {...a11yProps(1)}
          />
          {settingsContext.isScottish && (
            <Tab
              sx={tabStyle}
              label={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="subtitle2" sx={tabLabelStyle(value === 2)}>
                    Successors
                  </Typography>
                  {successorCrossRefErrors && successorCrossRefErrors.length > 0 ? (
                    <ErrorIcon sx={errorIconStyle} />
                  ) : (
                    <Avatar
                      variant="rounded"
                      sx={GetTabIconStyle(
                        streetData && streetData.successorCrossRefs
                          ? streetData.successorCrossRefs.filter((x) => x.changeType !== "D").length
                          : 0
                      )}
                    >
                      <Typography variant="caption">
                        <strong>
                          {streetData && streetData.successorCrossRefs
                            ? streetData.successorCrossRefs.filter((x) => x.changeType !== "D").length
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
          {HasASD() && streetData && streetData.recordType < 4 && (
            <Tab
              sx={tabStyle}
              label={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="subtitle2" sx={tabLabelStyle(value === (settingsContext.isScottish ? 3 : 2))}>
                    ASD
                  </Typography>
                  {(interestErrors && interestErrors.length > 0) ||
                  (constructionErrors && constructionErrors.length > 0) ||
                  (specialDesignationErrors && specialDesignationErrors.length > 0) ||
                  (heightWidthWeightErrors && heightWidthWeightErrors.length > 0) ||
                  (publicRightOfWayErrors && publicRightOfWayErrors.length > 0) ? (
                    <ErrorIcon sx={errorIconStyle} />
                  ) : (
                    <Avatar
                      variant="rounded"
                      sx={GetTabIconStyle(
                        streetData
                          ? (streetData.maintenanceResponsibilities
                              ? streetData.maintenanceResponsibilities.filter((x) => x.changeType !== "D").length
                              : 0) +
                              (streetData.reinstatementCategories
                                ? streetData.reinstatementCategories.filter((x) => x.changeType !== "D").length
                                : 0) +
                              (streetData.interests
                                ? streetData.interests.filter((x) => x.changeType !== "D").length
                                : 0) +
                              (streetData.constructions
                                ? streetData.constructions.filter((x) => x.changeType !== "D").length
                                : 0) +
                              (streetData.specialDesignations
                                ? streetData.specialDesignations.filter((x) => x.changeType !== "D").length
                                : 0) +
                              (streetData.publicRightOfWays
                                ? streetData.publicRightOfWays.filter((x) => x.changeType !== "D").length
                                : 0) +
                              (streetData.heightWidthWeights
                                ? streetData.heightWidthWeights.filter((x) => x.changeType !== "D").length
                                : 0)
                          : 0
                      )}
                    >
                      <Typography variant="caption">
                        <strong>
                          {streetData
                            ? (streetData.maintenanceResponsibilities
                                ? streetData.maintenanceResponsibilities.filter((x) => x.changeType !== "D").length
                                : 0) +
                              (streetData.reinstatementCategories
                                ? streetData.reinstatementCategories.filter((x) => x.changeType !== "D").length
                                : 0) +
                              (streetData.interests
                                ? streetData.interests.filter((x) => x.changeType !== "D").length
                                : 0) +
                              (streetData.constructions
                                ? streetData.constructions.filter((x) => x.changeType !== "D").length
                                : 0) +
                              (streetData.specialDesignations
                                ? streetData.specialDesignations.filter((x) => x.changeType !== "D").length
                                : 0) +
                              (streetData.publicRightOfWays
                                ? streetData.publicRightOfWays.filter((x) => x.changeType !== "D").length
                                : 0) +
                              (streetData.heightWidthWeights
                                ? streetData.heightWidthWeights.filter((x) => x.changeType !== "D").length
                                : 0)
                            : 0}
                        </strong>
                      </Typography>
                    </Avatar>
                  )}
                </Stack>
              }
              {...a11yProps(settingsContext.isScottish ? 3 : 2)}
            />
          )}
          <Tab
            sx={tabStyle}
            label={
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography
                  variant="subtitle2"
                  sx={tabLabelStyle(
                    value ===
                      (settingsContext.isScottish ? 4 : HasASD() && streetData && streetData.recordType < 4 ? 3 : 2)
                  )}
                >
                  Related
                </Typography>
                <Avatar
                  variant="rounded"
                  sx={GetTabIconStyle(streetData ? streetData.relatedPropertyCount + streetData.relatedStreetCount : 0)}
                >
                  <Typography variant="caption">
                    <strong>{streetData ? streetData.relatedPropertyCount + streetData.relatedStreetCount : 0}</strong>
                  </Typography>
                </Avatar>
              </Stack>
            }
            {...a11yProps(settingsContext.isScottish ? 4 : HasASD() && streetData && streetData.recordType < 4 ? 3 : 2)}
          />
          <Tab
            sx={tabStyle}
            label={
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography
                  variant="subtitle2"
                  sx={tabLabelStyle(
                    value ===
                      (settingsContext.isScottish ? 5 : HasASD() && streetData && streetData.recordType < 4 ? 4 : 3)
                  )}
                >
                  Notes
                </Typography>
                {noteErrors && noteErrors.length > 0 ? (
                  <ErrorIcon sx={errorIconStyle} />
                ) : (
                  <Avatar
                    variant="rounded"
                    sx={GetTabIconStyle(
                      streetData && streetData.streetNotes
                        ? streetData.streetNotes.filter((x) => x.changeType !== "D").length
                        : 0
                    )}
                  >
                    <Typography variant="caption">
                      <strong>
                        {streetData && streetData.streetNotes
                          ? streetData.streetNotes.filter((x) => x.changeType !== "D").length
                          : 0}
                      </strong>
                    </Typography>
                  </Avatar>
                )}
              </Stack>
            }
            {...a11yProps(settingsContext.isScottish ? 5 : HasASD() && streetData && streetData.recordType < 4 ? 4 : 3)}
          />
          <Tab
            sx={tabStyle}
            label={
              <Typography
                variant="subtitle2"
                sx={tabLabelStyle(
                  value ===
                    (settingsContext.isScottish ? 6 : HasASD() && streetData && streetData.recordType < 4 ? 5 : 4)
                )}
              >
                History
              </Typography>
            }
            {...a11yProps(settingsContext.isScottish ? 6 : HasASD() && streetData && streetData.recordType < 4 ? 5 : 4)}
          />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        {descriptorFormData ? (
          <StreetDescriptorDataTab
            data={descriptorFormData}
            errors={descriptorErrors && descriptorErrors.filter((x) => x.index === descriptorFormData.index)}
            loading={loading}
            focusedField={descriptorFocusedField}
            onDataChanged={handleAssociatedRecordDataChanged}
            onHomeClick={(action, srcData, currentData) => handleDescriptorHomeClick(action, srcData, currentData)}
          />
        ) : (
          <StreetDataTab
            data={streetData}
            errors={streetErrors}
            descriptorErrors={descriptorErrors}
            loading={loading}
            focusedField={streetFocusedField}
            onSetCopyOpen={(open, dataType) => handleCopyOpen(open, dataType)}
            onDescriptorSelected={(pkId, sdData, dataIdx, dataLength) =>
              handleDescriptorSelected(pkId, sdData, dataIdx, dataLength)
            }
            onDataChanged={(srcData) => handleStreetDataChanged(srcData)}
            onDelete={(pkId) => handleStreetDelete(pkId)}
            onPropertyAdd={(usrn, parent, isRange) => handlePropertyAdd(usrn, parent, isRange)}
          />
        )}
      </TabPanel>
      <TabPanel value={value} index={1}>
        {hdFormData ? (
          <HighwayDedicationDataTab
            data={hdFormData}
            errors={
              highwayDedicationErrors &&
              highwayDedicationErrors.filter((x) => x.esuIndex === hdFormData.esuIndex && x.index === hdFormData.index)
            }
            loading={loading}
            focusedField={highwayDedicationFocusedField}
            onDataChanged={handleAssociatedRecordDataChanged}
            onHomeClick={(action, srcData, currentData) =>
              handleHighwayDedicationHomeClick(action, srcData, currentData)
            }
            onAdd={(esuId, esuIndex) => handleAddHighwayDedication(esuId, esuIndex)}
            onDelete={(esuId, pkId) => handleHighwayDedicationDeleted(esuId, pkId)}
          />
        ) : oweFormData ? (
          <OneWayExemptionDataTab
            data={oweFormData}
            errors={
              oneWayExemptionErrors &&
              oneWayExemptionErrors.filter((x) => x.esuIndex === oweFormData.esuIndex && x.index === oweFormData.index)
            }
            loading={loading}
            focusedField={oneWayExemptionFocusedField}
            onDataChanged={handleAssociatedRecordDataChanged}
            onHomeClick={(action, srcData, currentData) => handleOneWayExemptionHomeClick(action, srcData, currentData)}
            onAdd={(esuId, esuIndex) => handleAddOneWayExemption(esuId, esuIndex)}
            onDelete={(esuId, pkId) => handleOneWayExceptionDeleted(esuId, pkId)}
          />
        ) : esuFormData ? (
          <EsuDataTab
            data={esuFormData}
            streetState={streetData ? streetData.state : null}
            errors={esuErrors && esuErrors.filter((x) => x.index === esuFormData.index)}
            oweErrors={oneWayExemptionErrors.filter((x) => x.esuIndex === esuFormData.index)}
            hdErrors={highwayDedicationErrors.filter((x) => x.esuIndex === esuFormData.index)}
            loading={loading}
            focusedField={esuFocusedField}
            onDataChanged={handleEsuDataChanged}
            onValidateData={(srcData, currentData) => handleEsuValidateData(srcData, currentData)}
            onHomeClick={(action, srcData, currentData) => handleEsuHomeClick(action, srcData, currentData)}
            onSetCopyOpen={(open, dataType) => handleCopyOpen(open, dataType)}
            onHighwayDedicationClicked={(hdData, index, esuIndex) =>
              handleHighwayDedicationClicked(hdData, index, esuIndex)
            }
            onOneWayExceptionClicked={(oweData, index, esuIndex) =>
              handleOneWayExemptionClicked(oweData, index, esuIndex)
            }
            onAddEsu={handleAddEsu}
            onAddHighwayDedication={(esuId, esuIndex) => handleAddHighwayDedication(esuId, esuIndex)}
            onAddOneWayException={(esuId, esuIndex) => handleAddOneWayExemption(esuId, esuIndex)}
            onDelete={(pkId) => handleEsuDeleted(pkId)}
            onDivideError={handleDivideError}
          />
        ) : (
          <EsuListTab
            data={streetData && streetData.esus ? streetData.esus : null}
            streetState={streetData ? streetData.state : null}
            loading={loading}
            errors={esuErrors}
            oneWayExemptionErrors={oneWayExemptionErrors}
            highwayDedicationErrors={highwayDedicationErrors}
            onSetCopyOpen={(open, dataType) => handleCopyOpen(open, dataType)}
            onEsuSelected={(pkId, esuData, index) => handleEsuSelected(pkId, esuData, index)}
            onHighwayDedicationSelected={(esuId, pkId, hdData, index, esuIndex) =>
              handleHighwayDedicationSelected(esuId, pkId, hdData, index, esuIndex)
            }
            onAddHighwayDedication={(esuId, esuIndex) => handleAddHighwayDedication(esuId, esuIndex)}
            onOneWayExemptionSelected={(esuId, pkId, oweData, index, esuIndex) =>
              handleOneWayExemptionSelected(esuId, pkId, oweData, index, esuIndex)
            }
            onAddOneWayExemption={(esuId, esuIndex) => handleAddOneWayExemption(esuId, esuIndex)}
            onDeleteEsu={(pkId) => handleEsuDeleted(pkId)}
            onMultiEsuDelete={(esuIds) => handleMultiDeleteEsu(esuIds)}
          />
        )}
      </TabPanel>
      {settingsContext.isScottish && (
        <TabPanel value={value} index={2}>
          {successorCrossRefFormData ? (
            <SuccessorTab
              data={successorCrossRefFormData}
              variant="street"
              errors={
                successorCrossRefErrors &&
                successorCrossRefErrors.filter((x) => x.index === successorCrossRefFormData.index)
              }
              loading={loading}
              focusedField={successorCrossRefFocusedField}
              onDataChanged={handleAssociatedRecordDataChanged}
              onHomeClick={(action, srcData, currentData) =>
                handleSuccessorCrossRefHomeClick(action, srcData, currentData)
              }
              onDelete={(pkId) => handleDeleteSuccessorCrossRef(pkId)}
            />
          ) : (
            <SuccessorListTab
              data={
                streetData &&
                streetData.successorCrossRefs &&
                streetData.successorCrossRefs
                  .filter((x) => x.changeType !== "D")
                  .map(function (x) {
                    return {
                      id: x.pkId,
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
              variant="street"
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
      {HasASD() && streetData && streetData.recordType < 4 ? (
        <Fragment>
          <TabPanel value={value} index={settingsContext.isScottish ? 3 : 2}>
            {maintenanceResponsibilityFormData ? (
              <MaintenanceResponsibilityDataTab
                data={maintenanceResponsibilityFormData}
                errors={
                  maintenanceResponsibilityErrors &&
                  maintenanceResponsibilityErrors.filter((x) => x.index === maintenanceResponsibilityFormData.index)
                }
                loading={loading}
                focusedField={maintenanceResponsibilityFocusedField}
                onDataChanged={handleAssociatedRecordDataChanged}
                onHomeClick={(action, srcData, currentData) =>
                  handleMaintenanceResponsibilityHomeClick(action, srcData, currentData)
                }
                onAdd={handleAddMaintenanceResponsibility}
                onDelete={(pkId) => handleMaintenanceResponsibilityDeleted(pkId)}
              />
            ) : reinstatementCategoryFormData ? (
              <ReinstatementCategoryDataTab
                data={reinstatementCategoryFormData}
                errors={
                  reinstatementCategoryErrors &&
                  reinstatementCategoryErrors.filter((x) => x.index === reinstatementCategoryFormData.index)
                }
                loading={loading}
                focusedField={reinstatementCategoryFocusedField}
                onDataChanged={handleAssociatedRecordDataChanged}
                onHomeClick={(action, srcData, currentData) =>
                  handleReinstatementCategoryHomeClick(action, srcData, currentData)
                }
                onAdd={handleAddReinstatementCategory}
                onDelete={(pkId) => handleReinstatementCategoryDeleted(pkId)}
              />
            ) : osSpecialDesignationFormData ? (
              <OSSpecialDesignationDataTab
                data={osSpecialDesignationFormData}
                errors={
                  osSpecialDesignationErrors &&
                  osSpecialDesignationErrors.filter((x) => x.index === osSpecialDesignationFormData.index)
                }
                loading={loading}
                focusedField={osSpecialDesignationFocusedField}
                onDataChanged={handleAssociatedRecordDataChanged}
                onHomeClick={(action, srcData, currentData) =>
                  handleOSSpecialDesignationHomeClick(action, srcData, currentData)
                }
                onAdd={handleAddOSSpecialDesignation}
                onDelete={(pkId) => handleOSSpecialDesignationDeleted(pkId)}
              />
            ) : interestFormData ? (
              <InterestDataTab
                data={interestFormData}
                errors={interestErrors && interestErrors.filter((x) => x.index === interestFormData.index)}
                loading={loading}
                focusedField={interestFocusedField}
                onDataChanged={handleAssociatedRecordDataChanged}
                onHomeClick={(action, srcData, currentData) => handleInterestHomeClick(action, srcData, currentData)}
                onAdd={handleAddInterest}
                onDelete={(pkId) => handleInterestedDeleted(pkId)}
              />
            ) : constructionFormData ? (
              <ConstructionDataTab
                data={constructionFormData}
                errors={constructionErrors && constructionErrors.filter((x) => x.index === constructionFormData.index)}
                loading={loading}
                focusedField={constructionFocusedField}
                onDataChanged={handleAssociatedRecordDataChanged}
                onHomeClick={(action, srcData, currentData) =>
                  handleConstructionHomeClick(action, srcData, currentData)
                }
                onAdd={handleAddConstruction}
                onDelete={(pkId) => handleConstructionDeleted(pkId)}
              />
            ) : specialDesignationFormData ? (
              <SpecialDesignationDataTab
                data={specialDesignationFormData}
                errors={
                  specialDesignationErrors &&
                  specialDesignationErrors.filter((x) => x.index === specialDesignationFormData.index)
                }
                loading={loading}
                focusedField={specialDesignationFocusedField}
                onDataChanged={handleAssociatedRecordDataChanged}
                onHomeClick={(action, srcData, currentData) =>
                  handleSpecialDesignationHomeClick(action, srcData, currentData)
                }
                onAdd={handleAddSpecialDesignation}
                onDelete={(pkId) => handleSpecialDesignationDeleted(pkId)}
              />
            ) : hwwFormData ? (
              <HWWDataTab
                data={hwwFormData}
                errors={heightWidthWeightErrors && heightWidthWeightErrors.filter((x) => x.index === hwwFormData.index)}
                loading={loading}
                focusedField={heightWidthWeightFocusedField}
                onDataChanged={handleAssociatedRecordDataChanged}
                onHomeClick={(action, srcData, currentData) => handleHWWHomeClick(action, srcData, currentData)}
                onAdd={handleAddHeightWidthWeight}
                onDelete={(pkId) => handleHWWDeleted(pkId)}
              />
            ) : prowFormData ? (
              <PRoWDataTab
                data={prowFormData}
                errors={publicRightOfWayErrors && publicRightOfWayErrors.filter((x) => x.index === prowFormData.index)}
                loading={loading}
                focusedField={publicRightOfWayFocusedField}
                onDataChanged={handleAssociatedRecordDataChanged}
                onHomeClick={(action, srcData, currentData) => handlePRoWHomeClick(action, srcData, currentData)}
                onAdd={handleAddPublicRightOfWay}
                onDelete={(pkId) => handlePRoWDeleted(pkId)}
              />
            ) : (
              <AsdDataTab
                data={streetData}
                loading={loading}
                interestErrors={interestErrors}
                constructionErrors={constructionErrors}
                specialDesignationErrors={specialDesignationErrors}
                heightWidthWeightErrors={heightWidthWeightErrors}
                publicRightOfWayErrors={publicRightOfWayErrors}
                onInterestedSelected={(pkId, interestData, dataIdx, dataLength) =>
                  handleInterestedSelected(pkId, interestData, dataIdx, dataLength)
                }
                onConstructionSelected={(pkId, constructionData, dataIdx, dataLength) =>
                  handleConstructionSelected(pkId, constructionData, dataIdx, dataLength)
                }
                onSpecialDesignationSelected={(pkId, specialDesignationData, dataIdx, dataLength) =>
                  handleSpecialDesignationSelected(pkId, specialDesignationData, dataIdx, dataLength)
                }
                onHWWSelected={(pkId, hwwData, dataIdx, dataLength) =>
                  handleHWWSelected(pkId, hwwData, dataIdx, dataLength)
                }
                onPRoWSelected={(pkId, prowData, dataIdx, dataLength) =>
                  handlePRoWSelected(pkId, prowData, dataIdx, dataLength)
                }
                onMaintenanceResponsibilitySelected={(pkId, maintenanceResponsibilityData, dataIdx, dataLength) =>
                  handleMaintenanceResponsibilitySelected(pkId, maintenanceResponsibilityData, dataIdx, dataLength)
                }
                onReinstatementCategorySelected={(pkId, reinstatementCategoryData, dataIdx, dataLength) =>
                  handleReinstatementCategorySelected(pkId, reinstatementCategoryData, dataIdx, dataLength)
                }
                onOSSpecialDesignationSelected={(pkId, specialDesignationData, dataIdx, dataLength) =>
                  handleOSSpecialDesignationSelected(pkId, specialDesignationData, dataIdx, dataLength)
                }
                onInterestedDeleted={(pkId) => handleInterestedDeleted(pkId)}
                onConstructionDeleted={(pkId) => handleConstructionDeleted(pkId)}
                onSpecialDesignationDeleted={(pkId) => handleSpecialDesignationDeleted(pkId)}
                onHWWDeleted={(pkId) => handleHWWDeleted(pkId)}
                onPRoWDeleted={(pkId) => handlePRoWDeleted(pkId)}
                onMaintenanceResponsibilityDeleted={(pkId) => handleMaintenanceResponsibilityDeleted(pkId)}
                onReinstatementCategoryDeleted={(pkId) => handleReinstatementCategoryDeleted(pkId)}
                onOSSpecialDesignationDeleted={(pkId) => handleOSSpecialDesignationDeleted(pkId)}
              />
            )}
          </TabPanel>
          <TabPanel value={value} index={settingsContext.isScottish ? 4 : 3}>
            <RelatedTab
              variant="street"
              propertyCount={streetData ? streetData.relatedPropertyCount : 0}
              streetCount={streetData ? streetData.relatedStreetCount : 0}
              onSetCopyOpen={(open, dataType) => handleCopyOpen(open, dataType)}
              onPropertyAdd={(usrn, parent, isRange) => handlePropertyAdd(usrn, parent, isRange)}
            />
          </TabPanel>
          <TabPanel value={value} index={settingsContext.isScottish ? 5 : 4}>
            {notesFormData ? (
              <NotesDataTab
                data={notesFormData}
                errors={noteErrors && noteErrors.filter((x) => x.index === notesFormData.index)}
                loading={loading}
                focusedField={noteFocusedField}
                onDataChanged={handleAssociatedRecordDataChanged}
                onDelete={(pkId) => handleDeleteNote(pkId)}
                onHomeClick={(action, srcData, currentData) => handleNoteHomeClick(action, srcData, currentData)}
              />
            ) : (
              <NotesListTab
                data={streetData && streetData.streetNotes ? streetData.streetNotes : null}
                errors={noteErrors}
                loading={loading}
                variant="street"
                onNoteSelected={(pkId, noteData, dataIdx) => handleNoteSelected(pkId, noteData, dataIdx)}
                onNoteDelete={(pkId) => handleDeleteNote(pkId)}
              />
            )}
          </TabPanel>
          <TabPanel value={value} index={settingsContext.isScottish ? 6 : 5}>
            <EntityHistoryTab variant="street" />
          </TabPanel>
        </Fragment>
      ) : (
        <Fragment>
          <TabPanel value={value} index={2}>
            <RelatedTab
              variant="street"
              propertyCount={streetData ? streetData.relatedPropertyCount : 0}
              streetCount={streetData ? streetData.relatedStreetCount : 0}
              onSetCopyOpen={(open, dataType) => handleCopyOpen(open, dataType)}
              onPropertyAdd={(usrn, parent, isRange) => handlePropertyAdd(usrn, parent, isRange)}
            />
          </TabPanel>
          <TabPanel value={value} index={3}>
            {notesFormData ? (
              <NotesDataTab
                data={notesFormData}
                errors={noteErrors && noteErrors.filter((x) => x.index === notesFormData.index)}
                loading={loading}
                focusedField={noteFocusedField}
                onDataChanged={handleAssociatedRecordDataChanged}
                onHomeClick={(action, srcData, currentData) => handleNoteHomeClick(action, srcData, currentData)}
              />
            ) : (
              <NotesListTab
                data={streetData && streetData.streetNotes ? streetData.streetNotes : null}
                errors={noteErrors}
                loading={loading}
                variant="street"
                onNoteSelected={(pkId, noteData, dataIdx) => handleNoteSelected(pkId, noteData, dataIdx)}
                onNoteDelete={(pkId) => handleDeleteNote(pkId)}
              />
            )}
          </TabPanel>
          <TabPanel
            value={value}
            index={settingsContext.isScottish ? 6 : HasASD() && streetData && streetData.recordType < 4 ? 5 : 4}
          >
            <EntityHistoryTab variant="street" />
          </TabPanel>
        </Fragment>
      )}
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
              ? "The street has been successfully saved."
              : failedValidation.current
              ? "Failed to validate the record."
              : "Failed to save the street."
          }`}</Alert>
        </Snackbar>
      </div>
      <AppBar
        position="static"
        color="default"
        sx={{
          top: "auto",
          bottom: 0,
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
              streetData && streetData.streetLastUpdated ? FormatDateTime(streetData.streetLastUpdated) : ""
            }`}</Typography>
            {streetData && streetData.streetLastUser && GetUserAvatar(streetData.streetLastUser)}
          </Stack>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            id="street-save-button"
            sx={getSaveButtonStyle(streetContext.currentStreetHasErrors)}
            variant="text"
            startIcon={getSaveIcon(streetContext.currentStreetHasErrors)}
            disabled={saveDisabled}
            onClick={handleSaveClicked}
          >
            Save
          </Button>
        </Toolbar>
      </AppBar>
      <AddPropertyWizardDialog
        variant={propertyWizardType.current}
        parent={propertyWizardParent.current}
        isOpen={openPropertyWizard}
        onDone={handlePropertyWizardDone}
        onClose={handlePropertyWizardClose}
      />
      <HistoricPropertyDialog open={openHistoricProperty} onClose={handleHistoricPropertyClose} />
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        onClose={handleAlertClose}
      >
        <Alert
          sx={GetAlertStyle(
            ["esuDivided", "mergedEsus", "unassignEsus", "assignEsu", "assignEsus"].includes(alertType.current)
          )}
          icon={GetAlertIcon(
            ["esuDivided", "mergedEsus", "unassignEsus", "assignEsu", "assignEsus"].includes(alertType.current)
          )}
          onClose={handleAlertClose}
          severity={GetAlertSeverity(
            ["esuDivided", "mergedEsus", "unassignEsus", "assignEsu", "assignEsus"].includes(alertType.current)
          )}
          elevation={6}
          variant="filled"
        >{`${
          alertType.current === "invalidSingleState"
            ? `You are not allowed to create a property on a closed street.`
            : alertType.current === "invalidRangeState"
            ? `You are not allowed to create properties on a closed street.`
            : alertType.current === "esuDivided"
            ? `The ESU has been successfully split.`
            : alertType.current === "mergedEsus"
            ? `The ESUs have been successfully merged.`
            : alertType.current === "unassignEsus"
            ? `The ESUs have been successfully unassigned from the street.`
            : alertType.current === "assignEsu"
            ? `The ESU has been successfully assigned to the street.`
            : alertType.current === "assignEsus"
            ? `The ESUs have been successfully assigned to the street.`
            : alertType.current === "streetAlreadyDividedMerged"
            ? "There has already been a divide or merge on this street, please save changes before retrying."
            : `Unknown error.`
        }`}</Alert>
      </Snackbar>
    </div>
  );
}

export default StreetDataForm;
