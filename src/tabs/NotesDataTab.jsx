/* #region header */
/**************************************************************************************************
//
//  Description: Notes data tab
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
//    002   24.07.23 Sean Flook                 Added ability to delete the note.
//    003   10.08.23 Sean Flook                 Added last user field.
//    004   27.10.23 Sean Flook                 Use new dataFormStyle.
//    005   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system.
//    006   05.01.24 Sean Flook                 Changes to sort out warnings and use CSS shortcuts.
//    007   11.01.24 Sean Flook                 Fix warnings.
//    008   16.01.24 Sean Flook                 Changes required to fix warnings.
//    009   26.01.24 Sean Flook       IMANN-257 Fix handleCloseDeleteConfirmation.
//    010   07.03.24 Sean Flook       IMANN-348 Changes required to ensure the OK button is correctly enabled and removed redundant code.
//    011   11.03.24 Sean Flook           GLB12 Adjusted height to remove gap.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useRef, useEffect, Fragment } from "react";
import PropTypes from "prop-types";
import ObjectComparison, { noteKeysToIgnore } from "./../utils/ObjectComparison";
import SandboxContext from "../context/sandboxContext";
import UserContext from "./../context/userContext";
import { Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSActionButton from "../components/ADSActionButton";
import ADSOkCancelControl from "../components/ADSOkCancelControl";
import ADSTextControl from "../components/ADSTextControl";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";
import ErrorIcon from "@mui/icons-material/Error";
import { useTheme } from "@mui/styles";
import { toolbarStyle, dataFormStyle, errorIconStyle } from "../utils/ADSStyles";

NotesDataTab.propTypes = {
  data: PropTypes.object,
  errors: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  focusedField: PropTypes.string,
  onDelete: PropTypes.func.isRequired,
  onHomeClick: PropTypes.func.isRequired,
};

function NotesDataTab({ data, errors, loading, focusedField, onDelete, onHomeClick }) {
  const theme = useTheme();

  const sandboxContext = useContext(SandboxContext);
  const userContext = useContext(UserContext);

  const [dataChanged, setDataChanged] = useState(false);
  const currentId = useRef(0);

  const [note, setNote] = useState("");

  const [userCanEdit, setUserCanEdit] = useState(false);

  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);

  const [noteError, setNoteError] = useState(null);

  /**
   * Method used to update the current sandbox record.
   *
   * @param {string} field The name of the field that is being updated.
   * @param {string|null} newValue The value used to update the given field.
   */
  const UpdateSandbox = (field, newValue) => {
    const newNote = GetCurrentData(field, newValue);
    sandboxContext.onSandboxChange(data.variant === "street" ? "streetNote" : "propertyNote", newNote);
  };

  /**
   * Event to handle when the note is changed.
   *
   * @param {string|null} newValue The new note.
   */
  const handleNoteChangeEvent = (newValue) => {
    setNote(newValue);
    UpdateSandbox("note", newValue);
  };

  /**
   * Event to handle when the home button is clicked.
   */
  const handleHomeClick = () => {
    const sourceNote =
      data.variant === "street"
        ? data.id > 0 && sandboxContext.currentSandbox.sourceStreet
          ? sandboxContext.currentSandbox.sourceStreet.streetNotes.find((x) => x.pkId === data.pkId)
          : null
        : data.id > 0 && sandboxContext.currentSandbox.sourceProperty
        ? sandboxContext.currentSandbox.sourceProperty.blpuNotes.find((x) => x.pkId === data.pkId)
        : null;

    if (onHomeClick)
      onHomeClick(
        dataChanged
          ? (data.variant === "street" && sandboxContext.currentSandbox.currentStreetRecords.note) ||
            (data.variant === "property" && sandboxContext.currentSandbox.currentPropertyRecords.note)
            ? "check"
            : "discard"
          : "discard",
        sourceNote,
        data.variant === "property"
          ? sandboxContext.currentSandbox.currentPropertyRecords.note
          : sandboxContext.currentSandbox.currentStreetRecords.note
      );
  };

  /**
   * Event to handle when the delete note button is clicked.
   */
  const handleDeleteClick = () => {
    setOpenDeleteConfirmation(true);
  };

  /**
   * Event to handle when the delete confirmation dialog is closed.
   *
   * @param {boolean} deleteConfirmed True if the user has confirmed the deletion; otherwise false.
   */
  const handleCloseDeleteConfirmation = (deleteConfirmed) => {
    setOpenDeleteConfirmation(false);
    const id = data && data.pkId ? data.pkId : -1;

    if (deleteConfirmed && id && id !== 0) {
      if (id > 0) {
        const currentData = GetCurrentData("changeType", "D");
        if (onHomeClick) onHomeClick("save", null, currentData);
      } else {
        if (dataChanged) {
          if (data && data.noteData) {
            setNote(data.noteData.note);
          }
        }
        if (onHomeClick) onHomeClick("discard", data.noteData, null);
      }
      if (onDelete) onDelete(id);
    }
  };

  /**
   * Event to handle when the OK button is clicked.
   */
  const handleOkClicked = () => {
    if (onHomeClick)
      onHomeClick(
        "save",
        null,
        data.variant === "property"
          ? sandboxContext.currentSandbox.currentPropertyRecords.note
          : sandboxContext.currentSandbox.currentStreetRecords.note
      );
  };

  /**
   * Event to handle when the Cancel button is clicked.
   */
  const handleCancelClicked = () => {
    if (dataChanged) {
      if (data && data.noteData) {
        setNote(data.noteData.note);
      }
    }
    if (onHomeClick) onHomeClick("discard", data.noteData, null);
  };

  /**
   * Method to return the current note record.
   *
   * @param {string} field The name of the field that is being updated.
   * @param {string|null} newValue The value used to update the given field.
   * @returns {object} The current interest record.
   */
  function GetCurrentData(field, newValue) {
    if (data.variant === "street") {
      if (dataChanged)
        return {
          pkId: data.noteData.pkId,
          seqNo: data.noteData.seqNo,
          usrn: data.noteData.usrn,
          note: field && field === "note" ? newValue : note,
          changeType: field && field === "changeType" ? newValue : data.noteData.pkId < 0 ? "I" : "U",
          lastUser: userContext ? userContext.currentUser.auditName : data.lastUser,
        };
      else
        return {
          pkId: data.noteData.pkId,
          seqNo: data.noteData.seqNo,
          usrn: data.noteData.usrn,
          note: data.noteData.note,
          changeType: field && field === "changeType" ? newValue : data.noteData.changeType,
          lastUser: userContext ? userContext.currentUser.auditName : data.lastUser,
        };
    } else {
      if (dataChanged)
        return {
          pkId: data.noteData.pkId,
          seqNo: data.noteData.seqNo,
          uprn: data.noteData.uprn,
          note: field && field === "note" ? newValue : note,
          changeType: field && field === "changeType" ? newValue : data.noteData.pkId < 0 ? "I" : "U",
          lastUser: userContext ? userContext.currentUser.auditName : data.lastUser,
        };
      else
        return {
          pkId: data.noteData.pkId,
          seqNo: data.noteData.seqNo,
          uprn: data.noteData.uprn,
          note: data.noteData.note,
          changeType: field && field === "changeType" ? newValue : data.noteData.changeType,
          lastUser: userContext ? userContext.currentUser.auditName : data.lastUser,
        };
    }
  }

  useEffect(() => {
    if (!loading && data && data.noteData) {
      setNote(data.noteData.note ? data.noteData.note : "");
    }
  }, [loading, data]);

  useEffect(() => {
    const currentNote =
      data.variant === "street"
        ? sandboxContext.currentSandbox.currentStreetRecords.note
        : sandboxContext.currentSandbox.currentPropertyRecords.note;

    if (
      currentNote &&
      ((data.variant === "street" && sandboxContext.currentSandbox.sourceStreet) ||
        (data.variant === "property" && sandboxContext.currentSandbox.sourceProperty))
    ) {
      const sourceNote =
        data.variant === "street"
          ? sandboxContext.currentSandbox.sourceStreet.streetNotes.find((x) => x.pkId === currentNote.pkId)
          : sandboxContext.currentSandbox.sourceProperty.blpuNotes.find((x) => x.pkId === currentNote.pkId);

      if (sourceNote) {
        setDataChanged(!ObjectComparison(sourceNote, currentNote, noteKeysToIgnore));
      } else if (currentNote.pkId < 0) setDataChanged(true);
    }
  }, [
    data.variant,
    sandboxContext.currentSandbox.currentPropertyRecords.note,
    sandboxContext.currentSandbox.currentStreetRecords.note,
    sandboxContext.currentSandbox.sourceStreet,
    sandboxContext.currentSandbox.sourceProperty,
  ]);

  useEffect(() => {
    if (
      data &&
      data.pkId < 0 &&
      ((data.variant === "street" && !sandboxContext.currentSandbox.currentStreetRecords.note) ||
        (data.variant === "property" && !sandboxContext.currentSandbox.currentPropertyRecords.note)) &&
      currentId.current !== data.pkId
    ) {
      sandboxContext.onSandboxChange(data.variant === "street" ? "streetNote" : "propertyNote", data.noteData);
      currentId.current = data.pkId;
    }
  }, [
    data,
    sandboxContext,
    sandboxContext.currentSandbox.currentStreetRecords.note,
    sandboxContext.currentSandbox.currentPropertyRecords.note,
  ]);

  useEffect(() => {
    setUserCanEdit(userContext.currentUser && userContext.currentUser.canEdit);
  }, [userContext]);

  useEffect(() => {
    setNoteError(null);

    if (errors && errors.length > 0) {
      for (const error of errors) {
        switch (error.field) {
          case "Note":
            setNoteError(error.errors);
            break;

          default:
            break;
        }
      }
    }
  }, [errors]);

  return (
    <Fragment>
      <Box sx={toolbarStyle}>
        <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
            <ADSActionButton variant="home" tooltipTitle="Home" tooltipPlacement="bottom" onClick={handleHomeClick} />
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
              {`| ${data.pkId === 0 ? "New note" : "Edit note"}`}
            </Typography>
            {errors && errors.length > 0 && <ErrorIcon sx={errorIconStyle} />}
          </Stack>
          <ADSActionButton
            variant="delete"
            disabled={!userCanEdit}
            tooltipTitle="Delete"
            tooltipPlacement="right"
            onClick={handleDeleteClick}
          />
        </Stack>
      </Box>
      <Box sx={dataFormStyle("79.9vh")}>
        <ADSTextControl
          isEditable={userCanEdit}
          loading={loading}
          value={note}
          id="ads_text_textfield_note"
          maxLength={data.variant === "street" ? 100 : 4000}
          minLines={2}
          maxLines={data.variant === "street" ? 4 : 10}
          errorText={noteError}
          onChange={handleNoteChangeEvent}
        />
        <ADSOkCancelControl
          okLabel={data.pkId === 0 ? "Add" : "Ok"}
          okDisabled={data.pkId !== 0 && !dataChanged}
          indented={false}
          onOkClicked={handleOkClicked}
          onCancelClicked={handleCancelClicked}
        />
      </Box>
      <div>
        <ConfirmDeleteDialog
          variant={data.variant === "street" ? "street note" : "property note"}
          open={openDeleteConfirmation}
          onClose={handleCloseDeleteConfirmation}
        />
      </div>
    </Fragment>
  );
}

export default NotesDataTab;
