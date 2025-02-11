//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Highlight Context
//
//  Copyright:    © 2021 - 2023 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//region Version 1.0.0.0
//    001   25.11.21 Sean Flook         WI39??? Initial Revision.
//endregion Version 1.0.0.0
//
//--------------------------------------------------------------------------------------------------
//endregion header

//region imports

import React from "react";

//endregion imports

const HighlightContext = React.createContext();
HighlightContext.displayName = "HighlightContext";

export default HighlightContext;
