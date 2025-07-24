interface AuthResponse {
  success: boolean;
  error?: string;
}

export const auth = {
  signIn: async (email: string, password: string, role: string): Promise<AuthResponse> => {
    // TODO: Implement actual authentication
    return { success: true };
  }
};

export default auth; 