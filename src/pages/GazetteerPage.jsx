//#region header */
//--------------------------------------------------------------------------------------------------
//
//  Description: Gazetteer Page
//
//  Copyright:    © 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//#region Version 1.0.0.0
//    001   20.07.21 Sean Flook                  Initial Revision.
//    002   18.04.24 Sean Flook        IMANN-351 Changes required to reload the contexts after a refresh.
//#endregion Version 1.0.0.0
//#region Version 1.0.5.0
//    003   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//#endregion Version 1.0.5.0
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

import { Grid2 } from "@mui/material";
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
      <Grid2 container justifyContent="flex-start" spacing={0}>
        <Grid2 size={12}>
          <Grid2 container spacing={0} justifyContent="flex-start">
            <Grid2 size={4}>
              <SearchDataForm />
            </Grid2>
            <Grid2 size={8}>
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
            </Grid2>
          </Grid2>
        </Grid2>
      </Grid2>
    </div>
  );
}

export default GazetteerPage;
