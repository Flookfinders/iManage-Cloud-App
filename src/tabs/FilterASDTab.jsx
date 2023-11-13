/* #region header */
/**************************************************************************************************
//
//  Description: Streets filter tab
//
//  Copyright:    © 2021 - 2023 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   15.07.21 Sean Flook         WI39??? Initial Revision.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */

import React, { useContext, useState } from "react";
import FilterContext from "../context/filterContext";
import SettingsContext from "../context/settingsContext";
import { GetLookupLabel } from "../utils/HelperUtils";
import RoadStatusCode from "../data/RoadStatusCode";
import ReinstatementType from "../data/ReinstatementType";
import SpecialDesignationCode from "../data/SpecialDesignationCode";
import HWWDesignationCode from "../data/HWWDesignationCode";
import { Divider, Grid } from "@mui/material";
import ADSMultipleSelectControl from "../components/ADSMultipleSelectControl";
import ADSFilterDateControl from "../components/ADSFilterDateControl";
import { useTheme } from "@mui/styles";

/* #endregion imports */

function FilterASDTab(props) {
  const theme = useTheme();

  const searchFilterContext = useContext(FilterContext);
  const settingsContext = useContext(SettingsContext);

  const onChange = props.onChange;
  // const onSearchClick = props.onSearchClick;

  const [streetStatus, setStreetStatus] = useState(
    searchFilterContext.currentSearchFilter &&
      searchFilterContext.currentSearchFilter.asd &&
      searchFilterContext.currentSearchFilter.asd.streetStatus
      ? searchFilterContext.currentSearchFilter.asd.streetStatus
      : RoadStatusCode.filter((x) => x.default).map((a) => a[GetLookupLabel(settingsContext.isScottish)])
  );
  const [constructionType, setConstructionType] = useState(
    searchFilterContext.currentSearchFilter &&
      searchFilterContext.currentSearchFilter.asd &&
      searchFilterContext.currentSearchFilter.asd.constructionType
      ? searchFilterContext.currentSearchFilter.asd.constructionType
      : ReinstatementType.filter((x) => x.default).map((a) => a[GetLookupLabel(settingsContext.isScottish)])
  );
  const [specialDesignationType, setSpecialDesignationType] = useState(
    searchFilterContext.currentSearchFilter &&
      searchFilterContext.currentSearchFilter.asd &&
      searchFilterContext.currentSearchFilter.asd.specialDesignationType
      ? searchFilterContext.currentSearchFilter.asd.specialDesignationType
      : SpecialDesignationCode.filter((x) => x.default).map((a) => a[GetLookupLabel(settingsContext.isScottish)])
  );
  const [hwwRestriction, setHWWRestriction] = useState(
    searchFilterContext.currentSearchFilter &&
      searchFilterContext.currentSearchFilter.asd &&
      searchFilterContext.currentSearchFilter.asd.hwwRestriction
      ? searchFilterContext.currentSearchFilter.asd.hwwRestriction
      : HWWDesignationCode.filter((x) => x.default).map((a) => a[GetLookupLabel(settingsContext.isScottish)])
  );
  const [lastUpdated, setLastUpdated] = useState(
    searchFilterContext.currentSearchFilter &&
      searchFilterContext.currentSearchFilter.asd &&
      searchFilterContext.currentSearchFilter.asd.lastUpdated
      ? searchFilterContext.currentSearchFilter.asd.lastUpdated
      : {}
  );
  const [startDate, setStartDate] = useState(
    searchFilterContext.currentSearchFilter &&
      searchFilterContext.currentSearchFilter.asd &&
      searchFilterContext.currentSearchFilter.asd.startDate
      ? searchFilterContext.currentSearchFilter.asd.startDate
      : {}
  );

  const [streetStatusChanged, setStreetStatusChanged] = useState(false);
  const [constructionTypeChanged, setConstructionTypeChanged] = useState(false);
  const [specialDesignationTypeChanged, setSpecialDesignationTypeChanged] = useState(false);
  const [hwwRestrictionChanged, setHWWRestrictionChanged] = useState(false);
  const [lastUpdatedChanged, setLastUpdatedChanged] = useState(false);
  const [startDateChanged, setStartDateChanged] = useState(false);

  const defaultStreetStatus = RoadStatusCode.filter((x) => x.default)
    .map((a) => a[GetLookupLabel(settingsContext.isScottish)])
    .slice()
    .sort();
  const defaultConstructionType = ReinstatementType.filter((x) => x.default)
    .map((a) => a[GetLookupLabel(settingsContext.isScottish)])
    .slice()
    .sort();
  const defaultSpecialDesignationType = SpecialDesignationCode.filter((x) => x.default)
    .map((a) => a[GetLookupLabel(settingsContext.isScottish)])
    .slice()
    .sort();
  const defaultHWWRestriction = HWWDesignationCode.filter((x) => x.default)
    .map((a) => a[GetLookupLabel(settingsContext.isScottish)])
    .slice()
    .sort();

  /**
   * Event to handle when the list of selected street statuses are changed.
   *
   * @param {Array} newValue The list of street statuses.
   */
  const handleStreetStatusChange = (newValue) => {
    const newValueSorted = newValue.slice().sort();
    const filterChanged = !(
      defaultStreetStatus.length === newValueSorted.length &&
      defaultStreetStatus.every(function (value, index) {
        return value === newValueSorted[index];
      })
    );

    setStreetStatus(newValue);
    setStreetStatusChanged(filterChanged);

    if (onChange) {
      onChange(
        {
          streetStatus: newValue,
          constructionType: constructionType,
          specialDesignationType: specialDesignationType,
          hwwRestriction: hwwRestriction,
          lastUpdated: lastUpdated,
          startDate: startDate,
        },
        filterChanged ||
          constructionTypeChanged ||
          specialDesignationTypeChanged ||
          hwwRestrictionChanged ||
          lastUpdatedChanged ||
          startDateChanged
      );
    }
  };

  /**
   * Event to handle when the list of selected construction types are changed.
   *
   * @param {Array} newValue The list of construction types.
   */
  const handleConstructionTypeChange = (newValue) => {
    const newValueSorted = newValue.slice().sort();
    const filterChanged = !(
      defaultConstructionType.length === newValueSorted.length &&
      defaultConstructionType.every(function (value, index) {
        return value === newValueSorted[index];
      })
    );

    setConstructionType(newValue);
    setConstructionTypeChanged(filterChanged);

    if (onChange) {
      onChange(
        {
          streetStatus: streetStatus,
          constructionType: newValue,
          specialDesignationType: specialDesignationType,
          hwwRestriction: hwwRestriction,
          lastUpdated: lastUpdated,
          startDate: startDate,
        },
        streetStatusChanged ||
          filterChanged ||
          specialDesignationTypeChanged ||
          hwwRestrictionChanged ||
          lastUpdatedChanged ||
          startDateChanged
      );
    }
  };

  /**
   * Event to handle when the list of selected special designation types are changed.
   *
   * @param {Array} newValue The list of special designation types.
   */
  const handleSpecialDesignationTypeChange = (newValue) => {
    const newValueSorted = newValue.slice().sort();
    const filterChanged = !(
      defaultSpecialDesignationType.length === newValueSorted.length &&
      defaultSpecialDesignationType.every(function (value, index) {
        return value === newValueSorted[index];
      })
    );

    setSpecialDesignationType(newValue);
    setSpecialDesignationTypeChanged(filterChanged);

    if (onChange) {
      onChange(
        {
          streetStatus: streetStatus,
          constructionType: constructionType,
          specialDesignationType: newValue,
          hwwRestriction: hwwRestriction,
          lastUpdated: lastUpdated,
          startDate: startDate,
        },
        streetStatusChanged ||
          constructionTypeChanged ||
          filterChanged ||
          hwwRestrictionChanged ||
          lastUpdatedChanged ||
          startDateChanged
      );
    }
  };

  /**
   * Event to handle when the list of selected height, width & weight restrictions are changed.
   *
   * @param {Array} newValue The list of height, width & weight restrictions.
   */
  const handleHWWRestrictionChange = (newValue) => {
    const newValueSorted = newValue.slice().sort();
    const filterChanged = !(
      defaultHWWRestriction.length === newValueSorted.length &&
      defaultHWWRestriction.every(function (value, index) {
        return value === newValueSorted[index];
      })
    );

    setHWWRestriction(newValue);
    setHWWRestrictionChanged(filterChanged);

    if (onChange) {
      onChange(
        {
          streetStatus: streetStatus,
          constructionType: constructionType,
          specialDesignationType: specialDesignationType,
          hwwRestriction: newValue,
          lastUpdated: lastUpdated,
          startDate: startDate,
        },
        streetStatusChanged ||
          constructionTypeChanged ||
          specialDesignationTypeChanged ||
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
          streetStatus: streetStatus,
          constructionType: constructionType,
          specialDesignationType: specialDesignationType,
          hwwRestriction: hwwRestriction,
          lastUpdated: newValue,
          startDate: startDate,
        },
        streetStatusChanged ||
          constructionTypeChanged ||
          specialDesignationTypeChanged ||
          hwwRestrictionChanged ||
          filterChanged ||
          startDateChanged
      );
    }
  };

  /**
   * Event to handle when the start date object is changed.
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
          streetStatus: streetStatus,
          constructionType: constructionType,
          specialDesignationType: specialDesignationType,
          hwwRestriction: hwwRestriction,
          lastUpdated: lastUpdated,
          startDate: newValue,
        },
        streetStatusChanged ||
          constructionTypeChanged ||
          specialDesignationTypeChanged ||
          hwwRestrictionChanged ||
          lastUpdatedChanged ||
          filterChanged
      );
    }
  };

  return (
    <Grid container direction="row" justifyContent="center" alignItems="center">
      <ADSMultipleSelectControl
        label="Street status"
        isEditable
        indicateChange={streetStatusChanged}
        lookupData={RoadStatusCode}
        lookupId="id"
        lookupLabel={GetLookupLabel(settingsContext.isScottish)}
        lookupColour="colour"
        lookupDefault="default"
        value={streetStatus}
        onChange={handleStreetStatusChange}
      />
      <Grid item xs={12}>
        <Divider
          sx={{
            marginTop: theme.spacing(1),
          }}
        />
      </Grid>
      <ADSMultipleSelectControl
        label="Construction type"
        isEditable
        indicateChange={constructionTypeChanged}
        lookupData={ReinstatementType}
        lookupId="id"
        lookupLabel={GetLookupLabel(settingsContext.isScottish)}
        lookupColour="colour"
        lookupDefault="default"
        value={constructionType}
        onChange={handleConstructionTypeChange}
      />
      <Grid item xs={12}>
        <Divider
          sx={{
            marginTop: theme.spacing(1),
          }}
        />
      </Grid>
      <ADSMultipleSelectControl
        label="Special designation type"
        isEditable
        indicateChange={specialDesignationTypeChanged}
        lookupData={SpecialDesignationCode}
        lookupId="id"
        lookupLabel={GetLookupLabel(settingsContext.isScottish)}
        lookupColour="colour"
        lookupDefault="default"
        value={specialDesignationType}
        onChange={handleSpecialDesignationTypeChange}
      />
      <Grid item xs={12}>
        <Divider
          sx={{
            marginTop: theme.spacing(1),
          }}
        />
      </Grid>
      <ADSMultipleSelectControl
        label="Height, width & weight restrictions"
        isEditable
        indicateChange={hwwRestrictionChanged}
        lookupData={HWWDesignationCode}
        lookupId="id"
        lookupLabel={GetLookupLabel(settingsContext.isScottish)}
        lookupColour="colour"
        lookupDefault="default"
        value={hwwRestriction}
        onChange={handleHWWRestrictionChange}
      />
      <Grid item xs={12}>
        <Divider
          sx={{
            marginTop: theme.spacing(1),
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

export default FilterASDTab;
