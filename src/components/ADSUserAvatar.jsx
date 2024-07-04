/* #region header */
/**************************************************************************************************
//
//  Description: User Avatar component
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   02.07.21 Sean Flook                 Initial Revision.
//    002   03.11.23 Sean Flook                 Modify to use the auditName.
//    003   10.11.23 Sean Flook                 Modified call to StringAvatar.
//    004   11.04.24 Sean Flook                 Do not adjust the auditname.
//    005   04.07.24 Sean Flook       IMANN-705 Use displayName for the user icon.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */

import React, { useContext, Fragment } from "react";
import PropTypes from "prop-types";
import UserContext from "../context/userContext";
import { StringAvatar } from "../utils/HelperUtils";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Tooltip, Grid, IconButton, Avatar, Typography } from "@mui/material";
import { ActionIconStyle, tooltipStyle } from "../utils/ADSStyles";

/* #endregion imports */

ADSUserAvatar.propTypes = {
  onUserClick: PropTypes.func.isRequired,
};

function ADSUserAvatar({ onUserClick }) {
  const userContext = useContext(UserContext);

  /**
   * Event to handle the click event.
   */
  const handleClick = () => {
    if (onUserClick) onUserClick();
  };

  /**
   * Method to get the current users icon.
   *
   * @returns {JSX.Element} The user icon.
   */
  function GetUserIcon() {
    if (!userContext.currentUser || !userContext.currentUser.active)
      return (
        <IconButton id="imanage-user-settings" aria-label="profile" onClick={handleClick} size="large">
          <Tooltip title="Login" arrow placement="right" sx={tooltipStyle}>
            <AccountCircleIcon fontSize="large" sx={ActionIconStyle()} />
          </Tooltip>
        </IconButton>
      );
    else {
      return (
        <Tooltip
          title={
            <Fragment>
              <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                {userContext.currentUser.displayName}
              </Typography>
              <br />
              <Typography variant="caption">Settings & Admin</Typography>
            </Fragment>
          }
          arrow
          placement="right"
          sx={tooltipStyle}
        >
          <Avatar
            id="imanage-user-settings"
            {...StringAvatar(userContext.currentUser.displayName, false, true)}
            onClick={handleClick}
          />
        </Tooltip>
      );
    }
  }

  return (
    <Grid item xs={12}>
      {GetUserIcon()}
    </Grid>
  );
}

export default ADSUserAvatar;
