//#region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Lookup table grid tab
//
//  Copyright:    © 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//#region Version 1.0.0.0
//    001            Sean Flook                  Initial Revision.
//    002   06.10.23 Sean Flook                  Use colour variables.
//    003   24.11.23 Sean Flook                  Moved Box and Stack to @mui/system and removed a warning.
//    004   08.12.23 Sean Flook                  Migrated DataGrid to v6.
//    005   05.01.24 Sean Flook                  Use CSS shortcuts.
//    006   10.01.24 Sean Flook                  Fix warnings.
//    007   01.02.24 Sean Flook                  Initial changes required for operational districts.
//    008   29.02.24 Joel Benford      IMANN-242 Add DbAuthority.
//    009   22.03.24 Sean Flook            GLB12 Changed to use dataFormStyle so height can be correctly set.
//    010   26.04.24 Sean Flook        IMANN-413 Removed Gaelic option.
//    011   17.05.24 Sean Flook        IMANN-176 Added a new button to allow for spatially updating BLPU ward and parish codes.
//    012   28.05.24 Joel Benford      IMANN-481 Hide delete button fro wards and parishes
//#endregion Version 1.0.0.0
//#region Version 1.0.5.0
//    013   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//#endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//#endregion header

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

import OperationalDistrictFunction from "../data/OperationalDistrictFunction";
import SwaOrgRef from "../data/SwaOrgRef";

import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import UpdateIcon from "@mui/icons-material/Update";
import ClearIcon from "@mui/icons-material/Clear";
import { AddCircleOutlineOutlined as AddCircleIcon } from "@mui/icons-material";
import { adsBlueA, adsLightGreyB, adsDarkGrey10, adsDarkGrey20, adsPaleBlueA } from "../utils/ADSColours";
import {
  ActionIconStyle,
  ClearSearchIconStyle,
  blueButtonStyle,
  dataFormStyle,
  tooltipStyle,
} from "../utils/ADSStyles";
import { createTheme } from "@mui/material/styles";
import { useTheme, makeStyles } from "@mui/styles";

const defaultTheme = createTheme();
const useStyles = makeStyles(
  (theme) => {
    return {
      root: {
        "& .live-row": {
          "&:hover": {
            backgroundColor: adsPaleBlueA,
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
    "operationalDistrict",
    "dbAuthority",
  ]).isRequired,
  data: PropTypes.array.isRequired,
  onAddLookup: PropTypes.func.isRequired,
  onEditLookup: PropTypes.func.isRequired,
  onUpdateSpatialData: PropTypes.func,
  onDeleteLookup: PropTypes.func,
};

function LookupTableGridTab({ variant, data, onAddLookup, onEditLookup, onUpdateSpatialData, onDeleteLookup }) {
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
        {(variant !== "crossReference" || !isGeoPlaceCrossRef(params.id)) &&
          variant !== "ward" &&
          variant !== "parish" && (
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
   * Method to get the DbAuthority name.
   *
   * @param {object} params The parameters passed into the method from the grid.
   * @returns {JSX.Element} The display of for the DbAuthority.
   */
  function GetDbAuthorityName(params) {
    if (params) {
      return <Typography variant="body2">{lookupToTitleCase(params.value, false)}</Typography>;
    }
  }

  /**
   * Method to get the DbAuthority numeric fields code, min usrn, max usrn.
   *
   * @param {object} params The parameters passed into the method from the grid.
   * @returns {JSX.Element} The display of for the DbAuthority field.
   */
  function GetDbAuthorityNumeric(params) {
    if (params) {
      return <Typography variant="body2">{params.value}</Typography>;
    }
  }

  /**
   * Method to get the operational district name.
   *
   * @param {object} params The parameters passed into the method from the grid.
   * @returns {JSX.Element} The display of the operational district name.
   */
  function GetOperationalDistrictName(params) {
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
   * Method to get the operational district organisation name.
   *
   * @param {object} params The parameters passed into the method from the grid.
   * @returns {JSX.Element} The display of the operational district organisation name.
   */
  function GetOperationalDistrictOrganisation(params) {
    if (params) {
      const organisationRecord = SwaOrgRef.find((x) => x.id === params.value);
      if (organisationRecord) {
        if (params.row.historic)
          return (
            <Typography variant="body2" sx={{ textDecoration: "line-through" }}>
              {organisationRecord.gpText}
            </Typography>
          );
        else return <Typography variant="body2">{organisationRecord.gpText}</Typography>;
      }
    }
  }

  /**
   * Method to get the operational district function.
   *
   * @param {object} params The parameters passed into the method from the grid.
   * @returns {JSX.Element} The display of the operational district function.
   */
  function GetOperationalDistrictFunction(params) {
    if (params) {
      const functionRecord = OperationalDistrictFunction.find((x) => x.id === params.value);
      if (functionRecord) {
        if (params.row.historic)
          return (
            <Typography variant="body2" sx={{ textDecoration: "line-through" }}>
              {functionRecord.gpText}
            </Typography>
          );
        else return <Typography variant="body2">{functionRecord.gpText}</Typography>;
      }
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
          else
            filteredData = data.filter((x) => x.postTownEng.toUpperCase().includes(event.target.value.toUpperCase()));
          break;

        case "subLocality":
          filteredData = data.filter((x) => x.subLocalityEng.toUpperCase().includes(event.target.value.toUpperCase()));
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
          else filteredData = data.filter((x) => x.townEng.toUpperCase().includes(event.target.value.toUpperCase()));
          break;

        case "island":
          filteredData = data.filter((x) => x.islandEng.toUpperCase().includes(event.target.value.toUpperCase()));
          break;

        case "administrativeArea":
          if (settingsContext.isWelsh)
            filteredData = data.filter(
              (x) =>
                x.administrativeAreaEng.toUpperCase().includes(event.target.value.toUpperCase()) ||
                x.administrativeAreaCym.toUpperCase().includes(event.target.value.toUpperCase())
            );
          else
            filteredData = data.filter((x) =>
              x.administrativeAreaEng.toUpperCase().includes(event.target.value.toUpperCase())
            );
          break;

        case "dbAuthority":
          filteredData = data.filter((x) => x.name.toUpperCase().includes(event.target.value.toUpperCase()));
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

        case "operationalDistrict":
          const functionData = OperationalDistrictFunction.find((x) =>
            x.gpText.toUpperCase().includes(event.target.value.toUpperCase())
          );
          const organisationData = SwaOrgRef.find((x) =>
            x.gpText.toUpperCase().includes(event.target.value.toUpperCase())
          );
          filteredData = data.filter(
            (x) =>
              x.districtName.toUpperCase().includes(event.target.value.toUpperCase()) ||
              (organisationData && x.organisationId === organisationData.id) ||
              (functionData && x.districtFunction === functionData.id)
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
   * Event to handle updating the ward and parish spatial data.
   */
  const doUpdateSpatialData = () => {
    if (onUpdateSpatialData) onUpdateSpatialData();
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
    else if (variant === "operationalDistrict") return { ml: theme.spacing(2), mt: theme.spacing(1), width: 900 };
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
            headerClassName: "idox-data-grid-header",
            hide: true,
            sortable: false,
            filterable: false,
          },
          {
            field: "postcode",
            headerName: "Postcode",
            headerClassName: "idox-data-grid-header",
            display: "flex",
            flex: 30,
            renderCell: GetPostcode,
          },
          {
            field: "historic",
            headerName: "Status",
            headerClassName: "idox-data-grid-header",
            display: "flex",
            flex: 30,
            renderCell: GetHistoric,
          },
          {
            field: "actions",
            type: "actions",
            headerClassName: "idox-data-grid-header",
            display: "flex",
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
                headerClassName: "idox-data-grid-header",
                hide: true,
                sortable: false,
                filterable: false,
              },
              {
                field: "postTownEng",
                headerName: "English",
                headerClassName: "idox-data-grid-header",
                display: "flex",
                flex: 30,
                renderCell: GetPostTownEng,
              },
              {
                field: "postTownCym",
                headerName: "Welsh",
                headerClassName: "idox-data-grid-header",
                display: "flex",
                flex: 30,
                renderCell: GetPostTownCym,
              },
              {
                field: "historic",
                headerName: "Status",
                headerClassName: "idox-data-grid-header",
                display: "flex",
                flex: 30,
                renderCell: GetHistoric,
              },
              {
                field: "linkedRef",
                headerClassName: "idox-data-grid-header",
                hide: true,
                sortable: false,
                filterable: false,
              },
              {
                field: "actions",
                type: "actions",
                headerClassName: "idox-data-grid-header",
                sortable: false,
                filterable: false,
                renderCell: displayActionButtons,
              },
            ]
          : [
              { field: "id", hide: true },
              {
                field: "postTownEng",
                headerName: "Post town",
                headerClassName: "idox-data-grid-header",
                flex: 30,
                renderCell: GetPostTownEng,
              },
              {
                field: "historic",
                headerName: "Status",
                headerClassName: "idox-data-grid-header",
                display: "flex",
                flex: 30,
                renderCell: GetHistoric,
              },
              {
                field: "linkedRef",
                headerClassName: "idox-data-grid-header",
                hide: true,
                sortable: false,
                filterable: false,
              },
              {
                field: "actions",
                type: "actions",
                headerClassName: "idox-data-grid-header",
                display: "flex",
                sortable: false,
                filterable: false,
                renderCell: displayActionButtons,
              },
            ];

      case "subLocality":
        return [
          {
            field: "id",
            headerClassName: "idox-data-grid-header",
            hide: true,
            sortable: false,
            filterable: false,
          },
          {
            field: "subLocalityEng",
            headerName: "Sub-locality",
            headerClassName: "idox-data-grid-header",
            display: "flex",
            flex: 30,
            renderCell: GetSubLocalityEng,
          },
          {
            field: "historic",
            headerName: "Status",
            headerClassName: "idox-data-grid-header",
            display: "flex",
            flex: 30,
            renderCell: GetHistoric,
          },
          {
            field: "linkedRef",
            headerClassName: "idox-data-grid-header",
            hide: true,
            sortable: false,
            filterable: false,
          },
          {
            field: "actions",
            type: "actions",
            headerClassName: "idox-data-grid-header",
            display: "flex",
            sortable: false,
            filterable: false,
            renderCell: displayActionButtons,
          },
        ];

      case "crossReference":
        return [
          {
            field: "id",
            headerClassName: "idox-data-grid-header",
            hide: true,
            sortable: false,
            filterable: false,
          },
          {
            field: "xrefDescription",
            headerName: "Description",
            headerClassName: "idox-data-grid-header",
            display: "flex",
            flex: 40,
            renderCell: GetCrossRefDescription,
          },
          {
            field: "xrefSourceRef73",
            headerName: "Source",
            headerClassName: "idox-data-grid-header",
            display: "flex",
            flex: 10,
            renderCell: GetCrossRefSource,
          },
          {
            field: "historic",
            headerName: "Status",
            headerClassName: "idox-data-grid-header",
            display: "flex",
            flex: 15,
            renderCell: GetHistoric,
          },
          {
            field: "export",
            headerName: "Export",
            headerClassName: "idox-data-grid-header",
            display: "flex",
            flex: 10,
            renderCell: GetCrossRefExport,
          },
          {
            field: "actions",
            type: "actions",
            headerClassName: "idox-data-grid-header",
            display: "flex",
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
                headerClassName: "idox-data-grid-header",
                hide: true,
                sortable: false,
                filterable: false,
              },
              {
                field: "localityEng",
                headerName: "English",
                headerClassName: "idox-data-grid-header",
                display: "flex",
                flex: 30,
                renderCell: GetLocalityEng,
              },
              {
                field: "localityCym",
                headerName: "Welsh",
                headerClassName: "idox-data-grid-header",
                display: "flex",
                flex: 30,
                renderCell: GetLocalityCym,
              },
              {
                field: "historic",
                headerName: "Status",
                headerClassName: "idox-data-grid-header",
                display: "flex",
                flex: 30,
                renderCell: GetHistoric,
              },
              {
                field: "linkedRef",
                headerClassName: "idox-data-grid-header",
                hide: true,
                sortable: false,
                filterable: false,
              },
              {
                field: "actions",
                type: "actions",
                headerClassName: "idox-data-grid-header",
                display: "flex",
                sortable: false,
                filterable: false,
                renderCell: displayActionButtons,
              },
            ]
          : [
              {
                field: "id",
                headerClassName: "idox-data-grid-header",
                hide: true,
                sortable: false,
                filterable: false,
              },
              {
                field: "localityEng",
                headerName: "Locality",
                headerClassName: "idox-data-grid-header",
                display: "flex",
                flex: 30,
                renderCell: GetLocalityEng,
              },
              {
                field: "historic",
                headerName: "Status",
                headerClassName: "idox-data-grid-header",
                display: "flex",
                flex: 30,
                renderCell: GetHistoric,
              },
              {
                field: "linkedRef",
                headerClassName: "idox-data-grid-header",
                hide: true,
                sortable: false,
                filterable: false,
              },
              {
                field: "actions",
                type: "actions",
                headerClassName: "idox-data-grid-header",
                display: "flex",
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
                headerClassName: "idox-data-grid-header",
                hide: true,
                sortable: false,
                filterable: false,
              },
              {
                field: "townEng",
                headerName: "English",
                headerClassName: "idox-data-grid-header",
                display: "flex",
                flex: 30,
                renderCell: GetTownEng,
              },
              {
                field: "townCym",
                headerName: "Welsh",
                headerClassName: "idox-data-grid-header",
                display: "flex",
                flex: 30,
                renderCell: GetTownCym,
              },
              {
                field: "historic",
                headerName: "Status",
                headerClassName: "idox-data-grid-header",
                display: "flex",
                flex: 30,
                renderCell: GetHistoric,
              },
              {
                field: "linkedRef",
                headerClassName: "idox-data-grid-header",
                hide: true,
                sortable: false,
                filterable: false,
              },
              {
                field: "actions",
                type: "actions",
                headerClassName: "idox-data-grid-header",
                display: "flex",
                sortable: false,
                filterable: false,
                renderCell: displayActionButtons,
              },
            ]
          : [
              {
                field: "id",
                headerClassName: "idox-data-grid-header",
                hide: true,
                sortable: false,
                filterable: false,
              },
              {
                field: "townEng",
                headerName: "Town",
                headerClassName: "idox-data-grid-header",
                display: "flex",
                flex: 30,
                renderCell: GetTownEng,
              },
              {
                field: "historic",
                headerName: "Status",
                headerClassName: "idox-data-grid-header",
                display: "flex",
                flex: 30,
                renderCell: GetHistoric,
              },
              {
                field: "linkedRef",
                headerClassName: "idox-data-grid-header",
                hide: true,
                sortable: false,
                filterable: false,
              },
              {
                field: "actions",
                type: "actions",
                headerClassName: "idox-data-grid-header",
                display: "flex",
                sortable: false,
                filterable: false,
                renderCell: displayActionButtons,
              },
            ];

      case "island":
        return [
          {
            field: "id",
            headerClassName: "idox-data-grid-header",
            hide: true,
            sortable: false,
            filterable: false,
          },
          {
            field: "islandEng",
            headerName: "Island",
            headerClassName: "idox-data-grid-header",
            display: "flex",
            flex: 30,
            renderCell: GetIslandEng,
          },
          {
            field: "historic",
            headerName: "Status",
            headerClassName: "idox-data-grid-header",
            display: "flex",
            flex: 30,
            renderCell: GetHistoric,
          },
          {
            field: "linkedRef",
            headerClassName: "idox-data-grid-header",
            hide: true,
            sortable: false,
            filterable: false,
          },
          {
            field: "actions",
            type: "actions",
            headerClassName: "idox-data-grid-header",
            display: "flex",
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
                headerClassName: "idox-data-grid-header",
                hide: true,
                sortable: false,
                filterable: false,
              },
              {
                field: "administrativeAreaEng",
                headerName: "English",
                headerClassName: "idox-data-grid-header",
                display: "flex",
                flex: 30,
                renderCell: GetAdministrativeAreaEng,
              },
              {
                field: "administrativeAreaCym",
                headerName: "Welsh",
                headerClassName: "idox-data-grid-header",
                display: "flex",
                flex: 30,
                renderCell: GetAdministrativeAreaCym,
              },
              {
                field: "historic",
                headerName: "Status",
                headerClassName: "idox-data-grid-header",
                display: "flex",
                flex: 30,
                renderCell: GetHistoric,
              },
              {
                field: "linkedRef",
                headerClassName: "idox-data-grid-header",
                hide: true,
                sortable: false,
                filterable: false,
              },
              {
                field: "actions",
                type: "actions",
                headerClassName: "idox-data-grid-header",
                display: "flex",
                sortable: false,
                filterable: false,
                renderCell: displayActionButtons,
              },
            ]
          : [
              {
                field: "id",
                headerClassName: "idox-data-grid-header",
                hide: true,
                sortable: false,
                filterable: false,
              },
              {
                field: "administrativeAreaEng",
                headerName: "Administrative area",
                headerClassName: "idox-data-grid-header",
                display: "flex",
                flex: 30,
                renderCell: GetAdministrativeAreaEng,
              },
              {
                field: "historic",
                headerName: "Status",
                headerClassName: "idox-data-grid-header",
                display: "flex",
                flex: 30,
                renderCell: GetHistoric,
              },
              {
                field: "linkedRef",
                headerClassName: "idox-data-grid-header",
                hide: true,
                sortable: false,
                filterable: false,
              },
              {
                field: "actions",
                type: "actions",
                headerClassName: "idox-data-grid-header",
                display: "flex",
                sortable: false,
                filterable: false,
                renderCell: displayActionButtons,
              },
            ];

      case "ward":
        return [
          {
            field: "id",
            headerClassName: "idox-data-grid-header",
            hide: true,
            sortable: false,
            filterable: false,
          },
          {
            field: "ward",
            headerName: "Ward",
            headerClassName: "idox-data-grid-header",
            display: "flex",
            flex: 30,
            renderCell: GetWard,
          },
          {
            field: "wardCode",
            headerName: "Code",
            headerClassName: "idox-data-grid-header",
            display: "flex",
            flex: 20,
            renderCell: GetWardCode,
          },
          {
            field: "historic",
            headerName: "Status",
            headerClassName: "idox-data-grid-header",
            display: "flex",
            flex: 20,
            renderCell: GetHistoric,
          },
          {
            field: "actions",
            type: "actions",
            headerClassName: "idox-data-grid-header",
            display: "flex",
            sortable: false,
            filterable: false,
            renderCell: displayActionButtons,
          },
        ];

      case "parish":
        return [
          {
            field: "id",
            headerClassName: "idox-data-grid-header",
            hide: true,
            sortable: false,
            filterable: false,
          },
          {
            field: "parish",
            headerName: "Parish",
            headerClassName: "idox-data-grid-header",
            display: "flex",
            flex: 30,
            renderCell: GetParish,
          },
          {
            field: "parishCode",
            headerName: "Code",
            headerClassName: "idox-data-grid-header",
            display: "flex",
            flex: 20,
            renderCell: GetParishCode,
          },
          {
            field: "historic",
            headerName: "Status",
            headerClassName: "idox-data-grid-header",
            display: "flex",
            flex: 20,
            renderCell: GetHistoric,
          },
          {
            field: "actions",
            type: "actions",
            headerClassName: "idox-data-grid-header",
            display: "flex",
            sortable: false,
            filterable: false,
            renderCell: displayActionButtons,
          },
        ];

      case "dbAuthority":
        return [
          {
            field: "id",
            headerClassName: "idox-data-grid-header",
            hide: true,
            sortable: false,
            filterable: false,
          },
          {
            field: "dbAuthorityRef",
            headerName: "DETR Code",
            headerClassName: "idox-data-grid-header",
            display: "flex",
            flex: 20,
            renderCell: GetDbAuthorityNumeric,
          },
          {
            field: "dbAuthorityName",
            headerName: "Authority",
            headerClassName: "idox-data-grid-header",
            display: "flex",
            flex: 40,
            renderCell: GetDbAuthorityName,
          },
          {
            field: "dbAuthorityMinUsrn",
            headerName: "Min USRN",
            headerClassName: "idox-data-grid-header",
            display: "flex",
            flex: 20,
            renderCell: GetDbAuthorityNumeric,
          },
          {
            field: "dbAuthorityMaxUsrn",
            headerName: "Max USRN",
            headerClassName: "idox-data-grid-header",
            display: "flex",
            flex: 20,
            renderCell: GetDbAuthorityNumeric,
          },
          {
            field: "actions",
            type: "actions",
            headerClassName: "idox-data-grid-header",
            display: "flex",
            sortable: false,
            filterable: false,
            renderCell: displayActionButtons,
          },
        ];

      case "operationalDistrict":
        return [
          {
            field: "id",
          },
          {
            field: "districtName",
            headerName: "Name",
            headerClassName: "idox-data-grid-header",
            display: "flex",
            flex: 20,
            renderCell: GetOperationalDistrictName,
          },
          {
            field: "organisationId",
            headerName: "Organisation",
            headerClassName: "idox-data-grid-header",
            display: "flex",
            flex: 20,
            renderCell: GetOperationalDistrictOrganisation,
          },
          {
            field: "districtFunction",
            headerName: "Function",
            headerClassName: "idox-data-grid-header",
            display: "flex",
            flex: 20,
            renderCell: GetOperationalDistrictFunction,
          },
          {
            field: "historic",
            headerName: "Status",
            headerClassName: "idox-data-grid-header",
            display: "flex",
            flex: 15,
            renderCell: GetHistoric,
          },
          {
            field: "actions",
            type: "actions",
            headerClassName: "idox-data-grid-header",
            display: "flex",
            sortable: false,
            filterable: false,
            renderCell: displayActionButtons,
          },
          {
            field: "lastUpdateDate",
          },
          {
            field: "districtId",
          },
          {
            field: "districtClosed",
          },
          {
            field: "districtFtpServerName",
          },
          {
            field: "districtServerIpAddress",
          },
          {
            field: "districtFtpDirectory",
          },
          {
            field: "districtNotificationsUrl",
          },
          {
            field: "attachmentUrlPrefix",
          },
          {
            field: "districtFaxNo",
          },
          {
            field: "districtPostcode",
          },
          {
            field: "districtTelNo",
          },
          {
            field: "outOfHoursArrangements",
          },
          {
            field: "fpnDeliveryUrl",
          },
          {
            field: "fpnFaxNumber",
          },
          {
            field: "fpnDeliveryPostcode",
          },
          {
            field: "fpnPaymentUrl",
          },
          {
            field: "fpnPaymentTelNo",
          },
          {
            field: "fpnPaymentBankName",
          },
          {
            field: "fpnPaymentSortCode",
          },
          {
            field: "fpnPaymentAccountNo",
          },
          {
            field: "fpnPaymentAccountName",
          },
          {
            field: "fpnPaymentPostcode",
          },
          {
            field: "fpnContactName",
          },
          {
            field: "fpnContactPostcode",
          },
          {
            field: "fpnContactTelNo",
          },
          {
            field: "districtPostalAddress1",
          },
          {
            field: "districtPostalAddress2",
          },
          {
            field: "districtPostalAddress3",
          },
          {
            field: "districtPostalAddress4",
          },
          {
            field: "districtPostalAddress5",
          },
          {
            field: "fpnDeliveryAddress1",
          },
          {
            field: "fpnDeliveryAddress2",
          },
          {
            field: "fpnDeliveryAddress3",
          },
          {
            field: "fpnDeliveryAddress4",
          },
          {
            field: "fpnDeliveryAddress5",
          },
          {
            field: "fpnContactAddress1",
          },
          {
            field: "fpnContactAddress2",
          },
          {
            field: "fpnContactAddress3",
          },
          {
            field: "fpnContactAddress4",
          },
          {
            field: "fpnContactAddress5",
          },
          {
            field: "fpnPaymentAddress1",
          },
          {
            field: "fpnPaymentAddress2",
          },
          {
            field: "fpnPaymentAddress3",
          },
          {
            field: "fpnPaymentAddress4",
          },
          {
            field: "fpnPaymentAddress5",
          },
          {
            field: "fpnDeliveryEmailAddress",
          },
          {
            field: "districtPermitSchemeId",
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

      case "operationalDistrict":
        return {
          columns: {
            columnVisibilityModel: {
              id: false,
              lastUpdateDate: false,
              districtId: false,
              districtClosed: false,
              districtFtpServerName: false,
              districtServerIpAddress: false,
              districtFtpDirectory: false,
              districtNotificationsUrl: false,
              attachmentUrlPrefix: false,
              districtFaxNo: false,
              districtPostcode: false,
              districtTelNo: false,
              outOfHoursArrangements: false,
              fpnDeliveryUrl: false,
              fpnFaxNumber: false,
              fpnDeliveryPostcode: false,
              fpnPaymentUrl: false,
              fpnPaymentTelNo: false,
              fpnPaymentBankName: false,
              fpnPaymentSortCode: false,
              fpnPaymentAccountNo: false,
              fpnPaymentAccountName: false,
              fpnPaymentPostcode: false,
              fpnContactName: false,
              fpnContactPostcode: false,
              fpnContactTelNo: false,
              districtPostalAddress1: false,
              districtPostalAddress2: false,
              districtPostalAddress3: false,
              districtPostalAddress4: false,
              districtPostalAddress5: false,
              fpnDeliveryAddress1: false,
              fpnDeliveryAddress2: false,
              fpnDeliveryAddress3: false,
              fpnDeliveryAddress4: false,
              fpnDeliveryAddress5: false,
              fpnContactAddress1: false,
              fpnContactAddress2: false,
              fpnContactAddress3: false,
              fpnContactAddress4: false,
              fpnContactAddress5: false,
              fpnPaymentAddress1: false,
              fpnPaymentAddress2: false,
              fpnPaymentAddress3: false,
              fpnPaymentAddress4: false,
              fpnPaymentAddress5: false,
              fpnDeliveryEmailAddress: false,
              districtPermitSchemeId: false,
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

      case "dbAuthority":
        setLookupType("authority");
        setLookupTypeId("db-authority");
        setSortModel([{ field: "dbAuthorityRef", sort: "asc" }]);
        break;

      case "operationalDistrict":
        setLookupType("district");
        setLookupTypeId("operational-district");
        setSortModel([{ field: "districtName", sort: "asc" }]);
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
              slotProps={{
                input: {
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
                },
              }}
            />
          </Box>
          <Stack direction="row" spacing={2}>
            {["ward", "parish"].includes(variant) && (
              <Button variant="contained" sx={blueButtonStyle} startIcon={<UpdateIcon />} onClick={doUpdateSpatialData}>
                <Typography variant="body2">{`Spatially update BLPU ${variant} codes`}</Typography>
              </Button>
            )}
            <Button variant="contained" sx={blueButtonStyle} startIcon={<AddIcon />} onClick={doAddLookup}>
              <Typography variant="body2">{`${stringToSentenceCase(lookupType)}`}</Typography>
            </Button>
          </Stack>
        </Stack>
        <Box sx={dataFormStyle("LookupTableGridTab")} className={classes.root}>
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
                    backgroundColor: adsPaleBlueA,
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
