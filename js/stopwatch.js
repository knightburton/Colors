/**
* Second based Stopwatch.
*
* var element = document.getElementById("stopwatch-dom-element-id");
* var stopwatch = new Stopwatch(elem, {delay: 10, buttons: true});
*
* // start the Stopwatch
* timer.start();
*
* // stop the timer
* timer.stop();
*
* // reset the timer
* timer.reset();
* // get the current value
* timer.get();
*/
var Stopwatch = function(element, options) {

  var timer = create_timer(),
      start_button,
      stop_button,
      reset_button,
      offset,
      clock,
      interval,
      coolDown;

  // default options
  options = options || {};
  options.delay = options.delay || 10;
  options.buttons = options.buttons || false;

  // append elements     
  element.appendChild(timer);
  
  if(options.buttons == true) {
    start_button = create_button("start", start),
    stop_button  = create_button("stop", stop),
    reset_button = create_button("reset", reset),

    element.appendChild(start_button);
    element.appendChild(stop_button);
    element.appendChild(reset_button);
  }

  // initialize
  reset();

  // private functions
  function create_timer() {
    return document.createElement("span");
  }

  function create_button(action, handler) {
    var a = document.createElement("a");
    a.href = "#" + action;
    a.id = "stopwatch-" + action + "-button";
    a.className = "stopwatch-buttons";
    a.innerHTML = action;
    a.addEventListener("click", function(event) {
      handler();
      event.preventDefault();
    });
    return a;
  }

  function start() {
    if(!interval) {
      offset   = Date.now();
      interval = setInterval(update, options.delay);
    }
  }

  function stop() {
    if(interval) {
      clearInterval(interval);
      interval = null;
    }
  }

  function reset() {
    clock = 0;
    render();
  }

  function update() {
    clock++;
    render();
  }

  function render() {
    var temp = clock.toString();
    if(temp.length > 2) {
      timer.innerHTML = temp.substring(0,  temp.length - 2) + "." + temp.substring(temp.length - 2);
    } else {
      timer.innerHTML = temp;
    }
  }

  function get() {
    return clock;
  }
  
  // public API
  this.start  = start;
  this.stop   = stop;
  this.reset  = reset;
  this.get    = get;
};