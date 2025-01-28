/* #region header */
/**************************************************************************************************
//
//  Description: Plot to Postal Details Page
//
//  Copyright:   © 2024 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//#region Version 1.0.1.0 changes
//    001   15.10.24 Sean Flook       IMANN-1012 Initial Revision.
//#endregion Version 1.0.1.0 changes
//#region Version 1.0.2.0 changes
//    002   14.11.24 Sean Flook       IMANN-1012 Call the correct method to display the check icon.
//#endregion Version 1.0.2.0 changes
//#region Version 1.0.4.0 changes
//    003   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//#endregion Version 1.0.4.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useEffect, Fragment } from "react";
import PropTypes from "prop-types";

import SettingsContext from "../context/settingsContext";
import LookupContext from "../context/lookupContext";

import {
  Grid2,
  Card,
  CardHeader,
  CardActionArea,
  CardContent,
  Typography,
  Tooltip,
  IconButton,
  Divider,
} from "@mui/material";
import { Box, Stack } from "@mui/system";

import EditTemplateDialog from "../dialogs/EditTemplateDialog";

import { DateString, getCheckIcon, StringToTitleCase } from "../utils/HelperUtils";
import {
  getBlpuStatus,
  getBlpuRpc,
  getBlpuState,
  getLpiStatus,
  getLpiOfficialAddress,
  getLpiPostalAddress,
  getLpiPostTown,
  getLpiSubLocality,
  getLpiPostcode,
} from "../utils/PropertyUtils";

import EditIcon from "@mui/icons-material/Edit";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";

import { adsBlueA, adsRed } from "../utils/ADSColours";
import { ActionIconStyle, settingsCardStyle, tooltipStyle, getTitleStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";
import { Masonry } from "@mui/lab";

PlotToPostalDetailsPage.propTypes = {
  data: PropTypes.object.isRequired,
  errors: PropTypes.object,
  onDataChanged: PropTypes.func.isRequired,
  onErrorChanged: PropTypes.func.isRequired,
};

function PlotToPostalDetailsPage({ data, errors, onDataChanged, onErrorChanged }) {
  const theme = useTheme();

  const settingsContext = useContext(SettingsContext);
  const lookupContext = useContext(LookupContext);

  const [blpuData, setBlpuData] = useState(null);
  const [lpiData, setLpiData] = useState(null);
  const [otherData, setOtherData] = useState(null);

  const [blpuStatus, setBlpuStatus] = useState(null);
  const [blpuRpc, setBlpuRpc] = useState(null);
  const [blpuState, setBlpuState] = useState(null);
  const [blpuStateDate, setBlpuStateDate] = useState(null);
  const [existingLpiStatus, setExistingLpiStatus] = useState(null);
  const [newLpiStatus, setNewLpiStatus] = useState(null);
  const [postcodeRef, setPostcodeRef] = useState(null);
  const [postTownRef, setPostTownRef] = useState(null);
  const [subLocalityRef, setSubLocalityRef] = useState(null);
  const [lpiLevel, setLpiLevel] = useState("");
  const [officialAddress, setOfficialAddress] = useState(null);
  const [postalAddress, setPostalAddress] = useState(null);
  const [lpiStartDate, setLpiStartDate] = useState(null);
  const [createGaelic, setCreateGaelic] = useState(false);
  const [note, setNote] = useState(null);

  const [editBlpu, setEditBlpu] = useState(false);
  const [editLpi, setEditLpi] = useState(false);
  const [editOther, setEditOther] = useState(false);

  const [haveBlpuErrors, setHaveBlpuErrors] = useState(false);
  const [haveLpiErrors, setHaveLpiErrors] = useState(false);
  const [haveOtherErrors, setHaveOtherErrors] = useState(false);

  const [blpuErrors, setBlpuErrors] = useState(null);
  const [lpiErrors, setLpiErrors] = useState(null);
  const [otherErrors, setOtherErrors] = useState(null);

  const [blpuStatusError, setBlpuStatusError] = useState(false);
  const [blpuRpcError, setBlpuRpcError] = useState(false);
  const [blpuStateError, setBlpuStateError] = useState(false);
  const [blpuStateDateError, setBlpuStateDateError] = useState(false);
  const [blpuLevelError, setBlpuLevelError] = useState(false);
  const [existingLpiStatusError, setExistingLpiStatusError] = useState(false);
  const [newLpiStatusError, setNewLpiStatusError] = useState(false);
  const [postcodeRefError, setPostcodeRefError] = useState(false);
  const [postTownRefError, setPostTownRefError] = useState(false);
  const [subLocalityRefError, setSubLocalityRefError] = useState(false);
  const [lpiLevelError, setLpiLevelError] = useState(false);
  const [officialAddressError, setOfficialAddressError] = useState(false);
  const [postalAddressError, setPostalAddressError] = useState(false);
  const [lpiStartDateError, setLpiStartDateError] = useState(false);
  const [noteError, setNoteError] = useState(false);

  const [editVariant, setEditVariant] = useState(null);
  const [editData, setEditData] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  /**
   * Event to handle when the BLPU data is selected to be edited.
   */
  const doEditBlpu = () => {
    setEditVariant("plotBlpuWizard");
    setEditData(
      settingsContext.isScottish
        ? {
            blpuLogicalStatus: blpuStatus,
            rpc: blpuRpc,
            state: blpuState,
            stateDate: blpuStateDate,
            level: lpiLevel,
            errors: blpuErrors,
          }
        : {
            blpuLogicalStatus: blpuStatus,
            rpc: blpuRpc,
            state: blpuState,
            stateDate: blpuStateDate,
            errors: blpuErrors,
          }
    );
    setShowEditDialog(true);
  };

  /**
   * Event to handle when the LPI data is selected to be edited.
   */
  const doEditLpi = () => {
    setEditVariant("plotLpiWizard");
    setEditData({
      existingLpiLogicalStatus: existingLpiStatus,
      newLpiLogicalStatus: newLpiStatus,
      postcodeRef: postcodeRef,
      postTownRef: postTownRef,
      subLocalityRef: subLocalityRef,
      level: lpiLevel,
      officialAddressMaker: officialAddress,
      postallyAddressable: postalAddress,
      startDate: lpiStartDate,
      errors: lpiErrors,
    });
    setShowEditDialog(true);
  };

  /**
   * Event to handle when the note data is selected to be edited.
   */
  const doEditOther = () => {
    setEditVariant("plotOtherWizard");
    setEditData(
      settingsContext.isScottish
        ? {
            createGaelic: createGaelic,
            note: note,
            errors: otherErrors,
          }
        : {
            note: note,
            errors: otherErrors,
          }
    );
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
        case "plotBlpuWizard":
          if (onDataChanged)
            onDataChanged({
              blpu: settingsContext.isScottish
                ? {
                    logicalStatus: updatedData.blpuLogicalStatus,
                    rpc: updatedData.rpc,
                    state: updatedData.state,
                    stateDate: updatedData.stateDate,
                    level: updatedData.blpuLevel,
                    startDate: updatedData.startDate,
                  }
                : {
                    logicalStatus: updatedData.blpuLogicalStatus,
                    rpc: updatedData.rpc,
                    state: updatedData.state,
                    stateDate: updatedData.stateDate,
                    startDate: updatedData.startDate,
                  },
              lpi: lpiData,
              other: otherData,
            });

          if (onErrorChanged)
            onErrorChanged({
              blpu: updatedData.errors,
              lpi: lpiErrors,
              other: otherErrors,
            });
          break;

        case "plotLpiWizard":
          if (onDataChanged)
            onDataChanged({
              blpu: blpuData,
              lpi: settingsContext.isScottish
                ? {
                    existingLogicalStatus: updatedData.existingLpiLogicalStatus,
                    newLogicalStatus: updatedData.newLpiLogicalStatus,
                    postcodeRef: updatedData.postcodeRef,
                    postTownRef: updatedData.postTownRef,
                    subLocalityRef: updatedData.subLocalityRef,
                    officialAddress: updatedData.officialAddressMaker,
                    postallyAddressable: updatedData.postallyAddressable,
                    startDate: updatedData.startDate,
                  }
                : {
                    existingLogicalStatus: updatedData.existingLpiLogicalStatus,
                    newLogicalStatus: updatedData.newLpiLogicalStatus,
                    postcodeRef: updatedData.postcodeRef,
                    postTownRef: updatedData.postTownRef,
                    level: updatedData.lpiLevel,
                    officialAddress: updatedData.officialAddressMaker,
                    postallyAddressable: updatedData.postallyAddressable,
                    startDate: updatedData.startDate,
                  },
              other: otherData,
            });

          if (onErrorChanged)
            onErrorChanged({
              blpu: blpuErrors,
              lpi: updatedData.errors,
              other: otherErrors,
            });
          break;

        case "plotOtherWizard":
          if (onDataChanged)
            onDataChanged({
              blpu: blpuData,
              lpi: lpiData,
              other: settingsContext.isScottish
                ? {
                    createGaelic: updatedData.createGaelic,
                    note: updatedData.note,
                  }
                : {
                    note: updatedData.note,
                  },
            });

          if (onErrorChanged)
            onErrorChanged({
              blpu: blpuErrors,
              lpi: lpiErrors,
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
   * Event to handle when the mouse enters the note card.
   */
  const doMouseEnterOther = () => {
    setEditOther(true);
  };

  /**
   * Event to handle when the mouse leaves the note card.
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
      setOtherErrors(errors.note);
    }
  }, [errors]);

  useEffect(() => {
    setHaveBlpuErrors(false);

    setBlpuStatusError(false);
    setBlpuRpcError(false);
    setBlpuStateError(false);
    setBlpuStateDateError(false);
    setBlpuLevelError(false);

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

          case "blpulevel":
            setBlpuLevelError(true);
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

    setExistingLpiStatusError(false);
    setNewLpiStatusError(false);
    setPostcodeRefError(false);
    setPostTownRefError(false);
    setSubLocalityRefError(false);
    setLpiLevelError(false);
    setOfficialAddressError(false);
    setPostalAddressError(false);
    setLpiStartDateError(false);

    if (lpiErrors && lpiErrors.length > 0) {
      for (const error of lpiErrors) {
        switch (error.field.toLowerCase()) {
          case "existinglpistatus":
            setExistingLpiStatusError(true);
            setHaveLpiErrors(true);
            break;

          case "newlpistatus":
            setNewLpiStatusError(true);
            setHaveLpiErrors(true);
            break;

          case "postcode":
          case "postcoderef":
            setPostcodeRefError(true);
            setHaveLpiErrors(true);
            break;

          case "posttown":
          case "posttownref":
            setPostTownRefError(true);
            setHaveLpiErrors(true);
            break;

          case "sublocality":
          case "sublocalityref":
            setSubLocalityRefError(true);
            setHaveLpiErrors(true);
            break;

          case "level":
            setLpiLevelError(true);
            setHaveLpiErrors(true);
            break;

          case "officialaddress":
            setOfficialAddressError(true);
            setHaveLpiErrors(true);
            break;

          case "postaladdress":
            setPostalAddressError(true);
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
    setHaveOtherErrors(false);

    setNoteError(false);

    if (otherErrors && otherErrors.length > 0) {
      for (const error of otherErrors) {
        switch (error.field.toLowerCase()) {
          case "note":
            setNoteError(true);
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
      }
    }
  }, [blpuData, settingsContext.isScottish]);

  useEffect(() => {
    if (lpiData) {
      setExistingLpiStatus(lpiData.existingLogicalStatus);
      setNewLpiStatus(lpiData.newLogicalStatus);
      if (!settingsContext.isScottish) setLpiLevel(lpiData.level ? lpiData.level : "");
      setPostcodeRef(lpiData.postcodeRef);
      setPostTownRef(lpiData.postTownRef);
      if (settingsContext.isScottish) setSubLocalityRef(lpiData.subLocalityRef);
      setOfficialAddress(lpiData.officialAddress);
      setPostalAddress(lpiData.postallyAddressable);
      setLpiStartDate(lpiData.startDate);
    }
  }, [lpiData, settingsContext.isScottish]);

  useEffect(() => {
    if (otherData) {
      if (settingsContext.isScottish) setCreateGaelic(otherData.createGaelic);
      setNote(otherData.note);
    }
  }, [otherData, settingsContext.isScottish]);

  return (
    <Box id="plot-to-postal-property-details-page" sx={{ ml: "auto", mr: "auto", width: "900px" }}>
      <Stack direction="column" spacing={2} sx={{ mt: theme.spacing(1), width: "100%" }}>
        <Typography sx={{ fontSize: 24, flexGrow: 1, pl: theme.spacing(0) }}>Property details</Typography>
        <Masonry columns={{ xs: 1, sm: 2 }} spacing={{ xs: 1, sm: 2 }}>
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
              sx={{ height: "66px" }}
              slotProps={{
                title: { sx: getTitleStyle(editBlpu, haveBlpuErrors) },
              }}
            />
            <CardActionArea onClick={doEditBlpu}>
              <CardContent>
                <Grid2 container rowSpacing={1}>
                  <Grid2 size={4}>
                    <Typography variant="body2">Logical status*</Typography>
                  </Grid2>
                  <Grid2 size={1}>
                    {blpuStatusError && <PriorityHighIcon sx={{ color: adsRed, height: "16px" }} />}
                  </Grid2>
                  <Grid2 size={7}>
                    <Typography variant="body2" sx={getWizardValueStyle(blpuStatusError)}>
                      {getBlpuStatus(blpuStatus, settingsContext.isScottish)}
                    </Typography>
                  </Grid2>
                  <Grid2 size={4}>
                    <Typography variant="body2">RPC*</Typography>
                  </Grid2>
                  <Grid2 size={1}>{blpuRpcError && <PriorityHighIcon sx={{ color: adsRed, height: "16px" }} />}</Grid2>
                  <Grid2 size={7}>
                    <Typography variant="body2" sx={getWizardValueStyle(blpuRpcError)}>
                      {getBlpuRpc(blpuRpc, settingsContext.isScottish)}
                    </Typography>
                  </Grid2>
                  <Grid2 size={4}>
                    <Typography variant="body2">State*</Typography>
                  </Grid2>
                  <Grid2 size={1}>
                    {blpuStateError && <PriorityHighIcon sx={{ color: adsRed, height: "16px" }} />}
                  </Grid2>
                  <Grid2 size={7}>
                    <Typography variant="body2" sx={getWizardValueStyle(blpuStateError)}>
                      {getBlpuState(blpuState, settingsContext.isScottish)}
                    </Typography>
                  </Grid2>
                  <Grid2 size={4}>
                    <Typography variant="body2">State date*</Typography>
                  </Grid2>
                  <Grid2 size={1}>
                    {blpuStateDateError && <PriorityHighIcon sx={{ color: adsRed, height: "16px" }} />}
                  </Grid2>
                  <Grid2 size={7}>
                    <Typography variant="body2" sx={getWizardValueStyle(blpuStateDateError)}>
                      {DateString(blpuStateDate)}
                    </Typography>
                  </Grid2>
                  {settingsContext.isScottish && (
                    <Fragment>
                      <Grid2 size={4}>
                        <Typography variant="body2">Level*</Typography>
                      </Grid2>
                      <Grid2 size={1}>
                        {blpuLevelError && <PriorityHighIcon sx={{ color: adsRed, height: "16px" }} />}
                      </Grid2>
                      <Grid2 size={7}>
                        <Typography variant="body2" sx={getWizardValueStyle(blpuLevelError)}>
                          {lpiLevel}
                        </Typography>
                      </Grid2>
                    </Fragment>
                  )}
                </Grid2>
              </CardContent>
            </CardActionArea>
          </Card>
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
              sx={{ height: "66px" }}
              slotProps={{
                title: { sx: getTitleStyle(editLpi, haveLpiErrors) },
              }}
            />
            <CardActionArea onClick={doEditLpi}>
              <CardContent>
                <Grid2 container rowSpacing={1}>
                  <Grid2 size={12}>
                    <Divider textAlign="center">
                      <Typography variant="body1" sx={{ color: `${adsBlueA}`, fontWeight: 700 }}>
                        Existing
                      </Typography>
                    </Divider>
                  </Grid2>
                  <Grid2 size={4}>
                    <Typography variant="body2">Logical status*</Typography>
                  </Grid2>
                  <Grid2 size={1}>
                    {existingLpiStatusError && <PriorityHighIcon sx={{ color: adsRed, height: "16px" }} />}
                  </Grid2>
                  <Grid2 size={7}>
                    <Typography variant="body2" sx={getWizardValueStyle(existingLpiStatusError)}>
                      {getLpiStatus(existingLpiStatus, settingsContext.isScottish)}
                    </Typography>
                  </Grid2>
                  <Grid2 size={12}>
                    <Divider textAlign="center">
                      <Typography variant="body1" sx={{ color: `${adsBlueA}`, fontWeight: 700 }}>
                        New
                      </Typography>
                    </Divider>
                  </Grid2>
                  <Grid2 size={4}>
                    <Typography variant="body2">Logical status*</Typography>
                  </Grid2>
                  <Grid2 size={1}>
                    {newLpiStatusError && <PriorityHighIcon sx={{ color: adsRed, height: "16px" }} />}
                  </Grid2>
                  <Grid2 size={7}>
                    <Typography variant="body2" sx={getWizardValueStyle(newLpiStatusError)}>
                      {getLpiStatus(newLpiStatus, settingsContext.isScottish)}
                    </Typography>
                  </Grid2>
                  {settingsContext.isScottish && (
                    <Fragment>
                      <Grid2 size={4}>
                        <Typography variant="body2">Sub-locality</Typography>
                      </Grid2>
                      <Grid2 size={1}>
                        {subLocalityRefError && <PriorityHighIcon sx={{ color: adsRed, height: "16px" }} />}
                      </Grid2>
                      <Grid2 size={7}>
                        <Typography variant="body2" sx={getWizardValueStyle(subLocalityRefError)}>
                          {getLpiSubLocality(subLocalityRef, lookupContext.currentLookups.subLocalities)}
                        </Typography>
                      </Grid2>
                    </Fragment>
                  )}
                  <Grid2 size={4}>
                    <Typography variant="body2">Post town</Typography>
                  </Grid2>
                  <Grid2 size={1}>
                    {postTownRefError && <PriorityHighIcon sx={{ color: adsRed, height: "16px" }} />}
                  </Grid2>
                  <Grid2 size={7}>
                    <Typography variant="body2" sx={getWizardValueStyle(postTownRefError)}>
                      {StringToTitleCase(getLpiPostTown(postTownRef, lookupContext.currentLookups.postTowns))}
                    </Typography>
                  </Grid2>
                  <Grid2 size={4}>
                    <Typography variant="body2">Postcode</Typography>
                  </Grid2>
                  <Grid2 size={1}>
                    {postcodeRefError && <PriorityHighIcon sx={{ color: adsRed, height: "16px" }} />}
                  </Grid2>
                  <Grid2 size={7}>
                    <Typography variant="body2" sx={getWizardValueStyle(postcodeRefError)}>
                      {getLpiPostcode(postcodeRef, lookupContext.currentLookups.postcodes)}
                    </Typography>
                  </Grid2>
                  {!settingsContext.isScottish && (
                    <Fragment>
                      <Grid2 size={4}>
                        <Typography variant="body2">Level</Typography>
                      </Grid2>
                      <Grid2 size={1}>
                        {lpiLevelError && <PriorityHighIcon sx={{ color: adsRed, height: "16px" }} />}
                      </Grid2>
                      <Grid2 size={7}>
                        <Typography variant="body2" sx={getWizardValueStyle(lpiLevelError)}>
                          {lpiLevel}
                        </Typography>
                      </Grid2>
                    </Fragment>
                  )}
                  <Grid2 size={4}>
                    <Typography variant="body2">{`Official address${
                      settingsContext.isScottish ? "*" : ""
                    }`}</Typography>
                  </Grid2>
                  <Grid2 size={1}>
                    {officialAddressError && <PriorityHighIcon sx={{ color: adsRed, height: "16px" }} />}
                  </Grid2>
                  <Grid2 size={7}>
                    <Typography variant="body2" sx={getWizardValueStyle(officialAddressError)}>
                      {getLpiOfficialAddress(officialAddress, settingsContext.isScottish)}
                    </Typography>
                  </Grid2>
                  <Grid2 size={4}>
                    <Typography variant="body2">{`${
                      settingsContext.isScottish ? "Postally addressable*" : "Postal address*"
                    }`}</Typography>
                  </Grid2>
                  <Grid2 size={1}>
                    {postalAddressError && <PriorityHighIcon sx={{ color: adsRed, height: "16px" }} />}
                  </Grid2>
                  <Grid2 size={7}>
                    <Typography variant="body2" sx={getWizardValueStyle(postalAddressError)}>
                      {getLpiPostalAddress(postalAddress)}
                    </Typography>
                  </Grid2>
                  <Grid2 size={4}>
                    <Typography variant="body2">Start date*</Typography>
                  </Grid2>
                  <Grid2 size={1}>
                    {lpiStartDateError && <PriorityHighIcon sx={{ color: adsRed, height: "16px" }} />}
                  </Grid2>
                  <Grid2 size={7}>
                    <Typography variant="body2" sx={getWizardValueStyle(lpiStartDateError)}>
                      {DateString(lpiStartDate)}
                    </Typography>
                  </Grid2>
                </Grid2>
              </CardContent>
            </CardActionArea>
          </Card>
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
                  <Tooltip
                    title={`Edit ${settingsContext.isScottish ? "other" : "note"} details`}
                    placement="bottom"
                    sx={tooltipStyle}
                  >
                    <IconButton onClick={doEditOther} sx={{ pr: "16px", pb: "16px" }}>
                      <EditIcon sx={ActionIconStyle(true)} />
                    </IconButton>
                  </Tooltip>
                )
              }
              title={`${settingsContext.isScottish ? "Other" : "Note"}`}
              sx={{ height: "66px" }}
              slotProps={{
                title: { sx: getTitleStyle(editOther, haveOtherErrors) },
              }}
            />
            <CardActionArea onClick={doEditOther}>
              <CardContent>
                <Grid2 container rowSpacing={1}>
                  {settingsContext.isScottish && (
                    <>
                      <Grid2 size={4}>
                        <Typography variant="body2">Create Gaelic records</Typography>
                      </Grid2>
                      <Grid2 size={1} />
                      <Grid2 size={7}>
                        <Typography variant="body2" sx={getWizardValueStyle(false)}>
                          {getCheckIcon(createGaelic)}
                        </Typography>
                      </Grid2>
                    </>
                  )}
                  <Grid2 size={4}>
                    <Typography variant="body2">Note</Typography>
                  </Grid2>
                  <Grid2 size={1}>{noteError && <PriorityHighIcon sx={{ color: adsRed, height: "16px" }} />}</Grid2>
                  <Grid2 size={7}>
                    <Typography variant="body2" sx={getWizardValueStyle(noteError)}>
                      {note}
                    </Typography>
                  </Grid2>
                </Grid2>
              </CardContent>
            </CardActionArea>
          </Card>
        </Masonry>
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

export default PlotToPostalDetailsPage;
