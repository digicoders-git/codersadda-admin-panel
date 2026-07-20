import React, { useEffect, useRef } from "react";

const CertificatePreviewCanvas = ({
  template,
  width = 1200,
  height = 800,
  className = "",
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !template) return;

    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
    img.src = template.certificateImage?.startsWith("/uploads")
      ? `${baseUrl}${template.certificateImage}`
      : template.certificateImage;

    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw each layer
      const layers = [
        "studentName",
        "courseName",
        "quizName",
        "quizCode",
        "userMobile",
        "collegeName",
        "rank",
        "totalScore",
        "timeTaken",
        "certificateId",
        "issueDate",
      ];

      layers.forEach((layerKey) => {
        const config = template[layerKey];
        if (config && config.status) {
          const text = template.sampleTexts?.[layerKey] || "";

          ctx.font = `${config.italic ? "italic " : ""}${config.bold ? "bold " : ""}${config.fontSize} ${config.fontFamily}`;
          ctx.fillStyle = config.textColor;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Calculate scaled positions
          // backend saves width/height as string, parseFloat handles it
          const templateWidth = parseFloat(template.width) || 1200;
          const templateHeight = parseFloat(template.height) || 800;

          const x =
            (parseFloat(config.horizontalPosition) / templateWidth) *
            canvas.width;
          const y =
            (parseFloat(config.verticalPosition) / templateHeight) *
            canvas.height;

          ctx.fillText(text, x, y);

          if (config.underline) {
            const metrics = ctx.measureText(text);
            const textWidth = metrics.width;
            ctx.beginPath();
            ctx.strokeStyle = config.textColor;
            ctx.lineWidth = 2;
            ctx.moveTo(x - textWidth / 2, y + parseInt(config.fontSize) / 2);
            ctx.lineTo(x + textWidth / 2, y + parseInt(config.fontSize) / 2);
            ctx.stroke();
          }
        }
      });
    };
  }, [template, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`max-w-full h-auto ${className}`}
    />
  );
};

export default CertificatePreviewCanvas;
