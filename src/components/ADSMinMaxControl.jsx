/* #region header */
/**************************************************************************************************
//
//  Description: Min Max component
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001            Sean Flook                 Initial Revision.
//    002   27.06.23 Sean Flook         WI40729 Correctly handle if errorText is a string rather then an array.
//    003   06.10.23 Sean Flook                 Use colour variables.
//    004   24.11.23 Sean Flook                 Moved Box to @mui/system.
//    005   05.01.24 Sean Flook                 Use CSS shortcuts.
//    006   10.01.24 Sean Flook                 Fix warnings.
//#endregion Version 1.0.0.0 changes
//#region Version 1.0.1.0 changes
//    007   31.10.24 Sean Flook      IMANN-1012 Fix the height of the skeleton controls.
//#endregion Version 1.0.1.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

import { Grid, Typography, Tooltip, Skeleton, Button } from "@mui/material";
import { Box } from "@mui/system";
import ADSErrorDisplay from "./ADSErrorDisplay";

import { adsBlack20 } from "../utils/ADSColours";
import {
  FormBoxRowStyle,
  FormRowStyle,
  whiteButtonStyle,
  controlLabelStyle,
  tooltipStyle,
  skeletonHeight,
} from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

ADSMinMaxControl.propTypes = {
  label: PropTypes.string.isRequired,
  isEditable: PropTypes.bool,
  isRequired: PropTypes.bool,
  loading: PropTypes.bool,
  helperText: PropTypes.string,
  minValue: PropTypes.number,
  maxValue: PropTypes.number,
  buttonText: PropTypes.string,
  errorText: PropTypes.array,
  onChange: PropTypes.func.isRequired,
};

ADSMinMaxControl.defaultProps = {
  isEditable: false,
  isRequired: false,
  loading: false,
  buttonText: "Update",
};

function ADSMinMaxControl({
  label,
  isEditable,
  isRequired,
  loading,
  helperText,
  minValue,
  maxValue,
  buttonText,
  errorText,
  onChange,
}) {
  const theme = useTheme();

  const [displayError, setDisplayError] = useState("");

  const hasError = useRef(false);

  const boxStyle = {
    borderStyle: "solid",
    borderWidth: "1.5px",
    borderColor: adsBlack20,
    borderRadius: "4px",
    mr: theme.spacing(2),
    height: "38px",
  };

  /**
   * Event to handle when the update button is clicked.
   */
  const handleUpdateClick = () => {
    if (onChange) onChange();
  };

  useEffect(() => {
    hasError.current = errorText && errorText.length > 0;

    if (hasError.current) {
      if (Array.isArray(errorText)) setDisplayError(errorText.join(", "));
      else setDisplayError(errorText);
    } else setDisplayError(null);
  }, [errorText]);

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
          ) : helperText && helperText.length > 0 ? (
            <Tooltip
              title={isRequired ? helperText + " This is a required field." : helperText}
              arrow
              placement="right"
              sx={tooltipStyle}
            >
              <Grid container justifyContent="flex-start" alignItems="center">
                <Grid item xs={1}>
                  <Typography id={`${label.toLowerCase().replaceAll(" ", "-")}-min-label`} variant="body2" align="left">
                    Min
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={boxStyle}>
                    <Typography
                      id={`${label.toLowerCase().replaceAll(" ", "-")}-min-value`}
                      variant="body2"
                      align="left"
                      sx={{ pb: "8.5px", pl: "14px", pr: "14px", pt: "8.5px" }}
                    >{`${minValue ? minValue : 0}`}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={1}>
                  <Typography id={`${label.toLowerCase().replaceAll(" ", "-")}-max-label`} variant="body2" align="left">
                    Max
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={boxStyle}>
                    <Typography
                      id={`${label.toLowerCase().replaceAll(" ", "-")}-max-value`}
                      variant="body2"
                      align="left"
                      sx={{ pb: "8.5px", pl: "14px", pr: "14px", pt: "8.5px" }}
                    >{`${maxValue ? maxValue : 0}`}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={2}>
                  <Button variant="contained" sx={whiteButtonStyle} disabled={!isEditable} onClick={handleUpdateClick}>
                    {buttonText}
                  </Button>
                </Grid>
              </Grid>
            </Tooltip>
          ) : (
            <Grid container justifyContent="flex-start" alignItems="center">
              <Grid item xs={1}>
                <Typography id={`${label.toLowerCase().replaceAll(" ", "-")}-min-label`} variant="body2" align="left">
                  Min
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Box sx={boxStyle}>
                  <Typography
                    id={`${label.toLowerCase().replaceAll(" ", "-")}-min-value`}
                    variant="body2"
                    align="left"
                    sx={{ pb: "8.5px", pl: "14px", pr: "14px", pt: "8.5px" }}
                  >{`${minValue ? minValue : 0}`}</Typography>
                </Box>
              </Grid>
              <Grid item xs={1}>
                <Typography id={`${label.toLowerCase().replaceAll(" ", "-")}-max-label`} variant="body2" align="left">
                  Max
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Box sx={boxStyle}>
                  <Typography
                    id={`${label.toLowerCase().replaceAll(" ", "-")}-max-value`}
                    variant="body2"
                    align="left"
                    sx={{ pb: "8.5px", pl: "14px", pr: "14px", pt: "8.5px" }}
                  >{`${maxValue ? maxValue : 0}`}</Typography>
                </Box>
              </Grid>
              <Grid item xs={2}>
                <Button variant="contained" sx={whiteButtonStyle} disabled={!isEditable} onClick={handleUpdateClick}>
                  {buttonText}
                </Button>
              </Grid>
            </Grid>
          )}
        </Grid>
        <ADSErrorDisplay errorText={displayError} id={`${label.toLowerCase().replaceAll(" ", "-")}-min-max-error`} />
      </Grid>
    </Box>
  );
}

export default ADSMinMaxControl;
