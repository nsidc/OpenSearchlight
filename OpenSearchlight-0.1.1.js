/*! Opensearchlight - v0.1.1 - 2012-09-28
* https://github.com/nsidc/OpenSearchlight
* Copyright (c) 2012 Regents of the University of Colorado; Licensed MIT */

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


(function ($, _) {
  var OpenSearchQuery;

  //
  // **OpenSearchQuery** wraps up your query on an OpenSearch endpoint.
  //
  OpenSearchQuery = OpenSearchlight.OpenSearchQuery = function () {
    this.initialize.apply(this, arguments);
  };

  // Instance methods
  _.extend(OpenSearchQuery.prototype, {

    // "constructor" - requires the xml of an OSDD or a fully formed OpenSearchDescriptionDocument
    initialize: function (osddXml) {
      if (arguments.length === 0) {
        throw new Error("Must pass OSDD's XML");
      }

      if (osddXml instanceof OpenSearchlight.OpenSearchDescriptionDocument) {
        this.openSearchDescriptionDocument = osddXml;
      } else if (typeof osddXml === "string") {
        this.openSearchDescriptionDocument = this.createOpenSearchDescriptionDocument(osddXml);
      } else {
        throw new Error("Invalid argument to OpenSearchQuery");
      }

      this.searchParams = {};
    },

    // Set a search parameter.  Chainable method.
    set: function(key, val) {
      this.searchParams[key] = val;
      return this;
    },

    // Set the desired content type to retrieve from the server. If the server
    // does not provide an endpoint that matches this value, you're liable to
    // get an error.  Chainable method.
    setContentType: function (contentType) {
      this.contentType = contentType;
      return this;
    },

    // Performs the current query.
    //
    // * `options`: object literal containing the following:
    //   * `url`: URL to GET
    //   * `success`: callback function for successful queries.  Should accept one parameter: the results.
    //   * `error` (optional): callback function for error conditions.  Can take three
    //     parameters: `jqXHR`, `textStatus`, and `errorThrown` (see
    //     [http://api.jquery.com/jQuery.ajax/](http://api.jquery.com/jQuery.ajax/))
    execute: function(options) {
      var queryUrl = this.openSearchDescriptionDocument.getQueryUrl(this.getParams(), this.getContentType());
      $.ajax({
        url: queryUrl,
        success: function (data, textStatus, jqXhr) { 
          options.success(jqXhr.responseText); 
        },
        error: options.error
      });
    },

    get: function(key) {
      return this.searchParams[key];
    },

    getContentType: function () {
      return this.contentType;
    },

    getParams: function () {
      return this.searchParams;
    },

    createOpenSearchDescriptionDocument: function (osddXml) {
      return new OpenSearchlight.OpenSearchDescriptionDocument(osddXml);
    }
  });

  // Class methods - none!
  _.extend(OpenSearchQuery, {
  });

}(jQuery, _));

// ## openSearchService

(function ($, _) {

  // Factory to create an OpenSearchQuery
  OpenSearchlight.openSearchService = {

    // Retrieves the OSDD at the specified url (if necessary), and calls back to
    // onSuccess when complete, providing onSuccess a query object to work with.
    query: function (url, onSuccess) {
      $.ajax({
        url: url,
        success: _.bind(function (data, textStatus, jqXhr) {
          onSuccess.call(this, this.createQueryObject(jqXhr.responseText));
        }, this)
      });
    },

    // Creates an OpenSearchQuery object. Easy to override if you don't actually
    // want to incur the cost of that, e.g. for testing.
    createQueryObject: function(osddXml) {
      return new OpenSearchlight.OpenSearchQuery(osddXml);
    }
  };

}(jQuery, _));

// ## OpenSearchDescriptionDocument
//
// `OpenSearchDescriptionDocument` wraps up parsing the good stuff out of an
// OSDD, and generates the query URL for someone else to GET later on.

// Hide the internals within the closure scope. Pull in jQuery and Underscore
// from the environment.
(function ($, _) {

  // Shortcut name
  var OSDD;

  // Create a simple constructor function; behaviors will be added shortly.
  // Just like the backbone.js way.
  OSDD = OpenSearchlight.OpenSearchDescriptionDocument = function (osddXml) {
    this.initialize.apply(this, arguments);
  };

  // *Instance methods*
  _.extend(OSDD.prototype, {

    // Override `initialize` to override the default constructor behavior.
    //
    // * `osddXml`: the XML content of an OSDD
    initialize: function (osddXml) {
      if (!OSDD.validate(osddXml)) {
        throw new Error("Error parsing xml");
      }
      this.osddXml = osddXml;
    },

    // Based on the OSDD template URLs, the search parameters and the desired
    // content type, construct the best fitting query URL.  Content type has
    // the highest priority; search parameters are lower.  Parameters without a
    // match in the template are ignored.
    //
    // * `params`: an object containing template parameters and their values to
    //   substitute into the template url
    // * `contentType`: string with the desired content type, e.g. "text/xml"
    getQueryUrl: function (params, contentType) {
      var urlTemplates, template, queryUrl;
      urlTemplates = OSDD.extractTemplateUrls(this.osddXml);
      template = OSDD.getBestTemplate(urlTemplates, contentType, params);
      queryUrl = OSDD.substituteTemplateParameters(template, params);
      return queryUrl;
    }

  });

  // *Class methods*.  These are internal methods, but exposed for overriding as
  // necessary.
  _.extend(OSDD, {

    // Validate the OSDD XML.  Returns `true` if XML is valid OSDD. 
    // *Not currently very sophisticated...*
    //
    // * `osddXml`: string with the XML of the OSDD
    validate: function (osddXml) {
      if (!osddXml) { return false; }

      // TODO: replace this naive text matching with some actual XML parsing
      if (!osddXml.match(/http:\/\/a9.com\/-\/spec\/opensearch\/1.1\//)) { return false; }
      return true;
    },

    // Returns an array of JSON objecs representing the template URLs found in
    // the OSDD XML, or undefined if none are found.
    //
    // * `osddXml`: string with the XML of the OSDD
    extractTemplateUrls: function (osddXml) {
      var templates = [],
        // TODO: would be nice to remove the dependency on jQuery here:
        jqTemplates = $(osddXml).find('url[rel!=self]');

      jqTemplates.each(function (index, element) {
        templates.push( {
            type: this.getAttribute("type"),
            template: this.getAttribute("template")
          });
      });

      if (templates.length === 0) {
        return undefined;
      } else {
        return templates;
      }
    },

    // Parameters:
    //
    // * `urlTemplates`: array of `{ type: "contentType", template: "urlTemplate" }` objects, as found in the OSDD
    // * `contentType`: requested content type, e.g. `"application/json"`
    // * `params`: object containing search parameters
    getBestTemplate: function (urlTemplates, contentType, params) {
      var filteredByType, filteredByRequiredParams, bestMatch;
      filteredByType = OSDD.filterUrlTemplatesOnMimeType(urlTemplates, contentType);
      filteredByRequiredParams = OSDD.filterUrlTemplatesWithMissingRequiredParams(filteredByType, params);
      bestMatch = OSDD.findTemplateWithMostParamMatches(filteredByRequiredParams, params);
      return bestMatch.template;
    },

    filterUrlTemplatesOnMimeType: function (urlTemplates, type) {
      return _.filter(urlTemplates, function (urlTemplate) {
        return OSDD.doesContentTypeMatch(type, urlTemplate.type);
      });
    },

    // Perform some simple content type matching. Returns true if the type does
    // match the matcher, false otherwise.
    //
    // * `matcher`: desired content type.  Wildcards, e.g. `"*/*"` or `"text/*"` are allowed.
    // * `type`: content type to match against
    doesContentTypeMatch: function (matcher, type) {
      var matcher_parts, type_parts;
      if (matcher === "*/*") {
        return true;
      } else if (matcher === type) {
        return true;
      }

      matcher_parts = matcher.split("/");
      type_parts = type.split("/");

      if (matcher_parts[0] === type_parts[0] && matcher_parts[1] === "*") {
        return true;
      } else if (matcher_parts[0] === "*" && matcher_parts[1] === type_parts[1]) {
        return true;
      }

      return false;
    },

    // Return the subset of templates in the `urlTemplates` array whose
    // required params are available in the `params` object
    filterUrlTemplatesWithMissingRequiredParams: function (urlTemplates, params) {
      return _.filter(urlTemplates, function (urlTemplate) {
        return OSDD.areAllRequiredParamsPresent(urlTemplate, params);
      });
    },

    areAllRequiredParamsPresent: function (template, params) {
      var requiredParams, actualParams;
      requiredParams = _.map(
          template.template.match(/\{.*?[^?]\}/g),
          function (p) {
            return p.replace(/[{}]/g, '');
          });
      actualParams = _.keys(params);

      return ((_.difference(requiredParams, actualParams)).length === 0);
    },

    findTemplateWithMostParamMatches: function (templateUrls, params) {
      var sortedTemplateUrls = _.sortBy(
          templateUrls,
          function (urlTemplate) {
            return OSDD.countMatchingParams(params, urlTemplate.template);
          });
      return _.last(sortedTemplateUrls);
    },

    countMatchingParams: function(params, templateUrl) {
      var templateParams;

      templateParams = _.map(
          templateUrl.match(/\{.*?\}/g),
          function (param) {
            return param.replace(/[{}]/g, '');
          });

      return _.reduce(
          templateParams,
          function(memo, item) {
            return (params[item] === undefined) ? memo : memo + 1;
          },
          0);
    },

    // Replace the placeholder fields in the given `urlTemplate` with the
    // values in `params`. Any unfilled parameter template fields are replaced
    // with an empty string.
    substituteTemplateParameters: function (urlTemplate, params) {
      var url = urlTemplate;

      // interpolate all params into the url placeholders
      _.each(params, function(value, key) {
        url = url.replace(new RegExp("{"+key+"\\??}"), value);
      });

      // strip out any remaining {....?} template params
      url = url.replace(/\{[^}]*\?\}/, "", "g");
      return url;
    }
  });


}(jQuery, _));

