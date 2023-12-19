/* #region header */
/**************************************************************************************************
//
//  Description: Filter by Date component
//
//  Copyright:    © 2021 - 2023 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   13.07.21 Sean Flook         WI39??? Initial Revision.
//    002   08.12.23 Sean Flook                 Migrated DatePicker to v6.
//    003   18.12.23 Sean Flook                 Ensure tooltip is displayed
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */

import React, { useState, Fragment, useEffect } from "react";
import PropTypes from "prop-types";
import { Grid, Typography, Badge, TextField, MenuItem } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { parseISO } from "date-fns";
import { isValidDate } from "../utils/HelperUtils";
import {
  FormRowStyle,
  FormInputStyle,
  FormSelectInputStyle,
  FormDateInputStyle,
  menuItemStyle,
} from "../utils/ADSStyles";

/* #endregion imports */

ADSFilterDateControl.propTypes = {
  label: PropTypes.string.isRequired,
  indicateChange: PropTypes.bool,
  filterType: PropTypes.number,
  lastN: PropTypes.number,
  lastPeriod: PropTypes.string,
  date1: PropTypes.string,
  date2: PropTypes.string,
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
  { id: 1, text: "Within the last" },
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
          <Fragment>
            <Grid item xs={2}>
              <TextField
                id={`${label.toLowerCase().replaceAll(" ", "-")}-within-last-number`}
                sx={FormInputStyle()}
                type="number"
                fullWidth
                variant="outlined"
                margin="dense"
                size="small"
                value={withinNumber}
                inputProps={{ min: 1 }}
                onChange={handleWithinNumberChangeEvent}
                aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
              />
            </Grid>
            <Grid item xs={6}>
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
                InputProps={{
                  alignItems: "center",
                }}
                aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
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
            </Grid>
          </Fragment>
        );

      case 2: // Between
        return (
          <Fragment>
            <Grid item xs>
              <DatePicker
                id={`${label.toLowerCase().replaceAll(" ", "-")}-between-date1`}
                format="dd/MM/yyyy"
                disableMaskedInput
                maxDate={new Date()}
                showTodayButton
                value={betweenDate1}
                slotProps={{
                  textField: {
                    id: `${label.toLowerCase().replaceAll(" ", "-")}-between-date1-picker-textfield`,
                    sx: FormDateInputStyle(),
                    variant: "outlined",
                    margin: "dense",
                    fullWidth: "true",
                    size: "small",
                  },
                }}
                onChange={(date) => handleBetweenDate1ChangeEvent(date)}
                KeyboardButtonProps={{
                  "aria-label": "change date",
                }}
                aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
              />
            </Grid>
            <Grid item xs={1}>
              <Typography variant="body2" align="center">
                and
              </Typography>
            </Grid>
            <Grid item xs>
              <DatePicker
                id={`${label.toLowerCase().replaceAll(" ", "-")}-between-date2`}
                format="dd/MM/yyyy"
                disableMaskedInput
                maxDate={new Date()}
                showTodayButton
                value={betweenDate2}
                initialFocusedDate={betweenDate2}
                slotProps={{
                  textField: {
                    id: `${label.toLowerCase().replaceAll(" ", "-")}-between-date2-picker-textfield`,
                    sx: FormDateInputStyle(),
                    variant: "outlined",
                    margin: "dense",
                    fullWidth: "true",
                    size: "small",
                  },
                }}
                onChange={(date) => handleBetweenDate2ChangeEvent(date)}
                KeyboardButtonProps={{
                  "aria-label": "change date",
                }}
                aria-labelledby={`${label.replaceAll(" ", "-")}-label`}
              />
            </Grid>
          </Fragment>
        );

      case 3: //Before
        return (
          <Grid item xs={8}>
            <DatePicker
              id={`${label.toLowerCase().replaceAll(" ", "-")}-before-date`}
              format="dd/MM/yyyy"
              disableMaskedInput
              maxDate={new Date()}
              value={betweenDate1}
              showTodayButton
              slotProps={{
                textField: {
                  id: `${label.toLowerCase().replaceAll(" ", "-")}-before-date-picker-textfield`,
                  sx: FormDateInputStyle(),
                  variant: "outlined",
                  margin: "dense",
                  fullWidth: "true",
                  size: "small",
                },
              }}
              onChange={(date) => handleBetweenDate1ChangeEvent(date)}
              KeyboardButtonProps={{
                "aria-label": "change date",
              }}
              aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
            />
          </Grid>
        );

      case 4: //On
        return (
          <Grid item xs={8}>
            <DatePicker
              id={`${label.toLowerCase().replaceAll(" ", "-")}-on-date`}
              format="dd/MM/yyyy"
              maxDate={new Date()}
              disableMaskedInput
              value={betweenDate1}
              showTodayButton
              slotProps={{
                textField: {
                  id: `${label.toLowerCase().replaceAll(" ", "-")}-on-date-picker-textfield`,
                  sx: FormDateInputStyle(),
                  variant: "outlined",
                  margin: "dense",
                  fullWidth: "true",
                  size: "small",
                },
              }}
              onChange={(date) => handleBetweenDate1ChangeEvent(date)}
              KeyboardButtonProps={{
                "aria-label": "change date",
              }}
              aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
            />
          </Grid>
        );

      default:
        // No Filter
        break;
    }
  };

  useEffect(() => {
    if (isValidDate(date1)) setBetweenDate1(date1);
    else setBetweenDate1(parseISO(date1));
    if (isValidDate(date2)) setBetweenDate2(date2);
    else setBetweenDate2(parseISO(date2));
  }, [date1, date2]);

  return (
    <Grid container justifyContent="flex-start" alignItems="center" sx={FormRowStyle()}>
      <Grid item xs={3}>
        <Badge color="secondary" variant="dot" invisible={!indicateChange || !dataChanged}>
          <Typography
            id={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
            variant="body2"
            color="textPrimary"
            align="left"
          >
            {label}
          </Typography>
        </Badge>
      </Grid>
      <Grid item xs={9}>
        <Grid container justifyContent="flex-start" alignItems="center" spacing={1}>
          <Grid item xs={4}>
            <TextField
              id={`${label.toLowerCase().replaceAll(" ", "-")}-select-type`}
              sx={FormSelectInputStyle()}
              fullWidth
              select
              defaultValue=""
              variant="outlined"
              margin="none"
              size="small"
              value={type}
              onChange={handleTypeChangeEvent}
              InputProps={{
                alignItems: "center",
              }}
              aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
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
          </Grid>
          {getDateControls()}
        </Grid>
      </Grid>
    </Grid>
  );
}

export default ADSFilterDateControl;
