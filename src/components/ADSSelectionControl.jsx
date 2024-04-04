/* #region header */
/**************************************************************************************************
//
//  Description: Control for handling a selection of objects
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
//    002   18.04.23 Sean Flook         WI40685 Do not allow properties to be created on a closed street, a type 3/4 street or a rejected/historic parent property.
//    003   28.06.23 Sean Flook         WI40256 Changed Extent to Provenance where appropriate.
//    004   24.07.23 Sean Flook                 Removed Edit street and Edit property menu items.
//    005   07.09.23 Sean Flook                 Added code to handle selected ESUs.
//    006   20.09.23 Sean Flook                 Added ability to show streets and properties in Google street view. Also added successor, organisation and classification record types.
//    007   06.10.23 Sean Flook                 Added some error trapping and use colour variables.
//    008   27.10.23 Sean Flook       IMANN-175 Changes required for multi-edit of properties.
//    009   03.11.23 Sean Flook       IMANN-175 Use the same menu item for classification.
//    010   10.11.23 Sean Flook       IMANN-175 Changes required for Move BLPU seed point.
//    011   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system, use getClassificationCode method and renamed successor to successorCrossRef.
//    012   05.01.24 Sean Flook                 Use CSS shortcuts.
//    013   10.01.24 Sean Flook                 Hide Create street from selected ESUs button until code has been written (IMANN-216).
//    014   16.01.24 Sean Flook                 Changes required to fix warnings.
//    015   25.01.24 Sean Flook                 Changes required after UX review.
//    016   25.01.24 Sean Flook                 Make the create street button visible.
//    017   31.01.24 Joel Benford               Show addList only in dev
//    018   09.02.24 Sean Flook                 Added extents.
//    019   09.02.24 Sean Flook                 Removed Create street button for ESUs.
//    020   20.02.24 Sean Flook            MUL1 Changes required to handle selecting properties from the map.
//    021   27.02.24 Sean Flook           MUL16 Changes required to handle parent child relationships.
//    022   12.03.24 Sean Flook            MUL8 Added onPropertyMoved.
//    023   13.03.24 Sean Flook            MUL9 No need to do resets here.
//    024   25.03.24 Sean Flook           MUL16 Removed option to remove from parent.
//    025   04.04.24 Sean Flook                 Added parentUprn to mapContext search data for properties.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useEffect, Fragment } from "react";
import PropTypes from "prop-types";

import MapContext from "../context/mapContext";
import UserContext from "../context/userContext";
import StreetContext from "../context/streetContext";
import PropertyContext from "../context/propertyContext";
import SettingsContext from "../context/settingsContext";
import SandboxContext from "../context/sandboxContext";
import LookupContext from "../context/lookupContext";
import SearchContext from "../context/searchContext";
import InformationContext from "../context/informationContext";

// import { useSaveConfirmation } from "../pages/SaveConfirmationPage";

import { IconButton, Typography, Menu, MenuItem, Popper } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { NestedMenuItem } from "mui-nested-menu";
import ADSInformationControl from "../components/ADSInformationControl";
import ADSSelectionButton from "./ADSSelectionButton";
import AddPropertyWizardDialog from "../dialogs/AddPropertyWizardDialog";
import MultiEditLogicalStatusDialog from "../dialogs/MultiEditLogicalStatusDialog";
import MultiEditSingleFieldDialog from "../dialogs/MultiEditSingleFieldDialog";
import MultiEditAddressFieldsDialog from "../dialogs/MultiEditAddressFieldsDialog";
import MultiEditAddCrossReferenceDialog from "../dialogs/MultiEditAddCrossReferenceDialog";
import MultiEditRemoveCrossReferenceDialog from "../dialogs/MultiEditRemoveCrossReferenceDialog";
import MultiEditAddClassificationDialog from "../dialogs/MultiEditAddClassificationDialog";
import MoveBLPUDialog from "../dialogs/MoveBLPUDialog";

import { copyTextToClipboard, GetWktCoordinates, openInStreetView } from "../utils/HelperUtils";
import { GetStreetMapData } from "../utils/StreetUtils";
import { GetPropertyMapData, UpdateRangeAfterSave, getClassificationCode } from "../utils/PropertyUtils";
import { GetMultiEditSearchUrl } from "../configuration/ADSConfig";

import Polyline from "@arcgis/core/geometry/Polyline";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";

import ClearIcon from "@mui/icons-material/Clear";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

import { adsBlueA, adsWhite, adsLightGreyA50 } from "../utils/ADSColours";
import { menuStyle, menuItemStyle } from "../utils/ADSStyles";
import MakeChildDialog from "../dialogs/MakeChildDialog";

ADSSelectionControl.propTypes = {
  selectionCount: PropTypes.number.isRequired,
  haveStreet: PropTypes.bool,
  haveProperty: PropTypes.bool,
  haveEsu: PropTypes.bool,
  haveMapEsu: PropTypes.bool,
  haveAsd: PropTypes.bool,
  haveClassification: PropTypes.bool,
  haveOrganisation: PropTypes.bool,
  haveSuccessorCrossRef: PropTypes.bool,
  haveProvenance: PropTypes.bool,
  haveMapExtent: PropTypes.bool,
  haveCrossReference: PropTypes.bool,
  haveWizard: PropTypes.bool,
  haveMoveBlpu: PropTypes.bool,
  haveMapProperty: PropTypes.bool,
  currentStreet: PropTypes.object,
  currentEsu: PropTypes.array,
  currentProperty: PropTypes.object,
  currentAddress: PropTypes.string,
  currentClassification: PropTypes.array,
  currentOrganisation: PropTypes.array,
  currentSuccessorCrossRef: PropTypes.array,
  currentProvenance: PropTypes.array,
  currentExtent: PropTypes.array,
  currentCrossReference: PropTypes.array,
  streetUsrns: PropTypes.array,
  propertyUprns: PropTypes.array,
  onSetCopyOpen: PropTypes.func,
  onAddNote: PropTypes.func,
  onEditWizard: PropTypes.func,
  onError: PropTypes.func,
  onDeleteClassification: PropTypes.func,
  onDeleteOrganisation: PropTypes.func,
  onDeleteSuccessorCrossRef: PropTypes.func,
  onDeleteProvenance: PropTypes.func,
  onMergeExtent: PropTypes.func,
  onDeleteCrossReference: PropTypes.func,
  onDeleteWizard: PropTypes.func,
  onPropertyMoved: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

ADSSelectionControl.defaultProps = {
  haveStreet: false,
  haveProperty: false,
  haveEsu: false,
  haveMapEsu: false,
  haveAsd: false,
  haveClassification: false,
  haveOrganisation: false,
  haveSuccessorCrossRef: false,
  haveProvenance: false,
  haveMapExtent: false,
  haveCrossReference: false,
  haveWizard: false,
  haveMoveBlpu: false,
  haveMapProperty: false,
};

function ADSSelectionControl({
  selectionCount,
  haveStreet,
  haveProperty,
  haveEsu,
  haveMapEsu,
  haveAsd,
  haveClassification,
  haveOrganisation,
  haveSuccessorCrossRef,
  haveProvenance,
  haveMapExtent,
  haveCrossReference,
  haveWizard,
  haveMoveBlpu,
  haveMapProperty,
  currentStreet,
  currentEsu,
  currentProperty,
  currentAddress,
  currentClassification,
  currentOrganisation,
  currentSuccessorCrossRef,
  currentProvenance,
  currentExtent,
  currentCrossReference,
  streetUsrns,
  propertyUprns,
  onSetCopyOpen,
  onAddNote,
  onEditWizard,
  onError,
  onDeleteClassification,
  onDeleteOrganisation,
  onDeleteSuccessorCrossRef,
  onDeleteProvenance,
  onMergeExtent,
  onDeleteCrossReference,
  onDeleteWizard,
  onPropertyMoved,
  onClose,
}) {
  const mapContext = useContext(MapContext);
  const userContext = useContext(UserContext);
  const streetContext = useContext(StreetContext);
  const propertyContext = useContext(PropertyContext);
  const settingsContext = useContext(SettingsContext);
  const sandboxContext = useContext(SandboxContext);
  const lookupContext = useContext(LookupContext);
  const searchContext = useContext(SearchContext);
  const informationContext = useContext(InformationContext);

  const [anchorStreetActionsEl, setAnchorStreetActionsEl] = useState(null);
  const [anchorPropertyActionsEl, setAnchorPropertyActionsEl] = useState(null);
  const [anchorWizardActionsEl, setAnchorWizardActionsEl] = useState(null);

  const [informationAnchorEl, setInformationAnchorEl] = useState(null);
  const informationOpen = Boolean(informationAnchorEl);
  const informationId = informationOpen ? "esu-information-popper" : undefined;

  const propertyActionsOpen = Boolean(anchorPropertyActionsEl);

  const [numberOfTypes, setNumberOfTypes] = useState(0);

  const [userCanEdit, setUserCanEdit] = useState(false);

  const [currentUsrn, setCurrentUsrn] = useState(null);
  const [currentUprn, setCurrentUprn] = useState(null);

  const [propertyWizardType, setPropertyWizardType] = useState(null);
  const [propertyWizardParent, setPropertyWizardParent] = useState(null);
  const [openPropertyWizard, setOpenPropertyWizard] = useState(false);

  const [editLogicalStatusVariant, setEditLogicalStatusVariant] = useState("unknown");
  const [editSingleFieldVariant, setEditSingleFieldVariant] = useState("unknown");

  const [openEditLogicalStatus, setOpenEditLogicalStatus] = useState(false);
  const [openEditSingleField, setOpenEditSingleField] = useState(false);
  const [openEditAddressFields, setOpenEditAddressFields] = useState(false);
  const [openAddCrossReference, setOpenAddCrossReference] = useState(false);
  const [openRemoveCrossReference, setOpenRemoveCrossReference] = useState(false);
  const [openAddClassification, setOpenAddClassification] = useState(false);
  const [openMoveBlpu, setOpenMoveBlpu] = useState(false);
  const [openMakeChild, setOpenMakeChild] = useState(false);

  const [makeChildUprn, setMakeChildUprn] = useState([]);

  /**
   * Event to handle the closing.
   */
  const handleCloseClick = () => {
    if (onClose) onClose();
  };

  /**
   * Method to add a property.
   */
  async function HandleAddProperty() {
    if (currentUsrn) {
      await GetStreetMapData(Number(currentUsrn), userContext.currentUser.token, settingsContext.isScottish).then(
        (result) => {
          if (result && result.state !== 4) {
            propertyContext.resetPropertyErrors();
            propertyContext.onWizardDone(null, false, null, null);
            mapContext.onWizardSetCoordinate(null);
            setPropertyWizardType("property");
            setPropertyWizardParent(currentUsrn);
            setOpenPropertyWizard(true);
          } else {
            if (onError) onError("invalidSingleState");
          }
        }
      );
    }
  }

  /**
   * Method to add a range of properties.
   */
  async function HandleAddRange() {
    if (currentUsrn) {
      await GetStreetMapData(Number(currentUsrn), userContext.currentUser.token, settingsContext.isScottish).then(
        (result) => {
          if (result && result.state !== 4) {
            propertyContext.resetPropertyErrors();
            propertyContext.onWizardDone(null, false, null, null);
            mapContext.onWizardSetCoordinate(null);
            setPropertyWizardType("range");
            setPropertyWizardParent(currentUsrn);
            setOpenPropertyWizard(true);
          } else {
            if (onError) onError("invalidRangeState");
          }
        }
      );
    }
  }

  /**
   * Event to handle when the property wizard is done.
   */
  const handlePropertyWizardDone = () => {
    setOpenPropertyWizard(false);
  };

  /**
   * Event to handle the closing of the property wizard.
   */
  const handlePropertyWizardClose = () => {
    setOpenPropertyWizard(false);
  };

  /**
   * Event to handle when the edit logical status is closed.
   *
   * @param {array} updatedData Array of properties that have been updated
   */
  const handleEditLogicalStatusClose = (updatedData) => {
    setOpenEditLogicalStatus(false);

    if (updatedData && updatedData.length > 0) {
      UpdateRangeAfterSave(
        updatedData,
        lookupContext,
        mapContext,
        propertyContext,
        sandboxContext,
        settingsContext.isWelsh,
        searchContext
      );
    }
  };

  /**
   * Event to handle when the edit single field is closed.
   *
   * @param {array} updatedData Array of properties that have been updated
   */
  const handleEditSingleFieldClose = (updatedData) => {
    setOpenEditSingleField(false);

    if (updatedData && updatedData.length > 0) {
      UpdateRangeAfterSave(
        updatedData,
        lookupContext,
        mapContext,
        propertyContext,
        sandboxContext,
        settingsContext.isWelsh,
        searchContext
      );
    }
  };

  /**
   * Event to handle when the edit address fields is closed.
   *
   * @param {array} updatedData Array of properties that have been updated
   */
  const handleEditAddressFieldsClose = (updatedData) => {
    setOpenEditAddressFields(false);

    if (updatedData && updatedData.length > 0) {
      UpdateRangeAfterSave(
        updatedData,
        lookupContext,
        mapContext,
        propertyContext,
        sandboxContext,
        settingsContext.isWelsh,
        searchContext
      );
    }
  };

  /**
   * Event to handle when the add cross reference is closed.
   *
   * @param {array} updatedData Array of properties that have been updated
   */
  const handleAddCrossReferenceClose = (updatedData) => {
    setOpenAddCrossReference(false);

    if (updatedData && updatedData.length > 0) {
      UpdateRangeAfterSave(
        updatedData,
        lookupContext,
        mapContext,
        propertyContext,
        sandboxContext,
        settingsContext.isWelsh,
        searchContext
      );
    }
  };

  /**
   * Event to handle when the remove cross reference is closed.
   *
   * @param {array} updatedData Array of properties that have been updated
   */
  const handleRemoveCrossReferenceClose = (updatedData) => {
    setOpenRemoveCrossReference(false);

    if (updatedData && updatedData.length > 0) {
      UpdateRangeAfterSave(
        updatedData,
        lookupContext,
        mapContext,
        propertyContext,
        sandboxContext,
        settingsContext.isWelsh,
        searchContext
      );
    }
  };

  /**
   * Event to handle when the add classification is closed.
   *
   * @param {array} updatedData Array of properties that have been updated
   */
  const handleAddClassificationClose = (updatedData) => {
    setOpenAddClassification(false);

    if (updatedData && updatedData.length > 0) {
      UpdateRangeAfterSave(
        updatedData,
        lookupContext,
        mapContext,
        propertyContext,
        sandboxContext,
        settingsContext.isWelsh,
        searchContext
      );
    }
  };

  /**
   * event to handle when the move BLPU seed point dialog is closed.
   *
   * @param {boolean} saved True if the changes have been saved; otherwise false
   */
  const handleMoveBlpuClose = (saved) => {
    setOpenMoveBlpu(false);
    if (saved && onPropertyMoved) onPropertyMoved();
  };

  /**
   * event to handle when the make child of dialog is closed.
   */
  const handleMakeChildClose = () => {
    setOpenMakeChild(false);
    searchContext.onHideSearch(false);
  };

  /**
   * event to handle when the remove from list item is clicked.
   */
  const handleRemoveFromList = () => {
    const newStreetSearchData =
      haveStreet && streetUsrns
        ? searchContext.currentSearchData.results.filter((x) => x.type === 15 && !streetUsrns.includes(x.usrn))
        : searchContext.currentSearchData.results.filter((x) => x.type === 15);
    const newPropertySearchData =
      haveProperty && propertyUprns
        ? searchContext.currentSearchData.results.filter((x) => x.type === 24 && !propertyUprns.includes(x.uprn))
        : searchContext.currentSearchData.results.filter((x) => x.type === 24);
    const newSearchData = newStreetSearchData.concat(newPropertySearchData);

    const newMapSearchStreets =
      haveStreet && streetUsrns
        ? mapContext.currentSearchData.streets.filter((x) => !streetUsrns.includes(x.usrn))
        : mapContext.currentSearchData.streets;
    const newMapSearchProperties =
      haveProperty && propertyUprns
        ? mapContext.currentSearchData.properties.filter((x) => !propertyUprns.includes(x.uprn))
        : mapContext.currentSearchData.properties;

    searchContext.onSearchDataChange(searchContext.currentSearchData.searchString, newSearchData);
    mapContext.onSearchDataChange(newMapSearchStreets, newMapSearchProperties, null, null);
    if (onClose) onClose();
  };

  /**
   * Method to zoom the map to a given street.
   *
   * @param {object} event The event object.
   * @param {number} usrn The USRN of the street.
   */
  async function zoomToStreet(event, usrn) {
    setAnchorStreetActionsEl(null);

    event.stopPropagation();

    const found = mapContext.currentSearchData.streets.find((rec) => rec.usrn === usrn);

    const streetData = await GetStreetMapData(usrn, userContext.currentUser.token, settingsContext.isScottish);

    const zoomStreet = {
      usrn: usrn,
      minX: streetData.streetStartX < streetData.streetEndX ? streetData.streetStartX : streetData.streetEndX,
      minY: streetData.streetStartY < streetData.streetEndY ? streetData.streetStartY : streetData.streetEndY,
      maxX: streetData.streetStartX > streetData.streetEndX ? streetData.streetStartX : streetData.streetEndX,
      maxY: streetData.streetStartY > streetData.streetEndY ? streetData.streetStartY : streetData.streetEndY,
    };

    if (found) {
      mapContext.onMapChange(mapContext.currentLayers.extents, zoomStreet, null);
    }
  }

  /**
   * Event to handle adding the street to the activity list.
   */
  const handleAddStreetToActivityList = () => {};

  /**
   * Event to handle the display of the street context menu.
   *
   * @param {object} event The event object.
   */
  const handleStreetActionsMenuClick = (event) => {
    setAnchorStreetActionsEl(event.nativeEvent.target);
    event.stopPropagation();
  };

  /**
   * Event to handle the closing of the street context menu.
   *
   * @param {object} event The event object.
   */
  const handleStreetActionsMenuClose = (event) => {
    setAnchorStreetActionsEl(null);
    event.stopPropagation();
  };

  /**
   * Event to handle the clicking on the divide ESU button.
   *
   * @param {object} event The event object.
   */
  const handleDivideEsuClick = (event) => {
    event.stopPropagation();
    if (streetContext.esuDividedMerged) {
      if (onError) onError("streetAlreadyDividedMerged");
    }
    if (currentEsu && currentEsu.length === 1) {
      informationContext.onDisplayInformation("divideESU", "ADSSelectionControl");
      mapContext.onDivideEsu(currentEsu[0]);
    } else mapContext.onDivideEsu(null);
  };

  /**
   * Event to handle when the information cancel button is clicked.
   */
  const handleInformationCancel = () => {
    informationContext.onClearInformation();
  };

  /**
   * Event to handle when the merge ESUs button is clicked.
   *
   * @param {object} event The event object.
   */
  const handleMergeEsusClick = (event) => {
    event.stopPropagation();
    if (streetContext.esuDividedMerged) {
      if (onError) onError("streetAlreadyDividedMerged");
    } else if (currentEsu && currentEsu.length === 2) {
      const contextStreet = sandboxContext.currentSandbox.currentStreet || sandboxContext.currentSandbox.sourceStreet;
      const originalEsu1 = contextStreet.esus.find((x) => x.esuId === currentEsu[0]);
      const originalEsu2 = contextStreet.esus.find((x) => x.esuId === currentEsu[1]);

      if (originalEsu1 && originalEsu2) {
        const esu1 = new Polyline({
          type: "polyline",
          paths:
            originalEsu1.wktGeometry && originalEsu1.wktGeometry !== ""
              ? GetWktCoordinates(originalEsu1.wktGeometry)
              : undefined,
          spatialReference: { wkid: 27700 },
        });

        const esu2 = new Polyline({
          type: "polyline",
          paths:
            originalEsu2.wktGeometry && originalEsu2.wktGeometry !== ""
              ? GetWktCoordinates(originalEsu2.wktGeometry)
              : undefined,
          spatialReference: { wkid: 27700 },
        });

        const isDisjointed = geometryEngine.disjoint(esu1, esu2);

        if (isDisjointed) {
          if (onError) onError("invalidMergeEsu");
        } else {
          const newEsuGeometry = geometryEngine.union([esu1, esu2]);
          streetContext.onMergedEsus(currentEsu[0], currentEsu[1], newEsuGeometry);
          if (onClose) onClose();
        }
      }
    }
  };

  /**
   * Event to handle when the unassign ESU button is clicked.
   *
   * @param {object} event The event object.
   */
  const handleUnassignEsuClick = (event) => {
    event.stopPropagation();
    if (currentEsu && currentEsu.length > 0) {
      streetContext.onUnassignEsus(currentEsu);
      if (onClose) onClose();
    }
  };

  /**
   * Event to handle when the assign ESU button is clicked.
   *
   * @param {object} event The event object.
   */
  const handleAssignEsuClick = (event) => {
    event.stopPropagation();
    if (currentEsu && currentEsu.length > 0) {
      streetContext.onAssignEsus(currentEsu);
      if (onClose) onClose();
    }
  };

  /**
   * Event to handle when the create street button is clicked.
   *
   * @param {object} event The event object.
   */
  // const handleCreateStreetClick = (event) => {
  //   event.stopPropagation();
  //   if (currentEsu && currentEsu.length > 0) {
  //     streetContext.onLeavingStreet("createStreet", currentEsu);
  //   }
  // };

  /**
   * Event to handle when the delete ASD button is clicked.
   *
   * @param {object} event The event object.
   */
  const handleDeleteAsdClick = (event) => {
    event.stopPropagation();
  };

  /**
   * Event to handle adding a child record.
   */
  async function HandleAddChild() {
    if (currentUprn) {
      setPropertyWizardType("child");
      setPropertyWizardParent(currentUprn);
      setOpenPropertyWizard(true);
    }
  }

  /**
   * Event to handle adding a range of child properties.
   */
  function HandleAddChildren() {
    if (currentUprn) {
      setPropertyWizardType("rangeChildren");
      setPropertyWizardParent(currentUprn);
      setOpenPropertyWizard(true);
    }
  }

  /**
   * Event to handle opening a property.
   */
  async function HandleOpenProperty() {
    if (currentUprn) {
      const propertyData = await GetPropertyMapData(Number(currentUprn), userContext.currentUser.token);

      propertyContext.onPropertyChange(
        propertyData.uprn,
        0,
        propertyData.address,
        propertyData.address,
        propertyData.postcode,
        propertyData.easting,
        propertyData.northing,
        false,
        null
      );
      const foundProperty = mapContext.currentSearchData.properties.find(({ uprn }) => uprn === propertyData.uprn);
      const currentSearchProperties = mapContext.currentSearchData.properties;

      if (!foundProperty) {
        currentSearchProperties.push({
          uprn: propertyData.uprn,
          parentUprn: propertyData.parentUprn,
          address: propertyData.address,
          postcode: propertyData.postcode,
          easting: propertyData.easting,
          northing: propertyData.northing,
          logicalStatus: propertyData.logicalStatus,
          classificationCode: getClassificationCode(propertyData),
        });
      }
      const extents = propertyData
        ? propertyData.blpuProvenances.map((rec) => ({
            pkId: rec.pkId,
            uprn: propertyData.uprn,
            code: rec.provenanceCode,
            geometry: rec.wktGeometry && rec.wktGeometry !== "" ? GetWktCoordinates(rec.wktGeometry) : undefined,
          }))
        : undefined;

      mapContext.onSearchDataChange(
        mapContext.currentSearchData.streets,
        currentSearchProperties,
        null,
        propertyData.uprn
      );
      mapContext.onMapChange(extents, null, null);
    }
  }

  /**
   * Method to zoom to a given property.
   *
   * @param {object} event The event object.
   * @param {number} uprn The UPRN of the property.
   */
  const zoomToProperty = (event, uprn) => {
    setAnchorPropertyActionsEl(null);

    event.stopPropagation();

    const found = mapContext.currentSearchData.properties.find((rec) => rec.uprn === uprn);

    if (found) {
      mapContext.onMapChange(mapContext.currentLayers.extents, null, uprn);
    }
  };

  /**
   * Event to handle when the make child of menu item is clicked.
   */
  const handleMakeChildOf = () => {
    setAnchorPropertyActionsEl(null);

    if (selectionCount === 1) {
      setMakeChildUprn([Number(currentUprn)]);
    } else {
      setMakeChildUprn(propertyUprns);
    }
    setOpenMakeChild(true);
    searchContext.onHideSearch(true);
  };

  /**
   * Event to handle when the set approved button is clicked
   */
  const handleSetApprovedButtonClicked = () => {
    setEditLogicalStatusVariant("approved");
    setOpenEditLogicalStatus(true);
  };

  /**
   * Event to handle adding a property to the activity list.
   */
  const handleAddPropertyToActivityList = () => {};

  /**
   * Event to handle when the move button is clicked.
   */
  const handleMoveBlpuButtonClicked = () => {
    setOpenMoveBlpu(true);
  };

  /**
   * Method to reject a property.
   */
  async function RejectProperty() {
    if (currentUprn) {
      await HandleOpenProperty();

      propertyContext.onLogicalStatusChange(9);

      const found = mapContext.currentSearchData.properties.find((x) => x.uprn === Number(currentUprn));

      if (found) {
        const updatedProperty = {
          uprn: found.uprn,
          parentUprn: found.parentUprn,
          address: found.address,
          postcode: found.postcode,
          easting: found.easting,
          northing: found.northing,
          logicalStatus: 9,
          classificationCode: found.classificationCode,
        };

        const currentSearchProperties = mapContext.currentSearchData.properties.map(
          (x) => [updatedProperty].find((rec) => rec.uprn === x.uprn) || x
        );

        mapContext.onSearchDataChange(
          mapContext.currentSearchData.streets,
          currentSearchProperties,
          null,
          Number(currentUprn)
        );
      }
    }
  }

  /**
   * Method to historicise a property.
   */
  async function HistoriciseProperty() {
    if (currentUprn) {
      await HandleOpenProperty();

      propertyContext.onLogicalStatusChange(8);

      const found = mapContext.currentSearchData.properties.find((x) => x.uprn === Number(currentUprn));

      if (found) {
        const updatedProperty = {
          uprn: found.uprn,
          parentUprn: found.parentUprn,
          address: found.address,
          postcode: found.postcode,
          easting: found.easting,
          northing: found.northing,
          logicalStatus: 8,
          classificationCode: found.classificationCode,
        };

        const currentSearchProperties = mapContext.currentSearchData.properties.map(
          (x) => [updatedProperty].find((rec) => rec.uprn === x.uprn) || x
        );

        mapContext.onSearchDataChange(
          mapContext.currentSearchData.streets,
          currentSearchProperties,
          null,
          Number(currentUprn)
        );
      }
    }
  }

  /**
   * Event to handle when the set approved menu item is clicked
   */
  const handleSetApprovedClick = () => {
    setAnchorPropertyActionsEl(null);
    setEditLogicalStatusVariant("approved");
    setOpenEditLogicalStatus(true);
  };

  /**
   * Event to handle when the set historic menu item is clicked
   */
  const handleSetHistoricClick = () => {
    setAnchorPropertyActionsEl(null);
    setEditLogicalStatusVariant("historic");
    setOpenEditLogicalStatus(true);
  };

  /**
   * Method to handle displaying the single field multi-edit dialog.
   *
   * @param {string} variant The single field that should be edited/added.
   */
  const displaySingleFieldDialog = (variant) => {
    setAnchorPropertyActionsEl(null);
    setEditSingleFieldVariant(variant);
    setOpenEditSingleField(true);
  };

  /**
   * Event to handle when the edit classification menu item is clicked
   */
  const handleEditClassificationClick = () => {
    if (!settingsContext.isScottish) displaySingleFieldDialog("classification");
    else {
      setAnchorPropertyActionsEl(null);
      setOpenAddClassification(true);
    }
  };

  /**
   * Event to handle when the edit RPC menu item is clicked
   */
  const handleEditRpcClick = () => {
    displaySingleFieldDialog("rpc");
  };

  /**
   * Event to handle when the edit level menu item is clicked
   */
  const handleEditLevelClick = () => {
    displaySingleFieldDialog("level");
  };

  /**
   * Event to handle when the edit exclude from export menu item is clicked
   */
  const handleEditExcludeFromExportClick = () => {
    displaySingleFieldDialog("excludeFromExport");
  };

  /**
   * Event to handle when the edit site visit required menu item is clicked
   */
  const handleEditSiteVisitRequiredClick = () => {
    displaySingleFieldDialog("siteVisitRequired");
  };

  /**
   * Event to handle when the add note menu item is clicked
   */
  const handleAddNoteClick = () => {
    displaySingleFieldDialog("note");
  };

  /**
   * Event to handle when the move BLPU seed point menu item is clicked
   */
  const handleMoveBlpuClick = () => {
    setAnchorPropertyActionsEl(null);
    setOpenMoveBlpu(true);
  };

  /**
   * Event to handle when the edit address fields menu item is clicked
   */
  const handleEditAddressFieldsClick = () => {
    setAnchorPropertyActionsEl(null);
    setOpenEditAddressFields(true);
  };

  const handlePlotToAddressWizardClick = () => {};

  /**
   * Event to handle when the add cross reference menu item is clicked
   */
  const handleAddCrossReferenceClick = () => {
    setAnchorPropertyActionsEl(null);
    setOpenAddCrossReference(true);
  };

  /**
   * Event to handle when the remove cross reference menu item is clicked
   */
  const handleRemoveCrossReferenceClick = () => {
    setAnchorPropertyActionsEl(null);
    setOpenRemoveCrossReference(true);
  };

  /**
   * Event to handle when the create new list button is clicked
   */
  const handleCreateNewList = () => {
    handlePropertiesSelected("new");
  };

  /**
   * Event to handle when the add to existing list button is clicked
   */
  const handleAddToExistingList = () => {
    handlePropertiesSelected("existing");
  };

  const handlePropertiesSelected = async (action) => {
    const searchMultiEditUrl = GetMultiEditSearchUrl(userContext.currentUser.token);

    if (searchMultiEditUrl) {
      const newSearchData = await fetch(`${searchMultiEditUrl.url}/${propertyUprns.join()}`, {
        headers: searchMultiEditUrl.headers,
        crossDomain: true,
        method: searchMultiEditUrl.type,
      })
        .then((res) => (res.ok ? res : Promise.reject(res)))
        .then((res) => {
          switch (res.status) {
            case 200:
              return res.json();

            case 204:
              console.log("[DEBUG] handlePropertiesSelected: No content found");
              return null;

            case 401:
              console.error(
                "[401 ERROR] handlePropertiesSelected: Authorization details are not valid or have expired.",
                res
              );
              return null;

            default:
              console.error("[ERROR] handlePropertiesSelected: Unexpected error.", res);
              return null;
          }
        })
        .then(
          (result) => {
            return result;
          },
          (error) => {
            console.error("[ERROR] handlePropertiesSelected: Unexpected error.", error);
            return null;
          }
        );

      if (newSearchData) searchContext.onPropertiesSelected(action, propertyUprns, newSearchData);
    }

    if (onClose) onClose();
  };

  /**
   * Event to handle deleting a classification
   */
  const handleDeleteClassification = () => {
    if (currentClassification && currentClassification.length > 0 && onDeleteClassification) onDeleteClassification();
  };

  /**
   * Event to handle deleting a organisation
   */
  const handleDeleteOrganisation = () => {
    if (currentOrganisation && currentOrganisation.length > 0 && onDeleteOrganisation) onDeleteOrganisation();
  };

  /**
   * Event to handle deleting a successor cross reference
   */
  const handleDeleteSuccessorCrossRef = () => {
    if (currentSuccessorCrossRef && currentSuccessorCrossRef.length > 0 && onDeleteSuccessorCrossRef)
      onDeleteSuccessorCrossRef();
  };

  /**
   * Event to handle deleting a provenance
   */
  const handleDeleteProvenance = () => {
    if (currentProvenance && currentProvenance.length > 0 && onDeleteProvenance) onDeleteProvenance();
  };

  /**
   * Event to handle merging extents
   */
  const handleMergeExtent = () => {
    if (currentExtent && currentExtent.length > 0 && onMergeExtent) onMergeExtent();
  };

  /**
   * Event to handle deleting a cross reference
   */
  const handleDeleteCrossReference = () => {
    if (currentCrossReference && currentCrossReference.length > 0 && onDeleteCrossReference) onDeleteCrossReference();
  };

  /**
   * Event to handle adding a note.
   */
  const handleAddNote = () => {
    setAnchorWizardActionsEl(null);
    if (onAddNote) onAddNote();
  };

  /**
   * Event to handle editing the classification.
   */
  const handleEditClassification = () => {
    setAnchorWizardActionsEl(null);
    if (onEditWizard) onEditWizard("classification");
  };

  /**
   * Event to handle editing the level.
   */
  const handleEditLevel = () => {
    setAnchorWizardActionsEl(null);
    if (onEditWizard) onEditWizard("level");
  };

  /**
   * Event to handle editing the postcode.
   */
  const handleEditPostcode = () => {
    setAnchorWizardActionsEl(null);
    if (onEditWizard) onEditWizard("postcode");
  };

  /**
   * Event to handle editing the post town.
   */
  const handleEditPostTown = () => {
    setAnchorWizardActionsEl(null);
    if (onEditWizard) onEditWizard("postTown");
  };

  /**
   * Event to handle editing the sub-locality.
   */
  const handleEditSubLocality = () => {
    setAnchorWizardActionsEl(null);
    if (onEditWizard) onEditWizard("subLocality");
  };

  /**
   * Event to handle editing the RPC.
   */
  const handleEditRpc = () => {
    setAnchorWizardActionsEl(null);
    if (onEditWizard) onEditWizard("rpc");
  };

  /**
   * Event to handle the delete wizard.
   */
  const handleDeleteWizard = () => {
    setAnchorWizardActionsEl(null);
    if (onDeleteWizard) onDeleteWizard();
  };

  /**
   * Event to handle displaying the property context menu.
   *
   * @param {object} event The event object.
   */
  const handlePropertyActionsMenuClick = (event) => {
    setAnchorPropertyActionsEl(event.nativeEvent.target);
    event.stopPropagation();
  };

  /**
   * Event to handle the closing of the property context menu.
   *
   * @param {object} event The event object.
   */
  const handlePropertyActionsMenuClose = (event) => {
    setAnchorPropertyActionsEl(null);
    event.stopPropagation();
  };

  /**
   * Event to handle displaying the wizard context menu.
   *
   * @param {object} event The event object.
   */
  const handleWizardActionsMenuClick = (event) => {
    setAnchorWizardActionsEl(event.nativeEvent.target);
    event.stopPropagation();
  };

  /**
   * Event to handle the closing of the wizard context menu.
   *
   * @param {object} event The event object.
   */
  const handleWizardActionsMenuClose = (event) => {
    setAnchorWizardActionsEl(null);
    event.stopPropagation();
  };

  /**
   * Method used to copy the text to the clipboard.
   *
   * @param {object} event The event object.
   * @param {string|null} text The text that needs to be copied to the clipboard.
   * @param {string} dataType The type of data that is being copied to the clipboard.
   */
  const itemCopy = (event, text, dataType) => {
    event.stopPropagation();
    if (text) {
      copyTextToClipboard(text);
      if (onSetCopyOpen) onSetCopyOpen(dataType);
    }
  };

  /**
   * Display the street/property in Google Street View.
   *
   * @param {object} event The event object
   * @param {object} rec The record that needs to be displayed in Google Street View.
   */
  async function handleStreetViewClick(event, dataId, dataType) {
    if (dataId) {
      if (dataType === "USRN") {
        handleStreetActionsMenuClose(event);

        await GetStreetMapData(dataId, userContext.currentUser.token, settingsContext.isScottish).then((result) => {
          if (result && result.esus && result.esus.length > 0) {
            const esuPoints = result.esus[0].wktGeometry.replace("LINESTRING (", "").replace(")").split(",");

            if (esuPoints && esuPoints.length > 0) {
              const firstEsuPointString = esuPoints[0].split(" ");
              if (firstEsuPointString) {
                const bngPoint = [Number(firstEsuPointString[0]), Number(firstEsuPointString[1])];
                openInStreetView(bngPoint);
              }
            }
          }
        });
      } else {
        handlePropertyActionsMenuClose(event);
        const found = mapContext.currentSearchData.properties.find((rec) => rec.uprn === dataId);
        if (found && found.easting && found.northing) openInStreetView([found.easting, found.northing]);
      }
    }
  }

  /**
   * Method to get the styling for the control.
   *
   * @returns {object} The styling for the control.
   */
  const getControlStyle = () => {
    if (!haveWizard && !haveMoveBlpu)
      return {
        position: "absolute",
        left: "32.75vw",
        top: "-52px",
        marginTop: "8px",
        boxShadow: `4px 4px 7px ${adsLightGreyA50}`,
        borderRadius: "9px",
        backgroundColor: adsWhite,
        zIndex: 1,
      };
    else
      return {
        position: "absolute",
        left: "34vw",
        top: "76px",
        boxShadow: `4px 4px 7px ${adsLightGreyA50}`,
        borderRadius: "9px",
        backgroundColor: adsWhite,
        zIndex: 1,
      };
  };

  useEffect(() => {
    let numTypes = 0;
    if (haveStreet) numTypes++;
    if (haveProperty) numTypes++;
    if (haveEsu) numTypes++;
    if (haveMapEsu) numTypes++;
    if (haveAsd) numTypes++;
    if (haveClassification) numTypes++;
    if (haveOrganisation) numTypes++;
    if (haveSuccessorCrossRef) numTypes++;
    if (haveProvenance) numTypes++;
    if (haveMapExtent) numTypes++;
    if (haveCrossReference) numTypes++;
    if (haveWizard) numTypes++;
    if (haveMoveBlpu) numTypes++;
    if (haveMapProperty) numTypes++;

    setNumberOfTypes(numTypes);
  }, [
    haveStreet,
    haveProperty,
    haveEsu,
    haveMapEsu,
    haveAsd,
    haveClassification,
    haveOrganisation,
    haveSuccessorCrossRef,
    haveProvenance,
    haveMapExtent,
    haveCrossReference,
    haveWizard,
    haveMoveBlpu,
    haveMapProperty,
  ]);

  useEffect(() => {
    if (currentStreet) setCurrentUsrn(currentStreet.id);
    else setCurrentUsrn(null);
  }, [currentStreet]);

  useEffect(() => {
    if (currentProperty) setCurrentUprn(currentProperty.id);
    else setCurrentUprn(null);
  }, [currentProperty]);

  useEffect(() => {
    setUserCanEdit(userContext.currentUser && userContext.currentUser.canEdit);
  }, [userContext]);

  useEffect(() => {
    if (informationContext.informationSource && informationContext.informationSource === "ADSSelectionControl")
      setInformationAnchorEl(document.getElementById("ads-esu-data-grid"));
    else setInformationAnchorEl(null);
  }, [informationContext.informationSource]);

  return (
    <Fragment>
      <Box id="ads-selection-control" sx={getControlStyle()}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ padding: "4px 12px 4px 0px" }}>
          <Stack
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            spacing={1}
            sx={{ paddingRight: "32px" }}
          >
            <IconButton onClick={handleCloseClick} size="small" title="Clear selection">
              <ClearIcon sx={{ backgroundColor: adsBlueA, color: adsWhite }} />
            </IconButton>
            <Typography variant="body2" noWrap>{`${selectionCount} selected`}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={1}>
            {numberOfTypes > 1 &&
              (numberOfTypes === 2 && haveStreet && haveProperty ? (
                <ADSSelectionButton
                  variant="removeFromList"
                  selectionCount={selectionCount}
                  userCanEdit
                  onClick={handleRemoveFromList}
                />
              ) : (
                <Typography variant="body2" color="error">
                  No shared actions
                </Typography>
              ))}
            {numberOfTypes === 1 && haveStreet && (
              <Fragment>
                {selectionCount === 1 && (
                  <ADSSelectionButton
                    variant="zoom"
                    selectionCount={selectionCount}
                    userCanEdit
                    onClick={(event) => zoomToStreet(event, Number(currentUsrn))}
                  />
                )}
                {process.env.NODE_ENV === "development" && (
                  <ADSSelectionButton
                    variant="addList"
                    selectionCount={selectionCount}
                    onClick={handleAddStreetToActivityList}
                  />
                )}
                <ADSSelectionButton
                  variant="more"
                  selectionCount={selectionCount}
                  menuControlId="street-actions-menu"
                  onClick={handleStreetActionsMenuClick}
                />
                {selectionCount === 1 ? (
                  <Menu
                    id="single-street-actions-menu"
                    elevation={2}
                    anchorEl={anchorStreetActionsEl}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "right",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    keepMounted
                    open={Boolean(anchorStreetActionsEl)}
                    onClose={handleStreetActionsMenuClose}
                    sx={menuStyle}
                  >
                    <MenuItem
                      dense
                      disabled={!userCanEdit || (currentStreet && ![11, 12, 19].includes(currentStreet.logical_status))}
                      onClick={HandleAddProperty}
                      sx={menuItemStyle(false)}
                    >
                      <Typography variant="inherit">Add property</Typography>
                    </MenuItem>
                    <MenuItem
                      dense
                      divider
                      disabled={!userCanEdit || (currentStreet && ![11, 12, 19].includes(currentStreet.logical_status))}
                      onClick={HandleAddRange}
                      sx={menuItemStyle(true)}
                    >
                      <Typography variant="inherit">Add properties</Typography>
                    </MenuItem>
                    <MenuItem dense onClick={(event) => itemCopy(event, currentUsrn, "USRN")} sx={menuItemStyle(false)}>
                      <Typography variant="inherit">Copy USRN</Typography>
                    </MenuItem>
                    <MenuItem
                      dense
                      onClick={(event) => handleStreetViewClick(event, currentUsrn, "USRN")}
                      sx={menuItemStyle(false)}
                    >
                      <Typography variant="inherit">Open in Street View</Typography>
                    </MenuItem>
                    {process.env.NODE_ENV === "development" && (
                      <MenuItem dense disabled sx={menuItemStyle(false)}>
                        <Typography variant="inherit">Search nearby</Typography>
                      </MenuItem>
                    )}
                    <MenuItem
                      dense
                      divider
                      onClick={(event) => zoomToStreet(event, Number(currentUsrn))}
                      sx={menuItemStyle(true)}
                    >
                      <Typography variant="inherit">Zoom to this</Typography>
                    </MenuItem>
                    {process.env.NODE_ENV === "development" && (
                      <MenuItem dense disabled sx={menuItemStyle(false)}>
                        <Typography variant="inherit">Bookmark</Typography>
                      </MenuItem>
                    )}
                    {process.env.NODE_ENV === "development" && (
                      <MenuItem dense disabled sx={menuItemStyle(true)}>
                        <Typography variant="inherit">Add to list</Typography>
                      </MenuItem>
                    )}
                    <MenuItem dense divider onClick={handleRemoveFromList} sx={menuItemStyle(true)}>
                      <Typography variant="inherit">Remove from list</Typography>
                    </MenuItem>
                    {process.env.NODE_ENV === "development" && (
                      <MenuItem dense disabled sx={menuItemStyle(false)}>
                        <Typography variant="inherit">Close street</Typography>
                      </MenuItem>
                    )}
                    {!settingsContext.isScottish && (
                      <MenuItem dense disabled sx={menuItemStyle(false)}>
                        <Typography variant="inherit" color="error">
                          Delete
                        </Typography>
                      </MenuItem>
                    )}
                  </Menu>
                ) : (
                  <Menu
                    id="multiple-street-actions-menu"
                    elevation={2}
                    anchorEl={anchorStreetActionsEl}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "right",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    keepMounted
                    open={Boolean(anchorStreetActionsEl)}
                    onClose={handleStreetActionsMenuClose}
                    sx={menuStyle}
                  >
                    {process.env.NODE_ENV === "development" && (
                      <MenuItem dense disabled sx={menuItemStyle(false)}>
                        <Typography variant="inherit">Search nearby</Typography>
                      </MenuItem>
                    )}
                    {process.env.NODE_ENV === "development" && (
                      <MenuItem dense disabled sx={menuItemStyle(false)}>
                        <Typography variant="inherit">Bookmark</Typography>
                      </MenuItem>
                    )}
                    {process.env.NODE_ENV === "development" && (
                      <MenuItem dense disabled sx={menuItemStyle(true)}>
                        <Typography variant="inherit">Add to list</Typography>
                      </MenuItem>
                    )}
                    <MenuItem dense divider onClick={handleRemoveFromList} sx={menuItemStyle(true)}>
                      <Typography variant="inherit">Remove from list</Typography>
                    </MenuItem>
                    {process.env.NODE_ENV === "development" && (
                      <MenuItem dense disabled sx={menuItemStyle(false)}>
                        <Typography variant="inherit">Close street</Typography>
                      </MenuItem>
                    )}
                    {!settingsContext.isScottish && (
                      <MenuItem dense disabled sx={menuItemStyle(false)}>
                        <Typography variant="inherit" color="error">
                          Delete
                        </Typography>
                      </MenuItem>
                    )}
                  </Menu>
                )}
              </Fragment>
            )}
            {numberOfTypes === 1 && haveEsu && (
              <Fragment>
                {selectionCount === 1 ? (
                  <ADSSelectionButton
                    variant="divide"
                    selectionCount={selectionCount}
                    isDisabled={!userCanEdit}
                    isSelected={informationOpen}
                    onClick={handleDivideEsuClick}
                  />
                ) : selectionCount === 2 ? (
                  <ADSSelectionButton
                    variant="merge"
                    selectionCount={selectionCount}
                    isDisabled={!userCanEdit}
                    onClick={handleMergeEsusClick}
                  />
                ) : null}
                <ADSSelectionButton
                  variant="unassign"
                  selectionCount={selectionCount}
                  onClick={handleUnassignEsuClick}
                />
                {/* <ADSSelectionButton
                  variant="createStreet"
                  isDisabled={!userCanEdit}
                  selectionCount={selectionCount}
                  onClick={handleCreateStreetClick}
                /> */}
              </Fragment>
            )}
            {numberOfTypes === 1 && haveMapEsu && (
              <Fragment>
                <ADSSelectionButton
                  variant="assign"
                  isDisabled={!userCanEdit}
                  selectionCount={selectionCount}
                  onClick={handleAssignEsuClick}
                />
                {/* <ADSSelectionButton
                  variant="createStreet"
                  isDisabled={!userCanEdit}
                  selectionCount={selectionCount}
                  onClick={handleCreateStreetClick}
                /> */}
              </Fragment>
            )}
            {numberOfTypes === 1 && haveAsd && (
              <ADSSelectionButton
                variant="deleteAsd"
                isDisabled
                selectionCount={selectionCount}
                onClick={handleDeleteAsdClick}
              />
            )}
            {numberOfTypes === 1 && haveProperty && (
              <Fragment>
                {selectionCount === 1 && (
                  <ADSSelectionButton
                    variant="zoom"
                    selectionCount={selectionCount}
                    onClick={(event) => zoomToProperty(event, currentUprn)}
                  />
                )}
                <ADSSelectionButton
                  variant="approved"
                  selectionCount={selectionCount}
                  onClick={handleSetApprovedButtonClicked}
                />
                {process.env.NODE_ENV === "development" && (
                  <ADSSelectionButton
                    variant="addList"
                    isDisabled
                    selectionCount={selectionCount}
                    onClick={handleAddPropertyToActivityList}
                  />
                )}
                <ADSSelectionButton
                  variant="moveBlpu"
                  selectionCount={selectionCount}
                  onClick={handleMoveBlpuButtonClicked}
                />
                <ADSSelectionButton
                  variant="more"
                  selectionCount={selectionCount}
                  menuControlId="property-actions-menu"
                  onClick={handlePropertyActionsMenuClick}
                />
                {selectionCount === 1 ? (
                  <Menu
                    id="single-property-actions-menu"
                    elevation={2}
                    anchorEl={anchorPropertyActionsEl}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "right",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    keepMounted
                    open={Boolean(anchorPropertyActionsEl)}
                    onClose={handlePropertyActionsMenuClose}
                    sx={menuStyle}
                  >
                    <MenuItem
                      dense
                      disabled={!userCanEdit || (currentProperty && currentProperty.logical_status > 6)}
                      onClick={HandleAddChild}
                      sx={menuItemStyle(false)}
                    >
                      <Typography variant="inherit">Add child</Typography>
                    </MenuItem>
                    <MenuItem
                      dense
                      divider
                      disabled={!userCanEdit || (currentProperty && currentProperty.logical_status > 6)}
                      onClick={HandleAddChildren}
                      sx={menuItemStyle(true)}
                    >
                      <Typography variant="inherit">Add children</Typography>
                    </MenuItem>
                    <MenuItem dense onClick={(event) => itemCopy(event, currentUprn, "UPRN")} sx={menuItemStyle(false)}>
                      <Typography variant="inherit">Copy UPRN</Typography>
                    </MenuItem>
                    <MenuItem
                      dense
                      divider
                      onClick={(event) => itemCopy(event, currentAddress, "Address")}
                      sx={menuItemStyle(true)}
                    >
                      <Typography variant="inherit">Copy address</Typography>
                    </MenuItem>
                    <MenuItem
                      dense
                      onClick={(event) => handleStreetViewClick(event, currentUprn, "UPRN")}
                      sx={menuItemStyle(false)}
                    >
                      <Typography variant="inherit">Open in Street View</Typography>
                    </MenuItem>
                    {process.env.NODE_ENV === "development" && (
                      <MenuItem dense disabled sx={menuItemStyle(false)}>
                        <Typography variant="inherit">Search nearby</Typography>
                      </MenuItem>
                    )}
                    <MenuItem
                      dense
                      divider
                      onClick={(event) => zoomToProperty(event, currentUprn)}
                      sx={menuItemStyle(true)}
                    >
                      <Typography variant="inherit">Zoom to this</Typography>
                    </MenuItem>
                    {process.env.NODE_ENV === "development" && (
                      <MenuItem dense disabled sx={menuItemStyle(false)}>
                        <Typography variant="inherit">Bookmark</Typography>
                      </MenuItem>
                    )}
                    {process.env.NODE_ENV === "development" && (
                      <MenuItem dense disabled sx={menuItemStyle(false)}>
                        <Typography variant="inherit">Add to list</Typography>
                      </MenuItem>
                    )}
                    <MenuItem dense divider onClick={handleRemoveFromList} sx={menuItemStyle(true)}>
                      <Typography variant="inherit">Remove from list</Typography>
                    </MenuItem>
                    {process.env.NODE_ENV === "development" && (
                      <MenuItem dense divider disabled sx={menuItemStyle(true)}>
                        <Typography variant="inherit">Export to...</Typography>
                      </MenuItem>
                    )}
                    {process.env.NODE_ENV === "development" && (
                      <MenuItem dense disabled sx={menuItemStyle(false)}>
                        <Typography variant="inherit">Move street</Typography>
                      </MenuItem>
                    )}
                    <MenuItem dense onClick={handleMakeChildOf} sx={menuItemStyle(false)}>
                      <Typography variant="inherit">Make child of...</Typography>
                    </MenuItem>
                    <MenuItem
                      dense
                      divider
                      onClick={handleMoveBlpuClick}
                      disabled={!userCanEdit}
                      sx={menuItemStyle(true)}
                    >
                      <Typography variant="inherit">Move seed point</Typography>
                    </MenuItem>
                    <MenuItem dense disabled={!userCanEdit} onClick={RejectProperty} sx={menuItemStyle(false)}>
                      <Typography variant="inherit">Reject</Typography>
                    </MenuItem>
                    <MenuItem dense disabled={!userCanEdit} onClick={HistoriciseProperty} sx={menuItemStyle(false)}>
                      <Typography variant="inherit">Historicise</Typography>
                    </MenuItem>
                    {process.env.NODE_ENV === "development" && (
                      <MenuItem dense disabled sx={menuItemStyle(false)}>
                        <Typography variant="inherit" color="error">
                          Delete
                        </Typography>
                      </MenuItem>
                    )}
                  </Menu>
                ) : (
                  <Menu
                    id="multi-property-actions-menu"
                    elevation={2}
                    anchorEl={anchorPropertyActionsEl}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "right",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    keepMounted
                    open={Boolean(anchorPropertyActionsEl)}
                    onClose={handlePropertyActionsMenuClose}
                    sx={menuStyle}
                  >
                    <MenuItem dense disabled={!userCanEdit} onClick={handleSetApprovedClick} sx={menuItemStyle(false)}>
                      <Typography variant="inherit">Set approved</Typography>
                    </MenuItem>
                    <MenuItem
                      dense
                      divider
                      disabled={!userCanEdit}
                      onClick={handleSetHistoricClick}
                      sx={menuItemStyle(true)}
                    >
                      <Typography variant="inherit">Set historic</Typography>
                    </MenuItem>
                    <MenuItem
                      dense
                      disabled={!userCanEdit}
                      onClick={handleEditClassificationClick}
                      sx={menuItemStyle(false)}
                    >
                      <Typography variant="inherit">Edit classification</Typography>
                    </MenuItem>
                    <MenuItem dense disabled={!userCanEdit} onClick={handleEditRpcClick} sx={menuItemStyle(false)}>
                      <Typography variant="inherit">Edit RPC</Typography>
                    </MenuItem>
                    <MenuItem dense disabled={!userCanEdit} onClick={handleEditLevelClick} sx={menuItemStyle(false)}>
                      <Typography variant="inherit">Edit level</Typography>
                    </MenuItem>
                    <MenuItem
                      dense
                      disabled={!userCanEdit}
                      onClick={handleEditExcludeFromExportClick}
                      sx={menuItemStyle(false)}
                    >
                      <Typography variant="inherit">Edit exclude from export</Typography>
                    </MenuItem>
                    <MenuItem
                      dense
                      divider
                      disabled={!userCanEdit}
                      onClick={handleEditSiteVisitRequiredClick}
                      sx={menuItemStyle(true)}
                    >
                      <Typography variant="inherit">Edit site visit required</Typography>
                    </MenuItem>
                    <MenuItem dense disabled={!userCanEdit} onClick={handleAddNoteClick} sx={menuItemStyle(false)}>
                      <Typography variant="inherit">Add note</Typography>
                    </MenuItem>
                    <MenuItem
                      dense
                      divider
                      disabled={!userCanEdit}
                      onClick={handleMoveBlpuClick}
                      sx={menuItemStyle(true)}
                    >
                      <Typography variant="inherit">Move BLPU seed point</Typography>
                    </MenuItem>
                    <NestedMenuItem
                      dense
                      className="nestedMenuItem"
                      disabled={!userCanEdit}
                      rightIcon={<KeyboardArrowRightIcon />}
                      label={<Typography variant="body2">Edit address</Typography>}
                      parentMenuOpen={propertyActionsOpen}
                    >
                      <MenuItem
                        dense
                        disabled={!userCanEdit}
                        onClick={handleEditAddressFieldsClick}
                        sx={menuItemStyle(false)}
                      >
                        <Typography variant="inherit">Edit address fields</Typography>
                      </MenuItem>
                      {process.env.NODE_ENV === "development" && (
                        <MenuItem dense disabled onClick={handlePlotToAddressWizardClick} sx={menuItemStyle(false)}>
                          <Typography variant="inherit">Plot to address wizard</Typography>
                        </MenuItem>
                      )}
                    </NestedMenuItem>
                    <NestedMenuItem
                      dense
                      divider={!settingsContext.isScottish}
                      className={settingsContext.isScottish ? "nestedMenuItem" : "nestedMenuItemDivider"}
                      disabled={!userCanEdit}
                      rightIcon={<KeyboardArrowRightIcon />}
                      label={<Typography variant="body2">Edit cross reference</Typography>}
                      parentMenuOpen={propertyActionsOpen}
                    >
                      <MenuItem
                        dense
                        disabled={!userCanEdit}
                        onClick={handleAddCrossReferenceClick}
                        sx={menuItemStyle(false)}
                      >
                        <Typography variant="inherit">Add cross reference</Typography>
                      </MenuItem>
                      <MenuItem
                        dense
                        disabled={!userCanEdit}
                        onClick={handleRemoveCrossReferenceClick}
                        sx={menuItemStyle(false)}
                      >
                        <Typography variant="inherit">Remove cross reference</Typography>
                      </MenuItem>
                    </NestedMenuItem>
                    {process.env.NODE_ENV === "development" && (
                      <MenuItem dense disabled sx={menuItemStyle(false)}>
                        <Typography variant="inherit">Add to list</Typography>
                      </MenuItem>
                    )}
                    <MenuItem dense divider onClick={handleRemoveFromList} sx={menuItemStyle(true)}>
                      <Typography variant="inherit">Remove from list</Typography>
                    </MenuItem>
                    {process.env.NODE_ENV === "development" && (
                      <NestedMenuItem
                        dense
                        divider
                        className="nestedMenuItemDivider"
                        disabled
                        rightIcon={<KeyboardArrowRightIcon />}
                        label={<Typography variant="body2">Export to...</Typography>}
                        parentMenuOpen={propertyActionsOpen}
                      ></NestedMenuItem>
                    )}
                    {process.env.NODE_ENV === "development" && (
                      <MenuItem dense disabled sx={menuItemStyle(false)}>
                        <Typography variant="inherit">Move street</Typography>
                      </MenuItem>
                    )}
                    <MenuItem dense onClick={handleMakeChildOf} sx={menuItemStyle(false)}>
                      <Typography variant="inherit">Make child of...</Typography>
                    </MenuItem>
                  </Menu>
                )}
              </Fragment>
            )}
            {numberOfTypes === 1 && haveMapProperty && (
              <Fragment>
                <ADSSelectionButton
                  variant="createList"
                  selectionCount={selectionCount}
                  isDisabled={!userCanEdit}
                  onClick={handleCreateNewList}
                />
                <ADSSelectionButton
                  variant="existingList"
                  selectionCount={selectionCount}
                  isDisabled={!userCanEdit}
                  onClick={handleAddToExistingList}
                />
              </Fragment>
            )}
            {numberOfTypes === 1 && haveClassification && (
              <ADSSelectionButton
                variant="deleteClassification"
                selectionCount={selectionCount}
                isDisabled={!userCanEdit}
                onClick={handleDeleteClassification}
              />
            )}
            {numberOfTypes === 1 && haveOrganisation && (
              <ADSSelectionButton
                variant="deleteOrganisation"
                selectionCount={selectionCount}
                isDisabled={!userCanEdit}
                onClick={handleDeleteOrganisation}
              />
            )}
            {numberOfTypes === 1 && haveSuccessorCrossRef && (
              <ADSSelectionButton
                variant="deleteSuccessorCrossRef"
                selectionCount={selectionCount}
                isDisabled={!userCanEdit}
                onClick={handleDeleteSuccessorCrossRef}
              />
            )}
            {numberOfTypes === 1 && haveProvenance && (
              <ADSSelectionButton
                variant="deleteProvenance"
                selectionCount={selectionCount}
                isDisabled={!userCanEdit}
                onClick={handleDeleteProvenance}
              />
            )}
            {numberOfTypes === 1 && haveMapExtent && (
              <ADSSelectionButton
                variant="mergeExtent"
                selectionCount={selectionCount}
                isDisabled={!userCanEdit}
                onClick={handleMergeExtent}
              />
            )}
            {numberOfTypes === 1 && haveCrossReference && (
              <ADSSelectionButton
                variant="deleteCrossReference"
                selectionCount={selectionCount}
                isDisabled={!userCanEdit}
                onClick={handleDeleteCrossReference}
              />
            )}
            {numberOfTypes === 1 && haveWizard && (
              <Fragment>
                <ADSSelectionButton
                  variant="addNote"
                  selectionCount={selectionCount}
                  isDisabled={!userCanEdit}
                  onClick={handleAddNote}
                />
                <ADSSelectionButton
                  variant="deleteWizard"
                  selectionCount={selectionCount}
                  isDisabled={!userCanEdit}
                  onClick={handleDeleteWizard}
                />
                <ADSSelectionButton
                  variant="more"
                  selectionCount={selectionCount}
                  menuControlId="wizard-actions-menu"
                  onClick={handleWizardActionsMenuClick}
                />
                <Menu
                  id="wizard-actions-menu"
                  elevation={2}
                  anchorEl={anchorWizardActionsEl}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  keepMounted
                  open={Boolean(anchorWizardActionsEl)}
                  onClose={handleWizardActionsMenuClose}
                  sx={menuStyle}
                >
                  <MenuItem dense onClick={handleEditClassification} sx={menuItemStyle(false)}>
                    <Typography variant="inherit">Edit classification</Typography>
                  </MenuItem>
                  <MenuItem dense onClick={handleEditLevel} sx={menuItemStyle(false)}>
                    <Typography variant="inherit">Edit level</Typography>
                  </MenuItem>
                  {settingsContext.isScottish && (
                    <MenuItem dense onClick={handleEditSubLocality} sx={menuItemStyle(true)}>
                      <Typography variant="inherit">Edit sub-locality</Typography>
                    </MenuItem>
                  )}
                  <MenuItem dense onClick={handleEditPostTown} sx={menuItemStyle(true)}>
                    <Typography variant="inherit">Edit post town</Typography>
                  </MenuItem>
                  <MenuItem dense divider onClick={handleEditPostcode} sx={menuItemStyle(false)}>
                    <Typography variant="inherit">Edit postcode</Typography>
                  </MenuItem>
                  <MenuItem dense divider onClick={handleAddNote} sx={menuItemStyle(true)}>
                    <Typography variant="inherit">Add note</Typography>
                  </MenuItem>
                  <MenuItem dense onClick={handleDeleteWizard} sx={menuItemStyle(false)}>
                    <Typography variant="inherit" color="error">
                      Delete
                    </Typography>
                  </MenuItem>
                </Menu>
              </Fragment>
            )}
            {numberOfTypes === 1 && haveMoveBlpu && (
              <Fragment>
                <ADSSelectionButton
                  variant="addNote"
                  selectionCount={selectionCount}
                  isDisabled={!userCanEdit}
                  onClick={handleAddNote}
                />
                <ADSSelectionButton
                  variant="rpc"
                  selectionCount={selectionCount}
                  isDisabled={!userCanEdit}
                  onClick={handleEditRpc}
                />
              </Fragment>
            )}
          </Stack>
        </Stack>
      </Box>
      <AddPropertyWizardDialog
        variant={propertyWizardType}
        parent={propertyWizardParent}
        isOpen={openPropertyWizard}
        onDone={handlePropertyWizardDone}
        onClose={handlePropertyWizardClose}
      />
      <MultiEditLogicalStatusDialog
        variant={editLogicalStatusVariant}
        propertyUprns={propertyUprns ? propertyUprns : []}
        isOpen={openEditLogicalStatus}
        onClose={handleEditLogicalStatusClose}
      />
      <MultiEditSingleFieldDialog
        variant={editSingleFieldVariant}
        propertyUprns={propertyUprns ? propertyUprns : []}
        isOpen={openEditSingleField}
        onClose={handleEditSingleFieldClose}
      />
      <MultiEditAddressFieldsDialog
        propertyUprns={propertyUprns ? propertyUprns : []}
        isOpen={openEditAddressFields}
        onClose={handleEditAddressFieldsClose}
      />
      <MultiEditAddCrossReferenceDialog
        propertyUprns={propertyUprns ? propertyUprns : []}
        isOpen={openAddCrossReference}
        onClose={handleAddCrossReferenceClose}
      />
      <MultiEditRemoveCrossReferenceDialog
        propertyUprns={propertyUprns ? propertyUprns : []}
        isOpen={openRemoveCrossReference}
        onClose={handleRemoveCrossReferenceClose}
      />
      <MultiEditAddClassificationDialog
        propertyUprns={propertyUprns ? propertyUprns : []}
        isOpen={openAddClassification}
        onClose={handleAddClassificationClose}
      />
      <MoveBLPUDialog
        propertyUprns={propertyUprns ? propertyUprns : []}
        isOpen={openMoveBlpu}
        onClose={handleMoveBlpuClose}
      />
      <MakeChildDialog
        isOpen={openMakeChild}
        variant="multi"
        selectedUPRNs={makeChildUprn}
        onClose={handleMakeChildClose}
      />
      <Popper id={informationId} open={informationOpen} anchorEl={informationAnchorEl} placement="top-start">
        <ADSInformationControl variant={"divideESU"} hasCancel onCancel={handleInformationCancel} />
      </Popper>
    </Fragment>
  );
}

export default ADSSelectionControl;
