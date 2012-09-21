# TODO

1. Example OSDD in the readme to provide the context for the query call example
2. Rename prepareQuery to query
4. Add a couple of tests back in.
3. Docco link (in fact, check all links)
5. Add Kevin's suggestion for the facade


    OpenSearchlight.openSearchService.query({
       url: "http://www.example.com/opensearch?description",
       parameters: {
         "searchTerms": "some search words",
         "startPage": "20",
         "resultsPerPage": "100"
         },
       contentType: "application/xml",
       success: function (data) {
                   // data contains results!
                },
       error: function (jqXHR, textStatus, errorThrown) {
                   // error handling...
                }
       });
