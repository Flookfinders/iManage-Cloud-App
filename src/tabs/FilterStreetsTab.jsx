/* #region header */
/**************************************************************************************************
//
//  Description: Streets filter tab
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   15.07.21 Sean Flook         WI39??? Initial Revision.
//    002   05.01.24 Sean Flook                 Use CSS shortcuts.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */

import React, { useContext, useState, Fragment } from "react";
import FilterContext from "../context/filterContext";
import SettingsContext from "../context/settingsContext";
import { GetLookupLabel } from "../utils/HelperUtils";
import StreetType from "../data/StreetType";
import StreetState from "../data/StreetState";
import HighwayDedicationCode from "../data/HighwayDedicationCode";
import HighwayDedicationIndicator from "../data/HighwayDedicationIndicator";
import ESUDirectionCode from "../data/ESUDirectionCode";
import { Divider, Grid } from "@mui/material";
import ADSMultipleSelectControl from "../components/ADSMultipleSelectControl";
import ADSFilterDateControl from "../components/ADSFilterDateControl";
import { useTheme } from "@mui/styles";

/* #endregion imports */

function FilterStreetsTab(props) {
  const theme = useTheme();

  const searchFilterContext = useContext(FilterContext);
  const settingsContext = useContext(SettingsContext);

  const onChange = props.onChange;
  // const onSearchClick = props.onSearchClick;

  const [streetType, setStreetType] = useState(
    searchFilterContext.currentSearchFilter &&
      searchFilterContext.currentSearchFilter.street &&
      searchFilterContext.currentSearchFilter.street.streetType
      ? searchFilterContext.currentSearchFilter.street.streetType
      : StreetType.filter((x) => x.default).map((a) => a[GetLookupLabel(settingsContext.isScottish)])
  );
  const [streetState, setStreetState] = useState(
    searchFilterContext.currentSearchFilter &&
      searchFilterContext.currentSearchFilter.street &&
      searchFilterContext.currentSearchFilter.street.streetState
      ? searchFilterContext.currentSearchFilter.street.streetState
      : StreetState.filter((x) => x.default).map((a) => a[GetLookupLabel(settingsContext.isScottish)])
  );
  const [highwayDedicationCode, setHighwayDedicationCode] = useState(
    searchFilterContext.currentSearchFilter &&
      searchFilterContext.currentSearchFilter.street &&
      searchFilterContext.currentSearchFilter.street.highwayDedicationCode
      ? searchFilterContext.currentSearchFilter.street.highwayDedicationCode
      : HighwayDedicationCode.filter((x) => x.default).map((a) => a[GetLookupLabel(settingsContext.isScottish)])
  );
  const [highwayDedicationIndicator, setHighwayDedicationIndicator] = useState(
    searchFilterContext.currentSearchFilter &&
      searchFilterContext.currentSearchFilter.street &&
      searchFilterContext.currentSearchFilter.street.highwayDedicationIndicator
      ? searchFilterContext.currentSearchFilter.street.highwayDedicationIndicator
      : HighwayDedicationIndicator.filter((x) => x.default).map((a) => a[GetLookupLabel(settingsContext.isScottish)])
  );
  const [directionOfTravel, setDirectionOfTravel] = useState(
    searchFilterContext.currentSearchFilter &&
      searchFilterContext.currentSearchFilter.street &&
      searchFilterContext.currentSearchFilter.street.directionOfTravel
      ? searchFilterContext.currentSearchFilter.street.directionOfTravel
      : ESUDirectionCode.filter((x) => x.default).map((a) => a[GetLookupLabel(settingsContext.isScottish)])
  );
  const [lastUpdated, setLastUpdated] = useState(
    searchFilterContext.currentSearchFilter &&
      searchFilterContext.currentSearchFilter.street &&
      searchFilterContext.currentSearchFilter.street.lastUpdated
      ? searchFilterContext.currentSearchFilter.street.lastUpdated
      : {}
  );
  const [startDate, setStartDate] = useState(
    searchFilterContext.currentSearchFilter &&
      searchFilterContext.currentSearchFilter.street &&
      searchFilterContext.currentSearchFilter.street.startDate
      ? searchFilterContext.currentSearchFilter.street.startDate
      : {}
  );

  const [streetTypeChanged, setStreetTypeChanged] = useState(false);
  const [streetStateChanged, setStreetStateChanged] = useState(false);
  const [highwayDedicationCodeChanged, setHighwayDedicationCodeChanged] = useState(false);
  const [highwayDedicationIndicatorChanged, setHighwayDedicationIndicatorChanged] = useState(false);
  const [directionOfTravelChanged, setDirectionOfTravelChanged] = useState(false);
  const [lastUpdatedChanged, setLastUpdatedChanged] = useState(false);
  const [startDateChanged, setStartDateChanged] = useState(false);

  const defaultStreetType = StreetType.filter((x) => x.default)
    .map((a) => a[GetLookupLabel(settingsContext.isScottish)])
    .slice()
    .sort();
  const defaultStreetState = StreetState.filter((x) => x.default)
    .map((a) => a[GetLookupLabel(settingsContext.isScottish)])
    .slice()
    .sort();
  const defaultHighwayDedicationCode = HighwayDedicationCode.filter((x) => x.default)
    .map((a) => a[GetLookupLabel(settingsContext.isScottish)])
    .slice()
    .sort();
  const defaultHighwayDedicationIndicator = HighwayDedicationIndicator.filter((x) => x.default)
    .map((a) => a[GetLookupLabel(settingsContext.isScottish)])
    .slice()
    .sort();
  const defaultDirectionOfTravel = ESUDirectionCode.filter((x) => x.default)
    .map((a) => a[GetLookupLabel(settingsContext.isScottish)])
    .slice()
    .sort();

  /**
   * Event to handle when the list of selected street types are changed.
   *
   * @param {Array} newValue The list of street types.
   */
  const handleStreetTypeChange = (newValue) => {
    const newValueSorted = newValue.slice().sort();
    const filterChanged = !(
      defaultStreetType.length === newValueSorted.length &&
      defaultStreetType.every(function (value, index) {
        return value === newValueSorted[index];
      })
    );

    setStreetType(newValue);
    setStreetTypeChanged(filterChanged);

    if (onChange) {
      onChange(
        {
          streetType: newValue,
          streetState: streetState,
          highwayDedicationCode: highwayDedicationCode,
          highwayDedicationIndicator: highwayDedicationIndicator,
          directionOfTravel: directionOfTravel,
          lastUpdated: lastUpdated,
          startDate: startDate,
        },
        filterChanged ||
          streetStateChanged ||
          highwayDedicationCodeChanged ||
          highwayDedicationIndicatorChanged ||
          directionOfTravelChanged ||
          lastUpdatedChanged ||
          startDateChanged
      );
    }
  };

  /**
   * Event to handle when the list of selected street states are changed.
   *
   * @param {Array} newValue The list of street states.
   */
  const handleStreetStateChange = (newValue) => {
    const newValueSorted = newValue.slice().sort();
    const filterChanged = !(
      defaultStreetState.length === newValueSorted.length &&
      defaultStreetState.every(function (value, index) {
        return value === newValueSorted[index];
      })
    );

    setStreetState(newValue);
    setStreetStateChanged(filterChanged);

    if (onChange) {
      onChange(
        {
          streetType: streetType,
          streetState: newValue,
          highwayDedicationCode: highwayDedicationCode,
          highwayDedicationIndicator: highwayDedicationIndicator,
          directionOfTravel: directionOfTravel,
          lastUpdated: lastUpdated,
          startDate: startDate,
        },
        streetTypeChanged ||
          filterChanged ||
          highwayDedicationCodeChanged ||
          highwayDedicationIndicatorChanged ||
          directionOfTravelChanged ||
          lastUpdatedChanged ||
          startDateChanged
      );
    }
  };

  /**
   * Event to handle when the list of selected highway dedication codes are changed.
   *
   * @param {Array} newValue The list of highway dedication codes.
   */
  const handleHighwayDedicationCodeChange = (newValue) => {
    const newValueSorted = newValue.slice().sort();
    const filterChanged = !(
      defaultHighwayDedicationCode.length === newValueSorted.length &&
      defaultHighwayDedicationCode.every(function (value, index) {
        return value === newValueSorted[index];
      })
    );

    setHighwayDedicationCode(newValue);
    setHighwayDedicationCodeChanged(filterChanged);

    if (onChange) {
      onChange(
        {
          streetType: streetType,
          streetState: streetState,
          highwayDedicationCode: newValue,
          highwayDedicationIndicator: highwayDedicationIndicator,
          directionOfTravel: directionOfTravel,
          lastUpdated: lastUpdated,
          startDate: startDate,
        },
        streetTypeChanged ||
          streetStateChanged ||
          filterChanged ||
          highwayDedicationIndicatorChanged ||
          directionOfTravelChanged ||
          lastUpdatedChanged ||
          startDateChanged
      );
    }
  };

  /**
   * Event to handle when the list of selected highway dedication indicators are changed.
   *
   * @param {Array} newValue The list of highway dedication indicators.
   */
  const handleHighwayDedicationIndicatorChange = (newValue) => {
    const newValueSorted = newValue.slice().sort();
    const filterChanged = !(
      defaultHighwayDedicationIndicator.length === newValueSorted.length &&
      defaultHighwayDedicationIndicator.every(function (value, index) {
        return value === newValueSorted[index];
      })
    );

    setHighwayDedicationIndicator(newValue);
    setHighwayDedicationIndicatorChanged(filterChanged);

    if (onChange) {
      onChange(
        {
          streetType: streetType,
          streetState: streetState,
          highwayDedicationCode: highwayDedicationCode,
          highwayDedicationIndicator: newValue,
          directionOfTravel: directionOfTravel,
          lastUpdated: lastUpdated,
          startDate: startDate,
        },
        streetTypeChanged ||
          streetStateChanged ||
          highwayDedicationCodeChanged ||
          filterChanged ||
          directionOfTravelChanged ||
          lastUpdatedChanged ||
          startDateChanged
      );
    }
  };

  /**
   * Event to handle when the list of selected directions of travel are changed.
   *
   * @param {Array} newValue The list of directions of travel.
   */
  const handleDirectionOfTravelChange = (newValue) => {
    const newValueSorted = newValue.slice().sort();
    const filterChanged = !(
      defaultDirectionOfTravel.length === newValueSorted.length &&
      defaultDirectionOfTravel.every(function (value, index) {
        return value === newValueSorted[index];
      })
    );

    setDirectionOfTravel(newValue);
    setDirectionOfTravelChanged(filterChanged);

    if (onChange) {
      onChange(
        {
          streetType: streetType,
          streetState: streetState,
          highwayDedicationCode: highwayDedicationCode,
          highwayDedicationIndicator: highwayDedicationIndicator,
          directionOfTravel: newValue,
          lastUpdated: lastUpdated,
          startDate: startDate,
        },
        streetTypeChanged ||
          streetStateChanged ||
          highwayDedicationCodeChanged ||
          highwayDedicationIndicatorChanged ||
          filterChanged ||
          lastUpdatedChanged ||
          startDateChanged
      );
    }
  };

  /**
   * Event to handle when the last updated object is changed.
   *
   * @param {object} newValue The last updated object.
   */
  const handleLastUpdatedChange = (newValue) => {
    const filterChanged = newValue && newValue.length > 0;

    setLastUpdated(newValue);
    setLastUpdatedChanged(filterChanged);

    if (onChange) {
      onChange(
        {
          streetType: streetType,
          streetState: streetState,
          highwayDedicationCode: highwayDedicationCode,
          highwayDedicationIndicator: highwayDedicationIndicator,
          directionOfTravel: directionOfTravel,
          lastUpdated: newValue,
          startDate: startDate,
        },
        streetTypeChanged ||
          streetStateChanged ||
          highwayDedicationCodeChanged ||
          highwayDedicationIndicatorChanged ||
          directionOfTravelChanged ||
          filterChanged ||
          startDateChanged
      );
    }
  };

  /**
   * Event to handle when the Start date object is changed.
   *
   * @param {object} newValue The start date object.
   */
  const handleStartDateChange = (newValue) => {
    const filterChanged = newValue && newValue.length > 0;

    setStartDate(newValue);
    setStartDateChanged(filterChanged);

    if (onChange) {
      onChange(
        {
          streetType: streetType,
          streetState: streetState,
          highwayDedicationCode: highwayDedicationCode,
          highwayDedicationIndicator: highwayDedicationIndicator,
          directionOfTravel: directionOfTravel,
          lastUpdated: lastUpdated,
          startDate: newValue,
        },
        streetTypeChanged ||
          streetStateChanged ||
          highwayDedicationCodeChanged ||
          highwayDedicationIndicatorChanged ||
          directionOfTravelChanged ||
          lastUpdatedChanged ||
          filterChanged
      );
    }
  };

  return (
    <Grid container direction="row" justifyContent="center" alignItems="center">
      <ADSMultipleSelectControl
        label="Type"
        isEditable
        indicateChange={streetTypeChanged}
        lookupData={StreetType}
        lookupId="id"
        lookupLabel={GetLookupLabel(settingsContext.isScottish)}
        lookupColour="colour"
        lookupDefault="default"
        value={streetType}
        onChange={handleStreetTypeChange}
      />
      <ADSMultipleSelectControl
        label="State"
        isEditable
        indicateChange={streetStateChanged}
        lookupData={StreetState}
        lookupId="id"
        lookupLabel={GetLookupLabel(settingsContext.isScottish)}
        lookupColour="colour"
        lookupDefault="default"
        value={streetState}
        onChange={handleStreetStateChange}
      />
      {!settingsContext.isScottish && (
        <Fragment>
          <Grid item xs={12}>
            <Divider
              sx={{
                mt: theme.spacing(1),
              }}
            />
          </Grid>
          <ADSMultipleSelectControl
            label="Highway dedication type"
            isEditable
            indicateChange={highwayDedicationCodeChanged}
            lookupData={HighwayDedicationCode}
            lookupId="id"
            lookupLabel={GetLookupLabel(settingsContext.isScottish)}
            lookupColour="colour"
            lookupDefault="default"
            value={highwayDedicationCode}
            onChange={handleHighwayDedicationCodeChange}
          />
          <ADSMultipleSelectControl
            label="Highway dedication indicators"
            isEditable
            indicateChange={highwayDedicationIndicatorChanged}
            lookupData={HighwayDedicationIndicator}
            lookupId="id"
            lookupLabel={GetLookupLabel(settingsContext.isScottish)}
            lookupColour="colour"
            lookupDefault="default"
            lookupIcon="avatar_icon"
            value={highwayDedicationIndicator}
            onChange={handleHighwayDedicationIndicatorChange}
          />
          <Grid item xs={12}>
            <Divider
              sx={{
                mt: theme.spacing(1),
              }}
            />
          </Grid>
          <ADSMultipleSelectControl
            label="Direction of traffic"
            isEditable
            indicateChange={directionOfTravelChanged}
            lookupData={ESUDirectionCode}
            lookupId="id"
            lookupLabel={GetLookupLabel(settingsContext.isScottish)}
            lookupColour="colour"
            lookupDefault="default"
            lookupIcon="avatar_icon"
            value={directionOfTravel}
            onChange={handleDirectionOfTravelChange}
          />
        </Fragment>
      )}
      <Grid item xs={12}>
        <Divider
          sx={{
            mt: theme.spacing(1),
          }}
        />
      </Grid>
      <ADSFilterDateControl
        label="Last updated"
        indicateChange={lastUpdatedChanged}
        filterType={lastUpdated.filterType}
        lastN={lastUpdated.lastN}
        lastPeriod={lastUpdated.lastPeriod}
        date1={lastUpdated.date1}
        date2={lastUpdated.date2}
        onChange={handleLastUpdatedChange}
      />
      <ADSFilterDateControl
        label="Start date"
        indicateChange={startDateChanged}
        filterType={startDate.filterType}
        lastN={startDate.lastN}
        lastPeriod={startDate.lastPeriod}
        date1={startDate.date1}
        date2={startDate.date2}
        onChange={handleStartDateChange}
      />
    </Grid>
  );
}

export default FilterStreetsTab;
