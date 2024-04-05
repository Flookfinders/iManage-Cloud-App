/* #region header */
/**************************************************************************************************
//
//  Description: GeoPlace special designation data tab
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
//    005   03.11.23 Sean Flook                 If the type has not been selected default to Special designation.
//    006   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system.
//    007   02.01.24 Sean Flook       IMANN-205 Added end date.
//    008   05.01.24 Sean Flook                 Changes to sort out warnings.
//    009   11.01.24 Sean Flook                 Fix warnings.
//    010   16.01.24 Sean Flook                 Changes required to fix warnings.
//    011   23.01.24 Sean Flook       IMANN-246 Display information when selecting Part Road.
//    012   25.01.24 Sean Flook       IMANN-250 No need to default wholeRoad.
//    013   29.01.24 Sean Flook       IMANN-252 Restrict the characters that can be used in text fields.
//    014   05.02.24 Sean Flook                 Filter available districts by the organisation.
//    015   07.02.24 Sean Flook                 Display a warning dialog when changing from Part Road to Whole Road.
//    016   13.02.24 Sean Flook                 Set the ADSWholeRoadControl variant.
//    017   15.02.24 Joel Benford     IMANN-299 Toolbar changes
//    018   07.03.24 Sean Flook       IMANN-348 Changes required to ensure the OK button is correctly enabled and removed redundant code.
//    019   11.03.24 Sean Flook           GLB12 Adjusted height to remove gap.
//    020   22.03.24 Sean Flook           GLB12 Changed to use dataFormStyle so height can be correctly set.
//    021   27.03.24 Sean Flook                 Clear specific location if going back to whole road.
//    022   05.04.24 Sean Flook       IMANN-372 Corrected typo.
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
import InformationContext from "../context/informationContext";
import StreetContext from "../context/streetContext";

import { GetLookupLabel, ConvertDate, isAfter1stApril2015, filteredLookup } from "../utils/HelperUtils";
import { filteredOperationalDistricts } from "../utils/StreetUtils";
import ObjectComparison, { specialDesignationKeysToIgnore } from "../utils/ObjectComparison";

import SwaOrgRef from "../data/SwaOrgRef";
import SpecialDesignationCode from "./../data/SpecialDesignationCode";
import SpecialDesignationPeriodicity from "./../data/SpecialDesignationPeriodicity";

import { Avatar, Typography, Popper } from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSActionButton from "../components/ADSActionButton";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSDateControl from "../components/ADSDateControl";
import ADSWholeRoadControl from "../components/ADSWholeRoadControl";
import ADSTextControl from "../components/ADSTextControl";
import ADSOkCancelControl from "../components/ADSOkCancelControl";
import ADSFromToTimeControl from "../components/ADSFromToTimeControl";
import ADSFromToDateControl from "../components/ADSFromToDateControl";
import ADSInformationControl from "../components/ADSInformationControl";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";
import MessageDialog from "../dialogs/MessageDialog";

import { SpecialDesignationIcon } from "../utils/ADSIcons";
import { adsBlack, adsYellow } from "../utils/ADSColours";
import { toolbarStyle, dataTabToolBar, dataFormStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

SpecialDesignationDataTab.propTypes = {
  data: PropTypes.object,
  errors: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  focusedField: PropTypes.string,
  onHomeClick: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

function SpecialDesignationDataTab({ data, errors, loading, focusedField, onHomeClick, onAdd, onDelete }) {
  const theme = useTheme();

  const lookupContext = useContext(LookupContext);
  const sandboxContext = useContext(SandboxContext);
  const userContext = useContext(UserContext);
  const mapContext = useContext(MapContext);
  const informationContext = useContext(InformationContext);
  const streetContext = useContext(StreetContext);

  const [dataChanged, setDataChanged] = useState(false);

  const [specialDesignationCodeLookup, setSpecialDesignationCodeLookup] = useState(
    filteredLookup(SpecialDesignationCode, false)
  );
  const [swaOrgRefLookup, setSwaOrgRefLookup] = useState(filteredLookup(SwaOrgRef, false));

  const [designationType, setDesignationType] = useState(null);
  const [organisation, setOrganisation] = useState(null);
  const [district, setDistrict] = useState(null);
  const [description, setDescription] = useState("");
  const [periodicity, setPeriodicity] = useState(null);
  const [operationalStartTime, setOperationalStartTime] = useState(null);
  const [operationalEndTime, setOperationalEndTime] = useState(null);
  const [operationalStartDate, setOperationalStartDate] = useState(null);
  const [operationalEndDate, setOperationalEndDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [source, setSource] = useState("");
  const [wholeRoad, setWholeRoad] = useState(true);
  const [specificLocation, setSpecificLocation] = useState("");
  const [specialDesigStartX, setSpecialDesigStartX] = useState(0);
  const [specialDesigStartY, setSpecialDesigStartY] = useState(0);
  const [specialDesigEndX, setSpecialDesigEndX] = useState(0);
  const [specialDesigEndY, setSpecialDesigEndY] = useState(0);

  const [userCanEdit, setUserCanEdit] = useState(false);

  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const [showWholeRoadWarning, setShowWholeRoadWarning] = useState(false);

  const [designationTypeError, setDesignationTypeError] = useState(null);
  const [organisationError, setOrganisationError] = useState(null);
  const [districtError, setDistrictError] = useState(null);
  const [descriptionError, setDescriptionError] = useState(null);
  const [periodicityError, setPeriodicityError] = useState(null);
  const [operationalStartTimeError, setOperationalStartTimeError] = useState(null);
  const [operationalEndTimeError, setOperationalEndTimeError] = useState(null);
  const [operationalStartDateError, setOperationalStartDateError] = useState(null);
  const [operationalEndDateError, setOperationalEndDateError] = useState(null);
  const [sourceError, setSourceError] = useState(null);
  const [startDateError, setStartDateError] = useState(null);
  const [endDateError, setEndDateError] = useState(null);
  const [wholeRoadError, setWholeRoadError] = useState(true);
  const [specificLocationError, setSpecificLocationError] = useState(null);

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
    const newSpecialDesignationData = GetCurrentData(field, newValue);
    sandboxContext.onSandboxChange("specialDesignation", newSpecialDesignationData);
  };

  /**
   * Event to handle when the designation type is changed.
   *
   * @param {number|null} newValue The new designation type.
   */
  const handleDesignationTypeChangeEvent = (newValue) => {
    setDesignationType(newValue);
    UpdateSandbox("designationType", newValue);
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
   * Event to handle when the description is changed.
   *
   * @param {string|null} newValue The new description.
   */
  const handleDescriptionChangeEvent = (newValue) => {
    setDescription(newValue);
    UpdateSandbox("description", newValue);
  };

  /**
   * Event to handle when the periodicity is changed.
   *
   * @param {number|null} newValue The new periodicity.
   */
  const handlePeriodicityChangeEvent = (newValue) => {
    setPeriodicity(newValue);
    UpdateSandbox("periodicity", newValue);
  };

  /**
   * Event to handle when the operational start time is changed.
   *
   * @param {Date|null} newValue The new operational start time.
   */
  const handleOperationalStartTimeChangeEvent = (newValue) => {
    setOperationalStartTime(newValue);
    UpdateSandbox("operationalStartTime", newValue);
  };

  /**
   * Event to handle when the operational end time is changed.
   *
   * @param {Date|null} newValue The new operational end time.
   */
  const handleOperationalEndTimeChangeEvent = (newValue) => {
    setOperationalEndTime(newValue);
    UpdateSandbox("operationalEndTime", newValue);
  };

  /**
   * Event to handle when the operational start date is changed.
   *
   * @param {Date|null} newValue The new operational start date.
   */
  const handleOperationalStartDateChangeEvent = (newValue) => {
    setOperationalStartDate(newValue);
    UpdateSandbox("operationalStartDate", newValue);
  };

  /**
   * Event to handle when the operational end date is changed.
   *
   * @param {Date|null} newValue The new operational end date.
   */
  const handleOperationalEndDateChangeEvent = (newValue) => {
    setOperationalEndDate(newValue);
    UpdateSandbox("operationalEndDate", newValue);
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
   * Event to handle when the source is changed.
   *
   * @param {string|null} newValue The new source.
   */
  const handleSourceChangeEvent = (newValue) => {
    setSource(newValue);
    UpdateSandbox("source", newValue);
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
        mapContext.onEditMapObject(63, data && data.specialDesignationData && data.specialDesignationData.pkId);
        informationContext.onDisplayInformation("partRoadASD", "SpecialDesignationDataTab");
      }
    }
  };

  /**
   * Event to handle when the specific location is changed.
   *
   * @param {string|null} newValue The new specific location.
   */
  const handleSpecificLocationChangeEvent = (newValue) => {
    setSpecificLocation(newValue);
    UpdateSandbox("specificLocation", newValue);
  };

  /**
   * Event to handle when the home button is clicked.
   */
  const handleHomeClick = () => {
    const sourceSpecialDesignation =
      data.pkId > 0 && sandboxContext.currentSandbox.sourceStreet
        ? sandboxContext.currentSandbox.sourceStreet.specialDesignations.find((x) => x.pkId === data.pkId)
        : null;

    if (onHomeClick)
      onHomeClick(
        dataChanged
          ? sandboxContext.currentSandbox.currentStreetRecords.specialDesignation
            ? "check"
            : "discard"
          : "discard",
        sourceSpecialDesignation,
        sandboxContext.currentSandbox.currentStreetRecords.specialDesignation
      );
  };

  /**
   * Event to handle when the OK button is clicked.
   */
  const handleOkClicked = () => {
    if (onHomeClick) onHomeClick("save", null, sandboxContext.currentSandbox.currentStreetRecords.specialDesignation);
  };

  /**
   * Event to handle when the Cancel button is clicked.
   */
  const handleCancelClicked = () => {
    if (dataChanged) {
      if (data && data.specialDesignationData) {
        setDesignationType(data.specialDesignationData.streetSpecialDesigCode);
        setOrganisation(data.specialDesignationData.swaOrgRefConsultant);
        setDistrict(data.specialDesignationData.districtRefConsultant);
        setDescription(
          data.specialDesignationData.specialDesigDescription ? data.specialDesignationData.specialDesigDescription : ""
        );
        setPeriodicity(data.specialDesignationData.specialDesigPeriodicityCode);
        setOperationalStartTime(data.specialDesignationData.specialDesigStartTime);
        setOperationalEndTime(data.specialDesignationData.specialDesigEndTime);
        setOperationalStartDate(data.specialDesignationData.specialDesigStartDate);
        setOperationalEndDate(data.specialDesignationData.specialDesigEndDate);
        setStartDate(data.specialDesignationData.recordStartDate);
        setEndDate(data.specialDesignationData.recordEndDate);
        setSource(
          data.specialDesignationData.specialDesigSourceText ? data.specialDesignationData.specialDesigSourceText : ""
        );
        setWholeRoad(data.specialDesignationData.wholeRoad);
        setSpecificLocation(
          data.specialDesignationData.specificLocation ? data.specialDesignationData.specificLocation : ""
        );
        setSpecialDesigStartX(
          data.specialDesignationData.specialDesigStartX ? data.specialDesignationData.specialDesigStartX : 0
        );
        setSpecialDesigStartY(
          data.specialDesignationData.specialDesigStartY ? data.specialDesignationData.specialDesigStartY : 0
        );
        setSpecialDesigEndX(
          data.specialDesignationData.specialDesigEndX ? data.specialDesignationData.specialDesigEndX : 0
        );
        setSpecialDesigEndY(
          data.specialDesignationData.specialDesigEndY ? data.specialDesignationData.specialDesigEndY : 0
        );
      }
    }
    if (onHomeClick) onHomeClick("discard", data.specialDesignationData, null);
  };

  /**
   * Method to return the current special designation record.
   *
   * @param {string} field The name of the field that is being updated.
   * @param {string|boolean|Date|number|null} newValue The value used to update the given field.
   * @returns {object} The current special designation record.
   */
  function GetCurrentData(field, newValue) {
    return {
      changeType:
        field && field === "changeType"
          ? newValue
          : !data.specialDesignationData.pkId || data.specialDesignationData.pkId < 0
          ? "I"
          : "U",
      usrn: data.specialDesignationData.usrn,
      seqNum: data.specialDesignationData.seqNum,
      wholeRoad: field && field === "wholeRoad" ? newValue : wholeRoad,
      specificLocation:
        field && field === "specificLocation"
          ? newValue
          : field && field === "wholeRoad" && newValue
          ? ""
          : specificLocation,
      neverExport: data.specialDesignationData.neverExport,
      streetSpecialDesigCode: field && field === "designationType" ? newValue : designationType,
      asdCoordinate: data.specialDesignationData.asdCoordinate,
      asdCoordinateCount: data.specialDesignationData.asdCoordinateCount,
      specialDesigPeriodicityCode: field && field === "periodicity" ? newValue : periodicity,
      specialDesigStartX: field && field === "specialDesigStartX" ? newValue : specialDesigStartX,
      specialDesigStartY: field && field === "specialDesigStartY" ? newValue : specialDesigStartY,
      specialDesigEndX: field && field === "specialDesigEndX" ? newValue : specialDesigEndX,
      specialDesigEndY: field && field === "specialDesigEndY" ? newValue : specialDesigEndY,
      recordStartDate:
        field && field === "startDate" ? newValue && ConvertDate(newValue) : startDate && ConvertDate(startDate),
      recordEndDate: field && field === "endDate" ? newValue && ConvertDate(newValue) : endDate && ConvertDate(endDate),
      specialDesigStartDate:
        field && field === "operationalStartDate"
          ? newValue && ConvertDate(newValue)
          : operationalStartDate && ConvertDate(operationalStartDate),
      specialDesigEndDate:
        field && field === "operationalEndDate"
          ? newValue && ConvertDate(newValue)
          : operationalEndDate && ConvertDate(operationalEndDate),
      specialDesigStartTime: field && field === "operationalStartTime" ? newValue : operationalStartTime,
      specialDesigEndTime: field && field === "operationalEndTime" ? newValue : operationalEndTime,
      specialDesigDescription: field && field === "description" ? newValue : description,
      swaOrgRefConsultant: field && field === "organisation" ? newValue : organisation,
      districtRefConsultant: field && field === "district" ? newValue : district,
      specialDesigSourceText: field && field === "source" ? newValue : source,
      wktGeometry: data.specialDesignationData.wktGeometry,
      pkId: data.specialDesignationData.pkId,
      entryDate: data.specialDesignationData.entryDate,
      lastUpdateDate: data.specialDesignationData.lastUpdateDate,
    };
  }

  /**
   * Event to handle when the add special designation button is clicked.
   */
  const handleAddSpecialDesignation = () => {
    if (onAdd) onAdd();
  };

  /**
   * Event to handle when the delete special designation button is clicked.
   */
  const handleDeleteSpecialDesignation = () => {
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

  /**
   * Method to get the text for the supplied designation type code.
   *
   * @param {number} designationType The designation type code that we need the text for.
   * @returns {string} The text for the supplied designation type code.
   */
  function getType(designationType) {
    const desigRecord = SpecialDesignationCode.filter((x) => x.id === designationType);

    if (desigRecord && desigRecord.length > 0) return desigRecord[0][GetLookupLabel(false)];
    else return "Special designation";
  }

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
    if (!loading && data && data.specialDesignationData) {
      setDesignationType(data.specialDesignationData.streetSpecialDesigCode);
      setOrganisation(data.specialDesignationData.swaOrgRefConsultant);
      setDistrict(data.specialDesignationData.districtRefConsultant);
      setDescription(
        data.specialDesignationData.specialDesigDescription ? data.specialDesignationData.specialDesigDescription : ""
      );
      setPeriodicity(data.specialDesignationData.specialDesigPeriodicityCode);
      setOperationalStartTime(data.specialDesignationData.specialDesigStartTime);
      setOperationalEndTime(data.specialDesignationData.specialDesigEndTime);
      setOperationalStartDate(data.specialDesignationData.specialDesigStartDate);
      setOperationalEndDate(data.specialDesignationData.specialDesigEndDate);
      setStartDate(data.specialDesignationData.recordStartDate);
      setEndDate(data.specialDesignationData.recordEndDate);
      setSource(
        data.specialDesignationData.specialDesigSourceText ? data.specialDesignationData.specialDesigSourceText : ""
      );
      setWholeRoad(data.specialDesignationData.wholeRoad);
      setSpecificLocation(
        data.specialDesignationData.specificLocation ? data.specialDesignationData.specificLocation : ""
      );
      setSpecialDesigStartX(
        data.specialDesignationData.specialDesigStartX ? data.specialDesignationData.specialDesigStartX : 0
      );
      setSpecialDesigStartY(
        data.specialDesignationData.specialDesigStartY ? data.specialDesignationData.specialDesigStartY : 0
      );
      setSpecialDesigEndX(
        data.specialDesignationData.specialDesigEndX ? data.specialDesignationData.specialDesigEndX : 0
      );
      setSpecialDesigEndY(
        data.specialDesignationData.specialDesigEndY ? data.specialDesignationData.specialDesigEndY : 0
      );

      setSpecialDesignationCodeLookup(filteredLookup(SpecialDesignationCode, false));
      setSwaOrgRefLookup(filteredLookup(SwaOrgRef, false));
    }
  }, [loading, data]);

  useEffect(() => {
    if (!wholeRoad && !informationContext.informationSource) {
      informationContext.onDisplayInformation("partRoadASD", "SpecialDesignationDataTab");
    }
  }, [wholeRoad, informationContext]);

  useEffect(() => {
    if (
      sandboxContext.currentSandbox.sourceStreet &&
      sandboxContext.currentSandbox.currentStreetRecords.specialDesignation
    ) {
      const sourceSpecialDesignation = sandboxContext.currentSandbox.sourceStreet.specialDesignations.find(
        (x) => x.pkId === sandboxContext.currentSandbox.currentStreetRecords.specialDesignation.pkId
      );

      if (sourceSpecialDesignation) {
        setDataChanged(
          !ObjectComparison(
            sourceSpecialDesignation,
            sandboxContext.currentSandbox.currentStreetRecords.specialDesignation,
            specialDesignationKeysToIgnore
          )
        );
      } else if (sandboxContext.currentSandbox.currentStreetRecords.specialDesignation.pkId < 0) setDataChanged(true);
    }
  }, [
    sandboxContext.currentSandbox.sourceStreet,
    sandboxContext.currentSandbox.currentStreetRecords.specialDesignation,
  ]);

  useEffect(() => {
    setUserCanEdit(userContext.currentUser && userContext.currentUser.canEdit);
  }, [userContext]);

  useEffect(() => {
    if (informationContext.informationSource && informationContext.informationSource === "SpecialDesignationDataTab") {
      setInformationAnchorEl(document.getElementById("special-designation-data"));
    } else setInformationAnchorEl(null);
  }, [informationContext.informationSource]);

  useEffect(() => {
    setDesignationTypeError(null);
    setOrganisationError(null);
    setDistrictError(null);
    setDescriptionError(null);
    setPeriodicityError(null);
    setOperationalStartTimeError(null);
    setOperationalEndTimeError(null);
    setOperationalStartDateError(null);
    setOperationalEndDateError(null);
    setSourceError(null);
    setStartDateError(null);
    setEndDateError(null);
    setWholeRoadError(true);
    setSpecificLocationError(null);

    if (errors && errors.length > 0) {
      for (const error of errors) {
        switch (error.field.toLowerCase()) {
          case "streetspecialdesigcode":
            setDesignationTypeError(error.errors);
            break;

          case "swaorgrefconsultant":
            setOrganisationError(error.errors);
            break;

          case "districtrefconsultant":
            setDistrictError(error.errors);
            break;

          case "specialdesigdescription":
            setDescriptionError(error.errors);
            break;

          case "specialdesigperiodicitycode":
            setPeriodicityError(error.errors);
            break;

          case "specialdesigstarttime":
            setOperationalStartTimeError(error.errors);
            break;

          case "specialdesigendtime":
            setOperationalEndTimeError(error.errors);
            break;

          case "specialdesigstartdate":
            setOperationalStartDateError(error.errors);
            break;

          case "specialdesigenddate":
            setOperationalEndDateError(error.errors);
            break;

          case "specialdesigsourcetext":
            setSourceError(error.errors);
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
            setSpecificLocationError(error.errors);
            break;

          default:
            break;
        }
      }
    }
  }, [errors]);

  return (
    <Fragment>
      <Box sx={toolbarStyle} id={"special-designation-data"}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={dataTabToolBar}>
          <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
            {streetContext.currentRecord.type === 63 && streetContext.currentRecord.newRecord ? (
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
              variant="rounded"
              sx={{
                height: theme.spacing(2),
                width: theme.spacing(2),
                color: adsBlack,
                backgroundColor: adsYellow,
                borderStyle: "solid",
                borderWidth: "1px",
                borderColor: `${adsBlack}  !important`,
              }}
            >
              <SpecialDesignationIcon
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
              {streetContext.currentRecord.type === 63 && streetContext.currentRecord.newRecord
                ? "Add new special designation"
                : `${getType(designationType)} (${data.index + 1} of ${data.totalRecords})`}
            </Typography>
          </Stack>
          {!(streetContext.currentRecord.type === 63 && streetContext.currentRecord.newRecord) && (
            <Stack direction="row" alignItems="center" justifyContent="flex-end">
              <ADSActionButton
                variant="delete"
                disabled={!userCanEdit}
                tooltipTitle="Delete special designation record"
                tooltipPlacement="right"
                onClick={handleDeleteSpecialDesignation}
              />
              <ADSActionButton
                variant="add"
                disabled={!userCanEdit}
                tooltipTitle="Add new special designation record"
                tooltipPlacement="right"
                onClick={handleAddSpecialDesignation}
              />
            </Stack>
          )}
        </Stack>
      </Box>
      <Box sx={dataFormStyle("SpecialDesignationDataTab")}>
        <ADSSelectControl
          label="Type"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "StreetSpecialDesigCode" : false}
          loading={loading}
          useRounded
          doNotSetTitleCase
          lookupData={specialDesignationCodeLookup}
          lookupId="id"
          lookupLabel={GetLookupLabel(false)}
          lookupColour="colour"
          value={designationType}
          errorText={designationTypeError}
          onChange={handleDesignationTypeChangeEvent}
          helperText="Code to identify the type of Special Designation that the Record applies to (for example, Traffic Sensitive Street)."
        />
        <ADSSelectControl
          label="Organisation"
          isEditable={userCanEdit}
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
          helperText="Code to identify the Street Authority which must be consulted about the Special Designation."
        />
        <ADSSelectControl
          label="District"
          isEditable={userCanEdit}
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
          helperText="Code to identify the Operational District for the Street Authority which must be consulted about the Special Designation."
        />
        <ADSTextControl
          label="Description"
          isEditable={userCanEdit}
          isRequired={isAfter1stApril2015(startDate)}
          isFocused={focusedField ? focusedField === "Description" : false}
          loading={loading}
          value={description}
          maxLength={250}
          minLines={3}
          maxLines={5}
          characterSet="GeoPlaceStreet1"
          id="special_designation_description"
          errorText={descriptionError}
          helperText="Description providing additional information for certain Special Designations."
          onChange={handleDescriptionChangeEvent}
        />
        <ADSSelectControl
          label="Periodicity"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "SpecialDesigPeriodicityCode" : false}
          loading={loading}
          useRounded
          doNotSetTitleCase
          lookupData={filteredLookup(SpecialDesignationPeriodicity, false)}
          lookupId="id"
          lookupLabel={GetLookupLabel(false)}
          lookupColour="colour"
          value={periodicity}
          errorText={periodicityError}
          onChange={handlePeriodicityChangeEvent}
          helperText="Code to identify the periodicity of the restriction."
        />
        <ADSFromToTimeControl
          label="Operational times"
          isEditable={userCanEdit}
          isRequired={(periodicity && periodicity === 15) || operationalStartTime || operationalEndTime}
          isFromFocused={focusedField ? focusedField === "SpecialDesigStartTime" : false}
          isToFocused={focusedField ? focusedField === "SpecialDesigEndTime" : false}
          loading={loading}
          fromLabel="Start"
          toLabel="End"
          fromHelperText="If the Special Designation has a specified time period, time when the Special Designation starts."
          toHelperText="If the Special Designation has a specified time period, time when the Special Designation ends."
          fromValue={operationalStartTime}
          toValue={operationalEndTime}
          fromErrorText={operationalStartTimeError}
          toErrorText={operationalEndTimeError}
          onFromChange={handleOperationalStartTimeChangeEvent}
          onToChange={handleOperationalEndTimeChangeEvent}
        />
        <ADSFromToDateControl
          label="Operational dates"
          isEditable={userCanEdit}
          isRequired={(periodicity && periodicity === 15) || operationalStartDate || operationalEndDate}
          isFromFocused={focusedField ? focusedField === "SpecialDesigStartDate" : false}
          isToFocused={focusedField ? focusedField === "specialDesigEndDate" : false}
          loading={loading}
          fromLabel="Start"
          toLabel="End"
          fromHelperText="Date when the Special Designation starts."
          toHelperText="Date when the Special Designation ends."
          fromValue={operationalStartDate}
          toValue={operationalEndDate}
          fromErrorText={operationalStartDateError}
          toErrorText={operationalEndDateError}
          onFromChange={handleOperationalStartDateChangeEvent}
          onToChange={handleOperationalEndDateChangeEvent}
        />
        <ADSDateControl
          label="Start date"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "RecordStartDate" : false}
          loading={loading}
          value={startDate}
          helperText="Date when the Record started."
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
        <ADSTextControl
          label="Source"
          isEditable={userCanEdit}
          isFocused={focusedField ? focusedField === "SpecialDesigSourceText" : false}
          loading={loading}
          value={source}
          maxLength={120}
          minLines={3}
          maxLines={5}
          id="special_designation_source"
          errorText={sourceError}
          helperText="A brief textual summary of the department/function and/or organisation that is the source of this data."
          onChange={handleSourceChangeEvent}
        />
        <ADSWholeRoadControl
          variant="WholeRoad"
          label="Applied to"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "WholeRoad" : false}
          loading={loading}
          value={wholeRoad}
          helperText="Indicator as to whether the Special Designation applies to the Whole Road."
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
            id="special_designation_specify_location"
            characterSet="GeoPlaceStreet1"
            errorText={specificLocationError}
            helperText="Description of the location of the Special Designation within the Street."
            onChange={handleSpecificLocationChangeEvent}
          />
        )}
        <ADSOkCancelControl
          okDisabled={!dataChanged}
          onOkClicked={handleOkClicked}
          onCancelClicked={handleCancelClicked}
        />
      </Box>
      <div>
        <ConfirmDeleteDialog
          variant="special designation"
          open={openDeleteConfirmation}
          onClose={handleCloseDeleteConfirmation}
        />
        <MessageDialog isOpen={showWholeRoadWarning} variant="cancelASDPartRoad" onClose={handleCloseMessageDialog} />
      </div>
      <Popper id={informationId} open={informationOpen} anchorEl={informationAnchorEl} placement="top-start">
        <ADSInformationControl variant={"partRoadASD"} />
      </Popper>
    </Fragment>
  );
}

export default SpecialDesignationDataTab;
