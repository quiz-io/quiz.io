import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { DialogContentText } from '@mui/material';
import { useAuth } from '@/firebase/auth.jsx';
import { useSnackbar } from '@/layout/snackbar/snackbar.jsx';
import { useDialog } from '@/layout/dialog/dialog.jsx';
import { useForm } from '@/form/form.js';
import { email, minLength, required } from '@/form/rules.js';
import InputPassword from '@/components/InputPassword/InputPassword.jsx';
import { scope } from './Signup.module.css';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const snackbar = useSnackbar();
  const dialog = useDialog();
  const ignoreDialogCancellationError = () => {};

  const { form, validate } = useForm({
    username: required(),
    email: [required(), email()],
    password: [required(), minLength(6)]
  });

  const [user, setUser] = useState({
    username: '',
    email: '',
    password: ''
  });

  const onUsernameChange = (event) => {
    setUser((user) => ({ ...user, username: event.target.value }));
  };

  const onEmailChange = (event) => {
    setUser((user) => ({ ...user, email: event.target.value }));
  };

  const onPasswordChange = (event) => {
    setUser((user) => ({ ...user, password: event.target.value }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    const { isValid } = validate(user);

    if (!isValid) {
      snackbar({ severity: 'error', message: 'Form validation failed' });
      return;
    }

    signup(user)
      .then(() => {
        snackbar({ message: `Verification email sent to ${user.email}` });

        return dialog({
          title: 'Verify your email',
          content: (
            <>
              <DialogContentText gutterBottom>
                We have sent a verification link to{' '}
                <strong>{user.email}</strong>.
              </DialogContentText>

              <DialogContentText gutterBottom>
                Click on the link to complete the verification process.
              </DialogContentText>

              <DialogContentText gutterBottom>
                <em>You might need to check your spam folder.</em>
              </DialogContentText>
            </>
          ),
          actions: [{ type: 'confirm', label: 'Return to login' }]
        }).catch(ignoreDialogCancellationError);
      })
      .then(() => {
        navigate('/login');
      })
      .catch((err) => {
        snackbar({ severity: 'error', message: err.message });
      });
  };

  return (
    <div className={scope}>
      <article className="page-container">
        <div className="card">
          <div className="card-header">
            <h1>Sign up</h1>
          </div>

          <form
            noValidate
            className={clsx('form', { error: form && !form.isValid })}
            onSubmit={onSubmit}
          >
            <div className="field">
              <p className="label">Username</p>

              <input
                type="text"
                name="username"
                autoComplete="username"
                placeholder="Username"
                value={user.username}
                onChange={onUsernameChange}
              />

              {form?.errors.username.required && (
                <p role="alert" className="helper">
                  Username is required
                </p>
              )}
            </div>

            <div className="field">
              <p className="label">Email</p>

              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Email"
                value={user.email}
                onChange={onEmailChange}
              />

              {form?.errors.email.required && (
                <p role="alert" className="helper">
                  Email is required
                </p>
              )}

              {form?.errors.email.email && (
                <p role="alert" className="helper">
                  Invalid email format
                </p>
              )}
            </div>

            <div className="field">
              <p className="label">Password</p>

              <InputPassword
                name="password"
                autoComplete="new-password"
                placeholder="Password"
                value={user.password}
                onChange={onPasswordChange}
              />

              {form?.errors.password.required && (
                <p role="alert" className="helper">
                  Password is required
                </p>
              )}

              {form?.errors.password.minLength && (
                <p role="alert" className="helper">
                  Password should be at least 6 characters
                </p>
              )}
            </div>

            <div className="actions">
              <button type="submit" className="button large blue">
                Sign up
              </button>
            </div>
          </form>

          <div className="footer">
            Already have an account? <Link to="/login">Log in</Link>
          </div>
        </div>
      </article>
    </div>
  );
}
