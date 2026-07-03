import Papa from 'papaparse'

// Wraps PapaParse's callback API in a promise so callers can await it.
export function parseCsvFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: resolve,
      error: reject,
    })
  })
}
