import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { loginUser } from "../redux/slices/loginSlice";
import { useEffect, useRef } from "react";

export default function GoogleAuthSuccess() {
  const { getToken, isLoaded } = useAuth();
  const dispatch = useDispatch();
  const hasCalledRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || hasCalledRef.current) return;

    hasCalledRef.current = true;

    const syncWithBackend = async () => {
      try {
        console.log("🚀 Trying to get Clerk token...");

        const token = await getToken();

        console.log("✅ Token received:", token);

        const res = await axios.post(
          "https://restaurant-template.runasp.net/api/auth/clerk-login",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );

        console.log("✅ Backend response:", res.data);

        dispatch(loginUser.fulfilled(res.data));
        window.location.href = "/";
      } catch (err) {
        console.error("❌ Google login error:", err);
        // window.location.href = "/login";
      }
    };

    syncWithBackend();
  }, [isLoaded, getToken, dispatch]);

  return (
    <div className="flex items-center justify-center h-screen">
      Logging you in...
    </div>
  );
}
