new ( function() {
  if(!window.IntersectionObserver){
    var items = document.querySelectorAll('.responsive-image-bg.lazybg');
    [].forEach.call(items, function(item) {
      item.classList.add("visible");
    });
    return;
  }

  var options = {
    rootMargin: '0px',
  }

  var observer;
  var showImage = function(entries, observer) { 
    [].forEach.call(entries, function(entry){
      if( (typeof(entry.isIntersecting) != "undefined" && entry.isIntersecting == true) || entry.intersectionRatio > 0){
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  };

  observer = new IntersectionObserver(showImage, options);

  var items = document.querySelectorAll('.responsive-image-bg.lazybg');
  [].forEach.call(items, function(item) {
    observer.observe(item);
  });

})();
