const COLUMNS = [
  { key: 'sport', label: 'Sport' },
  { key: 'marketType', label: 'Market' },
  { key: 'side', label: 'Yes/No' },
  { key: 'quantity', label: 'Qty' },
  { key: 'entryPrice', label: 'Entry $' },
  { key: 'exitPrice', label: 'Exit $' },
  { key: 'fees', label: 'Fees $' },
  { key: 'pnl', label: 'PnL $' },
  { key: 'won', label: 'Won?' },
  { key: 'openTime', label: 'Opened' },
  { key: 'holdTimeMinutes', label: 'Hold (min)' },
  { key: 'ticker', label: 'Ticker' },
]

const DOLLAR_KEYS = new Set(['entryPrice', 'exitPrice', 'fees', 'pnl'])

const styles = {
  wrap: {
    marginTop: 16,
    overflow: 'auto',
    maxHeight: '70vh',
    border: '1px solid #e5e4e7',
    borderRadius: 6,
  },
  table: {
    borderCollapse: 'collapse',
    width: '100%',
    fontSize: 13,
    fontFamily: 'monospace',
  },
  th: {
    position: 'sticky',
    top: 0,
    background: '#f4f3ec',
    color: '#08060d',
    textAlign: 'left',
    padding: '6px 10px',
    whiteSpace: 'nowrap',
    borderBottom: '1px solid #e5e4e7',
  },
  td: {
    padding: '6px 10px',
    whiteSpace: 'nowrap',
    borderBottom: '1px solid #e5e4e7',
  },
}

function formatValue(bet, key) {
  const val = bet[key]
  if (key === 'openTime') return val ? val.toLocaleString() : ''
  if (DOLLAR_KEYS.has(key)) return typeof val === 'number' ? val.toFixed(2) : ''
  if (typeof val === 'boolean') return val ? 'Yes' : 'No'
  return val ?? ''
}

export default function BetTable({ bets }) {
  return (
    <div style={styles.wrap}>
      <table style={styles.table}>
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th key={col.key} style={styles.th}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bets.map((bet, i) => (
            <tr key={i}>
              {COLUMNS.map((col) => (
                <td key={col.key} style={styles.td}>
                  {formatValue(bet, col.key)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
