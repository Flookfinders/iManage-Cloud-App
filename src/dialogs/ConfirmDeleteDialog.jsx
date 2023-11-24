/* #region header */
/**************************************************************************************************
//
//  Description: Confirm delete dialog
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
//    002   05.04.23 Sean Flook         WI40669 Added in wizard cross references.
//    003   27.06.23 Sean Flook         WI40757 Added in property template and map layer.
//    004   28.06.23 Sean Flook         WI40256 Changed Extent to Provenance where appropriate.
//    005   20.09.23 Sean Flook                 Handle OneScotland specific records types.
//    006   06.10.23 Sean Flook                 Use colour variables.
//    007   03.11.23 Sean Flook                 Modified highway dedication and one-way exemption dialog titles.
//    008   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system and renamed successor to successorCrossRef.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSActionButton from "../components/ADSActionButton";

import CircleIcon from "@mui/icons-material/Circle";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";

import { adsBlueA, adsMidGreyA, adsRed, adsWhite, adsPaleBlueA, adsLightGreyC, adsDarkRed } from "../utils/ADSColours";
import { useTheme } from "@mui/styles";

/* #endregion imports */

ConfirmDeleteDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  variant: PropTypes.oneOf([
    "street",
    "esu",
    "streetSuccessorCrossRef",
    "hd",
    "owe",
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
  associatedRecords: PropTypes.array,
  onClose: PropTypes.func.isRequired,
};

ConfirmDeleteDialog.defaultProps = {
  recordCount: 1,
};

function ConfirmDeleteDialog({ open, variant, recordCount, associatedRecords, onClose }) {
  const theme = useTheme();
  const [title, setTitle] = useState("Delete record");
  const [subtitle, setSubtitle] = useState(null);
  const [content, setContent] = useState(null);
  const maxContentHeight = "240px";

  /**
   * Event to handle when the cancel button is clicked.
   */
  const handleCancel = () => {
    onClose(false);
  };

  /**
   * Event to handle when the OK button is clicked.
   */
  const handleOk = () => {
    onClose(true);
  };

  useEffect(() => {
    const recordText = recordCount && recordCount > 1 ? "records" : "record";

    switch (variant) {
      case "street":
        setTitle(`Delete ${recordCount && recordCount > 1 ? recordCount.toString() + " " : ""}street ${recordText}`);
        setSubtitle(null);
        setContent(
          <Box sx={{ maxHeight: maxContentHeight, fontSize: "16px", color: adsMidGreyA, lineHeight: "22px" }}>
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

      case "esu":
        setTitle(`Delete ${recordCount && recordCount > 1 ? recordCount.toString() + " " : ""}ESU ${recordText}`);
        setSubtitle(null);
        setContent(
          <Box sx={{ maxHeight: maxContentHeight, fontSize: "16px", color: adsMidGreyA, lineHeight: "22px" }}>
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
          <Box sx={{ maxHeight: maxContentHeight, fontSize: "16px", color: adsMidGreyA, lineHeight: "22px" }}>
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
          <Box sx={{ maxHeight: maxContentHeight, fontSize: "16px", color: adsMidGreyA, lineHeight: "22px" }}>
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
          <Box sx={{ maxHeight: maxContentHeight, fontSize: "16px", color: adsMidGreyA, lineHeight: "22px" }}>
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

      case "interested organisation":
        setTitle(`Delete ASD ${recordText}`);
        setSubtitle(
          `${recordCount && recordCount > 1 ? recordCount.toString() + " " : ""}Interested organisation ${recordText}`
        );
        setContent(
          <Box sx={{ maxHeight: maxContentHeight, fontSize: "16px", color: adsMidGreyA, lineHeight: "22px" }}>
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
          <Box sx={{ maxHeight: maxContentHeight, fontSize: "16px", color: adsMidGreyA, lineHeight: "22px" }}>
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
          <Box sx={{ maxHeight: maxContentHeight, fontSize: "16px", color: adsMidGreyA, lineHeight: "22px" }}>
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
          <Box sx={{ maxHeight: maxContentHeight, fontSize: "16px", color: adsMidGreyA, lineHeight: "22px" }}>
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
          <Box sx={{ maxHeight: maxContentHeight, fontSize: "16px", color: adsMidGreyA, lineHeight: "22px" }}>
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
          <Box sx={{ maxHeight: maxContentHeight, fontSize: "16px", color: adsMidGreyA, lineHeight: "22px" }}>
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
          <Box sx={{ maxHeight: maxContentHeight, fontSize: "16px", color: adsMidGreyA, lineHeight: "22px" }}>
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

      case "lpi":
        setTitle(`Delete ${recordCount && recordCount > 1 ? recordCount.toString() + " " : ""}LPI ${recordText}`);
        setSubtitle(null);
        setContent(
          <Box sx={{ maxHeight: maxContentHeight, fontSize: "16px", color: adsMidGreyA, lineHeight: "22px" }}>
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
          <Box sx={{ maxHeight: maxContentHeight, fontSize: "16px", color: adsMidGreyA, lineHeight: "22px" }}>
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
          <Box sx={{ maxHeight: maxContentHeight, fontSize: "16px", color: adsMidGreyA, lineHeight: "22px" }}>
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
          <Box sx={{ maxHeight: maxContentHeight, fontSize: "16px", color: adsMidGreyA, lineHeight: "22px" }}>
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
          <Box sx={{ maxHeight: maxContentHeight, fontSize: "16px", color: adsMidGreyA, lineHeight: "22px" }}>
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
          <Box sx={{ maxHeight: maxContentHeight, fontSize: "16px", color: adsMidGreyA, lineHeight: "22px" }}>
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
          <Box sx={{ maxHeight: maxContentHeight, fontSize: "16px", color: adsMidGreyA, lineHeight: "22px" }}>
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
          <Box sx={{ maxHeight: maxContentHeight, fontSize: "16px", color: adsMidGreyA, lineHeight: "22px" }}>
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
          <Box sx={{ maxHeight: maxContentHeight, fontSize: "16px", color: adsMidGreyA, lineHeight: "22px" }}>
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
          <Box sx={{ maxHeight: maxContentHeight, fontSize: "16px", color: adsMidGreyA, lineHeight: "22px" }}>
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
          <Box sx={{ maxHeight: maxContentHeight, fontSize: "16px", color: adsMidGreyA, lineHeight: "22px" }}>
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
  }, [variant, recordCount, associatedRecords]);

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      aria-labelledby="confirmation-dialog-title"
      sx={{ padding: "16px 16px 24px 16px", borderRadius: "9px" }}
      onClose={handleCancel}
    >
      <DialogTitle
        id="confirmation-dialog-title"
        sx={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: adsLightGreyC, mb: "8px" }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ fontWeight: 600 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <ADSActionButton variant="close" tooltipTitle="Cancel" tooltipPlacement="bottom" onClick={handleCancel} />
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: theme.palette.background.paper }}>
        {subtitle && (
          <Typography variant="h6" sx={{ paddingBottom: theme.spacing(2) }}>
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
