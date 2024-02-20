/* #region header */
/**************************************************************************************************
//
//  Description: Control to be used in the selection control.
//
//  Copyright:    © 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   18.01.24 Sean Flook                 Initial Revision.
//    002   09.02.24 Sean Flook                 Added mergeExtent.
//    003   20.02.24 Sean Flook            MUL1 Added createList and existingList variants.
//    004   20.02.24 Sean Flook            MUL6 Changed the RPC icon to PushPin.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React from "react";
import PropTypes from "prop-types";

import { Button, Tooltip, Typography } from "@mui/material";

import MyLocationIcon from "@mui/icons-material/MyLocation";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import CallMergeIcon from "@mui/icons-material/CallMerge";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import StraightIcon from "@mui/icons-material/Straight";
import MergeIcon from "@mui/icons-material/Merge";
import CheckIcon from "@mui/icons-material/Check";
import NoteAddIcon from "@mui/icons-material/NoteAddOutlined";
import InsightsIcon from "@mui/icons-material/Insights";
import PushPinIcon from "@mui/icons-material/PushPin";
import ReorderIcon from "@mui/icons-material/Reorder";
import { UnassignEsuIcon, AddStreetIcon, MoveIcon } from "../utils/ADSIcons";

import { adsMidGreyA, adsBlueA, adsLightGreyB, adsWhite, adsLightBlue } from "../utils/ADSColours";
import { tooltipStyle } from "../utils/ADSStyles";

ADSSelectionButton.propTypes = {
  variant: PropTypes.oneOf([
    "unknown",
    "zoom",
    "addList",
    "more",
    "divide",
    "merge",
    "unassign",
    "assign",
    "createStreet",
    "deleteAsd",
    "deleteClassification",
    "deleteOrganisation",
    "deleteSuccessorCrossRef",
    "deleteProvenance",
    "deleteCrossReference",
    "deleteWizard",
    "mergeExtent",
    "approved",
    "moveBlpu",
    "addNote",
    "rpc",
    "createList",
    "existingList",
  ]).isRequired,
  selectionCount: PropTypes.number.isRequired,
  menuControlId: PropTypes.string,
  isDisabled: PropTypes.bool,
  isSelected: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

ADSSelectionButton.defaultProps = {
  isDisabled: false,
  isSelected: false,
};

function ADSSelectionButton({ variant, selectionCount, menuControlId, isDisabled, isSelected, onClick }) {
  /**
   * Event to handle the clicking on the button or text.
   *
   * @param {object} event The event object.
   */
  const handleClickEvent = (event) => {
    if (onClick) onClick(event);
  };

  /**
   * Method to get the required icon.
   *
   * @returns {JSX.Element} The required icon element.
   */
  const getIcon = () => {
    switch (variant) {
      case "zoom":
        return <MyLocationIcon />;

      case "addList":
      case "existingList":
        return <PlaylistAddIcon />;

      case "more":
        return <MoreVertIcon />;

      case "divide":
        return <CallSplitIcon />;

      case "merge":
        return <CallMergeIcon />;

      case "unassign":
        return <UnassignEsuIcon />;

      case "assign":
        return <InsightsIcon />;

      case "createStreet":
        return <AddStreetIcon />;

      case "deleteAsd":
      case "deleteClassification":
      case "deleteOrganisation":
      case "deleteSuccessorCrossRef":
      case "deleteProvenance":
      case "deleteCrossReference":
      case "deleteWizard":
        return <DeleteIcon />;

      case "mergeExtent":
        if (selectionCount === 1) return <StraightIcon />;
        else return <MergeIcon />;

      case "approved":
        return <CheckIcon />;

      case "moveBlpu":
        return <MoveIcon />;

      case "addNote":
        return <NoteAddIcon />;

      case "rpc":
        return <PushPinIcon />;

      case "createList":
        return <ReorderIcon />;

      default:
        break;
    }
  };

  /**
   * Method to get the tooltip title.
   *
   * @returns {string} The tooltip title.
   */
  const getTitle = () => {
    switch (variant) {
      case "zoom":
        return "Zoom to this";

      case "addList":
        return "Add to list";

      case "more":
        return "More actions";

      case "divide":
        return "Divide ESU";

      case "merge":
        return "Merge ESUs";

      case "unassign":
        if (selectionCount === 1) return "Unassign selected ESU from this street";
        else return "Unassign selected ESUs from this street";

      case "assign":
        if (selectionCount === 1) return "Assign selected ESU to this street";
        else return "Assign selected ESUs to this street";

      case "createStreet":
        if (selectionCount === 1) return "Create street from selected ESU";
        else return "Create street from selected ESUs";

      case "deleteAsd":
        return `Delete ASD record${selectionCount === 1 ? "" : "s"}`;

      case "deleteClassification":
        return `Delete classification record${selectionCount === 1 ? "" : "s"}`;

      case "deleteOrganisation":
        return `Delete organisation record${selectionCount === 1 ? "" : "s"}`;

      case "deleteSuccessorCrossRef":
        return `Delete successor cross reference record${selectionCount === 1 ? "" : "s"}`;

      case "deleteProvenance":
        return `Delete BLPU provenance record${selectionCount === 1 ? "" : "s"}`;

      case "mergeExtent":
        if (selectionCount === 1) return "Use selected feature for extent";
        else return "Merge selected features and use for extent";

      case "deleteCrossReference":
        return `Delete cross reference record${selectionCount === 1 ? "" : "s"}`;

      case "deleteWizard":
        return `Delete address${selectionCount === 1 ? "" : "es"}`;

      case "approved":
        return "Set to approved";

      case "moveBlpu":
        return `Move BLPU${selectionCount > 1 ? "s" : ""}`;

      case "addNote":
        return `Add note record${selectionCount === 1 ? "" : "s"}`;

      case "rpc":
        return `Edit RPC for propert${selectionCount === 1 ? "y" : "ies"}`;

      case "createList":
        return "Create a new list";

      case "existingList":
        return "Add to existing list";

      default:
        break;
    }
  };

  /**
   * Method to get the button text.
   *
   * @returns {string} The button text.
   */
  const getButtonText = () => {
    switch (variant) {
      case "zoom":
        return "Zoom to this";

      case "addList":
        return "Add to list";

      case "more":
        return "More";

      case "divide":
        return "Divide";

      case "merge":
        return "Merge";

      case "unassign":
        return "Unassign";

      case "assign":
        return "Assign";

      case "createStreet":
        return "Create street";

      case "deleteAsd":
      case "deleteClassification":
      case "deleteOrganisation":
      case "deleteSuccessorCrossRef":
      case "deleteProvenance":
      case "deleteCrossReference":
      case "deleteWizard":
        return "Delete";

      case "mergeExtent":
        if (selectionCount === 1) return "Use";
        else return "Merge & use";

      case "approved":
        return "Set approved";

      case "moveBlpu":
        return "Move";

      case "addNote":
        return "Add note";

      case "rpc":
        return "Edit RPC";

      case "createList":
        return "Create list";

      case "existingList":
        return "Add to existing list";

      default:
        break;
    }
  };

  /**
   * Method to get the style to be used on the icon.
   *
   * @returns {object} The style to be used for the icon.
   */
  const getIconStyle = () => {
    if (isDisabled) {
      return { color: adsLightGreyB };
    } else if (isSelected) {
      return {
        backgroundColor: adsBlueA,
        color: adsWhite,
        "&:hover": {
          color: adsLightBlue,
        },
      };
    } else {
      return {
        color: adsMidGreyA,
        "&:hover": {
          color: adsBlueA,
        },
      };
    }
  };

  return (
    <Tooltip title={isDisabled ? "" : getTitle()} placement="bottom" sx={tooltipStyle}>
      {menuControlId ? (
        <Button
          id={`${getButtonText().toLowerCase().replace(" ", "-")}-selection-button`}
          sx={getIconStyle()}
          variant="text"
          aria-controls={menuControlId}
          aria-haspopup="true"
          disabled={isDisabled}
          startIcon={getIcon()}
          onClick={handleClickEvent}
        >
          <Typography noWrap variant="body2" sx={{ textTransform: "none" }}>
            {getButtonText()}
          </Typography>
        </Button>
      ) : (
        <Button
          id={`${getButtonText().toLowerCase().replace(" ", "-")}-selection-button`}
          sx={getIconStyle()}
          variant="text"
          disabled={isDisabled}
          startIcon={getIcon()}
          onClick={handleClickEvent}
        >
          <Typography noWrap variant="body2" sx={{ textTransform: "none" }}>
            {getButtonText()}
          </Typography>
        </Button>
      )}
    </Tooltip>
  );
}

export default ADSSelectionButton;
