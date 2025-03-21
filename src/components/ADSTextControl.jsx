//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Text component
//
//  Copyright:    © 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//region Version 1.0.0.0
//    001   13.04.21 Sean Flook          WI39345 Initial Revision.
//    002   05.05.21 Sean Flook          WI39345 Tweaks to the UI after design review meeting.
//    003   14.05.21 Sean Flook          WI39345 Updated className.
//    004   18.05.21 Sean Flook          WI39345 Use the value directly.
//    005   20.05.21 Sean Flook          WI39345 Display a tooltip if required.
//    006   25.05.21 Sean Flook          WI39345 Include required field text if required to tooltip.
//    007   27.05.21 Sean Flook          WI39345 Alter display for multiline controls.
//    008   01.06.21 Sean Flook          WI39345 For multiline controls increase size of control depending on amount of text in control.
//    009   08.06.21 Sean Flook          WI39345 Changed read-only version to a label and altered colour of outline.
//    011   10.06.21 Sean Flook          WI39345 Only display characters left at the bottom when have a multiline component.
//    012   27.06.23 Sean Flook          WI40729 Correctly handle if errorText is a string rather then an array.
//    013   06.10.23 Sean Flook                  Use colour variables.
//    014   24.11.23 Sean Flook                  Moved Box to @mui/system.
//    015   29.01.24 Sean Flook                  Updated comment.
//    016   01.02.24 Sean Flook                  Correctly handle when no label is supplied.
//    017   13.02.24 Sean Flook                  For multi-line controls display the characters left at the same level as the label.
//    018   21.02.24 Sean Flook            MUL16 Added noLeftPadding parameter.
//    019   02.04.24 Joshua McCormick  IMANN-277 Removed not multiline check for displayCharactersLeft
//    020   10.06.24 Sean Flook        IMANN-509 Fix for use with passwords.
//    021   18.06.24 Sean Flook        IMANN-577 Use characterSetValidator.
//    022   10.07.24 Sean Flook        IMANN-649 Prevent carat from jumping to end of text.
//    023   11.07.24 Sean Flook        IMANN-759 Set the display variable if we do not have the input reference.
//    024   15.07.24 Sean Flook        IMANN-759 Always set the display variable.
//endregion Version 1.0.0.0
//region Version 1.0.5.0
//    025   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//endregion header

/* #region Character Sets used */
//---------------------------------------------------------------------------------------------------
//
// GeoPlaceProperty1 - Organisation
// ================================
//
// The valid characters allowed are:
// • Upper and lower case: A-Z
// • Numbers: 0-9
// • Space character
// • Upper and lower case: ÀÁÂÄÈÉÊËÌÍÎÏÒÓÔÖÚÙÛÜŴÝŸŶ
// • Punctuation and special characters: . , & ; : [ ] ( ) + - / _ @ £ $
//
// GeoPlaceProperty2 - PAO and SAO Text
// ====================================
//
// The valid characters allowed are:
// • Upper and lower case: A-Z
// • Numbers: 0-9
// • Space character
// • Upper and lower case: ÀÁÂÄÈÉÊËÌÍÎÏÒÓÔÖÚÙÛÜŴÝŸŶ
// • Punctuation and special characters: ! . , & ; : [ ] ( ) + - / _ @ £ $
//
// GeoPlaceAZOnly - PAO and SAO suffix
// ===================================
// • A-Z
//
// GeoPlaceStreet1 - Type 1, 2, 4 and 9 street descriptor, town and locality as well as OneScotland text fields not specified below.
// =================================================================================================================================
//
// Valid characters are A-Z, a-z, 0-9 or any of ! # $ % “ & ' ( ) * - + , . / : ; < = > ? [ \ ] ^ _ | ~ @ { } £ © § ® ¶ Ŵ ŵ Ṫ ṫ Ŷ ŷ Ḃ ḃ Ċ ċ Ḋ ḋ Ẁ Ẃ Ỳ Ÿ Ḟ ḟ Ġ ġ Ṁ ṁ Ṗ ẁ ṗ ẃ Ṡ ṡ ỳ Ẅ ẅ À Á Â Ã Ä Å Æ Ç È É Ê Ë Ì Í Î Ï Ñ Ò Ó Ô Õ Ö Ø Ù Ú Û Ü Ý ß à á â ã ä å æ ç è é ê ë ì í î ï ñ ò ó ô õ ö ø ù ú û ü ý ÿ and the space character.
//
// GeoPlaceStreet2 - Type 3 street
// ===============================
//
// Valid characters are A-Z, a-z, 0-9, ( ) and the space character.
//
// OneScotlandProperty
// ===============================
//
// Valid characters are A-Z, a-z, 0-9, ' - / \ & , and the space character.
//
// OneScotlandStreet
// ===============================
//
// Valid characters are A-Z, a-z, 0-9, ' - . and the space character.
//
// OneScotlandLookup
// ===============================
//
// Valid characters are A-Z, a-z, 0-9, ' - and the space character.
//
//---------------------------------------------------------------------------------------------------
/* #endregion Character Sets used */

//region imports

import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Typography, Grid2, Tooltip, TextField, Skeleton, InputAdornment, IconButton } from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSErrorDisplay from "./ADSErrorDisplay";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { adsBlueA } from "../utils/ADSColours";
import { FormBoxRowStyle, FormRowStyle, FormInputStyle, controlLabelStyle, tooltipStyle } from "../utils/ADSStyles";
import { characterSetValidator, isEdgeChromium } from "../utils/HelperUtils";

//endregion imports

ADSTextControl.propTypes = {
  label: PropTypes.string,
  isEditable: PropTypes.bool,
  isRequired: PropTypes.bool,
  isFocused: PropTypes.bool,
  isHidden: PropTypes.bool,
  noLeftPadding: PropTypes.bool,
  loading: PropTypes.bool,
  displayCharactersLeft: PropTypes.bool,
  maxLength: PropTypes.number.isRequired,
  minLines: PropTypes.number,
  maxLines: PropTypes.number,
  helperText: PropTypes.string,
  value: PropTypes.string,
  errorText: PropTypes.array,
  characterSet: PropTypes.oneOf([
    "None",
    "GeoPlaceProperty1",
    "GeoPlaceProperty2",
    "GeoPlaceAZOnly",
    "GeoPlaceStreet1",
    "GeoPlaceStreet2",
    "OneScotlandProperty",
    "OneScotlandStreet",
    "OneScotlandLookup",
    "EsriLayerId",
  ]),
  id: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

ADSTextControl.defaultProps = {
  isEditable: false,
  isRequired: false,
  isFocused: false,
  isHidden: false,
  noLeftPadding: false,
  loading: false,
  displayCharactersLeft: false,
  minLines: 1,
  maxLines: 1,
  characterSet: "None",
};

function ADSTextControl({
  label,
  isEditable,
  isRequired,
  isFocused,
  isHidden,
  noLeftPadding,
  loading,
  displayCharactersLeft,
  maxLength,
  minLines,
  maxLines,
  helperText,
  value,
  errorText,
  characterSet,
  id,
  onChange,
}) {
  const multiline = useRef(minLines > 1);

  const [displayValue, setDisplayValue] = useState("");
  const [displayError, setDisplayError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const inputRef = useRef();
  const selectionStart = useRef(0);
  const selectionEnd = useRef(0);
  const hasError = useRef(false);

  /**
   * Method to get the row size for the control.
   *
   * @returns {number} The row size for the control.
   */
  const GetControlRowSize = () => {
    if (multiline.current) return 12;
    else return 9;
  };

  /**
   * Event to handle when the show password button is clicked.
   */
  const handleShowPasswordClick = () => {
    setShowPassword(!showPassword);
  };

  /**
   * Event to handle when the mouse button is clicked.
   *
   * @param {object} event The event object.
   */
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  /**
   * Event to handle when the control changes.
   *
   * @param {object} event The event object.
   */
  const handleChangeEvent = (event) => {
    const valid = characterSetValidator(event.target.value, characterSet);
    selectionStart.current = event.target.selectionStart;
    selectionEnd.current = event.target.selectionEnd;

    if (valid && onChange) {
      setDisplayValue(event.target.value);
      onChange(event.target.value);
    }
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
      element = document.getElementById(`ads-text-textfield-${label ? label.toLowerCase().replaceAll(" ", "-") : id}`);
    }

    if (element) element.focus();
  });

  useEffect(() => {
    setDisplayValue(value);
    if (inputRef.current) {
      inputRef.current.value = value ? value : "";

      inputRef.current.selectionStart = selectionStart.current;
      inputRef.current.selectionEnd = selectionEnd.current;
    }
  }, [value]);

  return (
    <Box sx={FormBoxRowStyle(hasError.current)}>
      <Grid2
        container
        justifyContent="flex-start"
        alignItems={multiline.current ? "flex-start" : "center"}
        sx={FormRowStyle(hasError.current, noLeftPadding)}
      >
        {label ? (
          multiline.current && displayValue && displayValue.length > 0 ? (
            <Grid2 size={12}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography
                  id={`ads-text-label-${label.toLowerCase().replaceAll(" ", "-")}`}
                  variant="body2"
                  align="left"
                  sx={controlLabelStyle}
                >
                  {`${label}${isRequired ? "*" : ""}`}
                </Typography>
                <Typography
                  id={`ads-text-${label ? label.toLowerCase().replaceAll(" ", "-") : id}-characters-left`}
                  variant="body2"
                  align="right"
                  aria-labelledby={`ads-text-label-${label ? label.toLowerCase().replaceAll(" ", "-") : id}`}
                >
                  {maxLength - displayValue.length} characters left
                </Typography>
              </Stack>
            </Grid2>
          ) : (
            <Grid2 size={3}>
              <Typography
                id={`ads-text-label-${label.toLowerCase().replaceAll(" ", "-")}`}
                variant="body2"
                align="left"
                sx={controlLabelStyle}
              >
                {`${label}${isRequired ? "*" : ""}`}
              </Typography>
            </Grid2>
          )
        ) : (
          <Grid2 size={3}></Grid2>
        )}
        <Grid2 size={GetControlRowSize()}>
          {loading ? (
            <Skeleton variant="rectangular" height="30px" width="100%" />
          ) : helperText && helperText.length > 0 ? (
            <Tooltip
              title={isRequired ? helperText + " This is a required field." : helperText}
              arrow
              placement="right"
              sx={tooltipStyle}
            >
              {multiline.current ? (
                <TextField
                  id={`ads-text-textfield-${label ? label.toLowerCase().replaceAll(" ", "-") : id}`}
                  sx={FormInputStyle(hasError.current)}
                  error={hasError.current}
                  fullWidth
                  minRows={minLines}
                  maxRows={maxLines}
                  multiline={multiline.current}
                  disabled={!isEditable}
                  required={isRequired}
                  variant="outlined"
                  margin="dense"
                  size="small"
                  value={displayValue}
                  onChange={handleChangeEvent}
                  aria-labelledby={`ads-text-label-${label ? label.toLowerCase().replaceAll(" ", "-") : id}`}
                  slotProps={{
                    htmlInput: { maxLength: `${maxLength}`, ref: inputRef },
                  }}
                />
              ) : isHidden ? (
                <TextField
                  id={`ads-text-textfield-${label ? label.toLowerCase().replaceAll(" ", "-") : id}`}
                  sx={FormInputStyle(hasError.current)}
                  type={showPassword ? "text" : "password"}
                  error={hasError.current}
                  rows={1}
                  fullWidth
                  disabled={!isEditable}
                  required={isRequired}
                  variant="outlined"
                  margin="dense"
                  size="small"
                  value={displayValue}
                  onChange={handleChangeEvent}
                  aria-labelledby={`ads-text-label-${label ? label.toLowerCase().replaceAll(" ", "-") : id}`}
                  slotProps={{
                    input: {
                      maxLength: `${maxLength}`,
                      ref: inputRef,
                      endAdornment: !isEdgeChromium && (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleShowPasswordClick}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                            sx={{
                              "&:hover": {
                                color: adsBlueA,
                              },
                            }}
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              ) : (
                <TextField
                  id={`ads-text-textfield-${label ? label.toLowerCase().replaceAll(" ", "-") : id}`}
                  sx={FormInputStyle(hasError.current)}
                  error={hasError.current}
                  rows={1}
                  fullWidth
                  disabled={!isEditable}
                  required={isRequired}
                  variant="outlined"
                  margin="dense"
                  size="small"
                  value={displayValue}
                  onChange={handleChangeEvent}
                  aria-labelledby={`ads-text-label-${label ? label.toLowerCase().replaceAll(" ", "-") : id}`}
                  slotProps={{
                    htmlInput: { maxLength: `${maxLength}`, ref: inputRef },
                  }}
                />
              )}
            </Tooltip>
          ) : multiline.current ? (
            <TextField
              id={`ads-text-textfield-${label ? label.toLowerCase().replaceAll(" ", "-") : id}`}
              sx={FormInputStyle(hasError.current)}
              error={hasError.current}
              fullWidth
              minRows={minLines}
              maxRows={maxLines}
              multiline={multiline.current}
              disabled={!isEditable}
              required={isRequired}
              variant="outlined"
              margin="dense"
              size="small"
              value={displayValue}
              onChange={handleChangeEvent}
              aria-labelledby={`ads-text-label-${label ? label.toLowerCase().replaceAll(" ", "-") : id}`}
              slotProps={{
                htmlInput: { maxLength: `${maxLength}`, ref: inputRef },
              }}
            />
          ) : isHidden ? (
            <TextField
              id={`ads-text-textfield-${label ? label.toLowerCase().replaceAll(" ", "-") : id}`}
              sx={FormInputStyle(hasError.current)}
              type={showPassword ? "text" : "password"}
              error={hasError.current}
              rows={1}
              fullWidth
              disabled={!isEditable}
              required={isRequired}
              variant="outlined"
              margin="dense"
              size="small"
              value={displayValue}
              onChange={handleChangeEvent}
              aria-labelledby={`ads-text-label-${label ? label.toLowerCase().replaceAll(" ", "-") : id}`}
              slotProps={{
                input: {
                  maxLength: `${maxLength}`,
                  ref: inputRef,
                  endAdornment: !isEdgeChromium && (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleShowPasswordClick}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        sx={{
                          "&:hover": {
                            color: adsBlueA,
                          },
                        }}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          ) : (
            <TextField
              id={`ads-text-textfield-${label ? label.toLowerCase().replaceAll(" ", "-") : id}`}
              sx={FormInputStyle(hasError.current)}
              error={hasError.current}
              fullWidth
              rows={1}
              disabled={!isEditable}
              required={isRequired}
              variant="outlined"
              margin="dense"
              size="small"
              value={displayValue}
              onChange={handleChangeEvent}
              aria-labelledby={`ads-text-label-${label ? label.toLowerCase().replaceAll(" ", "-") : id}`}
              slotProps={{
                htmlInput: { maxLength: `${maxLength}`, ref: inputRef },
              }}
            />
          )}
        </Grid2>
        {displayCharactersLeft && displayValue && displayValue.length > 0 ? (
          <Grid2 size={12}>
            <Typography
              id={`ads-text-${label ? label.toLowerCase().replaceAll(" ", "-") : id}-characters-left`}
              variant="body2"
              align="right"
              aria-labelledby={`ads-text-label-${label ? label.toLowerCase().replaceAll(" ", "-") : id}`}
            >
              {maxLength - displayValue.length} characters left
            </Typography>
          </Grid2>
        ) : (
          ""
        )}
        <ADSErrorDisplay
          errorText={displayError}
          id={`${label ? label.toLowerCase().replaceAll(" ", "-") : id}-select-error`}
        />
      </Grid2>
    </Box>
  );
}

export default ADSTextControl;
