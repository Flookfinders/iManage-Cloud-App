//#region header */
/**************************************************************************************************
//
//  Description: Street Page
//
//  Copyright:    © 2021 - 2023 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   20.07.21 Sean Flook         WI39??? Initial Revision.
//    002   23.08.23 Sean Flook       IMANN-159 Use the street template defaults whe getting a new street.
//    003   07.09.23 Sean Flook                 Cleaned the code.
//    004   06.10.23 Sean Flook                 Added lookupContext so it can be passed through to GetNewStreet.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

/* #region imports */

import React, { useContext, useState, useRef, useEffect } from "react";
import StreetContext from "../context/streetContext";
import SandboxContext from "../context/sandboxContext";
import UserContext from "../context/userContext";
import MapContext from "../context/mapContext";
import SettingsContext from "../context/settingsContext";
import LookupContext from "../context/lookupContext";
import { GetStreetByUSRNUrl } from "../configuration/ADSConfig";
import { GetNewStreet } from "../utils/StreetUtils";
import { Grid } from "@mui/material";
import { EditConfirmationServiceProvider } from "./EditConfirmationPage";
import StreetDataForm from "../forms/StreetDataForm";
import ADSEsriMap from "../components/ADSEsriMap";

/* #endregion imports */

function StreetPage() {
  const streetContext = useContext(StreetContext);
  const sandboxContext = useContext(SandboxContext);
  const userContext = useContext(UserContext);
  const mapContext = useContext(MapContext);
  const settingsContext = useContext(SettingsContext);
  const lookupContext = useContext(LookupContext);

  const [apiUrl, setApiUrl] = useState(null);
  const [data, setData] = useState();
  const dataUsrn = useRef(-1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function SetUpStreetData() {
      if (
        !streetContext.currentStreet.newStreet &&
        streetContext.currentStreet.usrn &&
        streetContext.currentStreet.usrn > 0
      ) {
        if (apiUrl) {
          if (streetContext.currentStreet.usrn.toString() !== dataUsrn.current.toString()) {
            dataUsrn.current = streetContext.currentStreet.usrn;
            setLoading(true);
            // console.log(
            //   "fetching Street data",
            //   dataUsrn.current,
            //   `${apiUrl.url}/${streetContext.currentStreet.usrn}`
            // );
            fetch(`${apiUrl.url}/${streetContext.currentStreet.usrn}`, {
              headers: apiUrl.headers,
              crossDomain: true,
              method: apiUrl.type,
            })
              .then((res) => (res.ok ? res : Promise.reject(res)))
              .then((res) => res.json())
              .then(
                (result) => {
                  setData(result);
                  sandboxContext.onUpdateAndClear("sourceStreet", result, "allStreet");
                },
                (error) => {
                  console.log("ERROR Get Street data", error);
                }
              )
              .then(() => {
                setLoading(false);
              });
          }
        }
      } else {
        if (streetContext.currentStreet.newStreet && dataUsrn.current.toString() !== "0") {
          setLoading(true);
          const newStreet = GetNewStreet(
            settingsContext.isScottish,
            settingsContext.isWelsh,
            settingsContext.authorityCode,
            settingsContext.streetTemplate &&
              settingsContext.streetTemplate.streetTemplate &&
              settingsContext.streetTemplate.streetTemplate.recordType
              ? settingsContext.streetTemplate.streetTemplate.recordType
              : null,
            !settingsContext.isScottish &&
              settingsContext.streetTemplate &&
              settingsContext.streetTemplate.streetTemplate &&
              settingsContext.streetTemplate.streetTemplate.state
              ? settingsContext.streetTemplate.streetTemplate.state
              : null,
            settingsContext.streetTemplate &&
              settingsContext.streetTemplate.streetTemplate &&
              settingsContext.streetTemplate.streetTemplate.localityRef
              ? settingsContext.streetTemplate.streetTemplate.localityRef
              : null,
            settingsContext.streetTemplate &&
              settingsContext.streetTemplate.streetTemplate &&
              settingsContext.streetTemplate.streetTemplate.townRef
              ? settingsContext.streetTemplate.streetTemplate.townRef
              : null,
            settingsContext.isScottish &&
              settingsContext.streetTemplate &&
              settingsContext.streetTemplate.streetTemplate &&
              settingsContext.streetTemplate.streetTemplate.islandRef
              ? settingsContext.streetTemplate.streetTemplate.islandRef
              : null,
            settingsContext.streetTemplate &&
              settingsContext.streetTemplate.streetTemplate &&
              settingsContext.streetTemplate.streetTemplate.adminAreaRef
              ? settingsContext.streetTemplate.streetTemplate.adminAreaRef
              : null,
            !settingsContext.isScottish &&
              settingsContext.streetTemplate &&
              settingsContext.streetTemplate.streetTemplate &&
              settingsContext.streetTemplate.streetTemplate.classification
              ? settingsContext.streetTemplate.streetTemplate.classification
              : null,
            !settingsContext.isScottish &&
              settingsContext.streetTemplate &&
              settingsContext.streetTemplate.streetTemplate &&
              settingsContext.streetTemplate.streetTemplate.streetSurface
              ? settingsContext.streetTemplate.streetTemplate.streetSurface
              : null,
            lookupContext
          );
          setData(newStreet);
          sandboxContext.onUpdateAndClear("sourceStreet", newStreet, "allStreet");
          dataUsrn.current = 0;
          setLoading(false);
        }
      }
    }

    if (!apiUrl) {
      const streetUrl = GetStreetByUSRNUrl(userContext.currentUser.token, settingsContext.isScottish);
      setApiUrl(streetUrl);
    }

    SetUpStreetData();

    return () => {};
  }, [streetContext, sandboxContext, userContext, settingsContext, lookupContext, apiUrl]);

  return (
    <EditConfirmationServiceProvider>
      <div>
        <Grid container justifyContent="flex-start" spacing={0}>
          <Grid item xs={12}>
            <Grid container spacing={0} justifyContent="flex-start">
              <Grid item xs={12} sm={4}>
                <StreetDataForm data={data} loading={loading} />
              </Grid>
              <Grid item xs={12} sm={8}>
                <ADSEsriMap
                  startExtent={
                    mapContext.currentExtent
                      ? {
                          xmin: mapContext.currentExtent.xmin,
                          ymin: mapContext.currentExtent.ymin,
                          xmax: mapContext.currentExtent.xmax,
                          ymax: mapContext.currentExtent.ymax,
                          spatialReference: mapContext.currentExtent.spatialReference,
                        }
                      : null
                  }
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    </EditConfirmationServiceProvider>
  );
}

export default StreetPage;
