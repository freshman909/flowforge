import { Handle, Position } from '@reactflow/core';
import { LayoutService } from '../services/layoutService';

const CustomNode = ({ data, selected }) => {
  const level = data.level || 0;
  const levelColor = LayoutService.getLevelColor(level);
  
  return (
    <div style={{
      padding: '12px 20px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '600',
      textAlign: 'center',
      border: selected ? `2px solid ${levelColor}` : `2px solid ${levelColor}80`,
      background: 'rgba(10, 10, 26, 0.8)',
      backdropFilter: 'blur(10px)',
      boxShadow: selected 
        ? `0 0 30px ${levelColor}80` 
        : `0 0 20px ${levelColor}40`,
      transition: 'all 0.3s ease',
      color: levelColor,
      fontFamily: "'Rajdhani', sans-serif",
      minWidth: '120px',
    }}>
      <Handle
        type="target"
        position={Position.Top}
        style={{
          width: '12px',
          height: '12px',
          border: `2px solid ${levelColor}`,
          background: `${levelColor}40`,
          boxShadow: `0 0 10px ${levelColor}`,
        }}
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: '12px',
          height: '12px',
          border: `2px solid ${levelColor}`,
          background: `${levelColor}40`,
          boxShadow: `0 0 10px ${levelColor}`,
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: '12px',
          height: '12px',
          border: `2px solid ${levelColor}`,
          background: `${levelColor}40`,
          boxShadow: `0 0 10px ${levelColor}`,
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          width: '12px',
          height: '12px',
          border: `2px solid ${levelColor}`,
          background: `${levelColor}40`,
          boxShadow: `0 0 10px ${levelColor}`,
        }}
      />
      <div>{data.label}</div>
      {data.description && (
        <div style={{
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.6)',
          marginTop: '4px'
        }}>
          {data.description}
        </div>
      )}
    </div>
  );
};

export default CustomNode;
