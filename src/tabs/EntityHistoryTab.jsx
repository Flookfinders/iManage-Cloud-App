/* #region header */
/**************************************************************************************************
//
//  Description: ESU Data tab
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
//    002   07.09.23 Sean Flook                 Cleaned the code.
//    003   06.10.23 Sean Flook                 Use colour variables.
//    004   27.10.23 Sean Flook                 Use new dataFormStyle.
//    005   24.11.23 Sean Flook                 Moved Box to @mui/system.
//    006   02.01.24 Sean Flook                 Changed console.log to console.error for error messages.
//    007   05.01.24 Sean Flook                 Changes to sort out warnings and use CSS shortcuts.
//    008   25.01.24 Sean Flook                 Correctly handle status code 204.
//    009   08.03.24 Joshua McCormick IMANN-280 Adding Padding bottom to match padding top in the stack/chips
//    010   11.03.24 Sean Flook           GLB12 Adjusted height to remove gap.
//    011   15.03.24 Sean Flook            GLB6 Use individual buttons to toggle between updates and edits.
//    012   22.03.24 Sean Flook           GLB12 Changed to use dataFormStyle so height can be correctly set.
//    013   19.06.24 Sean Flook       IMANN-629 Changes to code so that current user is remembered and a 401 error displays the login dialog.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import React, { useContext, useState, useEffect, Fragment } from "react";

import PropertyContext from "../context/propertyContext";
import StreetContext from "../context/streetContext";
import UserContext from "../context/userContext";
import SettingsContext from "../context/settingsContext";

import { GetPropertyHistoryByUPRNUrl, GetStreetHistoryByUSRNUrl } from "../configuration/ADSConfig";

import { Button, Skeleton, Stack, Typography } from "@mui/material";
import { Box } from "@mui/system";
import ADSEntityHistoryList from "../components/ADSEntityHistoryList";

import UpdateIcon from "@mui/icons-material/Update";
import EditIcon from "@mui/icons-material/Edit";

import { blueButtonStyle, dataFormStyle, greyButtonStyle, toolbarStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

function EntityHistoryTab({ variant }) {
  const theme = useTheme();

  const streetContext = useContext(StreetContext);
  const propertyContext = useContext(PropertyContext);
  const userContext = useContext(UserContext);
  const settingsContext = useContext(SettingsContext);

  const [apiUrl, setApiUrl] = useState(null);
  const [data, setData] = useState();
  const [dataUsrn, setDataUsrn] = useState(streetContext.currentStreet.usrn);
  const [dataUprn, setDataUprn] = useState(propertyContext.currentProperty.uprn);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("update");

  /**
   * Event to handle updating the history data.
   */
  const handleUpdateHistory = () => {
    if (currentTab !== "update") setCurrentTab("update");
    setData({}); // clear the display
    setLoading(true); // make render ignore null data (which would crash it)
    setData(null); // useEffect will fetch data then setLoading(false) so render will display new data
  };

  /**
   * Event to handle viewing the edits in progress data.
   */
  const handleEditsInProgress = () => {
    if (currentTab !== "edits") setCurrentTab("edits");
  };

  useEffect(() => {
    async function SetUpEntityHistory() {
      const changedParent =
        variant === "street"
          ? streetContext.currentStreet.usrn !== dataUsrn
          : propertyContext.currentProperty.uprn !== dataUprn || propertyContext.currentProperty.usrn !== dataUsrn;
      if (!data || changedParent) {
        if (apiUrl) {
          setLoading(true);
          const fetchUrl =
            variant === "street"
              ? `${apiUrl.url}/${streetContext.currentStreet.usrn}`
              : propertyContext.currentProperty.uprn > 0
              ? `${apiUrl.url}/${propertyContext.currentProperty.uprn}`
              : `${apiUrl.url}/${propertyContext.currentProperty.usrn}`;
          fetch(fetchUrl, {
            headers: apiUrl.headers,
            crossDomain: true,
            method: "GET",
          })
            .then((res) => (res.ok ? res : Promise.reject(res)))
            .then((res) => {
              if (res.status && res.status === 204) return [];
              else return res.json();
            })
            .then(
              (result) => {
                setData(result);
              },
              (error) => {
                if (error.status && error.status === 401) {
                  userContext.onExpired();
                } else {
                  console.error(`[ERROR] Get ${variant} history`, error);
                }
              }
            )
            .then(() => {
              if (variant === "street") setDataUsrn(streetContext.currentStreet.usrn);
              else {
                setDataUprn(propertyContext.currentProperty.uprn);
                setDataUsrn(propertyContext.currentProperty.usrn);
              }
              setLoading(false);
            });
        } else {
          console.error("[ERROR] Property history apiUrl is null");
        }
      }
    }

    if (!apiUrl) {
      if (variant === "street") {
        setApiUrl(GetStreetHistoryByUSRNUrl(userContext.currentUser.token));
      } else {
        setApiUrl(GetPropertyHistoryByUPRNUrl(userContext.currentUser.token));
      }
    }

    if (apiUrl && (!data || propertyContext.currentProperty.uprn !== dataUprn)) SetUpEntityHistory();

    return () => {};
  }, [variant, streetContext, propertyContext, userContext, settingsContext, apiUrl, data, dataUsrn, dataUprn]);

  return (
    <Fragment>
      <Box sx={toolbarStyle}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="flex-start"
          spacing={1}
          sx={{ pl: theme.spacing(2), pt: theme.spacing(0.55) }}
        >
          <Button
            autoFocus
            variant="contained"
            startIcon={<UpdateIcon />}
            onClick={handleUpdateHistory}
            sx={currentTab === "update" ? blueButtonStyle : greyButtonStyle}
          >
            <Typography variant="caption">Update history</Typography>
          </Button>
          <Button
            disabled
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEditsInProgress}
            sx={currentTab === "edits" ? blueButtonStyle : greyButtonStyle}
          >
            <Typography variant="caption">Edits in progress</Typography>
          </Button>
        </Stack>
      </Box>
      <Box sx={dataFormStyle("EntityHistoryTab")}>
        {loading ? (
          <Skeleton variant="rectangular" height="30px" width="100%" />
        ) : (
          <ADSEntityHistoryList historySummaryData={data} />
        )}
        <Box sx={{ height: "24px" }} />
      </Box>
    </Fragment>
  );
}

export default EntityHistoryTab;
