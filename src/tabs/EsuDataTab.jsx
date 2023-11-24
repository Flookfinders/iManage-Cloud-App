/* #region header */
/**************************************************************************************************
//
//  Description: ESU Data tab
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
//    002   10.08.23 Sean Flook                 Fixed to work correctly for OneScotland.
//    003   07.09.23 Sean Flook                 Changes required to maintain ESUs.
//    004   06.10.23 Sean Flook                 Use colour variables.
//    005   27.10.23 Sean Flook                 Use new dataFormStyle.
//    006   03.11.23 Sean Flook                 Added hyphen to one-way.
//    007   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system and fixed a warning.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useEffect, Fragment } from "react";
import PropTypes from "prop-types";
import SandboxContext from "../context/sandboxContext";
import UserContext from "./../context/userContext";
import StreetContext from "../context/streetContext";
import SettingsContext from "../context/settingsContext";
import MapContext from "../context/mapContext";
import {
  Grid,
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
} from "@mui/material";
import { Box, Stack } from "@mui/system";
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
import { copyTextToClipboard, GetLookupLabel, ConvertDate, GetCurrentDate } from "../utils/HelperUtils";
import ESUDirectionCode from "../data/ESUDirectionCode";
import HighwayDedicationCode from "../data/HighwayDedicationCode";
import OneWayExemptionType from "./../data/OneWayExemptionType";
import EsuState from "./../data/ESUState";
import EsuClassification from "./../data/ESUClassification";
import ADSActionButton from "../components/ADSActionButton";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSNumberControl from "../components/ADSNumberControl";
import ADSDateControl from "../components/ADSDateControl";
import ADSOkCancelControl from "../components/ADSOkCancelControl";

import { adsBlueA, adsMidGreyA, adsRed10, adsRed20, adsWhite, adsLightBlue, adsLightBlue10 } from "../utils/ADSColours";
import {
  streetToolbarStyle,
  ActionIconStyle,
  dataFormStyle,
  GetTabIconStyle,
  menuStyle,
  menuItemStyle,
  tooltipStyle,
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
  onDataChanged: PropTypes.func.isRequired,
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
  onDataChanged,
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

  const [anchorEl, setAnchorEl] = useState(null);
  const [hdSelectedRecord, setHDSelectedRecord] = useState(null);
  const [oweSelectedRecord, setOWESelectedRecord] = useState(null);

  const [hdItemSelected, setHDItemSelected] = useState(false);
  const [oweItemSelected, setOWEItemSelected] = useState(false);
  const [openHighwayDedication, setOpenHighwayDedication] = useState(true);
  const [openOneWayExemption, setOpenOneWayExemption] = useState(true);

  const [direction, setDirection] = useState(data && data.esuData ? data.esuData.esuDirection : null);
  const [tolerance, setTolerance] = useState(data && data.esuData ? data.esuData.esuTolerance : null);
  const [startDate, setStartDate] = useState(data && data.esuData ? data.esuData.esuStartDate : null);
  const [endDate, setEndDate] = useState(data && data.esuData ? data.esuData.esuEndDate : null);
  const [state, setState] = useState(data && data.esuData ? data.esuData.state : null);
  const [stateDate, setStateDate] = useState(data && data.esuData ? data.esuData.stateDate : null);
  const [classification, setClassification] = useState(data && data.esuData ? data.esuData.esuClassification : null);
  const [classificationDate, setClassificationDate] = useState(
    data && data.esuData ? data.esuData.esuClassificationDate : null
  );

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
    if (!streetContext.esuDataChanged) {
      streetContext.onEsuDataChange(direction !== newValue);
      if (onDataChanged && direction !== newValue) onDataChanged();
    }
    UpdateSandbox("direction", newValue);
  };

  /**
   * Event to handle when the tolerance is changed.
   *
   * @param {number|null} newValue The new tolerance value.
   */
  const handleToleranceChangeEvent = (newValue) => {
    setTolerance(newValue);
    if (!streetContext.esuDataChanged) {
      streetContext.onEsuDataChange(tolerance !== newValue);
      if (onDataChanged && tolerance !== newValue) onDataChanged();
    }
    UpdateSandbox("tolerance", newValue);
  };

  /**
   * Event to handle when the state is changed.
   *
   * @param {number|null} newValue The new state value.
   */
  const handleStateChangeEvent = (newValue) => {
    setState(newValue);
    if (!streetContext.esuDataChanged) {
      streetContext.onEsuDataChange(state !== newValue);
      if (onDataChanged && state !== newValue) onDataChanged();
    }
    UpdateSandbox("state", newValue);
  };

  /**
   * Event to handle when the state date is changed.
   *
   * @param {Date|null} newValue The new state date.
   */
  const handleStateDateChangeEvent = (newValue) => {
    setStateDate(newValue);
    if (!streetContext.esuDataChanged) {
      streetContext.onEsuDataChange(stateDate !== newValue);
      if (onDataChanged && stateDate !== newValue) onDataChanged();
    }
    UpdateSandbox("stateDate", newValue);
  };

  /**
   * Event to handle when the classification is changed.
   *
   * @param {number|null} newValue The new classification value.
   */
  const handleClassificationChangeEvent = (newValue) => {
    setClassification(newValue);
    if (!streetContext.esuDataChanged) {
      streetContext.onEsuDataChange(classification !== newValue);
      if (onDataChanged && classification !== newValue) onDataChanged();
    }
    UpdateSandbox("classification", newValue);
  };

  /**
   * Event to handle when then classification date is changed.
   *
   * @param {Date|null} newValue The new classification date.
   */
  const handleClassificationDateChangeEvent = (newValue) => {
    setClassificationDate(newValue);
    if (!streetContext.esuDataChanged) {
      streetContext.onEsuDataChange(classificationDate !== newValue);
      if (onDataChanged && classificationDate !== newValue) onDataChanged();
    }
    UpdateSandbox("classificationDate", newValue);
  };

  /**
   * Event to handle when the start date is changed.
   *
   * @param {Date|null} newValue The new start date.
   */
  const handleStartDateChangeEvent = (newValue) => {
    setStartDate(newValue);
    if (!streetContext.esuDataChanged) {
      streetContext.onEsuDataChange(startDate !== newValue);
      if (onDataChanged && startDate !== newValue) onDataChanged();
    }
    UpdateSandbox("startDate", newValue);
  };

  /**
   * Event to handle when the end date is changed.
   *
   * @param {Date|null} newValue The new end date.
   */
  const handleEndDateChangeEvent = (newValue) => {
    setEndDate(newValue);
    if (!streetContext.esuDataChanged) {
      streetContext.onEsuDataChange(endDate !== newValue);
      if (onDataChanged && endDate !== newValue) onDataChanged();
    }
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
      streetContext.onEsuDataChange(
        onHomeClick(
          streetContext.esuDataChanged
            ? sandboxContext.currentSandbox.currentStreetRecords.esu
              ? "check"
              : "discard"
            : "discard",
          sourceEsu,
          sandboxContext.currentSandbox.currentStreetRecords.esu
        )
      );
  };

  /**
   * Event to handle when the OK button is clicked.
   */
  const handleOkClicked = () => {
    if (onHomeClick)
      streetContext.onEsuDataChange(onHomeClick("save", null, sandboxContext.currentSandbox.currentStreetRecords.esu));
  };

  /**
   * Event to handle when the Cancel button is clicked.
   */
  const handleCancelClicked = () => {
    if (streetContext.esuDataChanged) {
      if (data && data.esuData) {
        setDirection(data.esuData.esuDirection);
        setTolerance(data.esuData.esuTolerance);
        setStartDate(data.esuData.esuStartDate);
        setEndDate(data.esuData.esuEndDate);
      }
    }
    streetContext.onEsuDataChange(false);
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
    if (!streetContext.esuDataChanged) streetContext.onEsuDataChange(true);
  };

  /**
   * Event to handle when the add highway dedication menu item is clicked.
   */
  const handleAddHighwayDedication = () => {
    setAnchorEl(null);

    const sourceEsu =
      data.pkId > 0 && sandboxContext.currentSandbox.sourceStreet
        ? sandboxContext.currentSandbox.sourceStreet.esus.find((x) => x.pkId === data.pkId)
        : null;

    if (onValidateData) {
      if (onValidateData(sourceEsu, sandboxContext.currentSandbox.currentStreetRecords.esu)) {
        if (onAddHighwayDedication) onAddHighwayDedication(data.esuData.esuId, data.index);
        if (!streetContext.esuDataChanged) streetContext.onEsuDataChange(true);
      }
    }
  };

  /**
   * Event to handle when the add one-way exemption menu item is clicked.
   */
  const handleAddOneWayExemption = () => {
    setAnchorEl(null);

    const sourceEsu =
      data.pkId > 0 && sandboxContext.currentSandbox.sourceStreet
        ? sandboxContext.currentSandbox.sourceStreet.esus.find((x) => x.pkId === data.pkId)
        : null;

    if (onValidateData) {
      if (onValidateData(sourceEsu, sandboxContext.currentSandbox.currentStreetRecords.esu)) {
        if (canAddOneWayExemption()) {
          if (onAddOneWayException) onAddOneWayException(data.esuData.esuId, data.index);
          if (!streetContext.esuDataChanged) streetContext.onEsuDataChange(true);
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
    } else mapContext.onDivideEsu(data.esuData.esuId);
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

    if (deleteConfirmed && pkId && pkId > 0) {
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
   * Method to get the highway dedication record.
   *
   * @param {boolean} selected True if the record is selected.
   * @returns {object} The style to be used for the record.
   */
  function getHighwayDedicationStyle(selected) {
    if (selected) return { color: adsLightBlue };
    else return { color: grey[300] };
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
      paddingLeft: theme.spacing(4),
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
          paddingLeft: theme.spacing(4),
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
      paddingLeft: theme.spacing(4),
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
          paddingLeft: theme.spacing(4),
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
    if (!loading && data && data.esuData) {
      if (!settingsContext.isScottish) {
        setDirection(data.esuData.esuDirection);
        setTolerance(data.esuData.esuTolerance);
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
  }, [loading, data, settingsContext.isScottish]);

  useEffect(() => {
    setUserCanEdit(userContext.currentUser && userContext.currentUser.canEdit);
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
            setStartDateError(error.errors);
            break;

          case "esuenddate":
            setEndDateError(error.errors);
            break;

          case "State":
            setStateError(error.errors);
            break;

          case "StateDate":
            setStateDateError(error.errors);
            break;

          case "EsuClassification":
            setClassificationError(error.errors);
            break;

          case "EsuClassificationDate":
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
      <Box sx={streetToolbarStyle}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Grid container justifyContent="flex-start" alignItems="center">
              <Grid item>
                <ADSActionButton
                  variant="home"
                  tooltipTitle="Home"
                  tooltipPlacement="bottom"
                  onClick={handleHomeClick}
                />
              </Grid>
              <Grid item>
                <Typography
                  sx={{
                    flexGrow: 1,
                    display: "none",
                    [theme.breakpoints.up("sm")]: {
                      display: "block",
                    },
                  }}
                  variant="subtitle1"
                  noWrap
                  align="left"
                >
                  {`| ${data.esuData.esuId < 0 ? `New ESU [${data.esuData.esuId * -1 - 9}]` : `${data.esuData.esuId}`}`}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Grid container justifyContent="flex-end" alignItems="center">
              <Grid item>
                <ADSActionButton
                  variant="copy"
                  tooltipTitle="Copy ESU Id to clipboard"
                  tooltipPlacement="right"
                  onClick={handleCopyEsuId}
                />
              </Grid>
              <Grid item>
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
                  <MenuItem dense disabled={!userCanEdit} onClick={handleDivideEsu} sx={menuItemStyle(false)}>
                    <Typography variant="inherit">Divide</Typography>
                  </MenuItem>
                  <MenuItem
                    dense
                    divider
                    disabled={!userCanEdit}
                    onClick={handleUnassignFromStreet}
                    sx={menuItemStyle(false)}
                  >
                    <Typography variant="inherit">Unassign from street</Typography>
                  </MenuItem>
                  <MenuItem
                    dense
                    divider={!settingsContext.isScottish}
                    onClick={handleCopyEsuId}
                    sx={menuItemStyle(false)}
                  >
                    <Typography variant="inherit">Copy ID</Typography>
                  </MenuItem>
                  {!settingsContext.isScottish && (
                    <MenuItem dense onClick={handleDeleteEsu} sx={menuItemStyle(false)}>
                      <Typography variant="inherit" color="error">
                        Delete
                      </Typography>
                    </MenuItem>
                  )}
                </Menu>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
      <Box sx={dataFormStyle("77.7vh")}>
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
          <ADSNumberControl
            label="Tolerance (meters)"
            isEditable={userCanEdit}
            isRequired
            isFocused={focusedField ? focusedField === "EsuTolerance" : false}
            loading={loading}
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
            label="State start date"
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
            doNotSetTitleCase
            loading={loading}
            isFocused={focusedField ? focusedField === "EsuClassification" : false}
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
            isFocused={focusedField ? focusedField === "EsuClassificationDate" : false}
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
          isFocused={focusedField ? focusedField === "EsuStartDate" : false}
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
            isFocused={focusedField ? focusedField === "EsuEndDate" : false}
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
              paddingTop: theme.spacing(0),
              marginTop: theme.spacing(2),
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
                      paddingBottom: theme.spacing(1),
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
                  <Directions sx={{ color: adsBlueA, marginTop: theme.spacing(0.5) }} />
                </Fragment>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography
                      variant="subtitle1"
                      sx={{
                        paddingLeft: theme.spacing(1),
                      }}
                    >
                      Highway dedication
                    </Typography>
                    <Avatar
                      variant="rounded"
                      sx={GetTabIconStyle(
                        data.esuData && data.esuData.highwayDedications ? data.esuData.highwayDedications.length : 0
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
                            paddingLeft: theme.spacing(1),
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
                            src={d.avatarIcon}
                            sx={{
                              width: theme.spacing(2),
                              height: theme.spacing(2),
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
                          <PRoWIcon fontSize="small" sx={getHighwayDedicationStyle(d.hdProw)} />
                        </ListItemAvatar>
                        <ListItemAvatar sx={{ minWidth: 30 }}>
                          <DirectionsBike fontSize="small" sx={getHighwayDedicationStyle(d.hdNcr)} />
                        </ListItemAvatar>
                        <ListItemAvatar sx={{ minWidth: 30 }}>
                          <QuietRouteIcon fontSize="small" sx={getHighwayDedicationStyle(d.hdQuietRoute)} />
                        </ListItemAvatar>
                        <ListItemAvatar sx={{ minWidth: 30 }}>
                          <ObstructionIcon fontSize="small" sx={getHighwayDedicationStyle(d.hdObstruction)} />
                        </ListItemAvatar>
                        <ListItemAvatar sx={{ minWidth: 30 }}>
                          <PlanningOrderIcon fontSize="small" sx={getHighwayDedicationStyle(d.hdPlanningOrder)} />
                        </ListItemAvatar>
                        <ListItemAvatar sx={{ minWidth: 30 }}>
                          <VehiclesProhibitedIcon
                            fontSize="small"
                            sx={getHighwayDedicationStyle(d.hdWorksProhibited)}
                          />
                        </ListItemAvatar>
                      </ListItemButton>
                    </List>
                  ))}
            </Collapse>
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
                      paddingBottom: theme.spacing(1),
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
                      marginTop: theme.spacing(0.5),
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
                        paddingLeft: theme.spacing(1),
                      }}
                    >
                      One-way exemption
                    </Typography>
                    <Avatar
                      variant="rounded"
                      sx={GetTabIconStyle(
                        data.esuData && data.esuData.oneWayExemptions ? data.esuData.oneWayExemptions.length : 0
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
                            paddingLeft: theme.spacing(1),
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
                            <Typography variant="caption">{d.oneWayExemptionTypeCode}</Typography>
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body1">{GetOneWayExemption(d.oneWayExemptionTypeCode)}</Typography>
                          }
                        />
                      </ListItemButton>
                    </List>
                  ))}
            </Collapse>
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
    </Fragment>
  );
}

export default EsuDataTab;
