import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import logo from "../assets/images/logo.png";

function Header() {
  const { userData, backendUrl, setUserData, setIsLoggedin } =
    useContext(AppContent);
  const navigate = useNavigate();

  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(
        backendUrl + "/api/auth/send-verify-otp"
      );
      if (data.success) {
        navigate("/email-verify");
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + "/api/auth/logout");
      if (data.success) {
        setIsLoggedin(false);
        setUserData(false);
        navigate("/");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-4 md:p-5 flex flex-col md:flex-row justify-between items-center gap-4">
      {/* Logo Section */}
      <div className="flex items-center gap-2.5 text-white text-2xl font-bold">
        <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center p-1">
          <img
            src={logo}
            alt="codeU Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <button className="hover:opacity-80 transition-opacity">codeU</button>
      </div>

      {/* Right-side: user / login */}
      <div className="flex items-center gap-4">
        {userData ? (
          <div className="w-8 h-8 flex justify-center items-center rounded-full bg-yellow-500 text-white relative group">
            <p className="font-bold">{userData.name[0].toUpperCase()}</p>
            <div className="absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10 ">
              <ul className="list-none m-0 p-2 bg-gray-100 text-sm rounded-sm">
                {!userData.isAccountVerified && (
                  <li
                    onClick={sendVerificationOtp}
                    className="py-1 px-3 hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                  >
                    Verify email
                  </li>
                )}

                <li
                  onClick={logout}
                  className="py-1 px-3 hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                >
                  Logout
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className=" flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 transition-all"
          >
            Login <img src={assets.arrow_icon} alt="" />
          </button>
        )}
      </div>
    </div>
  );
}

export default Header;
