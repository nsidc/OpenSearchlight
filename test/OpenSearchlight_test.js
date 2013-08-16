/*global OpenSearchlight:true */

describe("Simplified facade for the API: functional tests", function () {
  var fakeQuery;

  before(function () {
    var stub = sinon.stub(OpenSearchlight.openSearchService, "query");
    fakeQuery = {
      set: sinon.stub(),
    execute: sinon.stub(),
    setContentType: sinon.stub(),
    setRequestHeaders: sinon.stub()
    };

    fakeQuery.execute.yieldsTo("success");

    stub.callsArgWith(1, fakeQuery);
  });

  after(function () {
    OpenSearchlight.openSearchService.query.restore();
  });

  it("happy path: the success callback should get called with the data", function () {
    var successCallback = sinon.stub(), errorCallback = sinon.stub(), headers = [{name: "", value:""},{name: "", value:""}];

    OpenSearchlight.query({
      osdd: "http://something",
      success: successCallback,
      error: errorCallback,
      parameters: {
        searchTerm: "searchValue"
      },
      contentType: "text/xml",
      requestHeaders: headers
    });

    assert(fakeQuery.set.calledWith("searchTerm", "searchValue")).should(be);
    assert(fakeQuery.setContentType.calledWith("text/xml")).should(be);
    assert(fakeQuery.setRequestHeaders.calledWith(headers)).should(be);
    assert(successCallback.callCount).should(eql, 1);
    assert(errorCallback.callCount).should(eql, 0);
  });
});

describe("the query facade", function () {
  var queryStub;

  before(function () {
    queryStub = sinon.stub(OpenSearchlight.openSearchService, "query");
  });

  after(function () {
    OpenSearchlight.openSearchService.query.restore();
  });

  it("should use the OSDD to initialize the open search service", function () {
    var inputOsdd, osddUsed;
    inputOsdd = "http://server/osdd";

    OpenSearchlight.query({
      osdd: inputOsdd,
      success: function () {}
    });

    assert(queryStub.callCount).should(eql, 1);
    osddUsed = queryStub.args[0][0];
    assert(osddUsed).should(eql, inputOsdd);
  });

  it("should use the OSDD success function generator and pass that to the opensearch service", function () {
    var generatorFn, generatedFn, queryParams;
    queryParams = {
      osdd: "",
      success: function () {}
    };

    generatedFn = sinon.stub();
    generatorFn = sinon.stub(OpenSearchlight, "generateOsddSuccessFn");
    generatorFn.returns(generatedFn);

    OpenSearchlight.query(queryParams);

    assert(generatorFn.callCount).should(eql, 1);
    assert(generatorFn.firstCall.args).should(include, queryParams);
    assert(queryStub.firstCall.args).should(include, generatedFn);
    generatorFn.restore();
  });

  it("should generate the opensearch service callback queryXhr function", function() {
    var stubQuery = sinon.stub(),
        osddstub = sinon.stub(OpenSearchlight, "generateOsddSuccessFn");
    sinon.stub(OpenSearchlight, "ensureParamsHasOsdd");
    sinon.stub(OpenSearchlight, "ensureParamsHasSuccessHandler");

    OpenSearchlight.query({osdd:null,queryXhr:stubQuery});

    assert(osddstub.firstCall.args[0].queryXhr).should(eql, stubQuery);
    OpenSearchlight.generateOsddSuccessFn.restore();
    OpenSearchlight.ensureParamsHasOsdd.restore();
    OpenSearchlight.ensureParamsHasSuccessHandler.restore();
  });
});

describe("Generator for the OSDD onSuccess handler", function () {
  it("should create a valid function", function () {
    var fn = OpenSearchlight.generateOsddSuccessFn();
    assert(fn).should(beA, Function);
  });
});

describe("the generated OSDD success handler function", function () {
  var fakeQuery;

  before(function () {
    fakeQuery = {
      execute: sinon.stub(),
    set: sinon.stub(),
    setContentType: sinon.stub()
    };
  });

  it("should execute a query object when passed that query", function () {
    var fn = OpenSearchlight.generateOsddSuccessFn();

    fn(fakeQuery);

    assert(fakeQuery.execute.callCount).should(eql, 1);
  });

  it("will not set query parameters if it isn't passed any", function () {
    var fn, parameters = {};

    fn = OpenSearchlight.generateOsddSuccessFn(parameters);
    fn(fakeQuery);

    assert(fakeQuery.set.callCount).should(eql, 0);
  });

  it("should set the search parameter specified on the query object", function () {
    var fn, generatorArgs = {
      osdd: "...",
    parameters: { "key": "val" }
    };

    fn = OpenSearchlight.generateOsddSuccessFn(generatorArgs);
    fn(fakeQuery);

    assert(fakeQuery.set.callCount).should(eql, 1);
    assert(fakeQuery.set.firstCall.calledWith("key", "val")).should(be);
  });

  it("should set all of the search parameters specified on the query object", function () {
    var fn, generatorArgs = {
      osdd: "...",
    parameters: { key1: "val1", key2: "val2" }
    };

    fn = OpenSearchlight.generateOsddSuccessFn(generatorArgs);
    fn(fakeQuery);

    assert(fakeQuery.set.callCount).should(eql, 2);
    assert(fakeQuery.set.firstCall.args).should(include, "key1", "val1");
    assert(fakeQuery.set.secondCall.args).should(include, "key2", "val2");
  });

  it("should set the content type if one is provided", function () {
    var fn, parameters = {
      contentType: "text/xml"
    };

    fn = OpenSearchlight.generateOsddSuccessFn(parameters);
    fn(fakeQuery);

    assert(fakeQuery.setContentType.callCount).should(eql, 1);
  });

  it("should not set the content type if one is not provided", function () {
    var fn, parameters = {};

    fn = OpenSearchlight.generateOsddSuccessFn(parameters);
    fn(fakeQuery);

    assert(fakeQuery.setContentType.callCount).should(eql, 0);
  });

  it("should set the queryXhr callback if it is provided", function () {
    var queryXhrStub = sinon.stub(),
        params = {queryXhr: queryXhrStub},
        fn = OpenSearchlight.generateOsddSuccessFn(params);

    fn(fakeQuery);

    assert(fakeQuery.execute.firstCall.args[0].queryXhr).should(eql, queryXhrStub);
  });

  it("should not set the queryXhr callback if it is not provided", function () {
    var params = {},
        fn = OpenSearchlight.generateOsddSuccessFn(params);

    fn(fakeQuery);

    assert(fakeQuery.execute.firstCall.args[0].queryXhr === undefined ).should(eql, true);
  });
});

describe("OpenSearchQuery", function () {

  before(function () {
    sinon.stub(OpenSearchlight.OpenSearchQuery.prototype,"initialize");
    sinon.stub(OpenSearchlight.OpenSearchDescriptionDocument.prototype, "initialize");
    sinon.stub(OpenSearchlight.OpenSearchDescriptionDocument.prototype, "getQueryUrl");
  });

  after(function () {
    OpenSearchlight.OpenSearchQuery.prototype.initialize.restore();
    OpenSearchlight.OpenSearchDescriptionDocument.prototype.initialize.restore();
    OpenSearchlight.OpenSearchDescriptionDocument.prototype.getQueryUrl.restore();
    $.ajax.restore();
  });

  it("should invoke queryXhr callback with the jqXHR", function () {
    var queryXhrStub = sinon.stub(), fakeJqXhr = {}, osQuery;
    sinon.stub($, "ajax").returns(fakeJqXhr);
    osQuery = new OpenSearchlight.OpenSearchQuery();
    osQuery.openSearchDescriptionDocument = new OpenSearchlight.OpenSearchDescriptionDocument();

    osQuery.execute({queryXhr: queryXhrStub});

    assert(queryXhrStub.callCount).should(eql, 1);
    assert(queryXhrStub.firstCall.args[0]).should(eql,fakeJqXhr);

  });

  it("should not invoke queryXhr callback with the jqXHR when callback function is not set", function () {
    var queryXhrStub = sinon.stub(), fakeJqXhr = {}, osQuery;
    sinon.stub($, "ajax").returns(fakeJqXhr);
    osQuery = new OpenSearchlight.OpenSearchQuery();
    osQuery.openSearchDescriptionDocument = new OpenSearchlight.OpenSearchDescriptionDocument();

    osQuery.execute({});

    assert(queryXhrStub.callCount).should(eql, 0);
  });
});

describe("error conditions", function () {
  it("should throw an error if no params are passed", function () {
    var ex;
    try {
      OpenSearchlight.query();
      assert("An exception should have been thrown before this line was executed").shouldNot(be);
    } catch (e) {
      ex = e;
    }
    assert(ex).should(be);
  });

  it("should throw an error if a success callback is not provided", function () {
    var ex;
    sinon.stub(OpenSearchlight, "ensureParamsHasOsdd");

    try {
      OpenSearchlight.query({});
      assert("An exception should have been thrown before this line was executed").shouldNot(be);
    } catch (e) {
      ex = e;
    }
    assert(ex).should(be);

    OpenSearchlight.ensureParamsHasOsdd.restore();
  });

  it("should throw an error if an OSDD is not provided", function () {
    var ex;
    try {
      OpenSearchlight.query({
        osdd: undefined
      });
      assert("An exception should have been thrown before this line was executed").shouldNot(be);
    } catch (e) {
      ex = e;
    }
    assert(ex).should(be);
  });

  it("should call the error callback if retrieving the OSDD returns an error", function () {
    var errorFn, queryParams, successFn, fakeQuery;
    errorFn = sinon.spy();
    successFn = sinon.spy();

    var stub = sinon.stub(OpenSearchlight.openSearchService, "query");
    fakeQuery = {
      set: sinon.stub(),
      execute: sinon.stub(),
      setContentType: sinon.stub()
    };

    fakeQuery.execute.yieldsTo("error");

    stub.callsArgWith(1, fakeQuery);

    queryParams = {
      osdd: "http://badurlforosddvalidation.com",
      success: successFn,
      error: errorFn
    };

    OpenSearchlight.query(queryParams);

    OpenSearchlight.openSearchService.query.restore();

    assert(errorFn.callCount).should(eql, 1);
    assert(successFn.callCount).should(eql, 0);
  });
});

describe("selective extend mechanism", function () {
  var src, dest, target;

  before(function () {
    src = { a: 1234, b: 2345, c: 3456, d: 4567 };
    dest = { b: 21 };
    target = undefined;
  });

  it("should copy a single property", function () {
    target = OpenSearchlight.extendWith(dest, src, "a");
    assert(target.a).should(eql, 1234);
  });

  it("should copy a list of properties", function () {
    target = OpenSearchlight.extendWith(dest, src, ["c", "d"]);

    assert(target.c).should(eql, 3456);
    assert(target.d).should(eql, 4567);
  });

  it("should overwrite existing properties", function () {
    target = OpenSearchlight.extendWith(dest, src, "b");
    assert(target.b).should(eql, 2345);
  });

  it("should quietly ignore properties not present in the source", function () {
    target = OpenSearchlight.extendWith(dest, src, "ZYX");
    assert(_.size(target)).should(eql, 1);
  });

  it("should quietly ignore undefined src objects", function () {
    target = OpenSearchlight.extendWith(dest, undefined, "b");
    assert(_.size(target)).should(eql, 1);
  });
});
