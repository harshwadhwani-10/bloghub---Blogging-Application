import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { initializeApp } from "firebase/app";
import { getEvn } from "./getEnv";






// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: getEvn('VITE_FIREBASE_API'),
  authDomain: "mern-blog-1a871.firebaseapp.com",
  projectId: "mern-blog-1a871",
  storageBucket: "mern-blog-1a871.firebasestorage.app",
  messagingSenderId: "836496512759",
  appId: "1:836496512759:web:c80cf0bcd73bf10bba25f2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);












// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// const firebaseConfig = {
//     apiKey: getEvn('VITE_FIREBASE_API'),
//     authDomain: "yt-mern-blog.firebaseapp.com",
//     projectId: "yt-mern-blog",
//     storageBucket: "yt-mern-blog.firebasestorage.app",
//     messagingSenderId: "150248092393",
//     appId: "1:150248092393:web:34bc9843d732ee4be7f678"
// };





// Initialize Firebase
// const app = initializeApp(firebaseConfig);

const auth = getAuth(app)
const provider = new GoogleAuthProvider()

export { auth, provider }