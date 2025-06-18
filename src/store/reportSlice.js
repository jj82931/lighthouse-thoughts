import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getFunctions, httpsCallable } from "firebase/functions";
import app from "../services/firebase";

// 비동기 작업을 위한 createAsyncThunk 생성
export const fetchReportData = createAsyncThunk(
  "report/fetchData",
  async ({ user, period }, { rejectWithValue }) => {
    try {
      const token = await user.getIdToken();
      const functions = getFunctions(app, "australia-southeast2");
      const generateReportFunction = httpsCallable(functions, "generatereport");
      const result = await generateReportFunction({ period });
      return result.data;
    } catch (error) {
      // ✨ 더 구체적인 에러 메시지를 반환하도록 수정
      const errorMessage =
        error.message || "An unknown error occurred while fetching the report.";
      return rejectWithValue(errorMessage);
    }
  }
);

const reportSlice = createSlice({
  name: "report",
  initialState: {
    data: null,
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    lastFetched: null, // 마지막으로 데이터를 가져온 시간
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReportData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchReportData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
        state.lastFetched = Date.now(); // 가져온 시간 기록
      })
      .addCase(fetchReportData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default reportSlice.reducer;
