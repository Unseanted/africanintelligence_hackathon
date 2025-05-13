
var INC = {},
  UB;

function cta(o) {
  var a = [];
  for (var i in o) a.push(i);
  return a;
}
function cto(a, v) {
  var o = {};
  for (var i = 0; i < ocn(a); i++) {
    o[a[i]] = v ? v : "";
  }
  return o;
}
function datemap(dm = "") {
  var y = date("y", dm),
    m = date("m", dm),
    d = date("dt", dm),
    o = {
      f: date("f", dm),
      y: y,
      m: m,
      d: d,
      dy: date("dy", dm),
      h: date("h", dm),
      mn: date("mn", dm),
      s: date("s", dm),
      ms: date("ms", dm),
      t: date("f", dm).split(" ")[4],
    };
  o.key =
    o.ms +
    "" +
    o.mn +
    "" +
    o.y +
    "" +
    o.d +
    "" +
    o.dy +
    "" +
    o.h +
    "" +
    o.m +
    "" +
    o.s;
  return o;
}
function date(r, dm) {
  var o = dm ? dm : new Date(),
    v;
  if (r === "f") v = o.toString().split("+")[0];
  if (r === "m") v = o.getMonth();
  if (r === "y") v = o.getFullYear();
  if (r === "dt") v = o.getDate();
  if (r === "dy") v = o.getDay();
  if (r === "do") v = o;
  if (r === "h") v = o.getHours();
  if (r === "mn") v = o.getMinutes();
  if (r === "s") v = o.getSeconds();
  if (r === "ms") v = o.getMilliseconds();
  return v;
}
function $$$(e, i, c, at, y) {
  var d = document.createElement(e);
  if (i) d.id = i;
  if (c) d.className = c;
  attme(d, at);
  if (y) feedme(d, y);
  return d;
}
function attme(c, o) {
  if (!o) return;
  for (var i in o) c.setAttribute(i, o[i]);
}
function feedme(p, c) {
  if (!p || !c) return;
  if (typeof c === "string" || typeof c === "number") {
    p.innerHTML += c;
  } else {
    for (var i in c) if (c[i]) APP(p, c[i]);
  }
}
function APP(p, c) {
  if (!p || !c) return;
  try {
    p.appendChild(c);
  } catch (err) {
    var pi = iso(p) && p.id ? p.id : "",
      ci = iso(c) && c.id ? p.id : "";
    console.log(pi + "-----" + ci);
  }
}
var iso = (el) => {
  return typeof el === "object";
};
function clg(t,ex) {
  console.log(t,ex);
}
function ocn(o) {
  var c = 0;
  for (var i in o) {
    c += 1;
  }
  return c;
}
function revarray(v) {
  var c = [],
    r = "";
  for (var i = ocn(v) - 1; i > -1; i--) c.push(v[i]);
  return c;
}
var flashbox = (v, ia, r) => {
  var h = small("Notice", "blue").e,
    rd = colbox("nopad", 3, 2, 4, 11),
    eo = { e: rd, f1: myf1 },
    ks,
    it,
    x1,
    y = 0.8,
    zz = {};
  APP(document.body, rd);
  rootstyle(
    rd,
    "position:fixed;overflow:hidden;z-index:99999999999999;right:.3em;top:3em;width:39%;"
  );
  function myf1(v, ia, r) {
    y = 0.5;
    var k = "flash-" + datemap().key + (ocn(zz) + 1),
      x1 = sect(
        "",
        (r ? "bred" : "bgreen") +
          " ohidden my-2 px-2 pt-3 widthun white animated zoomIn",
        "",
        [
          par(
            [
              strong([icon2(r ? "fminode" : "fplnode", "white")]).e,
              par([small(v, "white", "font13").e], "nomargin", "mx-2"),
            ],
            "pad2",
            "d-flex"
          ),
        ]
      ),
      x2;
    zz[k] = x1;
    clg(k);
    APP(rd, x1);
    rootstyle(
      x1,
      "border-radius:.5em;overflow:hidden;z-index:99999999999999;box-shadow:.2em .5em .4em #bbba;transition:opacity:.4s;"
    );
    x2 = setTimeout(() => {
      myfx(k);
      clearTimeout(x2);
    }, 90);
    clg(k);
  }
  function myfx(k) {
    if (!zz[k]) return;
    var it = ia
        ? setInterval(() => {
            y = y - 0.1;
            zz[k].style.opacity = y;
            if (y < 0.1) clearInterval(it);
          }, 100)
        : "",
      x1 = setTimeout(() => {
        if (zz[k]) X(zz[k]);
        delete zz[k];
        clearTimeout(x1);
      }, 3000);
  }
  return eo;
};
var strong = (tx, id, c, at) => {
  var rd = $$$("strong", id, c, at),
    eo = {};
  eo.e = rd;
  typeof tx === "string" || typeof tx === "number"
    ? (rd.innerHTML = tx)
    : feedme(rd, tx);
  return eo;
};
var small = (tx, id, c, at) => {
  var rd = $$$("small", id, c, at),
    eo = {};
  eo.e = rd;
  typeof tx === "string" || typeof tx === "number"
    ? (rd.innerHTML = tx)
    : feedme(rd, tx);
  return eo;
};
var sup = (tx, id, c, at) => {
  var rd = $$$("sup", id, c, at),
    eo = { e: rd };
  typeof tx === "string" || typeof tx === "number"
    ? (rd.innerHTML = tx)
    : feedme(rd, tx);
  return eo;
};
var sub = (tx, id, c, at) => {
  var rd = $$$("sub", id, c, at),
    eo = { e: rd };
  typeof tx === "string" || typeof tx === "number"
    ? (rd.innerHTML = tx)
    : feedme(rd, tx);
  return eo;
};
var center = (tx, id, c, at) => {
  var rd = $$$("center", id, c, at),
    eo = {};
  eo.e = rd;
  typeof tx === "string" ? (rd.innerHTML = tx) : feedme(rd, tx);
  return eo;
};
var colbox = function (id, l, m, s, x, cl, c, at) {
  var rd = DIV(
    id,
    "col-lg-" + l + " col-md-" + m + " col-sm-" + s + " col-xs-" + x + " colbox"
  );
  if (cl) for (var i in cl) APP(rd, cl[i]);
  if (c) addclass(rd, c);
  if (at) attme(rd, at);
  return rd;
};
var DIV = (id, c, at, cl) => {
  var rd = $$$("div", id, c);
  attme(rd, at);

  if (cl) feedme(rd, cl);
  return rd;
};
var sect = (id, c, at, cl) => {
  var rd = $$$("section", id, c);
  attme(rd, at);

  if (cl) feedme(rd, cl);
  return rd;
};
var par = function (tx, id, c, at) {
  var p = $$$("p", id, c);
  attme(p, at);
  if (typeof tx != "object") {
    p.innerHTML = tx ? tx : "";
  } else {
    feedme(p, tx);
  }
  return p;
};
var anc = function (rf, cn, cl, id, ro) {
  var a = $$$("a", id, cl);
  if (rf) a.href = rf;
  if (cn) {
    if (typeof cn != "object") {
      a.innerHTML = cn;
    } else {
      feedme(a, cn);
    }
  }
  attme(a, ro);
  return a;
};
var hea = function (c, tx, id, cl, at) {
  var t = "h" + c,
    a = $$$(t, id, cl);
  if (at) attme(a, at);
  if (typeof tx == "string") {
    a.innerHTML = tx;
  } else {
    feedme(a, tx);
  }
  return a;
};
var icon2 = (v, i, c, at) => {
  var a = $$$("i", i, INC[v]);
  if (c) addclass(a, c);
  if (at) attme(a, at);
  return a;
};
var modal = (o, xm) => {
  var hd = $$$("header", "", "flex justify-between", "", [
      DIV("", "", "", o.hd),
      but(
        [$$$("i", "xmod", "bi bi-x font25")],
        "",
        "xmod",
        "inline-flex items-center justify-center w-6 h-6 text-gray-400 transition-colors duration-150 rounded dark:hover:text-gray-200 hover: hover:text-gray-700"
      ),
    ]),
    ws = DIV(
      "modal-ws",
      "modal-ws text-sm text-gray-700 dark:text-gray-400",
      "",
      o.ws
    ),
    md = DIV("", "mt-4 mb-6", "", [ws]),
    mm = DIV(
      "modal",
      "w-full px-6 py-4 overflow-hidden bg-white rounded-t-lg dark:bg-gray-800 sm:rounded-lg sm:m-4 sm:max-w-xl",
      {
        "x-transition:enter": "transition ease-out duration-150",
        "x-transition:enter-start": "opacity-0 transform translate-y-1/2",
        "x-transition:enter-end": "opacity-100",
        "x-transition:leave": "transition ease-in duration-150",
        "x-transition:leave-start": "opacity-100",
        "x-transition:leave-end": "opacity-0  transform translate-y-1/2",
        role: "dialog",
        style: "",
      },
      [
        hd,
        md,
        $$$(
          "footer",
          "",
          "flex flex-col items-center justify-end px-6 py-3 -mx-6 -mb-4 space-y-4 sm:space-y-0 sm:space-x-6 sm:flex-row bg-gray-50 dark:bg-gray-800",
          "",
          [
            but(
              o.k2 ? o.k2 : "Cancel",
              "",
              "mkey2",
              "w-full px-5 py-2 text-sm font-medium leading-5 grey6 transition-colors duration-150 border border-gray-300 rounded-lg dark:text-gray-400 sm:px-4 sm:py-2 sm:w-auto active:bg-transparent hover:border-gray-500 focus:border-gray-500 active:text-gray-500 focus:outline-none focus:shadow-outline-gray"
            ),
            but(
              o.k1 ? o.k1 : "Submit",
              "",
              "mkey1",
              "w-full px-5 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-purple-600 border border-transparent rounded-lg sm:w-auto sm:px-4 sm:py-2 active:bg-purple-600 hover:bg-purple-700 focus:outline-none focus:shadow-outline-purple"
            ),
          ]
        ),
      ]
    ),
    rd = DIV(
      "xmod",
      "fixed inset-0 z-30 flex items-end bg-black bg-opacity-50 sm:items-center sm:justify-center",
      {
        "x-transition:enter": "transition ease-out duration-150",
        "x-transition:enter-start": "opacity-0",
        "x-transition:enter-end": "opacity-100",
        "x-transition:leave": "transition ease-in duration-150",
        "x-transition:leave-start": "opacity-100",
        "x-transition:leave-end": "opacity-0",
        style: "",
      },
      [mm]
    ),
    eo = { e: rd, fx: myfx },
    val = true;
  function myfx(v) {
    X(rd);
    if (v && o.fx) o.fx();
  }
  function myf1() {
    o.f1();
    if (xm) myfx();
  }
  function myf2() {}
  addEvent(rd, "keydown", (v) => {
    var e = v.code,
      ev = v.key;
    if (e == "Enter" || ev == "Enter") myf1();
    if (ev == "Escape" || e == "Escape") myfx();
  });
  addEvent(rd, "click", (e) => {
    e = ee(e);
    if (e.id == "xmod") myfx();
    if (e.id == "mkey2") myfx(true);
    if (e.id == "mkey1") myf1();
  });
  return eo;
};
function parse(s) {
  if (!s) return 0;
  var t = s.toString();
  if (isfra(t)) {
    return parseFloat(s);
  } else {
    return parseInt(s);
  }
}
function parseup(s) {
  if (!s) return 0;
  var t = s;
  if (isfra(t)) {
    var a = rnd(t, 1);
    a = a.toString().split(".");
    a = parse(a[1]) > 4 ? parse(a[0]) + 1 : a[0];
    parse(a);
    t = a;
  }
  return parseInt(t);
}
function isfra(n) {
  var r = false;
  n = n.toString();
  if (n.indexOf(".") > 0) {
    r = true;
  }
  return r;
}
function spaceword(t) {
  var v = "",
    a = t.split(" ");
  if (ocn(a) == 1 || ocn(a[0]) > 1) return false;
  v = a[0] ? a[0] : "";
  for (var i = 1; i < ocn(a); i++)
    if (ocn(a[i]) > 1) {
      v = false;
      break;
    } else {
      if (!a[i]) continue;
      v = v ? v + (" " + a[i]) : v + a[i];
    }
  return v;
}
function fetchvalu(o) {
  var r = {};
  for (var i in o)
    if (o[i].type == "phone" || o[i].name == "phone") {
      r[i] = "0" + parse(o[i].value);
    } else if (
      o[i].type == "password" ||
      o[i].type == "time" ||
      o[i].type == "date" ||
      o[i].type == "number"
    ) {
      r[i] = o[i].value;
    } else if (
      o[i].type == "username" ||
      o[i].name == "username" ||
      (o[i].placeholder && o[i].placeholder.toLowerCase() == "name") ||
      o[i].type == "gender" ||
      o[i].name == "gender" ||
      (o[i].placeholder && o[i].placeholder.toLowerCase() == "gender")
    ) {
      r[i] = spaceword(o[i].value)
        ? spaceword(o[i].value)
        : cleaname(o[i].value);
    } else if (o[i].type == "keyvalue") {
      r[i] = cleantxt(o[i].value);
    } else {
      r[i] = cleantxt(o[i].value);
    }
  return r;
}
var but = function (v, t, id, c, ro) {
  var d = $$$("button", id, c);
  attme(d, ro);
  d.type = t;
  if (typeof v == "string") {
    d.innerHTML = v;
  } else {
    for (var i in v) APP(d, v[i]);
  }
  return d;
};
function addEvent(element, event, func) {
  return element.addEventListener(event, func);
}
var select = (a, id, cl, at, fnc, fc) => {
  var rd = $$$("select", id, cl ? cl : "form-control", at),
    p = cta(a)[0],
    k,
    eo = { e: rd, f1: myf1 };
  for (var i in a) APP(rd, myboy(i));
  function myboy(v) {
    var op = $$$(
      "option",
      "sel-opt",
      "text-gray-700 dark:text-gray-100 dark:bg-gray-700"
    );
    op.value = v;
    op.innerHTML = v;
    return op;
  }
  function myf1(v) {
    rd.innerHTML = "";
    for (var i in v) APP(rd, myboy(i));
  }
  if (fnc)
    k = setInterval(() => {
      if (rd.value != p) {
        fnc(fc ? a[rd.value] : rd.value);
        p = rd.value;
      }
    }, 50);
  return eo;
};
function resetkeys(r, a) {
  for (var i in r)
    if (r[i].textContent != a[i]) {
      r[i].textContent = a[i];
      r[i].style.color = "";
    }
}
function redtxt(el, tx) {
  if (!el) return;
  el.textContent = tx;
  //feedme(el,[icon('alerti','red'),span(tx,'red','',{color:'red'})]);
  el.style.color = "red";
}
function validate(ul,sk) {
  var vali = '';
  for (var i in ul) {
    if (!ul[i].value && (!sk || !sk[i])) {
      vali = ( "Enter " + i);
      break
    } else if (ul[i].type == "email") {
      if (!ebmail(ul[i].value)) {
        vali = ("invalid email");
        break
      }
    } else if (
      ul[i].placeholder &&
      ul[i].placeholder.toLowerCase() == "gender"
    ) {
      if (!isgender(ul[i].value)) {
        vali = ('gender must either be "male" or "female"');
        break;
      }
    }
  }
  return vali;
}
var input = function (id, c, at, ta, vl, fn) {
  var v = ta ? "textarea" : "input",
    rd = $$$(v, id, c, at, vl);
  if (ta) rd.style.minHeight = "10em";
  if (fn)
    addEvent(rd, "input", () => {
      if (rd.value < fn.l) {
        rd.value = fn.l;
        return;
      }
      fn.f(rd.value);
    });
  addEvent(rd, "keydown", (v) => {
    var e = v.key,
      ev = v.code;
    if (e == "Enter" || ev == "Enter") {
      v.preventDefault();
    }
  });
  return rd;
};
var phul2 = function (ar, ra, as, vl, ob, ns, tp, tc) {
  var ul = $$$("form", "", "p-1"),
    rd = DIV("widthun", "", "", [ul]),
    wc = 1,
    b = {},
    f = {},
    c,
    k,
    m,
    eo = { e: rd, o: b, a: f, f1: myf1, f2: myf2 },
    d,
    v,
    q,
    s,
    w,
    x,
    so;
  for (var i in ar) {
    v = ra && ra[i] ? ra[i] : "";
    k = as && as[i] ? as[i] : "";
    x = "input-" + wc;
    if (k.toLowerCase() == "gender") so = ["male", "female"];
    q = $$$(
      "label",
      tc ? tc : "",
      "form-label img-zoomin text-gray-700 dark:text-gray-100",
      { for: x },
      v
    );
    c = {
      i:
        k.toLowerCase() == "gender"
          ? select(
              cto(["male", "female"]),
              x,
              "form-control dark:text-gray-100"
            ).e
          : input(
              x,
              "form-control img-zoomin my-3 dark:text-gray-100",
              {
                required: true,
                placeholder: ar[i],
                type: k == "phone" ? "number" : k,
                name: k,
              },
              tp ? tp[i] : ""
            ),
    };
    if (tp && tp[i]) c.i.style.height = "10rem";
    m =
      as && (as[i] == "number" || as[i] == "phone") && vl && vl[i]
        ? parse(vl[i])
        : "";
    if (vl && !m) m = vl[i];
    c.i.value = vl ? m : "";
    d = DIV(
      "",
      "relative shadow-md rad5 animated zoomIn form-floating mb-2 dark:bg-gray-900",
      "",
      [c.e ? c.e : c.i, q]
    );
    APP(ul, d);
    b[ar[i]] = c.i;
    f[ar[i]] = q;
    wc++;
  }
  if (ob) feedme(ul, ob);
  function myf1(o) {
    for (var i in o) {
      k = ocn(ra) ? "enter " + i : i;
      x = "input-" + wc;
      o[i].id = x;
      q = $$$(
        "label",
        tc ? tc : "",
        "form-label text-gray-700 dark:text-gray-100",
        { for: x },
        v
      );
      d = DIV("", "animated zoomIn form-floating mb-4", "", [o[i], q]);
      APP(ul, d);
      b[i] = o[i];
      f[i] = q;
    }
  }
  function myf2(v) {
    feedme(ul, v);
  }

  return eo;
};
function ebmail(e) {
  //if(!)return false;
  return e.indexOf("@") > -1 && e.split("@")[1].split(".")[1] ? true : false;
}
function isgender(m) {
  m = m.toLowerCase();
  return m == "male" || m == "female";
}
function addclass(e, c) {
  e.className = claz(e) ? claz(e) + " " + c : c;
}
function claz(c) {
  return c.className;
}
function rootstyle(e, o) {
  attme(e, { style: o });
}
function X(c) {
  if (c.parentNode) POP(c.parentNode, c);
}
function POP(p, c) {
  p.removeChild(c);
}
function capname(n) {
  if (n.length === 1) return n.toUpperCase();
  var a = n.charAt(0).toUpperCase(),
    b = n.slice(1, n.length).toLowerCase(),
    c = a + b;
  return c;
}
function acronym(w) {
  var a = w.split("."),
    s = true;
  if (ocn(a) > 1) {
    for (var i in a)
      if (ocn(a[i]) > 1) {
        s = false;
        break;
      }
  } else {
    s = false;
  }
  return s;
}
function cleaname(n) {
  if (!n) return "";
  if (parseInt(n) || typeof n === "number") return n;
  var a = n.split(" "),
    c = "",
    d = [];
  for (var i = 0; i < a.length; i++) {
    if (a[i]) {
      d.push(acronym(a[i]) ? a[i].toUpperCase() : capname(a[i]));
    }
  }
  for (var k = 0; k < d.length; k++) {
    if (k === d.length - 1) {
      c += d[k];
    } else {
      c += d[k] + " ";
    }
  }
  if (acronym(c)) return c.toUpperCase();
  return c;
}
function cleantxt(n) {
  if (!n) return "";
  if (parseInt(n) || typeof n === "number") return n;
  var a = n.split(" "),
    c = "",
    d = [];
  for (var i = 0; i < a.length; i++) {
    if (a[i]) {
      d.push(a[i]);
    }
  }
  for (var k = 0; k < d.length; k++) {
    if (k === d.length - 1) {
      c += d[k];
    } else {
      c += d[k] + " ";
    }
  }
  return c;
}
function joinus(a) {
  var v = "";
  for (var i in a) {
    v = v + "" + a[i];
  }
  return v;
}
function ee(e) {
  var r = e || window.event;
  r = e.target || e.srcElement;
  return r;
}
function clonetxt(tx) {
  if (typeof tx != "string") return tx;
  var a = tx.split(""),
    b = "";
  for (var i in a) b += a[i];

  return b;
}
function clonea(a) {
  var r = [];
  for (var i in a) r.push(a[i]);
  return r;
}
function cloneo(a) {
  if (!a) return {};
  var x = jp(clonetxt(Js(a))),
    r = {};
  for (var i in a) r[i] = x[i];
  return r;
}
function jp(s) {
  var o;
  try {
    o = JSON.parse(s);
    return o;
  } catch (err) {
    return s;
  }
}
function Js(o) {
  return !jp(o)?o:JSON.stringify(o);
}
function js(o) {
  return JSON.stringify(o);
}
function mrgarrays(a, b) {
  var o = {};
  for (var i in a) o[a[i]] = b[i];
  return o;
}
function sortOb(o) {
  var a = [],
    no = {};
  for (var i in o) {
    a.push(i);
  }
  a = a.sort();
  for (var i in a) {
    no[a[i]] = o[a[i]];
  }
  return no;
}
function stotal(o) {
  var t = 0,
    b = "fa,sa,ft,st,ex,ttl,pos,grd".split(","),
    a2 = "ass1,ass2,ca1,ca2,ex,ttl,pos,grd".split(","),
    a3 = "pro,ass,ca1,ca2,ex,ttl,pos,grd".split(","),
    k = "",
    e = Object.keys(o);
  if (e[0] == b[0]) k = b;
  if (e[0] == a2[0]) k = a2;
  if (e[0] == a3[0]) k = a3;
  for (var i = 0; i < 5; i++) {
    if (o[k[i]]) t += parse(o[k[i]]);
  }
  return t;
}
function gradepoint(t) {
  if (!t) return "";
  var sum = parseup(t),
    grd = "",
    k;
  if (sum >= 96 && sum <= 100) {
    switch (sum) {
      case 96:
        k = "8.2";
        break;
      case 97:
        k = "8.4";
        break;
      case 98:
        k = "8.6";
        break;
      case 99:
        k = "8.8";
        break;
      case 100:
        k = "9";
        break;
    }
    grd = k;
  }
  if (sum >= 91 && sum < 96) {
    switch (sum) {
      case 91:
        k = "7.2";
        break;
      case 92:
        k = "7.4";
        break;
      case 93:
        k = "7.6";
        break;
      case 94:
        k = "7.8";
        break;
      case 95:
        k = "8";
        break;
    }
    grd = k;
  }
  if (sum >= 86 && sum < 91) {
    switch (sum) {
      case 86:
        k = "6.2";
        break;
      case 87:
        k = "6.4";
        break;
      case 88:
        k = "6.6";
        break;
      case 89:
        k = "6.8";
        break;
      case 90:
        k = "7.00";
        break;
    }
    grd = k;
  }
  if (sum >= 81 && sum < 86) {
    switch (sum) {
      case 81:
        k = "5.2";
        break;
      case 82:
        k = "5.4";
        break;
      case 83:
        k = "5.6";
        break;
      case 84:
        k = "5.8";
        break;
      case 85:
        k = "6";
        break;
    }
    grd = k;
  }
  if (sum >= 76 && sum < 81) {
    switch (sum) {
      case 76:
        k = "4.2";
        break;
      case 77:
        k = "4.4";
        break;
      case 78:
        k = "4.6";
        break;
      case 79:
        k = "4.8";
        break;
      case 80:
        k = "5";
        break;
    }
    grd = k;
  }
  if (sum >= 71 && sum < 76) {
    switch (sum) {
      case 71:
        k = "3.2";
        break;
      case 72:
        k = "3.4";
        break;
      case 73:
        k = "3.6";
        break;
      case 74:
        k = "3.8";
        break;
      case 75:
        k = "4";
        break;
    }
    grd = k;
  }
  if (sum >= 66 && sum < 71) {
    switch (sum) {
      case 66:
        k = "2.2";
        break;
      case 67:
        k = "2.4";
        break;
      case 68:
        k = "2.6";
        break;
      case 69:
        k = "2.8";
        break;
      case 70:
        k = "3";
        break;
    }
    grd = k;
  }
  if (sum >= 50 && sum < 66) {
    switch (sum) {
      case 50:
        k = "1.02";
        break;
      case 51:
        k = "1.04";
        break;
      case 52:
        k = "1.06";
        break;
      case 53:
        k = "1.08";
        break;
      case 54:
        k = "1.1";
        break;
      case 55:
        k = "1.2";
        break;
      case 56:
        k = "1.3";
        break;
      case 57:
        k = "1.4";
        break;
      case 58:
        k = "1.4";
        break;
      case 59:
        k = "1.5";
        break;
      case 60:
        k = "1.5";
        break;
      case 61:
        k = "1.6";
        break;
      case 62:
        k = "1.7";
        break;
      case 63:
        k = "1.8";
        break;
      case 64:
        k = "1.9";
        break;
      case 65:
        k = "2";
        break;
    }
    grd = k;
  }
  if (sum < 50) grd = 1;

  return grd;
}
function grade(t) {
  if (!t) return "F9";
  var sum = parse(t),
    grd = "";
  if (sum >= 90 && sum <= 100) grd = "A1";
  if (sum >= 80 && sum < 90) grd = "B2";
  if (sum >= 75 && sum < 80) grd = "B3";
  if (sum >= 70 && sum < 75) grd = "C4";
  if (sum >= 65 && sum < 70) grd = "C5";
  if (sum >= 60 && sum < 65) grd = "C6";
  if (sum >= 55 && sum < 60) grd = "D7";
  if (sum >= 50 && sum < 55) grd = "E8";
  if (sum < 50) grd = "F9";
  return grd;
}
function posob(sa, po, a) {
  var o = cloneo(po),
    p = 1,
    w,
    po = {},
    q,
    tn,
    tb = {},
    t = [],
    np = 1;
  for (var i in a) {
    if (!sa[a.length - 1] || p > a.length) break;
    for (var k in sa) {
      if (!sa[k]) continue;
      for (var s in o) {
        if (!o[s]) continue;
        sa[k] = parse(sa[k]);
        o[s] = parse(o[s]);
        if (o[s] == sa[k]) {
          w = s;
          o[s] = 0;
          q = sa[k];
          break;
        }
      }
      if (!po[p]) {
        for (s in o) {
          if (o[s] == q) {
            t.push(s);
            o[s] = 0;
          }
        }
        rfo(o, 0);
        if (t.length > 0) {
          t.push(w);
          po[p] = t;
        } else {
          if (!ext(po, w)) {
            po[p] = w;
          } else {
            p -= 1;
          }
        }

        p += t[1] ? t.length : 1;
      }

      delete sa[k];
      break;
    }
    if (t.length > 0) {
      for (var k in sa) {
        if (sa[k] == q) {
          delete sa[k];
          break;
        }
      }
    }
    t = [];
  }
  return po;
}
function postus(o) {
  var b = ov2a(o),
    c = posob(sortna(ov2a(o)), o, b);
  b = {};
  for (var i in c) {
    if (typeof c[i] == "object") {
      for (var v in c[i]) b[c[i][v]] = atme(i);
    } else {
      b[c[i]] = atme(i);
    }
  }
  return b;
}
function atme(p) {
  if (!p) return;
  if (typeof p != "string") p = p.toString();
  var a = ["st", "nd", "rd", "th"],
    k = p.charAt(p.length - 1),
    c = "",
    w = p.toString();
  if (k == "1") {
    c = w == "11" ? a[3] : a[0];
  } else if (k == "2") {
    c = w == "12" ? a[3] : a[1];
  } else if (k == "3") {
    c = w == "13" ? a[3] : a[2];
  } else if (k == "0") {
    c = a[3];
  } else if (!p == "") {
    c = a[3];
  }
  c = p + c;
  return c;
}
function rnd(f, r, em) {
  if (!f) return "";
  var s = f.toString(),
    w = isfra(f),
    x,
    y,
    z,
    b,
    g,
    h,
    j;
  if (!w) return f;
  j = dome();
  s = j.toString();
  h = s.split(".");
  if (ocn(h[1]) > r) j = dome();
  return j;
  function dome() {
    s = s.split(".");
    y = s[1];
    if (r >= ocn(y)) return parseFloat(s[0] + "." + y);
    b = ocn(y);
    w = y.slice(0, r);
    x = y.slice(r, b).split("");
    if (parse(x[0]) > 4) {
      z = parse(w.charAt(ocn(w) - 1)) + 1;
      z = w.slice(0, ocn(w) - 1) + "" + z;
      return parseFloat(s[0] + "." + z);
    }
    for (var i = ocn(x) - 1; i > -1; i--)
      if (i != 0)
        if (parse(x[i]) > 4 && parse(x[i - 1]) != 9)
          x[i - 1] = parse(x[i - 1]) + 1;
    if (parse(x[0]) > 4) {
      z = parse(w.charAt(ocn(w) - 1)) + 1;
      z = w.slice(0, ocn(w) - 1) + "" + z;
      return parseFloat(s[0] + "." + z);
    }
    return parseFloat(s[0] + "." + w);
  }
}
var ov2a = (o, b) => {
  var a = [],
    c = b ? b : o;
  for (var i in c) a.push(o[i]);
  return a;
};
function ext(o, c) {
  var x = false;
  for (var i in o) {
    if (typeof o[i] == "object") {
      for (var v in o[i]) {
        if (o[i][v] == c) {
          x = true;
          break;
        }
      }
      if (x) break;
    } else {
      if (o[i] == c) {
        x = true;
        break;
      }
    }
  }
  return x;
}
function sortna(a) {
  var o = {},
    h = 0,
    c,
    ta = [];
  for (var i in a) {
    ta.push(a[i]);
  }
  for (var i in ta) {
    for (var j in ta) {
      if (ta[j] != "" && ta[j] > h) {
        h = ta[j];
        c = j;
      }
    }
    o[i] = h;
    ta[c] = "";
    h = 0;
  }
  return o;
}
function rfo(o, r) {
  for (var i in o) {
    if (o[i] == r) delete o[i];
  }
}
function suma(o) {
  var t = 0,
    g;
  for (var i in o) {
    if (
      i != "grd" &&
      i != "ttl" &&
      i != "gp" &&
      i != "rmk" &&
      i != "pos" &&
      i != "cv" &&
      i != "gpa"
    ) {
      g = o[i];
      if (g) {
        g = g.toString();
        if (g.indexOf(".") >= 0) {
          g = parseFloat(g);
        } else {
          g = parseInt(g);
        }
        t += g;
      }
    }
  }
  return t;
}
function sume(d, o, x, y) {
  var a = suma(o);
  x[d] = a;
  y.push(a);
}
function markcolor(t) {
  if (!t) return "red";
  var sum = parse(t),
    grd = "";
  if (sum >= 90 && sum <= 100) grd = "grey6";
  if (sum >= 91 && sum < 96) grd = "grey6";
  if (sum >= 86 && sum < 91) grd = "grey6";
  if (sum >= 81 && sum < 86) grd = "green";
  if (sum >= 76 && sum < 81) grd = "green";
  if (sum >= 71 && sum < 76) grd = "green";
  if (sum >= 66 && sum < 71) grd = "blue";
  if (sum >= 50 && sum < 66) grd = "blue";
  if (sum < 50) grd = "red";

  return grd;
}
function remark(t) {
  if (!t) return "";
  var sum = parse(t),
    grd = "";
  if (sum >= 96 && sum <= 100) grd = "Distinction";
  if (sum >= 91 && sum < 96) grd = "Distinction";
  if (sum >= 86 && sum < 91) grd = "Distinction";
  if (sum >= 81 && sum < 86) grd = "Credit";
  if (sum >= 76 && sum < 81) grd = "Credit";
  if (sum >= 71 && sum < 76) grd = "Credit";
  if (sum >= 66 && sum < 71) grd = "Pass";
  if (sum >= 50 && sum < 66) grd = "Pass";
  if (sum < 50) grd = "Fail";
  return grd;
}
var a4box = function (c) {
  var rd = colbox("result", 12, 12, 12, 12, c),
    eo = { e: rd };
  attme(rd, {
    size: "A4",
    style:
      "background:url(img/back1.png);background-size:100% 100%;width:21cm;min-height:29cm;page-break-after:always;margin:auto;float:none;overflow:hidden;display:block;padding:1.4em;padding-top:1.3em;",
  });
  addclass(rd, "page");
  return eo;
};
var jtab = function (id, at, cl) {
  return $$$(
    "table",
    id,
    "table table-bordered table-striped table-hover nomargin widthun",
    at,
    cl
  );
};
var etab = function (id, at, cl, c) {
  return $$$(
    "table",
    id,
    c
      ? c + " widthun table-striped table-hover nomargin"
      : "table-striped table-hover nomargin",
    at,
    cl
  );
};
var ctab = function (id, at, cl) {
  return $$$("table", id, "table nomargin widthun", at, cl);
};
var tbod = function (i, c, at, cl) {
  return $$$("tbody", i, c, at, cl);
};
var img = function (s, i, c, at) {
  var rd = $$$("img", i, c);
  rd.src = s;
  attme(rd, at);
  return rd;
};
var thed = function (id, c, a, tc, ta) {
  var rd = $$$("tr", id, c),
    th = $$$("th", "", "text-center borderb", "", [
      anc("", a[0], "text-center text-gray-700 dark:text-gray-100 mx-1 font13"),
    ]);
  APP(rd, th);
  for (var i = 1; i < a.length; i++) {
    th = $$$(
      "th",
      "",
      tc
        ? tc
        : "font12 borderb text-center text-gray-700 dark:text-gray-100 mx-1",
      ta ? ta : "",
      a[i]
    );
    APP(rd, th);
  }
  return rd;
};
var thed2 = function (id, c, a) {
  var rd = $$$("tr", id, c),
    th;
  for (var i = 0; i < a.length; i++)
    APP(rd, $$$("td", "", "text-center", "", [small(a[i], "").e]));
  return rd;
};
var span = function (tx, id, c, at) {
  var sp = $$$("span", id, c);
  attme(sp, at);
  if (typeof tx != "object") {
    sp.innerHTML = tx ? tx : "";
  } else {
    feedme(sp, tx);
  }
  return sp;
};
function lowscorer(o) {
  var x = {},
    y = [],
    z,
    u = false,
    w,
    r,
    f = "student";
  for (var i in o) {
    sume(i, o[i], x, y);
  }
  for (var i in y) {
    if (!z) z = y[i];
    if (y[i] < z) {
      z = y[i];
      r = i;
    }
  }
  for (var i in y) {
    if (y[i] == z && i != r) {
      u = true;
      break;
    }
  }
  if (u) {
    w = [];
    for (var i in x) {
      if (x[i] == z) w.push(i + ":" + z);
    }
    return w;
  } else {
    for (var i in x) {
      if (x[i] == z) {
        f = i + ":" + z;
        break;
      }
    }
    return f;
  }
}
function topscorer(o) {
  var x = {},
    y = [],
    z = 1,
    u = false,
    w,
    r,
    f = "student";
  for (var i in o) {
    sume(i, o[i], x, y);
  }
  for (var i in y) {
    if (y[i] > z) {
      z = y[i];
      r = i;
    }
  }
  for (var i in y) {
    if (y[i] == z && i != r) {
      u = true;
      break;
    }
  }
  if (u) {
    w = [];
    for (var i in x) {
      if (x[i] == z) w.push(i + ":" + z);
    }
    return w;
  } else {
    for (var i in x) {
      if (x[i] == z) {
        f = i + ":" + z;
        break;
      }
    }
    return f;
  }
}
function gradeus(o) {
  var a = {};
  for (var i in o) a[i] = grade(o[i]);
  return a;
}
function leastone(o) {
  var a = {};
  for (var i in o) a[i] = o[i] ? o[i] : 1;
  return a;
}
function tmpost(o) {
  var a = {},
    b,
    c,
    d;
  for (var i in o) {
    a[i] = stotal(o[i]) ? stotal(o[i]) : 1;
  }
  if (!ocn(a)) return a;
  b = {};
  d = gradeus(a);
  c = postus(leastone(a));
  for (var i in a) {
    b[i] = {};
    b[i].g = d[i];
    b[i].p = c[i];
  }
  return b;
}
var psychoaffectrate = () => {
  var b = "EXEMPLARY,PROFICIENT,CAPABLE,PROGRESSIVE,NOT MEETING STANDARD".split(
      ","
    ),
    w = [5, 4, 3, 2, 1],
    f = "grey6,green,green,blue,red".split(","),
    tb = tbod(),
    eb = etab("widthun", "", [tb]),
    hd = DIV("bgreen", "p-1", "", [
      hea(
        6,
        [small("AFFECTIVE AND PSYCHOMOTOR DOMAIN RATINGS", "white").e],
        "greenboy-h1"
      ),
    ]),
    ws = DIV("", "", "", [eb]),
    ub = DIV("", "py-1", "", [hd, ws]),
    rd = DIV("", "", "", [ub]),
    eo = { e: rd },
    tr,
    x1,
    x2,
    x3;
  for (var i = 0; i < ocn(w); i++) {
    tr = $$$("tr", "grdsys-tr", "", "", [
      $$$("td", "grdsys-td", "borderb", "", [
        small(w[i] + "-" + b[i], "lfloat", f[i] + " font9").e,
      ]),
    ]);
    APP(tb, tr);
  }
  return eo;
};
var psychomotordom = (a, o) => {
  var b = ["S/N", "", 5, 4, 3, 2, 1],
    w = [5, 4, 3, 2, 1],
    f = "grey6,green,green,blue,red".split(","),
    th = thed("grdsys-thd", "", b),
    tb = tbod(),
    eb = etab("widthun", "", [th, tb]),
    hd = DIV("bgreen", "p-1", "", [
      hea(6, [small("PSYCHOMOTOR DOMAIN", "white").e], "greenboy-h1"),
    ]),
    ws = DIV("", "", "", [eb]),
    ub = DIV("", "py-1", "", [hd, ws]),
    rd = DIV("", "", "", [ub]),
    eo = { e: rd },
    tr,
    x1,
    x2,
    x3,
    x4,
    x5,
    x6;
  for (var i = 0; i < ocn(a); i++) {
    tr = $$$("tr", "grdsys-tr");
    APP(tb, tr);
    x3 = small(i + 1, "rfloat").e;
    x4 = small(a[i], "rfloat", "font8").e;
    feedme(tr, [
      $$$("td", "grdsys-td", "borderb", "", [x3]),
      $$$("td", "grdsys-td", "borderb", "", [x4]),
    ]);
    x1 = o && o[a[i]] ? parse(o[a[i]]) : false;
    for (var v in w) {
      x1 && x1 == parse(w[v])
        ? (() => {
            APP(
              tr,
              $$$("td", "grdsys-td", "borderb", "", [
                icon2("ftrophy", f[v], "font9"),
              ])
            );
            addclass(x3, f[v]);
            addclass(x4, f[v]);
          })()
        : (() => {
            APP(tr, $$$("td", "grdsys-td", "borderb", "", [span("")]));
          })();
    }
  }
  return eo;
};
var affectivedom = (a, o) => {
  var b = ["S/N", "", 5, 4, 3, 2, 1],
    w = [5, 4, 3, 2, 1],
    f = "grey6,green,green,blue,red".split(","),
    th = thed("grdsys-thd", "", b),
    tb = tbod(),
    eb = etab("widthun", "", [th, tb]),
    hd = DIV("bgreen", "p-1", "", [
      hea(6, [small("AFFECTIVE DOMAIN", "white").e], "greenboy-h1"),
    ]),
    ws = DIV("", "", "", [eb]),
    ub = DIV("", "py-1", "", [hd, ws]),
    rd = DIV("", "cols-4", "", [ub]),
    eo = { e: rd },
    tr,
    x1,
    x2,
    x3,
    x4,
    x5,
    x6;
  for (var i = 0; i < ocn(a); i++) {
    tr = $$$("tr", "grdsys-tr", "line1");
    APP(tb, tr);
    x3 = small(i + 1, "rfloat").e;
    x4 = small(a[i], "rfloat", "font8").e;
    feedme(tr, [
      $$$("td", "grdsys-td", "line1 borderb", "", [x3]),
      $$$("td", "grdsys-td", "line1 borderb", "", [x4]),
    ]);
    x1 = o && o[a[i]] ? parse(o[a[i]]) : false;
    for (var v in w) {
      x1 && x1 == parse(w[v])
        ? (() => {
            APP(
              tr,
              $$$("td", "grdsys-td", "line1 borderb", "", [
                icon2("ftrophy", f[v], "font9"),
              ])
            );
            addclass(x3, f[v]);
            addclass(x4, f[v]);
          })()
        : (() => {
            APP(tr, $$$("td", "grdsys-td", "line1 borderb", "", [span("")]));
          })();
    }
  }

  return eo;
};
var gradesystem = () => {
  var a = [
      "96-100",
      "91-95",
      "86-90",
      "81-85",
      "76-80",
      "71-75",
      "66-70",
      "50-65",
      "Below 50",
    ],
    b = "A1,B2,B3,C4,C5,C6,D7,E8,F9".split(","),
    c = "9,8,7,6,5,4,3,2,1".split(","),
    d =
      "Distinction,Distinction,Distinction,Credit,Credit,Credit,Pass,Pass,Fail".split(
        ","
      ),
    e = "GP,100,Grade,remark".split(","),
    f = "grey6,grey6,grey6,green,green,green,blue,blue,red".split(","),
    ak = { a: c, b: a, c: b, e: d },
    th = thed("grdsys-thd", "", e),
    tb = tbod(),
    eb = etab("widthun", "", [th, tb]),
    hd = DIV("bgreen", "p-1", "", [
      hea(6, [small("GRADING SYSTEM", "white").e], "greenboy-h1"),
    ]),
    ws = DIV("", "", "", [eb]),
    ub = DIV("", "py-1", "", [hd, ws]),
    rd = DIV("", "cols-4", "", [ub]),
    eo = { e: rd },
    tr,
    x1,
    x2,
    x3;
  for (var i = 0; i < ocn(a); i++) {
    tr = $$$("tr", "grdsys-tr");
    APP(tb, tr);
    for (var v in ak)
      APP(
        tr,
        $$$("td", "grdsys-td", "borderb", "", [
          small(ak[v][i], "lfloat", f[i] + " font10").e,
        ])
      );
  }

  return eo;
};
function nia(o, n) {
  var chk = 0;
  for (var i in o)
    if (o[i] == n) {
      chk = parse(i);
      break;
    }
  return chk;
}
function ourids(o) {
  var a = {};
  for (var i in o) {
    a[o[i].id] = i;
  }

  return a;
}
function barme(t) {
  if (!t) return "0";
  var k = typeof t == "number" ? unbar(t.toString()) : unbar(t),
    s = k,
    a = [],
    x,
    y,
    cx = s.length,
    st = "";
  if (s.length < 4) return s;
  for (var i = 0; i < cx; i++) {
    a.unshift(s.slice(s.length - 3, s.length));
    s = s.slice(0, s.length - 3);
    if (s.length < 4) {
      a.unshift(s);
      break;
    }
  }
  for (var i in a) {
    st += a[i] + ",";
  }
  st = st.slice(0, st.length - 1);
  return st;
}
function unbar(t) {
  if (!t) return;
  var x = t,
    r = "";
  x = x.replace("N", "");
  x = x.split(",");
  for (var i in x) {
    r += x[i];
  }
  return r;
}
function isbar(v) {
  return parseInt(unbar(v));
}
function sumarray(o) {
  var a = 0;
  for (var i in o) if (parse(o[i])) a += parse(o[i]);
  return a;
}
function percent(p, n, r) {
  var a = n / 100;
  return r ? rnd(a * p, r) : a * p;
}
function percentage(p, n, r) {
  if (!n) return 0;
  var a = r ? rnd((n / p) * 100, r) : (n / p) * 100;
  return a;
}
function fileinfo(o) {
  var dt = datemap(),
    k = o.name.split("."),
    b = "file-" + dt.key + ("." + k[ocn(k) - 1]);
  clg({
    size: rnd(o.size / (1024 * 1024), 2) + "MB",
    name: b,
    type: o.type,
    date: dt,
    kname: o.name,
  });
  return {
    size: rnd(o.size / (1024 * 1024), 2) + "MB",
    name: b,
    type: o.type,
    date: dt,
    kname: o.name,
  };
}
function uploadpercent(o, fnc) {
  if (!UB) uploadbox(o);
  UB.f1({ p: o.p });
  if (o.p == 100) {
    if (fnc) fnc();
    UB.fx();
  }
}
var progressbar = (v) => {
  var w,
    p,
    rd = DIV("", "progress ", ""),
    eo = { e: rd, f1: myf1 };
  myf1(v);
  function myf1(o) {
    if (p) X(p);
    w = "width:" + o.p + "%";
    p = DIV(
      "",
      "progress-bar progress-bar-striped",
      {
        role: "progressbar",
        style: w,
        ariaValuenow: o.p,
        ariaValuemin: 0,
        ariaValuemax: 100,
      },
      o.p + "%"
    );
    APP(rd, p);
  }

  return eo;
};
var uploadbox = (v) => {
  var h = small("", "blue").e,
    hd = DIV("", "", "", [
      hea(3, "File Upload", "", "font-bold text-black dark:text-white my-2"),
    ]),
    pb = progressbar({ c: "", p: v.p }),
    ws = DIV("pad2", "", "", [pb.e]),
    rd = DIV(
      "",
      "col-6 bg-white dark:bg-gray-700 rad1",
      "",
      [hd, ws],
      "bwhite"
    ),
    eo = { e: rd, fx: myfx, f1: myf1 },
    ks,
    it;
  APP(document.body, rd);
  UB = eo;
  rootstyle(
    rd,
    "position:fixed;overflow:hidden;z-index:999999;right:1.5em;top:4em;box-shadow:.3em .3em .4em #bbba;padding:.5em;padding-bottom:1em;transition:opacity .4s;"
  );
  function myfx() {
    ks = 1;
    h.innerHTML = "File Uploaded Successfully.";
    it = setInterval(() => {
      ks -= 0.1;
      rd.style.opacity = ks;
      if (ks == 0) {
        X(rd);
        clearInterval(it);
      }
    }, 250);
  }
  function myf1(o) {
    pb.f1({ c: "bpurple", p: o.p });
  }
};
function myhost(c){
  return c?window.location.hostname=='localhost':window.location.hostname;
}
function readme(t){
  let a=window.localStorage.getItem(t);
  return jp(a);
}
function removeme(t){
  return window.localStorage.removeItem(t);
}
function storeme(t,o){if(!o)return;clg(o);
  window.localStorage.setItem(t,Js(o));
}
function noscores(o){
  var x=cto(['ass1','ass2','ca1','ca2','ex']),a=true;for(var i in o)for(var v in x)if(o[i][v]){a=false;break;};return a;
}
function mrgscores(o){
  var a={},b=cto(['ass1','ass2','ca1','ca2','ex','ttl']),c=ocn(o);
  for(var i in o)for(var v in o[i]){
    if(!a[v]){
      a[v]={};for(var r in b)a[v][r]=(o[i][v][r])?parse(o[i][v][r]):0;
    }else{
      for(var r in b)if(o[i][v][r])a[v][r]+=parse(o[i][v][r]);
    }
    
  }
  for(var i in a)for(var v in a[i])a[i][v]=rnd((a[i][v]/c),2);
  return a;
  
}
function mysiblin(o,e,f){clg(o);clg(e);
  var a=cta(o),b='',c;
  for(var i=0;i<ocn(a);i++){
    if(a[i]==e){
      if(f){
        b=(i==(ocn(a)-1))?0:(i+1);
      }else{
        b=(i==0)?(ocn(a)-1):(i-1);
      }
    }
  }
  c=(b||b.toString()=='0')?a[b]:e;
  return c;
  
}
function windowsize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}
function nopikin(o){
  var a=false;
  for(var i in o)if(!o[i]){a=i;break;}
  return a;
}
var mrgob=(a,b)=>{
  var o={};
  for(var i in a)o[i]=a[i];
  for(var i in b)o[i]=b[i];
  return o;
}
function rio(o,a,b){
  var c={};for(var i in o)if(i!=a){c[i]=o[i]}else{if(typeof b=='object'){for(var v in b)c[v]=b[v];}else{c[b]=o[i];}};return c;
}
function myage(dt: string) {
  let x = dt.split("-")[0];
  return parse(datemap().y) - parse(x);
}
function filteranswers(ans){
  let a=[];for(var i in ans)if(!a.find(an=>an.questionId===ans[i].questionId)){a.push(ans[i])}else{a=a.map(an=>{
    return an.questionId==ans[i].questionId?ans[i]:an;
  })};return a;
}



export {
  filteranswers,datemap,mysiblin,myhost,mrgscores,readme,storeme,removeme,windowsize,rio,
  uploadpercent,nopikin,mrgob,myage,
  fileinfo,
  percent,
  percentage,
  sumarray,
  barme,
  unbar,
  nia,
  ourids,
  gradesystem,
  psychoaffectrate,
  psychomotordom,
  affectivedom,
  topscorer,
  lowscorer,
  tmpost,
  gradeus,
  span,
  thed,
  img,
  jtab,
  etab,
  ctab,
  tbod,
  markcolor,
  date,
  $$$,
  clg,
  ocn,
  revarray,
  flashbox,
  cleaname,
  addclass,
  claz,
  rootstyle,
  cleantxt,
  joinus,
  anc,
  center,
  sup,
  sub,
  ee,
  cta,
  cto,
  clonea,
  cloneo,
  clonetxt,
  jp,
  js,
  Js,X,
  mrgarrays,
  modal,
  phul2,
  hea,
  fetchvalu,
  addEvent,
  validate,
  resetkeys,
  APP,
  sortOb,
  DIV,
  stotal,
  grade,
  gradepoint,parseup,noscores,
  postus,
  rnd,
  par,
  parse,
  strong,
  small,
  sume,
  feedme,
  icon2,
  remark,
  ov2a,
  a4box,
  isfra,
};
