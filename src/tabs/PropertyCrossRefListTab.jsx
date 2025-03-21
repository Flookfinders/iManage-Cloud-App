//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Property cross reference list tab
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
//    002   06.10.23 Sean Flook                  Use colour variables.
//    003   27.10.23 Sean Flook                  Use new dataFormStyle.
//    004   24.11.23 Sean Flook                  Moved Box and Stack to @mui/system and fixed a warning.
//    005   08.12.23 Sean Flook                  Migrated DataGrid to v6.
//    006   05.01.24 Sean Flook                  Changes to sort out warnings and use CSS shortcuts.
//    007   25.01.24 Sean Flook                  Changes required after UX review.
//    008   16.02.24 Sean Flook         ESU16_GP If changing page etc ensure the information and selection controls are cleared.
//    009   20.02.24 Sean Flook         ESU16_GP Undone above change as not required.
//    010   11.03.24 Sean Flook            GLB12 Adjusted height to remove gap.
//    011   18.03.24 Sean Flook            GLB12 Adjusted height to remove overflow.
//    012   18.03.24 Sean Flook       STRFRM3_OS Set the styling for the header row of the data grid.
//    013   22.03.24 Sean Flook            GLB12 Changed to use dataFormStyle so height can be correctly set.
//    014   26.03.24 Joshua McCormick  IMANN-336 Added xrefKey field name to displayActionButtons to give same display properties, added flex25 to historic
//    015   27.03.24 Sean Flook        IMANN-336 Undone above changes as already done under STRFRM3_OS.
//    016   29.04.24 Joshua McCormick  IMANN-386 Toolbar changes no title no wrapping with width restrictions
//    017   20.06.24 Sean Flook        IMANN-636 Use the new user rights.
//endregion Version 1.0.0.0
//region Version 1.0.1.0
//    018   20.06.24 Sean Flook       IMANN-1003 Removed the add icon when we have no records.
//    019   31.10.24 Sean Flook       IMANN-1012 Changed height of skeleton control.
//endregion Version 1.0.1.0
//region Version 1.0.5.0
//    020   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//    021   14.03.25 Sean Flook        IMANN-963 Prevent the selection control from displaying if the user cannot edit the data.
//endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//endregion header

import React, { useContext, useState, useRef, useEffect, Fragment } from "react";
import PropTypes from "prop-types";
import UserContext from "../context/userContext";
import LookupContext from "../context/lookupContext";
import SettingsContext from "../context/settingsContext";
import { copyTextToClipboard, GetCrossRefAvatar, GetHistoricAvatar } from "../utils/HelperUtils";
import { getBilingualSource } from "../utils/PropertyUtils";
import { Tooltip, IconButton, Typography, List, ListItemButton, ListItemText, Skeleton, Popper } from "@mui/material";
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

PropertyCrossRefListTab.propTypes = {
  data: PropTypes.array,
  errors: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  onSetCopyOpen: PropTypes.func.isRequired,
  onCrossRefSelected: PropTypes.func.isRequired,
  onCrossRefDelete: PropTypes.func.isRequired,
  onMultiCrossRefDelete: PropTypes.func.isRequired,
};

const defaultTheme = createTheme();
const useStyles = makeStyles(
  (theme) => {
    return gridRowStyle;
  },
  { defaultTheme }
);

function PropertyCrossRefListTab({
  data,
  errors,
  loading,
  onSetCopyOpen,
  onCrossRefSelected,
  onCrossRefDelete,
  onMultiCrossRefDelete,
}) {
  const theme = useTheme();
  const classes = useStyles();

  const userContext = useContext(UserContext);
  const lookupContext = useContext(LookupContext);
  const settingsContext = useContext(SettingsContext);

  const [sortModel, setSortModel] = useState([{ field: "source", sort: "asc" }]);
  const [selectionModel, setSelectionModel] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);

  const [selectionAnchorEl, setSelectionAnchorEl] = useState(null);
  const selectionOpen = Boolean(selectionAnchorEl);
  const selectionId = selectionOpen ? "cross-reference-selection-popper" : undefined;

  const [userCanEdit, setUserCanEdit] = useState(false);

  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);

  const deleteCrossRefId = useRef(null);
  const [associatedRecords, setAssociatedRecords] = useState(null);

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
   * Event to handle the deletion of a cross reference record.
   */
  const handleDeleteCrossReference = () => {
    if (selectionModel && selectionModel.length > 0) {
      if (settingsContext.isWelsh) {
        const bilingualSource = getBilingualSource(lookupContext);

        const selectedCrossRefs = data.filter((x) => selectionModel.includes(x.id) && x.sourceId === bilingualSource);

        if (selectedCrossRefs && selectedCrossRefs.length > 0) {
          setAssociatedRecords([{ type: "linked lpi", count: selectedCrossRefs.length * 2 }]);
        } else setAssociatedRecords(null);
      }
      setOpenDeleteConfirmation(true);
    }
  };

  /**
   * Method to display the action buttons for the given row.
   *
   * @param {object} params The grid row parameters.
   * @returns {JSX.Element} The action buttons for the row
   */
  const displayActionButtons = (params) => {
    const onCopyClick = (event) => {
      event.stopPropagation();
      handleCopyCrossReference(params.row.crossReference);
    };

    const onDeleteClick = (event) => {
      event.stopPropagation();
      deleteCrossRefId.current = params.id;
      if (params.row.sourceId === getBilingualSource(lookupContext)) {
        setAssociatedRecords([{ type: "linked lpi", count: 2 }]);
      } else setAssociatedRecords(null);
      setOpenDeleteConfirmation(true);
    };

    return (
      selectedRow &&
      params.id === selectedRow &&
      selectionModel &&
      selectionModel.length < 2 && (
        <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
          <ADSActionButton
            id={`copy-cross-ref-${params.id}`}
            variant="copy"
            inheritBackground
            tooltipTitle="Copy cross reference"
            tooltipPlacement="bottom"
            onClick={onCopyClick}
          />
          <ADSActionButton
            id={`delete-cross-ref-${params.id}`}
            variant="delete"
            inheritBackground
            disabled={!userCanEdit}
            tooltipTitle="Delete cross reference"
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
  const columns = [
    { field: "id" },
    { field: "changeType" },
    { field: "uprn" },
    { field: "xrefKey" },
    { field: "source" },
    {
      field: "sourceId",
      headerClassName: "idox-cross-ref-data-grid-header",
      headerName: "Source",
      display: "flex",
      flex: 30,
      renderCell: GetCrossRefAvatar,
    },
    {
      field: "crossReference",
      headerClassName: "idox-cross-ref-data-grid-header",
      headerName: "Cross reference",
      flex: 25,
    },
    { field: "entryDate" },
    { field: "startDate" },
    {
      field: "historic",
      headerClassName: "idox-cross-ref-data-grid-header",
      headerName: "Historic",
      display: "flex",
      flex: 10,
      sortable: false,
      align: "center",
      renderCell: GetHistoricAvatar,
    },
    { field: "lastUpdateDate" },
    { field: "neverExport" },
    {
      field: "",
      headerClassName: "idox-cross-ref-data-grid-header",
      display: "flex",
      sortable: false,
      renderCell: displayActionButtons,
    },
  ];

  /**
   * Event to handle when a cross reference record is clicked.
   *
   * @param {object} param The grid row parameters.
   * @param {object} event The event object.
   */
  const handleCrossRefClicked = (param, event) => {
    event.stopPropagation();
    if (param && param.field !== "__check__" && param.field !== "") {
      let record = -1;
      for (let i = 0; i < data.length; i++) {
        if (data[i].id === param.id) {
          record = i;
          break;
        }
      }
      if (onCrossRefSelected) onCrossRefSelected(param.id, param.row, record, data.length);
    }
  };

  /**
   * Event to handle when the selection model for the data grid changes.
   *
   * @param {object} selectionModel The current selection model for the data grid.
   */
  const handleSelectionModelChange = (selectionModel) => {
    if (selectionModel.length > 0 && userCanEdit) {
      setSelectionAnchorEl(document.getElementById("ads-cross-reference-data-grid"));
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
   * Event to handle when the add cross reference button is clicked.
   *
   * @param {object} event The event object.
   */
  const handleAddCrossRefClick = (event) => {
    event.stopPropagation();
    if (onCrossRefSelected) onCrossRefSelected(0, null, null, null);
  };

  /**
   * Method used to copy the text to the clipboard.
   *
   * @param {string|null} text The text that needs to be copied to the clipboard.
   * @param {string} dataType The type of data that is being copied to the clipboard.
   */
  const itemCopy = (text, dataType) => {
    if (text) {
      copyTextToClipboard(text);
      if (onSetCopyOpen) onSetCopyOpen(true, dataType);
    }
  };

  /**
   * Event to copy the given cross reference to the clipboard.
   *
   * @param {string} crossRef The cross reference that needs to be copied to the clipboard.
   */
  const handleCopyCrossReference = (crossRef) => {
    if (crossRef) itemCopy(crossRef, "Cross reference");
  };

  /**
   * Event to handle when the delete confirmation dialog is closed.
   *
   * @param {boolean} deleteConfirmed True if the user has confirmed the delete; otherwise false.
   */
  const handleCloseDeleteConfirmation = (deleteConfirmed) => {
    setOpenDeleteConfirmation(false);
    if (deleteConfirmed) {
      if (selectionModel && selectionModel.length > 0 && onMultiCrossRefDelete) {
        onMultiCrossRefDelete(selectionModel);
        setSelectionAnchorEl(null);
        setSelectionModel([]);
      } else if (deleteCrossRefId.current && onCrossRefDelete) {
        onCrossRefDelete(deleteCrossRefId.current);
        deleteCrossRefId.current = null;
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
      <Box sx={toolbarStyle} id="ads-cross-reference-data-grid">
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle1" noWrap sx={{ pl: theme.spacing(2) }}>
            Cross references
          </Typography>
          <Tooltip title="Add new cross reference record" arrow placement="right" sx={tooltipStyle}>
            <IconButton sx={ActionIconStyle()} disabled={!userCanEdit} onClick={handleAddCrossRefClick} size="small">
              <AddCircleIcon />
              <Typography
                variant="subtitle1"
                noWrap
                sx={{
                  pl: theme.spacing(1),
                  pr: theme.spacing(1),
                }}
              >
                Cross reference
              </Typography>
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
      <Box
        sx={{
          ...dataFormStyle("PropertyCrossRefListTab"),
          "& .idox-cross-ref-data-grid-header": { backgroundColor: adsLightGreyC, color: adsMidGreyA },
          "& .MuiDataGrid-columnHeaderCheckbox": { backgroundColor: adsLightGreyC, color: adsMidGreyA },
        }}
        className={classes.root}
      >
        {loading ? (
          <Skeleton variant="rectangular" height="30px" width="100%" />
        ) : data && data.length > 0 ? (
          <DataGrid
            rows={data}
            columns={columns}
            initialState={{
              columns: {
                columnVisibilityModel: {
                  id: false,
                  changeType: false,
                  uprn: false,
                  xrefKey: false,
                  source: false,
                  entryDate: false,
                  startDate: false,
                  lastUpdateDate: false,
                  neverExport: false,
                },
              },
            }}
            autoPageSize
            checkboxSelection
            disableColumnMenu
            disableRowSelectionOnClick
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
            onCellClick={handleCrossRefClicked}
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
              onClick={handleAddCrossRefClick}
              sx={{
                height: "30px",
                "&:hover": {
                  backgroundColor: adsLightBlue10,
                  color: adsBlueA,
                },
              }}
            >
              <ListItemText primary={<Typography variant="subtitle1">No cross reference records present</Typography>} />
            </ListItemButton>
          </List>
        )}
      </Box>
      <Popper id={selectionId} open={selectionOpen} anchorEl={selectionAnchorEl} placement="top-start">
        <ADSSelectionControl
          selectionCount={selectionModel && selectionModel.length > 0 ? selectionModel.length : 0}
          haveCrossReference={selectionModel && selectionModel.length > 0}
          currentCrossReference={selectionModel}
          onDeleteCrossReference={handleDeleteCrossReference}
          onClose={handleCloseSelection}
        />
      </Popper>
      <div>
        <ConfirmDeleteDialog
          variant="app cross ref"
          recordCount={selectionModel && selectionModel.length > 0 ? selectionModel.length : 0}
          open={openDeleteConfirmation}
          associatedRecords={associatedRecords}
          onClose={handleCloseDeleteConfirmation}
        />
      </div>
    </Fragment>
  );
}

export default PropertyCrossRefListTab;
