/* #region header */
/**************************************************************************************************
//
//  Description: Edit metadata miscellaneous dialog
//
//  Copyright:    � 2021 - 2023 Idox Software Limited.
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
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import SettingsContext from "../context/settingsContext";

import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Grid, Typography, Button } from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSTextControl from "../components/ADSTextControl";
import ADSDateControl from "../components/ADSDateControl";
import ADSSelectControl from "../components/ADSSelectControl";

import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";

import { adsBlueA } from "../utils/ADSColours";
import { blueButtonStyle, whiteButtonStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

EditMetadataMiscellaneousDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  data: PropTypes.object.isRequired,
  variant: PropTypes.oneOf(["street", "asd", "property"]).isRequired,
  onDone: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

function EditMetadataMiscellaneousDialog({ isOpen, data, variant, onDone, onClose }) {
  const theme = useTheme();

  const settingsContext = useContext(SettingsContext);

  const [showDialog, setShowDialog] = useState(false);

  const [scheme, setScheme] = useState(null);
  const [metadataDate, setMetadataDate] = useState(null);
  const [language, setLanguage] = useState(null);

  const languageData =
    variant === "property"
      ? settingsContext.isWelsh
        ? [
            { id: "BIL", text: "Bilingual" },
            { id: "ENG", text: "English" },
          ]
        : [{ id: "ENG", text: "English" }]
      : settingsContext.isWelsh
      ? [
          { id: "BIL", text: "Bilingual" },
          { id: "CYM", text: "Welsh" },
          { id: "ENG", text: "English" },
        ]
      : [{ id: "ENG", text: "English" }];

  /**
   * Event to handle when the done button is clicked.
   */
  const handleDoneClick = () => {
    if (onDone) onDone(getUpdatedData());
  };

  /**
   * Event to handle when the cancel button is clicked.
   */
  const handleCancelClick = () => {
    if (onClose) onClose();
    else setShowDialog(false);
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
   * Method to get the updated metadata data.
   *
   * @returns {object} The current metadata data.
   */
  const getUpdatedData = () => {
    return {
      scheme: scheme,
      metadataDate: metadataDate,
      language: language,
    };
  };

  /**
   * Event to handle when the scheme changes.
   *
   * @param {string} newValue The new scheme.
   */
  const handleSchemeChangeEvent = (newValue) => {
    setScheme(newValue);
  };

  /**
   * Event to handle when the date changes.
   *
   * @param {Date} newValue The new date.
   */
  const handleDateChangeEvent = (newValue) => {
    setMetadataDate(newValue);
  };

  /**
   * Event to handle when the language changes.
   *
   * @param {string} newValue The new language.
   */
  const handleLanguageChangeEvent = (newValue) => {
    setLanguage(newValue);
  };

  /**
   * Method to get the dialog title.
   *
   * @returns {string} The title.
   */
  const getTitle = () => {
    switch (variant) {
      case "street":
        return "Edit street miscellaneous metadata";

      case "asd":
        return "Edit ASD miscellaneous metadata";

      case "property":
        return "Edit property miscellaneous metadata";

      default:
        return "";
    }
  };

  /**
   * Method to get the helper text for the controls.
   *
   * @param {string} control The control we need to helper text for.
   * @returns {string} The helper text for the control.
   */
  const getHelperText = (control) => {
    switch (control) {
      case "scheme":
        switch (variant) {
          case "street":
            return "Classification scheme used for all multiple value specified Fields for example DEC-NSG v8.1.";

          case "asd":
            return "Classification scheme used for all multiple value specified Fields.";

          case "property":
            return "Classification scheme used for all multiple value specified Fields for example GeoPlace DEC-Addresses v3.4.";

          default:
            return "";
        }

      case "date":
        switch (variant) {
          case "street":
            return "Date at which the gazetteer can be considered to be current.";

          case "asd":
            return "Date at which the gazetteer can be considered to be current.";

          case "property":
            return "Date metadata was last updated.";

          default:
            return "";
        }

      case "language":
        switch (variant) {
          case "street":
            return "Language(s) used for descriptors within the gazetteer.";

          case "asd":
            return "Language(s) used for descriptors within the ASD.";

          case "property":
            return "Language(s) used for descriptors within the gazetteer.";

          default:
            return "";
        }

      default:
        return "";
    }
  };

  useEffect(() => {
    if (data) {
      setScheme(data.scheme);
      setMetadataDate(data.metadataDate);
      setLanguage(data.language);
    }

    setShowDialog(isOpen);
  }, [data, isOpen]);

  return (
    <div>
      <Dialog
        open={showDialog}
        aria-labelledby="edit-metadata-miscellaneous-dialog"
        fullWidth
        maxWidth="md"
        onClose={handleDialogClose}
      >
        <DialogTitle
          id="edit-metadata-miscellaneous-dialog"
          sx={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: adsBlueA }}
        >
          <Typography variant="h6">{getTitle()}</Typography>
          <IconButton
            aria-label="close"
            onClick={handleCancelClick}
            sx={{ position: "absolute", right: 12, top: 12, color: (theme) => theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ marginTop: theme.spacing(2) }}>
          <Grid container justifyContent="flex-start" spacing={0} sx={{ paddingLeft: theme.spacing(3.5) }}>
            <Grid item xs={12}>
              <Stack direction="column" spacing={2}>
                <Box>
                  <ADSTextControl
                    label="Classification scheme"
                    isEditable
                    maxLength={40}
                    isRequired
                    value={scheme}
                    id={"metadata_scheme"}
                    helperText={getHelperText("scheme")}
                    onChange={handleSchemeChangeEvent}
                  />
                  <ADSDateControl
                    label="Metadata date"
                    isEditable
                    isRequired
                    value={metadataDate}
                    helperText={getHelperText("date")}
                    onChange={handleDateChangeEvent}
                  />
                  <ADSSelectControl
                    label="Language"
                    isEditable
                    isRequired
                    useRounded
                    lookupData={languageData}
                    lookupId="id"
                    lookupLabel="text"
                    value={language}
                    helperText={getHelperText("language")}
                    onChange={handleLanguageChangeEvent}
                  />
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "flex-start", mb: theme.spacing(1), ml: theme.spacing(3) }}>
          <Button onClick={handleDoneClick} autoFocus variant="contained" sx={blueButtonStyle} startIcon={<DoneIcon />}>
            Done
          </Button>
          <Button onClick={handleCancelClick} variant="contained" sx={whiteButtonStyle} startIcon={<CloseIcon />}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default EditMetadataMiscellaneousDialog;
