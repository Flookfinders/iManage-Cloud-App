/* #region header */
/**************************************************************************************************
//
//  Description: ESU list tab
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
//    002   10.08.23 Sean Flook                 Do not display the deleted records.
//    003   07.09.23 Sean Flook                 Changes required to maintain ESUs.
//    004   20.09.23 Sean Flook                 Do not display ESUs that have been unassigned from the street.
//    005   06.10.23 Sean Flook                 Use colour variables.
//    006   12.10.23 Sean Flook                 Correctly handle expand and collapse.
//    007   12.10.23 Sean Flook                 Removed DataListContext as no longer required.
//    008   27.10.23 Sean Flook                 Use new dataFormStyle.
//    009   03.11.23 Sean Flook                 Added hyphen to one-way.
//    010   24.11.23 Sean Flook                 Moved Box to @mui/system and fixed a warning.
//    011   19.12.23 Sean Flook                 Various bug fixes.
//    012   05.01.24 Sean Flook                 Changes to sort out warnings and use CSS shortcuts.
//    013   17.01.24 Sean Flook                 Changes after Louise's review.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useRef, useEffect, Fragment } from "react";
import PropTypes from "prop-types";
import MapContext from "../context/mapContext";
import StreetContext from "../context/streetContext";
import SettingsContext from "../context/settingsContext";
import {
  FormControlLabel,
  Checkbox,
  Tooltip,
  IconButton,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Fade,
  Skeleton,
  Popper,
  Snackbar,
  Alert,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSSelectionControl from "../components/ADSSelectionControl";
import {
  AddCircleOutlineOutlined as AddCircleIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from "@mui/icons-material";
import ADSEsuDataListItem from "../components/ADSEsuDataListItem";
import { adsBlueA, adsLightBlue10 } from "../utils/ADSColours";
import {
  toolbarStyle,
  ActionIconStyle,
  dataFormStyle,
  tooltipStyle,
  menuStyle,
  menuItemStyle,
  GetAlertStyle,
  GetAlertIcon,
  GetAlertSeverity,
} from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

EsuListTab.propTypes = {
  data: PropTypes.array,
  streetState: PropTypes.number,
  errors: PropTypes.array,
  oneWayExemptionErrors: PropTypes.array,
  highwayDedicationErrors: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  onSetCopyOpen: PropTypes.func.isRequired,
  onEsuSelected: PropTypes.func.isRequired,
  onHighwayDedicationSelected: PropTypes.func.isRequired,
  onAddHighwayDedication: PropTypes.func.isRequired,
  onOneWayExemptionSelected: PropTypes.func.isRequired,
  onAddOneWayExemption: PropTypes.func.isRequired,
};

function EsuListTab({
  data,
  streetState,
  errors,
  oneWayExemptionErrors,
  highwayDedicationErrors,
  loading,
  onSetCopyOpen,
  onEsuSelected,
  onHighwayDedicationSelected,
  onAddHighwayDedication,
  onOneWayExemptionSelected,
  onAddOneWayExemption,
}) {
  const theme = useTheme();

  const mapContext = useContext(MapContext);
  const streetContext = useContext(StreetContext);
  const settingsContext = useContext(SettingsContext);

  const [allChecked, setAllChecked] = useState(false);
  const [expandCollapseLabel, setExpandCollapseLabel] = useState("Expand all");
  const [listState, setListState] = useState("stored");
  const [checked, setChecked] = useState([]);

  const [selectionAnchorEl, setSelectionAnchorEl] = useState(null);
  const selectionOpen = Boolean(selectionAnchorEl);
  const selectionId = selectionOpen ? "esu-selection-popper" : undefined;

  const selectedPkId = useRef(-1);

  const [anchorEl, setAnchorEl] = useState(null);
  const [errorOpen, setErrorOpen] = useState(false);

  const errorType = useRef(null);

  /**
   * Event to handle when the check all button is clicked.
   */
  const handleCheckAll = () => {
    if (allChecked) {
      setChecked([]);
      setSelectionAnchorEl(null);
      mapContext.onHighlightClear();
    } else {
      const newChecked = data.map((x) => x.esuId);
      setChecked(newChecked);
      setSelectionAnchorEl(document.getElementById("ads-esu-data-grid"));
      mapContext.onHighlightListItem("esu", newChecked);
    }
    setAllChecked(!allChecked);
  };

  /**
   * Event to handle when an item is toggled.
   *
   * @param {number} value - The id of the item.
   */
  function ToggleItem(value) {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);

    setAllChecked(newChecked.length === data.length);

    if (newChecked.length > 0) {
      setSelectionAnchorEl(document.getElementById("ads-esu-data-grid"));
      mapContext.onHighlightListItem("esu", newChecked);
    } else {
      setSelectionAnchorEl(null);
      mapContext.onHighlightClear();
    }
  }

  /**
   * Event to handle when an item is expanded / collapsed
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
   * Event to handle when an ESU is clicked.
   *
   * @param {number} pkId The id of the ESU clicked.
   * @param {object} esuData The ESU data for the clicked ESU.
   * @param {number} index The index of the ESU in the array of ESUs.
   */
  const handleESUClicked = (pkId, esuData, index) => {
    streetContext.onEsuDataChange(streetContext.currentStreet.newStreet ? true : false);
    if (onEsuSelected) onEsuSelected(pkId, esuData, index);
  };

  /**
   * Event to handle displaying the add menu.
   *
   * @param {object} event The event object.
   */
  const handleAddESUClick = (event) => {
    setAnchorEl(event.nativeEvent.target);
    event.stopPropagation();
  };

  /**
   * Event to handle when the add menu is closed.
   *
   * @param {object} event The event object.
   */
  const handleAddMenuClose = (event) => {
    setAnchorEl(null);
    event.stopPropagation();
  };

  /**
   * Event to handle adding a new ESU.
   *
   * @param {object} event The event object.
   */
  const handleAddNewEsu = (event) => {
    event.stopPropagation();
    streetContext.onEsuDataChange(true);
    if (onEsuSelected) onEsuSelected(0, null, null);
  };

  /**
   * Event to handle assigning an ESU.
   *
   * @param {object} event The event object.
   */
  const handleAssignEsu = (event) => {
    event.stopPropagation();
  };

  /**
   * Event to handle when a highway dedication record is clicked.
   *
   * @param {object} hdData The highway dedication data.
   * @param {number} hdIndex The index of the highway dedication within the array of highway dedications for the ESU.
   * @param {number} index The index of the parent ESU within the array of ESUs.
   */
  const handleHighwayDedicationClicked = (hdData, hdIndex, index) => {
    if (onHighwayDedicationSelected) onHighwayDedicationSelected(hdData.esuId, hdData.pkId, hdData, hdIndex, index);
  };

  /**
   * Event to handle adding a new highway dedication record.
   *
   * @param {number} esuId The ESU id of the parent ESU record.
   * @param {number} esuIndex The index os the parent ESU record within the array of ESUs.
   */
  const handleHighwayDedicationAdd = (esuId, esuIndex) => {
    if (onAddHighwayDedication) onAddHighwayDedication(esuId, esuIndex);
  };

  /**
   * Event to handle when an one-way exemption record is clicked.
   *
   * @param {object} oweData The one-way exemption data.
   * @param {number} oweIndex The index of the one-way exemption within the array of one-way exemptions for the ESU.
   * @param {number} index The index of the parent ESU within the array of ESUs.
   */
  const handleOneWayExemptionClicked = (oweData, oweIndex, index) => {
    if (onOneWayExemptionSelected) onOneWayExemptionSelected(oweData.esuId, oweData.pkId, oweData, oweIndex, index);
  };

  /**
   * Event to handle adding a new one-way exemption record.
   *
   * @param {number} esuId The ESU id of the parent ESU record.
   * @param {number} esuIndex The index os the parent ESU record within the array of ESUs.
   */
  const handleOneWayExemptionAdd = (esuId, esuIndex) => {
    if (onAddOneWayExemption) onAddOneWayExemption(esuId, esuIndex);
  };

  /**
   * Event to handle the display of the copy alert.
   *
   * @param {boolean} open True isf the alert is top be displayed; otherwise false.
   * @param {string} dataType The type of data that was copied.
   */
  const handleCopyOpen = (open, dataType) => {
    if (onSetCopyOpen) onSetCopyOpen(open, dataType);
  };

  /**
   * Event to handle the closing of the selection box.
   */
  const handleCloseSelection = () => {
    setChecked([]);
    setAllChecked(false);
    setSelectionAnchorEl(null);
    mapContext.onHighlightClear();
  };

  /**
   * Event to handle selection errors.
   *
   * @param {string} typeOfError The type of error.
   */
  const handleSelectionError = (typeOfError) => {
    if (typeOfError) {
      errorType.current = typeOfError;
      setErrorOpen(true);
    }
  };

  const handleErrorClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setErrorOpen(false);
  };

  // ESU selected in map
  useEffect(() => {
    if (streetContext.selectedMapEsuId) {
      const currentIndex = checked.indexOf(streetContext.selectedMapEsuId);
      const newChecked = [...checked];

      if (currentIndex === -1) {
        newChecked.push(streetContext.selectedMapEsuId);
      } else {
        newChecked.splice(currentIndex, 1);
      }

      setChecked(newChecked);

      setAllChecked(data && newChecked.length === data.length);

      if (newChecked.length > 0) {
        setSelectionAnchorEl(document.getElementById("ads-esu-data-grid"));
        mapContext.onHighlightListItem("esu", newChecked);
      } else {
        setSelectionAnchorEl(null);
        mapContext.onHighlightClear();
      }
      streetContext.onEsuSelected(null);
    }
  }, [streetContext.selectedMapEsuId, checked, data, mapContext, streetContext]);

  useEffect(() => {
    if (mapContext.currentDivideEsu) {
      setChecked([]);
      setAllChecked(false);
      setSelectionAnchorEl(null);
    }
  }, [mapContext.currentDivideEsu]);

  return (
    <Fragment>
      <Box sx={toolbarStyle} id="ads-esu-data-grid">
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <FormControlLabel
            control={
              <Checkbox checked={allChecked} color="default" size="small" onChange={handleCheckAll} name="checkAll" />
            }
            label={<Typography variant="subtitle1">Elementary Street Units</Typography>}
            sx={{ pl: theme.spacing(1.5) }}
          />
          <Stack direction="row" alignItems="center" justifyContent="flex-end">
            {!settingsContext.isScottish && (
              <Tooltip title={`${expandCollapseLabel} items in list`} arrow placement="right" sx={tooltipStyle}>
                <IconButton
                  onClick={handleExpandCollapse}
                  sx={ActionIconStyle()}
                  aria-controls="expand-collapse"
                  size="small"
                >
                  {expandCollapseLabel === "Expand all" ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
                  <Typography variant="subtitle1">{expandCollapseLabel}</Typography>
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Add or assign ESU record" arrow placement="right" sx={tooltipStyle}>
              <IconButton
                sx={ActionIconStyle()}
                onClick={handleAddESUClick}
                aria_controls="actions-menu"
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
                  Add ESU
                </Typography>
              </IconButton>
            </Tooltip>
            <Menu
              id={`add-esu-menu`}
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
              <MenuItem dense onClick={handleAddNewEsu} sx={menuItemStyle(false)}>
                <Typography variant="inherit">Create new ESU</Typography>
              </MenuItem>
              <MenuItem dense onClick={handleAssignEsu} sx={menuItemStyle(false)}>
                <Typography variant="inherit">Assign ESU from map</Typography>
              </MenuItem>
            </Menu>
          </Stack>
        </Stack>
      </Box>
      <Box sx={dataFormStyle("77.7vh")}>
        {loading ? (
          <Skeleton variant="rectangular" height="30px" width="100%" />
        ) : data && data.length > 0 ? (
          data
            .filter((x) => x.changeType !== "D" && x.assignUnassign !== -1)
            .map((rec, index) => (
              <List
                sx={{
                  width: "100%",
                  backgroundColor: theme.palette.background.paper,
                  pt: theme.spacing(0),
                }}
                component="nav"
                key={`key_${index}`}
              >
                <ADSEsuDataListItem
                  title={rec.esuId < 0 ? `New ESU - ID set on save [${rec.esuId * -1 - 9}]` : `${rec.esuId}`}
                  data={{ esu: rec, selectedItem: selectedPkId.current }}
                  streetState={streetState}
                  error={errors.find((x) => x.index === index)}
                  oneWayExemptionErrors={oneWayExemptionErrors.filter((x) => x.esuIndex === index)}
                  highwayDedicationErrors={highwayDedicationErrors.filter((x) => x.esuIndex === index)}
                  checked={checked}
                  itemState={listState}
                  onEsuClicked={(pkId, esuData) => handleESUClicked(pkId, esuData, index)}
                  onHighwayDedicationClicked={(hdData, hdIndex) =>
                    handleHighwayDedicationClicked(hdData, hdIndex, index)
                  }
                  onHighwayDedicationAdd={(esuId) => handleHighwayDedicationAdd(esuId, index)}
                  onOneWayExceptionClicked={(oweData, oweIndex) =>
                    handleOneWayExemptionClicked(oweData, oweIndex, index)
                  }
                  onOneWayExceptionAdd={(esuId) => handleOneWayExemptionAdd(esuId, index)}
                  onToggleItem={(value) => ToggleItem(value)}
                  onSetCopyOpen={(open, dataType) => handleCopyOpen(open, dataType)}
                  onDivideError={handleSelectionError}
                  onExpandCollapse={handleItemExpandCollapse}
                />
              </List>
            ))
        ) : (
          <List
            sx={{
              width: "100%",
              backgroundColor: theme.palette.background.paper,
              pt: theme.spacing(0),
            }}
            component="nav"
            key="key_no_records"
          >
            <ListItemButton
              dense
              disableGutters
              onClick={handleAddESUClick}
              sx={{
                height: "30px",
                "&:hover": {
                  backgroundColor: adsLightBlue10,
                  color: adsBlueA,
                },
              }}
            >
              <ListItemText primary={<Typography variant="subtitle1">Add or assign ESU records</Typography>} />
            </ListItemButton>
          </List>
        )}
      </Box>
      <Snackbar
        open={errorOpen}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        onClose={handleErrorClose}
      >
        <Alert
          sx={GetAlertStyle(false)}
          icon={GetAlertIcon(false)}
          onClose={handleErrorClose}
          severity={GetAlertSeverity(false)}
          elevation={6}
          variant="filled"
        >{`${
          errorType.current === "invalidMergeEsu"
            ? "These ESUs cannot be merged as they are not touching."
            : errorType.current === "streetAlreadyDividedMerged"
            ? "There has already been a divide or merge on this street, please save changes before retrying."
            : "Unknown error occurred."
        }`}</Alert>
      </Snackbar>
      <Popper id={selectionId} open={selectionOpen} anchorEl={selectionAnchorEl} placement="top-start">
        <ADSSelectionControl
          selectionCount={checked && checked.length > 0 ? checked.length : 0}
          haveEsu={checked && checked.length > 0}
          currentEsu={checked}
          onError={handleSelectionError}
          onClose={handleCloseSelection}
        />
      </Popper>
    </Fragment>
  );
}

export default EsuListTab;
