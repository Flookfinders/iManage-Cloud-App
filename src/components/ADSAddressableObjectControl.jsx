/* #region header */
/**************************************************************************************************
//
//  Description: Wizard Address Details 2 (Range create)
//
//  Copyright:    © 2021 - 2023 Idox Software Limited.
//
//  Character Sets used */
//  -------------------------------------------------------------------------------------------------
//
//  GeoPlaceProperty2 - PAO and SAO Text
//  ====================================
//
//  The valid characters allowed are:
//  • Upper and lower case: A-Z
//  • Numbers: 0-9
//  • Space character
//  • Upper and lower case: ÀÁÂÄÈÉÊËÌÍÎÏÒÓÔÖÚÙÛÜŴÝŸŶ
//  • Punctuation and special characters: ! . , & ; : [ ] ( ) + - / _ @ £ $
//
//  GeoPlaceAZOnly - PAO and SAO suffix
//  ===================================
//  • A-Z
//
//  OneScotlandProperty
//  ===============================
//
//  Valid characters are A-Z, a-z, 0-9, ' - / \ & , and the space character.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001            Sean Flook                 Initial Revision.
//    002   25.04.23 Sean Flook         WI40703 Do not allow text with invalid characters to be pasted in and displayed.
//    003   30.06.23 Sean Flook         WI40770 Ensure the end suffix is uppercase.
//    004   06.10.23 Sean Flook                 Use colour variables.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";
import SettingsContext from "../context/settingsContext";
import { Typography, Grid, Tooltip, TextField, Skeleton, Box } from "@mui/material";
import ADSErrorDisplay from "./ADSErrorDisplay";
import { adsMidGreyA } from "../utils/ADSColours";
import { FormBoxRowStyle, FormRowStyle, FormInputStyle, controlLabelStyle, tooltipStyle } from "../utils/ADSStyles";

ADSAddressableObjectControl.propTypes = {
  variant: PropTypes.string.isRequired,
  isEditable: PropTypes.bool,
  isRequired: PropTypes.bool,
  isStartNumberFocused: PropTypes.bool,
  isStartSuffixFocused: PropTypes.bool,
  isEndNumberFocused: PropTypes.bool,
  isEndSuffixFocused: PropTypes.bool,
  isTextFocused: PropTypes.bool,
  loading: PropTypes.bool,
  helperText: PropTypes.string,
  startNumberValue: PropTypes.any,
  startSuffixValue: PropTypes.string,
  endNumberValue: PropTypes.any,
  endSuffixValue: PropTypes.string,
  textValue: PropTypes.string,
  startNumberErrorText: PropTypes.array,
  startSuffixErrorText: PropTypes.array,
  endNumberErrorText: PropTypes.array,
  endSuffixErrorText: PropTypes.array,
  textErrorText: PropTypes.array,
  onStartNumberChange: PropTypes.func.isRequired,
  onStartSuffixChange: PropTypes.func.isRequired,
  onEndNumberChange: PropTypes.func.isRequired,
  onEndSuffixChange: PropTypes.func.isRequired,
  onTextChange: PropTypes.func.isRequired,
};

ADSAddressableObjectControl.defaultProps = {
  variant: "PAO",
  isEditable: false,
  isRequired: false,
  isStartNumberFocused: false,
  isStartSuffixFocused: false,
  isEndNumberFocused: false,
  isEndSuffixFocused: false,
  isTextFocused: false,
  loading: false,
};

function ADSAddressableObjectControl({
  variant,
  isEditable,
  isRequired,
  isStartNumberFocused,
  isStartSuffixFocused,
  isEndNumberFocused,
  isEndSuffixFocused,
  isTextFocused,
  loading,
  helperText,
  startNumberValue,
  startSuffixValue,
  endNumberValue,
  endSuffixValue,
  textValue,
  startNumberErrorText,
  startSuffixErrorText,
  endNumberErrorText,
  endSuffixErrorText,
  textErrorText,
  onStartNumberChange,
  onStartSuffixChange,
  onEndNumberChange,
  onEndSuffixChange,
  onTextChange,
}) {
  const settingsContext = useContext(SettingsContext);

  const [displayError, setDisplayError] = useState(null);

  const [displayText, setDisplayText] = useState(null);

  const hasError = useRef(false);

  /**
   * Event to handle when the start number changes.
   *
   * @param {object} event The event object.
   */
  const handleStartNumberChangeEvent = (event) => {
    if (onStartNumberChange) onStartNumberChange(event.target.value);
  };

  /**
   * Event to handle when the start suffix changes.
   *
   * @param {object} event The event object.
   */
  const handleStartSuffixChangeEvent = (event) => {
    if (!/[^A-Z]+/gi.test(event.target.value) && onStartSuffixChange)
      onStartSuffixChange(event.target.value.toUpperCase());
  };

  /**
   * Event to handle when the end number changes.
   *
   * @param {object} event The event object.
   */
  const handleEndNumberChangeEvent = (event) => {
    if (onEndNumberChange) onEndNumberChange(event.target.value);
  };

  /**
   * Event to handle when the end suffix changes.
   *
   * @param {object} event The event object.
   */
  const handleEndSuffixChangeEvent = (event) => {
    if (!/[^A-Z]+/gi.test(event.target.value) && onEndSuffixChange) onEndSuffixChange(event.target.value.toUpperCase());
  };

  /**
   * Event to handle when the text changes.
   *
   * @param {object} event The event object.
   */
  const handleTextChangeEvent = (event) => {
    if (
      ((settingsContext.isScottish && !/[^\w ',&\-/\\]+/giu.test(event.target.value)) ||
        (!settingsContext.isScottish &&
          !/[^\w !.,&;:[\]()+\-/@£$ÀÁÂÄÈÉÊËÌÍÎÏÒÓÔÖÚÙÛÜŴÝŸŶ]+/giu.test(event.target.value))) &&
      onTextChange
    )
      onTextChange(event.target.value);
    else if (!textValue && !displayText) setDisplayText("");
  };

  useEffect(() => {
    hasError.current =
      (startNumberErrorText && startNumberErrorText.length > 0) ||
      (startSuffixErrorText && startSuffixErrorText.length > 0) ||
      (endNumberErrorText && endNumberErrorText.length > 0) ||
      (endSuffixErrorText && endSuffixErrorText.length > 0) ||
      (textErrorText && textErrorText.length > 0);

    let aoErrors = [];

    if (startNumberErrorText && startNumberErrorText.length > 0) aoErrors = aoErrors.concat(startNumberErrorText);
    if (startSuffixErrorText && startSuffixErrorText.length > 0) aoErrors = aoErrors.concat(startSuffixErrorText);
    if (endNumberErrorText && endNumberErrorText.length > 0) aoErrors = aoErrors.concat(endNumberErrorText);
    if (endSuffixErrorText && endSuffixErrorText.length > 0) aoErrors = aoErrors.concat(endSuffixErrorText);
    if (textErrorText && textErrorText.length > 0) aoErrors = aoErrors.concat(textErrorText);

    if (aoErrors.length > 0) setDisplayError(aoErrors.join(", "));
    else setDisplayError(null);
  }, [startNumberErrorText, startSuffixErrorText, endNumberErrorText, endSuffixErrorText, textErrorText]);

  useEffect(() => {
    let element = null;

    if (isStartNumberFocused) {
      element = document.getElementById(`${variant === "PAO" ? "pao" : "sao"}-start-number-control`);
    } else if (isStartSuffixFocused) {
      element = document.getElementById(`${variant === "PAO" ? "pao" : "sao"}-start-suffix-control`);
    } else if (isEndNumberFocused) {
      element = document.getElementById(`${variant === "PAO" ? "pao" : "sao"}-end-number-control`);
    } else if (isEndSuffixFocused) {
      element = document.getElementById(`${variant === "PAO" ? "pao" : "sao"}-end-suffix-control`);
    } else if (isTextFocused) {
      element = document.getElementById(`${variant === "PAO" ? "pao" : "sao"}-description-control`);
    }

    if (element) element.focus();
  });

  useEffect(() => {
    console.log("[SF] ADSAddressableObjectControl", { textValue: textValue });
    setDisplayText(textValue);
  }, [textValue]);

  return (
    <Box sx={FormBoxRowStyle(hasError.current)}>
      <Grid container justifyContent="flex-start" alignItems="center" sx={FormRowStyle(hasError.current)}>
        <Grid item xs={3}>
          <Typography
            id={`${variant === "PAO" ? "pao" : "sao"}-num-suffix-label`}
            variant="body2"
            align="left"
            sx={{ fontSize: "14px", color: adsMidGreyA, pt: "26px" }}
          >
            {`${variant === "PAO" ? "PAO" : "SAO"} no. / suffix${isRequired ? "*" : ""}`}
          </Typography>
        </Grid>
        <Grid item xs={9}>
          <Grid container justifyContent="flex-start" alignItems="center" columns={13} columnSpacing={1}>
            <Grid item xs={6}>
              <Typography variant="body2">Start no./suffix</Typography>
            </Grid>
            <Grid item xs={1}>
              <Typography variant="body2"> </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">End no./suffix</Typography>
            </Grid>
            <Grid item xs={3}>
              {loading ? (
                <Skeleton variant="rectangular" animation="wave" height="60px" width="100%" />
              ) : helperText && helperText.length > 0 ? (
                <Tooltip
                  title={`The ${variant === "PAO" ? "primary" : "secondary"} addressable object start number.${
                    isRequired ? " This is a required field." : ""
                  }`}
                  arrow
                  placement="right"
                  sx={tooltipStyle}
                >
                  <TextField
                    id={`${variant === "PAO" ? "pao" : "sao"}-start-number-control`}
                    sx={FormInputStyle(hasError.current)}
                    type="number"
                    error={hasError.current}
                    fullWidth
                    disabled={!isEditable}
                    required={isRequired}
                    variant="outlined"
                    margin="dense"
                    size="small"
                    inputProps={{ min: 0, max: 9999 }}
                    placeholder="e.g. 1"
                    value={startNumberValue}
                    onChange={handleStartNumberChangeEvent}
                    aria-labelledby={`${variant === "PAO" ? "pao" : "sao"}-num-suffix-label`}
                  />
                </Tooltip>
              ) : (
                <TextField
                  id={`${variant === "PAO" ? "pao" : "sao"}-start-number-control`}
                  sx={FormInputStyle(hasError.current)}
                  type="number"
                  error={hasError.current}
                  fullWidth
                  disabled={!isEditable}
                  required={isRequired}
                  variant="outlined"
                  margin="dense"
                  size="small"
                  inputProps={{ min: 0, max: 9999 }}
                  placeholder="e.g. 1"
                  value={startNumberValue}
                  onChange={handleStartNumberChangeEvent}
                  aria-labelledby={`${variant === "PAO" ? "pao" : "sao"}-num-suffix-label`}
                />
              )}
            </Grid>
            <Grid item xs={3}>
              {loading ? (
                <Skeleton variant="rectangular" animation="wave" height="60px" width="100%" />
              ) : helperText && helperText.length > 0 ? (
                <Tooltip
                  title={`The ${variant === "PAO" ? "primary" : "secondary"} addressable object start suffix.${
                    isRequired ? " This is a required field." : ""
                  }`}
                  arrow
                  placement="right"
                  sx={tooltipStyle}
                >
                  <TextField
                    id={`${variant === "PAO" ? "pao" : "sao"}-start-suffix-control`}
                    sx={FormInputStyle(hasError.current)}
                    error={hasError.current}
                    fullWidth
                    disabled={!isEditable}
                    required={isRequired}
                    variant="outlined"
                    margin="dense"
                    size="small"
                    inputProps={{ maxLength: `${settingsContext.isWelsh ? 2 : 1}` }}
                    placeholder="e.g. A"
                    value={startSuffixValue}
                    onChange={handleStartSuffixChangeEvent}
                  />
                </Tooltip>
              ) : (
                <TextField
                  id={`${variant === "PAO" ? "pao" : "sao"}-start-suffix-control`}
                  sx={FormInputStyle(hasError.current)}
                  error={hasError.current}
                  fullWidth
                  disabled={!isEditable}
                  required={isRequired}
                  variant="outlined"
                  margin="dense"
                  size="small"
                  inputProps={{ maxLength: `${settingsContext.isWelsh ? 2 : 1}` }}
                  placeholder="e.g. A"
                  value={startSuffixValue}
                  onChange={handleStartSuffixChangeEvent}
                />
              )}
            </Grid>
            <Grid item xs={1}>
              <Typography variant="body2" align="center">
                -
              </Typography>
            </Grid>
            <Grid item xs={3}>
              {loading ? (
                <Skeleton variant="rectangular" animation="wave" height="60px" width="100%" />
              ) : helperText && helperText.length > 0 ? (
                <Tooltip
                  title={`The ${variant === "PAO" ? "primary" : "secondary"} addressable object end number.${
                    isRequired ? " This is a required field." : ""
                  }`}
                  arrow
                  placement="right"
                  sx={tooltipStyle}
                >
                  <TextField
                    id={`${variant === "PAO" ? "pao" : "sao"}-end-number-control`}
                    sx={FormInputStyle(hasError.current)}
                    type="number"
                    error={hasError.current}
                    fullWidth
                    disabled={!isEditable}
                    required={isRequired}
                    variant="outlined"
                    margin="dense"
                    size="small"
                    inputProps={{ min: 0, max: 9999 }}
                    placeholder="e.g. 1"
                    value={endNumberValue}
                    onChange={handleEndNumberChangeEvent}
                  />
                </Tooltip>
              ) : (
                <TextField
                  id={`${variant === "PAO" ? "pao" : "sao"}-end-number-control`}
                  sx={FormInputStyle(hasError.current)}
                  type="number"
                  error={hasError.current}
                  fullWidth
                  disabled={!isEditable}
                  required={isRequired}
                  variant="outlined"
                  margin="dense"
                  size="small"
                  inputProps={{ min: 0, max: 9999 }}
                  placeholder="e.g. 1"
                  value={endNumberValue}
                  onChange={handleEndNumberChangeEvent}
                />
              )}
            </Grid>
            <Grid item xs={3}>
              {loading ? (
                <Skeleton variant="rectangular" animation="wave" height="60px" width="100%" />
              ) : helperText && helperText.length > 0 ? (
                <Tooltip
                  title={`The ${variant === "PAO" ? "primary" : "secondary"} addressable object end suffix.${
                    isRequired ? " This is a required field." : ""
                  }`}
                  arrow
                  placement="right"
                  sx={tooltipStyle}
                >
                  <TextField
                    id={`${variant === "PAO" ? "pao" : "sao"}-end-suffix-control`}
                    sx={FormInputStyle(hasError.current)}
                    error={hasError.current}
                    fullWidth
                    disabled={!isEditable}
                    required={isRequired}
                    variant="outlined"
                    margin="dense"
                    size="small"
                    inputProps={{ maxLength: `${settingsContext.isWelsh ? 2 : 1}` }}
                    placeholder="e.g. A"
                    value={endSuffixValue}
                    onChange={handleEndSuffixChangeEvent}
                  />
                </Tooltip>
              ) : (
                <TextField
                  id={`${variant === "PAO" ? "pao" : "sao"}-end-suffix-control`}
                  sx={FormInputStyle(hasError.current)}
                  error={hasError.current}
                  fullWidth
                  disabled={!isEditable}
                  required={isRequired}
                  variant="outlined"
                  margin="dense"
                  size="small"
                  inputProps={{ maxLength: `${settingsContext.isWelsh ? 2 : 1}` }}
                  placeholder="e.g. A"
                  value={endSuffixValue}
                  onChange={handleEndSuffixChangeEvent}
                />
              )}
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={3}>
          <Typography
            id={`${variant === "PAO" ? "pao" : "sao"}-description-label`}
            variant="body2"
            align="left"
            sx={controlLabelStyle}
          >
            {`${variant === "PAO" ? "PAO" : "SAO"} description${isRequired ? "*" : ""}`}
          </Typography>
        </Grid>
        <Grid item xs={9}>
          {loading ? (
            <Skeleton variant="rectangular" animation="wave" height="60px" width="100%" />
          ) : helperText && helperText.length > 0 ? (
            <Tooltip
              title={isRequired ? helperText + " This is a required field." : helperText}
              arrow
              placement="right"
              sx={tooltipStyle}
            >
              <TextField
                id={`${variant === "PAO" ? "pao" : "sao"}-description-control`}
                sx={FormInputStyle(hasError.current)}
                error={hasError.current}
                fullWidth
                disabled={!isEditable}
                required={isRequired}
                variant="outlined"
                margin="dense"
                size="small"
                inputProps={{ maxLength: 90 }}
                placeholder="e.g. Unit 12"
                value={displayText}
                onChange={handleTextChangeEvent}
                aria-labelledby={`${variant === "PAO" ? "pao" : "sao"}-description-label`}
              />
            </Tooltip>
          ) : (
            <TextField
              id={`${variant === "PAO" ? "pao" : "sao"}-description-control`}
              sx={FormInputStyle(hasError.current)}
              error={hasError.current}
              fullWidth
              disabled={!isEditable}
              required={isRequired}
              variant="outlined"
              margin="dense"
              size="small"
              inputProps={{ maxLength: 90 }}
              placeholder="e.g. Unit 12"
              value={displayText}
              onChange={handleTextChangeEvent}
              aria-labelledby={`${variant === "PAO" ? "pao" : "sao"}-description-label`}
            />
          )}
        </Grid>
        <ADSErrorDisplay errorText={displayError} id={`${variant === "PAO" ? "pao" : "sao"}-error`} />
      </Grid>
    </Box>
  );
}

export default ADSAddressableObjectControl;
