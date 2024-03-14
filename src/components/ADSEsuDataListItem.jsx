/* #region header */
/**************************************************************************************************
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
//#region Version 1.0.0.0 changes
//    001            Sean Flook                 Initial Revision.
//    002   07.09.23 Sean Flook                 Changes to handle dividing an ESU and unassigning an ESU.
//    003   06.10.23 Sean Flook                 Use colour variables.
//    004   12.10.23 Sean Flook                 Correctly handle expand and collapse.
//    005   12.10.23 Sean Flook                 Use the street context to handle storing the expanded state of the item.
//    006   03.11.23 Sean Flook                 Added hyphen to one-way.
//    007   24.11.23 Sean Flook                 Removed unwanted code.
//    008   05.01.24 Sean Flook                 use CSS shortcuts.
//    009   17.01.24 Sean Flook                 Changes after Louise's review.
//    010   25.01.24 Sean Flook                 Changes required after UX review.
//    011   02.02.24 Joel Benford               ESU direction icon color
//    012   14.02.24 Sean Flook        ESU14_GP Filter done the delete.
//    013   16.02.24 Sean Flook        ESU16_GP Whilst assigning ESU prevent anything else from occurring with the ESUs.
//    014   22.02.24 Joel Benford     IMANN-287 Blue on checked and hover
//    015   27.02.24 Joshua McCormick IMANN-286 Using clippath for highway dedication indicator to alter appearance
//    016   14.03.24 Sean Flook        ESU19_GP Moved getHighwayDedicationIconStyle to ADSStyles.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, Fragment, useEffect } from "react";
import PropTypes from "prop-types";

import MapContext from "../context/mapContext";
import UserContext from "../context/userContext";
import SettingsContext from "../context/settingsContext";
import StreetContext from "../context/streetContext";
import InformationContext from "../context/informationContext";

import {
  ListItemButton,
  IconButton,
  List,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Collapse,
  Typography,
  ListItemIcon,
  Checkbox,
  Tooltip,
  Menu,
  MenuItem,
  Fade,
  Popper,
} from "@mui/material";
import ADSActionButton from "./ADSActionButton";
import ADSInformationControl from "../components/ADSInformationControl";

import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import TimelineIcon from "@mui/icons-material/Timeline";
import {
  IndentIcon,
  StartToEndIcon,
  EndToStartIcon,
  PRoWIcon,
  QuietRouteIcon,
  ObstructionIcon,
  PlanningOrderIcon,
  VehiclesProhibitedIcon,
} from "../utils/ADSIcons";

import { copyTextToClipboard } from "../utils/HelperUtils";

import OneWayExemptionType from "../data/OneWayExemptionType";
import HighwayDedicationCode from "../data/HighwayDedicationCode";

import { useTheme } from "@mui/styles";
import {
  adsBlueA,
  adsMidGreyA,
  adsRed10,
  adsRed20,
  adsWhite,
  adsLightBlue,
  adsPurple,
  adsPaleBlueA,
} from "../utils/ADSColours";
import {
  ActionIconStyle,
  menuStyle,
  menuItemStyle,
  tooltipStyle,
  getHighwayDedicationIconStyle,
} from "../utils/ADSStyles";
import { grey } from "@mui/material/colors";

ADSEsuDataListItem.propTypes = {
  title: PropTypes.string,
  data: PropTypes.object,
  streetState: PropTypes.number,
  error: PropTypes.object,
  oneWayExemptionErrors: PropTypes.array,
  highwayDedicationErrors: PropTypes.array,
  checked: PropTypes.array.isRequired,
  assigningEsus: PropTypes.bool.isRequired,
  itemState: PropTypes.string.isRequired,
  onEsuClicked: PropTypes.func.isRequired,
  onHighwayDedicationClicked: PropTypes.func.isRequired,
  onHighwayDedicationAdd: PropTypes.func.isRequired,
  onOneWayExceptionClicked: PropTypes.func.isRequired,
  onOneWayExceptionAdd: PropTypes.func.isRequired,
  onDeleteEsu: PropTypes.func.isRequired,
  onToggleItem: PropTypes.func.isRequired,
  onSetCopyOpen: PropTypes.func.isRequired,
  onDivideError: PropTypes.func.isRequired,
  onExpandCollapse: PropTypes.func.isRequired,
};

function ADSEsuDataListItem({
  title,
  data,
  streetState,
  error,
  oneWayExemptionErrors,
  highwayDedicationErrors,
  checked,
  assigningEsus,
  itemState,
  onEsuClicked,
  onHighwayDedicationClicked,
  onHighwayDedicationAdd,
  onOneWayExceptionClicked,
  onOneWayExceptionAdd,
  onDeleteEsu,
  onToggleItem,
  onSetCopyOpen,
  onDivideError,
  onExpandCollapse,
}) {
  const theme = useTheme();

  const mapContext = useContext(MapContext);
  const userContext = useContext(UserContext);
  const settingsContext = useContext(SettingsContext);
  const streetContext = useContext(StreetContext);
  const informationContext = useContext(InformationContext);

  const [open, setOpen] = useState(false);

  const [itemSelected, setItemSelected] = useState(false);
  const [itemChecked, setItemChecked] = useState(data && checked.indexOf(data.esu.esuId) !== -1);
  const [selectedRecord, setSelectedRecord] = useState(data.selectedItem);
  const [anchorEl, setAnchorEl] = useState(null);

  const [userCanEdit, setUserCanEdit] = useState(false);

  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);

  const canAddOneWayExemption = streetState && streetState < 4 && data && data.esu && data.esu.esuDirection > 1;

  const [informationAnchorEl, setInformationAnchorEl] = useState(null);
  const informationOpen = Boolean(informationAnchorEl);
  const informationId = informationOpen ? "esu-information-popper" : undefined;

  /**
   * Event to handle when an ESU is clicked.
   */
  const handleEsuClick = () => {
    if (!assigningEsus) {
      informationContext.onClearInformation();
      if (onEsuClicked) onEsuClicked(data.esu.pkId, data.esu);
    }
  };

  /**
   * Event to handle when a highway dedication record is clicked.
   *
   * @param {object} hdData The highway dedication data.
   * @param {number} index The index of the data within the array.
   */
  function handleHighwayDedicationClick(hdData, index) {
    if (!assigningEsus) {
      informationContext.onClearInformation();
      if (onHighwayDedicationClicked) onHighwayDedicationClicked(hdData, index);
    }
  }

  /**
   * Event to handle adding a new highway dedication record.
   *
   * @param {object} event The event object.
   */
  function handleAddHighwayDedication(event) {
    if (!assigningEsus) {
      informationContext.onClearInformation();
      event.stopPropagation();
      if (onHighwayDedicationAdd) onHighwayDedicationAdd(data.esu.esuId);
    }
  }

  /**
   * Event to handle when an one-way exemption record is clicked.
   *
   * @param {object} oweData The one-way exemption data.
   * @param {number} index The index of the data within the array.
   */
  function handleOneWayExemptionClick(oweData, index) {
    if (!assigningEsus) {
      informationContext.onClearInformation();
      if (onOneWayExceptionClicked) onOneWayExceptionClicked(oweData, index);
    }
  }

  /**
   * Event to handle adding a new one-way exemption record.
   *
   * @param {object} event The event object.
   */
  function handleAddOneWayExemption(event) {
    if (!assigningEsus) {
      informationContext.onClearInformation();
      event.stopPropagation();
      if (canAddOneWayExemption && onOneWayExceptionAdd) onOneWayExceptionAdd(data.esu.esuId);
    }
  }

  /**
   * Event to handle when the mouse enters the item.
   */
  const handleMouseEnter = () => {
    setItemSelected(true);
    if (!checked || checked.length === 0) mapContext.onHighlightListItem("esu", [data.esu.esuId.toString()]);
  };

  /**
   * Event to handle when the mouse leaves the item.
   */
  const handleMouseLeave = () => {
    setItemSelected(false);
    if (!checked || checked.length === 0) mapContext.onHighlightClear();
  };

  /**
   * Event to handle when the mouse enters a record.
   *
   * @param {object} event The event object.
   */
  const handleMouseEnterRecord = (event) => {
    setSelectedRecord(event.target.id);
  };

  /**
   * Event to handle when the mouse leaves a record.
   */
  const handleMouseLeaveRecord = () => {
    setSelectedRecord(null);
  };

  /**
   * Event to handle the expanding and collapsing of the item.
   *
   * @param {object} event The event object.
   */
  const handleExpandCollapse = (event) => {
    streetContext.onToggleEsuExpanded(title);
    if (onExpandCollapse) onExpandCollapse();
    event.stopPropagation();
  };

  /**
   * Method to get the highway dedication description for a given code.
   *
   * @param {number} hdCode The highway dedication code.
   * @returns {string} The highway dedication description.
   */
  function GetHighwayDedication(hdCode) {
    const hdRecord = HighwayDedicationCode.filter((x) => x.id === hdCode);

    if (hdRecord && hdRecord.length > 0) return hdRecord[0].gpText;
    else return "";
  }

  /**
   * Method to get the one-way exemption description for a given code.
   *
   * @param {number} oweCode The one-way exemption code.
   * @returns {string} The one-way exemption description.
   */
  function GetOneWayExemption(oweCode) {
    const oweRecord = OneWayExemptionType.filter((x) => x.id === oweCode);

    if (oweRecord && oweRecord.length > 0) return oweRecord[0].gpText;
    else return "";
  }

  /**
   * Method to get the direction icon for a given code.
   *
   * @param {number} directionCode The direction code.
   * @returns {JSX.Element} The direction icon for the given code.
   */
  function showDirectionIcon(directionCode) {
    switch (directionCode) {
      case 1:
        return (
          <SyncAltIcon
            sx={{
              color: adsWhite,
              backgroundColor: adsPurple,
            }}
          />
        );

      case 2:
        return (
          <StartToEndIcon
            sx={{
              color: adsWhite,
              backgroundColor: adsPurple,
            }}
          />
        );

      case 3:
        return (
          <EndToStartIcon
            sx={{
              color: adsWhite,
              backgroundColor: adsPurple,
            }}
          />
        );

      default:
        return null;
    }
  }

  /**
   * Event to handle copying the ESU id.
   *
   * @param {object} event The event object.
   */
  const handleCopyEsuId = (event) => {
    if (data.esu.esuId) {
      itemCopy(data.esu.esuId.toString(), "ESU Id");
    }
    event.stopPropagation();
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
   * Event to handle toggling the item.
   *
   * @param {object} event The event object.
   */
  const handleToggle = (event) => {
    if (onToggleItem) onToggleItem(data.esu.esuId);
    event.stopPropagation();
  };

  /**
   * Event to handle when the action context menu is clicked.
   *
   * @param {object} event The event object.
   */
  const handleActionsClick = (event) => {
    setAnchorEl(event.nativeEvent.target);
    event.stopPropagation();
  };

  /**
   * Event to handle closing the actions context menu.
   *
   * @param {object} event The event object.
   */
  const handleActionsMenuClose = (event) => {
    setAnchorEl(null);
    event.stopPropagation();
  };

  /**
   * Event to handle creating a street from the ESU.
   */
  const handleCreateStreetFromEsu = () => {};

  /**
   * Event to handle dividing the ESU.
   *
   * @param {object} event The event object.
   */
  const handleDivideEsu = (event) => {
    handleActionsMenuClose(event);
    if (streetContext.esuDividedMerged) {
      if (onDivideError) onDivideError("streetAlreadyDividedMerged");
    } else {
      informationContext.onDisplayInformation("divideESU", "ADSEsuDataListItem");
      mapContext.onDivideEsu(data.esu.esuId);
    }
  };

  /**
   * Event to handle when the information cancel button is clicked.
   */
  const handleInformationCancel = () => {
    informationContext.onClearInformation();
  };

  /**
   * Event to handle unassigning the ESU from the street.
   *
   * @param {object} event The event object.
   */
  const handleUnassignFromStreet = (event) => {
    handleActionsMenuClose(event);
    streetContext.onUnassignEsus([data.esu.esuId]);
  };

  /**
   * Event to handle deleting an ESU.
   *
   * @param {object} event The event object.
   */
  const handleDeleteEsu = (event) => {
    handleActionsMenuClose(event);
    setOpenDeleteConfirmation(true);
  };

  /**
   * Event to handle when the delete confirmation dialog is closed.
   *
   * @param {boolean} deleteConfirmed True if the user has confirmed the delete; otherwise false.
   */
  const handleCloseDeleteConfirmation = (deleteConfirmed) => {
    setOpenDeleteConfirmation(false);
    const pkId = data && data.esu.pkId ? data.esu.pkId : -1;

    if (deleteConfirmed && onDeleteEsu) onDeleteEsu(pkId);
  };

  /**
   * Method to get a list of associated records.
   *
   * @returns {array} A list of associated records.
   */
  const getAssociatedRecords = () => {
    let associatedRecords = [];
    if (data.esu.highwayDedications && data.esu.highwayDedications.length > 0)
      associatedRecords.push({
        type: "Highway dedication",
        count: data.esu.highwayDedications.length,
      });
    if (data.esu.oneWayExemptions && data.esu.oneWayExemptions.length > 0)
      associatedRecords.push({
        type: "One-way exemption",
        count: data.esu.oneWayExemptions.length,
      });
    return associatedRecords;
  };

  /**
   * Method to get the required styling for the ESU record.
   *
   * @returns {object} The styling for the ESU.
   */
  function getEsuStyle() {
    const defaultEsuStyle = {
      height: "50px",
      "&:hover": {
        backgroundColor: adsPaleBlueA,
        color: adsBlueA,
      },
    };

    const errorEsuStyle = {
      height: "50px",
      backgroundColor: adsRed10,
      "&:hover": {
        backgroundColor: adsRed20,
        color: adsBlueA,
      },
    };

    if (error) {
      return errorEsuStyle;
    } else if (
      (oneWayExemptionErrors && oneWayExemptionErrors.length > 0) ||
      (highwayDedicationErrors && highwayDedicationErrors.length > 0)
    ) {
      if (!open) {
        return errorEsuStyle;
      } else return defaultEsuStyle;
    } else return defaultEsuStyle;
  }

  /**
   * Method to get th styling for the list item icon.
   *
   * @returns {object} The styling for the list item icon.
   */
  function getListItemIconStyle() {
    if ((itemSelected || itemChecked) && !assigningEsus)
      return {
        pl: theme.spacing(1.5),
        pt: theme.spacing(1),
        height: "42px",
      };
    else
      return {
        pl: "38px",
        pt: theme.spacing(1),
        height: "42px",
      };
  }

  /**
   * Method to get the styling for the highway dedication record.
   *
   * @param {number} index The index of the record within the array.
   * @returns {object} The styling for the highway dedication record.
   */
  function getHighwayDedicationStyle(index) {
    const defaultHighwayDedicationStyle = {
      pl: theme.spacing(9),
      backgroundColor: grey[100],
      "&:hover": {
        backgroundColor: adsPaleBlueA,
        color: adsBlueA,
      },
    };

    if (highwayDedicationErrors && highwayDedicationErrors.length > 0) {
      const highwayDedicationRecordErrors = highwayDedicationErrors.filter((x) => x.index === index);
      if (highwayDedicationRecordErrors && highwayDedicationRecordErrors.length > 0) {
        return {
          pl: theme.spacing(9),
          backgroundColor: adsRed10,
          "&:hover": {
            backgroundColor: adsRed20,
            color: adsBlueA,
          },
        };
      } else return defaultHighwayDedicationStyle;
    } else return defaultHighwayDedicationStyle;
  }

  /**
   * Method the get the styling for the one-way exemption record.
   *
   * @param {number} index The index of the record within the array.
   * @returns {object} The styling for the one-way exemption record.
   */
  function getOneWayExemptionStyle(index) {
    const defaultOneWayExemptionStyle = {
      pl: theme.spacing(9),
      backgroundColor: grey[100],
      "&:hover": {
        backgroundColor: adsPaleBlueA,
        color: adsBlueA,
      },
    };

    if (oneWayExemptionErrors && oneWayExemptionErrors.length > 0) {
      const oneWayExemptionRecordErrors = oneWayExemptionErrors.filter((x) => x.index === index);
      if (oneWayExemptionRecordErrors && oneWayExemptionRecordErrors.length > 0) {
        return {
          pl: theme.spacing(9),
          backgroundColor: adsRed10,
          "&:hover": {
            backgroundColor: adsRed20,
            color: adsBlueA,
          },
        };
      } else return defaultOneWayExemptionStyle;
    } else return defaultOneWayExemptionStyle;
  }

  /**
   * Method to determine if a record is selected or not.
   *
   * @param {number} pkId The id for the record.
   * @returns {boolean} True if the record is selected; otherwise false.
   */
  const isRecordSelected = (pkId) => {
    if (selectedRecord && selectedRecord >= 0 && selectedRecord.toString() === pkId.toString()) return true;
    else return false;
  };

  useEffect(() => {
    setOpen(streetContext.expandedEsu.includes(title));
  }, [setOpen, title, streetContext.expandedEsu]);

  useEffect(() => {
    switch (itemState) {
      case "expanded":
        if (!streetContext.expandedEsu.includes(title)) {
          streetContext.onToggleEsuExpanded(title);
        }
        break;

      case "collapsed":
        if (streetContext.expandedEsu.includes(title)) {
          streetContext.onToggleEsuExpanded(title);
        }
        break;

      default:
        // Do nothing here
        break;
    }

    setItemChecked(data && checked.indexOf(data.esu.esuId) !== -1);
  }, [itemState, streetContext, title, data, checked]);

  useEffect(() => {
    setUserCanEdit(userContext.currentUser && userContext.currentUser.canEdit);
  }, [userContext]);

  useEffect(() => {
    if (mapContext.currentDivideEsu) {
      informationContext.onClearInformation();
    }
  }, [mapContext.currentDivideEsu, informationContext]);

  useEffect(() => {
    if (informationContext.informationSource && informationContext.informationSource === "ADSEsuDataListItem")
      setInformationAnchorEl(document.getElementById("ads-esu-data-grid"));
    else setInformationAnchorEl(null);
  }, [informationContext.informationSource]);

  return (
    <Fragment>
      <ListItemButton
        divider
        dense
        disableGutters
        sx={getEsuStyle()}
        onClick={handleEsuClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <ListItemIcon sx={getListItemIconStyle()}>
          <Fragment>
            {(itemSelected || itemChecked) && !assigningEsus && (
              <Checkbox
                sx={{
                  pb: theme.spacing(2),
                }}
                edge="start"
                checked={itemChecked}
                color="primary"
                tabIndex={-1}
                size="small"
                onClick={handleToggle}
              />
            )}
            {!settingsContext.isScottish && (
              <IconButton
                onClick={handleExpandCollapse}
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
                {open ? <ExpandMoreIcon /> : <ChevronRightIcon />}
              </IconButton>
            )}
            {!settingsContext.isScottish && showDirectionIcon(data.esu.esuDirection)}
            {settingsContext.isScottish && (
              <TimelineIcon
                sx={{
                  color: adsWhite,
                  backgroundColor: adsPurple,
                }}
              />
            )}
          </Fragment>
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography
              variant="subtitle1"
              sx={{
                pl: theme.spacing(1),
              }}
            >
              {title}
            </Typography>
          }
        />
        <ListItemAvatar
          sx={{
            minWidth: 32,
          }}
        >
          {itemSelected && checked && checked.length < 2 && !assigningEsus && (
            <Fragment>
              <ADSActionButton
                variant="copy"
                tooltipTitle="Copy ESU Id to clipboard"
                inheritBackground
                tooltipPlacement="bottom"
                onClick={handleCopyEsuId}
              />
              <Tooltip title="Actions" arrow placement="bottom" sx={tooltipStyle}>
                <IconButton
                  onClick={handleActionsClick}
                  sx={ActionIconStyle()}
                  aria_controls={`actions-menu-${data.esu.esuId}`}
                  size="small"
                >
                  <MoreVertIcon />
                </IconButton>
              </Tooltip>
              <Menu
                id={`actions-menu-${data.esu.esuId}`}
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
                {process.env.NODE_ENV === "development" && (
                  <MenuItem dense disabled={!userCanEdit} onClick={handleCreateStreetFromEsu} sx={menuItemStyle(false)}>
                    <Typography variant="inherit">Create street from ESU</Typography>
                  </MenuItem>
                )}
                <MenuItem dense divider onClick={handleCopyEsuId} sx={menuItemStyle(false)}>
                  <Typography variant="inherit">Copy ESU Id</Typography>
                </MenuItem>
                <MenuItem dense disabled={!userCanEdit} onClick={handleDivideEsu} sx={menuItemStyle(false)}>
                  <Typography variant="inherit">Divide ESU</Typography>
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
                {!settingsContext.isScottish && (
                  <MenuItem dense disabled={!userCanEdit} onClick={handleDeleteEsu} sx={menuItemStyle(false)}>
                    <Typography variant="inherit" color="error">
                      Delete
                    </Typography>
                  </MenuItem>
                )}
              </Menu>
            </Fragment>
          )}
        </ListItemAvatar>
      </ListItemButton>

      <Collapse in={open} timeout="auto">
        {!settingsContext.isScottish &&
          (data &&
          data.esu &&
          data.esu.highwayDedications &&
          data.esu.highwayDedications.filter((x) => x.changeType !== "D").length > 0 ? (
            data.esu.highwayDedications
              .filter((x) => x.changeType !== "D")
              .map((d, index) => (
                <List component="div" disablePadding key={`highway_dedication_key_${index}`}>
                  <ListItemButton
                    id={d.pkId}
                    alignItems="flex-start"
                    dense
                    disableGutters
                    autoFocus={d.selectedItem && d.selectedItem >= 0 && d.selectedItem.toString() === d.pkId.toString()}
                    selected={isRecordSelected(d.pkId)}
                    sx={getHighwayDedicationStyle(index)}
                    onClick={() => handleHighwayDedicationClick(d, index)}
                    onMouseEnter={handleMouseEnterRecord}
                    onMouseLeave={handleMouseLeaveRecord}
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
                      primary={<Typography variant="body1">{GetHighwayDedication(d.highwayDedicationCode)}</Typography>}
                    />
                    <ListItemAvatar sx={{ minWidth: 30 }}>
                      <PRoWIcon fontSize="small" sx={getHighwayDedicationIconStyle(d.hdProw)} />
                    </ListItemAvatar>
                    <ListItemAvatar sx={{ minWidth: 30 }}>
                      <DirectionsBikeIcon fontSize="small" sx={getHighwayDedicationIconStyle(d.hdNcr)} />
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
                        sx={getHighwayDedicationIconStyle(d.hdVehiclesProhibited)}
                      />
                    </ListItemAvatar>
                  </ListItemButton>
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
              key="key_no_highway_dedication_records"
            >
              <ListItemButton
                id={-1}
                dense
                disableGutters
                disabled={!userCanEdit}
                onClick={handleAddHighwayDedication}
                onMouseEnter={handleMouseEnterRecord}
                onMouseLeave={handleMouseLeaveRecord}
                sx={{
                  height: "30px",
                  "&:hover": {
                    backgroundColor: adsPaleBlueA,
                    color: adsBlueA,
                  },
                }}
              >
                <ListItemAvatar sx={{ pl: theme.spacing(10), minWidth: 32 }}>
                  <IndentIcon />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle1"
                      sx={{
                        pl: theme.spacing(1),
                      }}
                    >
                      No highway dedication records present
                    </Typography>
                  }
                />
                <ListItemAvatar
                  sx={{
                    minWidth: 32,
                  }}
                >
                  {selectedRecord && selectedRecord.toString() === "-1" && (
                    <Tooltip title="Add highway dedication" arrow placement="bottom" sx={tooltipStyle}>
                      <IconButton disabled={!userCanEdit} onClick={handleAddHighwayDedication} size="small">
                        <AddCircleOutlineIcon sx={ActionIconStyle()} />
                      </IconButton>
                    </Tooltip>
                  )}
                </ListItemAvatar>
              </ListItemButton>
            </List>
          ))}
        {!settingsContext.isScottish &&
          data &&
          data.esu &&
          data.esu.esuDirection !== 1 &&
          (data.esu.oneWayExemptions && data.esu.oneWayExemptions.filter((x) => x.changeType !== "D").length > 0 ? (
            data.esu.oneWayExemptions
              .filter((x) => x.changeType !== "D")
              .map((d, index) => (
                <List component="div" disablePadding key={`one_way_exemption_key_${index}`}>
                  <ListItemButton
                    id={d.pkId}
                    alignItems="flex-start"
                    dense
                    disableGutters
                    autoFocus={d.selectedItem && d.selectedItem >= 0 && d.selectedItem.toString() === d.pkId.toString()}
                    selected={isRecordSelected(d.pkId)}
                    sx={getOneWayExemptionStyle(index)}
                    onClick={() => handleOneWayExemptionClick(d, index)}
                    onMouseEnter={handleMouseEnterRecord}
                    onMouseLeave={handleMouseLeaveRecord}
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
                        <Typography variant="caption">{d.oneWayExemptionTypeCode}</Typography>
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography variant="body1">{GetOneWayExemption(d.oneWayExemptionTypeCode)}</Typography>}
                    />
                  </ListItemButton>
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
              key="key_no_one_way_exemption_records"
            >
              <ListItemButton
                id={-2}
                dense
                disableGutters
                onClick={handleAddOneWayExemption}
                onMouseEnter={handleMouseEnterRecord}
                onMouseLeave={handleMouseLeaveRecord}
                sx={{
                  height: "30px",
                  "&:hover": {
                    backgroundColor: adsPaleBlueA,
                    color: adsBlueA,
                  },
                }}
              >
                <ListItemAvatar sx={{ pl: theme.spacing(10), minWidth: 32 }}>
                  <IndentIcon />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle1"
                      sx={{
                        pl: theme.spacing(1),
                      }}
                    >
                      No one-way exemption records present
                    </Typography>
                  }
                />
                <ListItemAvatar
                  sx={{
                    minWidth: 32,
                  }}
                >
                  {canAddOneWayExemption && selectedRecord && selectedRecord.toString() === "-2" && (
                    <Tooltip title="Add one-way exemption" arrow placement="bottom" sx={tooltipStyle}>
                      <IconButton disabled={!userCanEdit} onClick={handleAddOneWayExemption} size="small">
                        <AddCircleOutlineIcon sx={ActionIconStyle()} />
                      </IconButton>
                    </Tooltip>
                  )}
                </ListItemAvatar>
              </ListItemButton>
            </List>
          ))}
      </Collapse>
      <div>
        <ConfirmDeleteDialog
          variant="esu"
          open={openDeleteConfirmation}
          associatedRecords={getAssociatedRecords()}
          onClose={handleCloseDeleteConfirmation}
        />
      </div>
      <Popper id={informationId} open={informationOpen} anchorEl={informationAnchorEl} placement="top-start">
        <ADSInformationControl variant={"divideESU"} hasCancel onCancel={handleInformationCancel} />
      </Popper>
    </Fragment>
  );
}

export default ADSEsuDataListItem;
