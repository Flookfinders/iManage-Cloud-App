//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Property Template tab
//
//  Copyright:    © 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//region Version 1.0.0.0
//    001   30.07.21 Sean Flook          WI39??? Initial Revision.
//    002   17.03.23 Sean Flook          WI40578 Added ability to filter templates by templateUseType.
//    003   22.03.23 Sean Flook          WI40598 Close EditPropertyTemplateTab if deleting the template.
//    004   22.03.23 Sean Flook          WI40599 Set tempData in handleUpdateData to ensure the data will be visible.
//    005   06.04.23 Sean Flook          WI40599 Set templateFormData after a successful save.
//    006   27.06.23 Sean Flook          WI40757 Added in deletion confirmation dialog.
//    007   07.09.23 Sean Flook                  Removed unnecessary awaits.
//    008   03.11.23 Sean Flook                  Updated TreeView and TreeItem.
//    009   24.11.23 Sean Flook                  Moved Stack to @mui/system.
//    010   02.01.24 Sean Flook                  Changed console.log to console.error for error messages.
//    011   05.01.24 Sean Flook                  Use CSS shortcuts.
//    012   08.01.24 Joel Benford                Classification and sub locality
//    013   16.01.23 Joel Benford                OS/GP level split
//    014   16.01.24 Sean Flook                  Changes required to fix warnings.
//    015   20.02.24 Sean Flook                  Default blpuLevel to 0 if null when saving.
//    016   08.05.24 Sean Flook        IMANN-447 Added exclude from export and site visit to the options of fields that can be edited.
//    017   19.06.24 Sean Flook        IMANN-629 Changes to code so that current user is remembered and a 401 error displays the login dialog.
//    018   26.06.24 Joel Benford                Null never export and site visit -> false on save, string lpiLevel if Scottish
//    019   10.09.24 Sean Flook        IMANN-980 Only write to the console if the user has the showMessages right.
//endregion Version 1.0.0.0
//region Version 1.0.5.0
//    020   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//    021   30.01.25 Sean Flook       IMANN-1673 Changes required for new user settings API.
//endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//endregion header

import React, { useContext, useState, useRef, useEffect } from "react";
import SettingsContext from "../context/settingsContext";
import UserContext from "../context/userContext";

import { Grid2, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";
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

  const [updateError, setUpdateError] = useState(null);

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
      const saveUrl = GetPropertyTemplatesUrl("POST", userContext.currentUser);

      const saveData = {
        templateName: newRecord.templateName,
        templateDescription: newRecord.templateDescription,
        templateType: newRecord.templateType,
        templateUseType: newRecord.templateUseType,
        numberingSystem: newRecord.numberingSystem,
        blpuLogicalStatus: newRecord.blpuLogicalStatus,
        rpc: newRecord.rpc,
        state: newRecord.state,
        excludeFromExport: newRecord.excludeFromExport || false,
        siteVisit: newRecord.siteVisit || false,
        classification: newRecord.classification,
        lpiLogicalStatus: newRecord.lpiLogicalStatus,
        postTownRef: newRecord.postTownRef,
        subLocalityRef: newRecord.subLocalityRef,
        blpuLevel: newRecord.blpuLevel ? newRecord.blpuLevel : 0,
        lpiLevel: settingsContext.isScottish ? "" : newRecord.lpiLevel,
        officialAddressMaker: newRecord.officialAddressMaker,
        postallyAddressable: newRecord.postallyAddressable,
        classificationScheme: newRecord.classificationScheme,
        source: newRecord.source,
        provCode: newRecord.provCode,
        note: newRecord.note,
      };

      if (userContext.currentUser.showMessages)
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
                  if (userContext.currentUser.showMessages)
                    console.error("[400 ERROR] Creating property template", body.errors);
                });
                break;

              case 401:
                userContext.onExpired();
                break;

              case 500:
                if (userContext.currentUser.showMessages) console.error("[500 ERROR] Creating property template", res);
                break;

              default:
                if (userContext.currentUser.showMessages)
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
    setUpdateError(null);

    if (updatedData) {
      const saveUrl = GetPropertyTemplatesUrl("PUT", userContext.currentUser);

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
          blpuLevel: updatedData.blpuLevel ? updatedData.blpuLevel : 0,
          rpc: updatedData.rpc,
          state: updatedData.state,
          excludeFromExport: updatedData.excludeFromExport || false,
          siteVisit: updatedData.siteVisit || false,
          classification: updatedData.classification,
          classificationScheme: updatedData.classificationScheme,
          lpiTemplatePkId: updatedData.lpiTemplatePkId,
          lpiLogicalStatus: updatedData.lpiLogicalStatus,
          postTownRef: updatedData.postTownRef,
          subLocalityRef: updatedData.subLocalityRef,
          lpiLevel: settingsContext.isScottish ? "" : updatedData.lpiLevel,
          officialAddressMaker: updatedData.officialAddressMaker,
          postallyAddressable: updatedData.postallyAddressable,
          miscTemplatePkId: updatedData.miscTemplatePkId,
          source: updatedData.source,
          provCode: updatedData.provCode,
          note: updatedData.note,
        };

        if (userContext.currentUser.showMessages)
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
                  if (userContext.currentUser.showMessages)
                    console.error("[400 ERROR] Updating property template", body.errors);
                });
                break;

              case 401:
                useContext.onExpired();
                break;

              case 403:
                setUpdateError("You do not have authorisation to update this template");
                break;

              case 500:
                res.json().then((body) => {
                  if (process.env.NODE_ENV === "development")
                    setUpdateError(`ERROR: ${body[0].errorTitle} - ${body[0].errorDescription}`);
                  if (userContext.currentUser.showMessages)
                    console.error(
                      `[500 ERROR] Updating street template - ${body[0].errorTitle}: ${body[0].errorDescription}`
                    );
                });
                break;

              default:
                if (userContext.currentUser.showMessages)
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
      const deleteUrl = GetPropertyTemplatesUrl("DELETE", userContext.currentUser);
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
            if (res.status && res.status === 401) {
              userContext.onExpired();
            } else {
              if (userContext.currentUser.showMessages)
                console.error("[ERROR] Deleting property template - response", res);
            }
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
          error={updateError}
          onHomeClick={doHomeClick}
          onUpdateData={(updatedData) => handleUpdateData(updatedData)}
          onDuplicateClick={(pkId) => handleDuplicateTemplate(pkId)}
          onDeleteClick={(pkId) => handleDeleteTemplate(pkId)}
        />
      ) : (
        <Grid2 container justifyContent="flex-start" spacing={0}>
          <Grid2 size={12}>
            <Grid2 container spacing={0} justifyContent="flex-start">
              <Grid2 size={2}>
                <Stack direction="column" spacing={2}>
                  <Typography sx={{ fontSize: 24, flexGrow: 1, pl: theme.spacing(3.5) }}>Property templates</Typography>
                  <SimpleTreeView
                    aria-label="property templates navigator"
                    defaultSelectedItems={"ALL"}
                    selectedItems={selectedNode}
                    slots={{ expandIcon: ChevronRightIcon, collapseIcon: ExpandMoreIcon }}
                    sx={{ overflowY: "auto" }}
                    onSelectedItemsChange={handleNodeSelect}
                  >
                    <TreeItem
                      itemId="ALL"
                      label={
                        <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                          All templates
                        </Typography>
                      }
                      sx={TreeItemStyle(selectedNode === "ALL")}
                    >
                      <TreeItem
                        itemId="ALL-SINGLE-PROPERTY"
                        label={
                          <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                            Single property
                          </Typography>
                        }
                        sx={TreeItemStyle(selectedNode === "ALL-SINGLE-PROPERTY")}
                      />
                      <TreeItem
                        itemId="ALL-RANGE-PROPERTIES"
                        label={
                          <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                            Range of properties
                          </Typography>
                        }
                        sx={TreeItemStyle(selectedNode === "ALL-RANGE-PROPERTIES")}
                      />
                      <TreeItem
                        itemId="ALL-SINGLE-CHILD"
                        label={
                          <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                            Single child
                          </Typography>
                        }
                        sx={TreeItemStyle(selectedNode === "ALL-SINGLE-CHILD")}
                      />
                      <TreeItem
                        itemId="ALL-RANGE-CHILDREN"
                        label={
                          <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                            Range of children
                          </Typography>
                        }
                        sx={TreeItemStyle(selectedNode === "ALL-RANGE-CHILDREN")}
                      />
                    </TreeItem>
                    <TreeItem
                      itemId="LIBRARY"
                      label={
                        <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                          Library templates
                        </Typography>
                      }
                      sx={TreeItemStyle(selectedNode === "LIBRARY")}
                    >
                      <TreeItem
                        itemId="LIBRARY-SINGLE-PROPERTY"
                        label={
                          <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                            Single property
                          </Typography>
                        }
                        sx={TreeItemStyle(selectedNode === "LIBRARY-SINGLE-PROPERTY")}
                      />
                      <TreeItem
                        itemId="LIBRARY-RANGE-PROPERTIES"
                        label={
                          <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                            Range of properties
                          </Typography>
                        }
                        sx={TreeItemStyle(selectedNode === "LIBRARY-RANGE-PROPERTIES")}
                      />
                      <TreeItem
                        itemId="LIBRARY-SINGLE-CHILD"
                        label={
                          <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                            Single child
                          </Typography>
                        }
                        sx={TreeItemStyle(selectedNode === "LIBRARY-SINGLE-CHILD")}
                      />
                      <TreeItem
                        itemId="LIBRARY-RANGE-CHILDREN"
                        label={
                          <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                            Range of children
                          </Typography>
                        }
                        sx={TreeItemStyle(selectedNode === "LIBRARY-RANGE-CHILDREN")}
                      />
                    </TreeItem>
                    <TreeItem
                      itemId="USER"
                      label={
                        <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                          User templates
                        </Typography>
                      }
                      sx={TreeItemStyle(selectedNode === "USER")}
                    >
                      <TreeItem
                        itemId="USER-SINGLE-PROPERTY"
                        label={
                          <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                            Single property
                          </Typography>
                        }
                        sx={TreeItemStyle(selectedNode === "USER-SINGLE-PROPERTY")}
                      />
                      <TreeItem
                        itemId="USER-RANGE-PROPERTIES"
                        label={
                          <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                            Range of properties
                          </Typography>
                        }
                        sx={TreeItemStyle(selectedNode === "USER-RANGE-PROPERTIES")}
                      />
                      <TreeItem
                        itemId="USER-SINGLE-CHILD"
                        label={
                          <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                            Single child
                          </Typography>
                        }
                        sx={TreeItemStyle(selectedNode === "USER-SINGLE-CHILD")}
                      />
                      <TreeItem
                        itemId="USER-RANGE-CHILDREN"
                        label={
                          <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                            Range of children
                          </Typography>
                        }
                        sx={TreeItemStyle(selectedNode === "USER-RANGE-CHILDREN")}
                      />
                    </TreeItem>
                  </SimpleTreeView>
                </Stack>
              </Grid2>
              <Grid2 size={10}>
                <PropertyTemplatesDataForm
                  nodeId={selectedNode}
                  data={data}
                  onAddTemplate={handleAddTemplate}
                  onEditTemplate={(pkId) => handleEditTemplate(pkId)}
                  onDuplicateTemplate={(pkId) => handleDuplicateTemplate(pkId)}
                  onDeleteTemplate={(pkId) => handleDeleteTemplate(pkId)}
                />
              </Grid2>
            </Grid2>
          </Grid2>
        </Grid2>
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
