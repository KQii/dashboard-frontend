import { useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { User } from "lucide-react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BadgeAlert,
  CircleFadingPlus,
  Users,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { RootState } from "../../store";
import { signOut } from "../../slices/authSlice";
import { Button } from "../common/Button";

const MENU_ITEMS = [
  {
    visibleBy: ["operator", "admin"],
    label: "Dashboard",
    navigation: "/",
    icon: LayoutDashboard,
  },
  {
    visibleBy: ["operator", "admin"],
    label: "Alerts",
    navigation: "/alerts",
    icon: BadgeAlert,
  },
  {
    visibleBy: ["operator", "admin"],
    label: "Self Healing",
    navigation: "/self-healing",
    icon: CircleFadingPlus,
  },
  {
    visibleBy: ["operator", "admin"],
    label: "Recommendation",
    navigation: "/recommend",
    icon: Sparkles,
  },
  {
    visibleBy: ["admin"],
    label: "Administration",
    navigation: "/administration",
    icon: Users,
  },
];

const MOTION_EFFECTS = {
  wideScreenVariants: {
    open: {
      width: "16.5rem",
      transition: {
        damping: 40,
      },
    },
    closed: {
      width: "4rem",
      transition: {
        damping: 40,
      },
    },
  },
};

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.auth.user);
  const [isOpen, setIsOpen] = useState(true);
  const sidebarRef = useRef(null);

  return (
    <div>
      <motion.div
        ref={sidebarRef}
        variants={MOTION_EFFECTS.wideScreenVariants}
        animate={isOpen ? "open" : "closed"}
        initial={{ x: 0 }}
        className="flex h-full w-64 max-w-[16.5rem] flex-col overflow-hidden bg-white shadow-xl"
      >
        <div className="flex flex-col h-full">
          <ul className="scrollbar-thin scrollbar-track-white scrollbar-thumb-slate-100 flex flex-1 flex-col gap-1 overflow-hidden overflow-y-auto px-2.5 py-5 text-[0.9rem] font-medium whitespace-pre">
            {isOpen && (
              <div>
                {MENU_ITEMS.map(({ visibleBy, label, navigation, icon }) => {
                  if (visibleBy.includes(user.role)) {
                    const Icon = icon;

                    return (
                      <li key={navigation} className="mb-4 hover:font-medium">
                        <NavLink
                          to={`${navigation}`}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 text-base rounded-lg transition-colors ${
                              isActive
                                ? "bg-cyan-600 text-white"
                                : "text-gray-800 hover:bg-cyan-100"
                            }`
                          }
                        >
                          <Icon className="w-7 h-7 flex-shrink-0" />
                          {label}
                        </NavLink>
                      </li>
                    );
                  }
                })}
              </div>
            )}
          </ul>

          <div className="z-50 mt-auto max-h-48 w-full text-sm font-medium whitespace-pre">
            {isOpen && (
              <div className="border-y border-slate-300 p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 shadow-sm">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <p>Username: {user.preferred_username}</p>
                    <p>Email: {user.email}</p>
                  </div>
                </div>
                <div className="flex items-center justify-around mt-2">
                  <Button
                    className="rounded-2xl px-6 py-2 text-xs text-gray-700 bg-gray-200 hover:bg-gray-300"
                    onClick={() => navigate("/profile")}
                  >
                    View Profile
                  </Button>
                  <Button
                    className="rounded-2xl px-6 py-2 text-xs"
                    onClick={() => dispatch(signOut())}
                  >
                    Log out
                  </Button>
                </div>
              </div>
            )}

            <button
              className="flex w-full cursor-pointer items-center justify-center p-3"
              onClick={() => setIsOpen((prev) => !prev)}
            >
              <ChevronLeft
                className={`${
                  !isOpen && "rotate-180"
                } duration-200 ease-in-out`}
              />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
