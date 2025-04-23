import * as React from 'react';
import * as THREE from 'three';

interface CodeViewerProps {
  code: string;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ code }) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    containerRef.current.appendChild(canvas);
    try {
      new Function("THREE", "canvas", code)(THREE, canvas);
    } catch (error) {
      console.error("Ошибка выполнения пользовательского кода:", error);
    }
  }, [code]);

  return <div ref={containerRef} style={{ width: "100%", height: "auto" }} />;
};

export default CodeViewer;