import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  { languageOptions: { globals: globals.node } }, // Node.js 환경
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // 필요한 경우 규칙 추가 또는 비활성화
      "no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "off", // any 타입 사용 경고 끄기 (필요시)
    },
  },
  {
    ignores: ["lib/**"], // 빌드 결과물인 lib 폴더는 린트에서 제외
  },
];
