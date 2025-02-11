//#region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Notes list tab
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
//    002   10.08.23 Sean Flook                  Do not display the deleted records.
//    003   06.10.23 Sean Flook                  Use colour variables.
//    004   27.10.23 Sean Flook                  Use new dataFormStyle.
//    005   24.11.23 Sean Flook                  Moved Box and Stack to @mui/system and fixed a warning.
//    006   05.01.24 Sean Flook                  Changes to sort out warnings and use CSS shortcuts.
//    007   22.02.24 Joel Benford      IMANN-287 Correct blue on hover
//    008   23.02.24 Joel Benford      IMANN-287 Tweak layout since bottom padding hid hover on row below
//    009   11.03.24 Sean Flook            GLB12 Adjusted height to remove gap.
//    010   18.03.24 Sean Flook            GLB12 Adjusted height to remove overflow.
//    011   22.03.24 Sean Flook            GLB12 Changed to use dataFormStyle so height can be correctly set.
//    012   23.05.24 Sean Flook        IMANN-486 Changed seqNo to seqNum.
//    013   20.06.24 Sean Flook        IMANN-636 Use the new user rights.
//    014   04.07.24 Sean Flook        IMANN-705 Use displayName if lastUser is the same as auditName.
//#endregion Version 1.0.0.0
//#region Version 1.0.5.0
//    015   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//#endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//#endregion header

import React, { useContext, useState, useRef, useEffect, Fragment } from "react";
import PropTypes from "prop-types";
import UserContext from "../context/userContext";
import { FormatDate, FormatDateTime, GetUserAvatar, GetUserName } from "../utils/HelperUtils";
import { Typography, Grid2, Skeleton, Tooltip, IconButton, List, ListItemButton } from "@mui/material";
import { Box, Stack } from "@mui/system";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";
import {
  AddCircleOutlineOutlined as AddCircleIcon,
  Edit as EditIcon,
  DeleteOutline as DeleteIcon,
} from "@mui/icons-material";
import { adsBlueA, adsRed10, adsRed20, adsPaleBlueA, adsLightGreyA } from "../utils/ADSColours";
import { toolbarStyle, dataFormStyle, ActionIconStyle, tooltipStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

NotesListTab.propTypes = {
  data: PropTypes.array,
  errors: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  variant: PropTypes.string.isRequired,
  onNoteSelected: PropTypes.func.isRequired,
  onNoteDelete: PropTypes.func.isRequired,
};

function NotesListTab({ data, errors, loading, variant, onNoteSelected, onNoteDelete }) {
  const theme = useTheme();

  const userContext = useContext(UserContext);

  const [selectedItem, setSelectedItem] = useState(null);
  // const selectedItem = useRef(null);

  const [userCanEdit, setUserCanEdit] = useState(false);

  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const deleteNoteId = useRef(null);

  /**
   * Event to handle the adding of a new note.
   */
  const handleAddNoteClick = () => {
    if (onNoteSelected) onNoteSelected(0, null, null);
  };

  /**
   * Event to handle when the mouse enters an item.
   *
   * @param {object} event The event object.
   * @param {number} pkId The id of the record.
   */
  const handleMouseEnterRecord = (event, pkId) => {
    event.stopPropagation();
    setSelectedItem(pkId);
  };

  /**
   * Even to handle when the mouse leaves an item.
   *
   * @param {object} event The event object.
   */
  const handleMouseLeaveRecord = (event) => {
    event.stopPropagation();
    setSelectedItem(null);
  };

  /**
   * Event to handle when a note is clicked.
   *
   * @param {object} event The event object.
   * @param {object} rec The note record that was clicked.
   * @param {number} index The index of the note within the array of notes.
   */
  const handleNoteClick = (event, rec, index) => {
    event.stopPropagation();
    if (onNoteSelected) onNoteSelected(rec.pkId, rec, index);
  };

  /**
   * Event to handle the deletion of a note.
   *
   * @param {object} event The event object.
   * @param {number} pkId The id of the note record that is to be deleted.
   */
  const handleDeleteClick = (event, pkId) => {
    event.stopPropagation();
    deleteNoteId.current = pkId;
    setOpenDeleteConfirmation(true);
  };

  /**
   * Event to handle when the delete confirmation dialog closes.
   *
   * @param {boolean} deleteConfirmed True if the user has confirmed the deletion; otherwise false.
   */
  const handleCloseDeleteConfirmation = (deleteConfirmed) => {
    setOpenDeleteConfirmation(false);

    if (deleteConfirmed && onNoteDelete && deleteNoteId.current) {
      onNoteDelete(deleteNoteId.current);
      deleteNoteId.current = null;
    }
  };

  /**
   * Method to return the date box style for a given record.
   *
   * @param {number} pkId The id for the note we are getting the style for.
   * @returns {object} The date box styling.
   */
  const getDateBoxStyle = (pkId) => {
    if (selectedItem && pkId === selectedItem) {
      return {
        ml: "auto",
        mr: "auto",
        mb: theme.spacing(1),
        width: "85%",
        backgroundColor: adsPaleBlueA,
        color: adsBlueA,
      };
    } else {
      return {
        ml: "auto",
        mr: "auto",
        mb: theme.spacing(1),
        width: "85%",
        backgroundColor: adsLightGreyA,
      };
    }
  };

  /**
   * Method to return the note style.
   *
   * @param {number} index The index of the note in the array of notes.
   * @returns {object} The note styling.
   */
  const getNoteStyle = (index) => {
    const defaultStyle = {
      height: "108px",
      "&:hover": {
        backgroundColor: adsPaleBlueA,
        color: adsBlueA,
      },
    };

    if (errors && errors.length > 0) {
      const recordErrors = errors.filter((x) => x.index === index);
      if (recordErrors && recordErrors.length > 0) {
        return {
          height: "100px",
          backgroundColor: adsRed10,
          "&:hover": {
            backgroundColor: adsRed20,
            color: adsBlueA,
          },
        };
      } else return defaultStyle;
    } else return defaultStyle;
  };

  useEffect(() => {
    if (variant === "street") {
      setUserCanEdit(userContext.currentUser && userContext.currentUser.editStreet);
    } else {
      setUserCanEdit(userContext.currentUser && userContext.currentUser.editProperty);
    }
  }, [userContext, variant]);

  return (
    <Fragment>
      <Box sx={toolbarStyle} id="ads-notes-data-grid">
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle1" sx={{ pl: theme.spacing(2) }}>
            Notes
          </Typography>
          <Tooltip title="Add new note record" arrow placement="right" sx={tooltipStyle}>
            <IconButton
              sx={ActionIconStyle()}
              disabled={!userCanEdit}
              onClick={handleAddNoteClick}
              aria_controls="actions-menu"
              aria-haspopup="true"
              size="small"
            >
              <AddCircleIcon />
              <Typography
                variant="subtitle1"
                sx={{
                  pl: theme.spacing(1),
                  pr: theme.spacing(1),
                }}
              >
                Add note
              </Typography>
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
      <Box sx={dataFormStyle(`${variant === "street" ? "StreetNotesListTab" : "PropertyNotesListTab"}`)}>
        {loading ? (
          <Skeleton variant="rectangular" height="30px" width="100%" />
        ) : (
          data &&
          data.length > 0 &&
          data
            .filter((x) => x.changeType !== "D")
            .sort((a, b) => b.seqNum - a.seqNum)
            .map((rec, index) => (
              <List
                sx={{
                  width: "100%",
                  backgroundColor: theme.palette.background.paper,
                  pt: theme.spacing(0),
                  pb: theme.spacing(0),
                }}
                component="nav"
                key={`key_${index}`}
              >
                <ListItemButton
                  divider
                  dense
                  disableGutters
                  sx={getNoteStyle(index)}
                  onClick={(event) => handleNoteClick(event, rec, index)}
                  onMouseEnter={(event) => handleMouseEnterRecord(event, rec.pkId)}
                  onMouseLeave={handleMouseLeaveRecord}
                >
                  <Grid2
                    container
                    justifyContent="space-between"
                    alignItems="center"
                    // sx={{ pl: theme.spacing(1) }}
                  >
                    <Grid2 size={2}>
                      <Box sx={getDateBoxStyle(rec.pkId)}>
                        <Typography variant="body2" align="center">
                          {FormatDate(rec.lastUpdatedDate)}
                        </Typography>
                      </Box>
                    </Grid2>
                    <Grid2 size={10}>
                      {selectedItem && selectedItem === rec.pkId && (
                        <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                          <Tooltip title="Edit note" arrow placement="bottom" sx={tooltipStyle}>
                            <IconButton
                              onClick={(event) => handleNoteClick(event, rec, index)}
                              size="small"
                              disabled={!userCanEdit}
                            >
                              <EditIcon sx={ActionIconStyle()} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete note" arrow placement="bottom" sx={tooltipStyle}>
                            <IconButton
                              onClick={(event) => handleDeleteClick(event, rec.pkId)}
                              size="small"
                              disabled={!userCanEdit}
                            >
                              <DeleteIcon sx={ActionIconStyle()} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      )}
                    </Grid2>
                    <Grid2 size={2}>
                      <Stack direction="row" justifyContent="center" alignItems="center">
                        {GetUserAvatar(
                          rec.lastUser === userContext.currentUser.auditName
                            ? userContext.currentUser.displayName
                            : rec.lastUser
                        )}
                      </Stack>
                    </Grid2>
                    <Grid2 size={10}>
                      <Typography variant="body1">{rec.note}</Typography>
                    </Grid2>
                    <Grid2 size={2}>
                      <Typography variant="body2">{""}</Typography>
                    </Grid2>
                    <Grid2 size={10}>
                      <Stack direction="column">
                        <Typography variant="caption">{FormatDateTime(rec.lastUpdatedDate)}</Typography>
                        <Typography variant="caption">{GetUserName(rec.lastUser)}</Typography>
                      </Stack>
                    </Grid2>
                  </Grid2>
                </ListItemButton>
              </List>
            ))
        )}
      </Box>
      <div>
        <ConfirmDeleteDialog
          variant={variant === "street" ? "street note" : "property note"}
          open={openDeleteConfirmation}
          onClose={handleCloseDeleteConfirmation}
        />
      </div>
    </Fragment>
  );
}

export default NotesListTab;
