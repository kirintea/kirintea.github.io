(function() {
  const logMessages = {
    idle: 'TRANSMISSION LINK OPEN',
    stable: 'SURFACE GRID SYNCHRONIZED',
    active: 'LOW ORBIT VISUAL FEED STABLE',
    drag: 'LUNAR TRACK MAINTAINED'
  };

  function getObservatoryElements() {
    return {
      target: document.getElementById('orbit-target'),
      orbit: document.getElementById('orbit-state'),
      scan: document.getElementById('orbit-scan'),
      rotation: document.getElementById('orbit-rotation'),
      signal: document.getElementById('orbit-signal'),
      log: document.getElementById('orbit-log-message')
    };
  }

  function pickLogMessage(state) {
    if (state.orbit === 'MANUAL SWEEP') return logMessages.drag;
    if (state.active) return logMessages.active;
    if (state.signal === 'STABLE') return logMessages.stable;
    return logMessages.idle;
  }

  function updateObservatoryHud(state) {
    const elements = getObservatoryElements();
    if (!elements.target) return;

    elements.target.textContent = state.target;
    elements.orbit.textContent = state.orbit;
    elements.scan.textContent = state.scan;
    elements.rotation.textContent = state.rotation;
    elements.signal.textContent = state.signal;
    elements.log.textContent = pickLogMessage(state);
  }

  window.addEventListener('DOMContentLoaded', function() {
    if (typeof window.attachOrbitalObservatory === 'function') {
      window.attachOrbitalObservatory(updateObservatoryHud);
    }
  });
})();
