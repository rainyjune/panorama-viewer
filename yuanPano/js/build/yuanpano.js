"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var YuanPano = (function () {
  function YuanPano(canvasid, imageURL) {
    var _this = this;

    _classCallCheck(this, YuanPano);

    //get canvas and set up call backs
    this.pano_canvas = document.getElementById('canvas'); //Canvas to which to draw the panorama
    this.pano_canvas.width = window.innerWidth;
    this.pano_canvas.height = window.innerHeight;

    this.pano_canvas.onmousedown = function (e) {
      _this.mouseDown(e);
    };
    window.onmousemove = function (e) {
      _this.mouseMove(e);
    };
    window.onmouseup = function (e) {
      _this.mouseUp(e);
    };
    window.onmousewheel = function (e) {
      _this.mouseScroll(e);
    };
    window.onkeydown = function (e) {
      _this.keyDown(e);
    };
    //this.draw();
    //setInterval(this.draw, 1000/YuanPano.FPS);

    this.img_buffer = null;
    this.img = new Image();
    this.img.onload = function () {
      _this.imageLoaded();
    };
    this.img.src = imageURL;
  }

  _createClass(YuanPano, [{
    key: "imageLoaded",
    value: function imageLoaded() {
      var buffer = document.createElement("canvas");
      var buffer_ctx = buffer.getContext("2d");
      var img = this.img;

      //set buffer size
      buffer.width = img.width;
      buffer.height = img.height;

      //draw image
      buffer_ctx.drawImage(img, 0, 0);
      //return; 
      //get pixels
      var buffer_imgdata = buffer_ctx.getImageData(0, 0, buffer.width, buffer.height);
      var buffer_pixels = buffer_imgdata.data;

      //convert imgdata to float image buffer
      this.img_buffer = new Array(img.width * img.height * 3);
      for (var i = 0, j = 0; i < buffer_pixels.length; i += 4, j += 3) {
        this.img_buffer[j] = buffer_pixels[i];
        this.img_buffer[j + 1] = buffer_pixels[i + 1];
        this.img_buffer[j + 2] = buffer_pixels[i + 2];
      }
      this.draw();
    }
  }, {
    key: "mouseDown",
    value: function mouseDown(e) {
      YuanPano.mouseIsDown = true;
      YuanPano.mouseDownPosLastX = e.clientX;
      YuanPano.mouseDownPosLastY = e.clientY;
    }
  }, {
    key: "mouseMove",
    value: function mouseMove(e) {
      if (YuanPano.mouseIsDown == true) {
        YuanPano.cam_heading -= e.clientX - YuanPano.mouseDownPosLastX;
        YuanPano.cam_pitch += 0.5 * (e.clientY - YuanPano.mouseDownPosLastY);
        YuanPano.cam_pitch = Math.min(180, Math.max(0, YuanPano.cam_pitch));
        YuanPano.mouseDownPosLastX = e.clientX;
        YuanPano.mouseDownPosLastY = e.clientY;
        this.draw();
      }
    }
  }, {
    key: "mouseUp",
    value: function mouseUp(e) {
      YuanPano.mouseIsDown = false;
      this.draw();
    }
  }, {
    key: "mouseScroll",
    value: function mouseScroll(e) {
      YuanPanocam_fov += e.wheelDelta / 120;
      YuanPano.cam_fov = Math.min(90, Math.max(30, YuanPano.cam_fov));
      this.draw();
    }
  }, {
    key: "keyDown",
    value: function keyDown(e) {
      if (e.keyCode == 73) {
        //i==73 Info
        YuanPano.displayInfo = !YuanPano.displayInfo;
        this.draw();
      }
    }
  }, {
    key: "renderPanorama",
    value: function renderPanorama(canvas) {
      var img_buffer = this.img_buffer,
          img = this.img,
          DEG2RAD = YuanPano.DEG2RAD,
          cam_heading = YuanPano.cam_heading,
          cam_pitch = YuanPano.cam_pitch,
          cam_fov = YuanPano.cam_fov;

      if (canvas != null && img_buffer != null) {
        var ctx = canvas.getContext("2d");
        var imgdata = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var pixels = imgdata.data;

        var src_width = img.width;
        var src_height = img.height;
        var dest_width = canvas.width;
        var dest_height = canvas.height;

        //calculate camera plane
        var theta_fac = src_height / Math.PI;
        var phi_fac = src_width * 0.5 / Math.PI;
        var ratioUp = 2.0 * Math.tan(cam_fov * DEG2RAD / 2.0);
        var ratioRight = ratioUp * 1.33;
        var camDirX = Math.sin(cam_pitch * DEG2RAD) * Math.sin(cam_heading * DEG2RAD);
        var camDirY = Math.cos(cam_pitch * DEG2RAD);
        var camDirZ = Math.sin(cam_pitch * DEG2RAD) * Math.cos(cam_heading * DEG2RAD);
        var camUpX = ratioUp * Math.sin((cam_pitch - 90.0) * DEG2RAD) * Math.sin(cam_heading * DEG2RAD);
        var camUpY = ratioUp * Math.cos((cam_pitch - 90.0) * DEG2RAD);
        var camUpZ = ratioUp * Math.sin((cam_pitch - 90.0) * DEG2RAD) * Math.cos(cam_heading * DEG2RAD);
        var camRightX = ratioRight * Math.sin((cam_heading - 90.0) * DEG2RAD);
        var camRightY = 0.0;
        var camRightZ = ratioRight * Math.cos((cam_heading - 90.0) * DEG2RAD);
        var camPlaneOriginX = camDirX + 0.5 * camUpX - 0.5 * camRightX;
        var camPlaneOriginY = camDirY + 0.5 * camUpY - 0.5 * camRightY;
        var camPlaneOriginZ = camDirZ + 0.5 * camUpZ - 0.5 * camRightZ;

        //render image
        var i, j;
        for (i = 0; i < dest_height; i++) {
          for (j = 0; j < dest_width; j++) {
            var fx = j / dest_width;
            var fy = i / dest_height;

            var rayX = camPlaneOriginX + fx * camRightX - fy * camUpX;
            var rayY = camPlaneOriginY + fx * camRightY - fy * camUpY;
            var rayZ = camPlaneOriginZ + fx * camRightZ - fy * camUpZ;
            var rayNorm = 1.0 / Math.sqrt(rayX * rayX + rayY * rayY + rayZ * rayZ);

            var theta = Math.acos(rayY * rayNorm);
            var phi = Math.atan2(rayZ, rayX) + Math.PI;
            var theta_i = Math.floor(theta_fac * theta);
            var phi_i = Math.floor(phi_fac * phi);

            var dest_offset = 4 * (i * dest_width + j);
            var src_offset = 3 * (theta_i * src_width + phi_i);

            pixels[dest_offset] = img_buffer[src_offset];
            pixels[dest_offset + 1] = img_buffer[src_offset + 1];
            pixels[dest_offset + 2] = img_buffer[src_offset + 2];
            //pixels[dest_offset+3] = img_buffer[src_offset+3];
          }
        }

        //upload image data
        ctx.putImageData(imgdata, 0, 0);
      }
    }
  }, {
    key: "drawRoundedRect",
    value: function drawRoundedRect(ctx, ox, oy, w, h, radius) {
      ctx.beginPath();
      ctx.moveTo(ox + radius, oy);
      ctx.lineTo(ox + w - radius, oy);
      ctx.arc(ox + w - radius, oy + radius, radius, -Math.PI / 2, 0, false);
      ctx.lineTo(ox + w, oy + h - radius);
      ctx.arc(ox + w - radius, oy + h - radius, radius, 0, Math.PI / 2, false);
      ctx.lineTo(ox + radius, oy + h);
      ctx.arc(ox + radius, oy + h - radius, radius, Math.PI / 2, Math.PI, false);
      ctx.lineTo(ox, oy + radius);
      ctx.arc(ox + radius, oy + radius, radius, Math.PI, 3 * Math.PI / 2, false);
      ctx.fill();
    }
  }, {
    key: "draw",
    value: function draw() {
      var pano_canvas = this.pano_canvas,
          img = this.img;

      if (this.pano_canvas != null && this.pano_canvas.getContext != null) {
        var ctx = this.pano_canvas.getContext("2d");

        //clear canvas
        ctx.fillStyle = "rgba(0, 0, 0, 1)";
        ctx.fillRect(0, 0, pano_canvas.width, pano_canvas.height);

        //render paromana direct
        var startTime = new Date();
        this.renderPanorama(pano_canvas);
        var endTime = new Date();

        //draw info text
        if (YuanPano.displayInfo == true) {
          ctx.fillStyle = "rgba(255,255,255,0.75)";
          this.drawRoundedRect(ctx, 20, pano_canvas.height - 60 - 20, 180, 60, 7);

          ctx.fillStyle = "rgba(0, 0, 0, 1)";
          ctx.font = "10pt helvetica";
          ctx.fillText("Canvas = " + pano_canvas.width + "x" + pano_canvas.height, 30, pano_canvas.height - 60);
          ctx.fillText("Image size = " + img.width + "x" + img.height, 30, pano_canvas.height - 45);
          ctx.fillText("FPS = " + (1000.0 / (endTime.getTime() - startTime.getTime())).toFixed(1), 30, pano_canvas.height - 30);
        }
      }
    }
  }]);

  return YuanPano;
})();

YuanPano.FPS = 30;
YuanPano.DEG2RAD = Math.PI / 180.0;

//Event state
YuanPano.mouseIsDown = false;
YuanPano.mouseDownPosLastX = 0;
YuanPano.mouseDownPosLastY = 0;
YuanPano.displayInfo = true;
YuanPano.highquality = true;

//Camera state
YuanPano.cam_heading = 90.0;
YuanPano.cam_pitch = 90.0;
YuanPano.cam_fov = 90;
//# sourceMappingURL=yuanpano.js.map
