//#region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Read Only component
//
//  Copyright:    © 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//#region Version 1.0.0.0
//    001   13.04.21 Sean Flook          WI39345 Initial Revision.
//    002   05.05.21 Sean Flook          WI39345 Tweaks to the UI after design review meeting.
//    003   14.05.21 Sean Flook          WI39345 Updated className.
//    004   27.10.23 Sean Flook                  Updated call to FormRowStyle.
//    005   27.02.24 Sean Flook            MUL16 Added ability to display a button.
//    006   18.03.24 Sean Flook       STRFRM4_OS Added nullString parameter.
//    007   29.05.24 Sean Flook        IMANN-490 Modified for USRN.
//#endregion Version 1.0.0.0
//#region Version 1.0.5.0
//    008   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//#endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//#endregion header

//#region imports

import React, { useState, useRef, useEffect, Fragment } from "react";
import PropTypes from "prop-types";

import { Button, Grid2, Typography, Skeleton, Tooltip, Stack, Box } from "@mui/material";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EditIcon from "@mui/icons-material/Edit";

import {
  FormRowStyle,
  controlLabelStyle,
  boldControlLabelStyle,
  transparentButtonStyle,
  tooltipStyle,
  FormBoxRowStyle,
} from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";
import ADSErrorDisplay from "./ADSErrorDisplay";

//#endregion imports

ADSReadOnlyControl.propTypes = {
  loading: PropTypes.bool,
  noLeftPadding: PropTypes.bool,
  boldLabel: PropTypes.bool,
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  nullString: PropTypes.string,
  buttonVariant: PropTypes.oneOf(["none", "viewRelated", "edit"]),
  errorText: PropTypes.array,
  onButtonClick: PropTypes.func,
};

ADSReadOnlyControl.defaultProps = {
  loading: false,
  noLeftPadding: false,
  boldLabel: false,
  nullString: "",
  buttonVariant: "none",
};

function ADSReadOnlyControl({
  loading,
  noLeftPadding,
  boldLabel,
  label,
  value,
  nullString,
  buttonVariant,
  errorText,
  onButtonClick,
}) {
  const theme = useTheme();

  const [displayError, setDisplayError] = useState("");
  const hasError = useRef(false);

  /**
   * Event to handle the button click
   */
  const handleButtonClick = () => {
    if (onButtonClick) onButtonClick();
  };

  /**
   * Method to get the styling for the control.
   *
   * @returns {object} The styling to use on the control.
   */
  const getValueStyle = () => {
    if (noLeftPadding) return null;
    else
      return {
        pl: theme.spacing(2),
      };
  };

  const getButtonTooltip = () => {
    switch (buttonVariant) {
      case "viewRelated":
        return "View all related records";

      case "edit":
        return `Edit ${label}`;

      default:
        return "";
    }
  };

  /**
   * Method to get the button icon.
   *
   * @returns {JSX.Element || null} The icon to be used on the button.
   */
  const getButtonIcon = () => {
    switch (buttonVariant) {
      case "viewRelated":
        return <ArrowForwardIcon />;

      case "edit":
        return <EditIcon />;

      default:
        return null;
    }
  };

  const getButtonText = () => {
    switch (buttonVariant) {
      case "viewRelated":
        return "All related";

      case "edit":
        return `Edit ${label}`;

      default:
        return "";
    }
  };

  const getButton = () => {
    switch (buttonVariant) {
      case "viewRelated":
        return (
          <Fragment>
            <Grid2 size={9}>
              <Typography
                id={`${label.toLowerCase().replaceAll(" ", "-")}-read-only`}
                variant="body1"
                align="left"
                color="textPrimary"
                sx={getValueStyle()}
                aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
              >
                {loading ? <Skeleton animation="wave" /> : value ? value : nullString}
              </Typography>
            </Grid2>
            <Grid2 size={3} />
            <Grid2 size={9}>
              <Tooltip title={getButtonTooltip()} arrow placement="right" sx={tooltipStyle}>
                <Button
                  variant="contained"
                  onClick={handleButtonClick}
                  sx={{ ...transparentButtonStyle, pt: "0px", pb: "0px" }}
                  startIcon={getButtonIcon()}
                >
                  {getButtonText()}
                </Button>
              </Tooltip>
            </Grid2>
          </Fragment>
        );

      case "edit":
        return (
          <Fragment>
            <Grid2 size={9}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography
                  id={`${label.toLowerCase().replaceAll(" ", "-")}-read-only`}
                  variant="body1"
                  align="left"
                  color="textPrimary"
                  sx={getValueStyle()}
                  aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
                >
                  {loading ? <Skeleton animation="wave" /> : value ? value : nullString}
                </Typography>
                <Tooltip title={getButtonTooltip()} arrow placement="right" sx={tooltipStyle}>
                  <Button
                    variant="contained"
                    onClick={handleButtonClick}
                    sx={{ ...transparentButtonStyle, pt: "0px", pb: "0px" }}
                    startIcon={getButtonIcon()}
                  >
                    {getButtonText()}
                  </Button>
                </Tooltip>
              </Stack>
            </Grid2>
          </Fragment>
        );

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

  return (
    <Box sx={FormBoxRowStyle(hasError.current)}>
      <Grid2 container justifyContent="flex-start" alignItems="center" sx={FormRowStyle(false)}>
        <Grid2 size={3}>
          <Typography
            id={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
            variant="body2"
            align="left"
            color="textPrimary"
            sx={boldLabel ? boldControlLabelStyle : controlLabelStyle}
          >
            {label}
          </Typography>
        </Grid2>
        {buttonVariant === "none" ? (
          <Grid2 size={9}>
            <Typography
              id={`${label.toLowerCase().replaceAll(" ", "-")}-read-only`}
              variant="body1"
              align="left"
              color="textPrimary"
              sx={getValueStyle()}
              aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
            >
              {loading ? <Skeleton animation="wave" /> : value ? value : nullString}
            </Typography>
          </Grid2>
        ) : (
          getButton()
        )}
        <ADSErrorDisplay errorText={displayError} id={`${label.toLowerCase().replaceAll(" ", "-")}-read-only-error`} />
      </Grid2>
    </Box>
  );
}

export default ADSReadOnlyControl;
