/*global OpenSearchlight:true */

describe("Simplified facade for the API: functional tests", function () {
  var fakeQuery;

  before(function () {
    var stub = sinon.stub(OpenSearchlight.openSearchService, "query");
    fakeQuery = {
      set: sinon.stub(),
    execute: sinon.stub(),
    setContentType: sinon.stub()
    };

    fakeQuery.execute.yieldsTo("success");

    stub.callsArgWith(1, fakeQuery);
  });

  after(function () {
    OpenSearchlight.openSearchService.query.restore();
  });

  it("happy path: the success callback should get called with the data", function () {
    var successCallback = sinon.stub(), errorCallback = sinon.stub();

    OpenSearchlight.query({
      osdd: "http://something",
      success: successCallback,
      error: errorCallback,
      parameters: {
        searchTerm: "searchValue"
      },
      contentType: "text/xml"
    });

    assert(fakeQuery.set.calledWith("searchTerm", "searchValue")).should(be);
    assert(fakeQuery.setContentType.calledWith("text/xml")).should(be);
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

  it("should not call the error callback under normal circumstances", function () {
    var errorCallback = sinon.stub();
    sinon.stub(OpenSearchlight, "ensureParamsHasOsdd");
    sinon.stub(OpenSearchlight, "ensureParamsHasSuccessHandler");

    OpenSearchlight.query({
      error: errorCallback
    });

    assert(errorCallback.callCount).should(eql, 0);
    OpenSearchlight.ensureParamsHasOsdd.restore();
    OpenSearchlight.ensureParamsHasSuccessHandler.restore();
  });

  it("should call the error callback if retrieving the OSDD returns an error", function () {
    // TODO
    equal(true, true);
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

