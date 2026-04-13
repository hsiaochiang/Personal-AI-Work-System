# Project Context

## 專案簡介

本專案目的是建立一套屬於使用者自己的 AI 工作系統，讓知識、偏好與工作方式能跨工具累積，並在同一專案中逐步降低啟動摩擦。

## 核心問題

- 既有提示詞管理系統投入成本高，但沒有真正進入日常工作流
- 提示詞分散在不同工具中，難以共享與演化
- 真正需要累積的是知識、偏好、決策與任務模式，而不是大量 prompt

## 目前版本狀態（2026-04-12）

- **V1–V4** 已完成：單專案知識閉環、多專案管理、跨工具整合、治理自動化
- **V5** 進行中：外部 API 整合，已完成 ChatGPT / Gemini / Claude adapter、AI 輔助提取

## 現有功能範圍

- 多工具對話知識提取（ChatGPT / Gemini / Claude / VS Code Copilot / 純文字）
- AI 輔助提取（Gemini 2.5-flash）
- 知識審核、寫回、自動備份
- 記憶健康度評估、去重建議
- 決策記錄與規則衝突偵測
- Handoff 產生器
- 多專案管理（Projects Hub）
- 治理排程（Governance Scheduler）
- OpenAI API key & Gemini API key 管理

## 目前不在範圍內

- 多使用者協作
- 全自動知識寫入（所有操作需人工確認）
- Gemini / Claude API 批量對話歷史載入
- OAuth 整合

## 關鍵術語

- 核心知識庫：跨工具共用的知識核心
- 專案記憶：單一專案專屬的背景、偏好、規則與決策
- 沉澱：從對話或材料中提取可重用知識並寫入文件
- SKILL：可重用的固定工作流或能力模組
- OpenSpec：本系統採用的 change 管理框架（Proposal → Design → Spec → Tasks → Archive）

## 限制與前提

- 所有寫回操作需人工審核確認
- API Key 本機儲存（server-side `web/api-keys.json`），不進入 git
- 服務運行於 `localhost:3001`（正式區）策
- 沉澱：從對話或材料中提取可重用知識並寫入文件
- SKILL：可重用的固定工作流或能力模組
- OpenSpec：本系統採用的 change 管理框架（Proposal → Design → Spec → Tasks → Archive）

## 限制與前提

- 所有寫回操作需人工審核確認
- API Key 本機儲存（server-side `web/api-keys.json`），不進入 git
- 服務運行於 `localhost:3001`（正式區）
- 系統應優先追求低摩擦與可持續使用

## 已知背景事實

- 使用者過去主要在 ChatGPT、Gemini 中完成工作
- 提示詞後來也延伸到 VS Code、Antigravity
- 使用者希望 AI 隨著資料累積而越來越理解自己的需求與標準
- 使用者希望先強化規劃，降低之後做到一半才推翻的風險

## 尚待釐清

- 個人層知識與共享層知識的正式結構
- 多工具資料來源的整合順序
- 模板檔案的後續細化方式
