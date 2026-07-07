import { useEffect, useMemo, useState } from 'react'
import Dropzone from './components/Dropzone'
import BetTable from './components/BetTable'
import FeeDragCard from './components/FeeDragCard'
import PnlTimelineChart from './components/PnlTimelineChart'
import { parseCsvFile } from './lib/parseCsv'
import { normalizeBet } from './lib/normalizeBet'
import { computeFeeDrag } from './lib/feeDrag'
import { computeDailyPnl } from './lib/dailyPnl'

const styles = {
  app: {
    padding: '32px 20px',
    maxWidth: 1200,
    margin: '0 auto',
    fontFamily: 'system-ui, sans-serif',
  },
  heading: {
    margin: '0 0 8px',
    fontSize: 32,
  },
  subtext: {
    color: '#6b6375',
    margin: 0,
  },
  rowCount: {
    marginTop: 16,
    fontSize: 14,
    color: '#6b6375',
  },
  howTo: {
    marginTop: 20,
    padding: '14px 18px',
    border: '1px solid #e5e4e7',
    borderRadius: 8,
    background: '#f4f3ec',
  },
  howToTitle: {
    margin: '0 0 8px',
    fontSize: 13,
    fontWeight: 600,
    color: '#08060d',
  },
  howToList: {
    margin: 0,
    paddingLeft: 20,
    fontSize: 13,
    color: '#6b6375',
    lineHeight: 1.7,
  },
  error: {
    color: '#c0392b',
    fontFamily: 'monospace',
    fontSize: 14,
  },
}

function App() {
  const [fileName, setFileName] = useState('')
  const [bets, setBets] = useState([])
  const [skippedCount, setSkippedCount] = useState(0)
  const [error, setError] = useState('')

  const feeDragStats = useMemo(
    () => (bets.length > 0 ? computeFeeDrag(bets) : null),
    [bets]
  )
  const dailyPnl = useMemo(() => computeDailyPnl(bets), [bets])

  useEffect(() => {
    document.body.style.margin = '0'
    document.body.style.background = '#fff'
    document.body.style.color = '#08060d'
  }, [])

  async function handleFile(file) {
    setFileName(file.name)
    setError('')

    try {
      const results = await parseCsvFile(file)
      if (results.errors.length) {
        setError(results.errors[0].message)
      }

      const rows = results.data
      const tradeRows = rows.filter((row) => row.type === 'trade')
      setSkippedCount(rows.length - tradeRows.length)
      setBets(tradeRows.map(normalizeBet))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div style={styles.app}>
      <h1 style={styles.heading}>Kalshi Transaction Upload</h1>
      <p style={styles.subtext}>Drag and drop your Kalshi transactions CSV below.</p>

      <div style={styles.howTo}>
        <p style={styles.howToTitle}>Don't have your CSV yet?</p>
        <ol style={styles.howToList}>
          <li>Open Kalshi on the web and sign in</li>
          <li>Click the three bars in the top right</li>
          <li>Click "Documents"</li>
          <li>Click download under "Transactions"</li>
        </ol>
      </div>

      <Dropzone onFile={handleFile} fileName={fileName} />

      {error && <p style={styles.error}>{error}</p>}

      {bets.length > 0 && (
        <>
          <p style={styles.rowCount}>
            {bets.length} bets parsed
            {skippedCount > 0
              ? ` (${skippedCount} non-trade rows skipped)`
              : ''}
          </p>
          <PnlTimelineChart data={dailyPnl} />
          <FeeDragCard stats={feeDragStats} />
          <BetTable bets={bets} />
        </>
      )}
    </div>
  )
}

export default App
