import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
// ✨ 페르소나 데이터를 가져옵니다 (아이콘, 이름, 간단한 설명 등 활용 가능)
import { personas as personasDataArray } from "../../data/personasData"; // 경로 확인
// ✨ 이 섹션에 사용할 대표 아이콘 (예: 여러 말풍선, 또는 사람과 AI가 교감하는 아이콘)
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

// ✨ Framer Motion Variants (FeatureAnalysis와 유사하게 사용 가능)
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

// ✨ 페르소나 카드를 위한 간단한 컴포넌트 (선택적)
const PersonaCard = ({ persona }) => (
  <motion.div
    className="bg-stone-700/50 p-6 rounded-lg shadow-lg text-center backdrop-blur-sm hover:bg-stone-600/70 transition-colors"
    variants={itemVariants}
  >
    <img
      src={persona.icon}
      alt={`${persona.name} icon`}
      className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-800 p-1"
    />
    <h3
      className={`text-lg font-semibold mb-2 ${persona.color || "text-stone-100"}`}
    >
      {persona.name.split(",")[0]}
    </h3>{" "}
    {/* 이름만 간결하게 */}
    <p className="text-xs text-stone-300 leading-relaxed">
      {/* 페르소나 설명 중 핵심 문장 또는 짧은 태그라인 */}
      {persona.description.substring(0, 70) + "..."} {/* 예시: 설명 일부 */}
    </p>
  </motion.div>
);

function FeaturePersona() {
  // ✨ 화면에 보여줄 페르소나 (전부 또는 일부 선택)
  const displayPersonas = personasDataArray.slice(0, 3); // 예시로 3개만

  return (
    <motion.section
      id="feature-persona"
      className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-8 sm:p-16 overflow-hidden" // ✨ 배경색 변경 (Analysis와 구분)
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }} // ✨ 20% 보였을 때
    >
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          className="inline-flex items-center justify-center p-3 rounded-lg bg-sky-500/20 mb-4" // ✨ 이 기능의 대표 색상 (예: sky)
          variants={itemVariants}
        >
          <ChatBubbleLeftRightIcon
            className="h-8 w-8 text-sky-400"
            aria-hidden="true"
          />
        </motion.div>
        <motion.h2
          className="text-3xl sm:text-4xl font-bold text-stone-100 mb-6"
          variants={itemVariants}
        >
          언제나 네 곁에, 맞춤형 AI 친구{" "}
          {/* 또는 "당신만을 위한 공감 파트너" */}
        </motion.h2>
        <motion.p
          className="text-lg text-stone-300 leading-relaxed mb-12 max-w-2xl mx-auto"
          variants={itemVariants}
        >
          때로는 따뜻한 위로가, 때로는 현실적인 조언이 필요하죠. 당신이 선택한
          AI 페르소나가 당신의 이야기에 깊이 공감하며 맞춤형 지지를 보내줄
          거예요.
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 mt-12">
          {" "}
          {/* ✨ mt-12 추가 (위 텍스트와 간격) */}
          {displayPersonas.map((persona) => (
            <PersonaCard key={persona.id} persona={persona} />
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export default FeaturePersona;
