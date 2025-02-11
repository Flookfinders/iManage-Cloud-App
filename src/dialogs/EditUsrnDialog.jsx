//#region header */
//--------------------------------------------------------------------------------------------------
//
//  Description: Dialog used to edit the USRN
//
//  Copyright:    © 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0
//    001   29.05.24 Sean Flook       IMANN-490 Initial version.
//    002   11.06.24 Sean Flook       IMANN-490 Changed id.
//#endregion Version 1.0.0.0
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import { Dialog, DialogActions, DialogContent, TextField, Button } from "@mui/material";

import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";

import { FormInputStyle, blueButtonStyle, whiteButtonStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";
import ADSDialogTitle from "../components/ADSDialogTitle";

EditUsrnDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  usrn: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onClose: PropTypes.func.isRequired,
};

function EditUsrnDialog({ isOpen, usrn, onClose }) {
  const theme = useTheme();

  const [showDialog, setShowDialog] = useState(false);
  const [currentUsrn, setCurrentUsrn] = useState(null);

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
   * Event to handle when the update button is clicked.
   */
  const handleUpdateClick = () => {
    if (onClose) onClose(currentUsrn);
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
   * Event to handle when the usrn changes.
   *
   * @param {object} event The event object.
   */
  const handleUsrnChangeEvent = (event) => {
    setCurrentUsrn(Number(event.target.value));
  };

  useEffect(() => {
    if (isOpen) {
      setCurrentUsrn(usrn);
    }
    setShowDialog(isOpen);
  }, [isOpen, usrn]);

  return (
    <Dialog open={showDialog} aria-labelledby="edit-usrn-dialog" fullWidth maxWidth="xs" onClose={handleDialogClose}>
      <ADSDialogTitle title={"Edit USRN"} closeTooltip="Cancel" onClose={handleCancelClick} />
      <DialogContent sx={{ mt: theme.spacing(2) }}>
        <TextField
          id={"usrn-number-control"}
          sx={FormInputStyle(false)}
          type="number"
          fullWidth
          required
          variant="outlined"
          margin="dense"
          size="small"
          value={currentUsrn}
          onChange={handleUsrnChangeEvent}
        />
      </DialogContent>
      <DialogActions sx={{ justifyContent: "flex-start", ml: theme.spacing(3), mb: theme.spacing(2) }}>
        <Button onClick={handleUpdateClick} autoFocus variant="contained" sx={blueButtonStyle} startIcon={<DoneIcon />}>
          Update
        </Button>
        <Button onClick={handleCancelClick} variant="contained" sx={whiteButtonStyle} startIcon={<CloseIcon />}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditUsrnDialog;
