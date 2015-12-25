(function() {

  function Panorama(id, options) {
    this.options = options || {};

    this.defaults = {
      autoRotate: false,
      enableTouch: true,
      enableMouse: true,
      enableGyro: true
    };
    
    // Merge options and defaults
    for (var property in this.defaults) {
      if (this.defaults.hasOwnProperty(property) && !this.options.hasOwnProperty(property)) {
        this.options[property] = this.defaults[property];
      }
    }

    this.element = document.getElementById(id.split("#")[1]);

    this.init();       
  }

  Panorama.prototype.init = function() {
    var self = this;

    this.style = window.getComputedStyle(this.element);

    // Get width and height from supplied options or element style
    this.options.width = parseInt(this.options.width, 10) || parseInt(this.style.width, 10);
    this.options.height = parseInt(this.options.height, 10) || parseInt(this.style.height, 10);

    this.rotX   = this.options.pitch  || 0;
    this.rotY   = this.options.yaw    || 0;
    this.rotZ   = this.options.roll   || 0;

    this.yaw    = 0;
    this.pitch  = 0;  
    this.roll   = 0; 

    // Correct yaw to device orientation
    switch (window.orientation) {
      case 0:
        this.yaw += 180;
        break;

      case 180:
        this.yaw += 0;
        break;

      case 90:
        this.yaw += 90;
        break;

      case -90:
        this.yaw += -90;
        break;
    }

    this.touchCoords = [];

    // Generate cube markup
    this.makeCube();

    // Set styles on viewport, cube, and faces
    this.prepareStyles();

    // Set face backgrounds
    this.faces.forEach(function(face) {
      var orientation = face.className.split("face ")[1];
      var src = self.options[orientation];

      if (src) {
        // Set the background-image src
        face.style.backgroundImage = "url(" + src + ")";
      } else {
        // Set random background-color on face if no src was supplied
        face.style.backgroundColor = "rgb(" + Math.round(Math.random() * 255) + ", " + Math.round(Math.random() * 255) + ", " + Math.round(Math.random() * 255) + ")";     
      }
    });
    
    if (this.options.autoRotate) {
      setInterval(function() { self.autoRotate(); }, 1);
    }

    this.initializeEventListeners();
  };

  /**
    Creates cube and faces markup and appends to panorama viewport element.

    Cube has class of "cube" and faces have class of "face" plus their orientation, ie. "face top", "face bottom", etc.
  */
  Panorama.prototype.makeCube = function() {
    var self = this;
    var faceClassNames = ["top", "bottom", "front", "back", "left", "right"];

    this.cube = document.createElement("div");
    this.cube.className = "cube";

    this.faces = [];

    faceClassNames.forEach(function(className) {
      className = "face " + className;

      var face = document.createElement("div");
      face.className = className;

      self.cube.appendChild(face);
      self.faces.push(face);
    });

    // Add cube to viewport
    this.element.appendChild(this.cube);
  };

  /**
    Sets style object on a given element.
  */
  function setStyles(node, styles) {
    for (rule in styles) {
      if (styles.hasOwnProperty(rule)) {
        node.style[rule] = styles[rule];
      }
    }
  }

  /**
    Prepare styles is responsible for updating the element styles for 
    panorama viewport, cube, and faces.

    This function is run again on orientation change and window resize events.
  */
  Panorama.prototype.prepareStyles = function() {
    // Get width or height from supplied options/styles or assume fullscreen
    this.width = this.options.width || window.innerWidth;
    this.height = this.options.height || window.innerHeight;

    // Calculate viewport offsets so cube is always centered
    this.offsetX = -(1024 - this.width) / 2;
    this.offsetY = -(1024 - this.height) / 2;

    // Calculate best perspective
    this.perspective = (this.width > this.height * 4/3 ? this.width : this.height * 4/3) / 2;

    var panoramaStyles = {
      "display": "block",
      "position": "absolute",
      "overflow": "hidden",
      "top": this.style.top !== "auto" ? this.style.top : "0px",
      "left": this.style.left !== "auto" ? this.style.left : "0px",
      "width": this.width + "px",
      "height": this.height + "px",
      "backgroundColor": "black",
      "zIndex": "100",
      "webkitTransform": "translateY(0px)", 
      "webkitPerspective": this.perspective,
      "MozTransformStyle": "preserve-3d",
      "MozTransform": "perspective(" + this.perspective + "px)",
      "zIndex": "0"
    };

    var cubeStyles = {
      "position": "absolute",
      "webkitTransformStyle": "preserve-3d",
      "webkitTransformOriginX": "512px",
      "webkitTransformOriginY": "512px",
      "MozTransformStyle": "preserve-3d",
      "MozTransformOrigin": "512px 512px",
      "zIndex": "100"
    };

    // var annotationsContainerStyles = {
    //   "position": "absolute",
    //   "webkitTransformStyle": "preserve-3d",
    //   "webkitTransformOriginX": "480px",
    //   "webkitTransformOriginY": "480px",
    //   "MozTransformStyle": "preserve-3d",
    //   "MozTransformOrigin": "480px 480px",
    //   "zIndex": "300"
    // };

    var faceStyles = {
      "position": "absolute",
      "top": "-1px",
      "left": "-1px",
      "height": "1025px",
      "width": "1025px",
      "backgroundSize": "100%",
      "webkitBackfaceVisibility": "hidden",
      "webkitTransformStyle": "preserve-3d",
      "MozBackfaceVisibility": "hidden",
      "MozTransformStyle": "preserve-3d",
      "zIndex": "200"
    };

    var faceTransformStyles = {
      "top":    "rotateX(-90deg) translateZ(-512px)",
      "bottom": "rotateX(90deg) translateZ(-512px)",
      "front":  "translateZ(-512px)",
      "back":   "rotateY(180deg) translateZ(-512px)",
      "left":   "rotateY(90deg) translateZ(-512px)",
      "right":  "rotateY(-90deg) translateZ(-512px)"
    };

    // Set styles for panorama viewport and cube
    setStyles(this.element, panoramaStyles);
    setStyles(this.cube, cubeStyles);

    //setStyles(this.annotations, annotationsContainerStyles);
    
    this.faces.forEach(function(face) {
      var orientation = face.className.split("face ")[1];

      // Set general face styles
      setStyles(face, faceStyles);

      // Set invidividual styles for proper face transform orientations
      face.style.webkitTransform = faceTransformStyles[orientation];
      face.style.MozTransform = faceTransformStyles[orientation];
    });

    this.draw();
  };

  /**
    Initialize various events for touch, mouse, window resize, gyro, and orientation change.
  */
  Panorama.prototype.initializeEventListeners = function() {
    var self = this;

    window.addEventListener("resize", function() { self.prepareStyles(); }, false);

    window.addEventListener("orientationchange", function() { self.onOrientationChange(); }, false);

    if (this.options.enableGyro) {
      window.addEventListener("deviceorientation", function(ev) { self.onDeviceOrientation(ev); }, false);
      
      /**
        Gyro only works when panorama is hosted on same origin.
        When gyro is loaded in an iframe and hosted on a foreign server, like an s3 ad server for instance, 
        it cannot directly access these gyro events. 
       
        Fortunately Pressly's transmits these messages to the iframe through the postMessage interface.
      */ 
      window.addEventListener("message", function(ev) {
        if (ev.data.type === "deviceorientation") {
          self.onDeviceOrientation(ev);
        }
      }, false);
    }
    
    if (this.options.enableTouch) {
      this.element.addEventListener("touchstart", function(ev) { self.onTouchStart(ev); }, false);
      this.element.addEventListener("touchmove", function(ev) { self.onTouchMove(ev); }, false);
      this.element.addEventListener("touchend", function(ev) { self.onTouchEnd(ev); }, false);
    }

    if (this.options.enableMouse) {
      this.element.addEventListener("mousedown", function(ev) { self.onTouchStart(ev, true); }, false);
      this.element.addEventListener("mousemove", function(ev) { self.onTouchMove(ev, true); }, false);
      this.element.addEventListener("mouseup", function(ev) { self.onTouchEnd(ev, true); }, false);
    }
  };

  /**
    Rotate horozontally along the Y-axis.

    Set by the autoRotate option with either "left", "right", or false.
  */
  Panorama.prototype.autoRotate = function() {
    this.rotY += this.options.autoRotate === "left" ? 0.1 : -0.1;
    
    this.draw();
  };

  /**
    Reset styles when the viewport orientation changes.
  */
  Panorama.prototype.onOrientationChange = function(ev) {
    this.prepareStyles();
  };

  /**
    Gyroscope handler.
  */
  Panorama.prototype.onDeviceOrientation = function(ev) {
    var corrected = correctAxes(ev);

    this.rotX += this.pitch - corrected.pitch;
    this.rotY += this.yaw - corrected.yaw;

    this.yaw = corrected.yaw;
    this.pitch = corrected.pitch;
    this.roll = corrected.roll;

    this.draw();
  };

  var deg2Rad = Math.PI/180;

  /**
    Corrects the Euler axes of the gyroscope to avoid gimble signularities by rotating 90 degrees
    about the z-axis.

    The gyro produces a gimble lock on the z-axis (roll). This produces problems when switching 
    between orientations. It is preferable to rotate the Euler so that the gimble is at the up 
    and down positions since it is rare to rotate through these points.

    Accepts the orientationchange Event object.
  */
  function correctAxes(ev) {  
    var yaw   = ev.alpha  * deg2Rad;
    var pitch = ev.beta   * deg2Rad;
    var roll  = ev.gamma  * deg2Rad;
      
    var cosYaw    = Math.cos(yaw),
        sinYaw    = Math.sin(yaw),
        cosPitch  = Math.cos(pitch),
        sinPitch  = Math.sin(pitch),
        cosRoll   = Math.cos(roll),
        sinRoll   = Math.sin(roll);

    var m00 = sinYaw * sinRoll - cosYaw * sinPitch * cosRoll, 
        m10 = cosPitch * cosRoll,
        m11 = -sinPitch,
        m12 = -cosPitch * sinRoll,
        m20 = sinYaw * sinPitch * cosRoll + cosYaw * sinRoll;

    yaw   = Math.atan2(-m20, m00) / deg2Rad;
    pitch = Math.asin(m10)        / deg2Rad;
    roll  = Math.atan2(-m12, m11) / deg2Rad;

    return { yaw: yaw, pitch: pitch, roll: roll };
  }

  Panorama.prototype.onTouchStart = function(ev, isMouse) {
    if (isMouse) {
      // Simulate a touch from mouse coordinates
      ev.touches = [{ clientX: ev.clientX, clientY: ev.clientY }];
    }

    ev.preventDefault();
    ev.stopPropagation();

    this.touchCoords = [{
      x: ev.touches[0].clientX,
      y: ev.touches[0].clientY,
      time: (new Date).getTime()
    }];
  };

  Panorama.prototype.onTouchMove = function(ev, isMouse) {
    // ev.preventDefault();
    // ev.stopPropagation();

    if (this.touchCoords.length > 0) {
      if (isMouse) {
        // Simulate a touch from mouse coordinates
        ev.touches = [{ pageX: ev.clientX, pageY: ev.clientY }];
      }

      var touch = ev.touches[0];

      this.touchCoords.push({
        x: touch.pageX,
        y: touch.pageY,
        time: (new Date).getTime()
      });

      this.draw();
    }
  };

  Panorama.prototype.onTouchEnd = function(ev) {     
    ev.preventDefault();
    ev.stopPropagation();

    // Set up acceleration for the last point
    if (this.touchCoords.length >= 2) {
      this.draw(true);
    }

    // Reset state
    this.touchCoords = [];
  };

  /**
    Updates the current view.

    isReleased is used to tell draw that a swipe has finished and we require momentum animation.
  */
  Panorama.prototype.draw = function(isReleased) {
    // Reset transition
    this.cube.style.webkitTransition = "";
    this.cube.style.MozTransition = "";
    
    if (this.touchCoords.length >= 2) {
      var current = this.touchCoords[this.touchCoords.length - 1];
      var previous = this.touchCoords[this.touchCoords.length - 2];

      if (isReleased) {
        // When the swipe is released we need to handle the draw a little differently
        // applying momentum and animating to the finished position
        var dx = current.x - previous.x; 
        var dy = current.y - previous.y;
        
        var dist = Math.sqrt(dx * dx + dy * dy);
        var time = current.time - previous.time;

        var velocity = dist / time;
        var drag = 0.012;

        var releaseTime = velocity / drag;

        // Extend the last point
        current.x += dx * velocity;
        current.y += dy * velocity;

        this.cube.style.webkitTransition = "-webkit-transform " + releaseTime + "ms cubic-bezier(0.33, 0.66, 0.66, 1)";
        this.cube.style.MozTransition = "-moz-transform " + releaseTime + "ms cubic-bezier(0.33, 0.66, 0.66, 1)";
      }

      this.rotY -= (current.x - previous.x) * 0.2;
      this.rotX += (current.y - previous.y) * 0.1;
    }

    // Rotate labels to face camera
    // var annotations = document.querySelectorAll(".annotation");

    // for (var i = 0; i < annotations.length; i++) {
    //   var annotation = annotations[i];
    //   annotation.style.webkitTransform = "translateZ(100px) rotateY(" + (-this.rotY) + "deg)";
    //   annotation.style.MozTransform = "translateZ(100px) rotateY(" + (-this.rotY) + "deg)";
    // }

    // Clamp X rotation to -90 to +90 degrees
    this.rotX = Math.max(-90, Math.min(90, this.rotX));

    // Update transforms
    this.cube.style.webkitTransform = "translateZ(" + this.perspective + "px) translateX(" + this.offsetX + "px) translateY(" + this.offsetY + "px) rotateX(" + this.rotX + "deg) rotateY(" + this.rotY + "deg) rotateZ(" + this.rotZ + "deg)";
    this.cube.style.MozTransform = "perspective(" + this.perspective + "px) translateZ(" + this.perspective + "px) translateX(" + this.offsetX + "px) translateY(" + this.offsetY + "px) rotateX(" + this.rotX + "deg) rotateY(" + this.rotY + "deg)";  
  };

  /**
    Annotate a face with a floating element at a specific position.

    Accepts a string or element and options hash.
    Returns a reference to the created annotation element.
  */
  Panorama.prototype.annotate = function(annotation, options) {
    var self, el;

    options = options || {};

    var defaults = {
      face: "front",
      left: "0px",
      top: "0px",
      width: "200px",
      height: "100px",
      depth: "100px"
    };
    
    // Merge options and defaults
    for (var property in defaults) {
      if (defaults.hasOwnProperty(property) && !options.hasOwnProperty(property)) {
        options[property] = defaults[property];
      }
    }

    if (typeof annotation === "string") {
      el = document.createElement("div");
      el.className = "annotation";
      el.innerHTML = annotation;
    }

    setStyles(el, {
      "position": "absolute",
      "left": options.left,
      "top": options.top,
      "width": options.width,
      "height": options.height,
      "webkitBackfaceVisibility": "hidden",
      "MozBackfaceVisibility": "hidden",
      "webkitTransform": "translateZ(" + options.depth + ")",
      "MozTransform": "translateZ(" + options.depth + ")",
      "zIndex": "1000"
    });

    // Append annotation element to the correct face.
    // The annotation will inherit the faces rotation.
    this.faces.forEach(function(face) {
      var orientation = face.className.split("face ")[1];
      if (orientation === options.face) {
        face.appendChild(el);
      }
    });

    return el;
  };

  window.Panorama = Panorama;

}());