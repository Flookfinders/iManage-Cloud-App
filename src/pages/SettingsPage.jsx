/* #region header */
/**************************************************************************************************
//
//  Description: Settings page
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
//    002   06.10.23 Sean Flook                 Use colour variables.
//    003   03.11.23 Sean Flook                 Updated TreeView and TreeItem.
//    004   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system.
//    005   30.11.23 Sean Flook                 Hide items that have not been developed yet.
//    006   24.01.24 Joel Benford               Add scottish metadata to tree.
//    007   22.03.24 Sean Flook           GLB12 Changed to use dataFormStyle so height can be correctly set.
//    008   18.04.24 Sean Flook       IMANN-351 Changes required to reload the contexts after a refresh.
//    009   20.06.24 Sean Flook       IMANN-636 Use the new user rights.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useEffect, useState, useContext } from "react";
import SettingsContext from "../context/settingsContext";
import UserContext from "../context/userContext";

import { Grid, Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { TreeView, TreeItem } from "@mui/x-tree-view";
import SettingsDataForm from "../forms/SettingsDataForm";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";

import { TreeItemStyle, dataFormStyle } from "../utils/ADSStyles";

function SettingsPage() {
  const settingsContext = useContext(SettingsContext);
  const userContext = useContext(UserContext);

  const [selectedNode, setSelectedNode] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState([]);
  const [defaultExpandedNode, setDefaultExpandedNode] = useState([]);
  const [defaultSelectedNode, setDefaultSelectedNode] = useState(null);
  const [reloadContexts, setReloadContexts] = useState(false);

  const [hasASD, setHasASD] = useState(false);
  const [hasProperty, setHasProperty] = useState(false);

  /**
   * Event to handle when a node is selected.
   *
   * @param {object} event The event object.
   * @param {number} nodeId The id of the node.
   */
  const handleNodeSelect = (event, nodeId) => {
    setSelectedNode(nodeId);
    settingsContext.onNodeChange(nodeId);
  };

  /**
   * Event to handle toggling the nodes.
   *
   * @param {object} event The event object.
   * @param {Array} nodeIds The list of node ids.
   */
  const handleNodeToggle = (event, nodeIds) => {
    setExpandedNodes(nodeIds);
  };

  useEffect(() => {
    if (sessionStorage.getItem("SettingsPage_firstLoadDone") === null) {
      sessionStorage.setItem("SettingsPage_firstLoadDone", 1);
    } else {
      setReloadContexts(true);
    }
  }, []);

  useEffect(() => {
    if (reloadContexts) {
      setReloadContexts(false);
      settingsContext.onReload();
    }
  }, [reloadContexts, settingsContext]);

  useEffect(() => {
    if (settingsContext.currentSettingsNode && !selectedNode) {
      const expandedNodes = [];
      expandedNodes.push(settingsContext.currentSettingsNode.charAt(0));
      setDefaultExpandedNode(expandedNodes);
      setExpandedNodes(expandedNodes);
      setDefaultSelectedNode(settingsContext.currentSettingsNode);
      setSelectedNode(settingsContext.currentSettingsNode);
    }
  }, [settingsContext, selectedNode]);

  useEffect(() => {
    setHasASD(userContext.currentUser && userContext.currentUser.hasASD);
    setHasProperty(userContext.currentUser && userContext.currentUser.hasProperty);
  }, [userContext]);

  return (
    <div>
      <Grid container justifyContent="flex-start" spacing={0}>
        <Grid item xs={12}>
          <Grid container spacing={0} justifyContent="flex-start">
            <Grid item xs={12} sm={2}>
              <Box sx={dataFormStyle("SettingsPage")}>
                <TreeView
                  aria-label="settings navigator"
                  defaultCollapseIcon={<ExpandMoreIcon />}
                  defaultExpandIcon={<ChevronRightIcon />}
                  defaultExpanded={defaultExpandedNode}
                  defaultSelected={defaultSelectedNode}
                  expanded={expandedNodes}
                  selected={selectedNode}
                  sx={{ overflowY: "auto" }}
                  onNodeSelect={handleNodeSelect}
                  onNodeToggle={handleNodeToggle}
                >
                  <TreeItem
                    nodeId="1"
                    label={
                      <Stack direction="row" spacing={1}>
                        <SettingsOutlinedIcon sx={{ color: "inherit" }} />
                        <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                          General
                        </Typography>
                      </Stack>
                    }
                    sx={TreeItemStyle(false)}
                  >
                    <TreeItem
                      nodeId="1.1"
                      label={
                        <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                          Authority details
                        </Typography>
                      }
                      sx={TreeItemStyle(selectedNode === "1.1")}
                    />
                    {!settingsContext.isScottish && hasProperty && (
                      <TreeItem
                        nodeId="1.2"
                        label={
                          <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                            Property metadata
                          </Typography>
                        }
                        sx={TreeItemStyle(selectedNode === "1.2")}
                      />
                    )}
                    {!settingsContext.isScottish && (
                      <TreeItem
                        nodeId="1.3"
                        label={
                          <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                            Street metadata
                          </Typography>
                        }
                        sx={TreeItemStyle(selectedNode === "1.3")}
                      />
                    )}
                    {!settingsContext.isScottish && hasASD && (
                      <TreeItem
                        nodeId="1.4"
                        label={
                          <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                            ASD metadata
                          </Typography>
                        }
                        sx={TreeItemStyle(selectedNode === "1.4")}
                      />
                    )}
                    {settingsContext.isScottish && (
                      <TreeItem
                        nodeId="1.5"
                        label={
                          <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                            Gazetteer metadata
                          </Typography>
                        }
                        sx={TreeItemStyle(selectedNode === "1.5")}
                      />
                    )}
                  </TreeItem>
                  <TreeItem
                    nodeId="2"
                    label={
                      <Stack direction="row" spacing={1}>
                        <BuildOutlinedIcon sx={{ color: "inherit" }} />
                        <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                          Customisation
                        </Typography>
                      </Stack>
                    }
                    sx={TreeItemStyle(false)}
                  >
                    {hasProperty && (
                      <TreeItem
                        nodeId="2.1"
                        label={
                          <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                            Property templates
                          </Typography>
                        }
                        sx={TreeItemStyle(selectedNode === "2.1")}
                      />
                    )}
                    <TreeItem
                      nodeId="2.2"
                      label={
                        <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                          Street template
                        </Typography>
                      }
                      sx={TreeItemStyle(selectedNode === "2.2")}
                    />
                    {hasASD && (
                      <TreeItem
                        nodeId="2.3"
                        label={
                          <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                            ASD template
                          </Typography>
                        }
                        sx={TreeItemStyle(selectedNode === "2.3")}
                      />
                    )}
                    <TreeItem
                      nodeId="2.4"
                      label={
                        <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                          Lookup tables
                        </Typography>
                      }
                      sx={TreeItemStyle(selectedNode === "2.4")}
                    />
                    <TreeItem
                      nodeId="2.5"
                      label={
                        <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                          Map layers
                        </Typography>
                      }
                      sx={TreeItemStyle(selectedNode === "2.5")}
                    />
                    {process.env.NODE_ENV === "development" && (
                      <TreeItem
                        nodeId="2.6"
                        label={
                          <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                            Bookmarks
                          </Typography>
                        }
                        sx={TreeItemStyle(selectedNode === "2.6")}
                      />
                    )}
                  </TreeItem>
                  {process.env.NODE_ENV === "development" && (
                    <TreeItem
                      nodeId="3.0"
                      label={
                        <Stack direction="row" spacing={1}>
                          <PeopleOutlineIcon sx={{ color: "inherit" }} />
                          <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                            Users and permissions
                          </Typography>
                        </Stack>
                      }
                      sx={TreeItemStyle(selectedNode === "3.0")}
                    />
                  )}
                </TreeView>
              </Box>
            </Grid>
            <Grid item xs={12} sm={10}>
              <SettingsDataForm nodeId={selectedNode} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}

export default SettingsPage;
