function ghReq(login, password, method, path, data, callback) {
  if (arguments.length == 3)
    callback = data;

  var authorizationValue = 'Basic ' + Base64.encode(login + ':' + password);

  return $.ajax({
    contentType: 'application/json',
    data: JSON.stringify(data),
    headers: {Authorization: authorizationValue},
    type: method,
    url: 'https://api.github.com' + path
  });
}

function openSource(login, password, owner, repo) {
  return ghReq(login, password, 'PATCH', '/repos/' + owner + '/' + repo, {
    name: repo,
    'private': false
  });
}

function getRepos(login, password) {
  return ghReq(login, password, 'GET', '/user/repos');
}

var credentials = {};

var loginView = $('#login-view');
var readyView = $('#ready-view');
var selectView = $('#select-view');

var loginForm = $('.login-form');
var loginButton = loginForm.find('.btn');
loginForm.on('submit', function(e) {
  var login = loginForm.find('#inputLogin').val();
  var password = loginForm.find('#inputPassword').val();

  loginButton.attr('disabled', true).html('Signing in...');

  getRepos(login, password)
    .always(function() {
      loginButton.attr('disabled', false).html('Sign in');
    })
    .done(function(repos) {
      credentials.login = login;
      credentials.password = password;
      loginView.hide();
      selectView.show();

      var adminRepos = _.chain(repos)
        .filter(function(repo) {
          return repo.permissions.admin;
        })
        .each(function(repo) {
          var itemView = $('<a>')
            .html(repo.full_name)
            .addClass('repo')
            .attr({
              'data-owner': repo.owner.login,
              'data-repo': repo.name,
              href: '#'
            });
          $('.repos').append($('<li>').html(itemView));
        });
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      loginView.find('.error')
        .html('Error: ' + errorThrown || 'Unknown. CORS fail? Check URL')
        .show();
    });

  return false;
});

selectView.delegate('.repo', 'click', function(e) {
  var owner = $(e.target).attr('data-owner');
  var repo = $(e.target).attr('data-repo');
  selectView.hide();
  readyView.show();
  waitForButton(owner, repo);
});

function waitForButton(owner, repo) {
  $('.admin-link').attr('src', repoUrl(owner, repo) + '/admin');
  socket.on('opensource', function() {
    openSource(credentials.login, credentials.password, owner, repo)
      .fail(function(jqXHR, textStatus, errorThrown) {
        console.log(arguments);
        readyView.find('.error')
          .append(JSON.parse(jqXHR.responseText).message)
          .show();
      })
      .done(function() {
        showCountdown(function(){
          showRepo(owner, repo);
        });
      });
  });
}

function repoUrl(owner, repo) {
  return 'https://github.com/' + owner + '/' + repo;
}

function showCountdown(callback) {
  $('<audio>')
  .attr({
    src: 'drumroll.mp3',
    autoplay: true
  })
  .appendTo($('body'));
  $('.cat')
    .css('background-image', 'url(img/cat.gif?' + (+new Date()) + ')')
    .removeClass('hide');
  setTimeout(function() { $('.line1').show(); }, 1000);
  setTimeout(function() { $('.line2').show(); }, 3000);
  setTimeout(function() { $('.line3').show(); }, 5000);
  setTimeout(callback, 6500);
}

function showRepo(owner, repo) {
  location.href = repoUrl(owner, repo);
}

var opensourced = false;
var socket = io.connect(location.href);

