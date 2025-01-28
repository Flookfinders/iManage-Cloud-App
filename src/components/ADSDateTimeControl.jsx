/* #region header */
/**************************************************************************************************
//
//  Description: Date Time control
//
//  Copyright:    © 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//#region Version 1.0.0.0 changes
//    001            Sean Flook                  Initial Revision.
//    002   24.11.23 Sean Flook                  Moved Box to @mui/system.
//    003   08.12.23 Sean Flook                  Migrated DatePicker to v6.
//    004   18.12.23 Sean Flook                  Ensure tooltip is displayed
//    005   20.12.23 Sean Flook        IMANN-201 Added the isDateRequired and isTimeRequired properties.
//    006   03.01.24 Sean Flook                  Fixed warning.
//    007   05.01.24 Sean Flook                  use CSS shortcuts.
//    008   16.01.24 Sean Flook        IMANN-237 Added a clear button.
//    009   19.01.24 Sean Flook        IMANN-243 Correctly update the time.
//    010   16.02.24 Sean Flook        IMANN-243 Correctly handle the incoming time.
//    011   28.08.24 Sean Flook        IMANN-961 Use a TextField when user is read only.
//#endregion Version 1.0.0.0 changes
//#region Version 1.0.1.0 changes
//    012   10.10.24 Sean Flook       IMANN-1011 Changed display format to only show 3 characters for month.
//    013   31.10.24 Sean Flook       IMANN-1012 Fix the height of the skeleton controls.
//#endregion Version 1.0.1.0 changes
//#region Version 1.0.4.0 changes
//    014   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//#endregion Version 1.0.4.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */

import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

import dateFormat from "dateformat";
import { parseISO, parse } from "date-fns";
import { isValidDate } from "../utils/HelperUtils";

import { Grid2, Typography, Tooltip, Skeleton, TextField } from "@mui/material";
import { Box } from "@mui/system";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import ADSErrorDisplay from "./ADSErrorDisplay";

import { adsMidGreyA } from "../utils/ADSColours";
import {
  FormBoxRowStyle,
  FormRowStyle,
  FormDateInputStyle,
  tooltipStyle,
  FormInputStyle,
  skeletonHeight,
} from "../utils/ADSStyles";

/* #endregion imports */

ADSDateTimeControl.propTypes = {
  label: PropTypes.string.isRequired,
  isEditable: PropTypes.bool,
  isRequired: PropTypes.bool,
  isDateRequired: PropTypes.bool,
  isTimeRequired: PropTypes.bool,
  isDateFocused: PropTypes.bool,
  isTimeFocused: PropTypes.bool,
  allowFutureDates: PropTypes.bool,
  loading: PropTypes.bool,
  dateHelperText: PropTypes.string,
  timeHelperText: PropTypes.string,
  dateValue: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  timeValue: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  dateErrorText: PropTypes.array,
  timeErrorText: PropTypes.array,
  onDateChange: PropTypes.func,
  onTimeChange: PropTypes.func,
};

ADSDateTimeControl.defaultProps = {
  isEditable: false,
  isRequired: false,
  isDateRequired: false,
  isTimeRequired: false,
  isDateFocused: false,
  isTimeFocused: false,
  allowFutureDates: false,
  loading: false,
};

function ADSDateTimeControl({
  label,
  isEditable,
  isRequired,
  isDateRequired,
  isTimeRequired,
  isDateFocused,
  isTimeFocused,
  allowFutureDates,
  loading,
  dateHelperText,
  timeHelperText,
  dateValue,
  timeValue,
  dateErrorText,
  timeErrorText,
  onDateChange,
  onTimeChange,
}) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const hasDateError = useRef(false);
  const hasTimeError = useRef(false);
  const [displayError, setDisplayError] = useState("");

  /**
   * Event to handle when the date is changed.
   *
   * @param {Date} date The new date.
   */
  const handleDateChange = (date) => {
    setSelectedDate(date);

    if (onDateChange) onDateChange(date);
  };

  /**
   * Event to handle when the time is changed.
   *
   * @param {Time} time The new time.
   */
  const handleTimeChange = (time) => {
    const timeString = time ? dateFormat(new Date(time), "HH:MM:ss") : "";
    if (onTimeChange) onTimeChange(timeString);
    else setSelectedTime(time);
  };

  useEffect(() => {
    hasDateError.current = dateErrorText && dateErrorText.length > 0;
    hasTimeError.current = timeErrorText && timeErrorText.length > 0;

    let dateTimeError = [];

    if (hasDateError.current) dateTimeError = dateTimeError.concat(dateErrorText);
    if (hasTimeError.current) dateTimeError = dateTimeError.concat(timeErrorText);

    if (dateTimeError.length > 0) setDisplayError(dateTimeError.join(", "));
    else setDisplayError("");
  }, [dateErrorText, timeErrorText]);

  useEffect(() => {
    if (!loading && dateValue && dateValue.toString() !== "0001-01-01T00:00:00") {
      if (isValidDate(dateValue)) setSelectedDate(dateValue);
      else setSelectedDate(parseISO(dateValue));
    }
    if (
      !loading &&
      timeValue &&
      timeValue.toString() !== "0001-01-01T00:00:00" &&
      timeValue.toString() !== "00:00:00"
    ) {
      if (isValidDate(timeValue)) setSelectedTime(timeValue);
      else setSelectedTime(timeValue.includes("T") ? parseISO(timeValue) : parse(timeValue, "HH:mm:ss", new Date()));
    }
  }, [loading, dateValue, timeValue]);

  useEffect(() => {
    let element = null;

    if (isDateFocused) {
      element = document.getElementById(`${label.toLowerCase().replaceAll(" ", "-")}-date-picker-textfield`);
    } else if (isTimeFocused) {
      element = document.getElementById(`${label.toLowerCase().replaceAll(" ", "-")}-time-picker-textfield`);
    }

    if (element) element.focus();
  });

  return (
    <Box sx={FormBoxRowStyle(hasDateError.current || hasTimeError.current)}>
      <Grid2
        container
        justifyContent="flex-start"
        alignItems="center"
        sx={FormRowStyle(hasDateError.current || hasTimeError.current)}
      >
        <Grid2 size={3}>
          <Typography
            variant="body2"
            align="left"
            id={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
            sx={{ fontSize: "14px", color: adsMidGreyA, pt: "24px" }}
          >
            {`${label}${isRequired ? "*" : ""}`}
          </Typography>
        </Grid2>
        <Grid2 size={9}>
          {loading ? (
            <Skeleton variant="rectangular" animation="wave" height={`${skeletonHeight}px`} width="100%" />
          ) : isEditable ? (
            <Grid2 container justifyContent="flex-start" alignItems="center" spacing={1}>
              <Grid2 container direction="column" size={6}>
                <Grid2>
                  <Typography variant="body2">{`Date${isDateRequired ? "*" : ""}`}</Typography>
                </Grid2>
                <Grid2>
                  {dateHelperText && dateHelperText.length > 0 ? (
                    <Tooltip
                      title={isRequired ? dateHelperText + " This is a required field." : dateHelperText}
                      arrow
                      placement="right"
                      sx={tooltipStyle}
                    >
                      <div>
                        <DatePicker
                          id={`${label.toLowerCase().replaceAll(" ", "-")}-date-picker`}
                          format="dd MMM yyyy"
                          disableMaskedInput
                          value={selectedDate}
                          showTodayButton
                          required={isRequired}
                          disabled={!isEditable}
                          disableFuture={!allowFutureDates}
                          slotProps={{
                            textField: {
                              id: `${label.toLowerCase().replaceAll(" ", "-")}-date-picker-textfield`,
                              sx: FormDateInputStyle(hasDateError.current),
                              variant: "outlined",
                              error: hasDateError.current,
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
                      format="dd MMM yyyy"
                      disableMaskedInput
                      value={selectedDate}
                      showTodayButton
                      required={isRequired}
                      disabled={!isEditable}
                      disableFuture={!allowFutureDates}
                      slotProps={{
                        textField: {
                          id: `${label.toLowerCase().replaceAll(" ", "-")}-date-picker-textfield`,
                          sx: FormDateInputStyle(hasDateError.current),
                          variant: "outlined",
                          error: hasDateError.current,
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
                      aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-date-label`}
                      aria-describedby={`${label.toLowerCase().replaceAll(" ", "-")}-date-error`}
                    />
                  )}
                </Grid2>
              </Grid2>
              <Grid2 container direction="column" size={6}>
                <Grid2>
                  <Typography variant="body2">{`Time${isTimeRequired ? "*" : ""}`}</Typography>
                </Grid2>
                <Grid2>
                  {timeHelperText && timeHelperText.length > 0 ? (
                    <Tooltip
                      title={isRequired ? timeHelperText + " This is a required field." : timeHelperText}
                      arrow
                      placement="right"
                      sx={tooltipStyle}
                    >
                      <div>
                        <TimePicker
                          id={`${label.toLowerCase().replaceAll(" ", "-")}-time-picker`}
                          value={selectedTime}
                          required={isRequired}
                          disabled={!isEditable}
                          slotProps={{
                            textField: {
                              id: `${label.toLowerCase().replaceAll(" ", "-")}-time-picker-textfield`,
                              sx: FormDateInputStyle(hasTimeError.current),
                              variant: "outlined",
                              error: hasTimeError.current,
                              margin: "dense",
                              fullWidth: true,
                              size: "small",
                            },
                            field: { clearable: true },
                          }}
                          onChange={(newValue) => handleTimeChange(newValue)}
                          KeyboardButtonProps={{
                            "aria-label": "change time",
                          }}
                          aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-time-label`}
                          aria-describedby={`${label.toLowerCase().replaceAll(" ", "-")}-time-error`}
                        />
                      </div>
                    </Tooltip>
                  ) : (
                    <TimePicker
                      id={`${label.toLowerCase().replaceAll(" ", "-")}-time-picker`}
                      value={selectedTime}
                      required={isRequired}
                      disabled={!isEditable}
                      slotProps={{
                        textField: {
                          id: `${label.toLowerCase().replaceAll(" ", "-")}-time-picker-textfield`,
                          sx: FormDateInputStyle(hasTimeError.current),
                          variant: "outlined",
                          error: hasTimeError.current,
                          margin: "dense",
                          fullWidth: true,
                          size: "small",
                        },
                        field: { clearable: true },
                      }}
                      onChange={(newValue) => handleTimeChange(newValue)}
                      KeyboardButtonProps={{
                        "aria-label": "change time",
                      }}
                      aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-time-label`}
                      aria-describedby={`${label.toLowerCase().replaceAll(" ", "-")}-time-error`}
                    />
                  )}
                </Grid2>
              </Grid2>
            </Grid2>
          ) : (
            <Grid2 container justifyContent="flex-start" alignItems="center">
              <Grid2 container direction="column" size={6}>
                <Grid2>
                  <Typography variant="body2">{`Date${isDateRequired ? "*" : ""}`}</Typography>
                </Grid2>
                <Grid2>
                  {selectedDate && selectedDate.toString() !== "0001-01-01T00:00:00" ? (
                    <TextField
                      id={`${label.toLowerCase().replaceAll(" ", "-")}-date`}
                      sx={FormInputStyle(hasDateError.current)}
                      error={hasDateError.current}
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
                      sx={FormInputStyle(hasDateError.current)}
                      error={hasDateError.current}
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
              </Grid2>
              <Grid2 container direction="column" size={6}>
                <Grid2>
                  <Typography variant="body2">{`Time${isTimeRequired ? "*" : ""}`}</Typography>
                </Grid2>
                <Grid2>
                  {selectedTime && selectedTime.toString() !== "0001-01-01T00:00:00" ? (
                    <TextField
                      id={`${label.toLowerCase().replaceAll(" ", "-")}-time`}
                      sx={FormInputStyle(hasTimeError.current)}
                      error={hasTimeError.current}
                      rows={1}
                      fullWidth
                      disabled
                      required={isRequired}
                      variant="outlined"
                      margin="dense"
                      size="small"
                      value={dateFormat(selectedTime, "h:M tt")}
                    />
                  ) : (
                    <TextField
                      id={`${label.toLowerCase().replaceAll(" ", "-")}-date`}
                      sx={FormInputStyle(hasDateError.current || hasTimeError.current)}
                      error={hasDateError.current || hasTimeError.current}
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
              </Grid2>
            </Grid2>
          )}
        </Grid2>
        <ADSErrorDisplay errorText={displayError} id={`${label.toLowerCase().replaceAll(" ", "-")}-date-time-error`} />
      </Grid2>
    </Box>
  );
}

export default ADSDateTimeControl;
