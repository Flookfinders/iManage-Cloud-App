//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Slider component
//
//  Copyright:    © 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//region Version 1.0.0.0
//    001            Sean Flook                  Initial Revision.
//    002   27.06.23 Sean Flook          WI40729 Correctly handle if errorText is a string rather then an array.
//    003   24.11.23 Sean Flook                  Moved Box and Stack to @mui/system.
//endregion Version 1.0.0.0
//region Version 1.0.1.0
//    004   31.10.24 Sean Flook       IMANN-1012 Fix the height of the skeleton controls.
//endregion Version 1.0.1.0
//region Version 1.0.5.0
//    005   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//endregion header

import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Typography, Grid2, Tooltip, Slider, TextField, Skeleton } from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSErrorDisplay from "./ADSErrorDisplay";
import { FormBoxRowStyle, FormRowStyle, controlLabelStyle, skeletonHeight, tooltipStyle } from "../utils/ADSStyles";

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
      <Grid2 container justifyContent="flex-start" alignItems="center" sx={FormRowStyle(hasError.current)} spacing={2}>
        <Grid2 size={narrowLabel ? 3 : 4}>
          <Typography
            id={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
            variant="body2"
            align="left"
            sx={controlLabelStyle}
          >
            {`${label}${isRequired ? "*" : ""}`}
          </Typography>
        </Grid2>
        <Grid2 size={narrowLabel ? 9 : 8}>
          {loading ? (
            <Skeleton variant="rectangular" animation="wave" height={`${skeletonHeight}px`} width="100%" />
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
                    size="small"
                    value={displayValue}
                    onChange={handleInputChangeEvent}
                    onBlur={handleBlur}
                    aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-slider`}
                    slotProps={{
                      htmlInput: {
                        min: min,
                        max: max,
                      },
                    }}
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
                  size="small"
                  value={displayValue}
                  onChange={handleInputChangeEvent}
                  onBlur={handleBlur}
                  aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-slider`}
                  slotProps={{
                    htmlInput: {
                      min: min,
                      max: max,
                    },
                  }}
                />
              )}
              {includeLabel && (
                <Typography variant="body2" align="left">{`${displayValue}${
                  valueSuffix ? valueSuffix : ""
                }`}</Typography>
              )}
            </Stack>
          )}
        </Grid2>
        <ADSErrorDisplay errorText={displayError} id={`${label.toLowerCase().replaceAll(" ", "-")}-number-error`} />
      </Grid2>
    </Box>
  );
}

export default ADSSliderControl;
