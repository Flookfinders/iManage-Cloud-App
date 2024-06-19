//#region header */
/**************************************************************************************************
//
//  Description: Dialog used to multi-edit the logical status
//
//  Copyright:    © 2023 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   17.10.23 Sean Flook       IMANN-175 Initial Revision.
//    002   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system and renamed successor to successorCrossRef.
//    003   08.12.23 Sean Flook                 Migrated DataGrid to v6.
//    004   05.01.24 Sean Flook                 Use CSS shortcuts.
//    005   11.01.24 Sean Flook                 Fix warnings.
//    006   16.01.24 Sean Flook                 Changes required to fix warnings.
//    007   27.02.24 Sean Flook           MUL15 Changed to use dialogTitleStyle and renderErrors.
//    008   11.03.24 Sean Flook           MUL13 Changed control alignment.
//    009   11.03.24 Sean Flook           MUL11 Reset counts when closing dialog.
//    010   12.03.24 Sean Flook           MUL10 Display errors in a list control.
//    011   27.03.24 Sean Flook                 Added ADSDialogTitle.
//    012   23.05.24 Sean Flook       IMANN-486 Changed seqNo to seqNum.
//    013   19.06.24 Joshua McCormick IMANN-503 BLPU Level field max characters 30 and removed updown counter.
//    014   19.06.24 Joshua McCormick IMANN-503 BLPU Level AdsNumberControl type set to text to hide updown
//    015   19.06.24 Joshua McCormick IMANN-503 BLPU Level removed type prop
//    016   19.06.24 Joshua McCormick IMANN-503 BLPU Level max set to 99.9
//    017   19.06.24 Sean Flook       IMANN-629 Changes to code so that current user is remembered and a 401 error displays the login dialog.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

import React, { useContext, useState, useRef, useEffect, Fragment } from "react";
import PropTypes from "prop-types";

import SettingsContext from "../context/settingsContext";
import UserContext from "../context/userContext";
import PropertyContext from "../context/propertyContext";

import {
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
  Button,
  Grid,
  Backdrop,
  CircularProgress,
  List,
  ListItem,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSTextControl from "../components/ADSTextControl";
import ADSNumberControl from "../components/ADSNumberControl";
import ADSSwitchControl from "../components/ADSSwitchControl";
import ADSDialogTitle from "../components/ADSDialogTitle";

import { GetLookupLabel, renderErrorListItem } from "../utils/HelperUtils";
import {
  FilteredRepresentativePointCode,
  GetPropertyMapData,
  SaveProperty,
  addressToTitleCase,
} from "../utils/PropertyUtils";

import BLPUClassification from "../data/BLPUClassification";
import OSGClassification from "../data/OSGClassification";

import DoneIcon from "@mui/icons-material/Done";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";

import { adsGreenC, adsRed, adsLightGreyC } from "../utils/ADSColours";
import { blueButtonStyle, whiteButtonStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

MultiEditSingleFieldDialog.propTypes = {
  variant: PropTypes.oneOf([
    "classification",
    "rpc",
    "level",
    "excludeFromExport",
    "siteVisitRequired",
    "note",
    "unknown",
  ]).isRequired,
  propertyUprns: PropTypes.array.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

function MultiEditSingleFieldDialog({ variant, propertyUprns, isOpen, onClose }) {
  const theme = useTheme();

  const settingsContext = useContext(SettingsContext);
  const userContext = useContext(UserContext);
  const propertyContext = useContext(PropertyContext);

  const [showDialog, setShowDialog] = useState(false);
  const [classification, setClassification] = useState(null);
  const [rpc, setRpc] = useState(null);
  const [level, setLevel] = useState(null);
  const [excludeFromExport, setExcludeFromExport] = useState(false);
  const [siteVisitRequired, setSiteVisitRequired] = useState(false);
  const [note, setNote] = useState(null);
  const [noteOpen, setNoteOpen] = useState(false);

  const [title, setTitle] = useState(null);
  const [representativePointCodeLookup, setRepresentativePointCodeLookup] = useState(
    FilteredRepresentativePointCode(settingsContext.isScottish, false)
  );

  const [updating, setUpdating] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [finaliseErrors, setFinaliseErrors] = useState([]);
  const [haveErrors, setHaveErrors] = useState(false);
  const [rangeProcessedCount, setRangeProcessedCount] = useState(0);

  const properties = useRef(null);
  const savedProperty = useRef(null);
  const updateErrors = useRef([]);
  const totalUpdateCount = useRef(0);
  const updatedCount = useRef(0);
  const failedCount = useRef(0);
  const failedIds = useRef([]);

  /**
   * Event to handle when the dialog is closing.
   *
   * @param {object} event The event object.
   * @param {string} reason The reason why the dialog is closing.
   */
  const handleDialogClose = (event, reason) => {
    event.stopPropagation();
    if (reason === "escapeKeyDown") handleCancelClick();
  };

  /**
   * Event to handle when the confirm button is clicked.
   */
  const handleConfirmClick = () => {
    if (!haveErrors) updateProperties();
  };

  /**
   * Event to handle when the close button is clicked.
   */
  const handleCloseClick = () => {
    if (onClose) onClose(savedProperty.current);
    else setShowDialog(false);
  };

  /**
   * Event to handle when the cancel button is clicked.
   */
  const handleCancelClick = () => {
    if (onClose) onClose(null);
    else setShowDialog(false);
  };

  /**
   * Event to handle when the add to list button is clicked.
   */
  const handleAddToListClick = () => {
    if (finaliseErrors && finaliseErrors.length > 0) {
    }
  };

  /**
   * Event to handle when the add note button is clicked.
   */
  const handleAddNoteClick = () => {
    setNoteOpen(true);
  };

  /**
   * Event to handle when the classification value changes.
   *
   * @param {string|null} newValue The new classification value.
   */
  const handleClassificationChangeEvent = (newValue) => {
    setClassification(newValue);
  };

  /**
   * Event to handle when the RPC value changes.
   *
   * @param {number|null} newValue The new RPC value.
   */
  const handleRpcChangeEvent = (newValue) => {
    setRpc(newValue);
  };

  /**
   * Event to handle when the level value changes.
   *
   * @param {string|number|null} newValue The new level value.
   */
  const handleLevelChangeEvent = (newValue) => {
    setLevel(newValue);
  };

  /**
   * Event to handle when the exclude from export value changes.
   *
   * @param {boolean} newValue The new exclude from export value.
   */
  const handleExcludeFromExportChangeEvent = (newValue) => {
    setExcludeFromExport(newValue);
  };

  /**
   * Event to handle when the site visit required value changes.
   *
   * @param {boolean} newValue The new site visit required value.
   */
  const handleSiteVisitRequiredChangeEvent = (newValue) => {
    setSiteVisitRequired(newValue);
  };

  /**
   * Event to handle when the note changes.
   *
   * @param {object} event The event object.
   */
  const handleNoteChangeEvent = (newValue) => {
    setNote(newValue);
  };

  /**
   * Method to get the controls for the current variant.
   *
   * @returns {JSX.Element|null} The controls required for the current variant.
   */
  const getDialogContent = () => {
    switch (variant) {
      case "classification":
        return (
          <Grid container justifyContent="center" alignItems="center">
            <Grid item xs={12}>
              <ADSSelectControl
                label="Classification"
                isEditable
                isClassification
                includeHiddenCode
                useRounded
                doNotSetTitleCase
                lookupData={settingsContext.isScottish ? OSGClassification : BLPUClassification}
                lookupId="id"
                lookupLabel="display"
                lookupColour="colour"
                value={classification}
                errorText={null}
                onChange={handleClassificationChangeEvent}
                helperText="Classification code for the BLPU."
              />
            </Grid>
            {noteOpen && (
              <Grid item xs={12}>
                <ADSTextControl
                  isEditable
                  disabled={updating}
                  value={note}
                  id="classification_note"
                  maxLength={4000}
                  minLines={2}
                  maxLines={10}
                  onChange={handleNoteChangeEvent}
                />
              </Grid>
            )}
          </Grid>
        );

      case "rpc":
        return (
          <Grid container justifyContent="center" alignItems="center">
            <Grid item xs={12}>
              <ADSSelectControl
                label="RPC"
                isEditable
                useRounded
                disabled={updating}
                doNotSetTitleCase
                lookupData={representativePointCodeLookup}
                lookupId="id"
                lookupLabel={GetLookupLabel(settingsContext.isScottish)}
                lookupColour="colour"
                value={rpc}
                errorText={null}
                onChange={handleRpcChangeEvent}
                helperText="Representative Point Code."
              />
            </Grid>
            {noteOpen && (
              <Grid item xs={12}>
                <ADSTextControl
                  isEditable
                  disabled={updating}
                  value={note}
                  id="rpc_note"
                  maxLength={4000}
                  minLines={2}
                  maxLines={10}
                  onChange={handleNoteChangeEvent}
                />
              </Grid>
            )}
          </Grid>
        );

      case "level":
        return settingsContext.isScottish ? (
          <Grid container justifyContent="flex-start" alignItems="center">
            <Grid item xs={12}>
              <ADSNumberControl
                label="Level"
                maximum={99.9}
                isEditable
                value={level}
                errorText={null}
                helperText="Memorandum of the vertical position of the BLPU."
                onChange={handleLevelChangeEvent}
              />
            </Grid>
          </Grid>
        ) : (
          <Grid container justifyContent="flex-start" alignItems="center">
            <Grid item xs={12}>
              <ADSTextControl
                label="Level"
                isEditable
                value={level}
                id="lpi_level_multi_edit"
                maxLength={30}
                errorText={null}
                helperText="Memorandum of the vertical position of the BLPU."
                onChange={handleLevelChangeEvent}
              />
            </Grid>
            {noteOpen && (
              <Grid item xs={12}>
                <ADSTextControl
                  isEditable
                  disabled={updating}
                  value={note}
                  id="level_note"
                  maxLength={4000}
                  minLines={2}
                  maxLines={10}
                  onChange={handleNoteChangeEvent}
                />
              </Grid>
            )}
          </Grid>
        );

      case "excludeFromExport":
        return (
          <Grid container justifyContent="center" alignItems="center">
            <Grid item xs={12}>
              <ADSSwitchControl
                label="Exclude from export"
                isEditable
                checked={excludeFromExport}
                wideLabel
                trueLabel="Yes"
                falseLabel="No"
                errorText={null}
                helperText="Set this if you do not want these properties to be included in any exports."
                onChange={handleExcludeFromExportChangeEvent}
              />
            </Grid>
            {noteOpen && (
              <Grid item xs={12}>
                <ADSTextControl
                  isEditable
                  disabled={updating}
                  value={note}
                  id="exclude_from_export_note"
                  maxLength={4000}
                  minLines={2}
                  maxLines={10}
                  onChange={handleNoteChangeEvent}
                />
              </Grid>
            )}
          </Grid>
        );

      case "siteVisitRequired":
        return (
          <Grid container justifyContent="center" alignItems="center">
            <Grid item xs={12}>
              <ADSSwitchControl
                label="Site visit required"
                isEditable
                checked={siteVisitRequired}
                wideLabel
                trueLabel="Yes"
                falseLabel="No"
                errorText={null}
                helperText="Set this if these properties require a site visit."
                onChange={handleSiteVisitRequiredChangeEvent}
              />
            </Grid>
            {noteOpen && (
              <Grid item xs={12}>
                <ADSTextControl
                  isEditable
                  disabled={updating}
                  value={note}
                  id="site_visit_note"
                  maxLength={4000}
                  minLines={2}
                  maxLines={10}
                  onChange={handleNoteChangeEvent}
                />
              </Grid>
            )}
          </Grid>
        );

      case "note":
        return (
          <Grid container justifyContent="center" alignItems="center">
            <Grid item xs={12}>
              <ADSTextControl
                isEditable
                disabled={updating}
                value={note}
                id="note_note"
                maxLength={4000}
                minLines={2}
                maxLines={10}
                onChange={handleNoteChangeEvent}
              />
            </Grid>
          </Grid>
        );

      default:
        return "";
    }
  };

  /**
   * Method to update the selected properties.
   */
  const updateProperties = async () => {
    savedProperty.current = null;

    if (propertyUprns && propertyUprns.length > 0) {
      setUpdating(true);
      properties.current = [];
      savedProperty.current = [];
      totalUpdateCount.current = propertyUprns.length;
      updatedCount.current = 0;
      failedCount.current = 0;
      failedIds.current = [];
      setHaveErrors(false);
      updateErrors.current = [];
      setFinaliseErrors([]);

      for (const propertyUprn of propertyUprns) {
        const property = await GetPropertyMapData(propertyUprn, userContext);

        if (property) {
          let updatedProperty = null;

          const engLpi = property.lpis.filter((x) => x.language === "ENG");
          if (engLpi && engLpi.length > 0) {
            properties.current.push({
              id: property.pkId,
              uprn: property.uprn,
              address: addressToTitleCase(engLpi[0].address, engLpi[0].postcode),
            });
          }

          const minPkIdNote =
            property.blpuNotes && property.blpuNotes.length > 0
              ? property.blpuNotes.reduce((prev, curr) => (prev.pkId < curr.pkId ? prev : curr))
              : null;
          const newPkId = !minPkIdNote || !minPkIdNote.pkId || minPkIdNote.pkId > -10 ? -10 : minPkIdNote.pkId - 1;
          const maxSeqNum =
            property.blpuNotes && property.blpuNotes.length > 0
              ? property.blpuNotes.reduce((prev, curr) => (prev.seqNum > curr.seqNum ? prev : curr))
              : null;
          const newSeqNum = maxSeqNum && maxSeqNum.seqNum ? maxSeqNum.seqNum + 1 : 1;

          const updatedNotes = property.blpuNotes ? [...property.blpuNotes] : [];
          if (noteOpen || variant === "note")
            updatedNotes.push({
              uprn: property.uprn,
              note: note,
              changeType: "I",
              pkId: newPkId,
              seqNum: newSeqNum,
            });

          switch (variant) {
            case "classification":
              updatedProperty = {
                changeType: "U",
                blpuStateDate: property.blpuStateDate,
                rpc: property.rpc,
                startDate: property.startDate,
                endDate: property.endDate,
                parentUprn: property.parentUprn,
                neverExport: property.neverExport,
                siteSurvey: property.siteSurvey,
                uprn: property.uprn,
                logicalStatus: property.logicalStatus,
                blpuState: property.blpuState,
                blpuClass: classification,
                localCustodianCode: property.localCustodianCode,
                organisation: property.organisation,
                xcoordinate: property.xcoordinate,
                ycoordinate: property.ycoordinate,
                wardCode: property.wardCode,
                parishCode: property.parishCode,
                pkId: property.pkId,
                blpuAppCrossRefs: property.blpuAppCrossRefs,
                blpuProvenances: property.blpuProvenances,
                blpuNotes: updatedNotes,
                lpis: property.lpis,
              };
              break;

            case "rpc":
              if (settingsContext.isScottish)
                updatedProperty = {
                  changeType: "U",
                  blpuStateDate: property.blpuStateDate,
                  rpc: rpc,
                  startDate: property.startDate,
                  endDate: property.endDate,
                  parentUprn: property.parentUprn,
                  neverExport: property.neverExport,
                  siteSurvey: property.siteSurvey,
                  uprn: property.uprn,
                  logicalStatus: property.logicalStatus,
                  blpuState: property.blpuState,
                  blpuClass: property.blpuClass,
                  localCustodianCode: property.localCustodianCode,
                  organisation: property.organisation,
                  xcoordinate: property.xcoordinate,
                  ycoordinate: property.ycoordinate,
                  wardCode: property.wardCode,
                  parishCode: property.parishCode,
                  pkId: property.pkId,
                  blpuAppCrossRefs: property.blpuAppCrossRefs,
                  blpuProvenances: property.blpuProvenances,
                  classifications: property.classifications,
                  organisations: property.organisations,
                  successorCrossRefs: property.successorCrossRefs,
                  blpuNotes: updatedNotes,
                  lpis: property.lpis,
                };
              else
                updatedProperty = {
                  changeType: "U",
                  blpuStateDate: property.blpuStateDate,
                  rpc: rpc,
                  startDate: property.startDate,
                  endDate: property.endDate,
                  parentUprn: property.parentUprn,
                  neverExport: property.neverExport,
                  siteSurvey: property.siteSurvey,
                  uprn: property.uprn,
                  logicalStatus: property.logicalStatus,
                  blpuState: property.blpuState,
                  blpuClass: property.blpuClass,
                  localCustodianCode: property.localCustodianCode,
                  organisation: property.organisation,
                  xcoordinate: property.xcoordinate,
                  ycoordinate: property.ycoordinate,
                  wardCode: property.wardCode,
                  parishCode: property.parishCode,
                  pkId: property.pkId,
                  blpuAppCrossRefs: property.blpuAppCrossRefs,
                  blpuProvenances: property.blpuProvenances,
                  blpuNotes: updatedNotes,
                  lpis: property.lpis,
                };
              break;

            case "level":
              if (settingsContext.isScottish)
                updatedProperty = {
                  changeType: "U",
                  blpuStateDate: property.blpuStateDate,
                  rpc: property.rpc,
                  startDate: property.startDate,
                  endDate: property.endDate,
                  parentUprn: property.parentUprn,
                  neverExport: property.neverExport,
                  siteSurvey: property.siteSurvey,
                  uprn: property.uprn,
                  logicalStatus: property.logicalStatus,
                  blpuState: property.blpuState,
                  blpuClass: property.blpuClass,
                  localCustodianCode: property.localCustodianCode,
                  organisation: property.organisation,
                  xcoordinate: property.xcoordinate,
                  ycoordinate: property.ycoordinate,
                  wardCode: property.wardCode,
                  parishCode: property.parishCode,
                  pkId: property.pkId,
                  blpuAppCrossRefs: property.blpuAppCrossRefs,
                  blpuProvenances: property.blpuProvenances,
                  classifications: property.classifications,
                  organisations: property.organisations,
                  successorCrossRefs: property.successorCrossRefs,
                  blpuNotes: updatedNotes,
                  lpis: property.lpis.map((lpi) => {
                    return {
                      ...lpi,
                      changeType: "U",
                      level: level,
                    };
                  }),
                };
              else
                updatedProperty = {
                  changeType: "U",
                  blpuStateDate: property.blpuStateDate,
                  rpc: property.rpc,
                  startDate: property.startDate,
                  endDate: property.endDate,
                  parentUprn: property.parentUprn,
                  neverExport: property.neverExport,
                  siteSurvey: property.siteSurvey,
                  uprn: property.uprn,
                  logicalStatus: property.logicalStatus,
                  blpuState: property.blpuState,
                  blpuClass: property.blpuClass,
                  localCustodianCode: property.localCustodianCode,
                  organisation: property.organisation,
                  xcoordinate: property.xcoordinate,
                  ycoordinate: property.ycoordinate,
                  wardCode: property.wardCode,
                  parishCode: property.parishCode,
                  pkId: property.pkId,
                  blpuAppCrossRefs: property.blpuAppCrossRefs,
                  blpuProvenances: property.blpuProvenances,
                  blpuNotes: updatedNotes,
                  lpis: property.lpis.map((lpi) => {
                    return {
                      ...lpi,
                      changeType: "U",
                      level: level,
                    };
                  }),
                };
              break;

            case "excludeFromExport":
              if (settingsContext.isScottish)
                updatedProperty = {
                  changeType: "U",
                  blpuStateDate: property.blpuStateDate,
                  rpc: property.rpc,
                  startDate: property.startDate,
                  endDate: property.endDate,
                  parentUprn: property.parentUprn,
                  neverExport: excludeFromExport,
                  siteSurvey: property.siteSurvey,
                  uprn: property.uprn,
                  logicalStatus: property.logicalStatus,
                  blpuState: property.blpuState,
                  blpuClass: property.blpuClass,
                  localCustodianCode: property.localCustodianCode,
                  organisation: property.organisation,
                  xcoordinate: property.xcoordinate,
                  ycoordinate: property.ycoordinate,
                  wardCode: property.wardCode,
                  parishCode: property.parishCode,
                  pkId: property.pkId,
                  blpuAppCrossRefs: property.blpuAppCrossRefs,
                  blpuProvenances: property.blpuProvenances,
                  classifications: property.classifications,
                  organisations: property.organisations,
                  successorCrossRefs: property.successorCrossRefs,
                  blpuNotes: updatedNotes,
                  lpis: property.lpis,
                };
              else
                updatedProperty = {
                  changeType: "U",
                  blpuStateDate: property.blpuStateDate,
                  rpc: property.rpc,
                  startDate: property.startDate,
                  endDate: property.endDate,
                  parentUprn: property.parentUprn,
                  neverExport: excludeFromExport,
                  siteSurvey: property.siteSurvey,
                  uprn: property.uprn,
                  logicalStatus: property.logicalStatus,
                  blpuState: property.blpuState,
                  blpuClass: property.blpuClass,
                  localCustodianCode: property.localCustodianCode,
                  organisation: property.organisation,
                  xcoordinate: property.xcoordinate,
                  ycoordinate: property.ycoordinate,
                  wardCode: property.wardCode,
                  parishCode: property.parishCode,
                  pkId: property.pkId,
                  blpuAppCrossRefs: property.blpuAppCrossRefs,
                  blpuProvenances: property.blpuProvenances,
                  blpuNotes: updatedNotes,
                  lpis: property.lpis,
                };
              break;

            case "siteVisitRequired":
              if (settingsContext.isScottish)
                updatedProperty = {
                  changeType: "U",
                  blpuStateDate: property.blpuStateDate,
                  rpc: property.rpc,
                  startDate: property.startDate,
                  endDate: property.endDate,
                  parentUprn: property.parentUprn,
                  neverExport: property.neverExport,
                  siteSurvey: siteVisitRequired,
                  uprn: property.uprn,
                  logicalStatus: property.logicalStatus,
                  blpuState: property.blpuState,
                  blpuClass: property.blpuClass,
                  localCustodianCode: property.localCustodianCode,
                  organisation: property.organisation,
                  xcoordinate: property.xcoordinate,
                  ycoordinate: property.ycoordinate,
                  wardCode: property.wardCode,
                  parishCode: property.parishCode,
                  pkId: property.pkId,
                  blpuAppCrossRefs: property.blpuAppCrossRefs,
                  blpuProvenances: property.blpuProvenances,
                  classifications: property.classifications,
                  organisations: property.organisations,
                  successorCrossRefs: property.successorCrossRefs,
                  blpuNotes: updatedNotes,
                  lpis: property.lpis,
                };
              else
                updatedProperty = {
                  changeType: "U",
                  blpuStateDate: property.blpuStateDate,
                  rpc: property.rpc,
                  startDate: property.startDate,
                  endDate: property.endDate,
                  parentUprn: property.parentUprn,
                  neverExport: property.neverExport,
                  siteSurvey: siteVisitRequired,
                  uprn: property.uprn,
                  logicalStatus: property.logicalStatus,
                  blpuState: property.blpuState,
                  blpuClass: property.blpuClass,
                  localCustodianCode: property.localCustodianCode,
                  organisation: property.organisation,
                  xcoordinate: property.xcoordinate,
                  ycoordinate: property.ycoordinate,
                  wardCode: property.wardCode,
                  parishCode: property.parishCode,
                  pkId: property.pkId,
                  blpuAppCrossRefs: property.blpuAppCrossRefs,
                  blpuProvenances: property.blpuProvenances,
                  blpuNotes: updatedNotes,
                  lpis: property.lpis,
                };
              break;

            case "note":
              if (settingsContext.isScottish)
                updatedProperty = {
                  changeType: "U",
                  blpuStateDate: property.blpuStateDate,
                  rpc: property.rpc,
                  startDate: property.startDate,
                  endDate: property.endDate,
                  parentUprn: property.parentUprn,
                  neverExport: property.neverExport,
                  siteSurvey: property.siteSurvey,
                  uprn: property.uprn,
                  logicalStatus: property.logicalStatus,
                  blpuState: property.blpuState,
                  blpuClass: property.blpuClass,
                  localCustodianCode: property.localCustodianCode,
                  organisation: property.organisation,
                  xcoordinate: property.xcoordinate,
                  ycoordinate: property.ycoordinate,
                  wardCode: property.wardCode,
                  parishCode: property.parishCode,
                  pkId: property.pkId,
                  blpuAppCrossRefs: property.blpuAppCrossRefs,
                  blpuProvenances: property.blpuProvenances,
                  classifications: property.classifications,
                  organisations: property.organisations,
                  successorCrossRefs: property.successorCrossRefs,
                  blpuNotes: updatedNotes,
                  lpis: property.lpis,
                };
              else
                updatedProperty = {
                  changeType: "U",
                  blpuStateDate: property.blpuStateDate,
                  rpc: property.rpc,
                  startDate: property.startDate,
                  endDate: property.endDate,
                  parentUprn: property.parentUprn,
                  neverExport: property.neverExport,
                  siteSurvey: property.siteSurvey,
                  uprn: property.uprn,
                  logicalStatus: property.logicalStatus,
                  blpuState: property.blpuState,
                  blpuClass: property.blpuClass,
                  localCustodianCode: property.localCustodianCode,
                  organisation: property.organisation,
                  xcoordinate: property.xcoordinate,
                  ycoordinate: property.ycoordinate,
                  wardCode: property.wardCode,
                  parishCode: property.parishCode,
                  pkId: property.pkId,
                  blpuAppCrossRefs: property.blpuAppCrossRefs,
                  blpuProvenances: property.blpuProvenances,
                  blpuNotes: updatedNotes,
                  lpis: property.lpis,
                };
              break;

            default:
              break;
          }

          if (updatedProperty) {
            SaveProperty(updatedProperty, false, userContext, propertyContext, settingsContext.isScottish).then(
              (result) => {
                if (result) {
                  updatedCount.current++;
                  savedProperty.current.push(result);
                  setRangeProcessedCount(updatedCount.current + failedCount.current);
                }
              }
            );
          } else {
            failedCount.current++;
          }
        }
      }
    }
  };

  useEffect(() => {
    setRepresentativePointCodeLookup(FilteredRepresentativePointCode(settingsContext.isScottish, false));

    if (isOpen) {
      switch (variant) {
        case "classification":
          setTitle("Edit classification");
          break;

        case "rpc":
          setTitle("Edit representative point code");
          break;

        case "level":
          setTitle("Edit level");
          break;

        case "excludeFromExport":
          setTitle("Edit exclude from export");
          break;

        case "siteVisitRequired":
          setTitle("Edit site visit required");
          break;

        case "note":
          setTitle("Add note");
          break;

        default:
          setTitle(`Unknown variant: ${variant}`);
          break;
      }

      setHaveErrors(false);
      setNoteOpen(false);
      setCompleted(false);
      setUpdating(false);
    } else {
      failedCount.current = 0;
      updatedCount.current = 0;
      totalUpdateCount.current = 0;
      setRangeProcessedCount(0);
    }

    setShowDialog(isOpen);
  }, [variant, settingsContext.isScottish, isOpen]);

  useEffect(() => {
    const getErrorList = (currentErrors) => {
      const errorList = [];

      if (currentErrors.blpu && currentErrors.blpu.length > 0) {
        for (const error of currentErrors.blpu) {
          const errorStr = `BLPU [${error.field}]: ${[...new Set(error.errors)].join(", ")}`;
          if (!errorList.includes(errorStr)) errorList.push(errorStr);
        }
      }

      if (currentErrors.lpi && currentErrors.lpi.length > 0) {
        for (const error of currentErrors.lpi) {
          const errorStr = `LPI [${error.field}]: ${[...new Set(error.errors)].join(", ")}`;
          if (!errorList.includes(errorStr)) errorList.push(errorStr);
        }
      }

      if (currentErrors.provenance && currentErrors.provenance.length > 0) {
        for (const error of currentErrors.provenance) {
          const errorStr = `Provenance [${error.field}]: ${[...new Set(error.errors)].join(", ")}`;
          if (!errorList.includes(errorStr)) errorList.push(errorStr);
        }
      }

      if (currentErrors.crossRef && currentErrors.crossRef.length > 0) {
        for (const error of currentErrors.crossRef) {
          const errorStr = `Cross reference [${error.field}]: ${[...new Set(error.errors)].join(", ")}`;
          if (!errorList.includes(errorStr)) errorList.push(errorStr);
        }
      }

      if (currentErrors.classification && currentErrors.classification.length > 0) {
        for (const error of currentErrors.classification) {
          const errorStr = `Classification [${error.field}]: ${[...new Set(error.errors)].join(", ")}`;
          if (!errorList.includes(errorStr)) errorList.push(errorStr);
        }
      }

      if (currentErrors.organisation && currentErrors.organisation.length > 0) {
        for (const error of currentErrors.organisation) {
          const errorStr = `Organisation [${error.field}]: ${[...new Set(error.errors)].join(", ")}`;
          if (!errorList.includes(errorStr)) errorList.push(errorStr);
        }
      }

      if (currentErrors.successorCrossRef && currentErrors.successorCrossRef.length > 0) {
        for (const error of currentErrors.successorCrossRef) {
          const errorStr = `Successor cross reference [${error.field}]: ${[...new Set(error.errors)].join(", ")}`;
          if (!errorList.includes(errorStr)) errorList.push(errorStr);
        }
      }

      if (currentErrors.note && currentErrors.note.length > 0) {
        for (const error of currentErrors.note) {
          const errorStr = `Note [${error.field}]: ${[...new Set(error.errors)].join(", ")}`;
          if (!errorList.includes(errorStr)) errorList.push(errorStr);
        }
      }

      return errorList.join("\n");
    };

    if (
      propertyContext.currentPropertyHasErrors &&
      propertyContext.currentErrors &&
      propertyContext.currentErrors.pkId
    ) {
      if (!failedIds.current.includes(propertyContext.currentErrors.pkId)) {
        failedIds.current = [...failedIds.current, propertyContext.currentErrors.pkId];

        const failedAddress = properties.current
          ? properties.current.find((x) => x.id === propertyContext.currentErrors.pkId)
          : null;

        if (failedAddress) {
          if (updateErrors.current)
            updateErrors.current = [
              ...updateErrors.current,
              {
                id: propertyContext.currentErrors.pkId,
                uprn: failedAddress.uprn,
                address: failedAddress.address,
                errors: getErrorList(propertyContext.currentErrors),
              },
            ];
          else
            updateErrors.current = [
              {
                id: propertyContext.currentErrors.pkId,
                uprn: failedAddress.uprn,
                address: failedAddress.address,
                errors: getErrorList(propertyContext.currentErrors),
              },
            ];
          if (Array.isArray(updateErrors.current)) setFinaliseErrors(updateErrors.current);
          else setFinaliseErrors([updateErrors.current]);
        }

        failedCount.current++;
        setRangeProcessedCount(updatedCount.current + failedCount.current);
      }
    }
  }, [propertyContext.currentErrors, propertyContext.currentPropertyHasErrors]);

  useEffect(() => {
    if (totalUpdateCount.current > 0 && totalUpdateCount.current === updatedCount.current + failedCount.current) {
      switch (variant) {
        case "classification":
          setTitle("Edit classification: completed");
          break;

        case "rpc":
          setTitle("Edit representative point code: completed");
          break;

        case "level":
          setTitle("Edit level: completed");
          break;

        case "excludeFromExport":
          setTitle("Edit exclude from export: completed");
          break;

        case "siteVisitRequired":
          setTitle("Edit site visit required: completed");
          break;

        case "note":
          setTitle("Add note: completed");
          break;

        default:
          setTitle(`Unknown variant: ${variant}`);
          break;
      }

      setHaveErrors(failedCount.current > 0);
      setCompleted(true);
      setUpdating(false);
    }
  }, [rangeProcessedCount, variant]);

  return (
    <Dialog
      open={showDialog}
      aria-labelledby="multi-edit-single-field-dialog"
      fullWidth
      maxWidth="xs" //"sm"
      onClose={handleDialogClose}
    >
      <ADSDialogTitle title={`${title}`} closeTooltip="Close" onClose={handleCancelClick} />
      <DialogContent sx={{ mt: theme.spacing(2) }}>
        {!completed ? (
          getDialogContent()
        ) : (
          <Fragment>
            <Stack direction="column" spacing={1}>
              <Stack direction="row" justifyContent="flex-start" alignItems="flex-end" spacing={1}>
                <Typography variant="body1" gutterBottom sx={{ fontWeight: 700, color: adsGreenC }}>
                  {updatedCount.current}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  properties were successfully updated
                </Typography>
              </Stack>
              {failedCount.current > 0 && (
                <Stack direction="column" spacing={1}>
                  <Stack direction="row" justifyContent="flex-start" alignItems="flex-end" spacing={1}>
                    <Typography variant="body1" gutterBottom sx={{ fontWeight: 700, color: adsRed }}>
                      {failedCount.current}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      properties were not updated:
                    </Typography>
                  </Stack>
                  <Box
                    sx={{
                      height: "197px",
                      border: `1px solid ${adsLightGreyC}`,
                      overflowY: "auto",
                    }}
                  >
                    {finaliseErrors && finaliseErrors.length > 0 && (
                      <List
                        sx={{ width: "100%", pt: "0px", pb: "0px" }}
                        component="nav"
                        key="multi-edit-single-field-errors"
                      >
                        {finaliseErrors.map((rec, index) => (
                          <ListItem alignItems="flex-start" dense divider id={`multi-edit-single-field-error-${index}`}>
                            {renderErrorListItem(rec)}
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>
                  {process.env.NODE_ENV === "development" && (
                    <Button
                      onClick={handleAddToListClick}
                      autoFocus
                      variant="contained"
                      sx={{ ...whiteButtonStyle, width: "135px" }}
                      startIcon={<PlaylistAddIcon />}
                    >
                      Add to list
                    </Button>
                  )}
                </Stack>
              )}
            </Stack>
          </Fragment>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "flex-start", ml: theme.spacing(3), mb: theme.spacing(2) }}>
        {!completed ? (
          <Stack direction="column" spacing={3}>
            {!noteOpen && variant !== "note" && (
              <Button
                onClick={handleAddNoteClick}
                autoFocus
                disabled={updating}
                variant="contained"
                sx={whiteButtonStyle}
                startIcon={<NoteAddIcon />}
              >
                Add note
              </Button>
            )}
            <Button
              onClick={handleConfirmClick}
              autoFocus
              disabled={updating}
              variant="contained"
              sx={blueButtonStyle}
              startIcon={<DoneIcon />}
            >
              Confirm
            </Button>
          </Stack>
        ) : (
          <Button
            onClick={handleCloseClick}
            autoFocus
            variant="contained"
            sx={blueButtonStyle}
            startIcon={<DoneIcon />}
          >
            Close
          </Button>
        )}
      </DialogActions>
      {updating && (
        <Backdrop open={updating}>
          <CircularProgress color="inherit" />
        </Backdrop>
      )}
    </Dialog>
  );
}

export default MultiEditSingleFieldDialog;
