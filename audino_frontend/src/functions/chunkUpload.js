import * as tus from "tus-js-client";
import authHeader from "../services/auth-header";

export default async function chunkUpload(file, uploadConfig) {
  const params = {}; // enableOrganization();
  const { endpoint, chunkSize, totalSize, onUpdate, metadata } = uploadConfig;
  const { totalSentSize } = uploadConfig;
  const uploadResult = { totalSentSize };
  return new Promise((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint,
      metadata: {
        filename: file.name,
        filetype: file.type,
        ...metadata,
      },
      headers: { ...authHeader() },
      chunkSize,
      retryDelays: null,
      onError(error) {
        reject(error);
      },
      onBeforeRequest(req) {
        const xhr = req.getUnderlyingObject();
        // const { org } = params;
        // req.setHeader("X-Organization", org);
        xhr.withCredentials = true;
      },
      onProgress(bytesUploaded) {
        if (
          onUpdate &&
          Number.isInteger(totalSentSize) &&
          Number.isInteger(totalSize)
        ) {
          const currentUploadedSize = totalSentSize + bytesUploaded;
          const percentage = currentUploadedSize / totalSize;
          onUpdate(percentage);
        }
      },
      onAfterResponse(request, response) {
        const uploadFilename = response.getHeader("Upload-Filename");
        if (uploadFilename) uploadResult.filename = uploadFilename;
      },
      onSuccess() {
        if (totalSentSize) uploadResult.totalSentSize += file.size;
        resolve(uploadResult);
      },
    });
    upload.start();
  });
}
