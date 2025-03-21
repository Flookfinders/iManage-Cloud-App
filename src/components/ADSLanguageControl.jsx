//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Language component
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
//    002   27.06.23 Sean Flook          WI40729 Correctly handle if errorText is a string rather then an array.
//    003   06.10.23 Sean Flook                  Use colour variables.
//    004   24.11.23 Sean Flook                  Moved Box to @mui/system.
//    005   29.05.24 Sean Flook        IMANN-489 Prevent the user from changing the language.
//endregion Version 1.0.0.0
//region Version 1.0.5.0
//    006   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//    007   17.03.25 Sean Flook       IMANN-1711 Only allow alternative languages if the metadata languages allow them.
//endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//endregion header

//region imports

import React, { useContext, useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";
import SettingsContext from "../context/settingsContext";

import { Typography, Grid2, Tooltip, ButtonGroup, Button, Skeleton } from "@mui/material";
import { Box } from "@mui/system";
import ADSErrorDisplay from "./ADSErrorDisplay";

import { adsBlueA, adsMidGreyA, adsWhite, adsLightGreyB, adsOffWhite } from "../utils/ADSColours";
import { FormBoxRowStyle, FormRowStyle, controlLabelStyle, tooltipStyle } from "../utils/ADSStyles";

//endregion imports

ADSLanguageControl.propTypes = {
  label: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  helperText: PropTypes.string,
  value: PropTypes.string,
  errorText: PropTypes.array,
  metadataLanguage: PropTypes.string.isRequired,
};

ADSLanguageControl.defaultProps = {
  loading: false,
};

function ADSLanguageControl({ label, loading, helperText, value, errorText, metadataLanguage }) {
  const settingsContext = useContext(SettingsContext);

  const [displayError, setDisplayError] = useState("");

  const hasError = useRef(false);

  const [selectedLanguage, setSelectedLanguage] = useState(!loading ? value : undefined);

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

  return (
    <Box sx={FormBoxRowStyle(hasError.current)}>
      <Grid2 container justifyContent="flex-start" alignItems="center" sx={FormRowStyle(hasError.current)}>
        <Grid2 size={3}>
          <Typography
            id={`ads-text-label-${label.toLowerCase().replaceAll(" ", "-")}`}
            variant="body2"
            align="left"
            sx={controlLabelStyle}
          >
            {`${label}*`}
          </Typography>
        </Grid2>
        <Grid2 size={9}>
          {loading ? (
            <Skeleton variant="rectangular" animation="wave" height="30px" width="100%" />
          ) : helperText && helperText.length > 0 ? (
            <Tooltip title={helperText + " This is a required field."} arrow placement="right" sx={tooltipStyle}>
              <ButtonGroup>
                <Button
                  id="eng-button"
                  variant="outlined"
                  sx={getButtonStyle(selectedLanguage === "ENG")}
                  aria-labelledby={`ads-text-label-${label.toLowerCase().replaceAll(" ", "-")}`}
                >
                  ENG
                </Button>
                {settingsContext.isScottish && metadataLanguage === "GAE" && (
                  <Button
                    id="gae-button"
                    variant="outlined"
                    sx={getButtonStyle(selectedLanguage === "GAE")}
                    aria-labelledby={`ads-text-label-${label.toLowerCase().replaceAll(" ", "-")}`}
                  >
                    GAE
                  </Button>
                )}
                {settingsContext.isWelsh && metadataLanguage === "BIL" && (
                  <Button
                    id="cym-button"
                    variant="outlined"
                    sx={getButtonStyle(selectedLanguage === "CYM")}
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
                variant="outlined"
                sx={getButtonStyle(selectedLanguage === "ENG")}
                aria-labelledby={`ads-text-label-${label.toLowerCase().replaceAll(" ", "-")}`}
              >
                ENG
              </Button>
              {settingsContext.isScottish && metadataLanguage === "GAE" && (
                <Button
                  id="gae-button"
                  variant="outlined"
                  sx={getButtonStyle(selectedLanguage === "GAE")}
                  aria-labelledby={`ads-text-label-${label.toLowerCase().replaceAll(" ", "-")}`}
                >
                  GAE
                </Button>
              )}
              {settingsContext.isWelsh && metadataLanguage === "BIL" && (
                <Button
                  id="cym-button"
                  variant="outlined"
                  sx={getButtonStyle(selectedLanguage === "CYM")}
                  aria-labelledby={`ads-text-label-${label.toLowerCase().replaceAll(" ", "-")}`}
                >
                  CYM
                </Button>
              )}
            </ButtonGroup>
          )}
        </Grid2>
        <ADSErrorDisplay errorText={displayError} id={`${label.toLowerCase().replaceAll(" ", "-")}-language-error`} />
      </Grid2>
    </Box>
  );
}

export default ADSLanguageControl;
