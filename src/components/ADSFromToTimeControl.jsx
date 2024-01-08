/* #region header */
/**************************************************************************************************
//
//  Description: From To time Control component
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   07.07.21 Sean Flook                 Initial Revision.
//    002   24.11.23 Sean Flook                 Moved Box to @mui/system.
//    003   08.12.23 Sean Flook                 Migrated TimePicker to v6.
//    004   22.12.23 Sean Flook                 Ensure tooltip is displayed
//    005   03.01.24 Sean Flook                 Fixed warning.
//    006   05.01.24 Sean Flook                 Use CSS shortcuts.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */

import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Grid, Typography, Tooltip, Skeleton } from "@mui/material";
import { Box } from "@mui/system";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dateFormat from "dateformat";
import { parseISO } from "date-fns";
import ADSErrorDisplay from "./ADSErrorDisplay";
import { useTheme } from "@mui/styles";
import { FormBoxRowStyle, FormRowStyle, FormDateInputStyle, controlLabelStyle, tooltipStyle } from "../utils/ADSStyles";

/* #endregion imports */

ADSFromToTimeControl.propTypes = {
  label: PropTypes.string.isRequired,
  isEditable: PropTypes.bool,
  isRequired: PropTypes.bool,
  isFromFocused: PropTypes.bool,
  isToFocused: PropTypes.bool,
  loading: PropTypes.bool,
  fromLabel: PropTypes.string,
  toLabel: PropTypes.string,
  fromHelperText: PropTypes.string,
  toHelperText: PropTypes.string,
  fromValue: PropTypes.string,
  toValue: PropTypes.string,
  fromErrorText: PropTypes.array,
  toErrorText: PropTypes.array,
  onFromChange: PropTypes.func,
  onToChange: PropTypes.func,
};

ADSFromToTimeControl.defaultProps = {
  isEditable: false,
  isRequired: false,
  isFromFocused: false,
  isToFocused: false,
  loading: false,
  fromLabel: "From",
  toLabel: "To",
};

function ADSFromToTimeControl({
  label,
  isEditable,
  isRequired,
  isFromFocused,
  isToFocused,
  loading,
  fromLabel,
  toLabel,
  fromHelperText,
  toHelperText,
  fromValue,
  toValue,
  fromErrorText,
  toErrorText,
  onFromChange,
  onToChange,
}) {
  const theme = useTheme();

  const [selectedFromTime, setSelectedFromTime] = useState(null);
  const [selectedToTime, setSelectedToTime] = useState(null);
  const hasFromError = useRef(false);
  const hasToError = useRef(false);
  const [displayError, setDisplayError] = useState("");

  /**
   * Event to handle when the from time is changed.
   *
   * @param {Time} time The new time.
   */
  const handleFromChange = (time) => {
    setSelectedFromTime(time);

    if (onFromChange) onFromChange(time);
  };

  /**
   * Event to handle when the to time is changed.
   *
   * @param {Time} time The new time.
   */
  const handleToChange = (time) => {
    setSelectedToTime(time);

    if (onToChange) onToChange(time);
  };

  useEffect(() => {
    hasFromError.current = fromErrorText && fromErrorText.length > 0;
    hasToError.current = toErrorText && toErrorText.length > 0;

    let fromToTimeErrors = [];

    if (hasFromError.current) fromToTimeErrors = fromToTimeErrors.concat(fromErrorText);
    if (hasToError.current) fromToTimeErrors = fromToTimeErrors.concat(toErrorText);

    if (fromToTimeErrors.length > 0) setDisplayError(fromToTimeErrors.join(", "));
    else setDisplayError(null);
  }, [fromErrorText, toErrorText]);

  useEffect(() => {
    if (!loading && fromValue) setSelectedFromTime(parseISO(fromValue));
    if (!loading && toValue) setSelectedToTime(parseISO(toValue));
  }, [loading, fromValue, toValue]);

  useEffect(() => {
    let element = null;

    if (isFromFocused) {
      element = document.getElementById(`${label.toLowerCase().replaceAll(" ", "-")}-from-time-picker-textfield`);
    } else if (isToFocused) {
      element = document.getElementById(`${label.toLowerCase().replaceAll(" ", "-")}-to-time-picker-textfield`);
    }

    if (element) element.focus();
  });

  return (
    <Box sx={FormBoxRowStyle(hasFromError.current || hasToError.current)}>
      <Grid
        container
        justifyContent="flex-start"
        alignItems="center"
        sx={FormRowStyle(hasFromError.current || hasToError.current)}
      >
        <Grid item xs={3}>
          <Typography
            variant="body2"
            align="left"
            id={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
            sx={controlLabelStyle}
          >
            {`${label}${isRequired ? "*" : ""}`}
          </Typography>
        </Grid>
        <Grid item xs={9}>
          {loading ? (
            <Skeleton variant="rectangular" animation="wave" height="52px" width="100%" />
          ) : isEditable ? (
            <Grid container justifyContent="flex-start" alignItems="center" spacing={1}>
              <Grid item xs={6} container direction="column">
                <Grid item>
                  <Typography variant="body2">{fromLabel}</Typography>
                </Grid>
                <Grid item>
                  {fromHelperText && fromHelperText.length > 0 ? (
                    <Tooltip
                      title={isRequired ? fromHelperText + " This is a required field." : fromHelperText}
                      arrow
                      placement="right"
                      sx={tooltipStyle}
                    >
                      <div>
                        <TimePicker
                          id={`${label.toLowerCase().replaceAll(" ", "-")}-from-time-picker`}
                          value={selectedFromTime}
                          showTodayButton
                          required={isRequired}
                          disabled={!isEditable}
                          slotProps={{
                            textField: {
                              id: `${label.toLowerCase().replaceAll(" ", "-")}-from-time-picker-textfield`,
                              sx: FormDateInputStyle(hasFromError.current),
                              variant: "outlined",
                              error: hasFromError.current,
                              margin: "dense",
                              fullWidth: true,
                              size: "small",
                            },
                          }}
                          onChange={(newValue) => handleFromChange(newValue)}
                          KeyboardButtonProps={{
                            "aria-label": "change from time",
                          }}
                          aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-from-time-label`}
                          aria-describedby={`${label.toLowerCase().replaceAll(" ", "-")}-time-error`}
                        />
                      </div>
                    </Tooltip>
                  ) : (
                    <TimePicker
                      id={`${label.toLowerCase().replaceAll(" ", "-")}-from-time-picker`}
                      value={selectedFromTime}
                      showTodayButton
                      required={isRequired}
                      disabled={!isEditable}
                      slotProps={{
                        textField: {
                          id: `${label.toLowerCase().replaceAll(" ", "-")}-from-time-picker-textfield`,
                          sx: FormDateInputStyle(hasFromError.current),
                          variant: "outlined",
                          error: hasFromError.current,
                          margin: "dense",
                          fullWidth: true,
                          size: "small",
                        },
                      }}
                      onChange={(newValue) => handleFromChange(newValue)}
                      KeyboardButtonProps={{
                        "aria-label": "change from time",
                      }}
                      aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-from-time-label`}
                      aria-describedby={`${label.toLowerCase().replaceAll(" ", "-")}-time-error`}
                    />
                  )}
                </Grid>
              </Grid>
              <Grid item xs={6} container direction="column">
                <Grid item>
                  <Typography variant="body2">{toLabel}</Typography>
                </Grid>
                <Grid item>
                  {toHelperText && toHelperText.length > 0 ? (
                    <Tooltip
                      title={isRequired ? toHelperText + " This is a required field." : toHelperText}
                      arrow
                      placement="right"
                      sx={tooltipStyle}
                    >
                      <div>
                        <TimePicker
                          id={`${label.toLowerCase().replaceAll(" ", "-")}-to-time-picker`}
                          value={selectedToTime}
                          showTodayButton
                          required={isRequired}
                          disabled={!isEditable}
                          slotProps={{
                            textField: {
                              id: `${label.toLowerCase().replaceAll(" ", "-")}-to-time-picker-textfield`,
                              sx: FormDateInputStyle(hasToError.current),
                              variant: "outlined",
                              error: hasToError.current,
                              margin: "dense",
                              fullWidth: true,
                              size: "small",
                            },
                          }}
                          onChange={(newValue) => handleToChange(newValue)}
                          KeyboardButtonProps={{
                            "aria-label": "change to time",
                          }}
                          aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-to-time-label`}
                          aria-describedby={`${label.toLowerCase().replaceAll(" ", "-")}-time-error`}
                        />
                      </div>
                    </Tooltip>
                  ) : (
                    <TimePicker
                      id={`${label.toLowerCase().replaceAll(" ", "-")}-to-time-picker`}
                      value={selectedToTime}
                      showTodayButton
                      required={isRequired}
                      disabled={!isEditable}
                      slotProps={{
                        textField: {
                          id: `${label.toLowerCase().replaceAll(" ", "-")}-to-time-picker-textfield`,
                          sx: FormDateInputStyle(hasToError.current),
                          variant: "outlined",
                          error: hasToError.current,
                          margin: "dense",
                          fullWidth: true,
                          size: "small",
                        },
                      }}
                      onChange={(newValue) => handleToChange(newValue)}
                      KeyboardButtonProps={{
                        "aria-label": "change to time",
                      }}
                      aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-to-time-label`}
                      aria-describedby={`${label.toLowerCase().replaceAll(" ", "-")}-time-error`}
                    />
                  )}
                </Grid>
              </Grid>
            </Grid>
          ) : (
            <Grid container justifyContent="flex-start" alignItems="center">
              <Grid item xs={6} container direction="column">
                <Grid item>
                  <Typography variant="body2">{fromLabel}</Typography>
                </Grid>
                <Grid item>
                  {selectedFromTime && selectedFromTime.toString() !== "0001-01-01T00:00:00" && (
                    <Typography
                      id={`${label.toLowerCase().replaceAll(" ", "-")}-from-time`}
                      variant="body1"
                      align="left"
                      sx={{
                        pl: theme.spacing(2),
                        pt: theme.spacing(1.75),
                        pb: theme.spacing(1.75),
                      }}
                      aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-from-label`}
                    >
                      {dateFormat(selectedFromTime, "h:M tt")}
                    </Typography>
                  )}
                </Grid>
              </Grid>
              <Grid item xs={6} container direction="column">
                <Grid item>
                  <Typography variant="body2">{toLabel}</Typography>
                </Grid>
                <Grid item>
                  {selectedToTime && selectedToTime.toString() !== "0001-01-01T00:00:00" && (
                    <Typography
                      id={`${label.toLowerCase().replaceAll(" ", "-")}-to-time`}
                      variant="body1"
                      align="left"
                      sx={{
                        pl: theme.spacing(2),
                        pt: theme.spacing(1.75),
                        pb: theme.spacing(1.75),
                      }}
                      aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-to-label`}
                    >
                      {dateFormat(selectedToTime, "h:M tt")}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Grid>
          )}
        </Grid>
        <ADSErrorDisplay
          errorText={displayError}
          id={`${label.toLowerCase().replaceAll(" ", "-")}-from-to-time-error`}
        />
      </Grid>
    </Box>
  );
}

export default ADSFromToTimeControl;
