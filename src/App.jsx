import { useState, useCallback } from 'react';
import { ReactFlow, addEdge, useNodesState, useEdgesState } from '@reactflow/core';
import { Controls } from '@reactflow/controls';
import { MiniMap } from '@reactflow/minimap';
import { CodeGenerationService } from './services/modelService';
import '@reactflow/core/dist/style.css';
import '@reactflow/controls/dist/style.css';
import '@reactflow/minimap/dist/style.css';
import './App.css';

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: '1',
      type: 'input',
      data: { label: '开始', description: '' },
      position: { x: 250, y: 50 },
    },
    {
      id: '2',
      data: { label: '页面1', description: '' },
      position: { x: 250, y: 150 },
    },
    {
      id: '3',
      data: { label: '页面2', description: '' },
      position: { x: 250, y: 250 },
    },
    {
      id: '4',
      type: 'output',
      data: { label: '结束', description: '' },
      position: { x: 250, y: 350 },
    },
  ]);

  const [edges, setEdges, onEdgesChange] = useEdgesState([
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3' },
    { id: 'e3-4', source: '3', target: '4' },
  ]);

  const [selectedNode, setSelectedNode] = useState(null);
  const [globalStyles, setGlobalStyles] = useState({
    themeColor: '#1E40AF',
    fontFamily: 'sans-serif',
    borderRadius: 4
  });
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false);

  // 初始化代码生成服务
  const codeGenService = new CodeGenerationService('glm');

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

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

  // 生成代码
  const generateCode = async () => {
    if (!selectedNode || !selectedNode.data.description) {
      setError('请选择一个节点并输入页面描述');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const code = await codeGenService.generatePageCode(
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
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FlowForge Generated Code</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .file { margin-bottom: 20px; }
    .file-name { font-weight: bold; margin-bottom: 5px; }
    .file-content { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
    pre { margin: 0; }
  </style>
</head>
<body>
  <h1>FlowForge Generated Code</h1>
  <p>This is the code generated by FlowForge. To use it, create a new React project and replace the files with the content below.</p>
  
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
        <div className="flow-container">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            fitView
          >
            <Controls />
            <MiniMap />
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
              <div className="form-group flex space-x-2">
                <button
                  onClick={generateCode}
                  disabled={isGenerating || !selectedNode?.data?.description}
                  className="flex-1 bg-blue-600 text-white font-medium py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                >
                  {isGenerating ? '生成中...' : '生成代码'}
                </button>
                <button
                  onClick={handlePreview}
                  disabled={!generatedCode}
                  className="flex-1 bg-green-600 text-white font-medium py-2 px-4 rounded hover:bg-green-700 transition-colors"
                >
                  预览
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!generatedCode}
                  className="flex-1 bg-purple-600 text-white font-medium py-2 px-4 rounded hover:bg-purple-700 transition-colors"
                >
                  下载
                </button>
              </div>
              {error && (
                <div className="form-group">
                  <div className="text-red-500 text-sm">{error}</div>
                </div>
              )}
              {generatedCode && (
                <div className="form-group mt-4">
                  <h4>生成的代码</h4>
                  <div className="bg-gray-100 p-3 rounded border border-gray-300 max-h-60 overflow-auto">
                    <pre className="text-sm font-mono whitespace-pre-wrap">{generatedCode}</pre>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="no-selection">
              <p>请选择一个节点</p>
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
              <span>{globalStyles.borderRadius}px</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 预览模态框 */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">页面预览</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <iframe
                srcDoc={generatePreviewHtml()}
                className="w-full h-[80vh] border-0"
                title="Page Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;