//region header */
//--------------------------------------------------------------------------------------------------
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
//region Version 1.0.0.0
//    001   07.07.21 Sean Flook         WI39??? Initial Revision.
//endregion Version 1.0.0.0
//region Version 1.0.2.0
//    002   12.11.24 Sean Flook                 Various changes to improve the look and functionality.
//endregion Version 1.0.2.0
//
//--------------------------------------------------------------------------------------------------
//endregion header */

//region imports

import React, { useState, useContext, useEffect } from "react";
import PropTypes from "prop-types";

import LookupContext from "../context/lookupContext";
import SettingsContext from "../context/settingsContext";

import { Box } from "@mui/material";

import ADSSelectControl from "../components/ADSSelectControl";
import ADSCoordinateControl from "../components/ADSCoordinateControl";

FilterLocationTab.propTypes = {
  changedFlags: PropTypes.object.isRequired,
  selectedData: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

//endregion imports

function FilterLocationTab({ changedFlags, selectedData, onChange }) {
  const lookupContext = useContext(LookupContext);
  const settingsContext = useContext(SettingsContext);

  const [localityLookup, setLocalityLookup] = useState([]);
  const [townLookup, setTownLookup] = useState([]);
  const [islandLookup, setIslandLookup] = useState([]);
  const [subLocalityLookup, setSubLocalityLookup] = useState([]);
  const [postcodeLookup, setPostcodeLookup] = useState([]);

  const [locality, setLocality] = useState(null);
  const [town, setTown] = useState(null);
  const [island, setIsland] = useState(null);
  const [subLocality, setSubLocality] = useState(null);
  const [postcode, setPostcode] = useState(null);
  const [ward, setWard] = useState(null);
  const [parish, setParish] = useState(null);
  const [east, setEast] = useState(0);
  const [north, setNorth] = useState(0);

  const [localityChanged, setLocalityChanged] = useState(false);
  const [townChanged, setTownChanged] = useState(false);
  const [islandChanged, setIslandChanged] = useState(false);
  const [subLocalityChanged, setSubLocalityChanged] = useState(false);
  const [postcodeChanged, setPostcodeChanged] = useState(false);
  const [wardChanged, setWardChanged] = useState(false);
  const [parishChanged, setParishChanged] = useState(false);
  const [eastChanged, setEastChanged] = useState(false);
  const [northChanged, setNorthChanged] = useState(false);

  /**
   * Event to handle when the locality is changed.
   *
   * @param {number} newValue The new locality reference.
   */
  const handleLocalityChange = (newValue) => {
    // setLocality(newValue);
    if (onChange) {
      onChange(
        {
          locality: newValue,
          town: town,
          island: island,
          subLocality: subLocality,
          postcode: postcode,
          ward: ward,
          parish: parish,
          east: east,
          north: north,
        },
        {
          locality: !!newValue,
          town: townChanged,
          island: islandChanged,
          subLocality: subLocalityChanged,
          postcode: postcodeChanged,
          ward: wardChanged,
          parish: parishChanged,
          east: eastChanged,
          north: northChanged,
        }
      );
    }
  };

  /**
   * Event to handle when the town is changed.
   *
   * @param {number} newValue The new town reference.
   */
  const handleTownChange = (newValue) => {
    // setTown(newValue);
    if (onChange) {
      onChange(
        {
          locality: locality,
          town: newValue,
          island: island,
          subLocality: subLocality,
          postcode: postcode,
          ward: ward,
          parish: parish,
          east: east,
          north: north,
        },
        {
          locality: localityChanged,
          town: !!newValue,
          island: islandChanged,
          subLocality: subLocalityChanged,
          postcode: postcodeChanged,
          ward: wardChanged,
          parish: parishChanged,
          east: eastChanged,
          north: northChanged,
        }
      );
    }
  };

  /**
   * Event to handle when the island is changed.
   *
   * @param {number} newValue The new island reference.
   */
  const handleIslandChange = (newValue) => {
    // setIsland(newValue);
    if (onChange) {
      onChange(
        {
          locality: locality,
          town: town,
          island: newValue,
          subLocality: subLocality,
          postcode: postcode,
          ward: ward,
          parish: parish,
          east: east,
          north: north,
        },
        {
          locality: localityChanged,
          town: townChanged,
          island: !!newValue,
          subLocality: subLocalityChanged,
          postcode: postcodeChanged,
          ward: wardChanged,
          parish: parishChanged,
          east: eastChanged,
          north: northChanged,
        }
      );
    }
  };

  /**
   * Event to handle when the sub-locality is changed.
   *
   * @param {number} newValue The new sub-locality reference.
   */
  const handleSubLocalityChange = (newValue) => {
    // setSubLocality(newValue);
    if (onChange) {
      onChange(
        {
          locality: locality,
          town: town,
          island: island,
          subLocality: newValue,
          postcode: postcode,
          ward: ward,
          parish: parish,
          east: east,
          north: north,
        },
        {
          locality: localityChanged,
          town: townChanged,
          island: islandChanged,
          subLocality: !!newValue,
          postcode: postcodeChanged,
          ward: wardChanged,
          parish: parishChanged,
          east: eastChanged,
          north: northChanged,
        }
      );
    }
  };

  /**
   * Event to handle when the postcode is changed.
   *
   * @param {number} newValue The new postcode reference.
   */
  const handlePostcodeChange = (newValue) => {
    // setPostcode(newValue);
    onChange(
      {
        locality: locality,
        town: town,
        island: island,
        subLocality: subLocality,
        postcode: newValue,
        ward: ward,
        parish: parish,
        east: east,
        north: north,
      },
      {
        locality: localityChanged,
        town: townChanged,
        island: islandChanged,
        subLocality: subLocalityChanged,
        postcode: !!newValue,
        ward: wardChanged,
        parish: parishChanged,
        east: eastChanged,
        north: northChanged,
      }
    );
  };

  /**
   * Event to handle when the ward is changed.
   *
   * @param {string} newValue The new ward code.
   */
  const handleWardChange = (newValue) => {
    // setWard(newValue);
    onChange(
      {
        locality: locality,
        town: town,
        island: island,
        subLocality: subLocality,
        postcode: postcode,
        ward: newValue,
        parish: parish,
        east: east,
        north: north,
      },
      {
        locality: localityChanged,
        town: townChanged,
        island: islandChanged,
        subLocality: subLocalityChanged,
        postcode: postcodeChanged,
        ward: !!newValue,
        parish: parishChanged,
        east: eastChanged,
        north: northChanged,
      }
    );
  };

  /**
   * Event to handle when the parish is changed.
   *
   * @param {string} newValue The new parish code.
   */
  const handleParishChange = (newValue) => {
    // setParish(newValue);
    onChange(
      {
        locality: locality,
        town: town,
        island: island,
        subLocality: subLocality,
        postcode: postcode,
        ward: ward,
        parish: newValue,
        east: east,
        north: north,
      },
      {
        locality: localityChanged,
        town: townChanged,
        island: islandChanged,
        subLocality: subLocalityChanged,
        postcode: postcodeChanged,
        ward: wardChanged,
        parish: !!newValue,
        east: eastChanged,
        north: northChanged,
      }
    );
  };

  /**
   * Event to handle when the easting is changed.
   *
   * @param {number} newValue The new easting.
   */
  const handleEastChange = (newValue) => {
    // setEast(newValue);
    onChange(
      {
        locality: locality,
        town: town,
        island: island,
        subLocality: subLocality,
        postcode: postcode,
        ward: ward,
        parish: parish,
        east: newValue,
        north: north,
      },
      {
        locality: localityChanged,
        town: townChanged,
        island: islandChanged,
        subLocality: subLocalityChanged,
        postcode: postcodeChanged,
        ward: wardChanged,
        parish: parishChanged,
        east: newValue && newValue > 0,
        north: northChanged,
      }
    );
  };

  /**
   * Event to handle when the northing is changed.
   *
   * @param {number} newValue The new northing.
   */
  const handleNorthChange = (newValue) => {
    // setNorth(newValue);
    onChange(
      {
        locality: locality,
        town: town,
        subLocality: subLocality,
        postcode: postcode,
        ward: ward,
        parish: parish,
        east: east,
        north: newValue,
      },
      {
        locality: localityChanged,
        town: townChanged,
        island: islandChanged,
        subLocality: subLocalityChanged,
        postcode: postcodeChanged,
        ward: wardChanged,
        parish: parishChanged,
        east: eastChanged,
        north: newValue && newValue > 0,
      }
    );
  };

  useEffect(() => {
    setLocalityLookup(
      lookupContext.currentLookups.localities
        .filter((x) => x.language === "ENG" && !x.historic)
        .sort(function (a, b) {
          return a.locality.localeCompare(b.locality, undefined, {
            numeric: true,
            sensitivity: "base",
          });
        })
    );
  }, [lookupContext.currentLookups.localities]);

  useEffect(() => {
    setTownLookup(
      lookupContext.currentLookups.towns
        .filter((x) => x.language === "ENG" && !x.historic)
        .sort(function (a, b) {
          return a.town.localeCompare(b.town, undefined, {
            numeric: true,
            sensitivity: "base",
          });
        })
    );
  }, [lookupContext.currentLookups.towns]);

  useEffect(() => {
    setIslandLookup(
      lookupContext.currentLookups.islands
        .filter((x) => x.language === "ENG" && !x.historic)
        .sort(function (a, b) {
          return a.island.localeCompare(b.island, undefined, {
            numeric: true,
            sensitivity: "base",
          });
        })
    );
  }, [lookupContext.currentLookups.islands]);

  useEffect(() => {
    setSubLocalityLookup(
      lookupContext.currentLookups.subLocalities
        .filter((x) => x.language === "ENG" && !x.historic)
        .sort(function (a, b) {
          return a.subLocality.localeCompare(b.subLocality, undefined, {
            numeric: true,
            sensitivity: "base",
          });
        })
    );
  }, [lookupContext.currentLookups.subLocalities]);

  useEffect(() => {
    setPostcodeLookup(
      lookupContext.currentLookups.postcodes
        .filter((x) => !x.historic)
        .sort(function (a, b) {
          return a.postcode.localeCompare(b.postcode, undefined, {
            numeric: true,
            sensitivity: "base",
          });
        })
    );
  }, [lookupContext.currentLookups.postcodes]);

  useEffect(() => {
    if (changedFlags) {
      setLocalityChanged(changedFlags.locality);
      setTownChanged(changedFlags.town);
      setIslandChanged(changedFlags.island);
      setSubLocalityChanged(changedFlags.subLocality);
      setPostcodeChanged(changedFlags.postcode);
      setWardChanged(changedFlags.ward);
      setParishChanged(changedFlags.parish);
      setEastChanged(changedFlags.east);
      setNorthChanged(changedFlags.north);
    } else {
      setLocalityChanged(false);
      setTownChanged(false);
      setIslandChanged(false);
      setSubLocalityChanged(false);
      setPostcodeChanged(false);
      setWardChanged(false);
      setParishChanged(false);
      setEastChanged(false);
      setNorthChanged(false);
    }
  }, [changedFlags]);

  useEffect(() => {
    if (selectedData) {
      setLocality(selectedData.locality);
      setTown(selectedData.town);
      setIsland(selectedData.island);
      setSubLocality(selectedData.subLocality);
      setPostcode(selectedData.postcode);
      setWard(selectedData.ward);
      setParish(selectedData.parish);
      setEast(selectedData.east);
      setNorth(selectedData.north);
    }
  }, [selectedData]);

  return (
    <Box>
      <ADSSelectControl
        label="Locality"
        isEditable
        includeHistoric
        lookupData={localityLookup}
        lookupId={"localityRef"}
        lookupLabel={"locality"}
        lookupHistoric={"historic"}
        indicateChange={localityChanged}
        value={locality}
        onChange={handleLocalityChange}
      />
      <ADSSelectControl
        label="Town"
        isEditable
        includeHistoric
        lookupData={townLookup}
        lookupId={"townRef"}
        lookupLabel={"town"}
        lookupHistoric={"historic"}
        indicateChange={townChanged}
        value={town}
        onChange={handleTownChange}
      />
      {settingsContext.isScottish && (
        <ADSSelectControl
          label="Island"
          isEditable
          useRounded
          lookupData={islandLookup}
          lookupId="islandRef"
          lookupLabel="island"
          lookupHistoric={"historic"}
          indicateChange={islandChanged}
          value={island}
          onChange={handleIslandChange}
        />
      )}
      {settingsContext.isScottish && (
        <ADSSelectControl
          label="Sub-locality"
          isEditable
          useRounded
          lookupData={subLocalityLookup}
          lookupId="subLocalityRef"
          lookupLabel="subLocality"
          lookupHistoric={"historic"}
          indicateChange={subLocalityChanged}
          value={subLocality}
          onChange={handleSubLocalityChange}
        />
      )}
      <ADSSelectControl
        label="Postcode"
        isEditable
        includeHistoric
        doNotSetTitleCase
        lookupData={postcodeLookup}
        lookupId={"postcodeRef"}
        lookupLabel={"postcode"}
        lookupHistoric={"historic"}
        indicateChange={postcodeChanged}
        value={postcode}
        onChange={handlePostcodeChange}
      />
      <ADSSelectControl
        label="Ward"
        isEditable
        includeHistoric
        lookupData={lookupContext.currentLookups.wards}
        lookupId={"wardCode"}
        lookupLabel={"ward"}
        lookupHistoric={"historic"}
        indicateChange={wardChanged}
        value={ward}
        onChange={handleWardChange}
      />
      <ADSSelectControl
        label="Parish"
        isEditable
        includeHistoric
        lookupData={lookupContext.currentLookups.parishes}
        lookupId={"parishCode"}
        lookupLabel={"parish"}
        lookupHistoric={"historic"}
        indicateChange={parishChanged}
        value={parish}
        onChange={handleParishChange}
      />
      <ADSCoordinateControl
        label="Grid reference"
        isEditable
        indicateChange={eastChanged || northChanged}
        eastValue={east}
        northValue={north}
        eastLabel={"E"}
        northLabel={"N"}
        onEastChange={handleEastChange}
        onNorthChange={handleNorthChange}
      />
    </Box>
  );
}

export default FilterLocationTab;
