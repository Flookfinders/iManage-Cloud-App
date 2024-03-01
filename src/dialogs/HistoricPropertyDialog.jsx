/* #region header */
/**************************************************************************************************
//
//  Description: Historic Property Warning dialog
//
//  Copyright:    © 2023 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   05.04.23 Sean Flook         WI40596 Initial version.
//    002   06.10.23 Sean Flook                 Use colour variables.
//    003   24.11.23 Sean Flook                 Moved Stack to @mui/system.
//    004   05.01.24 Sean Flook                 Use CSS shortcuts.
//    005   09.02.24 Sean Flook                 Modified after UX review.
//    006   27.02.24 Sean Flook           MUL15 Changed to use dialogTitleStyle.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React from "react";
import PropTypes from "prop-types";

import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from "@mui/material";
import { Stack } from "@mui/system";

import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import CancelIcon from "@mui/icons-material/Cancel";
import ADSActionButton from "../components/ADSActionButton";

import { blueButtonStyle, whiteButtonStyle, dialogTitleStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

HistoricPropertyDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

function HistoricPropertyDialog({ open, onClose }) {
  const theme = useTheme();

  /**
   * Event to handle when the continue to open button is clicked.
   */
  const handleOk = () => {
    onClose("continue");
  };

  /**
   * Event to handle when the cancel button is clicked.
   */
  const handleCancel = () => {
    onClose("cancel");
  };

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      aria-labelledby="confirmation-dialog-title"
      sx={{ p: "16px 16px 24px 16px", borderRadius: "9px" }}
      onClose={handleCancel}
    >
      <DialogTitle id="confirmation-dialog-title" sx={dialogTitleStyle}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ fontWeight: 600 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Warning: editable historic record
          </Typography>
          <ADSActionButton
            variant="close"
            tooltipTitle="Cancel open"
            tooltipPlacement="bottom"
            onClick={handleCancel}
          />
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: theme.palette.background.paper }}>
        <Stack direction="column" alignItems="flex-start" justifyContent="center" spacing={1}>
          <Typography variant="body1">This is historic, but is still editable.</Typography>
          <Typography variant="body1">Changes made will affect the historical data.</Typography>
          <Typography variant="body1">Proceed with caution.</Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "flex-start", pl: "24px", pb: "24px" }}>
        <Button variant="contained" autoFocus sx={blueButtonStyle} onClick={handleOk} startIcon={<ArrowRightIcon />}>
          Continue to open
        </Button>
        <Button variant="contained" autoFocus sx={whiteButtonStyle} onClick={handleCancel} startIcon={<CancelIcon />}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default HistoricPropertyDialog;
