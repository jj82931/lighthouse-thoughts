import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../src/contexts/Auth";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

// ✨ 각 랜딩 페이지 섹션 컴포넌트 import
import HeroSection from "./HomePage/HeroSection";
import FeatureAnalysis from "./HomePage/FeatureAnalysis";
import FeaturePersona from "./HomePage/FeaturePersona";
import FeatureHealingContent from "./HomePage/FeatureHealingContent";
import FeatureSecurity from "./HomePage/FeatureSecurity";
import FeatureGrowthJourney from "./HomePage/FeatureGrowthJourney";
import FinalCTASection from "./HomePage/FinalCTASection";

function HomePage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    let timer; // setTimeout을 위한 변수

    if (currentUser) {
      setIsRedirecting(true); // ✨ 리디렉션 시작 상태로 변경
      console.log(
        "User is logged in, starting 10-second redirect timer to /write from HomePage"
      );

      timer = setTimeout(() => {
        console.log("10-second timer ended, navigating to /write");
        navigate("/write", { replace: true });
        // setIsRedirecting(false); // 페이지 이동 후에는 이 컴포넌트가 언마운트되므로 굳이 false로 바꿀 필요는 없음
      }, 10000); // ✨ 10000 밀리초 = 10초
    }
    // 컴포넌트 언마운트 시 또는 currentUser 변경 시 타이머 정리
    return () => {
      if (timer) {
        clearTimeout(timer);
        console.log("Redirect timer cleared");
      }
    };
  }, [currentUser, navigate]);

  // ✨ 로그인된 사용자이고 리디렉션 중일 경우 로딩 화면 표시
  if (currentUser && isRedirecting) {
    return (
      <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center text-center p-4">
        <motion.div // Framer Motion을 사용한 부드러운 등장 효과 (선택적)
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* 여기에 앱 로고 이미지를 추가하면 더 좋습니다. */}
          {/* <img src="/path/to/your/app-logo-light.png" alt="App Logo" className="w-24 h-24 mx-auto mb-6 opacity-80" /> */}
          <h2 className="text-2xl sm:text-3xl font-semibold text-amber-400 mb-3">
            Welcome back!
          </h2>
          <p className="text-stone-300 text-lg mb-6">
            Loading your personal diary...
          </p>
          <div className="w-10 h-10 border-4 border-stone-600 border-t-amber-500 rounded-full animate-spin mx-auto"></div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-stone-900 text-stone-100">
      <HeroSection />
      <FeatureAnalysis />
      <FeaturePersona />
      <FeatureHealingContent />
      <FeatureSecurity />
      <FeatureGrowthJourney />
      <FinalCTASection />
      {/* <Footer /> */}
    </div>
  );
}

export default HomePage;
