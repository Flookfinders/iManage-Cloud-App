/* #region header */
/**************************************************************************************************
//
//  Description: Notes list tab
//
//  Copyright:    © 2021 - 2023 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001            Sean Flook                 Initial Revision.
//    002   10.08.23 Sean Flook                 Do not display the deleted records.
//    003   06.10.23 Sean Flook                 Use colour variables.
//    004   27.10.23 Sean Flook                 Use new dataFormStyle.
//    005   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system and fixed a warning.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useRef, useEffect, Fragment } from "react";
import PropTypes from "prop-types";
import UserContext from "../context/userContext";
import { FormatDate, FormatDateTime, GetUserAvatar, GetUserName } from "../utils/HelperUtils";
import { Typography, Grid, Skeleton, Tooltip, IconButton, List, ListItemButton } from "@mui/material";
import { Box, Stack } from "@mui/system";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";
import {
  AddCircleOutlineOutlined as AddCircleIcon,
  Edit as EditIcon,
  DeleteOutline as DeleteIcon,
} from "@mui/icons-material";
import { adsBlueA, adsRed10, adsRed20, adsLightBlue10, adsLightGreyA } from "../utils/ADSColours";
import { propertyToolbarStyle, dataFormStyle, ActionIconStyle, tooltipStyle } from "../utils/ADSStyles";
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
        marginLeft: "auto",
        marginRight: "auto",
        marginBottom: theme.spacing(1.7),
        width: "85%",
        backgroundColor: adsLightBlue10,
        color: adsBlueA,
      };
    } else {
      return {
        marginLeft: "auto",
        marginRight: "auto",
        marginBottom: theme.spacing(1.7),
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
      height: "100px",
      "&:hover": {
        backgroundColor: adsLightBlue10,
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
    setUserCanEdit(userContext.currentUser && userContext.currentUser.canEdit);
  }, [userContext]);

  return (
    <Fragment>
      <Box sx={propertyToolbarStyle} id="ads-notes-data-grid">
        <Grid container justifyContent="space-between" alignItems="center" sx={{ paddingLeft: theme.spacing(1) }}>
          <Grid item>
            <Typography variant="subtitle2">Notes</Typography>
          </Grid>
          <Grid item>
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
                <Typography variant="subtitle2">Add note</Typography>
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Box>
      <Box sx={dataFormStyle("77.7vh")}>
        {loading ? (
          <Skeleton variant="rectangular" height="30px" width="100%" />
        ) : (
          data &&
          data.length > 0 &&
          data
            .filter((x) => x.changeType !== "D")
            .sort((a, b) => b.seqNo - a.seqNo)
            .map((rec, index) => (
              <List
                sx={{
                  width: "100%",
                  backgroundColor: theme.palette.background.paper,
                  paddingTop: theme.spacing(0),
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
                  <Grid
                    container
                    justifyContent="space-between"
                    alignItems="center"
                    // sx={{ paddingLeft: theme.spacing(1) }}
                  >
                    <Grid item xs={2}>
                      <Box sx={getDateBoxStyle(rec.pkId)}>
                        <Typography variant="body2" align="center">
                          {FormatDate(rec.lastUpdatedDate)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={10}>
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
                    </Grid>
                    <Grid item xs={2}>
                      <Stack direction="row" justifyContent="center" alignItems="center">
                        {GetUserAvatar(rec.lastUser)}
                      </Stack>
                    </Grid>
                    <Grid item xs={10}>
                      <Typography variant="body1">{rec.note}</Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography variant="body2">{""}</Typography>
                    </Grid>
                    <Grid item xs={10}>
                      <Stack direction="column">
                        <Typography variant="caption">{FormatDateTime(rec.lastUpdatedDate)}</Typography>
                        <Typography variant="caption">{GetUserName(rec.lastUser)}</Typography>
                      </Stack>
                    </Grid>
                  </Grid>
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
