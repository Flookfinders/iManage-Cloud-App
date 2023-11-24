/* #region header */
/**************************************************************************************************
//
//  Description: Confirm edit loss dialog
//
//  Copyright:    � 2021 - 2023 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001            Sean Flook                 Initial Revision.
//    002   06.10.23 Sean Flook                 Use colour variables.
//    003   24.11.23 Sean Flook                 Moved Box to @mui/system.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */

import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { Box } from "@mui/system";

import CircleIcon from "@mui/icons-material/Circle";
import SaveIcon from "@mui/icons-material/Save";
import DiscardIcon from "@mui/icons-material/SettingsBackupRestoreOutlined";
import CloseIcon from "@mui/icons-material/Close";

import { adsBlueA, adsWhite, adsLightBlue } from "../utils/ADSColours";

/* #endregion imports */

ConfirmEditLossDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  associatedRecords: PropTypes.array,
  saveText: PropTypes.string,
  disposeText: PropTypes.string,
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
  saveText,
  disposeText,
  handleSaveClick,
  handleDisposeClick,
  handleReturnClick,
}) {
  const [content, setContent] = useState(null);
  const maxContentHeight = "240px";

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
      </Box>
    );
  }, [message, associatedRecords]);

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
