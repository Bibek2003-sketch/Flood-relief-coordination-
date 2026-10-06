export interface DecodedGoogleUser {
  sub: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  picture?: string;
}

export const decodeGoogleCredential = (token: string): DecodedGoogleUser | null => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('Failed to decode Google credential token', err);
    return null;
  }
};

export const parseGoogleUser = (decoded: DecodedGoogleUser | null) => {
  if (!decoded) {
    return {
      firstName: 'User',
      lastName: '',
      email: '',
      sub: ''
    };
  }

  let firstName = decoded.given_name;
  let lastName = decoded.family_name;

  if (!firstName && decoded.name) {
    const parts = decoded.name.trim().split(/\s+/);
    firstName = parts[0];
    lastName = parts.slice(1).join(' ');
  }

  return {
    firstName: (firstName || 'User').trim(),
    lastName: (lastName || '').trim(),
    email: decoded.email || '',
    sub: decoded.sub || ''
  };
};

export const getUserAcronym = (firstName?: string, lastName?: string): string => {
  const first = firstName?.trim() || '';
  const last = lastName?.trim() || '';

  if (first && last) {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  }
  if (first) {
    const parts = first.split(/\s+/);
    if (parts.length > 1) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return first.slice(0, 2).toUpperCase();
  }
  return 'U';
};
