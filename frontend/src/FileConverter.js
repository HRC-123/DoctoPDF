import React, { useState } from "react";
import { Upload, FileText, Download, AlertCircle } from "lucide-react";

const FileConverter = () => {
  const [file, setFile] = useState(null);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [downloadInfo, setDownloadInfo] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.name.endsWith(".docx")) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("Please select a valid .docx file");
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setConverting(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:3001/convert", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Conversion failed");

      setMetadata(data.metadata);
      setDownloadInfo(data.outputFilename);
    } catch (err) {
      setError(err.message);
    } finally {
      setConverting(false);
    }
  };

  const handleDownload = async () => {
    if (!downloadInfo) return;
    try {
      window.location.href = `http://localhost:3001/download/${downloadInfo}`;
    } catch (err) {
      setError("Download failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Word to PDF Converter
            </h1>
            <p className="text-gray-600 mt-2">
              Upload your .docx file and convert it to PDF
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Upload Section */}
          <div className="space-y-6">
            <div className="flex justify-center">
              <label className="relative cursor-pointer bg-white border-2 border-dashed border-blue-500 rounded-lg p-8 hover:border-blue-600 transition-colors">
                <div className="flex flex-col items-center">
                  <Upload className="w-12 h-12 text-blue-500 mb-2" />
                  <span className="text-sm text-gray-600">
                    {file ? file.name : "Select or drag a DOCX file"}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".docx"
                    onChange={handleFileChange}
                  />
                </div>
              </label>
            </div>

            {/* Convert Button */}
            {file && (
              <div className="text-center">
                <button
                  onClick={handleUpload}
                  disabled={converting}
                  className={`
                    px-6 py-2 rounded-md text-white font-medium
                    ${
                      converting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600 active:bg-blue-700"
                    }
                    transition-colors duration-200
                  `}
                >
                  {converting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Converting...
                    </div>
                  ) : (
                    "Convert to PDF"
                  )}
                </button>
              </div>
            )}

            {/* Metadata Display */}
            {metadata && (
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5" />
                  File Details
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>Original Name:</div>
                  <div>{metadata.originalName}</div>
                  <div>Size:</div>
                  <div>{Math.round(metadata.size / 1024)} KB</div>
                  <div>Upload Date:</div>
                  <div>{new Date(metadata.uploadDate).toLocaleString()}</div>
                </div>
              </div>
            )}

            {/* Download Button */}
            {downloadInfo && (
              <div className="text-center mt-6">
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 active:bg-green-700 transition-colors duration-200"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileConverter;
