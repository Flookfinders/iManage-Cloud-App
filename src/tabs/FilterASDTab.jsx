/* #region header */
/**************************************************************************************************
//
//  Description: Streets filter tab
//
//  Copyright:    © 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//#region Version 1.0.0.0 changes
//    001   15.07.21 Sean Flook          WI39??? Initial Revision.
//    002   05.01.24 Sean Flook                  Use CSS shortcuts.
//#endregion Version 1.0.0.0 changes
//#region Version 1.0.2.0 changes
//    003   12.11.24 Sean Flook                  Various changes to improve the look and functionality.
//#endregion Version 1.0.2.0 changes
//#region Version 1.0.4.0 changes
//    004   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//#endregion Version 1.0.4.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */

import React, { useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

import SettingsContext from "../context/settingsContext";

import { filteredLookup, GetLookupLabel } from "../utils/HelperUtils";

import { Box, Divider, Grid2 } from "@mui/material";
import ADSMultipleSelectControl from "../components/ADSMultipleSelectControl";
import ADSFilterDateControl from "../components/ADSFilterDateControl";

import RoadStatusCode from "../data/RoadStatusCode";
import ReinstatementType from "../data/ReinstatementType";
import SpecialDesignationCode from "../data/SpecialDesignationCode";
import HWWDesignationCode from "../data/HWWDesignationCode";

import { useTheme } from "@mui/styles";

FilterASDTab.propTypes = {
  changedFlags: PropTypes.object.isRequired,
  selectedData: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

/* #endregion imports */

function FilterASDTab({ changedFlags, selectedData, onChange }) {
  const theme = useTheme();

  const settingsContext = useContext(SettingsContext);

  const [streetStatus, setStreetStatus] = useState(
    RoadStatusCode.filter((x) => x.default).map((a) => a[GetLookupLabel(settingsContext.isScottish)])
  );
  const [reinstatementType, setReinstatementType] = useState(
    ReinstatementType.filter((x) => x.default).map((a) => a[GetLookupLabel(settingsContext.isScottish)])
  );
  const [specialDesignationType, setSpecialDesignationType] = useState(
    SpecialDesignationCode.filter((x) => x.default).map((a) => a[GetLookupLabel(settingsContext.isScottish)])
  );
  const [hwwRestriction, setHWWRestriction] = useState(
    HWWDesignationCode.filter((x) => x.default).map((a) => a[GetLookupLabel(settingsContext.isScottish)])
  );
  const [lastUpdated, setLastUpdated] = useState({});
  const [startDate, setStartDate] = useState({});

  const [streetStatusChanged, setStreetStatusChanged] = useState(false);
  const [reinstatementTypeChanged, setReinstatementTypeChanged] = useState(false);
  const [specialDesignationTypeChanged, setSpecialDesignationTypeChanged] = useState(false);
  const [hwwRestrictionChanged, setHWWRestrictionChanged] = useState(false);
  const [lastUpdatedChanged, setLastUpdatedChanged] = useState(false);
  const [startDateChanged, setStartDateChanged] = useState(false);

  const defaultStreetStatus = RoadStatusCode.filter((x) => x.default)
    .map((a) => a[GetLookupLabel(settingsContext.isScottish)])
    .slice()
    .sort();
  const defaultReinstatementType = ReinstatementType.filter((x) => x.default)
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
    const idSortedData = RoadStatusCode.filter((x) =>
      newValue.includes(x[`${GetLookupLabel(settingsContext.isScottish)}`])
    )
      .sort((a, b) => a.id - b.id)
      .map((x) => x[`${GetLookupLabel(settingsContext.isScottish)}`]);
    const newValueSorted = newValue.slice().sort();
    const filterChanged = !(
      defaultStreetStatus.length === newValueSorted.length &&
      defaultStreetStatus.every(function (value, index) {
        return value === newValueSorted[index];
      })
    );

    if (onChange) {
      onChange(
        {
          streetStatus: idSortedData,
          reinstatementType: reinstatementType,
          specialDesignationType: specialDesignationType,
          hwwRestriction: hwwRestriction,
          lastUpdated: lastUpdated,
          startDate: startDate,
        },
        {
          streetStatus: filterChanged,
          reinstatementType: reinstatementTypeChanged,
          specialDesignationType: specialDesignationTypeChanged,
          hwwRestriction: hwwRestrictionChanged,
          lastUpdated: lastUpdatedChanged,
          startDate: startDateChanged,
        }
      );
    }
  };

  /**
   * Event to handle when the list of selected reinstatement types are changed.
   *
   * @param {Array} newValue The list of reinstatement types.
   */
  const handleReinstatementTypeChange = (newValue) => {
    const idSortedData = ReinstatementType.filter((x) =>
      newValue.includes(x[`${GetLookupLabel(settingsContext.isScottish)}`])
    )
      .sort((a, b) => a.id - b.id)
      .map((x) => x[`${GetLookupLabel(settingsContext.isScottish)}`]);
    const newValueSorted = newValue.slice().sort();
    const filterChanged = !(
      defaultReinstatementType.length === newValueSorted.length &&
      defaultReinstatementType.every(function (value, index) {
        return value === newValueSorted[index];
      })
    );

    if (onChange) {
      onChange(
        {
          streetStatus: streetStatus,
          reinstatementType: idSortedData,
          specialDesignationType: specialDesignationType,
          hwwRestriction: hwwRestriction,
          lastUpdated: lastUpdated,
          startDate: startDate,
        },
        {
          streetStatus: streetStatusChanged,
          reinstatementType: filterChanged,
          specialDesignationType: specialDesignationTypeChanged,
          hwwRestriction: hwwRestrictionChanged,
          lastUpdated: lastUpdatedChanged,
          startDate: startDateChanged,
        }
      );
    }
  };

  /**
   * Event to handle when the list of selected special designation types are changed.
   *
   * @param {Array} newValue The list of special designation types.
   */
  const handleSpecialDesignationTypeChange = (newValue) => {
    const idSortedData = SpecialDesignationCode.filter((x) =>
      newValue.includes(x[`${GetLookupLabel(settingsContext.isScottish)}`])
    )
      .sort((a, b) => a.id - b.id)
      .map((x) => x[`${GetLookupLabel(settingsContext.isScottish)}`]);
    const newValueSorted = newValue.slice().sort();
    const filterChanged = !(
      defaultSpecialDesignationType.length === newValueSorted.length &&
      defaultSpecialDesignationType.every(function (value, index) {
        return value === newValueSorted[index];
      })
    );

    if (onChange) {
      onChange(
        {
          streetStatus: streetStatus,
          reinstatementType: reinstatementType,
          specialDesignationType: idSortedData,
          hwwRestriction: hwwRestriction,
          lastUpdated: lastUpdated,
          startDate: startDate,
        },
        {
          streetStatus: streetStatusChanged,
          reinstatementType: reinstatementTypeChanged,
          specialDesignationType: filterChanged,
          hwwRestriction: hwwRestrictionChanged,
          lastUpdated: lastUpdatedChanged,
          startDate: startDateChanged,
        }
      );
    }
  };

  /**
   * Event to handle when the list of selected height, width & weight restrictions are changed.
   *
   * @param {Array} newValue The list of height, width & weight restrictions.
   */
  const handleHWWRestrictionChange = (newValue) => {
    const idSortedData = HWWDesignationCode.filter((x) =>
      newValue.includes(x[`${GetLookupLabel(settingsContext.isScottish)}`])
    )
      .sort((a, b) => a.id - b.id)
      .map((x) => x[`${GetLookupLabel(settingsContext.isScottish)}`]);
    const newValueSorted = newValue.slice().sort();
    const filterChanged = !(
      defaultHWWRestriction.length === newValueSorted.length &&
      defaultHWWRestriction.every(function (value, index) {
        return value === newValueSorted[index];
      })
    );

    if (onChange) {
      onChange(
        {
          streetStatus: streetStatus,
          reinstatementType: reinstatementType,
          specialDesignationType: specialDesignationType,
          hwwRestriction: idSortedData,
          lastUpdated: lastUpdated,
          startDate: startDate,
        },
        {
          streetStatus: streetStatusChanged,
          reinstatementType: reinstatementTypeChanged,
          specialDesignationType: specialDesignationTypeChanged,
          hwwRestriction: filterChanged,
          lastUpdated: lastUpdatedChanged,
          startDate: startDateChanged,
        }
      );
    }
  };

  /**
   * Event to handle when the last updated object is changed.
   *
   * @param {object} newValue The last updated object.
   */
  const handleLastUpdatedChange = (newValue) => {
    const filterChanged = !!newValue;

    if (onChange) {
      onChange(
        {
          streetStatus: streetStatus,
          reinstatementType: reinstatementType,
          specialDesignationType: specialDesignationType,
          hwwRestriction: hwwRestriction,
          lastUpdated: newValue,
          startDate: startDate,
        },
        {
          streetStatus: streetStatusChanged,
          reinstatementType: reinstatementTypeChanged,
          specialDesignationType: specialDesignationTypeChanged,
          hwwRestriction: hwwRestrictionChanged,
          lastUpdated: filterChanged,
          startDate: startDateChanged,
        }
      );
    }
  };

  /**
   * Event to handle when the start date object is changed.
   *
   * @param {object} newValue The start date object.
   */
  const handleStartDateChange = (newValue) => {
    const filterChanged = !!newValue;

    if (onChange) {
      onChange(
        {
          streetStatus: streetStatus,
          reinstatementType: reinstatementType,
          specialDesignationType: specialDesignationType,
          hwwRestriction: hwwRestriction,
          lastUpdated: lastUpdated,
          startDate: newValue,
        },
        {
          streetStatus: streetStatusChanged,
          reinstatementType: reinstatementTypeChanged,
          specialDesignationType: specialDesignationTypeChanged,
          hwwRestriction: hwwRestrictionChanged,
          lastUpdated: lastUpdatedChanged,
          startDate: filterChanged,
        }
      );
    }
  };

  useEffect(() => {
    if (changedFlags) {
      setStreetStatusChanged(changedFlags.streetStatus);
      setReinstatementTypeChanged(changedFlags.reinstatementType);
      setSpecialDesignationTypeChanged(changedFlags.specialDesignationType);
      setHWWRestrictionChanged(changedFlags.hwwRestriction);
      setLastUpdatedChanged(changedFlags.lastUpdated);
      setStartDateChanged(changedFlags.startDate);
    } else {
      setStreetStatusChanged(false);
      setReinstatementTypeChanged(false);
      setSpecialDesignationTypeChanged(false);
      setHWWRestrictionChanged(false);
      setLastUpdatedChanged(false);
      setStartDateChanged(false);
    }
  }, [changedFlags]);

  useEffect(() => {
    if (selectedData) {
      setStreetStatus(selectedData.streetStatus);
      setReinstatementType(selectedData.reinstatementType);
      setSpecialDesignationType(selectedData.specialDesignationType);
      setHWWRestriction(selectedData.hwwRestriction);
      setLastUpdated(selectedData.lastUpdated);
      setStartDate(selectedData.startDate);
    }
  }, [selectedData]);

  return (
    <Box>
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
      <Grid2 size={12}>
        <Divider
          sx={{
            mt: theme.spacing(1),
          }}
        />
      </Grid2>
      <ADSMultipleSelectControl
        label="Reinstatement type"
        isEditable
        indicateChange={reinstatementTypeChanged}
        lookupData={filteredLookup(ReinstatementType, settingsContext.isScottish)}
        lookupId="id"
        lookupLabel={GetLookupLabel(settingsContext.isScottish)}
        lookupColour="colour"
        lookupDefault="default"
        value={reinstatementType}
        onChange={handleReinstatementTypeChange}
      />
      <Grid2 size={12}>
        <Divider
          sx={{
            mt: theme.spacing(1),
          }}
        />
      </Grid2>
      <ADSMultipleSelectControl
        label="Special designation type"
        isEditable
        indicateChange={specialDesignationTypeChanged}
        lookupData={filteredLookup(SpecialDesignationCode, settingsContext.isScottish)}
        lookupId="id"
        lookupLabel={GetLookupLabel(settingsContext.isScottish)}
        lookupColour="colour"
        lookupDefault="default"
        value={specialDesignationType}
        onChange={handleSpecialDesignationTypeChange}
      />
      <Grid2 size={12}>
        <Divider
          sx={{
            mt: theme.spacing(1),
          }}
        />
      </Grid2>
      {!settingsContext.isScottish && (
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
      )}
      {!settingsContext.isScottish && (
        <Grid2 size={12}>
          <Divider
            sx={{
              mt: theme.spacing(1),
            }}
          />
        </Grid2>
      )}
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
    </Box>
  );
}

export default FilterASDTab;
