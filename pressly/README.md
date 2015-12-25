# Pressly.Panorama #

.. is an HTML5 Panorama library.

### Support ###

Device support for iPad, iPhone, RIM Playbook, Samsumg Galaxy Tab.
Desktop browser support with Safari, Chrome Canary.

3D bugs in Chrome, and Mozilla firefox prevent it from working properly at this time.

### Features ###

* Gyroscope support for certain devices, iPhone4+, iPad2+, RIM Playbook, Samsung Galaxy Tab.
* Mouse support for desktop browsers.
* Touch support for touch enabled devices.
* Auto rotate.
* Annotations.


## Usage ##

    var panorama = new Panorame(id, options);

**Basic options**

    var panorama = new Panorama("#panorama", {
      top: "images/tablet_u.jpg",
      bottom: "images/tablet_d.jpg",
      front: "images/tablet_f.jpg",
      back: "images/tablet_b.jpg",
      left: "images/tablet_l.jpg",
      right: "images/tablet_r.jpg"
    });

**Advanced options**

    var panorama = new Panorama("#panorama", {
      autoRotate: "left",            // "left", "right", false
      enableGyro: true               // boolean
      enableTouch: true              // boolean
      enableMouse: true              // boolean
      width: "480px",
      height: "320px",
      yaw: 180                       // number in degrees
      pitch: 0                       // number in degrees
      roll: 0                        // number in degrees
      top: "images/tablet_u.jpg",
      bottom: "images/tablet_d.jpg",
      front: "images/tablet_f.jpg",
      back: "images/tablet_b.jpg",
      left: "images/tablet_l.jpg",
      right: "images/tablet_r.jpg"
    });


**Annotations**

You are able to easily annotate/label the faces of the panorama cube.

The annotate method returns a reference to a generated annotation element

    var a = panorama.annotate("Advanced power steering", {
      face: "front", // Specify which face the annotation will apear
      left: "100px",
      top: "540px",
    });

You can bind events to the annotation element:

    a.addEventListener("mousedown", function() {
      alert("click!");
    }, false);

If you dont require a reference to the annotation element, you can create it like so:

    panorama.annotate("MP3 CD Player<br>with XM Radio", {
      face: "front",
      left: "400px",
      top: "628px"
    });

Example of labelling each face:

    panorama.annotate("Left", { face: "left", left: "40%", top: "50%" });
    panorama.annotate("Right", { face: "right", left: "40%", top: "50%" });
    panorama.annotate("Top", { face: "top", left: "40%", top: "50%" });
    panorama.annotate("Bottom", { face: "bottom", left: "40%", top: "50%" });
    panorama.annotate("Front", { face: "front", left: "40%", top: "50%" });
    panorama.annotate("Back", { face: "back", left: "40%", top: "50%" });

## Pressly Ad integration ##

Pressly panorama can not only work as a stand-alone widget on a webpage, but also from within an iframe on a foreign host. This is important primarily concerning gyroscope support, as the deviceorientation event api is not able to be accessed directly from an iframe with a forien host. Pressly gets around this by propagating the deviceorientation events to the iframe through postMessage, the receiving iframe panorama then listens for these postMessage events to access the gyroscope axes information.



