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

import React, { useContext, useState, Fragment, useEffect } from "react";
import PropTypes from "prop-types";

import SettingsContext from "../context/settingsContext";

import { GetLookupLabel } from "../utils/HelperUtils";

import { Box, Divider, Grid2 } from "@mui/material";
import ADSMultipleSelectControl from "../components/ADSMultipleSelectControl";
import ADSFilterDateControl from "../components/ADSFilterDateControl";

import StreetType from "../data/StreetType";
import StreetState from "../data/StreetState";
import HighwayDedicationCode from "../data/HighwayDedicationCode";
import HighwayDedicationIndicator from "../data/HighwayDedicationIndicator";
import ESUDirectionCode from "../data/ESUDirectionCode";

import { useTheme } from "@mui/styles";

FilterStreetsTab.propTypes = {
  changedFlags: PropTypes.object.isRequired,
  selectedData: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

/* #endregion imports */

function FilterStreetsTab({ changedFlags, selectedData, onChange }) {
  const theme = useTheme();

  const settingsContext = useContext(SettingsContext);

  const [streetType, setStreetType] = useState(
    StreetType.filter((x) => x.default).map((a) => a[GetLookupLabel(settingsContext.isScottish)])
  );
  const [streetState, setStreetState] = useState(
    StreetState.filter((x) => x.default).map((a) => a[GetLookupLabel(settingsContext.isScottish)])
  );
  const [highwayDedicationCode, setHighwayDedicationCode] = useState(
    HighwayDedicationCode.filter((x) => x.default).map((a) => a[GetLookupLabel(settingsContext.isScottish)])
  );
  const [highwayDedicationIndicator, setHighwayDedicationIndicator] = useState(
    HighwayDedicationIndicator.filter((x) => x.default).map((a) => a[GetLookupLabel(settingsContext.isScottish)])
  );
  const [directionOfTravel, setDirectionOfTravel] = useState(
    ESUDirectionCode.filter((x) => x.default).map((a) => a[GetLookupLabel(settingsContext.isScottish)])
  );
  const [lastUpdated, setLastUpdated] = useState({});
  const [startDate, setStartDate] = useState({});

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
    const idSortedData = StreetType.filter((x) => newValue.includes(x[`${GetLookupLabel(settingsContext.isScottish)}`]))
      .sort((a, b) => a.id - b.id)
      .map((x) => x[`${GetLookupLabel(settingsContext.isScottish)}`]);
    const newValueSorted = newValue.slice().sort();
    const filterChanged = !(
      defaultStreetType.length === newValueSorted.length &&
      defaultStreetType.every(function (value, index) {
        return value === newValueSorted[index];
      })
    );

    if (onChange) {
      onChange(
        {
          streetType: idSortedData,
          streetState: streetState,
          highwayDedicationCode: highwayDedicationCode,
          highwayDedicationIndicator: highwayDedicationIndicator,
          directionOfTravel: directionOfTravel,
          lastUpdated: lastUpdated,
          startDate: startDate,
        },
        {
          streetType: filterChanged,
          streetState: streetStateChanged,
          highwayDedicationCode: highwayDedicationCodeChanged,
          highwayDedicationIndicator: highwayDedicationIndicatorChanged,
          directionOfTravel: directionOfTravelChanged,
          lastUpdated: lastUpdatedChanged,
          startDate: startDateChanged,
        }
      );
    }
  };

  /**
   * Event to handle when the list of selected street states are changed.
   *
   * @param {Array} newValue The list of street states.
   */
  const handleStreetStateChange = (newValue) => {
    const idSortedData = StreetState.filter((x) =>
      newValue.includes(x[`${GetLookupLabel(settingsContext.isScottish)}`])
    )
      .sort((a, b) => a.id - b.id)
      .map((x) => x[`${GetLookupLabel(settingsContext.isScottish)}`]);
    const newValueSorted = newValue.slice().sort();
    const filterChanged = !(
      defaultStreetState.length === newValueSorted.length &&
      defaultStreetState.every(function (value, index) {
        return value === newValueSorted[index];
      })
    );

    if (onChange) {
      onChange(
        {
          streetType: streetType,
          streetState: idSortedData,
          highwayDedicationCode: highwayDedicationCode,
          highwayDedicationIndicator: highwayDedicationIndicator,
          directionOfTravel: directionOfTravel,
          lastUpdated: lastUpdated,
          startDate: startDate,
        },
        {
          streetType: streetTypeChanged,
          streetState: filterChanged,
          highwayDedicationCode: highwayDedicationCodeChanged,
          highwayDedicationIndicator: highwayDedicationIndicatorChanged,
          directionOfTravel: directionOfTravelChanged,
          lastUpdated: lastUpdatedChanged,
          startDate: startDateChanged,
        }
      );
    }
  };

  /**
   * Event to handle when the list of selected highway dedication codes are changed.
   *
   * @param {Array} newValue The list of highway dedication codes.
   */
  const handleHighwayDedicationCodeChange = (newValue) => {
    const idSortedData = HighwayDedicationCode.filter((x) =>
      newValue.includes(x[`${GetLookupLabel(settingsContext.isScottish)}`])
    )
      .sort((a, b) => a.id - b.id)
      .map((x) => x[`${GetLookupLabel(settingsContext.isScottish)}`]);
    const newValueSorted = newValue.slice().sort();
    const filterChanged = !(
      defaultHighwayDedicationCode.length === newValueSorted.length &&
      defaultHighwayDedicationCode.every(function (value, index) {
        return value === newValueSorted[index];
      })
    );

    if (onChange) {
      onChange(
        {
          streetType: streetType,
          streetState: streetState,
          highwayDedicationCode: idSortedData,
          highwayDedicationIndicator: highwayDedicationIndicator,
          directionOfTravel: directionOfTravel,
          lastUpdated: lastUpdated,
          startDate: startDate,
        },
        {
          streetType: streetTypeChanged,
          streetState: streetStateChanged,
          highwayDedicationCode: filterChanged,
          highwayDedicationIndicator: highwayDedicationIndicatorChanged,
          directionOfTravel: directionOfTravelChanged,
          lastUpdated: lastUpdatedChanged,
          startDate: startDateChanged,
        }
      );
    }
  };

  /**
   * Event to handle when the list of selected highway dedication indicators are changed.
   *
   * @param {Array} newValue The list of highway dedication indicators.
   */
  const handleHighwayDedicationIndicatorChange = (newValue) => {
    const idSortedData = HighwayDedicationIndicator.filter((x) =>
      newValue.includes(x[`${GetLookupLabel(settingsContext.isScottish)}`])
    )
      .sort((a, b) => a.id - b.id)
      .map((x) => x[`${GetLookupLabel(settingsContext.isScottish)}`]);
    const newValueSorted = newValue.slice().sort();
    const filterChanged = !(
      defaultHighwayDedicationIndicator.length === newValueSorted.length &&
      defaultHighwayDedicationIndicator.every(function (value, index) {
        return value === newValueSorted[index];
      })
    );

    if (onChange) {
      onChange(
        {
          streetType: streetType,
          streetState: streetState,
          highwayDedicationCode: highwayDedicationCode,
          highwayDedicationIndicator: idSortedData,
          directionOfTravel: directionOfTravel,
          lastUpdated: lastUpdated,
          startDate: startDate,
        },
        {
          streetType: streetTypeChanged,
          streetState: streetStateChanged,
          highwayDedicationCode: highwayDedicationCodeChanged,
          highwayDedicationIndicator: filterChanged,
          directionOfTravel: directionOfTravelChanged,
          lastUpdated: lastUpdatedChanged,
          startDate: startDateChanged,
        }
      );
    }
  };

  /**
   * Event to handle when the list of selected directions of travel are changed.
   *
   * @param {Array} newValue The list of directions of travel.
   */
  const handleDirectionOfTravelChange = (newValue) => {
    const idSortedData = ESUDirectionCode.filter((x) =>
      newValue.includes(x[`${GetLookupLabel(settingsContext.isScottish)}`])
    )
      .sort((a, b) => a.id - b.id)
      .map((x) => x[`${GetLookupLabel(settingsContext.isScottish)}`]);
    const newValueSorted = newValue.slice().sort();
    const filterChanged = !(
      defaultDirectionOfTravel.length === newValueSorted.length &&
      defaultDirectionOfTravel.every(function (value, index) {
        return value === newValueSorted[index];
      })
    );

    if (onChange) {
      onChange(
        {
          streetType: streetType,
          streetState: streetState,
          highwayDedicationCode: highwayDedicationCode,
          highwayDedicationIndicator: highwayDedicationIndicator,
          directionOfTravel: idSortedData,
          lastUpdated: lastUpdated,
          startDate: startDate,
        },
        {
          streetType: streetTypeChanged,
          streetState: streetStateChanged,
          highwayDedicationCode: highwayDedicationCodeChanged,
          highwayDedicationIndicator: highwayDedicationIndicatorChanged,
          directionOfTravel: filterChanged,
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
          streetType: streetType,
          streetState: streetState,
          highwayDedicationCode: highwayDedicationCode,
          highwayDedicationIndicator: highwayDedicationIndicator,
          directionOfTravel: directionOfTravel,
          lastUpdated: newValue,
          startDate: startDate,
        },
        {
          streetType: streetTypeChanged,
          streetState: streetStateChanged,
          highwayDedicationCode: highwayDedicationCodeChanged,
          highwayDedicationIndicator: highwayDedicationIndicatorChanged,
          directionOfTravel: directionOfTravelChanged,
          lastUpdated: filterChanged,
          startDate: startDateChanged,
        }
      );
    }
  };

  /**
   * Event to handle when the Start date object is changed.
   *
   * @param {object} newValue The start date object.
   */
  const handleStartDateChange = (newValue) => {
    const filterChanged = !!newValue;

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
        {
          streetType: streetTypeChanged,
          streetState: streetStateChanged,
          highwayDedicationCode: highwayDedicationCodeChanged,
          highwayDedicationIndicator: highwayDedicationIndicatorChanged,
          directionOfTravel: directionOfTravelChanged,
          lastUpdated: lastUpdatedChanged,
          startDate: filterChanged,
        }
      );
    }
  };

  useEffect(() => {
    if (changedFlags) {
      setStreetTypeChanged(changedFlags.streetType);
      setStreetStateChanged(changedFlags.streetState);
      setHighwayDedicationCodeChanged(changedFlags.highwayDedicationCode);
      setHighwayDedicationIndicatorChanged(changedFlags.highwayDedicationIndicator);
      setDirectionOfTravelChanged(changedFlags.directionOfTravel);
      setLastUpdatedChanged(changedFlags.lastUpdated);
      setStartDateChanged(changedFlags.startDate);
    } else {
      setStreetTypeChanged(false);
      setStreetStateChanged(false);
      setHighwayDedicationCodeChanged(false);
      setHighwayDedicationIndicatorChanged(false);
      setDirectionOfTravelChanged(false);
      setLastUpdatedChanged(false);
      setStartDateChanged(false);
    }
  }, [changedFlags]);

  useEffect(() => {
    if (selectedData) {
      setStreetType(selectedData.streetType);
      setStreetState(selectedData.streetState);
      setHighwayDedicationCode(selectedData.highwayDedicationCode);
      setHighwayDedicationIndicator(selectedData.highwayDedicationIndicator);
      setDirectionOfTravel(selectedData.directionOfTravel);
      setLastUpdated(selectedData.lastUpdated);
      setStartDate(selectedData.startDate);
    }
  }, [selectedData]);

  return (
    <Box>
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
          <Grid2 size={12}>
            <Divider
              sx={{
                mt: theme.spacing(1),
              }}
            />
          </Grid2>
          {!settingsContext.isScottish && (
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
          )}
          {!settingsContext.isScottish && (
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
          {!settingsContext.isScottish && (
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
          )}
        </Fragment>
      )}
      <Grid2 size={12}>
        <Divider
          sx={{
            mt: theme.spacing(1),
          }}
        />
      </Grid2>
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

export default FilterStreetsTab;
