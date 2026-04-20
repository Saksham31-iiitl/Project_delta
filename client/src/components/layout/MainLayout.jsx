import { motion } from "motion/react";
import { Outlet } from "react-router-dom";
import { NavigationProgress } from "@components/common/NavigationProgress.jsx";
import { ChatBot } from "@components/chat/ChatBot.jsx";
import { Footer } from "./Footer.jsx";
import { MockBanner } from "./MockBanner.jsx";
import { MobileNav } from "./MobileNav.jsx";
import { Navbar } from "./Navbar.jsx";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.18, ease: "easeIn" } },
};

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavigationProgress />
      <Navbar />
      <main className="flex-1">
        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Outlet />
        </motion.div>
      </main>
      <Footer />
      <MobileNav />
      <ChatBot />
      <MockBanner />
    </div>
  );
}
