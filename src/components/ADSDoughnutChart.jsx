/* #region header */
/**************************************************************************************************
//
//  Description: Doughnut Chart component
//
//  Copyright:    © 2021 - 2023 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001   05.05.21 Sean Flook         WI39345 Initial Revision.
//    002   10.05.21 Sean Flook         WI39345 Corrected icons.
//    003   14.05.21 Sean Flook         WI39345 Display the total count in the center of chart.
//    004   16.05.21 Sean Flook         WI39345 Use the tooltip to display the legend.
//    005   25.05.21 Sean Flook         WI39345 Changes required to center the chart title.
//    006   02.07.21 Sean Flook         WI39345 Set font for center text.
//    007   26.05.23 Joel Benford       WI40689 Changes XDM -> iManage Cloud
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */
import React, { Component } from "react";
import _ from "lodash";
import { Grid, Typography, Stack } from "@mui/material";
import { Chart, ArcElement, DoughnutController, Legend, Tooltip } from "chart.js";
import { toFont } from "chart.js/helpers";
import { StreetIcon } from "../utils/ADSIcons";
import HomeIcon from "@mui/icons-material/Home";
import MiscellaneousIcon from "@mui/icons-material/MoreHoriz";
import classes from "./ADSDoughnutChart.module.css";
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

class ADSDoughnutChart extends Component {
  chartRef = React.createRef();
  labels = _.map(this.props.chartData, this.props.label);
  data = _.map(this.props.chartData, this.props.value);
  total = this.data.reduce((a, b) => a + b, 0);

  getTypeIcon = () => {
    if (this.props.title.substring(0, 6).toUpperCase() === "STREET") return <StreetIcon className="dashboardIcon" />;
    else if (this.props.title.substring(0, 7).toUpperCase() === "PROPERT")
      return <HomeIcon className="dashboardIcon" />;
    else return <MiscellaneousIcon className="dashboardIcon" />;
  };

  componentDidMount() {
    const myChartRef = this.chartRef.current.getContext("2d");
    const state = {
      labels: this.labels.length === this.data.length ? this.labels : new Array(this.data.length).fill("Data"),
      datasets: [
        {
          label: this.props.title,
          backgroundColor: [
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
          ],
          data: this.data,
        },
      ],
    };

    new Chart(myChartRef, {
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
              // console.log("DEBUG Custom Tooltip", context);
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
              // console.log("DEBUG Custom tooltipModel", context.tooltip);
              if (tooltipModel.opacity === 0) {
                tooltipEl.style.opacity = 0;
                return;
              }

              // console.log(
              //   "DEBUG Custom Tooltip Font",
              //   toFont(tooltipModel.options.bodyFont)
              // );

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
                const titleLines = tooltipModel.title || [];

                let innerHtml = "<thead>";

                titleLines.forEach(function (title) {
                  innerHtml += "<tr><th>" + title + "</th></tr>";
                });
                innerHtml += "</thead><tbody>";

                legendItems.forEach(function (legend, i) {
                  let style = "background:" + legend.fillStyle;
                  style += "; color:" + legend.fillStyle;
                  const span = `<span style="${style}">SO</span>`;
                  if (i === currentItem) {
                    innerHtml += `<tr><td><strong>${span}  ${legend.text}: ${data[i]}</strong></td></tr>`;
                  } else {
                    innerHtml += `<tr><td>${span}  ${legend.text}: ${data[i]}</td></tr>`;
                  }
                });
                innerHtml += "</tbody>";

                const tableRoot = tooltipEl.querySelector("table");
                tableRoot.innerHTML = innerHtml;
              }

              const position = context.chart.canvas.getBoundingClientRect();
              // console.log("DEBUG Custom position", position);
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
              text: `${this.total ? this.total.toLocaleString() : 0}`,
            },
          },
        },
      },
    });
  }

  render() {
    return (
      <Grid item className={classes.graphContainer}>
        <Grid container direction="row" justifyContent="center" alignItems="center">
          {/* <Grid item>{this.getTypeIcon()}</Grid> */}
          <Grid item>
            <Stack direction="column" justifyContent="center" alignItems="center">
              {this.getTypeIcon()}
              <Typography align="center" variant="subtitle1" display="block">
                {this.props.title}
              </Typography>
            </Stack>
          </Grid>
        </Grid>
        <div>
          <canvas id={`${this.props.title.toLowerCase().replaceAll(" ", "-")}-chart`} ref={this.chartRef} />
          <div id="chartjs-tooltip" className={classes.tooltipContainer}>
            <table></table>
          </div>
        </div>
      </Grid>
    );
  }
}

export default ADSDoughnutChart;
