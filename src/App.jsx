import { useState, useCallback, useEffect, useRef } from 'react';
import { ReactFlow, addEdge, useNodesState, useEdgesState, MarkerType } from '@reactflow/core';
import { Controls } from '@reactflow/controls';
import { MiniMap } from '@reactflow/minimap';
import CustomNode from './components/CustomNode';
import { CodeGenerationService, ConfigManager, DEFAULT_CONFIG } from './services/modelService';
import { LayoutService } from './services/layoutService';
import '@reactflow/core/dist/style.css';
import '@reactflow/controls/dist/style.css';
import '@reactflow/minimap/dist/style.css';
import './App.css';

const nodeTypes = {
  custom: CustomNode,
};

function App() {
  const reactFlowWrapper = useRef(null);
  
  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: '1',
      type: 'custom',
      data: { label: '开始', description: '', parentId: null, level: 0 },
      position: { x: 250, y: 50 },
    },
    {
      id: '2',
      type: 'custom',
      data: { label: '页面1', description: '', parentId: '1', level: 1 },
      position: { x: 250, y: 150 },
    },
    {
      id: '3',
      type: 'custom',
      data: { label: '页面2', description: '', parentId: '2', level: 2 },
      position: { x: 250, y: 250 },
    },
    {
      id: '4',
      type: 'custom',
      data: { label: '结束', description: '', parentId: '3', level: 3 },
      position: { x: 250, y: 350 },
    },
  ]);

  const [edges, setEdges, onEdgesChange] = useEdgesState([
    { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e2-3', source: '2', target: '3', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e3-4', source: '3', target: '4', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  ]);

  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  
  // API配置状态
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [apiConfig, setApiConfig] = useState(ConfigManager.getConfig());
  const [tempApiKey, setTempApiKey] = useState('');
  const [tempModelType, setTempModelType] = useState('glm');
  const [tempModelName, setTempModelName] = useState('glm-4');
  
  // 代码生成服务引用
  const codeGenServiceRef = useRef(null);

  const addNode = () => {
    const newNodeId = Date.now().toString();
    const centerPosition = { x: 300, y: 200 };

    const newNode = {
      id: newNodeId,
      type: 'custom',
      data: { label: '新节点', description: '', parentId: null, level: 0 },
      position: centerPosition,
    };

    setNodes((nds) => nds.concat(newNode));
  };

  const deleteSelectedNode = useCallback(() => {
    if (!selectedNode) return;

    setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
    setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
    setSelectedNode(null);
  }, [selectedNode, setNodes, setEdges]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        deleteSelectedNode();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [deleteSelectedNode]);
  const [globalStyles, setGlobalStyles] = useState({
    themeColor: '#00ffff',
    fontFamily: 'sans-serif',
    borderRadius: 4
  });
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false);

  // 初始化代码生成服务
  useEffect(() => {
    const config = ConfigManager.getConfig();
    setApiConfig(config);
    setTempApiKey(config.apiKey);
    setTempModelType(config.modelType);
    setTempModelName(config.modelName);
    codeGenServiceRef.current = new CodeGenerationService(config.modelType, {
      apiKey: config.apiKey,
      modelName: config.modelName
    });
  }, []);

  // 保存配置
  const saveConfig = () => {
    const newConfig = {
      apiKey: tempApiKey,
      modelType: tempModelType,
      modelName: tempModelName
    };
    ConfigManager.setConfig(newConfig);
    setApiConfig(newConfig);
    if (codeGenServiceRef.current) {
      codeGenServiceRef.current.updateConfig(tempModelType, {
        apiKey: tempApiKey,
        modelName: tempModelName
      });
    }
    setShowConfigModal(false);
  };

  // 重置配置
  const resetConfig = () => {
    const defaultConfig = ConfigManager.resetConfig();
    setApiConfig(defaultConfig);
    setTempApiKey(defaultConfig.apiKey);
    setTempModelType(defaultConfig.modelType);
    setTempModelName(defaultConfig.modelName);
    if (codeGenServiceRef.current) {
      codeGenServiceRef.current.updateConfig(defaultConfig.modelType, {
        apiKey: defaultConfig.apiKey,
        modelName: defaultConfig.modelName
      });
    }
  };

  // 打开配置模态框
  const openConfigModal = () => {
    setTempApiKey(apiConfig.apiKey);
    setTempModelType(apiConfig.modelType);
    setTempModelName(apiConfig.modelName);
    setShowConfigModal(true);
  };

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed }
    }, eds)),
    []
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  const onEdgeClick = useCallback((event, edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  const updateEdgeStyle = (edgeId, newType, hasArrow) => {
    setEdges((eds) => eds.map((e) => {
      if (e.id === edgeId) {
        return {
          ...e,
          type: newType,
          markerEnd: hasArrow ? { type: MarkerType.ArrowClosed } : undefined,
        };
      }
      return e;
    }));
  };

  const updateNodeDescription = (description) => {
    if (selectedNode) {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === selectedNode.id
            ? { ...node, data: { ...node.data, description } }
            : node
        )
      );
    }
  };

  const updateGlobalStyle = (key, value) => {
    setGlobalStyles((styles) => ({ ...styles, [key]: value }));
  };

  const autoLayout = useCallback(() => {
    const startTime = performance.now();
    const layoutedNodes = LayoutService.calculateLayout(nodes, edges);
    
    const animateNodes = layoutedNodes.map((node, index) => {
      return {
        ...node,
        position: node.position,
        data: { ...node.data }
      };
    });
    
    setNodes(animateNodes);
    
    const endTime = performance.now();
    console.log(`自动排版完成，耗时: ${endTime - startTime}ms`);
  }, [nodes, edges, setNodes]);

  // 生成代码
  const generateCode = async () => {
    if (!selectedNode || !selectedNode.data.description) {
      setError('请选择一个节点并输入页面描述');
      return;
    }

    if (!codeGenServiceRef.current) {
      setError('代码生成服务未初始化，请检查API配置');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const code = await codeGenServiceRef.current.generatePageCode(
        selectedNode.data.description,
        globalStyles
      );
      setGeneratedCode(code);
    } catch (err) {
      setError(`生成代码失败: ${err.message}`);
      console.error('代码生成失败:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // 生成预览HTML
  const generatePreviewHtml = () => {
    if (!generatedCode) return '';

    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: '${globalStyles.themeColor}',
          },
          fontFamily: {
            sans: ['${globalStyles.fontFamily}', 'sans-serif'],
          },
        },
      }
    }
  </script>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    import React from 'https://cdn.skypack.dev/react';
    import ReactDOM from 'https://cdn.skypack.dev/react-dom/client';

    ${generatedCode}

    ReactDOM.createRoot(document.getElementById('root')).render(
      React.createElement(GeneratedPage)
    );
  </script>
</body>
</html>
`;
  };

  // 处理预览
  const handlePreview = () => {
    setShowPreview(true);
  };

  // 处理代码下载
  const handleDownload = () => {
    if (!generatedCode) return;

    // 生成完整的React项目结构
    const projectFiles = {
      'package.json': `{
  "name": "flowforge-generated-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    "eslint": "^8.57.0",
    "eslint-plugin-react": "^7.34.1",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.6",
    "vite": "^5.2.0"
  }
}`,
      'vite.config.js': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})`,
      'index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FlowForge Generated App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
      'src/main.jsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
      'src/App.jsx': generatedCode,
      'src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light;
  color: #213547;
  background-color: #ffffff;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  min-width: 320px;
  min-height: 100vh;
}
`
    };

    // 创建一个简单的HTML文件，包含所有代码
    const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FlowForge Generated Code</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #0a0a1a; color: white; }
    .file { margin-bottom: 20px; }
    .file-name { font-weight: bold; margin-bottom: 5px; color: #00ffff; }
    .file-content { background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; overflow-x: auto; border: 1px solid rgba(0,255,255,0.2); }
    pre { margin: 0; color: #8b5cf6; }
  </style>
</head>
<body>
  <h1 style="color: #00ffff; margin-bottom: 20px;">FlowForge Generated Code</h1>
  <p style="color: rgba(255,255,255,0.7);">This is the code generated by FlowForge. To use it, create a new React project and replace the files with the content below.</p>
  
  ${Object.entries(projectFiles).map(([fileName, content]) => `
    <div class="file">
      <div class="file-name">${fileName}</div>
      <div class="file-content">
        <pre>${content}</pre>
      </div>
    </div>
  `).join('')}
</body>
</html>
`;

    // 创建Blob对象并下载
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flowforge-generated-code.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };



  return (
    <div className="App">
      <header className="App-header">
        <h1>FlowForge Demo</h1>
        <p>流程图编辑器</p>
      </header>
      <div className="main-content">
        <div className="flow-container" ref={reactFlowWrapper}>
          <div className="toolbar" style={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 1000,
            display: 'flex',
            gap: '10px',
            background: 'rgba(10, 10, 26, 0.9)',
            padding: '10px',
            borderRadius: '12px',
            border: '1px solid rgba(0, 255, 255, 0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            <button
              onClick={addNode}
              style={{
                background: 'linear-gradient(135deg, #00ffff 0%, #8b5cf6 100%)',
                color: '#0a0a1a',
                fontWeight: '700',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.boxShadow = 'none';
              }}
            >
              添加节点
            </button>
            <button
              onClick={deleteSelectedNode}
              disabled={!selectedNode}
              style={{
                background: selectedNode ? 'linear-gradient(135deg, #f472b6 0%, #8b5cf6 100%)' : 'rgba(255, 255, 255, 0.1)',
                color: selectedNode ? '#0a0a1a' : 'rgba(255, 255, 255, 0.4)',
                fontWeight: '700',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: selectedNode ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (selectedNode) {
                  e.target.style.boxShadow = '0 0 20px rgba(244, 114, 182, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.boxShadow = 'none';
              }}
            >
              删除节点
            </button>
            <button
              onClick={autoLayout}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #00ffff 100%)',
                color: '#0a0a1a',
                fontWeight: '700',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.boxShadow = 'none';
              }}
            >
              自动排版
            </button>
            <button
              onClick={openConfigModal}
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                color: '#00ffff',
                fontWeight: '700',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(0, 255, 255, 0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(0, 255, 255, 0.1)';
                e.target.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(0, 0, 0, 0.3)';
                e.target.style.boxShadow = 'none';
              }}
            >
              API配置
            </button>
          </div>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            nodeTypes={nodeTypes}
            fitView
            onPaneClick={() => {
              setSelectedNode(null);
              setSelectedEdge(null);
            }}
          >
            <Controls className="!bg-opacity-80 !backdrop-blur-xl !border-cyan-500/30" />
            <MiniMap 
              className="!bg-opacity-80 !backdrop-blur-xl !border-cyan-500/30"
              nodeColor={(node) => {
                if (node.type === 'input') return '#00ffff';
                if (node.type === 'output') return '#8b5cf6';
                return '#f472b6';
              }}
            />
          </ReactFlow>
        </div>
        <div className="properties-panel">
          <h3>属性面板</h3>
          {selectedNode ? (
            <div className="node-properties">
              <h4>节点配置</h4>
              <div className="form-group">
                <label>节点名称</label>
                <input
                  type="text"
                  value={selectedNode.data.label}
                  onChange={(e) => {
                    setNodes((nds) =>
                      nds.map((node) =>
                        node.id === selectedNode.id
                          ? { ...node, data: { ...node.data, label: e.target.value } }
                          : node
                      )
                    );
                  }}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>页面描述</label>
                <textarea
                  value={selectedNode.data.description || ''}
                  onChange={(e) => updateNodeDescription(e.target.value)}
                  placeholder="输入页面描述..."
                  className="form-control"
                  rows={4}
                />
              </div>
              <div className="form-group">
                <label>层级</label>
                <input
                  type="number"
                  value={selectedNode.data.level || 0}
                  onChange={(e) => {
                    const newLevel = parseInt(e.target.value) || 0;
                    setNodes((nds) =>
                      nds.map((node) =>
                        node.id === selectedNode.id
                          ? { ...node, data: { ...node.data, level: newLevel } }
                          : node
                      )
                    );
                    setSelectedNode({
                      ...selectedNode,
                      data: { ...selectedNode.data, level: newLevel }
                    });
                  }}
                  min="0"
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>父节点</label>
                <select
                  value={selectedNode.data.parentId || ''}
                  onChange={(e) => {
                    const newParentId = e.target.value || null;
                    setNodes((nds) =>
                      nds.map((node) =>
                        node.id === selectedNode.id
                          ? { ...node, data: { ...node.data, parentId: newParentId } }
                          : node
                      )
                    );
                    setSelectedNode({
                      ...selectedNode,
                      data: { ...selectedNode.data, parentId: newParentId }
                    });
                  }}
                  className="form-control"
                >
                  <option value="">无</option>
                  {nodes
                    .filter(node => node.id !== selectedNode.id)
                    .map(node => (
                      <option key={node.id} value={node.id}>
                        {node.data.label}
                      </option>
                    ))}
                </select>
              </div>
              <div className="form-group flex space-x-2">
                <button
                  onClick={generateCode}
                  disabled={isGenerating || !selectedNode?.data?.description}
                  style={{
                    background: 'linear-gradient(135deg, #00ffff 0%, #8b5cf6 100%)',
                    color: '#0a0a1a',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    opacity: (isGenerating || !selectedNode?.data?.description) ? '0.5' : '1',
                    cursor: (isGenerating || !selectedNode?.data?.description) ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (!isGenerating && selectedNode?.data?.description) {
                      e.target.style.boxShadow = '0 0 30px rgba(0, 255, 255, 0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {isGenerating ? '生成中...' : '生成代码'}
                </button>
                <button
                  onClick={handlePreview}
                  disabled={!generatedCode}
                  style={{
                    border: '1px solid #8b5cf6',
                    opacity: !generatedCode ? '0.5' : '1',
                    cursor: !generatedCode ? 'not-allowed' : 'pointer'
                  }}
                >
                  预览
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!generatedCode}
                  style={{
                    border: '1px solid #f472b6',
                    color: '#f472b6',
                    opacity: !generatedCode ? '0.5' : '1',
                    cursor: !generatedCode ? 'not-allowed' : 'pointer'
                  }}
                >
                  下载
                </button>
              </div>
              {error && (
                <div className="form-group">
                  <div style={{ color: '#f472b6', fontSize: '0.9rem', fontWeight: '500', padding: '0.75rem', background: 'rgba(244, 114, 182, 0.1)', borderRadius: '8px', border: '1px solid rgba(244, 114, 182, 0.3)' }}>
                    {error}
                  </div>
                </div>
              )}
              {generatedCode && (
                <div className="form-group mt-4">
                  <h4>生成的代码</h4>
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 255, 255, 0.2)',
                    maxHeight: '200px',
                    overflow: 'auto'
                  }}>
                    <pre style={{ fontSize: '0.85rem', fontFamily: 'JetBrains Mono, monospace', color: '#00ffff', whiteSpace: 'pre-wrap' }}>{generatedCode}</pre>
                  </div>
                </div>
              )}
            </div>
          ) : selectedEdge ? (
            <div className="edge-properties">
              <h4>连线配置</h4>
              <div className="form-group">
                <label>连线类型</label>
                <select
                  value={selectedEdge.type || 'smoothstep'}
                  onChange={(e) => {
                    updateEdgeStyle(
                      selectedEdge.id, 
                      e.target.value, 
                      !!selectedEdge.markerEnd
                    );
                    setSelectedEdge({ ...selectedEdge, type: e.target.value });
                  }}
                  className="form-control"
                >
                  <option value="smoothstep">平滑曲线</option>
                  <option value="straight">直线</option>
                  <option value="step">阶梯</option>
                </select>
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={!!selectedEdge.markerEnd}
                    onChange={(e) => {
                      updateEdgeStyle(
                        selectedEdge.id, 
                        selectedEdge.type || 'smoothstep', 
                        e.target.checked
                      );
                      setSelectedEdge({
                        ...selectedEdge,
                        markerEnd: e.target.checked ? { type: MarkerType.ArrowClosed } : undefined
                      });
                    }}
                  />
                  显示箭头
                </label>
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={!!selectedEdge.animated}
                    onChange={(e) => {
                      setEdges((eds) => eds.map((e) => {
                        if (e.id === selectedEdge.id) {
                          return { ...e, animated: e.target.checked };
                        }
                        return e;
                      }));
                      setSelectedEdge({ ...selectedEdge, animated: e.target.checked });
                    }}
                  />
                  动画效果
                </label>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <p>请选择一个节点或连线</p>
            </div>
          )}
          <div className="global-styles">
            <h4>全局样式</h4>
            <div className="form-group">
              <label>主题色</label>
              <input
                type="color"
                value={globalStyles.themeColor}
                onChange={(e) => updateGlobalStyle('themeColor', e.target.value)}
                className="form-control color-picker"
              />
            </div>
            <div className="form-group">
              <label>字体</label>
              <select
                value={globalStyles.fontFamily}
                onChange={(e) => updateGlobalStyle('fontFamily', e.target.value)}
                className="form-control"
              >
                <option value="sans-serif">无衬线字体</option>
                <option value="serif">衬线字体</option>
                <option value="monospace">等宽字体</option>
              </select>
            </div>
            <div className="form-group">
              <label>圆角大小</label>
              <input
                type="range"
                min="0"
                max="20"
                value={globalStyles.borderRadius}
                onChange={(e) => updateGlobalStyle('borderRadius', parseInt(e.target.value))}
                className="form-control"
              />
              <span style={{ color: 'rgba(255, 255, 255, 0.8)', marginLeft: '0.5rem', fontWeight: '600' }}>{globalStyles.borderRadius}px</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 预览模态框 */}
      {showPreview && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(10px)' }}>
          <div className="flex flex-col" style={{
            background: 'rgba(10, 10, 26, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(0, 255, 255, 0.3)',
            boxShadow: '0 0 50px rgba(0, 255, 255, 0.2)',
            width: '90%',
            maxWidth: '1200px',
            maxHeight: '90vh'
          }}>
            <div className="p-4 flex justify-between items-center" style={{ borderBottom: '1px solid rgba(0, 255, 255, 0.2)' }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #00ffff 0%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>页面预览</h3>
              <button
                onClick={() => setShowPreview(false)}
                style={{
                  fontSize: '1.5rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#00ffff';
                  e.target.style.background = 'rgba(0, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'rgba(255, 255, 255, 0.7)';
                  e.target.style.background = 'transparent';
                }}
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <iframe
                srcDoc={generatePreviewHtml()}
                className="w-full h-[80vh]"
                style={{ border: 'none', borderRadius: '0 0 16px 16px' }}
                title="Page Preview"
              />
            </div>
          </div>
        </div>
      )}

      {/* API配置模态框 */}
      {showConfigModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(10px)' }}>
          <div className="flex flex-col" style={{
            background: 'rgba(10, 10, 26, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(0, 255, 255, 0.3)',
            boxShadow: '0 0 50px rgba(0, 255, 255, 0.2)',
            width: '90%',
            maxWidth: '500px'
          }}>
            <div className="p-4 flex justify-between items-center" style={{ borderBottom: '1px solid rgba(0, 255, 255, 0.2)' }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #00ffff 0%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>API配置</h3>
              <button
                onClick={() => setShowConfigModal(false)}
                style={{
                  fontSize: '1.5rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#00ffff';
                  e.target.style.background = 'rgba(0, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'rgba(255, 255, 255, 0.7)';
                  e.target.style.background = 'transparent';
                }}
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '500' }}>
                  API密钥
                </label>
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="请输入API密钥"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(0, 255, 255, 0.3)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(0, 255, 255, 0.8)';
                    e.target.style.boxShadow = '0 0 10px rgba(0, 255, 255, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(0, 255, 255, 0.3)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div className="mb-4">
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '500' }}>
                  模型类型
                </label>
                <select
                  value={tempModelType}
                  onChange={(e) => setTempModelType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(0, 255, 255, 0.3)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(0, 255, 255, 0.8)';
                    e.target.style.boxShadow = '0 0 10px rgba(0, 255, 255, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(0, 255, 255, 0.3)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="glm" style={{ background: '#0a0a1a' }}>GLM (智谱)</option>
                </select>
              </div>

              <div className="mb-6">
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '500' }}>
                  模型名称
                </label>
                <select
                  value={tempModelName}
                  onChange={(e) => setTempModelName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(0, 255, 255, 0.3)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(0, 255, 255, 0.8)';
                    e.target.style.boxShadow = '0 0 10px rgba(0, 255, 255, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(0, 255, 255, 0.3)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="glm-4" style={{ background: '#0a0a1a' }}>GLM-4</option>
                  <option value="glm-3-turbo" style={{ background: '#0a0a1a' }}>GLM-3-Turbo</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={saveConfig}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #00ffff 0%, #8b5cf6 100%)',
                    color: '#0a0a1a',
                    fontWeight: '700',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  保存配置
                </button>
                <button
                  onClick={resetConfig}
                  style={{
                    flex: 1,
                    background: 'rgba(0, 0, 0, 0.3)',
                    color: '#f472b6',
                    fontWeight: '700',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(244, 114, 182, 0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(244, 114, 182, 0.1)';
                    e.target.style.boxShadow = '0 0 20px rgba(244, 114, 182, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(0, 0, 0, 0.3)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  重置默认
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
