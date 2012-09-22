/*
 * OpenSearchlight
 * https://github.com/nsidc/OpenSearchlight
 */

// ## About
//
// OpenSearchlight is a client library to access [OpenSearch](http://www.opensearch.org) services.
//
//
// ## Usage
//
// `openSearchService` is the primary entry point to OpenSearchlight. Use it to
// generate an `OpenSearchQuery` instance. The OSDD of the service is
// retrieved, parsed, and passed into the `OpenSearchQuery` instance which is
// in turn passed to a callback function. Handling and parsing of the OSDD
// itself is handled by instances of `OpenSearchDescriptionDocument`.
//
// Use the query object (passed as the callback's parameter) to hit the search
// service and get back results.
//
// Typical usage:
//
//     OpenSearchlight.openSearchService.query(
//        "http://www.example.com/opensearch?description", 
//        function (query) {
//           query
//              .set("searchTerms", "some search words")
//              .set("startPage", "20")
//              .set("resultsPerPage", "100")
//              .setContentType("text/xml")
//              .execute({
//                 success: function (data) {
//                    // data contains results!
//                 },
//                 error: function (jqXHR, textStatus, errorThrown) {
//                    // error handling...
//                 }
//              });
//        });
//
// ## OpenSearchlight
//
// Declare the global object everything lives in
var OpenSearchlight = OpenSearchlight || {};

