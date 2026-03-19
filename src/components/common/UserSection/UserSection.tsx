import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../../hook/store";
import { logout } from "../../../store/slices/authSlice";
import { LogIn, User, LogOut } from "lucide-react";

const UserSection = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return (
      <div className="px-4 py-4 mt-auto border-t border-gray-100">
        <button
          onClick={() => navigate("/login")}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#f97316] text-white font-bold rounded-2xl shadow-[0_8px_16px_-4px_rgba(249,115,22,0.3)] hover:bg-[#ea580c] hover:shadow-[0_12px_20px_-4px_rgba(249,115,22,0.4)] transition-all active:scale-[0.98]"
        >
          <LogIn size={20} />
          <span className="text-[15px]">Sign In</span>
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 mt-auto border-t border-gray-100">
      <div className="group flex items-center justify-between p-3 bg-[#f9fafb] rounded-[20px] border border-gray-100 transition-all hover:border-orange-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-[14px] flex items-center justify-center text-[#f97316] font-bold">
            {user?.email?.charAt(0).toUpperCase() || <User size={20} />}
          </div>

          <div className="flex flex-col">
            <span className="text-[14px] font-bold text-[#1a1a1a] truncate max-w-25">
              {user?.email?.split("@")[0]}
            </span>
            <span
              className={`text-[10px] font-black uppercase tracking-wider ${user?.role === "admin" ? "text-[#f97316]" : "text-blue-500"}`}
            >
              {user?.role}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            dispatch(logout());
            navigate("/login");
          }}
          className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          title="Sign Out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
};

export default UserSection;
