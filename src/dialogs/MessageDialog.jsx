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
//    007   13.02.24 Sean Flook                 Added cancelASDInexact.
//    008   27.02.24 Sean Flook           MUL15 Fixed dialog title styling.
//    009   12.03.24 Sean Flook            MUL7 Updated for cancelMoveBlpu.
//    010   27.03.24 Sean Flook                 Added ADSDialogTitle.
//    011   04.04.24 Sean Flook                 Added cascadeLogicalStatus.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React from "react";
import PropTypes from "prop-types";

import { Button, Typography, Dialog, DialogActions, DialogContent, Tooltip } from "@mui/material";
import { Stack } from "@mui/system";
import ADSDialogTitle from "../components/ADSDialogTitle";

import CloseIcon from "@mui/icons-material/Close";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import SaveIcon from "@mui/icons-material/Save";

import { blueButtonStyle, whiteButtonStyle, tooltipStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

MessageDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  variant: PropTypes.oneOf([
    "cancelWizard",
    "cancelMoveBlpu",
    "cancelASDPartRoad",
    "cancelASDInexact",
    "cascadeLogicalStatus",
  ]).isRequired,
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
   * Event to handle when the save button is clicked
   */
  const handleSaveClick = () => {
    if (onClose) onClose("save");
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
        return " Unsaved Changes Warning";

      case "cancelASDPartRoad":
        return "Whole road";

      case "cancelASDInexact":
        return "Exact match to street";

      case "cascadeLogicalStatus":
        return "Logical status change";

      default:
        return `Unknown variant: ${variant}`;
    }
  };

  /**
   * Method to get the title close button tooltip.
   *
   * @returns {string} The title of the tooltip.
   */
  const getTooltipText = () => {
    switch (variant) {
      case "cancelASDPartRoad":
      case "cancelASDInexact":
      case "cascadeLogicalStatus":
        return "Cancel change";

      default:
        return "Cancel exiting";
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
            You have unsaved changes. Exiting now will discard them. What would you like to do?
          </Typography>
        );

      case "cancelASDPartRoad":
        return (
          <Stack direction="column" justifyContent="center" alignItems="flex-start" spacing={1}>
            <Typography variant="body2">Toggling back to 'Whole Road' will reset the geometry.</Typography>
            <Typography variant="body2">Are you sure you want to continue?</Typography>
          </Stack>
        );

      case "cancelASDInexact":
        return (
          <Stack direction="column" justifyContent="center" alignItems="flex-start" spacing={1}>
            <Typography variant="body2">Toggling back to 'Exact' will reset the geometry.</Typography>
            <Typography variant="body2">Are you sure you want to continue?</Typography>
          </Stack>
        );

      case "cascadeLogicalStatus":
        return (
          <Stack direction="column" justifyContent="center" alignItems="flex-start" spacing={1}>
            <Typography variant="body2">
              This is a parent property so changing the logical status will also change the children's logical status.
            </Typography>
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
        return (
          <>
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
          </>
        );

      case "cancelMoveBlpu":
        return (
          <>
            <Tooltip title="Save changes and exit" sx={tooltipStyle}>
              <Button
                variant="contained"
                onClick={handleSaveClick}
                autoFocus
                sx={blueButtonStyle}
                startIcon={<SaveIcon />}
              >
                Save and exit
              </Button>
            </Tooltip>
            <Tooltip title="Discard changes and exit" sx={tooltipStyle}>
              <Button variant="contained" onClick={handleCloseClick} sx={whiteButtonStyle} startIcon={<CloseIcon />}>
                Discard and exit
              </Button>
            </Tooltip>
            <Tooltip title="Continue editing seed points" sx={tooltipStyle}>
              <Button
                variant="contained"
                onClick={handleContinueClick}
                sx={whiteButtonStyle}
                startIcon={<ArrowRightIcon />}
              >
                Continue editing
              </Button>
            </Tooltip>
          </>
        );

      case "cancelASDPartRoad":
      case "cancelASDInexact":
      case "cascadeLogicalStatus":
        return (
          <>
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
          </>
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
    <Dialog open={isOpen} aria-labelledby="message-dialog" fullWidth maxWidth="sm" onClose={handleContinueClick}>
      <ADSDialogTitle title={getDialogTitle()} closeTooltip={getTooltipText()} onClose={handleContinueClick} />
      <DialogContent sx={{ mt: theme.spacing(2) }}>{getDialogContent()}</DialogContent>
      <DialogActions sx={{ justifyContent: "flex-start", mb: theme.spacing(1), ml: theme.spacing(2.25) }}>
        {getDialogActions()}
      </DialogActions>
    </Dialog>
  );
}

export default MessageDialog;
