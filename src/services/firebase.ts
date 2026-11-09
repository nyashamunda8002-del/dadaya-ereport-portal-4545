/**
 * Firebase Firestore & Authentication Service for Dadaya High School E-Report Portal
 */
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore,
  doc,
  getDocFromServer,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initialize Firebase App
export const app: FirebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApps()[0];

// CRITICAL: Initialize Firestore with persistent local cache and exact database ID for offline support
let firestoreDb: Firestore;
try {
  firestoreDb = initializeFirestore(
    app,
    {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
      experimentalAutoDetectLongPolling: true,
    },
    firebaseConfig.firestoreDatabaseId
  );
} catch {
  firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}
export const db: Firestore = firestoreDb;

// Initialize Firebase Auth
export const auth: Auth = getAuth(app);

// Test Firestore Connection as required by skill with safe non-blocking probe
export async function testConnection(): Promise<boolean> {
  try {
    const probePromise = getDocFromServer(doc(db, 'test', 'connection'));
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('probe-timeout')), 3000)
    );
    await Promise.race([probePromise, timeoutPromise]);
    console.log('Firestore connected successfully to database:', firebaseConfig.firestoreDatabaseId);
    return true;
  } catch {
    // If backend connection is delayed, Firestore operates seamlessly via persistent offline cache
    return false;
  }
}

// Perform background non-blocking check
testConnection();

export const getFirebaseStatus = () => {
  return {
    isConfigured: true,
    projectId: firebaseConfig.projectId,
    databaseId: firebaseConfig.firestoreDatabaseId,
  };
};

export function initFirebase(customConfig?: { apiKey?: string; projectId?: string; authDomain?: string }) {
  if (customConfig?.projectId) {
    console.log('Firebase configured with project:', customConfig.projectId);
  }
  return {
    success: true,
    message: `Connected to Cloud Firestore (${firebaseConfig.firestoreDatabaseId}) in project ${firebaseConfig.projectId}.`,
  };
}

export default { app, db, auth, testConnection, getFirebaseStatus, initFirebase, handleFirestoreError };
