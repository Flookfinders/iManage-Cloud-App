//#region header */
/**************************************************************************************************
//
//  Description: Whole road control
//
//  Copyright:    © 2021 - 2023 Idox Software Limited.
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
//    004   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Typography, Grid, Tooltip, ButtonGroup, Button, Skeleton } from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSErrorDisplay from "./ADSErrorDisplay";
import { WholeRoadIcon } from "../utils/ADSIcons";
import { adsMidGreyA, adsWhite } from "../utils/ADSColours";
import { FormBoxRowStyle, FormRowStyle, controlLabelStyle, tooltipStyle, getButtonStyle } from "../utils/ADSStyles";

ADSWholeRoadControl.propTypes = {
  label: PropTypes.string.isRequired,
  isEditable: PropTypes.bool,
  isRequired: PropTypes.bool,
  loading: PropTypes.bool,
  helperText: PropTypes.string,
  value: PropTypes.bool,
  errorText: PropTypes.array,
  onChange: PropTypes.func.isRequired,
};

ADSWholeRoadControl.defaultProps = {
  isEditable: false,
  isRequired: false,
  loading: false,
};

function ADSWholeRoadControl({ label, isEditable, isRequired, loading, helperText, value, errorText, onChange }) {
  const [displayError, setDisplayError] = useState(null);

  const hasError = useRef(false);

  /**
   * Event to handle when the whole road button is clicked.
   *
   * @param {object} event The event object.
   */
  const handleWholeRoadClick = (event) => {
    if (onChange) onChange(true);
  };

  /**
   * Event to handle when the part road button is clicked.
   */
  const handlePartRoadClick = () => {
    if (onChange) onChange(false);
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
                {value ? (
                  <Button
                    id="whole-road-button"
                    disabled={!isEditable}
                    onClick={handleWholeRoadClick}
                    aria-labelledby={`ads-text-label-${label.toLowerCase().replaceAll(" ", "-")}`}
                    sx={getButtonStyle(value)}
                  >
                    <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
                      <WholeRoadIcon wholeRoad={true} />
                      <Typography variant="body1" sx={{ textTransform: "none" }}>
                        Whole road
                      </Typography>
                    </Stack>
                  </Button>
                ) : (
                  <Button
                    id="whole-road-button"
                    disabled={!isEditable}
                    onClick={handleWholeRoadClick}
                    aria-labelledby={`ads-text-label-${label.toLowerCase().replaceAll(" ", "-")}`}
                    sx={getButtonStyle(value)}
                  >
                    <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
                      <WholeRoadIcon wholeRoad={true} />
                      <Typography variant="body1" sx={{ textTransform: "none" }}>
                        Whole road
                      </Typography>
                    </Stack>
                  </Button>
                )}
                {!value ? (
                  <Button
                    id="part-road-button"
                    disabled={!isEditable}
                    onClick={handlePartRoadClick}
                    aria-labelledby={`ads-text-label-${label.toLowerCase().replaceAll(" ", "-")}`}
                    sx={getButtonStyle(!value)}
                  >
                    <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
                      <WholeRoadIcon wholeRoad={false} partRoadColour={adsWhite} />
                      <Typography variant="body1" sx={{ textTransform: "none" }}>
                        Part of road
                      </Typography>
                    </Stack>
                  </Button>
                ) : (
                  <Button
                    id="part-road-button"
                    disabled={!isEditable}
                    onClick={handlePartRoadClick}
                    aria-labelledby={`ads-text-label-${label.toLowerCase().replaceAll(" ", "-")}`}
                    sx={getButtonStyle(!value)}
                  >
                    <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
                      <WholeRoadIcon wholeRoad={false} partRoadColour={adsMidGreyA} />
                      <Typography variant="body1" sx={{ textTransform: "none" }}>
                        Part of road
                      </Typography>
                    </Stack>
                  </Button>
                )}
              </ButtonGroup>
            </Tooltip>
          ) : (
            <ButtonGroup>
              {value ? (
                <Button
                  id="whole-road-button"
                  disabled={!isEditable}
                  onClick={handleWholeRoadClick}
                  aria-labelledby={`ads-text-label-${label.toLowerCase().replaceAll(" ", "-")}`}
                  sx={getButtonStyle(value)}
                >
                  <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
                    <WholeRoadIcon wholeRoad={true} />
                    <Typography variant="body1" sx={{ textTransform: "none" }}>
                      Whole road
                    </Typography>
                  </Stack>
                </Button>
              ) : (
                <Button
                  id="whole-road-button"
                  disabled={!isEditable}
                  onClick={handleWholeRoadClick}
                  aria-labelledby={`ads-text-label-${label.toLowerCase().replaceAll(" ", "-")}`}
                  sx={getButtonStyle(value)}
                >
                  <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
                    <WholeRoadIcon wholeRoad={true} />
                    <Typography variant="body1" sx={{ textTransform: "none" }}>
                      Whole road
                    </Typography>
                  </Stack>
                </Button>
              )}
              {!value ? (
                <Button
                  id="part-road-button"
                  disabled={!isEditable}
                  onClick={handlePartRoadClick}
                  aria-labelledby={`ads-text-label-${label.toLowerCase().replaceAll(" ", "-")}`}
                  sx={getButtonStyle(!value)}
                >
                  <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
                    <WholeRoadIcon wholeRoad={false} partRoadColour={adsWhite} />
                    <Typography variant="body1" sx={{ textTransform: "none" }}>
                      Part of road
                    </Typography>
                  </Stack>
                </Button>
              ) : (
                <Button
                  id="part-road-button"
                  disabled={!isEditable}
                  onClick={handlePartRoadClick}
                  aria-labelledby={`ads-text-label-${label.toLowerCase().replaceAll(" ", "-")}`}
                  sx={getButtonStyle(!value)}
                >
                  <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
                    <WholeRoadIcon wholeRoad={false} partRoadColour={adsMidGreyA} />
                    <Typography variant="body1" sx={{ textTransform: "none" }}>
                      Part of road
                    </Typography>
                  </Stack>
                </Button>
              )}
            </ButtonGroup>
          )}
        </Grid>
        <ADSErrorDisplay errorText={displayError} id={`${label.toLowerCase().replaceAll(" ", "-")}-whole-road-error`} />
      </Grid>
    </Box>
  );
}

export default ADSWholeRoadControl;
