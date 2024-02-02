/* #region header */
/**************************************************************************************************
//
//  Description: Lookup tables tab
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
//    002   03.11.23 Sean Flook                 Make labels the same within application.
//    003   24.11.23 Sean Flook                 Moved Stack to @mui/system.
//    004   30.11.23 Sean Flook                 Hide items if not required.
//    005   05.01.24 Sean Flook                 Use CSS shortcuts.
//    006   01.02.24 Sean Flook                 Initial changes required for operational districts.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useEffect } from "react";
import SettingsContext from "../context/settingsContext";
import UserContext from "../context/userContext";
import LookupContext from "../context/lookupContext";

import { Grid, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { TreeView, TreeItem } from "@mui/x-tree-view";

import LookupTablesDataForm from "../forms/LookupTablesDataForm";
import DistrictLookupTab from "../tabs/DistrictLookupTab";

import { HasProperties, GetOperationalDistrictUrl } from "../configuration/ADSConfig";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { useTheme } from "@mui/styles";
import { TreeItemStyle } from "../utils/ADSStyles";

function LookupTablesTab() {
  const theme = useTheme();

  const settingsContext = useContext(SettingsContext);
  const userContext = useContext(UserContext);
  const lookupContext = useContext(LookupContext);

  const [districtFormData, setDistrictFormData] = useState(null);

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

  /**
   * Event to handle when the district is closed
   */
  const handleDistrictHomeClick = () => {
    setDistrictFormData(null);
  };

  /**
   * Method to handle updating the operational district data.
   *
   * @param {object} updatedData The updated operational district data.
   */
  const handleDistrictUpdateData = async (updatedData) => {
    if (updatedData) {
      const saveUrl = GetOperationalDistrictUrl("PUT", userContext.currentUser.token);

      if (saveUrl) {
        const saveData = {
          operationalDistrictId: updatedData.operationalDistrictId,
          organisationId: updatedData.organisationId,
          districtName: updatedData.districtName,
          lastUpdateDate: updatedData.lastUpdateDate,
          districtId: updatedData.districtId,
          districtFunction: updatedData.districtFunction,
          districtClosed: updatedData.districtClosed,
          districtFtpServerName: updatedData.districtFtpServerName,
          districtServerIpAddress: updatedData.districtServerIpAddress,
          districtFtpDirectory: updatedData.districtFtpDirectory,
          districtNotificationsUrl: updatedData.districtNotificationsUrl,
          attachmentUrlPrefix: updatedData.attachmentUrlPrefix,
          districtFaxNo: updatedData.districtFaxNo,
          districtPostcode: updatedData.districtPostcode,
          districtTelNo: updatedData.districtTelNo,
          outOfHoursArrangements: updatedData.outOfHoursArrangements,
          fpnDeliveryUrl: updatedData.fpnDeliveryUrl,
          fpnFaxNumber: updatedData.fpnFaxNumber,
          fpnDeliveryPostcode: updatedData.fpnDeliveryPostcode,
          fpnPaymentUrl: updatedData.fpnPaymentUrl,
          fpnPaymentTelNo: updatedData.fpnPaymentTelNo,
          fpnPaymentBankName: updatedData.fpnPaymentBankName,
          fpnPaymentSortCode: updatedData.fpnPaymentSortCode,
          fpnPaymentAccountNo: updatedData.fpnPaymentAccountNo,
          fpnPaymentAccountName: updatedData.fpnPaymentAccountName,
          fpnPaymentPostcode: updatedData.fpnPaymentPostcode,
          fpnContactName: updatedData.fpnContactName,
          fpnContactPostcode: updatedData.fpnContactPostcode,
          fpnContactTelNo: updatedData.fpnContactTelNo,
          districtPostalAddress1: updatedData.districtPostalAddress1,
          districtPostalAddress2: updatedData.districtPostalAddress2,
          districtPostalAddress3: updatedData.districtPostalAddress3,
          districtPostalAddress4: updatedData.districtPostalAddress4,
          districtPostalAddress5: updatedData.districtPostalAddress5,
          fpnDeliveryAddress1: updatedData.fpnDeliveryAddress1,
          fpnDeliveryAddress2: updatedData.fpnDeliveryAddress2,
          fpnDeliveryAddress3: updatedData.fpnDeliveryAddress3,
          fpnDeliveryAddress4: updatedData.fpnDeliveryAddress4,
          fpnDeliveryAddress5: updatedData.fpnDeliveryAddress5,
          fpnContactAddress1: updatedData.fpnContactAddress1,
          fpnContactAddress2: updatedData.fpnContactAddress2,
          fpnContactAddress3: updatedData.fpnContactAddress3,
          fpnContactAddress4: updatedData.fpnContactAddress4,
          fpnContactAddress5: updatedData.fpnContactAddress5,
          fpnPaymentAddress1: updatedData.fpnPaymentAddress1,
          fpnPaymentAddress2: updatedData.fpnPaymentAddress2,
          fpnPaymentAddress3: updatedData.fpnPaymentAddress3,
          fpnPaymentAddress4: updatedData.fpnPaymentAddress4,
          fpnPaymentAddress5: updatedData.fpnPaymentAddress5,
          fpnDeliveryEmailAddress: updatedData.fpnDeliveryEmailAddress,
          districtPermitSchemeId: updatedData.districtPermitSchemeId,
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
            setDistrictFormData(result);
          })
          .catch((res) => {
            switch (res.status) {
              case 400:
                res.json().then((body) => {
                  console.error("[400 ERROR] Updating operational district", body.errors);
                });
                break;

              case 401:
                res.json().then((body) => {
                  console.error("[401 ERROR] Updating operational district", body);
                });
                break;

              case 500:
                console.error("[500 ERROR] Updating operational district", res);
                break;

              default:
                console.error(`[${res.status} ERROR] handleUpdateData - Updating operational district.`, res);
                break;
            }
          });
      }
    }
  };

  /**
   * Method to handle viewing an operational district record.
   *
   * @param {number} id The id of the operational district record the user wants to view.
   */
  const handleViewOperationalDistrict = (id) => {
    const operationalDistrictRecord = lookupContext.currentLookups.operationalDistricts.find(
      (x) => x.operationalDistrictId === id
    );
    if (operationalDistrictRecord)
      setDistrictFormData({
        id: id,
        organisationId: operationalDistrictRecord.organisationId,
        districtName: operationalDistrictRecord.districtName,
        lastUpdateDate: operationalDistrictRecord.lastUpdateDate,
        districtId: operationalDistrictRecord.districtId,
        districtFunction: operationalDistrictRecord.districtFunction,
        districtClosed: operationalDistrictRecord.districtClosed,
        districtFtpServerName: operationalDistrictRecord.districtFtpServerName,
        districtServerIpAddress: operationalDistrictRecord.districtServerIpAddress,
        districtFtpDirectory: operationalDistrictRecord.districtFtpDirectory,
        districtNotificationsUrl: operationalDistrictRecord.districtNotificationsUrl,
        attachmentUrlPrefix: operationalDistrictRecord.attachmentUrlPrefix,
        districtFaxNo: operationalDistrictRecord.districtFaxNo,
        districtPostcode: operationalDistrictRecord.districtPostcode,
        districtTelNo: operationalDistrictRecord.districtTelNo,
        outOfHoursArrangements: operationalDistrictRecord.outOfHoursArrangements,
        fpnDeliveryUrl: operationalDistrictRecord.fpnDeliveryUrl,
        fpnFaxNumber: operationalDistrictRecord.fpnFaxNumber,
        fpnDeliveryPostcode: operationalDistrictRecord.fpnDeliveryPostcode,
        fpnPaymentUrl: operationalDistrictRecord.fpnPaymentUrl,
        fpnPaymentTelNo: operationalDistrictRecord.fpnPaymentTelNo,
        fpnPaymentBankName: operationalDistrictRecord.fpnPaymentBankName,
        fpnPaymentSortCode: operationalDistrictRecord.fpnPaymentSortCode,
        fpnPaymentAccountNo: operationalDistrictRecord.fpnPaymentAccountNo,
        fpnPaymentAccountName: operationalDistrictRecord.fpnPaymentAccountName,
        fpnPaymentPostcode: operationalDistrictRecord.fpnPaymentPostcode,
        fpnContactName: operationalDistrictRecord.fpnContactName,
        fpnContactPostcode: operationalDistrictRecord.fpnContactPostcode,
        fpnContactTelNo: operationalDistrictRecord.fpnContactTelNo,
        districtPostalAddress1: operationalDistrictRecord.districtPostalAddress1,
        districtPostalAddress2: operationalDistrictRecord.districtPostalAddress2,
        districtPostalAddress3: operationalDistrictRecord.districtPostalAddress3,
        districtPostalAddress4: operationalDistrictRecord.districtPostalAddress4,
        districtPostalAddress5: operationalDistrictRecord.districtPostalAddress5,
        fpnDeliveryAddress1: operationalDistrictRecord.fpnDeliveryAddress1,
        fpnDeliveryAddress2: operationalDistrictRecord.fpnDeliveryAddress2,
        fpnDeliveryAddress3: operationalDistrictRecord.fpnDeliveryAddress3,
        fpnDeliveryAddress4: operationalDistrictRecord.fpnDeliveryAddress4,
        fpnDeliveryAddress5: operationalDistrictRecord.fpnDeliveryAddress5,
        fpnContactAddress1: operationalDistrictRecord.fpnContactAddress1,
        fpnContactAddress2: operationalDistrictRecord.fpnContactAddress2,
        fpnContactAddress3: operationalDistrictRecord.fpnContactAddress3,
        fpnContactAddress4: operationalDistrictRecord.fpnContactAddress4,
        fpnContactAddress5: operationalDistrictRecord.fpnContactAddress5,
        fpnPaymentAddress1: operationalDistrictRecord.fpnPaymentAddress1,
        fpnPaymentAddress2: operationalDistrictRecord.fpnPaymentAddress2,
        fpnPaymentAddress3: operationalDistrictRecord.fpnPaymentAddress3,
        fpnPaymentAddress4: operationalDistrictRecord.fpnPaymentAddress4,
        fpnPaymentAddress5: operationalDistrictRecord.fpnPaymentAddress5,
        fpnDeliveryEmailAddress: operationalDistrictRecord.fpnDeliveryEmailAddress,
        districtPermitSchemeId: operationalDistrictRecord.districtPermitSchemeId,
        historic: operationalDistrictRecord.historic,
      });
  };

  useEffect(() => {
    if (!selectedNode) setSelectedNode("POSTCODES");
  }, [selectedNode]);

  return (
    <div>
      {districtFormData ? (
        <DistrictLookupTab
          data={districtFormData}
          onHomeClick={handleDistrictHomeClick}
          onUpdateData={(updatedData) => handleDistrictUpdateData(updatedData)}
        />
      ) : (
        <Grid container justifyContent="flex-start" spacing={0}>
          <Grid item xs={12}>
            <Grid container spacing={0} justifyContent="flex-start">
              <Grid item xs={12} sm={2}>
                <Stack direction="column" spacing={2}>
                  <Typography sx={{ fontSize: 24, flexGrow: 1, pl: theme.spacing(3.5) }}>Lookup tables</Typography>
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
                    {process.env.NODE_ENV === "development" && (
                      <TreeItem
                        nodeId="AUTHORITIES"
                        label={
                          <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                            Authorities
                          </Typography>
                        }
                        sx={TreeItemStyle(selectedNode === "AUTHORITIES")}
                      />
                    )}
                    {!settingsContext.isScottish && HasProperties() && (
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
                    {!settingsContext.isScottish && HasProperties() && (
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
                    {process.env.NODE_ENV === "development" && !settingsContext.isScottish && (
                      <TreeItem
                        nodeId="OPERATIONAL_DISTRICTS"
                        label={
                          <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
                            Districts
                          </Typography>
                        }
                        sx={TreeItemStyle(selectedNode === "OPERATIONAL_DISTRICTS")}
                      />
                    )}
                  </TreeView>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={10}>
                <LookupTablesDataForm nodeId={selectedNode} onViewOperationalDistrict={handleViewOperationalDistrict} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
    </div>
  );
}

export default LookupTablesTab;
