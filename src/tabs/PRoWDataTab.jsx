/* #region header */
/**************************************************************************************************
//
//  Description: Public right of way data tab
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
//    003   27.10.23 Sean Flook                 Use new dataFormStyle.
//    004   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system.
//    005   05.01.24 Sean Flook                 Changes to sort out warnings and use CSS shortcuts.
//    006   11.01.24 Sean Flook                 Fix warnings.
//    007   16.01.24 Sean Flook                 Changes required to fix warnings.
//    008   29.01.24 Sean Flook       IMANN-252 Restrict the characters that can be used in text fields.
//    009   05.02.24 Sean Flook                 Filter available districts by the organisation.
//    010   13.02.24 Sean Flook                 Changes required to handle the geometry.
//    011   13.02.24 Sean Flook                 Corrected ADSWholeRoadControl variant.
//    012   13.02.24 Sean Flook                 Corrected the type 66 map data.
//    013   14.02.24 Joel Benford     IMANN-299 Toolbar changes
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useEffect, Fragment } from "react";
import PropTypes from "prop-types";

import LookupContext from "../context/lookupContext";
import SandboxContext from "../context/sandboxContext";
import UserContext from "./../context/userContext";
import MapContext from "./../context/mapContext";
import InformationContext from "../context/informationContext";
import StreetContext from "../context/streetContext";

import { GetLookupLabel, ConvertDate, filteredLookup } from "../utils/HelperUtils";
import { filteredOperationalDistricts } from "../utils/StreetUtils";
import ObjectComparison from "../utils/ObjectComparison";

import SwaOrgRef from "../data/SwaOrgRef";
import PRoWDedicationCode from "../data/PRoWDedicationCode";
import PRoWStatusCode from "../data/PRoWStatusCode";

import { Grid, Typography, Avatar, Accordion, AccordionSummary, AccordionDetails, Popper } from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSActionButton from "../components/ADSActionButton";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSTextControl from "../components/ADSTextControl";
import ADSNumberControl from "../components/ADSNumberControl";
import ADSSwitchControl from "../components/ADSSwitchControl";
import ADSDateControl from "../components/ADSDateControl";
import ADSOkCancelControl from "../components/ADSOkCancelControl";
import ADSProwAccessControl from "../components/ADSProwAccessControl";
import ADSWholeRoadControl from "../components/ADSWholeRoadControl";
import ADSInformationControl from "../components/ADSInformationControl";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";
import MessageDialog from "../dialogs/MessageDialog";

import { DirectionsWalk, ArrowForwardIosSharp, QuestionAnswer, Flag, Done } from "@mui/icons-material";
import { adsBlueA, adsWhite, adsLightBlue10, adsBlack125, adsDarkGreen } from "../utils/ADSColours";
import { toolbarStyle, dataFormStyle, FormRowStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

PRoWDataTab.propTypes = {
  data: PropTypes.object,
  errors: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  focusedField: PropTypes.string,
  onDataChanged: PropTypes.func.isRequired,
  onHomeClick: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

function PRoWDataTab({ data, errors, loading, focusedField, onDataChanged, onHomeClick, onAdd, onDelete }) {
  const theme = useTheme();

  const lookupContext = useContext(LookupContext);
  const sandboxContext = useContext(SandboxContext);
  const userContext = useContext(UserContext);
  const mapContext = useContext(MapContext);
  const informationContext = useContext(InformationContext);
  const streetContext = useContext(StreetContext);

  const [dataChanged, setDataChanged] = useState(false);

  const [swaOrgRefLookup, setSwaOrgRefLookup] = useState(filteredLookup(SwaOrgRef, false));

  const [dedication, setDedication] = useState(null);
  const [status, setStatus] = useState(null);
  const [location, setLocation] = useState("");
  const [details, setDetails] = useState("");
  const [defMapGeometryType, setDefMapGeometryType] = useState(true);
  const [prowLength, setProwLength] = useState(0);
  const [promotedRoute, setPromotedRoute] = useState(false);
  const [accessibleRoute, setAccessibleRoute] = useState(false);
  const [sourceText, setSourceText] = useState("");
  const [organisation, setOrganisation] = useState(null);
  const [district, setDistrict] = useState(null);
  const [diversionRelatedUsrn, setDiversionRelatedUsrn] = useState(null);
  const [pedestrianAccess, setPedestrianAccess] = useState(false);
  const [equestrianAccess, setEquestrianAccess] = useState(false);
  const [nonMotorisedAccess, setNonMotorisedAccess] = useState(false);
  const [cycleAccess, setCycleAccess] = useState(false);
  const [motorisedAccess, setMotorisedAccess] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [relevantStartDate, setRelevantStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [consultationStartDate, setConsultationStartDate] = useState(null);
  const [consultationCloseDate, setConsultationCloseDate] = useState(null);
  const [consultationReference, setConsultationReference] = useState("");
  const [consultationDetails, setConsultationDetails] = useState("");
  const [appealDate, setAppealDate] = useState(null);
  const [appealReference, setAppealReference] = useState("");
  const [appealDetails, setAppealDetails] = useState("");

  const [userCanEdit, setUserCanEdit] = useState(false);

  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const [showExactWarning, setShowExactWarning] = useState(false);

  const [dedicationError, setDedicationError] = useState(null);
  const [statusError, setStatusError] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [detailsError, setDetailsError] = useState(null);
  const [defMapGeometryTypeError, setDefMapGeometryTypeError] = useState(null);
  const [prowLengthError, setProwLengthError] = useState(null);
  const [promotedRouteError, setPromotedRouteError] = useState(null);
  const [accessibleRouteError, setAccessibleRouteError] = useState(null);
  const [sourceTextError, setSourceTextError] = useState(null);
  const [organisationError, setOrganisationError] = useState(null);
  const [districtError, setDistrictError] = useState(null);
  const [diversionRelatedUsrnError, setDiversionRelatedUsrnError] = useState(null);
  const [pedestrianAccessError, setPedestrianAccessError] = useState(null);
  const [equestrianAccessError, setEquestrianAccessError] = useState(null);
  const [nonMotorisedAccessError, setNonMotorisedAccessError] = useState(null);
  const [cycleAccessError, setCycleAccessError] = useState(null);
  const [motorisedAccessError, setMotorisedAccessError] = useState(null);
  const [startDateError, setStartDateError] = useState(null);
  const [relevantStartDateError, setRelevantStartDateError] = useState(null);
  const [endDateError, setEndDateError] = useState(null);
  const [consultationStartDateError, setConsultationStartDateError] = useState(null);
  const [consultationCloseDateError, setConsultationCloseDateError] = useState(null);
  const [consultationReferenceError, setConsultationReferenceError] = useState(null);
  const [consultationDetailsError, setConsultationDetailsError] = useState(null);
  const [appealDateError, setAppealDateError] = useState(null);
  const [appealReferenceError, setAppealReferenceError] = useState(null);
  const [appealDetailsError, setAppealDetailsError] = useState(null);

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
    const newPublicRightOfWayData = GetCurrentData(field, newValue);
    sandboxContext.onSandboxChange("prow", newPublicRightOfWayData);
  };

  /**
   * Event to handle when the dedication is changed.
   *
   * @param {number|null} newValue The new dedication.
   */
  const handleDedicationChangeEvent = (newValue) => {
    setDedication(newValue);
    if (!dataChanged) {
      setDataChanged(dedication !== newValue);
      if (onDataChanged && dedication !== newValue) onDataChanged();
    }
    UpdateSandbox("dedication", newValue);
  };

  /**
   * Event to handle when the status is changed.
   *
   * @param {number|null} newValue The new status.
   */
  const handleStatusChangeEvent = (newValue) => {
    setStatus(newValue);
    if (!dataChanged) {
      setDataChanged(status !== newValue);
      if (onDataChanged && status !== newValue) onDataChanged();
    }
    UpdateSandbox("status", newValue);
  };

  /**
   * Event to handle when the location is changed.
   *
   * @param {string|null} newValue The new location.
   */
  const handleLocationChangeEvent = (newValue) => {
    setLocation(newValue);
    if (!dataChanged) {
      setDataChanged(location !== newValue);
      if (onDataChanged && location !== newValue) onDataChanged();
    }
    UpdateSandbox("location", newValue);
  };

  /**
   * Event to handle when the details is changed.
   *
   * @param {string|null} newValue The new details.
   */
  const handleDetailsChangeEvent = (newValue) => {
    setDetails(newValue);
    if (!dataChanged) {
      setDataChanged(details !== newValue);
      if (onDataChanged && details !== newValue) onDataChanged();
    }
    UpdateSandbox("details", newValue);
  };

  /**
   * Event to handle when the whole road flag is changed.
   *
   * @param {boolean} newValue The new whole road flag.
   */
  const handleDefMapGeometryTypeChangeEvent = (newValue) => {
    if (newValue && !defMapGeometryType) {
      setShowExactWarning(true);
    } else {
      setDefMapGeometryType(newValue);
      if (!dataChanged) {
        setDataChanged(defMapGeometryType !== newValue);
        if (onDataChanged && defMapGeometryType !== newValue) onDataChanged();
      }
      UpdateSandbox("defMapGeometryType", newValue);
      if (newValue) {
        mapContext.onEditMapObject(null, null);
        informationContext.onClearInformation();
      } else {
        mapContext.onEditMapObject(66, data && data.prowData && data.prowData.pkId);
        informationContext.onDisplayInformation("inexactASD", "PRoWDataTab");
      }
    }
  };

  /**
   * Event to handle when the PRoW length is changed.
   *
   * @param {number|null} newValue The new PRoW length.
   */
  const handleProwLengthChangeEvent = (newValue) => {
    setProwLength(newValue);
    if (!dataChanged) {
      setDataChanged(prowLength !== newValue);
      if (onDataChanged && prowLength !== newValue) onDataChanged();
    }
    UpdateSandbox("prowLength", newValue);
  };

  /**
   * Event to handle when the promoted route is changed.
   *
   * @param {boolean|null} newValue The new promoted route.
   */
  const handlePromotedRouteChangeEvent = (newValue) => {
    setPromotedRoute(newValue);
    if (!dataChanged) {
      setDataChanged(promotedRoute !== newValue);
      if (onDataChanged && promotedRoute !== newValue) onDataChanged();
    }
    UpdateSandbox("promotedRoute", newValue);
  };

  /**
   * Event to handle when the accessible route is changed.
   *
   * @param {boolean|null} newValue The new accessible route.
   */
  const handleAccessibleRouteChangeEvent = (newValue) => {
    setAccessibleRoute(newValue);
    if (!dataChanged) {
      setDataChanged(accessibleRoute !== newValue);
      if (onDataChanged && accessibleRoute !== newValue) onDataChanged();
    }
    UpdateSandbox("accessibleRoute", newValue);
  };

  /**
   * Event to handle when the source text is changed.
   *
   * @param {string|null} newValue The new source text.
   */
  const handleSourceTextChangeEvent = (newValue) => {
    setSourceText(newValue);
    if (!dataChanged) {
      setDataChanged(sourceText !== newValue);
      if (onDataChanged && sourceText !== newValue) onDataChanged();
    }
    UpdateSandbox("sourceText", newValue);
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
   * Event to handle when the diversion related USRN is changed.
   *
   * @param {number|null} newValue The new diversion related USRN.
   */
  const handleDiversionRelatedUsrnChangeEvent = (newValue) => {
    setDiversionRelatedUsrn(newValue);
    if (!dataChanged) {
      setDataChanged(diversionRelatedUsrn !== newValue);
      if (onDataChanged && diversionRelatedUsrn !== newValue) onDataChanged();
    }
    UpdateSandbox("diversionRelatedUsrn", newValue);
  };

  /**
   * Event to handle when the pedestrian access is changed.
   *
   * @param {boolean} newValue The new pedestrian access.
   */
  const handlePedestrianAccessChangeEvent = (newValue) => {
    setPedestrianAccess(newValue);
    if (!dataChanged) {
      setDataChanged(pedestrianAccess !== newValue);
      if (onDataChanged && pedestrianAccess !== newValue) onDataChanged();
    }
    UpdateSandbox("pedestrianAccess", newValue);
  };

  /**
   * Event to handle when the equestrian access is changed.
   *
   * @param {boolean} newValue The new equestrian access.
   */
  const handleEquestrianAccessChangeEvent = (newValue) => {
    setEquestrianAccess(newValue);
    if (!dataChanged) {
      setDataChanged(equestrianAccess !== newValue);
      if (onDataChanged && equestrianAccess !== newValue) onDataChanged();
    }
    UpdateSandbox("equestrianAccess", newValue);
  };

  /**
   * Event to handle when the non-motorised access is changed.
   *
   * @param {boolean} newValue The new non-motorised access.
   */
  const handleNonMotorisedAccessChangeEvent = (newValue) => {
    setNonMotorisedAccess(newValue);
    if (!dataChanged) {
      setDataChanged(nonMotorisedAccess !== newValue);
      if (onDataChanged && nonMotorisedAccess !== newValue) onDataChanged();
    }
    UpdateSandbox("nonMotorisedAccess", newValue);
  };

  /**
   * Event to handle when the cycle access is changed.
   *
   * @param {boolean} newValue The new cycle access.
   */
  const handleCycleAccessChangeEvent = (newValue) => {
    setCycleAccess(newValue);
    if (!dataChanged) {
      setDataChanged(cycleAccess !== newValue);
      if (onDataChanged && cycleAccess !== newValue) onDataChanged();
    }
    UpdateSandbox("cycleAccess", newValue);
  };

  /**
   * Event to handle when the motorised access is changed.
   *
   * @param {boolean} newValue The new motorised access.
   */
  const handleMotorisedAccessChangeEvent = (newValue) => {
    setMotorisedAccess(newValue);
    if (!dataChanged) {
      setDataChanged(motorisedAccess !== newValue);
      if (onDataChanged && motorisedAccess !== newValue) onDataChanged();
    }
    UpdateSandbox("motorisedAccess", newValue);
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
   * Event to handle when the relevant start date is changed.
   *
   * @param {Date|null} newValue The new relevant start date.
   */
  const handleRelevantStartDateChangeEvent = (newValue) => {
    setRelevantStartDate(newValue);
    if (!dataChanged) {
      setDataChanged(relevantStartDate !== newValue);
      if (onDataChanged && relevantStartDate !== newValue) onDataChanged();
    }
    UpdateSandbox("relevantStartDate", newValue);
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
   * Event to handle when the consultation start date is changed.
   *
   * @param {Date|null} newValue The new consultation start date.
   */
  const handleConsultationStartDateChangeEvent = (newValue) => {
    setConsultationStartDate(newValue);
    if (!dataChanged) {
      setDataChanged(consultationStartDate !== newValue);
      if (onDataChanged && consultationStartDate !== newValue) onDataChanged();
    }
    UpdateSandbox("consultationStartDate", newValue);
  };

  /**
   * Event to handle when the consultation close date is changed.
   *
   * @param {Date|null} newValue The new consultation close date.
   */
  const handleConsultationCloseDateChangeEvent = (newValue) => {
    setConsultationCloseDate(newValue);
    if (!dataChanged) {
      setDataChanged(consultationCloseDate !== newValue);
      if (onDataChanged && consultationCloseDate !== newValue) onDataChanged();
    }
    UpdateSandbox("consultationCloseDate", newValue);
  };

  /**
   * Event to handle when the consultation reference is changed.
   *
   * @param {string|null} newValue The new consultation reference.
   */
  const handleConsultationReferenceChangeEvent = (newValue) => {
    setConsultationReference(newValue);
    if (!dataChanged) {
      setDataChanged(consultationReference !== newValue);
      if (onDataChanged && consultationReference !== newValue) onDataChanged();
    }
    UpdateSandbox("consultationReference", newValue);
  };

  /**
   * Event to handle when the consultation details is changed.
   *
   * @param {string|null} newValue The new consultation details.
   */
  const handleConsultationDetailsChangeEvent = (newValue) => {
    setConsultationDetails(newValue);
    if (!dataChanged) {
      setDataChanged(consultationDetails !== newValue);
      if (onDataChanged && consultationDetails !== newValue) onDataChanged();
    }
    UpdateSandbox("consultationDetails", newValue);
  };

  /**
   * Event to handle when the appeal date is changed.
   *
   * @param {Date|null} newValue The new appeal date.
   */
  const handleAppealDateChangeEvent = (newValue) => {
    setAppealDate(newValue);
    if (!dataChanged) {
      setDataChanged(appealDate !== newValue);
      if (onDataChanged && appealDate !== newValue) onDataChanged();
    }
    UpdateSandbox("appealDate", newValue);
  };

  /**
   * Event to handle when the appeal reference is changed.
   *
   * @param {string|null} newValue The new appeal reference.
   */
  const handleAppealReferenceChangeEvent = (newValue) => {
    setAppealReference(newValue);
    if (!dataChanged) {
      setDataChanged(appealReference !== newValue);
      if (onDataChanged && appealReference !== newValue) onDataChanged();
    }
    UpdateSandbox("appealReference", newValue);
  };

  /**
   * Event to handle when the appeal details is changed.
   *
   * @param {string|null} newValue The new appeal details.
   */
  const handleAppealDetailsChangeEvent = (newValue) => {
    setAppealDetails(newValue);
    if (!dataChanged) {
      setDataChanged(appealDetails !== newValue);
      if (onDataChanged && appealDetails !== newValue) onDataChanged();
    }
    UpdateSandbox("appealDetails", newValue);
  };

  /**
   * Event to handle when the home button is clicked.
   */
  const handleHomeClick = () => {
    const sourcePublicRightOfWay =
      data.pkId > 0 && sandboxContext.currentSandbox.sourceStreet
        ? sandboxContext.currentSandbox.sourceStreet.publicRightOfWays.find((x) => x.pkId === data.pkId)
        : null;

    if (onHomeClick)
      setDataChanged(
        onHomeClick(
          dataChanged ? (sandboxContext.currentSandbox.currentStreetRecords.prow ? "check" : "discard") : "discard",
          sourcePublicRightOfWay,
          sandboxContext.currentSandbox.currentStreetRecords.prow
        )
      );
  };

  /**
   * Event to handle when the OK button is clicked.
   */
  const handleOkClicked = () => {
    if (onHomeClick) setDataChanged(onHomeClick("save", null, sandboxContext.currentSandbox.currentStreetRecords.prow));
  };

  /**
   * Event to handle when the Cancel button is clicked.
   */
  const handleCancelClicked = () => {
    if (dataChanged) {
      if (data && data.prowData) {
        setDedication(data.prowData.prowRights);
        setStatus(data.prowData.prowStatus);
        setLocation(data.prowData.prowLocation ? data.prowData.prowLocation : "");
        setDetails(data.prowData.prowDetails ? data.prowData.prowDetails : "");
        setProwLength(data.prowData.prowLength ? data.prowData.prowLength : 0);
        setPromotedRoute(data.prowData.promotedRoute ? data.prowData.promotedRoute : false);
        setAccessibleRoute(data.prowData.accessibleRoute ? data.prowData.accessibleRoute : false);
        setSourceText(data.prowData.sourceText ? data.prowData.sourceText : "");
        setOrganisation(data.prowData.prowOrgRefConsultant);
        setDistrict(data.prowData.prowDistrictRefConsultant);
        setDiversionRelatedUsrn(data.prowData.divRelatedUsrn);
        setPedestrianAccess(data.prowData.pedAccess ? data.prowData.pedAccess : false);
        setEquestrianAccess(data.prowData.equAccess ? data.prowData.equAccess : false);
        setNonMotorisedAccess(data.prowData.nonMotAccess ? data.prowData.nonMotAccess : false);
        setCycleAccess(data.prowData.cycAccess ? data.prowData.cycAccess : false);
        setMotorisedAccess(data.prowData.motAccess ? data.prowData.motAccess : false);
        setStartDate(data.prowData.recordStartDate);
        setRelevantStartDate(data.prowData.relevantStartDate);
        setEndDate(data.prowData.recordEndDate);
        setConsultationStartDate(data.prowData.consultStartDate);
        setConsultationCloseDate(data.prowData.consultEndDate);
        setConsultationReference(data.prowData.consultRef ? data.prowData.consultRef : "");
        setConsultationDetails(data.prowData.consultDetails ? data.prowData.consultDetails : "");
        setAppealDate(data.prowData.appealDate);
        setAppealReference(data.prowData.appealRef ? data.prowData.appealRef : "");
        setAppealDetails(data.prowData.appealDetails ? data.prowData.appealDetails : "");
      }
    }
    setDataChanged(false);
    if (onHomeClick) onHomeClick("discard", data.prowData, null);
  };

  /**
   * Method to return the current public rights of way record.
   *
   * @param {string} field The name of the field that is being updated.
   * @param {string|boolean|Date|number|null} newValue The value used to update the given field.
   * @returns {object} The current public rights of way record.
   */
  function GetCurrentData(field, newValue) {
    return {
      changeType:
        field && field === "changeType" ? newValue : !data.prowData.pkId || data.prowData.pkId < 0 ? "I" : "U",
      prowUsrn: data.prowData.prowUsrn,
      defMapGeometryType: field && field === "defMapGeometryType" ? newValue : defMapGeometryType,
      defMapGeometryCount: data.prowData.defMapGeometryCount,
      prowLength: field && field === "prowLength" ? newValue : prowLength,
      prowRights: field && field === "dedication" ? newValue : dedication,
      pedAccess: field && field === "pedestrianAccess" ? newValue : pedestrianAccess,
      equAccess: field && field === "equestrianAccess" ? newValue : equestrianAccess,
      nonMotAccess: field && field === "nonMotorisedAccess" ? newValue : nonMotorisedAccess,
      cycAccess: field && field === "cycleAccess" ? newValue : cycleAccess,
      motAccess: field && field === "motorisedAccess" ? newValue : motorisedAccess,
      recordStartDate:
        field && field === "startDate" ? newValue && ConvertDate(newValue) : startDate && ConvertDate(startDate),
      relevantStartDate:
        field && field === "relevantStartDate"
          ? newValue && ConvertDate(newValue)
          : relevantStartDate && ConvertDate(relevantStartDate),
      recordEndDate: field && field === "endDate" ? newValue && ConvertDate(newValue) : endDate && ConvertDate(endDate),
      prowStatus: field && field === "status" ? newValue : status,
      consultStartDate:
        field && field === "consultationStartDate"
          ? newValue && ConvertDate(newValue)
          : consultationStartDate && ConvertDate(consultationStartDate),
      consultEndDate:
        field && field === "consultationCloseDate"
          ? newValue && ConvertDate(newValue)
          : consultationCloseDate && ConvertDate(consultationCloseDate),
      consultRef: field && field === "consultationReference" ? newValue : consultationReference,
      consultDetails: field && field === "consultationDetails" ? newValue : consultationDetails,
      appealDate:
        field && field === "appealDate" ? newValue && ConvertDate(newValue) : appealDate && ConvertDate(appealDate),
      appealRef: field && field === "appealReference" ? newValue : appealReference,
      appealDetails: field && field === "appealDetails" ? newValue : appealDetails,
      divRelatedUsrn: field && field === "diversionRelatedUsrn" ? newValue : diversionRelatedUsrn,
      prowLocation: field && field === "location" ? newValue : location,
      prowDetails: field && field === "details" ? newValue : details,
      promotedRoute: field && field === "promotedRoute" ? newValue : promotedRoute,
      accessibleRoute: field && field === "accessibleRoute" ? newValue : accessibleRoute,
      sourceText: field && field === "sourceText" ? newValue : sourceText,
      prowOrgRefConsultant: field && field === "organisation" ? newValue : organisation,
      prowDistrictRefConsultant: field && field === "district" ? newValue : district,
      neverExport: data.prowData.neverExport,
      wktGeometry: data.prowData.wktGeometry,
      pkId: data.prowData.pkId,
      entryDate: data.prowData.entryDate,
      lastUpdateDate: data.prowData.lastUpdateDate,
    };
  }

  /**
   * Event to handle when the add public rights of way button is clicked.
   */
  const handleAddPRoW = () => {
    if (onAdd) onAdd();
    if (!dataChanged) setDataChanged(true);
  };

  /**
   * Event to handle when the delete public rights of way button is clicked.
   */
  const handleDeletePRoW = () => {
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
   * Event to handle when the message dialog is closed.
   *
   * @param {string} action The action taken from the message dialog.
   */
  const handleCloseMessageDialog = (action) => {
    if (action === "continue") {
      setDefMapGeometryType(true);
      if (!dataChanged) {
        setDataChanged(!defMapGeometryType);
        if (onDataChanged && !defMapGeometryType) onDataChanged();
      }
      UpdateSandbox("defMapGeometryType", true);

      mapContext.onEditMapObject(null, null);
      informationContext.onClearInformation();
    }

    setShowExactWarning(false);
  };

  useEffect(() => {
    if (!loading && data && data.prowData) {
      setDedication(data.prowData.prowRights);
      setStatus(data.prowData.prowStatus);
      setLocation(data.prowData.prowLocation ? data.prowData.prowLocation : "");
      setDetails(data.prowData.prowDetails ? data.prowData.prowDetails : "");
      setProwLength(data.prowData.prowLength ? data.prowData.prowLength : 0);
      setPromotedRoute(data.prowData.promotedRoute ? data.prowData.promotedRoute : false);
      setAccessibleRoute(data.prowData.accessibleRoute ? data.prowData.accessibleRoute : false);
      setSourceText(data.prowData.sourceText ? data.prowData.sourceText : "");
      setOrganisation(data.prowData.prowOrgRefConsultant);
      setDistrict(data.prowData.prowDistrictRefConsultant);
      setDiversionRelatedUsrn(data.prowData.divRelatedUsrn);
      setPedestrianAccess(data.prowData.pedAccess ? data.prowData.pedAccess : false);
      setEquestrianAccess(data.prowData.equAccess ? data.prowData.equAccess : false);
      setNonMotorisedAccess(data.prowData.nonMotAccess ? data.prowData.nonMotAccess : false);
      setCycleAccess(data.prowData.cycAccess ? data.prowData.cycAccess : false);
      setMotorisedAccess(data.prowData.motAccess ? data.prowData.motAccess : false);
      setStartDate(data.prowData.recordStartDate);
      setRelevantStartDate(data.prowData.relevantStartDate);
      setEndDate(data.prowData.recordEndDate);
      setConsultationStartDate(data.prowData.consultStartDate);
      setConsultationCloseDate(data.prowData.consultEndDate);
      setConsultationReference(data.prowData.consultRef ? data.prowData.consultRef : "");
      setConsultationDetails(data.prowData.consultDetails ? data.prowData.consultDetails : "");
      setAppealDate(data.prowData.appealDate);
      setAppealReference(data.prowData.appealRef ? data.prowData.appealRef : "");
      setAppealDetails(data.prowData.appealDetails ? data.prowData.appealDetails : "");

      setSwaOrgRefLookup(filteredLookup(SwaOrgRef, false));
    }
  }, [loading, data]);

  useEffect(() => {
    if (!defMapGeometryType && !informationContext.informationSource) {
      informationContext.onDisplayInformation("inexactASD", "PRoWDataTab");
    }
  }, [defMapGeometryType, informationContext]);

  useEffect(() => {
    if (sandboxContext.currentSandbox.sourceStreet && data && data.prowData) {
      const sourcePRoW = sandboxContext.currentSandbox.sourceStreet.publicRightOfWays.find((x) => x.pkId === data.id);

      if (sourcePRoW) {
        setDataChanged(
          !ObjectComparison(sourcePRoW, data.prowData, [
            "changeType",
            "neverExport",
            "endDate",
            "lastUpdateDate",
            "lastUpdated",
            "insertedTimestamp",
            "insertedUser",
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
    if (informationContext.informationSource && informationContext.informationSource === "PRoWDataTab") {
      setInformationAnchorEl(document.getElementById("prow-data"));
    } else setInformationAnchorEl(null);
  }, [informationContext.informationSource]);

  useEffect(() => {
    setDedicationError(null);
    setStatusError(null);
    setLocationError(null);
    setDetailsError(null);
    setDefMapGeometryTypeError(null);
    setProwLengthError(null);
    setPromotedRouteError(null);
    setAccessibleRouteError(null);
    setSourceTextError(null);
    setOrganisationError(null);
    setDistrictError(null);
    setDiversionRelatedUsrnError(null);
    setPedestrianAccessError(null);
    setEquestrianAccessError(null);
    setNonMotorisedAccessError(null);
    setCycleAccessError(null);
    setMotorisedAccessError(null);
    setStartDateError(null);
    setRelevantStartDateError(null);
    setEndDateError(null);
    setConsultationStartDateError(null);
    setConsultationCloseDateError(null);
    setConsultationReferenceError(null);
    setConsultationDetailsError(null);
    setAppealDateError(null);
    setAppealReferenceError(null);
    setAppealDetailsError(null);

    if (errors && errors.length > 0) {
      for (const error of errors) {
        switch (error.field.toLowerCase()) {
          case "prowrights":
            setDedicationError(error.errors);
            break;

          case "prowstatus":
            setStatusError(error.errors);
            break;

          case "prowlocation":
            setLocationError(error.errors);
            break;

          case "prowdetails":
            setDetailsError(error.errors);
            break;

          case "defmapgeometrytype":
            setDefMapGeometryTypeError(error.errors);
            break;

          case "prowlength":
            setProwLengthError(error.errors);
            break;

          case "promotedroute":
            setPromotedRouteError(error.errors);
            break;

          case "accessibleroute":
            setAccessibleRouteError(error.errors);
            break;

          case "sourcetext":
            setSourceTextError(error.errors);
            break;

          case "proworgrefconsultant":
            setOrganisationError(error.errors);
            break;

          case "prowdistrictrefconsultant":
            setDistrictError(error.errors);
            break;

          case "divrelatedusrn":
            setDiversionRelatedUsrnError(error.errors);
            break;

          case "pedaccess":
            setPedestrianAccessError(error.errors);
            break;

          case "equaccess":
            setEquestrianAccessError(error.errors);
            break;

          case "nonmotaccess":
            setNonMotorisedAccessError(error.errors);
            break;

          case "cycaccess":
            setCycleAccessError(error.errors);
            break;

          case "motaccess":
            setMotorisedAccessError(error.errors);
            break;

          case "recordstartdate":
            setStartDateError(error.errors);
            break;

          case "relevantstartdate":
            setRelevantStartDateError(error.errors);
            break;

          case "recordenddate":
            setEndDateError(error.errors);
            break;

          case "consultstartdate":
            setConsultationStartDateError(error.errors);
            break;

          case "consultenddate":
            setConsultationCloseDateError(error.errors);
            break;

          case "consultref":
            setConsultationReferenceError(error.errors);
            break;

          case "consultdetails":
            setConsultationDetailsError(error.errors);
            break;

          case "appealdate":
            setAppealDateError(error.errors);
            break;

          case "appealref":
            setAppealReferenceError(error.errors);
            break;

          case "appealdetails":
            setAppealDetailsError(error.errors);
            break;

          default:
            break;
        }
      }
    }
  }, [errors]);

  return (
    <Fragment>
      <Box sx={toolbarStyle} id={"prow-data"}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
            {streetContext.currentRecord.type === 66 && streetContext.currentRecord.newRecord ? (
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
              variant="square"
              sx={{
                height: theme.spacing(2),
                width: theme.spacing(2),
                backgroundColor: adsDarkGreen,
                color: adsWhite,
                clipPath: "polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%)",
              }}
            >
              <DirectionsWalk
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
              {streetContext.currentRecord.type === 66 && streetContext.currentRecord.newRecord
                ? "Add new public right of way"
                : `Public right of way (${data.index + 1} of ${data.totalRecords})`}
            </Typography>
          </Stack>
          {!(streetContext.currentRecord.type === 66 && streetContext.currentRecord.newRecord) && (
            <Stack direction="row" alignItems="center" justifyContent="flex-end">
              <ADSActionButton
                variant="delete"
                disabled={!userCanEdit}
                tooltipTitle="Delete PRoW record"
                tooltipPlacement="right"
                onClick={handleDeletePRoW}
              />
              <ADSActionButton
                variant="add"
                disabled={!userCanEdit}
                tooltipTitle="Add new PRoW record"
                tooltipPlacement="right"
                onClick={handleAddPRoW}
              />
            </Stack>
          )}
        </Stack>
      </Box>
      <Box sx={dataFormStyle("77.7vh")}>
        <ADSSelectControl
          label="Dedication"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "ProwRights" : false}
          loading={loading}
          useRounded
          doNotSetTitleCase
          lookupData={PRoWDedicationCode}
          lookupId="id"
          lookupLabel={GetLookupLabel(false)}
          lookupColour={adsDarkGreen}
          value={dedication}
          errorText={dedicationError}
          onChange={handleDedicationChangeEvent}
          helperText="PRoW Dedication."
        />
        <ADSSelectControl
          label="Status"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "ProwStatus" : false}
          loading={loading}
          useRounded
          doNotSetTitleCase
          lookupData={PRoWStatusCode}
          lookupId="id"
          lookupLabel={GetLookupLabel(false)}
          lookupColour={adsDarkGreen}
          value={status}
          errorText={statusError}
          onChange={handleStatusChangeEvent}
          helperText="The status of the PRoW."
        />
        <ADSTextControl
          label="Location"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "ProwLocation" : false}
          loading={loading}
          value={location}
          maxLength={500}
          minLines={3}
          maxLines={5}
          id="prow_location"
          characterSet="GeoPlaceStreet1"
          errorText={locationError}
          helperText="Descriptive location of the PRoW as defined in the PRoW Definitive Statement."
          onChange={handleLocationChangeEvent}
        />
        <ADSTextControl
          label="Details"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "ProwDetails" : false}
          loading={loading}
          value={details}
          maxLength={500}
          minLines={3}
          maxLines={5}
          id="prow_details"
          characterSet="GeoPlaceStreet1"
          errorText={detailsError}
          helperText="Official Reference of the PROW designation, followed by descriptive details of the PRoW as defined in the PRoW Definitive Statement."
          onChange={handleDetailsChangeEvent}
        />
        <ADSWholeRoadControl
          variant="PRoW"
          label="Match to street route"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "DefMapGeometryType" : false}
          loading={loading}
          value={defMapGeometryType}
          helperText="Does the PRoW follow the exact route described in the type 13 ESU record."
          errorText={defMapGeometryTypeError}
          onChange={handleDefMapGeometryTypeChangeEvent}
        />
        <ADSNumberControl
          label="Length (m)"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "ProwLength" : false}
          loading={loading}
          value={prowLength}
          errorText={prowLengthError}
          helperText="Length in metres."
          onChange={handleProwLengthChangeEvent}
        />
        <ADSSwitchControl
          label="Promoted route"
          isEditable={userCanEdit}
          isFocused={focusedField ? focusedField === "PromotedRoute" : false}
          loading={loading}
          checked={promotedRoute}
          trueLabel="Yes"
          falseLabel="No"
          errorText={promotedRouteError}
          helperText="Route defined by the Surveying Authority as a recommended/promoted route."
          onChange={handlePromotedRouteChangeEvent}
        />
        <ADSSwitchControl
          label="Accessible route"
          isEditable={userCanEdit}
          isFocused={focusedField ? focusedField === "AccessibleRoute" : false}
          loading={loading}
          checked={accessibleRoute}
          trueLabel="Yes"
          falseLabel="No"
          errorText={accessibleRouteError}
          helperText="Route defined by the Surveying Authority as an accessible route for elderly and disabled."
          onChange={handleAccessibleRouteChangeEvent}
        />
        <ADSTextControl
          label="Source"
          isEditable={userCanEdit}
          isFocused={focusedField ? focusedField === "SourceText" : false}
          loading={loading}
          value={sourceText}
          maxLength={120}
          minLines={1}
          maxLines={3}
          id="prow_source"
          characterSet="GeoPlaceStreet1"
          errorText={sourceTextError}
          helperText="A brief textual summary of the department/function and/or organisation that is the source of this data."
          onChange={handleSourceTextChangeEvent}
        />
        <ADSNumberControl
          label="Diversion USRN"
          isEditable={userCanEdit}
          isRequired={status && status === "D"}
          isFocused={focusedField ? focusedField === "DivRelatedUsrn" : false}
          loading={loading}
          value={diversionRelatedUsrn}
          errorText={diversionRelatedUsrnError}
          helperText="RECORD_TYPE = 3 Street USRN for the PRoW that is being diverted."
          onChange={handleDiversionRelatedUsrnChangeEvent}
        />
        <ADSSelectControl
          label="Organisation"
          isEditable={userCanEdit}
          isFocused={focusedField ? focusedField === "ProwOrgRefConsultant" : false}
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
          helperText="The Surveying Authority which must be consulted about the PRoW."
        />
        <ADSSelectControl
          label="District"
          isEditable={userCanEdit}
          isFocused={focusedField ? focusedField === "prowDistrictRefConsultant" : false}
          loading={loading}
          useRounded
          doNotSetTitleCase
          lookupData={filteredOperationalDistricts(lookupContext.currentLookups.operationalDistricts, organisation)}
          lookupId="districtId"
          lookupLabel="districtName"
          lookupColour="colour"
          value={district}
          errorText={districtError}
          onChange={handleDistrictChangeEvent}
          helperText="The Operational District for the Surveying Authority which must be consulted about the PRoW."
        />
        <ADSDateControl
          label="Start date"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "RecordStartDate" : false}
          loading={loading}
          value={startDate}
          helperText="Date when the Record came into effect."
          errorText={startDateError}
          onChange={handleStartDateChangeEvent}
        />
        <ADSDateControl
          label="Relevant start date"
          isEditable={userCanEdit}
          isFocused={focusedField ? focusedField === "RelevantStartDate" : false}
          loading={loading}
          value={relevantStartDate}
          helperText="Date when the Record became Relevant (active) as defined by the legal order."
          errorText={relevantStartDateError}
          onChange={handleRelevantStartDateChangeEvent}
        />
        {status && status === "E" && (
          <ADSDateControl
            label="End date"
            isEditable={userCanEdit}
            isRequired
            isFocused={focusedField ? focusedField === "RecordEndDate" : false}
            loading={loading}
            value={endDate}
            helperText="Date when the Record was Extinguished."
            errorText={endDateError}
            onChange={handleEndDateChangeEvent}
          />
        )}
        <Grid container justifyContent="flex-start" alignItems="baseline" sx={FormRowStyle()}>
          <Grid item xs={3}>
            <Typography variant="body2" align="left" id="access-label" color="textPrimary">
              Access
            </Typography>
          </Grid>
          <Grid item xs={9}>
            <Grid container direction="column" justifyContent="flex-start" alignItems="flex-start">
              <Grid item>
                <ADSProwAccessControl
                  variant="Pedestrian"
                  value={pedestrianAccess}
                  isEditable={userCanEdit}
                  isFocused={focusedField ? focusedField === "PedAccess" : false}
                  loading={loading}
                  errorText={pedestrianAccessError}
                  onChange={handlePedestrianAccessChangeEvent}
                />
              </Grid>
              <Grid item>
                <ADSProwAccessControl
                  variant="Equestrian"
                  value={equestrianAccess}
                  isEditable={userCanEdit}
                  isFocused={focusedField ? focusedField === "EquAccess" : false}
                  loading={loading}
                  errorText={equestrianAccessError}
                  onChange={handleEquestrianAccessChangeEvent}
                />
              </Grid>
              <Grid item>
                <ADSProwAccessControl
                  variant="NonMotorised"
                  value={nonMotorisedAccess}
                  isEditable={userCanEdit}
                  isFocused={focusedField ? focusedField === "NonMotAccess" : false}
                  loading={loading}
                  errorText={nonMotorisedAccessError}
                  onChange={handleNonMotorisedAccessChangeEvent}
                />
              </Grid>
              <Grid item>
                <ADSProwAccessControl
                  variant="Bicycle"
                  value={cycleAccess}
                  isEditable={userCanEdit}
                  isFocused={focusedField ? focusedField === "CycAccess" : false}
                  loading={loading}
                  errorText={cycleAccessError}
                  onChange={handleCycleAccessChangeEvent}
                />
              </Grid>
              <Grid item>
                <ADSProwAccessControl
                  variant="Motorised"
                  value={motorisedAccess}
                  isEditable={userCanEdit}
                  isFocused={focusedField ? focusedField === "MotAccess" : false}
                  loading={loading}
                  errorText={motorisedAccessError}
                  onChange={handleMotorisedAccessChangeEvent}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Accordion
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            "&:not(:last-child)": {
              borderBottom: 0,
            },
            "&:before": {
              display: "none",
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ArrowForwardIosSharp sx={{ fontSize: "0.9rem" }} />}
            sx={{
              flexDirection: "row-reverse",
              "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
                transform: "rotate(90deg)",
              },
              "& .MuiAccordionSummary-content": {
                ml: theme.spacing(1),
              },
              "&:hover": {
                backgroundColor: adsLightBlue10,
                color: adsBlueA,
              },
            }}
          >
            <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
              <Avatar
                variant="square"
                sx={{
                  height: theme.spacing(2),
                  width: theme.spacing(2),
                  backgroundColor: adsDarkGreen,
                  color: adsWhite,
                  clipPath: "polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%)",
                }}
              >
                <QuestionAnswer
                  sx={{
                    height: theme.spacing(1.5),
                    width: theme.spacing(1.5),
                  }}
                />
              </Avatar>
              <Typography variant="subtitle2">Consultation</Typography>
              {(consultationReference || consultationDetails || consultationStartDate || consultationCloseDate) && (
                <Avatar
                  sx={{
                    height: theme.spacing(2),
                    width: theme.spacing(2),
                    color: adsDarkGreen,
                    backgroundColor: adsWhite,
                    "&:hover": {
                      backgroundColor: adsLightBlue10,
                    },
                  }}
                >
                  <Done
                    sx={{
                      height: theme.spacing(2),
                      width: theme.spacing(2),
                      "&:hover": {
                        backgroundColor: adsLightBlue10,
                      },
                    }}
                  />
                </Avatar>
              )}
            </Stack>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              p: theme.spacing(2),
              borderTop: `1px solid ${adsBlack125}`,
            }}
          >
            <ADSTextControl
              label="Reference"
              isEditable={userCanEdit}
              isRequired={status && status === "C"}
              isFocused={focusedField ? focusedField === "ConsultRef" : false}
              loading={loading}
              value={consultationReference}
              maxLength={16}
              id="prow_consult_ref"
              errorText={consultationReferenceError}
              helperText="Any formal reference for the consultation."
              onChange={handleConsultationReferenceChangeEvent}
            />
            <ADSTextControl
              label="Details"
              isEditable={userCanEdit}
              isRequired={status && status === "C"}
              isFocused={focusedField ? focusedField === "ConsultDetails" : false}
              loading={loading}
              value={consultationDetails}
              maxLength={30}
              id="prow_consult_details"
              characterSet="GeoPlaceStreet1"
              errorText={consultationDetailsError}
              helperText="Brief summary of the consultation."
              onChange={handleConsultationDetailsChangeEvent}
            />
            <ADSDateControl
              label="Start date"
              isEditable={userCanEdit}
              isRequired={status && status === "C"}
              isFocused={focusedField ? focusedField === "ConsultStartDate" : false}
              loading={loading}
              value={consultationStartDate}
              helperText="Date when the consultation starts."
              errorText={consultationStartDateError}
              onChange={handleConsultationStartDateChangeEvent}
            />
            <ADSDateControl
              label="Close date"
              isEditable={userCanEdit}
              isRequired={status && status === "C"}
              isFocused={focusedField ? focusedField === "ConsultEndDate" : false}
              loading={loading}
              value={consultationCloseDate}
              helperText="Date when the consultation closes."
              errorText={consultationCloseDateError}
              onChange={handleConsultationCloseDateChangeEvent}
            />
          </AccordionDetails>
        </Accordion>
        <Accordion
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            "&:not(:last-child)": {
              borderBottom: 0,
            },
            "&:before": {
              display: "none",
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ArrowForwardIosSharp sx={{ fontSize: "0.9rem" }} />}
            sx={{
              flexDirection: "row-reverse",
              "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
                transform: "rotate(90deg)",
              },
              "& .MuiAccordionSummary-content": {
                ml: theme.spacing(1),
              },
              "&:hover": {
                backgroundColor: adsLightBlue10,
                color: adsBlueA,
              },
            }}
          >
            <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
              <Avatar
                variant="square"
                sx={{
                  height: theme.spacing(2),
                  width: theme.spacing(2),
                  backgroundColor: adsDarkGreen,
                  color: adsWhite,
                  clipPath: "polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%)",
                }}
              >
                <Flag
                  sx={{
                    height: theme.spacing(2),
                    width: theme.spacing(2),
                  }}
                />
              </Avatar>
              <Typography variant="subtitle2">Appeal</Typography>
              {(appealReference || appealDetails || appealDate) && (
                <Avatar
                  sx={{
                    height: theme.spacing(2),
                    width: theme.spacing(2),
                    color: adsDarkGreen,
                    backgroundColor: adsWhite,
                    "&:hover": {
                      backgroundColor: adsLightBlue10,
                    },
                  }}
                >
                  <Done
                    sx={{
                      height: theme.spacing(2),
                      width: theme.spacing(2),
                      "&:hover": {
                        backgroundColor: adsLightBlue10,
                      },
                    }}
                  />
                </Avatar>
              )}
            </Stack>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              p: theme.spacing(2),
              borderTop: `1px solid ${adsBlack125}`,
            }}
          >
            <ADSTextControl
              label="Reference"
              isEditable={userCanEdit}
              isRequired={status && status === "A"}
              isFocused={focusedField ? focusedField === "AppealRef" : false}
              loading={loading}
              value={appealReference}
              maxLength={16}
              id="prow_appeal_ref"
              errorText={appealReferenceError}
              helperText="Any formal reference for the appeal."
              onChange={handleAppealReferenceChangeEvent}
            />
            <ADSTextControl
              label="Details"
              isEditable={userCanEdit}
              isRequired={status && status === "A"}
              isFocused={focusedField ? focusedField === "AppealDetails" : false}
              loading={loading}
              value={appealDetails}
              maxLength={30}
              id="prow_appeal_details"
              characterSet="GeoPlaceStreet1"
              errorText={appealDetailsError}
              helperText="Brief summary of the appeal."
              onChange={handleAppealDetailsChangeEvent}
            />
            <ADSDateControl
              label="Date"
              isEditable={userCanEdit}
              isRequired={status && status === "A"}
              isFocused={focusedField ? focusedField === "AppealDate" : false}
              loading={loading}
              value={appealDate}
              helperText="Date the appeal was raised."
              errorText={appealDateError}
              onChange={handleAppealDateChangeEvent}
            />
          </AccordionDetails>
        </Accordion>
        <ADSOkCancelControl
          okDisabled={!dataChanged}
          onOkClicked={handleOkClicked}
          onCancelClicked={handleCancelClicked}
        />
      </Box>
      <div>
        <ConfirmDeleteDialog variant="prow" open={openDeleteConfirmation} onClose={handleCloseDeleteConfirmation} />
        <MessageDialog isOpen={showExactWarning} variant="cancelASDInexact" onClose={handleCloseMessageDialog} />
      </div>
      <Popper id={informationId} open={informationOpen} anchorEl={informationAnchorEl} placement="top-start">
        <ADSInformationControl variant={"inexactASD"} />
      </Popper>
    </Fragment>
  );
}

export default PRoWDataTab;
