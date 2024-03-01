/* #region header */
/**************************************************************************************************
//
//  Description: ASD data list item component
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
//    005   24.11.23 Sean Flook                 Moved Stack to @mui/system and fixed some warnings.
//    006   03.01.24 Sean Flook                 Fixed warning.
//    007   05.01.24 Sean Flook                 Use CSS shortcuts.
//    008   08.01.24 Sean Flook                 Changes to try and fix warnings.
//    009   10.01.24 Sean Flook                 Changes to try and fix warnings.
//    010   12.01.24 Sean Flook                 Fixed duplicate key warning.
//    011   25.01.24 Sean Flook                 Changes required after UX review.
//    012   25.01.24 Joel Benford               Update styling for zero record groups
//    013   06.02.24 Sean Flook                 Set the partRoadColour on the wholeRoadIcon.
//    014   13.02.24 Sean Flook                 Changes required to handle PRoW records.
//    015   22.02.24 Joel Benford     IMANN-287 Correct hover blue
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import UserContext from "../context/userContext";
import MapContext from "../context/mapContext";
import SettingsContext from "../context/settingsContext";
import StreetContext from "../context/streetContext";

import {
  List,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  ListItemIcon,
  IconButton,
  Avatar,
  Collapse,
  Typography,
  Checkbox,
} from "@mui/material";
import { Stack } from "@mui/system";
import {
  ExpandMore,
  ChevronRight,
  People,
  Texture,
  ArrowDropDown,
  DirectionsWalk,
  Skateboarding,
  DirectionsBike,
  DirectionsCar,
} from "@mui/icons-material";
import AsdDataListSubItem from "./AsdDataListSubItem";
import ADSActionButton from "./ADSActionButton";
import { IndentIcon, WholeRoadIcon, SpecialDesignationIcon, EquestrianIcon } from "../utils/ADSIcons";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import LineAxisIcon from "@mui/icons-material/LineAxis";
import { GetAsdPrimaryText, GetAsdSecondaryText } from "../utils/StreetUtils";
import { adsBlueA, adsMidGreyA, adsLightBlue, adsPaleBlueA } from "../utils/ADSColours";
import {
  RecordCountStyle,
  getAsdAvatarStyle,
  getASDListItemStyle,
  getASDListItemAvatarStyle,
} from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";
import { grey } from "@mui/material/colors";

AsdDataListItem.propTypes = {
  variant: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
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

AsdDataListItem.defaultProps = {
  avatarVariant: "rounded",
};

function AsdDataListItem({
  variant,
  title,
  data,
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

  const [open, setOpen] = useState(false);

  const [itemHover, setItemHover] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(data ? data.selectedItem : null);
  const [variantAvatar, setVariantAvatar] = useState("rounded");
  const [avatarClipPath, setAvatarClipPath] = useState(null);

  const [subList, setSubList] = useState(null);

  const [userCanEdit, setUserCanEdit] = useState(false);

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
    if (onItemDeleted) onItemDeleted(variant, id);
  };

  /**
   * Event to handle when the mouse enters an item.
   */
  const handleMouseEnterItem = () => {
    setItemHover(true);
  };

  /**
   * Even to handle when the mouse leaves an item.
   */
  const handleMouseLeaveItem = () => {
    setItemHover(false);
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
   * Event to handle the expanding and collapsing of an event.
   *
   * @param {object} event
   */
  const handleExpandCollapse = (event) => {
    if (data && data.length === 0) return;
    streetContext.onToggleAsdExpanded(title);
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
   * Method to return the icon for the given variant of ASD record.
   *
   * @returns {JSX.Element} The icon for the current variant of ASD record.
   */
  const GetVariantIcon = () => {
    switch (variant) {
      case "51":
        return (
          <People
            sx={{
              height: theme.spacing(2),
              width: theme.spacing(2),
            }}
          />
        );

      case "52":
        return (
          <Texture
            sx={{
              height: theme.spacing(2),
              width: theme.spacing(2),
            }}
          />
        );

      case "53":
        return (
          <SpecialDesignationIcon
            sx={{
              height: theme.spacing(2),
              width: theme.spacing(2),
            }}
          />
        );

      case "61":
        return (
          <People
            sx={{
              height: theme.spacing(2),
              width: theme.spacing(2),
            }}
          />
        );

      case "62":
        return (
          <Texture
            sx={{
              height: theme.spacing(2),
              width: theme.spacing(2),
            }}
          />
        );

      case "63":
        return (
          <SpecialDesignationIcon
            sx={{
              height: theme.spacing(2),
              width: theme.spacing(2),
            }}
          />
        );

      case "64":
        return (
          <ArrowDropDown
            sx={{
              height: theme.spacing(2),
              width: theme.spacing(2),
            }}
          />
        );

      case "66":
        return (
          <DirectionsWalk
            sx={{
              height: theme.spacing(2),
              width: theme.spacing(2),
            }}
          />
        );

      default:
        return null;
    }
  };

  /**
   * Method to get the style to be used for the public rights of way record.
   *
   * @param {boolean} selected True if the record is selected; otherwise false.
   * @returns {object} The style to be used for the record.
   */
  function getPRoWStyle(selected) {
    if (selected) return { color: adsLightBlue };
    else return { color: grey[300] };
  }

  useEffect(() => {
    setOpen(streetContext.expandedAsd.includes(title));
  }, [setOpen, title, streetContext.expandedAsd]);

  useEffect(() => {
    switch (itemState) {
      case "expanded":
        if (!streetContext.expandedAsd.includes(title)) {
          streetContext.onToggleAsdExpanded(title);
        }
        break;

      case "collapsed":
        if (streetContext.expandedAsd.includes(title)) {
          streetContext.onToggleAsdExpanded(title);
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

    if (variant === "53" || variant === "63") {
      const unique = [...new Set(data ? data.map((a) => a[primaryCodeField]) : null)];
      setSubList(unique);
    }
  }, [itemState, title, streetContext, avatarVariant, variant, data, primaryCodeField]);

  useEffect(() => {
    setUserCanEdit(userContext.currentUser && userContext.currentUser.canEdit);
  }, [userContext]);

  return (
    <List component="div" disablePadding>
      <ListItemButton
        id={variant}
        key={`asd${variant}`}
        divider
        dense
        disableGutters
        onClick={handleExpandCollapse}
        onMouseEnter={handleMouseEnterItem}
        onMouseLeave={handleMouseLeaveItem}
        sx={{
          height: "50px",
          "&:hover": {
            backgroundColor: adsPaleBlueA,
            color: adsBlueA,
          },
        }}
      >
        <ListItemIcon sx={{ height: "42px", pt: theme.spacing(1) }}>
          <IconButton
            onClick={handleExpandCollapse}
            disabled={data && data.length === 0}
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
            {open ? <ExpandMore /> : <ChevronRight />}
          </IconButton>
        </ListItemIcon>
        <ListItemText
          primary={
            <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
              <Avatar
                variant={variantAvatar}
                sx={getAsdAvatarStyle(avatarClipPath, iconBorderColour, iconColour, iconBackgroundColour)}
              >
                {GetVariantIcon()}
              </Avatar>
              <Typography
                variant="subtitle1"
                sx={{
                  pl: theme.spacing(1),
                  "&:hover": {
                    color: `${data && data.length === 0 ? theme.palette.text.disabled : adsBlueA}`,
                  },
                  color: `${data && data.length === 0 ? theme.palette.text.disabled : theme.palette.text}`,
                }}
              >
                {title}
              </Typography>
              <Avatar sx={RecordCountStyle(itemHover)}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  {data ? data.length : 0}
                </Typography>
              </Avatar>
            </Stack>
          }
        />
      </ListItemButton>

      {!subList ? (
        <Collapse in={open} timeout="auto" key={`${variant}_collapse`}>
          <List component="div" disablePadding key={`${variant}_list`}>
            {data &&
              data.length > 0 &&
              data.map((d, index) => (
                <ListItemButton
                  id={d.pkId}
                  key={`asd${variant}.${d.pkId}`}
                  alignItems="flex-start"
                  dense
                  disableGutters
                  autoFocus={
                    !!(selectedRecord && selectedRecord >= 0 && selectedRecord.toString() === d.pkId.toString())
                  }
                  selected={
                    !!(selectedRecord && selectedRecord >= 0 && selectedRecord.toString() === d.pkId.toString())
                  }
                  sx={getASDListItemStyle(d.pkId.toString(), false, index, checked, variant, selectedRecord, errors)}
                  onClick={() => handleItemClicked(d, index)}
                  onMouseEnter={handleMouseEnterRecord}
                  onMouseLeave={handleMouseLeaveRecord}
                >
                  <ListItemAvatar sx={getASDListItemAvatarStyle(d.pkId.toString(), checked, variant, selectedRecord)}>
                    <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="flex-start">
                      {(checked.indexOf(`${variant}_${d.pkId.toString()}`) !== -1 ||
                        (selectedRecord && selectedRecord >= 0 && selectedRecord.toString() === d.pkId.toString())) && (
                        <Checkbox
                          sx={{
                            height: "20px",
                          }}
                          edge="end"
                          checked={checked.indexOf(`${variant}_${d.pkId.toString()}`) !== -1}
                          color="primary"
                          tabIndex={-1}
                          size="small"
                          onClick={(event) => handleToggle(event, d.pkId.toString())}
                        />
                      )}
                      <IndentIcon />
                      {variant !== "66" ? (
                        <WholeRoadIcon wholeRoad={d.wholeRoad} partRoadColour={adsMidGreyA} />
                      ) : d.defMapGeometryType ? (
                        <ShowChartIcon />
                      ) : (
                        <LineAxisIcon />
                      )}
                      <Avatar
                        variant={variantAvatar}
                        sx={getAsdAvatarStyle(avatarClipPath, iconBorderColour, iconColour, iconBackgroundColour)}
                      >
                        <Typography variant="caption">{d[primaryCodeField]}</Typography>
                      </Avatar>
                    </Stack>
                  </ListItemAvatar>
                  <ListItemText
                    primary={GetAsdPrimaryText(
                      d,
                      startDateField,
                      endDateField,
                      variant,
                      primaryCodeField,
                      settingsContext.isScottish
                    )}
                    secondary={
                      secondaryCodeField && (
                        <Typography variant="body2">
                          {GetAsdSecondaryText(d[secondaryCodeField], variant, settingsContext.isScottish)}
                        </Typography>
                      )
                    }
                  />
                  <ListItemAvatar sx={{ pr: theme.spacing(2) }}>
                    {variant === "66" && (
                      <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="flex-start">
                        <DirectionsWalk fontSize="small" sx={getPRoWStyle(d.pedAccess)} />
                        <EquestrianIcon fontSize="small" sx={getPRoWStyle(d.equAccess)} />
                        <Skateboarding fontSize="small" sx={getPRoWStyle(d.nonMotAccess)} />
                        <DirectionsBike fontSize="small" sx={getPRoWStyle(d.cycAccess)} />
                        <DirectionsCar fontSize="small" sx={getPRoWStyle(d.motAccess)} />
                      </Stack>
                    )}
                  </ListItemAvatar>
                  <ListItemAvatar sx={{ minWidth: 24, pr: "8px" }}>
                    {selectedRecord && selectedRecord >= 0 && selectedRecord.toString() === d.pkId.toString() && (
                      <ADSActionButton
                        variant="delete"
                        disabled={!userCanEdit}
                        inheritBackground
                        tooltipTitle={`Delete ${title.toLowerCase()} record`}
                        tooltipPlacement="right"
                        onClick={(event) => handleItemDeleted(event, d.pkId)}
                      />
                    )}
                  </ListItemAvatar>
                </ListItemButton>
              ))}
          </List>
        </Collapse>
      ) : (
        <Collapse in={open} timeout="auto" key={`${variant}_collapse`}>
          {subList.length > 0 &&
            subList.map((d, index) => (
              <AsdDataListSubItem
                key={`asd_data_list_sub_item_${index}`}
                variant={variant}
                title={title}
                data={data}
                code={d}
                checked={checked}
                itemState={itemState}
                iconColour={iconColour}
                iconBackgroundColour={iconBackgroundColour}
                iconBorderColour={iconBorderColour}
                primaryCodeField={primaryCodeField}
                secondaryCodeField={secondaryCodeField}
                startDateField={startDateField}
                endDateField={endDateField}
                avatarVariant={avatarVariant}
                onToggleItem={onToggleItem}
                onItemClicked={onItemClicked}
                onItemDeleted={onItemDeleted}
                onExpandCollapse={onExpandCollapse}
              />
            ))}
        </Collapse>
      )}
    </List>
  );
}

export default AsdDataListItem;
