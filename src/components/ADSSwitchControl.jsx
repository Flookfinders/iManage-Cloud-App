//#region header */
/**************************************************************************************************
//
//  Description: ADS Switch control
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
//    002   31.03.23 Sean Flook         WI40656 Correctly display control when checked changes.
//    003   27.06.23 Sean Flook         WI40729 Correctly handle if errorText is a string rather then an array.
//    004   24.11.23 Sean Flook                 Moved Box to @mui/system.
//    005   11.03.24 Sean Flook           MUL13 Added wideLabel parameter.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

/* #region imports */

import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Typography, Grid, Tooltip, Switch, FormControlLabel, Skeleton } from "@mui/material";
import { Box } from "@mui/system";
import ADSErrorDisplay from "./ADSErrorDisplay";
import { FormBoxRowStyle, FormRowStyle, controlLabelStyle, tooltipStyle } from "../utils/ADSStyles";

/* #endregion imports */

ADSSwitchControl.propTypes = {
  label: PropTypes.string.isRequired,
  isEditable: PropTypes.bool,
  isRequired: PropTypes.bool,
  isFocused: PropTypes.bool,
  loading: PropTypes.bool,
  trueLabel: PropTypes.string.isRequired,
  falseLabel: PropTypes.string.isRequired,
  helperText: PropTypes.string,
  checked: PropTypes.bool,
  wideLabel: PropTypes.bool,
  errorText: PropTypes.array,
  onChange: PropTypes.func.isRequired,
};

ADSSwitchControl.defaultProps = {
  isEditable: false,
  isRequired: false,
  isFocused: false,
  loading: false,
  checked: false,
  wideLabel: false,
  trueLabel: "True",
  falseLabel: "False",
};

function ADSSwitchControl({
  label,
  isEditable,
  isRequired,
  isFocused,
  loading,
  trueLabel,
  falseLabel,
  helperText,
  checked,
  wideLabel,
  errorText,
  onChange,
}) {
  const [displayError, setDisplayError] = useState("");

  const hasError = useRef(false);

  const [switchChecked, setSwitchChecked] = useState(checked);
  const switchState = useRef(checked);

  /**
   * Event to handle when the control changes.
   */
  const handleChangeEvent = () => {
    switchState.current = !switchState.current;
    setSwitchChecked(switchState.current);
    if (onChange) onChange(switchState.current);
  };

  useEffect(() => {
    hasError.current = errorText && errorText.length > 0;

    if (hasError.current) {
      if (Array.isArray(errorText)) setDisplayError(errorText.join(", "));
      else setDisplayError(errorText);
    } else setDisplayError(null);
  }, [errorText]);

  useEffect(() => {
    let element = null;

    if (isFocused) {
      element = document.getElementById(`ads-switch-${label.toLowerCase().replaceAll(" ", "-")}`);
    }

    if (element) element.focus();
  });

  useEffect(() => {
    setSwitchChecked(checked);
    switchState.current = checked;
  }, [checked]);

  return (
    <Box sx={FormBoxRowStyle(hasError.current)}>
      <Grid container justifyContent="flex-start" alignItems="center" sx={FormRowStyle(hasError.current)}>
        <Grid item xs={wideLabel ? 5 : 3}>
          <Typography
            id={`ads-switch-label-${label.toLowerCase().replaceAll(" ", "-")}`}
            variant="body2"
            align="left"
            sx={controlLabelStyle}
          >
            {`${label}${isRequired ? "*" : ""}`}
          </Typography>
        </Grid>
        <Grid item xs={wideLabel ? 7 : 9}>
          {loading ? (
            <Skeleton variant="rectangular" height="46px" width="100%" />
          ) : helperText && helperText.length > 0 ? (
            <Tooltip
              title={isRequired ? helperText + " This is a required field." : helperText}
              arrow
              placement="right"
              sx={tooltipStyle}
            >
              <FormControlLabel
                value="end"
                control={
                  <Switch
                    id={`ads-switch-${label.toLowerCase().replaceAll(" ", "-")}`}
                    disabled={!isEditable}
                    checked={switchChecked}
                    onChange={handleChangeEvent}
                    color="primary"
                    aria-labelledby={`ads-switch-label-${label.toLowerCase().replaceAll(" ", "-")}`}
                  />
                }
                label={switchChecked ? trueLabel : falseLabel}
                labelPlacement="end"
              />
            </Tooltip>
          ) : (
            <FormControlLabel
              value="end"
              control={
                <Switch
                  id={`ads-switch-${label.toLowerCase().replaceAll(" ", "-")}`}
                  disabled={!isEditable}
                  checked={switchChecked}
                  onChange={handleChangeEvent}
                  color="primary"
                  aria-labelledby={`ads-switch-label-${label.toLowerCase().replaceAll(" ", "-")}`}
                />
              }
              label={switchChecked ? trueLabel : falseLabel}
              labelPlacement="end"
            />
          )}
        </Grid>
        <ADSErrorDisplay errorText={displayError} id={`${label.toLowerCase().replaceAll(" ", "-")}-switch-error`} />
      </Grid>
    </Box>
  );
}

export default ADSSwitchControl;
