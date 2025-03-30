# 📌 DePoll - Sistema de Enquetes

## 📂 Estrutura do Projeto
```
WEB3_SMART_CONTRACTS_STUDY/
contracts/
├── docs/
│   ├── 5_Enquetes.sol       # Contrato inteligente para criação e votação de enquetes
public/
│   ├── index.html        # Interface principal do sistema de enquetes
│   ├── styles.css        # Estilos do frontend
│   ├── app.js            # Lógica da aplicação
```

---

## 📜 Sobre o Contrato `Enquete.sol`
O contrato `Enquete.sol` permite a criação, votação e encerramento de enquetes na rede BNB Smart Chain Testnet.

### 🏗 Estruturas de Dados
- **OpcaoVoto**: Representa uma opção de voto dentro de uma enquete.
  ```solidity
  struct OpcaoVoto {
      string descricao;
      uint256 quantidade;
  }
  ```
- **EnqueteInfo**: Armazena os dados de cada enquete criada.
  ```solidity
  struct EnqueteInfo {
      string titulo;
      address criador;
      bool ativa;
      OpcaoVoto[] opcoes;
      mapping (address => bool) jaVotou;
  }
  ```
- **Eventos**: Para rastrear ações no contrato.
  ```solidity
  event enqueteCriada(uint256 idEnquete, string titulo, address criador);
  event votoRegistrado(uint256 idEnquete, uint256 indiceOpcao, address votante);
  event enqueteEncerrada(uint256 idEnquete, address criador);
  ```

### 🛠 Funções do Contrato

#### 📌 Criar Enquete
Cria uma nova enquete.
```solidity
function criarEnquete(string memory _titulo, string[] memory _opcoes) external
```
✅ Requer pelo menos **2 opções** e no máximo **10**.

#### ✅ Votar
Registra um voto para uma das opções disponíveis.
```solidity
function votar(uint256 _idEnquete, uint256 _indiceOpcao) external
```
✅ Um usuário **só pode votar uma vez** por enquete.
✅ Apenas opções válidas podem ser votadas.

#### 🔒 Encerrar Enquete
Encerra uma enquete ativa.
```solidity
function encerrarEnquete(uint256 _idEnquete) external
```
✅ **Somente o criador da enquete** pode encerrá-la.

#### 📊 Obter Detalhes da Enquete
Retorna informações sobre uma enquete específica. (usando index da enquete)
```solidity
function obterEnquete(uint256 _idEnquete) external view returns (...)
```
✅ Retorna o título, status, opções e quantidade de votos.

---

## 🛠 Testando o Contrato
### 🏗 Criar Enquete
```solidity
_titulo = "Qual Pão Prefere?"
_opcoes = ["Pão de sal", "Pão de forma"]
```

### 🗳️ Votar
```solidity
_idEnquete = 1  // ID da enquete
_indiceOpcao = 0  // Votar na opção "Pão de sal"
```

### 🔒 Encerrar Enquete
```solidity
_idEnquete = 1  // Somente o criador pode encerrar
```

### 📊 Obter Enquete
```solidity
_idEnquete = 1  // ID da enquete para visualizar detalhes
```

---

## 🚀 Melhorias Futuras
- ✅ **Lista de permissões** para criação de enquetes.
- ✅ **Sistema de tokens** para permitir votos com tokens criados na BNB Smart Chain Testnet.

