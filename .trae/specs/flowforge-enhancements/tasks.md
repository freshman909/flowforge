# FlowForge v1.1 Enhancements - The Implementation Plan (Decomposed and Prioritized Task List)

## [x] Task 1: 科技感UI设计重构
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 使用深色主题配色方案
  - 实现玻璃拟态效果（backdrop-filter）
  - 添加霓虹渐变和发光效果
  - 优化字体选择，使用现代科技感字体
  - 添加平滑的动画和过渡效果
  - 重新设计header、面板和按钮样式
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `human-judgement` TR-1.1: 整体视觉风格具有强烈的科技感/未来感
  - `human-judgement` TR-1.2: 玻璃拟态效果正确实现
  - `human-judgement` TR-1.3: 动画流畅自然，无卡顿
- **Notes**: 使用Tailwind CSS自定义主题配置

## [x] Task 2: 实现节点添加功能
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 在工具栏添加"添加节点"按钮
  - 支持通过点击按钮创建新节点
  - 支持右键菜单添加节点
  - 新节点自动生成唯一ID
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic` TR-2.1: 点击添加按钮后画布上出现新节点
  - `programmatic` TR-2.2: 新节点有唯一的ID
  - `human-judgement` TR-2.3: 右键菜单包含添加节点选项

## [x] Task 3: 实现节点删除功能
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 在工具栏添加"删除节点"按钮
  - 支持Delete/Backspace键删除选中节点
  - 删除节点时同时删除相关连线
  - 支持右键菜单删除节点
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic` TR-3.1: 删除节点后节点从画布消失
  - `programmatic` TR-3.2: 删除节点后相关连线也被删除
  - `programmatic` TR-3.3: 按Delete键可以删除选中节点

## [x] Task 4: 实现API配置界面
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 创建API配置面板组件
  - 支持输入API密钥
  - 支持选择模型类型（GLM-4, GPT-4等）
  - 配置保存到localStorage
  - 修改modelService使用配置的API
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `programmatic` TR-4.1: API密钥输入框可以正常输入
  - `programmatic` TR-4.2: 配置保存后刷新页面仍然存在
  - `programmatic` TR-4.3: modelService正确使用配置的API密钥

## [x] Task 5: 实现多方向连接点
- **Priority**: P1
- **Depends On**: None
- **Description**: 
  - 创建自定义节点组件
  - 在节点的上、下、左、右添加连接点（handle）
  - 配置连接点类型（source/target）
  - 美化连接点样式
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `human-judgement` TR-5.1: 节点四个方向都有可见的连接点
  - `human-judgement` TR-5.2: 可以从任意方向连接节点
  - `human-judgement` TR-5.3: 连接点样式符合科技感设计

## [x] Task 6: 实现连线样式选择
- **Priority**: P1
- **Depends On**: None
- **Description**: 
  - 支持直线（smoothstep）和箭头连线
  - 添加连线属性面板
  - 支持选中连线后修改样式
  - 美化连线和箭头样式
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `human-judgement` TR-6.1: 可以创建直线和箭头两种连线
  - `human-judgement` TR-6.2: 选中连线后可以修改样式
  - `human-judgement` TR-6.3: 连线样式符合科技感设计

## [x] Task 7: 安装并集成自动排版库
- **Priority**: P1
- **Depends On**: None
- **Description**: 
  - 安装dagre或elkjs布局库
  - 创建布局服务模块
  - 实现基本的树形/层级布局算法
- **Acceptance Criteria Addressed**: AC-7
- **Test Requirements**:
  - `programmatic` TR-7.1: 布局库成功安装
  - `programmatic` TR-7.2: 布局服务可以计算节点位置
- **Notes**: 推荐使用dagre，更轻量且适合流程图

## [x] Task 8: 实现层级节点属性
- **Priority**: P1
- **Depends On**: None
- **Description**: 
  - 在节点数据中添加parentId和level属性
  - 在属性面板中添加父节点选择器
  - 支持设置节点层级
  - 可视化显示节点层级关系
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `programmatic` TR-8.1: 节点数据包含parentId和level属性
  - `human-judgement` TR-8.2: 属性面板可以设置父节点
  - `human-judgement` TR-8.3: 节点层级关系可以通过视觉区分

## [x] Task 9: 实现自动排版功能
- **Priority**: P1
- **Depends On**: Task 7, Task 8
- **Description**: 
  - 在工具栏添加"自动排版"按钮
  - 点击后调用布局服务计算节点位置
  - 根据层级关系排列节点
  - 添加平滑的动画过渡
- **Acceptance Criteria Addressed**: AC-7, AC-8
- **Test Requirements**:
  - `human-judgement` TR-9.1: 点击自动排版后流程图整齐排列
  - `human-judgement` TR-9.2: 父子节点按层级分布
  - `programmatic` TR-9.3: 排版响应时间 < 500ms

## [x] Task 10: 集成测试与优化
- **Priority**: P2
- **Depends On**: Task 1-9
- **Description**: 
  - 所有功能集成测试
  - 性能优化
  - Bug修复
  - 最终UI调整
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7, AC-8
- **Test Requirements**:
  - `human-judgement` TR-10.1: 所有功能正常工作
  - `human-judgement` TR-10.2: UI整体协调美观
  - `programmatic` TR-10.3: 无控制台错误
