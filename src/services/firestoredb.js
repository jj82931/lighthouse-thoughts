import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "./firebase.js"

export async function getUserDiaries(userid, sortBy = 'createdAtDesc', count = 30) {

    if(!userid){
        console.error("getUserDiaries: Need userId.");
        return []; // userId 없으면 빈 배열 반환
    }

    try {
        const diariesCollectionRef = collection(db, "users", userid, "diaries");
        let qr;
        switch(sortBy){
            case 'createdAtAsc':
                qr = query(diariesCollectionRef, orderBy("createdAt", "asc"), limit(count));
                break;
            case 'moodScoreDesc':
                qr = query(diariesCollectionRef, orderBy("moodScore", "desc"), orderBy("createdAt", "desc"), limit(count));
                break;
            case 'moodScoreAsc':
                qr = query(diariesCollectionRef, orderBy("moodScore", "asc"), orderBy("createdAt", "desc"), limit(count));
                break;
            case 'createdAtDesc': // 기본값
                default:                    
                qr = query(diariesCollectionRef, orderBy("createdAt", "desc"), limit(count));
                break;
        }

        const querySnapshot = await getDocs(qr); //쿼리 실행하여 스냅샷 가져오기
        const diaries = [];
        querySnapshot.forEach((doc) => {
            diaries.push({
                id: doc.id, // 문서 ID 포함
                ...doc.data() // 문서 데이터 전체 포함
            });
        });
        console.log(`getUserDiaries: Completed load (${sortBy}): ${diaries.length} documents`);

        return diaries;

        
    } catch (error) {
        console.error("Firestore에서 일기 목록 가져오기 오류:", error);
        return []; // 오류 발생 시 빈 배열 반환
    }
    
}