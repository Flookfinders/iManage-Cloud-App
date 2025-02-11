//#region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Wizard finalise page
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0
//    001            Sean Flook                 Initial Revision.
//    002   24.11.23 Sean Flook                 Moved Box to @mui/system.
//    003   11.03.24 Sean Flook           GLB12 Adjusted height to remove gap.
//#endregion Version 1.0.0.0
//
//--------------------------------------------------------------------------------------------------
//#endregion header

import React from "react";
import PropTypes from "prop-types";

import { Backdrop, CircularProgress } from "@mui/material";
import { Box } from "@mui/system";
import ADSWizardMap from "../components/ADSWizardMap";

WizardMapPlacementPage.propTypes = {
  data: PropTypes.array.isRequired,
  placeOnMapData: PropTypes.object.isRequired,
  isChild: PropTypes.bool,
  isRange: PropTypes.bool,
  creating: PropTypes.bool,
  onPlaceOnMapDataChange: PropTypes.func.isRequired,
};

WizardMapPlacementPage.defaultProps = {
  isChild: false,
  isRange: false,
  creating: false,
};

function WizardMapPlacementPage({ data, placeOnMapData, isChild, isRange, creating, onPlaceOnMapDataChange }) {
  /**
   * Event to handle when the place on map data changes.
   *
   * @param {object} placeOnMapData The place on map data.
   */
  const handlePlaceOnMapDataChange = (placeOnMapData) => {
    if (onPlaceOnMapDataChange) onPlaceOnMapDataChange(placeOnMapData);
  };

  return (
    <Box id="wizard-map-placement-page" sx={{ width: "100%" }}>
      <ADSWizardMap
        data={data}
        placeOnMapData={placeOnMapData}
        isChild={isChild}
        isRange={isRange}
        displayPlaceOnMap
        onPlaceOnMapDataChange={handlePlaceOnMapDataChange}
      />
      {creating && (
        <Backdrop open={creating}>
          <CircularProgress color="inherit" />
        </Backdrop>
      )}
    </Box>
  );
}

export default WizardMapPlacementPage;
