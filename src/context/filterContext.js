//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Filter Context
//
//  Copyright:    © 2021 - 2023 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//region Version 1.0.0.0
//    001   19.07.21 Sean Flook         WI39??? Initial Revision.
//endregion Version 1.0.0.0
//
//--------------------------------------------------------------------------------------------------
//endregion header

//region imports

import React from "react";

//endregion imports

const FilterContext = React.createContext();
FilterContext.displayName = "FilterContext";

export default FilterContext;
