
export interface UserDataResponse {
  message: string
  user: UserData
  token: string
}

export interface UserData {
  name: string
  email: string
  role: string
}

export interface ProfileUpdateRequest {
  name: string;
  email: string;
  phone: string;
}

export interface ProfileUserData extends UserData {
  _id?: string;
  phone?: string;
}

export interface ProfileUpdateResponse {
  user: ProfileUserData;
  token?: string;
}

// The published collection has no saved response examples. Validate at the boundary.
export function parseProfileUpdateResponse(value: unknown): ProfileUpdateResponse {
  if (!value || typeof value !== 'object' || !('user' in value)) {
    throw new Error('The server returned an unexpected profile response. Your changes may have been saved; reload your profile before retrying.');
  }
  const user = value.user;
  if (!user || typeof user !== 'object' || !('name' in user) || typeof user.name !== 'string'
    || !('email' in user) || typeof user.email !== 'string'
    || !('role' in user) || typeof user.role !== 'string') {
    throw new Error('The server returned incomplete profile details. Your changes may have been saved; reload your profile before retrying.');
  }
  return {
    user: {
      name: user.name, email: user.email, role: user.role,
      ...('_id' in user && typeof user._id === 'string' ? { _id: user._id } : {}),
      ...('phone' in user && typeof user.phone === 'string' ? { phone: user.phone } : {}),
    },
    ...('token' in value && typeof value.token === 'string' && value.token ? { token: value.token } : {}),
  };
}
