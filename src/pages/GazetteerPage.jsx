//#region header */
/**************************************************************************************************
//
//  Description: Gazetteer Page
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   20.07.21 Sean Flook                 Initial Revision.
//    002   18.04.24 Sean Flook       IMANN-351 Changes required to reload the contexts after a refresh.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
//#endregion header */

import React, { useContext, useState, useEffect } from "react";

import MapContext from "../context/mapContext";
import LookupContext from "../context/lookupContext";
import SandboxContext from "../context/sandboxContext";
import SearchContext from "./../context/searchContext";
import SettingsContext from "../context/settingsContext";
import FilterContext from "../context/filterContext";
import StreetContext from "../context/streetContext";
import PropertyContext from "../context/propertyContext";
import InformationContext from "../context/informationContext";

import { Grid } from "@mui/material";
import SearchDataForm from "../forms/SearchDataForm";
import ADSEsriMap from "../components/ADSEsriMap";

function GazetteerPage() {
  const mapContext = useContext(MapContext);
  const lookupContext = useContext(LookupContext);
  const sandboxContext = useContext(SandboxContext);
  const searchContext = useContext(SearchContext);
  const settingsContext = useContext(SettingsContext);
  const filterContext = useContext(FilterContext);
  const streetContext = useContext(StreetContext);
  const propertyContext = useContext(PropertyContext);
  const informationContext = useContext(InformationContext);

  const [reloadContexts, setReloadContexts] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("GazetteerPage_firstLoadDone") === null) {
      sessionStorage.setItem("GazetteerPage_firstLoadDone", 1);
    } else {
      setReloadContexts(true);
    }
  }, []);

  useEffect(() => {
    if (reloadContexts) {
      setReloadContexts(false);
      lookupContext.onReload();
      sandboxContext.onReload();
      searchContext.onReload();
      settingsContext.onReload();
      mapContext.onReload();
      filterContext.onReload();
      streetContext.onReload();
      propertyContext.onReload();
      informationContext.onReload();
    }
  }, [
    reloadContexts,
    lookupContext,
    sandboxContext,
    searchContext,
    settingsContext,
    mapContext,
    filterContext,
    streetContext,
    propertyContext,
    informationContext,
  ]);

  return (
    <div>
      <Grid container justifyContent="flex-start" spacing={0}>
        <Grid item xs={12}>
          <Grid container spacing={0} justifyContent="flex-start">
            <Grid item xs={12} sm={4}>
              <SearchDataForm />
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
  );
}

export default GazetteerPage;
