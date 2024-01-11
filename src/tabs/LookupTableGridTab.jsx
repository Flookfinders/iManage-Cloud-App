/* #region header */
/**************************************************************************************************
//
//  Description: Lookup table grid tab
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
//    003   24.11.23 Sean Flook                 Moved Box and Stack to @mui/system and removed a warning.
//    004   08.12.23 Sean Flook                 Migrated DataGrid to v6.
//    005   05.01.24 Sean Flook                 Use CSS shortcuts.
//    006   10.01.24 Sean Flook                 Fix warnings.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import LookupContext from "../context/lookupContext";
import SettingsContext from "../context/settingsContext";

import {
  TextField,
  InputAdornment,
  Button,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Tooltip,
  IconButton,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import { DataGrid } from "@mui/x-data-grid";
import ADSActionButton from "../components/ADSActionButton";

import { lookupToTitleCase, GeoPlaceCrossRefSources, stringToSentenceCase } from "../utils/HelperUtils";

import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import { AddCircleOutlineOutlined as AddCircleIcon } from "@mui/icons-material";
import {
  adsBlueA,
  adsLightGreyB,
  adsLightBlue10,
  adsDarkGrey10,
  adsDarkGrey20,
  adsLightGreyC,
  adsMidGreyA,
  adsPaleBlueB,
} from "../utils/ADSColours";
import { ActionIconStyle, ClearSearchIconStyle, blueButtonStyle, tooltipStyle } from "../utils/ADSStyles";
import { createTheme } from "@mui/material/styles";
import { useTheme, makeStyles } from "@mui/styles";

const defaultTheme = createTheme();
const useStyles = makeStyles(
  (theme) => {
    return {
      root: {
        "& .live-row": {
          "&:hover": {
            backgroundColor: adsPaleBlueB,
            color: adsBlueA,
            // cursor: "pointer",
          },
        },
        "& .historic-row": {
          backgroundColor: adsDarkGrey10,
          "&:hover": {
            backgroundColor: adsDarkGrey20,
            color: adsBlueA,
            // cursor: "pointer",
          },
        },
      },
    };
  },
  { defaultTheme }
);

LookupTableGridTab.propTypes = {
  variant: PropTypes.oneOf([
    "postcode",
    "postTown",
    "subLocality",
    "crossReference",
    "locality",
    "town",
    "island",
    "administrativeArea",
    "authority",
    "ward",
    "parish",
  ]).isRequired,
  data: PropTypes.array.isRequired,
  onAddLookup: PropTypes.func.isRequired,
  onEditLookup: PropTypes.func.isRequired,
  onDeleteLookup: PropTypes.func,
};

function LookupTableGridTab({ variant, data, onAddLookup, onEditLookup, onDeleteLookup }) {
  const theme = useTheme();
  const classes = useStyles();

  const lookupContext = useContext(LookupContext);
  const settingsContext = useContext(SettingsContext);

  const [lookupType, setLookupType] = useState("unknown");
  const [lookupTypeId, setLookupTypeId] = useState(0);
  const [displayData, setDisplayData] = useState(data);

  const [sortModel, setSortModel] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);

  const [searchString, setSearchString] = useState("");

  /**
   * Method to display the action buttons for each row of the grid.
   *
   * @param {object} params The parameters passed into the method from the grid.
   * @returns {JSX.Element} The actions buttons for the row.
   */
  const displayActionButtons = (params) => {
    const onEditClick = (event) => {
      event.stopPropagation();
      if (onEditLookup) onEditLookup(params.row.id);
    };

    const onDeleteClick = (event) => {
      event.stopPropagation();
      if (onDeleteLookup) onDeleteLookup(params.row.id);
    };

    const isGeoPlaceCrossRef = (id) => {
      const crossReferenceRecord = lookupContext.currentLookups.appCrossRefs.find((x) => x.pkId === id);
      if (crossReferenceRecord) {
        const sourceCode = crossReferenceRecord.xrefSourceRef73.substring(4);
        return GeoPlaceCrossRefSources.includes(sourceCode);
      } else return false;
    };

    return selectedRow && params.id > 0 && params.id === selectedRow ? (
      <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
        <ADSActionButton
          id={`edit-${lookupTypeId}-${params.id}`}
          variant="edit"
          inheritBackground
          tooltipTitle={`Edit ${lookupType}`}
          tooltipPlacement="bottom"
          onClick={onEditClick}
        />
        {(variant !== "crossReference" || !isGeoPlaceCrossRef(params.id)) && (
          <ADSActionButton
            id={`delete-${lookupTypeId}-${params.id}`}
            variant="deleteForever"
            inheritBackground
            tooltipTitle={`Delete ${lookupType} forever`}
            tooltipPlacement="bottom"
            onClick={onDeleteClick}
          />
        )}
      </Stack>
    ) : null;
  };

  /**
   * Method to get the postcode.
   *
   * @param {object} params The parameters passed into the method from the grid.
   * @returns {JSX.Element} The display of for the postcode
   */
  function GetPostcode(params) {
    if (params) {
      if (params.row.historic)
        return (
          <Typography variant="body2" sx={{ textDecoration: "line-through" }}>
            {params.value}
          </Typography>
        );
      else return <Typography variant="body2">{params.value}</Typography>;
    }
  }

  /**
   * Method to get the English post town.
   *
   * @param {object} params The parameters passed into the method from the grid.
   * @returns {JSX.Element} The display of for the English post town.
   */
  function GetPostTownEng(params) {
    if (params && params.row.postTownEng) {
      if (params.row.historic)
        return (
          <Typography variant="body2" sx={{ textDecoration: "line-through" }}>
            {lookupToTitleCase(params.value, false)}
          </Typography>
        );
      else return <Typography variant="body2">{lookupToTitleCase(params.value, false)}</Typography>;
    }
  }

  /**
   * Method to get the Welsh post town.
   *
   * @param {object} params The parameters passed into the method from the grid.
   * @returns {JSX.Element} The display of for the Welsh post town.
   */
  function GetPostTownCym(params) {
    if (params && params.row.postTownCym) {
      if (params.row.historic)
        return (
          <Typography variant="body2" sx={{ textDecoration: "line-through" }}>
            {lookupToTitleCase(params.value, false)}
          </Typography>
        );
      else return <Typography variant="body2">{lookupToTitleCase(params.value, false)}</Typography>;
    }
  }

  /**
   * Method to get the Scottish post town.
   *
   * @param {object} params The parameters passed into the method from the grid.
   * @returns {JSX.Element} The display of for the Scottish post town.
   */
  function GetPostTownGae(params) {
    if (params && params.row.postTownGae) {
      if (params.row.historic)
        return (
          <Typography variant="body2" sx={{ textDecoration: "line-through" }}>
            {lookupToTitleCase(params.value, false)}
          </Typography>
        );
      else return <Typography variant="body2">{lookupToTitleCase(params.value, false)}</Typography>;
    }
  }

  /**
   * Method to get the English sub-locality.
   *
   * @param {object} params The parameters passed into the method from the grid.
   * @returns {JSX.Element} The display of for the English sub-locality.
   */
  function GetSubLocalityEng(params) {
    if (params && params.row.subLocalityEng) {
      if (params.row.historic)
        return (
          <Typography variant="body2" sx={{ textDecoration: "line-through" }}>
            {lookupToTitleCase(params.value, false)}
          </Typography>
        );
      else return <Typography variant="body2">{lookupToTitleCase(params.value, false)}</Typography>;
    }
  }

  /**
   * Method to get the Scottish sub-locality.
   *
   * @param {object} params The parameters passed into the method from the grid.
   * @returns {JSX.Element} The display of for the Scottish sub-locality.
   */
  function GetSubLocalityGae(params) {
    if (params && params.row.subLocalityGae) {
      if (params.row.historic)
        return (
          <Typography variant="body2" sx={{ textDecoration: "line-through" }}>
            {lookupToTitleCase(params.value, false)}
          </Typography>
        );
      else return <Typography variant="body2">{lookupToTitleCase(params.value, false)}</Typography>;
    }
  }

  /**
   * Method to get the cross reference description.
   *
   * @param {object} params The parameters passed into the method from the grid.
   * @returns {JSX.Element} The display of for the cross reference description.
   */
  function GetCrossRefDescription(params) {
    if (params) {
      if (params.row.historic)
        return (
          <Typography variant="body2" sx={{ textDecoration: "line-through" }}>
            {lookupToTitleCase(params.value, false)}
          </Typography>
        );
      else return <Typography variant="body2">{lookupToTitleCase(params.value, false)}</Typography>;
    }
  }

  /**
   * Method to get the cross reference source.
   *
   * @param {object} params The parameters passed into the method from the grid.
   * @returns {JSX.Element} The display of for the cross reference source.
   */
  function GetCrossRefSource(params) {
    if (params) {
      if (params.row.historic)
        return (
          <Typography variant="body2" sx={{ textDecoration: "line-through" }}>
            {params.value}
          </Typography>
        );
      else return <Typography variant="body2">{params.value}</Typography>;
    }
  }

  /**
   * Method to get the cross reference export flag.
   *
   * @param {object} params The parameters passed into the method from the grid.
   * @returns {JSX.Element} The display of for the cross reference export flag.
   */
  function GetCrossRefExport(params) {
    if (params && params.value) {
      return <Typography variant="body2">Yes</Typography>;
    } else return <Typography variant="body2">No</Typography>;
  }

  /**
   * Method to get the English locality.
   *
   * @param {object} params The parameters passed into the method from the grid.
   * @returns {JSX.Element} The display of for the English locality.
   */
  function GetLocalityEng(params) {
    if (params && params.row.localityEng) {
      if (params.row.historic)
        return (
          <Typography variant="body2" sx={{ textDecoration: "line-through" }}>
            {lookupToTitleCase(params.value, false)}
          </Typography>
        );
      else return <Typography variant="body2">{lookupToTitleCase(params.value, false)}</Typography>;
    }
  }

  /**
   * Method to get the Welsh locality.
   *
   * @param {object} params The parameters passed into the method from the grid.
   * @returns {JSX.Element} The display of for the Welsh locality.
   */
  function GetLocalityCym(params) {
    if (params && params.row.localityCym) {
      if (params.row.historic)
        return (
          <Typography variant="body2" sx={{ textDecoration: "line-through" }}>
            {lookupToTitleCase(params.value, false)}
          </Typography>
        );
      else return <Typography variant="body2">{lookupToTitleCase(params.value, false)}</Typography>;
    }
  }

  /**
   * Method to get the Scottish locality.
   *
   * @param {object} params The parameters passed into the method from the grid.
   * @returns {JSX.Element} The display of for the Scottish locality.
   */
  function GetLocalityGae(params) {
    if (params && params.row.localityGae) {
      if (params.row.historic)
        return (
          <Typography variant="body2" sx={{ textDecoration: "line-through" }}>
            {lookupToTitleCase(params.value, false)}
          </Typography>
        );
      else return <Typography variant="body2">{lookupToTitleCase(params.value, false)}</Typography>;
    }
  }

  /**
   * Method to get the English town.
   *
   * @param {object} params The parameters passed into the method from the grid.
   * @returns {JSX.Element} The display of for the English town.
   */
  function GetTownEng(params) {
    if (params && params.row.townEng) {
      if (params.row.historic)
        return (
          <Typography variant="body2" sx={{ textDecoration: "line-through" }}>
            {lookupToTitleCase(params.value, false)}
          </Typography>
        );
      else return <Typography variant="body2">{lookupToTitleCase(params.value, false)}</Typography>;
    }
  }

  /**
   * Method to get the Welsh town.
   *
   * @param {object} params The parameters passed into the method from the grid.
   * @returns {JSX.Element} The display of for the Welsh town.
   */
  function GetTownCym(params) {
    if (params && params.row.townCym) {
      if (params.row.historic)
        return (
          <Typography variant="body2" sx={{ textDecoration: "line-through" }}>
            {lookupToTitleCase(params.value, false)}
          </Typography>
        );
      else return <Typography variant="body2">{lookupToTitleCase(params.value, false)}</Typography>;
    }
  }

  /**
   * Method to get the Scottish town.
   *
   * @param {object} params The parameters passed into the method from the grid.
   * @returns {JSX.Element} The display of for the Scottish town.
   */
  function GetTownGae(params) {
    if (params && params.row.townGae) {
      if (params.row.historic)
        return (
          <Typography variant="body2" sx={{ textDecoration: "line-through" }}>
            {lookupToTitleCase(params.value, false)}
          </Typography>
        );
      else return <Typography variant="body2">{lookupToTitleCase(params.value, false)}</Typography>;
    }
  }

  /**
   * Method to get the English island.
   *
   * @param {object} params The parameters passed into the method from the grid.
   * @returns {JSX.Element} The display of for the English island.
   */
  function GetIslandEng(params) {
    if (params && params.row.islandEng) {
      if (params.row.historic)
        return (
          <Typography variant="body2" sx={{ textDecoration: "line-through" }}>
            {lookupToTitleCase(params.value, false)}
          </Typography>
        );
      else return <Typography variant="body2">{lookupToTitleCase(params.value, false)}</Typography>;
    }
  }

  /**
   * Method to get the Scottish island.
   *
   * @param {object} params The parameters passed into the method from the grid.
   * @returns {JSX.Element} The display of for the Scottish island.
   */
  function GetIslandGae(params) {
    if (params && params.row.islandGae) {
      if (params.row.historic)
        return (
          <Typography variant="body2" sx={{ textDecoration: "line-through" }}>
            {lookupToTitleCase(params.value, false)}
          </Typography>
        );
      else return <Typography variant="body2">{lookupToTitleCase(params.value, false)}</Typography>;
    }
  }

  /**
   * Method to get the English administrative area.
   *
   * @param {object} params The parameters passed into the method from the grid.
   * @returns {JSX.Element} The display of for the English administrative area.
   */
  function GetAdministrativeAreaEng(params) {
    if (params && params.row.administrativeAreaEng) {
      if (params.row.historic)
        return (
          <Typography variant="body2" sx={{ textDecoration: "line-through" }}>
            {lookupToTitleCase(params.value, false)}
          </Typography>
        );
      else return <Typography variant="body2">{lookupToTitleCase(params.value, false)}</Typography>;
    }
  }

  /**
   * Method to get the Welsh administrative area.
   *
   * @param {object} params The parameters passed into the method from the grid.
   * @returns {JSX.Element} The display of for the Welsh administrative area.
   */
  function GetAdministrativeAreaCym(params) {
    if (params && params.row.administrativeAreaCym) {
      if (params.row.historic)
        return (
          <Typography variant="body2" sx={{ textDecoration: "line-through" }}>
            {lookupToTitleCase(params.value, false)}
          </Typography>
        );
      else return <Typography variant="body2">{lookupToTitleCase(params.value, false)}</Typography>;
    }
  }

  /**
   * Method to get the Scottish administrative area.
   *
   * @param {object} params The parameters passed into the method from the grid.
   * @returns {JSX.Element} The display of for the Scottish administrative area.
   */
  function GetAdministrativeAreaGae(params) {
    if (params && params.row.administrativeAreaGae) {
      if (params.row.historic)
        return (
          <Typography variant="body2" sx={{ textDecoration: "line-through" }}>
            {lookupToTitleCase(params.value, false)}
          </Typography>
        );
      else return <Typography variant="body2">{lookupToTitleCase(params.value, false)}</Typography>;
    }
  }

  /**
   * Method to get the ward.
   *
   * @param {object} params The parameters passed into the method from the grid.
   * @returns {JSX.Element} The display of for the ward.
   */
  function GetWard(params) {
    if (params) {
      if (params.row.historic)
        return (
          <Typography variant="body2" sx={{ textDecoration: "line-through" }}>
            {lookupToTitleCase(params.value, false)}
          </Typography>
        );
      else return <Typography variant="body2">{lookupToTitleCase(params.value, false)}</Typography>;
    }
  }

  /**
   * Method to get the ward code.
   *
   * @param {object} params The parameters passed into the method from the grid.
   * @returns {JSX.Element} The display of for the ward code.
   */
  function GetWardCode(params) {
    if (params) {
      if (params.row.historic)
        return (
          <Typography variant="body2" sx={{ textDecoration: "line-through" }}>
            {params.value}
          </Typography>
        );
      else return <Typography variant="body2">{params.value}</Typography>;
    }
  }

  /**
   * Method to get the parish.
   *
   * @param {object} params The parameters passed into the method from the grid.
   * @returns {JSX.Element} The display of for the parish.
   */
  function GetParish(params) {
    if (params) {
      if (params.row.historic)
        return (
          <Typography variant="body2" sx={{ textDecoration: "line-through" }}>
            {lookupToTitleCase(params.value, false)}
          </Typography>
        );
      else return <Typography variant="body2">{lookupToTitleCase(params.value, false)}</Typography>;
    }
  }

  /**
   * Method to get the parish code.
   *
   * @param {object} params The parameters passed into the method from the grid.
   * @returns {JSX.Element} The display of for the parish code.
   */
  function GetParishCode(params) {
    if (params) {
      if (params.row.historic)
        return (
          <Typography variant="body2" sx={{ textDecoration: "line-through" }}>
            {params.value}
          </Typography>
        );
      else return <Typography variant="body2">{params.value}</Typography>;
    }
  }

  /**
   * Method to get the historic flag.
   *
   * @param {object} params The parameters passed into the method from the grid.
   * @returns {JSX.Element} The display of for the historic flag.
   */
  function GetHistoric(params) {
    if (params && params.value) {
      return <Typography variant="body2">Historic</Typography>;
    } else return <Typography variant="body2" />;
  }

  /**
   * Method to determine if a row is historic or not.
   *
   * @param {number} id The id for the row.
   * @returns {boolean} True if the row is historic; otherwise false.
   */
  const isRowHistoric = (id) => {
    if (data && data.length > 0) {
      const historicRow = data.find((x) => x.id === id);
      return historicRow && historicRow.historic;
    } else return false;
  };

  /**
   * Event to handle when the mouse enters the row.
   *
   * @param {object} event The event object.
   */
  const handleRowMouseEnter = (event) => {
    event.preventDefault();
    setSelectedRow(Number(event.currentTarget.getAttribute("data-id")));
  };

  /**
   * Event to handle when the mouse leaves the row.
   */
  const handleRowMouseLeave = () => {
    setSelectedRow(null);
  };

  /**
   * Event to handle when the search changes.
   *
   * @param {object} event The event object.
   */
  const onSearchChange = (event) => {
    if (event.target.value && event.target.value.length > 0) {
      setSearchString(event.target.value);
      let filteredData = null;
      switch (variant) {
        case "postcode":
          filteredData = data.filter((x) => x.postcode.toUpperCase().includes(event.target.value.toUpperCase()));
          break;

        case "postTown":
          if (settingsContext.isWelsh)
            filteredData = data.filter(
              (x) =>
                x.postTownEng.toUpperCase().includes(event.target.value.toUpperCase()) ||
                x.postTownCym.toUpperCase().includes(event.target.value.toUpperCase())
            );
          else if (settingsContext.isScottish)
            filteredData = data.filter(
              (x) =>
                x.postTownEng.toUpperCase().includes(event.target.value.toUpperCase()) ||
                x.postTownGae.toUpperCase().includes(event.target.value.toUpperCase())
            );
          else
            filteredData = data.filter((x) => x.postTownEng.toUpperCase().includes(event.target.value.toUpperCase()));
          break;

        case "subLocality":
          filteredData = data.filter(
            (x) =>
              x.subLocalityEng.toUpperCase().includes(event.target.value.toUpperCase()) ||
              x.subLocalityGae.toUpperCase().includes(event.target.value.toUpperCase())
          );
          break;

        case "crossReference":
          filteredData = data.filter(
            (x) =>
              x.xrefDescription.toUpperCase().includes(event.target.value.toUpperCase()) ||
              x.xrefSourceRef73.toUpperCase().includes(event.target.value.toUpperCase())
          );
          break;

        case "locality":
          if (settingsContext.isWelsh)
            filteredData = data.filter(
              (x) =>
                x.localityEng.toUpperCase().includes(event.target.value.toUpperCase()) ||
                x.localityCym.toUpperCase().includes(event.target.value.toUpperCase())
            );
          else if (settingsContext.isScottish)
            filteredData = data.filter(
              (x) =>
                x.localityEng.toUpperCase().includes(event.target.value.toUpperCase()) ||
                x.localityGae.toUpperCase().includes(event.target.value.toUpperCase())
            );
          else
            filteredData = data.filter((x) => x.localityEng.toUpperCase().includes(event.target.value.toUpperCase()));
          break;

        case "town":
          if (settingsContext.isWelsh)
            filteredData = data.filter(
              (x) =>
                x.townEng.toUpperCase().includes(event.target.value.toUpperCase()) ||
                x.townCym.toUpperCase().includes(event.target.value.toUpperCase())
            );
          else if (settingsContext.isScottish)
            filteredData = data.filter(
              (x) =>
                x.townEng.toUpperCase().includes(event.target.value.toUpperCase()) ||
                x.townGae.toUpperCase().includes(event.target.value.toUpperCase())
            );
          else filteredData = data.filter((x) => x.townEng.toUpperCase().includes(event.target.value.toUpperCase()));
          break;

        case "island":
          filteredData = data.filter(
            (x) =>
              x.islandEng.toUpperCase().includes(event.target.value.toUpperCase()) ||
              x.islandGae.toUpperCase().includes(event.target.value.toUpperCase())
          );
          break;

        case "administrativeArea":
          if (settingsContext.isWelsh)
            filteredData = data.filter(
              (x) =>
                x.administrativeAreaEng.toUpperCase().includes(event.target.value.toUpperCase()) ||
                x.administrativeAreaCym.toUpperCase().includes(event.target.value.toUpperCase())
            );
          else if (settingsContext.isScottish)
            filteredData = data.filter(
              (x) =>
                x.administrativeAreaEng.toUpperCase().includes(event.target.value.toUpperCase()) ||
                x.administrativeAreaGae.toUpperCase().includes(event.target.value.toUpperCase())
            );
          else
            filteredData = data.filter((x) =>
              x.administrativeAreaEng.toUpperCase().includes(event.target.value.toUpperCase())
            );
          break;

        case "authority":
          break;

        case "ward":
          filteredData = data.filter(
            (x) =>
              x.ward.toUpperCase().includes(event.target.value.toUpperCase()) ||
              x.wardCode.toUpperCase().includes(event.target.value.toUpperCase())
          );
          break;

        case "parish":
          filteredData = data.filter(
            (x) =>
              x.parish.toUpperCase().includes(event.target.value.toUpperCase()) ||
              x.parishCode.toUpperCase().includes(event.target.value.toUpperCase())
          );
          break;

        default:
          break;
      }
      if (filteredData) setDisplayData(filteredData);
    } else {
      handleClearSearch();
    }
  };

  /**
   * Event to handle when the search is cleared.
   */
  const handleClearSearch = () => {
    setSearchString("");
    setDisplayData(data);
  };

  /**
   * Event to handle when a cell is clicked.
   *
   * @param {object} param The parameters passed from the grid.
   * @param {object} event The event object.
   */
  const handleCellClicked = (param, event) => {
    event.stopPropagation();
    if (param && param.field !== "__check__" && param.field !== "" && param.field !== "actions" && param.id > 0) {
      if (onEditLookup) onEditLookup(param.row.id);
    }
  };

  /**
   * Event to handle adding a new lookup.
   */
  const doAddLookup = () => {
    if (onAddLookup) onAddLookup();
  };

  /**
   * Method to get the styling for the stack.
   *
   * @returns {object} The styling to be used for the stack.
   */
  const stackStyle = () => {
    if (variant === "postcode") return { ml: theme.spacing(2), mt: theme.spacing(1), width: 500 };
    else return { ml: theme.spacing(2), mt: theme.spacing(1), width: 750 };
  };

  /**
   * Method to get the list of columns to display in the grid.
   *
   * @returns {Array} List of columns to display in the grid.
   */
  const getColumns = () => {
    switch (variant) {
      case "postcode":
        return [
          {
            field: "id",
            headerClassName: "idox-lookup-data-grid-header",
            hide: true,
            sortable: false,
            filterable: false,
          },
          {
            field: "postcode",
            headerName: "Postcode",
            headerClassName: "idox-lookup-data-grid-header",
            flex: 30,
            renderCell: GetPostcode,
          },
          {
            field: "historic",
            headerName: "Status",
            headerClassName: "idox-lookup-data-grid-header",
            flex: 30,
            renderCell: GetHistoric,
          },
          {
            field: "actions",
            type: "actions",
            headerClassName: "idox-lookup-data-grid-header",
            sortable: false,
            filterable: false,
            renderCell: displayActionButtons,
          },
        ];

      case "postTown":
        return settingsContext.isWelsh
          ? [
              {
                field: "id",
                headerClassName: "idox-lookup-data-grid-header",
                hide: true,
                sortable: false,
                filterable: false,
              },
              {
                field: "postTownEng",
                headerName: "English",
                headerClassName: "idox-lookup-data-grid-header",
                flex: 30,
                renderCell: GetPostTownEng,
              },
              {
                field: "postTownCym",
                headerName: "Welsh",
                headerClassName: "idox-lookup-data-grid-header",
                flex: 30,
                renderCell: GetPostTownCym,
              },
              {
                field: "historic",
                headerName: "Status",
                headerClassName: "idox-lookup-data-grid-header",
                flex: 30,
                renderCell: GetHistoric,
              },
              {
                field: "linkedRef",
                headerClassName: "idox-lookup-data-grid-header",
                hide: true,
                sortable: false,
                filterable: false,
              },
              {
                field: "actions",
                type: "actions",
                headerClassName: "idox-lookup-data-grid-header",
                sortable: false,
                filterable: false,
                renderCell: displayActionButtons,
              },
            ]
          : settingsContext.isScottish
          ? [
              { field: "id", hide: true },
              {
                field: "postTownEng",
                headerName: "English",
                headerClassName: "idox-lookup-data-grid-header",
                flex: 30,
                renderCell: GetPostTownEng,
              },
              {
                field: "postTownGae",
                headerName: "Gaelic",
                headerClassName: "idox-lookup-data-grid-header",
                flex: 30,
                renderCell: GetPostTownGae,
              },
              {
                field: "historic",
                headerName: "Status",
                headerClassName: "idox-lookup-data-grid-header",
                flex: 30,
                renderCell: GetHistoric,
              },
              {
                field: "linkedRef",
                headerClassName: "idox-lookup-data-grid-header",
                hide: true,
                sortable: false,
                filterable: false,
              },
              {
                field: "actions",
                type: "actions",
                headerClassName: "idox-lookup-data-grid-header",
                sortable: false,
                filterable: false,
                renderCell: displayActionButtons,
              },
            ]
          : [
              { field: "id", hide: true },
              {
                field: "postTownEng",
                headerName: "English",
                headerClassName: "idox-lookup-data-grid-header",
                flex: 30,
                renderCell: GetPostTownEng,
              },
              {
                field: "historic",
                headerName: "Status",
                headerClassName: "idox-lookup-data-grid-header",
                flex: 30,
                renderCell: GetHistoric,
              },
              {
                field: "linkedRef",
                headerClassName: "idox-lookup-data-grid-header",
                hide: true,
                sortable: false,
                filterable: false,
              },
              {
                field: "actions",
                type: "actions",
                headerClassName: "idox-lookup-data-grid-header",
                sortable: false,
                filterable: false,
                renderCell: displayActionButtons,
              },
            ];

      case "subLocality":
        return [
          {
            field: "id",
            headerClassName: "idox-lookup-data-grid-header",
            hide: true,
            sortable: false,
            filterable: false,
          },
          {
            field: "subLocalityEng",
            headerName: "English",
            headerClassName: "idox-lookup-data-grid-header",
            flex: 30,
            renderCell: GetSubLocalityEng,
          },
          {
            field: "subLocalityGae",
            headerName: "Gaelic",
            headerClassName: "idox-lookup-data-grid-header",
            flex: 30,
            renderCell: GetSubLocalityGae,
          },
          {
            field: "historic",
            headerName: "Status",
            headerClassName: "idox-lookup-data-grid-header",
            flex: 30,
            renderCell: GetHistoric,
          },
          {
            field: "linkedRef",
            headerClassName: "idox-lookup-data-grid-header",
            hide: true,
            sortable: false,
            filterable: false,
          },
          {
            field: "actions",
            type: "actions",
            headerClassName: "idox-lookup-data-grid-header",
            sortable: false,
            filterable: false,
            renderCell: displayActionButtons,
          },
        ];

      case "crossReference":
        return [
          {
            field: "id",
            headerClassName: "idox-lookup-data-grid-header",
            hide: true,
            sortable: false,
            filterable: false,
          },
          {
            field: "xrefDescription",
            headerName: "Description",
            headerClassName: "idox-lookup-data-grid-header",
            flex: 40,
            renderCell: GetCrossRefDescription,
          },
          {
            field: "xrefSourceRef73",
            headerName: "Source",
            headerClassName: "idox-lookup-data-grid-header",
            flex: 10,
            renderCell: GetCrossRefSource,
          },
          {
            field: "historic",
            headerName: "Status",
            headerClassName: "idox-lookup-data-grid-header",
            flex: 15,
            renderCell: GetHistoric,
          },
          {
            field: "export",
            headerName: "Export",
            headerClassName: "idox-lookup-data-grid-header",
            flex: 10,
            renderCell: GetCrossRefExport,
          },
          {
            field: "actions",
            type: "actions",
            headerClassName: "idox-lookup-data-grid-header",
            sortable: false,
            filterable: false,
            renderCell: displayActionButtons,
          },
        ];

      case "locality":
        return settingsContext.isWelsh
          ? [
              {
                field: "id",
                headerClassName: "idox-lookup-data-grid-header",
                hide: true,
                sortable: false,
                filterable: false,
              },
              {
                field: "localityEng",
                headerName: "English",
                headerClassName: "idox-lookup-data-grid-header",
                flex: 30,
                renderCell: GetLocalityEng,
              },
              {
                field: "localityCym",
                headerName: "Welsh",
                headerClassName: "idox-lookup-data-grid-header",
                flex: 30,
                renderCell: GetLocalityCym,
              },
              {
                field: "historic",
                headerName: "Status",
                headerClassName: "idox-lookup-data-grid-header",
                flex: 30,
                renderCell: GetHistoric,
              },
              {
                field: "linkedRef",
                headerClassName: "idox-lookup-data-grid-header",
                hide: true,
                sortable: false,
                filterable: false,
              },
              {
                field: "actions",
                type: "actions",
                headerClassName: "idox-lookup-data-grid-header",
                sortable: false,
                filterable: false,
                renderCell: displayActionButtons,
              },
            ]
          : settingsContext.isScottish
          ? [
              {
                field: "id",
                headerClassName: "idox-lookup-data-grid-header",
                hide: true,
                sortable: false,
                filterable: false,
              },
              {
                field: "localityEng",
                headerName: "English",
                headerClassName: "idox-lookup-data-grid-header",
                flex: 30,
                renderCell: GetLocalityEng,
              },
              {
                field: "localityGae",
                headerName: "Gaelic",
                headerClassName: "idox-lookup-data-grid-header",
                flex: 30,
                renderCell: GetLocalityGae,
              },
              {
                field: "historic",
                headerName: "Status",
                headerClassName: "idox-lookup-data-grid-header",
                flex: 30,
                renderCell: GetHistoric,
              },
              {
                field: "linkedRef",
                headerClassName: "idox-lookup-data-grid-header",
                hide: true,
                sortable: false,
                filterable: false,
              },
              {
                field: "actions",
                type: "actions",
                headerClassName: "idox-lookup-data-grid-header",
                sortable: false,
                filterable: false,
                renderCell: displayActionButtons,
              },
            ]
          : [
              {
                field: "id",
                headerClassName: "idox-lookup-data-grid-header",
                hide: true,
                sortable: false,
                filterable: false,
              },
              {
                field: "localityEng",
                headerName: "English",
                headerClassName: "idox-lookup-data-grid-header",
                flex: 30,
                renderCell: GetLocalityEng,
              },
              {
                field: "historic",
                headerName: "Status",
                headerClassName: "idox-lookup-data-grid-header",
                flex: 30,
                renderCell: GetHistoric,
              },
              {
                field: "linkedRef",
                headerClassName: "idox-lookup-data-grid-header",
                hide: true,
                sortable: false,
                filterable: false,
              },
              {
                field: "actions",
                type: "actions",
                headerClassName: "idox-lookup-data-grid-header",
                sortable: false,
                filterable: false,
                renderCell: displayActionButtons,
              },
            ];

      case "town":
        return settingsContext.isWelsh
          ? [
              {
                field: "id",
                headerClassName: "idox-lookup-data-grid-header",
                hide: true,
                sortable: false,
                filterable: false,
              },
              {
                field: "townEng",
                headerName: "English",
                headerClassName: "idox-lookup-data-grid-header",
                flex: 30,
                renderCell: GetTownEng,
              },
              {
                field: "townCym",
                headerName: "Welsh",
                headerClassName: "idox-lookup-data-grid-header",
                flex: 30,
                renderCell: GetTownCym,
              },
              {
                field: "historic",
                headerName: "Status",
                headerClassName: "idox-lookup-data-grid-header",
                flex: 30,
                renderCell: GetHistoric,
              },
              {
                field: "linkedRef",
                headerClassName: "idox-lookup-data-grid-header",
                hide: true,
                sortable: false,
                filterable: false,
              },
              {
                field: "actions",
                type: "actions",
                headerClassName: "idox-lookup-data-grid-header",
                sortable: false,
                filterable: false,
                renderCell: displayActionButtons,
              },
            ]
          : settingsContext.isScottish
          ? [
              {
                field: "id",
                headerClassName: "idox-lookup-data-grid-header",
                hide: true,
                sortable: false,
                filterable: false,
              },
              {
                field: "townEng",
                headerName: "English",
                headerClassName: "idox-lookup-data-grid-header",
                flex: 30,
                renderCell: GetTownEng,
              },
              {
                field: "townGae",
                headerName: "Gaelic",
                headerClassName: "idox-lookup-data-grid-header",
                flex: 30,
                renderCell: GetTownGae,
              },
              {
                field: "historic",
                headerName: "Status",
                headerClassName: "idox-lookup-data-grid-header",
                flex: 30,
                renderCell: GetHistoric,
              },
              {
                field: "linkedRef",
                headerClassName: "idox-lookup-data-grid-header",
                hide: true,
                sortable: false,
                filterable: false,
              },
              {
                field: "actions",
                type: "actions",
                headerClassName: "idox-lookup-data-grid-header",
                sortable: false,
                filterable: false,
                renderCell: displayActionButtons,
              },
            ]
          : [
              {
                field: "id",
                headerClassName: "idox-lookup-data-grid-header",
                hide: true,
                sortable: false,
                filterable: false,
              },
              {
                field: "townEng",
                headerName: "English",
                headerClassName: "idox-lookup-data-grid-header",
                flex: 30,
                renderCell: GetTownEng,
              },
              {
                field: "historic",
                headerName: "Status",
                headerClassName: "idox-lookup-data-grid-header",
                flex: 30,
                renderCell: GetHistoric,
              },
              {
                field: "linkedRef",
                headerClassName: "idox-lookup-data-grid-header",
                hide: true,
                sortable: false,
                filterable: false,
              },
              {
                field: "actions",
                type: "actions",
                headerClassName: "idox-lookup-data-grid-header",
                sortable: false,
                filterable: false,
                renderCell: displayActionButtons,
              },
            ];

      case "island":
        return [
          {
            field: "id",
            headerClassName: "idox-lookup-data-grid-header",
            hide: true,
            sortable: false,
            filterable: false,
          },
          {
            field: "islandEng",
            headerName: "English",
            headerClassName: "idox-lookup-data-grid-header",
            flex: 30,
            renderCell: GetIslandEng,
          },
          {
            field: "islandGae",
            headerName: "Gaelic",
            headerClassName: "idox-lookup-data-grid-header",
            flex: 30,
            renderCell: GetIslandGae,
          },
          {
            field: "historic",
            headerName: "Status",
            headerClassName: "idox-lookup-data-grid-header",
            flex: 30,
            renderCell: GetHistoric,
          },
          {
            field: "linkedRef",
            headerClassName: "idox-lookup-data-grid-header",
            hide: true,
            sortable: false,
            filterable: false,
          },
          {
            field: "actions",
            type: "actions",
            headerClassName: "idox-lookup-data-grid-header",
            sortable: false,
            filterable: false,
            renderCell: displayActionButtons,
          },
        ];

      case "administrativeArea":
        return settingsContext.isWelsh
          ? [
              {
                field: "id",
                headerClassName: "idox-lookup-data-grid-header",
                hide: true,
                sortable: false,
                filterable: false,
              },
              {
                field: "administrativeAreaEng",
                headerName: "English",
                headerClassName: "idox-lookup-data-grid-header",
                flex: 30,
                renderCell: GetAdministrativeAreaEng,
              },
              {
                field: "administrativeAreaCym",
                headerName: "Welsh",
                headerClassName: "idox-lookup-data-grid-header",
                flex: 30,
                renderCell: GetAdministrativeAreaCym,
              },
              {
                field: "historic",
                headerName: "Status",
                headerClassName: "idox-lookup-data-grid-header",
                flex: 30,
                renderCell: GetHistoric,
              },
              {
                field: "linkedRef",
                headerClassName: "idox-lookup-data-grid-header",
                hide: true,
                sortable: false,
                filterable: false,
              },
              {
                field: "actions",
                type: "actions",
                headerClassName: "idox-lookup-data-grid-header",
                sortable: false,
                filterable: false,
                renderCell: displayActionButtons,
              },
            ]
          : settingsContext.isScottish
          ? [
              {
                field: "id",
                headerClassName: "idox-lookup-data-grid-header",
                hide: true,
                sortable: false,
                filterable: false,
              },
              {
                field: "administrativeAreaEng",
                headerName: "English",
                headerClassName: "idox-lookup-data-grid-header",
                flex: 30,
                renderCell: GetAdministrativeAreaEng,
              },
              {
                field: "administrativeAreaGae",
                headerName: "Gaelic",
                headerClassName: "idox-lookup-data-grid-header",
                flex: 30,
                renderCell: GetAdministrativeAreaGae,
              },
              {
                field: "historic",
                headerName: "Status",
                headerClassName: "idox-lookup-data-grid-header",
                flex: 30,
                renderCell: GetHistoric,
              },
              {
                field: "linkedRef",
                headerClassName: "idox-lookup-data-grid-header",
                hide: true,
                sortable: false,
                filterable: false,
              },
              {
                field: "actions",
                type: "actions",
                headerClassName: "idox-lookup-data-grid-header",
                sortable: false,
                filterable: false,
                renderCell: displayActionButtons,
              },
            ]
          : [
              {
                field: "id",
                headerClassName: "idox-lookup-data-grid-header",
                hide: true,
                sortable: false,
                filterable: false,
              },
              {
                field: "administrativeAreaEng",
                headerName: "English",
                headerClassName: "idox-lookup-data-grid-header",
                flex: 30,
                renderCell: GetAdministrativeAreaEng,
              },
              {
                field: "historic",
                headerName: "Status",
                headerClassName: "idox-lookup-data-grid-header",
                flex: 30,
                renderCell: GetHistoric,
              },
              {
                field: "linkedRef",
                headerClassName: "idox-lookup-data-grid-header",
                hide: true,
                sortable: false,
                filterable: false,
              },
              {
                field: "actions",
                type: "actions",
                headerClassName: "idox-lookup-data-grid-header",
                sortable: false,
                filterable: false,
                renderCell: displayActionButtons,
              },
            ];

      case "ward":
        return [
          {
            field: "id",
            headerClassName: "idox-lookup-data-grid-header",
            hide: true,
            sortable: false,
            filterable: false,
          },
          {
            field: "ward",
            headerName: "Ward",
            headerClassName: "idox-lookup-data-grid-header",
            flex: 30,
            renderCell: GetWard,
          },
          {
            field: "wardCode",
            headerName: "Code",
            headerClassName: "idox-lookup-data-grid-header",
            flex: 20,
            renderCell: GetWardCode,
          },
          {
            field: "historic",
            headerName: "Status",
            headerClassName: "idox-lookup-data-grid-header",
            flex: 20,
            renderCell: GetHistoric,
          },
          {
            field: "actions",
            type: "actions",
            headerClassName: "idox-lookup-data-grid-header",
            sortable: false,
            filterable: false,
            renderCell: displayActionButtons,
          },
        ];

      case "parish":
        return [
          {
            field: "id",
            headerClassName: "idox-lookup-data-grid-header",
            hide: true,
            sortable: false,
            filterable: false,
          },
          {
            field: "parish",
            headerName: "Parish",
            headerClassName: "idox-lookup-data-grid-header",
            flex: 30,
            renderCell: GetParish,
          },
          {
            field: "parishCode",
            headerName: "Code",
            headerClassName: "idox-lookup-data-grid-header",
            flex: 20,
            renderCell: GetParishCode,
          },
          {
            field: "historic",
            headerName: "Status",
            headerClassName: "idox-lookup-data-grid-header",
            flex: 20,
            renderCell: GetHistoric,
          },
          {
            field: "actions",
            type: "actions",
            headerClassName: "idox-lookup-data-grid-header",
            sortable: false,
            filterable: false,
            renderCell: displayActionButtons,
          },
        ];

      default:
        return [];
    }
  };

  /**
   * Method to get the list of columns to hide in the grid.
   *
   * @returns {object} The initial state object used to hide the columns
   */
  const getInitialState = () => {
    switch (variant) {
      case "postTown":
      case "subLocality":
      case "locality":
      case "town":
      case "island":
      case "administrativeArea":
        return {
          columns: {
            columnVisibilityModel: {
              id: false,
              linkedRef: false,
            },
          },
        };

      default:
        return {
          columns: {
            columnVisibilityModel: {
              id: false,
            },
          },
        };
    }
  };

  useEffect(() => {
    switch (variant) {
      case "postcode":
        setLookupType("postcode");
        setLookupTypeId("postcode");
        setSortModel([{ field: "postcode", sort: "asc" }]);
        break;

      case "postTown":
        setLookupType("post town");
        setLookupTypeId("post-town");
        setSortModel([{ field: "postTownEng", sort: "asc" }]);
        break;

      case "subLocality":
        setLookupType("sub-locality");
        setLookupTypeId("sub-locality");
        setSortModel([{ field: "subLocalityEng", sort: "asc" }]);
        break;

      case "crossReference":
        setLookupType("cross reference");
        setLookupTypeId("cross-reference");
        setSortModel([{ field: "xrefDescription", sort: "asc" }]);
        break;

      case "locality":
        setLookupType("locality");
        setLookupTypeId("locality");
        setSortModel([{ field: "localityEng", sort: "asc" }]);
        break;

      case "town":
        setLookupType("town");
        setLookupTypeId("town");
        setSortModel([{ field: "townEng", sort: "asc" }]);
        break;

      case "island":
        setLookupType("island");
        setLookupTypeId("island");
        setSortModel([{ field: "islandEng", sort: "asc" }]);
        break;

      case "administrativeArea":
        setLookupType("administrative area");
        setLookupTypeId("administrative-area");
        setSortModel([{ field: "administrativeAreaEng", sort: "asc" }]);
        break;

      case "ward":
        setLookupType("ward");
        setLookupTypeId("ward");
        setSortModel([{ field: "ward", sort: "asc" }]);
        break;

      case "parish":
        setLookupType("parish");
        setLookupTypeId("parish");
        setSortModel([{ field: "parish", sort: "asc" }]);
        break;

      default:
        setLookupType("unknown");
        setLookupTypeId("unknown");
        setSortModel([]);
        break;
    }
  }, [variant]);

  useEffect(() => {
    setDisplayData(data);
  }, [data]);

  return (
    <div id={`ads-${lookupTypeId}-lookup-table-data-grid`}>
      <Stack direction="column" spacing={2} sx={stackStyle()}>
        <Stack direction="row" justifyContent="space-between">
          <Box
            sx={{
              borderStyle: "solid",
              borderWidth: "1px",
              borderColor: adsLightGreyB,
              borderRadius: "18px",
              mb: theme.spacing(1.5),
              display: "inline-flex",
              height: "35px",
            }}
          >
            <TextField
              id={`${lookupTypeId}-search`}
              variant="standard"
              placeholder={`Search ${lookupType}`}
              value={searchString}
              sx={{
                color: theme.palette.background.contrastText,
                pl: theme.spacing(1),
                pr: theme.spacing(1),
                width: "100%",
              }}
              onChange={onSearchChange}
              InputProps={{
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton id="btnClear" onClick={handleClearSearch} aria-label="clear button" size="small">
                      <ClearIcon sx={ClearSearchIconStyle(searchString)} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Button variant="contained" sx={blueButtonStyle} startIcon={<AddIcon />} onClick={doAddLookup}>
            <Typography variant="body2">{`${stringToSentenceCase(lookupType)}`}</Typography>
          </Button>
        </Stack>
        <Box
          sx={{
            height: "84vh",
            "& .idox-lookup-data-grid-header": { backgroundColor: adsLightGreyC, color: adsMidGreyA },
          }}
          className={classes.root}
        >
          {data && data.length > 0 ? (
            <DataGrid
              rows={displayData}
              columns={getColumns()}
              initialState={getInitialState()}
              autoPageSize
              disableColumnMenu
              disableColumnSelector
              disableDensitySelector
              hideFooterSelectedRowCount
              editMode="row"
              pagination
              sortModel={sortModel}
              slotProps={{
                row: {
                  onMouseEnter: handleRowMouseEnter,
                  onMouseLeave: handleRowMouseLeave,
                },
              }}
              getRowClassName={(params) => `${isRowHistoric(params.id) ? "historic-row" : "live-row"}`}
              onCellClick={handleCellClicked}
              onSortModelChange={(model) => setSortModel(model)}
            />
          ) : (
            <List
              sx={{
                width: "100%",
                backgroundColor: theme.palette.background.paper,
                pt: theme.spacing(0),
              }}
              component="nav"
              key="key_no_records"
            >
              <ListItemButton
                dense
                disableGutters
                onClick={doAddLookup}
                sx={{
                  height: "30px",
                  "&:hover": {
                    backgroundColor: adsLightBlue10,
                    color: adsBlueA,
                  },
                }}
              >
                <ListItemText
                  primary={<Typography variant="subtitle1">{`No ${lookupType} records present`}</Typography>}
                />
                <ListItemAvatar
                  sx={{
                    minWidth: 32,
                  }}
                >
                  <Tooltip title={`Add ${lookupType} record`} arrow placement="bottom" sx={tooltipStyle}>
                    <IconButton onClick={doAddLookup} size="small">
                      <AddCircleIcon sx={ActionIconStyle()} />
                    </IconButton>
                  </Tooltip>
                </ListItemAvatar>
              </ListItemButton>
            </List>
          )}
        </Box>
      </Stack>
    </div>
  );
}

export default LookupTableGridTab;
