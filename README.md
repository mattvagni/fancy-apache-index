Fancy Apache Index
==================

A little hack to make default apache indexes less fugly & more usable while requiring minimal setup.

Inspired by [Apaxy](http://adamwhitcroft.com/apaxy/) by [Adam Whitcroft](http://adamwhitcroft.com/)


How to 'Install'
--
To install just drag and drop the `theme` and `.htaccess` file in your root directory that apache is serving. You must have apache running but shouldn't need to do anything special since it's only dependency is  [Apache's mod_autoindex module](http://httpd.apache.org/docs/2.2/mod/mod_autoindex.html) which is part of the the Apache base modules anyways.


How to contribute/customize stuff
--
There is no development/production mode. If you want to customize or modify the theme just run `npm install` within the theme directory and then run `grunt watch`. That will take care of doing anything necessary to make your modifications work. The only slightly weird 'thing' is the way the templates are set-up. The grunt `precompileUnderscoreTemplates` task is a good place to start if you need to/want to add any templates. You will need to have grunt watch running if you make __any__ changes including just changing an image asset.

`grunt build` runs all build tasks too if you forgot to run watch before making changes.


How does it work?
--
To avoid any Apache magic and make this as easy to use as possible, all the heavy lifting is done in the browser. Basically, the whole theme works by by including some html before Apache's auto-rendered html (using the [`HeaderName`](http://httpd.apache.org/docs/2.2/mod/mod_autoindex.html#headername) property) and after (using the [`ReadmeName`]('http://httpd.apache.org/docs/2.2/mod/mod_autoindex.html#readmename') property).

Then some javascript parses Apache's auto-generated table and renders a completely new UI. This is so that the interface and design isn't limited by the the default table mark-up that Apache spits out and, for example, allow for sensible interface adjustments for smaller screens and touch devices.

Based on the URL we also render breadcrumbs to help the user get back to a higher directory without having to click "Parent Directory" multiple times such as in Apache's default UI.

To make it all a bit nicer we also manage history in the browser so that we can use animations to give users a sense of the direction they are navigating in: If page they are navigating to is a 'shallower' or 'deeper' then the current page they are on.


Feedback
--
Twitter is probably easiest: [@mattvagni](http://www.twitter.com/mattvagni)

