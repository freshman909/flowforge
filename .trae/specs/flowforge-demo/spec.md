# FlowForge Demo - Product Requirement Document

## Overview
- **Summary**: FlowForge是一个通过流程图直接驱动可交互多页面应用一键生成的工具，将原型验证周期从天级缩短至分钟级。
- **Purpose**: 解决产品经理和开发者在原型验证过程中的痛点，通过流程图可视化和AI代码生成，快速创建可交互的web应用原型。
- **Target Users**: AI产品经理/效率工具产品经理、游戏系统策划、独立开发者/创业者。

## Goals
- 实现基础的流程图编辑器，支持节点拖拽和连线
- 集成GLM模型进行代码生成，并设计兼容其他大模型的接口
- 实现基本的预览和代码下载功能
- 创建一个可运行的demo版本

## Non-Goals (Out of Scope)
- 完整的用户认证系统
- 复杂的条件分支逻辑
- 多框架支持（仅支持React）
- 一键部署功能
- 高级的响应式设计

## Background & Context
- 基于现有的PRD文档，需要快速创建一个demo版本
- 优先使用GLM模型，同时设计可扩展的模型接口
- 前端使用React + Tailwind CSS + React Flow

## Functional Requirements
- **FR-1**: 流程图编辑器，支持节点拖拽、连线和基本画布操作
- **FR-2**: 页面配置功能，支持输入页面描述和全局样式设置
- **FR-3**: AI代码生成功能，使用GLM模型生成React组件代码
- **FR-4**: 在线预览功能，展示生成的页面
- **FR-5**: 代码下载功能，打包生成的React项目

## Non-Functional Requirements
- **NFR-1**: 流程图解析时间 < 1s
- **NFR-2**: 首屏页面生成时间 < 15s
- **NFR-3**: 生成成功率 > 95%（单页面结构描述清晰前提下）
- **NFR-4**: 安全性，用户输入需经过敏感词过滤，生成的代码在沙箱环境执行

## Constraints
- **Technical**: React + Tailwind CSS + React Flow，优先使用GLM模型
- **Business**: 快速创建demo版本，重点展示核心功能
- **Dependencies**: GLM API，React Flow库

## Assumptions
- 用户已经拥有GLM API密钥
- 前端开发环境已经配置好
- 网络连接稳定，能够访问GLM API

## Acceptance Criteria

### AC-1: 流程图编辑器功能
- **Given**: 用户进入编辑器页面
- **When**: 用户从节点库拖拽节点到画布并连线
- **Then**: 系统正确显示流程图，支持基本的画布操作
- **Verification**: `human-judgment`

### AC-2: 页面配置功能
- **Given**: 用户选择一个流程图节点
- **When**: 用户输入页面描述和全局样式设置
- **Then**: 系统保存配置信息
- **Verification**: `human-judgment`

### AC-3: AI代码生成功能
- **Given**: 用户点击生成按钮
- **When**: 系统调用GLM API生成代码
- **Then**: 系统成功生成React组件代码
- **Verification**: `programmatic`

### AC-4: 在线预览功能
- **Given**: 代码生成完成
- **When**: 用户点击预览按钮
- **Then**: 系统显示生成的页面，支持基本的交互
- **Verification**: `human-judgment`

### AC-5: 代码下载功能
- **Given**: 代码生成完成
- **When**: 用户点击下载按钮
- **Then**: 系统打包并提供下载链接
- **Verification**: `programmatic`

## Open Questions
- [ ] GLM API的具体调用方式和参数
- [ ] 如何设计兼容其他大模型的接口
- [ ] 代码生成的具体模板和格式
- [ ] 预览环境的安全性保障措施