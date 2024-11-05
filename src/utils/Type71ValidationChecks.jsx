/* #region header */
/**************************************************************************************************
//
//  Description: Type 71 validation checks
//
//  Copyright:    © 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//#region Version 1.0.1.0 changes
//    001   31.10.24 Sean Flook      IMANN-1012 Initial Revision.
//#endregion Version 1.0.1.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/**
 * Check 7100005 - Note does not exist.
 *
 * @param {Number|Null} note The note
 * @returns {Boolean} True if the check fails; otherwise false.
 */
export const failsCheck7100005 = (note) => {
  return !note;
};
