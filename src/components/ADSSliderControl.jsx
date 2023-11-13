/* #region header */
/**************************************************************************************************
//
//  Description: Slider component
//
//  Copyright:    © 2021 - 2023 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001            Sean Flook                 Initial Revision.
//    002   27.06.23 Sean Flook         WI40729 Correctly handle if errorText is a string rather then an array.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Typography, Grid, Tooltip, Slider, TextField, Skeleton, Box, Stack } from "@mui/material";
import ADSErrorDisplay from "./ADSErrorDisplay";
import { FormBoxRowStyle, FormRowStyle, controlLabelStyle, tooltipStyle } from "../utils/ADSStyles";

ADSSliderControl.propTypes = {
  label: PropTypes.string.isRequired,
  narrowLabel: PropTypes.bool,
  isEditable: PropTypes.bool,
  isRequired: PropTypes.bool,
  loading: PropTypes.bool,
  includeInput: PropTypes.bool,
  includeLabel: PropTypes.bool,
  helperText: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  value: PropTypes.number,
  valueSuffix: PropTypes.string,
  errorText: PropTypes.array,
  onChange: PropTypes.func.isRequired,
};

ADSSliderControl.defaultProps = {
  narrowLabel: false,
  isEditable: false,
  isRequired: false,
  loading: false,
  includeInput: false,
  includeLabel: false,
  min: 0,
  max: 100,
  step: 1,
};

function ADSSliderControl({
  label,
  narrowLabel,
  isEditable,
  isRequired,
  loading,
  includeInput,
  includeLabel,
  helperText,
  min,
  max,
  step,
  value,
  valueSuffix,
  errorText,
  onChange,
}) {
  const [displayError, setDisplayError] = useState("");
  const [displayValue, setDisplayValue] = useState(0);

  const hasError = useRef(false);

  /**
   * Event to handle the slider value changing.
   *
   * @param {object} event The event object.
   * @param {number} newValue The new value for the slider.
   */
  const handleSliderChangeEvent = (event, newValue) => {
    setDisplayValue(newValue);
    if (onChange) onChange(newValue);
  };

  /**
   * Event to handle the input changing.
   *
   * @param {object} event The event object.
   */
  const handleInputChangeEvent = (event) => {
    setDisplayValue(event.target.value === "" ? "" : Number(event.target.value));
    if (onChange) onChange(event.target.value === "" ? "" : Number(event.target.value));
  };

  /**
   * Event to handle when the control looses focus.
   */
  const handleBlur = () => {
    if (displayValue < 0) {
      setDisplayValue(0);
    } else if (displayValue > 100) {
      setDisplayValue(100);
    }
  };

  /**
   * Method to get the value text.
   *
   * @param {number} value The value for the control.
   * @returns {string} The value, with suffix if required.
   */
  function valueText(value) {
    if (valueSuffix) return `${value}${valueSuffix}`;
    else return `${value}`;
  }

  useEffect(() => {
    hasError.current = errorText && errorText.length > 0;

    if (hasError.current) {
      if (Array.isArray(errorText)) setDisplayError(errorText.join(", "));
      else setDisplayError(errorText);
    } else setDisplayError(null);
  }, [errorText]);

  useEffect(() => {
    setDisplayValue(value ? value : min);
  }, [value, min, label]);

  return (
    <Box sx={FormBoxRowStyle(hasError.current)}>
      <Grid container justifyContent="flex-start" alignItems="center" sx={FormRowStyle(hasError.current)} spacing={2}>
        <Grid item xs={narrowLabel ? 3 : 4}>
          <Typography
            id={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
            variant="body2"
            align="left"
            sx={controlLabelStyle}
          >
            {`${label}${isRequired ? "*" : ""}`}
          </Typography>
        </Grid>
        <Grid item xs={narrowLabel ? 9 : 8}>
          {loading ? (
            <Skeleton variant="rectangular" animation="wave" height="60px" width="100%" />
          ) : helperText && helperText.length > 0 ? (
            <Tooltip
              title={isRequired ? helperText + " This is a required field." : helperText}
              arrow
              placement="right"
              sx={tooltipStyle}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Slider
                  value={typeof displayValue === "number" ? displayValue : 0}
                  disabled={!isEditable}
                  getAriaValueText={valueText}
                  valueLabelFormat={valueText}
                  min={min}
                  max={max}
                  step={step}
                  valueLabelDisplay={`${!includeInput && !includeLabel ? "auto" : "off"}`}
                  onChange={handleSliderChangeEvent}
                  aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-slider`}
                />
                {includeInput && (
                  <TextField
                    id={`${label.toLowerCase().replaceAll(" ", "-")}-number-control`}
                    sx={{ width: "100px" }}
                    type="number"
                    disabled={!isEditable}
                    required={isRequired}
                    variant="outlined"
                    margin="dense"
                    inputProps={{
                      min: min,
                      max: max,
                    }}
                    size="small"
                    value={displayValue}
                    onChange={handleInputChangeEvent}
                    onBlur={handleBlur}
                    aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-slider`}
                  />
                )}
                {includeLabel && (
                  <Typography variant="body2" align="left">{`${displayValue}${
                    valueSuffix ? valueSuffix : ""
                  }`}</Typography>
                )}
              </Stack>
            </Tooltip>
          ) : (
            <Stack direction="row" spacing={2} alignItems="center">
              <Slider
                value={typeof displayValue === "number" ? displayValue : 0}
                disabled={!isEditable}
                getAriaValueText={valueText}
                valueLabelFormat={valueText}
                min={min}
                max={max}
                step={step}
                valueLabelDisplay={`${!includeInput && !includeLabel ? "auto" : "off"}`}
                onChange={handleSliderChangeEvent}
                aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-slider`}
              />
              {includeInput && (
                <TextField
                  id={`${label.toLowerCase().replaceAll(" ", "-")}-number-control`}
                  sx={{ width: "100px" }}
                  type="number"
                  disabled={!isEditable}
                  required={isRequired}
                  variant="outlined"
                  margin="dense"
                  inputProps={{
                    min: min,
                    max: max,
                  }}
                  size="small"
                  value={displayValue}
                  onChange={handleInputChangeEvent}
                  onBlur={handleBlur}
                  aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-slider`}
                />
              )}
              {includeLabel && (
                <Typography variant="body2" align="left">{`${displayValue}${
                  valueSuffix ? valueSuffix : ""
                }`}</Typography>
              )}
            </Stack>
          )}
        </Grid>
        <ADSErrorDisplay errorText={displayError} id={`${label.toLowerCase().replaceAll(" ", "-")}-number-error`} />
      </Grid>
    </Box>
  );
}

export default ADSSliderControl;
