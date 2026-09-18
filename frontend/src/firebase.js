import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // <-- Yahan add kiya

// Firebase Console se apne project ki real keys laakar yahan dalni hain
const firebaseConfig = {
  apiKey: "AIzaSyBIEbNTG_LUl4wC8gnBxT-P010cVFTC5j8",
  authDomain: "quickgig-50d94.firebaseapp.com",
  projectId: "quickgig-50d94",
  storageBucket: "quickgig-50d94.firebasestorage.app",
  messagingSenderId: "158182713810",
  appId: "1:158182713810:web:34d574a8dee70c0359400b",
  measurementId: "G-TGX5F19EDN"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();