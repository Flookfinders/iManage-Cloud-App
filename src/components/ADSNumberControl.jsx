/* #region header */
/**************************************************************************************************
//
//  Description: Number component
//
//  Copyright:    © 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//#region Version 1.0.0.0 changes
//    001   13.04.21 Sean Flook          WI39345 Initial Revision.
//    002   05.05.21 Sean Flook          WI39345 Tweaks to the UI after design review meeting.
//    003   14.05.21 Sean Flook          WI39345 Updated className.
//    004   20.05.21 Sean Flook          WI39345 Display a tooltip if required.
//    005   25.05.21 Sean Flook          WI39345 Include required field text if required to tooltip.
//    006   08.06.21 Sean Flook          WI39345 Changed read-only version to a label and altered colour of outline.
//    007   27.06.23 Sean Flook          WI40729 Correctly handle if errorText is a string rather then an array.
//    008   10.08.23 Sean Flook                  Ensure we return a number from the control.
//    009   24.11.23 Sean Flook                  Moved Box to @mui/system.
//    010   11.01.24 Sean Flook                  Fix warnings.
//    011   19.06.24 Joshua McCormick  IMANN-503 BLPU Level field max characters 30, code cleanup, max char logic
//    012   19.06.24 Joshua McCormick  IMANN-503 option to remove type number from textfield to remove up down
//    013   19.06.24 Joshua McCormick  IMANN-503 Removed textfield changes, maximum change working
//    014   19.06.24 Joshua McCormick  IMANN-503 handleNumberChangeEvent change to allow for 99.9 maximum
//    015   20.06.24 Sean Flook        IMANN-633 Allow numbers to be removed.
//#endregion Version 1.0.0.0 changes
//#region Version 1.0.1.0 changes
//    016   31.10.24 Sean Flook       IMANN-1012 Fix the height of the skeleton controls.
//#endregion Version 1.0.1.0 changes
//#region Version 1.0.5.0 changes
//    017   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//#endregion Version 1.0.5.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */
import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Grid2, TextField, Typography, Tooltip, Skeleton } from "@mui/material";
import { Box } from "@mui/system";
import ADSErrorDisplay from "./ADSErrorDisplay";
import {
  FormBoxRowStyle,
  FormRowStyle,
  FormInputStyle,
  controlLabelStyle,
  tooltipStyle,
  skeletonHeight,
} from "../utils/ADSStyles";
/* #endregion imports */

ADSNumberControl.propTypes = {
  label: PropTypes.string.isRequired,
  isEditable: PropTypes.bool,
  isRequired: PropTypes.bool,
  loading: PropTypes.bool,
  helperText: PropTypes.string,
  maximum: PropTypes.number,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
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
    const newValue = Number(event.target.value);
    if (!event.target.value || !maximum || newValue <= maximum) {
      onChange(newValue);
    }
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
      <Grid2 container justifyContent="flex-start" alignItems="center" sx={FormRowStyle(hasError.current)}>
        <Grid2 size={3}>
          <Typography
            id={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
            variant="body2"
            align="left"
            sx={controlLabelStyle}
          >
            {`${label}${isRequired ? "*" : ""}`}
          </Typography>
        </Grid2>
        <Grid2 size={9}>
          {loading ? (
            <Skeleton variant="rectangular" animation="wave" height={`${skeletonHeight}px`} width="100%" />
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
                  value={value}
                  onChange={handleNumberChangeEvent}
                  aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
                  slotProps={{
                    htmlInput: { max: `${maximum}` },
                  }}
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
              size="small"
              value={value}
              onChange={handleNumberChangeEvent}
              aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
              slotProps={{
                htmlInput: { max: `${maximum}` },
              }}
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
        </Grid2>
        <ADSErrorDisplay errorText={displayError} id={`${label.toLowerCase().replaceAll(" ", "-")}-number-error`} />
      </Grid2>
    </Box>
  );
}

export default ADSNumberControl;
