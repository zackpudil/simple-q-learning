const drawCircle = (ctx, [x, y], r, color) => {
  ctx.beginPath();

  ctx.globalAlpha = 1;
  ctx.strokeStyle = ctx.fillStyle = color;

  ctx.arc(x, y, r, 0, 2*Math.PI);
  ctx.stroke();

  ctx.globalAlpha = 0.5;
  ctx.fill();
};

const drawLine = (ctx, [xf, yf], [xt, yt], color = "black") => {
  ctx.globalAlpha = 1;
  ctx.strokeStyle = color;

  ctx.beginPath();
  ctx.moveTo(xf, yf);
  ctx.lineTo(xt, yt);
  ctx.stroke();
};

const drawRect = (ctx, [xf, yf], [xt, yt], color = "black", alpha = 1) => {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(xf, yf,  xt,  yt);
  ctx.fill();
};

const drawTriangle = (ctx, [x, y], r, color = "black") => {
  ctx.globalAlpha = 1;
  ctx.fillStyle = ctx.strokeStyle = color;

  ctx.beginPath();
  ctx.moveTo(x, y - r/2);
  ctx.lineTo(x + r/2, y + r/2);
  ctx.lineTo(x - r/2, y + r/2);
  ctx.lineTo(x, y - r/2);

  ctx.stroke();
  ctx.globalAlpha = 0.5;
  ctx.fill();
};

module.exports = { drawCircle, drawLine, drawRect, drawTriangle };
