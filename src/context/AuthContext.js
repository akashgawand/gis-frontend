import { createContext } from 'react';

// Only export the context object from this file (no components) so fast refresh works.
export const AuthContext = createContext();

export default AuthContext;

