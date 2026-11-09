import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

import { auth, db } from '../../../lib/firebase/client';
import type { LoginFormValues, RegisterFormValues } from '../schemas/authSchemas';

export async function registerUser(values: RegisterFormValues): Promise<User> {
  const email = values.email.trim().toLowerCase();
  const displayName = values.displayName.trim();

  const { user } = await createUserWithEmailAndPassword(
    auth,
    email,
    values.password,
  );

  try {
    await updateProfile(user, { displayName });
    await user.getIdToken(true);

    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email,
      displayName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    await deleteUser(user).catch(() => undefined);
    throw error;
  }

  return user;
}

export async function loginUser(values: LoginFormValues): Promise<User> {
  const { user } = await signInWithEmailAndPassword(
    auth,
    values.email.trim().toLowerCase(),
    values.password,
  );

  return user;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}
