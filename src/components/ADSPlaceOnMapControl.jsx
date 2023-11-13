/* #region header */
/**************************************************************************************************
//
//  Description: Place on map component
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
//    002   06.10.23 Sean Flook                 Use colour variables.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import { Box, Stack, Typography, Button, ButtonGroup, IconButton, Grid } from "@mui/material";

import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import GrainIcon from "@mui/icons-material/Grain";
import { WholeRoadIcon } from "../utils/ADSIcons";
import TimelineIcon from "@mui/icons-material/Timeline";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import SquareOutlinedIcon from "@mui/icons-material/SquareOutlined";
import SquareIcon from "@mui/icons-material/Square";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";

import { adsBlueA, adsRed } from "../utils/ADSColours";
import { getStateButtonStyle, getStateButtonTextStyle } from "../utils/ADSStyles";

ADSPlaceOnMapControl.propTypes = {
  data: PropTypes.object.isRequired,
  isChild: PropTypes.bool,
  isRange: PropTypes.bool,
  onPlaceStyleChange: PropTypes.func.isRequired,
  onAreaStyleChange: PropTypes.func.isRequired,
  onStartPointChange: PropTypes.func.isRequired,
  onDirectionChange: PropTypes.func.isRequired,
};

ADSPlaceOnMapControl.defaultProps = {
  isChild: false,
  isRange: false,
};

function ADSPlaceOnMapControl({
  data,
  isChild,
  isRange,
  onPlaceStyleChange,
  onAreaStyleChange,
  onStartPointChange,
  onDirectionChange,
}) {
  // [point, area]
  const [placeStyle, setPlaceStyle] = useState(null);
  // [linear, streetGeometry, elliptical]
  const [areaStyle, setAreaStyle] = useState(null);
  // [topLeft, top, topRight, right, bottomRight, bottom, bottomLeft, left]
  const [startPoint, setStartPoint] = useState(null);
  // [clockwise, antiClockwise]
  const [direction, setDirection] = useState(null);

  /**
   * Event to handle the on a single point button click.
   *
   * @param {object} event The event object.
   */
  const handleOnASinglePointClick = (event) => {
    event.stopPropagation();
    if (onPlaceStyleChange) onPlaceStyleChange("point");
  };

  /**
   * Event to handle the spread around an area button click.
   *
   * @param {object} event The event object.
   */
  const handleSpreadAroundAnAreaClick = (event) => {
    event.stopPropagation();
    // TODO: Remove the if and alert once we have developed the spread around an area functionality
    // if (process.env.NODE_ENV === "development") {
    //   if (onPlaceStyleChange) onPlaceStyleChange("area");
    // } else alert("This functionality has not been developed yet.");
    alert("This functionality has not been developed yet.");
  };

  /**
   * Event to handle the linear button click.
   *
   * @param {object} event The event object.
   */
  const handleLinearClick = (event) => {
    event.stopPropagation();
    if (onAreaStyleChange) onAreaStyleChange("linear");
  };

  /**
   * Event to handle the street geometry button click.
   *
   * @param {object} event The event object.
   */
  const handleStreetGeometryClick = (event) => {
    event.stopPropagation();
    if (onAreaStyleChange) onAreaStyleChange("streetGeometry");
  };

  /**
   * Event to handle the elliptical button click.
   *
   * @param {object} event The event object.
   */
  const handleEllipticalClick = (event) => {
    event.stopPropagation();
    if (onAreaStyleChange) onAreaStyleChange("elliptical");
  };

  /**
   * Event to handle the top left button click.
   *
   * @param {object} event The event object.
   */
  const handleTopLeftClick = (event) => {
    event.stopPropagation();
    if (onStartPointChange) onStartPointChange("topLeft");
  };

  /**
   * Event to handle the top button click.
   *
   * @param {object} event The event object.
   */
  const handleTopClick = (event) => {
    event.stopPropagation();
    if (onStartPointChange) onStartPointChange("top");
  };

  /**
   * Event to handle the top right button click.
   *
   * @param {object} event The event object.
   */
  const handleTopRightClick = (event) => {
    event.stopPropagation();
    if (onStartPointChange) onStartPointChange("topRight");
  };

  /**
   * Event to handle the right button click.
   *
   * @param {object} event The event object.
   */
  const handleRightClick = (event) => {
    event.stopPropagation();
    if (onStartPointChange) onStartPointChange("right");
  };

  /**
   * Event to handle the bottom right button click.
   *
   * @param {object} event The event object.
   */
  const handleBottomRightClick = (event) => {
    event.stopPropagation();
    if (onStartPointChange) onStartPointChange("bottomRight");
  };

  /**
   * Event to handle the bottom button click.
   *
   * @param {object} event The event object.
   */
  const handleBottomClick = (event) => {
    event.stopPropagation();
    if (onStartPointChange) onStartPointChange("bottom");
  };

  /**
   * Event to handle the bottom left button click.
   *
   * @param {object} event The event object.
   */
  const handleBottomLeftClick = (event) => {
    event.stopPropagation();
    if (onStartPointChange) onStartPointChange("bottomLeft");
  };

  /**
   * Event to handle the left button click.
   *
   * @param {object} event The event object.
   */
  const handleLeftClick = (event) => {
    event.stopPropagation();
    if (onStartPointChange) onStartPointChange("left");
  };

  /**
   * Event to handle the clockwise button click.
   *
   * @param {object} event The event object.
   */
  const handleClockwiseClick = (event) => {
    event.stopPropagation();
    if (onDirectionChange) onDirectionChange("clockwise");
  };

  /**
   * Event to handle the anti-clockwise button click.
   *
   * @param {object} event The event object.
   */
  const handleAntiClockwiseClick = (event) => {
    event.stopPropagation();
    if (onDirectionChange) onDirectionChange("antiClockwise");
  };

  /**
   * Method to get the styling for the start point button.
   *
   * @param {boolean} selected True if the button is selected; otherwise false.
   * @returns {object} The styling for the start point button.
   */
  const startPointButtonStyle = (selected) => {
    if (selected) {
      return { width: "30px", height: "30px", color: adsBlueA };
    } else {
      return { width: "30px", height: "30px" };
    }
  };

  useEffect(() => {
    if (data) {
      setPlaceStyle(data.placeStyle);
      setAreaStyle(data.areaStyle);
      setStartPoint(data.startPoint);
      setDirection(data.direction);
    }
  }, [data]);

  return (
    <Box
      id="ads-place-on-map-control"
      sx={{
        width: "55ch",
        margin: "8px",
        cursor: "default",
      }}
    >
      {!isRange ? (
        <Stack direction="column" spacing={2} sx={{ padding: "8px 16px" }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Place on map
          </Typography>
          <Typography variant="body2">
            {`Place the ${
              isChild ? "child" : "property"
            } by clicking on the map or dragging and dropping into position.`}
          </Typography>
          <Typography variant="body2">{`Then click Finish to create ${isChild ? "child" : "property"}.`}</Typography>
        </Stack>
      ) : (
        <Stack direction="column" spacing={2} sx={{ padding: "8px 16px" }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Place on map
          </Typography>
          <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={2}>
            <Button
              id="on-a-single-point-button"
              variant="outlined"
              sx={getStateButtonStyle(placeStyle === "point", 0)}
              startIcon={<CenterFocusStrongIcon />}
              onClick={handleOnASinglePointClick}
            >
              <Typography
                id="on-a-single-point-button-text"
                variant="body2"
                align="left"
                sx={getStateButtonTextStyle(placeStyle === "point")}
              >
                {`${isChild ? "On parent point" : "On a single point"}`}
              </Typography>
            </Button>
            <Button
              id="spread-around-an-area-button"
              variant="outlined"
              sx={getStateButtonStyle(placeStyle === "area", 0)}
              startIcon={<GrainIcon />}
              onClick={handleSpreadAroundAnAreaClick}
            >
              <Typography
                id="on-a-single-point-button-text"
                variant="body2"
                align="left"
                sx={getStateButtonTextStyle(placeStyle === "area")}
              >
                {`${isChild ? "Spread around parent" : "Spread around an area"}`}
              </Typography>
            </Button>
          </Stack>
          {placeStyle === "point" && !isChild && (
            <Typography variant="body2">
              Choose point by clicking on the map or by dragging and dropping pin into position.
            </Typography>
          )}
          {placeStyle === "point" && (
            <Typography variant="body2">{`${isChild ? "Click" : "Then click"} Next to continue.`}</Typography>
          )}
          {placeStyle === "area" && (
            <Stack direction="column" spacing={0}>
              <Typography variant="body2">Shape of area</Typography>
              <ButtonGroup>
                <Button
                  id="property-linear-button"
                  variant="outlined"
                  sx={getStateButtonStyle(areaStyle === "linear", 0)}
                  startIcon={<WholeRoadIcon wholeRoad={true} />}
                  onClick={handleLinearClick}
                >
                  <Typography
                    id="property-linear_button-text"
                    variant="body2"
                    align="left"
                    sx={getStateButtonTextStyle(areaStyle === "linear")}
                  >
                    Linear
                  </Typography>
                </Button>
                <Button
                  id="property-street-geometry-button"
                  variant="outlined"
                  sx={getStateButtonStyle(areaStyle === "streetGeometry", 0)}
                  startIcon={<TimelineIcon />}
                  onClick={handleStreetGeometryClick}
                >
                  <Typography
                    id="property-street-geometry-button-text"
                    variant="body2"
                    align="left"
                    sx={getStateButtonTextStyle(areaStyle === "streetGeometry")}
                  >
                    Street geometry
                  </Typography>
                </Button>
                <Button
                  id="property-elliptical-button"
                  variant="outlined"
                  sx={getStateButtonStyle(areaStyle === "elliptical", 0)}
                  startIcon={<RadioButtonUncheckedIcon />}
                  onClick={handleEllipticalClick}
                >
                  <Typography
                    id="property-elliptical-button-text"
                    variant="body2"
                    align="left"
                    sx={getStateButtonTextStyle(areaStyle === "elliptical")}
                  >
                    Elliptical
                  </Typography>
                </Button>
              </ButtonGroup>
            </Stack>
          )}
          {placeStyle === "area" && areaStyle === "elliptical" && (
            <Stack direction="row" alignItems="flex-start" spacing={3}>
              <Stack direction="column" spacing={0}>
                <Typography variant="body2">Start point</Typography>
                <Grid container sx={{ width: "120px" }}>
                  <Grid item xs={4}>
                    <IconButton aria-label="topLeft" onClick={handleTopLeftClick}>
                      {startPoint === "topLeft" ? (
                        <SquareIcon sx={startPointButtonStyle(true)} />
                      ) : (
                        <SquareOutlinedIcon sx={startPointButtonStyle(false)} />
                      )}
                    </IconButton>
                  </Grid>
                  <Grid item xs={4}>
                    <IconButton aria-label="top" onClick={handleTopClick}>
                      {startPoint === "top" ? (
                        <SquareIcon sx={startPointButtonStyle(true)} />
                      ) : (
                        <SquareOutlinedIcon sx={startPointButtonStyle(false)} />
                      )}
                    </IconButton>
                  </Grid>
                  <Grid item xs={4}>
                    <IconButton aria-label="topRight" onClick={handleTopRightClick}>
                      {startPoint === "topRight" ? (
                        <SquareIcon sx={startPointButtonStyle(true)} />
                      ) : (
                        <SquareOutlinedIcon sx={startPointButtonStyle(false)} />
                      )}
                    </IconButton>
                  </Grid>
                  <Grid item xs={4}>
                    <IconButton aria-label="left" onClick={handleLeftClick}>
                      {startPoint === "left" ? (
                        <SquareIcon sx={startPointButtonStyle(true)} />
                      ) : (
                        <SquareOutlinedIcon sx={startPointButtonStyle(false)} />
                      )}
                    </IconButton>
                  </Grid>
                  <Grid item xs={4} />
                  <Grid item xs={4}>
                    <IconButton aria-label="right" onClick={handleRightClick}>
                      {startPoint === "right" ? (
                        <SquareIcon sx={startPointButtonStyle(true)} />
                      ) : (
                        <SquareOutlinedIcon sx={startPointButtonStyle(false)} />
                      )}
                    </IconButton>
                  </Grid>
                  <Grid item xs={4}>
                    <IconButton aria-label="bottomLeft" onClick={handleBottomLeftClick}>
                      {startPoint === "bottomLeft" ? (
                        <SquareIcon sx={startPointButtonStyle(true)} />
                      ) : (
                        <SquareOutlinedIcon sx={startPointButtonStyle(false)} />
                      )}
                    </IconButton>
                  </Grid>
                  <Grid item xs={4}>
                    <IconButton aria-label="bottom" onClick={handleBottomClick}>
                      {startPoint === "bottom" ? (
                        <SquareIcon sx={startPointButtonStyle(true)} />
                      ) : (
                        <SquareOutlinedIcon sx={startPointButtonStyle(false)} />
                      )}
                    </IconButton>
                  </Grid>
                  <Grid item xs={4}>
                    <IconButton aria-label="bottomRight" onClick={handleBottomRightClick}>
                      {startPoint === "bottomRight" ? (
                        <SquareIcon sx={startPointButtonStyle(true)} />
                      ) : (
                        <SquareOutlinedIcon sx={startPointButtonStyle(false)} />
                      )}
                    </IconButton>
                  </Grid>
                </Grid>
              </Stack>
              <Stack direction="column" spacing={0}>
                <Typography variant="body2">Direction</Typography>
                <ButtonGroup>
                  <Button
                    id="property-clockwise-button"
                    variant="outlined"
                    sx={getStateButtonStyle(direction === "clockwise", 0)}
                    startIcon={<RotateRightIcon />}
                    onClick={handleClockwiseClick}
                  >
                    <Typography
                      id="property-clockwise-button-text"
                      variant="body2"
                      align="left"
                      sx={getStateButtonTextStyle(direction === "clockwise")}
                    >
                      Clockwise
                    </Typography>
                  </Button>
                  <Button
                    id="property-anti-clockwise-button"
                    variant="outlined"
                    sx={getStateButtonStyle(direction === "antiClockwise", 0)}
                    startIcon={<RotateLeftIcon />}
                    onClick={handleAntiClockwiseClick}
                  >
                    <Typography
                      id="property-anti-clockwise-button-text"
                      variant="body2"
                      align="left"
                      sx={getStateButtonTextStyle(direction === "antiClockwise")}
                    >
                      Anti-clockwise
                    </Typography>
                  </Button>
                </ButtonGroup>
              </Stack>
            </Stack>
          )}
          {placeStyle === "area" && (
            <Typography variant="body2" align="left" sx={{ color: adsRed, fontWeight: 600 }}>
              This functionality is still under construction.
            </Typography>
          )}
        </Stack>
      )}
    </Box>
  );
}

export default ADSPlaceOnMapControl;
