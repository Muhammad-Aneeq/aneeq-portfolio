/**
 * The hero aurora: one fragment shader on a full-screen triangle, in raw WebGL.
 *
 * React Bits' Aurora does this with `ogl`; this is the same idea without the library,
 * about 2 KB, loaded only after the page has painted (see aurora.tsx). Rendered at half
 * resolution, because an aurora is soft by nature and the saving is 4x the pixels.
 * The loop stops whenever the hero is off-screen or the tab is hidden.
 */

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

const FRAG = `precision mediump float;
uniform vec2 uRes;uniform float uTime;uniform vec3 uA;uniform vec3 uB;uniform float uStrength;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p*=2.;a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  float t=uTime;
  float h=fbm(vec2(uv.x*1.5+t*.03,t*.05));
  float h2=fbm(vec2(uv.x*3.2-t*.045,t*.08+7.));
  float edgeY=.32+h*.42+h2*.18;
  float y=1.-uv.y;
  float body=smoothstep(edgeY+.05,edgeY-.45,y);
  float rim=exp(-pow((y-edgeY)*7.,2.));
  float rays=.55+.45*sin(uv.x*34.+h2*9.+t*.25);
  vec3 col=mix(uA,uB,smoothstep(.05,.95,uv.x+.25*(h-.5)));
  float a=(body*.38+rim*.62*rays)*uStrength;
  a*=smoothstep(0.,.14,uv.x)*smoothstep(1.,.86,uv.x);
  a=clamp(a,0.,1.);
  gl_FragColor=vec4(col*a,a);
}`;

export type AuroraColours = { a: [number, number, number]; b: [number, number, number]; strength: number };

export function startAurora(canvas: HTMLCanvasElement, colours: () => AuroraColours, still: boolean) {
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, antialias: false, alpha: true });
  if (!gl) return null;

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  // One triangle that covers the whole viewport.
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const u = (n: string) => gl.getUniformLocation(prog, n);
  const uRes = u("uRes"), uTime = u("uTime"), uA = u("uA"), uB = u("uB"), uStrength = u("uStrength");

  const SCALE = 0.5;
  const resize = () => {
    const w = Math.max(1, Math.round(canvas.clientWidth * SCALE));
    const h = Math.max(1, Math.round(canvas.clientHeight * SCALE));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    gl.uniform2f(uRes, w, h);
  };

  const draw = (seconds: number) => {
    resize();
    const c = colours();
    gl.uniform3f(uA, ...c.a);
    gl.uniform3f(uB, ...c.b);
    gl.uniform1f(uStrength, c.strength);
    gl.uniform1f(uTime, seconds);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  // A fixed moment for reduced motion: the picture, not the movement.
  if (still) {
    draw(42);
    return { redraw: () => draw(42), stop: () => {} };
  }

  let raf = 0;
  let visible = true;
  const t0 = performance.now() - 30_000; // start mid-flow, not from a flat first frame
  const loop = (now: number) => {
    draw((now - t0) / 1000);
    raf = requestAnimationFrame(loop);
  };
  const play = () => {
    if (!raf && visible && !document.hidden) raf = requestAnimationFrame(loop);
  };
  const pause = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) play();
    else pause();
  });
  io.observe(canvas);
  const onVis = () => (document.hidden ? pause() : play());
  document.addEventListener("visibilitychange", onVis);
  play();

  return {
    redraw: () => draw((performance.now() - t0) / 1000),
    stop: () => {
      pause();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    },
  };
}
