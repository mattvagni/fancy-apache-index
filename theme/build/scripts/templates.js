var templates = {};

templates.breadcrumbs = function(obj) {
  var __t, __p = '',
    __j = Array.prototype.join,
    print = function() {
      __p += __j.call(arguments, '');
    };
  with(obj || {}) {
    __p += '<div class="breadcrumbs-wrapper">\n    ';
    for (var i = 0; i < breadcrumbs.length; i++) {
      var breadcrumb = breadcrumbs[i];
      __p += '\n        ';
      if (breadcrumb.link === window.location.href) {
        __p += '\n            <div class="breadcrumb">\n                ' +
          ((__t = (breadcrumb.name)) == null ? '' : __t) +
          '\n            </div>\n        ';
      } else {
        __p += '\n            <a class="breadcrumb" href="' +
          ((__t = (breadcrumb.link)) == null ? '' : __t) +
          '">\n                ' +
          ((__t = (breadcrumb.name)) == null ? '' : __t) +
          '\n            </a>\n        ';
      }
      __p += '\n        <span class="breadcrumb-divider">/</span>\n    ';
    };
    __p += '\n</div>';
  }
  return __p;
};

templates.directory = function(obj) {
  var __t, __p = '',
    __j = Array.prototype.join,
    print = function() {
      __p += __j.call(arguments, '');
    };
  with(obj || {}) {
    __p += '<div class="directory wrapper">\n\n    <div class="directory-header">\n    ';
    if (title) {
      __p += '\n        <h1>' +
        ((__t = (title)) == null ? '' : __t) +
        '</h1>\n    ';
    } else {
      __p += '\n        <img src="/theme/build/images/logo.png" class="logo" width="44" height="40">\n    ';
    }
    __p += '\n    </div>\n\n    <div class="directory-listing">\n\n        ';
    if (folders.length) {
      __p += '\n\n            ';
      for (var i = 0; i < folders.length; i++) {
        var folder = folders[i];
        __p += '\n                <a class="listing format ' +
          ((__t = (folder.format)) == null ? '' : __t) +
          '" href="' +
          ((__t = (folder.link)) == null ? '' : __t) +
          '">\n                    ' +
          ((__t = (folder.name)) == null ? '' : __t) +
          '\n\n                    ';
        if (folder.fileSize) {
          __p += '\n                        <span class="listing-file-size">' +
            ((__t = (folder.fileSize)) == null ? '' : __t) +
            '</span>\n                    ';
        }
        __p += '\n                </a>\n            ';
      };
      __p += '\n\n        ';
    } else {
      __p += '\n\n            <div class="empty-folder-notice">\n                <p>This folder is empty :(</p>\n                <img class="r2d2" src="http://media2.giphy.com/media/n7Kv7tLf2UzMk/200.gif">\n            </div>\n\n        ';
    }
    __p += '\n    </div>\n\n    <button class="seo-bullshit">' +
      ((__t = (seoBullshit)) == null ? '' : __t) +
      '</button>\n</div>';
  }
  return __p;
};