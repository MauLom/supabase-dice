import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAh-7QQAubic9bLi3w6CBvfWUMJ7c0U5FQ",
  authDomain: "realtimedicerollerse.firebaseapp.com",
  databaseURL: "https://realtimedicerollerse-default-rtdb.firebaseio.com",
  projectId: "realtimedicerollerse",
  storageBucket: "realtimedicerollerse.firebasestorage.app",
  messagingSenderId: "294869060509",
  appId: "1:294869060509:web:9679fc14fdcb2bcba83d74",
  measurementId: "G-B4G47MK14V"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
