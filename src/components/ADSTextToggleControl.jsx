//region header */
//--------------------------------------------------------------------------------------------------
//
//  Description: Test toggle control
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
//    003   24.11.23 Sean Flook                  Moved Box to @mui/system.
//endregion Version 1.0.0.0
//region Version 1.0.5.0
//    004   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//endregion header */

import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Typography, Grid2, Tooltip, ButtonGroup, Button, Skeleton } from "@mui/material";
import { Box } from "@mui/system";
import ADSErrorDisplay from "./ADSErrorDisplay";
import { FormBoxRowStyle, FormRowStyle, controlLabelStyle, tooltipStyle, getButtonStyle } from "../utils/ADSStyles";

ADSTextToggleControl.propTypes = {
  label: PropTypes.string.isRequired,
  button1Text: PropTypes.string.isRequired,
  button2Text: PropTypes.string.isRequired,
  button1Value: PropTypes.any,
  button2Value: PropTypes.any,
  isEditable: PropTypes.bool,
  isRequired: PropTypes.bool,
  loading: PropTypes.bool,
  helperText: PropTypes.string,
  value: PropTypes.any,
  errorText: PropTypes.array,
  onChange: PropTypes.func.isRequired,
};

ADSTextToggleControl.defaultProps = {
  isEditable: false,
  isRequired: false,
  loading: false,
};

function ADSTextToggleControl({
  label,
  button1Text,
  button2Text,
  button1Value,
  button2Value,
  isEditable,
  isRequired,
  loading,
  helperText,
  value,
  errorText,
  onChange,
}) {
  const [displayError, setDisplayError] = useState(null);

  const hasError = useRef(false);

  /**
   * Event to handle when button 1 is clicked.
   */
  const handleButton1Click = () => {
    if (value !== button1Value && onChange) onChange(button1Value);
  };

  /**
   * Event to handle when button 2 is clicked.
   */
  const handleButton2Click = () => {
    if (value !== button2Value && onChange) onChange(button2Value);
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
            id={`ads-text-label-${label.toLowerCase().replaceAll(" ", "-")}`}
            variant="body2"
            align="left"
            sx={controlLabelStyle}
          >
            {`${label}${isRequired ? "*" : ""}`}
          </Typography>
        </Grid2>
        <Grid2 size={9}>
          {loading ? (
            <Skeleton variant="rectangular" animation="wave" height="30px" width="100%" />
          ) : helperText && helperText.length > 0 ? (
            <Tooltip
              title={isRequired ? helperText + " This is a required field." : helperText}
              arrow
              placement="right"
              sx={tooltipStyle}
            >
              <ButtonGroup>
                <Button
                  id="button1-button"
                  disabled={!isEditable}
                  onClick={handleButton1Click}
                  aria-labelledby={`ads-text-label-${label.toLowerCase().replaceAll(" ", "-")}`}
                  sx={getButtonStyle(value === button1Value)}
                >
                  <Typography variant="body1" sx={{ textTransform: "none" }}>
                    {button1Text}
                  </Typography>
                </Button>
                <Button
                  id="button2-button"
                  disabled={!isEditable}
                  onClick={handleButton2Click}
                  aria-labelledby={`ads-text-label-${label.toLowerCase().replaceAll(" ", "-")}`}
                  sx={getButtonStyle(value === button2Value)}
                >
                  <Typography variant="body1" sx={{ textTransform: "none" }}>
                    {button2Text}
                  </Typography>
                </Button>
              </ButtonGroup>
            </Tooltip>
          ) : (
            <ButtonGroup>
              <Button
                id="button1-button"
                disabled={!isEditable}
                onClick={handleButton1Click}
                aria-labelledby={`ads-text-label-${label.toLowerCase().replaceAll(" ", "-")}`}
                sx={getButtonStyle(value === button1Value)}
              >
                <Typography variant="body1" sx={{ textTransform: "none" }}>
                  {button1Text}
                </Typography>
              </Button>
              <Button
                id="button2-button"
                disabled={!isEditable}
                onClick={handleButton2Click}
                aria-labelledby={`ads-text-label-${label.toLowerCase().replaceAll(" ", "-")}`}
                sx={getButtonStyle(value === button2Value)}
              >
                <Typography variant="body1" sx={{ textTransform: "none" }}>
                  {button2Text}
                </Typography>
              </Button>
            </ButtonGroup>
          )}
        </Grid2>
        <ADSErrorDisplay
          errorText={displayError}
          id={`${label.toLowerCase().replaceAll(" ", "-")}-text-toggle-error`}
        />
      </Grid2>
    </Box>
  );
}

export default ADSTextToggleControl;
