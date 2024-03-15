/* #region header */
/**************************************************************************************************
//
//  Description: Related tab
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
//    002   23.03.23 Sean Flook         WI40604 Call reset when opening a new record.
//    003   05.04.23 Sean Flook         WI40596 If opening an historic property display the warning dialog.
//    004   28.06.23 Sean Flook         WI40256 Changed Extent to Provenance where appropriate.
//    005   07.09.23 Sean Flook                 Cleaned the code.
//    006   06.10.23 Sean Flook                 Added some error trapping.
//    006   10.10.23 Sean Flook       IMANN-163 Changes required for opening tab after property wizard.
//    006   27.10.23 Sean Flook                 Use new dataFormStyle and updated call to SavePropertyAndUpdate..
//    007   10.11.23 Sean Flook                 Removed HasASDPlus as no longer required.
//    008   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system.
//    009   30.11.23 Sean Flook                 Renamed variable to avoid confusion.
//    010   02.01.24 Sean Flook                 Changed console.log to console.error for error messages.
//    011   05.01.24 Sean Flook                 Changes to sort out warnings and use CSS shortcuts.
//    012   10.01.24 Sean Flook                 Fix warnings.
//    013   11.01.24 Sean Flook                 Fix warnings.
//    014   12.01.24 Sean Flook       IMANN-163 Do not try and get the data if we do not have the USRN/UPRN.
//    015   25.01.24 Sean Flook                 Changes required after UX review.
//    016   26.01.24 Sean Flook       IMANN-260 Corrected field name.
//    017   09.02.24 Sean Flook                 Modified handleHistoricPropertyClose to handle returning an action from the historic property warning dialog.
//    018   13.02.24 Joel Benford               Provide hww.usrn to map context when changing street
//    019   13.02.24 Sean Flook                 Corrected the type 66 map data.
//    020   08.03.24 Sean Flook       IMANN-348 Use the new hasStreetChanged and hasPropertyChanged methods as well as updated calls to ResetContexts.
//    021   11.03.24 Sean Flook           GLB12 Adjusted height to remove gap.
//    022   13.03.24 Sean Flook            MUL9 Changes required to facilitate refreshing the data.
//    023   16.03.24 Sean Flook            GLB6 Use individual buttons to toggle between properties and streets.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useRef, useEffect, Fragment } from "react";
import PropTypes from "prop-types";

import StreetContext from "../context/streetContext";
import PropertyContext from "../context/propertyContext";
import UserContext from "../context/userContext";
import SandboxContext from "../context/sandboxContext";
import MapContext from "../context/mapContext";
import LookupContext from "../context/lookupContext";
import SearchContext from "../context/searchContext";
import SettingsContext from "../context/settingsContext";

import { Avatar, SvgIcon, Skeleton, Tooltip, IconButton, Typography, Snackbar, Alert, Button } from "@mui/material";
import { Box, Stack } from "@mui/system";

import {
  GetRelatedPropertyByUSRNUrl,
  GetRelatedPropertyByUPRNUrl,
  GetRelatedStreetByUSRNUrl,
  GetRelatedStreetByUPRNUrl,
  GetRelatedStreetWithASDByUSRNUrl,
  GetRelatedStreetWithASDByUPRNUrl,
  HasASD,
} from "../configuration/ADSConfig";
import { GetWktCoordinates, GetChangedAssociatedRecords, ResetContexts } from "../utils/HelperUtils";
import { GetStreetMapData, GetCurrentStreetData, SaveStreet, hasStreetChanged } from "../utils/StreetUtils";
import { GetCurrentPropertyData, SavePropertyAndUpdate, hasPropertyChanged } from "../utils/PropertyUtils";

import { useSaveConfirmation } from "../pages/SaveConfirmationPage";
import HistoricPropertyDialog from "../dialogs/HistoricPropertyDialog";
import RelatedPropertyTab from "./RelatedPropertyTab";
import RelatedStreetTab from "./RelatedStreetTab";

import HomeIcon from "@mui/icons-material/Home";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import {
  toolbarStyle,
  dataFormStyle,
  GetAlertStyle,
  GetAlertIcon,
  GetAlertSeverity,
  ActionIconStyle,
  tooltipStyle,
  blueButtonStyle,
  greyButtonStyle,
  relatedAvatarStyle,
} from "../utils/ADSStyles";

RelatedTab.propTypes = {
  variant: PropTypes.string.isRequired,
  propertyCount: PropTypes.number.isRequired,
  streetCount: PropTypes.number.isRequired,
  onSetCopyOpen: PropTypes.func.isRequired,
  onPropertyAdd: PropTypes.func.isRequired,
};

function RelatedTab({ variant, propertyCount, streetCount, onSetCopyOpen, onPropertyAdd }) {
  const streetContext = useContext(StreetContext);
  const propertyContext = useContext(PropertyContext);
  const userContext = useContext(UserContext);
  const sandboxContext = useContext(SandboxContext);
  const mapContext = useContext(MapContext);
  const lookupContext = useContext(LookupContext);
  const searchContext = useContext(SearchContext);
  const settingsContext = useContext(SettingsContext);

  const [apiUrl, setApiUrl] = useState(null);
  const [propertyData, setPropertyData] = useState({});
  const [streetData, setStreetData] = useState({});
  const dataUsrn = useRef(null);
  const dataUprn = useRef(null);
  const [loading, setLoading] = useState(true);
  const [relatedType, setRelatedType] = useState("property");
  const [expandAll, setExpandAll] = useState("Expand all");
  const [expanded, setExpanded] = useState([]);

  const [propertyChecked, setPropertyChecked] = useState([]);
  const [streetChecked, setStreetChecked] = useState([]);

  const [saveOpen, setSaveOpen] = useState(false);
  const saveResult = useRef(null);
  const saveType = useRef(null);
  const failedValidation = useRef(null);
  const associatedRecords = useRef([]);

  const [openHistoricProperty, setOpenHistoricProperty] = useState(false);
  const historicRec = useRef(null);

  const saveConfirmDialog = useSaveConfirmation();

  /**
   * Event to handle when the tab changes.
   *
   * @param {object} event The event object, not used.
   * @param {string} newTab The type for the new tab.
   */
  const handleTabChange = (newTab) => {
    if (newTab !== relatedType) setRelatedType(newTab);
  };

  /**
   * Event to handle when the expand all button is clicked.
   */
  const handleExpandAll = () => {
    const expandList =
      relatedType === "property"
        ? propertyData && propertyData.properties
          ? [...new Set(propertyData.properties.filter((x) => x.parentUprn).map((x) => x.parentUprn.toString()))]
          : []
        : streetData && streetData.street
        ? streetData.street
            .map((x) => x.usrn.toString())
            .concat(streetData.street.map((x) => `esu-root-${x.usrn.toString()}`))
            .concat(streetData.street.map((x) => `asd-root-${x.usrn.toString()}`))
        : [];
    setExpanded(expandAll === "Expand all" ? expandList : []);
    setExpandAll((oldExpandAll) => (oldExpandAll === "Expand all" ? "Collapse all" : "Expand all"));
  };

  /**
   * Method to handle editing the given property.
   *
   * @param {number} uprn The UPRN of the property
   * @param {string} address The address for the property
   * @param {string} postcode The properties postcode
   * @param {number} easting The easting for the property
   * @param {number} northing The northing for the property
   * @param {number} logicalStatus The logical status of the property
   * @param {string} classificationCode The classification code of the property
   */
  const doEditProperty = (uprn, address, postcode, easting, northing, logicalStatus, classificationCode) => {
    propertyContext.onPropertyChange(uprn, 0, address, address, postcode, null, null, false, null);

    const foundProperty = mapContext.currentSearchData.properties.find((x) => x.uprn === uprn.toString());

    if (foundProperty) {
      mapContext.onSearchDataChange(
        mapContext.currentSearchData.streets,
        mapContext.currentSearchData.properties,
        null,
        uprn
      );
    } else {
      const searchProperties = [
        {
          uprn: uprn,
          address: address,
          postcode: postcode,
          easting: easting,
          northing: northing,
          logicalStatus: logicalStatus,
          classificationCode: classificationCode ? classificationCode.substring(0, 1) : "U",
        },
      ];
      mapContext.onSearchDataChange([], searchProperties, null, uprn);
    }
    mapContext.onHighlightStreetProperty(null, [uprn.toString()]);
  };

  /**
   * Method to handle editing of a property if it is not historic.
   *
   * @param {number} uprn The UPRN of the property
   * @param {string} address The address for the property
   * @param {string} postcode The properties postcode
   * @param {number} easting The easting for the property
   * @param {number} northing The northing for the property
   * @param {number} logicalStatus The logical status of the property
   * @param {string} classificationCode The classification code of the property
   */
  const editProperty = (uprn, address, postcode, easting, northing, logicalStatus, classificationCode) => {
    if (logicalStatus && logicalStatus === 8) {
      historicRec.current = {
        uprn: uprn,
        address: address,
        postcode: postcode,
        easting: easting,
        northing: northing,
        logicalStatus: logicalStatus,
        classificationCode: classificationCode,
      };
      setOpenHistoricProperty(true);
    } else doEditProperty(uprn, address, postcode, easting, northing, logicalStatus, classificationCode);
  };

  /**
   * Method to handle the editing of a street.
   *
   * @param {number} usrn The USRN of the street
   * @param {string} description The descriptor for the street
   * @param {string} language The language of the descriptor.
   * @param {string} locality The locality for the street.
   * @param {string} town The town for the street.
   */
  async function editStreet(usrn, description, language, locality, town) {
    streetContext.onStreetChange(usrn, description, false);
    const foundStreet =
      MapContext.currentLayers &&
      MapContext.currentSearchData.streets &&
      MapContext.currentSearchData.streets.find(({ usrn }) => usrn.toString() === usrn);
    if (foundStreet) {
      mapContext.onSearchDataChange(
        mapContext.currentSearchData.streets,
        mapContext.currentSearchData.properties,
        usrn,
        null
      );
    } else {
      const streetData = await GetStreetMapData(usrn, userContext.currentUser.token, settingsContext.isScottish);
      const esus = streetData
        ? streetData.esus.map((rec) => ({
            esuId: rec.esuId,
            state: settingsContext.isScottish ? rec.state : undefined,
            geometry: rec.wktGeometry && rec.wktGeometry !== "" ? GetWktCoordinates(rec.wktGeometry) : undefined,
          }))
        : undefined;
      const asdType51 =
        settingsContext.isScottish && streetData
          ? streetData.maintenanceResponsibilities.map((asdRec) => ({
              type: 51,
              pkId: asdRec.pkId,
              usrn: asdRec.usrn,
              streetStatus: asdRec.streetStatus,
              custodianCode: asdRec.custodianCode,
              maintainingAuthorityCode: asdRec.maintainingAuthorityCode,
              wholeRoad: asdRec.wholeRoad,
              geometry:
                asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
            }))
          : [];
      const asdType52 =
        settingsContext.isScottish && streetData
          ? streetData.reinstatementCategories.map((asdRec) => ({
              type: 52,
              pkId: asdRec.pkId,
              usrn: asdRec.usrn,
              reinstatementCategoryCode: asdRec.reinstatementCategoryCode,
              custodianCode: asdRec.custodianCode,
              reinstatementAuthorityCode: asdRec.reinstatementAuthorityCode,
              wholeRoad: asdRec.wholeRoad,
              geometry:
                asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
            }))
          : [];
      const asdType53 =
        settingsContext.isScottish && streetData
          ? streetData.specialDesignations.map((asdRec) => ({
              type: 53,
              pkId: asdRec.pkId,
              usrn: asdRec.usrn,
              specialDesig: asdRec.specialDesig,
              custodianCode: asdRec.custodianCode,
              authorityCode: asdRec.authorityCode,
              wholeRoad: asdRec.wholeRoad,
              geometry:
                asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
            }))
          : [];
      const asdType61 =
        !settingsContext.isScottish && HasASD() && streetData
          ? streetData.interests.map((asdRec) => ({
              type: 61,
              pkId: asdRec.pkId,
              usrn: asdRec.usrn,
              streetStatus: asdRec.streetStatus,
              interestType: asdRec.interestType,
              districtRefAuthority: asdRec.districtRefAuthority,
              swaOrgRefAuthority: asdRec.swaOrgRefAuthority,
              wholeRoad: asdRec.wholeRoad,
              geometry:
                asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
            }))
          : [];
      const asdType62 =
        !settingsContext.isScottish && HasASD() && streetData
          ? streetData.constructions.map((asdRec) => ({
              type: 62,
              pkId: asdRec.pkId,
              usrn: asdRec.usrn,
              constructionType: asdRec.constructionType,
              reinstatementTypeCode: asdRec.reinstatementTypeCode,
              swaOrgRefConsultant: asdRec.swaOrgRefConsultant,
              districtRefConsultant: asdRec.districtRefConsultant,
              wholeRoad: asdRec.wholeRoad,
              geometry:
                asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
            }))
          : [];
      const asdType63 =
        !settingsContext.isScottish && HasASD() && streetData
          ? streetData.specialDesignations.map((asdRec) => ({
              type: 63,
              pkId: asdRec.pkId,
              usrn: asdRec.usrn,
              streetSpecialDesigCode: asdRec.streetSpecialDesigCode,
              swaOrgRefConsultant: asdRec.swaOrgRefConsultant,
              districtRefConsultant: asdRec.districtRefConsultant,
              wholeRoad: asdRec.wholeRoad,
              geometry:
                asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
            }))
          : [];
      const asdType64 =
        !settingsContext.isScottish && HasASD() && streetData
          ? streetData.heightWidthWeights.map((asdRec) => ({
              type: 64,
              pkId: asdRec.pkId,
              usrn: asdRec.usrn,
              hwwRestrictionCode: asdRec.hwwRestrictionCode,
              swaOrgRefConsultant: asdRec.swaOrgRefConsultant,
              districtRefConsultant: asdRec.districtRefConsultant,
              wholeRoad: asdRec.wholeRoad,
              geometry:
                asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
            }))
          : [];
      const asdType66 =
        !settingsContext.isScottish && HasASD() && streetData
          ? streetData.publicRightOfWays.map((asdRec) => ({
              type: 66,
              pkId: asdRec.pkId,
              prowUsrn: asdRec.prowUsrn,
              prowRights: asdRec.prowRights,
              prowStatus: asdRec.prowStatus,
              prowOrgRefConsultant: asdRec.prowOrgRefConsultant,
              prowDistrictRefConsultant: asdRec.prowDistrictRefConsultant,
              defMapGeometryType: asdRec.defMapGeometryType,
              geometry:
                asdRec.wktGeometry && asdRec.wktGeometry !== "" ? GetWktCoordinates(asdRec.wktGeometry) : undefined,
            }))
          : [];
      const searchStreets = [
        {
          usrn: usrn,
          description: description,
          language: language,
          locality: locality,
          town: town,
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
        },
      ];
      mapContext.onSearchDataChange(searchStreets, [], usrn, null);
    }
    mapContext.onHighlightStreetProperty([usrn.toString()], null);
  }

  /**
   * Event to handle when a property node is selected.
   *
   * @param {number} nodeId The id of the node that was selected.
   */
  const handlePropertyNodeSelect = (nodeId) => {
    const nodeData = propertyData.properties.find((x) => x.uprn.toString() === nodeId);

    if (nodeData) {
      const children = propertyData.properties.filter(
        (x) => x.parentUprn && x.parentUprn.toString() === nodeData.uprn.toString()
      );

      if (!children || children.length === 0) {
        editProperty(
          nodeData.uprn,
          nodeData.primary.address,
          nodeData.primary.postcode,
          nodeData.easting,
          nodeData.northing,
          nodeData.primary.logicalStatus,
          nodeData.blpuClass
        );
      }
    }
  };

  /**
   * Event to handle when a street node is selected.
   *
   * @param {number} nodeId The id of the node that was selected.
   */
  const handleStreetNodeSelect = (nodeId) => {
    const nodeData = streetData.street.find((x) => x.usrn.toString() === nodeId);

    if (nodeData) {
      editStreet(
        nodeData.usrn,
        nodeData.primary.address,
        nodeData.primary.language,
        nodeData.primary.locality,
        nodeData.primary.town
      );
    }
  };

  /**
   * Event to handle closing the property save dialog.
   *
   * @param {object} event The event object.
   * @param {string} reason The reason the dialog is closing
   * @returns
   */
  const handlePropertySaveClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSaveOpen(false);
  };

  /**
   * Event to handle the saving of a street.
   *
   * @param {object} currentStreet The data for the current street.
   */
  function HandleSaveStreet(currentStreet) {
    SaveStreet(
      currentStreet,
      streetContext,
      userContext,
      lookupContext,
      searchContext,
      mapContext,
      sandboxContext,
      settingsContext.isScottish,
      settingsContext.isWelsh
    ).then((result) => {
      if (result) {
        saveResult.current = true;
        saveType.current = "street";
        setSaveOpen(true);
      } else {
        saveResult.current = false;
        saveType.current = "street";
        setSaveOpen(true);
      }
    });
  }

  /**
   * Event to handle the saving of a property.
   *
   * @param {object} currentProperty The data for the current property.
   */
  function HandleSaveProperty(currentProperty) {
    SavePropertyAndUpdate(
      currentProperty,
      propertyContext.currentProperty.newProperty,
      propertyContext,
      userContext.currentUser.token,
      lookupContext,
      searchContext,
      mapContext,
      sandboxContext,
      settingsContext.isScottish,
      settingsContext.isWelsh
    ).then((result) => {
      if (result) {
        saveResult.current = true;
        saveType.current = "property";
        setSaveOpen(true);
      } else {
        saveResult.current = false;
        saveType.current = "property";
        setSaveOpen(true);
      }
    });
  }

  /**
   * Event to handle when a node from the tree view is selected.
   *
   * @param {string} nodeType The type of node that was selected.
   * @param {number} nodeId The id of the selected node.
   */
  const handleTreeViewNodeSelect = (nodeType, nodeId) => {
    if (sandboxContext.currentSandbox.sourceStreet) {
      const streetChanged = hasStreetChanged(streetContext.currentStreet.newStreet, sandboxContext.currentSandbox);

      if (streetChanged) {
        associatedRecords.current = GetChangedAssociatedRecords("street", sandboxContext, streetContext.esuDataChanged);

        const streetData = sandboxContext.currentSandbox.currentStreet
          ? sandboxContext.currentSandbox.currentStreet
          : sandboxContext.currentSandbox.sourceStreet;

        if (associatedRecords.current.length > 0) {
          saveConfirmDialog(associatedRecords.current)
            .then((result) => {
              if (result === "save") {
                if (streetContext.validateData()) {
                  failedValidation.current = false;
                  const currentStreetData = GetCurrentStreetData(
                    streetData,
                    sandboxContext,
                    lookupContext,
                    settingsContext.isWelsh,
                    settingsContext.isScottish
                  );
                  HandleSaveStreet(currentStreetData);
                } else {
                  failedValidation.current = true;
                  saveResult.current = false;
                  setSaveOpen(true);
                }
              }
              ResetContexts("street", mapContext, streetContext, propertyContext, sandboxContext);
              if (nodeType === "property") handlePropertyNodeSelect(nodeId);
              else handleStreetNodeSelect(nodeId);
            })
            .catch(() => {});
        } else {
          saveConfirmDialog(true)
            .then((result) => {
              if (result === "save") {
                HandleSaveStreet(sandboxContext.currentSandbox.currentStreet);
              }
              ResetContexts("street", mapContext, streetContext, propertyContext, sandboxContext);
              if (nodeType === "property") handlePropertyNodeSelect(nodeId);
              else handleStreetNodeSelect(nodeId);
            })
            .catch(() => {});
        }
      } else {
        ResetContexts("street", mapContext, streetContext, propertyContext, sandboxContext);
        if (nodeType === "property") handlePropertyNodeSelect(nodeId);
        else handleStreetNodeSelect(nodeId);
      }
    } else if (sandboxContext.currentSandbox.sourceProperty) {
      const propertyChanged = hasPropertyChanged(
        propertyContext.currentProperty.newProperty,
        sandboxContext.currentSandbox
      );

      if (propertyChanged) {
        associatedRecords.current = GetChangedAssociatedRecords("property", sandboxContext);

        const contextPropertyData = sandboxContext.currentSandbox.currentProperty
          ? sandboxContext.currentSandbox.currentProperty
          : sandboxContext.currentSandbox.sourceProperty;

        if (associatedRecords.current.length > 0) {
          saveConfirmDialog(associatedRecords.current)
            .then((result) => {
              if (result === "save") {
                if (propertyContext.validateData()) {
                  failedValidation.current = false;
                  const currentPropertyData = GetCurrentPropertyData(
                    contextPropertyData,
                    sandboxContext,
                    lookupContext,
                    settingsContext.isWelsh,
                    settingsContext.isScottish
                  );
                  HandleSaveProperty(currentPropertyData);
                  ResetContexts("property", mapContext, streetContext, propertyContext, sandboxContext);
                  if (nodeType === "property") handlePropertyNodeSelect(nodeId);
                  else handleStreetNodeSelect(nodeId);
                } else {
                  failedValidation.current = true;
                  saveResult.current = false;
                  setSaveOpen(true);
                }
              } else {
                ResetContexts("property", mapContext, streetContext, propertyContext, sandboxContext);
                if (nodeType === "property") handlePropertyNodeSelect(nodeId);
                else handleStreetNodeSelect(nodeId);
              }
            })
            .catch(() => {});
        } else {
          saveConfirmDialog(true)
            .then((result) => {
              if (result === "save") {
                HandleSaveProperty(sandboxContext.currentSandbox.currentProperty);
              }
              ResetContexts("property", mapContext, streetContext, propertyContext, sandboxContext);
              if (nodeType === "property") handlePropertyNodeSelect(nodeId);
              else handleStreetNodeSelect(nodeId);
            })
            .catch(() => {});
        }
      } else {
        ResetContexts("property", mapContext, streetContext, propertyContext, sandboxContext);
        if (nodeType === "property") handlePropertyNodeSelect(nodeId);
        else handleStreetNodeSelect(nodeId);
      }
    } else {
      ResetContexts("all", mapContext, streetContext, propertyContext, sandboxContext);
      if (nodeType === "property") handlePropertyNodeSelect(nodeId);
      else handleStreetNodeSelect(nodeId);
    }
  };

  /**
   * Event to handle toggling of the tree view nodes.
   *
   * @param {Array} nodeIds Tha array of node ids for the expanded nodes.
   */
  const handleTreeViewNodeToggle = (nodeIds) => {
    setExpanded(nodeIds);
  };

  /**
   * Event to handle checking of the streets.
   *
   * @param {Array} checked The list of checked items.
   */
  const handleStreetChecked = (checked) => {
    setStreetChecked(checked);
  };

  /**
   * Event to handle checking of the properties.
   *
   * @param {Array} checked The list of checked items.
   */
  const handlePropertyChecked = (checked) => {
    setPropertyChecked(checked);
  };

  /**
   * Event to handle the display of the property copy alert.
   *
   * @param {boolean} open True if the copy alert should be opened; otherwise false.
   * @param {string} dataType The type of data being copied.
   */
  const handlePropertySetCopyOpen = (open, dataType) => {
    if (onSetCopyOpen) onSetCopyOpen(open, dataType);
  };

  /**
   * Event to handle the creation of child properties.
   *
   * @param {number} usrn The USRN of the street the property.
   * @param {object} parent The parent data.
   * @param {boolean} isRange True if a range of children are to be created; otherwise false.
   */
  const handlePropertyChildAdd = (usrn, parent, isRange) => {
    if (onPropertyAdd) onPropertyAdd(usrn, parent, isRange);
  };

  /**
   * Event to handle the display of the street copy alert.
   *
   * @param {boolean} open True if the copy alert should be opened; otherwise false.
   * @param {string} dataType The type of data being copied.
   */
  const handleStreetSetCopyOpen = (open, dataType) => {
    if (onSetCopyOpen) onSetCopyOpen(open, dataType);
  };

  /**
   * Event to handle the creation of properties on a street.
   *
   * @param {number} usrn The USRN of the street the property.
   * @param {object} parent The parent data.
   * @param {boolean} isRange True if a range of children are to be created; otherwise false.
   */
  const handleStreetPropertyAdd = (usrn, parent, isRange) => {
    if (onPropertyAdd) onPropertyAdd(usrn, parent, isRange);
  };

  /**
   * Event to handle the closing of the historic dialog.
   *
   * @param {string} action The action taken from the dialog
   */
  const handleHistoricPropertyClose = (action) => {
    setOpenHistoricProperty(false);
    if (action === "continue") {
      if (historicRec.current) {
        doEditProperty(
          historicRec.current.uprn,
          historicRec.current.address,
          historicRec.current.postcode,
          historicRec.current.easting,
          historicRec.current.northing,
          historicRec.current.logicalStatus,
          historicRec.current.classificationCode
        );
      }
    }
  };

  useEffect(() => {
    if (sandboxContext.refreshRelated) {
      sandboxContext.onRefreshRelated(false);
      setStreetData(null);
      setPropertyData(null);
    }
  }, [sandboxContext]);

  useEffect(() => {
    async function SetUpRelatedData() {
      const changedParent =
        variant === "street"
          ? streetContext.currentStreet.usrn !== dataUsrn.current
          : propertyContext.currentProperty.uprn !== dataUprn.current ||
            propertyContext.currentProperty.usrn !== dataUsrn.current;
      if (
        (relatedType === "property" &&
          (!propertyData || (Object.keys(propertyData).length === 0 && propertyData.constructor === Object))) ||
        (relatedType === "street" &&
          (!streetData || (Object.keys(streetData).length === 0 && streetData.constructor === Object))) ||
        changedParent
      ) {
        if (apiUrl) {
          setLoading(true);
          const fetchUrl =
            relatedType === "property"
              ? variant === "street"
                ? streetContext.currentStreet.usrn > 0
                  ? `${apiUrl.propertyUsrn.url}/${streetContext.currentStreet.usrn}`
                  : null
                : propertyContext.currentProperty.uprn > 0
                ? `${apiUrl.propertyUprn.url}/${propertyContext.currentProperty.uprn}`
                : propertyContext.currentProperty.usrn > 0
                ? `${apiUrl.propertyUsrn.url}/${propertyContext.currentProperty.usrn}`
                : null
              : variant === "street"
              ? settingsContext.isScottish || HasASD()
                ? streetContext.currentStreet.usrn > 0
                  ? `${apiUrl.streetWithASDUsrn.url}/${streetContext.currentStreet.usrn}`
                  : null
                : streetContext.currentStreet.usrn > 0
                ? `${apiUrl.streetUsrn.url}/${streetContext.currentStreet.usrn}`
                : null
              : propertyContext.currentProperty.uprn > 0
              ? settingsContext.isScottish || HasASD()
                ? `${apiUrl.streetWithASDUprn.url}/${propertyContext.currentProperty.uprn}`
                : `${apiUrl.streetUprn.url}/${propertyContext.currentProperty.uprn}`
              : settingsContext.isScottish || HasASD()
              ? propertyContext.currentProperty.usrn > 0
                ? `${apiUrl.streetWithASDUsrn.url}/${propertyContext.currentProperty.usrn}`
                : null
              : propertyContext.currentProperty.usrn > 0
              ? `${apiUrl.streetUsrn.url}/${propertyContext.currentProperty.usrn}`
              : null;
          if (fetchUrl) {
            fetch(fetchUrl, {
              headers: apiUrl.propertyUsrn.headers,
              crossDomain: true,
              method: "GET",
            })
              .then((res) => (res.ok ? res : Promise.reject(res)))
              .then((res) => {
                if (res.status && res.status === 204) return [];
                else return res.json();
              })
              .then(
                (result) => {
                  if (relatedType === "property") setPropertyData(result);
                  else setStreetData(result);
                },
                (error) => {
                  console.error(`[ERROR] Get ${relatedType} related data`, error);
                }
              )
              .then(() => {
                if (variant === "street") dataUsrn.current = streetContext.currentStreet.usrn;
                else {
                  dataUprn.current = propertyContext.currentProperty.uprn;
                  dataUsrn.current = propertyContext.currentProperty.usrn;
                }
                setLoading(false);
              });
          }
        } else {
          console.error("[ERROR] Related apiUrl is null");
        }
      }
    }

    if (!apiUrl) {
      const relatedPropertyUsrnUrl = GetRelatedPropertyByUSRNUrl(userContext.currentUser.token);
      const relatedPropertyUprnUrl = GetRelatedPropertyByUPRNUrl(userContext.currentUser.token);
      const relatedStreetUsrnUrl = GetRelatedStreetByUSRNUrl(userContext.currentUser.token);
      const relatedStreetUprnUrl = GetRelatedStreetByUPRNUrl(userContext.currentUser.token);
      const relatedStreetWithASDUsrnUrl = GetRelatedStreetWithASDByUSRNUrl(userContext.currentUser.token);
      const relatedStreetWithASDUprnUrl = GetRelatedStreetWithASDByUPRNUrl(userContext.currentUser.token);
      setApiUrl({
        propertyUsrn: relatedPropertyUsrnUrl,
        propertyUprn: relatedPropertyUprnUrl,
        streetUsrn: relatedStreetUsrnUrl,
        streetUprn: relatedStreetUprnUrl,
        streetWithASDUsrn: relatedStreetWithASDUsrnUrl,
        streetWithASDUprn: relatedStreetWithASDUprnUrl,
      });
    } else if (!relatedType) {
      setRelatedType("property");
    } else if (
      ((!propertyData || (Object.keys(propertyData).length === 0 && propertyData.constructor === Object)) &&
        relatedType === "property") ||
      ((!streetData || (Object.keys(streetData).length === 0 && streetData.constructor === Object)) &&
        relatedType === "street") ||
      (variant === "property" &&
        ((propertyContext.currentProperty.uprn > 0 && dataUprn.current !== propertyContext.currentProperty.uprn) ||
          (propertyContext.currentProperty.usrn > 0 && dataUsrn.current !== propertyContext.currentProperty.usrn))) ||
      (variant === "street" &&
        streetContext.currentStreet.usrn > 0 &&
        dataUsrn.current !== streetContext.currentStreet.usrn)
    ) {
      SetUpRelatedData();
    }
    return () => {};
  }, [
    apiUrl,
    variant,
    streetContext,
    propertyContext,
    userContext,
    propertyData,
    streetData,
    relatedType,
    settingsContext,
  ]);

  return (
    <Fragment>
      <Box sx={toolbarStyle} id="ads-related-toolbar">
        <Stack
          sx={{ pl: "12px", pr: "12px", pt: "4px", mt: "-2px" }}
          direction="row"
          spacing={1}
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center" sx={{ height: "30px" }}>
            <Button
              autoFocus
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={() => handleTabChange("property")}
              sx={relatedType === "property" ? blueButtonStyle : greyButtonStyle}
            >
              <Typography variant="caption">Properties</Typography>
              <Avatar variant="rounded" sx={relatedAvatarStyle(propertyCount, relatedType === "property")}>
                <Typography variant="caption">
                  <strong>{propertyCount}</strong>
                </Typography>
              </Avatar>
            </Button>
            <Button
              variant="contained"
              startIcon={
                <SvgIcon
                  style={{
                    fillRule: "evenodd",
                    clipRule: "evenodd",
                    strokeLinejoin: "round",
                    strokeMiterlimit: 2,
                  }}
                >
                  <path d="M21,21L3,21L7.5,3L16.5,3L21,21ZM13,14L11,14L11,18L13,18L13,14ZM13,9L11,9L11,12L13,12L13,9ZM13,5L11,5L11,7L13,7L13,5Z" />
                </SvgIcon>
              }
              onClick={() => handleTabChange("street")}
              sx={relatedType === "street" ? blueButtonStyle : greyButtonStyle}
            >
              <Typography variant="caption">Streets</Typography>
              <Avatar variant="rounded" sx={relatedAvatarStyle(streetCount, relatedType === "street")}>
                <Typography variant="caption">
                  <strong>{streetCount}</strong>
                </Typography>
              </Avatar>
            </Button>
          </Stack>
          <Tooltip title={`${expandAll} items in list`} arrow placement="right" sx={tooltipStyle}>
            <IconButton onClick={handleExpandAll} sx={ActionIconStyle()} aria-controls="expand-collapse" size="small">
              {expandAll === "Expand all" ? <ExpandMoreIcon /> : <ExpandLessIcon />}
              <Typography variant="body2">{expandAll}</Typography>
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
      <Box sx={dataFormStyle("79.9vh")}>
        {loading ? (
          <Skeleton variant="rectangular" height="30px" width="100%" />
        ) : relatedType === "property" ? (
          <RelatedPropertyTab
            data={propertyData}
            loading={loading}
            expanded={expanded}
            checked={propertyChecked}
            onNodeSelect={(nodeType, nodeId) => handleTreeViewNodeSelect(nodeType, nodeId)}
            onNodeToggle={(nodeIds) => handleTreeViewNodeToggle(nodeIds)}
            onChecked={handlePropertyChecked}
            onSetCopyOpen={(open, dataType) => handlePropertySetCopyOpen(open, dataType)}
            onPropertyAdd={(usrn, parent, isRange) => handlePropertyChildAdd(usrn, parent, isRange)}
          />
        ) : (
          <RelatedStreetTab
            data={streetData}
            loading={loading}
            expanded={expanded}
            checked={streetChecked}
            onNodeSelect={(nodeType, nodeId) => handleTreeViewNodeSelect(nodeType, nodeId)}
            onNodeToggle={(nodeIds) => handleTreeViewNodeToggle(nodeIds)}
            onChecked={handleStreetChecked}
            onSetCopyOpen={(open, dataType) => handleStreetSetCopyOpen(open, dataType)}
            onPropertyAdd={(usrn, parent, isRange) => handleStreetPropertyAdd(usrn, parent, isRange)}
          />
        )}
      </Box>
      <div>
        <Snackbar
          open={saveOpen}
          autoHideDuration={6000}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          onClose={handlePropertySaveClose}
        >
          <Alert
            sx={GetAlertStyle(saveResult.current)}
            icon={GetAlertIcon(saveResult.current)}
            onClose={handlePropertySaveClose}
            severity={GetAlertSeverity(saveResult.current)}
            elevation={6}
            variant="filled"
          >{`${
            saveResult.current
              ? `The ${saveType.current} has been successfully saved.`
              : failedValidation.current
              ? `Failed to validate the ${saveType.current} record.`
              : `Failed to save the ${saveType.current}.`
          }`}</Alert>
        </Snackbar>
        <HistoricPropertyDialog open={openHistoricProperty} onClose={handleHistoricPropertyClose} />
      </div>
    </Fragment>
  );
}

export default RelatedTab;
