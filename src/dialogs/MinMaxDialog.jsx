/* #region header */
/**************************************************************************************************
//
//  Description: Min max dialog
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001            Sean Flook                 Initial Revision.
//    002   06.10.23 Sean Flook                 Use colour variables.
//    003   05.01.24 Sean Flook                 Use CSS shortcuts.
//    004   10.01.24 Sean Flook                 Fix warnings.
//    005   27.02.24 Sean Flook           MUL15 Fixed dialog title styling.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Grid,
  TextField,
  Button,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import WidthFullIcon from "@mui/icons-material/WidthFull";
import WidthNormalIcon from "@mui/icons-material/WidthNormal";
import DoneIcon from "@mui/icons-material/Done";

import { blueButtonStyle, whiteButtonStyle, dialogTitleStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

MinMaxDialog.propTypes = {
  variant: PropTypes.oneOf(["usrn", "uprn", "esu", "scale"]).isRequired,
  minValue: PropTypes.number.isRequired,
  maxValue: PropTypes.number.isRequired,
  maximum: PropTypes.number.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onNewMinMax: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

function MinMaxDialog({ variant, minValue, maxValue, maximum, isOpen, onNewMinMax, onClose }) {
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
      <DialogTitle id="add-lookup-dialog" sx={dialogTitleStyle}>
        <Typography sx={{ fontSize: "20px" }}>{`Update available ${minMaxType} range`}</Typography>
        <IconButton
          aria-label="close"
          onClick={handleCancelClick}
          sx={{ position: "absolute", right: 12, top: 12, color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ mt: theme.spacing(2) }}>
        <Grid container alignItems="center" rowSpacing={2}>
          <Grid item xs={4}>
            <Typography variant="body1" align="right" gutterBottom>
              Minimum
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <TextField
              id={`${minMaxType.toLowerCase().replaceAll(" ", "-")}-min-control`}
              type="number"
              fullWidth
              required
              variant="outlined"
              margin="dense"
              size="small"
              inputProps={{ max: `${maximum}` }}
              value={newMin}
              sx={{
                color: theme.palette.background.contrastText,
                pl: theme.spacing(1),
                pr: theme.spacing(1),
              }}
              onChange={onMinChangeEvent}
            />
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body1" align="right" gutterBottom>
              Maximum
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <TextField
              id={`${minMaxType.toLowerCase().replaceAll(" ", "-")}-max-control`}
              type="number"
              fullWidth
              required
              variant="outlined"
              margin="dense"
              size="small"
              inputProps={{ max: `${maximum}` }}
              value={newMax}
              sx={{
                color: theme.palette.background.contrastText,
                pl: theme.spacing(1),
                pr: theme.spacing(1),
              }}
              onChange={onMaxChangeEvent}
            />
          </Grid>
        </Grid>
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
