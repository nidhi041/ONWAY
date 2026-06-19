// ─── Firebase Mock Factory ──────────────────────────────────────────────────────
// Provides reusable mock implementations for firebase/firestore and firebase/auth.

// ─── Firestore Mocks ────────────────────────────────────────────────────────────

export const mockDoc = jest.fn().mockReturnValue({ id: 'mock-doc-id' });
export const mockCollection = jest.fn().mockReturnValue({ id: 'mock-collection' });
export const mockQuery = jest.fn().mockReturnValue({});
export const mockWhere = jest.fn().mockReturnValue({});
export const mockOrderBy = jest.fn().mockReturnValue({});
export const mockLimit = jest.fn().mockReturnValue({});
export const mockStartAfter = jest.fn().mockReturnValue({});

export const mockAddDoc = jest.fn().mockResolvedValue({ id: 'new-doc-id' });
export const mockSetDoc = jest.fn().mockResolvedValue(undefined);
export const mockUpdateDoc = jest.fn().mockResolvedValue(undefined);
export const mockDeleteDoc = jest.fn().mockResolvedValue(undefined);
export const mockGetDoc = jest.fn().mockResolvedValue({
  exists: () => true,
  data: () => ({ name: 'Test User', email: 'test@test.com', phone: '1234567890' }),
  id: 'mock-doc-id',
});
export const mockGetDocs = jest.fn().mockResolvedValue({
  docs: [],
  forEach: jest.fn(),
  size: 0,
});
export const mockServerTimestamp = jest.fn().mockReturnValue('mock-timestamp');

export const mockOnSnapshot = jest.fn().mockImplementation((_ref, callback) => {
  // Immediately invoke callback with empty snapshot
  callback({
    docs: [],
    forEach: jest.fn(),
    size: 0,
  });
  // Return an unsubscribe function
  return jest.fn();
});

// ─── Auth Mocks ─────────────────────────────────────────────────────────────────

export const mockSignInWithEmailAndPassword = jest.fn().mockResolvedValue({
  user: {
    uid: 'test-uid-123',
    email: 'test@test.com',
    displayName: 'Test User',
    photoURL: null,
  },
});

export const mockCreateUserWithEmailAndPassword = jest.fn().mockResolvedValue({
  user: {
    uid: 'new-uid-456',
    email: 'new@test.com',
    displayName: null,
    photoURL: null,
  },
});

export const mockSignOut = jest.fn().mockResolvedValue(undefined);

export const mockOnAuthStateChanged = jest.fn().mockImplementation((_auth, callback) => {
  // Default: call with null (no user)
  callback(null);
  return jest.fn(); // unsubscribe
});

export const mockSignInWithCredential = jest.fn().mockResolvedValue({
  user: {
    uid: 'google-uid-789',
    email: 'google@test.com',
    displayName: 'Google User',
    photoURL: 'https://photo.url',
  },
});

// ─── Setup Firebase Mocks ───────────────────────────────────────────────────────

export function setupFirestoreMocks() {
  jest.mock('firebase/firestore', () => ({
    collection: mockCollection,
    doc: mockDoc,
    query: mockQuery,
    where: mockWhere,
    orderBy: mockOrderBy,
    limit: mockLimit,
    startAfter: mockStartAfter,
    addDoc: mockAddDoc,
    setDoc: mockSetDoc,
    updateDoc: mockUpdateDoc,
    deleteDoc: mockDeleteDoc,
    getDoc: mockGetDoc,
    getDocs: mockGetDocs,
    onSnapshot: mockOnSnapshot,
    serverTimestamp: mockServerTimestamp,
  }));
}

export function setupAuthMocks() {
  jest.mock('firebase/auth', () => ({
    signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
    createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
    signOut: mockSignOut,
    onAuthStateChanged: mockOnAuthStateChanged,
    signInWithCredential: mockSignInWithCredential,
    GoogleAuthProvider: {
      credential: jest.fn().mockReturnValue('mock-credential'),
    },
    getAuth: jest.fn(),
    initializeAuth: jest.fn(),
    getReactNativePersistence: jest.fn(),
  }));
}

// ─── Helper: Create a mock Firestore snapshot ───────────────────────────────────

export function createMockSnapshot(docs: Array<{ id: string; data: Record<string, any> }>) {
  const mockDocs = docs.map(d => ({
    id: d.id,
    data: () => d.data,
    ref: { id: d.id },
    exists: () => true,
  }));

  return {
    docs: mockDocs,
    forEach: (cb: (doc: any) => void) => mockDocs.forEach(cb),
    size: mockDocs.length,
    empty: mockDocs.length === 0,
  };
}

// ─── Helper: Create a mock Product ──────────────────────────────────────────────

export function createMockProduct(overrides: Record<string, any> = {}) {
  return {
    id: 'prod-1',
    name: 'Paracetamol 500mg',
    brand: 'Cipla',
    category: 'Medicine',
    price: 30,
    originalPrice: 50,
    rating: 4.5,
    reviews: 120,
    deliveryTime: 15,
    description: 'Pain relief tablet',
    warranty: null,
    returnDays: 7,
    imageUrl: 'https://example.com/image.png',
    stock: 100,
    ...overrides,
  };
}

// ─── Helper: Create a mock CartItem ─────────────────────────────────────────────

export function createMockCartItem(overrides: Record<string, any> = {}) {
  return {
    id: 'prod-1',
    brand: 'Cipla',
    name: 'Paracetamol 500mg',
    description: 'Pain relief tablet',
    price: 30,
    originalPrice: 50,
    quantity: 1,
    image: '',
    ...overrides,
  };
}
