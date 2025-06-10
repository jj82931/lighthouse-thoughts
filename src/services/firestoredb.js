import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  deleteDoc,
  startAfter,
} from "firebase/firestore";
import { db } from "./firebase.js";

export async function getUserDiaries(userid, count = 10, lastDoc = null) {
  if (!userid) {
    console.error("getUserDiaries: Need userId.");
    return { diaries: [], lastVisible: null }; // 반환 형식 통일
  }

  try {
    const diariesCollectionRef = collection(db, "users", userid, "diaries");
    let qr;
    // 항상 createdAt 기준으로 정렬 (기본: 최신순)
    const baseQuery = query(
      diariesCollectionRef,
      orderBy("createdAt", "desc"),
      limit(count)
    );

    // 페이지네이션 시작점 적용
    if (lastDoc) {
      qr = query(baseQuery, startAfter(lastDoc)); // lastDoc 스냅샷 직접 사용
    } else {
      qr = baseQuery; // 첫 페이지
    }
    const querySnapshot = await getDocs(qr); //쿼리 실행하여 스냅샷 가져오기
    const diaries = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      diaries.push({
        id: doc.id, // 문서 ID 포함
        ...doc.data(), // 문서 데이터 전체 포함
        createdAt: data.createdAt?.toDate().getTime() || null, // null일 경우 대비
        updatedAt: data.updatedAt?.toDate().getTime() || null,
      });
    });
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    console.log(`getUserDiaries: Completed load ${diaries.length} documents`);
    return { diaries, lastVisible: lastVisible || null };
  } catch (error) {
    console.error("loading diaries error from firestore:", error);
    return { diaries: [], lastVisible: null };
  }
}

export async function updateDiaryEntry(userId, diaryId, updatedData) {
  if (!userId || !diaryId) {
    console.error("updateDiaryEntry: Need userid and diaryid.");
    // 에러를 throw하여 호출한 쪽에서 처리하도록 함
    throw new Error("Missig user id and diary id to update diary");
  }
  try {
    // 업데이트할 문서의 참조(DocumentReference) 만들고 firestore 경로는 'users/{userId}/diaries/{diaryId}'
    const diaryDocRef = doc(db, "users", userId, "diaries", diaryId);
    /* 수정시간 firestore 에 추가해야됨됨 */
    // 업데이트할 데이터에 수정 시간(updatedAt) 필드 추가
    const dataToUpdate = {
      ...updatedData, // 전달받은 업데이트 데이터 (예: { userText: "..." })
      updatedAt: serverTimestamp(), // 수정 시간 기록
    };
    await updateDoc(diaryDocRef, dataToUpdate); //updateDoc 함수를 사용하여 문서 업데이트

    console.log(`Successfully updated firestore ${diaryId}`);
  } catch (error) {
    console.error(
      `Update error documentation of Firestore  (ID: ${diaryId}):`,
      error
    );
    throw new Error("Diary updating Error occured ");
  }
}

export async function deleteDiaryEntry(userId, diaryId) {
  if (!userId || !diaryId) {
    console.error("deleteDiaryEntry: Need userid and diaryid");
    throw new Error("Missig user id and diary id to delete diary");
  }
  try {
    const diaryDocRef = doc(db, "users", userId, "diaries", diaryId);
    await deleteDoc(diaryDocRef);
  } catch (error) {
    console.error(
      `deletion error documentation of Firestore (ID: ${diaryId}):`,
      error
    );
    throw new Error("Diary deleting Error occured");
  }
}
