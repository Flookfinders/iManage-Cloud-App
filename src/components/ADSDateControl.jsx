/* #region header */
/**************************************************************************************************
//
//  Description: Date component
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
//    004   18.05.21 Sean Flook          WI39345 Use the value directly.
//    005   20.05.21 Sean Flook          WI39345 Undo above changes and added new useEffect for the value changing.
//    006   20.05.21 Sean Flook          WI39345 Display a tooltip if required.
//    007   25.05.21 Sean Flook          WI39345 Changes to get the Tooltip to display correctly and include required field text if required to tooltip.
//    008   08.06.21 Sean Flook          WI39345 Changed read-only version to a label and altered colour of outline.
//    009   15.06.21 Sean Flook          WI39345 Display the toolbar as temporary fix, until v5 components are fully released.
//    010   27.06.23 Sean Flook          WI40729 Correctly handle if errorText is a string rather then an array.
//    011   24.11.23 Sean Flook                  Moved Box to @mui/system.
//    012   08.12.23 Sean Flook                  Migrated DatePicker to v6.
//    013   18.12.23 Sean Flook                  Ensure tooltip is displayed
//    014   20.12.23 Sean Flook        IMANN-201 Added hideYear property to hide the year in the control.
//    015   03.01.24 Sean Flook                  Fixed warning.
//    016   05.01.24 Sean Flook                  use CSS shortcuts.
//    017   16.01.24 Sean Flook        IMANN-237 Added a clear button.
//    018   28.08.24 Sean Flook        IMANN-961 Use a TextField when user is read only.
//#endregion Version 1.0.0.0 changes
//#region Version 1.0.1.0 changes
//    019   31.10.24 Sean Flook       IMANN-1012 Fix the height of the skeleton controls.
//#endregion Version 1.0.1.0 changes
//#region Version 1.0.5.0 changes
//    020   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//#endregion Version 1.0.5.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */

import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

import { parseISO } from "date-fns";
import dateFormat from "dateformat";
import { isValidDate } from "../utils/HelperUtils";

import { Grid2, Typography, Tooltip, Skeleton, TextField } from "@mui/material";
import { Box } from "@mui/system";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import ADSErrorDisplay from "./ADSErrorDisplay";

import {
  FormBoxRowStyle,
  FormRowStyle,
  FormDateInputStyle,
  controlLabelStyle,
  tooltipStyle,
  FormInputStyle,
  skeletonHeight,
} from "../utils/ADSStyles";

/* #endregion imports */

ADSDateControl.propTypes = {
  label: PropTypes.string.isRequired,
  isEditable: PropTypes.bool,
  isRequired: PropTypes.bool,
  isFocused: PropTypes.bool,
  allowFutureDates: PropTypes.bool,
  hideYear: PropTypes.bool,
  loading: PropTypes.bool,
  helperText: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  errorText: PropTypes.array,
  onChange: PropTypes.func,
};

ADSDateControl.defaultProps = {
  isEditable: false,
  isRequired: false,
  isFocused: false,
  allowFutureDates: false,
  hideYear: false,
  loading: false,
};

function ADSDateControl({
  label,
  isEditable,
  isRequired,
  isFocused,
  allowFutureDates,
  hideYear,
  loading,
  helperText,
  value,
  errorText,
  onChange,
}) {
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
    if (!loading && value && value.toString() !== "0001-01-01T00:00:00") {
      if (isValidDate(value)) setSelectedDate(value);
      else setSelectedDate(parseISO(value));
    }
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
      <Grid2 container justifyContent="flex-start" alignItems="center" sx={FormRowStyle(hasError.current)}>
        <Grid2 size={3}>
          <Typography
            variant="body2"
            align="left"
            id={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
            sx={controlLabelStyle}
          >
            {`${label}${isRequired ? "*" : ""}`}
          </Typography>
        </Grid2>
        <Grid2 size={9}>
          {loading ? (
            <Skeleton variant="rectangular" animation="wave" height={`${skeletonHeight}px`} width="100%" />
          ) : isEditable ? (
            helperText && helperText.length > 0 ? (
              <Tooltip
                title={isRequired ? helperText + " This is a required field." : helperText}
                arrow
                placement="right"
                sx={tooltipStyle}
              >
                <div>
                  <DatePicker
                    id={`${label.toLowerCase().replaceAll(" ", "-")}-date-picker`}
                    format={`${hideYear ? "dd MMM" : "dd MMMM yyyy"}`}
                    disableMaskedInput
                    value={selectedDate}
                    showTodayButton
                    required={isRequired}
                    disabled={!isEditable}
                    disableFuture={!allowFutureDates}
                    views={hideYear ? ["day", "month"] : ["day", "month", "year"]}
                    slotProps={{
                      textField: {
                        id: `${label.toLowerCase().replaceAll(" ", "-")}-date-picker-textfield`,
                        sx: FormDateInputStyle(hasError.current),
                        variant: "outlined",
                        error: hasError.current,
                        margin: "dense",
                        fullWidth: true,
                        size: "small",
                      },
                      field: { clearable: true },
                    }}
                    onChange={(newValue) => handleDateChange(newValue)}
                    KeyboardButtonProps={{
                      "aria-label": "change date",
                    }}
                    aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
                    aria-describedby={`${label.toLowerCase().replaceAll(" ", "-")}-error`}
                  />
                </div>
              </Tooltip>
            ) : (
              <DatePicker
                id={`${label.toLowerCase().replaceAll(" ", "-")}-date-picker`}
                format={`${hideYear ? "dd MMM" : "dd MMMM yyyy"}`}
                disableMaskedInput
                value={selectedDate ? selectedDate : new Date()}
                showTodayButton
                required={isRequired}
                disabled={!isEditable}
                disableFuture={!allowFutureDates}
                views={hideYear ? ["day", "month"] : ["day", "month", "year"]}
                slotProps={{
                  textField: {
                    id: `${label.toLowerCase().replaceAll(" ", "-")}-date-picker-textfield`,
                    sx: FormDateInputStyle(hasError.current),
                    variant: "outlined",
                    error: hasError.current,
                    margin: "dense",
                    fullWidth: true,
                    size: "small",
                  },
                  field: { clearable: true },
                }}
                onChange={(newValue) => handleDateChange(newValue)}
                KeyboardButtonProps={{
                  "aria-label": "change date",
                }}
                aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
                aria-describedby={`${label.toLowerCase().replaceAll(" ", "-")}-error`}
              />
            )
          ) : selectedDate && selectedDate.toString() !== "0001-01-01T00:00:00" ? (
            <TextField
              id={`${label.toLowerCase().replaceAll(" ", "-")}-date`}
              sx={FormInputStyle(hasError.current)}
              error={hasError.current}
              rows={1}
              fullWidth
              disabled
              required={isRequired}
              variant="outlined"
              margin="dense"
              size="small"
              value={dateFormat(selectedDate, "d mmm yyyy")}
            />
          ) : (
            <TextField
              id={`${label.toLowerCase().replaceAll(" ", "-")}-date`}
              sx={FormInputStyle(hasError.current)}
              error={hasError.current}
              rows={1}
              fullWidth
              disabled
              required={isRequired}
              variant="outlined"
              margin="dense"
              size="small"
              value={""}
            />
          )}
        </Grid2>
        <ADSErrorDisplay errorText={displayError} id={`${label.toLowerCase().replaceAll(" ", "-")}-error`} />
      </Grid2>
    </Box>
  );
}

export default ADSDateControl;
