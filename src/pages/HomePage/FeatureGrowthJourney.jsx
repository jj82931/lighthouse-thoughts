// src/pages/HomePage/FeatureDataVisualization.jsx
import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
// ✨ 이 섹션에 필요한 아이콘 import (예: 데이터, 차트, 인사이트 관련 아이콘)
import { PresentationChartBarIcon as DataInsightIcon } from "@heroicons/react/24/outline";
const DataVisualizationPlaceholder = () => {
  const points = [
    { cx: 40, cy: 60, r: 3, colorClass: "text-amber-400/80" },
    { cx: 70, cy: 40, r: 4, colorClass: "text-sky-400/80" },
    { cx: 100, cy: 70, r: 3.5, colorClass: "text-emerald-400/80" },
    { cx: 130, cy: 50, r: 4, colorClass: "text-purple-400/80" },
    { cx: 160, cy: 60, r: 3, colorClass: "text-rose-400/80" },
  ];

  const lineVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 1.5, ease: "easeInOut", delay: 1.0 }, // 점들이 나타난 후 1초 뒤에 선이 그려짐 (delay 조정)
    },
  };

  const pointVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut", delay: i * 0.15 }, // 각 점의 등장 딜레이 살짝 조정
    }),
  };

  const keywordTextVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut", delay: 1.8 + i * 0.25 }, // 선이 그려진 후, 키워드 순차 등장 (delay 조정)
    }),
  };

  const keywordsToShow = [
    { text: "Mood Score", x: "25%", y: "25%", color: "text-amber-300" }, // y 위치 조정
    { text: "Key Emotion", x: "75%", y: "30%", color: "text-sky-300" }, // y 위치 조정
    { text: "Growth Pattern", x: "50%", y: "80%", color: "text-emerald-300" }, // y 위치 조정
  ];

  // ✨ d 속성값을 정의하고 콘솔에 출력
  let pathData = "";
  if (points.length > 1) {
    // 예시: 모든 점을 순차적으로 잇는 Polyline 생성
    pathData = points.reduce((acc, point, index) => {
      if (index === 0) {
        return `M ${point.cx} ${point.cy}`; // 시작점
      }
      return `${acc} L ${point.cx} ${point.cy}`; // 이전 점에서 현재 점으로 선 긋기
    }, "");
  } else {
    console.log("Not enough points to draw a line. Points array:", points);
  }

  // ✨ SVG 컨테이너 자체의 애니메이션 (내부 요소들의 애니메이션 시작을 제어)
  const svgContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        // when: "beforeChildren", // 자식들이 부모가 나타난 후 시작하도록
        staggerChildren: 0.1, // 자식 motion 요소들이 0.1초 간격으로 애니메이션 시작 (pointVariants의 delay와 조율)
        delayChildren: 0.2, // 이 SVG 컨테이너가 나타난 후 0.2초 뒤에 자식들 애니메이션 시작
      },
    },
  };

  return (
    <div className="w-full max-w-md h-72 sm:h-80 bg-stone-700/40 rounded-xl shadow-xl flex items-center justify-center p-4 overflow-hidden relative backdrop-blur-sm">
      <motion.svg
        viewBox="0 0 200 100"
        className="w-full h-full"
        variants={svgContainerVariants} // ✨ SVG 컨테이너에 variants 적용
        initial="hidden"
        animate="visible" // ✨ 부모(FeatureDataVisualization의 motion.div)가 visible 되면 이것도 visible
      >
        {/* 1. 데이터 포인트들이 순차적으로 나타나는 애니메이션 */}
        {points.map((point, i) => (
          <motion.circle
            key={`point-${i}`}
            cx={point.cx}
            cy={point.cy}
            r={point.r}
            fill="currentColor"
            className={point.colorClass}
            custom={i} // pointVariants에서 delay 계산에 사용됨
            variants={pointVariants} // initial/animate는 부모(svg)의 staggerChildren에 의해 제어됨
          />
        ))}

        {/* 2. 점들을 잇는 선이 그려지는 애니메이션 */}
        {points.length > 1 && (
          <motion.path
            d={pathData}
            stroke="rgba(255,255,255,0.3)" // 선 색상 약간 더 진하게
            strokeWidth="1.5" // 선 두께 약간 더 굵게
            fill="transparent"
            variants={lineVariants} // initial/animate는 부모(svg)의 staggerChildren에 의해 제어됨
            // lineVariants 자체의 delay로 시작 시점 조절
          />
        )}

        {/* 3. 핵심 단어들이 떠오르는 애니메이션 */}
        {keywordsToShow.map((kw, i) => (
          <motion.text
            key={`keyword-${i}`}
            x={kw.x}
            y={kw.y}
            fontSize="7" // SVG 텍스트 크기 약간 줄임
            fill="currentColor"
            className={`${kw.color} font-semibold opacity-90`} // 투명도 추가
            textAnchor="middle"
            custom={i} // keywordTextVariants에서 delay 계산에 사용됨
            variants={keywordTextVariants} // initial/animate는 부모(svg)의 staggerChildren에 의해 제어됨
          >
            {kw.text}
          </motion.text>
        ))}
      </motion.svg>
      {/* <p className="absolute bottom-4 text-xs text-stone-400 italic">
        (Visualizing your emotional journey)
      </p> */}
    </div>
  );
};

function FeatureDataVisualization() {
  // Framer Motion Variants (sectionVariants, itemVariants - 이전 답변 참고)
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
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <motion.section
      id="feature-data-visualization"
      className="min-h-screen bg-stone-900 flex items-center justify-center p-8 sm:p-16 overflow-hidden"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
    >
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        <motion.div
          className="text-center md:text-left"
          variants={itemVariants}
        >
          <motion.div
            className="inline-flex items-center justify-center p-3 rounded-lg bg-purple-500/20 mb-4"
            variants={itemVariants}
          >
            <DataInsightIcon
              className="h-8 w-8 text-purple-400"
              aria-hidden="true"
            />
          </motion.div>
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-stone-100 mb-4"
            variants={itemVariants}
          >
            Discover yourself through your data
          </motion.h2>
          <motion.p
            className="text-lg text-stone-300 leading-relaxed mb-6"
            variants={itemVariants}
          >
            Lighthouse Thoughts looks beyond simple text, finding meaningful
            emotional patterns and subtle shifts in your feelings. Through
            weekly and monthly reports, you'll see how your Mood Score changes,
            what emotions speak the loudest, and how you've grown — all
            beautifully visualized.
          </motion.p>
          <motion.p
            className="text-md text-stone-400 leading-relaxed"
            variants={itemVariants}
          >
            Wherever you are, on any device, your emotional insights are always
            within reach.
          </motion.p>
        </motion.div>

        <motion.div className="flex justify-center" variants={itemVariants}>
          <DataVisualizationPlaceholder />
        </motion.div>
      </div>
    </motion.section>
  );
}

export default FeatureDataVisualization; // 컴포넌트 이름에 맞게 export
