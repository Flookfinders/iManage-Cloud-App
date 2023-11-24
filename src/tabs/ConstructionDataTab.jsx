/* #region header */
/**************************************************************************************************
//
//  Description: Construction data tab
//
//  Copyright:    © 2021 - 2023 Idox Software Limited.
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

import { ConvertDate } from "../utils/HelperUtils";
import { Avatar, Grid, Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { GetLookupLabel } from "../utils/HelperUtils";
import { FilteredSwaOrgRef, FilteredReinstatementType } from "../utils/StreetUtils";
import ObjectComparison from "../utils/ObjectComparison";

import ConstructionType from "../data/ConstructionType";
import AggregateAbrasionValue from "../data/AggregateAbrasionValue";
import PolishedStoneValue from "../data/PolishedStoneValue";

import ADSActionButton from "../components/ADSActionButton";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSDateControl from "../components/ADSDateControl";
import ADSWholeRoadControl from "../components/ADSWholeRoadControl";
import ADSTextControl from "../components/ADSTextControl";
import ADSOkCancelControl from "../components/ADSOkCancelControl";
import ADSSwitchControl from "../components/ADSSwitchControl";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";

import { Texture } from "@mui/icons-material";
import { adsWhite, adsPink } from "../utils/ADSColours";
import { streetToolbarStyle, dataFormStyle } from "../utils/ADSStyles";
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

  const [dataChanged, setDataChanged] = useState(false);

  const [swaOrgRefLookup, setSwaOrgRefLookup] = useState(FilteredSwaOrgRef(false));
  const [reinstatementTypeLookup, setReinstatementTypeLookup] = useState(FilteredReinstatementType(false));

  const [constructionType, setConstructionType] = useState(
    data && data.constructionData ? data.constructionData.constructionType : null
  );
  const [reinstatementType, setReinstatementType] = useState(
    data && data.constructionData ? data.constructionData.reinstatementTypeCode : null
  );
  const [aggregateAbrasionValue, setAggregateAbrasionValue] = useState(
    data && data.constructionData ? data.constructionData.aggregateAbrasionVal : null
  );
  const [polishedStoneValue, setPolishedStoneValue] = useState(
    data && data.constructionData ? data.constructionData.polishedStoneVal : null
  );
  const [frostHeaveSusceptibility, setFrostHeaveSusceptibility] = useState(
    data && data.constructionData ? data.constructionData.frostHeaveSusceptibility : false
  );
  const [steppedJoint, setSteppedJoint] = useState(
    data && data.constructionData ? data.constructionData.steppedJoint : false
  );
  const [constructionDescription, setConstructionDescription] = useState(
    data && data.constructionData ? data.constructionData.constructionDescription : null
  );
  const [organisation, setOrganisation] = useState(
    data && data.constructionData ? data.constructionData.swaOrgRefConsultant : null
  );
  const [district, setDistrict] = useState(
    data && data.constructionData ? data.constructionData.districtRefConsultant : null
  );
  const [startDate, setStartDate] = useState(
    data && data.constructionData ? data.constructionData.recordStartDate : null
  );
  const [wholeRoad, setWholeRoad] = useState(data && data.constructionData ? data.constructionData.wholeRoad : true);
  const [specifyLocation, setSpecifyLocation] = useState(
    data && data.constructionData ? data.constructionData.specificLocation : null
  );
  const [constructionStartX, setConstructionStartX] = useState(
    data && data.constructionData ? data.constructionData.constructionStartX : null
  );
  const [constructionStartY, setConstructionStartY] = useState(
    data && data.constructionData ? data.constructionData.constructionStartY : null
  );
  const [constructionEndX, setConstructionEndX] = useState(
    data && data.constructionData ? data.constructionData.constructionEndX : null
  );
  const [constructionEndY, setConstructionEndY] = useState(
    data && data.constructionData ? data.constructionData.constructionEndY : null
  );

  const [userCanEdit, setUserCanEdit] = useState(false);

  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);

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
  const [wholeRoadError, setWholeRoadError] = useState(null);
  const [specifyLocationError, setSpecifyLocationError] = useState(null);

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
    else mapContext.onEditMapObject(62, data && data.constructionData && data.constructionData.pkId);
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
        setWholeRoad(data.constructionData.wholeRoad);
        setSpecifyLocation(data.constructionData.specificLocation);
        setConstructionStartX(data.constructionData.constructionStartX);
        setConstructionStartY(data.constructionData.constructionStartY);
        setConstructionEndX(data.constructionData.constructionEndX);
        setConstructionEndY(data.constructionData.constructionEndY);
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
      recordEndDate: data.constructionData.recordEndDate,
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
      setWholeRoad(data.constructionData.wholeRoad);
      setSpecifyLocation(data.constructionData.specificLocation);
      setConstructionStartX(data.constructionData.constructionStartX);
      setConstructionStartY(data.constructionData.constructionStartY);
      setConstructionEndX(data.constructionData.constructionEndX);
      setConstructionEndY(data.constructionData.constructionEndY);

      setSwaOrgRefLookup(FilteredSwaOrgRef(false));
      setReinstatementTypeLookup(FilteredReinstatementType(false));
    }
  }, [loading, data]);

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
      <Box sx={streetToolbarStyle}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Grid container justifyContent="flex-start" alignItems="center">
              <Grid item>
                <ADSActionButton
                  variant="home"
                  tooltipTitle="Home"
                  tooltipPlacement="bottom"
                  onClick={handleHomeClick}
                />
              </Grid>
              <Grid item>
                <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
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
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Grid container justifyContent="flex-end" alignItems="center">
              <Grid item>
                <ADSActionButton
                  variant="delete"
                  disabled={!userCanEdit}
                  tooltipTitle="Delete construction record"
                  tooltipPlacement="right"
                  onClick={handleDeleteConstruction}
                />
              </Grid>
              <Grid item>
                <ADSActionButton
                  variant="add"
                  disabled={!userCanEdit}
                  tooltipTitle="Add new construction record"
                  tooltipPlacement="right"
                  onClick={handleAddConstruction}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
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
          lookupData={lookupContext.currentLookups.operationalDistricts}
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
        <ADSWholeRoadControl
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
      </div>
    </Fragment>
  );
}

export default ConstructionDataTab;
