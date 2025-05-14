import React, { useState, useEffect } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/Auth";
import {
  SparklesIcon, // 히어로 또는 강조용
  ChatBubbleLeftEllipsisIcon, // AI 공감 파트너
  CpuChipIcon, // AI 감정 분석 (대체 아이콘)
  LockClosedIcon, // 개인 정보 보호, 저장소
  MoonIcon, // 다크 모드
  DevicePhoneMobileIcon, // 반응형 디자인
  MusicalNoteIcon, // 힐링 콘텐츠 (음악)
  PlayCircleIcon, // 힐링 콘텐츠 (영상/명상 - 대체 아이콘)
  ChartBarIcon, // 리포트 (대체 아이콘)
  ShieldCheckIcon, // 개인 정보 보호
  ArrowRightIcon, // CTA 버튼용
} from "@heroicons/react/24/outline"; // 또는 solid

/***************** 다이어리 동영상 ************************/
import diaryVideo from "../assets/videos/diary.mp4"; // ✨ import 사용

const DIARY_VIDEO_SRC = diaryVideo;

function HomePage() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleTextSectionClick = () => {
    if (currentUser) {
      navigate("/write");
    } else {
      handleGoogleLogin();
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate("/write");
    } catch (error) {
      console.error("Google 로그인 에러:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      console.log("로그아웃 성공");
      navigate("/");
    } catch (error) {
      console.error("로그아웃 에러:", error);
    }
  };

  // ✨ 각 특징에 대한 데이터 배열 (랜딩 페이지용)
  const keyFeatures = [
    {
      icon: CpuChipIcon,
      title: "AI-Powered Emotion Journal",
      description:
        "Write your diary, and our AI will analyze your emotional state and stress levels, helping you understand your mind deeper.",
    },
    {
      icon: ChatBubbleLeftEllipsisIcon,
      title: "Customizable AI Empathy Partner",
      description:
        "Choose your AI's personality to deeply empathize with your stories and receive warm encouragement. Converse with an AI that suits you.",
    },
    {
      icon: MusicalNoteIcon, // 또는 PlayCircleIcon
      title: "Emotion-Tailored Healing Content",
      description:
        "Our AI recommends YouTube music, videos, and meditation guides tailored to your analyzed emotions. Fill your day with healing.",
    },
    {
      icon: LockClosedIcon,
      title: "Your Personal Diary Vault",
      description:
        "All your entries are securely stored in the cloud (Firestore), ready for you to revisit and manage anytime.",
    },
    {
      icon: ChartBarIcon,
      title: "Weekly/Monthly Emotion Reports",
      description:
        "Track your emotional changes at a glance with weekly/monthly reports, empowering you to take better care of yourself.",
    },
    {
      icon: MoonIcon,
      title: "Comfortable Dark Mode",
      description:
        "Enjoy writing and reading your diary 부담 없이, even at night, with our eye-friendly dark theme.",
    },
    {
      icon: DevicePhoneMobileIcon,
      title: "Responsive Design",
      description:
        "Experience seamless journaling across desktop, tablet, and mobile devices. Record your thoughts anytime, anywhere.",
    },
    {
      icon: ShieldCheckIcon,
      title: "Enhanced Privacy Focus",
      description:
        "Your diary is for your eyes only. We prioritize security and data protection to ensure your entries remain confidential.",
    },
  ];

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100">
      {/* --- 히어로 섹션 (동영상 배경) --- */}
      <section
        className="relative h-screen flex flex-col items-center justify-center 
        text-center overflow-hidden"
      >
        {/* 동영상 배경 */}
        <video
          // ref={videoRef} // ✨ ref 연결 (선택적)
          className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-60" // ✨ 투명도 적용 (opacity-60)
          src={DIARY_VIDEO_SRC}
          autoPlay
          loop // ✨ 5초 영상이므로, 페이지 전환 전까지 반복 재생
          muted
          playsInline
          // poster="/images/diary_poster.jpg" // ✨ 동영상 로딩 중 보여줄 이미지 (선택적)
        />
        {/* 동영상 위 어두운 오버레이 (텍스트 가독성 향상) */}
        <div className="absolute inset-0 bg-black/30 z-10"></div>{" "}
        <div
          className="relative z-20 p-4 cursor-pointer group" // ✨ group 추가
          onClick={handleTextSectionClick} // ✨ 수정된 핸들러 연결
        >
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-md 
          group-hover:text-amber-300 transition-colors duration-300"
          >
            {" "}
            {/* ✨ 호버 효과 */}
            Lighthouse Thoughts ✨
          </h1>
          <p
            className="mt-4 text-lg sm:text-xl text-stone-200 max-w-2xl mx-auto drop-shadow-sm 
          group-hover:text-stone-100 transition-colors duration-300"
          >
            {" "}
            {/* ✨ 호버 효과 */}
            Illuminate Your Mind. <br className="sm:hidden" />
            Discover peace and grow with your AI-powered journal.
          </p>
          {/* ✨ (선택적) 클릭 유도 텍스트 또는 아이콘 (평소엔 숨김, 호버 시 나타남) */}
          <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p className="text-md text-amber-400 animate-pulse">
              Enter your sanctuary
            </p>
            {/* 또는 <ArrowRightIcon className="h-6 w-6 text-amber-400 mx-auto animate-pulse" /> */}
          </div>
        </div>
      </section>
      {/* --- 핵심 특징 소개 섹션 (그리드) --- */}
      <section className="py-16 sm:py-20 bg-stone-900">
        {" "}
        {/* --bg-primary 또는 --bg-secondary */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-stone-100 sm:text-4xl">
              {" "}
              {/* --text-primary */}
              Key Features at a Glance
            </h2>
            <p className="mt-4 text-lg text-stone-400">
              {" "}
              {/* --text-tertiary */}
              Discover how Lighthouse Thoughts can help you on your journey of
              self-reflection.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {" "}
            {/* 반응형 그리드 */}
            {keyFeatures.map((feature) => (
              <div
                key={feature.title}
                className="bg-stone-800 rounded-xl p-6 shadow-lg hover:shadow-amber-500/10 transition-shadow duration-300"
              >
                {" "}
                {/* --bg-landing-feature-card, 호버 효과 */}
                <div
                  className={`mb-4 inline-flex items-center justify-center p-3 rounded-lg bg-amber-500/10`}
                >
                  {" "}
                  {/* 아이콘 배경 */}
                  <feature.icon
                    className={`h-7 w-7 text-amber-400`}
                    aria-hidden="true"
                  />{" "}
                  {/* --icon-accent */}
                </div>
                <h3 className="text-lg font-semibold text-stone-100 mb-2">
                  {feature.title}
                </h3>{" "}
                {/* --text-primary */}
                <p className="text-sm text-stone-300 leading-relaxed">
                  {feature.description}
                </p>{" "}
                {/* --text-secondary */}
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* --- 상세 기능 강조 섹션 1: 맞춤형 AI 공감 파트너 --- */}
      <section className="py-16 sm:py-20 bg-stone-800">
        {" "}
        {/* --bg-secondary */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-stone-100 sm:text-4xl">
                {" "}
                {/* --text-primary */}
                Your <span className="text-sky-400">Personalized AI</span>{" "}
                Companion
              </h2>
              <p className="mt-4 text-lg text-stone-300">
                {" "}
                {/* --text-secondary */}
                Tailor your AI's personality. Whether you need a logical analyst
                or a deeply empathetic friend (like an extreme F-type MBTI),
                Lighthouse Thoughts adapts to provide the support you need.
              </p>
              <ul className="mt-8 space-y-3">
                {/* 예시 UI/기능 포인트 */}
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <ChatBubbleLeftEllipsisIcon
                      className="h-6 w-6 text-sky-400"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="ml-3 text-base text-stone-300">
                    Choose AI personas for varied interaction styles.
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <SparklesIcon
                      className="h-6 w-6 text-sky-400"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="ml-3 text-base text-stone-300">
                    Receive responses that truly resonate with your feelings.
                  </p>
                </li>
              </ul>
            </div>
            <div className="mt-10 lg:mt-0">
              {/* ✨ 여기에 AI 성격 선택 UI 목업 이미지 또는 간단한 애니메이션 추가 */}
              <div className="bg-stone-700 rounded-lg shadow-xl p-8 h-80 flex items-center justify-center">
                <p className="text-stone-400 text-2xl italic">
                  {" "}
                  (Image/Animation: AI Persona Selection UI Mockup){" "}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* --- 상세 기능 강조 섹션 2: 감정 맞춤 힐링 콘텐츠 --- */}
      <section className="py-16 sm:py-20 bg-stone-900">
        {" "}
        {/* --bg-primary */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
            <div className="lg:order-last">
              {" "}
              {/* 이미지 오른쪽 정렬 */}
              <h2 className="text-3xl font-bold tracking-tight text-stone-100 sm:text-4xl">
                {" "}
                {/* --text-primary */}
                Healing Content,{" "}
                <span className="text-emerald-400">Just For You</span>
              </h2>
              <p className="mt-4 text-lg text-stone-300">
                {" "}
                {/* --text-secondary */}
                Based on your AI-analyzed emotions, get personalized
                recommendations for YouTube music, videos, or guided
                meditations. If your stress levels are high, find instant relief
                with curated free meditation sessions.
              </p>
              <ul className="mt-8 space-y-3">
                {/* 예시 UI/기능 포인트 */}
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <MusicalNoteIcon
                      className="h-6 w-6 text-emerald-400"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="ml-3 text-base text-stone-300">
                    Curated music playlists to match your mood.
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <PlayCircleIcon
                      className="h-6 w-6 text-emerald-400"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="ml-3 text-base text-stone-300">
                    Calming videos and guided meditations for stress relief.
                  </p>
                </li>
              </ul>
            </div>
            <div className="mt-10 lg:mt-0 lg:order-first">
              {" "}
              {/* 이미지 왼쪽 정렬 */}
              {/* ✨ 여기에 힐링 콘텐츠 추천 UI 목업 이미지 또는 간단한 애니메이션 추가 */}
              <div className="bg-stone-800 rounded-lg shadow-xl p-8 h-80 flex items-center justify-center">
                <p className="text-stone-400 text-2xl italic">
                  {" "}
                  (Image/Animation: Healing Content Recommendation UI
                  Mockup){" "}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* --- 마지막 CTA 섹션 --- */}
      <section className="py-16 sm:py-20 bg-stone-800">
        {" "}
        {/* --bg-secondary */}
        <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-stone-100 sm:text-4xl">
            {" "}
            {/* --text-primary */}
            Ready to Start Your Journey?
          </h2>
          <p className="mt-4 text-lg text-stone-300">
            {" "}
            {/* --text-secondary */}
            Join Lighthouse Thoughts today and discover a new path to
            self-understanding and emotional well-being.
          </p>
          <div className="mt-8">
            <button
              onClick={
                currentUser ? () => navigate("/write") : handleGoogleLogin
              }
              className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-lg font-semibold rounded-lg text-stone-900 bg-amber-400 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-800 focus:ring-amber-500 transition-colors" // 더 큰 CTA 버튼
            >
              {currentUser ? "Go to Your Diary" : "Sign Up with Google"}
              <ArrowRightIcon className="ml-3 h-6 w-6" />
            </button>
          </div>
        </div>
      </section>
      {/* --- 7. 푸터 --- */}
      <footer className="bg-stone-900 border-t border-stone-700">
        {" "}
        {/* --border-primary */}
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-stone-400">
            {" "}
            {/* --text-tertiary */}© {new Date().getFullYear()} Lighthouse
            Thoughts. All rights reserved.
          </p>
          {/* <p className="mt-2 text-xs text-stone-500">
            <a href="/privacy" className="hover:text-stone-300">Privacy Policy</a>
            <span className="mx-2">|</span>
            <a href="/terms" className="hover:text-stone-300">Terms of Service</a>
          </p> */}
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
