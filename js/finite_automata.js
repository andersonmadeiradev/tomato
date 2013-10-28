FiniteAutomata = {
  // estado atual do automato - usado quando est� no modo interativo
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
  // verifica se um estado � final
  isFinal: function(stateId) {
    return this.final_list[stateId] != undefined;
  },
  // fun��o para configurar um estado como final
  setFinal: function(stateId, isFinal) {
    // se quiser marcar o estado como final e ele existir e ele n�o estiver marcado como final, marcas
    if (isFinal == true && this.hasState(stateId) && !isFinal(stateId));
      this.final_list[stateId] = this.state_list[stateId];
    // se quiser desmarcar o estado como final.
    else if (isFinal == false && this.isFinal(stateId)) 
      delete this.final_list[stateId];
  },
  // verifica se um dado estado � inicial
  isInitial: function(stateId) {
    return this.initial == stateId;
  },
  // fun��o para configurar o estado com 'stateId' como inicial
  setInitial: function(stateId) {
    if (this.hasState(stateId)) {
      this.initial = stateId;
    }
  },
  // verifica se � o estado atual
  getCurrentState: function() {
    return this.actual;
  }
};

function State(stateId) {
  // configura a id para o estado
  this.id = stateId;
  // 'fun��o' de transi��o, as chaves s�o os simbolos, e os valores s�o os estados alvo da transi��o
  this.transition = [],
  // os pais de 'this', ou seja, os n�s que chegam nele lendo um simbolo qualquer
  this.parents = [],
  // lendo um simbolo 'symbol', vai para o estado 'state'
  setTransition: function(symbol, stateId) {
    // s� configura transi��o se o estado 'stateId' existir'.
    if (FiniteAutomata.hasState(stateId)) {
      // se o estado n�o l� o simbolo [indo pra qualquer outro estado] ent�o tem que adicionar o simbolo
      if (this.transition[symbol] == undefined) {
        console.log("Adding symbol '"+symbol+"'...");
        this.transition[symbol] = [];
      }
      // configura f(state, symbol), se j� for definido vai substituir.
      this.transition[symbol][stateId] = stateId;
      console.log('f('+this.stateId+", '"+symbol+"') for"+this.id);
      // informa que esse n� � pai de 'state'
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

