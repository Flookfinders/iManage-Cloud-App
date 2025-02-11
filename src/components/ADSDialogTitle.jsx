//region header
//--------------------------------------------------------------------------------------------------
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
//region Version 1.0.0.0
//    001   27.03.24 Sean Flook                 Initial version.
//    002   24.06.24 Sean Flook       IMANN-170 Changes required for cascading parent PAO changes to children.
//endregion Version 1.0.0.0
//
//--------------------------------------------------------------------------------------------------
//endregion header

import React from "react";
import PropTypes from "prop-types";

import { DialogTitle, IconButton, Tooltip, Typography } from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import { adsMidGreyA } from "../utils/ADSColours";
import { dialogTitleStyle, dialogTitleTextStyle, tooltipStyle } from "../utils/ADSStyles";

ADSDialogTitle.propTypes = {
  title: PropTypes.string.isRequired,
  closeTooltip: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

function ADSDialogTitle({ title, closeTooltip, onClose }) {
  const handleCancelClick = () => {
    if (onClose) onClose();
  };

  return (
    <DialogTitle id={`ads-dialog-title-${title ? title.toLowerCase().replaceAll(" ", "-") : ""}`} sx={dialogTitleStyle}>
      <Typography sx={dialogTitleTextStyle}>{`${title}`}</Typography>
      {closeTooltip && closeTooltip.length > 0 && (
        <Tooltip title={`${closeTooltip}`} sx={tooltipStyle}>
          <IconButton
            aria-label="close"
            onClick={handleCancelClick}
            sx={{ position: "absolute", right: 12, top: 12, color: adsMidGreyA }}
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
      )}
    </DialogTitle>
  );
}

export default ADSDialogTitle;
