var canvas = document.getElementById("canvas"),
  ctx = canvas.getContext("2d"),
  image = new Image(),
  imageWidth,
  imageHeight,
  scaling = false,
  scale = 1,
  //ratio = 1,
  maxScale,
  scaleFactor = 1.1,
  scaleDown = false,
  scaleUp = false,
  scaleDraw,
  distance,
  lastDistance = 0,
  canDrag = false,
  isDragging = false,
  startCoords = {
    x: 0,
    y: 0
  },
  last = {
    x: 0,
    y: 0
  },
  moveX = 0,
  moveY = 0,
  redraw;

    let viewWidth = $(window).width();

  if(viewWidth <= 700) {
    canvas.width = 300;
    canvas.height = 300;
    resizeCanvas();
  }

function isTouchDevice() {
  return typeof window.ontouchstart !== "undefined";
}

function hideTooltip() {
  $(".info").addClass("hidden");
}

function scaleCanvas() {
  if (scaling === "down") {
    scale = scale / scaleFactor;
    scale < 1 ? 1 : scale;
  } else if (scaling === "up") {
    scale = scale * scaleFactor;
    scale > maxScale ? maxScale : scale;
  }

  redraw = requestAnimationFrame(canvasDraw);
}

function scaleCanvasTouch() {
  if (lastDistance > distance) {
    scale = scale / scaleFactor;
    if (scale < 1) scale = 1;
  } else if (lastDistance < distance) {
    scale = scale * scaleFactor;
    if (scale > maxScale) scale = maxScale;
  }

  redraw = requestAnimationFrame(canvasDraw);

  lastDistance = distance;
}

function canvasDraw() {
  (imageWidth = image.width * ratio * scale),
    (imageHeight = image.height * ratio * scale);

  var offsetX = (imageWidth - canvas.width) / 2,
    offsetY = (imageHeight - canvas.height) / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (moveX > offsetX) {
    moveX = offsetX;
  }

  if (moveX < -(imageWidth - offsetX - canvas.width)) {
    moveX = -(imageWidth - offsetX - canvas.width);
  }

  if (moveY > offsetY) {
    moveY = offsetY;
  }

  if (moveY < -(imageHeight - offsetY - canvas.height)) {
    moveY = -(imageHeight - offsetY - canvas.height);
  }

  ctx.drawImage(
    image,
    -offsetX + moveX,
    -offsetY + moveY,
    imageWidth,
    imageHeight
  );
}

function resizeCanvas() {

 // maxScale = Math.min(canvas.height/ image.height, canvas.width / image.height)
  maxScale = Math.min(image.height / canvas.height, image.width / canvas.width);
  ratio = Math.max(canvas.height / image.height, canvas.width / image.width);

  redraw = requestAnimationFrame(canvasDraw);
}

    let imageloader = document.getElementById('imageLoader');
    imageloader.onchange = function(e) {
      image.onload = resizeCanvas;
       
    
    image.src = URL.createObjectURL(this.files[0]);
  }

/*
    POINTER EVENTS
*/

function pointerEvents(e) {
  var pos = {
    x: 0,
    y: 0
  };

  if (e.type == "touchstart" || e.type == "touchmove" || e.type == "touchend") {
    var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
    pos.x = touch.pageX;
    pos.y = touch.pageY;
  } else if (
    e.type == "mousedown" ||
    e.type == "mouseup" ||
    e.type == "mousemove"
  ) {
    pos.x = e.pageX;
    pos.y = e.pageY;
  }

  return pos;
}


$("document").ready(function() {
  //show info tooltip if is mobile
  if (isTouchDevice()) {
    scaleFactor = 1.02;
    $("body")
      .addClass("touch")
      .on("touchstart", function() {
        hideTooltip();
      });
  }

  //canvasInit("https://upload.wikimedia.org/wikipedia/commons/9/98/Veil_Nebula_800x600.jpg");

 /* $(".scale").on("click", function() {
    if ($(this).data("scale") === "down") {
      scaling = "down";
    } else {
      scaling = "up";
    }

    scaleDraw = requestAnimationFrame(scaleCanvas);

    scale < maxScale
      ? $('[data-scale="up"]').removeAttr("disabled")
      : $('[data-scale="up"]').attr("disabled", "true");
    scale >= 1
      ? $('[data-scale="down"]').removeAttr("disabled")
      : $('[data-scale="down"]').attr("disabled", "true");
  }); */

  $("canvas")
    .on("mousedown touchstart", function(e) {
      var position = pointerEvents(e),
        touch = e.originalEvent.touches || e.originalEvent.changedTouches;

      if (e.type === "touchstart" && touch.length === 2) {
        scaling = true;

        lastDistance = Math.sqrt(
          (touch[0].clientX - touch[1].clientX) *
            (touch[0].clientX - touch[1].clientX) +
            (touch[0].clientY - touch[1].clientY) *
              (touch[0].clientY - touch[1].clientY)
        );
      } else {
        canDrag = true;
        isDragging = scaling = false;

        startCoords = {
          x: position.x - $(this).offset().left - last.x,
          y: position.y - $(this).offset().top - last.y
        };
      }
    })
    .on("mousemove touchmove", function(e) {
      e.preventDefault();

      isDragging = true;

      if (isDragging && canDrag && scaling === false) {
        var position = pointerEvents(e),
          offset = e.type === "touchmove" ? 1.3 : 1;

        moveX = (position.x - $(this).offset().left - startCoords.x) * offset;
        moveY = (position.y - $(this).offset().top - startCoords.y) * offset;

        redraw = requestAnimationFrame(canvasDraw);
      } else if (scaling === true) {
        var touch = e.originalEvent.touches || e.originalEvent.changedTouches;

      
        distance = Math.sqrt(
          (touch[0].clientX - touch[1].clientX) *
            (touch[0].clientX - touch[1].clientX) +
            (touch[0].clientY - touch[1].clientY) *
              (touch[0].clientY - touch[1].clientY)
        );

        scaleDraw = requestAnimationFrame(scaleCanvasTouch);
      }
    })
    .on("mouseup touchend", function(e) {
      var position = pointerEvents(e);

      canDrag = isDragging = scaling = false;

      last = {
        x: position.x - $(this).offset().left - startCoords.x,
        y: position.y - $(this).offset().top - startCoords.y
      };

      cancelAnimationFrame(scaleDraw);
      cancelAnimationFrame(redraw);
    });
});