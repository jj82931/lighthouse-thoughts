import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import aiAnalysisAnimationData from "../../assets/lottie/homepage1.json";

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const AiVisualPlaceholder = ({ animationData }) => {
  // ✨ prop 이름을 animationData로 변경 (lottie-react와 일치)
  if (!animationData) {
    // 데이터가 없을 경우의 대체 UI (선택적)
    return (
      <div className="w-full max-w-md h-80 bg-stone-700 rounded-lg shadow-xl flex items-center justify-center">
        <p className="text-stone-500 italic">
          Animation loading or not available.
        </p>
      </div>
    );
  }
  return (
    <div className="w-full max-w-md h-80 rounded-lg shadow-xl flex items-center justify-center bg-stone-700 overflow-hidden">
      {" "}
      {/* ✨ 배경색 및 overflow 추가 */}
      <Lottie
        animationData={animationData}
        loop={true}
        style={{ width: "100%", height: "100%" }}
      />{" "}
      {/* ✨ Lottie 컴포넌트 사용 */}
    </div>
  );
};

function FeatureAnalysis() {
  return (
    <motion.section
      id="feature-analysis"
      className="min-h-screen bg-stone-800 flex items-center justify-center p-8 sm:p-16 overflow-hidden"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 md:gap-16 items-center">
        <motion.div
          // ✨ 이 div의 배경색이 너무 어둡거나, 텍스트 색상과 비슷하지 않은지 확인
          className="text-center md:text-left bg-stone-900/50 p-6 sm:p-8 rounded-xl shadow-2xl backdrop-blur-sm" // 예시: 배경을 좀 더 어둡게 하고 투명도 조절
          variants={itemVariants}
        >
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-stone-100 mb-4" // ✨ 텍스트 색상 명시 (예: text-stone-100)
            variants={itemVariants}
          >
            마음의 소리에 귀 기울이다
          </motion.h2>
          <motion.p
            className="text-lg text-stone-300 leading-relaxed" // ✨ 텍스트 색상 명시 (예: text-stone-300)
            variants={itemVariants}
          >
            복잡한 생각과 감정을 솔직하게 적어보세요. Lighthouse Thoughts의 AI가
            당신의 마음을 섬세하게 분석하고, 숨겨진 감정의 의미를 함께
            찾아줍니다. Mood Score와 핵심 키워드를 통해 자신을 더 깊이 이해할 수
            있습니다.
          </motion.p>
        </motion.div>

        <motion.div className="flex justify-center" variants={itemVariants}>
          <AiVisualPlaceholder animationData={aiAnalysisAnimationData} />
        </motion.div>
      </div>
    </motion.section>
  );
}

export default FeatureAnalysis;
