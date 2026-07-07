import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

const GREEN = '#15803d'
const RED = '#c0392b'

const COLORS = [
  '#2563eb', '#aa3bff', '#15803d', '#c0392b',
  '#f59e0b', '#0891b2', '#db2777', '#6b6375',
]

const styles = {
  card: {
    marginTop: 24,
    padding: '20px 24px',
    border: '1px solid #e5e4e7',
    borderRadius: 8,
    background: '#fff',
  },
  title: {
    margin: '0 0 16px',
    fontSize: 24,
    fontWeight: 600,
    color: '#08060d',
  },
  tooltip: {
    background: '#fff',
    border: '1px solid #e5e4e7',
    borderRadius: 6,
    padding: '8px 12px',
    fontFamily: 'monospace',
    fontSize: 13,
  },
  tooltipLabel: {
    margin: 0,
    fontWeight: 600,
    color: '#08060d',
  },
  tooltipSub: {
    margin: '2px 0 0',
    fontSize: 11,
    color: '#6b6375',
  },
  headline: {
    marginTop: 4,
    padding: '14px 18px',
    border: '1px solid #e5e4e7',
    borderRadius: 8,
    background: '#f4f3ec',
    fontSize: 15,
    fontWeight: 600,
    color: '#08060d',
    lineHeight: 1.5,
  },
  smallSampleNote: {
    fontWeight: 400,
    fontStyle: 'italic',
    color: '#6b6375',
  },
  rows: {
    marginTop: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '8px 0',
    borderBottom: '1px solid #e5e4e7',
    fontSize: 13,
  },
  rowSport: {
    flex: '0 0 180px',
    fontWeight: 600,
    color: '#08060d',
  },
  rowStat: {
    flex: '0 0 110px',
    fontFamily: 'monospace',
    color: '#6b6375',
  },
  rowSmall: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#6b6375',
  },
}

function Money({ value }) {
  const color = value >= 0 ? GREEN : RED
  return (
    <span style={{ color, fontWeight: 700 }}>
      {value < 0 ? '-' : '+'}${Math.abs(value).toFixed(2)}
    </span>
  )
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div style={styles.tooltip}>
      <p style={styles.tooltipLabel}>{point.sport}</p>
      <p style={{ margin: '4px 0 0' }}>
        {point.pct}% ({point.count} bet{point.count === 1 ? '' : 's'})
      </p>
      <p style={styles.tooltipSub}>
        {point.winRate}% win rate · <Money value={point.netPnl} /> net
      </p>
    </div>
  )
}

function ConcentrationHeadline({ top }) {
  if (!top) return null

  return (
    <p style={styles.headline}>
      You're heavily loaded into <strong>{top.sport}</strong> —{' '}
      {top.pct}% of your {top.count} bets — and it's hitting a{' '}
      <strong>{top.winRate}%</strong> win rate for <Money value={top.netPnl} />{' '}
      net.
      {top.isSmallSample && (
        <span style={styles.smallSampleNote}>
          {' '}
          (Small sample — not enough bets here to call this a real tendency.)
        </span>
      )}
    </p>
  )
}

function CategoryRow({ item }) {
  return (
    <div style={styles.row}>
      <span style={styles.rowSport}>{item.sport}</span>
      <span style={styles.rowStat}>{item.pct}% of bets</span>
      <span style={styles.rowStat}>{item.winRate}% win rate</span>
      <span style={styles.rowStat}>
        <Money value={item.netPnl} />
      </span>
      {item.isSmallSample && <span style={styles.rowSmall}>small sample</span>}
    </div>
  )
}

export default function ConcentrationPieChart({ data }) {
  const topCategory = data.find((item) => item.sport !== 'Other') ?? data[0]

  return (
    <div style={styles.card}>
      <p style={styles.title}>What you bet on</p>
      <ResponsiveContainer width="100%" height={420}>
        <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Pie
            data={data}
            dataKey="count"
            nameKey="sport"
            cx="50%"
            cy="42%"
            outerRadius={140}
            label={({ sport, pct }) => `${sport} ${pct}%`}
          >
            {data.map((entry, i) => (
              <Cell key={entry.sport} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="bottom" height={48} wrapperStyle={{ paddingTop: 16 }} />
        </PieChart>
      </ResponsiveContainer>

      <ConcentrationHeadline top={topCategory} />

      <div style={styles.rows}>
        {data.map((item) => (
          <CategoryRow key={item.sport} item={item} />
        ))}
      </div>
    </div>
  )
}
