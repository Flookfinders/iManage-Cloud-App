/* #region header */
/**************************************************************************************************
//
//  Description: Wizard Map
//
//  Copyright:    © 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001            Sean Flook                 Initial Revision.
//    002   27.03.23 Sean Flook         WI40628 Correctly call onWizardSetCoordinate when dragging the pin on place on map page.
//    003   07.09.23 Sean Flook                 Removed unnecessary wait.
//    004   06.10.23 Sean Flook                 Use colour variables.
//    005   10.11.23 Sean Flook       IMANN-175 Changes required for Move BLPU seed point.
//    006   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system.
//    007   30.11.23 Sean Flook                 Changes required to handle Scottish authorities.
//    008   02.01.24 Sean Flook                 Changed console.log to console.error for error messages.
//    009   16.01.24 Sean Flook                 Changes required to fix warnings.
//    010   25.01.24 Sean Flook                 Changes required after UX review.
//    011   11.03.24 Sean Flook           GLB12 Adjusted height to remove gap.
//    012   20.03.24 Sean Flook                 Changes required to load shape files.
//    013   22.03.24 Sean Flook           GLB12 Changed to use dataFormStyle so height can be correctly set.
//    014   16.04.24 Sean Flook       IMANN-377 Added background properties and streets.
//    015   16.04.24 Sean Flook                 When loading a SHP file use the mapContext to retain the information and display the layer in the map.
//    016   07.02.24 Sean Flook       IMANN-377 Changes required to support viaEuropa mapping for OneScotland.
//    017   03.05.24 Sean Flook                 Call getBaseMapLayers.
//    018   20.05.24 Sean Flook       IMANN-476 Check view has been created first in fadeVisibilityOn.
//    019   18.06.24 Sean Flook       IMANN-599 Use the correct classification when moving BLPUs for Scottish authorities.
//    020   19.06.24 Sean Flook       IMANN-629 Changes to code so that current user is remembered and a 401 error displays the login dialog.
//    021   08.07.24 Sean Flook       IMANN-728 Pass in the new parameter to onExtentChange.
//    022   10.09.24 Sean Flook       IMANN-980 Only write to the console if the user has the showMessages right.
//#endregion Version 1.0.0.0 changes
//#region Version 1.0.3.0 changes
//    023   06.01.25 Sean Flook      IMANN-1119 Changed Multiple properties to Multiple addresses in popup.
//#endregion Version 1.0.3.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useEffect, useState, useRef, Fragment } from "react";
import PropTypes from "prop-types";

import MapContext from "../context/mapContext";
import SettingsContext from "../context/settingsContext";
import UserContext from "../context/userContext";

import shp from "shpjs";

import WMSLayer from "@arcgis/core/layers/WMSLayer";
import WMTSLayer from "@arcgis/core/layers/WMTSLayer";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import TileInfo from "@arcgis/core/layers/support/TileInfo";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer";
import ScaleBar from "@arcgis/core/widgets/ScaleBar";
import Sketch from "@arcgis/core/widgets/Sketch";
import CoordinateConversion from "@arcgis/core/widgets/CoordinateConversion";
import Conversion from "@arcgis/core/widgets/CoordinateConversion/support/Conversion";
import LayerList from "@arcgis/core/widgets/LayerList";
import Point from "@arcgis/core/geometry/Point";
import Graphic from "@arcgis/core/Graphic";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";

import { CircularProgress, IconButton, Divider, Backdrop, Snackbar, Alert } from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSPlaceOnMapControl from "./ADSPlaceOnMapControl";
import UploadShpFileDialog from "../dialogs/UploadShpFileDialog";

import { ArraysEqual, GetWktCoordinates, defaultMapLayerIds, getBaseMapLayers } from "../utils/HelperUtils";

import {
  GetPropertyMapSymbol,
  GetBackgroundPropertyMapSymbol,
  GetStreetMapSymbol,
  GetESUMapSymbol,
} from "../utils/ADSMapSymbols";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import LayersIcon from "@mui/icons-material/Layers";
import UploadIcon from "@mui/icons-material/Upload";

import { adsWhite, adsLightGreyA50, adsBlack0 } from "../utils/ADSColours";
import { ActionIconStyle, GetAlertStyle, GetAlertIcon, GetAlertSeverity, dataFormStyle } from "../utils/ADSStyles";
import { GetStreetStateLabel, GetStreetTypeLabel, streetToTitleCase } from "../utils/StreetUtils";
import { GetClassificationLabel, GetLPILogicalStatusLabel, addressToTitleCase } from "../utils/PropertyUtils";

const editGraphicLayerName = "editGraphicLayer";
const labelLayerName = "labelLayer";
const backgroundPropertyLayerName = "backgroundPropertyLayer";
const backgroundStreetLayerName = "backgroundStreetLayer";
const unassignedEsusLayerName = "unassignedEsusLayer";

const propertyRenderer = {
  type: "unique-value",
  field: "SymbolCode",
  defaultSymbol: {
    type: "simple-marker",
    size: 0.5,
    color: [0, 0, 0, 0],
    style: "circle",
    outline: null,
    yoffset: 18,
  },
  uniqueValueInfos: [
    {
      value: "1, C",
      symbol: GetPropertyMapSymbol(1, "C"),
      label: "Approved Preferred, Commercial",
    },
    {
      value: "1, L",
      symbol: GetPropertyMapSymbol(1, "L"),
      label: "Approved Preferred, Land",
    },
    {
      value: "1, M",
      symbol: GetPropertyMapSymbol(1, "M"),
      label: "Approved Preferred, Military",
    },
    {
      value: "1, P",
      symbol: GetPropertyMapSymbol(1, "P"),
      label: "Approved Preferred, Parent Shell",
    },
    {
      value: "1, R",
      symbol: GetPropertyMapSymbol(1, "R"),
      label: "Approved Preferred, Residential",
    },
    {
      value: "1, U",
      symbol: GetPropertyMapSymbol(1, "U"),
      label: "Approved Preferred, Unclassified",
    },
    {
      value: "1, X",
      symbol: GetPropertyMapSymbol(1, "X"),
      label: "Approved Preferred, Dual Use",
    },
    {
      value: "1, Z",
      symbol: GetPropertyMapSymbol(1, "Z"),
      label: "Approved Preferred, Object of Interest",
    },
    {
      value: "3, C",
      symbol: GetPropertyMapSymbol(3, "C"),
      label: "Alternative, Commercial",
    },
    {
      value: "3, L",
      symbol: GetPropertyMapSymbol(3, "L"),
      label: "Alternative, Land",
    },
    {
      value: "3, M",
      symbol: GetPropertyMapSymbol(3, "M"),
      label: "Alternative, Military",
    },
    {
      value: "3, P",
      symbol: GetPropertyMapSymbol(3, "P"),
      label: "Alternative, Property Shell",
    },
    {
      value: "3, R",
      symbol: GetPropertyMapSymbol(3, "R"),
      label: "Alternative, Residential",
    },
    {
      value: "3, U",
      symbol: GetPropertyMapSymbol(3, "U"),
      label: "Alternative, Unclassified",
    },
    {
      value: "3, X",
      symbol: GetPropertyMapSymbol(3, "X"),
      label: "Alternative, Dual Use",
    },
    {
      value: "3, Z",
      symbol: GetPropertyMapSymbol(3, "Z"),
      label: "Alternative, Object of Interest",
    },
    {
      value: "5, C",
      symbol: GetPropertyMapSymbol(5, "C"),
      label: "Candidate, Commercial",
    },
    {
      value: "5, L",
      symbol: GetPropertyMapSymbol(5, "L"),
      label: "Candidate, Land",
    },
    {
      value: "5, M",
      symbol: GetPropertyMapSymbol(5, "M"),
      label: "Candidate, Military",
    },
    {
      value: "5, P",
      symbol: GetPropertyMapSymbol(5, "P"),
      label: "Candidate, Property Shell",
    },
    {
      value: "5, R",
      symbol: GetPropertyMapSymbol(5, "R"),
      label: "Candidate, Residential",
    },
    {
      value: "5, U",
      symbol: GetPropertyMapSymbol(5, "U"),
      label: "Candidate, Unclassified",
    },
    {
      value: "5, X",
      symbol: GetPropertyMapSymbol(5, "X"),
      label: "Candidate, Dual Use",
    },
    {
      value: "5, Z",
      symbol: GetPropertyMapSymbol(5, "Z"),
      label: "Candidate, Object of Interest",
    },
    {
      value: "6, C",
      symbol: GetPropertyMapSymbol(6, "C"),
      label: "Provisional, Commercial",
    },
    {
      value: "6, L",
      symbol: GetPropertyMapSymbol(6, "L"),
      label: "Provisional, Land",
    },
    {
      value: "6, M",
      symbol: GetPropertyMapSymbol(6, "M"),
      label: "Provisional, Military",
    },
    {
      value: "6, P",
      symbol: GetPropertyMapSymbol(6, "P"),
      label: "Provisional, Property Shell",
    },
    {
      value: "6, R",
      symbol: GetPropertyMapSymbol(6, "R"),
      label: "Provisional, Residential",
    },
    {
      value: "6, U",
      symbol: GetPropertyMapSymbol(6, "U"),
      label: "Provisional, Unclassified",
    },
    {
      value: "6, X",
      symbol: GetPropertyMapSymbol(6, "X"),
      label: "Provisional, Dual Use",
    },
    {
      value: "6, Z",
      symbol: GetPropertyMapSymbol(6, "Z"),
      label: "Provisional, Object of Interest",
    },
    {
      value: "7, C",
      symbol: GetPropertyMapSymbol(7, "C"),
      label: "Rejected (External), Commercial",
    },
    {
      value: "7, L",
      symbol: GetPropertyMapSymbol(7, "L"),
      label: "Rejected (External), Land",
    },
    {
      value: "7, M",
      symbol: GetPropertyMapSymbol(7, "M"),
      label: "Rejected (External), Military",
    },
    {
      value: "7, P",
      symbol: GetPropertyMapSymbol(7, "P"),
      label: "Rejected (External), Property Shell",
    },
    {
      value: "7, R",
      symbol: GetPropertyMapSymbol(7, "R"),
      label: "Rejected (External), Residential",
    },
    {
      value: "7, U",
      symbol: GetPropertyMapSymbol(7, "U"),
      label: "Rejected (External), Unclassified",
    },
    {
      value: "7, X",
      symbol: GetPropertyMapSymbol(7, "X"),
      label: "Rejected (External), Dual Use",
    },
    {
      value: "7, Z",
      symbol: GetPropertyMapSymbol(7, "Z"),
      label: "Rejected (External), Object of Interest",
    },
    {
      value: "8, C",
      symbol: GetPropertyMapSymbol(8, "C"),
      label: "Historical, Commercial",
    },
    {
      value: "8, L",
      symbol: GetPropertyMapSymbol(8, "L"),
      label: "Historical, Land",
    },
    {
      value: "8, M",
      symbol: GetPropertyMapSymbol(8, "M"),
      label: "Historical, Military",
    },
    {
      value: "8, P",
      symbol: GetPropertyMapSymbol(8, "P"),
      label: "Historical, Property Shell",
    },
    {
      value: "8, R",
      symbol: GetPropertyMapSymbol(8, "R"),
      label: "Historical, Residential",
    },
    {
      value: "8, U",
      symbol: GetPropertyMapSymbol(8, "U"),
      label: "Historical, Unclassified",
    },
    {
      value: "8, X",
      symbol: GetPropertyMapSymbol(8, "X"),
      label: "Historical, Dual Use",
    },
    {
      value: "8, Z",
      symbol: GetPropertyMapSymbol(8, "Z"),
      label: "Historical, Object of Interest",
    },
    {
      value: "9, C",
      symbol: GetPropertyMapSymbol(9, "C"),
      label: "Rejected (Internal), Commercial",
    },
    {
      value: "9, L",
      symbol: GetPropertyMapSymbol(9, "L"),
      label: "Rejected (Internal), Land",
    },
    {
      value: "9, M",
      symbol: GetPropertyMapSymbol(9, "M"),
      label: "Rejected (Internal), Military",
    },
    {
      value: "9, P",
      symbol: GetPropertyMapSymbol(9, "P"),
      label: "Rejected (Internal), Property Shell",
    },
    {
      value: "9, R",
      symbol: GetPropertyMapSymbol(9, "R"),
      label: "Rejected (Internal), Residential",
    },
    {
      value: "9, U",
      symbol: GetPropertyMapSymbol(9, "U"),
      label: "Rejected (Internal), Unclassified",
    },
    {
      value: "9, X",
      symbol: GetPropertyMapSymbol(9, "X"),
      label: "Rejected (Internal), Dual Use",
    },
    {
      value: "9, Z",
      symbol: GetPropertyMapSymbol(9, "Z"),
      label: "Rejected (Internal), Object of Interest",
    },
  ],
};

const backgroundPropertyRenderer = {
  type: "unique-value",
  field: "LogicalStatus",
  uniqueValueInfos: [
    {
      value: "1",
      symbol: GetBackgroundPropertyMapSymbol(1),
      label: "Approved Preferred",
    },
    {
      value: "3",
      symbol: GetBackgroundPropertyMapSymbol(3),
      label: "Alternative",
    },
    {
      value: "5",
      symbol: GetBackgroundPropertyMapSymbol(5),
      label: "Candidate",
    },
    {
      value: "6",
      symbol: GetBackgroundPropertyMapSymbol(6),
      label: "Provisional",
    },
    {
      value: "7",
      symbol: GetBackgroundPropertyMapSymbol(7),
      label: "Rejected",
    },
    {
      value: "8",
      symbol: GetBackgroundPropertyMapSymbol(8),
      label: "Historical",
    },
    {
      value: "9",
      symbol: GetBackgroundPropertyMapSymbol(9),
      label: "Rejected",
    },
  ],
};

const streetRenderer = {
  type: "unique-value",
  field: "SymbolCode",
  uniqueValueInfos: [
    {
      value: "0, 0",
      symbol: GetESUMapSymbol(),
      label: "Unassigned ESU",
    },
    {
      value: "0, 1",
      symbol: GetESUMapSymbol(),
      label: "Unassigned ESU, Under construction",
    },
    {
      value: "0, 2",
      symbol: GetESUMapSymbol(),
      label: "Unassigned ESU, Open",
    },
    {
      value: "0, 3",
      symbol: GetESUMapSymbol(),
      label: "Unassigned ESU, Permanently closed",
    },
    {
      value: "0, 4",
      symbol: GetESUMapSymbol(),
      label: "Unassigned ESU, Street for addressing purposes only",
    },
    {
      value: "1, 1",
      symbol: GetStreetMapSymbol(),
      label: "Official Designated Street Name, Under construction",
    },
    {
      value: "1, 2",
      symbol: GetStreetMapSymbol(),
      label: "Official Designated Street Name, Open",
    },
    {
      value: "1, 3",
      symbol: GetStreetMapSymbol(),
      label: "Official Designated Street Name, Permanently closed",
    },
    {
      value: "1, 4",
      symbol: GetStreetMapSymbol(),
      label: "Official Designated Street Name, Street for addressing purposes only",
    },
    {
      value: "2, 1",
      symbol: GetStreetMapSymbol(),
      label: "Street Description, Under construction",
    },
    {
      value: "2, 2",
      symbol: GetStreetMapSymbol(),
      label: "Street Description, Open",
    },
    {
      value: "2, 3",
      symbol: GetStreetMapSymbol(),
      label: "Street Description, Permanently closed",
    },
    {
      value: "2, 4",
      symbol: GetStreetMapSymbol(),
      label: "Street Description, Street for addressing purposes only",
    },
    {
      value: "3, 1",
      symbol: GetStreetMapSymbol(),
      label: "Numbered Street, Under construction",
    },
    {
      value: "3, 2",
      symbol: GetStreetMapSymbol(),
      label: "Numbered Street, Open",
    },
    {
      value: "3, 3",
      symbol: GetStreetMapSymbol(),
      label: "Numbered Street, Permanently closed",
    },
    {
      value: "3, 4",
      symbol: GetStreetMapSymbol(),
      label: "Numbered Street, Street for addressing purposes only",
    },
    {
      value: "4, 1",
      symbol: GetStreetMapSymbol(),
      label: "Unofficial Street Description, Under construction",
    },
    {
      value: "4, 2",
      symbol: GetStreetMapSymbol(),
      label: "Unofficial Street Description, Open",
    },
    {
      value: "4, 3",
      symbol: GetStreetMapSymbol(),
      label: "Unofficial Street Description, Permanently closed",
    },
    {
      value: "4, 4",
      symbol: GetStreetMapSymbol(),
      label: "Unofficial Street Description, Street for addressing purposes only",
    },
    {
      value: "9, 1",
      symbol: GetStreetMapSymbol(),
      label: "Description used for LLPG Access, Under construction",
    },
    {
      value: "9, 2",
      symbol: GetStreetMapSymbol(),
      label: "Description used for LLPG Access, Open",
    },
    {
      value: "9, 3",
      symbol: GetStreetMapSymbol(),
      label: "Description used for LLPG Access, Permanently closed",
    },
    {
      value: "9, 4",
      symbol: GetStreetMapSymbol(),
      label: "Description used for LLPG Access, Street for addressing purposes only",
    },
  ],
};

function PropertyFeatureReduction(radius, minSize, maxSize, yOffset) {
  return {
    type: "cluster",
    clusterRadius: radius,
    clusterMinSize: minSize, //15,
    clusterMaxSize: maxSize, //15,
    labelingInfo: [
      {
        labelExpressionInfo: {
          expression: "Text($feature.cluster_count, '#,###')",
        },
        deconflictionStrategy: "none",
        labelPlacement: "center-center",
        symbol: {
          type: "text",
          color: adsWhite,
          font: {
            weight: "bold",
            size: "10px",
          },
          yoffset: yOffset,
          haloSize: 0.5,
          haloColor: "black",
        },
      },
    ],
    popupTemplate: {
      title: "Multiple addresses",
      content: "This cluster represents <b>{cluster_count}</b> addresses.",
      fieldInfos: [
        {
          fieldName: "cluster_count",
          format: {
            digitSeparator: true,
            places: 0,
          },
        },
      ],
    },
  };
}

ADSWizardMap.propTypes = {
  data: PropTypes.array.isRequired,
  placeOnMapData: PropTypes.object,
  isChild: PropTypes.bool,
  isRange: PropTypes.bool,
  displayPlaceOnMap: PropTypes.bool,
  moveBlpu: PropTypes.bool,
  onPlaceOnMapDataChange: PropTypes.func,
};

ADSWizardMap.defaultProps = {
  isChild: false,
  isRange: false,
  displayPlaceOnMap: false,
  moveBlpu: false,
};

function ADSWizardMap({ data, placeOnMapData, isChild, isRange, displayPlaceOnMap, moveBlpu, onPlaceOnMapDataChange }) {
  const mapContext = useContext(MapContext);
  const settingsContext = useContext(SettingsContext);
  const userContext = useRef(useContext(UserContext));

  const saveResult = useRef(null);
  const saveType = useRef(null);
  const saveOpenRef = useRef(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const failedValidation = useRef(null);
  const featuresDownloaded = useRef(0);

  const [loading, setLoading] = useState(true);
  const [loadingShp, setLoadingShp] = useState(false);

  const [displayLayerList, setDisplayLayerList] = useState(false);

  const baseMappingLayerIds = useRef([]);
  const baseLayersSnapEsu = useRef([]);
  const baseLayersSnapBlpu = useRef([]);
  const baseLayersSnapExtent = useRef([]);
  const baseLayersFeature = useRef([]);
  const mapRef = useRef();
  const [view, setView] = useState(null);
  const viewRef = useRef(null);
  const sketchRef = useRef(null);
  const layerListRef = useRef(null);
  const coordinateConversionRef = useRef(null);
  const loadedShpFileTitles = useRef([]);
  const loadedShpFileIds = useRef([]);

  const baseMapLayers = useRef(settingsContext.mapLayers);
  const isScottish = useRef(settingsContext.isScottish);
  const initialExtent = useRef(mapContext.currentExtent);
  const highlightProperty = useRef(null);

  const [openUploadShpFileDialog, setOpenUploadShpFileDialog] = useState(false);

  const oldMapData = useRef({
    streets: [],
    properties: [],
    extents: [],
    editStreet: null,
    editProperty: null,
    zoomStreet: null,
    zoomProperty: null,
    mapProperty: null,
  });

  const backgroundStreetData = useRef(null);
  const unassignedEsusData = useRef(null);
  const backgroundPropertyData = useRef(null);

  // [point, area]
  const [placeStyle, setPlaceStyle] = useState(null);
  // [linear, streetGeometry, elliptical]
  const [areaStyle, setAreaStyle] = useState(null);
  // [topLeft, top, topRight, right, bottomRight, bottom, bottomLeft, left]
  const [startPoint, setStartPoint] = useState(null);
  // [clockwise, antiClockwise]
  const [direction, setDirection] = useState(null);

  const placeOnMapOpen = useRef(displayPlaceOnMap);

  const editGraphicsLayer = useRef(
    new GraphicsLayer({
      id: editGraphicLayerName,
      copyright: `© Copyright Idox Software Ltd. ${new Date().getFullYear()}`,
      title: "Edit layer",
      listMode: "hide",
    })
  );

  const backgroundStreetLayerRef = useRef(null);
  const unassignedEsusLayerRef = useRef(null);
  const backgroundPropertyLayerRef = useRef(null);

  /**
   * Method to handle when the zoom in button is clicked.
   */
  function handleZoomIn() {
    view.zoom++;
  }

  /**
   * Method to handle when the zoom out button is clicked.
   */
  function handleZoomOut() {
    view.zoom--;
  }

  /**
   * Method to handle when the display layer list button is clicked.
   */
  function handleDisplayLayerList() {
    setDisplayLayerList(!displayLayerList);
  }

  /**
   * Method to handle when the upload shp file button is clicked.
   */
  function handleUploadShpFile() {
    setOpenUploadShpFileDialog(true);
  }

  /**
   * Method used to create a new point graphic.
   *
   * @param {number} x The easting for the property.
   * @param {number} y The northing for the property.
   * @param {number} logicalStatus The logical status for the property.
   * @param {string} classification The classification for the property.
   * @param {boolean} highlighted True if the property should be highlighted; otherwise false.
   * @returns {object} The new point graphic object.
   */
  function createPointGraphic(x, y, id, logicalStatus, classification, highlighted = false) {
    const editPoint = new Point({
      type: "point",
      x: x,
      y: y,
      spatialReference: { wkid: 27700 },
    });

    const editPointGraphic = new Graphic({
      attributes: { typeName: "Point", id: id },
      geometry: editPoint,
      symbol: GetPropertyMapSymbol(logicalStatus, classification, highlighted),
    });

    return editPointGraphic;
  }

  /**
   * Method used to define the actions available for the feature layers.
   *
   * @param {object} event The event object.
   */
  function defineActions(event) {
    const item = event.item;

    if (item.title === "Background Street layer") {
      item.actionsSections = [
        [
          {
            title: "Increase opacity",
            className: "esri-icon-up",
            id: "increase-background-street-opacity",
          },
          {
            title: "Decrease opacity",
            className: "esri-icon-down",
            id: "decrease-background-street-opacity",
          },
        ],
      ];
    }

    if (item.title === "Unassigned ESU layer") {
      item.actionsSections = [
        [
          {
            title: "Increase opacity",
            className: "esri-icon-up",
            id: "increase-unassigned-esu-opacity",
          },
          {
            title: "Decrease opacity",
            className: "esri-icon-down",
            id: "decrease-unassigned-esu-opacity",
          },
        ],
      ];
    }

    if (item.title === "Background Properties layer") {
      item.actionsSections = [
        [
          {
            title: "Increase opacity",
            className: "esri-icon-up",
            id: "increase-background-property-opacity",
          },
          {
            title: "Decrease opacity",
            className: "esri-icon-down",
            id: "decrease-background-property-opacity",
          },
        ],
      ];
    }

    if (loadedShpFileTitles.current.includes(item.title)) {
      item.actionsSections = [
        [
          {
            title: "Remove layer",
            className: "esri-icon-close-circled",
            id: "close-shp-file",
          },
        ],
      ];
    }
  }

  const getPlaceOnMapData = (updatedField, newValue) => {
    return {
      placeStyle: updatedField === "placeStyle" ? newValue : placeStyle,
      areaStyle: updatedField === "areaStyle" ? newValue : areaStyle,
      startPoint: updatedField === "startPoint" ? newValue : startPoint,
      direction: updatedField === "direction" ? newValue : direction,
    };
  };

  const handlePlaceStyleChanged = (newValue) => {
    setPlaceStyle(newValue);

    if (onPlaceOnMapDataChange) onPlaceOnMapDataChange(getPlaceOnMapData("placeStyle", newValue));
  };

  const handleAreaStyleChanged = (newValue) => {
    setAreaStyle(newValue);

    if (onPlaceOnMapDataChange) onPlaceOnMapDataChange(getPlaceOnMapData("areaStyle", newValue));
  };

  const handleStartPointChanged = (newValue) => {
    setStartPoint(newValue);

    if (onPlaceOnMapDataChange) onPlaceOnMapDataChange(getPlaceOnMapData("startPoint", newValue));
  };

  const handleDirectionChanged = (newValue) => {
    setDirection(newValue);

    if (onPlaceOnMapDataChange) onPlaceOnMapDataChange(getPlaceOnMapData("direction", newValue));
  };

  /**
   * Method to handle when the upload shp file dialog is closed.
   */
  const handleUploadShpFileDialogClose = (shpFile) => {
    setOpenUploadShpFileDialog(false);

    if (shpFile) {
      setLoadingShp(true);

      const reader = new FileReader();

      reader.onload = function () {
        if (reader.readyState !== 2 || reader.error) {
          if (userContext.current.currentUser.showMessages)
            console.error(`[ERROR] failed to upload ${shpFile.title}`, {
              readyState: reader.readyState,
              error: reader.error,
            });
          saveResult.current = false;
          featuresDownloaded.current = shpFile.title;
          saveType.current = "uploadedShpFileError";
          saveOpenRef.current = true;
          setSaveOpen(true);
          setLoadingShp(false);
          return;
        } else {
          shp(reader.result).then(function (geojson) {
            mapContext.onLoadShpFile(JSON.stringify(geojson), shpFile);
            saveResult.current = true;
            featuresDownloaded.current = shpFile.title;
            saveType.current = "uploadedShpFile";
            saveOpenRef.current = true;
            setSaveOpen(true);
            setLoadingShp(false);
          });
        }
      };

      reader.readAsArrayBuffer(shpFile.file);
    }
  };

  /**
   * Event to handle when the save dialog is closed.
   *
   * @param {object} event The event object
   * @param {string} reason The reason the save dialog is closing.
   * @returns
   */
  const handleSaveClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSaveOpen(false);
  };

  /**
   * Method to get the required alert text.
   *
   * @returns {string|null} the required alert text.
   */
  const getAlertText = () => {
    if (saveOpen && saveType.current) {
      switch (saveType.current) {
        case "uploadedShpFile":
          return `${featuresDownloaded.current} has been successfully uploaded.`;

        case "uploadedShpFileError":
          return `${featuresDownloaded.current} failed to be uploaded.`;

        default:
          if (saveResult.current) return `The ${saveType.current} has been successfully saved.`;
          else if (failedValidation.current) return `Failed to validate the ${saveType.current} record.`;
          else return `Failed to save the ${saveType.current}.`;
      }
    }
  };

  useEffect(() => {
    if (placeOnMapData) {
      setPlaceStyle(placeOnMapData.placeStyle);
      setAreaStyle(placeOnMapData.areaStyle);
      setStartPoint(placeOnMapData.startPoint);
      setDirection(placeOnMapData.direction);
    }
  }, [placeOnMapData]);

  useEffect(() => {
    if (viewRef.current) return;

    const baseLayers = [];
    const baseLayerIds = [];
    const snapEsu = [];
    const snapBlpu = [];
    const snapExtent = [];
    const featureLayer = [];
    let newBaseLayer;

    if (!baseMapLayers.current) baseMapLayers.current = getBaseMapLayers(userContext.current);

    baseMapLayers.current
      .sort((a, b) => a.layerPosition - b.layerPosition)
      .forEach((baseLayer) => {
        if (baseLayer.globalLayer) {
          newBaseLayer = null;

          switch (baseLayer.layerType) {
            case 1: // WFS
              switch (baseLayer.serviceProvider) {
                case "thinkWare":
                  // alert("Code to handle thinkWare WFS layers has not been written yet.");
                  // Create an empty GraphicsLayer as a placeholder for when the user actually gets the features
                  newBaseLayer = new GraphicsLayer({
                    id: baseLayer.layerId,
                    copyright:
                      baseLayer.copyright && baseLayer.copyright.includes("<<year>>")
                        ? baseLayer.copyright.replace("<<year>>", new Date().getFullYear().toString())
                        : baseLayer.copyright,
                    title: baseLayer.title,
                    listMode: baseLayer.displayInList ? "show" : "hide",
                    maxScale: baseLayer.maxScale,
                    minScale: baseLayer.minScale,
                    opacity: baseLayer.opacity,
                    visible: baseLayer.visible,
                  });
                  featureLayer.push({ layer: baseLayer, startIndex: 0 });
                  break;

                default: // OS
                  // Create an empty GraphicsLayer as a placeholder for when the user actually gets the features
                  newBaseLayer = new GraphicsLayer({
                    id: baseLayer.layerId,
                    copyright:
                      baseLayer.copyright && baseLayer.copyright.includes("<<year>>")
                        ? baseLayer.copyright.replace("<<year>>", new Date().getFullYear().toString())
                        : baseLayer.copyright,
                    title: baseLayer.title,
                    listMode: baseLayer.displayInList ? "show" : "hide",
                    maxScale: baseLayer.maxScale,
                    minScale: baseLayer.minScale,
                    opacity: baseLayer.opacity,
                    visible: baseLayer.visible,
                  });
                  featureLayer.push({ layer: baseLayer, startIndex: 0 });
                  break;
              }
              break;

            case 2: // WMS
              switch (baseLayer.serviceProvider) {
                case "thinkWare":
                  newBaseLayer = new WMSLayer({
                    url: baseLayer.url,
                    id: baseLayer.layerId,
                    customParameters: {
                      token: baseLayer.token,
                    },
                    sublayers: [
                      {
                        name: baseLayer.activeLayerId,
                        title: baseLayer.activeLayerTitle,
                      },
                    ],
                    copyright:
                      baseLayer.copyright && baseLayer.copyright.includes("<<year>>")
                        ? baseLayer.copyright.replace("<<year>>", new Date().getFullYear().toString())
                        : baseLayer.copyright,
                    title: baseLayer.title,
                    listMode: baseLayer.displayInList ? "show" : "hide",
                    maxScale: baseLayer.maxScale,
                    minScale: baseLayer.minScale,
                    opacity: baseLayer.opacity,
                    visible: baseLayer.visible,
                  });
                  break;

                default: // OS
                  alert("Code to handle OS WMS layers has not been written yet.");
                  break;
              }
              break;

            case 3: // WMTS
              switch (baseLayer.serviceProvider) {
                case "thinkWare":
                  alert("Code to handle thinkWare WMTS layers has not been written yet.");
                  break;

                case "viaEuropa":
                  newBaseLayer = new WMTSLayer({
                    url: `${baseLayer.url}/${baseLayer.layerKey}/${baseLayer.activeLayerId}/wmts?client=arcgis`,
                    id: baseLayer.layerId,
                    copyright:
                      baseLayer.copyright && baseLayer.copyright.includes("<<year>>")
                        ? baseLayer.copyright.replace("<<year>>", new Date().getFullYear().toString())
                        : baseLayer.copyright,
                    title: baseLayer.title,
                    listMode: baseLayer.displayInList ? "show" : "hide",
                    maxScale: baseLayer.maxScale,
                    minScale: baseLayer.minScale,
                    opacity: baseLayer.opacity,
                    visible: baseLayer.visible,
                  });
                  break;

                default: // OS
                  newBaseLayer = new WMTSLayer({
                    url: baseLayer.url,
                    serviceMode: baseLayer.serviceMode,
                    activeLayer: {
                      id: baseLayer.activeLayerId,
                    },
                    customParameters: {
                      key: baseLayer.layerKey,
                    },
                    id: baseLayer.layerId,
                    copyright:
                      baseLayer.copyright && baseLayer.copyright.includes("<<year>>")
                        ? baseLayer.copyright.replace("<<year>>", new Date().getFullYear().toString())
                        : baseLayer.copyright,
                    title: baseLayer.title,
                    listMode: baseLayer.displayInList ? "show" : "hide",
                    maxScale: baseLayer.maxScale,
                    minScale: baseLayer.minScale,
                    opacity: baseLayer.opacity,
                    visible: baseLayer.visible,
                  });
                  break;
              }
              break;

            default:
              break;
          }

          if (newBaseLayer) {
            baseLayerIds.push(baseLayer.layerId);
            if (baseLayer.esuSnap) snapEsu.push(baseLayer.layerId);
            if (baseLayer.blpuSnap) snapBlpu.push(baseLayer.layerId);
            if (baseLayer.extentSnap) snapExtent.push(baseLayer.layerId);
            baseLayers.push(newBaseLayer);
          }
        }
      });

    baseMappingLayerIds.current = baseLayerIds;
    baseLayersSnapEsu.current = snapEsu;
    baseLayersSnapBlpu.current = snapBlpu;
    baseLayersSnapExtent.current = snapExtent;
    baseLayersFeature.current = featureLayer;

    const baseMap = new Map({
      layers: baseLayers,
    });

    const baseView = new MapView({
      container: mapRef.current,
      map: baseMap,
      extent: initialExtent.current
        ? initialExtent.current
        : {
            xmin: 0.0,
            ymin: 0.0,
            xmax: 660000.0,
            ymax: 1300000.0,
            spatialReference: { wkid: 27700 },
          },
      constraints: {
        minZoom: 2,
        maxZoom: 21,
        rotationEnabled: false,
        lods: TileInfo.create({ spatialReference: { wkid: 27700 } }).lods,
      },
      highlightOptions: {
        color: [217, 0, 182, 255],
        fillOpacity: 0,
      },
      popup: {
        collapseEnabled: false,
        dockOptions: {
          buttonEnabled: false,
        },
      },
    });

    const scaleBar = new ScaleBar({
      view: baseView,
      unit: "dual", // The scale bar displays both metric and non-metric units.
    });

    const baseCoordinateConversion = new CoordinateConversion({
      label: "Coordinates",
      view: baseView,
      visibleElements: {
        settingsButton: false,
      },
    });

    const baseSketch = new Sketch({
      id: "ADSEditWidget",
      view: baseView,
      creationMode: "update",
      availableCreateTools: [],
      defaultCreateOptions: { hasZ: false },
      defaultUpdateOptions: {
        tool: "reshape",
        enableRotation: false,
        enableZ: false,
        multipleSelectionEnabled: false,
        toggleToolOnClick: false,
      },
      snappingOptions: { enabled: true },
      settingsMenu: false,
      visibleElements: {
        createTools: {
          rectangle: false,
          circle: false,
        },
      },
      visible: false,
    });

    const baseLayerList = new LayerList({
      id: "ADSLayerList",
      view: baseView,
      label: "Current layers",
      visible: false,
      listItemCreatedFunction: defineActions,
    });

    baseView.ui.add(baseSketch, {
      position: "top-right",
    });

    baseView.ui.remove("zoom"); // Remove default zoom widget first

    baseView.ui.add("map-wizard-buttons", "bottom-left");

    if (placeOnMapOpen.current) baseView.ui.add("ads-place-on-map-control", "top-left");
    else baseView.ui.remove("ads-place-on-map-control");

    baseView.ui.add(baseLayerList, {
      position: "bottom-left",
    });

    baseView.ui.add(scaleBar, {
      position: "bottom-left",
    });

    baseView.ui.add(baseCoordinateConversion, { position: "bottom-right" });

    baseSketch.activeTool = null;

    baseView.when((_) => {
      const plus = document.getElementsByClassName("esri-icon-plus");
      if (plus && plus.length === 1) plus[0].classList = "mapPlusIcon";

      const minus = document.getElementsByClassName("esri-icon-minus");
      if (minus && minus.length === 1) minus[0].classList = "mapMinusIcon";
    });

    mapRef.current = baseMap;
    setView(baseView);
    viewRef.current = baseView;
    sketchRef.current = baseSketch;
    layerListRef.current = baseLayerList;
    coordinateConversionRef.current = baseCoordinateConversion;

    // destroy the map objects
    return () => {
      scaleBar && scaleBar.destroy();
      baseCoordinateConversion && baseCoordinateConversion.destroy();
      baseSketch && baseSketch.destroy();
      baseLayerList && baseLayerList.destroy();
      baseView && baseView.destroy();
      baseMap && baseMap.destroy();
      newBaseLayer && newBaseLayer.destroy();
    };
  }, []);

  // Background streets Layer
  useEffect(() => {
    const haveStreets =
      mapContext.currentBackgroundData &&
      mapContext.currentBackgroundData.streets &&
      mapContext.currentBackgroundData.streets.length > 0;

    const oldAndNewSame = haveStreets
      ? ArraysEqual(oldMapData.current.backgroundStreets, mapContext.currentBackgroundData.streets)
      : false;

    if (!mapRef.current || !haveStreets || oldAndNewSame) return;

    oldMapData.current = {
      streets: oldMapData.current.streets,
      properties: oldMapData.current.properties,
      extents: oldMapData.current.extents,
      backgroundStreets: mapContext.currentBackgroundData.streets,
      unassignedEsus: oldMapData.current.unassignedEsus,
      backgroundProperties: oldMapData.current.backgroundProperties,
      editStreet: oldMapData.current.editStreet,
      editProperty: oldMapData.current.editProperty,
      zoomStreet: oldMapData.current.zoomStreet,
      zoomProperty: oldMapData.current.zoomProperty,
      mapProperty: oldMapData.current.mapProperty,
    };

    if (haveStreets) {
      backgroundStreetData.current = mapContext.currentBackgroundData.streets;
    } else backgroundStreetData.current = null;

    const backgroundStreetFeatures =
      backgroundStreetData.current &&
      backgroundStreetData.current.map((rec, index) => ({
        geometry: {
          type: "polyline",
          paths: rec.wktGeometry && rec.wktGeometry !== "" ? GetWktCoordinates(rec.wktGeometry) : undefined,
          spatialReference: { wkid: 27700 },
        },
        attributes: {
          ObjectID: index,
          USRN: rec.usrn.toString(),
          EsuId: rec.esuId ? rec.esuId.toString() : "",
          Description: streetToTitleCase(rec.address),
          State: rec.state,
          Type: rec.type ? rec.type : 1,
          StateLabel: GetStreetStateLabel(rec.state),
          TypeLabel: GetStreetTypeLabel(rec.type ? rec.type : 1, isScottish.current),
          SymbolCode: `${rec.type ? rec.type.toString() : "1"}, ${rec.state.toString()}`,
        },
      }));

    const backgroundStreetLayer = new FeatureLayer({
      id: backgroundStreetLayerName,
      copyright: `© Copyright Idox Software Ltd. ${new Date().getFullYear()}`,
      source: backgroundStreetFeatures,
      fields: [
        {
          name: "ObjectID",
          alias: "ObjectID",
          type: "oid",
        },
        {
          name: "USRN",
          alias: "USRN",
          type: "string",
        },
        {
          name: "EsuId",
          alias: "EsuId",
          type: "string",
        },
        {
          name: "Description",
          alias: "Description",
          type: "string",
        },
        {
          name: "State",
          alias: "State",
          type: "integer",
        },
        {
          name: "Type",
          alias: "Type",
          type: "integer",
        },
        {
          name: "StateLabel",
          alias: "StateLabel",
          type: "string",
        },
        {
          name: "TypeLabel",
          alias: "TypeLabel",
          type: "string",
        },
        {
          name: "SymbolCode",
          alias: "SymbolCode",
          type: "string",
        },
        {
          name: "Geometry",
          alias: "Geometry",
          type: "string",
        },
      ],
      outFields: ["*"],
      objectIdField: "ObjectID",
      popupTemplate: {
        title: "{Description}",
        lastEditInfoEnabled: false,
        content: [
          {
            type: "fields",
            fieldInfos: [
              {
                fieldName: "EsuId",
                label: "ESU Id",
              },
              {
                fieldName: "USRN",
              },
              {
                fieldName: "StateLabel",
                label: "Status",
              },
              {
                fieldName: "TypeLabel",
                label: "Type",
              },
            ],
          },
        ],
        actions: [],
      },
      renderer: streetRenderer,
      opacity: 0.4,
      spatialReference: { wkid: 27700 },
      title: "Background Street layer",
    });

    mapRef.current.remove(mapRef.current.findLayerById(backgroundStreetLayerName));

    if (backgroundStreetData && backgroundStreetData.current && backgroundStreetData.current.length > 0)
      mapRef.current.add(backgroundStreetLayer);

    backgroundStreetLayerRef.current = backgroundStreetLayer;
  }, [mapContext.currentBackgroundData]);

  // Unassigned ESUs layer
  useEffect(() => {
    const haveEsus =
      mapContext.currentBackgroundData &&
      mapContext.currentBackgroundData.unassignedEsus &&
      mapContext.currentBackgroundData.unassignedEsus.length > 0;

    const oldAndNewSame = haveEsus
      ? ArraysEqual(oldMapData.current.unassignedEsus, mapContext.currentBackgroundData.unassignedEsus)
      : false;

    if (!mapRef.current || !haveEsus || oldAndNewSame) return;

    oldMapData.current = {
      streets: oldMapData.current.streets,
      properties: oldMapData.current.properties,
      extents: oldMapData.current.extents,
      backgroundStreets: oldMapData.current.streets,
      unassignedEsus: mapContext.currentBackgroundData.unassignedEsus,
      backgroundProperties: oldMapData.current.backgroundProperties,
      editStreet: oldMapData.current.editStreet,
      editProperty: oldMapData.current.editProperty,
      zoomStreet: oldMapData.current.zoomStreet,
      zoomProperty: oldMapData.current.zoomProperty,
      mapProperty: oldMapData.current.mapProperty,
    };

    if (haveEsus) {
      unassignedEsusData.current = mapContext.currentBackgroundData.unassignedEsus;
    } else unassignedEsusData.current = null;

    const unassignedEsusFeatures =
      unassignedEsusData.current &&
      unassignedEsusData.current.map((rec, index) => ({
        geometry: {
          type: "polyline",
          paths: rec.wktGeometry && rec.wktGeometry !== "" ? GetWktCoordinates(rec.wktGeometry) : undefined,
          spatialReference: { wkid: 27700 },
        },
        attributes: {
          ObjectID: index,
          USRN: "",
          EsuId: rec.esuId ? rec.esuId.toString() : "",
          Description: "",
          State: rec.state ? rec.state : 0,
          Type: 0,
          StateLabel: GetStreetStateLabel(rec.state ? rec.state : 0),
          TypeLabel: GetStreetTypeLabel(0, isScottish.current),
          SymbolCode: `0, ${rec.state ? rec.state.toString() : "0"}`,
        },
      }));

    const unassignedEsusLayer = new FeatureLayer({
      id: unassignedEsusLayerName,
      copyright: `© Copyright Idox Software Ltd. ${new Date().getFullYear()}`,
      source: unassignedEsusFeatures,
      fields: [
        {
          name: "ObjectID",
          alias: "ObjectID",
          type: "oid",
        },
        {
          name: "USRN",
          alias: "USRN",
          type: "string",
        },
        {
          name: "EsuId",
          alias: "EsuId",
          type: "string",
        },
        {
          name: "Description",
          alias: "Description",
          type: "string",
        },
        {
          name: "State",
          alias: "State",
          type: "integer",
        },
        {
          name: "Type",
          alias: "Type",
          type: "integer",
        },
        {
          name: "StateLabel",
          alias: "StateLabel",
          type: "string",
        },
        {
          name: "TypeLabel",
          alias: "TypeLabel",
          type: "string",
        },
        {
          name: "SymbolCode",
          alias: "SymbolCode",
          type: "string",
        },
        {
          name: "Geometry",
          alias: "Geometry",
          type: "string",
        },
      ],
      outFields: ["*"],
      objectIdField: "ObjectID",
      popupTemplate: {
        title: "Unassigned ESU",
        lastEditInfoEnabled: false,
        content: [
          {
            type: "fields",
            fieldInfos: [
              {
                fieldName: "EsuId",
                label: "ESU Id",
              },
            ],
          },
        ],
        // actions: [streetAssignAction],
        actions: [],
      },
      renderer: streetRenderer,
      opacity: 0.75,
      spatialReference: { wkid: 27700 },
      title: "Unassigned ESU layer",
      visible: process.env.NODE_ENV === "development" ? true : false,
    });

    mapRef.current.remove(mapRef.current.findLayerById(unassignedEsusLayerName));

    if (unassignedEsusData && unassignedEsusData.current && unassignedEsusData.current.length > 0)
      mapRef.current.add(unassignedEsusLayer);

    unassignedEsusLayerRef.current = unassignedEsusLayer;
  }, [mapContext.currentBackgroundData]);

  // Background property layer
  useEffect(() => {
    const haveProperties =
      mapContext.currentBackgroundData &&
      mapContext.currentBackgroundData.properties &&
      mapContext.currentBackgroundData.properties.length > 0;

    const oldAndNewSame = haveProperties
      ? ArraysEqual(oldMapData.current.backgroundProperties, mapContext.currentBackgroundData.properties)
      : false;

    if (!mapRef.current || !haveProperties || oldAndNewSame) return;

    oldMapData.current = {
      streets: oldMapData.current.streets,
      properties: oldMapData.current.properties,
      extents: oldMapData.current.extents,
      backgroundStreets: oldMapData.current.backgroundStreets,
      unassignedEsus: oldMapData.current.unassignedEsus,
      backgroundProperties: mapContext.currentBackgroundData.properties,
      editStreet: oldMapData.current.editStreet,
      editProperty: oldMapData.current.editProperty,
      zoomStreet: oldMapData.current.zoomStreet,
      zoomProperty: oldMapData.current.zoomProperty,
      mapProperty: oldMapData.current.mapProperty,
    };

    if (haveProperties) {
      backgroundPropertyData.current = mapContext.currentBackgroundData.properties;
    } else backgroundPropertyData.current = null;

    const backgroundPropertyFeatures =
      backgroundPropertyData.current &&
      backgroundPropertyData.current.map((rec, index) => ({
        geometry: {
          type: "point",
          x: rec.easting,
          y: rec.northing,
          spatialReference: { wkid: 27700 },
        },
        attributes: {
          ObjectID: index,
          UPRN: rec.uprn ? rec.uprn.toString() : "",
          Address: addressToTitleCase(rec.address, rec.postcode),
          Postcode: rec.postcode,
          Easting: rec.easting,
          Northing: rec.northing,
          LogicalStatus: rec.logicalStatus,
          LogicalStatusLabel: GetLPILogicalStatusLabel(rec.logicalStatus, isScottish.current),
          Classification: rec.blpuClass,
          ClassificationLabel: GetClassificationLabel(rec.blpuClass, isScottish.current),
        },
      }));

    const backgroundPropertyLayer = new FeatureLayer({
      id: backgroundPropertyLayerName,
      copyright: `© Copyright Idox Software Ltd. ${new Date().getFullYear()}`,
      source: backgroundPropertyFeatures,
      featureReduction: PropertyFeatureReduction(8, 15, 15, 0),
      fields: [
        {
          name: "ObjectID",
          alias: "ObjectID",
          type: "oid",
        },
        {
          name: "UPRN",
          alias: "UPRN",
          type: "string",
        },
        {
          name: "Address",
          alias: "Address",
          type: "string",
        },
        {
          name: "Postcode",
          alias: "Postcode",
          type: "string",
        },
        {
          name: "Easting",
          alias: "Easting",
          type: "double",
        },
        {
          name: "Northing",
          alias: "Northing",
          type: "double",
        },
        {
          name: "LogicalStatus",
          alias: "LogicalStatus",
          type: "integer",
        },
        {
          name: "LogicalStatusLabel",
          alias: "LogicalStatusLabel",
          type: "string",
        },
        {
          name: "Classification",
          alias: "Classification",
          type: "string",
        },
        {
          name: "ClassificationLabel",
          alias: "ClassificationLabel",
          type: "string",
        },
      ],
      outFields: ["*"],
      objectIdField: "ObjectID",
      popupTemplate: {
        title: "{Address}",
        lastEditInfoEnabled: false,
        content: [
          {
            type: "fields",
            fieldInfos: [
              {
                fieldName: "UPRN",
              },
              {
                fieldName: "LogicalStatusLabel",
                label: "Logical status",
              },
              {
                fieldName: "ClassificationLabel",
                label: "Classification",
              },
            ],
          },
        ],
        actions: [],
      },
      renderer: backgroundPropertyRenderer,
      opacity: 0.5,
      spatialReference: { wkid: 27700 },
      title: "Background Property layer",
    });

    mapRef.current.remove(mapRef.current.findLayerById(backgroundPropertyLayerName));

    if (backgroundPropertyData && backgroundPropertyData.current && backgroundPropertyData.current.length > 0)
      mapRef.current.add(backgroundPropertyLayer);

    backgroundPropertyLayerRef.current = backgroundPropertyLayer;
  }, [mapContext.currentBackgroundData]);

  // Display loaded SHP files
  useEffect(() => {
    // First unload all the shpFiles previously loaded
    if (loadedShpFileIds.current && loadedShpFileIds.current.length) {
      loadedShpFileIds.current.forEach((shpId) => {
        mapRef.current.remove(mapRef.current.findLayerById(shpId));
      });
    }

    if (mapContext.loadedShpFiles && mapContext.loadedShpFiles.length) {
      mapContext.loadedShpFiles.forEach((shp) => {
        const blob = new Blob([shp.geojson], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const shpLayer = new GeoJSONLayer({
          url: url,
          id: shp.id,
          copyright:
            shp.shpFile.copyright && shp.shpFile.copyright.includes("<<year>>")
              ? shp.shpFile.copyright.replace("<<year>>", new Date().getFullYear().toString())
              : shp.shpFile.copyright,
          title: `${shp.shpFile.title}`,
          listMode: shp.shpFile.displayInList ? "show" : "hide",
          maxScale: shp.shpFile.maxScale,
          minScale: shp.shpFile.minScale,
          opacity: shp.shpFile.opacity,
          spatialReference: { wkid: 27700 },
          visible: true,
        });

        if (shp.shpFile.esuSnap) baseLayersSnapEsu.current = baseLayersSnapEsu.current.concat([shp.id]);
        if (shp.shpFile.blpuSnap) baseLayersSnapBlpu.current = baseLayersSnapBlpu.current.concat([shp.id]);
        if (shp.shpFile.extentSnap) baseLayersSnapExtent.current = baseLayersSnapExtent.current.concat([shp.id]);

        mapRef.current.add(shpLayer);
      });

      loadedShpFileTitles.current = mapContext.loadedShpFiles.map((x) => x.shpFile.title);
      loadedShpFileIds.current = mapContext.loadedShpFiles.map((x) => x.id);
    } else {
      loadedShpFileTitles.current = [];
      loadedShpFileIds.current = [];
    }
  }, [mapContext.loadedShpFiles]);

  // view events
  useEffect(() => {
    if (
      !mapRef.current ||
      !view ||
      !view.ui ||
      (oldMapData.current.streets === mapContext.currentSearchData.streets &&
        oldMapData.current.properties === mapContext.currentSearchData.properties &&
        oldMapData.current.extents === mapContext.currentLayers.extents &&
        oldMapData.current.editStreet === mapContext.currentSearchData.editStreet &&
        oldMapData.current.editProperty === mapContext.currentSearchData.editProperty &&
        oldMapData.current.zoomStreet === mapContext.currentLayers.zoomStreet &&
        oldMapData.current.zoomProperty === mapContext.currentLayers.zoomProperty &&
        oldMapData.current.mapProperty === mapContext.currentProperty)
    )
      return;

    view.on("layerview-create", function (event) {
      if (loading && baseMappingLayerIds.current.includes(event.layer.id)) setLoading(false);
    });

    view.on("click", function (event) {
      const pointLayer = mapRef.current && mapRef.current.findLayerById(editGraphicLayerName);
      const opts = { include: pointLayer };
      view.hitTest(event, opts).then(function (response) {
        if (response.results.length === 0) {
          // Only set coordinates if user has not clicked on a property pin
          if (
            placeOnMapData &&
            placeOnMapData.placeStyle === "point" &&
            (!mapContext.currentWizardPoint ||
              mapContext.currentWizardPoint.x !== event.mapPoint.x.toFixed(4) ||
              mapContext.currentWizardPoint.y !== event.mapPoint.y.toFixed(4))
          ) {
            mapContext.onWizardSetCoordinate({
              x: event.mapPoint.x.toFixed(4),
              y: event.mapPoint.y.toFixed(4),
              pointId: null,
              placeOnMapData: placeOnMapData,
            });
          } else if (!placeOnMapData) mapContext.onPinSelected(null);
        } else if (!placeOnMapData) {
          mapContext.onPinSelected(response.results[0].graphic.attributes.id);
        }
      });
    });

    function fadeVisibilityOn(layer) {
      let animating = true;
      let opacity = 0;
      // fade layer's opacity from 0 to
      // whichever value the user has configured
      const finalOpacity = layer.opacity;
      layer.opacity = opacity;

      if (view) {
        view.whenLayerView(layer).then((layerView) => {
          function incrementOpacityByFrame() {
            if (opacity >= finalOpacity && animating) {
              animating = false;
              return;
            }

            layer.opacity = opacity;
            opacity += 0.02;

            requestAnimationFrame(incrementOpacityByFrame);
          }

          // Wait for tiles to finish loading before beginning the fade
          reactiveUtils
            .whenOnce(() => !layerView.updating)
            .then(() => {
              requestAnimationFrame(incrementOpacityByFrame);
            });
        });
      }
    }

    view.when().then(() => {
      // When the user toggles a layer on or off, transition
      // the layer's visibility using opacity
      layerListRef.current.operationalItems.forEach((item) => {
        item.watch("visible", (visible) => {
          if (visible) {
            fadeVisibilityOn(item.layer);
          }
        });
      });
    });

    layerListRef.current.on("trigger-action", (event) => {
      switch (event.action.id) {
        case "increase-background-street-opacity":
          if (backgroundStreetLayerRef.current.opacity < 1) backgroundStreetLayerRef.current.opacity += 0.25;
          break;

        case "decrease-background-street-opacity":
          if (backgroundStreetLayerRef.current.opacity > 0) backgroundStreetLayerRef.current.opacity -= 0.25;
          break;

        case "increase-unassigned-esu-opacity":
          if (unassignedEsusLayerRef.current.opacity < 1) unassignedEsusLayerRef.current.opacity += 0.25;
          break;

        case "decrease-unassigned-esu-opacity":
          if (unassignedEsusLayerRef.current.opacity > 0) unassignedEsusLayerRef.current.opacity -= 0.25;
          break;

        case "increase-background-property-opacity":
          if (backgroundPropertyLayerRef.current.opacity < 1) backgroundPropertyLayerRef.current.opacity += 0.25;
          break;

        case "decrease-background-property-opacity":
          if (backgroundPropertyLayerRef.current.opacity > 0) backgroundPropertyLayerRef.current.opacity -= 0.25;
          break;

        case "close-shp-file":
          mapContext.onUnloadShpFile(event.item.layer.id);
          break;

        default:
          break;
      }
    });

    reactiveUtils
      .whenOnce(() => coordinateConversionRef.current.formats.length > 0)
      .then(() => {
        let filteredFormats = coordinateConversionRef.current.formats.items.filter(
          (f) => f.name === "basemap" || f.name === "xy"
        );
        filteredFormats[filteredFormats.findIndex((f) => f.name === "basemap")].label = "BNG";
        filteredFormats[filteredFormats.findIndex((f) => f.name === "xy")].label = "Long/Lat";
        coordinateConversionRef.current.formats.items = filteredFormats;
      });

    reactiveUtils
      .whenOnce(() => coordinateConversionRef.current.conversions.length > 0)
      .then(() => {
        coordinateConversionRef.current.conversions.removeAll();
        const f = coordinateConversionRef.current.formats.items.find((f) => f.name === "basemap");
        coordinateConversionRef.current.conversions.add(new Conversion({ format: f }));
      });

    sketchRef.current.on(["update", "undo", "redo", "cursor-update", "draw-complete"], (event) => {
      // get the graphic as it is being updated
      const graphic = event.graphics[0];

      if (graphic.geometry) {
        switch (graphic.geometry.type) {
          case "point":
            if (
              event.type === "undo" ||
              event.type === "redo" ||
              (event.toolEventInfo && event.toolEventInfo.type === "move-stop")
            ) {
              if (
                (!placeOnMapData || placeOnMapData.placeStyle === "point") &&
                (!mapContext.currentWizardPoint ||
                  mapContext.currentWizardPoint.x !== graphic.geometry.x.toFixed(4) ||
                  mapContext.currentWizardPoint.y !== graphic.geometry.y.toFixed(4))
              ) {
                mapContext.onWizardSetCoordinate({
                  x: graphic.geometry.x.toFixed(4),
                  y: graphic.geometry.y.toFixed(4),
                  pointId: !placeOnMapData ? graphic.attributes.id : null,
                  placeOnMapData: placeOnMapData,
                });
              }
            }
            break;

          default:
            break;
        }
      }
    });

    reactiveUtils.when(
      () => view?.stationary === true,
      () => {
        if (view.extent && mapContext) {
          mapContext.onExtentChange({
            xmin: view.extent.xmin,
            ymin: view.extent.ymin,
            xmax: view.extent.xmax,
            ymax: view.extent.ymax,
            spatialReference: { wkid: 27700 },
            zoomLevel: view.zoom,
            hasProperties: userContext.current.currentUser.hasProperty,
          });
        }
      }
    );

    oldMapData.current = {
      streets: mapContext.currentSearchData.streets,
      properties: mapContext.currentSearchData.properties,
      extents: mapContext.currentLayers.extents,
      editStreet: mapContext.currentSearchData.editStreet,
      editProperty: mapContext.currentSearchData.editProperty,
      zoomStreet: mapContext.currentLayers.zoomStreet,
      zoomProperty: mapContext.currentLayers.zoomProperty,
      mapProperty: mapContext.currentProperty,
    };
  }, [
    view,
    mapContext,
    mapContext.currentLayers,
    mapContext.currentBackgroundData,
    mapContext.currentSearchData,
    mapContext.currentProperty,
    loading,
    settingsContext,
    data,
    placeOnMapData,
  ]);

  // Edit Graphics Layer
  useEffect(() => {
    if (!data) return;

    const pointData = data.filter((x) => x.language === "ENG");

    const getMapLabel = (rec) => {
      const duplicateCoordinates = pointData.filter((x) => x.easting === rec.easting && x.northing === rec.northing);

      if (duplicateCoordinates && duplicateCoordinates.length > 1) return `${duplicateCoordinates.length} BLPUs`;
      else return rec.addressDetails.mapLabel;
    };

    sketchRef.current.availableCreateTools = [];

    let pointX;
    let pointY;

    const initialMidX = initialExtent.current ? (initialExtent.current.xmax + initialExtent.current.xmin) / 2 : null;
    const initialMidY = initialExtent.current ? (initialExtent.current.ymax + initialExtent.current.ymin) / 2 : null;

    if (view && view.zoom !== initialExtent.current.zoomLevel) view.zoom = initialExtent.current.zoomLevel;

    if (pointData && pointData.length > 0) {
      const labelFeatures =
        placeStyle === "point"
          ? [
              {
                geometry: {
                  type: "point",
                  x: Number(pointData[0].easting ? pointData[0].easting : initialMidX),
                  y: Number(pointData[0].northing ? pointData[0].northing : initialMidY),
                  spatialReference: { wkid: 27700 },
                },
                attributes: {
                  ObjectID: 0,
                  PropertyId: pointData[0].id,
                  Easting: Number(pointData[0].easting ? pointData[0].easting : initialMidX),
                  Northing: Number(pointData[0].northing ? pointData[0].northing : initialMidY),
                  LogicalStatus: pointData[0].blpu.logicalStatus,
                  Classification:
                    settingsContext.isScottish && !moveBlpu
                      ? pointData[0].classification.classification
                      : pointData[0].blpu.classification,
                  MapLabel: isRange ? `${pointData.length} BLPU${pointData.length > 1 ? "s" : ""}` : "1 BLPU",
                  SymbolCode: `${pointData[0].blpu.logicalStatus}, ${
                    settingsContext.isScottish && !moveBlpu
                      ? pointData[0].classification.classification.substring(0, 1)
                      : pointData[0].blpu.classification.substring(0, 1)
                  }`,
                },
              },
            ]
          : pointData.map((rec, index) => ({
              geometry: {
                type: "point",
                x: Number(rec.easting ? rec.easting : initialMidX),
                y: Number(rec.northing ? rec.northing : initialMidY),
                spatialReference: { wkid: 27700 },
              },
              attributes: {
                ObjectID: index,
                PropertyId: rec.id,
                Easting: Number(rec.easting ? rec.easting : initialMidX),
                Northing: Number(rec.northing ? rec.northing : initialMidY),
                LogicalStatus: rec.blpu.logicalStatus,
                Classification:
                  settingsContext.isScottish && !moveBlpu ? rec.classification.classification : rec.blpu.classification,
                MapLabel: getMapLabel(rec),
                SymbolCode: `${rec.blpu.logicalStatus}, ${
                  settingsContext.isScottish && !moveBlpu
                    ? rec.classification.classification.substring(0, 1)
                    : rec.blpu.classification.substring(0, 1)
                }`,
              },
            }));

      const labelLayer = new FeatureLayer({
        id: labelLayerName,
        copyright: `© Copyright Idox Software Ltd. ${new Date().getFullYear()}`,
        source: labelFeatures,
        listMode: "hide",
        labelingInfo: [
          {
            symbol: {
              type: "text",
              color: "black", //[217, 0, 182, 255],
              font: {
                family: "Noto Sans",
                size: 8,
              },
              yoffset: 8,
            },
            labelPlacement: "above-center",
            labelExpressionInfo: {
              expression: "$feature.MapLabel",
            },
            deconflictionStrategy: "none",
          },
        ],
        labelsVisible: true,
        fields: [
          {
            name: "ObjectID",
            alias: "ObjectID",
            type: "oid",
          },
          {
            name: "PropertyId",
            alias: "PropertyId",
            type: "string",
          },
          {
            name: "Easting",
            alias: "Easting",
            type: "double",
          },
          {
            name: "Northing",
            alias: "Northing",
            type: "double",
          },
          {
            name: "LogicalStatus",
            alias: "LogicalStatus",
            type: "integer",
          },
          {
            name: "Classification",
            alias: "Classification",
            type: "string",
          },
          {
            name: "MapLabel",
            alias: "Label",
            type: "string",
          },
          {
            name: "SymbolCode",
            alias: "SymbolCode",
            type: "string",
          },
        ],
        outFields: ["*"],
        objectIdField: "ObjectID",
        renderer: propertyRenderer,
        spatialReference: { wkid: 27700 },
        title: "Label layer",
      });

      mapRef.current.remove(mapRef.current.findLayerById(labelLayerName));
      mapRef.current.add(labelLayer);

      mapRef.current.remove(mapRef.current.findLayerById(editGraphicLayerName));

      editGraphicsLayer.current.graphics.removeAll();

      mapRef.current.add(editGraphicsLayer.current);
      sketchRef.current.layer = editGraphicsLayer.current;
      sketchRef.current.layer.popupEnabled = false;

      // sketchRef.current.visible = true;

      if (placeStyle === "point") {
        pointX = data[0].easting ? data[0].easting : initialMidX;
        pointY = data[0].northing ? data[0].northing : initialMidY;

        if (pointX && pointY)
          editGraphicsLayer.current.graphics.add(
            createPointGraphic(
              pointX,
              pointY,
              data[0].id,
              data[0].blpu.logicalStatus,
              settingsContext.isScottish && !moveBlpu
                ? data[0].classification.classification.substring(0, 1)
                : data[0].blpu.classification.substring(0, 1),
              false
            )
          );
      } else if (!placeOnMapOpen.current) {
        data
          .filter((x) => x.language === "ENG")
          .sort((a, b) => Number(b.id.substring(4)) - Number(a.id.substring(4)))
          .forEach((property) => {
            pointX = property.easting ? property.easting : initialMidX;
            pointY = property.northing ? property.northing : initialMidY;

            if (pointX && pointY)
              editGraphicsLayer.current.graphics.add(
                createPointGraphic(
                  pointX,
                  pointY,
                  property.id,
                  property.blpu.logicalStatus,
                  settingsContext.isScottish && !moveBlpu
                    ? property.classification.classification.substring(0, 1)
                    : property.blpu.classification.substring(0, 1),
                  false
                )
              );
          });
      }

      editGraphicsLayer.current.listMode = "show";
    } else editGraphicsLayer.current.listMode = "hide";
  }, [data, placeStyle, isRange, view, settingsContext.isScottish, moveBlpu]);

  // Layer list tool
  useEffect(() => {
    if (!layerListRef.current) return;

    layerListRef.current.visible = displayLayerList;
  }, [displayLayerList]);

  // Ensure all records have coordinates
  useEffect(() => {
    if (data) {
      const missingCoordinates = data.filter((x) => !x.easting && !x.northing);

      if (missingCoordinates && missingCoordinates.length > 0) {
        const initialMidX = initialExtent.current
          ? (initialExtent.current.xmax + initialExtent.current.xmin) / 2
          : null;
        const initialMidY = initialExtent.current
          ? (initialExtent.current.ymax + initialExtent.current.ymin) / 2
          : null;

        if (missingCoordinates.length === data.length) {
          mapContext.onWizardSetCoordinate({
            x: initialMidX.toFixed(4),
            y: initialMidY.toFixed(4),
            pointId: null,
            placeOnMapData: placeOnMapData,
          });
        } else {
          for (const updateRecord of missingCoordinates) {
            mapContext.onWizardSetCoordinate({
              x: initialMidX.toFixed(4),
              y: initialMidY.toFixed(4),
              pointId: updateRecord.id,
              placeOnMapData: placeOnMapData,
            });
          }
        }
      }
    }
  }, [data, mapContext, placeOnMapData]);

  useEffect(() => {
    if (
      !view ||
      !mapRef.current ||
      !mapRef.current.layers ||
      mapRef.current.layers.length === 0 ||
      !mapContext.currentHighlight
    )
      return;

    const mapLayers = mapRef.current.layers.items;
    let propertyLayer = null;

    for (let index = 0; index < mapLayers.length; index++) {
      if (mapLayers[index] && mapLayers[index].id === labelLayerName) propertyLayer = mapLayers[index];
    }

    if (mapContext.currentHighlight.property && propertyLayer) {
      view.whenLayerView(propertyLayer).then(function (layerView) {
        let propertyQuery = propertyLayer.createQuery();
        propertyQuery.where = `PropertyId IN ('${mapContext.currentHighlight.property.join("', '")}')`;
        propertyLayer.queryFeatures(propertyQuery).then(function (result) {
          if (highlightProperty.current) highlightProperty.current.remove();
          highlightProperty.current = layerView.highlight(result.features);
        });
      });
    } else if (highlightProperty.current) highlightProperty.current.remove();
  }, [view, mapContext.currentHighlight]);

  return (
    <Fragment>
      <div id="progress-indicator">
        {loading && <CircularProgress sx={{ position: "absolute", top: "50%", left: "60%" }} />}
      </div>
      <Box
        sx={dataFormStyle(moveBlpu ? "ADSWizardMapMoveBlpu" : "ADSWizardMapWizard")}
        ref={mapRef}
        id="ads-wizard-map-box"
      >
        <Box id="map-wizard-buttons" className="esri-widget esri-interactive" sx={{ borderRadius: "6px" }}>
          <Stack
            direction="row"
            sx={{ backgroundColor: adsWhite, height: "32px" }}
            divider={<Divider orientation="vertical" flexItem />}
          >
            <IconButton onClick={handleZoomIn} size="small" title="Zoom in">
              <AddIcon sx={ActionIconStyle()} />
            </IconButton>
            <IconButton onClick={handleZoomOut} size="small" title="Zoom out">
              <RemoveIcon sx={ActionIconStyle()} />
            </IconButton>
            <IconButton onClick={handleDisplayLayerList} size="small" title="Show/hide layers">
              <LayersIcon sx={ActionIconStyle()} />
            </IconButton>
            <IconButton onClick={handleUploadShpFile} size="small" title="Upload shp file">
              <UploadIcon sx={ActionIconStyle()} />
            </IconButton>
          </Stack>
        </Box>
        {displayPlaceOnMap && (
          <Box
            id="ads-place-on-map-control"
            className="esri-widget esri-interactive"
            sx={{
              boxShadow: `4px 4px 7px ${adsLightGreyA50}`,
              borderRadius: "9px",
              backgroundColor: adsBlack0,
            }}
          >
            <ADSPlaceOnMapControl
              id="place-on-map-box"
              data={{
                placeStyle: placeStyle,
                areaStyle: areaStyle,
                startPoint: startPoint,
                direction: direction,
              }}
              isChild={isChild}
              isRange={isRange}
              onPlaceStyleChange={handlePlaceStyleChanged}
              onAreaStyleChange={handleAreaStyleChanged}
              onStartPointChange={handleStartPointChanged}
              onDirectionChange={handleDirectionChanged}
            />
          </Box>
        )}
      </Box>
      <div>
        <Snackbar
          open={saveOpen}
          autoHideDuration={6000}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          onClose={handleSaveClose}
        >
          <Alert
            sx={GetAlertStyle(saveResult.current)}
            icon={GetAlertIcon(saveResult.current)}
            onClose={handleSaveClose}
            severity={GetAlertSeverity(saveResult.current)}
            elevation={6}
            variant="filled"
          >
            {getAlertText()}
          </Alert>
        </Snackbar>
        <UploadShpFileDialog
          isOpen={openUploadShpFileDialog}
          currentIds={baseMappingLayerIds.current.concat(defaultMapLayerIds)}
          onClose={handleUploadShpFileDialogClose}
        />
      </div>
      {loadingShp && (
        <Backdrop open={loadingShp}>
          <CircularProgress color="inherit" />
        </Backdrop>
      )}
    </Fragment>
  );
}

export default ADSWizardMap;
