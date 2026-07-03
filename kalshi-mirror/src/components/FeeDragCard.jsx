const GREEN = '#15803d'
const RED = '#c0392b'

const styles = {
  card: {
    marginTop: 24,
    padding: '20px 24px',
    border: '1px solid #e5e4e7',
    borderRadius: 8,
    background: '#f4f3ec',
  },
  headline: {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
    color: '#08060d',
    lineHeight: 1.4,
  },
  statsRow: {
    display: 'flex',
    gap: 32,
    marginTop: 16,
  },
  statLabel: {
    margin: 0,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#6b6375',
  },
  statValue: {
    margin: '4px 0 0',
    fontSize: 20,
    fontFamily: 'monospace',
  },
}

function fmtSigned(n) {
  const sign = n > 0 ? '+' : n < 0 ? '-' : ''
  return `${sign}$${Math.abs(n).toFixed(2)}`
}

function Money({ value, color }) {
  return (
    <span style={{ color, fontWeight: 700 }}>
      {value < 0 ? '-' : ''}${Math.abs(value).toFixed(2)}
    </span>
  )
}

function Percent({ value, color }) {
  return <span style={{ color, fontWeight: 700 }}>{value.toFixed(1)}%</span>
}

function Headline({ stats }) {
  const { grossPnl, netPnl, totalFees, dragPct } = stats

  if (grossPnl > 0 && netPnl > 0) {
    return (
      <>
        You've made a net <Money value={netPnl} color={GREEN} /> after fees.
        Your gross was <Money value={grossPnl} color={GREEN} /> before — fees
        took <Percent value={dragPct} color={RED} /> of your winnings.
      </>
    )
  }

  if (grossPnl > 0 && netPnl <= 0) {
    return (
      <>
        Your bets were profitable before fees (
        <Money value={grossPnl} color={GREEN} />), but fees took{' '}
        <Percent value={dragPct} color={RED} /> of that edge — enough to
        erase it entirely, leaving you net down{' '}
        <Money value={netPnl} color={RED} /> after fees.
      </>
    )
  }

  if (dragPct === null) {
    return (
      <>
        You broke even before fees, but fees still cost you{' '}
        <Money value={totalFees} color={RED} />, for a total loss of{' '}
        <Money value={netPnl} color={RED} />.
      </>
    )
  }

  return (
    <>
      You were already down <Money value={grossPnl} color={RED} /> before
      fees. Fees added another <Money value={totalFees} color={RED} /> on top
      — <Percent value={dragPct} color={RED} /> of your pre-fee loss — for a
      total loss of <Money value={netPnl} color={RED} />.
    </>
  )
}

function Stat({ label, value, color }) {
  return (
    <div>
      <p style={styles.statLabel}>{label}</p>
      <p style={{ ...styles.statValue, color }}>{value}</p>
    </div>
  )
}

export default function FeeDragCard({ stats }) {
  return (
    <div style={styles.card}>
      <p style={styles.headline}>
        <Headline stats={stats} />
      </p>
      <div style={styles.statsRow}>
        <Stat
          label="Gross P&L"
          value={fmtSigned(stats.grossPnl)}
          color={stats.grossPnl >= 0 ? GREEN : RED}
        />
        <Stat
          label="Total fees"
          value={`-$${stats.totalFees.toFixed(2)}`}
          color={RED}
        />
        <Stat
          label="Net P&L"
          value={fmtSigned(stats.netPnl)}
          color={stats.netPnl >= 0 ? GREEN : RED}
        />
      </div>
    </div>
  )
}
