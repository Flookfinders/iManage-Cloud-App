/* #region header */
/**************************************************************************************************
//
//  Description: Wizard Property Details page
//
//  Copyright:    © 2023 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001            Sean Flook                 Initial Revision.
//    002   22.09.23 Sean Flook                 Changes required to handle Scottish classifications.
//    003   06.10.23 Sean Flook                 Use colour variables.
//    004   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system.
//    005   30.11.23 Sean Flook                 Changes required to handle Scottish authorities.
//    006   01.12.23 Sean Flook                 Added missing fields.
//    007   10.01.24 Sean Flook                 Fix warnings.
//    008   16.01.24 Sean Flook                 Changes required to fix warnings.
//    009   25.01.24 Sean Flook                 Changes required after UX review.
//    010   08.05.24 Sean Flook       IMANN-447 Added exclude from export and site visit to the options of fields that can be edited.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useEffect, Fragment } from "react";
import PropTypes from "prop-types";

import SettingsContext from "../context/settingsContext";

import { Grid, Card, CardHeader, CardActionArea, CardContent, Typography, Tooltip, IconButton } from "@mui/material";
import { Box, Stack } from "@mui/system";

import EditTemplateDialog from "../dialogs/EditTemplateDialog";

import { DateString } from "../utils/HelperUtils";
import {
  getBlpuStatus,
  getBlpuRpc,
  getBlpuState,
  getBlpuClassification,
  getLpiStatus,
  getLpiOfficialAddress,
  getLpiPostalAddress,
  getOtherProvenance,
} from "../utils/PropertyUtils";

import EditIcon from "@mui/icons-material/Edit";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";

import { adsRed } from "../utils/ADSColours";
import {
  ActionIconStyle,
  settingsCardStyle,
  settingsCardContentStyle,
  tooltipStyle,
  getTitleStyle,
} from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

WizardPropertyDetailsPage.propTypes = {
  data: PropTypes.object.isRequired,
  errors: PropTypes.object,
  onDataChanged: PropTypes.func.isRequired,
  onErrorChanged: PropTypes.func.isRequired,
};

function WizardPropertyDetailsPage({ data, errors, onDataChanged, onErrorChanged }) {
  const theme = useTheme();

  const settingsContext = useContext(SettingsContext);

  const [blpuData, setBlpuData] = useState(null);
  const [lpiData, setLpiData] = useState(null);
  const [classificationData, setClassificationData] = useState(null);
  const [otherData, setOtherData] = useState(null);

  const [blpuStatus, setBlpuStatus] = useState(null);
  const [blpuRpc, setBlpuRpc] = useState(null);
  const [blpuState, setBlpuState] = useState(null);
  const [blpuStateDate, setBlpuStateDate] = useState(null);
  const [blpuClassification, setBlpuClassification] = useState(null);
  const [excludeFromExport, setExcludeFromExport] = useState(false);
  const [siteVisit, setSiteVisit] = useState(false);
  const [blpuStartDate, setBlpuStartDate] = useState(null);
  const [lpiStatus, setLpiStatus] = useState(null);
  const [lpiLevel, setLpiLevel] = useState("");
  const [lpiOfficialAddress, setLpiOfficialAddress] = useState(null);
  const [lpiPostalAddress, setLpiPostalAddress] = useState(null);
  const [lpiStartDate, setLpiStartDate] = useState(null);
  const [classificationScheme, setClassificationScheme] = useState(null);
  const [classificationStartDate, setClassificationStartDate] = useState(null);
  const [otherProvenance, setOtherProvenance] = useState(null);
  const [otherProvenanceStartDate, setOtherProvenanceStartDate] = useState(null);
  const [otherNote, setOtherNote] = useState(null);

  const [editBlpu, setEditBlpu] = useState(false);
  const [editLpi, setEditLpi] = useState(false);
  const [editClassification, setEditClassification] = useState(false);
  const [editOther, setEditOther] = useState(false);

  const [haveBlpuErrors, setHaveBlpuErrors] = useState(false);
  const [haveLpiErrors, setHaveLpiErrors] = useState(false);
  const [haveClassificationErrors, setHaveClassificationErrors] = useState(false);
  const [haveOtherErrors, setHaveOtherErrors] = useState(false);

  const [blpuErrors, setBlpuErrors] = useState(null);
  const [lpiErrors, setLpiErrors] = useState(null);
  const [classificationErrors, setClassificationErrors] = useState(null);
  const [otherErrors, setOtherErrors] = useState(null);

  const [blpuStatusError, setBlpuStatusError] = useState(false);
  const [blpuRpcError, setBlpuRpcError] = useState(false);
  const [blpuStateError, setBlpuStateError] = useState(false);
  const [blpuStateDateError, setBlpuStateDateError] = useState(false);
  const [blpuClassificationError, setBlpuClassificationError] = useState(false);
  const [excludeFromExportError, setExcludeFromExportError] = useState(false);
  const [siteVisitError, setSiteVisitError] = useState(false);
  const [blpuStartDateError, setBlpuStartDateError] = useState(false);
  const [lpiStatusError, setLpiStatusError] = useState(false);
  const [lpiLevelError, setLpiLevelError] = useState(false);
  const [lpiOfficialAddressError, setLpiOfficialAddressError] = useState(false);
  const [lpiPostalAddressError, setLpiPostalAddressError] = useState(false);
  const [lpiStartDateError, setLpiStartDateError] = useState(false);
  const [classificationSchemeError, setClassificationSchemeError] = useState(false);
  const [classificationStartDateError, setClassificationStartDateError] = useState(false);
  const [otherProvenanceError, setOtherProvenanceError] = useState(false);
  const [otherProvenanceStartDateError, setOtherProvenanceStartDateError] = useState(false);
  const [otherNoteError, setOtherNoteError] = useState(false);

  const [editVariant, setEditVariant] = useState(null);
  const [editData, setEditData] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  /**
   * Event to handle when the BLPU data is selected to be edited.
   */
  const doEditBlpu = () => {
    setEditVariant("blpuWizard");
    setEditData(
      settingsContext.isScottish
        ? {
            blpuLogicalStatus: blpuStatus,
            rpc: blpuRpc,
            state: blpuState,
            stateDate: blpuStateDate,
            level: lpiLevel,
            excludeFromExport: excludeFromExport,
            siteVisit: siteVisit,
            startDate: blpuStartDate,
            errors: blpuErrors,
          }
        : {
            blpuLogicalStatus: blpuStatus,
            rpc: blpuRpc,
            state: blpuState,
            stateDate: blpuStateDate,
            classification: blpuClassification,
            excludeFromExport: excludeFromExport,
            siteVisit: siteVisit,
            startDate: blpuStartDate,
            errors: blpuErrors,
          }
    );
    setShowEditDialog(true);
  };

  /**
   * Event to handle when the LPI data is selected to be edited.
   */
  const doEditLpi = () => {
    setEditVariant("lpiWizard");
    setEditData({
      lpiLogicalStatus: lpiStatus,
      level: lpiLevel,
      officialAddressMaker: lpiOfficialAddress,
      postallyAddressable: lpiPostalAddress,
      startDate: lpiStartDate,
      errors: lpiErrors,
    });
    setShowEditDialog(true);
  };

  /**
   * Event to handle when the classification data is selected to be edited.
   */
  const doEditClassification = () => {
    setEditVariant("classificationWizard");
    setEditData({
      classification: blpuClassification,
      classificationScheme: classificationScheme,
      startDate: classificationStartDate,
      errors: classificationErrors,
    });
    setShowEditDialog(true);
  };

  /**
   * Event to handle when the other data is selected to be edited.
   */
  const doEditOther = () => {
    setEditVariant("otherWizard");
    setEditData({
      provCode: otherProvenance,
      provStartDate: otherProvenanceStartDate,
      note: otherNote,
      errors: otherErrors,
    });
    setShowEditDialog(true);
  };

  /**
   * Event to handle when the data has been edited.
   *
   * @param {object} updatedData The data that has been updated.
   */
  const handleDoneEditTemplate = (updatedData) => {
    if (updatedData) {
      switch (editVariant) {
        case "blpuWizard":
          if (onDataChanged)
            onDataChanged({
              blpu: settingsContext.isScottish
                ? {
                    logicalStatus: updatedData.blpuLogicalStatus,
                    rpc: updatedData.rpc,
                    state: updatedData.state,
                    stateDate: updatedData.stateDate,
                    level: updatedData.level,
                    excludeFromExport: updatedData.excludeFromExport,
                    siteVisit: updatedData.siteVisit,
                    startDate: updatedData.startDate,
                  }
                : {
                    logicalStatus: updatedData.blpuLogicalStatus,
                    rpc: updatedData.rpc,
                    state: updatedData.state,
                    stateDate: updatedData.stateDate,
                    classification: updatedData.classification,
                    excludeFromExport: updatedData.excludeFromExport,
                    siteVisit: updatedData.siteVisit,
                    startDate: updatedData.startDate,
                  },
              lpi: lpiData,
              classification: classificationData,
              other: otherData,
            });

          if (onErrorChanged)
            onErrorChanged({
              blpu: updatedData.errors,
              lpi: lpiErrors,
              classification: classificationErrors,
              other: otherErrors,
            });
          break;

        case "lpiWizard":
          if (onDataChanged)
            onDataChanged({
              blpu: blpuData,
              lpi: settingsContext.isScottish
                ? {
                    logicalStatus: updatedData.lpiLogicalStatus,
                    officialAddress: updatedData.officialAddressMaker,
                    postallyAddressable: updatedData.postallyAddressable,
                    startDate: updatedData.startDate,
                  }
                : {
                    logicalStatus: updatedData.lpiLogicalStatus,
                    level: updatedData.level,
                    officialAddress: updatedData.officialAddressMaker,
                    postallyAddressable: updatedData.postallyAddressable,
                    startDate: updatedData.startDate,
                  },
              classification: classificationData,
              other: otherData,
            });
          break;

        case "classificationWizard":
          if (onDataChanged)
            onDataChanged({
              blpu: blpuData,
              lpi: lpiData,
              classification: {
                classification: updatedData.classification,
                classificationScheme: updatedData.classificationScheme,
                startDate: updatedData.startDate,
              },
              other: otherData,
            });

          if (onErrorChanged)
            onErrorChanged({
              blpu: blpuErrors,
              lpi: lpiErrors,
              classification: updatedData.errors,
              other: otherErrors,
            });
          break;

        case "otherWizard":
          if (onDataChanged)
            onDataChanged({
              blpu: blpuData,
              lpi: lpiData,
              classification: classificationData,
              other: {
                provCode: updatedData.provCode,
                provStartDate: updatedData.provStartDate,
                note: updatedData.note,
              },
            });

          if (onErrorChanged)
            onErrorChanged({
              blpu: blpuErrors,
              lpi: lpiErrors,
              classification: classificationErrors,
              other: updatedData.errors,
            });
          break;

        default:
          break;
      }
    }
    setShowEditDialog(false);
  };

  /**
   * Event to handle when the edit template dialog is closed.
   */
  const handleCloseEditTemplate = () => {
    setShowEditDialog(false);
  };

  /**
   * Event to handle when the mouse enters the BLPU card.
   */
  const doMouseEnterBlpu = () => {
    setEditBlpu(true);
  };

  /**
   * Event to handle when the mouse leaves the BLPU card.
   */
  const doMouseLeaveBlpu = () => {
    setEditBlpu(false);
  };

  /**
   * Event to handle when the mouse enters the LPI card.
   */
  const doMouseEnterLpi = () => {
    setEditLpi(true);
  };

  /**
   * Event to handle when the mouse leaves the LPI card.
   */
  const doMouseLeaveLpi = () => {
    setEditLpi(false);
  };

  /**
   * Event to handle when the mouse enters the classification card.
   */
  const doMouseEnterClassification = () => {
    setEditClassification(true);
  };

  /**
   * Event to handle when the mouse leaves the classification card.
   */
  const doMouseLeaveClassification = () => {
    setEditClassification(false);
  };

  /**
   * Event to handle when the mouse enters the other card.
   */
  const doMouseEnterOther = () => {
    setEditOther(true);
  };

  /**
   * Event to handle when the mouse leaves the other card.
   */
  const doMouseLeaveOther = () => {
    setEditOther(false);
  };

  /**
   * Method to get the value styling.
   *
   * @param {boolean} error True if there is an error; otherwise false.
   * @returns {object} The styling for the value.
   */
  const getWizardValueStyle = (error) => {
    if (error) return { color: adsRed, fontWeight: 600 };
    else return { fontWeight: 600 };
  };

  useEffect(() => {
    if (errors) {
      setBlpuErrors(errors.blpu);
      setLpiErrors(errors.lpi);
      setClassificationErrors(errors.classification);
      setOtherErrors(errors.other);
    }
  }, [errors]);

  useEffect(() => {
    setHaveBlpuErrors(false);

    setBlpuStatusError(false);
    setBlpuRpcError(false);
    setBlpuStateError(false);
    setBlpuStateDateError(false);
    setBlpuClassificationError(false);
    setExcludeFromExportError(false);
    setSiteVisitError(false);
    setLpiLevelError(false);
    setBlpuStartDateError(false);

    if (blpuErrors && blpuErrors.length > 0) {
      for (const error of blpuErrors) {
        switch (error.field.toLowerCase()) {
          case "blpustatus":
            setBlpuStatusError(true);
            setHaveBlpuErrors(true);
            break;

          case "rpc":
            setBlpuRpcError(true);
            setHaveBlpuErrors(true);
            break;

          case "state":
            setBlpuStateError(true);
            setHaveBlpuErrors(true);
            break;

          case "statedate":
            setBlpuStateDateError(true);
            setHaveBlpuErrors(true);
            break;

          case "classification":
            setBlpuClassificationError(true);
            setHaveBlpuErrors(true);
            break;

          case "excludefromexport":
            setExcludeFromExportError(true);
            setHaveBlpuErrors(true);
            break;

          case "sitevisit":
            setSiteVisitError(true);
            setHaveBlpuErrors(true);
            break;

          case "level":
            setLpiLevelError(true);
            setHaveBlpuErrors(true);
            break;

          case "blpustartdate":
            setBlpuStartDateError(true);
            setHaveBlpuErrors(true);
            break;

          default:
            break;
        }
      }
    }
  }, [blpuErrors]);

  useEffect(() => {
    setHaveLpiErrors(false);

    setLpiStatusError(false);
    setLpiLevelError(false);
    setLpiOfficialAddressError(false);
    setLpiPostalAddressError(false);
    setLpiStartDateError(false);

    if (lpiErrors && lpiErrors.length > 0) {
      for (const error of lpiErrors) {
        switch (error.field.toLowerCase()) {
          case "lpistatus":
            setLpiStatusError(true);
            setHaveLpiErrors(true);
            break;

          case "level":
            setLpiLevelError(true);
            setHaveLpiErrors(true);
            break;

          case "officialaddress":
            setLpiOfficialAddressError(true);
            setHaveLpiErrors(true);
            break;

          case "postaladdress":
            setLpiPostalAddressError(true);
            setHaveLpiErrors(true);
            break;

          case "lpistartdate":
            setLpiStartDateError(true);
            setHaveLpiErrors(true);
            break;

          default:
            break;
        }
      }
    }
  }, [lpiErrors]);

  useEffect(() => {
    setHaveClassificationErrors(false);

    setBlpuClassificationError(false);
    setClassificationSchemeError(false);
    setClassificationStartDateError(false);

    if (classificationErrors && classificationErrors.length > 0) {
      for (const error of classificationErrors) {
        switch (error.field.toLowerCase()) {
          case "classification":
            setBlpuClassificationError(true);
            setHaveClassificationErrors(true);
            break;

          case "classificationscheme":
            setClassificationSchemeError(true);
            setHaveClassificationErrors(true);
            break;

          case "classificationstartdate":
            setClassificationStartDateError(true);
            setHaveClassificationErrors(true);
            break;

          default:
            break;
        }
      }
    }
  }, [classificationErrors]);

  useEffect(() => {
    setHaveOtherErrors(false);

    setOtherProvenanceError(false);
    setOtherProvenanceStartDateError(false);
    setOtherNoteError(false);

    if (otherErrors && otherErrors.length > 0) {
      for (const error of otherErrors) {
        switch (error.field.toLowerCase()) {
          case "provenance":
            setOtherProvenanceError(true);
            setHaveOtherErrors(true);
            break;

          case "provenancestartdate":
            setOtherProvenanceStartDateError(true);
            setHaveOtherErrors(true);
            break;

          case "note":
            setOtherNoteError(true);
            setHaveOtherErrors(true);
            break;

          default:
            break;
        }
      }
    }
  }, [otherErrors]);

  useEffect(() => {
    if (data) {
      setBlpuData(data.blpu);
      setLpiData(data.lpi);
      setClassificationData(data.classification);
      setOtherData(data.other);
    }
  }, [data]);

  useEffect(() => {
    if (blpuData) {
      setBlpuStatus(blpuData.logicalStatus);
      setBlpuRpc(blpuData.rpc);
      setBlpuState(blpuData.state);
      setBlpuStateDate(blpuData.stateDate);
      if (settingsContext.isScottish) {
        setLpiLevel(blpuData.level ? blpuData.level : 0);
      } else {
        setBlpuClassification(blpuData.classification);
      }
      setExcludeFromExport(blpuData.excludeFromExport);
      setSiteVisit(blpuData.siteVisit);
      setBlpuStartDate(blpuData.startDate);
    }
  }, [blpuData, settingsContext.isScottish]);

  useEffect(() => {
    if (lpiData) {
      setLpiStatus(lpiData.logicalStatus);
      if (!settingsContext.isScottish) setLpiLevel(lpiData.level ? lpiData.level : "");
      setLpiOfficialAddress(lpiData.officialAddress);
      setLpiPostalAddress(lpiData.postallyAddressable);
      setLpiStartDate(lpiData.startDate);
    }
  }, [lpiData, settingsContext.isScottish]);

  useEffect(() => {
    if (classificationData) {
      setBlpuClassification(classificationData.classification);
      setClassificationScheme(classificationData.classificationScheme);
      setClassificationStartDate(classificationData.startDate);
    }
  }, [classificationData]);

  useEffect(() => {
    if (otherData) {
      setOtherProvenance(otherData.provCode);
      setOtherProvenanceStartDate(otherData.provStartDate);
      setOtherNote(otherData.note);
    }
  }, [otherData]);

  return (
    <Box id="wizard-property-details-page" sx={{ ml: "auto", mr: "auto", width: "900px" }}>
      <Stack direction="column" spacing={2} sx={{ mt: theme.spacing(1), width: "100%" }}>
        <Typography sx={{ fontSize: 24, flexGrow: 1, pl: theme.spacing(0) }}>Property details</Typography>
        <Grid container sx={{ pl: theme.spacing(0), pr: theme.spacing(0) }} spacing={3}>
          <Grid item xs={6}>
            <Card
              variant="outlined"
              elevation={0}
              onMouseEnter={doMouseEnterBlpu}
              onMouseLeave={doMouseLeaveBlpu}
              sx={settingsCardStyle(editBlpu, haveBlpuErrors)}
            >
              <CardHeader
                action={
                  editBlpu && (
                    <Tooltip title="Edit BLPU details" placement="bottom" sx={tooltipStyle}>
                      <IconButton onClick={doEditBlpu} sx={{ pr: "16px", pb: "16px" }}>
                        <EditIcon sx={ActionIconStyle(true)} />
                      </IconButton>
                    </Tooltip>
                  )
                }
                title="BLPU"
                titleTypographyProps={{ sx: getTitleStyle(editBlpu, haveBlpuErrors) }}
                sx={{ height: "66px" }}
              />
              <CardActionArea onClick={doEditBlpu}>
                <CardContent sx={settingsCardContentStyle("wizard")}>
                  <Grid container rowSpacing={1}>
                    <Grid item xs={4}>
                      <Typography variant="body2">Status*</Typography>
                    </Grid>
                    <Grid item xs={1}>
                      {blpuStatusError && <PriorityHighIcon sx={{ color: adsRed, height: "16px" }} />}
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="body2" sx={getWizardValueStyle(blpuStatusError)}>
                        {getBlpuStatus(blpuStatus, settingsContext.isScottish)}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2">RPC*</Typography>
                    </Grid>
                    <Grid item xs={1}>
                      {blpuRpcError && <PriorityHighIcon sx={{ color: adsRed, height: "16px" }} />}
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="body2" sx={getWizardValueStyle(blpuRpcError)}>
                        {getBlpuRpc(blpuRpc, settingsContext.isScottish)}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2">State*</Typography>
                    </Grid>
                    <Grid item xs={1}>
                      {blpuStateError && <PriorityHighIcon sx={{ color: adsRed, height: "16px" }} />}
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="body2" sx={getWizardValueStyle(blpuStateError)}>
                        {getBlpuState(blpuState, settingsContext.isScottish)}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2">State date*</Typography>
                    </Grid>
                    <Grid item xs={1}>
                      {blpuStateDateError && <PriorityHighIcon sx={{ color: adsRed, height: "16px" }} />}
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="body2" sx={getWizardValueStyle(blpuStateDateError)}>
                        {DateString(blpuStateDate)}
                      </Typography>
                    </Grid>
                    {settingsContext.isScottish && (
                      <Fragment>
                        <Grid item xs={4}>
                          <Typography variant="body2">Level</Typography>
                        </Grid>
                        <Grid item xs={1}>
                          {lpiLevelError && <PriorityHighIcon sx={{ color: adsRed, height: "16px" }} />}
                        </Grid>
                        <Grid item xs={7}>
                          <Typography variant="body2" sx={getWizardValueStyle(lpiLevelError)}>
                            {lpiLevel}
                          </Typography>
                        </Grid>
                      </Fragment>
                    )}
                    {!settingsContext.isScottish && (
                      <Fragment>
                        <Grid item xs={4}>
                          <Typography variant="body2">Classification*</Typography>
                        </Grid>
                        <Grid item xs={1}>
                          {blpuClassificationError && <PriorityHighIcon sx={{ color: adsRed, height: "16px" }} />}
                        </Grid>
                        <Grid item xs={7}>
                          <Typography variant="body2" sx={getWizardValueStyle(blpuClassificationError)}>
                            {getBlpuClassification(blpuClassification, settingsContext.isScottish)}
                          </Typography>
                        </Grid>
                      </Fragment>
                    )}
                    <Grid item xs={4}>
                      <Typography variant="body2">Exclude from export</Typography>
                    </Grid>
                    <Grid item xs={1}>
                      {excludeFromExportError && <PriorityHighIcon sx={{ color: adsRed, height: "16px" }} />}
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {`${excludeFromExport ? "Yes" : "No"}`}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2">Site visit required</Typography>
                    </Grid>
                    <Grid item xs={1}>
                      {siteVisitError && <PriorityHighIcon sx={{ color: adsRed, height: "16px" }} />}
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {`${siteVisit ? "Yes" : "No"}`}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2">Start date*</Typography>
                    </Grid>
                    <Grid item xs={1}>
                      {blpuStartDateError && <PriorityHighIcon sx={{ color: adsRed, height: "16px" }} />}
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="body2" sx={getWizardValueStyle(blpuStartDateError)}>
                        {DateString(blpuStartDate)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card
              variant="outlined"
              elevation={0}
              onMouseEnter={doMouseEnterLpi}
              onMouseLeave={doMouseLeaveLpi}
              sx={settingsCardStyle(editLpi, haveLpiErrors)}
            >
              <CardHeader
                action={
                  editLpi && (
                    <Tooltip title="Edit LPI details" placement="bottom" sx={tooltipStyle}>
                      <IconButton onClick={doEditLpi} sx={{ pr: "16px", pb: "16px" }}>
                        <EditIcon sx={ActionIconStyle(true)} />
                      </IconButton>
                    </Tooltip>
                  )
                }
                title="LPI"
                titleTypographyProps={{ sx: getTitleStyle(editLpi, haveLpiErrors) }}
                sx={{ height: "66px" }}
              />
              <CardActionArea onClick={doEditLpi}>
                <CardContent sx={settingsCardContentStyle("wizard")}>
                  <Grid container rowSpacing={1}>
                    <Grid item xs={4}>
                      <Typography variant="body2">Status*</Typography>
                    </Grid>
                    <Grid item xs={1}>
                      {lpiStatusError && <PriorityHighIcon sx={{ color: adsRed, height: "16px" }} />}
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="body2" sx={getWizardValueStyle(lpiStatusError)}>
                        {getLpiStatus(lpiStatus, settingsContext.isScottish)}
                      </Typography>
                    </Grid>
                    {!settingsContext.isScottish && (
                      <Fragment>
                        <Grid item xs={4}>
                          <Typography variant="body2">Level</Typography>
                        </Grid>
                        <Grid item xs={1}>
                          {lpiLevelError && <PriorityHighIcon sx={{ color: adsRed, height: "16px" }} />}
                        </Grid>
                        <Grid item xs={7}>
                          <Typography variant="body2" sx={getWizardValueStyle(lpiLevelError)}>
                            {lpiLevel}
                          </Typography>
                        </Grid>
                      </Fragment>
                    )}
                    <Grid item xs={4}>
                      <Typography variant="body2">Official address</Typography>
                    </Grid>
                    <Grid item xs={1}>
                      {lpiOfficialAddressError && <PriorityHighIcon sx={{ color: adsRed, height: "16px" }} />}
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="body2" sx={getWizardValueStyle(lpiOfficialAddressError)}>
                        {getLpiOfficialAddress(lpiOfficialAddress)}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2">Postal address*</Typography>
                    </Grid>
                    <Grid item xs={1}>
                      {lpiPostalAddressError && <PriorityHighIcon sx={{ color: adsRed, height: "16px" }} />}
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="body2" sx={getWizardValueStyle(lpiPostalAddressError)}>
                        {getLpiPostalAddress(lpiPostalAddress)}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2">Start date*</Typography>
                    </Grid>
                    <Grid item xs={1}>
                      {lpiStartDateError && <PriorityHighIcon sx={{ color: adsRed, height: "16px" }} />}
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="body2" sx={getWizardValueStyle(lpiStartDateError)}>
                        {DateString(lpiStartDate)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          {settingsContext.isScottish && (
            <Grid item xs={6}>
              <Card
                variant="outlined"
                elevation={0}
                onMouseEnter={doMouseEnterClassification}
                onMouseLeave={doMouseLeaveClassification}
                sx={settingsCardStyle(editClassification, haveClassificationErrors)}
              >
                <CardHeader
                  action={
                    editClassification && (
                      <Tooltip title="Edit classification details" placement="bottom" sx={tooltipStyle}>
                        <IconButton onClick={doEditClassification} sx={{ pr: "16px", pb: "16px" }}>
                          <EditIcon sx={ActionIconStyle(true)} />
                        </IconButton>
                      </Tooltip>
                    )
                  }
                  title="Classification"
                  titleTypographyProps={{
                    sx: getTitleStyle(editClassification, haveClassificationErrors),
                  }}
                  sx={{ height: "66px" }}
                />
                <CardActionArea onClick={doEditClassification}>
                  <CardContent sx={settingsCardContentStyle("wizard")}>
                    <Grid container rowSpacing={1}>
                      <Grid item xs={4}>
                        <Typography variant="body2">Classification</Typography>
                      </Grid>
                      <Grid item xs={1}>
                        {blpuClassificationError && <PriorityHighIcon sx={{ color: adsRed, height: "16px" }} />}
                      </Grid>
                      <Grid item xs={7}>
                        <Typography variant="body2" sx={getWizardValueStyle(blpuClassificationError)}>
                          {getBlpuClassification(blpuClassification, settingsContext.isScottish)}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2">Scheme</Typography>
                      </Grid>
                      <Grid item xs={1}>
                        {classificationSchemeError && <PriorityHighIcon sx={{ color: adsRed, height: "16px" }} />}
                      </Grid>
                      <Grid item xs={7}>
                        <Typography variant="body2" sx={getWizardValueStyle(classificationSchemeError)}>
                          {classificationScheme}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2">Start date</Typography>
                      </Grid>
                      <Grid item xs={1}>
                        {classificationStartDateError && <PriorityHighIcon sx={{ color: adsRed, height: "16px" }} />}
                      </Grid>
                      <Grid item xs={7}>
                        <Typography variant="body2" sx={getWizardValueStyle(classificationStartDateError)}>
                          {DateString(classificationStartDate)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          )}
          <Grid item xs={6}>
            <Card
              variant="outlined"
              elevation={0}
              onMouseEnter={doMouseEnterOther}
              onMouseLeave={doMouseLeaveOther}
              sx={settingsCardStyle(editOther, haveOtherErrors)}
            >
              <CardHeader
                action={
                  editOther && (
                    <Tooltip title="Edit other details" placement="bottom" sx={tooltipStyle}>
                      <IconButton onClick={doEditOther} sx={{ pr: "16px", pb: "16px" }}>
                        <EditIcon sx={ActionIconStyle(true)} />
                      </IconButton>
                    </Tooltip>
                  )
                }
                title="Other"
                titleTypographyProps={{ sx: getTitleStyle(editOther, haveOtherErrors) }}
                sx={{ height: "66px" }}
              />
              <CardActionArea onClick={doEditOther}>
                <CardContent sx={settingsCardContentStyle("wizard")}>
                  <Grid container rowSpacing={1}>
                    <Grid item xs={4}>
                      <Typography variant="body2">Provenance</Typography>
                    </Grid>
                    <Grid item xs={1}>
                      {otherProvenanceError && <PriorityHighIcon sx={{ color: adsRed, height: "16px" }} />}
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="body2" sx={getWizardValueStyle(otherProvenanceError)}>
                        {getOtherProvenance(otherProvenance, settingsContext.isScottish)}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2">Start date</Typography>
                    </Grid>
                    <Grid item xs={1}>
                      {otherProvenanceStartDateError && <PriorityHighIcon sx={{ color: adsRed, height: "16px" }} />}
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="body2" sx={getWizardValueStyle(otherProvenanceStartDateError)}>
                        {DateString(otherProvenanceStartDate)}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2">Note</Typography>
                    </Grid>
                    <Grid item xs={1}>
                      {otherNoteError && <PriorityHighIcon sx={{ color: adsRed, height: "16px" }} />}
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="body2" sx={getWizardValueStyle(otherNoteError)}>
                        {otherNote}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </Stack>
      <EditTemplateDialog
        isOpen={showEditDialog}
        variant={editVariant}
        data={editData}
        onDone={(data) => handleDoneEditTemplate(data)}
        onClose={handleCloseEditTemplate}
      />
    </Box>
  );
}

export default WizardPropertyDetailsPage;
