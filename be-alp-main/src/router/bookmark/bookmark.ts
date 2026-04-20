/* 
* ALP version 1.0

* Copyright © 2024 kt corp. All rights reserved.

* 

* This is a proprietary software of kt corp, and you may not use this file except in

* compliance with license agreement with kt corp. Any redistribution or use of this

* software, with or without modification shall be strictly prohibited without prior written

* approval of kt corp, and the copyright notice above does not evidence any actual or

* intended publication of such software.

*/

import { Router } from "express";
import * as bookmarkController from "@/controller/bookmark/bookmark";
import { createValidationMiddleware } from "@/middlewares/validatorMiddleware";

const router = Router();

/**
 * @swagger
 * /bookmark/{groupId}:
 *   get:
 *     tags:
 *       - bookmark
 *     summary: 북마크 폴더 별 북마크 데이터 조회
 *     parameters:
 *       - name: groupId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: "폴더 아이디"
 *     responses:
 *       200:
 *         description: Successful response with aggregated data
 *       500:
 *         description: Internal server error
 */
router.get("/:groupId", bookmarkController.getBookmarkDataByGroupId);

/**
 * @swagger
 * /bookmark:
 *   post:
 *     tags:
 *       - bookmark
 *     summary: 북마크 생성
 *     requestBody:
 *       description: 차트데이터
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              $ref: "#/components/schemas/BookmarkParams"
 *     responses:
 *       200:
 *         description: Successful response with aggregated data
 *       500:
 *         description: Internal server error
 */
router.post("/", bookmarkController.createBookmark);

/**
 * @swagger
 * /bookmark:
 *   delete:
 *     tags:
 *       - bookmark
 *     summary: 북마크 삭제
 *     requestBody:
 *       description: 차트데이터
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              $ref: "#/components/schemas/Bookmark"
 *     responses:
 *       200:
 *         description: Successful response with aggregated data
 *       500:
 *         description: Internal server error
 */
router.delete("/", bookmarkController.deleteBookmark);

/**
 * @swagger
 * /bookmark:
 *   put:
 *     tags:
 *       - bookmark
 *     summary: 북마크
 *     requestBody:
 *       description: 차트데이터
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              $ref: "#/components/schemas/Bookmark"
 *     responses:
 *       200:
 *         description: Successful response with aggregated data
 *       500:
 *         description: Internal server error
 */
router.put("/", bookmarkController.moveBookmark);

export default router;
