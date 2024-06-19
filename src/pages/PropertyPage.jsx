//#region header */
/**************************************************************************************************
//
//  Description: Property Page
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   20.07.21 Sean Flook         WI39??? Initial Revision.
//    002   07.09.23 Sean Flook                 Cleaned the code.
//    003   02.01.24 Sean Flook                 Changed console.log to console.error for error messages.
//    004   04.04.24 Sean Flook                 Added better handling of API return status.
//    005   05.04.24 Sean Flook                 Correctly handle errors when getting a property.
//    006   05.04.24 Sean Flook       IMANN-351 Changes to handle browser navigation.
//    007   11.04.24 Sean Flook       IMANN-351 Prevent infinite loops when creating a new record.
//    008   18.04.24 Sean Flook       IMANN-351 Changes required to reload the contexts after a refresh.
//    009   18.04.24 Sean Flook       IMANN-351 Corrected typo.
//    010   19.06.24 Sean Flook       IMANN-629 Changes to code so that current user is remembered and a 401 error displays the login dialog.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

/* #region imports */

import React, { useContext, useState, useRef, useEffect } from "react";
import { useLocation } from "react-router";

import PropertyContext from "../context/propertyContext";
import SandboxContext from "../context/sandboxContext";
import UserContext from "./../context/userContext";
import MapContext from "../context/mapContext";
import SettingsContext from "../context/settingsContext";
import StreetContext from "../context/streetContext";
import LookupContext from "../context/lookupContext";
import SearchContext from "../context/searchContext";
import InformationContext from "../context/informationContext";

import { GetPropertyFromUPRNUrl } from "../configuration/ADSConfig";
import { GetNewProperty } from "../utils/PropertyUtils";
import { PropertyRoute } from "../PageRouting";

import { Grid } from "@mui/material";
import PropertyDataForm from "../forms/PropertyDataForm";
import ADSEsriMap from "../components/ADSEsriMap";
import { EditConfirmationServiceProvider } from "./EditConfirmationPage";

/* #endregion imports */

function PropertyPage() {
  const propertyContext = useContext(PropertyContext);
  const sandboxContext = useContext(SandboxContext);
  const userContext = useContext(UserContext);
  const mapContext = useContext(MapContext);
  const settingsContext = useContext(SettingsContext);
  const streetContext = useContext(StreetContext);
  const lookupContext = useContext(LookupContext);
  const searchContext = useContext(SearchContext);
  const informationContext = useContext(InformationContext);

  const location = useLocation();

  const [apiUrl, setApiUrl] = useState(null);
  const [data, setData] = useState();
  const dataUprn = useRef(-1);
  const [loading, setLoading] = useState(false);
  const [reloadContexts, setReloadContexts] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("PropertyPage_firstLoadDone") === null) {
      sessionStorage.setItem("PropertyPage_firstLoadDone", 1);
    } else {
      setReloadContexts(true);
    }
  }, []);

  useEffect(() => {
    if (reloadContexts) {
      setReloadContexts(false);
      propertyContext.onReload();
      sandboxContext.onReload();
      mapContext.onReload();
      settingsContext.onReload();
      streetContext.onReload();
      lookupContext.onReload();
      searchContext.onReload();
      informationContext.onReload();
    }
  }, [
    reloadContexts,
    propertyContext,
    sandboxContext,
    mapContext,
    settingsContext,
    streetContext,
    lookupContext,
    searchContext,
    informationContext,
  ]);

  useEffect(() => {
    function SetUpPropertyData(urlUprn) {
      if (urlUprn && urlUprn !== "0") {
        if (apiUrl) {
          if (urlUprn !== dataUprn.current) {
            dataUprn.current = urlUprn;
            setLoading(true);
            fetch(`${apiUrl.url}/${urlUprn}`, {
              headers: apiUrl.headers,
              crossDomain: true,
              method: apiUrl.type,
            })
              .then((res) => (res.ok ? res : Promise.reject(res)))
              .then((res) => {
                switch (res.status) {
                  case 200:
                    return res.json();

                  case 204:
                    propertyContext.onPropertyErrors(
                      [
                        {
                          field: "UPRN",
                          errors: ["This property no longer exists in the database."],
                        },
                      ],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      0
                    );
                    return null;

                  case 401:
                    userContext.onExpired();
                    return null;

                  case 403:
                    propertyContext.onPropertyErrors(
                      [
                        {
                          field: "UPRN",
                          errors: ["You do not have database access."],
                        },
                      ],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      0
                    );
                    return null;

                  case 500:
                    propertyContext.onPropertyErrors(
                      [
                        {
                          field: "UPRN",
                          errors: ["Unexpected server error, please report to support."],
                        },
                      ],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      0
                    );
                    console.error("[500 ERROR] GetPropertyMapData: Unexpected server error.", res);
                    return null;

                  default:
                    propertyContext.onPropertyErrors(
                      [
                        {
                          field: "UPRN",
                          errors: ["Unexpected error, please report to support."],
                        },
                      ],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      [],
                      0
                    );
                    console.error(`[${res.status} ERROR] GetPropertyMapData: Unexpected error.`, res);
                    return null;
                }
              })
              .then(
                (result) => {
                  setData(result);
                  if (
                    urlUprn &&
                    (!propertyContext.currentProperty || propertyContext.currentProperty.uprn.toString() !== urlUprn)
                  ) {
                    propertyContext.onUpdateCurrentProperty(
                      result.uprn,
                      result.lpis && result.lpis.length ? result.lpis[0].usrn : 0,
                      result.lpis && result.lpis.length
                        ? result.lpis.filter((x) => x.language === "ENG")[0].address
                        : "",
                      result.lpis && result.lpis.length
                        ? result.lpis.filter((x) => x.language === "ENG")[0].address
                        : "",
                      result.lpis && result.lpis.length
                        ? result.lpis.filter((x) => x.language === "ENG")[0].postcode
                        : "",
                      result.xcoordinate,
                      result.ycoordinate,
                      false
                    );
                  }
                  sandboxContext.onUpdateAndClear("sourceProperty", result, "allProperty");
                },
                (error) => {
                  console.error("[ERROR] Get Property data", error);
                }
              )
              .then(() => {
                setLoading(false);
              });
          }
        }
      } else {
        if (urlUprn && urlUprn === "0" && dataUprn.current !== "0") {
          setLoading(true);

          if (sandboxContext && sandboxContext.currentSandbox.sourceProperty) {
            setData(sandboxContext.currentSandbox.sourceProperty);
          } else {
            const newProperty = GetNewProperty(
              settingsContext.isWelsh,
              settingsContext.isScottish,
              settingsContext.authorityCode,
              propertyContext.currentProperty.usrn,
              propertyContext.currentProperty.parent,
              propertyContext.currentProperty.easting,
              propertyContext.currentProperty.northing
            );
            setData(newProperty);
            if (
              urlUprn &&
              (!propertyContext.currentProperty || propertyContext.currentProperty.uprn.toString() !== urlUprn)
            )
              propertyContext.onUpdateCurrentProperty(
                0,
                propertyContext.currentProperty.usrn,
                newProperty.lpis.filter((x) => x.language === "ENG")[0].address,
                newProperty.lpis.filter((x) => x.language === "ENG")[0].address,
                newProperty.lpis.filter((x) => x.language === "ENG")[0].postcode,
                newProperty.xcoordinate,
                newProperty.ycoordinate,
                true
              );
            sandboxContext.onUpdateAndClear("sourceProperty", newProperty, "allProperty");
          }
          dataUprn.current = "0";
          setLoading(false);
        }
      }
    }

    if (!apiUrl) {
      const propertyUrl = GetPropertyFromUPRNUrl(userContext.currentUser.token);
      setApiUrl(propertyUrl);
    }

    if (location.pathname.includes(PropertyRoute)) {
      const urlUprn = location.pathname.replace(`${PropertyRoute}/`, "");
      if (urlUprn !== dataUprn.current) SetUpPropertyData(urlUprn);
    }

    return () => {};
  }, [propertyContext, sandboxContext, userContext, settingsContext, apiUrl, location]);

  return (
    <EditConfirmationServiceProvider>
      <div>
        <Grid container justifyContent="flex-start" spacing={0}>
          <Grid item xs={12}>
            <Grid container spacing={0} justifyContent="flex-start">
              <Grid item xs={12} sm={4}>
                <PropertyDataForm data={data} loading={loading} />
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

export default PropertyPage;
