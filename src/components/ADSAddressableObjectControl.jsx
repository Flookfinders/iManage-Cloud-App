/* #region header */
/**************************************************************************************************
//
//  Description: Wizard Address Details 2 (Range create)
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
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
//    005   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system.
//    006   05.12.23 Sean Flook       IMANN-198 Only allow characters A-Z for suffixes.
//    007   10.01.24 Sean Flook                 Fix warnings.
//    008   16.04.24 Joshua McCormick IMAN-277  Changed TextField out for ADSTextControl
//    009   16.04.24 Joshua McCormick IMAN-277  Revert 008 &   added props for setting displayCharactersLeft and maxLength
//    010   17.04.24 Joshua McCormick IMAN-277  Removed maxLength and set to hardcoded 90
//    011   18.06.24 Sean Flook       IMANN-577 Use characterSetValidator.
//    012   20.06.24 Sean Flook       IMANN-633 Enforce the maximum for the numbers.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";
import SettingsContext from "../context/settingsContext";
import { Typography, Grid, Tooltip, TextField, Skeleton } from "@mui/material";
import { Box } from "@mui/system";
import ADSErrorDisplay from "./ADSErrorDisplay";
import { adsMidGreyA } from "../utils/ADSColours";
import { FormBoxRowStyle, FormRowStyle, FormInputStyle, controlLabelStyle, tooltipStyle } from "../utils/ADSStyles";
import { characterSetValidator } from "../utils/HelperUtils";

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
  displayCharactersLeft: PropTypes.bool,
  helperText: PropTypes.string,
  startNumberValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  startSuffixValue: PropTypes.string,
  endNumberValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
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
  displayCharactersLeft: false,
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
  displayCharactersLeft,
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

  const [displayText, setDisplayText] = useState("");

  const hasError = useRef(false);

  /**
   * Event to handle when the start number changes.
   *
   * @param {object} event The event object.
   */
  const handleStartNumberChangeEvent = (event) => {
    const newValue = Number(event.target.value);
    if ((!event.target.value || (newValue >= 1 && newValue <= 9999)) && onStartNumberChange)
      onStartNumberChange(event.target.value);
  };

  /**
   * Event to handle when the start suffix changes.
   *
   * @param {object} event The event object.
   */
  const handleStartSuffixChangeEvent = (event) => {
    if (onStartSuffixChange) {
      onStartSuffixChange(event.target.value.replace(/[^A-Za-z]+/g, "").toUpperCase());
    }
  };

  /**
   * Event to handle when the end number changes.
   *
   * @param {object} event The event object.
   */
  const handleEndNumberChangeEvent = (event) => {
    const newValue = Number(event.target.value);
    if (!event.target.value || (newValue >= 1 && newValue <= 9999 && onEndNumberChange))
      onEndNumberChange(event.target.value);
  };

  /**
   * Event to handle when the end suffix changes.
   *
   * @param {object} event The event object.
   */
  const handleEndSuffixChangeEvent = (event) => {
    if (onEndSuffixChange) {
      onEndSuffixChange(event.target.value.replace(/[^A-Za-z]+/g, "").toUpperCase());
    }
  };

  /**
   * Event to handle when the text changes.
   *
   * @param {object} event The event object.
   */
  const handleTextChangeEvent = (event) => {
    if (
      characterSetValidator(
        event.target.value,
        `${settingsContext.isScottish ? "OneScotlandProperty" : "GeoPlaceProperty2"}`
      ) &&
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
    setDisplayText(textValue ? textValue : "");
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
                    inputProps={{ min: 1, max: 9999 }}
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
                  inputProps={{ min: 1, max: 9999 }}
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
                    inputProps={{ min: 1, max: 9999 }}
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
                  inputProps={{ min: 1, max: 9999 }}
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
        {displayCharactersLeft && displayText && displayText.length > 0 ? (
          <Grid item xs={12}>
            <Typography
              id={`${variant === "PAO" ? "pao" : "sao"}-characters-left`}
              variant="body2"
              align="right"
              aria-labelledby={`${variant === "PAO" ? "pao" : "sao"}-description-label`}
            >
              {90 - displayText.length} characters left
            </Typography>
          </Grid>
        ) : (
          ""
        )}
        <ADSErrorDisplay errorText={displayError} id={`${variant === "PAO" ? "pao" : "sao"}-error`} />
      </Grid>
    </Box>
  );
}

export default ADSAddressableObjectControl;
