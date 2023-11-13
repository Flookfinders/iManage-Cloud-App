/* #region header */
/**************************************************************************************************
//
//  Description: Confirm cancelling the property wizard dialog
//
//  Copyright:    © 2023 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   02/11/23 Sean Flook                 Initial Revision.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React from "react";
import PropTypes from "prop-types";

import { Button, Typography, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

import { blueButtonStyle, whiteButtonStyle } from "../utils/ADSStyles";
import { adsLightGreyC } from "../utils/ADSColours";
import { useTheme } from "@mui/styles";

ConfirmWizardCancelDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

function ConfirmWizardCancelDialog({ isOpen, onClose }) {
  const theme = useTheme();

  const handleCancelClick = () => {
    if (onClose) onClose("cancel");
  };

  const handleContinueClick = () => {
    if (onClose) onClose("continue");
  };

  return (
    <Dialog
      open={isOpen}
      aria-labelledby="confirm-wizard-cancel-dialog"
      fullWidth
      maxWidth="xs"
      sx={{ padding: "16px 16px 24px 16px", borderRadius: "9px" }}
      onClose={handleContinueClick}
    >
      <DialogTitle
        id="confirm-wizard-cancel-dialog"
        sx={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: adsLightGreyC, mb: "8px" }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Cancel wizard
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: theme.palette.background.paper }}>
        <Typography variant="body2">This will close the wizard and any changes you have made will be lost.</Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", pl: "24px", mb: "12px" }}>
        <Button
          variant="contained"
          onClick={handleCancelClick}
          autoFocus
          sx={blueButtonStyle}
          startIcon={<CloseIcon />}
        >
          Close
        </Button>
        <Button variant="contained" onClick={handleContinueClick} sx={whiteButtonStyle} startIcon={<ArrowRightIcon />}>
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmWizardCancelDialog;
