import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

// Context bana rahe hain — yeh ek "global box" hai jisme user data rahega
const AuthContext = createContext();

// Custom hook — isse hum kisi bhi component mein aasani se user data nikal sakenge
export const useAuth = () => useContext(AuthContext);

// Provider — yeh poore app ko wrap karega aur user data supply karega
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Yeh listener Firebase khud maintain karta hai — login/logout/refresh, sab pe chalega
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup — jab component hatega, listener bhi band ho jayega
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};