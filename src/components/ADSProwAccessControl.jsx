/* #region header */
/**************************************************************************************************
//
//  Description: PRoW access component
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
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Box, FormControlLabel, Checkbox, Skeleton } from "@mui/material";
import { DirectionsWalk, Skateboarding, DirectionsBike, DirectionsCar } from "@mui/icons-material";
import ADSErrorDisplay from "./ADSErrorDisplay";
import { EquestrianIcon } from "../utils/ADSIcons";
import { useTheme } from "@mui/styles";
import { adsBlueA, adsMidGreyA } from "../utils/ADSColours";
import { FormBoxRowStyle } from "../utils/ADSStyles";

ADSProwAccessControl.propTypes = {
  variant: PropTypes.oneOf(["Pedestrian", "Equestrian", "NonMotorised", "Bicycle", "Motorised"]).isRequired,
  value: PropTypes.bool,
  isEditable: PropTypes.bool,
  isFocused: PropTypes.bool,
  loading: PropTypes.bool,
  errorText: PropTypes.array,
  onChange: PropTypes.func.isRequired,
};

ADSProwAccessControl.defaultProps = {
  isEditable: false,
  isFocused: false,
  variant: "Pedestrian",
  loading: false,
};

function ADSProwAccessControl({ variant, value, isEditable, isFocused, loading, errorText, onChange }) {
  const theme = useTheme();

  const [accessHover, setAccessHover] = useState(false);
  const [displayError, setDisplayError] = useState("");
  const [accessChecked, setAccessChecked] = useState(value);
  const hasError = useRef(false);

  /**
   * Event to handle when the mouse enters the control.
   */
  const handleAccessMouseEnter = () => {
    setAccessHover(true);
  };

  /**
   * Event to handle when the mouse leaves the control.
   */
  const handleAccessMouseLeave = () => {
    setAccessHover(false);
  };

  /**
   * Event to handle when the control changes.
   *
   * @param {object} event The event object.
   */
  const handleAccessChangeEvent = (event) => {
    event.stopPropagation();
    const newValue = event.target.checked;
    setAccessChecked(newValue);
    if (onChange) onChange(newValue);
  };

  /**
   * Method to get the styling to be used for the indicator.
   *
   * @param {boolean} isChecked True if the indicator is checked; otherwise false.
   * @param {boolean} isHover True if the mouse is hovering over the control; otherwise false.
   * @returns {object} The styling to use for the indicator.
   */
  function getIndicatorStyle(isChecked, isHover) {
    if (isChecked || isHover)
      return {
        marginRight: theme.spacing(1),
        color: adsBlueA,
      };
    else
      return {
        marginRight: theme.spacing(1),
        color: adsMidGreyA,
        "&:hover": {
          color: adsBlueA,
        },
      };
  }

  /**
   * Method to get the label for the control.
   *
   * @returns {string} The label to use for the control.
   */
  const getLabel = () => {
    switch (variant) {
      case "Pedestrian":
        return "Pedestrian";

      case "Equestrian":
        return "Equestrian";

      case "NonMotorised":
        return "Non motorised vehicle";

      case "Bicycle":
        return "Bicycle";

      case "Motorised":
        return "Motorised vehicle";

      default:
        return "Unknown access type";
    }
  };

  /**
   * Method to get the controls icon.
   *
   * @returns {JSX.Element} The icon to use for the control.
   */
  const getIcon = () => {
    switch (variant) {
      case "Pedestrian":
        return <DirectionsWalk sx={getIndicatorStyle(value, accessHover)} />;

      case "Equestrian":
        return <EquestrianIcon sx={getIndicatorStyle(value, accessHover)} />;

      case "NonMotorised":
        return <Skateboarding sx={getIndicatorStyle(value, accessHover)} />;

      case "Bicycle":
        return <DirectionsBike sx={getIndicatorStyle(value, accessHover)} />;

      case "Motorised":
        return <DirectionsCar sx={getIndicatorStyle(value, accessHover)} />;

      default:
        return null;
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
      element = document.getElementById(`${getLabel().toLowerCase().replaceAll(" ", "-")}-prow-access-checkbox`);
    }

    if (element) element.focus();
  });

  useEffect(() => {
    setAccessChecked(value);
  }, [value]);

  return (
    <Box sx={FormBoxRowStyle(hasError.current)}>
      <FormControlLabel
        control={
          loading ? (
            <Skeleton variant="rectangular" animation="wave" height="60px" width="100%" />
          ) : (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Checkbox
                id={`${getLabel().toLowerCase().replaceAll(" ", "-")}-prow-access-checkbox`}
                checked={accessChecked}
                disabled={!isEditable}
                onChange={handleAccessChangeEvent}
              />
              {getIcon()}
            </Box>
          )
        }
        label={getLabel()}
        onMouseEnter={handleAccessMouseEnter}
        onMouseLeave={handleAccessMouseLeave}
        sx={getIndicatorStyle(value, accessHover)}
      />
      <ADSErrorDisplay
        errorText={displayError}
        id={`${getLabel().toLowerCase().replaceAll(" ", "-")}-prow-access-checkbox-error`}
      />
    </Box>
  );
}

export default ADSProwAccessControl;
