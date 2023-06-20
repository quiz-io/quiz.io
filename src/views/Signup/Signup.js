import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from 'src/firebase/auth';
import { useSnackbar } from 'src/AppLayout/snackbar/snackbar';
import { useForm } from 'src/form/form';
import { email, minLength, required } from 'src/form/rules';
import './Signup.css';

function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const snackbar = useSnackbar();

  const { form, validate } = useForm({
    email: [required(), email()],
    password: [required(), minLength(6)],
  });

  const [user, setUser] = useState({
    email: '',
    password: '',
  });

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

    const { email, password } = user;

    signup(email, password)
      .then(() => {
        snackbar({ message: 'Account created' });
        navigate('/');
      })
      .catch((err) => {
        snackbar({ severity: 'error', message: err.message });
      });
  };

  return (
    <div className="Signup">
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
            <div className="form-fields">
              <div className="field">
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  className="form-field"
                  placeholder="Email"
                  value={user.email}
                  onChange={onEmailChange}
                />

                {form?.errors.email.required && (
                  <p role="alert">Email is required</p>
                )}

                {form?.errors.email.email && (
                  <p role="alert">Invalid email format</p>
                )}
              </div>

              <div className="field">
                <input
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  className="form-field"
                  placeholder="Password"
                  value={user.password}
                  onChange={onPasswordChange}
                />

                {form?.errors.password.required && (
                  <p role="alert">Password is required</p>
                )}

                {form?.errors.password.minLength && (
                  <p role="alert">Password should be at least 6 characters</p>
                )}
              </div>
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

export default Signup;
