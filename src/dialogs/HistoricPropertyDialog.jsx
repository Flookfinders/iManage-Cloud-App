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
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React from "react";
import PropTypes from "prop-types";

import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from "@mui/material";
import { Stack } from "@mui/system";

import CloseIcon from "@mui/icons-material/Close";
import ADSActionButton from "../components/ADSActionButton";

import { adsBlueA, adsWhite, adsPaleBlueA, adsLightGreyC } from "../utils/ADSColours";
import { useTheme } from "@mui/styles";

HistoricPropertyDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

function HistoricPropertyDialog({ open, onClose }) {
  const theme = useTheme();

  /**
   * Event to handle when the OK button is clicked.
   */
  const handleOk = () => {
    onClose();
  };

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      aria-labelledby="confirmation-dialog-title"
      sx={{ p: "16px 16px 24px 16px", borderRadius: "9px" }}
      onClose={handleOk}
    >
      <DialogTitle
        id="confirmation-dialog-title"
        sx={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: adsLightGreyC, mb: "8px" }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ fontWeight: 600 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Historic record
          </Typography>
          <ADSActionButton variant="close" tooltipTitle="Close" tooltipPlacement="bottom" onClick={handleOk} />
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: theme.palette.background.paper }}>
        <Typography variant="h6" sx={{ pb: theme.spacing(2) }}>
          This is an historic record and is editable.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "flex-start", pl: "24px", pb: "24px" }}>
        <Button
          variant="contained"
          autoFocus
          sx={{
            color: adsBlueA,
            backgroundColor: adsWhite,
            "&:hover": {
              backgroundColor: adsPaleBlueA,
            },
          }}
          onClick={handleOk}
          startIcon={<CloseIcon />}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default HistoricPropertyDialog;
