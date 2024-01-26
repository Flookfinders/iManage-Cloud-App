/* #region header */
/**************************************************************************************************
//
//  Description: Application Bar component
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
//    002   26.01.24 Sean Flook       IMANN-251 Reset associatedRecords when option is true.
//#endregion Version 1.0.0.0 changes
//
//--------------------------------------------------------------------------------------------------
/* #endregion header */

/* #region imports */
import React, { useState, useRef, useContext, createContext, Fragment } from "react";
import ConfirmEditLossDialog from "./../dialogs/ConfirmEditLossDialog";
/* #endregion imports */

const SaveConfirmationServiceContext = createContext();

export const useSaveConfirmation = () => useContext(SaveConfirmationServiceContext);

export const SaveConfirmationServiceProvider = ({ children }) => {
  const [saveConfirmationState, setSaveConfirmationState] = useState(false);
  const [associatedRecords, setAssociatedRecords] = useState([]);

  const awaitingSavePromiseRef = useRef();

  /**
   * Method to open the save confirmation dialog.
   *
   * @param {object} options The options.
   * @returns {Promise}
   */
  const openSaveConfirmation = (options) => {
    if (options.constructor === Array) {
      setAssociatedRecords(options);
      setSaveConfirmationState(true);
    } else {
      setAssociatedRecords([]);
      setSaveConfirmationState(options);
    }

    return new Promise((resolve, reject) => {
      awaitingSavePromiseRef.current = { resolve, reject };
    });
  };

  /**
   * Event to handle cancelling the dialog
   */
  const handleCancelMoveAway = () => {
    if (awaitingSavePromiseRef.current) {
      awaitingSavePromiseRef.current.reject();
    }

    setSaveConfirmationState(false);
  };

  /**
   * Event to handle saving the changes.
   */
  const handleSaveChanges = () => {
    if (awaitingSavePromiseRef.current) {
      awaitingSavePromiseRef.current.resolve("save");
    }

    setSaveConfirmationState(false);
  };

  /**
   * Event to allow dispose.
   */
  const handleAllowDispose = () => {
    if (awaitingSavePromiseRef.current) {
      awaitingSavePromiseRef.current.resolve("discard");
    }

    setSaveConfirmationState(false);
  };

  return (
    <Fragment>
      <SaveConfirmationServiceContext.Provider value={openSaveConfirmation} children={children} />

      <ConfirmEditLossDialog
        isOpen={saveConfirmationState}
        title="Unsaved changes"
        message={
          associatedRecords && associatedRecords.length > 0
            ? "You have made changes to these record types, do you want to save them or discard them?"
            : "You have made changes to this record, do you want to save them or discard them?"
        }
        saveText="Save"
        associatedRecords={associatedRecords}
        handleSaveClick={handleSaveChanges}
        handleDisposeClick={handleAllowDispose}
        handleReturnClick={handleCancelMoveAway}
      />
    </Fragment>
  );
};
