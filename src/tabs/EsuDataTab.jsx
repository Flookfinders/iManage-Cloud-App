//#region header
//--------------------------------------------------------------------------------------------------
//
//  Description: ESU Data tab
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
//    002   10.08.23 Sean Flook                 Fixed to work correctly for OneScotland.
//    003   07.09.23 Sean Flook                 Changes required to maintain ESUs.
//    004   06.10.23 Sean Flook                 Use colour variables.
//    005   27.10.23 Sean Flook                 Use new dataFormStyle.
//    006   03.11.23 Sean Flook                 Added hyphen to one-way.
//    007   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system and fixed a warning.
//    008   05.01.24 Sean Flook                 Changes to sort out warnings and use CSS shortcuts.
//    009   11.01.24 Sean Flook                 Fix warnings.
//    010   17.01.24 Sean Flook                 Changes after Louise's review.
//    011   25.01.24 Sean Flook                 Changes required after UX review.
//    012   30.01.24 Sean Flook                 Changed tolerance to a select control so we can limit the options to valid items.
//    013   07.02.24 Sean Flook       IMANN-284 Corrected error field name.
//    014   27.02.24 Joshua McCormick IMANN-288 Add new ESU Title & removed unnecessary actions in toolbar
//    015   27.02.24 Joshua McCormick IMANN-288 Added back toolbar, now hidden if esuId is negative
//    016   27.02.24 Joshua McCormick IMANN-286 Changed highway dedication indicator to appear diamond like, rotated 45 as mui offers no alternative
//    017   27.02.24 Joshua McCormick IMANN-286 Using clippath instead of rotate 45 for highway dedication indicator
//    018   07.03.24 Sean Flook       IMANN-348 Changes required to ensure the OK button is correctly enabled and removed redundant code.
//    019   11.03.24 Sean Flook           GLB12 Adjusted height to remove gap.
//    020   12.03.24 Joshua McCormick IMANN-280 Moved ADSActionButton to correct place inside Typography for toolbar
//    021   14.03.24 Sean Flook        ESU19_GP Moved getHighwayDedicationIconStyle to ADSStyles.
//    022   12.03.24 Joshua McCormick IMANN-280 Reverted removed changes and fixed vertical toolbar alignment
//    023   22.03.24 Sean Flook           GLB12 Changed to use dataFormStyle so height can be correctly set.
//    024   22.03.24 Sean Flook       PRFRM6_GP Display information control when editing an existing ESU.
//    025   26.03.24 Joshua McCormick IMANN-280 Added divider on tab between back button and title
//    026   14.05.24 Joshua McCormick IMANN-386 Toolbar styling for responsiveness
//    027   17.05.24 Sean Flook       IMANN-458 Pass isActive to the GetTabIconStyle method.
//    028   20.06.24 Sean Flook       IMANN-636 Use the new user rights.
//    029   26.07.24 Sean Flook       IMANN-856 Correctly handle deleting newly added record.
//    030   20.08.24 Sean Flook       IMANN-941 Corrected field name used for focused field.
//#endregion Version 1.0.0.0
//#region Version 1.0.1.0
//    031   02.10.24 Sean Flook       IMANN-999 Changed label to State date.
//    032   28.10.24 Joshua McCormick IMANN-904 mapContext call for onEditMapObject
//    033   05.11.24 Sean Flook       IMANN-904 Corrected typo.
//#endregion Version 1.0.1.0
//
//--------------------------------------------------------------------------------------------------
//#endregion header

import React, { useContext, useState, useEffect, Fragment } from "react";
import PropTypes from "prop-types";
import SandboxContext from "../context/sandboxContext";
import UserContext from "./../context/userContext";
import StreetContext from "../context/streetContext";
import SettingsContext from "../context/settingsContext";
import MapContext from "../context/mapContext";
import InformationContext from "../context/informationContext";

import ObjectComparison, { esuKeysToIgnore } from "../utils/ObjectComparison";

import {
  Typography,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  Fade,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  ListItemAvatar,
  Avatar,
  ListItemIcon,
  Popper,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSInformationControl from "../components/ADSInformationControl";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";
import {
  ExpandMore,
  ChevronRight,
  Directions,
  DirectionsBike,
  ArrowUpward,
  MoreVert as ActionsIcon,
} from "@mui/icons-material";
import {
  IndentIcon,
  PRoWIcon,
  QuietRouteIcon,
  ObstructionIcon,
  PlanningOrderIcon,
  VehiclesProhibitedIcon,
} from "../utils/ADSIcons";
import { copyTextToClipboard, GetLookupLabel, ConvertDate, GetCurrentDate, ArraysEqual } from "../utils/HelperUtils";
import ESUDirectionCode from "../data/ESUDirectionCode";
import ESUTolerance from "../data/ESUTolerance";
import HighwayDedicationCode from "../data/HighwayDedicationCode";
import OneWayExemptionType from "./../data/OneWayExemptionType";
import EsuState from "./../data/ESUState";
import EsuClassification from "./../data/ESUClassification";
import ADSActionButton from "../components/ADSActionButton";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSDateControl from "../components/ADSDateControl";
import ADSOkCancelControl from "../components/ADSOkCancelControl";

import { adsBlueA, adsMidGreyA, adsRed10, adsRed20, adsWhite, adsLightBlue, adsLightBlue10 } from "../utils/ADSColours";
import {
  toolbarStyle,
  dataTabToolBar,
  ActionIconStyle,
  dataFormStyle,
  GetTabIconStyle,
  menuStyle,
  menuItemStyle,
  tooltipStyle,
  getHighwayDedicationIconStyle,
} from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";
import { grey } from "@mui/material/colors";

EsuDataTab.propTypes = {
  data: PropTypes.object,
  streetState: PropTypes.number,
  errors: PropTypes.array,
  oweErrors: PropTypes.array,
  hdErrors: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  focusedField: PropTypes.string,
  onValidateData: PropTypes.func.isRequired,
  onHomeClick: PropTypes.func.isRequired,
  onSetCopyOpen: PropTypes.func.isRequired,
  onHighwayDedicationClicked: PropTypes.func.isRequired,
  onOneWayExceptionClicked: PropTypes.func.isRequired,
  onAddEsu: PropTypes.func.isRequired,
  onAddHighwayDedication: PropTypes.func.isRequired,
  onAddOneWayException: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onDivideError: PropTypes.func.isRequired,
};

function EsuDataTab({
  data,
  streetState,
  errors,
  oweErrors,
  hdErrors,
  loading,
  focusedField,
  onHomeClick,
  onValidateData,
  onSetCopyOpen,
  onHighwayDedicationClicked,
  onOneWayExceptionClicked,
  onAddEsu,
  onAddHighwayDedication,
  onAddOneWayException,
  onDelete,
  onDivideError,
}) {
  const theme = useTheme();

  const sandboxContext = useContext(SandboxContext);
  const userContext = useContext(UserContext);
  const streetContext = useContext(StreetContext);
  const settingsContext = useContext(SettingsContext);
  const mapContext = useContext(MapContext);
  const informationContext = useContext(InformationContext);

  const [anchorEl, setAnchorEl] = useState(null);
  const [hdSelectedRecord, setHDSelectedRecord] = useState(null);
  const [oweSelectedRecord, setOWESelectedRecord] = useState(null);

  const [hdItemSelected, setHDItemSelected] = useState(false);
  const [oweItemSelected, setOWEItemSelected] = useState(false);
  const [openHighwayDedication, setOpenHighwayDedication] = useState(true);
  const [openOneWayExemption, setOpenOneWayExemption] = useState(true);

  const [direction, setDirection] = useState(null);
  const [tolerance, setTolerance] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [state, setState] = useState(null);
  const [stateDate, setStateDate] = useState(null);
  const [classification, setClassification] = useState(null);
  const [classificationDate, setClassificationDate] = useState(null);

  const [userCanEdit, setUserCanEdit] = useState(false);

  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);

  const [directionError, setDirectionError] = useState(null);
  const [toleranceError, setToleranceError] = useState(null);
  const [startDateError, setStartDateError] = useState(null);
  const [endDateError, setEndDateError] = useState(null);
  const [stateError, setStateError] = useState(null);
  const [stateDateError, setStateDateError] = useState(null);
  const [classificationError, setClassificationError] = useState(null);
  const [classificationDateError, setClassificationDateError] = useState(null);

  const [informationVariant, setInformationVariant] = useState(null);
  const [informationAnchorEl, setInformationAnchorEl] = useState(null);
  const informationOpen = Boolean(informationAnchorEl);
  const informationId = informationOpen ? "esu-information-popper" : undefined;

  /**
   * Method to determine if a one-way exemption record can be added to the current ESU record.
   *
   * @returns {boolean} True if the user is allowed to add a one-way exemption record to the ESU record; otherwise false.
   */
  const canAddOneWayExemption = () => {
    return streetState && streetState < 4 && direction && direction > 1;
  };

  /**
   * Update the sandbox ESU record.
   *
   * @param {string} field The name of the field to update with the new value.
   * @param {string|number|boolean|Date|null} newValue The new value for the given field to update.
   */
  const UpdateSandbox = (field, newValue) => {
    const newEsuData = GetCurrentData(field, newValue);
    sandboxContext.onSandboxChange("esu", newEsuData);
  };

  /**
   * Event to handle when the direction flag is changed.
   *
   * @param {number|null} newValue The new direction flag value
   */
  const handleDirectionChangeEvent = (newValue) => {
    setDirection(newValue);
    UpdateSandbox("direction", newValue);
  };

  /**
   * Event to handle when the tolerance is changed.
   *
   * @param {number|null} newValue The new tolerance value.
   */
  const handleToleranceChangeEvent = (newValue) => {
    setTolerance(newValue);
    UpdateSandbox("tolerance", newValue);
  };

  /**
   * Event to handle when the state is changed.
   *
   * @param {number|null} newValue The new state value.
   */
  const handleStateChangeEvent = (newValue) => {
    setState(newValue);
    UpdateSandbox("state", newValue);
  };

  /**
   * Event to handle when the state date is changed.
   *
   * @param {Date|null} newValue The new state date.
   */
  const handleStateDateChangeEvent = (newValue) => {
    setStateDate(newValue);
    UpdateSandbox("stateDate", newValue);
  };

  /**
   * Event to handle when the classification is changed.
   *
   * @param {number|null} newValue The new classification value.
   */
  const handleClassificationChangeEvent = (newValue) => {
    setClassification(newValue);
    UpdateSandbox("classification", newValue);
  };

  /**
   * Event to handle when then classification date is changed.
   *
   * @param {Date|null} newValue The new classification date.
   */
  const handleClassificationDateChangeEvent = (newValue) => {
    setClassificationDate(newValue);
    UpdateSandbox("classificationDate", newValue);
  };

  /**
   * Event to handle when the start date is changed.
   *
   * @param {Date|null} newValue The new start date.
   */
  const handleStartDateChangeEvent = (newValue) => {
    setStartDate(newValue);
    UpdateSandbox("startDate", newValue);
  };

  /**
   * Event to handle when the end date is changed.
   *
   * @param {Date|null} newValue The new end date.
   */
  const handleEndDateChangeEvent = (newValue) => {
    setEndDate(newValue);
    UpdateSandbox("endDate", newValue);
  };

  /**
   * Event to handle when the copy ESU Id button is clicked.
   */
  const handleCopyEsuId = () => {
    if (data.esuData.esuId) {
      itemCopy(data.esuData.esuId.toString(), "ESU Id");
    }
  };

  /**
   * Event to handle when the information cancel button is clicked.
   */
  const handleInformationCancel = () => {
    informationContext.onClearInformation();
  };

  /**
   * Method used to copy the text to the clipboard.
   *
   * @param {string|null} text The text that needs to be copied to the clipboard.
   * @param {string} dataType The type of data that is being copied to the clipboard.
   */
  const itemCopy = (text, dataType) => {
    if (text) {
      copyTextToClipboard(text);
      if (onSetCopyOpen) onSetCopyOpen(true, dataType);
    }
  };

  /**
   * Event to handle when the actions button is clicked.
   *
   * @param {object} event
   */
  const handleActionsClick = (event) => {
    setAnchorEl(event.nativeEvent.target);
    event.stopPropagation();
  };

  /**
   * Event to handle when the actions menu is closed.
   *
   * @param {object} event The event object.
   */
  const handleActionsMenuClose = (event) => {
    setAnchorEl(null);
    event.stopPropagation();
  };

  /**
   * Event to handle when the home button is clicked.
   */
  const handleHomeClick = () => {
    const sourceEsu =
      data.pkId > 0 && sandboxContext.currentSandbox.sourceStreet
        ? sandboxContext.currentSandbox.sourceStreet.esus.find((x) => x.pkId === data.pkId)
        : null;

    if (onHomeClick)
      onHomeClick(
        streetContext.esuDataChanged
          ? sandboxContext.currentSandbox.currentStreetRecords.esu
            ? "check"
            : "discard"
          : "discard",
        sourceEsu,
        sandboxContext.currentSandbox.currentStreetRecords.esu
      );
  };

  /**
   * Event to handle when the OK button is clicked.
   */
  const handleOkClicked = () => {
    if (onHomeClick) onHomeClick("save", null, sandboxContext.currentSandbox.currentStreetRecords.esu);
  };

  /**
   * Event to handle when the Cancel button is clicked.
   */
  const handleCancelClicked = () => {
    if (streetContext.esuDataChanged) {
      if (data && data.esuData) {
        setDirection(data.esuData.esuDirection);
        setTolerance(data.esuData.esuTolerance ? data.esuData.esuTolerance : 0);
        setStartDate(data.esuData.esuStartDate);
        setEndDate(data.esuData.esuEndDate);
        mapContext.onEditMapObject(null, null);
      }
    }
    if (onHomeClick) onHomeClick("discard", data.esuData, null);
  };

  /**
   * Function to return the current ESU record.
   *
   * @param {string} field The name of the field to update with the new value.
   * @param {string|number|boolean|Date|null} newValue The new value for the given field to update.
   * @returns {object} The current descriptor record.
   */
  function GetCurrentData(field, newValue) {
    if (!settingsContext.isScottish)
      return {
        changeType:
          field && field === "changeType" ? newValue : !data.esuData.esuId || data.esuData.esuId < 1 ? "I" : "U",
        esuVersionNumber: data.esuData.esuVersionNumber,
        numCoordCount: data.esuData.numCoordCount,
        esuTolerance: field && field === "tolerance" ? newValue : tolerance,
        esuStartDate:
          field && field === "startDate" ? newValue && ConvertDate(newValue) : startDate && ConvertDate(startDate),
        esuEndDate: field && field === "endDate" ? newValue && ConvertDate(newValue) : endDate && ConvertDate(endDate),
        esuDirection: field && field === "direction" ? newValue : direction,
        wktGeometry: data.esuData.wktGeometry,
        highwayDedications: data.esuData.highwayDedications,
        oneWayExemptions: data.esuData.oneWayExemptions,
        pkId: data.esuData.pkId,
        esuId: data.esuData.esuId,
      };
    else
      return {
        changeType:
          field && field === "changeType" ? newValue : !data.esuData.esuId || data.esuData.esuId < 1 ? "I" : "U",
        classification: field && field === "classification" ? newValue : classification,
        classificationDate:
          field && field === "classificationDate"
            ? ConvertDate(newValue)
            : classificationDate && ConvertDate(classificationDate),
        endDate: field && field === "endDate" ? newValue && ConvertDate(newValue) : endDate && ConvertDate(endDate),
        entryDate: data.esuData.entryDate,
        esuId: data.esuData.esuId,
        lastUpdateDate: data.esuData.lastUpdateDate,
        pkId: data.esuData.pkId,
        startDate:
          field && field === "startDate" ? newValue && ConvertDate(newValue) : startDate && ConvertDate(startDate),
        state: field && field === "state" ? newValue : state,
        stateDate: field && field === "stateDate" ? ConvertDate(newValue) : stateDate && ConvertDate(stateDate),
        wktGeometry: data.esuData.wktGeometry,
      };
  }

  /**
   * Event to handle when the add new ESU menu item is clicked.
   */
  const handleAddNewEsu = () => {
    setAnchorEl(null);
    if (onAddEsu) onAddEsu();
  };

  /**
   * Event to handle when the add highway dedication menu item is clicked.
   */
  const handleAddHighwayDedication = () => {
    setAnchorEl(null);
    informationContext.onClearInformation();

    const sourceEsu =
      data.pkId > 0 && sandboxContext.currentSandbox.sourceStreet
        ? sandboxContext.currentSandbox.sourceStreet.esus.find((x) => x.pkId === data.pkId)
        : null;

    if (onValidateData) {
      if (onValidateData(sourceEsu, sandboxContext.currentSandbox.currentStreetRecords.esu)) {
        if (onAddHighwayDedication) onAddHighwayDedication(data.esuData.esuId, data.index);
      }
    }
  };

  /**
   * Event to handle when the add one-way exemption menu item is clicked.
   */
  const handleAddOneWayExemption = () => {
    setAnchorEl(null);
    informationContext.onClearInformation();

    const sourceEsu =
      data.pkId > 0 && sandboxContext.currentSandbox.sourceStreet
        ? sandboxContext.currentSandbox.sourceStreet.esus.find((x) => x.pkId === data.pkId)
        : null;

    if (onValidateData) {
      if (onValidateData(sourceEsu, sandboxContext.currentSandbox.currentStreetRecords.esu)) {
        if (canAddOneWayExemption()) {
          if (onAddOneWayException) onAddOneWayException(data.esuData.esuId, data.index);
        }
      }
    }
  };

  /**
   * Event to handle when the divide ESU menu item is clicked.
   */
  const handleDivideEsu = () => {
    setAnchorEl(null);
    if (streetContext.esuDividedMerged) {
      if (onDivideError) onDivideError("streetAlreadyDividedMerged");
    } else {
      if (informationContext.informationType && informationContext.informationType !== "divideEsu") {
        setInformationAnchorEl(null);
      }
      informationContext.onDisplayInformation("divideESU", "EsuDataTab");
      mapContext.onDivideEsu(data.esuData.esuId);
    }
  };

  /**
   * Event to handle when the unassign from street menu item is clicked.
   */
  const handleUnassignFromStreet = () => {
    setAnchorEl(null);
    streetContext.onUnassignEsus([data.esu.esuId]);
  };

  /**
   * Event to handle when the delete menu item is clicked.
   *
   * @param {object} event
   */
  const handleDeleteEsu = (event) => {
    handleActionsMenuClose(event);
    setOpenDeleteConfirmation(true);
  };

  /**
   * Event to handle when the mouse enters a highway dedication record.
   */
  const handleHDMouseEnter = () => {
    setHDItemSelected(true);
  };

  /**
   * Event to handle when the mouse leaves a highway dedication record.
   */
  const handleHDMouseLeave = () => {
    setHDItemSelected(false);
  };

  /**
   * Event to handle when the mouse enters an one-way exemption record.
   */
  const handleOWEMouseEnter = () => {
    setOWEItemSelected(true);
  };

  /**
   * Event to handle when the mouse leaves an one-way exemption record.
   */
  const handleOWEMouseLeave = () => {
    setOWEItemSelected(false);
  };

  /**
   * Event to handle when the mouse enters a highway dedication record.
   */
  const handleHDMouseEnterRecord = (event) => {
    setHDSelectedRecord(event.target.id);
  };

  /**
   * Event to handle when the mouse leaves a highway dedication record.
   */
  const handleHDMouseLeaveRecord = () => {
    setHDSelectedRecord(null);
  };

  /**
   * Event to handle when the mouse enters an one-way exemption record.
   */
  const handleOWEMouseEnterRecord = (event) => {
    setOWESelectedRecord(event.target.id);
  };

  /**
   * Event to handle when the mouse leaves an one-way exemption record.
   */
  const handleOWEMouseLeaveRecord = () => {
    setOWESelectedRecord(null);
  };

  /**
   * Event to handle when the highway dedication group is expanded and collapsed.
   *
   * @param {object} event
   */
  const handleHDExpandCollapse = (event) => {
    setOpenHighwayDedication(!openHighwayDedication);
    event.stopPropagation();
  };

  /**
   * Event to handle when the one-way exemption group is expanded and collapsed.
   *
   * @param {object} event
   */
  const handleOWEExpandCollapse = (event) => {
    setOpenOneWayExemption(!openOneWayExemption);
    event.stopPropagation();
  };

  /**
   * Event to handle when the delete confirmation dialog is closed.
   *
   * @param {boolean} deleteConfirmed True if the user has confirmed the delete; otherwise false.
   */
  const handleCloseDeleteConfirmation = (deleteConfirmed) => {
    setOpenDeleteConfirmation(false);
    const pkId = data && data.pkId ? data.pkId : -1;

    if (deleteConfirmed && pkId) {
      handleEndDateChangeEvent(GetCurrentDate(false));
      const currentData = GetCurrentData("changeType", "D");
      if (onHomeClick) onHomeClick("save", null, currentData);
      if (onDelete) onDelete(pkId);
    }
  };

  /**
   * Method to return the number of associated records for the current ESU.
   *
   * @returns {number} The number of associated record for the current ESU.
   */
  const getAssociatedRecords = () => {
    let associatedRecords = [];
    if (!settingsContext.isScottish) {
      if (data.esuData.highwayDedications && data.esuData.highwayDedications.length > 0)
        associatedRecords.push({
          type: "Highway dedication",
          count: data.esuData.highwayDedications.length,
        });
      if (data.esuData.oneWayExemptions && data.esuData.oneWayExemptions.length > 0)
        associatedRecords.push({
          type: "One-way exemption",
          count: data.esuData.oneWayExemptions.length,
        });
    }
    return associatedRecords;
  };

  /**
   * Method to get the highway dedication text for a given code.
   *
   * @param {number} hdCode The code used for the highway dedication.
   * @returns {string} The highway dedication text for the given code.
   */
  function GetHighwayDedication(hdCode) {
    const hdRecord = HighwayDedicationCode.filter((x) => x.id === hdCode);

    if (hdRecord && hdRecord.length > 0) return hdRecord[0].gpText;
    else return "";
  }

  /**
   * Method to get the one-way exemption text for a given code.
   *
   * @param {number} oweCode The code used for the one-way exemption.
   * @returns  {string} The one-way exemption text for the given code.
   */
  function GetOneWayExemption(oweCode) {
    const oweRecord = OneWayExemptionType.filter((x) => x.id === oweCode);

    if (oweRecord && oweRecord.length > 0) return oweRecord[0].gpText;
    else return "";
  }

  /**
   * Event to handle when a highway dedication record is clicked.
   *
   * @param {object} hdData The highway dedication record.
   * @param {number} index The position within the array of highway dedication records for the ESU that this particular record is.
   */
  function handleHighwayDedicationClick(hdData, index) {
    const sourceEsu =
      data.pkId > 0 && sandboxContext.currentSandbox.sourceStreet
        ? sandboxContext.currentSandbox.sourceStreet.esus.find((x) => x.pkId === data.pkId)
        : null;

    if (onValidateData) {
      if (onValidateData(sourceEsu, sandboxContext.currentSandbox.currentStreetRecords.esu)) {
        if (onHighwayDedicationClicked) onHighwayDedicationClicked(hdData, index, data.index);
      }
    }
  }

  /**
   * Event to handle when a one-way exemption record is clicked.
   *
   * @param {object} oweData The one-way exemption record.
   * @param {number} index The position within the array of one-way exemption records for the ESU that this particular record is.
   */
  function handleOneWayExemptionClick(oweData, index) {
    const sourceEsu =
      data.pkId > 0 && sandboxContext.currentSandbox.sourceStreet
        ? sandboxContext.currentSandbox.sourceStreet.esus.find((x) => x.pkId === data.pkId)
        : null;

    if (onValidateData) {
      if (onValidateData(sourceEsu, sandboxContext.currentSandbox.currentStreetRecords.esu)) {
        if (onOneWayExceptionClicked) onOneWayExceptionClicked(oweData, index, data.index);
      }
    }
  }

  /**
   * Method to return the one-way exemption record style.
   *
   * @param {number} index The position within the array of one-way exemption records for the ESU that this particular record is.
   * @returns {object} The style for the given one-way exemption record.
   */
  const getOweStyle = (index) => {
    const defaultOweStyle = {
      pl: theme.spacing(4),
      backgroundColor: grey[100],
      "&:hover": {
        backgroundColor: adsLightBlue10,
        color: adsBlueA,
      },
    };

    if (oweErrors && oweErrors.length > 0) {
      const oweRecordErrors = oweErrors.filter((x) => x.index === index);
      if (oweRecordErrors && oweRecordErrors.length > 0) {
        return {
          pl: theme.spacing(4),
          backgroundColor: adsRed10,
          "&:hover": {
            backgroundColor: adsRed20,
            color: adsBlueA,
          },
        };
      } else return defaultOweStyle;
    } else return defaultOweStyle;
  };

  /**
   * Method to return the highway dedication record style.
   *
   * @param {number} index The position within the array of highway dedication records for the ESU that this particular record is.
   * @returns {object} The style for the given highway dedication record.
   */
  const getHdStyle = (index) => {
    const defaultHdStyle = {
      pl: theme.spacing(4),
      backgroundColor: grey[100],
      "&:hover": {
        backgroundColor: adsLightBlue10,
        color: adsBlueA,
      },
    };

    if (hdErrors && hdErrors.length > 0) {
      const hdRecordErrors = hdErrors.filter((x) => x.index === index);
      if (hdRecordErrors && hdRecordErrors.length > 0) {
        return {
          pl: theme.spacing(4),
          backgroundColor: adsRed10,
          "&:hover": {
            backgroundColor: adsRed20,
            color: adsBlueA,
          },
        };
      } else return defaultHdStyle;
    } else return defaultHdStyle;
  };

  useEffect(() => {
    if (!loading && data.esuData) {
      if (!settingsContext.isScottish) {
        setDirection(data.esuData.esuDirection);
        setTolerance(data.esuData.esuTolerance ? data.esuData.esuTolerance : 0);
        setStartDate(data.esuData.esuStartDate);
        setEndDate(data.esuData.esuEndDate);
      } else {
        setState(data.esuData.state);
        setStateDate(data.esuData.stateDate);
        setClassification(data.esuData.classification);
        setClassificationDate(data.esuData.classificationDate);
        setStartDate(data.esuData.startDate);
        setEndDate(data.esuData.endDate);
      }
    }
  }, [loading, data.esuData, settingsContext.isScottish]);

  useEffect(() => {
    if (sandboxContext.currentSandbox.sourceStreet && sandboxContext.currentSandbox.currentStreetRecords.esu) {
      const sourceEsu = sandboxContext.currentSandbox.sourceStreet.esus
        ? sandboxContext.currentSandbox.sourceStreet.esus.find(
            (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.esu.pkId
          )
        : null;

      if (sourceEsu) {
        streetContext.onEsuDataChange(
          !ObjectComparison(sourceEsu, sandboxContext.currentSandbox.currentStreetRecords.esu, esuKeysToIgnore) ||
            !ArraysEqual(
              sourceEsu.highwayDedications,
              sandboxContext.currentSandbox.currentStreetRecords.esu.highwayDedications
            ) ||
            !ArraysEqual(
              sourceEsu.oneWayExemptions,
              sandboxContext.currentSandbox.currentStreetRecords.esu.oneWayExemptions
            )
        );
      } else if (sandboxContext.currentSandbox.currentStreetRecords.esu.pkId < 0) streetContext.onEsuDataChange(true);
    }
  }, [
    sandboxContext.currentSandbox.sourceStreet,
    sandboxContext.currentSandbox.currentStreetRecords.esu,
    streetContext,
    settingsContext.isScottish,
  ]);

  useEffect(() => {
    if (
      data.esuData &&
      data.esuData.esuId &&
      (!informationContext.informationType || informationContext.informationSource !== "EsuDataTab")
    ) {
      informationContext.onDisplayInformation(data.esuData.esuId < 0 ? "createESU" : "manageESU", "EsuDataTab");
    }
  }, [data.esuData, informationContext]);

  useEffect(() => {
    setInformationVariant(informationContext.informationType);
    if (informationContext.informationSource && informationContext.informationSource === "EsuDataTab")
      setInformationAnchorEl(document.getElementById("ads-esu-data-form"));
    else setInformationAnchorEl(null);
  }, [informationContext]);

  useEffect(() => {
    setUserCanEdit(userContext.currentUser && userContext.currentUser.editStreet);
  }, [userContext]);

  useEffect(() => {
    setDirectionError(null);
    setToleranceError(null);
    setStartDateError(null);
    setEndDateError(null);
    setStateError(null);
    setStateDateError(null);
    setClassificationError(null);
    setClassificationDateError(null);

    if (errors && errors.length > 0) {
      for (const error of errors) {
        switch (error.field.toLowerCase()) {
          case "esudirection":
            setDirectionError(error.errors);
            break;

          case "esutolerance":
            setToleranceError(error.errors);
            break;

          case "esustartdate":
          case "startdate":
            setStartDateError(error.errors);
            break;

          case "esuenddate":
          case "enddate":
            setEndDateError(error.errors);
            break;

          case "state":
            setStateError(error.errors);
            break;

          case "statedate":
            setStateDateError(error.errors);
            break;

          case "classification":
            setClassificationError(error.errors);
            break;

          case "classificationdate":
            setClassificationDateError(error.errors);
            break;

          default:
            break;
        }
      }
    }
  }, [errors]);

  return (
    <Fragment>
      <Box sx={toolbarStyle} id="ads-esu-data-form">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={dataTabToolBar}>
          <Stack direction="row" spacing={0.5} justifyContent="flex-start" alignItems="center">
            <ADSActionButton variant="home" tooltipTitle="Home" tooltipPlacement="bottom" onClick={handleHomeClick} />
            <Typography>{`| ${data.esuData.esuId < 0 ? `Add new ESU` : `${data.esuData.esuId}`}`}</Typography>
          </Stack>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="flex-end">
          {data.esuData.esuId > 0 && (
            <>
              <ADSActionButton
                variant="copy"
                tooltipTitle="Copy ESU Id to clipboard"
                tooltipPlacement="right"
                disabled={informationContext.informationType && informationContext.informationType === "createESU"}
                onClick={handleCopyEsuId}
              />
              <Tooltip title="Actions" arrow placement="right" sx={tooltipStyle}>
                <IconButton
                  onClick={handleActionsClick}
                  sx={ActionIconStyle()}
                  aria_controls={`actions-menu-${data.esuData.esuId}`}
                  size="small"
                >
                  <ActionsIcon />
                </IconButton>
              </Tooltip>
            </>
          )}

          <Menu
            id={`actions-menu-${data.esuData.esuId}`}
            elevation={2}
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleActionsMenuClose}
            TransitionComponent={Fade}
            sx={menuStyle}
          >
            <MenuItem
              dense
              disabled={
                !userCanEdit ||
                (informationContext.informationType && informationContext.informationType === "createESU")
              }
              divider={settingsContext.isScottish}
              onClick={handleAddNewEsu}
              sx={menuItemStyle(false)}
            >
              <Typography variant="inherit">Add new ESU</Typography>
            </MenuItem>
            {!settingsContext.isScottish && (
              <MenuItem dense onClick={handleAddHighwayDedication} sx={menuItemStyle(false)}>
                <Typography variant="inherit">Add highway dedication</Typography>
              </MenuItem>
            )}
            {!settingsContext.isScottish && (
              <MenuItem
                dense
                divider
                disabled={!canAddOneWayExemption()}
                onClick={handleAddOneWayExemption}
                sx={menuItemStyle(false)}
              >
                <Typography variant="inherit">Add one-way exemption</Typography>
              </MenuItem>
            )}
            <MenuItem
              dense
              disabled={
                !userCanEdit ||
                (informationContext.informationType && informationContext.informationType === "createESU")
              }
              onClick={handleDivideEsu}
              sx={menuItemStyle(false)}
            >
              <Typography variant="inherit">Divide</Typography>
            </MenuItem>
            <MenuItem
              dense
              divider
              disabled={
                !userCanEdit ||
                (informationContext.informationType && informationContext.informationType === "createESU")
              }
              onClick={handleUnassignFromStreet}
              sx={menuItemStyle(false)}
            >
              <Typography variant="inherit">Unassign from street</Typography>
            </MenuItem>
            <MenuItem
              dense
              disabled={informationContext.informationType && informationContext.informationType === "createESU"}
              divider={!settingsContext.isScottish}
              onClick={handleCopyEsuId}
              sx={menuItemStyle(false)}
            >
              <Typography variant="inherit">Copy ID</Typography>
            </MenuItem>
            {!settingsContext.isScottish && (
              <MenuItem
                dense
                disabled={
                  !userCanEdit ||
                  (informationContext.informationType && informationContext.informationType === "createESU")
                }
                onClick={handleDeleteEsu}
                sx={menuItemStyle(false)}
              >
                <Typography variant="inherit" color="error">
                  Delete
                </Typography>
              </MenuItem>
            )}
          </Menu>
        </Stack>
      </Box>
      <Box sx={dataFormStyle("EsuDataTab")}>
        {!settingsContext.isScottish && (
          <ADSSelectControl
            label="Direction"
            isEditable={userCanEdit}
            isRequired
            isFocused={focusedField ? focusedField === "EsuDirection" : false}
            loading={loading}
            useRounded
            doNotSetTitleCase
            lookupData={ESUDirectionCode}
            lookupId="id"
            lookupLabel={GetLookupLabel(settingsContext.isScottish)}
            lookupColour="colour"
            lookupIcon="avatar_icon"
            value={direction}
            errorText={directionError}
            onChange={handleDirectionChangeEvent}
            helperText="Indicates whether traffic flow is restricted in a particular direction."
          />
        )}
        {!settingsContext.isScottish && (
          <ADSSelectControl
            label="Tolerance"
            isEditable={userCanEdit}
            isRequired
            doNotSetTitleCase
            loading={loading}
            isFocused={focusedField ? focusedField === "EsuTolerance" : false}
            useRounded
            lookupData={ESUTolerance}
            lookupId="id"
            lookupLabel={GetLookupLabel(settingsContext.isScottish)}
            value={tolerance}
            errorText={toleranceError}
            helperText="The tolerance of all coordinate points."
            onChange={handleToleranceChangeEvent}
          />
        )}
        {settingsContext.isScottish && (
          <ADSSelectControl
            label="State"
            isEditable={userCanEdit}
            isRequired
            doNotSetTitleCase
            loading={loading}
            isFocused={focusedField ? focusedField === "State" : false}
            useRounded
            lookupData={EsuState}
            lookupId="id"
            lookupLabel={GetLookupLabel(settingsContext.isScottish)}
            lookupColour="colour"
            value={state}
            errorText={stateError}
            helperText="This is the current state of the ESU."
            onChange={handleStateChangeEvent}
          />
        )}
        {settingsContext.isScottish && (
          <ADSDateControl
            label="State date"
            isEditable={userCanEdit}
            isRequired
            loading={loading}
            isFocused={focusedField ? focusedField === "StateDate" : false}
            value={stateDate}
            helperText="The date that the current state started."
            errorText={stateDateError}
            onChange={handleStateDateChangeEvent}
          />
        )}
        {settingsContext.isScottish && (
          <ADSSelectControl
            label="Classification"
            isEditable={userCanEdit}
            isRequired
            doNotSetTitleCase
            loading={loading}
            isFocused={focusedField ? focusedField === "Classification" : false}
            useRounded
            lookupData={EsuClassification}
            lookupId="id"
            lookupLabel={GetLookupLabel(settingsContext.isScottish)}
            lookupColour="colour"
            value={classification}
            errorText={classificationError}
            helperText="This is the current classification of the ESU."
            onChange={handleClassificationChangeEvent}
          />
        )}
        {settingsContext.isScottish && (
          <ADSDateControl
            label="Classification date"
            isEditable={userCanEdit}
            isRequired
            loading={loading}
            isFocused={focusedField ? focusedField === "ClassificationDate" : false}
            value={classificationDate}
            helperText="The date that the current classification started."
            errorText={classificationDateError}
            onChange={handleClassificationDateChangeEvent}
          />
        )}
        <ADSDateControl
          label="Start date"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "EsuStartDate" || focusedField === "StartDate" : false}
          loading={loading}
          value={startDate}
          helperText="The date that the street started."
          errorText={startDateError}
          onChange={handleStartDateChangeEvent}
        />
        {(!settingsContext.isScottish || state === 4) && (
          <ADSDateControl
            label="End date"
            isEditable={userCanEdit}
            isFocused={focusedField ? focusedField === "EsuEndDate" || focusedField === "EndDate" : false}
            loading={loading}
            value={endDate}
            helperText={`The date that the ${settingsContext.isScottish ? "ESU" : "street"} closed.`}
            errorText={endDateError}
            onChange={handleEndDateChangeEvent}
          />
        )}
        <ADSOkCancelControl
          okDisabled={!streetContext.esuDataChanged}
          onOkClicked={handleOkClicked}
          onCancelClicked={handleCancelClicked}
        />
        {!settingsContext.isScottish && (
          <List
            sx={{
              width: "100%",
              backgroundColor: theme.palette.background.paper,
              pt: theme.spacing(0),
              mt: theme.spacing(2),
            }}
            component="nav"
            key="key_highway_dedication"
          >
            <ListItemButton
              divider
              dense
              disableGutters
              sx={{
                height: "50px",
                "&:hover": {
                  backgroundColor: adsLightBlue10,
                  color: adsBlueA,
                },
              }}
              onMouseEnter={handleHDMouseEnter}
              onMouseLeave={handleHDMouseLeave}
            >
              <ListItemIcon>
                <Fragment>
                  <IconButton
                    onClick={handleHDExpandCollapse}
                    sx={{
                      pb: theme.spacing(1),
                      color: adsMidGreyA,
                      "&:hover": {
                        color: adsBlueA,
                      },
                    }}
                    aria-controls="expand-collapse"
                    size="small"
                  >
                    {openHighwayDedication ? <ExpandMore /> : <ChevronRight />}
                  </IconButton>
                  <Directions sx={{ color: adsBlueA, mt: theme.spacing(0.5) }} />
                </Fragment>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography
                      variant="subtitle1"
                      sx={{
                        pl: theme.spacing(1),
                      }}
                    >
                      Highway dedication
                    </Typography>
                    <Avatar
                      variant="rounded"
                      sx={GetTabIconStyle(
                        data.esuData && data.esuData.highwayDedications ? data.esuData.highwayDedications.length : 0,
                        hdItemSelected
                      )}
                    >
                      <Typography variant="caption">
                        <strong>
                          {data.esuData && data.esuData.highwayDedications ? data.esuData.highwayDedications.length : 0}
                        </strong>
                      </Typography>
                    </Avatar>
                  </Stack>
                }
              />
              <ListItemAvatar
                sx={{
                  minWidth: 32,
                }}
              >
                {hdItemSelected && (
                  <ADSActionButton
                    variant="add"
                    disabled={!userCanEdit}
                    tooltipTitle="Add highway dedication"
                    tooltipPlacement="right"
                    onClick={handleAddHighwayDedication}
                  />
                )}
              </ListItemAvatar>
            </ListItemButton>
            <Collapse in={openHighwayDedication} timeout="auto">
              {data.esuData &&
                data.esuData.highwayDedications &&
                data.esuData.highwayDedications.length > 0 &&
                data.esuData.highwayDedications
                  .filter((x) => x.changeType !== "D")
                  .map((d, index) => (
                    <List component="div" disablePadding key={`highway_dedication_key_${index}`}>
                      <ListItemButton
                        id={d.pkId}
                        alignItems="flex-start"
                        dense
                        disableGutters
                        autoFocus={
                          d.selectedItem && d.selectedItem >= 0 && d.selectedItem.toString() === d.pkId.toString()
                        }
                        selected={
                          hdSelectedRecord && hdSelectedRecord >= 0 && hdSelectedRecord.toString() === d.pkId.toString()
                        }
                        sx={getHdStyle(index)}
                        onClick={() => handleHighwayDedicationClick(d, index)}
                        onMouseEnter={handleHDMouseEnterRecord}
                        onMouseLeave={handleHDMouseLeaveRecord}
                      >
                        <ListItemAvatar
                          sx={{
                            pl: theme.spacing(1),
                            minWidth: 24,
                          }}
                        >
                          <IndentIcon />
                        </ListItemAvatar>
                        <ListItemAvatar
                          sx={{
                            minWidth: 24,
                          }}
                        >
                          <Avatar
                            alt={d.avatarText}
                            variant="square"
                            src={d.avatarIcon}
                            sx={{
                              width: theme.spacing(2),
                              height: theme.spacing(2),
                              mr: theme.spacing(1),
                              padding: 1.25,
                              clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                              color: adsWhite,
                              backgroundColor: adsBlueA,
                            }}
                          >
                            <Typography variant="caption">{d.highwayDedicationCode}</Typography>
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body1">{GetHighwayDedication(d.highwayDedicationCode)}</Typography>
                          }
                        />
                        <ListItemAvatar sx={{ minWidth: 30 }}>
                          <PRoWIcon fontSize="small" sx={getHighwayDedicationIconStyle(d.hdProw)} />
                        </ListItemAvatar>
                        <ListItemAvatar sx={{ minWidth: 30 }}>
                          <DirectionsBike fontSize="small" sx={getHighwayDedicationIconStyle(d.hdNcr)} />
                        </ListItemAvatar>
                        <ListItemAvatar sx={{ minWidth: 30 }}>
                          <QuietRouteIcon fontSize="small" sx={getHighwayDedicationIconStyle(d.hdQuietRoute)} />
                        </ListItemAvatar>
                        <ListItemAvatar sx={{ minWidth: 30 }}>
                          <ObstructionIcon fontSize="small" sx={getHighwayDedicationIconStyle(d.hdObstruction)} />
                        </ListItemAvatar>
                        <ListItemAvatar sx={{ minWidth: 30 }}>
                          <PlanningOrderIcon fontSize="small" sx={getHighwayDedicationIconStyle(d.hdPlanningOrder)} />
                        </ListItemAvatar>
                        <ListItemAvatar sx={{ minWidth: 30 }}>
                          <VehiclesProhibitedIcon
                            fontSize="small"
                            sx={getHighwayDedicationIconStyle(d.hdWorksProhibited)}
                          />
                        </ListItemAvatar>
                      </ListItemButton>
                    </List>
                  ))}
            </Collapse>
            {direction !== 1 && (
              <ListItemButton
                divider
                dense
                disableGutters
                sx={{
                  height: "50px",
                  "&:hover": {
                    backgroundColor: adsLightBlue10,
                    color: adsBlueA,
                  },
                }}
                onMouseEnter={handleOWEMouseEnter}
                onMouseLeave={handleOWEMouseLeave}
              >
                <ListItemIcon>
                  <Fragment>
                    <IconButton
                      onClick={handleOWEExpandCollapse}
                      sx={{
                        pb: theme.spacing(1),
                        color: adsMidGreyA,
                        "&:hover": {
                          color: adsBlueA,
                        },
                      }}
                      aria-controls="expand-collapse"
                      size="small"
                    >
                      {openOneWayExemption ? <ExpandMore /> : <ChevronRight />}
                    </IconButton>
                    <ArrowUpward
                      sx={{
                        color: adsWhite,
                        backgroundColor: adsLightBlue,
                        mt: theme.spacing(0.5),
                      }}
                    />
                  </Fragment>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography
                        variant="subtitle1"
                        sx={{
                          pl: theme.spacing(1),
                        }}
                      >
                        One-way exemption
                      </Typography>
                      <Avatar
                        variant="rounded"
                        sx={GetTabIconStyle(
                          data.esuData && data.esuData.oneWayExemptions ? data.esuData.oneWayExemptions.length : 0,
                          oweItemSelected
                        )}
                      >
                        <Typography variant="caption">
                          <strong>
                            {data.esuData && data.esuData.oneWayExemptions ? data.esuData.oneWayExemptions.length : 0}
                          </strong>
                        </Typography>
                      </Avatar>
                    </Stack>
                  }
                />
                <ListItemAvatar
                  sx={{
                    minWidth: 32,
                  }}
                >
                  {canAddOneWayExemption() && oweItemSelected && (
                    <ADSActionButton
                      variant="add"
                      disabled={!userCanEdit}
                      tooltipTitle="Add one-way exemption"
                      tooltipPlacement="right"
                      onClick={handleAddOneWayExemption}
                    />
                  )}
                </ListItemAvatar>
              </ListItemButton>
            )}
            {direction !== 1 && (
              <Collapse in={openOneWayExemption} timeout="auto">
                {data.esuData &&
                  data.esuData.oneWayExemptions &&
                  data.esuData.oneWayExemptions.length > 0 &&
                  data.esuData.oneWayExemptions
                    .filter((x) => x.changeType !== "D")
                    .map((d, index) => (
                      <List component="div" disablePadding key={`one_way_exemption_key_${index}`}>
                        <ListItemButton
                          id={d.pkId}
                          alignItems="flex-start"
                          dense
                          disableGutters
                          autoFocus={
                            d.selectedItem && d.selectedItem >= 0 && d.selectedItem.toString() === d.pkId.toString()
                          }
                          selected={
                            oweSelectedRecord &&
                            oweSelectedRecord >= 0 &&
                            oweSelectedRecord.toString() === d.pkId.toString()
                          }
                          sx={getOweStyle(index)}
                          onClick={() => handleOneWayExemptionClick(d, index)}
                          onMouseEnter={handleOWEMouseEnterRecord}
                          onMouseLeave={handleOWEMouseLeaveRecord}
                        >
                          <ListItemAvatar
                            sx={{
                              pl: theme.spacing(1),
                              minWidth: 24,
                            }}
                          >
                            <IndentIcon />
                          </ListItemAvatar>
                          <ListItemAvatar
                            sx={{
                              minWidth: 24,
                            }}
                          >
                            <Avatar
                              variant="rounded"
                              alt={d.avatarText}
                              src={d.avatarIcon}
                              sx={{
                                width: theme.spacing(2),
                                height: theme.spacing(2),
                                color: adsWhite,
                                backgroundColor: adsLightBlue,
                              }}
                            >
                              <Typography variant="caption">{d.oneWayExemptionType}</Typography>
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="body1">{GetOneWayExemption(d.oneWayExemptionType)}</Typography>
                            }
                          />
                        </ListItemButton>
                      </List>
                    ))}
              </Collapse>
            )}
          </List>
        )}
      </Box>
      <div>
        <ConfirmDeleteDialog
          variant="esu"
          open={openDeleteConfirmation}
          associatedRecords={getAssociatedRecords()}
          onClose={handleCloseDeleteConfirmation}
        />
      </div>
      <Popper id={informationId} open={informationOpen} anchorEl={informationAnchorEl} placement="top-start">
        <ADSInformationControl
          variant={informationVariant}
          hasCancel={informationVariant === "divideESU"}
          onCancel={handleInformationCancel}
        />
      </Popper>
    </Fragment>
  );
}

export default EsuDataTab;
