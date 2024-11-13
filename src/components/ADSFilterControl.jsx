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
//    005   20.06.24 Sean Flook       IMANN-636 Use the new user rights.
//#endregion Version 1.0.0.0 changes
//#region Version 1.0.2.0 changes
//    006   12.11.24 Sean Flook                 Various required changes.
//#endregion Version 1.0.2.0 changes
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

/* #region imports */

import React, { useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

import FilterContext from "../context/filterContext";
import UserContext from "../context/userContext";
import SettingsContext from "../context/settingsContext";

import { AppBar, Tabs, Tab, Typography, Button, Badge, Toolbar } from "@mui/material";
import { Box, Stack } from "@mui/system";

import FilterLocationTab from "../tabs/FilterLocationTab";
import FilterPropertiesTab from "../tabs/FilterPropertiesTab";
import FilterStreetsTab from "../tabs/FilterStreetsTab";
import FilterASDTab from "../tabs/FilterASDTab";

import SearchIcon from "@mui/icons-material/Search";
import RestoreIcon from "@mui/icons-material/SettingsBackupRestore";
import CancelIcon from "@mui/icons-material/Close";

import { adsBlueA, adsWhite, adsLightGreyB, adsOffWhite } from "../utils/ADSColours";
import { useTheme } from "@mui/styles";
import { blueButtonStyle, tabContainerStyle, tabLabelStyle, tabStyle, whiteButtonStyle } from "../utils/ADSStyles";
import BLPULogicalStatus from "../data/BLPULogicalStatus";
import { GetLookupLabel } from "../utils/HelperUtils";
import BLPUState from "../data/BLPUState";
import RepresentativePointCode from "../data/RepresentativePointCode";
import LPILogicalStatus from "../data/LPILogicalStatus";
import StreetType from "../data/StreetType";
import StreetState from "../data/StreetState";
import HighwayDedicationCode from "../data/HighwayDedicationCode";
import HighwayDedicationIndicator from "../data/HighwayDedicationIndicator";
import ESUDirectionCode from "../data/ESUDirectionCode";
import RoadStatusCode from "../data/RoadStatusCode";
import ReinstatementType from "../data/ReinstatementType";
import SpecialDesignationCode from "../data/SpecialDesignationCode";
import HWWDesignationCode from "../data/HWWDesignationCode";

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
  const userContext = useContext(UserContext);
  const settingsContext = useContext(SettingsContext);

  const [value, setValue] = useState(0);
  const [resetLabel, setResetLabel] = useState("Reset location filters");
  const [locationChanged, setLocationChanged] = useState(false);
  const [locationChanges, setLocationChanges] = useState(null);
  const [propertyChanged, setPropertyChanged] = useState(false);
  const [propertyChanges, setPropertyChanges] = useState(null);
  const [streetChanged, setStreetChanged] = useState(false);
  const [streetChanges, setStreetChanges] = useState(null);
  const [asdChanged, setASDChanged] = useState(false);
  const [asdChanges, setASDChanges] = useState(null);
  const [locationFilter, setLocationFilter] = useState({
    locality: null,
    town: null,
    island: null,
    subLocality: null,
    postcode: null,
    ward: null,
    parish: null,
    east: 0,
    north: 0,
  });
  const [propertyFilter, setPropertyFilter] = useState({
    blpuLogicalStatus: BLPULogicalStatus.filter((x) => x.default).map(
      (a) => a[GetLookupLabel(settingsContext.isScottish)]
    ),
    blpuState: BLPUState.filter((x) => x.default).map((a) => a[GetLookupLabel(settingsContext.isScottish)]),
    rpc: RepresentativePointCode.filter((x) => x.default).map((a) => a[GetLookupLabel(settingsContext.isScottish)]),
    classification: [],
    lpiLogicalStatus: LPILogicalStatus.filter((x) => x.default).map(
      (a) => a[GetLookupLabel(settingsContext.isScottish)]
    ),
    lastUpdated: {},
    startDate: {},
  });
  const [streetFilter, setStreetFilter] = useState({
    streetType: StreetType.filter((x) => x.default).map((a) => a[GetLookupLabel(settingsContext.isScottish)]),
    streetState: StreetState.filter((x) => x.default).map((a) => a[GetLookupLabel(settingsContext.isScottish)]),
    highwayDedicationCode: HighwayDedicationCode.filter((x) => x.default).map(
      (a) => a[GetLookupLabel(settingsContext.isScottish)]
    ),
    highwayDedicationIndicator: HighwayDedicationIndicator.filter((x) => x.default).map(
      (a) => a[GetLookupLabel(settingsContext.isScottish)]
    ),
    directionOfTravel: ESUDirectionCode.filter((x) => x.default).map(
      (a) => a[GetLookupLabel(settingsContext.isScottish)]
    ),
    lastUpdated: {},
    startDate: {},
  });
  const [asdFilter, setASDFilter] = useState({
    streetStatus: RoadStatusCode.filter((x) => x.default).map((a) => a[GetLookupLabel(settingsContext.isScottish)]),
    reinstatementType: ReinstatementType.filter((x) => x.default).map(
      (a) => a[GetLookupLabel(settingsContext.isScottish)]
    ),
    specialDesignationType: SpecialDesignationCode.filter((x) => x.default).map(
      (a) => a[GetLookupLabel(settingsContext.isScottish)]
    ),
    hwwRestriction: HWWDesignationCode.filter((x) => x.default).map(
      (a) => a[GetLookupLabel(settingsContext.isScottish)]
    ),
    lastUpdated: {},
    startDate: {},
  });

  const [hasASD, setHasASD] = useState(false);
  const [hasProperty, setHasProperty] = useState(false);

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

      default:
        setResetLabel("Reset location filters");
        break;
    }
  };

  /**
   * Event to handle when the restore all button is clicked.
   */
  const handleRestoreAllClick = () => {
    setLocationChanged(false);
    setLocationChanges(null);
    setLocationFilter({
      locality: null,
      town: null,
      island: null,
      subLocality: null,
      postcode: null,
      ward: null,
      parish: null,
      east: 0,
      north: 0,
    });

    setPropertyChanged(false);
    setPropertyChanges(null);
    setPropertyFilter({
      blpuLogicalStatus: BLPULogicalStatus.filter((x) => x.default).map(
        (a) => a[GetLookupLabel(settingsContext.isScottish)]
      ),
      blpuState: BLPUState.filter((x) => x.default).map((a) => a[GetLookupLabel(settingsContext.isScottish)]),
      rpc: RepresentativePointCode.filter((x) => x.default).map((a) => a[GetLookupLabel(settingsContext.isScottish)]),
      classification: [],
      lpiLogicalStatus: LPILogicalStatus.filter((x) => x.default).map(
        (a) => a[GetLookupLabel(settingsContext.isScottish)]
      ),
      lastUpdated: {},
      startDate: {},
    });

    setStreetChanged(false);
    setStreetChanges(null);
    setStreetFilter({
      streetType: StreetType.filter((x) => x.default).map((a) => a[GetLookupLabel(settingsContext.isScottish)]),
      streetState: StreetState.filter((x) => x.default).map((a) => a[GetLookupLabel(settingsContext.isScottish)]),
      highwayDedicationCode: HighwayDedicationCode.filter((x) => x.default).map(
        (a) => a[GetLookupLabel(settingsContext.isScottish)]
      ),
      highwayDedicationIndicator: HighwayDedicationIndicator.filter((x) => x.default).map(
        (a) => a[GetLookupLabel(settingsContext.isScottish)]
      ),
      directionOfTravel: ESUDirectionCode.filter((x) => x.default).map(
        (a) => a[GetLookupLabel(settingsContext.isScottish)]
      ),
      lastUpdated: {},
      startDate: {},
    });

    setASDChanged(false);
    setASDChanges(null);
    setASDFilter({
      streetStatus: RoadStatusCode.filter((x) => x.default).map((a) => a[GetLookupLabel(settingsContext.isScottish)]),
      reinstatementType: ReinstatementType.filter((x) => x.default).map(
        (a) => a[GetLookupLabel(settingsContext.isScottish)]
      ),
      specialDesignationType: SpecialDesignationCode.filter((x) => x.default).map(
        (a) => a[GetLookupLabel(settingsContext.isScottish)]
      ),
      hwwRestriction: HWWDesignationCode.filter((x) => x.default).map(
        (a) => a[GetLookupLabel(settingsContext.isScottish)]
      ),
      lastUpdated: {},
      startDate: {},
    });
  };

  /**
   * Event to handle when the search button is clicked.
   */
  const handleSearchClick = () => {
    if (onFilter)
      onFilter({
        location: locationFilter,
        property: propertyFilter,
        street: streetFilter,
        asd: asdFilter,
      });
  };

  /**
   * Event to handle when the restore button is clicked.
   */
  const handleRestoreClick = () => {
    switch (value) {
      case 1:
        setPropertyChanged(false);
        setPropertyChanges(null);
        setPropertyFilter({
          blpuLogicalStatus: BLPULogicalStatus.filter((x) => x.default).map(
            (a) => a[GetLookupLabel(settingsContext.isScottish)]
          ),
          blpuState: BLPUState.filter((x) => x.default).map((a) => a[GetLookupLabel(settingsContext.isScottish)]),
          rpc: RepresentativePointCode.filter((x) => x.default).map(
            (a) => a[GetLookupLabel(settingsContext.isScottish)]
          ),
          classification: [],
          lpiLogicalStatus: LPILogicalStatus.filter((x) => x.default).map(
            (a) => a[GetLookupLabel(settingsContext.isScottish)]
          ),
          lastUpdated: {},
          startDate: {},
        });
        break;

      case 2:
        setStreetChanged(false);
        setStreetChanges(null);
        setStreetFilter({
          streetType: StreetType.filter((x) => x.default).map((a) => a[GetLookupLabel(settingsContext.isScottish)]),
          streetState: StreetState.filter((x) => x.default).map((a) => a[GetLookupLabel(settingsContext.isScottish)]),
          highwayDedicationCode: HighwayDedicationCode.filter((x) => x.default).map(
            (a) => a[GetLookupLabel(settingsContext.isScottish)]
          ),
          highwayDedicationIndicator: HighwayDedicationIndicator.filter((x) => x.default).map(
            (a) => a[GetLookupLabel(settingsContext.isScottish)]
          ),
          directionOfTravel: ESUDirectionCode.filter((x) => x.default).map(
            (a) => a[GetLookupLabel(settingsContext.isScottish)]
          ),
          lastUpdated: {},
          startDate: {},
        });
        break;

      case 3:
        setASDChanged(false);
        setASDChanges(null);
        setASDFilter({
          streetStatus: RoadStatusCode.filter((x) => x.default).map(
            (a) => a[GetLookupLabel(settingsContext.isScottish)]
          ),
          reinstatementType: ReinstatementType.filter((x) => x.default).map(
            (a) => a[GetLookupLabel(settingsContext.isScottish)]
          ),
          specialDesignationType: SpecialDesignationCode.filter((x) => x.default).map(
            (a) => a[GetLookupLabel(settingsContext.isScottish)]
          ),
          hwwRestriction: HWWDesignationCode.filter((x) => x.default).map(
            (a) => a[GetLookupLabel(settingsContext.isScottish)]
          ),
          lastUpdated: {},
          startDate: {},
        });
        break;

      case 4:
        break;

      default:
        setLocationChanged(false);
        setLocationChanges(null);
        setLocationFilter({
          locality: null,
          town: null,
          island: null,
          subLocality: null,
          postcode: null,
          ward: null,
          parish: null,
          east: 0,
          north: 0,
        });
        break;
    }
  };

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
    setLocationChanged(
      filterChanged &&
        (filterChanged.locality ||
          filterChanged.town ||
          filterChanged.island ||
          filterChanged.subLocality ||
          filterChanged.postcode ||
          filterChanged.ward ||
          filterChanged.parish ||
          filterChanged.east ||
          filterChanged.north)
    );
    setLocationChanges(filterChanged);
    setLocationFilter(filterData);

    searchFilterContext.onSearchFilterChange({
      location: filterData,
      property: propertyFilter,
      street: streetFilter,
      asd: asdFilter,
    });
  };

  /**
   * Event to handle when the property filter data has changed.
   *
   * @param {object|null} filterData The property filter data.
   * @param {boolean} filterChanged True if the filter data has changed; otherwise false.
   */
  const handlePropertyChange = (filterData, filterChanged) => {
    setPropertyChanged(
      filterChanged &&
        (filterChanged.blpuLogicalStatus ||
          filterChanged.blpuState ||
          filterChanged.rpc ||
          filterChanged.classification ||
          filterChanged.lpiLogicalStatus ||
          filterChanged.lastUpdated ||
          filterChanged.startDate)
    );
    setPropertyChanges(filterChanged);
    setPropertyFilter(filterData);

    searchFilterContext.onSearchFilterChange({
      location: locationFilter,
      property: filterData,
      street: streetFilter,
      asd: asdFilter,
    });
  };

  /**
   * Event to handle when the street filter data has changed.
   *
   * @param {object|null} filterData The street filter data.
   * @param {boolean} filterChanged True if the filter data has changed; otherwise false.
   */
  const handleStreetChange = (filterData, filterChanged) => {
    setStreetChanged(
      filterChanged &&
        (filterChanged.streetType ||
          filterChanged.streetState ||
          filterChanged.highwayDedicationCode ||
          filterChanged.highwayDedicationIndicator ||
          filterChanged.directionOfTravel ||
          filterChanged.lastUpdated ||
          filterChanged.startDate)
    );
    setStreetChanges(filterChanged);
    setStreetFilter(filterData);

    searchFilterContext.onSearchFilterChange({
      location: locationFilter,
      property: propertyFilter,
      street: filterData,
      asd: asdFilter,
    });
  };

  /**
   * Event to handle when the ASD filter data has changed.
   *
   * @param {object|null} filterData The ASD filter data.
   * @param {boolean} filterChanged True if the filter data has changed; otherwise false.
   */
  const handleASDChange = (filterData, filterChanged) => {
    setASDChanged(
      filterChanged &&
        (filterChanged.streetStatus ||
          filterChanged.reinstatementType ||
          filterChanged.specialDesignationType ||
          filterChanged.hwwRestriction ||
          filterChanged.lastUpdated ||
          filterChanged.startDate)
    );
    setASDChanges(filterChanged);
    setASDFilter(filterData);

    searchFilterContext.onSearchFilterChange({
      location: locationFilter,
      property: propertyFilter,
      street: streetFilter,
      asd: filterData,
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
        if (hasProperty) return 2;
        else return 1;

      case 3: // ASD
        if (hasProperty) return 3;
        else return 2;

      default:
        return nominalIndex;
    }
  };

  useEffect(() => {
    setHasASD(userContext.currentUser && userContext.currentUser.hasASD);
    setHasProperty(userContext.currentUser && userContext.currentUser.hasProperty);
  }, [userContext]);

  return (
    <Box
      sx={{
        width: "40ch",
        mt: theme.spacing(2.5),
        border: `1px solid ${adsLightGreyB}`,
        backgroundColor: adsOffWhite,
      }}
    >
      <AppBar position="static" color="default" elevation={0}>
        <Tabs
          value={value}
          onChange={handleTabChange}
          TabIndicatorProps={{ style: { background: adsBlueA, height: "2px" } }}
          variant="fullWidth"
          selectionFollowsFocus
          aria-label="filter-tabs"
          sx={tabContainerStyle}
        >
          <Tab
            sx={tabStyle}
            label={
              <Badge color="error" variant="dot" invisible={!locationChanged}>
                <Typography variant="subtitle2" sx={tabLabelStyle(value === 0)}>
                  Location
                </Typography>
              </Badge>
            }
            style={getStyle(value === 0)}
            {...a11yProps(0)}
          />
          {hasProperty && (
            <Tab
              sx={tabStyle}
              label={
                <Badge color="error" variant="dot" invisible={!propertyChanged}>
                  <Typography variant="subtitle2" sx={tabLabelStyle(value === 1)}>
                    Properties
                  </Typography>
                </Badge>
              }
              style={getStyle(value === 1)}
              {...a11yProps(1)}
            />
          )}
          <Tab
            sx={tabStyle}
            label={
              <Badge color="error" variant="dot" invisible={!streetChanged}>
                <Typography variant="subtitle2" sx={tabLabelStyle(value === 2)}>
                  Streets
                </Typography>
              </Badge>
            }
            style={getStyle(value === 2)}
            {...a11yProps(2)}
          />
          {hasASD && (
            <Tab
              sx={tabStyle}
              label={
                <Badge color="error" variant="dot" invisible={!asdChanged}>
                  <Typography variant="subtitle2" sx={tabLabelStyle(value === 3)}>
                    ASD
                  </Typography>
                </Badge>
              }
              style={getStyle(value === 3)}
              {...a11yProps(3)}
            />
          )}
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        <FilterLocationTab
          changedFlags={locationChanges}
          selectedData={locationFilter}
          onChange={handleLocationChange}
        />
      </TabPanel>
      {hasProperty && (
        <TabPanel value={value} index={1}>
          <FilterPropertiesTab
            changedFlags={propertyChanges}
            selectedData={propertyFilter}
            onChange={handlePropertyChange}
          />
        </TabPanel>
      )}
      <TabPanel value={value} index={getIndexNumber(2)}>
        <FilterStreetsTab changedFlags={streetChanges} selectedData={streetFilter} onChange={handleStreetChange} />
      </TabPanel>
      {hasASD && (
        <TabPanel value={value} index={getIndexNumber(3)}>
          <FilterASDTab changedFlags={asdChanges} selectedData={asdFilter} onChange={handleASDChange} />
        </TabPanel>
      )}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          mt: theme.spacing(1),
          mr: theme.spacing(1),
          top: "auto",
          bottom: 0,
          height: 54,
          backgroundColor: `${adsWhite}`,
          borderTop: `1px solid ${adsLightGreyB}`,
        }}
      >
        <Toolbar
          variant="dense"
          disableGutters
          sx={{
            pl: theme.spacing(1),
            pr: theme.spacing(2),
            pt: theme.spacing(0),
            pb: theme.spacing(0),
          }}
        >
          <Button sx={whiteButtonStyle} startIcon={<RestoreIcon />} onClick={handleRestoreAllClick}>
            <Typography variant="body2">Reset all filters</Typography>
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={1}>
            <Button variant="contained" sx={blueButtonStyle} startIcon={<SearchIcon />} onClick={handleSearchClick}>
              <Typography variant="body2">{searchButton}</Typography>
            </Button>
            <Button sx={whiteButtonStyle} startIcon={<RestoreIcon />} onClick={handleRestoreClick}>
              <Typography variant="body2">{resetLabel}</Typography>
            </Button>
            <Button sx={whiteButtonStyle} startIcon={<CancelIcon />} onClick={handleCancelClick}>
              <Typography variant="body2">Cancel</Typography>
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default ADSFilterControl;
