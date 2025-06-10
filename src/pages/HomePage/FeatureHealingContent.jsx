import React, { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  FaceSmileIcon, // 기쁨, 긍정
  FaceFrownIcon, // 슬픔, 우울
  ExclamationTriangleIcon, // 불안, 스트레스 (또는 다른 적절한 아이콘)
  SparklesIcon, // 평온, 명상 (또는 HeartIcon, SunIcon 등)
  MusicalNoteIcon,
  PlayCircleIcon,
  // MeditationIcon (SparklesIcon으로 대체 사용 중)
} from "@heroicons/react/24/outline";

// Framer Motion Variants
const sectionVariants = {
  /* ... (이전과 동일 또는 유사하게) ... */ hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.15,
    }, // staggerChildren 조절
  },
};

const itemVariants = {
  /* ... (이전과 동일 또는 유사하게) ... */ hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// ✨ 각 감정 및 추천 콘텐츠 데이터
const emotionContentData = [
  {
    id: "joy",
    emotionName: "Joyful & Energetic",
    emotionIcon: FaceSmileIcon,
    emotionColor: "text-yellow-400", // 감정 아이콘 색상
    recommendedTitle: "Uplifting Music & Videos",
    recommendedDescription:
      "Boost your mood with happy tunes and inspiring content when you feel great!",
    contentIcon: MusicalNoteIcon, // 또는 PlayCircleIcon
    contentIconColor: "text-yellow-500", // 추천 콘텐츠 아이콘 색상
  },
  {
    id: "sadness",
    emotionName: "Sad or Reflective",
    emotionIcon: FaceFrownIcon,
    emotionColor: "text-blue-400",
    recommendedTitle: "Comforting Sounds & Melodies",
    recommendedDescription:
      "Find solace in gentle music or calming ASMR when you need comfort.",
    contentIcon: MusicalNoteIcon, // 또는 다른 적절한 아이콘 (예: SpeakerWaveIcon)
    contentIconColor: "text-blue-500",
  },
  {
    id: "anxiety",
    emotionName: "Anxious or Stressed",
    emotionIcon: ExclamationTriangleIcon,
    emotionColor: "text-red-400",
    recommendedTitle: "Guided Meditations for Calm",
    recommendedDescription:
      "Ease your mind and reduce stress with guided meditation sessions.",
    contentIcon: SparklesIcon, // MeditationIcon 역할
    contentIconColor: "text-red-500",
  },
  {
    id: "peace",
    emotionName: "Peaceful & Mindful",
    emotionIcon: SparklesIcon, // 또는 다른 평온 아이콘
    emotionColor: "text-emerald-400",
    recommendedTitle: "Nature Sounds & Ambient Relaxation",
    recommendedDescription:
      "Enhance your tranquility with soothing nature sounds or ambient tracks for deep relaxation.",
    contentIcon: PlayCircleIcon, // 또는 SpeakerWaveIcon
    contentIconColor: "text-emerald-500",
  },
];

function FeatureHealingContent() {
  // ✨ 현재 선택/호버된 감정의 ID를 저장할 상태
  const [activeEmotionId, setActiveEmotionId] = useState(
    emotionContentData[0].id
  ); // 초기값으로 첫 번째 감정

  const activeEmotionDetails = emotionContentData.find(
    (e) => e.id === activeEmotionId
  );

  return (
    <motion.section
      id="feature-healing-content"
      className="min-h-screen bg-stone-800 flex flex-col items-center justify-center p-8 sm:p-16 overflow-hidden"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="max-w-4xl w-full mx-auto text-center">
        <motion.div
          className="inline-flex items-center justify-center p-3 rounded-lg bg-emerald-500/20 mb-4" // 대표 아이콘 배경
          variants={itemVariants}
        >
          <MusicalNoteIcon
            className="h-8 w-8 text-emerald-400"
            aria-hidden="true"
          />{" "}
          {/* 대표 아이콘 */}
        </motion.div>
        <motion.h2
          className="text-3xl sm:text-4xl font-bold text-stone-100 mb-6"
          variants={itemVariants}
        >
          마음 따라 흐르는, AI 추천 힐링
        </motion.h2>
        <motion.p
          className="text-lg text-stone-300 leading-relaxed mb-12 max-w-2xl mx-auto"
          variants={itemVariants}
        >
          당신의 현재 감정에 귀 기울여 보세요. AI는 당신의 마음 상태에 맞춰 꼭
          필요한 음악, 영상, 또는 명상 가이드를 추천해 줄 거예요.
        </motion.p>

        {/* 감정 선택 UI (감정 바퀴/스펙트럼 대신 아이콘 버튼 그룹으로 간소화) */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-10"
          variants={itemVariants} // 이 div 자체도 등장 애니메이션
        >
          {emotionContentData.map((emotion) => (
            <motion.button
              key={emotion.id}
              onClick={() => setActiveEmotionId(emotion.id)} // ✨ 클릭 시 activeEmotionId 변경
              onMouseEnter={() => setActiveEmotionId(emotion.id)} // ✨ 호버 시에도 변경 (선택적)
              className={`p-3 sm:p-4 rounded-full transition-all duration-200 ease-in-out focus:outline-none
                            ${
                              activeEmotionId === emotion.id
                                ? `bg-opacity-100 ring-2 ring-offset-2 ring-offset-stone-800 ${emotion.emotionColor.replace("text-", "bg-").replace("-400", "-500")} ${emotion.emotionColor.replace("text-", "ring-")}`
                                : `${emotion.emotionColor.replace("text-", "bg-")}/20 hover:${emotion.emotionColor.replace("text-", "bg-")}/40 text-stone-400`
                            }`}
              variants={itemVariants} // 각 버튼 등장 애니메이션
            >
              <emotion.emotionIcon
                className={`h-7 w-7 sm:h-8 sm:w-8 ${activeEmotionId === emotion.id ? "text-white" : emotion.emotionColor}`}
              />
            </motion.button>
          ))}
        </motion.div>

        {/* 선택된 감정에 따른 추천 콘텐츠 정보 표시 */}
        {activeEmotionDetails && (
          <motion.div
            key={activeEmotionId} // ✨ activeEmotionId 변경 시 애니메이션을 위해 key 추가
            className="bg-stone-700/50 p-6 sm:p-8 rounded-xl shadow-xl backdrop-blur-sm max-w-lg mx-auto"
            initial={{ opacity: 0, y: 20 }} // 등장 애니메이션
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div
              className={`inline-flex items-center justify-center p-2 rounded-lg ${activeEmotionDetails.contentIconColor}/20 mb-3`}
            >
              <activeEmotionDetails.contentIcon
                className={`h-7 w-7 ${activeEmotionDetails.contentIconColor}`}
                aria-hidden="true"
              />
            </div>
            <h3 className={`text-xl font-semibold text-stone-100 mb-2`}>
              For your{" "}
              <span className={`${activeEmotionDetails.emotionColor}`}>
                {activeEmotionDetails.emotionName}
              </span>{" "}
              mood: <br />
              {activeEmotionDetails.recommendedTitle}
            </h3>
            <p className="text-sm text-stone-300 leading-relaxed">
              {activeEmotionDetails.recommendedDescription}
            </p>
            {/* 실제 앱에서는 여기에 유튜브 링크나 임베드 플레이어가 들어갈 수 있음 */}
            <p className="mt-4 text-xs text-stone-400 italic">
              (In the app, AI will recommend specific YouTube content here)
            </p>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}

export default FeatureHealingContent;
