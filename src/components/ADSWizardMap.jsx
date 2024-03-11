/* #region header */
/**************************************************************************************************
//
//  Description: Wizard Map
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
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useEffect, useState, useRef, Fragment } from "react";
import PropTypes from "prop-types";

import MapContext from "../context/mapContext";
import SettingsContext from "../context/settingsContext";
import UserContext from "../context/userContext";

import WMSLayer from "@arcgis/core/layers/WMSLayer";
import WMTSLayer from "@arcgis/core/layers/WMTSLayer";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import TileInfo from "@arcgis/core/layers/support/TileInfo";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import ScaleBar from "@arcgis/core/widgets/ScaleBar";
import Sketch from "@arcgis/core/widgets/Sketch";
import CoordinateConversion from "@arcgis/core/widgets/CoordinateConversion";
import Conversion from "@arcgis/core/widgets/CoordinateConversion/support/Conversion";
import LayerList from "@arcgis/core/widgets/LayerList";
import Point from "@arcgis/core/geometry/Point";
import Graphic from "@arcgis/core/Graphic";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";

import { CircularProgress, IconButton, Divider } from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSPlaceOnMapControl from "./ADSPlaceOnMapControl";

import { GetMapLayersUrl } from "../configuration/ADSConfig";

import { GetPropertyMapSymbol } from "../utils/ADSMapSymbols";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import LayersIcon from "@mui/icons-material/Layers";

import { adsWhite, adsLightGreyA50, adsBlack0 } from "../utils/ADSColours";
import { ActionIconStyle } from "../utils/ADSStyles";

const editGraphicLayerName = "editGraphicLayer";
const labelLayerName = "labelLayer";

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

  const [loading, setLoading] = useState(true);

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

  const baseMapLayers = useRef(settingsContext.mapLayers);
  const initialExtent = useRef(mapContext.currentExtent);
  const highlightProperty = useRef(null);

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

  function handleZoomIn() {
    view.zoom++;
  }

  function handleZoomOut() {
    view.zoom--;
  }

  function handleDisplayLayerList() {
    setDisplayLayerList(!displayLayerList);
  }

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

    async function GetBaseMapLayers() {
      const mapLayerUrl = GetMapLayersUrl("GET", userContext.current.currentUser.token);

      if (mapLayerUrl) {
        baseMapLayers.current = await fetch(`${mapLayerUrl.url}`, {
          headers: mapLayerUrl.headers,
          crossDomain: true,
          method: "GET",
        })
          .then((res) => (res.ok ? res : Promise.reject(res)))
          .then((res) => res.json())
          .then(
            (result) => {
              return result;
            },
            (error) => {
              console.error("[ERROR] Getting base map layers", error);
              return null;
            }
          );
      }
    }

    const baseLayers = [];
    const baseLayerIds = [];
    const snapEsu = [];
    const snapBlpu = [];
    const snapExtent = [];
    const featureLayer = [];
    let newBaseLayer;

    if (!baseMapLayers.current) GetBaseMapLayers();

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
                    copyright: baseLayer.copyright.includes("<<year>>")
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
                    copyright: baseLayer.copyright.includes("<<year>>")
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
                    copyright: baseLayer.copyright.includes("<<year>>")
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
                    copyright: baseLayer.copyright.includes("<<year>>")
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
                  Classification: settingsContext.isScottish
                    ? pointData[0].classification.classification
                    : pointData[0].blpu.classification,
                  MapLabel: isRange ? `${pointData.length} BLPU${pointData.length > 1 ? "s" : ""}` : "1 BLPU",
                  SymbolCode: `${pointData[0].blpu.logicalStatus}, ${
                    settingsContext.isScottish
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
                Classification: settingsContext.isScottish
                  ? rec.classification.classification
                  : rec.blpu.classification,
                MapLabel: getMapLabel(rec),
                SymbolCode: `${rec.blpu.logicalStatus}, ${
                  settingsContext.isScottish
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
              settingsContext.isScottish
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
                  settingsContext.isScottish
                    ? property.classification.classification.substring(0, 1)
                    : property.blpu.classification.substring(0, 1),
                  false
                )
              );
          });
      }

      editGraphicsLayer.current.listMode = "show";
    } else editGraphicsLayer.current.listMode = "hide";
  }, [data, placeStyle, isRange, view, settingsContext.isScottish]);

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
        sx={{
          flexGrow: 0,
          height: `${moveBlpu ? "83.25vh" : "79.25vh"}`,
          width: "100%",
        }}
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
    </Fragment>
  );
}

export default ADSWizardMap;
