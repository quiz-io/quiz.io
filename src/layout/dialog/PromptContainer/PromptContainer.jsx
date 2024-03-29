import { forwardRef, useState } from 'react';
import { map } from 'lodash';
import clsx from 'clsx';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Slide
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useForm } from '@/form/form.js';
import { required } from '@/form/rules.js';
import { useSnackbar } from '@/layout/snackbar/snackbar.jsx';
import { usePromptContext } from '@/layout/dialog/prompt.jsx';
import { scope } from './PromptContainer.module.css';

const Transition = forwardRef((props, ref) => {
  return <Slide direction="up" ref={ref} {...props} />;
});

Transition.displayName = 'Transition';

export const PromptContainer = () => {
  const { prompt, setPrompt } = usePromptContext();
  const snackbar = useSnackbar();
  const { form, validate, reset } = useForm(required());
  const [inputValue, setInputValue] = useState('');

  const onInputValueChange = (event) => {
    setInputValue(event.target.value);
  };

  const closePrompt = () => {
    setPrompt(null);
    setInputValue('');
    reset();
  };

  const confirm = () => {
    const { isValid } = validate(inputValue);

    if (!isValid) {
      snackbar({ severity: 'error', message: 'Form validation failed' });
      return;
    }

    closePrompt();
    prompt.confirm(inputValue);
  };

  const cancel = (reason) => {
    closePrompt();
    prompt.cancel(reason);
  };

  const actionClickHandler = (type) => () => {
    if (type === 'confirm') {
      confirm();
      return;
    }

    if (type === 'cancel') {
      cancel('cancelButtonClick');
      return;
    }

    cancel('unknownActionType');
  };

  const onSubmit = (event) => {
    event.preventDefault();
    confirm();
  };

  return (
    <Dialog
      className={scope}
      fullWidth
      disableRestoreFocus
      TransitionComponent={Transition}
      open={Boolean(prompt)}
      onClose={(event, reason) => {
        cancel(reason);
      }}
    >
      <DialogTitle>
        {prompt?.title}

        <IconButton
          className="close-prompt-button"
          onClick={() => {
            cancel('closeButtonClick');
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <form noValidate className="form" onSubmit={onSubmit}>
          <div className={clsx('field', { error: form?.errors.required })}>
            {prompt?.inputLabel && (
              <p className="label">{prompt?.inputLabel}</p>
            )}

            <input
              type="text"
              placeholder={prompt?.inputLabel}
              value={inputValue}
              onChange={onInputValueChange}
              autoFocus
            />

            {form?.errors.required && (
              <p role="alert" className="helper">
                {prompt?.inputLabel} is required
              </p>
            )}
          </div>
        </form>
      </DialogContent>

      <DialogActions>
        {map(prompt?.actions || [], ({ type, label }) => {
          return (
            <button
              key={label}
              type="button"
              className={clsx(
                'button large',
                type === 'confirm' && {
                  blue: prompt?.severity === 'success',
                  red: prompt?.severity === 'error'
                }
              )}
              onClick={actionClickHandler(type)}
            >
              {label}
            </button>
          );
        })}
      </DialogActions>
    </Dialog>
  );
};
