import React from "react";
import PropTypes from "prop-types";

import { Box, Backdrop, CircularProgress } from "@mui/material";
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
    <Box id="wizard-map-placement-page" sx={{ mt: "17px", width: "100%" }}>
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
