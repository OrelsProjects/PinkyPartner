import SignatureCanvas from "react-signature-canvas";
import React, { useEffect, useRef, useState } from "react";

const SignatureCanvasComponent: React.FC<{
  onSigned: (signature: string) => void;
  className?: string;
}> = ({ onSigned, className }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const sigCanvas = useRef<SignatureCanvas>(null);

  useEffect(() => {
    const canvas = sigCanvas.current;
    if (canvas) {
      canvas.clear();
    }
  }, [sigCanvas]);

  const handleMouseDown = () => {
    setIsDrawing(true);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    onSigned(sigCanvas.current?.toDataURL() ?? "");
  };

  return (
    <SignatureCanvas
      ref={sigCanvas}
      penColor="white"
      onEnd={handleMouseUp}
      canvasProps={{
        height: 100,
        width: 100,
        className: `border border-muted-foreground rounded-lg bg-foreground/10 ${className}`,
        onMouseDown: handleMouseDown,
        onMouseUp: handleMouseUp,
      }}
    />
  );
};

export default SignatureCanvasComponent;

