/* #region header */
/**************************************************************************************************
//
//  Description: Height, width & weight restriction data tab
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001            Sean Flook                 Initial Revision.
//    002   06.10.23 Sean Flook                 Ensure the OK button is enabled when creating a new record and use colour variables.
//    003   16.10.23 Sean Flook                 Hide the button for the coordinates.
//    004   27.10.23 Sean Flook                 Use new dataFormStyle and removed start and end coordinates as no longer required.
//    005   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system.
//    006   02.01.24 Sean Flook       IMANN-205 Added end date.
//    007   05.01.24 Sean Flook                 Changes to sort out warnings and use CSS shortcuts.
//    008   11.01.24 Sean Flook                 Fix warnings.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useEffect, Fragment } from "react";
import PropTypes from "prop-types";

import LookupContext from "../context/lookupContext";
import SandboxContext from "../context/sandboxContext";
import UserContext from "../context/userContext";
import MapContext from "./../context/mapContext";

import { GetLookupLabel, ConvertDate } from "../utils/HelperUtils";
import { FilteredSwaOrgRef } from "../utils/StreetUtils";
import ObjectComparison from "../utils/ObjectComparison";

import HWWDesignationCode from "./../data/HWWDesignationCode";

import { Avatar, Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { ArrowDropDown } from "@mui/icons-material";
import ADSActionButton from "../components/ADSActionButton";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSDateControl from "../components/ADSDateControl";
import ADSWholeRoadControl from "../components/ADSWholeRoadControl";
import ADSTextControl from "../components/ADSTextControl";
import ADSNumberControl from "../components/ADSNumberControl";
import ADSOkCancelControl from "../components/ADSOkCancelControl";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";

import { adsWhite, adsBlack, adsMidRed } from "../utils/ADSColours";
import { toolbarStyle, dataFormStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

HWWDataTab.propTypes = {
  data: PropTypes.object,
  errors: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  focusedField: PropTypes.string,
  onDataChanged: PropTypes.func.isRequired,
  onHomeClick: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

function HWWDataTab({ data, errors, loading, focusedField, onDataChanged, onHomeClick, onAdd, onDelete }) {
  const theme = useTheme();

  const lookupContext = useContext(LookupContext);
  const sandboxContext = useContext(SandboxContext);
  const userContext = useContext(UserContext);
  const mapContext = useContext(MapContext);

  const [dataChanged, setDataChanged] = useState(false);

  const [swaOrgRefLookup, setSwaOrgRefLookup] = useState(FilteredSwaOrgRef(false));

  const [restrictionCode, setRestrictionCode] = useState(null);
  const [valueMetric, setValueMetric] = useState(0);
  const [troText, setTroText] = useState("");
  const [featureDescription, setFeatureDescription] = useState("");
  const [source, setSource] = useState("");
  const [organisation, setOrganisation] = useState(null);
  const [district, setDistrict] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [wholeRoad, setWholeRoad] = useState(true);
  const [specificLocation, setSpecificLocation] = useState("");
  const [hwwStartX, setHwwStartX] = useState(0);
  const [hwwStartY, setHwwStartY] = useState(0);
  const [hwwEndX, setHwwEndX] = useState(0);
  const [hwwEndY, setHwwEndY] = useState(0);

  const [userCanEdit, setUserCanEdit] = useState(false);

  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);

  const [restrictionCodeError, setRestrictionCodeError] = useState(null);
  const [valueMetricError, setValueMetricError] = useState(null);
  const [troTextError, setTroTextError] = useState(null);
  const [featureDescriptionError, setFeatureDescriptionError] = useState(null);
  const [sourceError, setSourceError] = useState(null);
  const [organisationError, setOrganisationError] = useState(null);
  const [districtError, setDistrictError] = useState(null);
  const [startDateError, setStartDateError] = useState(null);
  const [endDateError, setEndDateError] = useState(null);
  const [wholeRoadError, setWholeRoadError] = useState(null);
  const [specifyLocationError, setSpecifyLocationError] = useState(null);

  /**
   * Method used to update the current sandbox record.
   *
   * @param {string} field The name of the field that is being updated.
   * @param {string|boolean|Date|number|null} newValue The value used to update the given field.
   */
  const UpdateSandbox = (field, newValue) => {
    const newHeightWidthWeightData = GetCurrentData(field, newValue);
    sandboxContext.onSandboxChange("hww", newHeightWidthWeightData);
  };

  /**
   * Event to handle when the restriction code is changed.
   *
   * @param {number|null} newValue The new restriction code.
   */
  const handleRestrictionCodeChangeEvent = (newValue) => {
    setRestrictionCode(newValue);
    if (!dataChanged) {
      setDataChanged(restrictionCode !== newValue);
      if (onDataChanged && restrictionCode !== newValue) onDataChanged();
    }
    UpdateSandbox("restrictionCode", newValue);
  };

  /**
   * Event to handle when the metric value is changed.
   *
   * @param {number|null} newValue The new metric value.
   */
  const handleValueMetricChangeEvent = (newValue) => {
    setValueMetric(newValue);
    if (!dataChanged) {
      setDataChanged(valueMetric !== newValue);
      if (onDataChanged && valueMetric !== newValue) onDataChanged();
    }
    UpdateSandbox("valueMetric", newValue);
  };

  /**
   * Event to handle when the TRO text is changed.
   *
   * @param {string|null} newValue The new TRO text.
   */
  const handleTroTextChangeEvent = (newValue) => {
    setTroText(newValue);
    if (!dataChanged) {
      setDataChanged(troText !== newValue);
      if (onDataChanged && troText !== newValue) onDataChanged();
    }
    UpdateSandbox("troText", newValue);
  };

  /**
   * Event to handle when the feature description is changed.
   *
   * @param {string|null} newValue The new feature description.
   */
  const handleFeatureDescriptionChangeEvent = (newValue) => {
    setFeatureDescription(newValue);
    if (!dataChanged) {
      setDataChanged(featureDescription !== newValue);
      if (onDataChanged && featureDescription !== newValue) onDataChanged();
    }
    UpdateSandbox("featureDescription", newValue);
  };

  /**
   * Event to handle when the source is changed.
   *
   * @param {string|null} newValue The new source.
   */
  const handleSourceChangeEvent = (newValue) => {
    setSource(newValue);
    if (!dataChanged) {
      setDataChanged(source !== newValue);
      if (onDataChanged && source !== newValue) onDataChanged();
    }
    UpdateSandbox("source", newValue);
  };

  /**
   * Event to handle when the organisation is changed.
   *
   * @param {number|null} newValue The new organisation.
   */
  const handleOrganisationChangeEvent = (newValue) => {
    setOrganisation(newValue);
    if (!dataChanged) {
      setDataChanged(organisation !== newValue);
      if (onDataChanged && organisation !== newValue) onDataChanged();
    }
    UpdateSandbox("organisation", newValue);
  };

  /**
   * Event to handle when the district is changed.
   *
   * @param {number|null} newValue The new district.
   */
  const handleDistrictChangeEvent = (newValue) => {
    setDistrict(newValue);
    if (!dataChanged) {
      setDataChanged(district !== newValue);
      if (onDataChanged && district !== newValue) onDataChanged();
    }
    UpdateSandbox("district", newValue);
  };

  /**
   * Event to handle when the start date is changed.
   *
   * @param {Date|null} newValue The new start date.
   */
  const handleStartDateChangeEvent = (newValue) => {
    setStartDate(newValue);
    if (!dataChanged) {
      setDataChanged(startDate !== newValue);
      if (onDataChanged && startDate !== newValue) onDataChanged();
    }
    UpdateSandbox("startDate", newValue);
  };

  /**
   * Event to handle when the end date is changed.
   *
   * @param {Date|null} newValue The new end date.
   */
  const handleEndDateChangeEvent = (newValue) => {
    setEndDate(newValue);
    if (!dataChanged) {
      setDataChanged(endDate !== newValue);
      if (onDataChanged && endDate !== newValue) onDataChanged();
    }
    UpdateSandbox("endDate", newValue);
  };

  /**
   * Event to handle when the whole road flag is changed.
   *
   * @param {boolean} newValue The new whole road flag.
   */
  const handleWholeRoadChangeEvent = (newValue) => {
    setWholeRoad(newValue);
    if (!dataChanged) {
      setDataChanged(wholeRoad !== newValue);
      if (onDataChanged && wholeRoad !== newValue) onDataChanged();
    }
    UpdateSandbox("wholeRoad", newValue);
    if (newValue) mapContext.onEditMapObject(null, null);
    else mapContext.onEditMapObject(64, data && data.hwwData && data.hwwData.pkId);
  };

  /**
   * Event to handle when the specific location is changed.
   *
   * @param {string|null} newValue The new specific location.
   */
  const handleSpecifyLocationChangeEvent = (newValue) => {
    setSpecificLocation(newValue);
    if (!dataChanged) {
      setDataChanged(specificLocation !== newValue);
      if (onDataChanged && specificLocation !== newValue) onDataChanged();
    }
    UpdateSandbox("specificLocation", newValue);
  };

  /**
   * Event to handle when the home button is clicked.
   */
  const handleHomeClick = () => {
    const sourceHeightWidthWeight =
      data.pkId > 0 && sandboxContext.currentSandbox.sourceStreet
        ? sandboxContext.currentSandbox.sourceStreet.heightWidthWeights.find((x) => x.pkId === data.pkId)
        : null;

    if (onHomeClick)
      setDataChanged(
        onHomeClick(
          dataChanged ? (sandboxContext.currentSandbox.currentStreetRecords.hww ? "check" : "discard") : "discard",
          sourceHeightWidthWeight,
          sandboxContext.currentSandbox.currentStreetRecords.hww
        )
      );
  };

  /**
   * Event to handle when the OK button is clicked.
   */
  const handleOkClicked = () => {
    if (onHomeClick) setDataChanged(onHomeClick("save", null, sandboxContext.currentSandbox.currentStreetRecords.hww));
  };

  /**
   * Event to handle when the Cancel button is clicked.
   */
  const handleCancelClicked = () => {
    if (dataChanged) {
      if (data && data.hwwData) {
        setRestrictionCode(data.hwwData.hwwRestrictionCode);
        setValueMetric(data.hwwData.valueMetric ? data.hwwData.valueMetric : 0);
        setTroText(data.hwwData.troText ? data.hwwData.troText : "");
        setFeatureDescription(data.hwwData.featureDescription ? data.hwwData.featureDescription : "");
        setSource(data.hwwData.sourceText ? data.hwwData.sourceText : "");
        setOrganisation(data.hwwData.swaOrgRefConsultant);
        setDistrict(data.hwwData.districtRefConsultant);
        setStartDate(data.hwwData.recordStartDate);
        setEndDate(data.hwwData.recordEndDate);
        setWholeRoad(data.hwwData.wholeRoad ? data.hwwData.wholeRoad : true);
        setSpecificLocation(data.hwwData.specificLocation ? data.hwwData.specificLocation : "");
        setHwwStartX(data.hwwData.hwwStartX ? data.hwwData.hwwStartX : 0);
        setHwwStartY(data.hwwData.hwwStartY ? data.hwwData.hwwStartY : 0);
        setHwwEndX(data.hwwData.hwwEndX ? data.hwwData.hwwEndX : 0);
        setHwwEndY(data.hwwData.hwwEndY ? data.hwwData.hwwEndY : 0);
      }
    }
    setDataChanged(false);
    if (onHomeClick) onHomeClick("discard", data.hwwData, null);
  };

  /**
   * Method to return the current height, width & weight record.
   *
   * @param {string} field The name of the field that is being updated.
   * @param {string|boolean|Date|number|null} newValue The value used to update the given field.
   * @returns {object} The current height, width & weight record.
   */
  function GetCurrentData(field, newValue) {
    return {
      changeType: field && field === "changeType" ? newValue : !data.hwwData.pkId || data.hwwData.pkId < 0 ? "I" : "U",
      usrn: data.hwwData.usrn,
      seqNum: data.hwwData.seqNum,
      wholeRoad: field && field === "wholeRoad" ? newValue : wholeRoad,
      specificLocation: field && field === "specificLocation" ? newValue : specificLocation,
      neverExport: data.hwwData.neverExport,
      hwwRestrictionCode: field && field === "restrictionCode" ? newValue : restrictionCode,
      recordStartDate:
        field && field === "startDate" ? newValue && ConvertDate(newValue) : startDate && ConvertDate(startDate),
      recordEndDate: field && field === "endDate" ? newValue && ConvertDate(newValue) : endDate && ConvertDate(endDate),
      asdCoordinate: data.hwwData.asdCoordinate,
      asdCoordinateCount: data.hwwData.asdCoordinateCount,
      hwwStartX: field && field === "hwwStartX" ? newValue : hwwStartX,
      hwwStartY: field && field === "hwwStartY" ? newValue : hwwStartY,
      hwwEndX: field && field === "hwwEndX" ? newValue : hwwEndX,
      hwwEndY: field && field === "hwwEndY" ? newValue : hwwEndY,
      valueMetric: field && field === "valueMetric" ? newValue : valueMetric,
      troText: field && field === "troText" ? newValue : troText,
      featureDescription: field && field === "featureDescription" ? newValue : featureDescription,
      sourceText: field && field === "source" ? newValue : source,
      swaOrgRefConsultant: field && field === "organisation" ? newValue : organisation,
      districtRefConsultant: field && field === "district" ? newValue : district,
      wktGeometry: data.hwwData.wktGeometry,
      pkId: data.hwwData.pkId,
      entryDate: data.hwwData.entryDate,
      lastUpdateDate: data.hwwData.lastUpdateDate,
    };
  }

  /**
   * Event to handle when the add height, width & weight button is clicked.
   */
  const handleAddHWW = () => {
    if (onAdd) onAdd();
    if (!dataChanged) setDataChanged(true);
  };

  /**
   * Event to handle when the delete height, width & weight button is clicked.
   */
  const handleDeleteHWW = () => {
    setOpenDeleteConfirmation(true);
  };

  /**
   * Event to handle when the delete confirmation dialog is closed.
   *
   * @param {boolean} deleteConfirmed True if the user has confirmed the deletion; otherwise false.
   */
  const handleCloseDeleteConfirmation = (deleteConfirmed) => {
    setOpenDeleteConfirmation(false);
    const pkId = data && data.pkId ? data.pkId : -1;

    if (deleteConfirmed && pkId && pkId > 0) {
      const currentData = GetCurrentData("changeType", "D");
      if (onHomeClick) onHomeClick("save", null, currentData);
      if (onDelete) onDelete(pkId);
    }
  };

  useEffect(() => {
    if (!loading && data && data.hwwData) {
      setRestrictionCode(data.hwwData.hwwRestrictionCode);
      setValueMetric(data.hwwData.valueMetric ? data.hwwData.valueMetric : 0);
      setTroText(data.hwwData.troText ? data.hwwData.troText : "");
      setFeatureDescription(data.hwwData.featureDescription ? data.hwwData.featureDescription : "");
      setSource(data.hwwData.sourceText ? data.hwwData.sourceText : "");
      setOrganisation(data.hwwData.swaOrgRefConsultant);
      setDistrict(data.hwwData.districtRefConsultant);
      setStartDate(data.hwwData.recordStartDate);
      setEndDate(data.hwwData.recordEndDate);
      setWholeRoad(data.hwwData.wholeRoad ? data.hwwData.wholeRoad : true);
      setSpecificLocation(data.hwwData.specificLocation ? data.hwwData.specificLocation : "");
      setHwwStartX(data.hwwData.hwwStartX ? data.hwwData.hwwStartX : 0);
      setHwwStartY(data.hwwData.hwwStartY ? data.hwwData.hwwStartY : 0);
      setHwwEndX(data.hwwData.hwwEndX ? data.hwwData.hwwEndX : 0);
      setHwwEndY(data.hwwData.hwwEndY ? data.hwwData.hwwEndY : 0);

      setSwaOrgRefLookup(FilteredSwaOrgRef(false));
    }
  }, [loading, data]);

  useEffect(() => {
    if (sandboxContext.currentSandbox.sourceStreet && data && data.hwwData) {
      const sourceHWW = sandboxContext.currentSandbox.sourceStreet.heightWidthWeights.find((x) => x.pkId === data.id);

      if (sourceHWW) {
        setDataChanged(
          !ObjectComparison(sourceHWW, data.hwwData, [
            "changeType",
            "neverExport",
            "endDate",
            "lastUpdateDate",
            "lastUpdated",
            "lastUser",
          ])
        );
      } else if (data.pkId < 0) setDataChanged(true);
    }
  }, [sandboxContext.currentSandbox.sourceStreet, data]);

  useEffect(() => {
    setUserCanEdit(userContext.currentUser && userContext.currentUser.canEdit);
  }, [userContext]);

  useEffect(() => {
    setRestrictionCodeError(null);
    setValueMetricError(null);
    setTroTextError(null);
    setFeatureDescriptionError(null);
    setSourceError(null);
    setOrganisationError(null);
    setDistrictError(null);
    setStartDateError(null);
    setEndDateError(null);
    setWholeRoadError(null);
    setSpecifyLocationError(null);

    if (errors && errors.length > 0) {
      for (const error of errors) {
        switch (error.field.toLowerCase()) {
          case "hwwrestrictioncode":
            setRestrictionCodeError(error.errors);
            break;

          case "valuemetric":
            setValueMetricError(error.errors);
            break;

          case "trotext":
            setTroTextError(error.errors);
            break;

          case "featuredescription":
            setTroTextError(error.errors);
            break;

          case "sourcetext":
            setSourceError(error.errors);
            break;

          case "swaorgrefconsultant":
            setOrganisationError(error.errors);
            break;

          case "districtrefconsultant":
            setOrganisationError(error.errors);
            break;

          case "recordstartdate":
            setStartDateError(error.errors);
            break;

          case "recordenddate":
            setEndDateError(error.errors);
            break;

          case "wholeroad":
            setWholeRoadError(error.errors);
            break;

          case "specificlocation":
            setSpecifyLocationError(error.errors);
            break;

          default:
            break;
        }
      }
    }
  }, [errors]);

  return (
    <Fragment>
      <Box sx={toolbarStyle}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
            <ADSActionButton variant="home" tooltipTitle="Home" tooltipPlacement="bottom" onClick={handleHomeClick} />
            <Typography
              sx={{
                flexGrow: 1,
                display: "none",
                [theme.breakpoints.up("sm")]: {
                  display: "block",
                },
              }}
              variant="subtitle1"
              noWrap
              align="left"
            >
              |
            </Typography>
            <Avatar
              variant="circular"
              sx={{
                height: theme.spacing(2),
                width: theme.spacing(2),
                color: adsBlack,
                backgroundColor: adsWhite,
                borderStyle: "solid",
                borderWidth: "1px",
                borderColor: `${adsMidRed} !important`,
              }}
            >
              <ArrowDropDown
                sx={{
                  height: theme.spacing(2),
                  width: theme.spacing(2),
                }}
              />
            </Avatar>
            <Typography
              sx={{
                flexGrow: 1,
                display: "none",
                [theme.breakpoints.up("sm")]: {
                  display: "block",
                },
              }}
              variant="subtitle1"
              noWrap
              align="left"
            >
              {` Height, width and weight restriction (${data.index + 1} of ${data.totalRecords})`}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="flex-end">
            <ADSActionButton
              variant="delete"
              disabled={!userCanEdit}
              tooltipTitle="Delete height, width and weight restriction record"
              tooltipPlacement="right"
              onClick={handleDeleteHWW}
            />
            <ADSActionButton
              variant="add"
              disabled={!userCanEdit}
              tooltipTitle="Add new height, width and weight restriction record"
              tooltipPlacement="right"
              onClick={handleAddHWW}
            />
          </Stack>
        </Stack>
      </Box>
      <Box sx={dataFormStyle("77.7vh")}>
        <ADSSelectControl
          label="Type"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "HwwRestrictionCode" : false}
          loading={loading}
          useRounded
          doNotSetTitleCase
          lookupData={HWWDesignationCode}
          lookupId="id"
          lookupLabel={GetLookupLabel(false)}
          lookupColour="colour"
          value={restrictionCode}
          errorText={restrictionCodeError}
          onChange={handleRestrictionCodeChangeEvent}
          helperText="The type of restriction that the Record applies to."
        />
        <ADSNumberControl
          label="Value"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "ValueMetric" : false}
          loading={loading}
          value={valueMetric}
          errorText={valueMetricError}
          helperText="Value in metric for the HWW Restriction. Metres or tonnes."
          onChange={handleValueMetricChangeEvent}
        />
        <ADSTextControl
          label="TRO"
          isEditable={userCanEdit}
          isFocused={focusedField ? focusedField === "TroText" : false}
          loading={loading}
          value={troText}
          maxLength={250}
          minLines={3}
          maxLines={5}
          id="hww-tro-text"
          errorText={troTextError}
          helperText="Official TRO reference followed by a summary of wording of the restriction if it is the result of a TRO. This should include the imperial value of the restriction if specified in the TRO."
          onChange={handleTroTextChangeEvent}
        />
        <ADSTextControl
          label="Description"
          isEditable={userCanEdit}
          isFocused={focusedField ? focusedField === "FeatureDescription" : false}
          loading={loading}
          value={featureDescription}
          maxLength={250}
          minLines={3}
          maxLines={5}
          id="hww-description"
          errorText={featureDescriptionError}
          helperText="Description providing additional information."
          onChange={handleFeatureDescriptionChangeEvent}
        />
        <ADSTextControl
          label="Source"
          isEditable={userCanEdit}
          isFocused={focusedField ? focusedField === "SourceText" : false}
          loading={loading}
          value={source}
          maxLength={120}
          minLines={3}
          maxLines={5}
          id="hww-source"
          errorText={sourceError}
          helperText="A brief textual summary of the department/function and/or organisation that is the source of this data."
          onChange={handleSourceChangeEvent}
        />
        <ADSSelectControl
          label="Organisation"
          isEditable={userCanEdit}
          isRequired={district}
          isFocused={focusedField ? focusedField === "SwaOrgRefConsultant" : false}
          loading={loading}
          useRounded
          doNotSetTitleCase
          lookupData={swaOrgRefLookup}
          lookupId="id"
          lookupLabel={GetLookupLabel(false)}
          lookupColour="colour"
          value={organisation}
          errorText={organisationError}
          onChange={handleOrganisationChangeEvent}
          helperText="Code to identify the Street Authority which must be consulted about the HWW Restriction."
        />
        <ADSSelectControl
          label="District"
          isEditable={userCanEdit}
          isRequired={organisation}
          isFocused={focusedField ? focusedField === "DistrictRefConsultant" : false}
          loading={loading}
          useRounded
          includeHistoric
          lookupData={lookupContext.currentLookups.operationalDistricts}
          lookupId="districtId"
          lookupLabel="districtName"
          value={district}
          errorText={districtError}
          onChange={handleDistrictChangeEvent}
          helperText="Code to identify the Operational District for the Street Authority which must be consulted about the HWW Restriction."
        />
        <ADSDateControl
          label="Start date"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "RecordStartDate" : false}
          loading={loading}
          value={startDate}
          helperText="Date when the HWW Restriction came into effect."
          errorText={startDateError}
          onChange={handleStartDateChangeEvent}
        />
        <ADSDateControl
          label="End date"
          isEditable={userCanEdit}
          isFocused={focusedField ? focusedField === "RecordEndDate" : false}
          loading={loading}
          value={endDate}
          helperText="Date when the Record ends."
          errorText={endDateError}
          onChange={handleEndDateChangeEvent}
        />
        <ADSWholeRoadControl
          label="Applied to"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "WholeRoad" : false}
          loading={loading}
          value={wholeRoad}
          helperText="Indicator as to whether the HWW Restriction applies to the Whole Road."
          errorText={wholeRoadError}
          onChange={handleWholeRoadChangeEvent}
        />
        {!wholeRoad && (
          <ADSTextControl
            label="Specify location"
            isEditable={userCanEdit}
            isRequired
            isFocused={focusedField ? focusedField === "SpecificLocation" : false}
            loading={loading}
            value={specificLocation}
            maxLength={250}
            minLines={3}
            maxLines={5}
            id="construction-specify-location"
            errorText={specifyLocationError}
            helperText="Description of the location of the HWW Restriction within the Street."
            onChange={handleSpecifyLocationChangeEvent}
          />
        )}
        <ADSOkCancelControl
          okDisabled={!dataChanged}
          onOkClicked={handleOkClicked}
          onCancelClicked={handleCancelClicked}
        />
      </Box>
      <div>
        <ConfirmDeleteDialog variant="hww" open={openDeleteConfirmation} onClose={handleCloseDeleteConfirmation} />
      </div>
    </Fragment>
  );
}

export default HWWDataTab;
