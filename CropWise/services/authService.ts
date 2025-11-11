// This service centralizes auth-related API calls.
// Replace the mock implementations with real API requests later.

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  // TODO: Replace with real API
  await new Promise((r) => setTimeout(r, 800));
  return {
    token: 'mock-token-' + Date.now(),
    user: {
      id: 'u_' + Math.random().toString(36).slice(2, 8),
      name: payload.email.split('@')[0] || 'User',
      email: payload.email,
    },
  };
}

export async function register(payload: RegisterRequest): Promise<AuthResponse> {
  // TODO: Replace with real API
  await new Promise((r) => setTimeout(r, 900));
  return {
    token: 'mock-token-' + Date.now(),
    user: {
      id: 'u_' + Math.random().toString(36).slice(2, 8),
      name: payload.name,
      email: payload.email,
    },
  };
}

export async function getProfileFromToken(token: string): Promise<AuthResponse['user']> {
  // TODO: Replace with /me endpoint using the token
  await new Promise((r) => setTimeout(r, 200));
  // Minimal decode-mock
  return {
    id: 'u_profile_' + token.slice(-4),
    name: 'Current User',
    email: 'current@example.com',
  };
}


