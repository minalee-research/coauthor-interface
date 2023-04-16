$(function() {
  setupEditor();

  // Disable editor
  // quill.enable(false);  // NOTE Not desirable as it hides cursor

  /* Check whether it is replay mode */
  let sessionId = getSessionId();
  let mode = getMode();
  let range = getStartEnd();

  if (sessionId !== null) {
    if (mode === 'final') {
      showFinalStoryWithSessionId(sessionId);
    } else {
      replayLogsWithSessionId(sessionId, range);
    }
  } else {
    alert('Could not retrieve replay session with ID:' + sessionId);
  }
});
