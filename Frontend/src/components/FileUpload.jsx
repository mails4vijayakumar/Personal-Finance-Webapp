import { useState } from 'react'

function FileUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
      if (allowedTypes.includes(selectedFile.type)) {
        setFile(selectedFile)
        setError(null)
      } else {
        setError('Please select a valid Excel file (.xlsx or .xls)')
        setFile(null)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!file) {
      setError('Please select a file')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/transactions/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setSuccess(data.message)
      setFile(null)
      document.getElementById('fileInput').value = ''

      // Notify parent component to refresh
      if (onUploadSuccess) {
        onUploadSuccess()
      }

      setTimeout(() => setSuccess(null), 5000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="upload-form">
      <div className="upload-container">
        <div className="upload-input-group">
          <label htmlFor="fileInput" className="upload-label">
            <span className="upload-icon">📁</span>
            <span className="upload-text">
              {file ? file.name : 'Click to upload Excel file'}
            </span>
          </label>
          <input
            type="file"
            id="fileInput"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="upload-input"
          />
          <small className="upload-hint">Columns: Description, Amount, Type, Date</small>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <button type="submit" className="btn btn-primary" disabled={!file || loading}>
          {loading ? 'Uploading...' : 'Upload Transactions'}
        </button>
      </div>
    </form>
  )
}

export default FileUpload
