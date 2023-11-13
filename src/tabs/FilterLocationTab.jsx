//#region header */
/**************************************************************************************************
//
//  Description: Location filter tab
//
//  Copyright:    © 2021 - 2023 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   07.07.21 Sean Flook         WI39??? Initial Revision.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

/* #region imports */

import React, { useState, useContext } from "react";
import LookupContext from "../context/lookupContext";
import SettingsContext from "../context/settingsContext";
import { Grid } from "@mui/material";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSCoordinateControl from "../components/ADSCoordinateControl";

/* #endregion imports */

function FilterLocationTab(props) {
  const onChange = props.onChange;
  // const onSearchClick = props.onSearchClick;

  const lookupsContext = useContext(LookupContext);
  const settingsContext = useContext(SettingsContext);

  const [locality, setLocality] = useState();
  const [town, setTown] = useState();
  const [postcode, setPostcode] = useState();
  const [ward, setWard] = useState();
  const [parish, setParish] = useState();
  const [east, setEast] = useState();
  const [north, setNorth] = useState();

  /**
   * Event to handle when the locality is changed.
   *
   * @param {number} newValue The new locality reference.
   */
  const handleLocalityChange = (newValue) => {
    setLocality(newValue);
    if (onChange) {
      onChange(
        {
          locality: newValue,
          town: town,
          postcode: postcode,
          ward: ward,
          parish: parish,
          east: east,
          north: north,
        },
        (newValue && newValue.length > 0) ||
          (town && town.length > 0) ||
          (postcode && postcode.length > 0) ||
          (ward && ward.length > 0) ||
          (parish && parish.length > 0) ||
          (east && east.length > 0) ||
          (north && north.length > 0)
      );
    }
  };

  /**
   * Event to handle when the town is changed.
   *
   * @param {number} newValue The new town reference.
   */
  const handleTownChange = (newValue) => {
    setTown(newValue);
    if (onChange) {
      onChange(
        {
          locality: locality,
          town: newValue,
          postcode: postcode,
          ward: ward,
          parish: parish,
          east: east,
          north: north,
        },
        (locality && locality.length > 0) ||
          (newValue && newValue.length > 0) ||
          (postcode && postcode.length > 0) ||
          (ward && ward.length > 0) ||
          (parish && parish.length > 0) ||
          (east && east.length > 0) ||
          (north && north.length > 0)
      );
    }
  };

  /**
   * Event to handle when the postcode is changed.
   *
   * @param {number} newValue The new postcode reference.
   */
  const handlePostcodeChange = (newValue) => {
    setPostcode(newValue);
    onChange(
      {
        locality: locality,
        town: town,
        postcode: newValue,
        ward: ward,
        parish: parish,
        east: east,
        north: north,
      },
      (locality && locality.length > 0) ||
        (town && town.length > 0) ||
        (newValue && newValue.length > 0) ||
        (ward && ward.length > 0) ||
        (parish && parish.length > 0) ||
        (east && east.length > 0) ||
        (north && north.length > 0)
    );
  };

  /**
   * Event to handle when the ward is changed.
   *
   * @param {string} newValue The new ward code.
   */
  const handleWardChange = (newValue) => {
    setWard(newValue);
    onChange(
      {
        locality: locality,
        town: town,
        postcode: postcode,
        ward: newValue,
        parish: parish,
        east: east,
        north: north,
      },
      (locality && locality.length > 0) ||
        (town && town.length > 0) ||
        (postcode && postcode.length > 0) ||
        (newValue && newValue.length > 0) ||
        (parish && parish.length > 0) ||
        (east && east.length > 0) ||
        (north && north.length > 0)
    );
  };

  /**
   * Event to handle when the parish is changed.
   *
   * @param {string} newValue The new parish code.
   */
  const handleParishChange = (newValue) => {
    setParish(newValue);
    onChange(
      {
        locality: locality,
        town: town,
        postcode: postcode,
        ward: ward,
        parish: newValue,
        east: east,
        north: north,
      },
      (locality && locality.length > 0) ||
        (town && town.length > 0) ||
        (postcode && postcode.length > 0) ||
        (ward && ward.length > 0) ||
        (newValue && newValue.length > 0) ||
        (east && east.length > 0) ||
        (north && north.length > 0)
    );
  };

  /**
   * Event to handle when the easting is changed.
   *
   * @param {number} newValue The new easting.
   */
  const handleEastChange = (newValue) => {
    setEast(newValue);
    onChange(
      {
        locality: locality,
        town: town,
        postcode: postcode,
        ward: ward,
        parish: parish,
        east: newValue,
        north: north,
      },
      (locality && locality.length > 0) ||
        (town && town.length > 0) ||
        (postcode && postcode.length > 0) ||
        (ward && ward.length > 0) ||
        (parish && parish.length > 0) ||
        (newValue && newValue.length > 0) ||
        (north && north.length > 0)
    );
  };

  /**
   * Event to handle when the northing is changed.
   *
   * @param {number} newValue The new northing.
   */
  const handleNorthChange = (newValue) => {
    setNorth(newValue);
    onChange(
      {
        locality: locality,
        town: town,
        postcode: postcode,
        ward: ward,
        parish: parish,
        east: east,
        north: newValue,
      },
      (locality && locality.length > 0) ||
        (town && town.length > 0) ||
        (postcode && postcode.length > 0) ||
        (ward && ward.length > 0) ||
        (parish && parish.length > 0) ||
        (east && east.length > 0) ||
        (newValue && newValue.length > 0)
    );
  };

  return (
    <Grid container direction="row" justifyContent="center" alignItems="center">
      <ADSSelectControl
        label="Locality"
        isEditable
        includeHistoric
        lookupData={lookupsContext.currentLookups.localities.filter((x) =>
          x.language === settingsContext.authorityDetails.displayLanguage
            ? settingsContext.authorityDetails.displayLanguage
            : "ENG"
        )}
        lookupId={"locRef"}
        lookupLabel={"loc"}
        lookupHistoric={"historic"}
        value={locality}
        onChange={handleLocalityChange}
      />
      <ADSSelectControl
        label="Town"
        isEditable
        includeHistoric
        lookupData={lookupsContext.currentLookups.towns.filter((x) =>
          x.language === settingsContext.authorityDetails.displayLanguage
            ? settingsContext.authorityDetails.displayLanguage
            : "ENG"
        )}
        lookupId={"townRef"}
        lookupLabel={"town"}
        lookupHistoric={"historic"}
        value={town}
        onChange={handleTownChange}
      />
      <ADSSelectControl
        label="Postcode"
        isEditable
        includeHistoric
        doNotSetTitleCase
        lookupData={lookupsContext.currentLookups.postcodes}
        lookupId={"postcodeRef"}
        lookupLabel={"postcode"}
        lookupHistoric={"historic"}
        value={postcode}
        onChange={handlePostcodeChange}
      />
      <ADSSelectControl
        label="Ward"
        isEditable
        includeHistoric
        lookupData={lookupsContext.currentLookups.wards}
        lookupId={"wardCode"}
        lookupLabel={"ward"}
        lookupHistoric={"historic"}
        value={ward}
        onChange={handleWardChange}
      />
      <ADSSelectControl
        label="Parish"
        isEditable
        includeHistoric
        lookupData={lookupsContext.currentLookups.parishes}
        lookupId={"parishCode"}
        lookupLabel={"parish"}
        lookupHistoric={"historic"}
        value={parish}
        onChange={handleParishChange}
      />
      <ADSCoordinateControl
        label="Grid reference"
        isEditable
        eastValue={east}
        northValue={north}
        eastLabel={"E"}
        northLabel={"N"}
        onEastChange={handleEastChange}
        onNorthChange={handleNorthChange}
      />
    </Grid>
  );
}

export default FilterLocationTab;
