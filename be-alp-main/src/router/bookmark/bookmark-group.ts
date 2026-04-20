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
import * as bookmarkGroupController from "@/controller/bookmark/bookmarkGroup";

const router = Router();

/**
 * @swagger
 * /bookmark-group:
 *   get:
 *     tags:
 *       - bookmark
 *     summary: 북마크 전체 데이터
 *     responses:
 *       200:
 *         description: Successful response with aggregated data
 *       500:
 *         description: Internal server error
 */
router.get("/", bookmarkGroupController.getBookmarkGroupList);

/**
 * @swagger
 * /bookmark-group:
 *   post:
 *     tags:
 *       - bookmark
 *     summary: 북마크 폴더 생성
 *     requestBody:
 *       description: 북마크 폴더
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              $ref: "#/components/schemas/Bookmarkgroup"
 *     responses:
 *       200:
 *         description: Successful response with aggregated data
 *       500:
 *         description: Internal server error
 */
router.post("/", bookmarkGroupController.createBookmarkGroup);

/**
 * @swagger
 * /bookmark-group:
 *   put:
 *     tags:
 *       - bookmark
 *     summary: 북마크 폴더 편집
 *     requestBody:
 *       description: 북마크 폴더
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              $ref: "#/components/schemas/Bookmarkgroup"
 *     responses:
 *       200:
 *         description: Successful response with aggregated data
 *       500:
 *         description: Internal server error
 */
router.put("/", bookmarkGroupController.updateBookmarkGroup);

/**
 * @swagger
 * /bookmark-group/{groupId}:
 *   delete:
 *     tags:
 *       - bookmark
 *     summary: 북마크 폴더 삭제
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
router.delete("/:groupId", bookmarkGroupController.deleteBookmarkGroup);

export default router;
