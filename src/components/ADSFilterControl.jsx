//#region header */
/**************************************************************************************************
//
//  Description: Filter Control
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   12.07.21 Sean Flook         WI39??? Initial Revision.
//    002   06.10.23 Sean Flook                 Use colour variables.
//    003   24.11.23 Sean Flook                 Moved Box to @mui/system.
//    004   05.01.24 Sean Flook                 Changes to sort out warnings and use CSS shortcuts.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

/* #region imports */

import React, { useContext, useState } from "react";
import PropTypes from "prop-types";

import FilterContext from "../context/filterContext";

import { HasASD, HasProperties } from "../configuration/ADSConfig";

import { AppBar, Tabs, Tab, Typography, Button, Badge } from "@mui/material";
import { Box } from "@mui/system";

import FilterLocationTab from "../tabs/FilterLocationTab";
import FilterPropertiesTab from "../tabs/FilterPropertiesTab";
import FilterStreetsTab from "../tabs/FilterStreetsTab";
import FilterASDTab from "../tabs/FilterASDTab";
import FilterScopeTab from "../tabs/FilterScopeTab";

import SearchIcon from "@mui/icons-material/Search";
import RestoreIcon from "@mui/icons-material/SettingsBackupRestore";
import CancelIcon from "@mui/icons-material/Close";

import { adsBlueA, adsWhite, adsLightGreyB, adsLightBlue } from "../utils/ADSColours";
import { useTheme } from "@mui/styles";
import { grey } from "@mui/material/colors";

/* #endregion imports */

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </Box>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
}

ADSFilterControl.propTypes = {
  searchButton: PropTypes.string.isRequired,
  onFilter: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

function ADSFilterControl({ searchButton, onFilter, onCancel }) {
  const theme = useTheme();

  const searchFilterContext = useContext(FilterContext);

  const [value, setValue] = useState(0);
  const [resetLabel, setResetLabel] = useState("Reset location filters");
  const [locationChanged, setLocationChanged] = useState(false);
  const [propertyChanged, setPropertyChanged] = useState(false);
  const [streetChanged, setStreetChanged] = useState(false);
  const [asdChanged, setASDChanged] = useState(false);
  const [scopeChanged, setScopeChanged] = useState(false);
  const [locationFilter, setLocationFilter] = useState();
  const [propertyFilter, setPropertyFilter] = useState();
  const [streetFilter, setStreetFilter] = useState();
  const [asdFilter, setASDFilter] = useState();
  const [scopeFilter, setScopeFilter] = useState();

  /**
   * Event to handle when the tab is changed.
   *
   * @param {object} event The event object.
   * @param {number} newValue The index of the new tab.
   */
  const handleTabChange = (event, newValue) => {
    setValue(newValue);

    switch (newValue) {
      case 1:
        setResetLabel("Reset property filters");
        break;

      case 2:
        setResetLabel("Reset street filters");
        break;

      case 3:
        setResetLabel("Reset ASD filters");
        break;

      case 4:
        setResetLabel("Reset scope filters");
        break;

      default:
        setResetLabel("Reset location filters");
        break;
    }
  };

  /**
   * Event to handle when the search button is clicked.
   */
  const handleSearchClick = () => {
    if (onFilter) onFilter();
  };

  /**
   * Event to handle when the restore button is clicked.
   */
  const handleRestoreClick = () => {};

  /**
   * Event to handle when the cancel button is clicked.
   */
  const handleCancelClick = () => {
    if (onCancel) onCancel();
  };

  /**
   * Event to handle when the location filter data has changed.
   *
   * @param {object|null} filterData The location filter data.
   * @param {boolean} filterChanged True if the filter data has changed; otherwise false.
   */
  const handleLocationChange = (filterData, filterChanged) => {
    setLocationChanged(filterChanged);
    setLocationFilter(filterData);

    searchFilterContext.onSearchFilterChange({
      location: filterData,
      property: propertyFilter,
      street: streetFilter,
      asd: asdFilter,
      scope: scopeFilter,
    });
  };

  /**
   * Event to handle when the property filter data has changed.
   *
   * @param {object|null} filterData The property filter data.
   * @param {boolean} filterChanged True if the filter data has changed; otherwise false.
   */
  const handlePropertyChange = (filterData, filterChanged) => {
    setPropertyChanged(filterChanged);
    setPropertyFilter(filterData);

    searchFilterContext.onSearchFilterChange({
      location: locationFilter,
      property: filterData,
      street: streetFilter,
      asd: asdFilter,
      scope: scopeFilter,
    });
  };

  /**
   * Event to handle when the street filter data has changed.
   *
   * @param {object|null} filterData The street filter data.
   * @param {boolean} filterChanged True if the filter data has changed; otherwise false.
   */
  const handleStreetChange = (filterData, filterChanged) => {
    setStreetChanged(filterChanged);
    setStreetFilter(filterData);

    searchFilterContext.onSearchFilterChange({
      location: locationFilter,
      property: propertyFilter,
      street: filterData,
      asd: asdFilter,
      scope: scopeFilter,
    });
  };

  /**
   * Event to handle when the ASD filter data has changed.
   *
   * @param {object|null} filterData The ASD filter data.
   * @param {boolean} filterChanged True if the filter data has changed; otherwise false.
   */
  const handleASDChange = (filterData, filterChanged) => {
    setASDChanged(filterChanged);
    setASDFilter(filterData);

    searchFilterContext.onSearchFilterChange({
      location: locationFilter,
      property: propertyFilter,
      street: streetFilter,
      asd: filterData,
      scope: scopeFilter,
    });
  };

  /**
   * Event to handle when the scope filter data has changed.
   *
   * @param {object|null} filterData The scope filter data.
   * @param {boolean} filterChanged True if the filter data has changed; otherwise false.
   */
  const handleScopeChange = (filterData, filterChanged) => {
    setScopeChanged(filterChanged);
    setScopeFilter(filterData);

    searchFilterContext.onSearchFilterChange({
      location: locationFilter,
      property: propertyFilter,
      street: streetFilter,
      asd: asdFilter,
      scope: filterData,
    });
  };

  /**
   * Method to get the styling to use.
   *
   * @param {boolean} isActive True if the item is active; otherwise false.
   * @returns {object|null} The styling to use.
   */
  const getStyle = (isActive) => {
    return isActive ? { color: adsBlueA } : null;
  };

  /**
   * Get the actual index number of the tab.
   *
   * @param {number} nominalIndex The nominal index.
   * @returns {number} The actual index.
   */
  const getIndexNumber = (nominalIndex) => {
    switch (nominalIndex) {
      case 2: // Street
        if (HasProperties()) return 2;
        else return 1;

      case 3: // ASD
        if (HasProperties()) return 3;
        else return 2;

      case 4: // Scope
        if (HasProperties() && HasASD()) return 4;
        else if (HasASD()) return 3;
        else return 2;

      default:
        return nominalIndex;
    }
  };

  return (
    <Box
      sx={{
        width: "40ch",
        mt: theme.spacing(2.5),
        pb: theme.spacing(7),
        borderWidth: "1px",
        borderColor: adsLightGreyB,
        backgroundColor: grey[200],
      }}
    >
      <AppBar position="static" color="default">
        <Tabs
          value={value}
          onChange={handleTabChange}
          TabIndicatorProps={{ style: { background: adsBlueA } }}
          textColor="primary"
          variant="fullWidth"
          selectionFollowsFocus
          aria-label="filter-tabs"
        >
          <Tab
            sx={{ textTransform: "none" }}
            label={
              <Badge color="secondary" variant="dot" invisible={!locationChanged}>
                <Typography variant="subtitle2">Location</Typography>
              </Badge>
            }
            style={getStyle(value === 0)}
            {...a11yProps(0)}
          />
          {HasProperties() && (
            <Tab
              sx={{ textTransform: "none" }}
              label={
                <Badge color="secondary" variant="dot" invisible={!propertyChanged}>
                  <Typography variant="subtitle2">Properties</Typography>
                </Badge>
              }
              style={getStyle(value === 1)}
              {...a11yProps(1)}
            />
          )}
          <Tab
            sx={{ textTransform: "none" }}
            label={
              <Badge color="secondary" variant="dot" invisible={!streetChanged}>
                <Typography variant="subtitle2">Streets</Typography>
              </Badge>
            }
            style={getStyle(value === 2)}
            {...a11yProps(2)}
          />
          {HasASD() && (
            <Tab
              sx={{ textTransform: "none" }}
              label={
                <Badge color="secondary" variant="dot" invisible={!asdChanged}>
                  <Typography variant="subtitle2">ASD</Typography>
                </Badge>
              }
              style={getStyle(value === 3)}
              {...a11yProps(3)}
            />
          )}
          <Tab
            sx={{ textTransform: "none" }}
            label={
              <Badge color="secondary" variant="dot" invisible={!scopeChanged}>
                <Typography variant="subtitle2">Scope</Typography>
              </Badge>
            }
            style={getStyle(value === 4)}
            {...a11yProps(4)}
          />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        <FilterLocationTab onSearchClick={handleSearchClick} onChange={handleLocationChange} />
      </TabPanel>
      {HasProperties() && (
        <TabPanel value={value} index={1}>
          <FilterPropertiesTab onSearchClick={handleSearchClick} onChange={handlePropertyChange} />
        </TabPanel>
      )}
      <TabPanel value={value} index={getIndexNumber(2)}>
        <FilterStreetsTab onSearchClick={handleSearchClick} onChange={(filterData) => handleStreetChange(filterData)} />
      </TabPanel>
      {HasASD() && (
        <TabPanel value={value} index={getIndexNumber(3)}>
          <FilterASDTab onSearchClick={handleSearchClick} onChange={(filterData) => handleASDChange(filterData)} />
        </TabPanel>
      )}
      <TabPanel value={value} index={getIndexNumber(4)}>
        <FilterScopeTab onSearchClick={handleSearchClick} onChange={(filterData) => handleScopeChange(filterData)} />
      </TabPanel>
      <AppBar
        position="static"
        color="default"
        sx={{
          mt: theme.spacing(1),
          top: "auto",
          bottom: 0,
        }}
      >
        <Box
          sx={{
            ml: "auto",
            mr: theme.spacing(1),
          }}
        >
          <Button
            variant="contained"
            sx={{
              ml: theme.spacing(1),
              color: adsWhite,
              backgroundColor: adsBlueA,
              "&:hover": {
                backgroundColor: adsLightBlue,
                color: adsWhite,
              },
            }}
            startIcon={<SearchIcon />}
            onClick={handleSearchClick}
          >
            <Typography variant="body2">{searchButton}</Typography>
          </Button>
          <Button
            sx={{
              ml: theme.spacing(1),
              color: adsBlueA,
              "&:hover": {
                backgroundColor: adsLightBlue,
                color: adsWhite,
              },
            }}
            startIcon={<RestoreIcon />}
            onClick={handleRestoreClick}
          >
            <Typography variant="body2">{resetLabel}</Typography>
          </Button>
          <Button
            sx={{
              ml: theme.spacing(1),
              color: adsBlueA,
              "&:hover": {
                backgroundColor: adsLightBlue,
                color: adsWhite,
              },
            }}
            startIcon={<CancelIcon />}
            onClick={handleCancelClick}
          >
            <Typography variant="body2">Cancel</Typography>
          </Button>
        </Box>
      </AppBar>
    </Box>
  );
}

export default ADSFilterControl;
