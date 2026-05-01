// Re-export from AuthContext to avoid duplicating auth logic.
// Always use this hook rather than importing useAuth from AuthContext directly.
export { useAuth } from '../context/AuthContext';
