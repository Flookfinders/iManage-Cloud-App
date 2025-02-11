//#region header
//--------------------------------------------------------------------------------------------------
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
//#region Version 1.0.0.0
//    001            Sean Flook                 Initial Revision.
//    002   06.10.23 Sean Flook                 Ensure the OK button is enabled when creating a new record and use colour variables.
//    003   16.10.23 Sean Flook                 Hide the button for the coordinates.
//    004   27.10.23 Sean Flook                 Use new dataFormStyle and removed start and end coordinates as no longer required.
//    005   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system.
//    006   02.01.24 Sean Flook       IMANN-205 Added end date.
//    007   05.01.24 Sean Flook                 Changes to sort out warnings and use CSS shortcuts.
//    008   11.01.24 Sean Flook                 Fix warnings.
//    009   16.01.24 Sean Flook                 Changes required to fix warnings.
//    010   23.01.24 Sean Flook       IMANN-246 Display information when selecting Part Road.
//    011   25.01.24 Sean Flook       IMANN-250 No need to default wholeRoad.
//    012   29.01.24 Sean Flook       IMANN-252 Restrict the characters that can be used in text fields.
//    013   05.02.24 Sean Flook                 Filter available districts by the organisation.
//    014   07.02.24 Sean Flook                 Display a warning dialog when changing from Part Road to Whole Road.
//    015   13.02.24 Sean Flook                 Set the ADSWholeRoadControl variant.
//    016   20.02.24 Joel Benford     IMANN-299 Toolbar changes
//    017   07.03.24 Sean Flook       IMANN-348 Changes required to ensure the OK button is correctly enabled and removed redundant code.
//    018   11.03.24 Sean Flook           GLB12 Adjusted height to remove gap.
//    019   13.03.24 Joshua McCormick IMANN-280 Added dataTabToolBar for inner toolbar styling
//    020   22.03.24 Sean Flook           GLB12 Changed to use dataFormStyle so height can be correctly set.
//    021   27.03.24 Sean Flook                 Clear specific location if going back to whole road.
//    022   18.06.24 Sean Flook       IMANN-595 Update the correct state variable for Feature description errors.
//    023   20.06.24 Sean Flook       IMANN-636 Use the new user rights.
//    024   26.07.24 Sean Flook       IMANN-856 Correctly handle deleting newly added record.
//#endregion Version 1.0.0.0
//
//--------------------------------------------------------------------------------------------------
//#endregion header

import React, { useContext, useState, useEffect, Fragment } from "react";
import PropTypes from "prop-types";

import LookupContext from "../context/lookupContext";
import SandboxContext from "../context/sandboxContext";
import UserContext from "../context/userContext";
import MapContext from "./../context/mapContext";
import InformationContext from "../context/informationContext";
import StreetContext from "../context/streetContext";

import { GetLookupLabel, ConvertDate, filteredLookup } from "../utils/HelperUtils";
import { filteredOperationalDistricts } from "../utils/StreetUtils";
import ObjectComparison, { heightWidthWeightKeysToIgnore } from "../utils/ObjectComparison";

import SwaOrgRef from "../data/SwaOrgRef";
import HWWDesignationCode from "./../data/HWWDesignationCode";

import { Avatar, Typography, Popper } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { ArrowDropDown } from "@mui/icons-material";
import ADSActionButton from "../components/ADSActionButton";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSDateControl from "../components/ADSDateControl";
import ADSWholeRoadControl from "../components/ADSWholeRoadControl";
import ADSTextControl from "../components/ADSTextControl";
import ADSNumberControl from "../components/ADSNumberControl";
import ADSOkCancelControl from "../components/ADSOkCancelControl";
import ADSInformationControl from "../components/ADSInformationControl";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";
import MessageDialog from "../dialogs/MessageDialog";

import { adsWhite, adsBlack, adsMidRed } from "../utils/ADSColours";
import { toolbarStyle, dataTabToolBar, dataFormStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

HWWDataTab.propTypes = {
  data: PropTypes.object,
  errors: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  focusedField: PropTypes.string,
  onHomeClick: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

function HWWDataTab({ data, errors, loading, focusedField, onHomeClick, onAdd, onDelete }) {
  const theme = useTheme();

  const lookupContext = useContext(LookupContext);
  const sandboxContext = useContext(SandboxContext);
  const userContext = useContext(UserContext);
  const mapContext = useContext(MapContext);
  const informationContext = useContext(InformationContext);
  const streetContext = useContext(StreetContext);

  const [dataChanged, setDataChanged] = useState(false);

  const [swaOrgRefLookup, setSwaOrgRefLookup] = useState(filteredLookup(SwaOrgRef, false));

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
  const [showWholeRoadWarning, setShowWholeRoadWarning] = useState(false);

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

  const [informationAnchorEl, setInformationAnchorEl] = useState(null);
  const informationOpen = Boolean(informationAnchorEl);
  const informationId = informationOpen ? "asd-information-popper" : undefined;

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
    UpdateSandbox("restrictionCode", newValue);
  };

  /**
   * Event to handle when the metric value is changed.
   *
   * @param {number|null} newValue The new metric value.
   */
  const handleValueMetricChangeEvent = (newValue) => {
    setValueMetric(newValue);
    UpdateSandbox("valueMetric", newValue);
  };

  /**
   * Event to handle when the TRO text is changed.
   *
   * @param {string|null} newValue The new TRO text.
   */
  const handleTroTextChangeEvent = (newValue) => {
    setTroText(newValue);
    UpdateSandbox("troText", newValue);
  };

  /**
   * Event to handle when the feature description is changed.
   *
   * @param {string|null} newValue The new feature description.
   */
  const handleFeatureDescriptionChangeEvent = (newValue) => {
    setFeatureDescription(newValue);
    UpdateSandbox("featureDescription", newValue);
  };

  /**
   * Event to handle when the source is changed.
   *
   * @param {string|null} newValue The new source.
   */
  const handleSourceChangeEvent = (newValue) => {
    setSource(newValue);
    UpdateSandbox("source", newValue);
  };

  /**
   * Event to handle when the organisation is changed.
   *
   * @param {number|null} newValue The new organisation.
   */
  const handleOrganisationChangeEvent = (newValue) => {
    setOrganisation(newValue);
    UpdateSandbox("organisation", newValue);
  };

  /**
   * Event to handle when the district is changed.
   *
   * @param {number|null} newValue The new district.
   */
  const handleDistrictChangeEvent = (newValue) => {
    setDistrict(newValue);
    UpdateSandbox("district", newValue);
  };

  /**
   * Event to handle when the start date is changed.
   *
   * @param {Date|null} newValue The new start date.
   */
  const handleStartDateChangeEvent = (newValue) => {
    setStartDate(newValue);
    UpdateSandbox("startDate", newValue);
  };

  /**
   * Event to handle when the end date is changed.
   *
   * @param {Date|null} newValue The new end date.
   */
  const handleEndDateChangeEvent = (newValue) => {
    setEndDate(newValue);
    UpdateSandbox("endDate", newValue);
  };

  /**
   * Event to handle when the whole road flag is changed.
   *
   * @param {boolean} newValue The new whole road flag.
   */
  const handleWholeRoadChangeEvent = (newValue) => {
    if (newValue && !wholeRoad) {
      setShowWholeRoadWarning(true);
    } else {
      setWholeRoad(newValue);
      UpdateSandbox("wholeRoad", newValue);
      if (newValue) {
        mapContext.onEditMapObject(null, null);
        informationContext.onClearInformation();
      } else {
        mapContext.onEditMapObject(64, data && data.hwwData && data.hwwData.pkId);
        informationContext.onDisplayInformation("partRoadASD", "HWWDataTab");
      }
    }
  };

  /**
   * Event to handle when the specific location is changed.
   *
   * @param {string|null} newValue The new specific location.
   */
  const handleSpecifyLocationChangeEvent = (newValue) => {
    setSpecificLocation(newValue);
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
      onHomeClick(
        dataChanged ? (sandboxContext.currentSandbox.currentStreetRecords.hww ? "check" : "discard") : "discard",
        sourceHeightWidthWeight,
        sandboxContext.currentSandbox.currentStreetRecords.hww
      );
  };

  /**
   * Event to handle when the OK button is clicked.
   */
  const handleOkClicked = () => {
    if (onHomeClick) onHomeClick("save", null, sandboxContext.currentSandbox.currentStreetRecords.hww);
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
        setWholeRoad(data.hwwData.wholeRoad);
        setSpecificLocation(data.hwwData.specificLocation ? data.hwwData.specificLocation : "");
        setHwwStartX(data.hwwData.hwwStartX ? data.hwwData.hwwStartX : 0);
        setHwwStartY(data.hwwData.hwwStartY ? data.hwwData.hwwStartY : 0);
        setHwwEndX(data.hwwData.hwwEndX ? data.hwwData.hwwEndX : 0);
        setHwwEndY(data.hwwData.hwwEndY ? data.hwwData.hwwEndY : 0);
      }
    }
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
      specificLocation:
        field && field === "specificLocation"
          ? newValue
          : field && field === "wholeRoad" && newValue
          ? ""
          : specificLocation,
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

    if (deleteConfirmed && pkId) {
      const currentData = GetCurrentData("changeType", "D");
      if (onHomeClick) onHomeClick("save", null, currentData);
      if (onDelete) onDelete(pkId);
    }
  };

  /**
   * Event to handle when the message dialog is closed.
   *
   * @param {string} action The action taken from the message dialog.
   */
  const handleCloseMessageDialog = (action) => {
    if (action === "continue") {
      setWholeRoad(true);
      setSpecificLocation("");
      UpdateSandbox("wholeRoad", true);

      mapContext.onEditMapObject(null, null);
      informationContext.onClearInformation();
    }

    setShowWholeRoadWarning(false);
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
      setWholeRoad(data.hwwData.wholeRoad);
      setSpecificLocation(data.hwwData.specificLocation ? data.hwwData.specificLocation : "");
      setHwwStartX(data.hwwData.hwwStartX ? data.hwwData.hwwStartX : 0);
      setHwwStartY(data.hwwData.hwwStartY ? data.hwwData.hwwStartY : 0);
      setHwwEndX(data.hwwData.hwwEndX ? data.hwwData.hwwEndX : 0);
      setHwwEndY(data.hwwData.hwwEndY ? data.hwwData.hwwEndY : 0);

      setSwaOrgRefLookup(filteredLookup(SwaOrgRef, false));
    }
  }, [loading, data]);

  useEffect(() => {
    if (!wholeRoad && !informationContext.informationSource) {
      informationContext.onDisplayInformation("partRoadASD", "HWWDataTab");
    }
  }, [wholeRoad, informationContext]);

  useEffect(() => {
    if (sandboxContext.currentSandbox.sourceStreet && sandboxContext.currentSandbox.currentStreetRecords.hww) {
      const sourceHWW = sandboxContext.currentSandbox.sourceStreet.heightWidthWeights.find(
        (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.hww.pkId
      );

      if (sourceHWW) {
        setDataChanged(
          !ObjectComparison(
            sourceHWW,
            sandboxContext.currentSandbox.currentStreetRecords.hww,
            heightWidthWeightKeysToIgnore
          )
        );
      } else if (sandboxContext.currentSandbox.currentStreetRecords.hww.pkId < 0) setDataChanged(true);
    }
  }, [sandboxContext.currentSandbox.sourceStreet, sandboxContext.currentSandbox.currentStreetRecords.hww]);

  useEffect(() => {
    setUserCanEdit(userContext.currentUser && userContext.currentUser.editASD);
  }, [userContext]);

  useEffect(() => {
    if (informationContext.informationSource && informationContext.informationSource === "HWWDataTab") {
      setInformationAnchorEl(document.getElementById("height-width-weight-data"));
    } else setInformationAnchorEl(null);
  }, [informationContext.informationSource]);

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
            setFeatureDescriptionError(error.errors);
            break;

          case "sourcetext":
            setSourceError(error.errors);
            break;

          case "swaorgrefconsultant":
            setOrganisationError(error.errors);
            break;

          case "districtrefconsultant":
            setDistrictError(error.errors);
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
      <Box sx={toolbarStyle} id={"height-width-weight-data"}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={dataTabToolBar}>
          <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
            {streetContext.currentRecord.type === 64 && streetContext.currentRecord.newRecord ? (
              <ADSActionButton
                variant="close"
                tooltipTitle="Close"
                tooltipPlacement="bottom"
                onClick={handleCancelClicked}
              />
            ) : (
              <ADSActionButton variant="home" tooltipTitle="Home" tooltipPlacement="bottom" onClick={handleHomeClick} />
            )}
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
              {streetContext.currentRecord.type === 64 && streetContext.currentRecord.newRecord
                ? "Add new height, width and weight restriction"
                : `Height, width and weight restriction (${data.index + 1} of ${data.totalRecords})`}
            </Typography>
          </Stack>
          {!(streetContext.currentRecord.type === 64 && streetContext.currentRecord.newRecord) && (
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
          )}
        </Stack>
      </Box>
      <Box sx={dataFormStyle("HWWDataTab")}>
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
          maximum={99.9}
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
          characterSet="GeoPlaceStreet1"
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
          characterSet="GeoPlaceStreet1"
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
          characterSet="GeoPlaceStreet1"
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
          lookupData={filteredOperationalDistricts(lookupContext.currentLookups.operationalDistricts, organisation)}
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
          variant="WholeRoad"
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
            characterSet="GeoPlaceStreet1"
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
        <MessageDialog isOpen={showWholeRoadWarning} variant="cancelASDPartRoad" onClose={handleCloseMessageDialog} />
      </div>
      <Popper id={informationId} open={informationOpen} anchorEl={informationAnchorEl} placement="top-start">
        <ADSInformationControl variant={"partRoadASD"} />
      </Popper>
    </Fragment>
  );
}

export default HWWDataTab;
