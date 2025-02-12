//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: ESRI Map component
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
//    002   17.03.23 Sean Flook          WI40585 Use property wizard when creating properties.
//    003   21.03.23 Sean Flook          WI40592 Do not allow properties to be created on a closed street or a type 3/4 street.
//    004   28.03.23 Sean Flook          WI40632 Set the source for onWizardDone.
//    005   05.04.23 Sean Flook          WI40596 If opening an historic property display the warning dialog.
//    006   28.06.23 Sean Flook          WI40256 Changed Extent to Provenance where appropriate.
//    007   30.06.23 Sean Flook          WI40770 Set suffix letters to uppercase.
//    008   24.07.23 Sean Flook                  Ensure the sketch tools are displayed if a new record is added.
//    009   10.08.23 Sean Flook                  Removed ASD type 66 layer as not required as it will always be a whole road.
//    010   10.08.23 Sean Flook                  Changes required for @arcgis/core version 4.27.6.
//    011   07.09.23 Sean Flook                  Added code to handle unassigned ESUs and for dividing and assigning ESUs.
//    012   20.09.23 Sean Flook                  Implemented ability to show street or property in Google street view. Also few other bug fixes.
//    013   22.09.23 Sean Flook                  Changes required to handle Scottish classifications.
//    014   06.10.23 Sean Flook                  Changes required to handle GeoPlace ASD records.
//    014   10.10.23 Sean Flook        IMANN-163 Changes required for opening the related tab after the property wizard.
//    015   11.10.23 Sean Flook        IMANN-163 Use the centralised doOpenRecord method.
//    016   11.10.23 Sean Flook        IMANN-163 Correctly handle historic properties.
//    017   16.10.23 Sean Flook                  Comment out the type 64 and 66 layers until they have been implemented in the API.
//    018   27.10.23 Sean Flook                  Updated call to SavePropertyAndUpdate.
//    019   03.11.23 Sean Flook        IMANN-175 Added code to allow properties to be selected.
//    020   10.11.23 Sean Flook        IMANN-175 Added code try and correctly highlight properties after doing a move BLPU.
//    021   20.11.23 Sean Flook                  Added street BLPU to the list of classifications that display an icon.
//    022   24.11.23 Sean Flook                  Moved Box and Stack to @mui/system and changed code to use map rather than foreach.
//    023   06.12.23 Sean Flook        IMANN-149 Uncomment the type 64 and 66 layers as the API has now been written.
//    024   19.12.23 Sean Flook                  Various bug fixes.
//    025   20.12.23 Sean Flook        IMANN-152 Display a dialog when user selects the polyline tool when editing.
//    026   02.01.24 Sean Flook                  Changes required to load shape files.
//    027   02.01.24 Sean Flook                  Handle errors when loading shape files.
//    028   03.01.24 Sean Flook                  Fixed warning.
//    029   05.01.24 Sean Flook                  use CSS shortcuts.
//    030   10.01.24 Sean Flook        IMANN-215 Allow ESUs to be assigned to a street when creating a new street.
//    031   11.01.24 Sean Flook        IMANN-163 Close the add property wizard dialog when clicking on view properties.
//    032   25.01.24 Sean Flook                  Changes required after UX review and some fixes for bugs/warnings.
//    033   26.01.24 Sean Flook        IMANN-260 Corrected field name.
//    034   06.02.24 Sean Flook                  Updated street view icon.
//    035   07.02.24 Sean Flook                  Changes required to support viaEuropa mapping for OneScotland.
//    036   07.02.24 Sean Flook                  Changes required to support WFS from viaEuropa mapping for OneScotland.
//    037   08.02.24 Sean Flook                  Added a fix for using viaEuropa mapping with ArcGIS.
//    038   09.02.24 Sean Flook                  Removed Divide and Assign from the street actions.
//    039   09.02.24 Sean Flook                  Modified handleHistoricPropertyClose to handle returning an action from the historic property warning dialog.
//    040   09.02.24 Sean Flook                  Change to use different line symbols for each type of ASD record.
//    041   13.02.24 Sean Flook                  Ensure the ASD geometries are displayed when creating a new street.
//    042   14.02.24 Sean Flook         ASD10_GP When editing an ASD record hide the other ASD geometries.
//    043   14.02.24 Sean Flook         ASD10_GP Filter the current ASD layer to the one that is currently being viewed.
//    044   14.02.24 Sean Flook                  Added a bit of error trapping.
//    045   16.02.24 Sean Flook                  Corrected the parameters in GetViaEuropaFeatureAtCoord.
//    046   16.02.24 Sean Flook         ESU16_GP Whilst assigning ESU prevent anything else from occurring with the ESUs.
//    047   20.02.24 Sean Flook             MUL1 Changes required to selecting properties from the map.
//    048   22.02.24 Sean Flook          ESU3_GP Set the fillOpacity on the highlight to 0.25.
//    049   08.03.24 Sean Flook        IMANN-348 Use the new hasStreetChanged and hasPropertyChanged methods.
//    050   11.03.24 Sean Flook            GLB12 Adjusted height to remove gap.
//    051   11.03.24 Sean Flook         ESU29_GP Set ASD visibility after creating and adding to map.
//    052   22.03.24 Sean Flook            GLB12 Changed to use dataFormStyle so height can be correctly set.
//    053   08.04.24 Sean Flook            STRT4 Changes to allow for authority extent defaults. Changes required to prevent crash when refreshing page.
//    054   16.04.24 Sean Flook                  When loading a SHP file use the mapContext to retain the information and display the layer in the map.
//    055   18.04.24 Sean Flook        IMANN-351 Changes required to prevent crashes when refreshing the page.
//    056   02.05.24 Joshua McCormick  IMANN-283 Set GetStreetTypeLabel and GetStreetStateLabel return street code set to false with map overlay
//    057   02.05.24 Joshua McCormick  IMANN-283 GetStreetTypeLabel and GetStreetStateLabel return street code false for all instances
//    058   03.05.24 Sean Flook                  Moved functions out of useEffect by using useCallback.
//    059   14.05.24 Sean Flook        IMANN-206 Changes required to display all the provenances.
//    060   14.05.24 Sean Flook        IMANN-206 Include property actions to the background provenance layer information dialog.
//    061   20.05.24 Sean Flook        IMANN-444 Refresh the snap layers after loading a SHP file.
//    062   20.05.24 Sean Flook        IMANN-476 Check view has been created first in fadeVisibilityOn.
//    063   21.05.24 Sean Flook        IMANN-462 Moved loading of base mapping into its own method and wait for details before we try and load it.
//    064   04.06.24 Sean Flook        IMANN-507 After redrawing a street or property if we are editing the graphic ensure the popup is disabled and the edit graphics layer is on top.
//    065   06.06.24 Sean Flook        IMANN-522 Always allow editing of provenances.
//    066   11.06.24 Sean Flook        IMANN-527 Corrected values in streetRenderer.
//    067   12.06.24 Sean Flook        IMANN-565 Handle polygon deletion.
//    068   19.06.24 Sean Flook        IMANN-629 Changes to code so that current user is remembered and a 401 error displays the login dialog.
//    069   20.06.24 Sean Flook        IMANN-636 Use the new user rights.
//    070   24.06.24 Sean Flook        IMANN-170 Changes required for cascading parent PAO changes to children.
//    071   26.06.24 Sean Flook        IMANN-586 Reset the snapping layers after the edit graphics layer has been updated.
//    072   26.06.24 Joshua McCormick  IMANN-548 zoomStreet and property fix, zoomPropertyDataRef length > 0 check
//    073   28.06.24 Sean Flook                  Set the active tool in the sketch widget, needs to be uncommented once ESRI has been updated.
//    074   01.07.24 Sean Flook        IMANN-583 Only remove the graphics from the edit layer when required.
//    075   01.07.24 Sean Flook        IMANN-592 When selecting to open a street or property that is not currently part of the map search data add it.
//    076   02.07.24 Sean Flook        IMANN-507 Only add the edit graphics layer once.
//    077   02.07.24 Sean Flook        IMANN-507 When editing a property ensure the edit layer is top of the list.
//    078   02.07.24 Sean Flook        IMANN-689 Set the unassigned ESUs layer visibility to true.
//    079   08.07.24 Sean Flook        IMANN-728 Pass in the new parameter to onExtentChange.
//    080   10.07.24 Sean Flook        IMANN-742 Only allow properties to be added to a street if the user has permission to do that.
//    081   17.07.24 Sean Flook        IMANN-596 When selecting objects ensure at least 500 milliseconds have elapsed since the last selection, this is a work around for an ESRI bug.
//    082   18.07.24 Sean Flook        IMANN-772 Corrected field name.
//    083   22.07.24 Sean Flook        IMANN-774 Added hack to cater for ESRI double event issue for when selecting ESUs.
//    084   13.08.24 Sean Flook        IMANN-918 Do not display the sketch tool if the user does not have rights to edit the object.
//    085   27.08.24 Sean Flook        IMANN-888 Ensure the background streets are redrawn when creating a new street whilst already looking at another street.
//    086   28.08.24 Sean Flook        IMANN-957 Handle if formattedAddress  is missing from the property data.
//    087   03.09.24 Sean Flook        IMANN-972 Prevent infinite loop from occurring.
//    088   10.09.24 Sean Flook        IMANN-980 Only write to the console if the user has the showMessages right.
//endregion Version 1.0.0.0
//region Version 1.0.1.0
//    089   27.09.24 Sean Flook        IMANN-573 when creating a new child or range of children check the parent is not already at the maximum allowable level.
//    090   01.10.24 Sean Flook        IMANN-713 Changed the text on the buttons for adding a property/ies to a street.
//    091   01.10.24 Sean Flook        IMANN-993 Display the extent merge tool.
//    092   03.10.24 Sean Flook        IMANN-958 Check user has property edit permission before trying to create a child/children.
//    093   04.10.24 Sean Flook       IMANN-1005 Use a different colour for a closed street.
//    094   14.10.24 Sean Flook       IMANN-1016 Changes required to handle LLPG Streets.
//    095   14.10.24 Sean Flook       IMANN-1024 Call onEditMapObject when opening a property.
//    096   28.10.24 Joshua McCormick  IMANN-904 useEffect for mapContext.currentClearObject
//    097   05.11.24 Sean Flook        IMANN-904 When clearing the current edit object clear the geometry as well.
//    098   06.11.24 Sean Flook       IMANN-1047 Undo changes done for IMANN-904.
//endregion Version 1.0.1.0
//region Version 1.0.2.0
//    099   21.11.24 Sean Flook       IMANN-1029 Use the correct UPRN when calling GetParentHierarchy.
//endregion Version 1.0.2.0
//region Version 1.0.3.0
//    100   06.01.25 Sean Flook       IMANN-1121 Tidied up code around UI controls.
//    101   06.01.25 Sean Flook       IMANN-1123 Changed Multiple properties to Multiple addresses in popup.
//    102   06.01.25 Sean Flook       IMANN-1123 Changed issue number above.
//    103   07.01.25 Sean Flook       IMANN-1123 Sort properties on logical status to try and get the cluster symbol correct.
//    104   07.01.25 Sean Flook       IMANN-1123 Fixed typo.
//    105   07.01.25 Sean Flook       IMANN-1119 Added a new field to the property features called DisplayLogicalStatus to be used for the display of the symbols.
//    106   09.01.25 Sean Flook        IMANN-781 Include the pkId in the extent object.
//    107   09.01.25 Sean Flook       IMANN-1125 Correctly check for nulls when determining if background data is the same.
//    108   09.01.25 Sean Flook       IMANN-1125 Remove console logs where not required.
//    109   10.01.25 Sean Flook        IMANN-781 Do not redo the layers when editing a provenance record.
//    110   13.01.25 Sean Flook       IMANN-1135 If background streets layer was visible when selecting properties keep it visible.
//    111   13.01.25 Sean Flook       IMANN-1135 Remember the visibility of the layers between redraws.
//    112   13.01.25 Sean Flook       IMANN-1136 Various changes to improve editing provenances.
//    113   13.01.25 Sean Flook       IMANN-1132 Ensure the reordering of the layers is correctly run.
//    114   16.01.25 Sean Flook       IMANN-1135 When selecting properties adjust the opacity of the street layer.
//    115   16.01.25 Sean Flook       IMANN-1136 Correctly handle merging provenance extents.
//endregion Version 1.0.3.0
//region Version 1.0.4.0
//    116   04.02.25 Sean Flook       IMANN-1677 Save the correct object to historicRec when opening a historic property.
//    117   11.02.25 Sean Flook       IMANN-1680 Added some error handling.
//    118   12.02.25 Sean Flook       IMANN-1684 Changes required to set the map extent to the authorities extent when returning to the gazetteer page with no search results.
//endregion Version 1.0.4.0
//region Version 1.0.5.0
//    119   27.01.25 Sean Flook       IMANN-1077 Added some error handling.
//    120   30.01.25 Sean Flook       IMANN-1673 Changes required for new user settings API.
//endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//endregion header

//region imports

import React, { useContext, useState, useRef, useCallback, useEffect, Fragment } from "react";
// import { useNavigate } from "react-router";
import { useHistory } from "react-router";
import PropTypes from "prop-types";

import MapContext from "../context/mapContext";
import SandboxContext from "../context/sandboxContext";
import StreetContext from "../context/streetContext";
import PropertyContext from "../context/propertyContext";
import UserContext from "../context/userContext";
import LookupContext from "../context/lookupContext";
import SearchContext from "../context/searchContext";
import SettingsContext from "../context/settingsContext";
import InformationContext from "../context/informationContext";

import { useSaveConfirmation } from "../pages/SaveConfirmationPage";
import { GetPropertyFromUPRNUrl } from "../configuration/ADSConfig";
import {
  GetWktCoordinates,
  GetPolylineAsWKT,
  GetPolygonAsWKT,
  GetChangedAssociatedRecords,
  ArraysEqual,
  openInStreetView,
  doOpenRecord,
  defaultMapLayerIds,
  mergeArrays,
  getBaseMapLayers,
} from "../utils/HelperUtils";
import {
  GetStreetStateLabel,
  GetStreetTypeLabel,
  GetCurrentStreetData,
  SaveStreet,
  GetAuthorityLabel,
  GetAsdPrimaryCodeText,
  GetWholeRoadLabel,
  GetReinstatementLabel,
  GetInterestLabel,
  GetProwStatusLabel,
  GetDistrictLabel,
  DisplayStreetInStreetView,
  hasStreetChanged,
  setASDLayerVisibility,
  GetStreetMapData,
} from "../utils/StreetUtils";
import {
  GetClassificationLabel,
  GetLPILogicalStatusLabel,
  GetProvenanceLabel,
  GetCurrentPropertyData,
  SavePropertyAndUpdate,
  UpdateRangeAfterSave,
  UpdateAfterSave,
  GetPropertyMapData,
  hasPropertyChanged,
  hasParentPaoChanged,
  getClassificationCode,
  GetParentHierarchy,
} from "../utils/PropertyUtils";

import shp from "shpjs";

import WMSLayer from "@arcgis/core/layers/WMSLayer";
import WMTSLayer from "@arcgis/core/layers/WMTSLayer";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import TileInfo from "@arcgis/core/layers/support/TileInfo";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import ScaleBar from "@arcgis/core/widgets/ScaleBar";
import Sketch from "@arcgis/core/widgets/Sketch";
import CoordinateConversion from "@arcgis/core/widgets/CoordinateConversion";
import Conversion from "@arcgis/core/widgets/CoordinateConversion/support/Conversion";
import LayerList from "@arcgis/core/widgets/LayerList";
import Measurement from "@arcgis/core/widgets/Measurement";
import Polyline from "@arcgis/core/geometry/Polyline";
import Polygon from "@arcgis/core/geometry/Polygon";
import Point from "@arcgis/core/geometry/Point";
import Graphic from "@arcgis/core/Graphic";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import esriRequest from "@arcgis/core/request";

import {
  GetBackgroundPropertyMapSymbol,
  GetPropertyMapSymbol,
  GetExtentMapSymbol,
  GetStreetMapSymbol,
  GetESUMapSymbol,
  GetASDMapSymbol,
  GetLlpgStreetMapSymbol,
} from "../utils/ADSMapSymbols";
import { CircularProgress, IconButton, Divider, Snackbar, Alert, Backdrop, Popper } from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSSelectionControl from "../components/ADSSelectionControl";
import AddPropertyWizardDialog from "../dialogs/AddPropertyWizardDialog";
import HistoricPropertyDialog from "../dialogs/HistoricPropertyDialog";
import UploadShpFileDialog from "../dialogs/UploadShpFileDialog";

import DETRCodes from "./../data/DETRCodes";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import LayersIcon from "@mui/icons-material/Layers";
import MergeIcon from "@mui/icons-material/Merge";
import StraightenIcon from "@mui/icons-material/Straighten";
import UploadIcon from "@mui/icons-material/Upload";
import { adsWhite } from "../utils/ADSColours";
import { ActionIconStyle, GetAlertStyle, GetAlertIcon, GetAlertSeverity, dataFormStyle } from "../utils/ADSStyles";

//endregion imports

const backgroundPropertyLayerName = "backgroundPropertyLayer";
const backgroundProvenanceLayerName = "backgroundProvenanceLayer";
const backgroundStreetLayerName = "backgroundStreetLayer";
const unassignedEsusLayerName = "unassignedEsusLayer";
const streetLayerName = "streetLayer";
const llpgStreetLayerName = "llpgStreetLayer";
const propertyLayerName = "propertyLayer";
const extentLayerName = "extentLayer";
const asd51LayerName = "asd51Layer";
const asd52LayerName = "asd52Layer";
const asd53LayerName = "asd53Layer";
const asd61LayerName = "asd61Layer";
const asd62LayerName = "asd62Layer";
const asd63LayerName = "asd63Layer";
const asd64LayerName = "asd64Layer";
const asd66LayerName = "asd66Layer";
const zoomGraphicsLayerName = "zoomGraphicsLayer";
const editGraphicsLayerName = "editGraphicsLayer";
const selectPropertyLayerName = "selectPropertyLayer";

const defaultValidColour = [117, 112, 179]; // purple
const defaultInvalidColour = [255, 0, 0]; // red
const defaultExtraLineWidth = 5;
const defaultEditStyle = "solid";

const streetOpenAction = {
  title: "Open street record",
  id: "open-street-record",
  image:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAcUlEQVR4Ae2VsQ3AIBDEPEE6dkrGy2xsAIOQhtoSOppIWPoObD0NHFZ5gA4MmYmcEZpfDANywChA3RYQec0DLi95wOXkAZfnAZc7HnD5joDLoydyeR64RL5tg9fleWBuYuQBfhNowAinZR+OTwduVjh8GbqRVAucOQEAAAAASUVORK5CYII=",
};

const asd51OpenAction = {
  title: "Open ASD record",
  id: "open-asd-51-record",
  image:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAcUlEQVR4Ae2VsQ3AIBDEPEE6dkrGy2xsAIOQhtoSOppIWPoObD0NHFZ5gA4MmYmcEZpfDANywChA3RYQec0DLi95wOXkAZfnAZc7HnD5joDLoydyeR64RL5tg9fleWBuYuQBfhNowAinZR+OTwduVjh8GbqRVAucOQEAAAAASUVORK5CYII=",
};

const asd52OpenAction = {
  title: "Open ASD record",
  id: "open-asd-52-record",
  image:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAcUlEQVR4Ae2VsQ3AIBDEPEE6dkrGy2xsAIOQhtoSOppIWPoObD0NHFZ5gA4MmYmcEZpfDANywChA3RYQec0DLi95wOXkAZfnAZc7HnD5joDLoydyeR64RL5tg9fleWBuYuQBfhNowAinZR+OTwduVjh8GbqRVAucOQEAAAAASUVORK5CYII=",
};

const asd53OpenAction = {
  title: "Open ASD record",
  id: "open-asd-53-record",
  image:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAcUlEQVR4Ae2VsQ3AIBDEPEE6dkrGy2xsAIOQhtoSOppIWPoObD0NHFZ5gA4MmYmcEZpfDANywChA3RYQec0DLi95wOXkAZfnAZc7HnD5joDLoydyeR64RL5tg9fleWBuYuQBfhNowAinZR+OTwduVjh8GbqRVAucOQEAAAAASUVORK5CYII=",
};

const asd61OpenAction = {
  title: "Open ASD record",
  id: "open-asd-61-record",
  image:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAcUlEQVR4Ae2VsQ3AIBDEPEE6dkrGy2xsAIOQhtoSOppIWPoObD0NHFZ5gA4MmYmcEZpfDANywChA3RYQec0DLi95wOXkAZfnAZc7HnD5joDLoydyeR64RL5tg9fleWBuYuQBfhNowAinZR+OTwduVjh8GbqRVAucOQEAAAAASUVORK5CYII=",
};

const asd62OpenAction = {
  title: "Open ASD record",
  id: "open-asd-62-record",
  image:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAcUlEQVR4Ae2VsQ3AIBDEPEE6dkrGy2xsAIOQhtoSOppIWPoObD0NHFZ5gA4MmYmcEZpfDANywChA3RYQec0DLi95wOXkAZfnAZc7HnD5joDLoydyeR64RL5tg9fleWBuYuQBfhNowAinZR+OTwduVjh8GbqRVAucOQEAAAAASUVORK5CYII=",
};

const asd63OpenAction = {
  title: "Open ASD record",
  id: "open-asd-63-record",
  image:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAcUlEQVR4Ae2VsQ3AIBDEPEE6dkrGy2xsAIOQhtoSOppIWPoObD0NHFZ5gA4MmYmcEZpfDANywChA3RYQec0DLi95wOXkAZfnAZc7HnD5joDLoydyeR64RL5tg9fleWBuYuQBfhNowAinZR+OTwduVjh8GbqRVAucOQEAAAAASUVORK5CYII=",
};

const asd64OpenAction = {
  title: "Open ASD record",
  id: "open-asd-64-record",
  image:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAcUlEQVR4Ae2VsQ3AIBDEPEE6dkrGy2xsAIOQhtoSOppIWPoObD0NHFZ5gA4MmYmcEZpfDANywChA3RYQec0DLi95wOXkAZfnAZc7HnD5joDLoydyeR64RL5tg9fleWBuYuQBfhNowAinZR+OTwduVjh8GbqRVAucOQEAAAAASUVORK5CYII=",
};

const asd66OpenAction = {
  title: "Open ASD record",
  id: "open-asd-66-record",
  image:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAcUlEQVR4Ae2VsQ3AIBDEPEE6dkrGy2xsAIOQhtoSOppIWPoObD0NHFZ5gA4MmYmcEZpfDANywChA3RYQec0DLi95wOXkAZfnAZc7HnD5joDLoydyeR64RL5tg9fleWBuYuQBfhNowAinZR+OTwduVjh8GbqRVAucOQEAAAAASUVORK5CYII=",
};

const streetAddProperty = {
  title: "Add property",
  id: "add-property",
  image:
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjRweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMjRweCIgZmlsbD0iIzAwMDAwMCI+PHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTEzIDdoLTJ2NEg3djJoNHY0aDJ2LTRoNHYtMmgtNFY3em0tMS01QzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0wIDE4Yy00LjQxIDAtOC0zLjU5LTgtOHMzLjU5LTggOC04IDggMy41OSA4IDgtMy41OSA4LTggOHoiLz48L3N2Zz4=",
};

const streetAddRangeProperties = {
  title: "Add properties",
  id: "add-range-properties",
  image:
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjRweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMjRweCIgZmlsbD0iIzAwMDAwMCI+PHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTEzIDdoLTJ2NEg3djJoNHY0aDJ2LTRoNHYtMmgtNFY3em0tMS01QzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0wIDE4Yy00LjQxIDAtOC0zLjU5LTgtOHMzLjU5LTggOC04IDggMy41OSA4IDgtMy41OSA4LTggOHoiLz48L3N2Zz4=",
};

// const streetDivideAction = {
//   title: "Divide ESU",
//   id: "divide-esu",
//   image:
//     "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAaUlEQVQ4y+2Puw2AMAwFbwlnIBjMQ+IlwgR0oYkiB+UjCgoQl+70TpHhS6TytDh1thtoZXUWREJlA3EU7CTMJQHLthloHhji5kZAW4Hm0UZiQ4CVo/yndBGXLJeLJskNpH3miD94JHgTJw9kSf+qmB3hAAAAAElFTkSuQmCC",
// };

// const streetAssignAction = {
//   title: "Assign ESU to active street",
//   id: "assign-esu",
//   image:
//     "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+Cjxzdmcgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDI0IDI0IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zOnNlcmlmPSJodHRwOi8vd3d3LnNlcmlmLmNvbS8iIHN0eWxlPSJmaWxsLXJ1bGU6ZXZlbm9kZDtjbGlwLXJ1bGU6ZXZlbm9kZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLW1pdGVybGltaXQ6MjsiPgogICAgPHBhdGggZD0iTTEzLjMzOSwyMUwzLDIxTDcuNSwzTDE2LjUsM0wxOC42MDQsMTEuNDE4QzIwLjU5NywxMi4yNDQgMjIsMTQuMjEgMjIsMTYuNUMyMiwxOS41MzYgMTkuNTM2LDIyIDE2LjUsMjJDMTUuMzI0LDIyIDE0LjIzMywyMS42MyAxMy4zMzksMjFaTTEzLjIwMywyMC45MDJMMTMuMjAyLDIwLjkwMUwxMy4yMDMsMjAuOTAyWk0xMy4xNjgsMjAuODc1TDEzLjE3MiwyMC44NzhMMTMuMTY4LDIwLjg3NVpNMTMuMDcxLDIwLjc5OUwxMy4wNywyMC43OThMMTMuMDcxLDIwLjc5OVpNMTMuMDM3LDIwLjc3MkwxMy4wNDEsMjAuNzc1TDEzLjAzNywyMC43NzJaTTEyLjk0MSwyMC42OTJMMTIuOTQ0LDIwLjY5NEwxMi45NDEsMjAuNjkyWk0xMi45MSwyMC42NjVMMTIuOTEzLDIwLjY2OEwxMi45MSwyMC42NjVaTTEyLjgxNSwyMC41ODJMMTIuODE4LDIwLjU4NEwxMi44MTUsMjAuNTgyWk0xMi43ODYsMjAuNTU1TDEyLjc4NywyMC41NTZMMTIuNzg2LDIwLjU1NVpNMTIuNjkzLDIwLjQ2OEwxMi42OTYsMjAuNDcxTDEyLjY5MywyMC40NjhaTTEyLjU3NSwyMC4zNTFMMTIuNTc3LDIwLjM1NEwxMi41NzUsMjAuMzUxWk0xMi40NjEsMjAuMjMyTDEyLjQ2MiwyMC4yMzNMMTIuNDYxLDIwLjIzMlpNMTcuNDc2LDE1Ljg3NkwxOS4zNTIsMTRMMTQuMDI5LDE0LjAyOUwxNCwxOS4zNTJMMTUuODc2LDE3LjQ3NkwxOC4yLDE5LjhMMTkuOCwxOC4yTDE3LjQ3NiwxNS44NzZaTTExLjk2NiwxOS42MTJMMTEuOTY3LDE5LjYxM0wxMS45NjYsMTkuNjEyWk0xMS44OTUsMTkuNTA3TDExLjg5NiwxOS41MDlMMTEuODk1LDE5LjUwN1pNMTEuODczLDE5LjQ3M0wxMS44NzQsMTkuNDc0TDExLjg3MywxOS40NzNaTTExLjcxOSwxOS4yMTlMMTEuNzIyLDE5LjIyNEwxMS43MTksMTkuMjE5Wk0xMS42MzgsMTkuMDcyTDExLjY0MSwxOS4wNzhMMTEuNjM4LDE5LjA3MlpNMTEuNjIsMTkuMDM3TDExLjYyMSwxOS4wMzlMMTEuNjIsMTkuMDM3Wk0xMyw1TDEzLDdMMTEsN0wxMSw1TDksNUw2LDE5TDExLjYwMSwxOUMxMS4yMTcsMTguMjUgMTEsMTcuNCAxMSwxNi41QzExLDEzLjUzNiAxMy4zNSwxMS4xMTYgMTYuMjg3LDExLjAwNEwxNSw1TDEzLDVaTTEzLDlMMTEsOUwxMSwxMS41TDEzLDExLjVMMTMsOVpNMTguMjAyLDExLjI2OUwxOC4yMDQsMTEuMjY5TDE4LjIwMiwxMS4yNjlaTTE4LjEzOCwxMS4yNDhMMTguMTQ1LDExLjI1MUwxOC4xMzgsMTEuMjQ4Wk0xOC4xMDYsMTEuMjM4TDE4LjExNSwxMS4yNDFMMTguMTA2LDExLjIzOFpNMTguMDc0LDExLjIyOUwxOC4wODQsMTEuMjMyTDE4LjA3NCwxMS4yMjlaTTE4LjA0MSwxMS4yMTlMMTguMDUyLDExLjIyM0wxOC4wNDEsMTEuMjE5Wk0xOC4wMDksMTEuMjFMMTguMDIxLDExLjIxM0wxOC4wMDksMTEuMjFaTTE3LjkxMiwxMS4xODNMMTcuOTI1LDExLjE4N0wxNy45MTIsMTEuMTgzWk0xNy44NzksMTEuMTc1TDE3Ljg5MywxMS4xNzhMMTcuODc5LDExLjE3NVpNMTcuODQ2LDExLjE2NkwxNy44NiwxMS4xN0wxNy44NDYsMTEuMTY2Wk0xNy44MTMsMTEuMTU4TDE3LjgyOCwxMS4xNjJMMTcuODEzLDExLjE1OFpNMTcuNzgxLDExLjE1TDE3Ljc5NSwxMS4xNTRMMTcuNzgxLDExLjE1Wk0xNy43NDgsMTEuMTQyTDE3Ljc2MywxMS4xNDZMMTcuNzQ4LDExLjE0MlpNMTcuNjgxLDExLjEyN0wxNy42OTcsMTEuMTMxTDE3LjY4MSwxMS4xMjdaTTE3LjYxNSwxMS4xMTNMMTcuNjMxLDExLjExN0wxNy42MTUsMTEuMTEzWk0xNy41ODIsMTEuMTA3TDE3LjU5OCwxMS4xMUwxNy41ODIsMTEuMTA3Wk0xNy41MTUsMTEuMDk0TDE3LjUzMSwxMS4wOTdMMTcuNTE1LDExLjA5NFpNMTcuNDQ4LDExLjA4MkwxNy40NjQsMTEuMDg0TDE3LjQ0OCwxMS4wODJaTTE3LjQxNCwxMS4wNzZMMTcuNDMxLDExLjA3OUwxNy40MTQsMTEuMDc2Wk0xNy4zOCwxMS4wN0wxNy4zOTcsMTEuMDczTDE3LjM4LDExLjA3Wk0xNy4zNDcsMTEuMDY1TDE3LjM2MywxMS4wNjhMMTcuMzQ3LDExLjA2NVpNMTcuMjc5LDExLjA1NUwxNy4yOTYsMTEuMDU3TDE3LjI3OSwxMS4wNTVaTTE3LjI0NSwxMS4wNUwxNy4yNjIsMTEuMDUyTDE3LjI0NSwxMS4wNVpNMTcuMjExLDExLjA0NkwxNy4yMjgsMTEuMDQ4TDE3LjIxMSwxMS4wNDZaTTE3LjE0MiwxMS4wMzdMMTcuMTYsMTEuMDM5TDE3LjE0MiwxMS4wMzdaTTE3LjEwOCwxMS4wMzNMMTcuMTI2LDExLjAzNUwxNy4xMDgsMTEuMDMzWk0xNy4wMzksMTEuMDI2TDE3LjA1NywxMS4wMjhMMTcuMDM5LDExLjAyNlpNMTcuMDA1LDExLjAyM0wxNy4wMjMsMTEuMDI1TDE3LjAwNSwxMS4wMjNaTTE2Ljk3LDExLjAyTDE2Ljk4OCwxMS4wMjFMMTYuOTcsMTEuMDJaTTE2LjkzNiwxMS4wMTdMMTYuOTU0LDExLjAxOEwxNi45MzYsMTEuMDE3Wk0xNi44NjYsMTEuMDEyTDE2Ljg4NSwxMS4wMTNMMTYuODY2LDExLjAxMlpNMTYuODMyLDExLjAxTDE2Ljg1LDExLjAxMUwxNi44MzIsMTEuMDFaTTE2Ljc5NywxMS4wMDhMMTYuODE1LDExLjAwOUwxNi43OTcsMTEuMDA4Wk0xNi43NjIsMTEuMDA2TDE2Ljc4LDExLjAwN0wxNi43NjIsMTEuMDA2Wk0xNi43MjcsMTEuMDA1TDE2Ljc0NSwxMS4wMDVMMTYuNzI3LDExLjAwNVpNMTYuNjU2LDExLjAwMkwxNi42NzYsMTEuMDAzTDE2LjY1NiwxMS4wMDJaTTE2LjYyMSwxMS4wMDFMMTYuNjQxLDExLjAwMkwxNi42MjEsMTEuMDAxWk0xNi41NDcsMTFMMTYuNTcsMTFMMTYuNTQ3LDExWk0xNi40NTIsMTFMMTYuNDQxLDExTDE2LjQ1MiwxMVpNMTYuNSwxMUwxNi41MzUsMTFMMTYuNSwxMVoiIHN0eWxlPSJmaWxsOnJnYig4Myw4Myw4Myk7Ii8+Cjwvc3ZnPgo=",
// };

const streetStreetViewAction = {
  title: "Open in Street View",
  id: "street-street-view",
  image:
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjRweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMjRweCIgZmlsbD0iIzAwMDAwMCI+PHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTEyLjU2IDE0LjMzYy0uMzQuMjctLjU2LjctLjU2IDEuMTdWMjFoN2MxLjEgMCAyLS45IDItMnYtNS45OGMtLjk0LS4zMy0xLjk1LS41Mi0zLS41Mi0yLjAzIDAtMy45My43LTUuNDQgMS44M3oiLz48Y2lyY2xlIGN4PSIxOCIgY3k9IjYiIHI9IjUiLz48cGF0aCBkPSJNMTEuNSA2YzAtMS4wOC4yNy0yLjEuNzQtM0g1Yy0xLjEgMC0yIC45LTIgMnYxNGMwIC41NS4yMyAxLjA1LjU5IDEuNDFsOS44Mi05LjgyQzEyLjIzIDkuNDIgMTEuNSA3LjggMTEuNSA2eiIvPjwvc3ZnPg==",
};

// const streetMenuAction = {
//   title: "Actions",
//   id: "street-menu",
//   image:
//     "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAKUlEQVQ4y2NgGK7Ag+ExEHoQr+ERw38gfERDDSQ7aTSURkNp6IQSNQEA8e0kkTrWXUQAAAAASUVORK5CYII=",
// };

const propertyOpenAction = {
  title: "Open property record",
  id: "open-property-record",
  image:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAcUlEQVR4Ae2VsQ3AIBDEPEE6dkrGy2xsAIOQhtoSOppIWPoObD0NHFZ5gA4MmYmcEZpfDANywChA3RYQec0DLi95wOXkAZfnAZc7HnD5joDLoydyeR64RL5tg9fleWBuYuQBfhNowAinZR+OTwduVjh8GbqRVAucOQEAAAAASUVORK5CYII=",
};

const propertyAddChild = {
  title: "Add child",
  id: "add-child",
  image:
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjRweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMjRweCIgZmlsbD0iIzAwMDAwMCI+PHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTEzIDdoLTJ2NEg3djJoNHY0aDJ2LTRoNHYtMmgtNFY3em0tMS01QzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0wIDE4Yy00LjQxIDAtOC0zLjU5LTgtOHMzLjU5LTggOC04IDggMy41OSA4IDgtMy41OSA4LTggOHoiLz48L3N2Zz4=",
};

const propertyAddRangeChildren = {
  title: "Add children",
  id: "add-range-children",
  image:
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjRweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMjRweCIgZmlsbD0iIzAwMDAwMCI+PHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTEzIDdoLTJ2NEg3djJoNHY0aDJ2LTRoNHYtMmgtNFY3em0tMS01QzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0wIDE4Yy00LjQxIDAtOC0zLjU5LTgtOHMzLjU5LTggOC04IDggMy41OSA4IDgtMy41OSA4LTggOHoiLz48L3N2Zz4=",
};

// const propertyRadialSearchAction = {
//   title: "Search within radius of property",
//   id: "property-radial-search",
//   image:
//     "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+Cjxzdmcgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDI0IDI0IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zOnNlcmlmPSJodHRwOi8vd3d3LnNlcmlmLmNvbS8iIHN0eWxlPSJmaWxsLXJ1bGU6ZXZlbm9kZDtjbGlwLXJ1bGU6ZXZlbm9kZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLW1pdGVybGltaXQ6MjsiPgogICAgPGc+CiAgICAgICAgPHBhdGggZD0iTTkuMDE1LDE5LjcxTDkuMDE1LDIyLjAyMUwxMi45OTksMTguNjRMOS4wMDIsMTUuNzA4TDkuMDE1LDE3LjY3QzUuODY1LDE3LjExMSA0LjAxNSwxNS43NzEgNC4wMTUsMTQuOTQxQzQuMDE1LDE0LjA5OCA1Ljk1OCwxMi43MTMgOS4yMzksMTIuMTc1QzEwLjA0NCwxMy45MTEgMTAuODQ0LDE1LjQ2NyAxMS4xMzUsMTYuMDI1QzExLjMwNiwxNi4zNTIgMTEuNjQ1LDE2LjU1OCAxMi4wMTUsMTYuNTU4QzEyLjM4NCwxNi41NTggMTIuNzI0LDE2LjM1MiAxMi44OTUsMTYuMDI1QzEzLjE4NiwxNS40NjYgMTMuOTg3LDEzLjkwOCAxNC43OTMsMTIuMTdDMTguMDc3LDEyLjcwNyAyMC4wMTUsMTQuMDk3IDIwLjAxNSwxNC45NDFDMjAuMDE1LDE1LjY3IDE4LjU1NSwxNi44MyAxNi4wMTUsMTcuNDcxTDE2LjAxNSwxOS41MjFDMTkuNTQ1LDE4Ljc1IDIyLjAxNSwxNi45OSAyMi4wMTUsMTQuOTQxQzIyLjAxNSwxMi44MTkgMTkuMzYyLDExLjAxMSAxNS42MywxMC4yODVDMTYuMzE1LDguNjY4IDE2Ljg1NCw3LjE0MSAxNi44NTQsNi4zMzlDMTYuODU0LDMuOTUxIDE0LjY4MywyLjAwOCAxMi4wMTUsMi4wMDhDOS4zNDYsMi4wMDggNy4xNzUsMy45NTEgNy4xNzUsNi4zMzlDNy4xNzUsNy4xNDEgNy43MTQsOC42NjYgOC4zOTgsMTAuMjgzQzQuNjY2LDExLjAwOSAyLjAxNSwxMi44MTkgMi4wMTUsMTQuOTQxQzIuMDE1LDE3LjE4MSA0Ljk1NSwxOS4wNzEgOS4wMTUsMTkuNzFaTTEyLjAxNSwzLjk5MkMxMy41ODksMy45OTIgMTQuODcsNS4wNDUgMTQuODcsNi4zMzlDMTQuODcsNy4xODEgMTMuNTMxLDEwLjMwNyAxMi4wMTUsMTMuMzczQzEwLjQ5OSwxMC4zMDcgOS4xNiw3LjE4MSA5LjE2LDYuMzM5QzkuMTYsNS4wNDUgMTAuNDQxLDMuOTkyIDEyLjAxNSwzLjk5MlpNMTMuNTM0LDYuODMyQzEzLjUzNCw1Ljk4NSAxMi44NDcsNS4yOTcgMTIsNS4yOTdDMTEuMTUyLDUuMjk3IDEwLjQ2NSw1Ljk4NSAxMC40NjUsNi44MzJDMTAuNDY1LDcuNjggMTEuMTUyLDguMzY3IDEyLDguMzY3QzEyLjg0Nyw4LjM2NyAxMy41MzQsNy42OCAxMy41MzQsNi44MzJaIiBzdHlsZT0iZmlsbDpyZ2IoODMsODMsODMpO2ZpbGwtcnVsZTpub256ZXJvOyIvPgogICAgPC9nPgo8L3N2Zz4K",
// };

// const propertyAddToActivityListAction = {
//   title: "Add to activity list",
//   id: "property-activity-list",
//   image:
//     "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAALklEQVQ4y2NgGAXEg/9YITU1DKQfcDiNZA347aaGBuxOwRPMJGugvR8GUsPgBwDpSF2jLlw3VAAAAABJRU5ErkJggg==",
// };

const propertyStreetViewAction = {
  title: "Open in Street View",
  id: "property-street-view",
  image:
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjRweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMjRweCIgZmlsbD0iIzAwMDAwMCI+PHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTEyLjU2IDE0LjMzYy0uMzQuMjctLjU2LjctLjU2IDEuMTdWMjFoN2MxLjEgMCAyLS45IDItMnYtNS45OGMtLjk0LS4zMy0xLjk1LS41Mi0zLS41Mi0yLjAzIDAtMy45My43LTUuNDQgMS44M3oiLz48Y2lyY2xlIGN4PSIxOCIgY3k9IjYiIHI9IjUiLz48cGF0aCBkPSJNMTEuNSA2YzAtMS4wOC4yNy0yLjEuNzQtM0g1Yy0xLjEgMC0yIC45LTIgMnYxNGMwIC41NS4yMyAxLjA1LjU5IDEuNDFsOS44Mi05LjgyQzEyLjIzIDkuNDIgMTEuNSA3LjggMTEuNSA2eiIvPjwvc3ZnPg==",
};

// const propertyMenuAction = {
//   title: "Actions",
//   id: "property-menu",
//   image:
//     "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAKUlEQVQ4y2NgGK7Ag+ExEHoQr+ERw38gfERDDSQ7aTSURkNp6IQSNQEA8e0kkTrWXUQAAAAASUVORK5CYII=",
// };

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
      value: "0, 4",
      symbol: GetESUMapSymbol(true),
      label: "Unassigned ESU, Permanently closed",
    },
    {
      value: "0, 5",
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
      value: "1, 4",
      symbol: GetStreetMapSymbol(true),
      label: "Official Designated Street Name, Permanently closed",
    },
    {
      value: "1, 5",
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
      value: "2, 4",
      symbol: GetStreetMapSymbol(true),
      label: "Street Description, Permanently closed",
    },
    {
      value: "2, 5",
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
      value: "3, 4",
      symbol: GetStreetMapSymbol(true),
      label: "Numbered Street, Permanently closed",
    },
    {
      value: "3, 5",
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
      value: "4, 4",
      symbol: GetStreetMapSymbol(true),
      label: "Unofficial Street Description, Permanently closed",
    },
    {
      value: "4, 5",
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
      value: "9, 4",
      symbol: GetStreetMapSymbol(true),
      label: "Description used for LLPG Access, Permanently closed",
    },
    {
      value: "9, 5",
      symbol: GetStreetMapSymbol(),
      label: "Description used for LLPG Access, Street for addressing purposes only",
    },
    {
      value: "-1, 1, 1",
      symbol: GetLlpgStreetMapSymbol(),
      label: "Official Designated Street Name, Under construction",
    },
    {
      value: "-1, 1, 2",
      symbol: GetLlpgStreetMapSymbol(),
      label: "Official Designated Street Name, Open",
    },
    {
      value: "-1, 1, 4",
      symbol: GetLlpgStreetMapSymbol(true),
      label: "Official Designated Street Name, Permanently closed",
    },
    {
      value: "-1, 1, 5",
      symbol: GetLlpgStreetMapSymbol(),
      label: "Official Designated Street Name, Street for addressing purposes only",
    },
    {
      value: "-1, 2, 1",
      symbol: GetLlpgStreetMapSymbol(),
      label: "Street Description, Under construction",
    },
    {
      value: "-1, 2, 2",
      symbol: GetLlpgStreetMapSymbol(),
      label: "Street Description, Open",
    },
    {
      value: "-1, 2, 4",
      symbol: GetLlpgStreetMapSymbol(true),
      label: "Street Description, Permanently closed",
    },
    {
      value: "-1, 2, 5",
      symbol: GetLlpgStreetMapSymbol(),
      label: "Street Description, Street for addressing purposes only",
    },
    {
      value: "-1, 3, 1",
      symbol: GetLlpgStreetMapSymbol(),
      label: "Numbered Street, Under construction",
    },
    {
      value: "-1, 3, 2",
      symbol: GetLlpgStreetMapSymbol(),
      label: "Numbered Street, Open",
    },
    {
      value: "-1, 3, 4",
      symbol: GetLlpgStreetMapSymbol(true),
      label: "Numbered Street, Permanently closed",
    },
    {
      value: "-1, 3, 5",
      symbol: GetLlpgStreetMapSymbol(),
      label: "Numbered Street, Street for addressing purposes only",
    },
    {
      value: "-1, 4, 1",
      symbol: GetLlpgStreetMapSymbol(),
      label: "Unofficial Street Description, Under construction",
    },
    {
      value: "-1, 4, 2",
      symbol: GetLlpgStreetMapSymbol(),
      label: "Unofficial Street Description, Open",
    },
    {
      value: "-1, 4, 4",
      symbol: GetLlpgStreetMapSymbol(true),
      label: "Unofficial Street Description, Permanently closed",
    },
    {
      value: "-1, 4, 5",
      symbol: GetLlpgStreetMapSymbol(),
      label: "Unofficial Street Description, Street for addressing purposes only",
    },
    {
      value: "-1, 9, 1",
      symbol: GetLlpgStreetMapSymbol(),
      label: "Description used for LLPG Access, Under construction",
    },
    {
      value: "-1, 9, 2",
      symbol: GetLlpgStreetMapSymbol(),
      label: "Description used for LLPG Access, Open",
    },
    {
      value: "-1, 9, 4",
      symbol: GetLlpgStreetMapSymbol(true),
      label: "Description used for LLPG Access, Permanently closed",
    },
    {
      value: "-1, 9, 5",
      symbol: GetLlpgStreetMapSymbol(),
      label: "Description used for LLPG Access, Street for addressing purposes only",
    },
  ],
};

const asd51Renderer = {
  type: "simple",
  symbol: GetASDMapSymbol(51),
};

const asd52Renderer = {
  type: "simple",
  symbol: GetASDMapSymbol(52),
};

const asd53Renderer = {
  type: "simple",
  symbol: GetASDMapSymbol(53),
};

const asd61Renderer = {
  type: "simple",
  symbol: GetASDMapSymbol(61),
};

const asd62Renderer = {
  type: "simple",
  symbol: GetASDMapSymbol(62),
};

const asd63Renderer = {
  type: "simple",
  symbol: GetASDMapSymbol(63),
};

const asd64Renderer = {
  type: "simple",
  symbol: GetASDMapSymbol(64),
};

const asd66Renderer = {
  type: "simple",
  symbol: GetASDMapSymbol(66),
};

const backgroundPropertyRenderer = {
  type: "unique-value",
  field: "DisplayLogicalStatus",
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

const propertyRenderer = {
  type: "unique-value",
  field: "SymbolCode",
  uniqueValueInfos: [
    {
      value: "1, B",
      symbol: GetPropertyMapSymbol(1, "B"),
      label: "Approved Preferred, Street BLPU",
    },
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
      value: "3, B",
      symbol: GetPropertyMapSymbol(3, "B"),
      label: "Alternative, Street BLPU",
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
      value: "5, B",
      symbol: GetPropertyMapSymbol(5, "B"),
      label: "Candidate, Street BLPU",
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
      value: "6, B",
      symbol: GetPropertyMapSymbol(6, "B"),
      label: "Provisional, Street BLPU",
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
      value: "7, B",
      symbol: GetPropertyMapSymbol(7, "B"),
      label: "Rejected (External), Street BLPU",
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
      value: "8, B",
      symbol: GetPropertyMapSymbol(8, "B"),
      label: "Historical, Street BLPU",
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
      value: "9, B",
      symbol: GetPropertyMapSymbol(9, "B"),
      label: "Rejected (Internal), Street BLPU",
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

const extentRenderer = {
  type: "unique-value",
  field: "Code",
  uniqueValueInfos: [
    {
      value: "F",
      symbol: GetExtentMapSymbol("F"),
      label: "Formal tenancy agreement.",
    },
    {
      value: "L",
      symbol: GetExtentMapSymbol("L"),
      label: "Unregistered land title.",
    },
    {
      value: "O",
      symbol: GetExtentMapSymbol("O"),
      label: "Occupancy.",
    },
    {
      value: "P",
      symbol: GetExtentMapSymbol("P"),
      label: "Inferred from physical features.",
    },
    {
      value: "R",
      symbol: GetExtentMapSymbol("R"),
      label: "Rental agreement.",
    },
    {
      value: "T",
      symbol: GetExtentMapSymbol("T"),
      label: "Registered title.",
    },
    {
      value: "U",
      symbol: GetExtentMapSymbol("U"),
      label: "Inferred from use.",
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

ADSEsriMap.propTypes = {
  startExtent: PropTypes.object,
};

function ADSEsriMap(startExtent) {
  const [loading, setLoading] = useState(true);
  const [loadingShp, setLoadingShp] = useState(false);

  const [displayLayerList, setDisplayLayerList] = useState(false);
  const [displayESUMergeTool, setDisplayESUMergeTool] = useState(false);
  const [displayExtentMergeTool, setDisplayExtentMergeTool] = useState(false);
  const [displayMeasurement, setDisplayMeasurement] = useState(false);
  const [measurementActiveTool, setMeasurementActiveTool] = useState(null);

  const baseMappingLayerIds = useRef([]);
  const baseLayersSnapEsu = useRef([]);
  const baseLayersSnapBlpu = useRef([]);
  const baseLayersSnapExtent = useRef([]);
  const baseLayersFeature = useRef([]);
  const geoJSONFeatures = useRef([]);
  const featuresDownloaded = useRef(0);
  const mapRef = useRef(null);
  const [view, setView] = useState(null);
  const viewRef = useRef(null);
  const sketchRef = useRef(null);
  const sketchUpdateEvent = useRef(null);
  const sketchDeleteEvent = useRef(null);
  const sketchCreateEvent = useRef(null);
  const layerListRef = useRef(null);
  const measurementRef = useRef(null);
  const coordinateConversionRef = useRef(null);
  const currentPointCaptureModeRef = useRef(null);
  const selectingProperties = useRef(false);
  const loadedShpFileTitles = useRef([]);
  const loadedShpFileIds = useRef([]);

  const mapContext = useContext(MapContext);
  const sandboxContext = useContext(SandboxContext);
  const streetContext = useContext(StreetContext);
  const propertyContext = useContext(PropertyContext);
  const userContext = useRef(useContext(UserContext));
  const lookupContext = useRef(useContext(LookupContext));
  const searchContext = useContext(SearchContext);
  const settingsContext = useContext(SettingsContext);
  const informationContext = useContext(InformationContext);

  const recordAttributes = useRef(null);
  const sandbox = useRef(null);
  const baseMapLayers = useRef(settingsContext.mapLayers);
  const isScottish = useRef(settingsContext.isScottish);
  const isWelsh = useRef(settingsContext.isWelsh);
  const authorityCode = useRef(settingsContext.authorityCode);

  const defaultCountryExtent = useRef(
    settingsContext.isScottish
      ? {
          xmin: -83982.94519240677,
          ymin: 530758.235875156,
          xmax: 674272.3753963439,
          ymax: 1078658.8546231566,
          spatialReference: { wkid: 27700 },
          zoomLevel: 7,
        }
      : settingsContext.isWelsh
      ? {
          xmin: 115670.57268842091,
          ymin: 139247.77699858515,
          xmax: 494798.23298279627,
          ymax: 413503.834485726,
          spatialReference: { wkid: 27700 },
          zoomLevel: 9,
        }
      : {
          xmin: 29143.856669624627,
          ymin: 72747.56239049905,
          xmax: 787399.1772583753,
          ymax: 620648.1811384995,
          spatialReference: { wkid: 27700 },
          zoomLevel: 7,
        }
  );

  // const navigate = useNavigate();
  const history = useHistory();

  const saveConfirmDialog = useSaveConfirmation();
  const [saveOpen, setSaveOpen] = useState(false);
  const saveOpenRef = useRef(false);
  const saveResult = useRef(null);
  const saveType = useRef(null);
  const failedValidation = useRef(null);
  const associatedRecords = useRef([]);

  const propertyWizardType = useRef(null);
  const propertyWizardParent = useRef(null);
  const [openPropertyWizard, setOpenPropertyWizard] = useState(false);
  const wizardUprn = useRef(null);
  const displayingWizard = useRef(false);

  const [openHistoricProperty, setOpenHistoricProperty] = useState(false);
  const historicRec = useRef(null);

  const selectedProperties = useRef([]);

  const [openUploadShpFileDialog, setOpenUploadShpFileDialog] = useState(false);

  const oldMapData = useRef({
    streets: [],
    properties: [],
    extents: [],
    backgroundStreets: [],
    unassignedEsus: [],
    backgroundProperties: [],
    editStreet: null,
    editProperty: null,
    zoomStreet: null,
    zoomProperty: null,
    mapProperty: null,
  });

  const backgroundStreetData = useRef(null);
  const unassignedEsusData = useRef(null);
  const backgroundPropertyData = useRef(null);
  const backgroundProvenanceData = useRef(null);
  const [streetData, setStreetData] = useState(null);
  const [llpgStreetData, setLlpgStreetData] = useState(null);
  const [propertyData, setPropertyData] = useState(null);
  const refStreetData = useRef(null);
  const refLlpgStreetData = useRef(null);
  const refAsd51Data = useRef(null);
  const refAsd52Data = useRef(null);
  const refAsd53Data = useRef(null);
  const refAsd61Data = useRef(null);
  const refAsd62Data = useRef(null);
  const refAsd63Data = useRef(null);
  const refAsd64Data = useRef(null);
  const refAsd66Data = useRef(null);
  const refPropertyData = useRef(null);
  const extentData = useRef(null);

  const [zoomStreetData, setZoomStreetData] = useState(null);
  const [zoomPropertyData, setZoomPropertyData] = useState(null);
  const highlightStreet = useRef(null);
  const highlightESU = useRef(null);
  const highlightBackgroundESU = useRef(null);
  const highlightUnassignedESU = useRef(null);
  const highlightASD51 = useRef(null);
  const highlightASD52 = useRef(null);
  const highlightASD53 = useRef(null);
  const highlightASD61 = useRef(null);
  const highlightASD62 = useRef(null);
  const highlightASD63 = useRef(null);
  const highlightASD64 = useRef(null);
  const highlightASD66 = useRef(null);
  const highlightProperty = useRef(null);
  const highlightSelectProperty = useRef(null);
  const highlightExtent = useRef(null);
  const editingObject = useRef(null);
  const selectedLines = useRef([]);

  const selectedEsus = useRef([]);
  const [selectedExtents, setSelectedExtents] = useState([]);
  const [selectionAnchorEl, setSelectionAnchorEl] = useState(null);
  const selectionOpen = Boolean(selectionAnchorEl);
  const selectionId = selectionOpen ? "esu-extent-selection-popper" : undefined;
  const lastSelectedEsu = useRef(null);
  const lastSelectedExtent = useRef(null);
  const lastSelectedProperty = useRef(null);

  const doubleEventWait = 500;

  const zoomGraphicsLayer = useRef(
    new GraphicsLayer({
      id: zoomGraphicsLayerName,
      title: "Zoom layer",
      listMode: "hide",
    })
  );
  const editGraphicsLayer = useRef(
    new GraphicsLayer({
      id: editGraphicsLayerName,
      title: "Edit layer",
      listMode: "hide",
    })
  );

  const backgroundStreetLayerRef = useRef(null);
  const unassignedEsusLayerRef = useRef(null);
  const backgroundProvenanceLayerRef = useRef(null);
  const backgroundPropertyLayerRef = useRef(null);

  const extentBorder = 20;
  const backgroundExtent = useRef(
    startExtent.startExtent
      ? {
          xmin: startExtent.startExtent.xmin,
          ymin: startExtent.startExtent.ymin,
          xmax: startExtent.startExtent.xmax,
          ymax: startExtent.startExtent.ymax,
          spatialReference: startExtent.startExtent.spatialReference,
        }
      : null
  );

  const unselectedLineSymbol = useRef({
    type: "simple-line",
    color: [51, 136, 255, 0.5],
    width: 1,
  });
  const selectedLineSymbol = useRef({
    type: "simple-line",
    color: [51, 136, 255, 1],
    width: 3,
  });
  const validLineSymbol = useRef({
    type: "simple-line",
    color: defaultValidColour,
    width: defaultExtraLineWidth,
    style: defaultEditStyle,
  });
  const invalidLineSymbol = useRef({
    type: "simple-line",
    color: defaultInvalidColour,
    width: defaultExtraLineWidth,
    style: defaultEditStyle,
  });
  const validPolygonSymbol = useRef({
    type: "simple-fill",
    color: defaultValidColour,
    outline: {
      color: defaultValidColour,
      width: defaultExtraLineWidth,
    },
  });
  const invalidPolygonSymbol = useRef({
    type: "simple-fill",
    color: defaultInvalidColour,
    outline: {
      color: defaultInvalidColour,
      width: defaultExtraLineWidth,
    },
  });

  /**
   * Method to format a street to title case.
   *
   * @param {string} str The street to format to title case
   * @returns {string} The formatted street.
   */
  function streetToTitleCase(str) {
    if (!str || str.length === 0) return null;

    if (str.includes(",") && !str.includes(", "))
      return str.replace(",", ", ").replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
      });
    else
      return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
      });
  }

  /**
   * Method to format an address to title case.
   *
   * @param {string} str The address to format to title case.
   * @param {string} postcode The postcode of the address.
   * @returns {string} The formatted address.
   */
  function addressToTitleCase(str, postcode) {
    function isNumeric(char) {
      return /\d/.test(char);
    }

    return !str || str.length === 0
      ? str
      : str.replace(postcode, "").replace(/\w\S*/g, function (txt) {
          if (isNumeric(txt.charAt(0))) return txt.toUpperCase();
          else return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
        }) + postcode;
  }

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
   * Method to handle merging features.
   */
  function handleMergeFeatures() {
    const mergeType = displayESUMergeTool ? "ESU" : displayExtentMergeTool ? "Extent" : "Unknown";
    const featureLayer = baseLayersFeature.current.find(
      (x) => (mergeType === "ESU" && x.layer.esuSnap) || (mergeType === "Extent" && x.layer.extentSnap)
    );
    const currentFeatureLayer = mapRef.current && mapRef.current.findLayerById(featureLayer.layer.layerId);
    const layerIndex = mapRef.current.layers.indexOf(currentFeatureLayer);
    const featureGeometries = [];

    if (currentFeatureLayer) {
      switch (mergeType) {
        case "ESU":
          for (let i = 0; i < selectedLines.current.length; i++) {
            featureGeometries.push(selectedLines.current[i].geometry);
          }

          const newEsu = geometryEngine.union(featureGeometries);
          mapContext.onSetLineGeometry(GetPolylineAsWKT(newEsu));

          selectedLines.current = [];
          setDisplayESUMergeTool(false);
          break;

        case "Extent":
          mapContext.onProvenanceMerging(true);
          editingObject.current = null;
          for (let i = 0; i < currentFeatureLayer.graphics.items.length; i++) {
            featureGeometries.push(currentFeatureLayer.graphics.items[i].geometry);
          }

          const newExtent = geometryEngine.union(featureGeometries);
          mapContext.onSetPolygonGeometry(GetPolygonAsWKT(newExtent));

          setDisplayExtentMergeTool(false);
          handleCloseSelection();
          break;

        default:
          alert(`Unknown merge type: ${mergeType}`);
          break;
      }

      const updatedLayer = new GraphicsLayer({
        id: currentFeatureLayer.id,
        copyright: currentFeatureLayer.copyright,
        title: currentFeatureLayer.title,
        listMode: currentFeatureLayer.listMode,
        maxScale: currentFeatureLayer.maxScale,
        minScale: currentFeatureLayer.minScale,
        opacity: currentFeatureLayer.opacity,
        visible: currentFeatureLayer.visible,
      });

      mapRef.current.remove(currentFeatureLayer);
      mapRef.current.add(updatedLayer, layerIndex);
    }
  }

  /**
   * Method to handle display the measurement tool.
   */
  function handleDisplayMeasurement() {
    if (!displayMeasurement) {
      setDisplayMeasurement(!displayMeasurement);
      setMeasurementActiveTool("distance");
    } else if (measurementActiveTool === "distance") setMeasurementActiveTool("area");
    else {
      setDisplayMeasurement(!displayMeasurement);
      setMeasurementActiveTool(null);
      measurementRef.current.clear();
    }
  }

  /**
   * Method used to create a new polyline graphic.
   *
   * @param {Array} graphicPaths The array of coordinates that make up the polyline.
   * @returns {object} A new polyline graphic object.
   */
  function createPolylineGraphic(graphicPaths) {
    const editPolyline = new Polyline({
      type: "polyline",
      paths: graphicPaths,
      spatialReference: { wkid: 27700 },
    });

    const editPolylineGraphic = new Graphic({
      attributes: { typeName: "LineString" },
      geometry: editPolyline,
      symbol: GetStreetMapSymbol(),
    });

    return editPolylineGraphic;
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
  function createPointGraphic(x, y, logicalStatus, classification, highlighted = false) {
    const editPoint = new Point({
      type: "point",
      x: x,
      y: y,
      spatialReference: { wkid: 27700 },
    });

    const editPointGraphic = new Graphic({
      attributes: { typeName: "Point" },
      geometry: editPoint,
      symbol: GetPropertyMapSymbol(logicalStatus, classification, highlighted),
    });

    return editPointGraphic;
  }

  /**
   * Method used to create a new point graphic that can be selected.
   *
   * @param {number} x The easting for the property.
   * @param {number} y The northing for the property.
   * @param {number} logicalStatus The logical status for the property.
   * @returns {object} The new point graphic object.
   */
  function createSelectablePointGraphic(x, y, uprn, logicalStatus) {
    const editPoint = new Point({
      type: "point",
      x: x,
      y: y,
      spatialReference: { wkid: 27700 },
    });

    const editPointGraphic = new Graphic({
      attributes: { uprn: uprn, typeName: "Point" },
      geometry: editPoint,
      symbol: GetBackgroundPropertyMapSymbol(logicalStatus),
    });

    return editPointGraphic;
  }

  /**
   * Method used to create a new polygon graphic.
   *
   * @param {Array} graphicRings The array of coordinates that make up the polygon.
   * @param {string} code The code for the polygon
   * @returns {object} The new polygon graphic object.
   */
  function createPolygonGraphic(graphicRings, code) {
    const editPolygon = new Polygon({
      type: "polygon",
      rings: graphicRings,
      spatialReference: { wkid: 27700 },
    });

    const editPolygonGraphic = new Graphic({
      attributes: { typeName: "Polygon" },
      geometry: editPolygon,
      symbol: GetExtentMapSymbol(code),
    });

    return editPolygonGraphic;
  }

  /**
   * Method used to define the actions available for the feature layers.
   *
   * @param {object} event The event object.
   */
  function defineActions(event) {
    const item = event.item;

    if (process.env.NODE_ENV === "development" && item.title === "Edit layer") {
      item.actionsSections = [
        [
          {
            title: "Display info",
            className: "esri-icon-question",
            id: "edit-layer-info",
          },
        ],
      ];
    }

    if (item.title === "Street layer") {
      item.actionsSections = [
        [
          {
            title: "Increase opacity",
            className: "esri-icon-up",
            id: "increase-street-opacity",
          },
          {
            title: "Decrease opacity",
            className: "esri-icon-down",
            id: "decrease-street-opacity",
          },
        ],
      ];
    }

    if (item.title === "Provenance layer") {
      item.actionsSections = [
        [
          {
            title: "Increase opacity",
            className: "esri-icon-up",
            id: "increase-extent-opacity",
          },
          {
            title: "Decrease opacity",
            className: "esri-icon-down",
            id: "decrease-extent-opacity",
          },
        ],
      ];
    }

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

    if (item.title === "Background Provenance layer") {
      item.actionsSections = [
        [
          {
            title: "Increase opacity",
            className: "esri-icon-up",
            id: "increase-background-provenance-opacity",
          },
          {
            title: "Decrease opacity",
            className: "esri-icon-down",
            id: "decrease-background-provenance-opacity",
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

    if (item.title === "Property layer") {
      item.actionsSections = [
        [
          {
            title: "Increase opacity",
            className: "esri-icon-up",
            id: "increase-property-opacity",
          },
          {
            title: "Decrease opacity",
            className: "esri-icon-down",
            id: "decrease-property-opacity",
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

    if (baseLayersFeature.current.find((x) => x.layer.title === item.title && x.layer.usePaging && x.layer.esuSnap)) {
      item.actionsSections = [
        [
          {
            title: "Download features",
            className: "esri-icon-download",
            id: "download-features",
          },
        ],
      ];
    }
  }

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
   * Event to handle when the property wizard dialog is finished.
   *
   * @param {object} wizardData The wizard data object.
   */
  const handlePropertyWizardDone = async (wizardData) => {
    if (wizardData && wizardData.savedProperty) {
      const isRange = Array.isArray(wizardData.savedProperty);

      if (isRange) {
        UpdateRangeAfterSave(
          wizardData.savedProperty,
          lookupContext.current,
          mapContext,
          propertyContext,
          sandboxContext,
          isWelsh.current,
          searchContext
        );
      } else {
        UpdateAfterSave(
          wizardData.savedProperty,
          lookupContext.current,
          mapContext,
          propertyContext,
          sandboxContext,
          isWelsh.current,
          searchContext
        );
      }

      // if (!isRange) navigate.goBack();
      if (!isRange) history.goBack();

      const parentData =
        isRange && wizardData.savedProperty
          ? await GetPropertyMapData(wizardData.savedProperty[0].parentUprn, userContext.current)
          : null;
      const engLpis = parentData && parentData.lpis ? parentData.lpis.filter((x) => x.language === "ENG") : null;
      const parent =
        parentData && engLpis
          ? {
              uprn: parentData.uprn,
              usrn: engLpis[0].usrn,
              easting: parentData.xcoordinate,
              northing: parentData.ycoordinate,
              address: engLpis[0].address,
              postcode: engLpis[0].postcode,
            }
          : null;

      propertyContext.onWizardDone(wizardData, isRange, parent, "map");
    } else propertyContext.onWizardDone(wizardData, false, null, "map");

    sandboxContext.resetSandbox();
    streetContext.resetStreet();
    streetContext.resetStreetErrors();
    propertyContext.resetProperty();
    propertyContext.resetPropertyErrors();
    mapContext.onEditMapObject(null, null);
  };

  /**
   * Event to handle when the property wizard dialog is closed
   */
  const handlePropertyWizardClose = () => {
    setOpenPropertyWizard(false);
    displayingWizard.current = false;
  };

  /**
   * Event to handle when the historic property dialog is closed.
   *
   * @param {string} action The action taken from the dialog
   */
  const handleHistoricPropertyClose = async (action) => {
    setOpenHistoricProperty(false);
    if (action === "continue") {
      if (historicRec.current) {
        doOpenRecord(
          historicRec.current.property,
          historicRec.current.related,
          searchContext.currentSearchData.results,
          mapContext,
          streetContext,
          propertyContext,
          userContext.current,
          isScottish.current
        );
      }
    }
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
   * Event to handle the closing of the selection box.
   */
  const handleCloseSelection = () => {
    selectedEsus.current = [];
    setSelectedExtents([]);
    setSelectionAnchorEl(null);
    mapContext.onHighlightClear();
    mapContext.onPointCapture(null);
    mapContext.onSelectPropertiesChange(false);
    informationContext.onClearInformation();
  };

  /**
   * Method to get the required alert text.
   *
   * @returns {string|null} the required alert text.
   */
  const getAlertText = () => {
    if (saveOpen && saveType.current) {
      switch (saveType.current) {
        case "intersectLine":
          return "The line intersects itself!";

        case "intersectPolygon":
          return "The polygon intersects itself!";

        case "addPropertyInvalidState":
          return "You are not allowed to create a property on a closed street.";

        case "addPropertyInvalidType":
          return "You are not allowed to create a property on this type of street.";

        case "addRangeInvalidState":
          return "You are not allowed to create properties on a closed street.";

        case "addRangeInvalidType":
          return "You are not allowed to create properties on this type of street.";

        case "streetAlreadyDividedMerged":
          return "There has already been a divide or merge on this street, please save changes before retrying.";

        case "invalidDivideEsu":
          return "Open the associated street before trying to divide this ESU.";

        case "assignEsuSameStreet":
          return "The ESU is already assigned to this street.";

        case "invalidAssignEsu":
          return "You need to open the street you want to assign this ESU to before you can proceed.";

        case "downloadedAllFeatures":
          return `All ${featuresDownloaded.current} available features have been download.`;

        case "maxSelectProperties":
          return "You have exceeded the maximum number of properties (300), reduce the size and use the add to existing option.";

        case "uploadedShpFile":
          return `${featuresDownloaded.current} has been successfully uploaded.`;

        case "uploadedShpFileError":
          return `${featuresDownloaded.current} failed to be uploaded.`;

        case "maxParentLevel":
          return "Parent is already at the maximum BLPU hierarchy level.";

        case "noPermission":
          return "You do not have permission to do this.";

        default:
          if (saveResult.current) return `The ${saveType.current} has been successfully saved.`;
          else if (failedValidation.current) return `Failed to validate the ${saveType.current} record.`;
          else return `Failed to save the ${saveType.current}.`;
      }
    }
  };

  /**
   * Method to handle saving changes to a street.
   *
   * @param {object} currentStreet The current street.
   */
  const handleSaveStreet = useCallback(
    (currentStreet) => {
      SaveStreet(
        currentStreet,
        streetContext,
        userContext,
        lookupContext.current,
        searchContext,
        mapContext,
        sandboxContext,
        isScottish.current,
        isWelsh.current
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
    },
    [mapContext, sandboxContext, searchContext, streetContext]
  );

  /**
   * Method to handle saving changes to a property.
   *
   * @param {Object} currentProperty The current property.
   * @param {Boolean} cascadeParentPaoChanges If true the child property PAO details need to be changed; otherwise they are not changed.
   */
  const handleSaveProperty = useCallback(
    (currentProperty, cascadeParentPaoChanges) => {
      SavePropertyAndUpdate(
        currentProperty,
        propertyContext.currentProperty.newProperty,
        propertyContext,
        userContext,
        lookupContext.current,
        searchContext,
        mapContext,
        sandboxContext,
        isScottish.current,
        isWelsh.current,
        cascadeParentPaoChanges
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
    },
    [mapContext, propertyContext, sandboxContext, searchContext]
  );

  /**
   * Method to check for any unsaved changes to the existing record.
   *
   * @param {object} functionAfterCheck The function to be called after we have checked for any unsaved changes.
   */
  const checkForUnsavedChanges = useCallback(
    (functionAfterCheck) => {
      if (sandbox.current.sourceStreet) {
        const streetChanged = hasStreetChanged(
          streetContext.currentStreet.newStreet,
          sandboxContext.currentSandbox,
          userContext.current && userContext.current.currentUser && userContext.current.currentUser.hasASD
        );

        if (streetChanged) {
          associatedRecords.current = GetChangedAssociatedRecords(
            "street",
            sandboxContext,
            streetContext.esuDataChanged
          );

          const streetDataRef = sandbox.current.currentStreet
            ? sandbox.current.currentStreet
            : sandbox.current.sourceStreet;

          if (associatedRecords.current.length > 0) {
            saveConfirmDialog(associatedRecords.current)
              .then((result) => {
                if (result === "save") {
                  if (streetContext.validateData()) {
                    failedValidation.current = false;
                    const currentStreetData = GetCurrentStreetData(
                      streetDataRef,
                      sandboxContext,
                      lookupContext.current,
                      isWelsh.current,
                      isScottish.current,
                      userContext.current && userContext.current.currentUser && userContext.current.currentUser.hasASD
                    );
                    handleSaveStreet(currentStreetData);
                  } else {
                    failedValidation.current = true;
                    saveResult.current = false;
                    setSaveOpen(true);
                  }
                }
                mapContext.onSetCoordinate(null);
                streetContext.onStreetModified(false);
                sandboxContext.resetSandbox("street");
                functionAfterCheck();
              })
              .catch(() => {});
          } else {
            saveConfirmDialog(true)
              .then((result) => {
                if (result === "save") {
                  handleSaveStreet(sandbox.current.currentStreet);
                }
                mapContext.onSetCoordinate(null);
                streetContext.onStreetModified(false);
                sandboxContext.resetSandbox("street");
                functionAfterCheck();
              })
              .catch(() => {});
          }
        } else {
          mapContext.onSetCoordinate(null);
          streetContext.onStreetModified(false);
          sandboxContext.resetSandbox("street");
          functionAfterCheck();
        }
      } else if (sandbox.current.sourceProperty) {
        const propertyChanged = hasPropertyChanged(
          propertyContext.currentProperty.newProperty,
          sandboxContext.currentSandbox
        );

        if (propertyChanged) {
          associatedRecords.current = GetChangedAssociatedRecords("property", sandboxContext);

          const parentPaoChanged = hasParentPaoChanged(
            propertyContext.childCount,
            sandboxContext.currentSandbox.sourceProperty,
            sandboxContext.currentSandbox.currentProperty
          );

          const propertyDataRef = sandbox.current.currentProperty
            ? sandbox.current.currentProperty
            : sandbox.current.sourceProperty;

          if (associatedRecords.current.length > 0) {
            saveConfirmDialog(associatedRecords.current, parentPaoChanged)
              .then((result) => {
                if (result === "save" || result === "saveCascade") {
                  if (propertyContext.validateData()) {
                    failedValidation.current = false;
                    const currentPropertyData = GetCurrentPropertyData(
                      propertyDataRef,
                      sandboxContext,
                      lookupContext.current,
                      isWelsh.current,
                      isScottish.current
                    );
                    handleSaveProperty(currentPropertyData, result === "saveCascade");
                    mapContext.onSetCoordinate(null);
                    propertyContext.onPropertyModified(false);
                    sandboxContext.resetSandbox("property");
                    functionAfterCheck();
                  } else {
                    failedValidation.current = true;
                    saveResult.current = false;
                    setSaveOpen(true);
                  }
                } else {
                  mapContext.onSetCoordinate(null);
                  propertyContext.onPropertyModified(false);
                  sandboxContext.resetSandbox("property");
                  functionAfterCheck();
                }
              })
              .catch(() => {});
          } else {
            saveConfirmDialog(true, parentPaoChanged)
              .then((result) => {
                if (result === "save" || result === "saveCascade") {
                  handleSaveProperty(sandbox.current.currentProperty, result === "saveCascade");
                }
                mapContext.onSetCoordinate(null);
                propertyContext.onPropertyModified(false);
                sandboxContext.resetSandbox("property");
                functionAfterCheck();
              })
              .catch(() => {});
          }
        } else {
          mapContext.onSetCoordinate(null);
          propertyContext.onPropertyModified(false);
          sandboxContext.resetSandbox("property");
          functionAfterCheck();
        }
      } else {
        mapContext.onSetCoordinate(null);
        streetContext.onStreetModified(false);
        propertyContext.onPropertyModified(false);
        sandboxContext.resetSandbox("all");
        functionAfterCheck();
      }
    },
    [
      handleSaveProperty,
      handleSaveStreet,
      mapContext,
      propertyContext,
      sandboxContext,
      saveConfirmDialog,
      streetContext,
    ]
  );

  /**
   * Method to update the property data.
   *
   * @param {number} uprn The UPRN of the property to update.
   */
  const updateMapPropertyData = useCallback(
    async (uprn) => {
      const propertyUrl = GetPropertyFromUPRNUrl(userContext.current.currentUser);

      if (propertyUrl) {
        const returnValue = await fetch(`${propertyUrl.url}/${uprn}`, {
          headers: propertyUrl.headers,
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
              switch (error.status) {
                case 401:
                  userContext.current.onExpired();
                  break;

                default:
                  if (userContext.current.currentUser.showMessages) console.error("[ERROR] Get Property data", error);
                  break;
              }
              return null;
            }
          );

        const extents = returnValue
          ? returnValue.blpuProvenances.map((rec) => ({
              pkId: rec.pkId,
              uprn: uprn,
              code: rec.provenanceCode,
              geometry: rec.wktGeometry && rec.wktGeometry !== "" ? GetWktCoordinates(rec.wktGeometry) : undefined,
            }))
          : undefined;

        const findProperty = mapContext.currentSearchData.properties.find((x) => x.uprn.toString() === uprn.toString());

        if (!findProperty && returnValue) {
          const engLpi = returnValue.lpis.find(
            (x) => x.language === "ENG" && x.logicalStatus === returnValue.logicalStatus
          );

          const newProperty = [
            {
              uprn: uprn,
              parentUprn: returnValue.parentUprn,
              address: engLpi.address,
              postcode: engLpi.postcode,
              easting: returnValue.xcoordinate,
              northing: returnValue.ycoordinate,
              logicalStatus: returnValue.logicalStatus,
              classificationCode: getClassificationCode(returnValue),
            },
          ];

          const currentSearchProperties = mergeArrays(
            mapContext.currentSearchData.properties,
            newProperty,
            (a, b) => a.uprn === b.uprn
          );

          mapContext.onSearchDataChange(
            mapContext.currentSearchData.streets,
            mapContext.currentSearchData.llpgStreets,
            currentSearchProperties,
            null,
            uprn
          );
        } else {
          mapContext.onSearchDataChange(
            mapContext.currentSearchData.streets,
            mapContext.currentSearchData.llpgStreets,
            mapContext.currentSearchData.properties,
            null,
            uprn
          );
        }
        mapContext.onMapChange(extents, null, null);
        mapContext.onEditMapObject(21, uprn);
      }
    },
    [mapContext]
  );

  /**
   * Method to handle opening a street from the feature dialog.
   */
  const handleOpenStreet = useCallback(async () => {
    if (recordAttributes.current) {
      propertyContext.onPropertyChange(0, 0, null, null, null, null, null, false, null);

      streetContext.onStreetChange(recordAttributes.current.USRN, recordAttributes.current.Description, false);

      if (userContext.current.currentUser.hasStreet) {
        const foundStreet = mapContext.currentSearchData.streets.find(
          (x) => x.usrn.toString() === recordAttributes.current.USRN.toString()
        );

        if (!foundStreet) {
          const streetData = await GetStreetMapData(
            Number(recordAttributes.current.USRN),
            userContext.current,
            isScottish.current
          );

          if (streetData) {
            const engDescriptor = streetData.streetDescriptors.find((x) => x.language === "ENG");

            const townRec = lookupContext.current.currentLookups.towns.find((x) => x.townRef === engDescriptor.townRef);
            const localityRec = lookupContext.current.currentLookups.localities.find(
              (x) => x.localityRef === engDescriptor.locRef
            );

            const newSearchStreet = [
              {
                usrn: streetData.usrn,
                description: engDescriptor.streetDescriptor,
                language: "ENG",
                locality: localityRec ? localityRec.locality : engDescriptor.locality,
                town: townRec ? townRec.town : engDescriptor.town,
                state: !isScottish ? streetData.state : undefined,
                type: streetData.recordType,
                esus:
                  streetData && streetData.esus
                    ? streetData.esus
                        .filter((esu) => esu.changeType !== "D")
                        .map((esu) => ({
                          esuId: esu.esuId,
                          state: isScottish ? esu.state : undefined,
                          geometry:
                            esu.wktGeometry && esu.wktGeometry !== "" ? GetWktCoordinates(esu.wktGeometry) : undefined,
                        }))
                    : [],
                asdType51:
                  isScottish.current && streetData.maintenanceResponsibilities
                    ? streetData.maintenanceResponsibilities
                        .filter((asdRec) => asdRec.changeType !== "D")
                        .map((asdRec) => ({
                          type: 51,
                          pkId: asdRec.pkId,
                          usrn: asdRec.usrn,
                          streetStatus: asdRec.streetStatus,
                          custodianCode: asdRec.custodianCode,
                          maintainingAuthorityCode: asdRec.maintainingAuthorityCode,
                          wholeRoad: asdRec.wholeRoad,
                          geometry:
                            asdRec.wktGeometry && asdRec.wktGeometry !== ""
                              ? GetWktCoordinates(asdRec.wktGeometry)
                              : undefined,
                        }))
                    : [],
                asdType52:
                  isScottish.current && streetData.reinstatementCategories
                    ? streetData.reinstatementCategories
                        .filter((asdRec) => asdRec.changeType !== "D")
                        .map((asdRec) => ({
                          type: 52,
                          pkId: asdRec.pkId,
                          usrn: asdRec.usrn,
                          reinstatementCategoryCode: asdRec.reinstatementCategoryCode,
                          custodianCode: asdRec.custodianCode,
                          reinstatementAuthorityCode: asdRec.reinstatementAuthorityCode,
                          wholeRoad: asdRec.wholeRoad,
                          geometry:
                            asdRec.wktGeometry && asdRec.wktGeometry !== ""
                              ? GetWktCoordinates(asdRec.wktGeometry)
                              : undefined,
                        }))
                    : [],
                asdType53:
                  isScottish.current && streetData.specialDesignations
                    ? streetData.specialDesignations
                        .filter((asdRec) => asdRec.changeType !== "D")
                        .map((asdRec) => ({
                          type: 53,
                          pkId: asdRec.pkId,
                          usrn: asdRec.usrn,
                          specialDesignationCode: asdRec.specialDesignationCode,
                          custodianCode: asdRec.custodianCode,
                          authorityCode: asdRec.authorityCode,
                          wholeRoad: asdRec.wholeRoad,
                          geometry:
                            asdRec.wktGeometry && asdRec.wktGeometry !== ""
                              ? GetWktCoordinates(asdRec.wktGeometry)
                              : undefined,
                        }))
                    : [],
                asdType61:
                  !isScottish.current && userContext.current.currentUser.hasASD && streetData.interests
                    ? streetData.interests
                        .filter((asdRec) => asdRec.changeType !== "D")
                        .map((asdRec) => ({
                          type: 61,
                          pkId: asdRec.pkId,
                          usrn: asdRec.usrn,
                          streetStatus: asdRec.streetStatus,
                          interestType: asdRec.interestType,
                          districtRefAuthority: asdRec.districtRefAuthority,
                          swaOrgRefAuthority: asdRec.swaOrgRefAuthority,
                          wholeRoad: asdRec.wholeRoad,
                          geometry:
                            asdRec.wktGeometry && asdRec.wktGeometry !== ""
                              ? GetWktCoordinates(asdRec.wktGeometry)
                              : undefined,
                        }))
                    : [],
                asdType62:
                  !isScottish.current && userContext.current.currentUser.hasASD && streetData.constructions
                    ? streetData.constructions
                        .filter((asdRec) => asdRec.changeType !== "D")
                        .map((asdRec) => ({
                          type: 62,
                          pkId: asdRec.pkId,
                          usrn: asdRec.usrn,
                          constructionType: asdRec.constructionType,
                          reinstatementTypeCode: asdRec.reinstatementTypeCode,
                          swaOrgRefConsultant: asdRec.swaOrgRefConsultant,
                          districtRefConsultant: asdRec.districtRefConsultant,
                          wholeRoad: asdRec.wholeRoad,
                          geometry:
                            asdRec.wktGeometry && asdRec.wktGeometry !== ""
                              ? GetWktCoordinates(asdRec.wktGeometry)
                              : undefined,
                        }))
                    : [],
                asdType63:
                  !isScottish.current && userContext.current.currentUser.hasASD && streetData.specialDesignations
                    ? streetData.specialDesignations
                        .filter((asdRec) => asdRec.changeType !== "D")
                        .map((asdRec) => ({
                          type: 63,
                          pkId: asdRec.pkId,
                          usrn: asdRec.usrn,
                          streetSpecialDesigCode: asdRec.streetSpecialDesigCode,
                          swaOrgRefConsultant: asdRec.swaOrgRefConsultant,
                          districtRefConsultant: asdRec.districtRefConsultant,
                          wholeRoad: asdRec.wholeRoad,
                          geometry:
                            asdRec.wktGeometry && asdRec.wktGeometry !== ""
                              ? GetWktCoordinates(asdRec.wktGeometry)
                              : undefined,
                        }))
                    : [],
                asdType64:
                  !isScottish.current && userContext.current.currentUser.hasASD && streetData.heightWidthWeights
                    ? streetData.heightWidthWeights
                        .filter((asdRec) => asdRec.changeType !== "D")
                        .map((asdRec) => ({
                          type: 64,
                          pkId: asdRec.pkId,
                          usrn: asdRec.usrn,
                          hwwRestrictionCode: asdRec.hwwRestrictionCode,
                          swaOrgRefConsultant: asdRec.swaOrgRefConsultant,
                          districtRefConsultant: asdRec.districtRefConsultant,
                          wholeRoad: asdRec.wholeRoad,
                          geometry:
                            asdRec.wktGeometry && asdRec.wktGeometry !== ""
                              ? GetWktCoordinates(asdRec.wktGeometry)
                              : undefined,
                        }))
                    : [],
                asdType66:
                  !isScottish.current && userContext.current.currentUser.hasASD && streetData.publicRightOfWays
                    ? streetData.publicRightOfWays
                        .filter((asdRec) => asdRec.changeType !== "D")
                        .map((asdRec) => ({
                          type: 66,
                          pkId: asdRec.pkId,
                          prowUsrn: asdRec.prowUsrn,
                          prowRights: asdRec.prowRights,
                          prowStatus: asdRec.prowStatus,
                          prowOrgRefConsultant: asdRec.prowOrgRefConsultant,
                          prowDistrictRefConsultant: asdRec.prowDistrictRefConsultant,
                          defMapGeometryType: asdRec.defMapGeometryType,
                          geometry:
                            asdRec.wktGeometry && asdRec.wktGeometry !== ""
                              ? GetWktCoordinates(asdRec.wktGeometry)
                              : undefined,
                        }))
                    : [],
              },
            ];

            const currentSearchStreets = mergeArrays(
              mapContext.currentSearchData.streets,
              newSearchStreet,
              (a, b) => a.usrn === b.usrn
            );

            mapContext.onSearchDataChange(
              currentSearchStreets,
              mapContext.currentSearchData.llpgStreets,
              mapContext.currentSearchData.properties,
              recordAttributes.current.USRN,
              null
            );
          }
        } else {
          mapContext.onSearchDataChange(
            mapContext.currentSearchData.streets,
            mapContext.currentSearchData.llpgStreets,
            mapContext.currentSearchData.properties,
            recordAttributes.current.USRN,
            null
          );
        }
      } else {
        const foundLlpgStreet = mapContext.currentSearchData.llpgStreets.find(
          (x) => x.usrn.toString() === recordAttributes.current.USRN.toString()
        );

        if (!foundLlpgStreet) {
          const llpgStreetData = await GetStreetMapData(
            Number(recordAttributes.current.USRN),
            userContext.current,
            isScottish.current
          );

          if (llpgStreetData) {
            const engDescriptor = llpgStreetData.streetDescriptors.find((x) => x.language === "ENG");

            const townRec = lookupContext.current.currentLookups.towns.find((x) => x.townRef === engDescriptor.townRef);
            const localityRec = lookupContext.current.currentLookups.localities.find(
              (x) => x.localityRef === engDescriptor.locRef
            );

            const newSearchLlpgStreet = [
              {
                usrn: llpgStreetData.usrn,
                description: engDescriptor.streetDescriptor,
                language: "ENG",
                locality: localityRec ? localityRec.locality : engDescriptor.locality,
                town: townRec ? townRec.town : engDescriptor.town,
                state: !isScottish ? llpgStreetData.state : undefined,
                type: llpgStreetData.recordType,
                esus: llpgStreetData
                  ? [
                      {
                        esuId: -1,
                        state: undefined,
                        geometry: GetWktCoordinates(
                          `LINESTRING (${llpgStreetData.streetStartX} ${llpgStreetData.streetStartY}, ${llpgStreetData.streetEndX} ${llpgStreetData.streetEndY})`
                        ),
                      },
                    ]
                  : [],
                asdType51: [],
                asdType52: [],
                asdType53: [],
                asdType61: [],
                asdType62: [],
                asdType63: [],
                asdType64: [],
                asdType66: [],
              },
            ];

            const currentSearchLlpgStreets = mergeArrays(
              mapContext.currentSearchData.llpgStreets,
              newSearchLlpgStreet,
              (a, b) => a.usrn === b.usrn
            );

            mapContext.onSearchDataChange(
              mapContext.currentSearchData.streets,
              currentSearchLlpgStreets,
              mapContext.currentSearchData.properties,
              recordAttributes.current.USRN,
              null
            );
          }
        } else {
          mapContext.onSearchDataChange(
            mapContext.currentSearchData.streets,
            mapContext.currentSearchData.llpgStreets,
            mapContext.currentSearchData.properties,
            recordAttributes.current.USRN,
            null
          );
        }
      }

      mapContext.onMapChange([], null, null);

      mapContext.onSetCoordinate(null);
      streetContext.onStreetModified(false);
      sandboxContext.resetSandbox("street");
    }
  }, [mapContext, sandboxContext, propertyContext, streetContext]);

  /**
   * Method to handle displaying a maintenance responsibility record from the feature dialog (OneScotland only).
   */
  const handleOpenASD51 = useCallback(() => {
    if (recordAttributes.current) {
      streetContext.onGoToField(51, recordAttributes.current.ObjectId - 1, null, "StreetStatus");
    }
  }, [streetContext]);

  /**
   * Method to handle displaying a reinstatement category record from the feature dialog (OneScotland only).
   */
  const handleOpenASD52 = useCallback(() => {
    if (recordAttributes.current) {
      streetContext.onGoToField(52, recordAttributes.current.ObjectId - 1, null, "ReinstatementCategory");
    }
  }, [streetContext]);

  /**
   * Method to handle displaying a special designation record from the feature dialog (OneScotland only).
   */
  const handleOpenASD53 = useCallback(() => {
    if (recordAttributes.current) {
      streetContext.onGoToField(53, recordAttributes.current.ObjectId - 1, null, "StreetSpecialDesigCode");
    }
  }, [streetContext]);

  /**
   * Method to handle displaying an interest record from the feature dialog (GeoPlace only).
   */
  const handleOpenASD61 = useCallback(() => {
    if (recordAttributes.current) {
      streetContext.onGoToField(61, recordAttributes.current.ObjectId - 1, null, "StreetStatus");
    }
  }, [streetContext]);

  /**
   * Method to handle displaying a construction record from the feature dialog (GeoPlace only).
   */
  const handleOpenASD62 = useCallback(() => {
    if (recordAttributes.current) {
      streetContext.onGoToField(62, recordAttributes.current.ObjectId - 1, null, "ConstructionType");
    }
  }, [streetContext]);

  /**
   * Method to handle displaying a special designation record from the feature dialog (GeoPlace only).
   */
  const handleOpenASD63 = useCallback(() => {
    if (recordAttributes.current) {
      streetContext.onGoToField(63, recordAttributes.current.ObjectId - 1, null, "StreetSpecialDesigCode");
    }
  }, [streetContext]);

  /**
   * Method to handle displaying a height, width & weight restriction record from the feature dialog (GeoPlace only).
   */
  const handleOpenASD64 = useCallback(() => {
    if (recordAttributes.current) {
      streetContext.onGoToField(64, recordAttributes.current.ObjectId - 1, null, "HwwRestrictionCode");
    }
  }, [streetContext]);

  /**
   * Method to handle displaying a public right of way record from the feature dialog (GeoPlace only).
   */
  const handleOpenASD66 = useCallback(() => {
    if (recordAttributes.current) {
      streetContext.onGoToField(66, recordAttributes.current.ObjectId - 1, null, "ProwRights");
    }
  }, [streetContext]);

  /**
   * Method to handle adding a single property to a street from the feature dialog.
   */
  const handleAddProperty = useCallback(async () => {
    if (recordAttributes.current && !displayingWizard.current) {
      if ([1, 2, 9].includes(recordAttributes.current.Type) && recordAttributes.current.State !== 4) {
        displayingWizard.current = true;
        saveOpenRef.current = false;
        setSaveOpen(false);

        const rec = {
          address: recordAttributes.current.Description,
          usrn: Number(recordAttributes.current.USRN),
        };
        propertyContext.resetPropertyErrors();
        propertyContext.onWizardDone(null, false, null, null);
        mapContext.onWizardSetCoordinate(null);
        propertyWizardType.current = "property";
        propertyWizardParent.current = rec;
        setOpenPropertyWizard(true);
      } else {
        saveResult.current = false;
        saveType.current = recordAttributes.current.State === 4 ? "addPropertyInvalidState" : "addPropertyInvalidType";
        saveOpenRef.current = true;
        setSaveOpen(true);
      }
    }
  }, [mapContext, propertyContext]);

  /**
   * Method to handle adding a range of properties to a street from the feature dialog.
   */
  const handleAddRange = useCallback(async () => {
    if (recordAttributes.current && !displayingWizard.current) {
      if ([1, 2, 9].includes(recordAttributes.current.Type) && recordAttributes.current.State !== 4) {
        displayingWizard.current = true;
        saveOpenRef.current = false;
        setSaveOpen(false);

        const rec = {
          address: recordAttributes.current.Description,
          usrn: Number(recordAttributes.current.USRN),
        };
        propertyContext.resetPropertyErrors();
        propertyContext.onWizardDone(null, false, null, null);
        mapContext.onWizardSetCoordinate(null);
        propertyWizardType.current = "range";
        propertyWizardParent.current = rec;
        setOpenPropertyWizard(true);
      } else {
        saveResult.current = false;
        saveType.current = recordAttributes.current.State === 4 ? "addRangeInvalidState" : "addRangeInvalidType";
        saveOpenRef.current = true;
        setSaveOpen(true);
      }
    }
  }, [mapContext, propertyContext]);

  /**
   * Method to handle dividing an ESU from the feature dialog.
   */
  const handleDivideEsu = useCallback(() => {
    if (streetContext.esuDividedMerged) {
      saveResult.current = false;
      saveType.current = "streetAlreadyDividedMerged";
      saveOpenRef.current = true;
      setSaveOpen(true);
    } else if (
      recordAttributes.current &&
      streetContext.currentStreet &&
      Number(recordAttributes.current.USRN) === streetContext.currentStreet.usrn
    ) {
      mapContext.onDivideEsu(Number(recordAttributes.current.EsuId));
    } else {
      saveResult.current = false;
      saveType.current = "invalidDivideEsu";
      saveOpenRef.current = true;
      setSaveOpen(true);
    }
  }, [mapContext, streetContext.currentStreet, streetContext.esuDividedMerged]);

  /**
   * Method to handle assigning an ESU from the feature dialog.
   */
  const handleAssignEsu = useCallback(() => {
    if (
      recordAttributes.current &&
      streetContext.currentStreet &&
      (streetContext.currentStreet.usrn > 0 || streetContext.currentStreet.newStreet)
    ) {
      if (Number(recordAttributes.current.USRN) === streetContext.currentStreet.usrn) {
        saveResult.current = false;
        saveType.current = "assignEsuSameStreet";
        saveOpenRef.current = true;
        setSaveOpen(true);
      } else streetContext.onAssignEsu(Number(recordAttributes.current.EsuId));
    } else {
      saveResult.current = false;
      saveType.current = "invalidAssignEsu";
      saveOpenRef.current = true;
      setSaveOpen(true);
    }
  }, [streetContext]);

  /**
   * Display the street in Google Street View.
   */
  const handleStreetStreetView = useCallback(() => {
    if (recordAttributes.current && recordAttributes.current.USRN) {
      DisplayStreetInStreetView(Number(recordAttributes.current.USRN), userContext.current, isScottish.current);
    }
  }, []);

  /**
   * Method to handle opening a property from the feature dialog.
   */
  const handleOpenProperty = useCallback(() => {
    if (recordAttributes.current) {
      if (recordAttributes.current.LogicalStatus === 8) {
        const historicProperty = {
          type: 24,
          uprn: recordAttributes.current.UPRN,
          address: recordAttributes.current.Address,
          formattedAddress: recordAttributes.current.FormattedAddress,
          postcode: recordAttributes.current.Postcode,
          easting: recordAttributes.current.Easting,
          northing: recordAttributes.current.Northing,
          logical_status: recordAttributes.current.LogicalStatus,
          classification_code: recordAttributes.current.Classification,
        };
        historicRec.current = { property: historicProperty, related: null };
        setOpenHistoricProperty(true);
      } else {
        streetContext.onStreetChange(0, "", false);

        propertyContext.onPropertyChange(
          recordAttributes.current.UPRN,
          0,
          recordAttributes.current.Address,
          recordAttributes.current.FormattedAddress,
          recordAttributes.current.Postcode,
          recordAttributes.current.Easting,
          recordAttributes.current.Northing,
          false,
          null
        );

        updateMapPropertyData(recordAttributes.current.UPRN);

        mapContext.onSetCoordinate(null);
        propertyContext.onPropertyModified(false);
        sandboxContext.resetSandbox("property");
      }
    }
  }, [updateMapPropertyData, mapContext, propertyContext, sandboxContext, streetContext]);

  /**
   * Method to handle adding a single child to a property from the feature dialog.
   */
  const handleAddChild = useCallback(async () => {
    if (recordAttributes.current && !displayingWizard.current) {
      if (userContext.current.currentUser.editProperty) {
        GetParentHierarchy(Number(recordAttributes.current.UPRN), userContext.current).then((parentProperties) => {
          if (!parentProperties || parentProperties.parent.currentParentChildLevel < 4) {
            displayingWizard.current = true;
            const rec = {
              address: recordAttributes.current.Address,
              easting: Number(recordAttributes.current.Easting),
              northing: Number(recordAttributes.current.Northing),
              postcode: recordAttributes.current.Postcode,
              uprn: Number(recordAttributes.current.UPRN),
            };
            propertyContext.resetPropertyErrors();
            propertyContext.onWizardDone(null, false, null, null);
            mapContext.onWizardSetCoordinate(null);
            propertyWizardType.current = "child";
            propertyWizardParent.current = rec;
            setOpenPropertyWizard(true);
          } else {
            saveResult.current = false;
            saveType.current = "maxParentLevel";
            saveOpenRef.current = true;
            setSaveOpen(true);
          }
        });
      } else {
        saveResult.current = false;
        saveType.current = "noPermission";
        saveOpenRef.current = true;
        setSaveOpen(true);
      }
    }
  }, [mapContext, propertyContext]);

  /**
   * Method to handle adding a range of children to a property from the feature dialog.
   */
  const handleAddChildren = useCallback(async () => {
    if (recordAttributes.current && !displayingWizard.current) {
      if (userContext.current.currentUser.editProperty) {
        GetParentHierarchy(Number(recordAttributes.current.UPRN), userContext.current).then((parentProperties) => {
          if (!parentProperties || parentProperties.parent.currentParentChildLevel < 4) {
            displayingWizard.current = true;
            const rec = {
              address: recordAttributes.current.Address,
              easting: Number(recordAttributes.current.Easting),
              northing: Number(recordAttributes.current.Northing),
              postcode: recordAttributes.current.Postcode,
              uprn: Number(recordAttributes.current.UPRN),
            };
            propertyContext.resetPropertyErrors();
            propertyContext.onWizardDone(null, false, null, null);
            mapContext.onWizardSetCoordinate(null);
            propertyWizardType.current = "rangeChildren";
            propertyWizardParent.current = rec;
            setOpenPropertyWizard(true);
          } else {
            saveResult.current = false;
            saveType.current = "maxParentLevel";
            saveOpenRef.current = true;
            setSaveOpen(true);
          }
        });
      } else {
        saveResult.current = false;
        saveType.current = "noPermission";
        saveOpenRef.current = true;
        setSaveOpen(true);
      }
    }
  }, [mapContext, propertyContext]);

  /**
   * Display the property in Google Street View.
   */
  const handlePropertyStreetView = useCallback(() => {
    if (recordAttributes.current) {
      if (recordAttributes.current.Easting && recordAttributes.current.Northing) {
        openInStreetView([Number(recordAttributes.current.Easting), Number(recordAttributes.current.Northing)]);
      }
    }
  }, []);

  const getAuthorityExtent = () => {
    if (authorityCode.current) {
      const authorityRec = DETRCodes.find((x) => x.id === authorityCode.current);

      if (authorityRec && authorityRec.xmin) {
        return {
          xmin: authorityRec.xmin,
          ymin: authorityRec.ymin,
          xmax: authorityRec.xmax,
          ymax: authorityRec.ymax,
          spatialReference: { wkid: 27700 },
          zoomLevel: authorityRec.zoomLevel,
        };
      } else return defaultCountryExtent.current;
    } else return defaultCountryExtent.current;
  };

  const fadeVisibilityOn = useCallback(
    (layer) => {
      let animating = true;
      let opacity = 0;
      // fade layer's opacity from 0 to
      // whichever value the user has configured
      const finalOpacity = layer.opacity;
      layer.opacity = opacity;

      if (view) {
        view
          .whenLayerView(layer)
          .then((layerView) => {
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
          })
          .catch((error) => {
            if (error && userContext.current.currentUser.showMessages) {
              console.error("Error fading layer visibility", error);
            }
          });
      }
    },
    [view]
  );

  // Base mapping
  useEffect(() => {
    if (viewRef.current) return;

    const loadBaseMapLayers = () => {
      baseMapLayers.current
        .sort((a, b) => a.layerPosition - b.layerPosition)
        .forEach((baseLayer) => {
          if (baseLayer.visible) {
            newBaseLayer = null;

            switch (baseLayer.layerType) {
              case 1: // WFS
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

                  case "viaEuropa":
                    alert("Code to handle viaEuropa WMS layers has not been written yet.");
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
        extent: backgroundExtent.current ? backgroundExtent.current : getAuthorityExtent(),
        constraints: {
          minZoom: 2,
          maxZoom: 21,
          rotationEnabled: false,
          lods: TileInfo.create({ spatialReference: { wkid: 27700 } }).lods,
        },
        highlightOptions: {
          color: [217, 0, 182, 255],
          fillOpacity: 0.25,
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
        visibleElements: {
          createTools: {
            rectangle: false,
            circle: false,
          },
        },
        visible: false,
      });

      const baseMeasurement = new Measurement({
        id: "ADSMeasurement",
        view: baseView,
        activeTool: null,
        visible: false,
      });

      const baseLayerList = new LayerList({
        id: "ADSLayerList",
        view: baseView,
        label: "Current layers",
        visible: false,
        listItemCreatedFunction: defineActions,
      });

      baseView.ui.remove("zoom"); // Remove default zoom widget first

      baseView.ui.add(baseSketch, "top-right");
      baseView.ui.add(["ads-buttons", baseLayerList, baseMeasurement, scaleBar], "bottom-left");
      baseView.ui.add(baseCoordinateConversion, "bottom-right");

      baseSketch.activeTool = null;

      // Uncomment below if need to know what layers are being added, moved and removed from the map
      // baseMap.layers.on("change", function (event) {
      //   const copiedEvent = JSON.parse(JSON.stringify(event));
      //   if (userContext.current.currentUser.showMessages)
      //     console.log("[DEBUG] layers changed", {
      //       added: copiedEvent.added,
      //       moved: copiedEvent.moved,
      //       removed: copiedEvent.removed,
      //     });
      // });

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
      measurementRef.current = baseMeasurement;
      coordinateConversionRef.current = baseCoordinateConversion;
    };

    const baseLayers = [];
    const baseLayerIds = [];
    const snapEsu = [];
    const snapBlpu = [];
    const snapExtent = [];
    const featureLayer = [];
    let newBaseLayer;

    if (!baseMapLayers.current) {
      getBaseMapLayers(userContext.current).then((result) => {
        baseMapLayers.current = result;
        loadBaseMapLayers();
      });
    } else {
      loadBaseMapLayers();
    }

    // destroy the map view
    return () => {
      coordinateConversionRef.current && coordinateConversionRef.current.destroy();
      sketchRef.current && sketchRef.current.destroy();
      layerListRef.current && layerListRef.current.destroy();
      viewRef.current && viewRef.current.destroy();
      mapRef.current && mapRef.current.destroy();
      newBaseLayer && newBaseLayer.destroy();
    };
  }, []);

  // Extent change
  useEffect(() => {
    if (mapContext.currentExtent && backgroundExtent.current !== mapContext.currentExtent) {
      backgroundExtent.current = mapContext.currentExtent;
    }
  }, [mapContext.currentExtent]);

  // Measurement tool
  useEffect(() => {
    if (!measurementRef.current) return;

    measurementRef.current.visible = displayMeasurement;
    measurementRef.current.activeTool = measurementActiveTool;
    if (!displayMeasurement) measurementRef.current.clear();
  }, [displayMeasurement, measurementActiveTool]);

  // Layer list tool
  useEffect(() => {
    if (!layerListRef.current) return;

    layerListRef.current.visible = displayLayerList;
  }, [displayLayerList]);

  // Background streets Layer
  useEffect(() => {
    const haveStreets =
      mapContext.currentBackgroundData &&
      mapContext.currentBackgroundData.streets &&
      mapContext.currentBackgroundData.streets.length > 0;

    let oldAndNewSame = haveStreets
      ? ArraysEqual(oldMapData.current.backgroundStreets, mapContext.currentBackgroundData.streets)
      : false;

    if (oldAndNewSame) {
      oldAndNewSame =
        (mapContext.currentSearchData.editStreet === null && oldMapData.current.editStreet === null) ||
        (!!mapContext.currentSearchData.editStreet &&
          !!oldMapData.current.editStreet &&
          mapContext.currentSearchData.editStreet === oldMapData.current.editStreet);
    }

    if (oldAndNewSame) {
      oldAndNewSame =
        (mapContext.currentLayers.zoomStreet === null && oldMapData.current.zoomStreet === null) ||
        (!!mapContext.currentLayers.zoomStreet &&
          !!oldMapData.current.zoomStreet &&
          mapContext.currentLayers.zoomStreet === oldMapData.current.zoomStreet);
    }

    if (!mapRef.current || !mapRef.current.layers || !haveStreets || oldAndNewSame) return;

    oldMapData.current = {
      streets: oldMapData.current.streets,
      llpgStreets: oldMapData.current.llpgStreets,
      properties: oldMapData.current.properties,
      extents: oldMapData.current.extents,
      backgroundStreets: mapContext.currentBackgroundData.streets,
      unassignedEsus: oldMapData.current.unassignedEsus,
      backgroundProperties: oldMapData.current.backgroundProperties,
      backgroundProvenances: oldMapData.current.backgroundProvenances,
      editStreet: oldMapData.current.editStreet,
      editProperty: oldMapData.current.editProperty,
      zoomStreet: oldMapData.current.zoomStreet,
      zoomProperty: oldMapData.current.zoomProperty,
      mapProperty: oldMapData.current.mapProperty,
    };

    if (haveStreets) {
      if (streetData && zoomStreetData)
        backgroundStreetData.current = mapContext.currentBackgroundData.streets.filter(
          (x) =>
            streetData.findIndex((i) => i.usrn.toString() === x.usrn.toString()) === -1 &&
            zoomStreetData.findIndex((i) => i.usrn.toString() === x.usrn.toString()) === -1
        );
      else if (streetData)
        backgroundStreetData.current = mapContext.currentBackgroundData.streets.filter(
          (x) => streetData.findIndex((i) => i.usrn.toString() === x.usrn.toString()) === -1
        );
      else if (llpgStreetData && zoomStreetData)
        backgroundStreetData.current = mapContext.currentBackgroundData.streets.filter(
          (x) =>
            llpgStreetData.findIndex((i) => i.usrn.toString() === x.usrn.toString()) === -1 &&
            zoomStreetData.findIndex((i) => i.usrn.toString() === x.usrn.toString()) === -1
        );
      else if (llpgStreetData)
        backgroundStreetData.current = mapContext.currentBackgroundData.streets.filter(
          (x) => llpgStreetData.findIndex((i) => i.usrn.toString() === x.usrn.toString()) === -1
        );
      else if (zoomStreetData)
        backgroundStreetData.current = mapContext.currentBackgroundData.streets.filter(
          (x) => zoomStreetData.findIndex((i) => i.usrn.toString() === x.usrn.toString()) === -1
        );
      else backgroundStreetData.current = mapContext.currentBackgroundData.streets;
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
          StateLabel: GetStreetStateLabel(rec.state, false),
          TypeLabel: GetStreetTypeLabel(rec.type ? rec.type : 1, isScottish.current, false),
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
        actions: [streetOpenAction, streetStreetViewAction],
      },
      renderer: streetRenderer,
      opacity: 0.4,
      spatialReference: { wkid: 27700 },
      title: "Background Street layer",
    });

    if (userContext.current && userContext.current.currentUser.editProperty && backgroundStreetLayer) {
      backgroundStreetLayer.popupTemplate.actions = [
        streetOpenAction,
        streetAddProperty,
        streetAddRangeProperties,
        streetStreetViewAction,
      ];
    }

    mapRef.current.remove(mapRef.current.findLayerById(backgroundStreetLayerName));

    if (backgroundStreetData && backgroundStreetData.current && backgroundStreetData.current.length > 0) {
      mapRef.current.add(backgroundStreetLayer);

      if (mapContext.layerVisibility) backgroundStreetLayer.visible = mapContext.layerVisibility.backgroundStreets;
    }

    backgroundStreetLayer.watch("visible", (visible) => {
      mapContext.onLayerVisibilityChange("backgroundStreets", visible);
      if (visible) {
        fadeVisibilityOn(backgroundStreetLayer);
      }
    });

    backgroundStreetLayerRef.current = backgroundStreetLayer;
  }, [mapContext, streetData, llpgStreetData, zoomStreetData, fadeVisibilityOn]);

  // Unassigned ESUs layer
  useEffect(() => {
    const haveEsus =
      mapContext.currentBackgroundData &&
      mapContext.currentBackgroundData.unassignedEsus &&
      mapContext.currentBackgroundData.unassignedEsus.length > 0;

    const oldAndNewSame = haveEsus
      ? ArraysEqual(oldMapData.current.unassignedEsus, mapContext.currentBackgroundData.unassignedEsus)
      : false;

    if (!mapRef.current || !mapRef.current.layers || !haveEsus || oldAndNewSame) return;

    oldMapData.current = {
      streets: oldMapData.current.streets,
      llpgStreets: oldMapData.current.llpgStreets,
      properties: oldMapData.current.properties,
      extents: oldMapData.current.extents,
      backgroundStreets: oldMapData.current.streets,
      unassignedEsus: mapContext.currentBackgroundData.unassignedEsus,
      backgroundProperties: oldMapData.current.backgroundProperties,
      backgroundProvenances: oldMapData.current.backgroundProvenances,
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
          StateLabel: GetStreetStateLabel(rec.state ? rec.state : 0, false),
          TypeLabel: GetStreetTypeLabel(0, isScottish.current, false),
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
      visible: true,
    });

    mapRef.current.remove(mapRef.current.findLayerById(unassignedEsusLayerName));

    if (unassignedEsusData && unassignedEsusData.current && unassignedEsusData.current.length > 0) {
      mapRef.current.add(unassignedEsusLayer);

      if (mapContext.layerVisibility) unassignedEsusLayer.visible = mapContext.layerVisibility.unassignedEsus;
    }

    unassignedEsusLayer.watch("visible", (visible) => {
      mapContext.onLayerVisibilityChange("unassignedEsus", visible);
      if (visible) {
        fadeVisibilityOn(unassignedEsusLayer);
      }
    });

    unassignedEsusLayerRef.current = unassignedEsusLayer;
  }, [mapContext, fadeVisibilityOn]);

  // LLPG Street layer
  useEffect(() => {
    const haveLlpgStreets =
      mapContext.currentBackgroundData &&
      mapContext.currentBackgroundData.unassignedEsus &&
      mapContext.currentBackgroundData.unassignedEsus.length > 0;

    const oldAndNewSame = haveLlpgStreets
      ? ArraysEqual(oldMapData.current.unassignedEsus, mapContext.currentBackgroundData.unassignedEsus)
      : false;

    if (!mapRef.current || !mapRef.current.layers || !haveLlpgStreets || oldAndNewSame) return;

    oldMapData.current = {
      streets: oldMapData.current.streets,
      llpgStreets: oldMapData.current.llpgStreets,
      properties: oldMapData.current.properties,
      extents: oldMapData.current.extents,
      backgroundStreets: oldMapData.current.streets,
      unassignedEsus: mapContext.currentBackgroundData.unassignedEsus,
      backgroundProperties: oldMapData.current.backgroundProperties,
      backgroundProvenances: oldMapData.current.backgroundProvenances,
      editStreet: oldMapData.current.editStreet,
      editProperty: oldMapData.current.editProperty,
      zoomStreet: oldMapData.current.zoomStreet,
      zoomProperty: oldMapData.current.zoomProperty,
      mapProperty: oldMapData.current.mapProperty,
    };

    if (haveLlpgStreets) {
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
          StateLabel: GetStreetStateLabel(rec.state ? rec.state : 0, false),
          TypeLabel: GetStreetTypeLabel(0, isScottish.current, false),
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
      visible: true,
    });

    mapRef.current.remove(mapRef.current.findLayerById(unassignedEsusLayerName));

    if (unassignedEsusData && unassignedEsusData.current && unassignedEsusData.current.length > 0) {
      mapRef.current.add(unassignedEsusLayer);

      if (mapContext.layerVisibility) unassignedEsusLayer.visible = mapContext.layerVisibility.unassignedEsus;
    }

    unassignedEsusLayer.watch("visible", (visible) => {
      mapContext.onLayerVisibilityChange("unassignedEsus", visible);
      if (visible) {
        fadeVisibilityOn(unassignedEsusLayer);
      }
    });

    unassignedEsusLayerRef.current = unassignedEsusLayer;
  }, [mapContext, fadeVisibilityOn]);

  // Background property layer
  useEffect(() => {
    const haveProperties =
      mapContext.currentBackgroundData &&
      mapContext.currentBackgroundData.properties &&
      mapContext.currentBackgroundData.properties.length > 0;

    let oldAndNewSame = haveProperties
      ? ArraysEqual(oldMapData.current.backgroundProperties, mapContext.currentBackgroundData.properties)
      : false;

    if (oldAndNewSame) {
      oldAndNewSame =
        (mapContext.currentSearchData.editProperty === null && oldMapData.current.editProperty === null) ||
        (!!mapContext.currentSearchData.editProperty &&
          !!oldMapData.current.editProperty &&
          mapContext.currentSearchData.editProperty === oldMapData.current.editProperty);
    }

    if (oldAndNewSame) {
      oldAndNewSame =
        (mapContext.currentLayers.zoomProperty === null && oldMapData.current.zoomProperty === null) ||
        (!!mapContext.currentLayers.zoomProperty &&
          !!oldMapData.current.zoomProperty &&
          mapContext.currentLayers.zoomProperty === oldMapData.current.zoomProperty);
    }

    if (!mapRef.current || !mapRef.current.layers || !haveProperties || oldAndNewSame) return;

    oldMapData.current = {
      streets: oldMapData.current.streets,
      llpgStreets: oldMapData.current.llpgStreets,
      properties: oldMapData.current.properties,
      extents: oldMapData.current.extents,
      backgroundStreets: oldMapData.current.backgroundStreets,
      unassignedEsus: oldMapData.current.unassignedEsus,
      backgroundProperties: mapContext.currentBackgroundData.properties,
      backgroundProvenances: oldMapData.current.backgroundProvenances,
      editStreet: oldMapData.current.editStreet,
      editProperty: oldMapData.current.editProperty,
      zoomStreet: oldMapData.current.zoomStreet,
      zoomProperty: oldMapData.current.zoomProperty,
      mapProperty: oldMapData.current.mapProperty,
    };

    if (haveProperties) {
      if (propertyData && zoomPropertyData) {
        backgroundPropertyData.current = mapContext.currentBackgroundData.properties.filter(
          (x) =>
            propertyData.findIndex((i) => i.uprn.toString() === x.uprn.toString()) === -1 &&
            zoomPropertyData.findIndex((i) => i.uprn.toString() === x.uprn.toString()) === -1
        );
      } else if (propertyData) {
        backgroundPropertyData.current = mapContext.currentBackgroundData.properties.filter(
          (x) => propertyData.findIndex((i) => i.uprn.toString() === x.uprn.toString()) === -1
        );
      } else if (zoomPropertyData) {
        backgroundPropertyData.current = mapContext.currentBackgroundData.properties.filter(
          (x) => zoomPropertyData.findIndex((i) => i.uprn.toString() === x.uprn.toString()) === -1
        );
      } else backgroundPropertyData.current = mapContext.currentBackgroundData.properties;
    } else backgroundPropertyData.current = null;

    const backgroundPropertyFeatures =
      backgroundPropertyData.current &&
      backgroundPropertyData.current
        // .sort((a, b) => a.logicalStatus - b.logicalStatus)
        .map((rec, index) => ({
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
            DisplayLogicalStatus: backgroundPropertyData.current
              .filter((x) => x.uprn === rec.uprn)
              .reduce((prev, curr) => (prev.logicalStatus < curr.logicalStatus ? prev : curr)).logicalStatus,
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
          name: "DisplayLogicalStatus",
          alias: "DisplayLogicalStatus",
          type: "integer",
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
        actions: [
          propertyOpenAction,
          propertyAddChild,
          propertyAddRangeChildren,
          // propertyRadialSearchAction,
          // propertyAddToActivityListAction,
          propertyStreetViewAction,
          // propertyMenuAction,
        ],
      },
      renderer: backgroundPropertyRenderer,
      opacity: 0.5,
      spatialReference: { wkid: 27700 },
      title: "Background Property layer",
    });

    const selectPropertyFeatures =
      mapContext.currentBackgroundData.properties &&
      mapContext.currentBackgroundData.properties
        // .sort((a, b) => a.logicalStatus - b.logicalStatus)
        .map((rec, index) => ({
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
            DisplayLogicalStatus: mapContext.currentBackgroundData.properties
              .filter((x) => x.uprn === rec.uprn)
              .reduce((prev, curr) => (prev.logicalStatus < curr.logicalStatus ? prev : curr)).logicalStatus,
            LogicalStatus: rec.logicalStatus,
            LogicalStatusLabel: GetLPILogicalStatusLabel(rec.logicalStatus, isScottish.current),
            Classification: rec.blpuClass,
            ClassificationLabel: GetClassificationLabel(rec.blpuClass, isScottish.current),
          },
        }));

    const selectPropertyLayer = new FeatureLayer({
      id: selectPropertyLayerName,
      copyright: `© Copyright Idox Software Ltd. ${new Date().getFullYear()}`,
      source: selectPropertyFeatures,
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
          name: "DisplayLogicalStatus",
          alias: "DisplayLogicalStatus",
          type: "integer",
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
      listMode: "hide",
      visible: selectingProperties.current,
      popupEnabled: false,
      renderer: backgroundPropertyRenderer,
      opacity: 0.5,
      spatialReference: { wkid: 27700 },
      title: "Select Property layer",
    });

    mapRef.current.remove(mapRef.current.findLayerById(backgroundPropertyLayerName));
    mapRef.current.remove(mapRef.current.findLayerById(selectPropertyLayerName));

    if (backgroundPropertyData && backgroundPropertyData.current && backgroundPropertyData.current.length > 0) {
      mapRef.current.add(backgroundPropertyLayer);

      if (mapContext.layerVisibility) backgroundPropertyLayer.visible = mapContext.layerVisibility.backgroundProperties;
    }

    if (
      mapContext.currentBackgroundData &&
      mapContext.currentBackgroundData.properties &&
      mapContext.currentBackgroundData.properties.length > 0
    )
      mapRef.current.add(selectPropertyLayer);

    backgroundPropertyLayer.watch("visible", (visible) => {
      mapContext.onLayerVisibilityChange("backgroundProperties", visible);
      if (visible) {
        fadeVisibilityOn(backgroundPropertyLayer);
      }
    });

    backgroundPropertyLayerRef.current = backgroundPropertyLayer;
  }, [mapContext, propertyData, zoomPropertyData, fadeVisibilityOn]);

  // Background provenance layer
  useEffect(() => {
    const haveProvenances =
      mapContext.currentBackgroundData &&
      mapContext.currentBackgroundData.provenances &&
      mapContext.currentBackgroundData.provenances.length > 0;

    const oldAndNewSame = haveProvenances
      ? ArraysEqual(oldMapData.current.backgroundProvenances, mapContext.currentBackgroundData.provenances)
      : false;

    if (!mapRef.current || !mapRef.current.layers || !haveProvenances || oldAndNewSame) return;

    oldMapData.current = {
      streets: oldMapData.current.streets,
      llpgStreets: oldMapData.current.llpgStreets,
      properties: oldMapData.current.properties,
      extents: oldMapData.current.extents,
      backgroundStreets: oldMapData.current.streets,
      unassignedEsus: oldMapData.current.unassignedEsus,
      backgroundProperties: oldMapData.current.backgroundProperties,
      backgroundProvenances: mapContext.currentBackgroundData.provenances,
      editStreet: oldMapData.current.editStreet,
      editProperty: oldMapData.current.editProperty,
      zoomStreet: oldMapData.current.zoomStreet,
      zoomProperty: oldMapData.current.zoomProperty,
      mapProperty: oldMapData.current.mapProperty,
    };

    if (haveProvenances) {
      backgroundProvenanceData.current = mapContext.currentBackgroundData.provenances;
    } else backgroundProvenanceData.current = null;

    const backgroundProvenancesFeatures =
      backgroundProvenanceData.current &&
      backgroundProvenanceData.current.map((rec, index) => ({
        geometry: {
          type: "polygon",
          rings: rec.wktGeometry && rec.wktGeometry !== "" ? GetWktCoordinates(rec.wktGeometry) : undefined,
          spatialReference: { wkid: 27700 },
        },
        attributes: {
          ObjectID: index,
          UPRN: rec.uprn,
          Code: rec.provCode,
          CodeLabel: GetProvenanceLabel(rec.provCode, isScottish.current),
        },
      }));

    const backgroundProvenancesLayer = new FeatureLayer({
      id: backgroundProvenanceLayerName,
      copyright: `© Copyright Idox Software Ltd. ${new Date().getFullYear()}`,
      source: backgroundProvenancesFeatures,
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
          name: "Code",
          alias: "Code",
          type: "string",
        },
        {
          name: "CodeLabel",
          alias: "Provenance",
          type: "string",
        },
      ],
      outFields: ["*"],
      objectIdField: "ObjectID",
      popupTemplate: {
        title: "Provenance",
        lastEditInfoEnabled: false,
        content: [
          {
            type: "fields",
            fieldInfos: [
              {
                fieldName: "UPRN",
              },
              {
                fieldName: "CodeLabel",
                label: "Provenance",
              },
            ],
          },
        ],
        actions: [
          propertyOpenAction,
          propertyAddChild,
          propertyAddRangeChildren,
          // propertyRadialSearchAction,
          // propertyAddToActivityListAction,
          propertyStreetViewAction,
          // propertyMenuAction,
        ],
      },
      renderer: extentRenderer,
      spatialReference: { wkid: 27700 },
      title: "Background Provenance layer",
      visible: mapContext.layerVisibility.backgroundProvenances,
    });

    mapRef.current.remove(mapRef.current.findLayerById(backgroundProvenanceLayerName));

    if (backgroundProvenanceData && backgroundProvenanceData.current && backgroundProvenanceData.current.length > 0) {
      mapRef.current.add(backgroundProvenancesLayer);

      if (mapContext.layerVisibility)
        backgroundProvenancesLayer.visible = mapContext.layerVisibility.backgroundProvenances;
    }

    backgroundProvenancesLayer.watch("visible", (visible) => {
      mapContext.onLayerVisibilityChange("backgroundProvenances", visible);
      if (visible) {
        fadeVisibilityOn(backgroundProvenancesLayer);
      }
    });

    backgroundProvenanceLayerRef.current = backgroundProvenancesLayer;
  }, [mapContext, fadeVisibilityOn]);

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
      editingObject.current = null;
    } else {
      loadedShpFileTitles.current = [];
      loadedShpFileIds.current = [];
    }
  }, [mapContext.loadedShpFiles]);

  // Edit, street & property layers
  useEffect(() => {
    if (
      !mapRef.current ||
      !mapRef.current.layers ||
      !view ||
      !view.ui ||
      (oldMapData.current.streets === mapContext.currentSearchData.streets &&
        oldMapData.current.llpgStreets === mapContext.currentSearchData.llpgStreets &&
        oldMapData.current.properties === mapContext.currentSearchData.properties &&
        oldMapData.current.extents === mapContext.currentLayers.extents &&
        oldMapData.current.editStreet === mapContext.currentSearchData.editStreet &&
        oldMapData.current.editProperty === mapContext.currentSearchData.editProperty &&
        oldMapData.current.zoomStreet === mapContext.currentLayers.zoomStreet &&
        oldMapData.current.zoomProperty === mapContext.currentLayers.zoomProperty &&
        oldMapData.current.mapProperty === mapContext.currentProperty)
    )
      return;

    let streetDataRef = null;
    let llpgStreetDataRef = null;
    let asdType51DataRef = null;
    let asdType52DataRef = null;
    let asdType53DataRef = null;
    let asdType61DataRef = null;
    let asdType62DataRef = null;
    let asdType63DataRef = null;
    let asdType64DataRef = null;
    let asdType66DataRef = null;
    let propertyDataRef = null;
    let zoomStreetDataRef = null;
    let zoomPropertyDataRef = null;

    const editingGraphic = editingObject.current && editingObject.current.objectType;

    if (mapContext.provenanceMerging) return;

    if (mapContext.currentLayers && mapContext.currentSearchData) {
      if (mapContext.currentLayers.zoomStreet) {
        if (
          mapContext.currentSearchData.streets &&
          mapContext.currentSearchData.streets.length > 0 &&
          userContext.current.currentUser.hasStreet
        ) {
          const currentStreets = mapContext.currentSearchData.streets.filter(
            (x) => x.usrn.toString() === mapContext.currentLayers.zoomStreet.usrn.toString()
          );

          let mapStreets = [];

          currentStreets.forEach((street) => {
            mapStreets = street.esus.map((esu) => {
              return {
                usrn: street.usrn,
                description: street.streetDescriptor,
                language: street.language,
                locality: street.locality,
                town: street.town,
                type: street.type,
                state: street.state,
                esuId: esu.esuId,
                geometry: esu.geometry,
              };
            });
          });

          if (mapStreets && mapStreets.length > 0) zoomStreetDataRef = mapStreets;
          else zoomStreetDataRef = null;
        } else if (mapContext.currentSearchData.llpgStreets && mapContext.currentSearchData.llpgStreets.length > 0) {
          const currentLlpgStreets = mapContext.currentSearchData.llpgStreets.filter(
            (x) => x.usrn.toString() === mapContext.currentLayers.zoomStreet.usrn.toString()
          );

          let mapLlpgStreets = [];

          currentLlpgStreets.forEach((street) => {
            mapLlpgStreets = street.esus.map((esu) => {
              return {
                usrn: street.usrn,
                description: street.streetDescriptor,
                language: street.language,
                locality: street.locality,
                town: street.town,
                type: street.type,
                state: street.state,
                esuId: esu.esuId,
                geometry: esu.geometry,
              };
            });
          });

          if (mapLlpgStreets && mapLlpgStreets.length > 0) zoomStreetDataRef = mapLlpgStreets;
          else zoomStreetDataRef = null;
        } else zoomStreetDataRef = null;
      } else zoomStreetDataRef = null;
      setZoomStreetData(zoomStreetDataRef);

      if (
        mapContext.currentSearchData.properties &&
        mapContext.currentSearchData.properties.length > 0 &&
        mapContext.currentLayers.zoomProperty
      ) {
        zoomPropertyDataRef = mapContext.currentSearchData.properties.filter(
          (x) => x.uprn.toString() === mapContext.currentLayers.zoomProperty.toString()
        );
      } else zoomPropertyDataRef = null;
      setZoomPropertyData(zoomPropertyDataRef);

      if (
        mapContext.currentSearchData.properties &&
        mapContext.currentSearchData.properties.length > 0 &&
        !mapContext.currentSearchData.editStreet
      ) {
        if (mapContext.currentSearchData.editProperty)
          propertyDataRef = mapContext.currentSearchData.properties.filter(
            (x) => x.uprn.toString() === mapContext.currentSearchData.editProperty.toString()
          );
        else propertyDataRef = mapContext.currentSearchData.properties;
      } else propertyDataRef = null;
      setPropertyData(propertyDataRef);
      refPropertyData.current = propertyDataRef;

      if (
        mapContext.currentLayers.extents &&
        mapContext.currentLayers.extents.length > 0 &&
        mapContext.currentSearchData.editProperty
      ) {
        extentData.current = mapContext.currentLayers.extents.filter(
          (x) => x.geometry && x.uprn.toString() === mapContext.currentSearchData.editProperty.toString()
        );
      } else extentData.current = null;

      let mapStreets = [];
      let mapLlpgStreets = [];
      let mapAsd51 = [];
      let mapAsd52 = [];
      let mapAsd53 = [];
      let mapAsd61 = [];
      let mapAsd62 = [];
      let mapAsd63 = [];
      let mapAsd64 = [];
      let mapAsd66 = [];

      if (
        userContext.current.currentUser.hasStreet &&
        mapContext.currentSearchData.streets &&
        !mapContext.currentSearchData.editProperty
      ) {
        const currentStreets = mapContext.currentSearchData.editStreet
          ? mapContext.currentSearchData.streets.filter(
              (x) => x.usrn.toString() === mapContext.currentSearchData.editStreet.toString()
            )
          : mapContext.currentSearchData.streets;

        currentStreets.forEach((street) => {
          if (street.esus && street.esus.length > 0) {
            mapStreets = mapStreets.concat(
              street.esus.map((esu) => {
                return {
                  usrn: street.usrn,
                  description: street.description,
                  language: street.language,
                  locality: street.locality,
                  town: street.town,
                  type: street.type,
                  state: isScottish.current ? esu.state : street.state,
                  esuId: esu.esuId,
                  geometry: esu.geometry,
                };
              })
            );
          }

          if (
            (mapContext.currentSearchData.editStreet ||
              (streetContext.currentStreet && streetContext.currentStreet.newStreet) ||
              (streetContext.currentRecord && streetContext.currentRecord.newRecord)) &&
            street.asdType51
          ) {
            mapAsd51 = mapAsd51.concat(
              street.asdType51.map((asd) => {
                return {
                  pkId: asd.pkId,
                  usrn: asd.usrn,
                  streetStatus: asd.streetStatus,
                  custodianCode: asd.custodianCode,
                  maintainingAuthorityCode: asd.maintainingAuthorityCode,
                  wholeRoad: asd.wholeRoad,
                  geometry: asd.geometry,
                };
              })
            );
          }

          if (
            (mapContext.currentSearchData.editStreet ||
              (streetContext.currentStreet && streetContext.currentStreet.newStreet) ||
              (streetContext.currentRecord && streetContext.currentRecord.newRecord)) &&
            street.asdType52
          ) {
            mapAsd52 = mapAsd52.concat(
              street.asdType52.map((asd) => {
                return {
                  pkId: asd.pkId,
                  usrn: asd.usrn,
                  reinstatementCategoryCode: asd.reinstatementCategoryCode,
                  custodianCode: asd.custodianCode,
                  reinstatementAuthorityCode: asd.reinstatementAuthorityCode,
                  wholeRoad: asd.wholeRoad,
                  geometry: asd.geometry,
                };
              })
            );
          }

          if (
            (mapContext.currentSearchData.editStreet ||
              (streetContext.currentStreet && streetContext.currentStreet.newStreet) ||
              (streetContext.currentRecord && streetContext.currentRecord.newRecord)) &&
            street.asdType53
          ) {
            mapAsd53 = mapAsd53.concat(
              street.asdType53.map((asd) => {
                return {
                  pkId: asd.pkId,
                  usrn: asd.usrn,
                  specialDesignationCode: asd.specialDesignationCode,
                  custodianCode: asd.custodianCode,
                  authorityCode: asd.authorityCode,
                  wholeRoad: asd.wholeRoad,
                  geometry: asd.geometry,
                };
              })
            );
          }

          if (
            (mapContext.currentSearchData.editStreet ||
              (streetContext.currentStreet && streetContext.currentStreet.newStreet) ||
              (streetContext.currentRecord && streetContext.currentRecord.newRecord)) &&
            street.asdType61
          ) {
            mapAsd61 = mapAsd61.concat(
              street.asdType61.map((asd) => {
                return {
                  pkId: asd.pkId,
                  usrn: asd.usrn,
                  streetStatus: asd.streetStatus,
                  interestType: asd.interestType,
                  swaOrgRefAuthority: asd.swaOrgRefAuthority,
                  districtRefAuthority: asd.districtRefAuthority,
                  wholeRoad: asd.wholeRoad,
                  geometry: asd.geometry,
                };
              })
            );
          }

          if (
            (mapContext.currentSearchData.editStreet ||
              (streetContext.currentStreet && streetContext.currentStreet.newStreet) ||
              (streetContext.currentRecord && streetContext.currentRecord.newRecord)) &&
            street.asdType62
          ) {
            mapAsd62 = mapAsd62.concat(
              street.asdType62.map((asd) => {
                return {
                  pkId: asd.pkId,
                  usrn: asd.usrn,
                  constructionType: asd.constructionType,
                  reinstatementTypeCode: asd.reinstatementTypeCode,
                  swaOrgRefConsultant: asd.swaOrgRefConsultant,
                  districtRefConsultant: asd.districtRefConsultant,
                  wholeRoad: asd.wholeRoad,
                  geometry: asd.geometry,
                };
              })
            );
          }

          if (
            (mapContext.currentSearchData.editStreet ||
              (streetContext.currentStreet && streetContext.currentStreet.newStreet) ||
              (streetContext.currentRecord && streetContext.currentRecord.newRecord)) &&
            street.asdType63
          ) {
            mapAsd63 = mapAsd63.concat(
              street.asdType63.map((asd) => {
                return {
                  pkId: asd.pkId,
                  usrn: asd.usrn,
                  streetSpecialDesigCode: asd.streetSpecialDesigCode,
                  swaOrgRefConsultant: asd.swaOrgRefConsultant,
                  districtRefConsultant: asd.districtRefConsultant,
                  wholeRoad: asd.wholeRoad,
                  geometry: asd.geometry,
                };
              })
            );
          }

          if (
            (mapContext.currentSearchData.editStreet ||
              (streetContext.currentStreet && streetContext.currentStreet.newStreet) ||
              (streetContext.currentRecord && streetContext.currentRecord.newRecord)) &&
            street.asdType64
          ) {
            mapAsd64 = mapAsd64.concat(
              street.asdType64.map((asd) => {
                return {
                  pkId: asd.pkId,
                  usrn: asd.usrn,
                  hwwRestrictionCode: asd.hwwRestrictionCode,
                  swaOrgRefConsultant: asd.swaOrgRefConsultant,
                  districtRefConsultant: asd.districtRefConsultant,
                  wholeRoad: asd.wholeRoad,
                  geometry: asd.geometry,
                };
              })
            );
          }

          if (
            (mapContext.currentSearchData.editStreet ||
              (streetContext.currentStreet && streetContext.currentStreet.newStreet) ||
              (streetContext.currentRecord && streetContext.currentRecord.newRecord)) &&
            street.asdType66
          ) {
            mapAsd66 = mapAsd66.concat(
              street.asdType66.map((asd) => {
                return {
                  pkId: asd.pkId,
                  prowUsrn: asd.prowUsrn,
                  prowRights: asd.prowRights,
                  prowOrgRefConsultant: asd.prowOrgRefConsultant,
                  prowDistrictRefConsultant: asd.prowDistrictRefConsultant,
                  defMapGeometryType: asd.defMapGeometryType,
                  geometry: asd.geometry,
                };
              })
            );
          }
        });

        if (mapStreets && mapStreets.length > 0) streetDataRef = mapStreets;
        else streetDataRef = null;

        llpgStreetDataRef = null;

        if (mapAsd51 && mapAsd51.length > 0) asdType51DataRef = mapAsd51;
        else asdType51DataRef = null;

        if (mapAsd52 && mapAsd52.length > 0) asdType52DataRef = mapAsd52;
        else asdType52DataRef = null;

        if (mapAsd53 && mapAsd53.length > 0) asdType53DataRef = mapAsd53;
        else asdType53DataRef = null;

        if (mapAsd61 && mapAsd61.length > 0) asdType61DataRef = mapAsd61;
        else asdType61DataRef = null;

        if (mapAsd62 && mapAsd62.length > 0) asdType62DataRef = mapAsd62;
        else asdType62DataRef = null;

        if (mapAsd63 && mapAsd63.length > 0) asdType63DataRef = mapAsd63;
        else asdType63DataRef = null;

        if (mapAsd64 && mapAsd64.length > 0) asdType64DataRef = mapAsd64;
        else asdType64DataRef = null;

        if (mapAsd66 && mapAsd66.length > 0) asdType66DataRef = mapAsd66;
        else asdType66DataRef = null;
      } else if (
        !userContext.current.currentUser.hasStreet &&
        mapContext.currentSearchData.llpgStreets &&
        !mapContext.currentSearchData.editProperty
      ) {
        const currentLlpgStreets = mapContext.currentSearchData.editStreet
          ? mapContext.currentSearchData.llpgStreets.filter(
              (x) => x.usrn.toString() === mapContext.currentSearchData.editStreet.toString()
            )
          : mapContext.currentSearchData.llpgStreets;

        currentLlpgStreets.forEach((street) => {
          if (street.esus) {
            mapLlpgStreets = mapLlpgStreets.concat(
              street.esus.map((esu) => {
                return {
                  usrn: street.usrn,
                  description: street.description,
                  language: street.language,
                  locality: street.locality,
                  town: street.town,
                  type: street.type,
                  state: isScottish.current ? esu.state : street.state,
                  esuId: esu.esuId,
                  geometry: esu.geometry,
                };
              })
            );
          }
        });

        streetDataRef = null;

        if (mapLlpgStreets && mapLlpgStreets.length > 0) llpgStreetDataRef = mapLlpgStreets;
        else llpgStreetDataRef = null;

        asdType51DataRef = null;
        asdType52DataRef = null;
        asdType53DataRef = null;
        asdType61DataRef = null;
        asdType62DataRef = null;
        asdType63DataRef = null;
        asdType64DataRef = null;
        asdType66DataRef = null;
      } else {
        streetDataRef = null;
        llpgStreetDataRef = null;
        asdType51DataRef = null;
        asdType52DataRef = null;
        asdType53DataRef = null;
        asdType61DataRef = null;
        asdType62DataRef = null;
        asdType63DataRef = null;
        asdType64DataRef = null;
        asdType66DataRef = null;
      }

      setStreetData(streetDataRef);
      setLlpgStreetData(llpgStreetDataRef);
      refStreetData.current = streetDataRef;
      refLlpgStreetData.current = llpgStreetDataRef;
      refAsd51Data.current = asdType51DataRef;
      refAsd52Data.current = asdType52DataRef;
      refAsd53Data.current = asdType53DataRef;
      refAsd61Data.current = asdType61DataRef;
      refAsd62Data.current = asdType62DataRef;
      refAsd63Data.current = asdType63DataRef;
      refAsd64Data.current = asdType64DataRef;
      refAsd66Data.current = asdType66DataRef;
    }

    const streetFeatures =
      streetDataRef &&
      streetDataRef.map((rec, index) => ({
        geometry: {
          type: "polyline",
          paths:
            mapContext.currentStreet &&
            mapContext.currentStreet.usrn &&
            mapContext.currentStreet.usrn.toString() === rec.usrn.toString()
              ? mapContext.currentStreet.geometry
              : rec.geometry,
          spatialReference: { wkid: 27700 },
        },
        attributes: {
          ObjectID: index,
          USRN: rec.usrn.toString(),
          EsuId: rec.esuId.toString(),
          Description: streetToTitleCase(
            mapContext.currentStreet &&
              mapContext.currentStreet.usrn &&
              mapContext.currentStreet.usrn.toString() === rec.usrn.toString()
              ? `${rec.description ? rec.description : "Unknown"}${
                  mapContext.currentStreet.locality && mapContext.currentStreet.locality !== "Unassigned"
                    ? " " + mapContext.currentStreet.locality
                    : ""
                }${
                  mapContext.currentStreet.town && mapContext.currentStreet.town !== "Unassigned"
                    ? " " + mapContext.currentStreet.town
                    : ""
                }`
              : `${rec.description ? rec.description : "Unknown"}${
                  rec.locality && rec.locality !== "Unassigned" ? " " + rec.locality : ""
                }${rec.town && rec.town !== "Unassigned" ? " " + rec.town : ""}`
          ),
          State:
            mapContext.currentStreet &&
            mapContext.currentStreet.usrn &&
            mapContext.currentStreet.usrn.toString() === rec.usrn.toString()
              ? mapContext.currentStreet.state
              : rec.state,
          Type:
            mapContext.currentStreet &&
            mapContext.currentStreet.usrn &&
            mapContext.currentStreet.usrn.toString() === rec.usrn.toString()
              ? mapContext.currentStreet.type
              : rec.type
              ? rec.type
              : 1,
          StateLabel: GetStreetStateLabel(
            mapContext.currentStreet &&
              mapContext.currentStreet.usrn &&
              mapContext.currentStreet.usrn.toString() === rec.usrn.toString()
              ? mapContext.currentStreet.state
              : rec.state,
            false
          ),
          TypeLabel: GetStreetTypeLabel(
            mapContext.currentStreet &&
              mapContext.currentStreet.usrn &&
              mapContext.currentStreet.usrn.toString() === rec.usrn.toString()
              ? mapContext.currentStreet.type
              : rec.type
              ? rec.type
              : 1,
            isScottish.current,
            false
          ),
          SymbolCode: `${
            mapContext.currentStreet &&
            mapContext.currentStreet.usrn &&
            mapContext.currentStreet.usrn.toString() === rec.usrn.toString()
              ? mapContext.currentStreet.type
              : rec.type
              ? rec.type
              : "1"
          }, ${
            mapContext.currentStreet &&
            mapContext.currentStreet.usrn &&
            mapContext.currentStreet.usrn.toString() === rec.usrn.toString()
              ? mapContext.currentStreet.state
              : rec.state
              ? rec.state
              : "2"
          }`,
        },
      }));

    const llpgStreetFeatures =
      llpgStreetDataRef &&
      llpgStreetDataRef.map((rec, index) => ({
        geometry: {
          type: "polyline",
          paths:
            mapContext.currentStreet &&
            mapContext.currentStreet.usrn &&
            mapContext.currentStreet.usrn.toString() === rec.usrn.toString()
              ? mapContext.currentStreet.geometry
              : rec.geometry,
          spatialReference: { wkid: 27700 },
        },
        attributes: {
          ObjectID: index,
          USRN: rec.usrn.toString(),
          EsuId: rec.esuId.toString(),
          Description: streetToTitleCase(
            mapContext.currentStreet &&
              mapContext.currentStreet.usrn &&
              mapContext.currentStreet.usrn.toString() === rec.usrn.toString()
              ? `${rec.description ? rec.description : "Unknown"}${
                  mapContext.currentStreet.locality && mapContext.currentStreet.locality !== "Unassigned"
                    ? " " + mapContext.currentStreet.locality
                    : ""
                }${
                  mapContext.currentStreet.town && mapContext.currentStreet.town !== "Unassigned"
                    ? " " + mapContext.currentStreet.town
                    : ""
                }`
              : `${rec.description ? rec.description : "Unknown"}${
                  rec.locality && rec.locality !== "Unassigned" ? " " + rec.locality : ""
                }${rec.town && rec.town !== "Unassigned" ? " " + rec.town : ""}`
          ),
          State:
            mapContext.currentStreet &&
            mapContext.currentStreet.usrn &&
            mapContext.currentStreet.usrn.toString() === rec.usrn.toString()
              ? mapContext.currentStreet.state
              : rec.state,
          Type:
            mapContext.currentStreet &&
            mapContext.currentStreet.usrn &&
            mapContext.currentStreet.usrn.toString() === rec.usrn.toString()
              ? mapContext.currentStreet.type
              : rec.type
              ? rec.type
              : 1,
          StateLabel: GetStreetStateLabel(
            mapContext.currentStreet &&
              mapContext.currentStreet.usrn &&
              mapContext.currentStreet.usrn.toString() === rec.usrn.toString()
              ? mapContext.currentStreet.state
              : rec.state,
            false
          ),
          TypeLabel: GetStreetTypeLabel(
            mapContext.currentStreet &&
              mapContext.currentStreet.usrn &&
              mapContext.currentStreet.usrn.toString() === rec.usrn.toString()
              ? mapContext.currentStreet.type
              : rec.type
              ? rec.type
              : 1,
            isScottish.current,
            false
          ),
          SymbolCode: `-1, ${
            mapContext.currentStreet &&
            mapContext.currentStreet.usrn &&
            mapContext.currentStreet.usrn.toString() === rec.usrn.toString()
              ? mapContext.currentStreet.type
              : rec.type
              ? rec.type
              : "1"
          }, ${
            mapContext.currentStreet &&
            mapContext.currentStreet.usrn &&
            mapContext.currentStreet.usrn.toString() === rec.usrn.toString()
              ? mapContext.currentStreet.state
              : rec.state
              ? rec.state
              : "2"
          }`,
        },
      }));

    const asd51Features =
      asdType51DataRef &&
      asdType51DataRef.map((rec, index) => ({
        geometry: {
          type: "polyline",
          paths: rec.geometry,
          spatialReference: { wkid: 27700 },
        },
        attributes: {
          ObjectID: index,
          PkId: rec.pkId.toString(),
          USRN: rec.usrn.toString(),
          Description: `Maintenance responsibility - ${GetAsdPrimaryCodeText(
            "51",
            rec.streetStatus,
            isScottish.current
          )}`,
          Authority: GetAuthorityLabel(rec.maintainingAuthorityCode, isScottish.current),
          Custodian: GetAuthorityLabel(rec.custodianCode, isScottish.current),
          WholeRoad: GetWholeRoadLabel(rec.wholeRoad),
        },
      }));

    const asd52Features =
      asdType52DataRef &&
      asdType52DataRef.map((rec, index) => ({
        geometry: {
          type: "polyline",
          paths: rec.geometry,
          spatialReference: { wkid: 27700 },
        },
        attributes: {
          ObjectID: index,
          PkId: rec.pkId.toString(),
          USRN: rec.usrn.toString(),
          Description: `Reinstatement category - ${GetAsdPrimaryCodeText(
            "52",
            rec.reinstatementCategoryCode,
            isScottish.current
          )}`,
          Authority: GetAuthorityLabel(rec.reinstatementAuthorityCode, isScottish.current),
          Custodian: GetAuthorityLabel(rec.custodianCode, isScottish.current),
          WholeRoad: GetWholeRoadLabel(rec.wholeRoad),
        },
      }));

    const asd53Features =
      asdType53DataRef &&
      asdType53DataRef.map((rec, index) => ({
        geometry: {
          type: "polyline",
          paths: rec.geometry,
          spatialReference: { wkid: 27700 },
        },
        attributes: {
          ObjectID: index,
          PkId: rec.pkId.toString(),
          USRN: rec.usrn.toString(),
          Description: `Special designation - ${GetAsdPrimaryCodeText(
            "53",
            rec.specialDesignationCode,
            isScottish.current
          )}`,
          Authority: GetAuthorityLabel(rec.authorityCode, isScottish.current),
          Custodian: GetAuthorityLabel(rec.custodianCode, isScottish.current),
          WholeRoad: GetWholeRoadLabel(rec.wholeRoad),
        },
      }));

    const asd61Features =
      asdType61DataRef &&
      asdType61DataRef.map((rec, index) => ({
        geometry: {
          type: "polyline",
          paths: rec.geometry,
          spatialReference: { wkid: 27700 },
        },
        attributes: {
          ObjectID: index,
          PkId: rec.pkId.toString(),
          USRN: rec.usrn.toString(),
          Description: `Interest - ${GetAsdPrimaryCodeText("61", rec.streetStatus, isScottish.current)}`,
          Interest: GetInterestLabel(rec.interestType),
          Organisation: GetAuthorityLabel(rec.swaOrgRefAuthority, isScottish.current),
          District: GetDistrictLabel(rec.districtRefAuthority, lookupContext.current),
          WholeRoad: GetWholeRoadLabel(rec.wholeRoad),
        },
      }));

    const asd62Features =
      asdType62DataRef &&
      asdType62DataRef.map((rec, index) => ({
        geometry: {
          type: "polyline",
          paths: rec.geometry,
          spatialReference: { wkid: 27700 },
        },
        attributes: {
          ObjectID: index,
          PkId: rec.pkId.toString(),
          USRN: rec.usrn.toString(),
          Description: `Construction - ${GetAsdPrimaryCodeText("62", rec.constructionType, isScottish.current)}`,
          Reinstatement: GetReinstatementLabel(rec.reinstatementTypeCode, isScottish.current),
          Organisation: GetAuthorityLabel(rec.swaOrgRefConsultant, isScottish.current),
          District: GetDistrictLabel(rec.districtRefConsultant, lookupContext.current),
          WholeRoad: GetWholeRoadLabel(rec.wholeRoad),
        },
      }));

    const asd63Features =
      asdType63DataRef &&
      asdType63DataRef.map((rec, index) => ({
        geometry: {
          type: "polyline",
          paths: rec.geometry,
          spatialReference: { wkid: 27700 },
        },
        attributes: {
          ObjectID: index,
          PkId: rec.pkId.toString(),
          USRN: rec.usrn.toString(),
          Description: `Special designation - ${GetAsdPrimaryCodeText(
            "63",
            rec.streetSpecialDesigCode,
            isScottish.current
          )}`,
          Organisation: GetAuthorityLabel(rec.swaOrgRefConsultant, isScottish.current),
          District: GetDistrictLabel(rec.districtRefConsultant, lookupContext.current),
          WholeRoad: GetWholeRoadLabel(rec.wholeRoad),
        },
      }));

    const asd64Features =
      asdType64DataRef &&
      asdType64DataRef.map((rec, index) => ({
        geometry: {
          type: "polyline",
          paths: rec.geometry,
          spatialReference: { wkid: 27700 },
        },
        attributes: {
          ObjectID: index,
          PkId: rec.pkId.toString(),
          USRN: rec.usrn.toString(),
          Description: `Height, width and weight designation - ${GetAsdPrimaryCodeText(
            "64",
            rec.hwwRestrictionCode,
            isScottish.current
          )}`,
          Organisation: GetAuthorityLabel(rec.swaOrgRefConsultant, isScottish.current),
          District: GetDistrictLabel(rec.districtRefConsultant, lookupContext.current),
          WholeRoad: GetWholeRoadLabel(rec.wholeRoad),
        },
      }));

    const asd66Features =
      asdType66DataRef &&
      asdType66DataRef.map((rec, index) => ({
        geometry: {
          type: "polyline",
          paths: rec.geometry,
          spatialReference: { wkid: 27700 },
        },
        attributes: {
          ObjectID: index,
          PkId: rec.pkId.toString(),
          USRN: rec.prowUsrn.toString(),
          Description: `Public right of way - ${GetAsdPrimaryCodeText("66", rec.prowRights, isScottish.current)}`,
          ProwStatus: GetProwStatusLabel(rec.prowStatus),
          Organisation: GetAuthorityLabel(rec.prowOrgRefConsultant, isScottish.current),
          District: GetDistrictLabel(rec.prowDistrictRefConsultant, lookupContext.current),
          DefMapGeometryType: GetWholeRoadLabel(rec.defMapGeometryType, true),
        },
      }));

    const propertyFeatures =
      propertyDataRef &&
      propertyDataRef
        // .sort((a, b) => a.logicalStatus - b.logicalStatus)
        .map((rec, index) => ({
          geometry: {
            type: "point",
            x:
              mapContext.currentProperty &&
              mapContext.currentProperty.uprn &&
              mapContext.currentProperty.uprn.toString() === rec.uprn.toString()
                ? mapContext.currentProperty.xcoordinate
                : rec.easting,
            y:
              mapContext.currentProperty &&
              mapContext.currentProperty.uprn &&
              mapContext.currentProperty.uprn.toString() === rec.uprn.toString()
                ? mapContext.currentProperty.ycoordinate
                : rec.northing,
            spatialReference: { wkid: 27700 },
          },
          attributes: {
            ObjectID: index,
            UPRN: rec.uprn.toString(),
            Address: rec.address ? addressToTitleCase(rec.address, rec.postcode) : "New Property",
            FormattedAddress: rec.formattedAddress
              ? addressToTitleCase(rec.formattedAddress, rec.postcode)
              : rec.address
              ? addressToTitleCase(rec.address, rec.postcode)
              : "New Property",
            Postcode: rec.postcode,
            Easting:
              mapContext.currentProperty &&
              mapContext.currentProperty.uprn &&
              mapContext.currentProperty.uprn.toString() === rec.uprn.toString()
                ? mapContext.currentProperty.xcoordinate
                : rec.easting,
            Northing:
              mapContext.currentProperty &&
              mapContext.currentProperty.uprn &&
              mapContext.currentProperty.uprn.toString() === rec.uprn.toString()
                ? mapContext.currentProperty.ycoordinate
                : rec.northing,
            DisplayLogicalStatus: propertyDataRef
              .filter((x) => x.uprn === rec.uprn)
              .reduce((prev, curr) => (prev.logicalStatus < curr.logicalStatus ? prev : curr)).logicalStatus,
            LogicalStatus:
              mapContext.currentProperty &&
              mapContext.currentProperty.uprn &&
              mapContext.currentProperty.uprn.toString() === rec.uprn.toString()
                ? mapContext.currentProperty.logicalStatus
                : rec.logicalStatus,
            LogicalStatusLabel: GetLPILogicalStatusLabel(
              mapContext.currentProperty &&
                mapContext.currentProperty.uprn &&
                mapContext.currentProperty.uprn.toString() === rec.uprn.toString()
                ? mapContext.currentProperty.logicalStatus
                : rec.logicalStatus,
              isScottish.current
            ),
            Classification:
              mapContext.currentProperty &&
              mapContext.currentProperty.uprn &&
              mapContext.currentProperty.uprn.toString() === rec.uprn.toString()
                ? mapContext.currentProperty.blpuClass
                : rec.classificationCode,
            ClassificationLabel: GetClassificationLabel(
              mapContext.currentProperty &&
                mapContext.currentProperty.uprn &&
                mapContext.currentProperty.uprn.toString() === rec.uprn.toString()
                ? mapContext.currentProperty.blpuClass
                : rec.classificationCode,
              isScottish.current
            ),
            SymbolCode: `${
              mapContext.currentProperty &&
              mapContext.currentProperty.uprn &&
              mapContext.currentProperty.uprn.toString() === rec.uprn.toString()
                ? mapContext.currentProperty
                    .filter((x) => x.uprn === rec.uprn)
                    .reduce((prev, curr) => (prev.logicalStatus < curr.logicalStatus ? prev : curr)).logicalStatus
                : propertyDataRef
                    .filter((x) => x.uprn === rec.uprn)
                    .reduce((prev, curr) => (prev.logicalStatus < curr.logicalStatus ? prev : curr)).logicalStatus
                ? propertyDataRef
                    .filter((x) => x.uprn === rec.uprn)
                    .reduce((prev, curr) => (prev.logicalStatus < curr.logicalStatus ? prev : curr)).logicalStatus
                : 5
            }, ${
              mapContext.currentProperty &&
              mapContext.currentProperty.uprn &&
              mapContext.currentProperty.uprn.toString() === rec.uprn.toString()
                ? mapContext.currentProperty.blpuClass === "PS"
                  ? "B"
                  : mapContext.currentProperty.blpuClass.substring(0, 1)
                : rec.classificationCode === "PS"
                ? "B"
                : rec.classificationCode.substring(0, 1)
            }`,
          },
        }));

    const extentFeatures =
      extentData.current &&
      extentData.current.map((rec, index) => ({
        geometry: {
          type: "polygon",
          rings: rec.geometry,
          spatialReference: { wkid: 27700 },
        },
        attributes: {
          ObjectID: index,
          PkId: rec.pkId,
          UPRN: rec.uprn,
          Code: rec.code,
          CodeLabel: GetProvenanceLabel(rec.code, isScottish.current),
        },
      }));

    const streetLayer = new FeatureLayer({
      id: streetLayerName,
      copyright: `© Copyright Idox Software Ltd. ${new Date().getFullYear()}`,
      source: streetFeatures,
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
        actions: [streetOpenAction, streetStreetViewAction],
      },
      renderer: streetRenderer,
      spatialReference: { wkid: 27700 },
      title: "Street layer",
    });

    if (userContext.current && userContext.current.currentUser.editProperty && streetLayer) {
      streetLayer.popupTemplate.actions = [
        streetOpenAction,
        streetAddProperty,
        streetAddRangeProperties,
        streetStreetViewAction,
      ];
    }

    const llpgStreetLayer = new FeatureLayer({
      id: llpgStreetLayerName,
      copyright: `© Copyright Idox Software Ltd. ${new Date().getFullYear()}`,
      source: llpgStreetFeatures,
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
        actions: [streetOpenAction, streetStreetViewAction],
      },
      renderer: streetRenderer,
      spatialReference: { wkid: 27700 },
      title: "LLPG Street layer",
    });

    if (userContext.current && userContext.current.currentUser.editProperty && llpgStreetLayer) {
      llpgStreetLayer.popupTemplate.actions = [
        streetOpenAction,
        streetAddProperty,
        streetAddRangeProperties,
        streetStreetViewAction,
      ];
    }

    const asd51Layer = new FeatureLayer({
      id: asd51LayerName,
      copyright: `© Copyright Idox Software Ltd. ${new Date().getFullYear()}`,
      source: asd51Features,
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
          name: "PkId",
          alias: "PkId",
          type: "string",
        },
        {
          name: "Description",
          alias: "Description",
          type: "string",
        },
        {
          name: "Custodian",
          alias: "Custodian",
          type: "string",
        },
        {
          name: "Authority",
          alias: "Authority",
          type: "string",
        },
        {
          name: "WholeRoad",
          alias: "WholeRoad",
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
                fieldName: "USRN",
              },
              {
                fieldName: "Custodian",
              },
              {
                fieldName: "Authority",
              },
              {
                fieldName: "WholeRoad",
                label: "Whole road / Part of road",
              },
            ],
          },
        ],
        actions: [asd51OpenAction],
      },
      renderer: asd51Renderer,
      spatialReference: { wkid: 27700 },
      title: "Maintenance responsibility layer",
    });

    const asd52Layer = new FeatureLayer({
      id: asd52LayerName,
      copyright: `© Copyright Idox Software Ltd. ${new Date().getFullYear()}`,
      source: asd52Features,
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
          name: "PkId",
          alias: "PkId",
          type: "string",
        },
        {
          name: "Description",
          alias: "Description",
          type: "string",
        },
        {
          name: "Custodian",
          alias: "Custodian",
          type: "string",
        },
        {
          name: "Authority",
          alias: "Authority",
          type: "string",
        },
        {
          name: "WholeRoad",
          alias: "WholeRoad",
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
                fieldName: "USRN",
              },
              {
                fieldName: "Custodian",
              },
              {
                fieldName: "Authority",
              },
              {
                fieldName: "WholeRoad",
                label: "Whole road / Part of road",
              },
            ],
          },
        ],
        actions: [asd52OpenAction],
      },
      renderer: asd52Renderer,
      spatialReference: { wkid: 27700 },
      title: "Reinstatement category layer",
    });

    const asd53Layer = new FeatureLayer({
      id: asd53LayerName,
      copyright: `© Copyright Idox Software Ltd. ${new Date().getFullYear()}`,
      source: asd53Features,
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
          name: "PkId",
          alias: "PkId",
          type: "string",
        },
        {
          name: "Description",
          alias: "Description",
          type: "string",
        },
        {
          name: "Custodian",
          alias: "Custodian",
          type: "string",
        },
        {
          name: "Authority",
          alias: "Authority",
          type: "string",
        },
        {
          name: "WholeRoad",
          alias: "WholeRoad",
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
                fieldName: "USRN",
              },
              {
                fieldName: "Custodian",
              },
              {
                fieldName: "Authority",
              },
              {
                fieldName: "WholeRoad",
                label: "Whole road / Part of road",
              },
            ],
          },
        ],
        actions: [asd53OpenAction],
      },
      renderer: asd53Renderer,
      spatialReference: { wkid: 27700 },
      title: "Special designation layer",
    });

    const asd61Layer = new FeatureLayer({
      id: asd61LayerName,
      copyright: `© Copyright Idox Software Ltd. ${new Date().getFullYear()}`,
      source: asd61Features,
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
          name: "PkId",
          alias: "PkId",
          type: "string",
        },
        {
          name: "Description",
          alias: "Description",
          type: "string",
        },
        {
          name: "Interest",
          alias: "Interest",
          type: "string",
        },
        {
          name: "Organisation",
          alias: "Organisation",
          type: "string",
        },
        {
          name: "District",
          alias: "District",
          type: "string",
        },
        {
          name: "WholeRoad",
          alias: "WholeRoad",
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
                fieldName: "USRN",
              },
              {
                fieldName: "Interest",
              },
              {
                fieldName: "Organisation",
              },
              {
                fieldName: "District",
              },
              {
                fieldName: "WholeRoad",
                label: "Whole road / Part of road",
              },
            ],
          },
        ],
        actions: [asd61OpenAction],
      },
      renderer: asd61Renderer,
      spatialReference: { wkid: 27700 },
      title: "Interest layer",
    });

    const asd62Layer = new FeatureLayer({
      id: asd62LayerName,
      copyright: `© Copyright Idox Software Ltd. ${new Date().getFullYear()}`,
      source: asd62Features,
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
          name: "PkId",
          alias: "PkId",
          type: "string",
        },
        {
          name: "Description",
          alias: "Description",
          type: "string",
        },
        {
          name: "Reinstatement",
          alias: "Reinstatement",
          type: "string",
        },
        {
          name: "Organisation",
          alias: "Organisation",
          type: "string",
        },
        {
          name: "District",
          alias: "District",
          type: "string",
        },
        {
          name: "WholeRoad",
          alias: "WholeRoad",
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
                fieldName: "USRN",
              },
              {
                fieldName: "Reinstatement",
              },
              {
                fieldName: "Organisation",
              },
              {
                fieldName: "District",
              },
              {
                fieldName: "WholeRoad",
                label: "Whole road / Part of road",
              },
            ],
          },
        ],
        actions: [asd62OpenAction],
      },
      renderer: asd62Renderer,
      spatialReference: { wkid: 27700 },
      title: "Construction layer",
    });

    const asd63Layer = new FeatureLayer({
      id: asd63LayerName,
      copyright: `© Copyright Idox Software Ltd. ${new Date().getFullYear()}`,
      source: asd63Features,
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
          name: "PkId",
          alias: "PkId",
          type: "string",
        },
        {
          name: "Description",
          alias: "Description",
          type: "string",
        },
        {
          name: "Organisation",
          alias: "Organisation",
          type: "string",
        },
        {
          name: "District",
          alias: "District",
          type: "string",
        },
        {
          name: "WholeRoad",
          alias: "WholeRoad",
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
                fieldName: "USRN",
              },
              {
                fieldName: "Organisation",
              },
              {
                fieldName: "District",
              },
              {
                fieldName: "WholeRoad",
                label: "Whole road / Part of road",
              },
            ],
          },
        ],
        actions: [asd63OpenAction],
      },
      renderer: asd63Renderer,
      spatialReference: { wkid: 27700 },
      title: "Special designation layer",
    });

    const asd64Layer = new FeatureLayer({
      id: asd64LayerName,
      copyright: `© Copyright Idox Software Ltd. ${new Date().getFullYear()}`,
      source: asd64Features,
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
          name: "PkId",
          alias: "PkId",
          type: "string",
        },
        {
          name: "Description",
          alias: "Description",
          type: "string",
        },
        {
          name: "Organisation",
          alias: "Organisation",
          type: "string",
        },
        {
          name: "District",
          alias: "District",
          type: "string",
        },
        {
          name: "WholeRoad",
          alias: "WholeRoad",
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
                fieldName: "USRN",
              },
              {
                fieldName: "Organisation",
              },
              {
                fieldName: "District",
              },
              {
                fieldName: "WholeRoad",
                label: "Whole road / Part of road",
              },
            ],
          },
        ],
        actions: [asd64OpenAction],
      },
      renderer: asd64Renderer,
      spatialReference: { wkid: 27700 },
      title: "Height, width & weight restriction layer",
    });

    const asd66Layer = new FeatureLayer({
      id: asd66LayerName,
      copyright: `© Copyright Idox Software Ltd. ${new Date().getFullYear()}`,
      source: asd66Features,
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
          name: "PkId",
          alias: "PkId",
          type: "string",
        },
        {
          name: "Description",
          alias: "Description",
          type: "string",
        },
        {
          name: "ProwStatus",
          alias: "ProwStatus",
          type: "string",
        },
        {
          name: "Organisation",
          alias: "Organisation",
          type: "string",
        },
        {
          name: "District",
          alias: "District",
          type: "string",
        },
        {
          name: "DefMapGeometryType",
          alias: "DefMapGeometryType",
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
                fieldName: "USRN",
              },
              {
                fieldName: "ProwStatus",
                label: "Status",
              },
              {
                fieldName: "Organisation",
              },
              {
                fieldName: "District",
              },
              {
                fieldName: "DefMapGeometryType",
                label: "Whole road / Part of road",
              },
            ],
          },
        ],
        actions: [asd66OpenAction],
      },
      renderer: asd66Renderer,
      spatialReference: { wkid: 27700 },
      title: "Public right of way layer",
    });

    const propertyLayer = new FeatureLayer({
      id: propertyLayerName,
      copyright: `© Copyright Idox Software Ltd. ${new Date().getFullYear()}`,
      source: propertyFeatures,
      featureReduction: PropertyFeatureReduction(8, 20, 20, 6),
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
          name: "FormattedAddress",
          alias: "FormattedAddress",
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
          name: "DisplayLogicalStatus",
          alias: "DisplayLogicalStatus",
          type: "integer",
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
        {
          name: "SymbolCode",
          alias: "SymbolCode",
          type: "string",
        },
      ],
      outFields: ["*"],
      objectIdField: "ObjectID",
      popupTemplate: {
        title: "{FormattedAddress}",
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
        actions: [
          propertyOpenAction,
          propertyAddChild,
          propertyAddRangeChildren,
          // propertyRadialSearchAction,
          // propertyAddToActivityListAction,
          propertyStreetViewAction,
          // propertyMenuAction,
        ],
      },
      renderer: propertyRenderer,
      spatialReference: { wkid: 27700 },
      title: "Property layer",
    });

    const extentLayer = new FeatureLayer({
      id: extentLayerName,
      copyright: `© Copyright Idox Software Ltd. ${new Date().getFullYear()}`,
      source: extentFeatures,
      fields: [
        {
          name: "ObjectID",
          alias: "ObjectID",
          type: "oid",
        },
        {
          name: "PkId",
          alias: "PkId",
          type: "string",
        },
        {
          name: "UPRN",
          alias: "UPRN",
          type: "string",
        },
        {
          name: "Code",
          alias: "Code",
          type: "string",
        },
        {
          name: "CodeLabel",
          alias: "Provenance",
          type: "string",
        },
      ],
      outFields: ["*"],
      objectIdField: "ObjectID",
      popupTemplate: {
        title: "Provenance",
        lastEditInfoEnabled: false,
        content: [
          {
            type: "fields",
            fieldInfos: [
              {
                fieldName: "UPRN",
              },
              {
                fieldName: "CodeLabel",
                label: "Provenance",
              },
            ],
          },
        ],
        // actions: [],
      },
      renderer: extentRenderer,
      spatialReference: { wkid: 27700 },
      title: "Provenance layer",
    });

    mapRef.current.remove(mapRef.current.findLayerById(streetLayerName));
    mapRef.current.remove(mapRef.current.findLayerById(llpgStreetLayerName));
    mapRef.current.remove(mapRef.current.findLayerById(asd51LayerName));
    mapRef.current.remove(mapRef.current.findLayerById(asd52LayerName));
    mapRef.current.remove(mapRef.current.findLayerById(asd53LayerName));
    mapRef.current.remove(mapRef.current.findLayerById(asd61LayerName));
    mapRef.current.remove(mapRef.current.findLayerById(asd62LayerName));
    mapRef.current.remove(mapRef.current.findLayerById(asd63LayerName));
    mapRef.current.remove(mapRef.current.findLayerById(asd64LayerName));
    mapRef.current.remove(mapRef.current.findLayerById(asd66LayerName));
    mapRef.current.remove(mapRef.current.findLayerById(extentLayerName));
    mapRef.current.remove(mapRef.current.findLayerById(propertyLayerName));
    mapRef.current.remove(mapRef.current.findLayerById(zoomGraphicsLayerName));

    // const editingGraphic = editingObject.current && editingObject.current.objectType;

    if (streetDataRef && streetDataRef.length > 0) {
      mapRef.current.add(streetLayer);
      if (editingGraphic) streetLayer.popupEnabled = false;
    }
    if (llpgStreetDataRef && llpgStreetDataRef.length > 0) {
      mapRef.current.add(llpgStreetLayer);
      if (editingGraphic) llpgStreetLayer.popupEnabled = false;
    }
    if (asdType51DataRef && asdType51DataRef.length > 0) {
      mapRef.current.add(asd51Layer);
      if (editingGraphic) asd51Layer.popupEnabled = false;
    }
    if (asdType52DataRef && asdType52DataRef.length > 0) {
      mapRef.current.add(asd52Layer);
      if (editingGraphic) asd52Layer.popupEnabled = false;
    }
    if (asdType53DataRef && asdType53DataRef.length > 0) {
      mapRef.current.add(asd53Layer);
      if (editingGraphic) asd53Layer.popupEnabled = false;
    }
    if (asdType61DataRef && asdType61DataRef.length > 0) {
      mapRef.current.add(asd61Layer);
      if (editingGraphic) asd61Layer.popupEnabled = false;
    }
    if (asdType62DataRef && asdType62DataRef.length > 0) {
      mapRef.current.add(asd62Layer);
      if (editingGraphic) asd62Layer.popupEnabled = false;
    }
    if (asdType63DataRef && asdType63DataRef.length > 0) {
      mapRef.current.add(asd63Layer);
      if (editingGraphic) asd63Layer.popupEnabled = false;
    }
    if (asdType64DataRef && asdType64DataRef.length > 0) {
      mapRef.current.add(asd64Layer);
      if (editingGraphic) asd64Layer.popupEnabled = false;
    }
    if (asdType66DataRef && asdType66DataRef.length > 0) {
      mapRef.current.add(asd66Layer);
      if (editingGraphic) asd66Layer.popupEnabled = false;
    }
    if (extentData.current && extentData.current.length > 0) {
      mapRef.current.add(extentLayer);
      if (editingGraphic) extentLayer.popupEnabled = false;
    }
    if (propertyDataRef && propertyDataRef.length > 0) {
      mapRef.current.add(propertyLayer);
      if (editingGraphic) propertyLayer.popupEnabled = false;
    }
    mapRef.current.add(zoomGraphicsLayer.current);
    if (!mapRef.current.findLayerById(editGraphicsLayerName)) {
      mapRef.current.add(editGraphicsLayer.current);
    } else if (mapContext.currentSearchData.editProperty) {
      const currentEditIndex = mapRef.current.layers.indexOf(editGraphicsLayer.current);
      const requiredEditIndex = mapRef.current.layers.length - 1;
      if (currentEditIndex !== requiredEditIndex) mapRef.current.reorder(editGraphicsLayer.current, requiredEditIndex);
    }

    setASDLayerVisibility(51, asd51Layer, streetContext.currentRecord);
    setASDLayerVisibility(52, asd52Layer, streetContext.currentRecord);
    setASDLayerVisibility(53, asd53Layer, streetContext.currentRecord);
    setASDLayerVisibility(61, asd61Layer, streetContext.currentRecord);
    setASDLayerVisibility(62, asd62Layer, streetContext.currentRecord);
    setASDLayerVisibility(63, asd63Layer, streetContext.currentRecord);
    setASDLayerVisibility(64, asd64Layer, streetContext.currentRecord);
    setASDLayerVisibility(66, asd66Layer, streetContext.currentRecord);

    zoomGraphicsLayer.current.graphics.removeAll();

    if (mapContext.currentLayers.zoomStreet) {
      let addedEsuList = [];
      if (zoomStreetDataRef)
        zoomStreetDataRef.forEach((street) => {
          if (!addedEsuList.includes(street.esuId)) {
            zoomGraphicsLayer.current.graphics.add(createPolylineGraphic(street.geometry));
            addedEsuList.push(street.esuId);
          }
        });
    } else if (mapContext.currentLayers.zoomProperty) {
      let addedUprnList = [];
      zoomPropertyDataRef.forEach((property) => {
        if (!addedUprnList.includes(property.uprn)) {
          zoomGraphicsLayer.current.graphics.add(
            createPointGraphic(
              property.easting,
              property.northing,
              property.logicalStatus,
              property.classificationCode.substring(0, 1),
              true
            )
          );
          addedUprnList.push(property.uprn);
        }
      });
    }

    streetLayer.when(
      function () {
        if (
          !mapContext.currentLayers.zoomStreet &&
          !mapContext.currentLayers.zoomProperty &&
          (!editingObject.current || editingObject.current.objectType !== 13)
        ) {
          if (propertyLayer.fullExtent) {
            backgroundExtent.current = {
              xmin:
                (streetLayer.fullExtent.xmin < propertyLayer.fullExtent.xmin
                  ? streetLayer.fullExtent.xmin
                  : propertyLayer.fullExtent.xmin) - extentBorder,
              ymin:
                (streetLayer.fullExtent.ymin < propertyLayer.fullExtent.ymin
                  ? streetLayer.fullExtent.ymin
                  : propertyLayer.fullExtent.ymin) - extentBorder,
              xmax:
                (streetLayer.fullExtent.xmax > propertyLayer.fullExtent.xmax
                  ? streetLayer.fullExtent.xmax
                  : propertyLayer.fullExtent.xmax) + extentBorder,
              ymax:
                (streetLayer.fullExtent.ymax > propertyLayer.fullExtent.ymax
                  ? streetLayer.fullExtent.ymax
                  : propertyLayer.fullExtent.ymax) + extentBorder,
              spatialReference: { wkid: 27700 },
              zoomLevel: view.zoom,
            };
          } else if (streetLayer.fullExtent) {
            backgroundExtent.current = {
              xmin: streetLayer.fullExtent.xmin - extentBorder,
              ymin: streetLayer.fullExtent.ymin - extentBorder,
              xmax: streetLayer.fullExtent.xmax + extentBorder,
              ymax: streetLayer.fullExtent.ymax + extentBorder,
              spatialReference: { wkid: 27700 },
              zoomLevel: view.zoom,
            };
          }
          view.extent = backgroundExtent.current;
        }
      },
      function (error) {
        if (error && userContext.current.currentUser.showMessages) {
          console.error("Error loading street layer: ", error);
        }
      }
    );

    llpgStreetLayer.when(
      function () {
        if (
          !mapContext.currentLayers.zoomStreet &&
          !mapContext.currentLayers.zoomProperty &&
          (!editingObject.current || editingObject.current.objectType !== 13)
        ) {
          if (propertyLayer.fullExtent) {
            backgroundExtent.current = {
              xmin:
                (llpgStreetLayer.fullExtent.xmin < propertyLayer.fullExtent.xmin
                  ? llpgStreetLayer.fullExtent.xmin
                  : propertyLayer.fullExtent.xmin) - extentBorder,
              ymin:
                (llpgStreetLayer.fullExtent.ymin < propertyLayer.fullExtent.ymin
                  ? llpgStreetLayer.fullExtent.ymin
                  : propertyLayer.fullExtent.ymin) - extentBorder,
              xmax:
                (llpgStreetLayer.fullExtent.xmax > propertyLayer.fullExtent.xmax
                  ? llpgStreetLayer.fullExtent.xmax
                  : propertyLayer.fullExtent.xmax) + extentBorder,
              ymax:
                (llpgStreetLayer.fullExtent.ymax > propertyLayer.fullExtent.ymax
                  ? llpgStreetLayer.fullExtent.ymax
                  : propertyLayer.fullExtent.ymax) + extentBorder,
              spatialReference: { wkid: 27700 },
              zoomLevel: view.zoom,
            };
          } else if (llpgStreetLayer.fullExtent) {
            backgroundExtent.current = {
              xmin: llpgStreetLayer.fullExtent.xmin - extentBorder,
              ymin: llpgStreetLayer.fullExtent.ymin - extentBorder,
              xmax: llpgStreetLayer.fullExtent.xmax + extentBorder,
              ymax: llpgStreetLayer.fullExtent.ymax + extentBorder,
              spatialReference: { wkid: 27700 },
              zoomLevel: view.zoom,
            };
          }
          view.extent = backgroundExtent.current;
        }
      },
      function (error) {
        if (error && userContext.current.currentUser.showMessages) {
          console.error("Error loading LLPG street layer: ", error);
        }
      }
    );

    propertyLayer.when(
      function () {
        if (
          !mapContext.currentLayers.zoomStreet &&
          !mapContext.currentLayers.zoomProperty &&
          (!editingObject.current || editingObject.current.objectType !== 22)
        ) {
          if (streetLayer.fullExtent) {
            backgroundExtent.current = {
              xmin:
                (streetLayer.fullExtent.xmin < propertyLayer.fullExtent.xmin
                  ? streetLayer.fullExtent.xmin
                  : propertyLayer.fullExtent.xmin) - extentBorder,
              ymin:
                (streetLayer.fullExtent.ymin < propertyLayer.fullExtent.ymin
                  ? streetLayer.fullExtent.ymin
                  : propertyLayer.fullExtent.ymin) - extentBorder,
              xmax:
                (streetLayer.fullExtent.xmax > propertyLayer.fullExtent.xmax
                  ? streetLayer.fullExtent.xmax
                  : propertyLayer.fullExtent.xmax) + extentBorder,
              ymax:
                (streetLayer.fullExtent.ymax > propertyLayer.fullExtent.ymax
                  ? streetLayer.fullExtent.ymax
                  : propertyLayer.fullExtent.ymax) + extentBorder,
              spatialReference: { wkid: 27700 },
              zoomLevel: view.zoom,
            };
          } else if (llpgStreetLayer.fullExtent) {
            backgroundExtent.current = {
              xmin:
                (llpgStreetLayer.fullExtent.xmin < propertyLayer.fullExtent.xmin
                  ? llpgStreetLayer.fullExtent.xmin
                  : propertyLayer.fullExtent.xmin) - extentBorder,
              ymin:
                (llpgStreetLayer.fullExtent.ymin < propertyLayer.fullExtent.ymin
                  ? llpgStreetLayer.fullExtent.ymin
                  : propertyLayer.fullExtent.ymin) - extentBorder,
              xmax:
                (llpgStreetLayer.fullExtent.xmax > propertyLayer.fullExtent.xmax
                  ? llpgStreetLayer.fullExtent.xmax
                  : propertyLayer.fullExtent.xmax) + extentBorder,
              ymax:
                (llpgStreetLayer.fullExtent.ymax > propertyLayer.fullExtent.ymax
                  ? llpgStreetLayer.fullExtent.ymax
                  : propertyLayer.fullExtent.ymax) + extentBorder,
              spatialReference: { wkid: 27700 },
              zoomLevel: view.zoom,
            };
          } else if (propertyLayer.fullExtent) {
            backgroundExtent.current = {
              xmin: propertyLayer.fullExtent.xmin - extentBorder,
              ymin: propertyLayer.fullExtent.ymin - extentBorder,
              xmax: propertyLayer.fullExtent.xmax + extentBorder,
              ymax: propertyLayer.fullExtent.ymax + extentBorder,
              spatialReference: { wkid: 27700 },
              zoomLevel: view.zoom,
            };
          }
          view.extent = backgroundExtent.current;
        }
      },
      function (error) {
        if (error && userContext.current.currentUser.showMessages) {
          console.error("Error loading property layer: ", error);
        }
      }
    );

    if (mapContext.currentLayers.zoomProperty && zoomPropertyDataRef && zoomPropertyDataRef.length > 0) {
      backgroundExtent.current = {
        xmin: zoomPropertyDataRef[0].easting - extentBorder,
        ymin: zoomPropertyDataRef[0].northing - extentBorder,
        xmax: zoomPropertyDataRef[0].easting + extentBorder,
        ymax: zoomPropertyDataRef[0].northing + extentBorder,
        spatialReference: { wkid: 27700 },
        zoomLevel: view.zoom,
      };
      view.extent = backgroundExtent.current;
    } else if (mapContext.currentLayers.zoomStreet && zoomStreetDataRef && zoomStreetDataRef.length > 0) {
      let minX = 9999999.999;
      let minY = 9999999.999;
      let maxX = 0.0;
      let maxY = 0.0;

      zoomStreetDataRef.forEach((street) => {
        street.geometry.forEach((coord) => {
          if (coord[0] < minX) minX = coord[0];
          if (coord[1] < minY) minY = coord[1];
          if (coord[0] > maxX) maxX = coord[0];
          if (coord[1] > maxY) maxY = coord[1];
        });
      });

      backgroundExtent.current = {
        xmin: minX - extentBorder,
        ymin: minY - extentBorder,
        xmax: maxX + extentBorder,
        ymax: maxY + extentBorder,
        spatialReference: { wkid: 27700 },
        zoomLevel: view.zoom,
      };
      view.extent = backgroundExtent.current;
    }

    view.on("layerview-create", function (event) {
      if (loading && baseMappingLayerIds.current.includes(event.layer.id)) setLoading(false);
    });

    view.on("click", function (event) {
      if (
        coordinateConversionRef.current &&
        coordinateConversionRef.current.mode === "capture" &&
        currentPointCaptureModeRef.current
      ) {
        switch (currentPointCaptureModeRef.current) {
          case "divideEsu":
            if (refStreetData.current && refStreetData.current.length > 0) {
              refStreetData.current.forEach((street) => {
                if (
                  editingObject.current &&
                  editingObject.current.objectId &&
                  street.esuId === editingObject.current.objectId
                ) {
                  const divideEsuGeometry = new Polyline({
                    type: "polyline",
                    paths: street.geometry,
                    spatialReference: { wkid: 27700 },
                  });

                  const dividePoint = geometryEngine.nearestCoordinate(divideEsuGeometry, event.mapPoint);

                  let cutLine = null;

                  if (dividePoint.distance !== 0) {
                    cutLine = new Polyline({
                      type: "polyline",
                      paths: [
                        [event.mapPoint.x, event.mapPoint.y],
                        [dividePoint.coordinate.x, dividePoint.coordinate.y],
                      ],
                      spatialReference: { wkid: 27700 },
                    });
                  } else {
                    let tempCutLine = new Polyline({
                      type: "polyline",
                      paths: [
                        [dividePoint.coordinate.x, dividePoint.coordinate.y],
                        street.geometry[dividePoint.vertexIndex],
                      ],
                      spatialReference: { wkid: 27700 },
                    });

                    if (geometryEngine.planarLength(tempCutLine) !== 0) {
                      cutLine = geometryEngine.rotate(tempCutLine, 90, dividePoint.coordinate);
                    } else {
                      if (dividePoint.vertexIndex > 0)
                        tempCutLine = new Polyline({
                          type: "polyline",
                          paths: [
                            [dividePoint.coordinate.x, dividePoint.coordinate.y],
                            street.geometry[dividePoint.vertexIndex - 1],
                          ],
                          spatialReference: { wkid: 27700 },
                        });
                      else if (dividePoint.vertexIndex + 1 < street.geometry.length) {
                        tempCutLine = new Polyline({
                          type: "polyline",
                          paths: [
                            [dividePoint.coordinate.x, dividePoint.coordinate.y],
                            street.geometry[dividePoint.vertexIndex + 1],
                          ],
                          spatialReference: { wkid: 27700 },
                        });

                        if (geometryEngine.planarLength(tempCutLine) !== 0)
                          cutLine = geometryEngine.rotate(tempCutLine, 90, dividePoint.coordinate);
                      }
                    }
                  }

                  if (cutLine) {
                    const newEsus = geometryEngine.cut(divideEsuGeometry, cutLine);

                    if (newEsus && newEsus.length === 2) mapContext.onEsuDivided(newEsus[0], newEsus[1]);
                    else if (userContext.current.currentUser.showMessages)
                      console.log("[DEBUG] Unable to divide the ESU", newEsus);
                  } else if (userContext.current.currentUser.showMessages)
                    console.log("[DEBUG] Run out of options on how to divide the ESU");
                }
              });
            }

            editingObject.current = null;
            break;

          default:
            mapContext.onSetCoordinate({
              x: event.mapPoint.x.toFixed(4),
              y: event.mapPoint.y.toFixed(4),
            });
            break;
        }

        coordinateConversionRef.current.mode = "live";
        event.stopPropagation();
        return;
      }

      const coord = `${event.mapPoint.x},${event.mapPoint.y}`;

      let foundFeatureLayer = false;
      let featureLayer;

      if (editingObject.current && editingObject.current.objectType) {
        switch (editingObject.current.objectType) {
          case 13:
            featureLayer = baseLayersFeature.current.find((x) => x.layer.esuSnap);
            foundFeatureLayer = !!featureLayer;
            break;

          case 22:
            featureLayer = baseLayersFeature.current.find((x) => x.layer.extentSnap);
            foundFeatureLayer = !!featureLayer;
            break;

          default:
            foundFeatureLayer = false;
            break;
        }
      }

      if (foundFeatureLayer) {
        event.stopPropagation();

        let geoJson = null;

        if (geoJSONFeatures.current && geoJSONFeatures.current.length > 0) {
          geoJson = geoJSONFeatures.current.find((x) => x.id === featureLayer.layer.layerId);
        }

        const foundExistingGeoJson = !!geoJson;

        if (!foundExistingGeoJson) {
          geoJson = {
            id: featureLayer.layer.layerId,
            featureCollection: { type: "FeatureCollection", features: [] },
          };
        }

        let graphics = null;
        const currentLayer = mapRef.current && mapRef.current.findLayerById(featureLayer.layer.layerId);
        const opts = { include: [currentLayer, editGraphicsLayer.current] };

        if (currentLayer) {
          view.hitTest(event, opts).then(function (response) {
            const clickedEditGraphic = response.results.find((x) => x.graphic.layer.id === editGraphicsLayerName);
            let newGraphics;
            switch (featureLayer.layer.geometryType) {
              case "line":
                const layerIndex = mapRef.current.layers.indexOf(currentLayer);

                const clickedGraphic = currentLayer.graphics.find(
                  (x) => x.attributes && x.attributes.ID === response.results[0].graphic.attributes.ID
                );

                let newSelectedGraphics;

                if (
                  selectedLines.current.find(
                    (x) => x.attributes && x.attributes.ID === response.results[0].graphic.attributes.ID
                  )
                ) {
                  newSelectedGraphics = selectedLines.current.filter(
                    (x) => x.attributes && x.attributes.ID !== response.results[0].graphic.attributes.ID
                  );
                  clickedGraphic.symbol = unselectedLineSymbol.current;
                } else {
                  clickedGraphic.symbol = selectedLineSymbol.current;
                  newSelectedGraphics = selectedLines.current;
                  newSelectedGraphics.push(clickedGraphic);
                }

                selectedLines.current = newSelectedGraphics;

                newGraphics = currentLayer.graphics.map(
                  (x) => [clickedGraphic].find((line) => line.attributes.ID === x.attributes.ID) || x
                );

                setDisplayESUMergeTool(newSelectedGraphics.length > 0);

                const updatedLayer = new GraphicsLayer({
                  id: currentLayer.id,
                  graphics: newGraphics,
                  copyright: currentLayer.copyright,
                  title: currentLayer.title,
                  listMode: currentLayer.listMode,
                  maxScale: currentLayer.maxScale,
                  minScale: currentLayer.minScale,
                  opacity: currentLayer.opacity,
                  visible: currentLayer.visible,
                });

                mapRef.current.remove(currentLayer);
                mapRef.current.add(updatedLayer, layerIndex);
                break;

              case "polygon":
                if (!clickedEditGraphic) {
                  if (
                    response.results.length &&
                    (!lastSelectedExtent.current ||
                      response.results[0].graphic.attributes.TOID !== lastSelectedExtent.current.toid ||
                      performance.now() - lastSelectedExtent.current.time > doubleEventWait)
                  ) {
                    lastSelectedExtent.current = {
                      toid: response.results[0].graphic.attributes.TOID,
                      time: performance.now(),
                    };
                    newGraphics = currentLayer.graphics.filter(
                      (x) => x.attributes && x.attributes.TOID !== response.results[0].graphic.attributes.TOID
                    );

                    const layerIndex = mapRef.current.layers.indexOf(currentLayer);

                    setDisplayExtentMergeTool(newGraphics.length > 0);

                    const updatedLayer = new GraphicsLayer({
                      id: currentLayer.id,
                      graphics: newGraphics,
                      copyright: currentLayer.copyright,
                      title: currentLayer.title,
                      listMode: currentLayer.listMode,
                      maxScale: currentLayer.maxScale,
                      minScale: currentLayer.minScale,
                      opacity: currentLayer.opacity,
                      visible: currentLayer.visible,
                    });

                    const newSelected = [...new Set(newGraphics.map((x) => x.attributes.TOID))];
                    setSelectedExtents(newSelected);
                    if (newSelected.length > 0) {
                      setSelectionAnchorEl(document.getElementById("ads-provenance-data-tab"));
                      setDisplayExtentMergeTool(true);
                    } else {
                      setSelectionAnchorEl(null);
                      setDisplayExtentMergeTool(false);
                    }

                    mapRef.current.remove(currentLayer);
                    mapRef.current.add(updatedLayer, layerIndex);
                  } else {
                    GetFeatureAtCoord(coord, featureLayer.layer).then(function (json) {
                      if (json) {
                        geoJson.featureCollection.features.push.apply(
                          geoJson.featureCollection.features,
                          json.data.features
                        );

                        if (!foundExistingGeoJson) geoJSONFeatures.current.push(geoJson);

                        if (geoJson.featureCollection.features.length > 0) {
                          graphics = geoJson.featureCollection.features.map(function (f) {
                            switch (featureLayer.layer.geometryType) {
                              case "line":
                                const polyline = {
                                  type: "polyline",
                                  paths: f.geometry.coordinates[0],
                                  spatialReference: { wkid: 27700 },
                                };

                                const lineSymbol = {
                                  type: "simple-line",
                                  color: [51, 136, 255, 0.5],
                                  width: 1,
                                };

                                return new Graphic({
                                  geometry: polyline,
                                  attributes: f.properties,
                                  symbol: lineSymbol,
                                });

                              case "polygon":
                                const polygon = {
                                  type: "polygon",
                                  rings: f.geometry.coordinates[0],
                                  spatialReference: { wkid: 27700 },
                                };

                                const fillSymbol = {
                                  type: "simple-fill",
                                  color: [51, 136, 255, 0.5],
                                  outline: {
                                    color: [51, 136, 255],
                                    width: 0,
                                  },
                                };

                                return new Graphic({
                                  geometry: polygon,
                                  attributes: f.properties,
                                  symbol: fillSymbol,
                                });

                              default:
                                return null;
                            }
                          });

                          const layerIndex = mapRef.current.layers.indexOf(currentLayer);

                          const updatedFeatureLayer = new GraphicsLayer({
                            id: featureLayer.layer.layerId,
                            graphics: graphics,
                            copyright:
                              featureLayer.layer.copyright && featureLayer.layer.copyright.includes("<<year>>")
                                ? featureLayer.layer.copyright.replace("<<year>>", new Date().getFullYear().toString())
                                : featureLayer.layer.copyright,
                            title: featureLayer.layer.title,
                            listMode: featureLayer.layer.displayInList ? "show" : "hide",
                            maxScale: featureLayer.layer.maxScale,
                            minScale: featureLayer.layer.minScale,
                            opacity: featureLayer.layer.opacity,
                            visible: currentLayer.visible,
                          });

                          mapRef.current.remove(currentLayer);
                          mapRef.current.add(updatedFeatureLayer, layerIndex);

                          const newSelected = [...new Set(graphics.map((x) => x.attributes.TOID))];
                          setSelectedExtents(newSelected);
                          if (newSelected.length > 0) {
                            setSelectionAnchorEl(document.getElementById("ads-provenance-data-tab"));
                            setDisplayExtentMergeTool(true);
                          } else {
                            setSelectionAnchorEl(null);
                            setDisplayExtentMergeTool(false);
                          }
                        }
                      }
                    });
                  }
                }
                break;

              default:
                break;
            }
          });
        }
      } else {
        const streetLayer = mapRef.current && mapRef.current.findLayerById(streetLayerName);
        let opts = { include: streetLayer };

        if (streetLayer) {
          view.hitTest(event, opts).then(function (response) {
            if (
              currentPointCaptureModeRef.current === "assignEsu" &&
              response.results.length &&
              (!lastSelectedEsu.current ||
                Number(response.results[0].graphic.attributes.EsuId) !== lastSelectedEsu.current.esuId ||
                performance.now() - lastSelectedEsu.current.time > doubleEventWait)
            ) {
              lastSelectedEsu.current = {
                esuId: Number(response.results[0].graphic.attributes.EsuId),
                time: performance.now(),
              };
              const currentIndex = selectedEsus.current.indexOf(Number(response.results[0].graphic.attributes.EsuId));
              const newList = [...selectedEsus.current];

              if (currentIndex === -1) newList.push(Number(response.results[0].graphic.attributes.EsuId));
              else newList.splice(currentIndex, 1);

              selectedEsus.current = newList;

              if (newList.length > 0) {
                setSelectionAnchorEl(document.getElementById("ads-esu-data-grid"));
                mapContext.onHighlightListItem("esu", newList);
              } else {
                setSelectionAnchorEl(null);
                mapContext.onHighlightClear();
              }
            } else if (
              response.results.length &&
              streetContext.currentStreet &&
              response.results[0].graphic.attributes.USRN.toString() === streetContext.currentStreet.usrn.toString()
            ) {
              if (
                !lastSelectedEsu.current ||
                Number(response.results[0].graphic.attributes.EsuId) !== lastSelectedEsu.current.esuId ||
                performance.now() - lastSelectedEsu.current.time > doubleEventWait
              ) {
                lastSelectedEsu.current = {
                  esuId: Number(response.results[0].graphic.attributes.EsuId),
                  time: performance.now(),
                };
                streetContext.onEsuSelected(Number(response.results[0].graphic.attributes.EsuId));
              }
            } else {
              streetContext.onEsuSelected(null);
            }
          });
        }

        if (currentPointCaptureModeRef.current === "assignEsu") {
          if (backgroundStreetLayerRef.current) {
            opts = { include: backgroundStreetLayerRef.current };
            view.hitTest(event, opts).then(function (response) {
              if (
                response.results.length &&
                (!lastSelectedEsu.current ||
                  Number(response.results[0].graphic.attributes.EsuId) !== lastSelectedEsu.current.esuId ||
                  performance.now() - lastSelectedEsu.current.time > doubleEventWait)
              ) {
                lastSelectedEsu.current = {
                  esuId: Number(response.results[0].graphic.attributes.EsuId),
                  time: performance.now(),
                };
                const currentIndex = selectedEsus.current.indexOf(Number(response.results[0].graphic.attributes.EsuId));
                const newList = [...selectedEsus.current];

                if (currentIndex === -1) newList.push(Number(response.results[0].graphic.attributes.EsuId));
                else newList.splice(currentIndex, 1);

                selectedEsus.current = newList;

                if (newList.length > 0) {
                  setSelectionAnchorEl(document.getElementById("ads-esu-data-grid"));
                  mapContext.onHighlightListItem("esu", newList);
                } else {
                  setSelectionAnchorEl(null);
                  mapContext.onHighlightClear();
                }
              }
            });
          }

          if (unassignedEsusLayerRef.current) {
            opts = { include: unassignedEsusLayerRef.current };
            view.hitTest(event, opts).then(function (response) {
              if (
                response.results.length &&
                (!lastSelectedEsu.current ||
                  Number(response.results[0].graphic.attributes.EsuId) !== lastSelectedEsu.current.esuId ||
                  performance.now() - lastSelectedEsu.current.time > doubleEventWait)
              ) {
                lastSelectedEsu.current = {
                  esuId: Number(response.results[0].graphic.attributes.EsuId),
                  time: performance.now(),
                };
                const currentIndex = selectedEsus.current.indexOf(Number(response.results[0].graphic.attributes.EsuId));
                const newList = [...selectedEsus.current];

                if (currentIndex === -1) newList.push(Number(response.results[0].graphic.attributes.EsuId));
                else newList.splice(currentIndex, 1);

                selectedEsus.current = newList;

                if (newList.length > 0) {
                  setSelectionAnchorEl(document.getElementById("ads-esu-data-grid"));
                  mapContext.onHighlightListItem("esu", newList);
                } else {
                  setSelectionAnchorEl(null);
                  mapContext.onHighlightClear();
                }
              }
            });
          }
        }
      }
    });

    async function GetFeatureAtCoord(coord, layer) {
      switch (layer.serviceProvider) {
        case "OS":
          const osFeature = await GetOSFeatureAtCoord(coord, layer);
          return osFeature;

        case "viaEuropa":
          const viaEuropaFeature = await GetViaEuropaFeatureAtCoord(coord, layer);
          return viaEuropaFeature;

        case "thinkWare":
          const thinkWareFeature = await GetThinkWareFeatureAtCoord(coord, layer);
          return thinkWareFeature;

        default:
          alert(`Unknown service provider: ${layer.serviceProvider}`);
          break;
      }
    }

    function GetOSFeatureAtCoord(coord, layer) {
      const wfsParams = {
        key: layer.layerKey,
        service: "WFS",
        request: "GetFeature",
        version: "2.0.0",
        typeNames: layer.activeLayerId,
        propertyName: layer.propertyName,
        outputFormat: "GEOJSON",
        srsName: "urn:ogc:def:crs:EPSG::27700",
        filter: `<ogc:Filter><ogc:Contains><ogc:PropertyName>SHAPE</ogc:PropertyName><gml:Point srsName="urn:ogc:def:crs:EPSG::27700"><gml:coordinates>${coord}</gml:coordinates></gml:Point></ogc:Contains></ogc:Filter>`,
        count: 1,
      };

      const options = {
        responseType: "json",
      };

      const encodedParameters = Object.keys(wfsParams)
        .map((paramName) => paramName + "=" + encodeURI(wfsParams[paramName]))
        .join("&");

      const url = layer.url + "?" + encodedParameters;

      return esriRequest(url, options)
        .then(function (response) {
          return response;
        })
        .catch((error) => {
          if (userContext.current.currentUser.showMessages) console.error("[ERROR] getting function", { error: error });
        });
    }

    function GetViaEuropaFeatureAtCoord(coord, layer) {
      const wfsParams = {
        service: "WFS",
        request: "GetFeature",
        typeNames: layer.activeLayerId,
        propertyName: layer.propertyName,
        outputFormat: "JSON",
        filter: `<Filter xmlns:gml="http://www.opengis.net/gml"><Intersects><PropertyName>geom</PropertyName><gml:Point srsName="27700"><gml:coordinates>${coord}</gml:coordinates></gml:Point></Intersects></Filter>`,
      };

      const options = {
        responseType: "json",
      };

      const encodedParameters = Object.keys(wfsParams)
        .map((paramName) => paramName + "=" + encodeURI(wfsParams[paramName]))
        .join("&");

      const url = `${layer.url}/${layer.layerKey}/wfs?${encodedParameters}`;

      return esriRequest(url, options)
        .then(function (response) {
          return response;
        })
        .catch((error) => {
          if (userContext.current.currentUser.showMessages) console.error("[ERROR] getting function", { error: error });
        });
    }

    function GetThinkWareFeatureAtCoord(coord, layer) {
      const wfsParams = {
        service: "WFS",
        request: "GetFeature",
        version: "2.0",
        srsName: "urn:x-ogc:def:crs:EPSG:27700",
        typeName: layer.activeLayerId,
        outputFormat: "json",
        propertyName: layer.propertyName,
        filter: `<Filter xmlns="http://www.opengis.net/ogc"><Intersects><PropertyName>polygon</PropertyName><Point srsName="EPSG:27700"><coordinates>${coord}</coordinates></Point></Intersects></Filter>`,
        count: 1,
      };

      const options = {
        responseType: "json",
      };

      const encodedParameters = Object.keys(wfsParams)
        .map((paramName) => paramName + "=" + encodeURI(wfsParams[paramName]))
        .join("&");

      const url = layer.url + "?" + encodedParameters;

      return esriRequest(url, options)
        .then(function (response) {
          return response;
        })
        .catch((error) => {
          if (userContext.current.currentUser.showMessages) console.error("[ERROR] getting function", { error: error });
        });
    }

    view
      .when()
      .then(() => {
        // When the user toggles a layer on or off, transition
        // the layer's visibility using opacity
        layerListRef.current.operationalItems.forEach((item) => {
          item.watch("visible", (visible) => {
            if (visible) {
              fadeVisibilityOn(item.layer);
            }
          });
        });
      })
      .catch((error) => {
        if (userContext.current.currentUser.showMessages) console.error("Error loading map view: ", error);
      });

    layerListRef.current.on("trigger-action", (event) => {
      switch (event.action.id) {
        case "edit-layer-info":
          // if (editGraphicsLayer.current.loaded)
          break;

        case "increase-street-opacity":
          if (streetLayer.opacity < 1) streetLayer.opacity += 0.25;
          break;

        case "decrease-street-opacity":
          if (streetLayer.opacity > 0) streetLayer.opacity -= 0.25;
          break;

        case "increase-llpg-street-opacity":
          if (llpgStreetLayer.opacity < 1) llpgStreetLayer.opacity += 0.25;
          break;

        case "decrease-llpg-street-opacity":
          if (llpgStreetLayer.opacity > 0) llpgStreetLayer.opacity -= 0.25;
          break;

        case "increase-extent-opacity":
          if (extentLayer.opacity < 1) extentLayer.opacity += 0.25;
          break;

        case "decrease-extent-opacity":
          if (extentLayer.opacity > 0) extentLayer.opacity -= 0.25;
          break;

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

        case "increase-background-provenance-opacity":
          if (backgroundProvenanceLayerRef.current.opacity < 1) backgroundProvenanceLayerRef.current.opacity += 0.25;
          break;

        case "decrease-background-provenance-opacity":
          if (backgroundProvenanceLayerRef.current.opacity > 0) backgroundProvenanceLayerRef.current.opacity -= 0.25;
          break;

        case "increase-background-property-opacity":
          if (backgroundPropertyLayerRef.current.opacity < 1) backgroundPropertyLayerRef.current.opacity += 0.25;
          break;

        case "decrease-background-property-opacity":
          if (backgroundPropertyLayerRef.current.opacity > 0) backgroundPropertyLayerRef.current.opacity -= 0.25;
          break;

        case "increase-property-opacity":
          if (propertyLayer.opacity < 1) propertyLayer.opacity += 0.25;
          break;

        case "decrease-property-opacity":
          if (propertyLayer.opacity > 0) propertyLayer.opacity -= 0.25;
          break;

        case "close-shp-file":
          mapContext.onUnloadShpFile(event.item.layer.id);
          break;

        case "download-features":
          const clickedFeatureLayer = baseLayersFeature.current.find((x) => x.layer.layerId === event.item.layer.id);
          if (clickedFeatureLayer) {
            GetMoreFeatures(clickedFeatureLayer);
          }
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

    if (sketchCreateEvent.current) sketchCreateEvent.current.remove();

    sketchCreateEvent.current = sketchRef.current.on("create", (event) => {
      if (event.state === "start") {
        editGraphicsLayer.current.graphics.removeAll();
      }

      switch (event.tool) {
        case "point":
          if (event.state === "complete" || event.type === "undo" || event.type === "redo") {
            mapContext.onSetCoordinate({
              x: event.graphic.geometry.x.toFixed(4),
              y: event.graphic.geometry.y.toFixed(4),
            });
          }
          break;

        case "polyline":
          if (
            event.state === "complete" ||
            event.type === "undo" ||
            event.type === "redo" ||
            (event.graphic.geometry &&
              event.graphic.geometry.paths &&
              event.toolEventInfo &&
              event.toolEventInfo.type === "vertex-add")
          ) {
            handlePolylineUpdate(event.graphic, event.state === "complete");
          }
          break;

        case "polygon":
          if (
            event.state === "complete" ||
            event.type === "undo" ||
            event.type === "redo" ||
            (event.graphic.geometry &&
              event.graphic.geometry.rings &&
              event.toolEventInfo &&
              event.toolEventInfo.type === "vertex-add")
          ) {
            handlePolygonUpdate(event.graphic, event.state === "complete");
          }
          break;

        default:
          if (userContext.current.currentUser.showMessages)
            console.error("[ERROR] Trying to create a new " + event.graphic.geometry.type);
          break;
      }
    });

    if (sketchUpdateEvent.current) sketchUpdateEvent.current.remove();

    sketchUpdateEvent.current = sketchRef.current.on(
      ["update", "undo", "redo", "vertex-add", "vertex-remove", "cursor-update", "draw-complete"],
      (event) => {
        if (!event.aborted) {
          if (
            selectingProperties.current &&
            event.graphics &&
            event.graphics.length > 0 &&
            event.state === "start" &&
            (!lastSelectedProperty.current ||
              lastSelectedProperty.current.uprn !== event.graphics[0].attributes.uprn ||
              performance.now() - lastSelectedProperty.current.time > doubleEventWait)
          ) {
            lastSelectedProperty.current = { uprn: event.graphics[0].attributes.uprn, time: performance.now() };
            // Get the list of UPRNs of the selected properties
            const selectedUprns = [];

            event.graphics.forEach((point) => {
              if (point.geometry.type === "point" && !selectedUprns.includes(point.attributes.uprn)) {
                selectedUprns.push(point.attributes.uprn);
              }
            });

            if (selectedProperties.current.length + selectedUprns.length > 300) {
              saveResult.current = false;
              saveType.current = "maxSelectProperties";
              saveOpenRef.current = true;
              setSaveOpen(true);
              mapContext.onSelectPropertiesChange(false);
            } else {
              saveOpenRef.current = false;
              setSaveOpen(false);
              const removedProperties = selectedProperties.current.filter((x) => selectedUprns.includes(x));
              const newSelectedProperties = mergeArrays(
                selectedProperties.current.filter((x) => !removedProperties.includes(x)),
                selectedUprns.filter((x) => !removedProperties.includes(x)),
                (a, b) => a === b
              );
              selectedProperties.current = newSelectedProperties;

              if (newSelectedProperties.length > 0) {
                setSelectionAnchorEl(document.getElementById("ads-search-data-list"));
                mapContext.onHighlightListItem("selectProperties", newSelectedProperties);
              } else {
                setSelectionAnchorEl(null);
                mapContext.onHighlightClear();
              }
            }
          } else {
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
                    mapContext.onSetCoordinate({
                      x: graphic.geometry.x.toFixed(4),
                      y: graphic.geometry.y.toFixed(4),
                    });
                  }
                  break;

                case "polyline":
                  if (
                    event.state === "complete" ||
                    event.type === "undo" ||
                    event.type === "redo" ||
                    (event.toolEventInfo &&
                      (event.toolEventInfo.type === "move-stop" ||
                        event.toolEventInfo.type === "reshape-stop" ||
                        event.toolEventInfo.type === "vertex-add" ||
                        event.toolEventInfo.type === "vertex-remove" ||
                        event.toolEventInfo.type === "scale-stop"))
                  ) {
                    handlePolylineUpdate(graphic, true);
                  }
                  break;

                case "polygon":
                  if (
                    event.state === "complete" ||
                    event.type === "undo" ||
                    event.type === "redo" ||
                    (event.toolEventInfo &&
                      (event.toolEventInfo.type === "move-stop" ||
                        event.toolEventInfo.type === "reshape-stop" ||
                        event.toolEventInfo.type === "vertex-add" ||
                        event.toolEventInfo.type === "vertex-remove" ||
                        event.toolEventInfo.type === "scale-stop"))
                  ) {
                    handlePolygonUpdate(graphic, true);
                  }
                  break;

                default:
                  break;
              }
            }
          }
        }
      }
    );

    if (sketchDeleteEvent.current) sketchDeleteEvent.current.remove();

    sketchDeleteEvent.current = sketchRef.current.on(["delete"], (event) => {
      // get the graphic as it is being updated
      const graphic = event.graphics[0];
      if (graphic.geometry) {
        switch (graphic.geometry.type) {
          case "polygon":
            handlePolygonUpdate("", true);
            break;

          default:
            break;
        }
      }
    });

    async function GetFeatures(layer, count, startIndex) {
      switch (layer.serviceProvider) {
        case "OS":
          return await GetOSFeatures(layer, count, startIndex);

        case "thinkWare":
          return await GetThinkWareFeatures(layer, count, startIndex);

        default:
          alert(`Unknown service provider: ${layer.serviceProvider}`);
          break;
      }
    }

    function GetOSFeatures(layer, count, startIndex) {
      const wfsParams = {
        key: layer.layerKey,
        service: "WFS",
        request: "GetFeature",
        version: "2.0.0",
        typeNames: layer.activeLayerId,
        propertyName: layer.propertyName,
        outputFormat: "GEOJSON",
        srsName: "urn:ogc:def:crs:EPSG::27700",
        filter: `<ogc:Filter><ogc:BBOX><ogc:PropertyName>SHAPE</ogc:PropertyName><gml:Box srsName="urn:ogc:def:crs:EPSG::27700"><gml:coordinates>${
          backgroundExtent.current ? backgroundExtent.current.xmin : 0.0
        },${backgroundExtent.current ? backgroundExtent.current.ymin : 0.0} ${
          backgroundExtent.current ? backgroundExtent.current.xmax : 660000.0
        },${
          backgroundExtent.current ? backgroundExtent.current.ymax : 1300000.0
        }</gml:coordinates></gml:Box></ogc:BBOX></ogc:Filter>`,
        count: count,
        startIndex: startIndex,
      };

      const options = {
        responseType: "json",
      };

      const encodedParameters = Object.keys(wfsParams)
        .map((paramName) => paramName + "=" + encodeURI(wfsParams[paramName]))
        .join("&");

      const url = layer.url + "?" + encodedParameters;

      return esriRequest(url, options)
        .then(function (response) {
          return response;
        })
        .catch((error) => {
          if (userContext.current.currentUser.showMessages)
            console.error("[ERROR] getting OS functions", {
              layer: layer,
              wfsParams: wfsParams,
              url: url,
              error: error,
            });
        });
    }

    function GetThinkWareFeatures(layer, count, startIndex) {
      const wfsParams = {
        token: layer.token,
        service: "WFS",
        request: "GetFeature",
        version: "1.1.0",
        typeName: layer.activeLayerId,
        propertyName: layer.propertyName,
        outputFormat: "json",
        srsName: "urn:ogc:def:crs:EPSG::27700",
        filter: `<Filter xmlns="http://www.opengis.net/ogc"><BBOX><PropertyName>shape</PropertyName><Envelope xmlns="http://www.opengis.net/gml" srsName="EPSG:27700"><lowerCorner>${
          backgroundExtent.current ? backgroundExtent.current.xmin : 0.0
        } ${backgroundExtent.current ? backgroundExtent.current.ymin : 0.0}</lowerCorner><upperCorner>${
          backgroundExtent.current ? backgroundExtent.current.xmax : 660000.0
        } ${
          backgroundExtent.current ? backgroundExtent.current.ymax : 1300000.0
        }</upperCorner></Envelope></BBOX></Filter>`,
      };

      const options = {
        query: {
          f: "json",
        },
        responseType: "json",
      };

      const encodedParameters = Object.keys(wfsParams)
        .map((paramName) => paramName + "=" + encodeURI(wfsParams[paramName]))
        .join("&");

      const url = layer.url + "?" + encodedParameters;

      return esriRequest(url, options)
        .then(function (response) {
          return response;
        })
        .catch((error) => {
          if (userContext.current.currentUser.showMessages)
            console.error("[ERROR] getting thinkWare functions", {
              layer: layer,
              wfsParams: wfsParams,
              url: url,
              error: error,
            });
        });
    }

    function GetFeatureFillColour(code) {
      switch (code) {
        case 10021: // Building
          return [252, 217, 172];

        // case 10025: // Buildings Or Structure
        //   return [255, 0, 0];

        // case 10031: // Built Environment
        //   return [255, 0, 0];

        // case 10044: // General Feature
        //   return [255, 0, 0];

        case 10056: // General Surface
          return [222, 222, 222];

        case 10053: // General Surface/Multi Surface
          return [250, 250, 202];

        // case 10054: // General Surface/Step
        //   return [255, 0, 0];

        // case 10062: // Glasshouse
        //   return [255, 0, 0];

        // case 10065: // Height Control
        //   return [255, 0, 0];

        // case 10076: // Historic Interest
        //   return [255, 0, 0];

        case 10089: // Inland Water
          return [179, 211, 252];

        // case 10093: // Landform
        //   return [255, 0, 0];

        // case 10099: // Landform/Cliff
        //   return [255, 0, 0];

        case 10096: // Landform/Slope
          return [172, 252, 184];

        case 10111: // Natural Environment
          return [172, 252, 184];

        // case 10116: // Network Or Polygon Closing Geometry
        //   return [255, 0, 0];

        case 10123: // Path
          return [195, 195, 195];

        case 10119: // Path/Step
          return [195, 195, 195];

        // case 10126: // Political Or Administrative
        //   return [255, 0, 0];

        // case 10167: // Rail
        //   return [255, 0, 0];

        case 10172: // Road Or Track
          return [255, 255, 255];

        case 10183: // Roadside
          return [222, 222, 222];

        case 10185: // Structure
          return [195, 195, 195];

        // case 10190: // Structure/Archway
        //   return [255, 0, 0];

        // case 10193: // Structure/Pylon
        //   return [255, 0, 0];

        // case 10187: // Structure/Upper Level Of Communication
        //   return [255, 0, 0];

        // case 10199: // Terrain And Height
        //   return [255, 0, 0];

        // case 10210: // Tidal Water
        //   return [255, 0, 0];

        // case 10203: // Tidal Water/Foreshore
        //   return [255, 0, 0];

        // case 10217: // Unclassified
        //   return [255, 0, 0];

        default:
          alert(`Unknown FeatureCode: ${code}`);
          return [255, 0, 0, 1];
      }
    }

    function GetFeatureOutline(code) {
      switch (code) {
        case 10021: // Building
          return {
            color: [191, 191, 191],
            width: 1,
          };

        // case 10025: // Buildings Or Structure
        // return {
        //   color: [255, 0, 0],
        //   width: 1,
        // };

        // case 10031: // Built Environment
        // return {
        //   color: [255, 0, 0],
        //   width: 1,
        // };

        // case 10044: // General Feature
        // return {
        //   color: [255, 0, 0],
        //   width: 1,
        // };

        case 10056: // General Surface
          return {
            color: [201, 201, 201],
            width: 1,
          };

        case 10053: // General Surface/Multi Surface
          return {
            color: [195, 195, 195],
            width: 1,
          };

        // case 10054: // General Surface/Step
        // return {
        //   color: [255, 0, 0],
        //   width: 1,
        // };

        // case 10062: // Glasshouse
        // return {
        //   color: [255, 0, 0],
        //   width: 1,
        // };

        // case 10065: // Height Control
        // return {
        //   color: [255, 0, 0],
        //   width: 1,
        // };

        // case 10076: // Historic Interest
        // return {
        //   color: [255, 0, 0],
        //   width: 1,
        // };

        case 10089: // Inland Water
          return {
            color: [47, 130, 224],
            width: 1,
          };

        // case 10093: // Landform
        // return {
        //   color: [255, 0, 0],
        //   width: 1,
        // };

        // case 10099: // Landform/Cliff
        // return {
        //   color: [255, 0, 0],
        //   width: 1,
        // };

        case 10096: // Landform/Slope
          return {
            // color: [132, 240, 148],
            color: [150, 150, 150],
            width: 1,
          };

        case 10111: // Natural Environment
          return {
            // color: [132, 240, 148],
            color: [150, 150, 150],
            width: 1,
          };

        // case 10116: // Network Or Polygon Closing Geometry
        // return {
        //   color: [255, 0, 0],
        //   width: 1,
        // };

        case 10123: // Path
          return {
            color: [150, 150, 150],
            width: 1,
          };

        case 10119: // Path/Step
          return {
            color: [150, 150, 150],
            width: 1,
          };

        // case 10126: // Political Or Administrative
        // return {
        //   color: [255, 0, 0],
        //   width: 1,
        // };

        // case 10167: // Rail
        // return {
        //   color: [255, 0, 0],
        //   width: 1,
        // };

        case 10172: // Road Or Track
          return {
            color: [255, 255, 255],
            width: 1,
            style: "dash",
          };

        case 10183: // Roadside
          return {
            color: [150, 150, 150],
            width: 1,
          };

        case 10185: // Structure
          return {
            color: [150, 150, 150],
            width: 1,
          };

        // case 10190: // Structure/Archway
        // return {
        //   color: [255, 0, 0],
        //   width: 1,
        // };

        // case 10193: // Structure/Pylon
        // return {
        //   color: [255, 0, 0],
        //   width: 1,
        // };

        // case 10187: // Structure/Upper Level Of Communication
        // return {
        //   color: [255, 0, 0],
        //   width: 1,
        // };

        // case 10199: // Terrain And Height
        // return {
        //   color: [255, 0, 0],
        //   width: 1,
        // };

        // case 10210: // Tidal Water
        // return {
        //   color: [255, 0, 0],
        //   width: 1,
        // };

        // case 10203: // Tidal Water/Foreshore
        // return {
        //   color: [255, 0, 0],
        //   width: 1,
        // };

        // case 10217: // Unclassified
        // return {
        //   color: [255, 0, 0],
        //   width: 1,
        // };

        default:
          return {
            color: [255, 0, 0],
            width: 1,
          };
      }
    }

    function GetMoreFeatures(featureLayer) {
      let geoJson = null;
      if (geoJSONFeatures.current && geoJSONFeatures.current.length > 0) {
        geoJson = geoJSONFeatures.current.find((x) => x.id === featureLayer.layer.layerId);
      }

      const foundExistingGeoJson = !!geoJson;

      if (!foundExistingGeoJson) {
        const baseLayer = baseMapLayers.current.find((x) => x.layerId === featureLayer.layer.layerId);
        geoJson = {
          id: featureLayer.layer.layerId,
          count: baseLayer.maxBatchSize,
          startIndex: 0,
          featureCollection: { type: "FeatureCollection", features: [] },
        };
      }

      let graphics = null;
      let gotAllFeatures = false;

      GetFeatures(featureLayer.layer, geoJson.count, geoJson.startIndex).then(function (json) {
        geoJson.featureCollection.features.push.apply(geoJson.featureCollection.features, json.data.features);

        gotAllFeatures = json.data.features.length < geoJson.count;
        featuresDownloaded.current = geoJson.startIndex + json.data.features.length;
        geoJson.startIndex += geoJson.count;

        if (gotAllFeatures) {
          saveResult.current = true;
          saveType.current = "downloadedAllFeatures";
          saveOpenRef.current = true;
          setSaveOpen(true);
        }

        if (!foundExistingGeoJson) geoJSONFeatures.current.push(geoJson);

        if (geoJson.featureCollection.features.length > 0) {
          graphics = geoJson.featureCollection.features.map(function (f) {
            switch (featureLayer.layer.geometryType) {
              case "line":
                const polyline = {
                  type: "polyline",
                  paths: f.geometry.coordinates[0],
                  spatialReference: { wkid: 27700 },
                };

                return new Graphic({
                  geometry: polyline,
                  attributes: f.properties,
                  symbol: unselectedLineSymbol.current,
                });

              case "polygon":
                const polygon = {
                  type: "polygon",
                  rings: f.geometry.coordinates[0],
                  spatialReference: { wkid: 27700 },
                };

                const fillSymbol = {
                  type: "simple-fill",
                  color: GetFeatureFillColour(f.properties.FeatureCode),
                  outline: GetFeatureOutline(f.properties.FeatureCode),
                };

                return new Graphic({
                  geometry: polygon,
                  attributes: f.properties,
                  symbol: fillSymbol,
                });

              default:
                return null;
            }
          });

          const currentFeatureLayer = mapRef.current && mapRef.current.findLayerById(featureLayer.layer.layerId);

          if (currentFeatureLayer) {
            const layerIndex = mapRef.current.layers.indexOf(currentFeatureLayer);

            const updatedFeatureLayer = new GraphicsLayer({
              id: featureLayer.layer.layerId,
              graphics: graphics,
              copyright:
                featureLayer.layer.copyright && featureLayer.layer.copyright.includes("<<year>>")
                  ? featureLayer.layer.copyright.replace("<<year>>", new Date().getFullYear().toString())
                  : featureLayer.layer.copyright,
              title: featureLayer.layer.title,
              listMode: featureLayer.layer.displayInList ? "show" : "hide",
              maxScale: featureLayer.layer.maxScale,
              minScale: featureLayer.layer.minScale,
              opacity: featureLayer.layer.opacity,
              visible: currentFeatureLayer.visible,
            });

            mapRef.current.remove(currentFeatureLayer);
            mapRef.current.add(updatedFeatureLayer, layerIndex);
          }
        }
      });
    }

    function handlePolylineUpdate(graphic, canUpdate) {
      if (graphic.geometry.paths) {
        // check if the polyline intersects itself
        const intersectingSegment = getIntersectingSegment(graphic.geometry);

        graphic.symbol =
          intersectingSegment || graphic.symbol.style === invalidLineSymbol.current.color
            ? invalidLineSymbol.current
            : validLineSymbol.current;

        if (!saveOpenRef.current && intersectingSegment) {
          saveResult.current = false;
          saveType.current = "intersectLine";
          saveOpenRef.current = true;
          setSaveOpen(true);
        } else {
          saveOpenRef.current = false;
          setSaveOpen(false);
        }

        // Only update the geometry if it is valid
        if (canUpdate && !intersectingSegment && graphic.symbol.style !== invalidLineSymbol.current.color) {
          mapContext.onSetLineGeometry(GetPolylineAsWKT([graphic]));
        }
      }
    }

    function handlePolygonUpdate(graphic, canUpdate) {
      if (graphic === "" && canUpdate) {
        mapContext.onSetPolygonGeometry("");
      } else if (graphic.geometry.rings) {
        const intersectingPolygon = graphic.geometry.rings.length > 1;
        graphic.symbol =
          intersectingPolygon || (graphic.symbol && graphic.symbol.color === invalidPolygonSymbol.current.color)
            ? invalidPolygonSymbol.current
            : validPolygonSymbol.current;

        if (!saveOpenRef.current && intersectingPolygon) {
          saveResult.current = false;
          saveType.current = "intersectPolygon";
          saveOpenRef.current = true;
          setSaveOpen(true);
        } else {
          saveOpenRef.current = false;
          setSaveOpen(false);
        }

        // Only update the geometry if it is valid
        if (canUpdate && !intersectingPolygon && graphic.symbol.color !== invalidPolygonSymbol.current.color) {
          mapContext.onSetPolygonGeometry(GetPolygonAsWKT([graphic]));
        }
      }
    }

    // function that checks if the line intersects itself
    function isSelfIntersecting(polyline) {
      // if we only have a single line with only 2 nodes it cannot cross itself
      if (polyline.paths.length === 1 && polyline.paths[0].length < 3) {
        return false;
      }

      const line = polyline.clone();
      let lineIntersects = false;

      for (var z = 0; z < polyline.paths.length; z++) {
        if (polyline.paths[z] && polyline.paths[z].length && polyline.paths[z].length > 0) {
          for (var x = 0; x < polyline.paths[z].length; x++) {
            //get the next segment from the polyline that is being drawn
            const lastSegment = getNextSegment(polyline, z, x);
            line.removePoint(z, line.paths[z].length - 1);

            // returns true if the line intersects itself, false otherwise
            lineIntersects = geometryEngine.crosses(lastSegment, line);

            if (lineIntersects) break;
          }
        }

        if (lineIntersects) break;
      }

      return lineIntersects;
    }

    // Get the next segment of the polyline that is being edited
    function getNextSegment(polyline, pathIdx, pointIdx) {
      const line = polyline.clone();
      for (var z = 1; z < pointIdx; z++) {
        line.removePoint(pathIdx, line.paths[pathIdx].length - 1);
      }
      const lastXYPoint = line.removePoint(pathIdx, line.paths[pathIdx].length - 1);
      const existingLineFinalPoint = line.getPoint(pathIdx, line.paths[pathIdx].length - 1);

      return {
        type: "polyline",
        spatialReference: view.spatialReference,
        hasZ: false,
        paths: [
          [
            [existingLineFinalPoint.x, existingLineFinalPoint.y],
            [lastXYPoint.x, lastXYPoint.y],
          ],
        ],
      };
    }

    // Checks if the line intersects itself. If yes, change the last
    // segment's symbol giving a visual feedback to the user.
    function getIntersectingSegment(polyline) {
      if (isSelfIntersecting(polyline)) {
        return new Graphic({
          geometry: getLastSegment(polyline, 0, polyline.paths[0].length),
          symbol: invalidLineSymbol.current,
        });
      }
      return null;
    }

    // Get the last segment of the polyline that is being drawn
    function getLastSegment(polyline) {
      const line = polyline.clone();
      const lastXYPoint = line.removePoint(0, line.paths[0].length - 1);
      const existingLineFinalPoint = line.getPoint(0, line.paths[0].length - 1);

      return {
        type: "polyline",
        spatialReference: view.spatialReference,
        hasZ: false,
        paths: [
          [
            [existingLineFinalPoint.x, existingLineFinalPoint.y],
            [lastXYPoint.x, lastXYPoint.y],
          ],
        ],
      };
    }

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
      llpgStreets: mapContext.currentSearchData.llpgStreets,
      properties: mapContext.currentSearchData.properties,
      extents: mapContext.currentLayers.extents,
      backgroundStreets: mapContext.currentBackgroundData.streets,
      unassignedEsus: mapContext.currentBackgroundData.unassignedEsus,
      backgroundProperties: mapContext.currentBackgroundData.properties,
      backgroundProvenances: mapContext.currentBackgroundData.provenances,
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
    mapContext.currentEsusChanged,
    loading,
    streetContext.currentStreet,
    streetContext,
    fadeVisibilityOn,
  ]);

  // Fix the order of the layers
  useEffect(() => {
    if (!mapRef.current || !mapRef.current.layers || !mapRef.current.layers.length) return;

    const backgroundStreetLayer = mapRef.current.findLayerById(backgroundStreetLayerName);
    const unassignedEsusLayer = mapRef.current.findLayerById(unassignedEsusLayerName);
    const backgroundPropertyLayer = mapRef.current.findLayerById(backgroundPropertyLayerName);
    const backgroundProvenanceLayer = mapRef.current.findLayerById(backgroundProvenanceLayerName);
    const streetLayer = mapRef.current.findLayerById(streetLayerName);
    const llpgStreetLayer = mapRef.current.findLayerById(llpgStreetLayerName);
    const propertyLayer = mapRef.current.findLayerById(propertyLayerName);
    const extentLayer = mapRef.current.findLayerById(extentLayerName);

    if (!backgroundStreetLayer || !backgroundPropertyLayer) return;

    let levelAboveBase = baseMapLayers.current.length;

    const currentBackgroundStreetIndex = mapRef.current.layers.indexOf(backgroundStreetLayer);
    const requiredBackgroundStreetIndex = levelAboveBase++;
    if (currentBackgroundStreetIndex !== requiredBackgroundStreetIndex)
      mapRef.current.reorder(backgroundStreetLayer, requiredBackgroundStreetIndex);

    if (unassignedEsusLayer) {
      const currentUnassignedEsusIndex = mapRef.current.layers.indexOf(unassignedEsusLayer);
      const requiredUnassignedEsusIndex = levelAboveBase++;
      if (currentUnassignedEsusIndex !== requiredUnassignedEsusIndex)
        mapRef.current.reorder(unassignedEsusLayer, requiredUnassignedEsusIndex);
    }

    if (backgroundProvenanceLayer) {
      const currentBackgroundProvenanceIndex = mapRef.current.layers.indexOf(backgroundProvenanceLayer);
      const requiredBackgroundProvenanceIndex = levelAboveBase++;
      if (currentBackgroundProvenanceIndex !== requiredBackgroundProvenanceIndex)
        mapRef.current.reorder(backgroundProvenanceLayer, requiredBackgroundProvenanceIndex);
    }

    const currentBackgroundPropertyIndex = mapRef.current.layers.indexOf(backgroundPropertyLayer);
    const requiredBackgroundPropertyIndex = levelAboveBase++;
    if (currentBackgroundPropertyIndex !== requiredBackgroundPropertyIndex)
      mapRef.current.reorder(backgroundPropertyLayer, requiredBackgroundPropertyIndex);

    if (streetLayer) {
      const currentStreetIndex = mapRef.current.layers.indexOf(streetLayer);
      const requiredStreetIndex = levelAboveBase++;
      if (currentStreetIndex !== requiredStreetIndex) mapRef.current.reorder(streetLayer, requiredStreetIndex);
    }

    if (llpgStreetLayer) {
      const currentLlpgStreetIndex = mapRef.current.layers.indexOf(llpgStreetLayer);
      const requiredLlpgStreetIndex = levelAboveBase++;
      if (currentLlpgStreetIndex !== requiredLlpgStreetIndex)
        mapRef.current.reorder(llpgStreetLayer, requiredLlpgStreetIndex);
    }

    if (extentLayer) {
      const currentExtentIndex = mapRef.current.layers.indexOf(extentLayer);
      const requiredExtentIndex = levelAboveBase++;
      if (currentExtentIndex !== requiredExtentIndex) mapRef.current.reorder(extentLayer, requiredExtentIndex);
    }

    if (propertyLayer) {
      const currentPropertyIndex = mapRef.current.layers.indexOf(propertyLayer);
      const requiredPropertyIndex = levelAboveBase++;
      if (currentPropertyIndex !== requiredPropertyIndex) mapRef.current.reorder(propertyLayer, requiredPropertyIndex);
    }

    if (editingObject.current && editingObject.current.objectType && editGraphicsLayer.current) {
      const currentEditIndex = mapRef.current.layers.indexOf(editGraphicsLayer.current);
      const requiredEditIndex = mapRef.current.layers.length - 1;
      if (currentEditIndex !== requiredEditIndex) mapRef.current.reorder(editGraphicsLayer.current, requiredEditIndex);
    }
  });

  // Edit graphics layer & setting sketch tools
  useEffect(() => {
    const setSnappingLayers = () => {
      const LayersUsedForSnapping = [];
      let baseLayer = null;

      switch (mapContext.currentEditObject.objectType) {
        case 13: // ESU
          if (editGraphicsLayer.current)
            LayersUsedForSnapping.push({ layer: editGraphicsLayer.current, enabled: true });
          if (backgroundStreetLayerRef.current)
            LayersUsedForSnapping.push({ layer: backgroundStreetLayerRef.current, enabled: true });
          if (unassignedEsusLayerRef.current)
            LayersUsedForSnapping.push({ layer: unassignedEsusLayerRef.current, enabled: true });
          if (streetLayer) LayersUsedForSnapping.push({ layer: streetLayer, enabled: true });
          if (llpgStreetLayer) LayersUsedForSnapping.push({ layer: llpgStreetLayer, enabled: true });
          baseLayersSnapEsu.current.forEach((layerId) => {
            baseLayer = mapRef.current && mapRef.current.findLayerById(layerId);
            if (baseLayer) LayersUsedForSnapping.push({ layer: baseLayer, enabled: true });
          });
          if (LayersUsedForSnapping.length > 0)
            sketchRef.current.snappingOptions.featureSources = LayersUsedForSnapping;
          break;

        case 21: // BLPU
          if (backgroundStreetLayerRef.current)
            LayersUsedForSnapping.push({ layer: backgroundStreetLayerRef.current, enabled: true });
          if (unassignedEsusLayerRef.current)
            LayersUsedForSnapping.push({ layer: unassignedEsusLayerRef.current, enabled: true });
          if (backgroundProvenanceLayerRef.current)
            LayersUsedForSnapping.push({ layer: backgroundProvenanceLayerRef.current, enabled: true });
          if (backgroundPropertyLayerRef.current)
            LayersUsedForSnapping.push({ layer: backgroundPropertyLayerRef.current, enabled: true });
          if (propertyLayer) LayersUsedForSnapping.push({ layer: propertyLayer, enabled: true });
          baseLayersSnapBlpu.current.forEach((layerId) => {
            baseLayer = mapRef.current && mapRef.current.findLayerById(layerId);
            if (baseLayer) LayersUsedForSnapping.push({ layer: baseLayer, enabled: true });
          });
          if (LayersUsedForSnapping.length > 0)
            sketchRef.current.snappingOptions.featureSources = LayersUsedForSnapping;
          break;

        case 22: // Extent
          if (editGraphicsLayer.current)
            LayersUsedForSnapping.push({ layer: editGraphicsLayer.current, enabled: true });
          if (extentLayer) LayersUsedForSnapping.push({ layer: extentLayer, enabled: true });
          baseLayersSnapExtent.current.forEach((layerId) => {
            baseLayer = mapRef.current && mapRef.current.findLayerById(layerId);
            if (baseLayer) LayersUsedForSnapping.push({ layer: baseLayer, enabled: true });
          });
          if (LayersUsedForSnapping.length > 0)
            sketchRef.current.snappingOptions.featureSources = LayersUsedForSnapping;
          break;

        case 51: // Maintenance Responsibility
          if (editGraphicsLayer.current)
            LayersUsedForSnapping.push({ layer: editGraphicsLayer.current, enabled: true });
          if (asd51Layer) LayersUsedForSnapping.push({ layer: asd51Layer, enabled: true });
          if (asd52Layer) LayersUsedForSnapping.push({ layer: asd52Layer, enabled: true });
          if (asd53Layer) LayersUsedForSnapping.push({ layer: asd53Layer, enabled: true });
          if (streetLayer) LayersUsedForSnapping.push({ layer: streetLayer, enabled: true });
          baseLayersSnapEsu.current.forEach((layerId) => {
            baseLayer = mapRef.current && mapRef.current.findLayerById(layerId);
            if (baseLayer) LayersUsedForSnapping.push({ layer: baseLayer, enabled: true });
          });
          if (LayersUsedForSnapping.length > 0)
            sketchRef.current.snappingOptions.featureSources = LayersUsedForSnapping;
          break;

        case 52: // Reinstatement Category
          if (editGraphicsLayer.current)
            LayersUsedForSnapping.push({ layer: editGraphicsLayer.current, enabled: true });
          if (asd51Layer) LayersUsedForSnapping.push({ layer: asd51Layer, enabled: true });
          if (asd52Layer) LayersUsedForSnapping.push({ layer: asd52Layer, enabled: true });
          if (asd53Layer) LayersUsedForSnapping.push({ layer: asd53Layer, enabled: true });
          if (streetLayer) LayersUsedForSnapping.push({ layer: streetLayer, enabled: true });
          baseLayersSnapEsu.current.forEach((layerId) => {
            baseLayer = mapRef.current && mapRef.current.findLayerById(layerId);
            if (baseLayer) LayersUsedForSnapping.push({ layer: baseLayer, enabled: true });
          });
          if (LayersUsedForSnapping.length > 0)
            sketchRef.current.snappingOptions.featureSources = LayersUsedForSnapping;
          break;

        case 53: // Special Designation
          if (editGraphicsLayer.current)
            LayersUsedForSnapping.push({ layer: editGraphicsLayer.current, enabled: true });
          if (asd51Layer) LayersUsedForSnapping.push({ layer: asd51Layer, enabled: true });
          if (asd52Layer) LayersUsedForSnapping.push({ layer: asd52Layer, enabled: true });
          if (asd53Layer) LayersUsedForSnapping.push({ layer: asd53Layer, enabled: true });
          if (streetLayer) LayersUsedForSnapping.push({ layer: streetLayer, enabled: true });
          baseLayersSnapEsu.current.forEach((layerId) => {
            baseLayer = mapRef.current && mapRef.current.findLayerById(layerId);
            if (baseLayer) LayersUsedForSnapping.push({ layer: baseLayer, enabled: true });
          });
          if (LayersUsedForSnapping.length > 0)
            sketchRef.current.snappingOptions.featureSources = LayersUsedForSnapping;
          break;

        case 61: // Interest
          if (editGraphicsLayer.current)
            LayersUsedForSnapping.push({ layer: editGraphicsLayer.current, enabled: true });
          if (asd61Layer) LayersUsedForSnapping.push({ layer: asd61Layer, enabled: true });
          if (asd62Layer) LayersUsedForSnapping.push({ layer: asd62Layer, enabled: true });
          if (asd63Layer) LayersUsedForSnapping.push({ layer: asd63Layer, enabled: true });
          if (asd64Layer) LayersUsedForSnapping.push({ layer: asd64Layer, enabled: true });
          if (asd66Layer) LayersUsedForSnapping.push({ layer: asd66Layer, enabled: true });
          if (streetLayer) LayersUsedForSnapping.push({ layer: streetLayer, enabled: true });
          baseLayersSnapEsu.current.forEach((layerId) => {
            baseLayer = mapRef.current && mapRef.current.findLayerById(layerId);
            if (baseLayer) LayersUsedForSnapping.push({ layer: baseLayer, enabled: true });
          });
          if (LayersUsedForSnapping.length > 0)
            sketchRef.current.snappingOptions.featureSources = LayersUsedForSnapping;
          break;

        case 62: // Construction
          if (editGraphicsLayer.current)
            LayersUsedForSnapping.push({ layer: editGraphicsLayer.current, enabled: true });
          if (asd61Layer) LayersUsedForSnapping.push({ layer: asd61Layer, enabled: true });
          if (asd62Layer) LayersUsedForSnapping.push({ layer: asd62Layer, enabled: true });
          if (asd63Layer) LayersUsedForSnapping.push({ layer: asd63Layer, enabled: true });
          if (asd64Layer) LayersUsedForSnapping.push({ layer: asd64Layer, enabled: true });
          if (asd66Layer) LayersUsedForSnapping.push({ layer: asd66Layer, enabled: true });
          if (streetLayer) LayersUsedForSnapping.push({ layer: streetLayer, enabled: true });
          baseLayersSnapEsu.current.forEach((layerId) => {
            baseLayer = mapRef.current && mapRef.current.findLayerById(layerId);
            if (baseLayer) LayersUsedForSnapping.push({ layer: baseLayer, enabled: true });
          });
          if (LayersUsedForSnapping.length > 0)
            sketchRef.current.snappingOptions.featureSources = LayersUsedForSnapping;
          break;

        case 63: // Special Designation
          if (editGraphicsLayer.current)
            LayersUsedForSnapping.push({ layer: editGraphicsLayer.current, enabled: true });
          if (asd61Layer) LayersUsedForSnapping.push({ layer: asd61Layer, enabled: true });
          if (asd62Layer) LayersUsedForSnapping.push({ layer: asd62Layer, enabled: true });
          if (asd63Layer) LayersUsedForSnapping.push({ layer: asd63Layer, enabled: true });
          if (asd64Layer) LayersUsedForSnapping.push({ layer: asd64Layer, enabled: true });
          if (asd66Layer) LayersUsedForSnapping.push({ layer: asd66Layer, enabled: true });
          if (streetLayer) LayersUsedForSnapping.push({ layer: streetLayer, enabled: true });
          baseLayersSnapEsu.current.forEach((layerId) => {
            baseLayer = mapRef.current && mapRef.current.findLayerById(layerId);
            if (baseLayer) LayersUsedForSnapping.push({ layer: baseLayer, enabled: true });
          });
          if (LayersUsedForSnapping.length > 0)
            sketchRef.current.snappingOptions.featureSources = LayersUsedForSnapping;
          break;

        case 64: // Height, Width & Weight Restriction
          if (editGraphicsLayer.current)
            LayersUsedForSnapping.push({ layer: editGraphicsLayer.current, enabled: true });
          if (asd61Layer) LayersUsedForSnapping.push({ layer: asd61Layer, enabled: true });
          if (asd62Layer) LayersUsedForSnapping.push({ layer: asd62Layer, enabled: true });
          if (asd63Layer) LayersUsedForSnapping.push({ layer: asd63Layer, enabled: true });
          if (asd64Layer) LayersUsedForSnapping.push({ layer: asd64Layer, enabled: true });
          if (streetLayer) LayersUsedForSnapping.push({ layer: streetLayer, enabled: true });
          baseLayersSnapEsu.current.forEach((layerId) => {
            baseLayer = mapRef.current && mapRef.current.findLayerById(layerId);
            if (baseLayer) LayersUsedForSnapping.push({ layer: baseLayer, enabled: true });
          });
          if (LayersUsedForSnapping.length > 0)
            sketchRef.current.snappingOptions.featureSources = LayersUsedForSnapping;
          break;

        case 66: // Public right of way
          if (editGraphicsLayer.current)
            LayersUsedForSnapping.push({ layer: editGraphicsLayer.current, enabled: true });
          if (asd61Layer) LayersUsedForSnapping.push({ layer: asd61Layer, enabled: true });
          if (asd62Layer) LayersUsedForSnapping.push({ layer: asd62Layer, enabled: true });
          if (asd63Layer) LayersUsedForSnapping.push({ layer: asd63Layer, enabled: true });
          if (asd64Layer) LayersUsedForSnapping.push({ layer: asd64Layer, enabled: true });
          if (asd66Layer) LayersUsedForSnapping.push({ layer: asd66Layer, enabled: true });
          if (streetLayer) LayersUsedForSnapping.push({ layer: streetLayer, enabled: true });
          baseLayersSnapEsu.current.forEach((layerId) => {
            baseLayer = mapRef.current && mapRef.current.findLayerById(layerId);
            if (baseLayer) LayersUsedForSnapping.push({ layer: baseLayer, enabled: true });
          });
          if (LayersUsedForSnapping.length > 0)
            sketchRef.current.snappingOptions.featureSources = LayersUsedForSnapping;
          break;

        default:
          break;
      }
    };

    if (!mapRef.current || !mapRef.current.layers || !mapRef.current.layers.length || !mapContext.currentEditObject)
      return;

    const streetLayer = mapRef.current && mapRef.current.findLayerById(streetLayerName);
    const llpgStreetLayer = mapRef.current && mapRef.current.findLayerById(llpgStreetLayerName);
    const asd51Layer = mapRef.current && mapRef.current.findLayerById(asd51LayerName);
    const asd52Layer = mapRef.current && mapRef.current.findLayerById(asd52LayerName);
    const asd53Layer = mapRef.current && mapRef.current.findLayerById(asd53LayerName);
    const asd61Layer = mapRef.current && mapRef.current.findLayerById(asd61LayerName);
    const asd62Layer = mapRef.current && mapRef.current.findLayerById(asd62LayerName);
    const asd63Layer = mapRef.current && mapRef.current.findLayerById(asd63LayerName);
    const asd64Layer = mapRef.current && mapRef.current.findLayerById(asd64LayerName);
    const asd66Layer = mapRef.current && mapRef.current.findLayerById(asd66LayerName);
    const propertyLayer = mapRef.current && mapRef.current.findLayerById(propertyLayerName);
    const extentLayer = mapRef.current && mapRef.current.findLayerById(extentLayerName);

    if (
      editingObject.current &&
      (mapContext.currentEditObject.objectType !== 22 || mapContext.provenanceMerging) &&
      mapContext.currentEditObject &&
      mapContext.currentEditObject.objectType === editingObject.current.objectType &&
      mapContext.currentEditObject.objectId === editingObject.current.objectId
    ) {
      setSnappingLayers();
    } else {
      if (mapContext.provenanceMerging) mapContext.onProvenanceMerging(false);
      editGraphicsLayer.current.graphics.removeAll();

      let canContinue = false;

      if (mapContext.currentEditObject && mapContext.currentEditObject.objectType) {
        switch (mapContext.currentEditObject.objectType) {
          case 13:
            canContinue =
              !!streetLayer ||
              (streetContext.currentStreet && streetContext.currentStreet.newStreet) ||
              (streetContext.currentRecord && streetContext.currentRecord.newRecord);
            break;

          case 21:
            canContinue =
              !!propertyLayer ||
              (propertyContext.currentProperty && propertyContext.currentProperty.newProperty) ||
              (propertyContext.currentRecord && propertyContext.currentRecord.newRecord);
            break;

          case 22:
            canContinue = true;
            break;

          case 51:
            canContinue =
              !!asd51Layer ||
              (streetContext.currentStreet && streetContext.currentStreet.newStreet) ||
              (streetContext.currentRecord && streetContext.currentRecord.newRecord);
            break;

          case 52:
            canContinue =
              !!asd52Layer ||
              (streetContext.currentStreet && streetContext.currentStreet.newStreet) ||
              (streetContext.currentRecord && streetContext.currentRecord.newRecord);
            break;

          case 53:
            canContinue =
              !!asd53Layer ||
              (streetContext.currentStreet && streetContext.currentStreet.newStreet) ||
              (streetContext.currentRecord && streetContext.currentRecord.newRecord);
            break;

          case 61:
            canContinue =
              !!asd61Layer ||
              (streetContext.currentStreet && streetContext.currentStreet.newStreet) ||
              (streetContext.currentRecord && streetContext.currentRecord.newRecord);
            break;

          case 62:
            canContinue =
              !!asd62Layer ||
              (streetContext.currentStreet && streetContext.currentStreet.newStreet) ||
              (streetContext.currentRecord && streetContext.currentRecord.newRecord);
            break;

          case 63:
            canContinue =
              !!asd63Layer ||
              (streetContext.currentStreet && streetContext.currentStreet.newStreet) ||
              (streetContext.currentRecord && streetContext.currentRecord.newRecord);
            break;

          case 64:
            canContinue =
              !!asd64Layer ||
              (streetContext.currentStreet && streetContext.currentStreet.newStreet) ||
              (streetContext.currentRecord && streetContext.currentRecord.newRecord);
            break;

          case 66:
            canContinue =
              !!asd66Layer ||
              (streetContext.currentStreet && streetContext.currentStreet.newStreet) ||
              (streetContext.currentRecord && streetContext.currentRecord.newRecord);
            break;

          default:
            canContinue = false;
            break;
        }
      }

      if (!canContinue) {
        editingObject.current = null;

        if (backgroundStreetLayerRef.current) {
          backgroundStreetLayerRef.current.opacity = 0.5;
          backgroundStreetLayerRef.current.popupEnabled = true;
        }
        if (unassignedEsusLayerRef.current) {
          unassignedEsusLayerRef.current.opacity = 0.75;
          unassignedEsusLayerRef.current.popupEnabled = true;
        }
        if (streetLayer) {
          streetLayer.opacity = 1;
          streetLayer.popupEnabled = true;
        }
        if (llpgStreetLayer) {
          llpgStreetLayer.opacity = 1;
          llpgStreetLayer.popupEnabled = true;
        }
        if (asd51Layer) {
          asd51Layer.opacity = 1;
          asd51Layer.popupEnabled = true;
        }
        if (asd52Layer) {
          asd52Layer.opacity = 1;
          asd52Layer.popupEnabled = true;
        }
        if (asd53Layer) {
          asd53Layer.opacity = 1;
          asd53Layer.popupEnabled = true;
        }
        if (asd61Layer) {
          asd61Layer.opacity = 1;
          asd61Layer.popupEnabled = true;
        }
        if (asd62Layer) {
          asd62Layer.opacity = 1;
          asd62Layer.popupEnabled = true;
        }
        if (asd63Layer) {
          asd63Layer.opacity = 1;
          asd63Layer.popupEnabled = true;
        }
        if (asd64Layer) {
          asd64Layer.opacity = 1;
          asd64Layer.popupEnabled = true;
        }
        if (asd66Layer) {
          asd66Layer.opacity = 1;
          asd66Layer.popupEnabled = true;
        }
        if (backgroundProvenanceLayerRef.current) {
          backgroundProvenanceLayerRef.current.opacity = 0.5;
          backgroundProvenanceLayerRef.current.popupEnabled = true;
        }
        if (backgroundPropertyLayerRef.current) {
          backgroundPropertyLayerRef.current.opacity = 0.5;
          backgroundPropertyLayerRef.current.popupEnabled = true;
        }
        if (propertyLayer) {
          propertyLayer.opacity = 1;
          propertyLayer.popupEnabled = true;
        }
        if (extentLayer) {
          extentLayer.opacity = 1;
          extentLayer.popupEnabled = true;
        }

        editGraphicsLayer.current.listMode = "hide";
        sketchRef.current.availableCreateTools = [];
        sketchRef.current.visible = false;
      } else {
        editingObject.current = {
          objectType: mapContext.currentEditObject.objectType,
          objectId: mapContext.currentEditObject.objectId,
        };

        sketchRef.current.layer = editGraphicsLayer.current;

        if (backgroundStreetLayerRef.current) backgroundStreetLayerRef.current.popupEnabled = false;
        if (unassignedEsusLayerRef.current) unassignedEsusLayerRef.current.popupEnabled = false;
        if (streetLayer) streetLayer.popupEnabled = false;
        if (llpgStreetLayer) llpgStreetLayer.popupEnabled = false;
        if (asd51Layer) asd51Layer.popupEnabled = false;
        if (asd52Layer) asd52Layer.popupEnabled = false;
        if (asd53Layer) asd53Layer.popupEnabled = false;
        if (asd61Layer) asd61Layer.popupEnabled = false;
        if (asd62Layer) asd62Layer.popupEnabled = false;
        if (asd63Layer) asd63Layer.popupEnabled = false;
        if (asd64Layer) asd64Layer.popupEnabled = false;
        if (asd66Layer) asd66Layer.popupEnabled = false;
        if (backgroundProvenanceLayerRef.current) backgroundProvenanceLayerRef.current.popupEnabled = false;
        if (backgroundPropertyLayerRef.current) backgroundPropertyLayerRef.current.popupEnabled = false;
        if (propertyLayer) propertyLayer.popupEnabled = false;
        if (extentLayer) extentLayer.popupEnabled = false;

        sketchRef.current.visible =
          (mapContext.currentEditObject.objectType === 13 &&
            userContext.current &&
            userContext.current.currentUser.editStreet) ||
          ([21, 22].includes(mapContext.currentEditObject.objectType) &&
            userContext.current &&
            userContext.current.currentUser.editProperty) ||
          ([51, 52, 53, 61, 62, 63, 64, 66].includes(mapContext.currentEditObject.objectType) &&
            userContext.current &&
            userContext.current.currentUser.editASD);
        let hasGeometry = false;

        switch (mapContext.currentEditObject.objectType) {
          case 13: // ESU
            if (mapContext.currentSearchData.editStreet) {
              if (refStreetData.current && refStreetData.current.length > 0) {
                refStreetData.current.forEach((street) => {
                  if (street.esuId === mapContext.currentEditObject.objectId) {
                    editGraphicsLayer.current.graphics.add(createPolylineGraphic(street.geometry));
                  }
                });
              }

              if (backgroundStreetLayerRef.current) backgroundStreetLayerRef.current.opacity = 0.25;
              if (unassignedEsusLayerRef.current) unassignedEsusLayerRef.current.opacity = 0.5;
              if (backgroundProvenanceLayerRef.current) backgroundProvenanceLayerRef.current.opacity = 0.25;
              if (backgroundPropertyLayerRef.current) backgroundPropertyLayerRef.current.opacity = 0.25;
              if (streetLayer) streetLayer.opacity = 0.5;
              if (llpgStreetLayer) llpgStreetLayer.opacity = 0.5;

              editGraphicsLayer.current.listMode = "show";
              setSnappingLayers();
            }

            if (mapContext.currentEditObject.objectId > 0) sketchRef.current.availableCreateTools = [];
            else {
              sketchRef.current.availableCreateTools = ["polyline"];
              if (!mapContext.createToolActivated) {
                sketchRef.current._activateCreateTool("polyline");
                mapContext.onCreateToolActivated(true);
              }
            }
            break;

          case 21: // BLPU
            if (mapContext.currentSearchData.editProperty) {
              if (refPropertyData.current && refPropertyData.current.length > 0) {
                refPropertyData.current.forEach((property) => {
                  if (property.uprn.toString() === mapContext.currentEditObject.objectId.toString()) {
                    editGraphicsLayer.current.graphics.add(
                      createPointGraphic(
                        property.easting,
                        property.northing,
                        property.logicalStatus,
                        property.classificationCode.substring(0, 1),
                        true
                      )
                    );
                  }
                });
              }

              if (backgroundStreetLayerRef.current) backgroundStreetLayerRef.current.opacity = 0.25;
              if (unassignedEsusLayerRef.current) unassignedEsusLayerRef.current.opacity = 0.25;
              if (backgroundProvenanceLayerRef.current) backgroundProvenanceLayerRef.current.opacity = 0.25;
              if (backgroundPropertyLayerRef.current) backgroundPropertyLayerRef.current.opacity = 0.25;
              if (propertyLayer) propertyLayer.opacity = 0.5;

              editGraphicsLayer.current.listMode = "show";
              setSnappingLayers();
            }

            if (mapContext.currentEditObject.objectId > 0) sketchRef.current.availableCreateTools = [];
            else {
              sketchRef.current.availableCreateTools = ["point"];
              if (!mapContext.createToolActivated) {
                sketchRef.current._activateCreateTool("point");
                mapContext.onCreateToolActivated(true);
              }
            }
            break;

          case 22: // Extent
            if (extentData.current && extentData.current.length > 0) {
              extentData.current.forEach((extent) => {
                if (extent.pkId === mapContext.currentEditObject.objectId) {
                  hasGeometry = !!extent.geometry;
                  editGraphicsLayer.current.graphics.add(createPolygonGraphic(extent.geometry, extent.code));
                }
              });

              if (backgroundStreetLayerRef.current) backgroundStreetLayerRef.current.opacity = 0.25;
              if (unassignedEsusLayerRef.current) unassignedEsusLayerRef.current.opacity = 0.25;
              if (backgroundProvenanceLayerRef.current) backgroundProvenanceLayerRef.current.opacity = 0.25;
              if (backgroundPropertyLayerRef.current) backgroundPropertyLayerRef.current.opacity = 0.25;
              if (extentLayer) extentLayer.opacity = 0.5;
              if (propertyLayer) propertyLayer.opacity = 0.5;

              editGraphicsLayer.current.listMode = "show";

              setSnappingLayers();
            }

            if (mapContext.currentEditObject.objectId > 0 && hasGeometry) sketchRef.current.availableCreateTools = [];
            else {
              sketchRef.current.availableCreateTools = ["polygon"];
              if (!mapContext.createToolActivated) {
                sketchRef.current._activateCreateTool("polygon");
                mapContext.onCreateToolActivated(true);
              }
            }
            break;

          case 51: // Maintenance Responsibility
            if (refAsd51Data.current && refAsd51Data.current.length > 0) {
              refAsd51Data.current.forEach((asd) => {
                if (asd.pkId === mapContext.currentEditObject.objectId) {
                  hasGeometry = !!asd.geometry;
                  editGraphicsLayer.current.graphics.add(createPolylineGraphic(asd.geometry));
                }
              });

              if (backgroundStreetLayerRef.current) backgroundStreetLayerRef.current.opacity = 0.25;
              if (unassignedEsusLayerRef.current) unassignedEsusLayerRef.current.opacity = 0.25;
              if (backgroundProvenanceLayerRef.current) backgroundProvenanceLayerRef.current.opacity = 0.25;
              if (backgroundPropertyLayerRef.current) backgroundPropertyLayerRef.current.opacity = 0.25;
              if (asd51Layer) asd51Layer.opacity = 0.5;
              if (asd52Layer) asd52Layer.opacity = 0.5;
              if (asd53Layer) asd53Layer.opacity = 0.5;

              editGraphicsLayer.current.listMode = "show";

              setSnappingLayers();
            }

            sketchRef.current.availableCreateTools = ["polyline"];
            if (!mapContext.createToolActivated) {
              sketchRef.current._activateCreateTool("polyline");
              mapContext.onCreateToolActivated(true);
            }
            break;

          case 52: // Reinstatement Category
            if (refAsd52Data.current && refAsd52Data.current.length > 0) {
              refAsd52Data.current.forEach((asd) => {
                if (asd.pkId === mapContext.currentEditObject.objectId) {
                  hasGeometry = !!asd.geometry;
                  editGraphicsLayer.current.graphics.add(createPolylineGraphic(asd.geometry));
                }
              });

              if (backgroundStreetLayerRef.current) backgroundStreetLayerRef.current.opacity = 0.25;
              if (unassignedEsusLayerRef.current) unassignedEsusLayerRef.current.opacity = 0.25;
              if (backgroundProvenanceLayerRef.current) backgroundProvenanceLayerRef.current.opacity = 0.25;
              if (backgroundPropertyLayerRef.current) backgroundPropertyLayerRef.current.opacity = 0.25;
              if (asd51Layer) asd51Layer.opacity = 0.5;
              if (asd52Layer) asd52Layer.opacity = 0.5;
              if (asd53Layer) asd53Layer.opacity = 0.5;

              editGraphicsLayer.current.listMode = "show";

              setSnappingLayers();
            }

            sketchRef.current.availableCreateTools = ["polyline"];
            if (!mapContext.createToolActivated) {
              sketchRef.current._activateCreateTool("polyline");
              mapContext.onCreateToolActivated(true);
            }
            break;

          case 53: // Special Designation
            if (refAsd53Data.current && refAsd53Data.current.length > 0) {
              refAsd53Data.current.forEach((asd) => {
                if (asd.pkId === mapContext.currentEditObject.objectId) {
                  hasGeometry = !!asd.geometry;
                  editGraphicsLayer.current.graphics.add(createPolylineGraphic(asd.geometry));
                }
              });

              if (backgroundStreetLayerRef.current) backgroundStreetLayerRef.current.opacity = 0.25;
              if (unassignedEsusLayerRef.current) unassignedEsusLayerRef.current.opacity = 0.25;
              if (backgroundProvenanceLayerRef.current) backgroundProvenanceLayerRef.current.opacity = 0.25;
              if (backgroundPropertyLayerRef.current) backgroundPropertyLayerRef.current.opacity = 0.25;
              if (asd51Layer) asd51Layer.opacity = 0.5;
              if (asd52Layer) asd52Layer.opacity = 0.5;
              if (asd53Layer) asd53Layer.opacity = 0.5;

              editGraphicsLayer.current.listMode = "show";

              setSnappingLayers();
            }

            sketchRef.current.availableCreateTools = ["polyline"];
            if (!mapContext.createToolActivated) {
              sketchRef.current._activateCreateTool("polyline");
              mapContext.onCreateToolActivated(true);
            }
            break;

          case 61: // Interest
            if (refAsd61Data.current && refAsd61Data.current.length > 0) {
              refAsd61Data.current.forEach((asd) => {
                if (asd.pkId === mapContext.currentEditObject.objectId) {
                  hasGeometry = !!asd.geometry;
                  editGraphicsLayer.current.graphics.add(createPolylineGraphic(asd.geometry));
                }
              });

              if (backgroundStreetLayerRef.current) backgroundStreetLayerRef.current.opacity = 0.25;
              if (unassignedEsusLayerRef.current) unassignedEsusLayerRef.current.opacity = 0.25;
              if (backgroundProvenanceLayerRef.current) backgroundProvenanceLayerRef.current.opacity = 0.25;
              if (backgroundPropertyLayerRef.current) backgroundPropertyLayerRef.current.opacity = 0.25;
              if (asd61Layer) asd61Layer.opacity = 0.5;
              if (asd62Layer) asd62Layer.opacity = 0.5;
              if (asd63Layer) asd63Layer.opacity = 0.5;
              if (asd64Layer) asd64Layer.opacity = 0.5;
              if (asd66Layer) asd66Layer.opacity = 0.5;

              editGraphicsLayer.current.listMode = "show";

              setSnappingLayers();
            }

            sketchRef.current.availableCreateTools = ["polyline"];
            if (!mapContext.createToolActivated) {
              sketchRef.current._activateCreateTool("polyline");
              mapContext.onCreateToolActivated(true);
            }
            break;

          case 62: // Construction
            if (refAsd62Data.current && refAsd62Data.current.length > 0) {
              refAsd62Data.current.forEach((asd) => {
                if (asd.pkId === mapContext.currentEditObject.objectId) {
                  hasGeometry = !!asd.geometry;
                  editGraphicsLayer.current.graphics.add(createPolylineGraphic(asd.geometry));
                }
              });

              if (backgroundStreetLayerRef.current) backgroundStreetLayerRef.current.opacity = 0.25;
              if (unassignedEsusLayerRef.current) unassignedEsusLayerRef.current.opacity = 0.25;
              if (backgroundProvenanceLayerRef.current) backgroundProvenanceLayerRef.current.opacity = 0.25;
              if (backgroundPropertyLayerRef.current) backgroundPropertyLayerRef.current.opacity = 0.25;
              if (asd61Layer) asd61Layer.opacity = 0.5;
              if (asd62Layer) asd62Layer.opacity = 0.5;
              if (asd63Layer) asd63Layer.opacity = 0.5;
              if (asd64Layer) asd64Layer.opacity = 0.5;
              if (asd66Layer) asd66Layer.opacity = 0.5;

              editGraphicsLayer.current.listMode = "show";

              setSnappingLayers();
            }

            sketchRef.current.availableCreateTools = ["polyline"];
            if (!mapContext.createToolActivated) {
              sketchRef.current._activateCreateTool("polyline");
              mapContext.onCreateToolActivated(true);
            }
            break;

          case 63: // Special Designation
            if (refAsd63Data.current && refAsd63Data.current.length > 0) {
              refAsd63Data.current.forEach((asd) => {
                if (asd.pkId === mapContext.currentEditObject.objectId) {
                  hasGeometry = !!asd.geometry;
                  editGraphicsLayer.current.graphics.add(createPolylineGraphic(asd.geometry));
                }
              });

              if (backgroundStreetLayerRef.current) backgroundStreetLayerRef.current.opacity = 0.25;
              if (unassignedEsusLayerRef.current) unassignedEsusLayerRef.current.opacity = 0.25;
              if (backgroundProvenanceLayerRef.current) backgroundProvenanceLayerRef.current.opacity = 0.25;
              if (backgroundPropertyLayerRef.current) backgroundPropertyLayerRef.current.opacity = 0.25;
              if (asd61Layer) asd61Layer.opacity = 0.5;
              if (asd62Layer) asd62Layer.opacity = 0.5;
              if (asd63Layer) asd63Layer.opacity = 0.5;
              if (asd64Layer) asd64Layer.opacity = 0.5;
              if (asd66Layer) asd66Layer.opacity = 0.5;

              editGraphicsLayer.current.listMode = "show";

              setSnappingLayers();
            }

            sketchRef.current.availableCreateTools = ["polyline"];
            if (!mapContext.createToolActivated) {
              sketchRef.current._activateCreateTool("polyline");
              mapContext.onCreateToolActivated(true);
            }
            break;

          case 64: // Height, Width & Weight Restriction
            if (refAsd64Data.current && refAsd64Data.current.length > 0) {
              refAsd64Data.current.forEach((asd) => {
                if (asd.pkId === mapContext.currentEditObject.objectId) {
                  hasGeometry = !!asd.geometry;
                  editGraphicsLayer.current.graphics.add(createPolylineGraphic(asd.geometry));
                }
              });

              if (backgroundStreetLayerRef.current) backgroundStreetLayerRef.current.opacity = 0.25;
              if (unassignedEsusLayerRef.current) unassignedEsusLayerRef.current.opacity = 0.25;
              if (backgroundProvenanceLayerRef.current) backgroundProvenanceLayerRef.current.opacity = 0.25;
              if (backgroundPropertyLayerRef.current) backgroundPropertyLayerRef.current.opacity = 0.25;
              if (asd61Layer) asd61Layer.opacity = 0.5;
              if (asd62Layer) asd62Layer.opacity = 0.5;
              if (asd63Layer) asd63Layer.opacity = 0.5;
              if (asd64Layer) asd64Layer.opacity = 0.5;

              editGraphicsLayer.current.listMode = "show";

              setSnappingLayers();
            }

            sketchRef.current.availableCreateTools = ["polyline"];
            if (!mapContext.createToolActivated) {
              sketchRef.current._activateCreateTool("polyline");
              mapContext.onCreateToolActivated(true);
            }
            break;

          case 66: // Public right of way
            if (refAsd66Data.current && refAsd66Data.current.length > 0) {
              refAsd66Data.current.forEach((asd) => {
                if (asd.pkId === mapContext.currentEditObject.objectId) {
                  hasGeometry = !!asd.geometry;
                  editGraphicsLayer.current.graphics.add(createPolylineGraphic(asd.geometry));
                }
              });

              if (backgroundStreetLayerRef.current) backgroundStreetLayerRef.current.opacity = 0.25;
              if (unassignedEsusLayerRef.current) unassignedEsusLayerRef.current.opacity = 0.25;
              if (backgroundProvenanceLayerRef.current) backgroundProvenanceLayerRef.current.opacity = 0.25;
              if (backgroundPropertyLayerRef.current) backgroundPropertyLayerRef.current.opacity = 0.25;
              if (asd61Layer) asd61Layer.opacity = 0.5;
              if (asd62Layer) asd62Layer.opacity = 0.5;
              if (asd63Layer) asd63Layer.opacity = 0.5;
              if (asd64Layer) asd64Layer.opacity = 0.5;
              if (asd66Layer) asd66Layer.opacity = 0.5;

              editGraphicsLayer.current.listMode = "show";

              setSnappingLayers();
            }

            sketchRef.current.availableCreateTools = ["polyline"];
            if (!mapContext.createToolActivated) {
              sketchRef.current._activateCreateTool("polyline");
              mapContext.onCreateToolActivated(true);
            }
            break;

          default:
            const editingGraphic = editingObject.current && editingObject.current.objectType;
            if (backgroundStreetLayerRef.current) {
              backgroundStreetLayerRef.current.opacity = 0.5;
              if (!editingGraphic) backgroundStreetLayerRef.current.popupEnabled = true;
            }
            if (unassignedEsusLayerRef.current) {
              unassignedEsusLayerRef.current.opacity = 0.75;
              if (!editingGraphic) unassignedEsusLayerRef.current.popupEnabled = true;
            }
            if (streetLayer) {
              streetLayer.opacity = 1;
              if (!editingGraphic) streetLayer.popupEnabled = true;
            }
            if (llpgStreetLayer) {
              llpgStreetLayer.opacity = 1;
              if (!editingGraphic) llpgStreetLayer.popupEnabled = true;
            }
            if (asd51Layer) {
              asd51Layer.opacity = 1;
              if (!editingGraphic) asd51Layer.popupEnabled = true;
            }
            if (asd52Layer) {
              asd52Layer.opacity = 1;
              if (!editingGraphic) asd52Layer.popupEnabled = true;
            }
            if (asd53Layer) {
              asd53Layer.opacity = 1;
              if (!editingGraphic) asd53Layer.popupEnabled = true;
            }
            if (asd61Layer) {
              asd61Layer.opacity = 1;
              if (!editingGraphic) asd61Layer.popupEnabled = true;
            }
            if (asd62Layer) {
              asd62Layer.opacity = 1;
              if (!editingGraphic) asd62Layer.popupEnabled = true;
            }
            if (asd63Layer) {
              asd63Layer.opacity = 1;
              if (!editingGraphic) asd63Layer.popupEnabled = true;
            }
            if (asd64Layer) {
              asd64Layer.opacity = 1;
              if (!editingGraphic) asd64Layer.popupEnabled = true;
            }
            if (asd66Layer) {
              asd66Layer.opacity = 1;
              if (!editingGraphic) asd66Layer.popupEnabled = true;
            }
            if (backgroundProvenanceLayerRef.current) {
              backgroundProvenanceLayerRef.current.opacity = 0.5;
              if (!editingGraphic) backgroundProvenanceLayerRef.current.popupEnabled = true;
            }
            if (backgroundPropertyLayerRef.current) {
              backgroundPropertyLayerRef.current.opacity = 0.5;
              if (!editingGraphic) backgroundPropertyLayerRef.current.popupEnabled = true;
            }
            if (propertyLayer) {
              propertyLayer.opacity = 1;
              if (!editingGraphic) propertyLayer.popupEnabled = true;
            }
            if (extentLayer) {
              extentLayer.opacity = 1;
              if (!editingGraphic) extentLayer.popupEnabled = true;
            }
            editGraphicsLayer.current.listMode = "hide";
            sketchRef.current.availableCreateTools = [];
            sketchRef.current.visible = false;
            break;
        }
      }
    }
  }, [
    mapContext,
    streetContext.currentStreet,
    streetContext.currentRecord,
    propertyContext.currentProperty,
    propertyContext.currentRecord,
  ]);

  // ASD Layer visibility
  useEffect(() => {
    if (!mapRef.current || !mapRef.current.layers || !mapRef.current.layers.length) return;

    if (streetContext.currentRecord) {
      const asd51Layer = mapRef.current && mapRef.current.findLayerById(asd51LayerName);
      const asd52Layer = mapRef.current && mapRef.current.findLayerById(asd52LayerName);
      const asd53Layer = mapRef.current && mapRef.current.findLayerById(asd53LayerName);
      const asd61Layer = mapRef.current && mapRef.current.findLayerById(asd61LayerName);
      const asd62Layer = mapRef.current && mapRef.current.findLayerById(asd62LayerName);
      const asd63Layer = mapRef.current && mapRef.current.findLayerById(asd63LayerName);
      const asd64Layer = mapRef.current && mapRef.current.findLayerById(asd64LayerName);
      const asd66Layer = mapRef.current && mapRef.current.findLayerById(asd66LayerName);

      setASDLayerVisibility(51, asd51Layer, streetContext.currentRecord);
      setASDLayerVisibility(52, asd52Layer, streetContext.currentRecord);
      setASDLayerVisibility(53, asd53Layer, streetContext.currentRecord);
      setASDLayerVisibility(61, asd61Layer, streetContext.currentRecord);
      setASDLayerVisibility(62, asd62Layer, streetContext.currentRecord);
      setASDLayerVisibility(63, asd63Layer, streetContext.currentRecord);
      setASDLayerVisibility(64, asd64Layer, streetContext.currentRecord);
      setASDLayerVisibility(66, asd66Layer, streetContext.currentRecord);
    }
  }, [streetContext.currentRecord]);

  // Store sandboxContext
  useEffect(() => {
    sandbox.current = sandboxContext.currentSandbox;
  }, [sandboxContext.currentSandbox]);

  // Map actions and events
  useEffect(() => {
    if (view) {
      reactiveUtils.when(
        () => view.popup?.actions,
        () => {
          view.popup.on("trigger-action", function (event) {
            if (!view.popup.viewModel || recordAttributes.current === view.popup.viewModel.selectedFeature.attributes)
              return;

            recordAttributes.current = view.popup.viewModel.selectedFeature.attributes;

            switch (event.action.id) {
              case "open-street-record":
                checkForUnsavedChanges(handleOpenStreet);
                break;

              case "open-asd-51-record":
                checkForUnsavedChanges(handleOpenASD51);
                break;

              case "open-asd-52-record":
                checkForUnsavedChanges(handleOpenASD52);
                break;

              case "open-asd-53-record":
                checkForUnsavedChanges(handleOpenASD53);
                break;

              case "open-asd-61-record":
                checkForUnsavedChanges(handleOpenASD61);
                break;

              case "open-asd-62-record":
                checkForUnsavedChanges(handleOpenASD62);
                break;

              case "open-asd-63-record":
                checkForUnsavedChanges(handleOpenASD63);
                break;

              case "open-asd-64-record":
                checkForUnsavedChanges(handleOpenASD64);
                break;

              case "open-asd-66-record":
                checkForUnsavedChanges(handleOpenASD66);
                break;

              case "add-property":
                checkForUnsavedChanges(handleAddProperty);
                break;

              case "add-range-properties":
                checkForUnsavedChanges(handleAddRange);
                break;

              case "divide-esu":
                handleDivideEsu();
                break;

              case "assign-esu":
                handleAssignEsu();
                break;

              case "street-street-view":
                handleStreetStreetView();
                break;

              case "street-menu":
                break;

              case "open-property-record":
                checkForUnsavedChanges(handleOpenProperty);
                break;

              case "add-child":
                checkForUnsavedChanges(handleAddChild);
                break;

              case "add-range-children":
                checkForUnsavedChanges(handleAddChildren);
                break;

              case "property-radial-search":
                // Perform a property radial search
                break;

              case "property-activity-list":
                // Add property to the activity list
                break;

              case "property-street-view":
                // Open street view at property
                handlePropertyStreetView();
                break;

              case "property-menu":
                // Open property actions menu
                break;

              default:
                break;
            }

            //Close the popup
            view.popup.visible = false;
          });
        }
      );
    }
  }, [
    view,
    checkForUnsavedChanges,
    handleAddChild,
    handleAddChildren,
    handleAddProperty,
    handleAddRange,
    handleAssignEsu,
    handleDivideEsu,
    handleOpenASD51,
    handleOpenASD52,
    handleOpenASD53,
    handleOpenASD61,
    handleOpenASD62,
    handleOpenASD63,
    handleOpenASD64,
    handleOpenASD66,
    handleOpenProperty,
    handleOpenStreet,
    handleStreetStreetView,
    handlePropertyStreetView,
  ]);

  // Highlight map objects
  useEffect(() => {
    if (
      !view ||
      !mapRef.current ||
      !mapRef.current.layers ||
      mapRef.current.layers.length === 0 ||
      !mapContext.currentHighlight ||
      (!mapContext.currentHighlight.street &&
        !mapContext.currentHighlight.esu &&
        !mapContext.currentHighlight.asd51 &&
        !mapContext.currentHighlight.asd52 &&
        !mapContext.currentHighlight.asd53 &&
        !mapContext.currentHighlight.asd61 &&
        !mapContext.currentHighlight.asd62 &&
        !mapContext.currentHighlight.asd63 &&
        !mapContext.currentHighlight.asd64 &&
        !mapContext.currentHighlight.asd66 &&
        !mapContext.currentHighlight.property &&
        !mapContext.currentHighlight.selectProperties &&
        !mapContext.currentHighlight.extent)
    )
      return;

    const mapLayers = mapRef.current.layers.items;
    let streetLayer = null;
    let llpgStreetLayer = null;
    let backgroundStreetLayer = null;
    let unassignedEsuLayer = null;
    let asd51Layer = null;
    let asd52Layer = null;
    let asd53Layer = null;
    let asd61Layer = null;
    let asd62Layer = null;
    let asd63Layer = null;
    let asd64Layer = null;
    let asd66Layer = null;
    let propertyLayer = null;
    let selectPropertyLayer = null;
    let extentLayer = null;

    for (let index = 0; index < mapLayers.length; index++) {
      if (mapLayers[index] && mapLayers[index].id === streetLayerName) streetLayer = mapLayers[index];
      if (mapLayers[index] && mapLayers[index].id === llpgStreetLayerName) llpgStreetLayer = mapLayers[index];
      if (mapLayers[index] && mapLayers[index].id === backgroundStreetLayerName)
        backgroundStreetLayer = mapLayers[index];
      if (mapLayers[index] && mapLayers[index].id === unassignedEsusLayerName) unassignedEsuLayer = mapLayers[index];
      if (mapLayers[index] && mapLayers[index].id === asd51LayerName) asd51Layer = mapLayers[index];
      if (mapLayers[index] && mapLayers[index].id === asd52LayerName) asd52Layer = mapLayers[index];
      if (mapLayers[index] && mapLayers[index].id === asd53LayerName) asd53Layer = mapLayers[index];
      if (mapLayers[index] && mapLayers[index].id === asd61LayerName) asd61Layer = mapLayers[index];
      if (mapLayers[index] && mapLayers[index].id === asd62LayerName) asd62Layer = mapLayers[index];
      if (mapLayers[index] && mapLayers[index].id === asd63LayerName) asd63Layer = mapLayers[index];
      if (mapLayers[index] && mapLayers[index].id === asd64LayerName) asd64Layer = mapLayers[index];
      if (mapLayers[index] && mapLayers[index].id === asd66LayerName) asd66Layer = mapLayers[index];
      if (mapLayers[index] && mapLayers[index].id === propertyLayerName) propertyLayer = mapLayers[index];
      if (mapLayers[index] && mapLayers[index].id === selectPropertyLayerName) selectPropertyLayer = mapLayers[index];
      if (mapLayers[index] && mapLayers[index].id === extentLayerName) extentLayer = mapLayers[index];
    }

    if (mapContext.currentHighlight.street && streetLayer) {
      view
        .whenLayerView(streetLayer)
        .then(function (layerView) {
          let streetQuery = streetLayer.createQuery();
          streetQuery.where = `usrn IN ('${mapContext.currentHighlight.street.join("', '")}')`;
          streetLayer.queryFeatures(streetQuery).then(function (result) {
            if (highlightStreet.current) highlightStreet.current.remove();
            highlightStreet.current = layerView.highlight(result.features);
          });
        })
        .catch((error) => {
          if (error && userContext.current.currentUser.showMessages) {
            console.error("Error highlighting street", error);
          }
        });
    } else if (mapContext.currentHighlight.street && llpgStreetLayer) {
      view
        .whenLayerView(llpgStreetLayer)
        .then(function (layerView) {
          let streetQuery = llpgStreetLayer.createQuery();
          streetQuery.where = `usrn IN ('${mapContext.currentHighlight.street.join("', '")}')`;
          llpgStreetLayer.queryFeatures(streetQuery).then(function (result) {
            if (highlightStreet.current) highlightStreet.current.remove();
            highlightStreet.current = layerView.highlight(result.features);
          });
        })
        .catch((error) => {
          if (error && userContext.current.currentUser.showMessages) {
            console.error("Error highlighting street", error);
          }
        });
    } else if (highlightStreet.current) highlightStreet.current.remove();

    if (mapContext.currentHighlight.esu && streetLayer) {
      view
        .whenLayerView(streetLayer)
        .then(function (layerView) {
          let esuQuery = streetLayer.createQuery();
          esuQuery.where = `esuId IN ('${mapContext.currentHighlight.esu.join("', '")}')`;
          streetLayer.queryFeatures(esuQuery).then(function (result) {
            if (highlightESU.current) highlightESU.current.remove();
            highlightESU.current = layerView.highlight(result.features);
          });
        })
        .catch((error) => {
          if (error && userContext.current.currentUser.showMessages) {
            console.error("Error highlighting ESU", error);
          }
        });
    } else if (highlightESU.current) highlightESU.current.remove();

    if (mapContext.currentHighlight.esu && backgroundStreetLayer) {
      view
        .whenLayerView(backgroundStreetLayer)
        .then(function (layerView) {
          let backgroundEsuQuery = backgroundStreetLayer.createQuery();
          backgroundEsuQuery.where = `esuId IN ('${mapContext.currentHighlight.esu.join("', '")}')`;
          backgroundStreetLayer.queryFeatures(backgroundEsuQuery).then(function (result) {
            if (highlightBackgroundESU.current) highlightBackgroundESU.current.remove();
            highlightBackgroundESU.current = layerView.highlight(result.features);
          });
        })
        .catch((error) => {
          if (error && userContext.current.currentUser.showMessages) {
            console.error("Error highlighting background ESU", error);
          }
        });
    } else if (highlightBackgroundESU.current) highlightBackgroundESU.current.remove();

    if (mapContext.currentHighlight.esu && unassignedEsuLayer) {
      view
        .whenLayerView(unassignedEsuLayer)
        .then(function (layerView) {
          let unassignedEsuQuery = unassignedEsuLayer.createQuery();
          unassignedEsuQuery.where = `esuId IN ('${mapContext.currentHighlight.esu.join("', '")}')`;
          unassignedEsuLayer.queryFeatures(unassignedEsuQuery).then(function (result) {
            if (highlightUnassignedESU.current) highlightUnassignedESU.current.remove();
            highlightUnassignedESU.current = layerView.highlight(result.features);
          });
        })
        .catch((error) => {
          if (error && userContext.current.currentUser.showMessages) {
            console.error("Error highlighting unassigned ESU", error);
          }
        });
    } else if (highlightUnassignedESU.current) highlightUnassignedESU.current.remove();

    if (mapContext.currentHighlight.asd51 && asd51Layer) {
      view
        .whenLayerView(asd51Layer)
        .then(function (layerView) {
          let asd51Query = asd51Layer.createQuery();
          asd51Query.where = `PkId IN ('${mapContext.currentHighlight.asd51.join("', '")}')`;
          asd51Layer.queryFeatures(asd51Query).then(function (result) {
            if (highlightASD51.current) highlightASD51.current.remove();
            highlightASD51.current = layerView.highlight(result.features);
          });
        })
        .catch((error) => {
          if (error && userContext.current.currentUser.showMessages) {
            console.error("Error highlighting ASD51", error);
          }
        });
    } else if (highlightASD51.current) highlightASD51.current.remove();

    if (mapContext.currentHighlight.asd52 && asd52Layer) {
      view
        .whenLayerView(asd52Layer)
        .then(function (layerView) {
          let asd52Query = asd52Layer.createQuery();
          asd52Query.where = `PkId IN ('${mapContext.currentHighlight.asd52.join("', '")}')`;
          asd52Layer.queryFeatures(asd52Query).then(function (result) {
            if (highlightASD52.current) highlightASD52.current.remove();
            highlightASD52.current = layerView.highlight(result.features);
          });
        })
        .catch((error) => {
          if (error && userContext.current.currentUser.showMessages) {
            console.error("Error highlighting ASD52", error);
          }
        });
    } else if (highlightASD52.current) highlightASD52.current.remove();

    if (mapContext.currentHighlight.asd53 && asd53Layer) {
      view
        .whenLayerView(asd53Layer)
        .then(function (layerView) {
          let asd53Query = asd53Layer.createQuery();
          asd53Query.where = `PkId IN ('${mapContext.currentHighlight.asd53.join("', '")}')`;
          asd53Layer.queryFeatures(asd53Query).then(function (result) {
            if (highlightASD53.current) highlightASD53.current.remove();
            highlightASD53.current = layerView.highlight(result.features);
          });
        })
        .catch((error) => {
          if (error && userContext.current.currentUser.showMessages) {
            console.error("Error highlighting ASD53", error);
          }
        });
    } else if (highlightASD53.current) highlightASD53.current.remove();

    if (mapContext.currentHighlight.asd61 && asd61Layer) {
      view
        .whenLayerView(asd61Layer)
        .then(function (layerView) {
          let asd61Query = asd61Layer.createQuery();
          asd61Query.where = `PkId IN ('${mapContext.currentHighlight.asd61.join("', '")}')`;
          asd61Layer.queryFeatures(asd61Query).then(function (result) {
            if (highlightASD61.current) highlightASD61.current.remove();
            highlightASD61.current = layerView.highlight(result.features);
          });
        })
        .catch((error) => {
          if (error && userContext.current.currentUser.showMessages) {
            console.error("Error highlighting ASD61", error);
          }
        });
    } else if (highlightASD61.current) highlightASD61.current.remove();

    if (mapContext.currentHighlight.asd62 && asd62Layer) {
      view
        .whenLayerView(asd62Layer)
        .then(function (layerView) {
          let asd62Query = asd62Layer.createQuery();
          asd62Query.where = `PkId IN ('${mapContext.currentHighlight.asd62.join("', '")}')`;
          asd62Layer.queryFeatures(asd62Query).then(function (result) {
            if (highlightASD62.current) highlightASD62.current.remove();
            highlightASD62.current = layerView.highlight(result.features);
          });
        })
        .catch((error) => {
          if (error && userContext.current.currentUser.showMessages) {
            console.error("Error highlighting ASD62", error);
          }
        });
    } else if (highlightASD62.current) highlightASD62.current.remove();

    if (mapContext.currentHighlight.asd63 && asd63Layer) {
      view
        .whenLayerView(asd63Layer)
        .then(function (layerView) {
          let asd63Query = asd63Layer.createQuery();
          asd63Query.where = `PkId IN ('${mapContext.currentHighlight.asd63.join("', '")}')`;
          asd63Layer.queryFeatures(asd63Query).then(function (result) {
            if (highlightASD63.current) highlightASD63.current.remove();
            highlightASD63.current = layerView.highlight(result.features);
          });
        })
        .catch((error) => {
          if (error && userContext.current.currentUser.showMessages) {
            console.error("Error highlighting ASD63", error);
          }
        });
    } else if (highlightASD63.current) highlightASD63.current.remove();

    if (mapContext.currentHighlight.asd64 && asd64Layer) {
      view
        .whenLayerView(asd64Layer)
        .then(function (layerView) {
          let asd64Query = asd64Layer.createQuery();
          asd64Query.where = `PkId IN ('${mapContext.currentHighlight.asd64.join("', '")}')`;
          asd64Layer.queryFeatures(asd64Query).then(function (result) {
            if (highlightASD64.current) highlightASD64.current.remove();
            highlightASD64.current = layerView.highlight(result.features);
          });
        })
        .catch((error) => {
          if (error && userContext.current.currentUser.showMessages) {
            console.error("Error highlighting ASD64", error);
          }
        });
    } else if (highlightASD64.current) highlightASD64.current.remove();

    if (mapContext.currentHighlight.asd66 && asd66Layer) {
      view
        .whenLayerView(asd66Layer)
        .then(function (layerView) {
          let asd66Query = asd66Layer.createQuery();
          asd66Query.where = `PkId IN ('${mapContext.currentHighlight.asd66.join("', '")}')`;
          asd66Layer.queryFeatures(asd66Query).then(function (result) {
            if (highlightASD66.current) highlightASD66.current.remove();
            highlightASD66.current = layerView.highlight(result.features);
          });
        })
        .catch((error) => {
          if (error && userContext.current.currentUser.showMessages) {
            console.error("Error highlighting ASD66", error);
          }
        });
    } else if (highlightASD66.current) highlightASD66.current.remove();

    if (mapContext.currentHighlight.property) {
      if (propertyLayer) {
        view
          .whenLayerView(propertyLayer)
          .then(function (layerView) {
            let propertyQuery = propertyLayer.createQuery();
            propertyQuery.where = `uprn IN ('${mapContext.currentHighlight.property.join("', '")}')`;
            propertyLayer.queryFeatures(propertyQuery).then(function (result) {
              if (highlightProperty.current) highlightProperty.current.remove();
              highlightProperty.current = layerView.highlight(result.features);
            });
          })
          .catch((error) => {
            if (error && userContext.current.currentUser.showMessages) {
              console.error("Error highlighting properties: ", error);
            }
          });
      } else if (highlightProperty.current) highlightProperty.current.remove();

      if (extentLayer) {
        view
          .whenLayerView(extentLayer)
          .then(function (layerView) {
            let extentQuery = extentLayer.createQuery();
            extentQuery.where = `uprn IN ('${mapContext.currentHighlight.property.join("', '")}')`;
            extentLayer.queryFeatures(extentQuery).then(function (result) {
              if (highlightExtent.current) highlightExtent.current.remove();
              highlightExtent.current = layerView.highlight(result.features);
            });
          })
          .catch((error) => {
            if (error && userContext.current.currentUser.showMessages) {
              console.error("Error highlighting extents: ", error);
            }
          });
      } else if (highlightExtent.current) highlightExtent.current.remove();
    } else {
      if (highlightProperty.current) highlightProperty.current.remove();
      if (highlightExtent.current) highlightExtent.current.remove();
    }

    if (mapContext.currentHighlight.selectProperties) {
      if (selectPropertyLayer) {
        view
          .whenLayerView(selectPropertyLayer)
          .then(function (layerView) {
            let selectPropertyQuery = selectPropertyLayer.createQuery();
            selectPropertyQuery.where = `uprn IN ('${mapContext.currentHighlight.selectProperties.join("', '")}')`;
            selectPropertyLayer.queryFeatures(selectPropertyQuery).then(function (result) {
              if (highlightSelectProperty.current) highlightSelectProperty.current.remove();
              highlightSelectProperty.current = layerView.highlight(result.features);
            });
          })
          .catch((error) => {
            if (error && userContext.current.currentUser.showMessages) {
              console.error("Error highlighting selected properties: ", error);
            }
          });
      } else if (highlightSelectProperty.current) highlightSelectProperty.current.remove();
    } else if (highlightSelectProperty.current) highlightSelectProperty.current.remove();

    if (mapContext.currentHighlight.extent) {
      if (extentLayer) {
        view
          .whenLayerView(extentLayer)
          .then(function (layerView) {
            let extentQuery = extentLayer.createQuery();
            extentQuery.where = `pkId IN ('${mapContext.currentHighlight.extent.join("', '")}')`;
            extentLayer.queryFeatures(extentQuery).then(function (result) {
              if (highlightExtent.current) highlightExtent.current.remove();
              highlightExtent.current = layerView.highlight(result.features);
            });
          })
          .catch((error) => {
            if (error && userContext.current.currentUser.showMessages) {
              console.error("Error highlighting extents: ", error);
            }
          });
      } else if (highlightExtent.current) highlightExtent.current.remove();
    } else if (highlightExtent.current) highlightExtent.current.remove();
  }, [view, mapContext.currentHighlight]);

  // Capture coordinates
  useEffect(() => {
    if (!mapRef.current || !mapRef.current.layers || !mapRef.current.layers.length) return;

    const streetLayer = mapRef.current && mapRef.current.findLayerById(streetLayerName);
    const llpgStreetLayer = mapRef.current && mapRef.current.findLayerById(llpgStreetLayerName);
    const asd51Layer = mapRef.current && mapRef.current.findLayerById(asd51LayerName);
    const asd52Layer = mapRef.current && mapRef.current.findLayerById(asd52LayerName);
    const asd53Layer = mapRef.current && mapRef.current.findLayerById(asd53LayerName);
    const asd61Layer = mapRef.current && mapRef.current.findLayerById(asd61LayerName);
    const asd62Layer = mapRef.current && mapRef.current.findLayerById(asd62LayerName);
    const asd63Layer = mapRef.current && mapRef.current.findLayerById(asd63LayerName);
    const asd64Layer = mapRef.current && mapRef.current.findLayerById(asd64LayerName);
    const asd66Layer = mapRef.current && mapRef.current.findLayerById(asd66LayerName);

    if (
      coordinateConversionRef.current &&
      ["property", "streetStart", "streetEnd", "divideEsu"].includes(mapContext.currentPointCaptureMode)
    ) {
      coordinateConversionRef.current.mode = "capture";
      currentPointCaptureModeRef.current = mapContext.currentPointCaptureMode;
    } else if (mapContext.currentPointCaptureMode === "assignEsu") {
      currentPointCaptureModeRef.current = mapContext.currentPointCaptureMode;
      if (backgroundStreetLayerRef.current) backgroundStreetLayerRef.current.popupEnabled = false;
      if (unassignedEsusLayerRef.current) unassignedEsusLayerRef.current.popupEnabled = false;
      if (streetLayer) streetLayer.popupEnabled = false;
      if (llpgStreetLayer) llpgStreetLayer.popupEnabled = false;
      if (asd51Layer) asd51Layer.popupEnabled = false;
      if (asd52Layer) asd52Layer.popupEnabled = false;
      if (asd53Layer) asd53Layer.popupEnabled = false;
      if (asd61Layer) asd61Layer.popupEnabled = false;
      if (asd62Layer) asd62Layer.popupEnabled = false;
      if (asd63Layer) asd63Layer.popupEnabled = false;
      if (asd64Layer) asd64Layer.popupEnabled = false;
      if (asd66Layer) asd66Layer.popupEnabled = false;
    } else {
      coordinateConversionRef.current.mode = "live";
      currentPointCaptureModeRef.current = null;
      const editingGraphic = editingObject.current && editingObject.current.objectType;
      if (backgroundStreetLayerRef.current && !editingGraphic && !backgroundStreetLayerRef.current.popupEnabled)
        backgroundStreetLayerRef.current.popupEnabled = true;
      if (unassignedEsusLayerRef.current && !editingGraphic && !unassignedEsusLayerRef.current.popupEnabled)
        unassignedEsusLayerRef.current.popupEnabled = true;
      if (streetLayer && !editingGraphic && !streetLayer.popupEnabled) streetLayer.popupEnabled = true;
      if (llpgStreetLayer && !editingGraphic && !llpgStreetLayer.popupEnabled) llpgStreetLayer.popupEnabled = true;
      if (asd51Layer && !editingGraphic && !asd51Layer.popupEnabled) asd51Layer.popupEnabled = true;
      if (asd52Layer && !editingGraphic && !asd52Layer.popupEnabled) asd52Layer.popupEnabled = true;
      if (asd53Layer && !editingGraphic && !asd53Layer.popupEnabled) asd53Layer.popupEnabled = true;
      if (asd61Layer && !editingGraphic && !asd61Layer.popupEnabled) asd61Layer.popupEnabled = true;
      if (asd62Layer && !editingGraphic && !asd62Layer.popupEnabled) asd62Layer.popupEnabled = true;
      if (asd63Layer && !editingGraphic && !asd63Layer.popupEnabled) asd63Layer.popupEnabled = true;
      if (asd64Layer && !editingGraphic && !asd64Layer.popupEnabled) asd64Layer.popupEnabled = true;
      if (asd66Layer && !editingGraphic && !asd66Layer.popupEnabled) asd66Layer.popupEnabled = true;
    }
  }, [mapContext.currentPointCaptureMode]);

  // Property wizard finalise
  useEffect(() => {
    if (
      propertyContext.wizardData &&
      propertyContext.wizardData.source &&
      propertyContext.wizardData.source === "map"
    ) {
      if (!propertyContext.wizardData.savedProperty || propertyContext.wizardData.savedProperty.length === 0) {
        if (propertyContext.wizardData.type === "close") {
          setOpenPropertyWizard(false);
          displayingWizard.current = false;
        }
      } else {
        const savedUprn = Array.isArray(propertyContext.wizardData.savedProperty)
          ? propertyContext.wizardData.savedProperty[0].uprn
          : propertyContext.wizardData.savedProperty.uprn;

        if (savedUprn !== wizardUprn.current) {
          wizardUprn.current = savedUprn;

          switch (propertyContext.wizardData.type) {
            case "view":
              const rangeEngLpis = Array.isArray(propertyContext.wizardData.savedProperty)
                ? propertyContext.wizardData.savedProperty[0].lpis.filter((x) => x.language === "ENG")
                : propertyContext.wizardData.savedProperty.lpis.filter((x) => x.language === "ENG");
              switch (propertyContext.wizardData.variant) {
                case "range":
                  doOpenRecord(
                    {
                      type: 15,
                      usrn: rangeEngLpis[0].usrn,
                    },
                    rangeEngLpis[0].uprn,
                    searchContext.currentSearchData.results,
                    mapContext,
                    streetContext,
                    propertyContext,
                    userContext.current,
                    isScottish.current
                  );
                  break;

                case "rangeChildren":
                  const parentRec = {
                    type: 24,
                    uprn: propertyContext.wizardData.parent.uprn,
                    address: propertyContext.wizardData.parent.address,
                    formattedAddress: propertyContext.wizardData.parent.address,
                    postcode: propertyContext.wizardData.parent.postcode,
                    easting: propertyContext.wizardData.parent.xcoordinate,
                    northing: propertyContext.wizardData.parent.ycoordinate,
                    logical_status: propertyContext.wizardData.parent.logicalStatus,
                    classification_code: propertyContext.wizardData.parent.blpuClass,
                  };
                  const relatedObj = {
                    parent: propertyContext.wizardData.parent.uprn,
                    property: rangeEngLpis[0].uprn,
                    currentUser: userContext.current.currentUser,
                  };

                  if (parentRec.logical_status === 8) {
                    historicRec.current = { property: parentRec, related: relatedObj };
                    setOpenHistoricProperty(true);
                  } else
                    doOpenRecord(
                      parentRec,
                      relatedObj,
                      searchContext.currentSearchData.results,
                      mapContext,
                      streetContext,
                      propertyContext,
                      userContext.current,
                      isScottish.current
                    );
                  break;

                default:
                  const engLpis = propertyContext.wizardData.savedProperty.lpis.filter((x) => x.language === "ENG");
                  const savedRec = {
                    type: 24,
                    uprn: propertyContext.wizardData.savedProperty.uprn,
                    address: engLpis[0].address,
                    formattedAddress: engLpis[0].address,
                    postcode: engLpis[0].postcode,
                    easting: propertyContext.wizardData.savedProperty.xcoordinate,
                    northing: propertyContext.wizardData.savedProperty.ycoordinate,
                    logical_status: propertyContext.wizardData.savedProperty.logicalStatus,
                    classification_code: propertyContext.wizardData.savedProperty.blpuClass,
                  };

                  if (savedRec.logical_status === 8) {
                    historicRec.current = { property: savedRec, related: null };
                    setOpenHistoricProperty(true);
                  } else
                    doOpenRecord(
                      savedRec,
                      null,
                      searchContext.currentSearchData.results,
                      mapContext,
                      streetContext,
                      propertyContext,
                      userContext.current,
                      isScottish.current
                    );
                  break;
              }
              setOpenPropertyWizard(false);
              break;

            case "addChild":
              GetParentHierarchy(propertyContext.wizardData.savedProperty.uprn, userContext.current).then(
                (parentProperties) => {
                  if (!parentProperties || parentProperties.parent.currentParentChildLevel < 4) {
                    propertyContext.resetPropertyErrors();
                    propertyContext.onWizardDone(null, false, null, null);
                    mapContext.onWizardSetCoordinate(null);
                    propertyWizardType.current = "child";
                    propertyWizardParent.current = propertyContext.wizardData.parent;
                    setOpenPropertyWizard(true);
                  } else {
                    saveResult.current = false;
                    saveType.current = "maxParentLevel";
                    saveOpenRef.current = true;
                    setSaveOpen(true);
                  }
                }
              );
              break;

            case "addChildren":
              GetParentHierarchy(propertyContext.wizardData.savedProperty.uprn, userContext.current).then(
                (parentProperties) => {
                  if (!parentProperties || parentProperties.parent.currentParentChildLevel < 4) {
                    propertyContext.resetPropertyErrors();
                    propertyContext.onWizardDone(null, false, null, null);
                    mapContext.onWizardSetCoordinate(null);
                    propertyWizardType.current = "rangeChildren";
                    propertyWizardParent.current = propertyContext.wizardData.parent;
                    setOpenPropertyWizard(true);
                  } else {
                    saveResult.current = false;
                    saveType.current = "maxParentLevel";
                    saveOpenRef.current = true;
                    setSaveOpen(true);
                  }
                }
              );
              break;

            default:
              setOpenPropertyWizard(false);
              displayingWizard.current = false;
              break;
          }
        }
      }
    }
  }, [
    propertyContext.wizardData,
    mapContext,
    propertyContext,
    streetContext,
    userContext.current.currentUser.token,
    searchContext.currentSearchData.results,
  ]);

  // Selecting properties
  useEffect(() => {
    if (!mapRef.current || !mapRef.current.layers || !mapRef.current.layers.length) return;

    if (mapContext.currentBackgroundData.properties && !(editingObject.current && editingObject.current.objectType)) {
      const streetLayer = mapRef.current && mapRef.current.findLayerById(streetLayerName);
      const llpgStreetLayer = mapRef.current && mapRef.current.findLayerById(llpgStreetLayerName);
      const propertyLayer = mapRef.current && mapRef.current.findLayerById(propertyLayerName);
      const selectPropertyLayer = mapRef.current && mapRef.current.findLayerById(selectPropertyLayerName);

      if (mapContext.currentBackgroundData.properties.length > 0 && mapContext.selectingProperties) {
        if (!selectingProperties.current) {
          selectedProperties.current = [];

          selectingProperties.current = true;

          editGraphicsLayer.current.graphics.removeAll();
          editGraphicsLayer.current.listMode = "hide";

          if (backgroundStreetLayerRef.current)
            backgroundStreetLayerRef.current.visible = mapContext.layerVisibility.backgroundStreets;
          if (unassignedEsusLayerRef.current) unassignedEsusLayerRef.current.visible = false;
          if (streetLayer) streetLayer.opacity = 0.5;
          if (llpgStreetLayer) llpgStreetLayer.visible = false;
          if (backgroundProvenanceLayerRef.current) backgroundProvenanceLayerRef.current.visible = false;
          if (backgroundPropertyLayerRef.current) backgroundPropertyLayerRef.current.visible = false;
          if (propertyLayer) propertyLayer.visible = false;
          if (selectPropertyLayer) selectPropertyLayer.visible = true;

          viewRef.current
            .whenLayerView(editGraphicsLayer.current)
            .then((editGraphicsLayerView) => {
              editGraphicsLayerView.highlightOptions = {
                haloOpacity: 0,
                fillOpacity: 0,
              };
            })
            .catch((error) => {
              if (error && userContext.current.currentUser.showMessages) {
                console.error("Error setting highlight options", error);
              }
            });

          mapContext.currentBackgroundData.properties.forEach((property) => {
            editGraphicsLayer.current.graphics.add(
              createSelectablePointGraphic(property.easting, property.northing, property.uprn, property.logicalStatus)
            );
          });

          sketchRef.current.layer = editGraphicsLayer.current;

          sketchRef.current.availableCreateTools = [];
          sketchRef.current.visibleElements = {
            deleteButton: false,
            duplicateButton: false,
            settingsMenu: false,
            snappingControls: false,
            undoRedoMenu: false,
          };
          sketchRef.current.visible = userContext.current && userContext.current.currentUser.editProperty;
        }
      } else if (selectingProperties.current) {
        selectingProperties.current = false;

        if (backgroundStreetLayerRef.current)
          backgroundStreetLayerRef.current.visible = mapContext.layerVisibility.backgroundStreets;
        if (unassignedEsusLayerRef.current)
          unassignedEsusLayerRef.current.visible = mapContext.layerVisibility.unassignedEsus;
        if (streetLayer) streetLayer.opacity = 1;
        if (llpgStreetLayer) llpgStreetLayer.visible = true;
        if (backgroundProvenanceLayerRef.current)
          backgroundProvenanceLayerRef.current.visible = mapContext.layerVisibility.backgroundProvenances;
        if (backgroundPropertyLayerRef.current)
          backgroundPropertyLayerRef.current.visible = mapContext.layerVisibility.backgroundProperties;
        if (propertyLayer) propertyLayer.visible = true;
        if (selectPropertyLayer) selectPropertyLayer.visible = false;

        sketchRef.current.availableCreateTools = [];
        sketchRef.current.visibleElements = {
          deleteButton: true,
          duplicateButton: true,
          settingsMenu: true,
          snappingControls: true,
          undoRedoMenu: true,
        };
        sketchRef.current.visible = false;
      }
    }
  }, [mapContext.selectingProperties, mapContext.currentBackgroundData.properties, mapContext.layerVisibility]);

  useEffect(() => {
    if (mapContext.viewAuthorityExtent && view) {
      mapContext.onViewAuthorityExtent(false);

      backgroundExtent.current = getAuthorityExtent();
      view.extent = backgroundExtent.current;
    }
  }, [mapContext, view]);

  return (
    <Fragment>
      <div id="progress-indicator">
        {loading && <CircularProgress sx={{ position: "absolute", top: "50%", left: "60%" }} />}
      </div>
      <Box sx={dataFormStyle("ADSEsriMap")} ref={mapRef} id="ads-map">
        <Box id="ads-buttons" className="esri-widget esri-interactive" sx={{ borderRadius: "6px" }}>
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
            {displayESUMergeTool && (
              <IconButton onClick={handleMergeFeatures} size="small" title="Use selected lines for ESU">
                <MergeIcon sx={ActionIconStyle()} />
              </IconButton>
            )}
            {displayExtentMergeTool && (
              <IconButton onClick={handleMergeFeatures} size="small" title="Use selected features for extent">
                <MergeIcon sx={ActionIconStyle()} />
              </IconButton>
            )}
            <IconButton onClick={handleDisplayMeasurement} size="small" title="Measure distance/area">
              <StraightenIcon sx={ActionIconStyle()} />
            </IconButton>
          </Stack>
        </Box>
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
        <AddPropertyWizardDialog
          variant={propertyWizardType.current}
          parent={propertyWizardParent.current}
          isOpen={openPropertyWizard}
          onDone={handlePropertyWizardDone}
          onClose={handlePropertyWizardClose}
        />
        <HistoricPropertyDialog open={openHistoricProperty} onClose={handleHistoricPropertyClose} />
        <UploadShpFileDialog
          isOpen={openUploadShpFileDialog}
          currentIds={baseMappingLayerIds.current.concat(defaultMapLayerIds)}
          onClose={handleUploadShpFileDialogClose}
        />
        <Popper id={selectionId} open={selectionOpen} anchorEl={selectionAnchorEl} placement="top-start">
          <ADSSelectionControl
            selectionCount={
              displayExtentMergeTool
                ? selectedExtents && selectedExtents.length > 0
                  ? selectedExtents.length
                  : 0
                : selectedEsus.current && selectedEsus.current.length > 0
                ? selectedEsus.current.length
                : selectedProperties.current && selectedProperties.current.length > 0
                ? selectedProperties.current.length
                : 0
            }
            haveMapEsu={selectedEsus.current && selectedEsus.current.length > 0}
            currentEsu={selectedEsus.current}
            haveMapExtent={selectedExtents && selectedExtents.length > 0}
            currentExtent={selectedExtents}
            haveMapProperty={selectedProperties.current && selectedProperties.current.length > 0}
            propertyUprns={selectedProperties.current}
            onMergeExtent={handleMergeFeatures}
            onClose={handleCloseSelection}
          />
        </Popper>
      </div>
      {loadingShp && (
        <Backdrop open={loadingShp}>
          <CircularProgress color="inherit" />
        </Backdrop>
      )}
    </Fragment>
  );
}

export default ADSEsriMap;
