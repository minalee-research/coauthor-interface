/* Wiggle icons upon mouse over */
$('button').hover(
  function() {
    $(this).children('i').addClass('wiggle');
  }, function() {
    $(this).children('i').removeClass('wiggle');
  }
);

$('i').hover(
  function() {
    $(this).addClass('wiggle');
  }, function() {
    $(this).removeClass('wiggle');
  }
);

function showLoadingSignal(message) {
  $('#robot').addClass('spin');
  // Ignore message for default loading signal
}

function hideLoadingSignal() {
  $('#robot').removeClass('spin');
}
