/* #region header */
/**************************************************************************************************
//
//  Description: Read Only component
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
//    002   05.05.21 Sean Flook         WI39345 Tweaks to the UI after design review meeting.
//    003   14.05.21 Sean Flook         WI39345 Updated className.
//    004   27.10.23 Sean Flook                 Updated call to FormRowStyle.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */

import React from "react";
import PropTypes from "prop-types";
import { Grid, Typography } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import { useTheme } from "@mui/styles";
import { FormRowStyle, controlLabelStyle, boldControlLabelStyle } from "../utils/ADSStyles";

/* #endregion imports */

ADSReadOnlyControl.propTypes = {
  loading: PropTypes.bool,
  noLeftPadding: PropTypes.bool,
  boldLabel: PropTypes.bool,
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
};

ADSReadOnlyControl.defaultProps = {
  loading: false,
  noLeftPadding: false,
  boldLabel: false,
};

function ADSReadOnlyControl({ loading, noLeftPadding, boldLabel, label, value }) {
  const theme = useTheme();

  /**
   * Method to get the styling for the control.
   *
   * @returns {object} The styling to use on the control.
   */
  const getValueStyle = () => {
    if (noLeftPadding)
      return {
        pt: theme.spacing(1.75),
        pb: theme.spacing(1.75),
      };
    else
      return {
        pl: theme.spacing(2),
        pt: theme.spacing(1.75),
        pb: theme.spacing(1.75),
      };
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
      <Grid item xs={9}>
        <Typography
          id={`${label.toLowerCase().replaceAll(" ", "-")}-read-only`}
          variant="body1"
          align="left"
          color="textPrimary"
          sx={getValueStyle()}
          aria-labelledby={`${label.toLowerCase().replaceAll(" ", "-")}-label`}
        >
          {loading ? <Skeleton animation="wave" /> : value}
        </Typography>
      </Grid>
    </Grid>
  );
}

export default ADSReadOnlyControl;
