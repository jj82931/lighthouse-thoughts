import React, { useState } from "react"; // 툴팁 상태 관리를 위해 useState 사용
import { useDispatch } from "react-redux";
import { openPersonaDetailModal } from "../store/modalSlice"; // 액션 import

function PersonaSelection({
  personas,
  selectedPersona,
  onPersonaSelect,
  onIconClick,
  layoutDirection = "horizontal",
}) {
  const [showPersonaTooltip, setShowPersonaTooltip] = useState(null); // 툴팁으로 보여줄 페르소나 ID
  const dispatch = useDispatch();

  const handleIconClick = (persona) => {
    // ✨ 아이콘 클릭 시, Redux 모달을 열도록 변경
    dispatch(
      openPersonaDetailModal({
        persona: persona,
        // ✨ onConfirmSelect 콜백으로 onPersonaSelect(persona.id)를 직접 실행하는 함수를 전달
        // App.jsx의 모달에서 이 콜백을 직접 호출할 수 있도록.
        // 하지만 이 방식은 App.jsx가 WritePage의 함수를 직접 알아야 하므로 좋지 않음.
        // 대신, App.jsx 모달의 Select 버튼이 다른 액션을 디스패치하도록 하고,
        // 그 액션을 WritePage에서 구독하여 selectedPersona를 변경하는 것이 더 Redux 스러움.
        //
        // 여기서는 더 간단한 접근:
        // 모달은 정보만 보여주고, 실제 선택은 WritePage의 onPersonaSelect가 담당.
        // 모달의 Select 버튼은 단순히 모달을 닫고, 사용자가 아이콘을 클릭했을 때
        // onPersonaSelect가 호출되도록 하는 현재 로직을 유지하거나,
        // 모달의 Select 버튼이 최종 확정하도록 변경.
        //
        // "최종 확정" 방식으로 변경:
        // 아이콘 클릭 시에는 onPersonaSelect를 호출하지 않고, 모달만 연다.
      })
    );
    onIconClick(persona); // ✨ 부모로부터 받은 onIconClick 호출
    setShowPersonaTooltip(null); // 툴팁은 닫음
  };

  const containerClasses =
    layoutDirection === "vertical"
      ? "flex flex-col space-y-3 items-center" // 세로 배치
      : "flex space-x-3 items-center relative"; // 가로 배치 (기존)

  return (
    <div className="mb-4">
      <div className={containerClasses}>
        {" "}
        {/* ✨ items-center 추가 */}
        {personas.map((persona) => (
          <div key={persona.id} className="relative">
            <button
              type="button"
              onClick={() => handleIconClick(persona)} // ✨ 부모로부터 받은 onPersonaSelect 직접 호출
              onMouseEnter={() => setShowPersonaTooltip(persona.id)}
              onMouseLeave={() => setShowPersonaTooltip(null)}
              className={`p-2 rounded-full transition-all duration-200 ease-in-out
                ${
                  selectedPersona === persona.id
                    ? `${persona.bgColor} ring-2 ring-offset-2 ring-offset-stone-800 
                    ${persona.color.replace("text-", "ring-")}`
                    : "bg-stone-700 hover:bg-stone-600"
                }
              `}
              aria-label={`Select ${persona.name}`}
            >
              <img
                src={persona.icon}
                alt={`${persona.name} icon`}
                className="w-8 h-8 rounded-full object-cover"
              />
            </button>

            {/* ✨ 툴팁은 간단히히*/}
            {showPersonaTooltip === persona.id && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 
                bg-stone-700 border border-stone-600 rounded-md shadow-lg z-30 text-xs text-stone-200 whitespace-nowrap"
                // 툴팁 클릭 막기
                onClick={(e) => e.stopPropagation()}
              >
                {persona.name.split(",")[0]} {/* 간단한 이름만 표시 */}
              </div>
            )}
          </div>
        ))}
        {/* 기본 AI로 돌아가는 버튼 (선택적) */}
        {selectedPersona && layoutDirection === "horizontal" && (
          <button
            onClick={() => onPersonaSelect(null)} // ✨ 부모의 onPersonaSelect 호출 (null 전달)
            className="ml-2 p-2 text-xs text-stone-400 hover:text-stone-200 underline" // ✨ ml-2 추가로 간격 조정
            title="Use Default AI Analyzer"
          >
            Default AI
          </button>
        )}
      </div>
    </div>
  );
}

export default PersonaSelection;
