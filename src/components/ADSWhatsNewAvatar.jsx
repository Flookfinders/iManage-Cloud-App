/* #region header */
/**************************************************************************************************
//
//  Description: Whats New Avatar component
//
//  Copyright:    © 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//#region Version 1.0.0.0 changes
//    001   06.07.21 Sean Flook                  Initial Revision.
//    002   05.01.24 Sean Flook                  Changes to sort out warnings.
//#endregion Version 1.0.0.0 changes
//#region Version 1.0.4.0 changes
//    003   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//#endregion Version 1.0.4.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */

import React from "react";
import { Tooltip, Grid2, Badge, SvgIcon, IconButton } from "@mui/material";
import { ActionIconStyle, tooltipStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

/* #endregion imports */

function ADSWhatsNewAvatar(props) {
  const theme = useTheme();
  const whatsNewCount = props.count;

  /**
   * Method to get the whats new icon.
   *
   * @param {object} props The passed in properties.
   * @returns {JSX.Element} The whats new icon.
   */
  function WhatsNewIcon(props) {
    return (
      <SvgIcon {...props}>
        <g>
          <path d="M2.028,19C2.028,19 1.778,13.5 2.774,11.666C3.359,10.59 5.061,9.514 6.366,8.809C6.406,8.707 6.45,8.604 6.5,8.5C6.838,7.792 7.598,6.538 8,6C8.998,4.663 10.656,1.978 11.989,1.978C13.322,1.978 14.998,4.663 16,6C16.403,6.538 17.163,7.792 17.5,8.5C17.553,8.611 17.6,8.715 17.642,8.813C18.946,9.518 20.642,10.592 21.226,11.666C22.222,13.5 21.972,19 21.972,19L2.028,19ZM11.991,4.182C11.802,4.354 11.56,4.584 11.399,4.776C10.719,5.583 10.083,6.553 9.603,7.196C9.255,7.662 8.598,8.748 8.305,9.361C8.277,9.421 8.251,9.481 8.228,9.54C8.055,9.979 7.732,10.344 7.317,10.568C6.333,11.1 4.973,11.81 4.532,12.621C4.23,13.176 4.148,14.186 4.076,15.184C4.03,15.813 4.01,16.442 4.004,17L19.996,17C19.99,16.442 19.97,15.813 19.924,15.184C19.852,14.186 19.77,13.176 19.468,12.621C19.028,11.812 17.673,11.104 16.69,10.572C16.293,10.357 15.98,10.014 15.802,9.598C15.77,9.523 15.735,9.444 15.694,9.36C15.403,8.748 14.748,7.664 14.399,7.199C13.918,6.556 13.277,5.587 12.593,4.781C12.43,4.588 12.183,4.355 11.991,4.182Z" />
          <path d="M10,22L10,19.502L8,19.502L8,22L10,22ZM16,22L16,19.502L14,19.502L14,22L16,22ZM13,22L13,19.502L11,19.502L11,22L13,22ZM18,9L16,9L16,17L18,17L18,9ZM8,9L6,9L6,17L8,17L8,9Z" />
          <g transform="matrix(1,0,0,1,0.000499268,-0.258001)">
            <path d="M11.999,13.462C11.541,13.462 11.169,13.089 11.169,12.631C11.169,12.173 11.541,11.8 11.999,11.8C12.457,11.8 12.83,12.173 12.83,12.631C12.83,13.089 12.457,13.462 11.999,13.462ZM11.999,9.674C10.369,9.674 9.043,11 9.043,12.631C9.043,14.261 10.369,15.588 11.999,15.588C13.629,15.588 14.956,14.261 14.956,12.631C14.956,11 13.629,9.674 11.999,9.674Z" />
          </g>
        </g>
      </SvgIcon>
    );
  }

  /**
   * Method to get the styling for the whats new avatar.
   * @returns {object} The styling for the whats new avatar.
   */
  function getWhatsNewStyle() {
    if (whatsNewCount > 0) return ActionIconStyle();
    else
      return {
        color: theme.palette.text.disabled,
      };
  }

  /**
   * Event to handle when the avatar is clicked.
   */
  const handleClick = () => {
    props.handleClick();
  };

  return (
    <Grid2 size={12}>
      <Tooltip title="What is new" arrow placement="right" sx={tooltipStyle}>
        <span>
          <IconButton aria-label="profile" onClick={handleClick} disabled={whatsNewCount === 0} size="large">
            <Badge badgeContent={whatsNewCount} color="error">
              <WhatsNewIcon fontSize="large" sx={getWhatsNewStyle()} />
            </Badge>
          </IconButton>
        </span>
      </Tooltip>
    </Grid2>
  );
}

export default ADSWhatsNewAvatar;
