/*global OpenSearchlight:true */
(function ($, _) {

  // ## OpenSearchQuery
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

    // Set optional request headers that can be used to track the ajax calls on the server side.
    // i.e. we can override X-Requested-With to "MyApp" etc. Chainable method.
    setRequestHeaders: function (requestHeaders) {
      this.requestHeaders = requestHeaders;
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
    //   * `queryXhr` (optional): callback function for the search query jqXHR.   
    //     Callback will be called with one parameter: the jqXHR.
    execute: function(options) {
      var queryUrl = this.openSearchDescriptionDocument.getQueryUrl(this.getParams(), this.getContentType()),
          headers = this.getRequestHeaders();
      var xhr = $.ajax({
        url: queryUrl,
        beforeSend:  function(jqXhr) {
          _.each(headers, function (header) {
            jqXhr.setRequestHeader(header.name, header.value);        
          }, this);
        },
        success: function (data, textStatus, jqXhr) {
          options.success(jqXhr);
        },
        error: options.error
      });

      if (options.queryXhr !== undefined) {
        options.queryXhr(xhr);
      }
    },

    get: function(key) {
      return this.searchParams[key];
    },

    getRequestHeaders: function () {
      return this.requestHeaders; 
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
