/*global OpenSearchlight:true */

// ## openSearchService

(function ($, _) {

  // Factory to create an OpenSearchQuery
  OpenSearchlight.openSearchService = {

    // Retrieves the OSDD at the specified url (if necessary), and calls back to
    // onSuccess when complete, providing onSuccess a query object to work with.
    query: function (url, onSuccess, onError) {
      $.ajax({
        url: url,
        success: _.bind(function (data, textStatus, jqXhr) {
          onSuccess.call(this, this.createQueryObject(jqXhr.responseText));
        }, this),
        error: _.bind(function (errorXhr) {
          onError.call(this, errorXhr);
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
