'use client'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

interface FileUploadProps {
  onFileAccepted: (file: File) => void
  isLoading?: boolean
}

export function FileUpload({ onFileAccepted, isLoading }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    setFileName(file.name)
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }
    onFileAccepted(file)
  }, [onFileAccepted])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: isLoading,
  })

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-indigo-400 bg-indigo-50'
            : 'border-gray-300 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/50'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        {preview ? (
          <div className="space-y-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-xl object-contain" />
            <p className="text-sm text-gray-600">{fileName}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-5xl">📷</div>
            <div>
              <p className="font-semibold text-gray-700">
                {isDragActive ? 'Thả file vào đây...' : 'Kéo thả ảnh hoặc PDF vào đây'}
              </p>
              <p className="text-sm text-gray-500 mt-1">hoặc click để chọn file</p>
              {fileName && <p className="text-sm text-indigo-600 mt-2 font-medium">✓ {fileName}</p>}
            </div>
            <p className="text-xs text-gray-400">Hỗ trợ: JPG, PNG, WEBP, PDF</p>
          </div>
        )}
      </div>
    </div>
  )
}
