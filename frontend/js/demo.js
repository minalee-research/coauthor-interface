// Overwrite the loading signal
function showLoadingSignal() {
  $('#loading-signal').removeClass('do-not-display');
}

function hideLoadingSignal() {
  $('#loading-signal').addClass('do-not-display');
  $('#loading-message').text('Getting suggestions!');
}
