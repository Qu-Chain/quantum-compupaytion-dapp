import { useFileContext } from '../path/to/FileContext'
import { useEffect, useState } from 'react'

export function AnotherPage() {
  const { selectedFile } = useFileContext()
  const [fileContent, setFileContent] = useState<string | null>(null)

  useEffect(() => {
    if (selectedFile) {
      const reader = new FileReader()

      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target && e.target.result) {
          setFileContent(e.target.result as string)
        }
      }

      reader.readAsText(selectedFile)
    }
  }, [selectedFile])

  return (
    <div>
      {selectedFile ? (
        <div>
          <p>Selected File: {selectedFile.name}</p>
          <p>File Content:</p>
          <pre>{fileContent}</pre>
        </div>
      ) : (
        <p>No file selected.</p>
      )}
    </div>
  )
}