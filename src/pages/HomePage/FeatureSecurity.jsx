import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
// ✨ 이 섹션에 필요한 아이콘 import (예: 자물쇠, 방패, 클라우드)
import {
  LockClosedIcon,
  ShieldCheckIcon,
  CloudArrowUpIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

// Framer Motion Variants (이전 섹션들과 유사하게 사용)
const sectionVariants = {
  /* ... */ hidden: { opacity: 0, y: 50 },
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
  /* ... */ hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function FeatureSecurity() {
  return (
    <motion.section
      id="feature-security"
      className="min-h-screen bg-stone-900 flex items-center justify-center p-8 sm:p-16 overflow-hidden" // ✨ 배경색 (이전 섹션과 구분 또는 통일)
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        {/* 왼쪽: 시각적 요소 영역 (견고함, 안전함 강조) */}
        <motion.div
          className="flex justify-center items-center" // ✨ 중앙 정렬
          variants={itemVariants}
        >
          {/* TODO: 여기에 안전함/보안을 상징하는 일러스트 또는 3D 그래픽, 또는 아이콘 조합 애니메이션 */}
          <div className="relative w-64 h-64 sm:w-80 sm:h-80">
            {" "}
            {/* 크기 조절 */}
            <ShieldCheckIcon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-32 w-32 sm:h-40 sm:w-40 text-emerald-500 opacity-30" />
            <LockClosedIcon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-20 w-20 sm:h-24 sm:w-24 text-amber-400" />
            <CloudArrowUpIcon className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 h-16 w-16 text-sky-500 opacity-70 animate-pulse" />
            {/* 위 아이콘들은 예시이며, 더 멋진 그래픽으로 대체 가능 */}
          </div>
        </motion.div>

        {/* 오른쪽: 텍스트 설명 영역 */}
        <motion.div
          className="text-center md:text-left bg-stone-800/40 p-6 sm:p-8 rounded-xl shadow-2xl backdrop-blur-sm" // ✨ 배경 투명도 조절
          variants={itemVariants}
        >
          <motion.div
            className="inline-flex items-center justify-center p-3 rounded-lg bg-stone-700 mb-4" // ✨ 아이콘 배경색
            variants={itemVariants}
          >
            <LockClosedIcon
              className="h-8 w-8 text-stone-300"
              aria-hidden="true"
            />
          </motion.div>
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-stone-100 mb-4"
            variants={itemVariants}
          >
            Because every moment of yours matters
          </motion.h2>
          <motion.p
            className="text-lg text-stone-300 leading-relaxed mb-6"
            variants={itemVariants}
          >
            Every journal entry is securely encrypted and stored in the cloud,
            accessible only by you. We treat your precious memories and privacy
            with the utmost care and respect.
          </motion.p>
          <motion.div
            className="flex flex-col space-y-3 text-sm text-stone-400"
            variants={itemVariants}
          >
            <div className="flex items-center">
              <ShieldCheckIcon className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0" />
              <span>
                End-to-end principles for data privacy (Firebase Security Rules)
              </span>
            </div>
            <div className="flex items-center">
              <CloudArrowUpIcon className="h-5 w-5 text-sky-500 mr-2 flex-shrink-0" />
              <span>Secure cloud storage for all your entries</span>
            </div>
            <div className="flex items-center">
              <UserCircleIcon className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
              <span>You are in control of your data</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}

export default FeatureSecurity;
