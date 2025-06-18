import React from "react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // 단어들이 0.1초 간격으로 나타남
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

// 빈도수에 따라 폰트 크기와 색상을 결정하는 헬퍼 함수
const getWordStyle = (count, maxCount) => {
  const percentage = Math.max(0.1, count / maxCount); // 0이 되는 것을 방지

  // 폰트 크기: 16px ~ 48px 사이로 매핑
  const fontSize = `${16 + percentage * 32}px`;

  // 색상: 빈도수가 높을수록 진한 색
  let color = "text-stone-400";
  if (percentage > 0.7) color = "text-amber-400";
  else if (percentage > 0.4) color = "text-sky-400";

  return { fontSize, color };
};

function KeywordCloud({ words = [] }) {
  if (!words || words.length === 0) {
    return (
      <div className="text-center text-stone-500">No keywords to display.</div>
    );
  }

  // ✨ 상위 15개의 키워드만 사용하도록 데이터를 자릅니다.
  const topWords = words.slice(0, 15);

  // 가장 높은 빈도수 찾기 (스타일 계산 기준)
  // ✨ 자른 데이터를 기준으로 maxCount를 계산합니다.
  const maxCount = Math.max(...topWords.map((w) => w.count), 1);

  return (
    <motion.div
      className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ✨ topWords 배열을 사용하여 렌더링합니다. */}
      {topWords.map((word) => {
        const { fontSize, color } = getWordStyle(word.count, maxCount);
        return (
          <motion.span
            key={word.value}
            className={`font-bold ${color}`}
            style={{ fontSize }}
            variants={itemVariants}
            title={`Count: ${word.count}`}
          >
            {word.value}
          </motion.span>
        );
      })}
    </motion.div>
  );
}

export default KeywordCloud;
