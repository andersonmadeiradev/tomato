FiniteAutomata = {
  // estado atual do automato - usado quando está no modo interativo
  actual: null;
  // estado inicial do automato
  initial: null,
  // lista de estados finais
  final_list: [], 
  // lista de estados do automato
  state_list: [],
  // cria um estado no automato
  createState: function(stateId) {
    if (this.state_list[stateId] == undefined) {
      this.state_list[stateId] = new State(stateId);
    }
  }
  // verifica se o estado com id 'stateId' existe no automato
  hasState: function(stateId) {
    return this.state_list[stateId] != undefined;  
  },
  // verifica se um estado é final
  isFinal: function(stateId) {
    return this.final_list[stateId] != undefined;
  },
  // função para configurar um estado como final
  setFinal: function(stateId, isFinal) {
    // se quiser marcar o estado como final e ele existir e ele não estiver marcado como final, marcas
    if (isFinal == true && this.hasState(stateId) && !isFinal(stateId));
      this.final_list[stateId] = this.state_list[stateId];
    // se quiser desmarcar o estado como final.
    else if (isFinal == false && this.isFinal(stateId)) 
      delete this.final_list[stateId];
  },
  // verifica se um dado estado é inicial
  isInitial: function(stateId) {
    return this.initial == stateId;
  },
  // função para configurar o estado com 'stateId' como inicial
  setInitial: function(stateId) {
    if (this.hasState(stateId)) {
      this.initial = stateId;
    }
  },
  // verifica se é o estado atual
  getCurrentState: function() {
    return this.actual;
  }
};

function State(stateId) {
  // configura a id para o estado
  this.id = stateId;
  // 'função' de transição, as chaves são os simbolos, e os valores são os estados alvo da transição
  this.transition = [],
  // os pais de 'this', ou seja, os nós que chegam nele lendo um simbolo qualquer
  this.parents = [],
  // lendo um simbolo 'symbol', vai para o estado 'state'
  setTransition: function(symbol, stateId) {
    // só configura transição se o estado 'stateId' existir'.
    if (FiniteAutomata.hasState(stateId)) {
      // se o estado não lê o simbolo [indo pra qualquer outro estado] então tem que adicionar o simbolo
      if (this.transition[symbol] == undefined) {
        console.log("Adding symbol '"+symbol+"'...");
        this.transition[symbol] = [];
      }
      // configura f(state, symbol), se já for definido vai substituir.
      this.transition[symbol][stateId] = stateId;
      console.log('f('+this.stateId+", '"+symbol+"') for"+this.id);
      // informa que esse nó é pai de 'state'
      FiniteAutomata.getStateNode()
    }
  }
  // retorna a lista dos estados que pode ir ao ler o 'symbol'
  getTransition: function(symbol) {
    return this.transition[symbol];
  },
  addParent: function(symbol) {
    this.parents[]  
  }
}

