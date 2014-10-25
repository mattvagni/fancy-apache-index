(function(){

    var firstPageLoad = true;
    var currentPath = window.location.pathname;
    var catMode = false;
    var selectors = {
        apacheHtml : '#apache-html',
        directories : '.directory',
        listings : '.listing',
        folders : '.folder',
        breadcrumbsWrapper : '.breadcrumbs-wrapper',
        breadcrumbs : '.breadcrumb',
        seoBullshit : '.seo-bullshit'
    };

    /*
    Get the format of a file or folder from it's name.

    @param filename - The filename, string
    */
    function getFileType(filename) {

        if (filename.substring(filename.length - 1) == '/'){
            return 'folder';
        }

        var pieces = filename.split('.');

        if (pieces.length === 1){
            return 'noformat';
        }

        return pieces[pieces.length - 1];
    }

    /*
    Get the title from a path.

    If you are on the root (i.e. on the homepage) return nothing
    since there is no folder or file to get the name from and the url is
    probably less then descriptive.

    @param path - The path from which you want to infer the title
    */
    function getTitle(path){
        var pieces = path.split('/');
        var title = decodeURIComponent(pieces[pieces.length - 2]);

        return title;
    }

    /*
    Start Cat Mode. Yes. You heard right.
    */
    function setRandomCat(){
        var numberOfCats = 127;
        var cat = '/theme/build/images/cats/' + Math.floor(Math.random() * numberOfCats) + '.gif';

        $('html').css('background-image', 'url(' + cat + ')');

        catMode = true;
    }

    /*
    Get random bullshit for the fake SEO ads at the bottom.
    */
    function getRandomBullshit() {
        var texts = [
            "Improve your SEO",
            "How to find lots of cat's with this one weird trick",
            "Hot local cats",
            "25 SEO resolutions for this year",
            "Top 50 SEO friendly cats"
        ];

        return texts[Math.floor(Math.random()*texts.length)];
    }

    /*
    Set the page title for a given path.

    @param path - The path you want to set the title for, string
    */
    function setPageTitle(path){
        var title = getTitle(path);

        if (title){
            $('title').text(title);
        } else {
            $('title').text(window.location.origin.split('/')[3]);
        }

    }

    /*
    Returns a list of files and folders from the shitty auto
    generated Apache html.

    @param html - The html you would like to parse.
    */
    function makeDirectoryJson(path, html) {

        var directory = [];
        var $html = $(html);

        $html.find('tr').each(function(index, row){

            var rowContents = [];
            var directoryItem = {};
            var $tds = [];

            // The first row is the header row, we don't need it.
            if (index === 0){
                return;
            }

            $tds = $(row).find('td');

            directoryItem.name = $tds.eq(1).text();
            directoryItem.lastModified = $tds.eq(2).text();
            directoryItem.format = getFileType(directoryItem.name);

            if (directoryItem.format !== 'folder') {
                directoryItem.fileSize = $tds.eq(3).text().trim();

                if (!directoryItem.fileSize.match(/[a-z]/gi)){
                    // If the filesize is less the 1kb, Apache doesn't output a unit.
                    directoryItem.fileSize += 'B';
                }
            }

            // Apache's templates by default have relative paths to the directory
            // you are in. Since we are using pushstate it's much easier to have
            // a relative path from the root. So from the page '/Foo/Bar/'
            // we want '/Foo/Bar/FolderName' instead of just 'FolderName/'
            directoryItem.link = path + $tds.eq(1).find('a').attr('href');

            // We don't want the 'Parent Directory' links
            if (directoryItem.name === 'Parent Directory'){
                return;
            }

            directory.push(directoryItem);
        });

        return directory;
    }

    /*
    Get the directory html from either the page you are on or via ajax.

    @param path - the relative path from the root for which you want to get the directory
    @param callback - called with the json directory. If this errors out it's called with no args.
    */
    function getDirectoryHtml(path, callback){
        var directory = {
            title : getTitle(path),
            seoBullshit : getRandomBullshit()
        };

        if (path === currentPath){
            directory.folders = makeDirectoryJson(path, $(selectors.apacheHtml).html());
            callback(directory);
        }
        else {
            $.get(path, function(response){

                var $apacheHtml = $(response).filter(selectors.apacheHtml).html();

                if ($apacheHtml){
                    directory.folders = makeDirectoryJson(path, $apacheHtml);
                    callback(directory);
                } else {
                    callback();
                }
            });
        }
    }

    /*
    Render a Directory

    Besides appending, also takes care of animating a new directory in correctly.

    @param directory - The directory structure as json.
    @param animationName - The animation name: 'fade', 'swipeFromRight' or 'swipeFromLeft'
    */
    function renderDirectory(directory, animationName){
        var animationLength = 200;
        var $oldDirectory = $(selectors.directories)
                                .addClass(animationName);

        var $newDirectory = $(templates.directory(directory))
                                .addClass(animationName)
                                .appendTo(document.body);

        $oldDirectory
            .addClass('animateOut');

        setTimeout(function(){
            $newDirectory.addClass('show');
            $oldDirectory.remove();

            setTimeout(function(){
                //  Nasty but neccessary: After the animation we need to remove the
                // animation class. We wait a bit longer then then animation length
                // to make sure we don't break the animation before it's done since
                // animation times can vary from device to device.
                $newDirectory.removeClass(animationName);
            }, animationLength * 1.3);

        }, animationLength);

        if (catMode){
            // Update the cat on each new directory if in cat mode.
            setRandomCat();
        }
    }

    /*
    Get Breadcrumbs for the a passed path.

    @param path - The path for which you want to get the breadcrumbs.
    */
    function getBreadcrumbs (path) {

        var breadcrumbs = [{
            link : '/',
            name : 'Home'
        }];
        var pieces = path.split('/');

        for (var i = 0; i < pieces.length; i++) {
            var part = pieces[i];

            if (part){ // There are some empty strings.
                breadcrumbs.push({
                    link : path.substring(0, path.indexOf(part) + 1 + part.length),
                    name : decodeURIComponent(part)
                });
            }
        }

        return breadcrumbs;
    }

    /*
    Render Breadcrumbs

    @param path - The full path for which to render breadcrumbs.
    */
    function renderBreadcrumbs (path) {
        var breadcrumbs = getBreadcrumbs(path);
        var $oldBreadcrumbs = $(selectors.breadcrumbsWrapper);
        var $newBreadcrumbs = $(templates.breadcrumbs({ breadcrumbs : breadcrumbs }));

        if ($oldBreadcrumbs.length){
            $oldBreadcrumbs.html($newBreadcrumbs.html());
        } else {
            $newBreadcrumbs.appendTo(document.body);
        }
    }

    /*
    Animate a quick wiggle on the directory to highlight an error case
    */
    function bounceDirectory(){
        var animationClass = 'bounce';
        var $directories = $(selectors.directories).removeClass(animationClass);

        setTimeout(function(){
            $directories.addClass(animationClass);
        }, 20);
    }

    /*
    Given a path this figures out what to do.

    @param path - The full path you want to go to.
    @param pushState - Boolean to make a new history state or not.
    */
    function routeTo(path, pushState){

        console.log({
            "Is path == currentPath" : path == currentPath,
            "Is first page load?" : firstPageLoad
        });

        if (path === currentPath & !firstPageLoad){
            // If we are trying to load the page we are on
            // and this isn't the first page load.
            bounceDirectory();
            return;
        }

        // Get the page we want to load.
        getDirectoryHtml(path, function(directory){

            if (!directory){
                // In case the page at the passed path has an index.html
                // or is, for some other reason, not an apache index
                // let's just go there and check it out without pushing state.
                window.location.pathname = path;
                return;
            }

            if (path === currentPath){
                // If we are loading the page you are...
                // (likely a refresh or the first page load)
                renderDirectory(directory, 'fade');
            }
            else if (path.length > currentPath.length){
                // If we are loading a 'deeper' directory ...
                renderDirectory(directory, 'swipeFromRight');
            } else {
                // If we are loading a directory higher up ...
                renderDirectory(directory, 'swipeFromLeft');
            }

            if (pushState){
                history.pushState({}, '', path);
            }

            // Whenever we route, update the currentPath
            // for subsequent request.
            currentPath = path;
        });

        // We don't really have to wait to get the directory
        // back in order to render breadcrumbs & set the page title.
        renderBreadcrumbs(path);
        setPageTitle(path);
    }

    /*
    Deselect all Listings
    */
    function deselectListings() {
        $(selectors.listings).removeClass('active');
    }

    /*
    Keydown Event Handler
    */
    function onKeyDown(event) {

        var keyCode = event.keyCode;
        var activeListing = selectors.listings + '.active';
        var listings = selectors.listings;
        var $activeListing = $(activeListing);
        var $nextListing = {};

        switch (keyCode) {

            case 38: // up arrow

                if ($activeListing.length) {
                    $nextListing = $activeListing.prev(listings);

                    if (!$nextListing.length) {
                        $nextListing = $(listings).last();
                    }

                    $activeListing.removeClass('active');
                    $nextListing.addClass('active');

                } else {
                    $(listings)
                        .last()
                        .addClass('active');
                }

                break;

            case 40: // down arrow
            case 9: // tab
                event.preventDefault();

                if ($activeListing.length) {
                    $nextListing = $activeListing.next(listings);

                    if (!$nextListing.length) {
                        $nextListing = $(listings).first();
                    }

                    $activeListing.removeClass('active');
                    $nextListing.addClass('active');

                } else {
                    $(listings)
                        .first()
                        .addClass('active');
                }
                break;

            case 27: // escape
                deselectListings();
                break;

            case 13: // return
            case 39: // right arrow
                $activeListing
                    .trigger('click');

                break;

            case 37: // left arrow
                var $breadcrumbs = $(selectors.breadcrumbs);
                var $secondLastBreadcrumb = $breadcrumbs.eq($breadcrumbs.length - 2);
                // zepto's .eq() will default to the closest index. That means
                // that if there is only 1 breadcrumb it will return that instead of the
                // second last. That means we don't have to handle that as a special case.
                $secondLastBreadcrumb.click();
                break;
        }
    }

    /*
    Event handler for clicks on folders. I'm not even shitting you.
    */
    function onFolderClick(event){
        if (event.metaKey) {
            return;
        }

        event.preventDefault();
        routeTo($(this).attr('href'), true);
    }


    /*
    Popstate event handler. I know right?!
    */
    function onPopstate(event){
        if (!firstPageLoad){
            routeTo(window.location.pathname);
        }

        firstPageLoad = false;
    }

    /*
    Hover event handler
    */
    function onListingHover(event) {
        deselectListings();
        $(this).addClass('active');
    }

    /*
    Render the first directory to get things going.
    */
    routeTo(window.location.pathname);

    $(document)
        .on('keydown', onKeyDown)
        .on('mouseover', selectors.listings, onListingHover)
        .on('click', selectors.folders, onFolderClick)
        .on('click', selectors.breadcrumbs, onFolderClick)
        .on('mouseleave', selectors.directories, deselectListings)
        .on('click', selectors.seoBullshit, setRandomCat);

    $(window).on('popstate', onPopstate);

    $(window).on('load', function(){
        FastClick.attach(document.body);
    });

})();
