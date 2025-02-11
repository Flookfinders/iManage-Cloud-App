//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Homepage Control containing dashboard information
//
//  Copyright:    © 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//region Version 1.0.0.0
//    001   02.06.23 Joel Benford        WI40689 Initial Revision.
//    002   07.09.23 Sean Flook                  Modified function name.
//    003   06.10.23 Sean Flook                  Use colour variables.
//    004   24.11.23 Sean Flook                  Moved Box to @mui/system.
//    005   02.01.24 Sean Flook                  Changed console.log to console.error for error messages.
//    006   05.01.24 Sean Flook                  Changes to sort out warnings.
//    007   25.01.24 Sean Flook                  Correctly handle status code 204.
//    008   19.06.24 Sean Flook        IMANN-629 Changes to code so that current user is remembered and a 401 error displays the login dialog.
//    009   10.09.24 Sean Flook        IMANN-980 Only write to the console if the user has the showMessages right.
//endregion Version 1.0.0.0
//region Version 1.0.5.0
//    010   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//    011   30.01.25 Sean Flook       IMANN-1673 Changes required for new user settings API.
//endregion Version 1.0.5.0
//
//--------------------------------------------------------------------------------------------------
//endregion header

import { React, useState, useEffect, useContext } from "react";

import UserContext from "../context/userContext";

import { GetHomepageUrl } from "../configuration/ADSConfig";

import { getMonthString } from "../utils/HelperUtils";

import { Grid2 } from "@mui/material";
import ADSHomepagePieChartsControl from "./ADSHomepagePieChartsControl";
import ADSHomepageLatestEditsControl from "./ADSHomepageLatestEditsControl";

import { adsMidGreyA10 } from "../utils/ADSColours";

function ADSHomepageControl() {
  const userContext = useContext(UserContext);
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
      const endpoint = GetHomepageUrl(userContext.currentUser);

      await fetch(endpoint.url + queryString, {
        headers: endpoint.headers,
        crossDomain: true,
        method: "GET",
      })
        .then((res) => (res.ok ? res : Promise.reject(res)))
        .then((res) => {
          if (res.status && res.status === 204) return { pieCharts: [], latestStreetAndPropertyEdits: [] };
          else return res.json();
        })
        .then(
          (result) => {
            setApiData(result);
          },
          (error) => {
            if (error.status && error.status === 401) {
              userContext.onExpired();
            } else {
              if (userContext.currentUser.showMessages) console.error("[ERROR] Get Homepage data", error);
            }
            setApiData({ pieCharts: [], latestStreetAndPropertyEdits: [] });
          }
        );
    }

    fetchToState();
    setLoaded(true);
  }, [apiData, loaded, userContext]);

  return (
    <Grid2
      container
      direction="column"
      justify="center"
      alignItems="center"
      spacing={4}
      sx={{ pt: "10px", backgroundColor: adsMidGreyA10 }}
    >
      <Grid2>
        <ADSHomepagePieChartsControl data={apiData.pieCharts} />
      </Grid2>
      <Grid2 alignItems="bottom">
        <ADSHomepageLatestEditsControl data={apiData.latestStreetAndPropertyEdits} />
      </Grid2>
    </Grid2>
  );
}

export default ADSHomepageControl;
