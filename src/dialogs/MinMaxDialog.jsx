/* #region header */
/**************************************************************************************************
//
//  Description: Min max dialog
//
//  Copyright:    © 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//#region Version 1.0.0.0 changes
//    001            Sean Flook                  Initial Revision.
//    002   06.10.23 Sean Flook                  Use colour variables.
//    003   05.01.24 Sean Flook                  Use CSS shortcuts.
//    004   10.01.24 Sean Flook                  Fix warnings.
//    005   27.02.24 Sean Flook            MUL15 Fixed dialog title styling.
//    006   27.03.24 Sean Flook                  Added ADSDialogTitle.
//#endregion Version 1.0.0.0 changes
//#region Version 1.0.1.0 changes
//    007   08.10.24 Sean Flook        IMANN-986 Added new error parameter.
//#endregion Version 1.0.1.0 changes
//#region Version 1.0.5.0 changes
//    008   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//#endregion Version 1.0.5.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import { Dialog, DialogActions, DialogContent, Typography, Grid2, TextField, Button } from "@mui/material";
import ADSDialogTitle from "../components/ADSDialogTitle";

import CloseIcon from "@mui/icons-material/Close";
import WidthFullIcon from "@mui/icons-material/WidthFull";
import WidthNormalIcon from "@mui/icons-material/WidthNormal";
import DoneIcon from "@mui/icons-material/Done";

import { blueButtonStyle, whiteButtonStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

MinMaxDialog.propTypes = {
  variant: PropTypes.oneOf(["usrn", "uprn", "esu", "scale"]).isRequired,
  minValue: PropTypes.number.isRequired,
  maxValue: PropTypes.number.isRequired,
  maximum: PropTypes.number.isRequired,
  error: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  onNewMinMax: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

function MinMaxDialog({ variant, minValue, maxValue, maximum, error, isOpen, onNewMinMax, onClose }) {
  const theme = useTheme();

  const [showDialog, setShowDialog] = useState(false);
  const [minMaxType, setMinMaxType] = useState("unknown");
  const [newMin, setNewMin] = useState(null);
  const [newMax, setNewMax] = useState(null);

  /**
   * Event to handle when the dialog is closing.
   *
   * @param {object} event The event object.
   * @param {string} reason The reason why the dialog is closing.
   */
  const handleDialogClose = (event, reason) => {
    event.stopPropagation();
    if (reason === "escapeKeyDown") handleCancelClick();
  };

  /**
   * Event to handle when the full range button is clicked.
   */
  const handleFullRangeClick = () => {
    if (onNewMinMax) onNewMinMax({ variant: variant, min: Number(newMin), max: Number(newMax), type: "full" });
  };

  /**
   * Event to handle when the new range button is clicked.
   */
  const handleNewRangeClick = () => {
    if (onNewMinMax) onNewMinMax({ variant: variant, min: Number(newMin), max: Number(newMax), type: "new" });
  };

  /**
   * Event to handle when the done button is clicked.
   */
  const handleDoneClick = () => {
    if (onNewMinMax) onNewMinMax({ variant: variant, min: Number(newMin), max: Number(newMax), type: "done" });
  };

  /**
   * Event to handle when the cancel button is clicked.
   */
  const handleCancelClick = () => {
    if (onClose) onClose();
    else setShowDialog(false);
  };

  /**
   * Event to handle when the minimum value changes.
   *
   * @param {object} event The event object.
   */
  const onMinChangeEvent = (event) => {
    setNewMin(event.target.value);
  };

  /**
   * Event to handle when the maximum value changes.
   *
   * @param {object} event The event object.
   */
  const onMaxChangeEvent = (event) => {
    setNewMax(event.target.value);
  };

  useEffect(() => {
    setNewMin(minValue ? Number(minValue) : 0);
    setNewMax(maxValue ? Number(maxValue) : 0);
  }, [minValue, maxValue]);

  useEffect(() => {
    switch (variant) {
      case "usrn":
        setMinMaxType("USRN");
        break;

      case "uprn":
        setMinMaxType("UPRN");
        break;

      case "esu":
        setMinMaxType("ESU");
        break;

      case "scale":
        setMinMaxType("Scale");
        break;

      default:
        setMinMaxType("Unknown");
        break;
    }

    setShowDialog(isOpen);
  }, [variant, isOpen]);

  return (
    <Dialog open={showDialog} aria-labelledby="add-lookup-dialog" fullWidth maxWidth="xs" onClose={handleDialogClose}>
      <ADSDialogTitle
        title={`Update available ${minMaxType} range`}
        closeTooltip="Cancel"
        onClose={handleCancelClick}
      />
      <DialogContent sx={{ mt: theme.spacing(2) }}>
        <Grid2 container alignItems="center" rowSpacing={2}>
          <Grid2 size={4}>
            <Typography variant="body1" align="right" gutterBottom>
              Minimum
            </Typography>
          </Grid2>
          <Grid2 size={8}>
            <TextField
              id={`${minMaxType.toLowerCase().replaceAll(" ", "-")}-min-control`}
              type="number"
              fullWidth
              required
              variant="outlined"
              margin="dense"
              size="small"
              value={newMin}
              sx={{
                color: theme.palette.background.contrastText,
                pl: theme.spacing(1),
                pr: theme.spacing(1),
              }}
              onChange={onMinChangeEvent}
              slotProps={{
                htmlInput: { max: `${maximum}` },
              }}
            />
          </Grid2>
          <Grid2 size={4}>
            <Typography variant="body1" align="right" gutterBottom>
              Maximum
            </Typography>
          </Grid2>
          <Grid2 size={8}>
            <TextField
              id={`${minMaxType.toLowerCase().replaceAll(" ", "-")}-max-control`}
              type="number"
              fullWidth
              required
              variant="outlined"
              margin="dense"
              size="small"
              value={newMax}
              sx={{
                color: theme.palette.background.contrastText,
                pl: theme.spacing(1),
                pr: theme.spacing(1),
              }}
              onChange={onMaxChangeEvent}
              slotProps={{
                htmlInput: { max: `${maximum}` },
              }}
            />
          </Grid2>
          {error && (
            <Grid2 size={12}>
              <Typography variant="body1" align="left" color="error" gutterBottom>
                {error}
              </Typography>
            </Grid2>
          )}
        </Grid2>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "flex-start", mb: theme.spacing(1), ml: theme.spacing(3) }}>
        {variant !== "scale" && (
          <Button
            onClick={handleFullRangeClick}
            autoFocus
            variant="contained"
            sx={blueButtonStyle}
            startIcon={<WidthFullIcon />}
          >
            Full range
          </Button>
        )}
        {variant !== "scale" && (
          <Button
            onClick={handleNewRangeClick}
            autoFocus
            variant="contained"
            sx={blueButtonStyle}
            startIcon={<WidthNormalIcon />}
          >
            New range
          </Button>
        )}
        {variant === "scale" && (
          <Button onClick={handleDoneClick} autoFocus variant="contained" sx={blueButtonStyle} startIcon={<DoneIcon />}>
            Done
          </Button>
        )}
        <Button
          onClick={handleCancelClick}
          autoFocus
          variant="contained"
          sx={whiteButtonStyle}
          startIcon={<CloseIcon />}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default MinMaxDialog;
