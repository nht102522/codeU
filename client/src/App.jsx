import React from "react";
import { Routes, Route } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme.js";
import Home from "./pages/Home";
import { Login } from "./pages/Login";
import { EmailVerify } from "./pages/EmailVerify";
import { ResetPassword } from "./pages/ResetPassword";
import DashBoard from "./pages/DashBoard";
import { ToastContainer } from "react-toastify";
import LecturePage from "./pages/LecturePage";

const App = () => {
  return (
    <div>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<DashBoard />} />
        <Route
          path="/lecture"
          element={
            <ChakraProvider theme={theme}>
              <LecturePage />
            </ChakraProvider>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
