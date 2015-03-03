console.log('This would be the main JS file.');

var canvas = document.getElementById("display");
var particleTypes = Object.freeze({
	solute: 'solute', 
	solvent: 'solvent', 
    });
var particles;
var walls;

var init = function() {
    particles = []
    // Solute left:
    for (var i = 0; i < 200; i++) {
	var p = {
	    x: (0.5 * canvas.width - 5) * Math.random(), 
	    y: Math.random() * canvas.height, 
	    vx: 2 * (Math.random() - 1), 
	    vy: 2 * (2 * Math.random() - 1), 
	    color: '#FF8888', 
	    radius: 5, 
	    mass: 8, 
	    type: particleTypes.solute, 
	};
	particles.push(p);
    }
    // Solute right:
    for (var i = 0; i < 50; i++) {
	var p = {
	    x: 0.5 * canvas.width + 5 + (0.5 * canvas.width - 5) * Math.random(), 
	    y: Math.random() * canvas.height, 
	    vx: 2 * (2 * Math.random() - 1), 
	    vy: 2 * (2 * Math.random() - 1), 
	    color: '#FF8888', 
	    radius: 5, 
	    mass: 8, 
	    type: particleTypes.solute, 
	};
	particles.push(p);
    }
    // Solvent:
    for (var i = 0; i < 500; i++) {
	var p = {
	    x: Math.random() * canvas.width, 
	    y: Math.random() * canvas.height, 
	    vx: 2 * (2 * Math.random() - 1), 
	    vy: 2 * (2 * Math.random() - 1), 
	    color: '#8899AA', 
	    radius: 2, 
	    mass: 4, 
	    type: particleTypes.solvent, 
	};
	if (i == 0)
	    p.color = '#FF0000';
	particles.push(p);
    }

    walls = [];
    walls.push({
	    p1: {x: canvas.width / 2, y: 0}, 
	    p2: {x: canvas.width / 2, y: canvas.height }, 
	    style: '#AAAAAA', 
	    blocks: function(type) { return type == particleTypes.solute; }, 
	});
};

var draw = function() {
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < particles.length; i++) {
	var p = particles[i];
	ctx.beginPath();
	ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
	ctx.fillStyle = p.color;
	ctx.fill();
    }

    for (var i = 0; i < walls.length; i++) {
	var w = walls[i];
	ctx.beginPath();
	ctx.moveTo(w.p1.x, w.p1.y);
	ctx.lineTo(w.p2.x, w.p2.y);
	ctx.strokeStyle = w.style;
	ctx.stroke();
    }
};

var times = function(c, v) {
    return {
	x: c * v.x, 
	y: c * v.y, 
    };
};

var add = function(v, u) {
    return {
	x: v.x + u.x, 
	y: v.y + u.y, 
    };
};

var sub = function(v, u) {
    return add(v, times(-1, u));
};

var norm = function(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
};

var dot = function(v, u) {
    return v.x * u.x + v.y * u.y;
};

var dist = function(p, q) {
    return norm(sub(p, q));
};

var vec = function(x, y) {
    return {
	x: x, 
	y: y, 
    };
};

var step = function() {
    var oldCollisions = [];
    for (var i = 0; i < particles.length; i++) {
	var p = particles[i];
	oldCollisions.push(vec(p.x, p.y));
	p.x += p.vx;
	p.y += p.vy;

	// Check for particle-wall collisions
	//
	// Corrective factors are commented out to avoid creating collisions 
	// with other particles:
	if (p.x - p.radius < 0) {
	    p.x = p.radius;// + (p.radius - p.x);
	    // Use abs so that if somehow we're moving away from the wall we do nothing
	    p.vx = Math.abs(p.vx);
	} else if (p.x + p.radius > canvas.width) {
	    p.x = canvas.width - p.radius;// - (p.x + p.radius - canvas.width);
	    p.vx = -Math.abs(p.vx);
	}
	if (p.y - p.radius < 0) {
	    p.y = p.radius;// + (p.radius - p.y);
	    p.vy = Math.abs(p.vy);
	} else if (p.y + p.radius > canvas.height) {
	    p.y = canvas.height - p.radius;// - (p.y + p.radius - canvas.height);
	    p.vy = -Math.abs(p.vy);
	}
    }

    // Check for particle-particle collisions
    for (var i = 0; i < particles.length; i++) {
	for (var j = i + 1; j < particles.length; j++) {
	    var p = particles[i];
	    var q = particles[j];
	    var d = dist(p, q);
	    if (i == j || d > p.radius + q.radius)
		continue;

	    // Undo the collision:
	    p.x -= p.vx; p.y -= p.vy;
	    q.x -= q.vx; q.y -= q.vy;
	    d = dist(p, q);

	    if (d == 0) // Pretty unlikely haha
		continue;

	    var vpdot = (p.vx - q.vx) * (p.x - q.x) + (p.vy - q.vy) * (p.y - q.y);
	    p.vx -= 2 * q.mass / (p.mass + q.mass) * vpdot / (d * d) * (p.x - q.x);
	    p.vy -= 2 * q.mass / (p.mass + q.mass) * vpdot / (d * d) * (p.y - q.y);
	    q.vx -= 2 * p.mass / (p.mass + q.mass) * vpdot / (d * d) * (q.x - p.x);
	    q.vy -= 2 * p.mass / (p.mass + q.mass) * vpdot / (d * d) * (q.y - p.y);

	    if (d <= p.radius + q.radius) {
		// If the previous unsticking didn't help then try this:
		p.x += p.vx; p.y += p.vy;
		q.x += q.vx; q.y += q.vy;
	    }
	}
    }

    for (var i = 0; i < particles.length; i++) {
	var p = particles[i];
	for (var j = 0; j < walls.length; j++) {
	    var w = walls[j];

	    if (!w.blocks(p.type))
		continue;
	    
	    var dir = sub(w.p1, w.p2);
	    var u = times(1 / norm(dir), dir);
	    var uPerp = vec(u.y, -u.x);

	    var dot1 = dot(sub(vec(p.x, p.y), w.p1), vec(u.y, -u.x));
	    var dot2 = dot(sub(vec(p.x - p.vx, p.y - p.vy), w.p1), uPerp);
	    // We hit if we switch sides or intersect the line:
	    if (dot1 * dot2 > 0 && Math.abs(dot1) > p.radius)
		continue;

	    p.x = oldCollisions[i].x;
	    p.y = oldCollisions[i].y;

	    var pv = vec(p.vx, p.vy);
	    var parallel = times(dot(pv, u), u);
	    var perp = sub(pv, parallel);

	    if (dot(perp, uPerp) * dot(sub(vec(p.x, p.y), w.p1), uPerp) < 0)
		perp = times(-1, perp);
	    var result = add(parallel, perp);

	    p.vx = result.x;
	    p.vy = result.y;
	}
    }

    var leftCount = 0;
    var rightCount = 0;
    for (var i = 0; i < particles.length; i++) {
	if (particles[i].type != particleTypes.solvent)
	    continue;
	if (particles[i].x <= canvas.width / 2)
	    leftCount++;
	else
	    rightCount++;
    }
    document.getElementById("lsolvent").innerHTML = leftCount;
    document.getElementById("rsolvent").innerHTML = rightCount;

    draw();
};

init();
draw();
setInterval(step, 5);