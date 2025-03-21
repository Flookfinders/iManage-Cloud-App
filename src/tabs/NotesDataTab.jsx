//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Notes data tab
//
//  Copyright:    © 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//region Version 1.0.0.0
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
//    012   13.03.24 Joshua McCormick IMANN-280 Added dataTabToolBar for inner toolbar styling
//    013   18.03.24 Sean Flook           GLB12 Adjusted height to remove overflow.
//    014   19.03.24 Joshua McCormick IMANN-280 removed unneeded spacing
//    015   22.03.24 Sean Flook           GLB12 Changed to use dataFormStyle so height can be correctly set.
//    016   26.03.24 Joel Benford     IMANN-365 Changed header back/text/visibility
//    017   02.04.24 Joshua McCormick IMANN-277 Show displayCharactersLeft on note input
//    018   10.04.24 Joel Benford     IMANN-379 Enable OK button when edited
//    019   30.04.24 Sean Flook       IMANN-425 Corrected logic for enabling OK button for new records.
//    020   30.04.24 Sean Flook       IMANN-425 Corrected determine if the note has changed when creating a new note.
//    021   23.05.24 Sean Flook       IMANN-486 Changed seqNo to seqNum.
//    022   20.06.24 Sean Flook       IMANN-636 Use the new user rights.
//    023   04.07.24 Sean Flook       IMANN-705 Use displayName rather than auditName.
//endregion Version 1.0.0.0
//region Version 1.0.1.0
//    024   10.10.24 Sean Flook      IMANN-1018 Allow LLPG editors to edit streets.
//endregion Version 1.0.1.0
//region Version 1.0.5.0
//    025   14.03.25 Sean Flook      IMANN-1106 Fix the label on the OK button.
//endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//endregion header

import React, { useContext, useState, useRef, useEffect, Fragment } from "react";
import PropTypes from "prop-types";
import SandboxContext from "../context/sandboxContext";
import UserContext from "./../context/userContext";
import StreetContext from "../context/streetContext";
import PropertyContext from "../context/propertyContext";
import { Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSActionButton from "../components/ADSActionButton";
import ADSOkCancelControl from "../components/ADSOkCancelControl";
import ADSTextControl from "../components/ADSTextControl";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";
import ErrorIcon from "@mui/icons-material/Error";
import { useTheme } from "@mui/styles";
import { toolbarStyle, dataTabToolBar, dataFormStyle, errorIconStyle } from "../utils/ADSStyles";

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
  const streetContext = useContext(StreetContext);
  const propertyContext = useContext(PropertyContext);

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
   * @param {boolean} different The note is changed from before opening it (false if changed and changed back).
   */
  const UpdateSandbox = (field, newValue, different) => {
    const newNote = GetCurrentData(field, newValue, different);
    sandboxContext.onSandboxChange(data.variant === "street" ? "streetNote" : "propertyNote", newNote);
  };

  /**
   * Event to handle when the note is changed.
   *
   * @param {string|null} newValue The new note.
   */
  const handleNoteChangeEvent = (newValue) => {
    const noteBeforeOpening =
      data.variant === "street"
        ? sandboxContext.currentSandbox.sourceStreet.streetNotes.find((x) => x.pkId === data.noteData.pkId)
        : sandboxContext.currentSandbox.sourceProperty.blpuNotes.find((x) => x.pkId === data.noteData.pkId);
    const different =
      (noteBeforeOpening && noteBeforeOpening.note !== newValue) ||
      (!noteBeforeOpening && newValue && newValue.length > 0);
    setDataChanged(different);
    setNote(newValue);
    UpdateSandbox("note", newValue, different);
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
        const currentData = GetCurrentData("changeType", "D", false);
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
   * @param {boolean} different The note is changed from before opening it (false if changed and changed back).
   * @returns {object} The current interest record.
   */
  function GetCurrentData(field, newValue, different) {
    if (data.variant === "street") {
      if (different)
        return {
          pkId: data.noteData.pkId,
          seqNum: data.noteData.seqNum,
          usrn: data.noteData.usrn,
          note: field && field === "note" ? newValue : note,
          changeType: field && field === "changeType" ? newValue : data.noteData.pkId < 0 ? "I" : "U",
          lastUser: userContext ? userContext.currentUser.displayName : data.lastUser,
        };
      else
        return {
          pkId: data.noteData.pkId,
          seqNum: data.noteData.seqNum,
          usrn: data.noteData.usrn,
          note: data.noteData.note,
          changeType: field && field === "changeType" ? newValue : data.noteData.changeType,
          lastUser: userContext ? userContext.currentUser.displayName : data.lastUser,
        };
    } else {
      if (different)
        return {
          pkId: data.noteData.pkId,
          seqNum: data.noteData.seqNum,
          uprn: data.noteData.uprn,
          note: field && field === "note" ? newValue : note,
          changeType: field && field === "changeType" ? newValue : data.noteData.pkId < 0 ? "I" : "U",
          lastUser: userContext ? userContext.currentUser.displayName : data.lastUser,
        };
      else
        return {
          pkId: data.noteData.pkId,
          seqNum: data.noteData.seqNum,
          uprn: data.noteData.uprn,
          note: data.noteData.note,
          changeType: field && field === "changeType" ? newValue : data.noteData.changeType,
          lastUser: userContext ? userContext.currentUser.displayName : data.lastUser,
        };
    }
  }

  useEffect(() => {
    if (!loading && data && data.noteData) {
      setNote(data.noteData.note ? data.noteData.note : "");
    }
  }, [loading, data]);

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
    if (data.variant === "street") {
      setUserCanEdit(
        userContext.currentUser && (userContext.currentUser.editStreet || userContext.currentUser.editProperty)
      );
    } else {
      setUserCanEdit(userContext.currentUser && userContext.currentUser.editProperty);
    }
  }, [userContext, data.variant]);

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
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={dataTabToolBar}>
          <Stack direction="row" justifyContent="flex-start" alignItems="center">
            {(data.variant === "street" && streetContext.currentRecord.newRecord) ||
            (data.variant === "property" && propertyContext.currentRecord.newRecord) ? (
              <ADSActionButton
                variant="close"
                tooltipTitle="Close"
                tooltipPlacement="bottom"
                onClick={handleCancelClicked}
              />
            ) : (
              <ADSActionButton variant="home" tooltipTitle="Home" tooltipPlacement="bottom" onClick={handleHomeClick} />
            )}
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
              {`| ${
                (data.variant === "street" && streetContext.currentRecord.newRecord) ||
                (data.variant === "property" && propertyContext.currentRecord.newRecord)
                  ? "Add new note"
                  : `Note (${data.index + 1} of ${data.totalRecords})`
              }`}
            </Typography>
            {errors && errors.length > 0 && <ErrorIcon sx={errorIconStyle} />}
          </Stack>
          {!(
            (data.variant === "street" && streetContext.currentRecord.newRecord) ||
            (data.variant === "property" && propertyContext.currentRecord.newRecord)
          ) && (
            <ADSActionButton
              variant="delete"
              disabled={!userCanEdit}
              tooltipTitle="Delete"
              tooltipPlacement="right"
              onClick={handleDeleteClick}
            />
          )}
        </Stack>
      </Box>
      <Box sx={dataFormStyle(`${data.variant === "street" ? "StreetNotesDataTab" : "PropertyNotesDataTab"}`)}>
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
          displayCharactersLeft
        />
        <ADSOkCancelControl
          okLabel={"Ok"}
          okDisabled={data.pkId > 0 && !dataChanged}
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
