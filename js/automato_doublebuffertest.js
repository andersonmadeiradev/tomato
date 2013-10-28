/*
  Visão Geral do Aplicativo
 [COMANDOS] {
   e: ativar modo estado,  KEYCODE ==> 69
   t: ativar modo transição,  KEYCODE ==> 84
   s: ativar modo simbolo   KEYCODE ==> 83
 }
 [OPERAÇÕES] {
   i: inserir, KEYCODE ==> 73
   m: modificar, KEYCODE ==> 77
   d: deletar.  KEYCODE ==> 68
 }
*/

var jq = $.noConflict();

// == BEGIN == APP CLASS ==

App = {
  canvas: null,
  tmp_canvas: null,
  ctx: null,
  tmp_ctx: null,
  /* o índice do circulo na lista de circulos que tá ativo para drag.
  // se for -1  o drag não está ativo*/
  drag_target: -1,
  // o estado que foi selecionado para adicionar uma transição
  trans_state_selected: -1,
  // posição do mouse
  mouse: {x: -1, y: -1},
  // contem a pos do mouse que foi clicado no estado origem da transição
  trans_source_mousepos: {x: -1, y: -1},
  /* contém o rect do client do browser.*/
  clientRect: null,
  /* Modo de edição do aplicativo: [possíveis valores para App.mode]
   0: edição de estado
   1: edição de arestas/simbolos/transições
  */
  mode: 0,
  // constantes dos circulos;
  RADIUS: 40, LINEWIDTH: 2
};

// == END == APP CLASS ==

Graph = {
  // lista dos objetos circulos
  node_list: [],
};

jq(document).ready(function () {
  App.canvas = document.getElementById('drawing_area');
  App.ctx = App.canvas.getContext('2d');

  App.tmp_canvas = document.createElement('canvas');
  App.tmp_canvas.width = App.canvas.width;
  App.tmp_canvas.height = App.canvas.height;
  
  App.tmp_ctx = App.tmp_canvas.getContext('2d');
  
  App.clientRect = App.canvas.getBoundingClientRect();

  jq(document).keyup(function(e) {
    // troca os estados
    // se apertou a tecla 'e'
    if (e.which == 69) {
      console.log('Changing to state mode...');
      App.mode = 0;
    } // se apertou a tecla 't'
    else if (e.which == 84) {
      console.log('Changing to transition mode...');
      App.mode = 1;
    } // apertou 's'
    else if (e.which == 83) {
      console.log('Changing to symbol mode...');
      App.mode = 2;
    }
    console.log('Tecla precionada: '+e.which);
  });
  
  jq('#drawing_area').mousedown(function (e) {
    App.clientRect = App.canvas.getBoundingClientRect();
    App.mouse.x = (e.clientX - App.clientRect.left) | 0;
    App.mouse.y = (e.clientY - App.clientRect.top) | 0;
    
    // se for o botão esquerdo do mouse
    if (e.which == 1) {
      // checar se foi em cima de algum circulo
      k = Graph.node_list.length - 1;
      while (k >= 0) {
        if (Graph.node_list[k].collidePoint(App.mouse.x, App.mouse.y))
          break;
        k--;
      }
    	// se estiver no modo de manipulação de estados
    	if (App.mode == 0) {
    	  /* tem que desenhar tudo no tmp canvas pra que ele possa ser usado pela função drawApp()
        // desenha todos exceto o que é o drag agora, se o loop acima pegou algum*/
        App.tmp_ctx.fillStyle = 'white';
        App.tmp_ctx.fillRect(0, 0, App.tmp_canvas.width, App.tmp_canvas.height);
        for (var j = Graph.node_list.length - 1; j >= 0; j--) {
          if (j == k)
            continue;
          Graph.node_list[j].draw(App.tmp_ctx);
        }
        /* se o k maior ou igual a zero significa que o loop encontrou algum então
        // inicia drag no circulo que o loop pegou*/
        if (k >= 0)
          App.drag_target = k;
        /* se não for, só insere um novo circulo se a posição do mouse for válida,
        // ou seja, se o novo circulo naquela posição não colidir com outro.*/
        else {
          /* essa linha é um pequeno hack porque o construtor de Node usa
            // App.drag_target para configurar o id do circulo
            // essa linha vai em vez de colocar length - 1 depois da operação push
          //new_node = new Node(App.mouse.x, App.mouse.y, App.RADIUS, App.LINEWIDTH);
          //if(!(new_node.collide(Graph.node_list))) {*/
            App.drag_target = Graph.node_list.length;
            Graph.node_list.push(new Node(App.mouse.x, App.mouse.y, App.RADIUS+App.drag_target, App.LINEWIDTH));
            console.log('New circle at:'+App.mouse.x+','+App.mouse.y);
        }
        App.canvas.style.cursor = 'move';
        console.log('Target for drag is:'+App.drag_target);
        // double buffer drawing
        App.tmp_ctx.drawImage(App.tmp_canvas, 0, 0);
        // desenha os circulos    
        drawApp();
      // se não, se estiver no modo de transição
      } else if (App.mode == 1) {
        if (k >= 0) {
          App.trans_state_selected = k;
          console.log('q'+k+' was selected as transition source.');
          // calcula o angulo do click do mouse em graus, transforma de graus pra radianos também
          //angle = Math.atan2(mouseY - Graph.node_list[k].y, mouseX - Graph.node_list[k].x) * 180 / Math.PI + 180;
          angle = Math.atan2(App.mouse.y - Graph.node_list[k].y, App.mouse.x - Graph.node_list[k].x);
          // guarda a posição x e y calculada
          App.trans_source_mousepos.x = Math.cos(angle) * Graph.node_list[k].radius + Graph.node_list[k].x;
          App.trans_source_mousepos.y = Math.sin(angle) * Graph.node_list[k].radius + Graph.node_list[k].y;
          console.log('App.trans_source_mousepos of q'+k+' = '+App.trans_source_mousepos.x+','+App.trans_source_mousepos.y);
          console.log('The angle of the click is: '+ (angle * 180 / Math.PI + 180));
          
        }
      }
    }
    
  });

  jq('#drawing_area').mouseup(function (e) {
    App.clientRect = App.canvas.getBoundingClientRect();
    App.mouse.x = (e.clientX - App.clientRect.left) | 0;
    App.mouse.y = (e.clientY - App.clientRect.top) | 0;

    // se foi o esquerdo
    if (e.which == 1) {
      if (App.mode == 0) {
        console.log(App.drag_target+1+'th Node at: '+App.mouse.x+','+App.mouse.y);
        // desenha circle no buffer tmp
        Graph.node_list[App.drag_target].draw(App.tmp_ctx);
        // termina o drag
        App.drag_target = -1;
        App.canvas.style.cursor = 'default';
      }
      // se está no modo edição de transições e se uma origem para a transição foi selecionada.
      else if (App.mode == 1) {
        // == BEGIN == TRANSITION EDIT!!!
        if (App.trans_state_selected != -1) {
          // checar se foi em cima de algum circulo
          k = Graph.node_list.length - 1;
          while (k >= 0) {
            if (Graph.node_list[k].collidePoint(App.mouse.x, App.mouse.y))
              break;
            k--;
          }

          // se um alvo foi selecionado e não é diferente da origem então insere a transição.
          if (k >= 0) {
            if (k != App.trans_state_selected) {
              // se ele enviar um simbolo, então adicina.
              symbol = prompt('Simbolo: ');
              if (symbol)
                Graph.node_list[App.trans_state_selected].addTransition(symbol, k);
              // calcula o angulo dessa pos
              angle = Math.atan2(App.mouse.y - Graph.node_list[k].y, App.mouse.x - Graph.node_list[k].x);
              // calcula o x,y no node destino
              dest_x = Math.cos(angle) * Graph.node_list[k].radius + Graph.node_list[k].x;
              dest_y = Math.sin(angle) * Graph.node_list[k].radius + Graph.node_list[k].y;
              console.log('mousepos destination of q'+k+' = '+dest_x+','+dest_y);
              // desenha a linha entre os dois nodes
              App.ctx.save();
              App.ctx.lineWidth = 2;
              App.ctx.strokeStyle = 'red';
              App.ctx.moveTo(App.trans_source_mousepos.x, App.trans_source_mousepos.y);
              App.ctx.lineTo(dest_x, dest_y);
              App.ctx.stroke();
              App.ctx.restore();
            } else {
              console.log('No self loop enabled yet...');
            }
            App.trans_state_selected = -1;
            App.trans_source_mousepos.x = App.trans_source_mousepos.y = -1;
          }
        }
        
      }
    }  
  });
  
  // se der click duplo encerra o drag pra não dar bug e confundir com o evento mousedown
  jq('#drawing_area').dblclick(function (e) {
    App.clientRect = App.canvas.getBoundingClientRect();
    App.mouse.x = (e.clientX - App.clientRect.left) | 0;
    App.mouse.y = (e.clientY - App.clientRect.top) | 0;

    // termina o drag
    App.drag_target = -1;    
  });
  
  jq('#drawing_area').mousemove(function (e) {
    App.clientRect = App.canvas.getBoundingClientRect();
    App.mouse.x = (e.clientX - App.clientRect.left) | 0;
    App.mouse.y = (e.clientY - App.clientRect.top) | 0;
    
    // se estiver no drag e a nova posição for válida,
    // altera o centro do circulo para Mouse(x,y) e desenha denovo
    if (App.drag_target >= 0) {
    /*  old_x = Graph.node_list[App.drag_target].x;
      old_y = Graph.node_list[App.drag_target].y;

      Graph.node_list[App.drag_target].x = App.mouse.x;
      Graph.node_list[App.drag_target].y = App.mouse.y;

      for (var k = Graph.node_list.length-1 ; k >= 0 ; k--) {
        console.log('Checking if '+k+' collides '+App.drag_target);
        if (k == App.drag_target) continue;
        if (Graph.node_list[App.drag_target].collide(Graph.node_list[k])) {
          Graph.node_list[App.drag_target].x = old_x;
          Graph.node_list[App.drag_target].y = old_y;
          return;
        }
      }*/
      Graph.node_list[App.drag_target].x = App.mouse.x;
      Graph.node_list[App.drag_target].y = App.mouse.y;
      drawApp();
    }
    
  });
  
});

function drawApp() {
  App.ctx.drawImage(App.tmp_canvas, 0, 0);
  // draw the Graph.node_list
  if (App.drag_target >= 0)
    Graph.node_list[App.drag_target].draw(App.ctx);
}
/*
function drawApp() {
  App.ctx.save();
  // clear the screen
  App.ctx.fillStyle = 'white';
  App.ctx.fillRect(0, 0, App.canvas.width, App.canvas.height);
  // draw the Graph.node_list
  k = Graph.node_list.length - 1;
  while (k >= 0) {
    Graph.node_list[k].draw(App.ctx);
    k--;
  }
  App.ctx.restore();
}*/

var Node = Class.create({
  initialize: function(x, y, radius, lineWidth) {
  	this.x = x;
    this.y = y;
    this.id = Graph.node_list.length;
    this.label = 'q'+this.id;
    this.radius = radius > 0 ? radius : 5;
    this.fillStyle = '#8888ff';
    this.strokeStyle = '#3355dd';
    this.textColor = 'black';
    this.lineWidth = lineWidth;
    // estados para os quais ele pode ir lendo o simbolo da transição como chave.
    // o valor para cada simbolo chave vai ser uma lista com os estados para os quais ele pode ir lendo aquele simbolo.
    this.transition = []
  },
  addTransition: function(symbol, stateNumber) {
    // se o estado não lê o simbolo [indo pra qualquer outro estado] então tem que adicionar o simbolo
    if (this.transition[symbol] == undefined) {
      console.log('No symbol '+symbol+' from '+this.label);
      console.log('Adding symbol...');
      this.transition[symbol] = [];
    } else { console.log('trans('+this.label+','+symbol+') already defined...'); }
    // se esse estado já não está conectado com o stateNumber, então conecta.
    if (this.transition[symbol][stateNumber] == undefined) {
      this.transition[symbol][stateNumber] = stateNumber;
      console.log('trans('+this.label+','+symbol+') defined!');
    }
  },
  collidePoint: function(pX, pY) {
    return ((this.x - pX)*(this.x - pX) + (this.y - pY)*(this.y - pY) <= this.radius*this.radius)
  },
  collide: function(targets) {
    if (jq.isArray(targets)) {
      k = targets.length - 1;
      while (k >= 0) {
        if ((this.x - targets[k].x)*(this.x - targets[k].x) + (this.y - targets[k].y)*(this.y - targets[k].y) < (this.radius+targets[k].radius)*(this.radius+targets[k].radius)) {
          //@verbose
          //console.log('Collided Node: ' + targets[k]);
          return true;
        }
        k--;
      }
    }
    else {
      if ((this.x - targets.x)*(this.x - targets.x) + (this.y - targets.y)*(this.y - targets.y) < (this.radius+targets.radius)*(this.radius+targets.radius)) {
        //@verbose
        //console.log('Collided Node: ' + targets);
        return true;
      }
    }
    return false;
  },
  getGraphicalWidth: function() {
    return this.radius*2 + 2*this.lineWidth;
  },
  getGraphicalRadius: function() {
    return this.radius + this.lineWidth;
  },
  draw: function(ctx) {
    // VERBOSE
    //console.log('Drawing Node ' + this.radius + ' at: ' + this.x +','+this.y);
    ctx.save();
    ctx.fillStyle = this.fillStyle;
    //@verbose
    //console.log('Painting with ' +this.fillStyle);
    ctx.strokeStyle = this.strokeStyle;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = this.lineWidth;
    ctx.stroke();
    ctx.fillStyle = this.textColor;
    // o tamanho e o posicionamento do texto do nome do estado é em função do raio para que seja proporcional e bem no centro
    ctx.font = (this.radius*0.6)+"px Droid Sans";
    ctx.textBaseLine = 'bottom';
    ctx.fillText(this.label, this.x-(this.radius*0.3), this.y+(this.radius*0.17));
    ctx.restore();
  }
});

// receives the 2d Graphic Context as argument
function testNode(ctx) {
  Graph.node_list = []
  // 1 to 10 random length of Graph.node_list
  r = Math.random() * 50;
  var c;
  for(var i = 0; i < r; i++ ) {
    c = new Node(0, 0, 10);
    do {
      w = c.getGraphicalRadius();
      x = parseInt(Math.random() * (App.canvas.width - 2*w)) + w;
      y = parseInt(Math.random() * (App.canvas.height - 2*w)) + w;
      c.x = x;
      c.y = y;
      console.log(c);
   } while(c.collide(Graph.node_list));
   Graph.node_list.push(c);
  }
  for(var i = 0; i < r; i++ ) {
    Graph.node_list[i].draw(ctx);
  }
}
