/* #region header */
/**************************************************************************************************
//
//  Description: Control used to display a dialog title.
//
//  Copyright:    © 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   27.03.24 Sean Flook                 Initial version.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React from "react";
import PropTypes from "prop-types";

import { DialogTitle, IconButton, Tooltip, Typography } from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import { adsMidGreyA } from "../utils/ADSColours";
import { dialogTitleStyle, dialogTitleTextStyle, tooltipStyle } from "../utils/ADSStyles";

ADSDialogTitle.propTypes = {
  title: PropTypes.string.isRequired,
  closeTooltip: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

function ADSDialogTitle({ title, closeTooltip, onClose }) {
  const handleCancelClick = () => {
    if (onClose) onClose();
  };

  return (
    <DialogTitle id={`ads-dialog-title-${title ? title.toLowerCase().replaceAll(" ", "-") : ""}`} sx={dialogTitleStyle}>
      <Typography sx={dialogTitleTextStyle}>{`${title}`}</Typography>
      <Tooltip title={`${closeTooltip}`} sx={tooltipStyle}>
        <IconButton
          aria-label="close"
          onClick={handleCancelClick}
          sx={{ position: "absolute", right: 12, top: 12, color: adsMidGreyA }}
        >
          <CloseIcon />
        </IconButton>
      </Tooltip>
    </DialogTitle>
  );
}

export default ADSDialogTitle;
