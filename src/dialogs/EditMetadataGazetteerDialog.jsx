//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Edit metadata gazetteer dialog
//
//  Copyright:    © 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//region Version 1.0.0.0
//    001            Sean Flook                  Initial Revision.
//    002   06.10.23 Sean Flook                  Use colour variables.
//    003   24.11.23 Sean Flook                  Moved Box and Stack to @mui/system.
//    004   05.01.24 Sean Flook                  Use CSS shortcuts.
//    005   10.01.24 Sean Flook                  Fix warnings.
//    006   11.01.24 Sean Flook                  Fix warnings.
//    007   24.01.24 Joel Benford                Update names
//    008   31.01.24 Joel Benford                Changes to as save and support OS
//    009   27.02.24 Sean Flook            MUL15 Fixed dialog title styling.
//    010   27.03.24 Sean Flook                  Added ADSDialogTitle.
//    011   02.07.24 Joel Benford      IMANN-663 Label "Data" -> "Linked data"
//endregion Version 1.0.0.0
//region Version 1.0.5.0
//    012   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//endregion header

import React, { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";

import SettingsContext from "../context/settingsContext";

import { Dialog, DialogActions, DialogContent, Grid2, Button } from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSTextControl from "../components/ADSTextControl";
import ADSSelectControl from "../components/ADSSelectControl";
import ADSDialogTitle from "../components/ADSDialogTitle";

import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";

import { blueButtonStyle, whiteButtonStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

EditMetadataGazetteerDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  data: PropTypes.object.isRequired,
  variant: PropTypes.oneOf(["street", "asd", "property"]).isRequired,
  onDone: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

function EditMetadataGazetteerDialog({ isOpen, data, variant, onDone, onClose }) {
  const theme = useTheme();

  const settingsContext = useContext(SettingsContext);

  const [showDialog, setShowDialog] = useState(false);

  const [gazName, setGazName] = useState(null);
  const [gazScope, setGazScope] = useState(null);
  const [terOfUse, setTerOfUse] = useState(null);
  const [linkedData, setLinkedData] = useState(null);
  const [gazOwner, setGazOwner] = useState(null);
  const [ngazFreq, setNgazFrequency] = useState(null);

  const frequencyData = [
    { id: "D", text: "Daily" },
    { id: "W", text: "Weekly" },
    { id: "F", text: "Fortnightly" },
    { id: "M", text: "Monthly" },
  ];

  /**
   * Method to get the updated metadata data.
   *
   * @returns {object} The current metadata data.
   */
  const getUpdatedData = () => {
    if (variant === "property") {
      return {
        gazName,
        gazScope,
        terOfUse,
        linkedData,
        gazOwner,
        ngazFreq,
      };
    } else {
      return {
        terOfUse,
        linkedData,
        ngazFreq,
      };
    }
  };

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
   * Event to handle when the gazetteer name changes.
   *
   * @param {string} newValue The new name.
   */
  const handleGazNameChangeEvent = (newValue) => {
    setGazName(newValue);
  };

  /**
   * Event to handle when the gazScope changes.
   *
   * @param {string} newValue The new scope.
   */
  const handleGazScopeChangeEvent = (newValue) => {
    setGazScope(newValue);
  };

  /**
   * Event to handle when the territory changes.
   *
   * @param {string} newValue The new territory.
   */
  const handleTerOfUseChangeEvent = (newValue) => {
    setTerOfUse(newValue);
  };

  /**
   * Event to handle when the data changes.
   *
   * @param {string} newValue The new data.
   */
  const handleLinkedDataChangeEvent = (newValue) => {
    setLinkedData(newValue);
  };

  /**
   * Event to handle when the gazOwner changes.
   *
   * @param {string} newValue The new gazOwner.
   */
  const handleGazOwnerChangeEvent = (newValue) => {
    setGazOwner(newValue);
  };

  /**
   * Event to handle when the ngazFreq changes.
   *
   * @param {string} newValue The new ngazFreq.
   */
  const handleFrequencyChangeEvent = (newValue) => {
    setNgazFrequency(newValue);
  };

  /**
   * Method to get the dialog title.
   *
   * @returns {string} The title.
   */
  const getTitle = () => {
    switch (variant) {
      case "street":
        return "Edit street gazetteer metadata";

      case "asd":
        return "Edit ASD gazetteer metadata";

      case "property":
        return settingsContext.isScottish ? "Edit gazetteer metadata" : "Edit property gazetteer metadata";

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
        return "Name of the gazetteer. For example, LLPG for Camden.";

      case "scope":
        return "Description of the content of the gazetteer. For example, all basic property units with some land parcels.";

      case "territory":
        return "Geographic domain of the gazetteer.";

      case "data":
        switch (variant) {
          case "street":
            return "List of application dataset used to update the LSG.";

          case "asd":
            return "List of application dataset used to update the ASD.";

          case "property":
            return "List of application dataset used to update the LLPG.";

          default:
            return "";
        }

      case "owner":
        return "The organisation with overall responsibility for the gazetteer. This is the DCA Participating Authority for LLPG.";

      case "frequency":
        switch (variant) {
          case "street":
            return "Frequency with which LSG is maintained and sent to the NSG Custodian.";

          case "asd":
            return "Frequency with which LSG is maintained and sent to the NSG Custodian.";

          case "property":
            return "Frequency with which LLPG is maintained and sent to GeoPlace.";

          default:
            return "";
        }

      default:
        return "";
    }
  };

  useEffect(() => {
    if (data) {
      if (variant === "property") {
        setGazName(data.gazName);
        setGazScope(data.gazScope);
        setTerOfUse(data.terOfUse);
        setLinkedData(data.linkedData);
        setGazOwner(data.gazOwner);
        setNgazFrequency(data.ngazFreq);
      } else {
        setGazName(null);
        setGazScope(null);
        setTerOfUse(data.terOfUse);
        setLinkedData(data.linkedData);
        setGazOwner(null);
        setNgazFrequency(data.ngazFreq);
      }
    }

    setShowDialog(isOpen);
  }, [variant, data, isOpen]);

  return (
    <div>
      <Dialog
        open={showDialog}
        aria-labelledby="edit-metadata-gazetteer-dialog"
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
                  {variant === "property" && (
                    <ADSTextControl
                      label="Name"
                      isEditable
                      maxLength={60}
                      isRequired
                      value={gazName}
                      id="metadata_name"
                      helperText={getHelperText("name")}
                      onChange={handleGazNameChangeEvent}
                    />
                  )}
                  {variant === "property" && (
                    <ADSTextControl
                      label="Scope"
                      isEditable
                      maxLength={60}
                      isRequired
                      value={gazScope}
                      id="metadata_scope"
                      helperText={getHelperText("scope")}
                      onChange={handleGazScopeChangeEvent}
                    />
                  )}
                  <ADSTextControl
                    label="Territory"
                    isEditable
                    maxLength={60}
                    isRequired
                    value={terOfUse}
                    id="metadata_territory"
                    helperText={getHelperText("territory")}
                    onChange={handleTerOfUseChangeEvent}
                  />
                  {!settingsContext.isScottish && (
                    <>
                      <ADSTextControl
                        label="Linked data"
                        isEditable
                        maxLength={100}
                        value={linkedData}
                        id="metadata_data"
                        helperText={getHelperText("data")}
                        onChange={handleLinkedDataChangeEvent}
                      />
                    </>
                  )}
                  {variant === "property" && (
                    <ADSTextControl
                      label="Owner"
                      isEditable
                      maxLength={60}
                      isRequired
                      value={gazOwner}
                      id="metadata_owner"
                      helperText={getHelperText("owner")}
                      onChange={handleGazOwnerChangeEvent}
                    />
                  )}
                  {!settingsContext.isScottish && (
                    <>
                      <ADSSelectControl
                        label="Frequency"
                        isEditable
                        isRequired
                        useRounded
                        lookupData={frequencyData}
                        lookupId="id"
                        lookupLabel="text"
                        value={ngazFreq}
                        helperText={getHelperText("frequency")}
                        onChange={handleFrequencyChangeEvent}
                      />
                    </>
                  )}
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

export default EditMetadataGazetteerDialog;
