import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/Auth";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../services/firebase";
import { FaXTwitter, FaInstagram, FaGithub } from "react-icons/fa6"; // ✨ FaXTwitter 사용

// Framer Motion Variants
const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.15,
    },
  }, // staggerChildren 추가
};

const itemVariants = {
  // CTA 요소들을 위한 variants
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const footerItemVariants = {
  // 푸터 요소들을 위한 variants (약간 다른 딜레이나 효과)
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

function FinalCTASection() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleGoogleLogin = async () => {
    if (currentUser) {
      navigate("/write");
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate("/write");
    } catch (error) {
      console.error("Google 로그인 에러 (CTA):", error);
    }
  };

  // ✨ 소셜 링크 데이터
  const socialLinks = [
    { name: "X (Twitter)", href: "YOUR_X_URL_HERE", icon: FaXTwitter },
    { name: "Instagram", href: "YOUR_INSTAGRAM_URL_HERE", icon: FaInstagram },
    { name: "GitHub", href: "https://github.com/jj82931", icon: FaGithub },
  ];

  return (
    <motion.section
      id="final-cta"
      className="bg-stone-800 py-16 sm:py-20"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="max-w-2xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-100"
          variants={itemVariants}
        >
          Ready to Start Your Journey?
        </motion.h2>
        <motion.p
          className="mt-4 text-lg text-stone-300"
          variants={itemVariants}
        >
          Join Lighthouse Thoughts today and discover a new path to
          self-understanding and emotional well-being.
        </motion.p>
        <motion.div className="mt-8" variants={itemVariants}>
          <button
            onClick={handleGoogleLogin}
            className="inline-flex items-center justify-center px-8 py-3 sm:px-10 sm:py-3 border border-transparent text-base sm:text-lg font-medium rounded-lg text-stone-900 bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-800 focus:ring-amber-500 transition-colors shadow-lg hover:shadow-xl"
          >
            {currentUser ? "Go to Your Diary" : "Sign Up with Google"}
            {!currentUser && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 ml-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            )}
          </button>
        </motion.div>
      </div>

      {/* --- 푸터 내용 (CTA 섹션에 통합) --- */}
      <motion.div // ✨ 푸터 영역도 등장 애니메이션 적용
        className="mt-16 sm:mt-20 border-t border-stone-700 pt-8 text-center"
        variants={footerItemVariants} // ✨ 다른 variants 또는 부모의 staggerChildren 활용
      >
        <div className="flex justify-center space-x-6 mb-4">
          {socialLinks.map((link) => (
            <motion.a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-400 hover:text-amber-400 transition-colors" // ✨ 호버 시 강조색으로 변경
              whileHover={{ scale: 1.1 }} // ✨ 호버 시 살짝 커지는 효과
              variants={footerItemVariants} // ✨ 개별 아이콘 등장 애니메이션
            >
              <link.icon className="w-6 h-6" /> {/* 아이콘 크기 조절 */}
              <span className="sr-only">{link.name}</span>
            </motion.a>
          ))}
        </div>
        <motion.p
          className="text-xs text-stone-500"
          variants={footerItemVariants}
        >
          © {new Date().getFullYear()} Lighthouse Thoughts. All rights
          reserved.
        </motion.p>
      </motion.div>
      {/* ------------------------------------ */}
    </motion.section>
  );
}

export default FinalCTASection;
