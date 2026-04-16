// 模型服务抽象接口
class ModelService {
  async generateCode(prompt, options = {}) {
    throw new Error('子类必须实现generateCode方法');
  }
}

// GLM模型服务实现
class GLMModelService extends ModelService {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey || process.env.REACT_APP_GLM_API_KEY;
    this.baseUrl = 'https://open.bigmodel.cn/api/mcp/text2text';
  }

  async generateCode(prompt, options = {}) {
    if (!this.apiKey) {
      throw new Error('GLM API key is required');
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'glm-4',
          prompt: prompt,
          max_tokens: options.maxTokens || 2000,
          temperature: options.temperature || 0.7,
          top_p: options.topP || 0.9
        })
      });

      if (!response.ok) {
        throw new Error(`GLM API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data?.text || '';
    } catch (error) {
      console.error('GLM API call failed:', error);
      // 模拟响应，用于开发测试
      return this.mockGenerateCode(prompt, options);
    }
  }

  // 模拟生成代码，用于开发测试
  mockGenerateCode(prompt, options = {}) {
    return `
import React from 'react';

const GeneratedPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-xl font-bold">Generated Page</h1>
      </header>
      <main className="flex-grow p-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Page Content</h2>
          <p>This page was generated based on your description.</p>
          <p>Prompt: ${prompt.substring(0, 100)}...</p>
        </div>
      </main>
      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>© 2026 FlowForge</p>
      </footer>
    </div>
  );
};

export default GeneratedPage;
`;
  }
}

// 模型服务工厂
const modelServiceFactory = (type, options = {}) => {
  switch (type) {
    case 'glm':
      return new GLMModelService(options.apiKey);
    default:
      throw new Error(`Unsupported model type: ${type}`);
  }
};

// 代码生成服务
class CodeGenerationService {
  constructor(modelType = 'glm', modelOptions = {}) {
    this.modelService = modelServiceFactory(modelType, modelOptions);
  }

  // 生成页面代码
  async generatePageCode(pageDescription, globalStyles = {}) {
    const prompt = this.generatePagePrompt(pageDescription, globalStyles);
    return this.modelService.generateCode(prompt);
  }

  // 生成路由配置
  async generateRouterConfig(nodes, edges) {
    const prompt = this.generateRouterPrompt(nodes, edges);
    return this.modelService.generateCode(prompt);
  }

  // 生成页面提示词
  generatePagePrompt(pageDescription, globalStyles) {
    return `
请根据以下页面描述生成一个React组件：

页面描述：${pageDescription}

全局样式：
- 主题色：${globalStyles.themeColor || '#1E40AF'}
- 字体：${globalStyles.fontFamily || 'sans-serif'}
- 圆角大小：${globalStyles.borderRadius || 4}px

要求：
1. 使用React函数组件
2. 使用Tailwind CSS进行样式设计
3. 组件名称为GeneratedPage
4. 代码结构清晰，有良好的注释
5. 生成完整的组件代码，包括导入语句
6. 确保代码可以直接使用
`;
  }

  // 生成路由配置提示词
  generateRouterPrompt(nodes, edges) {
    const pageNodes = nodes.filter(node => node.type !== 'input' && node.type !== 'output');
    const pageRoutes = pageNodes.map(node => {
      return {
        id: node.id,
        label: node.data.label,
        path: `/${node.id}`
      };
    });

    return `
请根据以下页面节点生成React Router配置：

页面节点：
${JSON.stringify(pageRoutes, null, 2)}

要求：
1. 使用React Router v6
2. 生成完整的路由配置代码
3. 包括必要的导入语句
4. 代码结构清晰，有良好的注释
5. 确保代码可以直接使用
`;
  }
}

export { ModelService, GLMModelService, modelServiceFactory, CodeGenerationService };