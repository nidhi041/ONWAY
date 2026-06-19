// ─── AuthContext Tests ──────────────────────────────────────────────────────────
// Tests for: context/AuthContext.tsx

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
// jest globals provided by jest-expo preset

// ─── Mock Firebase Auth ─────────────────────────────────────────────────────────

const mockSignIn = jest.fn();
const mockCreateUser = jest.fn();
const mockSignOut = jest.fn();
const mockOnAuthChanged = jest.fn();
let authChangeCallback: ((user: any) => void) | null = null;

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: (...args: any[]) => mockSignIn(...args),
  createUserWithEmailAndPassword: (...args: any[]) => mockCreateUser(...args),
  signOut: (...args: any[]) => mockSignOut(...args),
  onAuthStateChanged: (_auth: any, cb: any) => {
    authChangeCallback = cb;
    mockOnAuthChanged(cb);
    // By default, no user logged in
    cb(null);
    return jest.fn(); // unsubscribe
  },
  signInWithCredential: jest.fn(),
  GoogleAuthProvider: { credential: jest.fn() },
  getAuth: jest.fn(),
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
}));

// ─── Mock Firestore ─────────────────────────────────────────────────────────────

const mockGetDoc = jest.fn();
const mockSetDocFn = jest.fn();

jest.mock('firebase/firestore', () => ({
  doc: jest.fn().mockReturnValue({}),
  getDoc: (...args: any[]) => mockGetDoc(...args),
  setDoc: (...args: any[]) => mockSetDocFn(...args),
  serverTimestamp: jest.fn().mockReturnValue('mock-ts'),
}));

jest.mock('@/config/firebase', () => ({
  db: {},
  auth: {},
  default: {},
}));

import { AuthProvider, useAuth } from '@/context/AuthContext';

// ─── Helper: Wrapper ────────────────────────────────────────────────────────────

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

// ─── Tests ──────────────────────────────────────────────────────────────────────

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authChangeCallback = null;
  });

  describe('Initial state', () => {
    it('starts with no user and isLoading transitions to false', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      expect(result.current.user).toBeNull();
      expect(result.current.isLoggedIn).toBe(false);
    });
  });

  describe('login', () => {
    it('rejects invalid email format', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await expect(
        act(() => result.current.login('bademail', 'password123'))
      ).rejects.toThrow('Invalid email or password');
    });

    it('rejects passwords shorter than 6 characters', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await expect(
        act(() => result.current.login('test@test.com', '12345'))
      ).rejects.toThrow('Invalid email or password');
    });

    it('calls signInWithEmailAndPassword with valid credentials', async () => {
      mockSignIn.mockResolvedValueOnce({
        user: { uid: 'uid-1', email: 'test@test.com', displayName: 'Test', photoURL: null },
      });
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ name: 'Test User', phone: '999', avatar: '🧑' }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(() => result.current.login('test@test.com', 'password123'));

      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });

    it('sets basic user when Firestore fetch fails', async () => {
      mockSignIn.mockResolvedValueOnce({
        user: { uid: 'uid-2', email: 'offline@test.com', displayName: null, photoURL: null },
      });
      mockGetDoc.mockRejectedValueOnce(new Error('Firestore offline'));

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(() => result.current.login('offline@test.com', 'password123'));

      // Should still set a user from auth data alone
      expect(result.current.user).not.toBeNull();
      expect(result.current.user?.email).toBe('offline@test.com');
    });
  });

  describe('signup', () => {
    it('rejects missing name', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await expect(
        act(() => result.current.signup('', 'test@test.com', 'password123', '9999'))
      ).rejects.toThrow('Please provide valid information');
    });

    it('creates auth user and Firestore profile', async () => {
      mockCreateUser.mockResolvedValueOnce({
        user: { uid: 'new-uid', email: 'new@test.com', displayName: null, photoURL: null },
      });
      mockSetDocFn.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(() => result.current.signup('New User', 'new@test.com', 'password123', '9876543210'));

      expect(mockCreateUser).toHaveBeenCalledTimes(1);
      expect(result.current.user?.name).toBe('New User');
    });
  });

  describe('logout', () => {
    it('calls signOut and clears user state', async () => {
      mockSignOut.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(() => result.current.logout());

      expect(mockSignOut).toHaveBeenCalledTimes(1);
      expect(result.current.user).toBeNull();
      expect(result.current.isLoggedIn).toBe(false);
    });
  });

  describe('onAuthStateChanged', () => {
    it('listener is registered on mount', () => {
      renderHook(() => useAuth(), { wrapper });

      expect(mockOnAuthChanged).toHaveBeenCalledTimes(1);
      expect(typeof mockOnAuthChanged.mock.calls[0][0]).toBe('function');
    });
  });
});
