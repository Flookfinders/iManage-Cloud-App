/* #region header */
/**************************************************************************************************
//
//  Description: Bookmark Drawer component
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   06.07.21 Sean Flook         WI39??? Initial Revision.
//    002   06.10.23 Sean Flook                 Use colour variables.
//    003   24.11.23 Sean Flook                 Moved Box to @mui/system.
//    004   05.01.24 Sean Flook                 Use CSS shortcuts.
//    005   06.02.24 Sean Flook                 Updated street view icon.
//    006   11.03.24 Sean Flook           GLB12 Correctly set width.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */

import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { Drawer, Grid, Typography, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { Box } from "@mui/system";
import ADSActionButton from "../components/ADSActionButton";
import StreetviewIcon from "@mui/icons-material/Streetview";
import StarIcon from "@mui/icons-material/Star";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import WarningIcon from "@mui/icons-material/Warning";
import { HasASD, HasProperties } from "../configuration/ADSConfig";
import { adsMidGreyB } from "../utils/ADSColours";
import { drawerWidth } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

/* #endregion imports */

ADSBookmarkDrawer.propTypes = {
  handleDrawerClose: PropTypes.func.isRequired,
};

function ADSBookmarkDrawer(props) {
  const theme = useTheme();

  /**
   * Event handle when the property view button is clicked.
   *
   * @param {number} index The index of the item.
   */
  const handlePropertyViewClick = (index) => {
    console.log("DEBUG handlePropertyViewClick", index);
  };

  /**
   * Event handle when the street view button is clicked.
   *
   * @param {number} index The index of the item.
   */
  const handleStreetViewClick = (index) => {
    console.log("DEBUG handleStreetViewClick", index);
  };

  /**
   * Event handle when the ASD view button is clicked.
   *
   * @param {number} index The index of the item.
   */
  const handleASDViewClick = (index) => {
    console.log("DEBUG handleASDViewClick", index);
  };

  /**
   * Event handle when the bookmark button is clicked.
   *
   * @param {number} index The index of the item.
   */
  const handleBookmarkClick = (index) => {
    console.log("DEBUG handleBookmarkClick", index);
  };

  /**
   * Event handle when the recent button is clicked.
   *
   * @param {number} index The index of the item.
   */
  const handleRecentClick = (index) => {
    console.log("DEBUG handleRecentClick", index);
  };

  /**
   * Event handle when the other button is clicked.
   *
   * @param {number} index The index of the item.
   */
  const handleOtherViewClick = (index) => {
    console.log("DEBUG handleOtherViewClick", index);
  };

  return (
    <Drawer
      sx={{
        width: `${drawerWidth}px`,
        anchor: "right",
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: `${drawerWidth}px`,
        },
      }}
      variant="persistent"
      anchor="right"
      open={props.open}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: theme.spacing(0, 1),
          // necessary for content to be below app bar
          ...theme.mixins.toolbar,
          justifyContent: "flex-start",
        }}
      >
        <Grid container direction="row" justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography
              variant="h6"
              noWrap
              sx={{
                color: adsMidGreyB,
              }}
            >
              Bookmarks and views
            </Typography>
          </Grid>
          <Grid item>
            <ADSActionButton
              variant="close"
              tooltipTitle="Close bookmarks and views"
              tooltipPlacement="left"
              onClick={props.handleDrawerClose}
            />
          </Grid>
        </Grid>
      </Box>
      <Box
        sx={{
          overflowY: "auto",
        }}
      >
        <Grid
          container
          direction="column"
          justifyContent="center"
          alignItems="flex-start"
          sx={{
            pl: theme.spacing(2),
          }}
        >
          {HasProperties() && (
            <Fragment>
              <Grid
                item
                xs={12}
                sx={{
                  pt: theme.spacing(1),
                }}
              >
                <Typography
                  align="left"
                  variant="subtitle1"
                  sx={{
                    color: adsMidGreyB,
                  }}
                >
                  Property views
                </Typography>
              </Grid>
              <Grid
                item
                xs={12}
                sx={{
                  pt: theme.spacing(1),
                }}
              >
                <List dense>
                  <ListItemButton onClick={() => handlePropertyViewClick(0)}>
                    <ListItemIcon>
                      <StarIcon />
                    </ListItemIcon>
                    <ListItemText primary="Provisional BLPU" />
                  </ListItemButton>
                  <ListItemButton onClick={() => handlePropertyViewClick(1)}>
                    <ListItemIcon>
                      <StarIcon />
                    </ListItemIcon>
                    <ListItemText primary="Provisional LPI" />
                  </ListItemButton>
                  <ListItemButton onClick={() => handlePropertyViewClick(2)}>
                    <ListItemIcon>
                      <StarIcon />
                    </ListItemIcon>
                    <ListItemText primary="Unoccupied" />
                  </ListItemButton>
                  <ListItemButton onClick={() => handlePropertyViewClick(3)}>
                    <ListItemIcon>
                      <StarIcon />
                    </ListItemIcon>
                    <ListItemText primary="Under construction" />
                  </ListItemButton>
                </List>
              </Grid>
            </Fragment>
          )}
          <Grid
            item
            xs={12}
            sx={{
              pt: theme.spacing(1),
            }}
          >
            <Typography
              align="left"
              variant="subtitle1"
              sx={{
                color: adsMidGreyB,
              }}
            >
              Street views
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            sx={{
              pt: theme.spacing(1),
            }}
          >
            <List dense>
              <ListItemButton onClick={() => handleStreetViewClick(0)}>
                <ListItemIcon>
                  <StreetviewIcon />
                </ListItemIcon>
                <ListItemText primary="Closed" />
              </ListItemButton>
              <ListItemButton onClick={() => handleStreetViewClick(1)}>
                <ListItemIcon>
                  <StreetviewIcon />
                </ListItemIcon>
                <ListItemText primary="Under construction" />
              </ListItemButton>
              <ListItemButton onClick={() => handleStreetViewClick(2)}>
                <ListItemIcon>
                  <StreetviewIcon />
                </ListItemIcon>
                <ListItemText primary="PRoW" />
              </ListItemButton>
            </List>
          </Grid>
          {HasASD() && (
            <Fragment>
              <Grid
                item
                xs={12}
                sx={{
                  pt: theme.spacing(1),
                }}
              >
                <Typography
                  align="left"
                  variant="subtitle1"
                  sx={{
                    color: adsMidGreyB,
                  }}
                >
                  ASD views
                </Typography>
              </Grid>
              <Grid
                item
                xs={12}
                sx={{
                  pt: theme.spacing(1),
                }}
              >
                <List dense>
                  <ListItemButton onClick={() => handleASDViewClick(0)}>
                    <ListItemIcon>
                      <StarIcon />
                    </ListItemIcon>
                    <ListItemText primary="Traffic sensitive" />
                  </ListItemButton>
                  <ListItemButton onClick={() => handleASDViewClick(1)}>
                    <ListItemIcon>
                      <StarIcon />
                    </ListItemIcon>
                    <ListItemText primary="Winter maintenance" />
                  </ListItemButton>
                  <ListItemButton onClick={() => handleASDViewClick(2)}>
                    <ListItemIcon>
                      <StarIcon />
                    </ListItemIcon>
                    <ListItemText primary="Expired operational dates" />
                  </ListItemButton>
                </List>
              </Grid>
            </Fragment>
          )}
          {props.bookmarks && (
            <Fragment>
              <Grid
                item
                xs={12}
                sx={{
                  pt: theme.spacing(1),
                }}
              >
                <Grid
                  item
                  xs={12}
                  sx={{
                    pt: theme.spacing(1),
                  }}
                >
                  <Typography
                    align="left"
                    variant="subtitle1"
                    sx={{
                      color: adsMidGreyB,
                    }}
                  >
                    Bookmarks
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sx={{
                    pt: theme.spacing(1),
                  }}
                ></Grid>
                {props.bookmarks &&
                  props.bookmarks.map((b, index) => (
                    <List disablePadding dense key={`key_${index}`}>
                      <ListItemButton id={b.pkId} dense onClick={() => handleBookmarkClick(b.pkId)}>
                        <ListItemIcon>
                          <BookmarkIcon />
                        </ListItemIcon>
                        <ListItemText primary={b.title} />
                      </ListItemButton>
                    </List>
                  ))}
              </Grid>
            </Fragment>
          )}
          <Grid
            item
            xs={12}
            sx={{
              pt: theme.spacing(1),
            }}
          >
            <Typography
              align="left"
              variant="subtitle1"
              sx={{
                color: adsMidGreyB,
              }}
            >
              Recently
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            sx={{
              pt: theme.spacing(1),
            }}
          >
            <List dense>
              <ListItemButton onClick={() => handleRecentClick(0)}>
                <ListItemIcon>
                  <WatchLaterIcon />
                </ListItemIcon>
                <ListItemText primary="Created" />
              </ListItemButton>
              <ListItemButton onClick={() => handleRecentClick(1)}>
                <ListItemIcon>
                  <WatchLaterIcon />
                </ListItemIcon>
                <ListItemText primary="Updated" />
              </ListItemButton>
              <ListItemButton onClick={() => handleRecentClick(2)}>
                <ListItemIcon>
                  <WatchLaterIcon />
                </ListItemIcon>
                <ListItemText primary="Closed" />
              </ListItemButton>
              <ListItemButton onClick={() => handleRecentClick(3)}>
                <ListItemIcon>
                  <WatchLaterIcon />
                </ListItemIcon>
                <ListItemText primary="Historicised" />
              </ListItemButton>
              <ListItemButton onClick={() => handleRecentClick(4)}>
                <ListItemIcon>
                  <WatchLaterIcon />
                </ListItemIcon>
                <ListItemText primary="Approved" />
              </ListItemButton>
            </List>
          </Grid>
          <Grid
            item
            xs={12}
            sx={{
              pt: theme.spacing(1),
            }}
          >
            <Typography
              align="left"
              variant="subtitle1"
              sx={{
                color: adsMidGreyB,
              }}
            >
              Other views
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            sx={{
              pt: theme.spacing(1),
            }}
          >
            <List dense>
              <ListItemButton onClick={() => handleOtherViewClick(0)}>
                <ListItemIcon>
                  <WarningIcon />
                </ListItemIcon>
                <ListItemText primary="Edits in progress" />
              </ListItemButton>
              <ListItemButton onClick={() => handleOtherViewClick(1)}>
                <ListItemIcon>
                  <WarningIcon />
                </ListItemIcon>
                <ListItemText primary="Rejected" />
              </ListItemButton>
              <ListItemButton onClick={() => handleOtherViewClick(2)}>
                <ListItemIcon>
                  <WarningIcon />
                </ListItemIcon>
                <ListItemText primary="Deleted" />
              </ListItemButton>
              {HasProperties() && (
                <ListItemButton onClick={() => handleOtherViewClick(3)}>
                  <ListItemIcon>
                    <WarningIcon />
                  </ListItemIcon>
                  <ListItemText primary="Site visit required" />
                </ListItemButton>
              )}
              <ListItemButton onClick={() => handleOtherViewClick(4)}>
                <ListItemIcon>
                  <WarningIcon />
                </ListItemIcon>
                <ListItemText primary="Excluded from export" />
              </ListItemButton>
            </List>
          </Grid>
        </Grid>
      </Box>
    </Drawer>
  );
}

export default ADSBookmarkDrawer;
