/* #region header */
/**************************************************************************************************
//
//  Description: Control used to display information to the user.
//
//  Copyright:    © 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   18.01.24 Sean Flook                 Initial Revision.
//    002   09.02.24 Sean Flook                 Updated message for assignESUList.
//    003   13.02.24 Sean Flook                 Added inexactASD variant.
//    017   16.02.24 Sean Flook        ESU26_GP Added selectESUs variant.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React from "react";
import PropTypes from "prop-types";

import { Typography, Button } from "@mui/material";
import { Box, Stack } from "@mui/system";

import CloseIcon from "@mui/icons-material/Close";

import { adsLightGreyA50, adsPaleBlueA, adsBlueA, adsLightBlue10 } from "../utils/ADSColours";

ADSInformationControl.propTypes = {
  variant: PropTypes.oneOf([
    "selectESUs",
    "createESU",
    "assignESUList",
    "assignESUMap",
    "divideESU",
    "moveBLPU",
    "partRoadASD",
    "inexactASD",
    "unknown",
  ]),
  hasCancel: PropTypes.bool,
  onCancel: PropTypes.func,
};

ADSInformationControl.defaultProps = {
  hasCancel: false,
};

function ADSInformationControl({ variant, hasCancel, onCancel }) {
  /**
   * Event to handle when the cancel button is clicked.
   */
  const handleCancelClicked = () => {
    if (onCancel) onCancel();
  };

  /**
   * Method to get the required title.
   *
   * @returns {string} The string to be displayed as the title.
   */
  const getTitle = () => {
    switch (variant) {
      case "createESU":
        return "Create new ESU";

      case "selectESUs":
        return "Select ESU";

      case "assignESUList":
      case "assignESUMap":
        return "Assign ESU";

      case "divideESU":
        return "Divide ESU";

      case "moveBLPU":
        return "Move BLPU seed point";

      case "partRoadASD":
        return "Create ASD geometry";

      case "inexactASD":
        return "Create PRoW geometry";

      default:
        break;
    }
  };

  /**
   * Method to get the required information.
   *
   * @returns {string} The string to be displayed as the information.
   */
  const getInformation = () => {
    switch (variant) {
      case "createESU":
        return "Use the polyline tool to create ESU geometry, then fill out the form and click OK.";

      case "selectESUs":
        return "Choose ESUs by clicking on them, then choose what you want to do from the toolbar above.";

      case "assignESUList":
        return "Choose ESUs by clicking on them, then choose the Assign option in the toolbar above.";

      case "assignESUMap":
        return "Select an ESU on the map, then click 'Assign to active street' in the feature popup.";

      case "divideESU":
        return "Click the point on the ESU where you want to divide it.";

      case "moveBLPU":
        return "To move a seed point, click and drag it to the desired location. If needed, use the options to add a note or edit the RPC. Click 'Finish & Save' to apply the changes.";

      case "partRoadASD":
      case "inexactASD":
        return "Edit or create new geometry using the drawing tools.";

      default:
        break;
    }
  };

  /**
   * Method to get the styling for the control.
   *
   * @returns {object} The styling for the control.
   */
  const getControlStyle = () => {
    switch (variant) {
      case "moveBLPU":
        return {
          position: "absolute",
          width: "16ch",
          left: "34vw",
          top: "124px",
          boxShadow: `4px 4px 7px ${adsLightGreyA50}`,
          borderRadius: "9px",
          backgroundColor: adsPaleBlueA,
          minHeight: "100px",
          zIndex: 1,
        };

      default:
        return {
          position: "absolute",
          width: "16ch",
          left: "32.75vw",
          top: "4px",
          boxShadow: `4px 4px 7px ${adsLightGreyA50}`,
          borderRadius: "9px",
          backgroundColor: adsPaleBlueA,
          minHeight: "100px",
          zIndex: 1,
        };
    }
  };

  return (
    <Box id="ads-information-control" sx={getControlStyle()}>
      <Stack
        direction="column"
        justifyContent="center"
        alignItems="flex-start"
        spacing={1}
        sx={{ padding: "8px 12px 12px" }}
      >
        <Typography sx={{ fontWeight: 600, fontSize: "14px" }}>{getTitle()}</Typography>
        <Typography sx={{ fontSize: "14px" }}>{getInformation()}</Typography>
        <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={1}>
          {hasCancel && (
            <Button
              id={"information-cancel-button"}
              sx={{
                mt: "6px",
                color: adsBlueA,
                "&:hover": {
                  backgroundColor: adsLightBlue10,
                },
              }}
              variant="text"
              startIcon={<CloseIcon />}
              onClick={handleCancelClicked}
            >
              <Typography sx={{ textTransform: "none", fontSize: "14px" }}>Cancel</Typography>
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}

export default ADSInformationControl;
