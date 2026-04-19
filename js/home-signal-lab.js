(function() {
  const logMessages = {
    idle: 'TRACE VECTOR STANDBY',
    soft: 'MOTION INPUT DETECTED',
    medium: 'SIGNAL NOISE WITHIN RANGE',
    high: 'LOCAL DISTURBANCE OBSERVED'
  };

  function getLabElements() {
    return {
      input: document.getElementById('lab-input'),
      field: document.getElementById('lab-field'),
      lock: document.getElementById('lab-lock'),
      energy: document.getElementById('lab-energy'),
      log: document.getElementById('lab-log-message')
    };
  }

  function pickLogMessage(telemetry) {
    if (!telemetry.active) return logMessages.idle;
    if (telemetry.energy > 70) return logMessages.high;
    if (telemetry.energy > 30) return logMessages.medium;
    return logMessages.soft;
  }

  function updateLabHud(telemetry) {
    const elements = getLabElements();
    if (!elements.input) return;

    elements.input.textContent = telemetry.input;
    elements.field.textContent = telemetry.field;
    elements.lock.textContent = telemetry.lock;
    elements.energy.textContent = `${telemetry.energy}%`;
    elements.log.textContent = pickLogMessage(telemetry);
  }

  window.attachSignalLabHud = function(particleInstance) {
    if (!particleInstance || typeof particleInstance.getTelemetry !== 'function') return;

    updateLabHud(particleInstance.getTelemetry());
    particleInstance.onTelemetryChange = updateLabHud;
  };
})();
