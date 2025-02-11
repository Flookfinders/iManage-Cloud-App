//#region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Edit metadata custodian dialog
//
//  Copyright:    © 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//#region Version 1.0.0.0
//    001            Sean Flook                  Initial Revision.
//    002   06.10.23 Sean Flook                  Use colour variables.
//    003   24.11.23 Sean Flook                  Moved Box and Stack to @mui/system.
//    004   05.01.24 Sean Flook                  Use CSS shortcuts.
//    005   10.01.24 Sean Flook                  Fix warnings.
//    006   11.01.24 Sean Flook                  Fix warnings.
//    007   31.01.24 Joel Benford                Changes to as save and support OS
//    008   27.02.24 Sean Flook            MUL15 Fixed dialog title styling.
//    009   27.03.24 Sean Flook                  Added ADSDialogTitle.
//#endregion Version 1.0.0.0
//#region Version 1.0.5.0
//    010   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//#endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//#endregion header

import React, { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";

import { Dialog, DialogActions, DialogContent, Grid2, Button } from "@mui/material";
import { Box, Stack } from "@mui/system";
import SettingsContext from "../context/settingsContext";
import ADSTextControl from "../components/ADSTextControl";
import ADSNumberControl from "../components/ADSNumberControl";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSDialogTitle from "../components/ADSDialogTitle";

import DETRCodes from "../data/DETRCodes";

import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";

import { blueButtonStyle, whiteButtonStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

EditMetadataCustodianDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  data: PropTypes.object.isRequired,
  variant: PropTypes.oneOf(["street", "asd", "property"]).isRequired,
  onDone: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

function EditMetadataCustodianDialog({ isOpen, data, variant, onDone, onClose }) {
  const theme = useTheme();

  const settingsContext = useContext(SettingsContext);
  const [showDialog, setShowDialog] = useState(false);

  const [custodianName, setCustodianName] = useState(null);
  const [custodianUprn, setCustodianUprn] = useState(null);
  const [custodianCode, setCustodianCode] = useState(null);

  const custodianCodes = DETRCodes.map(function (x) {
    return { id: x.id, text: `${x.id} - ${x.text}` };
  });

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
      custodianName,
      custodianUprn: settingsContext.isScottish ? undefined : custodianUprn,
      custodianCode,
    };
  };

  /**
   * Event to handle when the name changes.
   *
   * @param {string} newValue The new name.
   */
  const handleCustodianNameChangeEvent = (newValue) => {
    setCustodianName(newValue);
  };

  /**
   * Event to handle when the UPRN changes.
   *
   * @param {number} newValue The new UPRN.
   */
  const handleCustodianUprnChangeEvent = (newValue) => {
    setCustodianUprn(newValue);
  };

  /**
   * Event to handle when the code changes.
   *
   * @param {number} newValue The new code.
   */
  const handleCustodianCodeChangeEvent = (newValue) => {
    setCustodianCode(newValue);
  };

  /**
   * Method to get the dialog title.
   *
   * @returns {string} The title.
   */
  const getTitle = () => {
    switch (variant) {
      case "street":
        return "Edit street custodian metadata";

      case "asd":
        return "Edit ASD custodian metadata";

      case "property":
        return settingsContext.isScottish ? "Edit gazetteer custodian metadata" : "Edit property custodian metadata";

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
      case "name":
        switch (variant) {
          case "street":
            return "Organisation or department/function responsible for the compilation and maintenance of the data in the gazetteer that is a DCA Participating Authority.";

          case "asd":
            return "Organisation or department/function responsible for the compilation and maintenance of the data that is a DCA Participating Authority or a National/Regional Highway Authority.";

          case "property":
            return "Organisation or department responsible for the compilation and maintenance of the data in the gazetteer that is the DCA Participating Authority.";

          default:
            return "";
        }

      case "uprn":
        switch (variant) {
          case "street":
            return "UPRN of Authority Street Custodian location.";

          case "asd":
            return "UPRN of Authority Street Custodian location.";

          case "property":
            return "UPRN of Authority Address Custodian location.";

          default:
            return "";
        }

      case "code":
        switch (variant) {
          case "street":
            return "Issued by NSG Custodian.";

          case "asd":
            return "Issued by NSG Custodian.";

          case "property":
            return "Issued by GeoPlace.";

          default:
            return "";
        }

      default:
        return "";
    }
  };

  useEffect(() => {
    if (data) {
      setCustodianName(data.custodianName);
      setCustodianUprn(data.custodianUprn);
      setCustodianCode(data.custodianCode);
    }

    setShowDialog(isOpen);
  }, [data, isOpen]);

  return (
    <div>
      <Dialog
        open={showDialog}
        aria-labelledby="edit-metadata-custodian-dialog"
        fullWidth
        maxWidth="md"
        onClose={handleDialogClose}
      >
        <ADSDialogTitle title={getTitle()} closeTooltip="Cancel" onClose={handleCancelClick} />
        <DialogContent sx={{ mt: theme.spacing(2) }}>
          <Grid2 container justifyContent="flex-start" spacing={0} sx={{ pl: theme.spacing(3.5) }}>
            <Grid2 size={12}>
              <Stack direction="column" spacing={2}>
                <Box>
                  <ADSTextControl
                    label="Name"
                    isEditable
                    maxLength={40}
                    isRequired
                    value={custodianName}
                    id="metadata_name"
                    helperText={getHelperText("name")}
                    onChange={handleCustodianNameChangeEvent}
                  />
                  {!settingsContext.isScottish && (
                    <ADSNumberControl
                      label="UPRN"
                      isEditable
                      isRequired
                      maximum={999999999999}
                      value={custodianUprn}
                      helperText={getHelperText("uprn")}
                      onChange={handleCustodianUprnChangeEvent}
                    />
                  )}
                  <ADSSelectControl
                    label="Code"
                    isEditable
                    isRequired
                    useRounded
                    lookupData={custodianCodes}
                    lookupId="id"
                    lookupLabel="text"
                    value={custodianCode}
                    helperText={getHelperText("code")}
                    onChange={handleCustodianCodeChangeEvent}
                  />
                </Box>
              </Stack>
            </Grid2>
          </Grid2>
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

export default EditMetadataCustodianDialog;
