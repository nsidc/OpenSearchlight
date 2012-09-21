# OpenSearchlight

A JavaScript OpenSearch client that configures itself around an OpenSearch
Description Document, making queries against OpenSearch services a little
easier from JS clients.

## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/truslove/OpenSearchlight/master/dist/OpenSearchlight.min.js
[max]: https://raw.github.com/truslove/OpenSearchlight/master/dist/OpenSearchlight.js

In your web page:

```html
<script src="jquery.js"></script>
<script src="OpenSearchlight.min.js"></script>
<script>
OpenSearchlight.openSearchService.query(
   "http://www.example.com/opensearch?description",
   function (query) {
      query
         .set("searchTerms", "some search words")
         .set("startPage", "20")
         .set("resultsPerPage", "100")
         .setContentType("text/xml")
         .execute({
            success: function (data) {
               // data contains results!
            },
            error: function (jqXHR, textStatus, errorThrown) {
               // error handling...
            }
         });
   });
</script>
```

## Documentation
See the [annotated source](http://github.com/nsidc/OpenSearchlight/docs/OpenSearchlight-0.1.0.html).

## License
OpenSearchlight is licensed under the MIT license.  See `LICENSE.txt`.

## Credit

This software was developed by the National Snow and Ice Data Center under NSF
award number *TODO* XXXXXXX.

## Release History

* 0.1.0
  * Initial release

## Developer Notes

Please don't edit files in the `dist` subdirectory as they are generated via
grunt. You'll find source code in the `src` subdirectory!

While grunt can run the included unit tests via PhantomJS, this shouldn't be
considered a substitute for the real thing. Please be sure to test the
`test/*.html` unit test file(s) in _actual_ browsers.

### Install and Build

_This assumes you have [node.js](http://nodejs.org/) and [npm](http://npmjs.org/) installed already._

1. Test that grunt is installed globally by running `grunt --version` at the command-line.
2. If grunt isn't installed globally, run `npm install -g grunt` to install the latest version. _You may need to run `sudo npm install -g grunt`._
3. From the root directory of this project, run `npm install` to install the project's dependencies.
4. Run `grunt` from the root directory to run the tests and build the packages and documentaion.

### Installing PhantomJS

In order for the qunit task to work properly,
[PhantomJS](http://www.phantomjs.org/) must be installed and in the system PATH
(if you can run "phantomjs" at the command line, this task should work).

Unfortunately, PhantomJS cannot be installed automatically via npm or grunt, so
you need to install it yourself. There are a number of ways to install
PhantomJS.

* [PhantomJS and Mac OS X](http://ariya.ofilabs.com/2012/02/phantomjs-and-mac-os-x.html)
* [PhantomJS Installation](http://code.google.com/p/phantomjs/wiki/Installation) (PhantomJS wiki)

Note that the `phantomjs` executable needs to be in the system `PATH` for grunt to see it.

* [How to set the path and environment variables in Windows](http://www.computerhope.com/issues/ch000549.htm)
* [Where does $PATH get set in OS X 10.6 Snow Leopard?](http://superuser.com/questions/69130/where-does-path-get-set-in-os-x-10-6-snow-leopard)
* [How do I change the PATH variable in Linux](https://www.google.com/search?q=How+do+I+change+the+PATH+variable+in+Linux)
