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
    } else setSaveConfirmationState(options);

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
