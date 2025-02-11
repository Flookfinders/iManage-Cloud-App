//#region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Confirm edit loss dialog
//
//  Copyright:   © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0
//    001            Sean Flook                 Initial Revision.
//    002   06.10.23 Sean Flook                 Use colour variables.
//    003   24.11.23 Sean Flook                 Moved Box to @mui/system.
//    004   24.06.24 Sean Flook       IMANN-170 Changes required for cascading parent PAO changes to children.
//    005   28.06.24 Sean Flook       IMANN-170 Fixed warning.
//#endregion Version 1.0.0.0
//
//--------------------------------------------------------------------------------------------------
//#endregion header

import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";

import {
  Button,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { Box } from "@mui/system";

import CircleIcon from "@mui/icons-material/Circle";
import SaveIcon from "@mui/icons-material/Save";
import DiscardIcon from "@mui/icons-material/SettingsBackupRestoreOutlined";
import CloseIcon from "@mui/icons-material/Close";

import { adsBlueA, adsWhite, adsLightBlue } from "../utils/ADSColours";

ConfirmEditLossDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  associatedRecords: PropTypes.array,
  paoChanged: PropTypes.bool,
  cascadeChanges: PropTypes.bool,
  saveText: PropTypes.string,
  disposeText: PropTypes.string,
  handleCascadeChange: PropTypes.func,
  handleSaveClick: PropTypes.func.isRequired,
  handleDisposeClick: PropTypes.func.isRequired,
  handleReturnClick: PropTypes.func.isRequired,
};

ConfirmEditLossDialog.defaultProps = {
  saveText: "Save",
  disposeText: "Discard",
};

function ConfirmEditLossDialog({
  isOpen,
  title,
  message,
  associatedRecords,
  paoChanged,
  cascadeChanges,
  saveText,
  disposeText,
  handleCascadeChange,
  handleSaveClick,
  handleDisposeClick,
  handleReturnClick,
}) {
  const [content, setContent] = useState(null);
  const maxContentHeight = "240px";

  const updateCascadeChanges = useCallback(() => {
    if (handleCascadeChange) handleCascadeChange();
  }, [handleCascadeChange]);

  useEffect(() => {
    setContent(
      <Box sx={{ maxHeight: maxContentHeight }}>
        <Typography variant="body1">{message}</Typography>
        {associatedRecords &&
          associatedRecords.length > 0 &&
          associatedRecords.map((rec, index) => (
            <List dense key={`unsaved_${rec}_${index}`}>
              <ListItem>
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary={`${rec} record`} />
              </ListItem>
            </List>
          ))}
        {paoChanged && (
          <FormControlLabel
            control={<Checkbox checked={cascadeChanges} onChange={updateCascadeChanges} />}
            label={"PAO details have been changed, do you want the child records to also be updated?"}
            labelPlacement="start"
          />
        )}
      </Box>
    );
  }, [message, associatedRecords, paoChanged, cascadeChanges, updateCascadeChanges]);

  return (
    <Dialog open={isOpen} aria-labelledby="confirm-edit-loss-dialog" fullWidth maxWidth="xs">
      <DialogTitle id="confirm-edit-loss-dialog">{title ? title : "Unsaved changes"}</DialogTitle>
      <DialogContent>{content}</DialogContent>
      <DialogActions sx={{ justifyContent: "flex-start", pl: "24px", mb: "12px" }}>
        <Button
          onClick={handleSaveClick}
          autoFocus
          variant="contained"
          sx={{
            color: adsWhite,
            backgroundColor: adsBlueA,
            "&:hover": {
              backgroundColor: adsLightBlue,
              color: adsWhite,
            },
          }}
          startIcon={<SaveIcon />}
        >
          {saveText}
        </Button>
        <Button
          onClick={handleDisposeClick}
          sx={{
            color: adsBlueA,
            "&:hover": {
              backgroundColor: adsLightBlue,
              color: adsWhite,
            },
          }}
          startIcon={<DiscardIcon />}
        >
          {disposeText}
        </Button>
        <Button
          onClick={handleReturnClick}
          sx={{
            color: adsBlueA,
            "&:hover": {
              backgroundColor: adsLightBlue,
              color: adsWhite,
            },
          }}
          startIcon={<CloseIcon />}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmEditLossDialog;
