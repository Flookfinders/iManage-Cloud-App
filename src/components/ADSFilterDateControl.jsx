/* #region header */
/**************************************************************************************************
//
//  Description: Filter by Date component
//
//  Copyright:    © 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//#region Version 1.0.0.0 changes
//    001   13.07.21 Sean Flook          WI39??? Initial Revision.
//    002   08.12.23 Sean Flook                  Migrated DatePicker to v6.
//    003   18.12.23 Sean Flook                  Ensure tooltip is displayed
//    004   03.01.24 Sean Flook                  Fixed warning.
//    005   16.01.24 Sean Flook        IMANN-237 Added a clear button.
//#endregion Version 1.0.0.0 changes
//#region Version 1.0.2.0 changes
//    006   12.11.24 Sean Flook                  Various required to improve the display of the controls.
//#endregion Version 1.0.2.0 changes
//#region Version 1.0.4.0 changes
//    007   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//#endregion Version 1.0.4.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Grid2, Typography, Badge, TextField, MenuItem, Stack } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { parseISO } from "date-fns";
import { isValidDate } from "../utils/HelperUtils";
import {
  FormRowStyle,
  FormInputStyle,
  FormSelectInputStyle,
  menuItemStyle,
  controlLabelStyle,
  FormDateInputNoMarginStyle,
} from "../utils/ADSStyles";

/* #endregion imports */

ADSFilterDateControl.propTypes = {
  label: PropTypes.string.isRequired,
  indicateChange: PropTypes.bool,
  filterType: PropTypes.number,
  lastN: PropTypes.number,
  lastPeriod: PropTypes.string,
  date1: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  date2: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  helperText: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

ADSFilterDateControl.defaultProps = {
  indicateChange: false,
  filterType: 0,
  lastN: 1,
  lastPeriod: "Weeks",
};

const dateFilters = [
  { id: 0, text: "No filter" },
  { id: 1, text: "Within last" },
  { id: 2, text: "Between" },
  { id: 3, text: "Before" },
  { id: 4, text: "On" },
];

const withinItems = ["Years", "Months", "Weeks", "Days"];

function ADSFilterDateControl({ label, indicateChange, filterType, lastN, lastPeriod, date1, date2, onChange }) {
  const [dataChanged, setDataChanged] = useState(false);
  const [type, setType] = useState(filterType);
  const [withinNumber, setWithinNumber] = useState(lastN);
  const [withinPeriod, setWithinPeriod] = useState(lastPeriod);
  const [betweenDate1, setBetweenDate1] = useState(date1);
  const [betweenDate2, setBetweenDate2] = useState(date2);

  /**
   * Event to handle when the type changes.
   *
   * @param {object} event The event object.
   */
  const handleTypeChangeEvent = (event) => {
    setType(event.target.value);
    setDataChanged(event.target.value !== 0);
    if (onChange)
      onChange({
        filterType: event.target.value,
        lastN: withinNumber,
        lastPeriod: withinPeriod,
        date1: betweenDate1,
        date2: betweenDate2,
      });
  };

  /**
   * Event to handle when the within number changes.
   *
   * @param {object} event The event object.
   */
  const handleWithinNumberChangeEvent = (event) => {
    setWithinNumber(parseInt(event.target.value));
    setDataChanged(true);
    if (onChange)
      onChange({
        filterType: type,
        lastN: parseInt(event.target.value),
        lastPeriod: withinPeriod,
        date1: betweenDate1,
        date2: betweenDate2,
      });
  };

  /**
   * Event to handle when the within period changes.
   *
   * @param {object} event The event object.
   */
  const handleWithinPeriodChangeEvent = (event) => {
    setWithinPeriod(event.target.value);
    setDataChanged(true);
    if (onChange)
      onChange({
        filterType: type,
        lastN: withinNumber,
        lastPeriod: event.target.value,
        date1: betweenDate1,
        date2: betweenDate2,
      });
  };

  /**
   * Event to handle when the between date 1 changes.
   *
   * @param {object} event The event object.
   */
  const handleBetweenDate1ChangeEvent = (date) => {
    setBetweenDate1(date);
    setDataChanged(true);
    if (onChange)
      onChange({
        filterType: type,
        lastN: withinNumber,
        lastPeriod: withinPeriod,
        date1: date,
        date2: betweenDate2,
      });
  };

  /**
   * Event to handle when the between date 2 changes.
   *
   * @param {object} event The event object.
   */
  const handleBetweenDate2ChangeEvent = (date) => {
    setBetweenDate2(date);
    setDataChanged(true);
    if (onChange)
      onChange({
        filterType: type,
        lastN: withinNumber,
        lastPeriod: withinPeriod,
        date1: betweenDate1,
        date2: date,
      });
  };

  /**
   * Method to get the controls required for the type.
   *
   * @returns {JSX.Element} The display controls.
   */
  const getDateControls = () => {
    switch (type) {
      case 1: //Within
        return (
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mt: "2px" }}>
            <TextField
              id={`${label.toLowerCase().replaceAll(" ", "-")}-within-last-number`}
              sx={FormInputStyle()}
              type="number"
              fullWidth
              variant="outlined"
              margin="dense"
              size="small"
              value={withinNumber}
              onChange={handleWithinNumberChangeEvent}
              aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
              slotProps={{
                htmlInput: { min: 1 },
              }}
            />
            <TextField
              id={`${label.toLowerCase().replaceAll(" ", "-")}-within-last-type`}
              sx={FormSelectInputStyle()}
              fullWidth
              select
              defaultValue=""
              variant="outlined"
              margin="dense"
              size="small"
              value={withinPeriod}
              onChange={handleWithinPeriodChangeEvent}
              aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
              slotProps={{
                input: {
                  alignItems: "center",
                },
              }}
            >
              {withinItems.map((option) => (
                <MenuItem key={option} value={option} sx={menuItemStyle(false)}>
                  <Typography
                    sx={{
                      verticalAlign: "middle",
                      display: "inline-flex",
                    }}
                    variant="inherit"
                  >
                    {option}
                  </Typography>
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        );

      case 2: // Between
        return (
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mt: "2px" }}>
            <DatePicker
              id={`${label.toLowerCase().replaceAll(" ", "-")}-between-date1`}
              format="dd/MM/yyyy"
              disableMaskedInput
              disableFuture
              showTodayButton
              margin="dense"
              value={betweenDate1}
              slotProps={{
                textField: {
                  id: `${label.toLowerCase().replaceAll(" ", "-")}-between-date1-picker-textfield`,
                  sx: FormDateInputNoMarginStyle(false),
                  variant: "outlined",
                  error: false,
                  margin: "dense",
                  fullWidth: true,
                  size: "small",
                },
                field: { clearable: true },
              }}
              onChange={(date) => handleBetweenDate1ChangeEvent(date)}
              KeyboardButtonProps={{
                "aria-label": "change date",
              }}
              aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
            />
            <Typography variant="body2" align="center">
              and
            </Typography>
            <DatePicker
              id={`${label.toLowerCase().replaceAll(" ", "-")}-between-date2`}
              format="dd/MM/yyyy"
              disableMaskedInput
              disableFuture
              showTodayButton
              margin="dense"
              value={betweenDate2}
              slotProps={{
                textField: {
                  id: `${label.toLowerCase().replaceAll(" ", "-")}-between-date2-picker-textfield`,
                  sx: FormDateInputNoMarginStyle(false),
                  variant: "outlined",
                  error: false,
                  margin: "dense",
                  fullWidth: true,
                  size: "small",
                },
                field: { clearable: true },
              }}
              onChange={(date) => handleBetweenDate2ChangeEvent(date)}
              KeyboardButtonProps={{
                "aria-label": "change date",
              }}
              aria-labelledby={`${label.replaceAll(" ", "-")}-label`}
            />
          </Stack>
        );

      case 3: //Before
        return (
          <DatePicker
            id={`${label.toLowerCase().replaceAll(" ", "-")}-before-date`}
            format="dd/MM/yyyy"
            disableMaskedInput
            disableFuture
            value={betweenDate1}
            showTodayButton
            margin="dense"
            slotProps={{
              textField: {
                id: `${label.toLowerCase().replaceAll(" ", "-")}-before-date-picker-textfield`,
                sx: FormDateInputNoMarginStyle(false),
                variant: "outlined",
                error: false,
                margin: "dense",
                fullWidth: true,
                size: "small",
              },
              field: { clearable: true },
            }}
            onChange={(date) => handleBetweenDate1ChangeEvent(date)}
            KeyboardButtonProps={{
              "aria-label": "change date",
            }}
            aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
          />
        );

      case 4: //On
        return (
          <DatePicker
            id={`${label.toLowerCase().replaceAll(" ", "-")}-on-date`}
            format="dd/MM/yyyy"
            disableFuture
            disableMaskedInput
            value={betweenDate1}
            showTodayButton
            margin="dense"
            slotProps={{
              textField: {
                id: `${label.toLowerCase().replaceAll(" ", "-")}-on-date-picker-textfield`,
                sx: FormDateInputNoMarginStyle(false),
                variant: "outlined",
                error: false,
                margin: "dense",
                fullWidth: true,
                size: "small",
              },
              field: { clearable: true },
            }}
            onChange={(date) => handleBetweenDate1ChangeEvent(date)}
            KeyboardButtonProps={{
              "aria-label": "change date",
            }}
            aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
          />
        );

      default:
        // No Filter
        break;
    }
  };

  useEffect(() => {
    setType(filterType);
    setWithinNumber(lastN);
    setWithinPeriod(lastPeriod);
    if (isValidDate(date1)) setBetweenDate1(date1);
    else setBetweenDate1(parseISO(date1));
    if (isValidDate(date2)) setBetweenDate2(date2);
    else setBetweenDate2(parseISO(date2));
  }, [filterType, lastN, lastPeriod, date1, date2]);

  return (
    <Grid2 container justifyContent="flex-start" alignItems="center" sx={FormRowStyle()}>
      <Grid2 size={3}>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mr: "16px" }}>
          <Typography
            id={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
            variant="body2"
            align="left"
            sx={controlLabelStyle}
          >
            {label}
          </Typography>
          <Badge color="error" variant="dot" invisible={!indicateChange || !dataChanged} />
        </Stack>
      </Grid2>
      <Grid2 size={9}>
        <Grid2 container justifyContent="flex-start" alignItems="center" spacing={1}>
          <Grid2 size={3}>
            <TextField
              id={`${label.toLowerCase().replaceAll(" ", "-")}-select-type`}
              sx={FormSelectInputStyle()}
              fullWidth
              select
              defaultValue=""
              variant="outlined"
              margin="dense"
              size="small"
              value={type}
              onChange={handleTypeChangeEvent}
              aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
              slotProps={{
                input: {
                  alignItems: "center",
                },
              }}
            >
              {dateFilters.map((option) => (
                <MenuItem key={option.id} value={option.id} sx={menuItemStyle(false)}>
                  <Typography
                    sx={{
                      verticalAlign: "middle",
                      display: "inline-flex",
                    }}
                    variant="inherit"
                  >
                    {option.text}
                  </Typography>
                </MenuItem>
              ))}
            </TextField>
          </Grid2>
          <Grid2 size={9}>{getDateControls()}</Grid2>
        </Grid2>
      </Grid2>
    </Grid2>
  );
}

export default ADSFilterDateControl;
