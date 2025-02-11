//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Display the list of successors.
//
//  Copyright:    © 2023 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//region Version 1.0.0.0
//    001   18.09.23 Sean Flook                  Initial Revision.
//    002   06.10.23 Sean Flook                  Use colour variables.
//    003   27.10.23 Sean Flook                  Use new dataFormStyle.
//    004   24.11.23 Sean Flook                  Moved Box and Stack to @mui/system and renamed successor to successorCrossRef.
//    005   08.12.23 Sean Flook                  Migrated DataGrid to v6.
//    006   05.01.24 Sean Flook                  Changes to sort out warnings and use CSS shortcuts.
//    007   08.01.24 Sean Flook                  Pass the correct variant to the confirmDeleteDialog.
//    008   25.01.24 Sean Flook                  Changes required after UX review.
//    009   16.02.24 Sean Flook         ESU16_GP If changing page etc ensure the information and selection controls are cleared.
//    010   20.02.24 Sean Flook         ESU16_GP Undone above change as not required.
//    011   11.03.24 Sean Flook            GLB12 Adjusted height to remove gap.
//    012   18.03.24 Sean Flook            GLB12 Adjusted height to remove overflow.
//    013   18.03.24 Sean Flook       STRFRM3_OS Set the styling for the header row of the data grid.
//    014   22.03.24 Sean Flook            GLB12 Changed to use dataFormStyle so height can be correctly set.
//    015   14.05.24 Joshua McCormick  IMAN-364  noWrap & padding to prevent toolbar content overlapping
//    016   20.06.24 Sean Flook        IMANN-636 Use the new user rights.
//    017   13.08.24 Sean Flook        IMANN-861 Hide the predecessor value.
//endregion Version 1.0.0.0
//region Version 1.0.1.0
//    018   31.10.24 Sean Flook       IMANN-1012 Changed height of skeleton control.
//endregion Version 1.0.1.0
//region Version 1.0.5.0
//    019   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//endregion header

import React, { useState, useRef, useContext, useEffect, Fragment } from "react";
import PropTypes from "prop-types";
import UserContext from "../context/userContext";
import dateFormat from "dateformat";
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
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import { DataGrid } from "@mui/x-data-grid";
import ADSActionButton from "../components/ADSActionButton";
import ADSSelectionControl from "../components/ADSSelectionControl";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";
import { AddCircleOutlineOutlined as AddCircleIcon } from "@mui/icons-material";
import { adsBlueA, adsLightBlue10, adsLightGreyC, adsMidGreyA } from "../utils/ADSColours";
import { toolbarStyle, ActionIconStyle, dataFormStyle, tooltipStyle, gridRowStyle } from "../utils/ADSStyles";
import { createTheme } from "@mui/material/styles";
import { useTheme, makeStyles } from "@mui/styles";

SuccessorListTab.propTypes = {
  data: PropTypes.array,
  variant: PropTypes.oneOf(["property", "street"]).isRequired,
  errors: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  onSuccessorCrossRefSelected: PropTypes.func.isRequired,
  onSuccessorCrossRefDelete: PropTypes.func.isRequired,
  onMultiSuccessorCrossRefDelete: PropTypes.func.isRequired,
};

const defaultTheme = createTheme();
const useStyles = makeStyles(
  (theme) => {
    return gridRowStyle;
  },
  { defaultTheme }
);

function SuccessorListTab({
  data,
  variant,
  errors,
  loading,
  onSuccessorCrossRefSelected,
  onSuccessorCrossRefDelete,
  onMultiSuccessorCrossRefDelete,
}) {
  const theme = useTheme();
  const classes = useStyles();

  const userContext = useContext(UserContext);

  const [sortModel, setSortModel] = useState([{ field: "successor", sort: "asc" }]);
  const [selectionModel, setSelectionModel] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);

  const [selectionAnchorEl, setSelectionAnchorEl] = useState(null);
  const selectionOpen = Boolean(selectionAnchorEl);
  const selectionId = selectionOpen ? "successor-selection-popper" : undefined;

  const [userCanEdit, setUserCanEdit] = useState(false);

  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);

  const deleteSuccessorCrossRefId = useRef(null);

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
   * Event to handle the deletion of a successor cross reference record.
   */
  const handleDeleteSuccessorCrossRef = () => {
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
      deleteSuccessorCrossRefId.current = params.id;
      setOpenDeleteConfirmation(true);
    };

    return (
      selectedRow &&
      params.id === selectedRow &&
      selectionModel &&
      selectionModel.length < 2 && (
        <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
          <ADSActionButton
            id={`delete-successor-${params.id}`}
            variant="delete"
            inheritBackground
            disabled={!userCanEdit}
            tooltipTitle="Delete successor cross reference"
            tooltipPlacement="bottom"
            onClick={onDeleteClick}
          />
        </Stack>
      )
    );
  };

  /**
   * Array of fields (columns) to be displayed in the data grid.
   */
  const successorColumns = [
    { field: "id" },
    { field: "changeType" },
    { field: "succKey" },
    {
      field: "successor",
      headerClassName: "idox-successor-data-grid-header",
      headerName: "Successor",
      flex: 15,
    },
    {
      field: "predecessor",
      headerClassName: "idox-successor-data-grid-header",
      headerName: "Predecessor",
      flex: 15,
    },
    { field: "successorType" },
    { field: "entryDate" },
    {
      field: "startDate",
      headerClassName: "idox-successor-data-grid-header",
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
      headerClassName: "idox-successor-data-grid-header",
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
      headerClassName: "idox-successor-data-grid-header",
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

    setSelectedRow(Number(event.currentTarget.getAttribute("data-id")));
  };

  /**
   * Event to handle when the mouse leaves a row in the data grid.
   */
  const handleRowMouseLeave = () => {
    setSelectedRow(null);
  };

  /**
   * Event to handle when a successor cross reference record is clicked.
   *
   * @param {object} param The grid row parameters.
   * @param {object} event The event object.
   */
  const handleSuccessorCrossRefClicked = (param, event) => {
    event.stopPropagation();

    if (param && param.field !== "__check__" && param.field !== "") {
      let record = -1;
      for (let i = 0; i < data.length; i++) {
        if (data[i].id === param.id) {
          record = i;
          break;
        }
      }
      if (onSuccessorCrossRefSelected) onSuccessorCrossRefSelected(param.id, param.row, record, data.length);
    }
  };

  /**
   * Event to handle when the add successor cross reference button is clicked.
   *
   * @param {object} event The event object.
   */
  const handleAddSuccessorCrossRefClick = (event) => {
    event.stopPropagation();
    if (onSuccessorCrossRefSelected) onSuccessorCrossRefSelected(0, null, null, null);
  };

  /**
   * Event to handle when the selection model for the data grid changes.
   *
   * @param {object} selectionModel The current selection model for the data grid.
   */
  const handleSelectionModelChange = (selectionModel) => {
    if (selectionModel.length > 0) {
      setSelectionAnchorEl(document.getElementById("ads-successor-data-grid"));
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
      if (selectionModel && selectionModel.length > 0 && onMultiSuccessorCrossRefDelete) {
        onMultiSuccessorCrossRefDelete(selectionModel);
        setSelectionAnchorEl(null);
        setSelectionModel([]);
      } else if (deleteSuccessorCrossRefId.current && onSuccessorCrossRefDelete) {
        onSuccessorCrossRefDelete(deleteSuccessorCrossRefId.current);
        deleteSuccessorCrossRefId.current = null;
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
    if (variant === "street") {
      setUserCanEdit(userContext.currentUser && userContext.currentUser.editStreet);
    } else {
      setUserCanEdit(userContext.currentUser && userContext.currentUser.editProperty);
    }
  }, [userContext, variant]);

  return (
    <Fragment>
      <Box sx={toolbarStyle} id="ads-successor-data-grid">
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle1" noWrap sx={{ pl: theme.spacing(1.5), pr: theme.spacing(2) }}>
            Successor cross references
          </Typography>
          <Tooltip title="Add new successor cross reference record" arrow placement="right" sx={tooltipStyle}>
            <IconButton
              sx={ActionIconStyle()}
              disabled={!userCanEdit}
              onClick={handleAddSuccessorCrossRefClick}
              size="small"
            >
              <AddCircleIcon />
              <Typography
                variant="subtitle1"
                sx={{
                  pl: theme.spacing(1),
                  pr: theme.spacing(1),
                }}
              >
                Successor cross reference
              </Typography>
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
      <Box
        sx={{
          ...dataFormStyle(`${variant === "street" ? "StreetSuccessorListTab" : "PropertySuccessorListTab"}`),
          "& .idox-successor-data-grid-header": { backgroundColor: adsLightGreyC, color: adsMidGreyA },
          "& .MuiDataGrid-columnHeaderCheckbox": { backgroundColor: adsLightGreyC, color: adsMidGreyA },
        }}
        className={classes.root}
      >
        {loading ? (
          <Skeleton variant="rectangular" height="30px" width="100%" />
        ) : data && data.filter((x) => x.changeType !== "D").length > 0 ? (
          <DataGrid
            rows={data.filter((x) => x.changeType !== "D")}
            columns={successorColumns}
            initialState={{
              columns: {
                columnVisibilityModel: {
                  id: false,
                  changeType: false,
                  succKey: false,
                  successorType: false,
                  predecessor: false,
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
            onCellClick={handleSuccessorCrossRefClicked}
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
              onClick={handleAddSuccessorCrossRefClick}
              sx={{
                height: "30px",
                "&:hover": {
                  backgroundColor: adsLightBlue10,
                  color: adsBlueA,
                },
              }}
            >
              <ListItemText
                primary={
                  <Typography noWrap variant="subtitle1" sx={{ pl: "16px" }}>
                    No successor cross reference records present
                  </Typography>
                }
              />
              <ListItemAvatar
                sx={{
                  minWidth: 32,
                }}
              >
                <Tooltip title="Add successor cross reference record" arrow placement="bottom" sx={tooltipStyle}>
                  <IconButton disabled={!userCanEdit} onClick={handleAddSuccessorCrossRefClick} size="small">
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
          haveSuccessorCrossRef={selectionModel && selectionModel.length > 0}
          currentSuccessorCrossRef={selectionModel}
          onDeleteSuccessorCrossRef={handleDeleteSuccessorCrossRef}
          onClose={handleCloseSelection}
        />
      </Popper>
      <div>
        <ConfirmDeleteDialog
          variant={variant === "street" ? "streetSuccessorCrossRef" : "propertySuccessorCrossRef"}
          recordCount={selectionModel && selectionModel.length > 0 ? selectionModel.length : 0}
          open={openDeleteConfirmation}
          onClose={handleCloseDeleteConfirmation}
        />
      </div>
    </Fragment>
  );
}

export default SuccessorListTab;
