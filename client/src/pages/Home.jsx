import React from "react";

import NavBarHomePage from "../components/NavBarHomePage";
import Hero from "../homeSections/Hero";
import Roadmaps from "../homeSections/Roadmaps";
import Courses from "../homeSections/Courses";
import CodeEditor from "../homeSections/CodeEditor";
import LogInSignUp from "../homeSections/LogInSignUp";
import Footer from "../homeSections/Footer";

const Home = () => {
  return (
    <div className="max-w-[1440px] mx-auto">
      <NavBarHomePage />
      <Hero />
      <Roadmaps />
      <Courses />
      <CodeEditor />
      <LogInSignUp />
      <Footer />
    </div>
  );
};

export default Home;
