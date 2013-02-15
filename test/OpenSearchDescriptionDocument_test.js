/*global OpenSearchlight:true */
(function () {
  var OSDD = OpenSearchlight.OpenSearchDescriptionDocument;

  module("filling in template urls");
  test("optional parameters are also used to fill in the template", function () {
    equal("A=1&b=2&c=&d=", OSDD.substituteTemplateParameters("A={A}&b={b?}&c={c?}&d={d?}", {A: 1, b: 2}));
  });

  module("extracting urls from the OSDD xml");
  test("url elements are returned as an array", function () {
    var osddXml = "<OpenSearchDescription>" +
                  "<Url type=\"application/atom+xml\" template=\"http://url1\"/>" + 
                  "<Url template=\"http://url2\"/>" +
                  "</OpenSearchDescription>",
      templates = OSDD.extractTemplateUrls(osddXml);

    equal(2, templates.length, "Each template in the xml should be extracted");
    equal("application/atom+xml", templates[0].type);
    equal("http://url1", templates[0].template);
    equal(null, templates[1].type);
    equal("http://url2", templates[1].template);
  });

  test("rel=self urls are not extracted", function () {
    var osddXml = "<OpenSearchDescription>" +
                  '<Url rel="self" template="http://url2"/>' +
                  "</OpenSearchDescription>",
      templates = OSDD.extractTemplateUrls(osddXml);

    equal(undefined, templates, "self url should not be extracted");
  });


  module("Selecting the most appropriate template");
  test("if a content type is specified, only compatible templates are selected", function () {
    var templates = [
      { type: "application/xml", template: "a={a}&xml" },
      { type: "text/plain", template: "a={a}&text" }
    ];
    equal(OSDD.getBestTemplate(templates, "text/plain", { a: "foo" }), "a={a}&text");
    equal(OSDD.getBestTemplate(templates, "application/xml", { a: "foo" }), "a={a}&xml");
  });

  test("the template with the most parameters matching is selected", function () {
    var templates = [
      { type: "application/xml", template: "X={X}" },
      { type: "application/xml", template: "a={a}" },
      { type: "application/xml", template: "a={a}&b={b}&c={c}" },
      { type: "application/xml", template: "a={a}&b={b}" }
    ];
    equal(
      OSDD.getBestTemplate(templates, "application/xml", { a: "foo" }),
      "a={a}");
    equal(
      OSDD.getBestTemplate(templates, "application/xml", { a: "foo", b: "bar", c: "baz" }),
      "a={a}&b={b}&c={c}");
  });

  test("templates with required params that aren't present are filtered out", function () {
    var templates, params;
    templates = [
      { type: "application/xml", template: "a={a}" },
      { type: "application/xml", template: "a={a}&b={b}" } ];
    params = { a: "a" };

    deepEqual(
      OSDD.filterUrlTemplatesWithMissingRequiredParams(templates, params),
      [ { type: "application/xml", template: "a={a}" } ]
      );
  });

  test("Yoshi's bug with template matching going too far is fixed", function () {
    var templates = [
      { type: "application/xml", template: "a={a?}&b={b}&c={c}" }
    ];
    equal(
      OSDD.getBestTemplate(templates, "application/xml", { b: "bar", c: "baz" }),
      "a={a?}&b={b}&c={c}");
  });

  //test("given no matching templates, an exception is thrown", function () {
    ////TODO
  //});

  module("Content type matching");
  test("simple rules for content type matching", function () {
    ok(OSDD.doesContentTypeMatch("text/xml", "text/xml"));
    ok(!OSDD.doesContentTypeMatch("text/xml", "application/atom+xml"));

    ok(OSDD.doesContentTypeMatch("text/*", "text/xml"));
    ok(OSDD.doesContentTypeMatch("text/*", "text/html"));
    ok(!OSDD.doesContentTypeMatch("text/*", "application/atom+xml"));

    ok(OSDD.doesContentTypeMatch("*/*", "text/html"));
    ok(OSDD.doesContentTypeMatch("*/*", "application/xml"));
  });


  module("Template matching");
  test("the number of parameters matching the template are counted", function () {
    var params = {
      a: 1,
      b: 2,
      c: 3
    };

    equal(0, OSDD.countMatchingParams(params, "Z={Z}"));
    equal(0, OSDD.countMatchingParams(params, "a={aa}"));
    equal(0, OSDD.countMatchingParams(params, "a={aa?}"));

    equal(1, OSDD.countMatchingParams(params, "a={a}"));
    equal(1, OSDD.countMatchingParams(params, "Z={Z}&A={a}"));

    equal(3, OSDD.countMatchingParams(params, "a={a}&b={b}&c={c}"));
    equal(3, OSDD.countMatchingParams(params, "a={a}&A={A}&b={b}&B={B}&c={c}"));
  });

}());
