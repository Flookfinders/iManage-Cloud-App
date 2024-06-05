/* #region header */
/**************************************************************************************************
//
//  Description: Confirm delete dialog
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
//    002   05.04.23 Sean Flook         WI40669 Added in wizard cross references.
//    003   27.06.23 Sean Flook         WI40757 Added in property template and map layer.
//    004   28.06.23 Sean Flook         WI40256 Changed Extent to Provenance where appropriate.
//    005   20.09.23 Sean Flook                 Handle OneScotland specific records types.
//    006   06.10.23 Sean Flook                 Use colour variables.
//    007   03.11.23 Sean Flook                 Modified highway dedication and one-way exemption dialog titles.
//    008   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system and renamed successor to successorCrossRef.
//    009   05.01.24 Sean Flook                 Use CSS shortcuts.
//    010   08.01.24 Sean Flook                 Changes to fix warnings.
//    011   27.02.24 Sean Flook           MUL15 Changed to use dialogTitleStyle.
//    012   27.03.24 Sean Flook                 Added ADSDialogTitle.
//    013   04.04.24 Sean Flook                 Changes to allow for the user to decide to also delete ESUs for streets and child properties for parent properties.
//    014   05.06.24 Sean Flook       IMANN-517 Corrected typo.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import {
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { Box } from "@mui/system";
import ADSDialogTitle from "../components/ADSDialogTitle";

import CircleIcon from "@mui/icons-material/Circle";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";

import { adsBlueA, adsRed, adsWhite, adsPaleBlueA, adsDarkRed } from "../utils/ADSColours";
import { useTheme } from "@mui/styles";
import { deleteDialogContentStyle } from "../utils/ADSStyles";

/* #endregion imports */

ConfirmDeleteDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  variant: PropTypes.oneOf([
    "street",
    "esu",
    "streetSuccessorCrossRef",
    "hd",
    "owe",
    "maintenance responsibility",
    "reinstatement category",
    "os special designation",
    "interested organisation",
    "construction",
    "special designation",
    "hww",
    "prow",
    "street note",
    "property",
    "lpi",
    "classification",
    "organisation",
    "propertySuccessorCrossRef",
    "app cross ref",
    "wizard app cross ref property",
    "wizard app cross ref range",
    "wizard app cross ref child",
    "wizard app cross ref children",
    "provenance",
    "property note",
    "address",
    "property template",
    "map layer",
  ]),
  recordCount: PropTypes.number,
  childCount: PropTypes.number,
  associatedRecords: PropTypes.array,
  onClose: PropTypes.func.isRequired,
};

ConfirmDeleteDialog.defaultProps = {
  recordCount: 1,
  childCount: 0,
};

function ConfirmDeleteDialog({ open, variant, recordCount, childCount, associatedRecords, onClose }) {
  const theme = useTheme();
  const [title, setTitle] = useState("Delete record");
  const [subtitle, setSubtitle] = useState(null);
  const [content, setContent] = useState(null);

  const [deleteChildChecked, setDeleteChildChecked] = useState(false);

  /**
   * Event to handle when the cancel button is clicked.
   */
  const handleCancel = () => {
    onClose(false, false);
  };

  /**
   * Event to handle when the OK button is clicked.
   */
  const handleOk = () => {
    onClose(true, deleteChildChecked);
  };

  useEffect(() => {
    const handleDeleteChildChanged = () => {
      setDeleteChildChecked(!deleteChildChecked);
    };

    const recordText = recordCount && recordCount > 1 ? "records" : "record";

    switch (variant) {
      case "street":
        setTitle(`Delete ${recordCount && recordCount > 1 ? recordCount.toString() + " " : ""}street ${recordText}`);
        setSubtitle(null);
        setContent(
          <Box sx={deleteDialogContentStyle}>
            <Typography variant="body1">{`On deletion ${
              recordCount && recordCount > 1 ? "these records" : "this record"
            }`}</Typography>
            <List dense>
              <ListItem key="deleteLine1">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will be stored as archived information." />
              </ListItem>
              {/* <ListItem key="deleteLine2">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="can be retrieved from the archive if necessary." />
              </ListItem> */}
              {associatedRecords && associatedRecords.length > 0 && (
                <ListItem key="deleteLine3">
                  <ListItemIcon>
                    <CircleIcon sx={{ width: "12px", height: "12px" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={`the following ${associatedRecords.length} type${
                      associatedRecords.length > 1 ? "s" : ""
                    } of associated record${associatedRecords.length > 1 ? "s" : ""} will also be deleted:`}
                  />
                </ListItem>
              )}
              {associatedRecords &&
                associatedRecords.length > 0 &&
                associatedRecords.map((rec, index) => (
                  <ListItem key={`deleteLine3_${index}`}>
                    <ListItemText
                      inset
                      primary={`${index + 1}) ${rec.count} ${rec.type} record${rec.count > 1 ? "s" : ""}`}
                    />
                  </ListItem>
                ))}
              {childCount > 0 && (
                <ListItem
                  key="deleteLine4"
                  secondaryAction={
                    <FormControlLabel
                      value="end"
                      control={
                        <Switch
                          id="deleteLine4_switch"
                          checked={deleteChildChecked}
                          onChange={handleDeleteChildChanged}
                          color="primary"
                        />
                      }
                      label={deleteChildChecked ? "Yes" : "No"}
                      labelPlacement="end"
                    />
                  }
                >
                  <ListItemIcon>
                    <CircleIcon sx={{ width: "12px", height: "12px" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={`do you want to also delete the ${childCount > 1 ? childCount : ""} ESU record${
                      childCount > 1 ? "s" : ""
                    }?`}
                  />
                </ListItem>
              )}
            </List>
          </Box>
        );
        break;

      case "esu":
        setTitle(`Delete ${recordCount && recordCount > 1 ? recordCount.toString() + " " : ""}ESU ${recordText}`);
        setSubtitle(null);
        setContent(
          <Box sx={deleteDialogContentStyle}>
            <Typography variant="body1">{`On deletion ${
              recordCount && recordCount > 1 ? "these records" : "this record"
            }`}</Typography>
            <List dense>
              <ListItem key="deleteLine1">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will no longer be associated with this street." />
              </ListItem>
              <ListItem key="deleteLine2">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will be stored as archived information." />
              </ListItem>
              {/* <ListItem key="deleteLine3">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="can be retrieved from the archive if necessary." />
              </ListItem> */}
              {associatedRecords && associatedRecords.length > 0 && (
                <ListItem key="deleteLine4">
                  <ListItemIcon>
                    <CircleIcon sx={{ width: "12px", height: "12px" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={`the following ${associatedRecords.length} type${
                      associatedRecords.length > 1 ? "s" : ""
                    } of associated record${associatedRecords.length > 1 ? "s" : ""} will also be deleted:`}
                  />
                </ListItem>
              )}
              {associatedRecords &&
                associatedRecords.length > 0 &&
                associatedRecords.map((rec, index) => (
                  <ListItem key={`deleteLine${index + 4}`}>
                    <ListItemText
                      inset
                      primary={`${index + 1}) ${rec.count} ${rec.type} record${rec.count > 1 ? "s" : ""}`}
                    />
                  </ListItem>
                ))}
            </List>
          </Box>
        );
        break;

      case "streetSuccessorCrossRef":
        setTitle(
          `Delete ${
            recordCount && recordCount > 1 ? recordCount.toString() + " " : ""
          }successor cross reference ${recordText}`
        );
        setSubtitle(null);
        setContent(
          <Box sx={deleteDialogContentStyle}>
            <Typography variant="body1">{`On deletion ${
              recordCount && recordCount > 1 ? "these records" : "this record"
            }`}</Typography>
            <List dense>
              <ListItem key="deleteLine1">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will no longer be associated with this street." />
              </ListItem>
              <ListItem key="deleteLine2">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will be stored as archived information." />
              </ListItem>
              {/* <ListItem key="deleteLine3">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="can be retrieved from the archive if necessary." />
              </ListItem> */}
            </List>
          </Box>
        );
        break;

      case "hd":
        setTitle(
          `Delete ${recordCount && recordCount > 1 ? recordCount.toString() + " " : ""}highway dedication ${recordText}`
        );
        setSubtitle(null);
        setContent(
          <Box sx={deleteDialogContentStyle}>
            <Typography variant="body1">{`On deletion ${
              recordCount && recordCount > 1 ? "these records" : "this record"
            }`}</Typography>
            <List dense>
              <ListItem key="deleteLine1">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will no longer be associated with this ESU." />
              </ListItem>
              <ListItem key="deleteLine2">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will be stored as archived information." />
              </ListItem>
              {/* <ListItem key="deleteLine3">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="can be retrieved from the archive if necessary." />
              </ListItem> */}
            </List>
          </Box>
        );
        break;

      case "owe":
        setTitle(
          `Delete ${recordCount && recordCount > 1 ? recordCount.toString() + " " : ""}one-way exemption ${recordText}`
        );
        setSubtitle(null);
        setContent(
          <Box sx={deleteDialogContentStyle}>
            <Typography variant="body1">{`On deletion ${
              recordCount && recordCount > 1 ? "these records" : "this record"
            }`}</Typography>
            <List dense>
              <ListItem key="deleteLine1">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will no longer be associated with this ESU." />
              </ListItem>
              <ListItem key="deleteLine2">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will be stored as archived information." />
              </ListItem>
              {/* <ListItem key="deleteLine3">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="can be retrieved from the archive if necessary." />
              </ListItem> */}
            </List>
          </Box>
        );
        break;

      case "maintenance responsibility":
        setTitle(`Delete ASD ${recordText}`);
        setSubtitle(
          `${
            recordCount && recordCount > 1 ? recordCount.toString() + " " : ""
          }Maintenance responsibility ${recordText}`
        );
        setContent(
          <Box sx={deleteDialogContentStyle}>
            <Typography variant="body1">{`On deletion ${
              recordCount && recordCount > 1 ? "these records" : "this record"
            }`}</Typography>
            <List dense>
              <ListItem key="deleteLine1">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will no longer be associated with this street." />
              </ListItem>
              <ListItem key="deleteLine2">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will be stored as archived information." />
              </ListItem>
              {/* <ListItem key="deleteLine3">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="can be retrieved from the archive if necessary." />
              </ListItem> */}
            </List>
          </Box>
        );
        break;

      case "reinstatement category":
        setTitle(`Delete ASD ${recordText}`);
        setSubtitle(
          `${recordCount && recordCount > 1 ? recordCount.toString() + " " : ""}Reinstatement category ${recordText}`
        );
        setContent(
          <Box sx={deleteDialogContentStyle}>
            <Typography variant="body1">{`On deletion ${
              recordCount && recordCount > 1 ? "these records" : "this record"
            }`}</Typography>
            <List dense>
              <ListItem key="deleteLine1">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will no longer be associated with this street." />
              </ListItem>
              <ListItem key="deleteLine2">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will be stored as archived information." />
              </ListItem>
              {/* <ListItem key="deleteLine3">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="can be retrieved from the archive if necessary." />
              </ListItem> */}
            </List>
          </Box>
        );
        break;

      case "os special designation":
        setTitle(`Delete ASD ${recordText}`);
        setSubtitle(
          `${recordCount && recordCount > 1 ? recordCount.toString() + " " : ""}Special designation ${recordText}`
        );
        setContent(
          <Box sx={deleteDialogContentStyle}>
            <Typography variant="body1">{`On deletion ${
              recordCount && recordCount > 1 ? "these records" : "this record"
            }`}</Typography>
            <List dense>
              <ListItem key="deleteLine1">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will no longer be associated with this street." />
              </ListItem>
              <ListItem key="deleteLine2">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will be stored as archived information." />
              </ListItem>
              {/* <ListItem key="deleteLine3">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="can be retrieved from the archive if necessary." />
              </ListItem> */}
            </List>
          </Box>
        );
        break;

      case "interested organisation":
        setTitle(`Delete ASD ${recordText}`);
        setSubtitle(
          `${recordCount && recordCount > 1 ? recordCount.toString() + " " : ""}Interested organisation ${recordText}`
        );
        setContent(
          <Box sx={deleteDialogContentStyle}>
            <Typography variant="body1">{`On deletion ${
              recordCount && recordCount > 1 ? "these records" : "this record"
            }`}</Typography>
            <List dense>
              <ListItem key="deleteLine1">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will no longer be associated with this street." />
              </ListItem>
              <ListItem key="deleteLine2">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will be stored as archived information." />
              </ListItem>
              {/* <ListItem key="deleteLine3">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="can be retrieved from the archive if necessary." />
              </ListItem> */}
            </List>
          </Box>
        );
        break;

      case "construction":
        setTitle(`Delete ASD ${recordText}`);
        setSubtitle(`${recordCount && recordCount > 1 ? recordCount.toString() + " " : ""}Construction ${recordText}`);
        setContent(
          <Box sx={deleteDialogContentStyle}>
            <Typography variant="body1">{`On deletion ${
              recordCount && recordCount > 1 ? "these records" : "this record"
            }`}</Typography>
            <List dense>
              <ListItem key="deleteLine1">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will no longer be associated with this street." />
              </ListItem>
              <ListItem key="deleteLine2">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will be stored as archived information." />
              </ListItem>
              {/* <ListItem>
                <ListItemIcon key="deleteLine3">
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="can be retrieved from the archive if necessary." />
              </ListItem> */}
            </List>
          </Box>
        );
        break;

      case "special designation":
        setTitle(`Delete ASD ${recordText}`);
        setSubtitle(
          `${recordCount && recordCount > 1 ? recordCount.toString() + " " : ""}Special designation ${recordText}`
        );
        setContent(
          <Box sx={deleteDialogContentStyle}>
            <Typography variant="body1">{`On deletion ${
              recordCount && recordCount > 1 ? "these records" : "this record"
            }`}</Typography>
            <List dense>
              <ListItem key="deleteLine1">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will no longer be associated with this street." />
              </ListItem>
              <ListItem key="deleteLine2">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will be stored as archived information." />
              </ListItem>
              {/* <ListItem key="deleteLine3">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="can be retrieved from the archive if necessary." />
              </ListItem> */}
            </List>
          </Box>
        );
        break;

      case "hww":
        setTitle(`Delete ASD ${recordText}`);
        setSubtitle(
          `${
            recordCount && recordCount > 1 ? recordCount.toString() + " " : ""
          }Height, width and weight restrictions ${recordText}`
        );
        setContent(
          <Box sx={deleteDialogContentStyle}>
            <Typography variant="body1">{`On deletion ${
              recordCount && recordCount > 1 ? "these records" : "this record"
            }`}</Typography>
            <List dense>
              <ListItem key="deleteLine1">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will no longer be associated with this street." />
              </ListItem>
              <ListItem key="deleteLine2">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will be stored as archived information." />
              </ListItem>
              {/* <ListItem key="deleteLine3">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="can be retrieved from the archive if necessary." />
              </ListItem> */}
            </List>
          </Box>
        );
        break;

      case "prow":
        setTitle(`Delete ASD ${recordText}`);
        setSubtitle(
          `${recordCount && recordCount > 1 ? recordCount.toString() + " " : ""}Public right of way ${recordText}`
        );
        setContent(
          <Box sx={deleteDialogContentStyle}>
            <Typography variant="body1">{`On deletion ${
              recordCount && recordCount > 1 ? "these records" : "this record"
            }`}</Typography>
            <List dense>
              <ListItem key="deleteLine1">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will no longer be associated with this street." />
              </ListItem>
              <ListItem key="deleteLine2">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will be stored as archived information." />
              </ListItem>
              {/* <ListItem key="deleteLine3">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="can be retrieved from the archive if necessary." />
              </ListItem> */}
            </List>
          </Box>
        );
        break;

      case "street note":
        setTitle(`Delete ${recordCount && recordCount > 1 ? recordCount.toString() + " " : ""}note ${recordText}`);
        setSubtitle(null);
        setContent(
          <Box sx={deleteDialogContentStyle}>
            <Typography variant="body1">{`On deletion ${
              recordCount && recordCount > 1 ? "these records" : "this record"
            }`}</Typography>
            <List dense>
              <ListItem key="deleteLine1">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will no longer be associated with this street." />
              </ListItem>
              <ListItem key="deleteLine2">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will be stored as archived information." />
              </ListItem>
              {/* <ListItem key="deleteLine3">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="can be retrieved from the archive if necessary." />
              </ListItem> */}
            </List>
          </Box>
        );
        break;

      case "property":
        setTitle(`Delete ${recordCount && recordCount > 1 ? recordCount.toString() + " " : ""}property ${recordText}`);
        setSubtitle(null);
        setContent(
          <Box sx={deleteDialogContentStyle}>
            <Typography variant="body1">{`On deletion ${
              recordCount && recordCount > 1 ? "these records" : "this record"
            }`}</Typography>
            <List dense>
              <ListItem key="deleteLine1">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will be stored as archived information." />
              </ListItem>
              {/* <ListItem key="deleteLine2">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="can be retrieved from the archive if necessary." />
              </ListItem> */}
              {associatedRecords && associatedRecords.length > 0 && (
                <ListItem key="deleteLine3">
                  <ListItemIcon>
                    <CircleIcon sx={{ width: "12px", height: "12px" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={`the following ${associatedRecords.length} type${
                      associatedRecords.length > 1 ? "s" : ""
                    } of associated record${associatedRecords.length > 1 ? "s" : ""} will also be deleted:`}
                  />
                </ListItem>
              )}
              {associatedRecords &&
                associatedRecords.length > 0 &&
                associatedRecords.map((rec, index) => (
                  <ListItem key={`deleteLine3_${index}`}>
                    <ListItemText
                      inset
                      primary={`${index + 1}) ${rec.count} ${rec.type} record${rec.count > 1 ? "s" : ""}`}
                    />
                  </ListItem>
                ))}
              {childCount > 0 && (
                <ListItem
                  key="deleteLine4"
                  secondaryAction={
                    <FormControlLabel
                      value="end"
                      control={
                        <Switch
                          id="deleteLine4_switch"
                          checked={deleteChildChecked}
                          onChange={handleDeleteChildChanged}
                          color="primary"
                        />
                      }
                      label={deleteChildChecked ? "Yes" : "No"}
                      labelPlacement="end"
                    />
                  }
                >
                  <ListItemIcon>
                    <CircleIcon sx={{ width: "12px", height: "12px" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={`do you want to also delete the ${childCount > 1 ? childCount : ""} child record${
                      childCount > 1 ? "s" : ""
                    }?`}
                  />
                </ListItem>
              )}
            </List>
          </Box>
        );
        break;

      case "lpi":
        setTitle(`Delete ${recordCount && recordCount > 1 ? recordCount.toString() + " " : ""}LPI ${recordText}`);
        setSubtitle(null);
        setContent(
          <Box sx={deleteDialogContentStyle}>
            <Typography variant="body1">{`On deletion ${
              recordCount && recordCount > 1 ? "these records" : "this record"
            }`}</Typography>
            <List dense>
              <ListItem key="deleteLine1">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will no longer be associated with this property." />
              </ListItem>
              <ListItem key="deleteLine2">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will be stored as archived information." />
              </ListItem>
              {/* <ListItem key="deleteLine3">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="can be retrieved from the archive if necessary." />
              </ListItem> */}
              {associatedRecords && associatedRecords.length > 0 && (
                <ListItem key="deleteLine4">
                  <ListItemIcon>
                    <CircleIcon sx={{ width: "12px", height: "12px" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={`the following ${associatedRecords.length} type${
                      associatedRecords.length > 1 ? "s" : ""
                    } of associated record${associatedRecords.length > 1 ? "s" : ""} will also be deleted:`}
                  />
                </ListItem>
              )}
              {associatedRecords &&
                associatedRecords.length > 0 &&
                associatedRecords.map((rec, index) => (
                  <ListItem key={`deleteLine${index + 3}`}>
                    <ListItemText
                      inset
                      primary={`${index + 1}) ${rec.count} ${rec.type} record${rec.count > 1 ? "s" : ""}`}
                    />
                  </ListItem>
                ))}
            </List>
          </Box>
        );
        break;

      case "classification":
      case "organisation":
        setTitle(
          `Delete ${recordCount && recordCount > 1 ? recordCount.toString() + " " : ""}${variant} ${recordText}`
        );
        setSubtitle(null);
        setContent(
          <Box sx={deleteDialogContentStyle}>
            <Typography variant="body1">{`On deletion ${
              recordCount && recordCount > 1 ? "these records" : "this record"
            }`}</Typography>
            <List dense>
              <ListItem key="deleteLine1">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will no longer be associated with this property." />
              </ListItem>
              <ListItem key="deleteLine2">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will be stored as archived information." />
              </ListItem>
              {/* <ListItem key="deleteLine3">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="can be retrieved from the archive if necessary." />
              </ListItem> */}
              {associatedRecords && associatedRecords.length > 0 && (
                <ListItem key="deleteLine4">
                  <ListItemIcon>
                    <CircleIcon sx={{ width: "12px", height: "12px" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={`the following ${associatedRecords.length} type${
                      associatedRecords.length > 1 ? "s" : ""
                    } of associated record${associatedRecords.length > 1 ? "s" : ""} will also be deleted:`}
                  />
                </ListItem>
              )}
              {associatedRecords &&
                associatedRecords.length > 0 &&
                associatedRecords.map((rec, index) => (
                  <ListItem key={`deleteLine${index + 4}`}>
                    <ListItemText
                      inset
                      primary={`${index + 1}) ${rec.count} ${rec.type} record${rec.count > 1 ? "s" : ""}`}
                    />
                  </ListItem>
                ))}
            </List>
          </Box>
        );
        break;

      case "propertySuccessorCrossRef":
        setTitle(
          `Delete ${
            recordCount && recordCount > 1 ? recordCount.toString() + " " : ""
          }successor cross reference ${recordText}`
        );
        setSubtitle(null);
        setContent(
          <Box sx={deleteDialogContentStyle}>
            <Typography variant="body1">{`On deletion ${
              recordCount && recordCount > 1 ? "these records" : "this record"
            }`}</Typography>
            <List dense>
              <ListItem key="deleteLine1">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will no longer be associated with this property." />
              </ListItem>
              <ListItem key="deleteLine2">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will be stored as archived information." />
              </ListItem>
              {/* <ListItem key="deleteLine3">
                  <ListItemIcon>
                    <CircleIcon sx={{ width: "12px", height: "12px" }} />
                  </ListItemIcon>
                  <ListItemText primary="can be retrieved from the archive if necessary." />
                </ListItem> */}
              {associatedRecords && associatedRecords.length > 0 && (
                <ListItem key="deleteLine4">
                  <ListItemIcon>
                    <CircleIcon sx={{ width: "12px", height: "12px" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={`the following ${associatedRecords.length} type${
                      associatedRecords.length > 1 ? "s" : ""
                    } of associated record${associatedRecords.length > 1 ? "s" : ""} will also be deleted:`}
                  />
                </ListItem>
              )}
              {associatedRecords &&
                associatedRecords.length > 0 &&
                associatedRecords.map((rec, index) => (
                  <ListItem key={`deleteLine${index + 4}`}>
                    <ListItemText
                      inset
                      primary={`${index + 1}) ${rec.count} ${rec.type} record${rec.count > 1 ? "s" : ""}`}
                    />
                  </ListItem>
                ))}
            </List>
          </Box>
        );
        break;

      case "app cross ref":
        setTitle(
          `Delete ${recordCount && recordCount > 1 ? recordCount.toString() + " " : ""}cross reference ${recordText}`
        );
        setSubtitle(null);
        setContent(
          <Box sx={deleteDialogContentStyle}>
            <Typography variant="body1">{`On deletion ${
              recordCount && recordCount > 1 ? "these records" : "this record"
            }`}</Typography>
            <List dense>
              <ListItem key="deleteLine1">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will no longer be associated with this property." />
              </ListItem>
              <ListItem key="deleteLine2">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will be stored as archived information." />
              </ListItem>
              {/* <ListItem key="deleteLine3">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="can be retrieved from the archive if necessary." />
              </ListItem> */}
              {associatedRecords && associatedRecords.length > 0 && (
                <ListItem key="deleteLine4">
                  <ListItemIcon>
                    <CircleIcon sx={{ width: "12px", height: "12px" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={`the following ${associatedRecords.length} type${
                      associatedRecords.length > 1 ? "s" : ""
                    } of associated record${associatedRecords.length > 1 ? "s" : ""} will also be deleted:`}
                  />
                </ListItem>
              )}
              {associatedRecords &&
                associatedRecords.length > 0 &&
                associatedRecords.map((rec, index) => (
                  <ListItem key={`deleteLine${index + 4}`}>
                    <ListItemText
                      inset
                      primary={`${index + 1}) ${rec.count} ${rec.type} record${rec.count > 1 ? "s" : ""}`}
                    />
                  </ListItem>
                ))}
            </List>
          </Box>
        );
        break;

      case "wizard app cross ref property":
      case "wizard app cross ref range":
      case "wizard app cross ref child":
      case "wizard app cross ref children":
        setTitle(
          `Delete ${recordCount && recordCount > 1 ? recordCount.toString() + " " : ""}cross reference ${recordText}`
        );
        setSubtitle(null);
        setContent(
          <Box sx={deleteDialogContentStyle}>
            <Typography variant="body1">On deletion this record</Typography>
            <List dense>
              <ListItem key="deleteLine1">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText
                  primary={`will not be included when creating the ${
                    variant === "wizard app cross ref property"
                      ? "property"
                      : variant === "wizard app cross ref range"
                      ? "properties"
                      : variant === "wizard app cross ref child"
                      ? "child"
                      : "children"
                  }.`}
                />
              </ListItem>
            </List>
          </Box>
        );
        break;

      case "provenance":
        setTitle(
          `Delete ${recordCount && recordCount > 1 ? recordCount.toString() + " " : ""}BLPU provenance ${recordText}`
        );
        setSubtitle(null);
        setContent(
          <Box sx={deleteDialogContentStyle}>
            <Typography variant="body1">{`On deletion ${
              recordCount && recordCount > 1 ? "these records" : "this record"
            }`}</Typography>
            <List dense>
              <ListItem key="deleteLine1">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will no longer be associated with this property." />
              </ListItem>
              <ListItem key="deleteLine2">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will be stored as archived information." />
              </ListItem>
              {/* <ListItem key="deleteLine3">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="can be retrieved from the archive if necessary." />
              </ListItem> */}
            </List>
          </Box>
        );
        break;

      case "property note":
        setTitle(`Delete ${recordCount && recordCount > 1 ? recordCount.toString() + " " : ""}note ${recordText}`);
        setSubtitle(null);
        setContent(
          <Box sx={deleteDialogContentStyle}>
            <Typography variant="body1">{`On deletion ${
              recordCount && recordCount > 1 ? "these records" : "this record"
            }`}</Typography>
            <List dense>
              <ListItem key="deleteLine1">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will no longer be associated with this property." />
              </ListItem>
              <ListItem key="deleteLine2">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will be stored as archived information." />
              </ListItem>
              {/* <ListItem key="deleteLine3">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="can be retrieved from the archive if necessary." />
              </ListItem> */}
            </List>
          </Box>
        );
        break;

      case "address":
        setTitle(`Delete ${recordCount && recordCount > 1 ? recordCount.toString() + " " : ""}address ${recordText}`);
        setSubtitle(null);
        setContent(
          <Box sx={deleteDialogContentStyle}>
            <Typography variant="body1">{`On deletion ${
              recordCount && recordCount > 1 ? "these records" : "this record"
            }`}</Typography>
            <List dense>
              <ListItem key="deleteLine1">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will be removed from the list of addresses." />
              </ListItem>
              <ListItem key="deleteLine2">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will not be created on completion of the wizard." />
              </ListItem>
            </List>
          </Box>
        );
        break;

      case "property template":
        setTitle("Delete template record");
        setSubtitle(null);
        setContent(
          <Box sx={deleteDialogContentStyle}>
            <Typography variant="body1">{"On deletion this record"}</Typography>
            <List dense>
              <ListItem key="deleteLine1">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will be removed from the list of templates." />
              </ListItem>
            </List>
          </Box>
        );
        break;

      case "map layer":
        setTitle("Delete map layer record");
        setSubtitle(null);
        setContent(
          <Box sx={deleteDialogContentStyle}>
            <Typography variant="body1">{"On deletion this record"}</Typography>
            <List dense>
              <ListItem key="deleteLine1">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will be removed from the list of map layers." />
              </ListItem>
            </List>
          </Box>
        );
        break;

      default:
        setTitle(`Delete ${recordCount && recordCount > 1 ? recordCount.toString() + " " : ""}${recordText}`);
        setSubtitle(null);
        setContent(
          <Box sx={deleteDialogContentStyle}>
            <Typography variant="body1">{`On deletion ${
              recordCount && recordCount > 1 ? "these records" : "this record"
            }`}</Typography>
            <List dense>
              <ListItem key="deleteLine1">
                <ListItemIcon>
                  <CircleIcon sx={{ width: "12px", height: "12px" }} />
                </ListItemIcon>
                <ListItemText primary="will be stored as archived information." />
              </ListItem>
            </List>
          </Box>
        );
        break;
    }
  }, [variant, recordCount, childCount, associatedRecords, deleteChildChecked]);

  useEffect(() => {
    setDeleteChildChecked(variant === "street");
  }, [variant]);

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      aria-labelledby="confirmation-dialog-title"
      sx={{ p: "16px 16px 24px 16px", borderRadius: "9px" }}
      onClose={handleCancel}
    >
      <ADSDialogTitle title={`${title}`} closeTooltip="Cancel" onClose={handleCancel} />
      <DialogContent sx={{ backgroundColor: theme.palette.background.paper }}>
        {subtitle && (
          <Typography variant="h6" sx={{ pb: theme.spacing(2) }}>
            {subtitle}
          </Typography>
        )}
        {content}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "flex-start", pl: "24px", pb: "24px" }}>
        <Button
          variant="contained"
          onClick={handleOk}
          sx={{
            color: adsWhite,
            backgroundColor: adsRed,
            "&:hover": {
              backgroundColor: adsDarkRed,
            },
          }}
          startIcon={<DeleteIcon />}
        >
          Delete
        </Button>
        <Button
          variant="contained"
          autoFocus
          sx={{
            color: adsBlueA,
            backgroundColor: adsWhite,
            "&:hover": {
              backgroundColor: adsPaleBlueA,
            },
          }}
          onClick={handleCancel}
          startIcon={<CloseIcon />}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDeleteDialog;
