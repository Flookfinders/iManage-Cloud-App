//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Display the list of BLPU provenances for the property.
//
//  Copyright:    © 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//region Version 1.0.0.0
//    001            Sean Flook                  Initial Revision.
//    002   28.06.23 Sean Flook          WI40256 Changed Extent to Provenance where appropriate.
//    003   06.10.23 Sean Flook                  Use colour variables.
//    004   27.10.23 Sean Flook                  Use new dataFormStyle.
//    005   24.11.23 Sean Flook                  Moved Box and Stack to @mui/system and fixed some warnings.
//    006   08.12.23 Sean Flook                  Migrated DataGrid to v6.
//    007   05.01.24 Sean Flook                  Changes to sort out warnings and use CSS shortcuts.
//    008   25.01.24 Sean Flook                  Changes required after UX review.
//    009   16.02.24 Sean Flook         ESU16_GP If changing page etc ensure the information and selection controls are cleared.
//    010   20.02.24 Sean Flook         ESU16_GP Undone above change as not required.
//    011   23.02.24 Joel Benford      IMANN-287 Correct hover blue
//    012   11.03.24 Sean Flook            GLB12 Adjusted height to remove gap.
//    013   18.03.24 Sean Flook            GLB12 Adjusted height to remove overflow.
//    014   18.03.24 Sean Flook       STRFRM3_OS Set the styling for the header row of the data grid.
//    015   22.03.24 Sean Flook            GLB12 Changed to use dataFormStyle so height can be correctly set.
//    016   29.04.24 Joshua McCormick  IMANN-386 Toolbar changes no title no wrapping with width restrictions
//    017   05.06.24 Sean Flook        IMANN-523 Use the provenance colour for the avatar.
//    018   20.06.24 Sean Flook        IMANN-636 Use the new user rights.
//endregion Version 1.0.0.0
//region Version 1.0.1.0
//    019   31.10.24 Sean Flook       IMANN-1012 Changed height of skeleton control.
//endregion Version 1.0.1.0
//region Version 1.0.5.0
//    020   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//    021   14.03.25 Sean Flook        IMANN-963 Prevent the selection control from displaying if the user cannot edit the data.
//endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//endregion header

import React, { useState, useRef, useContext, useEffect, Fragment } from "react";
import PropTypes from "prop-types";
import MapContext from "../context/mapContext";
import UserContext from "../context/userContext";
import PropertyContext from "../context/propertyContext";
import SettingsContext from "../context/settingsContext";
import dateFormat from "dateformat";
import { GetLookupLabel } from "../utils/HelperUtils";
import {
  Tooltip,
  IconButton,
  Typography,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Skeleton,
  Popper,
  Avatar,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import { DataGrid } from "@mui/x-data-grid";
import BLPUProvenance from "../data/BLPUProvenance";
import ADSActionButton from "../components/ADSActionButton";
import ADSSelectionControl from "../components/ADSSelectionControl";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";
import { AddCircleOutlineOutlined as AddCircleIcon } from "@mui/icons-material";
import { adsBlueA, adsLightGreyC, adsMidGreyA, adsPaleBlueA } from "../utils/ADSColours";
import { toolbarStyle, ActionIconStyle, dataFormStyle, tooltipStyle, gridRowStyle } from "../utils/ADSStyles";
import { createTheme } from "@mui/material/styles";
import { useTheme, makeStyles } from "@mui/styles";

PropertyBLPUProvenanceListTab.propTypes = {
  data: PropTypes.array,
  errors: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  onProvenanceSelected: PropTypes.func.isRequired,
  onProvenanceDelete: PropTypes.func.isRequired,
  onMultiProvenanceDelete: PropTypes.func.isRequired,
};

const defaultTheme = createTheme();
const useStyles = makeStyles(
  (theme) => {
    return gridRowStyle;
  },
  { defaultTheme }
);

function PropertyBLPUProvenanceListTab({
  data,
  errors,
  loading,
  onProvenanceSelected,
  onProvenanceDelete,
  onMultiProvenanceDelete,
}) {
  const theme = useTheme();
  const classes = useStyles();

  const mapContext = useContext(MapContext);
  const userContext = useContext(UserContext);
  const propertyContext = useContext(PropertyContext);
  const settingsContext = useContext(SettingsContext);

  const [sortModel, setSortModel] = useState([{ field: "provenanceCode", sort: "asc" }]);
  const [selectionModel, setSelectionModel] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);

  const [selectionAnchorEl, setSelectionAnchorEl] = useState(null);
  const selectionOpen = Boolean(selectionAnchorEl);
  const selectionId = selectionOpen ? "provenance-selection-popper" : undefined;

  const [userCanEdit, setUserCanEdit] = useState(false);

  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);

  const deleteProvenanceId = useRef(null);

  /**
   * Method to format the start date.
   *
   * @param {object} params The parameters including the row data.
   * @returns {string} The formatted date.
   */
  const formatTableStartDate = (params) => {
    if (params && params.row.startDate) {
      return dateFormat(params.row.startDate, "d mmm yyyy");
    } else return null;
  };

  /**
   * Method to format the end date.
   *
   * @param {object} params The parameters including the row data.
   * @returns {string} The formatted date.
   */
  const formatTableEndDate = (params) => {
    if (params && params.row.endDate) {
      return dateFormat(params.row.endDate, "d mmm yyyy");
    } else return null;
  };

  /**
   * Event to handle the deletion of a provenance record.
   */
  const handleDeleteProvenance = () => {
    if (selectionModel && selectionModel.length > 0) setOpenDeleteConfirmation(true);
  };

  /**
   * Method to display the action buttons for the given row.
   *
   * @param {object} params The grid row parameters.
   * @returns {JSX.Element} The action buttons for the row
   */
  const displayActionButtons = (params) => {
    const onDeleteClick = (event) => {
      event.stopPropagation();
      deleteProvenanceId.current = params.id;
      setOpenDeleteConfirmation(true);
    };

    return (
      selectedRow &&
      params.id === selectedRow &&
      selectionModel &&
      selectionModel.length < 2 && (
        <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
          <ADSActionButton
            id={`delete-provenance-${params.id}`}
            variant="delete"
            inheritBackground
            disabled={!userCanEdit}
            tooltipTitle="Delete provenance"
            tooltipPlacement="bottom"
            onClick={onDeleteClick}
          />
        </Stack>
      )
    );
  };

  /**
   * Method to get the provenance avatar for the given row.
   *
   * @param {object} params The grid row parameters.
   * @returns {JSX.Element} The provenance avatar for the row.
   */
  function getProvenanceAvatar(params) {
    function getProvenanceText(code) {
      const rec = BLPUProvenance.find((x) => x.id === code);

      if (rec) return rec[GetLookupLabel(settingsContext.isScottish)];
      else return null;
    }

    function getProvenanceColour(code) {
      const rec = BLPUProvenance.find((x) => x.id === code);

      if (rec) return rec.colour;
      else return "#BDBDBD";
    }

    if (params) {
      return (
        <Stack direction="row" spacing={1}>
          <Avatar
            variant="rounded"
            sx={{ height: "24px", width: "24px", backgroundColor: getProvenanceColour(params.row.provenanceCode) }}
          >
            <Typography variant="caption">{params.row.provenanceCode}</Typography>
          </Avatar>
          <Typography variant="body1">{getProvenanceText(params.row.provenanceCode)}</Typography>
        </Stack>
      );
    } else return null;
  }

  /**
   * Array of fields (columns) to be displayed in the data grid.
   */
  const provenanceColumns = [
    { field: "id" },
    { field: "uprn" },
    { field: "changeType" },
    { field: "provenanceKey" },
    {
      field: "provenanceCode",
      headerClassName: "idox-provenance-data-grid-header",
      headerName: "Type",
      display: "flex",
      flex: 30,
      renderCell: getProvenanceAvatar,
    },
    { field: "annotation" },
    { field: "entryDate" },
    {
      field: "startDate",
      headerClassName: "idox-provenance-data-grid-header",
      headerName: "Start",
      flex: 10,
      type: "date",
      align: "right",
      headerAlign: "right",
      valueGetter: (value, row, column, apiRef) => new Date(value),
      renderCell: formatTableStartDate,
    },
    {
      field: "endDate",
      headerClassName: "idox-provenance-data-grid-header",
      headerName: "End",
      flex: 10,
      type: "date",
      align: "right",
      headerAlign: "right",
      valueGetter: (value, row, column, apiRef) => new Date(value),
      renderCell: formatTableEndDate,
    },
    { field: "lastUpdateDate" },
    {
      field: "",
      headerClassName: "idox-provenance-data-grid-header",
      display: "flex",
      flex: 2,
      sortable: false,
      renderCell: displayActionButtons,
    },
  ];

  /**
   * Event to handle when the mouse enters a row in the data grid.
   *
   * @param {object} event The event object.
   */
  const handleRowMouseEnter = (event) => {
    event.preventDefault();

    mapContext.onHighlightListItem("provenance", [event.currentTarget.getAttribute("data-id")]);
    setSelectedRow(Number(event.currentTarget.getAttribute("data-id")));
  };

  /**
   * Event to handle when the mouse leaves a row in the data grid.
   */
  const handleRowMouseLeave = () => {
    mapContext.onHighlightClear();
    setSelectedRow(null);
  };

  /**
   * Event to handle when a provenance record is clicked.
   *
   * @param {object} param The grid row parameters.
   * @param {object} event The event object.
   */
  const handleProvenanceClicked = (param, event) => {
    event.stopPropagation();

    if (param && param.field !== "__check__" && param.field !== "") {
      let record = -1;
      for (let i = 0; i < data.length; i++) {
        if (data[i].id === param.id) {
          record = i;
          break;
        }
      }
      propertyContext.onProvenanceDataChange(propertyContext.currentProperty.newProperty ? true : false);
      if (onProvenanceSelected) onProvenanceSelected(param.id, param.row, record, data.length);
    }
  };

  /**
   * Event to handle when the add provenance button is clicked.
   *
   * @param {object} event The event object.
   */
  const handleAddProvenanceClick = (event) => {
    event.stopPropagation();
    propertyContext.onProvenanceDataChange(true);
    if (onProvenanceSelected) onProvenanceSelected(0, null, null, null);
  };

  /**
   * Event to handle when the selection model for the data grid changes.
   *
   * @param {object} selectionModel The current selection model for the data grid.
   */
  const handleSelectionModelChange = (selectionModel) => {
    if (selectionModel.length > 0 && userCanEdit) {
      setSelectionAnchorEl(document.getElementById("ads-provenance-data-grid"));
    } else {
      setSelectionAnchorEl(null);
    }
  };

  /**
   * Event to handle when the selection dialog is closed.
   */
  const handleCloseSelection = () => {
    setSelectionAnchorEl(null);
    setSelectionModel([]);
  };

  /**
   * Event to handle when the delete confirmation dialog is closed.
   *
   * @param {boolean} deleteConfirmed True if the user has confirmed the delete; otherwise false.
   */
  const handleCloseDeleteConfirmation = (deleteConfirmed) => {
    setOpenDeleteConfirmation(false);
    if (deleteConfirmed) {
      if (selectionModel && selectionModel.length > 0 && onMultiProvenanceDelete) {
        onMultiProvenanceDelete(selectionModel);
        setSelectionAnchorEl(null);
        setSelectionModel([]);
      } else if (deleteProvenanceId.current && onProvenanceDelete) {
        onProvenanceDelete(deleteProvenanceId.current);
        deleteProvenanceId.current = null;
      }
    }
  };

  /**
   * Method to determine if the row is valid or not.
   *
   * @param {number} id The id of the row.
   * @returns {boolean} True if the row is valid; otherwise false.
   */
  const isRowInvalid = (id) => {
    if (errors && errors.length > 0) {
      const rowErrors = errors.filter((x) => x.id === id);
      return rowErrors && rowErrors.length > 0;
    } else return false;
  };

  useEffect(() => {
    setUserCanEdit(userContext.currentUser && userContext.currentUser.editProperty);
  }, [userContext]);

  return (
    <Fragment>
      <Box sx={toolbarStyle} id="ads-provenance-data-grid">
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle1" sx={{ pl: theme.spacing(2) }} noWrap>
            BLPU provenances
          </Typography>
          <Typography>
            <Tooltip title="Add new provenance record" arrow placement="right" sx={tooltipStyle}>
              <IconButton
                sx={ActionIconStyle()}
                disabled={!userCanEdit}
                onClick={handleAddProvenanceClick}
                size="small"
              >
                <AddCircleIcon />
                <Typography
                  variant="subtitle1"
                  noWrap
                  sx={{
                    pl: theme.spacing(1),
                    pr: theme.spacing(1),
                  }}
                >
                  BLPU provenance
                </Typography>
              </IconButton>
            </Tooltip>
          </Typography>
        </Stack>
      </Box>
      <Box
        sx={{
          ...dataFormStyle("PropertyBLPUProvenanceListTab"),
          "& .idox-provenance-data-grid-header": { backgroundColor: adsLightGreyC, color: adsMidGreyA },
          "& .MuiDataGrid-columnHeaderCheckbox": { backgroundColor: adsLightGreyC, color: adsMidGreyA },
        }}
        className={classes.root}
      >
        {loading ? (
          <Skeleton variant="rectangular" height="30px" width="100%" />
        ) : data && data.filter((x) => x.changeType !== "D").length > 0 ? (
          <DataGrid
            rows={data.filter((x) => x.changeType !== "D")}
            columns={provenanceColumns}
            initialState={{
              columns: {
                columnVisibilityModel: {
                  id: false,
                  uprn: false,
                  changeType: false,
                  provenanceKey: false,
                  annotation: false,
                  entryDate: false,
                  lastUpdateDate: false,
                },
              },
            }}
            autoPageSize
            checkboxSelection
            disableColumnMenu
            pagination
            sortModel={sortModel}
            rowSelectionModel={selectionModel}
            slotProps={{
              row: {
                onMouseEnter: handleRowMouseEnter,
                onMouseLeave: handleRowMouseLeave,
              },
            }}
            getRowClassName={(params) => `${isRowInvalid(params.id) ? "invalid-row" : "valid-row"}`}
            onCellClick={handleProvenanceClicked}
            onRowSelectionModelChange={(newSelectionModel) => {
              setSelectionModel(newSelectionModel);
              handleSelectionModelChange(newSelectionModel);
            }}
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
              disabled={!userCanEdit}
              disableGutters
              onClick={handleAddProvenanceClick}
              sx={{
                height: "30px",
                "&:hover": {
                  backgroundColor: adsPaleBlueA,
                  color: adsBlueA,
                },
              }}
            >
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ pl: "16px" }}>
                    No provenance records present
                  </Typography>
                }
              />
              <ListItemAvatar
                sx={{
                  minWidth: 32,
                }}
              >
                <Tooltip title="Add BLPU provenance record" arrow placement="bottom" sx={tooltipStyle}>
                  <IconButton disabled={!userCanEdit} onClick={handleAddProvenanceClick} size="small">
                    <AddCircleIcon sx={ActionIconStyle()} />
                  </IconButton>
                </Tooltip>
              </ListItemAvatar>
            </ListItemButton>
          </List>
        )}
      </Box>
      <Popper id={selectionId} open={selectionOpen} anchorEl={selectionAnchorEl} placement="top-start">
        <ADSSelectionControl
          selectionCount={selectionModel && selectionModel.length > 0 ? selectionModel.length : 0}
          haveProvenance={selectionModel && selectionModel.length > 0}
          currentProvenance={selectionModel}
          onDeleteProvenance={handleDeleteProvenance}
          onClose={handleCloseSelection}
        />
      </Popper>
      <div>
        <ConfirmDeleteDialog
          variant="provenance"
          recordCount={selectionModel && selectionModel.length > 0 ? selectionModel.length : 0}
          open={openDeleteConfirmation}
          onClose={handleCloseDeleteConfirmation}
        />
      </div>
    </Fragment>
  );
}

export default PropertyBLPUProvenanceListTab;
