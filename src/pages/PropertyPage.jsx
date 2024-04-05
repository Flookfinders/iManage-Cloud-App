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
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

/* #region imports */

import React, { useContext, useState, useRef, useEffect } from "react";
import PropertyContext from "../context/propertyContext";
import SandboxContext from "../context/sandboxContext";
import UserContext from "./../context/userContext";
import MapContext from "../context/mapContext";
import SettingsContext from "../context/settingsContext";

import { GetPropertyFromUPRNUrl } from "../configuration/ADSConfig";
import { GetNewProperty } from "../utils/PropertyUtils";

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

  const [apiUrl, setApiUrl] = useState(null);
  const [data, setData] = useState();
  const dataUprn = useRef(-1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function SetUpPropertyData() {
      if (
        !propertyContext.currentProperty.newProperty &&
        propertyContext.currentProperty.uprn &&
        propertyContext.currentProperty.uprn > 0
      ) {
        if (apiUrl) {
          if (propertyContext.currentProperty.uprn.toString() !== dataUprn.current.toString()) {
            dataUprn.current = propertyContext.currentProperty.uprn;
            setLoading(true);
            fetch(`${apiUrl.url}/${propertyContext.currentProperty.uprn}`, {
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
                    propertyContext.onPropertyErrors(
                      [
                        {
                          field: "UPRN",
                          errors: ["Authorization details are not valid or have expired."],
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
        if (propertyContext.currentProperty.newProperty && dataUprn.current.toString() !== "0") {
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
            sandboxContext.onUpdateAndClear("sourceProperty", newProperty, "allProperty");
          }
          dataUprn.current = 0;
          setLoading(false);
        }
      }
    }

    if (!apiUrl) {
      const propertyUrl = GetPropertyFromUPRNUrl(userContext.currentUser.token);
      setApiUrl(propertyUrl);
    }

    SetUpPropertyData();

    return () => {};
  }, [propertyContext, sandboxContext, userContext, settingsContext, apiUrl]);

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
