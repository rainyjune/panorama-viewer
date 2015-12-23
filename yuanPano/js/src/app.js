window.onload = () => {
  window.obj = new YuanPano('canvas', 'images/pano.jpg');
  console.log(obj);
  obj.draw();
};