// Generated by CoffeeScript 1.3.3

describe("Hoodie.Account.RemoteStore", function() {
  beforeEach(function() {
    this.hoodie = new Mocks.Hoodie;
    spyOn(this.hoodie, "on");
    spyOn(this.hoodie, "one");
    spyOn(this.hoodie, "unbind");
    this.requestDefer = this.hoodie.defer();
    spyOn(this.hoodie, "request").andReturn(this.requestDefer.promise());
    spyOn(window, "setTimeout");
    spyOn(this.hoodie.my.account, "db").andReturn('joe$example.com');
    spyOn(this.hoodie, "trigger");
    spyOn(this.hoodie.my.store, "destroy").andReturn({
      then: function(cb) {
        return cb('objectFromStore');
      }
    });
    spyOn(this.hoodie.my.store, "update").andReturn({
      then: function(cb) {
        return cb('objectFromStore', false);
      }
    });
    return this.remote = new Hoodie.Account.RemoteStore(this.hoodie);
  });
  describe(".constructor(@hoodie, options = {})", function() {
    beforeEach(function() {
      return this.remote = new Hoodie.Account.RemoteStore(this.hoodie);
    });
    it("should set basePath to users database name", function() {
      return expect(this.remote.basePath).toBe("/joe%24example.com");
    });
    it("should sync continously by default", function() {
      return expect(this.remote.isContinuouslySyncing()).toBeTruthy();
    });
    it("should start syncing", function() {
      spyOn(Hoodie.Account.RemoteStore.prototype, "startSyncing");
      new Hoodie.Account.RemoteStore(this.hoodie);
      return expect(Hoodie.Account.RemoteStore.prototype.startSyncing).wasCalled();
    });
    return _when("config remote.sync is false", function() {
      beforeEach(function() {
        spyOn(this.hoodie.my.config, "get").andReturn(false);
        return this.remote = new Hoodie.Account.RemoteStore(this.hoodie);
      });
      it("should set syncContinuously to false", function() {
        return expect(this.remote.isContinuouslySyncing()).toBe(false);
      });
      return it("should not start syncing", function() {
        spyOn(Hoodie.Account.RemoteStore.prototype, "startSyncing");
        new Hoodie.Account.RemoteStore(this.hoodie);
        return expect(Hoodie.Account.RemoteStore.prototype.startSyncing).wasNotCalled();
      });
    });
  });
  describe(".startSyncing", function() {
    it("should make isContinuouslySyncing() to return true", function() {
      this.remote._sync = false;
      this.remote.startSyncing();
      return expect(this.remote.isContinuouslySyncing()).toBeTruthy();
    });
    it("should set config _remote.sync to true", function() {
      spyOn(this.hoodie.my.config, "set");
      this.remote.startSyncing();
      return expect(this.hoodie.my.config.set).wasCalledWith('_remote.sync', true);
    });
    it("should subscribe to `signout` event", function() {
      this.remote.startSyncing();
      return expect(this.hoodie.on).wasCalledWith('account:signout', this.remote.disconnect);
    });
    return it("should subscribe to account:signin with sync", function() {
      this.remote.startSyncing();
      return expect(this.hoodie.on).wasCalledWith('account:signin', this.remote.connect);
    });
  });
  describe(".stopSyncing", function() {
    it("should set _remote.sync to false", function() {
      this.remote._sync = true;
      this.remote.stopSyncing();
      return expect(this.remote.isContinuouslySyncing()).toBeFalsy();
    });
    it("should set config remote.syncContinuously to false", function() {
      spyOn(this.hoodie.my.config, "set");
      this.remote.stopSyncing();
      return expect(this.hoodie.my.config.set).wasCalledWith('_remote.sync', false);
    });
    it("should unsubscribe from account's signin idle event", function() {
      this.remote.stopSyncing();
      return expect(this.hoodie.unbind).wasCalledWith('account:signin', this.remote.connect);
    });
    return it("should unsubscribe from account's signout idle event", function() {
      this.remote.stopSyncing();
      return expect(this.hoodie.unbind).wasCalledWith('account:signout', this.remote.disconnect);
    });
  });
  describe(".connect()", function() {
    beforeEach(function() {
      return spyOn(this.remote, "sync");
    });
    it("should authenticate", function() {
      spyOn(this.hoodie.my.account, "authenticate").andCallThrough();
      this.remote.connect();
      return expect(this.hoodie.my.account.authenticate).wasCalled();
    });
    return _when("successful", function() {
      beforeEach(function() {
        return spyOn(this.hoodie.my.account, "authenticate").andReturn({
          pipe: function(cb) {
            cb();
            return {
              fail: function() {}
            };
          }
        });
      });
      return it("should call super", function() {
        spyOn(Hoodie.RemoteStore.prototype, "connect");
        this.remote.connect();
        return expect(Hoodie.RemoteStore.prototype.connect).wasCalled();
      });
    });
  });
  describe(".getSinceNr()", function() {
    beforeEach(function() {
      return spyOn(this.hoodie.my.config, "get");
    });
    it("should use user's config to get since nr", function() {
      this.remote.getSinceNr();
      return expect(this.hoodie.my.config.get).wasCalledWith('_remote.since');
    });
    return _when("config _remote.since is not defined", function() {
      beforeEach(function() {
        return this.hoodie.my.config.get.andReturn(void 0);
      });
      return it("should return 0", function() {
        return expect(this.remote.getSinceNr()).toBe(0);
      });
    });
  });
  describe(".setSinceNr(nr)", function() {
    beforeEach(function() {
      return spyOn(this.hoodie.my.config, "set");
    });
    return it("should use user's config to store since nr persistantly", function() {
      this.remote.setSinceNr(100);
      return expect(this.hoodie.my.config.set).wasCalledWith('_remote.since', 100);
    });
  });
  return describe(".push(docs)", function() {
    beforeEach(function() {
      return spyOn(Hoodie.RemoteStore.prototype, "push");
    });
    return _when("no docs passed", function() {
      return it("should push changed documents from store", function() {
        spyOn(this.hoodie.my.store, "changedDocs").andReturn("changed_docs");
        this.remote.push();
        return expect(Hoodie.RemoteStore.prototype.push).wasCalledWith("changed_docs");
      });
    });
  });
});