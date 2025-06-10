import React from "react";
const DIARY_VIDEO_SRC = "/videos/diary.mp4"; // 실제 동영상 파일 경로

function HeroSection() {
  return (
    <section
      id="hero" // ✨ 섹션 구분을 위한 ID (선택적)
      className="relative h-screen flex flex-col items-center justify-center text-center overflow-hidden"
    >
      {/* 동영상 배경 */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-50 md:opacity-60" // ✨ 모바일에서는 조금 더 어둡게, 데스크톱에서는 약간 밝게 (조절 가능)
        src={DIARY_VIDEO_SRC}
        autoPlay
        loop
        muted
        playsInline
        // poster="/images/hero_poster.jpg" // 동영상 로딩 중 보여줄 정적 이미지 (선택적)
      />
      {/* 동영상 위 어두운 오버레이 (텍스트 가독성 향상) */}
      <div className="absolute inset-0 bg-black/40 md:bg-black/30 z-10"></div>{" "}
      {/* ✨ 오버레이 투명도 조절 */}
      {/* 로고 및 슬로건 컨테이너 (동영상 위) */}
      <div className="relative z-20 p-4 max-w-3xl">
        <h1 className="text-4xl sm:text-5xl md:text-xl lg:text-7xl font-extrabold tracking-tight text-white drop-shadow-lg">
          Lighthouse Thoughts✨
        </h1>
        <p className="mt-6 text-lg sm:text-xl md:text-2xl text-stone-200 max-w-xl mx-auto drop-shadow mb-20 sm:mb-24 md:mb-28">
          오늘, 당신의 마음은 어떤가요? <br className="hidden sm:inline" />
          때로는 말로 다 표현하기 어려운 감정들이 있죠.
        </p>
        <div className="absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 z-30 animate-bounce">
          {/* 아래 화살표 아이콘 등 (Heroicons 사용 가능) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-8 h-8 text-white/70"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m19.5 8.25-7.5 7.5-7.5-7.5"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
