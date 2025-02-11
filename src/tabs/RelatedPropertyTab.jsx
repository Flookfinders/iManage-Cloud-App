//#region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Related Property tab
//
//  Copyright:    © 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//#region Version 1.0.0.0
//    001   30.07.21 Sean Flook                  Initial Revision.
//    002   17.03.23 Sean Flook          WI40585 Hide Add property and range menu items.
//    003   18.04.23 Sean Flook          WI40685 Modified call to ADSSelectionControl.
//    004   30.06.23 Sean Flook                  Ensure the current property is initially in view.
//    005   24.07.23 Sean Flook                  Removed Edit property menu item.
//    006   20.07.23 Sean Flook                  Added ability to display the property in Google street view.
//    007   06.10.23 Sean Flook                  Use colour variables.
//    007   10.10.23 Sean Flook        IMANN-163 Changes required for opening the tab after the property wizard.
//    008   27.10.23 Sean Flook        IMANN-175 Changes required for multi-edit of properties.
//    009   03.11.23 Sean Flook                  Updated TreeView and TreeItem.
//    010   20.11.23 Sean Flook                  Tweak the classification code for street BLPUs.
//    011   20.11.23 Sean Flook                  Undone above change.
//    012   24.11.23 Sean Flook                  Moved Box and Stack to @mui/system and fixed some warnings.
//    013   29.11.23 Sean Flook        IMANN-163 Added id's to the TreeItem to remove warning and corrected expanded data type.
//    014   05.01.24 Sean Flook                  Changes to sort out warnings.
//    015   10.01.24 Sean Flook                  Fix warnings.
//    016   11.01.24 Sean Flook                  Fix warnings.
//    017   12.01.24 Sean Flook                  Fixed duplicate key warning.
//    018   25.01.24 Sean Flook                  Changes required after UX review.
//    019   06.02.24 Joel Benford                Change flavour of light blue
//    020   07.02.24 Joel Benford                Spacing and colours
//    021   08.02.24 Joel Benford          RTAB3 Supply null street state to classification icon tooltip
//    022   14.02.24 Joel Benford          RTAB5 Interim check-in for comments
//    023   16.02.24 Sean Flook         ESU16_GP If changing page etc ensure the information and selection controls are cleared.
//    024   20.02.24 Sean Flook         ESU16_GP Undone above change as not required.
//    025   22.02.24 Joel Benford      IMANN-287 Checked items blue
//    026   01.03.24 Sean Flook            MUL16 Handle make child of.
//    027   11.03.24 Sean Flook            GLB12 Adjusted height to remove gap.
//    028   12.03.24 Sean Flook             MUL8 Display an alert if properties are successfully moved.
//    029   13.03.24 Sean Flook             MUL9 Added new parameters to handle the checking of records.
//    030   18.03.24 Sean Flook            GLB12 Adjusted height to remove overflow.
//    031   19.03.24 Sean Flook        PRFRM2_GP Ensure onRelatedOpened is always called.
//    032   22.03.24 Sean Flook            GLB12 Changed to use dataFormStyle so height can be correctly set.
//    033   25.03.24 Sean Flook            MUL16 Removed option to remove from parent.
//    034   04.04.24 Sean Flook                  Use the new getWizardParentDetails method.
//    035   16.04.24 Sean Flook                  Added ability to select historic properties.
//    036   22.04.24 Sean Flook        IMANN-374 Correctly call DataFormStyle.
//    037   25.04.24 Sean Flook        IMANN-166 After putting the current property in focus do not keep doing it.
//    038   26.04.24 Sean Flook        IMANN-166 Reset flag if the data changes.
//    039   13.05.24 Sean Flook        IMANN-439 Changed to use grids to display the data as well as other display improvements.
//    040   17.05.24 Sean Flook        IMANN-458 Correctly highlight the avatar when items are hovered.
//    041   20.05.24 Sean Flook        IMANN-450 Correctly get the USRN when creating a child/children.
//    042   19.06.24 Sean Flook        IMANN-629 Changes to code so that current user is remembered and a 401 error displays the login dialog.
//    043   20.06.24 Sean Flook        IMANN-636 Use the new user rights.
//    044   26.06.24 Sean Flook        IMANN-488 Correctly filter the data in getPropertyFromId.
//    045   26.06.24 Joshua McCormick  IMANN-548 ZoomToProperty fix, properties correctly add to list
//    046   07.08.24 Sean Flook        IMANN-891 Use stopPropagation rather than persist.
//    047   07.08.24 Sean Flook        IMANN-973 Use a string for the makeChildUprn.
//    048   10.09.24 Sean Flook        IMANN-980 Only write to the console if the user has the showMessages right.
//#endregion Version 1.0.0.0
//#region Version 1.0.1.0
//    049   27.09.24 Sean Flook        IMANN-573 when creating a new child or range of children check the parent is not already at the maximum allowable level.
//    050   14.10.24 Sean Flook       IMANN-1016 Changes required to handle LLPG Streets.
//#endregion Version 1.0.1.0
//#region Version 1.0.3.0
//    051   07.01.25 Sean Flook       IMANN-1124 Ensure the current property is in view when opening the related tab from code.
//    052   09.01.25 Sean Flook       IMANN-1124 Check the object exists before trying to bring it in to view.
//#endregion Version 1.0.3.0
//#region Version 1.0.5.0
//    053   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//#endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//#endregion header

import React, { useContext, useState, useRef, useEffect, Fragment } from "react";
import PropTypes from "prop-types";

import PropertyContext from "../context/propertyContext";
import MapContext from "../context/mapContext";
import UserContext from "../context/userContext";
import StreetContext from "../context/streetContext";
import SettingsContext from "../context/settingsContext";
import SearchContext from "../context/searchContext";
import LookupContext from "../context/lookupContext";

import {
  Typography,
  Skeleton,
  Menu,
  MenuItem,
  Tooltip,
  IconButton,
  Chip,
  Checkbox,
  Popper,
  Avatar,
  Snackbar,
  Alert,
  Grid2,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";
import ADSSelectionControl from "../components/ADSSelectionControl";
import MakeChildDialog from "../dialogs/MakeChildDialog";

import { GetAvatarColour, GetAvatarTooltip, copyTextToClipboard, openInStreetView } from "./../utils/HelperUtils";
import {
  addressToTitleCase,
  getClassificationCode,
  GetPropertyMapData,
  getWizardParentDetails,
} from "./../utils/PropertyUtils";

import LPILogicalStatus from "./../data/LPILogicalStatus";

import GetClassificationIcon from "../utils/ADSClassificationIcons";
import { CopyIcon } from "../utils/ADSIcons";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MyLocationIcon from "@mui/icons-material/MyLocation";

import {
  adsBlueA,
  adsWhite,
  adsLightGreyB,
  adsPaleBlueA,
  adsLightGreyD,
  adsBlack0,
  adsMidGreyA,
} from "../utils/ADSColours";
import {
  dataFormStyle,
  ActionIconStyle,
  menuStyle,
  menuItemStyle,
  tooltipStyle,
  RelatedLanguageChipStyle,
  toolbarStyle,
  GetAlertStyle,
  GetAlertIcon,
  GetAlertSeverity,
} from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

RelatedPropertyTab.propTypes = {
  data: PropTypes.object.isRequired,
  variant: PropTypes.oneOf(["street", "property"]).isRequired,
  loading: PropTypes.bool.isRequired,
  expanded: PropTypes.array.isRequired,
  checked: PropTypes.array.isRequired,
  onNodeSelect: PropTypes.func.isRequired,
  onNodeToggle: PropTypes.func.isRequired,
  onChecked: PropTypes.func.isRequired,
  onSetCopyOpen: PropTypes.func.isRequired,
  onPropertyAdd: PropTypes.func.isRequired,
};

function RelatedPropertyTab({
  data,
  variant,
  loading,
  expanded,
  checked,
  onNodeSelect,
  onNodeToggle,
  onChecked,
  onSetCopyOpen,
  onPropertyAdd,
}) {
  const theme = useTheme();

  const propertyContext = useContext(PropertyContext);
  const mapContext = useContext(MapContext);
  const userContext = useContext(UserContext);
  const streetContext = useContext(StreetContext);
  const settingsContext = useContext(SettingsContext);
  const searchContext = useContext(SearchContext);
  const lookupContext = useContext(LookupContext);

  const [userCanEdit, setUserCanEdit] = useState(false);
  const initialPropertyFocused = useRef(false);

  const [propertySelected, setPropertySelected] = useState(null);
  const [propertyChecked, setPropertyChecked] = useState([]);
  const [anchorPropertyActionsEl, setAnchorPropertyActionsEl] = useState(null);
  const canAddChild = useRef(true);
  const [anchorSelectEl, setAnchorSelectEl] = useState(null);

  const [selectionAnchorEl, setSelectionAnchorEl] = useState(null);
  const selectionOpen = Boolean(selectionAnchorEl);
  const selectionId = selectionOpen ? "list-selection-popper" : undefined;
  const checkedAddress = useRef(null);

  const [allChecked, setAllChecked] = useState(false);
  const [partialChecked, setPartialChecked] = useState(false);

  const [openMakeChild, setOpenMakeChild] = useState(false);
  const [makeChildUprn, setMakeChildUprn] = useState([]);

  const [alertOpen, setAlertOpen] = useState(false);
  const alertType = useRef("");

  /**
   * Event to handle when a node is selected.
   *
   * @param {object} event The event object.
   * @param {number} nodeId The id of the selected node.
   */
  function handleNodeSelected(event, nodeId) {
    event.stopPropagation();
    const iconClicked = event.target.closest(".MuiTreeItem-iconContainer");
    const checkboxClicked = event.target.closest(".MuiCheckbox-root");
    if (!iconClicked && !checkboxClicked && onNodeSelect) onNodeSelect("property", nodeId);
  }

  /**
   * Event to handle the toggling of the nodes.
   *
   * @param {object} event The event object.
   * @param {array} nodeIds The list of node ids that are expanded.
   */
  function handleNodeToggle(event, nodeIds) {
    event.stopPropagation();
    const iconClicked = event.target.closest(".MuiTreeItem-iconContainer");
    const checkboxClicked = event.target.closest(".MuiCheckbox-root");
    if (iconClicked && !checkboxClicked && onNodeToggle) onNodeToggle(nodeIds);
  }

  /**
   * Event to handle when the mouse enters a property node.
   *
   * @param {number} recId The id of the property the mouse has entered.
   */
  const handleMouseEnterProperty = (recId) => {
    if (recId !== "") setPropertySelected(recId);
  };

  /**
   * Event to handle when the mouse leaves a property node.
   */
  const handleMouseLeaveProperty = () => {
    setPropertySelected(null);
  };

  /**
   * Event to handle the toggling of the checkboxes.
   *
   * @param {object} event The event object.
   * @param {number} uprn The UPRN of the property.
   * @param {string} address The address for the property.
   */
  const handleCheckboxChange = (event, uprn, address) => {
    event.stopPropagation();
    const tempArray = [...propertyChecked];
    let settingCheck = false;
    if (!tempArray.includes(uprn)) {
      tempArray.push(uprn);
      settingCheck = true;
    } else tempArray.splice(tempArray.indexOf(uprn), 1);
    if (!event.nativeEvent.ctrlKey) {
      // Cascade down the tree
      const children = data.properties.filter((x) => x.parentUprn && x.parentUprn.toString() === uprn);
      if (children && children.length > 0) {
        for (const child of children) {
          if (settingCheck && !tempArray.includes(child.uprn.toString())) tempArray.push(child.uprn.toString());
          else if (!settingCheck) tempArray.splice(tempArray.indexOf(child.uprn.toString()), 1);
          const grandChildren = data.properties.filter(
            (x) => x.parentUprn && x.parentUprn.toString() === child.uprn.toString()
          );
          if (grandChildren && grandChildren.length > 0) {
            for (const grandChild of grandChildren) {
              if (settingCheck && !tempArray.includes(grandChild.uprn.toString()))
                tempArray.push(grandChild.uprn.toString());
              else if (!settingCheck) tempArray.splice(tempArray.indexOf(grandChild.uprn.toString()), 1);
              const greatGrandChildren = data.properties.filter(
                (x) => x.parentUprn && x.parentUprn.toString() === grandChild.uprn.toString()
              );
              if (greatGrandChildren && greatGrandChildren.length > 0) {
                for (const greatGrandChild of greatGrandChildren) {
                  if (settingCheck && !tempArray.includes(greatGrandChild.uprn.toString()))
                    tempArray.push(greatGrandChild.uprn.toString());
                  else if (!settingCheck) tempArray.splice(tempArray.indexOf(greatGrandChild.uprn.toString()), 1);
                }
              }
            }
          }
        }
      }
    }
    if (onChecked) onChecked(tempArray);
    else {
      setPropertyChecked(tempArray);
      setAllChecked(data.properties.length === tempArray.length);
      setPartialChecked(tempArray.length > 0 && data.properties.length > tempArray.length);
      setSelectionAnchorEl(tempArray.length > 0 ? document.getElementById("ads-related-toolbar") : null);
    }
    checkedAddress.current = address;
  };

  /**
   * Event to handle when the select checkbox is clicked.
   */
  const handleSelectCheckboxClick = () => {
    if (allChecked) {
      if (onChecked) onChecked([]);
      else {
        setPropertyChecked([]);
        setSelectionAnchorEl(null);
        setAllChecked(false);
        setPartialChecked(false);
        mapContext.onHighlightClear();
      }
    } else {
      const newChecked = data.properties.map((x) => x.uprn.toString());
      const propertyHighlighted = data.properties.map((x) => x.uprn);
      if (onChecked) onChecked(newChecked);
      else {
        setPropertyChecked(newChecked);
        setSelectionAnchorEl(document.getElementById("ads-related-toolbar"));
        setAllChecked(true);
        setPartialChecked(false);
      }
      mapContext.onHighlightStreetProperty(null, propertyHighlighted);
    }
  };

  /**
   * Event to handle when the select menu is clicked.
   *
   * @param {object} event The event object.
   */
  const handleSelectMenuClick = (event) => {
    setAnchorSelectEl(event.nativeEvent.target);
  };

  /**
   * Event to handle the closing of the select menu.
   */
  const handleSelectMenuClose = () => {
    setAnchorSelectEl(null);
  };

  /**
   * Event to handle selecting all the properties.
   */
  const handleSelectAll = () => {
    const newChecked = data.properties.map((x) => x.uprn.toString());
    const propertyHighlighted = data.properties.map((x) => x.uprn);
    if (onChecked) onChecked(newChecked);
    else {
      setPropertyChecked(newChecked);
      setAllChecked(true);
      setPartialChecked(false);
      setSelectionAnchorEl(document.getElementById("ads-related-toolbar"));
    }
    setAnchorSelectEl(null);
    mapContext.onHighlightStreetProperty(null, propertyHighlighted);
  };

  /**
   * Method to handle selecting all the properties by logical status.
   */
  const handleSelectLogicalStatus = (logicalStatus) => {
    const newChecked = data.properties
      .filter((x) => x.additional[0].logicalStatus === logicalStatus)
      .map((x) => x.uprn.toString());
    const propertyHighlighted = data.properties
      .filter((x) => x.additional[0].logicalStatus === logicalStatus)
      .map((x) => x.uprn);
    if (onChecked) onChecked(newChecked);
    else {
      setPropertyChecked(newChecked);
      setAllChecked(data.properties.length === newChecked.length);
      setPartialChecked(newChecked.length > 0 && data.properties.length > newChecked.length);
      setSelectionAnchorEl(newChecked.length > 0 ? document.getElementById("ads-related-toolbar") : null);
    }
    setAnchorSelectEl(null);
    mapContext.onHighlightStreetProperty(null, propertyHighlighted);
  };

  /**
   * Event to handle selecting all the provisional properties.
   */
  const handleSelectProvisional = () => {
    handleSelectLogicalStatus(6);
  };

  /**
   * Event to handle selecting all the approved properties.
   */
  const handleSelectApproved = () => {
    handleSelectLogicalStatus(1);
  };

  /**
   * Event to handle selecting all the historic properties.
   */
  const handleSelectHistoric = () => {
    handleSelectLogicalStatus(8);
  };

  /**
   * Event to handle when the selection dialog closes.
   */
  const handleCloseSelection = () => {
    if (onChecked) onChecked([]);
    else {
      setPropertyChecked([]);
      setAllChecked(false);
      setPartialChecked(false);
      setSelectionAnchorEl(null);
    }
  };

  /**
   * Event to handle displaying the copy alert.
   *
   * @param {string} dataType The type of data that has been copied.
   */
  const handleSetCopyOpen = (dataType) => {
    if (onSetCopyOpen) onSetCopyOpen(true, dataType);
  };

  /**
   * Event to handle display the alert after moving seed points.
   */
  const handlePropertyMoved = () => {
    alertType.current = "propertyMoved";
    setAlertOpen(true);
  };

  /**
   * Event to handle selection errors.
   *
   * @param {string} typeOfError The type of error.
   */
  const handleSelectionError = (typeOfError) => {
    if (typeOfError) {
      alertType.current = typeOfError;
      setAlertOpen(true);
    }
  };

  /**
   * Method used to copy the text to the clipboard.
   *
   *
   * @param {object} event The event object.
   * @param {string|null} text The text that needs to be copied to the clipboard.
   * @param {string} dataType The type of data that is being copied to the clipboard.
   */
  const itemCopy = (event, text, dataType) => {
    event.stopPropagation();
    if (text) {
      copyTextToClipboard(text);
      if (onSetCopyOpen) onSetCopyOpen(true, dataType);
    }
  };

  /**
   * Method to make the record a child.
   *
   * @param {object} event The event object.
   * @param {object} rec The related record.
   */
  const handleMakeChildOf = (event, record) => {
    event.stopPropagation();

    if (record) {
      setMakeChildUprn([record.uprn.toString()]);
      setOpenMakeChild(true);
      searchContext.onHideSearch(true);
    }
  };

  /**
   * Event to handle when the make child of dialog closes.
   */
  const handleMakeChildClose = () => {
    setOpenMakeChild(false);
    searchContext.onHideSearch(false);
    setMakeChildUprn([]);
  };

  /**
   * Event to handle zooming the map to a property.
   *
   * @param {object} event The event object.
   * @param {number} uprn The UPRN of the property to zoom to.
   */
  async function zoomToProperty(event, uprn) {
    event.stopPropagation();
    const found = mapContext.currentSearchData.properties.find((rec) => rec.uprn.toString() === uprn.toString());

    if (!found) {
      const propertyData = await GetPropertyMapData(Number(uprn), userContext);
      const newMapSearchLpis = propertyData.lpis
        .filter((x) => x.language === "ENG")
        .map((x) => {
          return {
            uprn: x.uprn.toString(),
            parentUprn: null,
            address: x.address,
            formattedAddress: x.address,
            postcode: x.postcode,
            easting: propertyData.xcoordinate,
            northing: propertyData.ycoordinate,
            logicalStatus: x.logicalStatus,
            classificationCode: getClassificationCode(propertyData),
          };
        });

      const newMapSearchProperties = mapContext.currentSearchData.properties;
      newMapSearchProperties.push(...newMapSearchLpis);
      mapContext.onSearchDataChange([], [], newMapSearchProperties, null, propertyData.uprn);
    }
    mapContext.onMapChange(mapContext.currentLayers.extents, null, uprn);
  }

  /**
   * Event to handle creating a child property.
   *
   * @param {object} event The event object.
   * @param {number} uprn The UPRN of the parent property.
   */
  async function HandleAddChild(event, uprn) {
    handlePropertyActionsMenuClose(event);

    const propertyData = await GetPropertyMapData(uprn, userContext);

    if (propertyData) {
      const parent = getWizardParentDetails(propertyData, lookupContext.currentLookups.postcodes);

      if (onPropertyAdd && parent) onPropertyAdd(parent.usrn, parent, false);
    }
  }

  /**
   * Event to handle creating a range of child properties.
   *
   * @param {object} event The event object.
   * @param {number} uprn The UPRN of the parent property.
   */
  const handleAddChildren = async (event, uprn) => {
    handlePropertyActionsMenuClose(event);

    const propertyData = await GetPropertyMapData(uprn, userContext);

    if (propertyData) {
      const parent = getWizardParentDetails(propertyData, lookupContext.currentLookups.postcodes);

      if (onPropertyAdd && parent) onPropertyAdd(parent.usrn, parent, true);
    }
  };

  /**
   * Display the street/property in Google Street View.
   *
   * @param {object} event The event object
   * @param {object} rec The record that needs to be displayed in Google Street View.
   */
  async function handleStreetViewClick(event, rec) {
    if (rec) {
      handlePropertyActionsMenuClose(event);
      if (rec.easting && rec.northing) openInStreetView([rec.easting, rec.northing]);
    }
  }

  /**
   * Event to handle when the property actions menu button is clicked.
   *
   * @param {object} event The event object.
   */
  const handlePropertyActionsMenuClick = (event) => {
    setAnchorPropertyActionsEl(event.nativeEvent.target);
    event.stopPropagation();
  };

  /**
   * Event to handle closing the property actions menu.
   *
   * @param {object} event The event object.
   */
  const handlePropertyActionsMenuClose = (event) => {
    setAnchorPropertyActionsEl(null);
    event.stopPropagation();
  };

  /**
   * Method to get the styling to be used for the language chip.
   *
   * @param {number} status The logical status of the property.
   * @returns {object} The styling to be used for the language chip.
   */
  function PropertyLanguageChipStyle(status) {
    const logicalStatusRec = LPILogicalStatus.filter((x) => x.id === status);
    return RelatedLanguageChipStyle(logicalStatusRec ? logicalStatusRec[0].colour : "");
  }

  /**
   * Method to get the styling to be used for the address.
   *
   * @param {boolean} selected True if the node is selected; otherwise false.
   * @returns {object} The styling to use for the address.
   */
  function AddressStyle(selected) {
    if (selected) {
      return { display: "inline-flex", fontWeight: "bold" };
    } else {
      return { display: "inline-flex" };
    }
  }

  /**
   * Method to generate the add menu items.
   *
   * @param {object} record The current property record.
   * @param {number} id The id for the current property.
   * @param {JSX.Element} anchorEl The element to anchor the menu to.
   * @param {event} handleClose The event to use when closing the menu.
   * @returns {JSX.Element} The menu element.
   */
  function AddMenuItems(record, id, anchorEl, handleClose) {
    return (
      <Menu
        id={id}
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
        onClose={handleClose}
        sx={menuStyle}
      >
        {canAddChild.current && (
          <MenuItem
            dense
            disabled={!userCanEdit}
            onClick={(event) => HandleAddChild(event, record.uprn)}
            sx={menuItemStyle(false)}
          >
            <Typography variant="inherit">Add child</Typography>
          </MenuItem>
        )}
        {canAddChild.current && (
          <MenuItem
            dense
            disabled={!userCanEdit}
            onClick={(event) => handleAddChildren(event, record.uprn)}
            sx={menuItemStyle(false)}
          >
            <Typography variant="inherit">Add children</Typography>
          </MenuItem>
        )}
        <MenuItem dense onClick={(event) => handleStreetViewClick(event, record)} sx={menuItemStyle(false)}>
          <Typography variant="inherit">Open in Street View</Typography>
        </MenuItem>
        {process.env.NODE_ENV === "development" && (
          <MenuItem dense disabled sx={menuItemStyle(false)}>
            <Typography variant="inherit">Search nearby</Typography>
          </MenuItem>
        )}
        <MenuItem dense onClick={(event) => zoomToProperty(event, record.uprn)} sx={menuItemStyle(false)}>
          <Typography variant="inherit">Zoom to this</Typography>
        </MenuItem>
        <MenuItem
          dense
          divider
          onClick={(event) => itemCopy(event, record.uprn.toString(), "UPRN")}
          sx={menuItemStyle(true)}
        >
          <Typography variant="inherit">Copy UPRN</Typography>
        </MenuItem>
        {process.env.NODE_ENV === "development" && (
          <MenuItem dense disabled sx={menuItemStyle(false)}>
            <Typography variant="inherit">Bookmark</Typography>
          </MenuItem>
        )}
        {process.env.NODE_ENV === "development" && (
          <MenuItem dense disabled sx={menuItemStyle(false)}>
            <Typography variant="inherit">Add to list</Typography>
          </MenuItem>
        )}
        {process.env.NODE_ENV === "development" && (
          <MenuItem dense divider disabled sx={menuItemStyle(true)}>
            <Typography variant="inherit">Export to...</Typography>
          </MenuItem>
        )}
        {process.env.NODE_ENV === "development" && (
          <MenuItem dense disabled sx={menuItemStyle(false)}>
            <Typography variant="inherit">Move street</Typography>
          </MenuItem>
        )}
        <MenuItem
          dense
          disabled={!userCanEdit}
          onClick={(event) => handleMakeChildOf(event, record)}
          sx={menuItemStyle(false)}
        >
          <Typography variant="inherit">Make child of...</Typography>
        </MenuItem>
        {process.env.NODE_ENV === "development" && (
          <MenuItem dense divider disabled sx={menuItemStyle(true)}>
            <Typography variant="inherit">Move seed point</Typography>
          </MenuItem>
        )}
        {process.env.NODE_ENV === "development" && (
          <MenuItem dense disabled sx={menuItemStyle(false)}>
            <Typography variant="inherit">Reject</Typography>
          </MenuItem>
        )}
        {process.env.NODE_ENV === "development" && (
          <MenuItem dense disabled sx={menuItemStyle(false)}>
            <Typography variant="inherit">Historicise</Typography>
          </MenuItem>
        )}
      </Menu>
    );
  }

  /**
   * Method used to style the tree items by whether they are checked and/or current.
   *
   * @param {number} uprn Uprn for the tree item.
   * @returns {object} The styling to use for the tree item.
   */
  const treeItemStyle = (uprn) => {
    const currentProperty = uprn.toString() === propertyContext.currentProperty.uprn.toString();
    const checked = propertyChecked.includes(uprn.toString());
    if (currentProperty)
      return {
        backgroundColor: checked ? adsPaleBlueA : adsWhite,
        borderTop: `solid ${adsLightGreyB} 1px`,
        borderLeft: `solid ${adsLightGreyD} 5px`,
        pb: theme.spacing(1),
        pt: theme.spacing(1),
        "&:hover": {
          backgroundColor: adsPaleBlueA,
          color: adsBlueA,
        },
      };
    else
      return {
        backgroundColor: checked ? adsPaleBlueA : "inherit",
        borderTop: `solid ${adsLightGreyB} 1px`,
        borderLeft: `solid ${adsBlack0} 5px`,
        pb: theme.spacing(1),
        pt: theme.spacing(1),
        "&:hover": {
          backgroundColor: adsPaleBlueA,
          color: adsBlueA,
        },
      };
  };

  /**
   * Method used to get property information for a given property.
   *
   * @param {number} propertyId The UPRN of the property that we want the information from.
   * @returns {object|null} The required property information.
   */
  const getPropertyFromId = (propertyId) => {
    const property = data.properties.filter((x) => x.uprn.toString() === propertyId.toString());
    if (property && property.length === 1)
      return { id: property[0].uprn, logical_status: property[0].primary.logicalStatus };
    else return null;
  };

  /**
   * Event to handle when the alert closes.
   *
   * @param {object} event The event object.
   * @param {string} reason The reason the alert is closing.
   * @returns
   */
  const handleAlertClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setAlertOpen(false);
  };

  /**
   * Get the styling to be used for the child count icon.
   *
   * @param {Number} dataLength The number of child records this property has.
   * @param {Boolean} hover True if the item has the mouse over it; otherwise false.
   * @returns {Object} The styling to be used for the control.
   */
  const getChildCountIconStyle = (dataLength, hover) => {
    if (hover)
      return {
        width: `${dataLength < 10 ? "20px" : dataLength < 100 ? "28px" : "36px"}`,
        height: "20px",
        backgroundColor: adsBlueA,
        borderRadius: "18px",
        fontFamily: "Open Sans",
        ml: "0px",
      };
    else
      return {
        width: `${dataLength < 10 ? "20px" : dataLength < 100 ? "28px" : "36px"}`,
        height: "20px",
        color: adsMidGreyA,
        backgroundColor: adsLightGreyB,
        borderRadius: "18px",
        fontFamily: "Open Sans",
        ml: "0px",
      };
  };

  /**
   * Gets the display for the given property record.
   *
   * @param {Object} rec The property object that we want to display
   * @param {Boolean} allowCreateChild If true then this property can have child records added to it; otherwise this property cannot have child records created on it.
   * @returns {JSX.Element} The display of the given property record.
   */
  const getRelatedPropertyItem = (rec, allowCreateChild = true) => {
    canAddChild.current = allowCreateChild;

    return (
      <Grid2
        container
        spacing={0}
        justifyContent="flex-start"
        alignItems="center"
        columns={12}
        rowSpacing={1}
        id={`related-property-item-${rec.uprn}`}
      >
        <Grid2 size={1}>
          {data.properties && data.properties.filter((x) => x.parentUprn === rec.uprn).length > 0 && (
            <Avatar
              variant="rounded"
              sx={getChildCountIconStyle(
                data.properties && data.properties
                  ? data.properties.filter((x) => x.parentUprn === rec.uprn).length
                  : 0,
                propertySelected && propertySelected === rec.uprn
              )}
            >
              <Typography variant="caption">
                <strong>
                  {data.properties && data.properties
                    ? data.properties.filter((x) => x.parentUprn === rec.uprn).length
                    : 0}
                </strong>
              </Typography>
            </Avatar>
          )}
        </Grid2>
        <Grid2 size={1}>
          <Stack direction="row" justifyContent="flex-end" alignItems="center">
            {((propertySelected && propertySelected === rec.uprn) || propertyChecked.includes(rec.uprn.toString())) && (
              <Checkbox
                sx={{
                  pl: theme.spacing(0),
                  pr: theme.spacing(0),
                }}
                checked={propertyChecked.includes(rec.uprn.toString())}
                onChange={(event) => handleCheckboxChange(event, rec.uprn.toString(), rec.primary.address)}
              />
            )}
            <Tooltip
              title={GetAvatarTooltip(
                24,
                rec.primary.logicalStatus,
                rec.blpuClass ? rec.blpuClass : "R",
                null,
                settingsContext.isScottish
              )}
              arrow
              placement="bottom"
              sx={tooltipStyle}
            >
              {GetClassificationIcon(rec.blpuClass ? rec.blpuClass : "R", GetAvatarColour(rec.primary.logicalStatus))}
            </Tooltip>
          </Stack>
        </Grid2>
        <Grid2 container rowSpacing={1} size={8}>
          <Grid2 size={2}>
            <Chip size="small" label={rec.primary.language} sx={PropertyLanguageChipStyle(rec.primary.logicalStatus)} />
          </Grid2>
          <Grid2 size={10}>
            <Typography
              variant="subtitle2"
              sx={AddressStyle(rec.uprn.toString() === propertyContext.currentProperty.uprn.toString())}
            >
              {addressToTitleCase(rec.primary.address, rec.primary.postcode)}
            </Typography>
          </Grid2>
          {rec.additional.map((recAdd) => {
            return (
              <>
                <Grid2 size={2}>
                  <Chip size="small" label={recAdd.language} sx={PropertyLanguageChipStyle(recAdd.logicalStatus)} />
                </Grid2>
                <Grid2 size={10}>
                  <Typography
                    variant="subtitle2"
                    sx={AddressStyle(rec.uprn.toString() === propertyContext.currentProperty.uprn.toString())}
                  >
                    {addressToTitleCase(recAdd.address, recAdd.postcode)}
                  </Typography>
                </Grid2>
              </>
            );
          })}
        </Grid2>
        <Grid2 size={2}>
          {propertySelected && propertySelected === rec.uprn && propertyChecked && propertyChecked.length < 2 && (
            <Stack direction="row" justifyContent="flex-end" alignItems="center">
              <Tooltip title="Copy UPRN" arrow placement="bottom" sx={tooltipStyle}>
                <IconButton onClick={(event) => itemCopy(event, rec.uprn.toString(), "UPRN")} size="small">
                  <CopyIcon sx={ActionIconStyle()} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Zoom to this" arrow placement="bottom" sx={tooltipStyle}>
                <IconButton onClick={(event) => zoomToProperty(event, rec.uprn)} size="small">
                  <MyLocationIcon sx={ActionIconStyle()} />
                </IconButton>
              </Tooltip>
              <Tooltip title="More actions" arrow placement="bottom" sx={tooltipStyle}>
                <IconButton
                  onClick={handlePropertyActionsMenuClick}
                  aria-controls="property-actions-menu"
                  aria-haspopup="true"
                  size="small"
                >
                  <MoreVertIcon sx={ActionIconStyle()} />
                </IconButton>
              </Tooltip>
              {AddMenuItems(rec, "property-actions-menu", anchorPropertyActionsEl, handlePropertyActionsMenuClose)}
            </Stack>
          )}
        </Grid2>
      </Grid2>
    );
  };

  useEffect(() => {
    setUserCanEdit(userContext.currentUser && userContext.currentUser.editProperty);
  }, [userContext]);

  useEffect(() => {
    setPropertyChecked(checked);
    if (data && data.properties) {
      setAllChecked(data.properties.length === checked.length);
      setPartialChecked(checked.length > 0 && data.properties.length > checked.length);
      initialPropertyFocused.current = false;
    }
    setSelectionAnchorEl(checked.length > 0 ? document.getElementById("ads-related-toolbar") : null);
  }, [checked, data]);

  useEffect(() => {
    if (streetContext.currentStreet.openRelated) {
      if (document.getElementById(`property-related-tree-${streetContext.currentStreet.openRelated.toString()}`)) {
        document
          .getElementById(`property-related-tree-${streetContext.currentStreet.openRelated.toString()}`)
          .scrollIntoView();
        streetContext.onRelatedOpened();
      }
    } else if (propertyContext.currentProperty.openRelated) {
      if (!expanded || expanded.length === 0) {
        if (
          propertyContext.currentProperty.openRelated.topNodeId &&
          document.getElementById(propertyContext.currentProperty.openRelated.topNodeId) &&
          onNodeToggle
        ) {
          onNodeToggle(propertyContext.currentProperty.openRelated.expandList);
          if (
            !initialPropertyFocused.current &&
            document.getElementById(
              `property-related-tree-${propertyContext.currentProperty.openRelated.property.toString()}`
            )
          ) {
            document
              .getElementById(
                `property-related-tree-${propertyContext.currentProperty.openRelated.property.toString()}`
              )
              .scrollIntoView();
            initialPropertyFocused.current = true;
          }
        }
      } else if (
        propertyContext.currentProperty.openRelated.property &&
        document.getElementById(
          `property-related-tree-${propertyContext.currentProperty.openRelated.property.toString()}`
        ) &&
        !initialPropertyFocused.current
      ) {
        document
          .getElementById(`property-related-tree-${propertyContext.currentProperty.openRelated.property.toString()}`)
          .scrollIntoView();
        initialPropertyFocused.current = true;
      }
      propertyContext.onRelatedOpened();
    } else if (
      propertyContext.currentProperty.uprn &&
      propertyContext.currentProperty.uprn > 0 &&
      document.getElementById(`property-related-tree-${propertyContext.currentProperty.uprn.toString()}`) &&
      !initialPropertyFocused.current
    )
      document
        .getElementById(`property-related-tree-${propertyContext.currentProperty.uprn.toString()}`)
        .scrollIntoView();
    initialPropertyFocused.current = true;
  }, [streetContext, propertyContext, expanded, onNodeToggle]);

  return (
    <Fragment>
      <Box sx={toolbarStyle} id="ads-related-property-toolbar">
        <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={1}>
          <Tooltip title="Toggle select all / none" arrow placement="right" sx={tooltipStyle}>
            <Fragment>
              <Checkbox
                sx={{
                  pr: theme.spacing(0),
                  pl: theme.spacing(2.5),
                }}
                checked={allChecked}
                color="primary"
                indeterminate={partialChecked}
                onClick={handleSelectCheckboxClick}
              />
              <IconButton
                sx={{
                  pl: theme.spacing(0),
                }}
                onClick={handleSelectMenuClick}
                aria-controls="select-menu"
                aria-haspopup="true"
                size="small"
              >
                <ExpandMoreIcon sx={ActionIconStyle()} />
              </IconButton>
            </Fragment>
          </Tooltip>
          <Menu
            id="related-property-select-menu"
            elevation={2}
            anchorEl={anchorSelectEl}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            transformOrigin={{ vertical: "top", horizontal: "center" }}
            keepMounted
            open={Boolean(anchorSelectEl)}
            onClose={handleSelectMenuClose}
            sx={menuStyle}
          >
            <MenuItem dense onClick={handleSelectAll} sx={menuItemStyle(false)}>
              <Typography
                variant="inherit"
                sx={{
                  pl: theme.spacing(1),
                }}
              >
                All
              </Typography>
            </MenuItem>
            <MenuItem dense onClick={handleSelectProvisional} sx={menuItemStyle(false)}>
              <Typography
                variant="inherit"
                sx={{
                  pl: theme.spacing(1),
                }}
              >
                Provisional
              </Typography>
            </MenuItem>
            <MenuItem dense onClick={handleSelectApproved} sx={menuItemStyle(false)}>
              <Typography
                variant="inherit"
                sx={{
                  pl: theme.spacing(1),
                }}
              >
                Approved
              </Typography>
            </MenuItem>
            <MenuItem dense onClick={handleSelectHistoric} sx={menuItemStyle(false)}>
              <Typography
                variant="inherit"
                sx={{
                  pl: theme.spacing(1),
                }}
              >
                Historic
              </Typography>
            </MenuItem>
          </Menu>
        </Stack>
      </Box>
      <Box sx={dataFormStyle("PropertyRelatedPropertyTab")}>
        {loading ? (
          <Skeleton variant="rectangular" height="30px" width="100%" />
        ) : (
          <SimpleTreeView
            sx={{ flexGrow: 1, overflowY: "auto" }}
            aria-label="property related tree"
            id="property-related-tree"
            // defaultCollapseIcon={<ExpandMoreIcon sx={{ width: "24px", height: "24px" }} />}
            // defaultExpandIcon={<ChevronRightIcon sx={{ width: "24px", height: "24px" }} />}
            expandedItems={expanded}
            slots={{ expandIcon: ChevronRightIcon, collapseIcon: ExpandMoreIcon }}
            onSelectedItemsChange={handleNodeSelected}
            onExpandedItemsChange={handleNodeToggle}
          >
            {data &&
              data.properties &&
              data.properties.length > 0 &&
              data.properties
                .filter((x) => !x.parentUprn)
                .sort(function (a, b) {
                  return a.primary.address && b.primary.address
                    ? a.primary.address.localeCompare(b.primary.address, undefined, {
                        numeric: true,
                        sensitivity: "base",
                      })
                    : 0;
                })
                .map((rec) => {
                  return (
                    <TreeItem
                      key={rec.uprn}
                      itemId={rec.uprn.toString()}
                      sx={treeItemStyle(rec.uprn)}
                      label={getRelatedPropertyItem(rec)}
                      onMouseEnter={() => handleMouseEnterProperty(rec.uprn)}
                      onMouseLeave={handleMouseLeaveProperty}
                    >
                      {data.properties &&
                        data.properties
                          .filter((x) => x.parentUprn === rec.uprn)
                          .sort(function (a, b) {
                            return a.primary.address && b.primary.address
                              ? a.primary.address.localeCompare(b.primary.address, undefined, {
                                  numeric: true,
                                  sensitivity: "base",
                                })
                              : 0;
                          })
                          .map((child1) => {
                            return (
                              <TreeItem
                                key={child1.uprn}
                                itemId={child1.uprn.toString()}
                                sx={treeItemStyle(child1.uprn)}
                                label={getRelatedPropertyItem(child1)}
                                onMouseEnter={() => handleMouseEnterProperty(child1.uprn)}
                                onMouseLeave={handleMouseLeaveProperty}
                              >
                                {data.properties &&
                                  data.properties
                                    .filter((x) => x.parentUprn === child1.uprn)
                                    .sort(function (a, b) {
                                      return a.primary.address && b.primary.address
                                        ? a.primary.address.localeCompare(b.primary.address, undefined, {
                                            numeric: true,
                                            sensitivity: "base",
                                          })
                                        : 0;
                                    })
                                    .map((child2) => {
                                      return (
                                        <TreeItem
                                          key={child2.uprn}
                                          itemId={child2.uprn.toString()}
                                          sx={treeItemStyle(child2.uprn)}
                                          label={getRelatedPropertyItem(child2)}
                                          onMouseEnter={() => handleMouseEnterProperty(child2.uprn)}
                                          onMouseLeave={handleMouseLeaveProperty}
                                        >
                                          {data.properties &&
                                            data.properties
                                              .filter((x) => x.parentUprn === child2.uprn)
                                              .sort(function (a, b) {
                                                return a.primary.address && b.primary.address
                                                  ? a.primary.address.localeCompare(b.primary.address, undefined, {
                                                      numeric: true,
                                                      sensitivity: "base",
                                                    })
                                                  : 0;
                                              })
                                              .map((child3) => {
                                                return (
                                                  <TreeItem
                                                    key={child3.uprn}
                                                    itemId={child3.uprn.toString()}
                                                    sx={treeItemStyle(child3.uprn)}
                                                    label={getRelatedPropertyItem(child3, false)}
                                                    onMouseEnter={() => handleMouseEnterProperty(child3.uprn)}
                                                    onMouseLeave={handleMouseLeaveProperty}
                                                  >
                                                    {}
                                                  </TreeItem>
                                                );
                                              })}
                                        </TreeItem>
                                      );
                                    })}
                              </TreeItem>
                            );
                          })}
                    </TreeItem>
                  );
                })}
          </SimpleTreeView>
        )}
        <Box sx={{ height: "24px" }} />
      </Box>
      <Popper id={selectionId} open={selectionOpen} anchorEl={selectionAnchorEl} placement="top-start">
        <ADSSelectionControl
          selectionCount={propertyChecked && propertyChecked.length > 0 ? propertyChecked.length : 0}
          haveProperty={propertyChecked.length > 0}
          currentProperty={
            propertyChecked && propertyChecked.length === 1 ? getPropertyFromId(propertyChecked[0]) : null
          }
          currentAddress={
            propertyChecked && propertyChecked.length === 1 && checkedAddress.current
              ? checkedAddress.current.address
              : null
          }
          propertyUprns={propertyChecked}
          onSetCopyOpen={handleSetCopyOpen}
          onPropertyMoved={handlePropertyMoved}
          onError={handleSelectionError}
          onClose={handleCloseSelection}
        />
      </Popper>
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        onClose={handleAlertClose}
      >
        <Alert
          sx={GetAlertStyle(alertType.current === "propertyMoved")}
          icon={GetAlertIcon(alertType.current === "propertyMoved")}
          onClose={handleAlertClose}
          severity={GetAlertSeverity(alertType.current === "propertyMoved")}
          elevation={6}
          variant="filled"
        >{`${
          alertType.current === "propertyMoved"
            ? `Changes saved successfully. Your moved seed points have been updated.`
            : alertType.current === "maxParentLevel"
            ? `Parent is already at the maximum BLPU hierarchy level.`
            : `Unknown error.`
        }`}</Alert>
      </Snackbar>
      <MakeChildDialog
        isOpen={openMakeChild}
        variant="multi"
        selectedUPRNs={makeChildUprn}
        onClose={handleMakeChildClose}
      />
    </Fragment>
  );
}

export default RelatedPropertyTab;
