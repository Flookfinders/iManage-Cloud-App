/* #region header */
/**************************************************************************************************
//
//  Description: ESU Data tab
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
//    002   07.09.23 Sean Flook                 Handle unassigned ESUs.
//    003   06.10.23 Sean Flook                 Use colour variables.
//    004   10.11.23 Sean Flook                 Removed HasASDPlus as no longer required.
//    005   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system and removed some warnings.
//    006   05.01.24 Sean Flook                 Changes to sort out warnings and use CSS shortcuts.
//    007   26.01.24 Sean Flook       IMANN-260 Corrected field name.
//    008   13.02.24 Sean Flook                 Corrected the type 66 map data.
//    009   13.03.24 Joshua McCormick IMANN-280 Added dataTabToolBar for inner toolbar styling
//    010   15.03.24 Sean Flook            GLB8 Fixed highlighting of tabs.
//    011   15.03.24 Joshua McCormick IMANN-280 toolbarStyling, added borderBottom to toolbar
//    012   18.03.24 Sean Flook            GLB8 Fixed highlighting of tabs.
//    013   21.03.24 Joshua McCormick IMANN_280 Removed unnecessary tabContainerStyle
//    014   22.03.24 Sean Flook           GLB12 Fixed the height of the control to ensure the rest of the form can be calculated correctly.
//    015   04.04.24 Sean Flook                 Handle deleting of ESUs on streets and child properties from parent properties. Added parentUprn to mapContext search data for properties.
//    016   05.04.24 Sean Flook                 Further changes to ensure the application is correctly updated after a delete.
//    017   16.04.24 Sean Flook                 Added a sub menu on the properties menu item so that we can select properties by logical status as well.
//    018   16.04.24 Sean Flook                 Added ability to select historic properties.
//    019   18.04.24 Sean Flook       IMANN-351 Changes required to prevent crashes when refreshing the page.
//    020   14.05.24 Sean Flook       IMANN-206 Changes required to display all the provenances.
//    021   19.06.24 Sean Flook       IMANN-629 Changes to code so that current user is remembered and a 401 error displays the login dialog.
//    022   20.06.24 Sean Flook       IMANN-636 Use the new user rights.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useRef, useEffect, Fragment } from "react";
import PropTypes from "prop-types";

import SearchContext from "../context/searchContext";
import FilterContext from "../context/filterContext";
import MapContext from "../context/mapContext";
import UserContext from "../context/userContext";
import SettingsContext from "../context/settingsContext";

import { GetWktCoordinates, mergeArrays } from "../utils/HelperUtils";
import { GetStreetMapData } from "../utils/StreetUtils";

import {
  Checkbox,
  Tabs,
  Tab,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  Tooltip,
  Typography,
  Popper,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import { NestedMenuItem } from "mui-nested-menu";
import SearchDataTab from "../tabs/SearchDataTab";
import ADSFilterControl from "../components/ADSFilterControl";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import GridOnIcon from "@mui/icons-material/GridOn";
import FilterListIcon from "@mui/icons-material/FilterList";
import ImportExportIcon from "@mui/icons-material/ImportExport";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CheckIcon from "@mui/icons-material/Check";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

import { adsBlueA } from "../utils/ADSColours";
import {
  toolbarStyle,
  ActionIconStyle,
  GetAlertStyle,
  GetAlertIcon,
  GetAlertSeverity,
  menuStyle,
  menuItemStyle,
  tooltipStyle,
  tabStyle,
  tabIconStyle,
  dataFormToolbarHeight,
} from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
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

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
}

function SearchDataForm() {
  const theme = useTheme();

  const searchContext = useContext(SearchContext);
  const filterContext = useContext(FilterContext);
  const mapContext = useContext(MapContext);
  const userContext = useContext(UserContext);
  const settingsContext = useContext(SettingsContext);

  const [currentData, setCurrentData] = useState([]);
  const [searchFilteredData, setSearchFilteredData] = useState(null);

  const [checked, setChecked] = useState([]);
  const [anchorSelectEl, setAnchorSelectEl] = useState(null);
  const [anchorActionsEl, setAnchorActionsEl] = useState(null);

  const [allChecked, setAllChecked] = useState(false);
  const [partialChecked, setPartialChecked] = useState(false);

  const [copyOpen, setCopyOpen] = useState(false);
  const copyDataType = useRef(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteDataType = useRef(null);
  const deleteResult = useRef(null);

  const [value, setValue] = useState(0);
  const [hasASD, setHasASD] = useState(false);

  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const filterOpen = Boolean(filterAnchorEl);
  const filterId = filterOpen ? "filter-popper" : undefined;

  /**
   * Event to handle when the tab changes.
   *
   * @param {object} event The event object.
   * @param {number} newValue The index for the new tab.
   */
  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  /**
   * Event to handle when the select checkbox is clicked.
   */
  const handleSelectCheckboxClick = () => {
    if (allChecked) {
      setChecked([]);
      mapContext.onHighlightClear();
    } else {
      const newChecked = currentData.map((x) => x.id);
      const streetHighlighted = currentData.filter((x) => x.type === 15).map((x) => x.usrn);
      const propertyHighlighted = currentData.filter((x) => x.type === 24).map((x) => x.uprn);
      setChecked(newChecked);
      mapContext.onHighlightStreetProperty(streetHighlighted, propertyHighlighted);
    }
    setAllChecked(!allChecked);
    setPartialChecked(false);
  };

  /**
   * Event to handle when the select menu is clicked.
   *
   * @param {object} event The event object.
   */
  const handleSelectMenuClick = (event) => {
    setAnchorSelectEl(event.nativeEvent.target);
  };

  /**
   * Event to handle the closing of the select menu.
   */
  const handleSelectMenuClose = () => {
    setAnchorSelectEl(null);
  };

  /**
   * Event to handle whe the filter button is clicked.
   */
  const handleFilterClick = () => {
    setFilterAnchorEl(filterAnchorEl ? null : document.getElementById("ads-search"));
  };

  /**
   * Event to handle the filter results.
   */
  async function handleFilterResults() {
    let filteredData = searchContext.currentSearchData.results;

    if (filterContext.currentSearchFilter.location) {
      if (filterContext.currentSearchFilter.location.locality) {
        filteredData = filteredData.filter(
          (x) => x.locality.toUpperCase() === filterContext.currentSearchFilter.location.locality.toUpperCase()
        );
      }
      if (filterContext.currentSearchFilter.location.town) {
        filteredData = filteredData.filter(
          (x) => x.town.toUpperCase() === filterContext.currentSearchFilter.location.town.toUpperCase()
        );
      }
      if (filterContext.currentSearchFilter.location.postcode) {
        filteredData = filteredData.filter(
          (x) => x.postcode.toUpperCase() === filterContext.currentSearchFilter.location.postcode.toUpperCase()
        );
      }
    }

    setSearchFilteredData(filteredData);

    const searchStreets = await Promise.all(
      filteredData
        .filter((x) => x.type === 15)
        .map(async (x) => {
          try {
            return await GetStreetMapData(x.usrn, userContext, settingsContext.isScottish).then((streetData) => {
              let esus = streetData
                ? streetData.esus.map((rec) => ({
                    esuId: rec.esuId,
                    state: settingsContext.isScottish ? rec.state : undefined,
                    geometry: rec.wktGeometry ? GetWktCoordinates(rec.wktGeometry) : undefined,
                  }))
                : undefined;
              let asdType51 =
                settingsContext.isScottish && streetData
                  ? streetData.maintenanceResponsibilities.map((asdRec) => ({
                      type: 51,
                      pkId: asdRec.pkId,
                      usrn: asdRec.usrn,
                      streetStatus: asdRec.streetStatus,
                      custodianCode: asdRec.custodianCode,
                      maintainingAuthorityCode: asdRec.maintainingAuthorityCode,
                      wholeRoad: asdRec.wholeRoad,
                      geometry: asdRec.wktGeometry ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
                    }))
                  : undefined;
              let asdType52 =
                settingsContext.isScottish && streetData
                  ? streetData.reinstatementCategories.map((asdRec) => ({
                      type: 52,
                      pkId: asdRec.pkId,
                      usrn: asdRec.usrn,
                      reinstatementCategoryCode: asdRec.reinstatementCategoryCode,
                      custodianCode: asdRec.custodianCode,
                      reinstatementAuthorityCode: asdRec.reinstatementAuthorityCode,
                      wholeRoad: asdRec.wholeRoad,
                      geometry: asdRec.wktGeometry ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
                    }))
                  : undefined;
              let asdType53 =
                settingsContext.isScottish && streetData
                  ? streetData.specialDesignations.map((asdRec) => ({
                      type: 53,
                      pkId: asdRec.pkId,
                      usrn: asdRec.usrn,
                      specialDesig: asdRec.specialDesig,
                      custodianCode: asdRec.custodianCode,
                      authorityCode: asdRec.authorityCode,
                      wholeRoad: asdRec.wholeRoad,
                      geometry: asdRec.wktGeometry ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
                    }))
                  : undefined;
              let asdType61 =
                !settingsContext.isScottish && hasASD && streetData
                  ? streetData.interests.map((asdRec) => ({
                      type: 61,
                      pkId: asdRec.pkId,
                      usrn: asdRec.usrn,
                      streetStatus: asdRec.streetStatus,
                      interestType: asdRec.interestType,
                      districtRefAuthority: asdRec.districtRefAuthority,
                      swaOrgRefAuthority: asdRec.swaOrgRefAuthority,
                      wholeRoad: asdRec.wholeRoad,
                      geometry: asdRec.wktGeometry ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
                    }))
                  : undefined;
              let asdType62 =
                !settingsContext.isScottish && hasASD && streetData
                  ? streetData.constructions.map((asdRec) => ({
                      type: 62,
                      pkId: asdRec.pkId,
                      usrn: asdRec.usrn,
                      constructionType: asdRec.constructionType,
                      reinstatementTypeCode: asdRec.reinstatementTypeCode,
                      swaOrgRefConsultant: asdRec.swaOrgRefConsultant,
                      districtRefConsultant: asdRec.districtRefConsultant,
                      wholeRoad: asdRec.wholeRoad,
                      geometry: asdRec.wktGeometry ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
                    }))
                  : undefined;
              let asdType63 =
                !settingsContext.isScottish && hasASD && streetData
                  ? streetData.specialDesignations.map((asdRec) => ({
                      type: 63,
                      pkId: asdRec.pkId,
                      usrn: asdRec.usrn,
                      streetSpecialDesigCode: asdRec.streetSpecialDesigCode,
                      swaOrgRefConsultant: asdRec.swaOrgRefConsultant,
                      districtRefConsultant: asdRec.districtRefConsultant,
                      wholeRoad: asdRec.wholeRoad,
                      geometry: asdRec.wktGeometry ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
                    }))
                  : undefined;
              let asdType64 =
                !settingsContext.isScottish && hasASD && streetData
                  ? streetData.heightWidthWeights.map((asdRec) => ({
                      type: 64,
                      pkId: asdRec.pkId,
                      usrn: asdRec.usrn,
                      hwwRestrictionCode: asdRec.hwwRestrictionCode,
                      swaOrgRefConsultant: asdRec.swaOrgRefConsultant,
                      districtRefConsultant: asdRec.districtRefConsultant,
                      wholeRoad: asdRec.wholeRoad,
                      geometry: asdRec.wktGeometry ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
                    }))
                  : undefined;
              let asdType66 =
                !settingsContext.isScottish && hasASD && streetData
                  ? streetData.publicRightOfWays.map((asdRec) => ({
                      type: 66,
                      pkId: asdRec.pkId,
                      prowUsrn: asdRec.prowUsrn,
                      prowRights: asdRec.prowRights,
                      prowStatus: asdRec.prowStatus,
                      prowOrgRefConsultant: asdRec.prowOrgRefConsultant,
                      prowDistrictRefConsultant: asdRec.prowDistrictRefConsultant,
                      defMapGeometryType: asdRec.defMapGeometryType,
                      geometry: asdRec.wktGeometry ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
                    }))
                  : undefined;
              let streetObj = {
                usrn: x.usrn,
                description: x.street,
                language: x.language,
                locality: x.locality,
                town: x.town,
                state: !settingsContext.isScottish && streetData ? streetData.state : undefined,
                type: streetData ? streetData.recordType : undefined,
                esus: esus,
                asdType51: asdType51,
                asdType52: asdType52,
                asdType53: asdType53,
                asdType61: asdType61,
                asdType62: asdType62,
                asdType63: asdType63,
                asdType64: asdType64,
                asdType66: asdType66,
              };
              return streetObj;
            });
          } catch (err) {
            throw err;
          }
        })
    );

    const searchProperties = filteredData
      .filter((x) => x.type === 24)
      .map((x) => {
        let propObj = {
          uprn: x.uprn,
          parentUprn: x.parent_uprn,
          address: x.address,
          formattedAddress: x.formattedaddress,
          postcode: x.postcode,
          easting: x.easting,
          northing: x.northing,
          logicalStatus: x.logical_status,
          classificationCode: x.classification_code ? x.classification_code : "U",
        };
        return propObj;
      });

    mapContext.onSearchDataChange(searchStreets, searchProperties, null, null);
  }

  /**
   * Event to handle when the filter is canceled.
   */
  async function handleCancelFilter() {
    setSearchFilteredData(null);
    setFilterAnchorEl(null);

    const searchStreets = await Promise.all(
      searchContext.currentSearchData.results
        .filter((x) => x.type === 15)
        .map(async (x) => {
          try {
            return await GetStreetMapData(x.usrn, userContext, settingsContext.isScottish).then((streetData) => {
              let esus = streetData
                ? streetData.esus.map((rec) => ({
                    esuId: rec.esuId,
                    state: settingsContext.isScottish ? rec.state : undefined,
                    geometry: rec.wktGeometry ? GetWktCoordinates(rec.wktGeometry) : undefined,
                  }))
                : undefined;
              let asdType51 =
                settingsContext.isScottish && streetData
                  ? streetData.maintenanceResponsibilities.map((asdRec) => ({
                      type: 51,
                      pkId: asdRec.pkId,
                      usrn: asdRec.usrn,
                      streetStatus: asdRec.streetStatus,
                      custodianCode: asdRec.custodianCode,
                      maintainingAuthorityCode: asdRec.maintainingAuthorityCode,
                      wholeRoad: asdRec.wholeRoad,
                      geometry: asdRec.wktGeometry ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
                    }))
                  : undefined;
              let asdType52 =
                settingsContext.isScottish && streetData
                  ? streetData.reinstatementCategories.map((asdRec) => ({
                      type: 52,
                      pkId: asdRec.pkId,
                      usrn: asdRec.usrn,
                      reinstatementCategoryCode: asdRec.reinstatementCategoryCode,
                      custodianCode: asdRec.custodianCode,
                      reinstatementAuthorityCode: asdRec.reinstatementAuthorityCode,
                      wholeRoad: asdRec.wholeRoad,
                      geometry: asdRec.wktGeometry ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
                    }))
                  : undefined;
              let asdType53 =
                settingsContext.isScottish && streetData
                  ? streetData.specialDesignations.map((asdRec) => ({
                      type: 53,
                      pkId: asdRec.pkId,
                      usrn: asdRec.usrn,
                      specialDesig: asdRec.specialDesig,
                      custodianCode: asdRec.custodianCode,
                      authorityCode: asdRec.authorityCode,
                      wholeRoad: asdRec.wholeRoad,
                      geometry: asdRec.wktGeometry ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
                    }))
                  : undefined;
              let asdType61 =
                !settingsContext.isScottish && hasASD && streetData
                  ? streetData.interests.map((asdRec) => ({
                      type: 61,
                      pkId: asdRec.pkId,
                      usrn: asdRec.usrn,
                      streetStatus: asdRec.streetStatus,
                      interestType: asdRec.interestType,
                      districtRefAuthority: asdRec.districtRefAuthority,
                      swaOrgRefAuthority: asdRec.swaOrgRefAuthority,
                      wholeRoad: asdRec.wholeRoad,
                      geometry: asdRec.wktGeometry ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
                    }))
                  : undefined;
              let asdType62 =
                !settingsContext.isScottish && hasASD && streetData
                  ? streetData.constructions.map((asdRec) => ({
                      type: 62,
                      pkId: asdRec.pkId,
                      usrn: asdRec.usrn,
                      constructionType: asdRec.constructionType,
                      reinstatementTypeCode: asdRec.reinstatementTypeCode,
                      swaOrgRefConsultant: asdRec.swaOrgRefConsultant,
                      districtRefConsultant: asdRec.districtRefConsultant,
                      wholeRoad: asdRec.wholeRoad,
                      geometry: asdRec.wktGeometry ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
                    }))
                  : undefined;
              let asdType63 =
                !settingsContext.isScottish && hasASD && streetData
                  ? streetData.specialDesignations.map((asdRec) => ({
                      type: 63,
                      pkId: asdRec.pkId,
                      usrn: asdRec.usrn,
                      streetSpecialDesigCode: asdRec.streetSpecialDesigCode,
                      swaOrgRefConsultant: asdRec.swaOrgRefConsultant,
                      districtRefConsultant: asdRec.districtRefConsultant,
                      wholeRoad: asdRec.wholeRoad,
                      geometry: asdRec.wktGeometry ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
                    }))
                  : undefined;
              let asdType64 =
                !settingsContext.isScottish && hasASD && streetData
                  ? streetData.heightWidthWeights.map((asdRec) => ({
                      type: 64,
                      pkId: asdRec.pkId,
                      usrn: asdRec.usrn,
                      hwwRestrictionCode: asdRec.hwwRestrictionCode,
                      swaOrgRefConsultant: asdRec.swaOrgRefConsultant,
                      districtRefConsultant: asdRec.districtRefConsultant,
                      wholeRoad: asdRec.wholeRoad,
                      geometry: asdRec.wktGeometry ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
                    }))
                  : undefined;
              let asdType66 =
                !settingsContext.isScottish && hasASD && streetData
                  ? streetData.publicRightOfWays.map((asdRec) => ({
                      type: 66,
                      pkId: asdRec.pkId,
                      prowUsrn: asdRec.prowUsrn,
                      prowRights: asdRec.prowRights,
                      prowStatus: asdRec.prowStatus,
                      prowOrgRefConsultant: asdRec.prowOrgRefConsultant,
                      prowDistrictRefConsultant: asdRec.prowDistrictRefConsultant,
                      defMapGeometryType: asdRec.defMapGeometryType,
                      geometry: asdRec.wktGeometry ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
                    }))
                  : undefined;
              let streetObj = {
                usrn: x.usrn,
                description: x.street,
                language: x.language,
                locality: x.locality,
                town: x.town,
                state: !settingsContext.isScottish && streetData ? streetData.state : undefined,
                type: streetData ? streetData.recordType : undefined,
                esus: esus,
                asdType51: asdType51,
                asdType52: asdType52,
                asdType53: asdType53,
                asdType61: asdType61,
                asdType62: asdType62,
                asdType63: asdType63,
                asdType64: asdType64,
                asdType66: asdType66,
              };
              return streetObj;
            });
          } catch (err) {
            throw err;
          }
        })
    );

    const searchProperties = searchContext.currentSearchData.results
      .filter((x) => x.type === 24)
      .map((x) => {
        let propObj = {
          uprn: x.uprn,
          parentUprn: x.parent_uprn,
          address: x.address,
          formattedAddress: x.formattedaddress,
          postcode: x.postcode,
          easting: x.easting,
          northing: x.northing,
          logicalStatus: x.logical_status,
          classificationCode: x.classification_code ? x.classification_code : "U",
        };
        return propObj;
      });

    mapContext.onSearchDataChange(searchStreets, searchProperties, null, null);
  }

  /**
   * Event to handle the display of the actions context menu.
   *
   * @param {object} event The event object.
   */
  const handleActionsMenuClick = (event) => {
    setAnchorActionsEl(event.nativeEvent.target);
  };

  /**
   * Event to handle the closing of the actions context menu.
   */
  const handleActionsMenuClose = () => {
    setAnchorActionsEl(null);
  };

  /**
   * Event to handle selecting all the records.
   */
  const handleSelectAll = () => {
    const newChecked = currentData.map((x) => x.id);
    const streetHighlighted = currentData.filter((x) => x.type === 15).map((x) => x.usrn);
    const propertyHighlighted = currentData.filter((x) => x.type === 24).map((x) => x.uprn);
    setChecked(newChecked);
    setAllChecked(true);
    setPartialChecked(false);
    setAnchorSelectEl(null);
    mapContext.onHighlightStreetProperty(streetHighlighted, propertyHighlighted);
  };

  /**
   * Event to handle selecting all the properties.
   */
  const handleSelectProperties = () => {
    const newChecked = currentData.filter((x) => x.type === 24).map((x) => x.id);
    const propertyHighlighted = currentData.filter((x) => x.type === 24).map((x) => x.uprn);
    setChecked(newChecked);
    setAllChecked(newChecked.length === currentData.length);
    setPartialChecked(newChecked.length > 0 && newChecked.length !== currentData.length);
    setAnchorSelectEl(null);
    mapContext.onHighlightStreetProperty(null, propertyHighlighted);
  };

  /**
   * Event to handle selecting all the properties by logical status.
   */
  const handleSelectPropertiesByLogicalStatus = (logicalStatus) => {
    const newChecked = currentData.filter((x) => x.type === 24 && x.logical_status === logicalStatus).map((x) => x.id);
    const propertyHighlighted = currentData
      .filter((x) => x.type === 24 && x.logical_status === logicalStatus)
      .map((x) => x.uprn);
    setChecked(newChecked);
    setAllChecked(newChecked.length === currentData.length);
    setPartialChecked(newChecked.length > 0 && newChecked.length !== currentData.length);
    setAnchorSelectEl(null);
    mapContext.onHighlightStreetProperty(null, propertyHighlighted);
  };

  /**
   * Event to handle selecting all the streets.
   */
  const handleSelectStreets = () => {
    const newChecked = currentData.filter((x) => x.type === 15).map((x) => x.id);
    const streetHighlighted = currentData.filter((x) => x.type === 15).map((x) => x.usrn);
    setChecked(newChecked);
    setAllChecked(newChecked.length === currentData.length);
    setPartialChecked(newChecked.length > 0 && newChecked.length !== currentData.length);
    setAnchorSelectEl(null);
    mapContext.onHighlightStreetProperty(streetHighlighted, null);
  };

  /**
   * Method to toggle the item.
   *
   * @param {number} value The value of the item.
   */
  function ToggleItem(value) {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);

    setAllChecked(newChecked.length === currentData.length);
    setPartialChecked(newChecked.length > 0 && newChecked.length !== currentData.length);
  }

  /**
   * Method to display the copy alert.
   *
   * @param {boolean} open True if the copy alert is visible; otherwise false.
   * @param {string} dataType The type of data being copied.
   */
  const handleCopyOpen = (open, dataType) => {
    copyDataType.current = dataType;
    setCopyOpen(open);
  };

  /**
   * Event to handle when the copy alert closes.
   *
   * @param {object} event The event object.
   * @param {string} reason The reason the alert is closing.
   * @returns
   */
  const handleCopyClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setCopyOpen(false);
  };

  /**
   * Event to handle the display of the delete alert.
   *
   * @param {boolean} open True if the delete alert is open; otherwise false.
   * @param {string} dataType The type of data.
   * @param {boolean} result The result of the deletion
   * @param {number} entityId The id of the record that was deleted.
   * @param {boolean} deleteChildren True if the user has confirmed to delete the child ESUs or properties when deleting a street or parent property; otherwise false.
   */
  const handleDeleteOpen = (open, dataType, result, entityId, deleteChildren) => {
    deleteDataType.current = dataType;
    deleteResult.current = result;

    if (result) {
      let deletedIds = [entityId.toString()];
      if (dataType === "Property" && deleteChildren) {
        const childUprns = searchContext.currentSearchData.results
          .filter((x) => x.type === 24 && x.parent_uprn && x.parent_uprn.toString() === entityId.toString())
          .map((x) => x.uprn.toString());
        let grandChildUprns = [];
        let greatGrandChildUprns = [];

        if (childUprns && childUprns.length) {
          grandChildUprns = searchContext.currentSearchData.results
            .filter((x) => x.type === 24 && x.parent_uprn && childUprns.includes(x.parent_uprn.toString()))
            .map((x) => x.uprn.toString());

          if (grandChildUprns && grandChildUprns.length) {
            greatGrandChildUprns = searchContext.currentSearchData.results
              .filter((x) => x.type === 24 && x.parent_uprn && grandChildUprns.includes(x.parent_uprn.toString()))
              .map((x) => x.uprn.toString());
          }
        }

        deletedIds = mergeArrays(
          mergeArrays(mergeArrays([entityId.toString()], childUprns), grandChildUprns),
          greatGrandChildUprns
        );
      }

      if (searchFilteredData) {
        if (dataType === "Property") {
          const newPropertyFilteredData = searchFilteredData.filter(
            (x) => x.type === 15 || !deletedIds.includes(x.uprn.toString())
          );
          setSearchFilteredData(newPropertyFilteredData);
        } else {
          const newStreetFilteredData = searchFilteredData.filter(
            (x) => x.type === 24 || x.usrn.toString() !== entityId.toString()
          );
          setSearchFilteredData(newStreetFilteredData);
        }
      } else {
        if (dataType === "Property") {
          const newPropertySearchData = searchContext.currentSearchData.results.filter(
            (x) => x.type === 15 || !deletedIds.includes(x.uprn.toString())
          );
          searchContext.onSearchDataChange(searchContext.currentSearchData.searchString, newPropertySearchData);
        } else {
          const newStreetSearchData = searchContext.currentSearchData.results.filter(
            (x) => x.type === 24 || x.usrn.toString() !== entityId.toString()
          );
          searchContext.onSearchDataChange(searchContext.currentSearchData.searchString, newStreetSearchData);
        }
      }

      if (dataType === "Property") {
        const newMapBackgroundProperties = mapContext.currentBackgroundData.properties.filter(
          (x) => !deletedIds.includes(x.uprn.toString())
        );
        const newMapSearchProperties = mapContext.currentSearchData.properties.filter(
          (x) => !deletedIds.includes(x.uprn.toString())
        );
        mapContext.onBackgroundDataChange(
          mapContext.currentBackgroundData.streets,
          mapContext.currentBackgroundData.unassignedEsus,
          newMapBackgroundProperties,
          mapContext.currentBackgroundData.provenances
        );
        mapContext.onSearchDataChange(mapContext.currentSearchData.streets, newMapSearchProperties, null, null);
      } else {
        const newMapBackgroundStreets = mapContext.currentBackgroundData.streets.filter(
          (x) => x.usrn.toString() !== entityId.toString()
        );
        const newMapSearchStreets = mapContext.currentSearchData.streets.filter(
          (x) => x.usrn.toString() !== entityId.toString()
        );
        mapContext.onBackgroundDataChange(
          newMapBackgroundStreets,
          mapContext.currentBackgroundData.unassignedEsus,
          mapContext.currentBackgroundData.properties,
          mapContext.currentBackgroundData.provenances
        );
        mapContext.onSearchDataChange(newMapSearchStreets, mapContext.currentSearchData.properties, null, null);
      }
    }

    setDeleteOpen(open);
  };

  /**
   * Event to handle when the delete alert is closing.
   *
   * @param {object} event The event object.
   * @param {string} reason The reason why the alert is closing.
   * @returns
   */
  const handleDeleteClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setDeleteOpen(false);
  };

  /**
   * Event to handle clearing the selection.
   */
  const handleClearSelection = () => {
    setChecked([]);
    setAllChecked(false);
    setPartialChecked(false);
    setAnchorSelectEl(null);
    mapContext.onHighlightClear();
  };

  useEffect(() => {
    if (localStorage.getItem("SearchDataForm_firstLoadDone") === null) {
      localStorage.setItem("SearchDataForm_firstLoadDone", 1);
    } else {
      setCurrentData(JSON.parse(sessionStorage.getItem("currentData")));
    }
  }, []);

  useEffect(() => {
    if (
      (searchFilteredData && searchFilteredData.length) ||
      (searchContext.currentSearchData &&
        searchContext.currentSearchData.results &&
        searchContext.currentSearchData.results.length)
    ) {
      setCurrentData(searchFilteredData ? searchFilteredData : searchContext.currentSearchData.results);
      sessionStorage.setItem(
        "currentData",
        JSON.stringify(searchFilteredData ? searchFilteredData : searchContext.currentSearchData.results)
      );
    }
  }, [searchContext.currentSearchData, searchFilteredData]);

  useEffect(() => {
    setHasASD(userContext.currentUser && userContext.currentUser.hasASD);
  }, [userContext]);

  return (
    <Fragment>
      <Box sx={{ ...toolbarStyle, height: `${dataFormToolbarHeight}px`, borderBottomWidth: "3px" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={1}>
            <Tooltip title="Toggle select all / none" arrow placement="right" sx={tooltipStyle}>
              <Fragment>
                <Checkbox
                  sx={{
                    pr: theme.spacing(0),
                  }}
                  checked={allChecked}
                  color="primary"
                  indeterminate={partialChecked}
                  onClick={handleSelectCheckboxClick}
                />
                <IconButton
                  sx={{
                    pl: theme.spacing(0),
                  }}
                  onClick={handleSelectMenuClick}
                  aria-controls="select-menu"
                  aria-haspopup="true"
                  size="small"
                >
                  <ExpandMoreIcon sx={ActionIconStyle()} />
                </IconButton>
              </Fragment>
            </Tooltip>
            <Menu
              id="select-menu"
              elevation={2}
              anchorEl={anchorSelectEl}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              keepMounted
              open={Boolean(anchorSelectEl)}
              onClose={handleSelectMenuClose}
              sx={menuStyle}
            >
              <MenuItem dense onClick={handleSelectAll} sx={menuItemStyle(false)}>
                <Typography
                  variant="inherit"
                  sx={{
                    pl: theme.spacing(1),
                  }}
                >
                  All
                </Typography>
              </MenuItem>
              <NestedMenuItem
                dense
                className="nestedMenuItemSelect"
                rightIcon={<KeyboardArrowRightIcon />}
                label={<Typography variant="body2">Properties</Typography>}
                parentMenuOpen={Boolean(anchorSelectEl)}
              >
                <MenuItem dense onClick={handleSelectProperties} sx={menuItemStyle(false)}>
                  <Typography
                    variant="inherit"
                    sx={{
                      pl: theme.spacing(1),
                    }}
                  >
                    All
                  </Typography>
                </MenuItem>
                <MenuItem dense onClick={() => handleSelectPropertiesByLogicalStatus(1)} sx={menuItemStyle(false)}>
                  <Typography
                    variant="inherit"
                    sx={{
                      pl: theme.spacing(1),
                    }}
                  >
                    Approved
                  </Typography>
                </MenuItem>
                <MenuItem dense onClick={() => handleSelectPropertiesByLogicalStatus(6)} sx={menuItemStyle(false)}>
                  <Typography
                    variant="inherit"
                    sx={{
                      pl: theme.spacing(1),
                    }}
                  >
                    Provisional
                  </Typography>
                </MenuItem>
                <MenuItem dense onClick={() => handleSelectPropertiesByLogicalStatus(8)} sx={menuItemStyle(false)}>
                  <Typography
                    variant="inherit"
                    sx={{
                      pl: theme.spacing(1),
                    }}
                  >
                    Historic
                  </Typography>
                </MenuItem>
              </NestedMenuItem>
              <MenuItem dense onClick={handleSelectStreets} sx={menuItemStyle(false)}>
                <Typography
                  variant="inherit"
                  sx={{
                    pl: theme.spacing(1),
                  }}
                >
                  Streets
                </Typography>
              </MenuItem>
            </Menu>
            <Tabs
              value={value}
              onChange={handleTabChange}
              TabIndicatorProps={{ style: { background: adsBlueA, height: "4px" } }}
              selectionFollowsFocus
              aria-label="search-list-tabs"
            >
              <Tab
                sx={tabStyle}
                icon={
                  <Tooltip title="List view" arrow placement="right" sx={tooltipStyle}>
                    <FormatListBulletedIcon sx={tabIconStyle(value === 0)} />
                  </Tooltip>
                }
                aria-label="List view"
                {...a11yProps(0)}
              />
              {process.env.NODE_ENV === "development" && (
                <Tab
                  sx={tabStyle}
                  icon={
                    <Tooltip title="Grid view" arrow placement="right" sx={tooltipStyle}>
                      <GridOnIcon sx={tabIconStyle(value === 1)} />
                    </Tooltip>
                  }
                  aria-label="Grid view"
                  {...a11yProps(1)}
                />
              )}
            </Tabs>
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="flex-end"
            spacing={1}
            sx={{ pr: theme.spacing(2.25) }}
          >
            {process.env.NODE_ENV === "development" && (
              <IconButton size="small" disabled onClick={handleFilterClick}>
                <FilterListIcon sx={ActionIconStyle()} />
                <Typography variant="body2">Refine search</Typography>
              </IconButton>
            )}
            {process.env.NODE_ENV === "development" && (
              <IconButton size="small" disabled>
                <ImportExportIcon sx={ActionIconStyle()} />
                <Typography variant="body2">Sort</Typography>
              </IconButton>
            )}
            <Tooltip title="Actions menu" arrow placement="right" sx={tooltipStyle}>
              <IconButton
                onClick={handleActionsMenuClick}
                aria-controls="actions-menu"
                aria-haspopup="true"
                size="small"
              >
                <MoreVertIcon sx={ActionIconStyle()} />
              </IconButton>
            </Tooltip>
            <Menu
              id="actions-menu"
              elevation={2}
              anchorEl={anchorActionsEl}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              keepMounted
              open={Boolean(anchorActionsEl)}
              onClose={handleActionsMenuClose}
              sx={menuStyle}
            >
              <MenuItem dense disabled sx={menuItemStyle(false)}>
                <Typography variant="inherit">Export to</Typography>
              </MenuItem>
              <MenuItem dense disabled sx={menuItemStyle(false)}>
                <Typography variant="inherit">Bookmark search</Typography>
              </MenuItem>
              <MenuItem dense disabled sx={menuItemStyle(false)}>
                <Typography variant="inherit">Add to list</Typography>
              </MenuItem>
            </Menu>
          </Stack>
        </Stack>
      </Box>
      <TabPanel value={value} index={0}>
        <SearchDataTab
          data={currentData}
          variant="list"
          checked={checked}
          onToggleItem={(value) => ToggleItem(value)}
          onSetCopyOpen={(open, dataType) => handleCopyOpen(open, dataType)}
          onSetDeleteOpen={handleDeleteOpen}
          onClearSelection={handleClearSelection}
        />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <SearchDataTab
          data={currentData}
          variant="grid"
          checked={checked}
          onToggleItem={(value) => ToggleItem(value)}
          onSetCopyOpen={(open, dataType) => handleCopyOpen(open, dataType)}
          onSetDeleteOpen={handleDeleteOpen}
          onClearSelection={handleClearSelection}
        />
      </TabPanel>
      <div>
        <Snackbar
          open={copyOpen}
          autoHideDuration={6000}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          onClose={handleCopyClose}
        >
          <Alert
            sx={{
              backgroundColor: adsBlueA,
            }}
            icon={<CheckIcon fontSize="inherit" />}
            onClose={handleCopyClose}
            severity="success"
            elevation={6}
            variant="filled"
          >{`${copyDataType.current} copied to clipboard`}</Alert>
        </Snackbar>
      </div>
      <div>
        <Snackbar
          open={deleteOpen}
          autoHideDuration={6000}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          onClose={handleDeleteClose}
        >
          <Alert
            sx={GetAlertStyle(deleteResult.current)}
            icon={GetAlertIcon(deleteResult.current)}
            onClose={handleDeleteClose}
            severity={GetAlertSeverity(deleteResult.current)}
            elevation={6}
            variant="filled"
          >{`${
            deleteDataType.current === "Property"
              ? deleteResult.current
                ? "The property has been successfully deleted."
                : "Failed to delete the property."
              : deleteResult.current
              ? "The street has been successfully deleted."
              : "Failed to delete the street."
          }`}</Alert>
        </Snackbar>
      </div>
      <Popper id={filterId} open={filterOpen} anchorEl={filterAnchorEl} placement="bottom-start">
        <ADSFilterControl searchButton="Filter" onFilter={handleFilterResults} onCancel={handleCancelFilter} />
      </Popper>
    </Fragment>
  );
}

export default SearchDataForm;
