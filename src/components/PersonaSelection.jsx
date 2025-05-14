// src/components/PersonaSelection.jsx
import React, { useState } from "react"; // 툴팁 상태 관리를 위해 useState 사용

// ✨ 아이콘 컴포넌트 임시 정의 (실제 아이콘으로 교체 필요)
const PersonaIconPlaceholder = ({ char, color }) => (
  <span className={`text-2xl ${color}`}>{char}</span>
);

function PersonaSelection({
  personas,
  selectedPersona,
  onPersonaSelect,
  layoutDirection = "horizontal",
}) {
  const [showPersonaTooltip, setShowPersonaTooltip] = useState(null); // 툴팁으로 보여줄 페르소나 ID

  const handleSelectFromTooltip = (personaId) => {
    onPersonaSelect(personaId);
    setShowPersonaTooltip(null);
  };

  const containerClasses =
    layoutDirection === "vertical"
      ? "flex flex-col space-y-3 items-center" // 세로 배치
      : "flex space-x-3 items-center relative"; // 가로 배치 (기존)

  const tooltipPositionClasses =
    layoutDirection === "vertical"
      ? "absolute left-full top-1/2 -translate-y-1/2 ml-2" // 세로 배치 시 툴팁 오른쪽
      : "absolute top-full left-1/2 -translate-x-1/2 mt-2"; // 가로 배치 시 툴팁 아래쪽

  return (
    <div className="mb-4">
      <div className={containerClasses}>
        {" "}
        {/* ✨ items-center 추가 */}
        {personas.map((persona) => (
          <div key={persona.id} className="relative">
            <button
              type="button"
              onClick={() => onPersonaSelect(persona.id)} // ✨ 부모로부터 받은 onPersonaSelect 직접 호출
              onMouseEnter={() => setShowPersonaTooltip(persona.id)}
              onMouseLeave={() => setShowPersonaTooltip(null)}
              className={`p-2 rounded-full transition-all duration-200 ease-in-out
                ${
                  selectedPersona === persona.id
                    ? `${persona.bgColor} ring-2 ring-offset-2 ring-offset-stone-800 ${persona.color.replace("text-", "ring-")}`
                    : "bg-stone-700 hover:bg-stone-600"
                }
              `}
              aria-label={`Select ${persona.name}`}
            >
              <PersonaIconPlaceholder
                char={persona.iconPlaceholder}
                color={
                  selectedPersona === persona.id
                    ? persona.color
                    : "text-stone-400"
                }
              />
            </button>

            {/* 페르소나 설명 툴팁/팝오버 */}
            {showPersonaTooltip === persona.id && (
              <div
                className={`${tooltipPositionClasses} absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-3 bg-stone-700 border border-stone-600 rounded-lg shadow-xl z-30 text-xs`}
                onClick={(e) => e.stopPropagation()} // 툴팁 클릭 시 이벤트 전파 방지
              >
                <h4 className={`font-semibold mb-1 ${persona.color}`}>
                  {persona.name}
                </h4>
                <p className="text-stone-300 mb-2 whitespace-pre-line">
                  {persona.description}
                </p>
                <button
                  onClick={() => handleSelectFromTooltip(persona.id)} // ✨ 수정된 핸들러
                  className={`w-full px-3 py-1.5 text-xs font-medium rounded ${persona.bgColor} ${persona.color.includes("white") || persona.color.includes("black") ? persona.color : "text-white"} hover:opacity-80`}
                >
                  Chat with {persona.name.split(",")[0]}
                </button>
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
