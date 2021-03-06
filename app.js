(function() {

  return {
    events: {
      'app.activated':'this.loadResults',
    },

    requests: {
      getIssuesRequest: function(email, externalId) {
        var url = (this.setting('host') + '/api/0/organizations/' +
                   this.setting('orgName') + '/users/issues/');

        return {
          url: url,
          data: {
              'email': email,
              'limit': 5
          },
          type: 'GET',
          dataType: 'json',
          headers: {
            "Authorization": "Bearer {{setting.token}}"
          },
          secure: true
        };
      }
    },

    loadResults: function() {
      var target = (this.currentLocation() == 'ticket_sidebar' ?
                    this.ticket().requester() : this.user()),
          externalId = target.externalId(),
          email      = target.email();

      this.ajax('getIssuesRequest', email, externalId)
      .fail(function(err) {
          var message = 'API call returned a ' + err.status;

          if (err.status == 401 && err.responseJSON && err.responseJSON.detail) {
            message = err.responseJSON.detail;
          } else if (err.status == 404) {
            message = "Couldn't find your organization or project. Double check the app's settings.";
          }

          this.switchTo('error', {
            'message': message
          });


      }).done(function(data) {
        _.each(data, function(i) {
          i.firstSeen = moment(i.firstSeen).fromNow(true);
          i.lastSeen = moment(i.lastSeen).fromNow(true);
        });

        this.switchTo('issues', {
          'issues': data
        });
      });
    }
  };

}());
