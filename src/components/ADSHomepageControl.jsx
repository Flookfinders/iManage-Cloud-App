/* #region header */
/**************************************************************************************************
//
//  Description: Homepage Control containing dashboard information
//
//  Copyright:    © 2021-23 Idox Software Limited
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   02.06.23 Joel Benford       WI40689 Initial Revision.
//    002   07.09.23 Sean Flook                 Modified function name.
//    003   06.10.23 Sean Flook                 Use colour variables.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import { React, useState, useEffect, useContext } from "react";

import UserContext from "../context/userContext";

import { getMonthString } from "../utils/HelperUtils";

import { Grid, Box } from "@mui/material";
import { GetHomepageUrl } from "../configuration/ADSConfig";
import ADSHomepagePieChartsControl from "./ADSHomepagePieChartsControl";
import ADSHomepageLatestEditsControl from "./ADSHomepageLatestEditsControl";

import { adsMidGreyA10 } from "../utils/ADSColours";

function ADSHomepageControl() {
  const userContext = useContext(UserContext);
  const token = userContext.currentUser.token;
  const [loaded, setLoaded] = useState(false);
  const [apiData, setApiData] = useState({ pieCharts: [], latestStreetAndPropertyEdits: [] });

  useEffect(() => {
    if (loaded) return;

    async function fetchToState() {
      const propertyMaxRows = 25; //might be a setting one day
      const propertyCutOffDays = 30; //might be a setting one day

      var pDate = new Date();
      pDate.setDate(pDate.getDate() - propertyCutOffDays);
      const day = `0${pDate.getDate()}`.substring(0, 2);
      const month = getMonthString(pDate.getMonth()).toLowerCase();
      const year = `${pDate.getFullYear()}`;
      const queryString = `?propertyEditsCutOffDate=${day}%20${month}%20${year}&maxLatestEditResults=${propertyMaxRows}`;
      const endpoint = GetHomepageUrl(token);

      await fetch(endpoint.url + queryString, {
        headers: endpoint.headers,
        crossDomain: true,
        method: "GET",
      })
        .then((res) => (res.ok ? res : Promise.reject(res)))
        .then((res) => res.json())
        .then(
          (result) => {
            setApiData(result);
          },
          (error) => {
            // if (error.status === 204) setApiData({pieCharts:[], latestStreetAndPropertyEdits:[]});
            // else console.log("ERROR Get Homepage data", error);
            console.log("ERROR Get Homepage data", error);
            setApiData({ pieCharts: [], latestStreetAndPropertyEdits: [] });
          }
        );
    }

    fetchToState();
    setLoaded(true);
  }, [token, apiData, loaded]);

  return (
    <Box sx={{ backgroundColor: adsMidGreyA10 }}>
      <Grid container direction="column" justify="center" alignItems="center" spacing={4} sx={{ pt: "10px" }}>
        <Grid item>
          <ADSHomepagePieChartsControl data={apiData.pieCharts} />
        </Grid>
        <Grid item alignItems="bottom">
          <ADSHomepageLatestEditsControl data={apiData.latestStreetAndPropertyEdits} />
        </Grid>
      </Grid>
    </Box>
  );
}

export default ADSHomepageControl;
