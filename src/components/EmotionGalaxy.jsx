import React from "react";
import { motion } from "framer-motion";

// 페르소나 ID에 따른 색상을 매핑합니다.
const personaColors = {
  luna: "bg-indigo-400",
  drjun: "bg-sky-400",
  karma: "bg-emerald-400",
  default: "bg-stone-400",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // 별들이 0.05초 간격으로 나타남
    },
  },
};

const starVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: [0, 1, 0.8, 1], // 깜빡이는 효과
    scale: 1,
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
    },
  },
};

function EmotionGalaxy({ galaxyData = [] }) {
  if (!galaxyData || galaxyData.length === 0) {
    return (
      <div className="text-center text-stone-500">No data for the galaxy.</div>
    );
  }

  return (
    <div className="relative w-full h-64 md:h-80 bg-stone-800/50 rounded-lg overflow-hidden my-8 shadow-inner">
      <motion.div
        className="relative w-full h-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {galaxyData.map((star, index) => {
          // 별의 위치를 랜덤하게 지정
          const top = `${Math.random() * 85 + 5}%`; // 5% ~ 90%
          const left = `${Math.random() * 90 + 5}%`; // 5% ~ 95%

          // moodScore에 따라 별의 크기 결정 (예: 8px ~ 24px)
          const size = `${8 + (star.moodScore / 100) * 16}px`;

          // 페르소나 색상 가져오기
          const color = personaColors[star.personaId] || personaColors.default;

          return (
            <motion.div
              key={star.id}
              className={`absolute rounded-full ${color}`}
              style={{
                top,
                left,
                width: size,
                height: size,
                // 추천 영상이 있으면 그림자 효과로 더 빛나게
                boxShadow: star.hasRecommendation
                  ? `0 0 15px 3px var(--tw-bg-opacity, 1)`
                  : "none",
              }}
              variants={starVariants}
              // 각 별의 애니메이션 시작 시간을 다르게 하여 자연스럽게
              transition={{
                ...starVariants.transition,
                delay: Math.random() * 1, // 0~1초 사이 랜덤 딜레이
              }}
              title={`Date: ${new Date(star.createdAt).toLocaleDateString()}\nMood: ${star.moodScore}`}
            />
          );
        })}
      </motion.div>
      <p className="absolute bottom-2 right-3 text-xs text-stone-500 italic">
        Your Emotion Galaxy
      </p>
    </div>
  );
}

export default EmotionGalaxy;
