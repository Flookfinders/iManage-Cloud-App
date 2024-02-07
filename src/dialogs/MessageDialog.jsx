/* #region header */
/**************************************************************************************************
//
//  Description: Dialog used to display messages
//
//  Copyright:    © 2023 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   03/11/23 Sean Flook                 Initial Revision.
//    002   10.11.23 Sean Flook       IMANN-175 Added Move BLPU.
//    003   20.12.23 Sean Flook       IMANN-152 Added Edit ASD Geometry and Edit ESU Geometry.
//    004   05.01.24 Sean Flook                 Use CSS shortcuts.
//    005   16.01.24 Sean Flook                 Changes required to fix warnings.
//    006   07.02.24 Sean Flook                 Added cancelASDPartRoad and removed editASDGeometry and editESUGeometry.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { Fragment } from "react";
import PropTypes from "prop-types";

import { IconButton, Button, Typography, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { Stack } from "@mui/system";

import CloseIcon from "@mui/icons-material/Close";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

import { blueButtonStyle, whiteButtonStyle } from "../utils/ADSStyles";
import { adsBlueA } from "../utils/ADSColours";
import { useTheme } from "@mui/styles";

MessageDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  variant: PropTypes.oneOf(["cancelWizard", "cancelMoveBlpu", "cancelASDPartRoad"]).isRequired,
  onClose: PropTypes.func.isRequired,
};

function MessageDialog({ isOpen, variant, onClose }) {
  const theme = useTheme();

  /**
   * Event to handle when the continue button is clicked
   */
  const handleContinueClick = () => {
    if (onClose) onClose("continue");
  };

  /**
   * Event to handle when the close button is clicked
   */
  const handleCloseClick = () => {
    if (onClose) onClose("close");
  };

  /**
   * Method to get the title for the dialog.
   *
   * @returns {string} The title of the dialog.
   */
  const getDialogTitle = () => {
    switch (variant) {
      case "cancelWizard":
        return "Cancel wizard";

      case "cancelMoveBlpu":
        return "Cancel move BLPU seed point";

      case "cancelASDPartRoad":
        return "Whole road";

      default:
        return `Unknown variant: ${variant}`;
    }
  };

  /**
   * Method to get the content for the dialog.
   *
   * @returns {JSX.Element} The content of the dialog.
   */
  const getDialogContent = () => {
    switch (variant) {
      case "cancelWizard":
        return (
          <Typography variant="body2">
            This will close the wizard and any changes you have made will be lost.
          </Typography>
        );

      case "cancelMoveBlpu":
        return (
          <Typography variant="body2">
            This will close the move BLPU seed point dialog and any changes you have made will be lost.
          </Typography>
        );

      case "cancelASDPartRoad":
        return (
          <Stack direction="column" justifyContent="center" alignItems="flex-start" spacing={1}>
            <Typography variant="body2">Toggling back to 'Whole Road' will reset the geometry.</Typography>
            <Typography variant="body2">Are you sure you want to continue?</Typography>
          </Stack>
        );

      default:
        return null;
    }
  };

  /**
   * Method to get the actions for the dialog.
   *
   * @returns {JSX.Element} The actions of the dialog.
   */
  const getDialogActions = () => {
    switch (variant) {
      case "cancelWizard":
      case "cancelMoveBlpu":
        return (
          <Fragment>
            <Button
              variant="contained"
              onClick={handleCloseClick}
              autoFocus
              sx={blueButtonStyle}
              startIcon={<CloseIcon />}
            >
              Close
            </Button>
            <Button
              variant="contained"
              onClick={handleContinueClick}
              sx={whiteButtonStyle}
              startIcon={<ArrowRightIcon />}
            >
              Continue
            </Button>
          </Fragment>
        );

      case "cancelASDPartRoad":
        return (
          <Fragment>
            <Button
              variant="contained"
              onClick={handleContinueClick}
              sx={blueButtonStyle}
              startIcon={<ArrowRightIcon />}
            >
              Continue
            </Button>
            <Button
              variant="contained"
              onClick={handleCloseClick}
              autoFocus
              sx={whiteButtonStyle}
              startIcon={<CloseIcon />}
            >
              Cancel
            </Button>
          </Fragment>
        );

      default:
        return (
          <Button
            variant="contained"
            onClick={handleCloseClick}
            autoFocus
            sx={blueButtonStyle}
            startIcon={<CloseIcon />}
          >
            Close
          </Button>
        );
    }
  };

  return (
    <Dialog open={isOpen} aria-labelledby="message-dialog" fullWidth maxWidth="xs" onClose={handleCloseClick}>
      <DialogTitle
        id="message-dialog"
        sx={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: adsBlueA, mb: "8px" }}
      >
        <Typography sx={{ fontSize: "20px", fontWeight: 600 }}>{getDialogTitle()}</Typography>
        <IconButton
          aria-label="close"
          onClick={handleCloseClick}
          sx={{ position: "absolute", right: 12, top: 12, color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ mt: theme.spacing(2) }}>{getDialogContent()}</DialogContent>
      <DialogActions sx={{ justifyContent: "flex-start", mb: theme.spacing(1), ml: theme.spacing(2.25) }}>
        {getDialogActions()}
      </DialogActions>
    </Dialog>
  );
}

export default MessageDialog;
