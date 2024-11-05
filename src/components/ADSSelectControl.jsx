/* #region header */
/**************************************************************************************************
//
//  Description: Select component
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   13.04.21 Sean Flook         WI39345 Initial Revision.
//    002   05.05.21 Sean Flook         WI39345 Tweaks to the UI after design review meeting.
//    003   12.05.21 Sean Flook         WI39345 Changed to allow for the display of icons.
//    004   14.05.21 Sean Flook         WI39345 Updated className.
//    005   18.05.21 Sean Flook         WI39345 Use the value directly.
//    006   20.05.21 Sean Flook         WI39345 Display a tooltip if required.
//    007   25.05.21 Sean Flook         WI39345 Include required field text if required to tooltip.
//    008   01.06.21 Sean Flook         WI39345 Ensure the image is inline with the text.
//    009   08.06.21 Sean Flook         WI39345 Changed read-only version to a label and altered colour of outline.
//    010   16.03.23 Sean Flook         WI40580 Handle missing xrefSourceRef73 data in getAvatarValue.
//    011   27.06.23 Sean Flook         WI40729 Correctly handle if errorText is a string rather then an array.
//    012   27.06.23 Sean Flook         WI40234 Handle the doNotSetTitleCase flag when control is read only.
//    013   06.10.23 Sean Flook                 Use colour variables.
//    014   27.10.23 Sean Flook       IMANN-175 Added a placeholder to display 'No change' if required.
//    015   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system.
//    016   05.01.24 Sean Flook                 Use CSS shortcuts.
//    017   06.02.23 Sean Flook       IMANN-264 If we have no lookup data ensure the options are cleared.
//    018   14.03.24 Sean Flook        ESU19_GP Use the lookupColour for the icon background colour.
//    019   09.04.24 Sean Flook       IMANN-376 Modified to show an add button if required.
//    020   13.06.24 Sean Flook       IMANN-553 Changes required to handle values of 0.
//    021   28.08.24 Sean Flook       IMANN-961 Use a TextField when user is read only.
//#endregion Version 1.0.0.0 changes
//#region Version 1.0.1.0 changes
//    022   31.10.24 Sean Flook      IMANN-1012 Fix the height of the skeleton controls.
//#endregion Version 1.0.1.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */

import React, { useRef, useState, useEffect, Fragment } from "react";
import PropTypes from "prop-types";

import {
  Grid,
  TextField,
  Typography,
  Tooltip,
  Avatar,
  InputAdornment,
  Autocomplete,
  Skeleton,
  IconButton,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSErrorDisplay from "./ADSErrorDisplay";

import { lookupToTitleCase } from "../utils/HelperUtils";

import { SyncAlt as TwoWayIcon } from "@mui/icons-material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { StartToEndIcon, EndToStartIcon } from "../utils/ADSIcons";

import { adsBlueA, adsRed, adsDarkGrey, adsWhite, adsLightGreyA, adsBlack, adsYellow } from "../utils/ADSColours";
import {
  ActionIconStyle,
  FormBoxRowStyle,
  FormInputStyle,
  FormRowStyle,
  FormSelectInputStyle,
  controlLabelStyle,
  skeletonHeight,
  tooltipStyle,
} from "../utils/ADSStyles";

/* #endregion imports */

ADSSelectControl.propTypes = {
  label: PropTypes.string.isRequired,
  isEditable: PropTypes.bool,
  isRequired: PropTypes.bool,
  isFocused: PropTypes.bool,
  includeHistoric: PropTypes.bool,
  doNotSetTitleCase: PropTypes.bool,
  loading: PropTypes.bool,
  useRounded: PropTypes.bool,
  isCrossRef: PropTypes.bool,
  isClassification: PropTypes.bool,
  includeHiddenCode: PropTypes.bool,
  displayNoChange: PropTypes.bool,
  allowAddLookup: PropTypes.bool,
  lookupData: PropTypes.array.isRequired,
  lookupId: PropTypes.string.isRequired,
  lookupLabel: PropTypes.string.isRequired,
  lookupColour: PropTypes.string,
  lookupIcon: PropTypes.string,
  lookupHistoric: PropTypes.string,
  helperText: PropTypes.string,
  value: PropTypes.any,
  errorText: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  onAddLookup: PropTypes.func,
};

ADSSelectControl.defaultProps = {
  isEditable: false,
  isRequired: false,
  isFocused: false,
  includeHistoric: false,
  doNotSetTitleCase: false,
  loading: false,
  useRounded: false,
  isCrossRef: false,
  isClassification: false,
  includeHiddenCode: false,
  displayNoChange: false,
  allowAddLookup: false,
};

function ADSSelectControl({
  label,
  isEditable,
  isRequired,
  isFocused,
  includeHistoric,
  doNotSetTitleCase,
  loading,
  useRounded,
  isCrossRef,
  isClassification,
  includeHiddenCode,
  displayNoChange,
  allowAddLookup,
  lookupData,
  lookupId,
  lookupLabel,
  lookupColour,
  lookupIcon,
  lookupHistoric,
  helperText,
  value,
  errorText,
  onChange,
  onAddLookup,
}) {
  const [displayError, setDisplayError] = useState("");
  const hasError = useRef(false);
  const [options, setOptions] = useState([]);
  const [controlValue, setControlValue] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [controlFocused, setControlFocused] = useState(false);

  /**
   * Event to handle when the control value changes.
   *
   * @param {object} event The event object.
   * @param {string} newValue The updated value
   */
  const handleChangeEvent = (event, newValue) => {
    const updatedValue = stripCodeFromValue(newValue);

    setControlValue(updatedValue);

    if (onChange) {
      const selectedItem = getSelectedItem(updatedValue);
      if (selectedItem && selectedItem.length > 0) onChange(selectedItem[0][lookupId]);
      else onChange(null);
    }
  };

  /**
   * Event to handle when the control is focused.
   */
  const handleFocus = () => {
    setControlFocused(true);
  };

  /**
   * Event to handle when the control looses focus.
   */
  const handleBlur = () => {
    setControlFocused(false);
  };

  /**
   * Event to handle when the add lookup button is clicked.
   */
  const handleAddLookup = () => {
    if (onAddLookup) onAddLookup();
  };

  /**
   * Method to get the icon.
   *
   * @param {string} iconInfo The icon information either type of URL.
   * @param {string} backgroundColour The background colour to use for the icon.
   * @returns {JSX.Element} The icon.
   */
  function getIcon(iconInfo, backgroundColour) {
    switch (iconInfo) {
      case "TwoWay":
        return (
          <TwoWayIcon
            sx={{
              color: adsWhite,
              backgroundColor: backgroundColour,
            }}
          />
        );

      case "StartToEnd":
        return (
          <StartToEndIcon
            sx={{
              color: adsWhite,
              backgroundColor: backgroundColour,
            }}
          />
        );

      case "EndToStart":
        return (
          <EndToStartIcon
            sx={{
              color: adsWhite,
              backgroundColor: backgroundColour,
            }}
          />
        );

      default:
        return <img src={iconInfo} alt="" width="20" height="20" />;
    }
  }

  /**
   * Method to get the lookup information.
   *
   * @param {number} value The id of the lookup.
   * @returns {JSX.Element} The display of the lookup item.
   */
  const getLookupInfo = (value) => {
    if (lookupData) {
      const currentRow = lookupData.filter((x) => x[lookupId] === value);

      if (currentRow && currentRow.length > 0) {
        if (lookupIcon && currentRow[0][lookupIcon] && currentRow[0][lookupIcon].length !== 0) {
          return (
            <TextField
              id={`${label.toLowerCase().replaceAll(" ", "-")}-lookup-info`}
              sx={FormInputStyle(hasError.current)}
              error={hasError.current}
              fullWidth
              disabled
              required={isRequired}
              variant="outlined"
              margin="dense"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {getIcon(currentRow[0][lookupIcon], lookupColour ? currentRow[0][lookupColour] : adsBlueA)}
                  </InputAdornment>
                ),
              }}
              value={lookupToTitleCase(currentRow[0][lookupLabel], doNotSetTitleCase)}
            />
          );
        } else {
          return (
            <TextField
              id={`${label.toLowerCase().replaceAll(" ", "-")}-lookup-info`}
              sx={FormInputStyle(hasError.current)}
              error={hasError.current}
              rows={1}
              fullWidth
              disabled
              required={isRequired}
              variant="outlined"
              margin="dense"
              size="small"
              value={lookupToTitleCase(currentRow[0][lookupLabel], doNotSetTitleCase)}
            />
          );
        }
      } else {
        return (
          <TextField
            id={`${label.toLowerCase().replaceAll(" ", "-")}-lookup-info`}
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
        );
      }
    }
  };

  /**
   * Method to get the avatar text styling.
   *
   * @param {object} selectedItem The selected record.
   * @returns {object} The styling for the avatar text.
   */
  function getAvatarTextStyle(selectedItem) {
    switch (lookupColour.includes("#") ? lookupColour : selectedItem[0][lookupColour]) {
      case adsYellow:
      case adsLightGreyA:
        return {
          color: adsBlack,
          fontWeight: 500,
          fontFamily: "Open Sans",
        };

      default:
        return {
          color: adsWhite,
          fontWeight: 500,
          fontFamily: "Open Sans",
        };
    }
  }

  /**
   * Method to strip the code from the supplied value.
   *
   * @param {string} value The value from the control.
   * @returns {string|null} The code within the value.
   */
  const stripCodeFromValue = (value) => {
    if (!value) return value;

    if (includeHiddenCode && value && value.indexOf("|") !== -1) return value.substring(0, value.indexOf("|"));
    else return value;
  };

  /**
   * Method to get the item avatar.
   *
   * @param {string} value The control value.
   * @returns {JSX.Element} The item avatar.
   */
  function getItemAvatar(value) {
    const selectedItem = getSelectedItem(stripCodeFromValue(value));

    if (selectedItem && selectedItem.length > 0) {
      return (
        <Avatar
          id={`${label.toLowerCase().replaceAll(" ", "-")}-avatar`}
          variant={useRounded ? "rounded" : "circular"}
          sx={getAvatarColour(stripCodeFromValue(value))}
          aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
        >
          {lookupIcon && selectedItem[0][lookupIcon] && selectedItem[0][lookupIcon].length > 0 ? (
            getIcon(selectedItem[0][lookupIcon], lookupColour ? selectedItem[0][lookupColour] : adsBlueA)
          ) : (
            <Typography variant="caption" sx={getAvatarTextStyle(selectedItem)}>
              {getAvatarValue(stripCodeFromValue(value))}
            </Typography>
          )}
        </Avatar>
      );
    }
  }

  /**
   * Method to get the avatar value.
   *
   * @param {string} value The control value
   * @returns {string|null} The avatar value.
   */
  function getAvatarValue(value) {
    const selectedItem = getSelectedItem(value);

    if (selectedItem && selectedItem.length > 0) {
      if (!isCrossRef) return selectedItem[0][lookupId];
      else if (selectedItem[0].xrefSourceRef73) return selectedItem[0].xrefSourceRef73.substring(4, 6);
      else if (selectedItem[0].xrefSourceRef) return selectedItem[0].xrefSourceRef.substring(0, 2);
      else return null;
    } else return null;
  }

  /**
   * Method to get the selected item.
   *
   * @param {string} value The display value for the control
   * @returns {array|null} The lookup row with the given label.
   */
  function getSelectedItem(value) {
    if (!lookupData || !value) return null;
    return lookupData.filter((x) => x[lookupLabel] === value);
  }

  /**
   * Method to get the avatar colour and styling.
   *
   * @param {string} value The display value for the control
   * @returns {object} The styling for the avatar.
   */
  function getAvatarColour(value) {
    const selectedItem = getSelectedItem(value);

    if (selectedItem && selectedItem.length > 0) {
      const avatarColour = lookupColour.includes("#") ? lookupColour : selectedItem[0][lookupColour];
      const avatarWidth =
        selectedItem[0][lookupId].toString().length <= 2
          ? "24px"
          : selectedItem[0][lookupId].toString().length <= 3
          ? "36px"
          : "48px";

      return {
        backgroundColor: avatarColour,
        height: "24px",
        width: avatarWidth,
      };
    } else
      return {
        backgroundColor: adsBlueA,
        width: "24px",
        height: "24px",
      };
  }

  /**
   * Method to determine if the item is historic.
   *
   * @param {string} value The display value for the control
   * @returns {boolean} True if the item is a historic item; otherwise false.
   */
  function isHistoric(value) {
    const selectedItem = getSelectedItem(stripCodeFromValue(value));

    if (selectedItem && selectedItem.length > 0) return selectedItem[0][lookupHistoric];
    else return false;
  }

  useEffect(() => {
    hasError.current = errorText && errorText.length > 0;

    if (hasError.current) {
      if (Array.isArray(errorText)) setDisplayError(errorText.join(", "));
      else setDisplayError(errorText);
    } else setDisplayError(null);

    if (lookupData && lookupData.length > 0) {
      if (includeHiddenCode) {
        if (includeHistoric) {
          const mappedData = lookupData.map((a) => `${a[lookupLabel]}|${a[lookupId]}`);
          if (mappedData.length !== options.length) setOptions(mappedData);
        } else {
          const filteredData = lookupData
            .filter((x) => !x[lookupHistoric])
            .map((a) => `${a[lookupLabel]}|${a[lookupId]}`);
          if (filteredData.length !== options.length) setOptions(filteredData);
        }
      } else {
        if (includeHistoric) {
          const mappedData = lookupData.map((a) => a[lookupLabel]);
          if (mappedData.length !== options.length) setOptions(mappedData);
        } else {
          const filteredData = lookupData.filter((x) => !x[lookupHistoric]).map((a) => a[lookupLabel]);
          if (filteredData.length !== options.length) setOptions(filteredData);
        }
      }
    } else if (options.length) setOptions([]);
  }, [errorText, includeHistoric, includeHiddenCode, lookupData, lookupLabel, lookupId, lookupHistoric, options]);

  useEffect(() => {
    if ((!controlValue || currentValue !== value) && lookupData) {
      const selectedItem = lookupData.filter(
        (x) =>
          (x[lookupId] || x[lookupId] === 0) && (value || value === 0) && x[lookupId].toString() === value.toString()
      );

      if (selectedItem && selectedItem.length > 0) {
        setControlValue(selectedItem[0][lookupLabel]);
      } else {
        setControlValue(null);
      }

      setCurrentValue(value);
    } else if (!value && value !== 0) {
      setControlValue(null);
    }
  }, [lookupData, controlValue, currentValue, value, lookupId, lookupLabel]);

  useEffect(() => {
    let element = null;

    if (isFocused) {
      element = document.getElementById(`ads-select-${label.toLowerCase().replaceAll(" ", "-")}`);
    }

    if (element) element.focus();
  });

  return (
    <Box sx={FormBoxRowStyle(hasError.current)}>
      <Grid container justifyContent="flex-start" alignItems="center" sx={FormRowStyle(hasError.current)}>
        <Grid item xs={3}>
          <Typography
            id={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
            variant="body2"
            align="left"
            sx={controlLabelStyle}
          >
            {`${label}${isRequired ? "*" : ""}`}
          </Typography>
        </Grid>
        <Grid item xs={9}>
          {loading ? (
            <Skeleton variant="rectangular" animation="wave" height={`${skeletonHeight}px`} width="100%" />
          ) : isEditable ? (
            helperText && helperText.length > 0 ? (
              lookupColour ? (
                isClassification ? (
                  <Tooltip
                    title={isRequired ? helperText + " This is a required field." : helperText}
                    arrow
                    placement="right"
                    sx={tooltipStyle}
                  >
                    <Autocomplete
                      id={`ads-select-${label.toLowerCase().replaceAll(" ", "-")}`}
                      sx={{
                        color: "inherit",
                      }}
                      getOptionLabel={(option) => lookupToTitleCase(option, doNotSetTitleCase)}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      noOptionsText={`No ${label} records`}
                      options={options}
                      value={controlValue}
                      autoHighlight
                      autoSelect
                      onChange={handleChangeEvent}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      renderOption={(props, option) => {
                        return (
                          <li {...props}>
                            <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={1}>
                              {lookupColour && getItemAvatar(option)}
                              {includeHiddenCode ? (
                                <Fragment>
                                  <Typography
                                    variant="body2"
                                    color={includeHistoric && isHistoric(option) ? adsRed : adsDarkGrey}
                                    align="left"
                                  >
                                    {lookupToTitleCase(
                                      option ? option.substring(0, option.indexOf("|")) : option,
                                      doNotSetTitleCase
                                    )}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{ visibility: "hidden" }}
                                    color={includeHistoric && isHistoric(option) ? adsRed : "textDisabled"}
                                    align="left"
                                  >
                                    {option ? option.substring(option.indexOf("|") + 1) : option}
                                  </Typography>
                                </Fragment>
                              ) : (
                                <Typography
                                  variant="body2"
                                  color={includeHistoric && isHistoric(option) ? adsRed : adsDarkGrey}
                                  align="left"
                                >
                                  {lookupToTitleCase(option, doNotSetTitleCase)}
                                </Typography>
                              )}
                            </Stack>
                          </li>
                        );
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          sx={FormSelectInputStyle(hasError.current)}
                          error={hasError.current}
                          fullWidth
                          disabled={!isEditable}
                          required={isRequired}
                          placeholder={displayNoChange ? "No change" : null}
                          variant="outlined"
                          margin="dense"
                          size="small"
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <InputAdornment position="start">{getItemAvatar(controlValue)}</InputAdornment>
                            ),
                          }}
                        />
                      )}
                      aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
                    />
                  </Tooltip>
                ) : allowAddLookup && controlFocused ? (
                  <Tooltip
                    title={isRequired ? helperText + " This is a required field." : helperText}
                    arrow
                    placement="right"
                    sx={tooltipStyle}
                  >
                    <Autocomplete
                      id={`ads-select-${label.toLowerCase().replaceAll(" ", "-")}`}
                      sx={{
                        color: "inherit",
                      }}
                      getOptionLabel={(option) => lookupToTitleCase(option, doNotSetTitleCase)}
                      noOptionsText={`No ${label} records`}
                      options={options}
                      value={controlValue}
                      autoHighlight
                      autoSelect
                      onChange={handleChangeEvent}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      renderOption={(props, option) => {
                        return (
                          <li {...props}>
                            <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={1}>
                              {lookupColour && getItemAvatar(option)}
                              {includeHiddenCode ? (
                                <Fragment>
                                  <Typography
                                    variant="body2"
                                    color={includeHistoric && isHistoric(option) ? adsRed : adsDarkGrey}
                                    align="left"
                                  >
                                    {lookupToTitleCase(
                                      option ? option.substring(0, option.indexOf("|")) : option,
                                      doNotSetTitleCase
                                    )}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{ visibility: "hidden" }}
                                    color={includeHistoric && isHistoric(option) ? adsRed : "textDisabled"}
                                    align="left"
                                  >
                                    {option ? option.substring(option.indexOf("|") + 1) : option}
                                  </Typography>
                                </Fragment>
                              ) : (
                                <Typography
                                  variant="body2"
                                  color={includeHistoric && isHistoric(option) ? adsRed : adsDarkGrey}
                                  align="left"
                                >
                                  {lookupToTitleCase(option, doNotSetTitleCase)}
                                </Typography>
                              )}
                            </Stack>
                          </li>
                        );
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          sx={FormSelectInputStyle(hasError.current)}
                          error={hasError.current}
                          fullWidth
                          disabled={!isEditable}
                          required={isRequired}
                          placeholder={displayNoChange ? "No change" : null}
                          variant="outlined"
                          margin="dense"
                          size="small"
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <InputAdornment position="start">{getItemAvatar(controlValue)}</InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  id="btnClear"
                                  onClick={handleAddLookup}
                                  aria-label="add button"
                                  size="small"
                                >
                                  <AddCircleOutlineIcon sx={ActionIconStyle()} />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                      aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
                    />
                  </Tooltip>
                ) : (
                  <Tooltip
                    title={isRequired ? helperText + " This is a required field." : helperText}
                    arrow
                    placement="right"
                    sx={tooltipStyle}
                  >
                    <Autocomplete
                      id={`ads-select-${label.toLowerCase().replaceAll(" ", "-")}`}
                      sx={{
                        color: "inherit",
                      }}
                      getOptionLabel={(option) => lookupToTitleCase(option, doNotSetTitleCase)}
                      noOptionsText={`No ${label} records`}
                      options={options}
                      value={controlValue}
                      autoHighlight
                      autoSelect
                      onChange={handleChangeEvent}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      renderOption={(props, option) => {
                        return (
                          <li {...props}>
                            <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={1}>
                              {lookupColour && getItemAvatar(option)}
                              {includeHiddenCode ? (
                                <Fragment>
                                  <Typography
                                    variant="body2"
                                    color={includeHistoric && isHistoric(option) ? adsRed : adsDarkGrey}
                                    align="left"
                                  >
                                    {lookupToTitleCase(
                                      option ? option.substring(0, option.indexOf("|")) : option,
                                      doNotSetTitleCase
                                    )}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{ visibility: "hidden" }}
                                    color={includeHistoric && isHistoric(option) ? adsRed : "textDisabled"}
                                    align="left"
                                  >
                                    {option ? option.substring(option.indexOf("|") + 1) : option}
                                  </Typography>
                                </Fragment>
                              ) : (
                                <Typography
                                  variant="body2"
                                  color={includeHistoric && isHistoric(option) ? adsRed : adsDarkGrey}
                                  align="left"
                                >
                                  {lookupToTitleCase(option, doNotSetTitleCase)}
                                </Typography>
                              )}
                            </Stack>
                          </li>
                        );
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          sx={FormSelectInputStyle(hasError.current)}
                          error={hasError.current}
                          fullWidth
                          disabled={!isEditable}
                          required={isRequired}
                          placeholder={displayNoChange ? "No change" : null}
                          variant="outlined"
                          margin="dense"
                          size="small"
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <InputAdornment position="start">{getItemAvatar(controlValue)}</InputAdornment>
                            ),
                          }}
                        />
                      )}
                      aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
                    />
                  </Tooltip>
                )
              ) : isClassification ? (
                <Tooltip
                  title={isRequired ? helperText + " This is a required field." : helperText}
                  arrow
                  placement="right"
                  sx={tooltipStyle}
                >
                  <Autocomplete
                    id={`ads-select-${label.toLowerCase().replaceAll(" ", "-")}`}
                    sx={{
                      color: "inherit",
                    }}
                    getOptionLabel={(option) => lookupToTitleCase(option, doNotSetTitleCase)}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    noOptionsText={`No ${label} records`}
                    options={options}
                    value={controlValue}
                    autoHighlight
                    autoSelect
                    onChange={handleChangeEvent}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    renderOption={(props, option) => {
                      return (
                        <li {...props}>
                          <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={1}>
                            {lookupColour && getItemAvatar(option)}
                            {includeHiddenCode ? (
                              <Fragment>
                                <Typography
                                  variant="body2"
                                  color={includeHistoric && isHistoric(option) ? adsRed : adsDarkGrey}
                                  align="left"
                                >
                                  {lookupToTitleCase(
                                    option ? option.substring(0, option.indexOf("|")) : option,
                                    doNotSetTitleCase
                                  )}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ visibility: "hidden" }}
                                  color={includeHistoric && isHistoric(option) ? adsRed : "textDisabled"}
                                  align="left"
                                >
                                  {option ? option.substring(option.indexOf("|") + 1) : option}
                                </Typography>
                              </Fragment>
                            ) : (
                              <Typography
                                variant="body2"
                                color={includeHistoric && isHistoric(option) ? adsRed : adsDarkGrey}
                                align="left"
                              >
                                {lookupToTitleCase(option, doNotSetTitleCase)}
                              </Typography>
                            )}
                          </Stack>
                        </li>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        sx={FormSelectInputStyle(hasError.current)}
                        error={hasError.current}
                        fullWidth
                        disabled={!isEditable}
                        required={isRequired}
                        placeholder={displayNoChange ? "No change" : null}
                        variant="outlined"
                        margin="dense"
                        size="small"
                        InputProps={{
                          ...params.InputProps,
                        }}
                      />
                    )}
                    aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
                  />
                </Tooltip>
              ) : allowAddLookup && controlFocused ? (
                <Tooltip
                  title={isRequired ? helperText + " This is a required field." : helperText}
                  arrow
                  placement="right"
                  sx={tooltipStyle}
                >
                  <Autocomplete
                    id={`ads-select-${label.toLowerCase().replaceAll(" ", "-")}`}
                    sx={{
                      color: "inherit",
                    }}
                    getOptionLabel={(option) => lookupToTitleCase(option, doNotSetTitleCase)}
                    noOptionsText={`No ${label} records`}
                    options={options}
                    value={controlValue}
                    autoHighlight
                    autoSelect
                    onChange={handleChangeEvent}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    renderOption={(props, option) => {
                      return (
                        <li {...props}>
                          <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={1}>
                            {lookupColour && getItemAvatar(option)}
                            {includeHiddenCode ? (
                              <Fragment>
                                <Typography
                                  variant="body2"
                                  color={includeHistoric && isHistoric(option) ? adsRed : adsDarkGrey}
                                  align="left"
                                >
                                  {lookupToTitleCase(
                                    option ? option.substring(0, option.indexOf("|")) : option,
                                    doNotSetTitleCase
                                  )}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ visibility: "hidden" }}
                                  color={includeHistoric && isHistoric(option) ? adsRed : "textDisabled"}
                                  align="left"
                                >
                                  {option ? option.substring(option.indexOf("|") + 1) : option}
                                </Typography>
                              </Fragment>
                            ) : (
                              <Typography
                                variant="body2"
                                color={includeHistoric && isHistoric(option) ? adsRed : adsDarkGrey}
                                align="left"
                              >
                                {lookupToTitleCase(option, doNotSetTitleCase)}
                              </Typography>
                            )}
                          </Stack>
                        </li>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        sx={FormSelectInputStyle(hasError.current)}
                        error={hasError.current}
                        fullWidth
                        disabled={!isEditable}
                        required={isRequired}
                        placeholder={displayNoChange ? "No change" : null}
                        variant="outlined"
                        margin="dense"
                        size="small"
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton id="btnClear" onClick={handleAddLookup} aria-label="add button" size="small">
                                <AddCircleOutlineIcon sx={ActionIconStyle()} />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                    aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
                  />
                </Tooltip>
              ) : (
                <Tooltip
                  title={isRequired ? helperText + " This is a required field." : helperText}
                  arrow
                  placement="right"
                  sx={tooltipStyle}
                >
                  <Autocomplete
                    id={`ads-select-${label.toLowerCase().replaceAll(" ", "-")}`}
                    sx={{
                      color: "inherit",
                    }}
                    getOptionLabel={(option) => lookupToTitleCase(option, doNotSetTitleCase)}
                    noOptionsText={`No ${label} records`}
                    options={options}
                    value={controlValue}
                    autoHighlight
                    autoSelect
                    onChange={handleChangeEvent}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    renderOption={(props, option) => {
                      return (
                        <li {...props}>
                          <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={1}>
                            {lookupColour && getItemAvatar(option)}
                            {includeHiddenCode ? (
                              <Fragment>
                                <Typography
                                  variant="body2"
                                  color={includeHistoric && isHistoric(option) ? adsRed : adsDarkGrey}
                                  align="left"
                                >
                                  {lookupToTitleCase(
                                    option ? option.substring(0, option.indexOf("|")) : option,
                                    doNotSetTitleCase
                                  )}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ visibility: "hidden" }}
                                  color={includeHistoric && isHistoric(option) ? adsRed : "textDisabled"}
                                  align="left"
                                >
                                  {option ? option.substring(option.indexOf("|") + 1) : option}
                                </Typography>
                              </Fragment>
                            ) : (
                              <Typography
                                variant="body2"
                                color={includeHistoric && isHistoric(option) ? adsRed : adsDarkGrey}
                                align="left"
                              >
                                {lookupToTitleCase(option, doNotSetTitleCase)}
                              </Typography>
                            )}
                          </Stack>
                        </li>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        sx={FormSelectInputStyle(hasError.current)}
                        error={hasError.current}
                        fullWidth
                        disabled={!isEditable}
                        required={isRequired}
                        placeholder={displayNoChange ? "No change" : null}
                        variant="outlined"
                        margin="dense"
                        size="small"
                        InputProps={{
                          ...params.InputProps,
                        }}
                      />
                    )}
                    aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
                  />
                </Tooltip>
              )
            ) : lookupColour ? (
              isClassification ? (
                <Autocomplete
                  id={`ads-select-${label.toLowerCase().replaceAll(" ", "-")}`}
                  sx={{
                    color: "inherit",
                  }}
                  getOptionLabel={(option) => lookupToTitleCase(option, doNotSetTitleCase)}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  noOptionsText={`No ${label} records`}
                  options={options}
                  autoHighlight
                  autoSelect
                  value={controlValue}
                  onChange={handleChangeEvent}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  renderOption={(props, option) => {
                    return (
                      <li {...props}>
                        {includeHiddenCode ? (
                          <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={1}>
                            <Typography
                              variant="body2"
                              color={includeHistoric && isHistoric(option) ? adsRed : adsDarkGrey}
                              align="left"
                            >
                              {lookupToTitleCase(
                                option ? option.substring(0, option.indexOf("|")) : option,
                                doNotSetTitleCase
                              )}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ visibility: "hidden" }}
                              color={includeHistoric && isHistoric(option) ? adsRed : "textDisabled"}
                              align="left"
                            >
                              {option ? option.substring(option.indexOf("|") + 1) : option}
                            </Typography>
                          </Stack>
                        ) : (
                          <Typography
                            variant="body2"
                            color={includeHistoric && isHistoric(option) ? adsRed : adsDarkGrey}
                            align="left"
                          >
                            {lookupToTitleCase(option, doNotSetTitleCase)}
                          </Typography>
                        )}
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      sx={FormSelectInputStyle(hasError.current)}
                      error={hasError.current}
                      fullWidth
                      disabled={!isEditable}
                      required={isRequired}
                      placeholder={displayNoChange ? "No change" : null}
                      variant="outlined"
                      margin="dense"
                      size="small"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: <InputAdornment position="start">{getItemAvatar(controlValue)}</InputAdornment>,
                      }}
                    />
                  )}
                  aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
                />
              ) : allowAddLookup && controlFocused ? (
                <Autocomplete
                  id={`ads-select-${label.toLowerCase().replaceAll(" ", "-")}`}
                  sx={{
                    color: "inherit",
                  }}
                  getOptionLabel={(option) => lookupToTitleCase(option, doNotSetTitleCase)}
                  noOptionsText={`No ${label} records`}
                  options={options}
                  autoHighlight
                  autoSelect
                  value={controlValue}
                  onChange={handleChangeEvent}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  renderOption={(props, option) => {
                    return (
                      <li {...props}>
                        {includeHiddenCode ? (
                          <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={1}>
                            <Typography
                              variant="body2"
                              color={includeHistoric && isHistoric(option) ? adsRed : adsDarkGrey}
                              align="left"
                            >
                              {lookupToTitleCase(
                                option ? option.substring(0, option.indexOf("|")) : option,
                                doNotSetTitleCase
                              )}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ visibility: "hidden" }}
                              color={includeHistoric && isHistoric(option) ? adsRed : "textDisabled"}
                              align="left"
                            >
                              {option ? option.substring(option.indexOf("|") + 1) : option}
                            </Typography>
                          </Stack>
                        ) : (
                          <Typography
                            variant="body2"
                            color={includeHistoric && isHistoric(option) ? adsRed : adsDarkGrey}
                            align="left"
                          >
                            {lookupToTitleCase(option, doNotSetTitleCase)}
                          </Typography>
                        )}
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      sx={FormSelectInputStyle(hasError.current)}
                      error={hasError.current}
                      fullWidth
                      disabled={!isEditable}
                      required={isRequired}
                      placeholder={displayNoChange ? "No change" : null}
                      variant="outlined"
                      margin="dense"
                      size="small"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: <InputAdornment position="start">{getItemAvatar(controlValue)}</InputAdornment>,
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton id="btnClear" onClick={handleAddLookup} aria-label="add button" size="small">
                              <AddCircleOutlineIcon sx={ActionIconStyle()} />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                  aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
                />
              ) : (
                <Autocomplete
                  id={`ads-select-${label.toLowerCase().replaceAll(" ", "-")}`}
                  sx={{
                    color: "inherit",
                  }}
                  getOptionLabel={(option) => lookupToTitleCase(option, doNotSetTitleCase)}
                  noOptionsText={`No ${label} records`}
                  options={options}
                  autoHighlight
                  autoSelect
                  value={controlValue}
                  onChange={handleChangeEvent}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  renderOption={(props, option) => {
                    return (
                      <li {...props}>
                        {includeHiddenCode ? (
                          <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={1}>
                            <Typography
                              variant="body2"
                              color={includeHistoric && isHistoric(option) ? adsRed : adsDarkGrey}
                              align="left"
                            >
                              {lookupToTitleCase(
                                option ? option.substring(0, option.indexOf("|")) : option,
                                doNotSetTitleCase
                              )}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ visibility: "hidden" }}
                              color={includeHistoric && isHistoric(option) ? adsRed : "textDisabled"}
                              align="left"
                            >
                              {option ? option.substring(option.indexOf("|") + 1) : option}
                            </Typography>
                          </Stack>
                        ) : (
                          <Typography
                            variant="body2"
                            color={includeHistoric && isHistoric(option) ? adsRed : adsDarkGrey}
                            align="left"
                          >
                            {lookupToTitleCase(option, doNotSetTitleCase)}
                          </Typography>
                        )}
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      sx={FormSelectInputStyle(hasError.current)}
                      error={hasError.current}
                      fullWidth
                      disabled={!isEditable}
                      required={isRequired}
                      placeholder={displayNoChange ? "No change" : null}
                      variant="outlined"
                      margin="dense"
                      size="small"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: <InputAdornment position="start">{getItemAvatar(controlValue)}</InputAdornment>,
                      }}
                    />
                  )}
                  aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
                />
              )
            ) : isClassification ? (
              <Autocomplete
                id={`ads-select-${label.toLowerCase().replaceAll(" ", "-")}`}
                sx={{
                  color: "inherit",
                }}
                getOptionLabel={(option) => lookupToTitleCase(option, doNotSetTitleCase)}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                noOptionsText={`No ${label} records`}
                options={options}
                autoHighlight
                autoSelect
                value={controlValue}
                onChange={handleChangeEvent}
                onFocus={handleFocus}
                onBlur={handleBlur}
                renderOption={(props, option) => {
                  return (
                    <li {...props}>
                      {includeHiddenCode ? (
                        <Stack direction="row">
                          <Typography
                            variant="body2"
                            color={includeHistoric && isHistoric(option) ? adsRed : adsDarkGrey}
                            align="left"
                          >
                            {lookupToTitleCase(
                              option ? option.substring(0, option.indexOf("|")) : option,
                              doNotSetTitleCase
                            )}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ visibility: "hidden" }}
                            color={includeHistoric && isHistoric(option) ? adsRed : "textDisabled"}
                            align="left"
                          >
                            {option ? option.substring(option.indexOf("|") + 1) : option}
                          </Typography>
                        </Stack>
                      ) : (
                        <Typography
                          variant="body2"
                          color={includeHistoric && isHistoric(option) ? adsRed : adsDarkGrey}
                          align="left"
                        >
                          {lookupToTitleCase(option, doNotSetTitleCase)}
                        </Typography>
                      )}
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={FormSelectInputStyle(hasError.current)}
                    error={hasError.current}
                    fullWidth
                    disabled={!isEditable}
                    required={isRequired}
                    placeholder={displayNoChange ? "No change" : null}
                    variant="outlined"
                    margin="dense"
                    size="small"
                    InputProps={{
                      ...params.InputProps,
                    }}
                  />
                )}
                aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
              />
            ) : allowAddLookup && controlFocused ? (
              <Autocomplete
                id={`ads-select-${label.toLowerCase().replaceAll(" ", "-")}`}
                sx={{
                  color: "inherit",
                }}
                getOptionLabel={(option) => lookupToTitleCase(option, doNotSetTitleCase)}
                noOptionsText={`No ${label} records`}
                options={options}
                autoHighlight
                autoSelect
                value={controlValue}
                onChange={handleChangeEvent}
                onFocus={handleFocus}
                onBlur={handleBlur}
                renderOption={(props, option) => {
                  return (
                    <li {...props}>
                      {includeHiddenCode ? (
                        <Stack direction="row">
                          <Typography
                            variant="body2"
                            color={includeHistoric && isHistoric(option) ? adsRed : adsDarkGrey}
                            align="left"
                          >
                            {lookupToTitleCase(
                              option ? option.substring(0, option.indexOf("|")) : option,
                              doNotSetTitleCase
                            )}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ visibility: "hidden" }}
                            color={includeHistoric && isHistoric(option) ? adsRed : "textDisabled"}
                            align="left"
                          >
                            {option ? option.substring(option.indexOf("|") + 1) : option}
                          </Typography>
                        </Stack>
                      ) : (
                        <Typography
                          variant="body2"
                          color={includeHistoric && isHistoric(option) ? adsRed : adsDarkGrey}
                          align="left"
                        >
                          {lookupToTitleCase(option, doNotSetTitleCase)}
                        </Typography>
                      )}
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={FormSelectInputStyle(hasError.current)}
                    error={hasError.current}
                    fullWidth
                    disabled={!isEditable}
                    required={isRequired}
                    placeholder={displayNoChange ? "No change" : null}
                    variant="outlined"
                    margin="dense"
                    size="small"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton id="btnClear" onClick={handleAddLookup} aria-label="add button" size="small">
                            <AddCircleOutlineIcon sx={ActionIconStyle()} />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
                aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
              />
            ) : (
              <Autocomplete
                id={`ads-select-${label.toLowerCase().replaceAll(" ", "-")}`}
                sx={{
                  color: "inherit",
                }}
                getOptionLabel={(option) => lookupToTitleCase(option, doNotSetTitleCase)}
                noOptionsText={`No ${label} records`}
                options={options}
                autoHighlight
                autoSelect
                value={controlValue}
                onChange={handleChangeEvent}
                onFocus={handleFocus}
                onBlur={handleBlur}
                renderOption={(props, option) => {
                  return (
                    <li {...props}>
                      {includeHiddenCode ? (
                        <Stack direction="row">
                          <Typography
                            variant="body2"
                            color={includeHistoric && isHistoric(option) ? adsRed : adsDarkGrey}
                            align="left"
                          >
                            {lookupToTitleCase(
                              option ? option.substring(0, option.indexOf("|")) : option,
                              doNotSetTitleCase
                            )}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ visibility: "hidden" }}
                            color={includeHistoric && isHistoric(option) ? adsRed : "textDisabled"}
                            align="left"
                          >
                            {option ? option.substring(option.indexOf("|") + 1) : option}
                          </Typography>
                        </Stack>
                      ) : (
                        <Typography
                          variant="body2"
                          color={includeHistoric && isHistoric(option) ? adsRed : adsDarkGrey}
                          align="left"
                        >
                          {lookupToTitleCase(option, doNotSetTitleCase)}
                        </Typography>
                      )}
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={FormSelectInputStyle(hasError.current)}
                    error={hasError.current}
                    fullWidth
                    disabled={!isEditable}
                    required={isRequired}
                    placeholder={displayNoChange ? "No change" : null}
                    variant="outlined"
                    margin="dense"
                    size="small"
                    InputProps={{
                      ...params.InputProps,
                    }}
                  />
                )}
                aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
              />
            )
          ) : (
            getLookupInfo(value)
          )}
        </Grid>
        <ADSErrorDisplay errorText={displayError} id={`${label.toLowerCase().replaceAll(" ", "-")}-select-error`} />
      </Grid>
    </Box>
  );
}

export default ADSSelectControl;
