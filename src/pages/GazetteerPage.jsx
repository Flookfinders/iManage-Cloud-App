import React, { useContext } from "react";
import MapContext from "../context/mapContext";
import { Grid } from "@mui/material";
import SearchDataForm from "../forms/SearchDataForm";
import ADSEsriMap from "../components/ADSEsriMap";

function GazetteerPage() {
  const mapContext = useContext(MapContext);

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
