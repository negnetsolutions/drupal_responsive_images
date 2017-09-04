new ( function() {
  var _ = this;
  this.selector = '.responsive-image-bg.lazybg';

  if(!window.IntersectionObserver){
    var items = document.querySelectorAll(_.selector);
    [].forEach.call(items, function(item) {
      item.classList.add("visible");
      item.classList.remove("lazybg");
    });
    return;
  }

  this.rAF = (function(){
    var running, waiting;
    var firstFns = [];
    var secondFns = [];
    var fns = firstFns;

    var run = function(){
      var runFns = fns;

      fns = firstFns.length ? secondFns : firstFns;

      running = true;
      waiting = false;

      while(runFns.length){
        runFns.shift()();
      }

      running = false;
    };

    var rafBatch = function(fn, queue){
      if(running && !queue){
        fn.apply(this, arguments);
      } else {
        fns.push(fn);

        if(!waiting){
          waiting = true;
          (document.hidden ? setTimeout : requestAnimationFrame)(run);
        }
      }
    };

    rafBatch._lsFlush = run;

    return rafBatch;
  })();
  this.rAFIt = function(fn, simple){
    return simple ?
      function() {
        _.rAF(fn);
      } :
      function(){
        var that = this;
        var args = arguments;
        _.rAF(function(){
          fn.apply(that, args);
        });
      }
    ;
  };
  this.throttle = function(fn){
    var running;
    var lastTime = 0;
    var gDelay = 125;
    var RIC_DEFAULT_TIMEOUT = 666;
    var rICTimeout = RIC_DEFAULT_TIMEOUT;
    var run = function(){
      running = false;
      lastTime = Date.now();
      fn();
    };
    var idleCallback = window.requestIdleCallback ?
      function(){
        requestIdleCallback(run, {timeout: rICTimeout});
        if(rICTimeout !== RIC_DEFAULT_TIMEOUT){
          rICTimeout = RIC_DEFAULT_TIMEOUT;
        }
      }:
      _.rAFIt(function(){
        setTimeout(run);
      }, true)
    ;

    return function(isPriority){
      var delay;
      if((isPriority = isPriority === true)){
        rICTimeout = 44;
      }

      if(running){
        return;
      }

      running =  true;

      delay = gDelay - (Date.now() - lastTime);

      if(delay < 0){
        delay = 0;
      }

      if(isPriority || (delay < 9 && window.requestIdleCallback)){
        idleCallback();
      } else {
        setTimeout(idleCallback, delay);
      }
    };
  };

  this.options = {
    rootMargin: '0px',
  }

  this.showImage = function(entries, observer) { 
    [].forEach.call(entries, function(entry){
      if( (typeof(entry.isIntersecting) != "undefined" && entry.isIntersecting == true) || entry.intersectionRatio > 0){
        entry.target.classList.add("visible");
        entry.target.classList.remove("lazybg");
        _.observer.unobserve(entry.target);
      }
    });
  };

  this.observer = new IntersectionObserver(_.showImage, _.options);

  this.checkElements = function(){
    var items = document.querySelectorAll(_.selector);
    [].forEach.call(items, function(item) {
      if(!item.classList.contains("visible")){
        //add observer to elements that aren't already marked visible
        _.observer.observe(item);
      }
    });
  }

  this.throttledCheckElements = _.throttle(_.checkElements);

  _.checkElements();

  if(window.MutationObserver){
    new MutationObserver( _.throttledCheckElements ).observe( document.documentElement, {childList: true, subtree: true, attributes: true} );
  } else {
    docElem[_addEventListener]('DOMNodeInserted', _.throttledCheckElements, true);
    docElem[_addEventListener]('DOMAttrModified', _.throttledCheckElements, true);
    setInterval(_.throttledCheckElements, 999);
  }

})();
