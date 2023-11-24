/* #region header */
/**************************************************************************************************
//
//  Description: Lookup tables tab
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
//    002   03.11.23 Sean Flook                 Make labels the same within application.
//    003   24.11.23 Sean Flook                 Moved Stack to @mui/system.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useEffect } from "react";
import SettingsContext from "../context/settingsContext";

import { Grid, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { TreeView, TreeItem } from "@mui/x-tree-view";
import LookupTablesDataForm from "../forms/LookupTablesDataForm";

import { HasProperties } from "../configuration/ADSConfig";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { useTheme } from "@mui/styles";
import { TreeItemStyle } from "../utils/ADSStyles";

function LookupTablesTab() {
  const theme = useTheme();

  const settingsContext = useContext(SettingsContext);

  const [selectedNode, setSelectedNode] = useState(null);

  /**
   * Event to handle when a node is selected.
   *
   * @param {object} event The event object.
   * @param {number} nodeId The node id.
   */
  const handleNodeSelect = (event, nodeId) => {
    event.stopPropagation();
    setSelectedNode(nodeId);
  };

  useEffect(() => {
    if (!selectedNode) setSelectedNode("POSTCODES");
  }, [selectedNode]);

  return (
    <div>
      <Grid container justifyContent="flex-start" spacing={0}>
        <Grid item xs={12}>
          <Grid container spacing={0} justifyContent="flex-start">
            <Grid item xs={12} sm={2}>
              <Stack direction="column" spacing={2}>
                <Typography sx={{ fontSize: 24, flexGrow: 1, paddingLeft: theme.spacing(3.5) }}>
                  Lookup tables
                </Typography>
                <TreeView
                  aria-label="settings navigator"
                  defaultCollapseIcon={<ExpandMoreIcon />}
                  defaultExpandIcon={<ChevronRightIcon />}
                  defaultSelected={"POSTCODES"}
                  selected={selectedNode}
                  sx={{ overflowY: "auto" }}
                  onNodeSelect={handleNodeSelect}
                >
                  {HasProperties() && (
                    <TreeItem
                      nodeId="POSTCODES"
                      label={
                        <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                          Postcodes
                        </Typography>
                      }
                      sx={TreeItemStyle(selectedNode === "POSTCODES")}
                    />
                  )}
                  {HasProperties() && settingsContext.isScottish && (
                    <TreeItem
                      nodeId="SUB_LOCALITIES"
                      label={
                        <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                          Sub-localities
                        </Typography>
                      }
                      sx={TreeItemStyle(selectedNode === "SUB_LOCALITIES")}
                    />
                  )}
                  {HasProperties() && (
                    <TreeItem
                      nodeId="POST_TOWNS"
                      label={
                        <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                          Post towns
                        </Typography>
                      }
                      sx={TreeItemStyle(selectedNode === "POST_TOWNS")}
                    />
                  )}
                  {HasProperties() && (
                    <TreeItem
                      nodeId="CROSS_REFERENCES"
                      label={
                        <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                          Cross references
                        </Typography>
                      }
                      sx={TreeItemStyle(selectedNode === "CROSS_REFERENCES")}
                    />
                  )}
                  <TreeItem
                    nodeId="LOCALITIES"
                    label={
                      <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                        Localities
                      </Typography>
                    }
                    sx={TreeItemStyle(selectedNode === "LOCALITIES")}
                  />
                  <TreeItem
                    nodeId="TOWNS"
                    label={
                      <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                        Towns
                      </Typography>
                    }
                    sx={TreeItemStyle(selectedNode === "TOWNS")}
                  />
                  {settingsContext.isScottish && (
                    <TreeItem
                      nodeId="ISLANDS"
                      label={
                        <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                          Islands
                        </Typography>
                      }
                      sx={TreeItemStyle(selectedNode === "ISLANDS")}
                    />
                  )}
                  <TreeItem
                    nodeId="ADMINISTRATIVE_AREAS"
                    label={
                      <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                        Administrative areas
                      </Typography>
                    }
                    sx={TreeItemStyle(selectedNode === "ADMINISTRATIVE_AREAS")}
                  />
                  <TreeItem
                    nodeId="AUTHORITIES"
                    label={
                      <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                        Authorities
                      </Typography>
                    }
                    sx={TreeItemStyle(selectedNode === "AUTHORITIES")}
                  />
                  {HasProperties() && (
                    <TreeItem
                      nodeId="WARDS"
                      label={
                        <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                          Wards
                        </Typography>
                      }
                      sx={TreeItemStyle(selectedNode === "WARDS")}
                    />
                  )}
                  {HasProperties() && (
                    <TreeItem
                      nodeId="PARISHES"
                      label={
                        <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                          Parishes
                        </Typography>
                      }
                      sx={TreeItemStyle(selectedNode === "PARISHES")}
                    />
                  )}
                </TreeView>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={10}>
              <LookupTablesDataForm nodeId={selectedNode} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}

export default LookupTablesTab;
