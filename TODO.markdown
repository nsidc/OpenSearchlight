# TODO

1. Add Kevin's suggestion for the facade

```javascript

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
```
