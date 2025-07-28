// src/global.d.ts
interface AdobeDCView {
  previewFile: (
    previewFileConfig: {
      content: { location: { url: string } };
      metaData: { fileName: string };
    },
    viewerConfig: {
      embedMode: string;
    }
  ) => void;
}

interface AdobeDC {
  View: new (params: { clientId: string; divId: string }) => AdobeDCView;
}

interface Window {
  AdobeDC?: AdobeDC;
}
