/* #region header */
/**************************************************************************************************
//
//  Description: Number component
//
//  Copyright:    © 2021 - 2023 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   13.04.21 Sean Flook         WI39345 Initial Revision.
//    002   05.05.21 Sean Flook         WI39345 Tweaks to the UI after design review meeting.
//    003   14.05.21 Sean Flook         WI39345 Updated className.
//    004   20.05.21 Sean Flook         WI39345 Display a tooltip if required.
//    005   25.05.21 Sean Flook         WI39345 Include required field text if required to tooltip.
//    006   08.06.21 Sean Flook         WI39345 Changed read-only version to a label and altered colour of outline.
//    007   27.06.23 Sean Flook         WI40729 Correctly handle if errorText is a string rather then an array.
//    008   10.08.23 Sean Flook                 Ensure we return a number from the control.
//    009   24.11.23 Sean Flook                 Moved Box to @mui/system.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */
import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Grid, TextField, Typography, Tooltip, Skeleton } from "@mui/material";
import { Box } from "@mui/system";
import ADSErrorDisplay from "./ADSErrorDisplay";
import { FormBoxRowStyle, FormRowStyle, FormInputStyle, controlLabelStyle, tooltipStyle } from "../utils/ADSStyles";
/* #endregion imports */

ADSNumberControl.propTypes = {
  label: PropTypes.string.isRequired,
  isEditable: PropTypes.bool,
  isRequired: PropTypes.bool,
  loading: PropTypes.bool,
  helperText: PropTypes.string,
  maximum: PropTypes.number,
  value: PropTypes.number,
  errorText: PropTypes.array,
  onChange: PropTypes.func.isRequired,
};

ADSNumberControl.defaultProps = {
  isEditable: false,
  isRequired: false,
  loading: false,
};

function ADSNumberControl({ label, isEditable, isRequired, loading, helperText, maximum, value, errorText, onChange }) {
  const [displayError, setDisplayError] = useState("");

  const hasError = useRef(false);

  /**
   * Event to handle when the number changes.
   *
   * @param {object} event The event object.
   */
  const handleNumberChangeEvent = (event) => {
    if (onChange) onChange(Number(event.target.value));
  };

  useEffect(() => {
    hasError.current = errorText && errorText.length > 0;

    if (hasError.current) {
      if (Array.isArray(errorText)) setDisplayError(errorText.join(", "));
      else setDisplayError(errorText);
    } else setDisplayError(null);
  }, [errorText]);

  return (
    <Box sx={FormBoxRowStyle(hasError.current)}>
      <Grid container justifyContent="flex-start" alignItems="center" sx={FormRowStyle(hasError.current)}>
        <Grid item xs={3}>
          <Typography
            id={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
            variant="body2"
            align="left"
            sx={controlLabelStyle}
          >
            {`${label}${isRequired ? "*" : ""}`}
          </Typography>
        </Grid>
        <Grid item xs={9}>
          {loading ? (
            <Skeleton variant="rectangular" animation="wave" height="60px" width="100%" />
          ) : helperText && helperText.length > 0 ? (
            <Tooltip
              title={isRequired ? helperText + " This is a required field." : helperText}
              arrow
              placement="right"
              sx={tooltipStyle}
            >
              {maximum && maximum > 0 ? (
                <TextField
                  id={`${label.toLowerCase().replaceAll(" ", "-")}-number-control`}
                  sx={FormInputStyle(hasError.current)}
                  type="number"
                  error={hasError.current}
                  fullWidth
                  disabled={!isEditable}
                  required={isRequired}
                  variant="outlined"
                  margin="dense"
                  size="small"
                  inputProps={{ max: `${maximum}` }}
                  value={value}
                  onChange={handleNumberChangeEvent}
                  aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
                />
              ) : (
                <TextField
                  id={`${label.toLowerCase().replaceAll(" ", "-")}-number-control`}
                  sx={FormInputStyle(hasError.current)}
                  type="number"
                  error={hasError.current}
                  fullWidth
                  disabled={!isEditable}
                  required={isRequired}
                  variant="outlined"
                  margin="dense"
                  size="small"
                  value={value}
                  onChange={handleNumberChangeEvent}
                  aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
                />
              )}
            </Tooltip>
          ) : maximum && maximum > 0 ? (
            <TextField
              id={`${label.toLowerCase().replaceAll(" ", "-")}-number-control`}
              sx={FormInputStyle(hasError.current)}
              type="number"
              error={hasError.current}
              fullWidth
              disabled={!isEditable}
              required={isRequired}
              variant="outlined"
              margin="dense"
              inputProps={{ max: `${maximum}` }}
              size="small"
              value={value}
              onChange={handleNumberChangeEvent}
              aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
            />
          ) : (
            <TextField
              id={`${label.toLowerCase().replaceAll(" ", "-")}-number-control`}
              sx={FormInputStyle(hasError.current)}
              type="number"
              error={hasError.current}
              fullWidth
              disabled={!isEditable}
              required={isRequired}
              variant="outlined"
              margin="dense"
              size="small"
              value={value}
              onChange={handleNumberChangeEvent}
              aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
            />
          )}
        </Grid>
        <ADSErrorDisplay errorText={displayError} id={`${label.toLowerCase().replaceAll(" ", "-")}-number-error`} />
      </Grid>
    </Box>
  );
}

export default ADSNumberControl;
