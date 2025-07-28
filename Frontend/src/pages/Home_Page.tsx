

import type React from "react"

import { useState, useRef } from "react"
import { Upload, FileText, Zap, Search, BookOpen, Users, ArrowRight, CheckCircle } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import axiosInstance from "@/lib/axios"; // adjust path if needed
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import PDFViewer from "@/components/PdfViewer";

export default function HomePage() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type === "application/pdf") {
      if (file.size <= 50 * 1024 * 1024) {
        setSelectedFile(file)
      } else {
        alert("File size exceeds 50MB.")
      }
    } else {
      alert("Only PDF files are allowed.")
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      if (file.size <= 50 * 1024 * 1024) {
        setSelectedFile(file)
      } else {
        alert("File size exceeds 50MB.")
      }
    } else {
      alert("Only PDF files are allowed.")
    }
  }
  const handleSubmit = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("pdf", selectedFile);

    try {
      setIsUploading(true);
      setUploadStatus(null);

      const response = await axiosInstance.post("/upload", formData);
      setUploadedFileUrl(response.data.fileUrl);
      setUploadStatus("File uploaded successfully!");
      // setUploadedFileUrl(res)
      // setTimeout(()=>{
      //   setUploadedFileUrl(response.data.filePath);
      // },10000);
      console.log("Server response:", response.data);
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadStatus("Failed to upload. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">DotLink</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">
              How it Works
            </a>
            <Button variant="outline" size="sm">
              Sign In
            </Button>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
              Get Started
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4 bg-emerald-100 text-emerald-800 border-emerald-200">
            Transform Your Documents
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Welcome to <span className="text-emerald-600">DotLink</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Convert your PDF documents into structured, interactive, and semantic experiences. Perfect for students,
            researchers, and professionals who work with complex documents.
          </p>

          {/* Upload Area */}
          <div className="max-w-4xl mx-auto py-16 px-4">
            <Card
              className={`border-2 border-dashed transition-all duration-200 ${isDragOver
                ? "border-emerald-500 bg-emerald-50"
                : "border-gray-300 hover:border-emerald-400 hover:bg-emerald-50/50"
                }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <CardContent className="p-12 text-center">
                <div className="mb-4">
                  <Upload
                    className={`w-12 h-12 mx-auto ${isDragOver ? "text-emerald-600" : "text-gray-400"
                      }`}
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {isDragOver ? "Drop your PDF here" : "Upload your PDF document"}
                </h3>
                <p className="text-gray-600 mb-6">
                  Drag and drop your PDF file here, or click to browse
                </p>

                <Button
                  onClick={handleClick}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>

                <input
                  type="file"
                  accept="application/pdf"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  hidden
                />

                {selectedFile && (
                  <Button
                    onClick={handleSubmit}
                    className="mt-6 bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isUploading}
                  >
                    {isUploading ? "Uploading..." : "Submit"}
                  </Button>
                )}

                {uploadStatus && (
                  <p className="text-sm mt-4 text-center text-green-600">
                    ✅ {uploadStatus}
                  </p>
                )}

                <p className="text-sm text-gray-500 mt-2">
                  Supports PDF files up to 50MB
                </p>
              </CardContent>
            </Card>
          </div>
          {uploadedFileUrl && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Preview</h2>
              <PDFViewer fileUrl={uploadedFileUrl} />
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">10,000+</div>
              <div className="text-gray-600">Documents Processed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">95%</div>
              <div className="text-gray-600">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">5min</div>
              <div className="text-gray-600">Average Processing</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Transform static PDFs into dynamic, searchable, and interactive experiences
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle>Semantic Search</CardTitle>
                <CardDescription>Find information using natural language queries, not just keywords</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle>Interactive Navigation</CardTitle>
                <CardDescription>Navigate through documents with smart bookmarks and cross-references</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle>AI-Powered Insights</CardTitle>
                <CardDescription>Get summaries, key points, and insights extracted automatically</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle>Collaboration Tools</CardTitle>
                <CardDescription>Share, annotate, and collaborate on documents with your team</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle>Structure Recognition</CardTitle>
                <CardDescription>Automatically identify headings, sections, tables, and figures</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle>Quality Assurance</CardTitle>
                <CardDescription>Ensure accuracy with our advanced OCR and validation systems</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Simple steps to transform your documents into interactive experiences
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Document</h3>
                <p className="text-gray-600">Simply drag and drop your PDF or select it from your device</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Processing</h3>
                <p className="text-gray-600">Our AI analyzes structure, extracts content, and creates semantic links</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Explore & Interact</h3>
                <p className="text-gray-600">Navigate, search, and interact with your document in new ways</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-emerald-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Documents?</h2>
            <p className="text-emerald-100 mb-8 text-lg">
              Join thousands of students, researchers, and professionals who are already using DotLink
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-emerald-600 hover:bg-gray-100">
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">DotLink</span>
              </div>
              <p className="text-gray-400">
                Transforming documents into interactive experiences for better understanding and collaboration.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 DotLink. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
