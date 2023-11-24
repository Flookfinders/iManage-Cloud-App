//#region header */
/**************************************************************************************************
//
//  Description: Dialog used when properties are selected from the map.
//
//  Copyright:    © 2023 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   01.11.23 Sean Flook       IMANN-175 Initial version.
//    002   24.11.23 Sean Flook                 Moved Stack to @mui/system.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from "@mui/material";
import { Stack } from "@mui/system";
import ADSActionButton from "../components/ADSActionButton";

import NewListIcon from "@mui/icons-material/Reorder";
import ExistingListIcon from "@mui/icons-material/PlaylistAdd";
import CloseIcon from "@mui/icons-material/Close";

import { blueButtonStyle, whiteButtonStyle } from "../utils/ADSStyles";
import { adsLightGreyC } from "../utils/ADSColours";
import { useTheme } from "@mui/styles";

SelectPropertiesDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  propertyCount: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
};

function SelectPropertiesDialog({ open, propertyCount, onClose }) {
  const theme = useTheme();

  const [title, setTitle] = useState("properties selected");

  /**
   * Event to handle when the cancel button is clicked.
   */
  const handleCancel = () => {
    onClose("cancel");
  };

  /**
   * Event to handle when the add to new list button is clicked.
   */
  const handleNewList = () => {
    onClose("new");
  };

  /**
   * Event to handle when the add to existing list button is clicked.
   */
  const handleExistingList = () => {
    onClose("existing");
  };

  useEffect(() => {
    if (open) setTitle(`${propertyCount} ${propertyCount === 1 ? "property" : "properties"} selected`);
  }, [open, propertyCount]);

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      aria-labelledby="select-properties-dialog-title"
      sx={{ padding: "16px 16px 24px 16px", borderRadius: "9px" }}
      onClose={handleCancel}
    >
      <DialogTitle
        id="select-properties-dialog-title"
        sx={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: adsLightGreyC, mb: "8px" }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ fontWeight: 600 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <ADSActionButton variant="close" tooltipTitle="Cancel" tooltipPlacement="bottom" onClick={handleCancel} />
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: theme.palette.background.paper }}>
        <Typography variant="body2">
          {`What do you wish to do with ${
            propertyCount === 1 ? "this selected property" : "these selected properties"
          }?`}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "flex-start", pl: "24px", pb: "24px" }}>
        <Button variant="contained" autoFocus onClick={handleNewList} sx={blueButtonStyle} startIcon={<NewListIcon />}>
          Create a new list
        </Button>
        <Button variant="contained" sx={whiteButtonStyle} onClick={handleExistingList} startIcon={<ExistingListIcon />}>
          Add to existing list
        </Button>
        <Button variant="contained" sx={whiteButtonStyle} onClick={handleCancel} startIcon={<CloseIcon />}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SelectPropertiesDialog;
