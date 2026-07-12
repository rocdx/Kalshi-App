import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const BLUE = '#2563eb'
const RED = '#c0392b'

// Below this % difference, the sizing gap is treated as noise rather than
// a real tendency — matches CLAUDE.md's rule against overclaiming.
const TILT_THRESHOLD_PCT = 10

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
    fontSize: 18,
    fontWeight: 600,
    color: '#08060d',
  },
  headline: {
    marginTop: 16,
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
}

function Money({ value }) {
  return <strong>${value.toFixed(2)}</strong>
}

function SmallSampleNote() {
  return (
    <span style={styles.smallSampleNote}>
      {' '}
      (Small sample on one side — not enough bets to call this a real
      tendency.)
    </span>
  )
}

function Headline({ stats }) {
  const { avgAfterWin, avgAfterLoss, pctDiff, isSmallSample } = stats

  if (pctDiff === null) {
    return (
      <p style={styles.headline}>
        Not enough completed bets after a win to compare stake sizing yet.
      </p>
    )
  }

  if (pctDiff >= TILT_THRESHOLD_PCT) {
    return (
      <p style={styles.headline}>
        You bet <strong>{pctDiff}% bigger</strong> after a loss (
        <Money value={avgAfterLoss} /> avg) than after a win (
        <Money value={avgAfterWin} /> avg) — a classic tilt signal.
        {isSmallSample && <SmallSampleNote />}
      </p>
    )
  }

  if (pctDiff <= -TILT_THRESHOLD_PCT) {
    return (
      <p style={styles.headline}>
        You actually bet <strong>{Math.abs(pctDiff)}% smaller</strong> after
        a loss (<Money value={avgAfterLoss} /> avg) than after a win (
        <Money value={avgAfterWin} /> avg) — no tilt pattern here.
        {isSmallSample && <SmallSampleNote />}
      </p>
    )
  }

  return (
    <p style={styles.headline}>
      Your stake sizing is fairly consistent regardless of the last result —{' '}
      <Money value={avgAfterLoss} /> avg after a loss vs.{' '}
      <Money value={avgAfterWin} /> avg after a win.
      {isSmallSample && <SmallSampleNote />}
    </p>
  )
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div style={styles.tooltip}>
      <p style={styles.tooltipLabel}>{point.label}</p>
      <p style={{ margin: '4px 0 0' }}>${point.avg.toFixed(2)} avg stake</p>
      <p style={styles.tooltipSub}>
        {point.count} bet{point.count === 1 ? '' : 's'}
      </p>
    </div>
  )
}

export default function StakeAfterOutcomeChart({ stats }) {
  const data = [
    { label: 'After a win', avg: stats.avgAfterWin, count: stats.countAfterWin },
    { label: 'After a loss', avg: stats.avgAfterLoss, count: stats.countAfterLoss },
  ]

  if (!stats.hasEnoughData) {
    return (
      <div style={styles.card}>
        <p style={styles.title}>Stake size: after a win vs. after a loss</p>
        <p style={styles.headline}>
          Not enough bets with both a prior win and a prior loss yet to make
          this comparison — showing a chart here would be more misleading
          than useful.
        </p>
      </div>
    )
  }

  return (
    <div style={styles.card}>
      <p style={styles.title}>Stake size: after a win vs. after a loss</p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e4e7" />
          <XAxis dataKey="label" tick={{ fontSize: 13, fill: '#6b6375' }} />
          <YAxis
            tick={{ fontSize: 12, fill: '#6b6375' }}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f4f3ec' }} />
          <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
            <Cell fill={BLUE} />
            <Cell fill={RED} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <Headline stats={stats} />
    </div>
  )
}
