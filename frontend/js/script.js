window.wwai = window.wwai || {};

(function(wwai) {
  wwai.api = {};

  function getUrl(api_method) {
    return serverURL + '/api/' + api_method;
  }

  async function serverFetch(api_method, arg_dict) {
    return fetch(getUrl(api_method), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(arg_dict)
    }).then(async response => {
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(await response.text());
      }
    });
  }

  wwai.api.startSession = async function(domain, accessCode) {
    try {
      const session = await serverFetch("start_session", {
        'domain': domain,
        'accessCode': accessCode,
      });
      return session;
    } catch (e) {
      alert('Oops, we had an error starting your writing session with your access code!\n\n' + accessCode + '\n\nPlease try refreshing this page again. If the problem persists, please notify ' + contactEmail + ' to help us fix the problem. Our sincere apologies for the inconvenience!\n\n' + e);
      return;
    }
  };

  wwai.api.endSession = async function(sessionId, logs) {
    try {
      const results = await serverFetch("end_session", {
        'sessionId': sessionId,
        'logs': logs,
      });
      return results;
    } catch (e) {
      alert('Oops, we had an error saving your writing session! Please share a screenshot of this message with ' + contactEmail + ' to help us fix the problem. Our sincere apologies for the inconvenience!\n\n' + e);
      return;
    }
  };

  wwai.api.saveLog = async function() {
    console.log('[wwai.api.saveLog] sessionId:' + sessionId);
    console.log('[wwai.api.saveLog] logs.length:' + logs.length);

    const results = await serverFetch('save_log', {
      'sessionId': sessionId,
      'logs': logs
    });
    return results;
  };

  wwai.api.getLog = async function(replaySessionId) {
    const results = await serverFetch("get_log", {
      'sessionId': replaySessionId,
      'domain': domain,
    });
    return results;
  };
})(window.wwai);
