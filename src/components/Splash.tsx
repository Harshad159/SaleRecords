import React from 'react'

const Splash: React.FC = () => {
  return (
    <div className="splash">
      <div className="splash-card">
        <div className="splash-logo">N</div>
        <div className="splash-title">
          NARSINHA <span className="pill">power for all</span>
        </div>
        <div className="splash-sub">Engineering Works</div>
        <div className="spinner" aria-label="Loading" />
      </div>
    </div>
  )
}

export default Splash
