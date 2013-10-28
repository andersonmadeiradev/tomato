/*
  Visão Geral do Aplicativo
 [COMANDOS] {
   Q: ativar modo estado,  KEYCODE ==> 81
   T: ativar modo transição,  KEYCODE ==> 84
   S: ativar modo simbolo   KEYCODE ==> 83
 }
 [OPERAÇÕES] {
   I: inserir, KEYCODE ==> 73
   M: modificar, KEYCODE ==> 77
   D: deletar.  KEYCODE ==> 68
 }
*/

var jq = $.noConflict();

// == BEGIN == APP CLASS ==

App = {
  canvas: null,
  ctx: null,
  // o índice do circulo na lista de circulos que tá ativo para drag.
  drag_target: null,
  // true=> drag está ativo, estou movendo um circulo, caso contrário vai ser false
  moving_state: null,
  // o estado que foi selecionado para adicionar uma transição
  trans_state_selected: -1,
  // contém o rect do client do browser.
  clientRect: null,
  /* Modo de edição do aplicativo: [possíveis valores para App.mode]
   0: edição de estado
   1: edição de arestas/simbolos/transições
  */
  mode: 0
};

// == END == APP CLASS ==

Automato = {
  // lista dos objetos circulos
  node_list: null,
};

jq(document).ready(function () {
  App.canvas = document.getElementById('drawing_area');
  App.ctx = App.canvas.getContext('2d');
  Automato.node_list = [];
  App.clientRect = App.canvas.getBoundingClientRect();
  
  jq(document).keyup(function(e) {
    // troca os estados
    // se apertou a tecla 'q'
    if (e.which == 81) {
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
    console.log(e.which);
  });
  
  jq('#drawing_area').mousedown(function (e) {
    var mouseX = (e.pageX - App.clientRect.left);
    var mouseY = (e.pageY - App.clientRect.top);
    
    // se for o botão esquerdo do mouse
    if (e.which == 1) {
      // checar se foi em cima de algum circulo
      k = Automato.node_list.length - 1;
      while (k >= 0) {
        if (Automato.node_list[k].collidePoint(mouseX, mouseY))
          break;
        k--;
      }
    	// se estiver no modo de manipulação de estados
    	if (App.mode == 0) {
        // inicia o drag
        App.moving_state = true;
        // se o k maior ou igual a zero significa que o loop encontrou algum então inicia drag no circulo então o ativo para drag vai ser esse
        if (k >= 0) {
          App.drag_target = k;
        }
        // se nÃ£o for, sÃ³ insere um novo circulo e inicia drag com ele.
        else {
          // essa linha é um pequeno hack porque o construtor de Node usa App.drag_target para configurar o id do circulo
          // essa linha vai em vez de colocar length - 1 depois da operação push
          App.drag_target = Automato.node_list.length;
          Automato.node_list.push(new Node(mouseX, mouseY, 30, 2));  
        }
        // desenha os circulos    
        drawApp();
      // se não, se estiver no modo de transição
      } else if (App.mode == 1) {
        if (k >= 0) {
          App.trans_state_selected = k;
          console.log('q'+k+' was selected as transition source.');
        }
      }
    }
    
    //@verbose
    //console.log('Mouse DOWN at: '+mouseX+','+mouseY);
  });
  
  jq('#drawing_area').mouseup(function (e) {
    var rect = App.canvas.getBoundingClientRect();
    var mouseX = (e.pageX - App.clientRect.left);
    var mouseY = (e.pageY - App.clientRect.top);
    
    if (App.mode == 0) {
      // termina o drag      App.moving_state = false;  
      // mouse release
      console.log(App.drag_target+1+'th Node at: '+(e.clientX-rect.left)+','+(e.clientY-rect.top));
    }    
    // se está no modo edição de transições e se uma origem para a transição foi selecionada.
    if (App.mode == 1) {
      // 
      if (App.trans_state_selected != -1) {
        // checar se foi em cima de algum circulo
        k = Automato.node_list.length - 1;
        while (k >= 0) {
          if (Automato.node_list[k].collidePoint(mouseX, mouseY))
            break;
          k--;
        }
        
        // se um alvo foi selecionado e não é diferente da origem então insere a transição.
        if (k >= 0) {
          if (k != App.trans_state_selected) {
            // se ele enviar um simbolo, então adicina.
            symbol = prompt('Simbolo: ');
            if (symbol) Automato.node_list[App.trans_state_selected].addTransition(symbol, k);
          } else {
            console.log('No self loop enabled yet...');  
          }
          App.trans_state_selected
        }
      }
    }  
  });
  
  // se der click duplo encerra o drag pra não dar bug e confundir com o evento mousedown
  jq('#drawing_area').dblclick(function (e) {
    var mouseX = (e.pageX - App.clientRect.left);
    var mouseY = (e.pageY - App.clientRect.top);
        
    // termina o drag
    App.moving_state = false;    
  });
  
  jq('#drawing_area').mousemove(function (e) {
    var mouseX = (e.pageX - App.clientRect.left);
    var mouseY = (e.pageY - App.clientRect.top);
    
    // se estiver no drag, altera o centro do circulo para Mouse(x,y) e desenha denovo
    if (App.moving_state) {
      Automato.node_list[App.drag_target].x = mouseX;
      Automato.node_list[App.drag_target].y = mouseY;
      drawApp();
    }
    
  });
  
});

function drawApp() {
  App.ctx.save();
  // clear the screen
  App.ctx.fillStyle = 'white';
  App.ctx.fillRect(0, 0, App.canvas.width, App.canvas.height);
  // draw the Automato.node_list
  k = Automato.node_list.length - 1;
  while (k >= 0) {
    Automato.node_list[k].draw(App.ctx);
    k--;
  }
  App.ctx.restore(); 
}

var Node = Class.create({
  initialize: function(x, y, radius, lineWidth) {
  	 this.x = x;
    this.y = y;
    this.id = App.drag_target;
    this.label = 'q'+App.drag_target;
    this.radius = radius > 0 ? radius : 5;
    this.fillStyle = '#8888ff';
    this.strokeStyle = '#3355dd';
    this.textColor = 'black';
    this.lineWidth = lineWidth;
    // estados para os quais ele pode ir lendo o simbolo da transição como chave.
    // o valor para cada simbolo chave vai ser uma lista com os estados para os quais ele pode ir lendo aquele simbolo.
    this.transition = []
  },
  //@TODO: not finished...
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
  Automato.node_list = []
  // 1 to 10 random length of Automato.node_list
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
   } while(c.collide(Automato.node_list));
   Automato.node_list.push(c);
  }
  for(var i = 0; i < r; i++ ) {
    Automato.node_list[i].draw(ctx);
  }
}
