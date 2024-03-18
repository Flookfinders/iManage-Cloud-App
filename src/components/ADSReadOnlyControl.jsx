/* #region header */
/**************************************************************************************************
//
//  Description: Read Only component
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   13.04.21 Sean Flook         WI39345 Initial Revision.
//    002   05.05.21 Sean Flook         WI39345 Tweaks to the UI after design review meeting.
//    003   14.05.21 Sean Flook         WI39345 Updated className.
//    004   27.10.23 Sean Flook                 Updated call to FormRowStyle.
//    005   27.02.24 Sean Flook           MUL16 Added ability to display a button.
//    006   18.03.24 Sean Flook      STRFRM4_OS Added nullString parameter.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */

import React, { Fragment } from "react";
import PropTypes from "prop-types";

import { Button, Grid, Typography, Skeleton, Tooltip } from "@mui/material";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import {
  FormRowStyle,
  controlLabelStyle,
  boldControlLabelStyle,
  transparentButtonStyle,
  tooltipStyle,
} from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

/* #endregion imports */

ADSReadOnlyControl.propTypes = {
  loading: PropTypes.bool,
  noLeftPadding: PropTypes.bool,
  boldLabel: PropTypes.bool,
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  nullString: PropTypes.string,
  buttonVariant: PropTypes.oneOf(["none", "viewRelated"]),
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
  onButtonClick,
}) {
  const theme = useTheme();

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

      default:
        return null;
    }
  };

  const getButtonText = () => {
    switch (buttonVariant) {
      case "viewRelated":
        return "All related";

      default:
        return "";
    }
  };

  return (
    <Grid container justifyContent="flex-start" alignItems="center" sx={FormRowStyle(false)}>
      <Grid item xs={3}>
        <Typography
          id={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
          variant="body2"
          align="left"
          color="textPrimary"
          sx={boldLabel ? boldControlLabelStyle : controlLabelStyle}
        >
          {label}
        </Typography>
      </Grid>
      {buttonVariant === "none" ? (
        <Grid item xs={9}>
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
        </Grid>
      ) : (
        <Fragment>
          <Grid item xs={9}>
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
          </Grid>
          <Grid item xs={3} />
          <Grid item xs={9}>
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
          </Grid>
        </Fragment>
      )}
    </Grid>
  );
}

export default ADSReadOnlyControl;
