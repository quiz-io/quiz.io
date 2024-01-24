import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail as fbSendPasswordResetEmail,
  updatePassword as fbUpdatePassword
} from 'firebase/auth';
import { ref, onValue, off, set } from 'firebase/database';
import { db, auth } from './firebase';

let resolveInitialAuthState;

export const initialAuthState = new Promise((resolve) => {
  resolveInitialAuthState = resolve;
});

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  const login = ({ email, password }) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = ({ username, email, password }) => {
    return createUserWithEmailAndPassword(auth, email, password).then(
      ({ user }) => {
        return updateProfile(user, { displayName: username })
          .then(() => sendEmailVerification(user))
          .then(() => {
            return set(ref(db, `/users/${user.uid}`), {
              username,
              email
            });
          });
      }
    );
  };

  const logout = () => {
    return signOut(auth);
  };

  const sendPasswordResetEmail = (email) => {
    return fbSendPasswordResetEmail(auth, email);
  };

  const updatePassword = (newPassword) => {
    return fbUpdatePassword(auth.currentUser, newPassword);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (userAuth) => {
      if (!userAuth || !userAuth.emailVerified) {
        resolveInitialAuthState(null);

        setCurrentUser((user) => {
          if (user) {
            off(ref(db, `/users/${user.uid}`));
          }

          return null;
        });

        return;
      }

      onValue(ref(db, `/users/${userAuth.uid}`), (snapshot) => {
        const user = { ...userAuth, ...snapshot.val() };
        resolveInitialAuthState(user);
        setCurrentUser(user);
      });
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        login,
        signup,
        logout,
        sendPasswordResetEmail,
        resendEmailVerification: sendEmailVerification,
        updatePassword,
        initialAuthState
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
