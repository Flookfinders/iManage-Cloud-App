/* #region header */
/**************************************************************************************************
//
//  Description: Edit Property Template tab
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
//    005   24.11.23 Joel Benford               Include Scottish text for LPI official/postal fields
//    006   05.12.23 Joel Benford               Classification fixes (still need to add scheme)
//    007   05.01.24 Sean Flook                 Use CSS shortcuts.
//    008   08.01.24 Joel Benford               Classification and sub locality
//    009   10.01.24 Sean Flook                 Fix warnings.
//    010   16.01.23 Joel Benford               OS/GP level split
//    011   16.01.24 Sean Flook                 Changes required to fix warnings.
//    012   25.01.24 Sean Flook                 Changes required after UX review.
//    013   08.05.24 Sean Flook       IMANN-447 Added exclude from export and site visit to the options of fields that can be edited.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import LookupContext from "../context/lookupContext";
import SettingsContext from "../context/settingsContext";

import {
  Typography,
  Button,
  Divider,
  Tooltip,
  Grid,
  Card,
  CardHeader,
  CardActionArea,
  CardContent,
  IconButton,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSActionButton from "../components/ADSActionButton";

import EditTemplateDialog from "../dialogs/EditTemplateDialog";

import {
  getBlpuStatus,
  getBlpuRpc,
  getBlpuState,
  getBlpuClassification,
  getLpiStatus,
  getLpiPostTown,
  getLpiSubLocality,
  getLpiOfficialAddress,
  getLpiPostalAddress,
  getOtherCrossRefSource,
  getOtherProvenance,
} from "../utils/PropertyUtils";
import { StringToTitleCase } from "../utils/HelperUtils";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import LockIcon from "@mui/icons-material/Lock";

import { adsPaleBlueA, adsRed } from "../utils/ADSColours";
import {
  blueButtonStyle,
  redButtonStyle,
  ActionIconStyle,
  settingsCardStyle,
  settingsCardContentStyle,
  tooltipStyle,
  getTitleStyle,
} from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

EditPropertyTemplateTab.propTypes = {
  data: PropTypes.object.isRequired,
  error: PropTypes.string,
  onHomeClick: PropTypes.func.isRequired,
  onUpdateData: PropTypes.func.isRequired,
  onDuplicateClick: PropTypes.func.isRequired,
  onDeleteClick: PropTypes.func.isRequired,
};

function EditPropertyTemplateTab({ data, error, onHomeClick, onUpdateData, onDuplicateClick, onDeleteClick }) {
  const theme = useTheme();

  const lookupContext = useContext(LookupContext);
  const settingsContext = useContext(SettingsContext);

  const [title, setTitle] = useState(null);
  const [description, setDescription] = useState(null);
  const [blpuStatus, setBlpuStatus] = useState(null);
  const [blpuRpc, setBlpuRpc] = useState(null);
  const [blpuState, setBlpuState] = useState(null);
  const [blpuClassification, setBlpuClassification] = useState(null);
  const [blpuLevel, setBlpuLevel] = useState(0); // OS numeric
  const [excludeFromExport, setExcludeFromExport] = useState(false);
  const [siteVisit, setSiteVisit] = useState(false);
  const [classificationScheme, setClassificationScheme] = useState(null);
  const [lpiStatus, setLpiStatus] = useState(null);
  const [lpiPostTown, setLpiPostTown] = useState(null);
  const [lpiSubLocality, setLpiSubLocality] = useState(null);
  const [lpiLevel, setLpiLevel] = useState(""); // GP string
  const [lpiOfficialAddress, setLpiOfficialAddress] = useState(null);
  const [lpiPostalAddress, setLpiPostalAddress] = useState(null);
  const [otherCrossRefSource, setOtherCrossRefSource] = useState(null);
  const [otherProvenance, setOtherProvenance] = useState(null);
  const [otherNote, setOtherNote] = useState(null);

  const [editBlpu, setEditBlpu] = useState(false);
  const [editLpi, setEditLpi] = useState(false);
  const [editClassification, setEditClassification] = useState(false);
  const [editOther, setEditOther] = useState(false);

  const [editVariant, setEditVariant] = useState(null);
  const [editData, setEditData] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const [titleHighlighted, setTitleHighlighted] = useState(false);
  const [descriptionHighlighted, setDescriptionHighlighted] = useState(false);

  const [updateError, setUpdateError] = useState(null);

  /**
   * Event to handle when the home button is clicked.
   */
  const handleHomeClick = () => {
    if (onHomeClick) onHomeClick();
  };

  /**
   * Event to handle when the duplicate template button is clicked.
   */
  const handleDuplicateTemplate = () => {
    if (onDuplicateClick) onDuplicateClick(data.templatePkId);
  };

  /**
   * Event to handle when the delete template button is clicked.
   */
  const handleDeleteTemplate = () => {
    if (onDeleteClick) onDeleteClick(data.templatePkId);
  };

  /**
   * Event to handle when the BLPU data is edited.
   */
  const doEditBlpu = () => {
    setEditVariant("blpu");
    setUpdateError(null);
    setEditData({
      blpuLogicalStatus: data.blpuLogicalStatus,
      rpc: data.rpc,
      state: data.state,
      classification: data.classification,
      level: data.blpuLevel,
      excludeFromExport: data.excludeFromExport,
      siteVisit: data.siteVisit,
    });
    setShowEditDialog(true);
  };

  /**
   * Event to handle when the LPI data is edited.
   */
  const doEditLpi = () => {
    setEditVariant("lpi");
    setUpdateError(null);
    setEditData({
      lpiLogicalStatus: data.lpiLogicalStatus,
      postTownRef: data.postTownRef,
      subLocalityRef: data.subLocalityRef,
      level: data.lpiLevel,
      officialAddressMaker: data.officialAddressMaker,
      postallyAddressable: data.postallyAddressable,
    });
    setShowEditDialog(true);
  };

  /**
   * Event to handle when the Classification data is edited.
   */
  const doEditClassification = () => {
    setEditVariant("classification");
    setUpdateError(null);
    setEditData({
      classification: data.classification,
      classificationScheme: data.classificationScheme,
    });
    setShowEditDialog(true);
  };

  /**
   * Event to handle when the other data is edited.
   */
  const doEditOther = () => {
    setEditVariant("other");
    setUpdateError(null);
    setEditData({
      source: data.source,
      provCode: data.provCode,
      note: data.note,
    });
    setShowEditDialog(true);
  };

  /**
   * Event to handle when the data has been edited.
   *
   * @param {object} updatedData The data that has been edited.
   */
  const handleDoneEditTemplate = (updatedData) => {
    if (updatedData) {
      switch (editVariant) {
        case "title":
          setTitle(updatedData.templateName);
          if (onUpdateData)
            onUpdateData({
              templatePkId: data.templatePkId,
              templateName: updatedData.templateName,
              templateDescription: description,
              templateType: data.templateType,
              templateUseType: data.templateUseType,
              numberingSystem: data.numberingSystem,
              blpuTemplatePkId: data.blpuTemplatePkId,
              blpuLogicalStatus: blpuStatus,
              blpuLevel: blpuLevel,
              excludeFromExport: excludeFromExport,
              siteVisit: siteVisit,
              rpc: blpuRpc,
              state: blpuState,
              classification: blpuClassification,
              classificationScheme: classificationScheme,
              lpiTemplatePkId: data.lpiTemplatePkId,
              lpiLogicalStatus: lpiStatus,
              postTownRef: lpiPostTown,
              subLocalityRef: lpiSubLocality,
              lpiLevel: lpiLevel,
              officialAddressMaker: lpiOfficialAddress,
              postallyAddressable: lpiPostalAddress,
              miscTemplatePkId: data.miscTemplatePkId,
              source: otherCrossRefSource,
              provCode: otherProvenance,
              note: otherNote,
            });
          break;

        case "description":
          setDescription(updatedData.templateDescription);
          if (onUpdateData)
            onUpdateData({
              templatePkId: data.templatePkId,
              templateName: title,
              templateDescription: updatedData.templateDescription,
              templateType: data.templateType,
              templateUseType: data.templateUseType,
              numberingSystem: data.numberingSystem,
              blpuTemplatePkId: data.blpuTemplatePkId,
              blpuLogicalStatus: blpuStatus,
              blpuLevel: blpuLevel,
              excludeFromExport: excludeFromExport,
              siteVisit: siteVisit,
              rpc: blpuRpc,
              state: blpuState,
              classification: blpuClassification,
              classificationScheme: classificationScheme,
              lpiTemplatePkId: data.lpiTemplatePkId,
              lpiLogicalStatus: lpiStatus,
              postTownRef: lpiPostTown,
              subLocalityRef: lpiSubLocality,
              lpiLevel: lpiLevel,
              officialAddressMaker: lpiOfficialAddress,
              postallyAddressable: lpiPostalAddress,
              miscTemplatePkId: data.miscTemplatePkId,
              source: otherCrossRefSource,
              provCode: otherProvenance,
              note: otherNote,
            });
          break;

        case "blpu":
          setBlpuStatus(updatedData.blpuLogicalStatus);
          setBlpuRpc(updatedData.rpc);
          setBlpuState(updatedData.state);
          setBlpuLevel(updatedData.blpuLevel);
          setExcludeFromExport(updatedData.excludeFromExport);
          setSiteVisit(updatedData.siteVisit);
          if (onUpdateData)
            onUpdateData({
              templatePkId: data.templatePkId,
              templateName: title,
              templateDescription: description,
              templateType: data.templateType,
              templateUseType: data.templateUseType,
              numberingSystem: data.numberingSystem,
              blpuTemplatePkId: data.blpuTemplatePkId,
              blpuLogicalStatus: updatedData.blpuLogicalStatus,
              blpuLevel: updatedData.blpuLevel,
              excludeFromExport: updatedData.excludeFromExport,
              siteVisit: updatedData.siteVisit,
              rpc: updatedData.rpc,
              state: updatedData.state,
              // if Scottish this is handled in classification card, so return no change here
              classification: settingsContext.isScottish ? blpuClassification : updatedData.classification,
              classificationScheme: classificationScheme,
              lpiTemplatePkId: data.lpiTemplatePkId,
              lpiLogicalStatus: lpiStatus,
              postTownRef: lpiPostTown,
              subLocalityRef: lpiSubLocality,
              lpiLevel: lpiLevel,
              officialAddressMaker: lpiOfficialAddress,
              postallyAddressable: lpiPostalAddress,
              miscTemplatePkId: data.miscTemplatePkId,
              source: otherCrossRefSource,
              provCode: otherProvenance,
              note: otherNote,
            });
          break;

        case "lpi":
          setLpiStatus(updatedData.lpiLogicalStatus);
          setLpiPostTown(updatedData.postTownRef);
          setLpiSubLocality(updatedData.subLocalityRef);
          setLpiLevel(updatedData.lpiLevel);
          setLpiOfficialAddress(updatedData.officialAddressMaker);
          setLpiPostalAddress(updatedData.postallyAddressable);
          if (onUpdateData)
            onUpdateData({
              templatePkId: data.templatePkId,
              templateName: title,
              templateDescription: description,
              templateType: data.templateType,
              templateUseType: data.templateUseType,
              numberingSystem: data.numberingSystem,
              blpuTemplatePkId: data.blpuTemplatePkId,
              blpuLogicalStatus: blpuStatus,
              blpuLevel: blpuLevel,
              excludeFromExport: excludeFromExport,
              siteVisit: siteVisit,
              rpc: blpuRpc,
              state: blpuState,
              classification: blpuClassification,
              classificationScheme: classificationScheme,
              lpiTemplatePkId: data.lpiTemplatePkId,
              lpiLogicalStatus: updatedData.lpiLogicalStatus,
              postTownRef: updatedData.postTownRef,
              subLocalityRef: updatedData.subLocalityRef,
              lpiLevel: updatedData.lpiLevel,
              officialAddressMaker: updatedData.officialAddressMaker,
              postallyAddressable: updatedData.postallyAddressable,
              miscTemplatePkId: data.miscTemplatePkId,
              source: otherCrossRefSource,
              provCode: otherProvenance,
              note: otherNote,
            });
          break;

        case "classification":
          // if we're here, it's Scottish
          setBlpuClassification(updatedData.classification);
          setClassificationScheme(updatedData.classificationScheme);
          if (onUpdateData)
            onUpdateData({
              templatePkId: data.templatePkId,
              templateName: title,
              templateDescription: description,
              templateType: data.templateType,
              templateUseType: data.templateUseType,
              numberingSystem: data.numberingSystem,
              blpuTemplatePkId: data.blpuTemplatePkId,
              blpuLogicalStatus: data.blpuLogicalStatus,
              blpuLevel: blpuLevel,
              excludeFromExport: excludeFromExport,
              siteVisit: siteVisit,
              rpc: data.rpc,
              state: data.state,
              classification: updatedData.classification,
              classificationScheme: updatedData.classificationScheme,
              lpiTemplatePkId: data.lpiTemplatePkId,
              lpiLogicalStatus: lpiStatus,
              postTownRef: lpiPostTown,
              subLocalityRef: lpiSubLocality,
              lpiLevel: lpiLevel,
              officialAddressMaker: lpiOfficialAddress,
              postallyAddressable: lpiPostalAddress,
              miscTemplatePkId: data.miscTemplatePkId,
              source: otherCrossRefSource,
              provCode: otherProvenance,
              note: otherNote,
            });
          break;

        case "other":
          setOtherCrossRefSource(updatedData.source);
          setOtherProvenance(updatedData.provCode);
          setOtherNote(updatedData.note);
          if (onUpdateData)
            onUpdateData({
              templatePkId: data.templatePkId,
              templateName: title,
              templateDescription: description,
              templateType: data.templateType,
              templateUseType: data.templateUseType,
              numberingSystem: data.numberingSystem,
              blpuTemplatePkId: data.blpuTemplatePkId,
              blpuLogicalStatus: blpuStatus,
              blpuLevel: blpuLevel,
              excludeFromExport: excludeFromExport,
              siteVisit: siteVisit,
              rpc: blpuRpc,
              state: blpuState,
              classification: blpuClassification,
              classificationScheme: classificationScheme,
              lpiTemplatePkId: data.lpiTemplatePkId,
              lpiLogicalStatus: lpiStatus,
              postTownRef: lpiPostTown,
              subLocalityRef: lpiSubLocality,
              lpiLevel: lpiLevel,
              officialAddressMaker: lpiOfficialAddress,
              postallyAddressable: lpiPostalAddress,
              miscTemplatePkId: data.miscTemplatePkId,
              source: updatedData.source,
              provCode: updatedData.provCode,
              note: updatedData.note,
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
   * Event to handle when the mouse enters the title.
   */
  const doMouseEnterTitle = () => {
    setTitleHighlighted(true);
  };

  /**
   * Event to handle when the mouse leaves the title.
   */
  const doMouseLeaveTitle = () => {
    setTitleHighlighted(false);
  };

  /**
   * Event to handle when the mouse enters the description.
   */
  const doMouseEnterDescription = () => {
    setDescriptionHighlighted(true);
  };

  /**
   * Event to handle when the mouse leaves the description.
   */
  const doMouseLeaveDescription = () => {
    setDescriptionHighlighted(false);
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
   * Method to get the title icon.
   *
   * @returns {JSX.Element} The title icon.
   */
  const getTitleIcon = () => {
    if (data.templateType === 3) {
      return (
        <Tooltip title="Edit template title" placement="bottom" sx={tooltipStyle}>
          <IconButton onClick={doEditTitle}>
            <EditIcon sx={ActionIconStyle(true)} />
          </IconButton>
        </Tooltip>
      );
    } else {
      return (
        <IconButton disabled>
          <LockIcon sx={{ height: "16px", position: "absolute", width: "16px" }} />
        </IconButton>
      );
    }
  };

  /**
   * Event to handle when the title is clicked.
   */
  const handleTitleClick = () => {
    if (data.templateType === 3) doEditTitle();
  };

  /**
   * Event to handle the editing of the title.
   */
  const doEditTitle = () => {
    setEditVariant("title");
    setEditData({
      title: title,
    });
    setShowEditDialog(true);
  };

  /**
   * Event to handle the editing of the description.
   */
  const doEditDescription = () => {
    setEditVariant("description");
    setEditData({
      description: description,
    });
    setShowEditDialog(true);
  };

  /**
   * Method to get the styling for the title/description.
   * @param {boolean} highlighted True if the title/description is highlighted; otherwise false.
   * @returns {object|null} The styling for the title/description.
   */
  const getTitleDescriptionStyle = (highlighted) => {
    if (highlighted) return { backgroundColor: adsPaleBlueA };
    else return null;
  };

  useEffect(() => {
    if (data) {
      setTitle(data.templateName);
      setDescription(data.templateDescription);
      setBlpuStatus(data.blpuLogicalStatus);
      setBlpuRpc(data.rpc);
      setBlpuState(data.state);
      setBlpuClassification(data.classification);
      setBlpuLevel(data.blpuLevel);
      setExcludeFromExport(data.excludeFromExport);
      setSiteVisit(data.siteVisit);
      setClassificationScheme(data.classificationScheme);
      setLpiStatus(data.lpiLogicalStatus);
      setLpiPostTown(data.postTownRef);
      setLpiSubLocality(data.subLocalityRef);
      setLpiLevel(data.lpiLevel);
      setLpiOfficialAddress(data.officialAddressMaker);
      setLpiPostalAddress(data.postallyAddressable);
      setOtherCrossRefSource(data.source);
      setOtherProvenance(data.provCode);
      setOtherNote(data.note);
    }
  }, [data]);

  useEffect(() => {
    setUpdateError(error);
  }, [error]);

  return (
    <Box
      sx={{
        ml: theme.spacing(1),
        mr: theme.spacing(4.5),
        mt: theme.spacing(2),
      }}
    >
      <Stack direction="column" spacing={2}>
        <Stack direction="row" justifyContent="space-between">
          <Stack
            direction="row"
            spacing={0.5}
            justifyContent="flex-start"
            alignItems="center"
            divider={<Divider orientation="vertical" flexItem />}
          >
            <ADSActionButton variant="home" tooltipTitle="Home" tooltipPlacement="bottom" onClick={handleHomeClick} />
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              onMouseEnter={doMouseEnterTitle}
              onMouseLeave={doMouseLeaveTitle}
            >
              <Typography
                variant="h6"
                sx={getTitleDescriptionStyle(titleHighlighted && data.templateType === 3)}
                onClick={handleTitleClick}
              >
                {title}
              </Typography>
              {titleHighlighted && getTitleIcon()}
            </Stack>
          </Stack>
          <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
            <Tooltip title="Duplicate template" placement="bottom" sx={tooltipStyle}>
              <Button
                variant="contained"
                sx={blueButtonStyle}
                startIcon={<ContentCopyIcon />}
                onClick={handleDuplicateTemplate}
              >
                <Typography variant="body2">Duplicate</Typography>
              </Button>
            </Tooltip>
            {data.templateType === 3 && (
              <Tooltip title="Delete template" placement="bottom" sx={tooltipStyle}>
                <Button
                  variant="contained"
                  sx={redButtonStyle}
                  startIcon={<DeleteOutlineIcon />}
                  onClick={handleDeleteTemplate}
                >
                  <Typography variant="body2">Delete</Typography>
                </Button>
              </Tooltip>
            )}
          </Stack>
        </Stack>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          onMouseEnter={doMouseEnterDescription}
          onMouseLeave={doMouseLeaveDescription}
          sx={{ pl: theme.spacing(5.75) }}
        >
          <Typography variant="body2" sx={getTitleDescriptionStyle(descriptionHighlighted)} onClick={doEditDescription}>
            {description}
          </Typography>
          {descriptionHighlighted && (
            <Tooltip title="Edit template description" placement="bottom" sx={tooltipStyle}>
              <IconButton onClick={doEditDescription}>
                <EditIcon sx={ActionIconStyle(true)} />
              </IconButton>
            </Tooltip>
          )}
          {updateError && (
            <Typography variant="body2" sx={{ color: adsRed }}>
              {updateError}
            </Typography>
          )}
        </Stack>
        <Grid
          container
          sx={{
            pl: theme.spacing(2.75),
            pr: theme.spacing(3.5),
          }}
          spacing={3}
        >
          <Grid item xs={6}>
            {/* BLPU */}
            <Card
              variant="outlined"
              elevation={0}
              onMouseEnter={doMouseEnterBlpu}
              onMouseLeave={doMouseLeaveBlpu}
              sx={settingsCardStyle(editBlpu)}
            >
              <CardHeader
                action={
                  editBlpu && (
                    <Tooltip title="Edit BLPU settings" placement="bottom" sx={tooltipStyle}>
                      <IconButton onClick={doEditBlpu} sx={{ pr: "16px", pb: "16px" }}>
                        <EditIcon sx={ActionIconStyle(true)} />
                      </IconButton>
                    </Tooltip>
                  )
                }
                title="BLPU settings"
                titleTypographyProps={{
                  sx: getTitleStyle(editBlpu),
                }}
                sx={{ height: "66px" }}
              />
              <CardActionArea onClick={doEditBlpu}>
                <CardContent sx={settingsCardContentStyle("property")}>
                  <Grid container rowSpacing={1}>
                    <Grid item xs={3}>
                      <Typography variant="body2">Status</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {getBlpuStatus(blpuStatus, settingsContext.isScottish)}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="body2">RPC</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {getBlpuRpc(blpuRpc, settingsContext.isScottish)}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="body2">State</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {getBlpuState(blpuState, settingsContext.isScottish)}
                      </Typography>
                    </Grid>
                    {!settingsContext.isScottish && (
                      <>
                        <Grid item xs={3}>
                          <Typography variant="body2">Classification</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getBlpuClassification(blpuClassification, settingsContext.isScottish)}
                          </Typography>
                        </Grid>
                      </>
                    )}
                    {settingsContext.isScottish && (
                      <>
                        <Grid item xs={3}>
                          <Typography variant="body2">Level</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {blpuLevel}
                          </Typography>
                        </Grid>
                      </>
                    )}
                    <Grid item xs={3}>
                      <Typography variant="body2">Exclude from export</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {`${excludeFromExport ? "Yes" : "No"}`}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="body2">Site visit required</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {`${siteVisit ? "Yes" : "No"}`}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          {/* LPI */}
          <Grid item xs={6}>
            <Card
              variant="outlined"
              elevation={0}
              onMouseEnter={doMouseEnterLpi}
              onMouseLeave={doMouseLeaveLpi}
              sx={settingsCardStyle(editLpi)}
            >
              <CardHeader
                action={
                  editLpi && (
                    <Tooltip title="Edit LPI settings" placement="bottom" sx={tooltipStyle}>
                      <IconButton onClick={doEditLpi} sx={{ pr: "16px", pb: "16px" }}>
                        <EditIcon sx={ActionIconStyle(true)} />
                      </IconButton>
                    </Tooltip>
                  )
                }
                title="LPI settings"
                titleTypographyProps={{
                  sx: getTitleStyle(editLpi),
                }}
                sx={{ height: "66px" }}
              />
              <CardActionArea onClick={doEditLpi}>
                <CardContent sx={settingsCardContentStyle("property")}>
                  <Grid container rowSpacing={1}>
                    <Grid item xs={3}>
                      <Typography variant="body2">Status</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {getLpiStatus(lpiStatus, settingsContext.isScottish)}
                      </Typography>
                    </Grid>
                    {settingsContext.isScottish && (
                      <>
                        <Grid item xs={3}>
                          <Typography variant="body2">Sub locality</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {StringToTitleCase(
                              getLpiSubLocality(lpiSubLocality, lookupContext.currentLookups.subLocalities)
                            )}
                          </Typography>
                        </Grid>
                      </>
                    )}
                    <Grid item xs={3}>
                      <Typography variant="body2">Post town</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {StringToTitleCase(getLpiPostTown(lpiPostTown, lookupContext.currentLookups.postTowns))}
                      </Typography>
                    </Grid>
                    {!settingsContext.isScottish && (
                      <>
                        <Grid item xs={3}>
                          <Typography variant="body2">Level</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {lpiLevel}
                          </Typography>
                        </Grid>
                      </>
                    )}
                    <Grid item xs={3}>
                      <Typography variant="body2">Official address</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {getLpiOfficialAddress(lpiOfficialAddress, settingsContext.isScottish)}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="body2">Postal address</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {getLpiPostalAddress(lpiPostalAddress, settingsContext.isScottish)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          {/* Classification */}
          {settingsContext.isScottish && (
            <Grid item xs={6}>
              <Card
                variant="outlined"
                elevation={0}
                onMouseEnter={doMouseEnterClassification}
                onMouseLeave={doMouseLeaveClassification}
                sx={settingsCardStyle(editClassification)}
              >
                <CardHeader
                  action={
                    editClassification && (
                      <Tooltip title="Edit Classification settings" placement="bottom" sx={tooltipStyle}>
                        <IconButton onClick={doEditClassification} sx={{ pr: "16px", pb: "16px" }}>
                          <EditIcon sx={ActionIconStyle(true)} />
                        </IconButton>
                      </Tooltip>
                    )
                  }
                  title="Classification settings"
                  titleTypographyProps={{
                    sx: getTitleStyle(editClassification),
                  }}
                  sx={{ height: "66px" }}
                />
                <CardActionArea onClick={doEditClassification}>
                  <CardContent sx={settingsCardContentStyle("property")}>
                    <Grid container rowSpacing={1}>
                      <Grid item xs={3}>
                        <Typography variant="body2">Classification</Typography>
                      </Grid>
                      <Grid item xs={9}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {getBlpuClassification(blpuClassification, settingsContext.isScottish)}
                        </Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="body2">Scheme</Typography>
                      </Grid>
                      <Grid item xs={9}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {classificationScheme}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          )}
          {/* Other */}
          <Grid item xs={6}>
            <Card
              variant="outlined"
              elevation={0}
              onMouseEnter={doMouseEnterOther}
              onMouseLeave={doMouseLeaveOther}
              sx={settingsCardStyle(editOther)}
            >
              <CardHeader
                action={
                  editOther && (
                    <Tooltip title="Edit Other settings" placement="bottom" sx={tooltipStyle}>
                      <IconButton onClick={doEditOther} sx={{ pr: "16px", pb: "16px" }}>
                        <EditIcon sx={ActionIconStyle(true)} />
                      </IconButton>
                    </Tooltip>
                  )
                }
                title="Other settings"
                titleTypographyProps={{
                  sx: getTitleStyle(editOther),
                }}
                sx={{ height: "66px" }}
              />
              <CardActionArea onClick={doEditOther}>
                <CardContent sx={settingsCardContentStyle("property")}>
                  <Grid container rowSpacing={1}>
                    <Grid item xs={3}>
                      <Typography variant="body2">Cross ref source</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {getOtherCrossRefSource(otherCrossRefSource, lookupContext.currentLookups.appCrossRefs)}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="body2">Provenance</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {getOtherProvenance(otherProvenance, settingsContext.isScottish)}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="body2">Note</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
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

export default EditPropertyTemplateTab;
