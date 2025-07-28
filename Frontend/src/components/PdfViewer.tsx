import { useEffect } from "react";

interface PDFViewerProps {
  fileUrl: string;
}

export default function PDFViewer({ fileUrl }: PDFViewerProps) {
  useEffect(() => {
    if (!window.AdobeDC) return;

    const fileName = fileUrl.split("/").pop() || "UploadedFile.pdf";

    const adobeDCView = new window.AdobeDC.View({
      clientId: "d57cc910b3bf4aef8e99513b13473fab",
      divId: "adobe-dc-view",
    });

    adobeDCView.previewFile(
      {
        content: { location: { url: fileUrl } },
        metaData: { fileName },
      },
      { embedMode: "SIZED_CONTAINER" }
    );
  }, [fileUrl]);

  return <div id="adobe-dc-view" style={{ height: "600px" }} />;
}
