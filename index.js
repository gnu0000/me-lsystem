// lsystem.js
//
// An L-System generator
// This is an svg experiment using no plugins or libraries
// Craig Fitzgerald
//

var INITIAL_LSYSTEMS = [
   {name:'Gosper hex'        , axiom:'A',            draw:'AB', length:'8',  steps: '4', angle:'PI / 3',       rules:['A => A+B++B-A--AA-B+', 'B => -A+BB++B+A--A-B']},
   {name:'Hilbert'           , axiom:'A',            draw:'F',  length:'11', steps: '6', angle:'PI / 2',       rules:['A => +BF-AFA-FB+'          , 'B => -AF+BFB+FA-']},
   {name:'Serpinski triangle', axiom:'F-G-G',        draw:'FG', length:'12', steps: '6', angle:'PI * 2 / 3',   rules:['F => F-G+F+G-F', 'G => GG']},
   {name:'Serpinski curve'   , axiom:'F--XF--F--XF', draw:'FG', length:'8',  steps: '4', angle:'PI / 4',       rules:['X => XF+G+XF--F--XF+G+X']},
   {name:'Serpinski curve 2' , axiom:'F+XF+F+XF',    draw:'F',  length:'8',  steps: '4', angle:'PI / 2',       rules:['X => XF-F+F-XF+F+XF-F+F-X']},
   {name:'Koch snowflake'    , axiom:'F--F--F',      draw:'F',  length:'10', steps: '4', angle:'PI / 3',       rules:['F => F+F--F+F']},
   {name:'Dragon'            , axiom:'F',            draw:'FG', length:'15', steps: '10',angle:'PI / 2',       rules:['F => F+G','G => F-G']},
   {name:'Barnsley fern'     , axiom:'+++X',         draw:'F',  length:'5' , steps: '7', angle:'(PI/180)*25',  rules:['X => F+[[X]-X]-F[-FX]+X','F => FF']},
   {name:'Arrowhead'         , axiom:'F',            draw:'FG', length:'7' , steps: '7', angle:'PI / 3',       rules:['F => G-F-G', 'G => F+G+F']},
   {name:'Levy C'            , axiom:'F',            draw:'F',  length:'10', steps: '11',angle:'PI / 4',       rules:['F => +F--F+']},
   {name:'Craig tile'        , axiom:'F+XF+F+XF',    draw:'FX', length:'10', steps: '4' ,angle:'PI / 2',       rules:['X => XF-F+F-XF+F+XFF-X']},
   {name:'Mezzo'             , axiom:'F+F+F+F',      draw:'F',  length:'15', steps: '4' ,angle:'PI / 2',       rules:['F => FF+F-F+F+FF']},
   {name:'Bourke Bush'       , axiom:'+++Y',         draw:'F',  length:'17' ,steps: '6', angle:'(PI/180)*25.7',rules:['X => X[-FFF][+FFF]FX', 'Y => YFX[+Y][-Y]']},
   {name:'Plant 3'           , axiom:'++++F',        draw:'F',  length:'20', steps: '5', angle:'(PI/180)*22'  ,rules:['F => FF+[+F-F-F]-[-F+F+F]']},
   {name:'Bourke Triangle'   , axiom:'F+F+F',        draw:'F',  length:'25', steps: '6', angle:'PI * 2/3',     rules:['F => F-F+F']},
   {name:'Dekking gosper'    , axiom:'-YF',          draw:'F',  length:'25', steps: '6', angle:'PI * 2/3',     rules:['F => F-F+F']},
   {name:'Bourke gosper'     , axiom:'-YF',          draw:'F',  length:'20', steps: '3', angle:'PI/2',         rules:['X => XFX-YF-YF+FX+FX-YF-YFFX+YF+FXFXYF-FX+YF+FXFX+YF-FXYF-YF-FX+FX+YFYF-','Y => +FXFX-YF-YF+FX+FXYF+FX-YFYF-FX-YF+FXYFYF-FX-YFFX+FX+YF-YF-FX+FX+YFY']},
   {name:'Bourke crystal'    , axiom:'F+F+F+F',      draw:'F',  length:'10', steps: '4', angle:'PI/2',         rules:['F => FF+F++F+F']},
   {name:'Hosam snowflake'   , axiom:'FF+FF+FF+FF',  draw:'F',  length:'6',  steps: '4', angle:'PI/2',         rules:['F => F+F-F-F+F']},
   {name:'Kock island'       , axiom:'F+F+F+F',      draw:'F',  length:'7',  steps: '3', angle:'PI/2',         rules:['F => F+F-F-FFF+F+F-F']},
   {name:'Bourke board'      , axiom:'F+F+F+F',      draw:'F',  length:'10', steps: '4', angle:'PI/2',         rules:['F => FF+F+F+F+FF']},
   {name:'Pentaplexity'      , axiom:'F++F++F++F++F',draw:'F',  length:'13', steps: '4', angle:'(PI/180)*36',  rules:['F => F++F++F|F-F++F']},
   {name:'Rings'             , axiom:'F+F+F+F',      draw:'F',  length:'3',  steps: '4', angle:'PI/2',         rules:['F => FF+F+F+F+F+F-F']},
   {name:'Mango leaf'        , axiom:'Y---Y',        draw:'F',  length:'25', steps: '8', angle:'PI/3',         rules:['X => {F-F}{F-F}--[--X]{F-F}{F-F}--{F-F}{F-F}--','Y => .-F+X+F-.Y']},
   {name:'Snake kolam'       , axiom:'F+XF+F+XF',    draw:'F',  length:'10', steps: '5', angle:'PI/2',         rules:['X -> X{F-F-F}+XF+F+X{F-F-F}+X']},
   {name:'Kolam'             , axiom:'-D--D',        draw:'F',  length:'10', steps: '3', angle:'PI/4',         rules:['A => F++FFFF--F--FFFF++F++FFFF--F','B => F--FFFF++F++FFFF--F--FFFF++F','C => BFA--BFA','D => CFC--CFC']},
];


class PageHandler {
   constructor(selector, size = 1000) {
      this.storeId    = 'lsys';
      this.ns         = 'http://www.w3.org/2000/svg';
      this.svg        = $(selector);
      this.size       = size;
      this.lSystem    = {};
      this.pristine   = 1;
      this.lineWidth  = 2;
      this.info       = 0;
      this.maxGenSize = 1024 * 1024 * 4;

      $('#saved').on('change', (e) => this.LSystemChange(e));
      $(".txtin").on('input' , (e) => this.InputChange  (e));
      $("#steps").on('input' , (e) => this.SliderChange (e));
      $('#save' ).on('click' , (e) => this.SaveClick    (e));
      this.svg   .on('wheel' , (e) => this.MouseWheel   (e));
      $('#info' ).on('click' , (e) => this.ToggleInfo   (e));

      this.ShowSpinner(0);
      this.LoadState();
      this.GenSaveSelect();
      this.LSystemChange();
   }

   LSystemChange(e) {
      let name = $('#saved').val();
      this.LSystemToInputs(name);
      this.InputsToLSystem();
      $('polyline').remove();
      this.CreateShape();
   }

   InputChange(e) {
      if (this.pristine) {
         this.pristine = 0;
         $('#name').val("");
         $('#save').prop("disabled",false);
      }
      this.InputsToLSystem();
      if ($(e.target).attr('id') == 'name') return;
      $('polyline').remove();
      this.CreateShape();
   }

   SliderChange(e) {
      this.lSystem.steps = +$(e.target).val();
      $('#stepct').text(`(${this.lSystem.steps})`);
      $('polyline').remove();
      this.CreateShape();
   }

   SaveClick(e) {
      this.SaveState();
      this.pristine = 1;
      this.GenSaveSelect();

      $('#saved').val($('#name' ).val());
      $('#save').prop("disabled",true);
   }

   MouseWheel(e) {
      let dy = e.originalEvent.deltaY;
      if (!dy) return;

      let ctl = $('#steps')
      let val = +ctl.val();
      let min = +ctl.attr('min');
      let max = +ctl.attr('max');
      let newval = Math.min(max, Math.max(min, val + (dy < 0 ? 1 : -1)));
      ctl.val(newval);
      ctl.trigger('input');
   }

   CreateShape() {
      this.ShowSpinner(1);
      this.ShowAborted(0);
      setTimeout(() => this.CreateSVG(), 200);
   }

   CreateSVG() {
      let production = this.Generate(this.lSystem)
      //console.log(production);
      let lines = this.ToLines(this.lSystem, production);
      this.RoundLinePoints(lines);
      this.SetView(lines);
      let LineStrings = this.ToLineStrings(lines);
      this.MakePoly('polyline', LineStrings);
      this.ShowSpinner(0);
   }

   // Generate(l) & ToPoints() are 20% faster than the recursive
   // implementation I tried first
   Generate(lSystem) {
      let input = lSystem.axiom;
      let output;

      for (let i=0; i < lSystem.steps; i++) {
         output = '';
         for (let j=0; j<input.length; j++) {
            let c = input.charAt(j);
            output += c in lSystem.cRules ? lSystem.cRules[c] : c;

            if (!(j % 10) && output.length > this.maxGenSize)
               {
               this.ShowAborted(1);
               console.log("aborted: exceeded allowed size");
               return output; // abort
               }
         }
         input = output;
      }
      return output;
   }

   ToLines(lSystem, production) {
      let x = 0, y = 0, angle = 0;
      let lines = [];
      let line = [{x,y}];
      let stack = [];

      for (let i=0; i<production.length; i++) {
         let c = production.charAt(i);

         switch (c) {
            case '+': 
               angle += lSystem.cAngle;                       
               break;
            case '-': 
               angle -= lSystem.cAngle;                       
               break;
            case '|': 
               angle += Math.PI; 
               break;
            case '>': 
               angle += Math.PI/2; 
               break;
            case '<': 
               angle -= Math.PI/2; 
               break;
            case '[': 
               stack.push({x,y,angle});                       
               break;
            case ']': 
               if (stack.length) {
                  lines.push(line);
                  ({x,y,angle} = stack.pop()); 
                  line = [{x,y}];
               }
               break;
            case '.': 
               lines.push(line);
               x += lSystem.cLength * Math.cos(angle);
               y -= lSystem.cLength * Math.sin(angle);
               line = [{x, y}];
               break;
         }
         if (c in lSystem.cDraw) {
            x += lSystem.cLength * Math.cos(angle);
            y -= lSystem.cLength * Math.sin(angle);
            line.push({x, y});
         }
      }
      lines.push(line);
      return lines;
   }

   RoundLinePoints(lines) {
      for (let line of lines) {
         for (let p of line) {
            [p.x, p.y] = [this.Round(p.x), this.Round(p.y)];
         }
      }
   }

   SetView(lines) {
      let minx, miny, maxx, maxy;
      maxx = maxy = - (minx = miny = 99999);

      for (let line of lines) {
         for (let p of line) {
            [minx, maxx] = [Math.min(minx, p.x), Math.max(maxx, p.x)];
            [miny, maxy] = [Math.min(miny, p.y), Math.max(maxy, p.y)];
         }
      }
      [minx, maxx] = [this.Round(minx), this.Round(maxx)];
      [miny, maxy] = [this.Round(miny), this.Round(maxy)];
      let border = this.Round((maxx-minx) / 20);

      this.svg.get(0).setAttribute("viewBox", `${minx-border} ${miny-border} ${maxx-minx+border*2} ${maxy-miny+border*2}`);
   }

   ToLineStrings(lines) {
      let strings = [];
      for (let line of lines) {
         //if (line.length < 2) continue; ??
         let pointStr = '';
         for (let p of line) {
            pointStr += `${p.x},${p.y} `;
         }
         strings.push(pointStr);
      }
      return strings;
   }

   MakePoly(type, strings) {
      for(let pointStr of strings) {
         let attr = {
            points        : pointStr,
            fill          : 'none',
            stroke        : 'black',
            'stroke-width': `${this.lineWidth}`
         };
         this.svg.append($(document.createElementNS(this.ns, type)).attr(attr));
      }
   }

   InputsToLSystem() {
      this.lSystem.name   =  $('#name'  ).val();
      this.lSystem.axiom  =  $('#axiom' ).val();
      this.lSystem.draw   =  $('#draw'  ).val();
      this.lSystem.length =  $('#length').val();
      this.lSystem.angle  =  $('#angle' ).val();
      this.lSystem.steps  =+ $('#steps' ).val();

      this.lSystem.rules = [];
      for (let i=1; i<6; i++) {
         this.lSystem.rules.push($('#rule' + i).val());
      }

      this.lSystem.cDraw   = this.StringToMap(this.lSystem.draw);
      this.lSystem.cLength = this.CalcVal(this.lSystem.length);
      this.lSystem.cAngle  = this.CalcVal(this.lSystem.angle);
      this.lSystem.cRules  = this.RulesToMap(this.lSystem.rules);
   }

   LSystemToInputs(name) {
      let s = this.systems;
      let ref = s.find((l) => l.name == name);
      this.lSystem = {...ref};

      $('#name'  ).val(this.lSystem.name  );
      $('#axiom' ).val(this.lSystem.axiom );
      $('#draw'  ).val(this.lSystem.draw  );
      $('#length').val(this.lSystem.length);
      $('#steps' ).val(this.lSystem.steps );
      $('#angle' ).val(this.lSystem.angle );

      $('#stepct').text(`(${this.lSystem.steps})`);

      for (let i=0; i<5; i++) {
         let rule = i<this.lSystem.rules.length ? this.lSystem.rules[i] : "";
         $(`#rule${i + 1}`).val(rule);
      }
      this.pristine = 1;
      $('#save').prop("disabled",true);
   }

   StringToMap(str) {
      let map = {};
      for (let i=0; i<str.length; i++) {
         map[str.charAt(i)] = 1;
      }
      return map;
   }

   RulesToMap(rules) {
      let map = {};

      for (let rule of rules) {
         let match = rule.match(/^(.*)[=\-]>(.*)$/);
         if (match) map[match[1].trim()] = match[2].trim();
      }
      return map;
   }

   SaveState() {
      this.systems.push(this.lSystem);
      localStorage.setItem(this.storeId, JSON.stringify(this.systems));
   }

   LoadState() {
      this.systems = JSON.parse(localStorage.getItem(this.storeId));
      if (!this.systems || !this.systems.length){
         this.systems = [...INITIAL_LSYSTEMS];
      }
   }

   GenSaveSelect() {
      let sel = $('#saved');
      sel.empty();
      for (let sys of this.systems) {
         sel.append(`<option>${sys.name}</option>`);
      }
   }

   Round(val) {
      return Math.round(val * 100) / 100;
   }

   ShowSpinner(show) {
      let spinner = $(".spinner")
      show ? spinner.show() : spinner.hide();
   }

   ShowAborted(show) {
      let aborted = $(".aborted")
      show ? aborted.show() : aborted.hide();
   }

   ToggleInfo() {
      let d = $('#info-popup');
      (this.info = 1 - this.info) ? d.show() : d.hide();
   };


   // not good enough for a real product
   CalcVal(expr) {
      for (let bad of "window document console alert confirm prompt try catch replace json fetch ajax XMLHttpRequest get set $".split(" ")) {
         let regx = new RegExp(bad, "gi");
         expr = expr.replace(regx, "");
      }
      try {
         return (new Function(`with(Math){return ${expr}}`))();
      } catch(e) {
         console.log("parse/eval error");
         return 0;
      }
   }
}


$(function() {
   new PageHandler('#svg1');
});

