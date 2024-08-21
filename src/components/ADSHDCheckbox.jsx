/* #region header */
/**************************************************************************************************
//
//  Description: Checkbox component used in the highway dedication tab.
//
//  Copyright:    © 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   20.08.24 Sean Flook       IMANN-818 Initial version.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

import { Box, Checkbox, FormControlLabel, Grid, Skeleton } from "@mui/material";

import { DirectionsBike as NCRIcon } from "@mui/icons-material";
import {
  PRoWIcon,
  QuietRouteIcon,
  ObstructionIcon,
  PlanningOrderIcon,
  VehiclesProhibitedIcon,
} from "../utils/ADSIcons";

import { FormBoxRowStyle, FormRowStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";
import { adsBlueA, adsMidGreyA } from "../utils/ADSColours";
import ADSErrorDisplay from "./ADSErrorDisplay";

ADSHDCheckbox.propTypes = {
  variant: PropTypes.oneOf(["PRoW", "NCR", "Quiet route", "Obstruction", "Planning order", "Vehicles prohibited"])
    .isRequired,
  checked: PropTypes.bool.isRequired,
  isEditable: PropTypes.bool,
  isFocused: PropTypes.bool,
  loading: PropTypes.bool,
  errorText: PropTypes.array,
  onChange: PropTypes.func.isRequired,
};

ADSHDCheckbox.defaultProps = {
  isEditable: false,
  isFocused: false,
  loading: false,
};

function ADSHDCheckbox({ variant, checked, isEditable, isFocused, loading, errorText, onChange }) {
  const theme = useTheme();

  const [displayError, setDisplayError] = useState("");
  const hasError = useRef(false);
  const [hdCheckboxHover, setHdCheckboxHover] = useState(false);

  /**
   * Method to get the icon to be displayed on the control.
   *
   * @returns {JSX.Element} The icon to be displayed in the control.
   */
  const getControlIcon = () => {
    switch (variant) {
      case "PRoW":
        return <PRoWIcon sx={getIndicatorStyle(checked, hdCheckboxHover)} />;

      case "NCR":
        return <NCRIcon sx={getIndicatorStyle(checked, hdCheckboxHover)} />;

      case "Quiet route":
        return <QuietRouteIcon sx={getIndicatorStyle(checked, hdCheckboxHover)} />;

      case "Obstruction":
        return <ObstructionIcon sx={getIndicatorStyle(checked, hdCheckboxHover)} />;

      case "Planning order":
        return <PlanningOrderIcon sx={getIndicatorStyle(checked, hdCheckboxHover)} />;

      case "Vehicles prohibited":
        return <VehiclesProhibitedIcon sx={getIndicatorStyle(checked, hdCheckboxHover)} />;

      default:
        break;
    }
  };

  /**
   * Method to get the styling to be used for the indicator.
   *
   * @param {boolean} isChecked True if the item is checked; otherwise false.
   * @param {boolean} isHover True if the mouse is hovering over the item; otherwise false.
   * @returns {object} The styling to be used for the indicator.
   */
  function getIndicatorStyle(isChecked, isHover) {
    if (isChecked || isHover)
      return {
        mr: theme.spacing(1),
        color: adsBlueA,
      };
    else
      return {
        mr: theme.spacing(1),
        color: adsMidGreyA,
        "&:hover": {
          color: adsBlueA,
        },
      };
  }

  /**
   * Event to handle when the public rights of way flag is changed.
   *
   * @param {object} event The event object.
   */
  const handleChangeEvent = (event) => {
    const newValue = event.target.checked;
    if (onChange) onChange(newValue);
  };

  /**
   * Event to handle when the mouse enters the control.
   */
  const handleMouseEnter = () => {
    setHdCheckboxHover(true);
  };

  /**
   * Event to handle when the mouse leaves the control.
   */
  const handleMouseLeave = () => {
    setHdCheckboxHover(false);
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
      element = document.getElementById(`ads-hd-checkbox-${variant.toLowerCase().replaceAll(" ", "-")}`);
    }

    if (element) element.focus();
  });

  return (
    <Box sx={FormBoxRowStyle(hasError.current)}>
      <Grid container justifyContent="flex-start" alignItems="center" sx={FormRowStyle(hasError.current)}>
        <Grid item>
          {loading ? (
            <Skeleton variant="rectangular" animation="wave" height="60px" width="100%" />
          ) : (
            <FormControlLabel
              id={`ads-hd-checkbox-${variant.toLowerCase().replaceAll(" ", "-")}`}
              control={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Checkbox checked={checked} disabled={!isEditable} onChange={handleChangeEvent} />
                  {getControlIcon()}
                </Box>
              }
              label={variant}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              sx={getIndicatorStyle(checked, hdCheckboxHover)}
            />
          )}
        </Grid>
        <ADSErrorDisplay
          errorText={displayError}
          id={`${variant.toLowerCase().replaceAll(" ", "-")}-hd-checkbox-error`}
        />
      </Grid>
    </Box>
  );
}

export default ADSHDCheckbox;
