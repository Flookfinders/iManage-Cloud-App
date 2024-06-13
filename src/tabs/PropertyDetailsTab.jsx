//#region header */
/**************************************************************************************************
//
//  Description: Property Details Tab
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
//    002   17.03.23 Sean Flook         WI40585 Hide Add property and range menu items.
//    003   22.03.23 Sean Flook         WI40596 Only allow editing if BLPU logical status is not historic or rejected.
//    004   28.03.23 Sean Flook         WI40596 Removed above change.
//    005   06.04.23 Sean Flook         WI40656 Fixed typo and changed siteVisit to siteSurvey for consistency.
//    006   27.06.23 Sean Flook         WI40234 Added local custodian [Authority].
//    007   27.06.23 Sean Flook         WI40234 Make authority read only.
//    008   28.06.23 Sean Flook         WI40256 Changed Extent to Provenance where appropriate.
//    009   30.06.23 Sean Flook         WI40770 Set suffix letters to uppercase.
//    010   20.07.23 Sean Flook                 Added ability to display the property in Google street view.
//    011   22.09.23 Sean Flook                 Changes required to handle Scottish classifications.
//    012   06.10.23 Sean Flook                 Use colour variables.
//    013   27.10.23 Sean Flook                 Use new dataFormStyle.
//    014   03.11.23 Sean Flook                 Added tooltip to the actions button.
//    015   24.11.23 Sean Flook                 Moved Box to @mui/system and changes required for Scottish authorities.
//    016   30.11.23 Sean Flook                 Make state and state date visible for Scottish authorities.
//    017   05.01.24 Sean Flook                 Changes to sort out warnings and use CSS shortcuts.
//    018   10.01.24 Sean Flook                 Fix warnings.
//    019   11.01.24 Sean Flook                 Fix warnings.
//    020   25.01.24 Joel Benford               Stop overriding descriptor background.
//    021   27.02.24 Sean Flook           MUL16 Changes required to handle parent child relationships.
//    022   04.03.24 Sean Flook           MUL16 Temporarily changed field name whilst waiting for API to be fixed.
//    023   04.03.24 Sean Flook           MUL16 Field name has been fixed.
//    024   11.03.24 Sean Flook           GLB12 Adjusted height to remove gap.
//    025   15.03.24 Sean Flook       PRFRM2_GP Added display for number of children.
//    026   12.03.24 Joshua McCormick  IMANN-280 Toolbar styling, fixed margin
//    027   18.03.24 Sean Flook           GLB12 Adjusted height to remove overflow.
//    028   12.03.24 Joshua McCormick IMANN-280 Adjusted toolbar spacing
//    029   22.03.24 Sean Flook           GLB12 Changed to use dataFormStyle so height can be correctly set.
//    030   22.03.24 Sean Flook       PRFRM5_GP Display information control for moving a BLPU.
//    031   04.04.24 Sean Flook                 Various changes for action menu items.
//    032   09.04.24 Joshua McCormick IMANN-277 Added displayCharactersLeft for inputs that it should be shown for
//    033   17.04.24 Joshua McCormick IMANN-207 endDate set to null if logical status is less than 7
//    034   08.05.24 Joel Benford     IMANN-398 BLPU State is now mandatory
//    035   23.05.24 Sean Flook       IMANN-485 When state changes set the state date to current date.
//    036   05.06.24 Sean Flook       IMANN-485 Make above change for Scottish authorities as well.
//    037   12.06.24 Sean Flook       IMANN-553 correctly set the required flag for state and state date.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

/* #region imports */

import React, { useContext, useState, useRef, useEffect, Fragment } from "react";
import PropTypes from "prop-types";

import PropertyContext from "../context/propertyContext";
import LookupContext from "../context/lookupContext";
import UserContext from "../context/userContext";
import MapContext from "../context/mapContext";
import SettingsContext from "../context/settingsContext";
import SearchContext from "../context/searchContext";
import InformationContext from "../context/informationContext";

import {
  copyTextToClipboard,
  GetLookupLabel,
  ConvertDate,
  openInStreetView,
  GetCurrentDate,
} from "../utils/HelperUtils";
import {
  FilteredBLPULogicalStatus,
  FilteredRepresentativePointCode,
  FilteredBLPUState,
  addressToTitleCase,
} from "../utils/PropertyUtils";

import {
  Grid,
  Menu,
  MenuItem,
  Typography,
  IconButton,
  Skeleton,
  Chip,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  Tooltip,
  Popper,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSDateControl from "../components/ADSDateControl";
import ADSTextControl from "../components/ADSTextControl";
import ADSNumberControl from "../components/ADSNumberControl";
import ADSSwitchControl from "../components/ADSSwitchControl";
import ADSCoordinateControl from "../components/ADSCoordinateControl";
import ADSActionButton from "../components/ADSActionButton";
import ADSReadOnlyControl from "../components/ADSReadOnlyControl";
import ADSInformationControl from "../components/ADSInformationControl";

import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";
import MakeChildDialog from "../dialogs/MakeChildDialog";

import BLPUClassification from "../data/BLPUClassification";
import OSGClassification from "../data/OSGClassification";
import LPILogicalStatus from "./../data/LPILogicalStatus";
import DETRCodes from "../data/DETRCodes";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddCircleIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { CopyIcon } from "../utils/ADSIcons";
import {
  adsBlueA,
  adsMidGreyA,
  adsRed10,
  adsRed20,
  adsWhite,
  adsOffWhite,
  adsLightBlue10,
  adsMidBlueA,
} from "../utils/ADSColours";
import {
  toolbarStyle,
  ActionIconStyle,
  dataFormStyle,
  FormRowStyle,
  menuStyle,
  menuItemStyle,
  controlLabelStyle,
  tooltipStyle,
} from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";
import MessageDialog from "../dialogs/MessageDialog";

PropertyDetailsTab.propTypes = {
  data: PropTypes.object,
  errors: PropTypes.array,
  lpiErrors: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  focusedField: PropTypes.string,
  onSetCopyOpen: PropTypes.func.isRequired,
  onViewRelated: PropTypes.func.isRequired,
  onLpiSelected: PropTypes.func.isRequired,
  onLpiDeleted: PropTypes.func.isRequired,
  onDataChanged: PropTypes.func.isRequired,
  onLogicalStatusChanged: PropTypes.func.isRequired,
  onOrganisationChanged: PropTypes.func.isRequired,
  onChildAdd: PropTypes.func.isRequired,
  onDeleteProperty: PropTypes.func.isRequired,
};

function PropertyDetailsTab({
  data,
  errors,
  lpiErrors,
  loading,
  focusedField,
  onSetCopyOpen,
  onViewRelated,
  onLpiSelected,
  onLpiDeleted,
  onDataChanged,
  onLogicalStatusChanged,
  onOrganisationChanged,
  onChildAdd,
  onDeleteProperty,
}) {
  const theme = useTheme();

  const propertyContext = useContext(PropertyContext);
  const lookupContext = useContext(LookupContext);
  const userContext = useContext(UserContext);
  const mapContext = useContext(MapContext);
  const settingsContext = useContext(SettingsContext);
  const searchContext = useContext(SearchContext);
  const informationContext = useContext(InformationContext);

  const [itemSelected, setItemSelected] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const deleteLpiId = useRef(null);

  const [blpuLogicalStatusLookup, setBLPULogicalStatusLookup] = useState(
    FilteredBLPULogicalStatus(settingsContext.isScottish)
  );
  const [representativePointCodeLookup, setRepresentativePointCodeLookup] = useState(
    FilteredRepresentativePointCode(settingsContext.isScottish)
  );
  const [blpuStateLookup, setBLPUStateLookup] = useState(
    FilteredBLPUState(settingsContext.isScottish, data ? data.logicalStatus : null)
  );

  const [blpuLogicalStatus, setBLPULogicalStatus] = useState(null);
  const [rpc, setRpc] = useState(null);
  const [state, setState] = useState(null);
  const [stateDate, setStateDate] = useState(null);
  const [classification, setClassification] = useState(null);
  const [organisation, setOrganisation] = useState(null);
  const [level, setLevel] = useState(0);
  const [ward, setWard] = useState(null);
  const [parish, setParish] = useState(null);
  const [localCustodian, setLocalCustodian] = useState(null);
  const [easting, setEasting] = useState(0);
  const [northing, setNorthing] = useState(0);
  const [excludeFromExport, setExcludeFromExport] = useState(false);
  const [siteSurvey, setSiteSurvey] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [parentUprn, setParentUprn] = useState(null);
  const [parentAddress, setParentAddress] = useState(null);
  const [parentPostcode, setParentPostcode] = useState(null);
  const [hasParent, setHasParent] = useState(false);
  const [childCount, setChildCount] = useState(0);

  const [userCanEdit, setUserCanEdit] = useState(false);

  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);

  const [openMessage, setOpenMessage] = useState(false);
  const updatedLogicalStatus = useRef(0);

  const [propertyAssociatedRecords, setPropertyAssociatedRecords] = useState(null);
  const [lpiAssociatedRecords, setLpiAssociatedRecords] = useState(null);
  const [deleteVariant, setDeleteVariant] = useState(null);

  const [openMakeChild, setOpenMakeChild] = useState(false);
  const [makeChildUprn, setMakeChildUprn] = useState([]);

  const [blpuLogicalStatusError, setBLPULogicalStatusError] = useState(null);
  const [rpcError, setRpcError] = useState(null);
  const [stateError, setStateError] = useState(null);
  const [stateDateError, setStateDateError] = useState(null);
  const [classificationError, setClassificationError] = useState(null);
  const [organisationError, setOrganisationError] = useState(null);
  const [levelError, setLevelError] = useState(null);
  const [wardError, setWardError] = useState(null);
  const [parishError, setParishError] = useState(null);
  const [localCustodianError, setLocalCustodianError] = useState(null);
  const [eastingError, setEastingError] = useState(null);
  const [northingError, setNorthingError] = useState(null);
  const [excludeFromExportError, setExcludeFromExportError] = useState(null);
  const [siteSurveyError, setSiteSurveyError] = useState(null);
  const [startDateError, setStartDateError] = useState(null);
  const [endDateError, setEndDateError] = useState(null);

  const [informationAnchorEl, setInformationAnchorEl] = useState(null);
  const informationOpen = Boolean(informationAnchorEl);
  const informationId = informationOpen ? "asd-information-popper" : undefined;

  /**
   * Event to handle the displaying the BLPU context menu.
   *
   * @param {object} event The event object.
   */
  const handleBLPUMenuClick = (event) => {
    setAnchorEl(event.nativeEvent.target);
  };

  /**
   * Event to handle the hiding on the BLPU context menu.
   *
   * @param {object} event The event object.
   */
  const handleBLPUMenuClose = (event) => {
    setAnchorEl(null);
    event.stopPropagation();
  };

  /**
   * Method used to update the current BLPU data object.
   *
   * @param {string} fieldName The name of the field that is being updated.
   * @param {string|boolean|Date|number|null} newValue The value used to update the given field.
   */
  const updateCurrentData = (fieldName, newValue) => {
    const currentData = !settingsContext.isScottish
      ? {
          blpuClass: fieldName && fieldName === "classification" ? newValue : classification,
          organisation: fieldName && fieldName === "organisation" ? newValue : organisation,
          wardCode: fieldName && fieldName === "ward" ? newValue : ward,
          parishCode: fieldName && fieldName === "parish" ? newValue : parish,
          localCustodianCode: fieldName && fieldName === "localCustodian" ? newValue : localCustodian,
          logicalStatus: fieldName && fieldName === "logicalStatus" ? newValue : blpuLogicalStatus,
          blpuState: fieldName && fieldName === "state" ? newValue : state,
          blpuStateDate:
            fieldName && fieldName === "state"
              ? GetCurrentDate()
              : fieldName && fieldName === "stateDate"
              ? newValue && ConvertDate(newValue)
              : stateDate && ConvertDate(stateDate),
          xcoordinate: fieldName && fieldName === "easting" ? newValue : easting,
          ycoordinate: fieldName && fieldName === "northing" ? newValue : northing,
          rpc: fieldName && fieldName === "rpc" ? newValue : rpc,
          startDate:
            fieldName && fieldName === "startDate"
              ? newValue && ConvertDate(newValue)
              : startDate && ConvertDate(startDate),
          endDate:
            fieldName && fieldName === "endDate"
              ? newValue && ConvertDate(newValue)
              : fieldName && fieldName === "logicalStatus" && newValue < 7
              ? null
              : endDate && ConvertDate(endDate),
          neverExport: fieldName && fieldName === "neverExport" ? newValue : excludeFromExport,
          siteSurvey: fieldName && fieldName === "siteSurvey" ? newValue : siteSurvey,
          parentUprn: fieldName && fieldName === "parentUprn" ? (newValue ? newValue.uprn : null) : parentUprn,
          parentAddress: fieldName && fieldName === "parentUprn" ? (newValue ? newValue.address : null) : parentAddress,
          parentPostcode:
            fieldName && fieldName === "parentUprn" ? (newValue ? newValue.postcode : null) : parentPostcode,
        }
      : {
          level: fieldName && fieldName === "level" ? newValue : level,
          custodianCode: fieldName && fieldName === "localCustodian" ? newValue : localCustodian,
          logicalStatus: fieldName && fieldName === "logicalStatus" ? newValue : blpuLogicalStatus,
          blpuState: fieldName && fieldName === "state" ? newValue : state,
          blpuStateDate:
            fieldName && fieldName === "state"
              ? GetCurrentDate()
              : fieldName && fieldName === "stateDate"
              ? newValue && ConvertDate(newValue)
              : stateDate && ConvertDate(stateDate),
          xcoordinate: fieldName && fieldName === "easting" ? newValue : easting,
          ycoordinate: fieldName && fieldName === "northing" ? newValue : northing,
          rpc: fieldName && fieldName === "rpc" ? newValue : rpc,
          startDate:
            fieldName && fieldName === "startDate"
              ? newValue && ConvertDate(newValue)
              : startDate && ConvertDate(startDate),
          endDate:
            fieldName && fieldName === "endDate"
              ? newValue && ConvertDate(newValue)
              : fieldName && fieldName === "logicalStatus" && newValue < 7
              ? null
              : endDate && ConvertDate(endDate),
          neverExport: fieldName && fieldName === "neverExport" ? newValue : excludeFromExport,
          siteSurvey: fieldName && fieldName === "siteSurvey" ? newValue : siteSurvey,
          parentUprn: fieldName && fieldName === "parentUprn" ? (newValue ? newValue.uprn : null) : parentUprn,
          parentAddress: fieldName && fieldName === "parentUprn" ? (newValue ? newValue.address : null) : parentAddress,
          parentPostcode:
            fieldName && fieldName === "parentUprn" ? (newValue ? newValue.postcode : null) : parentPostcode,
        };

    if (fieldName === "organisation") {
      if (onOrganisationChanged) onOrganisationChanged(organisation, newValue, currentData);
    } else {
      if (onDataChanged) onDataChanged(currentData);
    }

    if (["logicalStatus", "classification", "easting", "northing"].includes(fieldName))
      mapContext.onMapPropertyChange(currentData);
  };

  /**
   * Event to handle when the view related button is clicked.
   */
  const handleViewRelatedClick = () => {
    if (onViewRelated) onViewRelated();
  };

  /**
   * Event to handle when the BLPU logical status is changed.
   *
   * @param {number|null} newValue The new BLPU logical status value.
   */
  const handleBLPULogicalStatusChangeEvent = (newValue) => {
    setBLPULogicalStatus(newValue);
    setBLPUStateLookup(FilteredBLPUState(settingsContext.isScottish, newValue));
    updateCurrentData("logicalStatus", newValue);
  };

  /**
   * Event to handle when the RPC is changed.
   *
   * @param {number|null} newValue The new RPC value.
   */
  const handleRPCChangeEvent = (newValue) => {
    setRpc(newValue);
    updateCurrentData("rpc", newValue);
  };

  /**
   * Event to handle when the state is changed.
   *
   * @param {number|null} newValue The new state value.
   */
  const handleStateChangeEvent = (newValue) => {
    setState(newValue);
    updateCurrentData("state", newValue);
  };

  /**
   * Event to handle when the state date is changed.
   *
   * @param {Date|null} newValue The new state date.
   */
  const handleStateDateChangeEvent = (newValue) => {
    setStateDate(newValue);
    updateCurrentData("stateDate", newValue);
  };

  /**
   * Event to handle when the classification is changed.
   *
   * @param {string|null} newValue The new classification code.
   */
  const handleClassificationChangeEvent = (newValue) => {
    setClassification(newValue);
    updateCurrentData("classification", newValue);
  };

  /**
   * Event to handle when the organisation is changed.
   *
   * @param {string|null} newValue The new organisation.
   */
  const handleOrganisationChangeEvent = (newValue) => {
    updateCurrentData("organisation", newValue);
    setOrganisation(newValue);
  };

  /**
   * Event to handle when the level is changed.
   *
   * @param {number|string|null} newValue The new level.
   */
  const handleLevelChangeEvent = (newValue) => {
    setLevel(newValue);
    updateCurrentData("level", newValue);
  };

  /**
   * Event to handle when the ward is changed.
   *
   * @param {string|null} newValue The new ward code.
   */
  const handleWardChangeEvent = (newValue) => {
    setWard(newValue);
    updateCurrentData("ward", newValue);
  };

  /**
   * Event to handle when the parish is changed.
   *
   * @param {string|null} newValue The new parish code.
   */
  const handleParishChangeEvent = (newValue) => {
    setParish(newValue);
    updateCurrentData("parish", newValue);
  };

  /**
   * Event to handle when the local custodian is changed.
   *
   * @param {number|null} newValue The new local custodian value.
   */
  const handleLocalCustodianChangeEvent = (newValue) => {
    setLocalCustodian(newValue);
    updateCurrentData("localCustodian", newValue);
  };

  /**
   * Event to handle when the easting is changed.
   *
   * @param {number|null} newValue The new easting value.
   */
  const handleEastingChangeEvent = (newValue) => {
    setEasting(newValue);
    updateCurrentData("easting", newValue);
  };

  /**
   * Event to handle when the northing is changed.
   *
   * @param {number|null} newValue The new northing value.
   */
  const handleNorthingChangeEvent = (newValue) => {
    setNorthing(newValue);
    updateCurrentData("northing", newValue);
  };

  /**
   * Event to handle when the move button is clicked.
   */
  const handleMoveClickEvent = () => {
    mapContext.onPointCapture("property");
  };

  /**
   * Event to handle when the exclude from export flag is changed.
   *
   * @param {boolean} newValue The new exclude from export value.
   */
  const handleExcludeFromExportChangeEvent = () => {
    updateCurrentData("neverExport", !excludeFromExport);
    setExcludeFromExport(!excludeFromExport);
  };

  /**
   * Event to handle when the site survey flag is changed.
   *
   * @param {boolean} newValue The new site survey value.
   */
  const handleSiteSurveyChangeEvent = () => {
    updateCurrentData("siteSurvey", !siteSurvey);
    setSiteSurvey(!siteSurvey);
  };

  /**
   * Event to handle when the start date is changed.
   *
   * @param {Date|null} newValue The new start date value.
   */
  const handleStartDateChangeEvent = (newValue) => {
    setStartDate(newValue);
    updateCurrentData("startDate", newValue);
  };

  /**
   * Event to handle when the end date is changed.
   *
   * @param {Date|null} newValue The new end date value.
   */
  const handleEndDateChangeEvent = (newValue) => {
    setEndDate(newValue);
    updateCurrentData("endDate", newValue);
  };

  /**
   * Event to handle when the user selects to add a new LPI.
   *
   * @param {object} event The event object
   */
  const handleAddLpi = (event) => {
    onLpiSelected(0, null, null, null);
    handleBLPUMenuClose(event);
  };

  /**
   * Event to handle when the user selects to add a new child property.
   *
   * @param {object} event The event object
   */
  const handleAddChild = (event) => {
    handleBLPUMenuClose(event);
    if (onChildAdd) onChildAdd(false);
  };

  /**
   * Event to handle when the user selects to add new child properties.
   *
   * @param {object} event The event object
   */
  const handleAddChildren = (event) => {
    handleBLPUMenuClose(event);
    if (onChildAdd) onChildAdd(true);
  };

  /**
   * Event to handle when the user selects to zoom the map to the property.
   */
  const handleZoomToProperty = () => {
    setAnchorEl(null);

    if (propertyContext.currentProperty.uprn) {
      const found = mapContext.currentSearchData.properties.find(
        (rec) => rec.uprn === propertyContext.currentProperty.uprn
      );

      if (found) {
        mapContext.onMapChange(mapContext.currentLayers.extents, null, propertyContext.currentProperty.uprn);
      }
    }
  };

  /**
   * Event to handle when the user selects to view the property in street view.
   */
  const handleOpenInStreetView = () => {
    setAnchorEl(null);
    if (easting && northing) openInStreetView([easting, northing]);
  };

  /**
   * Event to handle when the user selects to search for properties and streets near by.
   */
  const handleSearchNearby = () => {
    setAnchorEl(null);
  };

  /**
   * Event to handle when the user selects to copy the UPRN to the clipboard.
   *
   * @param {object} event The event object
   */
  const handleCopyUprn = (event) => {
    if (propertyContext.currentProperty.uprn) {
      itemCopy(propertyContext.currentProperty.uprn.toString(), "UPRN");
    }
    setAnchorEl(null);
    event.stopPropagation();
  };

  /**
   * Event to handle when the user selects to copy the property address.
   *
   * @param {object} event The event object.
   * @param {object} rec The current property object.
   */
  const handleCopyAddress = (event, rec) => {
    if (rec) itemCopy(rec.address, "Address");
    setAnchorEl(null);
    event.stopPropagation();
  };

  /**
   * Event to handle when the user selects to add the property to the bookmark list.
   */
  const handleBookmark = () => {
    setAnchorEl(null);
  };

  /**
   * Event to handle when the user selects to add the property to a list.
   */
  const handleAddToList = () => {
    setAnchorEl(null);
  };

  /**
   * Event to handle when the user selects to export the property.
   *
   * @param {object} event The event object.
   */
  const handleExportTo = (event) => {
    setAnchorEl(null);
  };

  /**
   * Event to handle when the user selects to move the property.
   */
  const handleMoveBlpu = () => {
    setAnchorEl(null);
  };

  /**
   * Event to handle when the user selects to move the property to a different street.
   */
  const handleMoveStreet = () => {
    setAnchorEl(null);
  };

  /**
   * Event to handle when the user selects to make the property a child of another property.
   */
  const handleMakeChildOf = () => {
    setAnchorEl(null);

    setMakeChildUprn([data.uprn]);
    setOpenMakeChild(true);
    searchContext.onHideSearch(true);
  };

  /**
   * Event to handle when the user selects to remove the property from its parent relationship.
   */
  const handleRemoveFromParent = () => {
    setAnchorEl(null);
    setHasParent(false);
    setParentUprn(null);
    setParentAddress(null);
    setParentPostcode(null);
    updateCurrentData("parentUprn", null);
  };

  /**
   * Event to handle when the user selects to make the property rejected.
   */
  const handleReject = () => {
    setAnchorEl(null);
    if (childCount > 0) {
      updatedLogicalStatus.current = 9;
      setOpenMessage(true);
    } else {
      if (onLogicalStatusChanged) onLogicalStatusChanged(9);
    }
  };

  /**
   * Event to handle when the user selects to make the property historic.
   */
  const handleHistoricise = () => {
    setAnchorEl(null);
    if (childCount > 0) {
      updatedLogicalStatus.current = 8;
      setOpenMessage(true);
    } else {
      if (onLogicalStatusChanged) onLogicalStatusChanged(8);
    }
  };

  /**
   * Event to handle when the user selects to delete the property.
   */
  const handleDelete = () => {
    setDeleteVariant("property");
    setOpenDeleteConfirmation(true);
    setAnchorEl(null);
  };

  /**
   * Event to handle when the delete confirmation dialog is closed.
   *
   * @param {boolean} deleteConfirmed True if the user has confirmed the delete; otherwise false.
   * @param {boolean} deleteChildren True if the user has confirmed to delete the child properties when deleting a parent property; otherwise false.
   */
  const handleCloseDeleteConfirmation = (deleteConfirmed, deleteChildren) => {
    setOpenDeleteConfirmation(false);
    if (deleteConfirmed) {
      switch (deleteVariant) {
        case "lpi":
          if (deleteLpiId.current && onLpiDeleted) onLpiDeleted(deleteLpiId.current);
          deleteLpiId.current = null;
          break;

        case "property":
          if (onDeleteProperty) onDeleteProperty(deleteChildren);
          break;

        default:
          // property
          break;
      }
    }
    setDeleteVariant(null);
  };

  /**
   * Event to handle when the make child of dialog closes.
   */
  const handleMakeChildClose = (parent) => {
    setOpenMakeChild(false);
    searchContext.onHideSearch(false);
    setMakeChildUprn([]);
    if (parent) {
      setParentUprn(parent.uprn);
      setParentAddress(parent.address);
      setParentPostcode(parent.postcode);
      setHasParent(true);
      updateCurrentData("parentUprn", parent);
    }
  };

  /**
   * Event to handle when the message dialog closes.
   *
   * @param {string} action The action returned from the message dialog.
   */
  const handleCloseMessage = (action) => {
    if (action === "continue" && updatedLogicalStatus.current !== 0 && onLogicalStatusChanged)
      onLogicalStatusChanged(updatedLogicalStatus.current);
    updatedLogicalStatus.current = 0;
    setOpenMessage(false);
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
   * Event to handle the opening of a LPI record.
   *
   * @param {number} pkId The id if the LPI record the user wants to open.
   * @param {number} dataIndx The index of the LPI record that the user wants to open in the array of LPIs.
   */
  const handleOpenLpi = (pkId, dataIndx) => {
    informationContext.onClearInformation();

    const lpiDataArray = data.lpis.filter((x) => x.pkId === pkId);

    if (lpiDataArray && lpiDataArray.length > 0 && onLpiSelected)
      onLpiSelected(pkId, lpiDataArray[0], dataIndx, data.lpis.length);
  };

  /**
   * Event to handle when the mouse enters an item.
   */
  const handleMouseEnter = (recId) => {
    setItemSelected(recId);
  };

  /**
   * Even to handle when the mouse leaves an item.
   */
  const handleMouseLeave = () => {
    setItemSelected(null);
  };

  /**
   * Event to handle the deleting of a LPI record.
   *
   * @param {object} event The event object.
   * @param {object} rec The LPI record that the user wants to delete.
   */
  const handleDeleteLpi = (event, rec) => {
    event.stopPropagation();
    deleteLpiId.current = rec.pkId;
    setDeleteVariant("lpi");
    if (settingsContext.isWelsh) {
      setLpiAssociatedRecords([
        {
          type: "linked lpi",
          count: 1,
        },
        {
          type: "cross reference",
          count: 1,
        },
      ]);
    } else setLpiAssociatedRecords(null);
    setOpenDeleteConfirmation(true);
  };

  /**
   * Event to get the style to be used for the language chip.
   *
   * @param {number} recId The id of the record.
   * @param {number} status The logical status of the LPI record.
   * @returns {object}
   */
  function LanguageChipStyle(recId, status) {
    if (itemSelected && itemSelected.toString() === recId.toString())
      return {
        ml: theme.spacing(0.5),
        mr: theme.spacing(1),
        backgroundColor: adsBlueA,
        color: adsWhite,
      };
    else if (!status) {
      return {
        ml: theme.spacing(0.5),
        mr: theme.spacing(1),
        backgroundColor: adsMidBlueA,
        color: adsWhite,
        "&:hover": {
          backgroundColor: adsBlueA,
        },
      };
    } else {
      const logicalStatusRec = LPILogicalStatus.filter((x) => x.id === status);
      const chipColour = logicalStatusRec ? logicalStatusRec[0].colour : "";
      return {
        ml: theme.spacing(0.5),
        mr: theme.spacing(1),
        backgroundColor: chipColour,
        color: adsWhite,
        "&:hover": {
          backgroundColor: adsBlueA,
        },
      };
    }
  }

  /**
   * Method to get the address for the given LPI record in title case.
   *
   * @param {object|null} rec The LPI record that we need to get the address data from.
   * @returns {string}
   */
  function AddressToTitleCase(rec) {
    if (!rec) return "";

    const postcodeRec = lookupContext.currentLookups.postcodes.filter((x) => x.postcodeRef === rec.postcodeRef);
    const postcode = postcodeRec && postcodeRec.length > 0 ? postcodeRec[0].postcode : "";

    return addressToTitleCase(rec.address, postcode);
  }

  /**
   * Method to get the logical status text for a given logical status value.
   *
   * @param {number|null} status The logical status value we want the text for.
   * @returns {string}
   */
  function getLpiLogicalStatus(status) {
    const logicalStatusRec = status ? LPILogicalStatus.filter((x) => x.id === status) : null;

    if (logicalStatusRec) return logicalStatusRec[0][GetLookupLabel(settingsContext.isScottish)];
    else return "";
  }

  /**
   * Method to get the style to be used to display the given LPI record.
   *
   * @param {number} index The index of the LPI record we are getting the style for.
   * @returns {object}
   */
  const getLpiStyle = (index) => {
    const defaultLpiStyle = {
      backgroundColor: adsOffWhite,
      "&:hover": {
        backgroundColor: adsLightBlue10,
        color: adsBlueA,
      },
    };

    if (lpiErrors && lpiErrors.length > 0) {
      const lpiRecordErrors = lpiErrors.filter((x) => x.index === index);
      if (lpiRecordErrors && lpiRecordErrors.length > 0) {
        return {
          backgroundColor: adsRed10,
          "&:hover": {
            backgroundColor: adsRed20,
            color: adsBlueA,
          },
        };
      } else return defaultLpiStyle;
    } else return defaultLpiStyle;
  };

  useEffect(() => {
    if (data) {
      setBLPULogicalStatus(data.logicalStatus);
      setRpc(data.rpc);
      setState(data.blpuState);
      setStateDate(data.blpuStateDate);
      if (!settingsContext.isScottish) {
        setClassification(data.blpuClass);
        setOrganisation(data.organisation ? data.organisation : "");
        setWard(data.wardCode);
        setParish(data.parishCode);
        setLocalCustodian(data.localCustodianCode);
      } else {
        setLocalCustodian(data.custodianCode);
        setLevel(data.level ? data.level : 0);
      }
      setEasting(data.xcoordinate ? data.xcoordinate : 0);
      setNorthing(data.ycoordinate ? data.ycoordinate : 0);
      setExcludeFromExport(data.neverExport ? data.neverExport : false);
      setSiteSurvey(data.siteSurvey ? data.siteSurvey : false);
      setStartDate(data.startDate);
      setEndDate(data.endDate);
      setParentUprn(data.parentUprn);
      setParentAddress(data.parentAddress);
      setParentPostcode(data.parentPostcode);

      setHasParent(!!data.parentUprn);
      setChildCount(data.childCount ? data.childCount : 0);

      setBLPULogicalStatusLookup(FilteredBLPULogicalStatus(settingsContext.isScottish));
      setRepresentativePointCodeLookup(FilteredRepresentativePointCode(settingsContext.isScottish));
      setBLPUStateLookup(FilteredBLPUState(settingsContext.isScottish, data.logicalStatus));

      let associatedRecords = [];
      if (data.lpis && data.lpis.length > 0) associatedRecords.push({ type: "LPI", count: data.lpis.length });
      if (data.blpuAppCrossRefs && data.blpuAppCrossRefs.length > 0)
        associatedRecords.push({
          type: "cross reference",
          count: data.blpuAppCrossRefs.length,
        });
      if (data.blpuProvenances && data.blpuProvenances.length > 0)
        associatedRecords.push({
          type: "BLPU provenance",
          count: data.blpuProvenances.length,
        });
      if (settingsContext.isScottish) {
        if (data.organisations && data.organisations.length > 0)
          associatedRecords.push({ type: "Organisation", count: data.organisations.length });
        if (data.classifications && data.classifications.length > 0)
          associatedRecords.push({ type: "Classification", count: data.classifications.length });
        if (data.successorCrossRefs && data.successorCrossRefs.length > 0)
          associatedRecords.push({ type: "Successor cross reference", count: data.successorCrossRefs.length });
      }
      if (data.blpuNotes && data.blpuNotes.length > 0)
        associatedRecords.push({ type: "note", count: data.blpuNotes.length });

      if (associatedRecords.length > 0) setPropertyAssociatedRecords(associatedRecords);
      else setPropertyAssociatedRecords(null);
    }
  }, [data, settingsContext]);

  useEffect(() => {
    setUserCanEdit(userContext.currentUser && userContext.currentUser.canEdit);
  }, [userContext]);

  useEffect(() => {
    if (data && data.uprn > 0 && !informationContext.informationType) {
      informationContext.onDisplayInformation("moveSeedPoint", "PropertyDetailsTab");
    }
  }, [data, informationContext]);

  useEffect(() => {
    if (informationContext.informationSource && informationContext.informationSource === "PropertyDetailsTab") {
      setInformationAnchorEl(document.getElementById("ads-property-details-tab"));
    } else setInformationAnchorEl(null);
  }, [informationContext.informationSource]);

  useEffect(() => {
    setBLPULogicalStatusError(null);
    setRpcError(null);
    setStateError(null);
    setStateDateError(null);
    setClassificationError(null);
    setOrganisationError(null);
    setLevelError(null);
    setWardError(null);
    setParishError(null);
    setLocalCustodianError(null);
    setEastingError(null);
    setNorthingError(null);
    setExcludeFromExportError(null);
    setSiteSurveyError(null);
    setStartDateError(null);
    setEndDateError(null);

    if (errors && errors.length > 0) {
      for (const error of errors) {
        switch (error.field.toLowerCase()) {
          case "logicalstatus":
            setBLPULogicalStatusError(error.errors);
            break;

          case "rpc":
            setRpcError(error.errors);
            break;

          case "blpustate":
            setStateError(error.errors);
            break;

          case "blpustatedate":
            setStateDateError(error.errors);
            break;

          case "blpuclass":
            setClassificationError(error.errors);
            break;

          case "organisation":
            setOrganisationError(error.errors);
            break;

          case "level":
            setLevelError(error.errors);
            break;

          case "wardcode":
            setWardError(error.errors);
            break;

          case "parishcode":
            setParishError(error.errors);
            break;

          case "localCustodian":
          case "custodianCode":
            setLocalCustodianError(error.errors);
            break;

          case "xcoordinate":
          case "easting":
            setEastingError(error.errors);
            break;

          case "ycoordinate":
          case "northing":
            setNorthingError(error.errors);
            break;

          case "neverexport":
            setExcludeFromExportError(error.errors);
            break;

          case "sitesurvey":
            setSiteSurveyError(error.errors);
            break;

          case "startdate":
            setStartDateError(error.errors);
            break;

          case "enddate":
            setEndDateError(error.errors);
            break;

          default:
            break;
        }
      }
    }
  }, [errors]);

  useEffect(() => {
    if (
      propertyContext.newLogicalStatus &&
      blpuLogicalStatus &&
      blpuLogicalStatus !== propertyContext.newLogicalStatus
    ) {
      setBLPULogicalStatus(propertyContext.newLogicalStatus);
      setEndDate(data.endDate);

      setBLPULogicalStatusLookup(FilteredBLPULogicalStatus(settingsContext.isScottish));
    }
  }, [propertyContext.newLogicalStatus, blpuLogicalStatus, data, settingsContext]);

  return (
    <Fragment>
      <Box sx={toolbarStyle} id="ads-property-details-tab">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ pl: theme.spacing(2), mt: theme.spacing(0.25) }}
        >
          <Typography variant="subtitle1">{propertyContext.currentProperty.uprn}</Typography>
          <Tooltip title="Actions" arrow placement="right" sx={tooltipStyle}>
            <IconButton onClick={handleBLPUMenuClick} aria-controls="blpu-menu" aria-haspopup="true" size="small">
              <MoreVertIcon sx={ActionIconStyle()} />
            </IconButton>
          </Tooltip>
          <Menu
            id="blpu-menu"
            elevation={2}
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleBLPUMenuClose}
            sx={menuStyle}
          >
            <MenuItem dense disabled={!userCanEdit} onClick={handleAddLpi} sx={menuItemStyle(false)}>
              <Typography variant="inherit">Add new LPI</Typography>
            </MenuItem>
            <MenuItem dense disabled={!userCanEdit} onClick={handleAddChild} sx={menuItemStyle(false)}>
              <Typography variant="inherit">Add child</Typography>
            </MenuItem>
            <MenuItem dense disabled={!userCanEdit} divider onClick={handleAddChildren} sx={menuItemStyle(true)}>
              <Typography variant="inherit">Add children</Typography>
            </MenuItem>
            <MenuItem dense onClick={handleZoomToProperty} sx={menuItemStyle(false)}>
              <Typography variant="inherit">Zoom to this</Typography>
            </MenuItem>
            <MenuItem dense onClick={handleOpenInStreetView} sx={menuItemStyle(false)}>
              <Typography variant="inherit">Open in Street View</Typography>
            </MenuItem>
            {process.env.NODE_ENV === "development" && (
              <MenuItem dense disabled onClick={handleSearchNearby} divider sx={menuItemStyle(true)}>
                <Typography variant="inherit">Search nearby</Typography>
              </MenuItem>
            )}
            <MenuItem dense onClick={handleCopyUprn} divider sx={menuItemStyle(true)}>
              <Typography variant="inherit">Copy UPRN</Typography>
            </MenuItem>
            {process.env.NODE_ENV === "development" && (
              <MenuItem dense disabled onClick={handleBookmark} sx={menuItemStyle(false)}>
                <Typography variant="inherit">Bookmark</Typography>
              </MenuItem>
            )}
            {process.env.NODE_ENV === "development" && (
              <MenuItem dense disabled onClick={handleAddToList} sx={menuItemStyle(false)}>
                <Typography variant="inherit">Add to List</Typography>
              </MenuItem>
            )}
            {process.env.NODE_ENV === "development" && (
              <MenuItem dense disabled onClick={handleExportTo} divider sx={menuItemStyle(true)}>
                <Typography variant="inherit">Export to...</Typography>
              </MenuItem>
            )}
            {process.env.NODE_ENV === "development" && (
              <MenuItem dense disabled onClick={handleMoveBlpu} sx={menuItemStyle(false)}>
                <Typography variant="inherit">Move BLPU</Typography>
              </MenuItem>
            )}
            {process.env.NODE_ENV === "development" && (
              <MenuItem dense disabled onClick={handleMoveStreet} sx={menuItemStyle(false)}>
                <Typography variant="inherit">Move street</Typography>
              </MenuItem>
            )}
            <MenuItem dense onClick={handleMakeChildOf} sx={menuItemStyle(false)}>
              <Typography variant="inherit">Make child of...</Typography>
            </MenuItem>
            <MenuItem dense disabled={!userCanEdit} onClick={handleRemoveFromParent} divider sx={menuItemStyle(true)}>
              <Typography variant="inherit">Remove from parent</Typography>
            </MenuItem>
            <MenuItem dense disabled={!userCanEdit} onClick={handleReject} sx={menuItemStyle(false)}>
              <Typography variant="inherit">Reject</Typography>
            </MenuItem>
            <MenuItem dense disabled={!userCanEdit} onClick={handleHistoricise} sx={menuItemStyle(false)}>
              <Typography variant="inherit">Historicise</Typography>
            </MenuItem>
            {process.env.NODE_ENV === "development" && (
              <MenuItem dense disabled={!userCanEdit} onClick={handleDelete} sx={menuItemStyle(false)}>
                <Typography variant="inherit" color="error">
                  Delete
                </Typography>
              </MenuItem>
            )}
          </Menu>
        </Stack>
      </Box>
      <Box sx={dataFormStyle("PropertyDetailsTab")}>
        <Grid container justifyContent="flex-start" alignItems="baseline" sx={FormRowStyle()}>
          <Grid item xs={3}>
            <Typography variant="body2" color="textPrimary" align="left" sx={controlLabelStyle}>
              LPI*
            </Typography>
          </Grid>
          <Grid item xs={9}>
            {loading ? (
              <Skeleton variant="rectangular" height="50px" width="100%" />
            ) : data && data.lpis && data.lpis.length > 0 ? (
              data.lpis
                .filter((x) => x.changeType !== "D")
                .sort((a, b) =>
                  settingsContext.isWelsh
                    ? b.language > a.language
                      ? 1
                      : a.language > b.language
                      ? -1
                      : 0
                    : a.language > b.language
                    ? 1
                    : b.language > a.language
                    ? -1
                    : 0
                )
                .sort((a, b) => a.logicalStatus - b.logicalStatus)
                .map((rec, index) => (
                  <List
                    sx={{
                      width: "100%",
                      pt: theme.spacing(0),
                      pb: theme.spacing(0),
                    }}
                    component="nav"
                    key={`key_${index}`}
                  >
                    <ListItemButton
                      dense
                      disableGutters
                      sx={getLpiStyle(index)}
                      onClick={() => handleOpenLpi(rec.pkId, index)}
                      onMouseEnter={() => handleMouseEnter(rec.pkId)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <ListItemIcon>
                        <Chip size="small" label={rec.language} sx={LanguageChipStyle(rec.pkId, rec.logicalStatus)} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body1" sx={{ fontSize: "15px", color: adsMidGreyA }}>
                            {AddressToTitleCase(rec)}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2">
                            <strong>{getLpiLogicalStatus(rec.logicalStatus)}</strong>
                          </Typography>
                        }
                      />
                      <ListItemAvatar
                        sx={{
                          minWidth: 32,
                        }}
                      >
                        {itemSelected && itemSelected.toString() === rec.pkId.toString() && (
                          <Fragment>
                            <Tooltip title="Copy address to clipboard" arrow placement="bottom" sx={tooltipStyle}>
                              <IconButton onClick={(event) => handleCopyAddress(event, rec)} size="small">
                                <CopyIcon sx={ActionIconStyle()} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Add new LPI" arrow placement="bottom" sx={tooltipStyle}>
                              <IconButton onClick={handleAddLpi} size="small" disabled={!userCanEdit}>
                                <AddCircleIcon sx={ActionIconStyle()} />
                              </IconButton>
                            </Tooltip>
                            <ADSActionButton
                              variant="delete"
                              disabled={!userCanEdit}
                              inheritBackground
                              tooltipTitle="Delete LPI"
                              tooltipPlacement="right"
                              onClick={(event) => handleDeleteLpi(event, rec)}
                            />
                          </Fragment>
                        )}
                      </ListItemAvatar>
                    </ListItemButton>
                  </List>
                ))
            ) : (
              <List
                sx={{
                  width: "100%",
                  pt: theme.spacing(0),
                }}
                component="nav"
                key="key_no_records"
              >
                <ListItemButton
                  dense
                  disableGutters
                  disabled={!userCanEdit}
                  onClick={handleAddLpi}
                  sx={{
                    height: "30px",
                    "&:hover": {
                      backgroundColor: adsLightBlue10,
                      color: adsBlueA,
                    },
                  }}
                >
                  <ListItemText primary={<Typography variant="subtitle1">No LPI records present</Typography>} />
                  <ListItemAvatar
                    sx={{
                      minWidth: 32,
                    }}
                  >
                    <Tooltip title="Add new LPI" arrow placement="bottom" sx={tooltipStyle}>
                      <IconButton onClick={handleAddLpi} size="small" disabled={!userCanEdit}>
                        <AddCircleIcon sx={ActionIconStyle()} />
                      </IconButton>
                    </Tooltip>
                  </ListItemAvatar>
                </ListItemButton>
              </List>
            )}
          </Grid>
        </Grid>
        {hasParent && (
          <ADSReadOnlyControl
            loading={loading}
            label="Child of"
            value={addressToTitleCase(parentAddress, parentPostcode)}
            buttonVariant={childCount > 0 ? "none" : "viewRelated"}
            onButtonClick={handleViewRelatedClick}
          />
        )}
        {childCount > 0 && (
          <ADSReadOnlyControl
            loading={loading}
            label="Parent of"
            value={`${childCount} ${childCount === 1 ? "child" : "children"}`}
            buttonVariant="viewRelated"
            onButtonClick={handleViewRelatedClick}
          />
        )}
        <ADSSelectControl
          label="BLPU logical status"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "LogicalStatus" : false}
          loading={loading}
          useRounded
          doNotSetTitleCase
          lookupData={blpuLogicalStatusLookup}
          lookupId="id"
          lookupLabel={GetLookupLabel(settingsContext.isScottish)}
          lookupColour="colour"
          value={blpuLogicalStatus}
          errorText={blpuLogicalStatusError}
          onChange={handleBLPULogicalStatusChangeEvent}
          helperText="Logical Status of the BLPU."
        />
        <ADSSelectControl
          label="RPC"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "Rpc" : false}
          loading={loading}
          useRounded
          doNotSetTitleCase
          lookupData={representativePointCodeLookup}
          lookupId="id"
          lookupLabel={GetLookupLabel(settingsContext.isScottish)}
          lookupColour="colour"
          value={rpc}
          errorText={rpcError}
          onChange={handleRPCChangeEvent}
          helperText="Representative Point Code."
        />
        <ADSSelectControl
          label="State"
          isEditable={userCanEdit}
          isRequired={
            (!settingsContext.isScottish && blpuLogicalStatus && [5, 6].includes(blpuLogicalStatus)) ||
            (settingsContext.isScottish && blpuLogicalStatus && blpuLogicalStatus < 9)
          }
          isFocused={focusedField ? focusedField === "BlpuState" : false}
          loading={loading}
          useRounded
          doNotSetTitleCase
          lookupData={blpuStateLookup}
          lookupId="id"
          lookupLabel={GetLookupLabel(settingsContext.isScottish)}
          lookupColour="colour"
          value={state}
          errorText={stateError}
          onChange={handleStateChangeEvent}
          helperText="A code identifying the current state of a BLPU."
        />
        <ADSDateControl
          label="State date"
          isEditable={userCanEdit}
          isRequired={
            (!settingsContext.isScottish && blpuLogicalStatus && [5, 6].includes(blpuLogicalStatus)) ||
            (settingsContext.isScottish && blpuLogicalStatus && blpuLogicalStatus < 9)
          }
          isFocused={focusedField ? focusedField === "BlpuStateDate" : false}
          loading={loading}
          value={stateDate}
          errorText={stateDateError}
          onChange={handleStateDateChangeEvent}
          helperText="Date at which the BLPU achieved its current state in the real-world."
        />
        {!settingsContext.isScottish && (
          <ADSSelectControl
            label="Classification"
            isEditable={userCanEdit}
            isRequired
            isFocused={focusedField ? focusedField === "BlpuClass" : false}
            isClassification
            includeHiddenCode
            loading={loading}
            useRounded
            doNotSetTitleCase
            lookupData={settingsContext.isScottish ? OSGClassification : BLPUClassification}
            lookupId="id"
            lookupLabel="display"
            lookupColour="colour"
            value={classification}
            errorText={classificationError}
            onChange={handleClassificationChangeEvent}
            helperText="Classification code for the BLPU."
          />
        )}
        {!settingsContext.isScottish && (
          <ADSTextControl
            label="Organisation"
            isEditable={userCanEdit}
            isFocused={focusedField ? focusedField === "Organisation" : false}
            loading={loading}
            maxLength={100}
            displayCharactersLeft
            value={organisation}
            id="property_organisation"
            errorText={organisationError}
            characterSet="GeoPlaceProperty1"
            helperText="Name of current occupier on the fascia of the BLPU."
            onChange={handleOrganisationChangeEvent}
          />
        )}
        {settingsContext.isScottish && (
          <ADSNumberControl
            label="Level"
            isEditable={userCanEdit}
            isFocused={focusedField ? focusedField === "Level" : false}
            loading={loading}
            value={level}
            errorText={levelError}
            helperText="Code describing vertical position of BLPU."
            onChange={handleLevelChangeEvent}
          />
        )}
        {!settingsContext.isScottish && (
          <ADSSelectControl
            label="Ward"
            isEditable={userCanEdit}
            isFocused={focusedField ? focusedField === "WardCode" : false}
            loading={loading}
            useRounded
            doNotSetTitleCase
            lookupData={lookupContext.currentLookups.wards}
            lookupId="wardCode"
            lookupLabel="ward"
            value={ward}
            errorText={wardError}
            onChange={handleWardChangeEvent}
            helperText="The ONS code of the electoral ward (ENG) or electoral division (CYM) name in which the BLPU is situated."
          />
        )}
        {!settingsContext.isScottish && (
          <ADSSelectControl
            label="Parish"
            isEditable={userCanEdit}
            isFocused={focusedField ? focusedField === "ParishCode" : false}
            loading={loading}
            useRounded
            doNotSetTitleCase
            lookupData={lookupContext.currentLookups.parishes}
            lookupId="parishCode"
            lookupLabel="parish"
            value={parish}
            errorText={parishError}
            onChange={handleParishChangeEvent}
            helperText="The ONS code of the Parish, Town or Community Council in which the BLPU is situated."
          />
        )}
        <ADSSelectControl
          label="Authority"
          isRequired
          isFocused={focusedField ? focusedField === "LocalCustodian" : false}
          loading={loading}
          useRounded
          lookupData={DETRCodes}
          lookupId="id"
          lookupLabel="text"
          value={localCustodian}
          errorText={localCustodianError}
          onChange={handleLocalCustodianChangeEvent}
          helperText="Unique identifier of the Authority Address Custodian."
        />
        <ADSCoordinateControl
          label="Representative point coordinate"
          isEditable={userCanEdit}
          isRequired
          isEastFocused={focusedField ? focusedField === "XCoordinate" || focusedField === "Easting" : false}
          isNorthFocused={focusedField ? focusedField === "YCoordinate" || focusedField === "Northing" : false}
          loading={loading}
          eastErrorText={eastingError}
          northErrorText={northingError}
          helperText="The representative point coordinate for the property."
          eastValue={easting}
          northValue={northing}
          eastLabel="Easting:"
          northLabel="Northing:"
          onEastChange={handleEastingChangeEvent}
          onNorthChange={handleNorthingChangeEvent}
          onButtonClick={handleMoveClickEvent}
        />
        <ADSSwitchControl
          label="Exclude from export"
          isEditable={userCanEdit}
          isFocused={focusedField ? focusedField === "NeverExport" : false}
          loading={loading}
          checked={excludeFromExport}
          trueLabel="Yes"
          falseLabel="No"
          errorText={excludeFromExportError}
          helperText="Set this if you do not want this property to be included in any exports."
          onChange={handleExcludeFromExportChangeEvent}
        />
        <ADSSwitchControl
          label="Site visit required"
          isEditable={userCanEdit}
          isFocused={focusedField ? focusedField === "SiteSurvey" : false}
          loading={loading}
          checked={siteSurvey}
          trueLabel="Yes"
          falseLabel="No"
          errorText={siteSurveyError}
          helperText="Set this if the property requires a site visit."
          onChange={handleSiteSurveyChangeEvent}
        />
        <ADSDateControl
          label="Start date"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "StartDate" : false}
          loading={loading}
          value={startDate}
          helperText="Date on which this BLPU was defined."
          errorText={startDateError}
          onChange={handleStartDateChangeEvent}
        />
        {blpuLogicalStatus && blpuLogicalStatus > 6 && (
          <ADSDateControl
            label="End date"
            isEditable={userCanEdit}
            isFocused={focusedField ? focusedField === "EndDate" : false}
            loading={loading}
            value={endDate}
            helperText="Date on which this BLPU ceased to exist or became a rejected Candidate."
            errorText={endDateError}
            onChange={handleEndDateChangeEvent}
          />
        )}
        <Box sx={{ height: "24px" }} />
      </Box>
      <div>
        <ConfirmDeleteDialog
          variant={deleteVariant}
          open={openDeleteConfirmation}
          associatedRecords={deleteVariant === "lpi" ? lpiAssociatedRecords : propertyAssociatedRecords}
          childCount={childCount}
          onClose={handleCloseDeleteConfirmation}
        />
        <MakeChildDialog
          isOpen={openMakeChild}
          variant="property"
          selectedUPRNs={makeChildUprn}
          onClose={handleMakeChildClose}
        />
        <MessageDialog isOpen={openMessage} variant="cascadeLogicalStatus" onClose={handleCloseMessage} />
      </div>
      <Popper id={informationId} open={informationOpen} anchorEl={informationAnchorEl} placement="top-start">
        <ADSInformationControl variant={"moveSeedPoint"} />
      </Popper>
    </Fragment>
  );
}

export default PropertyDetailsTab;
