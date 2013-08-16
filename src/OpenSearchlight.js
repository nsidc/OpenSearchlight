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
//     OpenSearchlight.query({
//        osdd: "http://www.example.com/opensearch?description",
//        contentType: "text/xml",
//        requestHeaders: [{name: "X-Requested-With", value: "MyApp"}]
//        parameters: {
//           searchTerms: "some search words",
//           startPage: "20",
//           resultsPerPage: "100"
//        },
//        success: function (data) {
//           // data contains results!
//        },
//        error: function (jqXHR, textStatus, errorThrown) {
//           // error handling...
//        }
//     });
//
// The above is equivalent to the following code, which uses the objects in the
// API explicitly:
//
//     OpenSearchlight.openSearchService.query(
//        "http://www.example.com/opensearch?description", 
//        function (query) {
//           query
//              .set("searchTerms", "some search words")
//              .set("startPage", "20")
//              .set("resultsPerPage", "100")
//              .setContentType("text/xml")
//              .setRequestHeaders([{name: "X-Requested-With", value: "MyApp"}])
//              .execute({
//                 success: function (data) {
//                    // data contains results!
//                 },
//                 error: function (jqXHR, textStatus, errorThrown) {
//                    // error handling...
//                 }
//              });
//        });

// ## OpenSearchlight

// Declare the global object everything lives in
var OpenSearchlight = OpenSearchlight || {};

(function () {
  // Top-level facade for all the rest of the API.
  //
  // * `params`: object literal, containing:
  //   * `osdd`: URL of the OpenSearch service's OSDD
  //   * `parameters`: search parameters to substitute into the search templates
  //   * `success`: callback function to call with the results. The results will be passed as the first argument to the function.
  //   * `requestHeaders`: optional array of HTTP request headers in the form of name,value pair objects.
  //   * `contentType`: contentType requested of the service
  //   * `error`: callback function if the opensearch query fails
  OpenSearchlight.query = function (params) {
    var queryFunction;

    OpenSearchlight.ensureParamsNotEmpty(params);
    OpenSearchlight.ensureParamsHasOsdd(params);
    OpenSearchlight.ensureParamsHasSuccessHandler(params);

    queryFunction = OpenSearchlight.generateOsddSuccessFn(params);
    OpenSearchlight.openSearchService.query(params.osdd, queryFunction, params.error);
  };

  // Generator for the onSuccess method used when the OSDD is
  // successfully retrieved
  OpenSearchlight.generateOsddSuccessFn = function (params) {
     return function(query) {
        var queryParams;

        if (params instanceof Object) {
           // Extract query parameters
           _.each(params.parameters, function (val, key) {
              query.set(key, val);
           });

           // Extract desired content type
           if (params.contentType !== undefined) {
              query.setContentType(params.contentType);
           }
           // Extract desired HTTP request headers
           if (params.requestHeaders !== undefined) {
              query.setRequestHeaders(params.requestHeaders);
           }           
        }

        queryParams = OpenSearchlight.extendWith({}, params, ["success", "error", "queryXhr"]);
        query.execute(queryParams);
     };
  };

  // Copy selected properties from the `src` object to the `dest` object.
  // Returns a new object with the combined properties.
  //
  // * `dest`: object that new properties are added to
  // * `src`: object that properties are copied from
  // * `props`: a property or a list of properties to copy
  OpenSearchlight.extendWith = function(dest, src, props) {
     var result = _.extend(dest),
         propsToCopy = [];

     if (typeof src !== "object") {
        return dest;
     }

     propsToCopy = arrayify(props);

     _.each(propsToCopy, function(prop) {
        if (src.hasOwnProperty(prop)) {
           result[prop] = src[prop];
        }
     });

     return result;
  };

  // ## Helper functions for OpenSearchlight

  // Converts scalar arguments into arrays with the scalar as the first array element.
  function arrayify(p) {
     var a = [];
     if (_.isArray(p)) {
        return p;
     } else {
        a.push(p);
        return a;
     }
  }

  OpenSearchlight.ensureParamsNotEmpty = function(params) {
    if (params === undefined) {
       throw new Error("Must pass a params object");
    }
  };

  OpenSearchlight.ensureParamsHasOsdd = function (params) {
    if (typeof params.osdd !== "string") {
       throw new Error("Must pass an osdd value in the params object");
    }
  };

  OpenSearchlight.ensureParamsHasSuccessHandler = function (params) {
    if (typeof params.success !== "function") {
       throw new Error("Must pass a success handler in the params object");
    }
  };

}());
