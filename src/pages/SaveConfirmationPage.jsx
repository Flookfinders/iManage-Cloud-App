//#region header
//--------------------------------------------------------------------------------------------------
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
//#region Version 1.0.0.0
//    001            Sean Flook                 Initial Revision.
//    002   26.01.24 Sean Flook       IMANN-251 Reset associatedRecords when option is true.
//    003   24.06.24 Sean Flook       IMANN-170 Changes required for cascading parent PAO changes to children.
//#endregion Version 1.0.0.0
//
//--------------------------------------------------------------------------------------------------
//#endregion header

//#region imports
import React, { useState, useRef, useContext, createContext, Fragment } from "react";
import ConfirmEditLossDialog from "./../dialogs/ConfirmEditLossDialog";
//#endregion imports

const SaveConfirmationServiceContext = createContext();

export const useSaveConfirmation = () => useContext(SaveConfirmationServiceContext);

export const SaveConfirmationServiceProvider = ({ children }) => {
  const [saveConfirmationState, setSaveConfirmationState] = useState(false);
  const [associatedRecords, setAssociatedRecords] = useState([]);
  const [paoChanged, setPaoChanged] = useState(false);
  const [cascadeChanges, setCascadeChanges] = useState(false);

  const awaitingSavePromiseRef = useRef();

  /**
   * Method to open the save confirmation dialog.
   *
   * @param {Object} options The options.
   * @param {Boolean} [cascadeChanges=false] True if changes need to be cascaded down to children; otherwise false.
   * @returns {Promise}
   */
  const openSaveConfirmation = (options, cascadeChanges = false) => {
    if (options.constructor === Array) {
      setAssociatedRecords(options);
      setSaveConfirmationState(true);
    } else {
      setAssociatedRecords([]);
      setSaveConfirmationState(options);
    }
    setPaoChanged(cascadeChanges);

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
   * Event to handle when the cascade changes checkbox changes.
   */
  const handleCascadeChanges = () => {
    setCascadeChanges(!cascadeChanges);
  };

  /**
   * Event to handle saving the changes.
   */
  const handleSaveChanges = () => {
    if (awaitingSavePromiseRef.current) {
      awaitingSavePromiseRef.current.resolve(`${cascadeChanges ? "saveCascade" : "save"}`);
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
        paoChanged={paoChanged}
        cascadeChanges={cascadeChanges}
        handleCascadeChange={handleCascadeChanges}
        handleSaveClick={handleSaveChanges}
        handleDisposeClick={handleAllowDispose}
        handleReturnClick={handleCancelMoveAway}
      />
    </Fragment>
  );
};
