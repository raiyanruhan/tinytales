import { useState, useRef } from 'react'
import { useModal } from '@context/ModalContext'
import { createProduct, Product } from '@services/productApi'
import { Category } from '@data/products'

interface BulkImportProps {
  onImportComplete: () => void
  onCancel: () => void
}

interface ImportRow {
  id?: string
  name: string
  price: string
  category: string
  description: string
  sizes: string
  colors: string
  image?: string
  stock?: string
  badges?: string
}

export default function BulkImport({ onImportComplete, onCancel }: BulkImportProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ImportRow[]>([])
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showAlert } = useModal()

  const parseCSV = (text: string): ImportRow[] => {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []

    // Simple CSV parser that handles quoted fields
    const parseLine = (line: string): string[] => {
      const result: string[] = []
      let current = ''
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      result.push(current.trim())
      return result
    }

    const headers = parseLine(lines[0]).map(h => h.toLowerCase().replace(/"/g, ''))
    const rows: ImportRow[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i]).map(v => v.replace(/^"|"$/g, ''))
      const row: any = {}
      
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })
      
      if (row.name) {
        rows.push(row)
      }
    }

    return rows
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith('.csv')) {
      showAlert({
        title: 'Invalid File',
        message: 'Please select a CSV file',
        type: 'error'
      })
      return
    }

    setFile(selectedFile)
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const parsed = parseCSV(text)
      setPreview(parsed.slice(0, 10)) // Show first 10 rows as preview
    }
    reader.readAsText(selectedFile)
  }

  const validateRow = (row: ImportRow, index: number): string | null => {
    if (!row.name || !row.name.trim()) {
      return `Row ${index + 1}: Name is required`
    }
    if (!row.price || isNaN(parseFloat(row.price))) {
      return `Row ${index + 1}: Valid price is required`
    }
    if (!row.category || !['Newborn', 'Onesies', 'Sets', 'Sleepwear', 'Accessories'].includes(row.category)) {
      return `Row ${index + 1}: Valid category is required (Newborn, Onesies, Sets, Sleepwear, Accessories)`
    }
    if (!row.description || !row.description.trim()) {
      return `Row ${index + 1}: Description is required`
    }
    if (!row.sizes || !row.sizes.trim()) {
      return `Row ${index + 1}: Sizes are required (comma-separated)`
    }
    if (!row.colors || !row.colors.trim()) {
      return `Row ${index + 1}: Colors are required (comma-separated)`
    }
    return null
  }

  const handleImport = async () => {
    if (!file) return

    setImporting(true)
    setProgress(0)

    try {
      const text = await file.text()
      const rows = parseCSV(text)

      if (rows.length === 0) {
        showAlert({
          title: 'Error',
          message: 'No valid rows found in CSV file',
          type: 'error'
        })
        setImporting(false)
        return
      }

      // Validate all rows
      const errors: string[] = []
      rows.forEach((row, index) => {
        const error = validateRow(row, index)
        if (error) errors.push(error)
      })

      if (errors.length > 0) {
        showAlert({
          title: 'Validation Errors',
          message: errors.slice(0, 5).join('\n') + (errors.length > 5 ? `\n...and ${errors.length - 5} more` : ''),
          type: 'error'
        })
        setImporting(false)
        return
      }

      // Import products
      let successCount = 0
      let failCount = 0

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        try {
          const sizes = row.sizes.split(',').map(s => s.trim()).filter(Boolean)
          const colors = row.colors.split(',').map(c => c.trim()).filter(Boolean)
          const stock: Record<string, number> = {}
          
          // Initialize stock for each size-color combination
          // Stock keys must be in format: "size-color"
          const stockValue = row.stock ? parseInt(row.stock) || 0 : 0
          sizes.forEach(size => {
            colors.forEach(color => {
              const stockKey = `${size}-${color}`
              stock[stockKey] = stockValue
            })
          })

          // Handle images - if image URL provided, use it; otherwise use first color's image if available
          const imageUrl = row.image?.trim() || ''
          const productColors = colors.map(color => ({
            name: color,
            images: imageUrl && color === colors[0] ? [imageUrl] : [] // Add image to first color if provided
          }))

          const productData: Partial<Product> = {
            id: row.id || undefined, // Use provided ID or let backend generate
            name: row.name.trim(),
            price: parseFloat(row.price),
            category: row.category as Category,
            description: row.description.trim(),
            sizes,
            colors: productColors,
            stock,
            badges: row.badges ? row.badges.split(',').map(b => b.trim()).filter(Boolean) : [],
            image: imageUrl || '' // Use provided image URL or empty string
          }

          await createProduct(productData)
          successCount++
        } catch (error) {
          console.error(`Failed to import row ${i + 1}:`, error)
          failCount++
        }

        setProgress(Math.round(((i + 1) / rows.length) * 100))
      }

      showAlert({
        title: 'Import Complete',
        message: `Successfully imported ${successCount} products. ${failCount > 0 ? `${failCount} failed.` : ''}`,
        type: successCount > 0 ? 'success' : 'error'
      })

      onImportComplete()
    } catch (error) {
      showAlert({
        title: 'Import Error',
        message: error instanceof Error ? error.message : 'Failed to import products',
        type: 'error'
      })
    } finally {
      setImporting(false)
      setProgress(0)
    }
  }

  return (
    <div style={{
      background: 'var(--white)',
      borderRadius: 'var(--radius-md)',
      padding: 32,
      maxWidth: 1200,
      width: '100%'
    }}>
      <h2 style={{ marginTop: 0, marginBottom: 24, color: 'var(--ink)' }}>
        Bulk Import Products
      </h2>

      <div style={{ marginBottom: 24 }}>
        <p style={{ marginBottom: 16, color: 'var(--navy)' }}>
          Upload a CSV file to import multiple products at once. Images can be added later.
        </p>
        
        <div style={{
          border: '2px dashed var(--border-medium)',
          borderRadius: 'var(--radius-sm)',
          padding: 24,
          textAlign: 'center',
          background: 'var(--paper)',
          marginBottom: 16
        }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '12px 24px',
              background: 'var(--mint)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: 12
            }}
          >
            Select CSV File
          </button>
          {file && (
            <div style={{ marginTop: 12, color: 'var(--navy)' }}>
              Selected: {file.name}
            </div>
          )}
        </div>

        <div style={{
          background: 'var(--cream)',
          padding: 16,
          borderRadius: 'var(--radius-sm)',
          fontSize: 13,
          color: 'var(--navy)',
          lineHeight: 1.6
        }}>
          <strong>CSV Format:</strong>
          <br />
          Required columns: name, price, category, description, sizes, colors
          <br />
          Optional columns: id, image, stock, badges
          <br />
          <small style={{ color: 'var(--navy)', opacity: 0.7 }}>
            Image: URL to product image (e.g., https://example.com/image.jpg)
          </small>
          <br />
          <br />
          <strong>Example:</strong>
          <div style={{
            background: 'var(--white)',
            padding: 16,
            borderRadius: 8,
            marginTop: 12,
            overflowX: 'auto',
            border: '1px solid var(--border-light)'
          }}>
            <table style={{
              width: '100%',
              minWidth: '600px',
              borderCollapse: 'collapse',
              fontSize: 12,
              fontFamily: 'monospace'
            }}>
              <thead>
                <tr style={{
                  background: 'var(--mint)',
                  color: '#fff'
                }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid rgba(255,255,255,0.2)' }}>name</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid rgba(255,255,255,0.2)' }}>price</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid rgba(255,255,255,0.2)' }}>category</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid rgba(255,255,255,0.2)' }}>description</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid rgba(255,255,255,0.2)' }}>sizes</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid rgba(255,255,255,0.2)' }}>colors</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid rgba(255,255,255,0.2)' }}>image</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid rgba(255,255,255,0.2)' }}>stock</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid rgba(255,255,255,0.2)' }}>badges</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{
                  background: 'var(--paper)',
                  borderBottom: '1px solid var(--border-light)'
                }}>
                  <td style={{ padding: '8px 12px', border: '1px solid var(--border-light)' }}>Green Panjabi</td>
                  <td style={{ padding: '8px 12px', border: '1px solid var(--border-light)' }}>1200</td>
                  <td style={{ padding: '8px 12px', border: '1px solid var(--border-light)' }}>Newborn</td>
                  <td style={{ padding: '8px 12px', border: '1px solid var(--border-light)' }}>Beautiful green panjabi</td>
                  <td style={{ padding: '8px 12px', border: '1px solid var(--border-light)' }}>0-3m</td>
                  <td style={{ padding: '8px 12px', border: '1px solid var(--border-light)' }}>Green</td>
                  <td style={{ padding: '8px 12px', border: '1px solid var(--border-light)', fontSize: 10, wordBreak: 'break-all' }}>https://example.com/green-panjabi.jpg</td>
                  <td style={{ padding: '8px 12px', border: '1px solid var(--border-light)' }}>10</td>
                  <td style={{ padding: '8px 12px', border: '1px solid var(--border-light)' }}>Popular</td>
                </tr>
                <tr style={{
                  background: 'var(--white)',
                  borderBottom: '1px solid var(--border-light)'
                }}>
                  <td style={{ padding: '8px 12px', border: '1px solid var(--border-light)' }}>Blue Onesie</td>
                  <td style={{ padding: '8px 12px', border: '1px solid var(--border-light)' }}>800</td>
                  <td style={{ padding: '8px 12px', border: '1px solid var(--border-light)' }}>Onesies</td>
                  <td style={{ padding: '8px 12px', border: '1px solid var(--border-light)' }}>Comfortable blue onesie</td>
                  <td style={{ padding: '8px 12px', border: '1px solid var(--border-light)' }}>3-6m,6-9m</td>
                  <td style={{ padding: '8px 12px', border: '1px solid var(--border-light)' }}>Blue</td>
                  <td style={{ padding: '8px 12px', border: '1px solid var(--border-light)', fontSize: 10, wordBreak: 'break-all' }}>https://example.com/blue-onesie.jpg</td>
                  <td style={{ padding: '8px 12px', border: '1px solid var(--border-light)' }}>15</td>
                  <td style={{ padding: '8px 12px', border: '1px solid var(--border-light)' }}>New</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {preview.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 12, fontSize: 16, color: 'var(--ink)' }}>
            Preview (first {preview.length} rows)
          </h3>
          <div style={{
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-sm)',
            overflowX: 'auto'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--paper)' }}>
                  <th style={{ padding: 8, textAlign: 'left', borderBottom: '1px solid var(--border-light)' }}>Name</th>
                  <th style={{ padding: 8, textAlign: 'left', borderBottom: '1px solid var(--border-light)' }}>Price</th>
                  <th style={{ padding: 8, textAlign: 'left', borderBottom: '1px solid var(--border-light)' }}>Category</th>
                  <th style={{ padding: 8, textAlign: 'left', borderBottom: '1px solid var(--border-light)' }}>Sizes</th>
                  <th style={{ padding: 8, textAlign: 'left', borderBottom: '1px solid var(--border-light)' }}>Colors</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row, index) => (
                  <tr key={index}>
                    <td style={{ padding: 8, borderBottom: '1px solid var(--border-light)' }}>{row.name}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid var(--border-light)' }}>{row.price}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid var(--border-light)' }}>{row.category}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid var(--border-light)' }}>{row.sizes}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid var(--border-light)' }}>{row.colors}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid var(--border-light)', fontSize: 11, wordBreak: 'break-all', maxWidth: 200 }}>
                      {row.image ? (
                        <a href={row.image} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--mint)', textDecoration: 'none' }}>
                          {row.image.length > 40 ? row.image.substring(0, 40) + '...' : row.image}
                        </a>
                      ) : (
                        <span style={{ color: 'var(--navy)', opacity: 0.5 }}>No image</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {importing && (
        <div style={{ marginBottom: 24 }}>
          <div style={{
            background: 'var(--paper)',
            borderRadius: 'var(--radius-sm)',
            padding: 16,
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: 8, color: 'var(--navy)', fontWeight: 600 }}>
              Importing... {progress}%
            </div>
            <div style={{
              width: '100%',
              height: 8,
              background: 'var(--border-light)',
              borderRadius: 4,
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: 'var(--mint)',
                transition: 'width 0.3s ease-out'
              }} />
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={importing}
          style={{
            padding: '10px 20px',
            background: 'var(--white)',
            color: 'var(--navy)',
            border: '1.5px solid var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 14,
            fontWeight: 600,
            cursor: importing ? 'not-allowed' : 'pointer',
            opacity: importing ? 0.6 : 1
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleImport}
          disabled={!file || importing}
          style={{
            padding: '10px 20px',
            background: importing ? 'var(--border-light)' : 'var(--mint)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontSize: 14,
            fontWeight: 600,
            cursor: (!file || importing) ? 'not-allowed' : 'pointer',
            opacity: (!file || importing) ? 0.6 : 1
          }}
        >
          {importing ? 'Importing...' : 'Import Products'}
        </button>
      </div>
    </div>
  )
}

