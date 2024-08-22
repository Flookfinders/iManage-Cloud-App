/* #region header */
/**************************************************************************************************
//
//  Description: Add template dialog
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
//    002   06.10.23 Sean Flook                 Use colour variables.
//    003   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system.
//    004   16.01.24 Joel Benford               OS/GP level split
//    005   16.01.24 Sean Flook                 Changes required to fix warnings.
//    006   27.02.24 Sean Flook           MUL15 Fixed dialog title styling.
//    007   27.03.24 Sean Flook                 Added ADSDialogTitle.
//    008   30.04.24 Sean Flook       IMANN-418 Corrected logic.
//    009   18.07.24 Sean Flook       IMANN-571 Corrected bug.
//    010   26.07.24 Sean Flook       IMANN-867 Pass the id into getData when using an existing template.
//    011   22.08.24 Sean Flook       IMANN-945 Correctly store the id when selecting a template and then pass into getData.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import { Dialog, DialogActions, DialogContent, Typography, Grid, Button, Autocomplete, TextField } from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSTextControl from "../components/ADSTextControl";
import ADSDialogTitle from "../components/ADSDialogTitle";

import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import DoneIcon from "@mui/icons-material/Done";

import { adsBlueA, adsMidGreyA, adsWhite } from "../utils/ADSColours";
import { blueButtonStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

AddTemplateDialog.propTypes = {
  templates: PropTypes.array.isRequired,
  duplicateId: PropTypes.number,
  isOpen: PropTypes.bool.isRequired,
  onDone: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

function AddTemplateDialog({ templates, duplicateId, isOpen, onDone, onClose }) {
  const theme = useTheme();

  const [showDialog, setShowDialog] = useState(false);
  const [step, setStep] = useState(null);
  const [templateType, setTemplateType] = useState(null);
  const [options, setOptions] = useState([]);
  const [createFromId, setCreateFromId] = useState(null);
  const [title, setTitle] = useState(null);
  const [description, setDescription] = useState(null);
  const [titleError, setTitleError] = useState(null);
  const [descriptionError, setDescriptionError] = useState(null);

  /**
   * Method to duplicate the data from an existing template.
   *
   * @param {number} pkId The id for the template to duplicate.
   * @returns {object|null} The new template data.
   */
  const getData = (pkId) => {
    const originalRec = templates.find((x) => x.templatePkId === pkId);
    if (originalRec) {
      return {
        templatePkId: -1,
        templateName: title,
        templateDescription: description,
        templateType: 3,
        templateUseType: originalRec.templateUseType,
        numberingSystem: originalRec.numberingSystem,
        blpuTemplatePkId: originalRec.blpuTemplatePkId,
        blpuLogicalStatus: originalRec.blpuLogicalStatus,
        rpc: originalRec.rpc,
        state: originalRec.state,
        classification: originalRec.classification,
        classificationScheme: originalRec.classificationScheme,
        lpiTemplatePkId: originalRec.lpiTemplatePkId,
        lpiLogicalStatus: originalRec.lpiLogicalStatus,
        postTownRef: originalRec.postTownRef,
        subLocalityRef: originalRec.subLocalityRef,
        blpuLevel: originalRec.blpuLevel,
        lpiLevel: originalRec.lpiLevel,
        officialAddressMaker: originalRec.officialAddressMaker,
        postallyAddressable: originalRec.postallyAddressable,
        miscTemplatePkId: originalRec.miscTemplatePkId,
        source: originalRec.source,
        provCode: originalRec.provCode,
        note: originalRec.note,
      };
    } else return null;
  };

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
   * Event to handle when the next button is clicked.
   */
  const handleNextClick = () => {
    setStep(step + 1);
  };

  /**
   * Event to handle when the done button is clicked.
   */
  const handleDoneClick = () => {
    let isValid = true;
    if (!title) {
      isValid = false;
      setTitleError(["Mandatory name is missing."]);
    } else setTitleError(null);

    if (!description) {
      isValid = false;
      setDescriptionError(["Mandatory description is missing."]);
    } else setDescriptionError(null);

    if (isValid) {
      const data = getData(!!duplicateId ? duplicateId : !!createFromId ? createFromId : null);
      if (onDone) onDone(data);
    }
  };

  /**
   * Event to handle when the cancel button is clicked.
   */
  const handleCancelClick = () => {
    if (onClose) onClose();
    else setShowDialog(false);
  };

  /**
   * Event to handle when the single property button is clicked.
   */
  const doSinglePropertyClick = () => {
    setTemplateType(1);
    const filteredTemplates = templates
      .filter((x) => x.numberingSystem === 1)
      .sort((a, b) => a.templatePkId - b.templatePkId);
    setOptions(
      filteredTemplates.map((x) => {
        return {
          id: x.templatePkId,
          name: x.templateName,
          description: x.templateDescription,
        };
      })
    );
    setCreateFromId(filteredTemplates[0].templatePkId);
    setTitle(`Copy of ${filteredTemplates[0].templateName}`);
    setDescription(`Copy of ${filteredTemplates[0].templateDescription}`);
  };

  /**
   * Event to handle when the range of properties button is clicked.
   */
  const doPropertyRangeClick = () => {
    setTemplateType(2);
    const filteredTemplates = templates
      .filter((x) => x.numberingSystem !== 1)
      .sort((a, b) => a.templatePkId - b.templatePkId);
    setOptions(
      filteredTemplates.map((x) => {
        return {
          id: x.templatePkId,
          name: x.templateName,
          description: x.templateDescription,
        };
      })
    );
    setCreateFromId(filteredTemplates[0].templatePkId);
    setTitle(`Copy of ${filteredTemplates[0].templateName}`);
    setDescription(`Copy of ${filteredTemplates[0].templateDescription}`);
  };

  /**
   * Event to handle when the title changes.
   *
   * @param {string} newValue The new title.
   */
  const handleTitleChangeEvent = (newValue) => {
    setTitle(newValue);
  };

  /**
   * Event to handle when the description changes.
   *
   * @param {string} newValue The new title.
   */
  const handleDescriptionChangeEvent = (newValue) => {
    setDescription(newValue);
  };

  /**
   * Method to get the dialog content styling.
   *
   * @returns {object} The styling for the dialog content.
   */
  const getDialogContentStyle = () => {
    if (step === 1) return { mt: theme.spacing(4) };
    else return { mt: theme.spacing(2) };
  };

  /**
   * Method to get the styling for the template button.
   *
   * @param {number} buttonType The type of button
   * @returns {object} The styling to be used for the template button.
   */
  const getTemplateButtonStyle = (buttonType) => {
    if (templateType && templateType === buttonType) {
      return {
        color: adsWhite,
        backgroundColor: adsBlueA,
        height: "80px",
        textTransform: "none",
        width: "100px",
      };
    } else {
      return {
        borderColor: adsMidGreyA,
        color: adsMidGreyA,
        height: "80px",
        textTransform: "none",
        width: "100px",
      };
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTemplateType(null);
      setCreateFromId(null);
      setStep(1);
      setTitle(null);
      setDescription(null);
      setTitleError(null);
      setDescriptionError(null);
    }
    setShowDialog(isOpen);
  }, [isOpen]);

  useEffect(() => {
    if (duplicateId) {
      const duplicateRec = templates.find((x) => x.templatePkId === duplicateId);

      if (duplicateRec) {
        setTitle(`Copy of ${duplicateRec.templateName}`);
        setDescription(`Copy of ${duplicateRec.templateDescription}`);
        setStep(2);
      } else setShowDialog(false);
    } else setStep(1);
  }, [templates, duplicateId]);

  return (
    <Dialog open={showDialog} aria-labelledby="add-lookup-dialog" fullWidth maxWidth="xs" onClose={handleDialogClose}>
      <ADSDialogTitle
        title={`${
          step === 1 ? "Create new template" : duplicateId ? "Duplicate template" : "New template: name and description"
        }`}
        closeTooltip="Cancel"
        onClose={handleCancelClick}
      />
      <DialogContent sx={getDialogContentStyle()}>
        <Box sx={{ height: "230px", width: "380px" }}>
          {step === 1 && (
            <Grid container columnSpacing={2} rowSpacing={3} alignItems="center">
              <Grid item xs={4} alignItems="center">
                <Typography variant="body2" align="right">
                  Type of template
                </Typography>
              </Grid>
              <Grid item xs={8} alignItems="center">
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button
                    variant={!templateType || templateType !== 1 ? "outlined" : "contained"}
                    startIcon={<HomeIcon />}
                    sx={getTemplateButtonStyle(1)}
                    onClick={doSinglePropertyClick}
                  >
                    <Typography variant="caption">Single property template</Typography>
                  </Button>
                  <Button
                    variant={!templateType || templateType !== 2 ? "outlined" : "contained"}
                    startIcon={<LocationCityIcon />}
                    sx={getTemplateButtonStyle(2)}
                    onClick={doPropertyRangeClick}
                  >
                    <Typography variant="caption">Property range template</Typography>
                  </Button>
                </Stack>
              </Grid>
              {templateType && (
                <Grid item xs={4}>
                  <Typography variant="body2" align="right" id="create-from-label">
                    Create from
                  </Typography>
                </Grid>
              )}
              {templateType && (
                <Grid item xs={8}>
                  <Autocomplete
                    id="create-from-template-list"
                    sx={{
                      color: "inherit",
                    }}
                    getOptionLabel={(option) => {
                      if (typeof option === "number") {
                        const rec = options.find((x) => x.id === option);
                        if (rec) return rec.name;
                        else return "";
                      } else return option.name;
                    }}
                    noOptionsText="No templates"
                    options={options}
                    value={createFromId}
                    onChange={(event, newValue) => {
                      if (newValue) {
                        setTitle(`Copy of ${newValue.name}`);
                        setDescription(`Copy of ${newValue.description}`);
                      } else {
                        setTitle(null);
                        setDescription(null);
                      }
                      setCreateFromId(newValue.id);
                    }}
                    autoHighlight
                    autoSelect
                    isOptionEqualToValue={(option, value) => option.id === value}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth variant="outlined" margin="dense" size="small" />
                    )}
                    aria-labelledby="create-from-label"
                  />
                </Grid>
              )}
            </Grid>
          )}
          {step === 2 && (
            <Box sx={{ mt: theme.spacing(2), ml: theme.spacing(4) }}>
              <Grid container columnSpacing={2} rowSpacing={3}>
                <ADSTextControl
                  label="Name"
                  isEditable
                  isRequired
                  displayCharactersLeft
                  value={title}
                  id="template_title"
                  maxLength={75}
                  errorText={titleError}
                  onChange={handleTitleChangeEvent}
                />
                <ADSTextControl
                  label="Description"
                  isEditable
                  isRequired
                  value={description}
                  id="template_description"
                  maxLength={200}
                  minLines={2}
                  maxLines={3}
                  errorText={descriptionError}
                  onChange={handleDescriptionChangeEvent}
                />
              </Grid>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          justifyContent: "flex-start",
          mb: theme.spacing(1),
          ml: theme.spacing(4),
        }}
      >
        {step === 1 && (
          <Button
            onClick={handleNextClick}
            autoFocus
            disabled={!templateType || !createFromId}
            variant="contained"
            sx={blueButtonStyle}
            startIcon={<NavigateNextIcon />}
          >
            Next
          </Button>
        )}
        {step === 2 && (
          <Button onClick={handleDoneClick} autoFocus variant="contained" sx={blueButtonStyle} startIcon={<DoneIcon />}>
            Done
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default AddTemplateDialog;
