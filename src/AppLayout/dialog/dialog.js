import { createContext, forwardRef, useContext, useState } from 'react';
import { isFunction } from 'lodash';
import clsx from 'clsx';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Slide,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const DialogContext = createContext({});

export const DialogProvider = ({ children }) => {
  const [dialog, setDialog] = useState(null);

  return (
    <DialogContext.Provider value={{ dialog, setDialog }}>
      {children}
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const { setDialog } = useContext(DialogContext);

  const defaultActions = [
    { type: 'cancel', label: 'Cancel' },
    { type: 'confirm', label: 'Confirm' },
  ];

  const dialog = ({ severity, title, message, actions = defaultActions }) => {
    let resolvePromiseInProgress = null;
    let rejectPromiseInProgress = null;

    const confirm = () => {
      if (isFunction(resolvePromiseInProgress)) {
        resolvePromiseInProgress();
      }
    };

    const cancel = (reason) => {
      if (isFunction(rejectPromiseInProgress)) {
        rejectPromiseInProgress(
          new Error(`Dialog canceled (reason: ${reason})`)
        );
      }
    };

    const promise = new Promise((resolve, reject) => {
      resolvePromiseInProgress = resolve;
      rejectPromiseInProgress = reject;
    }).finally(() => {
      resolvePromiseInProgress = null;
      rejectPromiseInProgress = null;
    });

    setDialog({ severity, title, message, actions, confirm, cancel });

    return promise;
  };

  return dialog;
};

const Transition = forwardRef((props, ref) => {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const DialogContainer = () => {
  const { dialog, setDialog } = useContext(DialogContext);

  const closeDialog = () => {
    setDialog(null);
  };

  const confirm = () => {
    closeDialog();
    dialog.confirm();
  };

  const cancel = (reason) => {
    closeDialog();
    dialog.cancel(reason);
  };

  const actionClickHandler = (type) => () => {
    if (type === 'confirm') {
      confirm();
    } else {
      cancel('cancelButtonClick');
    }
  };

  // TODO: Replace `sx` prop with CSS

  return (
    <div className="DialogContainer">
      <Dialog
        fullWidth
        TransitionComponent={Transition}
        open={dialog}
        onClose={(event, reason) => {
          cancel(reason);
        }}
      >
        <DialogTitle>
          {dialog?.title}

          <IconButton
            onClick={() => {
              cancel('closeButtonClick');
            }}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <DialogContentText>{dialog?.message}</DialogContentText>
        </DialogContent>

        <DialogActions>
          {dialog?.actions.map(({ type, label }) => {
            return (
              <button
                type="button"
                className={clsx(
                  'button large',
                  type === 'confirm' && {
                    blue: dialog?.severity === 'info',
                    green: dialog?.severity === 'success',
                    yellow: dialog?.severity === 'warning',
                    red: dialog?.severity === 'error',
                  }
                )}
                autoFocus={type === 'confirm'}
                onClick={actionClickHandler(type)}
              >
                {label}
              </button>
            );
          })}
        </DialogActions>
      </Dialog>
    </div>
  );
};