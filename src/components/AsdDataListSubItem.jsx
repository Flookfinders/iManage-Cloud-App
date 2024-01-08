/* #region header */
/**************************************************************************************************
//
//  Description: ASD data list sub-item component
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
//    002   06.10.23 Sean Flook                 Use colour variables.
//    003   11.10.23 Sean Flook                 Correctly handle expand and collapse.
//    004   12.10.23 Sean Flook                 Use the street context to handle storing the expanded state of the item.
//    005   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system and fixed some warnings.
//    006   03.01.24 Sean Flook                 Fixed warning.
//    007   05.01.24 Sean Flook                 Use CSS shortcuts.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useRef, Fragment, useEffect } from "react";
import PropTypes from "prop-types";
import UserContext from "../context/userContext";
import MapContext from "../context/mapContext";
import SettingsContext from "../context/settingsContext";
import StreetContext from "../context/streetContext";

import {
  GetAsdPrimaryCodeText,
  getAsdDeleteVariant,
  GetAsdPrimaryText,
  GetAsdSecondaryText,
} from "../utils/StreetUtils";
import {
  ListItemButton,
  IconButton,
  List,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Collapse,
  Typography,
  Checkbox,
} from "@mui/material";
import { Stack } from "@mui/system";
import ADSActionButton from "./ADSActionButton";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";
import { IndentIcon, WholeRoadIcon } from "../utils/ADSIcons";
import { ExpandMore, ChevronRight } from "@mui/icons-material";
import { adsBlueA, adsMidGreyA, adsBlue12 } from "../utils/ADSColours";
import {
  RecordCountStyle,
  getAsdAvatarStyle,
  getASDListItemStyle,
  getASDListItemAvatarStyle,
} from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";
import { grey } from "@mui/material/colors";

AsdDataListSubItem.propTypes = {
  variant: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  code: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired,
  errors: PropTypes.array,
  checked: PropTypes.array.isRequired,
  itemState: PropTypes.string.isRequired,
  iconColour: PropTypes.string.isRequired,
  iconBackgroundColour: PropTypes.string.isRequired,
  iconBorderColour: PropTypes.string,
  primaryCodeField: PropTypes.string.isRequired,
  secondaryCodeField: PropTypes.string,
  startDateField: PropTypes.string,
  endDateField: PropTypes.string,
  avatarVariant: PropTypes.string,
  onToggleItem: PropTypes.func.isRequired,
  onItemClicked: PropTypes.func.isRequired,
  onItemDeleted: PropTypes.func.isRequired,
  onExpandCollapse: PropTypes.func.isRequired,
};

AsdDataListSubItem.defaultProps = {
  avatarVariant: "rounded",
};

function AsdDataListSubItem({
  variant,
  title,
  data,
  code,
  index,
  errors,
  checked,
  itemState,
  iconColour,
  iconBackgroundColour,
  iconBorderColour,
  primaryCodeField,
  secondaryCodeField,
  startDateField,
  endDateField,
  avatarVariant,
  onToggleItem,
  onItemClicked,
  onItemDeleted,
  onExpandCollapse,
}) {
  const theme = useTheme();

  const userContext = useContext(UserContext);
  const mapContext = useContext(MapContext);
  const settingsContext = useContext(SettingsContext);
  const streetContext = useContext(StreetContext);

  const [subOpen, setSubOpen] = useState(false);

  const [subItemHover, setSubItemHover] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(data ? data.selectedItem : null);

  const [variantAvatar, setVariantAvatar] = useState("rounded");
  const [avatarClipPath, setAvatarClipPath] = useState(null);

  const [userCanEdit, setUserCanEdit] = useState(false);

  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);

  const deletePkId = useRef(null);
  const itemTitle = useRef(`${title}|${GetAsdPrimaryCodeText(variant, code, settingsContext.isScottish)}`);

  /**
   * Event to handle the expanding and collapsing of an event.
   *
   * @param {number} code The code from the parent item.
   */
  const handleSubExpandCollapse = (event) => {
    streetContext.onToggleAsdExpanded(itemTitle.current);
    if (onExpandCollapse) onExpandCollapse();
    event.stopPropagation();
  };

  /**
   * Event to handle the selection/deselection of a record.
   *
   * @param {object} event The event object.
   * @param {number} id The id of the record that is being toggled.
   */
  const handleToggle = (event, id) => {
    if (onToggleItem) onToggleItem(`${variant}_${id}`);
    event.stopPropagation();
  };

  /**
   * Event to handle when the mouse enters an item.
   */
  const handleMouseEnterSubItem = () => {
    setSubItemHover(true);
  };

  /**
   * Even to handle when the mouse leaves an item.
   */
  const handleMouseLeaveSubItem = () => {
    setSubItemHover(false);
  };

  /**
   * Event to handle when the mouse enters a record.
   *
   * @param {object} event
   */
  const handleMouseEnterRecord = (event) => {
    setSelectedRecord(event.target.id);
    if (!checked || checked.length === 0) mapContext.onHighlightListItem(`asd${variant}`, [event.target.id]);
  };

  /**
   * Event to handle when the mouse leaves a record.
   */
  const handleMouseLeaveRecord = () => {
    setSelectedRecord(null);
    if (!checked || checked.length === 0) mapContext.onHighlightClear();
  };

  /**
   * Event to handle when an item is clicked.
   *
   * @param {object} d The record that was clicked on.
   * @param {number} index The index of the record within the array.
   */
  const handleItemClicked = (d, index) => {
    if (onItemClicked) onItemClicked(d, index);
  };

  /**
   * Event to handle when a record is to be deleted.
   *
   * @param {object} event The event object.
   * @param {number} id The id of the record to be deleted.
   */
  const handleItemDeleted = (event, id) => {
    event.stopPropagation();
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

    if (deleteConfirmed && deletePkId.current && deletePkId.current > 0) {
      if (onItemDeleted) onItemDeleted(deletePkId.current);
    }
  };

  /**
   * Method to get the number of records for a given code.
   *
   * @param {number} code The code of the parent item.
   * @returns {number} The number of records that have the given code.
   */
  function GetSubRecordCount(code) {
    const subRecords = data.filter((x) => x[primaryCodeField] === code);

    if (subRecords) return subRecords.length;
    else return 0;
  }

  useEffect(() => {
    setSubOpen(
      streetContext.expandedAsd.includes(`${title}|${GetAsdPrimaryCodeText(variant, code, settingsContext.isScottish)}`)
    );
  }, [setSubOpen, title, variant, code, streetContext.expandedAsd, settingsContext.isScottish]);

  useEffect(() => {
    switch (itemState) {
      case "expanded":
        if (!streetContext.expandedAsd.includes(itemTitle.current)) {
          streetContext.onToggleAsdExpanded(itemTitle.current);
        }
        break;

      case "collapsed":
        if (streetContext.expandedAsd.includes(itemTitle.current)) {
          streetContext.onToggleAsdExpanded(itemTitle.current);
        }
        break;

      default:
        // Do nothing here
        break;
    }

    switch (avatarVariant) {
      case "hexagon":
        setVariantAvatar("square");
        setAvatarClipPath("polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)");
        break;

      case "rightPoint":
        setVariantAvatar("square");
        setAvatarClipPath("polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%)");
        break;

      default:
        setVariantAvatar(avatarVariant);
        setAvatarClipPath(null);
        break;
    }
  }, [itemState, code, streetContext, title, variant, avatarVariant]);

  useEffect(() => {
    setUserCanEdit(userContext.currentUser && userContext.currentUser.canEdit);
  }, [userContext]);

  return (
    <Fragment>
      <List component="div" disablePadding key={`asd_type${variant}_sub_${index}`}>
        <ListItemButton
          id={code}
          key={`asd_type${variant}_sub_${index}_${code}`}
          dense
          disableGutters
          onClick={handleSubExpandCollapse}
          onMouseEnter={handleMouseEnterSubItem}
          onMouseLeave={handleMouseLeaveSubItem}
          sx={{
            height: "50px",
            backgroundColor: grey[100],
            "&:hover": {
              backgroundColor: adsBlue12,
              color: adsBlueA,
            },
          }}
        >
          <ListItemAvatar
            sx={{
              pl: theme.spacing(5),
              pr: theme.spacing(1),
              minWidth: 24,
            }}
          >
            <IndentIcon />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
                <IconButton
                  onClick={() => handleSubExpandCollapse(code)}
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
                  {subOpen ? <ExpandMore /> : <ChevronRight />}
                </IconButton>
                <Avatar
                  variant={variantAvatar}
                  sx={getAsdAvatarStyle(avatarClipPath, iconBorderColour, iconColour, iconBackgroundColour)}
                >
                  <Typography variant="caption">{code}</Typography>
                </Avatar>
                <Typography
                  variant="subtitle1"
                  sx={{
                    pl: theme.spacing(1),
                    "&:hover": {
                      color: adsBlueA,
                    },
                  }}
                >
                  {GetAsdPrimaryCodeText(variant, code, settingsContext.isScottish)}
                </Typography>
                <Avatar sx={RecordCountStyle(subItemHover)}>
                  <Typography variant="caption">{GetSubRecordCount(code)}</Typography>
                </Avatar>
              </Stack>
            }
          />
        </ListItemButton>

        <Collapse in={subOpen} timeout="auto">
          {data
            .filter((x) => x[primaryCodeField] === code)
            .map((subD, index) => (
              <List component="div" disablePadding key={`asd_type${variant}_sub_${code}_${index}`}>
                <ListItemButton
                  id={subD.pkId}
                  key={`asd_type${variant}_sub_${code}_${index}_${subD.pkId}`}
                  alignItems="flex-start"
                  dense
                  disableGutters
                  autoFocus={
                    selectedRecord && selectedRecord >= 0 && selectedRecord.toString() === subD.pkId.toString()
                  }
                  selected={selectedRecord && selectedRecord >= 0 && selectedRecord.toString() === subD.pkId.toString()}
                  sx={getASDListItemStyle(subD.pkId.toString(), true, index, checked, variant, selectedRecord, errors)}
                  onClick={() => handleItemClicked(subD, index)}
                  onMouseEnter={handleMouseEnterRecord}
                  onMouseLeave={handleMouseLeaveRecord}
                >
                  <ListItemAvatar
                    sx={getASDListItemAvatarStyle(subD.pkId.toString(), checked, variant, selectedRecord)}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="flex-start"
                      alignItems="flex-start"
                      // alignItems="center"
                    >
                      {(checked.indexOf(`${variant}_${subD.pkId.toString()}`) !== -1 ||
                        (selectedRecord &&
                          selectedRecord >= 0 &&
                          selectedRecord.toString() === subD.pkId.toString())) && (
                        <Checkbox
                          sx={{
                            height: "20px",
                            mr: theme.spacing(2.5),
                          }}
                          edge="end"
                          checked={checked.indexOf(`${variant}_${subD.pkId.toString()}`) !== -1}
                          color="default"
                          tabIndex={-1}
                          size="small"
                          onClick={(event) => handleToggle(event, subD.pkId.toString())}
                        />
                      )}
                      <IndentIcon />
                      <WholeRoadIcon wholeRoad={subD.wholeRoad} />
                      <Avatar
                        variant={variantAvatar}
                        sx={getAsdAvatarStyle(avatarClipPath, iconBorderColour, iconColour, iconBackgroundColour)}
                      >
                        <Typography variant="caption">{subD[primaryCodeField]}</Typography>
                      </Avatar>
                    </Stack>
                  </ListItemAvatar>
                  <ListItemText
                    primary={GetAsdPrimaryText(
                      subD,
                      startDateField,
                      endDateField,
                      variant,
                      primaryCodeField,
                      settingsContext.isScottish
                    )}
                    secondary={
                      secondaryCodeField && (
                        <Typography variant="body2">
                          {GetAsdSecondaryText(subD[secondaryCodeField], variant, settingsContext.isScottish)}
                        </Typography>
                      )
                    }
                  />
                  <ListItemAvatar sx={{ minWidth: 24, pr: "8px" }}>
                    {selectedRecord && selectedRecord >= 0 && selectedRecord.toString() === subD.pkId.toString() && (
                      <ADSActionButton
                        variant="delete"
                        disabled={!userCanEdit}
                        inheritBackground
                        tooltipTitle={`Delete ${title.toLowerCase()} record`}
                        tooltipPlacement="right"
                        onClick={(event) => handleItemDeleted(event, subD.pkId)}
                      />
                    )}
                  </ListItemAvatar>
                </ListItemButton>
              </List>
            ))}
        </Collapse>
      </List>
      <div>
        <ConfirmDeleteDialog
          variant={getAsdDeleteVariant(variant)}
          open={openDeleteConfirmation}
          onClose={handleCloseDeleteConfirmation}
        />
      </div>
    </Fragment>
  );
}

export default AsdDataListSubItem;
