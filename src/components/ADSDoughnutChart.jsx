/* #region header */
/**************************************************************************************************
//
//  Description: Doughnut Chart component
//
//  Copyright:    © 2021 - 2025 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier             Issue# Description
//#region Version 1.0.0.0 changes
//    001   05.05.21 Sean Flook          WI39345 Initial Revision.
//    002   10.05.21 Sean Flook          WI39345 Corrected icons.
//    003   14.05.21 Sean Flook          WI39345 Display the total count in the center of chart.
//    004   16.05.21 Sean Flook          WI39345 Use the tooltip to display the legend.
//    005   25.05.21 Sean Flook          WI39345 Changes required to center the chart title.
//    006   02.07.21 Sean Flook          WI39345 Set font for center text.
//    007   26.05.23 Joel Benford        WI40689 Changes XDM -> iManage Cloud
//    008   24.11.23 Sean Flook                  Moved Stack to @mui/system.
//    009   12.12.23 Sean Flook                  Changes required for React 18. Set the colours according to the street state colour and BLPU logical status colour.
//    010   04.01.24 Sean Flook                  Fix colours for street type and correctly set the hover colour in the tooltip.
//    011   10.01.24 Sean Flook                  Removed street state as no longer required.
//    012   05.02.24 Sean Flook                  Ignore case when looking at labels when getting the required colours.
//#endregion Version 1.0.0.0 changes
//#region Version 1.0.5.0 changes
//    013   27.01.25 Sean Flook       IMANN-1077 Upgraded MUI to v6.
//#endregion Version 1.0.5.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */
import React, { useRef, useEffect } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { Grid2, Typography } from "@mui/material";
import { Stack, Box } from "@mui/system";
import { Chart, ArcElement, DoughnutController, Legend, Tooltip } from "chart.js";
import { toFont, getHoverColor } from "chart.js/helpers";
import { StreetIcon } from "../utils/ADSIcons";
import HomeIcon from "@mui/icons-material/Home";
import MiscellaneousIcon from "@mui/icons-material/MoreHoriz";
import StreetType from "../data/StreetType";
import BLPULogicalStatus from "../data/BLPULogicalStatus";
import { dashboardIconStyle } from "../utils/ADSStyles";
import { adsPaleBlueA } from "../utils/ADSColours";
/* #endregion imports */

Chart.register(ArcElement, DoughnutController, Legend, Tooltip, {
  id: "centerText",
  beforeDraw: function (chart) {
    if (chart.config.options.plugins.centerText.center) {
      // Get ctx from string
      const ctx = chart.ctx;

      // Get options from the center object in options
      const centerConfig = chart.config.options.plugins.centerText.center;
      const fontStyle = centerConfig.fontStyle || "Nunito Sans";
      const txt = centerConfig.text;
      const color = centerConfig.color || "#000";
      const maxFontSize = centerConfig.maxFontSize || 75;
      const sidePadding = centerConfig.sidePadding || 20;
      const sidePaddingCalculated = (sidePadding / 100) * (chart.innerRadius * 2);
      // Start with a base font of 20px
      ctx.font = "20px " + fontStyle;

      // Get the width of the string and also the width of the element minus 10 to give it 5px side padding
      const stringWidth = ctx.measureText(txt).width;
      const elementWidth = chart.innerRadius * 2 - sidePaddingCalculated;

      // Find out how much the font can grow in width.
      const widthRatio = elementWidth / stringWidth;
      const newFontSize = Math.floor(30 * widthRatio);
      const elementHeight = chart.innerRadius * 2;

      // Pick a new font size so it will not be larger than the height of label.
      let fontSizeToUse = Math.min(newFontSize, elementHeight, maxFontSize);
      let minFontSize = centerConfig.minFontSize;
      const lineHeight = centerConfig.lineHeight || 25;
      let wrapText = false;

      if (minFontSize === undefined) {
        minFontSize = 20;
      }

      if (minFontSize && fontSizeToUse < minFontSize) {
        fontSizeToUse = minFontSize;
        wrapText = true;
      }

      // Set font settings to draw it correctly.
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      let centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
      let centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
      ctx.font = fontSizeToUse + "px " + fontStyle;
      ctx.fillStyle = color;

      if (!wrapText) {
        ctx.fillText(txt, centerX, centerY);
        return;
      }

      const words = txt.split(" ");
      let line = "";
      const lines = [];

      // Break words up into multiple lines if necessary
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > elementWidth && n > 0) {
          lines.push(line);
          line = words[n] + " ";
        } else {
          line = testLine;
        }
      }

      // Move the center up depending on line height and number of lines
      centerY -= (lines.length / 2) * lineHeight;

      for (let n = 0; n < lines.length; n++) {
        ctx.fillText(lines[n], centerX, centerY);
        centerY += lineHeight;
      }
      //Draw text in center
      ctx.fillText(line, centerX, centerY);
    }
  },
});

ADSDoughnutChart.propTypes = {
  chartData: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

function ADSDoughnutChart({ chartData, title, label, value }) {
  const chartRef = useRef(null);
  const chartTitle = useRef(title);
  const labels = useRef(_.map(chartData, label));
  const data = useRef(_.map(chartData, value));
  const total = useRef(data.current.reduce((a, b) => a + b, 0));

  const getTypeIcon = () => {
    if (title.substring(0, 6).toUpperCase() === "STREET") return <StreetIcon sx={dashboardIconStyle} />;
    else if (title.substring(0, 7).toUpperCase() === "PROPERT") return <HomeIcon sx={dashboardIconStyle} />;
    else return <MiscellaneousIcon sx={dashboardIconStyle} />;
  };

  useEffect(() => {
    const defaultColours = [
      "#2a6ebb",
      "#dd4c65",
      "#62a1cd",
      "#bfede1",
      "#ffd3bf",
      "#93003a",
      "#4887c4",
      "#7dbbd5",
      "#f4777f",
      "#be214d",
      "#9ad5db",
      "#ffa59e",
    ];

    const getBackgroundColours = () => {
      if (chartTitle.current.substring(0, 6).toUpperCase() === "STREET") {
        const streetBackgroundColours = [];
        labels.current.forEach((item) => {
          const typeRec = StreetType.find(
            (x) =>
              (x.gpText && x.gpText.toLowerCase() === item.toLowerCase()) ||
              (x.osText && x.osText.toLowerCase() === item.toLowerCase())
          );
          if (typeRec) streetBackgroundColours.push(typeRec.chartColour);
        });
        if (streetBackgroundColours.length > 0) return streetBackgroundColours;
        else return defaultColours;
      } else if (chartTitle.current.substring(0, 7).toUpperCase() === "PROPERT") {
        const propertyBackgroundColors = [];
        labels.current.forEach((item) => {
          const logicalStatusRec = BLPULogicalStatus.find(
            (x) =>
              (x.gpText && x.gpText.toLowerCase() === item.toLowerCase()) ||
              (x.osText && x.osText.toLowerCase() === item.toLowerCase())
          );
          if (logicalStatusRec) propertyBackgroundColors.push(logicalStatusRec.colour);
        });
        if (propertyBackgroundColors.length > 0) return propertyBackgroundColors;
        else return defaultColours;
      } else return defaultColours;
    };

    const getBorderColours = () => {
      if (chartTitle.current.substring(0, 6).toUpperCase() === "STREET") {
        const streetBorderColours = [];
        labels.current.forEach((item) => {
          const typeRec = StreetType.find(
            (x) =>
              (x.gpText && x.gpText.toLowerCase() === item.toLowerCase()) ||
              (x.osText && x.osText.toLowerCase() === item.toLowerCase())
          );
          if (typeRec) streetBorderColours.push(typeRec.chartColour);
        });
        if (streetBorderColours.length > 0) return streetBorderColours;
        else return defaultColours;
      } else if (chartTitle.current.substring(0, 7).toUpperCase() === "PROPERT") {
        const propertyBorderColors = [];
        labels.current.forEach((item) => {
          const logicalStatusRec = BLPULogicalStatus.find(
            (x) =>
              (x.gpText && x.gpText.toLowerCase() === item.toLowerCase()) ||
              (x.osText && x.osText.toLowerCase() === item.toLowerCase())
          );
          if (logicalStatusRec) {
            propertyBorderColors.push(logicalStatusRec.colour);
          }
        });
        if (propertyBorderColors.length > 0) return propertyBorderColors;
        else return defaultColours;
      } else return defaultColours;
    };

    let maxLabelLength = 0;

    labels.current.forEach((item) => {
      if (item.length > maxLabelLength) maxLabelLength = item.length;
    });

    const state = {
      labels:
        labels.current.length === data.current.length ? labels.current : new Array(data.current.length).fill("Data"),
      datasets: [
        {
          label: chartTitle.current,
          backgroundColor: getBackgroundColours(),
          borderColor: getBorderColours(),
          borderWidth: 1,
          data: data.current,
        },
      ],
    };

    let doughnutChart = new Chart(
      document.getElementById(`${chartTitle.current.toLowerCase().replaceAll(" ", "-")}-chart`),
      {
        type: "doughnut",
        data: state,
        options: {
          responsive: true,
          cutout: "50%",
          plugins: {
            tooltip: {
              // Disable the on-canvas tooltip
              enabled: false,

              external: function (context) {
                // Tooltip Element
                let tooltipEl = document.getElementById("chartjs-tooltip");

                // Create element on first render
                if (!tooltipEl) {
                  tooltipEl = document.createElement("div");
                  tooltipEl.id = "chartjs-tooltip";
                  tooltipEl.style.backgroundColor = "#ff0000";
                  tooltipEl.innerHTML = "<table></table>";
                  document.body.appendChild(tooltipEl);
                }

                // Hide if no tooltip
                const tooltipModel = context.tooltip;
                if (tooltipModel.opacity === 0) {
                  tooltipEl.style.opacity = 0;
                  return;
                }

                // Set caret Position
                tooltipEl.classList.remove("above", "below", "no-transform");
                if (tooltipModel.yAlign) {
                  tooltipEl.classList.add(tooltipModel.yAlign);
                } else {
                  tooltipEl.classList.add("no-transform");
                }

                // Set Text
                if (tooltipModel.body) {
                  const dataPoints = tooltipModel.dataPoints[0];
                  const data = dataPoints.dataset.data || [];
                  const currentItem = dataPoints.dataIndex;
                  const legendItems = context.chart.legend.legendItems || [];
                  const selectedStyle = "font-weight: 700; background-color: " + adsPaleBlueA;
                  const descriptionStyle = `width: ${maxLabelLength}ch`;

                  let innerHtml = "<tbody>";

                  legendItems.forEach(function (legend, i) {
                    const style = `display: inline-block; width: 14px; height: 14px; background: ${
                      i === currentItem ? getHoverColor(legend.fillStyle) : legend.fillStyle
                    }; color: ${
                      i === currentItem ? getHoverColor(legend.fillStyle) : legend.fillStyle
                    }; border-style: solid; border-width: 1px; borderColor: ${
                      i === currentItem ? getHoverColor(legend.strokeStyle) : legend.strokeStyle
                    }`;

                    innerHtml += i === currentItem ? `<tr style="${selectedStyle}">` : "<tr>";
                    innerHtml += `<td style="${style}" /><td style="${descriptionStyle}">${
                      legend.text
                    }</td><td align="right">${data[i].toLocaleString()}</td></tr>`;
                    // innerHtml += `<td style="${style}" /><td style="${descriptionStyle}">${
                    //   legend.text
                    // }</td><td align="right">${data[i].toLocaleString()}</td><td>(${Math.round(
                    //   (100 * data[i]) / total.current
                    // )}%)</td></tr>`;
                  });
                  innerHtml += "</tbody>";

                  const tableRoot = tooltipEl.querySelector("table");
                  tableRoot.innerHTML = innerHtml;
                  tableRoot.style.padding = "2px";
                  tableRoot.style.borderStyle = "solid";
                  tableRoot.style.borderWidth = "1px";
                  tableRoot.style.borderColor = "#4242424D";
                  tableRoot.style.boxShadow = "4px 4px 8px #535353";
                }

                const position = context.chart.canvas.getBoundingClientRect();
                const bodyFont = toFont(tooltipModel.options.bodyFont);

                // Display, position, and set styles for font
                tooltipEl.style.opacity = 1;
                tooltipEl.style.position = "absolute";
                tooltipEl.style.left = position.left + window.scrollX + "px";
                tooltipEl.style.top = position.bottom + window.scrollY + "px";
                tooltipEl.style.font = bodyFont.string;
                tooltipEl.style.padding = tooltipModel.padding + "px " + tooltipModel.padding + "px";
                tooltipEl.style.pointerEvents = "none";
                tooltipEl.style.zIndex = 10;
              },
            },
            legend: {
              display: false,
            },
            centerText: {
              center: {
                text: `${total.current ? total.current.toLocaleString() : 0}`,
              },
            },
          },
        },
      }
    );

    return () => {
      if (doughnutChart) {
        // destroy the chart
        doughnutChart.destroy();
      }
    };
  }, []);

  return (
    <Grid2 sx={{ width: "13.3vw" }}>
      <Grid2 container direction="row" justifyContent="center" alignItems="center">
        <Grid2>
          <Stack direction="column" justifyContent="center" alignItems="center">
            {getTypeIcon()}
            <Typography align="center" variant="subtitle1" display="block">
              {title}
            </Typography>
          </Stack>
        </Grid2>
      </Grid2>
      <div>
        <canvas id={`${title.toLowerCase().replaceAll(" ", "-")}-chart`} ref={chartRef.current} />
        <Box
          id="chartjs-tooltip"
          sx={{ backgroundColor: "#FFFFFF", borderColor: "#000000", borderWidth: "2px", mt: "4px" }}
        >
          <table></table>
        </Box>
      </div>
    </Grid2>
  );
}

export default ADSDoughnutChart;
