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

  const [motorwayTrunkRoads, setMotorwayTrunkRoads] = useState(null);
  const [privateStreets, setPrivateStreets] = useState(null);
  const [primaryRouteNetwork, setPrimaryRouteNetwork] = useState(null);
  const [classifiedRoads, setClassifiedRoads] = useState(null);
  const [prowFootpaths, setProwFootpaths] = useState(null);
  const [prowBridleways, setProwBridleways] = useState(null);
  const [prowRestrictedByways, setProwRestrictedByways] = useState(null);
  const [prowBoat, setProwBoat] = useState(null);
  const [nationalCycleRoutes, setNationalCycleRoutes] = useState(null);

  const [protectedStreets, setProtectedStreets] = useState(null);
  const [trafficSensitiveStreets, setTrafficSensitiveStreets] = useState(null);
  const [specialEngineeringDifficulties, setSpecialEngineeringDifficulties] = useState(null);
  const [proposedSEDs, setProposedSEDs] = useState(null);
  const [levelCrossing, setLevelCrossing] = useState(null);
  const [environmentallySensitiveAreas, setEnvironmentallySensitiveAreas] = useState(null);
  const [structuresNotSEDs, setStructuresNotSEDs] = useState(null);
  const [pipelinesAndSpecialistCables, setPipelinesAndSpecialistCables] = useState(null);
  const [priorityLanes, setPriorityLanes] = useState(null);
  const [laneRental, setLaneRental] = useState(null);
  const [EarlyNotificationStreets, setEarlyNotificationStreets] = useState(null);
  const [specialEvents, setSpecialEvents] = useState(null);
  const [parking, setParking] = useState(null);
  const [pedestrianCrossings, setPedestrianCrossings] = useState(null);
  const [speedLimits, setSpeedLimits] = useState(null);
  const [transportAuthorityCriticalApparatus, setTransportAuthorityCriticalApparatus] = useState(null);
  const [strategicRoute, setStrategicRoute] = useState(null);
  const [streetLighting, setStreetLighting] = useState(null);
  const [drainageAndFlood, setDrainageAndFlood] = useState(null);
  const [unusualTrafficLayouts, setUnusualTrafficLayouts] = useState(null);
  const [localConsiderations, setLocalConsiderations] = useState(null);
  const [winterMaintenanceRoutes, setWinterMaintenanceRoutes] = useState(null);
  const [hgvApprovedRoutes, setHgvApprovedRoutes] = useState(null);
  const [emergencyServicesRoutes, setEmergencyServicesRoutes] = useState(null);

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
        motorwayTrunkRoads: motorwayTrunkRoads,
        privateStreets: privateStreets,
        primaryRouteNetwork: primaryRouteNetwork,
        classifiedRoads: classifiedRoads,
        prowFootpaths: prowFootpaths,
        prowBridleways: prowBridleways,
        prowRestrictedByways: prowRestrictedByways,
        prowBoat: prowBoat,
        nationalCycleRoutes: nationalCycleRoutes,
      };
    else
      return {
        protectedStreets: protectedStreets,
        trafficSensitiveStreets: trafficSensitiveStreets,
        specialEngineeringDifficulties: specialEngineeringDifficulties,
        proposedSEDs: proposedSEDs,
        levelCrossing: levelCrossing,
        environmentallySensitiveAreas: environmentallySensitiveAreas,
        structuresNotSEDs: structuresNotSEDs,
        pipelinesAndSpecialistCables: pipelinesAndSpecialistCables,
        priorityLanes: priorityLanes,
        laneRental: laneRental,
        earlyNotificationStreets: EarlyNotificationStreets,
        specialEvents: specialEvents,
        parking: parking,
        pedestrianCrossings: pedestrianCrossings,
        speedLimits: speedLimits,
        transportAuthorityCriticalApparatus: transportAuthorityCriticalApparatus,
        strategicRoute: strategicRoute,
        streetLighting: streetLighting,
        drainageAndFlood: drainageAndFlood,
        unusualTrafficLayouts: unusualTrafficLayouts,
        localConsiderations: localConsiderations,
        winterMaintenanceRoutes: winterMaintenanceRoutes,
        hgvApprovedRoutes: hgvApprovedRoutes,
        emergencyServicesRoutes: emergencyServicesRoutes,
      };
  };

  /**
   * Event to handle when the motorway and trunk roads changes.
   *
   * @param {number} newValue The new motorway and trunk roads.
   */
  const handleMotorwayTrunkRoadsChangeEvent = (newValue) => {
    setMotorwayTrunkRoads(newValue);
  };

  /**
   * Event to handle when the private streets changes.
   *
   * @param {number} newValue The new private streets.
   */
  const handlePrivateStreetsChangeEvent = (newValue) => {
    setPrivateStreets(newValue);
  };

  /**
   * Event to handle when the primary route network changes.
   *
   * @param {number} newValue The new primary route network.
   */
  const handlePrimaryRouteNetworkChangeEvent = (newValue) => {
    setPrimaryRouteNetwork(newValue);
  };

  /**
   * Event to handle when the classified roads changes.
   *
   * @param {number} newValue The new classified roads.
   */
  const handleClassifiedRoadsChangeEvent = (newValue) => {
    setClassifiedRoads(newValue);
  };

  /**
   * Event to handle when the PRoW footpaths changes.
   *
   * @param {number} newValue The new PRoW footpaths.
   */
  const handleProwFootpathsChangeEvent = (newValue) => {
    setProwFootpaths(newValue);
  };

  /**
   * Event to handle when the PRoW bridleways changes.
   *
   * @param {number} newValue The new PRoW bridleways.
   */
  const handleProwBridlewaysChangeEvent = (newValue) => {
    setProwBridleways(newValue);
  };

  /**
   * Event to handle when the PRoW restricted byways changes.
   *
   * @param {number} newValue The new PRoW restricted byways.
   */
  const handleProwRestrictedBywaysChangeEvent = (newValue) => {
    setProwRestrictedByways(newValue);
  };

  /**
   * Event to handle when the PRoW BOAT changes.
   *
   * @param {number} newValue The new PRoW BOAT.
   */
  const handleProwBoatChangeEvent = (newValue) => {
    setProwBoat(newValue);
  };

  /**
   * Event to handle when the national cycle routes changes.
   *
   * @param {number} newValue The new national cycle routes.
   */
  const handleNationalCycleRoutesChangeEvent = (newValue) => {
    setNationalCycleRoutes(newValue);
  };

  /**
   * Event to handle when the protected streets changes.
   *
   * @param {number} newValue The new protected streets.
   */
  const handleProtectedStreetsChangeEvent = (newValue) => {
    setProtectedStreets(newValue);
  };

  /**
   * Event to handle when the sensitive streets changes.
   *
   * @param {number} newValue The new sensitive streets.
   */
  const handleTrafficSensitiveStreetsChangeEvent = (newValue) => {
    setTrafficSensitiveStreets(newValue);
  };

  /**
   * Event to handle when the special engineering difficulties changes.
   *
   * @param {number} newValue The new special engineering difficulties.
   */
  const handleSpecialEngineeringDifficultiesChangeEvent = (newValue) => {
    setSpecialEngineeringDifficulties(newValue);
  };

  /**
   * Event to handle when the proposed SEDs changes.
   *
   * @param {number} newValue The new proposed SEDs.
   */
  const handleProposedSEDsChangeEvent = (newValue) => {
    setProposedSEDs(newValue);
  };

  /**
   * Event to handle when the level crossing changes.
   *
   * @param {number} newValue The new level crossing.
   */
  const handleLevelCrossingChangeEvent = (newValue) => {
    setLevelCrossing(newValue);
  };

  /**
   * Event to handle when the environmentally sensitive changes.
   *
   * @param {number} newValue The new environmentally sensitive.
   */
  const handleEnvironmentallySensitiveAreasChangeEvent = (newValue) => {
    setEnvironmentallySensitiveAreas(newValue);
  };

  /**
   * Event to handle when the structures not SEDs changes.
   *
   * @param {number} newValue The new structures not SEDs.
   */
  const handleStructuresNotSEDsChangeEvent = (newValue) => {
    setStructuresNotSEDs(newValue);
  };

  /**
   * Event to handle when the pipelines and specialist cables changes.
   *
   * @param {number} newValue The new pipelines and specialist cables.
   */
  const handlePipelinesAndSpecialistCablesChangeEvent = (newValue) => {
    setPipelinesAndSpecialistCables(newValue);
  };

  /**
   * Event to handle when the priority lanes changes.
   *
   * @param {number} newValue The new priority lanes.
   */
  const handlePriorityLanesChangeEvent = (newValue) => {
    setPriorityLanes(newValue);
  };

  /**
   * Event to handle when the lane rental changes.
   *
   * @param {number} newValue The new lane rental.
   */
  const handleLaneRentalChangeEvent = (newValue) => {
    setLaneRental(newValue);
  };

  /**
   * Event to handle when the early notification streets changes.
   *
   * @param {number} newValue The new early notification streets.
   */
  const handleEarlyNotificationStreetsChangeEvent = (newValue) => {
    setEarlyNotificationStreets(newValue);
  };

  /**
   * Event to handle when the special events changes.
   *
   * @param {number} newValue The new special events.
   */
  const handleSpecialEventsChangeEvent = (newValue) => {
    setSpecialEvents(newValue);
  };

  /**
   * Event to handle when the parking charges changes.
   *
   * @param {number} newValue The new parking charges.
   */
  const handleParkingChangeEvent = (newValue) => {
    setParking(newValue);
  };

  /**
   * Event to handle when the pedestrian crossings changes.
   *
   * @param {number} newValue The new pedestrian crossings.
   */
  const handlePedestrianCrossingsChangeEvent = (newValue) => {
    setPedestrianCrossings(newValue);
  };

  /**
   * Event to handle when the speed limits changes.
   *
   * @param {number} newValue The new speed limits.
   */
  const handleSpeedLimitsChangeEvent = (newValue) => {
    setSpeedLimits(newValue);
  };

  /**
   * Event to handle when the transport authority critical apparatus changes.
   *
   * @param {number} newValue The new transport authority critical apparatus.
   */
  const handleTransportAuthorityCriticalApparatusChangeEvent = (newValue) => {
    setTransportAuthorityCriticalApparatus(newValue);
  };

  /**
   * Event to handle when the strategic routes changes.
   *
   * @param {number} newValue The new strategic routes.
   */
  const handleStrategicRouteChangeEvent = (newValue) => {
    setStrategicRoute(newValue);
  };

  /**
   * Event to handle when the street lighting changes.
   *
   * @param {number} newValue The new street lighting.
   */
  const handleStreetLightingChangeEvent = (newValue) => {
    setStreetLighting(newValue);
  };

  /**
   * Event to handle when the drainage and flood changes.
   *
   * @param {number} newValue The new drainage and flood.
   */
  const handleDrainageAndFloodChangeEvent = (newValue) => {
    setDrainageAndFlood(newValue);
  };

  /**
   * Event to handle when the unusual traffic layouts changes.
   *
   * @param {number} newValue The new unusual traffic layouts.
   */
  const handleUnusualTrafficLayoutsChangeEvent = (newValue) => {
    setUnusualTrafficLayouts(newValue);
  };

  /**
   * Event to handle when the local considerations changes.
   *
   * @param {number} newValue The new local considerations.
   */
  const handleLocalConsiderationsChangeEvent = (newValue) => {
    setLocalConsiderations(newValue);
  };

  /**
   * Event to handle when the winter maintenance routes changes.
   *
   * @param {number} newValue The new winter maintenance routes.
   */
  const handleWinterMaintenanceRoutesChangeEvent = (newValue) => {
    setWinterMaintenanceRoutes(newValue);
  };

  /**
   * Event to handle when the HGV approved routes changes.
   *
   * @param {number} newValue The new HGV approved routes.
   */
  const handleHgvApprovedRoutesChangeEvent = (newValue) => {
    setHgvApprovedRoutes(newValue);
  };

  /**
   * Event to handle when the emergency services routes changes.
   *
   * @param {number} newValue The new emergency services routes.
   */
  const handleEmergencyServicesRoutesChangeEvent = (newValue) => {
    setEmergencyServicesRoutes(newValue);
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
        setMotorwayTrunkRoads(data.motorwayTrunkRoads);
        setPrivateStreets(data.privateStreets);
        setPrimaryRouteNetwork(data.primaryRouteNetwork);
        setClassifiedRoads(data.classifiedRoads);
        setProwFootpaths(data.prowFootpaths);
        setProwBridleways(data.prowBridleways);
        setProwRestrictedByways(data.prowRestrictedByways);
        setProwBoat(data.prowBoat);
        setNationalCycleRoutes(data.nationalCycleRoutes);
      } else {
        setProtectedStreets(data.protectedStreets);
        setTrafficSensitiveStreets(data.trafficSensitiveStreets);
        setSpecialEngineeringDifficulties(data.specialEngineeringDifficulties);
        setProposedSEDs(data.proposedSEDs);
        setLevelCrossing(data.levelCrossing);
        setEnvironmentallySensitiveAreas(data.environmentallySensitiveAreas);
        setStructuresNotSEDs(data.structuresNotSEDs);
        setPipelinesAndSpecialistCables(data.pipelinesAndSpecialistCables);
        setPriorityLanes(data.priorityLanes);
        setLaneRental(data.laneRental);
        setEarlyNotificationStreets(data.earlyNotificationStreets);
        setSpecialEvents(data.specialEvents);
        setParking(data.parking);
        setPedestrianCrossings(data.pedestrianCrossings);
        setSpeedLimits(data.speedLimits);
        setTransportAuthorityCriticalApparatus(data.transportAuthorityCriticalApparatus);
        setStrategicRoute(data.strategicRoute);
        setStreetLighting(data.streetLighting);
        setDrainageAndFlood(data.drainageAndFlood);
        setUnusualTrafficLayouts(data.unusualTrafficLayouts);
        setLocalConsiderations(data.localConsiderations);
        setWinterMaintenanceRoutes(data.winterMaintenanceRoutes);
        setHgvApprovedRoutes(data.hgvApprovedRoutes);
        setEmergencyServicesRoutes(data.emergencyServicesRoutes);
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
                      value={motorwayTrunkRoads}
                      valueSuffix="%"
                      onChange={handleMotorwayTrunkRoadsChangeEvent}
                    />
                  )}
                  {variant === "street" && (
                    <ADSSliderControl
                      label="Private streets"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of private Streets that are present in GeoPlace."
                      value={privateStreets}
                      valueSuffix="%"
                      onChange={handlePrivateStreetsChangeEvent}
                    />
                  )}
                  {variant === "street" && (
                    <ADSSliderControl
                      label="Primary route network"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of the Primary Route Network that is present in GeoPlace."
                      value={primaryRouteNetwork}
                      valueSuffix="%"
                      onChange={handlePrimaryRouteNetworkChangeEvent}
                    />
                  )}
                  {variant === "street" && (
                    <ADSSliderControl
                      label="Classified roads"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of Classified Roads that are present in GeoPlace."
                      value={classifiedRoads}
                      valueSuffix="%"
                      onChange={handleClassifiedRoadsChangeEvent}
                    />
                  )}
                  {variant === "street" && (
                    <ADSSliderControl
                      label="PRoW footpaths"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of PRoW defined Footpaths that are present in GeoPlace."
                      value={prowFootpaths}
                      valueSuffix="%"
                      onChange={handleProwFootpathsChangeEvent}
                    />
                  )}
                  {variant === "street" && (
                    <ADSSliderControl
                      label="PRoW bridleways"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of PRoW defined Bridleways that are present in GeoPlace."
                      value={prowBridleways}
                      valueSuffix="%"
                      onChange={handleProwBridlewaysChangeEvent}
                    />
                  )}
                  {variant === "street" && (
                    <ADSSliderControl
                      label="PRoW restricted byways"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of PRoW defined Restricted Byways that are present in GeoPlace."
                      value={prowRestrictedByways}
                      valueSuffix="%"
                      onChange={handleProwRestrictedBywaysChangeEvent}
                    />
                  )}
                  {variant === "street" && (
                    <ADSSliderControl
                      label="PRoW BOAT"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of PRoW defined Byways Open to All Traffic that are present in GeoPlace."
                      value={prowBoat}
                      valueSuffix="%"
                      onChange={handleProwBoatChangeEvent}
                    />
                  )}
                  {variant === "street" && (
                    <ADSSliderControl
                      label="National cycle routes"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of National Cycle Routes that are present in GeoPlace."
                      value={nationalCycleRoutes}
                      valueSuffix="%"
                      onChange={handleNationalCycleRoutesChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Protected streets"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of Protected Streets that are present in GeoPlace."
                      value={protectedStreets}
                      valueSuffix="%"
                      onChange={handleProtectedStreetsChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Traffic sensitive streets"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage Traffic Sensitive Streets that are present in GeoPlace."
                      value={trafficSensitiveStreets}
                      valueSuffix="%"
                      onChange={handleTrafficSensitiveStreetsChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Special engineering difficulties"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of Special Engineering Difficulties (SEDs) that are present in GeoPlace."
                      value={specialEngineeringDifficulties}
                      valueSuffix="%"
                      onChange={handleSpecialEngineeringDifficultiesChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Proposed SEDs"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of proposed Special Engineering Difficulties that are present in GeoPlace."
                      value={proposedSEDs}
                      valueSuffix="%"
                      onChange={handleProposedSEDsChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Level crossing safety zone"
                      isEditable
                      includeLabel
                      helperText="Percentage of Level Crossing Safety Zone that are present in GeoPlace."
                      value={levelCrossing}
                      valueSuffix="%"
                      onChange={handleLevelCrossingChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Environmentally sensitive areas"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of Environmentally Sensitive Areas that are present in GeoPlace."
                      value={environmentallySensitiveAreas}
                      valueSuffix="%"
                      onChange={handleEnvironmentallySensitiveAreasChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Structures not SEDs"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of Structures that are not designated SEDs that are present in GeoPlace."
                      value={structuresNotSEDs}
                      valueSuffix="%"
                      onChange={handleStructuresNotSEDsChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Pipelines and specialist cables"
                      isEditable
                      includeLabel
                      helperText="Percentage of Pipelines and Specialist Cables that are present in GeoPlace."
                      value={pipelinesAndSpecialistCables}
                      valueSuffix="%"
                      onChange={handlePipelinesAndSpecialistCablesChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Priority lanes"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of Priority Lanes that are present in GeoPlace."
                      value={priorityLanes}
                      valueSuffix="%"
                      onChange={handlePriorityLanesChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Lane rental"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of Lane Rental data that is present in GeoPlace."
                      value={laneRental}
                      valueSuffix="%"
                      onChange={handleLaneRentalChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Early notification streets"
                      isEditable
                      includeLabel
                      helperText="Percentage of Street subject to early notification of immediate activities that are present in GeoPlace."
                      value={EarlyNotificationStreets}
                      valueSuffix="%"
                      onChange={handleEarlyNotificationStreetsChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Special events"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of Special Events that are present in GeoPlace."
                      value={specialEvents}
                      valueSuffix="%"
                      onChange={handleSpecialEventsChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Parking bays and restrictions"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of this Parking Bays and restrictions that are present in GeoPlace."
                      value={parking}
                      valueSuffix="%"
                      onChange={handleParkingChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Pedestrian crossings and signals"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of Pedestrian Crossings, Traffic Signals and Traffic Sensors that are present in GeoPlace."
                      value={pedestrianCrossings}
                      valueSuffix="%"
                      onChange={handlePedestrianCrossingsChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Speed limits"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of Speed Limits that are present in GeoPlace."
                      value={speedLimits}
                      valueSuffix="%"
                      onChange={handleSpeedLimitsChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Transport authority critical apparatus"
                      isEditable
                      includeLabel
                      helperText="Percentage of Transport Authority Critical Apparatus that are present in GeoPlace."
                      value={transportAuthorityCriticalApparatus}
                      valueSuffix="%"
                      onChange={handleTransportAuthorityCriticalApparatusChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Strategic route"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of Strategic Routes that are present in GeoPlace."
                      value={strategicRoute}
                      valueSuffix="%"
                      onChange={handleStrategicRouteChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Street lighting"
                      isEditable
                      includeLabel
                      helperText="Percentage of Street Lighting that is present in GeoPlace."
                      value={streetLighting}
                      valueSuffix="%"
                      onChange={handleStreetLightingChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Drainage and flood risk areas"
                      isEditable
                      includeLabel
                      helperText="Percentage of Drainage and Flood Risk areas that are present in GeoPlace."
                      value={drainageAndFlood}
                      valueSuffix="%"
                      onChange={handleDrainageAndFloodChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Unusual traffic layouts"
                      isEditable
                      includeLabel
                      helperText="Percentage of Streets that have an Unusual Traffic Layout that are present in GeoPlace."
                      value={unusualTrafficLayouts}
                      valueSuffix="%"
                      onChange={handleUnusualTrafficLayoutsChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Local considerations"
                      isEditable
                      includeLabel
                      helperText="Percentage of Streets with Local Considerations that are present in GeoPlace."
                      value={localConsiderations}
                      valueSuffix="%"
                      onChange={handleLocalConsiderationsChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Winter maintenance routes"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of Streets with Winter Maintenance Routes that are present in GeoPlace."
                      value={winterMaintenanceRoutes}
                      valueSuffix="%"
                      onChange={handleWinterMaintenanceRoutesChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="HGV approved routes"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of HGV Approved Routes that are present in GeoPlace."
                      value={hgvApprovedRoutes}
                      valueSuffix="%"
                      onChange={handleHgvApprovedRoutesChangeEvent}
                    />
                  )}
                  {variant === "asd" && (
                    <ADSSliderControl
                      label="Emergency services routes"
                      isEditable
                      isRequired
                      includeLabel
                      helperText="Percentage of Emergency Services Routes that are present in GeoPlace."
                      value={emergencyServicesRoutes}
                      valueSuffix="%"
                      onChange={handleEmergencyServicesRoutesChangeEvent}
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
