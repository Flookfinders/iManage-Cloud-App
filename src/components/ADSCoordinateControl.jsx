//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Coordinate Control component
//
//  Copyright:    © 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//region Version 1.0.0.0
//    001   07.07.21 Sean Flook                  Initial Revision.
//    002   24.11.23 Sean Flook                  Moved Box to @mui/system.
//    003   10.01.24 Sean Flook                  Fix warnings.
//    004   04.04.24 Sean Flook        IMANN-319 Do not allow coordinates to be changed outside the allowable limits.
//    005   04.04.24 Sean Flook        IMANN-403 Removed above changes as preventing user from changing coordinates.
//endregion Version 1.0.0.0
//region Version 1.0.1.0
//    006   31.10.24 Sean Flook       IMANN-1012 Fix the height of the skeleton controls.
//endregion Version 1.0.1.0
//region Version 1.0.2.0
//    007   12.11.24 Sean Flook                  Added ability to show that something has been changed.
//endregion Version 1.0.2.0
//region Version 1.0.5.0
//    008   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//endregion header

//region imports

import React, { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";

import { Grid2, TextField, Typography, Tooltip, Button, Skeleton, Badge } from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSErrorDisplay from "./ADSErrorDisplay";

import { PinDrop } from "@mui/icons-material";
import { MoveBLPUIcon } from "../utils/ADSIcons";

import {
  FormBoxRowStyle,
  FormRowStyle,
  FormInputStyle,
  ActionIconStyle,
  controlLabelStyle,
  tooltipStyle,
  skeletonHeight,
} from "../utils/ADSStyles";

//endregion imports

ADSCoordinateControl.propTypes = {
  label: PropTypes.string.isRequired,
  isEditable: PropTypes.bool,
  isRequired: PropTypes.bool,
  isEastFocused: PropTypes.bool,
  isNorthFocused: PropTypes.bool,
  loading: PropTypes.bool,
  helperText: PropTypes.string,
  eastValue: PropTypes.number,
  northValue: PropTypes.number,
  eastLabel: PropTypes.string,
  northLabel: PropTypes.string,
  displayButton: PropTypes.bool,
  indicateChange: PropTypes.bool,
  buttonIcon: PropTypes.string,
  buttonLabel: PropTypes.string,
  eastErrorText: PropTypes.array,
  northErrorText: PropTypes.array,
  onEastChange: PropTypes.func.isRequired,
  onNorthChange: PropTypes.func.isRequired,
  onButtonClick: PropTypes.func,
};

ADSCoordinateControl.defaultProps = {
  isEditable: false,
  isRequired: false,
  isEastFocused: false,
  isNorthFocused: false,
  loading: false,
  eastLabel: "E",
  northLabel: "N",
  displayButton: false,
  indicateChange: false,
  buttonIcon: "select",
};

function ADSCoordinateControl({
  label,
  isEditable,
  isRequired,
  isEastFocused,
  isNorthFocused,
  loading,
  helperText,
  eastValue,
  northValue,
  eastLabel,
  northLabel,
  displayButton,
  indicateChange,
  buttonIcon,
  buttonLabel,
  eastErrorText,
  northErrorText,
  onEastChange,
  onNorthChange,
  onButtonClick,
}) {
  const hasCoordError = useRef(false);
  const [valueEast, setValueEast] = useState(0);
  const [valueNorth, setValueNorth] = useState(0);
  const [displayError, setDisplayError] = useState("");

  /**
   * Event to handle when the easting is changed.
   *
   * @param {object} event The event object.
   */
  const handleEastChange = (event) => {
    const newValue = Number(event.target.value);
    setValueEast(newValue);
    if (onEastChange) {
      if (event.target.value.length > 0) onEastChange(newValue);
      else onEastChange(0);
    }
  };

  /**
   * Event to handle when the northing is changed.
   *
   * @param {object} event The event object.
   */
  const handleNorthChange = (event) => {
    const newValue = Number(event.target.value);
    setValueNorth(newValue);
    if (onNorthChange) {
      if (event.target.value.length > 0) onNorthChange(newValue);
      else onNorthChange(0);
    }
  };

  /**
   * Method to get the start icon.
   *
   * @returns {JSX.Element} The start icon.
   */
  function getStartIcon() {
    switch (buttonIcon) {
      case "move":
        return <MoveBLPUIcon />;

      default:
        return <PinDrop />;
    }
  }

  useEffect(() => {
    const hasEastError = eastErrorText && eastErrorText.length > 0;
    const hasNorthError = northErrorText && northErrorText.length > 0;
    hasCoordError.current = hasEastError || hasNorthError;

    let coordinateError = [];

    if (hasEastError) coordinateError = coordinateError.concat(eastErrorText);
    if (hasNorthError) coordinateError = coordinateError.concat(northErrorText);

    if (coordinateError.length > 0) setDisplayError(coordinateError.join(", "));

    setValueEast(eastValue);
    setValueNorth(northValue);
  }, [eastErrorText, northErrorText, eastValue, northValue]);

  useEffect(() => {
    let element = null;

    if (isEastFocused) {
      element = document.getElementById(`${label.toLowerCase().replaceAll(" ", "-")}-east-control`);
    } else if (isNorthFocused) {
      element = document.getElementById(`${label.toLowerCase().replaceAll(" ", "-")}-north-control`);
    }

    if (element) element.focus();
  });

  return (
    <Box sx={FormBoxRowStyle(hasCoordError.current)}>
      <Grid2 container justifyContent="flex-start" alignItems={"baseline"} sx={FormRowStyle(hasCoordError.current)}>
        <Grid2 size={3}>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mr: "16px" }}>
            <Typography
              id={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
              variant="body2"
              align="left"
              sx={controlLabelStyle}
            >
              {`${label}${isRequired ? "*" : ""}`}
            </Typography>
            <Badge color="error" variant="dot" invisible={!indicateChange} />
          </Stack>
        </Grid2>
        {displayButton ? (
          <Grid2 container justifyContent="space-between" alignItems="baseline" size={9}>
            <Grid2 container direction="column" justifyContent="center" alignItems="flex-start" size={8}>
              <Grid2 container justifyContent="flex-start" alignItems="center" columnSpacing={1}>
                <Grid2 size={3}>
                  <Typography
                    id={`${label.toLowerCase().replaceAll(" ", "-")}-east-label`}
                    variant="body2"
                    align="right"
                    sx={controlLabelStyle}
                  >
                    {eastLabel}
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
                      <TextField
                        id={`${label.toLowerCase().replaceAll(" ", "-")}-east-control`}
                        sx={FormInputStyle(hasCoordError.current)}
                        type="number"
                        error={hasCoordError.current}
                        fullWidth
                        disabled={!isEditable}
                        required={isRequired}
                        variant="outlined"
                        margin="dense"
                        size="small"
                        value={valueEast}
                        onChange={handleEastChange}
                        aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label ${label
                          .toLowerCase()
                          .replaceAll(" ", "-")}-east-label`}
                      />
                    </Tooltip>
                  ) : (
                    <TextField
                      id={`${label.toLowerCase().replaceAll(" ", "-")}-east-control`}
                      sx={FormInputStyle(hasCoordError.current)}
                      type="number"
                      error={hasCoordError.current}
                      fullWidth
                      disabled={!isEditable}
                      required={isRequired}
                      variant="outlined"
                      margin="dense"
                      size="small"
                      value={valueEast}
                      onChange={handleEastChange}
                      aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label ${label
                        .toLowerCase()
                        .replaceAll(" ", "-")}-east-label`}
                    />
                  )}
                </Grid2>
              </Grid2>
              <Grid2 container justifyContent="flex-start" alignItems="center" columnSpacing={1}>
                <Grid2 size={3}>
                  <Typography
                    id={`${label.toLowerCase().replaceAll(" ", "-")}-north-label`}
                    variant="body2"
                    align="right"
                    sx={controlLabelStyle}
                  >
                    {northLabel}
                  </Typography>
                </Grid2>
                <Grid2 size={9}>
                  {loading ? (
                    <Skeleton variant="rectangular" height={`${skeletonHeight}px`} width="100%" />
                  ) : helperText && helperText.length > 0 ? (
                    <Tooltip
                      title={isRequired ? helperText + " This is a required field." : helperText}
                      arrow
                      placement="right"
                      sx={tooltipStyle}
                    >
                      <TextField
                        id={`${label.toLowerCase().replaceAll(" ", "-")}-north-control`}
                        sx={FormInputStyle(hasCoordError.current)}
                        type="number"
                        error={hasCoordError.current}
                        fullWidth
                        disabled={!isEditable}
                        required={isRequired}
                        variant="outlined"
                        margin="dense"
                        size="small"
                        value={valueNorth}
                        onChange={handleNorthChange}
                        aria-labelledby={`${label.replaceAll(" ", "-")}-label ${label
                          .toLowerCase()
                          .replaceAll(" ", "-")}-north-label`}
                      />
                    </Tooltip>
                  ) : (
                    <TextField
                      id={`${label.toLowerCase().replaceAll(" ", "-")}-east-control`}
                      sx={FormInputStyle(hasCoordError.current)}
                      type="number"
                      error={hasCoordError.current}
                      fullWidth
                      disabled={!isEditable}
                      required={isRequired}
                      variant="outlined"
                      margin="dense"
                      size="small"
                      value={valueNorth}
                      onChange={handleNorthChange}
                      aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label ${label
                        .toLowerCase()
                        .replaceAll(" ", "-")}-north-label`}
                    />
                  )}
                </Grid2>
              </Grid2>
            </Grid2>
            <Grid2 size={4}>
              <Button
                id={`${buttonLabel.toLowerCase().replaceAll(" ", "-")}-select-button`}
                sx={ActionIconStyle()}
                disabled={!isEditable}
                startIcon={getStartIcon()}
                onClick={onButtonClick}
              >
                {buttonLabel}
              </Button>
            </Grid2>
          </Grid2>
        ) : (
          <Grid2 container justifyContent="space-between" alignItems="baseline" size={9}>
            <Grid2 container direction="column" justifyContent="center" alignItems="flex-start" size={12}>
              <Grid2 container justifyContent="flex-start" alignItems="center" columnSpacing={1}>
                <Grid2 size={3}>
                  <Typography
                    id={`${label.toLowerCase().replaceAll(" ", "-")}-east-label`}
                    variant="body2"
                    align="right"
                    sx={controlLabelStyle}
                  >
                    {eastLabel}
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
                      <TextField
                        id={`${label.toLowerCase().replaceAll(" ", "-")}-east-control`}
                        sx={FormInputStyle(hasCoordError.current)}
                        type="number"
                        error={hasCoordError.current}
                        fullWidth
                        disabled={!isEditable}
                        required={isRequired}
                        variant="outlined"
                        margin="dense"
                        size="small"
                        value={valueEast}
                        onChange={handleEastChange}
                        aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label ${label
                          .toLowerCase()
                          .replaceAll(" ", "-")}-east-label`}
                      />
                    </Tooltip>
                  ) : (
                    <TextField
                      id={`${label.toLowerCase().replaceAll(" ", "-")}-east-control`}
                      sx={FormInputStyle(hasCoordError.current)}
                      type="number"
                      error={hasCoordError.current}
                      fullWidth
                      disabled={!isEditable}
                      required={isRequired}
                      variant="outlined"
                      margin="dense"
                      size="small"
                      value={valueEast}
                      onChange={handleEastChange}
                      aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label ${label
                        .toLowerCase()
                        .replaceAll(" ", "-")}-east-label`}
                    />
                  )}
                </Grid2>
              </Grid2>
              <Grid2 container justifyContent="flex-start" alignItems="center" columnSpacing={1}>
                <Grid2 size={3}>
                  <Typography
                    id={`${label.toLowerCase().replaceAll(" ", "-")}-north-label`}
                    variant="body2"
                    align="right"
                    sx={controlLabelStyle}
                  >
                    {northLabel}
                  </Typography>
                </Grid2>
                <Grid2 size={9}>
                  {loading ? (
                    <Skeleton variant="rectangular" height={`${skeletonHeight}px`} width="100%" />
                  ) : helperText && helperText.length > 0 ? (
                    <Tooltip
                      title={isRequired ? helperText + " This is a required field." : helperText}
                      arrow
                      placement="right"
                      sx={tooltipStyle}
                    >
                      <TextField
                        id={`${label.toLowerCase().replaceAll(" ", "-")}-north-control`}
                        sx={FormInputStyle(hasCoordError.current)}
                        type="number"
                        error={hasCoordError.current}
                        fullWidth
                        disabled={!isEditable}
                        required={isRequired}
                        variant="outlined"
                        margin="dense"
                        size="small"
                        value={valueNorth}
                        onChange={handleNorthChange}
                        aria-labelledby={`${label.replaceAll(" ", "-")}-label ${label
                          .toLowerCase()
                          .replaceAll(" ", "-")}-north-label`}
                      />
                    </Tooltip>
                  ) : (
                    <TextField
                      id={`${label.toLowerCase().replaceAll(" ", "-")}-east-control`}
                      sx={FormInputStyle(hasCoordError.current)}
                      type="number"
                      error={hasCoordError.current}
                      fullWidth
                      disabled={!isEditable}
                      required={isRequired}
                      variant="outlined"
                      margin="dense"
                      size="small"
                      value={valueNorth}
                      onChange={handleNorthChange}
                      aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label ${label
                        .toLowerCase()
                        .replaceAll(" ", "-")}-north-label`}
                    />
                  )}
                </Grid2>
              </Grid2>
            </Grid2>
          </Grid2>
        )}
        <ADSErrorDisplay errorText={displayError} id={`${label.toLowerCase().replaceAll(" ", "-")}-coordinate-error`} />
      </Grid2>
    </Box>
  );
}

export default ADSCoordinateControl;
