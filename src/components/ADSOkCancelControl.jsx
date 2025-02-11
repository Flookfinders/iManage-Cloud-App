//#region header
//--------------------------------------------------------------------------------------------------
//
//  Description: OK Cancel component
//
//  Copyright:    � 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//#region Version 1.0.0.0
//    001   02.07.21 Sean Flook                  Initial Revision.
//    002   06.10.23 Sean Flook                  Use colour variables.
//#endregion Version 1.0.0.0
//#region Version 1.0.5.0
//    003   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//#endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//#endregion header

import React from "react";
import PropTypes from "prop-types";
import { Grid2, Typography, Button } from "@mui/material";
import { Check as CheckIcon, Close as CloseIcon } from "@mui/icons-material";
import { adsBlueA, adsLightBlue10 } from "../utils/ADSColours";
import { FormRowStyle } from "../utils/ADSStyles";

ADSOkCancelControl.propTypes = {
  okLabel: PropTypes.string.isRequired,
  cancelLabel: PropTypes.string.isRequired,
  okDisabled: PropTypes.bool.isRequired,
  cancelDisabled: PropTypes.bool.isRequired,
  indented: PropTypes.bool,
  onOkClicked: PropTypes.func.isRequired,
  onCancelClicked: PropTypes.func.isRequired,
};

ADSOkCancelControl.defaultProps = {
  okLabel: "OK",
  cancelLabel: "Cancel",
  okDisabled: false,
  cancelDisabled: false,
  indented: true,
};

function ADSOkCancelControl({
  okLabel,
  cancelLabel,
  okDisabled,
  cancelDisabled,
  indented,
  onOkClicked,
  onCancelClicked,
}) {
  /**
   * Event to handle when the OK button is clicked.
   */
  const handleOkClicked = () => {
    if (onOkClicked) onOkClicked();
  };

  /**
   * Event to handle when the cancel button is clicked.
   */
  const handleCancelClicked = () => {
    if (onCancelClicked) onCancelClicked();
  };

  return (
    <Grid2 container justifyContent="flex-start" alignItems="center" sx={FormRowStyle()}>
      {indented && (
        <Grid2 size={3}>
          <Typography variant="body2" align="left">
            {""}
          </Typography>
        </Grid2>
      )}
      <Grid2 size={indented ? 9 : 12}>
        <Grid2 container justifyContent="flex-start" alignItems="center" spacing={2}>
          <Grid2>
            <Button
              id={`${okLabel.toLowerCase().replaceAll(" ", "-")}-button`}
              sx={{ mt: "6px" }}
              variant="contained"
              color="primary"
              startIcon={<CheckIcon />}
              disabled={okDisabled}
              onClick={handleOkClicked}
            >
              {okLabel}
            </Button>
          </Grid2>
          <Grid2>
            <Button
              id={`${cancelLabel.toLowerCase().replaceAll(" ", "-")}-button`}
              sx={{
                mt: "6px",
                color: adsBlueA,
                "&:hover": {
                  backgroundColor: adsLightBlue10,
                },
              }}
              variant="text"
              startIcon={<CloseIcon />}
              disabled={cancelDisabled}
              onClick={handleCancelClicked}
            >
              {cancelLabel}
            </Button>
          </Grid2>
        </Grid2>
      </Grid2>
    </Grid2>
  );
}

export default ADSOkCancelControl;
