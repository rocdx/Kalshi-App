import { useRef, useState } from 'react'

const styles = {
  dropzone: {
    marginTop: 24,
    border: '2px dashed #ccc',
    borderRadius: 8,
    padding: '60px 20px',
    textAlign: 'center',
    color: '#6b6375',
    transition: 'border-color 0.2s, background 0.2s',
  },
  dropzoneDragging: {
    borderColor: '#aa3bff',
    background: 'rgba(170, 59, 255, 0.1)',
  },
  fileName: {
    fontFamily: 'monospace',
    color: '#08060d',
    margin: 0,
  },
  browseButton: {
    marginTop: 16,
    padding: '10px 20px',
    fontSize: 15,
    fontWeight: 600,
    color: '#fff',
    background: '#2563eb',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
  },
}

export default function Dropzone({ onFile, fileName }) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) onFile(dropped)
  }

  return (
    <div
      style={{
        ...styles.dropzone,
        ...(isDragging ? styles.dropzoneDragging : {}),
      }}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {fileName ? (
        <p style={styles.fileName}>{fileName}</p>
      ) : (
        <p>Drop CSV file here</p>
      )}

      <button
        type="button"
        style={styles.browseButton}
        onClick={() => fileInputRef.current?.click()}
      >
        Browse files
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        style={{ display: 'none' }}
        onChange={(e) => {
          const picked = e.target.files?.[0]
          if (picked) onFile(picked)
        }}
      />
    </div>
  )
}
