/* #region header */
/**************************************************************************************************
//
//  Description: ASD Data tab
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
//    002   10.08.23 Sean Flook                 Use the correct primaryCodeField for type 61 records.
//    003   06.10.23 Sean Flook                 Use colour variables.
//    004   11.10.23 Sean Flook                 Correctly handle expand and collapse.
//    005   12.10.23 Sean Flook                 Removed DataListContext as no longer required.
//    006   13.10.23 Sean Flook                 Removed development restriction on handling clicks.
//    007   16.10.23 Sean Flook                 Only show PRoW records for type 3 streets.
//    008   27.10.23 Sean Flook                 Use new dataFormStyle.
//    009   10.11.23 Sean Flook                 Removed HasASDPlus as no longer required.
//    010   24.11.23 Sean Flook                 Moved Box to @mui/system and fixed a warning.
//    011   05.01.24 Sean Flook                 Changes to sort out warnings and use CSS shortcuts.
//    012   08.01.24 Sean Flook                 Changes to try and fix warnings.
//    013   09.02.24 Sean Flook                 Changed colours used for type 51, 52, 61, and 62 records.
//    014   13.02.24 Sean Flook       IMANN-294 Only allow ASD records to be added to type 1 & 2 streets apart from PRoWs on type 3 streets.
//    015   13.02.24 Sean Flook                 Display the correct information for type 63 & 66 records in the list.
//    016   16.02.24 Sean Flook        ESU16_GP If changing page etc ensure the information and selection controls are cleared.
//    017   20.02.24 Sean Flook        ESU16_GP Undone above change as not required.
//    018   04.03.24 Sean Flook            COL3 Changed the colour for type 51/61 ASD records.
//    019   07.03.24 Sean Flook       IMANN-339 Only show the Add button for Scottish authorities if the street is type 1 or 2.
//    020   11.03.24 Sean Flook           GLB12 Adjusted height to remove gap.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useRef, useEffect, Fragment } from "react";
import PropTypes from "prop-types";
import UserContext from "../context/userContext";
import SettingsContext from "../context/settingsContext";

import { getAsdDeleteVariant } from "../utils/StreetUtils";

import { Tooltip, IconButton, Typography, List, Skeleton, Menu, MenuItem, Fade, Popper } from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSSelectionControl from "../components/ADSSelectionControl";

import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";

import {
  AddCircleOutlineOutlined as AddCircleIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from "@mui/icons-material";
import AsdDataListItem from "../components/AsdDataListItem";
import {
  adsWhite,
  adsBlack,
  adsYellow,
  adsMidRed,
  adsDarkGreen,
  adsMidBlueA,
  adsDarkPurple,
} from "../utils/ADSColours";
import {
  toolbarStyle,
  ActionIconStyle,
  dataFormStyle,
  menuStyle,
  menuItemStyle,
  tooltipStyle,
} from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

AsdDataTab.propTypes = {
  data: PropTypes.object,
  interestErrors: PropTypes.array,
  constructionErrors: PropTypes.array,
  specialDesignationErrors: PropTypes.array,
  heightWidthWeightErrors: PropTypes.array,
  publicRightOfWayErrors: PropTypes.array,
  maintenanceResponsibilityErrors: PropTypes.array,
  reinstatementCategoryErrors: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  onInterestedSelected: PropTypes.func,
  onConstructionSelected: PropTypes.func,
  onSpecialDesignationSelected: PropTypes.func,
  onHWWSelected: PropTypes.func,
  onPRoWSelected: PropTypes.func,
  onMaintenanceResponsibilitySelected: PropTypes.func,
  onReinstatementCategorySelected: PropTypes.func,
  onOSSpecialDesignationSelected: PropTypes.func,
  onInterestedDeleted: PropTypes.func,
  onConstructionDeleted: PropTypes.func,
  onSpecialDesignationDeleted: PropTypes.func,
  onHWWDeleted: PropTypes.func,
  onPRoWDeleted: PropTypes.func,
  onMaintenanceResponsibilityDeleted: PropTypes.func,
  onReinstatementCategoryDeleted: PropTypes.func,
  onOSSpecialDesignationDeleted: PropTypes.func,
};

function AsdDataTab({
  data,
  interestErrors,
  constructionErrors,
  specialDesignationErrors,
  heightWidthWeightErrors,
  publicRightOfWayErrors,
  maintenanceResponsibilityErrors,
  reinstatementCategoryErrors,
  loading,
  onInterestedSelected,
  onConstructionSelected,
  onSpecialDesignationSelected,
  onHWWSelected,
  onPRoWSelected,
  onMaintenanceResponsibilitySelected,
  onReinstatementCategorySelected,
  onOSSpecialDesignationSelected,
  onInterestedDeleted,
  onConstructionDeleted,
  onSpecialDesignationDeleted,
  onHWWDeleted,
  onPRoWDeleted,
  onMaintenanceResponsibilityDeleted,
  onReinstatementCategoryDeleted,
  onOSSpecialDesignationDeleted,
}) {
  const theme = useTheme();

  const userContext = useContext(UserContext);
  const settingsContext = useContext(SettingsContext);

  const [expandCollapseLabel, setExpandCollapseLabel] = useState("Expand all");
  const [listState, setListState] = useState("stored");
  const [anchorEl, setAnchorEl] = useState(null);

  const [checked, setChecked] = useState([]);

  const [selectionAnchorEl, setSelectionAnchorEl] = useState(null);
  const selectionOpen = Boolean(selectionAnchorEl);
  const selectionId = selectionOpen ? "esu-selection-popper" : undefined;

  const [userCanEdit, setUserCanEdit] = useState(false);

  const deleteVariant = useRef(null);
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const deletePkId = useRef(null);

  /**
   * Event to handle the expanding and collapsing of all the ASD records.
   */
  const handleExpandCollapse = () => {
    if (expandCollapseLabel === "Expand all") {
      setListState("expanded");
      setExpandCollapseLabel("Collapse all");
    } else {
      setListState("collapsed");
      setExpandCollapseLabel("Expand all");
    }
  };

  /**
   * Event to handle when an item is expanded or collapsed.
   */
  const handleItemExpandCollapse = () => {
    if (["expanded", "collapsed"].includes(listState)) setListState("stored");
  };

  /**
   * Event to handle when the add ASD button is clicked.
   *
   * @param {object} event
   */
  const handleAddASDClick = (event) => {
    setAnchorEl(event.nativeEvent.target);
    event.stopPropagation();
  };

  /**
   * Event to handle when the add ASD menu is closed.
   *
   * @param {object} event
   */
  const handleAddMenuClose = (event) => {
    setAnchorEl(null);
    event.stopPropagation();
  };

  /**
   * Event to handle when the add maintenance responsibility menu item is clicked.
   */
  const handleCreateMaintenanceResponsibilityRecord = () => {
    if (onMaintenanceResponsibilitySelected)
      onMaintenanceResponsibilitySelected(
        0,
        null,
        data.maintenanceResponsibilities.length,
        data.maintenanceResponsibilities.length
      );
  };

  /**
   * Event to handle when the add reinstatement category menu item is clicked.
   */
  const handleCreateReinstatementCategoryRecord = () => {
    if (onReinstatementCategorySelected)
      onReinstatementCategorySelected(
        0,
        null,
        data.reinstatementCategories.length,
        data.reinstatementCategories.length
      );
  };

  /**
   * Event to handle when the add special designation menu item is clicked.
   */
  const handleCreateOSSpecialDesignationRecord = () => {
    if (onOSSpecialDesignationSelected)
      onOSSpecialDesignationSelected(0, null, data.specialDesignations.length, data.specialDesignations.length);
  };

  /**
   * Event to handle when the add interest menu item is clicked.
   */
  const handleCreateInterestedRecord = () => {
    if (onInterestedSelected) onInterestedSelected(0, null, data.interests.length, data.interests.length);
  };

  /**
   * Event to handle when the add construction menu item is clicked.
   */
  const handleCreateConstructionRecord = () => {
    if (onConstructionSelected) onConstructionSelected(0, null, data.constructions.length, data.constructions.length);
  };

  /**
   * Event to handle when the add special designation menu item is clicked.
   */
  const handleCreateSpecialDesignationRecord = () => {
    if (onSpecialDesignationSelected)
      onSpecialDesignationSelected(0, null, data.specialDesignations.length, data.specialDesignations.length);
  };

  /**
   * Event to handle when the add height, width and weight menu item is clicked.
   */
  const handleCreateHWWRecord = () => {
    if (onHWWSelected) onHWWSelected(0, null, data.heightWidthWeights.length, data.heightWidthWeights.length);
  };

  /**
   * Event to handle when the add public rights of way menu item is clicked.
   */
  const handleCreatePRoWRecord = () => {
    if (onPRoWSelected) onPRoWSelected(0, null, data.publicRightOfWays.length, data.publicRightOfWays.length);
  };

  /**
   * Event to handle when an items checkbox is toggled.
   *
   * @param {number} value The id for the item that is being toggled.
   */
  const handleToggleItem = (value) => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);

    if (newChecked.length > 0) {
      setSelectionAnchorEl(document.getElementById("ads-asd-data-grid"));
    } else {
      setSelectionAnchorEl(null);
    }
  };

  /**
   * Event to handle the closing of the selection box.
   */
  const handleCloseSelection = () => {
    setChecked([]);
    setSelectionAnchorEl(null);
  };

  /**
   * Event to handle when a maintenance responsibility record is clicked.
   *
   * @param {object} maintenanceResponsibilityData The maintenance responsibility record that has been clicked.
   * @param {number} index The index of the maintenance responsibility record within the array of maintenance responsibility records.
   */
  const handleMaintenanceResponsibilityClicked = (maintenanceResponsibilityData, index) => {
    if (onMaintenanceResponsibilitySelected)
      onMaintenanceResponsibilitySelected(
        maintenanceResponsibilityData.pkId,
        maintenanceResponsibilityData,
        index,
        data.maintenanceResponsibilities.length
      );
  };

  /**
   * Event to handle when a reinstatement category record is clicked.
   *
   * @param {object} reinstatementCategoryData The reinstatement category record that has been clicked.
   * @param {number} index The index of the reinstatement category record within the array of reinstatement category records.
   */
  const handleReinstatementCategoryClicked = (reinstatementCategoryData, index) => {
    if (onReinstatementCategorySelected)
      onReinstatementCategorySelected(
        reinstatementCategoryData.pkId,
        reinstatementCategoryData,
        index,
        data.reinstatementCategories.length
      );
  };

  /**
   * Event to handle when a special designation record is clicked.
   *
   * @param {object} specialDesignationData The special designation record that has been clicked.
   * @param {number} index The index of the special designation record within the array of special designation records.
   */
  const handleOSSpecialDesignationClicked = (specialDesignationData, index) => {
    if (onOSSpecialDesignationSelected)
      onOSSpecialDesignationSelected(
        specialDesignationData.pkId,
        specialDesignationData,
        index,
        data.specialDesignations.length
      );
  };

  /**
   * Event to handle when an interest record is clicked.
   *
   * @param {object} interestedData The interest record that has been clicked.
   * @param {number} index The index of the interest record within the array of interest records.
   */
  const handleInterestedClicked = (interestedData, index) => {
    if (onInterestedSelected) onInterestedSelected(interestedData.pkId, interestedData, index, data.interests.length);
  };

  /**
   * Event to handle when a construction record is clicked.
   *
   * @param {object} constructionData The construction record that has been clicked.
   * @param {number} index The index of the construction record within the array of construction records.
   */
  const handleConstructionClicked = (constructionData, index) => {
    if (onConstructionSelected)
      onConstructionSelected(constructionData.pkId, constructionData, index, data.constructions.length);
  };

  /**
   * Event to handle when a special designation record is clicked.
   *
   * @param {object} specialDesignationData The special designation record that has been clicked.
   * @param {number} index The index of the special designation record within the array of special designation records.
   */
  const handleSpecialDesignationClicked = (specialDesignationData, index) => {
    if (onSpecialDesignationSelected)
      onSpecialDesignationSelected(
        specialDesignationData.pkId,
        specialDesignationData,
        index,
        data.specialDesignations.length
      );
  };

  /**
   * Event to handle when a height, width & weight record is clicked.
   *
   * @param {object} hwwData The height, width & weight record that has been clicked.
   * @param {number} index The index of the height, width & weight record within the array of height, width & weight records.
   */
  const handleHwwClicked = (hwwData, index) => {
    if (onHWWSelected) onHWWSelected(hwwData.pkId, hwwData, index, data.heightWidthWeights.length);
  };

  /**
   * Event to handle when a public rights of way record is clicked.
   *
   * @param {object} prowData The public rights of way record that has been clicked.
   * @param {number} index The index of the public rights of way record within the array of public rights of way records.
   */
  const handleProwClicked = (prowData, index) => {
    if (onPRoWSelected) onPRoWSelected(prowData.pkId, prowData, index, data.publicRightOfWays.length);
  };

  /**
   * Event to handle when a maintenance responsibility record is deleted.
   *
   * @param {number} id The id of the maintenance responsibility record to be deleted.
   */
  // const handleMaintenanceResponsibilityDeleted = (id) => {
  //   if (onMaintenanceResponsibilityDeleted) onMaintenanceResponsibilityDeleted(id);
  // };

  /**
   * Event to handle when a reinstatement category record is deleted.
   *
   * @param {number} id The id of the reinstatement category record to be deleted.
   */
  // const handleReinstatementCategoryDeleted = (id) => {
  //   if (onReinstatementCategoryDeleted) onReinstatementCategoryDeleted(id);
  // };

  /**
   * Event to handle when a special designation record is deleted.
   *
   * @param {number} id The id of the special designation record to be deleted.
   */
  // const handleOSSpecialDesignationDeleted = (id) => {
  //   if (onOSSpecialDesignationDeleted) onOSSpecialDesignationDeleted(id);
  // };

  /**
   * Event to handle when am interest record is deleted.
   *
   * @param {number} id The id of the interest record to be deleted.
   */
  // const handleInterestedDeleted = (id) => {
  //   if (onInterestedDeleted) onInterestedDeleted(id);
  // };

  /**
   * Event to handle when a construction record is deleted.
   *
   * @param {number} id The id of the construction record to be deleted.
   */
  // const handleConstructionDeleted = (id) => {
  //   if (onConstructionDeleted) onConstructionDeleted(id);
  // };

  /**
   * Event to handle when a special designation record is deleted.
   *
   * @param {number} id The id of the special designation record to be deleted.
   */
  // const handleSpecialDesignationDeleted = (id) => {
  //   if (onSpecialDesignationDeleted) onSpecialDesignationDeleted(id);
  // };

  /**
   * Event to handle when a height, width & weight record is deleted.
   *
   * @param {number} id The id of the height, width & weight record to be deleted.
   */
  // const handleHwwDeleted = (id) => {
  //   if (onHWWDeleted) onHWWDeleted(id);
  // };

  /**
   * Event to handle when a public rights of way record is deleted.
   *
   * @param {number} id The id of the public rights of way record to be deleted.
   */
  // const handleProwDeleted = (id) => {
  //   if (onPRoWDeleted) onPRoWDeleted(id);
  // };

  /**
   * Event to handle when an ASD record is deleted.
   *
   * @param {string} variant The variant of the ASD record to be deleted.
   * @param {number} id The id of the ASD record to be deleted.
   */
  const handleItemDeleted = (variant, id) => {
    deleteVariant.current = variant;
    deletePkId.current = id;
    setOpenDeleteConfirmation(true);
  };

  /**
   * Event to handle when the delete confirmation dialog closes.
   *
   * @param {boolean} deleteConfirmed True if the user has confirmed the deletion; otherwise false.
   */
  const handleCloseDeleteConfirmation = (deleteConfirmed) => {
    setOpenDeleteConfirmation(false);

    if (deleteConfirmed && deletePkId.current && deletePkId.current > 0 && deleteVariant.current) {
      switch (deleteVariant.current) {
        case "51":
          if (onMaintenanceResponsibilityDeleted) onMaintenanceResponsibilityDeleted(deletePkId.current);
          break;

        case "52":
          if (onReinstatementCategoryDeleted) onReinstatementCategoryDeleted(deletePkId.current);
          break;

        case "53":
          if (onOSSpecialDesignationDeleted) onOSSpecialDesignationDeleted(deletePkId.current);
          break;

        case "61":
          if (onInterestedDeleted) onInterestedDeleted(deletePkId.current);
          break;

        case "62":
          if (onConstructionDeleted) onConstructionDeleted(deletePkId.current);
          break;

        case "63":
          if (onSpecialDesignationDeleted) onSpecialDesignationDeleted(deletePkId.current);
          break;

        case "64":
          if (onHWWDeleted) onHWWDeleted(deletePkId.current);
          break;

        case "66":
          if (onPRoWDeleted) onPRoWDeleted(deletePkId.current);
          break;

        default:
          break;
      }
    }
  };

  useEffect(() => {
    setUserCanEdit(userContext.currentUser && userContext.currentUser.canEdit);
  }, [userContext]);

  return (
    <Fragment>
      <Box sx={toolbarStyle} id={"ads-asd-data-grid"}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle1" sx={{ pl: theme.spacing(1.5) }}>
            Associated Street Data
          </Typography>
          <Stack direction="row" alignItems="center" justifyContent="flex-end">
            <Tooltip title={`${expandCollapseLabel} items in list`} arrow placement="right" sx={tooltipStyle}>
              <IconButton
                onClick={handleExpandCollapse}
                sx={ActionIconStyle()}
                aria-controls="expand-collapse"
                size="small"
              >
                {expandCollapseLabel === "Expand all" ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
                <Typography variant="body2">{expandCollapseLabel}</Typography>
              </IconButton>
            </Tooltip>
            {(!settingsContext.isScottish || data.recordType < 3) && (
              <IconButton
                sx={ActionIconStyle()}
                disabled={!userCanEdit}
                onClick={handleAddASDClick}
                aria_controls="add-menu"
                aria-haspopup="true"
                size="small"
              >
                <AddCircleIcon />
                <Typography
                  variant="subtitle1"
                  sx={{
                    pl: theme.spacing(1),
                    pr: theme.spacing(1),
                  }}
                >
                  Add ASD
                </Typography>
              </IconButton>
            )}
            <Menu
              id="asd-add-menu"
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
              onClose={handleAddMenuClose}
              TransitionComponent={Fade}
              sx={menuStyle}
            >
              {!settingsContext.isScottish && data.recordType < 3 && (
                <MenuItem
                  dense
                  disabled={!userCanEdit}
                  onClick={handleCreateInterestedRecord}
                  sx={menuItemStyle(false)}
                >
                  <Typography
                    variant="inherit"
                    sx={{
                      pl: theme.spacing(1),
                    }}
                  >
                    Interested organisation
                  </Typography>
                </MenuItem>
              )}
              {settingsContext.isScottish && data.recordType < 3 && (
                <MenuItem
                  dense
                  disabled={!userCanEdit}
                  onClick={handleCreateMaintenanceResponsibilityRecord}
                  sx={menuItemStyle(false)}
                >
                  <Typography
                    variant="inherit"
                    sx={{
                      pl: theme.spacing(1),
                    }}
                  >
                    Maintenance responsibility
                  </Typography>
                </MenuItem>
              )}
              {!settingsContext.isScottish && data.recordType < 3 && (
                <MenuItem
                  dense
                  disabled={!userCanEdit}
                  onClick={handleCreateConstructionRecord}
                  sx={menuItemStyle(false)}
                >
                  <Typography
                    variant="inherit"
                    sx={{
                      pl: theme.spacing(1),
                    }}
                  >
                    Construction
                  </Typography>
                </MenuItem>
              )}
              {settingsContext.isScottish && data.recordType < 3 && (
                <MenuItem
                  dense
                  disabled={!userCanEdit}
                  onClick={handleCreateReinstatementCategoryRecord}
                  sx={menuItemStyle(false)}
                >
                  <Typography
                    variant="inherit"
                    sx={{
                      pl: theme.spacing(1),
                    }}
                  >
                    Reinstatement category
                  </Typography>
                </MenuItem>
              )}
              {!settingsContext.isScottish && data.recordType < 3 && (
                <MenuItem
                  dense
                  disabled={!userCanEdit}
                  onClick={handleCreateSpecialDesignationRecord}
                  sx={menuItemStyle(false)}
                >
                  <Typography
                    variant="inherit"
                    sx={{
                      pl: theme.spacing(1),
                    }}
                  >
                    Special designation
                  </Typography>
                </MenuItem>
              )}
              {settingsContext.isScottish && data.recordType < 3 && (
                <MenuItem
                  dense
                  disabled={!userCanEdit}
                  onClick={handleCreateOSSpecialDesignationRecord}
                  sx={menuItemStyle(false)}
                >
                  <Typography
                    variant="inherit"
                    sx={{
                      pl: theme.spacing(1),
                    }}
                  >
                    Special designation
                  </Typography>
                </MenuItem>
              )}
              {!settingsContext.isScottish && data.recordType < 3 && (
                <MenuItem dense disabled={!userCanEdit} onClick={handleCreateHWWRecord} sx={menuItemStyle(false)}>
                  <Typography
                    variant="inherit"
                    sx={{
                      pl: theme.spacing(1),
                    }}
                  >
                    Height, width and weight restriction
                  </Typography>
                </MenuItem>
              )}
              {!settingsContext.isScottish && data.recordType === 3 && (
                <MenuItem dense disabled={!userCanEdit} onClick={handleCreatePRoWRecord} sx={menuItemStyle(false)}>
                  <Typography
                    variant="inherit"
                    sx={{
                      pl: theme.spacing(1),
                    }}
                  >
                    Public right of way
                  </Typography>
                </MenuItem>
              )}
            </Menu>
          </Stack>
        </Stack>
      </Box>
      <Box sx={dataFormStyle("79.9vh")}>
        {loading ? (
          <Skeleton variant="rectangular" height="30px" width="100%" />
        ) : (
          <List
            sx={{
              width: "100%",
              backgroundColor: theme.palette.background.paper,
              pt: theme.spacing(0),
            }}
            component="nav"
            key="asd_types"
          >
            {settingsContext.isScottish && data.recordType < 3 && (
              <AsdDataListItem
                variant="51"
                title="Maintenance responsibilities"
                data={
                  !loading && data.maintenanceResponsibilities
                    ? data.maintenanceResponsibilities.filter((x) => x.changeType !== "D")
                    : null
                }
                errors={maintenanceResponsibilityErrors}
                checked={checked}
                itemState={listState}
                iconColour={adsWhite}
                iconBackgroundColour={adsMidBlueA}
                primaryCodeField="streetStatus"
                secondaryCodeField="maintainingAuthorityCode"
                onToggleItem={(id) => handleToggleItem(id)}
                onItemClicked={(maintenanceResponsibilityData, index) =>
                  handleMaintenanceResponsibilityClicked(maintenanceResponsibilityData, index)
                }
                onItemDeleted={(variant, id) => handleItemDeleted(variant, id)}
                onExpandCollapse={handleItemExpandCollapse}
              />
            )}
            {settingsContext.isScottish && data.recordType < 3 && (
              <AsdDataListItem
                variant="52"
                title="Reinstatement categories"
                data={
                  !loading && data.reinstatementCategories
                    ? data.reinstatementCategories.filter((x) => x.changeType !== "D")
                    : null
                }
                errors={reinstatementCategoryErrors}
                checked={checked}
                itemState={listState}
                iconColour={adsWhite}
                iconBackgroundColour={adsDarkPurple}
                primaryCodeField="reinstatementCategoryCode"
                secondaryCodeField="reinstatementAuthorityCode"
                avatarVariant="hexagon"
                onToggleItem={(id) => handleToggleItem(id)}
                onItemClicked={(reinstatementCategoryData, index) =>
                  handleReinstatementCategoryClicked(reinstatementCategoryData, index)
                }
                onItemDeleted={(variant, id) => handleItemDeleted(variant, id)}
                onExpandCollapse={handleItemExpandCollapse}
              />
            )}
            {settingsContext.isScottish && data.recordType < 3 && (
              <AsdDataListItem
                variant="53"
                title="Special designations"
                data={
                  !loading && data.specialDesignations
                    ? data.specialDesignations.filter((x) => x.changeType !== "D")
                    : null
                }
                errors={specialDesignationErrors}
                checked={checked}
                itemState={listState}
                iconColour={adsBlack}
                iconBackgroundColour={adsYellow}
                iconBorderColour={`${adsBlack}  !important`}
                primaryCodeField="specialDesig"
                secondaryCodeField="authorityCode"
                onToggleItem={(id) => handleToggleItem(id)}
                onItemClicked={(specialDesignationData, index) =>
                  handleOSSpecialDesignationClicked(specialDesignationData, index)
                }
                onItemDeleted={(variant, id) => handleItemDeleted(variant, id)}
                onExpandCollapse={handleItemExpandCollapse}
              />
            )}
            {!settingsContext.isScottish && data.recordType < 3 && (
              <AsdDataListItem
                variant="61"
                title="Interested organisations"
                data={!loading && data.interests ? data.interests.filter((x) => x.changeType !== "D") : null}
                errors={interestErrors}
                checked={checked}
                itemState={listState}
                iconColour={adsWhite}
                iconBackgroundColour={adsMidBlueA}
                primaryCodeField="streetStatus"
                secondaryCodeField="swaOrgRefAuthority"
                onToggleItem={(id) => handleToggleItem(id)}
                onItemClicked={(interestedData, index) => handleInterestedClicked(interestedData, index)}
                onItemDeleted={(variant, id) => handleItemDeleted(variant, id)}
                onExpandCollapse={handleItemExpandCollapse}
              />
            )}
            {!settingsContext.isScottish && data.recordType < 3 && (
              <AsdDataListItem
                variant="62"
                title="Construction"
                data={!loading && data.constructions ? data.constructions.filter((x) => x.changeType !== "D") : null}
                errors={constructionErrors}
                checked={checked}
                itemState={listState}
                iconColour={adsWhite}
                iconBackgroundColour={adsDarkPurple}
                primaryCodeField="constructionType"
                secondaryCodeField="constructionDescription"
                avatarVariant="hexagon"
                onToggleItem={(id) => handleToggleItem(id)}
                onItemClicked={(constructionData, index) => handleConstructionClicked(constructionData, index)}
                onItemDeleted={(variant, id) => handleItemDeleted(variant, id)}
                onExpandCollapse={handleItemExpandCollapse}
              />
            )}
            {!settingsContext.isScottish && data.recordType < 3 && (
              <AsdDataListItem
                variant="63"
                title="Special designations"
                data={
                  !loading && data.specialDesignations
                    ? data.specialDesignations.filter((x) => x.changeType !== "D")
                    : null
                }
                errors={specialDesignationErrors}
                checked={checked}
                itemState={listState}
                iconColour={adsBlack}
                iconBackgroundColour={adsYellow}
                iconBorderColour={`${adsBlack}  !important`}
                primaryCodeField="streetSpecialDesigCode"
                secondaryCodeField="specialDesigDescription"
                startDateField="specialDesigStartDate"
                endDateField="specialDesigEndDate"
                onToggleItem={(id) => handleToggleItem(id)}
                onItemClicked={(specialDesignationData, index) =>
                  handleSpecialDesignationClicked(specialDesignationData, index)
                }
                onItemDeleted={(variant, id) => handleItemDeleted(variant, id)}
                onExpandCollapse={handleItemExpandCollapse}
              />
            )}
            {!settingsContext.isScottish && data.recordType < 3 && (
              <AsdDataListItem
                variant="64"
                title="Height, width and weight restrictions"
                data={
                  !loading && data.heightWidthWeights
                    ? data.heightWidthWeights.filter((x) => x.changeType !== "D")
                    : null
                }
                errors={heightWidthWeightErrors}
                checked={checked}
                itemState={listState}
                iconColour={adsBlack}
                iconBackgroundColour={adsWhite}
                iconBorderColour={`${adsMidRed} !important`}
                primaryCodeField="hwwRestrictionCode"
                secondaryCodeField="featureDescription"
                avatarVariant="circular"
                onToggleItem={(id) => handleToggleItem(id)}
                onItemClicked={(hwwData, index) => handleHwwClicked(hwwData, index)}
                onItemDeleted={(variant, id) => handleItemDeleted(variant, id)}
                onExpandCollapse={handleItemExpandCollapse}
              />
            )}
            {!settingsContext.isScottish && data.recordType === 3 && (
              <AsdDataListItem
                variant="66"
                title="Public right of way"
                data={
                  !loading && data.publicRightOfWays ? data.publicRightOfWays.filter((x) => x.changeType !== "D") : null
                }
                errors={publicRightOfWayErrors}
                checked={checked}
                itemState={listState}
                iconColour={adsWhite}
                iconBackgroundColour={adsDarkGreen}
                primaryCodeField="prowRights"
                secondaryCodeField="prowStatus"
                avatarVariant="rightPoint"
                onToggleItem={(id) => handleToggleItem(id)}
                onItemClicked={(prowData, index) => handleProwClicked(prowData, index)}
                onItemDeleted={(variant, id) => handleItemDeleted(variant, id)}
                onExpandCollapse={handleItemExpandCollapse}
              />
            )}
          </List>
        )}
      </Box>
      <Popper id={selectionId} open={selectionOpen} anchorEl={selectionAnchorEl} placement="top-start">
        <ADSSelectionControl
          selectionCount={checked && checked.length > 0 ? checked.length : 0}
          haveAsd={checked && checked.length > 0}
          onClose={handleCloseSelection}
        />
      </Popper>
      <div>
        <ConfirmDeleteDialog
          variant={getAsdDeleteVariant(deleteVariant.current)}
          open={openDeleteConfirmation}
          onClose={handleCloseDeleteConfirmation}
        />
      </div>
    </Fragment>
  );
}

export default AsdDataTab;
