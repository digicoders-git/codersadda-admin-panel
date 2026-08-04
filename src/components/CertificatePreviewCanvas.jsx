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
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "https://coders-adda-backend.onrender.com";
    let imageSrc = template.certificateImage || "";
    if (imageSrc.includes("/uploads/")) {
      const relativePath = imageSrc.substring(imageSrc.indexOf("/uploads/"));
      imageSrc = `${baseUrl}${relativePath}`;
    }
    img.src = imageSrc;

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
          let text = template.sampleTexts?.[layerKey];
          if (text === undefined || text === null || text === "undefined" || text === "") {
            const defaults = {
              studentName: "Mayank Pandey",
              courseName: "React JS",
              quizName: "React",
              quizCode: "QZ-1045",
              userMobile: "9876543210",
              collegeName: "DigiCoders Technologies",
              rank: "1",
              totalScore: "45 / 50",
              timeTaken: "15 mins",
              certificateId: "QZ-1045 / 50",
              issueDate: new Date().toLocaleDateString("en-GB"),
            };
            text = defaults[layerKey] || "";
          }

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

    img.onerror = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw dark background placeholder
      ctx.fillStyle = "#1e1e2d";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const isThumbnail = canvas.width < 300;

      // Draw border
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = isThumbnail ? 2 : 4;
      ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

      // Draw Error text
      ctx.font = `bold ${isThumbnail ? 12 : 28}px sans-serif`;
      ctx.fillStyle = "#ef4444";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(isThumbnail ? "No Image" : "Background Template Image Missing (404)", canvas.width / 2, canvas.height / 2 - (isThumbnail ? 0 : 25));

      // Draw Instruction text
      if (!isThumbnail) {
        ctx.font = "18px sans-serif";
        ctx.fillStyle = "#a1a1aa";
        ctx.fillText("Please click Edit and upload/save the certificate image again.", canvas.width / 2, canvas.height / 2 + 25);
      }
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
