var mx, my;

const main = (ctx, brain, called = false) => {
    if(!called) {
        ctx.canvas.onmousemove = (e) => {
            const rect = ctx.canvas.getBoundingClientRect();
            mx = e.clientX - rect.left;
            my = e.clientY - rect.top;
        };
    }

    brain.restore();

    const layers = [brain.layers.input, ...brain.layers.hidden, brain.layers.output];

    ctx.globalAlpha = 1;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fill();
    layers.forEach((layer, il) => {
        layer.list.forEach((n,i) => {
            const x = (ctx.canvas.width/(layers.length*2)) + il*(ctx.canvas.width/layers.length);
            const y = (ctx.canvas.height/(layer.size*2)) + i*(ctx.canvas.height/layer.size);

            const r = il == 0 ? 30/layer.size : Math.max(Math.min(Math.abs(n.bias*20), 15), 3);

            const cons = [];
            for(i in n.connections.projected) cons.push(n.connections.projected[i]);

            if(n.bias === 0) ctx.fillStyle = ctx.strokeStyle = "#11F711";
            else if(n.bias < 0) ctx.fillStyle = ctx.strokeStyle = "#111111";
            else if(n.bias <= 0.5) ctx.fillStyle = ctx.strokeStyle = "#F61111";
            else ctx.fillStyle = ctx.strokeStyle = "#1111F6";

            ctx.beginPath();
            ctx.arc(x, y, r, 0, 2*Math.PI);

            ctx.globalAlpha = 1;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.globalAlpha = Math.abs(n.activation);
            ctx.fill();

            if(ctx.isPointInPath(mx, my)) {
                ctx.globalAlpha = 1;
                ctx.fillStyle = ctx.strokeStyle = "black";
                ctx.font = "18px Verdana";
                ctx.arc(x, y, r, 0, 2*Math.PI);
                ctx.fill();
                ctx.fillText(n.bias, mx - 30, my - 36);
                ctx.fillText(n.activation, mx - 30, my - 18);

            }

            cons.forEach((c, j) => {
                const nl = layer.connectedTo[0].to.size;

                const nx = (ctx.canvas.width/(layers.length*2)) + (il + 1)*(ctx.canvas.width/layers.length)
                const ny = (ctx.canvas.height/(nl*2)) + j*(ctx.canvas.height/nl);

                ctx.globalAlpha = 0.4;
                ctx.lineWidth = Math.min(c.weight*2, 5);

                if(c.weight <= 0.5) ctx.strokeStyle = ctx.fillStyle = "#F22222";
                else ctx.strokeStyle = ctx.fillStyle = "#2222F2";

                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(nx, ny);
                ctx.stroke();

                if(ctx.isPointInStroke(mx, my)) {
                    ctx.globalAlpha = 1;
                    ctx.fillStyle = ctx.strokeStyle = "black";
                    ctx.font = "18px Verdana";
                    ctx.fillText(c.weight, mx - 30, my - 18);
                    ctx.moveTo(x, y);
                    ctx.lineTo(nx, ny);
                    ctx.stroke();
                }
            });
        });
    });

    requestAnimationFrame(() => main(ctx, brain, true));
};

export default main;