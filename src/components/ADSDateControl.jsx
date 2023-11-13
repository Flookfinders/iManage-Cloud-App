/* #region header */
/**************************************************************************************************
//
//  Description: Date component
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
//    004   18.05.21 Sean Flook         WI39345 Use the value directly.
//    005   20.05.21 Sean Flook         WI39345 Undo above changes and added new useEffect for the value changing.
//    006   20.05.21 Sean Flook         WI39345 Display a tooltip if required.
//    007   25.05.21 Sean Flook         WI39345 Changes to get the Tooltip to display correctly and include required field text if required to tooltip.
//    008   08.06.21 Sean Flook         WI39345 Changed read-only version to a label and altered colour of outline.
//    009   15.06.21 Sean Flook         WI39345 Display the toolbar as temporary fix, until v5 components are fully released.
//    010   27.06.23 Sean Flook         WI40729 Correctly handle if errorText is a string rather then an array.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */

import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Grid, TextField, Typography, Tooltip, Skeleton, Box } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dateFormat from "dateformat";
import ADSErrorDisplay from "./ADSErrorDisplay";
import { useTheme } from "@mui/styles";
import { FormBoxRowStyle, FormRowStyle, FormDateInputStyle, controlLabelStyle, tooltipStyle } from "../utils/ADSStyles";

/* #endregion imports */

ADSDateControl.propTypes = {
  label: PropTypes.string.isRequired,
  isEditable: PropTypes.bool,
  isRequired: PropTypes.bool,
  isFocused: PropTypes.bool,
  loading: PropTypes.bool,
  helperText: PropTypes.string,
  value: PropTypes.string,
  errorText: PropTypes.array,
  onChange: PropTypes.func,
};

ADSDateControl.defaultProps = {
  isEditable: false,
  isRequired: false,
  isFocused: false,
  loading: false,
};

function ADSDateControl({ label, isEditable, isRequired, isFocused, loading, helperText, value, errorText, onChange }) {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState(null);
  const [displayError, setDisplayError] = useState("");
  const hasError = useRef(false);

  /**
   * Event to handle when the date is changed.
   *
   * @param {Date} date The new date.
   */
  const handleDateChange = (date) => {
    setSelectedDate(date);

    if (onChange) onChange(date);
  };

  useEffect(() => {
    hasError.current = errorText && errorText.length > 0;

    if (hasError.current) {
      if (Array.isArray(errorText)) setDisplayError(errorText.join(", "));
      else setDisplayError(errorText);
    } else setDisplayError(null);
  }, [errorText]);

  useEffect(() => {
    if (!loading && value && value.toString() !== "0001-01-01T00:00:00") setSelectedDate(value);
  }, [loading, value]);

  useEffect(() => {
    let element = null;

    if (isFocused) {
      element = document.getElementById(`${label.toLowerCase().replaceAll(" ", "-")}-date-picker-textfield`);
    }

    if (element) element.focus();
  });

  return (
    <Box sx={FormBoxRowStyle(hasError.current)}>
      <Grid container justifyContent="flex-start" alignItems="center" sx={FormRowStyle(hasError.current)}>
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
            helperText && helperText.length > 0 ? (
              <DatePicker
                id={`${label.toLowerCase().replaceAll(" ", "-")}-date-picker`}
                inputFormat="dd MMMM yyyy"
                disableMaskedInput
                value={selectedDate}
                showTodayButton
                required={isRequired}
                disabled={!isEditable}
                renderInput={(params) => (
                  <Tooltip
                    title={isRequired ? helperText + " This is a required field." : helperText}
                    arrow
                    placement="right"
                    sx={tooltipStyle}
                  >
                    <TextField
                      {...params}
                      id={`${label.toLowerCase().replaceAll(" ", "-")}-date-picker-textfield`}
                      sx={FormDateInputStyle(hasError.current)}
                      variant="outlined"
                      error={hasError.current}
                      margin="dense"
                      fullWidth
                      size="small"
                    />
                  </Tooltip>
                )}
                onChange={(newValue) => handleDateChange(newValue)}
                KeyboardButtonProps={{
                  "aria-label": "change date",
                }}
                aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
                aria-describedby={`${label.toLowerCase().replaceAll(" ", "-")}-error`}
              />
            ) : (
              <DatePicker
                id={`${label.toLowerCase().replaceAll(" ", "-")}-date-picker`}
                inputFormat="dd MMMM yyyy"
                disableMaskedInput
                value={selectedDate ? selectedDate : new Date()}
                showTodayButton
                required={isRequired}
                disabled={!isEditable}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    id={`${label.toLowerCase().replaceAll(" ", "-")}-date-picker-textfield`}
                    sx={FormDateInputStyle(hasError.current)}
                    variant="outlined"
                    error={hasError.current}
                    margin="dense"
                    fullWidth
                    size="small"
                  />
                )}
                onChange={(newValue) => handleDateChange(newValue)}
                KeyboardButtonProps={{
                  "aria-label": "change date",
                }}
                aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
                aria-describedby={`${label.toLowerCase().replaceAll(" ", "-")}-error`}
              />
            )
          ) : (
            selectedDate &&
            selectedDate.toString() !== "0001-01-01T00:00:00" && (
              <Typography
                id={`${label.toLowerCase().replaceAll(" ", "-")}-date`}
                variant="body1"
                align="left"
                sx={{
                  paddingLeft: theme.spacing(2),
                  paddingTop: theme.spacing(1.75),
                  paddingBottom: theme.spacing(1.75),
                }}
                aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
              >
                {dateFormat(selectedDate, "d mmm yyyy")}
              </Typography>
            )
          )}
        </Grid>
        <ADSErrorDisplay errorText={displayError} id={`${label.toLowerCase().replaceAll(" ", "-")}-error`} />
      </Grid>
    </Box>
  );
}

export default ADSDateControl;
