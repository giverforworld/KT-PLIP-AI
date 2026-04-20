import { Router } from "express";
import * as aiController from "@/controller/ai/aiController";

const router = Router();

/**
 * @swagger
 * /ai/report:
 *   post:
 *     tags:
 *       - 9. AI
 *     summary: AI 분석 리포트 생성 (스트리밍)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *               - title
 *             properties:
 *               data:
 *                 type: object
 *                 description: "차트 데이터 (DataContainer의 charts, summary 등)"
 *               title:
 *                 type: string
 *                 description: "리포트 제목"
 *               regionName:
 *                 type: string
 *                 description: "분석 지역명"
 *               period:
 *                 type: string
 *                 description: "분석 기간"
 *               dataType:
 *                 type: string
 *                 description: "데이터 유형 (ALP/MOP/LLP)"
 *     responses:
 *       200:
 *         description: SSE 스트리밍 응답 (text/event-stream)
 *       400:
 *         description: 필수 파라미터 누락
 *       500:
 *         description: Internal server error
 */
router.post("/report", aiController.postAiReport);

export default router;
