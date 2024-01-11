/* #region header */
/**************************************************************************************************
//
//  Description: Property template data form
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   30.07.21 Sean Flook         WI39??? Initial Revision.
//    002   17.03.23 Sean Flook         WI40578 Added ability to filter templates by templateUseType.
//    003   06.10.23 Sean Flook                 Use colour variables.
//    004   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system.
//    005   05.01.24 Sean Flook                 Use CSS shortcuts.
//    006   10.01.24 Sean Flook                 Fix warnings.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useState } from "react";

import {
  Button,
  Typography,
  Paper,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import Masonry from "@mui/lab/Masonry";

import AddIcon from "@mui/icons-material/Add";
import HomeIcon from "@mui/icons-material/Home";
import ListIcon from "@mui/icons-material/List";
import DomainIcon from "@mui/icons-material/Domain";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  PlotDevelopmentIcon,
  OfficialDevelopmentIcon,
  IndustrialEstateIcon,
  PropertyShellIcon,
} from "../utils/ADSIcons";

import { adsBlueA, adsLightBlue, adsMagenta, adsDarkBlue } from "../utils/ADSColours";
import {
  blueButtonStyle,
  settingsFormStyle,
  ActionIconStyle,
  tooltipStyle,
  settingsCardStyle,
  settingsCardTitleStyle,
} from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

function PropertyTemplatesDataForm({
  nodeId,
  data,
  onAddTemplate,
  onEditTemplate,
  onDuplicateTemplate,
  onDeleteTemplate,
}) {
  const theme = useTheme();

  const [selectedCard, setSelectedCard] = useState(null);

  const stackStyle = { ml: theme.spacing(2), mt: theme.spacing(1), width: "65vw" };

  /**
   * Event to handle adding a new template.
   */
  const doAddTemplate = () => {
    if (onAddTemplate) onAddTemplate();
  };

  /**
   * Event to handle editing a template.
   *
   * @param {object} event The event object.
   * @param {number} pkId The id of the template to edit.
   */
  const doEditTemplate = (event, pkId) => {
    event.stopPropagation();
    if (onEditTemplate) onEditTemplate(pkId);
  };

  /**
   * Event to handle duplicating a template.
   *
   * @param {object} event The event object.
   * @param {number} pkId The id of the template to duplicate.
   */
  const doDuplicateTemplate = (event, pkId) => {
    event.stopPropagation();
    if (onDuplicateTemplate) onDuplicateTemplate(pkId);
  };

  /**
   * Event to handle deleting a template.
   *
   * @param {object} event The event object.
   * @param {number} pkId The id of the template to delete.
   */
  const doDeleteTemplate = (event, pkId) => {
    event.stopPropagation();
    if (onDeleteTemplate) onDeleteTemplate(pkId);
  };

  /**
   * Event to handle when the mouse enters a card.
   *
   * @param {number} pkId The id of the template.
   */
  const handleMouseEnterCard = (pkId) => {
    setSelectedCard(pkId);
  };

  /**
   * Event to handle when the mouse leaves a card.
   *
   * @param {object} event The event object.
   */
  const handleMouseLeaveCard = (event) => {
    event.stopPropagation();
    setSelectedCard(null);
  };

  /**
   * Method to get the styling for the avatar.
   *
   * @param {number} type The type of the template.
   * @param {boolean} highlighted True it the avatar is highlighted; otherwise false.
   * @returns {object} The styling for the avatar.
   */
  const getAvatarStyle = (type, highlighted) => {
    if (highlighted)
      return {
        backgroundColor: adsBlueA,
        width: "24px",
        height: "24px",
        mt: "2px",
      };
    else
      switch (type) {
        case 2: // Library
          return {
            backgroundColor: adsLightBlue,
            width: "24px",
            height: "24px",
            mt: "2px",
          };

        case 3: // User
          return {
            backgroundColor: adsDarkBlue,
            width: "24px",
            height: "24px",
            mt: "2px",
          };

        default:
          return {
            backgroundColor: adsMagenta,
            width: "24px",
            height: "24px",
            mt: "2px",
          };
      }
  };

  /**
   * Method to get the avatar icon.
   *
   * @param {number} system The system value for the template.
   * @returns {JSX.Element} The avatar icon.
   */
  const getAvatarIcon = (system) => {
    switch (system) {
      case 2: // Range
        return <ListIcon />;

      case 3: // Plot
        return PlotDevelopmentIcon();

      case 4: // Official
        return OfficialDevelopmentIcon();

      case 5: // Flats
        return <DomainIcon />;

      case 6: // Bedsits
        return <LocationCityIcon />;

      case 7: // Industrial
        return IndustrialEstateIcon();

      case 8: // Offices
        return <BusinessCenterIcon />;

      case 9: // Property shell
        return PropertyShellIcon();

      case 10: // User
        return <PersonIcon />;

      default: // Single
        return <HomeIcon />;
    }
  };

  /**
   * Method to get the template card.
   *
   * @param {object} rec The template record.
   * @param {number} index The index of the record in the array.
   * @returns {JSX.Element} The template card.
   */
  const getTemplateCard = (rec, index) => {
    return (
      <Box>
        <Card
          id={`template-${index}-card`}
          variant="outlined"
          elevation={0}
          onMouseEnter={() => handleMouseEnterCard(rec.templatePkId)}
          onMouseLeave={handleMouseLeaveCard}
          sx={settingsCardStyle(selectedCard && selectedCard === rec.templatePkId)}
        >
          <CardActionArea onClick={(event) => doEditTemplate(event, rec.templatePkId)}>
            <CardContent>
              <Stack direction="row" spacing={1}>
                <Avatar
                  variant={rec.templateType === 3 ? "rounded" : "circular"}
                  sx={getAvatarStyle(rec.templateType, selectedCard && selectedCard === rec.templatePkId)}
                >
                  {getAvatarIcon(rec.numberingSystem)}
                </Avatar>
                <Typography
                  variant="h6"
                  align="left"
                  sx={settingsCardTitleStyle(selectedCard && selectedCard === rec.templatePkId)}
                >
                  {rec.templateName}
                </Typography>
              </Stack>
              <Typography variant="body2" align="left" sx={{ mt: theme.spacing(1) }}>
                {rec.templateDescription}
              </Typography>
            </CardContent>
          </CardActionArea>
          <CardActions sx={{ height: "30px" }}>
            <Stack direction="row" spacing={2} sx={{ ml: theme.spacing(1) }}>
              {selectedCard && selectedCard === rec.templatePkId && (
                <Tooltip title="Edit template" placement="bottom" sx={tooltipStyle}>
                  <IconButton onClick={(event) => doEditTemplate(event, rec.templatePkId)} size="small">
                    <EditIcon sx={ActionIconStyle(true)} />
                  </IconButton>
                </Tooltip>
              )}
              {selectedCard && selectedCard === rec.templatePkId && (
                <Tooltip title="Duplicate template" placement="bottom" sx={tooltipStyle}>
                  <IconButton onClick={(event) => doDuplicateTemplate(event, rec.templatePkId)} size="small">
                    <ContentCopyIcon sx={ActionIconStyle(true)} />
                  </IconButton>
                </Tooltip>
              )}
              {selectedCard && selectedCard === rec.templatePkId && rec.templateType === 3 && (
                <Tooltip title="Delete template" placement="bottom" sx={tooltipStyle}>
                  <IconButton onClick={(event) => doDeleteTemplate(event, rec.templatePkId)} size="small">
                    <DeleteOutlineIcon sx={ActionIconStyle(true)} />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </CardActions>
        </Card>
      </Box>
    );
  };

  return (
    <div id="property-templates-data-form">
      <Stack direction="column" spacing={2} sx={stackStyle}>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" sx={blueButtonStyle} startIcon={<AddIcon />} onClick={doAddTemplate}>
            <Typography variant="body2">Template</Typography>
          </Button>
        </Stack>
        <Box sx={settingsFormStyle}>
          <Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={{ xs: 1, sm: 2, md: 3 }}>
            {data &&
              data.length > 0 &&
              nodeId === "ALL" &&
              data.map((rec, index) => <Paper key={index}>{getTemplateCard(rec, index)}</Paper>)}
            {data &&
              data.length > 0 &&
              nodeId === "ALL-SINGLE-PROPERTY" &&
              data
                .filter((x) => x.templateUseType === 1)
                .map((rec, index) => <Paper key={index}>{getTemplateCard(rec, index)}</Paper>)}
            {data &&
              data.length > 0 &&
              nodeId === "ALL-RANGE-PROPERTIES" &&
              data
                .filter((x) => x.templateUseType === 2)
                .map((rec, index) => <Paper key={index}>{getTemplateCard(rec, index)}</Paper>)}
            {data &&
              data.length > 0 &&
              nodeId === "ALL-SINGLE-CHILD" &&
              data
                .filter((x) => x.templateUseType === 3)
                .map((rec, index) => <Paper key={index}>{getTemplateCard(rec, index)}</Paper>)}
            {data &&
              data.length > 0 &&
              nodeId === "ALL-RANGE-CHILDREN" &&
              data
                .filter((x) => x.templateUseType === 4)
                .map((rec, index) => <Paper key={index}>{getTemplateCard(rec, index)}</Paper>)}
            {data &&
              data.length > 0 &&
              nodeId === "LIBRARY" &&
              data
                .filter((x) => [1, 2].includes(x.templateType))
                .map((rec, index) => <Paper key={index}>{getTemplateCard(rec, index)}</Paper>)}
            {data &&
              data.length > 0 &&
              nodeId === "LIBRARY-SINGLE-PROPERTY" &&
              data
                .filter((x) => [1, 2].includes(x.templateType) && x.templateUseType === 1)
                .map((rec, index) => <Paper key={index}>{getTemplateCard(rec, index)}</Paper>)}
            {data &&
              data.length > 0 &&
              nodeId === "LIBRARY-RANGE-PROPERTIES" &&
              data
                .filter((x) => [1, 2].includes(x.templateType) && x.templateUseType === 2)
                .map((rec, index) => <Paper key={index}>{getTemplateCard(rec, index)}</Paper>)}
            {data &&
              data.length > 0 &&
              nodeId === "LIBRARY-SINGLE-CHILD" &&
              data
                .filter((x) => [1, 2].includes(x.templateType) && x.templateUseType === 3)
                .map((rec, index) => <Paper key={index}>{getTemplateCard(rec, index)}</Paper>)}
            {data &&
              data.length > 0 &&
              nodeId === "LIBRARY-RANGE-CHILDREN" &&
              data
                .filter((x) => [1, 2].includes(x.templateType) && x.templateUseType === 4)
                .map((rec, index) => <Paper key={index}>{getTemplateCard(rec, index)}</Paper>)}
            {data &&
              data.length > 0 &&
              nodeId === "USER" &&
              data
                .filter((x) => [1, 3].includes(x.templateType))
                .map((rec, index) => <Paper key={index}>{getTemplateCard(rec, index)}</Paper>)}
            {data &&
              data.length > 0 &&
              nodeId === "USER-SINGLE-PROPERTY" &&
              data
                .filter((x) => [1, 3].includes(x.templateType) && x.templateUseType === 1)
                .map((rec, index) => <Paper key={index}>{getTemplateCard(rec, index)}</Paper>)}
            {data &&
              data.length > 0 &&
              nodeId === "USER-RANGE-PROPERTIES" &&
              data
                .filter((x) => [1, 3].includes(x.templateType) && x.templateUseType === 2)
                .map((rec, index) => <Paper key={index}>{getTemplateCard(rec, index)}</Paper>)}
            {data &&
              data.length > 0 &&
              nodeId === "USER-SINGLE-CHILD" &&
              data
                .filter((x) => [1, 3].includes(x.templateType) && x.templateUseType === 3)
                .map((rec, index) => <Paper key={index}>{getTemplateCard(rec, index)}</Paper>)}
            {data &&
              data.length > 0 &&
              nodeId === "USER-RANGE-CHILDREN" &&
              data
                .filter((x) => [1, 3].includes(x.templateType) && x.templateUseType === 4)
                .map((rec, index) => <Paper key={index}>{getTemplateCard(rec, index)}</Paper>)}
          </Masonry>
        </Box>
      </Stack>
    </div>
  );
}

export default PropertyTemplatesDataForm;
