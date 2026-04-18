import React from 'react';

type ModelLoaderProps = {
  progress: number;
  label?: string;
};

const ModelLoader: React.FC<ModelLoaderProps> = ({ progress, label = "Loading Model" }) => {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: '#000',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      color: '#fff',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        width: '200px',
        height: '2px',
        backgroundColor: '#333',
        marginBottom: '10px',
        borderRadius: '2px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          backgroundColor: '#fff',
          transition: 'width 0.3s ease'
        }} />
      </div>
      <div style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.8 }}>
        {label} {Math.round(progress)}%
      </div>
    </div>
  );
};

export default ModelLoader;
