/* #region header */
/**************************************************************************************************
//
//  Description: Language component
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
//    002   27.06.23 Sean Flook         WI40729 Correctly handle if errorText is a string rather then an array.
//    003   06.10.23 Sean Flook                 Use colour variables.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */

import React, { useContext, useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";
import SettingsContext from "../context/settingsContext";

import { Typography, Grid, Tooltip, ButtonGroup, Button, Skeleton, Box } from "@mui/material";
import ADSErrorDisplay from "./ADSErrorDisplay";

import { adsBlueA, adsMidGreyA, adsWhite, adsLightGreyB, adsOffWhite } from "../utils/ADSColours";
import { FormBoxRowStyle, FormRowStyle, controlLabelStyle, tooltipStyle } from "../utils/ADSStyles";

/* #endregion imports */

ADSLanguageControl.propTypes = {
  label: PropTypes.string.isRequired,
  isEditable: PropTypes.bool,
  isRequired: PropTypes.bool,
  isFocused: PropTypes.bool,
  loading: PropTypes.bool,
  helperText: PropTypes.string,
  value: PropTypes.string,
  errorText: PropTypes.array,
  onChange: PropTypes.func.isRequired,
};

ADSLanguageControl.defaultProps = {
  isEditable: false,
  isRequired: false,
  isFocused: false,
  loading: false,
};

function ADSLanguageControl({
  label,
  isEditable,
  isRequired,
  isFocused,
  loading,
  helperText,
  value,
  errorText,
  onChange,
}) {
  const settingsContext = useContext(SettingsContext);

  const [displayError, setDisplayError] = useState("");

  const hasError = useRef(false);

  const [selectedLanguage, setSelectedLanguage] = useState(!loading ? value : undefined);

  /**
   * Event to handle when the language is clicked.
   *
   * @param {object} event The event object.
   */
  const handleLanguageClick = (event) => {
    setSelectedLanguage(event.nativeEvent.target.innerText);
    if (onChange) onChange(event.nativeEvent.target.innerText);
  };

  /**
   * Method to get the styling to use for the buttons.
   *
   * @param {object} selected True if the button is selected; otherwise false.
   * @returns {object} The styling to use for the button.
   */
  const getButtonStyle = (selected) => {
    if (selected)
      return {
        backgroundColor: adsBlueA,
        color: adsWhite,
        borderColor: adsBlueA,
        "&:hover": {
          backgroundColor: adsBlueA,
          color: adsWhite,
          borderColor: adsBlueA,
        },
      };
    else
      return {
        backgroundColor: adsOffWhite,
        color: adsLightGreyB,
        borderColor: adsLightGreyB,
        "&:hover": {
          color: adsMidGreyA,
          borderColor: adsMidGreyA,
        },
      };
  };

  useEffect(() => {
    hasError.current = errorText && errorText.length > 0;

    if (hasError.current) {
      if (Array.isArray(errorText)) setDisplayError(errorText.join(", "));
      else setDisplayError(errorText);
    } else setDisplayError(null);

    if (!loading && value) setSelectedLanguage(value);
  }, [errorText, loading, value]);

  useEffect(() => {
    let element = null;

    if (isFocused) {
      element = document.getElementById("eng-button");
    }

    if (element) element.focus();
  });

  return (
    <Box sx={FormBoxRowStyle(hasError.current)}>
      <Grid container justifyContent="flex-start" alignItems="center" sx={FormRowStyle(hasError.current)}>
        <Grid item xs={3}>
          <Typography
            id={`ads-text-label-${label.toLowerCase().replaceAll(" ", "-")}`}
            variant="body2"
            align="left"
            sx={controlLabelStyle}
          >
            {`${label}${isRequired ? "*" : ""}`}
          </Typography>
        </Grid>
        <Grid item xs={9}>
          {loading ? (
            <Skeleton variant="rectangular" animation="wave" height="30px" width="100%" />
          ) : helperText && helperText.length > 0 ? (
            <Tooltip
              title={isRequired ? helperText + " This is a required field." : helperText}
              arrow
              placement="right"
              sx={tooltipStyle}
            >
              <ButtonGroup>
                <Button
                  id="eng-button"
                  disabled={!isEditable}
                  variant="outlined"
                  sx={getButtonStyle(selectedLanguage === "ENG")}
                  onClick={handleLanguageClick}
                  aria-labelledby={`ads-text-label-${label.toLowerCase().replaceAll(" ", "-")}`}
                >
                  ENG
                </Button>
                {settingsContext.isScottish && (
                  <Button
                    id="gae-button"
                    disabled={!isEditable}
                    variant="outlined"
                    sx={getButtonStyle(selectedLanguage === "GAE")}
                    onClick={handleLanguageClick}
                    aria-labelledby={`ads-text-label-${label.toLowerCase().replaceAll(" ", "-")}`}
                  >
                    GAE
                  </Button>
                )}
                {settingsContext.isWelsh && (
                  <Button
                    id="cym-button"
                    disabled={!isEditable}
                    variant="outlined"
                    sx={getButtonStyle(selectedLanguage === "CYM")}
                    onClick={handleLanguageClick}
                    aria-labelledby={`ads-text-label-${label.toLowerCase().replaceAll(" ", "-")}`}
                  >
                    CYM
                  </Button>
                )}
              </ButtonGroup>
            </Tooltip>
          ) : (
            <ButtonGroup>
              <Button
                id="eng-button"
                disabled={!isEditable}
                variant="outlined"
                sx={getButtonStyle(selectedLanguage === "ENG")}
                onClick={handleLanguageClick}
                aria-labelledby={`ads-text-label-${label.toLowerCase().replaceAll(" ", "-")}`}
              >
                ENG
              </Button>
              {settingsContext.isScottish && (
                <Button
                  id="gae-button"
                  disabled={!isEditable}
                  variant="outlined"
                  sx={getButtonStyle(selectedLanguage === "GAE")}
                  onClick={handleLanguageClick}
                  aria-labelledby={`ads-text-label-${label.toLowerCase().replaceAll(" ", "-")}`}
                >
                  GAE
                </Button>
              )}
              {settingsContext.isWelsh && (
                <Button
                  id="cym-button"
                  disabled={!isEditable}
                  variant="outlined"
                  sx={getButtonStyle(selectedLanguage === "CYM")}
                  onClick={handleLanguageClick}
                  aria-labelledby={`ads-text-label-${label.toLowerCase().replaceAll(" ", "-")}`}
                >
                  CYM
                </Button>
              )}
            </ButtonGroup>
          )}
        </Grid>
        <ADSErrorDisplay errorText={displayError} id={`${label.toLowerCase().replaceAll(" ", "-")}-language-error`} />
      </Grid>
    </Box>
  );
}

export default ADSLanguageControl;
