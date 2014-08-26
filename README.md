# OpenSearchlight

A JavaScript OpenSearch client that configures itself around an OpenSearch
Description Document, making queries against OpenSearch services a little
easier from JS clients.

## Download
Download the [minified version][min] or the [development version][max].

[min]: https://raw.github.com/nsidc/OpenSearchlight/gh-pages/OpenSearchlight-0.4.0.min.js
[max]: https://raw.github.com/nsidc/OpenSearchlight/gh-pages/OpenSearchlight-0.4.0.js

## Usage

Assuming you're trying to use an OpenSearch service whose OSDD
at http://www.example.com/opensearch?description contains the following:

```xml
<?xml version="1.0" encoding="UTF-8"?>
 <OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
   <ShortName>Web Search</ShortName>
   <Description>Use Example.com to search the Web.</Description>
   <Url type="application/atom+xml"
        template="http://example.com/?q={searchTerms}&amp;pw={startPage?}&amp;n={resultsPerPage?}&amp;format=atom"/>
   <Url type="text/html"
        template="http://example.com/?q={searchTerms}&amp;pw={startPage?}&amp;n={resultsPerPage?}"/>
   <Query role="example" searchTerms="cat" />
 </OpenSearchDescription>
```

In your web page, the following code will retrieve search results for "steely",
in ATOM format, starting at the second page with ten results per page:

```html
<script src="jquery.js"></script>
<script src="OpenSearchlight.min.js"></script>
<script>
OpenSearchlight.query({
   osdd: "http://www.example.com/opensearch?description",
   contentType: "application/atom+xml",
   requestHeaders: [{name: "X-Requested-With", value: "MyApp"}],
   parameters: {
      searchTerms: "steely",
      startPage: "2",
      resultsPerPage: "10"
   },
   success: function (data) {
      // data contains results!
   },
   error: function (jqXHR, textStatus, errorThrown) {
      // error handling...
   }
});
</script>
```

## Documentation
See the [annotated source][annotated_source].

[annotated_source]: http://nsidc.github.com/OpenSearchlight/

## License
OpenSearchlight is licensed under the MIT license.  See [LICENSE.txt][license].

[license]: https://raw.github.com/nsidc/OpenSearchlight/master/LICENSE.txt

## Credit

This software was developed by the National Snow and Ice Data Center, sponsored
by National Science Foundation grant number OPP-10-16048.

## Release History
* 0.4.0
  * Added optional requestHeaders parameter to OpenSearchQuery
* 0.3.0
  * OSDD fetch will now call error callback on request failure.
* 0.2.3
  * Added an optional callback function in OpenSearchQuery API
* 0.2.2
  * Upgraded to Grunt 0.4
* 0.2.1
  * Added a simpler API
  * Fixed a bug handling optional parameters
* 0.1.2
  * Fixed bug preventing empty optional parameters from being filled with empty string
  * Added Release Checklist to documentation
* 0.1.1
  * Documentation fixes
* 0.1.0
  * Initial release

OpenSearchlight uses [semantic versioning][semver].

[semver]: http://semver.org/

## Developer Notes

Please don't edit files in the `dist` subdirectory as they are generated via
grunt. You'll find source code in the `src` subdirectory!

While grunt can run the included unit tests via PhantomJS, this shouldn't be
considered a substitute for the real thing. Please be sure to test the
`test/*.html` unit test file(s) in _actual_ browsers.

### Release Checklist

* Make change to code
* Update version number in `OpenSearchlight.pkg.json`
* In `README.md` update version numbers in Download and Release History sections
* Run `grunt` and ensure all tests pass (run `git submodule update --init` first)
* Run `grunt docs` to generate updated source documentation
* Run `test/*.html` in the browser and ensure all tests pass
* Check changes in to Git master
* Make changes to the `gh-pages` branch:
  * Add the new minified and development .js file
  * Update index.html (and docco.css if necessary) from `dist/docs/OpenSearchlight-<VERSION>.html`


### Install and Build

_This assumes you have [node.js](http://nodejs.org/) and [npm](http://npmjs.org/) installed already._

1. Ensure all git submodules have been retrieved: `git submodule update --init`
2. Test that grunt is installed globally by running `grunt --version` at the command-line.
3. If grunt isn't installed globally, run `npm install -g grunt-cli` to install the latest version. _You may need to run `sudo npm install -g grunt-cli`._
4. From the root directory of this project, run `npm install` to install the project's dependencies.
5. Run `grunt` from the root directory to run the tests and build the packages and documentaion.

## How to contact NSIDC ###

User Services and general information:  
Support: http://support.nsidc.org  
Email: nsidc@nsidc.org

Phone: +1 303.492.6199  
Fax: +1 303.492.2468

Mailing address:  
National Snow and Ice Data Center  
CIRES, 449 UCB  
University of Colorado  
Boulder, CO 80309-0449 USA
