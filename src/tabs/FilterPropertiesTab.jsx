//#region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Properties filter tab
//
//  Copyright:    © 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//#region Version 1.0.0.0
//    001   07.07.21 Sean Flook          WI39??? Initial Revision.
//    002   22.09.23 Sean Flook                  Changes required to handle Scottish classifications.
//    003   05.01.24 Sean Flook                  Use CSS shortcuts.
//#endregion Version 1.0.0.0
//#region Version 1.0.2.0
//    004   12.11.24 Sean Flook                  Various changes to improve the look and functionality.
//#endregion Version 1.0.2.0
//#region Version 1.0.5.0
//    005   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//#endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//#endregion header

//#region imports

import React, { useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

import SettingsContext from "../context/settingsContext";

import { Box, Divider, Grid2 } from "@mui/material";
import ADSMultipleSelectControl from "../components/ADSMultipleSelectControl";
import ADSFilterDateControl from "../components/ADSFilterDateControl";

import { GetLookupLabel } from "../utils/HelperUtils";

import BLPULogicalStatus from "../data/BLPULogicalStatus";
import BLPUState from "../data/BLPUState";
import RepresentativePointCode from "../data/RepresentativePointCode";
import BLPUClassification from "../data/BLPUClassification";
import OSGClassification from "../data/OSGClassification";
import LPILogicalStatus from "../data/LPILogicalStatus";

import { useTheme } from "@mui/styles";

FilterPropertiesTab.propTypes = {
  changedFlags: PropTypes.object.isRequired,
  selectedData: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

//#endregion imports

function FilterPropertiesTab({ changedFlags, selectedData, onChange }) {
  const theme = useTheme();

  const settingsContext = useContext(SettingsContext);

  const [blpuLogicalStatus, setBlpuLogicalStatus] = useState(
    BLPULogicalStatus.filter((x) => x.default).map((a) => a[GetLookupLabel(settingsContext.isScottish)])
  );
  const [blpuState, setBlpuState] = useState(
    BLPUState.filter((x) => x.default).map((a) => a[GetLookupLabel(settingsContext.isScottish)])
  );
  const [rpc, setRpc] = useState(
    RepresentativePointCode.filter((x) => x.default).map((a) => a[GetLookupLabel(settingsContext.isScottish)])
  );
  const [classification, setClassification] = useState([]);
  const [lpiLogicalStatus, setLpiLogicalStatus] = useState(
    LPILogicalStatus.filter((x) => x.default).map((a) => a[GetLookupLabel(settingsContext.isScottish)])
  );
  const [lastUpdated, setLastUpdated] = useState({});
  const [startDate, setStartDate] = useState({});

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
    const idSortedData = BLPULogicalStatus.filter((x) =>
      newValue.includes(x[`${GetLookupLabel(settingsContext.isScottish)}`])
    )
      .sort((a, b) => a.id - b.id)
      .map((x) => x[`${GetLookupLabel(settingsContext.isScottish)}`]);
    const newValueSorted = newValue.slice().sort();
    const filterChanged = !(
      defaultBLPULogicalStatus.length === newValueSorted.length &&
      defaultBLPULogicalStatus.every(function (value, index) {
        return value === newValueSorted[index];
      })
    );

    if (onChange) {
      onChange(
        {
          blpuLogicalStatus: idSortedData,
          blpuState: blpuState,
          rpc: rpc,
          classification: classification,
          lpiLogicalStatus: lpiLogicalStatus,
          lastUpdated: lastUpdated,
          startDate: startDate,
        },
        {
          blpuLogicalStatus: filterChanged,
          blpuState: blpuStateChanged,
          rpc: rpcChanged,
          classification: classificationChanged,
          lpiLogicalStatus: lpiLogicalStatusChanged,
          lastUpdated: lastUpdatedChanged,
          startDate: startDateChanged,
        }
      );
    }
  };

  /**
   * Event to handle when the list of selected BLPU states are changed.
   *
   * @param {Array} newValue The list of BLPU states.
   */
  const handleBLPUStateChange = (newValue) => {
    const idSortedData = BLPUState.filter((x) => newValue.includes(x[`${GetLookupLabel(settingsContext.isScottish)}`]))
      .sort((a, b) => a.id - b.id)
      .map((x) => x[`${GetLookupLabel(settingsContext.isScottish)}`]);
    const newValueSorted = newValue.slice().sort();
    const filterChanged = !(
      defaultBLPUState.length === newValueSorted.length &&
      defaultBLPUState.every(function (value, index) {
        return value === newValueSorted[index];
      })
    );

    if (onChange) {
      onChange(
        {
          blpuLogicalStatus: blpuLogicalStatus,
          blpuState: idSortedData,
          rpc: rpc,
          classification: classification,
          lpiLogicalStatus: lpiLogicalStatus,
          lastUpdated: lastUpdated,
          startDate: startDate,
        },
        {
          blpuLogicalStatus: blpuLogicalStatusChanged,
          blpuState: filterChanged,
          rpc: rpcChanged,
          classification: classificationChanged,
          lpiLogicalStatus: lpiLogicalStatusChanged,
          lastUpdated: lastUpdatedChanged,
          startDate: startDateChanged,
        }
      );
    }
  };

  /**
   * Event to handle when the list of selected RPCs are changed.
   *
   * @param {Array} newValue The list of RPCs.
   */
  const handleRPCChange = (newValue) => {
    const idSortedData = RepresentativePointCode.filter((x) =>
      newValue.includes(x[`${GetLookupLabel(settingsContext.isScottish)}`])
    )
      .sort((a, b) => a.id - b.id)
      .map((x) => x[`${GetLookupLabel(settingsContext.isScottish)}`]);
    const newValueSorted = newValue.slice().sort();
    const filterChanged = !(
      defaultRPC.length === newValueSorted.length &&
      defaultRPC.every(function (value, index) {
        return value === newValueSorted[index];
      })
    );

    if (onChange) {
      onChange(
        {
          blpuLogicalStatus: blpuLogicalStatus,
          blpuState: blpuState,
          rpc: idSortedData,
          classification: classification,
          lpiLogicalStatus: lpiLogicalStatus,
          lastUpdated: lastUpdated,
          startDate: startDate,
        },
        {
          blpuLogicalStatus: blpuLogicalStatusChanged,
          blpuState: blpuStateChanged,
          rpc: filterChanged,
          classification: classificationChanged,
          lpiLogicalStatus: lpiLogicalStatusChanged,
          lastUpdated: lastUpdatedChanged,
          startDate: startDateChanged,
        }
      );
    }
  };

  /**
   * Event to handle when the list of selected classifications are changed.
   *
   * @param {Array} newValue The list of classifications.
   */
  const handleClassificationChange = (newValue) => {
    const idSortedData = settingsContext.isScottish
      ? OSGClassification.filter((x) => newValue.includes(`${x.id} - ${x.lookup}`))
          .sort((a, b) => a.id - b.id)
          .map((x) => `${x.id} - ${x.lookup}`)
      : BLPUClassification.filter((x) => newValue.includes(`${x.id} - ${x.lookup}`))
          .sort((a, b) => a.id - b.id)
          .map((x) => `${x.id} - ${x.lookup}`);
    const filterChanged = newValue && newValue.length > 0;

    if (onChange) {
      onChange(
        {
          blpuLogicalStatus: blpuLogicalStatus,
          blpuState: blpuState,
          rpc: rpc,
          classification: idSortedData,
          lpiLogicalStatus: lpiLogicalStatus,
          lastUpdated: lastUpdated,
          startDate: startDate,
        },
        {
          blpuLogicalStatus: blpuLogicalStatusChanged,
          blpuState: blpuStateChanged,
          rpc: rpcChanged,
          classification: filterChanged,
          lpiLogicalStatus: lpiLogicalStatusChanged,
          lastUpdated: lastUpdatedChanged,
          startDate: startDateChanged,
        }
      );
    }
  };

  /**
   * Event to handle when the list of selected LPI logical statuses are changed.
   *
   * @param {Array} newValue The list of LPI logical statuses.
   */
  const handleLPILogicalStatusChange = (newValue) => {
    const idSortedData = LPILogicalStatus.filter((x) =>
      newValue.includes(x[`${GetLookupLabel(settingsContext.isScottish)}`])
    )
      .sort((a, b) => a.id - b.id)
      .map((x) => x[`${GetLookupLabel(settingsContext.isScottish)}`]);
    const newValueSorted = newValue.slice().sort();
    const filterChanged = !(
      defaultLPILogicalStatus.length === newValueSorted.length &&
      defaultLPILogicalStatus.every(function (value, index) {
        return value === newValueSorted[index];
      })
    );

    if (onChange) {
      onChange(
        {
          blpuLogicalStatus: blpuLogicalStatus,
          blpuState: blpuState,
          rpc: rpc,
          classification: classification,
          lpiLogicalStatus: idSortedData,
          lastUpdated: lastUpdated,
          startDate: startDate,
        },
        {
          blpuLogicalStatus: blpuLogicalStatusChanged,
          blpuState: blpuStateChanged,
          rpc: rpcChanged,
          classification: classificationChanged,
          lpiLogicalStatus: filterChanged,
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
          blpuLogicalStatus: blpuLogicalStatus,
          blpuState: blpuState,
          rpc: rpc,
          classification: classification,
          lpiLogicalStatus: lpiLogicalStatus,
          lastUpdated: newValue,
          startDate: startDate,
        },
        {
          blpuLogicalStatus: blpuLogicalStatusChanged,
          blpuState: blpuStateChanged,
          rpc: rpcChanged,
          classification: classificationChanged,
          lpiLogicalStatus: lpiLogicalStatusChanged,
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
          blpuLogicalStatus: blpuLogicalStatus,
          blpuState: blpuState,
          rpc: rpc,
          classification: classification,
          lpiLogicalStatus: lpiLogicalStatus,
          lastUpdated: lastUpdated,
          startDate: newValue,
        },
        {
          blpuLogicalStatus: blpuLogicalStatusChanged,
          blpuState: blpuStateChanged,
          rpc: rpcChanged,
          classification: classificationChanged,
          lpiLogicalStatus: lpiLogicalStatusChanged,
          lastUpdated: lastUpdatedChanged,
          startDate: filterChanged,
        }
      );
    }
  };

  useEffect(() => {
    if (changedFlags) {
      setBLPULogicalStatusChanged(changedFlags.blpuLogicalStatus);
      setBLPUStateChanged(changedFlags.blpuState);
      setRPCChanged(changedFlags.rpc);
      setClassificationChanged(changedFlags.classification);
      setLPILogicalStatusChanged(changedFlags.lpiLogicalStatus);
      setLastUpdatedChanged(changedFlags.lastUpdated);
      setStartDateChanged(changedFlags.startDate);
    } else {
      setBLPULogicalStatusChanged(false);
      setBLPUStateChanged(false);
      setRPCChanged(false);
      setClassificationChanged(false);
      setLPILogicalStatusChanged(false);
      setLastUpdatedChanged(false);
      setStartDateChanged(false);
    }
  }, [changedFlags]);

  useEffect(() => {
    if (selectedData) {
      setBlpuLogicalStatus(selectedData.blpuLogicalStatus);
      setBlpuState(selectedData.blpuState);
      setRpc(selectedData.rpc);
      setClassification(selectedData.classification);
      setLpiLogicalStatus(selectedData.lpiLogicalStatus);
      setLastUpdated(selectedData.lastUpdated);
      setStartDate(selectedData.startDate);
    }
  }, [selectedData]);

  return (
    <Box>
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
        <Grid2 size={12}>
          <Divider
            sx={{
              mt: theme.spacing(1),
            }}
          />
        </Grid2>
      )}
      <ADSMultipleSelectControl
        label="Classification"
        isEditable
        isClassification
        useRounded
        indicateChange={classificationChanged}
        lookupData={settingsContext.isScottish ? OSGClassification : BLPUClassification}
        lookupId="id"
        lookupLabel="lookup"
        lookupColour="colour"
        displayLabel="display"
        lookupIcon="useId"
        value={classification}
        onChange={handleClassificationChange}
      />
      <Grid2 size={12}>
        <Divider
          sx={{
            mt: theme.spacing(1),
          }}
        />
      </Grid2>
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

export default FilterPropertiesTab;
