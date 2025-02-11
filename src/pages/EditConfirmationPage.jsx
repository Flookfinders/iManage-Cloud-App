//region imports
import React, { useState, useRef, useContext, createContext, Fragment } from "react";
import ConfirmEditLossDialog from "./../dialogs/ConfirmEditLossDialog";
//endregion imports

const EditConfirmationServiceContext = createContext();

export const useEditConfirmation = () => useContext(EditConfirmationServiceContext);

export const EditConfirmationServiceProvider = ({ children }) => {
  const [confirmationState, setConfirmationState] = useState(false);
  const [associatedRecords, setAssociatedRecords] = useState([]);

  const awaitingPromiseRef = useRef();

  /**
   * Open the confirmation dialog.
   *
   * @param {object} options The options.
   * @returns {Promise}
   */
  const openConfirmation = (options) => {
    if (options.constructor === Array) {
      // if (process.env.NODE_ENV === "development")
      setAssociatedRecords(options);
      setConfirmationState(true);
    } else setConfirmationState(options);
    return new Promise((resolve, reject) => {
      awaitingPromiseRef.current = { resolve, reject };
    });
  };

  /**
   * Event to handle cancelling the dialog
   */
  const handleCancelMoveAway = () => {
    if (awaitingPromiseRef.current) {
      awaitingPromiseRef.current.reject();
    }

    setConfirmationState(false);
  };

  /**
   * Event to handle saving the changes.
   */
  const handleSaveChanges = () => {
    if (awaitingPromiseRef.current) {
      awaitingPromiseRef.current.resolve("save");
    }

    setConfirmationState(false);
  };

  /**
   * Event to allow dispose.
   */
  const handleAllowDispose = () => {
    if (awaitingPromiseRef.current) {
      awaitingPromiseRef.current.resolve("discard");
    }

    setConfirmationState(false);
  };

  return (
    <Fragment>
      <EditConfirmationServiceContext.Provider value={openConfirmation} children={children} />

      <ConfirmEditLossDialog
        isOpen={confirmationState}
        title="Unsaved changes"
        message={
          associatedRecords && associatedRecords.length > 0
            ? "You have made changes to these record types, do you want to keep them or discard them?"
            : "You have made changes to this record, do you want to keep them or discard them?"
        }
        saveText="Keep"
        associatedRecords={associatedRecords}
        handleSaveClick={handleSaveChanges}
        handleDisposeClick={handleAllowDispose}
        handleReturnClick={handleCancelMoveAway}
      />
    </Fragment>
  );
};
