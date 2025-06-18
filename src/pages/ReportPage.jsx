// src/pages/ReportPage.jsx
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useAuth } from "../contexts/Auth";
import { fetchReportData } from "../store/reportSlice"; // Redux Thunk 액션 import

// 컴포넌트 import
import EmotionGalaxy from "../components/EmotionGalaxy";
import KeywordCloud from "../components/KeywordCloud";
import LoadingSpinner from "../components/LoadingSpinner";

import { useNavigate } from "react-router-dom"; // ✨ useNavigate import
import { openErrorModal } from "../store/modalSlice"; // ✨ openErrorModal import

function ReportPage() {
  const dispatch = useDispatch();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Redux store에서 상태를 가져옵니다.
  const {
    data: reportData,
    status,
    error,
    lastFetched,
  } = useSelector((state) => state.report);

  // 'weekly' 또는 'monthly' 기간 선택을 위한 로컬 상태
  const [period, setPeriod] = useState("weekly");

  // useEffect는 이제 Redux 액션을 dispatch하는 역할만 합니다.
  useEffect(() => {
    // 3일 캐시
    const CACHE_DURATION = 3 * 24 * 60 * 60 * 1000;

    const shouldFetch =
      !reportData || !lastFetched || Date.now() - lastFetched > CACHE_DURATION;

    // currentUser가 있고, 데이터를 불러와야 할 때만 dispatch
    if (currentUser && shouldFetch) {
      dispatch(fetchReportData({ user: currentUser, period }));
    }
  }, [currentUser, period, dispatch, reportData, lastFetched]);

  // ✨ 에러 상태를 처리하는 별도의 useEffect 추가
  useEffect(() => {
    if (status === "failed" && error) {
      // 에러가 발생하면 중앙 에러 모달을 띄웁니다.
      dispatch(openErrorModal(error));
      // 에러 발생 후, 사용자를 이전 페이지(WritePage)로 돌려보냅니다.
      navigate("/write");
    }
  }, [status, error, dispatch, navigate]);

  // 로딩 상태 처리
  if (status === "loading") {
    return <LoadingSpinner message="Generating your emotional report..." />;
  }

  // ✨ 에러가 발생하면 useEffect에서 처리하므로, 여기서는 로딩이 끝났지만 데이터가 없는 경우만 처리합니다.
  if (!reportData || status !== "succeeded") {
    return (
      <div className="text-center p-10">
        Select a period to view your report.
      </div>
    );
  }

  // --- UI 렌더링 부분 ---
  return (
    <div className="bg-stone-900 text-stone-300 min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-amber-400 mb-2">
          Your Emotional Voyage Log
        </h1>
        <p className="text-lg mb-4">
          A look back at your journey from{" "}
          {new Date(reportData.startDate).toLocaleDateString()} to{" "}
          {new Date(reportData.endDate).toLocaleDateString()}.
        </p>

        <EmotionGalaxy galaxyData={reportData.emotionGalaxy} />

        <div className="grid md:grid-cols-2 gap-8 my-8">
          <div className="bg-stone-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-stone-100 mb-4 text-center">
              Your Heart's Compass
            </h2>
            <KeywordCloud words={reportData.keywordCloud} />
          </div>
          <div className="bg-stone-800 p-6 rounded-lg flex flex-col justify-center text-center">
            <h2 className="text-2xl font-semibold text-stone-100 mb-4">
              Lighthouse Message
            </h2>
            <p className="text-lg italic text-stone-300">
              "{reportData.lighthouseMessage}"
            </p>
            {reportData.mainPersona && (
              <p className="text-sm text-stone-400 mt-6">
                - from {reportData.mainPersona.name}
              </p>
            )}
          </div>
        </div>

        <div className="bg-stone-800 p-6 rounded-lg mb-6">
          <h2 className="text-2xl font-semibold text-stone-100 mb-2">
            Journey Theme
          </h2>
          <p className="whitespace-pre-wrap">{reportData.journeyTheme}</p>
        </div>

        <div className="bg-stone-800 p-6 rounded-lg mb-6">
          <h2 className="text-2xl font-semibold text-stone-100 mb-2">
            Brightest Moment (Score: {reportData.brightestMoment.moodScore})
          </h2>
          <p className="italic">"{reportData.brightestMoment.userText}"</p>
        </div>
      </div>
    </div>
  );
}

export default ReportPage;
