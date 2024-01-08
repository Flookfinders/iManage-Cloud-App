/* #region header */
/**************************************************************************************************
//
//  Description: Settings data form
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
//    002   24.11.23 Sean Flook                 Moved Box to @mui/system.
//    003   05.01.24 Sean Flook                 Changes to sort out warnings.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Box } from "@mui/system";
import AuthorityDetailsSettingsTab from "../tabs/AuthorityDetailsSettingsTab";
import MetadataSettingsTab from "../tabs/MetadataSettingsTab";
import PropertyTemplatesTab from "../tabs/PropertyTemplatesTab";
import StreetTemplateTab from "../tabs/StreetTemplateTab";
import AsdTemplateTab from "../tabs/AsdTemplateTab";
import LookupTablesTab from "../tabs/LookupTablesTab";
import MapLayersTab from "../tabs/MapLayersTab";
import BookmarkSettingsTab from "../tabs/BookmarkSettingsTab";
import UserSettingsTab from "../tabs/UserSettingsTab";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`setting-tabpanel-${index}`}
      aria-labelledby={`setting-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function SettingsDataForm({ nodeId }) {
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    switch (nodeId) {
      case "1.1": // Authority details
        setCurrentTab(11);
        break;

      case "1.2": // Property metadata
        setCurrentTab(12);
        break;

      case "1.3": // Street metadata
        setCurrentTab(13);
        break;

      case "1.4": // ASD metadata
        setCurrentTab(14);
        break;

      case "2.1": // Property templates
        setCurrentTab(21);
        break;

      case "2.2": // Street template
        setCurrentTab(22);
        break;

      case "2.3": // ASD template
        setCurrentTab(23);
        break;

      case "2.4": // Lookup tables
        setCurrentTab(24);
        break;

      case "2.5": // Map layers
        setCurrentTab(25);
        break;

      case "2.6": // Bookmarks
        setCurrentTab(26);
        break;

      case "3.0": // Users & Permissions
        setCurrentTab(30);
        break;

      default:
        setCurrentTab(null);
        break;
    }
  }, [nodeId]);

  return (
    <div id="settings-data-form">
      <TabPanel value={currentTab} index={11}>
        <AuthorityDetailsSettingsTab />
      </TabPanel>
      <TabPanel value={currentTab} index={12}>
        <MetadataSettingsTab variant="property" />
      </TabPanel>
      <TabPanel value={currentTab} index={13}>
        <MetadataSettingsTab variant="street" />
      </TabPanel>
      <TabPanel value={currentTab} index={14}>
        <MetadataSettingsTab variant="asd" />
      </TabPanel>
      <TabPanel value={currentTab} index={21}>
        <PropertyTemplatesTab />
      </TabPanel>
      <TabPanel value={currentTab} index={22}>
        <StreetTemplateTab />
      </TabPanel>
      <TabPanel value={currentTab} index={23}>
        <AsdTemplateTab />
      </TabPanel>
      <TabPanel value={currentTab} index={24}>
        <LookupTablesTab />
      </TabPanel>
      <TabPanel value={currentTab} index={25}>
        <MapLayersTab />
      </TabPanel>
      <TabPanel value={currentTab} index={26}>
        <BookmarkSettingsTab />
      </TabPanel>
      <TabPanel value={currentTab} index={30}>
        <UserSettingsTab />
      </TabPanel>
    </div>
  );
}

export default SettingsDataForm;
