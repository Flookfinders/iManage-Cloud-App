/* #region header */
/**************************************************************************************************
//
//  Description: ESU Data tab
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.0.0 changes
//    001            Sean Flook                 Initial Revision.
//    002   07.09.23 Sean Flook                 Added GetESUMapSymbol.
//    003   20.09.23 Sean Flook                 Tweaks to GetESUMapSymbol.
//    004   03.11.23 Sean Flook       IMANN-175 Modified GetBackgroundPropertyMapSymbol for selecting properties.
//    005   20.11.23 Sean Flook                 Added icon for street BLPUs and display the nodes on a street.
//    006   09.02.24 Sean Flook                 Modified GetASDMapSymbol to handle different ASD types.
//    007   04.03.24 Sean Flook            COL3 Changed the colour and style for type 51/61 ASD records.
//    008   08.05.24 Sean Flook                 Bug fixes in GetExtentMapSymbol.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

import CIMSymbol from "@arcgis/core/symbols/CIMSymbol";

const pictureVectorMarker = {
  type: "CIMVectorMarker",
  enable: false,
  anchorPoint: {
    x: -1.7,
    y: 8,
  },
  anchorPointUnits: "Relative",
  size: 4,
  frame: {
    xmin: 0,
    ymin: 0,
    xmax: 39.7,
    ymax: 17,
  },
  markerGraphics: [
    {
      type: "CIMMarkerGraphic",
      geometry: {
        rings: [
          [
            [32.2, 0],
            [7.4, 0],
            [6, 0.2],
            [4.6, 0.6],
            [3.3, 1.4],
            [2.2, 2.5],
            [1.2, 3.8],
            [0.6, 5.2],
            [0.1, 6.8],
            [0, 8.5],
            [0.1, 10.2],
            [0.6, 11.8],
            [1.2, 13.2],
            [2.2, 14.5],
            [3.3, 15.6],
            [4.6, 16.4],
            [6, 16.8],
            [7.4, 17],
            [32.2, 17],
            [33.7, 16.8],
            [35.1, 16.4],
            [36.4, 15.6],
            [37.5, 14.5],
            [38.4, 13.2],
            [39.1, 11.7],
            [39.6, 10.2],
            [39.7, 8.5],
            [39.6, 6.8],
            [39.1, 5.3],
            [38.4, 3.8],
            [37.5, 2.5],
            [36.4, 1.4],
            [35.1, 0.6],
            [33.7, 0.2],
            [32.2, 0],
          ],
        ],
      },
      symbol: {
        type: "CIMPolygonSymbol",
        symbolLayers: [
          {
            type: "CIMSolidFill",
            enable: true,
            color: [170, 170, 170, 255], // #AAAAAAFF
          },
        ],
      },
    },
  ],
  scaleSymbolsProportionally: true,
  respectFrame: true,
  offsetX: 0,
};

/**
 * Method to get the commercial icon.
 *
 * @param {number} logicalStatus The logical status.
 * @returns {object} The commercial icon.
 */
const commercialIcon = (logicalStatus) => {
  return {
    type: "CIMPictureMarker",
    enable: true,
    anchorPoint: {
      x: 0,
      y: 0,
    },
    anchorPointUnits: "Relative",
    dominantSizeAxis3D: "Y",
    size: 11,
    billboardMode3D: "FaceNearPlane",
    invertBackfaceTexture: true,
    scaleX: 1,
    textureFilter: "Picture",
    tintColor: getPinColour(logicalStatus),
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAa0lEQVQ4y9WTQQ6AIAwEm/g5+JMnn1q+oY4nFZNqqTFG50ZgAt0sIn+AgZU+drxFoQPYVjA+I5AoeBTSLigtqFRXN/GmoPbG+Qz5mJIp1Cnd6c/kP+lCcEYWEWGOCkQFDRTDCtaoXv7sj18AHXz8aKs+sEcAAAAASUVORK5CYII=",
    offsetY: 14,
  };
};

/**
 * Method to get the land icon.
 *
 * @param {number} logicalStatus The logical status.
 * @returns {object} The land icon.
 */
const landIcon = (logicalStatus) => {
  return {
    type: "CIMPictureMarker",
    enable: true,
    anchorPoint: {
      x: 0,
      y: 0,
    },
    anchorPointUnits: "Relative",
    dominantSizeAxis3D: "Y",
    size: 11,
    billboardMode3D: "FaceNearPlane",
    invertBackfaceTexture: true,
    scaleX: 1,
    textureFilter: "Picture",
    tintColor: getPinColour(logicalStatus),
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAbElEQVQ4y+2Tuw3AIAwFqRkFKUtkEY/GIozBKJSRLhURnzhxlJar/cRdgXOLXyDIl/NAoRCs554MQMbbBpFKNFgjtMir9TC4L+mtGyWtpLe+5lrJbM3GoZYQKIP1TgKlZHpeo5YMgU/E9WFsnJnzFKBbukSvAAAAAElFTkSuQmCC",
    offsetY: 14,
  };
};

/**
 * Method to get the military icon.
 *
 * @param {number} logicalStatus The logical status.
 * @returns {object} The military icon.
 */
const militaryIcon = (logicalStatus) => {
  return {
    type: "CIMPictureMarker",
    enable: true,
    anchorPoint: {
      x: 0,
      y: 0,
    },
    anchorPointUnits: "Relative",
    dominantSizeAxis3D: "Y",
    size: 11,
    billboardMode3D: "FaceNearPlane",
    invertBackfaceTexture: true,
    scaleX: 1,
    textureFilter: "Picture",
    tintColor: getPinColour(logicalStatus),
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAlElEQVQ4y2NgoDP4jwUQpQGdPaqBMg1fMDR8wa/B5f8dFA13/7sSimv2//X/v/2vAMLv/xv+cxCXQBT/7/m/978SKWlq/v9FpCgXATrnx38xYpS6/l/1f///J2APPwWyVv93I6Sl7v8/pLTdQIwtmXDl2cT5IAyuIZw4DZP+//zfDoQ//08mTkPvf3Uwrf6/l2EAAABQbAGF9mlKGwAAAABJRU5ErkJggg==",
    offsetY: 14,
  };
};

/**
 * Method to get the property shell icon.
 *
 * @param {number} logicalStatus The logical status.
 * @returns {object} The property shell icon.
 */
const propertyShellIcon = (logicalStatus) => {
  return {
    type: "CIMPictureMarker",
    enable: true,
    anchorPoint: {
      x: 0,
      y: 0,
    },
    anchorPointUnits: "Relative",
    dominantSizeAxis3D: "Y",
    size: 10,
    billboardMode3D: "FaceNearPlane",
    invertBackfaceTexture: true,
    scaleX: 1,
    textureFilter: "Picture",
    tintColor: getPinColour(logicalStatus),
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAASCAYAAABSO15qAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAHFJREFUOI3FkTEOgEAIBMHO+BEbv2Tpn2x9ko0fMbZjZS4RjjO5xJsSWLILIhmAHliBDRhycznxCOwkDmD6Kp6BE8sFLJHwsVzCRnIsl0iRAssl4ki/oQCmqKoiIl7vTVfroP2C9rhfMEPBV9ofsXrBDTrk8yWILXm9AAAAAElFTkSuQmCC",
    offsetY: 14,
  };
};

/**
 * Method to get the street BLPU icon.
 *
 * @param {number} logicalStatus The logical status.
 * @returns {object} The street BLPU icon.
 */
const streetBlpuIcon = (logicalStatus) => {
  return {
    type: "CIMPictureMarker",
    enable: true,
    anchorPoint: {
      x: 0,
      y: 0,
    },
    anchorPointUnits: "Relative",
    dominantSizeAxis3D: "Y",
    size: 9,
    billboardMode3D: "FaceNearPlane",
    invertBackfaceTexture: true,
    scaleX: 1,
    textureFilter: "Picture",
    tintColor: getPinColour(logicalStatus),
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAJlJREFUOI2lk8ERgCAMBINjIViJdGpp2En8gB6RJCj7lbvhdpBIwMwH+xwy94KZ80BR9kqiTMA3ScTsIrqSe2XlrCzaO7dsbmadxdCIH9tTz4/jqPGE05rNg9wZLNI367wzH/30PWl+Bok4LZFCKBjzEhb98VN5spYfOGN6CmWj+hPWWVjaYVvJeT9OQSUtNOensoeyMU4WnRefVpyPbel/dQAAAABJRU5ErkJggg==",
    offsetY: 13,
  };
};

/**
 * Method to get the residential icon.
 *
 * @param {number} logicalStatus The logical status.
 * @returns {object} The residential icon.
 */
const residentialIcon = (logicalStatus) => {
  return {
    type: "CIMPictureMarker",
    enable: true,
    anchorPoint: {
      x: 0,
      y: 0,
    },
    anchorPointUnits: "Relative",
    dominantSizeAxis3D: "Y",
    size: 11,
    billboardMode3D: "FaceNearPlane",
    invertBackfaceTexture: true,
    scaleX: 1,
    textureFilter: "Picture",
    tintColor: getPinColour(logicalStatus),
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAeElEQVQ4y+3PvQ2AIBBAYSnsqF2AEZyBJRiDORiDKZjBDVyAms7CPCsTQ/gxdiR+5eVdLjdNY0DgcIi3+YwHwDO/ySWBW0D28oWNp42llSt2cjuqlq9ESiJrKdckahI6zw0HLQfmmVtOek5sfqWh/PT3hfrkXxjWBUKWdIyVMUhIAAAAAElFTkSuQmCC",
    offsetY: 14,
  };
};

/**
 * Method to get the unclassified icon.
 *
 * @param {number} logicalStatus The logical status.
 * @returns {object} The unclassified icon.
 */
const unclassifiedIcon = (logicalStatus) => {
  return {
    type: "CIMVectorMarker",
    enable: true,
    size: 6,
    colorLocked: true,
    anchorPointUnits: "Relative",
    frame: {
      xmin: -5,
      ymin: -5,
      xmax: 5,
      ymax: 5,
    },
    markerGraphics: [
      {
        type: "CIMMarkerGraphic",
        geometry: {
          x: 0,
          y: 0,
        },
        symbol: {
          type: "CIMTextSymbol",
          fontFamilyName: "Arial",
          fontStyleName: "Bold",
          height: 18,
          horizontalAlignment: "Center",
          offsetX: 0,
          offsetY: 20,
          symbol: {
            type: "CIMPolygonSymbol",
            symbolLayers: [
              {
                type: "CIMSolidFill",
                enable: true,
                color: getPinColour(logicalStatus),
              },
            ],
          },
          verticalAlignment: "Center",
          font: {
            family: "Arial",
            decoration: "none",
            style: "normal",
            weight: "bold",
          },
        },
        textString: "?",
      },
    ],
    scaleSymbolsProportionally: true,
    respectFrame: true,
    offsetY: 1,
  };
};

/**
 * Method to get the dual use icon.
 *
 * @param {number} logicalStatus The logical status.
 * @returns {object} The dual use icon.
 */
const dualUseIcon = (logicalStatus) => {
  return {
    type: "CIMPictureMarker",
    enable: true,
    anchorPoint: {
      x: 0,
      y: 0,
    },
    anchorPointUnits: "Relative",
    dominantSizeAxis3D: "Y",
    size: 11,
    billboardMode3D: "FaceNearPlane",
    invertBackfaceTexture: true,
    scaleX: 1,
    textureFilter: "Picture",
    tintColor: getPinColour(logicalStatus),
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAARUlEQVQ4y+3RsQ0AIAgFUUajdP8RYJCzMWpiMCZaUHjVp3gVInmj4IwUnS6nrMAgBGArYAv4YAZtK9r3Y/D/EAMOugOZqvPeHCc77p8wAAAAAElFTkSuQmCC",
    offsetY: 14,
  };
};

/**
 * Method to get the object of interest icon.
 *
 * @param {number} logicalStatus The logical status.
 * @returns {object} The object of interest icon.
 */
const objectOfInterestIcon = (logicalStatus) => {
  return {
    type: "CIMPictureMarker",
    enable: true,
    anchorPoint: {
      x: 0,
      y: 0,
    },
    anchorPointUnits: "Relative",
    dominantSizeAxis3D: "Y",
    size: 11,
    billboardMode3D: "FaceNearPlane",
    invertBackfaceTexture: true,
    scaleX: 1,
    textureFilter: "Picture",
    tintColor: getPinColour(logicalStatus),
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAARElEQVQ4y2NgoAb47/B/PxA6EK8YBghpQlFMSBNWxbg04VWMTdN/IgH5GugDkC39Xw/m1GPKjGogUQM9Io2WiW9wpVYAifa5TqORAu0AAAAASUVORK5CYII=",
    offsetY: 14,
  };
};

/**
 * Method used to get the required symbols.
 *
 * @param {string} classification The classification.
 * @param {number} logicalStatus The logical status.
 * @returns {object} The required symbol.
 */
const getIcon = (classification, logicalStatus) => {
  switch (classification) {
    case "B":
      return streetBlpuIcon(logicalStatus);

    case "C":
      return commercialIcon(logicalStatus);

    case "L":
      return landIcon(logicalStatus);

    case "M":
      return militaryIcon(logicalStatus);

    case "P":
      return propertyShellIcon(logicalStatus);

    case "R":
      return residentialIcon(logicalStatus);

    case "U":
      return unclassifiedIcon(logicalStatus);

    case "X":
      return dualUseIcon(logicalStatus);

    case "Z":
      return objectOfInterestIcon(logicalStatus);

    default:
      return null;
  }
};

/**
 * Method to get the pin border colour.
 *
 * @param {number} logicalStatus The logical status.
 * @param {boolean} highlighted True if the pin is highlighted; otherwise false.
 * @returns {Array} Array of numbers making up the required colour.
 */
const getPinBorderColour = (logicalStatus, highlighted) => {
  if (highlighted) return [217, 0, 182, 255]; // #D900B5FF
  else {
    switch (logicalStatus) {
      case 1: // Approved
        return [42, 108, 46, 255]; // #2A6C2EFF

      case 3: // Alternative
        return [175, 86, 0, 255]; // #AF5600FF

      case 5: // Candidate
        return [221, 149, 218, 255]; // #DD95DAFF

      case 6: // Provisional
        return [0, 108, 148, 255]; // #006C94FF

      case 7: // Rejected (Internal)
      case 9: // Rejected (External)
        return [247, 133, 153, 255]; // #F78599FF

      case 8: // Historical
        return [175, 86, 0, 255]; // #AF5600FF

      default:
        return [0, 0, 0, 255]; // #000000FF
    }
  }
};

/**
 * Method to get the pin border style.
 *
 * @param {number} logicalStatus The logical status.
 * @returns {Array} The required border style.
 */
const getPinBorderStyle = (logicalStatus) => {
  switch (logicalStatus) {
    case 1: // Approved
      return [1]; // solid

    case 3: // Alternative
      return [1, 3]; // dot

    case 5: // Candidate
      return [1, 3, 3, 1, 3]; //  dash dot dot

    case 6: // Provisional
      return [4]; // dash

    case 7: // Rejected (Internal)
    case 9: // Rejected (External)
      return [3, 1, 3, 3, 1, 3, 1]; // dash dot dot dot

    case 8: // Historical
      return [3, 1, 3]; // dash dot

    default:
      return [1000];
  }
};

/**
 * Method to get the colour of the pin.
 *
 * @param {number} logicalStatus The logical status.
 * @returns {Array} The pin colour.
 */
function getPinColour(logicalStatus) {
  switch (logicalStatus) {
    case 1: // Approved
      return [42, 187, 46, 255]; // #2ABB2EFF

    case 3: // Alternative
      return [244, 137, 16, 255]; // #F48910FF

    case 5: // Candidate
      return [221, 149, 218, 255]; // #DD95DAFF

    case 6: // Provisional
      return [64, 164, 212, 255]; // #40A4D4FF

    case 7: // Rejected (Internal)
    case 9: // Rejected (External)
      return [247, 133, 153, 255]; // #F78599FF

    case 8: // Historical
      return [153, 97, 34, 255]; // #996122FF

    default:
      return [255, 255, 255, 0]; // #FFFFFF00
  }
}

/**
 * Method to get the require pin.
 *
 * @param {number} logicalStatus The logical status
 * @param {boolean} highlighted True if the pin is highlighted; otherwise false.
 * @returns {object} The required pin.
 */
const getPin = (logicalStatus, highlighted) => {
  return {
    type: "CIMVectorMarker",
    enable: true,
    anchorPointUnits: "Relative",
    dominantSizeAxis3D: "Z",
    size: 20,
    billboardMode3D: "FaceNearPlane",
    frame: {
      xmin: 0,
      ymin: 0,
      xmax: 24,
      ymax: 24,
    },
    markerGraphics: [
      {
        type: "CIMMarkerGraphic",
        geometry: {
          rings: [
            [
              [12, 23.99],
              [13.83, 23.82],
              [15.59, 23.29],
              [17.22, 22.44],
              [18.64, 21.29],
              [19.82, 19.9],
              [20.69, 18.3],
              [21.22, 16.58],
              [21.4, 14.78],
              [21.1, 13.01],
              [20.2, 10.85],
              [18.71, 8.3],
              [16.65, 5.43],
              [14.41, 2.68],
              [12, 0.01],
              [9.59, 2.68],
              [7.35, 5.43],
              [5.29, 8.3],
              [3.8, 10.85],
              [2.9, 13.01],
              [2.6, 14.78],
              [2.78, 16.58],
              [3.31, 18.3],
              [4.18, 19.9],
              [5.36, 21.29],
              [6.78, 22.44],
              [8.41, 23.29],
              [10.17, 23.82],
              [12, 23.99],
              [12, 23.99],
            ],
          ],
        },
        symbol: {
          type: "CIMPolygonSymbol",
          symbolLayers: [
            {
              type: "CIMSolidStroke",
              enable: true,
              capStyle: "Round",
              joinStyle: "Round",
              lineStyle3D: "Strip",
              miterLimit: 10,
              width: 2,
              color: getPinBorderColour(logicalStatus, highlighted),
              effects: [
                {
                  type: "CIMGeometricEffectDashes",
                  dashTemplate: getPinBorderStyle(logicalStatus),
                  lineDashEnding: "NoConstraint",
                  offsetAlongLine: 0,
                },
              ],
            },
            {
              type: "CIMSolidFill",
              enable: true,
              color: [255, 255, 255, 255], // #FFFFFFFF
            },
          ],
        },
      },
    ],
    scaleSymbolsProportionally: true,
    respectFrame: true,
    clippingPath: {
      type: "CIMClippingPath",
      clippingType: "Intersect",
      path: {
        rings: [
          [
            [0, 0],
            [24, 0],
            [24, 24],
            [0, 24],
            [0, 0],
          ],
        ],
      },
    },
    anchorPoint: {
      x: 0,
      y: -0.5,
    },
  };
};

/**
 * Method to get the background property map symbol.
 *
 * @param {number} logicalStatus The logical status.
 * @returns {object} The background property map symbol.
 */
export function GetBackgroundPropertyMapSymbol(logicalStatus) {
  return {
    type: "simple-marker",
    color: getPinColour(logicalStatus),
    size: 6,
    outline: {
      style: "none",
    },
  };
}

/**
 * Method to get the property map symbol.
 *
 * @param {number} logicalStatus The logical status.
 * @param {string} classification The classification code.
 * @param {boolean} [highlighted=false] True if the symbol is highlighted; otherwise false.
 * @returns {CIMSymbol} The required property symbol.
 */
export function GetPropertyMapSymbol(logicalStatus, classification, highlighted = false) {
  if (classification === "U") {
    return new CIMSymbol({
      data: {
        type: "CIMSymbolReference",
        symbol: {
          type: "CIMPointSymbol",
          symbolLayers: [getIcon(classification, logicalStatus), getPin(logicalStatus, highlighted)],
        },
      },
    });
  } else {
    return new CIMSymbol({
      data: {
        type: "CIMSymbolReference",
        symbol: {
          type: "CIMPointSymbol",
          symbolLayers: [
            pictureVectorMarker,
            getIcon(classification, logicalStatus),
            getPin(logicalStatus, highlighted),
          ],
        },
      },
    });
  }
}

/**
 * Method to get the extent map symbol.
 *
 * @param {string} provenance The provenance code
 * @returns {CIMSymbol} The required extent symbol.
 */
export function GetExtentMapSymbol(provenance) {
  function getPolygonColour(isBorder) {
    switch (provenance) {
      case "F": // Formal tenancy agreement.
        if (isBorder) return [0, 149, 186, 255]; // #0095BAFF
        else return [0, 149, 186, 102]; // #0095BA66

      case "L": // Unregistered land title.
        if (isBorder) return [194, 124, 48, 255]; // #C27C30FF
        else return [194, 124, 48, 102]; // #C27C3066

      case "O": // Occupancy.
        if (isBorder) return [217, 43, 48, 255]; // #D92B30FF
        else return [217, 43, 48, 102]; // #D92B3066

      case "P": // Inferred from physical features.
        if (isBorder) return [171, 82, 179, 255]; // #AB52B3FF
        else return [171, 82, 179, 102]; // #AB52B366

      case "R": // Rental agreement.
        if (isBorder) return [160, 209, 125, 255]; // #A0D17DFF
        else return [160, 209, 125, 127]; // #A0D17D80

      case "T": // Registered title.
        if (isBorder) return [60, 204, 180, 255]; // #3CCCB4FF
        else return [60, 204, 180, 127]; // #3CCCB480

      case "U": // Inferred from use.
        if (isBorder) return [255, 223, 60, 255]; // #FFDF3CFF
        else return [255, 223, 60, 127]; // #FFDF3C80

      default:
        return [255, 255, 255, 0]; // #FFFFFF00
    }
  }

  const getPolygonLineStyle = () => {
    switch (provenance) {
      case "F": // Formal tenancy agreement.
        return [0.5, 0.5];

      case "L": // Unregistered land title.
        return [3, 1];

      case "O": // Occupancy.
        return [1, 1];

      case "P": // Inferred from physical features.
        return [1];

      case "R": // Rental agreement.
        return [1, 2, 6, 2];

      case "T": // Registered title.
        return [5, 2];

      case "U": // Inferred from use.
        return [1];

      default:
        return [1];
    }
  };

  return new CIMSymbol({
    data: {
      type: "CIMSymbolReference",
      symbol: {
        type: "CIMPolygonSymbol",
        symbolLayers: [
          {
            type: "CIMSolidStroke",
            enable: true,
            capStyle: "Round",
            joinStyle: "Round",
            lineStyle3D: "Strip",
            miterLimit: 10,
            width: 2,
            color: getPolygonColour(true),
            colorLocked: true,
            effects: [
              {
                type: "CIMGeometricEffectDashes",
                dashTemplate: getPolygonLineStyle(),
                lineDashEnding: "NoConstraint",
                offsetAlongLine: 0,
              },
            ],
          },
          {
            type: "CIMSolidFill",
            enable: true,
            colorLocked: true,
            color: getPolygonColour(false),
          },
        ],
      },
    },
  });
}

/**
 * Method to get the street map symbol.
 *
 * @returns {CIMSymbol} The street symbol.
 */
export function GetStreetMapSymbol() {
  function getStreetSymbolLayer() {
    return {
      type: "CIMSolidStroke",
      enable: true,
      capStyle: "Round",
      joinStyle: "Round",
      lineStyle3D: "Strip",
      miterLimit: 10,
      width: 8,
      color: [201, 120, 213, 166], // #C978D5A6
      effects: [],
    };
  }

  function getBorderSymbolLayer(offset) {
    return {
      type: "CIMSolidStroke",
      effects: [
        {
          type: "CIMGeometricEffectOffset",
          method: "Bevelled",
          offset: offset,
          option: "Fast",
        },
      ],
      enable: true,
      colorLocked: true,
      capStyle: "Round",
      joinStyle: "Miter",
      lineStyle3D: "Strip",
      miterLimit: 10,
      width: 0.7,
      color: [153, 52, 164, 255], // #9934A4FF
    };
  }

  function getNodeSymbolLayer() {
    return {
      type: "CIMVectorMarker",
      enable: true,
      colorLocked: true,
      anchorPoint: {
        x: 0,
        y: 0,
      },
      anchorPointUnits: "Relative",
      dominantSizeAxis3D: "Y",
      size: 6,
      billboardMode3D: "FaceNearPlane",
      markerPlacement: {
        type: "CIMMarkerPlacementOnVertices",
        angleToLine: true,
        offset: 0,
        placeOnEndPoints: true,
        placeOnRegularVertices: true,
      },
      frame: {
        xmin: -5,
        ymin: -5,
        xmax: 5,
        ymax: 5,
      },
      markerGraphics: [
        {
          type: "CIMMarkerGraphic",
          geometry: {
            rings: [
              [
                [0, 5],
                [0.87, 4.92],
                [1.71, 4.7],
                [2.5, 4.33],
                [3.21, 3.83],
                [3.83, 3.21],
                [4.33, 2.5],
                [4.7, 1.71],
                [4.92, 0.87],
                [5, 0],
                [4.92, -0.87],
                [4.7, -1.71],
                [4.33, -2.5],
                [3.83, -3.21],
                [3.21, -3.83],
                [2.5, -4.33],
                [1.71, -4.7],
                [0.87, -4.92],
                [0, -5],
                [-0.87, -4.92],
                [-1.71, -4.7],
                [-2.5, -4.33],
                [-3.21, -3.83],
                [-3.83, -3.21],
                [-4.33, -2.5],
                [-4.7, -1.71],
                [-4.92, -0.87],
                [-5, 0],
                [-4.92, 0.87],
                [-4.7, 1.71],
                [-4.33, 2.5],
                [-3.83, 3.21],
                [-3.21, 3.83],
                [-2.5, 4.33],
                [-1.71, 4.7],
                [-0.87, 4.92],
                [0, 5],
                [0, 5],
              ],
            ],
          },
          symbol: {
            type: "CIMPolygonSymbol",
            symbolLayers: [
              {
                type: "CIMSolidFill",
                enable: true,
                color: [153, 52, 164, 255], // #9934A4FF
                // color: [0, 0, 0, 255],
              },
            ],
          },
        },
      ],
      scaleSymbolsProportionally: true,
      respectFrame: true,
    };
  }

  return new CIMSymbol({
    data: {
      type: "CIMSymbolReference",
      symbol: {
        type: "CIMLineSymbol",
        symbolLayers: [getNodeSymbolLayer(), getBorderSymbolLayer(4), getStreetSymbolLayer(), getBorderSymbolLayer(-4)],
      },
    },
  });
}

/**
 * Method to get the ESU map symbol.
 *
 * @returns {CIMSymbol} The required ASD symbol.
 */
export function GetESUMapSymbol() {
  return new CIMSymbol({
    data: {
      type: "CIMSymbolReference",
      symbol: {
        type: "CIMLineSymbol",
        symbolLayers: [
          {
            type: "CIMSolidStroke",
            enable: true,
            capStyle: "Round",
            joinStyle: "Round",
            lineStyle3D: "Strip",
            miterLimit: 10,
            width: 5,
            color: [196, 5, 28, 255], // #C4051CFF
            effects: [
              {
                type: "CIMGeometricEffectDashes",
                dashTemplate: [10, 10],
                lineDashEnding: "NoConstraint",
                offsetAlongLine: 0,
              },
            ],
          },
        ],
      },
    },
  });
}

/**
 * Method to get the ASD map symbol.
 *
 * @param {number} asdType The type of ASD symbol required.
 * @returns {CIMSymbol} The required ASD symbol.
 */
export function GetASDMapSymbol(asdType) {
  switch (asdType) {
    case 51:
    case 61:
      return new CIMSymbol({
        data: {
          type: "CIMSymbolReference",
          symbol: {
            type: "CIMLineSymbol",
            symbolLayers: [
              {
                type: "CIMVectorMarker",
                enable: true,
                colorLocked: true,
                anchorPoint: {
                  x: 0,
                  y: 0,
                },
                anchorPointUnits: "Relative",
                dominantSizeAxis3D: "Y",
                size: 4,
                billboardMode3D: "FaceNearPlane",
                markerPlacement: {
                  type: "CIMMarkerPlacementAlongLineSameSize",
                  placePerPart: true,
                  angleToLine: true,
                  controlPointPlacement: "NoConstraint",
                  endings: "Custom",
                  offsetAlongLine: 45,
                  placementTemplate: [10],
                },
                frame: {
                  xmin: -5,
                  ymin: -5,
                  xmax: 5,
                  ymax: 5,
                },
                markerGraphics: [
                  {
                    type: "CIMMarkerGraphic",
                    geometry: {
                      rings: [
                        [
                          [0, 5],
                          [0.87, 4.92],
                          [1.71, 4.7],
                          [2.5, 4.33],
                          [3.21, 3.83],
                          [3.83, 3.21],
                          [4.33, 2.5],
                          [4.7, 1.71],
                          [4.92, 0.87],
                          [5, 0],
                          [4.92, -0.87],
                          [4.7, -1.71],
                          [4.33, -2.5],
                          [3.83, -3.21],
                          [3.21, -3.83],
                          [2.5, -4.33],
                          [1.71, -4.7],
                          [0.87, -4.92],
                          [0, -5],
                          [-0.87, -4.92],
                          [-1.71, -4.7],
                          [-2.5, -4.33],
                          [-3.21, -3.83],
                          [-3.83, -3.21],
                          [-4.33, -2.5],
                          [-4.7, -1.71],
                          [-4.92, -0.87],
                          [-5, 0],
                          [-4.92, 0.87],
                          [-4.7, 1.71],
                          [-4.33, 2.5],
                          [-3.83, 3.21],
                          [-3.21, 3.83],
                          [-2.5, 4.33],
                          [-1.71, 4.7],
                          [-0.87, 4.92],
                          [0, 5],
                          [0, 5],
                        ],
                      ],
                    },
                    symbol: {
                      type: "CIMPolygonSymbol",
                      symbolLayers: [
                        {
                          type: "CIMSolidFill",
                          enable: true,
                          color: [255, 255, 255, 255],
                        },
                      ],
                    },
                  },
                ],
                scaleSymbolsProportionally: true,
                respectFrame: true,
              },
              {
                type: "CIMSolidStroke",
                enable: true,
                colorLocked: true,
                capStyle: "Butt",
                joinStyle: "Round",
                lineStyle3D: "Strip",
                miterLimit: 10,
                width: 5,
                color: [64, 164, 212, 255],
              },
            ],
          },
        },
      });

    case 52:
    case 62:
      return new CIMSymbol({
        data: {
          type: "CIMSymbolReference",
          symbol: {
            type: "CIMLineSymbol",
            symbolLayers: [
              {
                type: "CIMSolidStroke",
                effects: [
                  {
                    type: "CIMGeometricEffectDashes",
                    dashTemplate: [5, 2],
                    lineDashEnding: "NoConstraint",
                    controlPointEnding: "NoConstraint",
                  },
                  {
                    type: "CIMGeometricEffectOffset",
                    method: "Mitered",
                    offset: 0.15,
                    option: "Fast",
                  },
                  {
                    type: "CIMGeometricEffectRotate",
                    angle: 45,
                  },
                ],
                enable: true,
                capStyle: "Butt",
                joinStyle: "Round",
                lineStyle3D: "Strip",
                miterLimit: 10,
                width: 1.5,
                color: [255, 255, 255, 255], // #FFFFFF
              },
              {
                type: "CIMSolidStroke",
                enable: true,
                colorLocked: true,
                capStyle: "Butt",
                joinStyle: "Round",
                lineStyle3D: "Strip",
                miterLimit: 10,
                width: 5,
                color: [61, 50, 155, 255], // #3D329B
              },
            ],
          },
        },
      });

    case 53:
    case 63:
      return new CIMSymbol({
        data: {
          type: "CIMSymbolReference",
          symbol: {
            type: "CIMLineSymbol",
            symbolLayers: [
              {
                type: "CIMSolidStroke",
                effects: [
                  {
                    type: "CIMGeometricEffectDashes",
                    dashTemplate: [5, 5],
                    lineDashEnding: "NoConstraint",
                    controlPointEnding: "NoConstraint",
                  },
                  {
                    type: "CIMGeometricEffectOffset",
                    method: "Square",
                    offset: 0.15,
                    option: "Fast",
                  },
                ],
                enable: true,
                capStyle: "Butt",
                joinStyle: "Round",
                lineStyle3D: "Strip",
                miterLimit: 10,
                width: 2.3,
                color: [0, 0, 0, 255], // #000000
              },
              {
                type: "CIMSolidStroke",
                enable: true,
                colorLocked: true,
                capStyle: "Butt",
                joinStyle: "Round",
                lineStyle3D: "Strip",
                miterLimit: 10,
                width: 4.6,
                color: [246, 226, 13, 255], // #F6E20D
              },
              {
                type: "CIMSolidStroke",
                enable: true,
                capStyle: "Butt",
                joinStyle: "Round",
                lineStyle3D: "Strip",
                miterLimit: 10,
                width: 5,
                color: [0, 0, 0, 255], // #000000
              },
            ],
          },
        },
      });

    case 64:
      return new CIMSymbol({
        data: {
          type: "CIMSymbolReference",
          symbol: {
            type: "CIMLineSymbol",
            symbolLayers: [
              {
                type: "CIMSolidStroke",
                effects: [
                  {
                    type: "CIMGeometricEffectOffset",
                    method: "Rounded",
                    offset: 1.85,
                    option: "Fast",
                  },
                ],
                enable: true,
                capStyle: "Butt",
                joinStyle: "Round",
                lineStyle3D: "Strip",
                miterLimit: 10,
                width: 3.3,
                color: [239, 16, 15, 255], // #EF100F
              },
              {
                type: "CIMSolidStroke",
                effects: [
                  {
                    type: "CIMGeometricEffectOffset",
                    method: "Rounded",
                    offset: -3.85,
                    option: "Fast",
                  },
                ],
                enable: true,
                capStyle: "Butt",
                joinStyle: "Round",
                lineStyle3D: "Strip",
                miterLimit: 10,
                width: 1.3,
                color: [0, 0, 0, 255], // #000000
              },
              {
                type: "CIMSolidStroke",
                enable: true,
                colorLocked: true,
                capStyle: "Butt",
                joinStyle: "Round",
                lineStyle3D: "Strip",
                miterLimit: 10,
                width: 4.6,
                color: [255, 255, 255, 255], // #FFFFFF
              },
            ],
          },
        },
      });

    case 66:
      return new CIMSymbol({
        data: {
          type: "CIMSymbolReference",
          symbol: {
            type: "CIMLineSymbol",
            symbolLayers: [
              {
                type: "CIMSolidStroke",
                enable: true,
                capStyle: "Round",
                joinStyle: "Round",
                lineStyle3D: "Strip",
                miterLimit: 10,
                width: 6.5,
                color: [15, 123, 64, 255], // #0F7B40
                effects: [
                  {
                    type: "CIMGeometricEffectDashes",
                    dashTemplate: [5, 6],
                    lineDashEnding: "NoConstraint",
                    offsetAlongLine: 0,
                  },
                ],
              },
            ],
          },
        },
      });

    default:
      return new CIMSymbol({
        data: {
          type: "CIMSymbolReference",
          symbol: {
            type: "CIMLineSymbol",
            symbolLayers: [
              {
                type: "CIMSolidStroke",
                enable: true,
                capStyle: "Round",
                joinStyle: "Round",
                lineStyle3D: "Strip",
                miterLimit: 10,
                width: 1,
                color: [61, 67, 255, 166], // #3D43FFA6  [201, 120, 213, 166], // #C978D5A6
                effects: [],
              },
            ],
          },
        },
      });
  }
}
