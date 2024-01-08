/* #region header */
/**************************************************************************************************
//
//  Description: Notifications Avatar component
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   06.07.21 Sean Flook                 Initial Revision.
//    002   05.01.24 Sean Flook                 Changes to sort out warnings.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */

import React from "react";
import NotificationsIcon from "@mui/icons-material/NotificationsNoneOutlined";
import { Tooltip, Grid, Badge, IconButton } from "@mui/material";
import { ActionIconStyle, tooltipStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

/* #endregion imports */

function ADSNotificationsAvatar(props) {
  const theme = useTheme();

  const notificationCount = props.count;

  /**
   * Event to handle when the button is clicked.
   */
  const handleClick = () => {
    props.handleClick();
  };

  /**
   * Method to get the notification icon styling.
   *
   * @returns {object} The notification icon styling.
   */
  function getNotificationIconStyle() {
    if (notificationCount > 0) return ActionIconStyle();
    else
      return {
        color: theme.palette.text.disabled,
      };
  }

  return (
    <Grid item xs={12}>
      <Tooltip title="Notifications" arrow placement="right" sx={tooltipStyle}>
        <span>
          <IconButton aria-label="profile" onClick={handleClick} disabled={notificationCount === 0} size="large">
            <Badge badgeContent={notificationCount} color="error">
              <NotificationsIcon fontSize="large" sx={getNotificationIconStyle()} />
            </Badge>
          </IconButton>
        </span>
      </Tooltip>
    </Grid>
  );
}

export default ADSNotificationsAvatar;
