/**
 * Loading Spinner Module
 * A simple state machine for managing loading states during API calls
 * States: idle, loading, success, error
 */

/**
 * Creates a new LoadingSpinner instance
 * @param {Object} options - Configuration options
 * @param {string} options.containerId - ID of the container element (default: 'spinner-container')
 * @param {string} options.spinnerClass - CSS class for the spinner (default: 'loading-spinner')
 * @param {string} options.errorClass - CSS class for error state (default: 'error-state')
 */
function LoadingSpinner(options = {}) {
  this.containerId = options.containerId || 'spinner-container';
  this.spinnerClass = options.spinnerClass || 'loading-spinner';
  this.errorClass = options.errorClass || 'error-state';
  this.state = 'idle';
  this.errorMessage = null;
  this.container = null;
}

/**
 * Creates the spinner DOM element if it doesn't exist
 */
LoadingSpinner.prototype.createElement = function() {
  if (document.getElementById(this.containerId)) {
    this.container = document.getElementById(this.containerId);
    return;
  }

  this.container = document.createElement('div');
  this.container.id = this.containerId;
  this.container.style.display = 'none';
  this.container.innerHTML = `
    <div class="${this.spinnerClass}" aria-live="polite">
      <div class="spinner"></div>
      <span class="spinner-text">Loading...</span>
    </div>
    <div class="${this.errorClass}" style="display: none;" aria-live="assertive">
      <span class="error-message"></span>
      <button class="retry-btn">Retry</button>
    </div>
  `;
  document.body.appendChild(this.container);
};

/**
 * Shows the loading spinner
 */
LoadingSpinner.prototype.showLoading = function() {
  this.createElement();
  this.state = 'loading';
  this.errorMessage = null;
  
  const spinnerEl = this.container.querySelector('.' + this.spinnerClass);
  const errorEl = this.container.querySelector('.' + this.errorClass);
  
  if (spinnerEl) spinnerEl.style.display = 'flex';
  if (errorEl) errorEl.style.display = 'none';
  this.container.style.display = 'block';
};

/**
 * Hides the spinner (call after successful data load)
 */
LoadingSpinner.prototype.hide = function() {
  if (!this.container) return;
  
  this.state = 'success';
  this.container.style.display = 'none';
  
  const spinnerEl = this.container.querySelector('.' + this.spinnerClass);
  if (spinnerEl) spinnerEl.style.display = 'none';
};

/**
 * Shows an error message
 * @param {string} message - Error message to display
 */
LoadingSpinner.prototype.showError = function(message) {
  this.createElement();
  this.state = 'error';
  this.errorMessage = message || 'An error occurred';
  
  const spinnerEl = this.container.querySelector('.' + this.spinnerClass);
  const errorEl = this.container.querySelector('.' + this.errorClass);
  const errorMsgEl = errorEl ? errorEl.querySelector('.error-message') : null;
  
  if (spinnerEl) spinnerEl.style.display = 'none';
  if (errorEl) {
    errorEl.style.display = 'flex';
    if (errorMsgEl) errorMsgEl.textContent = this.errorMessage;
  }
  this.container.style.display = 'block';
};

/**
 * Gets the current state
 * @returns {string} Current state: 'idle', 'loading', 'success', or 'error'
 */
LoadingSpinner.prototype.getState = function() {
  return this.state;
};

/**
 * Gets the current error message
 * @returns {string|null} Error message or null
 */
LoadingSpinner.prototype.getError = function() {
  return this.errorMessage;
};

/**
 * Resets the spinner to idle state
 */
LoadingSpinner.prototype.reset = function() {
  this.state = 'idle';
  this.errorMessage = null;
  if (this.container) {
    this.container.style.display = 'none';
  }
};

/**
 * Wraps an async API call with loading spinner management
 * @param {Function} apiCall - Async function that makes the API call
 * @returns {Promise} Result of the API call
 */
LoadingSpinner.prototype.wrapApiCall = async function(apiCall) {
  this.showLoading();
  try {
    const result = await apiCall();
    this.hide();
    return result;
  } catch (error) {
    this.showError(error.message || 'Failed to fetch data');
    throw error;
  }
};

module.exports = { LoadingSpinner };
