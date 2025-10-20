// src/components/DebugView.tsx
import React from 'react';

interface DebugViewProps {
  data: any;
}

const DebugView: React.FC<DebugViewProps> = ({ data }) => {
  return (
    <div className="p-4 bg-gray-100 rounded">
      <h3>Debug Information</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default DebugView;