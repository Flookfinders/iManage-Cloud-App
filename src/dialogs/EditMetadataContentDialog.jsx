/* #region header */
/**************************************************************************************************
//
//  Description: Edit metadata content dialog
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
//    002   06.10.23 Sean Flook                 Use colour variables.
//    003   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system.
//    004   05.01.24 Sean Flook                 Use CSS shortcuts.
//    005   10.01.24 Sean Flook                 Fix warnings.
//    006   31.01.24 Joel Benford               Changes to as save and support OS
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Grid, Typography, Button } from "@mui/material";
import { Box, Stack } from "@mui/system";
import ADSSliderControl from "../components/ADSSliderControl";

import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";

import { adsBlueA } from "../utils/ADSColours";
import { blueButtonStyle, whiteButtonStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

EditMetadataContentDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  data: PropTypes.object.isRequired,
  variant: PropTypes.oneOf(["street", "asd"]).isRequired,
  onDone: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

function EditMetadataContentDialog({ isOpen, data, variant, onDone, onClose }) {
  const theme = useTheme();

  const [showDialog, setShowDialog] = useState(false);

  const [contentMotorwayTrunkRoad, setContentMotorwayTrunkRoad] = useState(null);
  const [contentPrivateStreet, setContentPrivateStreet] = useState(null);
  const [contentPrn, setContentPrn] = useState(null);
  const [contentClassifiedRoad, setContentClassifiedRoad] = useState(null);
  const [contentProwFootpath, setContentProwFootpath] = useState(null);
  const [contentProwBridleway, setContentProwBridleway] = useState(null);
  const [contentProwRestrictedByway, setContentProwRestrictedByway] = useState(null);
  const [contentProwBoat, setContentProwBoat] = useState(null);
  const [contentNationalCycleRoute, setContentNationalCycleRoute] = useState(null);

  const [mdProtectedStreet, setMdProtectedStreet] = useState(null);
  const [mdTrafficSensitive, setMdTrafficSensitive] = useState(null);
  const [mdSed, setMdSed] = useState(null);
  const [mdProposedSed, setMdProposedSed] = useState(null);
  const [mdLevelCrossing, setMdLevelCrossing] = useState(null);
  const [mdEnvSensitiveArea, setMdEnvSensitiveArea] = useState(null);
  const [mdStructuresNotSed, setMdStructuresNotSed] = useState(null);
  const [mdPipelinesAndCables, setMdPipelinesAndCables] = useState(null);
  const [mdPriorityLanes, setMdPriorityLanes] = useState(null);
  const [mdLaneRental, setMdLaneRental] = useState(null);
  const [mdEarlyNotification, setMdEarlyNotification] = useState(null);
  const [mdSpecialEvents, setMdSpecialEvents] = useState(null);
  const [mdParking, setMdParking] = useState(null);
  const [mdPedCrossAndSignals, setMdPedCrossAndSignals] = useState(null);
  const [mdSpeedLimit, setMdSpeedLimit] = useState(null);
  const [mdTransAuthApp, setMdTransAuthApp] = useState(null);
  const [mdStrategicRoute, setMdStrategicRoute] = useState(null);
  const [mdStreetLight, stMdStreetLight] = useState(null);
  const [mdDrainageAndFlood, setMdDrainageAndFlood] = useState(null);
  const [mdUnusualLayout, setMdUnusualLayout] = useState(null);
  const [mdLocalConsider, setMdLocalConsider] = useState(null);
  const [mdWinterMainRoute, setMdWinterMainRoute] = useState(null);
  const [mdHgvRoute, setMdHgvRoute] = useState(null);
  const [mdEmergencyRoute, setMdEmergencyRoute] = useState(null);

  /**
   * Event to handle when the done button is clicked.
   */
  const handleDoneClick = () => {
    if (onDone) onDone(getUpdatedData());
  };

  /**
   * Event to handle when the cancel button is clicked.
   */
  const handleCancelClick = () => {
    if (onClose) onClose();
    else setShowDialog(false);
  };

  /**
   * Event to handle when the dialog is closing.
   *
   * @param {object} event The event object.
   * @param {string} reason The reason why the dialog is closing.
   */
  const handleDialogClose = (event, reason) => {
    event.stopPropagation();
    if (reason === "escapeKeyDown") handleCancelClick();
  };

  /**
   * Method to get the updated metadata data.
   *
   * @returns {object} The current metadata data.
   */
  const getUpdatedData = () => {
    if (variant === "street")
      return {
        contentMotorwayTrunkRoad,
        contentPrivateStreet,
        contentPrn,
        contentClassifiedRoad,
        contentProwFootpath,
        contentProwBridleway,
        contentProwRestrictedByway,
        contentProwBoat,
        contentNationalCycleRoute,
      };
    else
      return {
        mdProtectedStreet,
        mdTrafficSensitive,
        mdSed,
        mdProposedSed,
        mdLevelCrossing,
        mdEnvSensitiveArea,
        mdStructuresNotSed,
        mdPipelinesAndCables,
        mdPriorityLanes,
        mdLaneRental,
        mdEarlyNotification,
        mdSpecialEvents,
        mdParking,
        mdPedCrossAndSignals,
        mdSpeedLimit,
        mdTransAuthApp,
        mdStrategicRoute,
        mdStreetLight,
        mdDrainageAndFlood,
        mdUnusualLayout,
        mdLocalConsider,
        mdWinterMainRoute,
        mdHgvRoute,
        mdEmergencyRoute,
      };
  };

  /**
   * Event to handle when the motorway and trunk roads changes.
   *
   * @param {number} newValue The new motorway and trunk roads.
   */
  const handleContentMotorwayTrunkRoadChangeEvent = (newValue) => {
    setContentMotorwayTrunkRoad(newValue);
  };

  /**
   * Event to handle when the private streets changes.
   *
   * @param {number} newValue The new private streets.
   */
  const handleContentPrivateStreetChangeEvent = (newValue) => {
    setContentPrivateStreet(newValue);
  };

  /**
   * Event to handle when the primary route network changes.
   *
   * @param {number} newValue The new primary route network.
   */
  const handleContentPrnChangeEvent = (newValue) => {
    setContentPrn(newValue);
  };

  /**
   * Event to handle when the classified roads changes.
   *
   * @param {number} newValue The new classified roads.
   */
  const handleContentClassifiedRoadChangeEvent = (newValue) => {
    setContentClassifiedRoad(newValue);
  };

  /**
   * Event to handle when the PRoW footpaths changes.
   *
   * @param {number} newValue The new PRoW footpaths.
   */
  const handleContentProwFootpathChangeEvent = (newValue) => {
    setContentProwFootpath(newValue);
  };

  /**
   * Event to handle when the PRoW bridleways changes.
   *
   * @param {number} newValue The new PRoW bridleways.
   */
  const handleContentProwBridlewayChangeEvent = (newValue) => {
    setContentProwBridleway(newValue);
  };

  /**
   * Event to handle when the PRoW restricted byways changes.
   *
   * @param {number} newValue The new PRoW restricted byways.
   */
  const handleContentProwRestrictedBywayChangeEvent = (newValue) => {
    setContentProwRestrictedByway(newValue);
  };

  /**
   * Event to handle when the PRoW BOAT changes.
   *
   * @param {number} newValue The new PRoW BOAT.
   */
  const handleContentProwBoatChangeEvent = (newValue) => {
    setContentProwBoat(newValue);
  };

  /**
   * Event to handle when the national cycle routes changes.
   *
   * @param {number} newValue The new national cycle routes.
   */
  const handleContentNationalCycleRouteChangeEvent = (newValue) => {
    setContentNationalCycleRoute(newValue);
  };

  /**
   * Event to handle when the protected streets changes.
   *
   * @param {number} newValue The new protected streets.
   */
  const handleMdProtectedStreetChangeEvent = (newValue) => {
    setMdProtectedStreet(newValue);
  };

  /**
   * Event to handle when the sensitive streets changes.
   *
   * @param {number} newValue The new sensitive streets.
   */
  const handleMdTrafficSensitiveStreetChangeEvent = (newValue) => {
    setMdTrafficSensitive(newValue);
  };

  /**
   * Event to handle when the special engineering difficulties changes.
   *
   * @param {number} newValue The new special engineering difficulties.
   */
  const handleMdSedChangeEvent = (newValue) => {
    setMdSed(newValue);
  };

  /**
   * Event to handle when the proposed SEDs changes.
   *
   * @param {number} newValue The new proposed SEDs.
   */
  const handleMdProposedSedChangeEvent = (newValue) => {
    setMdProposedSed(newValue);
  };

  /**
   * Event to handle when the level crossing changes.
   *
   * @param {number} newValue The new level crossing.
   */
  const handleMdLevelCrossingChangeEvent = (newValue) => {
    setMdLevelCrossing(newValue);
  };

  /**
   * Event to handle when the environmentally sensitive changes.
   *
   * @param {number} newValue The new environmentally sensitive.
   */
  const handleMdEnvSensitiveAreaChangeEvent = (newValue) => {
    setMdEnvSensitiveArea(newValue);
  };

  /**
   * Event to handle when the structures not SEDs changes.
   *
   * @param {number} newValue The new structures not SEDs.
   */
  const handleMdStructuresNotSedChangeEvent = (newValue) => {
    setMdStructuresNotSed(newValue);
  };

  /**
   * Event to handle when the pipelines and specialist cables changes.
   *
   * @param {number} newValue The new pipelines and specialist cables.
   */
  const handleMdPipelinesAndCablesChangeEvent = (newValue) => {
    setMdPipelinesAndCables(newValue);
  };

  /**
   * Event to handle when the priority lanes changes.
   *
   * @param {number} newValue The new priority lanes.
   */
  const handleMdPriorityLanesChangeEvent = (newValue) => {
    setMdPriorityLanes(newValue);
  };

  /**
   * Event to handle when the lane rental changes.
   *
   * @param {number} newValue The new lane rental.
   */
  const handleMdLaneRentalChangeEvent = (newValue) => {
    setMdLaneRental(newValue);
  };

  /**
   * Event to handle when the early notification streets changes.
   *
   * @param {number} newValue The new early notification streets.
   */
  const handleMdEarlyNotificationChangeEvent = (newValue) => {
    setMdEarlyNotification(newValue);
  };

  /**
   * Event to handle when the special events changes.
   *
   * @param {number} newValue The new special events.
   */
  const handleMdSpecialEventsChangeEvent = (newValue) => {
    setMdSpecialEvents(newValue);
  };

  /**
   * Event to handle when the parking charges changes.
   *
   * @param {number} newValue The new parking charges.
   */
  const handleMdParkingChangeEvent = (newValue) => {
    setMdParking(newValue);
  };

  /**
   * Event to handle when the pedestrian crossings changes.
   *
   * @param {number} newValue The new pedestrian crossings.
   */
  const handleMdPedCrossAndSignalsChangeEvent = (newValue) => {
    setMdPedCrossAndSignals(newValue);
  };

  /**
   * Event to handle when the speed limits changes.
   *
   * @param {number} newValue The new speed limits.
   */
  const handleMdSpeedLimitChangeEvent = (newValue) => {
    setMdSpeedLimit(newValue);
  };

  /**
   * Event to handle when the transport authority critical apparatus changes.
   *
   * @param {number} newValue The new transport authority critical apparatus.
   */
  const handleMdTransAuthAppChangeEvent = (newValue) => {
    setMdTransAuthApp(newValue);
  };

  /**
   * Event to handle when the strategic routes changes.
   *
   * @param {number} newValue The new strategic routes.
   */
  const handleMdStrategicRouteChangeEvent = (newValue) => {
    setMdStrategicRoute(newValue);
  };

  /**
   * Event to handle when the street lighting changes.
   *
   * @param {number} newValue The new street lighting.
   */
  const handleMdStreetLightingChangeEvent = (newValue) => {
    stMdStreetLight(newValue);
  };

  /**
   * Event to handle when the drainage and flood changes.
   *
   * @param {number} newValue The new drainage and flood.
   */
  const handleMdDrainageAndFloodChangeEvent = (newValue) => {
    setMdDrainageAndFlood(newValue);
  };

  /**
   * Event to handle when the unusual traffic layouts changes.
   *
   * @param {number} newValue The new unusual traffic layouts.
   */
  const handleMdUnusualLayoutChangeEvent = (newValue) => {
    setMdUnusualLayout(newValue);
  };

  /**
   * Event to handle when the local considerations changes.
   *
   * @param {number} newValue The new local considerations.
   */
  const handleMdLocalConsiderChangeEvent = (newValue) => {
    setMdLocalConsider(newValue);
  };

  /**
   * Event to handle when the winter maintenance routes changes.
   *
   * @param {number} newValue The new winter maintenance routes.
   */
  const handleMdWinterMainRouteChangeEvent = (newValue) => {
    setMdWinterMainRoute(newValue);
  };

  /**
   * Event to handle when the HGV approved routes changes.
   *
   * @param {number} newValue The new HGV approved routes.
   */
  const handleMdHgvRouteChangeEvent = (newValue) => {
    setMdHgvRoute(newValue);
  };

  /**
   * Event to handle when the emergency services routes changes.
   *
   * @param {number} newValue The new emergency services routes.
   */
  const handleMdEmergencyRouteChangeEvent = (newValue) => {
    setMdEmergencyRoute(newValue);
  };

  /**
   * Method to get the dialog title.
   *
   * @returns {string} The title.
   */
  const getTitle = () => {
    switch (variant) {
      case "street":
        return "Edit street content metadata";

      case "asd":
        return "Edit ASD content metadata";

      default:
        return "";
    }
  };

  useEffect(() => {
    if (data) {
      if (variant === "street") {
        setContentMotorwayTrunkRoad(data.contentMotorwayTrunkRoad);
        setContentPrivateStreet(data.contentPrivateStreet);
        setContentPrn(data.contentPrn);
        setContentClassifiedRoad(data.contentClassifiedRoad);
        setContentProwFootpath(data.contentProwFootpath);
        setContentProwBridleway(data.contentProwBridleway);
        setContentProwRestrictedByway(data.contentProwRestrictedByway);
        setContentProwBoat(data.contentProwBoat);
        setContentNationalCycleRoute(data.contentNationalCycleRoute);
      } else {
        setMdProtectedStreet(data.mdProtectedStreet);
        setMdTrafficSensitive(data.mdTrafficSensitive);
        setMdSed(data.mdSed);
        setMdProposedSed(data.mdProposedSed);
        setMdLevelCrossing(data.mdLevelCrossing);
        setMdEnvSensitiveArea(data.mdEnvSensitiveArea);
        setMdStructuresNotSed(data.mdStructuresNotSed);
        setMdPipelinesAndCables(data.mdPipelinesAndCables);
        setMdPriorityLanes(data.mdPriorityLanes);
        setMdLaneRental(data.mdLaneRental);
        setMdEarlyNotification(data.mdEarlyNotification);
        setMdSpecialEvents(data.mdSpecialEvents);
        setMdParking(data.mdParking);
        setMdPedCrossAndSignals(data.mdPedCrossAndSignals);
        setMdSpeedLimit(data.mdSpeedLimit);
        setMdTransAuthApp(data.mdTransAuthApp);
        setMdStrategicRoute(data.mdStrategicRoute);
        stMdStreetLight(data.mdStreetLight);
        setMdDrainageAndFlood(data.mdDrainageAndFlood);
        setMdUnusualLayout(data.mdUnusualLayout);
        setMdLocalConsider(data.mdLocalConsider);
        setMdWinterMainRoute(data.mdWinterMainRoute);
        setMdHgvRoute(data.mdHgvRoute);
        setMdEmergencyRoute(data.mdEmergencyRoute);
      }
    }

    setShowDialog(isOpen);
  }, [variant, data, isOpen]);

  return (
    <div>
      <Dialog
        open={showDialog}
        aria-labelledby="edit-metadata-content-dialog"
        fullWidth
        maxWidth="md"
        onClose={handleDialogClose}
      >
        <DialogTitle
          id="edit-metadata-content-dialog"
          sx={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: adsBlueA }}
        >
          <Typography sx={{ textSize: "20px" }}>{getTitle()}</Typography>
          <IconButton
            aria-label="close"
            onClick={handleCancelClick}
            sx={{ position: "absolute", right: 12, top: 12, color: (theme) => theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: theme.spacing(2) }}>
          <Grid container justifyContent="flex-start" spacing={0} sx={{ pl: theme.spacing(3.5) }}>
            <Grid item xs={12}>
              <Stack direction="column" spacing={2}>
                <Box>
                  {variant === "street" && (
                    <ADSSliderControl
                      label="Motorway trunk roads"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of Motorway / Trunk roads that are present in GeoPlace."
                      value={contentMotorwayTrunkRoad}
                      valueSuffix="%"
                      onChange={handleContentMotorwayTrunkRoadChangeEvent}
                    />
                  )}
                  {variant === "street" && (
                    <ADSSliderControl
                      label="Private streets"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of private Streets that are present in GeoPlace."
                      value={contentPrivateStreet}
                      valueSuffix="%"
                      onChange={handleContentPrivateStreetChangeEvent}
                    />
                  )}
                  {variant === "street" && (
                    <ADSSliderControl
                      label="Primary route network"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of the Primary Route Network that is present in GeoPlace."
                      value={contentPrn}
                      valueSuffix="%"
                      onChange={handleContentPrnChangeEvent}
                    />
                  )}
                  {variant === "street" && (
                    <ADSSliderControl
                      label="Classified roads"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of Classified Roads that are present in GeoPlace."
                      value={contentClassifiedRoad}
                      valueSuffix="%"
                      onChange={handleContentClassifiedRoadChangeEvent}
                    />
                  )}
                  {variant === "street" && (
                    <ADSSliderControl
                      label="PRoW footpaths"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of PRoW defined Footpaths that are present in GeoPlace."
                      value={contentProwFootpath}
                      valueSuffix="%"
                      onChange={handleContentProwFootpathChangeEvent}
                    />
                  )}
                  {variant === "street" && (
                    <ADSSliderControl
                      label="PRoW bridleways"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of PRoW defined Bridleways that are present in GeoPlace."
                      value={contentProwBridleway}
                      valueSuffix="%"
                      onChange={handleContentProwBridlewayChangeEvent}
                    />
                  )}
                  {variant === "street" && (
                    <ADSSliderControl
                      label="PRoW restricted byways"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of PRoW defined Restricted Byways that are present in GeoPlace."
                      value={contentProwRestrictedByway}
                      valueSuffix="%"
                      onChange={handleContentProwRestrictedBywayChangeEvent}
                    />
                  )}
                  {variant === "street" && (
                    <ADSSliderControl
                      label="PRoW BOAT"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of PRoW defined Byways Open to All Traffic that are present in GeoPlace."
                      value={contentProwBoat}
                      valueSuffix="%"
                      onChange={handleContentProwBoatChangeEvent}
                    />
                  )}
                  {variant === "street" && (
                    <ADSSliderControl
                      label="National cycle routes"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of National Cycle Routes that are present in GeoPlace."
                      value={contentNationalCycleRoute}
                      valueSuffix="%"
                      onChange={handleContentNationalCycleRouteChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Protected streets"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of Protected Streets that are present in GeoPlace."
                      value={mdProtectedStreet}
                      valueSuffix="%"
                      onChange={handleMdProtectedStreetChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Traffic sensitive streets"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage Traffic Sensitive Streets that are present in GeoPlace."
                      value={mdTrafficSensitive}
                      valueSuffix="%"
                      onChange={handleMdTrafficSensitiveStreetChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Special engineering difficulties"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of Special Engineering Difficulties (SEDs) that are present in GeoPlace."
                      value={mdSed}
                      valueSuffix="%"
                      onChange={handleMdSedChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Proposed SEDs"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of proposed Special Engineering Difficulties that are present in GeoPlace."
                      value={mdProposedSed}
                      valueSuffix="%"
                      onChange={handleMdProposedSedChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Level crossing safety zone"
                      isEditable
                      includeLabel
                      helperText="Percentage of Level Crossing Safety Zone that are present in GeoPlace."
                      value={mdLevelCrossing}
                      valueSuffix="%"
                      onChange={handleMdLevelCrossingChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Environmentally sensitive areas"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of Environmentally Sensitive Areas that are present in GeoPlace."
                      value={mdEnvSensitiveArea}
                      valueSuffix="%"
                      onChange={handleMdEnvSensitiveAreaChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Structures not SEDs"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of Structures that are not designated SEDs that are present in GeoPlace."
                      value={mdStructuresNotSed}
                      valueSuffix="%"
                      onChange={handleMdStructuresNotSedChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Pipelines and specialist cables"
                      isEditable
                      includeLabel
                      helperText="Percentage of Pipelines and Specialist Cables that are present in GeoPlace."
                      value={mdPipelinesAndCables}
                      valueSuffix="%"
                      onChange={handleMdPipelinesAndCablesChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Priority lanes"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of Priority Lanes that are present in GeoPlace."
                      value={mdPriorityLanes}
                      valueSuffix="%"
                      onChange={handleMdPriorityLanesChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Lane rental"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of Lane Rental data that is present in GeoPlace."
                      value={mdLaneRental}
                      valueSuffix="%"
                      onChange={handleMdLaneRentalChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Early notification streets"
                      isEditable
                      includeLabel
                      helperText="Percentage of Street subject to early notification of immediate activities that are present in GeoPlace."
                      value={mdEarlyNotification}
                      valueSuffix="%"
                      onChange={handleMdEarlyNotificationChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Special events"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of Special Events that are present in GeoPlace."
                      value={mdSpecialEvents}
                      valueSuffix="%"
                      onChange={handleMdSpecialEventsChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Parking bays and restrictions"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of this Parking Bays and restrictions that are present in GeoPlace."
                      value={mdParking}
                      valueSuffix="%"
                      onChange={handleMdParkingChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Pedestrian crossings and signals"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of Pedestrian Crossings, Traffic Signals and Traffic Sensors that are present in GeoPlace."
                      value={mdPedCrossAndSignals}
                      valueSuffix="%"
                      onChange={handleMdPedCrossAndSignalsChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Speed limits"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of Speed Limits that are present in GeoPlace."
                      value={mdSpeedLimit}
                      valueSuffix="%"
                      onChange={handleMdSpeedLimitChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Transport authority critical apparatus"
                      isEditable
                      includeLabel
                      helperText="Percentage of Transport Authority Critical Apparatus that are present in GeoPlace."
                      value={mdTransAuthApp}
                      valueSuffix="%"
                      onChange={handleMdTransAuthAppChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Strategic route"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of Strategic Routes that are present in GeoPlace."
                      value={mdStrategicRoute}
                      valueSuffix="%"
                      onChange={handleMdStrategicRouteChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Street lighting"
                      isEditable
                      includeLabel
                      helperText="Percentage of Street Lighting that is present in GeoPlace."
                      value={mdStreetLight}
                      valueSuffix="%"
                      onChange={handleMdStreetLightingChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Drainage and flood risk areas"
                      isEditable
                      includeLabel
                      helperText="Percentage of Drainage and Flood Risk areas that are present in GeoPlace."
                      value={mdDrainageAndFlood}
                      valueSuffix="%"
                      onChange={handleMdDrainageAndFloodChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Unusual traffic layouts"
                      isEditable
                      includeLabel
                      helperText="Percentage of Streets that have an Unusual Traffic Layout that are present in GeoPlace."
                      value={mdUnusualLayout}
                      valueSuffix="%"
                      onChange={handleMdUnusualLayoutChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Local considerations"
                      isEditable
                      includeLabel
                      helperText="Percentage of Streets with Local Considerations that are present in GeoPlace."
                      value={mdLocalConsider}
                      valueSuffix="%"
                      onChange={handleMdLocalConsiderChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Winter maintenance routes"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of Streets with Winter Maintenance Routes that are present in GeoPlace."
                      value={mdWinterMainRoute}
                      valueSuffix="%"
                      onChange={handleMdWinterMainRouteChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="HGV approved routes"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of HGV Approved Routes that are present in GeoPlace."
                      value={mdHgvRoute}
                      valueSuffix="%"
                      onChange={handleMdHgvRouteChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Emergency services routes"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of Emergency Services Routes that are present in GeoPlace."
                      value={mdEmergencyRoute}
                      valueSuffix="%"
                      onChange={handleMdEmergencyRouteChangeEvent}
                    />
                  )}
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "flex-start", mb: theme.spacing(1), ml: theme.spacing(3) }}>
          <Button onClick={handleDoneClick} autoFocus variant="contained" sx={blueButtonStyle} startIcon={<DoneIcon />}>
            Done
          </Button>
          <Button onClick={handleCancelClick} variant="contained" sx={whiteButtonStyle} startIcon={<CloseIcon />}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default EditMetadataContentDialog;
