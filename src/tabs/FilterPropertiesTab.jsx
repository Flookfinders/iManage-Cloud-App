/* #region header */
/**************************************************************************************************
//
//  Description: Properties filter tab
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   07.07.21 Sean Flook         WI39??? Initial Revision.
//    002   22.09.23 Sean Flook                 Changes required to handle Scottish classifications.
//    003   05.01.24 Sean Flook                 Use CSS shortcuts.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */

import React, { useContext, useState } from "react";
import FilterContext from "../context/filterContext";
import SettingsContext from "../context/settingsContext";
import { GetLookupLabel } from "../utils/HelperUtils";
import BLPULogicalStatus from "../data/BLPULogicalStatus";
import BLPUState from "../data/BLPUState";
import RepresentativePointCode from "../data/RepresentativePointCode";
import BLPUClassification from "../data/BLPUClassification";
import OSGClassification from "../data/OSGClassification";
import LPILogicalStatus from "../data/LPILogicalStatus";
import { Divider, Grid } from "@mui/material";
import ADSMultipleSelectControl from "../components/ADSMultipleSelectControl";
import ADSFilterDateControl from "../components/ADSFilterDateControl";
import { useTheme } from "@mui/styles";

/* #endregion imports */

function FilterPropertiesTab(props) {
  const theme = useTheme();

  const searchFilterContext = useContext(FilterContext);
  const settingsContext = useContext(SettingsContext);

  const onChange = props.onChange;
  // const onSearchClick = props.onSearchClick;

  const [blpuLogicalStatus, setBlpuLogicalStatus] = useState(
    searchFilterContext.currentSearchFilter &&
      searchFilterContext.currentSearchFilter.property &&
      searchFilterContext.currentSearchFilter.property.blpuLogicalStatus
      ? searchFilterContext.currentSearchFilter.property.blpuLogicalStatus
      : BLPULogicalStatus.filter((x) => x.default).map((a) => a[GetLookupLabel(settingsContext.isScottish)])
  );
  const [blpuState, setBlpuState] = useState(
    searchFilterContext.currentSearchFilter &&
      searchFilterContext.currentSearchFilter.property &&
      searchFilterContext.currentSearchFilter.property.blpuState
      ? searchFilterContext.currentSearchFilter.property.blpuState
      : BLPUState.filter((x) => x.default).map((a) => a[GetLookupLabel(settingsContext.isScottish)])
  );
  const [rpc, setRpc] = useState(
    searchFilterContext.currentSearchFilter &&
      searchFilterContext.currentSearchFilter.property &&
      searchFilterContext.currentSearchFilter.property.rpc
      ? searchFilterContext.currentSearchFilter.property.rpc
      : RepresentativePointCode.filter((x) => x.default).map((a) => a[GetLookupLabel(settingsContext.isScottish)])
  );
  const [classification, setClassification] = useState(
    searchFilterContext.currentSearchFilter &&
      searchFilterContext.currentSearchFilter.property &&
      searchFilterContext.currentSearchFilter.property.classification
      ? searchFilterContext.currentSearchFilter.property.classification
      : []
  );
  const [lpiLogicalStatus, setLpiLogicalStatus] = useState(
    searchFilterContext.currentSearchFilter &&
      searchFilterContext.currentSearchFilter.property &&
      searchFilterContext.currentSearchFilter.property.lpiLogicalStatus
      ? searchFilterContext.currentSearchFilter.property.lpiLogicalStatus
      : LPILogicalStatus.filter((x) => x.default).map((a) => a[GetLookupLabel(settingsContext.isScottish)])
  );
  const [lastUpdated, setLastUpdated] = useState(
    searchFilterContext.currentSearchFilter &&
      searchFilterContext.currentSearchFilter.property &&
      searchFilterContext.currentSearchFilter.property.lastUpdated
      ? searchFilterContext.currentSearchFilter.property.lastUpdated
      : {}
  );
  const [startDate, setStartDate] = useState(
    searchFilterContext.currentSearchFilter &&
      searchFilterContext.currentSearchFilter.property &&
      searchFilterContext.currentSearchFilter.property.startDate
      ? searchFilterContext.currentSearchFilter.property.startDate
      : {}
  );

  const [blpuLogicalStatusChanged, setBLPULogicalStatusChanged] = useState(false);
  const [blpuStateChanged, setBLPUStateChanged] = useState(false);
  const [rpcChanged, setRPCChanged] = useState(false);
  const [classificationChanged, setClassificationChanged] = useState(false);
  const [lpiLogicalStatusChanged, setLPILogicalStatusChanged] = useState(false);
  const [lastUpdatedChanged, setLastUpdatedChanged] = useState(false);
  const [startDateChanged, setStartDateChanged] = useState(false);

  const defaultBLPULogicalStatus = BLPULogicalStatus.filter((x) => x.default)
    .map((a) => a[GetLookupLabel(settingsContext.isScottish)])
    .slice()
    .sort();
  const defaultBLPUState = BLPUState.filter((x) => x.default)
    .map((a) => a[GetLookupLabel(settingsContext.isScottish)])
    .slice()
    .sort();
  const defaultRPC = RepresentativePointCode.filter((x) => x.default)
    .map((a) => a[GetLookupLabel(settingsContext.isScottish)])
    .slice()
    .sort();
  const defaultLPILogicalStatus = LPILogicalStatus.filter((x) => x.default)
    .map((a) => a[GetLookupLabel(settingsContext.isScottish)])
    .slice()
    .sort();

  /**
   * Event to handle when the list of selected BLPU logical statuses are changed.
   *
   * @param {Array} newValue The list of BLPU logical statuses.
   */
  const handleBLPULogicalStatusChange = (newValue) => {
    const newValueSorted = newValue.slice().sort();
    const filterChanged = !(
      defaultBLPULogicalStatus.length === newValueSorted.length &&
      defaultBLPULogicalStatus.every(function (value, index) {
        return value === newValueSorted[index];
      })
    );

    setBlpuLogicalStatus(newValue);
    setBLPULogicalStatusChanged(filterChanged);

    if (onChange) {
      onChange(
        {
          blpuLogicalStatus: newValue,
          blpuState: blpuState,
          rpc: rpc,
          classification: classification,
          lpiLogicalStatus: lpiLogicalStatus,
          lastUpdated: lastUpdated,
          startDate: startDate,
        },
        filterChanged ||
          blpuStateChanged ||
          rpcChanged ||
          classificationChanged ||
          lpiLogicalStatusChanged ||
          lastUpdatedChanged ||
          startDateChanged
      );
    }
  };

  /**
   * Event to handle when the list of selected BLPU states are changed.
   *
   * @param {Array} newValue The list of BLPU states.
   */
  const handleBLPUStateChange = (newValue) => {
    const newValueSorted = newValue.slice().sort();
    const filterChanged = !(
      defaultBLPUState.length === newValueSorted.length &&
      defaultBLPUState.every(function (value, index) {
        return value === newValueSorted[index];
      })
    );

    setBlpuState(newValue);
    setBLPUStateChanged(filterChanged);

    if (onChange) {
      onChange(
        {
          blpuLogicalStatus: blpuLogicalStatus,
          blpuState: newValue,
          rpc: rpc,
          classification: classification,
          lpiLogicalStatus: lpiLogicalStatus,
          lastUpdated: lastUpdated,
          startDate: startDate,
        },
        blpuLogicalStatusChanged ||
          filterChanged ||
          rpcChanged ||
          classificationChanged ||
          lpiLogicalStatusChanged ||
          lastUpdatedChanged ||
          startDateChanged
      );
    }
  };

  /**
   * Event to handle when the list of selected RPCs are changed.
   *
   * @param {Array} newValue The list of RPCs.
   */
  const handleRPCChange = (newValue) => {
    const newValueSorted = newValue.slice().sort();
    const filterChanged = !(
      defaultRPC.length === newValueSorted.length &&
      defaultRPC.every(function (value, index) {
        return value === newValueSorted[index];
      })
    );

    setRpc(newValue);
    setRPCChanged(filterChanged);

    if (onChange) {
      onChange(
        {
          blpuLogicalStatus: blpuLogicalStatus,
          blpuState: blpuState,
          rpc: newValue,
          classification: classification,
          lpiLogicalStatus: lpiLogicalStatus,
          lastUpdated: lastUpdated,
          startDate: startDate,
        },
        blpuLogicalStatusChanged ||
          blpuStateChanged ||
          filterChanged ||
          classificationChanged ||
          lpiLogicalStatusChanged ||
          lastUpdatedChanged ||
          startDateChanged
      );
    }
  };

  /**
   * Event to handle when the list of selected classifications are changed.
   *
   * @param {Array} newValue The list of classifications.
   */
  const handleClassificationChange = (newValue) => {
    const filterChanged = newValue && newValue.length > 0;

    setClassification(newValue);
    setClassificationChanged(filterChanged);

    if (onChange) {
      onChange(
        {
          blpuLogicalStatus: blpuLogicalStatus,
          blpuState: blpuState,
          rpc: rpc,
          classification: newValue,
          lpiLogicalStatus: lpiLogicalStatus,
          lastUpdated: lastUpdated,
          startDate: startDate,
        },
        blpuLogicalStatusChanged ||
          blpuStateChanged ||
          rpcChanged ||
          filterChanged ||
          lpiLogicalStatusChanged ||
          lastUpdatedChanged ||
          startDateChanged
      );
    }
  };

  /**
   * Event to handle when the list of selected LPI logical statuses are changed.
   *
   * @param {Array} newValue The list of LPI logical statuses.
   */
  const handleLPILogicalStatusChange = (newValue) => {
    const newValueSorted = newValue.slice().sort();
    const filterChanged = !(
      defaultLPILogicalStatus.length === newValueSorted.length &&
      defaultLPILogicalStatus.every(function (value, index) {
        return value === newValueSorted[index];
      })
    );

    setLpiLogicalStatus(newValue);
    setLPILogicalStatusChanged(filterChanged);

    if (onChange) {
      onChange(
        {
          blpuLogicalStatus: blpuLogicalStatus,
          blpuState: blpuState,
          rpc: rpc,
          classification: classification,
          lpiLogicalStatus: newValue,
          lastUpdated: lastUpdated,
          startDate: startDate,
        },
        blpuLogicalStatusChanged ||
          blpuStateChanged ||
          rpcChanged ||
          classificationChanged ||
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
          blpuLogicalStatus: blpuLogicalStatus,
          blpuState: blpuState,
          rpc: rpc,
          classification: classification,
          lpiLogicalStatus: lpiLogicalStatus,
          lastUpdated: newValue,
          startDate: startDate,
        },
        blpuLogicalStatusChanged ||
          blpuStateChanged ||
          rpcChanged ||
          classificationChanged ||
          lpiLogicalStatusChanged ||
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
          blpuLogicalStatus: blpuLogicalStatus,
          blpuState: blpuState,
          rpc: rpc,
          classification: classification,
          lpiLogicalStatus: lpiLogicalStatus,
          lastUpdated: lastUpdated,
          startDate: newValue,
        },
        blpuLogicalStatusChanged ||
          blpuStateChanged ||
          rpcChanged ||
          classificationChanged ||
          lpiLogicalStatusChanged ||
          lastUpdatedChanged ||
          filterChanged
      );
    }
  };

  return (
    <Grid container direction="row" justifyContent="center" alignItems="center">
      <ADSMultipleSelectControl
        label="BLPU status"
        isEditable
        indicateChange={blpuLogicalStatusChanged}
        lookupData={BLPULogicalStatus}
        lookupId="id"
        lookupLabel={GetLookupLabel(settingsContext.isScottish)}
        lookupColour="colour"
        lookupDefault="default"
        value={blpuLogicalStatus}
        onChange={handleBLPULogicalStatusChange}
      />
      <ADSMultipleSelectControl
        label="State"
        isEditable
        indicateChange={blpuStateChanged}
        lookupData={BLPUState}
        lookupId="id"
        lookupLabel={GetLookupLabel(settingsContext.isScottish)}
        lookupColour="colour"
        lookupDefault="default"
        value={blpuState}
        onChange={handleBLPUStateChange}
      />
      <ADSMultipleSelectControl
        label="RPC"
        isEditable
        indicateChange={rpcChanged}
        lookupData={RepresentativePointCode}
        lookupId="id"
        lookupLabel={GetLookupLabel(settingsContext.isScottish)}
        lookupColour="colour"
        lookupDefault="default"
        value={rpc}
        onChange={handleRPCChange}
      />
      {settingsContext.isScottish && (
        <Grid item xs={12}>
          <Divider
            sx={{
              mt: theme.spacing(1),
            }}
          />
        </Grid>
      )}
      <ADSMultipleSelectControl
        label="Classification"
        isEditable
        useRounded
        indicateChange={classificationChanged}
        lookupData={settingsContext.isScottish ? OSGClassification : BLPUClassification}
        lookupId="id"
        lookupLabel="lookup"
        lookupColour="colour"
        displayLabel="display"
        value={classification}
        onChange={handleClassificationChange}
      />
      <Grid item xs={12}>
        <Divider
          sx={{
            mt: theme.spacing(1),
          }}
        />
      </Grid>
      <ADSMultipleSelectControl
        label="LPI status"
        isEditable
        indicateChange={lpiLogicalStatusChanged}
        lookupData={LPILogicalStatus}
        lookupId="id"
        lookupLabel={GetLookupLabel(settingsContext.isScottish)}
        lookupColour="colour"
        lookupDefault="default"
        value={lpiLogicalStatus}
        onChange={handleLPILogicalStatusChange}
      />
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

export default FilterPropertiesTab;
