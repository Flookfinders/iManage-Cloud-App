/* #region header */
/**************************************************************************************************
//
//  Description: Construction data tab
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
//    009   16.01.24 Sean Flook                 Changes required to fix warnings.
//    010   23.01.24 Sean Flook       IMANN-246 Display information when selecting Part Road.
//    011   25.01.24 Sean Flook       IMANN-250 No need to default wholeRoad.
//    012   29.01.24 Sean Flook       IMANN-252 Restrict the characters that can be used in text fields.
//    013   05.02.24 Sean Flook                 Filter available districts by the organisation.
//    014   07.02.24 Sean Flook                 Display a warning dialog when changing from Part Road to Whole Road.
//    015   13.02.24 Sean Flook                 Set the ADSWholeRoadControl variant.
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

import { GetLookupLabel, filteredLookup } from "../utils/HelperUtils";
import { filteredOperationalDistricts } from "../utils/StreetUtils";
import ObjectComparison from "../utils/ObjectComparison";

import { ConvertDate } from "../utils/HelperUtils";
import { Avatar, Typography, Popper } from "@mui/material";
import { Box, Stack } from "@mui/system";

import ADSActionButton from "../components/ADSActionButton";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSDateControl from "../components/ADSDateControl";
import ADSWholeRoadControl from "../components/ADSWholeRoadControl";
import ADSTextControl from "../components/ADSTextControl";
import ADSOkCancelControl from "../components/ADSOkCancelControl";
import ADSSwitchControl from "../components/ADSSwitchControl";
import ADSInformationControl from "../components/ADSInformationControl";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";
import MessageDialog from "../dialogs/MessageDialog";

import ConstructionType from "../data/ConstructionType";
import AggregateAbrasionValue from "../data/AggregateAbrasionValue";
import PolishedStoneValue from "../data/PolishedStoneValue";
import SwaOrgRef from "../data/SwaOrgRef";
import ReinstatementType from "../data/ReinstatementType";

import { Texture } from "@mui/icons-material";
import { adsWhite, adsPink } from "../utils/ADSColours";
import { toolbarStyle, dataFormStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

ConstructionDataTab.propTypes = {
  data: PropTypes.object,
  errors: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  focusedField: PropTypes.string,
  onDataChanged: PropTypes.func.isRequired,
  onHomeClick: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

function ConstructionDataTab({ data, errors, loading, focusedField, onDataChanged, onHomeClick, onAdd, onDelete }) {
  const theme = useTheme();

  const lookupContext = useContext(LookupContext);
  const sandboxContext = useContext(SandboxContext);
  const userContext = useContext(UserContext);
  const mapContext = useContext(MapContext);
  const informationContext = useContext(InformationContext);

  const [dataChanged, setDataChanged] = useState(false);

  const [swaOrgRefLookup, setSwaOrgRefLookup] = useState(filteredLookup(SwaOrgRef, false));
  const [reinstatementTypeLookup, setReinstatementTypeLookup] = useState(filteredLookup(ReinstatementType, false));

  const [constructionType, setConstructionType] = useState(null);
  const [reinstatementType, setReinstatementType] = useState(null);
  const [aggregateAbrasionValue, setAggregateAbrasionValue] = useState(null);
  const [polishedStoneValue, setPolishedStoneValue] = useState(null);
  const [frostHeaveSusceptibility, setFrostHeaveSusceptibility] = useState(false);
  const [steppedJoint, setSteppedJoint] = useState(false);
  const [constructionDescription, setConstructionDescription] = useState("");
  const [organisation, setOrganisation] = useState(null);
  const [district, setDistrict] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [wholeRoad, setWholeRoad] = useState(true);
  const [specifyLocation, setSpecifyLocation] = useState("");
  const [constructionStartX, setConstructionStartX] = useState(0);
  const [constructionStartY, setConstructionStartY] = useState(0);
  const [constructionEndX, setConstructionEndX] = useState(0);
  const [constructionEndY, setConstructionEndY] = useState(0);

  const [userCanEdit, setUserCanEdit] = useState(false);

  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const [showWholeRoadWarning, setShowWholeRoadWarning] = useState(false);

  const [constructionTypeError, setConstructionTypeError] = useState(null);
  const [reinstatementTypeError, setReinstatementTypeError] = useState(null);
  const [aggregateAbrasionValueError, setAggregateAbrasionValueError] = useState(null);
  const [polishedStoneValueError, setPolishedStoneValueError] = useState(null);
  const [frostHeaveSusceptibilityError, setFrostHeaveSusceptibilityError] = useState(null);
  const [steppedJointError, setSteppedJointError] = useState(null);
  const [constructionDescriptionError, setConstructionDescriptionError] = useState(null);
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
    const newConstructionData = GetCurrentData(field, newValue);
    sandboxContext.onSandboxChange("construction", newConstructionData);
  };

  /**
   * Event to handle when the construction type is changed.
   *
   * @param {number|null} newValue The new construction type.
   */
  const handleConstructionTypeChangeEvent = (newValue) => {
    setConstructionType(newValue);
    if (!dataChanged) {
      setDataChanged(constructionType !== newValue);
      if (onDataChanged && constructionType !== newValue) onDataChanged();
    }
    UpdateSandbox("constructionType", newValue);
  };

  /**
   * Event to handle when the reinstatement type is changed.
   *
   * @param {number|null} newValue The new reinstatement type.
   */
  const handleReinstatementTypeChangeEvent = (newValue) => {
    setReinstatementType(newValue);
    if (!dataChanged) {
      setDataChanged(reinstatementType !== newValue);
      if (onDataChanged && reinstatementType !== newValue) onDataChanged();
    }
    UpdateSandbox("reinstatementType", newValue);
  };

  /**
   * Event to handle when the aggregate abrasion value is changed.
   *
   * @param {number|null} newValue The new aggregate abrasion value.
   */
  const handleAggregateAbrasionValueChangeEvent = (newValue) => {
    setAggregateAbrasionValue(newValue);
    if (!dataChanged) {
      setDataChanged(aggregateAbrasionValue !== newValue);
      if (onDataChanged && aggregateAbrasionValue !== newValue) onDataChanged();
    }
    UpdateSandbox("aggregateAbrasionValue", newValue);
  };

  /**
   * Event to handle when the polished stone value is changed.
   *
   * @param {number|null} newValue The new polished stone value.
   */
  const handlePolishedStoneValueChangeEvent = (newValue) => {
    setPolishedStoneValue(newValue);
    if (!dataChanged) {
      setDataChanged(polishedStoneValue !== newValue);
      if (onDataChanged && polishedStoneValue !== newValue) onDataChanged();
    }
    UpdateSandbox("polishedStoneValue", newValue);
  };

  /**
   * Event to handle when the frost heave susceptibility is changed.
   *
   * @param {number|null} newValue The new frost heave susceptibility.
   */
  const handleFrostHeaveSusceptibilityChangeEvent = (newValue) => {
    setFrostHeaveSusceptibility(newValue);
    if (!dataChanged) {
      setDataChanged(frostHeaveSusceptibility !== newValue);
      if (onDataChanged && frostHeaveSusceptibility !== newValue) onDataChanged();
    }
    UpdateSandbox("frostHeaveSusceptibility", newValue);
  };

  /**
   * Event to handle when the stepped joint is changed.
   *
   * @param {number|null} newValue The new stepped joint.
   */
  const handleSteppedJointChangeEvent = (newValue) => {
    setSteppedJoint(newValue);
    if (!dataChanged) {
      setDataChanged(steppedJoint !== newValue);
      if (onDataChanged && steppedJoint !== newValue) onDataChanged();
    }
    UpdateSandbox("steppedJoint", newValue);
  };

  /**
   * Event to handle when the description is changed.
   *
   * @param {string|null} newValue The new description.
   */
  const handleConstructionDescriptionChangeEvent = (newValue) => {
    setConstructionDescription(newValue);
    if (!dataChanged) {
      setDataChanged(constructionDescription !== newValue);
      if (onDataChanged && constructionDescription !== newValue) onDataChanged();
    }
    UpdateSandbox("constructionDescription", newValue);
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
    if (newValue && !wholeRoad) {
      setShowWholeRoadWarning(true);
    } else {
      setWholeRoad(newValue);
      if (!dataChanged) {
        setDataChanged(wholeRoad !== newValue);
        if (onDataChanged && wholeRoad !== newValue) onDataChanged();
      }
      UpdateSandbox("wholeRoad", newValue);
      if (newValue) {
        mapContext.onEditMapObject(null, null);
        informationContext.onClearInformation();
      } else {
        mapContext.onEditMapObject(62, data && data.constructionData && data.constructionData.pkId);
        informationContext.onDisplayInformation("partRoadASD", "ConstructionDataTab");
      }
    }
  };

  /**
   * Event to handle when the specific location is changed.
   *
   * @param {string|null} newValue The new specific location.
   */
  const handleSpecifyLocationChangeEvent = (newValue) => {
    setSpecifyLocation(newValue);
    if (!dataChanged) {
      setDataChanged(specifyLocation !== newValue);
      if (onDataChanged && specifyLocation !== newValue) onDataChanged();
    }
    UpdateSandbox("specifyLocation", newValue);
  };

  /**
   * Event to handle when the home button is clicked.
   */
  const handleHomeClick = () => {
    const sourceConstruction =
      data.pkId > 0 && sandboxContext.currentSandbox.sourceStreet
        ? sandboxContext.currentSandbox.sourceStreet.constructions.find((x) => x.pkId === data.pkId)
        : null;

    if (onHomeClick)
      setDataChanged(
        onHomeClick(
          dataChanged
            ? sandboxContext.currentSandbox.currentStreetRecords.construction
              ? "check"
              : "discard"
            : "discard",
          sourceConstruction,
          sandboxContext.currentSandbox.currentStreetRecords.construction
        )
      );
  };

  /**
   * Event to handle when the OK button is clicked.
   */
  const handleOkClicked = () => {
    if (onHomeClick)
      setDataChanged(onHomeClick("save", null, sandboxContext.currentSandbox.currentStreetRecords.construction));
  };

  /**
   * Event to handle when the Cancel button is clicked.
   */
  const handleCancelClicked = () => {
    if (dataChanged) {
      if (data && data.constructionData) {
        setConstructionType(data.constructionData.constructionType);
        setReinstatementType(data.constructionData.reinstatementTypeCode);
        setAggregateAbrasionValue(data.constructionData.aggregateAbrasionVal);
        setPolishedStoneValue(data.constructionData.polishedStoneVal);
        setFrostHeaveSusceptibility(data.constructionData.frostHeaveSusceptibility);
        setSteppedJoint(data.constructionData.steppedJoint);
        setConstructionDescription(data.constructionData.constructionDescription);
        setOrganisation(data.constructionData.swaOrgRefConsultant);
        setDistrict(data.constructionData.districtRefConsultant);
        setStartDate(data.constructionData.recordStartDate);
        setEndDate(data.constructionData.recordEndDate);
        setWholeRoad(data.constructionData.wholeRoad);
        setSpecifyLocation(data.constructionData.specificLocation ? data.constructionData.specificLocation : "");
        setConstructionStartX(data.constructionData.constructionStartX ? data.constructionData.constructionStartX : 0);
        setConstructionStartY(data.constructionData.constructionStartY ? data.constructionData.constructionStartY : 0);
        setConstructionEndX(data.constructionData.constructionEndX ? data.constructionData.constructionEndX : 0);
        setConstructionEndY(data.constructionData.constructionEndY ? data.constructionData.constructionEndY : 0);
      }
    }
    setDataChanged(false);
    if (onHomeClick) onHomeClick("discard", data.constructionData, null);
  };

  /**
   * Method to return the current construction record.
   *
   * @param {string} field The name of the field that is being updated.
   * @param {string|boolean|Date|number|null} newValue The value used to update the given field.
   * @returns {object} The current construction record.
   */
  function GetCurrentData(field, newValue) {
    return {
      changeType:
        field && field === "changeType"
          ? newValue
          : !data.constructionData.pkId || data.constructionData.pkId < 0
          ? "I"
          : "U",
      usrn: data.constructionData.usrn,
      seqNum: data.constructionData.seqNum,
      wholeRoad: field && field === "wholeRoad" ? newValue : wholeRoad,
      specificLocation: field && field === "specifyLocation" ? newValue : specifyLocation,
      neverExport: data.constructionData.neverExport,
      recordStartDate:
        field && field === "startDate" ? newValue && ConvertDate(newValue) : startDate && ConvertDate(startDate),
      recordEndDate: field && field === "endDate" ? newValue && ConvertDate(newValue) : endDate && ConvertDate(endDate),
      reinstatementTypeCode: field && field === "reinstatementType" ? newValue : reinstatementType,
      constructionType: field && field === "constructionType" ? newValue : constructionType,
      aggregateAbrasionVal: field && field === "aggregateAbrasionValue" ? newValue : aggregateAbrasionValue,
      polishedStoneVal: field && field === "polishedStoneValue" ? newValue : polishedStoneValue,
      frostHeaveSusceptibility: field && field === "frostHeaveSusceptibility" ? newValue : frostHeaveSusceptibility,
      steppedJoint: field && field === "steppedJoint" ? newValue : steppedJoint,
      asdCoordinate: data.constructionData.asdCoordinate,
      asdCoordinateCount: data.constructionData.asdCoordinateCount,
      constructionStartX: field && field === "constructionStartX" ? newValue : constructionStartX,
      constructionStartY: field && field === "constructionStartY" ? newValue : constructionStartY,
      constructionEndX: field && field === "constructionEndX" ? newValue : constructionEndX,
      constructionEndY: field && field === "constructionEndY" ? newValue : constructionEndY,
      constructionDescription: field && field === "constructionDescription" ? newValue : constructionDescription,
      swaOrgRefConsultant: field && field === "organisation" ? newValue : organisation,
      districtRefConsultant: field && field === "district" ? newValue : district,
      wktGeometry: data.constructionData.wktGeometry,
      pkId: data.constructionData.pkId,
      entryDate: data.constructionData.entryDate,
      lastUpdateDate: data.constructionData.lastUpdateDate,
    };
  }

  /**
   * Event to handle when the add construction button is clicked.
   */
  const handleAddConstruction = () => {
    if (onAdd) onAdd();
    if (!dataChanged) setDataChanged(true);
  };

  /**
   * Event to handle when the delete construction button is clicked.
   */
  const handleDeleteConstruction = () => {
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
      setWholeRoad(true);
      if (!dataChanged) {
        setDataChanged(!wholeRoad);
        if (onDataChanged && !wholeRoad) onDataChanged();
      }
      UpdateSandbox("wholeRoad", true);

      mapContext.onEditMapObject(null, null);
      informationContext.onClearInformation();
    }

    setShowWholeRoadWarning(false);
  };

  useEffect(() => {
    if (!loading && data && data.constructionData) {
      setConstructionType(data.constructionData.constructionType);
      setReinstatementType(data.constructionData.reinstatementTypeCode);
      setAggregateAbrasionValue(data.constructionData.aggregateAbrasionVal);
      setPolishedStoneValue(data.constructionData.polishedStoneVal);
      setFrostHeaveSusceptibility(data.constructionData.frostHeaveSusceptibility);
      setSteppedJoint(data.constructionData.steppedJoint);
      setConstructionDescription(data.constructionData.constructionDescription);
      setOrganisation(data.constructionData.swaOrgRefConsultant);
      setDistrict(data.constructionData.districtRefConsultant);
      setStartDate(data.constructionData.recordStartDate);
      setEndDate(data.constructionData.recordEndDate);
      setWholeRoad(data.constructionData.wholeRoad);
      setSpecifyLocation(data.constructionData.specificLocation ? data.constructionData.specificLocation : "");
      setConstructionStartX(data.constructionData.constructionStartX ? data.constructionData.constructionStartX : 0);
      setConstructionStartY(data.constructionData.constructionStartY ? data.constructionData.constructionStartY : 0);
      setConstructionEndX(data.constructionData.constructionEndX ? data.constructionData.constructionEndX : 0);
      setConstructionEndY(data.constructionData.constructionEndY ? data.constructionData.constructionEndY : 0);

      setSwaOrgRefLookup(filteredLookup(SwaOrgRef, false));
      setReinstatementTypeLookup(filteredLookup(ReinstatementType, false));
    }
  }, [loading, data]);

  useEffect(() => {
    if (!wholeRoad && !informationContext.informationSource) {
      informationContext.onDisplayInformation("partRoadASD", "ConstructionDataTab");
    }
  }, [wholeRoad, informationContext]);

  useEffect(() => {
    if (sandboxContext.currentSandbox.sourceStreet && data && data.constructionData) {
      const sourceConstruction = sandboxContext.currentSandbox.sourceStreet.constructions.find(
        (x) => x.pkId === data.id
      );

      if (sourceConstruction) {
        setDataChanged(
          !ObjectComparison(sourceConstruction, data.constructionData, [
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
    if (informationContext.informationSource && informationContext.informationSource === "ConstructionDataTab") {
      setInformationAnchorEl(document.getElementById("construction-data"));
    } else setInformationAnchorEl(null);
  }, [informationContext.informationSource]);

  useEffect(() => {
    setConstructionTypeError(null);
    setReinstatementTypeError(null);
    setAggregateAbrasionValueError(null);
    setPolishedStoneValueError(null);
    setFrostHeaveSusceptibilityError(null);
    setSteppedJointError(null);
    setConstructionDescriptionError(null);
    setOrganisationError(null);
    setDistrictError(null);
    setStartDateError(null);
    setEndDateError(null);
    setWholeRoadError(null);
    setSpecifyLocationError(null);

    if (errors && errors.length > 0) {
      for (const error of errors) {
        switch (error.field.toLowerCase()) {
          case "constructiontype":
            setConstructionTypeError(error.errors);
            break;

          case "reinstatementtypecode":
            setReinstatementTypeError(error.errors);
            break;

          case "aggregateabrasionval":
            setAggregateAbrasionValueError(error.errors);
            break;

          case "polishedstoneval":
            setPolishedStoneValueError(error.errors);
            break;

          case "frostheavesusceptibility":
            setFrostHeaveSusceptibilityError(error.errors);
            break;

          case "steppedjoint":
            setSteppedJointError(error.errors);
            break;

          case "constructiondescription":
            setConstructionDescriptionError(error.errors);
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
      <Box sx={toolbarStyle} id={"construction-data"}>
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
              variant="rounded"
              sx={{
                height: theme.spacing(2),
                width: theme.spacing(2),
                color: adsWhite,
                clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                backgroundColor: adsPink,
              }}
            >
              <Texture
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
              {` Construction (${data.index + 1} of ${data.totalRecords})`}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="flex-end">
            <ADSActionButton
              variant="delete"
              disabled={!userCanEdit}
              tooltipTitle="Delete construction record"
              tooltipPlacement="right"
              onClick={handleDeleteConstruction}
            />
            <ADSActionButton
              variant="add"
              disabled={!userCanEdit}
              tooltipTitle="Add new construction record"
              tooltipPlacement="right"
              onClick={handleAddConstruction}
            />
          </Stack>
        </Stack>
      </Box>
      <Box sx={dataFormStyle("77.7vh")}>
        <ADSSelectControl
          label="Construction type"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "ConstructionType" : false}
          loading={loading}
          useRounded
          doNotSetTitleCase
          lookupData={ConstructionType}
          lookupId="id"
          lookupLabel={GetLookupLabel(false)}
          lookupColour="colour"
          value={constructionType}
          errorText={constructionTypeError}
          onChange={handleConstructionTypeChangeEvent}
          helperText="The type of Construction that the Record applies to."
        />
        <ADSSelectControl
          label="Reinstatement type"
          isEditable={userCanEdit}
          isRequired={constructionType === 1}
          isFocused={focusedField ? focusedField === "ReinstatementTypeCode" : false}
          loading={loading}
          useRounded
          doNotSetTitleCase
          lookupData={reinstatementTypeLookup}
          lookupId="id"
          lookupLabel={GetLookupLabel(false)}
          lookupColour="colour"
          value={reinstatementType}
          errorText={reinstatementTypeError}
          onChange={handleReinstatementTypeChangeEvent}
          helperText="Reinstatement as defined in the SROH codes of practice."
        />
        <ADSSelectControl
          label="Aggregate abrasion value"
          isEditable={userCanEdit}
          isFocused={focusedField ? focusedField === "AggregateAbrasionVal" : false}
          loading={loading}
          useRounded
          doNotSetTitleCase
          lookupData={
            reinstatementType && AggregateAbrasionValue.filter((x) => x.reinstatementCode === reinstatementType)
          }
          lookupId="id"
          lookupLabel={GetLookupLabel(false)}
          value={aggregateAbrasionValue}
          errorText={aggregateAbrasionValueError}
          onChange={handleAggregateAbrasionValueChangeEvent}
          helperText="Value as defined in the SROH codes of practice."
        />
        <ADSSelectControl
          label="Polished stone value"
          isEditable={userCanEdit}
          isFocused={focusedField ? focusedField === "PolishedStoneVal" : false}
          loading={loading}
          useRounded
          doNotSetTitleCase
          lookupData={reinstatementType && PolishedStoneValue.filter((x) => x.reinstatementCode === reinstatementType)}
          lookupId="id"
          lookupLabel={GetLookupLabel(false)}
          value={polishedStoneValue}
          errorText={polishedStoneValueError}
          onChange={handlePolishedStoneValueChangeEvent}
          helperText="Value as defined in the SROH codes of practice."
        />
        <ADSSwitchControl
          label="Frost heave susceptibility"
          isEditable={userCanEdit}
          isFocused={focusedField ? focusedField === "FrostHeaveSusceptibility" : false}
          loading={loading}
          checked={frostHeaveSusceptibility}
          trueLabel="Yes"
          falseLabel="No"
          errorText={frostHeaveSusceptibilityError}
          // helperText="Set this if you do not want this street to be included in any exports."
          onChange={handleFrostHeaveSusceptibilityChangeEvent}
        />
        <ADSSwitchControl
          label="Stepped joint"
          isEditable={userCanEdit}
          isFocused={focusedField ? focusedField === "SteppedJoint" : false}
          loading={loading}
          checked={steppedJoint}
          trueLabel="Yes"
          falseLabel="No"
          errorText={steppedJointError}
          // helperText="Set this if you do not want this street to be included in any exports."
          onChange={handleSteppedJointChangeEvent}
        />
        <ADSTextControl
          label="Description"
          isEditable={userCanEdit}
          isFocused={focusedField ? focusedField === "ConstructionDescription" : false}
          loading={loading}
          value={constructionDescription}
          maxLength={250}
          minLines={3}
          maxLines={5}
          id="construction-description"
          characterSet="GeoPlaceStreet1"
          errorText={constructionDescriptionError}
          helperText="Description providing additional Construction information for certain definitions."
          onChange={handleConstructionDescriptionChangeEvent}
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
          helperText="Code to identify the Highway Authority which must be consulted about the Construction."
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
          helperText="Code to identify the Operational District of the Highway Authority which must be consulted about the Construction."
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
        <ADSWholeRoadControl
          variant="WholeRoad"
          label="Applied to"
          isEditable={userCanEdit}
          isRequired
          isFocused={focusedField ? focusedField === "WholeRoad" : false}
          loading={loading}
          value={wholeRoad}
          helperText="Indicator as to whether the Construction Record applies to the Whole Road."
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
            value={specifyLocation}
            maxLength={250}
            minLines={3}
            maxLines={5}
            id="construction-specify-location"
            characterSet="GeoPlaceStreet1"
            errorText={specifyLocationError}
            helperText="Description of location of the part or parts of the Street for which this Construction type is applicable."
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
        <ConfirmDeleteDialog
          variant="construction"
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

export default ConstructionDataTab;
