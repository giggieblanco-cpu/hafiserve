import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function AdminShortcutHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+A to access admin dashboard
      if (e.ctrlKey && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        const password = prompt("🔐 Enter Admin Password:");
        if (password === "hafi2026admin") {
          navigate("/admin/dashboard");
        } else if (password !== null) {
          alert("❌ Incorrect password!");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return null;
}
