/*global OpenSearchlight:true */

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
       var allParams, requiredParams, actualParams;
       allParams = _.map(
          template.template.match(/\{[^}]*\}/g),  // Find all template substrings
          function (p) {
             return p.replace(/[{}]/g, '');        // Strip off the braces
          }
       );

       // Select the subset of template parameters that don't end with a "?"
       requiredParams = _.filter(
          allParams,
          function(param) { return param.substring(param.length-1) !== "?"; }
       );

       actualParams = _.keys(params);

       return ((_.difference(requiredParams, actualParams)).length === 0);
    },


    XareAllRequiredParamsPresent: function (template, params) {
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
      url = url.replace(/\{.*?\?\}/g, "");
      return url;
    }
  });


}(jQuery, _));

