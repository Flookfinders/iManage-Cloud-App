/* #region header */
/**************************************************************************************************
//
//  Description: Property Template tab
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   30.07.21 Sean Flook         WI39??? Initial Revision.
//    002   17.03.23 Sean Flook         WI40578 Added ability to filter templates by templateUseType.
//    003   22.03.23 Sean Flook         WI40598 Close EditPropertyTemplateTab if deleting the template.
//    004   22.03.23 Sean Flook         WI40599 Set tempData in handleUpdateData to ensure the data will be visible.
//    005   06.04.23 Sean Flook         WI40599 Set templateFormData after a successful save.
//    006   27.06.23 Sean Flook         WI40757 Added in deletion confirmation dialog.
//    007   07.09.23 Sean Flook                 Removed unnecessary awaits.
//    008   03.11.23 Sean Flook                 Updated TreeView and TreeItem.
//    009   24.11.23 Sean Flook                 Moved Stack to @mui/system.
//    010   02.01.24 Sean Flook                 Changed console.log to console.error for error messages.
//    011   05.01.24 Sean Flook                 Use CSS shortcuts.
//    012   08.01.24 Joel Benford               Classification and sub locality
//    013   16.01.23 Joel Benford               OS/GP level split
//    014   16.01.24 Sean Flook                 Changes required to fix warnings.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useRef, useEffect } from "react";
import SettingsContext from "../context/settingsContext";
import UserContext from "../context/userContext";

import { Grid, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { TreeView, TreeItem } from "@mui/x-tree-view";
import PropertyTemplatesDataForm from "../forms/PropertyTemplatesDataForm";
import EditPropertyTemplateTab from "./EditPropertyTemplateTab";
import AddTemplateDialog from "../dialogs/AddTemplateDialog";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";

import { GetPropertyTemplatesUrl } from "../configuration/ADSConfig";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { useTheme } from "@mui/styles";
import { TreeItemStyle } from "../utils/ADSStyles";

function PropertyTemplatesTab() {
  const theme = useTheme();

  const settingsContext = useContext(SettingsContext);
  const userContext = useContext(UserContext);

  const [data, setData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [templateFormData, setTemplateFormData] = useState();
  const [duplicateId, setDuplicateId] = useState(null);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const tempData = useRef(null);

  const deletePkId = useRef(null);
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);

  /**
   * Event to handle when a node is selected.
   *
   * @param {object} event The event object.
   * @param {number} nodeId The id for the node that has been selected.
   */
  const handleNodeSelect = (event, nodeId) => {
    event.stopPropagation();
    setSelectedNode(nodeId);
  };

  /**
   * Event to handle adding a new template.
   */
  const handleAddTemplate = () => {
    setDuplicateId(null);
    setShowAddDialog(true);
  };

  /**
   * Event to handle when finished adding a new template.
   *
   * @param {object} newRecord The new template data.
   */
  const handleDoneAddTemplate = async (newRecord) => {
    setDuplicateId(null);
    setShowAddDialog(false);
    if (newRecord) {
      const saveUrl = GetPropertyTemplatesUrl("POST", userContext.currentUser.token);

      const saveData = {
        templateName: newRecord.templateName,
        templateDescription: newRecord.templateDescription,
        templateType: newRecord.templateType,
        templateUseType: newRecord.templateUseType,
        numberingSystem: newRecord.numberingSystem,
        blpuLogicalStatus: newRecord.blpuLogicalStatus,
        rpc: newRecord.rpc,
        state: newRecord.state,
        classification: newRecord.classification,
        lpiLogicalStatus: newRecord.lpiLogicalStatus,
        postTownRef: newRecord.postTownRef,
        subLocalityRef: newRecord.subLocalityRef,
        blpuLevel: newRecord.blpuLevel,
        lpiLevel: newRecord.lpiLevel,
        officialAddressMaker: newRecord.officialAddressMaker,
        postallyAddressable: newRecord.postallyAddressable,
        classificationScheme: newRecord.classificationScheme,
        source: newRecord.source,
        provCode: newRecord.provCode,
        note: newRecord.note,
      };

      // if (process.env.NODE_ENV === "development")
      console.log("[DEBUG] handleDoneAddTemplate", {
        newRecord: newRecord,
        saveUrl: saveUrl,
        saveData: JSON.stringify(saveData),
      });

      if (saveUrl) {
        await fetch(saveUrl.url, {
          headers: saveUrl.headers,
          crossDomain: true,
          method: saveUrl.type,
          body: JSON.stringify(saveData),
        })
          .then((res) => (res.ok ? res : Promise.reject(res)))
          .then((res) => res.json())
          .then((result) => {
            const newData = data.map((x) => x);
            newData.push(result);
            tempData.current = newData;
            settingsContext.onPropertyTemplatesChange(newData);
            // setData(newData);
            handleEditTemplate(result.templatePkId);
          })
          .catch((res) => {
            switch (res.status) {
              case 400:
                res.json().then((body) => {
                  console.error("[400 ERROR] Creating property template", body.errors);
                });
                break;

              case 401:
                res.json().then((body) => {
                  console.error("[401 ERROR] Creating property template", body);
                });
                break;

              case 500:
                console.error("[500 ERROR] Creating property template", res);
                break;

              default:
                console.error(`[${res.status} ERROR] handleDoneAddTemplate - Creating property template.`, res);
                break;
            }
          });
      }
    }
  };

  /**
   * Event to handle closing the add template dialog.
   */
  const handleCloseAddTemplate = () => {
    setDuplicateId(null);
    setShowAddDialog(false);
  };

  /**
   * Event to handle editing an existing template.
   *
   * @param {number} pkId The id of the template to be edited.
   */
  const handleEditTemplate = (pkId) => {
    const templateRecord = tempData.current
      ? tempData.current.find((x) => x.templatePkId === pkId)
      : data.find((x) => x.templatePkId === pkId);

    if (templateRecord) setTemplateFormData(templateRecord);
    else setTemplateFormData(null);
  };

  /**
   * Event to handle updating a template after it has been edited.
   *
   * @param {object} updatedData The updated template data.
   */
  const handleUpdateData = async (updatedData) => {
    if (updatedData) {
      const saveUrl = GetPropertyTemplatesUrl("PUT", userContext.currentUser.token);

      if (saveUrl) {
        const saveData = {
          templatePkId: updatedData.templatePkId,
          templateName: updatedData.templateName,
          templateDescription: updatedData.templateDescription,
          templateType: updatedData.templateType,
          templateUseType: updatedData.templateUseType,
          numberingSystem: updatedData.numberingSystem,
          blpuTemplatePkId: updatedData.blpuTemplatePkId,
          blpuLogicalStatus: updatedData.blpuLogicalStatus,
          blpuLevel: updatedData.blpuLevel,
          rpc: updatedData.rpc,
          state: updatedData.state,
          classification: updatedData.classification,
          classificationScheme: updatedData.classificationScheme,
          lpiTemplatePkId: updatedData.lpiTemplatePkId,
          lpiLogicalStatus: updatedData.lpiLogicalStatus,
          postTownRef: updatedData.postTownRef,
          subLocalityRef: updatedData.subLocalityRef,
          lpiLevel: updatedData.lpiLevel,
          officialAddressMaker: updatedData.officialAddressMaker,
          postallyAddressable: updatedData.postallyAddressable,
          miscTemplatePkId: updatedData.miscTemplatePkId,
          source: updatedData.source,
          provCode: updatedData.provCode,
          note: updatedData.note,
        };

        // if (process.env.NODE_ENV === "development")
        console.log("[DEBUG] handleUpdateData", updatedData, saveData, saveUrl, JSON.stringify(saveData));

        await fetch(saveUrl.url, {
          headers: saveUrl.headers,
          crossDomain: true,
          method: saveUrl.type,
          body: JSON.stringify(saveData),
        })
          .then((res) => (res.ok ? res : Promise.reject(res)))
          .then((res) => res.json())
          .then((result) => {
            const newData = data.map((x) => [result].find((rec) => rec.templatePkId === x.templatePkId) || x);
            tempData.current = newData;
            setTemplateFormData(result);
            settingsContext.onPropertyTemplatesChange(newData);
          })
          .catch((res) => {
            switch (res.status) {
              case 400:
                res.json().then((body) => {
                  console.error("[400 ERROR] Updating property template", body.errors);
                });
                break;

              case 401:
                res.json().then((body) => {
                  console.error("[401 ERROR] Updating property template", body);
                });
                break;

              case 500:
                console.error("[500 ERROR] Updating property template", res);
                break;

              default:
                console.error(`[${res.status} ERROR] handleUpdateData - Updating property template.`, res);
                break;
            }
          });
      }
    }
  };

  /**
   * Event to duplicate an existing template.
   *
   * @param {number} pkId The id of the template that needs to be duplicated.
   */
  const handleDuplicateTemplate = (pkId) => {
    setDuplicateId(pkId);
    setShowAddDialog(true);
  };

  /**
   * Event to handle deleting a template.
   *
   * @param {number} pkId The id of the template to be deleted.
   */
  const handleDeleteTemplate = (pkId) => {
    deletePkId.current = pkId;
    setOpenDeleteConfirmation(true);
  };

  /**
   * Event to handle when the delete confirmation dialog is closed.
   *
   * @param {boolean} deleteConfirmed True if the user has confirmed the delete; otherwise false.
   */
  const handleCloseDeleteConfirmation = async (deleteConfirmed) => {
    setOpenDeleteConfirmation(false);
    if (deleteConfirmed && deletePkId.current) {
      const deleteUrl = GetPropertyTemplatesUrl("DELETE", userContext.currentUser.token);
      if (deleteUrl) {
        await fetch(`${deleteUrl.url}/${deletePkId.current}`, {
          headers: deleteUrl.headers,
          crossDomain: true,
          method: deleteUrl.type,
        })
          .then((res) => (res.ok ? res : Promise.reject(res)))
          .then((res) => res.json())
          .then((result) => {
            const newData = data.filter((x) => x.templatePkId !== deletePkId.current);
            settingsContext.onPropertyTemplatesChange(newData);
            setTemplateFormData(null);
          })
          .catch((res) => {
            console.error("[ERROR] Deleting property template - response", res);
          });
      }
    }
  };

  /**
   * Event to handle when the home button is clicked.
   */
  const doHomeClick = () => {
    setTemplateFormData(null);
  };

  useEffect(() => {
    if (!selectedNode) setSelectedNode("ALL");
  }, [selectedNode]);

  useEffect(() => {
    if (settingsContext.propertyTemplates) setData(settingsContext.propertyTemplates);

    return () => {};
  }, [settingsContext.propertyTemplates]);

  return (
    <div>
      {templateFormData ? (
        <EditPropertyTemplateTab
          data={templateFormData}
          onHomeClick={doHomeClick}
          onUpdateData={(updatedData) => handleUpdateData(updatedData)}
          onDuplicateClick={(pkId) => handleDuplicateTemplate(pkId)}
          onDeleteClick={(pkId) => handleDeleteTemplate(pkId)}
        />
      ) : (
        <Grid container justifyContent="flex-start" spacing={0}>
          <Grid item xs={12}>
            <Grid container spacing={0} justifyContent="flex-start">
              <Grid item xs={12} sm={2}>
                <Stack direction="column" spacing={2}>
                  <Typography sx={{ fontSize: 24, flexGrow: 1, pl: theme.spacing(3.5) }}>Property templates</Typography>
                  <TreeView
                    aria-label="property templates navigator"
                    defaultCollapseIcon={<ExpandMoreIcon />}
                    defaultExpandIcon={<ChevronRightIcon />}
                    defaultSelected={"ALL"}
                    selected={selectedNode}
                    sx={{ overflowY: "auto" }}
                    onNodeSelect={handleNodeSelect}
                  >
                    <TreeItem
                      nodeId="ALL"
                      label={
                        <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                          All templates
                        </Typography>
                      }
                      sx={TreeItemStyle(selectedNode === "ALL")}
                    >
                      <TreeItem
                        nodeId="ALL-SINGLE-PROPERTY"
                        label={
                          <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                            Single property
                          </Typography>
                        }
                        sx={TreeItemStyle(selectedNode === "ALL-SINGLE-PROPERTY")}
                      />
                      <TreeItem
                        nodeId="ALL-RANGE-PROPERTIES"
                        label={
                          <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                            Range of properties
                          </Typography>
                        }
                        sx={TreeItemStyle(selectedNode === "ALL-RANGE-PROPERTIES")}
                      />
                      <TreeItem
                        nodeId="ALL-SINGLE-CHILD"
                        label={
                          <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                            Single child
                          </Typography>
                        }
                        sx={TreeItemStyle(selectedNode === "ALL-SINGLE-CHILD")}
                      />
                      <TreeItem
                        nodeId="ALL-RANGE-CHILDREN"
                        label={
                          <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                            Range of children
                          </Typography>
                        }
                        sx={TreeItemStyle(selectedNode === "ALL-RANGE-CHILDREN")}
                      />
                    </TreeItem>
                    <TreeItem
                      nodeId="LIBRARY"
                      label={
                        <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                          Library templates
                        </Typography>
                      }
                      sx={TreeItemStyle(selectedNode === "LIBRARY")}
                    >
                      <TreeItem
                        nodeId="LIBRARY-SINGLE-PROPERTY"
                        label={
                          <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                            Single property
                          </Typography>
                        }
                        sx={TreeItemStyle(selectedNode === "LIBRARY-SINGLE-PROPERTY")}
                      />
                      <TreeItem
                        nodeId="LIBRARY-RANGE-PROPERTIES"
                        label={
                          <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                            Range of properties
                          </Typography>
                        }
                        sx={TreeItemStyle(selectedNode === "LIBRARY-RANGE-PROPERTIES")}
                      />
                      <TreeItem
                        nodeId="LIBRARY-SINGLE-CHILD"
                        label={
                          <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                            Single child
                          </Typography>
                        }
                        sx={TreeItemStyle(selectedNode === "LIBRARY-SINGLE-CHILD")}
                      />
                      <TreeItem
                        nodeId="LIBRARY-RANGE-CHILDREN"
                        label={
                          <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                            Range of children
                          </Typography>
                        }
                        sx={TreeItemStyle(selectedNode === "LIBRARY-RANGE-CHILDREN")}
                      />
                    </TreeItem>
                    <TreeItem
                      nodeId="USER"
                      label={
                        <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                          User templates
                        </Typography>
                      }
                      sx={TreeItemStyle(selectedNode === "USER")}
                    >
                      <TreeItem
                        nodeId="USER-SINGLE-PROPERTY"
                        label={
                          <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                            Single property
                          </Typography>
                        }
                        sx={TreeItemStyle(selectedNode === "USER-SINGLE-PROPERTY")}
                      />
                      <TreeItem
                        nodeId="USER-RANGE-PROPERTIES"
                        label={
                          <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                            Range of properties
                          </Typography>
                        }
                        sx={TreeItemStyle(selectedNode === "USER-RANGE-PROPERTIES")}
                      />
                      <TreeItem
                        nodeId="USER-SINGLE-CHILD"
                        label={
                          <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                            Single child
                          </Typography>
                        }
                        sx={TreeItemStyle(selectedNode === "USER-SINGLE-CHILD")}
                      />
                      <TreeItem
                        nodeId="USER-RANGE-CHILDREN"
                        label={
                          <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                            Range of children
                          </Typography>
                        }
                        sx={TreeItemStyle(selectedNode === "USER-RANGE-CHILDREN")}
                      />
                    </TreeItem>
                  </TreeView>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={10}>
                <PropertyTemplatesDataForm
                  nodeId={selectedNode}
                  data={data}
                  onAddTemplate={handleAddTemplate}
                  onEditTemplate={(pkId) => handleEditTemplate(pkId)}
                  onDuplicateTemplate={(pkId) => handleDuplicateTemplate(pkId)}
                  onDeleteTemplate={(pkId) => handleDeleteTemplate(pkId)}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
      <AddTemplateDialog
        isOpen={showAddDialog}
        templates={data ? data : []}
        duplicateId={duplicateId}
        onDone={(data) => handleDoneAddTemplate(data)}
        onClose={handleCloseAddTemplate}
      />
      <ConfirmDeleteDialog
        variant="property template"
        open={openDeleteConfirmation}
        onClose={handleCloseDeleteConfirmation}
      />
    </div>
  );
}

export default PropertyTemplatesTab;
